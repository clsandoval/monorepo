import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: { key_type?: unknown; api_key?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const { key_type, api_key } = body;

  // 3. Validate key_type
  if (key_type !== 'anthropic' && key_type !== 'openai') {
    return NextResponse.json({ error: 'Invalid key_type. Must be "anthropic" or "openai".' }, { status: 400 });
  }

  // 4. Server-side format validation
  if (typeof api_key !== 'string' || api_key.trim() !== api_key) {
    return NextResponse.json({ error: 'API key must not contain whitespace.' }, { status: 400 });
  }
  if (key_type === 'anthropic') {
    if (!api_key.startsWith('sk-ant-') || api_key.length < 20) {
      return NextResponse.json(
        { error: 'Invalid Anthropic API key format. Must start with sk-ant- and be at least 20 characters.' },
        { status: 400 }
      );
    }
  } else {
    if (!api_key.startsWith('sk-') || api_key.length < 20) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format. Must start with sk- and be at least 20 characters.' },
        { status: 400 }
      );
    }
  }

  // 5. Verify owner/admin role and get tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden: owner or admin role required.' }, { status: 403 });
  }
  const { tenant_id } = membership;

  // 6. Live provider validation
  try {
    if (key_type === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': api_key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (res.status === 401) {
        return NextResponse.json({ error: 'Anthropic API key is invalid.' }, { status: 422 });
      }
    } else {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${api_key}` },
      });
      if (res.status === 401) {
        return NextResponse.json({ error: 'OpenAI API key is invalid.' }, { status: 422 });
      }
    }
  } catch {
    return NextResponse.json({ error: 'Failed to validate API key with provider.' }, { status: 500 });
  }

  // 7. Compute key_hint per spec:
  //    Anthropic: first 8 chars + '...' + last 4 chars
  //    OpenAI:    first 7 chars + '...' + last 4 chars
  const key_hint =
    key_type === 'anthropic'
      ? `${api_key.slice(0, 8)}...${api_key.slice(-4)}`
      : `${api_key.slice(0, 7)}...${api_key.slice(-4)}`;

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  const secretName = `tenant_api_keys:${tenant_id}:${key_type}`;
  const validatedAt = new Date().toISOString();

  try {
    // 8. Check for existing key of same type (for vault cleanup after upsert)
    const { data: existing } = await supabaseAdmin
      .from('tenant_api_keys')
      .select('id, vault_secret_id')
      .eq('tenant_id', tenant_id)
      .eq('key_type', key_type)
      .maybeSingle();

    // 9. Create new vault secret (Supabase Vault: vault.create_secret)
    const { data: newVaultId, error: vaultError } = await adminAny
      .schema('vault')
      .rpc('create_secret', {
        secret: api_key,
        name: secretName,
        description: `API key for tenant ${tenant_id} (${key_type})`,
      });

    if (vaultError || !newVaultId) {
      console.error('[api-keys] Vault create_secret error:', vaultError);
      return NextResponse.json({ error: 'Failed to store API key securely.' }, { status: 500 });
    }

    // 10. Upsert into tenant_api_keys (INSERT or UPDATE if key_type already exists)
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('tenant_api_keys')
      .upsert(
        {
          ...(existing?.id ? { id: existing.id } : {}),
          tenant_id,
          key_type,
          vault_secret_id: newVaultId as string,
          key_hint,
          status: 'active',
          validated_at: validatedAt,
        },
        { onConflict: 'tenant_id,key_type' }
      )
      .select('id')
      .single();

    if (upsertError || !upserted) {
      console.error('[api-keys] Upsert error:', upsertError);
      // Rollback: delete newly created vault secret to avoid orphans
      await adminAny.schema('vault').rpc('delete_secret', { secret_id: newVaultId });
      return NextResponse.json({ error: 'Failed to save API key record.' }, { status: 500 });
    }

    // 11. Delete old vault secret if we replaced an existing key
    if (existing?.vault_secret_id && existing.vault_secret_id !== newVaultId) {
      await adminAny.schema('vault').rpc('delete_secret', { secret_id: existing.vault_secret_id });
    }

    return NextResponse.json({
      success: true,
      id: upserted.id,
      key_type,
      key_hint,
      status: 'active',
      validated_at: validatedAt,
    });
  } catch (err) {
    console.error('[api-keys] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

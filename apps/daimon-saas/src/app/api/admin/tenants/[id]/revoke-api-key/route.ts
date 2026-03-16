import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tenantId } = await params;

  // Admin auth check — return 404 to obscure admin panel existence
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const supabaseAdminAuth = createSupabaseAdminClient();
  const { data: profile } = await supabaseAdminAuth
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let body: { keyId?: unknown; reason?: unknown } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // body remains empty
  }

  if (!body.keyId || typeof body.keyId !== 'string') {
    return NextResponse.json({ error: 'keyId is required.', field: 'keyId' }, { status: 400 });
  }
  const keyId = body.keyId;
  const reason = typeof body.reason === 'string' ? body.reason.trim() : null;

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  // Look up key scoped to tenant
  const { data: apiKey } = await supabaseAdmin
    .from('tenant_api_keys')
    .select('id, vault_secret_id, key_type')
    .eq('id', keyId)
    .eq('tenant_id', tenantId)
    .single();

  if (!apiKey) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  // Delete Vault secret
  const { error: vaultError } = await adminAny
    .schema('vault')
    .rpc('delete_secret', { secret_id: apiKey.vault_secret_id });

  if (vaultError) {
    console.error('[admin/revoke-api-key] Vault delete_secret error:', vaultError);
    return NextResponse.json({ error: 'Failed to revoke API key.' }, { status: 500 });
  }

  // Update key status to revoked
  const { error: updateError } = await supabaseAdmin
    .from('tenant_api_keys')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('tenant_id', tenantId);

  if (updateError) {
    console.error('[admin/revoke-api-key] Update error:', updateError);
    return NextResponse.json({ error: 'Failed to revoke API key.' }, { status: 500 });
  }

  // Write audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action: 'api_key_revoked_by_admin',
    tenant_id: tenantId,
    metadata: { key_type: apiKey.key_type, reason: reason ?? null },
  });

  return NextResponse.json({ success: true });
}

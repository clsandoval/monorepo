import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BOT_TOKEN_REGEX = /^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{4,8}\.[A-Za-z0-9_-]{27}$/;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: { bot_token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // 3. Validate bot_token
  if (!body.bot_token) {
    return NextResponse.json({ error: 'bot_token is required.', field: 'bot_token' }, { status: 400 });
  }

  // Strip "Bot " prefix if present
  let bot_token = String(body.bot_token);
  if (bot_token.startsWith('Bot ')) {
    bot_token = bot_token.slice(4);
  }

  if (!BOT_TOKEN_REGEX.test(bot_token)) {
    return NextResponse.json({ error: 'Invalid Discord bot token format.', field: 'bot_token' }, { status: 400 });
  }

  // 4. Verify owner/admin role and get tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
  }
  const { tenant_id } = membership;

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  // 5. Look up connection by id AND tenant_id
  const { data: existing } = await supabaseAdmin
    .from('discord_connections')
    .select('id, vault_secret_id, guild_id')
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
  }

  try {
    // 6. Create new Vault secret (pattern: create new → update ref → delete old)
    const secretName = `discord_token_${tenant_id}_${existing.guild_id}`;
    const { data: newVaultId, error: vaultError } = await adminAny
      .schema('vault')
      .rpc('create_secret', {
        secret: bot_token,
        name: secretName,
        description: `Discord bot token for tenant ${tenant_id}, guild ${existing.guild_id}`,
      });

    if (vaultError || !newVaultId) {
      console.error('[discord-connections/patch] Vault create_secret error:', vaultError);
      return NextResponse.json({ error: 'Failed to update bot token. Please try again.' }, { status: 500 });
    }

    // 7. Update discord_connections row: new vault_secret_id + status = 'connecting'
    const { error: updateError } = await supabaseAdmin
      .from('discord_connections')
      .update({
        vault_secret_id: newVaultId as string,
        status: 'connecting',
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenant_id);

    if (updateError) {
      console.error('[discord-connections/patch] Update error:', updateError);
      // Rollback new vault secret
      await adminAny.schema('vault').rpc('delete_secret', { secret_id: newVaultId });
      return NextResponse.json({ error: 'Failed to update bot token. Please try again.' }, { status: 500 });
    }

    // 8. Delete old Vault secret
    await adminAny.schema('vault').rpc('delete_secret', { secret_id: existing.vault_secret_id });

    return NextResponse.json({ id, status: 'connecting' });
  } catch (err) {
    console.error('[discord-connections/patch] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to update bot token. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify owner/admin role and get tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
  }
  const { tenant_id } = membership;

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  // 3. Look up connection by id AND tenant_id
  const { data: connection } = await supabaseAdmin
    .from('discord_connections')
    .select('id, vault_secret_id')
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
  }

  try {
    // 4. Delete Vault secret
    const { error: vaultError } = await adminAny
      .schema('vault')
      .rpc('delete_secret', { secret_id: connection.vault_secret_id });

    if (vaultError) {
      console.error('[discord-connections/delete] Vault delete_secret error:', vaultError);
      return NextResponse.json({ error: 'Failed to remove connection. Please try again.' }, { status: 500 });
    }

    // 5. Delete discord_connections row (Realtime DELETE event fires → bot disconnects)
    const { error: deleteError } = await supabaseAdmin
      .from('discord_connections')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant_id);

    if (deleteError) {
      console.error('[discord-connections/delete] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to remove connection. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[discord-connections/delete] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to remove connection. Please try again.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BOT_TOKEN_REGEX = /^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{4,8}\.[A-Za-z0-9_-]{27}$/;
const GUILD_ID_REGEX = /^\d{17,20}$/;

const PLAN_CONNECTION_LIMITS: Record<string, number> = {
  free: 1,
  starter: 3,
  pro: Infinity,
};

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: { bot_token?: unknown; guild_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // 3. Validate required fields
  if (!body.bot_token) {
    return NextResponse.json({ error: 'bot_token is required.', field: 'bot_token' }, { status: 400 });
  }
  if (!body.guild_id) {
    return NextResponse.json({ error: 'guild_id is required.', field: 'guild_id' }, { status: 400 });
  }

  // 4. Strip "Bot " prefix if present
  let bot_token = String(body.bot_token);
  if (bot_token.startsWith('Bot ')) {
    bot_token = bot_token.slice(4);
  }
  const guild_id = String(body.guild_id);

  // 5. Format validation
  if (!BOT_TOKEN_REGEX.test(bot_token)) {
    return NextResponse.json({ error: 'Invalid Discord bot token format.', field: 'bot_token' }, { status: 400 });
  }
  if (!GUILD_ID_REGEX.test(guild_id)) {
    return NextResponse.json(
      { error: 'Invalid guild ID. Must be a 17–20 digit snowflake.', field: 'guild_id' },
      { status: 400 }
    );
  }

  // 6. Verify owner/admin role and get tenant_id
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

  // 7. Check plan limit
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('plan')
    .eq('id', tenant_id)
    .single();

  const plan = (tenant?.plan as string) ?? 'free';
  const maxConnections = PLAN_CONNECTION_LIMITS[plan] ?? 1;

  const { count } = await supabaseAdmin
    .from('discord_connections')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant_id)
    .neq('status', 'disconnected');

  if ((count ?? 0) >= maxConnections) {
    return NextResponse.json(
      { error: 'Plan limit reached. Upgrade to add more connections.' },
      { status: 403 }
    );
  }

  // 8. Check for duplicate guild
  const { data: duplicate } = await supabaseAdmin
    .from('discord_connections')
    .select('id')
    .eq('tenant_id', tenant_id)
    .eq('guild_id', guild_id)
    .neq('status', 'disconnected')
    .maybeSingle();

  if (duplicate) {
    return NextResponse.json({ error: 'A connection for this guild already exists.' }, { status: 409 });
  }

  try {
    // 9. Store token in Vault
    const secretName = `discord_token_${tenant_id}_${guild_id}`;
    const { data: vaultSecretId, error: vaultError } = await adminAny
      .schema('vault')
      .rpc('create_secret', {
        secret: bot_token,
        name: secretName,
        description: `Discord bot token for tenant ${tenant_id}, guild ${guild_id}`,
      });

    if (vaultError || !vaultSecretId) {
      console.error('[discord-connections] Vault create_secret error:', vaultError);
      return NextResponse.json({ error: 'Failed to add Discord connection. Please try again.' }, { status: 500 });
    }

    // 10. Insert discord_connections row
    const { data: connection, error: insertError } = await supabaseAdmin
      .from('discord_connections')
      .insert({
        tenant_id,
        vault_secret_id: vaultSecretId as string,
        guild_id,
        status: 'pending',
      })
      .select('id, guild_id, status, created_at')
      .single();

    if (insertError || !connection) {
      console.error('[discord-connections] Insert error:', insertError);
      // Rollback vault secret
      await adminAny.schema('vault').rpc('delete_secret', { secret_id: vaultSecretId });
      return NextResponse.json({ error: 'Failed to add Discord connection. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(connection, { status: 201 });
  } catch (err) {
    console.error('[discord-connections] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to add Discord connection. Please try again.' }, { status: 500 });
  }
}

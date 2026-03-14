import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify owner/admin role
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (membership.role === 'member') {
    return NextResponse.json(
      { error: 'Only workspace owners and admins can update workspace settings.' },
      { status: 403 }
    );
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name) {
    return NextResponse.json({ error: 'Workspace name is required.', field: 'name' }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json(
      { error: 'Workspace name must be 100 characters or less.', field: 'name' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', membership.tenant_id);

  if (updateError) {
    console.error('[settings/workspace] Update error:', updateError);
    return NextResponse.json(
      { error: 'Failed to update workspace name. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify owner role only
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (membership.role !== 'owner') {
    return NextResponse.json(
      { error: 'Only the workspace owner can delete the workspace.' },
      { status: 403 }
    );
  }

  let body: { confirm_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.confirm_name) {
    return NextResponse.json(
      { error: 'confirm_name is required.', field: 'confirm_name' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('name')
    .eq('id', membership.tenant_id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  }

  if (body.confirm_name !== tenant.name) {
    return NextResponse.json(
      { error: 'Confirmation text did not match workspace name.', field: 'confirm_name' },
      { status: 400 }
    );
  }

  try {
    // Fetch Vault secret IDs before deletion
    const { data: serviceConnections } = await supabaseAdmin
      .from('tenant_service_connections')
      .select('vault_secret_id, refresh_vault_secret_id')
      .eq('tenant_id', membership.tenant_id);

    const { data: apiKeys } = await supabaseAdmin
      .from('tenant_api_keys')
      .select('vault_secret_id')
      .eq('tenant_id', membership.tenant_id);

    const { data: discordConnections } = await supabaseAdmin
      .from('discord_connections')
      .select('vault_secret_id')
      .eq('tenant_id', membership.tenant_id);

    // Delete Vault secrets for service connections
    if (serviceConnections) {
      for (const conn of serviceConnections) {
        if (conn.vault_secret_id) {
          await adminAny.schema('vault').rpc('delete_secret', { secret_id: conn.vault_secret_id });
        }
        if (conn.refresh_vault_secret_id) {
          await adminAny.schema('vault').rpc('delete_secret', { secret_id: conn.refresh_vault_secret_id });
        }
      }
    }

    // Delete Vault secrets for API keys
    if (apiKeys) {
      for (const key of apiKeys) {
        if (key.vault_secret_id) {
          await adminAny.schema('vault').rpc('delete_secret', { secret_id: key.vault_secret_id });
        }
      }
    }

    // Delete Vault secrets for Discord connections
    if (discordConnections) {
      for (const conn of discordConnections) {
        if (conn.vault_secret_id) {
          await adminAny.schema('vault').rpc('delete_secret', { secret_id: conn.vault_secret_id });
        }
      }
    }

    const tenantId = membership.tenant_id;

    // Delete in cascade order
    await supabaseAdmin.from('tenant_service_connections').delete().eq('tenant_id', tenantId);
    await supabaseAdmin.from('tenant_api_keys').delete().eq('tenant_id', tenantId);
    await supabaseAdmin.from('discord_connections').delete().eq('tenant_id', tenantId);
    await supabaseAdmin.from('tenant_subscriptions').delete().eq('tenant_id', tenantId);
    await supabaseAdmin.from('tenant_members').delete().eq('tenant_id', tenantId);
    await supabaseAdmin.from('tenants').delete().eq('id', tenantId);

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[settings/workspace] Delete error:', err);
    return NextResponse.json(
      { error: 'Failed to delete workspace. Please contact support if the issue persists.' },
      { status: 500 }
    );
  }
}

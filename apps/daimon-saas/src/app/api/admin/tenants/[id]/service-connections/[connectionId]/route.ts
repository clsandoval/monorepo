import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; connectionId: string }> }
) {
  const { id: tenantId, connectionId } = await params;

  // Admin auth check — return 404 to obscure admin panel existence
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  // Look up connection scoped to tenant
  const { data: connection } = await supabaseAdmin
    .from('tenant_service_connections')
    .select('id, service, vault_secret_id, refresh_vault_secret_id')
    .eq('id', connectionId)
    .eq('tenant_id', tenantId)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  // Delete Vault secrets (access token + refresh token if present)
  if (connection.vault_secret_id) {
    await adminAny
      .schema('vault')
      .rpc('delete_secret', { secret_id: connection.vault_secret_id });
  }
  if (connection.refresh_vault_secret_id) {
    await adminAny
      .schema('vault')
      .rpc('delete_secret', { secret_id: connection.refresh_vault_secret_id });
  }

  // Delete the connection row
  const { error: deleteError } = await supabaseAdmin
    .from('tenant_service_connections')
    .delete()
    .eq('id', connectionId)
    .eq('tenant_id', tenantId);

  if (deleteError) {
    console.error('[admin/service-connections/delete] Delete error:', deleteError);
    return NextResponse.json({ error: 'Failed to delete service connection.' }, { status: 500 });
  }

  // Write audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action: 'service_connection_revoked_by_admin',
    tenant_id: tenantId,
    metadata: { service: connection.service },
  });

  return NextResponse.json({ success: true });
}

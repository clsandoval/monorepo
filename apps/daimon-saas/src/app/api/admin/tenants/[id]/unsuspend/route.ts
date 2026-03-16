import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _req: NextRequest,
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

  const supabaseAdmin = createSupabaseAdminClient();

  // Look up tenant
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, status')
    .eq('id', tenantId)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  if (tenant.status !== 'suspended') {
    return NextResponse.json({ error: 'Tenant is not suspended.' }, { status: 400 });
  }

  // Determine new status: 'configured' if any non-disconnected discord connection exists, else 'pending'
  const { data: activeConnections } = await supabaseAdmin
    .from('discord_connections')
    .select('id')
    .eq('tenant_id', tenantId)
    .neq('status', 'disconnected')
    .limit(1);

  const newStatus = activeConnections && activeConnections.length > 0 ? 'configured' : 'pending';

  // Restore tenant status
  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', tenantId);

  if (updateError) {
    console.error('[admin/unsuspend] Update error:', updateError);
    return NextResponse.json({ error: 'Failed to unsuspend tenant.' }, { status: 500 });
  }

  // Write audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action: 'tenant_unsuspended',
    tenant_id: tenantId,
    metadata: { new_status: newStatus },
  });

  return NextResponse.json({ success: true, new_status: newStatus });
}

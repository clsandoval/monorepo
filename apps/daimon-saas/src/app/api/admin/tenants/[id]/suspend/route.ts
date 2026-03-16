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

  let body: { reason?: unknown } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // body remains empty — reason is optional
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : null;
  if (reason && reason.length > 500) {
    return NextResponse.json({ error: 'Reason must be 500 characters or less.', field: 'reason' }, { status: 400 });
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

  if (tenant.status === 'suspended') {
    return NextResponse.json({ error: 'Tenant is already suspended.' }, { status: 400 });
  }

  // Suspend the tenant
  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', tenantId);

  if (updateError) {
    console.error('[admin/suspend] Update error:', updateError);
    return NextResponse.json({ error: 'Failed to suspend tenant.' }, { status: 500 });
  }

  // Write audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action: 'tenant_suspended',
    tenant_id: tenantId,
    metadata: { reason: reason ?? null },
  });

  return NextResponse.json({ success: true });
}

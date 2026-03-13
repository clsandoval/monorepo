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
  if (authError || !user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Look up tenant
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  // Find the owner member
  const { data: member } = await supabaseAdmin
    .from('tenant_members')
    .select('user_id')
    .eq('tenant_id', tenantId)
    .eq('role', 'owner')
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'No owner found for this tenant.' }, { status: 404 });
  }

  const ownerUserId = member.user_id;

  // Fetch owner email from auth.users via admin API
  const { data: ownerUserData, error: ownerError } = await supabaseAdmin.auth.admin.getUserById(ownerUserId);
  if (ownerError || !ownerUserData?.user?.email) {
    console.error('[admin/impersonate] Failed to fetch owner user:', ownerError);
    return NextResponse.json({ error: 'Failed to generate impersonation link.' }, { status: 500 });
  }

  const ownerEmail = ownerUserData.user.email;

  // Generate magic link for impersonation
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: ownerEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      data: { impersonated_by: user.id },
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[admin/impersonate] Failed to generate link:', linkError);
    return NextResponse.json({ error: 'Failed to generate impersonation link.' }, { status: 500 });
  }

  // Write audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action: 'tenant_impersonated',
    tenant_id: tenantId,
    metadata: { target_user_id: ownerUserId },
  });

  return NextResponse.json({ impersonation_url: linkData.properties.action_link });
}

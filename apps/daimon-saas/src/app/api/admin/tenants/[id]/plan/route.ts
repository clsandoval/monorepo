import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const VALID_PLANS = ['free', 'starter', 'pro'] as const;
type Plan = typeof VALID_PLANS[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tenantId } = await params;

  // Admin auth check — return 404 to obscure admin panel existence
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let body: { plan?: unknown } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // body remains empty
  }

  const plan = body.plan as Plan | undefined;
  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json(
      { error: "plan must be 'free', 'starter', or 'pro'." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Look up tenant
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, plan')
    .eq('id', tenantId)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const oldPlan = tenant.plan;

  // Update plan
  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', tenantId);

  if (updateError) {
    console.error('[admin/plan] Update error:', updateError);
    return NextResponse.json({ error: 'Failed to override plan.' }, { status: 500 });
  }

  // Write audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action: 'tenant_plan_override',
    tenant_id: tenantId,
    metadata: { old_plan: oldPlan, new_plan: plan },
  });

  return NextResponse.json({ success: true, plan });
}

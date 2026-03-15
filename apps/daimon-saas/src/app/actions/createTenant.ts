'use server';

import { createClient } from '@supabase/supabase-js';

function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function createTenantForUser({
  userId,
  tenantName,
}: {
  userId: string;
  tenantName: string;
}): Promise<{ error: string | null }> {
  const supabaseAdmin = createServiceRoleClient();

  // 1. Create tenant row
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: tenantName,
      owner_id: userId,
      plan: 'free',
      status: 'active',
    })
    .select('id')
    .single();

  if (tenantError) return { error: tenantError.message };

  // 2. Create tenant_members row (owner)
  const { error: memberError } = await supabaseAdmin
    .from('tenant_members')
    .insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: 'owner',
    });

  if (memberError) return { error: memberError.message };

  // Free tier has no Stripe subscription, so no tenant_subscriptions row needed.
  // A subscription row is created only when the user upgrades to a paid plan.

  return { error: null };
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify owner role
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Only the workspace owner can manage billing.' }, { status: 403 });
  }

  // 3. Get tenant's Stripe Customer ID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('stripe_customer_id')
    .eq('id', membership.tenant_id)
    .single();

  if (!tenant?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Please upgrade to a paid plan first.' },
      { status: 400 }
    );
  }

  // 4. Create Customer Portal session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  let session: Stripe.BillingPortal.Session;
  try {
    session = await getStripe().billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${appUrl}/dashboard/billing?portal_return=1`,
    });
  } catch (err) {
    console.error('[portal] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}

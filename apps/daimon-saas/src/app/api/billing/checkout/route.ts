import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { getPriceId } from '@/lib/stripe-prices';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse params
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get('plan') as 'starter' | 'pro' | null;
  const cycle = (searchParams.get('cycle') ?? 'monthly') as 'monthly' | 'annual';

  if (!plan || !['starter', 'pro'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan. Must be "starter" or "pro".' }, { status: 400 });
  }
  if (!['monthly', 'annual'].includes(cycle)) {
    return NextResponse.json({ error: 'Invalid cycle. Must be "monthly" or "annual".' }, { status: 400 });
  }

  // 3. Get tenant and verify owner role
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Only the workspace owner can manage billing.' }, { status: 403 });
  }

  // 4. Get tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, plan, stripe_customer_id')
    .eq('id', membership.tenant_id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  // 5. Prevent Checkout if already on that plan
  if (tenant.plan !== 'free' && tenant.plan === plan) {
    return NextResponse.json(
      { error: 'Already on this plan. Use billing portal to manage your subscription.' },
      { status: 400 }
    );
  }

  // 6. Get price ID
  const priceId = getPriceId(plan, cycle);

  // 7. Build checkout session params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      tenant_id: tenant.id,
      plan: plan,
      cycle: cycle,
    },
    subscription_data: {
      metadata: {
        tenant_id: tenant.id,
        plan: plan,
      },
    },
  };

  // 8. Attach existing Stripe Customer if available (prevents duplicate customers)
  if (tenant.stripe_customer_id) {
    sessionParams.customer = tenant.stripe_customer_id;
  } else {
    // Let Stripe create a new Customer; also pass email for pre-fill
    sessionParams.customer_email = user.email;
  }

  // 9. Create Checkout Session
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create(sessionParams);
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}

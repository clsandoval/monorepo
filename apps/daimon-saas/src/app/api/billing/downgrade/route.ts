import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { getPriceId } from '@/lib/stripe-prices';

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: 'Only the workspace owner can change the plan.' }, { status: 403 });
  }

  // 3. Parse target plan from body
  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const targetPlan = body.plan as 'free' | 'starter' | null;
  if (!targetPlan || !['free', 'starter'].includes(targetPlan)) {
    return NextResponse.json({ error: 'Invalid plan. Must be "free" or "starter".' }, { status: 400 });
  }

  // 4. Get current tenant plan + subscription
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, plan')
    .eq('id', membership.tenant_id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from('tenant_subscriptions')
    .select('stripe_subscription_id, stripe_price_id, current_period_end')
    .eq('tenant_id', membership.tenant_id)
    .single();

  if (!subscription?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
  }

  // 5. Validate: target plan must be lower than current plan
  const planRank: Record<string, number> = { free: 0, starter: 1, pro: 2 };
  const currentRank = planRank[tenant.plan] ?? 0;
  const targetRank = planRank[targetPlan] ?? 0;

  if (targetRank >= currentRank) {
    return NextResponse.json(
      { error: 'Target plan must be lower than current plan.' },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const subscriptionId = subscription.stripe_subscription_id;

  if (targetPlan === 'free') {
    // 6a. Downgrade to free: cancel at period end
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      console.error('[downgrade] Stripe error (cancel_at_period_end):', err);
      return NextResponse.json({ error: 'Failed to schedule downgrade.' }, { status: 500 });
    }
  } else {
    // 6b. Downgrade pro → starter: switch price, effective at next renewal
    // Determine existing billing cycle from current price ID
    const currentPriceId = subscription.stripe_price_id ?? '';
    const isAnnual =
      currentPriceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID ||
      currentPriceId === process.env.STRIPE_STARTER_ANNUAL_PRICE_ID;
    const cycle = isAnnual ? 'annual' : 'monthly';
    const newPriceId = getPriceId('starter', cycle);

    // Retrieve subscription to get the subscription item ID
    let stripeSub: Awaited<ReturnType<typeof stripe.subscriptions.retrieve>>;
    try {
      stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    } catch (err) {
      console.error('[downgrade] Stripe retrieve error:', err);
      return NextResponse.json({ error: 'Failed to retrieve subscription.' }, { status: 500 });
    }

    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) {
      return NextResponse.json({ error: 'Subscription item not found.' }, { status: 500 });
    }

    try {
      await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged',
      });
    } catch (err) {
      console.error('[downgrade] Stripe error (plan switch):', err);
      return NextResponse.json({ error: 'Failed to schedule downgrade.' }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    effective_date: subscription.current_period_end,
  });
}

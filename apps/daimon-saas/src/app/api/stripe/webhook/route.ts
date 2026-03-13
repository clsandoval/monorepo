// IMPORTANT: nodejs runtime required — edge runtime cannot read raw body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getPlanFromPriceId } from '@/lib/stripe-prices';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // 1. Read raw body (required for signature verification — do NOT use req.json())
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('[webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // 2. Verify signature
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 3. Use admin Supabase client (bypasses RLS — webhook runs as service role)
  const supabase = createSupabaseAdminClient();

  // 4. Idempotency check — skip already-processed events
  const { data: inserted } = await supabase
    .from('stripe_webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
    })
    .select('stripe_event_id')
    .single();

  if (!inserted) {
    // Event already processed (UNIQUE constraint conflict — ON CONFLICT DO NOTHING returned 0 rows)
    console.info(`[webhook] Duplicate event skipped: ${event.id}`);
    return NextResponse.json({ received: true });
  }

  // 5. Route event to handler
  console.info(`[webhook] Processing event: ${event.id} type=${event.type}`);
  try {
    await handleStripeEvent(event, supabase);
  } catch (err) {
    console.error(`[webhook] Error in ${event.type} handler:`, {
      eventId: event.id,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: 'Internal error processing event' }, { status: 500 });
  }

  // 6. Acknowledge receipt
  return NextResponse.json({ received: true });
}

type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>;

async function handleStripeEvent(
  event: Stripe.Event,
  supabase: SupabaseAdmin
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
      break;
    case 'checkout.session.expired':
      // Log only — no DB action needed
      console.info('[webhook] Checkout session expired:', (event.data.object as Stripe.Checkout.Session).id);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
      break;
    case 'customer.deleted':
      await handleCustomerDeleted(event.data.object as Stripe.Customer, supabase);
      break;
    default:
      // Unhandled event — not an error, just ignore
      console.info(`[webhook] Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: SupabaseAdmin
): Promise<void> {
  const tenantId = session.metadata?.tenant_id;
  if (!tenantId) {
    console.error('[checkout.completed] No tenant_id in session metadata:', session.id);
    return;
  }

  const customerId = session.customer as string;
  if (!customerId) {
    console.error('[checkout.completed] No customer in session:', session.id);
    return;
  }

  // Store Stripe Customer ID on tenant (idempotent — only updates if currently null)
  const { error } = await supabase
    .from('tenants')
    .update({
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId)
    .is('stripe_customer_id', null);

  if (error) {
    console.warn('[checkout.completed] Could not update stripe_customer_id:', error.message);
  }

  // Also update tenant_subscriptions with customer ID
  await supabase
    .from('tenant_subscriptions')
    .update({ stripe_customer_id: customerId })
    .eq('tenant_id', tenantId)
    .is('stripe_customer_id', null);

  console.info(`[checkout.completed] Tenant ${tenantId} linked to Stripe Customer ${customerId}`);
}

async function upsertSubscription(
  tenantId: string,
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
): Promise<void> {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const plan = priceId ? (getPlanFromPriceId(priceId) ?? 'free') : 'free';
  const customerId = subscription.customer as string;

  const updateData = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan: plan,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: subscription.items.data[0]?.current_period_start
      ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.items.data[0]?.current_period_end
      ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('tenant_subscriptions')
    .update(updateData)
    .eq('tenant_id', tenantId);

  if (error) {
    throw new Error(`[sub.created] Failed to upsert subscription for tenant ${tenantId}: ${error.message}`);
  }

  console.info(`[sub.created] Tenant ${tenantId} subscribed to ${plan} (${subscription.id})`);
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
): Promise<void> {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) {
    const customerId = subscription.customer as string;
    const { data: ts } = await supabase
      .from('tenant_subscriptions')
      .select('tenant_id')
      .eq('stripe_customer_id', customerId)
      .single();
    if (!ts) {
      console.error('[sub.created] Cannot find tenant for customer:', customerId);
      return;
    }
    await upsertSubscription(ts.tenant_id, subscription, supabase);
    return;
  }

  await upsertSubscription(tenantId, subscription, supabase);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
): Promise<void> {
  const { data: ts } = await supabase
    .from('tenant_subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!ts) {
    const customerId = subscription.customer as string;
    const { data: tsByCustomer } = await supabase
      .from('tenant_subscriptions')
      .select('tenant_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!tsByCustomer) {
      console.error('[sub.updated] Cannot find tenant for subscription:', subscription.id);
      return;
    }
    await upsertSubscription(tsByCustomer.tenant_id, subscription, supabase);
    return;
  }

  await upsertSubscription(ts.tenant_id, subscription, supabase);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
): Promise<void> {
  const { data: ts } = await supabase
    .from('tenant_subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!ts) {
    console.error('[sub.deleted] Cannot find tenant for subscription:', subscription.id);
    return;
  }

  const { error } = await supabase
    .from('tenant_subscriptions')
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      plan: 'free',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: null,
      current_period_end: null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : new Date().toISOString(),
      trial_start: null,
      trial_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', ts.tenant_id);

  if (error) {
    throw new Error(`[sub.deleted] Failed to downgrade tenant ${ts.tenant_id}: ${error.message}`);
  }

  console.info(`[sub.deleted] Tenant ${ts.tenant_id} downgraded to free (sub ${subscription.id} deleted)`);
}

async function handleInvoicePaymentSucceeded(
  _invoice: Stripe.Invoice,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 025 — refresh period dates, confirm status=active
}

async function handleInvoicePaymentFailed(
  _invoice: Stripe.Invoice,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 025 — set status=past_due
}

async function handleCustomerDeleted(
  _customer: Stripe.Customer,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 025 — clear stripe_customer_id from tenants and tenant_subscriptions
}

// IMPORTANT: nodejs runtime required — edge runtime cannot read raw body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
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

// Stub handlers — full implementations in stages 024-025

async function handleCheckoutCompleted(
  _session: Stripe.Checkout.Session,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 024 — store stripe_customer_id on tenant
}

async function handleSubscriptionCreated(
  _subscription: Stripe.Subscription,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 024 — upsert tenant_subscriptions, trigger plan cascade
}

async function handleSubscriptionUpdated(
  _subscription: Stripe.Subscription,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 024 — update tenant_subscriptions fields
}

async function handleSubscriptionDeleted(
  _subscription: Stripe.Subscription,
  _supabase: SupabaseAdmin
): Promise<void> {
  // TODO: stage 024 — downgrade tenant to free plan
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

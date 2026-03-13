# Stripe Integration — Daimon SaaS

> Aspect: 5.1 — Stripe integration
> Written: 2026-03-13
> Related: [../premium/tiers.md](../premium/tiers.md), [../premium/pricing.md](../premium/pricing.md), [../database/schema.md](../database/schema.md#table-tenant_subscriptions), [../api/webhooks.md](../api/webhooks.md), [../frontend/billing-page.md](../frontend/billing-page.md)

---

## Overview

Daimon uses Stripe for all paid plan billing. The integration covers:
1. **Products and Prices** — One product per plan tier, two prices each (monthly + annual)
2. **Checkout Sessions** — Direct upgrade from Free → Starter or Free → Pro
3. **Customer Portal** — Self-serve billing management (cancel, update payment, switch plans)
4. **Webhooks** — Stripe pushes subscription lifecycle events; Next.js API route processes them
5. **Subscription Lifecycle** — State machine mapping Stripe events to database updates

The website does NOT poll Stripe. All state changes flow through webhooks. The database (`tenant_subscriptions` table) is the single source of truth visible to both the website and the bot.

---

## Environment Variables (Stripe-Specific)

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret API key — used server-side only. `sk_test_...` in development, `sk_live_...` in production. Never expose to client. | `sk_live_abc123xyz789` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — safe for client-side. `pk_test_...` in development, `pk_live_...` in production. Used only if implementing client-side Stripe Elements (not needed for Checkout redirect flow). | `pk_live_abc123xyz789` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from the Stripe Dashboard → Webhooks → endpoint detail. `whsec_...`. Used to verify that webhook events come from Stripe. | `whsec_abc123xyz789` |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | Stripe Price ID for the Starter plan monthly billing cycle. Created once in Stripe Dashboard. | `price_1Rstarter_monthly` |
| `STRIPE_STARTER_ANNUAL_PRICE_ID` | Stripe Price ID for the Starter plan annual billing cycle. | `price_1Rstarter_annual` |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe Price ID for the Pro plan monthly billing cycle. | `price_1Rpro_monthly` |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe Price ID for the Pro plan annual billing cycle. | `price_1Rpro_annual` |
| `NEXT_PUBLIC_APP_URL` | The full public URL of the Next.js app. Used to construct Stripe redirect URLs. No trailing slash. | `https://daimon.ai` |

All environment variables are also documented in [../deployment/environment.md](../deployment/environment.md).

---

## Stripe Dashboard Setup — One-Time Configuration

### Step 1: Create Products

In the Stripe Dashboard → Products → Add Product, create the following products ONCE. Products do not change — only prices change.

#### Product 1: Daimon Starter

| Field | Value |
|-------|-------|
| Name | `Daimon Starter` |
| Description | `Up to 3 Discord connections, all 50+ tools, email support. Bring your own Anthropic API key.` |
| Statement descriptor | `DAIMON STARTER` |
| Metadata | `plan=starter` |

#### Product 2: Daimon Pro

| Field | Value |
|-------|-------|
| Name | `Daimon Pro` |
| Description | `Unlimited Discord connections, all 50+ tools, priority support, 99.9% uptime SLA. Bring your own Anthropic API key.` |
| Statement descriptor | `DAIMON PRO` |
| Metadata | `plan=pro` |

---

### Step 2: Create Prices

Create 4 prices total (2 per product). Prices are recurring, billed in advance. Currency: USD.

#### Price 1: Starter Monthly

| Field | Value |
|-------|-------|
| Product | Daimon Starter |
| Billing period | Monthly |
| Amount | `$9.00` per month |
| Currency | USD |
| Usage type | Licensed (not metered) |
| Billing scheme | Per unit |
| Nickname | `Starter Monthly` |
| Metadata | `plan=starter`, `billing_cycle=monthly` |
| Price ID (env var) | Store as `STRIPE_STARTER_MONTHLY_PRICE_ID` |

#### Price 2: Starter Annual

| Field | Value |
|-------|-------|
| Product | Daimon Starter |
| Billing period | Yearly |
| Amount | `$79.00` per year |
| Currency | USD |
| Usage type | Licensed |
| Billing scheme | Per unit |
| Nickname | `Starter Annual` |
| Metadata | `plan=starter`, `billing_cycle=annual` |
| Price ID (env var) | Store as `STRIPE_STARTER_ANNUAL_PRICE_ID` |

#### Price 3: Pro Monthly

| Field | Value |
|-------|-------|
| Product | Daimon Pro |
| Billing period | Monthly |
| Amount | `$29.00` per month |
| Currency | USD |
| Usage type | Licensed |
| Billing scheme | Per unit |
| Nickname | `Pro Monthly` |
| Metadata | `plan=pro`, `billing_cycle=monthly` |
| Price ID (env var) | Store as `STRIPE_PRO_MONTHLY_PRICE_ID` |

#### Price 4: Pro Annual

| Field | Value |
|-------|-------|
| Product | Daimon Pro |
| Billing period | Yearly |
| Amount | `$249.00` per year |
| Currency | USD |
| Usage type | Licensed |
| Billing scheme | Per unit |
| Nickname | `Pro Annual` |
| Metadata | `plan=pro`, `billing_cycle=annual` |
| Price ID (env var) | Store as `STRIPE_PRO_ANNUAL_PRICE_ID` |

---

### Step 3: Configure Webhook Endpoint

In Stripe Dashboard → Developers → Webhooks → Add Endpoint:

| Field | Value |
|-------|-------|
| Endpoint URL | `https://daimon.ai/api/stripe/webhook` |
| Version | Latest (the SDK version used by the project) |
| Events to listen for | See full list in Webhook Events section below |

After creating the endpoint, copy the **Signing Secret** and set it as `STRIPE_WEBHOOK_SECRET` in all environments.

**Events to select:**

| Stripe Event | Reason |
|-------------|--------|
| `checkout.session.completed` | A user completed Stripe Checkout — create/update subscription in DB |
| `checkout.session.expired` | A user let the Checkout session expire without paying — no DB action needed, but log it |
| `customer.subscription.created` | New subscription created (may fire alongside checkout.session.completed) |
| `customer.subscription.updated` | Subscription changed: plan upgrade/downgrade, trial ends, status changes, cancel_at_period_end set |
| `customer.subscription.deleted` | Subscription canceled and period ended — downgrade to free plan |
| `customer.subscription.trial_will_end` | Trial ending in 3 days — send reminder email (future) |
| `invoice.payment_succeeded` | Successful payment — update subscription period dates, confirm `status=active` |
| `invoice.payment_failed` | Payment failed — set `status=past_due`, notify user |
| `invoice.finalized` | Invoice finalized — for audit/logging |
| `customer.deleted` | Stripe Customer deleted — clear customer ID from our DB (edge case: admin cleanup) |

---

### Step 4: Configure Customer Portal

In Stripe Dashboard → Settings → Billing → Customer Portal:

| Setting | Value |
|---------|-------|
| Business information | Daimon (powered by PyMC) |
| Headline | `Manage your Daimon subscription` |
| Allow customers to update subscriptions | Yes |
| Allowed plans on upgrade | Starter Monthly, Starter Annual, Pro Monthly, Pro Annual |
| Allow customers to cancel subscriptions | Yes |
| Allow customers to update payment method | Yes |
| Allow customers to view invoice history | Yes |
| Privacy policy URL | `https://daimon.ai/privacy` |
| Terms of Service URL | `https://daimon.ai/terms` |
| Return URL | `https://daimon.ai/dashboard/billing?portal_return=1` |

---

## Stripe SDK Setup

**File:** `lib/stripe.ts`

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});
```

**Install:** `npm install stripe` (server-side only — not included in client bundles)

---

## Plan → Price ID Mapping Helper

**File:** `lib/stripe-prices.ts`

```typescript
export type PlanTier = 'starter' | 'pro';
export type BillingCycle = 'monthly' | 'annual';

interface PriceMap {
  [key: string]: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getPriceId(plan: PlanTier, cycle: BillingCycle): string {
  const map: PriceMap = {
    'starter:monthly': requireEnv('STRIPE_STARTER_MONTHLY_PRICE_ID'),
    'starter:annual': requireEnv('STRIPE_STARTER_ANNUAL_PRICE_ID'),
    'pro:monthly': requireEnv('STRIPE_PRO_MONTHLY_PRICE_ID'),
    'pro:annual': requireEnv('STRIPE_PRO_ANNUAL_PRICE_ID'),
  };
  const key = `${plan}:${cycle}`;
  const priceId = map[key];
  if (!priceId) throw new Error(`No price ID configured for plan=${plan}, cycle=${cycle}`);
  return priceId;
}

export function getPlanFromPriceId(priceId: string): PlanTier | null {
  const starterMonthly = process.env.STRIPE_STARTER_MONTHLY_PRICE_ID;
  const starterAnnual = process.env.STRIPE_STARTER_ANNUAL_PRICE_ID;
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proAnnual = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

  if (priceId === starterMonthly || priceId === starterAnnual) return 'starter';
  if (priceId === proMonthly || priceId === proAnnual) return 'pro';
  return null;
}
```

---

## API Route: Create Checkout Session

**File:** `app/api/billing/checkout/route.ts`
**Method:** `POST`
**Auth:** Required (Supabase Auth session)
**Role:** `owner` only

### Request

```typescript
// POST /api/billing/checkout
// Query parameters (alternative: JSON body)
interface CheckoutRequest {
  plan: 'starter' | 'pro';
  cycle?: 'monthly' | 'annual'; // defaults to 'monthly' if not provided
}
```

**URL example:** `POST /api/billing/checkout?plan=starter&cycle=monthly`

### Handler Logic

```typescript
// app/api/billing/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getPriceId } from '@/lib/stripe-prices';

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = createSupabaseServerClient();
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

  // 5. Prevent downgrade via checkout (Free → Free is invalid; current plan upgrade only)
  // Also prevent Checkout if already on that plan
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
    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
```

### Response Shape

**Success (200):**
```json
{ "url": "https://checkout.stripe.com/pay/cs_live_XXXX" }
```

**Errors:**

| HTTP | Error message | Cause |
|------|--------------|-------|
| 401 | `"Unauthorized"` | No valid auth session |
| 403 | `"Only the workspace owner can manage billing."` | User is not owner role |
| 400 | `"Invalid plan. Must be \"starter\" or \"pro\"."` | Bad plan param |
| 400 | `"Invalid cycle. Must be \"monthly\" or \"annual\"."` | Bad cycle param |
| 400 | `"Already on this plan. Use billing portal to manage your subscription."` | Plan collision |
| 404 | `"Tenant not found."` | No tenant for user |
| 500 | `"Failed to create checkout session."` | Stripe API error |
| 500 | `"Stripe did not return a checkout URL."` | Stripe internal |

### Client-Side Usage

In the billing page, the "Upgrade Plan →" button calls this route:

```typescript
async function handleUpgrade(plan: 'starter' | 'pro', cycle: 'monthly' | 'annual' = 'monthly') {
  setIsUpgrading(true);
  try {
    const res = await fetch(`/api/billing/checkout?plan=${plan}&cycle=${cycle}`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    window.location.href = data.url; // Redirect to Stripe Checkout
  } catch (err) {
    toast.error('Could not initiate checkout. Please try again.');
    setIsUpgrading(false);
  }
}
```

---

## API Route: Create Customer Portal Session

**File:** `app/api/billing/portal/route.ts`
**Method:** `POST`
**Auth:** Required (Supabase Auth session)
**Role:** `owner` only

### Handler Logic

```typescript
// app/api/billing/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = createSupabaseServerClient();
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
    session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${appUrl}/dashboard/billing?portal_return=1`,
    });
  } catch (err) {
    console.error('[portal] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
```

### Response Shape

**Success (200):**
```json
{ "url": "https://billing.stripe.com/session/XXXX" }
```

**Errors:**

| HTTP | Error message | Cause |
|------|--------------|-------|
| 401 | `"Unauthorized"` | No auth session |
| 403 | `"Only the workspace owner can manage billing."` | Not owner |
| 400 | `"No billing account found. Please upgrade to a paid plan first."` | No stripe_customer_id |
| 500 | `"Failed to open billing portal."` | Stripe API error |

---

## Webhook Handler

**File:** `app/api/stripe/webhook/route.ts`
**Method:** `POST`
**Auth:** Stripe signature verification (NOT Supabase auth)

**Critical:** This route must be excluded from CSRF protection and must NOT parse the body before signature verification. The raw body is required for signature validation.

```typescript
// app/api/stripe/webhook/route.ts
// This must be a Next.js Route Handler (App Router), not a Pages API route

export const runtime = 'nodejs'; // Required: edge runtime cannot read raw body
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getPlanFromPriceId } from '@/lib/stripe-prices';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // 1. Read raw body (required for signature verification)
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    console.error('[webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // 2. Verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 3. Use admin Supabase client (bypasses RLS — webhook runs as service role)
  const supabase = createSupabaseAdminClient();

  // 4. Route event to handler
  try {
    await handleStripeEvent(event, supabase);
  } catch (err) {
    console.error(`[webhook] Error handling event ${event.type}:`, err);
    // Return 500 so Stripe retries the event (Stripe retries on non-2xx)
    return NextResponse.json({ error: 'Internal error processing event' }, { status: 500 });
  }

  // 5. Acknowledge receipt
  return NextResponse.json({ received: true });
}
```

### Event Handler Dispatch

```typescript
async function handleStripeEvent(
  event: Stripe.Event,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
      break;
    case 'checkout.session.expired':
      // Log only — no DB action needed
      console.info('[webhook] Checkout session expired:', event.data.object.id);
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
```

---

### Handler: `checkout.session.completed`

Fired when a user completes a Stripe Checkout session (enters payment info and clicks "Subscribe"). This is the primary entry point for new subscriptions.

**Key behavior:**
- Extracts `tenant_id` from session metadata
- Stores `stripe_customer_id` on the tenant (first-time only)
- The subscription itself is handled by the subsequent `customer.subscription.created` event
- Both events fire together; this handler handles customer creation, `customer.subscription.created` handles the subscription details

```typescript
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createSupabaseAdminClient>
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
    .is('stripe_customer_id', null); // Only update if not already set — prevents race conditions

  if (error) {
    // Not a critical error — customer.subscription.created will set everything
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
```

---

### Handler: `customer.subscription.created`

Fired when Stripe creates a new subscription (always fires after `checkout.session.completed`).

```typescript
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) {
    // Fallback: look up tenant by customer ID
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

async function upsertSubscription(
  tenantId: string,
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>
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
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
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

  // UPSERT on tenant_id — idempotent, handles re-subscriptions
  const { error } = await supabase
    .from('tenant_subscriptions')
    .update(updateData)
    .eq('tenant_id', tenantId);

  if (error) {
    throw new Error(`[sub.created] Failed to upsert subscription for tenant ${tenantId}: ${error.message}`);
  }

  // The sync_tenant_plan trigger automatically updates tenants.plan
  console.info(`[sub.created] Tenant ${tenantId} subscribed to ${plan} (${subscription.id})`);
}
```

---

### Handler: `customer.subscription.updated`

Fired on every subscription change: plan upgrade/downgrade, billing cycle change, trial end, payment status change, `cancel_at_period_end` toggle.

```typescript
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  // Look up tenant by subscription ID
  const { data: ts } = await supabase
    .from('tenant_subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!ts) {
    // Fallback: look up by customer ID
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
```

---

### Handler: `customer.subscription.deleted`

Fired when a subscription is fully canceled — either because `cancel_at_period_end = true` and the period ended, or because the subscription was immediately canceled. This is the terminal event — the tenant must be downgraded to free.

```typescript
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  // Look up tenant by subscription ID
  const { data: ts } = await supabase
    .from('tenant_subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!ts) {
    console.error('[sub.deleted] Cannot find tenant for subscription:', subscription.id);
    return;
  }

  // Downgrade to free — clear all Stripe subscription fields but keep stripe_customer_id
  const { error } = await supabase
    .from('tenant_subscriptions')
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      plan: 'free',
      status: 'active', // Free tier sentinel — no actual Stripe subscription
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

  // The sync_tenant_plan trigger propagates plan='free' to tenants.plan
  // The bot reads tenants.plan via Realtime and will detect the downgrade
  console.info(`[sub.deleted] Tenant ${ts.tenant_id} downgraded to free (sub ${subscription.id} deleted)`);
}
```

---

### Handler: `invoice.payment_succeeded`

Fired when Stripe successfully charges the customer. Used to refresh period dates.

```typescript
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) return; // Not a subscription invoice (one-time payment); ignore

  // Fetch the latest subscription state from Stripe
  // (invoice doesn't always include period dates directly)
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const { data: ts } = await supabase
    .from('tenant_subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!ts) {
    console.warn('[invoice.payment_succeeded] No tenant found for subscription:', subscriptionId);
    return;
  }

  // Update period dates and confirm active status
  const { error } = await supabase
    .from('tenant_subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', ts.tenant_id);

  if (error) {
    console.error('[invoice.payment_succeeded] DB update error:', error.message);
  }
}
```

---

### Handler: `invoice.payment_failed`

Fired when a payment attempt fails (e.g., insufficient funds, expired card). Stripe retries automatically per its dunning schedule. We set `status = 'past_due'` in the DB so the billing page can show a warning.

```typescript
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) return;

  const { data: ts } = await supabase
    .from('tenant_subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!ts) {
    console.warn('[invoice.payment_failed] No tenant found for subscription:', subscriptionId);
    return;
  }

  // Set status to past_due — billing page shows "Update Payment Method" CTA
  const { error } = await supabase
    .from('tenant_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', ts.tenant_id);

  if (error) {
    console.error('[invoice.payment_failed] DB update error:', error.message);
  }

  // Note: The plan is NOT changed here. The tenant remains on their paid plan
  // while Stripe retries payments. Only subscription.deleted triggers a downgrade.
  console.info(`[invoice.payment_failed] Tenant ${ts.tenant_id} set to past_due`);
}
```

---

### Handler: `customer.deleted`

Fired when a Stripe Customer is deleted (admin action via Stripe Dashboard, or cleanup scripts). Clears the customer ID from our DB.

```typescript
async function handleCustomerDeleted(
  customer: Stripe.Customer,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  // Clear customer ID from tenants table
  await supabase
    .from('tenants')
    .update({ stripe_customer_id: null, updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', customer.id);

  // Clear customer ID from tenant_subscriptions table
  await supabase
    .from('tenant_subscriptions')
    .update({ stripe_customer_id: null, updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', customer.id);

  console.info(`[customer.deleted] Cleared Stripe Customer ${customer.id} from DB`);
}
```

---

## Subscription Lifecycle State Machine

Every possible transition in the subscription lifecycle, with the triggering Stripe event and the resulting DB state.

### State Diagram

```
         ┌────────────────────────────────────────────────────┐
         │                    STATES                           │
         │                                                      │
         │  [FREE]                                              │
         │    plan='free', status='active', sub_id=NULL         │
         │                                                      │
         │  [TRIALING]                                          │
         │    plan='starter'|'pro', status='trialing'           │
         │    (if trial is configured on price — currently not) │
         │                                                      │
         │  [ACTIVE]                                            │
         │    plan='starter'|'pro', status='active'             │
         │    cancel_at_period_end=false                        │
         │                                                      │
         │  [CANCELING]                                         │
         │    plan='starter'|'pro', status='active'             │
         │    cancel_at_period_end=true                         │
         │                                                      │
         │  [PAST_DUE]                                          │
         │    plan='starter'|'pro', status='past_due'           │
         │                                                      │
         │  [UNPAID]                                            │
         │    plan='starter'|'pro', status='unpaid'             │
         │    (all Stripe retries exhausted)                    │
         │                                                      │
         └────────────────────────────────────────────────────┘
```

### All Transitions

| From State | To State | Trigger | Stripe Event | DB Action |
|-----------|---------|---------|-------------|-----------|
| FREE | ACTIVE | User completes Checkout | `checkout.session.completed` + `customer.subscription.created` | Set `stripe_subscription_id`, `stripe_price_id`, `plan`, `status='active'`, `stripe_customer_id` on both `tenants` and `tenant_subscriptions` |
| FREE | TRIALING | User completes Checkout (with trial) | `customer.subscription.created` (status='trialing') | Same as above but `status='trialing'`, `trial_end` populated |
| TRIALING | ACTIVE | Trial ends, payment succeeds | `customer.subscription.updated` (status='active') | Set `status='active'`, clear `trial_end` |
| TRIALING | PAST_DUE | Trial ends, no payment method | `customer.subscription.updated` (status='past_due') | Set `status='past_due'` |
| ACTIVE | CANCELING | User cancels in Customer Portal | `customer.subscription.updated` (`cancel_at_period_end=true`) | Set `cancel_at_period_end=true`, `canceled_at=now()` |
| CANCELING | ACTIVE | User reactivates in Customer Portal | `customer.subscription.updated` (`cancel_at_period_end=false`) | Set `cancel_at_period_end=false`, `canceled_at=null` |
| CANCELING | FREE | Period ends | `customer.subscription.deleted` | Clear subscription fields, set `plan='free'`, `status='active'` |
| ACTIVE | PAST_DUE | Payment fails | `invoice.payment_failed` | Set `status='past_due'` |
| PAST_DUE | ACTIVE | User updates payment, retry succeeds | `invoice.payment_succeeded` | Set `status='active'`, refresh period dates |
| PAST_DUE | UNPAID | All retries exhausted (configurable in Stripe: 3–4 attempts over ~3 weeks by default) | `customer.subscription.updated` (status='unpaid') | Set `status='unpaid'` |
| UNPAID | FREE | Final cancellation | `customer.subscription.deleted` | Clear subscription fields, `plan='free'` |
| ACTIVE | ACTIVE (upgrade) | User upgrades plan in Customer Portal | `customer.subscription.updated` (new price_id) | Update `stripe_price_id`, `plan` to new tier |
| ACTIVE | ACTIVE (downgrade) | User downgrades plan in Customer Portal | `customer.subscription.updated` (new price_id) | Update `stripe_price_id`, `plan` to new tier |

---

## Stripe Idempotency

All webhook handlers are idempotent. The same event processed twice must produce the same result.

**Implementation:** All `UPDATE` operations use `WHERE` clauses that make repeated execution safe:
- `handleCheckoutCompleted` uses `.is('stripe_customer_id', null)` — only updates if not already set
- `upsertSubscription` runs `UPDATE ... SET status=X WHERE tenant_id=Y` — re-running with same values is a no-op
- `handleSubscriptionDeleted` runs `UPDATE ... SET plan='free' WHERE tenant_id=Y` — idempotent

**Stripe Retries:** Stripe retries webhook events that receive non-2xx responses or no response within 30 seconds. Our handler returns 500 on DB errors (so Stripe retries) and 200 on successful processing (or gracefully ignored events).

---

## Testing in Development

### Local Webhook Testing

Use Stripe CLI to forward webhooks to your local development server:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# The CLI will print a webhook signing secret — use this for STRIPE_WEBHOOK_SECRET in .env.local
```

### Triggering Test Events

```bash
# Simulate checkout completion (upgrade Free → Starter)
stripe trigger checkout.session.completed

# Simulate subscription created
stripe trigger customer.subscription.created

# Simulate payment failed
stripe trigger invoice.payment_failed

# Simulate subscription canceled (end of period)
stripe trigger customer.subscription.deleted
```

### Test Cards

| Scenario | Card Number | Use for |
|---------|------------|---------|
| Success | `4242 4242 4242 4242` | Normal checkout, any exp/CVC |
| Declined | `4000 0000 0000 0002` | Payment failure testing |
| Requires auth | `4000 0025 0000 3155` | 3D Secure testing |
| Insufficient funds | `4000 0000 0000 9995` | `invoice.payment_failed` |

---

## Stripe Customer Customer → Tenant Mapping Rules

The mapping between Stripe Customers and Daimon tenants is one-to-one and permanent:

1. **One Stripe Customer per Daimon tenant** — enforced by `UNIQUE(stripe_customer_id)` on `tenants` table
2. **Customer IDs never change** — once assigned, a Stripe Customer ID is permanent. Even if a tenant cancels and resubscribes, the same Customer ID is used
3. **Customer created lazily** — only when the tenant first initiates a Checkout session. Free-tier tenants have `stripe_customer_id = NULL`
4. **Customer email = signup email** — passed as `customer_email` when creating the Checkout Session, so Stripe pre-fills the email field. The email is not stored in our DB separately.

---

## Security Considerations

1. **Webhook signature verification is mandatory.** Every request to `/api/stripe/webhook` must pass `stripe.webhooks.constructEvent()`. Never process events without verification.

2. **Use raw body for signature.** The `stripe-signature` header is computed against the raw request body. Any middleware that parses JSON before the webhook handler will break signature verification. In Next.js App Router, reading `req.text()` instead of `req.json()` provides the raw body.

3. **Admin Supabase client in webhook.** The webhook handler uses the service role key (`createSupabaseAdminClient`), bypassing RLS. This is correct — the webhook is a server-to-server call from Stripe, not a user request.

4. **`tenant_id` in metadata.** The `tenant_id` is stored in both `checkout.session.metadata` and `subscription.metadata` so we can find the tenant for any event type, even if the subscription doesn't have our metadata (fallback: lookup by `stripe_customer_id`).

5. **No secrets in client code.** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are never sent to the client. Only `STRIPE_PUBLISHABLE_KEY` (if used) is safe for client code. In the current Checkout redirect flow, we don't need the publishable key at all.

---

## Admin Panel: Force Plan Change

For admin use only. Documented in full in [../frontend/admin-panel.md](../frontend/admin-panel.md).

The admin panel has a "Force Set Plan" action that allows admins to manually set `tenants.plan` and `tenant_subscriptions.plan` without going through Stripe. This is used for:
- Comping accounts (e.g., give a user Pro for free)
- Correcting webhook processing errors
- Setting up internal test accounts

**Implementation:** Admin API route `POST /api/admin/tenants/[id]/set-plan` takes `{ plan: 'free' | 'starter' | 'pro' }` and directly updates both tables. No Stripe interaction. Requires admin role check.

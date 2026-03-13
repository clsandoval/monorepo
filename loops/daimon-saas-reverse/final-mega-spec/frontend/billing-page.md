# Billing Page — Complete Specification

> Route: `/dashboard/billing`
> Layout: `app/(dashboard)/layout.tsx` — Authenticated only
> File: `app/(dashboard)/billing/page.tsx` (Server Component, data fetched server-side)
> Last updated: 2026-03-13

---

## Overview

The Billing page is where tenants manage their Daimon subscription plan and API keys. It is divided into two major areas:

1. **Subscription** — Current plan display, plan comparison grid, upgrade via Stripe Checkout, manage billing via Stripe Customer Portal.
2. **API Keys** — Manage Anthropic API key (required) and OpenAI API key (optional). Both are stored encrypted via Supabase Vault. Both are paste-and-validate inputs — no OAuth.

**Auth guard:** Middleware (`middleware.ts`) redirects unauthenticated requests to `/login?next=/dashboard/billing`.

**Role restriction:** Member-role users see the billing page in read-only mode — they can see the current plan and API key hints but cannot initiate Checkout, open the Customer Portal, or save/delete keys. Owner role required for all mutations. The UI hides/disables action buttons based on the user's role fetched server-side.

**No real-time updates on this page:** Subscription status and API key status do not need real-time updates. The page uses server-side data fetch on load. After Stripe Checkout completes, Stripe redirects back to `/dashboard/billing?success=1` which triggers a fresh server-side render with updated data.

---

## Data Fetching

All data is fetched server-side in `app/(dashboard)/billing/page.tsx` using the Supabase server client.

### Queries Run on Page Load

**Query 1: Current tenant with plan and subscription**
```sql
SELECT
  t.id,
  t.name,
  t.plan,
  t.status,
  t.stripe_customer_id,
  ts.stripe_subscription_id,
  ts.stripe_status,
  ts.current_period_start,
  ts.current_period_end,
  ts.cancel_at_period_end,
  ts.trial_end
FROM tenants t
LEFT JOIN tenant_subscriptions ts ON ts.tenant_id = t.id
WHERE t.id = $tenant_id
LIMIT 1
```

**Query 2: Current user's role in this tenant**
```sql
SELECT role
FROM tenant_members
WHERE tenant_id = $tenant_id AND user_id = auth.uid()
LIMIT 1
```

**Query 3: API keys (non-sensitive — only hints and status)**
```sql
SELECT
  id,
  key_type,
  key_hint,
  status,
  validated_at,
  created_at,
  updated_at
FROM tenant_api_keys
WHERE tenant_id = $tenant_id
ORDER BY key_type ASC
```

### Server Component Props Shape

```typescript
interface BillingPageProps {
  tenant: {
    id: string;
    name: string;
    plan: 'free' | 'starter' | 'pro';
    status: 'pending' | 'configured' | 'active' | 'suspended';
    stripe_customer_id: string | null;
  };
  subscription: {
    stripe_subscription_id: string | null;
    stripe_status: string | null; // 'active' | 'past_due' | 'canceled' | etc.
    current_period_start: string | null; // ISO timestamp
    current_period_end: string | null; // ISO timestamp
    cancel_at_period_end: boolean | null;
    trial_end: string | null;
  } | null;
  apiKeys: Array<{
    id: string;
    key_type: 'anthropic' | 'openai';
    key_hint: string;
    status: 'active' | 'invalid' | 'revoked';
    validated_at: string | null;
    created_at: string;
    updated_at: string;
  }>;
  userRole: 'owner' | 'admin' | 'member';
  // URL params from Stripe redirect
  checkoutSuccess: boolean; // from ?success=1
  checkoutCanceled: boolean; // from ?canceled=1
}
```

### URL Parameters Handled

| Parameter | Value | Source | Action |
|-----------|-------|--------|--------|
| `success` | `1` | Stripe Checkout redirect | Show success toast "Your plan has been upgraded!" |
| `canceled` | `1` | Stripe Checkout redirect | Show info toast "Checkout canceled — your plan was not changed." |
| `portal_return` | `1` | Stripe Customer Portal return | Show info toast "Welcome back to Daimon." |

After displaying the toast, the URL parameter is removed via `router.replace('/dashboard/billing')` to prevent re-showing on refresh.

---

## Layout Structure

The billing page uses the standard Dashboard Shell (sidebar + topbar + main content area). See [dashboard.md](./dashboard.md) for full shell spec.

```
<main class="page-content">                  <!-- p-8 -->
  <PageHeader />                              <!-- Title + subtitle -->

  <!-- Stripe redirect banners (conditional) -->
  <CheckoutSuccessBanner />                   <!-- shown when ?success=1 -->
  <CheckoutCanceledBanner />                  <!-- shown when ?canceled=1 -->
  <SuspendedAccountBanner />                  <!-- shown when tenant.status === 'suspended' -->
  <PastDueBanner />                           <!-- shown when subscription.stripe_status === 'past_due' -->

  <!-- Section 1: Subscription -->
  <section id="subscription">
    <SectionHeader title="Subscription" />
    <CurrentPlanCard />                        <!-- Displays active plan + billing period -->
    <PlanComparisonGrid />                     <!-- Free / Starter / Pro cards with CTAs -->
  </section>

  <!-- Divider -->
  <Divider />

  <!-- Section 2: API Keys -->
  <section id="api-keys">
    <SectionHeader
      title="API Keys"
      description="Daimon uses your API keys to run AI and classification tasks. Keys are stored encrypted and never exposed in plaintext."
    />
    <ApiKeyRow provider="anthropic" />         <!-- Required key -->
    <ApiKeyRow provider="openai" />            <!-- Optional key -->
  </section>
</main>
```

---

## Page Header

```html
<div class="page-header mb-8">
  <h1 class="text-[28px] font-[600] font-archivo text-navy leading-tight">
    Billing & Keys
  </h1>
  <p class="text-[14px] font-inter text-gray-500 mt-2 max-w-[640px]">
    Manage your Daimon plan and the API keys used to power your bot.
  </p>
</div>
```

| Property | Value |
|----------|-------|
| `h1` font | Archivo SemiBold (wdth 112.5), 28px, Navy `#0C1F40` |
| `h1` margin-bottom | 8px |
| Subtitle font | Inter Regular, 14px, `#6B7280` |
| Subtitle max-width | 640px |
| Header margin-bottom | 32px |

---

## Stripe Redirect Banners

These banners appear at the top of the page content area, above all sections, when the corresponding URL parameter is present. They are dismissed automatically after 5 seconds OR when the user clicks the X button.

### Checkout Success Banner

**Shown when:** `?success=1` in URL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✓  Your plan has been upgraded! You now have access to all [Plan] features. │  [×]
└─────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#D1FAE5` (Tailwind green-100) |
| Border | `1px solid #6EE7B7` (green-300) |
| Icon | CheckCircle, 20px, `#059669` (green-600) |
| Text | Inter 14px, `#065F46` (green-800) |
| Text content | "Your plan has been upgraded! You now have access to all [Plan] features." where [Plan] = current `tenant.plan` capitalized |
| Dismiss button | X icon, 16px, same text color, `onClick` clears param and dismisses |
| Auto-dismiss | After 5000ms |
| Padding | `12px 16px` |
| Border-radius | 0px (PyMC sharp corners) |

### Checkout Canceled Banner

**Shown when:** `?canceled=1` in URL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ℹ  Checkout canceled. Your plan was not changed.                            │  [×]
└─────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#EFF6FF` (blue-50) |
| Border | `1px solid #93C5FD` (blue-300) |
| Icon | InfoCircle, 20px, `#2563EB` (blue-600) |
| Text | Inter 14px, `#1E40AF` (blue-800) |
| Text content | "Checkout canceled. Your plan was not changed." |
| Dismiss button | X icon, 16px, same text color |
| Auto-dismiss | After 5000ms |

### Suspended Account Banner

**Shown when:** `tenant.status === 'suspended'`

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ⚠  Your account is suspended. Your bot is offline. Contact support@daimon.ai  │
│     to resolve billing issues and restore access.                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FEF2F2` (red-50) |
| Border | `1px solid #FCA5A5` (red-300) |
| Icon | AlertTriangle, 20px, `#DC2626` (red-600) |
| Text | Inter 14px, `#991B1B` (red-800) |
| No auto-dismiss | Must remain visible while account is suspended |
| Support link | `mailto:support@daimon.ai` with underline |

### Past Due Banner

**Shown when:** `subscription.stripe_status === 'past_due'`

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ⚠  Your last payment failed. Update your payment method to keep your bot       │
│     running. [Update Payment Method →]                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FFFBEB` (amber-50) |
| Border | `1px solid #FCD34D` (amber-300) |
| Icon | AlertTriangle, 20px, `#D97706` (amber-600) |
| Text | Inter 14px, `#92400E` (amber-800) |
| CTA button | "Update Payment Method →" — inline link, same color, underline, opens Customer Portal |
| No auto-dismiss | Must remain visible while past_due |

---

## Section 1: Subscription

### Section Header

```html
<div class="section-header mb-6">
  <h2 class="text-[20px] font-[600] font-archivo text-navy">Subscription</h2>
</div>
```

| Property | Value |
|----------|-------|
| Font | Archivo SemiBold (wdth 112.5), 20px, Navy |
| Margin-bottom | 24px |

---

### Current Plan Card

Displays the tenant's active plan with billing details and the primary management CTA.

```
┌────────────────────────────────────────────────────────────┐
│  CURRENT PLAN                                               │
│  ─────────────────────────────────────────────────         │
│  Free                            [Upgrade Plan →]          │
│                                                            │
│  • 1 Discord connection                                    │
│  • All tools included                                      │
│  • Bring your own Anthropic key                            │
│                                                            │
│  Free plan · No billing                                    │
└────────────────────────────────────────────────────────────┘
```

_(Example: Free plan state)_

```
┌────────────────────────────────────────────────────────────┐
│  CURRENT PLAN                                               │
│  ─────────────────────────────────────────────────         │
│  Starter                         [Manage Billing →]        │
│  $9 / month                                                │
│                                                            │
│  • Up to 3 Discord connections                             │
│  • All tools included                                      │
│  • Email support                                           │
│                                                            │
│  Renews January 14, 2027                                   │
└────────────────────────────────────────────────────────────┘
```

_(Example: Starter plan, active subscription)_

```
┌────────────────────────────────────────────────────────────┐
│  CURRENT PLAN                                               │
│  ─────────────────────────────────────────────────         │
│  Starter                         [Manage Billing →]        │
│  $9 / month                                                │
│                                                            │
│  • Up to 3 Discord connections                             │
│  • All tools included                                      │
│  • Email support                                           │
│                                                            │
│  ⚠ Cancels on January 14, 2027 · [Reactivate →]            │
└────────────────────────────────────────────────────────────┘
```

_(Example: Starter plan, cancel_at_period_end = true)_

#### Current Plan Card — Full Spec

| Property | Value |
|----------|-------|
| Background | White `#FFFFFF` |
| Border | `1px solid #E5E7EB` (Gray-200) |
| Border-radius | `0px` (PyMC sharp corners) |
| Padding | `24px` |
| Width | Full width of content area |
| Margin-bottom | `24px` |

**"CURRENT PLAN" label:**

| Property | Value |
|----------|-------|
| Font | Inter Medium, 11px, letter-spacing `0.08em`, uppercase, `#6B7280` (Gray-500) |
| Margin-bottom | `4px` |

**Plan name row:**

| Property | Value |
|----------|-------|
| Plan name font | Archivo SemiBold (wdth 112.5), 24px, Navy `#0C1F40` |
| Price font | Inter Regular, 14px, `#6B7280` — displayed below plan name as "$9 / month" or "$29 / month". Hidden for Free plan. |
| Horizontal layout | Plan name + price on left; CTA button on right; `justify-between`, `align-items: start` |

**Feature list:**

| Property | Value |
|----------|-------|
| Font | Inter Regular, 14px, Navy `#0C1F40` |
| Bullet | Aqua checkmark icon (`#B4E7DD`), 16px, inline-flex |
| Gap between items | `8px` vertical |
| Margin-top | `16px` |
| Margin-bottom | `16px` |

**Feature lists by plan:**

_Free plan:_
- ✓ 1 Discord connection
- ✓ All 50+ tools included
- ✓ Bring your own Anthropic key
- ✓ Community support

_Starter plan:_
- ✓ Up to 3 Discord connections
- ✓ All 50+ tools included
- ✓ Bring your own Anthropic key
- ✓ Email support

_Pro plan:_
- ✓ Unlimited Discord connections
- ✓ All 50+ tools included
- ✓ Bring your own Anthropic key
- ✓ Priority support
- ✓ SLA: 99.9% bot uptime guarantee

**Billing period line:**

Displayed at the bottom of the card, below the feature list.

| Condition | Text | Style |
|-----------|------|-------|
| Plan = free | "Free plan · No billing" | Inter 13px, `#6B7280` |
| stripe_status = 'active', cancel_at_period_end = false | "Renews [formatted date]" | Inter 13px, `#6B7280` |
| stripe_status = 'active', cancel_at_period_end = true | "⚠ Cancels on [formatted date]" + "[Reactivate →]" button | Warning amber text `#D97706` + link |
| stripe_status = 'trialing' | "Trial ends [formatted date] · [Add Payment Method →]" | Inter 13px, `#6B7280` + link |
| stripe_status = 'past_due' | "Payment failed · [Update Payment Method →]" | Red text `#DC2626` + link |
| stripe_status = 'canceled' | "Canceled · Access ends [formatted date]" | Red text `#DC2626` |
| stripe_status = 'unpaid' | "Unpaid · Bot access suspended" | Red text `#DC2626` |

Date format: Full month name, day, year — e.g., "January 14, 2027". Computed from `subscription.current_period_end` using `new Date(current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })`.

**CTA Button (right side of plan name row):**

| Current plan | stripe_status | Button label | Button action | Visible to |
|-------------|--------------|--------------|---------------|-----------|
| free | — | "Upgrade Plan →" | Initiates Stripe Checkout for Starter plan | owner only |
| starter | active | "Manage Billing →" | POST `/api/billing/portal` → redirect to Customer Portal | owner only |
| starter | past_due | "Update Payment →" | POST `/api/billing/portal` → redirect to Customer Portal | owner only |
| starter | canceled | "Reactivate →" | POST `/api/billing/checkout?plan=starter` → Checkout | owner only |
| pro | active | "Manage Billing →" | POST `/api/billing/portal` → redirect to Customer Portal | owner only |
| pro | past_due | "Update Payment →" | POST `/api/billing/portal` → redirect to Customer Portal | owner only |
| pro | canceled | "Reactivate →" | POST `/api/billing/checkout?plan=pro` → Checkout | owner only |

**If userRole = 'admin' or 'member':** The CTA button is hidden entirely. Below the feature list, a note shows: `"Only the workspace owner can manage billing."` in Inter 13px, `#6B7280`.

**CTA Button styles:**

| Property | Value |
|----------|-------|
| Background | Aqua `#B4E7DD` |
| Text color | Navy `#0C1F40` |
| Font | Inter Medium, 14px |
| Padding | `8px 16px` |
| Border-radius | `0px` |
| Border | None |
| Hover background | `#9ADDD1` (10% darker Aqua) |
| Active background | `#86D3C5` (20% darker Aqua) |
| Loading state | Disabled, spinner inline before text, text changes to "Opening..." |
| Cursor | pointer |
| Transition | `background-color 150ms ease` |

**"Manage Billing →" / "Update Payment →" loading:**
Clicking these triggers a POST to `/api/billing/portal` which returns a Stripe portal URL. While waiting (typically <1 second), the button shows a spinner and "Opening..." text, then `window.location.href = url` redirects the user. If the POST fails, the button resets and an error toast appears: "Could not open billing portal. Please try again."

**"Upgrade Plan →" loading:**
Clicking triggers a POST to `/api/billing/checkout?plan=starter`. While waiting, button shows spinner + "Opening...". On success, redirects to Stripe Checkout. On failure, error toast: "Could not initiate checkout. Please try again."

---

### Plan Comparison Grid

A 3-column grid (desktop) or vertical stack (mobile) showing all three plan options side-by-side, with upgrade/downgrade CTAs. Displayed below the Current Plan Card.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Free            │  │  Starter         │  │  Pro             │
│  $0/month        │  │  $9/month        │  │  $29/month       │
│                  │  │  $79/year (save) │  │  $249/year (save)│
│  ──────────────  │  │  ──────────────  │  │  ──────────────  │
│  ✓ 1 Discord     │  │  ✓ 3 Discord     │  │  ✓ Unlimited     │
│  ✓ All tools     │  │  ✓ All tools     │  │  ✓ All tools     │
│  ✓ BYOK Ant.     │  │  ✓ BYOK Ant.     │  │  ✓ BYOK Ant.     │
│  ✓ Community     │  │  ✓ Email support │  │  ✓ Priority      │
│  support         │  │                  │  │  ✓ SLA 99.9%     │
│                  │  │                  │  │                  │
│  [Current Plan]  │  │  [Upgrade →]     │  │  [Upgrade →]     │
│  (disabled)      │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

_(Example: Current plan = Free)_

#### Plan Card Specs

| Property | Value |
|----------|-------|
| Grid | `display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px` |
| Mobile grid | `grid-template-columns: 1fr` (stacked) |
| Tablet grid (768px) | `grid-template-columns: repeat(2, 1fr)` — Pro card goes full-width in 3rd position, or stacks below |
| Card background | White `#FFFFFF` |
| Card border (inactive) | `1px solid #E5E7EB` |
| Card border (current plan) | `2px solid #B4E7DD` (Aqua) |
| Card border-radius | `0px` |
| Card padding | `24px` |

**Plan name:**

| Property | Value |
|----------|-------|
| Font | Archivo SemiBold (wdth 112.5), 18px, Navy |
| Margin-bottom | `4px` |

**Monthly price:**

| Property | Value |
|----------|-------|
| Font | Archivo Expanded (wdth 125), 32px, weight 700, Navy |
| Subtext "/month" | Inter Regular, 14px, `#6B7280`, inline after price |
| Free plan price display | "$0" + "/month" |

**Annual price line:**

Shown below monthly price.

| Plan | Annual price line |
|------|------------------|
| Free | Not shown |
| Starter | "$79 / year — save $29" in Inter 12px, `#059669` (green) |
| Pro | "$249 / year — save $99" in Inter 12px, `#059669` (green) |

**Billing cycle toggle:**

A toggle above the plan grid switches all price displays between "Monthly" and "Annual."

```
                   Monthly  ⬤────  Annual
```

| Property | Value |
|----------|-------|
| Position | Top-right of the plan comparison section |
| Toggle label | "Monthly" left, "Annual" right |
| Toggle font | Inter 14px, `#6B7280` |
| Track background (off/monthly) | `#E5E7EB` |
| Track background (on/annual) | Aqua `#B4E7DD` |
| Thumb color | White `#FFFFFF` |
| Track dimensions | `44px × 24px` |
| Thumb dimensions | `20px × 20px` |
| Border-radius | `0px` (sharp toggle track and thumb) |
| Default state | Monthly (toggle off) |
| When toggled to Annual | Checkout session uses annual price IDs |

**Divider:**

```html
<hr class="border-[#E5E7EB] my-4" />
```

**Feature list in plan card:**

| Property | Value |
|----------|-------|
| Font | Inter Regular, 13px, `#374151` (Gray-700) |
| Icon | Checkmark circle, 14px, Aqua `#B4E7DD` |
| Gap | 6px vertical between items |
| Margin-top | 12px after divider |
| Margin-bottom | 20px before CTA |

**Feature list — Free:**
1. 1 Discord connection
2. All 50+ tools included
3. Bring your own Anthropic key
4. Community support

**Feature list — Starter:**
1. Up to 3 Discord connections
2. All 50+ tools included
3. Bring your own Anthropic key
4. Email support (response within 48 hours)

**Feature list — Pro:**
1. Unlimited Discord connections
2. All 50+ tools included
3. Bring your own Anthropic key
4. Priority support (response within 24 hours)
5. 99.9% bot uptime SLA

**CTA button per plan card:**

| Plan card | Current plan = free | Current plan = starter | Current plan = pro |
|-----------|--------------------|-----------------------|-------------------|
| Free card | "Current Plan" (disabled, gray border) | "Downgrade to Free" (ghost, destructive) | "Downgrade to Free" (ghost, destructive) |
| Starter card | "Upgrade to Starter →" (primary Aqua) | "Current Plan" (disabled, Aqua border) | "Downgrade to Starter" (ghost, gray) |
| Pro card | "Upgrade to Pro →" (primary Aqua) | "Upgrade to Pro →" (primary Aqua) | "Current Plan" (disabled, Aqua border) |

**CTA button styles:**

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary (Upgrade) | Aqua `#B4E7DD` | Navy `#0C1F40` | None | `#9ADDD1` |
| Current Plan (disabled) | White | `#9CA3AF` (gray-400) | `1px solid #E5E7EB` | No change |
| Ghost destructive (Downgrade) | White | `#DC2626` (red-600) | `1px solid #DC2626` | `rgba(220,38,38,0.05)` bg |
| Ghost (Downgrade to Starter from Pro) | White | `#6B7280` | `1px solid #D1D5DB` | `#F9FAFB` bg |

**Downgrade flows:**

Clicking any "Downgrade to X" button opens a **confirmation dialog** (see Confirmation Dialogs section). Users cannot downgrade mid-period — the downgrade takes effect at `current_period_end`. The dialog copy explains this clearly.

**Hidden for member/admin roles:** All upgrade/downgrade CTAs are hidden. Instead, a single note at the bottom of the plan grid reads: "Contact your workspace owner to change your plan." in Inter 13px, `#6B7280`.

**"Upgrade" Checkout flow:**

1. User clicks "Upgrade to Starter →" or "Upgrade to Pro →"
2. Button enters loading state (spinner + "Opening Checkout...")
3. Client calls `POST /api/billing/checkout` with body `{ plan: 'starter' | 'pro', billing: 'monthly' | 'annual' }`
4. API route creates Stripe Checkout Session with:
   - `customer`: existing Stripe Customer ID (or creates one if null)
   - `line_items`: price ID corresponding to selected plan + billing cycle
   - `mode`: `'subscription'`
   - `success_url`: `https://daimon.ai/dashboard/billing?success=1`
   - `cancel_url`: `https://daimon.ai/dashboard/billing?canceled=1`
   - `metadata`: `{ tenant_id: string }`
5. API route returns `{ url: string }` — the Stripe Checkout URL
6. Client does `window.location.href = url`
7. User completes checkout on Stripe-hosted page
8. Stripe redirects to `success_url` or `cancel_url`
9. Stripe sends `checkout.session.completed` webhook to `/api/webhooks/stripe`
10. Webhook handler updates `tenant_subscriptions` and `tenants.plan`

---

## Plan Pricing — Exact Values

These are the canonical price points used in the UI and for Stripe Product/Price creation.

| Plan | Monthly Price (USD) | Annual Price (USD) | Monthly Annual-Equivalent (USD) | Annual Savings |
|------|--------------------|--------------------|--------------------------------|----------------|
| Free | $0 | $0 | $0 | — |
| Starter | $9.00 | $79.00 | $6.58 | $29 |
| Pro | $29.00 | $249.00 | $20.75 | $99 |

**Stripe Product IDs** (to be created in Stripe Dashboard, stored as env vars):

| Product | Env Var | Description |
|---------|---------|-------------|
| Starter Monthly | `STRIPE_PRICE_STARTER_MONTHLY` | Recurring, $9.00/month |
| Starter Annual | `STRIPE_PRICE_STARTER_ANNUAL` | Recurring, $79.00/year |
| Pro Monthly | `STRIPE_PRICE_PRO_MONTHLY` | Recurring, $29.00/month |
| Pro Annual | `STRIPE_PRICE_PRO_ANNUAL` | Recurring, $249.00/year |

See [../integrations/stripe.md](../integrations/stripe.md) for full Product/Price creation instructions.

---

## Divider Between Sections

```html
<hr class="border-[#E5E7EB] my-8" />
```

---

## Section 2: API Keys

### Section Header

```html
<div class="section-header mb-6">
  <h2 class="text-[20px] font-[600] font-archivo text-navy">API Keys</h2>
  <p class="text-[14px] font-inter text-gray-500 mt-1 max-w-[640px]">
    Your API keys are encrypted at rest using AES-256 and never exposed in plaintext.
    You are charged directly by Anthropic for AI usage — Daimon only charges the platform fee.
  </p>
</div>
```

| Property | Value |
|----------|-------|
| `h2` font | Archivo SemiBold (wdth 112.5), 20px, Navy `#0C1F40` |
| Subtitle font | Inter Regular, 14px, `#6B7280` |
| Subtitle max-width | 640px |
| Margin-bottom | 24px |

### API Key Row Component

Each API key (Anthropic and OpenAI) is rendered as a `<ApiKeyRow>` component.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Anthropic API Key                                    REQUIRED          │
│  Used for all AI reasoning and tool orchestration.                      │
│                                                                        │
│  ┌──────────────────────────────────────────────┐  [Update]  [Delete]  │
│  │  sk-ant-a...b12c                             │                      │
│  │  ✓ Valid · Last validated Jan 5, 2026         │                      │
│  └──────────────────────────────────────────────┘                      │
└────────────────────────────────────────────────────────────────────────┘
```

_(Example: Anthropic key saved and valid)_

```
┌────────────────────────────────────────────────────────────────────────┐
│  Anthropic API Key                                    REQUIRED          │
│  Used for all AI reasoning and tool orchestration.                      │
│                                                                        │
│  ⚠ No key saved. The bot cannot run without an Anthropic API key.      │
│                                                                        │
│                                                              [Add Key]  │
└────────────────────────────────────────────────────────────────────────┘
```

_(Example: Anthropic key not saved)_

```
┌────────────────────────────────────────────────────────────────────────┐
│  Anthropic API Key                                    REQUIRED          │
│  Used for all AI reasoning and tool orchestration.                      │
│                                                                        │
│  ┌──────────────────────────────────────────────┐  [Update]  [Delete]  │
│  │  sk-ant-a...b12c                             │                      │
│  │  ✗ Invalid · Last attempted Jan 5, 2026       │                      │
│  └──────────────────────────────────────────────┘                      │
│  ⚠ This key was rejected by Anthropic. Update it to restore bot        │
│    functionality.                                                       │
└────────────────────────────────────────────────────────────────────────┘
```

_(Example: Anthropic key invalid)_

```
┌────────────────────────────────────────────────────────────────────────┐
│  OpenAI API Key                                      OPTIONAL           │
│  Used for classification tasks. Falls back to Claude Haiku if absent.  │
│                                                                        │
│  No OpenAI key saved. The bot will use Claude Haiku for classification │
│  if no OpenAI key is provided.                                         │
│                                                                        │
│                                                              [Add Key]  │
└────────────────────────────────────────────────────────────────────────┘
```

_(Example: OpenAI key not saved — no warning, informational only)_

#### ApiKeyRow Component — Full Spec

**Layout:**

```
flex, flex-col, gap-12px
background: white
border: 1px solid #E5E7EB
padding: 20px 24px
margin-bottom: 16px
border-radius: 0px
```

**Header row (key name + badge):**

| Element | Value |
|---------|-------|
| Key name font | Inter SemiBold, 15px, Navy `#0C1F40` |
| Badge "REQUIRED" | Solid Aqua `#B4E7DD` background, Navy text, 10px Inter uppercase, padding `2px 6px`, no radius |
| Badge "OPTIONAL" | `#F3F4F6` background, `#6B7280` text, same other styles |
| Gap between name and badge | 8px |

**Description text:**

| Property | Value |
|----------|-------|
| Font | Inter Regular, 13px, `#6B7280` |
| Margin-top | 2px |

**Description text per provider:**

| Provider | Description |
|----------|-------------|
| anthropic | "Used for all AI reasoning and tool orchestration. Required for the bot to operate." |
| openai | "Used for classification tasks. If not provided, the bot falls back to Claude Haiku for classification — slightly slower but fully functional." |

**Key hint box (when key is saved):**

```html
<div class="key-hint-box">
  <span class="key-hint-value">sk-ant-a...b12c</span>
  <span class="key-status">
    <!-- Status indicator -->
  </span>
</div>
```

| Property | Value |
|----------|-------|
| Box background | `#F9FAFB` (Gray-50) |
| Box border | `1px solid #E5E7EB` |
| Box padding | `10px 14px` |
| Box border-radius | `0px` |
| Key hint font | `font-mono`, 14px, `#374151` (Gray-700) |
| Full width | Yes (`width: 100%`) |

**Status indicator below key hint:**

| Status | Icon | Text | Color |
|--------|------|------|-------|
| `active` | CheckCircle 14px | "Valid · Last validated [relative time]" | `#059669` (green-600) |
| `invalid` | XCircle 14px | "Invalid · Last attempted [relative time]" | `#DC2626` (red-600) |
| `revoked` | XCircle 14px | "Revoked" | `#6B7280` (gray-500) |

Relative time format: "Jan 5, 2026" (not relative — absolute date for precision). Computed from `validated_at` using `toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`.

**Inline invalid key warning (below key hint box, when status = 'invalid'):**

```
⚠ This key was rejected by Anthropic/OpenAI. Please update it to restore bot functionality.
```

| Property | Value |
|----------|-------|
| Icon | AlertTriangle 14px, `#D97706` (amber-600) |
| Text | Inter 13px, `#92400E` (amber-800) |
| Background | `#FFFBEB` (amber-50) |
| Border | `1px solid #FCD34D` |
| Padding | `8px 12px` |
| Margin-top | `8px` |

**Empty state (when no key saved):**

| Condition | Message |
|-----------|---------|
| Anthropic — no key | "⚠ No Anthropic key saved. Your bot cannot run until you add one." — amber warning style, same as invalid warning box |
| OpenAI — no key | "No OpenAI key saved. The bot will use Claude Haiku for classification." — plain info text, `#6B7280`, no warning icon |

**Action buttons (right side of key row, aligned to bottom of row):**

| Key saved? | Buttons shown |
|------------|---------------|
| No | "Add Key" button (primary Aqua) |
| Yes, status = active | "Update" (ghost, Navy border) + "Delete" (ghost, red border) |
| Yes, status = invalid | "Update" (primary Aqua — more prominent) + "Delete" (ghost, red border) |
| Yes, status = revoked | "Add Key" (primary Aqua) |

**Button styles:**

| Button | Background | Text | Border | Hover |
|--------|-----------|------|--------|-------|
| "Add Key" | Aqua `#B4E7DD` | Navy | None | `#9ADDD1` |
| "Update" | White | Navy | `1px solid #0C1F40` | `#F9FAFB` bg |
| "Update" (invalid key) | Aqua `#B4E7DD` | Navy | None | `#9ADDD1` |
| "Delete" | White | Red `#DC2626` | `1px solid #DC2626` | `rgba(220,38,38,0.05)` bg |

All buttons: font Inter Medium 13px, padding `6px 14px`, border-radius `0px`.

**Hidden for member role:** All action buttons (Add Key, Update, Delete) are hidden when `userRole === 'member'`. The key hint and status are still visible (read-only).

---

## Add / Update Key Modal

Triggered by clicking "Add Key" or "Update" on an ApiKeyRow. Same modal used for both actions — title changes.

### Modal Spec

| Property | Value |
|----------|-------|
| Trigger | "Add Key" or "Update" button on ApiKeyRow |
| Component | `<ApiKeyModal>` (Client Component) |
| Overlay | `fixed inset-0 bg-black/50 z-50` |
| Panel background | White `#FFFFFF` |
| Panel dimensions | `width: 480px`, `max-width: 95vw`, auto height |
| Panel position | Centered (fixed, transform translate -50% -50%) |
| Panel border-radius | `0px` |
| Panel padding | `32px` |
| Close button | X icon top-right, 16px, `#6B7280`, hover Navy |

### Modal — Add/Update Anthropic Key

**Title (Add):** "Add Anthropic API Key"
**Title (Update):** "Update Anthropic API Key"

**Body text:**

```
Your Anthropic API key is used to power all AI reasoning in your bot.
You can find your API key in the Anthropic Console at console.anthropic.com.
```

Inter Regular, 14px, `#6B7280`

**Form fields:**

| Field | Label | Type | Placeholder | Required | Validation |
|-------|-------|------|-------------|----------|-----------|
| API Key | "Anthropic API Key" | `<input type="password">` | `sk-ant-api03-...` | Yes | See rules below |

**Anthropic API key validation rules (client-side, before submission):**

| Rule | Error message |
|------|---------------|
| Empty | "API key is required." |
| Does not start with `sk-ant-` | "This doesn't look like an Anthropic API key. It should start with 'sk-ant-'." |
| Length < 20 characters | "This key is too short to be valid." |
| Contains whitespace | "API key should not contain spaces or newlines." |

**Show/hide toggle:** A 👁 icon button inside the input's right edge. Toggles `type="password"` ↔ `type="text"`. Default: hidden (password).

**Server-side validation (on submit):**

The form calls `POST /api/billing/api-keys` which:
1. Validates key format server-side
2. Makes a test API call to Anthropic (`POST https://api.anthropic.com/v1/messages` with `max_tokens: 1`, model `claude-haiku-4-5-20251001`) using the provided key
3. If 401 returned: server returns error, modal shows: "This key was rejected by Anthropic. Double-check it and try again."
4. If 200 returned: key is stored in Vault, row upserted in `tenant_api_keys`, modal closes with success toast

**Submit button:**

| State | Label | Style |
|-------|-------|-------|
| Default | "Save Key" | Primary Aqua button |
| Loading | "Validating..." | Disabled, spinner, Aqua |
| Success | Modal closes | — |
| Error | "Save Key" | Re-enabled, error shown inline |

**Loading state explanation shown below button:**

When loading (validating), a note appears below the submit button:
```
Verifying your key with Anthropic — this takes about 2 seconds.
```
Inter 12px, `#6B7280`, shown only during loading state.

**Cancel button:**

"Cancel" button to the left of "Save Key". Ghost style (white bg, Navy border). Closes the modal without saving. If the user has typed anything, shows a browser-default `confirm()` dialog: "Discard unsaved changes?" before closing.

Actually — do NOT use `confirm()` (browser dialogs are not stylable). Instead: if input is non-empty and user clicks Cancel, show inline warning: "Your key won't be saved. Are you sure?" with [Discard] [Keep Editing] inline buttons. If input is empty, close directly.

---

### Modal — Add/Update OpenAI Key

**Title (Add):** "Add OpenAI API Key"
**Title (Update):** "Update OpenAI API Key"

**Body text:**

```
Your OpenAI key is used for text classification tasks. If not provided, the bot
uses Claude Haiku as a fallback — your bot works fully without this key.
```

Inter Regular, 14px, `#6B7280`

**Form fields:**

| Field | Label | Type | Placeholder | Required | Validation |
|-------|-------|------|-------------|----------|-----------|
| API Key | "OpenAI API Key" | `<input type="password">` | `sk-proj-...` or `sk-...` | Yes (once user opens modal) | See rules below |

**OpenAI API key validation rules (client-side):**

| Rule | Error message |
|------|---------------|
| Empty | "API key is required." |
| Does not start with `sk-` | "This doesn't look like an OpenAI API key. It should start with 'sk-'." |
| Length < 20 characters | "This key is too short to be valid." |
| Contains whitespace | "API key should not contain spaces or newlines." |

**Show/hide toggle:** Same 👁 pattern as Anthropic key input.

**Server-side validation (on submit):**

Calls `POST /api/billing/api-keys` with `key_type: 'openai'`.
1. Makes test API call to `GET https://api.openai.com/v1/models` (no model to load, just auth check) with `Authorization: Bearer <key>`
2. If 401 returned: "This key was rejected by OpenAI. Double-check it and try again."
3. If 200 returned: stored and confirmed.

**Submit button:** Same pattern as Anthropic modal — "Save Key", loading = "Validating...", success = modal closes + toast.

---

## Delete Key Confirmation Dialog

Triggered by clicking "Delete" on an ApiKeyRow. A custom dialog (NOT browser `confirm()`).

### Dialog — Delete Anthropic Key

```
┌──────────────────────────────────────────────────────────────┐
│  Delete Anthropic API Key                                [×]  │
│  ────────────────────────────────────────────────────────    │
│  Are you sure you want to delete your Anthropic API key?     │
│                                                              │
│  ⚠ Your bot will stop working immediately. It will not       │
│  reconnect until you add a new key.                          │
│                                                              │
│                          [Cancel]  [Delete Key]             │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Panel dimensions | `width: 440px`, `max-width: 95vw` |
| Title font | Archivo SemiBold (wdth 112.5), 18px, Navy |
| Body text | Inter Regular, 14px, `#374151` |
| Warning box | Amber style (`#FFFBEB` bg, `#FCD34D` border, `#92400E` text), Inter 13px |
| "Cancel" button | Ghost, Navy border |
| "Delete Key" button | Background `#DC2626` (red), White text |
| "Delete Key" loading | "Deleting...", disabled, spinner |

**Delete Key action:**

1. User clicks "Delete Key"
2. Button shows "Deleting..." with spinner
3. Client calls `DELETE /api/billing/api-keys/{key_id}`
4. API route: sets `tenant_api_keys.status = 'revoked'`, calls `vault.delete_secret()` on the vault_secret_id, then deletes the `tenant_api_keys` row
5. On success: dialog closes, `ApiKeyRow` updates to "no key" empty state, success toast: "Anthropic API key deleted."
6. On error: dialog stays open, error text shown: "Could not delete key. Please try again."

### Dialog — Delete OpenAI Key

Same layout. Warning text:

```
⚠ The bot will fall back to Claude Haiku for classification tasks.
  Your bot will continue to work normally.
```

Amber box only if `status === 'active'`. No warning if status is already invalid.

"Delete Key" button is still red (destructive action) but warning is softer.

---

## Confirmation Dialog — Downgrade Plan

Triggered by "Downgrade to Free" or "Downgrade to Starter" buttons in the Plan Comparison Grid.

### Dialog — Downgrade to Free

```
┌──────────────────────────────────────────────────────────────────┐
│  Downgrade to Free                                           [×]  │
│  ──────────────────────────────────────────────────────────      │
│  Your plan will be downgraded to Free at the end of your         │
│  current billing period on January 14, 2027.                     │
│                                                                  │
│  On the Free plan you will lose access to:                       │
│  • Discord connections above 1 (you currently have [N])          │
│  • Email support                                                 │
│                                                                  │
│  Additional connections will be disconnected automatically       │
│  at the period end.                                              │
│                                                                  │
│                          [Cancel]  [Confirm Downgrade]           │
└──────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Date displayed | Formatted `current_period_end` date — same format as billing period line |
| Connection count `[N]` | Fetched as part of page data: `SELECT count(*) FROM discord_connections WHERE tenant_id = $id AND status != 'disconnected'` |
| "Confirm Downgrade" button | Ghost red style — white bg, `#DC2626` text, `1px solid #DC2626` border |
| Loading state | "Confirming..." with spinner |

**Downgrade action:**

1. User clicks "Confirm Downgrade"
2. Calls `POST /api/billing/downgrade` with `{ target_plan: 'free' }`
3. API route calls Stripe API to set subscription `cancel_at_period_end = true` (or switch to free price if applicable)
4. On success: dialog closes, Current Plan Card refreshes (server-side re-render triggered via `router.refresh()`), info toast: "Plan downgrade scheduled. Your plan changes on [date]."
5. On error: dialog stays open, error text: "Could not schedule downgrade. Please try again or contact support."

### Dialog — Downgrade to Starter (from Pro)

```
┌──────────────────────────────────────────────────────────────────┐
│  Downgrade to Starter                                        [×]  │
│  ──────────────────────────────────────────────────────────      │
│  Your plan will be downgraded to Starter at the end of your      │
│  current billing period on January 14, 2027.                     │
│                                                                  │
│  On the Starter plan you will lose access to:                    │
│  • Discord connections above 3 (you currently have [N])          │
│  • Priority support                                              │
│  • 99.9% uptime SLA                                              │
│                                                                  │
│                          [Cancel]  [Confirm Downgrade]           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Toast Notifications

All mutations on the billing page show toast notifications. Toasts are rendered by the global `<Toaster>` component (using Sonner or similar) positioned at bottom-right.

| Action | Toast type | Message |
|--------|-----------|---------|
| Checkout redirect initiated | Info | "Opening Checkout..." |
| Checkout success (return from Stripe) | Success | "Your plan has been upgraded! You now have access to all [Plan] features." |
| Checkout canceled (return from Stripe) | Info | "Checkout canceled. Your plan was not changed." |
| Portal redirect initiated | Info | "Opening Billing Portal..." |
| API key saved successfully (add) | Success | "Anthropic API key saved." / "OpenAI API key saved." |
| API key updated successfully | Success | "Anthropic API key updated." / "OpenAI API key updated." |
| API key validation failed | Error | "Key rejected — please double-check it and try again." |
| API key deleted | Success | "Anthropic API key deleted." / "OpenAI API key deleted." |
| Downgrade scheduled | Info | "Plan downgrade scheduled for [date]." |
| Any network error | Error | "Something went wrong. Please try again." |

Toast styles:

| Type | Background | Text | Border | Duration |
|------|-----------|------|--------|---------|
| Success | `#D1FAE5` | `#065F46` | `1px solid #6EE7B7` | 4000ms |
| Error | `#FEE2E2` | `#991B1B` | `1px solid #FCA5A5` | 6000ms (errors stay longer) |
| Info | `#EFF6FF` | `#1E40AF` | `1px solid #93C5FD` | 4000ms |

All toasts: Inter 14px, padding `12px 16px`, border-radius `0px`, no drop shadow, dismiss button (X) on right.

---

## Loading States

### Full Page Loading Skeleton

Shown on initial server render before data arrives (extremely rare with SSR, but covers edge cases and navigation transitions).

```
<!-- Page header skeleton -->
<div class="h-[32px] w-[200px] bg-gray-200 animate-pulse mb-2" />
<div class="h-[20px] w-[400px] bg-gray-200 animate-pulse mb-8" />

<!-- Current Plan Card skeleton -->
<div class="h-[160px] bg-gray-100 animate-pulse border border-gray-200 mb-6" />

<!-- Plan Grid skeleton -->
<div class="grid grid-cols-3 gap-4 mb-8">
  <div class="h-[280px] bg-gray-100 animate-pulse border border-gray-200" />
  <div class="h-[280px] bg-gray-100 animate-pulse border border-gray-200" />
  <div class="h-[280px] bg-gray-100 animate-pulse border border-gray-200" />
</div>

<!-- API Keys skeleton -->
<div class="h-[100px] bg-gray-100 animate-pulse border border-gray-200 mb-4" />
<div class="h-[100px] bg-gray-100 animate-pulse border border-gray-200" />
```

`animate-pulse`: Tailwind's built-in pulse animation. All skeleton elements use `bg-gray-100` with `bg-gray-200` on the animated inner elements.

### Button Loading States

See "CTA Button" and modal specs above — all buttons with async actions show spinner + changed label text in loading state. Buttons are `disabled` during loading to prevent double-submission.

### Modal Submission Loading

During API key validation (POST to `/api/billing/api-keys`), the entire modal form is locked:
- All inputs: `disabled`
- "Cancel" button: `disabled` (user cannot dismiss during validation)
- Submit button: spinner + "Validating..."
- Note below button: "Verifying your key — this takes about 2 seconds."

---

## Empty States

### No Subscription Record

If `subscription === null` (free plan, never had paid subscription):

The Current Plan Card still renders — it shows the Free plan with "No billing" footer text. No empty state needed.

### No API Keys

If `apiKeys.length === 0` (brand new tenant):

Both ApiKeyRow components render in their "no key" empty states (described above). No special full-section empty state needed.

### Tenant Status = 'suspended'

If `tenant.status === 'suspended'`:
- Suspended Account Banner appears (see above)
- The plan comparison grid is hidden (no upgrading while suspended)
- Current Plan Card shows "Suspended" as a status badge next to plan name
- API key rows show read-only (no Add/Update/Delete buttons regardless of role)
- A note below the API key section: "Your account is suspended. Contact support@daimon.ai to resolve."

---

## Error States

### Checkout Session Creation Failure

If POST to `/api/billing/checkout` fails (500, network error):

- Button resets to original label
- Toast: "Could not start checkout. Please try again or contact support@daimon.ai."
- No redirect

### Customer Portal Session Creation Failure

If POST to `/api/billing/portal` fails:

- Button resets
- Toast: "Could not open billing portal. Please try again."

### API Key Validation — Anthropic 401

Server returns `{ error: 'invalid_key', provider: 'anthropic' }`:

- Modal stays open
- Inline error below input: "This key was rejected by Anthropic. Please verify it in the Anthropic Console and try again."
- Input border: `2px solid #DC2626`
- Submit button re-enabled

### API Key Validation — Anthropic 429 (Rate Limited)

Server returns `{ error: 'rate_limited', provider: 'anthropic' }`:

- Inline error: "Anthropic rate-limited the validation request. Please wait a moment and try again."
- Submit button re-enabled after 5 seconds (automatically)

### API Key Validation — Anthropic 5xx

Server returns `{ error: 'provider_error', provider: 'anthropic' }`:

- Inline error: "Anthropic returned an unexpected error. Your key may be valid — wait a few minutes and try again."
- Submit button re-enabled

### API Key Validation — OpenAI 401

Server returns `{ error: 'invalid_key', provider: 'openai' }`:

- Inline error: "This key was rejected by OpenAI. Please verify it in the OpenAI Platform dashboard."
- Input border: `2px solid #DC2626`

### API Key Delete Failure

If DELETE to `/api/billing/api-keys/{id}` fails:

- Dialog stays open
- Error text below buttons: "Could not delete key. Please try again."
- "Delete Key" button re-enabled

### Page Data Fetch Failure

If the server-side Supabase query fails:

- Full page shows error state:
```
<div class="flex flex-col items-center justify-center h-64 gap-4">
  <AlertTriangle size={40} className="text-red-400" />
  <p className="text-[16px] font-inter text-navy">Could not load billing data.</p>
  <p className="text-[14px] text-gray-500">Please refresh the page. If this persists, contact support@daimon.ai.</p>
  <button onClick={() => window.location.reload()}>Refresh</button>
</div>
```

---

## Responsive Behavior

### Desktop (≥ 1280px)

- Full layout as specified above
- 3-column plan comparison grid
- Current Plan Card full-width
- ApiKeyRow: hint box + buttons in single row

### Tablet (768px – 1279px)

- Plan comparison grid: `grid-template-columns: repeat(2, 1fr)` — Free and Starter side-by-side, Pro card full-width below
- Current Plan Card: plan name + CTA button stack vertically on tablet if text overflows
- ApiKeyRow: hint box full-width, buttons below (stacked row)
- Page padding: `p-6` instead of `p-8`

### Mobile (< 768px)

- Plan comparison grid: `grid-template-columns: 1fr` — all three cards stacked vertically
- Current plan card: full-width, CTA button below feature list
- ApiKeyRow:
  - Key name + badge: stacked column
  - Key hint box full-width
  - "Update" + "Delete" buttons stack horizontally below hint box (`flex, gap-8px`)
- Add/Update Key modal: `width: 95vw`, `margin: 16px`, inputs full-width
- Confirmation dialogs: `width: 95vw`
- Billing cycle toggle: moves above plan cards, full-width justified
- Minimum touch targets: 44px height for all buttons

---

## Accessibility

### ARIA Labels and Roles

| Element | ARIA |
|---------|------|
| Plan comparison grid | `role="list"` (each card `role="listitem"`) |
| Current Plan Card | `aria-label="Current plan: [plan name]"` |
| "Upgrade Plan →" button | `aria-label="Upgrade to [Starter/Pro] plan"` |
| "Manage Billing →" button | `aria-label="Manage billing in Stripe portal"` |
| Billing cycle toggle | `role="switch"`, `aria-checked="false/true"`, `aria-label="Billing cycle: monthly or annual"` |
| ApiKeyRow Anthropic | `aria-label="Anthropic API key management"` (wrapping section) |
| ApiKeyRow OpenAI | `aria-label="OpenAI API key management"` (wrapping section) |
| Key hint display | `aria-label="Masked API key: [hint value]"` |
| Key status (valid) | `role="status"`, `aria-label="Key status: valid, last validated [date]"` |
| Key status (invalid) | `role="alert"`, `aria-label="Key status: invalid"` |
| "Add Key" button | `aria-label="Add Anthropic API key"` / `aria-label="Add OpenAI API key"` |
| "Update" button | `aria-label="Update Anthropic API key"` / `aria-label="Update OpenAI API key"` |
| "Delete" button | `aria-label="Delete Anthropic API key"` / `aria-label="Delete OpenAI API key"` |
| Show/hide password toggle | `aria-label="Show API key"` / `aria-label="Hide API key"`, `aria-pressed="true/false"` |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title-id"` |
| Modal title | `id="modal-title-id"` |
| Confirmation dialog | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` |
| Success/Error banners | `role="alert"` |
| Toast notifications | `role="status"` (success/info) or `role="alert"` (error) |

### Keyboard Navigation

| Element | Keys |
|---------|------|
| Page sections | Tab navigates through all interactive elements in DOM order |
| Plan cards | Tab to CTA button within each card; Enter/Space activates |
| Billing cycle toggle | Tab to focus, Space to toggle |
| ApiKeyRow buttons | Tab order: "Add Key" or "Update" then "Delete" |
| Modal (when open) | Focus trapped within modal; Escape closes modal; Tab cycles through form fields and buttons |
| Show/hide toggle in input | Tab reaches it; Space/Enter toggles |
| Delete confirmation dialog | Focus trapped; Escape closes; Enter on focused button activates |
| Stripe redirect banners | Dismiss button reachable via Tab; Enter/Space dismisses |

### Focus Management

- When a modal opens: focus moves to the first interactive element (key input field)
- When a modal closes (on success or cancel): focus returns to the button that opened it
- When a confirmation dialog opens: focus moves to the "Cancel" button (safer default for destructive dialogs)
- When a confirmation dialog closes: focus returns to the triggering button

### Color Contrast

All text/background combinations in this page meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text):

| Pairing | Contrast ratio |
|---------|---------------|
| Navy `#0C1F40` on White `#FFFFFF` | 16.75:1 ✓ |
| Navy `#0C1F40` on Aqua `#B4E7DD` | 7.08:1 ✓ |
| `#6B7280` on White | 4.62:1 ✓ |
| `#065F46` on `#D1FAE5` | 7.42:1 ✓ |
| `#991B1B` on `#FEE2E2` | 7.03:1 ✓ |
| `#92400E` on `#FFFBEB` | 7.79:1 ✓ |
| `#1E40AF` on `#EFF6FF` | 7.23:1 ✓ |

---

## API Routes Used by This Page

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/billing/checkout` | Create Stripe Checkout Session. Body: `{ plan: 'starter' | 'pro', billing: 'monthly' | 'annual' }`. Returns `{ url: string }`. |
| POST | `/api/billing/portal` | Create Stripe Customer Portal Session. No body. Returns `{ url: string }`. |
| POST | `/api/billing/downgrade` | Schedule plan downgrade. Body: `{ target_plan: 'free' | 'starter' }`. Returns `{ scheduled_for: string }`. |
| POST | `/api/billing/api-keys` | Save or update an API key. Body: `{ key_type: 'anthropic' | 'openai', api_key: string }`. Returns `{ id: string, key_hint: string, validated_at: string }`. |
| DELETE | `/api/billing/api-keys/:id` | Delete an API key. No body. Returns `{ deleted: true }`. |

Full request/response shapes and error codes: see [../api/routes.md](../api/routes.md#billing).

---

## Cross-References

- [database/schema.md](../database/schema.md) — `tenant_subscriptions`, `tenant_api_keys`, `tenants` tables
- [database/vault-encryption.md](../database/vault-encryption.md) — How API keys are encrypted/decrypted
- [integrations/stripe.md](../integrations/stripe.md) — Stripe Product/Price creation, Checkout Session params, Customer Portal config
- [api/routes.md](../api/routes.md#billing) — Full API route specs for `/api/billing/*`
- [api/webhooks.md](../api/webhooks.md) — Stripe webhook handler that updates subscription status
- [premium/tiers.md](../premium/tiers.md) — Feature gating rules per plan
- [premium/pricing.md](../premium/pricing.md) — Full pricing details, Stripe price IDs
- [frontend/dashboard.md](./dashboard.md) — Dashboard shell (sidebar, topbar) used by this page
- [frontend/settings-page.md](./settings-page.md) — Settings page for Discord connection management
- [multi-tenant/byok-key-routing.md](../multi-tenant/byok-key-routing.md) — How the bot uses the tenant's Anthropic API key
- [deployment/environment.md](../deployment/environment.md) — Stripe env vars referenced here

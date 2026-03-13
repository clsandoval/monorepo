# Premium Tiers — Daimon SaaS

> Aspect: 5.1 (Stripe integration — tier definitions)
> Written: 2026-03-13
> Related: [pricing.md](./pricing.md), [features-by-tier.md](./features-by-tier.md), [../integrations/stripe.md](../integrations/stripe.md), [../database/schema.md](../database/schema.md)

---

## Overview

Daimon has three tiers: Free, Starter, and Pro. All tiers use BYOK (Bring Your Own Key) — the user provides their own Anthropic API key. The platform fee pays for infrastructure, not AI compute.

| Tier | Monthly Price | Annual Price | Discord Connections | Support | Bot Uptime SLA |
|------|-------------|-------------|---------------------|---------|---------------|
| Free | $0 | $0 | 1 | Community (Discord) | None |
| Starter | $9/mo | $79/yr ($6.58/mo) | Up to 3 | Email (reply within 2 business days) | None |
| Pro | $29/mo | $249/yr ($20.75/mo) | Unlimited | Priority (reply within 1 business day) | 99.9% uptime guarantee |

**Annual savings:**
- Starter: $9 × 12 = $108/yr vs $79/yr → **save $29 (27%)**
- Pro: $29 × 12 = $348/yr vs $249/yr → **save $99 (28%)**

---

## Tier Definitions

### Free

**Target user:** Individual developers, hobbyists, people evaluating Daimon before committing.

**Cost:** $0 forever. No credit card required.

**Key constraint:** 1 Discord connection (1 bot token in 1 guild). This is the main upgrade motivator.

**Included features:**
- 1 Discord bot connection (1 guild ID + 1 bot token)
- All 50+ Decision Orchestrator tools (no tool gating — all tools available)
- Bring your own Anthropic API key (required)
- Bring your own OpenAI API key (optional, for classification)
- All service integrations: GitHub, Google, Linear, Toggl, Dub, Fly.io, LinkedIn, Google Analytics (user must connect their own OAuth / API keys)
- Dashboard with bot status monitoring
- Community support (Discord server)

**Limitations:**
- Maximum 1 Discord connection. If user tries to add a second connection, UI shows upgrade prompt.
- No email support (community only)
- No uptime SLA

**Free tier DB state:**
- `tenants.plan = 'free'`
- `tenant_subscriptions.stripe_subscription_id = NULL`
- `tenant_subscriptions.status = 'active'` (sentinel value)
- `tenants.stripe_customer_id = NULL` (until first Checkout initiated)

---

### Starter

**Target user:** Power users, small teams, community managers who run multiple Discord servers.

**Cost:** $9/month or $79/year

**Key differentiator over Free:** 3 Discord connections (3 separate bot instances in up to 3 guilds) + email support.

**All Free features, plus:**
- Up to 3 Discord connections (3 separate guild+token pairs, each running as independent bot instance)
- Email support: support@daimon.ai, replies within 2 business days

**DB state:**
- `tenants.plan = 'starter'`
- `tenant_subscriptions.status = 'active'` (or 'trialing', 'past_due', etc.)
- `tenant_subscriptions.stripe_subscription_id` populated

---

### Pro

**Target user:** Agencies, large communities, power operators running multiple active Discord servers with uptime requirements.

**Cost:** $29/month or $249/year

**Key differentiator over Starter:** Unlimited Discord connections + priority support + uptime SLA.

**All Starter features, plus:**
- Unlimited Discord connections (no cap on guild+token pairs)
- Priority email support: support@daimon.ai, replies within 1 business day
- 99.9% bot uptime SLA (monthly; excludes scheduled maintenance and third-party outages)
  - SLA calculation: (total minutes - downtime minutes) / total minutes × 100
  - Downtime: period where bot is in `error` or `disconnected` status for >5 consecutive minutes, caused by Daimon infrastructure failures (not user's bot token, Discord outages, or Fly.io platform issues)
  - Remedy: service credit equal to 10% of monthly fee per 0.1% downtime below SLA, up to 30% of monthly fee

**DB state:**
- `tenants.plan = 'pro'`
- `tenant_subscriptions.status = 'active'`
- `tenant_subscriptions.stripe_subscription_id` populated

---

## What Is NOT Tier-Gated

The following are available on ALL tiers, including Free. This is the "open buffet" model — no feature gating except Discord connection count.

- All 50+ tool modules (Discord, Toggl, GitHub, Google, Linear, Fly, Dub, LinkedIn, Google Analytics, Onyx, Bluedot, ACP, Decision Hub, Credentials, all MCP tools)
- Service connections (user connects their own API keys/OAuth)
- Dashboard, analytics, settings pages
- Team member management (inviting admins/members — though team invite is deferred to v2)
- Audit logs
- Data retention (same retention policy across all tiers)

---

## Connection Limit Enforcement

Discord connection limits are enforced at the API layer (not the database layer — the DB has no hard constraint on number of connections per tenant).

**Enforcement point:** `POST /api/connections/discord` — when a user tries to add a new Discord connection, the API route checks the current count and the tenant's plan:

```typescript
const connectionCount = await supabase
  .from('discord_connections')
  .select('id', { count: 'exact' })
  .eq('tenant_id', tenantId)
  .not('status', 'eq', 'suspended'); // suspended connections don't count

const maxConnections = {
  free: 1,
  starter: 3,
  pro: Infinity,
}[tenant.plan];

if (connectionCount.count >= maxConnections) {
  return NextResponse.json({
    error: 'CONNECTION_LIMIT_REACHED',
    message: `Your ${tenant.plan} plan supports up to ${maxConnections} Discord connection${maxConnections === 1 ? '' : 's'}. Upgrade to add more.`,
    current_count: connectionCount.count,
    max_connections: maxConnections,
    upgrade_url: '/dashboard/billing',
  }, { status: 403 });
}
```

**UI behavior:** The "Add Discord Connection" button on the Settings page checks if `discord_connections.length >= maxConnectionsForPlan`. If yes:
- Button is disabled (not hidden)
- Tooltip: "Your Free plan supports 1 Discord connection. [Upgrade to Starter →] to add more."
- Clicking the disabled button does nothing

---

## Plan Downgrade Behavior

When a user cancels (plan moves from Starter/Pro → Free):

1. The subscription enters `cancel_at_period_end = true` state — bot continues running until `current_period_end`
2. At period end, Stripe fires `customer.subscription.deleted`
3. Webhook handler sets `plan = 'free'`
4. The `sync_tenant_plan` trigger propagates to `tenants.plan`
5. The bot reads the plan change via Supabase Realtime → enforces 1 connection limit

**Excess connections on downgrade:** If a Starter/Pro user has 2+ connections and downgrades to Free:
- The connections are NOT deleted automatically
- The bot remains connected to all existing connections until the period ends
- After period end and downgrade, the bot does NOT automatically disconnect excess connections
- The bot enforces: on the next startup/reconnect cycle, it will only connect the oldest/first active connection and suspend the rest
- The dashboard shows a warning: "Your plan supports 1 connection. [Select which connection to keep →] or [Upgrade to keep all.]"
- Excess connections are marked `status = 'suspended'` by the bot's plan enforcement logic
- User can explicitly unsuspend/re-enable one connection (which suspends the active one)

---

## Upgrade Flow (Free → Starter or Free → Pro)

1. User clicks "Upgrade Plan →" on billing page
2. Client POSTs to `/api/billing/checkout?plan=starter&cycle=monthly`
3. API creates Stripe Checkout Session with `success_url=/dashboard/billing?success=1`
4. API returns `{ url: "https://checkout.stripe.com/pay/..." }`
5. Client redirects: `window.location.href = url`
6. User enters card details in hosted Stripe Checkout
7. Stripe redirects to `/dashboard/billing?success=1`
8. Stripe fires `checkout.session.completed` → `customer.subscription.created`
9. Webhook handler updates `tenant_subscriptions` → trigger updates `tenants.plan`
10. Dashboard now shows new plan

---

## Upgrade Flow (Starter → Pro or Pro → Starter)

Done via Stripe Customer Portal (not a direct Checkout). User clicks "Manage Billing →":
1. Client POSTs to `/api/billing/portal`
2. API creates Customer Portal session with `return_url=/dashboard/billing?portal_return=1`
3. API returns portal URL; client redirects
4. User changes plan in Stripe Customer Portal
5. Stripe fires `customer.subscription.updated` with new price ID
6. Webhook updates `tenant_subscriptions.plan` to new tier
7. Trigger propagates to `tenants.plan`
8. User returns to `/dashboard/billing?portal_return=1`
9. Dashboard now shows updated plan

---

## Trial Logic

Trials are NOT enabled at launch. No `trial_period_days` is set on Stripe prices. If trials are enabled in the future, they would be configured at the price level in Stripe and the existing `trial_start`/`trial_end` columns in `tenant_subscriptions` would capture them automatically.

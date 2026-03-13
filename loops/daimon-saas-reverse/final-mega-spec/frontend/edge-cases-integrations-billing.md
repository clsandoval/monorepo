# Edge Cases: Integrations & Billing — Exhaustive Specification

> Aspect: 7.3b
> Last updated: 2026-03-13
> Covers: Stripe downtime, OAuth tokens revoked externally, bot crash mid-operation, slow/dropped connections, API key invalidation, billing lifecycle failures, external service degradation
> Related: [edge-cases-auth-session.md](./edge-cases-auth-session.md), [../integrations/stripe.md](../integrations/stripe.md), [../integrations/oauth-services.md](../integrations/oauth-services.md), [../integrations/discord.md](../integrations/discord.md), [../integrations/api-key-services.md](../integrations/api-key-services.md), [../multi-tenant/health-monitoring.md](../multi-tenant/health-monitoring.md)

---

## Overview

This document specifies every non-happy-path scenario involving external integrations (Stripe, Discord, OAuth services, API key services) and billing lifecycle events. Every scenario has:

- **Trigger condition** — what causes it
- **Detection mechanism** — how the system knows
- **User-facing behavior** — what they see
- **System behavior** — what code must do
- **Recovery path** — how the user can get back on track
- **Bot impact** — whether the running bot is affected

---

## Part 1: Stripe Failures & Degradation

### 1.1 Stripe API Down — Checkout Session Creation Fails

**Trigger:** User clicks "Upgrade to Starter" or "Upgrade to Pro" on the Billing page. The Next.js API route `POST /api/billing/create-checkout-session` calls `stripe.checkout.sessions.create(...)` but Stripe returns a 5xx error or the request times out (>30 seconds).

**Detection:** The `stripe` Node.js SDK throws a `Stripe.errors.StripeAPIError` or `Stripe.errors.StripeConnectionError`. Detected at the API route level with a try/catch.

**User-facing behavior:**
- The "Upgrade" button is in loading state (spinner, disabled) while the request is in flight.
- The Next.js API route returns `500 { error: "billing_unavailable" }`.
- The client receives the error and shows a full-width `AlertBanner` (variant: `error`) below the page header:
  - **Icon:** `ExclamationTriangle` (red, 20px)
  - **Title:** "Billing is temporarily unavailable"
  - **Body:** "We're unable to connect to our payment provider right now. Please try again in a few minutes. If this persists, check [Stripe Status](https://status.stripe.com)."
  - **Actions:** "Try Again" (primary button), "Dismiss" (ghost button)
- The "Upgrade" button returns to its normal clickable state.
- The user is NOT redirected anywhere. They stay on the Billing page.

**System behavior:**
1. API route catches the Stripe error.
2. Logs the error to stderr with `stripe_error_type`, `stripe_error_code`, and `tenant_id`.
3. Returns `HTTP 500` with body `{ error: "billing_unavailable", message: "Payment provider temporarily unavailable. Please try again." }`.
4. The `tenant_subscriptions` table is NOT modified. No subscription state change occurs.
5. No retry logic on the server side — user must manually retry.

**Recovery path:** User clicks "Try Again" → button goes back to loading → re-attempts checkout session creation → if Stripe has recovered, user is redirected to Stripe Checkout as normal.

**Bot impact:** None. Bot continues running. Subscription status is unchanged.

---

### 1.2 Stripe Webhook Delivery Failure — Subscription Event Not Received

**Trigger:** Stripe successfully processes a subscription event (e.g., `customer.subscription.updated`, `invoice.paid`) but fails to deliver the webhook to `POST /api/webhooks/stripe`. This can happen if the Next.js deployment is down, the endpoint returns 5xx, or Stripe's retry budget is exhausted (3 days).

**Detection:** The webhook never arrives, OR arrives but fails signature verification, OR returns 5xx from the handler. Detected passively: the `tenant_subscriptions.stripe_subscription_status` in the database falls out of sync with Stripe's actual subscription status.

**User-facing behavior:**
- While webhook is undelivered: The Billing page shows the **old** subscription status from the database. No visible indication to the user (they don't know the event was missed).
- If the user visits the Billing page within 3 days: The status may show "Active" while their card was declined in Stripe. They may believe their plan is still active while Stripe has entered `past_due`.
- There is NO real-time sync mechanism other than webhooks. The dashboard's "Bot Status" will still reflect `discord_connections.status` from the bot's heartbeat, not the billing state.

**System behavior (reconciliation):**
A background Supabase Edge Function (`reconcile-stripe-subscriptions`) runs on a cron schedule (every 6 hours, see [../deployment/environment.md](../deployment/environment.md)):
1. Fetches all rows from `tenant_subscriptions` where `stripe_subscription_id IS NOT NULL`.
2. For each row, calls `stripe.subscriptions.retrieve(stripe_subscription_id)`.
3. Compares `stripe_subscription_status` in DB to the live Stripe status.
4. If they differ, updates `tenant_subscriptions` to match Stripe's status and logs the reconciliation event to `admin_audit_log`.
5. If Stripe returns 404 (subscription deleted), marks the tenant as `free` plan and logs.

**Stripe retry behavior (for reference):**
Stripe retries failed webhooks at: 5 min → 30 min → 2 hours → 5 hours → 10 hours → 3 days. After 3 days, the event is dropped and only the 6-hour reconciliation cron will catch it.

**Recovery path:** Reconciliation cron runs and corrects the database. If the discrepancy is in the user's favor (e.g., they cancelled but we missed it), the reconciliation puts them on Free. If it's in Daimon's favor (e.g., they paid but we missed it), the reconciliation activates their plan.

**Bot impact:** If the tenant's plan downgrades due to missed webhook and subsequent reconciliation, the bot enforces the new tier's tool limits on the next tool invocation. No immediate disconnect unless connections exceed the new plan's limit.

---

### 1.3 Stripe Webhook Signature Verification Failure

**Trigger:** A POST request arrives at `POST /api/webhooks/stripe` with an invalid `Stripe-Signature` header. This can happen from:
1. An attacker sending a fake webhook
2. A misconfigured `STRIPE_WEBHOOK_SECRET` env var
3. The request body being inadvertently parsed by Next.js middleware before reaching the webhook handler

**Detection:** `stripe.webhooks.constructEvent(body, sig, secret)` throws a `Stripe.errors.StripeSignatureVerificationError`.

**User-facing behavior:** None visible to users.

**System behavior:**
1. Webhook handler catches `StripeSignatureVerificationError`.
2. Logs a `warn` message with the IP address and timestamp.
3. Returns `HTTP 400` with body `{ error: "invalid_signature" }`.
4. Does NOT process the event.
5. Does NOT update the database.

**Critical implementation note:** The webhook route MUST use `req.text()` (raw bytes) to read the body, NOT a parsed JSON body. Next.js `App Router` API routes must explicitly configure `export const config = { api: { bodyParser: false } }` (Pages Router) OR use `await req.text()` directly in the route handler. If `JSON.parse()` runs first, the signature check will always fail because the raw bytes have been transformed.

**Recovery path:** If this is a legitimate Stripe event with a bad signature (misconfigured secret), correct `STRIPE_WEBHOOK_SECRET` in Vercel env vars and redeploy. Then use Stripe Dashboard → Webhooks → endpoint → "Resend" to replay the failed events.

**Bot impact:** None directly. If a subscription event is lost due to signature failure, the reconciliation cron (see 1.2) will correct the database within 6 hours.

---

### 1.4 Stripe Customer Portal Fails to Open

**Trigger:** User clicks "Manage Subscription" or "Cancel Plan" on the Billing page. The API route `POST /api/billing/create-portal-session` calls `stripe.billingPortal.sessions.create(...)` but Stripe is unavailable or returns an error.

**Detection:** `stripe.billingPortal.sessions.create()` throws an error or times out.

**User-facing behavior:**
- The "Manage Subscription" button is in loading state while the request is in flight.
- On failure: Toast notification (variant: `error`, duration: 8 seconds):
  - **Message:** "Unable to open billing portal. Please try again or contact support at support@daimon.ai."
- Button returns to clickable state.

**System behavior:**
1. API route catches the error.
2. Returns `HTTP 500 { error: "portal_unavailable" }`.
3. Client shows error toast.

**Recovery path:** User retries in a few minutes, or contacts support who can manually process cancellation via Stripe Dashboard.

**Bot impact:** None. Bot continues running.

---

### 1.5 Payment Method Declined — Subscription Enters `past_due`

**Trigger:** Stripe attempts to charge the customer's payment method for renewal (monthly/annual), and the charge fails. Stripe marks the subscription as `past_due`.

**Detection:** Stripe webhook delivers `invoice.payment_failed` event with `subscription.status = "past_due"`. Webhook handler processes it and updates `tenant_subscriptions.stripe_subscription_status = 'past_due'`.

**User-facing behavior:**
- On next dashboard load: Full-width `AlertBanner` (variant: `warning`) at the top of every dashboard page:
  - **Icon:** `CreditCard` (amber, 20px)
  - **Title:** "Payment failed — your subscription is at risk"
  - **Body:** "We couldn't charge your payment method. Update your payment details to keep your plan active. Your bot will continue running for [X] more days."
  - **Action:** "Update Payment Method" (primary button, links to Customer Portal)
  - **Dismissible:** NO. This banner persists until the subscription leaves `past_due`.
- The Billing page shows the plan with a `past_due` badge (amber, text: "Payment Failed").
- Bot continues running during the `past_due` grace period (Stripe default: 7 days, but configurable in Stripe Dashboard → Settings → Billing → Subscription settings → "Retry schedule").

**System behavior (on `invoice.payment_failed` webhook):**
1. Update `tenant_subscriptions.stripe_subscription_status = 'past_due'`.
2. Update `tenant_subscriptions.updated_at = NOW()`.
3. Log to `admin_audit_log`: `{ action: 'subscription_payment_failed', tenant_id, stripe_subscription_id, invoice_id }`.
4. Do NOT downgrade the tenant immediately. Bot continues with current plan features.

**System behavior (on `customer.subscription.deleted` webhook, after grace period expires):**
1. Update `tenant_subscriptions.plan_id = 'free'`, `stripe_subscription_status = 'canceled'`.
2. Log to `admin_audit_log`.
3. The bot enforces Free plan limits on next tool invocation. If the tenant has more than 1 Discord connection, the excess connections are NOT automatically disconnected — they remain in the database with `status = 'active'` but the bot enforces the feature gate. The NEXT heartbeat cycle the bot receives the updated tenant config via Realtime and sets excess connections to `status = 'inactive'`.

**Recovery path:**
1. User clicks "Update Payment Method" → Stripe Customer Portal opens.
2. User updates card and Stripe retries the invoice.
3. On successful payment: `invoice.paid` webhook arrives → `tenant_subscriptions.stripe_subscription_status = 'active'`.
4. `AlertBanner` disappears on next page load.

**Stripe retry schedule (default):** Day 1 → Day 3 → Day 5 → Day 7 → cancellation. Configurable in Stripe Dashboard.

**Bot impact:** Bot continues running during `past_due`. Bot disconnects only after `customer.subscription.deleted` is received (subscription fully canceled after grace period).

---

### 1.6 Plan Downgrade — Pro to Starter (Excess Connections)

**Trigger:** User downgrades from Pro (unlimited connections) to Starter (max 3 connections) via the Customer Portal. The `customer.subscription.updated` webhook fires with new `plan=starter`.

**Detection:** Webhook handler reads the new plan from the price's metadata (`plan=starter`). Queries `discord_connections` count for the tenant.

**System behavior:**
1. Update `tenant_subscriptions.plan_id = 'starter'`.
2. Count active `discord_connections` for this tenant.
3. If count > 3:
   - Sort connections by `created_at` ascending (oldest connections are kept).
   - Set the newest connections beyond the limit to `status = 'pending_disconnect'` (a new status value, see [../database/schema.md](../database/schema.md)).
   - Log each change to `admin_audit_log`.
   - Insert a notification record into `tenant_notifications` (if this table exists; if not, use the `AlertBanner` mechanism described below).
4. The bot receives the plan update via Supabase Realtime and disconnects the `pending_disconnect` connections gracefully (sends no message to Discord, just closes the websocket).

**User-facing behavior:**
- On next dashboard load: `AlertBanner` (variant: `warning`):
  - **Title:** "2 Discord connections were deactivated"
  - **Body:** "Your Starter plan supports up to 3 connections. Your 2 most recently added connections have been deactivated. Re-add them when you upgrade to Pro."
  - **Dismissible:** YES (stores dismissed state in localStorage key `dismissed_downgrade_banner_{tenant_id}`)
- The Settings page → Discord Connections section shows the deactivated connections with a `Deactivated` badge (gray) and an explanation tooltip: "Deactivated because your plan limit was reduced."
- Reactivating a deactivated connection while on Starter shows an error modal: "Plan limit reached. Upgrade to Pro to connect more Discord servers."

**Bot impact:** Bot gracefully disconnects the `pending_disconnect` connections within 30 seconds of receiving the Realtime update.

---

### 1.7 Subscription Canceled — Immediate Downgrade to Free

**Trigger:** User cancels their subscription via the Customer Portal, and the cancellation takes effect immediately (not at period end). OR the subscription is canceled at period end and the period has now ended.

**Detection:** `customer.subscription.deleted` webhook event.

**User-facing behavior:**
- On next dashboard load: `AlertBanner` (variant: `info`, NOT error):
  - **Title:** "You're now on the Free plan"
  - **Body:** "Your subscription has ended. Some features are now limited. Upgrade anytime to restore full access."
  - **Action:** "Upgrade" (primary button → `/dashboard/billing`)
  - **Dismissible:** YES
- The Billing page shows the Free plan card as "Current Plan" with the paid plan cards showing as available upgrades.
- Features now gated by Free limits are visually locked (see [../premium/features-by-tier.md](../premium/features-by-tier.md)):
  - The integrations page shows OAuth services with a lock icon overlay
  - Attempting to connect a second Discord server shows an upgrade modal

**System behavior:**
1. Update `tenant_subscriptions.plan_id = 'free'`, `stripe_subscription_status = 'canceled'`, `stripe_current_period_end = NOW()`.
2. Count active `discord_connections`. If > 1, downgrade same as 1.6 (keep oldest, deactivate rest).
3. Service connections (OAuth, API keys) are NOT deleted. They stay in the database. The user keeps their connected services; they just can't use them until they upgrade. The bot enforces tool gating at invocation time.
4. Log to `admin_audit_log`.

**Recovery path:** User upgrades again on the Billing page → new Checkout Session → new subscription → `customer.subscription.created` webhook → plan restored.

**Bot impact:** Bot enforces Free plan tool limits. Any tools not available on Free will return a polite message: "This tool requires a paid plan. Visit https://daimon.pymc.io/dashboard/billing to upgrade."

---

### 1.8 Duplicate Webhook Delivery (Idempotency)

**Trigger:** Stripe may deliver the same webhook event more than once (their "at-least-once" delivery guarantee). The same `customer.subscription.updated` event could arrive twice within seconds.

**Detection:** The `stripe_event_id` (the `id` field on the Stripe event object) will be identical for duplicate deliveries.

**System behavior:**
1. Before processing any Stripe webhook, check if the event ID has already been processed. Store processed event IDs in a `stripe_webhook_events` table:
   ```sql
   CREATE TABLE stripe_webhook_events (
     stripe_event_id TEXT PRIMARY KEY,
     processed_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. At the start of the webhook handler, attempt:
   ```sql
   INSERT INTO stripe_webhook_events (stripe_event_id) VALUES ($1)
   ON CONFLICT DO NOTHING
   RETURNING stripe_event_id;
   ```
3. If the INSERT returns 0 rows (conflict), the event was already processed. Return `HTTP 200` immediately without re-processing.
4. If the INSERT returns 1 row, proceed with processing.

**User-facing behavior:** Transparent — the user sees no duplicate effects.

**Bot impact:** None.

---

## Part 2: OAuth Token Revocation (External)

### 2.1 GitHub Token Revoked by User on github.com

**Trigger:** The user (or a GitHub org admin) navigates to github.com → Settings → Applications → Authorized OAuth Apps and revokes Daimon's access. The token in Supabase Vault is now invalid, but the `tenant_service_connections` row still shows `status = 'connected'`.

**Detection:** The system does NOT know immediately. Detection occurs at the next time the bot attempts to use the GitHub tool (e.g., `github_create_issue`). The GitHub API returns `HTTP 401 Bad credentials`. The tool execution fails and the bot's tool handler catches the error.

**Bot behavior on detection:**
1. Bot's GitHub tool wrapper receives `401 Bad credentials` from GitHub API.
2. Tool marks the connection as failed: updates `tenant_service_connections SET status = 'error', error_message = 'Token revoked or expired — please reconnect', last_error_at = NOW()` for the tenant's GitHub connection.
3. Bot sends a Discord message to the channel that triggered the command: "GitHub integration needs to be reconnected. Visit https://daimon.pymc.io/dashboard/integrations to reconnect."
4. Bot does NOT retry the tool call.

**User-facing behavior (dashboard, next load):**
- The Integrations page shows GitHub with status badge `Error` (red):
  - **Icon:** `ExclamationCircle` (red)
  - **Badge text:** "Reconnect required"
  - **Tooltip:** "This connection has been revoked. Click to reconnect."
  - **"Connect" button** replaces "Disconnect" button.
- `AlertBanner` on the dashboard (variant: `warning`):
  - **Title:** "GitHub integration disconnected"
  - **Body:** "Your GitHub connection was revoked. Reconnect it to continue using GitHub tools."
  - **Action:** "Reconnect GitHub" → `/dashboard/integrations`

**System behavior (status detection without tool invocation):**
A background Supabase Edge Function (`validate-oauth-tokens`) runs daily (00:00 UTC, see [../deployment/environment.md](../deployment/environment.md)). For each `tenant_service_connections` row with `service = 'github'` and `status = 'connected'`:
1. Retrieve the token from Vault.
2. Make `GET https://api.github.com/user` with the token.
3. If `401` or `403`: set `status = 'error'`, `error_message = 'Token revoked or expired'`.
4. If `200`: update `last_validated_at = NOW()`.

This ensures the dashboard shows accurate status even if the bot hasn't tried to use the tool.

**Recovery path:** User clicks "Connect" on the Integrations page → new OAuth flow → new token stored → `status = 'connected'`.

**Bot impact:** GitHub tools fail until reconnected. Other tools unaffected. Bot continues running.

---

### 2.2 Google Token Revoked by User on google.com

**Trigger:** User revokes Daimon's access via myaccount.google.com → Security → Third-party apps.

**Detection:** Same as GitHub (2.1) — detected at tool invocation time (HTTP 401 from Google API) or by the daily validation Edge Function.

**Additional Google-specific behavior:**
- Google tokens use access token (short-lived, 1 hour) + refresh token (long-lived). When the user revokes access, BOTH tokens become invalid.
- The Google token refresh attempt (made automatically by the bot when the 1-hour access token expires) will return `invalid_grant`. This IS an earlier detection mechanism — it happens within 1 hour of the access token's last issue, rather than waiting for a tool invocation.

**Bot behavior on `invalid_grant` during refresh:**
1. Sets `tenant_service_connections SET status = 'error', error_message = 'Authorization revoked — please reconnect'` for the tenant's Google connection.
2. Sends Discord notification: "Google integration needs to be reconnected. Visit https://daimon.pymc.io/dashboard/integrations."

**User-facing behavior:** Same as GitHub (2.1) but with Google branding. Badge text: "Reconnect required". Reconnect button triggers new Google OAuth flow.

**Recovery path:** New Google OAuth flow → new access + refresh tokens stored in Vault.

**Bot impact:** Google Analytics tools fail until reconnected. Other tools unaffected.

---

### 2.3 Linear Token Revoked by User in Linear

**Trigger:** User revokes Daimon's access via linear.app → Settings → Account → Applications.

**Detection:** Same pattern. Linear access tokens are long-lived (no refresh token) and become invalid immediately on revocation. Detected on next tool invocation returning `401`.

**Bot behavior:** Same as GitHub (2.1). Sends Discord message and marks connection as error.

**User-facing behavior:** Same as GitHub (2.1) with Linear branding.

**Recovery path:** New Linear OAuth flow.

**Bot impact:** Linear tools fail until reconnected.

---

### 2.4 OAuth Token Scopes Changed (Partial Revocation)

**Trigger:** A user goes to the OAuth provider and removes SOME permissions (e.g., removes write access to GitHub repos but keeps read access). The token is still valid but has reduced scopes.

**Detection:** Specific API calls fail with `403 Forbidden` (scope issue), while others succeed. This is harder to detect than full revocation.

**Bot behavior:**
1. Tool wrapper receives `403 Forbidden` from the provider API.
2. Tool marks the connection with `status = 'degraded'`, `error_message = 'Insufficient permissions — some tools may not work'`.
3. Bot sends Discord message: "[Service] integration has limited permissions. Some tools may fail. Visit https://daimon.pymc.io/dashboard/integrations to reconnect with full permissions."

**User-facing behavior:**
- Integrations page shows service with badge `Degraded` (amber):
  - **Badge text:** "Limited permissions"
  - **Tooltip:** "Some tools may not work due to reduced permissions. Reconnect to restore full access."
  - **Buttons:** "Reconnect" (primary) + "Disconnect" (ghost)

**Recovery path:** User reconnects via the full OAuth flow — this will re-request all required scopes.

**Bot impact:** Tools using the revoked scope fail. Tools using remaining scopes continue.

---

### 2.5 OAuth Callback CSRF Attack (state mismatch)

**Trigger:** An attacker constructs a malicious OAuth callback URL with a fake `code` and missing/mismatched `state`. They try to trick a logged-in user's browser into executing the callback.

**Detection:** The callback route `GET /api/integrations/oauth/callback` compares the `state` query param against the `oauth_state` cookie. If they don't match (or the cookie is missing), CSRF is detected.

**User-facing behavior:**
- Redirect to `/dashboard/integrations?error=invalid_state&service={service}`.
- `AlertBanner` (variant: `error`):
  - **Title:** "Connection failed — security check failed"
  - **Body:** "The OAuth connection was rejected due to a security check failure. This could indicate a CSRF attack attempt. Please try connecting again."
  - **Action:** "Try Again" (triggers new OAuth flow)

**System behavior:**
1. Route returns `302` to `/dashboard/integrations?error=invalid_state`.
2. All `oauth_*` cookies are cleared.
3. Log a `warn` with IP and tenant ID.
4. No token is stored. No `tenant_service_connections` row is created or modified.

**Bot impact:** None.

---

## Part 3: Bot Crash & Disconnect Mid-Operation

### 3.1 Bot Process Crashes During Active Tool Call

**Trigger:** The bot process on Fly.io crashes (OOM, unhandled exception, segfault in a native dependency) while a tool call is mid-execution. A Discord user is waiting for a response.

**Detection:** From the user's perspective: no response in Discord. From the platform's perspective: the bot's heartbeat stops updating `discord_connections.last_heartbeat_at`. After 90 seconds without a heartbeat, the bot is considered `stale`.

**User-facing behavior (Discord):**
- The user in Discord sees no response. The command message has no reply. After a few minutes, the Discord typing indicator disappears.
- There is NO error message sent to Discord from the website — the bot was the one that would have sent it, and it's down.
- If the bot restarts automatically (Fly.io auto-restart), the bot comes back up but has no memory of the in-progress command. The user must re-issue the command.

**User-facing behavior (dashboard):**
- The dashboard status card for the affected Discord connection shows `Disconnected` (red) within 2 minutes of the heartbeat going stale.
- `AlertBanner` (variant: `warning`):
  - **Title:** "Bot disconnected — {server name}"
  - **Body:** "Your bot for {server name} appears to be offline. It should reconnect automatically within a few minutes. If it doesn't, try reconnecting from Settings."
  - **Action:** "Go to Settings" → `/dashboard/settings`

**System behavior (heartbeat staleness detection):**
A Supabase Edge Function (`check-bot-health`) runs every 60 seconds. For each tenant's `discord_connections` row with `status = 'active'`:
1. If `NOW() - last_heartbeat_at > INTERVAL '90 seconds'`: set `status = 'stale'`.
2. If `NOW() - last_heartbeat_at > INTERVAL '5 minutes'`: set `status = 'disconnected'`.

**Bot restart behavior (Fly.io):**
Fly.io is configured with `restart_policy = "always"` (see [../deployment/infrastructure.md](../deployment/infrastructure.md)). The bot restarts within 10–30 seconds of the crash. On restart, the bot:
1. Reads all tenant configs from Supabase.
2. Reconnects to all Discord servers with `status = 'active'`.
3. Resumes heartbeat updates.
4. Sets `discord_connections.status = 'active'` for all its connections.
5. Does NOT resume any in-progress tool calls — those are lost.

**Recovery path:** Bot auto-restarts (10–30 seconds) → reconnects → heartbeat resumes → dashboard shows `Connected` again. If auto-restart fails (crash loop), user can manually trigger reconnect from Settings page.

**Bot impact:** All tenants' bots are on the same Fly.io instance. A crash affects ALL tenants simultaneously until restart. This is a known limitation of the shared-infrastructure multi-tenant model. See [../multi-tenant/tenant-isolation.md](../multi-tenant/tenant-isolation.md) for isolation boundaries.

---

### 3.2 Bot Loses Discord WebSocket Connection (Non-Crash)

**Trigger:** The bot process is alive but the Discord WebSocket connection drops. This can be caused by network issues, Discord API restarts, rate limiting, or Discord server outages.

**Detection:** discord.py fires the `on_disconnect` event. The bot's disconnect handler updates `discord_connections.status = 'reconnecting'` for all affected connections.

**User-facing behavior (dashboard):**
- Status card shows `Reconnecting` (amber, pulsing) for affected connections.
- No `AlertBanner` on first reconnect attempt — this is transient and usually resolves within seconds.
- If reconnect attempts exceed 5 (roughly 2.5 minutes), `AlertBanner` (variant: `warning`) appears:
  - **Title:** "Bot reconnecting — {server name}"
  - **Body:** "Your bot is having trouble reconnecting to Discord. This usually resolves itself. If it persists, check Discord's status at https://discordstatus.com."

**System behavior:**
discord.py's built-in reconnect logic with exponential backoff:
- Attempt 1: immediate
- Attempt 2: 1 second
- Attempt 3: 2 seconds
- Attempt 4: 4 seconds
- Attempt 5+: 8 seconds (capped)

On each failed reconnect: bot updates `discord_connections.status = 'reconnecting'`, increments a reconnect counter.
On successful reconnect: bot updates `discord_connections.status = 'active'`, resets reconnect counter, sends no notification.
After 10 failed attempts: bot sets `discord_connections.status = 'failed'` and stops retrying. Requires manual reconnect from Settings.

**Recovery path:** Discord reconnects automatically in most cases. For `failed` status, user goes to Settings → Discord Connections → clicks "Reconnect" button → bot makes a fresh Discord connection attempt.

**Bot impact:** Bot cannot receive or send Discord messages during reconnect window. All other tenants on the same bot instance are unaffected (each tenant has its own discord.py `Client` instance per connection).

---

### 3.3 Bot Connected to Discord but Anthropic API Unavailable

**Trigger:** Bot receives a Discord message and tries to call the Anthropic API (Claude). Anthropic returns a `503 Service Unavailable` or `529 Overloaded` response.

**Detection:** The `anthropic` Python SDK raises `anthropic.APIStatusError` with status 503 or 529.

**Bot behavior:**
1. Retry with exponential backoff: attempt 2 at 2s, attempt 3 at 4s, attempt 4 at 8s. Total of 4 attempts before giving up.
2. If all 4 attempts fail: Bot sends a Discord message to the triggering channel:
   - "I'm temporarily unavailable. The AI service I rely on is experiencing issues. Please try again in a few minutes. Status: https://status.anthropic.com"
3. Bot does NOT crash. It continues listening and will try again on the next message.

**User-facing behavior (dashboard):**
- No change in the dashboard unless the bot's heartbeat also stops. The bot remains `active` in the dashboard.
- The Discord message from the bot informs the user in-channel.

**Bot impact:** Other tool calls not involving Claude (e.g., if a tool is a pure API call) are unaffected. Only commands that trigger the Claude agent are affected.

---

### 3.4 Bot Removed from Discord Server (Guild Removed)

**Trigger:** A Discord server admin removes/kicks the Daimon bot from their Discord server. The bot's discord.py client fires the `on_guild_remove` event.

**Detection:** `on_guild_remove` event in the bot's Discord event handler. The bot receives this event with the removed guild object.

**Bot behavior:**
1. Bot's `on_guild_remove` handler fires.
2. Bot identifies the `guild_id` and maps it to a `discord_connections` row.
3. Bot updates `discord_connections SET status = 'kicked', disconnected_at = NOW()` for that row.
4. Bot closes the connection's internal state and releases resources. Other tenants' connections are unaffected.

**User-facing behavior (dashboard):**
- The Settings page → Discord Connections shows the connection with status `Removed from server` (red badge):
  - **Tooltip:** "The bot was removed from this Discord server. Re-add it to the server and reconnect."
- `AlertBanner` (variant: `warning`) on the dashboard:
  - **Title:** "Bot removed from {server name}"
  - **Body:** "The bot was removed from your Discord server. To reconnect, re-add the bot to your server, then reconnect from Settings."
  - **Action:** "Go to Settings" → `/dashboard/settings`
- The connection row shows a "Reconnect" button instead of "Disconnect".

**System behavior:**
- The `discord_connections` row is NOT deleted. It remains with `status = 'kicked'`.
- The bot token is still stored. The user just needs to re-add the bot to the server and click "Reconnect".

**Recovery path:**
1. User adds the bot back to the Discord server using the bot's invite link (displayed in Settings after the kicked status).
2. User clicks "Reconnect" in the Settings page → bot attempts fresh connection to that guild → if successful, `status` returns to `active`.

**Bot impact:** Only the specific connection/guild is affected. Other tenants and other connections for the same tenant are unaffected.

---

### 3.5 Discord Token Invalidated (Bot Token Changed/Regenerated)

**Trigger:** The tenant navigates to the Discord Developer Portal and regenerates their bot's token. The old token stored in Vault is now invalid.

**Detection:** Discord's WebSocket gateway closes the connection with close code `4004` (Authentication failed). discord.py raises `discord.errors.LoginFailure`. The bot does NOT retry — it marks this connection as `auth_failed`.

**Bot behavior:**
1. `LoginFailure` exception is caught by the bot's connection manager.
2. Updates `discord_connections SET status = 'auth_failed'` for that tenant+guild.
3. Does NOT restart or retry with the same token.
4. Sends a Supabase Realtime message on channel `tenant:{tenant_id}:events` with payload `{ event: 'connection_auth_failed', connection_id: ... }`.

**User-facing behavior (dashboard):**
- `AlertBanner` (variant: `error`):
  - **Title:** "Discord connection failed — invalid token"
  - **Body:** "Your Discord bot token is invalid or has been regenerated. Update your token in Settings to reconnect."
  - **Action:** "Update Token" → `/dashboard/settings`
- Settings page shows connection with `Auth Failed` badge (red).
- The connection shows an "Update Token" button that opens the bot token update modal (same as initial connection setup, pre-filled with guild ID, empty token field).

**System behavior on "Update Token":**
1. User enters new bot token in the modal.
2. Server action validates token format (see [../integrations/discord.md](../integrations/discord.md) for format rules).
3. Server action calls Discord API to verify token: `GET https://discord.com/api/v10/users/@me` with `Bot {token}` header.
4. On success: stores new token in Vault (update the existing Vault secret, do not create new).
5. Updates `discord_connections SET status = 'pending_reconnect', token_updated_at = NOW()`.
6. Bot receives the updated token via Supabase Realtime and attempts reconnection.

**Bot impact:** Only the affected tenant's connection is down. Other tenants unaffected.

---

### 3.6 Discord Server (Guild) Deleted

**Trigger:** The Discord server owner deletes the entire Discord server. The bot's discord.py client fires `on_guild_remove`.

**Detection:** Same event as "kicked" (3.4). The difference is the guild no longer exists, but from the bot's perspective, both events look identical — `on_guild_remove` fires with the guild ID.

**Bot behavior:** Identical to 3.4 — sets `status = 'kicked'`.

**User-facing behavior:** Same as 3.4 (the system doesn't distinguish between kicked and deleted). The "Reconnect" button will fail if the user tries to reconnect to a deleted server.

**Recovery path:**
- User creates a new Discord server.
- Goes to Settings → Discord Connections → "Add New Connection".
- Enters the new guild ID and same bot token.
- Old `kicked` connection row is replaced with the new connection.
- User can optionally delete the old `kicked` connection row via "Remove" button in Settings.

---

## Part 4: API Key Invalidation (External)

### 4.1 Anthropic API Key Revoked Mid-Session

**Trigger:** The tenant logs into console.anthropic.com and deletes their API key. The key stored in Vault is now invalid.

**Detection:** The next Claude API call from the bot returns `HTTP 401 invalid_api_key`. The bot's BYOK key routing layer (see [../multi-tenant/byok-key-routing.md](../multi-tenant/byok-key-routing.md)) catches this.

**Bot behavior:**
1. Bot's API call wrapper receives `401 invalid_api_key` from Anthropic SDK.
2. Bot does NOT retry — invalid key is a permanent failure.
3. Bot sends a Discord message: "Your Anthropic API key is no longer valid. Please update it at https://daimon.pymc.io/dashboard/billing."
4. Bot updates `tenant_api_keys SET status = 'invalid', last_error_at = NOW()` for the tenant's `anthropic` key.
5. All subsequent commands from that tenant return the same Discord message until the key is updated.

**User-facing behavior (dashboard):**
- `AlertBanner` (variant: `error`) on all dashboard pages:
  - **Title:** "Anthropic API key is invalid"
  - **Body:** "Your Anthropic API key has been revoked or is no longer valid. Update your API key on the Billing page to continue using Daimon."
  - **Action:** "Update API Key" → `/dashboard/billing#api-keys`
- Billing page → API Keys section shows Anthropic key with `Invalid` badge (red).
- The update form is pre-expanded (not collapsed) when there's an invalid key.

**Recovery path:**
1. User generates a new API key on console.anthropic.com.
2. Enters new key in the Billing page's API key update form.
3. Server action validates the key: calls `GET https://api.anthropic.com/v1/models` with the new key.
4. On `200`: stores new key in Vault, updates `tenant_api_keys SET status = 'active'`.
5. `AlertBanner` disappears on next page load.
6. Bot receives updated key via Supabase Realtime and resumes normal operation.

**Bot impact:** All AI-powered commands fail for the affected tenant. The bot stays connected to Discord (WebSocket still valid) but all Claude-based responses are replaced with the "update your key" message.

---

### 4.2 Toggl API Key Revoked or Rotated

**Trigger:** The tenant generates a new API token in Toggl Track → Profile settings → API Token → Reset. The old token in Vault is now invalid.

**Detection:** The next Toggl API call returns `HTTP 403 Forbidden`. The bot's Toggl tool wrapper catches this.

**Bot behavior:**
1. Receives `403` from Toggl API.
2. Updates `tenant_service_connections SET status = 'error', error_message = 'API key invalid — please reconnect'` for the tenant's Toggl connection.
3. Sends Discord message: "Your Toggl integration needs to be reconnected. Visit https://daimon.pymc.io/dashboard/integrations."
4. Returns error to the agent: tool call fails with a descriptive message.

**User-facing behavior (dashboard):** Same pattern as OAuth revocation (2.1) — Integrations page shows Toggl with `Error` badge, AlertBanner prompt.

**Recovery path:** User pastes new API token in the Integrations page → re-validation → key stored in Vault → `status = 'connected'`.

---

### 4.3 Anthropic API Key Usage Limit Exceeded

**Trigger:** The tenant's Anthropic API key hits its usage limit (spending limit configured on console.anthropic.com) for the month. Anthropic returns `HTTP 429` with error type `rate_limit_error` or `usage_limit_reached`.

**Detection:** Bot's API call wrapper receives `429` from Anthropic SDK with error type indicating limit reached (not rate limiting).

**Bot behavior:**
1. Checks error type: if `usage_limit_reached`, treat as semi-permanent (until next billing cycle).
2. Sends Discord message: "Your Anthropic API usage limit has been reached for this month. Increase your limit at console.anthropic.com or wait for the limit to reset."
3. Updates `tenant_api_keys SET status = 'limit_reached', error_message = 'Usage limit exceeded'`.
4. Does NOT retry or fall back to a platform key.

**Bot behavior for transient rate limiting (429 with `rate_limit_error`):**
1. Retry with exponential backoff: 5s, 10s, 20s, 40s (4 attempts max).
2. If all retries fail: sends Discord message: "I'm temporarily rate-limited. Please try again in a minute."
3. Does NOT update `tenant_api_keys.status` for transient rate limits.

**User-facing behavior:** Same pattern as key invalid (4.1) for `limit_reached` status. Dashboard shows a different badge text: "Usage Limit Reached" with tooltip explaining it resets monthly.

---

## Part 5: Slow Connections & Timeout Scenarios

### 5.1 Stripe Checkout Redirect Takes > 30 Seconds

**Trigger:** The server-side `POST /api/billing/create-checkout-session` call to Stripe's API takes longer than expected. The Vercel function timeout is 30 seconds (Hobby plan) or 60 seconds (Pro plan).

**Detection:** Vercel function times out before the Stripe API responds.

**User-facing behavior:**
- After 30 seconds (or 60 seconds on Pro): The API route returns a 504 Gateway Timeout.
- The client receives this as a network error.
- The "Upgrade" button loading state was set when the user clicked. After ~30 seconds, the fetch promise rejects.
- Client shows `AlertBanner` (variant: `error`):
  - **Title:** "Request timed out"
  - **Body:** "The billing system took too long to respond. Please try again. If this keeps happening, contact support."
  - **Action:** "Try Again"

**System behavior:**
- The Stripe API call is aborted by Vercel's timeout.
- No `checkout.session.created` event exists on Stripe's side (the session was never created).
- No database changes made.
- No partial state — safe to retry.

**Recovery path:** User clicks "Try Again" → creates a fresh checkout session.

---

### 5.2 OAuth Callback Delayed or Browser Closed Before Redirect

**Trigger:** User starts an OAuth flow (clicks "Connect GitHub"), the browser opens the GitHub authorization page, and either:
a) The user takes too long (>10 minutes) to authorize — the `oauth_state` cookie has expired (10-minute TTL).
b) The user closes the browser tab after clicking "Authorize" but before the redirect completes.
c) Network issues delay the redirect.

**Detection (case a):** The callback arrives but the `oauth_state` cookie has expired. The state comparison fails (same as CSRF, 2.5).

**Detection (case b):** The callback never arrives. The `oauth_state` cookie expires naturally (10 minutes).

**User-facing behavior (case a):**
- Redirect to `/dashboard/integrations?error=expired_state&service=github`.
- `AlertBanner` (variant: `warning`):
  - **Title:** "Connection expired"
  - **Body:** "The connection attempt timed out. Please try connecting again."
  - **Action:** "Try Again"

**User-facing behavior (case b):** User sees an incomplete state on the Integrations page. The service still shows "Not connected." There is no error message — the user simply never completed the flow. They can try again at any time.

**System behavior (case a):** Same as CSRF handler (2.5) — cookies cleared, no tokens stored.

**Recovery path:** User clicks "Try Again" → new OAuth flow → completes within 10 minutes.

---

### 5.3 Supabase Realtime Connection Drops (Browser)

**Trigger:** The user's browser loses the Supabase Realtime WebSocket connection while on the dashboard. This can be caused by:
- Network switch (WiFi → cellular)
- Device sleeps
- Supabase Realtime service restart
- Idle timeout (Supabase closes idle connections after 3 minutes by default)

**Detection:** The Supabase Realtime JS client fires the `CLOSED` status event. The client library's built-in reconnect logic kicks in.

**User-facing behavior:**
- A subtle connection status indicator in the TopBar (small dot) changes from `green` to `amber` (pulsing) with tooltip "Reconnecting...".
- The dashboard stops updating in real-time during the reconnect window.
- If reconnect succeeds within 5 seconds: dot returns to green with tooltip "Connected". No toast shown.
- If reconnect takes >5 seconds: small non-intrusive toast (bottom-right, variant: `info`):
  - **Message:** "Reconnecting to live updates..."
  - No dismiss button, auto-hides when reconnected.
- On reconnect: toast changes to "Live updates restored" (2 seconds, then auto-hides).

**System behavior:**
- The Supabase client library automatically reconnects with exponential backoff.
- On reconnect: re-subscribes to all channels.
- Re-fetches fresh data from Supabase to catch any missed updates during the disconnect window:
  ```typescript
  // On channel SUBSCRIBED event after reconnect
  await refetchDashboardData()  // calls the dashboard's data fetching functions
  ```
- This ensures the dashboard reflects current state even if real-time events were missed.

**Bot impact:** None — Realtime disconnect in the browser doesn't affect the bot's own Realtime subscription (server-side).

---

### 5.4 Dashboard Data Fetch Timeout (Supabase Query Slow)

**Trigger:** The dashboard page makes a Supabase query that takes longer than expected (e.g., 10+ seconds) due to database load.

**Detection:** The fetch promise times out or the Supabase client times out.

**User-facing behavior:**
- Skeleton loaders are shown while the fetch is in-progress (see [../frontend/loading-and-empty-states.md](./loading-and-empty-states.md)).
- After 10 seconds with no response: skeleton loaders are replaced with an `ErrorState` component:
  - **Icon:** `ExclamationCircle` (gray, 48px)
  - **Title:** "Data temporarily unavailable"
  - **Body:** "We're having trouble loading your dashboard. Please refresh the page."
  - **Action:** "Refresh" (button → `window.location.reload()`)
- Toast (variant: `error`, duration: 0 — stays until dismissed):
  - **Message:** "Dashboard failed to load. Please refresh."

**Recovery path:** User clicks "Refresh" → page reloads → new fetch attempt.

---

### 5.5 Bot Token Validation Timeout During Connection Setup

**Trigger:** User adds a new Discord connection in Settings. The server action calls `GET https://discord.com/api/v10/users/@me` to validate the bot token. Discord's API takes >10 seconds to respond or is temporarily unavailable.

**Detection:** The fetch times out (10-second timeout configured on the validation call).

**User-facing behavior:**
- "Validate" button is in loading state (spinner, disabled) during the validation.
- After 10 seconds: button returns to active state.
- Error message below the token input field:
  - **Text:** "Couldn't verify your bot token — Discord may be experiencing issues. Try again, or check https://discordstatus.com."
  - **Color:** red (`#EF4444`)
- Connection is NOT saved.

**Recovery path:** User retries validation when Discord API is available.

---

### 5.6 Very Slow Network — Request Spinner Stuck

**Trigger:** User is on a very slow connection (e.g., 2G, satellite). API requests take 15–30 seconds.

**User-facing behavior:**
All buttons that trigger API calls have a built-in maximum visible-loading time to prevent UI lockout:
- Primary action buttons (Upgrade, Connect, Save): loading state with spinner, disabled.
- Absolutely NO button remains in loading state for more than 30 seconds client-side. After 30 seconds, the button reverts to active even if the underlying request hasn't returned. The user can click again.
- This is implemented with a `setTimeout(() => setIsLoading(false), 30000)` safety valve in each button's click handler.

---

## Part 6: Concurrent & Multi-Tab Scenarios

### 6.1 User Upgrades Plan in Two Tabs Simultaneously

**Trigger:** User has two dashboard tabs open. They click "Upgrade to Starter" in Tab A. While the Stripe Checkout is loading, they also click "Upgrade to Starter" in Tab B.

**Detection:** Tab B's `create-checkout-session` API call sees the tenant already has an active `stripe_customer_id`. The route creates a second Checkout Session with the same customer ID.

**Stripe behavior:** Stripe does NOT prevent duplicate Checkout Sessions. Two sessions can exist simultaneously. If the user completes BOTH, Stripe creates two subscriptions for the same customer. This creates a billing anomaly.

**Prevention:**
1. The `create-checkout-session` API route, before creating the session, checks `tenant_subscriptions.stripe_subscription_status`. If status is already `active` or the tenant is not on the Free plan, return an error:
   ```json
   { "error": "already_subscribed", "message": "You already have an active subscription." }
   ```
2. If a Checkout Session is in-flight (there's a `stripe_checkout_session_id` stored in `tenant_subscriptions` created within the last 30 minutes), return:
   ```json
   { "error": "checkout_in_progress", "message": "A checkout is already in progress. Complete it or wait 30 minutes." }
   ```

**User-facing behavior (Tab B, if checkout in progress):**
- `AlertBanner` (variant: `info`):
  - **Title:** "Checkout already in progress"
  - **Body:** "You already have a checkout session open. Complete it in the other tab, or wait 30 minutes to start a new one."

---

### 6.2 User Changes Settings in Two Tabs Simultaneously

**Trigger:** User has two Settings tabs open. Both modify the same setting (e.g., tenant display name). Tab A saves first. Tab B saves second with different data.

**System behavior:**
- Supabase `UPDATE tenants SET name = $1 WHERE id = $2` — last-writer-wins. Tab B's save overwrites Tab A's.
- No optimistic locking is implemented. This is acceptable for low-stakes settings changes.

**User-facing behavior:** Both tabs show a success toast "Settings saved." But Tab A's change was overwritten by Tab B. If the user checks, they see Tab B's value. No error, no data loss warning.

**Bot impact:** None for name changes. For config changes that affect bot behavior (e.g., system prompt), the bot receives the latest value via Realtime and applies it.

---

### 6.3 OAuth Connection Completed While Integrations Page Not Focused

**Trigger:** User starts an OAuth flow (opens GitHub authorization in a new tab) and approves it. The OAuth callback redirects to `/dashboard/integrations?connected=github`. But the user's original dashboard tab is still showing the old state.

**User-facing behavior:**
- The OAuth callback tab/redirect lands on the Integrations page.
- The Integrations page detects `?connected=github` in the URL on mount.
- Shows a success toast: "GitHub connected successfully!"
- Removes `?connected` from the URL (via `router.replace`).
- Fetches fresh integration status from Supabase.
- The original (backgrounded) tab: no automatic update. If the user switches back to it, the GitHub row still shows "Not connected" until they manually refresh. The Supabase Realtime subscription on that tab DOES receive the `tenant_service_connections` INSERT event, which triggers an automatic re-render showing the new `connected` status.

---

## Part 7: Edge Cases in Billing Lifecycle

### 7.1 Trial Period Ends (If Trials Are Implemented)

**Note:** Daimon does NOT have a free trial period as of initial launch. All paid plans require immediate payment. This scenario is documented for future use only.

If trials are added in the future:
- `customer.subscription.trial_will_end` webhook arrives 3 days before trial ends.
- `AlertBanner` appears on all dashboard pages warning the user.
- On `customer.subscription.updated` with `status = 'active'` (transition from trial to paid): no banner change — user is now paying.
- On `customer.subscription.updated` with `status = 'canceled'` (user cancelled during trial): downgrade to free as per 1.7.

---

### 7.2 Proration on Immediate Plan Upgrade

**Trigger:** User upgrades from Starter ($9/month) to Pro ($29/month) mid-billing cycle.

**Stripe behavior:** Stripe automatically calculates proration. If the user has 15 days left in their Starter cycle:
- Credit: $4.50 (half of $9 — unused Starter days)
- Charge: $14.50 (half of $29 — remaining Pro days)
- Net charge on upgrade: $10.00

**User-facing behavior:**
- Stripe Checkout shows the prorated amount, not the full Pro price.
- The Checkout Session shows line items: "Daimon Pro (prorated)" and "Daimon Starter credit (prorated)".
- The Billing page, after upgrade, shows the next renewal date and the full Pro price for the next cycle.
- No special UI needed in Daimon — Stripe handles proration display in Checkout.

**System behavior:**
- The `customer.subscription.updated` webhook fires with the new plan.
- Webhook handler updates `tenant_subscriptions.plan_id = 'pro'`.
- The `invoice.paid` webhook fires with the prorated amount.
- No special proration logic needed in Daimon's code.

---

### 7.3 Annual → Monthly Plan Switch

**Trigger:** User switches from annual billing to monthly billing via the Customer Portal.

**Stripe behavior:** Stripe does NOT immediately charge or refund for the remaining annual period. The switch takes effect at the end of the current annual billing period.

**User-facing behavior:**
- On the Billing page, after the Customer Portal visit: the plan shows "Switching to monthly on {date}".
- `tenant_subscriptions.billing_cycle = 'monthly'` is updated, but `plan_id` and `stripe_subscription_status` remain unchanged.
- The user continues using the Pro (annual) plan until the period ends.
- At period end: `customer.subscription.updated` webhook fires with the new monthly price ID.

**System behavior:**
- No immediate changes to feature access.
- Log to `admin_audit_log`: `{ action: 'billing_cycle_change', from: 'annual', to: 'monthly', tenant_id }`.

---

### 7.4 Invoice Payment for Annual Plan Fails on Renewal

**Trigger:** One year after subscribing to the annual Pro plan, Stripe attempts the $290 charge. The card on file is declined.

**User-facing behavior and system behavior:** Same as 1.5 (monthly payment failure), but:
- The `past_due` grace period for large annual invoices may feel more urgent. The `AlertBanner` body copy reflects the amount:
  - **Body:** "We couldn't charge $290.00 for your annual Pro plan renewal. Update your payment details to keep your plan active."
- Stripe's smart retry logic applies (retries over 7 days by default).

---

## Part 8: Integration State Machine Summary

For each integration type, the full set of valid states and transitions:

### 8.1 Discord Connection States

| State | Meaning | Transitions To |
|-------|---------|----------------|
| `pending` | Added but bot not yet connected | `active` (on successful connect), `auth_failed` (on bad token) |
| `active` | Bot connected and receiving events | `reconnecting` (on disconnect), `kicked` (on guild remove), `auth_failed` (on token invalidation) |
| `reconnecting` | Attempting to reconnect | `active` (on success), `failed` (after 10 attempts) |
| `stale` | No heartbeat for 90s | `active` (on heartbeat resume), `disconnected` (after 5 min) |
| `disconnected` | No heartbeat for 5min | `active` (on manual reconnect), `pending_reconnect` (on token update) |
| `failed` | Reconnect attempts exhausted | `active` (on manual reconnect) |
| `kicked` | Bot removed from guild | `active` (on re-add + reconnect) |
| `auth_failed` | Token invalid (close code 4004) | `pending_reconnect` (on token update) |
| `pending_reconnect` | New token stored, awaiting bot connect | `active` (on successful connect), `auth_failed` (if new token also invalid) |
| `pending_disconnect` | Plan downgrade — waiting for bot to disconnect | `inactive` (on bot disconnect) |
| `inactive` | Disabled due to plan limit | `active` (on plan upgrade + reconnect) |

### 8.2 OAuth Service Connection States

| State | Meaning | Transitions To |
|-------|---------|----------------|
| `connected` | Token valid, tool calls succeed | `error` (on 401/403 from service), `degraded` (on scope reduction) |
| `error` | Token invalid or revoked | `connected` (on reconnect) |
| `degraded` | Token valid but reduced scopes | `connected` (on reconnect with full scopes), `error` (on full revocation) |
| `expired` | Access token expired, refresh failed | `connected` (on reconnect) |
| `disconnected` | User manually disconnected | `connected` (on reconnect) |

### 8.3 API Key States

| State | Meaning | Transitions To |
|-------|---------|----------------|
| `active` | Key valid, calls succeed | `invalid` (on 401), `limit_reached` (on usage limit), `pending_validation` (on update) |
| `pending_validation` | Just entered, not yet validated | `active` (on success), `invalid` (on validation failure) |
| `invalid` | Key revoked or wrong | `active` (on valid key entry) |
| `limit_reached` | Monthly usage limit hit | `active` (on next billing cycle or limit increase) |

### 8.4 Subscription States

| State | Meaning | Transitions To |
|-------|---------|----------------|
| `active` | Paid, current | `past_due` (on failed payment), `canceled` (on cancellation) |
| `past_due` | Payment failed, grace period active | `active` (on successful payment), `canceled` (on grace period end) |
| `canceled` | Subscription ended | `active` (on re-subscribe) |
| `trialing` | Trial period (future feature) | `active` (on trial end with payment), `canceled` (on trial cancellation) |

---

## Part 9: User Notification Matrix

Which events trigger which notifications:

| Event | Dashboard AlertBanner | Toast | Discord Message | Email |
|-------|----------------------|-------|-----------------|-------|
| Payment failed | YES (warning, persistent) | NO | NO | YES (via Stripe) |
| Subscription canceled | YES (info, dismissible) | YES (success) | NO | YES (via Stripe) |
| Plan downgraded (excess connections) | YES (warning, dismissible) | NO | NO | NO |
| OAuth token revoked | YES (warning) | NO | YES (bot message) | NO |
| Discord bot removed from guild | YES (warning) | NO | NO | NO |
| Bot token invalidated | YES (error) | NO | YES (if possible) | NO |
| Anthropic key invalid | YES (error) | NO | YES (bot message) | NO |
| Anthropic key limit reached | YES (warning) | NO | YES (bot message) | NO |
| Bot crashed/reconnecting (<5s) | NO | NO | NO | NO |
| Bot crashed/reconnecting (>5s) | YES (warning) | YES | NO | NO |
| Bot failed after 10 reconnect attempts | YES (error) | NO | NO | NO |
| Realtime disconnected (<5s) | NO | NO | NO | NO |
| Realtime disconnected (>5s) | NO | YES (info) | NO | NO |

---

*End of aspect 7.3b — Edge Cases: Integrations & Billing*

# API Routes — Daimon SaaS Next.js App

> Aspect: 8.1.3 — All 18+ Next.js API routes with full request/response shapes
> Written: 2026-03-13
> Related: [../integrations/stripe.md](../integrations/stripe.md), [./webhooks.md](./webhooks.md), [./auth.md](./auth.md), [./rate-limiting.md](./rate-limiting.md), [../database/schema.md](../database/schema.md), [../frontend/settings-page.md](../frontend/settings-page.md), [../frontend/billing-page.md](../frontend/billing-page.md), [../frontend/integrations-page.md](../frontend/integrations-page.md), [../frontend/admin-panel.md](../frontend/admin-panel.md)

---

## Overview

The Daimon Next.js App Router exposes the following API surface. All routes live under `app/api/`. The table below is the complete inventory — every route, every method, every file.

### Route Index

| Route | Method | File | Auth Required | Description |
|-------|--------|------|--------------|-------------|
| `/api/billing/checkout` | POST | `app/api/billing/checkout/route.ts` | Supabase session (owner/admin) | Create Stripe Checkout Session |
| `/api/billing/portal` | POST | `app/api/billing/portal/route.ts` | Supabase session (owner/admin) | Create Stripe Customer Portal Session |
| `/api/billing/downgrade` | POST | `app/api/billing/downgrade/route.ts` | Supabase session (owner only) | Schedule plan downgrade at period end |
| `/api/billing/api-keys` | POST | `app/api/billing/api-keys/route.ts` | Supabase session (owner/admin) | Save or update Anthropic/OpenAI key |
| `/api/billing/api-keys/[id]` | DELETE | `app/api/billing/api-keys/[id]/route.ts` | Supabase session (owner/admin) | Delete API key by ID |
| `/api/discord-connections` | POST | `app/api/discord-connections/route.ts` | Supabase session (owner/admin) | Add Discord connection |
| `/api/discord-connections/[id]` | PATCH | `app/api/discord-connections/[id]/route.ts` | Supabase session (owner/admin) | Update bot token for connection |
| `/api/discord-connections/[id]` | DELETE | `app/api/discord-connections/[id]/route.ts` | Supabase session (owner/admin) | Remove Discord connection |
| `/api/integrations/oauth/start` | GET | `app/api/integrations/oauth/start/route.ts` | Supabase session (owner/admin) | Initiate OAuth flow for a service |
| `/api/integrations/oauth/callback` | GET | `app/api/integrations/oauth/callback/route.ts` | State cookie (from start) | OAuth callback for all providers |
| `/api/integrations/api-key` | POST | `app/api/integrations/api-key/route.ts` | Supabase session (owner/admin) | Save Toggl (or other API-key service) key |
| `/api/integrations/[service]` | DELETE | `app/api/integrations/[service]/route.ts` | Supabase session (owner/admin) | Disconnect an integration |
| `/api/settings/workspace` | POST | `app/api/settings/workspace/route.ts` | Supabase session (owner/admin) | Update workspace name |
| `/api/settings/workspace` | DELETE | `app/api/settings/workspace/route.ts` | Supabase session (owner only) | Delete workspace |
| `/api/settings/account/display-name` | POST | `app/api/settings/account/display-name/route.ts` | Supabase session (any role) | Update user display name |
| `/api/settings/account/password` | POST | `app/api/settings/account/password/route.ts` | Supabase session (any role) | Change user password |
| `/api/admin/tenants/[id]/suspend` | POST | `app/api/admin/tenants/[id]/suspend/route.ts` | Admin JWT claim | Suspend a tenant |
| `/api/admin/tenants/[id]/unsuspend` | POST | `app/api/admin/tenants/[id]/unsuspend/route.ts` | Admin JWT claim | Unsuspend a tenant |
| `/api/admin/tenants/[id]/plan` | PATCH | `app/api/admin/tenants/[id]/plan/route.ts` | Admin JWT claim | Override tenant plan |
| `/api/admin/tenants/[id]/impersonate` | POST | `app/api/admin/tenants/[id]/impersonate/route.ts` | Admin JWT claim | Create admin impersonation session |
| `/api/admin/tenants/[id]/revoke-api-key` | POST | `app/api/admin/tenants/[id]/revoke-api-key/route.ts` | Admin JWT claim | Revoke a tenant's API key |
| `/api/admin/tenants/[id]/service-connections/[connectionId]` | DELETE | `app/api/admin/tenants/[id]/service-connections/[connectionId]/route.ts` | Admin JWT claim | Revoke a tenant's service connection |
| `/api/admin/discord-connections/[connectionId]/reset` | PATCH | `app/api/admin/discord-connections/[connectionId]/reset/route.ts` | Admin JWT claim | Reset Discord connection to pending |
| `/api/admin/discord-connections/[connectionId]/disconnect` | PATCH | `app/api/admin/discord-connections/[connectionId]/disconnect/route.ts` | Admin JWT claim | Disconnect Discord connection |
| `/api/stripe/webhook` | POST | `app/api/stripe/webhook/route.ts` | Stripe signature | Receive Stripe webhook events |

---

## Shared Patterns

### Auth Guard Pattern (Tenant Routes)

Every tenant API route (non-admin, non-webhook) uses the same auth guard. File: `lib/api/withTenantAuth.ts`

```typescript
// Pseudocode for the auth wrapper used by all tenant routes
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function getTenantContext(req: NextRequest): Promise<{
  user: SupabaseUser;
  tenantId: string;
  role: 'owner' | 'admin' | 'member';
} | null> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: cookieStore.get.bind(cookieStore) } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Resolve tenant from the user's primary membership
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!membership) return null;

  return {
    user,
    tenantId: membership.tenant_id,
    role: membership.role as 'owner' | 'admin' | 'member',
  };
}
```

**Standard error responses for unauthenticated requests:**

```json
// 401 — Not authenticated
{ "error": "Authentication required." }

// 403 — Authenticated but insufficient role
{ "error": "Insufficient permissions." }
```

### Admin Auth Guard Pattern

Every admin API route checks the JWT `app_metadata.is_admin` claim. File: `lib/api/withAdminAuth.ts`

```typescript
export async function getAdminContext(req: NextRequest): Promise<{
  adminUser: SupabaseUser;
} | null> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: cookieStore.get.bind(cookieStore) } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  if (user.app_metadata?.is_admin !== true) return null;

  return { adminUser: user };
}
```

**Standard error response for non-admin access:**

```json
// 404 — Not found (intentionally obscures admin panel existence)
{ "error": "Not found." }
```

### Response Shape Convention

All API routes return JSON. Success responses always include either `{ "success": true }` or a data object. Error responses always include `{ "error": "..." }` and optionally `{ "field": "fieldName" }` for field-level errors.

```typescript
// Success shape examples:
{ "success": true }
{ "id": "uuid", "status": "pending" }
{ "url": "https://checkout.stripe.com/..." }

// Error shape examples:
{ "error": "Workspace name is required." }
{ "error": "Invalid bot token format.", "field": "bot_token" }
{ "error": "Plan limit reached. Upgrade to add more connections." }
```

---

## Section 1: Billing Routes

### `POST /api/billing/checkout`

**File:** `app/api/billing/checkout/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin` (members cannot initiate checkout).
**Purpose:** Creates a Stripe Checkout Session and returns the session URL. The client does `window.location.href = url` to redirect to Stripe.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "plan": "starter" | "pro",      // Required. Target plan.
  "billing": "monthly" | "annual" // Required. Billing cycle.
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Verify plan is `starter` or `pro`. If `free`: 400 (`"Cannot check out to the Free plan."`).
4. Map `(plan, billing)` to a Stripe Price ID:

| plan | billing | Env Var |
|------|---------|---------|
| `starter` | `monthly` | `STRIPE_PRICE_STARTER_MONTHLY` |
| `starter` | `annual` | `STRIPE_PRICE_STARTER_ANNUAL` |
| `pro` | `monthly` | `STRIPE_PRICE_PRO_MONTHLY` |
| `pro` | `annual` | `STRIPE_PRICE_PRO_ANNUAL` |

5. Look up `tenants.stripe_customer_id` for this tenant.
   - If NULL: create a new Stripe Customer (`stripe.customers.create({ email: user.email, metadata: { tenant_id: tenantId } })`) and save the returned `customer.id` to `tenants.stripe_customer_id`.
6. Create Stripe Checkout Session:

```typescript
const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=1`,
  metadata: { tenant_id: tenantId },
  subscription_data: {
    metadata: { tenant_id: tenantId },
  },
  allow_promotion_codes: true,
  billing_address_collection: 'auto',
});
```

7. Return `{ url: session.url }`.

#### Response

```
200 OK
{ "url": "https://checkout.stripe.com/c/pay/cs_live_..." }

400 Bad Request
{ "error": "Invalid plan." }
{ "error": "Invalid billing cycle." }
{ "error": "Cannot check out to the Free plan." }

403 Forbidden
{ "error": "Insufficient permissions." }

500 Internal Server Error
{ "error": "Failed to create checkout session. Please try again." }
```

---

### `POST /api/billing/portal`

**File:** `app/api/billing/portal/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Creates a Stripe Customer Portal session URL. Used for managing payment method, viewing invoices, and self-service cancellation.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body — empty or:
{}
```

No body parameters needed.

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Look up `tenants.stripe_customer_id`. If NULL: 400 (`"No billing account found. Please subscribe to a plan first."`).
4. Create Stripe Billing Portal session:

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?portal_return=1`,
});
```

5. Return `{ url: portalSession.url }`.

#### Response

```
200 OK
{ "url": "https://billing.stripe.com/p/session/..." }

400 Bad Request
{ "error": "No billing account found. Please subscribe to a plan first." }

403 Forbidden
{ "error": "Insufficient permissions." }

500 Internal Server Error
{ "error": "Failed to open billing portal. Please try again." }
```

---

### `POST /api/billing/downgrade`

**File:** `app/api/billing/downgrade/route.ts`
**Auth:** Supabase session required. Role must be `owner` (only owners can downgrade).
**Purpose:** Schedules a plan downgrade to take effect at the end of the current billing period. Calls Stripe to set `cancel_at_period_end` or schedule a subscription update.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "plan": "free" | "starter"  // Required. Target plan (must be lower than current plan).
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner`. If `admin` or `member`: 403 (`"Only the workspace owner can change the plan."`).
3. Look up current `tenants.plan` and `tenant_subscriptions.stripe_subscription_id`.
4. Validate: target plan must be lower than current plan. If current plan = `starter` and target = `pro`: 400 error.
5. If downgrading to `free`:
   - Call `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`.
   - This cancels the subscription at the end of the current billing period.
   - The Stripe `customer.subscription.deleted` webhook will fire at period end, which sets `tenants.plan = 'free'`.
6. If downgrading from `pro` to `starter`:
   - Look up the Starter monthly price ID (`STRIPE_PRICE_STARTER_MONTHLY`) or annual (`STRIPE_PRICE_STARTER_ANNUAL`) — match the existing billing cycle.
   - Call `stripe.subscriptions.update(subscriptionId, { items: [{ id: subscriptionItemId, price: starterPriceId }], proration_behavior: 'none', billing_cycle_anchor: 'unchanged' })`.
   - This schedules the price change at next renewal.
7. Return `{ success: true, effective_date: periodEnd }`.

#### Response

```
200 OK
{
  "success": true,
  "effective_date": "2027-01-14T00:00:00Z"  // ISO 8601 — the billing period end date
}

400 Bad Request
{ "error": "Invalid target plan." }
{ "error": "Target plan must be lower than your current plan." }
{ "error": "No active subscription found. Cannot downgrade." }

403 Forbidden
{ "error": "Only the workspace owner can change the plan." }

500 Internal Server Error
{ "error": "Failed to schedule downgrade. Please try again." }
```

---

### `POST /api/billing/api-keys`

**File:** `app/api/billing/api-keys/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Save or update an Anthropic or OpenAI API key. Validates the key against the provider before storing. Encrypts the key via Supabase Vault.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "key_type": "anthropic" | "openai",  // Required.
  "api_key": string                     // Required. The raw API key (plaintext).
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Server-side format validation:

| `key_type` | Format check | Error message |
|------------|-------------|---------------|
| `anthropic` | Must start with `sk-ant-` | `"Invalid Anthropic API key format."` |
| `openai` | Must start with `sk-` | `"Invalid OpenAI API key format."` |
| Either | Length < 20 | `"Key is too short to be valid."` |
| Either | Contains whitespace | `"Key must not contain spaces or newlines."` |

4. Live validation against provider:

**Anthropic validation:**
```typescript
// POST https://api.anthropic.com/v1/messages with the provided key
// Use minimal request: 1 token, claude-haiku to minimize cost
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': api_key,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1,
    messages: [{ role: 'user', content: 'Hi' }],
  }),
});
// 200 or 400 (request error) = key is valid; 401 = key is invalid
const validKey = response.status !== 401;
```

**OpenAI validation:**
```typescript
// GET https://api.openai.com/v1/models — lightest auth-check endpoint
const response = await fetch('https://api.openai.com/v1/models', {
  headers: { 'Authorization': `Bearer ${api_key}` },
});
// 200 = valid; 401 = invalid
const validKey = response.status === 200;
```

5. If validation fails: return 422 with provider-specific error.

6. If validation passes:
   a. Compute `key_hint`: first 10 chars + `...` + last 4 chars. Example: `sk-ant-api0...b12c`.
   b. Check for existing key of this `key_type` for this tenant:
      - If exists (`status != 'revoked'`): update flow — call `vault.updateSecret(existing.vault_secret_id, api_key)`, update `tenant_api_keys` row.
      - If not exists (or `status = 'revoked'`): insert flow — call `vault.createSecret(api_key)` to get `vault_secret_id`, insert new `tenant_api_keys` row.
   c. Upsert `tenant_api_keys`:

```sql
INSERT INTO tenant_api_keys (tenant_id, key_type, vault_secret_id, key_hint, status, validated_at)
VALUES ($tenant_id, $key_type, $vault_secret_id, $key_hint, 'active', NOW())
ON CONFLICT (tenant_id, key_type) DO UPDATE SET
  vault_secret_id = EXCLUDED.vault_secret_id,
  key_hint = EXCLUDED.key_hint,
  status = 'active',
  validated_at = NOW(),
  updated_at = NOW();
```

7. Return `{ success: true, id: keyId, key_hint: keyHint, status: 'active', validated_at: now }`.

#### Response

```
200 OK
{
  "success": true,
  "id": "a1b2c3d4-...",
  "key_type": "anthropic",
  "key_hint": "sk-ant-api0...b12c",
  "status": "active",
  "validated_at": "2026-03-13T10:00:00Z"
}

400 Bad Request
{ "error": "key_type must be 'anthropic' or 'openai'." }
{ "error": "Invalid Anthropic API key format.", "field": "api_key" }
{ "error": "Invalid OpenAI API key format.", "field": "api_key" }
{ "error": "Key is too short to be valid.", "field": "api_key" }
{ "error": "Key must not contain spaces or newlines.", "field": "api_key" }

403 Forbidden
{ "error": "Insufficient permissions." }

422 Unprocessable Entity
{ "error": "This key was rejected by Anthropic. Double-check it and try again.", "field": "api_key" }
{ "error": "This key was rejected by OpenAI. Double-check it and try again.", "field": "api_key" }

500 Internal Server Error
{ "error": "Failed to save API key. Please try again." }
```

---

### `DELETE /api/billing/api-keys/[id]`

**File:** `app/api/billing/api-keys/[id]/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Delete an API key. Revokes it from Vault and removes the database row.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | The `tenant_api_keys.id` of the key to delete. |

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Look up `tenant_api_keys` by `id` AND `tenant_id` (must belong to the caller's tenant):
   - If not found: 404.
4. Call Supabase Vault to delete the secret: `vault.deleteSecret(row.vault_secret_id)`.
5. Delete the `tenant_api_keys` row.
6. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

403 Forbidden
{ "error": "Insufficient permissions." }

404 Not Found
{ "error": "API key not found." }

500 Internal Server Error
{ "error": "Failed to delete API key. Please try again." }
```

---

## Section 2: Discord Connection Routes

### `POST /api/discord-connections`

**File:** `app/api/discord-connections/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Add a new Discord bot connection for the tenant. Validates the token format, checks plan limits, encrypts the token in Vault, and creates the `discord_connections` row.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "bot_token": string,  // Required. Raw Discord bot token (no "Bot " prefix).
  "guild_id": string    // Required. Discord guild (server) ID, 17–20 digit snowflake.
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Server-side format validation:

| Field | Validation | Error |
|-------|-----------|-------|
| `bot_token` | Matches `/^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{4,8}\.[A-Za-z0-9_-]{27}$/` (strip `Bot ` prefix first) | `"Invalid Discord bot token format."` |
| `guild_id` | Matches `/^\d{17,20}$/` | `"Invalid guild ID. Must be a 17–20 digit snowflake."` |

4. Strip `Bot ` prefix from `bot_token` if present (client might accidentally include it).

5. Check plan limit:
   - Free plan: max 1 connection.
   - Starter plan: max 3 connections.
   - Pro plan: unlimited.
   - Query `SELECT COUNT(*) FROM discord_connections WHERE tenant_id = $tenant_id AND status != 'disconnected'`.
   - If at limit: 403 with `"Plan limit reached. Upgrade to add more connections."`.

6. Check for duplicate: `SELECT id FROM discord_connections WHERE tenant_id = $tenant_id AND guild_id = $guild_id AND status != 'disconnected'`.
   - If exists: 409 (`"A connection for this guild already exists."`).

7. Store token in Vault:
   ```typescript
   const vaultSecretId = await vault.createSecret(bot_token, `discord_token_${tenantId}_${guildId}`);
   ```

8. Insert `discord_connections` row:
   ```sql
   INSERT INTO discord_connections (tenant_id, vault_secret_id, guild_id, status)
   VALUES ($tenant_id, $vault_secret_id, $guild_id, 'pending')
   RETURNING id, guild_id, status, created_at;
   ```

9. Return `{ id, guild_id, status: 'pending', created_at }`.

#### Response

```
201 Created
{
  "id": "a1b2c3d4-...",
  "guild_id": "1234567890123456789",
  "status": "pending",
  "created_at": "2026-03-13T10:00:00Z"
}

400 Bad Request
{ "error": "bot_token is required.", "field": "bot_token" }
{ "error": "Invalid Discord bot token format.", "field": "bot_token" }
{ "error": "guild_id is required.", "field": "guild_id" }
{ "error": "Invalid guild ID. Must be a 17–20 digit snowflake.", "field": "guild_id" }

403 Forbidden
{ "error": "Insufficient permissions." }
{ "error": "Plan limit reached. Upgrade to add more connections." }

409 Conflict
{ "error": "A connection for this guild already exists." }

500 Internal Server Error
{ "error": "Failed to add Discord connection. Please try again." }
```

---

### `PATCH /api/discord-connections/[id]`

**File:** `app/api/discord-connections/[id]/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Update the bot token for an existing Discord connection. Used when the user has regenerated their token in the Discord Developer Portal. Does not change the `guild_id`.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | The `discord_connections.id` of the connection to update. |

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "bot_token": string  // Required. New raw Discord bot token.
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Look up `discord_connections` by `id` AND `tenant_id`:
   - If not found: 404.
4. Validate `bot_token` format (same regex as POST). If invalid: 400.
5. Update token in Vault: `vault.updateSecret(existingRow.vault_secret_id, new_bot_token)`.
6. Update connection status to `connecting`:
   ```sql
   UPDATE discord_connections
   SET status = 'connecting', error_message = NULL, updated_at = NOW()
   WHERE id = $id AND tenant_id = $tenant_id;
   ```
7. Return `{ id, status: 'connecting' }`.

#### Response

```
200 OK
{
  "id": "a1b2c3d4-...",
  "status": "connecting"
}

400 Bad Request
{ "error": "bot_token is required.", "field": "bot_token" }
{ "error": "Invalid Discord bot token format.", "field": "bot_token" }

403 Forbidden
{ "error": "Insufficient permissions." }

404 Not Found
{ "error": "Connection not found." }

500 Internal Server Error
{ "error": "Failed to update bot token. Please try again." }
```

---

### `DELETE /api/discord-connections/[id]`

**File:** `app/api/discord-connections/[id]/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Remove a Discord connection. Deletes the Vault secret and the database row. The bot will disconnect immediately (via Realtime notification to the bot process).

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | The `discord_connections.id` of the connection to delete. |

#### Request

No request body.

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Look up `discord_connections` by `id` AND `tenant_id`:
   - If not found: 404.
4. Delete Vault secret: `vault.deleteSecret(row.vault_secret_id)`.
5. Delete `discord_connections` row:
   ```sql
   DELETE FROM discord_connections WHERE id = $id AND tenant_id = $tenant_id;
   ```
   - Note: Supabase Realtime Change Events will fire on this deletion. The bot process subscribes to this channel and will disconnect the corresponding `discord.py` client when it receives the DELETE event.
6. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

403 Forbidden
{ "error": "Insufficient permissions." }

404 Not Found
{ "error": "Connection not found." }

500 Internal Server Error
{ "error": "Failed to remove connection. Please try again." }
```

---

## Section 3: OAuth Integration Routes

### `GET /api/integrations/oauth/start`

**File:** `app/api/integrations/oauth/start/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Initiates the OAuth 2.0 Authorization Code flow for a given service. Sets HttpOnly state cookies and returns a 302 redirect to the provider's authorization URL.

#### Request

```typescript
// Query parameters
GET /api/integrations/oauth/start?service=github
GET /api/integrations/oauth/start?service=google
GET /api/integrations/oauth/start?service=linear
```

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `service` | string | Yes | `github`, `google`, `linear` |

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403 redirect to `/dashboard/integrations?error=forbidden`.
3. Validate `service` parameter. If invalid: 400 redirect to `/dashboard/integrations?error=invalid_service`.
4. Generate CSRF state: `const state = crypto.randomUUID()`.
5. Set three HttpOnly cookies (SameSite=Lax, Secure in production, max-age=600 seconds):

| Cookie Name | Value | TTL |
|-------------|-------|-----|
| `oauth_state` | The UUID state value | 10 minutes |
| `oauth_service` | The service name | 10 minutes |
| `oauth_tenant_id` | The tenant's UUID | 10 minutes |

6. Build authorization URL for the service:

**GitHub:**
```typescript
const url = new URL('https://github.com/login/oauth/authorize');
url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
url.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`);
url.searchParams.set('scope', 'read:user repo');
url.searchParams.set('state', state);
// No response_type needed — GitHub OAuth 2.0 defaults to code
```

**Google:**
```typescript
const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
url.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`);
url.searchParams.set('response_type', 'code');
url.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/analytics.readonly');
url.searchParams.set('state', state);
url.searchParams.set('access_type', 'offline');  // Required for refresh token
url.searchParams.set('prompt', 'consent');         // Force consent to get refresh token every time
```

**Linear:**
```typescript
const url = new URL('https://linear.app/oauth/authorize');
url.searchParams.set('client_id', process.env.LINEAR_CLIENT_ID!);
url.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`);
url.searchParams.set('response_type', 'code');
url.searchParams.set('scope', 'read,write');
url.searchParams.set('state', state);
```

7. Return 302 redirect to the authorization URL.

#### Response

```
302 Redirect → Provider authorization URL (e.g., https://github.com/login/oauth/authorize?...)

400 Bad Request (if service invalid, no redirect — JSON response):
{ "error": "Invalid service. Must be 'github', 'google', or 'linear'." }

403 Forbidden (if member role):
302 Redirect → /dashboard/integrations?error=forbidden
```

---

### `GET /api/integrations/oauth/callback`

**File:** `app/api/integrations/oauth/callback/route.ts`
**Auth:** State cookie from the start route (CSRF protection). No Supabase session check here — tenant context comes from the `oauth_tenant_id` cookie set by `/start`.
**Purpose:** Handles the OAuth redirect back from the provider. Exchanges the code for tokens, fetches user identity, stores tokens in Vault, upserts `tenant_service_connections`.

#### Request

```typescript
// Query parameters from provider redirect
GET /api/integrations/oauth/callback?code=XXXX&state=YYYY

// OR — on error/denial:
GET /api/integrations/oauth/callback?error=access_denied&state=YYYY
```

| Parameter | Source | Required | Description |
|-----------|--------|----------|-------------|
| `code` | Provider redirect | Yes (unless `error`) | Authorization code to exchange for tokens |
| `state` | Provider redirect | Yes | Must match `oauth_state` cookie |
| `error` | Provider redirect | No (present on denial) | `access_denied` or provider error code |

#### Processing Steps

1. Read cookies: `oauth_state`, `oauth_service`, `oauth_tenant_id`.
   - If any cookie missing: redirect to `/dashboard/integrations?error=session_expired`.
2. Verify `state` query parameter matches `oauth_state` cookie.
   - If mismatch: CSRF detected → redirect to `/dashboard/integrations?error=security_error`.
3. Clear all `oauth_*` cookies immediately (prevent replay).
4. Check for `error` parameter from provider:
   - `access_denied`: redirect to `/dashboard/integrations?error=access_denied&service={service}`.
   - Any other error: redirect to `/dashboard/integrations?error=provider_error&service={service}`.
5. Exchange `code` for tokens (provider-specific):

**GitHub token exchange:**
```typescript
const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`,
  }),
});
const tokens = await tokenResponse.json();
// tokens.access_token, tokens.scope, tokens.token_type
```

**Google token exchange:**
```typescript
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`,
    grant_type: 'authorization_code',
  }).toString(),
});
const tokens = await tokenResponse.json();
// tokens.access_token, tokens.refresh_token, tokens.expires_in, tokens.id_token
```

**Linear token exchange:**
```typescript
const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code,
    client_id: process.env.LINEAR_CLIENT_ID!,
    client_secret: process.env.LINEAR_CLIENT_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`,
    grant_type: 'authorization_code',
  }).toString(),
});
const tokens = await tokenResponse.json();
// tokens.access_token, tokens.token_type, tokens.scope
```

6. If token exchange fails: redirect to `/dashboard/integrations?error=token_exchange_failed&service={service}`.

7. Fetch user identity:

**GitHub identity:**
```typescript
const userResponse = await fetch('https://api.github.com/user', {
  headers: { 'Authorization': `Bearer ${tokens.access_token}` },
});
const ghUser = await userResponse.json();
// identity = { provider_user_id: String(ghUser.id), display_name: ghUser.login, email: ghUser.email }
```

**Google identity:**
```typescript
// Parse id_token JWT (base64 decode middle segment) — no additional request needed
const idTokenPayload = JSON.parse(atob(tokens.id_token.split('.')[1]));
// identity = { provider_user_id: idTokenPayload.sub, display_name: idTokenPayload.name, email: idTokenPayload.email }
```

**Linear identity:**
```typescript
const meResponse = await fetch('https://api.linear.app/graphql', {
  method: 'POST',
  headers: { 'Authorization': tokens.access_token, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ viewer { id name email } }' }),
});
const { data } = await meResponse.json();
// identity = { provider_user_id: data.viewer.id, display_name: data.viewer.name, email: data.viewer.email }
```

8. Build connection metadata:

```typescript
const metadata = {
  display_name: identity.display_name,
  email: identity.email,
  provider_user_id: identity.provider_user_id,
};
```

9. Store access token in Vault:
   ```typescript
   const vaultLabel = `oauth_${service}_${tenantId}`;
   // Check if existing vault secret for this tenant+service
   const existing = await supabase.from('tenant_service_connections')
     .select('vault_secret_id, refresh_vault_secret_id')
     .eq('tenant_id', tenantId)
     .eq('service_name', service)
     .maybeSingle();

   let vaultSecretId: string;
   if (existing?.vault_secret_id) {
     await vault.updateSecret(existing.vault_secret_id, tokens.access_token);
     vaultSecretId = existing.vault_secret_id;
   } else {
     vaultSecretId = await vault.createSecret(tokens.access_token, vaultLabel);
   }
   ```

10. For Google only — store refresh token separately:
    ```typescript
    let refreshVaultSecretId: string | null = null;
    if (service === 'google' && tokens.refresh_token) {
      const refreshLabel = `oauth_google_refresh_${tenantId}`;
      if (existing?.refresh_vault_secret_id) {
        await vault.updateSecret(existing.refresh_vault_secret_id, tokens.refresh_token);
        refreshVaultSecretId = existing.refresh_vault_secret_id;
      } else {
        refreshVaultSecretId = await vault.createSecret(tokens.refresh_token, refreshLabel);
      }
    }
    ```

11. Upsert `tenant_service_connections`:
    ```sql
    INSERT INTO tenant_service_connections (
      tenant_id, service_name, auth_type, vault_secret_id, refresh_vault_secret_id,
      token_expires_at, scopes, status, metadata
    ) VALUES (
      $tenant_id, $service, 'oauth', $vault_secret_id, $refresh_vault_secret_id,
      $token_expires_at,  -- NULL for GitHub/Linear; NOW() + interval for Google access token
      $scopes_array,
      'connected',
      $metadata_jsonb
    )
    ON CONFLICT (tenant_id, service_name) DO UPDATE SET
      vault_secret_id = EXCLUDED.vault_secret_id,
      refresh_vault_secret_id = EXCLUDED.refresh_vault_secret_id,
      token_expires_at = EXCLUDED.token_expires_at,
      scopes = EXCLUDED.scopes,
      status = 'connected',
      metadata = EXCLUDED.metadata,
      error_message = NULL,
      connected_at = NOW(),
      updated_at = NOW();
    ```

12. On success: redirect to `/dashboard/integrations?connected={service}`.
13. On any error after step 6: redirect to `/dashboard/integrations?error=connection_failed&service={service}`.

#### Response

All responses are 302 redirects (no JSON body).

```
302 Redirect → /dashboard/integrations?connected=github   (success)
302 Redirect → /dashboard/integrations?connected=google   (success)
302 Redirect → /dashboard/integrations?connected=linear   (success)

302 Redirect → /dashboard/integrations?error=session_expired         (cookies missing)
302 Redirect → /dashboard/integrations?error=security_error          (state mismatch)
302 Redirect → /dashboard/integrations?error=access_denied&service=github  (user denied)
302 Redirect → /dashboard/integrations?error=provider_error&service=github (provider error)
302 Redirect → /dashboard/integrations?error=token_exchange_failed&service=github
302 Redirect → /dashboard/integrations?error=connection_failed&service=github
302 Redirect → /dashboard/integrations?error=forbidden               (member role)
```

---

## Section 4: API Key Integration Routes

### `POST /api/integrations/api-key`

**File:** `app/api/integrations/api-key/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Save an API key for a non-OAuth integration (currently only Toggl). Validates the key against the provider's API before storing.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "service": "toggl",  // Required. Must be a valid api-key service name.
  "api_key": string    // Required. The API key to save.
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Validate `service` parameter. Currently only `"toggl"` is valid. Return 400 for any other value.
4. Service-specific format validation:

**Toggl format validation:**
```typescript
const TOGGL_KEY_REGEX = /^[a-z0-9]{32}$/;
if (!TOGGL_KEY_REGEX.test(api_key)) {
  return { error: "Invalid Toggl API key format. Must be a 32-character lowercase alphanumeric string.", field: "api_key" };
}
```

5. Live validation against Toggl API:
```typescript
const credentials = Buffer.from(`${api_key}:api_token`).toString('base64');
const response = await fetch('https://api.track.toggl.com/api/v9/me', {
  headers: { 'Authorization': `Basic ${credentials}` },
});
if (response.status === 403) {
  // 403 = wrong credentials for Toggl
  return { error: "Toggl rejected this API key. Check it in your Toggl profile at https://track.toggl.com/profile." };
}
if (!response.ok) {
  return { error: "Could not reach Toggl to verify the key. Please try again." };
}
const togglUser = await response.json();
// identity = { provider_user_id: String(togglUser.id), display_name: togglUser.fullname, email: togglUser.email }
```

6. Store key in Vault (same upsert pattern as OAuth):
   ```typescript
   const vaultLabel = `api_key_toggl_${tenantId}`;
   // Check for existing connection
   const existing = await supabase.from('tenant_service_connections')
     .select('vault_secret_id')
     .eq('tenant_id', tenantId)
     .eq('service_name', 'toggl')
     .maybeSingle();

   let vaultSecretId: string;
   if (existing?.vault_secret_id) {
     await vault.updateSecret(existing.vault_secret_id, api_key);
     vaultSecretId = existing.vault_secret_id;
   } else {
     vaultSecretId = await vault.createSecret(api_key, vaultLabel);
   }
   ```

7. Upsert `tenant_service_connections`:
   ```sql
   INSERT INTO tenant_service_connections (
     tenant_id, service_name, auth_type, vault_secret_id,
     refresh_vault_secret_id, token_expires_at, scopes, status, metadata
   ) VALUES (
     $tenant_id, 'toggl', 'api_key', $vault_secret_id,
     NULL, NULL, '{}',
     'connected',
     '{"display_name": "...", "email": "...", "provider_user_id": "..."}'
   )
   ON CONFLICT (tenant_id, service_name) DO UPDATE SET
     vault_secret_id = EXCLUDED.vault_secret_id,
     status = 'connected',
     metadata = EXCLUDED.metadata,
     error_message = NULL,
     connected_at = NOW(),
     updated_at = NOW();
   ```

8. Return `{ success: true, service: 'toggl', status: 'connected' }`.

#### Response

```
200 OK
{
  "success": true,
  "service": "toggl",
  "status": "connected"
}

400 Bad Request
{ "error": "service is required." }
{ "error": "Unknown service 'foo'. Supported API key services: toggl." }
{ "error": "Invalid Toggl API key format. Must be a 32-character lowercase alphanumeric string.", "field": "api_key" }

403 Forbidden
{ "error": "Insufficient permissions." }

422 Unprocessable Entity
{ "error": "Toggl rejected this API key. Check it in your Toggl profile at https://track.toggl.com/profile.", "field": "api_key" }
{ "error": "Could not reach Toggl to verify the key. Please try again.", "field": "api_key" }

500 Internal Server Error
{ "error": "Failed to save integration. Please try again." }
```

---

### `DELETE /api/integrations/[service]`

**File:** `app/api/integrations/[service]/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Disconnect an integration (any service: `github`, `google`, `linear`, `toggl`). Deletes the Vault secret(s) and removes the `tenant_service_connections` row.

#### URL Parameters

| Parameter | Type | Values |
|-----------|------|--------|
| `service` | string | `github`, `google`, `linear`, `toggl` |

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403.
3. Validate `service`. If not one of the four supported services: 404.
4. Look up `tenant_service_connections` by `tenant_id` AND `service_name`:
   - If not found: 404 (`"No connection found for service [service]."`).
5. Delete Vault secrets:
   - Always delete `vault_secret_id`.
   - For Google only: also delete `refresh_vault_secret_id` if not NULL.
6. Delete `tenant_service_connections` row.
7. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

403 Forbidden
{ "error": "Insufficient permissions." }

404 Not Found
{ "error": "No connection found for service github." }
{ "error": "Unknown service." }

500 Internal Server Error
{ "error": "Failed to disconnect service. Please try again." }
```

---

## Section 5: Settings Routes

### `POST /api/settings/workspace`

**File:** `app/api/settings/workspace/route.ts`
**Auth:** Supabase session required. Role must be `owner` or `admin`.
**Purpose:** Update the tenant's workspace name.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "name": string  // Required. New workspace name. 1–100 characters.
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner` or `admin`. If `member`: 403 (`"Only workspace owners and admins can update workspace settings."`).
3. Validate `name`:
   - If empty or whitespace-only: 400 (`"Workspace name is required."`).
   - If > 100 characters: 400 (`"Workspace name must be 100 characters or less."`).
4. Update `tenants.name`:
   ```sql
   UPDATE tenants SET name = $name, updated_at = NOW()
   WHERE id = $tenant_id;
   ```
5. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

400 Bad Request
{ "error": "Workspace name is required.", "field": "name" }
{ "error": "Workspace name must be 100 characters or less.", "field": "name" }

403 Forbidden
{ "error": "Only workspace owners and admins can update workspace settings." }

500 Internal Server Error
{ "error": "Failed to update workspace name. Please try again." }
```

---

### `DELETE /api/settings/workspace`

**File:** `app/api/settings/workspace/route.ts`
**Auth:** Supabase session required. Role must be `owner`.
**Purpose:** Permanently delete the workspace and all associated data. Irreversible.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "confirm_name": string  // Required. Must match the workspace name exactly (case-sensitive).
}
```

#### Processing Steps

1. Get authenticated user + tenant context.
2. Verify role is `owner`. If `admin` or `member`: 403 (`"Only the workspace owner can delete the workspace."`).
3. Look up current `tenants.name`.
4. Verify `confirm_name === tenant.name`. If mismatch: 400 (`"Confirmation text did not match workspace name."`).
5. Execute deletion sequence in a single database transaction (order matters for FK constraints):

```sql
-- Step 1: Delete service connections (removes Vault refs — must delete Vault secrets separately, see step 4 code)
DELETE FROM tenant_service_connections WHERE tenant_id = $tenant_id;

-- Step 2: Delete API keys (Vault secrets already deleted in code before this)
DELETE FROM tenant_api_keys WHERE tenant_id = $tenant_id;

-- Step 3: Delete Discord connections (bot will receive Realtime delete event and disconnect)
DELETE FROM discord_connections WHERE tenant_id = $tenant_id;

-- Step 4: Delete subscription record
DELETE FROM tenant_subscriptions WHERE tenant_id = $tenant_id;

-- Step 5: Delete tenant members (caller will lose access)
DELETE FROM tenant_members WHERE tenant_id = $tenant_id;

-- Step 6: Delete the tenant itself
DELETE FROM tenants WHERE id = $tenant_id;
```

Note on Vault cleanup: Before the SQL deletions, the API route must fetch all Vault secret IDs from `tenant_service_connections` and `tenant_api_keys`, then call `vault.deleteSecret()` for each. Vault deletion cannot be rolled back inside a SQL transaction — do it before the transaction.

Note on Stripe: The API route does NOT cancel the Stripe subscription — that is handled asynchronously. Log a background job or send an internal Slack notification to handle manual Stripe cleanup if needed. (At v1 scale, this is acceptable.)

6. Sign out the user: call `supabase.auth.signOut()` server-side (invalidate the session).
7. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

400 Bad Request
{ "error": "Confirmation text did not match workspace name.", "field": "confirm_name" }
{ "error": "confirm_name is required.", "field": "confirm_name" }

403 Forbidden
{ "error": "Only the workspace owner can delete the workspace." }

500 Internal Server Error
{ "error": "Failed to delete workspace. Please contact support if the issue persists." }
```

---

### `POST /api/settings/account/display-name`

**File:** `app/api/settings/account/display-name/route.ts`
**Auth:** Supabase session required. Any role.
**Purpose:** Update the authenticated user's display name (`user_metadata.full_name`).

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "full_name": string  // Required. Can be empty string (clears name). Max 100 chars.
}
```

#### Processing Steps

1. Get authenticated user (any role — no tenant membership check needed).
2. Validate `full_name`:
   - If > 100 characters: 400 (`"Display name must be 100 characters or less."`).
3. Update user metadata:
   ```typescript
   await supabase.auth.updateUser({ data: { full_name: full_name } });
   ```
4. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

400 Bad Request
{ "error": "Display name must be 100 characters or less.", "field": "full_name" }

500 Internal Server Error
{ "error": "Failed to update display name. Please try again." }
```

---

### `POST /api/settings/account/password`

**File:** `app/api/settings/account/password/route.ts`
**Auth:** Supabase session required. Any role.
**Purpose:** Change the authenticated user's password. Verifies the current password before updating.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "current_password": string,  // Required.
  "new_password": string       // Required. Min 8 characters.
}
```

#### Processing Steps

1. Get authenticated user.
2. Validate `new_password`:
   - If empty: 400.
   - If < 8 characters: 400 (`"Password must be at least 8 characters."`).
3. Verify current password by calling `signInWithPassword`:
   ```typescript
   const anonClient = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   const { error } = await anonClient.auth.signInWithPassword({
     email: user.email!,
     password: current_password,
   });
   if (error?.message.includes('invalid_credentials')) {
     return 401 { "error": "Current password is incorrect.", "field": "current_password" };
   }
   ```
4. Update password using service role:
   ```typescript
   const adminClient = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
   await adminClient.auth.admin.updateUserById(user.id, { password: new_password });
   ```
5. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

400 Bad Request
{ "error": "current_password is required.", "field": "current_password" }
{ "error": "new_password is required.", "field": "new_password" }
{ "error": "Password must be at least 8 characters.", "field": "new_password" }

401 Unauthorized
{ "error": "Current password is incorrect.", "field": "current_password" }

500 Internal Server Error
{ "error": "Failed to update password. Please try again." }
```

---

## Section 6: Admin Routes

All admin routes:
- Require Supabase session with `app_metadata.is_admin === true`.
- Return `404 { "error": "Not found." }` for unauthenticated or non-admin access (security through obscurity).
- Use the Supabase service role client to bypass RLS.
- Write to `admin_audit_log` for every mutation.

**Audit log write pattern:**
```typescript
await supabaseAdmin.from('admin_audit_log').insert({
  admin_user_id: adminUser.id,
  action_type: 'ACTION_TYPE',       // See table below for valid types
  target_tenant_id: tenantId,        // Required for tenant-scoped actions
  target_resource_id: resourceId,    // Optional — UUID of affected row
  metadata: { /* action-specific */ }
});
```

**`admin_audit_log.action_type` valid values:**

| Value | When Used |
|-------|----------|
| `tenant_suspended` | Admin suspended a tenant |
| `tenant_unsuspended` | Admin unsuspended a tenant |
| `tenant_plan_override` | Admin changed tenant plan |
| `tenant_impersonated` | Admin started impersonation session |
| `api_key_revoked_by_admin` | Admin revoked a tenant's API key |
| `discord_connection_reset` | Admin reset or disconnected a Discord connection |
| `service_connection_revoked_by_admin` | Admin revoked a tenant's service connection |

---

### `POST /api/admin/tenants/[id]/suspend`

**File:** `app/api/admin/tenants/[id]/suspend/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Suspend a tenant. Sets `tenants.status = 'suspended'`. The bot reads tenant status via Supabase Realtime and disconnects all Discord connections for suspended tenants.

#### URL Parameters

| Parameter | Type |
|-----------|------|
| `id` | Tenant UUID |

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "reason": string  // Optional. Admin note about why tenant is being suspended. Max 500 chars.
}
```

#### Processing Steps

1. Verify admin JWT claim.
2. Look up tenant by `id`. If not found: 404.
3. Check current status: if already `suspended`: 400 (`"Tenant is already suspended."`).
4. Update `tenants`:
   ```sql
   UPDATE tenants
   SET status = 'suspended', updated_at = NOW()
   WHERE id = $tenant_id;
   ```
5. Write audit log entry: `action_type = 'tenant_suspended'`, `metadata = { reason: reason || null }`.
6. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

400 Bad Request
{ "error": "Tenant is already suspended." }

404 Not Found
{ "error": "Not found." }

500 Internal Server Error
{ "error": "Failed to suspend tenant." }
```

---

### `POST /api/admin/tenants/[id]/unsuspend`

**File:** `app/api/admin/tenants/[id]/unsuspend/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Unsuspend a tenant. Sets `tenants.status = 'active'` (or `'configured'` if they have a Discord connection but the bot hasn't yet reconnected).

#### Request

No request body.

#### Processing Steps

1. Verify admin JWT claim.
2. Look up tenant by `id`. If not found: 404.
3. Check current status: if not `suspended`: 400 (`"Tenant is not suspended."`).
4. Determine new status:
   - If tenant has at least one `discord_connections` row with `status != 'disconnected'`: set `tenants.status = 'configured'`.
   - Otherwise: set `tenants.status = 'pending'`.
5. Update `tenants`:
   ```sql
   UPDATE tenants SET status = $new_status, updated_at = NOW() WHERE id = $tenant_id;
   ```
6. Write audit log: `action_type = 'tenant_unsuspended'`.
7. Return `{ success: true, new_status: newStatus }`.

#### Response

```
200 OK
{ "success": true, "new_status": "configured" }

400 Bad Request
{ "error": "Tenant is not suspended." }

404 Not Found
{ "error": "Not found." }
```

---

### `PATCH /api/admin/tenants/[id]/plan`

**File:** `app/api/admin/tenants/[id]/plan/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Override a tenant's plan. Bypasses Stripe billing — for use when granting free access, correcting plan states, or testing.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "plan": "free" | "starter" | "pro"  // Required.
}
```

#### Processing Steps

1. Verify admin JWT claim.
2. Look up tenant by `id`. If not found: 404.
3. Validate `plan`. If invalid: 400.
4. Update `tenants.plan`:
   ```sql
   UPDATE tenants SET plan = $plan, updated_at = NOW() WHERE id = $tenant_id;
   ```
5. Write audit log: `action_type = 'tenant_plan_override'`, `metadata = { old_plan: currentPlan, new_plan: plan }`.
6. Return `{ success: true, plan: plan }`.

#### Response

```
200 OK
{ "success": true, "plan": "starter" }

400 Bad Request
{ "error": "plan must be 'free', 'starter', or 'pro'." }

404 Not Found
{ "error": "Not found." }
```

---

### `POST /api/admin/tenants/[id]/impersonate`

**File:** `app/api/admin/tenants/[id]/impersonate/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Create an impersonation session for debugging a tenant's dashboard. Returns a magic link that logs the admin in as the tenant owner.

#### Request

No request body.

#### Processing Steps

1. Verify admin JWT claim.
2. Look up tenant by `id`. If not found: 404.
3. Find the owner user ID:
   ```sql
   SELECT user_id FROM tenant_members WHERE tenant_id = $tenant_id AND role = 'owner' LIMIT 1;
   ```
4. Generate a Supabase admin-created magic link:
   ```typescript
   const { data, error } = await supabaseAdmin.auth.admin.generateLink({
     type: 'magiclink',
     email: ownerEmail,  // Fetched from auth.users
     options: {
       redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
       data: { impersonated_by: adminUser.id },
     },
   });
   ```
5. Write audit log: `action_type = 'tenant_impersonated'`, `metadata = { target_user_id: ownerUserId }`.
6. Return `{ impersonation_url: data.properties.action_link }`.

**Security note:** The returned URL is a one-time magic link. It expires after 1 hour. The admin should open it in an incognito window to avoid disrupting their own session.

#### Response

```
200 OK
{ "impersonation_url": "https://..." }

404 Not Found
{ "error": "Not found." }
{ "error": "No owner found for this tenant." }

500 Internal Server Error
{ "error": "Failed to generate impersonation link." }
```

---

### `POST /api/admin/tenants/[id]/revoke-api-key`

**File:** `app/api/admin/tenants/[id]/revoke-api-key/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Revoke a specific API key for a tenant. Updates status to `revoked` and deletes the Vault secret.

#### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  "keyId": string,   // Required. UUID of the tenant_api_keys row.
  "reason": string   // Optional. Admin note, max 500 chars.
}
```

#### Processing Steps

1. Verify admin JWT claim.
2. Look up `tenant_api_keys` by `keyId` AND `tenant_id` = `[id]`. If not found: 404.
3. Delete Vault secret: `vault.deleteSecret(row.vault_secret_id)`.
4. Update key status:
   ```sql
   UPDATE tenant_api_keys
   SET status = 'revoked', updated_at = NOW()
   WHERE id = $key_id AND tenant_id = $tenant_id;
   ```
5. Write audit log: `action_type = 'api_key_revoked_by_admin'`, `metadata = { key_type: row.key_type, reason: reason || null }`.
6. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

404 Not Found
{ "error": "Not found." }

500 Internal Server Error
{ "error": "Failed to revoke API key." }
```

---

### `DELETE /api/admin/tenants/[id]/service-connections/[connectionId]`

**File:** `app/api/admin/tenants/[id]/service-connections/[connectionId]/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Revoke a service connection for a tenant. Deletes Vault secrets and the `tenant_service_connections` row.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Tenant ID |
| `connectionId` | UUID | `tenant_service_connections.id` |

#### Processing Steps

1. Verify admin JWT claim.
2. Look up `tenant_service_connections` by `connectionId` AND `tenant_id = id`. If not found: 404.
3. Delete Vault secrets (access token + refresh token if present).
4. Delete `tenant_service_connections` row.
5. Write audit log: `action_type = 'service_connection_revoked_by_admin'`, `metadata = { service: row.service_name }`.
6. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

404 Not Found
{ "error": "Not found." }
```

---

### `PATCH /api/admin/discord-connections/[connectionId]/reset`

**File:** `app/api/admin/discord-connections/[connectionId]/reset/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Reset a Discord connection's status back to `pending`. This triggers the bot to reattempt the connection via Realtime.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `connectionId` | UUID | `discord_connections.id` |

#### Processing Steps

1. Verify admin JWT claim.
2. Look up `discord_connections` by `connectionId`. If not found: 404.
3. Update status:
   ```sql
   UPDATE discord_connections
   SET status = 'pending', error_message = NULL, updated_at = NOW()
   WHERE id = $connection_id;
   ```
4. Write audit log: `action_type = 'discord_connection_reset'`, `target_tenant_id = row.tenant_id`, `metadata = { connection_id: connectionId, new_status: 'pending' }`.
5. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

404 Not Found
{ "error": "Not found." }
```

---

### `PATCH /api/admin/discord-connections/[connectionId]/disconnect`

**File:** `app/api/admin/discord-connections/[connectionId]/disconnect/route.ts`
**Auth:** Admin JWT claim required.
**Purpose:** Administratively disconnect a Discord connection. Sets `status = 'disconnected'`. The bot token is NOT deleted — the tenant can reconnect from their Settings page.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `connectionId` | UUID | `discord_connections.id` |

#### Processing Steps

1. Verify admin JWT claim.
2. Look up `discord_connections` by `connectionId`. If not found: 404.
3. Update status:
   ```sql
   UPDATE discord_connections
   SET status = 'disconnected', updated_at = NOW()
   WHERE id = $connection_id;
   ```
4. Write audit log: `action_type = 'discord_connection_reset'`, `target_tenant_id = row.tenant_id`, `metadata = { connection_id: connectionId, new_status: 'disconnected' }`.
5. Return `{ success: true }`.

#### Response

```
200 OK
{ "success": true }

404 Not Found
{ "error": "Not found." }
```

---

## Section 7: Stripe Webhook

### `POST /api/stripe/webhook`

See [webhooks.md](./webhooks.md) for the full specification of this route.

**File:** `app/api/stripe/webhook/route.ts`
**Auth:** Stripe signature verification only (NOT Supabase auth).
**Key constraint:** Must use `await req.text()` to read raw body — do NOT use `req.json()`.
**Middleware exclusion:** This route must be excluded from the Supabase auth middleware (see `middleware.ts` spec in [auth.md](./auth.md)).

---

## Section 8: Middleware

**File:** `middleware.ts`
**Purpose:** Runs on every request to protect authenticated routes and admin routes. Also refreshes Supabase sessions.

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for Stripe webhook — must receive raw body
  if (pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.next();
  }

  // 2. Skip middleware for public static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next();
  }

  // 3. Set up response to allow session cookie refresh
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 4. Refresh session (critical — keeps token from expiring mid-session)
  const { data: { user } } = await supabase.auth.getUser();

  // 5. Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
    }
    if (user.app_metadata?.is_admin !== true) {
      // Return 404 to avoid leaking that admin panel exists
      return NextResponse.rewrite(new URL('/404', request.url));
    }
    return response;
  }

  // 6. Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
    }
    return response;
  }

  // 7. Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and Stripe webhook
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)',
  ],
};
```

---

## Section 9: Supabase Client Factory Patterns

API routes use different Supabase clients depending on the context. The following factory functions are used throughout the codebase. See [auth.md](./auth.md) for the full auth spec.

### Browser Client (`lib/supabase/client.ts`)

Used in Client Components (React hooks, event handlers).

```typescript
import { createBrowserClient } from '@supabase/ssr';
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### Server Client (`lib/supabase/server.ts`)

Used in Server Components, Server Actions, and API Routes for user-scoped queries (with RLS).

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const createClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => { try { cookieStore.set({ name, value, ...options }); } catch {} },
        remove: (name, options) => { try { cookieStore.set({ name, value: '', ...options }); } catch {} },
      },
    }
  );
};
```

### Service Role Client (`lib/supabase/admin.ts`)

Used in API Routes that need to bypass RLS (admin actions, password change, tenant deletion). **Never used in Client Components.** **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.**

```typescript
import { createClient } from '@supabase/supabase-js';
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
```

---

## Section 10: Error Handling Conventions

### Network Errors

All API routes must catch unhandled errors and return 500:

```typescript
try {
  // ... route logic
} catch (error) {
  console.error('[route-name]', error);
  return Response.json({ error: 'Internal server error.' }, { status: 500 });
}
```

### Supabase Errors

When a Supabase query returns an error, check `data.error`:

```typescript
const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
if (error) {
  if (error.code === 'PGRST116') {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }
  throw error; // Caught by outer try/catch → 500
}
```

**Supabase PostgreSQL error code `PGRST116`** = 0 rows returned by `.single()`. Always map to 404, not 500.

### Field-Level Errors

When a validation error applies to a specific form field, include `"field"` in the response:

```json
{ "error": "Bot token is required.", "field": "bot_token" }
```

The client reads `response.field` to know which form field to highlight with the error message.

### Timeout Convention

All outbound HTTP calls (provider validation, Stripe API) must have a 10-second timeout using `AbortController`:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);
try {
  const response = await fetch(url, { signal: controller.signal, ...options });
  // ...
} finally {
  clearTimeout(timeout);
}
```

If the fetch times out: return 503 `{ "error": "Provider service unavailable. Please try again." }`.

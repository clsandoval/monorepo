# Database Triggers — Daimon SaaS Multi-Tenant Platform

**Aspect:** 8.1.7 — Standalone trigger reference extracted from schema.md and migrations.md
**Wave:** Wave 8 Gap Remediation
**Written:** 2026-03-13
**References:**
- [schema.md](./schema.md) — Full table definitions and inline trigger context
- [migrations.md](./migrations.md) — Migration files that create each trigger
- [rls-policies.md](./rls-policies.md) — RLS policies that operate alongside these triggers

---

## Overview

This file is the canonical reference for all PostgreSQL trigger functions and trigger definitions for the Daimon SaaS platform's new multi-tenant tables. It consolidates triggers scattered across schema.md into a single location for quick lookup by forward-loop developers.

**Trigger inventory:**

| # | Trigger Name | Table | Event | Function Called | Purpose |
|---|-------------|-------|-------|-----------------|---------|
| 1 | `tenants_updated_at` | `tenants` | BEFORE UPDATE | `update_updated_at_column()` | Auto-timestamp |
| 2 | `discord_connections_updated_at` | `discord_connections` | BEFORE UPDATE | `update_updated_at_column()` | Auto-timestamp |
| 3 | `tenant_api_keys_updated_at` | `tenant_api_keys` | BEFORE UPDATE | `update_updated_at_column()` | Auto-timestamp |
| 4 | `trg_tenant_service_connections_updated_at` | `tenant_service_connections` | BEFORE UPDATE | `update_tenant_service_connections_updated_at()` | Auto-timestamp |
| 5 | `tenant_subscriptions_updated_at` | `tenant_subscriptions` | BEFORE UPDATE | `update_tenant_subscriptions_updated_at()` | Auto-timestamp |
| 6 | `trg_sync_tenant_plan` | `tenant_subscriptions` | AFTER INSERT OR UPDATE OF plan | `sync_tenant_plan()` | Cascade plan to `tenants.plan` |
| 7 | `trg_suspend_tenant_on_unpaid` | `tenant_subscriptions` | AFTER UPDATE OF status | `suspend_tenant_on_unpaid()` | Cascade suspension to `tenants.status` |

**No triggers on:** `tenant_members` (no `updated_at` column), `stripe_webhook_events` (append-only idempotency store, no modification tracking needed).

---

## Shared Function: `update_updated_at_column()`

**Status:** Pre-existing — already deployed in the database.
**Origin:** Created by migration `20251104000000_create_discord_workflow_system.sql` for the existing bot workflow tables.
**Do NOT recreate** in Daimon SaaS migrations. Reference it directly from new triggers.

```sql
-- Already exists in the database. Do not CREATE OR REPLACE in new migrations.
-- Shown here for reference only:
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

**Used by:** `tenants_updated_at`, `discord_connections_updated_at`, `tenant_api_keys_updated_at`.

**Why three tables use this shared function** and two use dedicated functions: `tenants`, `discord_connections`, and `tenant_api_keys` were designed first and naturally reference the pre-existing shared function. `tenant_service_connections` and `tenant_subscriptions` were specced later with dedicated functions for explicitness (either approach is correct). In production, all five could use the shared function — the dedicated functions are functionally identical.

---

## Trigger 1: `tenants_updated_at`

**Purpose:** Auto-set `tenants.updated_at = NOW()` on every UPDATE to the `tenants` row.

**Table:** `public.tenants`
**Migration:** `20260400000001_create_tenants.sql`

```sql
CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

**Frequency analysis:**
- Fires when: (a) user updates tenant name in Settings, (b) Stripe webhook updates `stripe_customer_id`, (c) `sync_tenant_plan` trigger updates `plan`/`updated_at`, (d) `suspend_tenant_on_unpaid` trigger updates `status`/`updated_at`, (e) bot updates `tenants.status` via Realtime event, (f) admin updates tenant via admin panel.
- Estimated rate: very low — < 1 per second at any realistic tenant count.

**Side note:** When `sync_tenant_plan()` or `suspend_tenant_on_unpaid()` UPDATEs `tenants`, this trigger fires on that nested UPDATE. The trigger chain is: Stripe webhook → UPDATE `tenant_subscriptions` → `trg_sync_tenant_plan` fires → UPDATEs `tenants` → `tenants_updated_at` fires. This is expected and correct behavior.

---

## Trigger 2: `discord_connections_updated_at`

**Purpose:** Auto-set `discord_connections.updated_at = NOW()` on every UPDATE.

**Table:** `public.discord_connections`
**Migration:** `20260400000003_create_discord_connections.sql`

```sql
CREATE TRIGGER discord_connections_updated_at
    BEFORE UPDATE ON public.discord_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

**Frequency analysis:**
- Fires when: (a) bot writes heartbeat (`last_heartbeat`, `latency_ms`) — every 30 seconds per active tenant, (b) user disconnects bot (status → `disconnected`), (c) admin disconnects or suspends (status → `suspended`), (d) user updates bot token (vault_secret_id change), (e) bot sets error_message on failure.
- **Hot path:** At 500 active tenants, this trigger executes ~16 times per second (500 tenants × 1 heartbeat per 30s). `update_updated_at_column()` is a trivial `NEW.updated_at = NOW(); RETURN NEW;` function — well within PostgreSQL's capability at this rate.
- **Supabase Realtime note:** Each heartbeat UPDATE fires this trigger AND emits a Realtime event. Realtime is filtered server-side by channel filters (e.g., `tenant_id=eq.{id}`), so only the relevant bot process receives each event. See [../multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) for channel configuration.

---

## Trigger 3: `tenant_api_keys_updated_at`

**Purpose:** Auto-set `tenant_api_keys.updated_at = NOW()` on every UPDATE.

**Table:** `public.tenant_api_keys`
**Migration:** `20260400000004_create_tenant_api_keys.sql`

```sql
CREATE TRIGGER tenant_api_keys_updated_at
    BEFORE UPDATE ON public.tenant_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

**Frequency analysis:**
- Fires when: (a) tenant saves/replaces API key — rare (1–2 times in tenant lifetime), (b) bot marks key `'invalid'` on auth failure — rare, (c) admin revokes key via admin panel — rare.
- No performance concern at any realistic scale.

---

## Trigger 4: `trg_tenant_service_connections_updated_at`

**Purpose:** Auto-set `tenant_service_connections.updated_at = NOW()` on every UPDATE.

**Table:** `public.tenant_service_connections`
**Migration:** `20260400000005_create_tenant_service_connections.sql`

**Function (new — create in migration 005):**

```sql
CREATE OR REPLACE FUNCTION public.update_tenant_service_connections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

**Trigger:**

```sql
CREATE TRIGGER trg_tenant_service_connections_updated_at
    BEFORE UPDATE ON public.tenant_service_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tenant_service_connections_updated_at();
```

**Frequency analysis:**
- Fires when: (a) OAuth token refresh (access token replaced, `token_expires_at` updated) — periodic per Google-connected tenant, (b) service disconnected (status → `revoked`), (c) bot sets `last_used_at`, (d) bot sets status → `expired` or `error` on auth failure.
- Google token refresh runs every ~55 minutes per Google-connected tenant. At 100 Google-connected tenants, this is ~1.8 triggers/minute. Low frequency.

**Alternative:** Could use `public.update_updated_at_column()` instead of a dedicated function. The dedicated function is used here for explicitness but the shared function is functionally identical.

---

## Trigger 5: `tenant_subscriptions_updated_at`

**Purpose:** Auto-set `tenant_subscriptions.updated_at = NOW()` on every UPDATE.

**Table:** `public.tenant_subscriptions`
**Migration:** `20260400000006_create_tenant_subscriptions.sql`

**Function (new — create in migration 006):**

```sql
CREATE OR REPLACE FUNCTION public.update_tenant_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

**Trigger:**

```sql
CREATE TRIGGER tenant_subscriptions_updated_at
    BEFORE UPDATE ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tenant_subscriptions_updated_at();
```

**Frequency analysis:**
- Fires on every Stripe webhook event that UPDATEs this table: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.trial_will_end`.
- Low frequency: webhooks arrive ~monthly (billing cycle renewal) or on user-initiated plan changes. No performance concern.
- **Trigger ordering:** When the Stripe webhook handler UPDATEs `tenant_subscriptions`, multiple triggers fire in sequence:
  1. `tenant_subscriptions_updated_at` (BEFORE UPDATE — sets `updated_at`)
  2. `trg_sync_tenant_plan` (AFTER UPDATE OF plan — if plan changed)
  3. `trg_suspend_tenant_on_unpaid` (AFTER UPDATE OF status — if status = 'unpaid')
  PostgreSQL guarantees BEFORE triggers fire before AFTER triggers. The `updated_at` trigger fires first.

---

## Trigger 6: `trg_sync_tenant_plan` (Plan Cascade)

**Purpose:** Keep `tenants.plan` in sync with `tenant_subscriptions.plan`. When Stripe changes the subscription plan, this trigger immediately propagates the new plan to the denormalized `tenants.plan` column without requiring application code to update both tables.

**Table:** `public.tenant_subscriptions`
**Migration:** `20260400000006_create_tenant_subscriptions.sql`
**Security:** `SECURITY DEFINER` — the trigger runs with the privileges of the function owner (not the calling role), enabling it to UPDATE `tenants` from a context where the calling role might not have permission.

**Function:**

```sql
CREATE OR REPLACE FUNCTION public.sync_tenant_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only fire when the plan column actually changes (not on every UPDATE)
    IF (TG_OP = 'INSERT') OR (OLD.plan IS DISTINCT FROM NEW.plan) THEN
        UPDATE public.tenants
        SET
            plan       = NEW.plan,
            updated_at = NOW()
        WHERE id = NEW.tenant_id;
    END IF;

    RETURN NEW;
END;
$$;
```

**Trigger:**

```sql
CREATE TRIGGER trg_sync_tenant_plan
    AFTER INSERT OR UPDATE OF plan ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_tenant_plan();
```

**Trigger properties:**

| Property | Value |
|----------|-------|
| Timing | AFTER (fires after the `tenant_subscriptions` row is written and committed) |
| Events | INSERT (new subscription row) and UPDATE OF plan (plan column changed) |
| Guard | `OLD.plan IS DISTINCT FROM NEW.plan` — skips no-op updates where plan didn't change |
| Target table | `public.tenants` — updates `plan` and `updated_at` |
| SECURITY DEFINER | Yes — function owner's privileges used, not the calling role's |
| Side effects | `tenants_updated_at` trigger fires on the nested `tenants` UPDATE |

**Why denormalize `tenants.plan`?** The bot reads `tenants.plan` at startup and via Realtime events to gate tool access. Maintaining a denormalized column avoids a JOIN to `tenant_subscriptions` on every Discord message. The Realtime subscription on `tenants` delivers instant plan change notifications to the bot. Without denormalization, the bot would need to subscribe to `tenant_subscriptions` directly (adding another Realtime channel) OR query `tenant_subscriptions` on every message (adding latency).

**Scenarios this trigger handles:**

| Stripe Event | `tenant_subscriptions` Change | Trigger Action |
|-------------|-------------------------------|----------------|
| `checkout.session.completed` (new subscriber) | INSERT with `plan = 'starter'` | Sets `tenants.plan = 'starter'` |
| `customer.subscription.updated` (upgrade to Pro) | UPDATE `plan = 'pro'` | Sets `tenants.plan = 'pro'` |
| `customer.subscription.updated` (downgrade) | UPDATE `plan = 'starter'` | Sets `tenants.plan = 'starter'` |
| `customer.subscription.deleted` (canceled) | UPDATE `plan = 'free'` | Sets `tenants.plan = 'free'` |
| `customer.subscription.updated` (period renewal, no plan change) | UPDATE `current_period_end` only | Guard condition: `OLD.plan IS NOT DISTINCT FROM NEW.plan` → trigger body skips UPDATE |

---

## Trigger 7: `trg_suspend_tenant_on_unpaid` (Payment Failure Cascade)

**Purpose:** When a Stripe subscription transitions to `'unpaid'` status (all payment retries exhausted), immediately suspend the tenant. When payment recovers (status back to `'active'`), unsuspend the tenant to `'configured'` state (requiring the bot to reconnect).

**Table:** `public.tenant_subscriptions`
**Migration:** `20260400000006_create_tenant_subscriptions.sql`
**Security:** `SECURITY DEFINER` — same rationale as `sync_tenant_plan()`: needs to UPDATE `tenants` regardless of calling role's permissions.

**Function:**

```sql
CREATE OR REPLACE FUNCTION public.suspend_tenant_on_unpaid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When status transitions to 'unpaid', suspend the tenant
    IF (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.status = 'unpaid') THEN
        UPDATE public.tenants
        SET
            status     = 'suspended',
            updated_at = NOW()
        WHERE id = NEW.tenant_id
          AND status != 'suspended';  -- idempotent: skip if already suspended
    END IF;

    -- When status transitions FROM 'unpaid' back to 'active' (payment recovered),
    -- unsuspend the tenant — set back to 'configured' (not 'active', because
    -- the bot must reconnect after suspension)
    IF (OLD.status IS DISTINCT FROM NEW.status)
        AND (OLD.status = 'unpaid')
        AND (NEW.status = 'active') THEN
        UPDATE public.tenants
        SET
            status     = 'configured',
            updated_at = NOW()
        WHERE id = NEW.tenant_id
          AND status = 'suspended';
    END IF;

    RETURN NEW;
END;
$$;
```

**Trigger:**

```sql
CREATE TRIGGER trg_suspend_tenant_on_unpaid
    AFTER UPDATE OF status ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.suspend_tenant_on_unpaid();
```

**Trigger properties:**

| Property | Value |
|----------|-------|
| Timing | AFTER (fires after the `tenant_subscriptions` row is written) |
| Events | UPDATE OF status only (not INSERT — new subscriptions start 'active' or 'trialing', never 'unpaid') |
| Guard (suspend) | `OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'unpaid'` |
| Guard (unsuspend) | `OLD.status IS DISTINCT FROM NEW.status AND OLD.status = 'unpaid' AND NEW.status = 'active'` |
| Idempotency (suspend) | `WHERE id = NEW.tenant_id AND status != 'suspended'` — safe to fire twice |
| Target table | `public.tenants` — updates `status` and `updated_at` |
| SECURITY DEFINER | Yes |

**State transition matrix:**

| `OLD.status` | `NEW.status` | Trigger Action |
|-------------|-------------|----------------|
| `active` | `past_due` | No action — `past_due` does NOT suspend. Bot continues operating. Billing page shows payment failure banner. |
| `past_due` | `unpaid` | **Suspends tenant.** Sets `tenants.status = 'suspended'`. Bot receives Realtime event, disconnects. |
| `unpaid` | `active` | **Unsuspends tenant.** Sets `tenants.status = 'configured'` (not `'active'`). Bot must reconnect. |
| `active` | `canceled` | No action — cancellation handled by `sync_tenant_plan` (plan → `'free'`). Status remains `'configured'`. |
| Any → `any` (same status) | `OLD.status IS NOT DISTINCT FROM NEW.status` | Guard skips both branches — no action. |

**Important behavioral notes:**

1. **`past_due` does NOT suspend.** During `past_due`, Stripe retries payment automatically for ~15–28 days (configurable in Stripe Dashboard → Settings → Billing → Retry schedule). The bot continues operating throughout the retry period. The billing page detects `status = 'past_due'` and shows a warning banner with a "Update payment method" link.

2. **`unpaid` → suspension is irreversible until payment recovers.** Once Stripe exhausts all retries and sets status to `'unpaid'`, the trigger sets `tenants.status = 'suspended'`. The bot receives the Realtime event on `tenants` and calls `remove_tenant()`, cleanly disconnecting from Discord.

3. **Recovery:** When the user updates their payment method and Stripe successfully charges the card, Stripe sends `customer.subscription.updated` with `status = 'active'`. The Stripe webhook handler updates `tenant_subscriptions.status = 'active'`. This trigger fires and sets `tenants.status = 'configured'`. The bot's startup scan or manual reconnection restores the `tenants.status` to `'active'`.

4. **Manual admin unsuspension** bypasses this trigger entirely — the admin panel directly sets `tenants.status = 'configured'` via the service role. This is valid and does not conflict with the trigger's logic.

5. **`past_due` → `unpaid` timing:** Stripe's default retry schedule is: immediate charge attempt, then +3 days, +5 days, +7 days. After all retries fail (~15 days), status transitions `past_due` → `unpaid`. Platform operators can configure a custom retry schedule in Stripe Dashboard.

---

## Tables With No Triggers

### `tenant_members`

No triggers. This table has no `updated_at` column (role changes are tracked implicitly by `created_at` plus re-read of current state). Role updates are performed via direct UPDATE statements in API route `/api/tenants/[tenantId]/members/[memberId]`.

### `stripe_webhook_events`

No triggers. This is an append-only idempotency store — rows are only INSERTed, never UPDATEd. No `updated_at` column. No cascades needed.

---

## Trigger Execution Order on Stripe Webhook

When the Stripe webhook handler calls `UPDATE public.tenant_subscriptions SET plan = $1, status = $2 ...`, the following triggers fire in order:

```
1. BEFORE UPDATE triggers (per row):
   └── tenant_subscriptions_updated_at
         → Sets NEW.updated_at = NOW()
         → Returns NEW (modified row written to table)

2. AFTER UPDATE triggers (per row, in name order):
   ├── trg_sync_tenant_plan (fires on UPDATE OF plan)
   │     → If plan changed: UPDATE tenants SET plan = NEW.plan, updated_at = NOW()
   │           → BEFORE UPDATE on tenants fires: tenants_updated_at
   │                 → Sets tenants.updated_at = NOW()
   │
   └── trg_suspend_tenant_on_unpaid (fires on UPDATE OF status)
         → If status → 'unpaid': UPDATE tenants SET status = 'suspended', updated_at = NOW()
               → BEFORE UPDATE on tenants fires: tenants_updated_at (again)
         → If unpaid → 'active': UPDATE tenants SET status = 'configured', updated_at = NOW()
               → BEFORE UPDATE on tenants fires: tenants_updated_at (again)
```

**Net effect:** After the Stripe webhook UPDATE completes:
- `tenant_subscriptions.updated_at` reflects the current time (set by trigger 1).
- `tenants.plan` is in sync with `tenant_subscriptions.plan` (set by trigger 6 if plan changed).
- `tenants.status` is `'suspended'` if subscription became `'unpaid'` (set by trigger 7).
- `tenants.updated_at` reflects the latest modification time (set by nested `tenants_updated_at` calls).
- Supabase Realtime fires an UPDATE event on `tenants` — the bot receives it and reacts (disconnects if suspended, updates plan gates if plan changed).

---

## Migration Placement Reference

| Trigger | Created In Migration |
|---------|---------------------|
| `tenants_updated_at` | `20260400000001_create_tenants.sql` |
| `discord_connections_updated_at` | `20260400000003_create_discord_connections.sql` |
| `tenant_api_keys_updated_at` | `20260400000004_create_tenant_api_keys.sql` |
| `trg_tenant_service_connections_updated_at` | `20260400000005_create_tenant_service_connections.sql` |
| `tenant_subscriptions_updated_at` | `20260400000006_create_tenant_subscriptions.sql` |
| `trg_sync_tenant_plan` | `20260400000006_create_tenant_subscriptions.sql` |
| `trg_suspend_tenant_on_unpaid` | `20260400000006_create_tenant_subscriptions.sql` |

Full migration SQL for each trigger is also present in the inline table definitions in [schema.md](./schema.md) and the ordered migration scripts in [migrations.md](./migrations.md).

---

## Rollback / Drop Order

If migrations must be rolled back, drop triggers before their functions (functions with active triggers cannot be dropped):

```sql
-- Drop triggers first (in reverse migration order)
DROP TRIGGER IF EXISTS trg_suspend_tenant_on_unpaid ON public.tenant_subscriptions;
DROP TRIGGER IF EXISTS trg_sync_tenant_plan ON public.tenant_subscriptions;
DROP TRIGGER IF EXISTS tenant_subscriptions_updated_at ON public.tenant_subscriptions;
DROP TRIGGER IF EXISTS trg_tenant_service_connections_updated_at ON public.tenant_service_connections;
DROP TRIGGER IF EXISTS tenant_api_keys_updated_at ON public.tenant_api_keys;
DROP TRIGGER IF EXISTS discord_connections_updated_at ON public.discord_connections;
DROP TRIGGER IF EXISTS tenants_updated_at ON public.tenants;

-- Drop new functions (shared update_updated_at_column() is NOT dropped — it predates Daimon)
DROP FUNCTION IF EXISTS public.suspend_tenant_on_unpaid();
DROP FUNCTION IF EXISTS public.sync_tenant_plan();
DROP FUNCTION IF EXISTS public.update_tenant_subscriptions_updated_at();
DROP FUNCTION IF EXISTS public.update_tenant_service_connections_updated_at();

-- NOTE: Do NOT drop public.update_updated_at_column() — it is shared with existing bot tables.
```

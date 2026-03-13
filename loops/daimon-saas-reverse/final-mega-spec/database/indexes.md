# Database Indexes — Daimon SaaS Multi-Tenant Platform

**Aspect:** 8.1.8 — Standalone query-pattern reference extracted from schema.md
**Wave:** Wave 8 — Synthesis & Gap Audit (Gap Remediation)
**Written:** 2026-03-13
**References:**
- [schema.md](./schema.md) — Full table definitions (indexes appear inline per table)
- [migrations.md](./migrations.md) — Migration SQL where indexes are created
- [rls-policies.md](./rls-policies.md) — RLS policies that are accelerated by these indexes

---

## Overview

This file is the canonical, consolidated reference for every index in the Daimon SaaS multi-tenant schema. Indexes are grouped by table. For each index:

1. **SQL** — the exact `CREATE INDEX` statement
2. **Query pattern** — which SQL query this index serves
3. **Access frequency** — how often this index is hit in production
4. **Rationale** — why this index exists (and why it's safe to add or dangerous to drop)

All new Daimon SaaS tables are created by migrations prefixed `20260400000000` through `20260400000009`. None of these indexes touch the existing bot tables (`sessions`, `messages`, `meeting_sessions`, etc.).

---

## Index Summary Table

| Index Name | Table | Columns | Type | Partial? |
|------------|-------|---------|------|---------|
| `idx_tenants_owner_id` | `tenants` | `(owner_id)` | B-tree | No |
| `idx_tenants_plan` | `tenants` | `(plan)` | B-tree | No |
| `idx_tenants_status` | `tenants` | `(status)` | B-tree | No |
| `idx_tenant_members_user_id` | `tenant_members` | `(user_id)` | B-tree | No |
| `idx_tenant_members_tenant_id` | `tenant_members` | `(tenant_id)` | B-tree | No |
| `idx_tenant_members_user_tenant_role` | `tenant_members` | `(user_id, tenant_id, role)` | B-tree | No |
| `idx_discord_connections_tenant_id` | `discord_connections` | `(tenant_id)` | B-tree | No |
| `idx_discord_connections_tenant_status` | `discord_connections` | `(tenant_id, status)` | B-tree | No |
| `idx_discord_connections_active` | `discord_connections` | `(status)` | B-tree | Yes — WHERE status NOT IN ('disconnected', 'suspended') |
| `idx_discord_connections_last_heartbeat` | `discord_connections` | `(tenant_id, last_heartbeat)` | B-tree | Yes — WHERE status = 'connected' |
| `idx_tenant_api_keys_status_invalid` | `tenant_api_keys` | `(tenant_id, updated_at)` | B-tree | Yes — WHERE status = 'invalid' |
| `idx_tenant_api_keys_type_active` | `tenant_api_keys` | `(key_type)` | B-tree | Yes — WHERE status = 'active' |
| `idx_tenant_service_connections_tenant_id` | `tenant_service_connections` | `(tenant_id)` | B-tree | No |
| `idx_tenant_service_connections_tenant_status` | `tenant_service_connections` | `(tenant_id, status)` | B-tree | No |
| `idx_tenant_service_connections_token_expires_at` | `tenant_service_connections` | `(token_expires_at)` | B-tree | Yes — WHERE NOT NULL AND connected |
| `idx_tenant_subscriptions_stripe_customer_id` | `tenant_subscriptions` | `(stripe_customer_id)` | B-tree | Yes — WHERE NOT NULL |
| `idx_tenant_subscriptions_plan` | `tenant_subscriptions` | `(plan)` | B-tree | No |
| `idx_tenant_subscriptions_status` | `tenant_subscriptions` | `(status)` | B-tree | Yes — WHERE status != 'active' |
| `idx_tenant_subscriptions_cancel_at_period_end` | `tenant_subscriptions` | `(current_period_end)` | B-tree | Yes — WHERE cancel_at_period_end = TRUE |
| `idx_admin_audit_log_admin_user_id` | `admin_audit_log` | `(admin_user_id, created_at DESC)` | B-tree | No |
| `idx_admin_audit_log_tenant_id` | `admin_audit_log` | `(tenant_id, created_at DESC)` | B-tree | Yes — WHERE tenant_id IS NOT NULL |
| `idx_admin_audit_log_action` | `admin_audit_log` | `(action, created_at DESC)` | B-tree | No |
| `idx_stripe_webhook_events_processed_at` | `stripe_webhook_events` | `(processed_at)` | B-tree | No |
| `idx_stripe_webhook_events_event_type_processed_at` | `stripe_webhook_events` | `(event_type, processed_at DESC)` | B-tree | No |
| `idx_tenant_messages_tenant_id_created_at` | `tenant_messages` | `(tenant_id, created_at DESC)` | B-tree | No |
| `idx_tenant_tool_calls_tenant_id_created_at` | `tenant_tool_calls` | `(tenant_id, created_at DESC)` | B-tree | No |

**Automatic indexes from constraints (not listed above — created automatically by PostgreSQL):**

| Auto Index | Table | Columns | Source |
|------------|-------|---------|--------|
| PK index on `id` | `tenants` | `(id)` | PRIMARY KEY |
| UNIQUE on `stripe_customer_id` | `tenants` | `(stripe_customer_id)` | UNIQUE constraint |
| UNIQUE on `slug` | `tenants` | `(slug)` | UNIQUE constraint |
| PK composite index | `tenant_members` | `(tenant_id, user_id)` | PRIMARY KEY (composite) |
| PK index on `id` | `discord_connections` | `(id)` | PRIMARY KEY |
| UNIQUE on `(tenant_id, guild_id)` | `discord_connections` | `(tenant_id, guild_id)` | UNIQUE constraint |
| PK index on `id` | `tenant_api_keys` | `(id)` | PRIMARY KEY |
| UNIQUE on `(tenant_id, key_type)` | `tenant_api_keys` | `(tenant_id, key_type)` | UNIQUE constraint |
| PK index on `id` | `tenant_service_connections` | `(id)` | PRIMARY KEY |
| UNIQUE on `(tenant_id, service)` | `tenant_service_connections` | `(tenant_id, service)` | UNIQUE constraint |
| PK index on `id` | `tenant_subscriptions` | `(id)` | PRIMARY KEY |
| UNIQUE on `tenant_id` | `tenant_subscriptions` | `(tenant_id)` | UNIQUE constraint |
| UNIQUE on `stripe_subscription_id` | `tenant_subscriptions` | `(stripe_subscription_id)` | UNIQUE constraint |
| PK index on `id` | `admin_audit_log` | `(id)` | PRIMARY KEY |
| PK index on `id` | `stripe_webhook_events` | `(id)` | PRIMARY KEY |
| UNIQUE on `stripe_event_id` | `stripe_webhook_events` | `(stripe_event_id)` | UNIQUE constraint — idempotency |
| PK index on `id` | `tenant_messages` | `(id)` | PRIMARY KEY |
| PK index on `id` | `tenant_tool_calls` | `(id)` | PRIMARY KEY |

---

## Table: `tenants`

### `idx_tenants_owner_id`

```sql
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Dashboard load on first visit: `SELECT * FROM tenants WHERE owner_id = $user_id` — used before `tenant_members` membership is checked |
| **Access frequency** | Every dashboard page load. High frequency — O(1) query per authenticated request. |
| **Cardinality** | One-to-one in practice (each user owns exactly one tenant at launch). Very selective. |
| **Rationale** | Without this index, finding a tenant by owner_id requires a full table scan of `tenants`. At 10,000+ tenants, this would be noticeably slow on dashboard load. |
| **Safe to drop?** | No — dashboard boot query becomes O(N) table scan. |

---

### `idx_tenants_plan`

```sql
CREATE INDEX idx_tenants_plan ON public.tenants(plan);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM tenants WHERE plan = 'starter' ORDER BY created_at DESC` — filter tenants by current plan |
| **Access frequency** | Low — admin panel only. Not on the critical path for tenant users. |
| **Cardinality** | Very low (3 distinct values: `free`, `starter`, `pro`). Index is most useful combined with ORDER BY or LIMIT. |
| **Rationale** | Enables fast admin filtering of tenants by plan without scanning the full `tenants` table. Also serves analytics queries like `SELECT plan, COUNT(*) FROM tenants GROUP BY plan`. |
| **Safe to drop?** | Yes for critical path — only affects admin panel performance. Drop if index maintenance cost becomes a concern. |

---

### `idx_tenants_status`

```sql
CREATE INDEX idx_tenants_status ON public.tenants(status);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM tenants WHERE status = 'suspended'` — find suspended tenants requiring review. Bot startup: `SELECT id, plan, status FROM tenants WHERE status != 'suspended'` — load all non-suspended tenants. |
| **Access frequency** | Bot startup (once at boot, then Realtime-driven). Admin panel (on admin visits). |
| **Cardinality** | Low (4 values: `pending`, `configured`, `active`, `suspended`). At launch, most tenants are `active` or `pending`. |
| **Rationale** | Bot startup JOIN query filters by `status != 'suspended'`. Without this index, the bot startup query scans the full `tenants` table at every restart. |
| **Safe to drop?** | No — bot startup performance degrades at scale. |

---

## Table: `tenant_members`

### `idx_tenant_members_user_id`

```sql
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | RLS policy inner query: `SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()`. This inner query executes on **every single read** of any RLS-protected table (tenants, discord_connections, tenant_api_keys, tenant_service_connections, tenant_subscriptions, tenant_messages, tenant_tool_calls). |
| **Access frequency** | **Critical path.** Runs on every authenticated database read. Potentially hundreds of times per page load across multiple table reads. |
| **Cardinality** | One-to-one at launch (each user is a member of exactly one tenant). Extremely selective. |
| **Rationale** | This is the **most important index in the schema**. Without it, every RLS policy check degrades to a full table scan of `tenant_members`. At 100,000 users, this would add milliseconds to every query. This index is responsible for O(1) RLS performance. |
| **Safe to drop?** | **NEVER drop this index.** Dropping it makes the entire application non-functional at scale — every read query becomes a table scan. |

---

### `idx_tenant_members_tenant_id`

```sql
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM tenant_members WHERE tenant_id = $id` — list all members of a tenant. Invite management (deferred feature): show existing members before sending invite. |
| **Access frequency** | Low — admin panel only. The composite PK `(tenant_id, user_id)` also partially covers this via its leading column. |
| **Cardinality** | Moderate — at launch 1 member per tenant, later potentially 5–20. |
| **Rationale** | The composite PK index on `(tenant_id, user_id)` already indexes the `tenant_id` column as the leading component, so this explicit index may be redundant. However, it is retained explicitly for clarity and because a partial index on `tenant_id` alone is marginally more efficient for `SELECT * WHERE tenant_id = $1` (no secondary column scan). |
| **Safe to drop?** | Technically safe — the composite PK covers this. Can be removed if index bloat becomes a concern. |

---

### `idx_tenant_members_user_tenant_role`

```sql
CREATE INDEX idx_tenant_members_user_tenant_role
    ON public.tenant_members(user_id, tenant_id, role);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | RLS UPDATE/DELETE policy inner queries: `SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')` — permission check for write operations on tenants, discord_connections, etc. |
| **Access frequency** | High — runs on every write operation (UPSERT, UPDATE, DELETE) on any protected table. Slightly lower frequency than SELECT path since most dashboard interactions are reads. |
| **Cardinality** | Covering index on all three columns. Allows index-only scans for the role check. |
| **Rationale** | Without this index, write-path RLS checks degrade. The `idx_tenant_members_user_id` index covers the `user_id` filter, but adding `tenant_id` and `role` as a covering composite allows index-only scans that avoid heap access entirely. |
| **Safe to drop?** | Degrades write-path RLS performance. Keep unless index maintenance becomes a concern (write-heavy workload). |

---

## Table: `discord_connections`

### `idx_discord_connections_tenant_id`

```sql
CREATE INDEX idx_discord_connections_tenant_id
    ON public.discord_connections(tenant_id);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Dashboard settings page: `SELECT * FROM discord_connections WHERE tenant_id = $id` — list all Discord connections for a tenant. Bot startup JOIN: `JOIN discord_connections ON dc.tenant_id = t.id`. |
| **Access frequency** | Every settings page load. Every bot startup. High frequency. |
| **Cardinality** | 1–unlimited rows per tenant (free: 1, starter: 3, pro: unlimited). Very selective by tenant. |
| **Rationale** | Without this index, loading Discord connections for a settings page requires scanning all rows. Also accelerates the bot's startup JOIN query. |
| **Safe to drop?** | No — settings page and bot startup degrade. |

---

### `idx_discord_connections_tenant_status`

```sql
CREATE INDEX idx_discord_connections_tenant_status
    ON public.discord_connections(tenant_id, status);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Bot startup: `SELECT * FROM discord_connections WHERE tenant_id = $1 AND status NOT IN ('disconnected', 'suspended')` — load active connections per tenant. Dashboard: filter connections by status. |
| **Access frequency** | Bot startup (once per tenant at restart). Dashboard on filter operations. |
| **Cardinality** | Covering on `(tenant_id, status)`. Most tenants have 1 connection in `connected` status. |
| **Rationale** | Covers bot's most common query pattern — load non-disconnected connections per tenant. The composite covers both `tenant_id` filter and `status` filter without heap access. |
| **Safe to drop?** | Degrades bot startup performance. The `idx_discord_connections_tenant_id` partially covers but without the `status` filter push-down. |

---

### `idx_discord_connections_active`

```sql
CREATE INDEX idx_discord_connections_active
    ON public.discord_connections(status)
    WHERE status NOT IN ('disconnected', 'suspended');
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Bot startup global query: `SELECT dc.*, t.plan, t.id as tenant_id FROM discord_connections dc JOIN tenants t ON t.id = dc.tenant_id WHERE dc.status NOT IN ('disconnected', 'suspended')` — load ALL active connections across all tenants. |
| **Access frequency** | Bot startup once, then Realtime-driven (not re-queried per heartbeat). |
| **Cardinality** | Partial index only covers active rows. At 1,000 active tenants, this index has ~1,000 entries vs full table size. Very compact. |
| **Rationale** | The bot's startup query loads all non-disconnected connections globally (not per-tenant). Without this partial index, the query scans the full `discord_connections` table including all historical disconnected/suspended rows. |
| **Safe to drop?** | Degrades bot startup time proportionally to number of inactive/historical rows. Safe to drop if table stays small (<10,000 rows). |

---

### `idx_discord_connections_last_heartbeat`

```sql
CREATE INDEX idx_discord_connections_last_heartbeat
    ON public.discord_connections(tenant_id, last_heartbeat)
    WHERE status = 'connected';
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Dashboard: `SELECT *, CASE WHEN last_heartbeat < NOW() - INTERVAL '120 seconds' THEN 'stale' ELSE 'healthy' END as effective_status FROM discord_connections WHERE tenant_id = $1 AND status = 'connected'` — compute effective health status. Health monitoring: `SELECT * FROM discord_connections WHERE status = 'connected' AND last_heartbeat < NOW() - INTERVAL '120 seconds'` — find stale connections. |
| **Access frequency** | Every dashboard load (for each connected tenant). Background health-check job runs every 30 seconds. |
| **Cardinality** | Partial index covers only `connected` rows. The `last_heartbeat` ordering enables efficient range scans for stale detection. |
| **Rationale** | Without this index, stale detection requires scanning all `status = 'connected'` rows and computing `last_heartbeat < NOW() - 120s` on each. The partial index restricts the scan to connected rows only and supports the datetime range comparison. |
| **Safe to drop?** | Degrades stale detection performance. At small scale (<100 tenants) safe to drop. At 1,000+ connected tenants, stale detection scans without this index. |

---

## Table: `tenant_api_keys`

### `idx_tenant_api_keys_status_invalid`

```sql
CREATE INDEX idx_tenant_api_keys_status_invalid
    ON public.tenant_api_keys(tenant_id, updated_at)
    WHERE status = 'invalid';
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin support panel: `SELECT * FROM tenant_api_keys WHERE status = 'invalid' ORDER BY updated_at DESC` — find all tenants with invalid API keys (i.e., tenants whose bots stopped working due to a bad Anthropic key). Support query: `SELECT * FROM tenant_api_keys WHERE status = 'invalid' AND tenant_id = $id` — check if a specific tenant has an invalid key. |
| **Access frequency** | Low — admin panel only. Not on the user-facing critical path. |
| **Cardinality** | Partial index covers only `invalid` rows. Normally very few invalid keys at any time. Very compact index. |
| **Rationale** | Supports "show tenants with broken API keys" support workflow without scanning all `tenant_api_keys` rows. Also useful for automated alerting: query this index to find tenants needing attention. |
| **Safe to drop?** | Yes — admin/support tool only. Not needed for tenant user experience. |

---

### `idx_tenant_api_keys_type_active`

```sql
CREATE INDEX idx_tenant_api_keys_type_active
    ON public.tenant_api_keys(key_type)
    WHERE status = 'active';
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin metrics: `SELECT COUNT(DISTINCT tenant_id) FROM tenant_api_keys WHERE key_type = 'openai' AND status = 'active'` — how many tenants have OpenAI configured? Analytics: `SELECT key_type, COUNT(*) FROM tenant_api_keys WHERE status = 'active' GROUP BY key_type` — key type distribution. |
| **Access frequency** | Low — admin metrics/analytics only. |
| **Cardinality** | Partial index covers only `active` rows. Low-cardinality `key_type` column (values: `anthropic`, `openai`). |
| **Rationale** | Supports admin/analytics queries grouped by key type without a full table scan. The partial filter on `status = 'active'` excludes invalidated and revoked keys from the index entirely. |
| **Safe to drop?** | Yes — admin analytics only. Drop if not needed. |

---

## Table: `tenant_service_connections`

### `idx_tenant_service_connections_tenant_id`

```sql
CREATE INDEX idx_tenant_service_connections_tenant_id
    ON public.tenant_service_connections (tenant_id);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Integrations page load: `SELECT * FROM tenant_service_connections WHERE tenant_id = $1` — list all connected services for a tenant. Bot startup: `SELECT service, access_token_encrypted, metadata FROM tenant_service_connections WHERE tenant_id = $1 AND status = 'active'` — load service connections at startup. |
| **Access frequency** | Every integrations page load. Every bot startup per tenant. High frequency. |
| **Cardinality** | 1–9 rows per tenant (one per service: GitHub, Google, Linear, Toggl, Dub, etc.). Very selective by tenant_id. |
| **Rationale** | Without this index, integrations page load requires a full table scan across all tenants' service connections. Also accelerates the composite index queries (the standalone `tenant_id` index covers single-filter queries). |
| **Safe to drop?** | No — integrations page and bot startup degrade. The `(tenant_id, service)` UNIQUE constraint index also covers this, but the explicit index clarifies intent. |

---

### `idx_tenant_service_connections_tenant_status`

```sql
CREATE INDEX idx_tenant_service_connections_tenant_status
    ON public.tenant_service_connections (tenant_id, status);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Bot startup filtered load: `SELECT * FROM tenant_service_connections WHERE tenant_id = $1 AND status = 'active'` — load only active service connections at bot startup (skip expired/revoked). |
| **Access frequency** | Bot startup per tenant. Dashboard filter operations. |
| **Cardinality** | Composite on `(tenant_id, status)`. Most rows have `status = 'active'`. Very selective on tenant_id. |
| **Rationale** | Covers the bot's most common service connections query (filter by active status). Without this, the bot loads all connections including expired/revoked and filters in application code — wasteful at scale. |
| **Safe to drop?** | Degrades bot startup performance but not catastrophically (few rows per tenant). Safe to drop if table stays small. |

---

### `idx_tenant_service_connections_token_expires_at`

```sql
CREATE INDEX idx_tenant_service_connections_token_expires_at
    ON public.tenant_service_connections (token_expires_at)
    WHERE token_expires_at IS NOT NULL AND status = 'active';
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | OAuth token refresh job (runs every 60 seconds): `SELECT id, tenant_id, service FROM tenant_service_connections WHERE token_expires_at < NOW() + INTERVAL '5 minutes' AND status = 'active' AND token_expires_at IS NOT NULL` — find tokens expiring in the next 5 minutes that need proactive refresh. |
| **Access frequency** | Every 60 seconds (background job). |
| **Cardinality** | Partial index covers only rows with a non-null expiry and active status. Only OAuth services (GitHub, Google, Linear) have expiring tokens — API key services (Toggl) do not. At 1,000 tenants × 3 OAuth services = ~3,000 rows maximum in this index. |
| **Rationale** | Without this index, the refresh job scans the entire `tenant_service_connections` table every 60 seconds. The partial index restricts the scan to rows that could actually need refreshing (OAuth services with `token_expires_at` set). |
| **Safe to drop?** | Degrades the token refresh job. If the job is slow (scans thousands of rows), re-add this index. |

---

## Table: `tenant_subscriptions`

### `idx_tenant_subscriptions_stripe_customer_id`

```sql
CREATE INDEX idx_tenant_subscriptions_stripe_customer_id
    ON public.tenant_subscriptions (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Stripe webhook handler for `customer.*` events (e.g., `customer.deleted`, `customer.updated`): `SELECT * FROM tenant_subscriptions WHERE stripe_customer_id = $customer_id` — look up tenant by Stripe Customer ID. |
| **Access frequency** | Low — only `customer.*` webhook events, which are relatively rare (customer creation is one-time). |
| **Cardinality** | One-to-one after setup (each tenant has at most one Stripe customer). Very selective. |
| **Rationale** | Most Stripe webhooks include a `subscription_id` covered by the UNIQUE constraint. However, `customer.deleted` and `customer.updated` events provide only the `customer_id`. This index covers those events without a full table scan. |
| **Safe to drop?** | Yes — `customer.*` events are rare. Without the index, a full table scan of `tenant_subscriptions` is acceptable at small scale. |

---

### `idx_tenant_subscriptions_plan`

```sql
CREATE INDEX idx_tenant_subscriptions_plan
    ON public.tenant_subscriptions (plan);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM tenant_subscriptions WHERE plan = 'starter' ORDER BY updated_at DESC` — filter subscriptions by plan. Revenue analytics: `SELECT plan, COUNT(*) FROM tenant_subscriptions GROUP BY plan` — plan distribution. |
| **Access frequency** | Low — admin panel and analytics only. |
| **Cardinality** | Low (3 values: `free`, `starter`, `pro`). PostgreSQL may prefer a sequential scan over this index for large result sets. |
| **Rationale** | Supports admin filtering and analytics queries. The `tenants.plan` denormalized column (also indexed via `idx_tenants_plan`) may be more efficient for most admin queries — this index on `tenant_subscriptions.plan` is for subscription-level analytics (e.g., billing status breakdown). |
| **Safe to drop?** | Yes — admin analytics only. `idx_tenants_plan` on the `tenants` table covers most use cases. |

---

### `idx_tenant_subscriptions_status`

```sql
CREATE INDEX idx_tenant_subscriptions_status
    ON public.tenant_subscriptions (status)
    WHERE status != 'active';
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM tenant_subscriptions WHERE status = 'past_due'` — find tenants in failed payment state. Dunning management: `SELECT * FROM tenant_subscriptions WHERE status IN ('past_due', 'unpaid')` — find tenants needing billing intervention. |
| **Access frequency** | Low — admin panel only. |
| **Cardinality** | Partial index excludes `active` rows (the majority). Only non-active subscriptions are indexed — typically very few rows. |
| **Rationale** | The partial filter `WHERE status != 'active'` makes this index extremely compact — it only indexes the exception cases (past_due, unpaid, canceled, trialing) that require admin attention. The vast majority of subscriptions are `active` and do NOT appear in this index, avoiding index bloat. |
| **Safe to drop?** | Yes — admin only. Sequential scan of `tenant_subscriptions` is fast at small scale. |

---

### `idx_tenant_subscriptions_cancel_at_period_end`

```sql
CREATE INDEX idx_tenant_subscriptions_cancel_at_period_end
    ON public.tenant_subscriptions (current_period_end)
    WHERE cancel_at_period_end = TRUE;
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Churn analytics: `SELECT * FROM tenant_subscriptions WHERE cancel_at_period_end = TRUE AND current_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'` — find subscriptions expiring in the next 7 days (candidates for win-back). Billing notifications: `SELECT * FROM tenant_subscriptions WHERE cancel_at_period_end = TRUE AND current_period_end < NOW() + INTERVAL '24 hours'` — tenants needing "cancellation reminder" email. |
| **Access frequency** | Low — analytics/notification jobs. |
| **Cardinality** | Partial index covers only rows where `cancel_at_period_end = TRUE`. Typically very few rows. The `current_period_end` ordering enables efficient range scans on the date. |
| **Rationale** | Without this index, finding soon-to-cancel subscriptions requires scanning all `tenant_subscriptions` rows and filtering by `cancel_at_period_end = TRUE` + date range. The partial index makes this a tiny range scan. |
| **Safe to drop?** | Yes — churn analytics/notifications. No impact on core product functionality. |

---

## Table: `admin_audit_log`

### `idx_admin_audit_log_admin_user_id`

```sql
CREATE INDEX idx_admin_audit_log_admin_user_id
    ON public.admin_audit_log (admin_user_id, created_at DESC);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM admin_audit_log WHERE admin_user_id = $admin_id ORDER BY created_at DESC LIMIT 50` — show recent actions by a specific admin. Audit: "what did admin X do this week?" |
| **Access frequency** | Low — admin panel, audit reviews. |
| **Cardinality** | Low number of admins (typically 2–5). The `created_at DESC` ordering enables efficient forward pagination without a sort step. |
| **Rationale** | Supports per-admin activity review without scanning the entire audit log. The DESC ordering in the index definition means PostgreSQL can satisfy `ORDER BY created_at DESC` from the index directly. |
| **Safe to drop?** | Yes — admin tooling only. Sequential scan with sort is acceptable at small scale. |

---

### `idx_admin_audit_log_tenant_id`

```sql
CREATE INDEX idx_admin_audit_log_tenant_id
    ON public.admin_audit_log (tenant_id, created_at DESC)
    WHERE tenant_id IS NOT NULL;
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel tenant detail: `SELECT * FROM admin_audit_log WHERE tenant_id = $id ORDER BY created_at DESC LIMIT 50` — show all admin actions affecting a specific tenant. Support: "what happened to tenant X's account?" |
| **Access frequency** | Low — admin panel tenant detail page. |
| **Cardinality** | The partial filter `WHERE tenant_id IS NOT NULL` excludes system-level actions that don't target a tenant (e.g., a hypothetical global config change). `tenant_id` is UUID — very selective. |
| **Rationale** | Without this index, looking up all admin actions for a tenant requires scanning all audit log rows. As the log grows (append-only, never deleted in v1), this scan becomes increasingly slow. |
| **Safe to drop?** | Safe in the short term (small log). As the platform ages and the log grows into millions of rows, this index becomes essential. |

---

### `idx_admin_audit_log_action`

```sql
CREATE INDEX idx_admin_audit_log_action
    ON public.admin_audit_log (action, created_at DESC);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin panel: `SELECT * FROM admin_audit_log WHERE action = 'impersonation_started' ORDER BY created_at DESC LIMIT 20` — find all impersonation events. Security audit: `SELECT * FROM admin_audit_log WHERE action = 'tenant_suspended' AND created_at > NOW() - INTERVAL '7 days'` — recent suspension actions. |
| **Access frequency** | Low — audit and security reviews. |
| **Cardinality** | Low cardinality on `action` (CHECK constraint limits values). The `created_at DESC` ordering enables efficient forward pagination. |
| **Rationale** | Supports security audits and action-type queries without full table scans. Essential as the audit log grows. |
| **Safe to drop?** | Yes — admin/security tooling only. |

---

## Table: `stripe_webhook_events`

### `idx_stripe_webhook_events_processed_at`

```sql
CREATE INDEX idx_stripe_webhook_events_processed_at
    ON public.stripe_webhook_events (processed_at);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Retention cleanup job (daily pg_cron): `DELETE FROM stripe_webhook_events WHERE processed_at < NOW() - INTERVAL '90 days'` — delete rows older than 90 days. |
| **Access frequency** | Once per day (pg_cron job). |
| **Cardinality** | `processed_at` is monotonically increasing. At 50 events/day × 90 days = 4,500 rows maximum. Even a sequential scan is fast at this size. |
| **Rationale** | Accelerates the daily retention cleanup DELETE. Without the index, the DELETE scans all rows. At the small expected table size, the index is technically optional but is included for consistency with other retention patterns (same pattern used on `tenant_messages` and `tenant_tool_calls`). |
| **Safe to drop?** | Yes — table is small enough that sequential scan is trivially fast. |

---

### `idx_stripe_webhook_events_event_type_processed_at`

```sql
CREATE INDEX idx_stripe_webhook_events_event_type_processed_at
    ON public.stripe_webhook_events (event_type, processed_at DESC);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Admin/debugging: `SELECT * FROM stripe_webhook_events WHERE event_type = 'invoice.payment_failed' ORDER BY processed_at DESC LIMIT 50` — inspect recent events of a given type during incident investigation. |
| **Access frequency** | Very low — debugging only. Not on any automated path. |
| **Cardinality** | Moderate cardinality on `event_type` (20+ distinct Stripe event types). `processed_at DESC` ordering supports forward pagination. |
| **Rationale** | Purely a developer/operations convenience index for debugging Stripe webhook processing. No production query relies on it. |
| **Safe to drop?** | Yes — debugging convenience only. Adds no value to production query paths. |

---

## Table: `tenant_messages`

### `idx_tenant_messages_tenant_id_created_at`

```sql
CREATE INDEX idx_tenant_messages_tenant_id_created_at
    ON public.tenant_messages (tenant_id, created_at DESC);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Dashboard QuickStatsRow — "Messages Today": `SELECT COUNT(*) FROM tenant_messages WHERE tenant_id = $1 AND created_at >= $start_of_today` (note: RLS adds implicit `tenant_id = auth_user_tenant` — the WHERE clause is redundant with RLS but explicit for performance). Retention cleanup: `DELETE FROM tenant_messages WHERE created_at < NOW() - INTERVAL '90 days'`. |
| **Access frequency** | Every dashboard page load. High frequency — this is the `Messages Today` counter shown on the main dashboard. |
| **Cardinality** | Composite on `(tenant_id, created_at DESC)`. Highly selective on `tenant_id`. At 1,000 messages/day and 90-day retention: ~90,000 rows per active tenant in worst case. The composite index makes the COUNT query an index-only range scan on `created_at` within the tenant's rows. |
| **Rationale** | Without this index, "Messages Today" requires scanning all rows in `tenant_messages` matching the tenant_id. At 10,000+ tenants × 90 days × 10 messages/day = 9M rows, this becomes critical. The composite index makes the count O(log N × rows_today) — typically scanning <100 rows per dashboard load. |
| **Safe to drop?** | **No.** This index is on the dashboard critical path. Dropping it degrades "Messages Today" to a full tenant-filtered scan on a high-volume table. |

**Optional cleanup acceleration index** (add if the daily retention job is slow):
```sql
-- Add only if DELETE FROM tenant_messages WHERE created_at < NOW() - '90 days' is slow.
-- The composite index above partially covers this but the standalone created_at index
-- is more efficient for a full-table-range DELETE (no tenant_id filter).
CREATE INDEX idx_tenant_messages_created_at
    ON public.tenant_messages (created_at)
    WHERE created_at < NOW() - INTERVAL '80 days';
-- Note: This is a partial index for rows already near the retention boundary.
-- The partial filter must be updated if the retention period changes.
```

---

## Table: `tenant_tool_calls`

### `idx_tenant_tool_calls_tenant_id_created_at`

```sql
CREATE INDEX idx_tenant_tool_calls_tenant_id_created_at
    ON public.tenant_tool_calls (tenant_id, created_at DESC);
```

| Attribute | Value |
|-----------|-------|
| **Query pattern** | Dashboard QuickStatsRow — "Tool Uses Today": `SELECT COUNT(*) FROM tenant_tool_calls WHERE tenant_id = $1 AND created_at >= $start_of_today`. Retention cleanup: `DELETE FROM tenant_tool_calls WHERE created_at < NOW() - INTERVAL '90 days'`. |
| **Access frequency** | Every dashboard page load. High frequency — same pattern as `tenant_messages`. |
| **Cardinality** | Composite on `(tenant_id, created_at DESC)`. Higher row volume than `tenant_messages` (~3 tool calls per message on average). At 1,000 tenants × 10 messages/day × 3 tool calls × 90 days = 2.7M rows per 1,000 tenants. |
| **Rationale** | Same rationale as `idx_tenant_messages_tenant_id_created_at`. Without this index, "Tool Uses Today" scans the entire high-volume event log. The composite index makes it an efficient range scan on `created_at` within the tenant's rows. |
| **Safe to drop?** | **No.** On the dashboard critical path. Same risk as `tenant_messages` index. |

---

## Index Deployment Checklist

The following SQL creates all new indexes in the correct order (after tables are created):

```sql
-- Indexes for: tenants
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX idx_tenants_plan ON public.tenants(plan);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- Indexes for: tenant_members
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user_tenant_role
    ON public.tenant_members(user_id, tenant_id, role);

-- Indexes for: discord_connections
CREATE INDEX idx_discord_connections_tenant_id
    ON public.discord_connections(tenant_id);
CREATE INDEX idx_discord_connections_tenant_status
    ON public.discord_connections(tenant_id, status);
CREATE INDEX idx_discord_connections_active
    ON public.discord_connections(status)
    WHERE status NOT IN ('disconnected', 'suspended');
CREATE INDEX idx_discord_connections_last_heartbeat
    ON public.discord_connections(tenant_id, last_heartbeat)
    WHERE status = 'connected';

-- Indexes for: tenant_api_keys
CREATE INDEX idx_tenant_api_keys_status_invalid
    ON public.tenant_api_keys(tenant_id, updated_at)
    WHERE status = 'invalid';
CREATE INDEX idx_tenant_api_keys_type_active
    ON public.tenant_api_keys(key_type)
    WHERE status = 'active';

-- Indexes for: tenant_service_connections
CREATE INDEX idx_tenant_service_connections_tenant_id
    ON public.tenant_service_connections (tenant_id);
CREATE INDEX idx_tenant_service_connections_tenant_status
    ON public.tenant_service_connections (tenant_id, status);
CREATE INDEX idx_tenant_service_connections_token_expires_at
    ON public.tenant_service_connections (token_expires_at)
    WHERE token_expires_at IS NOT NULL AND status = 'active';

-- Indexes for: tenant_subscriptions
CREATE INDEX idx_tenant_subscriptions_stripe_customer_id
    ON public.tenant_subscriptions (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_tenant_subscriptions_plan
    ON public.tenant_subscriptions (plan);
CREATE INDEX idx_tenant_subscriptions_status
    ON public.tenant_subscriptions (status)
    WHERE status != 'active';
CREATE INDEX idx_tenant_subscriptions_cancel_at_period_end
    ON public.tenant_subscriptions (current_period_end)
    WHERE cancel_at_period_end = TRUE;

-- Indexes for: admin_audit_log
CREATE INDEX idx_admin_audit_log_admin_user_id
    ON public.admin_audit_log (admin_user_id, created_at DESC);
CREATE INDEX idx_admin_audit_log_tenant_id
    ON public.admin_audit_log (tenant_id, created_at DESC)
    WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_admin_audit_log_action
    ON public.admin_audit_log (action, created_at DESC);

-- Indexes for: stripe_webhook_events
CREATE INDEX idx_stripe_webhook_events_processed_at
    ON public.stripe_webhook_events (processed_at);
CREATE INDEX idx_stripe_webhook_events_event_type_processed_at
    ON public.stripe_webhook_events (event_type, processed_at DESC);

-- Indexes for: tenant_messages
CREATE INDEX idx_tenant_messages_tenant_id_created_at
    ON public.tenant_messages (tenant_id, created_at DESC);

-- Indexes for: tenant_tool_calls
CREATE INDEX idx_tenant_tool_calls_tenant_id_created_at
    ON public.tenant_tool_calls (tenant_id, created_at DESC);
```

---

## Critical Path Analysis

The following indexes are on the production critical path and must NEVER be dropped:

| Priority | Index | Why Critical |
|----------|-------|-------------|
| **P0 — Never drop** | `idx_tenant_members_user_id` | Executes on every RLS check across all tables. Dropping it makes the app non-functional at scale. |
| **P0 — Never drop** | `idx_tenant_messages_tenant_id_created_at` | Dashboard "Messages Today" — on every page load. |
| **P0 — Never drop** | `idx_tenant_tool_calls_tenant_id_created_at` | Dashboard "Tool Uses Today" — on every page load. |
| **P1 — High value** | `idx_discord_connections_tenant_id` | Settings page load and bot startup JOIN. |
| **P1 — High value** | `idx_tenants_owner_id` | Dashboard tenant lookup — on every authenticated request. |
| **P1 — High value** | `idx_tenant_members_user_tenant_role` | Write-path RLS checks (every UPDATE/DELETE). |
| **P2 — Useful** | `idx_discord_connections_last_heartbeat` | Stale detection on dashboard and health monitor. |
| **P2 — Useful** | `idx_discord_connections_active` | Bot startup global connection load. |
| **P2 — Useful** | `idx_tenant_service_connections_token_expires_at` | OAuth refresh job (runs every 60s). |
| **P3 — Optional** | All `admin_audit_log` indexes | Admin tooling only. |
| **P3 — Optional** | `stripe_webhook_events` indexes | Debugging and retention only. |
| **P3 — Optional** | `tenant_api_keys` partial indexes | Admin support tooling. |
| **P3 — Optional** | `tenant_subscriptions` non-unique indexes | Admin analytics. |

# Database Schema — Daimon SaaS Multi-Tenant Platform

**Source:** Designed for Wave 3 of Daimon SaaS Reverse Loop
**Database:** PostgreSQL 17, hosted on Supabase
**Schema:** `public` (all new tables), `vault` (for encrypted secrets — Supabase Vault)
**Last Updated:** 2026-03-13

This file documents every table in the Daimon SaaS multi-tenant schema. For each table: every column (name, type, nullable, default, constraints), primary key, foreign keys, unique constraints, check constraints, indexes (with the query pattern they support), and cross-references to RLS policies.

Related files:
- [rls-policies.md](./rls-policies.md) — Exact SQL for every RLS policy
- [triggers.md](./triggers.md) — Trigger definitions and functions
- [migrations.md](./migrations.md) — Ordered migration SQL
- [indexes.md](./indexes.md) — Query patterns and index rationale
- [vault-encryption.md](./vault-encryption.md) — Vault setup and encrypt/decrypt patterns

---

## Custom Enum Types

The following PostgreSQL enum types must be created before any table that references them. All enums are in the `public` schema.

### `tenant_plan`

```sql
CREATE TYPE public.tenant_plan AS ENUM ('free', 'starter', 'pro');
```

| Value | Description |
|-------|-------------|
| `free` | Free tier — limited tools, no Fly session launches, 1 Discord connection |
| `starter` | Starter paid tier — Fly session launches enabled, standard tools, 3 Discord connections |
| `pro` | Pro tier — all tools, unlimited Discord connections, priority support |

### `tenant_status`

```sql
CREATE TYPE public.tenant_status AS ENUM ('pending', 'configured', 'active', 'suspended');
```

| Value | Description |
|-------|-------------|
| `pending` | Tenant created but setup not complete (no Discord connection or API key validated) |
| `configured` | Tenant has saved a Discord connection and at least one API key; bot not yet connected |
| `active` | Bot is connected and heartbeating; tenant fully operational |
| `suspended` | Tenant account suspended (manual admin action or payment failure) |

### `tenant_member_role`

```sql
CREATE TYPE public.tenant_member_role AS ENUM ('owner', 'admin', 'member');
```

| Value | Description |
|-------|-------------|
| `owner` | Full control; can delete tenant, manage billing, invite members |
| `admin` | Can manage connections, API keys, service connections; cannot delete tenant or access billing |
| `member` | Read-only access to dashboard and status; cannot change any settings |

### `discord_connection_status`

```sql
CREATE TYPE public.discord_connection_status AS ENUM (
    'pending',
    'connecting',
    'connected',
    'disconnected',
    'error',
    'suspended'
);
```

| Value | Description |
|-------|-------------|
| `pending` | Connection record created; bot not yet attempting to connect |
| `connecting` | Bot is actively attempting to connect (Discord WebSocket handshake in progress) |
| `connected` | Bot connected and heartbeating; online in the Discord guild |
| `disconnected` | Bot cleanly disconnected (tenant removed, bot restart, etc.) |
| `error` | Bot encountered an error connecting or was disconnected unexpectedly; `error_message` populated |
| `suspended` | Connection suspended due to account suspension or invalid token; will not retry |

### `service_connection_status`

```sql
CREATE TYPE public.service_connection_status AS ENUM (
    'active',
    'expired',
    'revoked',
    'error'
);
```

| Value | Description |
|-------|-------------|
| `active` | Connection is valid and usable |
| `expired` | OAuth token has expired and refresh failed; user must reconnect |
| `revoked` | User explicitly disconnected the service |
| `error` | Unknown error; requires investigation |

### `subscription_status`

```sql
CREATE TYPE public.subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'paused',
    'unpaid'
);
```

| Value | Description |
|-------|-------------|
| `trialing` | Subscription is in a trial period (if trials are enabled in Stripe) |
| `active` | Subscription is active and paid |
| `past_due` | Last payment failed; Stripe retrying |
| `canceled` | Subscription canceled; access revoked at `current_period_end` |
| `incomplete` | Payment required to complete subscription setup |
| `incomplete_expired` | Incomplete subscription expired without payment |
| `paused` | Subscription paused (Stripe feature) |
| `unpaid` | All payment retries exhausted; access should be revoked |

### `api_key_type`

```sql
CREATE TYPE public.api_key_type AS ENUM ('anthropic', 'openai');
```

| Value | Description |
|-------|-------------|
| `anthropic` | Anthropic API key — required for all tenants; used for Claude model API calls |
| `openai` | OpenAI API key — optional; used for classification models if configured |

---

## Helper Functions

### `update_updated_at_column()`

This function already exists in the database (created by existing migrations). It is a BEFORE UPDATE trigger function that sets `updated_at = NOW()`.

```sql
-- Already exists; no need to recreate
-- CREATE OR REPLACE FUNCTION public.update_updated_at_column()
-- RETURNS TRIGGER LANGUAGE plpgsql AS $$
-- BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
```

---

## Table: `tenants`

**Purpose:** One row per Daimon tenant. A tenant is the top-level organizational unit — a Discord bot instance with its own plan, billing, and settings.

**Created by migration:** `20260400000000_create_tenants.sql` (to be created)

```sql
CREATE TABLE public.tenants (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    name                TEXT            NOT NULL,
    owner_id            UUID            NOT NULL,
    plan                tenant_plan     NOT NULL DEFAULT 'free',
    status              tenant_status   NOT NULL DEFAULT 'pending',
    stripe_customer_id  TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenants_pkey PRIMARY KEY (id),
    CONSTRAINT tenants_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES auth.users(id) ON DELETE RESTRICT,
    CONSTRAINT tenants_stripe_customer_id_key UNIQUE (stripe_customer_id),
    CONSTRAINT tenants_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);
```

### Column Reference

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Unique tenant identifier. All other SaaS tables reference this via `tenant_id`. Generated by PostgreSQL — never set by application code. |
| `name` | `TEXT` | NOT NULL | — | `char_length >= 1 AND <= 100` | Human-readable tenant name. Set by the user during onboarding. Appears in dashboard header, invite emails, and admin panel. Must be between 1 and 100 characters. |
| `owner_id` | `UUID` | NOT NULL | — | FOREIGN KEY → `auth.users(id)` ON DELETE RESTRICT | The Supabase Auth user who owns this tenant. Created at signup. Cannot be NULL — every tenant must have an owner. ON DELETE RESTRICT prevents deleting an auth user who owns a tenant (must delete tenant first). |
| `plan` | `tenant_plan` | NOT NULL | `'free'` | ENUM ('free', 'starter', 'pro') | Denormalized cache of the current billing plan. Updated by the Stripe webhook handler when `customer.subscription.updated` fires. Used by the bot at startup to configure `ToolRegistry` plan gates. Free on creation. |
| `status` | `tenant_status` | NOT NULL | `'pending'` | ENUM ('pending', 'configured', 'active', 'suspended') | Overall tenant lifecycle state. `pending` = setup not complete. `configured` = Discord + API key saved. `active` = bot connected. `suspended` = account suspended. Updated by: (a) website when user saves their first connection/key, (b) bot via Supabase Realtime heartbeat, (c) admin via admin panel. |
| `stripe_customer_id` | `TEXT` | NULL | NULL | UNIQUE | Stripe Customer ID (format: `cus_XXXXXXXXXXXXXXXXX`). Set when the user first initiates a Stripe Checkout flow. NULL for free-tier tenants who have never clicked "Upgrade". Once set, never changed (Stripe Customers are permanent). UNIQUE ensures one Stripe Customer per Daimon tenant. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Row creation timestamp. Set once at INSERT, never updated. Timezone-aware (stored in UTC). |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Last row modification timestamp. Updated by the `tenants_updated_at` trigger on every UPDATE. Timezone-aware (stored in UTC). |

### Indexes

```sql
-- Primary key index (automatic)
-- idx_tenants_pkey ON tenants(id)

-- Query: Look up tenant by owner for dashboard load
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);

-- Query: Admin panel — filter tenants by plan
CREATE INDEX idx_tenants_plan ON public.tenants(plan);

-- Query: Admin panel — filter tenants by status
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- Query: Stripe webhook — look up tenant by Stripe Customer ID
-- (stripe_customer_id already has UNIQUE index from constraint)
```

### Triggers

```sql
-- Auto-update updated_at on every modification
CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

### RLS

RLS is enabled on this table. The website user (Supabase Auth JWT) can only read tenants they are a member of.

```sql
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
```

Full RLS policy SQL is in [rls-policies.md](./rls-policies.md#tenants).

**Summary of policies:**

| Policy Name | Operation | Who Can Execute | Condition |
|-------------|-----------|-----------------|-----------|
| `tenants_select_member` | SELECT | Authenticated users | `id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())` |
| `tenants_insert_owner` | INSERT | Authenticated users | `owner_id = auth.uid()` |
| `tenants_update_member` | UPDATE | Authenticated users (owner/admin roles) | `id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))` |
| `tenants_delete_owner` | DELETE | Authenticated users (owner role only) | `id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role = 'owner')` |

### Notes

1. **Plan denormalization:** `tenants.plan` is a cache. The authoritative plan source is `tenant_subscriptions.stripe_status` + `tenant_subscriptions.plan`. The Stripe webhook handler keeps them in sync. The bot reads `tenants.plan` (not `tenant_subscriptions`) for performance — it's a single join-free column.

2. **Status lifecycle:**
   - Created at signup → `pending`
   - User saves Discord connection AND validates API key → website API route updates to `configured`
   - Bot connects and sends first heartbeat → bot updates `discord_connections.status` to `connected`; a trigger or bot code then updates `tenants.status` to `active`
   - Admin suspends → `suspended`; bot detects via Realtime and disconnects

3. **Tenant deletion:** Deleting a tenant requires deleting all child records first (discord_connections, tenant_api_keys, tenant_service_connections, tenant_subscriptions, tenant_members). The API route for "Delete Account" handles this in order. `tenants.owner_id` uses ON DELETE RESTRICT on `auth.users` — Supabase Auth users must be deleted AFTER the tenant row.

4. **Multi-owner tenants:** Not supported at launch. The `owner_id` column is the canonical owner. `tenant_members` stores the same owner as a row with `role='owner'`, but the `tenants.owner_id` is the reference for billing and Stripe operations.

5. **Bot reads this table:** At startup, the bot queries:
   ```sql
   SELECT t.id, t.plan, t.status
   FROM tenants t
   WHERE t.status != 'suspended'
   ```
   Combined with a join to `discord_connections` and `tenant_api_keys` to build `TenantConfig` objects for each active tenant.

---

## Table: `tenant_members`

**Purpose:** Maps Supabase Auth users to tenants with a role. Used by RLS policies as the source of truth for "who can access this tenant's data." At launch, each tenant has exactly one member row (the owner). Multi-seat team invites are deferred but the table exists to support correct RLS patterns from day one.

**Created by migration:** `20260400000001_create_tenant_members.sql` (to be created)

```sql
CREATE TABLE public.tenant_members (
    tenant_id   UUID                    NOT NULL,
    user_id     UUID                    NOT NULL,
    role        tenant_member_role      NOT NULL DEFAULT 'member',
    invited_by  UUID                    NULL,
    created_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_members_pkey PRIMARY KEY (tenant_id, user_id),
    CONSTRAINT tenant_members_tenant_id_fkey FOREIGN KEY (tenant_id)
        REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_members_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT tenant_members_invited_by_fkey FOREIGN KEY (invited_by)
        REFERENCES auth.users(id) ON DELETE SET NULL
);
```

### Column Reference

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `tenant_id` | `UUID` | NOT NULL | — | PRIMARY KEY (composite), FOREIGN KEY → `tenants(id)` ON DELETE CASCADE | The tenant this membership belongs to. Part of composite primary key. CASCADE delete — when a tenant is deleted, all membership rows are deleted automatically. |
| `user_id` | `UUID` | NOT NULL | — | PRIMARY KEY (composite), FOREIGN KEY → `auth.users(id)` ON DELETE CASCADE | The Supabase Auth user who is a member. Part of composite primary key — guarantees each (tenant, user) pair is unique (one membership per user per tenant). CASCADE delete — when an auth user is deleted, their membership rows are removed. |
| `role` | `tenant_member_role` | NOT NULL | `'member'` | ENUM ('owner', 'admin', 'member') | The user's role within the tenant. **owner**: set when the tenant is created (the founding user). Only one owner per tenant is enforced by application logic (not a DB constraint). **admin**: set by the owner via invite flow (deferred). **member**: default for future invited users. |
| `invited_by` | `UUID` | NULL | NULL | FOREIGN KEY → `auth.users(id)` ON DELETE SET NULL | The user_id of whoever invited this member. NULL for the owner (self-created). NULL if the inviting user's account is deleted (ON DELETE SET NULL). Used for audit trail. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | When the membership was created. For the owner, this is effectively the tenant creation time. For future invited members, this is when they accepted the invite. |

### Indexes

```sql
-- Primary key index (automatic, composite on tenant_id + user_id)
-- idx_tenant_members_pkey ON tenant_members(tenant_id, user_id)

-- Query: RLS policy lookup — "what tenants is this user a member of?"
-- This query runs on EVERY read of any RLS-protected SaaS table.
-- Critical path — must be fast.
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);

-- Query: "who are the members of this tenant?" (admin panel, invite list)
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);

-- Query: "what is this user's role in this tenant?" (UPDATE/DELETE policy checks)
CREATE INDEX idx_tenant_members_user_tenant_role
    ON public.tenant_members(user_id, tenant_id, role);
```

### Triggers

No `updated_at` trigger on this table — there is no `updated_at` column. Role changes are expected to be rare and do not need change tracking beyond `created_at`.

No triggers required. Role updates are done via direct UPDATE statements in API routes.

### RLS

RLS is enabled on this table. Users can read membership rows for tenants they belong to, and insert rows for tenants they own (owner or admin roles).

```sql
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
```

Full RLS policy SQL is in [rls-policies.md](./rls-policies.md#tenant_members).

**Summary of policies:**

| Policy Name | Operation | Who Can Execute | Condition |
|-------------|-----------|-----------------|-----------|
| `tenant_members_select` | SELECT | Authenticated users | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())` |
| `tenant_members_insert_admin` | INSERT | Authenticated users (owner/admin) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))` |
| `tenant_members_delete_owner` | DELETE | Authenticated users (owner) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role = 'owner') AND user_id != auth.uid()` (owner can remove others but not self) |
| `tenant_members_update_owner` | UPDATE | Authenticated users (owner) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role = 'owner')` |

### Notes

1. **Owner row creation:** When a user signs up and creates a tenant, the API route creates both the `tenants` row AND a `tenant_members` row in a single transaction:
   ```sql
   -- Step 1: Insert tenant
   INSERT INTO tenants (name, owner_id) VALUES ($name, $user_id) RETURNING id;

   -- Step 2: Insert owner membership
   INSERT INTO tenant_members (tenant_id, user_id, role)
   VALUES ($tenant_id, $user_id, 'owner');
   ```
   Both must succeed or both roll back.

2. **RLS self-reference:** The `tenant_members_select` policy references `tenant_members` itself (to get the current user's tenants). This is valid in PostgreSQL — RLS policies can reference the same table. The query planner handles the recursive reference correctly because `auth.uid()` filters the inner query to a single user's rows.

3. **Uniqueness guarantee:** The composite primary key `(tenant_id, user_id)` ensures a user cannot be a member of the same tenant twice. Application code does not need to check for duplicates before INSERT — the constraint will raise a `23505 unique_violation` error which the API route catches and returns as "User is already a member of this workspace."

4. **Owner transfer (deferred):** Ownership transfer is not supported at launch. The `tenants.owner_id` and the `tenant_members` row with `role='owner'` must always match. If ownership transfer is added later, both must be updated in a single transaction.

5. **One owner per tenant:** Not enforced by a database constraint (would require a partial unique index or check constraint that's complex). Enforced by application logic: the INSERT into `tenant_members` with `role='owner'` only happens at tenant creation time. The owner role can only be changed by direct UPDATE from the owner themselves. Admin panel can reassign ownership — must update both `tenants.owner_id` and the `tenant_members` rows in one transaction.

6. **Free-tier single seat:** At launch, free-tier tenants cannot invite additional members (enforced at the API route level, not the database level). The database schema supports multiple members from day one.

7. **Self-removal prevention:** The RLS `tenant_members_delete_owner` policy includes `AND user_id != auth.uid()` — owners cannot remove themselves. To leave a tenant, an owner must either transfer ownership first or delete the entire tenant.

---

## Cross-References

- [rls-policies.md](./rls-policies.md) — Complete SQL for all RLS policies on `tenants` and `tenant_members`
- [triggers.md](./triggers.md) — `tenants_updated_at` trigger SQL
- [migrations.md](./migrations.md) — Migration files that create these tables (with enum types first)
- [indexes.md](./indexes.md) — Full index rationale and query patterns
- [vault-encryption.md](./vault-encryption.md) — No Vault usage in these tables (Vault is used in `tenant_api_keys` and `discord_connections`)
- [multi-tenant/tenant-isolation.md](../multi-tenant/tenant-isolation.md) — §3.3 Database Rows — how RLS isolation works
- [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) — Bot subscribes to `tenants` table changes via Realtime
- [api/routes.md](../api/routes.md) — API routes that create/read/update these tables (POST /api/tenants, GET /api/tenant)
- [frontend/dashboard.md](../frontend/dashboard.md) — Dashboard reads `tenants` status column for bot status display
- [frontend/settings-page.md](../frontend/settings-page.md) — Settings page reads and updates `tenants.name`
- [premium/tiers.md](../premium/tiers.md) — `tenants.plan` maps to feature gates

---

*Next tables to spec: `discord_connections` (aspect 3.2), `tenant_api_keys` (aspect 3.3), `tenant_service_connections` (aspect 3.4), `tenant_subscriptions` (aspect 3.5)*

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

- [rls-policies.md](./rls-policies.md) — Complete SQL for all RLS policies on all tables
- [triggers.md](./triggers.md) — `tenants_updated_at`, `discord_connections_updated_at` trigger SQL
- [migrations.md](./migrations.md) — Migration files that create these tables (with enum types first)
- [indexes.md](./indexes.md) — Full index rationale and query patterns
- [vault-encryption.md](./vault-encryption.md) — Vault setup and encrypt/decrypt patterns (used in `discord_connections` and `tenant_api_keys`)
- [multi-tenant/tenant-isolation.md](../multi-tenant/tenant-isolation.md) — §3.3 Database Rows — how RLS isolation works
- [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) — Bot subscribes to `discord_connections` and `tenants` table changes via Realtime
- [multi-tenant/connection-manager.md](../multi-tenant/connection-manager.md) — Bot writes `discord_connections.status`, `last_heartbeat`, `error_message`, `bot_user_id`, `bot_username`
- [multi-tenant/health-monitoring.md](../multi-tenant/health-monitoring.md) — `effective_status` computation from `last_heartbeat`
- [api/routes.md](../api/routes.md) — API routes: POST /api/discord-connections, PATCH /api/discord-connections/:id, DELETE /api/discord-connections/:id
- [frontend/dashboard.md](../frontend/dashboard.md) — Dashboard reads `discord_connections` for bot status display with `effective_status` CASE
- [frontend/settings-page.md](../frontend/settings-page.md) — Settings page manages Discord connection (add, update token, disconnect)
- [premium/tiers.md](../premium/tiers.md) — Connection count limits per plan (free=1, starter=3, pro=unlimited)

---

*Next tables to spec: `tenant_service_connections` (aspect 3.4), `tenant_subscriptions` (aspect 3.5)*

---

## Table: `tenant_api_keys`

**Purpose:** One row per AI-provider API key per tenant. Stores encrypted Anthropic and (optionally) OpenAI API keys using Supabase Vault. At launch, the only key type that is **required** for a tenant to function is `anthropic`. OpenAI is optional — its absence causes the bot to fall back to Claude Haiku for classification tasks.

**Created by migration:** `20260400000003_create_tenant_api_keys.sql` (to be created)

```sql
CREATE TABLE public.tenant_api_keys (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL,
    key_type            api_key_type    NOT NULL,
    vault_secret_id     UUID            NOT NULL,
    key_hint            TEXT            NOT NULL,
    status              TEXT            NOT NULL DEFAULT 'active',
    validated_at        TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_api_keys_pkey PRIMARY KEY (id),
    CONSTRAINT tenant_api_keys_tenant_id_fkey FOREIGN KEY (tenant_id)
        REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_api_keys_tenant_provider_key UNIQUE (tenant_id, key_type),
    CONSTRAINT tenant_api_keys_status_check CHECK (
        status IN ('active', 'invalid', 'revoked')
    ),
    CONSTRAINT tenant_api_keys_key_hint_length CHECK (
        char_length(key_hint) >= 8 AND char_length(key_hint) <= 30
    )
);
```

**Note on `api_key_type` enum:** The `key_type` column uses the `api_key_type` enum defined above (`'anthropic'` | `'openai'`). The column is named `key_type` (not `provider`) in the final schema to avoid ambiguity with service-connection terminology in `tenant_service_connections`.

### Column Reference

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Unique identifier for this API key record. Generated by PostgreSQL. Never set by application code. Referenced in Realtime payloads received by the bot for hot-reload. |
| `tenant_id` | `UUID` | NOT NULL | — | FOREIGN KEY → `tenants(id)` ON DELETE CASCADE; part of UNIQUE `(tenant_id, key_type)` | The tenant this key belongs to. CASCADE delete — when a tenant is deleted, all API key records are removed automatically. |
| `key_type` | `api_key_type` | NOT NULL | — | ENUM ('anthropic', 'openai'); UNIQUE with `tenant_id` | Which AI provider this key is for. `'anthropic'` = Anthropic API key (required for the bot to operate). `'openai'` = OpenAI API key (optional; if absent, classification falls back to Claude Haiku). The UNIQUE constraint on `(tenant_id, key_type)` guarantees at most one key per provider per tenant. |
| `vault_secret_id` | `UUID` | NOT NULL | — | Logical FK to `vault.secrets(id)` — no formal PG FK constraint across schemas | UUID of the secret record in `vault.secrets` containing the AES-256-encrypted API key ciphertext. Created by calling `vault.create_secret()` in the `store-tenant-api-key` Edge Function before this row is inserted. When a tenant replaces their key: (a) a NEW Vault secret is created, (b) this column is updated to the new UUID via the UPSERT, (c) the old Vault secret is deleted via `vault.delete_secret()`. Never NULL after row creation — the Vault write always precedes the DB row write. |
| `key_hint` | `TEXT` | NOT NULL | — | CHECK: `char_length >= 8 AND <= 30` | A non-reversible masked representation of the API key, safe to display in the UI. Construction rules — Anthropic keys (`sk-ant-api03-XXXXX...`): `key[:8] + '...' + key[-4:]` (e.g., `'sk-ant-a...b12c'`). OpenAI project keys (`sk-proj-XXXXX...`): `key[:7] + '...' + key[-4:]` (e.g., `'sk-proj...b12c'`). OpenAI legacy keys (`sk-XXXXX...`): `key[:7] + '...' + key[-4:]` (e.g., `'sk-ABCD...b12c'`). The full plaintext key is NEVER stored here or in any non-Vault column. The hint is computed server-side only in the Edge Function. |
| `status` | `TEXT` | NOT NULL | `'active'` | CHECK: IN ('active', 'invalid', 'revoked') | Lifecycle state of this key. `'active'`: key is valid and loaded into bot's `TenantConfig`. `'invalid'`: key was found rejected (HTTP 401 from Anthropic/OpenAI) during a live API call; set asynchronously by the bot. `'revoked'`: tenant explicitly deleted the key, or admin revoked it; the corresponding Vault secret is also deleted when this status is set. See Note 8 for why this is `TEXT` rather than a PostgreSQL ENUM type. |
| `validated_at` | `TIMESTAMPTZ` | NULL | NULL | — | Timestamp of the most recent successful validation API call for this key. Set when the tenant saves a new key (validation call against Anthropic/OpenAI API succeeds). NOT updated by the bot's ongoing use of the key. NULL if the key was somehow stored without validation (not possible in current flow). Admin panel displays "Last validated: X ago" from this column. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Row creation timestamp. Set once at INSERT (when the tenant first saves this key type). Never updated even when the key is replaced (the row is upserted, not deleted+reinserted — so `created_at` reflects the first-ever key save for this provider). Stored in UTC. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Last row modification timestamp. Updated by the `tenant_api_keys_updated_at` trigger on every UPDATE. Changed when: tenant replaces key (vault_secret_id, key_hint, validated_at updated), bot marks key invalid (status updated), admin revokes key (status updated). Stored in UTC. |

### Unique Constraint Detail

```sql
CONSTRAINT tenant_api_keys_tenant_provider_key UNIQUE (tenant_id, key_type)
```

**Purpose:** Guarantees exactly 0 or 1 key record per AI provider per tenant. This enables the UPSERT pattern used when a tenant saves a new key:

```sql
INSERT INTO public.tenant_api_keys (
    tenant_id, key_type, vault_secret_id, key_hint, validated_at, status
)
VALUES (
    :tenant_id,
    'anthropic',
    :new_vault_secret_id,
    :key_hint,
    NOW(),
    'active'
)
ON CONFLICT (tenant_id, key_type)
DO UPDATE SET
    vault_secret_id = EXCLUDED.vault_secret_id,
    key_hint        = EXCLUDED.key_hint,
    validated_at    = EXCLUDED.validated_at,
    status          = 'active',
    updated_at      = NOW();
```

**When a conflict occurs (tenant already has an Anthropic key):**
1. The Edge Function captures the old `vault_secret_id` before the UPSERT.
2. The UPSERT updates the row in place with the new Vault reference and hint.
3. After UPSERT commits, the Edge Function calls `vault.delete_secret(old_vault_secret_id)` to remove the old encrypted key.
4. Realtime fires an UPDATE event to the bot, triggering hot-reload.

**If application code bypasses UPSERT and uses a plain INSERT:** A `23505 unique_violation` error is thrown. The API route/Edge Function catches this and returns HTTP 409: "An API key for this provider already exists. Use the replace flow."

### Indexes

```sql
-- Primary key index (automatic)
-- idx_tenant_api_keys_pkey ON tenant_api_keys(id)

-- Unique constraint index (automatic — covers most application queries)
-- idx_tenant_api_keys_tenant_provider_key ON tenant_api_keys(tenant_id, key_type)
-- Used by:
--   Bot startup JOIN: ON ak.tenant_id = t.id AND ak.key_type = 'anthropic' AND ak.status = 'active'
--   Bot hot-reload: lookup by tenant_id + key_type after Realtime event
--   Dashboard: SELECT key_hint, status WHERE tenant_id = :id AND key_type = 'anthropic'
--   UPSERT conflict target: ON CONFLICT (tenant_id, key_type)

-- Query: Admin panel — find all tenants with invalid keys
-- Useful for support: "show tenants whose bot stopped working due to bad API key"
CREATE INDEX idx_tenant_api_keys_status_invalid
    ON public.tenant_api_keys(tenant_id, updated_at)
    WHERE status = 'invalid';

-- Query: Admin metrics — how many tenants have OpenAI configured?
-- SELECT COUNT(DISTINCT tenant_id) FROM tenant_api_keys WHERE key_type = 'openai' AND status = 'active'
CREATE INDEX idx_tenant_api_keys_type_active
    ON public.tenant_api_keys(key_type)
    WHERE status = 'active';
```

### Triggers

```sql
-- Auto-update updated_at on every modification
CREATE TRIGGER tenant_api_keys_updated_at
    BEFORE UPDATE ON public.tenant_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

**Trigger frequency analysis:** The `updated_at` trigger fires when: (a) tenant saves/replaces a key — rare, maybe 1–2 times in the tenant's lifetime; (b) bot marks key `'invalid'` — rare, only on auth failures; (c) admin revokes key — rare. Unlike `discord_connections` (every 30s heartbeat), this trigger fires very infrequently. No performance concern.

### Supabase Realtime Configuration

The bot subscribes to `tenant_api_keys` via Realtime to detect new keys (enabling tenant connections) and key replacements (triggering hot-reload). Realtime must be enabled on this table.

```sql
-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_api_keys;
```

**Events consumed by the bot:**

| Event | Trigger Condition | Bot Action |
|-------|-------------------|------------|
| `INSERT` | Tenant saves a key for the first time | `_on_api_key_change()` — if Anthropic key and tenant has discord_connection: decrypt and load key, attempt to start tenant if not running |
| `UPDATE` (vault_secret_id changed, status = 'active') | Tenant replaced their key | `_on_api_key_change()` — decrypt new key via Vault, hot-reload into TenantConfig + ToolContext |
| `UPDATE` (status → 'revoked') | Tenant deleted key or admin revoked | `_on_api_key_change()` — if Anthropic key: disconnect tenant, set discord_connections.error_message |
| `UPDATE` (status → 'invalid', bot-written) | Bot wrote this — no action needed | `_on_api_key_change()` — checks status, sees 'invalid', logs "key already marked invalid by self", returns early |

**Realtime payload shape (INSERT example):**
```json
{
  "type": "postgres_changes",
  "schema": "public",
  "table": "tenant_api_keys",
  "event": "INSERT",
  "new": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tenant_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "key_type": "anthropic",
    "vault_secret_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "key_hint": "sk-ant-a...b12c",
    "status": "active",
    "validated_at": "2026-03-13T10:00:00.000Z",
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z"
  },
  "old": null
}
```

**Critically:** The `vault_secret_id` (UUID) is in the payload but the actual decrypted key is NOT. The bot must call `public.get_decrypted_secret(vault_secret_id)` — a SECURITY DEFINER SQL function — to obtain the plaintext key. See [vault-encryption.md](./vault-encryption.md) for the complete function definition and Vault setup.

### RLS

RLS is enabled on this table. All write operations (INSERT, UPDATE, DELETE) are performed by the `store-tenant-api-key` and `revoke-tenant-api-key` Edge Functions using the service role key, which bypasses RLS. Website users (JWT) can only SELECT — and only for tenants they are a member of.

```sql
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
```

Full RLS policy SQL is in [rls-policies.md](./rls-policies.md#tenant_api_keys).

**Summary of policies:**

| Policy Name | Operation | Who Can Execute | Condition |
|-------------|-----------|-----------------|-----------|
| `tenant_api_keys_select` | SELECT | Authenticated users (any role) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())` |
| `tenant_api_keys_insert` | INSERT | **BLOCKED for all JWT users** — no RLS policy grants INSERT | All INSERTs go through Edge Function (service role). If a JWT user tries to INSERT directly, Supabase returns `42501 insufficient_privilege`. |
| `tenant_api_keys_update` | UPDATE | **BLOCKED for all JWT users** — no RLS policy grants UPDATE | All UPDATEs go through Edge Function or bot (service role). |
| `tenant_api_keys_delete` | DELETE | **BLOCKED for all JWT users** — no RLS policy grants DELETE | All DELETEs go through Edge Function (service role). |

**Why no RLS INSERT/UPDATE/DELETE policies:** Vault operations (`vault.create_secret`, `vault.delete_secret`) require service role. Since key writes always require a Vault operation, ALL writes are channeled through Edge Functions using service role. Permitting website JWTs to write directly would create a bypass path around Vault enforcement. Blocking at RLS level is defense-in-depth: even if the Next.js application has a bug that tries to write directly, the database rejects it.

**Bot writes (service role):** The bot uses `SUPABASE_SERVICE_ROLE_KEY` — service role bypasses RLS. Bot writes: `UPDATE tenant_api_keys SET status = 'invalid' WHERE tenant_id = :t AND key_type = 'anthropic'` when a live API call returns HTTP 401.

### Key Revocation Flow

When a tenant clicks "Remove Key" on the Billing page:

```
User clicks "Remove Key" button
  ↓
Confirmation dialog appears:
  Title: "Remove Anthropic API Key?"
  Body: "Removing this key will immediately disconnect your bot.
         You'll need to add a new key to reconnect."
  Buttons: [Cancel] [Remove Key — red, destructive]
  ↓
User clicks "Remove Key" (confirms)
  ↓
POST /api/keys/revoke
  Body: { tenant_id: "...", key_type: "anthropic" }
  ↓
Next.js API route:
  1. Verify user JWT + owner/admin role via tenant_members lookup
  2. Call Edge Function: POST /functions/v1/revoke-tenant-api-key
     Body: { tenant_id, key_type, user_id (from JWT) }
  ↓
Edge Function (revoke-tenant-api-key):
  1. SELECT id, vault_secret_id FROM tenant_api_keys
     WHERE tenant_id = :t AND key_type = :type AND status = 'active'
  2. If not found: return 404 "No active key found to revoke"
  3. UPDATE tenant_api_keys SET status = 'revoked', updated_at = NOW()
     WHERE id = :id
  4. vault.delete_secret(:vault_secret_id)
     -- Permanently deletes encrypted key from Vault
  5. Return { success: true }
  ↓
Supabase Realtime fires UPDATE event (status: 'active' → 'revoked') to bot
  ↓
Bot: _on_api_key_change() receives payload
  → new.status = 'revoked', new.key_type = 'anthropic'
  → Calls _disconnect_tenant(tenant_id, reason='anthropic_key_revoked')
  → Updates discord_connections:
      status = 'error'
      error_message = 'Anthropic API key removed. Add a new key to reconnect your bot.'
  ↓
Dashboard updates via Realtime:
  - Discord connection card shows orange "Error" badge
  - Error message: "Anthropic API key removed. Add a new key to reconnect your bot."
  - Billing page API key section shows: "No Anthropic API key configured" + "Add Key" button
```

### Bot Startup JOIN Query (Complete Reference)

At startup, the bot queries `tenant_api_keys` as part of the full multi-tenant config load:

```sql
SELECT
    t.id               AS tenant_id,
    t.name             AS tenant_name,
    t.plan             AS plan,
    dc.id              AS discord_connection_id,
    dc.guild_id        AS guild_id,
    dc.vault_secret_id AS discord_vault_secret_id,
    dc.status          AS discord_status,
    ak_ant.vault_secret_id AS anthropic_vault_secret_id,
    ak_ant.key_hint    AS anthropic_key_hint,
    ak_oai.vault_secret_id AS openai_vault_secret_id   -- NULL if not configured
FROM public.tenants t
JOIN public.discord_connections dc
    ON dc.tenant_id = t.id
    AND dc.status NOT IN ('disconnected', 'suspended')
JOIN public.tenant_api_keys ak_ant
    ON ak_ant.tenant_id = t.id
    AND ak_ant.key_type = 'anthropic'
    AND ak_ant.status = 'active'
LEFT JOIN public.tenant_api_keys ak_oai
    ON ak_oai.tenant_id = t.id
    AND ak_oai.key_type = 'openai'
    AND ak_oai.status = 'active'
WHERE t.status NOT IN ('suspended')
ORDER BY t.created_at ASC;
```

**JOIN rationale:**
- `JOIN` (inner) on `ak_ant`: A tenant without an active Anthropic key cannot operate. If the Anthropic key is missing, revoked, or invalid, the tenant row is excluded. Bot logs: `WARNING: Tenant {id} has no active Anthropic key — skipping.`
- `LEFT JOIN` on `ak_oai`: OpenAI is optional. If absent, `openai_vault_secret_id` is NULL → `TenantConfig.openai_api_key = None` → bot uses Claude Haiku for classification.
- Filter `dc.status NOT IN ('disconnected', 'suspended')`: Excludes connections the user intentionally disconnected or that are suspended. Reconnects pending/error/connected/connecting connections.
- Filter `t.status NOT IN ('suspended')`: Excludes suspended tenants entirely.

After this query, the bot calls `get_decrypted_secret()` for each `vault_secret_id` to load plaintext keys into `TenantConfig`. See [multi-tenant/byok-key-routing.md](../multi-tenant/byok-key-routing.md) §3.2 for the complete Python loading implementation.

### Notes

1. **Row count per tenant:** At launch, each tenant has 1–2 rows (1 Anthropic always, 1 OpenAI optionally). The UNIQUE constraint on `(tenant_id, key_type)` guarantees exactly 0 or 1 active row per provider per tenant. Row count scales O(1) per tenant regardless of usage.

2. **No hard row deletion on key replacement:** When a tenant replaces a key, the `tenant_api_keys` row is UPDATED in place (UPSERT). The `created_at` column reflects when the FIRST key of this type was saved — not the most recent replacement. `updated_at` reflects the most recent replacement. The old Vault secret IS deleted (permanent removal of the encrypted key material), but the metadata row persists.

3. **No row deletion on revocation:** The row is set to `status = 'revoked'` rather than deleted. This preserves audit trail: `created_at` (when key was first added), `updated_at` (when it was revoked), and `key_hint` (which key was revoked). Only the Vault secret (encrypted key material) is permanently deleted. Admin panel can show "Key removed on YYYY-MM-DD" even after revocation.

4. **Vault secret naming:** Each Vault secret is named `'tenant_api_keys:{tenant_id}:{key_type}'` (e.g., `'tenant_api_keys:b2c3d4e5...:anthropic'`). This name is visible in the Supabase Vault dashboard for human identification. Vault secret names are NOT enforced as unique by Vault — uniqueness is provided by the `(tenant_id, key_type)` constraint in `tenant_api_keys`. If an old Vault secret is orphaned (edge case: Edge Function crashes between Vault write and DB write), the name in Vault helps identify orphans during cleanup.

5. **Key hint is safe to log:** `key_hint` (e.g., `'sk-ant-a...b12c'`) is safe to include in application logs, admin panels, and error messages. It cannot be reversed to obtain the full key. Log pattern: `INFO: Tenant {id} anthropic key {hint} hot-reloaded.`

6. **`status = 'invalid'` is bot-written, asynchronous:** The website validates the key synchronously at save time. The bot detects invalidity asynchronously during live use (if the key is revoked on Anthropic's side after save). The bot writes `'invalid'` status, which fires a Realtime UPDATE. The website dashboard reacts and shows an error banner. The tenant receives no proactive notification at launch — they see it when they next visit the dashboard.

7. **Why TEXT + CHECK for status (not ENUM):** Adding values to a PostgreSQL enum requires `ALTER TYPE` which may need downtime in some circumstances. `TEXT` + `CHECK` constraint allows adding new status values via a simpler `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT ...`. At 3 values (`active`, `invalid`, `revoked`), this is simpler and equally safe.

8. **Admin visibility of keys:** Admin panel shows `key_hint` (masked) and `status` only. Admins cannot see `vault_secret_id` or recover the full key. If an admin needs to help a tenant debug a key issue, they can see when the key was last validated (`validated_at`) and whether the bot marked it invalid (`status = 'invalid'`), but cannot read the key itself.

9. **key_hint for display in admin audit log:** If an admin views the tenant detail page and sees "Anthropic key sk-ant-a...b12c was revoked on 2026-03-10," the `key_hint` in the audit entry identifies which key was affected without exposing the full key. This is why `key_hint` is preserved even in revoked rows.

---

---

## Table: `tenant_service_connections`

**Purpose:** One row per third-party service connected at the tenant level. Stores encrypted credentials (OAuth access/refresh tokens or API keys) via Supabase Vault. Powers the Integrations page. The bot reads this table at startup to populate per-tenant optional `ToolContext` fields (e.g., `linear_api_key`, `linear_team_id`) and to inject tenant-level credentials into `UserContext.credentials` as fallback when a Discord user has no personal credentials for a service.

**Created by migration:** `20260400000004_create_tenant_service_connections.sql` (to be created)

**Services covered at launch:** `github` (OAuth), `google` (OAuth), `linear` (OAuth), `toggl` (API key)

### New Enum Types Required

#### `service_auth_type`

```sql
CREATE TYPE public.service_auth_type AS ENUM ('oauth', 'api_key');
```

| Value | Description |
|-------|-------------|
| `oauth` | OAuth 2.0 flow. Has access token + optional refresh token + optional expiry. |
| `api_key` | API key or personal access token pasted by user. No expiry management. |

#### `service_connection_status`

```sql
CREATE TYPE public.service_connection_status AS ENUM (
    'connected',
    'expired',
    'revoked',
    'error'
);
```

| Value | Description | Who Sets It |
|-------|-------------|-------------|
| `connected` | Credentials are active and should be usable. | Website sets on successful OAuth callback or API key validation. Bot keeps if still working. |
| `expired` | OAuth access token has expired and refresh either failed or is not available. | Website sets if refresh attempt fails. Bot sets if API call returns 401 and refresh fails. |
| `revoked` | User explicitly disconnected the service from the integrations page. | Website only. `vault.delete_secret()` called at same time. |
| `error` | Credential returned an unexpected error (not a 401 expiry). E.g., scope removed, app de-authorized, API key invalidated. | Bot sets when tool call returns auth error that is not a standard expiry. |

### Table DDL

```sql
CREATE TABLE public.tenant_service_connections (
    -- Primary identification
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL,

    -- Service identity
    service                 TEXT            NOT NULL,
    auth_type               public.service_auth_type NOT NULL,

    -- Vault references (never store plaintext tokens)
    vault_secret_id         UUID            NOT NULL,   -- access_token (OAuth) or api_key (API key)
    refresh_vault_secret_id UUID            NULL,       -- refresh_token (OAuth only; NULL for api_key and non-refreshable OAuth)

    -- OAuth token management
    token_expires_at        TIMESTAMPTZ     NULL,       -- NULL for api_key and non-expiring OAuth tokens
    scopes                  TEXT[]          NOT NULL DEFAULT '{}',   -- OAuth scopes granted (empty for api_key)

    -- Service-specific metadata (see per-service schemas below)
    metadata                JSONB           NOT NULL DEFAULT '{}',

    -- Status
    status                  public.service_connection_status NOT NULL DEFAULT 'connected',
    error_message           TEXT            NULL,       -- Only when status = 'error'; NULL otherwise

    -- Audit
    connected_by_user_id    UUID            NULL,       -- auth.users.id of the team member who connected this (nullable: legacy rows)
    connected_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_used_at            TIMESTAMPTZ     NULL,       -- Set by bot when credential is read
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tenant_service_connections_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_service_connections_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_service_connections_unique_per_tenant
        UNIQUE (tenant_id, service),
    CONSTRAINT tenant_service_connections_service_check
        CHECK (service IN ('github', 'google', 'linear', 'toggl')),
    CONSTRAINT tenant_service_connections_auth_type_service_check
        CHECK (
            (service IN ('github', 'google', 'linear') AND auth_type = 'oauth')
            OR
            (service = 'toggl' AND auth_type = 'api_key')
        ),
    CONSTRAINT tenant_service_connections_refresh_token_oauth_only
        CHECK (
            (auth_type = 'api_key' AND refresh_vault_secret_id IS NULL)
            OR (auth_type = 'oauth')
        ),
    CONSTRAINT tenant_service_connections_expires_api_key_null
        CHECK (
            (auth_type = 'api_key' AND token_expires_at IS NULL)
            OR (auth_type = 'oauth')
        )
);
```

### Constraint Rationale

| Constraint | Rationale |
|------------|-----------|
| `UNIQUE (tenant_id, service)` | One connection per service per tenant. If a tenant wants to reconnect, they must disconnect first (which sets status='revoked'), then reconnect. Reconnecting replaces the row via UPSERT. |
| `CHECK service IN (...)` | Prevents insertion of unsupported service strings. Adding a new service (e.g., `'notion'`) requires an `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT ...`. |
| `auth_type_service_check` | Enforces that GitHub/Google/Linear always use OAuth and Toggl always uses API key. This matches the OAuth app configuration — no Toggl OAuth app is registered. |
| `refresh_token_oauth_only` | API key services never have a refresh token. For OAuth, `refresh_vault_secret_id` can be NULL (GitHub OAuth App tokens don't expire by default; Linear tokens don't expire). |
| `expires_api_key_null` | API keys don't have expiry timestamps. `token_expires_at` is only meaningful for OAuth services that issue expiring tokens (Google). |

### Column Specifications

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK | Row identifier. Used in Vault secret names. |
| `tenant_id` | UUID | NOT NULL | — | FK → `tenants(id)` CASCADE | Owner tenant. |
| `service` | TEXT | NOT NULL | — | CHECK, UNIQUE with tenant_id | Service name. Enum-like. See service check constraint. |
| `auth_type` | `service_auth_type` | NOT NULL | — | CHECK with service | Determines which credential management path is used. |
| `vault_secret_id` | UUID | NOT NULL | — | — | `vault.secrets.id` for the access token (OAuth) or API key. Never NULL — every connected service has a primary secret. |
| `refresh_vault_secret_id` | UUID | NULL | NULL | CHECK: only non-NULL for oauth | `vault.secrets.id` for the OAuth refresh token. NULL for API key services and OAuth services that don't issue refresh tokens (GitHub App OAuth, Linear). |
| `token_expires_at` | TIMESTAMPTZ | NULL | NULL | CHECK: only non-NULL for oauth | When the OAuth access token expires. NULL for API key, GitHub (tokens don't expire by default), and Linear (tokens don't expire). Set for Google (expires in 3600 seconds). |
| `scopes` | TEXT[] | NOT NULL | `'{}'` | — | OAuth scopes granted at time of authorization. Empty array for API key. For GitHub: `['repo', 'read:user']`. For Google: `['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly']`. For Linear: `['read', 'write', 'issues:create', 'comments:create']`. |
| `metadata` | JSONB | NOT NULL | `'{}'` | — | Service-specific data. See per-service metadata schemas below. |
| `status` | `service_connection_status` | NOT NULL | `'connected'` | — | Current connection health. |
| `error_message` | TEXT | NULL | NULL | — | Human-readable error. Set when status='error'. NULL when status='connected'. Cleared on reconnection. Max 500 characters. |
| `connected_by_user_id` | UUID | NULL | NULL | — | `auth.users.id` of the user who connected the service. Display only — for "Connected by @username on date" in the integrations UI. |
| `connected_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — | When the service was first connected (or most recently reconnected after revocation). |
| `last_used_at` | TIMESTAMPTZ | NULL | NULL | — | When the bot last successfully used this credential. Updated by bot asynchronously. Not critical-path. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — | Updated on any column change (via trigger). |

### Per-Service Metadata Schemas

The `metadata` JSONB column stores service-specific information that is safe to store in plaintext (no secrets). This data is used by the bot to populate `ToolContext` fields and by the website to display connection details in the integrations UI.

#### `service = 'github'`

```json
{
  "github_login": "octocat",
  "github_user_id": 1,
  "github_name": "The Octocat",
  "github_avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "github_email": "octocat@github.com"
}
```

| Field | Type | Source | Used By |
|-------|------|--------|---------|
| `github_login` | string | `GET /user` → `.login` | UI: "Connected as @octocat" |
| `github_user_id` | integer | `GET /user` → `.id` | Identity tracking |
| `github_name` | string \| null | `GET /user` → `.name` | UI: display name |
| `github_avatar_url` | string \| null | `GET /user` → `.avatar_url` | UI: avatar |
| `github_email` | string \| null | `GET /user` → `.email` | Audit trail |

**Bot usage:** The bot uses the decrypted `vault_secret_id` (GitHub OAuth access token) as the value for `GITHUB_TOKEN` environment variable when running `gh` CLI commands via `github_run_gh` tool. The `metadata` fields are not used by the bot directly — only the token.

#### `service = 'google'`

```json
{
  "google_email": "user@gmail.com",
  "google_user_id": "116620468923013920116",
  "google_name": "Jane Doe",
  "google_picture": "https://lh3.googleusercontent.com/..."
}
```

| Field | Type | Source | Used By |
|-------|------|--------|---------|
| `google_email` | string | `GET /oauth2/v2/userinfo` → `.email` | UI: "Connected as user@gmail.com" |
| `google_user_id` | string | `GET /oauth2/v2/userinfo` → `.id` | Identity tracking |
| `google_name` | string \| null | `GET /oauth2/v2/userinfo` → `.name` | UI: display name |
| `google_picture` | string \| null | `GET /oauth2/v2/userinfo` → `.picture` | UI: avatar |

**Bot usage:** Google tools are scoped to specific Google APIs. The access token is used for Google Calendar, Google Docs, Google Drive depending on what tools are enabled. `token_expires_at` is set (Google tokens expire in 3600 seconds). The website refreshes tokens proactively via `/api/integrations/google/refresh` when `token_expires_at < NOW() + INTERVAL '5 minutes'`.

#### `service = 'linear'`

```json
{
  "linear_team_id": "abc123def456",
  "linear_team_name": "Engineering",
  "linear_viewer_id": "xyz789uvw012",
  "linear_viewer_name": "Jane Doe",
  "linear_viewer_email": "jane@example.com",
  "linear_organization_id": "org-abc-123",
  "linear_organization_name": "Acme Corp"
}
```

| Field | Type | Source | Used By |
|-------|------|--------|---------|
| `linear_team_id` | string | Linear OAuth callback → team selection step | Bot: `TenantConfig.linear_team_id`, passed into `ToolContext.linear_team_id` |
| `linear_team_name` | string | Linear API → team query | UI: "Connected to Engineering team" |
| `linear_viewer_id` | string | Linear API `viewer { id }` | Identity tracking |
| `linear_viewer_name` | string | Linear API `viewer { name }` | UI display |
| `linear_viewer_email` | string | Linear API `viewer { email }` | Audit trail |
| `linear_organization_id` | string | Linear API `organization { id }` | Audit trail |
| `linear_organization_name` | string | Linear API `organization { name }` | UI: "Connected to Acme Corp" |

**Bot usage:** `linear_api_key` (decrypted) is passed as `TenantConfig.linear_api_key`. `linear_team_id` (from metadata) is passed as `TenantConfig.linear_team_id`. These populate `ToolContext.linear_api_key` and `ToolContext.linear_team_id` for all Linear tools. Linear OAuth tokens do NOT expire — `token_expires_at` is NULL and `refresh_vault_secret_id` is NULL.

#### `service = 'toggl'`

```json
{
  "toggl_user_id": 9876543,
  "toggl_email": "user@example.com",
  "toggl_full_name": "Jane Doe",
  "toggl_workspace_id": 1234567,
  "toggl_workspace_name": "My Workspace",
  "toggl_organization_id": 2345678,
  "toggl_organization_name": "My Organization",
  "toggl_workspace_role": "admin"
}
```

| Field | Type | Source | Used By |
|-------|------|--------|---------|
| `toggl_user_id` | integer | `GET https://api.track.toggl.com/api/v9/me` → `.id` | Identity tracking |
| `toggl_email` | string | `/me` → `.email` | UI: "Connected as user@example.com" |
| `toggl_full_name` | string | `/me` → `.fullname` | UI: display name |
| `toggl_workspace_id` | integer | Validated at key submission → workspace query | **Bot: fallback workspace scope for Toggl tools** (when no per-user workspace override) |
| `toggl_workspace_name` | string | Workspace query | UI: "Connected to My Workspace" |
| `toggl_organization_id` | integer | Workspace query → `.organization_id` | Bot: `ToolContext.toggl_organization_id` fallback |
| `toggl_organization_name` | string | Organization query | UI display |
| `toggl_workspace_role` | string (`"admin"` \| `"member"`) | Workspace member query | Bot: injected into `UserContext.credential_metadata[TOGGL]` for `Scope.TOGGL_WORKSPACE_ADMIN` gate |

**Bot usage:** The Toggl API key is injected into `UserContext.credentials[CredentialPlatform.TOGGL]` as the tenant-level fallback when the Discord user has no personal Toggl credential in `user_credentials`. The `toggl_workspace_id` and `toggl_organization_id` from metadata override `ToolContext.toggl_workspace_id` / `toggl_organization_id` (which are platform-level defaults — the PyMC workspace). The `toggl_workspace_role` is injected into `UserContext.credential_metadata[CredentialPlatform.TOGGL]` for admin scope gating.

### Indexes

```sql
-- Primary lookup: get all connections for a tenant (integrations page, bot startup)
CREATE INDEX idx_tenant_service_connections_tenant_id
    ON public.tenant_service_connections (tenant_id);

-- Filter by status for bot: find connected services per tenant
CREATE INDEX idx_tenant_service_connections_tenant_status
    ON public.tenant_service_connections (tenant_id, status);

-- Token expiry scan: find Google tokens expiring soon (refresh job)
CREATE INDEX idx_tenant_service_connections_token_expires_at
    ON public.tenant_service_connections (token_expires_at)
    WHERE token_expires_at IS NOT NULL AND status = 'connected';
```

**Index rationale:**

| Index | Query Pattern | Estimated Access Pattern |
|-------|--------------|--------------------------|
| `tenant_id` | Integrations page load: `SELECT * FROM tenant_service_connections WHERE tenant_id = $1` | Per page view — O(1) per tenant, 1–4 rows returned |
| `(tenant_id, status)` | Bot startup: `SELECT * FROM tenant_service_connections WHERE tenant_id = $1 AND status = 'connected'` | Per tenant at startup, O(connections) |
| `token_expires_at WHERE NOT NULL AND connected` | Scheduled refresh job: `SELECT * WHERE token_expires_at < NOW() + INTERVAL '5 minutes' AND status = 'connected'` | Runs every minute, scans only Google OAuth rows |

### Triggers

#### `updated_at` Auto-Update Trigger

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

CREATE TRIGGER trg_tenant_service_connections_updated_at
    BEFORE UPDATE ON public.tenant_service_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tenant_service_connections_updated_at();
```

**Note:** A shared `set_updated_at()` trigger function may be used if one already exists in the migration history. The pattern is the same as used on `tenants`, `tenant_api_keys`, `discord_connections`.

### RLS Policies

```sql
ALTER TABLE public.tenant_service_connections ENABLE ROW LEVEL SECURITY;

-- Tenant owners and admins can SELECT their own service connections
CREATE POLICY "Tenant members can read own service connections"
    ON public.tenant_service_connections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- Only tenant owners and admins can INSERT (connect a new service)
CREATE POLICY "Tenant owners/admins can insert service connections"
    ON public.tenant_service_connections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- Only tenant owners and admins can UPDATE (update status, metadata)
CREATE POLICY "Tenant owners/admins can update service connections"
    ON public.tenant_service_connections
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- Only tenant owners and admins can DELETE (disconnect a service)
-- Note: website uses status='revoked' soft-delete, not hard DELETE
-- Hard DELETE only happens on full tenant deletion (CASCADE from tenants)
CREATE POLICY "Tenant owners/admins can delete service connections"
    ON public.tenant_service_connections
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**Note:** The bot accesses this table via the service role key (bypasses RLS). The website uses the authenticated user's JWT (RLS-enforced). The `vault_secret_id` column values are UUIDs only — browsers never receive decrypted tokens.

### Vault Patterns for Service Connections

#### Vault Secret Names

| Service | Auth Type | Secret Type | Name Pattern | Example |
|---------|-----------|-------------|-------------|---------|
| `github` | `oauth` | access_token | `tenant_service_connections:{id}:github:access` | `tenant_service_connections:a1b2c3...:github:access` |
| `google` | `oauth` | access_token | `tenant_service_connections:{id}:google:access` | `tenant_service_connections:b2c3d4...:google:access` |
| `google` | `oauth` | refresh_token | `tenant_service_connections:{id}:google:refresh` | `tenant_service_connections:b2c3d4...:google:refresh` |
| `linear` | `oauth` | access_token | `tenant_service_connections:{id}:linear:access` | `tenant_service_connections:c3d4e5...:linear:access` |
| `toggl` | `api_key` | api_key | `tenant_service_connections:{id}:toggl:key` | `tenant_service_connections:d4e5f6...:toggl:key` |

**Rules:**
- `{id}` = the `tenant_service_connections.id` UUID (NOT the tenant_id)
- Names contain no sensitive data (only the row ID and service name — not the token itself)
- GitHub does NOT have a refresh token (GitHub OAuth App tokens don't expire by default; no refresh needed)
- Linear does NOT have a refresh token (Linear OAuth tokens don't expire)
- Toggl does NOT have a refresh token (API key with no expiry)

#### Vault Creation on OAuth Callback

```typescript
// In: /api/integrations/[service]/callback
// After receiving OAuth tokens from provider, store in Vault:

// 1. Create access token secret
const { data: accessSecretId } = await supabase.rpc('create_tenant_secret', {
  p_tenant_id: tenantId,
  p_secret_type: `${service}_access`,   // e.g., 'github_access'
  p_secret: accessToken,
  p_hint: buildTokenHint(accessToken),
})

// 2. Create refresh token secret (if present)
let refreshSecretId: string | null = null
if (refreshToken) {
  const { data } = await supabase.rpc('create_tenant_secret', {
    p_tenant_id: tenantId,
    p_secret_type: `${service}_refresh`,
    p_secret: refreshToken,
    p_hint: buildTokenHint(refreshToken),
  })
  refreshSecretId = data
}

// 3. UPSERT the connection row
const { data: connection } = await supabase
  .from('tenant_service_connections')
  .upsert({
    tenant_id: tenantId,
    service,
    auth_type: 'oauth',
    vault_secret_id: accessSecretId,
    refresh_vault_secret_id: refreshSecretId,
    token_expires_at: expiresAt,    // null for GitHub, Linear; ISO timestamp for Google
    scopes: grantedScopes,
    metadata: buildServiceMetadata(service, userInfo),
    status: 'connected',
    error_message: null,
    connected_by_user_id: userId,
  }, {
    onConflict: 'tenant_id,service',  // UNIQUE constraint field
  })
  .select()
  .single()
```

**On UPSERT conflict (reconnecting a previously connected service):**
1. The old `vault_secret_id` is overwritten in the row. The old Vault secret becomes orphaned.
2. After UPSERT completes: `vault.delete_secret(old_vault_secret_id)` and `vault.delete_secret(old_refresh_vault_secret_id)` if applicable.
3. If Vault deletion fails (non-fatal): log the orphan, it will be cleaned up by the weekly orphan cleanup job.

#### Vault Deletion on Disconnect

When a tenant clicks "Disconnect" on the integrations page:

```typescript
// In: /api/integrations/[service]/disconnect (DELETE method)

// 1. Read current vault IDs before update
const { data: existing } = await supabase
  .from('tenant_service_connections')
  .select('vault_secret_id, refresh_vault_secret_id')
  .eq('tenant_id', tenantId)
  .eq('service', service)
  .single()

// 2. Mark as revoked (soft delete — preserves metadata row for audit)
await supabase
  .from('tenant_service_connections')
  .update({
    status: 'revoked',
    error_message: null,
    updated_at: new Date().toISOString(),
  })
  .eq('tenant_id', tenantId)
  .eq('service', service)

// 3. Delete Vault secrets (permanent — key material destroyed)
await supabase.rpc('delete_tenant_secret', {
  p_vault_secret_id: existing.vault_secret_id,
})
if (existing.refresh_vault_secret_id) {
  await supabase.rpc('delete_tenant_secret', {
    p_vault_secret_id: existing.refresh_vault_secret_id,
  })
}
```

**Why soft-delete (status='revoked') not hard DELETE:**
- Preserves metadata row for audit trail ("GitHub was disconnected on YYYY-MM-DD by @username")
- Preserves `connected_at`, `scopes`, `metadata` for the admin panel
- Prevents accidental re-read of stale credentials by the bot (status check filters out revoked)
- Hard DELETE happens only on full tenant account deletion (CASCADE from `tenants`)

### Token Refresh Logic (Google OAuth Only)

Google OAuth access tokens expire after 3600 seconds (1 hour). The platform must refresh them proactively.

**Refresh trigger:** Token is considered "near-expiry" when `token_expires_at < NOW() + INTERVAL '5 minutes'`.

**Refresh happens in two places:**

1. **Website API route** — `/api/integrations/google/refresh` — triggered by:
   - Frontend detecting near-expiry before a page load (client-side check)
   - Scheduled Supabase Edge Function cron (see below)

2. **Bot side** — If the bot attempts to use a Google token and gets a 401 response, the bot:
   - Sets `status = 'expired'` on the row (does NOT attempt refresh — bot cannot call Google OAuth refresh endpoint without the client_secret which is only in Vercel env vars)
   - Sets `error_message = 'Google token expired. Visit your Daimon dashboard to reconnect Google.'`
   - Tool call returns: `ToolError("Google connection expired. Reconnect Google in your Daimon dashboard at daimon.so/dashboard/integrations")`

**Refresh logic in `/api/integrations/google/refresh`:**

```typescript
// Step 1: Load the current refresh token from Vault
const refreshToken = await getDecryptedSecret(connection.refresh_vault_secret_id)
if (!refreshToken) {
  // No refresh token stored → user must re-authorize
  await markConnectionExpired(tenantId, 'google', 'No refresh token available. Please reconnect Google.')
  return { error: 'no_refresh_token' }
}

// Step 2: Call Google Token endpoint
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
  }),
})

const tokens = await response.json()

if (!response.ok || tokens.error) {
  // Refresh failed — token revoked or expired
  await markConnectionExpired(tenantId, 'google', `Token refresh failed: ${tokens.error_description}`)
  return { error: 'refresh_failed', description: tokens.error_description }
}

// Step 3: Create new Vault secret for new access token
const newAccessSecretId = await createTenantSecret(tenantId, 'google_access', tokens.access_token)

// Step 4: Delete old Vault secret
await deleteTenantSecret(connection.vault_secret_id)

// Step 5: Update connection row with new vault_secret_id and extended expiry
await supabase.from('tenant_service_connections').update({
  vault_secret_id: newAccessSecretId,
  token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  status: 'connected',
  error_message: null,
  updated_at: new Date().toISOString(),
}).eq('tenant_id', tenantId).eq('service', 'google')
```

**Scheduled refresh job:** A Supabase Edge Function `refresh-google-tokens` is invoked by pg_cron every 30 minutes. It queries `tenant_service_connections WHERE service = 'google' AND status = 'connected' AND token_expires_at < NOW() + INTERVAL '10 minutes'` and refreshes each one. This proactive refresh ensures the bot always has a valid Google token without the need for the user to visit the dashboard.

**pg_cron schedule:**
```sql
SELECT cron.schedule(
    'refresh-google-tokens',
    '*/30 * * * *',  -- every 30 minutes
    $$ SELECT net.http_post(
        url := current_setting('app.supabase_functions_url') || '/refresh-google-tokens',
        headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}',
        body := '{}'
    ) $$
);
```

### Status Transition Diagram

```
                     ┌─────────────────────────────────┐
                     │         (initial connect)         │
                     ▼                                   │
                ┌─────────┐   OAuth token expired    ┌───┴──────┐
                │connected├──────────────────────────▶│ expired  │
                └────┬────┘                           └────┬─────┘
                     │                                     │
                     │ user disconnects                     │ refresh succeeds
                     ▼                                     ▼
                ┌─────────┐                          ┌─────────┐
                │ revoked │                          │connected│
                └─────────┘                          └─────────┘
                     │
                     │ (reconnect replaces row, status → connected)

                ┌─────────┐
                │  error  │◀── unexpected API error (non-401)
                └─────────┘
                     │
                     │ user reconnects (new OAuth flow)
                     ▼
                ┌─────────┐
                │connected│
                └─────────┘
```

**Transition rules:**
- `connected → expired`: Bot sets when API call returns 401 AND refresh fails (or no refresh token). Website sets if scheduled refresh fails.
- `connected → error`: Bot sets when API call returns non-401 auth error (scope removed, app de-authorized, API key invalidated by provider).
- `connected → revoked`: User clicks "Disconnect" on integrations page. Vault secrets deleted permanently.
- `expired → connected`: User re-authorizes via OAuth flow (new tokens replace old row).
- `error → connected`: User reconnects (new OAuth flow or new API key).
- `revoked → connected`: User reconnects (new OAuth flow). Row is UPSERTed.

### Bot Read Pattern at Startup

At startup, the bot includes `tenant_service_connections` in its multi-tenant config load query:

```sql
-- Extended startup query (adds to the query in tenant_api_keys spec)
SELECT
    tsc_linear.vault_secret_id  AS linear_vault_secret_id,
    tsc_linear.metadata         AS linear_metadata,
    tsc_toggl.vault_secret_id   AS toggl_vault_secret_id,
    tsc_toggl.metadata          AS toggl_metadata,
    tsc_github.vault_secret_id  AS github_vault_secret_id,
    tsc_google.vault_secret_id  AS google_vault_secret_id,
    tsc_google.token_expires_at AS google_token_expires_at
FROM public.tenants t
-- ... (discord_connections and tenant_api_keys JOINs from prior spec) ...
LEFT JOIN public.tenant_service_connections tsc_linear
    ON tsc_linear.tenant_id = t.id
    AND tsc_linear.service = 'linear'
    AND tsc_linear.status = 'connected'
LEFT JOIN public.tenant_service_connections tsc_toggl
    ON tsc_toggl.tenant_id = t.id
    AND tsc_toggl.service = 'toggl'
    AND tsc_toggl.status = 'connected'
LEFT JOIN public.tenant_service_connections tsc_github
    ON tsc_github.tenant_id = t.id
    AND tsc_github.service = 'github'
    AND tsc_github.status = 'connected'
LEFT JOIN public.tenant_service_connections tsc_google
    ON tsc_google.tenant_id = t.id
    AND tsc_google.service = 'google'
    AND tsc_google.status = 'connected'
```

**After the query, TenantConfig construction decrypts each `vault_secret_id` and maps to fields:**

```python
# Decrypt service connection tokens (all via get_decrypted_secret())
linear_api_key = await decrypt(row.linear_vault_secret_id) if row.linear_vault_secret_id else None
linear_team_id = row.linear_metadata.get('linear_team_id') if row.linear_metadata else None
toggl_api_key  = await decrypt(row.toggl_vault_secret_id) if row.toggl_vault_secret_id else None
toggl_workspace_id   = row.toggl_metadata.get('toggl_workspace_id') if row.toggl_metadata else None
toggl_organization_id = row.toggl_metadata.get('toggl_organization_id') if row.toggl_metadata else None
toggl_workspace_role = row.toggl_metadata.get('toggl_workspace_role') if row.toggl_metadata else 'member'
github_token   = await decrypt(row.github_vault_secret_id) if row.github_vault_secret_id else None
google_token   = await decrypt(row.google_vault_secret_id) if row.google_vault_secret_id else None
```

**Google token expiry check at startup:**
```python
if row.google_token_expires_at:
    expires_at = datetime.fromisoformat(row.google_token_expires_at)
    if expires_at < datetime.now(tz=UTC) + timedelta(minutes=5):
        # Token is near-expiry or already expired
        # Bot does NOT refresh here (no client_secret in bot env)
        # Log warning, set google_token = None (tools will fail gracefully)
        logger.warning(f"Tenant {tenant_id} Google token near/past expiry. Bot will skip Google tools.")
        google_token = None
```

### Supabase Realtime Events

The bot subscribes to changes on `tenant_service_connections` via Realtime:

**Channel:** `tenant:{tenant_id}:service_connections`

**Filter:** `tenant_id=eq.{tenant_id}`

**Events handled:**

| Event | Trigger | Bot Action |
|-------|---------|-----------|
| `INSERT` (status='connected') | User connected a new service | Bot hot-reloads `TenantConfig` for that tenant: decrypts new credential, updates `UserContext.credentials` fallback map and `ToolContext` optional fields. Logs: `INFO: Tenant {id} connected {service} — credential hot-loaded.` |
| `UPDATE` (status='connected' → 'revoked') | User disconnected a service | Bot removes credential from in-memory `TenantConfig`. Clears the relevant `ToolContext` field. Logs: `INFO: Tenant {id} disconnected {service} — credential removed.` |
| `UPDATE` (status='connected' → 'expired') | Token expired / refresh failed | Bot removes credential from in-memory `TenantConfig`. Tools that used this credential will now return `ToolError`. Logs: `WARNING: Tenant {id} {service} token expired — tools disabled.` |
| `UPDATE` (status='expired' → 'connected') | User reconnected after expiry | Bot hot-reloads credential same as INSERT. Logs: `INFO: Tenant {id} {service} reconnected — credential hot-reloaded.` |

### Notes

1. **One row per service per tenant:** The `UNIQUE (tenant_id, service)` constraint means each tenant can have at most one GitHub connection, one Google connection, one Linear connection, one Toggl connection. If a tenant wants to switch their GitHub account, they must disconnect first (status='revoked'), then reconnect with the new account. On reconnect, the row is UPSERTed — the old Vault secret is deleted and a new one is created.

2. **Revoked rows persist:** Unlike deletion, revocation preserves the metadata row. This gives the admin panel visibility into which services were historically connected and when they were disconnected. The Vault secrets (actual token material) are destroyed on revocation — only non-sensitive metadata (user IDs, email addresses, workspace IDs) and audit columns persist.

3. **service_connection_status is PostgreSQL ENUM, not TEXT + CHECK:** Unlike `tenant_api_keys.status` which uses TEXT + CHECK (for easy value addition), service connections use a proper ENUM. The rationale is that service connection states are architecturally stable — 'connected', 'expired', 'revoked', 'error' cover all cases. If a new state is needed, a migration is required regardless (new handling logic would be needed anyway).

4. **Scopes array for security auditing:** The `scopes` TEXT[] column records exactly which permissions were granted at OAuth authorization time. If the required scopes change in a future version (e.g., adding Google Calendar write scope), the website can detect that an existing connection has insufficient scopes by comparing `connection.scopes` against `REQUIRED_SCOPES[service]`. If insufficient, the integrations page shows "Reconnect needed — new permissions required" rather than "Connected."

5. **metadata is server-set only:** The `metadata` column is populated by the OAuth callback API route (server-side) by calling the provider's user info endpoints. It is never user-set. RLS allows tenant members to READ metadata but the UPDATE path is controlled via the API route (not direct Supabase client calls). The `connected_by_user_id` is set server-side from the authenticated session JWT.

6. **Google token expiry and the 5-minute buffer:** The 5-minute buffer (refresh when `token_expires_at < NOW() + INTERVAL '5 minutes'`) accounts for clock skew and network latency. Google tokens expire at exactly 3600 seconds; refreshing at 3595 seconds ensures a valid token is always available for tool calls.

7. **GitHub token type:** GitHub OAuth App tokens (classic) do not expire. The `token_expires_at` will always be NULL for GitHub. If the platform later switches to GitHub Fine-Grained Personal Access Tokens (PATs) with expiry, this column already supports it. For now: GitHub = no expiry, no refresh token, `token_expires_at = NULL`, `refresh_vault_secret_id = NULL`.

8. **Linear token type:** Linear OAuth tokens do not expire. `token_expires_at = NULL`, `refresh_vault_secret_id = NULL`. Linear's API docs confirm: "Access tokens do not expire." If Linear ever changes this policy, the schema already supports it.

9. **Toggl API key rotation:** Users can rotate their Toggl API key in the Toggl settings page. If they do, the stored token becomes invalid. There is no automatic detection — the bot will encounter 403 errors on Toggl tool calls. The bot sets `status = 'error'` and `error_message = 'Toggl API key is invalid. Update your Toggl connection in the Daimon dashboard.'` The user must paste their new Toggl API key via the integrations page (same flow as initial connection).

10. **Orphan cleanup includes service_connection secrets:** The orphan cleanup query in `vault-encryption.md` section 8 must be updated to include `tenant_service_connections.vault_secret_id` and `tenant_service_connections.refresh_vault_secret_id` in the "referenced secrets" union.

---

---

## Table: `tenant_subscriptions`

**Purpose:** One row per tenant. Mirrors the tenant's Stripe subscription state, updated exclusively by the Stripe webhook handler in the Next.js API. The plan field in this table is the authoritative billing source of truth. `tenants.plan` is a denormalized cache that is kept in sync by the `sync_tenant_plan` PostgreSQL trigger on this table.

**Created by migration:** `20260400000005_create_tenant_subscriptions.sql` (to be created)

**Key invariants:**
- Every tenant has exactly one row in this table (created at sign-up, before any Stripe interaction)
- Free-tier tenants have `stripe_subscription_id = NULL` until they first start a paid subscription
- `plan = 'free'` is valid regardless of whether any Stripe subscription exists
- When Stripe subscription is canceled, plan reverts to `'free'` — never NULL
- `tenants.plan` is always equal to the `plan` column here (maintained by trigger)

```sql
CREATE TABLE public.tenant_subscriptions (
    id                          UUID                    NOT NULL DEFAULT gen_random_uuid(),
    tenant_id                   UUID                    NOT NULL,

    -- Stripe identifiers
    stripe_customer_id          TEXT                    NULL,
    stripe_subscription_id      TEXT                    NULL,
    stripe_price_id             TEXT                    NULL,

    -- Billing state
    plan                        public.tenant_plan      NOT NULL DEFAULT 'free',
    status                      public.subscription_status NOT NULL DEFAULT 'active',
    cancel_at_period_end        BOOLEAN                 NOT NULL DEFAULT FALSE,

    -- Period timestamps
    current_period_start        TIMESTAMPTZ             NULL,
    current_period_end          TIMESTAMPTZ             NULL,
    canceled_at                 TIMESTAMPTZ             NULL,
    trial_start                 TIMESTAMPTZ             NULL,
    trial_end                   TIMESTAMPTZ             NULL,

    -- Audit
    created_at                  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tenant_subscriptions_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_subscriptions_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_subscriptions_tenant_id_unique
        UNIQUE (tenant_id),
    CONSTRAINT tenant_subscriptions_stripe_subscription_id_unique
        UNIQUE (stripe_subscription_id),
    CONSTRAINT tenant_subscriptions_status_plan_consistency CHECK (
        -- If plan is 'free' and stripe_subscription_id is NULL, status must be 'active'
        -- (free tenants have no real subscription — we use 'active' as the sentinel status)
        (stripe_subscription_id IS NULL AND plan = 'free' AND status = 'active')
        OR (stripe_subscription_id IS NOT NULL)
    )
);
```

### Column Specifications

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Row identifier. Not used externally — `tenant_id` is the natural key for all lookups. |
| `tenant_id` | UUID | NOT NULL | — | FK → `tenants(id)` CASCADE, UNIQUE | The tenant this subscription belongs to. UNIQUE guarantees exactly one subscription record per tenant at all times. CASCADE delete removes this row when the tenant is deleted. |
| `stripe_customer_id` | TEXT | NULL | NULL | — | Stripe Customer ID (`cus_XXXXXXXXXXXXXXXXX`). Set when the tenant first initiates a Stripe Checkout. NULL for tenants who have never clicked "Upgrade." Note: also stored denormalized in `tenants.stripe_customer_id` for join-free access. Both columns must always be in sync — updated together by the Stripe webhook handler. |
| `stripe_subscription_id` | TEXT | NULL | NULL | UNIQUE | Stripe Subscription ID (`sub_XXXXXXXXXXXXXXXXX`). NULL for free-tier tenants who have never had a paid subscription. Set when a Checkout Session is completed and a subscription is created by Stripe. UNIQUE — one Daimon tenant maps to at most one Stripe Subscription at any time. If a tenant cancels and resubscribes, the old subscription ID is replaced with the new one. |
| `stripe_price_id` | TEXT | NULL | NULL | — | The Stripe Price ID the tenant is currently subscribed to. Format: `price_XXXXXXXXXXXXXXXXX`. NULL for free-tier. Used to determine the plan tier (cross-referenced with the price catalog) and to present the correct "Current Plan" display on the billing page. Distinct from `plan` — `plan` is the human-readable tier; `stripe_price_id` is the exact price (which can differentiate monthly vs annual billing in the future). |
| `plan` | `tenant_plan` | NOT NULL | `'free'` | ENUM ('free', 'starter', 'pro') | **Authoritative plan tier.** Updated by the Stripe webhook handler when subscriptions are created, upgraded, downgraded, or canceled. When a subscription is canceled and the period ends, the webhook handler downgrades this to `'free'`. The `sync_tenant_plan` trigger watches this column and propagates changes to `tenants.plan` automatically. A plan change without a corresponding Stripe event should never happen — application code must always go through the webhook path (or the admin "force-set-plan" API route in the admin panel). |
| `status` | `subscription_status` | NOT NULL | `'active'` | ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'paused', 'unpaid') | Mirrors `subscription.status` from Stripe. For free-tier tenants with no Stripe subscription, this is always `'active'` (sentinel value — there is no actual Stripe status). Updated by the webhook handler on every `customer.subscription.*` event. The bot and website do NOT gate access based on this status directly — they read `tenants.plan` and `tenants.status`. This column exists for the admin panel and billing page to show accurate Stripe state. |
| `cancel_at_period_end` | BOOLEAN | NOT NULL | FALSE | — | Whether the subscription is scheduled to cancel at the end of the current billing period. Mirrors `subscription.cancel_at_period_end` from Stripe. Set to `TRUE` when the user clicks "Cancel Plan" in the Stripe Customer Portal. The plan remains active until `current_period_end`. When the period ends, Stripe fires `customer.subscription.deleted` → webhook handler sets `plan = 'free'`, `stripe_subscription_id = NULL`, `cancel_at_period_end = FALSE`. The billing page shows a cancellation notice when this is `TRUE`: "Your plan will end on [current_period_end date]. You'll be moved to Free." |
| `current_period_start` | TIMESTAMPTZ | NULL | NULL | — | Start of the current billing period. Mirrors `subscription.current_period_start` from Stripe (Unix timestamp → converted to TIMESTAMPTZ). NULL for free-tier. Updated on every billing period renewal. Used by the billing page to display "Current period: Mar 1 – Apr 1." |
| `current_period_end` | TIMESTAMPTZ | NULL | NULL | — | End of the current billing period. Mirrors `subscription.current_period_end` from Stripe. NULL for free-tier. When `cancel_at_period_end = TRUE`, this is the cancellation date. The billing page shows "Your plan ends on [date]" using this column. The bot remains fully operational until `current_period_end` — plan downgrade to 'free' only happens when the period ends and Stripe fires `customer.subscription.deleted`. |
| `canceled_at` | TIMESTAMPTZ | NULL | NULL | — | When the subscription cancellation was initiated (not when it takes effect). Mirrors `subscription.canceled_at` from Stripe. Set to a non-NULL value when the user cancels (even if `cancel_at_period_end = TRUE` and the subscription is still active). NULL if the subscription has never been canceled. Used for audit trail in the admin panel. |
| `trial_start` | TIMESTAMPTZ | NULL | NULL | — | Start of the subscription trial period. Mirrors `subscription.trial_start` from Stripe. NULL if no trial was used. Stored for analytics and admin panel display. |
| `trial_end` | TIMESTAMPTZ | NULL | NULL | — | End of the subscription trial period. Mirrors `subscription.trial_end` from Stripe. NULL if no trial. When `status = 'trialing'`, the billing page shows "Trial ends on [trial_end date]." When the trial ends, Stripe fires `customer.subscription.updated` with `status = 'active'` (if payment method was added) or `status = 'past_due'` (if no payment method). |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — | Row creation time — set when the tenant signs up. NOT when the Stripe subscription is created. Every tenant has a row from day one (with `plan = 'free'` and all Stripe columns NULL). Stored in UTC. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — | Last row update time. Updated by the `tenant_subscriptions_updated_at` trigger on every UPDATE. Stored in UTC. The admin panel shows "Subscription last updated: X ago" using this column. |

### Constraint Detail

#### `UNIQUE (tenant_id)` — One Subscription Per Tenant

```sql
CONSTRAINT tenant_subscriptions_tenant_id_unique UNIQUE (tenant_id)
```

Guarantees that no tenant has more than one active subscription row. This simplifies all queries — the website can always query:
```sql
SELECT * FROM tenant_subscriptions WHERE tenant_id = :id
```
without needing to distinguish between multiple subscription rows.

**What happens on re-subscription after cancellation:** When a previously-paying tenant resubscribes (creates a new Stripe Checkout), the webhook handler for `customer.subscription.created` runs an UPSERT on this table (ON CONFLICT on `tenant_id`), updating the existing row with the new `stripe_subscription_id`, `plan`, `status`, etc. The old row is updated in place — no new row is created.

#### `UNIQUE (stripe_subscription_id)` — One Tenant Per Stripe Subscription

```sql
CONSTRAINT tenant_subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id)
```

Prevents two tenant rows from claiming the same Stripe Subscription. This is a safety constraint — the Stripe webhook handler must also enforce this. The UNIQUE constraint prevents data corruption if the webhook handler has a bug.

**NULL handling:** PostgreSQL treats NULL values as distinct for UNIQUE constraints — multiple rows with `stripe_subscription_id = NULL` are allowed. This is the correct behavior for free-tier tenants (all have `NULL`).

#### Status-Plan Consistency Check

```sql
CONSTRAINT tenant_subscriptions_status_plan_consistency CHECK (
    (stripe_subscription_id IS NULL AND plan = 'free' AND status = 'active')
    OR (stripe_subscription_id IS NOT NULL)
)
```

Enforces that tenants with no Stripe subscription are always on the free plan with `status = 'active'`. If the webhook handler attempts to set `status = 'past_due'` on a free-tier tenant (which would be a bug), this constraint rejects it.

### Indexes

```sql
-- Primary key (automatic)
-- idx_tenant_subscriptions_pkey ON tenant_subscriptions(id)

-- Unique constraint index (automatic) — covers primary lookup
-- idx_tenant_subscriptions_tenant_id_unique ON tenant_subscriptions(tenant_id)
-- Used by: every billing page load, dashboard plan display, webhook handler tenant lookup by tenant_id

-- Unique constraint index (automatic) — covers Stripe webhook lookups
-- idx_tenant_subscriptions_stripe_subscription_id_unique ON tenant_subscriptions(stripe_subscription_id)
-- Used by: Stripe webhook handler — looks up tenant by stripe_subscription_id on EVERY webhook event

-- Stripe Customer ID lookup — for Stripe webhook events that use customer ID (not subscription ID)
-- e.g., customer.deleted, customer.updated
CREATE INDEX idx_tenant_subscriptions_stripe_customer_id
    ON public.tenant_subscriptions (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

-- Admin panel: filter tenants by plan
-- SELECT * FROM tenant_subscriptions WHERE plan = 'starter' ORDER BY updated_at DESC
CREATE INDEX idx_tenant_subscriptions_plan
    ON public.tenant_subscriptions (plan);

-- Admin panel: filter by subscription status
-- SELECT * FROM tenant_subscriptions WHERE status = 'past_due'
CREATE INDEX idx_tenant_subscriptions_status
    ON public.tenant_subscriptions (status)
    WHERE status != 'active';  -- partial: non-active subscriptions need admin attention

-- Billing analytics: find subscriptions ending soon (churn prediction)
-- SELECT * FROM tenant_subscriptions
-- WHERE cancel_at_period_end = TRUE AND current_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
CREATE INDEX idx_tenant_subscriptions_cancel_at_period_end
    ON public.tenant_subscriptions (current_period_end)
    WHERE cancel_at_period_end = TRUE;
```

### Triggers

#### Trigger 1: `updated_at` Auto-Update

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

CREATE TRIGGER tenant_subscriptions_updated_at
    BEFORE UPDATE ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tenant_subscriptions_updated_at();
```

#### Trigger 2: `sync_tenant_plan` — Plan Cascade to `tenants.plan`

This is the primary cascade trigger. When `tenant_subscriptions.plan` changes, this trigger immediately propagates the new plan to `tenants.plan`. This keeps the denormalized plan cache in sync without requiring application code to update both tables.

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

CREATE TRIGGER trg_sync_tenant_plan
    AFTER INSERT OR UPDATE OF plan ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_tenant_plan();
```

**Trigger analysis:**

| Property | Value |
|----------|-------|
| Fires on | `INSERT` and `UPDATE` of the `plan` column only (not every UPDATE) |
| Fires when | `OLD.plan IS DISTINCT FROM NEW.plan` (skips no-op updates) |
| Target | `public.tenants.plan` for the matching `tenant_id` |
| SECURITY DEFINER | Yes — ensures the trigger can UPDATE `tenants` even if the calling role cannot |
| Performance | Fires at most once per Stripe webhook event — negligible overhead |
| Ordering | `AFTER` trigger — fires after the `tenant_subscriptions` row is written, so the row is committed before `tenants` is updated |

**Why denormalize `tenants.plan` at all?** The bot reads `tenants.plan` at startup and via Realtime events to gate tool access. If `tenants.plan` did not exist and the bot had to JOIN `tenant_subscriptions` on every tool call, it would add one extra query per Discord message. With the denormalized column and the Realtime subscription on `tenants`, the bot receives instant plan change notifications via the existing channel.

#### Trigger 3: `suspend_tenant_on_unpaid` — Suspend on Payment Failure

When a Stripe subscription becomes `'unpaid'` (all payment retries exhausted after ~30 days of `'past_due'`), the tenant should be suspended. This trigger enforces that rule at the database level.

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

CREATE TRIGGER trg_suspend_tenant_on_unpaid
    AFTER UPDATE OF status ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.suspend_tenant_on_unpaid();
```

**Important notes on the suspension trigger:**

1. **`past_due` does NOT suspend.** Only `unpaid` triggers suspension. During `past_due`, Stripe retries payment automatically for ~15–28 days (configurable in Stripe Dashboard → Settings → Billing → Retry schedule). The bot continues operating during this grace period. The billing page shows a payment failure banner.

2. **`unpaid` → suspension is irreversible until payment recovers.** When Stripe gives up retrying (sends `customer.subscription.updated` with `status = 'unpaid'`), the trigger suspends the tenant. The bot detects the `tenants.status = 'suspended'` change via Realtime and disconnects.

3. **Recovery path:** When payment eventually recovers (Stripe fires `customer.subscription.updated` with `status = 'active'`), the webhook handler updates `tenant_subscriptions.status` to `'active'`. The trigger then sets `tenants.status = 'configured'` — NOT `'active'`. The bot must reconnect after suspension. On next startup scan (or Realtime event on `discord_connections`), the bot picks up the tenant again and sets `tenants.status = 'active'`.

4. **Manual admin unsuspension** is also supported — admin panel has a "Unsuspend" button that directly updates `tenants.status = 'configured'`. This is separate from the payment recovery path and does not require any Stripe interaction.

### RLS Policies

```sql
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tenant owners and admins can SELECT their own subscription
CREATE POLICY "Tenant members can read own subscription"
    ON public.tenant_subscriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_subscriptions.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- No direct INSERT/UPDATE/DELETE from JWT users
-- All writes go through the Stripe webhook handler (service role)
-- and the admin panel (service role)
-- RLS blocks any direct writes from browser sessions
```

**Why no INSERT/UPDATE/DELETE policies:**

| Operation | Who Does It | Why Blocked for JWT |
|-----------|-------------|---------------------|
| INSERT | Next.js API route on tenant signup (service role) | Tenant creation must happen in a single transaction — uses service role |
| UPDATE | Stripe webhook handler (service role) | Must be trusted server-side — cannot allow clients to self-upgrade their plan |
| DELETE | Never — CASCADE from `tenants` deletion only | Rows are never deleted except via tenant deletion |

**Bot access:** The bot does NOT read `tenant_subscriptions` directly. It reads `tenants.plan` (denormalized cache) which is kept in sync by the `sync_tenant_plan` trigger. Service role bypasses RLS regardless.

### Stripe Webhook → Subscription State Machine

The following table documents every Stripe webhook event that can affect `tenant_subscriptions`. The Next.js webhook handler (`/api/webhooks/stripe`) must handle all of these.

#### Webhook Events and Required Actions

| Stripe Event | When It Fires | Required DB Update | Tenant Impact |
|-------------|--------------|-------------------|---------------|
| `checkout.session.completed` | User completes Checkout flow | Create Stripe Customer if not existing; UPSERT `tenant_subscriptions` with new `stripe_subscription_id`, `plan`, `status = 'active'`, `current_period_start`, `current_period_end`; UPDATE `tenants.stripe_customer_id` | Plan upgrades immediately (trigger updates `tenants.plan`) |
| `customer.subscription.created` | New subscription created in Stripe | UPSERT `tenant_subscriptions` — same fields as checkout.session.completed. May fire alongside checkout.session.completed or independently (e.g., subscription created via API) | Plan active |
| `customer.subscription.updated` | Subscription upgraded, downgraded, trial ended, payment recovered, or period renewed | UPDATE `tenant_subscriptions` SET `plan`, `status`, `stripe_price_id`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `trial_start`, `trial_end` from the event payload | Plan may change; trigger syncs `tenants.plan` |
| `customer.subscription.deleted` | Subscription canceled and period ended (or immediately canceled) | UPDATE `tenant_subscriptions` SET `plan = 'free'`, `status = 'canceled'`, `stripe_subscription_id = NULL`, `stripe_price_id = NULL`, `current_period_start = NULL`, `current_period_end = NULL`, `cancel_at_period_end = FALSE` | Downgraded to free tier; trigger updates `tenants.plan = 'free'` |
| `invoice.payment_failed` | A subscription payment fails | UPDATE `tenant_subscriptions` SET `status = 'past_due'`. Do NOT change `plan` — tenant retains access during grace period | Bot continues operating; billing page shows payment failure banner |
| `invoice.payment_succeeded` | A subscription payment succeeds (including after past_due recovery) | UPDATE `tenant_subscriptions` SET `status = 'active'`, `current_period_start`, `current_period_end` from the invoice's subscription period | Status normalized; if was 'past_due', bot may have still been running (no action needed) |
| `customer.subscription.trial_will_end` | 3 days before trial ends | No DB update required. Log the event. Optionally send an in-app notification (out of scope for v1) | No DB change |
| `invoice.upcoming` | Upcoming invoice generated | No DB update required. Log only. | No DB change |

#### Stripe Status → Daimon Status Mapping

| Stripe `subscription.status` | Daimon `subscription_status` | Daimon plan behavior | Bot behavior |
|------------------------------|-------------------------------|----------------------|-------------|
| `trialing` | `trialing` | Plan = the trial plan (starter/pro) | Bot operates with trial plan features |
| `active` | `active` | Plan = subscribed tier | Bot operates normally |
| `past_due` | `past_due` | Plan = subscribed tier (no change) | Bot keeps operating (grace period) |
| `unpaid` | `unpaid` | Plan = subscribed tier (no change immediately; webhook handler may downgrade) | Trigger suspends tenant; bot disconnects |
| `canceled` | `canceled` | Plan = 'free' (set by webhook handler on `customer.subscription.deleted`) | Bot continues on free tier |
| `incomplete` | `incomplete` | Plan = 'free' (subscription not yet active) | Bot operates on free tier |
| `incomplete_expired` | `incomplete_expired` | Plan = 'free' | Bot operates on free tier |
| `paused` | `paused` | Plan = subscribed tier (access decision is a product choice) | Bot behavior TBD (treat as suspended at v1) |

#### Webhook Handler: `customer.subscription.updated` (Most Common Event)

This event fires on any change to a subscription. The handler must:

```typescript
// In: /api/webhooks/stripe
// Event: customer.subscription.updated

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // 1. Look up tenant by stripe_customer_id
    const { data: tenantSub } = await supabase
        .from('tenant_subscriptions')
        .select('tenant_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single()

    if (!tenantSub) {
        console.error(`No tenant found for Stripe customer: ${subscription.customer}`)
        return  // Log and return 200 (Stripe will retry on non-200)
    }

    // 2. Determine the plan from the price ID
    const priceId = subscription.items.data[0]?.price.id
    const plan = STRIPE_PRICE_TO_PLAN[priceId] ?? 'free'
    // STRIPE_PRICE_TO_PLAN is defined in /lib/stripe-config.ts:
    // { 'price_starter_monthly': 'starter', 'price_starter_annual': 'starter',
    //   'price_pro_monthly': 'pro', 'price_pro_annual': 'pro' }

    // 3. Update tenant_subscriptions
    const { error } = await supabase
        .from('tenant_subscriptions')
        .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId ?? null,
            plan: plan,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end:   new Date(subscription.current_period_end * 1000).toISOString(),
            canceled_at:    subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
            trial_start:    subscription.trial_start
                ? new Date(subscription.trial_start * 1000).toISOString()
                : null,
            trial_end:      subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            updated_at: new Date().toISOString(),
        })
        .eq('tenant_id', tenantSub.tenant_id)

    if (error) {
        console.error(`Failed to update tenant_subscriptions for ${tenantSub.tenant_id}:`, error)
        throw error  // Return 500 → Stripe retries
    }

    // 4. The sync_tenant_plan trigger automatically updates tenants.plan
    // 5. The suspend_tenant_on_unpaid trigger automatically suspends if status = 'unpaid'
    // No further application code needed for plan sync or suspension
}
```

#### Webhook Handler: `checkout.session.completed`

```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    // Retrieve the full subscription from Stripe (session only has ID)
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // The tenant_id is stored in the Checkout Session metadata when the session is created
    const tenantId = session.metadata?.tenant_id
    if (!tenantId) {
        console.error('checkout.session.completed missing tenant_id metadata')
        return
    }

    const priceId = subscription.items.data[0]?.price.id
    const plan = STRIPE_PRICE_TO_PLAN[priceId] ?? 'free'

    // UPSERT tenant_subscriptions (tenant row already exists with plan='free')
    const { error } = await supabase
        .from('tenant_subscriptions')
        .update({
            stripe_customer_id:     session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id:        priceId ?? null,
            plan:                   plan,
            status:                 subscription.status,
            cancel_at_period_end:   subscription.cancel_at_period_end,
            current_period_start:   new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end:     new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start:            subscription.trial_start
                ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end:              subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at:             new Date().toISOString(),
        })
        .eq('tenant_id', tenantId)

    if (error) throw error

    // Also update tenants.stripe_customer_id (denormalized)
    await supabase
        .from('tenants')
        .update({
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
        })
        .eq('id', tenantId)

    // sync_tenant_plan trigger fires automatically — tenants.plan updated
}
```

#### Webhook Handler: `customer.subscription.deleted`

```typescript
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Look up by subscription ID (not customer ID)
    const { data: tenantSub } = await supabase
        .from('tenant_subscriptions')
        .select('tenant_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

    if (!tenantSub) return

    // Downgrade to free — clear all Stripe subscription data
    await supabase
        .from('tenant_subscriptions')
        .update({
            stripe_subscription_id: null,
            stripe_price_id:        null,
            plan:                   'free',
            status:                 'active',  // free tier sentinel status
            cancel_at_period_end:   false,
            current_period_start:   null,
            current_period_end:     null,
            canceled_at:            subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trial_start:            null,
            trial_end:              null,
            updated_at:             new Date().toISOString(),
        })
        .eq('tenant_id', tenantSub.tenant_id)

    // sync_tenant_plan trigger fires → tenants.plan = 'free'
    // Bot adapts on next Realtime notification: plan-gated features disabled
}
```

### Row Creation at Tenant Signup

Every tenant gets a `tenant_subscriptions` row at signup (before any Stripe interaction). This happens in the same transaction as tenant + tenant_members creation:

```typescript
// In: /api/auth/signup or the post-signup callback
// After creating tenants + tenant_members rows:

await supabase
    .from('tenant_subscriptions')
    .insert({
        tenant_id:              newTenantId,
        stripe_customer_id:     null,
        stripe_subscription_id: null,
        stripe_price_id:        null,
        plan:                   'free',
        status:                 'active',
        cancel_at_period_end:   false,
    })
```

**Why insert at signup (not lazily on first Stripe event)?** The billing page and dashboard must always be able to query `SELECT * FROM tenant_subscriptions WHERE tenant_id = $id` and get a row. If the row didn't exist for free-tier tenants, every billing page would need a `LEFT JOIN` or a NULL check. Pre-creating the row with `plan = 'free'` simplifies all downstream queries.

### Billing Page Display Logic

The billing page reads `tenant_subscriptions` to render the current plan UI:

```typescript
// Billing page server component
const { data: sub } = await supabase
    .from('tenant_subscriptions')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

// Determine what to show:
const isFree    = sub.plan === 'free'
const isPastDue = sub.status === 'past_due'
const isUnpaid  = sub.status === 'unpaid'
const willCancel = sub.cancel_at_period_end === true
const isTrialing = sub.status === 'trialing'

// Banner logic (in order of priority):
// 1. Payment failed banner (red): isPastDue || isUnpaid
// 2. Cancellation notice (yellow): willCancel
// 3. Trial notice (blue): isTrialing
// 4. No banner: isFree or normal active subscription
```

### Notes

1. **`tenants.stripe_customer_id` vs `tenant_subscriptions.stripe_customer_id`:** Both columns store the same value. `tenants.stripe_customer_id` exists for join-free lookups (e.g., "which tenant owns this Stripe Customer?"). `tenant_subscriptions.stripe_customer_id` exists for webhook handler lookups (incoming webhook has customer ID, must find subscription row). Both must be updated together. The webhook handler updates both in the `checkout.session.completed` handler.

2. **Subscription history:** This table has only one row per tenant — it is not a history table. When a tenant upgrades from starter to pro, the row is updated in place. If subscription history is needed in the future (e.g., analytics on churn), add a `tenant_subscription_events` table as an append-only log. Not included at v1.

3. **Re-subscription with same Stripe Customer:** If a tenant cancels, gets downgraded to free (`stripe_subscription_id = NULL`), and then resubscribes, Stripe creates a new Subscription but reuses the existing Customer (same `stripe_customer_id`). The webhook handler for `checkout.session.completed` UPSERTs the `tenant_subscriptions` row using `tenant_id` as the conflict target, restoring all Stripe subscription fields.

4. **Testing with Stripe test mode:** Use Stripe CLI `stripe trigger customer.subscription.updated` to test webhook handlers locally. All test events use `cus_test_*` and `sub_test_*` IDs. The test price IDs must be configured in `STRIPE_PRICE_TO_PLAN` map in `/lib/stripe-config.ts` alongside production IDs.

5. **Idempotency:** Stripe may deliver webhooks more than once. All webhook handlers must be idempotent. Using the `tenant_id` as the UPDATE target (not INSERT) achieves this — re-processing a `customer.subscription.updated` event for the same state overwrites with the same values, producing no net change.

6. **Webhook signature verification:** Every incoming request to `/api/webhooks/stripe` must be verified using `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)`. If signature fails, return 400 immediately. See [integrations/stripe.md](../integrations/stripe.md) for the complete webhook handler spec.

7. **Stripe Customer Portal for cancellation and plan changes:** The Stripe Customer Portal (launched via `/api/billing/create-portal-session`) handles plan upgrades, downgrades, and cancellations directly. The portal redirects users back to Daimon after changes. All changes are communicated to Daimon via webhooks — the portal does NOT write to Daimon's database directly.

---

## Table: `admin_audit_log`

**Purpose:** Append-only log of all admin actions taken in the admin panel, including impersonation sessions, tenant suspension/unsuspension, plan overrides, and other administrative changes. This table is not tenant-scoped — it is admin-scoped. All rows are accessible only to Supabase admin users (no RLS for regular tenants).

**Created by migration:** `20260400000006_create_admin_audit_log.sql` (to be created)

**Design principle:** Append-only. Rows are never updated or deleted. This is a forensic log.

```sql
CREATE TABLE public.admin_audit_log (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    admin_user_id   UUID        NOT NULL,
    action          TEXT        NOT NULL,
    tenant_id       UUID        NULL,
    target_user_id  UUID        NULL,
    metadata        JSONB       NOT NULL DEFAULT '{}',
    ip_address      TEXT        NULL,
    user_agent      TEXT        NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT admin_audit_log_admin_user_id_fkey
        FOREIGN KEY (admin_user_id)
        REFERENCES auth.users(id) ON DELETE RESTRICT,
    -- Note: tenant_id is intentionally NOT a FK to tenants(id)
    -- because audit log rows should persist even after the tenant is deleted
    CONSTRAINT admin_audit_log_action_check
        CHECK (action IN (
            'tenant_suspended',
            'tenant_unsuspended',
            'tenant_plan_override',
            'impersonation_started',
            'impersonation_ended',
            'tenant_deleted_by_admin',
            'api_key_revoked_by_admin',
            'discord_connection_reset',
            'subscription_override',
            'user_banned'
        ))
);
```

### Column Specifications

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Unique log entry identifier. |
| `admin_user_id` | UUID | NOT NULL | — | FK → `auth.users(id)` ON DELETE RESTRICT | The admin who took the action. ON DELETE RESTRICT — cannot delete an admin user who has audit log entries (preserves attribution). |
| `action` | TEXT | NOT NULL | — | CHECK: IN (action list) | Machine-readable action type. New action types require a migration to add them to the CHECK constraint. |
| `tenant_id` | UUID | NULL | NULL | — | The tenant affected, if applicable. NULL for user-level actions (e.g., `user_banned`). **Intentionally not a FK** — audit entries must persist even if the tenant is later deleted. |
| `target_user_id` | UUID | NULL | NULL | — | The Supabase Auth user affected, if applicable (e.g., the tenant owner during impersonation). NULL for tenant-level-only actions. Not a FK for same reason as `tenant_id`. |
| `metadata` | JSONB | NOT NULL | `'{}'` | — | Action-specific structured data. See per-action metadata schemas below. |
| `ip_address` | TEXT | NULL | NULL | — | IP address of the admin at time of action. Extracted from the HTTP request by the Next.js API route. May be NULL for server-side admin actions. |
| `user_agent` | TEXT | NULL | NULL | — | Browser user agent string. May be NULL. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — | When the action occurred. Stored in UTC. Never updated. |

### Per-Action Metadata Schemas

#### `action = 'tenant_suspended'`

```json
{
  "reason": "manual_admin_action",
  "previous_status": "active",
  "note": "Optional admin-entered note explaining the suspension"
}
```

#### `action = 'tenant_unsuspended'`

```json
{
  "previous_status": "suspended",
  "note": "Optional admin-entered note"
}
```

#### `action = 'tenant_plan_override'`

```json
{
  "previous_plan": "free",
  "new_plan": "pro",
  "reason": "customer_support_courtesy_upgrade",
  "note": "Optional admin note"
}
```

#### `action = 'impersonation_started'`

```json
{
  "impersonation_session_id": "a1b2c3d4-...",
  "target_tenant_id": "b2c3d4e5-...",
  "target_user_id": "c3d4e5f6-..."
}
```

#### `action = 'impersonation_ended'`

```json
{
  "impersonation_session_id": "a1b2c3d4-...",
  "duration_seconds": 120
}
```

#### `action = 'api_key_revoked_by_admin'`

```json
{
  "key_type": "anthropic",
  "key_hint": "sk-ant-a...b12c",
  "reason": "Optional admin-entered reason"
}
```

#### `action = 'discord_connection_reset'`

```json
{
  "connection_id": "a1b2c3...",
  "guild_id": "813258688680919040",
  "previous_status": "error",
  "new_status": "pending"
}
```

#### `action = 'subscription_override'`

```json
{
  "previous_stripe_subscription_id": "sub_xxx",
  "action_taken": "force_free",
  "reason": "chargeback_fraud_protection"
}
```

#### `action = 'user_banned'`

```json
{
  "user_email": "user@example.com",
  "reason": "tos_violation"
}
```

### Indexes

```sql
-- Primary key (automatic)

-- Admin panel: recent actions by admin user
CREATE INDEX idx_admin_audit_log_admin_user_id
    ON public.admin_audit_log (admin_user_id, created_at DESC);

-- Admin panel: all actions affecting a tenant
CREATE INDEX idx_admin_audit_log_tenant_id
    ON public.admin_audit_log (tenant_id, created_at DESC)
    WHERE tenant_id IS NOT NULL;

-- Admin panel: filter by action type
CREATE INDEX idx_admin_audit_log_action
    ON public.admin_audit_log (action, created_at DESC);
```

### RLS Policies

```sql
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin users can read the audit log
-- Admin check: a separate 'admin_users' table or a role claim in JWT metadata
-- At v1: admin_user_id must be in the list of known admin UUIDs in app config
-- No INSERT/UPDATE/DELETE via RLS — all writes via service role (Next.js admin API routes)

-- No RLS policy for SELECT from regular tenants — they cannot read this table
-- SELECT is blocked by default when RLS is enabled and no policy exists
-- Admin panel uses service role → bypasses RLS
```

**Access pattern:** The admin panel uses the Supabase service role key (via a server-side Next.js server component or API route protected by an admin middleware check). Regular tenant users cannot access this table at all — RLS blocks all access by default (no tenant SELECT policy exists).

### Notes

1. **Append-only by design:** No UPDATE or DELETE is permitted. The CHECK constraint on `action` prevents arbitrary strings. If new admin actions are added, a migration must update the CHECK constraint — which creates a natural forcing function for documenting new admin capabilities.

2. **No FK on `tenant_id`:** Admin actions on a tenant should be retained even after the tenant deletes their account. A FK with ON DELETE CASCADE would destroy the audit history. The `tenant_id` is preserved as a UUID reference even after the tenant row is deleted.

3. **Impersonation session lifecycle:** When an admin clicks "Impersonate" on a tenant:
   - Server inserts `admin_audit_log` row with `action = 'impersonation_started'`, capturing `impersonation_session_id` (a new UUID generated server-side), `target_tenant_id`, and `target_user_id`.
   - Server generates a scoped Supabase Auth token for the target tenant (using `supabase.auth.admin.generateLink()` or a custom JWT claim approach — specified in `api/routes.md`).
   - Admin is redirected to `/dashboard` with that scoped session — reads tenant data but cannot write (enforced at API route level, not database).
   - When impersonation ends (admin navigates away or clicks "End Impersonation"), server inserts `action = 'impersonation_ended'` row.

4. **Retention:** Audit log rows are never deleted in v1. As the platform scales, add a retention job to archive rows older than 2 years to cold storage (out of scope at launch).

---

## Table: `discord_connections`

**Purpose:** One row per Discord bot connection per tenant. Stores the Discord bot token (encrypted via Vault) and the guild ID. Tracks real-time connection state written by the bot. Supports multiple connections per tenant (free: 1, starter: 3, pro: unlimited) — limit enforced at API route level, not database constraint.

**Created by migration:** `20260400000002_create_discord_connections.sql` (to be created)

```sql
CREATE TABLE public.discord_connections (
    id                  UUID                        NOT NULL DEFAULT gen_random_uuid(),
    tenant_id           UUID                        NOT NULL,
    guild_id            TEXT                        NOT NULL,
    vault_secret_id     UUID                        NOT NULL,
    status              discord_connection_status   NOT NULL DEFAULT 'pending',
    last_heartbeat      TIMESTAMPTZ                 NULL,
    error_message       TEXT                        NULL,
    bot_user_id         TEXT                        NULL,
    bot_username        TEXT                        NULL,
    created_at          TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),

    CONSTRAINT discord_connections_pkey PRIMARY KEY (id),
    CONSTRAINT discord_connections_tenant_id_fkey FOREIGN KEY (tenant_id)
        REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT discord_connections_tenant_guild_key UNIQUE (tenant_id, guild_id),
    CONSTRAINT discord_connections_guild_id_format CHECK (
        guild_id ~ '^[0-9]{17,20}$'
    ),
    CONSTRAINT discord_connections_error_message_length CHECK (
        error_message IS NULL OR char_length(error_message) <= 500
    ),
    CONSTRAINT discord_connections_bot_user_id_format CHECK (
        bot_user_id IS NULL OR bot_user_id ~ '^[0-9]{17,20}$'
    ),
    CONSTRAINT discord_connections_bot_username_length CHECK (
        bot_username IS NULL OR char_length(bot_username) <= 100
    )
);
```

### Column Reference

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Unique identifier for this connection record. Generated by PostgreSQL. Referenced as `discord_connection_id` in bot code (heartbeat writes, status updates). |
| `tenant_id` | `UUID` | NOT NULL | — | FOREIGN KEY → `tenants(id)` ON DELETE CASCADE | The tenant this connection belongs to. CASCADE delete — when a tenant is deleted, all connection records are deleted automatically. |
| `guild_id` | `TEXT` | NOT NULL | — | UNIQUE with `tenant_id`; CHECK: `~ '^[0-9]{17,20}$'` | Discord Guild (Server) ID. Discord IDs are 17–20 digit snowflakes. The CHECK constraint validates the format client-side before storage. Combined with `tenant_id` in a UNIQUE constraint to prevent a tenant from creating two connections to the same guild. One guild cannot appear twice under the same tenant. |
| `vault_secret_id` | `UUID` | NOT NULL | — | FOREIGN KEY (logical only — Vault is a separate schema) | The UUID of the secret record in `vault.secrets` that contains the encrypted Discord bot token. Set when the user saves their bot token. Updated when the user replaces their token. **Never null after row creation** — the bot token is stored in Vault before the row is inserted. |
| `status` | `discord_connection_status` | NOT NULL | `'pending'` | ENUM ('pending', 'connecting', 'connected', 'disconnected', 'error', 'suspended') | Current connection lifecycle state. `pending` = row created, bot not yet aware. `connecting` = bot attempting WebSocket handshake. `connected` = bot online, heartbeating. `disconnected` = cleanly offline (user action or graceful restart). `error` = non-transient failure, `error_message` populated. `suspended` = account suspended, connection will not retry. Written by: website sets `pending` on INSERT, `disconnected` on user-initiated disconnect; bot writes all other transitions. |
| `last_heartbeat` | `TIMESTAMPTZ` | NULL | NULL | — | Timestamp of the most recent heartbeat written by the bot. Written every 30 seconds while `status = 'connected'`. NULL until the first heartbeat after connection. Used by the frontend to compute `effective_status`: if `status = 'connected'` AND `last_heartbeat < NOW() - INTERVAL '120 seconds'`, the displayed status is `'stale'`. |
| `error_message` | `TEXT` | NULL | NULL | CHECK: length ≤ 500 | Human-readable error description. Set when `status = 'error'`. Cleared (set to NULL) when status transitions to `connecting` or `connected`. Displayed in the dashboard and settings page as an actionable error message. Maximum 500 characters enforced by DB constraint. Examples: "Invalid bot token: ...", "Bot is missing required intents. ...", "Connection failed after 10 attempts. Last error: ...". |
| `bot_user_id` | `TEXT` | NULL | NULL | CHECK: `~ '^[0-9]{17,20}$'` if not NULL | Discord User ID of the bot account (resolved from `client.user.id` in `on_ready`). Format: 17–20 digit snowflake string. NULL until first successful connection. Used for display in dashboard ("Connected as Bot#1234"). |
| `bot_username` | `TEXT` | NULL | NULL | CHECK: length ≤ 100 if not NULL | Display name of the bot account (resolved from `client.user.name` + discriminator). Format: `"BotName"` for new-style Discord usernames (discriminator = "0"), or `"BotName#1234"` for legacy usernames. NULL until first successful connection. Maximum 100 characters. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Row creation timestamp. Set once at INSERT (when user saves their bot token). Never updated. Stored in UTC. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Last modification timestamp. Updated by the `discord_connections_updated_at` trigger on every UPDATE. Written frequently (every heartbeat = every 30 seconds per active tenant). Stored in UTC. |

### Unique Constraint Detail

```sql
CONSTRAINT discord_connections_tenant_guild_key UNIQUE (tenant_id, guild_id)
```

**Purpose:** Prevents a tenant from creating two connection records pointing to the same Discord server. If a user accidentally saves their guild ID twice, the second INSERT raises a `23505 unique_violation` error. The API route catches this and returns HTTP 409 with message: "A connection to this Discord server already exists. Update the existing connection instead."

**Intentional gap:** There is NO unique constraint on `(guild_id)` alone — two different tenants can theoretically use bots that are both in the same Discord server. This is valid (each tenant has a different bot token / bot application). Two bots coexisting in one server is normal Discord behavior.

### Indexes

```sql
-- Primary key index (automatic)
-- idx_discord_connections_pkey ON discord_connections(id)

-- Query: Dashboard loads connections for a tenant
-- Used by: GET /api/discord-connections, dashboard data fetch
CREATE INDEX idx_discord_connections_tenant_id
    ON public.discord_connections(tenant_id);

-- Query: Bot startup — load all active connections
-- Used by: TenantConnectionManager.start_all() JOIN query
-- (tenant_id already indexed above; covering index on status for filter)
CREATE INDEX idx_discord_connections_tenant_status
    ON public.discord_connections(tenant_id, status);

-- Query: Bot startup — filter by status != 'disconnected'
-- Partial index covering common bot startup filter
CREATE INDEX idx_discord_connections_active
    ON public.discord_connections(status)
    WHERE status NOT IN ('disconnected', 'suspended');

-- Query: Stale detection — dashboard computes effective_status via last_heartbeat age
-- Used by: Dashboard SELECT with CASE WHEN last_heartbeat < NOW() - INTERVAL '120s'
CREATE INDEX idx_discord_connections_last_heartbeat
    ON public.discord_connections(tenant_id, last_heartbeat)
    WHERE status = 'connected';
```

### Triggers

```sql
-- Auto-update updated_at on every modification
-- (Runs on every heartbeat write — every 30 seconds per active tenant)
CREATE TRIGGER discord_connections_updated_at
    BEFORE UPDATE ON public.discord_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

**Performance note on the heartbeat trigger:** The `updated_at` trigger fires every 30 seconds per connected tenant. At 500 tenants, this is ~16 trigger executions per second. `update_updated_at_column()` is a trivial PL/pgSQL function (`NEW.updated_at = NOW(); RETURN NEW;`) — this volume is well within PostgreSQL's capability.

### Supabase Realtime Configuration

This table is the primary Realtime trigger table for the bot's `tenant-lifecycle` channel. Realtime must be enabled on this table for the bot to receive INSERT and UPDATE events.

```sql
-- Enable Realtime for this table
-- In Supabase dashboard: Database → Replication → Tables → enable discord_connections
-- OR via SQL (Supabase-specific):
ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_connections;
```

**Events consumed by the bot:**

| Event | Trigger Condition | Bot Action |
|-------|-------------------|------------|
| `INSERT` | New row created (user saves bot token) | `_on_connection_inserted()` — start new tenant connection |
| `UPDATE` (status → `disconnected`) | User clicked "Disconnect" or admin disconnected | `_on_connection_updated()` → `remove_tenant()` |
| `UPDATE` (vault_secret_id changed) | User updated their bot token | `_on_connection_updated()` → `reconnect_tenant()` |

**Events the bot does NOT react to:**
- Its own heartbeat writes (`UPDATE` setting `last_heartbeat`) — the payload's `old.vault_secret_id == new.vault_secret_id` and `new.status != 'disconnected'`, so `_on_connection_updated()` takes the "no action needed" branch.

### RLS

RLS is enabled on this table. Website users (Supabase Auth JWT) can only read/write connection records for tenants they are a member of.

```sql
ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;
```

Full RLS policy SQL is in [rls-policies.md](./rls-policies.md#discord_connections).

**Summary of policies:**

| Policy Name | Operation | Who Can Execute | Condition |
|-------------|-----------|-----------------|-----------|
| `discord_connections_select` | SELECT | Authenticated users | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())` |
| `discord_connections_insert` | INSERT | Authenticated users (owner/admin) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))` |
| `discord_connections_update_user` | UPDATE | Authenticated users (owner/admin) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))` AND columns: only `guild_id`, `vault_secret_id`, `status` (user cannot write `bot_user_id`, `bot_username`, `last_heartbeat`, `error_message` — those are bot-only columns) |
| `discord_connections_delete` | DELETE | Authenticated users (owner/admin) | `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))` |
| `discord_connections_bot_update` | UPDATE | Service role only (bot uses service role key) | Bypasses RLS — service role is not subject to RLS policies. Bot writes `status`, `last_heartbeat`, `error_message`, `bot_user_id`, `bot_username` using the service role Supabase client. |

**Column-level update restriction detail:** Standard PostgreSQL RLS `USING` and `WITH CHECK` clauses cannot restrict which columns a user updates (that requires column-level privileges). The restriction is enforced at the **API route level**: the `PATCH /api/discord-connections/:id` route only accepts `guild_id` and `vault_secret_id` fields in the request body. The `bot_user_id`, `bot_username`, `last_heartbeat`, `error_message`, and `status` fields are only written by the bot (service role) or by specific route logic (status → 'disconnected' on user disconnect action).

### Connection Lifecycle: Full State Machine

```
User submits bot token + guild ID on website
  ↓
Website API route:
  1. Store bot token in Vault → get vault_secret_id
  2. INSERT discord_connections (tenant_id, guild_id, vault_secret_id, status='pending')
  3. Return {id, status='pending'} to frontend
  ↓
Supabase Realtime fires INSERT event to bot
  ↓
Bot: _on_connection_inserted()
  - Look up tenant_api_keys for Anthropic key vault_id
  - If no Anthropic key: UPDATE status='error', error_message="No Anthropic API key..."
  - If Anthropic key found: add_tenant(config)
  ↓
Bot: add_tenant()
  - Decrypt discord token from Vault
  - Decrypt Anthropic key from Vault
  - Construct TenantToolContext
  - UPDATE status='connecting'
  - Create discord.Client + asyncio.create_task(tenant_supervisor)
  ↓
Bot: tenant_supervisor()
  - await client.start(discord_token)
  - On on_ready: UPDATE status='connected', bot_user_id=..., bot_username=...
  - Start heartbeat_loop (writes last_heartbeat every 30s)
  ↓
[Connection is live — heartbeats flowing]
  ↓
User navigates to Settings → clicks "Disconnect"
  ↓
Website: UPDATE discord_connections SET status='disconnected' WHERE id=:id
  ↓
Realtime fires UPDATE event to bot
  ↓
Bot: _on_connection_updated() → remove_tenant()
  - client.close() — closes Discord WebSocket
  - Cancel supervisor task and heartbeat task
  - (status was already set to 'disconnected' by website)
```

### Notes

1. **Vault foreign key:** `vault_secret_id` is a UUID referencing `vault.secrets.id`. There is no formal PostgreSQL FOREIGN KEY constraint to `vault.secrets` because the `vault` schema is managed by Supabase internally and the application should not create FK constraints across schemas. Referential integrity is maintained by application logic: the website API route inserts into Vault first, gets the secret UUID, then inserts the `discord_connections` row. If the Vault insert fails, the `discord_connections` INSERT never runs.

2. **Multiple connections per tenant:** The table is designed to support multiple rows per `tenant_id` (one per guild). The free-tier limit of 1 connection is enforced in the API route `POST /api/discord-connections`:
   ```
   SELECT COUNT(*) FROM discord_connections WHERE tenant_id = :tenant_id
   AND status != 'disconnected'
   ```
   If count ≥ plan limit, return HTTP 403: "Your plan allows 1 Discord connection. Upgrade to Starter for up to 3 connections."
   Plan limits: free=1, starter=3, pro=unlimited (no check).

3. **Status 'pending' vs 'connecting':** `pending` = website set the row, bot has not yet processed it. `connecting` = bot received the INSERT event and is actively attempting Discord WebSocket. The transition pending→connecting may take up to a few seconds (Realtime latency). The dashboard shows a spinner for both `pending` and `connecting`.

4. **Why `vault_secret_id` is NOT NULL even though the token could be replaced:** When a user updates their bot token, the website: (a) creates a NEW Vault secret with the new token, (b) UPDATEs `discord_connections.vault_secret_id` to the new UUID, (c) deletes the old Vault secret. This means `vault_secret_id` is always a valid reference. The old secret is deleted only after the UPDATE commits.

5. **Bot identity persists across reconnects:** `bot_user_id` and `bot_username` are NOT cleared when the connection goes to `connecting` or `error`. They persist from the last successful connection. This lets the dashboard show "Previously connected as BotName" even when the bot is in `error` state.

6. **Admin suspension flow:** When an admin suspends a tenant via the admin panel, the API route updates `tenants.status = 'suspended'`. The bot's `tenant-status` Realtime channel (`tenants` table UPDATE) fires, and the bot calls `remove_tenant()`. The bot also updates `discord_connections.status = 'suspended'` (not 'disconnected') to distinguish admin-initiated suspension from user-initiated disconnect. Status 'suspended' does NOT trigger reconnection in the bot supervisor.

7. **Guild ID validation:** Discord guild IDs are numeric snowflakes, 17–20 digits. The CHECK constraint `guild_id ~ '^[0-9]{17,20}$'` rejects non-numeric or too-short/too-long values. The API route validates this before INSERT; the DB constraint is a defense-in-depth backstop. UI validation message: "Discord Server ID must be a 17–20 digit number."

8. **Bot reads this table:** Bot startup query joins `discord_connections` with `tenants` and `tenant_api_keys`. See §10 of [connection-manager.md](../multi-tenant/connection-manager.md) for the full startup SQL query.

---

## Table: `stripe_webhook_events`

**Purpose:** Idempotency store for Stripe webhook events. Stripe's delivery guarantee is "at-least-once" — the same event may arrive two or more times within seconds. This table prevents the webhook handler from processing the same event twice by inserting the Stripe event ID before processing and checking for conflicts. If the INSERT hits the `UNIQUE` constraint, the event was already processed and the handler returns `HTTP 200` immediately without re-running business logic.

**Created by migration:** `20260400000007_create_stripe_webhook_events.sql`

**Key invariants:**
- One row per `stripe_event_id` (e.g., `evt_1OmWJFKZ2eZvKYlo2TtN7C2Y`)
- Rows are INSERT-only: never updated after creation
- Retention: rows older than 90 days are eligible for deletion (a nightly cleanup job handles this)
- Service role access only — no JWT user can read or write this table
- The `stripe_event_id` UNIQUE constraint is the idempotency mechanism; the `ON CONFLICT DO NOTHING RETURNING stripe_event_id` pattern is the lock-free check

**Usage pattern (Next.js Stripe webhook handler):**

```typescript
// 1. Before processing any webhook event:
const { data } = await supabaseAdmin
  .from('stripe_webhook_events')
  .insert({ stripe_event_id: event.id, event_type: event.type })
  .select('stripe_event_id')
  .single();

// 2. If INSERT returned null (conflict), already processed — skip
if (!data) {
  return new Response('Already processed', { status: 200 });
}

// 3. Otherwise proceed with event handling...
```

```sql
CREATE TABLE public.stripe_webhook_events (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    stripe_event_id     TEXT        NOT NULL,
    event_type          TEXT        NOT NULL,
    processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT stripe_webhook_events_pkey
        PRIMARY KEY (id),
    CONSTRAINT stripe_webhook_events_stripe_event_id_unique
        UNIQUE (stripe_event_id)
);
```

### Column Specifications

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Internal row identifier. Not used by application logic — `stripe_event_id` is the natural key. |
| `stripe_event_id` | TEXT | NOT NULL | — | UNIQUE | The Stripe event ID (`evt_XXXXXXXXXXXXXXXXX`). This is the idempotency key. The `UNIQUE` constraint prevents duplicate rows. The webhook handler attempts `INSERT ... ON CONFLICT DO NOTHING RETURNING stripe_event_id`. If no row is returned, the event was already processed. Format: `evt_` followed by 24 alphanumeric characters. Maximum length: 255 characters (Stripe's current max is ~28 characters, with room for future changes). |
| `event_type` | TEXT | NOT NULL | — | — | The Stripe event type string, e.g., `customer.subscription.updated`, `invoice.payment_failed`, `checkout.session.completed`. Stored for operational visibility (CloudWatch queries, debugging). Not used for routing — event type is extracted from the Stripe event object directly in the handler. Maximum length: 100 characters. |
| `processed_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — | Timestamp when the event was first received and recorded. Set once at INSERT time; never updated. Stored in UTC. Used by the retention cleanup job to identify rows older than 90 days. |

### Constraint Detail

#### `UNIQUE (stripe_event_id)` — The Idempotency Lock

```sql
CONSTRAINT stripe_webhook_events_stripe_event_id_unique UNIQUE (stripe_event_id)
```

This constraint is the sole purpose of this table. PostgreSQL enforces uniqueness atomically, so even under concurrent requests (two webhook deliveries arriving within milliseconds), only one INSERT will succeed. The `ON CONFLICT DO NOTHING` pattern ensures the second attempt silently succeeds (returns 0 rows affected) rather than raising an error.

**Why not rely on SQL idempotency alone (as api/webhooks.md v1 suggested)?**

The original plan was to rely on `UPDATE ... WHERE` SQL idempotency (running the same update twice produces the same result). This is correct for most events, but has two failure modes:
1. **`checkout.session.completed`** inserts a new row in `tenant_subscriptions` if the tenant just subscribed. If processed twice, the first INSERT might succeed, and the second INSERT triggers a UNIQUE constraint violation on `tenant_id` — returning an error instead of silently succeeding.
2. **Side effects like sending a confirmation email or creating Stripe objects.** If the handler were ever extended to do so, double-processing would cause duplicate emails. The idempotency table prevents this proactively.

**Resolution of contradiction with `api/webhooks.md`:** The "v1 decision: do not implement event deduplication table" note in `api/webhooks.md` is superseded by this spec. The `stripe_webhook_events` table IS implemented. `api/webhooks.md` should be treated as outdated on this point. See [api/webhooks.md](../api/webhooks.md) §3 for the updated handler pattern.

### Indexes

```sql
-- Primary key (automatic B-tree index on id)

-- Idempotency check (covers the ON CONFLICT DO NOTHING lookup):
-- Automatic B-tree index from UNIQUE constraint:
-- idx_stripe_webhook_events_stripe_event_id_unique ON stripe_webhook_events(stripe_event_id)
-- Performance: O(log n) lookup on each webhook delivery. With 90-day retention and ~50
-- events/day, the table has at most ~4,500 rows — lookup is negligible.

-- Retention cleanup: find rows older than 90 days
-- SELECT id FROM stripe_webhook_events WHERE processed_at < NOW() - INTERVAL '90 days'
CREATE INDEX idx_stripe_webhook_events_processed_at
    ON public.stripe_webhook_events (processed_at);

-- Admin / debugging: look up all events of a given type
-- SELECT * FROM stripe_webhook_events WHERE event_type = 'invoice.payment_failed'
-- ORDER BY processed_at DESC LIMIT 50
CREATE INDEX idx_stripe_webhook_events_event_type_processed_at
    ON public.stripe_webhook_events (event_type, processed_at DESC);
```

### RLS Policies

```sql
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- NO policies for authenticated JWT users.
-- This table is accessible ONLY via service role (the Next.js webhook handler uses
-- SUPABASE_SERVICE_ROLE_KEY). Service role bypasses RLS entirely.
--
-- Rationale: Exposing this table to browser sessions has no product value and
-- exposes internal system state. Zero RLS policies = zero JWT user access.
--
-- The admin panel does NOT expose this table directly. It surfaces subscription
-- state via tenant_subscriptions, which is the user-facing representation.
```

**Bot access:** The bot does NOT read `stripe_webhook_events`. Subscription state is read from `tenants.plan` (denormalized cache) or `tenant_subscriptions`. The idempotency store is purely a website-side concern.

**Retention:** Rows older than 90 days should be deleted by a nightly pg_cron job. See [database/retention.md](./retention.md) for the exact pg_cron SQL. 90 days is chosen because:
1. Stripe retains event IDs in their system for 30 days; after that the same `evt_` ID will never be re-delivered
2. The extra 60 days provides a safety buffer and allows querying recent events for debugging
3. At 50 events/day (generous estimate), 90-day retention = ~4,500 rows — trivially small

### Migration

```sql
-- Migration: 20260400000007_create_stripe_webhook_events.sql
BEGIN;

CREATE TABLE public.stripe_webhook_events (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    stripe_event_id     TEXT        NOT NULL,
    event_type          TEXT        NOT NULL,
    processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT stripe_webhook_events_pkey
        PRIMARY KEY (id),
    CONSTRAINT stripe_webhook_events_stripe_event_id_unique
        UNIQUE (stripe_event_id)
);

-- Retention cleanup index
CREATE INDEX idx_stripe_webhook_events_processed_at
    ON public.stripe_webhook_events (processed_at);

-- Admin/debugging index
CREATE INDEX idx_stripe_webhook_events_event_type_processed_at
    ON public.stripe_webhook_events (event_type, processed_at DESC);

-- RLS: enabled but no policies — service role only
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.stripe_webhook_events
    IS 'Idempotency store for Stripe webhook events. Prevents double-processing on at-least-once delivery.';
COMMENT ON COLUMN public.stripe_webhook_events.stripe_event_id
    IS 'Stripe event ID (evt_XXXXXXXXXXXXXXXXX). UNIQUE — used for ON CONFLICT DO NOTHING deduplication.';
COMMENT ON COLUMN public.stripe_webhook_events.event_type
    IS 'Stripe event type string, e.g. customer.subscription.updated. Stored for debugging.';
COMMENT ON COLUMN public.stripe_webhook_events.processed_at
    IS 'When the event was first received. Used by the 90-day retention cleanup job.';

COMMIT;
```

**Rollback:**
```sql
DROP TABLE IF EXISTS public.stripe_webhook_events;
```

**Placement in migration sequence:**
```
supabase/migrations/
├── 20260400000000_create_enums.sql
├── 20260400000001_create_tenants.sql
├── 20260400000002_create_tenant_members.sql
├── 20260400000003_create_discord_connections.sql
├── 20260400000004_create_tenant_api_keys.sql
├── 20260400000005_create_tenant_service_connections.sql
├── 20260400000006_create_tenant_subscriptions.sql
└── 20260400000007_create_stripe_webhook_events.sql  ← NEW
```

**Migration 007 is independent of all preceding migrations.** It does not reference any other new table via foreign key, so it can technically run in any order after 000 (enum creation). The sequential numbering is for operational clarity only.

---

## Table: `tenant_messages`

**Purpose:** Lightweight event log — one row per Discord message processed by the bot for a tenant. Stores only routing metadata (no message content) for privacy. Read by the dashboard QuickStatsRow to display "Messages Today" and "Messages (30 days)" counts. Written by the bot after successfully processing each mention, DM, or command.

**Created by migration:** `20260400000008_create_tenant_messages.sql` (to be created)

**IMPORTANT — Not an existing table:** The existing Decision Orchestrator bot does NOT have a `messages` table. The bot reads Discord history via `channel.history()` (Discord API) and does NOT persist messages to Supabase. This table is **new** and is part of the multi-tenant SaaS adaptation. The bot must be updated to insert a row here after each message is processed. See [multi-tenant/tenant-scoping.md](../multi-tenant/tenant-scoping.md) for bot-side instrumentation details.

```sql
CREATE TABLE public.tenant_messages (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL,
    guild_id        TEXT            NOT NULL,
    channel_id      TEXT            NOT NULL,
    message_type    TEXT            NOT NULL DEFAULT 'mention',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_messages_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_messages_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_messages_message_type_check
        CHECK (message_type IN ('mention', 'dm', 'command'))
);
```

### Column Reference

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Unique event identifier. Never returned to the frontend — only COUNT queries are used. |
| `tenant_id` | `UUID` | NOT NULL | — | FOREIGN KEY → `tenants(id)` ON DELETE CASCADE | The tenant whose bot processed this message. On CASCADE delete: all message log rows are removed when a tenant is deleted. Used in all queries (always filtered). |
| `guild_id` | `TEXT` | NOT NULL | — | — | Discord guild ID (numeric string) where the message occurred. Matches `discord_connections.guild_id`. Stored for potential per-server analytics in future. Not exposed in V1 dashboard. |
| `channel_id` | `TEXT` | NOT NULL | — | — | Discord channel or thread ID where the message occurred. Not exposed in V1 dashboard. Stored for potential per-channel analytics. |
| `message_type` | `TEXT` | NOT NULL | `'mention'` | CHECK IN ('mention', 'dm', 'command') | Type of message that triggered the bot. `mention` = user @mentioned the bot in a guild channel. `dm` = user sent the bot a DM. `command` = user used a slash command. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Timestamp of when the bot received and began processing the message. Used for all count queries (WHERE created_at > ...). Set by the bot at processing start — not at processing completion. |

### Indexes

```sql
-- Query: Dashboard "Messages Today" count
-- SELECT COUNT(*) FROM tenant_messages WHERE tenant_id = $1 AND created_at >= $start_of_day
CREATE INDEX idx_tenant_messages_tenant_id_created_at
    ON public.tenant_messages (tenant_id, created_at DESC);

-- Note: No separate index on tenant_id alone — the composite index covers single-tenant lookups.
-- No index on guild_id or channel_id — not queried in V1 dashboard.
```

### RLS

RLS is enabled. Website users (authenticated JWT) may SELECT rows for tenants they belong to. The bot uses the service role key which bypasses RLS for INSERT.

```sql
ALTER TABLE public.tenant_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can read their tenant's message log
CREATE POLICY "tenant_messages_select_member"
    ON public.tenant_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_messages.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- INSERT: blocked for authenticated users — bot uses service role key
-- (No INSERT policy for 'authenticated' role)

-- UPDATE/DELETE: blocked for all authenticated users
-- (No UPDATE or DELETE policies)
```

### Dashboard Queries

```typescript
// QuickStatsRow — Messages Today count
// File: components/dashboard/QuickStatsRow.tsx
const startOfTodayUTC = new Date();
startOfTodayUTC.setUTCHours(0, 0, 0, 0);

const { count: messagesToday } = await supabase
  .from('tenant_messages')
  .select('id', { count: 'exact', head: true })
  .gte('created_at', startOfTodayUTC.toISOString());
// RLS automatically scopes to the authenticated user's tenant.
// Returns null if no rows — display as 0.
```

### Bot-Side Instrumentation

The bot writes to `tenant_messages` after each message is successfully dispatched to Claude. Insert location: `entrypoints/discord/guild_handler.py` — after `_execute_message()` returns without error, and in `entrypoints/discord/dm_handler.py` — after `_execute_dm()` returns without error.

```python
# After successful message processing — guild handler
async def _record_message_event(
    self,
    tenant_id: str,
    guild_id: str,
    channel_id: str,
    message_type: Literal["mention", "dm", "command"],
) -> None:
    """Fire-and-forget instrumentation — never blocks message processing."""
    try:
        await self._supabase.table("tenant_messages").insert({
            "tenant_id": tenant_id,
            "guild_id": guild_id,
            "channel_id": channel_id,
            "message_type": message_type,
        }).execute()
    except Exception as e:
        logger.warning(f"[tenant:{tenant_id}] Failed to record message event: {e}")
        # Never re-raise — instrumentation failure must not affect user experience
```

**Error handling:** If the INSERT fails (Supabase offline, RLS misconfiguration, etc.), the bot logs a WARNING and continues. The dashboard stat will be slightly under-counted but the bot remains operational.

### Data Volume and Retention

- **Write rate:** 1 row per bot message processed. At 1,000 active tenants with 10 messages/day each: 10,000 rows/day = ~3.65M rows/year.
- **Retention:** Rolling 90 days. A daily pg_cron job deletes rows older than 90 days.
- **Cleanup SQL:**
  ```sql
  DELETE FROM public.tenant_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  ```
- **Pg_cron schedule:** Daily at 03:00 UTC (low-traffic window).
- **Index on `created_at`:** The `idx_tenant_messages_tenant_id_created_at` composite index also serves the cleanup query (full table scan avoided; retention cleanup deletes by `created_at` range regardless of `tenant_id`). Add a standalone `created_at` index if cleanup is slow:
  ```sql
  CREATE INDEX idx_tenant_messages_created_at
      ON public.tenant_messages (created_at)
      WHERE created_at < NOW() - INTERVAL '80 days';
  ```

### Migration SQL

```sql
-- Migration: 20260400000008_create_tenant_messages.sql
BEGIN;

CREATE TABLE public.tenant_messages (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL,
    guild_id        TEXT            NOT NULL,
    channel_id      TEXT            NOT NULL,
    message_type    TEXT            NOT NULL DEFAULT 'mention',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_messages_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_messages_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_messages_message_type_check
        CHECK (message_type IN ('mention', 'dm', 'command'))
);

CREATE INDEX idx_tenant_messages_tenant_id_created_at
    ON public.tenant_messages (tenant_id, created_at DESC);

ALTER TABLE public.tenant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_messages_select_member"
    ON public.tenant_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_messages.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

COMMENT ON TABLE public.tenant_messages
    IS 'Lightweight event log for messages processed by the bot per tenant. No message content stored — routing metadata only. Used for dashboard QuickStats counts.';

COMMIT;
```

**Rollback:**
```sql
DROP TABLE IF EXISTS public.tenant_messages;
```

---

## Table: `tenant_tool_calls`

**Purpose:** Lightweight event log — one row per tool call executed by the bot for a tenant. Stores tool name, success/failure, and duration. Read by the dashboard QuickStatsRow to display "Tool Uses Today" count. Written by the bot after each MCP tool call completes (success or failure).

**Created by migration:** `20260400000009_create_tenant_tool_calls.sql` (to be created)

**IMPORTANT — Not an existing table:** The existing Decision Orchestrator bot does NOT have a `tool_calls` table. Tool executions are transient — the bot calls tools via MCP and returns results to Claude without persisting them. This table is **new** and is part of the multi-tenant SaaS adaptation. The bot must be updated to insert a row after each tool execution. See [multi-tenant/tenant-scoping.md](../multi-tenant/tenant-scoping.md) for bot-side instrumentation.

```sql
CREATE TABLE public.tenant_tool_calls (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL,
    tool_name       TEXT            NOT NULL,
    success         BOOLEAN         NOT NULL DEFAULT TRUE,
    duration_ms     INTEGER         NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_tool_calls_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_tool_calls_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_tool_calls_duration_positive
        CHECK (duration_ms IS NULL OR duration_ms >= 0)
);
```

### Column Reference

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | PRIMARY KEY | Unique event identifier. Never returned to the frontend — only COUNT queries used. |
| `tenant_id` | `UUID` | NOT NULL | — | FOREIGN KEY → `tenants(id)` ON DELETE CASCADE | The tenant whose bot made this tool call. CASCADE delete removes all rows when tenant is deleted. |
| `tool_name` | `TEXT` | NOT NULL | — | — | The MCP tool name as registered in `ToolRegistry` (e.g., `discord_send_message`, `toggl_create_time_entry`, `github_create_issue`). Stored for potential per-tool analytics in future. Not exposed in V1 dashboard (only COUNT is used). |
| `success` | `BOOLEAN` | NOT NULL | `TRUE` | — | Whether the tool call completed without error. `FALSE` if the tool raised an exception or returned an error result. Used to track error rate in future analytics (V1 dashboard shows only total count regardless of success). |
| `duration_ms` | `INTEGER` | NULL | NULL | CHECK >= 0 | Wall-clock time in milliseconds from tool call start to return. NULL if the bot does not record timing (optional instrumentation). Stored for future P95 latency dashboards. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | Timestamp when the tool call started. Used for all count queries. |

### Indexes

```sql
-- Query: Dashboard "Tool Uses Today" count
-- SELECT COUNT(*) FROM tenant_tool_calls WHERE tenant_id = $1 AND created_at >= $start_of_day
CREATE INDEX idx_tenant_tool_calls_tenant_id_created_at
    ON public.tenant_tool_calls (tenant_id, created_at DESC);

-- Note: No index on tool_name — not queried in V1 dashboard.
```

### RLS

```sql
ALTER TABLE public.tenant_tool_calls ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can read their tenant's tool call log
CREATE POLICY "tenant_tool_calls_select_member"
    ON public.tenant_tool_calls
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_tool_calls.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- INSERT: blocked for authenticated users — bot uses service role key
-- UPDATE/DELETE: blocked for all authenticated users
```

### Dashboard Queries

```typescript
// QuickStatsRow — Tool Uses Today count
// File: components/dashboard/QuickStatsRow.tsx
const { count: toolUsesToday } = await supabase
  .from('tenant_tool_calls')
  .select('id', { count: 'exact', head: true })
  .gte('created_at', startOfTodayUTC.toISOString());
// RLS automatically scopes to the authenticated user's tenant.
// Returns null if no rows — display as 0.
```

### Bot-Side Instrumentation

The bot writes to `tenant_tool_calls` after each tool execution. Insert location: the MCP tool execution wrapper in `services/execution.py` (or wherever `ToolRegistry.call_tool()` dispatches). The insert is fire-and-forget — it must never block or fail a tool call.

```python
# After tool execution — in the tool call dispatch wrapper
async def _record_tool_call(
    self,
    tenant_id: str,
    tool_name: str,
    success: bool,
    duration_ms: int | None = None,
) -> None:
    """Fire-and-forget instrumentation — never blocks tool execution."""
    try:
        await self._supabase.table("tenant_tool_calls").insert({
            "tenant_id": tenant_id,
            "tool_name": tool_name,
            "success": success,
            "duration_ms": duration_ms,
        }).execute()
    except Exception as e:
        logger.warning(f"[tenant:{tenant_id}] Failed to record tool call: {e}")
        # Never re-raise
```

**Where to instrument:** Wrap `ToolRegistry.call_tool()` (or the equivalent dispatch method) at the top of the call:
```python
start_time = time.monotonic()
try:
    result = await tool_func(**tool_input)
    success = True
except Exception as e:
    success = False
    raise
finally:
    duration_ms = int((time.monotonic() - start_time) * 1000)
    asyncio.create_task(
        self._record_tool_call(tenant_id, tool_name, success, duration_ms)
    )
```

### Data Volume and Retention

- **Write rate:** Multiple rows per bot message (each tool call = 1 row). At 1,000 tenants × 10 messages/day × 3 tool calls/message average: 30,000 rows/day = ~10.9M rows/year.
- **Retention:** Rolling 90 days. Same pg_cron job as `tenant_messages`:
  ```sql
  DELETE FROM public.tenant_tool_calls
  WHERE created_at < NOW() - INTERVAL '90 days';
  ```
- **Pg_cron schedule:** Daily at 03:05 UTC (staggered 5 minutes after tenant_messages cleanup).

### Migration SQL

```sql
-- Migration: 20260400000009_create_tenant_tool_calls.sql
BEGIN;

CREATE TABLE public.tenant_tool_calls (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL,
    tool_name       TEXT            NOT NULL,
    success         BOOLEAN         NOT NULL DEFAULT TRUE,
    duration_ms     INTEGER         NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_tool_calls_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_tool_calls_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_tool_calls_duration_positive
        CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE INDEX idx_tenant_tool_calls_tenant_id_created_at
    ON public.tenant_tool_calls (tenant_id, created_at DESC);

ALTER TABLE public.tenant_tool_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_tool_calls_select_member"
    ON public.tenant_tool_calls
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_tool_calls.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

COMMENT ON TABLE public.tenant_tool_calls
    IS 'Lightweight event log for MCP tool calls made by the bot per tenant. Tool name, success flag, and duration stored. Used for dashboard QuickStats counts.';

COMMIT;
```

**Rollback:**
```sql
DROP TABLE IF EXISTS public.tenant_tool_calls;
```

---

## Cross-Reference: Dashboard Queries on New Tables

The following cross-reference documents which tables the dashboard reads and confirms there are no "orphaned" queries pointing to non-existent tables. As of aspect 8.1.2, all tables referenced by the dashboard exist in the schema.

| Dashboard Component | Table Queried | Columns Used | Table Status |
|--------------------|--------------|-------------|--------------|
| `BotStatusCard` | `discord_connections` | `status`, `last_heartbeat_at`, `bot_username`, `guild_id`, `error_message` | ✅ Defined in this file |
| `ApiKeysCard` | `tenant_api_keys` | `key_type`, `status`, `validated_at`, `key_hint` | ✅ Defined in this file |
| `IntegrationsSummaryCard` | `tenant_service_connections` | `service`, `status` | ✅ Defined in this file |
| `QuickStatsRow` — messages | `tenant_messages` | `id` (COUNT only), `created_at` | ✅ Defined in this file (new table) |
| `QuickStatsRow` — tool calls | `tenant_tool_calls` | `id` (COUNT only), `created_at` | ✅ Defined in this file (new table) |
| `QuickStatsRow` — uptime | `discord_connections` | `connected_at`, `last_heartbeat_at`, `status` | ✅ Defined in this file |
| `RecentActivityFeed` | `discord_connections` | `status`, `updated_at` | ✅ Defined in this file |
| `RecentActivityFeed` | `tenant_service_connections` | `service`, `status`, `connected_at` | ✅ Defined in this file |
| `RecentActivityFeed` | `tenant_api_keys` | `key_type`, `status`, `validated_at` | ✅ Defined in this file |
| `RecentActivityFeed` | `tenant_subscriptions` | `plan`, `status`, `updated_at` | ✅ Defined in this file |
| `DashboardTopbar` | `tenants` | `name`, `plan` | ✅ Defined in this file |
| `OnboardingChecklist` | `discord_connections` | `status` | ✅ Defined in this file |
| `OnboardingChecklist` | `tenant_api_keys` | `key_type`, `status` | ✅ Defined in this file |

**Updated migration sequence:**
```
supabase/migrations/
├── 20260400000000_create_enums.sql
├── 20260400000001_create_tenants.sql
├── 20260400000002_create_tenant_members.sql
├── 20260400000003_create_discord_connections.sql
├── 20260400000004_create_tenant_api_keys.sql
├── 20260400000005_create_tenant_service_connections.sql
├── 20260400000006_create_tenant_subscriptions.sql
├── 20260400000007_create_stripe_webhook_events.sql
├── 20260400000008_create_tenant_messages.sql     ← NEW (aspect 8.1.2)
└── 20260400000009_create_tenant_tool_calls.sql   ← NEW (aspect 8.1.2)
```

---

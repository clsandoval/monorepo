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

*Next tables to spec: `tenant_service_connections` (aspect 3.4), `tenant_subscriptions` (aspect 3.5)*

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

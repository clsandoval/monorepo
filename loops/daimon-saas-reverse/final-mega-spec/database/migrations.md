# Database Migrations — Daimon SaaS Multi-Tenant Platform

**Aspect:** 3.7 — Ordered SQL migrations from current schema to multi-tenant
**Wave:** Wave 3 — Exhaustive Data Model
**Written:** 2026-03-13
**References:**
- [schema.md](./schema.md) — Complete table definitions for every table below
- [rls-policies.md](./rls-policies.md) — RLS policy SQL referenced in these migrations
- [vault-encryption.md](./vault-encryption.md) — Vault setup applied in migration 004
- [triggers.md](./triggers.md) — Trigger functions referenced in these migrations

---

## Overview

The existing Decision Orchestrator database (in `projects/decision-orchestrator/supabase/migrations/`) ends at:

```
20260303120000_enable_discord_bot_reader_login.sql
```

All 7 new Daimon SaaS migrations are **additive only** — they create entirely new tables, types, indexes, and policies. They do NOT modify or drop any existing tables. The bot's existing single-tenant tables (`sessions`, `messages`, `meeting_sessions`, `thread_tool_contexts`, `scheduled_tasks`, `conversation_skills`, `accessible_meetings`, `discord_archive` bucket, etc.) are untouched.

### Migration Ordering

| Migration File | Content | Safety |
|----------------|---------|--------|
| `20260400000000_create_enums.sql` | All new PostgreSQL enum types | Additive — safe |
| `20260400000001_create_tenants.sql` | `tenants` table + indexes + triggers + RLS + Realtime | Additive — safe |
| `20260400000002_create_tenant_members.sql` | `tenant_members` table + indexes + RLS | Additive — safe |
| `20260400000003_create_discord_connections.sql` | `discord_connections` table + indexes + triggers + RLS + Realtime + Vault helper | Additive — safe |
| `20260400000004_create_tenant_api_keys.sql` | `tenant_api_keys` table + indexes + triggers + RLS + Realtime | Additive — safe |
| `20260400000005_create_tenant_service_connections.sql` | `tenant_service_connections` table + indexes + triggers + RLS + Realtime | Additive — safe |
| `20260400000006_create_tenant_subscriptions.sql` | `tenant_subscriptions` table + indexes + triggers + RLS + plan cascade trigger | Additive — safe |

### Prerequisites

Before running these migrations, confirm:

1. **Supabase Vault is enabled** on the project. Navigate to Supabase Dashboard → Project Settings → Database → Vault. If not enabled, click "Enable Vault". Vault is required for migrations 003 and 004 which call `vault.create_secret()` in helper functions.

2. **`pg_cron` extension is enabled** (needed for the Google token refresh schedule in migration 005). In the Supabase Dashboard → SQL Editor: `CREATE EXTENSION IF NOT EXISTS pg_cron;` and `GRANT USAGE ON SCHEMA cron TO postgres;`.

3. **`pgsodium` extension** is enabled by Supabase by default (required for Vault). No manual step needed.

4. **`update_updated_at_column()` function** already exists in the database (created by prior migrations). The migrations below reference it — do not attempt to recreate it.

---

## Migration 000: Create Enum Types

**File:** `20260400000000_create_enums.sql`

All new enum types are created in a single migration before any tables that reference them. If any of these enums already exist (e.g., from a development test), the `IF NOT EXISTS` guard prevents errors.

```sql
-- Migration: 20260400000000_create_enums.sql
-- Purpose: Create all PostgreSQL enum types required by Daimon SaaS tables
-- Safety: Additive only — creates new types, does not modify existing types

BEGIN;

-- Plan tier for tenants
CREATE TYPE IF NOT EXISTS public.tenant_plan AS ENUM (
    'free',
    'starter',
    'pro'
);

-- Overall tenant lifecycle status
CREATE TYPE IF NOT EXISTS public.tenant_status AS ENUM (
    'pending',
    'configured',
    'active',
    'suspended'
);

-- Role within a tenant workspace
CREATE TYPE IF NOT EXISTS public.tenant_member_role AS ENUM (
    'owner',
    'admin',
    'member'
);

-- Discord connection state machine
CREATE TYPE IF NOT EXISTS public.discord_connection_status AS ENUM (
    'pending',
    'connecting',
    'connected',
    'disconnected',
    'error',
    'suspended'
);

-- Third-party service connection health
CREATE TYPE IF NOT EXISTS public.service_connection_status AS ENUM (
    'connected',
    'expired',
    'revoked',
    'error'
);

-- Stripe subscription lifecycle
CREATE TYPE IF NOT EXISTS public.subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'paused',
    'unpaid'
);

-- AI provider API key type
CREATE TYPE IF NOT EXISTS public.api_key_type AS ENUM (
    'anthropic',
    'openai'
);

-- Service connection auth method
CREATE TYPE IF NOT EXISTS public.service_auth_type AS ENUM (
    'oauth',
    'api_key'
);

COMMIT;
```

**Rollback:**
```sql
-- Only run if rolling back the entire SaaS migration set.
-- These types cannot be dropped if any table references them.
-- Drop tables first (migrations 001–006), then:
DROP TYPE IF EXISTS public.service_auth_type;
DROP TYPE IF EXISTS public.api_key_type;
DROP TYPE IF EXISTS public.subscription_status;
DROP TYPE IF EXISTS public.service_connection_status;
DROP TYPE IF EXISTS public.discord_connection_status;
DROP TYPE IF EXISTS public.tenant_member_role;
DROP TYPE IF EXISTS public.tenant_status;
DROP TYPE IF EXISTS public.tenant_plan;
```

---

## Migration 001: Create `tenants` Table

**File:** `20260400000001_create_tenants.sql`

```sql
-- Migration: 20260400000001_create_tenants.sql
-- Purpose: Create the tenants table — top-level organizational unit for Daimon SaaS
-- Depends on: 20260400000000_create_enums.sql (tenant_plan, tenant_status)
-- Safety: Additive only

BEGIN;

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE public.tenants (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    name                TEXT            NOT NULL,
    owner_id            UUID            NOT NULL,
    plan                public.tenant_plan     NOT NULL DEFAULT 'free',
    status              public.tenant_status   NOT NULL DEFAULT 'pending',
    stripe_customer_id  TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenants_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenants_owner_id_fkey
        FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE RESTRICT,
    CONSTRAINT tenants_stripe_customer_id_key
        UNIQUE (stripe_customer_id),
    CONSTRAINT tenants_name_length
        CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

COMMENT ON TABLE public.tenants
    IS 'Top-level organizational unit for Daimon SaaS. One row per bot instance / paying customer.';
COMMENT ON COLUMN public.tenants.id
    IS 'Unique tenant identifier. Referenced by all other SaaS tables as tenant_id.';
COMMENT ON COLUMN public.tenants.owner_id
    IS 'Supabase Auth user ID of the founding owner. ON DELETE RESTRICT — must delete tenant first.';
COMMENT ON COLUMN public.tenants.plan
    IS 'Denormalized billing plan cache. Updated by Stripe webhook. Bot reads this for plan-gating.';
COMMENT ON COLUMN public.tenants.status
    IS 'Tenant lifecycle: pending→configured→active. suspended is set by admin actions.';
COMMENT ON COLUMN public.tenants.stripe_customer_id
    IS 'Stripe Customer ID (format: cus_XXXXXXXXXXXXXXXXX). NULL until first Checkout flow.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Dashboard load: get all tenants owned by this user
CREATE INDEX idx_tenants_owner_id
    ON public.tenants (owner_id);

-- Admin panel: filter by plan
CREATE INDEX idx_tenants_plan
    ON public.tenants (plan);

-- Admin panel: filter by status
CREATE INDEX idx_tenants_status
    ON public.tenants (status);

-- stripe_customer_id already indexed by UNIQUE constraint

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Auto-update updated_at on every row modification
CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated users can see tenants they are a member of
CREATE POLICY tenants_select_member
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: authenticated users can create tenants for themselves
-- (owner_id must equal the caller's auth.uid())
CREATE POLICY tenants_insert_owner
    ON public.tenants
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

-- UPDATE: owner or admin role members can update tenant settings
CREATE POLICY tenants_update_member
    ON public.tenants
    FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
              AND role IN ('owner', 'admin')
        )
    );

-- DELETE: only owner role can delete the tenant
CREATE POLICY tenants_delete_owner
    ON public.tenants
    FOR DELETE
    TO authenticated
    USING (
        id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
              AND role = 'owner'
        )
    );

-- ─── REALTIME ─────────────────────────────────────────────────────────────────

-- Bot subscribes to tenant status changes (e.g., suspended) via Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;

COMMIT;
```

**Rollback:**
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.tenants;
DROP TABLE IF EXISTS public.tenants;
```

---

## Migration 002: Create `tenant_members` Table

**File:** `20260400000002_create_tenant_members.sql`

```sql
-- Migration: 20260400000002_create_tenant_members.sql
-- Purpose: Maps auth.users to tenants with a role. Source of truth for RLS membership checks.
-- Depends on: 20260400000001_create_tenants.sql (tenants table)
-- Safety: Additive only

BEGIN;

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE public.tenant_members (
    tenant_id   UUID                            NOT NULL,
    user_id     UUID                            NOT NULL,
    role        public.tenant_member_role       NOT NULL DEFAULT 'member',
    invited_by  UUID                            NULL,
    created_at  TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_members_pkey
        PRIMARY KEY (tenant_id, user_id),
    CONSTRAINT tenant_members_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_members_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT tenant_members_invited_by_fkey
        FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.tenant_members
    IS 'Membership table: maps users to tenants with a role. Used by all SaaS RLS policies.';
COMMENT ON COLUMN public.tenant_members.tenant_id
    IS 'Part of composite PK. CASCADE delete from tenants.';
COMMENT ON COLUMN public.tenant_members.user_id
    IS 'Part of composite PK. CASCADE delete from auth.users.';
COMMENT ON COLUMN public.tenant_members.role
    IS 'owner: full control + billing. admin: manage connections/keys. member: read-only.';
COMMENT ON COLUMN public.tenant_members.invited_by
    IS 'Who sent the invitation. NULL for the founding owner. SET NULL if inviter is deleted.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- CRITICAL: RLS performance index — every RLS-protected SaaS table query uses this
-- Query: SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
CREATE INDEX idx_tenant_members_user_id
    ON public.tenant_members (user_id);

-- Admin panel / invite list: who are the members of this tenant?
CREATE INDEX idx_tenant_members_tenant_id
    ON public.tenant_members (tenant_id);

-- Role check in UPDATE/DELETE RLS policies: user's role for a given tenant
CREATE INDEX idx_tenant_members_user_tenant_role
    ON public.tenant_members (user_id, tenant_id, role);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- SELECT: members can see all membership rows for tenants they belong to
CREATE POLICY tenant_members_select
    ON public.tenant_members
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: only owner or admin can add new members (invite flow)
CREATE POLICY tenant_members_insert_admin
    ON public.tenant_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
              AND role IN ('owner', 'admin')
        )
    );

-- UPDATE: only owner can change a member's role
CREATE POLICY tenant_members_update_owner
    ON public.tenant_members
    FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
              AND role = 'owner'
        )
    );

-- DELETE: only owner can remove other members; owner cannot remove themselves
CREATE POLICY tenant_members_delete_owner
    ON public.tenant_members
    FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
              AND role = 'owner'
        )
        AND user_id != auth.uid()
    );

COMMIT;
```

**Rollback:**
```sql
DROP TABLE IF EXISTS public.tenant_members;
```

---

## Migration 003: Create `discord_connections` Table

**File:** `20260400000003_create_discord_connections.sql`

```sql
-- Migration: 20260400000003_create_discord_connections.sql
-- Purpose: Stores Discord bot token + guild ID per tenant, encrypted via Vault.
--          Bot reads this table on startup and subscribes to changes via Realtime.
-- Depends on: 20260400000001_create_tenants.sql
--             Supabase Vault must be enabled on this project
-- Safety: Additive only

BEGIN;

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE public.discord_connections (
    -- Identity
    id                  UUID                                NOT NULL DEFAULT gen_random_uuid(),
    tenant_id           UUID                                NOT NULL,

    -- Discord credentials (Vault-encrypted)
    vault_secret_id     UUID                                NOT NULL,
    guild_id            TEXT                                NOT NULL,
    token_hint          TEXT                                NOT NULL,

    -- Connection state (bot-maintained)
    status              public.discord_connection_status    NOT NULL DEFAULT 'pending',
    error_message       TEXT                                NULL,
    bot_user_id         TEXT                                NULL,
    bot_username        TEXT                                NULL,
    last_heartbeat      TIMESTAMPTZ                         NULL,

    -- Audit
    created_at          TIMESTAMPTZ                         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ                         NOT NULL DEFAULT NOW(),

    CONSTRAINT discord_connections_pkey
        PRIMARY KEY (id),
    CONSTRAINT discord_connections_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT discord_connections_tenant_unique
        UNIQUE (tenant_id),
    CONSTRAINT discord_connections_guild_id_unique
        UNIQUE (guild_id),
    CONSTRAINT discord_connections_guild_id_format
        CHECK (guild_id ~ '^\d{17,20}$'),
    CONSTRAINT discord_connections_token_hint_length
        CHECK (char_length(token_hint) >= 8 AND char_length(token_hint) <= 30),
    CONSTRAINT discord_connections_error_message_length
        CHECK (error_message IS NULL OR char_length(error_message) <= 500)
);

COMMENT ON TABLE public.discord_connections
    IS 'One Discord bot token + guild ID per tenant. Vault-encrypted token. Bot writes status/heartbeat.';
COMMENT ON COLUMN public.discord_connections.vault_secret_id
    IS 'UUID of vault.secrets row containing the AES-256-encrypted Discord bot token.';
COMMENT ON COLUMN public.discord_connections.guild_id
    IS 'Discord guild (server) snowflake ID. 17-20 digit string. UNIQUE — one tenant per guild.';
COMMENT ON COLUMN public.discord_connections.token_hint
    IS 'Masked display token, e.g. "Bot.ABCD...xyz". Never the full token.';
COMMENT ON COLUMN public.discord_connections.status
    IS 'Connection lifecycle: pending→connecting→connected. Bot writes this.';
COMMENT ON COLUMN public.discord_connections.bot_user_id
    IS 'Discord user ID of the bot (from discord.py client.user.id). Set by bot on first connect.';
COMMENT ON COLUMN public.discord_connections.bot_username
    IS 'Discord username of the bot (e.g., "Daimon"). Set by bot on first connect.';
COMMENT ON COLUMN public.discord_connections.last_heartbeat
    IS 'Timestamp of most recent bot heartbeat. Stale if > 90 seconds ago.';
COMMENT ON COLUMN public.discord_connections.error_message
    IS 'Human-readable error from bot. Set on status=error. Cleared on reconnect.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Bot startup: load all non-disconnected connections
CREATE INDEX idx_discord_connections_status
    ON public.discord_connections (status)
    WHERE status NOT IN ('disconnected', 'suspended');

-- Dashboard: get connection for a tenant (main page query)
-- (tenant_id UNIQUE constraint already provides an index)

-- Admin panel: find all connections in error state
CREATE INDEX idx_discord_connections_error
    ON public.discord_connections (tenant_id, updated_at)
    WHERE status = 'error';

-- Stale heartbeat detection: find connections where last_heartbeat is old
CREATE INDEX idx_discord_connections_heartbeat
    ON public.discord_connections (last_heartbeat)
    WHERE status = 'connected';

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Auto-update updated_at on every row modification
-- Note: This trigger fires frequently (every 30s heartbeat). The function is lightweight.
CREATE TRIGGER discord_connections_updated_at
    BEFORE UPDATE ON public.discord_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ─── VAULT HELPER FUNCTIONS ──────────────────────────────────────────────────

-- public.get_decrypted_secret(secret_id UUID) → TEXT
-- SECURITY DEFINER: runs as postgres (superuser) so it can access vault.decrypted_secrets
-- Called by bot (via service role or SECURITY DEFINER) to decrypt stored tokens/keys.
-- Never exposed to browser clients — service role only.
CREATE OR REPLACE FUNCTION public.get_decrypted_secret(secret_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault, pg_catalog
AS $$
DECLARE
    v_secret TEXT;
BEGIN
    SELECT decrypted_secret
    INTO v_secret
    FROM vault.decrypted_secrets
    WHERE id = secret_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vault secret not found: %', secret_id;
    END IF;

    RETURN v_secret;
END;
$$;

COMMENT ON FUNCTION public.get_decrypted_secret(UUID)
    IS 'SECURITY DEFINER wrapper to decrypt a Vault secret by UUID. Only accessible to service role.';

-- Revoke execute from anon and authenticated (only service role / postgres should call this)
REVOKE EXECUTE ON FUNCTION public.get_decrypted_secret(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_decrypted_secret(UUID) FROM authenticated;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can read their connection record
-- vault_secret_id is returned but useless to browsers (they can't call Vault)
CREATE POLICY discord_connections_select_member
    ON public.discord_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- INSERT: tenant owners and admins can create a connection
CREATE POLICY discord_connections_insert_admin
    ON public.discord_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- UPDATE: tenant owners and admins can update settings fields (guild_id, vault_secret_id, token_hint)
-- Bot updates: status, error_message, bot_user_id, bot_username, last_heartbeat
-- Both paths are valid; owner/admin check is for website-origin updates only.
-- Bot bypasses RLS (service role).
CREATE POLICY discord_connections_update_admin
    ON public.discord_connections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- DELETE: tenant owners can delete their connection (hard delete from settings page)
-- Vault secret must be deleted by the API route before or after the row delete.
CREATE POLICY discord_connections_delete_owner
    ON public.discord_connections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    );

-- ─── REALTIME ─────────────────────────────────────────────────────────────────

-- Website subscribes to status/heartbeat changes (real-time dashboard updates)
-- Bot also watches for new connection records (start-on-provision pattern)
ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_connections;

COMMIT;
```

**Rollback:**
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.discord_connections;
DROP FUNCTION IF EXISTS public.get_decrypted_secret(UUID);
DROP TABLE IF EXISTS public.discord_connections;
```

---

## Migration 004: Create `tenant_api_keys` Table

**File:** `20260400000004_create_tenant_api_keys.sql`

```sql
-- Migration: 20260400000004_create_tenant_api_keys.sql
-- Purpose: Stores encrypted Anthropic and OpenAI API keys per tenant.
--          BYOK (Bring Your Own Key) — required for bot operation.
-- Depends on: 20260400000001_create_tenants.sql
--             20260400000000_create_enums.sql (api_key_type)
--             Supabase Vault must be enabled (vault.create_secret used by Edge Functions)
-- Safety: Additive only

BEGIN;

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE public.tenant_api_keys (
    id                  UUID                    NOT NULL DEFAULT gen_random_uuid(),
    tenant_id           UUID                    NOT NULL,
    key_type            public.api_key_type     NOT NULL,
    vault_secret_id     UUID                    NOT NULL,
    key_hint            TEXT                    NOT NULL,
    status              TEXT                    NOT NULL DEFAULT 'active',
    validated_at        TIMESTAMPTZ             NULL,
    created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    CONSTRAINT tenant_api_keys_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_api_keys_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_api_keys_tenant_provider_key
        UNIQUE (tenant_id, key_type),
    CONSTRAINT tenant_api_keys_status_check
        CHECK (status IN ('active', 'invalid', 'revoked')),
    CONSTRAINT tenant_api_keys_key_hint_length
        CHECK (char_length(key_hint) >= 8 AND char_length(key_hint) <= 30)
);

COMMENT ON TABLE public.tenant_api_keys
    IS 'BYOK: encrypted AI provider keys per tenant. UNIQUE (tenant_id, key_type) ensures at most 1 per provider.';
COMMENT ON COLUMN public.tenant_api_keys.key_type
    IS 'anthropic (required) or openai (optional; absent = Claude Haiku fallback for classification).';
COMMENT ON COLUMN public.tenant_api_keys.vault_secret_id
    IS 'UUID of vault.secrets row containing the encrypted API key. Written by store-tenant-api-key Edge Function.';
COMMENT ON COLUMN public.tenant_api_keys.key_hint
    IS 'Masked key display: first 8 + "..." + last 4 chars. Safe for UI/logs. Never the full key.';
COMMENT ON COLUMN public.tenant_api_keys.status
    IS 'active: valid and in use. invalid: bot found it rejected (async). revoked: tenant deleted it.';
COMMENT ON COLUMN public.tenant_api_keys.validated_at
    IS 'When the key was last successfully validated against the Anthropic/OpenAI API.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Primary key index (automatic)
-- UNIQUE constraint on (tenant_id, key_type) already provides the main lookup index

-- Admin: find tenants with invalid keys for support triage
CREATE INDEX idx_tenant_api_keys_status_invalid
    ON public.tenant_api_keys (tenant_id, updated_at)
    WHERE status = 'invalid';

-- Admin metrics: count tenants with OpenAI configured
CREATE INDEX idx_tenant_api_keys_type_active
    ON public.tenant_api_keys (key_type)
    WHERE status = 'active';

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

CREATE TRIGGER tenant_api_keys_updated_at
    BEFORE UPDATE ON public.tenant_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can see key metadata (hint, status, validated_at) for their tenant
-- vault_secret_id is visible but useless to browsers (no Vault access)
CREATE POLICY tenant_api_keys_select
    ON public.tenant_api_keys
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id
            FROM public.tenant_members
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: BLOCKED for all authenticated JWT users
-- All inserts go through the store-tenant-api-key Edge Function (service role)
-- No INSERT policy = PostgREST returns 42501 insufficient_privilege
-- (No CREATE POLICY for INSERT — intentional)

-- UPDATE: BLOCKED for all authenticated JWT users
-- Bot updates status via service role. Key replacement goes through Edge Function.
-- (No CREATE POLICY for UPDATE — intentional)

-- DELETE: BLOCKED for all authenticated JWT users
-- Revocation goes through revoke-tenant-api-key Edge Function (service role).
-- (No CREATE POLICY for DELETE — intentional)

-- ─── REALTIME ─────────────────────────────────────────────────────────────────

-- Bot subscribes to INSERT (new key → attempt tenant startup)
-- Bot subscribes to UPDATE (key replaced → hot-reload; key revoked → disconnect tenant)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_api_keys;

COMMIT;
```

**Rollback:**
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.tenant_api_keys;
DROP TABLE IF EXISTS public.tenant_api_keys;
```

---

## Migration 005: Create `tenant_service_connections` Table

**File:** `20260400000005_create_tenant_service_connections.sql`

```sql
-- Migration: 20260400000005_create_tenant_service_connections.sql
-- Purpose: Third-party service credentials per tenant (GitHub, Google, Linear, Toggl).
--          OAuth tokens and API keys stored via Supabase Vault.
-- Depends on: 20260400000001_create_tenants.sql
--             20260400000000_create_enums.sql (service_connection_status, service_auth_type)
-- Safety: Additive only

BEGIN;

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE public.tenant_service_connections (
    -- Primary identification
    id                      UUID                                    NOT NULL DEFAULT gen_random_uuid(),
    tenant_id               UUID                                    NOT NULL,

    -- Service identity
    service                 TEXT                                    NOT NULL,
    auth_type               public.service_auth_type                NOT NULL,

    -- Vault references (never store plaintext tokens)
    vault_secret_id         UUID                                    NOT NULL,
    refresh_vault_secret_id UUID                                    NULL,

    -- OAuth token management
    token_expires_at        TIMESTAMPTZ                             NULL,
    scopes                  TEXT[]                                  NOT NULL DEFAULT '{}',

    -- Service-specific metadata (non-sensitive: user IDs, display names, workspace IDs)
    metadata                JSONB                                   NOT NULL DEFAULT '{}',

    -- Status
    status                  public.service_connection_status        NOT NULL DEFAULT 'connected',
    error_message           TEXT                                    NULL,

    -- Audit
    connected_by_user_id    UUID                                    NULL,
    connected_at            TIMESTAMPTZ                             NOT NULL DEFAULT NOW(),
    last_used_at            TIMESTAMPTZ                             NULL,
    updated_at              TIMESTAMPTZ                             NOT NULL DEFAULT NOW(),

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
        ),
    CONSTRAINT tenant_service_connections_error_message_length
        CHECK (error_message IS NULL OR char_length(error_message) <= 500)
);

COMMENT ON TABLE public.tenant_service_connections
    IS 'Third-party service credentials per tenant. One row per service (GitHub/Google/Linear/Toggl). Vault-encrypted tokens.';
COMMENT ON COLUMN public.tenant_service_connections.service
    IS 'Service name: github, google, linear, toggl. Constrained by CHECK. Add via ALTER TABLE DROP/ADD CONSTRAINT.';
COMMENT ON COLUMN public.tenant_service_connections.vault_secret_id
    IS 'OAuth access token (OAuth) or API key (api_key). Created by OAuth callback route via vault.create_secret().';
COMMENT ON COLUMN public.tenant_service_connections.refresh_vault_secret_id
    IS 'OAuth refresh token vault ID. NULL for API key, GitHub, Linear (no refresh needed). Non-NULL for Google.';
COMMENT ON COLUMN public.tenant_service_connections.token_expires_at
    IS 'OAuth token expiry. Only non-NULL for Google (expires in 3600s). NULL for GitHub, Linear, Toggl.';
COMMENT ON COLUMN public.tenant_service_connections.scopes
    IS 'OAuth scopes granted at authorization. Empty array for API key services.';
COMMENT ON COLUMN public.tenant_service_connections.metadata
    IS 'Non-sensitive service data: user ID, email, display name, workspace IDs. Set by OAuth callback. Read by bot for ToolContext.';
COMMENT ON COLUMN public.tenant_service_connections.last_used_at
    IS 'Set by bot when credential is read for a tool call. Non-critical, async update.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Primary lookup: all connections for a tenant (integrations page load, bot startup)
CREATE INDEX idx_tenant_service_connections_tenant_id
    ON public.tenant_service_connections (tenant_id);

-- Bot startup: connected services per tenant
CREATE INDEX idx_tenant_service_connections_tenant_status
    ON public.tenant_service_connections (tenant_id, status);

-- Google token refresh job: find near-expiry Google tokens
CREATE INDEX idx_tenant_service_connections_token_expires_at
    ON public.tenant_service_connections (token_expires_at)
    WHERE token_expires_at IS NOT NULL AND status = 'connected';

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

CREATE TRIGGER tenant_service_connections_updated_at
    BEFORE UPDATE ON public.tenant_service_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.tenant_service_connections ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can see all service connection records (metadata, status)
CREATE POLICY tenant_service_connections_select
    ON public.tenant_service_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- INSERT: only owners and admins can connect a new service
CREATE POLICY tenant_service_connections_insert_admin
    ON public.tenant_service_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- UPDATE: only owners and admins can update (status changes, metadata refresh)
CREATE POLICY tenant_service_connections_update_admin
    ON public.tenant_service_connections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- DELETE: only owners and admins can delete (hard delete, normally done via CASCADE from tenant)
-- Normal disconnect uses status='revoked' soft-delete, not hard DELETE
CREATE POLICY tenant_service_connections_delete_admin
    ON public.tenant_service_connections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- ─── REALTIME ─────────────────────────────────────────────────────────────────

-- Bot subscribes to service connection changes for hot-reload of credentials
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_service_connections;

-- ─── SCHEDULED REFRESH JOB ───────────────────────────────────────────────────

-- pg_cron job: refresh Google OAuth tokens proactively every 30 minutes
-- The actual refresh logic runs in the 'refresh-google-tokens' Supabase Edge Function.
-- The cron job POSTs to the Edge Function URL via net.http_post.
-- pg_cron must be enabled: CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
    'refresh-google-tokens',
    '*/30 * * * *',
    $$
    SELECT net.http_post(
        url        := current_setting('app.supabase_functions_url', true) || '/refresh-google-tokens',
        headers    := json_build_object(
                          'Content-Type', 'application/json',
                          'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
                      )::jsonb,
        body       := '{}'::jsonb,
        timeout_ms := 10000
    )
    $$
);

COMMIT;
```

**Rollback:**
```sql
SELECT cron.unschedule('refresh-google-tokens');
ALTER PUBLICATION supabase_realtime DROP TABLE public.tenant_service_connections;
DROP TABLE IF EXISTS public.tenant_service_connections;
```

---

## Migration 006: Create `tenant_subscriptions` Table

**File:** `20260400000006_create_tenant_subscriptions.sql`

```sql
-- Migration: 20260400000006_create_tenant_subscriptions.sql
-- Purpose: Stripe subscription records per tenant. Synced by Stripe webhook handler.
--          Triggers plan cascade to tenants.plan on every status change.
-- Depends on: 20260400000001_create_tenants.sql
--             20260400000000_create_enums.sql (subscription_status, tenant_plan)
-- Safety: Additive only

BEGIN;

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE public.tenant_subscriptions (
    -- Primary identification
    id                      UUID                        NOT NULL DEFAULT gen_random_uuid(),
    tenant_id               UUID                        NOT NULL,

    -- Stripe identifiers
    stripe_subscription_id  TEXT                        NOT NULL,
    stripe_customer_id      TEXT                        NOT NULL,
    stripe_price_id         TEXT                        NOT NULL,
    stripe_product_id       TEXT                        NOT NULL,

    -- Plan and billing
    plan                    public.tenant_plan          NOT NULL,
    status                  public.subscription_status  NOT NULL,
    billing_interval        TEXT                        NOT NULL DEFAULT 'month',

    -- Billing period
    current_period_start    TIMESTAMPTZ                 NOT NULL,
    current_period_end      TIMESTAMPTZ                 NOT NULL,
    trial_start             TIMESTAMPTZ                 NULL,
    trial_end               TIMESTAMPTZ                 NULL,
    cancel_at               TIMESTAMPTZ                 NULL,
    canceled_at             TIMESTAMPTZ                 NULL,
    ended_at                TIMESTAMPTZ                 NULL,

    -- Webhook tracking
    stripe_event_id         TEXT                        NOT NULL,
    raw_event               JSONB                       NOT NULL DEFAULT '{}',

    -- Audit
    created_at              TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tenant_subscriptions_pkey
        PRIMARY KEY (id),
    CONSTRAINT tenant_subscriptions_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT tenant_subscriptions_tenant_unique
        UNIQUE (tenant_id),
    CONSTRAINT tenant_subscriptions_stripe_subscription_id_unique
        UNIQUE (stripe_subscription_id),
    CONSTRAINT tenant_subscriptions_billing_interval_check
        CHECK (billing_interval IN ('month', 'year')),
    CONSTRAINT tenant_subscriptions_period_order
        CHECK (current_period_end > current_period_start)
);

COMMENT ON TABLE public.tenant_subscriptions
    IS 'Stripe subscription records per tenant. Synced by webhook handler. UNIQUE (tenant_id) — one sub per tenant.';
COMMENT ON COLUMN public.tenant_subscriptions.stripe_subscription_id
    IS 'Stripe Subscription ID (format: sub_XXXXXXXXXXXXXXXXX). Unique per subscription.';
COMMENT ON COLUMN public.tenant_subscriptions.stripe_customer_id
    IS 'Denormalized copy of tenants.stripe_customer_id for fast webhook lookups.';
COMMENT ON COLUMN public.tenant_subscriptions.stripe_price_id
    IS 'Stripe Price ID (format: price_XXXXXXXXXXXXXXXXX). Identifies the specific price object.';
COMMENT ON COLUMN public.tenant_subscriptions.stripe_product_id
    IS 'Stripe Product ID (format: prod_XXXXXXXXXXXXXXXXX). Identifies starter or pro product.';
COMMENT ON COLUMN public.tenant_subscriptions.plan
    IS 'Derived plan: starter or pro, based on stripe_product_id. Free tier has no subscription row.';
COMMENT ON COLUMN public.tenant_subscriptions.status
    IS 'Mirrors Stripe subscription status. Cascade trigger syncs tenants.plan when this changes.';
COMMENT ON COLUMN public.tenant_subscriptions.billing_interval
    IS 'month or year. Determines the period displayed on the billing page.';
COMMENT ON COLUMN public.tenant_subscriptions.cancel_at
    IS 'Scheduled cancellation date (cancel_at_period_end). NULL if not scheduled to cancel.';
COMMENT ON COLUMN public.tenant_subscriptions.stripe_event_id
    IS 'Stripe event ID of the most recent webhook that updated this row. Used for idempotency.';
COMMENT ON COLUMN public.tenant_subscriptions.raw_event
    IS 'Full Stripe event payload JSON. Stored for debugging and audit. Not used by application logic.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Webhook handler: look up subscription by Stripe ID (most frequent webhook query)
-- Already covered by UNIQUE constraint index on stripe_subscription_id

-- Billing page: get subscription for a tenant
-- Already covered by UNIQUE constraint index on tenant_id

-- Admin panel: filter by plan and status
CREATE INDEX idx_tenant_subscriptions_plan_status
    ON public.tenant_subscriptions (plan, status);

-- Webhook idempotency: check if event already processed
CREATE INDEX idx_tenant_subscriptions_stripe_event_id
    ON public.tenant_subscriptions (stripe_event_id);

-- Billing page: tenants in past_due or canceled — for admin alert/dunning
CREATE INDEX idx_tenant_subscriptions_status_dunning
    ON public.tenant_subscriptions (status, current_period_end)
    WHERE status IN ('past_due', 'unpaid', 'canceled');

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE TRIGGER tenant_subscriptions_updated_at
    BEFORE UPDATE ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Plan cascade trigger: sync tenants.plan whenever subscription status or plan changes
-- This is the authoritative plan-sync mechanism. The Stripe webhook handler calls:
--   INSERT INTO tenant_subscriptions ... ON CONFLICT (tenant_id) DO UPDATE ...
-- which fires this trigger and updates tenants.plan + tenants.status automatically.

CREATE OR REPLACE FUNCTION public.sync_tenant_plan_from_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_effective_plan public.tenant_plan;
    v_effective_status public.tenant_status;
BEGIN
    -- Determine the effective plan from the subscription
    -- Active / trialing subscriptions → use subscription plan (starter or pro)
    -- Canceled / past_due / incomplete_expired / unpaid → downgrade to free
    -- past_due → keep current plan but mark tenant status unchanged (Stripe may recover)
    IF NEW.status IN ('active', 'trialing') THEN
        v_effective_plan := NEW.plan;
    ELSIF NEW.status IN ('past_due') THEN
        -- Keep current plan during grace period; do not downgrade immediately
        -- The webhook handler has already retried; Stripe manages the retry window
        v_effective_plan := NEW.plan;
    ELSE
        -- canceled, incomplete, incomplete_expired, unpaid, paused → free
        v_effective_plan := 'free';
    END IF;

    -- Update tenants.plan to match
    UPDATE public.tenants
    SET
        plan       = v_effective_plan,
        updated_at = NOW()
    WHERE id = NEW.tenant_id;

    -- Log the sync for debugging (visible in Supabase logs)
    RAISE NOTICE 'Plan sync: tenant_id=% subscription_status=% → tenants.plan=%',
        NEW.tenant_id, NEW.status, v_effective_plan;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_tenant_plan_from_subscription()
    IS 'Trigger function: syncs tenants.plan whenever tenant_subscriptions.status or .plan changes.';

CREATE TRIGGER tenant_subscriptions_plan_cascade
    AFTER INSERT OR UPDATE OF status, plan ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_tenant_plan_from_subscription();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant owners can read their own subscription record
-- Admins and members: read access for billing page display
CREATE POLICY tenant_subscriptions_select
    ON public.tenant_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_subscriptions.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- INSERT: BLOCKED for all authenticated JWT users
-- All inserts come from the Stripe webhook handler (service role via Next.js API route)
-- (No INSERT policy — intentional)

-- UPDATE: BLOCKED for all authenticated JWT users
-- All updates come from the Stripe webhook handler (service role via Next.js API route)
-- (No UPDATE policy — intentional)

-- DELETE: BLOCKED for all authenticated JWT users
-- Subscriptions are never hard-deleted; status transitions to 'canceled'
-- (No DELETE policy — intentional)

COMMIT;
```

**Rollback:**
```sql
DROP TRIGGER IF EXISTS tenant_subscriptions_plan_cascade ON public.tenant_subscriptions;
DROP FUNCTION IF EXISTS public.sync_tenant_plan_from_subscription();
DROP TABLE IF EXISTS public.tenant_subscriptions;
```

---

## Deployment Instructions

### Running Migrations in the Supabase Dashboard

1. Open Supabase Dashboard → SQL Editor
2. Run migrations in strict order: 000 → 001 → 002 → 003 → 004 → 005 → 006
3. Each migration is wrapped in `BEGIN; ... COMMIT;` — it will atomically succeed or roll back
4. After each migration, verify in Table Editor that the new table exists with correct columns
5. For migration 003: verify the `get_decrypted_secret` function exists in Functions section

### Running Migrations via Supabase CLI

```bash
# From project root directory:
cd projects/decision-orchestrator

# Apply all pending migrations:
supabase db push

# Or apply to production via linked project:
supabase db push --linked

# Verify migration status:
supabase db diff
```

### Migration File Placement

Place migration files in:
```
projects/decision-orchestrator/supabase/migrations/
├── 20260400000000_create_enums.sql
├── 20260400000001_create_tenants.sql
├── 20260400000002_create_tenant_members.sql
├── 20260400000003_create_discord_connections.sql
├── 20260400000004_create_tenant_api_keys.sql
├── 20260400000005_create_tenant_service_connections.sql
└── 20260400000006_create_tenant_subscriptions.sql
```

The timestamp prefix `20260400000000` ensures these migrations sort after the last existing migration (`20260303120000_enable_discord_bot_reader_login.sql`).

### Verification Queries

After running all migrations, run these queries to confirm correctness:

```sql
-- Verify all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'tenants', 'tenant_members', 'discord_connections',
      'tenant_api_keys', 'tenant_service_connections', 'tenant_subscriptions'
  )
ORDER BY table_name;
-- Expected: 6 rows

-- Verify all enum types exist
SELECT typname
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e'
  AND typname IN (
      'tenant_plan', 'tenant_status', 'tenant_member_role',
      'discord_connection_status', 'service_connection_status',
      'subscription_status', 'api_key_type', 'service_auth_type'
  )
ORDER BY typname;
-- Expected: 8 rows

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
      'tenants', 'tenant_members', 'discord_connections',
      'tenant_api_keys', 'tenant_service_connections', 'tenant_subscriptions'
  )
ORDER BY tablename;
-- Expected: 6 rows, all with rowsecurity = true

-- Verify get_decrypted_secret function exists
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'get_decrypted_secret';
-- Expected: 1 row with prosecdef = true

-- Verify plan cascade trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'tenant_subscriptions_plan_cascade';
-- Expected: 2 rows (INSERT and UPDATE trigger events)

-- Verify Realtime publications
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN (
      'tenants', 'discord_connections',
      'tenant_api_keys', 'tenant_service_connections'
  )
ORDER BY tablename;
-- Expected: 4 rows

-- Verify cron job registered
SELECT jobname, schedule
FROM cron.job
WHERE jobname = 'refresh-google-tokens';
-- Expected: 1 row, schedule = '*/30 * * * *'
```

---

## Full Rollback Procedure

To revert all 7 migrations (in reverse order):

```sql
BEGIN;

-- Remove cron job
SELECT cron.unschedule('refresh-google-tokens');

-- Remove Realtime publications
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tenant_subscriptions;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tenant_service_connections;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tenant_api_keys;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.discord_connections;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tenant_members;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tenants;

-- Drop triggers
DROP TRIGGER IF EXISTS tenant_subscriptions_plan_cascade ON public.tenant_subscriptions;
DROP TRIGGER IF EXISTS tenant_subscriptions_updated_at ON public.tenant_subscriptions;
DROP TRIGGER IF EXISTS tenant_service_connections_updated_at ON public.tenant_service_connections;
DROP TRIGGER IF EXISTS tenant_api_keys_updated_at ON public.tenant_api_keys;
DROP TRIGGER IF EXISTS discord_connections_updated_at ON public.discord_connections;
DROP TRIGGER IF EXISTS tenants_updated_at ON public.tenants;

-- Drop functions
DROP FUNCTION IF EXISTS public.sync_tenant_plan_from_subscription();
DROP FUNCTION IF EXISTS public.get_decrypted_secret(UUID);

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS public.tenant_subscriptions;
DROP TABLE IF EXISTS public.tenant_service_connections;
DROP TABLE IF EXISTS public.tenant_api_keys;
DROP TABLE IF EXISTS public.discord_connections;
DROP TABLE IF EXISTS public.tenant_members;
DROP TABLE IF EXISTS public.tenants;

-- Drop enum types (after all tables that reference them are dropped)
DROP TYPE IF EXISTS public.service_auth_type;
DROP TYPE IF EXISTS public.api_key_type;
DROP TYPE IF EXISTS public.subscription_status;
DROP TYPE IF EXISTS public.service_connection_status;
DROP TYPE IF EXISTS public.discord_connection_status;
DROP TYPE IF EXISTS public.tenant_member_role;
DROP TYPE IF EXISTS public.tenant_status;
DROP TYPE IF EXISTS public.tenant_plan;

COMMIT;
```

**Note:** Rollback is destructive and permanent. All tenant data, connections, subscriptions, and encrypted Vault secret references are deleted. Run only in development or after verified backup.

---

## Additive Nature — Why These Migrations Are Safe

Every migration in this set is **purely additive** — creating new objects without modifying existing ones:

| What Changes | Existing Tables Affected | Risk |
|-------------|--------------------------|------|
| CREATE TYPE | None | None — new types |
| CREATE TABLE | None | None — new tables |
| CREATE INDEX | None | None — new indexes |
| CREATE TRIGGER | New tables only | None |
| CREATE FUNCTION | None | None — new function |
| ALTER TABLE ENABLE ROW LEVEL SECURITY | New tables only | None |
| CREATE POLICY | New tables only | None |
| ALTER PUBLICATION ADD TABLE | None (adds new tables) | None |
| SELECT cron.schedule() | None | None |

The existing bot tables (`sessions`, `messages`, `meeting_sessions`, `thread_tool_contexts`, `discord_archive`, etc.) and their RLS policies, indexes, and triggers are completely unchanged. The existing bot codebase will continue to function identically after these migrations run.

The only shared resource is the `update_updated_at_column()` function, which is referenced (not modified) by the new triggers. This function already exists and is stable.

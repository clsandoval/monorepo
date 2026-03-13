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

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
-- Guarded: only runs if pg_cron extension is available (not in local dev).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.schedule(
            'refresh-google-tokens',
            '*/30 * * * *',
            $cron$
            SELECT net.http_post(
                url        := current_setting('app.supabase_functions_url', true) || '/refresh-google-tokens',
                headers    := json_build_object(
                                  'Content-Type', 'application/json',
                                  'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
                              )::jsonb,
                body       := '{}'::jsonb,
                timeout_ms := 10000
            )
            $cron$
        );
    END IF;
END;
$$;

COMMIT;

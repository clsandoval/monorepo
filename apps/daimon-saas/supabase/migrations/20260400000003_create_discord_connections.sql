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

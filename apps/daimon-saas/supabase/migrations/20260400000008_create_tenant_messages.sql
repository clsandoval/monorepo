-- Migration: 20260400000008_create_tenant_messages.sql
-- Purpose: Lightweight message event log for dashboard QuickStats counts
-- Safety: Additive only — new table, no modifications to existing objects
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

-- Composite index: covers "Messages Today" and "Messages (30 days)" dashboard queries
-- Pattern: SELECT COUNT(*) FROM tenant_messages WHERE tenant_id = $1 AND created_at >= $ts
CREATE INDEX idx_tenant_messages_tenant_id_created_at
    ON public.tenant_messages (tenant_id, created_at DESC);

ALTER TABLE public.tenant_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can read their tenant's message log for dashboard display
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

-- INSERT: BLOCKED for all JWT users — bot writes via service role
-- No INSERT policy — intentional. Bot uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.

-- UPDATE: BLOCKED — rows are immutable once written (event log)
-- DELETE: BLOCKED — cleanup is handled by the pg_cron retention job (service role)

COMMENT ON TABLE public.tenant_messages
    IS 'Lightweight event log for messages processed by the bot per tenant. No message content stored — routing metadata only. Used for dashboard QuickStats counts.';
COMMENT ON COLUMN public.tenant_messages.guild_id
    IS 'Discord guild (server) ID where the message was sent.';
COMMENT ON COLUMN public.tenant_messages.channel_id
    IS 'Discord channel ID where the message was sent.';
COMMENT ON COLUMN public.tenant_messages.message_type
    IS 'Type of message: mention (bot was @-mentioned), dm (direct message), command (slash command).';

COMMIT;

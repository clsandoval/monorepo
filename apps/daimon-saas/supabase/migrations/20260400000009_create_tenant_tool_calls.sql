-- Migration: 20260400000009_create_tenant_tool_calls.sql
-- Purpose: Lightweight event log for MCP tool calls per tenant — used for dashboard QuickStats counts
-- Safety: Additive only — new table, no modifications to existing objects
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

-- Composite index: covers "Tool Uses Today" dashboard count queries
-- Pattern: SELECT COUNT(*) FROM tenant_tool_calls WHERE tenant_id = $1 AND created_at >= $start_of_day
CREATE INDEX idx_tenant_tool_calls_tenant_id_created_at
    ON public.tenant_tool_calls (tenant_id, created_at DESC);

ALTER TABLE public.tenant_tool_calls ENABLE ROW LEVEL SECURITY;

-- SELECT: tenant members can read their tenant's tool call log for dashboard display
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

-- INSERT: BLOCKED for all JWT users — bot writes via service role
-- No INSERT policy — intentional. Bot uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.

-- UPDATE: BLOCKED — rows are immutable once written (event log)
-- DELETE: BLOCKED — cleanup is handled by the pg_cron retention job (service role)

COMMENT ON TABLE public.tenant_tool_calls
    IS 'Lightweight event log for MCP tool calls made by the bot per tenant. Used for dashboard QuickStats counts. Rolling 90-day retention.';
COMMENT ON COLUMN public.tenant_tool_calls.tool_name
    IS 'MCP tool name as registered in ToolRegistry (e.g., discord_send_message, toggl_create_time_entry).';
COMMENT ON COLUMN public.tenant_tool_calls.success
    IS 'Whether the tool call completed without error. FALSE if the tool raised an exception or returned an error result.';
COMMENT ON COLUMN public.tenant_tool_calls.duration_ms
    IS 'Wall-clock time in milliseconds from tool call start to return. NULL if timing not recorded.';

-- pg_cron retention job: delete rows older than 90 days (daily at 03:05 UTC)
-- Staggered 5 minutes after tenant_messages cleanup to avoid overlapping I/O.
-- Guarded: only runs if pg_cron extension is available (not in local dev).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.schedule(
            'cleanup-tenant-tool-calls',
            '5 3 * * *',
            $cron$DELETE FROM public.tenant_tool_calls WHERE created_at < NOW() - INTERVAL '90 days'$cron$
        );
    END IF;
END;
$$;

COMMIT;

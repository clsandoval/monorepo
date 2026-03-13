-- Migration: 20260400000002_create_tenant_members.sql
-- Purpose: Maps auth.users to tenants with a role. Source of truth for RLS membership checks.
--          Also adds the deferred tenants SELECT/UPDATE/DELETE RLS policies that reference this table.
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

-- ─── ROW LEVEL SECURITY (tenant_members) ─────────────────────────────────────

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

-- ─── DEFERRED tenants RLS POLICIES ───────────────────────────────────────────
-- These policies were deferred from 20260400000001_create_tenants.sql because
-- PostgreSQL validates subquery relations at policy-creation time, and
-- tenant_members did not exist yet.

-- SELECT: any tenant member can read their tenant row
CREATE POLICY tenants_select_member
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
        )
    );

-- UPDATE: owners and admins can update tenant settings
CREATE POLICY tenants_update_admin
    ON public.tenants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- DELETE: only owner can delete tenant
CREATE POLICY tenants_delete_owner
    ON public.tenants
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    );

COMMIT;

-- Migration: 20260400000001_create_tenants.sql
-- Purpose: Create the tenants table — top-level organizational unit for Daimon SaaS
-- Depends on: 20260400000000_create_enums.sql (tenant_plan, tenant_status)
-- Safety: Additive only

BEGIN;

-- ─── SHARED TRIGGER FUNCTION ─────────────────────────────────────────────────
-- update_updated_at_column() is pre-existing in production (created by
-- 20251104000000_create_discord_workflow_system.sql). Using CREATE OR REPLACE
-- here so local dev environments also have it without erroring on prod.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

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

-- INSERT: authenticated users can create tenants for themselves
-- (owner_id must equal the caller's auth.uid())
CREATE POLICY tenants_insert_owner
    ON public.tenants
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

-- NOTE: SELECT / UPDATE / DELETE policies referencing public.tenant_members
-- are deferred to 20260400000002_create_tenant_members.sql because
-- PostgreSQL validates subquery relations at policy-creation time.
-- See loops/daimon-forward/frontier/spec-gaps.md

-- ─── REALTIME ─────────────────────────────────────────────────────────────────

-- Bot subscribes to tenant status changes (e.g., suspended) via Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;

COMMIT;

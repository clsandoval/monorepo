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

    -- Period timestamps
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
CREATE OR REPLACE FUNCTION public.sync_tenant_plan_from_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_effective_plan public.tenant_plan;
BEGIN
    -- Active / trialing subscriptions → use subscription plan (starter or pro)
    -- Canceled / past_due / incomplete_expired / unpaid → downgrade to free
    v_effective_plan := CASE
        WHEN NEW.status IN ('active', 'trialing') THEN NEW.plan
        WHEN NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') THEN 'free'::public.tenant_plan
        ELSE NEW.plan
    END;

    UPDATE public.tenants
    SET
        plan       = v_effective_plan,
        updated_at = NOW()
    WHERE id = NEW.tenant_id;

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

-- SELECT: tenant members can read their own subscription record
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

-- UPDATE: BLOCKED for all authenticated JWT users
-- All updates come from the Stripe webhook handler (service role via Next.js API route)

-- DELETE: BLOCKED for all authenticated JWT users
-- Subscriptions are never hard-deleted; status transitions to 'canceled'

COMMIT;

-- Migration: 20260400000007_create_stripe_webhook_events.sql
-- Purpose: Stripe webhook idempotency store — prevents double-processing of at-least-once events
-- Safety: Additive only — new table, no modifications to existing objects
BEGIN;

CREATE TABLE public.stripe_webhook_events (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    stripe_event_id     TEXT        NOT NULL,
    event_type          TEXT        NOT NULL,
    processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT stripe_webhook_events_pkey
        PRIMARY KEY (id),
    CONSTRAINT stripe_webhook_events_stripe_event_id_unique
        UNIQUE (stripe_event_id)
);

-- Index: retention cleanup — find rows older than 90 days
CREATE INDEX idx_stripe_webhook_events_processed_at
    ON public.stripe_webhook_events (processed_at);

-- Index: admin/debugging — look up events by type
CREATE INDEX idx_stripe_webhook_events_event_type_processed_at
    ON public.stripe_webhook_events (event_type, processed_at DESC);

-- RLS: enabled but NO policies — service role only
-- The Next.js Stripe webhook handler uses SUPABASE_SERVICE_ROLE_KEY.
-- JWT-authenticated users cannot SELECT, INSERT, UPDATE, or DELETE.
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.stripe_webhook_events
    IS 'Idempotency store for Stripe webhook events. Prevents double-processing on at-least-once delivery.';
COMMENT ON COLUMN public.stripe_webhook_events.stripe_event_id
    IS 'Stripe event ID (evt_XXXXXXXXXXXXXXXXX). UNIQUE — used for ON CONFLICT DO NOTHING deduplication.';
COMMENT ON COLUMN public.stripe_webhook_events.event_type
    IS 'Stripe event type string, e.g. customer.subscription.updated. Stored for debugging.';
COMMENT ON COLUMN public.stripe_webhook_events.processed_at
    IS 'When the event was first received. Used by the 90-day retention cleanup job.';

COMMIT;

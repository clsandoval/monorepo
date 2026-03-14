-- Enable Realtime on tenant_subscriptions table so the billing page
-- can reactively update subscription lifecycle state changes
-- (trialing → active, active → past_due, cancel_at_period_end, etc.)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_subscriptions;

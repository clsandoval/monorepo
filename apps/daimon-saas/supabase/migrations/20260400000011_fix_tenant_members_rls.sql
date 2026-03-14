-- Fix tenant_members_select RLS policy: the original self-referential USING clause
-- causes infinite recursion in PostgreSQL when tenant_members is queried directly
-- by an authenticated user (confirmed via `infinite recursion detected in policy`).
--
-- The fix: use `user_id = auth.uid()` so each user can see their own membership row(s).
-- This is sufficient for all current use cases (resolving tenant_id from user_id).
-- Team member listing (seeing other members) will use a security-definer function when needed.

DROP POLICY IF EXISTS tenant_members_select ON public.tenant_members;

CREATE POLICY tenant_members_select
    ON public.tenant_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

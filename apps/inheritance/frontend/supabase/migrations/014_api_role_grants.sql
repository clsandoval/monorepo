-- 014_api_role_grants.sql
--
-- Grants the PostgREST API roles the table privileges every database-backed
-- screen in this application needs, and which no `public` table grants today.
--
-- MEASURED CAUSE. Not one `public` table grants any DML verb (INSERT, SELECT,
-- UPDATE, DELETE) to `anon`, `authenticated` or `service_role`. A real password
-- grant for a seeded user succeeds and returns an access token, but
-- `GET /rest/v1/organizations` with that token answers HTTP 403 with PostgREST's
-- own hint: `Grant the required privileges to the current role with: GRANT
-- SELECT ON public.organizations TO authenticated;`.
--
-- The cause was read out of `pg_default_acl`: the `postgres`-owned default ACL
-- for schema `public` is
--   anon=Dxtm/postgres,authenticated=Dxtm/postgres,service_role=Dxtm/postgres
-- and the privilege string `Dxtm` is TRUNCATE, REFERENCES, TRIGGER, MAINTAIN.
-- It contains none of INSERT, SELECT, UPDATE or DELETE. The default ACL applied;
-- it simply never carried DML. All eleven `public` tables carry that same ACL,
-- and a full `supabase db reset` reproduces it, so this is a property of the
-- committed migration set rather than of one machine's drift.
--
-- WHY THIS DOES NOT WIDEN ROW VISIBILITY. Row-level security is enabled on all
-- eleven tables (`010_rls_org_scope.sql`). A table grant is the outer gate;
-- RLS is the inner one, and it still decides which rows a grant can reach. A
-- signed-in user therefore gains access to their own organization's rows only.
--
-- WHY `anon` IS GRANTED NOTHING. The only anonymous data path in this product
-- is `get_shared_case`, which is `SECURITY DEFINER` and to which
-- `004_shared_case_rpc.sql` already grants EXECUTE for the `anon` role.
-- Granting `anon` a table privilege would create a second, unintended
-- anonymous surface. The Supabase boilerplate that grants ALL on ALL TABLES in
-- schema public to `anon`, `authenticated` and `service_role` at once is
-- deliberately NOT used here.
--
-- Below, the `anon` role is named on exactly one line — the schema-usage grant.
-- Grepping this file for a grant naming the anonymous role is therefore
-- expected to return exactly one hit, and that is an intentional, checkable
-- property rather than an accident of wording.
--
-- The per-table verbs below are transcribed from the policy map read out of
-- `pg_policies`: each table receives exactly the verbs it has a policy for, no
-- more and no fewer. `organizations` has no INSERT and no DELETE policy because
-- organizations are created by the `create_organization` RPC and are never
-- deleted by the product, so granting those verbs would be inert.

-- --------------------------------------------------------------------------
-- 1. Schema usage
-- --------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- --------------------------------------------------------------------------
-- 2. Per-table, per-verb grants to `authenticated`
-- --------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_deadlines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_documents TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.case_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_pdfs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT ON public.conflict_check_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organization_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- --------------------------------------------------------------------------
-- 3. `service_role`
-- --------------------------------------------------------------------------
--
-- `service_role` bypasses RLS and is the identity every seeding and isolation
-- script runs as. It receives the four DML verbs across the schema.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

-- --------------------------------------------------------------------------
-- 4. Future tables
-- --------------------------------------------------------------------------
--
-- Without this, the next migration that creates a table reintroduces the exact
-- defect this file corrects. `anon` is deliberately absent here too.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

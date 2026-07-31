-- 015_shared_case_single_signature.sql
--
-- Collapses `get_shared_case` to exactly one signature, taking `UUID`.
--
-- THREE MEASURED FACTS. All three were observed on a stack freshly created by
-- `supabase db reset`, so they are properties of the committed migration set.
--
--   1. Both overloads exist after a reset. `004_shared_case_rpc.sql` creates the
--      `UUID` form; `011_create_org_rpc.sql` creates a `TEXT` form afterwards.
--      `004` opens with `DROP FUNCTION IF EXISTS get_shared_case(TEXT)`, but
--      that runs before `011` ever creates the TEXT form, so it drops nothing
--      and the two coexist.
--
--   2. PostgREST cannot choose between them. A call to `/rest/v1/rpc/
--      get_shared_case` answers HTTP 300 with `PGRST203 Could not choose the
--      best candidate function between: public.get_shared_case(p_token => text),
--      public.get_shared_case(p_token => uuid)`. The consequence in the built
--      application is that `/share/<token>` renders `Case Not Found` even for a
--      case whose `share_enabled` is TRUE — the share feature is dead for every
--      token.
--
--   3. The TEXT form has never worked on its own either. With the UUID form
--      dropped, calling the TEXT form raises `42883 operator does not exist:
--      uuid = text`, because `cases.share_token` is `uuid` and the body compares
--      it to the `TEXT` parameter with no cast. So dropping the TEXT overload
--      removes a function that has never returned a row, not a working feature.
--
-- WHY THE `UUID` FORM IS THE ONE RETAINED. It works, and its six returned
-- columns are exactly the six fields `src/lib/share.ts` declares on
-- `SharedCaseData`: title, status, input_json, output_json, decedent_name,
-- date_of_death. The TEXT form's eight-column shape returned two extra columns
-- (the tax and comparison output blobs) that no client reads, and widening what
-- an anonymous share link exposes is a decision this plan does not contain — so
-- the narrower, working shape is kept. Neither extra column name appears
-- anywhere in this file, which is checkable.
--
-- The body below is re-stated in full rather than left to `004`, so that the
-- final surviving signature is independent of migration ordering.

DROP FUNCTION IF EXISTS public.get_shared_case(TEXT);

CREATE OR REPLACE FUNCTION get_shared_case(p_token UUID)
RETURNS TABLE (
  title TEXT,
  status TEXT,
  input_json JSONB,
  output_json JSONB,
  decedent_name TEXT,
  date_of_death DATE
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT c.title, c.status::TEXT, c.input_json, c.output_json,
         c.decedent_name, c.date_of_death
  FROM cases c
  WHERE c.share_token = p_token AND c.share_enabled = TRUE;
END; $$;

-- Share links must work without authentication; this is the only anonymous data
-- path in the product, and it is SECURITY DEFINER precisely so it can bypass RLS
-- for the single row a valid token names.
GRANT EXECUTE ON FUNCTION get_shared_case(p_token UUID) TO anon;

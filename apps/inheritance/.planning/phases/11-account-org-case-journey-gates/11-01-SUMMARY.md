---
phase: 11-account-org-case-journey-gates
plan: 01
subsystem: database
tags: [supabase, postgrest, grants, rls, seed, fixtures]
requires: []
provides:
  - "PostgREST DML grants for authenticated and service_role on all eleven public tables"
  - "A single get_shared_case signature taking UUID"
  - "Seeded case_pdfs rows, an org-less user and a pending invitation"
  - "frontend/journey/db-access-probe.mjs"
affects:
  - frontend/supabase/migrations/014_api_role_grants.sql
  - frontend/supabase/migrations/015_shared_case_single_signature.sql
  - frontend/supabase/seed.sql
  - frontend/supabase/fixtures.json
  - frontend/journey/db-access-probe.mjs
tech-stack:
  added: []
  patterns:
    - "Per-table, per-verb grants transcribed from pg_policies rather than a blanket GRANT ALL"
    - "Three-valued script exit contract (0 pass / 1 fail / 2 cannot-run)"
key-files:
  created:
    - frontend/supabase/migrations/014_api_role_grants.sql
    - frontend/supabase/migrations/015_shared_case_single_signature.sql
    - frontend/journey/db-access-probe.mjs
  modified:
    - frontend/supabase/seed.sql
    - frontend/supabase/fixtures.json
key-decisions:
  - "anon receives no table privilege; the only anonymous data path stays the SECURITY DEFINER get_shared_case RPC"
  - "The UUID form of get_shared_case is retained and the TEXT form dropped, because the TEXT form has never worked (42883 uuid = text) and its two extra columns widen what a share link exposes"
requirements-completed: [COV-06]
duration: 21 min
completed: 2026-07-31
---

# Phase 11 Plan 01: PostgREST Role Grants, Single Share Signature, Extended Seed Fixture Summary

Two new migrations that make every database-backed screen reachable — per-table, per-verb PostgREST
grants transcribed from `pg_policies`, and the collapse of the duplicate `get_shared_case` overload
that made `/share/<token>` render `Case Not Found` for every token — plus four new seeded rows and a
probe script that re-proves all of it on demand.

- Tasks: 5 · Files: 5 (3 created, 2 modified) · One commit: `c7ec77880`

## What was built

**`014_api_role_grants.sql`** — `GRANT USAGE ON SCHEMA public` to the three API roles, eleven
per-table grants to `authenticated` whose verbs are exactly the verbs each table has a policy for,
`SELECT, INSERT, UPDATE, DELETE ON ALL TABLES` to `service_role`, and an `ALTER DEFAULT PRIVILEGES`
so the next migration that creates a table does not reintroduce the defect. No statement grants
`anon` a table privilege, and there is no `REVOKE`.

**`015_shared_case_single_signature.sql`** — drops `public.get_shared_case(TEXT)` and re-states the
working `UUID` form in full (six columns, `SECURITY DEFINER`, `search_path = public`), so the
surviving signature does not depend on migration ordering.

**`seed.sql` / `fixtures.json`** — two `case_pdfs` rows (one per tenant), the Orphan user with no
organization and no membership, and one `pending` invitation addressed to that user in Alpha's org.
Cleanup is still id-scoped and never a truncation.

**`journey/db-access-probe.mjs`** — asserts the *effect* rather than the presence of the migrations:
an authenticated Alpha session reads exactly its own org and case; an anonymous read of `cases`
fails with `42501`; the share RPC returns Alpha's row for Alpha's token and nothing for Beta's
disabled one, with `PGRST203` called out by name in the assertion message; and the four isolation
fixture rows exist.

## Verification (real output)

```
$ node scripts/check-seed-fixture.mjs
SEED OK — 2 orgs, 15 ids matched
INPUT COPIED FROM engine/examples/cases/02-married-3lc.json
SEED_FIXTURE_EXIT=0

$ npx supabase db reset --local
Applying migration 014_api_role_grants.sql...
Applying migration 015_shared_case_single_signature.sql...
Seeding data from supabase/seed.sql...
RESET_EXIT=0

$ docker exec supabase_db_inheritance psql -U postgres -d postgres -At -c "select count(*) from case_pdfs;"
2
$ ... "select count(*) from organization_members where user_id='c0000000-0000-4000-8000-000000000002';"
0
$ ... "select count(*) from pg_proc where proname='get_shared_case';"
1
$ ... "select has_table_privilege('authenticated','public.cases','SELECT'), has_table_privilege('anon','public.cases','SELECT');"
t|f

$ node journey/db-access-probe.mjs
DB-ACCESS ok tables=11 anon=denied share=1
PROBE_EXIT=0
$ grep -rn "writeFileSync" journey/db-access-probe.mjs | wc -l
0
```

The failure path was observed firing, not assumed:

```
$ docker exec -i supabase_db_inheritance psql -U postgres -d postgres -c "REVOKE SELECT ON public.cases FROM authenticated;"
REVOKE
$ node journey/db-access-probe.mjs
DB-ACCESS FAILED: authenticated read of cases failed with 42501: permission denied for table cases — migration 014_api_role_grants.sql grants SELECT on public.cases to authenticated
+ actual - expected
+ {
+   code: '42501',
+   hint: 'Grant the required privileges to the current role with: GRANT SELECT ON public.cases TO authenticated;',
+   message: 'permission denied for table cases'
+ }
- null
PROBE_EXIT_AFTER_REVOKE=1

$ npx supabase db reset --local && node journey/db-access-probe.mjs
DB-ACCESS ok tables=11 anon=denied share=1
PROBE_EXIT_AFTER_RESET=0
```

Commit:

```
$ git show --stat --name-only HEAD
apps/inheritance/frontend/journey/db-access-probe.mjs
apps/inheritance/frontend/supabase/fixtures.json
apps/inheritance/frontend/supabase/migrations/014_api_role_grants.sql
apps/inheritance/frontend/supabase/migrations/015_shared_case_single_signature.sql
apps/inheritance/frontend/supabase/seed.sql
$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 144 commit(s) audited, 116 touching apps/inheritance/, 0 mixed
DISCIPLINE_EXIT=0
```

## Deviations from Plan

**[Rule 1 — bug] Comment prose defeated two literal acceptance greps** — Found during: Tasks 1 and 2.
The plan's acceptance criteria are literal `grep -c` counts: `grep -c 'TO anon'` over migration 014
must print `1`, and `grep -c 'tax_output_json'` over migration 015 must print `0`. The first drafts
of both files satisfied the *substance* (one anon-naming statement; the six-column shape) but failed
the *count*, because the mandated explanatory comment blocks quoted those literals in prose. Fix:
reworded the comments to describe the same facts without reproducing the literal strings — no SQL
statement was changed in either file, and no criterion was relaxed. Verification: `grep -c 'TO anon'`
= 1 (line 49, the schema-usage grant), `grep -c 'tax_output_json'` = 0, with `^GRANT` still 13,
`ALTER DEFAULT PRIVILEGES` 1, `REVOKE` 0, `p_token UUID` 2, `share_enabled = TRUE` 1. Commit:
`c7ec77880`.

**Total deviations:** 1 auto-fixed (1 × Rule 1). **Impact:** none on behaviour — comment text only.

## Issues Encountered

None. No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED

All five tasks' acceptance criteria were re-run after the final commit. The plan-level
`<verification>` block (`check-seed-fixture.mjs`, `db-access-probe.mjs`,
`check-plan-closed-world.mjs`, `check-commit-discipline.mjs`) exits 0 on all four:
`PLANS OK — 64 plan file(s), 248 task(s) checked`.

Ready for 11-02.

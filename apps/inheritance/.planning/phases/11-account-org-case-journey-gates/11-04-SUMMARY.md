---
phase: 11-account-org-case-journey-gates
plan: 04
subsystem: verification
tags: [rls, isolation, supabase, cov-06]
requires: ["11-01"]
provides:
  - "frontend/journey/rls-isolation.mjs — the runnable proof of COV-06"
  - "frontend/journey/isolation-cases.json — the committed 14-case table over 4 surfaces"
affects:
  - frontend/journey/rls-isolation.mjs
  - frontend/journey/isolation-cases.json
tech-stack:
  added: []
  patterns:
    - "Every negative assertion paired with a positive control on the same table and verb"
    - "no-rows (RLS) and denied (missing grant) kept as distinct expectations"
key-files:
  created:
    - frontend/journey/rls-isolation.mjs
    - frontend/journey/isolation-cases.json
  modified: []
key-decisions:
  - "The case table keeps all six of its positive controls even though the plan's acceptance criterion said five; deleting one to match the number would have removed a control"
  - "No isolation assertion runs through the service-role client, which bypasses RLS and would make every assertion vacuous"
requirements-completed: [COV-06]
duration: 14 min
completed: 2026-07-31
---

# Phase 11 Plan 04: Tenant Isolation Suite Summary

Fourteen cases across four surfaces — organizations, cases, PDFs and share links — run against the
real local Supabase through real password-grant sessions, each negative paired with a positive
control on the same table with the same verb.

- Tasks: 4 · Files: 2 created · One commit: `0d4eab47d`

## What was built

`isolation-cases.json` is the committed case table: `id`, `surface`, `actor`, `operation`, `expect`,
with no uuid, email or token written literally — the script resolves every id from
`supabase/fixtures.json` at runtime.

`rls-isolation.mjs` establishes preconditions with the service-role client (two seeded `case_pdfs`
rows, both tenants' cases present, Alpha's share enabled and Beta's disabled) and treats a missing
precondition as a **cannot-run**, not a failure — a missing fixture is an environment fact and
reporting it as a failed isolation assertion would send someone hunting a policy bug that is not
there. It then builds one anon client and one real-token client per actor and runs every assertion
through those, never through the admin client.

`no-rows` and `denied` are distinct observed outcomes, so a red run says whether RLS or a missing
grant produced it.

## Verification (real output)

```
$ node journey/rls-isolation.mjs
ISOLATION SURFACE org         pass=2 fail=0
ISOLATION SURFACE cases       pass=6 fail=0
ISOLATION SURFACE pdfs        pass=3 fail=0
ISOLATION SURFACE share-links pass=3 fail=0
GATE-SKIPS total=14 skipped=0
ISOLATION ok cases=14 surfaces=4
ISO_EXIT=0

$ node journey/rls-isolation.mjs      # second consecutive run, byte-identical
ISOLATION ok cases=14 surfaces=4
ISO_EXIT_SECOND=0

$ grep -c "writeFileSync|appendFileSync" journey/rls-isolation.mjs   -> 0
$ docker exec supabase_db_inheritance psql … "select count(*) from case_pdfs;"  -> 2
```

Case table shape:

```
CASES 14
SURFACES cases,org,pdfs,share-links
CONTROLS 6
UUID_LITERALS 0
EXPECTS_CLOSED true
```

**The suite was observed going red on a real regression, not assumed to.** Widening the case policy
to `USING (true)` on the live container:

```
$ docker exec -i supabase_db_inheritance psql -U postgres -d postgres -c \
    'ALTER POLICY "cases_org_member" ON cases USING (true);'
ALTER POLICY

$ node journey/rls-isolation.mjs
ISOLATION FAILED cases-alpha-reads-beta: expected no-rows, got rows
ISOLATION FAILED cases-alpha-updates-beta: expected no-rows, got denied
ISOLATION FAILED share-alpha-enumerates: expected no-rows, got rows
ISOLATION SURFACE org         pass=2 fail=0
ISOLATION SURFACE cases       pass=4 fail=2
ISOLATION SURFACE pdfs        pass=3 fail=0
ISOLATION SURFACE share-links pass=2 fail=1
GATE-SKIPS total=14 skipped=0
ISOLATION FAILED cases=14 failed=3
ISO_EXIT_BROKEN=1
```

Three things worth recording about that output. It named `cases-alpha-reads-beta`, as the plan
required. It also caught `share-alpha-enumerates` — widening the `cases` policy leaks the *other*
tenant's `share_token`, which is precisely the "enumerate org B's shared links" clause of COV-06, and
the per-surface line localised it to `share-links` rather than blaming RLS in general.
And `cases-alpha-updates-beta` flipped from `no-rows` to **`denied`**, not to `rows`: with the USING
clause widened the row became visible to the UPDATE, so Postgres then evaluated the WITH CHECK and
refused with 42501. Keeping `no-rows` and `denied` as distinct outcomes is what made that visible
instead of silently still-passing.

Restored and re-verified:

```
$ npx supabase db reset --local && node journey/rls-isolation.mjs
ISOLATION ok cases=14 surfaces=4
ISO_EXIT_AFTER_RESET=0
```

Commit:

```
$ git show --stat --name-only HEAD
apps/inheritance/frontend/journey/isolation-cases.json
apps/inheritance/frontend/journey/rls-isolation.mjs
$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 150 commit(s) audited, 122 touching apps/inheritance/, 0 mixed
```

## Deviations from Plan

**[Rule 3 — plan arithmetic error] The acceptance criterion `CONTROLS 5` contradicts the plan's own
case table** — Found during: Task 1. The table the plan mandates in its `<interfaces>` block contains
**six** records with `expect: rows` — `org-alpha-reads-own`, `cases-alpha-reads-own`,
`cases-beta-reads-own`, `cases-alpha-updates-own`, `pdfs-alpha-reads-own` and
`share-anon-alpha-token` — while task 1's criterion says the count must print `5`. The two cannot
both be satisfied. Resolution: the fourteen records were transcribed verbatim and `CONTROLS` prints
`6`. Deleting a record to reach 5 would have removed a positive control, which constraint 1 of this
same plan explicitly prohibits and which is the exact weakening this project's governing principle
forbids. Six controls is *more* coverage than the criterion asked for, not less. Verification:
`CASES 14`, `SURFACES cases,org,pdfs,share-links`, `CONTROLS 6`, `UUID_LITERALS 0`. Commit:
`0d4eab47d`.

**Total deviations:** 1 (1 × Rule 3, resolved in favour of the stronger suite). **Impact:** one more
positive control than the criterion's number; no assertion weakened or removed.

## Issues Encountered

`git status --porcelain supabase/` is not literally empty after the reset: it shows
` M apps/inheritance/frontend/supabase/.temp/cli-latest`. That file is a Supabase CLI version-check
cache, it was already modified before this phase began (it appears in the session's opening git
status), and it is not a migration. No migration, policy, grant or seed row was changed by this plan
— the injected `ALTER POLICY` existed only in the running container and was undone by the reset.

No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED

All four tasks' acceptance criteria re-run after the commit, with the single documented deviation on
the `CONTROLS` count. Plan-level `<verification>`: two consecutive runs of
`node journey/rls-isolation.mjs` both exit 0 and print `ISOLATION ok cases=14 surfaces=4` plus four
`ISOLATION SURFACE` lines with `fail=0`.

Wave 2 complete. Ready for 11-05.

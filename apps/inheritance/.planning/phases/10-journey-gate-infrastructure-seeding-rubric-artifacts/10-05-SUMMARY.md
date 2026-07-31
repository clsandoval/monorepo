---
phase: 10-journey-gate-infrastructure-seeding-rubric-artifacts
plan: 05
subsystem: journey-seeding
tags: [seeding, url-state, supabase, jrny-01]
requires: ["10-01"]
provides:
  - "frontend/journey/seed.mjs — seedLocalStorage, seedSessionStorage, seedSearchParams, readFixtures, seedAuthSession, plus INTAKE_DRAFT_KEY and QUICK_CALC_KEY"
  - "URL-addressable wizard step (`?step=`, `?hasWill=1`) and tax tab (`?tab=`)"
  - "frontend/journey/seed-probe.mjs — all three DB-free seams proven on one first-paint navigation"
  - "frontend/journey/seed-smoke.mjs — the live-DB half, written and exercised; BLOCKED by an environment defect"
affects:
  - frontend/src/components/wizard/WizardContainer.tsx
  - frontend/src/components/tax/EstateTaxWizard.tsx
tech-stack:
  added: []
  patterns:
    - "URL seam is additive and default-preserving: absent params reproduce today's behaviour exactly, so no test file was touched"
    - "Storage installed with addInitScript (before first paint), never page.evaluate after navigation"
    - "Exit code 2 = cannot-run, distinct from 1 = ran and failed"
key-files:
  created:
    - frontend/journey/seed.mjs
    - frontend/journey/seed-probe.mjs
    - frontend/journey/seed-smoke.mjs
  modified:
    - frontend/src/components/wizard/WizardContainer.tsx
    - frontend/src/components/tax/EstateTaxWizard.tsx
key-decisions:
  - "The runtime clamp proof (a crafted step=99 rendering step 1 of the real wizard) was deliberately deferred to Phase 11, which has a built app to navigate; this plan asserts the clamp at source level and records the deferral in a comment inside seed-probe.mjs"
requirements-completed: []
requirements-blocked:
  - "JRNY-01 (partial): the four DB-free seams are proven end to end, but the live-database half cannot pass — see below"
commits: [f371e3e5d]
duration: ~45 min
completed: 2026-07-31
---

# Phase 10 Plan 05: URL-Addressable Wizard Steps and Seeding Seams Summary

Tasks 1–5 and 7 are complete and measured. **Task 6 is BLOCKED** on a real defect in the local
Supabase environment, not on anything this plan wrote.

## Measured results (Tasks 1–5, 7)

- `npx tsc -b --force` → exit 0, zero diagnostics.
- `npx vitest run src/components/wizard/__tests__/ src/components/tax/__tests__/` before the component
  edits: `Test Files 5 failed | 13 passed (18)`, `Tests 12 failed | 475 passed (487)`.
  After the edits: **identical** — `5 failed | 13 passed (18)`, `12 failed | 475 passed (487)`.
  No test file was edited, skipped or weakened.
- `grep -c "useEffect" src/components/wizard/WizardContainer.tsx` → 0, unchanged. No history push added.
- `npm run test:gate` → `GATE OK — test baseline matches exactly`, 2449 total / 2403 passed /
  46 known failures met, `GATE-SKIPS total=2449 skipped=0`. `git diff --stat frontend/test-baseline.json`
  is empty.
- `node journey/seed-probe.mjs` → exit 0,
  `SEED-PROBE ok baseline=absent seeded=probe-draft|true|3 firstPaint=true clampSourceChecked=true`.
  The unseeded navigation read `absent|absent|absent`; the seeded one read exactly `probe-draft|true|3`
  on its **first** navigation with no reload, which is what `addInitScript` buys.
- `seed.mjs` exports `INTAKE_DRAFT_KEY,QUICK_CALC_KEY,readFixtures,seedAuthSession,seedLocalStorage,seedSearchParams,seedSessionStorage`;
  `grep -c addInitScript` → 4, `grep -c page.evaluate` → 0; `readFixtures()` returns orgs
  `alpha,beta` and Alpha case `a0000000-0000-4000-8000-000000000004`.
- `node journey/seed-smoke.mjs` with the supabase CLI unreachable → **exit 2**,
  `SEED-SMOKE cannot-run: local Supabase stack is not running`. Not exit 1. Stdout empty, so the
  service-role key was printed nowhere.

## BLOCKED — Task 6, live-database seeding

`node journey/seed-smoke.mjs` against the **running** local stack exits 1 with:

```
SEED-SMOKE FAILED: reading the Alpha org failed: permission denied for table organizations
+ {
+   code: '42501',
+   hint: 'Grant the required privileges to the current role with: GRANT SELECT ON public.organizations TO service_role;',
+   message: 'permission denied for table organizations'
+ }
```

This is not a defect in the script. It is a defect in the provisioned database, and it is broader than
this plan:

- A raw REST call with the service-role key returns **HTTP 403** with the same `42501`:
  `curl "http://127.0.0.1:55321/rest/v1/organizations?select=id" -H "apikey: $SERVICE_ROLE_KEY" …`
- `information_schema.role_table_grants` for `public.organizations` shows `anon`, `authenticated` and
  `service_role` holding only `TRUNCATE`, `REFERENCES` and `TRIGGER` — **no SELECT, INSERT, UPDATE or
  DELETE**. The same query filtered to `privilege_type='SELECT'` across the whole `public` schema
  returns **0 rows**: no table in `public` is readable by any API role.
- The rows themselves are correct and present — `select id, name from public.organizations` as
  `postgres` returns both Test Firm Alpha and Test Firm Beta, and the Alpha case
  `a0000000-0000-4000-8000-000000000004` exists with `share_enabled = t`.
- Cause, measured: `pg_default_acl` defines the grants to `anon`/`authenticated`/`service_role` for
  objects created by **`supabase_admin`**, but every table in `public` is owned by **`postgres`**
  (migrations run as `postgres`), so the default ACLs never applied. No migration contains a `REVOKE`.

Fixing it requires a schema change — a migration granting privileges on `public` to the API roles —
which is a security decision about which roles get which privileges on which tables, affecting the
deployed product as well as this local stack. Plan 10-05 does not contain that decision, its
`files_modified` list contains no migration, and the loop invariant is halt-over-guess. So it is
reported rather than guessed.

**Consequence for later phases:** every DB-touching journey gate planned for Phase 11 will hit this
same wall. It should be resolved before Phase 11 executes, as an explicit owner decision.

`scripts/check-env-ready.mjs` (gate-adjacent, Phase 3) still reports
`ENV READY — api 55321, db 55322, container supabase_db_inheritance` and exits 0, because it checks
that the stack is up, not that its tables are reachable through PostgREST. That gap is itself worth
recording.

---
phase: 11-account-org-case-journey-gates
plan: 02
subsystem: frontend
tags: [react, routes, defects, testids]
requires: []
provides:
  - "createOrganization called with a firm name at all three call sites"
  - "A visible refusal branch on /invite/$token"
  - "settings/team reading user_profiles"
  - "Nineteen data-testid hooks for the journey rubrics"
affects:
  - frontend/src/routes/auth.tsx
  - frontend/src/routes/auth/callback.tsx
  - frontend/src/routes/invite/$token.tsx
  - frontend/src/routes/onboarding.tsx
  - frontend/src/routes/settings/team.tsx
  - frontend/src/routes/index.tsx
  - frontend/src/components/layout/AppLayout.tsx
  - frontend/src/components/intake/SettlementTrackStep.tsx
tech-stack:
  added: []
  patterns:
    - "A stable data-testid per screenshot target, unique application-wide so a rubric selector resolves to exactly one node"
key-files:
  created: []
  modified:
    - frontend/src/routes/auth.tsx
    - frontend/src/routes/auth/callback.tsx
    - frontend/src/routes/invite/$token.tsx
    - frontend/src/routes/onboarding.tsx
    - frontend/src/routes/settings/team.tsx
    - frontend/src/routes/index.tsx
    - frontend/src/components/layout/AppLayout.tsx
    - frontend/src/components/intake/SettlementTrackStep.tsx
key-decisions:
  - "SettlementTrackStep got a neutral wrapper div rather than a renamed testid, because a committed test asserts the existing id and an element can carry only one data-testid"
  - "test-baseline.json was left untouched: the gate exited 0 with the ledger matching exactly, so nothing had turned green to remove"
requirements-completed: [JRNY-02, JRNY-03, JRNY-04]
duration: 18 min
completed: 2026-07-31
---

# Phase 11 Plan 02: Account/Org Product Defects and Journey Testids Summary

Three measured product defects corrected — organization creation was passing a user uuid where the
RPC wanted a firm name, a refused invitation navigated as though it had been accepted, and the team
page queried a table that does not exist — plus nineteen `data-testid` hooks so a rubric selector
resolves to exactly one element.

- Tasks: 6 · Files: 8 modified · One commit: `9e2b2304e`

## What was built

**D-1** `routes/auth.tsx:85` and `routes/auth/callback.tsx:32` now call
`createOrganization(firmName || 'My Firm')` / `createOrganization('My Firm')` — one argument, the
firm name — matching the declared `createOrganization(firmName: string, slug?: string)` and the RPC
that derives its owner from `auth.uid()`. `routes/onboarding.tsx:58` was already correct and is
unchanged.

**D-2** `routes/invite/$token.tsx` now branches on `result.success`. `accept_invitation` returns
`{success:false, error}` *without raising*, so the previous `.then(() => navigate(...))` made a
refused invitation indistinguishable from an accepted one. The refusal path calls
`setError(result.error ?? 'This invitation link is invalid or has expired.')` and does not navigate.
The `.catch` is untouched.

**D-3** `routes/settings/team.tsx` queries `user_profiles` (the table that exists) instead of
`profiles`, and the trailing `.catch(() => {})` now logs, so a future failure of that query is
visible rather than silent.

**Testids** — all nineteen from the plan's map, each unique application-wide, verified at zero hits
before being added.

## Verification (real output)

```
$ grep -rn "createOrganization(" src/routes/
src/routes/auth/callback.tsx:32:        await createOrganization('My Firm');
src/routes/onboarding.tsx:58:      await createOrganization(firmName.trim());
src/routes/auth.tsx:85:          await createOrganization(firmName || 'My Firm');

$ grep -n "result.success" 'src/routes/invite/$token.tsx'
26:        if (result.success) {

$ grep -c "from('profiles')" src/routes/settings/team.tsx      -> 0
$ grep -c "from('user_profiles')" src/routes/settings/team.tsx -> 1

$ for t in <the nineteen>; do ...; done
auth-page=1 auth-title=1 auth-submit=1 auth-error=1 auth-check-email=1
auth-callback-pending=1 auth-callback-error=1 invite-pending=1 invite-error=1
onboarding-step-firm=1 onboarding-step-profile=1 onboarding-step-done=1
onboarding-firm-submit=1 onboarding-profile-submit=1 team-page=1 dashboard-page=1
sign-out-desktop=1 sign-out-mobile=1 intake-settlement-track=1

$ npx tsc -b --force; echo "TSC_EXIT=$?"
TSC_EXIT=0

$ npm run test:gate
 Test Files  11 failed | 101 passed (112)
      Tests  46 failed | 2403 passed (2449)
GATE OK — test baseline matches exactly
  total tests run     : 2449 (floor 2416)
  passed              : 2403
  known failures met  : 46
  LEDGER SIZE (debt)  : 46   <-- this number must only go down
GATE-SKIPS total=2449 skipped=0
GATE_EXIT=0
```

`test-baseline.json` is byte-identical to its pre-plan state: 46 known failures before, 46 after,
`min_total_tests` unchanged at 2416. Nothing was added to the ledger and nothing was removed,
because the gate matched exactly — no ledgered entry started passing. Total tests rose 2416 → 2449
purely because the run is above the floor; the floor was not lowered.

Commit:

```
$ git show --stat --name-only HEAD
apps/inheritance/frontend/src/components/intake/SettlementTrackStep.tsx
apps/inheritance/frontend/src/components/layout/AppLayout.tsx
apps/inheritance/frontend/src/routes/auth.tsx
apps/inheritance/frontend/src/routes/auth/callback.tsx
apps/inheritance/frontend/src/routes/index.tsx
apps/inheritance/frontend/src/routes/invite/$token.tsx
apps/inheritance/frontend/src/routes/onboarding.tsx
apps/inheritance/frontend/src/routes/settings/team.tsx
$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 146 commit(s) audited, 118 touching apps/inheritance/, 0 mixed
DISCIPLINE_EXIT=0
```

## Deviations from Plan

**[Rule 3 — blocker] `intake-settlement-track` could not be an attribute-only addition** — Found
during: Task 4. The plan's map puts `intake-settlement-track` on "the step's outer container
`<div>`" of `SettlementTrackStep.tsx`. That element already carries
`data-testid="settlement-track-step"`, and `src/components/intake/__tests__/intake-form.test.tsx:312`
asserts `screen.getByTestId('settlement-track-step')`. A React element can carry only one
`data-testid`, so satisfying the map by renaming would have broken a committed assertion — which
constraint 1 and this project's governing principle both forbid. Fix: kept the existing id verbatim
and added a neutral, class-less wrapper `<div data-testid="intake-settlement-track">` around it,
with a comment recording why. This is the one place in this plan where an element was added rather
than only an attribute, so constraint 2's "no element change" was deviated from deliberately rather
than accidentally. Verification: `intake-settlement-track` = 1, `settlement-track-step` still = 1,
`npm run test:gate` exits 0 with the ledger unchanged at 46 — the intake test did not regress.
Commit: `9e2b2304e`.

**[Rule 1 — bug] `.catch((err) => …)` failed the typecheck** — Found during: Task 3. The plan
specifies `.catch((err) => { console.error('team member profile load failed', err); })`, which
`tsc -b --force` rejected with `src/routes/settings/team.tsx(59,15): error TS7006: Parameter 'err'
implicitly has an 'any' type.` under this project's `strict` config. Fix: annotated it
`(err: unknown)`, matching the idiom already used in `routes/invite/$token.tsx`. Verification:
`TSC_EXIT=0`. Commit: `9e2b2304e`.

**Total deviations:** 2 auto-fixed (1 × Rule 3, 1 × Rule 1). **Impact:** one extra DOM node in the
intake settlement step; no behavioural change anywhere else.

## Issues Encountered

The nine `team.test.tsx` failures (`Element type is invalid … got: undefined`) are still failing and
are still ledgered. They are **not** the `profiles` defect — that query lives in a `useEffect` and
its table name cannot produce an invalid element type. The cause is a separate undefined
import/export in that route's component tree, which this plan's scope does not include. It was not
touched, not hidden, and not removed from the ledger.

No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED

All six tasks' acceptance criteria re-run after the final commit. Plan-level `<verification>`:
`npx tsc -b --force` exits 0 with no output, `npm run test:gate` exits 0, the three
`createOrganization` call sites all pass a firm name first, and `grep -c "from('profiles')"` is 0.

Wave 1 complete. Ready for 11-03.

---
phase: 12-wizard-output-journey-gates
plan: 03
subsystem: journey-harness
tags: [wizard, journey, screenshot, rubric]
requires: [12-01, 12-02]
provides:
  - "five succession-wizard journey steps with approved references"
  - "wizard-review pinning predicted-scenario to the engine's I2"
affects:
  - frontend/journey/resets.mjs
  - frontend/journey/steps/account.json
tech-stack:
  added: []
  patterns:
    - "a step that mutates shared rows declares the reset that restores them, so order does not matter"
key-files:
  created:
    - frontend/journey/steps/wizard.json
    - frontend/journey/rubrics/wizard-estate.json
    - frontend/journey/rubrics/wizard-decedent.json
    - frontend/journey/rubrics/wizard-family-tree.json
    - frontend/journey/rubrics/wizard-will.json
    - frontend/journey/rubrics/wizard-donations.json
    - frontend/journey/rubrics/wizard-review.json
  modified:
    - frontend/journey/resets.mjs
    - frontend/journey/steps/account.json
key-decisions:
  - "wizard-will is withheld rather than passed: ?hasWill=1 does not construct the will object, so the screen is genuinely empty."
  - "case-alpha-no-output must null decedent_name and date_of_death, not just output_json, because opening the wizard writes them."
requirements-completed: []
duration: 47 min
completed: 2026-07-31
---

# Phase 12 Plan 03: Succession-Wizard Journey Gates Summary

Five of the six succession-wizard screens now have a passing screenshot-plus-rubric gate driven by
`?step=` alone against the built application and the real seeded case. The sixth, `wizard-will`, is
reported BLOCKED with its measured failure.

4 tasks, 7 files created, 2 modified, 1 commit (`42bf2eed6`).

## Task 1 measurement — five of six screens reachable from a URL alone

| step | URL driven | root testid | `step-root-visible` |
|---|---|---|---|
| `wizard-estate` | `/cases/<alpha>?step=0` | `estate-step` | `passed: true` |
| `wizard-decedent` | `/cases/<alpha>?step=1` | `decedent-step` | `passed: true` |
| `wizard-family-tree` | `/cases/<alpha>?step=2` | `family-tree-step` | `passed: true` |
| `wizard-will` | `/cases/<alpha>?step=3&hasWill=1` | `will-step` | **`STEP ERROR page.waitForSelector: Timeout 30000ms exceeded`** |
| `wizard-donations` | `/cases/<alpha>?step=3` | `donations-step` | `passed: true` |
| `wizard-review` | `/cases/<alpha>?step=4` | `review-step` | `passed: true` |

The conditional-step arithmetic is therefore proven, not assumed: `wizard-donations` is reached at
`step=3` *without* `hasWill`, and `step=3` *with* `hasWill=1` addresses a different screen.

## BLOCKED — `wizard-will`

**What was measured.** `waitForSelector` on `[data-testid="will-step"]` timed out after 30s. Cause,
read out of source rather than guessed:

- `WillStep.tsx:26-29` — `const will = watch('will'); if (!will) { return <div data-testid="will-step" />; }`
- The seeded case's `input_json.will` is `null` (`seed.sql`, copied from `engine/examples/cases/02-married-3lc.json`).
- `WizardContainer.tsx:137` — `handleHasWillChange` only calls `setHasWill(value)`. The `will` object
  is constructed by `EstateStep.tsx:32-39`'s radio handler, which a URL cannot trigger.
- `readInitialWizardState()` therefore makes the will step *visible* without making it *populated*,
  so the screen is an empty zero-size div and Playwright's default `state: 'visible'` never resolves.

**Why it was not closed.** Every available route out is something the plan does not contain:
adding a click-through (task 1 forbids it), editing application source so `?hasWill=1` also
constructs the will (constraint 4 forbids it, and whether the URL seam *should* mint a will object is
a product decision), or seeding a will (the phase forbids editing `seed.sql`/`fixtures.json`).
Per task 1's own instruction — "stop and report BLOCKED ... Do not add a click-through workaround and
do not relax the assertion" — the step is withheld. Its rubric is committed but unregistered,
exactly as Phase 11 did for `auth-signed-out`.

**Product finding worth the owner's attention, stated without deciding it:** a lawyer who selects
"Testate" *does* get a populated will screen, because the radio handler builds the object. Only the
URL seam is asymmetric. Whether `readInitialWizardState` should mirror `handleSuccessionChange` is
the open question.

## Verification

```
node scripts/check-journey-registry.mjs -> exit 0
    GATE-SKIPS total=280 skipped=0
    JOURNEY REGISTRY ok steps=20 references=20
node journey/run.mjs --all              -> exit 0   GATE-SKIPS total=20 skipped=0   JOURNEY PASS steps=20 failed=0
node journey/run.mjs --all  (again)     -> exit 0   GATE-SKIPS total=20 skipped=0   JOURNEY PASS steps=20 failed=0
grep -c '"maxDiffPixels": 0' journey/references/wizard-*.json -> 1 in each of 5 files
grep -c "₱" journey/rubrics/wizard-*.json                     -> 0 in every file
grep -c '"allowConsoleErrors": true' journey/steps/wizard.json -> 0
```

`wizard-review`'s assertions, from the run's `assertions.json`:

```
step-root-visible  passed=True   expected='visible'  actual='visible'
wrong-step-absent  passed=True   expected=0          actual=0
predicted-label    passed=True   expected='Predicted'
predicted-scenario passed=True   expected='I2'       actual='I2'
compute-button     passed=True   expected='visible'  actual='visible'
no-console-error   passed=True   expected=0          actual=0
```

`wizard-family-tree`'s `person-card-count` measured `expected=4 actual=4` — Rosa plus Ana, Ben and
Carlos, confirmed by eye in `actual.png` before approval.

## The observed failure — the gate catches the defect it exists for

With `ReviewStep`'s engine value forced back to the deleted classifier's answer:

```
JOURNEY STEP FAILED wizard-review: RUBRIC FAILURE DIFF FAILURE
FAIL predicted-scenario | expected 'I2' | actual 'I1'
EXIT=1
```

Restored with `git checkout --`; `git diff --stat frontend/src/` came back empty.

A first attempt at this injection replaced the JSX with a bare `{'I1'}`, which made `scenario`
unused and failed `noUnusedLocals`. The runner reported `JOURNEY CANNOT RUN: npm run build exited 1`
and exited **2**, not 1 — the three-valued contract distinguishing could-not-run from ran-and-failed,
working as designed.

## Deviations from Plan

**[Rule 2 - Missing critical] `case-alpha-no-output` did not honour its own contract** — Found
during: Task 4, when `node journey/run.mjs --all` turned the Phase 11 step `auth-session-persisted`
red. | Measured cause: merely *opening* the wizard on a case makes `useAutoSave` fire
`updateCaseInput` (`lib/cases.ts:53`), which writes `input_json`, `decedent_name` **and**
`date_of_death`. `seed.sql` inserts the case without the latter two, and `CaseCard.tsx:29` renders
`decedent_name ?? title` — so one wizard screenshot run silently rewrote the dashboard from
`Seeded Case Alpha` to `Pedro` for every later run:

```
FAILED seeded-case kind=text_contains expected="Seeded Case Alpha"
  actual="Dashboard\nNew Case\nRECENT CASES\nView all →\nPedro\n\nDOD: 2026-01-15\n\ndraft"
DIFF diffPixels=953 maxDiffPixels=0
```

| Fix: the reset now nulls `decedent_name` and `date_of_death` alongside `output_json`, and
`auth-session-persisted` declares it so the step is independent of execution order rather than
dependent on whatever ran before it. Nothing was weakened: no assertion changed and no tolerance
moved. | Files: `frontend/journey/resets.mjs` (12-02's file), `frontend/journey/steps/account.json`
(Phase 11's file) — both outside this plan's `files_modified`, recorded here for that reason. |
Verification: `--all` green twice consecutively, pasted above. | Commit: `42bf2eed6`

**Total deviations:** 1 auto-fixed (1 missing critical). **Impact:** the harness is now genuinely
repeatable across runs, which it was not before this plan drove a mutating screen.

## Issues Encountered

`node journey/run.mjs --list` prints 20 ids, not the 21 the plan predicted, and the registry reports
`steps=20 references=20` rather than 21 — both because `wizard-will` is withheld. Plan 12-09's gate
registration must expect 20 here plus whatever 12-04, 12-06 and 12-07 add.

## Next

Ready for 12-04.

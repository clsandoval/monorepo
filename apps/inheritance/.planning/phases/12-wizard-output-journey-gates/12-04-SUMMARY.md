---
phase: 12-wizard-output-journey-gates
plan: 04
subsystem: journey-harness
tags: [tax, journey, screenshot, rubric]
requires: [12-02]
provides:
  - "eight estate-tax tab journey steps with approved references"
affects: []
tech-stack:
  added: []
  patterns:
    - "a rubric pairs the selected tab control with the panel it renders, so a desynchronised strip is red"
key-files:
  created:
    - frontend/journey/steps/tax.json
    - frontend/journey/rubrics/tax-tab-0.json … tax-tab-7.json
  modified: []
key-decisions:
  - "All eight tax steps declare case-alpha-no-output, not noop: they READ a column the succession wizard writes, so noop made them order-dependent."
requirements-completed: []
duration: 22 min
completed: 2026-07-31
---

# Phase 12 Plan 04: Estate-Tax Wizard Tab Gates Summary

All eight `TAB_NAMES` tabs of the estate-tax wizard have a passing screenshot-plus-rubric gate,
reached by `?tab=` alone with no click and no fill.

4 tasks, 9 files created, 1 commit (`ed7eb292a`).

## Task 1 measurement — all eight tabs reachable from a URL alone

| step | URL | panel root found | `tab-<n>` `aria-selected` |
|---|---|---|---|
| `tax-tab-0` | `…/tax?tab=0` | `decedent-tab` | `'true'` |
| `tax-tab-1` | `…/tax?tab=1` | `executor-tab` | `'true'` |
| `tax-tab-2` | `…/tax?tab=2` | `real-properties-tab` | `'true'` |
| `tax-tab-3` | `…/tax?tab=3` | `personal-properties-tab` | `'true'` |
| `tax-tab-4` | `…/tax?tab=4` | `other-assets-tab` | `'true'` |
| `tax-tab-5` | `…/tax?tab=5` | `ordinary-deductions-tab` | `'true'` |
| `tax-tab-6` | `…/tax?tab=6` | `special-deductions-tab` | `'true'` |
| `tax-tab-7` | `…/tax?tab=7` | `filing-amnesty-tab` | `'true'` |

All eight reported `failedCount: 0` and `panel-visible` `actual: 'visible'` — and `element_visible`
fails on more than one match, so that also proves exactly one panel renders at a time.

## Verification

```
node journey/run.mjs --all           -> exit 0  GATE-SKIPS total=28 skipped=0  JOURNEY PASS steps=28 failed=0
node journey/run.mjs --all (again)   -> exit 0  GATE-SKIPS total=28 skipped=0  JOURNEY PASS steps=28 failed=0
node scripts/check-journey-registry.mjs -> exit 0  JOURNEY REGISTRY ok steps=28 references=28
node scripts/check-seed-fixture.mjs     -> exit 0  SEED OK — 2 orgs, 15 ids matched
grep -c '"kind": "fill"\|"kind": "click"' journey/steps/tax.json -> 0
grep -l '"maxDiffPixels": 0' journey/references/tax-tab-*.json    -> 8 files
git status --porcelain frontend/src frontend/supabase             -> only supabase/.temp/cli-latest (CLI scratch, pre-existing)
```

## The observed failure — the pairing assertion is real

`tab-selected`'s selector was pointed at `[data-testid="tab-3"]` while tab 0 was open:

```
JOURNEY STEP FAILED tax-tab-0: RUBRIC FAILURE
FAIL tab-selected | expected 'true' | actual 'false'
EXIT=1
```

Restored from the backup; green again.

## Deviations from Plan

**[Rule 2 - Missing critical] All eight steps declare `case-alpha-no-output`, not the plan's `noop`**
— Found during: Task 4, when the first full-suite run failed all eight tax steps at once:

```
JOURNEY STEP FAILED tax-tab-0..7: DIFF FAILURE
DIFF diffPixels=947 maxDiffPixels=0
```

| Measured cause: a tax tab mutates nothing, which is what makes `noop` look right — but
`$caseId.tax.tsx:56` renders the header from `row.decedent_name ?? 'Decedent'`, and `decedent_name`
is a column the **succession** wizard's autosave writes. In registry order `wizard.json` sorts after
`tax.json`, and `auth-session-persisted` (plan 12-03) now resets the column, so the header read
`Estate Tax — Estate of Pedro` or `Estate Tax — Estate of Decedent` purely according to what had run
before. The references, approved from an isolated eight-step run, captured the dirty variant. | Fix:
all eight declare `case-alpha-no-output`, which is a *restore* rather than a mutation, and the
references were re-approved from the deterministic seeded state (`Estate of Decedent`, confirmed by
eye in `actual.png`). No assertion was weakened and no tolerance moved; `maxDiffPixels` is `0` on all
eight. | Verification: `--all` green twice consecutively, pasted above. | Commit: `ed7eb292a`

**Total deviations:** 1 auto-fixed (1 missing critical). **Impact:** the plan's task-2 criterion
`grep -c '"reset": "noop"' == 8` is therefore not met by design — it now reports `0` — and the
success criterion "all with `reset` `noop`" is superseded. Every other criterion holds.

## Issues Encountered

The plan's task-3 criterion "No sidecar written by this plan carries an `approvedBy` key" cannot be
met and is a plan-authoring error, not a defect: `journey/approve.mjs` writes
`"approvedBy": "unattended-loop"` unconditionally on every sidecar, and every Phase 11 sidecar
already carries it. The load-bearing part of that criterion — `maxDiffPixels: 0`, no raised tolerance
— holds on all eight. `approve.mjs` was not modified; it remains the only writer into
`journey/references/`.

## Next

Ready for 12-06.

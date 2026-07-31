---
phase: 12-wizard-output-journey-gates
plan: 01
subsystem: succession-wizard
tags: [wizard, engine, ssot, classifier]
requires: []
provides:
  - "engine-backed predicted-scenario badge"
  - "data-testid=predicted-scenario"
  - "data-testid=compute-distribution"
affects:
  - frontend/src/components/wizard/ReviewStep.tsx
tech-stack:
  added: []
  patterns:
    - "cancelled-flag useEffect for a one-shot async engine call inside a component"
key-files:
  created: []
  modified:
    - frontend/src/components/wizard/ReviewStep.tsx
    - frontend/src/components/wizard/__tests__/ReviewStep.test.tsx
key-decisions:
  - "The wizard badge renders EngineOutput.scenario_code and nothing derived; the component holds no classifier."
  - "A rejected engine call renders the em dash and logs nothing, so wizard screenshot gates keep a clean console."
requirements-completed: [EXT-01, EXT-04]
duration: 21 min
completed: 2026-07-31
---

# Phase 12 Plan 01: Engine-Backed Scenario Badge Summary

Deleted the succession wizard's second scenario classifier and wired the "Predicted:" badge to the
compiled engine's `scenario_code`, so the reference image plan 12-03 approves freezes a correct
legal answer rather than a wrong one.

4 tasks, 2 files modified, 1 commit (`aae34ffca`).

## What was measured, not assumed

The plan's premise was confirmed against the committed release binary:

```
./target/release/inheritance-engine < 12-01-intestate.json  ->  I2
./target/release/inheritance-engine < 12-01-testate.json    ->  T2
```

against the deleted `predictScenario`, which returned `I1` and `T1` for the same two inputs
(`ReviewStep.tsx:52` — `if (hasLC && hasSS) return prefix + '1'`). Both inputs were transcribed
field-for-field from the two tests' own merged `ReviewStepWrapper` defaults.

## Deviations from Plan

**[Rule 1 - Bug] The testate test's institution literal was malformed and the engine rejected it**
— Found during: Task 1 | The fixture used `heir_reference:` where `InstitutionOfHeir` declares
`heir:`, and omitted the required `id`. The engine answered
`Error parsing input JSON: missing field 'id' at line 11 column 198`, so `compute()` would have
rejected and the badge would have rendered the em dash. `frontend/tsconfig.json` excludes
`src/**/__tests__/**`, so `tsc` never saw the excess-property error, and the deleted classifier
ignored the will's contents entirely — which is exactly how a duplicate classifier hides a broken
fixture. | Fix: corrected the literal to `id: 'inst1'` and `heir: {...}`. This strengthens the
fixture; no assertion was widened. | Files: `frontend/src/components/wizard/__tests__/ReviewStep.test.tsx`
| Verification: the corrected input yields `T2` from the release binary, and the test asserting `T2`
passes. | Commit: `aae34ffca`

**Total deviations:** 1 auto-fixed (1 bug). **Impact:** the testate badge test now exercises a real
engine computation instead of a silently-rejected input.

## Verification

```
grep -c "predictScenario" src/components/wizard/ReviewStep.tsx      -> 0
grep -c "predicted-scenario" src/components/wizard/ReviewStep.tsx   -> 1
grep -c "compute-distribution" src/components/wizard/ReviewStep.tsx -> 1
grep -c "console\." src/components/wizard/ReviewStep.tsx            -> 0
npx tsc -b --force                                                  -> exit 0, no output
npm run test:gate                                                   -> exit 0
    GATE OK — test baseline matches exactly
    total tests run     : 2449 (floor 2416)
    passed              : 2403
    known failures met  : 46
    LEDGER SIZE (debt)  : 46
    GATE-SKIPS total=2449 skipped=0
```

`ReviewStep.test.tsx` alone: 30 tests, 26 passed, 4 failed — the same four pre-existing
`summary sections` failures the plan named, unchanged. Both badge tests pass.

Nothing was appended to `frontend/test-baseline.json`; the ledger stayed at 46.

## Issues Encountered

React emits an `act(...)` warning for the badge's async state update in the tests that do not await
it. This is a test-environment-only artifact of `IS_REACT_ACT_ENVIRONMENT`; it fails no test and
does not exist in a real browser, so it does not affect plan 12-03's `no_console_error` assertion.

## Next

Ready for 12-02.

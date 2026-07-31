---
phase: 13-pdf-verification
plan: 03
subsystem: journey-harness
tags: [pdf, playwright, capture, determinism]
requires:
  - "frontend/journey/pdf.mjs (13-02)"
  - "frontend/src/components/pdf/pdf-text.ts (13-01)"
provides:
  - "frontend/journey/pdf-capture.mjs — captureExportedPdf, the shared capture for G23 and G24"
affects:
  - "frontend/src/components/results/ActionsBar.tsx (one attribute)"
tech-stack:
  added: []
  patterns:
    - "page.clock.setFixedTime for date determinism without faking timers"
key-files:
  created:
    - frontend/journey/pdf-capture.mjs
    - frontend/journey/pdf-capture-probe.mjs
  modified:
    - frontend/src/components/results/ActionsBar.tsx
    - frontend/src/components/results/__tests__/ActionsBar.test.tsx
key-decisions:
  - "The pre-authorised pdf-export.ts blob-revocation change was NOT applied: the download event fired on the first attempt, so src/lib/pdf-export.ts is untouched (git diff --stat is empty)."
  - "A capture whose bytes do not begin %PDF- is JourneyCannotRun, not a failure, because a zero-byte file reaching the assertions would let every downstream structural check pass vacuously."
requirements-completed: [PDF-01]
duration: 22 min
completed: 2026-07-31
---

# Phase 13 Plan 03: Real-Browser PDF Capture Summary

The PDF every later gate inspects is now the one a user obtains: driven from a reset wizard state,
through a real compute click, to a real click on the product's own Export PDF button, with the
downloaded bytes read off disk.

- 3 tasks, 4 files, 1 commit (`24704d352`), 312 insertions
- `ActionsBar.tsx`: exactly one line added (`data-testid="export-pdf"`), confirmed by
  `git diff --stat` → `1 insertion(+)`, `0 deletions`. One test added so a button rename cannot
  silently orphan every PDF gate; `ActionsBar.test.tsx` went 11 → 12 tests.
- `journey/pdf-capture.mjs`: `PDF_FIXED_CLOCK = '2026-06-15T00:00:00Z'` and `captureExportedPdf()`,
  returning `{ pdfBuffer, expected, input, caseId }`. The clock is pinned with
  `page.clock.setFixedTime`; `page.clock.install` appears nowhere.
- `journey/pdf-capture-probe.mjs`: four checks, deliberately **not** registered as a gate.

## Verification Results — real output

```
$ node journey/pdf-capture-probe.mjs
GATE-SKIPS total=4 skipped=0
PDF CAPTURE PASS bytes=5667 pages=2
CAPTURE_EXIT=0
```
Three consecutive runs, all `bytes=5667 pages=2`, exits `0`, `0`, `0`.

Determinism, measured across **two independent captures** (each its own build, browser and click):
```
CAPTURE_A_DATE_LINE="Report Generated: 2026-06-15"
CAPTURE_B_DATE_LINE="Report Generated: 2026-06-15"
DATE_LINES_IDENTICAL=true
EQUALS_EXPECTED=true
TEXT_SHA_A=064dd3d9b87bf44a
TEXT_SHA_B=064dd3d9b87bf44a
```
The extracted text is not merely same-dated, it is byte-identical — which is the property plan
`13-06`'s zero-tolerance reference depends on.

The capture does not disturb the Phase 12 gate:
```
$ node journey/money-parity.mjs
GATE-SKIPS total=5 skipped=0
MONEY PARITY PASS heirs=4 centavos=600000000
PARITY_EXIT=0
```

Frontend ledger gate, final state:
```
GATE OK — test baseline matches exactly
  total tests run     : 2470 (floor 2416)
  passed              : 2424
  known failures met  : 46
  LEDGER SIZE (debt)  : 46
GATE-SKIPS total=2470 skipped=0
GATE_EXIT=0
```
`git diff --stat frontend/src/lib/pdf-export.ts` → empty. The pre-authorised change was not needed.

## Deviations from Plan

None — the plan executed as written. The one conditional branch it contained (constraint 2's
`pdf-export.ts` remedy) was **not taken**, because the `download` event fired on the first attempt.

## Issues Encountered

**A pre-existing flake in the frontend ledger gate, observed once and not caused by this plan.** One
`npm run test:gate` run reported:

```
UNKNOWN FAILURE: src/components/wizard/__tests__/ReviewStep.test.tsx :: wizard-step6 > ReviewStep predicted scenario badge shows the engine scenario code for testate
```

Investigated rather than ignored:

- The test file run in isolation fails **4** tests, and all four (`renders estate summary with
  formatted amount`, `renders family tree person count`, `renders will disposition counts when
  hasWill=true`, `renders donations count`) are already in `test-baseline.json`. The
  `predicted scenario badge` test is **not** among them and passes in isolation.
- `git stash`-ing this plan's two source edits and re-running the file produced the identical 4
  failures, so the flake is not caused by anything in Phase 13.
- Three subsequent full `npm run test:gate` runs all printed `GATE OK — test baseline matches
  exactly`, `46` known failures met, `0` unknown, exit `0`.

It is therefore an intermittent full-suite-only failure of a WASM-backed scenario-prediction test,
almost certainly ordering- or shared-module-init-related. **Nothing was added to any ledger and no
test was touched.** Recorded here so it is visible rather than absorbed.

## Self-Check: PASSED

- `[ -f frontend/journey/pdf-capture.mjs ]` → yes; `[ -f frontend/journey/pdf-capture-probe.mjs ]` → yes
- `git log --oneline --all --grep="13-03"` → `24704d352`
- Every task `<acceptance_criteria>` re-run above; the plan-level `<verification>` block re-run above
- `git status --porcelain` shows no uncommitted Phase 13 file

## Next

Ready for `13-04` (print layout), the other wave-2 plan, then wave 3.

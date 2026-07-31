---
phase: 10-journey-gate-infrastructure-seeding-rubric-artifacts
plan: 02
subsystem: journey-rubric
tags: [rubric, closed-kind-set, jrny-09]
requires: ["10-01"]
provides:
  - "frontend/journey/rubric.mjs — ASSERTION_KINDS (frozen, eight), validateRubric, evaluateRubric"
  - "frontend/journey/rubrics/fixture-basic.json — one committed rubric exercising all eight kinds"
  - "frontend/journey/rubric-probe.mjs — observed pass, named-assertion failure, and two rejections"
affects: []
tech-stack:
  added: []
  patterns:
    - "Closed kind set frozen with Object.freeze; an unknown kind throws RUBRIC INVALID: rather than being skipped or interpreted"
    - "Per-assertion structured output with id/kind/passed/expected/actual and deliberately no prose field"
    - "Per-assertion try/catch so a throwing locator fails one assertion without ending the loop"
key-files:
  created:
    - frontend/journey/rubric.mjs
    - frontend/journey/rubrics/fixture-basic.json
    - frontend/journey/rubric-probe.mjs
  modified: []
key-decisions:
  - "The literal token `RUBRIC INVALID:` is written at each of the nine rejection sites rather than added once by a helper, so the grep-based acceptance criterion measures the rejection conditions themselves rather than one shared prefix"
  - "text_absent is implemented as a multi-match scan (every matching element checked), matching the specification's `No element matching the selector has innerText containing expect`"
requirements-completed: [JRNY-09]
requirements-blocked: []
commits: [52bd77a7c]
duration: ~20 min
completed: 2026-07-31
---

# Phase 10 Plan 02: Deterministic Rubric Evaluator Summary

A rubric is now a committed JSON document of yes/no assertions evaluated by a closed-kind-set
evaluator that returns per-assertion structured output and rejects anything it does not recognise.

## Measured results

- `ASSERTION_KINDS` → `text_equals,text_contains,text_absent,element_visible,element_absent,element_count,attribute_equals,no_console_error`; `Object.isFrozen` → `true`.
- `EXPORTS=ASSERTION_KINDS,evaluateRubric,validateRubric`.
- `grep -c "page.evaluate" journey/rubric.mjs` → 0 (no rubric string ever reaches an in-page script API).
- `grep -c "RUBRIC INVALID:" journey/rubric.mjs` → 10 (≥ the 6 required rejection conditions).
- `grep -c "writeFileSync\|console.log" journey/rubric.mjs` → 0.
- `node journey/rubric-probe.mjs` → exit 0,
  `RUBRIC-PROBE ok positive=8/8 negative=3/8 unknownKindRejected=true duplicateIdRejected=true`.
  The negative run asserts the three named ids `heir-share-shows-one-million`,
  `heir-share-not-one-point-five-million` and `warning-banner-visible` are the ones that failed —
  not merely that the count was nonzero.
- Rubric doc: 8 assertions, 8 unique ids, sorted kind list equals ASSERTION_KINDS, and the
  `attribute_equals` expectation carries `a0000000-0000-4000-8000-000000000004`, the same literal
  present in `frontend/supabase/fixtures.json`.
- `node scripts/check-commit-discipline.mjs` → exit 0, 0 mixed commits.

## Notes

`gates.manifest.json` untouched; no ledger file edited.

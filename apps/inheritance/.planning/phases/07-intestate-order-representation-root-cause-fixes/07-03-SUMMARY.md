---
phase: 07-intestate-order-representation-root-cause-fixes
plan: 03
subsystem: engine
tags: [descendants, art-969, repudiation, vacancy]
requires:
  - phase: 07-intestate-order-representation-root-cause-fixes
    plan: 02
    provides: "degree_yields_a_line, the predicate this plan factors into a shared helper"
provides:
  - "engine/src/step2_lines.rs — Art. 969 promotion of the following degree for LC and IC anchors"
  - "engine/src/step7_distribute.rs — descendant_anchor_ids + selected_illegitimate_children, one source of the anchor rule"
  - "engine/src/step9_vacancy.rs — check_total_renunciation scoped to the nearest degree"
affects:
  - .planning/phases/07-intestate-order-representation-root-cause-fixes/07-04-PLAN.md
tech-stack:
  added: []
  patterns:
    - "Step 7 imports Step 2's anchor rule rather than reimplementing it, so the two modules cannot disagree"
key-files:
  created: []
  modified:
    - engine/src/step2_lines.rs
    - engine/src/step7_distribute.rs
    - engine/src/step9_vacancy.rs
key-decisions:
  - "DEVIATION (recorded, and load-bearing): the plan's Task 1 rule — descendants anchor at the first line-yielding degree — silently dropped the extinct-line bookkeeping for a degree-1 descendant that is no longer an anchor. step5_legitimes::has_extinct_line reads `representation_trigger` for exactly the LC and IC groups; losing the mark would have paid a predeceased childless child a full per-line legitime. A separate post-pass now records the trigger for any degree-1 LC/IC heir left outside the anchor set whose line is extinct. Without it the change is a silent-wrongness regression, which is the failure mode this project exists to prevent."
  - "DEVIATION (recorded): the plan's Task 3 specified BOTH the implementation (`evaluate all_renounced over the living members at the minimum degree only`) and a test expecting `None` for two repudiating degree-1 children plus one living degree-2 grandchild. Those contradict: under min-degree scoping the pool is {lc1, lc2}, both repudiated, so the function returns Some. Verified against the pre-change code, which returned None for that tree precisely because it pooled the grandchild — so `Some` is the assertion that discriminates the fix and `None` was the old bug. The implementation follows the plan verbatim; the new test asserts the true post-fix value with the reasoning written inline. The end-to-end LAW-03 target is met either way."
  - "The six illegitimate-child selection sites now go through one `selected_illegitimate_children` helper and each is guarded against an empty selection. Measured: 0 committed inputs carry an IllegitimateChild above degree 1, and the corpus diff confirms 0 outputs moved."
requirements-completed: [LAW-03]
duration: ~40 min
completed: 2026-07-31
---

# Plan 07-03 — Descendant tier

## What changed

`engine/src/step2_lines.rs`
- The `LegitimateChildGroup`, `IllegitimateChildGroup` and `CollateralGroup` arms of
  `anchor_ids_for_category` now all call one shared private helper,
  `anchor_ids_at_first_line_yielding_degree`. `SurvivingSpouseGroup` stays at degree 1;
  `LegitimateAscendantGroup` is exactly as plan 07-01 wrote it.
- A `///` block quotes Art. 969's operative clause and states why repudiation promotes while
  predecease does not: a repudiating heir yields no line (Art. 977), a predeceased heir with living
  descendants yields a representation line.
- New post-pass preserving `representation_trigger` on degree-1 LC/IC heirs left outside the anchor
  set whose line is extinct (see key-decisions).
- Four new unit tests.

`engine/src/step7_distribute.rs`
- New `descendant_anchor_ids`, delegating to `crate::step2_lines::anchor_ids_for_category`.
- `get_lc_lines` no longer tests `degree_from_decedent != 1`; `grep -n "degree_from_decedent != 1"`
  returns nothing in the file. It iterates the Step 2 anchor set and keeps its `LcLine`
  classification, its ordering and its per-stirpes split unchanged.
- All six illegitimate-child selection sites (`distribute_i3`, `i4`, `i7`, `i8`, `i9`, `i10`) go
  through `selected_illegitimate_children`, each guarded against an empty set. No fraction and no
  `legal_basis` vector changed.
- Three new unit tests.

`engine/src/step9_vacancy.rs`
- `check_total_renunciation` scopes `all_renounced` to the living members at the minimum
  `degree_from_decedent` within each category. Same four categories, same order, same early
  `continue`s, same return type, same first-match return. Doc comment updated.
- `check_total_renunciation`, its call site, `requires_restart`, `restart_reason`,
  `VacancyResolution::ScenarioRestart` and `run_pipeline_with_restart` all untouched.
- Two new unit tests. `git diff` touches no line inside the five pre-existing
  `check_total_renunciation` tests; all five still pass unmodified.

## Measured results

End-to-end LAW-03 input (three degree-1 legitimate children all `has_renounced: true`, each naming
one living degree-2 child, estate 12000000000). Before (07-RESEARCH §1.3): `I15` with a single
`STATE` row of 12000000000. After:

```
exit=0
scenario I1
  gc1 4000000000
  gc2 4000000000
  gc3 4000000000
  lc1 0
  lc2 0
  lc3 0
 SUM 12000000000
 warnings []
```

`I1`, no `STATE` row, three grandchildren at 4000000000 each. The repudiating parents appear as
explicit zero rows, which is the engine's existing convention for a line anchor that receives
nothing.

`cd engine && cargo test` — **0 failed**, 465 + 3 + 17 + 35 + 3 = **523 passing** (floor 481).
`test_tv19_total_renunciation_restart` passes with its committed 600000000 / 600000000.

Corpus regression, measured rather than predicted: the engine was rebuilt at the pre-plan commit
(`git archive HEAD` into a scratch tree, `cargo build --release`) and all 171 inputs under
`examples/cases`, `examples/testate-cases`, `examples/fuzz-cases` and `examples/coverage-cases` were
run through both binaries and diffed.

```
DIFFERING=0
```

Zero committed outputs moved, which matches 07-RESEARCH §6's prediction that 0 of the committed
inputs have every living legitimate child repudiating. Sweep: `SWEEP_DONE`, zero `NONZERO`.

`cargo test --test fuzz_invariants --test observability --test defect_ledger` — 17 / 3 / 3 passed,
0 failed each. `node scripts/check-observability.mjs` → `OBSERVABILITY OK`, exit 0.
`node scripts/check-commit-discipline.mjs` → `0 mixed`, exit 0.

## Not done / carried

- Nothing added to `.planning/LAWYER-AGENDA.md`. No point of Philippine law decided.
- `bash scripts/ci-gates.sh` still halts at G3 (Phase 5's OBS-05/OBS-06). Not claimed as passing.

## Commit

`70e9f95c0` — exactly 3 files, all under `apps/inheritance/engine/src/`.

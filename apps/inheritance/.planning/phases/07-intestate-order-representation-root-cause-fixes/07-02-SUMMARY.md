---
phase: 07-intestate-order-representation-root-cause-fixes
plan: 02
subsystem: engine
tags: [collateral, representation, art-972, art-1005, art-1006, defect-ledger]
requires:
  - phase: 07-intestate-order-representation-root-cause-fixes
    plan: 01
    provides: "anchor_ids_for_category, which this plan extends with the CollateralGroup arm"
provides:
  - "engine/src/step2_lines.rs — CollateralGroup anchor arm, degree_yields_a_line, find_collateral_representatives"
  - "engine/src/step7_distribute.rs — anchor-aware sibling/nephew selection, liveness guard on branch 4, collateral_blood_ratio_undecided + intestate_warnings"
  - "engine/defect-baseline.json — ledger shrunk from 3 entries to 2"
affects:
  - .planning/phases/07-intestate-order-representation-root-cause-fixes/07-03-PLAN.md
tech-stack:
  added: []
  patterns:
    - "Step 7 reads the representation marks Step 2 wrote instead of inferring membership from blood_type"
    - "A lawyer-blocked question is made loud with a ManualFlag rather than answered"
key-files:
  created: []
  modified:
    - engine/src/step2_lines.rs
    - engine/src/step7_distribute.rs
    - engine/defect-baseline.json
  moved:
    - "engine/examples/defect-cases/01-collateral-halfblood-nephews.json -> engine/examples/coverage-cases/031-collateral-halfblood-nephews.json"
key-decisions:
  - "Collateral representation is permitted only for a degree-2 anchor (a brother or sister). Art. 972 ¶2 confines it to 'the children of brothers or sisters', so a nephew who anchors under Art. 975 ¶2 is not himself representable. This is what makes the grand-nephew test pass while the nephews-alone fallback still works."
  - "DEVIATION (recorded): the plan forbade touching engine/examples/ and its Task 3 acceptance said defect-cases must still hold three files. That is not reachable. tests/defect_ledger.rs::test_defect_cases_are_rejected_by_the_checked_entry_point enumerates files ON DISK, not ledger entries, and its own failure text prescribes the remedy verbatim: 'a case in examples/defect-cases that the runtime check accepts belongs in examples/coverage-cases instead'. Deleting only the ledger entry then fails test_every_defect_case_is_declared with UNDECLARED DEFECT CASE. The file was git-mv'd to coverage-cases/031 with byte-identical content. The only alternatives were re-breaking the engine or weakening a test, both prohibited."
  - "The test-module helper make_sibling carried `raw_category: LegitimateChild // placeholder` and make_nephew inherited it. Once membership stopped keying on blood_type and started keying on raw_category, those placeholders made the fixtures misdescribe what they modelled. Corrected to Sibling/CollateralGroup and NephewNiece. No assertion was changed; both pre-existing collateral tests still assert the same amounts and still pass."
  - "LAWYER-03 is NOT answered. distribute_nephews_only keeps its arithmetic, its Art. 975 basis and its LAWYER-DECISION marker byte-identical. A second marker was added above the new detector."
requirements-completed: [LAW-02]
duration: ~45 min
completed: 2026-07-31
---

# Plan 07-02 — Collateral tier

## What changed

`engine/src/step2_lines.rs`
- `anchor_ids_for_category` gained a `CollateralGroup` arm: the distinct collateral degrees are
  sorted ascending and the first one for which `degree_yields_a_line` is true becomes the anchor
  tier. Ordinary family → siblings at degree 2; no sibling record at all → nephews at degree 3
  (Art. 975 ¶2).
- New private `degree_yields_a_line(heirs, category, degree)`.
- New private `find_collateral_representatives` — one level only, repudiators excluded (Art. 977),
  a triggered child skipped rather than recursed into. `find_representatives_recursive` is
  untouched and still serves the descendant path.
- `build_single_line` gained a collateral branch quoting Art. 972 ¶2: only a degree-2 anchor may be
  represented, and only by its own children.
- Four new unit tests.

`engine/src/step7_distribute.rs`
- `distribute_collaterals`'s `siblings` filter is now
  `raw_category == Sibling && is_alive && is_eligible && !has_renounced && represented_by.is_empty()`.
  `grep -n "blood_type.is_some()" src/step7_distribute.rs` returns nothing. `blood_type` remains
  the Art. 1006 weight and only that. The `nephews` filter is unchanged and now actually matches.
- `distribute_other_collaterals` gained `is_alive && is_eligible && !has_renounced`.
- New `collateral_blood_ratio_undecided` (carrying its own `LAWYER-DECISION: LAWYER-03` marker) and
  `intestate_warnings`, wired into the intestate arm's `Step7Output.warnings`, which was
  `vec![]`. It alters no amount, no scenario code and no eligibility.
- Three new unit tests, none of which pins a centavo value for a mixed-blood nephews-alone case.

`engine/defect-baseline.json` — the `01-collateral-halfblood-nephews.json` entry deleted. Two
entries remain, both `requirement: "LAW-06"`, `fixed_by_phase: 14`, `blocked_on: "LAWYER-06"`.
`$comment`, `$correction_2026-07-31` and `frozen_at` untouched. No entry added.

## Measured results

The stale-defect signal, captured before the ledger was touched — this is the proof the fix landed:

```
---- test_declared_violations_still_reproduce stdout ----
1 defect case(s) no longer match the ledger:

STALE DEFECT DECLARATION: 01-collateral-halfblood-nephews.json no longer violates INV01; delete that entry from engine/defect-baseline.json
STALE DEFECT DECLARATION: 01-collateral-halfblood-nephews.json no longer violates INV13; delete that entry from engine/defect-baseline.json

---- test_defect_cases_are_rejected_by_the_checked_entry_point stdout ----
1 defect case(s) were not rejected as expected:

01-collateral-halfblood-nephews.json: check_output returned Ok, expected Err — a case in examples/defect-cases that the runtime check accepts belongs in examples/coverage-cases instead
```

After deleting only the ledger entry, a third test fired and forced the file move:

```
UNDECLARED DEFECT CASE: examples/defect-cases/01-collateral-halfblood-nephews.json has no entry in defect-baseline.json
```

The defect input itself, before (07-RESEARCH §1.2): CLI exit 2, 5 rows, Σ 480000000 of 600000000,
`n1` and `n2` each duplicated. After:

```
DEFECT01_EXIT=0
scenario I13
  sib1 400000000
  n1 100000000
  n2 100000000
 SUM 600000000
 warnings []
```

Exactly the Art. 1005/1006/1008 figure from `.planning/research/LEGAL-CONFORMANCE.md` §2a: one
full-blood line worth 2 units + one half-blood line worth 1 unit = 3 units of 200000000.

`cd engine && cargo test` — **0 failed**, 456 + 3 + 17 + 35 + 3 = **514 passing** (floor 481).
`cargo test --test fuzz_invariants` — 17 passed, 0 failed, every named invariant green including
`test_inv01_sum_conservation` and `test_inv13_unique_heir_id`.

Corpus sweep across `examples/cases` (20), `examples/testate-cases` (20), `examples/fuzz-cases`
(100), `examples/coverage-cases` (31): `SWEEP_DONE`, zero `NONZERO`. 173 committed inputs on disk
including the 2 remaining defect cases.

The four nephews-alone inputs — every `Sibling` and `NephewNiece` in all four carries
`blood_type: null`, verified by dumping the trees, so LAWYER-03 is not decisive for any of them and
none of them raises the new flag:

| input | after |
|---|---|
| 006-nephews-only-1dead-sib-1nn | I13, n1=7745290000, warnings=0 |
| 007-nephews-only-1dead-sib-1nn | I13, n1=35210000, warnings=0 |
| 008-nephews-only-2dead-sib-3nn | I13, n1=5933334, n2=5933333, n3=5933333, warnings=0 |
| 009-nephews-only-2dead-sib-3nn | I13, n1=8986667, n2=8986667, n3=8986666, warnings=0 |

Static gates: `check-lawyer-agenda.mjs` → `AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer`,
exit 0. `check-observability.mjs` → `OBSERVABILITY OK — 10 flag codes, 5 files scanned,
0 suppressed lines`, exit 0. `check-commit-discipline.mjs` → `0 mixed`, exit 0.
`grep -n "LAWYER-DECISION" src/step7_distribute.rs` → three markers: LAWYER-01 at 667, the
pre-existing LAWYER-03 above `distribute_nephews_only` at 1035, the new one at 1045.

## Not done / carried

- Nothing added to `.planning/LAWYER-AGENDA.md`. No point of Philippine law decided.
- `bash scripts/ci-gates.sh` still halts at G3 (Phase 5's OBS-05/OBS-06). Not claimed as passing.

## Commit

`d8023da65` — 4 paths, all under `apps/inheritance/engine/`.

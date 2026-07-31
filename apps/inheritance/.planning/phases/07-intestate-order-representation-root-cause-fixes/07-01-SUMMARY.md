---
phase: 07-intestate-order-representation-root-cause-fixes
plan: 01
subsystem: engine
tags: [intestate-order, ascendants, representation, art-987, art-972]
requires:
  - phase: 06-property-test-coverage-depth
    provides: "the coverage corpus (019/020) that exercises the grandparent shapes"
provides:
  - "engine/src/step2_lines.rs — anchor_ids_for_category, per-category line anchoring"
  - "engine/src/step2_lines.rs — Art. 972 ¶1 ascending-line representation ban in build_single_line"
  - "engine/src/step7_distribute.rs — select_inheriting_ascendants + split_ascendant_amount_by_line, used by all four Regime B distributors"
affects:
  - .planning/phases/07-intestate-order-representation-root-cause-fixes/07-02-PLAN.md
  - .planning/phases/07-intestate-order-representation-root-cause-fixes/07-03-PLAN.md
tech-stack:
  added: []
  patterns:
    - "One shared ascendant selection, mirroring step5_legitimes::divide_among_ascendants, so the two places that divide among ascendants cannot disagree"
    - "Fixed category order for anchor emission (LC, IC, SS, LA, Collateral) so row order stays stable independent of family-tree order"
key-files:
  created: []
  modified:
    - engine/src/step2_lines.rs
    - engine/src/step7_distribute.rs
key-decisions:
  - "DEVIATION (recorded): the plan's literal text for the ascendant branch of build_single_line was `Some(OwnRight) when is_alive && is_eligible && !has_renounced, None otherwise`. Implemented instead as: an ascendant carrying a representation trigger yields None, otherwise the own-right check. Reason: a validly disinherited ascendant is alive AND is_eligible (check_eligibility never clears eligibility for disinheritance), so the literal rule would have promoted a disinherited parent from `no line` (today's behaviour) to `takes the whole estate`. Whether a disinherited ascendant inherits is a point of Philippine law the plan does not decide, so the conservative implementation preserves today's outcome exactly and decides nothing."
  - "extinct_triggers no longer records ascendants. step5_legitimes::has_extinct_line is read only for the LC and IC groups (verified by grep), so this is inert downstream and matches the fact that an ascendant has no line to go extinct."
requirements-completed: [LAW-01, LAW-04]
duration: ~40 min
completed: 2026-07-31
---

# Plan 07-01 — Ascendant tier end to end

## What changed

`engine/src/step2_lines.rs`
- Added `pub fn anchor_ids_for_category(heirs, category) -> Vec<HeirId>`. Every category except
  `LegitimateAscendantGroup` still anchors at `degree_from_decedent == 1`. Ascendants anchor at the
  nearest degree that is `is_alive && is_eligible && !has_renounced` — Art. 987 ¶1.
- `step2_build_lines` now builds `anchor_ids` by concatenating that function over the five categories
  in the fixed order LC, IC, SS, LA, Collateral, deduplicating ids.
- `build_single_line` gained an ascendant branch quoting Art. 972 ¶1 that never constructs a
  `Representation` line and never calls `find_representatives_recursive`.
- `extinct_triggers` is gated so an ascendant is never recorded.
- Four new unit tests.

`engine/src/step7_distribute.rs`
- Added `select_inheriting_ascendants` (alive + eligible; parent tier when non-empty, else nearest
  degree) and `split_ascendant_amount_by_line` (Art. 987 ¶2 half/half, single-line fallback,
  per-capita fallback when no line is carried), plus a small `ascendant_rows` adapter.
- `distribute_i5`, `i6`, `i9`, `i10` all obtain their ascendant rows through it. Spouse and IC
  arithmetic and all four `legal_basis` vectors are unchanged. An empty selection now produces zero
  ascendant rows instead of dividing by zero.
- Three new unit tests.

## Measured results

`cd engine && cargo test` — **0 failed**, 449 + 3 + 17 + 35 + 3 = **507 passing** across 7 binaries
(floor was 481).

Defect input A (three living grandparents, 2 paternal + 1 maternal, degree 2, estate 1200000000
centavos). Before (07-RESEARCH §1.1): `I15`, one `STATE` row of 1200000000. After:

```
scenario I5
  gp1 300000000
  gp2 300000000
  gp3 600000000
 SUM 1200000000
exit=0
```

Defect input B (predeceased father with `children:["sib1"]`, living mother, full-blood sibling,
estate 12000000000) and B-control (same tree, sibling removed). Before (07-RESEARCH §1.4):
`fa=6000000000`, `mo=6000000000` for B against `fa=0`, `mo=12000000000` for B-control. After, the
two are identical:

```
=== INPUT B ===            === INPUT Bcontrol ===
exit=0                     exit=0
scenario I5                scenario I5
  mo 12000000000             mo 12000000000
 SUM 12000000000            SUM 12000000000
```

Note of precision: `fa` receives **no row at all** rather than a row of 0. The predeceased ascendant
is credited nothing either way, and B and B-control are byte-identical, which is what the plan asked
to prove. There is no `sib1` row.

Committed coverage cases:
- `examples/coverage-cases/020-ascendants-grandparents.json` → `I5`, no `STATE` row,
  `asc1 231720000 + asc2 231720000 = 463440000`.
- `examples/coverage-cases/019-ascendants-grandparents-sp.json` → `I6` (was `I11`, i.e. Art. 995
  applied while ascendants survived), `asc1 551170000 + asc2 551170000 + sp 1102340000 = 2204680000`.

Corpus sweep over `examples/cases` (20), `examples/testate-cases` (20), `examples/fuzz-cases` (100)
and `examples/coverage-cases` (30): `CORPUS_SWEEP_DONE`, zero `NONZERO` lines.

Static gates: `node scripts/check-lawyer-agenda.mjs` → `AGENDA OK — 8 decisions, 10 anchors,
8 awaiting-answer`, exit 0. `node scripts/check-commit-discipline.mjs` → `0 mixed`, exit 0.
`node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 13 gates, 13 locked`, exit 0.

## Not done / carried

- Nothing was added to `.planning/LAWYER-AGENDA.md`; no point of Philippine law was decided. The one
  place a decision could have been forced (disinherited living ascendant) was resolved by preserving
  today's behaviour, not by choosing a reading.
- `bash scripts/ci-gates.sh` still halts at G3 for Phase 5's unresolved OBS-05/OBS-06 product
  decision. `ALL GATES PASSED (13/13)` is not claimable and is not claimed.

## Commit

`b980e851b` — `fix(07-01): ascendants above the parent tier inherit; no representation in the
ascending line (LAW-01, LAW-04)`, exactly 2 files, both under `apps/inheritance/engine/src/`.

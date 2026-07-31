---
phase: 07-intestate-order-representation-root-cause-fixes
plan: 04
subsystem: testing
tags: [regression-vectors, wasm, requirements-closeout]
requires:
  - phase: 07-intestate-order-representation-root-cause-fixes
    plan: 03
    provides: "the behaviour all four vectors assert"
provides:
  - "engine/tests/integration.rs — test_law01/02/03/04, four named vectors with exact centavo assertions"
  - ".planning/REQUIREMENTS.md — LAW-01..04 ticked and marked Complete"
affects: []
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified:
    - engine/tests/integration.rs
    - .planning/REQUIREMENTS.md
key-decisions:
  - "LAW-04 asserts a 1-row shape plus `mo == 1200000000` plus `fa` absent-or-zero, instead of the plan's `assert_total_centavos(find_share(&output, \"fa\"), 0)`. Measured: the predeceased father produces NO row at all, so `find_share` would panic with 'No share found'. The substitute is strictly stronger, not weaker — `assert_vector_shape(.., 1, ..)` plus sum conservation plus mo's exact value together forbid any nonzero fa row."
  - "The four requirements were ticked only after `cargo test --test integration` was observed reporting all four vectors passing in this plan. OBS-05 and OBS-06 remain unticked and Blocked."
requirements-completed: [LAW-01, LAW-02, LAW-03, LAW-04]
duration: ~30 min
completed: 2026-07-31
---

# Plan 07-04 — Regression vectors, WASM rebuild, closeout

## What changed

`engine/tests/integration.rs` — four vectors appended after the TV-23 block and before the
cross-cutting invariant tests, each with a banner comment naming the requirement, the governing
articles, the `LEGAL-CONFORMANCE.md` §2a row it closes, and the measured before-value from research.
`git diff` shows **zero** removed lines that are not part of the added block — no pre-existing
expected value anywhere in the file was edited.

- `test_law01_grandparents_inherit_under_regime_b` — 1200000000 centavos, 2 paternal + 1 maternal
  grandparent at degree 2. Asserts `I5`/Intestate/3 rows, gp1 300000000, gp2 300000000,
  gp3 600000000, no `STATE` row.
- `test_law04_no_representation_in_the_ascending_line` — 1200000000 centavos, predeceased paternal
  father naming the decedent's sibling as his child, living maternal mother, full-blood sibling.
  Asserts `I5`/Intestate/1 row, mo 1200000000, fa absent-or-zero, no `sib1` row.
- `test_law02_collateral_representation_conserves_the_estate` — 600000000 centavos, living
  full-blood sibling + predeceased half-blood sibling represented by two half-blood nephews.
  Asserts `I13`/Intestate/3 rows, sib1 400000000, n1 100000000, n2 100000000, all heir_ids distinct,
  no `sib2` row.
- `test_law03_total_repudiation_promotes_the_following_degree` — 12000000000 centavos, three
  repudiating degree-1 children each with one living degree-2 child. Asserts `I1`/Intestate/6 rows,
  gc1/gc2/gc3 4000000000 each, lc1 0, no `STATE` row. The row count is 6 because each repudiating
  child carries an explicit zero-valued row (lc1, lc2, lc3), which is the engine's existing
  convention for a line anchor that receives nothing.

None of the four has the mixed-blood nephews-alone shape, and no centavo value is pinned for it.

`.planning/REQUIREMENTS.md` — LAW-01, LAW-02, LAW-03, LAW-04 changed from `- [ ]` to `- [x]` and
from `Pending` to `Complete` in the traceability table. Requirement text unchanged on all four
lines. No other checkbox touched: OBS-05 and OBS-06 are still `- [ ]` and still `Blocked`.
Trailing `*Last updated: ...*` line updated to name Phase 7.

## Measured results

```
cargo test --test integration
test test_law01_grandparents_inherit_under_regime_b ... ok
test test_law02_collateral_representation_conserves_the_estate ... ok
test test_law03_total_repudiation_promotes_the_following_degree ... ok
test test_law04_no_representation_in_the_ascending_line ... ok
test result: ok. 39 passed; 0 failed
```

`cd engine && cargo test` — **0 failed**, 465 + 3 + 17 + 39 + 3 = **527 passing** (floor 485).

### WASM rebuild

`bash engine/build-wasm.sh` → exit 0, `WASM BUILD OK: .../inheritance_engine_bg.wasm (610665 bytes)`,
mtime `2026-07-31 14:40:02`, newer than the last `engine/src/` edit (`step9_vacancy.rs`,
`14:36:35`). Not staged — `frontend/.gitignore` ignores it.

### Frontend gate G3, run against the freshly built WASM

```
Test Files  14 failed | 98 passed (112)
     Tests  51 failed | 2385 passed (2436)
TEST BASELINE GATE FAILED — 5 violation(s)
G3_EXIT=1
```

51 failures = 46 in `frontend/test-baseline.json` + 5 UNKNOWN. The 5 UNKNOWN failures are
**byte-identical** to the set recorded in `05-05-SUMMARY.md`, `05-06-SUMMARY.md` and
`06-05-SUMMARY.md`:

| file | test |
|---|---|
| `src/__tests__/integration.test.tsx` | `compute() handles duplicate person IDs` |
| `src/wasm/__tests__/bridge.test.ts` | `handles negative centavos without crashing` |
| `src/wasm/__tests__/bridge.test.ts` | `handles duplicate person IDs without crashing` |
| `src/wasm/__tests__/wasm-real.test.ts` | `handles negative estate centavos without crashing` |
| `src/wasm/__tests__/wasm-real.test.ts` | `handles duplicate person IDs without crashing` |

**The failure set did not grow.** Zero new frontend failures were introduced by the engine change.
These five are Phase 5's unresolved OBS-05/OBS-06 product decision and are untouched here. Nothing
was added to `frontend/test-baseline.json`, no frontend test was edited, `gate-skips.lock` was not
touched — `git status --porcelain` on `frontend/test-baseline.json`, `gate-skips.lock`,
`gates.manifest.json`, `gates.manifest.lock` and `GATES.md` is empty.

### Gate exit codes measured in this plan

| gate | command | result |
|---|---|---|
| G2 | `bash engine/build-wasm.sh` | 0 — `WASM BUILD OK` |
| G3 | `cd frontend && npm run test:gate` | **1** — 5 pre-existing OBS-05/OBS-06 violations |
| G5 | `node scripts/check-gate-manifest.mjs` | 0 — `MANIFEST OK — 13 gates, 13 locked` |
| G6 | `node scripts/check-plan-closed-world.mjs` | 0 — `PLANS OK — 36 plan file(s), 133 task(s)` |
| G7 | `node scripts/check-commit-discipline.mjs` | 0 — `114 commit(s) audited, 0 mixed` |
| G10 | `node scripts/check-lawyer-agenda.mjs` | 0 — `AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer` |
| G11 | `node scripts/check-observability.mjs` | 0 — `OBSERVABILITY OK — 10 flag codes` |
| G12 | `bash scripts/coverage-report.sh && node scripts/check-coverage.mjs` | 0 — `COVERAGE OK — 17 engine modules` |
| G13 | `node scripts/check-assertion-discipline.mjs` | 0 — `112 files, 2383 blocks, 0 assertion-free, 15 weak-only all declared` |
| G1 | `cd engine && cargo test` | 0 — 527 passed, 0 failed |

`bash scripts/ci-gates.sh` without `--only` still halts at `G3`. **`ALL GATES PASSED (13/13)` is
not achievable in this phase and is not claimed.**

## Not done / carried

- OBS-05 / OBS-06 remain blocked on a product decision. Out of Phase 7's scope.
- Nothing added to `.planning/LAWYER-AGENDA.md`. No point of Philippine law decided.

## Commit

`a3712b2ac` — exactly 2 files: `engine/tests/integration.rs` and `.planning/REQUIREMENTS.md`.

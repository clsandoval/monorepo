---
phase: 04-lawyer-review-agenda-recorded
plan: 03
status: complete
requirements: [LAWYER-07, LAWYER-09]
commit: 83a6233864ffd281562e6d2f1c47d3eda05a84a7
---

# Summary — 04-03 Registry, ten decision anchors, ten markers, Q7 spec pointer

## What was built

- `.planning/lawyer-decisions.json` — 191 lines, three top-level keys (`$comment`, `schema`,
  `decisions`), eight decisions, each with exactly fourteen keys.
- Nine `LAWYER-DECISION` marker comments across seven Rust files and one TypeScript file.
- A tenth marker in `specs/estate-tax-engine-spec.md`, replacing the Q7 hedge.

## Registry, as written

| id | q | reading_implemented | status | blocks | anchors | keys | answer fields |
|---|---|---|---|---|---|---|---|
| LAWYER-01 | Q1 | A | awaiting-answer | [] | 1 | 14 | all null |
| LAWYER-02 | Q2 | A | awaiting-answer | [] | 1 | 14 | all null |
| LAWYER-03 | Q3 | neither | awaiting-answer | [] | 1 | 14 | all null |
| LAWYER-04 | Q4 | neither | awaiting-answer | ["LAW-07"] | 1 | 14 | all null |
| LAWYER-05 | Q5 | A | awaiting-answer | [] | 1 | 14 | all null |
| LAWYER-06 | Q6 | A | awaiting-answer | ["LAW-06"] | 2 | 14 | all null |
| LAWYER-07 | Q7 | A | awaiting-answer | [] | 2 | 14 | all null |
| LAWYER-08 | Q8 | neither | awaiting-answer | ["LAW-12"] | 1 | 14 | all null |

`neither` count = 3, `B` count = 0, non-empty `blocks` count = 3. All `vectors` are `[]`.

## Anchor resolution (measured after the markers were inserted, not before)

All ten return exactly `1`:

```
LAWYER-01 1 engine/src/step7_distribute.rs
LAWYER-02 1 engine/src/step5_legitimes.rs
LAWYER-03 1 engine/src/step7_distribute.rs
LAWYER-04 1 engine/src/step1_classify.rs
LAWYER-05 1 engine/src/step6_validation.rs
LAWYER-06 1 engine/src/step4_estate_base.rs
LAWYER-06 1 engine/src/step8_collation.rs
LAWYER-07 1 frontend/src/lib/estate-tax-engine/special-deductions.ts
LAWYER-07 1 specs/estate-tax-engine-spec.md
LAWYER-08 1 engine/src/types.rs
ALL_ANCHORS_UNIQUE=true
```

## Marker line numbers, POST-INSERTION (later phases must cite these, not the pre-insertion numbers)

| File | Marker | Marker line | Anchor line after shift |
|---|---|---|---|
| `engine/src/step7_distribute.rs` | LAWYER-01 | 555 | 556 |
| `engine/src/step7_distribute.rs` | LAWYER-03 | 945 | 946 |
| `engine/src/step5_legitimes.rs` | LAWYER-02 | 254 | 255 |
| `engine/src/step1_classify.rs` | LAWYER-04 | 174 | 177 (`pub fn check_eligibility`) |
| `engine/src/step6_validation.rs` | LAWYER-05 | 555 | 563 (`pub fn reduce_inofficious`) |
| `engine/src/step4_estate_base.rs` | LAWYER-06 | 69 | 76 (`pub fn step4_compute_estate_base`) |
| `engine/src/step8_collation.rs` | LAWYER-06 | 93 | 107 (`pub fn step8_collation_adjustment`) |
| `engine/src/types.rs` | LAWYER-08 | 346 | 347 |
| `frontend/src/lib/estate-tax-engine/special-deductions.ts` | LAWYER-07 | 71 | 72 |
| `specs/estate-tax-engine-spec.md` | LAWYER-07 | 1008 | 1005 (`min(fmv * 0.5, cap)`, unmoved) |

Every line at or below a marker in those files shifted down by one (two in
`step7_distribute.rs` below line 945). `LEGAL-CONFORMANCE.md`'s 2026-07-27 engine line numbers are
now stale by that amount.

Placement obeyed both mechanical rules: no marker was placed between a `///` doc comment and its
item, nor between an attribute and its item. For `check_eligibility`, `reduce_inofficious`,
`step4_compute_estate_base` and `step8_collation_adjustment` the marker went **above the whole doc
block** (lines 174, 555, 69, 93 respectively). For `types.rs` the field marker went inside the
struct body, below the `#[derive(...)]`, directly above the field.

The LAWYER-04 marker carries the extra measured-state sentence:
`Art. 992's iron curtain would be enforced here; no barrier is implemented today.`

## Diff shape (proves comments only)

```
git diff --numstat (source files, pre-commit):
1  0  apps/inheritance/engine/src/step1_classify.rs
1  0  apps/inheritance/engine/src/step4_estate_base.rs
1  0  apps/inheritance/engine/src/step5_legitimes.rs
1  0  apps/inheritance/engine/src/step6_validation.rs
2  0  apps/inheritance/engine/src/step7_distribute.rs
1  0  apps/inheritance/engine/src/step8_collation.rs
1  0  apps/inheritance/engine/src/types.rs
1  0  apps/inheritance/frontend/src/lib/estate-tax-engine/special-deductions.ts
                                          → added=9 deleted=0

apps/inheritance/specs/estate-tax-engine-spec.md → 2 added, 1 deleted
```

## Behavioural gates (run, not assumed)

```
cd engine && cargo test
  test result: ok. 411 passed; 0 failed; 0 ignored   (lib)
  test result: ok. 0   passed; 0 failed; 0 ignored   (main)
  test result: ok. 1   passed; 0 failed; 0 ignored   (fuzz_invariants)
  test result: ok. 30  passed; 0 failed; 0 ignored   (integration)
  test result: ok. 0   passed; 0 failed; 0 ignored   (doc-tests)
  → 442 passed, 0 failed, exit 0 — identical to the pre-phase baseline

cd frontend && npx tsc -b --force   → zero output, TSC_EXIT=0
bash scripts/ci-gates.sh            → ALL GATES PASSED (9/9), exit 0
```

## The Q7 spec edit

Line 1008 previously read:
`// Note: Some commentary uses full FMV for conjugal; this engine implements the NIRC text (½ for conjugal)`

It was **replaced**, not deleted, by the two verbatim lines the plan supplied. Measured after:
`grep -c "Some commentary uses full FMV"` → `0`; `grep -c "LAWYER-DECISION: LAWYER-07"` → `1`;
`grep -Fc -- "min(fmv * 0.5, cap)"` → `1`; numstat `2 added, 1 deleted`. The recorded disagreement
survives — the replacement explicitly states Reading B "has not been ruled out."

## Deviations

1. **`safe-commit.sh` path form** — repo-root-relative paths used, as in 04-01 and 04-02.
2. **`npm run test:gate` was not run separately.** It is gate G3 inside `scripts/ci-gates.sh`, which
   was run and passed as part of `ALL GATES PASSED (9/9)`.

## No law was decided

All eight registry statuses are `awaiting-answer` with `answered_by`, `answered_on` and `answer` all
`null`. The one edit that could have decided law — the Q7 hedge — was replaced with the plan's
literal text, which records the disagreement rather than resolving it.

## Self-Check: PASSED

---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
plan: 02
subsystem: engine
tags: [dead-code, invariants, blocked, ext-04]
requires: []
provides: []
affects:
  - engine/tests/integration.rs
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []
key-decisions:
  - "Nothing was committed. The working tree was restored to HEAD, so `cargo test` is back at 543 passed / 0 failed."
requirements-completed: []
requirements-blocked: [EXT-04]
commits: []
duration: ~15 min
completed: 2026-07-31
status: blocked
---

# Phase 9 Plan 02: Revive Invariant 6 and Clear the Dead-Code Inventory — BLOCKED

Reviving invariant 6 by calling it, exactly as the plan directs, makes `test_tv09_adopted_equals_legitimate`
fail — because it exposes a real defect in the engine's output, in a file this plan is forbidden to
edit. PLAN-STANDARD §3 trigger 2.

## BLOCKED

```text
BLOCKED
Requirement: EXT-04
Task: 09-02 Task 1: Revive invariant 6 inside the adoption vector
What was attempted: The two stale #[allow(dead_code)] attributes above check_adoption_equality and
check_scenario_consistency were removed, and check_adoption_equality(&output) was added inside
test_tv09_adopted_equals_legitimate directly after the existing check_sum_invariant call, with no
existing assertion altered.
Real command output:
$ cd engine && cargo test --test integration test_tv09
running 1 test
test test_tv09_adopted_equals_legitimate ... FAILED

failures:

---- test_tv09_adopted_equals_legitimate stdout ----

thread 'test_tv09_adopted_equals_legitimate' panicked at tests/integration.rs:588:13:
assertion `left == right` failed: Invariant 6: LC shares should be equal when no collation differences
  left: 500000000
 right: 250000000

failures:
    test_tv09_adopted_equals_legitimate

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 43 filtered out; finished in 0.00s
```

## What the failure actually is — a genuine engine defect

`check_adoption_equality` asserts that every `per_heir_shares` row with
`heir_category == EffectiveCategory::LegitimateChildGroup` and `inherits_by == InheritanceMode::OwnRight`
carries the same total. In TV-09 the four such rows are `lc1` (₱2.5M), `lc2` (₱2.5M), `ac1` (₱2.5M)
— and **"University U" (₱5M)**, a stranger instituted as residuary heir.

The University is not a legitimate child. It is labelled one because of this, in
`engine/src/step7_distribute.rs:502-519`:

```rust
fn add_fp_to_distributions(distributions: &mut Vec<HeirDistribution>, heir_id: &str, amount: Frac) {
    if let Some(existing) = distributions.iter_mut().find(|d| d.heir_id == heir_id) {
        …
    } else {
        distributions.push(HeirDistribution {
            heir_id: heir_id.into(),
            effective_category: EffectiveCategory::LegitimateChildGroup,   // ← placeholder
            …
```

Any heir who first appears at the free-portion stage — every instituted stranger, every legatee not
already in the family tree — is emitted with `effective_category: LegitimateChildGroup`. The same
placeholder appears at `step7_distribute.rs:1004`, where `distribute_i15` labels the escheating
`STATE` as a legitimate child group.

This is a real output-labelling defect, and reviving invariant 6 is what found it. That is the
invariant doing its job.

## Why it is a BLOCKED and not a fix

1. `engine/src/step7_distribute.rs` is **not** in this plan's editable set. Constraint 7 lists
   exactly three files: `engine/tests/integration.rs`, `engine/src/step2_lines.rs`,
   `engine/src/step8_collation.rs`.
2. There is no correct value to write instead. `EffectiveCategory` has exactly five variants —
   `LegitimateChildGroup`, `IllegitimateChildGroup`, `SurvivingSpouseGroup`,
   `LegitimateAscendantGroup`, `CollateralGroup` — and **none of them describes an instituted
   stranger or the State**. Fixing this requires adding a variant to a serialized enum that crosses
   the WASM boundary and appears in `EngineOutput`, which is a schema decision the plan does not
   contain.
3. The plan's stated premise for this task is falsified. Constraint 6 says "Reviving invariant 6
   asserts a property the engine already implements and `test_tv09` already exercises; it interprets
   nothing." The engine does not currently implement that property, because the category label is
   wrong for one row.

Per PLAN-STANDARD §3 ("Stop at that task. Make no further edits. Do not proceed to later tasks"),
Task 2 — the deletion of `find_share_by_name`, `ineligible` and `make_distribution` — was **not**
executed. Those three deletions remain available and are unaffected by this blocker.

## State of the tree

Nothing was committed. `engine/tests/integration.rs` was restored with `git checkout`. Re-measured
after the revert:

```
$ cd engine && cargo test
TOTAL_PASSED=543 TOTAL_FAILED=0
```

The attempted diff is preserved outside the repo at
`…/scratchpad/09-02-integration.rs.diff.blocked`.

## No point of Philippine law arose

`.planning/LAWYER-AGENDA.md` is untouched. Whether an instituted stranger should be labelled
`LegitimateChildGroup` in the engine's own output is a data-schema question about this engine, not a
reading of the Civil Code — the peso amounts in TV-09 are unaffected and were not questioned.

## Self-Check: FAILED

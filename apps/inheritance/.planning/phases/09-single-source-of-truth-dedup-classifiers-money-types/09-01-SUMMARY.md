---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
plan: 01
subsystem: engine
tags: [classification, blocked, ext-01, ext-04]
requires: []
provides: []
affects:
  - engine/src/pipeline.rs
  - engine/src/wasm.rs
  - engine/tests/classify.rs
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []
key-decisions:
  - "Nothing was committed. The working tree was restored to HEAD, so `cargo test` is back at 543 passed / 0 failed."
requirements-completed: []
requirements-blocked: [EXT-01, EXT-04]
commits: []
duration: ~35 min
completed: 2026-07-31
status: blocked
---

# Phase 9 Plan 01: Engine Classification Entry Point — BLOCKED

The plan cannot be executed as written. Two of its own directives are mutually unsatisfiable against
the engine as it actually behaves, and choosing which one to keep is a design decision the plan does
not contain — PLAN-STANDARD §3 trigger 2.

## BLOCKED

```text
BLOCKED
Requirement: EXT-01, EXT-04
Task: 09-01 Task 1: Add classify_scenario to pipeline.rs and prove it equals run_pipeline on all 173 inputs
What was attempted: classify_scenario and ScenarioClassification were added to engine/src/pipeline.rs
exactly as the plan specifies — steps 1, 2 and 3 with the identical wiring run_pipeline uses at
pipeline.rs:56-101, returning step3.scenario_code and step3.succession_type — and
engine/tests/classify.rs was created with the three named tests. The equivalence test asserts, per the
plan's literal wording, that classify_scenario(&input).scenario_code == run_pipeline(&input).scenario_code
AND that classify_scenario(&input).succession_type == run_pipeline(&input).succession_type, over all
173 committed inputs.
Real command output:
$ cd engine && cargo test --test classify
classify_scenario disagrees with run_pipeline on 59 of 173 committed input(s):
/…/engine/examples/fuzz-cases/062-testate-legacies-1leg-2lc-sp.json: succession_type classify_scenario=Testate run_pipeline=IntestateByPreterition
/…/engine/examples/fuzz-cases/063-testate-legacies-1leg-1lc-sp.json: succession_type classify_scenario=Testate run_pipeline=Mixed
… (57 more, all of the same two shapes)

failures:
    test_classify_agrees_with_run_pipeline_on_every_committed_input

test result: FAILED. 2 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.11s
```

## The measurement, in full

| Field compared | Mismatches over the 173 committed inputs |
|---|---|
| `scenario_code` | **0** |
| `succession_type` | **59** |

Breakdown of the 59, exhaustive:

| classify_scenario said | run_pipeline said | count |
|---|---|---|
| `Testate` | `IntestateByPreterition` | 36 |
| `Testate` | `Mixed` | 23 |

The other two tests the plan specifies — `test_classify_never_reads_the_estate` and
`test_classify_matches_the_review_badge_fixtures` — both **passed**. In particular the engine did
return `ScenarioCode::I2` and `ScenarioCode::T2` for the two `ReviewStep.test.tsx` fixture shapes,
confirming `09-RESEARCH.md` §1.2's measurement independently.

## Why it cannot be made to pass

`succession_type` on `EngineOutput` is not step 3's value. Traced in `engine/src/pipeline.rs`:

```
106:        succession_type: step3.succession_type,          ← the provisional value
212:    let (step6, succession_type) = if let Some(ref will) = input.will {
230:            .succession_type_override
231:            .unwrap_or(step3.succession_type);            ← step 6 may override it
290:        succession_type: step7.final_succession_type,     ← what EngineOutput actually carries
```

Step 3 assigns a **provisional** succession type from the line counts alone. Step 6 (will validation)
overrides it when preterition annuls the institution, or when the will disposes of only part of the
estate. Both overrides are downstream of Step 5, which needs `estate_base` — i.e. money. A
classification entry point that agreed with `run_pipeline` on `succession_type` would have to run
steps 4 through 7, which would destroy the plan's own money-free property (`must_haves.truths`: "The
classification entry point carries no money field and therefore cannot emit a peso figure").

So the plan's three directives —

1. `ScenarioClassification` has exactly three fields including `succession_type`, carrying
   `step3.succession_type`;
2. the equivalence test asserts `succession_type` equality with `run_pipeline`;
3. the classifier touches no money and `run_pipeline`'s body is not refactored

— cannot all hold. Which one to drop is a design decision (delete the field / rename it to something
that states its provisionality / scope the assertion to `scenario_code`), and PLAN-STANDARD §2
category 2 forbids an executor from making a design choice the plan did not already make.

## What this does NOT block

`scenario_code` — the thing the "Predicted:" badge actually shows, and the thing EXT-01 is about —
agreed with `run_pipeline` on **173 of 173** committed inputs. The classification entry point is fit
for its purpose. Only the extra `succession_type` field and its assertion are defective.

## State of the tree

Nothing was committed. `engine/src/pipeline.rs` was restored with `git checkout` and
`engine/tests/classify.rs` was removed, so no failing test entered the repository and no gate was
red-lined. Re-measured after the revert:

```
$ cd engine && cargo test
TOTAL_PASSED=543 TOTAL_FAILED=0
```

The two artifacts are preserved for the replan, outside the repo:

- `…/scratchpad/09-01-pipeline.rs.diff.blocked`
- `…/scratchpad/09-01-classify.rs.blocked`

## No point of Philippine law arose

`.planning/LAWYER-AGENDA.md` is untouched. The blocker is a factual claim about this engine's own
step ordering, not a reading of the Civil Code.

## Self-Check: FAILED

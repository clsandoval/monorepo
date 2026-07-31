---
phase: 05-engine-observability-restored
plan: 05
subsystem: engine
tags: [observability, runtime-check, conservation, blocked]
requires: ["05-03", "05-04"]
provides:
  - "engine/src/output_check.rs — check_output() + OutputDefect"
  - "pipeline::run_pipeline_checked — the entry point both production callers use"
affects:
  - engine/src/wasm.rs
  - engine/src/main.rs
  - engine/src/lib.rs
tech-stack:
  added: []
  patterns:
    - "Checked entry point added alongside the infallible one, never replacing it, so the catch_unwind fuzz harness keeps its raw form"
key-files:
  created:
    - engine/src/output_check.rs
  modified:
    - engine/src/lib.rs
    - engine/src/pipeline.rs
    - engine/src/wasm.rs
    - engine/src/main.rs
key-decisions:
  - "check_output collects every defect and never short-circuits; it takes &EngineOutput so there can be no repair path"
  - "Conservation is checked against net_from_estate, not total, because total includes collated donations that never left the physical estate"
  - "Nothing in output_check.rs may panic — a panic becomes an unrecoverable WASM trap"
requirements-completed: []
requirements-blocked: [OBS-05, OBS-06]
duration: ~30 min
completed: 2026-07-31
---

# Phase 5 Plan 05: Runtime Conservation and Duplicate-Heir Rejection Summary

The two invariants are now runtime checks on the production path rather than test assertions. The
implementation is complete and correct. **The plan's central safety claim is falsified by measurement,
and the plan-level frontend gate does not pass** — see BLOCKED below.

- **Tasks:** 2 of 2 implemented
- **Files created:** 1 · **Files modified:** 4
- **Commit:** `a294f5b55` — `feat(05): reject a non-conserving or duplicated distribution at runtime`
- **Status: BLOCKED on OBS-05 and OBS-06** — `npm run test:gate` exits 1.

## What was built

`pub fn run_pipeline_checked(input: &EngineInput) -> Result<EngineOutput, Vec<OutputDefect>>`

Runs `run_pipeline`, then `check_output(&output, &input.net_distributable_estate)`. `run_pipeline`
keeps its exact original signature — `grep -c "pub fn run_pipeline(input: &EngineInput) -> EngineOutput"`
returns **1** — so `engine/tests/fuzz_invariants.rs`'s `catch_unwind` harness and the 30 integration
tests are untouched.

`pub fn check_output(output: &EngineOutput, net_estate: &Money) -> Result<(), Vec<OutputDefect>>`

Collects **every** defect, never short-circuits, never modifies its input, and cannot panic:
`grep -cE "unwrap\(\)|expect\(|panic!" engine/src/output_check.rs` returns **0**.

### `Display` text of both defect variants — verbatim

```
sum conservation violated: per-heir net_from_estate totals {actual} centavos, distributable estate is {expected} centavos
duplicate heir_id in per_heir_shares: {heir_id} appears {occurrences} times
```

### The WASM error path plan 05-06 wraps — verbatim prefix

```
Engine output check failed: {defect}; {defect}; ...
```

`compute_json` renders the defect list with `Display`, joined by `"; "`, behind the exact prefix
`Engine output check failed: `. The two pre-existing error paths (`Input parse error: `,
`Output serialize error: `) are unchanged.

### `engine/src/main.rs` exit codes

| Code | Meaning |
|---|---|
| 0 | Success — a distribution was produced and passed the check |
| 1 | Read, parse or write failure (pre-existing behavior, unchanged) |
| 2 | **New** — the computed output failed the runtime conservation / uniqueness check. Each rendered defect is printed to stderr prefixed `engine output check failed: ` |

## Measured results

`cd engine && cargo test`:

```
test result: ok. 442 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s   (unittests src/lib.rs)
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s      (unittests src/main.rs)
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.07s      (tests/fuzz_invariants.rs)
test result: ok. 35 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s     (tests/integration.rs)
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s      (doc-tests)
CARGO_EXIT=0
```

478 passing. `cargo test --lib output_check` → **6 passed; 0 failed** (5 required, 1 extra asserting
the `Display` text). `cargo test --test fuzz_invariants` → **1 passed**.

Corpus loop over all 140 committed inputs through the checked CLI:

```
ok=140 rejected=0
```

`bash engine/build-wasm.sh` → exit 0, `inheritance_engine_bg.wasm` produced, 570,763 bytes.
`cd frontend && npx tsc -b --force` → zero output, `TSC_EXIT=0`.

## BLOCKED — OBS-05 and OBS-06

`cd frontend && npm run test:gate` **exits 1 with 5 violations**. Real output (test names only; each
carries the same two-line "Fix the regression / adding it to the ledger is prohibited" body):

```
TEST BASELINE GATE FAILED — 5 violation(s)

UNKNOWN FAILURE: src/__tests__/integration.test.tsx :: integration > compute handles invalid input gracefully compute() handles duplicate person IDs
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles negative centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles duplicate person IDs without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles negative estate centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles duplicate person IDs without crashing

GATE-SKIPS total=2436 skipped=0
GATE_EXIT=1
```

> **Correction.** This section originally recorded **2** violations. That count was wrong: the run was
> inspected with `| tail -10`, which truncated the gate's list. The real count is **5**, across three
> files, re-measured by checking out the committed 05-05 state of `engine/src/wasm.rs` and
> `frontend/src/wasm/bridge.ts`, rebuilding the WASM binary, and re-running the gate. All five are the
> same two conditions below; plan 05-06 adds none of them.

### Why this is not fixable inside this plan

Plan 05-05's objective states: *"a live corpus run over all 140 committed inputs found zero sum
violations and zero duplicate `heir_id` values. **That is what makes this plan safe: neither predicate
is new, and neither can turn a green suite red.**"*

That measurement was taken over the **Rust corpus only**. The frontend suite contains two adversarial
inputs the corpus does not, and both hit exactly the two conditions OBS-05 and OBS-06 require the
engine to reject. Measured directly with the CLI:

| Condition | Input | Engine's rendered defect | CLI exit | Tests affected |
|---|---|---|---|---|
| negative estate | `net_distributable_estate.centavos = -100` | `sum conservation violated: per-heir net_from_estate totals 0 centavos, distributable estate is -100 centavos` | 2 | 2 (`bridge.test.ts`, `wasm-real.test.ts`) |
| duplicate person ids | two `Person` rows both with `id: "lc1"` | `duplicate heir_id in per_heir_shares: lc1 appears 2 times` | 2 | 3 (`bridge.test.ts`, `wasm-real.test.ts`, `integration.test.tsx`) |

Both rejections are **correct** against the requirements as written:

- OBS-05 — *"A runtime conservation check asserts that per-heir shares sum exactly to the distributable
  estate, and rejects the output if not."* With a stated estate of −₱1 the engine silently distributed
  ₱0 and returned a distribution. The check catches a previously-invisible silent wrongness.
- OBS-06 — *"A runtime check rejects duplicate `heir_id` values in `per_heir_shares`."* The output
  carries `lc1` twice. There is no principled carve-out.

The two tests encode the **previous** silent-pass behavior (their own comments say "Real engine
accepts … at serde level and handles in pipeline"). One of the two — the test or the requirement — is
now wrong, and deciding which is a product decision this plan does not contain.

Nothing was done to make the gate green. Specifically **not** done, all of which are prohibited:

- the two tests were not edited, renamed, skipped, or deleted (plan constraint 7 also forbids touching
  anything under `frontend/`);
- they were not added to `frontend/test-baseline.json` (shrink-only; the gate itself prints that
  adding them is prohibited);
- `check_output` was not loosened, and no carve-out was added for a negative estate or a duplicate id;
- the `wasm.rs` wiring was **not** reverted to make the gate pass — de-wiring the browser path is the
  same class of move as weakening the check, and would leave OBS-05/OBS-06 unmet on the path that
  matters most.

### The decision the owner must make

Exactly one question, no legal content:

> When `computeWasm` is given an input the engine cannot distribute conservatively — a negative
> distributable estate, or two `Person` rows sharing an `id` — should it **(A)** reject with a
> structured error (current behavior after this plan, and what OBS-05/OBS-06 as written require), or
> **(B)** return a best-effort distribution as it did before (what the two `wasm-real.test.ts` tests
> assert)?
>
> If **(A)**: the five tests below must be rewritten to assert the rejection. That is a test rewrite
> driven by an intended behavior change, not a weakening — but it needs the owner's word, and plan
> 05-05 forbids editing `frontend/`.
>
> | File | Test |
> |---|---|
> | `frontend/src/__tests__/integration.test.tsx` | `compute() handles duplicate person IDs` |
> | `frontend/src/wasm/__tests__/bridge.test.ts` | `handles negative centavos without crashing` |
> | `frontend/src/wasm/__tests__/bridge.test.ts` | `handles duplicate person IDs without crashing` |
> | `frontend/src/wasm/__tests__/wasm-real.test.ts` | `handles negative estate centavos without crashing` |
> | `frontend/src/wasm/__tests__/wasm-real.test.ts` | `handles duplicate person IDs without crashing` |
>
> If **(B)**: OBS-05 and OBS-06 need rewording, and the check needs an explicit, documented carve-out
> for malformed input — which would be better placed as input validation than as an output-check
> exemption.

No point of Philippine law arises. Both predicates are arithmetic identities over the engine's own
output. **Nothing was added to `.planning/LAWYER-AGENDA.md`.**

## New tests

| Test | Asserts |
|---|---|
| `test_clean_output_passes` | `assert_eq!(check_output(..), Ok(()))` on a balanced two-heir output |
| `test_sum_mismatch_is_rejected` | exactly 1 defect, `SumMismatch { expected: 1000000, actual: 1000001 }` |
| `test_duplicate_heir_id_is_rejected` | exactly 1 defect, `DuplicateHeirId { heir_id: "h1", occurrences: 2 }` |
| `test_both_defects_are_reported_together` | defect vector length exactly **2** — the check does not short-circuit |
| `test_empty_shares_with_nonzero_estate_is_rejected` | `SumMismatch` with `actual: 0` |
| `test_display_text_of_both_variants` | the exact rendered strings (extra; plan 05-06 depends on them) |
| `test_run_pipeline_checked_returns_ok_on_a_real_case` | the checked entry point accepts a real intestate case |

## Deviations from Plan

**[Rule 2 - missing critical] `test_display_text_of_both_variants`** — the plan specifies exact
`Display` text and plan 05-06 wraps it, but no listed test asserted it. Added. 6 tests rather than 5.

**[Measurement, not a deviation] `grep -c run_pipeline_checked` returns 2, not 1, in both `wasm.rs`
and `main.rs`** — the acceptance criterion says "returns one match". Two lines match in each file: the
`use` statement and the call site. Switching the caller necessarily requires updating the existing
`use crate::pipeline::run_pipeline;` line, so 2 is the only achievable count. The criterion's intent —
that the checked entry point is the one invoked — holds: each file has exactly one call site.

**Total deviations:** 1 auto-fixed, 1 measurement recorded.

## Issues Encountered

The BLOCKED item above. It does not affect `cargo test`, the WASM build, or `tsc`, all of which are
clean — it is confined to two tests in `frontend/src/wasm/__tests__/wasm-real.test.ts`.

## Next

`05-06` (wave 4) wraps the `Engine output check failed: ` path this plan created. It can proceed, but
the frontend gate will stay red until the decision above is made, so `05-07`'s
`ALL GATES PASSED (11/11)` criterion cannot pass either.

---
phase: 06-property-test-coverage-depth
plan: 03
subsystem: testing
tags: [test-vectors, scenario-code, assertions, spec-conformance]
requires:
  - phase: 05-engine-observability-restored
    provides: "legitime_fraction / from_legitime / from_free_portion actually populated, so pinning per-heir totals pins a real computation rather than a placeholder"
provides:
  - "assert_total_centavos — exact-centavo assertion the whole-peso helper could not express"
  - "assert_vector_shape — scenario code + succession type + heir-row count in one call"
  - "All 23 legal vectors pinned to an exact ScenarioCode, SuccessionType, row count and per-heir centavo amount"
affects:
  - engine/tests/integration.rs
  - .planning/phases/14-lawyer-blocked-legal-fixes/
tech-stack:
  added: []
  patterns:
    - "Whole-vector shape assertion (code + type + row count) so a duplicated or dropped heir row is a test failure, not a silent change"
    - "Characterization locks are labelled as such in a comment, so a future reader can tell a spec-stated figure from a pinned observation"
key-files:
  created: []
  modified:
    - engine/tests/integration.rs
key-decisions:
  - "Every expected value was transcribed from the table in 06-03-PLAN.md task 2, never pasted back from engine output — all 78 matched on the first run, which is evidence the table and the engine agree rather than evidence of a tautology."
  - "assert_total_pesos and every existing call to it stay; the centavo helper is additive."
  - "check_scenario_consistency keeps its #[allow(dead_code)] attribute even though it is now called 23 times — removing dead-code attributes is plan 09's scope, and the attribute is harmless on a live function."
requirements-completed: [COV-03]
duration: ~25 min
completed: 2026-07-31
---

# Phase 6 Plan 03: Every Legal Vector Pinned

Before this plan, **zero** of the 23 legal test vectors asserted a scenario code —
`check_scenario_consistency` was defined and never called. Two vectors (TV-08, TV-18) asserted no
peso amount at all. All 23 now assert an exact `ScenarioCode`, an exact `SuccessionType`, an exact
`per_heir_shares.len()`, and an exact centavo amount for **every** heir row.

## Measured results

```
cargo test --test integration          -> 35 passed; 0 failed
grep -c "check_scenario_consistency(&output" tests/integration.rs   -> 23
grep -c "assert_vector_shape("                                      -> 24   (1 def + 23 calls)
grep -c "assert_total_centavos("                                    -> 78   (1 def + 77 rows)
grep -c "fn assert_total_pesos"                                     -> 1    (not removed)
grep -n  "starts_with"                                              -> (no output)
git diff --stat engine/tests/integration.rs -> 1 file changed, 212 insertions(+)   [0 deletions]
```

`cd engine && cargo test` — 6 binaries, **0 failed** on every one.
`check-lawyer-agenda.mjs` exit 0 · `check-observability.mjs` exit 0 · `check-commit-discipline.mjs` exit 0.

## Both new assertion kinds observed failing

Verified against a scratch perturbation, then restored to green:

```
thread 'test_tv04_spouse_only' panicked at tests/integration.rs:677:5:
assertion `left == right` failed: TV-04: scenario_code I11 != expected I10

thread 'test_tv18_escheat_to_state' panicked at tests/integration.rs:659:5:
assertion `left == right` failed: TV-18 STATE: total 500000000 centavos != expected 499999999 centavos

test result: FAILED. 33 passed; 2 failed
```

Restored: `test result: ok. 35 passed; 0 failed`.

## Spec-notation reconciliations recorded in the file

Four spec table entries are not `ScenarioCode` variants; each carries the plan's verbatim comment
above its `assert_vector_shape` call:

| Vector | Spec notation | Pinned as | Reason recorded in file |
|---|---|---|---|
| TV-07 | `T3 → I2` | `T3` + `IntestateByPreterition` | institution detected then annulled |
| TV-14 | `MIXED` | `T3` + `Mixed` | MIXED is the succession type, not a code |
| TV-16 | `T12-AM` | `T12` | `-AM` is the articulo-mortis annotation |
| TV-19 | `I2 → I5` | `I5` | I5 is the final emitted code after the restart |
| TV-20 | `I-ID` | `I5` | not a variant; pinned as a characterization |

TV-13's `ic3` row carries the rounding note: the spec displays ₱1,666,666.67 for all three ICs,
which would sum to ₱5,000,000.01; the engine emits 166666667 / 166666667 / **166666666** under the
largest-remainder distribution, summing to exactly 5000000000 centavos. Conservation requires it.

## Open legal questions cited, not answered

TV-15 cites `LAWYER-DECISION: LAWYER-03` (the full-blood to half-blood ratio under Art. 1006) and
TV-20 cites `LAWYER-DECISION: LAWYER-04` (Art. 992's reach into the collateral line, which blocks
LAW-07 in Phase 14). Both comments state explicitly that the pinned amounts are characterizations
of current behaviour and not answers. `.planning/LAWYER-AGENDA.md` and
`.planning/lawyer-decisions.json` were not modified; `check-lawyer-agenda.mjs` still reports
`8 decisions, 10 anchors, 8 awaiting-answer`.

## Nothing weakened

The diff is **212 insertions, 0 deletions**. No assertion was removed or relaxed, no
`#[allow(dead_code)]` was stripped, no uncalled helper was deleted, and the deliberately-prefix
`INV10` check in `engine/tests/fuzz_invariants.rs` was not touched.

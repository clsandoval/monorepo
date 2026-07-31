---
phase: 05-engine-observability-restored
plan: 07
subsystem: gates
tags: [observability, anti-regression, gate, corpus-test]
requires: ["05-02", "05-06"]
provides:
  - "engine/tests/observability.rs — corpus-wide behavioral proof (runs under G1)"
  - "scripts/check-observability.mjs — static source guard, registered as gate G11"
  - "GATES.md section 9, README.md eleven-gate table"
affects:
  - gates.manifest.json
  - gates.manifest.lock
tech-stack:
  added: []
  patterns:
    - "Two anti-regression mechanisms: G1's corpus test catches behavioral regression, G11 catches source regression on a path no test covers"
key-files:
  created:
    - engine/tests/observability.rs
    - scripts/check-observability.mjs
    - scripts/fixtures/obs-finalize-suppressed.rs
    - scripts/fixtures/obs-finalize-zeroed.rs
    - scripts/fixtures/obs-flags-incomplete.rs
    - scripts/fixtures/obs-wasm-unstructured.rs
    - scripts/fixtures/obs-output-check-missing.rs
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - README.md
key-decisions:
  - "All matching in check-observability.mjs is literal, never regex — the searched strings contain [, ], !, : and ( "
  - "Forbidden literals are assembled from fragments in the script so it cannot match its own source"
  - "G11 takes order 9; G8 moves to 10 and G9 to 11, because check-gate-results.mjs must stay last"
requirements-completed: [OBS-01, OBS-02, OBS-03, OBS-04, OBS-09]
requirements-blocked: []
duration: ~35 min
completed: 2026-07-31
---

# Phase 5 Plan 07: Corpus Observability Test and Anti-Regression Gate G11 Summary

The phase is locked in behaviorally and statically. `engine/tests/observability.rs` asserts the
inverted baseline across all 140 committed inputs on every `cargo test`, and gate `G11` fails the
build if either hardcoded line this phase removed reappears in source.

- **Tasks:** 3 of 3
- **Files created:** 7 · **Files modified:** 4
- **Commit:** `9cf3236f9` — `build(05): gate engine observability against its own regression` (11 paths)

## Corpus test results

`cd engine && cargo test` — now **6** binaries, was 5:

```
Running unittests src/lib.rs
test result: ok. 442 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
Running unittests src/main.rs
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
Running tests/fuzz_invariants.rs
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.10s
Running tests/integration.rs
test result: ok. 35 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
Running tests/observability.rs
test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.11s
Doc-tests inheritance_engine
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

481 passing, 0 failed. The three new tests are `test_observability_across_corpus`,
`test_output_check_holds_across_corpus` and `test_at_least_one_case_emits_a_warning`.

### Counts observed across the 140-file corpus (564 per-heir rows)

| # | Assertion | Baseline | Observed |
|---|---|---|---|
| 1 | every row has a non-empty `legitime_fraction` | 0 of 564 | **564 of 564** |
| 2 | rows with a nonzero `from_legitime` > 0 | 0 | **105** |
| 3 | rows with a nonzero `from_free_portion` > 0 | 0 | **25** |
| 4 | rows with a nonzero `from_intestate` > 0 | 0 | **457** |
| 5 | every case has `computation_log.steps.len() >= 10` | every case had exactly 1 | **all pass** (10 no-restart, 18 with one) |
| 6 | `from_legitime + from_free_portion + from_intestate == gross_entitlement` on every row | vacuous, all three zero | **0 mismatches** |
| — | `check_output` returns `Ok(())` for every case | n/a | **0 of 140 rejected** |
| — | cases emitting at least one warning > 0 | 0 of 140 | **42 of 140** |

The test asserts a corpus floor of `MIN_CORPUS_FILES = 140` before anything else, so deleting
committed inputs to make an assertion vacuous fails on that line first.

## Gate `G11` — the six verdicts, each observed firing

`node scripts/check-observability.mjs` with no flags:

```
OBSERVABILITY OK — 10 flag codes, 5 files scanned, 0 suppressed lines
GATE-SKIPS total=5 skipped=0
EXIT=0
```

| Invocation | Marker printed | Exit | `GATE-SKIPS` line |
|---|---|---|---|
| `--finalize scripts/fixtures/obs-finalize-suppressed.rs` | `WARNINGS SUPPRESSED: …obs-finalize-suppressed.rs:12 re-hardcodes an empty warnings vector.` | 1 | yes |
| `--finalize scripts/fixtures/obs-finalize-zeroed.rs` | `SUBCOMPONENTS ZEROED` ×2 (lines 12 and 16, naming which literal matched) | 1 | yes |
| `--flags scripts/fixtures/obs-flags-incomplete.rs --corpus-test /dev/null` | `FLAG CODE MISSING: RESERVA_TRONCAL …` **and** `FLAG CODE UNTESTED: RESERVA_TRONCAL …` | 1 | yes |
| `--wasm scripts/fixtures/obs-wasm-unstructured.rs` | `BOUNDARY ERROR UNSTRUCTURED: … no longer names the failure kinds invalid_input, output_check, serialize` | 1 | yes |
| `--output-check scripts/fixtures/obs-output-check-missing.rs` | `OUTPUT CHECK MISSING` ×2 (`SumMismatch`, `DuplicateHeirId`) | 1 | yes |
| `--wasm /tmp/definitely-not-a-source-file.rs` | `OBSERVABILITY SCAN UNREADABLE: wasm file … does not exist` | 1 | yes (`total=0`) |

`FLAG CODE UNTESTED` has two arms. The fixture run above exercises the *absent-code* arm. The
*declared-but-untested* arm was additionally driven with a throwaway (deliberately **not** committed)
copy of `flags.rs` truncated at `#[cfg(test)]`, which produced ten `FLAG CODE UNTESTED` lines and exit
1 — so neither arm is dead code.

Hygiene, run and observed:

- `grep -cE "writeFileSync|appendFileSync|--fix|--update|--accept|--regenerate|execSync|spawnSync" scripts/check-observability.mjs` → **0**
- `grep -nE "^import" scripts/check-observability.mjs` → only `node:fs` and `node:path`
- `cd engine && cargo test` unchanged after the fixtures exist — they live under `scripts/fixtures/`, outside the crate

The three forbidden literals are assembled from string fragments inside the script
(`'warnings: ' + 'vec![]'`) so the guard cannot match its own source, and verdicts 1 and 2 skip lines
whose trimmed form starts with `//` so `GATES.md` prose does not re-trigger the gate it documents.

## Manifest after the reorder

`node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 11 gates, 11 locked`, exit 0.

| order | id | blocking | command |
|---|---|---|---|
| 1 | G5 | true | `node scripts/check-gate-manifest.mjs` |
| 2 | G6 | true | `node scripts/check-plan-closed-world.mjs` |
| 3 | G7 | true | `node scripts/check-commit-discipline.mjs` |
| 4 | G1 | true | `cd engine && cargo test` |
| 5 | G2 | true | `bash engine/build-wasm.sh` |
| 6 | G3 | true | `cd frontend && npm run test:gate` |
| 7 | G4 | true | `cd frontend && npx tsc -b --force` |
| 8 | G10 | true | `node scripts/check-lawyer-agenda.mjs` |
| **9** | **G11** | **true** | **`node scripts/check-observability.mjs`** |
| 10 | G8 | true | `node scripts/check-gate-skips.mjs` |
| 11 | G9 | true | `node scripts/check-gate-results.mjs` |

`G9` is still the highest order. `git diff -- gates.manifest.lock` is an **addition only**:

```diff
       "id": "G10",
       "command": "node scripts/check-lawyer-agenda.mjs",
       "blocking": true
+    },
+    {
+      "id": "G11",
+      "command": "node scripts/check-observability.mjs",
+      "blocking": true
     }
   ]
 }
```

No pre-existing `command` or `blocking` line was modified.

## G11 inside the runner

```
bash scripts/ci-gates.sh --only G11

=== GATE G11 (9/11): engine observability ===
OBSERVABILITY OK — 10 flag codes, 5 files scanned, 0 suppressed lines
GATE-SKIPS total=5 skipped=0
GATE G11 PASSED (ran with --only G11; this is NOT a full gate run)
ONLY_G11_EXIT=0
```

`grep -c GATE-SKIPS .gate-runs/logs/G11.log` → **1**, so G8 has a report to account for.

## BLOCKED — `ALL GATES PASSED (11/11)` not reached

`bash scripts/ci-gates.sh` → `GATE FAILED: G3 (exit 1)`, `GATES_EXIT=1`. Real output:

```
=== GATE G5 (1/11): gate manifest integrity ===   MANIFEST OK — 11 gates, 11 locked
=== GATE G6 (2/11): plan closed-world lint ===    PLANS OK — 27 plan file(s), 102 task(s) checked
=== GATE G7 (3/11): commit discipline audit ===   GATE-SKIPS total=95 skipped=0
=== GATE G1 (4/11): engine tests ===              (passed)
=== GATE G2 (5/11): wasm build ===                GATE-SKIPS total=3 skipped=0
=== GATE G3 (6/11): frontend suite vs ledger ===
TEST BASELINE GATE FAILED — 5 violation(s)
GATE FAILED: G3 (exit 1)
```

The five violations are the OBS-05/OBS-06 product decision documented in `05-05-SUMMARY.md`. **This
plan introduced none of them and cannot resolve them** — it may not edit anything under
`frontend/src/`, and the ledger may only shrink.

Because the runner is fail-closed and halts on the first blocking failure, gates G4, G10, G11, G8 and
G9 never execute in a full run. Each was therefore run directly:

| Gate | Command | Exit | Output |
|---|---|---|---|
| G4 | `cd frontend && npx tsc -b --force` | **0** | zero output |
| G10 | `node scripts/check-lawyer-agenda.mjs` | **0** | `AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer` |
| G11 | `node scripts/check-observability.mjs` | **0** | `OBSERVABILITY OK — 10 flag codes, 5 files scanned, 0 suppressed lines` |
| G8 | `node scripts/check-gate-skips.mjs` | **1** | `SKIP REPORT MISSING` for G4, G10, G11 — *because the halted run produced no logs for them* |
| G9 | `node scripts/check-gate-results.mjs` | **1** | `PUBLISHED GATE RESULTS REJECTED` — same cascade |

G8 and G9 fail **only** as a consequence of the halt: both inspect the artifacts of a completed run,
and a run that stopped at gate 6 of 11 has none for gates 7–11. Neither is a defect in this plan's
work. When G3 goes green, all eleven are expected to pass; that cannot be asserted here and is not
claimed.

Nothing was done to route around this: no test was edited or skipped, `gate-skips.lock` was not
touched, `test-baseline.json` was not touched, and no gate was made non-blocking.
`git status --porcelain engine/src/ frontend/src/ engine/examples/ specs/ gate-skips.lock` → **empty**.

No point of Philippine law arises. Every assertion is about the presence of a field, a string or a
count. **Nothing was added to `.planning/LAWYER-AGENDA.md`.**

## Phase-closing before/after table (all six measured quantities)

ROADMAP Phases 7, 8 and 14 rely on these being nonzero to know their own legal fixes are observable.

| Quantity | Before Phase 5 | After Phase 5 | Guarded by |
|---|---|---|---|
| rows with a nonzero `from_legitime` | **0** | **105** | `test_observability_across_corpus`, G11 `SUBCOMPONENTS ZEROED` |
| rows with a nonzero `from_free_portion` | **0** | **25** | same |
| rows with a nonzero `from_intestate` | **0** | **457** | same |
| rows with a non-empty `legitime_fraction` | **0** of 564 | **564** of 564 | same |
| cases emitting at least one warning | **0** of 140 | **42** of 140 | `test_at_least_one_case_emits_a_warning`, G11 `WARNINGS SUPPRESSED` |
| `computation_log.steps` length | **1**, every case | **10** no restart / **18** one restart | `test_observability_across_corpus`, integration tests |
| spec §13.1 flag codes declared in the crate | **0** of 10 | **10** of 10 | G11 `FLAG CODE MISSING` / `FLAG CODE UNTESTED` |
| runtime rejection of a non-conserving or duplicated distribution | none | `check_output` on the production path | G11 `OUTPUT CHECK MISSING` |
| WASM boundary failure shape | ad-hoc sentence | `{"error":{"kind","message","detail"}}` | G11 `BOUNDARY ERROR UNSTRUCTURED` |

## Deviations from Plan

**[Measurement] `bash scripts/ci-gates.sh` → `ALL GATES PASSED (11/11)` not met**, for the inherited
05-05 reason above. Reported, not worked around.

**[Rule 2 - missing critical] The `FLAG CODE UNTESTED` declared-but-untested arm was additionally
driven** with an uncommitted truncated `flags.rs`, because the plan's specified invocation exercises
only the absent-code arm and a gate arm nobody has seen fire is not known to be a gate.

**[Note] The flags fixture's header comment deliberately does not name the code it removes.** Naming
it would have left the string in the file and defeated `FLAG CODE MISSING`. Caught by running the
fixture and observing the gate pass when it should have failed.

**Total deviations:** 1 extra verification, 1 measurement recorded, 1 fixture-authoring note.

## Issues Encountered

The inherited 05-05 blocker (G3). Everything this plan owns is green.

## Next

Phase 5 implementation is complete across all seven plans. The phase cannot be marked verified while
G3 is red; the single outstanding decision is recorded in `05-05-SUMMARY.md`.

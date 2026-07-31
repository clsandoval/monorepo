---
phase: 02-loop-durability-commit-discipline
plan: 06
subsystem: loop-durability
tags: [loop-status, stall-detection, visible-signal]
requires:
  - 02-04
  - 02-05
provides:
  - scripts/loop-status.mjs
  - LOOP-STATUS.md
  - loop-history.jsonl
affects: []
tech-stack:
  added: []
  patterns:
    - EXIT trap captures the incoming exit code and re-exits it unconditionally
    - bounded append-then-truncate JSONL history (200 records)
    - fixed stall rule, no configurable threshold
key-files:
  created:
    - scripts/loop-status.mjs
    - LOOP-STATUS.md
    - loop-history.jsonl
    - scripts/fixtures/history-stalled.jsonl
    - scripts/fixtures/history-mixed.jsonl
    - scripts/fixtures/history-recovered.jsonl
  modified:
    - scripts/ci-gates.sh
    - GATES.md
    - README.md
key-decisions:
  - "The stall rule is fixed: 3 consecutive non-pass runs sharing a signature, or 5 consecutive non-pass runs regardless. No threshold is configurable."
  - "State precedence puts a passing most-recent run at GREEN immediately, so recovery is instant. A banner that stayed red after recovery would train the owner to ignore it."
  - "`loop-status.mjs check` is NOT invoked by ci-gates.sh: a stall detector that failed the gate run would make the stall self-perpetuating."
  - "No notification channel was invented. None is configured in this repo; the signal is the committed LOOP-STATUS.md plus the CI check that already fails on any nonzero runner exit."
requirements-completed: [LOOP-06]
duration: ~30 min
completed: 2026-07-31
---

# Phase 2 Plan 06: Committed Loop Status with a Fixed Stall Rule Summary

An owner returning after two weeks opens one committed file, `LOOP-STATUS.md`, and learns whether
the loop is healthy, red, blocked, or stuck repeating itself. Every full gate run appends one line
to a bounded history and regenerates that file, from a `trap … EXIT` that fires on the success,
failure and halt paths alike.

**Tasks:** 4 of 4 · **Files:** 6 created, 3 modified · **Commit:** `e0c8c6b4a`

## The stall rule, observed on both halves plus the boundary

| History | Printed state | Exit |
|---|---|---:|
| `history-stalled.jsonl` — 2 pass, then 3 × `fail` `G3:1` | `LOOP STATUS STALLED — 5 record(s), streak 3` | **1** |
| `history-mixed.jsonl` — 1 pass, then 5 non-pass with 5 different signatures | `LOOP STATUS STALLED — 6 record(s), streak 5` | **1** |
| `history-recovered.jsonl` — 5 × `fail` `G3:1`, then 1 `pass` | `LOOP STATUS GREEN — 6 record(s), streak 0` | **0** |
| `/tmp` boundary — exactly 2 × `fail` `G3:1` | `LOOP STATUS RED — 2 record(s), streak 2` | **0** |
| `--history /tmp/definitely-not-a-file.jsonl` | `LOOP HISTORY UNREADABLE: no such file` (no stack trace) | 1 |

`history-mixed.jsonl` is the one that matters for coverage of the rule: no three consecutive entries
share a signature, so it exercises the five-run half in isolation. The two-entry boundary confirms
the window is genuinely three, not two.

A `record` run appending a `fail`/`G3:1` onto `history-stalled.jsonl` (with `--status` pointed at
`/tmp`) produced a status file whose first two lines are:

```
<!-- GENERATED FILE — do not hand-edit. Rewritten by `node scripts/loop-status.mjs record` on every full gate run. -->
# LOOP STATUS: STALLED — NEEDS OWNER ATTENTION
```

## The recorder fires on all three exit paths, and changes none of them

Starting from an emptied history, one run of each kind:

| Run | Runner exit | Appended history line |
|---|---:|---|
| `GATES_INJECT_GATE_FAIL=G6 …` | **1** | `outcome: "fail"`, `failure_signature: "G6:3"`, `gates_run: 2` |
| `GATES_INJECT_PRECONDITION_FAIL=G6 …` | **2** | `outcome: "cannot-run"`, `failure_signature: "CANNOT_RUN:G6"`, `gates_run: 2` |
| `bash scripts/ci-gates.sh` | **0** | `outcome: "pass"`, `failure_signature: ""`, `gates_run: 7` |

History grew by exactly **3** lines. All three exit codes are identical to plan 02-04's contract, so
the recorder demonstrably cannot turn a red run green.

`bash scripts/ci-gates.sh --only G5` exits 0 and prints
`Partial run (--only G5) was not recorded in loop-history.jsonl.`; the history line count was
unchanged after it.

## The committed status file

```
<!-- GENERATED FILE — do not hand-edit. Rewritten by `node scripts/loop-status.mjs record` on every full gate run. -->
# LOOP STATUS: GREEN
```

Its per-gate table lists all seven of `G1`–`G7` (7 matching rows). `loop-history.jsonl` was committed
at **4 lines**, every line parsing as JSON, well inside the 200-record cap.

## Phase closing evidence — a full run of the complete gate set

Independently re-run at the end of the phase:

```
=== GATE G5 (1/7): gate manifest integrity ===   MANIFEST OK — 7 gates, 7 locked
=== GATE G6 (2/7): plan closed-world lint ===    PLANS OK — 10 plan file(s), 40 task(s) checked
=== GATE G7 (3/7): commit discipline audit ===   COMMIT DISCIPLINE OK — 42 commits, 22 touching the app, 0 mixed
=== GATE G1 (4/7): engine tests ===              411 + 1 + 30 passed; 0 failed; 0 ignored
=== GATE G2 (5/7): wasm build ===                ok
=== GATE G3 (6/7): frontend suite vs ledger ===  GATE OK — test baseline matches exactly; LEDGER SIZE (debt): 46
=== GATE G4 (7/7): typecheck ===                 ok
GATE COVERAGE 7/7
REQUIREMENT COVERAGE 6/94 gated
COVERAGE OK
ALL GATES PASSED (7/7)
LOOP STATUS GREEN
```

Exit 0, 44 seconds wall clock. The exit contract re-verified in the same pass: `GATE_FAIL` → 1,
`PRECONDITION_FAIL` → 2, `NOT_FOUND` → 2, `MISSING_TOOL` → 2, `--only G99` → 1.

The frontend ledger is unchanged at **46** known failures — nothing was added to it during this
phase, and no test, assertion or gate was weakened anywhere.

## Verification

- `grep -c "loop-status.mjs check" scripts/ci-gates.sh` → **0** (the detector is not wired in)
- `grep -cE "gates\.manifest|fetch\(|http|child_process" scripts/loop-status.mjs` → **0** (no
  notification channel, no network, no subprocess, and the recorder is not a gate)
- Imports: only `node:fs` and `node:path`; 291 lines
- `scripts/ci-gates.sh` contains `loop-status.mjs`, `record --run`, and `LOOP STATUS RECORDER FAILED`
- `test "$(wc -l < loop-history.jsonl)" -le 200` → passes
- `node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 7 gates, 7 locked` (this plan did not touch
  the manifest or the lock)
- Committed through the wrapper:
  `SAFE COMMIT OK — e0c8c6b4aefca2089bf4911a86980db5e23400cf, 9 path(s) committed`

## Deviations from Plan

**[Rule 1 — bug] The generated-file notice pushed the state banner past line 2.** The plan requires
both that `LOOP-STATUS.md` says it is generated and that its state token appears in the first two
lines. A three-line HTML comment satisfied the first and broke the second. Collapsed the notice to a
single line, so line 1 is the notice and line 2 is the banner.

**[Rule 1 — bug] A comment in `scripts/ci-gates.sh` quoted `loop-status.mjs check` while explaining
why it is not invoked**, which tripped the zero-occurrence acceptance grep on the script's own
documentation. Reworded to "the stall detector (the recorder's other subcommand)". The prohibition
is unchanged.

**[Observation, not fixed] The status table's `name` column renders `—`.** The run-record schema
frozen by plan 02-04 carries `{id, status, exit_code, started_at, ended_at}` and no gate name, and
this plan's acceptance criteria forbid `loop-status.mjs` from reading `gates.manifest.json`. Adding
`name` to the run record would be an unspecified schema change — exactly the executor invention this
phase exists to prevent — so it was not made. Gate ids, statuses and exit codes are all present and
correct; the names are one file away in `GATES.md` section 1. Worth a one-line plan in a later phase.

**Total deviations:** 2 auto-fixed, 1 recorded and deliberately not acted on. **Impact:** none on
behavior.

## Issues Encountered

None. No point of Philippine law arose anywhere in this plan or this phase, so nothing was added to
the lawyer review agenda.

## Next

Phase 2 complete — all six plans executed. Ready for Phase 3 (Reproducible Environment & Gate
Reporting), which extends `.gate-runs/latest.json` into the published gate-results format GATE-08
asks for.

## Self-Check: PASSED

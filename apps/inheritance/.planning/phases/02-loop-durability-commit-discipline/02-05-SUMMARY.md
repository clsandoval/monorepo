---
phase: 02-loop-durability-commit-discipline
plan: 05
subsystem: loop-durability
tags: [coverage, scope-narrowing, manifest]
requires:
  - 02-04
provides:
  - scripts/gate-coverage.mjs
  - coverage closeout on the runner's full green path
affects:
  - scripts/loop-status.mjs (plan 02-06 renders the same run record)
tech-stack:
  added: []
  patterns:
    - two-source join — frozen manifest as expectation, run record as observation
    - report first, exit code as a consequence of the report
key-files:
  created:
    - scripts/gate-coverage.mjs
    - scripts/fixtures/run-green.json
    - scripts/fixtures/run-narrowed.json
    - scripts/fixtures/run-halted.json
  modified:
    - scripts/ci-gates.sh
    - GATES.md
key-decisions:
  - "Enforcement is exactly one rule: fail when outcome is `pass` AND a blocking manifest gate is `not-run`. Failed and halted runs are exempt because they legitimately reach fewer gates."
  - "Requirement coverage is informational and referenced by no enforcement rule. 88 of 94 ids are ungated today and will be until their phases land; failing there would freeze the loop."
  - "Coverage is skipped on --only runs, which would otherwise report a narrowing on every developer iteration and train operators to ignore the signal."
requirements-completed: [LOOP-04]
duration: ~25 min
completed: 2026-07-31
---

# Phase 2 Plan 05: Coverage Against the Frozen Manifest Summary

A green run now has to prove it executed the *whole* frozen gate set, not merely that whatever it
ran passed. `scripts/gate-coverage.mjs` joins `gates.manifest.json` (the expectation) against
`.gate-runs/latest.json` (the observation) and fails a **passing** run that skipped a blocking gate.

**Tasks:** 3 of 3 · **Files:** 4 created, 2 modified · **Commit:** `6625632a9`

## From a real full run

```
GATE COVERAGE 7/7
REQUIREMENT COVERAGE 6/94 gated
COVERAGE OK
ALL GATES PASSED (7/7)
```

The order matters and is asserted: `GATE COVERAGE 7/7` and `COVERAGE OK` print **before**
`ALL GATES PASSED (7/7)`, so a narrowed run can never reach the whole-run success message.

**Closing coverage figure for this phase: 6 of 94 requirement ids gated (6.4%).**

| Requirement | Gate |
|---|---|
| GATE-01 | G3 |
| GATE-02 | G4 |
| GATE-03 | G2 |
| LOOP-01 | G6 |
| LOOP-03 | G5 |
| LOOP-05 | G7 |

Phase 2 opened at 4 gates / 3 gated requirements and closes at 7 gates / 6 gated requirements. Later
phases can measure the gated fraction rising against this number.

## Observed results — every path fired

| Run | Exit | Marker / line |
|---|---:|---|
| `--run scripts/fixtures/run-green.json` | 0 | `GATE COVERAGE 7/7`, `COVERAGE OK` |
| `--run scripts/fixtures/run-narrowed.json` | **1** | `SCOPE NARROWED` naming `G3 (frontend suite vs ledger) status=not-run`, `GATE COVERAGE 6/7` |
| `--run scripts/fixtures/run-halted.json` | **0** | `GATE COVERAGE 2/7`, `COVERAGE OK` |
| `/tmp` copy of run-green with an extra `G42` entry | 1 | `UNKNOWN GATE IN RECORD` |
| `--run /tmp/definitely-not-a-file.json` | 1 | `RUN RECORD UNREADABLE` |

`run-narrowed.json` is the load-bearing fixture: `outcome: "pass"`, empty `failure_signature`, and
`G3` — the 2,416-test frontend gate — marked `not-run`. That is precisely what a silently narrowed
scope looks like, and it exits 1.

`run-halted.json` is the counterweight: a `cannot-run` halt reaching 2 of 7 gates exits **0**. Without
that exemption the halt behavior built in plan 02-04 would be unusable, since every halt would also
report a narrowing.

None of the three fixtures failed for an ungated-requirement reason; requirement coverage is
referenced by no enforcement rule.

All three fixtures were generated *from* a real `.gate-runs/latest.json` emitted by a clean full run
and then mutated, so their shape cannot drift from what the runner actually writes.

## Runner behavior after wiring the closeout

| Invocation | Exit | Note |
|---|---:|---|
| `bash scripts/ci-gates.sh` | 0 | coverage runs, then `ALL GATES PASSED (7/7)` |
| `bash scripts/ci-gates.sh --only G5` | 0 | prints `Coverage is not evaluated on a partial run (--only G5).` |
| `GATES_INJECT_GATE_FAIL=G6 …` | 1 | failure path unchanged |
| `GATES_INJECT_PRECONDITION_FAIL=G6 …` | 2 | halt path unchanged |
| `GATES_INJECT_NOT_FOUND=G6 …` | 2 | halt path unchanged |
| `GATES_INJECT_MISSING_TOOL=cargo …` | 2 | preflight halt unchanged |

A useful incidental confirmation: running `gate-coverage.mjs` against the record left by a real
`--only G5` run reports `SCOPE NARROWED` on six gates. That is correct behavior, and it is exactly
why the closeout is skipped on partial runs.

## Verification

- `grep -cE "\|\| true" scripts/ci-gates.sh` → **0**; the closeout uses the same explicit
  `set +e` / `COVERAGE_RC=$?` / `set -e` shape as a gate
- `scripts/ci-gates.sh` contains `gate-coverage.mjs`
- `grep -cE "writeFileSync|appendFileSync" scripts/gate-coverage.mjs` → **0**
- Imports: only `node:fs` and `node:path`; 222 lines
- Runs from any cwd: `cd /tmp && node <abs path> --run <abs fixture>` → same table
- `node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 7 gates, 7 locked`
- `git diff --name-only HEAD -- gates.manifest.json gates.manifest.lock` → empty; this plan did not
  touch the manifest or the lock
- `bash -n scripts/ci-gates.sh` → syntax OK
- Committed through the wrapper: `SAFE COMMIT OK — 6625632a9967f905381053a2f77cc00c1c5dad7a, 6 path(s) committed`

## Deviations from Plan

**[Rule 1 — bug] `GATES.md` section 3 wrote "ungated" only in lowercase.** The acceptance criterion
requires the literal token `UNGATED`, which is what the script prints. Reworded the requirement-
coverage paragraph to name `UNGATED` explicitly. Documentation-only.

**Total deviations:** 1 auto-fixed. **Impact:** none on behavior.

## Issues Encountered

None.

## Next

Ready for 02-06, which renders the run record and coverage into a committed `LOOP-STATUS.md` with a
fixed stall rule.

## Self-Check: PASSED

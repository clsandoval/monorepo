---
phase: 02-loop-durability-commit-discipline
plan: 04
subsystem: loop-durability
tags: [gates, runner, exit-contract, halt]
requires:
  - 02-01
  - 02-02
  - 02-03
provides:
  - manifest-driven scripts/ci-gates.sh
  - .gate-runs/latest.json run record
  - seven locked gates
affects:
  - scripts/gate-coverage.mjs (plan 02-05 consumes the run record)
  - scripts/loop-status.mjs (plan 02-06 consumes the run record)
tech-stack:
  added: []
  patterns:
    - bash trap ... EXIT so the record is written on success, failure and halt alike
    - explicit `set +e` / `rc=$?` / `set -e` capture, never a short-circuit that discards status
    - node -e programs held in shell variables so each errexit suspension sits on top of its capture
key-files:
  created:
    - .gitignore
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - scripts/ci-gates.sh
    - GATES.md
    - README.md
key-decisions:
  - "Three-valued exit contract: 0 all gates ran and passed, 1 a gate ran and failed, 2 a gate could not run. Exit 2 is a halt reported as BLOCKED, not routed around."
  - "The runner iterates gates.manifest.json and contains zero hardcoded gate commands, so a gate can only stop running by being removed from the manifest — which GATE REMOVED rejects."
  - "The three cheap meta-gates run first (order 1-3). order is not covered by the lock, so the reorder was legal and MANIFEST OK confirmed it."
  - "The four GATES_INJECT_* hooks are fail-closed only: each can turn a green run red, none can turn a red run green. No flag or variable skips a gate."
requirements-completed: [LOOP-02, LOOP-03]
duration: ~35 min
completed: 2026-07-31
---

# Phase 2 Plan 04: Manifest-Driven Runner with a Cannot-Run Halt Summary

`scripts/ci-gates.sh` stopped being a list of four hardcoded shell blocks and became an interpreter
over `gates.manifest.json`. In the same restructure it gained a three-valued exit contract, so "the
toolchain is broken" and "the product is broken" are no longer the same answer.

**Tasks:** 4 of 4 · **Files:** 1 created, 5 modified · **Commit:** `7a19b3ffa`

## The gate set grew four → seven, through the documented procedure

| order | id | command (from `apps/inheritance`) | blocking |
|---:|---|---|---|
| 1 | G5 | `node scripts/check-gate-manifest.mjs` | true |
| 2 | G6 | `node scripts/check-plan-closed-world.mjs` | true |
| 3 | G7 | `node scripts/check-commit-discipline.mjs` | true |
| 4 | G1 | `cd engine && cargo test` | true |
| 5 | G2 | `bash engine/build-wasm.sh` | true |
| 6 | G3 | `cd frontend && npm run test:gate` | true |
| 7 | G4 | `cd frontend && npx tsc -b --force` | true |

`node scripts/check-gate-manifest.mjs` → exit 0, `MANIFEST OK — 7 gates, 7 locked`. G1–G4 kept their
`command` and `blocking` byte-identical; only their `order` changed, which the lock deliberately does
not cover. That reorder is itself the regression test for the lock's scoping decision.

## All three exit codes observed, and the discrimination proven on one gate

| Invocation | Exit | Marker | recorded `failure_signature` |
|---|---:|---|---|
| `bash scripts/ci-gates.sh` | 0 | `ALL GATES PASSED (7/7)` | `""` |
| `GATES_INJECT_MISSING_TOOL=cargo …` | 2 | `GATE CANNOT RUN: preflight` / `HALT: missing tool: cargo` | `PREFLIGHT:cargo` |
| `GATES_INJECT_PRECONDITION_FAIL=G6 …` | 2 | `GATE CANNOT RUN: G6` / `HALT: precondition failed — false` | `CANNOT_RUN:G6` |
| `GATES_INJECT_NOT_FOUND=G6 …` | 2 | `GATE CANNOT RUN: G6` / `HALT: command not found` | `CANNOT_RUN:G6` |
| `GATES_INJECT_GATE_FAIL=G6 …` | 1 | `GATE FAILED: G6 (exit 3)` | `G6:3` |

The last two rows are the point of the whole plan: **the same gate**, exit 2 when the command never
ran and exit 1 when it ran and failed. Under the Phase 1 runner both were exit 1.

`.gate-runs/latest.json` existed and parsed with exactly **7** gate entries after every one of the
five runs — including both halts — proving the `trap … EXIT` recorder fires on the paths it exists
for. Statuses degrade correctly: on the `G6` halts the record reads
`G5:pass, G6:cannot-run, G7:not-run, G1:not-run, G2:not-run, G3:not-run, G4:not-run`. The
`not-run` entries are the absence-as-data plan 02-05 turns into a coverage report.

`--only`: `--only G5` → exit 0, `GATE G5 PASSED (ran with --only G5; this is NOT a full gate run)`.
`--only G99` → exit 1, listing the valid ids `G5 G6 G7 G1 G2 G3 G4`. A partial run still never
prints a whole-run success message.

## Full-run duration and the argument for the reordering

Clean full run: **42 seconds wall clock**, exit 0, `ALL GATES PASSED (7/7)`.

| Group | Gates | Duration |
|---|---|---:|
| Meta-gates | G5, G6, G7 | **0 s** (sub-second each; all three round to 0 in the record's 1-second resolution) |
| Heavy gates | G1, G2, G3, G4 | **42 s** (G1 ~0 s, G2 9 s, G3 26 s, G4 7 s) |

The three meta-gates are free at this timescale, so running them first costs nothing and catches a
tampered manifest, an open-world plan, or a mixed commit before the WASM build and the 2,416-test
Vitest suite. On a cold checkout (no cargo target dir, no wasm-pack cache) the heavy side is minutes
rather than 42 seconds, which widens the argument further.

## Verification

- `bash scripts/ci-gates.sh` → exit 0, `ALL GATES PASSED (7/7)`
- `grep -cE "\|\| true|\|\| echo|--manifest" scripts/ci-gates.sh` → **0**
- `grep -c "cargo test" scripts/ci-gates.sh` → **0** (no hardcoded gate command survives)
- Every one of the 6 real `set +e` occurrences is followed within two lines by a `$?` capture
- `bash -n scripts/ci-gates.sh` → syntax OK
- `git status --porcelain apps/inheritance/.gate-runs` → empty (gitignored)
- `git log -1 --name-only` → exactly the 6 intended paths
- Committed through `scripts/safe-commit.sh`:
  `SAFE COMMIT OK — 7a19b3ffa419cd5b665b085ad3d54e6fcf047f99, 6 path(s) committed`

## Deviations from Plan

**[Rule 1 — bug] Three prose-vs-grep collisions in `ci-gates.sh`.** The header comment mentioned the
absent manifest flag by name, and the per-gate comment quoted the two short-circuit idioms it
prohibits; both made the zero-occurrence acceptance grep fail on the script's own documentation.
Reworded to describe them rather than quote them. Meaning preserved, behavior unchanged.

**[Rule 1 — bug] The run-record writer used a short-circuit for its warning.** `node -e '…' || echo
"WARNING: …"` both tripped the grep and swallowed a status. Replaced with an explicit
`set +e` / `REC_RC=$?` / `set -e` / `if` block, which is strictly better: the failure to write is now
branched on rather than discarded.

**[Rule 1 — bug] Two `set +e` statements were separated from their `$?` capture by a multi-line
`node -e` program.** Extracted both node programs into shell variables (`RECORD_WRITER_JS`,
`MANIFEST_READER_JS`) so each errexit suspension sits directly on top of its capture, satisfying the
adjacency criterion without changing behavior.

**Total deviations:** 3 auto-fixed. **Impact:** none on behavior; the second one strictly tightened
error handling.

## Issues Encountered

None.

## Next

Ready for 02-05, which joins the frozen manifest against `.gate-runs/latest.json` and fails a
*passing* run that skipped a blocking gate.

## Self-Check: PASSED

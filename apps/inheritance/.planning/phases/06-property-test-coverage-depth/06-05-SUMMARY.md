---
phase: 06-property-test-coverage-depth
plan: 05
subsystem: testing
tags: [assertion-discipline, static-analysis, gates, shrink-only-ledger]
requires:
  - phase: 06-property-test-coverage-depth
    provides: "06-04's manifest reorder, which reserved order 5 ahead of the gate Phase 5 leaves red"
provides:
  - "scripts/check-assertion-discipline.mjs — gate G13, four verdicts over every frontend test file"
  - "assertion-baseline.json — shrink-only ledger of the fifteen weak-only tests"
  - "GATES.md sections 1 and 11 — the thirteen-gate set and the assertion-discipline manual"
affects:
  - gates.manifest.json
  - .planning/phases/07-intestate-order-representation/
tech-stack:
  added: []
  patterns:
    - "Brace-and-string-aware block scanner instead of a regex, because a regex mis-parses matchers nested inside expect(...) arguments"
    - "Ledger keyed by file + full test name, never by line number, so unrelated edits cannot produce false failures"
key-files:
  created:
    - scripts/check-assertion-discipline.mjs
    - assertion-baseline.json
    - scripts/fixtures/assert-none.test.ts
    - scripts/fixtures/assert-weak-only.test.ts
    - scripts/fixtures/assert-strong.test.ts
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - README.md
key-decisions:
  - "The fifteen weak-only tests are ledgered, not rewritten. Rewriting each requires deciding what the stronger assertion should be, and several are product questions; three depend on Phase 5's open OBS-05/OBS-06 decision."
  - "ASSERTION-FREE TEST has no ledger and never will. The measured count is zero and a test that cannot fail is never acceptable."
  - "GATES.md section 1's gate table was stale (7 of 13 gates, pre-Phase-6 orders). Rewritten to match the manifest exactly — documentation accuracy, no behaviour change."
requirements-completed: [COV-05]
duration: ~35 min
completed: 2026-07-31
---

# Phase 6 Plan 05: Assertion Discipline, Gate G13

A frontend test that asserts nothing, or whose only matcher is `toBeDefined` / `toBeTruthy`, now
fails the build.

## Measured results — the scan reproduces planning exactly

```
node scripts/check-assertion-discipline.mjs
ASSERTION DISCIPLINE OK — 112 files, 2383 blocks, 0 assertion-free, 15 weak-only all declared
GATE-SKIPS total=2383 skipped=0                              (exit 0)

node scripts/check-gate-manifest.mjs -> MANIFEST OK — 13 gates, 13 locked
gate order: 1:G5 2:G6 3:G7 4:G12 5:G13 6:G1 7:G2 8:G3 9:G4 10:G10 11:G11 12:G8 13:G9
bash scripts/ci-gates.sh --only G13 -> GATE G13 PASSED       (exit 0)
git status --porcelain frontend/src frontend/test-baseline.json gate-skips.lock -> empty
```

Run against an empty ledger first, the scanner independently found **exactly the fifteen** tests the
plan's table names, with **identical matcher sets** for every one, and **zero** assertion-free tests.
112 files and 2383 blocks match the planning measurement to the unit. That agreement is worth more
than the gate passing: the ledger was not fitted to the scanner, and the scanner was not fitted to
the ledger.

## All four G13 verdicts observed firing

```
ASSERTION-FREE TEST: fixtures/assert-none.test.ts:5 :: does nothing — no matcher, no expect(, no assert, no snapshot
UNDECLARED WEAK ASSERTION: fixtures/assert-weak-only.test.ts:5 :: only weak — only matcher(s): toBeDefined. Give it a real assertion; do not append it to assertion-baseline.json.
STALE WEAK DECLARATION: src/__tests__/does-not-exist.test.tsx :: a test that was never written is declared in assertion-baseline-scratch.json but no weak-only test with that name was found; delete that entry.
ASSERTION SCAN UNREADABLE: .../scripts/fixtures/does-not-exist.json is missing or not parseable JSON: ENOENT
```

Each exited 1 and each printed its `GATE-SKIPS` line. The negative control
`scripts/fixtures/assert-strong.test.ts` — two strongly-asserting blocks, one inside a nested
`describe` — produced **no** violation, confirming the block scanner does not false-positive on
nesting. `STALE WEAK DECLARATION` was driven against a scratch ledger outside the repository; the
committed ledger stayed at exactly 15 entries throughout.

The three fixtures end in `.test.ts` but live outside `frontend/src`, so Vitest never collects them.

## Full runner: passes through G13, fails at G3 and nowhere earlier

```
=== GATE G5  (1/13): gate manifest integrity ===   MANIFEST OK — 13 gates, 13 locked
=== GATE G6  (2/13): plan closed-world lint ===    PLANS OK — 32 plan file(s), 117 task(s)
=== GATE G7  (3/13): commit discipline audit ===   COMMIT DISCIPLINE OK — 104 commits, 0 mixed
=== GATE G12 (4/13): engine coverage report ===    COVERAGE OK — 17 engine modules, 2 at zero coverage
=== GATE G13 (5/13): assertion discipline ===      ASSERTION DISCIPLINE OK — 112 files, 2383 blocks
=== GATE G1  (6/13): engine tests ===              7 binaries, 0 failed on every one
=== GATE G2  (7/13): wasm build ===                WASM BUILD OK (586591 bytes)
=== GATE G3  (8/13): frontend suite vs ledger ===  TEST BASELINE GATE FAILED — 5 violation(s)
GATE FAILED: G3 (exit 1)
FULL_RUN_EXIT=1
```

**`ALL GATES PASSED (13/13)` is NOT achievable in Phase 6 and is not claimed.** The five G3
violations are byte-identical to the ones Phase 5 recorded and are the same unresolved OBS-05/OBS-06
product decision:

```
UNKNOWN FAILURE: src/__tests__/integration.test.tsx :: ... compute() handles duplicate person IDs
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: ... handles negative centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: ... handles duplicate person IDs without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: ... handles negative estate centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: ... handles duplicate person IDs without crashing
```

Phase 6 did not touch any of those five tests and appended nothing to `frontend/test-baseline.json`.

## GATES.md section 1 table rewritten

The section 1 table listed only 7 of the then-11 gates and carried pre-Phase-6 orders. It now lists
all thirteen with their real orders, plus the paragraph the plan requires: that the gate set is now
thirteen, that G12 and G13 sit at orders 4 and 5 ahead of G1, and — stated plainly — that this is a
placement decision about two static checks and **not** a way of routing around a red gate. G3 still
runs, still fails, and still stops the run.

## Nothing weakened, nothing legal decided

Not one file under `frontend/src/` was edited — `git status --porcelain frontend/src` is empty.
`frontend/test-baseline.json` and `gate-skips.lock` are untouched. No existing gate `command` or
`blocking` value changed; `git diff gates.manifest.lock` is a single appended `G13` block. No gate
was removed, renamed or made non-blocking; the gate set grew from 11 to 13 across this phase.
`check-assertion-discipline.mjs` imports only `node:fs` and `node:path`, spawns no subprocess, and
has no `--fix`, `--update`, `--accept` or `--regenerate` flag. No point of Philippine law arose:
every assertion here is about the presence of a matcher name in a source file.

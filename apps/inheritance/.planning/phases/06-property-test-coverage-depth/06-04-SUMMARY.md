---
phase: 06-property-test-coverage-depth
plan: 04
subsystem: testing
tags: [coverage, llvm-cov, gates, ci]
requires:
  - phase: 06-property-test-coverage-depth
    provides: "06-02's 17 invariant tests and 06-03's pinned vectors — the test set coverage is measured over"
provides:
  - "scripts/coverage-report.sh — one-command per-module region/line/function coverage for the engine"
  - "engine/COVERAGE.md — the committed human-readable report"
  - "scripts/check-coverage.mjs — gate G12, four verdicts, no percentage threshold"
  - "coverage-zero.lock — shrink-only ledger of modules no test enters"
  - "gate manifest reordered so both Phase 6 gates run ahead of the gate Phase 5 leaves red"
affects:
  - gates.manifest.json
  - .github/workflows/inheritance-ci.yml
  - .planning/phases/06-property-test-coverage-depth/06-05-PLAN.md
tech-stack:
  added:
    - "rustup component llvm-tools-preview (NOT a crate — Cargo.toml and Cargo.lock untouched)"
  patterns:
    - "Generator and judge are separate scripts, so the check cannot rewrite its own baseline"
    - "Gate precondition tests for the tool, so a missing toolchain is a cannot-run halt (exit 2) rather than a gate failure"
key-files:
  created:
    - scripts/coverage-report.sh
    - scripts/check-coverage.mjs
    - scripts/fixtures/coverage-missing-module.json
    - scripts/fixtures/coverage-new-zero.json
    - scripts/fixtures/coverage-stale-zero.json
    - coverage-zero.lock
    - engine/COVERAGE.md
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - README.md
    - .github/workflows/inheritance-ci.yml
key-decisions:
  - "No coverage percentage threshold anywhere. COV-04 asks for a report, not a number, and nothing in the requirement or the repo grounds one."
  - "Regions, not branches: stable Rust coverage instrumentation is region-based and llvm-cov's Branches column is empty on stable. Stated in COVERAGE.md's own header so no reader wonders."
  - "MODULE ABSENT FROM REPORT exempts a source file that declares no function at all. engine/src/lib.rs is 17 pub mod lines with zero coverable code, so llvm-cov correctly emits no entry for it. The exemption cannot hide a real module — verified by the fixture that removes step7_distribute.rs, which still fails."
requirements-completed: [COV-04]
duration: ~45 min
completed: 2026-07-31
---

# Phase 6 Plan 04: Per-Module Engine Coverage and Gate G12

`bash scripts/coverage-report.sh` now produces a per-module region, line and function coverage report
for all 17 engine modules, writes it to `engine/COVERAGE.md`, and `node scripts/check-coverage.mjs`
(gate **G12**) fails the build when a module vanishes from it or when the set of modules no test
enters at all grows.

## Measured results

```
bash scripts/coverage-report.sh   -> COVERAGE REPORT WRITTEN — 17 engine modules   (exit 0)
node scripts/check-coverage.mjs   -> COVERAGE OK — 17 engine modules, 2 at zero coverage, all declared
                                     GATE-SKIPS total=17 skipped=0                 (exit 0)
node scripts/check-gate-manifest.mjs -> MANIFEST OK — 12 gates, 12 locked          (exit 0)
bash scripts/ci-gates.sh --only G12  -> GATE G12 PASSED                            (exit 0)
gate order: 1:G5 2:G6 3:G7 4:G12 6:G1 7:G2 8:G3 9:G4 10:G10 11:G11 12:G8 13:G9
git status --porcelain engine/Cargo.toml engine/Cargo.lock -> empty
git check-ignore -q .gate-runs -> yes
```

Zero-coverage modules observed: exactly `src/main.rs` and `src/wasm.rs`, matching the planning
measurement. Coverage totals across 17 modules: **13,113 regions**, of which the report names every
uncovered one per module, plus `### Uncovered functions` sections for the 14 modules that have any.

## No crate installed

`llvm-profdata` and `llvm-cov` come from the rustup component `llvm-tools-preview`, resolved through
`rustc --print sysroot` rather than assumed on `PATH`. `engine/Cargo.toml` and `engine/Cargo.lock`
are byte-unchanged; no npm package was added.

## All four G12 verdicts observed firing

```
MODULE ABSENT FROM REPORT: src/step7_distribute.rs exists under .../engine/src but has no entry in the coverage report
UNDECLARED ZERO COVERAGE: src/fraction.rs has 492 of 492 regions uncovered and is not declared in coverage-zero.lock. Write a test that enters it, or declare it with a reason.
STALE ZERO COVERAGE DECLARATION: src/wasm.rs now has 1 covered region(s); delete that entry from coverage-zero.lock.
COVERAGE REPORT UNAVAILABLE: no coverage summary at .../scripts/fixtures/does-not-exist.json. Run: bash scripts/coverage-report.sh
```

Each exited 1 and each printed its `GATE-SKIPS` line. Three came from committed fixtures under
`scripts/fixtures/`; the fourth from pointing `--summary` at a nonexistent path.

## Missing toolchain halts with exit 2, it does not fail

Driven with a PATH-scoped `rustc` shim reporting a bogus sysroot — the real toolchain was never
touched:

```
GATE CANNOT RUN: G12
HALT: precondition failed — test -x "$(rustc --print sysroot)/lib/rustlib/$(rustc -vV | sed -n 's/^host: //p')/bin/llvm-profdata"

This is a HALT (exit 2), not a gate failure.
HALT_EXIT=2
```

## Finding: `engine/src/lib.rs` has no coverage entry, correctly

The first green run of G12 failed with `MODULE ABSENT FROM REPORT: src/lib.rs`. Investigated rather
than excused: `engine/src/lib.rs` is four doc-comment lines and seventeen `pub mod` declarations —
**zero executable code, therefore zero coverage regions, therefore no `llvm-cov` entry**. Its absence
is correct, not suspicious.

The rule was made grounded rather than arbitrary: a source file is required in the report unless it
declares no function at all (`fn ` absent). That cannot hide a real module — every engine module that
computes anything declares functions — and the `coverage-missing-module.json` fixture, which removes
`src/step7_distribute.rs`, still fails. Documented in `GATES.md` section 10 and in the script.

## Manifest reordering

Every gate from G1 down moved two places (G1→6, G2→7, G3→8, G4→9, G10→10, G11→11, G8→12, G9→13),
freeing orders 4 and 5 for the two Phase 6 gates; G12 takes 4 and plan 06-05 takes 5. `G5`, `G6`,
`G7` keep 1–3 and **G9 stays last**.

`gates.manifest.lock` shows an **addition only** — `git diff` is one appended `G12` block. No `id`,
`command` or `blocking` value of any existing gate changed. `order` is deliberately unlocked
(`GATES.md` section 1), so the reorder is not a weakening. The reorder is what makes both Phase 6
gates executable at all: `scripts/ci-gates.sh` halts at G3 for Phase 5's unresolved OBS-05/OBS-06
decision, so a gate ordered after it would never run.

Stated plainly: because G12 builds the engine under instrumentation, a Rust compile error now
surfaces as `GATE FAILED: G12` before G1 is reached.

## Nothing weakened, nothing legal decided

No existing gate command changed, no gate was removed or made non-blocking; the gate set grew from 11
to 12. `gate-skips.lock` was not modified and G12 emits `skipped=0`. `engine/src/`, `engine/tests/`,
`engine/examples/`, `frontend/src/`, `engine/Cargo.toml` and `engine/Cargo.lock` were untouched —
this plan measures the engine, it does not change it. `check-coverage.mjs` imports only `node:fs` and
`node:path` and has no `--fix`, `--update`, `--accept` or `--regenerate` flag. No point of Philippine
law arose: every assertion here is about a file name, a count or a coverage number.

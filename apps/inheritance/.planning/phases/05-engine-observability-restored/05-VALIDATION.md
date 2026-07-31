---
phase: 5
slug: engine-observability-restored
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Engine framework** | Rust built-in harness. Unit tests inline under `#[cfg(test)] mod tests`; cross-module tests in `engine/tests/*.rs` |
| **Frontend framework** | Vitest 4.0.18, jsdom, setup file `frontend/src/test-setup.ts` |
| **Engine command** | `cd apps/inheritance/engine && cargo test` |
| **Single engine module** | `cd apps/inheritance/engine && cargo test --lib step10_finalize` |
| **Frontend gate command** | `cd apps/inheritance/frontend && npm run test:gate` |
| **Single frontend file** | `cd apps/inheritance/frontend && npx vitest run src/wasm/__tests__/wasm-errors.test.ts` |
| **Typecheck command** | `cd apps/inheritance/frontend && npx tsc -b --force` |
| **Full suite command** | `bash apps/inheritance/scripts/ci-gates.sh` |
| **Estimated runtime** | single Rust module ~10 s · full `cargo test` ~30 s · single Vitest file ~5 s · full frontend gate ~60 s · typecheck ~20 s · full runner ~300 s |

Phase 5 is the first phase in this project that edits `engine/src/` beyond comment lines. The
feedback loop is correspondingly tighter: `cargo test` runs after every task that touches a `.rs`
file, not at plan end.

---

## Baseline this phase must invert

Measured live during planning over the 140 committed inputs
(`engine/examples/cases/`, `engine/examples/fuzz-cases/`, `engine/examples/testate-cases/`):

| Quantity | Before Phase 5 | Required after Phase 5 |
|---|---|---|
| Per-heir rows with nonzero `from_legitime` | 0 of 564 | greater than 0 |
| Per-heir rows with nonzero `from_free_portion` | 0 of 564 | greater than 0 |
| Per-heir rows with nonzero `from_intestate` | 0 of 564 | greater than 0 |
| Per-heir rows with a nonempty `legitime_fraction` | 0 of 564 | 564 of 564 |
| `computation_log.steps` length | exactly 1, every case | exactly 10 with no restart, 18 with one restart |
| Cases with a nonempty `warnings` array | 0 of 140 | greater than 0 |
| Duplicate `heir_id` in `per_heir_shares` | 0 of 140 | 0 of 140, now enforced at runtime |
| `sum(net_from_estate) != net_distributable_estate` | 0 of 140 | 0 of 140, now enforced at runtime |

Both zero rows in the bottom half are why OBS-05 and OBS-06 can be promoted from test assertion to
runtime rejection without turning a green suite red.

---

## Sampling Rate

- **After every task that edits a file under `engine/src/` or `engine/tests/`:** run
  `cd engine && cargo test` immediately and read the `test result:` lines. A `Step10Input` field
  added without mirroring `engine/tests/integration.rs:147-163` does not compile, and finding that
  at plan end costs the whole plan's context.
- **After every task that edits a file under `frontend/src/`:** run that file's Vitest path first,
  then `npx tsc -b --force`.
- **After every task:** run that task's `<verify>` block verbatim and read the printed exit code.
- **After every plan:** run the plan's full `<verification>` checklist.
- **After waves 3, 4 and 5:** run `bash scripts/ci-gates.sh` in full.
- **Before phase sign-off:** the full runner exits 0 with `ALL GATES PASSED (11/11)`.
- **Max feedback latency:** 10 s for one Rust module, 30 s for the engine suite, 60 s for the
  frontend gate, 300 s for the full runner.

---

## Per-Plan Verification Map

| Plan | Wave | Requirements | Primary automated command | What it proves |
|---|---|---|---|---|
| 05-01 | 1 | OBS-01, OBS-09 | `cd engine && cargo test` | Warnings built by steps 1–9 reach `EngineOutput`; `computation_log.steps` has 10 entries |
| 05-02 | 1 | OBS-08 | `cd frontend && npx vitest run src/lib/__tests__/error-reporting.test.ts src/components/__tests__/ErrorBoundary.test.tsx` | A throwing component renders a fallback and the error is retrievable |
| 05-03 | 2 | OBS-03, OBS-04 | `cd engine && cargo test` | Per-heir sub-components sum to `gross_entitlement`; `legitime_fraction` is never empty |
| 05-04 | 2 | OBS-02 | `cd engine && cargo test` | All ten spec flag codes are declared, detected and observed in output |
| 05-05 | 3 | OBS-05, OBS-06 | `cd engine && cargo test` | A corrupted output is rejected at runtime, not merely asserted against |
| 05-06 | 4 | OBS-07 | `cd frontend && npx vitest run src/wasm/__tests__/wasm-errors.test.ts` | A malformed input yields a structured, typed error rather than a trap |
| 05-07 | 5 | OBS-01…OBS-09 | `bash scripts/ci-gates.sh` | The whole corpus shows the inverted baseline, and G11 fails when it regresses |

---

## Failure-Path Coverage

A check nobody has seen fail is not known to be a check. Every new check in this phase has a
committed way to observe it firing:

| Check | How its failure is observed |
|---|---|
| Conservation rejection (OBS-05) | Unit test hands the validator an `EngineOutput` whose first share is incremented by 1 centavo |
| Duplicate-id rejection (OBS-06) | Unit test hands the validator an `EngineOutput` with a cloned share |
| Structured input error (OBS-07) | Frontend test sends `{}` and a wrong-typed field, asserts the thrown value's shape |
| Frontend capture (OBS-08) | Component test renders a child that throws in render |
| `G11` regression gate | Five committed fixtures under `scripts/fixtures/`, each reintroducing one defect |

---

## Regression Guards

- `cd engine && cargo test` must report at least `442 passed` at every checkpoint. The count grows
  as tests are added; it may never fall.
- `cd frontend && npm run test:gate` must stay green against the 46-entry ledger.
  `frontend/test-baseline.json` may only shrink — appending an entry to go green is prohibited.
- `gate-skips.lock` must stay at exactly one declared skip. This phase introduces none.
- `node scripts/check-lawyer-agenda.mjs` must stay green. Plan 05-04 edits `engine/src/types.rs`
  immediately below the `LAWYER-DECISION: LAWYER-08` marker on `pub retroactive_ra_11642: bool`;
  moving, renaming or deleting either the marker or that line fails gate G10.
- `node scripts/check-gate-manifest.mjs` must report `MANIFEST OK` after plan 05-07 appends `G11`
  to both `gates.manifest.json` and `gates.manifest.lock`.

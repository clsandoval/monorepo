---
phase: 6
slug: property-test-coverage-depth
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Engine framework** | Rust built-in harness. Unit tests inline under `#[cfg(test)] mod tests`; cross-module tests in `engine/tests/*.rs` |
| **Frontend framework** | Vitest 4.0.18, jsdom, setup file `frontend/src/test-setup.ts` |
| **Engine command** | `cd apps/inheritance/engine && cargo test` |
| **One engine test binary** | `cd apps/inheritance/engine && cargo test --test fuzz_invariants` |
| **Engine CLI probe** | `cd apps/inheritance/engine && cargo build --release && ./target/release/inheritance-engine <case.json>` — exit 0 output JSON, exit 2 the runtime conservation/uniqueness check rejected the output |
| **Coverage command** | `cd apps/inheritance && bash scripts/coverage-report.sh` |
| **New static gates** | `node scripts/check-coverage.mjs` · `node scripts/check-assertion-discipline.mjs` |
| **Full runner** | `bash apps/inheritance/scripts/ci-gates.sh` · one gate: `bash apps/inheritance/scripts/ci-gates.sh --only G12` |
| **Estimated runtime** | `cargo test` ~40 s · instrumented coverage run ~120 s · assertion scan ~2 s · full runner ~300 s (currently halts at G3) |

Phase 6 writes **no** `engine/src/` code. Every deliverable is a test, a corpus, a generator, a
ledger, or a static check. `cargo test` is the primary feedback loop and runs after every task that
touches a `.rs` or `.json` corpus file.

---

## Baseline this phase changes

Measured live during planning. Full detail and the commands in `06-RESEARCH.md`.

| Signal | Before Phase 6 | After Phase 6 |
|---|---|---|
| `NephewNiece` heirs in any corpus | 0 files | ≥ 8 coverage cases + 1 defect case |
| `recipient_is_stranger: true` in any corpus | 0 files | ≥ 1 defect case |
| Max donation/estate ratio in any corpus | 0.5524 | ≥ 1.5 in `defect-cases/` |
| `Relationship` variants never exercised | 5 of 11 (`LegitimatedChild`, `LegitimateAscendant`, `NephewNiece`, `OtherCollateral`, `Stranger`) | 0 of 11 |
| Tests in `cargo test --test fuzz_invariants` | 1 | 15 |
| Invariants that evaluate nothing | 1 (`INV9`) | 0 |
| Legal vectors asserting a scenario code | 0 of 23 | 23 of 23 |
| Legal-vector heir rows with an exact centavo assertion | 48 of 74 rows partially covered via whole-peso helper | 74 of 74 |
| Per-module engine coverage report | does not exist | `engine/COVERAGE.md` + gate G12 |
| Engine modules at 0 % region coverage | 2 (`src/main.rs`, `src/wasm.rs`), undeclared | 2, declared in a shrink-only ledger |
| Frontend tests with zero assertions | 0 | 0, now gate-enforced |
| Frontend tests whose only matcher is `toBeDefined`/`toBeTruthy` | 15, undeclared | 15, declared in a shrink-only ledger; a 16th fails the build |
| Gates in the manifest | 11 | 13 |

---

## Feedback sampling per plan

| Plan | Sampled after every task | Whole-plan gate |
|---|---|---|
| 06-01 | `python3 examples/generate-coverage-cases.py` then `./target/release/inheritance-engine` over each new case, recording exit code | `cd engine && cargo test` still `0 failed`; `python3 examples/report-corpus-shapes.py` lists all 11 relationships |
| 06-02 | `cargo test --test fuzz_invariants` and `cargo test --test defect_ledger` | `cd engine && cargo test` reports 7 binaries, `0 failed` |
| 06-03 | `cargo test --test integration` | `cd engine && cargo test` `0 failed`; the three grep counts in `06-RESEARCH.md` §7 COV-03 |
| 06-04 | `bash scripts/coverage-report.sh; echo $?` then `node scripts/check-coverage.mjs; echo $?` | `bash scripts/ci-gates.sh --only G12` exits 0; every one of the four verdicts observed exiting 1 against a committed fixture |
| 06-05 | `node scripts/check-assertion-discipline.mjs; echo $?` | `bash scripts/ci-gates.sh --only G13` exits 0; every one of the four verdicts observed exiting 1 against a committed fixture |

---

## Known-red state this phase inherits and must not hide

`bash scripts/ci-gates.sh` exits **1** at gate `G3` (position 6 of 11) because of Phase 5's
unresolved OBS-05/OBS-06 product decision — five committed frontend tests assert the old
silent-pass behaviour. Phase 6:

- does not edit any of those five tests;
- does not append to `frontend/test-baseline.json`;
- does not touch `gate-skips.lock`;
- places both new gates at `order` 4 and 5, **ahead of `G1`**, so they execute on every runner
  invocation despite the halt at position 6.

**A full `ALL GATES PASSED (13/13)` is therefore NOT achievable in Phase 6 and must not be claimed.**
The phase-level verification statement is: gates `G12` and `G13` each exit 0 when run, `G1` exits 0
with the enlarged engine suite, and `scripts/ci-gates.sh` still fails at `G3` and nowhere earlier.
Any executor that finds `ci-gates.sh` failing at a gate *other than* `G3` has broken something and
must report BLOCKED with the pasted output.

---

## Legal-authority boundary

No point of Philippine law arises in this phase.

- Every new invariant is an arithmetic or structural identity over engine output.
- Every scenario-code assertion is transcribed from `specs/inheritance-engine-spec.md:2371-2393`,
  with the four notation reconciliations resolved and written out in `06-RESEARCH.md` §4.2.
- Every peso assertion is either the spec's own stated figure or the measured engine value pinned
  as a characterization and labelled as such in a comment.
- The two rows governed by open questions carry citations only: **LAWYER-03** on TV-15 (Art. 1006
  full/half-blood ratio) and **LAWYER-04** on TV-20 (Art. 992 iron curtain). Both are already
  recorded in `.planning/LAWYER-AGENDA.md` with status `awaiting-answer`.
- Nothing is added to `.planning/LAWYER-AGENDA.md` and nothing in
  `.planning/lawyer-decisions.json` changes. `node scripts/check-lawyer-agenda.mjs` must still
  exit 0 after every plan.

If a genuinely new legal question appears during execution, the executor stops and reports BLOCKED
per `.planning/PLAN-STANDARD.md` section 3 rather than deciding it.

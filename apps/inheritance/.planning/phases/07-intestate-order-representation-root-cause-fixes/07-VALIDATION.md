---
phase: 7
slug: intestate-order-representation-root-cause-fixes
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Engine framework** | Rust built-in harness. Unit tests inline under `#[cfg(test)] mod tests`; cross-module tests in `engine/tests/*.rs` |
| **Engine command** | `cd apps/inheritance/engine && cargo test` |
| **One engine binary** | `cd apps/inheritance/engine && cargo test --test integration` · `--test fuzz_invariants` · `--test defect_ledger` · `--test observability` |
| **Engine CLI probe** | `cd apps/inheritance/engine && cargo build --release && ./target/release/inheritance-engine <case.json>` — exit 0 prints output JSON, exit 2 means the runtime conservation and uniqueness check rejected the output |
| **WASM rebuild** | `cd apps/inheritance && bash engine/build-wasm.sh` (gate G2) |
| **Frontend framework** | Vitest 4.0.18, jsdom, setup file `frontend/src/test-setup.ts` |
| **Full runner** | `bash apps/inheritance/scripts/ci-gates.sh` · one gate: `bash apps/inheritance/scripts/ci-gates.sh --only G1` |
| **Estimated runtime** | `cargo test` ~40 s · release build ~60 s · WASM build ~20 s · full runner ~300 s (halts at G3) |

Phase 7 is the first phase in this project that changes `engine/src/` behaviour on purpose. `cargo
test` is therefore the primary feedback loop and runs after **every** task, not only at the end of a
plan.

---

## Baseline this phase changes

Measured live on 2026-07-31 with the release binary. Full commands and outputs in `07-RESEARCH.md`
section 1.

| Signal | Before Phase 7 | After Phase 7 |
|---|---|---|
| Grandparents only, E = ₱12,000,000, 2 paternal + 1 maternal | `I15`, `STATE=1200000000`, grandparent rows absent | `I5`, `gp1=300000000`, `gp2=300000000`, `gp3=600000000` |
| Grandparents + spouse (`coverage-cases/019`) | `I11`, spouse takes 100% under Art. 995 | `I6`, spouse one half, ascendants one half |
| `defect-cases/01-collateral-halfblood-nephews.json` | CLI exit 2 — 5 rows, `n1`/`n2` duplicated, Σ = 480000000 of 600000000 | CLI exit 0 — 3 rows, `sib1=400000000`, `n1=100000000`, `n2=100000000`, Σ = 600000000 |
| Entries in `engine/defect-baseline.json` | 3 | 2 |
| 3 children all repudiate, 3 living grandchildren, E = ₱120,000,000 | `I15`, `STATE=12000000000`, grandchild rows absent | `I1`, three rows at 4000000000 each, no `STATE` row |
| Predeceased father + sibling + living mother, E = ₱120,000,000 | `fa=6000000000`, `mo=6000000000` | `fa=0`, `mo=12000000000`, no `sib1` row — identical to the sibling-free control |
| `distribute_siblings_with_representation` reachable | no | yes |
| `distribute_nephews_only` reachable | no | yes, with a manual-review flag on the mixed-blood case |
| Committed inputs whose output changes | — | 19 of 140, all named in `07-RESEARCH.md` section 6 |
| `cd engine && cargo test` | 481 passed, 0 failed | at least 481 passed, 0 failed, plus the new vectors |
| Named vectors in `engine/tests/integration.rs` | 23 | 27 |

---

## Sampling plan

One sampling point per requirement, each with a command whose output is read rather than assumed.

| Requirement | Sampling point | Command | Falsifier |
|---|---|---|---|
| LAW-01 | grandparent-only and grandparent-plus-spouse families | `cd engine && cargo test --test integration` plus a CLI run on `examples/coverage-cases/020-ascendants-grandparents.json` | a `STATE` row survives, or three grandparents divide flat at 400000000 each |
| LAW-02 | `examples/defect-cases/01-collateral-halfblood-nephews.json` | `cd engine && cargo test --test defect_ledger --test fuzz_invariants` plus a CLI run | a duplicate `heir_id`, a per-heir sum other than the estate, or the ledger entry surviving |
| LAW-03 | three repudiating children with three living grandchildren | `cd engine && cargo test --test integration` | a `STATE` row appears while a living grandchild exists |
| LAW-04 | predeceased father with a sibling, against the sibling-free control | `cd engine && cargo test --test integration` plus two CLI runs | the predeceased father holds any nonzero amount |
| All four | the whole committed corpus | `cd engine && cargo test` and `bash scripts/ci-gates.sh --only G1` | any previously passing test fails, or the total drops below 481 |

---

## Gate reality for this phase

`bash scripts/ci-gates.sh` halts at `G3` (`cd frontend && npm run test:gate`) because of Phase 5's
unresolved OBS-05/OBS-06 product decision, which Phase 7 does not touch and must not touch.
`ALL GATES PASSED (13/13)` is **not** achievable in this phase and must not be claimed in any
summary.

The gates that do run ahead of `G3`, and which this phase must leave green, are:

| Order | Gate | Command |
|---|---|---|
| 1 | G5 | `node scripts/check-gate-manifest.mjs` |
| 2 | G6 | `node scripts/check-plan-closed-world.mjs` |
| 3 | G7 | `node scripts/check-commit-discipline.mjs` |
| 4 | G12 | `bash scripts/coverage-report.sh && node scripts/check-coverage.mjs` |
| 5 | G13 | `node scripts/check-assertion-discipline.mjs` |
| 6 | G1 | `cd engine && cargo test` |
| 7 | G2 | `bash engine/build-wasm.sh` |

`G10` (`node scripts/check-lawyer-agenda.mjs`) is ordered after `G3` and therefore does not run in a
full-runner invocation, so every plan that touches a file carrying a `LAWYER-DECISION` marker runs it
directly as a per-task verification step.

---

## Rules that override any local convenience

1. No test, assertion or gate may be deleted, skipped, weakened or loosened. A vector whose expected
   value legitimately changes is changed only where this phase's plans state the new value
   explicitly, with the codal sentence that produces it.
2. No point of Philippine law may be decided. The single boundary this phase approaches is
   LAWYER-03; `07-RESEARCH.md` section 5 states the containment and every plan repeats it.
3. Every commit stages explicit paths through `bash scripts/safe-commit.sh`.
4. `engine/defect-baseline.json` may only shrink. The LAW-02 entry is deleted because the defect
   stops reproducing; no entry is added.
5. If a gate cannot legitimately pass, execution halts and reports BLOCKED with the real pasted
   command output, per `.planning/PLAN-STANDARD.md` section 3.

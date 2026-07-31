---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 08
status: complete
requirements: [LAW-05, LAW-08, LAW-09, LAW-10, LAW-11]
commit: a47d289e5face0b1fef89661d30526a96ebb5b97
---

# 08-08: WASM rebuild, frontend ledger comparison, full gate run, requirement closeout

## 1. WASM rebuilt — the frontend judges the FIXED engine

```
bash engine/build-wasm.sh   exit 0
WASM BUILD OK: frontend/src/wasm/pkg/inheritance_engine_bg.wasm (616398 bytes)
```

Modification times, measured rather than assumed:

```
inheritance_engine_bg.wasm   2026-07-31 15:41:52
engine/src/step7_distribute.rs (newest src edit)  2026-07-31 15:32:38
```

The binary is newer than the most recent engine source edit, so the frontend suite below tested the
post-Phase-8 engine. The binary is gitignored and was not staged.

## 2. Frontend failure set: IDENTICAL to the five Phase 5 left behind

`cd frontend && npm run test:gate` → **exit 1**, `Tests 51 failed | 2398 passed (2449)`.
Of the 51, 46 are the ledgered known failures from Phase 1; **5** are `UNKNOWN FAILURE`:

| # | File | Test | One of the Phase 5 five? |
|---|---|---|---|
| 1 | `src/__tests__/integration.test.tsx` | compute() handles duplicate person IDs | **yes** |
| 2 | `src/wasm/__tests__/bridge.test.ts` | handles negative centavos without crashing | **yes** |
| 3 | `src/wasm/__tests__/bridge.test.ts` | handles duplicate person IDs without crashing | **yes** |
| 4 | `src/wasm/__tests__/wasm-real.test.ts` | handles negative estate centavos without crashing | **yes** |
| 5 | `src/wasm/__tests__/wasm-real.test.ts` | handles duplicate person IDs without crashing | **yes** |

**The set is identical. It did not grow. No new file appears.** All five are Phase 5's unresolved
OBS-05/OBS-06 product decision, untouched by this phase.

Total test count **2449**, above the 2416 floor and higher than the baseline because this phase added
tests. No test was lost.

`frontend/test-baseline.json`, `gate-skips.lock`, `engine/defect-baseline.json` and
`assertion-baseline.json` are all unmodified — `git status --porcelain` on all four is empty.

## 3. Per-gate exit codes — all thirteen

`bash scripts/ci-gates.sh` → **exit 1**, halting at **G3, gate 8 of 13**.

| Gate | Order | Command | Exit | Where |
|---|---|---|---|---|
| G5 | 1 | `node scripts/check-gate-manifest.mjs` | 0 | runner |
| G6 | 2 | `node scripts/check-plan-closed-world.mjs` | 0 | runner |
| G7 | 3 | `node scripts/check-commit-discipline.mjs` | 0 | runner |
| G12 | 4 | engine coverage report | 0 | runner |
| G13 | 5 | `node scripts/check-assertion-discipline.mjs` | 0 | runner |
| G1 | 6 | `cd engine && cargo test` | 0 | runner |
| G2 | 7 | `bash engine/build-wasm.sh` | 0 | runner |
| **G3** | **8** | frontend suite vs ledger | **1** | runner — **HALT** |
| G4 | 9 | `cd frontend && npx tsc -b --force` | 0 | direct |
| G10 | 10 | `node scripts/check-lawyer-agenda.mjs` | 0 | direct |
| G11 | 11 | `node scripts/check-observability.mjs` | 0 | direct |
| G8 | 12 | `node scripts/check-gate-skips.mjs` | 1 | direct — **cascade** |
| G9 | 13 | `node scripts/check-gate-results.mjs` | 1 | direct — **cascade** |

The runner halted at **G3 and at no earlier gate** — the seven gates ahead of it all passed.

G8 and G9 fail **only as a cascade of the halt**, exactly as Phases 5, 6 and 7 recorded. G8 reports
`SKIP REPORT MISSING` for G4, G10 and G11 because those gates never executed and wrote no log; G9
reports `RESULTS INCOMPLETE` because it rejects any run where a gate other than itself is `not-run`.
Neither is an independent failure and neither is a Phase 8 regression.

**`ALL GATES PASSED (13/13)` was never printed and is not claimed.** The single red gate is Phase 5's
unresolved OBS-05/OBS-06 product decision, which this phase did not touch and does not own.

## 4. Requirements closed, with proving evidence

| Requirement | Proving evidence, observed |
|---|---|
| LAW-05 | `test_law05a_preterition_preserves_a_non_inofficious_legacy`, `test_law05a_inofficious_legacy_is_reduced_not_dropped`, `test_law05b_collated_donation_defeats_preterition`, `test_law05b_exempt_donation_still_preterites_and_flags` — all four named and passing in `cargo test --test integration` (44 passed, 0 failed) |
| LAW-08 | `npx vitest run src/lib/estate-tax-engine/` 250→252 passed, 0 failed, with the medical deduction at 0 for a TRAIN death and spec TV-02 stating ₱135,000 |
| LAW-09 | Both worked-example tests in `__tests__/ordinary-deductions.test.ts` assert `item5g_vanishing_deduction.total` = `800_000_000`, one per regime; 42 passed, 0 failed |
| LAW-10 | The ₱30,000,000 worked example in `src/lib/__tests__/tax-bridge.test.ts` asserts charges `1524000000` and base `1476000000`; 35 passed, 0 failed |
| LAW-11 | `test_law11_reserva_troncal_fact_raises_a_flag` passing, plus the two new `EstateStep.test.tsx` tests (18 passed, 0 failed) |

`.planning/REQUIREMENTS.md`: the five moved from `- [ ]` to `- [x]` and from `Planned` to `Complete`.
**OBS-05, OBS-06 remain unticked and `Blocked`; LAW-06, LAW-07, LAW-12 remain unticked and `Pending`.**
`git diff` confirms 11 insertions / 11 deletions and no other checkbox moved.

## 5. Engine baseline

`cd engine && cargo test` — **543 passed, 0 failed**, up from the measured 527 baseline (+16), across
all binaries. No test was deleted, skipped, weakened or loosened anywhere in this phase.

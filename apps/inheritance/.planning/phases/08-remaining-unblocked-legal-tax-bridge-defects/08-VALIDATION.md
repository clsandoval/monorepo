---
phase: 8
slug: remaining-unblocked-legal-tax-bridge-defects
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Every requirement in this phase is a wrong number that reproduces today. Each fix is therefore
validated by a **pair**: a named vector that fails before the fix and passes after it, plus a control
that must not move. A single post-fix assertion cannot distinguish "the fix worked" from "the
assertion was written to match whatever the code already did", which is the failure mode this phase's
sampling exists to prevent.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Rust built-in `#[test]` harness (engine) + Vitest 4.0.18 (frontend) |
| **Config file** | `engine/Cargo.toml`; `frontend/vitest.config.ts` |
| **Quick run command** | `cd engine && cargo test --test integration` · `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/` |
| **Full suite command** | `cd engine && cargo test` · `cd frontend && npm run test:gate` |
| **Estimated runtime** | engine ~20 s from warm; frontend suite ~25 s |

---

## Sampling Rate

- **After every task commit:** `cd engine && cargo test` for engine tasks; the narrowest
  `npx vitest run <dir>` for frontend tasks
- **After every plan wave:** `cd engine && cargo test` **and** `bash engine/build-wasm.sh` **and**
  `cd frontend && npm run test:gate` **and** `cd frontend && npx tsc -b --force`
- **Before phase closeout:** `bash scripts/ci-gates.sh`, plus the five gates the runner never reaches
  run directly
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | LAW-05 | T-08-01 | A donee heir's omission is no longer treated as total, and an exempt-only donee is flagged rather than silently preterited | unit | `cd engine && cargo test --lib step6_validation` | ✅ | ⬜ pending |
| 08-01-02 | 01 | 1 | LAW-05 | T-08-02 | The open Art. 1062 question is recorded, not answered; status cannot advance without a person and a date | integration | `node scripts/check-lawyer-agenda.mjs` | ✅ | ⬜ pending |
| 08-02-01 | 02 | 2 | LAW-05 | T-08-03 | Non-inofficious legacies are paid before the residue divides; the legitime is never impaired | unit | `cd engine && cargo test --lib step7_distribute` | ✅ | ⬜ pending |
| 08-02-02 | 02 | 2 | LAW-05 | T-08-04 | An unvaluable devise or specific-asset legacy is flagged rather than paid ₱0 in silence | unit | `cd engine && cargo test --lib step7_distribute` | ✅ | ⬜ pending |
| 08-03-01 | 03 | 3 | LAW-05 | — | Four named vectors pin the exact centavos measured in `08-RESEARCH.md` §1.2 and §1.5 | integration | `cd engine && cargo test --test integration` | ✅ | ⬜ pending |
| 08-03-02 | 03 | 3 | LAW-05 | — | The whole 173-file corpus still conserves the estate and holds all 16 invariants | integration | `cd engine && cargo test --test fuzz_invariants --test observability --test defect_ledger` | ✅ | ⬜ pending |
| 08-04-01 | 04 | 1 | LAW-08 | T-08-05 | A TRAIN-era death is never granted the repealed ₱500,000 medical deduction | unit | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/special-deductions.test.ts` | ✅ | ⬜ pending |
| 08-04-02 | 04 | 1 | LAW-08 | T-08-06 | The advisor no longer recommends a repealed deduction under TRAIN | unit | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/advisor.test.ts src/lib/estate-tax-engine/__tests__/sensitivity.test.ts` | ✅ | ⬜ pending |
| 08-04-03 | 04 | 1 | LAW-08 | — | The spec's golden test TV-02 states the statute's answer | integration | `grep -n "135,000" specs/estate-tax-engine-spec.md` | ✅ | ⬜ pending |
| 08-05-01 | 05 | 2 | LAW-09 | T-08-07 | Transfers for public use reduce the vanishing-deduction ratio in both regimes | unit | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/ordinary-deductions.test.ts` | ✅ | ⬜ pending |
| 08-05-02 | 05 | 2 | LAW-09 | — | The spec no longer states the ratio without paragraph (6) | integration | `grep -n "5F" specs/estate-tax-engine-spec.md` | ✅ | ⬜ pending |
| 08-06-01 | 06 | 3 | LAW-10 | T-08-08 | The tax engine publishes the Art. 908 components under honest names | unit | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/pipeline.test.ts` | ✅ | ⬜ pending |
| 08-06-02 | 06 | 3 | LAW-10 | T-08-09 | The bridge throws on a missing component instead of coercing it to zero | unit | `cd frontend && npx vitest run src/lib/__tests__/tax-bridge.test.ts src/hooks/__tests__/useTaxBridge.test.tsx` | ✅ | ⬜ pending |
| 08-07-01 | 07 | 4 | LAW-11 | T-08-10 | The reserva fact is enterable and reaches `EngineOutput.warnings` | unit | `cd frontend && npx vitest run src/components/wizard/__tests__/EstateStep.test.tsx` | ✅ | ⬜ pending |
| 08-07-02 | 07 | 4 | LAW-11 | — | Art. 891 reservation is expressly declared uncomputed in the spec and in the output narrative | integration | `cd engine && cargo test --test integration` | ✅ | ⬜ pending |
| 08-08-01 | 08 | 5 | LAW-05, LAW-08, LAW-09, LAW-10, LAW-11 | — | The frontend is measured against a WASM binary rebuilt from the fixed engine | integration | `bash engine/build-wasm.sh && cd frontend && npm run test:gate` | ✅ | ⬜ pending |
| 08-08-02 | 08 | 5 | LAW-05, LAW-08, LAW-09, LAW-10, LAW-11 | — | No requirement is ticked on the strength of a summary | integration | `bash scripts/ci-gates.sh` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `engine/tests/integration.rs`,
`engine/tests/fuzz_invariants.rs`, `engine/tests/observability.rs`, `engine/tests/defect_ledger.rs`,
`frontend/scripts/check-test-baseline.mjs` and the seven per-suite Vitest files named above all exist
and are green today. No test framework is installed and no test file is scaffolded in this phase.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

The two questions this phase deliberately leaves open — Art. 1062 exempt donations versus *Morales*'
"total omission" test (recorded as `LAWYER-09`), and whether a non-testamentary transfer for public
use should leave the distributable estate (recorded as a bridge warning string) — are verified only in
the sense that the engine is proven **loud** about them. Neither is answered here and neither has a
pass/fail legal criterion an agent may apply.

---

## Validation Sign-Off

- [x] All tasks have an `<automated>`-equivalent command in `<verify>`; no task depends on a Wave 0 stub
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references — there are none
- [x] No watch-mode flags (`vitest` bare and `cargo watch` are absent from every command)
- [x] Feedback latency < 60 s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 9
slug: single-source-of-truth-dedup-classifiers-money-types
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

This phase deletes code and adds type-level rules. Both create a validation hazard that ordinary
"the suite is green" sampling cannot see: **deleted code makes tests pass trivially**, and **a type
rule is invisible to a test that runs**. Every requirement below is therefore sampled by an
instrument that fails when the property is absent, not by an instrument that passes when the property
is present.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Rust built-in `#[test]` harness (engine) + Vitest 4.0.18 (frontend) + `tsc` as a type-level assertion runner |
| **Config file** | `engine/Cargo.toml`; `frontend/vitest.config.ts`; `frontend/tsconfig.json` |
| **Quick run command** | `cd engine && cargo test --test classify` · `cd frontend && npx vitest run src/components/wizard/__tests__/ReviewStep.test.tsx` |
| **Full suite command** | `cd engine && cargo test` · `cd frontend && npm run test:gate` · `cd frontend && npx tsc -b --force` |
| **Estimated runtime** | engine ~20 s from warm; frontend suite ~25 s; `tsc -b --force` ~10 s; `build-wasm.sh` ~20 s |

---

## Sampling Rate

- **After every task commit:** the narrowest command that can observe the change — `cargo test --lib
  pipeline`, `cargo test --test classify`, `npx vitest run <one file>`, `npx tsc -b --force`, or
  `node scripts/check-single-source.mjs`
- **After every plan wave:** `cd engine && cargo test` **and** `bash engine/build-wasm.sh` **and**
  `cd frontend && npm run test:gate` **and** `cd frontend && npx tsc -b --force`
- **Before phase closeout:** `bash scripts/ci-gates.sh`, plus `G4`, `G10`, `G11`, `G8` and `G9` run
  directly, since the runner halts at `G3` (order 9 of 14)
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Verified Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-------------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | EXT-01 | T-09-01 | `classify_scenario` returns the same code the full pipeline returns, on every one of 173 committed inputs | integration | `cd engine && cargo test --test classify` | ✅ | ⬜ pending |
| 09-01-02 | 01 | 1 | EXT-01, EXT-04 | T-09-02 | `classify_json` crosses the WASM boundary and cannot emit a peso figure | unit | `cd engine && cargo test && bash engine/build-wasm.sh` | ✅ | ⬜ pending |
| 09-02-01 | 02 | 1 | EXT-04 | T-09-03 | Invariant 6 (adopted share == legitimate share) is asserted rather than merely defined | integration | `cd engine && cargo test --test integration tv09` | ✅ | ⬜ pending |
| 09-02-02 | 02 | 1 | EXT-04 | — | Five stale `#[allow(dead_code)]` attributes are gone and nothing they suppressed is now unused | unit | `cd engine && cargo test 2>&1 \| grep -c "never used"` | ✅ | ⬜ pending |
| 09-03-01 | 03 | 1 | EXT-03 | T-09-04 | `Pesos` and `Centavos` are mutually unassignable while numeric literals still compile | type | `cd frontend && npx tsc -b --force` | ✅ | ⬜ pending |
| 09-03-02 | 03 | 1 | EXT-03 | T-09-05 | The succession wizard's only money control converts through the branded pair | unit | `cd frontend && npx vitest run src/components/shared/__tests__/MoneyInput.test.tsx` | ✅ | ⬜ pending |
| 09-04-01 | 04 | 2 | EXT-01, EXT-04 | T-09-06 | Neither dead classifier nor the mock compute path exists in the bundle | unit | `cd frontend && npx tsc -b --force && grep -c "computeMock" src/wasm/bridge.ts` | ✅ | ⬜ pending |
| 09-04-02 | 04 | 2 | EXT-01 | T-09-07 | The badge shows `I2` and `T2` — the engine's answers — where the deleted copy said `I1` and `T1` | integration | `cd frontend && npx vitest run src/components/wizard/__tests__/ReviewStep.test.tsx` | ✅ | ⬜ pending |
| 09-05-01 | 05 | 2 | EXT-03 | T-09-08 | The tax wizard's state is peso-typed, the tax engine's input is centavo-typed, and only one adapter joins them | type | `cd frontend && npx tsc -b --force` | ✅ | ⬜ pending |
| 09-05-02 | 05 | 2 | EXT-03, EXT-02 | T-09-09 | The tax pipeline's second peso→centavo implementation is gone and all 252 estate-tax tests still pass | unit | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/` | ✅ | ⬜ pending |
| 09-06-01 | 06 | 3 | EXT-02 | T-09-10 | Four named single-source rules are enforced, and a re-introduced duplicate exits 1 | integration | `node scripts/check-single-source.mjs && node scripts/check-single-source.mjs --root scripts/fixtures/single-source-violation` | ✅ | ⬜ pending |
| 09-06-02 | 06 | 3 | EXT-02 | T-09-11 | The rule set cannot be gutted by editing the registry | integration | `node scripts/check-single-source.mjs --registry scripts/fixtures/single-source-gutted.json` | ✅ | ⬜ pending |
| 09-06-03 | 06 | 3 | EXT-02 | — | `G14` is registered, blocking, ordered ahead of the `G3` halt, and reports its own skips | integration | `node scripts/check-gate-manifest.mjs && bash scripts/ci-gates.sh` | ✅ | ⬜ pending |

---

## Two-Direction Proofs

Four properties in this phase are provable in both directions, and the plans require both, because a
one-direction proof of an absence is not a proof.

| Property | Passes when present | Fails when absent |
|---|---|---|
| Money units are separated | `npx tsc -b --force` exits 0 with `money-units.typetest.ts` compiled | removing the flavour makes tsc emit `TS2578: Unused '@ts-expect-error' directive` four times (measured, `09-RESEARCH.md` §4.2) |
| The single-source check is real | `node scripts/check-single-source.mjs` exits 0 on the repo | it exits 1 on `scripts/fixtures/single-source-violation/`, a committed file containing one `as ScenarioCode` |
| The registry cannot be gutted | the four `REQUIRED_IDS` are present | a registry missing one exits 1 with `SINGLE SOURCE RULE MISSING` |
| One classifier, not two | 173 of 173 inputs agree | the equivalence test names the first disagreeing file and its two codes |

---

## Manual-Only Verifications

None. Every behaviour in this phase has an automated command.

The one judgement this phase makes that no command can check — that engine-backing the "Predicted:"
badge is preferable to deleting it — is made in `09-RESEARCH.md` §1.6 with its three grounds stated,
so the executor never has to make it.

---

## Validation Sign-Off

- [x] All tasks have an automated command in `<verify>`; no task depends on a Wave 0 stub
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references — there are none
- [x] No watch-mode flags (`vitest` bare and `cargo watch` appear in no command)
- [x] Feedback latency < 60 s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

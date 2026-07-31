---
phase: 12
slug: wizard-output-journey-gates
status: executed
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 (frontend units), cargo test (engine), the `frontend/journey/` harness (browser), plain Node ESM scripts (parity, exposure, smoke) |
| **Config file** | `frontend/vitest.config.ts`; the journey harness has no config file by design — a step record is data under `frontend/journey/steps/` |
| **Quick run command** | `cd frontend && node journey/run.mjs --step <stepId>` |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | single step ~20 s including build; full gate run **measured at 4 m 12 s**, twice, on the owner's machine |

---

## Sampling Rate

- **After every task commit:** run the single named command in that task's `<verify>` block.
- **After every plan wave:** `node scripts/check-journey-registry.mjs` (static, ~1 s) followed by
  `cd frontend && node journey/run.mjs --all`.
- **Before `/gsd:verify-work`:** `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (20/20)`.
- **Max feedback latency:** 30 seconds for a single-step run; the static registry gate is under 2
  seconds and is what every reference-and-rubric edit is checked by first.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | EXT-01 | — | N/A | unit | `cd frontend && npx vitest run src/components/wizard/__tests__/ReviewStep.test.tsx` | ✅ | ⬜ pending |
| 12-01-02 | 01 | 1 | EXT-01, EXT-04 | — | N/A | unit | `cd frontend && npm run test:gate` | ✅ | ⬜ pending |
| 12-01-03 | 01 | 1 | EXT-01 | — | N/A | typecheck | `cd frontend && npx tsc -b --force` | ✅ | ⬜ pending |
| 12-02-01 | 02 | 1 | JRNY-07 | — | N/A | integration | `cd frontend && node -e "import('./journey/engine.mjs')…"` | ✅ | ⬜ pending |
| 12-02-02 | 02 | 1 | JRNY-05…08 | T-12-02 | A widened validator still rejects an out-of-set requirement id | static | `node scripts/check-journey-registry.mjs` | ✅ | ⬜ pending |
| 12-02-03 | 02 | 1 | JRNY-07, JRNY-08 | — | N/A | integration | `cd frontend && node journey/run.mjs --all` | ✅ | ⬜ pending |
| 12-03-01 | 03 | 2 | JRNY-05 | — | N/A | measurement | `cd frontend && node journey/run.mjs --step wizard-estate` | ❌ this plan | ⬜ pending |
| 12-03-02 | 03 | 2 | JRNY-05 | — | N/A | screenshot + rubric | `cd frontend && node journey/run.mjs --step wizard-review` | ❌ this plan | ⬜ pending |
| 12-03-03 | 03 | 2 | JRNY-05 | — | N/A | static | `node scripts/check-journey-registry.mjs` | ✅ | ⬜ pending |
| 12-04-01 | 04 | 2 | JRNY-06 | — | N/A | measurement | `cd frontend && node journey/run.mjs --step tax-tab-0` | ❌ this plan | ⬜ pending |
| 12-04-02 | 04 | 2 | JRNY-06 | — | N/A | screenshot + rubric | `cd frontend && node journey/run.mjs --step tax-tab-7` | ❌ this plan | ⬜ pending |
| 12-05-01 | 05 | 1 | JRNY-11 | T-12-05 | A 4xx on any sub-resource fails the route rather than being ignored | smoke | `cd frontend && node journey/seo-smoke.mjs` | ❌ this plan | ⬜ pending |
| 12-05-02 | 05 | 1 | JRNY-11 | T-12-05 | The smoke observed failing against an injected bad route | smoke | `cd frontend && node journey/seo-smoke.mjs` | ❌ this plan | ⬜ pending |
| 12-06-01 | 06 | 2 | JRNY-07 | — | N/A | unit | `cd frontend && npm run test:gate` | ✅ | ⬜ pending |
| 12-06-02 | 06 | 2 | JRNY-07 | — | N/A | screenshot + rubric | `cd frontend && node journey/run.mjs --step results-view` | ❌ this plan | ⬜ pending |
| 12-06-03 | 06 | 2 | JRNY-07 | — | N/A | screenshot + rubric | `cd frontend && node journey/run.mjs --step results-family-tree` | ❌ this plan | ⬜ pending |
| 12-07-01 | 07 | 2 | JRNY-08 | T-12-07 | The anonymous RPC returns exactly six columns and none of nine forbidden ones | integration | `cd frontend && node journey/share-exposure.mjs` | ❌ this plan | ⬜ pending |
| 12-07-02 | 07 | 2 | JRNY-08 | — | N/A | screenshot + rubric | `cd frontend && node journey/run.mjs --step share-populated` | ❌ this plan | ⬜ pending |
| 12-08-01 | 08 | 3 | JRNY-07 | — | N/A | integration | `cd frontend && node journey/money-parity.mjs` | ❌ this plan | ⬜ pending |
| 12-08-02 | 08 | 3 | JRNY-07 | — | N/A | integration | `cd frontend && node journey/money-parity.mjs` | ❌ this plan | ⬜ pending |
| 12-09-01 | 09 | 4 | JRNY-05…08, JRNY-11 | — | N/A | static | `node scripts/check-gate-manifest.mjs` | ✅ | ⬜ pending |
| 12-09-02 | 09 | 4 | JRNY-05…08, JRNY-11 | — | N/A | full suite | `bash scripts/ci-gates.sh` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No framework is installed, no config file is
created, and no dependency is added anywhere in this phase.

Verified during planning: `frontend/node_modules/playwright` is present, the local Supabase stack
answers `supabase status -o env`, `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` is built and
rebuilt by gate G2 on every run, and `engine/target/release/inheritance-engine` exists and ran.

---

## Manual-Only Verifications

| Behavior | Requirement | Why manual | Test instructions |
|----------|-------------|------------|-------------------|
| A captured screenshot is the screen a human agrees is correct | JRNY-05, JRNY-06, JRNY-07, JRNY-08 | `journey/REFERENCES.md` step 2 is deliberately commandless: looking at the image is what makes an approval mean something. The gate that follows is fully automated. | Run the step, open `.journey-runs/<stamp>/<stepId>/actual.png`, then `node journey/approve.mjs <stepId>` |

Every other phase behavior has an automated verification command in the table above.

---

## Threat References

| Ref | Threat | Plan | Mitigation asserted by |
|---|---|---|---|
| T-12-02 | A widened requirement list becomes a hole that lets an unvalidated step record through | 12-02 | A negative fixture: a step naming `JRNY-99` must still produce `STEP FIELD INVALID` |
| T-12-05 | A smoke gate that treats a 404 as "the page rendered something" | 12-05 | An injected bad route must make the script exit 1 and name the status |
| T-12-07 | The anonymous share path widening to expose org, user or tax data | 12-07 | An exact six-key set assertion plus a nine-name forbidden list |

---

## Validation Sign-Off

- [x] All tasks have an automated `<verify>` command or an explicit Wave dependency
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references — none are missing
- [x] No watch-mode flags anywhere (`vitest run`, never `vitest`)
- [x] Feedback latency < 30 s for the per-task command
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending


---

## Execution record — filled in after the phase ran

Measured, not estimated. Every line below was observed on this machine.

| What | Command | Result |
|---|---|---|
| Whole gate set, run 1 | `bash scripts/ci-gates.sh` | `ALL GATES PASSED (20/20)`, exit 0, `real 4m12.161s` |
| Whole gate set, run 2 | `bash scripts/ci-gates.sh` | `ALL GATES PASSED (20/20)`, exit 0, `real 4m12.811s` |
| Per-gate status | `node -e` over `gate-results.json` | `total=20 nonpass=0` |
| Journey suite | `cd frontend && node journey/run.mjs --all` | `JOURNEY PASS steps=33 failed=0`, twice consecutively |
| Registry | `node scripts/check-journey-registry.mjs` | `JOURNEY REGISTRY ok steps=33 references=33` |
| Manifest | `node scripts/check-gate-manifest.mjs` | `MANIFEST OK — 20 gates, 20 locked` |
| Frontend ledger | `cd frontend && npm run test:gate` | `GATE OK`, 2403 passed, ledger unchanged at 46 |
| Money parity | `cd frontend && node journey/money-parity.mjs` | `MONEY PARITY PASS heirs=4 centavos=600000000` |
| Share exposure | `cd frontend && node journey/share-exposure.mjs` | `SHARE EXPOSURE PASS fields=6 forbidden=0` |
| SEO smoke | `cd frontend && node journey/seo-smoke.mjs` | `SEO SMOKE PASS routes=14 failed=0` |
| Requirement coverage | `node scripts/gate-coverage.mjs` | `REQUIREMENT COVERAGE 29/94 gated`, `COVERAGE OK` |

The two consecutive whole-set runs are the load-bearing evidence: this phase added the first steps in
the project that write to the database *through the product*, so a second run that differed from the
first would mean a gate mutates state it does not restore. Three such defects were in fact found and
fixed during execution — see the deviations in the 12-03, 12-06 and 12-07 summaries.

**Every negative path was observed firing**, never assumed:

| Gate / rubric | Injection | Observed |
|---|---|---|
| `wizard-review` | badge forced to the deleted classifier's `I1` | `RUBRIC FAILURE`, `expected 'I2' \| actual 'I1'`, exit 1 |
| `tax-tab-0` | `tab-selected` pointed at `tab-3` | `RUBRIC FAILURE`, `expected 'true' \| actual 'false'`, exit 1 |
| `results-view` | `heir-row-count` expect 5 | `RUBRIC FAILURE`, `expected 5 \| actual 4`, exit 1 |
| G19 | +1 centavo on each heir cell | `HEIR AMOUNT MISMATCH … (difference 1)`, exit 1 |
| G19 | first heir row dropped | `HEIR ROW SET MISMATCH — displayed [c2, c3, s], engine [c1, c2, c3, s]`, exit 1 |
| G19 | +100 centavos on the total | `TOTAL ESTATE MISMATCH … (difference 100)`, exit 1 |
| G20 | seventh column added to the live RPC | `SHARE FIELD SET` + `SHARE FIELD LEAKED — org_id`, exit 1 |
| G21 | route rendering no `h1` | `SEO RENDER FAILURE`, exit 1 |
| G21 | a fetch answering 404 | `SEO BAD STATUS — HTTP 404`, exit 1 |
| G21 | `console.error` in a component | `SEO CONSOLE ERROR`, exit 1 |
| Registry | step naming `JRNY-99` | `STEP FIELD INVALID` (exit 1) and `JOURNEY CANNOT RUN: STEPS INVALID` (exit 2) |

Every injection was restored and the restored tree re-run green before anything was committed.

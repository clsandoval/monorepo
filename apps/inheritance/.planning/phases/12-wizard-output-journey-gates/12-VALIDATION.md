---
phase: 12
slug: wizard-output-journey-gates
status: draft
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
| **Estimated runtime** | single step ~20 s including build; full gate run ~8 min |

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

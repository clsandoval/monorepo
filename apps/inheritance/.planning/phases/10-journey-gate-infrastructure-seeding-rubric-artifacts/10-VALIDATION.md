---
phase: 10
slug: journey-gate-infrastructure-seeding-rubric-artifacts
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-31
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 20 ESM scripts driving Playwright 1.56.1 headless chromium; assertions by `node:assert/strict` |
| **Config file** | none — the harness is plain `.mjs` and takes no config file (10-RESEARCH.md D-4) |
| **Quick run command** | `cd frontend && node journey/selftest.mjs` |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | selftest ~15 s; full runner reaches its known G3 halt in ~6 min |

The harness deliberately does **not** run under vitest. `frontend/vitest.config.ts` declares
`environment: 'jsdom'`, and jsdom is what the journey gates exist to escape — a jsdom "screenshot" is
not a screenshot. Adding a browser mode to the vitest config would also change the environment gate G3
runs in, and G3's ledger is frozen at 2,449 tests.

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && node journey/selftest.mjs`
- **After every plan wave:** Run `cd frontend && node journey/selftest.mjs && node scripts/check-plan-closed-world.mjs && node scripts/check-commit-discipline.mjs`
- **Before phase verification:** `bash scripts/ci-gates.sh`, expected to reach the inherited G3 halt
- **Max feedback latency:** 20 seconds for the harness self-test

Latency matters here more than usual: waves 2 and 3 build four independent mechanisms, and a
20-second loop is what lets each be checked in isolation before the wave-4 gate composes them.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | JRNY-12 | — | N/A | integration | `cd frontend && node -e "import('playwright').then(m=>console.log(typeof m.chromium.launch))"` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | JRNY-12 | T-10-01 | Launch options are fixed, so a screenshot cannot drift between runs on one machine | integration | `cd frontend && node journey/browser-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | JRNY-09 | T-10-02 | An unrecognised assertion `kind` is rejected, never interpreted | unit | `cd frontend && node journey/rubric-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | JRNY-09 | — | N/A | unit | `cd frontend && node journey/rubric-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-03-01 | 03 | 2 | JRNY-10 | — | N/A | unit | `cd frontend && node journey/diff-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-03-02 | 03 | 2 | JRNY-10 | T-10-03 | Approval is a separate command and refuses to invent an image | unit | `cd frontend && node journey/diff-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-04-01 | 04 | 3 | JRNY-12 | — | N/A | unit | `cd frontend && node journey/artifacts-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-04-02 | 04 | 3 | JRNY-12 | T-10-04 | Artifacts land outside version control, so a failing run cannot be committed by the auto-committer | unit | `git check-ignore -v frontend/.journey-runs` | ❌ W0 | ⬜ pending |
| 10-05-01 | 05 | 3 | JRNY-01 | — | N/A | integration | `cd frontend && npx vitest run src/components/wizard/__tests__/ src/components/tax/__tests__/` | ✅ | ⬜ pending |
| 10-05-02 | 05 | 3 | JRNY-01 | T-10-05 | A step index from the URL is clamped, so a crafted URL cannot index outside the visible steps | integration | `cd frontend && node journey/seed-probe.mjs` | ❌ W0 | ⬜ pending |
| 10-05-03 | 05 | 3 | JRNY-01 | — | N/A | integration | `cd frontend && node journey/seed-smoke.mjs` | ❌ W0 | ⬜ pending |
| 10-06-01 | 06 | 4 | JRNY-01, JRNY-09, JRNY-10, JRNY-12 | — | N/A | integration | `cd frontend && node journey/selftest.mjs` | ❌ W0 | ⬜ pending |
| 10-06-02 | 06 | 4 | JRNY-09, JRNY-10 | T-10-06 | The gate set grows by append only; no locked command is edited | integration | `node scripts/check-gate-manifest.mjs` | ✅ | ⬜ pending |
| 10-06-03 | 06 | 4 | JRNY-01 | — | N/A | static | `node scripts/check-gate-skips.mjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

`❌ W0` means the verifying file does not exist yet and is created by the same plan — the standard
Wave 0 condition for a phase that introduces its own harness.

---

## Wave 0 Requirements

- [ ] `frontend/journey/browser.mjs` — fixed-determinism chromium launch, used by every later probe
- [ ] `frontend/journey/fixtures/` — committed HTML fixtures, the substrate every probe asserts against
- [ ] `playwright@1.56.1`, `pixelmatch@7.2.0`, `pngjs@7.0.0` in `frontend/package.json` devDependencies
- [ ] `npx playwright install chromium` — one-time browser download, measured at ~104 MiB

Wave 0 is plan **10-01** in its entirety. Nothing in waves 2–4 can be verified until it lands, which
is why it is alone in wave 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DB-row and auth-session seeding against a live Supabase stack | JRNY-01 | Needs Docker plus a running local stack. GitHub Actions has neither, and Phase 3 set the precedent of not registering such a check as a blocking gate (`scripts/check-env-ready.mjs`) | `supabase start` in `frontend/`, then `cd frontend && node journey/seed-smoke.mjs`; paste the output into `10-05-SUMMARY.md`. Expected: `SEED-SMOKE ok rows=2 session=installed` |
| Reference-image portability between this machine and CI | JRNY-10 | No CI run has ever executed for this project (STATE.md records 25+ unpushed commits), so cross-platform rasterisation cannot be observed yet | Deferred to Phase 11 by 10-RESEARCH.md §5. Phase 10 commits no golden image of the real app, so nothing here can go stale in the meantime |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command or a named Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags (`vitest` appears only as `vitest run`)
- [x] Feedback latency < 20s for the per-task command
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-31

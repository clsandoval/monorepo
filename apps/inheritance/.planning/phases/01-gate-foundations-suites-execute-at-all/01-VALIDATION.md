---
phase: 1
slug: gate-foundations-suites-execute-at-all
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 (frontend, jsdom) + Rust built-in harness (engine) |
| **Config file** | `apps/inheritance/frontend/vitest.config.ts` (exists) |
| **Quick run command** | `cd apps/inheritance/frontend && npx vitest run <specific-file>` (~5-25 s) |
| **Full suite command** | `bash apps/inheritance/scripts/ci-gates.sh` (created by plan 01-04) |
| **Estimated runtime** | engine `cargo test` ~10 s · wasm build ~20 s · `npm test` ~25 s · `tsc -b --force` ~15 s · total ~70 s |

No Wave 0 test-infrastructure work is required: Vitest, jsdom, `@testing-library/*`, and the Rust harness are all installed and already execute 2,416 + 442 tests. This phase changes the *environment* and the *gate*, not the framework.

---

## Sampling Rate

- **After every task commit:** the task's own `<verify>` command (each is < 30 s)
- **After every plan wave:** `cd apps/inheritance/frontend && npm test` (full 2,416-test suite, ~25 s)
- **Before phase verification:** `bash apps/inheritance/scripts/ci-gates.sh` must exit 0
- **Max feedback latency:** 70 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | GATE-03 | T-1-01 | Build script refuses to report success without a real `\0asm` artifact | integration | `rm -f frontend/src/wasm/pkg/inheritance_engine_bg.wasm && bash engine/build-wasm.sh` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | GATE-03 | — | N/A | integration | `cd frontend && npx vitest run src/wasm/__tests__/` | ✅ | ⬜ pending |
| 1-01-03 | 01 | 1 | GATE-03 | — | N/A | source | `grep -c inheritance_engine_bg.js frontend/.gitignore` → 0 | ✅ | ⬜ pending |
| 1-02-01 | 02 | 2 | GATE-01 | T-1-02 | Polyfills are additive-only; never replace a real jsdom implementation | unit | `cd frontend && npm test` → exactly 46 failed / 2370 passed | ✅ | ⬜ pending |
| 1-02-02 | 02 | 2 | GATE-01 | — | N/A | source | `grep -c "ResizeObserver is not defined" <log>` → 0 | ✅ | ⬜ pending |
| 1-03-01 | 03 | 3 | GATE-01 | T-1-03 | Ledger can only shrink; skipped tests hard-fail | integration | `cd frontend && npm run test:gate` → exit 0 | ✅ | ⬜ pending |
| 1-03-02 | 03 | 3 | GATE-01 | T-1-03 | Checker actually fails on regression | unit | `node scripts/check-test-baseline.mjs --from-json scripts/fixtures/regression.json` → exit 1 | ✅ | ⬜ pending |
| 1-03-03 | 03 | 3 | GATE-01 | T-1-03 | Checker fails on stale ledger and on skips | unit | `node scripts/check-test-baseline.mjs --from-json scripts/fixtures/{fixed,skipped,shrunk}.json` → exit 1 ×3 | ✅ | ⬜ pending |
| 1-04-01 | 04 | 4 | GATE-01..04 | T-1-04 | Every gate step is fail-closed; no `continue-on-error`, no `\|\| true` | integration | `bash apps/inheritance/scripts/ci-gates.sh` → exit 0 | ✅ | ⬜ pending |
| 1-04-02 | 04 | 4 | GATE-04 | T-1-04 | Workflow triggers on push and PR and is path-scoped | source | `python3 -c "import yaml,sys;d=yaml.safe_load(...)"` assertions | ✅ | ⬜ pending |
| 1-04-03 | 04 | 4 | GATE-02 | — | N/A | integration | `cd frontend && npx tsc -b --force` → exit 0, no output | ✅ | ⬜ pending |
| 1-04-04 | 04 | 4 | GATE-01..04 | — | N/A | docs | `grep` README.md for each of the 4 documented commands | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Wave 0 work.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Workflow actually fires on a real push/PR to GitHub | GATE-04 | Requires a push to the remote, which this phase does not perform | After merge, open the Actions tab and confirm one `Inheritance CI` run appears for the merge commit |

Every other phase behavior has automated verification runnable on a developer machine.

---

## Validation Sign-Off

- [x] All tasks have `<verify>` commands; no Wave 0 dependencies
- [x] Sampling continuity: every task has an automated verify — no gaps
- [x] Wave 0 covers all MISSING references (none exist)
- [x] No watch-mode flags (`vitest run`, never bare `vitest`)
- [x] Feedback latency < 70 s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

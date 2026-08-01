---
phase: 15
slug: extendability-documentation-closeout
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 15 ships four documents and four static check scripts. It changes no peso figure, no engine
source and no test. The validation question is therefore not "is the arithmetic right" but "will
these documents still be true after the next phase moves the tree underneath them". Section 7 of
`15-RESEARCH.md` derives the three sampling levels this file schedules.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | dependency-free Node ESM (`node:` builtins only) + Bash, run through `scripts/ci-gates.sh` |
| **Config file** | `gates.manifest.json` / `gates.manifest.lock` |
| **Quick run command** | `node scripts/check-claude-invariants.mjs && node scripts/check-new-rule-procedure.mjs && node scripts/check-doc-claims.mjs && node scripts/check-planning-truth.mjs` |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | quick ~2 seconds; full ~5 minutes 30 seconds (measured at 28 gates) |

---

## Sampling Rate

- **After every task commit:** run that task's own `<verify>` block, which is always a real command.
- **After every plan:** run the quick command above — all four checks, ~2 seconds.
- **After the final wave:** run `bash scripts/ci-gates.sh` and require
  `ALL GATES PASSED (32/32)` with exit 0.
- **Max feedback latency:** 2 seconds for the four new checks; 330 seconds for the whole suite.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 15-01-1 | 15-01 | 1 | EXT-05 | source assertion | `grep -n "^## Invariants an implementing agent must not violate" CLAUDE.md` | ⬜ pending |
| 15-01-2 | 15-01 | 1 | EXT-05 | CLI | `node scripts/check-claude-invariants.mjs; echo $?` | ⬜ pending |
| 15-01-3 | 15-01 | 1 | EXT-05 | fixture-driven failure | `node scripts/check-claude-invariants.mjs --claude scripts/fixtures/claude-*.md` ×5 | ⬜ pending |
| 15-02-1 | 15-02 | 1 | EXT-06 | source assertion | `grep -c "^## Step " .planning/NEW-LEGAL-RULE.md` | ⬜ pending |
| 15-02-2 | 15-02 | 1 | EXT-06 | CLI | `node scripts/check-new-rule-procedure.mjs; echo $?` | ⬜ pending |
| 15-02-3 | 15-02 | 1 | EXT-06 | fixture-driven failure | `node scripts/check-new-rule-procedure.mjs --procedure scripts/fixtures/rule-proc-*.md` ×4 | ⬜ pending |
| 15-03-1 | 15-03 | 1 | EXT-07 | CLI, expected RED first | `node scripts/check-doc-claims.mjs; echo $?` before corrections | ⬜ pending |
| 15-03-2 | 15-03 | 1 | EXT-07 | CLI, expected GREEN after | `node scripts/check-doc-claims.mjs; echo $?` after corrections | ⬜ pending |
| 15-03-3 | 15-03 | 1 | EXT-07 | fixture-driven failure | `node scripts/check-doc-claims.mjs --docroot scripts/fixtures/docclaims-*/` ×3 | ⬜ pending |
| 15-03-4 | 15-03 | 1 | EXT-07 | regression | `cd engine && cargo test` and `cd frontend && npx tsc -b --force` both exit 0 | ⬜ pending |
| 15-04-1 | 15-04 | 2 | EXT-08 | CLI, expected RED first | `node scripts/check-planning-truth.mjs; echo $?` before corrections | ⬜ pending |
| 15-04-2 | 15-04 | 2 | EXT-08 | CLI, expected GREEN after | `node scripts/check-planning-truth.mjs; echo $?` after corrections | ⬜ pending |
| 15-04-3 | 15-04 | 2 | EXT-08 | fixture-driven failure | `node scripts/check-planning-truth.mjs --roadmap|--state|--orientation scripts/fixtures/truth-*` ×5 | ⬜ pending |
| 15-05-1 | 15-05 | 3 | EXT-05…08 | CLI | `node scripts/check-gate-manifest.mjs; echo $?` | ⬜ pending |
| 15-05-2 | 15-05 | 3 | EXT-05…08 | full suite | `bash scripts/ci-gates.sh` prints `ALL GATES PASSED (32/32)`, exit 0 | ⬜ pending |
| 15-05-3 | 15-05 | 3 | EXT-05…08 | CLI | `node scripts/gate-coverage.mjs` prints `COVERAGE OK` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `scripts/ci-gates.sh`, `gates.manifest.json`,
`gates.manifest.lock`, `scripts/fixtures/` and `bash scripts/safe-commit.sh` all exist and are green
at 28/28. No framework is installed and no dependency is added.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| A returning owner actually understands `.planning/ORIENTATION.md` | EXT-08 | Comprehension is not machine-checkable. Every *fact* the page asserts is machine-checked by `check-planning-truth.mjs`; only its readability is not | Owner opens `.planning/ORIENTATION.md` cold and answers the three questions it claims to answer |

Everything else in this phase has an automated verify.

---

## Validation Sign-Off

- [x] All tasks have an `<automated>` verify command; none depends on Wave 0
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references — there are none
- [x] No watch-mode flags anywhere (`vitest` is invoked only as `npm run test:gate`)
- [x] Feedback latency < 2s for the four new checks
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-01

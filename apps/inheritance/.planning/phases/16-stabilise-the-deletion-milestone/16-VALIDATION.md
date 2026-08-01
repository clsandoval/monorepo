---
phase: 16
slug: stabilise-the-deletion-milestone
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 16 deletes UI surface and resolves stale screenshot references. It adds no legal rule, no
peso figure and no engine source. The validation question is therefore *"did the deletion leave
anything dangling, and did anything get approved that nobody looked at"* — and the second half of
that question cannot be answered by any automated command, which is why section "Manual-Only
Verifications" below is unusually load-bearing for this project.

Two of this phase's checks are expected to end **red**, by design, and the strategy below says so
up front so that a red result is not mistaken for an execution failure. See `16-RESEARCH.md`
sections 5 and 6.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 (frontend), `tsc -b` (typecheck), Node ESM journey harness, all run through `scripts/ci-gates.sh` |
| **Config file** | `gates.manifest.json` / `gates.manifest.lock`; `frontend/test-baseline.json` |
| **Quick run command** | `cd frontend && npx tsc -b --force` |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | quick ~12 seconds; frontend suite ~20 seconds; `journey/run.mjs --all` ~2 minutes including the Vite build; full suite ~6 minutes |

The typecheck is the phase's primary tripwire. `frontend/tsconfig.json` sets `noUnusedLocals` and
`noUnusedParameters`, so a half-finished deletion — a stale import, an orphaned handler, a type
that lost its only consumer — is a build failure rather than dead code that lingers. That is what
makes "typecheck between edits" a real gate and not a ritual.

---

## Sampling Rate

- **After every individual wizard edit:** `cd frontend && npx tsc -b --force`. This is the
  explicit instruction the phase inherits — a previous attempt swept the file with a regex, was
  never typechecked mid-way, and had to be reverted.
- **After every task commit:** that task's own `<verify>` block, which is always a real command.
- **After every plan:** `cd frontend && npm run test:gate`, except in plan `16-04`, where that
  command is expected to fail with `TEST COUNT DROPPED` and the failure is the deliverable.
- **After the final wave:** `bash scripts/ci-gates.sh`, capturing the real exit code and the real
  marker line whatever they are.
- **Max feedback latency:** 12 seconds for the typecheck; ~6 minutes for the whole suite.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 16-01-1 | 16-01 | 1 | CUT-02 | source assertion | `grep -c "ResizeObserver\|hasPointerCapture\|scrollIntoView" frontend/src/test-setup.ts` | ⬜ pending |
| 16-01-2 | 16-01 | 1 | CUT-02 | CLI | `cd frontend && npm run test:gate` | ⬜ pending |
| 16-01-3 | 16-01 | 1 | CUT-02 | classification | per-failure grep over the vitest JSON report | ⬜ pending |
| 16-01-4 | 16-01 | 1 | CUT-03 | CLI | `cd frontend && node journey/run.mjs --all` | ⬜ pending |
| 16-02-1 | 16-02 | 2 | CUT-01 | source assertion | `grep -n "INTAKE_STEPS" frontend/src/types/intake.ts` | ⬜ pending |
| 16-02-2 | 16-02 | 2 | CUT-01 | typecheck | `cd frontend && npx tsc -b --force` after removing index 5 | ⬜ pending |
| 16-02-3 | 16-02 | 2 | CUT-01 | typecheck | `cd frontend && npx tsc -b --force` after removing index 1 | ⬜ pending |
| 16-02-4 | 16-02 | 2 | CUT-01 | typecheck | `cd frontend && npx tsc -b --force` after removing index 0 | ⬜ pending |
| 16-02-5 | 16-02 | 2 | CUT-01 | source assertion | `grep -rc "ConflictCheckStep\|ClientDetailsStep\|SettlementTrackStep" frontend/src/` | ⬜ pending |
| 16-03-1 | 16-03 | 3 | CUT-01 | source assertion | `test ! -f frontend/src/lib/conflict-check.ts` | ⬜ pending |
| 16-03-2 | 16-03 | 3 | CUT-01 | source assertion | seven-identifier grep sweep returning zero hits | ⬜ pending |
| 16-03-3 | 16-03 | 3 | CUT-01 | typecheck | `cd frontend && npx tsc -b --force` | ⬜ pending |
| 16-04-1 | 16-04 | 4 | CUT-01 | CLI | `cd frontend && npm run test:gate` | ⬜ pending |
| 16-04-2 | 16-04 | 4 | CUT-04 | BLOCKED report | pasted `TEST COUNT DROPPED` output | ⬜ **expected red** |
| 16-05-1 | 16-05 | 5 | CUT-03 | CLI | `cd frontend && node journey/run.mjs --all` | ⬜ pending |
| 16-05-2 | 16-05 | 5 | CUT-03 | manual visual | per-step artifact inspection before any approve | ⬜ pending |
| 16-05-3 | 16-05 | 5 | CUT-03 | CLI | `node scripts/check-journey-registry.mjs` | ⬜ pending |
| 16-06-1 | 16-06 | 6 | CUT-04 | CLI | `bash scripts/ci-gates.sh` | ⬜ **expected red** |
| 16-06-2 | 16-06 | 6 | CUT-04 | source assertion | `git diff` on the four weakening surfaces printing nothing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers every phase requirement. No test framework is installed, no
fixture is created and no new gate is registered by this phase.

One environmental precondition must hold before waves 1, 5 and 6, and is checked rather than
assumed: the local Supabase stack must be up, because `journey/run.mjs` and `rls-isolation.mjs`
both drive a real database. `npx supabase status` inside `frontend/` reports it. If it is down,
`supabase start` from `frontend/` brings it up; if it cannot be brought up, that is a cannot-run
condition and the phase reports BLOCKED with exit code 2 semantics rather than recording a
product failure.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| A journey diff is confined to the deleted sidebar navigation region | CUT-03 | No automated check can distinguish "the sidebar moved" from "a money figure changed" — that judgement is the entire reason `journey/approve.mjs` exists and refuses to be called by a gate | For each failing step, open `frontend/.journey-runs/<newest>/<stepId>/` and view `actual.png`, `expected.png` and `diff.png` side by side. Approve only when every differing pixel lies in the left-hand navigation column. Record the approval with `node journey/approve.mjs <stepId> --by deletion-milestone-nav-change`. |
| A `REFERENCE SIZE MISMATCH` step's height change is nav-attributable | CUT-03 | The harness computes no pixel diff at all when sizes differ, so there is nothing for an automated check to read | Compare the two images' dimensions and content directly for `results-view` and `results-family-tree`. A height change caused by anything other than the removed nav item is left failing and reported. |
| The eight intake journey steps are routed to human review, not approved | CUT-03 | Their rubric text and seeded fixture shape both change with the cut, so their diffs necessarily touch wizard fields | Confirm `git log --oneline -- frontend/journey/references/intake-*.png` shows no new commit from this phase. |

---

## Expected-Red Register

Two checks in this phase are expected to end red, and both are owner decisions rather than
executor work. Recording them here means a red run can be read as "the phase found what it was
sent to find" instead of "the phase failed".

| Check | Expected marker | Owner decision required |
|---|---|---|
| `cd frontend && npm run test:gate` after plan `16-04` | `TEST COUNT DROPPED: ran <n> tests, floor is 2119` | Whether to lower `min_total_tests` in `frontend/test-baseline.json`, as `4ccf06270` did once under explicit authorisation |
| `bash scripts/ci-gates.sh` in plan `16-06` | `GATE FAILED: G20` | Whether to retire gates G20 and G21, whose scripts `4ccf06270` deleted; retiring a gate is owner action under `CLAUDE.md` invariant 2 |

Neither may be cleared by an agent. Editing `test-baseline.json` or `gates.manifest.json` to make
either go green is prohibited by the phase constraints and by `CLAUDE.md`.

---

## Validation Sign-Off

- [x] All tasks have an automated `<verify>` command or an explicit manual-only entry above
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all missing references — none are missing
- [x] No watch-mode flags anywhere in the phase
- [x] Feedback latency < 12s for the primary tripwire
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 2
slug: loop-durability-commit-discipline
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None at `apps/inheritance/` root — direct command execution plus committed fixtures (same approach as Phase 1's `check-test-baseline.mjs`) |
| **Config file** | none — every artifact is a standalone Node ESM or Bash script |
| **Quick run command** | `cd apps/inheritance && node scripts/check-gate-manifest.mjs && node scripts/check-plan-closed-world.mjs && node scripts/check-commit-discipline.mjs` |
| **Full suite command** | `bash apps/inheritance/scripts/ci-gates.sh` |
| **Estimated runtime** | quick ~3 s · full ~300 s (dominated by `cargo test` and the 2,416-test Vitest suite) |

Rationale for having no framework: every artifact in this phase *is* a command-line check.
Its entire observable contract is `(exit code, marker string on stdout)`. Wrapping that in a
test runner would add a dependency and a layer of indirection without adding signal. Phase 1
established this pattern and it is carried forward unchanged.

---

## Sampling Rate

- **After every task:** run that task's `<verify>` block and read the printed exit code.
- **After every plan:** run the plan's full `<verification>` checklist, including every
  fixture-driven failure path.
- **After every wave:** run `bash apps/inheritance/scripts/ci-gates.sh` and confirm the
  expected exit code for that point in the phase.
- **Before phase sign-off:** the full runner exits 0 with `ALL GATES PASSED (7/7)`.
- **Max feedback latency:** 5 seconds for the meta-checks, 300 seconds for the full runner.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | LOOP-03 | T-2-01a | Manifest enumerates every gate with a locked command | fixture | `node scripts/check-gate-manifest.mjs` | ❌ W1 | ⬜ pending |
| 02-01-02 | 01 | 1 | LOOP-03 | T-2-01a | Lock records `{id, command, blocking}` for every gate | fixture | `node scripts/check-gate-manifest.mjs` | ❌ W1 | ⬜ pending |
| 02-01-03 | 01 | 1 | LOOP-03 | T-2-01b | Removal, command change and weakening each exit 1 | fixture | `node scripts/check-gate-manifest.mjs --manifest scripts/fixtures/manifest-removed.json` | ❌ W1 | ⬜ pending |
| 02-01-04 | 01 | 1 | LOOP-03 | T-2-01c | Immutability rule stated in the artifact itself | source | `grep -c "may only grow" GATES.md` | ❌ W1 | ⬜ pending |
| 02-02-01 | 02 | 1 | LOOP-01 | T-2-02a | Closed-world is defined, not asserted | source | `grep -c "OPEN WORLD PHRASE" .planning/PLAN-STANDARD.md` | ❌ W1 | ⬜ pending |
| 02-02-02 | 02 | 1 | LOOP-01 | T-2-02a | Lint passes on all 10 existing plan files | behavior | `node scripts/check-plan-closed-world.mjs` | ❌ W1 | ⬜ pending |
| 02-02-03 | 02 | 1 | LOOP-01 | T-2-02b | Each of the 9 violation markers observed firing | fixture | `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-openworld.md` | ❌ W1 | ⬜ pending |
| 02-02-04 | 02 | 1 | LOOP-01, LOOP-02 | T-2-02c | BLOCKED report format is specified | source | `grep -c "BLOCKED" .planning/PLAN-STANDARD.md` | ❌ W1 | ⬜ pending |
| 02-03-01 | 03 | 1 | LOOP-05 | T-2-03a | Wrapper refuses broad stages | behavior | `bash scripts/safe-commit.sh -m x -A` exits 1 | ❌ W1 | ⬜ pending |
| 02-03-02 | 03 | 1 | LOOP-05 | T-2-03b | History audit finds zero mixed commits today | behavior | `node scripts/check-commit-discipline.mjs` | ❌ W1 | ⬜ pending |
| 02-03-03 | 03 | 1 | LOOP-05 | T-2-03b | Synthetic mixed commit is detected | fixture | `node scripts/check-commit-discipline.mjs --from-json scripts/fixtures/commits-mixed.json` | ❌ W1 | ⬜ pending |
| 02-03-04 | 03 | 1 | LOOP-05 | T-2-03c | Rule documented as mandatory in README and CLAUDE.md | source | `grep -c "safe-commit.sh" README.md CLAUDE.md` | ❌ W1 | ⬜ pending |
| 02-04-01 | 04 | 2 | LOOP-03 | T-2-04a | Three meta-gates appended to manifest and lock | behavior | `node scripts/check-gate-manifest.mjs` | ❌ W2 | ⬜ pending |
| 02-04-02 | 04 | 2 | LOOP-02 | T-2-04b | Runner iterates the manifest instead of hardcoding | source | `grep -c "gates.manifest.json" scripts/ci-gates.sh` | ❌ W2 | ⬜ pending |
| 02-04-03 | 04 | 2 | LOOP-02 | T-2-04c | Missing tool exits 2 with `GATE CANNOT RUN` | behavior | `bash scripts/ci-gates.sh` under a stripped PATH | ❌ W2 | ⬜ pending |
| 02-04-04 | 04 | 2 | LOOP-02 | T-2-04c | Failing gate exits 1, not 2 | fixture | `bash scripts/ci-gates.sh --only G6` with a bad plan file | ❌ W2 | ⬜ pending |
| 02-04-05 | 04 | 2 | LOOP-02 | T-2-04d | Run record written on every exit path | behavior | `test -f .gate-runs/latest.json` after each of the three paths | ❌ W2 | ⬜ pending |
| 02-05-01 | 05 | 3 | LOOP-04 | T-2-05a | Coverage table renders from manifest + run record | behavior | `node scripts/gate-coverage.mjs` | ❌ W3 | ⬜ pending |
| 02-05-02 | 05 | 3 | LOOP-04 | T-2-05b | A narrowed passing run exits 1 with `SCOPE NARROWED` | fixture | `node scripts/gate-coverage.mjs --run scripts/fixtures/run-narrowed.json` | ❌ W3 | ⬜ pending |
| 02-05-03 | 05 | 3 | LOOP-04 | T-2-05c | Ungated requirements do not fail the build | fixture | `node scripts/gate-coverage.mjs --run scripts/fixtures/run-green.json` exits 0 | ❌ W3 | ⬜ pending |
| 02-05-04 | 05 | 3 | LOOP-04 | T-2-05a | Closeout wired into the runner | behavior | `bash scripts/ci-gates.sh` prints `GATE COVERAGE 7/7` | ❌ W3 | ⬜ pending |
| 02-06-01 | 06 | 4 | LOOP-06 | T-2-06a | History is append-then-truncate, bounded at 200 | fixture | `node scripts/loop-status.mjs record --run scripts/fixtures/run-green.json --history <tmp>` | ❌ W4 | ⬜ pending |
| 02-06-02 | 06 | 4 | LOOP-06 | T-2-06b | Stall rule fires on 3 identical and on 5 mixed failures | fixture | `node scripts/loop-status.mjs check --history scripts/fixtures/history-stalled.jsonl` | ❌ W4 | ⬜ pending |
| 02-06-03 | 06 | 4 | LOOP-06 | T-2-06c | Status file leads with the state banner | source | `head -5 LOOP-STATUS.md` contains the state token | ❌ W4 | ⬜ pending |
| 02-06-04 | 06 | 4 | LOOP-06 | T-2-06d | Recorder runs on success, failure and halt paths | behavior | `trap` present in `scripts/ci-gates.sh`; three-path check | ❌ W4 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*"File Exists ❌ W\<n\>" means the artifact is created by that wave; there is no separate Wave 0.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No framework install, no shared
fixture module, and no new dependency is needed — every artifact is a dependency-free
Node ESM or Bash script exercised directly, and its fixtures are committed alongside it by
the same plan that creates it.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

One honest caveat carried forward from Phase 1 and not resolvable inside this phase: the
GitHub workflow has still never executed, because the repository has unpushed commits. Every
claim about CI behavior in this phase is therefore verified by running the exact same script
CI runs (`bash apps/inheritance/scripts/ci-gates.sh`) locally, plus structural inspection of
the workflow YAML. No plan in this phase may claim a green CI run it has not observed.

---

## Validation Sign-Off

- [ ] All tasks have an automated `<verify>` command
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Every violation marker in every checker has a committed fixture proving it fires
- [ ] No watch-mode flags anywhere
- [ ] Feedback latency < 5 s for meta-checks, < 300 s for the full runner
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

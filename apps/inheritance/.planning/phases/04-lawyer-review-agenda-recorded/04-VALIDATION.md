---
phase: 4
slug: lawyer-review-agenda-recorded
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None at `apps/inheritance/` root — direct command execution plus committed fixtures (carried forward unchanged from Phases 1, 2 and 3) |
| **Config file** | none — every check is a standalone Node ESM or Bash script |
| **Quick run command** | `cd apps/inheritance && node scripts/check-lawyer-agenda.mjs && node scripts/check-plan-closed-world.mjs && node scripts/check-gate-manifest.mjs` |
| **Engine command** | `cd apps/inheritance/engine && cargo test` |
| **Typecheck command** | `cd apps/inheritance/frontend && npx tsc -b --force` |
| **Full suite command** | `bash apps/inheritance/scripts/ci-gates.sh` |
| **Estimated runtime** | quick ~3 s · engine ~25 s · typecheck ~20 s · full ~300 s |

Every artifact in this phase is a file in the repository, so every check is static: no database, no
Docker, no network, no running stack. This is the fastest-sampling phase in the project and the
whole of it runs in GitHub Actions.

---

## Sampling Rate

- **After every task:** run that task's `<verify>` block and read the printed exit code.
- **After every plan:** run the plan's full `<verification>` checklist, including every
  fixture-driven failure path.
- **After every task that edits a file under `engine/src/`:** run `cd engine && cargo test`
  immediately, not at plan end. Plan 04-03 task 2 inserts comment lines into seven Rust files, and a
  marker placed between an attribute and its item does not compile.
- **After every task that edits `gates.manifest.json` or `gates.manifest.lock`:** run
  `node scripts/check-gate-manifest.mjs` immediately. A manifest gate absent from the lock is
  `UNLOCKED GATE`, and catching it one task later costs a re-run of the whole gate set.
- **After waves 3, 4 and 5:** run `bash scripts/ci-gates.sh` in full.
- **Before phase sign-off:** the full runner exits 0 with `ALL GATES PASSED (10/10)`.
- **Max feedback latency:** 3 seconds for the static checks, 25 seconds for `cargo test`, 300
  seconds for the full runner.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | LAWYER-01 | T-4-01c | The agenda opens with the exact heading the BLOCKED protocol names | source | `head -1 .planning/LAWYER-AGENDA.md` equals `# Lawyer Review Agenda` | ❌ W1 | ⬜ pending |
| 04-01-02 | 01 | 1 | LAWYER-04 | T-4-01e | The three blocking questions are listed before the entries | source | `grep -c "Answer these three first" .planning/LAWYER-AGENDA.md` returns 1 | ❌ W1 | ⬜ pending |
| 04-01-03 | 01 | 1 | LAWYER-01, LAWYER-02, LAWYER-03 | T-4-01d | Three entries exist with the identical eight-heading structure | source | `grep -c "^## LAWYER-" .planning/LAWYER-AGENDA.md` returns 3 | ❌ W1 | ⬜ pending |
| 04-01-04 | 01 | 1 | LAWYER-01, LAWYER-02, LAWYER-03 | T-4-01a | No agent answered a decision | source | `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` returns 0 | ❌ W1 | ⬜ pending |
| 04-01-05 | 01 | 1 | LAWYER-04 | T-4-01b | The highest-stakes entry names what it blocks and cites the audited facts | source | `grep -c "LAW-07" .planning/LAWYER-AGENDA.md` returns at least 1 | ❌ W1 | ⬜ pending |
| 04-02-01 | 02 | 2 | LAWYER-05, LAWYER-06 | T-4-02b | The schema consequence of Reading B is stated in the entry | source | `grep -c "accion de reduccion" .planning/LAWYER-AGENDA.md` returns at least 1 | ❌ W2 | ⬜ pending |
| 04-02-02 | 02 | 2 | LAWYER-08 | T-4-02c | The refusal option is offered explicitly | source | `grep -c "Refuse to compute Sec. 41" .planning/LAWYER-AGENDA.md` returns 1 | ❌ W2 | ⬜ pending |
| 04-02-03 | 02 | 2 | LAWYER-07 | T-4-02e | The spec is untouched by the agenda plans | behavior | `git status --porcelain specs/` produces no output | ❌ W2 | ⬜ pending |
| 04-02-04 | 02 | 2 | LAWYER-05…08 | T-4-02d | All eight entries are structurally uniform | source | fourteen structural greps each return 8 | ❌ W2 | ⬜ pending |
| 04-02-05 | 02 | 2 | LAWYER-05…08 | T-4-02a | All eight statuses read awaiting-answer | source | `grep -c "awaiting-answer" .planning/LAWYER-AGENDA.md` returns at least 16 | ❌ W2 | ⬜ pending |
| 04-03-01 | 03 | 3 | LAWYER-09 | T-4-03e | The registry ships eight decisions, all awaiting an answer, all answer fields null | behavior | `node -e` assertion over `.planning/lawyer-decisions.json` | ❌ W3 | ⬜ pending |
| 04-03-02 | 03 | 3 | LAWYER-09 | T-4-03d | Every anchor pattern matches its file exactly once | behavior | `grep -Fc` per anchor returns 1 for all ten | ❌ W3 | ⬜ pending |
| 04-03-03 | 03 | 3 | LAWYER-09 | T-4-03c | Marker insertion changed nothing but comments | behavior | `git diff --numstat` shows 9 added, 0 deleted across the eight source files | ❌ W3 | ⬜ pending |
| 04-03-04 | 03 | 3 | LAWYER-09 | T-4-03b | The engine still compiles and passes | behavior | `cd engine && cargo test` reports `442 passed`, `0 failed` | ❌ W3 | ⬜ pending |
| 04-03-05 | 03 | 3 | LAWYER-09 | T-4-03b | The frontend still typechecks | behavior | `cd frontend && npx tsc -b --force` produces zero output, exit 0 | ❌ W3 | ⬜ pending |
| 04-03-06 | 03 | 3 | LAWYER-07 | T-4-03a | The hedge is replaced, not deleted into an assertion | source | `git diff --numstat HEAD~1 -- specs/estate-tax-engine-spec.md` shows 2 added, 1 deleted | ❌ W3 | ⬜ pending |
| 04-04-01 | 04 | 4 | LAWYER-09 | T-4-04a | The check passes on the current tree and reports its own coverage | behavior | `node scripts/check-lawyer-agenda.mjs` exits 0 with `AGENDA OK` and a `GATE-SKIPS` line | ❌ W4 | ⬜ pending |
| 04-04-02 | 04 | 4 | LAWYER-09 | T-4-04a | A status advanced without an answer turns the gate red | fixture | `--registry scripts/fixtures/lawyer-status-invalid.json` exits 1 with `DECISION STATUS INVALID` | ❌ W4 | ⬜ pending |
| 04-04-03 | 04 | 4 | LAWYER-09 | T-4-04b | A renamed rule turns the gate red | fixture | `--registry scripts/fixtures/lawyer-anchor-broken.json` exits 1 with `DECISION ANCHOR BROKEN` | ❌ W4 | ⬜ pending |
| 04-04-04 | 04 | 4 | LAWYER-09 | T-4-04c | A lost marker turns the gate red | fixture | `--registry scripts/fixtures/lawyer-marker-missing.json` exits 1 with `DECISION MARKER MISSING` | ❌ W4 | ⬜ pending |
| 04-04-05 | 04 | 4 | LAWYER-09 | T-4-04d | Agenda-versus-registry drift turns the gate red | fixture | `--agenda scripts/fixtures/lawyer-agenda-drift.md` exits 1 with `AGENDA DRIFT` | ❌ W4 | ⬜ pending |
| 04-04-06 | 04 | 4 | LAWYER-09 | T-4-04a | A missing decision and a missing field each turn the gate red | fixture | the two remaining registry fixtures exit 1 with `AGENDA ENTRY MISSING` and `DECISION FIELD MISSING` | ❌ W4 | ⬜ pending |
| 04-04-07 | 04 | 4 | LAWYER-09 | T-4-04a | An unreadable input never exits 0 | fixture | `--registry /tmp/definitely-not-a-registry.json` exits 1 with `AGENDA SCAN UNREADABLE` | ❌ W4 | ⬜ pending |
| 04-04-08 | 04 | 4 | LAWYER-09 | T-4-04h | No locked gate command changed while adding G10 | source | `node scripts/check-gate-manifest.mjs` exits 0 with `MANIFEST OK`, 10 gates and 10 locked | ❌ W4 | ⬜ pending |
| 04-04-09 | 04 | 4 | LAWYER-09 | T-4-04e | G9 still runs last and still sees a complete results file | behavior | `node scripts/check-gate-results.mjs` exits 0 after a full runner pass | ❌ W4 | ⬜ pending |
| 04-04-10 | 04 | 4 | LAWYER-09 | T-4-04f | The new gate is skip-accounted rather than exempted | behavior | `node scripts/check-gate-skips.mjs` exits 0 with `SKIPS OK`, and `.gate-runs/logs/G10.log` contains a `GATE-SKIPS` line | ❌ W4 | ⬜ pending |
| 04-05-01 | 05 | 5 | LAWYER-10 | T-4-05c | The workflow states five fixed steps with a fixed vector convention | source | `grep -c "^### Step " .planning/LEGAL-CORRECTION-WORKFLOW.md` returns 5 | ❌ W5 | ⬜ pending |
| 04-05-02 | 05 | 5 | LAWYER-10 | T-4-05d | The vector precedes the fix, and the failing command is named | source | `grep -c "cd engine && cargo test" .planning/LEGAL-CORRECTION-WORKFLOW.md` returns at least 1 | ❌ W5 | ⬜ pending |
| 04-05-03 | 05 | 5 | LAWYER-10 | T-4-05e | The dangling PLAN-STANDARD reference is closed | source | `grep -c "Phase 4 owns that file's full structure" .planning/PLAN-STANDARD.md` returns 0 | ❌ W5 | ⬜ pending |
| 04-05-04 | 05 | 5 | LAWYER-10 | T-4-05a | The nine closed-world rules survive the PLAN-STANDARD edit | behavior | `node scripts/check-plan-closed-world.mjs` exits 0, and the marker-string counts are unchanged | ❌ W5 | ⬜ pending |
| 04-05-05 | 05 | 5 | LAWYER-01…10 | T-4-05b | The whole gate set is green at phase end | behavior | `bash scripts/ci-gates.sh` exits 0 with `ALL GATES PASSED (10/10)` | ❌ W5 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*"File Exists ❌ W\<n\>" means the artifact is created by that wave; there is no separate Wave 0.*

Thirty-one checks across fifteen tasks. No task lacks an automated `<verify>`, so the "no 3
consecutive tasks without automated verification" floor is met with margin.

---

## Wave 0 Requirements

Existing infrastructure covers every phase requirement. No framework install, no shared fixture
module, and no dependency is added to `apps/inheritance/`. `scripts/check-lawyer-agenda.mjs` uses
`node:fs` and `node:path` only, spawns no subprocess and opens no socket, matching the five checks
Phases 2 and 3 already shipped.

---

## Manual-Only Verifications

Three, all stated so none is mistaken for automated coverage.

1. **No check in this phase verifies that an answer is legally correct.** Gate `G10` verifies
   structural agreement between the agenda and the registry, that each anchor still resolves to
   exactly one location, that each anchored file still carries its marker, and that no status
   advanced without an answer attached. Whether Reading A or Reading B is right is not a thing a
   script can know, and a gate that appeared to bless a legal reading would be worse than no gate.
2. **No check verifies that the agenda reached the lawyer.** Sending it is an owner action outside
   the repository. This phase's deliverable is an agenda that is ready to send and answerable in one
   sitting, not a delivery receipt.
3. **The GitHub workflow has still never executed.** Carried forward from Phases 1 and 3 unchanged:
   the repository has unpushed commits, so every claim about CI behaviour is verified by running
   locally the exact script CI runs (`bash apps/inheritance/scripts/ci-gates.sh`) plus structural
   inspection of the workflow YAML. Everything added in this phase is static and needs no database,
   so nothing here makes CI less runnable — and nothing here observes CI running either.

---

## Validation Sign-Off

- [ ] All tasks have an automated `<verify>` command
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Every violation marker in `scripts/check-lawyer-agenda.mjs` has a committed fixture proving it fires
- [ ] Every requirement has at least one check that runs without a database
- [ ] `cargo test` and `npx tsc -b --force` are re-run immediately after every source-file edit
- [ ] No watch-mode flags anywhere
- [ ] Feedback latency < 3 s for static checks, < 300 s for the full runner
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

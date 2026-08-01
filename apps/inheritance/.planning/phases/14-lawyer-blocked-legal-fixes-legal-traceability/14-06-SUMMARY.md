---
phase: 14-lawyer-blocked-legal-fixes-legal-traceability
plan: 06
subsystem: gates
tags: [gate-registration, manifest, requirements, roadmap]
requires: ["14-01", "14-02", "14-03", "14-04", "14-05"]
provides:
  - "gates G26-G29 registered at orders 21-24; the set grew 24 -> 28"
affects:
  - "G10, G11, G8, G9 shifted to orders 25-28 (order only)"
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
key-decisions:
  - "LAW-06, LAW-07 and LAW-12 stay UNCHECKED in REQUIREMENTS.md and the phase stays `[ ]` in ROADMAP.md. Marking any of them complete would make G26 raise REQUIREMENT CLAIMED COMPLETE, which is the correct behaviour: they are blocked, not delivered."
  - "The GATES.md current-gates table was stale from Phase 13 — it listed 20 gates and had no rows for G22-G25. It was regenerated wholesale from the manifest rather than patched, so the table now matches the manifest gate for gate."
requirements-completed: [LAW-13, LAW-14, LAW-15]
requirements-blocked: [LAW-06, LAW-07, LAW-12]
duration: 45 min
completed: 2026-08-01
---

# Phase 14 Plan 06: Register G26–G29 Summary

The gate set grew from 24 to 28. `bash scripts/ci-gates.sh` prints **`ALL GATES PASSED (28/28)`** and
exits 0, observed three times.

## What Was Built

- Four gate objects appended to `gates.manifest.json` with all nine keys, `blocking: true`,
  `cwd: apps/inheritance`, at orders 21–24. Four matching `{id, command, blocking}` entries appended
  to `gates.manifest.lock`.
- G10, G11, G8 and G9 moved from 21/22/23/24 to **25/26/27/28**, `order` the only field touched.
  G9 is still last. **G14 remains reserved and unregistered** for Phase 9's `09-06`.
- `GATES.md`: the current-gates table regenerated to all 28 rows in `order`, plus four new sections
  16–19, one per gate, each naming every violation marker and the fixture that drives it.
- `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` updated to what the gates actually prove.
- 1 commit, `6fe85cbc9`, five explicit paths.

## Verification Results

| Command | Result |
|---|---|
| four checks in isolation | `EXIT=0` on all four; `BLOCKED REQUIREMENTS OK — 3 requirement(s) checked, all awaiting-answer` (no lawyer answer arrived while this phase ran), `SPEC LEGAL TEXT OK — 4 correction(s), 11 location(s) checked`, `LEGAL TRACEABILITY COVERAGE 63/79 articles traced, 16 declared untraced`, `BUGS LEDGER OK — 2 entries checked`; one `GATE-SKIPS` line each |
| `node scripts/check-gate-manifest.mjs` | `MANIFEST OK — 28 gates, 28 locked`, `EXIT=0` |
| gate/lock counts | `gates 28 locked 28` |
| order listing | `… G22:17 G23:18 G24:19 G25:20 G26:21 G27:22 G28:23 G29:24 G10:25 G11:26 G8:27 G9:28` — G9 still last |
| `git diff gates.manifest.lock` | `20 insertions, 0 deletions`; zero `-` lines — nothing removed or modified |
| `git diff gates.manifest.json` on `command`/`blocking` | only `+` lines, all four belonging to the new gates |
| every gate command documented in GATES.md | `every gate command documented` (checked programmatically against the manifest) |
| `grep -n "^## 1[6-9]\." GATES.md` | four headings at 1287, 1326, 1365, 1413 |
| section 16 contains `ANSWER ARRIVED` / `.planning/LEGAL-CORRECTION-WORKFLOW.md` | `2` / `1` |
| section 18 contains `may only shrink` / `16` | `1` / `2` |
| all 28 violation markers across the four scripts present in GATES.md | `missing from GATES.md: []` |
| **`bash scripts/ci-gates.sh` run 1** | `ALL GATES PASSED (28/28)`, `REQUIREMENT COVERAGE 40/94 gated`, `COVERAGE OK`, `LOOP STATUS GREEN`, `RUNNER=0`, **5m28.9s** |
| **run 2** (immediately after) | `ALL GATES PASSED (28/28)`, `RUNNER=0`, **5m26.4s** |
| **run 3** (after the commit) | `ALL GATES PASSED (28/28)`, `RUNNER=0`, **5m25.6s** |
| `.gate-runs/logs/` | 28 `G*.log` files plus `RUN.stamp` (`GSD-RUN 2026-08-01T00:10:36Z`); **28 of 28** logs carry the stamp; `G26.log`, `G27.log`, `G28.log`, `G29.log` each contain exactly one `GATE-SKIPS` line |
| `node scripts/check-gate-skips.mjs` | `SKIPS OK — 28 gates accounted, 1 declared skip, 0 undeclared`, exit 0; `git status --porcelain gate-skips.lock` empty — the four new gates required no addition |
| `node scripts/check-blocked-requirements.mjs` after the REQUIREMENTS.md edit | exit 0, **no** `REQUIREMENT CLAIMED COMPLETE` |
| `node scripts/check-plan-closed-world.mjs` | `PLANS OK — 86 plan file(s), 335 task(s) checked`, exit 0 |
| `node scripts/check-commit-discipline.mjs` | `COMMIT DISCIPLINE OK — 212 commit(s) audited … 0 mixed`, exit 0 |
| `git show --stat --name-only HEAD` | exactly the five `files_modified` paths, all under `apps/inheritance/` |
| ROADMAP Phase 14 bullet | names all six requirement ids, all four new gate ids, and the literal `ALL GATES PASSED (28/28)`; phase left `[ ]` |

## Deviations from Plan

**[Rule 3 — acceptance criterion is unachievable by construction] `git status --porcelain
apps/inheritance` is not empty** — Found during: Task 6. The runner itself rewrites four tracked
artifacts on every run: `LOOP-STATUS.md`, `gate-results.json`, `loop-history.jsonl` and
`engine/COVERAGE.md` (via G12's `scripts/coverage-report.sh`). Running `ci-gates.sh` — which tasks 4
and 6 both require — therefore *guarantees* a dirty tree afterwards. Those four files are runner
output owned by the loop, are in no plan's `files_modified`, and three of them were already dirty in
the working tree before this phase started. They were deliberately **not** committed. The substantive
criterion — that this plan's own five files are committed and nothing of this plan's is left
uncommitted — holds. (`frontend/supabase/.temp/cli-latest` is likewise a tool-written temp file that
was already dirty at phase start.)

**[Rule 1 — a stale document the plan did not know about] The GATES.md current-gates table was two
phases behind** — Found during: Task 3. The table listed 20 gates, ended at `G9 | 20`, and had **no
rows at all for G22–G25**, which Phase 13 registered in the manifest without updating the table. Task
3 requires the table to match the manifest, so it was regenerated from the manifest for all 28 gates
rather than patched at the tail. Existing "what it proves" prose was preserved verbatim for every
pre-existing row; only G22–G25 and G26–G29 got new text. The "gate set is now twenty" paragraph was
rewritten to "twenty-eight" with the Phase 13 and Phase 14 placements recorded.

**Total deviations:** 2, neither weakening anything.

## Issues Encountered

None. No gate was edited, no precondition relaxed, no test or assertion touched, and the runner never
exited 2.

## Self-Check: PASSED

- 28 gates, 28 locked, manifest integrity green.
- `ALL GATES PASSED (28/28)` observed three times, once post-commit.
- LAW-06/07/12 still `- [ ]`; G26 does not raise `REQUIREMENT CLAIMED COMPLETE`.
- `gate-skips.lock` unchanged.

## Next

Phase 15 — extendability and documentation closeout. LAW-06, LAW-07 and LAW-12 stay open until the
lawyer answers LAWYER-06, LAWYER-04 and LAWYER-08; G26 will turn red with `ANSWER ARRIVED` on the
first run after any of those statuses changes, which is the signal to start the work.

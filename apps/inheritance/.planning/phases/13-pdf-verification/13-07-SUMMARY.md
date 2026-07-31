---
phase: 13-pdf-verification
plan: 07
subsystem: gates
tags: [manifest, ci, documentation, requirements]
requires:
  - "frontend/journey/pdf-probe.mjs (13-02)"
  - "frontend/journey/print-layout.mjs (13-04)"
  - "frontend/journey/pdf-structure.mjs (13-05)"
  - "frontend/journey/pdf-visual.mjs (13-06)"
provides:
  - "Gates G22, G23, G24, G25 in the frozen manifest"
affects:
  - "gates.manifest.json, gates.manifest.lock, GATES.md, JOURNEY.md, CI workflow, REQUIREMENTS.md"
tech-stack:
  added: []
  patterns:
    - "Cheapest, dependency-free gate ordered first within a new group so a missing toolchain reports in seconds"
key-files:
  created: []
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - frontend/journey/JOURNEY.md
    - .github/workflows/inheritance-ci.yml
    - .planning/REQUIREMENTS.md
key-decisions:
  - "The manifest was edited with ensure_ascii=False after a first attempt escaped every em dash in existing `proves` prose into \\u2014. The rewritten file changes only `order` on existing gates, verified by diffing."
requirements-completed: [PDF-01, PDF-02, PDF-03, PDF-04, PDF-05]
duration: 45 min
completed: 2026-07-31
---

# Phase 13 Plan 07: Gate Registration and Closeout Summary

The four PDF checks are now in the frozen manifest, so they can only stop running by being removed
from a file that refuses to shrink.

- 3 tasks, 6 files, 1 commit (`1f378c0d5`), 320 insertions / 14 deletions
- `gates.manifest.json` and `gates.manifest.lock` each grew by **exactly four** entries, appended
  together in one commit. G10→21, G11→22, G8→23, G9→24. **`order` is the only field changed on any
  existing gate**, verified by diffing the file and filtering out `"order"` lines: the remaining diff
  is entirely the four new blocks.
- `G14` remains reserved and unregistered for Phase 9's unstarted `09-06`.
- `GATES.md` section 15, `JOURNEY.md` `## The PDF journey`, the CI poppler step, and five requirement
  closeouts.

## Verification Results — real output

```
$ node scripts/check-gate-manifest.mjs
MANIFEST OK — 24 gates, 24 locked
GATE-SKIPS total=24 skipped=0                 (MANIFEST_EXIT=0)

$ node -e "…sort by order, take last…"
GATES=24 LAST=G9 ORDER=24
```

**Five full gate runs.** Four green, one red:

| Run | Result | Wall clock |
|---|---|---|
| 1 (pre-doc) | `ALL GATES PASSED (24/24)`, exit 0 | `real 5m25.477s` |
| 2 | `ALL GATES PASSED (24/24)`, exit 0 | `real 5m25.527s` |
| 3 | **`GATE FAILED: G3 (exit 1)`** | `real 0m50.480s` |
| 4 | `ALL GATES PASSED (24/24)`, exit 0 | `real 5m25.674s` |
| 5 | `ALL GATES PASSED (24/24)`, exit 0 | `real 5m26.181s` |
| 6 | `ALL GATES PASSED (24/24)`, exit 0 | `real 5m25.430s` |

Runs 5 and 6 are **two consecutive green runs**, which is the load-bearing evidence the plan asked
for: three of the four new gates drive the database through the product, and a second run differing
from the first would mean a gate mutates state it does not restore. It does not.

Run 3's failure is analysed under **Issues Encountered** — it is a pre-existing intermittent flake in
G3, not a Phase 13 defect, and nothing was changed to make it go away.

```
$ node scripts/gate-coverage.mjs
REQUIREMENT COVERAGE 34/94 gated
COVERAGE OK                                   (COVERAGE_EXIT=0)

$ node scripts/check-gate-results.mjs
RESULTS OK — 24 gates, 34 requirements        (exit 0, no gate `not-run`)

$ node scripts/check-journey-registry.mjs
JOURNEY REGISTRY ok steps=33 references=33    (exit 0, unaffected by pdf-references/)

$ grep -c "\[x\]" .planning/LAWYER-AGENDA.md
0
```

Coverage went from **29/94** before this phase to **34/94** — exactly the five PDF requirements, each
mapped to its gate in the run's own output:

```
PDF-01 -> G22,G23
PDF-02 -> G23
PDF-03 -> G23
PDF-04 -> G24
PDF-05 -> G25
```

Workflow:
```
$ node -e "…scan for non-blocking patterns…"
WORKFLOW OK poppler=true fonts=true
$ python3 -c "yaml.safe_load(…)"
YAML OK, steps= 10 ; pdf step at index [4]      (after Install Node, before npm ci)

$ grep -c "^## 15\." GATES.md                    -> 1
$ grep -c "^## The PDF journey" frontend/journey/JOURNEY.md -> 1
```

`git diff HEAD~1 --stat` shows **no change** to `frontend/test-baseline.json`, `gate-skips.lock`,
`engine/defect-baseline.json`, `assertion-baseline.json` or `coverage-zero.lock`.

## Deviations from Plan

**[Rule 1 - tooling artefact] The first manifest edit escaped non-ASCII prose** — Found during:
Task 1. `json.dump` defaults to `ensure_ascii=True`, which rewrote every em dash in existing gates'
`proves` text and in the file's `$comment` as `—`. That is a gratuitous change to prose the plan
does not authorise. Fix: reverted with `git checkout --` and reapplied with `ensure_ascii=False`, then
verified by filtering `"order"` lines out of the diff — the only remaining changes are the four
appended blocks.

**Total deviations:** 1, mechanical, caught before commit.
**Impact:** None.

## Issues Encountered

**G3 is intermittently flaky, and it is pre-existing.** One of the five full gate runs failed:

```
GATE-SKIPS total=2470 skipped=0
GATE FAILED: G3 (exit 1)
LOOP STATUS RED — recorded fail
```

The named test both times it has been seen today is
`src/components/wizard/__tests__/ReviewStep.test.tsx :: wizard-step6 > ReviewStep predicted scenario
badge shows the engine scenario code for testate`.

What was measured, rather than assumed:

- It is **not caused by Phase 13**. During plan `13-03` the same failure was reproduced with this
  phase's source edits `git stash`-ed away.
- The four `ReviewStep` tests that fail *deterministically* are all already in `test-baseline.json`.
  The `predicted scenario badge` test is **not** in the ledger and passes in isolation.
- Immediately after the red run, `npm run test:gate` was run **six times consecutively** and exited
  `0` every time: `GATE OK — test baseline matches exactly`, 2470 run, 46 known failures met, 0
  unknown.
- Two subsequent full `ci-gates.sh` runs were green back to back.

So the observed rate is roughly 2 in 12 full-suite runs, on a WASM-backed scenario-prediction test —
consistent with a test-ordering or shared-module-init interaction rather than a product defect.
**Nothing was added to any ledger, no test was touched, and no gate was weakened.** Recorded here so
it is visible; it is a real latent risk for a month-long unattended loop, because a flaky blocking
gate will occasionally paint the loop red for no product reason.

## Self-Check: PASSED

- `git log --oneline --all --grep="13-07"` → `1f378c0d5`
- Every task `<acceptance_criteria>` re-run above; the plan-level `<verification>` block, all five
  commands, re-run above
- `git status --porcelain apps/inheritance/` holds only auto-committer churn
  (`LOOP-STATUS.md`, `gate-results.json`, `loop-history.jsonl`, `engine/COVERAGE.md`,
  `supabase/.temp/cli-latest`) — every file this plan owns is committed

## Next

Phase 13 is complete: 7 of 7 plans executed, all five PDF requirements gate-proven, 24 gates passing.
Ready for phase verification.

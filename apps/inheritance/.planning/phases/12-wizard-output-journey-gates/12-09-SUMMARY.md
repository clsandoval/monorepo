---
phase: 12-wizard-output-journey-gates
plan: 09
subsystem: gates
tags: [manifest, gates, docs, ci]
requires: [12-03, 12-04, 12-05, 12-06, 12-07, 12-08]
provides:
  - "G19 money parity, G20 share exposure, G21 seo smoke, registered and blocking"
  - "GATES.md section 14 and the JOURNEY.md wizard/output sections"
affects:
  - gates.manifest.json
  - gates.manifest.lock
  - .github/workflows/inheritance-ci.yml
tech-stack:
  added: []
  patterns: []
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
  - "JRNY-05 is recorded PARTIAL, not Complete: wizard-will is withheld."
  - "G14 stays reserved and unused; G9 stays last."
requirements-completed: [JRNY-06, JRNY-07, JRNY-08, JRNY-11]
duration: 25 min
completed: 2026-07-31
---

# Phase 12 Plan 09: Gate Registration and Documentation Summary

Three gates registered into the frozen manifest, documented in `GATES.md` §14 and `JOURNEY.md`, the
CI timeout raised, and the phase's requirements closed against named commands.

5 tasks, 6 files modified, 1 commit (`a06663c8a`).

## Verification

```
node scripts/check-gate-manifest.mjs -> exit 0
    MANIFEST OK — 20 gates, 20 locked
    GATE-SKIPS total=20 skipped=0
gates=20
orders=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
last=G9
grep -c '"id": "G14"' gates.manifest.json -> 0   (still reserved)
git diff gates.manifest.lock              -> three added records, zero modified lines
```

**The whole gate set, run twice in succession:**

```
bash scripts/ci-gates.sh   ->  ALL GATES PASSED (20/20)   exit 0   real 4m12.161s
bash scripts/ci-gates.sh   ->  ALL GATES PASSED (20/20)   exit 0   real 4m12.811s
node -e over gate-results.json -> total=20 nonpass=0
node scripts/gate-coverage.mjs -> REQUIREMENT COVERAGE 29/94 gated, COVERAGE OK
```

The three new gates each logged their skip line and their pass line:

```
G19: GATE-SKIPS total=5  skipped=0    MONEY PARITY PASS heirs=4 centavos=600000000
G20: GATE-SKIPS total=6  skipped=0    SHARE EXPOSURE PASS fields=6 forbidden=0
G21: GATE-SKIPS total=14 skipped=0    SEO SMOKE PASS routes=14 failed=0
```

Documentation and discipline:

```
grep -c "^## 14\." GATES.md                          -> 1
git diff --numstat frontend/journey/JOURNEY.md       -> 99 additions, 0 deletions
grep -c "timeout-minutes: 60" inheritance-ci.yml     -> 1
grep -c "continue-on-error\|if: always()"            -> 0
grep -c "\[x\]" .planning/LAWYER-AGENDA.md           -> 0
node scripts/check-lawyer-agenda.mjs                 -> exit 0
node scripts/check-plan-closed-world.mjs             -> exit 0
node scripts/check-commit-discipline.mjs             -> exit 0
```

## Deviations from Plan

**[Rule 4-adjacent, recorded not decided] `JRNY-05` is marked PARTIAL, not Complete** — The plan's
task 4 instructs marking all five requirements Complete. Four are. `JRNY-05` reads "Every step of the
succession wizard is verified step by step", and five of six steps are — `wizard-will` was reported
BLOCKED by plan 12-03 and is not registered. Marking it Complete would have been the exact failure
mode this project exists to prevent: a green ledger entry over a gap. Its checkbox is unticked and
its status row names the blocker and its measured cause. | Files:
`.planning/REQUIREMENTS.md` | Commit: `a06663c8a`

**[Documentation] `grep -c "BLOCKED, not registered" JOURNEY.md` prints `3`, not the `2` the plan's
task-3 criterion predicts** — The criterion exists to prove the two Phase 11 BLOCKED sections were
not rewritten. They were not: `git diff --numstat` on the file reports **99 additions and 0
deletions**, which is stronger evidence than the count. The third occurrence is the new, genuine
`wizard-will` blocker, labelled with the project's existing vocabulary rather than a synonym invented
to keep a grep at 2.

**Total deviations:** 2, both recorded rather than auto-fixed, both in the direction of reporting
less completion than the plan anticipated.

## Issues Encountered

**Recorded risk, not a claim:** this project's CI has still never executed. The whole set takes
4 m 12 s on the owner's machine, but whether twenty gates fit inside the raised sixty-minute timeout
on a GitHub-hosted runner is unmeasured from here. The comment added above `timeout-minutes` says so
in the workflow itself.

## Next

Phase 12 complete. Ready for Phase 13 (PDF verification).

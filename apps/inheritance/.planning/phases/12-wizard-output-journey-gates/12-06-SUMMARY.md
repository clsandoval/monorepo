---
phase: 12-wizard-output-journey-gates
plan: 06
subsystem: results
tags: [results, family-tree, journey, testids]
requires: [12-01, 12-02]
provides:
  - "results-view and results-family-tree journey steps"
  - "seven per-heir data-testid hooks consumed by gate G19"
affects:
  - frontend/journey/resets.mjs
tech-stack:
  added: []
  patterns:
    - "reach a computed screen by driving the product, never by seeding the engine's answer"
key-files:
  created:
    - frontend/journey/steps/output.json
    - frontend/journey/rubrics/results-view.json
    - frontend/journey/rubrics/results-family-tree.json
  modified:
    - frontend/src/components/results/DistributionSection.tsx
    - frontend/src/components/results/ResultsHeader.tsx
    - frontend/src/components/results/ShareBreakdownSection.tsx
    - frontend/journey/resets.mjs
key-decisions:
  - "settleMs 4000, because the Recharts pie animates and the determinism stylesheet cannot stop a rAF-driven SVG animation."
  - "A reset must restore every column any step can write, not only the one its name mentions."
requirements-completed: []
duration: 34 min
completed: 2026-07-31
---

# Phase 12 Plan 06: Results View and Family-Tree Gates Summary

The results view and the family-tree visualizer each have a passing screenshot-plus-rubric gate,
reached by clicking the product's real Compute button, plus the seven per-heir hooks plan 12-08's
money-parity gate will address.

4 tasks, 3 files created, 4 modified, 1 commit (`9feea2335`).

## Task 1 — both counts measured, neither reasoned about

```
node -e "... computeEngineOutput(02-married-3lc.json) ..."
  -> scenario=I2 rows=4 nonzero=4
     heir_ids=c1,c2,c3,s
```

`HeirTable` renders only `activeShares` (`DistributionSection.tsx:80`, shares with centavos > 0), so
`nonzero=4` is what `heir-row-count` expects. The tree-node count was measured on a real captured
page by asserting a deliberately impossible `element_count` and reading the harness's own reported
`actual`:

```
results-view          heir-row-count  MEASURED actual = 4
results-family-tree   tree-node-count MEASURED actual = 4
```

The tree's 4 is Pedro plus Ana, Ben and Carlos — the spouse is not a tree node. Confirmed by eye in
`actual.png` before either reference was approved.

## Verification

```
npx tsc -b --force                   -> exit 0, no output
npm run test:gate                    -> exit 0
    GATE OK — test baseline matches exactly
    total tests run : 2449 (floor 2416)   passed : 2403
    known failures met : 46   LEDGER SIZE (debt) : 46
node journey/run.mjs --all           -> exit 0  GATE-SKIPS total=30 skipped=0  JOURNEY PASS steps=30 failed=0
node journey/run.mjs --all (again)   -> exit 0  GATE-SKIPS total=30 skipped=0  JOURNEY PASS steps=30 failed=0
node scripts/check-journey-registry.mjs -> exit 0  JOURNEY REGISTRY ok steps=30 references=30
node scripts/check-seed-fixture.mjs     -> exit 0  SEED OK — 2 orgs, 15 ids matched
grep -c '"kind": "click"' journey/steps/output.json -> 2
grep -c "₱" on both rubrics                          -> 0
grep -l '"maxDiffPixels": 0' journey/references/results-*.json -> 2 files
```

`git diff` over the three results components shows only added `data-testid` attributes; no other
token on any line changed. Nothing was appended to `frontend/test-baseline.json`.

## The observed failure — the count assertion bites

```
JOURNEY STEP FAILED results-view: RUBRIC FAILURE
FAIL heir-row-count | expected 5 | actual 4
EXIT=1
```

Restored from the backup; green again.

## Deviations from Plan

**[Rule 1 - Bug] `settleMs` is 4000, not the planned 1500** — Found during: Task 4, when
`results-family-tree` failed its diff at `diffPixels=147 maxDiffPixels=0` immediately after being
approved. | Measured cause: the `diff.png` showed every differing pixel on the Recharts pie-slice
boundaries and nowhere else. `DistributionSection.tsx:173` renders the chart with no
`isAnimationActive={false}`, so Recharts runs its 1500 ms default animation — and `browser.mjs`'s
determinism stylesheet kills CSS animations and transitions but cannot stop a JS/rAF-driven SVG one.
At `settleMs: 1500` the capture landed on the animation boundary. | Fix: `settleMs: 4000` on both
steps, and the references re-approved from the settled state. Waiting longer weakens nothing;
`maxDiffPixels` stayed `0`, which `REFERENCES.md` would not have permitted raising for this reason
anyway. | Verification: both steps green on two consecutive isolated runs and two consecutive `--all`
runs. | Commit: `9feea2335`

**[Rule 2 - Missing critical] `case-alpha-no-output` also restores `status`** — Found during:
Task 4, when the full suite turned `auth-session-persisted` red a second time:

```
DIFF diffPixels=196 maxDiffPixels=0
seeded-case actual = '... RECENT CASES ... Seeded Case Alpha\ncomputed'
```

| Measured cause: the results steps press Compute for real, and `updateCaseOutput`
(`lib/cases.ts:21,81`) sets `status: 'computed'`. `seed.sql` inserts `'draft'`, and the dashboard
card renders the word. | Fix: the reset now sets `status: 'draft'` alongside the other three columns.
| Files: `frontend/journey/resets.mjs` (12-02's file, outside this plan's `files_modified`). |
Verification: `--all` green twice, pasted above. | Commit: `9feea2335`

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical). **Impact:** none on scope; both make
the gate deterministic rather than lucky.

## Issues Encountered

The rule now written into `resets.mjs` is worth carrying forward: **a reset must restore every column
any step can write, not merely the one its name mentions.** All three columns this reset gained
(`decedent_name`, `date_of_death`, `status`) were found by a previously-green gate turning red, never
by reading the schema. Plan 12-07's share steps should be assumed to have the same exposure.

## Next

Ready for 12-07.

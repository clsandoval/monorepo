---
phase: 12-wizard-output-journey-gates
plan: 07
subsystem: share
tags: [share, security, journey, rpc]
requires: [12-02]
provides:
  - "frontend/journey/share-exposure.mjs — the anonymous RPC column-set gate"
  - "three share-link journey states with approved references"
affects:
  - frontend/journey/resets.mjs
tech-stack:
  added: []
  patterns:
    - "assert a security boundary with the least-privileged client that can observe it"
key-files:
  created:
    - frontend/journey/share-exposure.mjs
    - frontend/journey/steps/share.json
    - frontend/journey/rubrics/share-populated.json
    - frontend/journey/rubrics/share-uncomputed.json
    - frontend/journey/rubrics/share-disabled.json
  modified:
    - frontend/journey/resets.mjs
key-decisions:
  - "The expected column set is compared for EQUALITY, not containment: containment would pass a widened response."
  - "The check runs as anon, never service-role, because a service-role key would pass against any function at all."
requirements-completed: []
duration: 26 min
completed: 2026-07-31
---

# Phase 12 Plan 07: Share-Link States and Exposure Gate Summary

The public share view is verified in all three of its terminal states, and the single anonymous data
path in the product is asserted to return exactly the six columns migration 015 declares.

4 tasks, 5 files created, 1 modified, 1 commit (`6ea8fff0e`).

## Verification

```
node journey/share-exposure.mjs      -> exit 0
    GATE-SKIPS total=6 skipped=0
    SHARE EXPOSURE PASS fields=6 forbidden=0
node journey/run.mjs --all           -> exit 0  GATE-SKIPS total=33 skipped=0  JOURNEY PASS steps=33 failed=0
node journey/run.mjs --all (again)   -> exit 0  GATE-SKIPS total=33 skipped=0  JOURNEY PASS steps=33 failed=0
node scripts/check-journey-registry.mjs -> exit 0  JOURNEY REGISTRY ok steps=33 references=33
grep -c "SERVICE_ROLE_KEY" journey/share-exposure.mjs        -> 0
grep -c "0000-4000-8000-000000000005" journey/share-exposure.mjs -> 0  (no fixture uuid written literally)
grep -c '"session": "none"' journey/steps/share.json          -> 3
grep -c "₱" journey/rubrics/share-*.json                       -> 0 in every file
grep -l '"maxDiffPixels": 0' journey/references/share-*.json   -> 3 files
```

The registry check reported exactly three `REFERENCE MISSING` pairs before approval and **no**
`UNKNOWN URL TOKEN`, proving both the Alpha and Beta share tokens resolved against `fixtures.json`.

## The observed failure — the exposure gate catches a widened RPC

A seventh column was added to the **live function only**, never to a committed migration:

```
SHARE FIELD SET — expected exactly [date_of_death, decedent_name, input_json, output_json,
  status, title], observed [date_of_death, decedent_name, input_json, org_id, output_json,
  status, title]
SHARE FIELD LEAKED — forbidden column(s) present in the anonymous response: org_id
GATE-SKIPS total=6 skipped=0
SHARE EXPOSURE FAIL checks=6 failed=2
EXPOSURE_EXIT=1
```

Both markers fired, as the plan required. `npx supabase db reset` (exit 0) restored the committed
migration set; the check returned to `SHARE EXPOSURE PASS fields=6 forbidden=0`, and
`git status --porcelain frontend/supabase/` is clean, so no migration file was edited.

Note the check leaks nothing itself: `org_id` was named because it was *observed*, and the forbidden
list is compared against the response's own key set.

## Deviations from Plan

**[Rule 2 - Missing critical] `case-alpha-computed` also restores `decedent_name`, `date_of_death`
and `status`** — Found during: Task 4, when the full suite failed `share-populated` at
`diffPixels=71`. | Measured cause: the entire diff was the single word `Pedro` in the subtitle.
`get_shared_case` returns `decedent_name`, `share/$token.tsx:104` renders `Estate of {decedent_name}`,
and `journey/steps/output.json` sorts **before** `journey/steps/share.json` in registry order — so
plan 12-06's results steps had already made the wizard's autosave write `Pedro` before the share step
navigated. | Fix: `case-alpha-computed` now sets `decedent_name: null`, `date_of_death: null` and
`status: 'computed'` alongside the engine output, so the row it produces does not depend on what ran
before it. | Files: `frontend/journey/resets.mjs` (12-02's file, outside this plan's
`files_modified`). | Verification: `--all` green twice, pasted above. | Commit: `6ea8fff0e`

**Total deviations:** 1 auto-fixed (1 missing critical). **Impact:** none on scope. This is the
third instance of the same rule discovered in this phase, now stated explicitly in `resets.mjs`: a
reset must restore every column any step can write, not merely the one its name mentions.

## Issues Encountered

None beyond the deviation. The share-populated screen carries the same animated Recharts pie that
forced plan 12-06 to `settleMs: 4000`, but at `settleMs: 1200` it proved stable across four
consecutive runs here — the share page mounts a smaller tree and the chart settles sooner. It was
left at 1200 rather than raised speculatively; if it ever flakes, the fix is the same one 12-06
documented.

## Next

Wave 2 complete. Ready for 12-08.

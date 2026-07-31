---
phase: 12-wizard-output-journey-gates
plan: 02
subsystem: journey-harness
tags: [journey, registry, wasm, resets]
requires: []
provides:
  - "REQUIREMENTS widened to JRNY-02..JRNY-08 in both validators"
  - "frontend/journey/engine.mjs — the single harness-side engine loader"
  - "case-alpha-no-output and case-alpha-computed resets"
affects:
  - frontend/journey/run.mjs
  - scripts/check-journey-registry.mjs
tech-stack:
  added: []
  patterns:
    - "one module owns the WASM load on the harness side, mirroring src/wasm/bridge.ts"
key-files:
  created:
    - frontend/journey/engine.mjs
  modified:
    - frontend/journey/resets.mjs
    - frontend/journey/run.mjs
    - scripts/check-journey-registry.mjs
key-decisions:
  - "Engine results are computed at run time by the compiled artifact, never written as literals into committed SQL."
  - "JRNY-11 is not a registry requirement id: the SEO smoke has no step records."
requirements-completed: [JRNY-05, JRNY-06, JRNY-07, JRNY-08]
duration: 18 min
completed: 2026-07-31
---

# Phase 12 Plan 02: Journey Registry Widening and Engine Loader Summary

Widened the two frozen `REQUIREMENTS` lists to the seven account/org/intake/wizard/output ids, added
`journey/engine.mjs` as the only harness-side loader of the compiled succession engine, and added the
two named Alpha-case resets that plans 12-06, 12-07 and 12-08 drive.

4 tasks, 1 file created, 3 modified, 1 commit (`4d737f1da`).

## Verification

```
node scripts/check-journey-registry.mjs   -> exit 0
    GATE-SKIPS total=210 skipped=0
    JOURNEY REGISTRY ok steps=15 references=15
node journey/run.mjs --list               -> exit 0, the same 15 step ids as before
node journey/run.mjs --all                -> exit 0
    GATE-SKIPS total=15 skipped=0
    JOURNEY PASS steps=15 failed=0
node scripts/check-seed-fixture.mjs       -> exit 0
    SEED OK — 2 orgs, 15 ids matched
    INPUT COPIED FROM engine/examples/cases/02-married-3lc.json
npx tsc -b --force                        -> exit 0, no output
```

Engine loader, against the committed case file:

```
scenario_code=I2 rows=4
```

Both resets, against the live local stack:

```
after computed: scenario=I2
after no-output: null
```

`grep -c "0000-4000-8000" frontend/journey/resets.mjs` -> `0`: no uuid is written literally.

## The negative proof — observed, not assumed

A step record naming `requirement: "JRNY-99"` was appended to a scratch copy of
`frontend/journey/steps/account.json`. Both validators rejected it:

```
STEP FIELD INVALID — account.json:injected-negative-proof has requirement 'JRNY-99',
  not one of JRNY-02, JRNY-03, JRNY-04, JRNY-05, JRNY-06, JRNY-07, JRNY-08
REGISTRY_EXIT=1

JOURNEY CANNOT RUN: STEPS INVALID: account.json:injected-negative-proof has requirement
  'JRNY-99', not one of JRNY-02, JRNY-03, JRNY-04, JRNY-05, JRNY-06, JRNY-07, JRNY-08
LIST_EXIT=2
```

`frontend/journey/steps/` was restored from the backup and
`git status --porcelain frontend/journey/steps/` came back empty, so the restore was byte-identical.
Both commands returned to `REGISTRY_EXIT=0` / `LIST_EXIT=0`.

`frontend/supabase/seed.sql` and `frontend/supabase/fixtures.json` show no diff.

## Deviations from Plan

None — plan executed exactly as written.

One numeric note, not a deviation: the plan's task-3 acceptance criterion asks for "fewer than 15
changed lines across the two files combined"; `git diff --numstat` reports `5/2` and `9/3`, i.e. 14
insertions and 5 deletions. The 14 insertions are exactly the shape the plan's own `<interfaces>`
section prescribes (a 4-line `REQUIREMENTS` array in each file plus a 5-line `RESET_NAMES`), so the
criterion's intent — nothing else moved — holds, and the diff cannot be made smaller without
departing from the specified arrays.

## Issues Encountered

None.

## Next

Ready for 12-05.

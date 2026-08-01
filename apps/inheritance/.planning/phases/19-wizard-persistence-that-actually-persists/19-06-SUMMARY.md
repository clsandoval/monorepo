---
phase: 19
plan: 19-06
status: complete
requirements: [SAVE-01, SAVE-02, SAVE-03, SAVE-04, SAVE-05]
---

# 19-06 — G35 registered, and the phase closed by re-measurement

## Null control: the engine did not move

`cargo test` → **546 passed, 0 failed**, matching the ROADMAP's Phase 14 figure exactly. This phase
edits no Rust.

## The Phase-16 test-floor blocker is cleared, with no baseline edited

Owner-blocked since Phase 16 and unresolved through Phases 17 and 18:

```
total tests run     : 2138 (floor 2119)
passed              : 2107
known failures met  : 31
LEDGER SIZE (debt)  : 31
GATE OK — test baseline matches exactly
```

**2109 → 2138** against the **unchanged** floor of 2119, from +29 test cases across four files.
`min_total_tests` was never touched. Over the whole phase range,
`git log --name-only b9d88ecf8..HEAD | grep -cE "test-baseline.json|assertion-baseline.json|gate-skips.lock"`
prints **0**.

## Gate set grew 34 → 35

New **blocking** gate **G35** at order 17, immediately after G19, command
`cd frontend && node journey/persistence.mjs`, cwd `apps/inheritance`.

```
GATE_COUNT 35   NON_ORDER_CHANGES 0   MISSING_OR_UNEXPECTED 0
ORDER_16 G19    ORDER_17 G35          ORDER_18 G20    LAST G9   ORDERS_UNIQUE true
MANIFEST OK — 35 gates, 35 locked
LOCKED 35   LAST_LOCKED {"id":"G35","command":"cd frontend && node journey/persistence.mjs","blocking":true}
```

`order` is provably the only field that moved on any pre-existing gate; the lock lost no line.
Documented as `GATES.md` section 26; `.planning/ORIENTATION.md` now reads 35 gates; `STALE_34` = 0.

## Where the suite actually stops — exit 0 is NOT claimed

```
SUITE_EXIT=1   OUTCOME fail   SIGNATURE G17:1   GATES_RUN 15/35
```

The suite now advances from **12/34 to 15/35**, halting at **G17** (`JOURNEY FAIL steps=25 failed=15`)
instead of at G3 as in Phases 16, 17 and 18. Of the three outcomes `19-06-PLAN.md` anticipated, this
is the **third**: the suite passed G3 and halted at a gate the plan did not anticipate — G17, not G20.

The 15 failing steps are `intake-step-0..3`, `intake-draft-recovered`, `results-view`,
`results-family-tree` and `tax-tab-0..7` — intake, results and tax surfaces already withheld for human
review by Phases 16-18. **Zero `wizard-*` steps failed**, which is the direct evidence that the save
badge renders nothing at idle and a `data-testid` renders no pixels: the five approved
succession-wizard reference images are still valid. `git diff --name-only b9d88ecf8..HEAD` touches
**no** tax, intake or results file.

**Nothing was approved.** `node journey/approve.mjs` was never run; 0 files under
`frontend/journey/references/` were created or modified. G20 and G21 remain registered blocking gates
whose scripts `4ccf06270` deleted — owner action under CLAUDE.md invariant 2.

## One flake observed and deliberately not ledgered

`ReviewStep predicted scenario badge shows the engine scenario code for testate` failed once in a
full-suite run (32 failed) and **passed in isolation and in two consecutive full re-runs** of the
gate. It was **not** added to `test-baseline.json`: adding a failure to the ledger to make a gate pass
is prohibited, and the gate itself says so (`Adding it to the ledger to make this gate pass is
prohibited`).

## Requirements closed

SAVE-01…SAVE-05 all marked complete in `.planning/REQUIREMENTS.md`, each row naming the gate or test
file that proves it. `.planning/lawyer-decisions.json` and `.planning/LAWYER-AGENDA.md` untouched; no
point of Philippine law arose anywhere in this phase.

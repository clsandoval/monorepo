BLOCKED
Requirement: CUT-01, CUT-04
Task: 16-04 Task 3: run the frontend gate after the intake cut
What was attempted: Ran `cd frontend && npm run test:gate` after retiring the 46 tests whose subject code plans 16-02 and 16-03 deleted. The gate compares the measured test total against `min_total_tests` in `frontend/test-baseline.json` and fails when it drops below, which it now does. Clearing it requires lowering that floor, which is owner action and is prohibited to an agent by this phase's constraints and by `CLAUDE.md`.
Real command output:
```
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[31/31]⎯


 Test Files  8 failed | 84 passed (92)
      Tests  31 failed | 2042 passed (2073)
   Start at  04:41:39
   Duration  22.05s (transform 5.62s, setup 7.81s, import 33.90s, tests 96.86s, environment 76.73s)

JSON report written to /tmp/test-baseline-xBcUkc/vitest-report.json

=========================================================
TEST BASELINE GATE FAILED — 1 violation(s)
=========================================================

TEST COUNT DROPPED: ran 2073 tests, floor is 2119
  Tests were removed or failed to collect. Restore them.

GATE-SKIPS total=2073 skipped=0
```

Exit code: `GATE-EXIT=1`

## The owner decision

**Measured total:** 2073
**Floor (`min_total_tests`):** 2119
**Shortfall:** 46 tests

**The 46 removed, and why each went.** Every one was removed because the production symbol it
called no longer exists, never because it was failing. The three counts reconcile exactly with the
shortfall: 11 + 30 + 5 = 46.

| File | Removed | Kept | Reason |
|---|---|---|---|
| `src/lib/__tests__/conflict-check.test.ts` | 11 (whole file) | 0 | Its only subject, `src/lib/conflict-check.ts`, was deleted in full by plan `16-03`. Both `describe`s — `getSimilarityColor` and `runConflictCheck` — test that module and nothing else. |
| `src/lib/__tests__/intake.test.ts` | 30 | 43 | `mapIntakeToClientData` describe (11) — the function reads only `state.clientDetails` and was removed; `getSettlementMilestones` describe (8) — the function was removed; `createInitialIntakeState` conflictCheck/clientDetails/settlementTrack assertions (3) — those state members were removed; `mapIntakeToIntakeData` settlement_track and relationship_to_decedent (2) — those `IntakeData` fields were removed; `isStepComplete` cases for the three cut step indices (6). |
| `src/components/intake/__tests__/intake-form.test.tsx` | 5 | 11 | `ConflictCheckStep` describe (2), `ClientDetailsStep` describe (1), `SettlementTrackStep` describe (1) — all three components were deleted by plan `16-02`; `CLIENT_RELATIONSHIPS has 6 options` (1) — that constant was removed by plan `16-03`. |

**No surviving test was weakened.** `grep -rn "\.skip\|\.todo\|xit(\|xdescribe("` over both edited
files returns nothing. Two classes of edit were made to surviving tests, both of which keep the
assertion's strength identical and merely repoint it at renumbered production code, as plan `16-04`
Task 2 expressly permits:

- `isStepComplete` index arguments renumbered 2→0, 3→1, 4→2, 6→3 to follow the new `INTAKE_STEPS`
  order. Each assertion still asserts the same truth about the same step.
- `INTAKE_STEP_COUNT` expected value updated 7→4 and the step-order assertion updated to the four
  surviving names. The test still pins the constant exactly; it pins it to the new correct value.

**The ledger did not move.** `LEDGER SIZE (debt)` is still 31 and `GATE-SKIPS ... skipped=0`. No
`STALE BASELINE` violation appeared, so no `known_failures` entry started passing and no entry needs
clearing. The only violation is the count.

**The precedent, and why it is not available here.** `frontend/test-baseline.json` carries a
`floor_lowered` record from commit `4ccf06270`, which lowered this same floor from **2416 to 2119**
with the written reason:

> "Deletion milestone, owner-authorised. Tests were removed because their subjects were removed
> (public funnel, collaboration layer, dead lib modules), not because a regression was hidden. The
> floor is reset to the newly MEASURED count so it continues to catch accidental test loss from
> here."

The situation now is the same shape, one milestone later, and the same action — lowering the floor
from 2119 to the newly measured 2073 with an appended `floor_lowered` reason — would clear the gate.

**That action is available to the owner and prohibited to an agent.** This phase's constraints
forbid lowering a baseline floor and forbid editing `test-baseline.json` to turn a red run green,
with no authorisation path an agent can invoke. **The phase took no action on it.**
`git diff` on `frontend/test-baseline.json` is empty.

This is the floor working as designed, not a defect. A floor exists precisely so tests cannot
quietly evaporate, and it cannot distinguish "the subject was deleted under owner authorisation"
from "someone dropped a suite". Only a human can, which is why only a human may clear it.

## What is not claimed

This phase does **not** assert that the frontend suite is green. It is red, at
`TEST COUNT DROPPED: ran 2073 tests, floor is 2119`, and that red result is a **measurement**, not a
regression:

- No test that exercises surviving behaviour was removed.
- No assertion was loosened, no expected value widened, no test skipped, marked pending, or marked
  todo.
- The 31 known failures are the same 31 that were ledgered before this phase began, classified in
  `16-BASELINE.md` as product debt with zero environment failures among them.
- `cd frontend && npx tsc -b --force` exits 0, so CUT-01 is complete at the source level even though
  CUT-04 is blocked.

`frontend/test-baseline.json`, `gate-skips.lock`, `assertion-baseline.json`, `gates.manifest.json`
and `gates.manifest.lock` are byte-identical to their state before this plan.

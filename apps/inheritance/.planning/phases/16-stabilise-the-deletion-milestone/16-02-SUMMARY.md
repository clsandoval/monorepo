---
phase: 16
plan: 16-02
status: complete
requirements: [CUT-01]
---

# 16-02 — Remove three steps from the guided intake

Committed `1a6743abe`.

`INTAKE_STEPS` goes 7 → 4: Decedent Info, Family Composition, Asset Summary, Review & Save.
`INTAKE_STEP_COUNT` follows the tuple. `GuidedIntakeForm.renderStep()` carries four contiguous
cases 0–3. `ConflictCheckStep.tsx`, `ClientDetailsStep.tsx` and `SettlementTrackStep.tsx` deleted.

The method is the point: indices were removed **highest first** (5, then 1, then 0) with
`npx tsc -b --force` exiting 0 between every removal, so the file was never left in the unverified
state that produced the earlier reverted regex attempt.

## Verification

`npx tsc -b --force` exit 0 after each of the three removals and after the component deletions.

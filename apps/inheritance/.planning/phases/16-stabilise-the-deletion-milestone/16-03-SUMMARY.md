---
phase: 16
plan: 16-03
status: complete
requirements: [CUT-01]
---

# 16-03 — Delete conflict-check and the orphaned intake types

Committed `f8f7c9cee`.

`frontend/src/lib/conflict-check.ts` deleted in full. Seven orphaned identifiers stripped from
`types/intake.ts`: `SettlementTrack`, `ClientRelationship`, `CLIENT_RELATIONSHIPS`,
`CLIENT_RELATIONSHIP_LABELS`, `ConflictCheckStepState`, `ClientDetailsStepState`,
`SettlementTrackStepState`. `IntakeFormState` keeps four members. Draft storage key moved to
`inheritance-intake-draft-v2`.

Two recorded departures, both narrowing: `mapIntakeToClientData` was removed in full rather than
partially repaired (it read `clientDetails` and nothing else, and had no production caller); and
`DocumentSeedingContext.settlement_track` was removed while the now-dead interface was left standing
rather than widening the plan's scope. `Person.relationship_to_decedent` is a different, live
succession-engine field and was correctly not touched.

## Verification

`npx tsc -b --force` exit 0.

## Left for later plans, and honestly

The journey fixtures still seeded the **old** `inheritance-intake-draft` key at this point — carried
into 16-05 and fixed there.

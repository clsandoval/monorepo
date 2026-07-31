---
phase: 05-engine-observability-restored
plan: 04
subsystem: engine
tags: [observability, manual-review-flags, spec-13.1]
requires: ["05-01"]
provides:
  - "engine/src/flags.rs — all ten spec §13.1 flag codes, their detectors, and SPEC_FLAG_CODES"
  - "types.rs ManualReviewFacts on EngineConfig — the five facts the input could not express"
  - "TypeScript mirror: ManualReviewFacts interface + ManualReviewFactsSchema"
affects:
  - engine/src/pipeline.rs
  - engine/tests/integration.rs
  - frontend/src/types/index.ts
  - frontend/src/schemas/index.ts
tech-stack:
  added: []
  patterns:
    - "One serde-defaulted ManualReviewFacts struct on EngineConfig rather than fields scattered across five input types (2 construction sites vs 89 exhaustive struct literals)"
key-files:
  created:
    - engine/src/flags.rs
  modified:
    - engine/src/lib.rs
    - engine/src/types.rs
    - engine/src/pipeline.rs
    - engine/tests/integration.rs
    - frontend/src/types/index.ts
    - frontend/src/schemas/index.ts
key-decisions:
  - "The ten spec codes and the six internal category strings are disjoint sets; both survive and both reach EngineOutput.warnings"
  - "Every detector is a field comparison; five triggers read facts the case-enterer asserts via manual_review_facts, none is inferred"
  - "detect_spec_flags is called once at the head of each pipeline function, so a restarted run cannot duplicate a spec flag"
requirements-completed: [OBS-02]
duration: ~30 min
completed: 2026-07-31
---

# Phase 5 Plan 04: All Ten Spec-Defined Manual Review Flags Summary

`specs/inheritance-engine-spec.md:2303-2321` names ten situations that "require human judgment", and
`grep -rn` over `engine/src` found **zero** of them anywhere in the crate. All ten now exist in one
auditable module with a detector and a test each, and reach `EngineOutput.warnings` end to end.

A flag decides nothing — it is the engine saying a human must decide. The corpus proves it: emitting
them changed no peso amount.

- **Tasks:** 3 of 3
- **Files created:** 1 · **Files modified:** 6
- **Commit:** `206818809` — `feat(05): construct and emit all ten spec-defined manual review flags`

## The ten codes and the exact trigger implemented for each

Declared in `engine/src/flags.rs` as `pub const SPEC_FLAG_<NAME>: &str = "<NAME>";` plus
`pub const SPEC_FLAG_CODES: [&str; 10]` in the spec table's order, which is also the emission order.

| # | Constant | Emitted `category` | Trigger implemented (field comparison only) | `related_heir_id` |
|---|---|---|---|---|
| 1 | `SPEC_FLAG_GRANDPARENT_OF_ILLEGITIMATE` | `GRANDPARENT_OF_ILLEGITIMATE` | `decedent.is_illegitimate` **and** some living `p` with `relationship_to_decedent == LegitimateAscendant` and `p.degree >= 2` | that person's id |
| 2 | `SPEC_FLAG_CROSS_CLASS_ACCRETION` | `CROSS_CLASS_ACCRETION` | some `p` is `IllegitimateChild` with `has_renounced` **and** some living `q` in `{LegitimateChild, LegitimatedChild, AdoptedChild}` | the renouncer's id |
| 3 | `SPEC_FLAG_RESERVA_TRONCAL` | `RESERVA_TRONCAL` | `config.manual_review_facts.reserva_troncal_property_present` | `None` |
| 4 | `SPEC_FLAG_COLLATION_DISPUTE` | `COLLATION_DISPUTE` | `manual_review_facts.disputed_donation_ids` non-empty | `None` |
| 5 | `SPEC_FLAG_RA_11642_RETROACTIVITY` | `RA_11642_RETROACTIVITY` | some `p.adoption` with `regime == AdoptionRegime::Ra8552` and `decree_date < "2022-01-01"` (lexicographic; `Date` is an ISO-8601 `String`) | that person's id |
| 6 | `SPEC_FLAG_ARTICULO_MORTIS` | `ARTICULO_MORTIS` | `decedent.marriage_solemnized_in_articulo_mortis` | `None` |
| 7 | `SPEC_FLAG_USUFRUCT_ANNUITY_OPTION` | `USUFRUCT_ANNUITY_OPTION` | `manual_review_facts.usufruct_or_annuity_disposition_ids` non-empty | `None` |
| 8 | `SPEC_FLAG_DUAL_LINE_ASCENDANT` | `DUAL_LINE_ASCENDANT` | `manual_review_facts.dual_line_ascendant_ids` non-empty | first id in the list |
| 9 | `SPEC_FLAG_POSTHUMOUS_DISINHERITANCE` | `POSTHUMOUS_DISINHERITANCE` | `manual_review_facts.unborn_disinherited_ids` non-empty | first id in the list |
| 10 | `SPEC_FLAG_CONTRADICTORY_DISPOSITIONS` | `CONTRADICTORY_DISPOSITIONS` | a will exists **and** a `DispositionId` repeats across institutions/legacies/devises, **or** an `institutions[i].heir.person_id` repeats | `None` |

ROADMAP Phase 8 fires `RESERVA_TRONCAL` (reads `reserva_troncal_property_present`) and Phase 14 fires
`RA_11642_RETROACTIVITY` (reads `Adoption.regime` + `Adoption.decree_date`).

## `ManualReviewFacts` — final member list, both sides

Rust, `engine/src/types.rs`, `#[derive(Debug, Clone, Default, Serialize, Deserialize)]`, every member
`#[serde(default)]`:

```rust
pub struct ManualReviewFacts {
    pub disputed_donation_ids: Vec<DonationId>,
    pub usufruct_or_annuity_disposition_ids: Vec<DispositionId>,
    pub dual_line_ascendant_ids: Vec<PersonId>,
    pub unborn_disinherited_ids: Vec<PersonId>,
    pub reserva_troncal_property_present: bool,
}
```

Hung off `EngineConfig` as `#[serde(default)] pub manual_review_facts: ManualReviewFacts,` placed
**after** `max_pipeline_restarts` — never between the `LAWYER-DECISION: LAWYER-08` marker and
`pub retroactive_ra_11642: bool`.

TypeScript, `frontend/src/types/index.ts` — every member optional:

```ts
export interface ManualReviewFacts {
  disputed_donation_ids?: string[];
  usufruct_or_annuity_disposition_ids?: string[];
  dual_line_ascendant_ids?: string[];
  unborn_disinherited_ids?: string[];
  reserva_troncal_property_present?: boolean;
}
// EngineConfig gains:  manual_review_facts?: ManualReviewFacts;
```

`frontend/src/schemas/index.ts` gains `ManualReviewFactsSchema` (all `.optional()`) and
`manual_review_facts: ManualReviewFactsSchema.optional(),` on `EngineConfigSchema`. No wizard field,
form control or UI was added — ROADMAP Phase 12 owns that surface.

## Measured results

`cd engine && cargo test`:

```
test result: ok. 435 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s   (unittests src/lib.rs)
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s      (unittests src/main.rs)
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.07s      (tests/fuzz_invariants.rs)
test result: ok. 35 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s     (tests/integration.rs)
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s      (doc-tests)
CARGO_EXIT=0
```

471 passing. `cargo test --lib flags` → **15 passed; 0 failed** (11 required, 4 extra — see deviations).

Named integration tests:

```
test test_spec_flag_reaches_output_end_to_end ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 34 filtered out

test test_pipeline_warnings_still_carry_internal_categories ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 34 filtered out
```

Corpus script over all 140 committed inputs, full output:

```
cases 140 sum_violations 0 cases_with_warnings 42
categories seen: {'preterition': 36, 'RA_11642_RETROACTIVITY': 1, 'inofficiousness': 4, 'ARTICULO_MORTIS': 1}
```

- **`sum_violations 0`** — no distribution changed.
- All 140 inputs still parse **without edit**, confirming `#[serde(default)]` did its job.
- Every category in the map is either a spec code (`RA_11642_RETROACTIVITY`, `ARTICULO_MORTIS`) or an
  internal string (`preterition`, `inofficiousness`) — the two sets coexist.
- `cases_with_warnings` went from a measured baseline of **0 of 140** to **42 of 140**.

Frontend:

```
npx tsc -b --force   → zero output, TSC_EXIT=0

GATE OK — test baseline matches exactly
  total tests run     : 2430 (floor 2416)
  passed              : 2384
  known failures met  : 46
  LEDGER SIZE (debt)  : 46
GATE_EXIT=0
```

Other checks, run and observed:

- `grep -c "SPEC_FLAG_" engine/src/flags.rs` → **51**
- `grep -c "detect_spec_flags(input)" engine/src/pipeline.rs` → **2**
- `grep -n "LAWYER-DECISION: LAWYER-08" engine/src/types.rs` → one match at line 371, directly above `pub retroactive_ra_11642: bool,`
- `grep -c "pub retroactive_ra_11642: bool" engine/src/types.rs` → **1**
- `node scripts/check-lawyer-agenda.mjs` → **`AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer`**, exit 0
- `node scripts/check-plan-closed-world.mjs` → exit 0
- `git status --porcelain engine/examples/ frontend/test-baseline.json` → empty
- `git log -1 --name-only --format=""` → exactly seven paths

## Deviations from Plan

**[Rule 2 - missing critical] Four tests beyond the eleven the plan enumerates** — Found during:
Task 1. Added because each covers a stated behavior with no listed test:
- `test_ra_11642_not_flagged_for_post_2022_decree` — the plan states a `< "2022-01-01"` boundary but
  no listed case proves the detector is *not* on for a post-2022 decree.
- `test_detects_contradictory_dispositions_by_repeated_institution` — the plan's trigger has two arms
  (repeated disposition id **or** repeated instituted person); one listed test covers only the first.
- `test_spec_flag_codes_array_holds_all_ten` — asserts the array's length is 10 and holds no duplicate.
- `test_flags_are_emitted_in_spec_table_order` — the plan requires deterministic emission order; nothing
  listed asserts it.

Result: 15 passing rather than 11. Nothing was removed or loosened. Commit: `206818809`.

**Total deviations:** 1 auto-fixed (missing-critical). **Impact:** none on stated behavior; strengthens
what is asserted. No point of Philippine law arose — every detector is a field comparison transcribed
from the spec table, and the five new input members are facts the case-enterer asserts. **Nothing was
added to the lawyer review agenda.**

## Issues Encountered

None.

## Next

Wave 2 complete. Ready for wave 3: `05-05` (runtime conservation and duplicate-heir rejection), which
shares `engine/src/lib.rs` and `engine/src/pipeline.rs` with this plan.

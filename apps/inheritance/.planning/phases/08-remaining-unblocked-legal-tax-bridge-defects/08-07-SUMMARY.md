---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 07
status: complete
requirements: [LAW-11]
commit: 780b36a9f97694d9df2b9e4a793fce10e2a42f8c
---

# 08-07: Reserva troncal is enterable, flagged, and expressly declared uncomputed

## What landed

Phase 5 already built the `RESERVA_TRONCAL` detector and the
`config.manual_review_facts.reserva_troncal_property_present` input field. What was missing was
**reachability** — no `.tsx` referenced `manual_review_facts` at all — and an express scope
declaration.

`EstateStep.tsx` gained one `fieldset` (`data-testid="reserva-troncal-field"`, legend
"Reserva Troncal (Art. 891)") holding a `Controller`-bound `Checkbox` with `defaultValue={false}`,
labelled "Estate includes property acquired by gratuitous title from an ascendant, brother or sister",
plus helper text stating the engine does **not** compute the reservation and that ticking the box
raises a manual-review flag. `WizardContainer.tsx` was not touched and shows no diff.

**No file under `engine/src/` was edited.**

## Proved end to end

`test_law11_reserva_troncal_fact_raises_a_flag` runs the same input twice — one legitimate parent,
₱10,000,000 estate, no will:

- fact `true`  → `mo` = 1000000000 **and** a `RESERVA_TRONCAL` warning
- fact `false` → `mo` = 1000000000 **and** no such warning

The paired false case is what makes it meaningful: the flag is driven by the asserted fact and raising
it changes no peso figure. `mo` = 1000000000 matched the plan's prediction exactly, so no BLOCKED
condition arose.

The spec's section 13.1 `RESERVA_TRONCAL` row now describes an asserted fact rather than an
engine-detected condition, and a new subsection **"Art. 891 reserva troncal is flagged, never
computed"** states that `EngineInput` cannot express the facts Art. 891 turns on, that no share is
encumbered and no reservista or reservatario is identified, that the `RESERVATION` narrative type is
unpopulated, and that *Mendoza v. Delos Santos* (2013) keeps the doctrine live — so the absence is a
scope limitation, not obsolescence.

## Verified, not claimed

```
cargo test                                          543 passed, 0 failed  (from 542)
cargo test --test integration                        44 passed; test_law11_... named in output
npx vitest run EstateStep.test.tsx                   18 passed, 0 failed, 0 skipped (16 pre-existing, unedited)
npx tsc -b --force                                    zero output, exit 0
node scripts/check-observability.mjs                  OBSERVABILITY OK — 10 flag codes, exit 0
node scripts/check-commit-discipline.mjs              exit 0
```

Commit lists exactly 4 files. `ALL GATES PASSED (13/13)` was not reached and is not claimed.

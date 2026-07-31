---
phase: 04-lawyer-review-agenda-recorded
plan: 02
status: complete
requirements: [LAWYER-05, LAWYER-06, LAWYER-07, LAWYER-08]
commit: 59abb4cfededc0ac0ab8477ed85731092c07dc40
---

# Summary — 04-02 Entries LAWYER-05…08 and the status table

## What was built

`.planning/LAWYER-AGENDA.md` extended from 266 to 503 lines. All eight interpretive choices are now
recorded, followed by a `## Status at a glance` table.

## The eight entries, exact metadata (plan 04-03 mirrors these into `lawyer-decisions.json`)

| Decision | Question title | Status | Engine implements | Blocks | Governing code |
|---|---|---|---|---|---|
| LAWYER-01 | Q1: One legitimate child plus surviving spouse, intestate | awaiting-answer | A | nothing scheduled | `engine/src/step7_distribute.rs` — `I2: n LC + Spouse (Art. 996)` |
| LAWYER-02 | Q2: One legitimate child plus spouse plus illegitimate children, testate | awaiting-answer | A | nothing scheduled | `engine/src/step5_legitimes.rs` — `"Art. 892 ¶1".into()` |
| LAWYER-03 | Q3: Nephews and nieces alone surviving, per capita under Art. 975 ¶2 | awaiting-answer | neither | nothing scheduled | `engine/src/step7_distribute.rs` — `Branch 3: Nephews/nieces only — per capita (Art. 975)` |
| LAWYER-04 | Q4: How far *Aquino v. Aquino* reaches into the collateral line | awaiting-answer | neither | LAW-07 | `engine/src/step1_classify.rs` — `pub fn check_eligibility` |
| LAWYER-05 | Q5: Art. 907 reduction, self-executing or a claim the heir must assert | awaiting-answer | A | nothing scheduled | `engine/src/step6_validation.rs` — `pub fn reduce_inofficious` |
| LAWYER-06 | Q6: An heir's entitlement exceeding the estate because of a donation *inter vivos* | awaiting-answer | A | LAW-06 | `engine/src/step4_estate_base.rs` — `pub fn step4_compute_estate_base`; `engine/src/step8_collation.rs` — `pub fn step8_collation_adjustment` |
| LAWYER-07 | Q7: Family home deduction on a conjugal home, half of FMV or full FMV | awaiting-answer | A | nothing scheduled | `frontend/src/lib/estate-tax-engine/special-deductions.ts` — `familyHome.ownershipType === 'conjugal'`; `specs/estate-tax-engine-spec.md` — `min(fmv * 0.5, cap)` |
| LAWYER-08 | Q8: RA 11642 Sec. 41 retroactivity to adoption decrees issued before 2022 | awaiting-answer | neither | LAW-12 | `engine/src/types.rs` — `pub retroactive_ra_11642: bool` |

Two entries carry an extra sub-question line beneath `Notes:`:
- LAWYER-04 — `Flag every barrier-decisive case for manual review? yes / no:`
- LAWYER-08 — `Refuse to compute Sec. 41 fact patterns instead of answering? yes / no:`

## Structural uniformity (measured — all fourteen equal 8)

```
^## LAWYER-                        = 8
^\*\*Status:\*\*                   = 8
^\*\*Engine implements:\*\*        = 8
^\*\*Blocks:\*\*                   = 8
^\*\*Governing code:\*\*           = 8
### The question                   = 8
### Reading A                      = 8
### Reading B                      = 8
### What the engine does today     = 8
### What I need from you           = 8
### Answer                         = 8
Confirm Reading A                  = 8
Change to Reading B                = 8
Answered by:                       = 8
Neither — see notes                = 8   (fifteenth marker, also 8)
awaiting-answer                    = 17  (8 entries + 8 table rows + 1 vocabulary mention)
grep -c "\[x\]"                    = 0
wc -l                              = 503
```

Governing-code anchors were checked against the tree before being written, not copied on faith:
`reduce_inofficious` at `engine/src/step6_validation.rs:562`, `step4_compute_estate_base` at
`engine/src/step4_estate_base.rs:75`, `step8_collation_adjustment` at
`engine/src/step8_collation.rs:106`, `retroactive_ra_11642` at `engine/src/types.rs:346`,
`ownershipType === 'conjugal'` at `frontend/src/lib/estate-tax-engine/special-deductions.ts:71`,
and the Q7 hedge at `specs/estate-tax-engine-spec.md:1008`.

## Other gates

```
git status --porcelain specs/   → empty
git status --porcelain engine/  → empty
node scripts/check-plan-closed-world.mjs → exit 0
bash scripts/ci-gates.sh        → ALL GATES PASSED (9/9), exit 0
git log -1 --name-only          → apps/inheritance/.planning/LAWYER-AGENDA.md (only)
```

## Deviations

1. **`safe-commit.sh` path form** — same as 04-01: the script requires repo-root-relative paths, so
   `apps/inheritance/.planning/LAWYER-AGENDA.md` was used rather than the plan's literal
   `.planning/LAWYER-AGENDA.md`.

2. **Three duplicate structural literals removed from the front matter sections.** The plan requires
   fourteen markers to equal exactly `8`, but plan 04-01's `## How to answer` and `## Entry format`
   sections each repeated some of those literals in prose, producing counts of 9 and 10. The
   duplicates were reworded, not deleted: the Entry-format list now names the six level-three
   headings without repeating the `###` prefix, and How-to-answer says "an **Answer** block" and
   "Fill in who answered, and the date". No entry was touched, and the described structure is
   unchanged.

## No law was decided

All eight statuses read `awaiting-answer`; `grep -c "\[x\]"` returns 0. `specs/` and `engine/` are
byte-unchanged, so the Q7 spec hedge at `specs/estate-tax-engine-spec.md:1008` still stands — plan
04-03 owns replacing it with a pointer.

## Self-Check: PASSED

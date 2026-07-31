---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 01
status: complete
requirements: [LAW-05]
commit: 3583786faafd66c19d49178631bdf90e6d6a05f2
---

# 08-01: A collated donation defeats preterition; the exempted case is flagged, not decided

## What landed

`engine/src/step6_validation.rs` gained two public functions beside the untouched
`heir_addressed_in_will`:

- `heir_received_advance_on_legitime(donations, heir_id)` — true for a positive-value donation to the
  heir that none of Arts. 1062, 1066, 1067, 1068 or 1070 removes from collation
- `heir_received_only_uncollated_donation(donations, heir_id)` — the exact shape LAWYER-09 governs

`check_preterition` now takes `donations` as a third parameter; `PreteritionResult` gained
`exempt_donation_heirs`. Neither `Step6Input` nor `Step6Output` changed shape, so
`engine/tests/integration.rs`'s inline pipeline copy compiled untouched — the risk the plan flagged as
largest did not materialise.

The preterition early return now emits one `preterition_exempt_donation` `ManualFlag` per exempted
heir, naming the heir, the five articles, and LAWYER-09.

## The recorded legal question

`LAWYER-09` ships `awaiting-answer` in both `.planning/LAWYER-AGENDA.md` (eight-heading house format,
plus a status-table row) and `.planning/lawyer-decisions.json` (fourteen keys, `answered_by`,
`answered_on`, `answer` all `null`). `REQUIRED_IDS` in `scripts/check-lawyer-agenda.mjs` now lists nine
ids, so the entry is mandatory rather than tolerated. Nothing was decided.

## Verified, not claimed

```
cargo test                          531 passed, 0 failed  (baseline 527, +4 new unit tests)
node scripts/check-lawyer-agenda.mjs  AGENDA OK — 9 decisions, 11 anchors, 9 awaiting-answer   exit 0
node scripts/check-observability.mjs  OBSERVABILITY OK — 10 flag codes                          exit 0
node scripts/check-commit-discipline.mjs  0 mixed                                               exit 0
grep -c "\[x\]" .planning/LAWYER-AGENDA.md   0
grep -c "LAWYER-DECISION: LAWYER-05" engine/src/step6_validation.rs   1  (still adjacent to reduce_inofficious)
```

`git diff` shows `heir_addressed_in_will`'s body unchanged and no field added to or removed from
`Step6Input`/`Step6Output`. Commit lists exactly 4 files, all under `apps/inheritance/`.

`ALL GATES PASSED (13/13)` was not reached and is not claimed.

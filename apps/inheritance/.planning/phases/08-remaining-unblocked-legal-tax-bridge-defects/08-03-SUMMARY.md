---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 03
status: complete
requirements: [LAW-05]
commit: 85319b6b9224209228d2f7dbe97385c9fd9c6fd4
---

# 08-03: Preterition preserves non-inofficious legacies and flags what it cannot value

## What landed

**Step 6.** The preterition early return no longer hand-builds a zeroed `InofficiousnessResult`. It
calls `check_inofficiousness(&input.will, &input.donations, &input.free_portion, &input.estate_base)`
and, when that detects an excess, pushes an `inofficiousness` `ManualFlag` using the same category
string the non-preterition path already uses. Art. 854 keeps legacies valid "insofar as they are not
inofficious" — a question the check answers, and which the zeroed literal made unreachable.

**Step 7.** `SuccessionType::Intestate` and `SuccessionType::IntestateByPreterition` were split into
separate match arms. The plain-intestate arm is byte-equivalent to before. The preterition arm pays
surviving legacies first — each capped at a running `remaining_fp` seeded from `fp_disposable`, with
any Art. 911 reduction applied via the same `target_id` lookup the testate arm uses — then divides
`estate_base − payable_total` intestate, then folds legatee payments in through
`add_fp_to_distributions` so a legatee who is also an heir accumulates rather than duplicating.

**Unvaluable dispositions.** A devise (both `DeviseSpec` variants value to zero) or a
`LegacySpec::SpecificAsset` legacy now produces a `preterition_unvalued_disposition` flag stating the
disposition is NOT paid and a human must value it, rather than being silently paid ₱0.

## Verified, not claimed

```
cargo test                                538 passed, 0 failed   (from 533)
cargo test --test fuzz_invariants          17 passed, 0 failed   (INV01, INV07, INV13 green)
cargo test --test defect_ledger             3 passed, 0 failed   no STALE DEFECT DECLARATION
cargo test --test observability             3 passed, 0 failed
node scripts/check-observability.mjs        exit 0
node scripts/check-commit-discipline.mjs    exit 0
```

Five new unit tests, all passing first run, including the exact centavo values the plan named:
`carlos=300000000 / ana=1350000000 / ben=1350000000` and
`carlos=1500000000 / ana=750000000 / ben=750000000`. The third asserts a no-legacy preterition case is
row-for-row identical to the plain intestate arm, so the 29 committed preterition cases with no legacy
cannot move.

`reduce_inofficious` is unchanged and both `LAWYER-DECISION` markers survive verbatim. Commit lists
exactly 2 files. `ALL GATES PASSED (13/13)` was not reached and is not claimed.

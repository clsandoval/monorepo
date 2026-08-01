---
phase: 21
plan: 21-01
status: complete
requirements: [RET-01]
---

# 21-01 — The standard deduction the engine applied is readable through the output type

Committed `9539020ae`, 4 files.

## What it found

The vision audit's Item-35A finding is real, and its root cause is a **type**, not a display bug.
`computeSpecialDeductions` has always returned `standardDeduction` and `ra4917` by object shorthand,
but `EstateTaxFullOutput.specialDeductions` was declared as the narrower `SpecialDeductionsResult`,
which carries neither. No typed consumer could read the ₱5,000,000 the engine had applied.

| Quantity | Before | After |
|---|---|---|
| `NEW_FIELDS` (required fields on the interface) | 0 | **2** |
| `OPTIONAL_LEAK` | — | **0** |
| Construction sites the compiler named | — | **1** (`pipeline.ts` `makeErrorOutput`) |
| `CASTS` (`as any` / `as unknown as`) | — | **0** |
| Measured shortfall, named fields vs `total` | **500000000** centavos | recorded as a committed test |

## Deviation

Task 1's action mandates a comment edit to `special-deductions.ts`, but that file is absent from the
plan's `files_modified`. The file was included in the commit (4 paths, not 3): the task's instruction
is explicit and substantive, and the header list omitted it.

## Controls

`cargo test` 546 passed / 0 failed. `npm run test:gate` GATE OK, ledger 31, skipped=0. No baseline or
reference image touched.

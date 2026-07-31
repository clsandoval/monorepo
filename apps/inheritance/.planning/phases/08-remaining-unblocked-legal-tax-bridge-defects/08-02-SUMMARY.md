---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 02
status: complete
requirements: [LAW-08]
commit: 6a4361db01ddcc0baa7ec7b525f6aeceae2e619d
---

# 08-02: The TRAIN-repealed medical deduction is no longer granted, recommended or certified

## What landed

- `computeMedicalDeduction` gained `deductionRules: DeductionRules` as its second parameter and
  `if (deductionRules === 'TRAIN') return 0;`, matching its funeral and judicial siblings exactly.
  `computeSpecialDeductions` keeps its exported signature, so no test call site changed arity.
- `advisor.ts` `ruleNoMedicalClaimed`: the date gate was **inverted** relative to the statute
  (`dateOfDeath < '2018-01-01'` → return null, i.e. it fired only for TRAIN deaths). It now reads
  `dateOfDeath >= TRAIN_EFFECTIVE_DATE` → return null, imported from `./constants` rather than
  repeated as a literal. The suggestion description no longer says "Under TRAIN".
- `sensitivity.ts` was **not** edited: `leverMedicalExpenses` already returns null on a zero delta, and
  under TRAIN the delta becomes 0 as a consequence.
- `MEDICAL_EXPENSE_CAP` was not deleted or changed; it is still the operative pre-TRAIN cap.

## Tests: six expectations corrected, four tests added, none lost

| File | `it(` before | after |
|---|---|---|
| `__tests__/special-deductions.test.ts` | 27 | 29 |
| `__tests__/advisor.test.ts` | 12 | 13 |
| `__tests__/sensitivity.test.ts` | 8 | 9 |

Every corrected expectation carries a comment naming the figure it previously asserted and the phrase
`RA 10963`. `grep -c "\.skip\|\.only\|\.todo\|xit(\|xdescribe("` returns 0 for all three files. All four
new tests passed on their first run; no assertion was adjusted to match output.

## Spec TV-02 corrected to the statute

| Row | was | now |
|---|---|---|
| 37C medical | ₱400,000 | ₱0 — repealed for TRAIN by RA 10963 Sec. 23 |
| Item 37 | ₱11,400,000 | **₱11,000,000** |
| Item 38 | ₱3,100,000 | **₱3,500,000** |
| Item 40 | ₱1,850,000 | **₱2,250,000** |
| Item 42 / 44 | ₱111,000 | **₱135,000** |

Section 10.3's heading now reads PRE-TRAIN ONLY and its pseudocode opens with the regime gate; the
constants block's "(all regimes)" comment is corrected. The only surviving occurrence of `111,000` in
the spec is inside the note recording the previous value.

## Verified, not claimed

```
npx vitest run src/lib/estate-tax-engine/    16 files, 250 passed, 0 failed, 0 skipped
npx tsc -b --force                            zero output, exit 0
node scripts/check-commit-discipline.mjs      exit 0
```

Commit lists exactly 6 files. `ALL GATES PASSED (13/13)` was not reached and is not claimed.

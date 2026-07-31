---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 04
status: complete
requirements: [LAW-09]
commit: 6de15f5cce633325f735562dd6bef1d5754faa08
---

# 08-04: Transfers for public use enter the vanishing-deduction ratio in both regimes

## What landed

`computePublicUseTransfers` now runs **before** `computeVanishingDeduction` in
`computeOrdinaryDeductions`, and the local formerly called `elitForVD` is renamed
`ratioDeductionsTotal` and adds `publicTransfers.total` in **both** branches:

```
PRE_TRAIN: elitBase + funeral.total + judicial.total + publicTransfers.total
TRAIN:     elitBase + publicTransfers.total
```

Authority transcribed, not derived: NIRC Sec. 86(A)(5) as amended by RA 10963 reduces against
paragraphs (2), (3), (4) and **(6)**, and paragraph (6) is Transfers for Public Use; RA 8424
Sec. 86(A)(2) reduced against paragraphs (1) and (3), and pre-TRAIN paragraph (3) was also Transfers
for Public Use. The audit's own fixer note settles the branch question ("Add `publicTransfers.total`
unconditionally").

`computeVanishingDeduction` keeps its four-parameter signature and order; only the third parameter's
name and doc comment changed. Its eligibility gate, five-year cut-off, `vanishingPct` table, `iv`/`nv`
computation and `Math.floor` are untouched.

## Verified, not claimed

```
npx vitest run __tests__/ordinary-deductions.test.ts    42 passed, 0 failed, 0 skipped
  (40 pre-existing, all unedited; 2 added)
npx vitest run src/lib/estate-tax-engine/               16 files, 252 passed, 0 failed
npx tsc -b --force                                       zero output, exit 0
grep -c "\.skip\|\.only\|\.todo\|xit(\|xdescribe("       0
```

Both new tests passed on their first run and assert the same figure in each regime:

- ratio = (3_000_000_000 − 100_000_000 − 500_000_000) / 3_000_000_000 = 0.8
- `item5g_vanishing_deduction.total` = **800_000_000** (was 966_666_600 before the fix)
- `item5h_transfers_for_public_use.total` = 500_000_000, so the term is proved present, not merely
  subtracted

Spec section 9.6 now names 5F in the pseudocode comment and in the ordering constraint, its parameter
is renamed `ratioDeductionsTotal` to match the TypeScript, and a note records the ₱1,666,666
overstatement the omission caused.

Commit lists exactly 3 files. `ALL GATES PASSED (13/13)` was not reached and is not claimed.

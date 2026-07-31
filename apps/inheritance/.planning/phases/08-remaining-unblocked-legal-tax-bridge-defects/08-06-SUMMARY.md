---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 06
status: complete
requirements: [LAW-10]
commit: 7489bbe9040604968561bbe492d9d6b3692b38fe
---

# 08-06: The bridge hands over the Art. 908 distributable estate

## What landed

`EstateTaxFullOutput` and `EstateTaxEngineOutput` both gained four honestly-named fields:
`item34c_gross_estate`, `item35_debts_and_charges`, `item39_spouse_net_share`,
`item44_net_estate_tax_due`. `item35_debts_and_charges` is
`ordinaryDeductions.total.total` less the vanishing deduction and less transfers for public use.

`item40_gross_estate` and `item44_total_deductions` are **retained** on both pipeline return paths
(neither name means what it says), carrying a new comment recording that they are historical, kept so
pre-Phase-8 `cases.tax_output_json` rows still parse, and no longer read by the bridge.
`makeErrorOutput` sets all four new fields to 0.

New `computeDistributableCharges(taxOutput)` validates all four with `Number.isFinite` and **throws**
an `Error` naming the missing field when one is absent. `grep -c "?? 0\||| 0" src/lib/tax-bridge.ts`
returns **0** — no coercion anywhere in the file. `runTaxBridge` and `useTaxBridge` both now call
`computeNetDistributableEstate(taxOutput.item34c_gross_estate, computeDistributableCharges(taxOutput))`.
`computeNetDistributableEstate` itself is byte-identical to its pre-task form.

A case carrying a transfer for public use now emits an explicit warning from the tax pipeline stating
the bridge's assumption, rather than making it silently.

## The worked example, pinned

```
gross      3000000000  (₱30,000,000)
charges  =          0 + 1500000000 + 24000000 = 1524000000
base     = 3000000000 - 1524000000            = 1476000000  (₱14,760,000)
```

against the **376000000** the pre-fix bridge produced from net taxable estate minus tax — a 74.5%
understatement. ₱14,760,000 among a spouse and two children is ₱4,920,000 each.

## One deviation, recorded

Three pre-existing tests supplied their **inputs** through the historical field names
(`item40_gross_estate` / `item44_total_deductions`) as `createTaxOutput` overrides, so they no longer
drove the computation. Their inputs were restated in the new field names; **every expected value is
unchanged** (0, 0 and 600000000) and each carries a comment saying so. No assertion was weakened,
widened or removed. All 31 tests in `tax-bridge.test.ts` and all 11 in `useTaxBridge.test.tsx` pass.

## Verified, not claimed

```
npx vitest run tax-bridge.test.ts useTaxBridge.test.tsx   47 passed, 0 failed  (42 pre-existing + 5 added)
npx vitest run src/lib/estate-tax-engine/                 16 files, 252 passed, 0 failed
npx tsc -b --force                                         zero output, exit 0
node scripts/check-commit-discipline.mjs                   exit 0
```

All five new tests passed first run, including the four-field throw test and the NaN test. Commit lists
exactly 6 files. `ALL GATES PASSED (13/13)` was not reached and is not claimed.

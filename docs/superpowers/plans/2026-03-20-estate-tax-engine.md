# Estate Tax Engine Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic Philippine estate tax computation engine in TypeScript with optimization features (deduction advisor, what-if, sensitivity analysis), integrated into the inheritance frontend app with auto-bridge to the inheritance WASM engine.

**Architecture:** Pipeline of pure functions in `src/lib/estate-tax-engine/`, mirroring the Rust inheritance engine pattern. Each pipeline step maps to a section of the engine spec. The engine consumes the existing wizard state (with type extensions), produces output compatible with the existing tax-bridge interface, and auto-feeds results into the inheritance engine.

**Tech Stack:** TypeScript, React 19, Vitest, Zod, shadcn/ui, Recharts, TanStack Router

**Key references:**
- Design spec: `docs/superpowers/specs/2026-03-20-estate-tax-engine-integration-design.md`
- Engine spec: `apps/inheritance/specs/estate-tax-engine-spec.md` (§4–§19)
- Existing wizard types: `apps/inheritance/frontend/src/types/estate-tax.ts`
- Existing tax bridge: `apps/inheritance/frontend/src/lib/tax-bridge.ts`
- Test runner: `cd apps/inheritance/frontend && npx vitest run`

**Monetary convention:** All monetary values in centavos (integer). Engine spec uses pesos — multiply by 100 at the adapter boundary. Display formatting converts centavos → pesos at UI layer only.

---

## File Map

### New Files (Engine)

| File | Responsibility |
|------|---------------|
| `src/lib/estate-tax-engine/types.ts` | Engine I/O types: `ColumnValues`, `RegimeDetectionResult`, `GrossEstateResult`, `OrdinaryDeductionsResult`, `SpecialDeductionsResult`, `SpouseShareResult`, `TaxComputationResult`, `GraduatedBracketResult`, `DualPathComparisonResult`, `ExplainerOutput`, `EstateTaxFullOutput` |
| `src/lib/estate-tax-engine/constants.ts` | All rates, caps, brackets, dates in centavos |
| `src/lib/estate-tax-engine/validation.ts` | `validateInput()` — Phase 0 error codes |
| `src/lib/estate-tax-engine/regime-detection.ts` | `detectRegime()` + `checkAmnestyEligibility()` |
| `src/lib/estate-tax-engine/sec87-exclusions.ts` | `applySec87Exclusions()` |
| `src/lib/estate-tax-engine/gross-estate.ts` | `computeGrossEstate()` — Items 29–34 |
| `src/lib/estate-tax-engine/ordinary-deductions.ts` | `computeOrdinaryDeductions()` — 5A–5H with sub-functions |
| `src/lib/estate-tax-engine/special-deductions.ts` | `computeSpecialDeductions()` — 37A–37D |
| `src/lib/estate-tax-engine/spouse-share.ts` | `computeSpouseShare()` — Schedule 6A |
| `src/lib/estate-tax-engine/tax-rate.ts` | `computeTax()` — TRAIN flat / pre-TRAIN graduated |
| `src/lib/estate-tax-engine/foreign-tax-credit.ts` | `computeForeignTaxCredit()` |
| `src/lib/estate-tax-engine/nra-proportional.ts` | `computeNRAFactor()` |
| `src/lib/estate-tax-engine/amnesty.ts` | `computeAmnesty()` + dual-path comparison |
| `src/lib/estate-tax-engine/explainer.ts` | `generateExplainer()` |
| `src/lib/estate-tax-engine/advisor.ts` | `runAdvisor()` — deduction suggestions |
| `src/lib/estate-tax-engine/sensitivity.ts` | `runSensitivity()` — impact ranking |
| `src/lib/estate-tax-engine/pipeline.ts` | `computeEstateTax()` + `wizardStateToEngineInput()` |
| `src/lib/estate-tax-engine/index.ts` | Public API re-exports |

### New Files (UI)

| File | Responsibility |
|------|---------------|
| `src/components/tax/results/TaxResultsPanel.tsx` | Tabbed container for result views |
| `src/components/tax/results/Form1801View.tsx` | Line-by-line Form 1801 display |
| `src/components/tax/results/ExplainerView.tsx` | Plain-English narrative |
| `src/components/tax/results/OptimizerView.tsx` | Advisor + Sensitivity + What-If container |
| `src/components/tax/results/ComparisonView.tsx` | Amnesty vs regular side-by-side |
| `src/components/tax/results/WarningsBanner.tsx` | Warning cards |
| `src/components/tax/results/AdvisorPanel.tsx` | Suggestion cards with Apply/Revert |
| `src/components/tax/results/WhatIfPanel.tsx` | Toggle-based scenario comparison |
| `src/components/tax/results/SensitivityPanel.tsx` | Ranked impact bar chart |

### Modified Files

| File | Changes |
|------|---------|
| `src/types/estate-tax.ts` | Extend `FilingData`, `DecedentDetails`, `OrdinaryDeductions`, `SpecialDeductions`; add `WorldwideELIT`, `VanishingDeductionProperty`, `ForeignTaxCreditClaim` |
| `src/schemas/estate-tax.ts` | Update Zod schemas for new fields |
| `src/components/tax/tabs/FilingAmnestyTab.tsx` | Add missing estate flags fields + Compute button |
| `src/components/tax/tabs/DecedentTab.tsx` | Add WorldwideELIT section (conditional on NRA) |
| `src/components/tax/tabs/OrdinaryDeductionsTab.tsx` | Structured vanishing deduction property list |
| `src/components/tax/tabs/SpecialDeductionsTab.tsx` | Per-country foreign tax credit list |
| `src/routes/cases/$caseId.tax.tsx` | Add engine output state, compute handler, bridge integration, render TaxResultsPanel |

---

## Task 1: Types & Constants

**Files:**
- Create: `src/lib/estate-tax-engine/types.ts`
- Create: `src/lib/estate-tax-engine/constants.ts`
- Test: `src/lib/estate-tax-engine/__tests__/constants.test.ts`

- [ ] **Step 1: Write constants test**

```typescript
// src/lib/estate-tax-engine/__tests__/constants.test.ts
import { describe, it, expect } from 'vitest';
import {
  TRAIN_EFFECTIVE_DATE,
  AMNESTY_COVERAGE_CUTOFF,
  TRAIN_RATE,
  AMNESTY_RATE,
  AMNESTY_MINIMUM,
  STANDARD_DEDUCTION_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_NRA,
  FAMILY_HOME_CAP_TRAIN,
  FAMILY_HOME_CAP_PRE_TRAIN,
  MEDICAL_EXPENSE_CAP,
  PRE_TRAIN_BRACKETS,
} from '../constants';

describe('constants', () => {
  it('has correct regime boundary dates', () => {
    expect(TRAIN_EFFECTIVE_DATE).toBe('2018-01-01');
    expect(AMNESTY_COVERAGE_CUTOFF).toBe('2022-05-31');
  });

  it('has correct tax rates', () => {
    expect(TRAIN_RATE).toBe(0.06);
    expect(AMNESTY_RATE).toBe(0.06);
    expect(AMNESTY_MINIMUM).toBe(500_000); // ₱5,000 in centavos
  });

  it('has correct standard deductions in centavos', () => {
    expect(STANDARD_DEDUCTION_TRAIN_CITIZEN).toBe(500_000_000); // ₱5M
    expect(STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN).toBe(100_000_000); // ₱1M
    expect(STANDARD_DEDUCTION_NRA).toBe(50_000_000); // ₱500K
  });

  it('has correct family home caps in centavos', () => {
    expect(FAMILY_HOME_CAP_TRAIN).toBe(1_000_000_000); // ₱10M
    expect(FAMILY_HOME_CAP_PRE_TRAIN).toBe(100_000_000); // ₱1M
  });

  it('has correct medical cap in centavos', () => {
    expect(MEDICAL_EXPENSE_CAP).toBe(50_000_000); // ₱500K
  });

  it('has pre-TRAIN brackets that produce correct boundary taxes', () => {
    // Verify bracket boundary amounts from spec §12.2
    // Tax at ₱500K NTE = ₱15,000
    // Tax at ₱2M NTE = ₱135,000
    // Tax at ₱5M NTE = ₱465,000
    // Tax at ₱10M NTE = ₱1,215,000
    expect(PRE_TRAIN_BRACKETS).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (module not found)**

Run: `cd apps/inheritance/frontend && npx vitest run src/lib/estate-tax-engine/__tests__/constants.test.ts`

- [ ] **Step 3: Write types.ts**

Create `src/lib/estate-tax-engine/types.ts` with all engine types from spec §5.7:
- `ColumnValues` (`exclusive`, `conjugal`, `total` — all centavos)
- `Regime` enum (`TRAIN`, `PRE_TRAIN`, `AMNESTY`)
- `DeductionRules` enum (`TRAIN`, `PRE_TRAIN`)
- `AmnestyTrack` enum (`TRACK_A`, `TRACK_B`)
- `RegimeDetectionResult`
- `GrossEstateResult` (Items 29–34 as `ColumnValues`)
- `OrdinaryDeductionsResult` (5A–5H as `ColumnValues` + total)
- `SpecialDeductionsResult` (37A–37D as centavos + total)
- `SpouseShareResult` (Schedule 6A fields)
- `GraduatedBracketResult` (pre-TRAIN bracket detail)
- `TaxComputationResult` (Items 40–44)
- `DualPathComparisonResult` (amnesty vs regular)
- `ExplainerSection` and `ExplainerOutput`
- `EstateTaxFullOutput` — the complete engine output including all above + `warnings`, `nraProportionalFactor`, `sec87Exclusions`
- `ValidationError` with error code strings
- `EngineInput` — internal engine input type (distinct from wizard state)

Reference spec §5.7 for exact field names. All monetary fields: centavos (number).

- [ ] **Step 4: Write constants.ts**

Create `src/lib/estate-tax-engine/constants.ts` with all values from spec §4, converted to centavos:
- Date boundaries as ISO strings
- Tax rates as decimals (0.06)
- Monetary amounts in centavos (₱5M = 500_000_000)
- Pre-TRAIN bracket table as array of `{ min, max, rate, baseTax }`
- Vanishing deduction percentage table: `{ 1: 1.00, 2: 0.80, 3: 0.60, 4: 0.40, 5: 0.20 }`
- Funeral rate: 0.05

- [ ] **Step 5: Run test — expect PASS**

Run: `cd apps/inheritance/frontend && npx vitest run src/lib/estate-tax-engine/__tests__/constants.test.ts`

- [ ] **Step 6: Commit**

```bash
git add src/lib/estate-tax-engine/types.ts src/lib/estate-tax-engine/constants.ts src/lib/estate-tax-engine/__tests__/constants.test.ts
git commit -m "feat(estate-tax): add engine types and constants"
```

---

## Task 2: Wizard Type Extensions

**Files:**
- Modify: `src/types/estate-tax.ts`
- Modify: `src/schemas/estate-tax.ts`
- Test: `src/types/__tests__/estate-tax.test.ts` (existing — extend)
- Test: `src/schemas/__tests__/estate-tax.test.ts` (existing — extend)

- [ ] **Step 1: Write tests for new types**

Add to existing test file `src/types/__tests__/estate-tax.test.ts`:

```typescript
describe('WorldwideELIT', () => {
  it('is present on default state as null', () => {
    const state = createDefaultEstateTaxState();
    expect(state.decedent.worldwideELIT).toBeNull();
  });
});

describe('VanishingDeductionProperty', () => {
  it('replaces scalar vanishingDeduction with array', () => {
    const state = createDefaultEstateTaxState();
    expect(state.ordinaryDeductions.vanishingDeductionProperties).toEqual([]);
  });
});

describe('ForeignTaxCreditClaim', () => {
  it('replaces scalar foreignTaxCredits with array', () => {
    const state = createDefaultEstateTaxState();
    expect(state.specialDeductions.foreignTaxCreditClaims).toEqual([]);
  });
});

describe('FilingData extensions', () => {
  it('has all estate flags', () => {
    const state = createDefaultEstateTaxState();
    expect(state.filing.taxFullyPaidBeforeMay2022).toBe(false);
    expect(state.filing.priorReturnFiled).toBe(false);
    expect(state.filing.previouslyDeclaredNetEstate).toBeNull();
    expect(state.filing.hasPendingCourtCasePreAmnestyAct).toBe(false);
    expect(state.filing.hasUnexplainedWealthCases).toBe(false);
    expect(state.filing.hasPendingRPCFelonies).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd apps/inheritance/frontend && npx vitest run src/types/__tests__/estate-tax.test.ts`

- [ ] **Step 3: Extend types in estate-tax.ts**

Modify `src/types/estate-tax.ts`:

1. Add `WorldwideELIT` interface (6 fields)
2. Add `worldwideELIT: WorldwideELIT | null` to `DecedentDetails`
3. Add `VanishingDeductionProperty` interface (9 fields)
4. Replace `vanishingDeduction: number` → `vanishingDeductionProperties: VanishingDeductionProperty[]` in `OrdinaryDeductions`
5. Add `ForeignTaxCreditClaim` interface (3 fields)
6. Replace `foreignTaxCredits: number` → `foreignTaxCreditClaims: ForeignTaxCreditClaim[]` in `SpecialDeductions`
7. Add 6 missing fields to `FilingData`: `taxFullyPaidBeforeMay2022`, `priorReturnFiled`, `previouslyDeclaredNetEstate`, `hasPendingCourtCasePreAmnestyAct`, `hasUnexplainedWealthCases`, `hasPendingRPCFelonies`
8. Update `createDefaultEstateTaxState()` with defaults for all new fields

- [ ] **Step 4: Update Zod schemas in schemas/estate-tax.ts**

Update validation schemas to match the new type fields. Add schemas for `WorldwideELIT`, `VanishingDeductionProperty`, `ForeignTaxCreditClaim`, and the new `FilingData` fields.

- [ ] **Step 5: Run tests — expect PASS**

Run: `cd apps/inheritance/frontend && npx vitest run src/types/__tests__/estate-tax.test.ts src/schemas/__tests__/estate-tax.test.ts`

- [ ] **Step 6: Commit**

```bash
git add src/types/estate-tax.ts src/schemas/estate-tax.ts src/types/__tests__/estate-tax.test.ts src/schemas/__tests__/estate-tax.test.ts
git commit -m "feat(estate-tax): extend wizard types with EstateFlags, WorldwideELIT, structured VD and FTC"
```

---

## Task 3: Input Validation

**Files:**
- Create: `src/lib/estate-tax-engine/validation.ts`
- Test: `src/lib/estate-tax-engine/__tests__/validation.test.ts`

- [ ] **Step 1: Write validation tests**

Test all error codes from spec §6:
- `ERR_DATE_REQUIRED` — missing dateOfDeath
- `ERR_DATE_FUTURE` — dateOfDeath in the future
- `ERR_DATE_IMPLAUSIBLE` — dateOfDeath before 1901-01-01
- `ERR_TRACK_B_MISSING` — priorReturnFiled=true but no previouslyDeclaredNetEstate
- `ERR_PRIOR_NEGATIVE` — previouslyDeclaredNetEstate < 0
- `ERR_MULTIPLE_FAMILY_HOMES` — more than one property flagged isFamilyHome
- `ERR_WORLDWIDE_ESTATE_ZERO` — NRA with worldwideGrossEstate = 0
- `ERR_PH_EXCEEDS_WORLDWIDE` — PH gross estate > worldwide gross estate
- Valid input returns no errors

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd apps/inheritance/frontend && npx vitest run src/lib/estate-tax-engine/__tests__/validation.test.ts`

- [ ] **Step 3: Implement validation.ts**

`validateInput(input: EngineInput): ValidationError[]` — returns array of errors. Empty array = valid. Check all 8 conditions above.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/validation.ts src/lib/estate-tax-engine/__tests__/validation.test.ts
git commit -m "feat(estate-tax): add input validation with 8 error codes"
```

---

## Task 4: Regime Detection

**Files:**
- Create: `src/lib/estate-tax-engine/regime-detection.ts`
- Test: `src/lib/estate-tax-engine/__tests__/regime-detection.test.ts`

- [ ] **Step 1: Write regime detection tests**

Cover all branches from spec §6 `detectRegime()`:
- TRAIN-era, no amnesty → `{ regime: TRAIN, deductionRules: TRAIN }`
- TRAIN-era, after coverage cutoff, amnesty elected → TRAIN + warning
- TRAIN-era (2018–2022), amnesty elected + eligible → AMNESTY + TRAIN deductions + warning
- TRAIN-era (2018–2022), amnesty elected + ineligible → TRAIN + ineligibility reason
- Pre-TRAIN, no amnesty → PRE_TRAIN + PRE_TRAIN deductions
- Pre-TRAIN, amnesty elected + eligible → AMNESTY + PRE_TRAIN deductions + displayDualPath=true
- Pre-TRAIN, amnesty elected + ineligible (each of 8 reasons) → PRE_TRAIN
- Edge: death on exactly 2018-01-01 → TRAIN
- Edge: death on exactly 2022-05-31 → eligible for amnesty
- `checkAmnestyEligibility()` — each exclusion flag

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement regime-detection.ts**

Port `detectRegime()` and `checkAmnestyEligibility()` from spec §6 pseudocode. Return `RegimeDetectionResult`.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/regime-detection.ts src/lib/estate-tax-engine/__tests__/regime-detection.test.ts
git commit -m "feat(estate-tax): add regime detection with TRAIN/PRE_TRAIN/AMNESTY routing"
```

---

## Task 5: Sec. 87 Exclusions

**Files:**
- Create: `src/lib/estate-tax-engine/sec87-exclusions.ts`
- Test: `src/lib/estate-tax-engine/__tests__/sec87-exclusions.test.ts`

- [ ] **Step 1: Write tests**

- No exempt assets → all assets pass through unchanged
- USUFRUCT_MERGER → asset excluded with reason
- FIDUCIARY → asset excluded
- FIDEICOMMISSARY → asset excluded
- CHARITABLE_PRIVATE → asset excluded
- Multiple exclusions → all excluded, log has all entries
- Non-exempt assets unaffected

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement sec87-exclusions.ts**

`applySec87Exclusions(assets, sec87ExemptAssets)` → `{ filteredAssets, exclusionLog }`. See spec §7.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/sec87-exclusions.ts src/lib/estate-tax-engine/__tests__/sec87-exclusions.test.ts
git commit -m "feat(estate-tax): add Sec. 87 exempt asset exclusions"
```

---

## Task 6: Gross Estate Computation

**Files:**
- Create: `src/lib/estate-tax-engine/gross-estate.ts`
- Test: `src/lib/estate-tax-engine/__tests__/gross-estate.test.ts`

- [ ] **Step 1: Write tests**

- Real property: `fmv = max(fmvTaxDec, fmvBir)`, Column A/B split
- Family home separated into Item 30
- Personal properties summed into Item 31
- Taxable transfers: `taxableAmount = max(0, fmvAtDeath - consideration)`
- Business interests: netEquity floored at 0
- Total = sum of Items 29–33 per column
- Mixed exclusive + conjugal properties across categories
- Empty arrays → all zeros
- NRA: Item 30 always 0

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement gross-estate.ts**

`computeGrossEstate(decedent, filteredAssets)` → `GrossEstateResult`. See spec §8. Internal helper `sumByOwnership()` for Column A/B/C splits.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/gross-estate.ts src/lib/estate-tax-engine/__tests__/gross-estate.test.ts
git commit -m "feat(estate-tax): add gross estate computation (Items 29-34)"
```

---

## Task 7: NRA Proportional Factor

**Files:**
- Create: `src/lib/estate-tax-engine/nra-proportional.ts`
- Test: `src/lib/estate-tax-engine/__tests__/nra-proportional.test.ts`

- [ ] **Step 1: Write tests**

- Non-NRA → factor null
- NRA with ₱5M PH / ₱20M worldwide → factor 0.25
- NRA with PH = worldwide → factor 1.0
- worldwideGrossEstate = 0 → error
- PH > worldwide → error

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement nra-proportional.ts**

`computeNRAFactor(grossEstatePH, worldwideGrossEstate)` → `number | null`. See spec §15.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/nra-proportional.ts src/lib/estate-tax-engine/__tests__/nra-proportional.test.ts
git commit -m "feat(estate-tax): add NRA proportional factor computation"
```

---

## Task 8: Ordinary Deductions

**Files:**
- Create: `src/lib/estate-tax-engine/ordinary-deductions.ts`
- Test: `src/lib/estate-tax-engine/__tests__/ordinary-deductions.test.ts`

- [ ] **Step 1: Write tests**

Test each sub-function:
- `computeClaimsAgainstEstate()` — Column A/B split
- `computeClaimsVsInsolvent()` — uncollectible amount only
- `computeUnpaidMortgagesAndTaxes()` — mortgages + taxes combined
- `computeCasualtyLosses()` — `max(0, gross - insurance)`
- `computeVanishingDeduction()` — all 5 percentage tiers, elapsed > 5 = 0, priorTaxWasPaid=false = 0, ratio computation with ELIT
- `computePublicUseTransfers()` — full value for citizens, proportional for NRA
- `computeFuneralExpenses()` — pre-TRAIN: `min(actual, 5% × grossEstate)`, TRAIN: 0
- `computeJudicialAdminExpenses()` — pre-TRAIN: actual, TRAIN: 0
- NRA ELIT: proportional via factor applied to WorldwideELIT
- `assembleOrdinaryDeductions()` — totals match sum of 5A–5H
- Empty arrays → all zeros

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement ordinary-deductions.ts**

Port all functions from spec §9. Key: `computeOrdinaryDeductions()` is the public function that orchestrates the internal sub-functions (computeELIT → computeFuneral → computeJudicial → computeELITTotal → computeVanishing → computePublicTransfers → assemble). Export sub-functions for unit testing.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/ordinary-deductions.ts src/lib/estate-tax-engine/__tests__/ordinary-deductions.test.ts
git commit -m "feat(estate-tax): add ordinary deductions (5A-5H) with NRA proportional"
```

---

## Task 9: Special Deductions

**Files:**
- Create: `src/lib/estate-tax-engine/special-deductions.ts`
- Test: `src/lib/estate-tax-engine/__tests__/special-deductions.test.ts`

- [ ] **Step 1: Write tests**

- Standard deduction: TRAIN citizen → ₱5M, pre-TRAIN citizen → ₱1M, NRA → ₱500K
- Family home: capped at ₱10M (TRAIN) / ₱1M (pre-TRAIN), conjugal → half, no barangay cert → 0, NRA → 0
- Medical: capped at ₱500K, NRA → 0
- RA 4917: pass-through amount, NRA → 0
- Total = sum of 37A–37D

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement special-deductions.ts**

`computeSpecialDeductions(specialInputs, deductionRules, decedent, grossEstate)` → `SpecialDeductionsResult`. See spec §10.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/special-deductions.ts src/lib/estate-tax-engine/__tests__/special-deductions.test.ts
git commit -m "feat(estate-tax): add special deductions (37A-37D)"
```

---

## Task 10: Spouse Share

**Files:**
- Create: `src/lib/estate-tax-engine/spouse-share.ts`
- Test: `src/lib/estate-tax-engine/__tests__/spouse-share.test.ts`

- [ ] **Step 1: Write tests**

- Single → share = 0
- Widowed → share = 0
- Annulled → share = 0
- Separation regime → share = 0
- Married ACP → conjugal assets Col B, obligations = ELIT 5A–5D Col B, net ÷ 2
- Married CPG → same formula
- Legally separated + ACP → still has share (legal separation ≠ separation of property)
- Pre-TRAIN: conjugal obligations include funeral + judicial Col B
- TRAIN: obligations exclude funeral + judicial
- Zero conjugal assets → share = 0
- Obligations exceed assets → net floored at 0

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement spouse-share.ts**

`computeSpouseShare(decedent, grossEstate, ordinaryDeductions, deductionRules)` → `SpouseShareResult`. See spec §11.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/spouse-share.ts src/lib/estate-tax-engine/__tests__/spouse-share.test.ts
git commit -m "feat(estate-tax): add surviving spouse share (Schedule 6A)"
```

---

## Task 11: Tax Rate Application

**Files:**
- Create: `src/lib/estate-tax-engine/tax-rate.ts`
- Test: `src/lib/estate-tax-engine/__tests__/tax-rate.test.ts`

- [ ] **Step 1: Write tests**

TRAIN:
- NTE = 0 → tax = 0
- NTE = ₱10M (1_000_000_000 centavos) → tax = ₱600K (60_000_000 centavos)

Pre-TRAIN graduated (all brackets, values in centavos):
- NTE ≤ ₱200K → tax = 0
- NTE = ₱500K → tax = ₱15K (bracket 2 boundary)
- NTE = ₱2M → tax = ₱135K (bracket 3 boundary)
- NTE = ₱5M → tax = ₱465K (bracket 4 boundary)
- NTE = ₱10M → tax = ₱1,215K (bracket 5 boundary)
- NTE = ₱15M → tax = ₱1,215K + ₱5M × 0.20 = ₱2,215K (top bracket)
- NTE = ₱350K → tax = (₱350K - ₱200K) × 0.05 = ₱7,500 (mid-bracket)
- Returns bracket detail with min, max, rate, baseTax, excess, taxOnExcess

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement tax-rate.ts**

`computeTax(netTaxableEstate, regime)` → `TaxComputationResult`. See spec §12. Use `PRE_TRAIN_BRACKETS` from constants.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/tax-rate.ts src/lib/estate-tax-engine/__tests__/tax-rate.test.ts
git commit -m "feat(estate-tax): add tax rate computation (TRAIN flat + pre-TRAIN graduated)"
```

---

## Task 12: Foreign Tax Credit

**Files:**
- Create: `src/lib/estate-tax-engine/foreign-tax-credit.ts`
- Test: `src/lib/estate-tax-engine/__tests__/foreign-tax-credit.test.ts`

- [ ] **Step 1: Write tests**

- NRA → credit = 0
- Amnesty regime → credit = 0
- No claims → credit = 0
- Single country: credit = min(foreignTaxPaid, estateTaxDue × foreignPropertyFMV/grossEstate)
- Multiple countries: per-country limits summed, capped at total estateTaxDue
- Foreign property FMV > gross estate → per-country limit = estateTaxDue

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement foreign-tax-credit.ts**

`computeForeignTaxCredit(decedent, regime, claims, grossEstateTotal, estateTaxDue)` → centavos. See spec §13.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/foreign-tax-credit.ts src/lib/estate-tax-engine/__tests__/foreign-tax-credit.test.ts
git commit -m "feat(estate-tax): add foreign tax credit with per-country limits"
```

---

## Task 13: Amnesty Computation

**Files:**
- Create: `src/lib/estate-tax-engine/amnesty.ts`
- Test: `src/lib/estate-tax-engine/__tests__/amnesty.test.ts`

- [ ] **Step 1: Write tests**

- Track A: base = full NTE, tax = NTE × 6%
- Track B: base = NTE - previouslyDeclared, tax = base × 6%
- Track B: previously declared > NTE → base = 0, minimum applied
- Minimum ₱5K (500_000 centavos) applied when computed tax < minimum
- Dual path comparison: amnesty vs pre-TRAIN, correct `recommendedPath`
- Crossover at ₱1,250,000 NTE

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement amnesty.ts**

`computeAmnesty(netTaxableEstate, estateFlags, deductionRules)` → `TaxComputationResult`. `computeDualPathComparison(amnestyResult, preTRAINResult)` → `DualPathComparisonResult`. See spec §14.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/amnesty.ts src/lib/estate-tax-engine/__tests__/amnesty.test.ts
git commit -m "feat(estate-tax): add amnesty computation with Track A/B and dual-path comparison"
```

---

## Task 14: Explainer

**Files:**
- Create: `src/lib/estate-tax-engine/explainer.ts`
- Test: `src/lib/estate-tax-engine/__tests__/explainer.test.ts`

- [ ] **Step 1: Write tests**

- TRAIN regime → correct intro text mentioning flat 6%
- PRE_TRAIN regime → mentions graduated rates and bracket
- AMNESTY → mentions RA 11213, filing window closed
- Gross estate section populated with table values
- Deductions section lists each applied deduction
- Tax computation section shows Items 40–44
- NRA output mentions proportional deductions

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement explainer.ts**

`generateExplainer(allResults)` → `ExplainerOutput`. Template text from spec §18 with `{{variable}}` placeholders filled from computed values.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/explainer.ts src/lib/estate-tax-engine/__tests__/explainer.test.ts
git commit -m "feat(estate-tax): add plain-English explainer generation"
```

---

## Task 15: Pipeline & Adapter

**Files:**
- Create: `src/lib/estate-tax-engine/pipeline.ts`
- Create: `src/lib/estate-tax-engine/index.ts`
- Test: `src/lib/estate-tax-engine/__tests__/pipeline.test.ts`

- [ ] **Step 1: Write pipeline integration tests**

Use test vectors from spec §19. At minimum:
- Simple TRAIN citizen: single real property, no deductions → verify exact tax due in centavos
- TRAIN citizen with all deduction types → verify Items 34, 35, 37, 38, 39, 40, 42, 44
- Pre-TRAIN citizen → verify graduated bracket selection and tax
- NRA with proportional deductions → verify NRA factor applied
- Amnesty pre-TRAIN dual path → verify both results and recommended path
- Zero estate → tax = 0
- Validation error input → throws/returns errors
- Bridge-compatible output: verify `item40_gross_estate`, `item44_total_deductions`, `tax_due`, `schedules`, and zero-filled `surcharges`/`interest`/`compromise_penalty`/`total_amount_due`

Test the adapter:
- `wizardStateToEngineInput()` converts peso values to centavos
- Maps wizard field names to engine field names correctly
- Handles null/empty arrays

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement pipeline.ts**

`wizardStateToEngineInput(wizardState: EstateTaxWizardState)` → `EngineInput` — maps wizard types to engine types, converts pesos to centavos.

`computeEstateTax(wizardState: EstateTaxWizardState)` → `EstateTaxFullOutput` — orchestrates all 14 phases from spec §16. Assembles output including bridge-compatible fields (`item40_gross_estate`, `item44_total_deductions`, etc.) with surcharges/interest/penalty zero-filled.

- [ ] **Step 4: Implement index.ts**

Re-export `computeEstateTax`, `runAdvisor` (placeholder), `runSensitivity` (placeholder), and all public types.

- [ ] **Step 5: Run tests — expect PASS**

- [ ] **Step 6: Commit**

```bash
git add src/lib/estate-tax-engine/pipeline.ts src/lib/estate-tax-engine/index.ts src/lib/estate-tax-engine/__tests__/pipeline.test.ts
git commit -m "feat(estate-tax): add pipeline orchestrator and wizard-to-engine adapter"
```

---

## Task 16: Deduction Advisor

**Files:**
- Create: `src/lib/estate-tax-engine/advisor.ts`
- Test: `src/lib/estate-tax-engine/__tests__/advisor.test.ts`

- [ ] **Step 1: Write tests**

- Residential property exists, no family home flagged → suggestion with savings > 0
- Family home already claimed → no suggestion
- Married, no property regime → suggestion to set regime
- No medical expenses, recent death → suggestion prompt
- Amnesty eligible, not elected, would save money → suggestion
- NRA without worldwideELIT → suggestion
- All deductions already maximized → empty suggestions array
- Patch applies cleanly to wizard state (merge produces valid state)
- Estimated savings matches `currentTaxDue - patchedTaxDue`

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement advisor.ts**

`runAdvisor(wizardState, engineOutput)` → `Suggestion[]`. Each rule:
1. Check condition (does the suggestion apply?)
2. Build patch (`Partial<EstateTaxWizardState>`)
3. Merge patch with current state
4. Re-run `computeEstateTax()` on patched state
5. Compute savings = `currentOutput.taxComputation.netEstateTaxDue - patchedOutput.taxComputation.netEstateTaxDue`
6. If savings > 0, include in results

Sort by `estimatedSavings` descending. See design spec §6.1 for full rule list.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/advisor.ts src/lib/estate-tax-engine/__tests__/advisor.test.ts
git commit -m "feat(estate-tax): add deduction advisor with patch-and-rerun savings"
```

---

## Task 17: Sensitivity Analysis

**Files:**
- Create: `src/lib/estate-tax-engine/sensitivity.ts`
- Test: `src/lib/estate-tax-engine/__tests__/sensitivity.test.ts`

- [ ] **Step 1: Write tests**

- Family home toggle produces expected delta
- Property regime variations (ACP/CPG/CSP) ranked by impact
- Amnesty toggle produces delta (when eligible)
- Deduction category zeroed → shows tax increase
- Results sorted by absolute delta descending
- Zero-impact toggles excluded from results
- Reuses advisor patch-and-rerun pattern

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Implement sensitivity.ts**

`runSensitivity(wizardState, engineOutput)` → `SensitivityResult[]`. For each lever:
1. Build patched wizard state
2. Run `computeEstateTax()` on patched state
3. Compute delta = patched tax - current tax
4. Include in results with human-readable descriptions

Sort by absolute delta descending. See design spec §6.3.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/estate-tax-engine/sensitivity.ts src/lib/estate-tax-engine/__tests__/sensitivity.test.ts
git commit -m "feat(estate-tax): add sensitivity analysis with ranked impact"
```

---

## Task 18: Wizard Tab UI Updates

**Files:**
- Modify: `src/components/tax/tabs/FilingAmnestyTab.tsx`
- Modify: `src/components/tax/tabs/DecedentTab.tsx`
- Modify: `src/components/tax/tabs/OrdinaryDeductionsTab.tsx`
- Modify: `src/components/tax/tabs/SpecialDeductionsTab.tsx`

- [ ] **Step 1: Read all four tab components to understand current structure**

- [ ] **Step 2: Update FilingAmnestyTab.tsx**

Add form fields for the 6 new `FilingData` fields:
- `taxFullyPaidBeforeMay2022` — checkbox
- `priorReturnFiled` — checkbox
- `previouslyDeclaredNetEstate` — MoneyInput (conditional on priorReturnFiled)
- `hasPendingCourtCasePreAmnestyAct` — checkbox
- `hasUnexplainedWealthCases` — checkbox
- `hasPendingRPCFelonies` — checkbox

Group these under a "Estate Tax Amnesty Eligibility" section, visible when `userElectsAmnesty` is true.

Add a **"Compute Estate Tax"** button at the bottom of the tab. Wired via a new `onCompute` prop.

- [ ] **Step 3: Update DecedentTab.tsx**

Add WorldwideELIT section, conditionally shown when `isNonResidentAlien` is true:
- `claimsAgainstEstate` — MoneyInput
- `claimsVsInsolvent` — MoneyInput
- `unpaidMortgages` — MoneyInput
- `casualtyLosses` — MoneyInput
- `funeralExpenses` — MoneyInput (label note: pre-TRAIN only)
- `judicialAdminExpenses` — MoneyInput (label note: pre-TRAIN only)

- [ ] **Step 4: Update OrdinaryDeductionsTab.tsx**

Replace the single `vanishingDeduction` number input with a list of `VanishingDeductionProperty` entries. Each entry has:
- description (text)
- priorTransferType (select: INHERITANCE / GIFT)
- priorTransferDate (DateInput)
- priorFMV (MoneyInput)
- currentFMV (MoneyInput)
- mortgageOnProperty (MoneyInput)
- priorTaxWasPaid (checkbox)
- ownership (select: exclusive / conjugal)
- isPhilippineSitus (checkbox, shown for NRA)

Add/remove buttons for the list.

- [ ] **Step 5: Update SpecialDeductionsTab.tsx**

Replace the single `foreignTaxCredits` number input with a list of `ForeignTaxCreditClaim` entries:
- country (text)
- foreignTaxPaid (MoneyInput)
- foreignPropertyFMV (MoneyInput)

Add/remove buttons for the list.

- [ ] **Step 6: Commit**

```bash
git add src/components/tax/tabs/FilingAmnestyTab.tsx src/components/tax/tabs/DecedentTab.tsx src/components/tax/tabs/OrdinaryDeductionsTab.tsx src/components/tax/tabs/SpecialDeductionsTab.tsx
git commit -m "feat(estate-tax): update wizard tabs with structured VD, FTC, EstateFlags, WorldwideELIT"
```

---

## Task 19: Tax Results UI Components

**Files:**
- Create: `src/components/tax/results/WarningsBanner.tsx`
- Create: `src/components/tax/results/Form1801View.tsx`
- Create: `src/components/tax/results/ExplainerView.tsx`
- Create: `src/components/tax/results/ComparisonView.tsx`
- Create: `src/components/tax/results/AdvisorPanel.tsx`
- Create: `src/components/tax/results/WhatIfPanel.tsx`
- Create: `src/components/tax/results/SensitivityPanel.tsx`
- Create: `src/components/tax/results/OptimizerView.tsx`
- Create: `src/components/tax/results/TaxResultsPanel.tsx`

- [ ] **Step 1: Build WarningsBanner**

Renders `warnings: string[]` as a stack of Alert components (shadcn Alert with variant="default"). Each warning is its own card.

- [ ] **Step 2: Build Form1801View**

Line-by-line Form 1801 display using shadcn Table. Sections:
- Part IV header (Items 29–44) with Column A / Column B / Total columns
- Gross Estate (29–34)
- Ordinary Deductions (35 with expandable Schedule 5)
- Estate After Ordinary (36)
- Special Deductions (37A–37D, total 37)
- Net Estate (38)
- Spouse Share (39)
- Net Taxable Estate (40)
- Tax Rate (41) / Tax Due (42) / Foreign Credit (43) / Net Tax Due (44)

Format all centavo values as pesos with `₱` prefix and 2 decimal places.

- [ ] **Step 3: Build ExplainerView**

Renders `ExplainerOutput` sections as styled prose. Each `ExplainerSection` rendered as a Card with title and markdown-rendered body (using existing react-markdown).

- [ ] **Step 4: Build ComparisonView**

Side-by-side table (shadcn Table) showing regular vs amnesty paths:
- Net Taxable Estate
- Tax Rate / Bracket
- Estate Tax Due
- Recommended path (highlighted badge)
- Note: "Filing window closed June 14, 2025"

Only rendered when `dualPathComparison` is non-null.

- [ ] **Step 5: Build AdvisorPanel**

Renders `Suggestion[]` as cards sorted by savings:
- Title + description
- Savings badge: `₱X,XXX` in green
- "Apply" button → calls `onApply(suggestion.patch)`
- After applying: "Revert" button → calls `onRevert()`
- Affected tab indicator

- [ ] **Step 6: Build WhatIfPanel**

Toggle switches for key levers:
- Family home claimed (Switch)
- Amnesty elected (Switch)
- Property regime (Select: ACP/CPG/CSP)

On toggle → calls `computeEstateTax()` with modified state → shows side-by-side table (current vs scenario) with delta.

- [ ] **Step 7: Build SensitivityPanel**

Horizontal bar chart (Recharts BarChart) showing `SensitivityResult[]` ranked by absolute impact. Each bar labeled with input name, current → alternative, and delta in pesos.

- [ ] **Step 8: Build OptimizerView**

Container that renders AdvisorPanel, SensitivityPanel, and WhatIfPanel as sub-sections with headings.

- [ ] **Step 9: Build TaxResultsPanel**

Tabbed container (shadcn Tabs) with:
1. "Form 1801" → Form1801View
2. "Explainer" → ExplainerView
3. "Optimizer" → OptimizerView
4. "Comparison" → ComparisonView (conditional tab, only when dualPathComparison present)

WarningsBanner rendered above the tabs.

- [ ] **Step 10: Commit**

```bash
git add src/components/tax/results/
git commit -m "feat(estate-tax): add tax results UI (Form 1801, Explainer, Optimizer, Comparison)"
```

---

## Task 20: Route Integration & Auto-Bridge

**Files:**
- Modify: `src/routes/cases/$caseId.tax.tsx`
- Modify: `src/components/tax/EstateTaxWizard.tsx`

- [ ] **Step 1: Read current route and wizard component**

- [ ] **Step 2: Update EstateTaxWizard to accept onCompute prop**

Add `onCompute: (state: EstateTaxWizardState) => void` to `EstateTaxWizardProps`. Pass it through to `FilingAmnestyTab` as the compute button handler.

- [ ] **Step 3: Update $caseId.tax.tsx route**

Add state management:
```typescript
type TaxPageState =
  | { phase: 'editing' }
  | { phase: 'computing' }
  | { phase: 'results'; output: EstateTaxFullOutput }
  | { phase: 'error'; message: string };
```

Add `handleCompute` function:
1. Set phase to `computing`
2. Call `computeEstateTax(taxState)` (synchronous, but wrap in try/catch)
3. Save output via `saveTaxOutput(caseId, output)`
4. Run auto-bridge: `runTaxBridge(inheritanceInput, output)` → save bridged output
5. Toast: "Estate tax applied — heir shares updated"
6. Set phase to `results`

Load inheritance input from case row (`input_json`) for bridge.

Render:
- `phase === 'editing'` → wizard only
- `phase === 'computing'` → spinner
- `phase === 'results'` → wizard (collapsed/togglable) + TaxResultsPanel

Wire advisor Apply/Revert: on Apply, merge patch into `taxState`, re-run `handleCompute`. On Revert, restore previous `taxState`.

- [ ] **Step 4: Test manually**

Run: `cd apps/inheritance/frontend && npm run dev`

Verify:
1. Navigate to a case → tax route
2. Fill in minimal data (decedent name, death date, one real property)
3. Click Compute → results panel appears
4. Form 1801 tab shows correct values
5. Navigate back to case → inheritance results updated

- [ ] **Step 5: Commit**

```bash
git add src/routes/cases/\$caseId.tax.tsx src/components/tax/EstateTaxWizard.tsx
git commit -m "feat(estate-tax): integrate engine with tax route, auto-bridge, and results panel"
```

---

## Task 21: Update index.ts exports

**Files:**
- Modify: `src/lib/estate-tax-engine/index.ts`

- [ ] **Step 1: Update index.ts**

Replace placeholders with real imports:

```typescript
export { computeEstateTax } from './pipeline';
export { runAdvisor } from './advisor';
export { runSensitivity } from './sensitivity';
export type { EstateTaxFullOutput, Suggestion, SensitivityResult } from './types';
```

- [ ] **Step 2: Run full test suite**

Run: `cd apps/inheritance/frontend && npx vitest run src/lib/estate-tax-engine/`

Verify all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/estate-tax-engine/index.ts
git commit -m "feat(estate-tax): finalize public API exports"
```

---

## Task 22: End-to-End Smoke Test

**Files:**
- Test: `src/lib/estate-tax-engine/__tests__/pipeline.test.ts` (extend)

- [ ] **Step 1: Add comprehensive end-to-end test vectors**

From spec §19, add test cases that exercise the full pipeline:
1. TRAIN citizen, married ACP, 2 real properties (1 family home), personal property, 1 claim against estate, medical expenses → verify all Items 29–44
2. Pre-TRAIN citizen, single, 1 real property, no deductions → verify graduated bracket
3. NRA, married CPG, proportional deductions → verify factor applied correctly
4. Amnesty pre-TRAIN, Track A → verify amnesty tax and dual-path comparison
5. Amnesty pre-TRAIN, Track B → verify base = NTE - previous
6. Zero estate → all Items = 0, tax = 0
7. All Sec. 87 exemptions → assets excluded from gross estate

- [ ] **Step 2: Run full test suite**

Run: `cd apps/inheritance/frontend && npx vitest run`

All tests must pass including existing inheritance tests (no regressions from type changes).

- [ ] **Step 3: Commit**

```bash
git add src/lib/estate-tax-engine/__tests__/pipeline.test.ts
git commit -m "test(estate-tax): add comprehensive end-to-end test vectors"
```

---

## Summary

| Task | Component | Files |
|------|-----------|-------|
| 1 | Types & Constants | 3 new |
| 2 | Wizard Type Extensions | 4 modified |
| 3 | Input Validation | 2 new |
| 4 | Regime Detection | 2 new |
| 5 | Sec. 87 Exclusions | 2 new |
| 6 | Gross Estate | 2 new |
| 7 | NRA Proportional | 2 new |
| 8 | Ordinary Deductions | 2 new |
| 9 | Special Deductions | 2 new |
| 10 | Spouse Share | 2 new |
| 11 | Tax Rate | 2 new |
| 12 | Foreign Tax Credit | 2 new |
| 13 | Amnesty | 2 new |
| 14 | Explainer | 2 new |
| 15 | Pipeline & Adapter | 3 new |
| 16 | Deduction Advisor | 2 new |
| 17 | Sensitivity Analysis | 2 new |
| 18 | Wizard Tab Updates | 4 modified |
| 19 | Tax Results UI | 9 new |
| 20 | Route Integration | 2 modified |
| 21 | Index Exports | 1 modified |
| 22 | E2E Smoke Tests | 1 extended |

**Total:** ~40 new files, ~10 modified files, 22 tasks

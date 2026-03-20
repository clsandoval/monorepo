# Estate Tax Computation Engine & Optimization — Design Spec

**Date**: 2026-03-20
**App**: `apps/inheritance/frontend/`
**Depends on**: Estate tax engine spec (`apps/inheritance/specs/estate-tax-engine-spec.md`), existing wizard UI (`components/tax/`), tax-bridge (`lib/tax-bridge.ts`)

---

## 1. Overview

Build a deterministic Philippine estate tax computation engine in TypeScript that:
- Computes estate tax across three regimes (TRAIN, PRE_TRAIN, AMNESTY)
- Supports NRA decedents with proportional deductions
- Auto-bridges results into the inheritance WASM engine
- Provides optimization features: deduction advisor, what-if scenarios, sensitivity analysis

The engine runs client-side as pure functions. No backend computation needed.

---

## 2. Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Engine language | TypeScript | Straightforward arithmetic; no need for Rust's BigInt fractions |
| Architecture | Pipeline of pure functions | Mirrors Rust engine pattern; testable per-step; maps to spec sections |
| Regime support | TRAIN + PRE_TRAIN + AMNESTY | Full coverage; death date auto-selects regime |
| NRA support | Yes | Different deduction eligibility, proportional ELIT, ₱500K standard deduction |
| Amnesty handling | Side-by-side comparison (regular vs amnesty) | User sees which path saves more |
| Bridge behavior | Auto-feed on compute | Tax result automatically updates `net_distributable_estate` and re-runs inheritance engine |
| Optimization | Advisor + What-If + Sensitivity | Advisor suggests unclaimed deductions with one-click apply; What-If for manual exploration; Sensitivity ranks levers by impact |

---

## 3. Engine Architecture

### 3.1 Directory: `src/lib/estate-tax-engine/`

| File | Responsibility | Spec Section |
|------|---------------|-------------|
| `types.ts` | Engine-specific types (`ColumnValues`, `RegimeDetectionResult`, `GrossEstateResult`, output types) | §5.7 |
| `constants.ts` | Hardcoded rates, caps, brackets, dates | §4 |
| `regime-detection.ts` | `detectRegime()` — TRAIN/PRE_TRAIN/AMNESTY + deductionRules from death date and flags | §6 |
| `sec87-exclusions.ts` | `applySec87Exclusions()` — filters exempt assets before gross estate | §7 |
| `gross-estate.ts` | `computeGrossEstate()` — Items 29–34 with Column A/B/C splits | §8 |
| `ordinary-deductions.ts` | `computeOrdinaryDeductions()` — ELIT, vanishing, public transfers, funeral/judicial (pre-TRAIN) | §9 |
| `special-deductions.ts` | `computeSpecialDeductions()` — standard, family home, medical, RA 4917 | §10 |
| `spouse-share.ts` | `computeSpouseShare()` — Schedule 6A: net conjugal property ÷ 2 | §11 |
| `tax-rate.ts` | `computeTax()` — flat 6% (TRAIN), graduated table (pre-TRAIN), amnesty (6% + ₱5K floor) | §12 |
| `foreign-tax-credit.ts` | `computeForeignTaxCredit()` — per-country and worldwide credit limits | §13 |
| `nra-proportional.ts` | `applyNRAProportional()` — scales ELIT by PH-situs/worldwide ratio | §15 |
| `amnesty.ts` | `computeAmnesty()` — Track A/B, eligibility, comparison output | §14 |
| `explainer.ts` | `generateExplainer()` — plain-English narrative per computation step | §18 |
| `advisor.ts` | `runAdvisor()` — scans for unclaimed deductions, computes savings | new |
| `sensitivity.ts` | `runSensitivity()` — varies key inputs, ranks by tax impact | new |
| `pipeline.ts` | `computeEstateTax()` — orchestrates all steps; `wizardStateToEngineInput()` adapter | §16 |
| `index.ts` | Public API: re-exports `computeEstateTax`, `runAdvisor`, `runSensitivity`, types | — |

### 3.2 Pipeline Flow

```
wizardStateToEngineInput(wizardState)
  → detectRegime(decedent, estateFlags, userElectsAmnesty)
  → applySec87Exclusions(assets, sec87ExemptAssets)
  → computeGrossEstate(filteredAssets)
  → applyNRAProportional(grossEstate, worldwideGrossEstate)  // if NRA
  → computeOrdinaryDeductions(deductionInputs, deductionRules, nraFactor)
  → computeSpecialDeductions(specialInputs, deductionRules, citizenship, grossEstate)
  → computeSpouseShare(grossEstate, ordinaryDeductions, propertyRegime, maritalStatus)
  → computeTax(netTaxableEstate, regime, deductionRules)
  → computeForeignTaxCredit(foreignTaxClaims, grossEstate, estateTaxDue)
  → computeAmnesty(...)  // if dual-path
  → generateExplainer(allResults)
  → assemble EstateTaxEngineOutput
```

Every step is a **pure function**: inputs + accumulated state → results. No side effects, no async, no database calls.

---

## 4. Input/Output Contract

### 4.1 Input

The engine consumes the existing `EstateTaxWizardState` from `types/estate-tax.ts`. A thin adapter function `wizardStateToEngineInput()` in `pipeline.ts` maps wizard form state to the engine's internal input shape. No changes to wizard types needed.

### 4.2 Output

The engine produces `EstateTaxEngineOutput` (in `types.ts`) that is a superset of the existing `EstateTaxEngineOutput` in `tax-bridge.ts`. It includes:

- `regimeDetection` — which regime/deduction rules were selected and why
- `grossEstate` — Items 29–34 breakdown with Column A/B/C
- `ordinaryDeductions` — itemized ELIT, vanishing, public transfers, funeral/judicial
- `specialDeductions` — standard, family home, medical, RA 4917
- `spouseShare` — Schedule 6A detail
- `taxComputation` — Items 40–44, bracket detail (pre-TRAIN), amnesty detail
- `dualPathComparison` — regular vs amnesty side-by-side (when applicable)
- `explainer` — plain-English narrative sections
- `warnings` — regime notes, eligibility issues, edge cases
- `nraProportionalFactor` — PH-situs/worldwide ratio (if NRA)

**Backward compatibility**: The output includes `item40_gross_estate`, `item44_total_deductions`, `tax_due`, and `schedules` fields that `tax-bridge.ts` already expects.

---

## 5. Integration Points

### 5.1 Tax Wizard Compute Button

The Filing & Amnesty tab (last tab) gets a **"Compute Estate Tax"** button. On click:
1. Calls `computeEstateTax(wizardState)`
2. Stores result in component state
3. Shows results panel below wizard

### 5.2 Auto-Bridge

On successful computation:
1. `runTaxBridge()` fires with the new output
2. `net_distributable_estate = max(0, gross_estate - total_deductions)`
3. Re-runs inheritance WASM engine with bridged value
4. Updates `output_json` on the case row
5. Toast notification: "Estate tax applied — heir shares updated"

### 5.3 Persist to Case

`saveTaxOutput()` writes the full engine output to `tax_output_json` on the case row. Existing function, no changes needed.

### 5.4 No Changes Required To

- Inheritance engine (Rust/WASM)
- Inheritance wizard
- Existing tax-bridge functions (they consume the same interface)
- Database schema (`tax_input_json` and `tax_output_json` columns already exist)

---

## 6. Optimization Features

### 6.1 Deduction Advisor

**File**: `src/lib/estate-tax-engine/advisor.ts`
**Component**: `src/components/tax/results/AdvisorPanel.tsx`

`runAdvisor(wizardState, engineOutput)` returns `Suggestion[]`:

```typescript
interface Suggestion {
  id: string;                          // e.g. "unclaimed-family-home"
  title: string;                       // human-readable label
  description: string;                 // why this matters + legal basis
  estimatedSavings: number;            // centavos
  patch: Partial<EstateTaxWizardState>; // merge to apply
  affectedTab: TabIndex;               // which wizard tab to review
}
```

**~15-20 rules** including:
- Residential property exists but no family home claimed
- Married but no property regime set
- No medical expenses claimed (prompt about final-year expenses)
- Vanishing deduction eligible (prior transfer within 5 years)
- Standard deduction not applied (verify — should be automatic)
- Unpaid taxes/mortgages not listed
- Amnesty not elected but eligible and would save money
- NRA with worldwide ELIT not provided (missing proportional deduction)
- RA 4917 benefits unclaimed
- Casualty losses without insurance offset
- Public use transfers not claimed

Each rule re-runs the engine with its patch applied. `estimatedSavings = currentTaxDue - patchedTaxDue`. Only suggestions with savings > 0 are shown.

**UI**: Card list sorted by estimated savings (highest first). Each card shows title, description, savings in pesos, and **"Apply"** button. Clicking Apply merges the patch, re-computes, updates results. **"Revert"** button appears after applying.

### 6.2 What-If Scenarios

**Component**: `src/components/tax/results/WhatIfPanel.tsx`

User toggles specific inputs and sees side-by-side comparison:
- Family home: claimed vs not
- Amnesty: elected vs not
- Property regime: ACP vs CPG vs CSP
- Individual deductions on/off

Runs `computeEstateTax()` twice (current + scenario) on each toggle. Displays a side-by-side table with delta highlighted.

No new engine logic — reuses `computeEstateTax()`.

### 6.3 Sensitivity Analysis

**File**: `src/lib/estate-tax-engine/sensitivity.ts`
**Component**: `src/components/tax/results/SensitivityPanel.tsx`

`runSensitivity(wizardState, engineOutput)` systematically varies key inputs:
- Family home: claimed vs not
- Property regime: ACP vs CPG vs CSP
- Amnesty: elected vs not (when eligible)
- Each deduction category: zeroed vs current
- Medical expenses: 0 vs capped max

Returns ranked `SensitivityResult[]`:
```typescript
interface SensitivityResult {
  inputName: string;
  currentValue: string;       // human-readable
  alternativeValue: string;   // human-readable
  taxDelta: number;           // centavos (negative = saves money)
}
```

**UI**: Horizontal bar chart (Recharts) ranking which levers move the needle most.

---

## 7. Tax Results UI

### 7.1 New Components: `src/components/tax/results/`

| Component | Purpose |
|-----------|---------|
| `TaxResultsPanel.tsx` | Container — tabbed layout for all result views |
| `Form1801View.tsx` | Line-by-line Form 1801: Items 29–44, Schedules 1–6A, Column A/B/C |
| `ExplainerView.tsx` | Plain-English narrative of computation |
| `OptimizerView.tsx` | Contains AdvisorPanel + SensitivityPanel + WhatIfPanel |
| `ComparisonView.tsx` | Regular vs amnesty side-by-side (when `dualPathComparison` non-null) |
| `WarningsBanner.tsx` | Renders `warnings[]` at top |
| `AdvisorPanel.tsx` | Deduction suggestions with Apply/Revert |
| `WhatIfPanel.tsx` | Toggle-based scenario comparison |
| `SensitivityPanel.tsx` | Ranked impact bar chart |

### 7.2 Results Panel Tabs

1. **Form 1801** — line-by-line breakdown
2. **Explainer** — plain English
3. **Optimizer** — Advisor + Sensitivity + What-If sub-sections
4. **Comparison** — amnesty vs regular (conditional)

### 7.3 UX Flow

1. User fills 8 wizard tabs
2. Clicks "Compute Estate Tax" on last tab
3. Results panel appears below wizard
4. Auto-bridge fires → toast: "Estate tax applied — heir shares updated"
5. User explores Optimizer tab for savings opportunities
6. Clicks "Apply" on suggestions → re-computes → results update
7. Navigates back to `/cases/:caseId` → sees updated inheritance distribution

---

## 8. Full User Flow

```
Sign in (/auth)
  → Dashboard (/)
  → New Case (/cases/new) — Guided Intake (6 steps)
  → Case Editor (/cases/:caseId) — Inheritance Wizard (6 steps)
  → Compute Inheritance → ResultsView (heir shares, narratives, warnings)
  → Estate Tax (/cases/:caseId/tax) — Tax Wizard (8 tabs)
  → Compute Estate Tax → TaxResultsPanel (Form 1801, Explainer, Optimizer, Comparison)
  → Auto-Bridge → inheritance re-runs with computed net estate
  → Back to Case → updated heir shares reflecting real tax computation
```

Both directions work:
- **Path A**: Estimate estate → compute inheritance → do tax → auto-bridge overwrites estimate
- **Path B**: Do tax first → bridge sets net estate → inheritance wizard pre-filled

---

## 9. Testing Strategy

### 9.1 Engine Unit Tests (`src/lib/estate-tax-engine/__tests__/`)

| Test file | Coverage |
|-----------|----------|
| `regime-detection.test.ts` | TRAIN/PRE_TRAIN/AMNESTY routing, edge dates, eligibility, error cases |
| `gross-estate.test.ts` | Column A/B/C splits, real property max(zonal, assessed), transfer net amounts |
| `ordinary-deductions.test.ts` | ELIT items, vanishing deduction % table, funeral/judicial (pre-TRAIN), NRA proportional |
| `special-deductions.test.ts` | Standard deduction by regime/citizenship, family home cap, medical cap, RA 4917 |
| `spouse-share.test.ts` | ACP/CPG/CSP splits, single decedent |
| `tax-rate.test.ts` | TRAIN flat 6%, pre-TRAIN graduated (all 5 brackets + top), amnesty 6% + ₱5K floor |
| `foreign-tax-credit.test.ts` | Per-country and worldwide limits |
| `nra-proportional.test.ts` | PH-situs/worldwide ratio on ELIT |
| `amnesty.test.ts` | Track A/B, comparison, ineligibility |
| `pipeline.test.ts` | End-to-end with spec test vectors (§19) — exact centavo matching |
| `advisor.test.ts` | Each rule triggers correctly, savings accurate, patches apply cleanly |
| `sensitivity.test.ts` | Ranked output, expected deltas |

### 9.2 Not Tested Exhaustively

UI components get basic render/interaction tests only. Engine pure functions carry the critical logic.

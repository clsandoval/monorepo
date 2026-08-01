/**
 * Estate Tax Engine — Pipeline Orchestrator (spec §16)
 *
 * Wires together all 14 computation phases and provides:
 * - wizardStateToEngineInput(): adapter from wizard types → engine types
 * - computeEstateTax(): full pipeline from wizard state → EstateTaxFullOutput
 *
 * All monetary values in centavos (integer).
 */

import { pesosToCentavos, asPesos } from '../../types/money-units';
import type { Pesos, Centavos } from '../../types/money-units';

import type {
  EngineInput,
  EstateTaxFullOutput,
  EstateTaxScheduleSummary,
  TaxComputationResult,
  DecedentInfo,
  ExecutorInfo,
  EstateFlags,
  FilingInfo,
  RealProperty,
  PersonalPropertyFinancial,
  PersonalPropertyTangible,
  TaxableTransfer,
  BusinessInterest,
  Sec87ExemptAsset,
  ClaimAgainstEstate,
  ClaimVsInsolvent,
  UnpaidMortgage,
  UnpaidTax,
  CasualtyLoss,
  VanishingDeductionProperty,
  PublicUseTransfer,
  FuneralExpense,
  JudicialAdminExpense,
  MedicalExpense,
  ForeignTaxCreditEntry,
  GrossEstateResult,
  OrdinaryDeductionsResult,
  ColumnValues,
} from './types';

import type { EstateTaxWizardState } from '@/types/estate-tax';

import { validateInput } from './validation';
import { detectRegime } from './regime-detection';
import { applySec87Exclusions } from './sec87-exclusions';
import { computeGrossEstate, type GrossEstateAssets } from './gross-estate';
import { computeOrdinaryDeductions } from './ordinary-deductions';
import { computeSpecialDeductions, type FamilyHomeInput } from './special-deductions';
import { computeSpouseShare } from './spouse-share';
import { computeTax } from './tax-rate';
import { computeForeignTaxCredit } from './foreign-tax-credit';
import { computeAmnesty, computeDualPathComparison } from './amnesty';
import { computeNRAFactor } from './nra-proportional';
import { generateExplainer } from './explainer';

// ── Zero helpers ────────────────────────────────────────────────────────────

function zeroCV(): ColumnValues {
  return { exclusive: 0, conjugal: 0, total: 0 };
}

function zeroGrossEstate(): GrossEstateResult {
  return {
    realProperty: zeroCV(),
    familyHome: zeroCV(),
    personalProperty: zeroCV(),
    taxableTransfers: zeroCV(),
    businessInterest: zeroCV(),
    total: zeroCV(),
  };
}

function zeroOrdinaryDeductions(): OrdinaryDeductionsResult {
  return {
    item5a_standard_deduction: zeroCV(),
    item5b_claims_against_estate: zeroCV(),
    item5c_claims_vs_insolvent: zeroCV(),
    item5d_unpaid_mortgages: zeroCV(),
    item5e_unpaid_taxes: zeroCV(),
    item5f_casualty_losses: zeroCV(),
    item5g_vanishing_deduction: zeroCV(),
    item5h_transfers_for_public_use: zeroCV(),
    total: zeroCV(),
  };
}

function zeroTaxComputation(): TaxComputationResult {
  return {
    netTaxableEstate: 0,
    estateTaxDue: 0,
    foreignTaxCredit: 0,
    netEstateTaxDue: 0,
    graduatedBracket: null,
    amnestyTrack: null,
    previouslyDeclaredNet: null,
    amnestyTaxBase: null,
    computedAmnestyTax: null,
    minimumApplied: false,
  };
}

// ── wizardStateToEngineInput ────────────────────────────────────────────────

/**
 * Adapter: maps wizard state types → engine input types.
 * Wizard stores monetary values in pesos; engine uses centavos.
 * All monetary fields are multiplied by 100 at this boundary.
 *
 * The multiplication itself now lives in `frontend/src/types/money-units.ts`, the
 * single implementation of peso↔centavo conversion in the frontend; this function is
 * the only place in the frontend permitted to cross between the two units.
 */
export function wizardStateToEngineInput(wizardState: EstateTaxWizardState): EngineInput {
  const ws = wizardState;
  /** Convert pesos → centavos, through the one shared implementation. */
  const toCentavos = (pesos: Pesos | null | undefined): Centavos =>
    pesosToCentavos(pesos ?? asPesos(0));

  // Decedent
  const isMarried = ws.decedent.maritalStatus === 'married';
  const isNRA = ws.decedent.isNonResidentAlien;
  const isFilipino = ws.decedent.citizenship === 'Filipino';

  const decedent: DecedentInfo = {
    name: ws.decedent.name,
    tin: '', // Not in wizard state
    dateOfDeath: ws.decedent.dateOfDeath,
    isResident: !isNRA,
    isFilipino,
    isNRA,
    isMarried,
    worldwideGrossEstate: toCentavos(ws.decedent.worldwideGrossEstate),
  };

  // Executor
  const executor: ExecutorInfo = {
    name: ws.executor.name,
    tin: ws.executor.tin,
    address: '', // Not in wizard state
  };

  // Estate flags (from filing data)
  const estateFlags: EstateFlags = {
    hasConjugalAssets: isMarried,
    hasFamilyHome: ws.realProperties.some((p) => p.isFamilyHome),
    hasNRAAssets: isNRA,
    hasForeignAssets: false, // Not directly in wizard state
    priorReturnFiled: ws.filing.priorReturnFiled,
    previouslyDeclaredNetEstate: toCentavos(ws.filing.previouslyDeclaredNetEstate),
    taxFullyPaidBeforeMay2022: ws.filing.taxFullyPaidBeforeMay2022,
    subjectToPCGGJurisdiction: ws.filing.hasPcggViolation,
    hasRA3019Violations: ws.filing.hasRa3019Violation,
    hasRA9160Violations: ws.filing.hasRa9160Violation,
    hasPendingCourtCasePreAmnestyAct: ws.filing.hasPendingCourtCasePreAmnestyAct,
    hasUnexplainedWealthCases: ws.filing.hasUnexplainedWealthCases,
    hasPendingRPCFelonies: ws.filing.hasPendingRPCFelonies,
  };

  // Real properties
  const realProperties: RealProperty[] = ws.realProperties.map((p) => ({
    description: `${p.classification} property at ${p.location}`,
    location: p.location,
    ownershipType: normalizeOwnership(p.ownership),
    fmvTaxDeclaration: toCentavos(p.fmvTaxDec),
    fmvBir: toCentavos(p.fmvBirZonal),
    isDesignatedFamilyHome: p.isFamilyHome,
  }));

  // Personal properties → financial + tangible split
  const financialSubtypes = new Set(['cash', 'bank_deposit', 'receivable', 'shares', 'bonds']);
  const personalPropertiesFinancial: PersonalPropertyFinancial[] = ws.personalProperties
    .filter((p) => financialSubtypes.has(p.subtype))
    .map((p) => ({
      description: p.description,
      ownershipType: normalizeOwnership(p.ownership),
      fmv: toCentavos(p.fmv),
    }));
  const personalPropertiesTangible: PersonalPropertyTangible[] = ws.personalProperties
    .filter((p) => !financialSubtypes.has(p.subtype))
    .map((p) => ({
      description: p.description,
      ownershipType: normalizeOwnership(p.ownership),
      fmv: toCentavos(p.fmv),
    }));

  // Taxable transfers
  const taxableTransfers: TaxableTransfer[] = ws.otherAssets.taxableTransfers.map((t) => ({
    description: t.description,
    transferType: t.type,
    fmvAtDeath: toCentavos(t.fmv),
    considerationReceived: 0, // Not in wizard state; user provides net fmv
    ownershipType: 'exclusive' as const,
  }));

  // Business interests
  const businessInterests: BusinessInterest[] = ws.otherAssets.businessInterests.map((b) => ({
    description: b.description,
    ownershipType: 'exclusive' as const,
    netEquity: toCentavos(b.fmv),
  }));

  // Sec. 87 exempt assets
  const sec87ExemptAssets: Sec87ExemptAsset[] = ws.otherAssets.exemptAssets.map((e) => ({
    description: e.description,
    exemptionType: e.legalBasis,
    fmv: toCentavos(e.fmv),
  }));

  // Claims against estate
  const claimsAgainstEstate: ClaimAgainstEstate[] = ws.ordinaryDeductions.claimsAgainstEstate.map(
    (item) => ({
      description: item.description,
      ownershipType: 'exclusive' as const,
      amount: toCentavos(item.amount),
    }),
  );

  // Claims vs insolvent
  const claimsVsInsolvent: ClaimVsInsolvent[] = ws.ordinaryDeductions.claimsAgainstInsolvent.map(
    (item) => ({
      description: item.description,
      amount: toCentavos(item.amount),
    }),
  );

  // Unpaid mortgages
  const unpaidMortgages: UnpaidMortgage[] = ws.ordinaryDeductions.unpaidMortgages.map((m) => ({
    description: m.description,
    ownershipType: 'exclusive' as const,
    amount: toCentavos(m.amount),
  }));

  // Unpaid taxes
  const unpaidTaxes: UnpaidTax[] = ws.ordinaryDeductions.unpaidTaxes.map((t) => ({
    description: t.description,
    amount: toCentavos(t.amount),
  }));

  // Casualty losses
  const casualtyLosses: CasualtyLoss[] = ws.ordinaryDeductions.casualtyLosses.map((l) => ({
    description: l.description,
    amount: toCentavos(l.amount),
  }));

  // Vanishing deduction properties
  const vanishingDeductionProperties: VanishingDeductionProperty[] =
    ws.ordinaryDeductions.vanishingDeductionProperties.map((v) => ({
      description: v.description,
      fmvAtDeath: toCentavos(v.currentFMV),
      fmvAtPriorTransfer: toCentavos(v.priorFMV),
      priorTransferDate: v.priorTransferDate,
      priorTaxesPaid: v.priorTaxWasPaid ? 1 : 0,
      encumbrances: toCentavos(v.mortgageOnProperty),
    }));

  // Public use transfers
  const publicUseTransfers: PublicUseTransfer[] = ws.ordinaryDeductions.publicUseTransfers.map(
    (t) => ({
      description: t.description,
      amount: toCentavos(t.amount),
    }),
  );

  // Funeral expenses
  const funeralExpenses: FuneralExpense[] =
    ws.ordinaryDeductions.funeralExpenses != null && ws.ordinaryDeductions.funeralExpenses > 0
      ? [{ description: 'Funeral expenses', amount: toCentavos(ws.ordinaryDeductions.funeralExpenses) }]
      : [];

  // Judicial/admin expenses
  const judicialAdminExpenses: JudicialAdminExpense[] =
    ws.ordinaryDeductions.judicialAdminExpenses != null &&
    ws.ordinaryDeductions.judicialAdminExpenses > 0
      ? [
          {
            description: 'Judicial/admin expenses',
            amount: toCentavos(ws.ordinaryDeductions.judicialAdminExpenses),
          },
        ]
      : [];

  // Medical expenses
  const medicalExpenses: MedicalExpense[] =
    ws.specialDeductions.medicalExpenses > 0
      ? [{ description: 'Medical expenses', amount: toCentavos(ws.specialDeductions.medicalExpenses) }]
      : [];

  // RA 4917 benefits
  const ra4917Benefits =
    ws.specialDeductions.ra4917Benefits > 0
      ? [{ description: 'RA 4917 benefits', amount: toCentavos(ws.specialDeductions.ra4917Benefits) }]
      : [];

  // Foreign tax credits
  const foreignTaxCredits: (ForeignTaxCreditEntry & { foreignPropertyFMV?: Centavos })[] =
    ws.specialDeductions.foreignTaxCreditClaims.map((ftc) => ({
      country: ftc.country,
      taxPaid: toCentavos(ftc.foreignTaxPaid),
      foreignPropertyFMV: toCentavos(ftc.foreignPropertyFMV),
    }));

  // Filing info.
  //
  // Until Phase 20 this field was set from the wall clock — a `Date`
  // constructed with no argument, sliced to ten characters — and nothing read
  // it. A wall-clock
  // read makes the same fact set compute differently on a different day, which
  // contradicts the spec's first claim about this engine (fully deterministic)
  // and makes Phase 24's input hash impossible. The value is now the date the
  // lawyer entered on the Filing tab; `''` means absent, and the lateness is
  // then reported as undetermined rather than guessed. Phase 24's input hash
  // depends on this staying gone.
  const filing: FilingInfo = {
    filingDate: ws.filing.assumedFilingDate.trim(),
    rdoCode: '',
  };

  return {
    decedent,
    executor,
    estateFlags,
    userElectsAmnesty: ws.filing.userElectsAmnesty,
    useNarrowAmnestyDeductions: ws.filing.amnestyDeductionMode === 'narrow',
    realProperties,
    personalPropertiesFinancial,
    personalPropertiesTangible,
    taxableTransfers,
    businessInterests,
    sec87ExemptAssets,
    claimsAgainstEstate,
    claimsVsInsolvent,
    unpaidMortgages,
    unpaidTaxes,
    casualtyLosses,
    vanishingDeductionProperties,
    publicUseTransfers,
    funeralExpenses,
    judicialAdminExpenses,
    medicalExpenses,
    ra4917Benefits,
    foreignTaxCredits,
    filing,
  };
}

/** Normalize wizard ownership ('community' → 'conjugal'). */
function normalizeOwnership(
  ownership: 'exclusive' | 'conjugal' | 'community',
): 'exclusive' | 'conjugal' {
  return ownership === 'exclusive' ? 'exclusive' : 'conjugal';
}

// ── computeEstateTax ────────────────────────────────────────────────────────

/**
 * Full estate tax computation pipeline (spec §16).
 * Orchestrates all 14 phases from wizard state → EstateTaxFullOutput.
 */
export function computeEstateTax(wizardState: EstateTaxWizardState): EstateTaxFullOutput {
  const input = wizardStateToEngineInput(wizardState);
  return computeEstateTaxFromInput(input);
}

/**
 * Internal: run the pipeline from EngineInput.
 */
function computeEstateTaxFromInput(input: EngineInput): EstateTaxFullOutput {
  const warnings: string[] = [];

  // ── Phase 0: Input Validation ─────────────────────────────────────────
  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    // Return early with errors
    for (const err of validationErrors) {
      warnings.push(`${err.code}: ${err.message}`);
    }

    // If date is missing, we can't detect regime — return minimal output
    if (validationErrors.some((e) => e.code === 'ERR_DATE_REQUIRED')) {
      return makeErrorOutput(warnings);
    }
  }

  // ── Phase 1: Regime Detection ─────────────────────────────────────────
  const regimeDetection = detectRegime(
    input.decedent,
    input.estateFlags,
    input.userElectsAmnesty,
  );
  warnings.push(...regimeDetection.warnings);

  const { regime, deductionRules } = regimeDetection;

  // ── Phase 2: Sec. 87 Exclusions ───────────────────────────────────────
  const sec87Result = applySec87Exclusions(input.sec87ExemptAssets);

  // ── Phase 3: Gross Estate (Items 29–34) ───────────────────────────────
  const grossEstateAssets: GrossEstateAssets = {
    realProperties: input.realProperties,
    personalPropertiesFinancial: input.personalPropertiesFinancial,
    personalPropertiesTangible: input.personalPropertiesTangible,
    taxableTransfers: input.taxableTransfers,
    businessInterests: input.businessInterests,
  };

  const grossEstate = computeGrossEstate(input.decedent, grossEstateAssets);

  // ── NRA proportional factor ───────────────────────────────────────────
  let nraProportionalFactor: number | null = null;
  if (input.decedent.isNRA) {
    try {
      nraProportionalFactor = computeNRAFactor(
        true,
        grossEstate.total.total,
        input.decedent.worldwideGrossEstate ?? 0,
      );
    } catch {
      // If NRA factor computation fails, proceed without it
      nraProportionalFactor = null;
    }
  }

  // ── Phases 4-10: Ordinary Deductions ──────────────────────────────────
  const ordinaryDeductions = computeOrdinaryDeductions(
    {
      claimsAgainstEstate: input.claimsAgainstEstate,
      claimsVsInsolvent: input.claimsVsInsolvent,
      unpaidMortgages: input.unpaidMortgages,
      unpaidTaxes: input.unpaidTaxes,
      casualtyLosses: input.casualtyLosses,
      vanishingDeductionProperties: input.vanishingDeductionProperties,
      publicUseTransfers: input.publicUseTransfers,
      funeralExpenses: input.funeralExpenses,
      judicialAdminExpenses: input.judicialAdminExpenses,
    },
    deductionRules,
    grossEstate.total.total,
    input.decedent.dateOfDeath,
    nraProportionalFactor ?? undefined,
  );

  // Item 36: Estate after ordinary deductions
  const estateAfterOrdinaryExcl = Math.max(
    0,
    grossEstate.total.exclusive - ordinaryDeductions.total.exclusive,
  );
  const estateAfterOrdinaryConj = Math.max(
    0,
    grossEstate.total.conjugal - ordinaryDeductions.total.conjugal,
  );
  const estateAfterOrdinary = estateAfterOrdinaryExcl + estateAfterOrdinaryConj;

  // ── Phase 11: Special Deductions (Items 37A–37D) ──────────────────────
  // Find family home asset for special deductions
  const familyHomeProp = input.realProperties.find((p) => p.isDesignatedFamilyHome);
  let familyHomeInput: FamilyHomeInput | undefined;
  if (familyHomeProp) {
    const fmv = familyHomeProp.fmv ?? Math.max(familyHomeProp.fmvTaxDeclaration, familyHomeProp.fmvBir);
    familyHomeInput = {
      fmv,
      ownershipType: familyHomeProp.ownershipType,
      hasCertification: true, // Assume certification if family home is designated
    };
  }

  const ra4917Amount = input.ra4917Benefits.reduce((sum, b) => sum + b.amount, 0);

  const specialDeductions = computeSpecialDeductions(
    input.decedent,
    deductionRules,
    grossEstate.total.total,
    familyHomeInput,
    input.funeralExpenses,
    input.judicialAdminExpenses,
    input.medicalExpenses,
    ra4917Amount > 0 ? ra4917Amount : undefined,
  );

  // Item 38: Net estate
  const netEstate = Math.max(0, estateAfterOrdinary - specialDeductions.total);

  // ── Phase 12: Surviving Spouse Share (Item 39) ────────────────────────
  const spouseShareResult = computeSpouseShare(
    input.decedent,
    grossEstate,
    ordinaryDeductions,
    deductionRules,
  );

  // Item 40: Net taxable estate
  const netTaxableEstate = Math.max(0, netEstate - spouseShareResult.spouseShare);

  // ── Phase 13: Tax Rate Application (Items 41–42) ──────────────────────
  let taxComputation: TaxComputationResult;

  if (regime === 'AMNESTY') {
    taxComputation = computeAmnesty(netTaxableEstate, input.estateFlags);
  } else {
    const taxResult = computeTax(netTaxableEstate, regime);
    taxComputation = {
      netTaxableEstate,
      estateTaxDue: taxResult.estateTaxDue,
      foreignTaxCredit: 0, // Set after Phase 14
      netEstateTaxDue: taxResult.estateTaxDue, // Updated after Phase 14
      graduatedBracket: taxResult.graduatedBracket,
      amnestyTrack: null,
      previouslyDeclaredNet: null,
      amnestyTaxBase: null,
      computedAmnestyTax: null,
      minimumApplied: false,
    };
  }

  // ── Phase 14: Foreign Tax Credit (Items 43–44) ────────────────────────
  const foreignTaxCredit = computeForeignTaxCredit(
    input.decedent,
    regime,
    input.foreignTaxCredits,
    grossEstate.total.total,
    taxComputation.estateTaxDue,
  );

  taxComputation.foreignTaxCredit = foreignTaxCredit;
  taxComputation.netEstateTaxDue = Math.max(0, taxComputation.estateTaxDue - foreignTaxCredit);

  // ── Dual Path Comparison ──────────────────────────────────────────────
  let dualPathComparison = null;
  if (regimeDetection.displayDualPath && regime === 'AMNESTY') {
    // Run pre-TRAIN computation for comparison
    const preTRAINTaxResult = computeTax(netTaxableEstate, 'PRE_TRAIN');
    const preTRAINComputation: TaxComputationResult = {
      netTaxableEstate,
      estateTaxDue: preTRAINTaxResult.estateTaxDue,
      foreignTaxCredit: 0,
      netEstateTaxDue: preTRAINTaxResult.estateTaxDue,
      graduatedBracket: preTRAINTaxResult.graduatedBracket,
      amnestyTrack: null,
      previouslyDeclaredNet: null,
      amnestyTaxBase: null,
      computedAmnestyTax: null,
      minimumApplied: false,
    };
    dualPathComparison = computeDualPathComparison(taxComputation, preTRAINComputation);
  }

  // ── Generate Explainer ────────────────────────────────────────────────
  const explainer = generateExplainer({
    decedentName: input.decedent.name,
    dateOfDeath: input.decedent.dateOfDeath,
    regimeDetection,
    grossEstate,
    ordinaryDeductions,
    specialDeductions,
    spouseShare: spouseShareResult,
    taxComputation,
    nraProportionalFactor,
    isNRA: input.decedent.isNRA,
  });

  // A transfer for public use is NOT subtracted from the distributable estate.
  // RR 12-2018 Sec. 6(6) defines it as a bequest, legacy, devise or transfer to
  // the Government; a bequest, legacy or devise is entered in the succession
  // engine's own will.legacies or will.devises and paid out of the free portion
  // by step 7, so subtracting it here as well would pay it twice. A transfer
  // made otherwise than by will is not double-counted and needs a human.
  if (ordinaryDeductions.item5h_transfers_for_public_use.total > 0) {
    warnings.push(
      'Transfers for public use are not deducted from the distributable estate. ' +
        'The succession engine expects a bequest, legacy or devise to the Government ' +
        "to appear among the will's legacies or devises and pays it from the free " +
        'portion. A transfer made otherwise than by will requires manual review ' +
        'before the per-heir figures are relied on.',
    );
  }

  // ── Assemble schedules ────────────────────────────────────────────────
  const schedules: EstateTaxScheduleSummary = {
    schedule1_real_properties: grossEstate.realProperty.total + grossEstate.familyHome.total,
    schedule2_personal_properties: grossEstate.personalProperty.total,
    schedule3_taxable_transfers: grossEstate.taxableTransfers.total,
    schedule4_claims_deductions: ordinaryDeductions.item5b_claims_against_estate.total +
      ordinaryDeductions.item5c_claims_vs_insolvent.total,
    schedule5_other_deductions: ordinaryDeductions.total.total,
    schedule6_net_share_spouse: spouseShareResult.spouseShare,
  };

  // ── Assemble EstateTaxFullOutput ──────────────────────────────────────
  return {
    // Engine pipeline results
    regimeDetection,
    sec87Exclusions: sec87Result.exclusionLog,
    grossEstate,
    ordinaryDeductions,
    estateAfterOrdinary,
    specialDeductions,
    netEstate,
    spouseShare: spouseShareResult,
    taxComputation,
    nraProportionalFactor,
    dualPathComparison,
    explainer,
    warnings,

    // Art. 908 components — the base the heirs actually divide.
    item34c_gross_estate: grossEstate.total.total,
    item35_debts_and_charges:
      ordinaryDeductions.total.total -
      ordinaryDeductions.item5g_vanishing_deduction.total -
      ordinaryDeductions.item5h_transfers_for_public_use.total,
    item39_spouse_net_share: spouseShareResult.spouseShare,
    item44_net_estate_tax_due: taxComputation.netEstateTaxDue,

    // Bridge-compatible fields.
    // Both names below are HISTORICAL and neither means what it says. They are
    // retained so `cases.tax_output_json` rows written before Phase 8 still
    // parse; the bridge no longer reads either of them.
    item40_gross_estate: netTaxableEstate, // NTE, NOT gross estate (backward compat)
    item44_total_deductions: taxComputation.netEstateTaxDue, // Net estate tax due
    tax_due: taxComputation.estateTaxDue,
    surcharges: 0,
    interest: 0,
    compromise_penalty: 0,
    total_amount_due: taxComputation.estateTaxDue, // No surcharges
    schedules,
  };
}

// ── Error output ────────────────────────────────────────────────────────────

function makeErrorOutput(warnings: string[]): EstateTaxFullOutput {
  return {
    regimeDetection: {
      regime: 'TRAIN',
      deductionRules: 'TRAIN',
      track: null,
      displayDualPath: false,
      amnestyEligible: false,
      ineligibilityReason: null,
      warnings: [],
    },
    sec87Exclusions: [],
    grossEstate: zeroGrossEstate(),
    ordinaryDeductions: zeroOrdinaryDeductions(),
    estateAfterOrdinary: 0,
    specialDeductions: {
      item37a_family_home: 0,
      item37b_funeral_expenses: 0,
      item37c_judicial_admin_expenses: 0,
      item37d_medical_expenses: 0,
      total: 0,
    },
    netEstate: 0,
    spouseShare: {
      totalConjugalAssets: 0,
      conjugalObligations: 0,
      netConjugalProperty: 0,
      spouseShare: 0,
    },
    taxComputation: zeroTaxComputation(),
    nraProportionalFactor: null,
    dualPathComparison: null,
    explainer: { sections: [] },
    warnings,
    item34c_gross_estate: 0,
    item35_debts_and_charges: 0,
    item39_spouse_net_share: 0,
    item44_net_estate_tax_due: 0,
    item40_gross_estate: 0,
    item44_total_deductions: 0,
    tax_due: 0,
    surcharges: 0,
    interest: 0,
    compromise_penalty: 0,
    total_amount_due: 0,
    schedules: {
      schedule1_real_properties: 0,
      schedule2_personal_properties: 0,
      schedule3_taxable_transfers: 0,
      schedule4_claims_deductions: 0,
      schedule5_other_deductions: 0,
      schedule6_net_share_spouse: 0,
    },
  };
}

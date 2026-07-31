/**
 * Estate Tax Engine — Types
 *
 * All monetary values are in centavos (integer) throughout the engine.
 */

// ── Primitive value types ────────────────────────────────────────────────────

/** Represents exclusive / conjugal / total breakdown — all centavos. */
export interface ColumnValues {
  exclusive: number;
  conjugal: number;
  total: number;
}

// ── Regime & classification types ───────────────────────────────────────────

export type Regime = 'TRAIN' | 'PRE_TRAIN' | 'AMNESTY';

export type DeductionRules = 'TRAIN' | 'PRE_TRAIN';

export type AmnestyTrack = 'TRACK_A' | 'TRACK_B';

export type AmnestyIneligibilityReason =
  | 'DEATH_AFTER_COVERAGE_CUTOFF'
  | 'TAX_ALREADY_PAID'
  | 'PCGG_EXCLUSION'
  | 'RA3019_EXCLUSION'
  | 'RA9160_EXCLUSION'
  | 'PENDING_COURT_CASE_EXCLUSION'
  | 'UNEXPLAINED_WEALTH_EXCLUSION'
  | 'RPC_FELONY_EXCLUSION'
  | 'USER_NOT_ELECTED';

// ── Regime detection ─────────────────────────────────────────────────────────

export interface RegimeDetectionResult {
  regime: Regime;
  deductionRules: DeductionRules;
  track: AmnestyTrack | null;
  displayDualPath: boolean;
  amnestyEligible: boolean;
  ineligibilityReason: AmnestyIneligibilityReason | null;
  warnings: string[];
}

// ── Gross estate ─────────────────────────────────────────────────────────────

/** Items 29–34: components of gross estate. */
export interface GrossEstateResult {
  /** Item 29: Real properties excluding family home */
  realProperty: ColumnValues;
  /** Item 30: Family home (0 for NRAs) */
  familyHome: ColumnValues;
  /** Item 31: Personal properties (financial + tangible combined) */
  personalProperty: ColumnValues;
  /** Item 32: Taxable transfers (net: max(0, fmv - consideration)) */
  taxableTransfers: ColumnValues;
  /** Item 33: Business interests (netEquity floored at 0) */
  businessInterest: ColumnValues;
  /** Item 34: Total gross estate */
  total: ColumnValues;
}

// ── Ordinary deductions ──────────────────────────────────────────────────────

/** Items 5A–5H ordinary deductions + total. */
export interface OrdinaryDeductionsResult {
  item5a_standard_deduction: ColumnValues;
  item5b_claims_against_estate: ColumnValues;
  item5c_claims_vs_insolvent: ColumnValues;
  item5d_unpaid_mortgages: ColumnValues;
  item5e_unpaid_taxes: ColumnValues;
  item5f_casualty_losses: ColumnValues;
  item5g_vanishing_deduction: ColumnValues;
  item5h_transfers_for_public_use: ColumnValues;
  total: ColumnValues;
}

// ── Special deductions ───────────────────────────────────────────────────────

/** Items 37A–37D special deductions + total (centavos). */
export interface SpecialDeductionsResult {
  item37a_family_home: number;
  item37b_funeral_expenses: number;
  item37c_judicial_admin_expenses: number;
  item37d_medical_expenses: number;
  total: number;
}

// ── Spouse share (Schedule 6A) ───────────────────────────────────────────────

export interface SpouseShareResult {
  totalConjugalAssets: number;
  conjugalObligations: number;
  netConjugalProperty: number;
  spouseShare: number;
}

// ── Graduated bracket (pre-TRAIN) ────────────────────────────────────────────

export interface GraduatedBracketResult {
  bracketMin: number;
  bracketMax: number | null;
  bracketRate: number;
  baseTax: number;
  excessAmount: number;
  taxOnExcess: number;
  totalTax: number;
}

// ── Tax computation ──────────────────────────────────────────────────────────

export interface TaxComputationResult {
  netTaxableEstate: number;
  estateTaxDue: number;
  foreignTaxCredit: number;
  netEstateTaxDue: number;
  // Pre-TRAIN specific
  graduatedBracket: GraduatedBracketResult | null;
  // Amnesty specific
  amnestyTrack: AmnestyTrack | null;
  previouslyDeclaredNet: number | null;
  amnestyTaxBase: number | null;
  computedAmnestyTax: number | null;
  minimumApplied: boolean;
}

// ── Dual path comparison ─────────────────────────────────────────────────────

export interface DualPathComparisonResult {
  amnestyResult: TaxComputationResult;
  preTRAINResult: TaxComputationResult;
  recommendedPath: 'AMNESTY' | 'PRE_TRAIN' | 'EQUAL';
  crossoverNTE: number;
  filingWindowClosed: boolean;
}

// ── Explainer ────────────────────────────────────────────────────────────────

export interface ExplainerSection {
  title: string;
  body: string;
}

export interface ExplainerOutput {
  sections: ExplainerSection[];
}

// ── Sec. 87 exclusions ───────────────────────────────────────────────────────

export interface Sec87ExclusionEntry {
  assetDescription: string;
  exemptionType: string;
  fmv: number;
  reason: string;
}

// ── Validation ───────────────────────────────────────────────────────────────

export interface ValidationError {
  code: string;
  message: string;
}

// ── Schedule summary (bridge-compatible) ─────────────────────────────────────

export interface EstateTaxScheduleSummary {
  schedule1_real_properties: number; // centavos
  schedule2_personal_properties: number; // centavos
  schedule3_taxable_transfers: number; // centavos
  schedule4_claims_deductions: number; // centavos
  schedule5_other_deductions: number; // centavos
  schedule6_net_share_spouse: number; // centavos
}

// ── Full engine output ───────────────────────────────────────────────────────

export interface EstateTaxFullOutput {
  // Engine pipeline results
  regimeDetection: RegimeDetectionResult;
  sec87Exclusions: Sec87ExclusionEntry[];
  grossEstate: GrossEstateResult;
  ordinaryDeductions: OrdinaryDeductionsResult;
  estateAfterOrdinary: number;
  specialDeductions: SpecialDeductionsResult;
  netEstate: number;
  spouseShare: SpouseShareResult;
  taxComputation: TaxComputationResult;
  nraProportionalFactor: number | null;
  dualPathComparison: DualPathComparisonResult | null;
  explainer: ExplainerOutput;
  warnings: string[];

  // Art. 908 components — the base the heirs actually divide.
  // Art. 908: "the value of the property left at the death of the testator,
  // deducting all debts and charges".

  /** Item 34 column C — the whole gross estate (centavos). */
  item34c_gross_estate: number;
  /**
   * Item 35 restricted to actual debts and charges of the decedent (centavos).
   *
   * The standard deduction, the family-home deduction, the RA 4917 deduction,
   * the medical deduction and the vanishing deduction are DELIBERATELY excluded:
   * none of them is a debt or a charge of the decedent, they are tax reliefs.
   * Transfers for public use are excluded because they are dispositions the
   * succession engine pays out of the free portion; subtracting them here as
   * well would pay them twice.
   */
  item35_debts_and_charges: number;
  /** Item 39 — the surviving spouse's net conjugal share, which never belonged
   *  to the estate (centavos). */
  item39_spouse_net_share: number;
  /** Item 44 — the estate tax the estate must pay, named for what it is
   *  (centavos). It is a charge on the estate under Art. 908. */
  item44_net_estate_tax_due: number;

  // Bridge-compatible fields (mirrors EstateTaxEngineOutput in tax-bridge.ts)
  item40_gross_estate: number; // centavos
  item44_total_deductions: number; // centavos
  tax_due: number; // centavos
  surcharges: number; // always 0, centavos
  interest: number; // always 0, centavos
  compromise_penalty: number; // always 0, centavos
  total_amount_due: number; // centavos
  schedules: EstateTaxScheduleSummary;
}

// ── Engine input ─────────────────────────────────────────────────────────────

/** Individual asset entries */

export interface RealProperty {
  description: string;
  location: string;
  ownershipType: 'exclusive' | 'conjugal';
  /** FMV per tax declaration (centavos). Engine computes fmv = max(fmvTaxDeclaration, fmvBir). */
  fmvTaxDeclaration: number;
  /** Zonal value per BIR (centavos). */
  fmvBir: number;
  /** Pre-computed FMV override; if provided, engine uses this instead of max(fmvTaxDeclaration, fmvBir). */
  fmv?: number; // centavos, optional override
  isDesignatedFamilyHome: boolean;
}

export interface PersonalPropertyFinancial {
  description: string;
  ownershipType: 'exclusive' | 'conjugal';
  fmv: number; // centavos
}

export interface PersonalPropertyTangible {
  description: string;
  ownershipType: 'exclusive' | 'conjugal';
  fmv: number; // centavos
}

export interface TaxableTransfer {
  description: string;
  transferType: string;
  /** FMV at date of death (centavos). */
  fmvAtDeath: number;
  /** Consideration received (centavos). Engine computes taxableAmount = max(0, fmvAtDeath - considerationReceived). */
  considerationReceived: number;
  /** Pre-computed FMV override (optional). */
  fmv?: number; // centavos, optional
  /** Ownership column. Defaults to exclusive if not specified. */
  ownershipType?: 'exclusive' | 'conjugal';
}

export interface BusinessInterest {
  description: string;
  ownershipType: 'exclusive' | 'conjugal';
  /** Net equity (centavos). Engine floors at 0. */
  netEquity: number;
  /** Pre-computed FMV override (optional). */
  fmv?: number; // centavos, optional
}

export interface Sec87ExemptAsset {
  description: string;
  exemptionType: string;
  fmv: number; // centavos
}

/** Individual deduction entries */

export interface ClaimAgainstEstate {
  description: string;
  ownershipType: 'exclusive' | 'conjugal';
  amount: number; // centavos
}

export interface ClaimVsInsolvent {
  description: string;
  amount: number; // centavos
}

export interface UnpaidMortgage {
  description: string;
  ownershipType: 'exclusive' | 'conjugal';
  amount: number; // centavos
}

export interface UnpaidTax {
  description: string;
  amount: number; // centavos
}

export interface CasualtyLoss {
  description: string;
  amount: number; // centavos
}

export interface VanishingDeductionProperty {
  description: string;
  fmvAtDeath: number; // centavos
  fmvAtPriorTransfer: number; // centavos
  priorTransferDate: string; // ISO date
  priorTaxesPaid: number; // centavos
  encumbrances: number; // centavos
}

export interface PublicUseTransfer {
  description: string;
  amount: number; // centavos
}

export interface FuneralExpense {
  description: string;
  amount: number; // centavos
}

export interface JudicialAdminExpense {
  description: string;
  amount: number; // centavos
}

export interface MedicalExpense {
  description: string;
  amount: number; // centavos
}

export interface Ra4917Benefit {
  description: string;
  amount: number; // centavos
}

export interface ForeignTaxCreditEntry {
  country: string;
  taxPaid: number; // centavos
}

/** Decedent info */
export interface DecedentInfo {
  name: string;
  tin: string;
  dateOfDeath: string; // ISO date
  isResident: boolean;
  isFilipino: boolean;
  isNRA: boolean; // non-resident alien
  isMarried: boolean;
  /** Required when isNRA = true; total worldwide gross estate in centavos. */
  worldwideGrossEstate?: number | null;
}

/** Executor info */
export interface ExecutorInfo {
  name: string;
  tin: string;
  address: string;
}

/** Estate flags */
export interface EstateFlags {
  hasConjugalAssets: boolean;
  hasFamilyHome: boolean;
  hasNRAAssets: boolean;
  hasForeignAssets: boolean;
  /** Track B amnesty: a prior estate tax return was filed. */
  priorReturnFiled?: boolean;
  /** Required when priorReturnFiled = true; centavos. */
  previouslyDeclaredNetEstate?: number | null;
  /** RA 11213 exclusions */
  taxFullyPaidBeforeMay2022?: boolean;
  subjectToPCGGJurisdiction?: boolean;
  hasRA3019Violations?: boolean;
  hasRA9160Violations?: boolean;
  hasPendingCourtCasePreAmnestyAct?: boolean;
  hasUnexplainedWealthCases?: boolean;
  hasPendingRPCFelonies?: boolean;
}

/** Filing info */
export interface FilingInfo {
  filingDate: string; // ISO date
  rdoCode: string;
}

/**
 * Top-level engine input (spec §5.6).
 * Distinct from wizard state — all monetary fields in centavos.
 */
export interface EngineInput {
  decedent: DecedentInfo;
  executor: ExecutorInfo;
  estateFlags: EstateFlags;
  userElectsAmnesty: boolean;
  useNarrowAmnestyDeductions: boolean;

  // Asset arrays
  realProperties: RealProperty[];
  personalPropertiesFinancial: PersonalPropertyFinancial[];
  personalPropertiesTangible: PersonalPropertyTangible[];
  taxableTransfers: TaxableTransfer[];
  businessInterests: BusinessInterest[];
  sec87ExemptAssets: Sec87ExemptAsset[];

  // Deduction arrays
  claimsAgainstEstate: ClaimAgainstEstate[];
  claimsVsInsolvent: ClaimVsInsolvent[];
  unpaidMortgages: UnpaidMortgage[];
  unpaidTaxes: UnpaidTax[];
  casualtyLosses: CasualtyLoss[];
  vanishingDeductionProperties: VanishingDeductionProperty[];
  publicUseTransfers: PublicUseTransfer[];
  funeralExpenses: FuneralExpense[];
  judicialAdminExpenses: JudicialAdminExpense[];
  medicalExpenses: MedicalExpense[];
  ra4917Benefits: Ra4917Benefit[];
  foreignTaxCredits: ForeignTaxCreditEntry[];

  // Filing info
  filing: FilingInfo;
}

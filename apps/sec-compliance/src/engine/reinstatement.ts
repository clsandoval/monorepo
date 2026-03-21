export interface ReinstatementInput {
  totalPenalties: number;
}

export interface CostRange {
  min: number;
  max: number;
}

export interface ReinstatementResult {
  petitionFee: number;
  publicationEstimate: CostRange;
  professionalFeesEstimate: CostRange;
  totalEstimate: CostRange;
}

const PETITION_FEE = 3_060;
const PUBLICATION_MIN = 3_000;
const PUBLICATION_MAX = 5_000;
const PROFESSIONAL_FEES_MIN = 30_000;
const PROFESSIONAL_FEES_MAX = 100_000;

/**
 * Compute reinstatement cost estimate for a delinquent/suspended corporation.
 *
 * Fixed components (per SEC regulations):
 * - Petition fee: ₱3,060
 * - Publication (newspaper of general circulation): ₱3,000–₱5,000
 * - Professional fees (lawyer/accountant): ₱30,000–₱100,000
 *
 * Variable: totalPenalties (computed separately by the penalty engine)
 */
export function computeReinstatement(input: ReinstatementInput): ReinstatementResult {
  const { totalPenalties } = input;

  const publicationEstimate: CostRange = { min: PUBLICATION_MIN, max: PUBLICATION_MAX };
  const professionalFeesEstimate: CostRange = { min: PROFESSIONAL_FEES_MIN, max: PROFESSIONAL_FEES_MAX };

  const totalEstimate: CostRange = {
    min: totalPenalties + PETITION_FEE + PUBLICATION_MIN + PROFESSIONAL_FEES_MIN,
    max: totalPenalties + PETITION_FEE + PUBLICATION_MAX + PROFESSIONAL_FEES_MAX,
  };

  return {
    petitionFee: PETITION_FEE,
    publicationEstimate,
    professionalFeesEstimate,
    totalEstimate,
  };
}

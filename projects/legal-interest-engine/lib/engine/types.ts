export type ObligationType = 'loan_forbearance' | 'non_loan';
export type ClaimType = 'liquidated' | 'unliquidated';

export interface ComputationInput {
  obligationType: ObligationType;
  claimType: ClaimType;
  principalAmount: number; // centavos
  demandDate: string; // ISO date
  filingDate: string; // ISO date — judicial demand
  judgmentDate?: string;
  judgmentFinalityDate?: string;
  stipulatedRate?: number; // e.g. 0.12 for 12%
  targetDate: string;
  additionalAwards?: {
    moralDamages?: number; // centavos
    exemplaryDamages?: number;
    attorneysFees?: number;
  };
}

export interface ComputationPeriod {
  label: string;
  startDate: string;
  endDate: string;
  days: number;
  rateBps: number; // basis points: 600 = 6%, 1200 = 12%
  rateLabel: string;
  baseAmount: number; // centavos
  interest: number; // centavos
  legalCitation: string;
}

export interface Art2212Layer {
  accruedStipulatedInterest: number;
  startDate: string; // filing date (judicial demand)
  endDate: string;
  days: number;
  rateBps: number;
  interest: number;
  legalCitation: string;
}

export interface AdditionalAwardBreakdown {
  label: string;
  amount: number;
  startDate: string; // judgment date
  endDate: string;
  days: number;
  rateBps: number;
  interest: number;
}

export interface ComputationResult {
  input: ComputationInput;
  periods: ComputationPeriod[];
  art2212?: Art2212Layer;
  postFinality?: ComputationPeriod;
  additionalAwards?: AdditionalAwardBreakdown[];
  totalPrincipal: number;
  totalInterest: number;
  totalAdditionalAwards: number;
  totalAdditionalAwardsInterest: number;
  grandTotal: number;
}

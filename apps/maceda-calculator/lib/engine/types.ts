export interface PaymentEntry {
  date: string; // ISO date string YYYY-MM-DD
  amount: number; // in centavos (integer)
}

export interface MacedaInput {
  contractPrice: number; // centavos
  downPayment: number; // centavos
  monthlyInstallment: number; // centavos
  contractStartDate: string; // ISO date YYYY-MM-DD
  payments: PaymentEntry[];
  previousGracePeriod: boolean;
  previousGracePeriodDate?: string; // ISO date — required when previousGracePeriod is true
}

export interface GracePeriodResult {
  eligible: boolean;
  months: number; // floor(yearsPaid), 1 month per full year
  canExercise: boolean; // false if exercised within last 5 years
  nextEligibleDate?: string; // ISO date, if canExercise is false
  section4GraceDays?: number; // 60 if section4 applies
}

export interface TimelineEntry {
  year: number;
  cumulativePayments: number; // centavos
  csvPercentage: number; // 0–0.90
  csvAmount: number; // centavos
  milestone?: string; // "2-year threshold", "5-year bonus start", "cap reached"
}

export interface MacedaResult {
  eligible: boolean; // met 2-year threshold (Section 3)?
  section4: boolean; // under 2 years (Section 4 applies)
  totalPayments: number; // centavos: downPayment + sum(payments[].amount)
  yearsPaid: number; // floor(months from contractStartDate to latest payment / 12)
  csvPercentage: number; // 0.50–0.90 (0 if section4)
  csvAmount: number; // centavos: totalPayments × csvPercentage
  gracePeriod: GracePeriodResult;
  timeline: TimelineEntry[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

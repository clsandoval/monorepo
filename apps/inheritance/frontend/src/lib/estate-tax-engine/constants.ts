/**
 * Estate Tax Engine — Constants (spec §4)
 *
 * All monetary values are in centavos (integer).
 * Dates are ISO 8601 strings.
 */

// ── Regime boundary dates ────────────────────────────────────────────────────

/** TRAIN Law (RA 10963) took effect 2018-01-01. */
export const TRAIN_EFFECTIVE_DATE = '2018-01-01';

/** Estate Tax Amnesty Act (RA 11213 / RA 11569) covers deaths on or before this date. */
export const AMNESTY_COVERAGE_CUTOFF = '2022-05-31';

// ── Tax rates ────────────────────────────────────────────────────────────────

/** TRAIN flat estate tax rate: 6% */
export const TRAIN_RATE = 0.06;

/** Amnesty rate (same as TRAIN): 6% */
export const AMNESTY_RATE = 0.06;

/**
 * Amnesty minimum tax: ₱5,000 = 500,000 centavos.
 * Applied when computed amnesty tax falls below this threshold.
 */
export const AMNESTY_MINIMUM = 500_000;

// ── Standard deductions ──────────────────────────────────────────────────────

/** TRAIN standard deduction (citizens / resident aliens): ₱5,000,000 = 500,000,000 centavos */
export const STANDARD_DEDUCTION_TRAIN_CITIZEN = 500_000_000;

/** Pre-TRAIN standard deduction (citizens / resident aliens): ₱1,000,000 = 100,000,000 centavos */
export const STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN = 100_000_000;

/** Non-resident alien standard deduction: ₱500,000 = 50,000,000 centavos */
export const STANDARD_DEDUCTION_NRA = 50_000_000;

// ── Family home caps ─────────────────────────────────────────────────────────

/** TRAIN family home deduction cap: ₱10,000,000 = 1,000,000,000 centavos */
export const FAMILY_HOME_CAP_TRAIN = 1_000_000_000;

/** Pre-TRAIN family home deduction cap: ₱1,000,000 = 100,000,000 centavos */
export const FAMILY_HOME_CAP_PRE_TRAIN = 100_000_000;

// ── Medical expense cap ──────────────────────────────────────────────────────

/** Medical expense deduction cap: ₱500,000 = 50,000,000 centavos */
export const MEDICAL_EXPENSE_CAP = 50_000_000;

// ── Funeral expense rate ─────────────────────────────────────────────────────

/** Funeral expense deductible: 5% of gross estate (pre-TRAIN only) */
export const FUNERAL_RATE = 0.05;

// ── Pre-TRAIN graduated brackets ────────────────────────────────────────────

export interface PreTrainBracket {
  min: number;        // centavos, inclusive
  max: number | null; // centavos, exclusive (null = no upper bound)
  rate: number;       // marginal rate on excess over min
  baseTax: number;    // centavos, tax on prior brackets
}

/**
 * Pre-TRAIN progressive bracket table.
 * All monetary values in centavos.
 *
 * BIR Estate Tax Schedule (pre-RA 10963):
 *   ≤ ₱200,000          — exempt
 *   ₱200,001–₱500,000   — 5% of excess over ₱200,000
 *   ₱500,001–₱2,000,000 — ₱15,000 + 8% of excess over ₱500,000
 *   ₱2,000,001–₱5,000,000 — ₱135,000 + 11% of excess over ₱2,000,000
 *   ₱5,000,001–₱10,000,000 — ₱465,000 + 15% of excess over ₱5,000,000
 *   Over ₱10,000,000    — ₱1,215,000 + 20% of excess over ₱10,000,000
 */
export const PRE_TRAIN_BRACKETS: PreTrainBracket[] = [
  { min: 0,               max: 20_000_000,   rate: 0,    baseTax: 0           }, // ≤ ₱200K exempt
  { min: 20_000_000,      max: 50_000_000,   rate: 0.05, baseTax: 0           }, // ₱200K–₱500K
  { min: 50_000_000,      max: 200_000_000,  rate: 0.08, baseTax: 1_500_000   }, // ₱500K–₱2M, base ₱15K
  { min: 200_000_000,     max: 500_000_000,  rate: 0.11, baseTax: 13_500_000  }, // ₱2M–₱5M, base ₱135K
  { min: 500_000_000,     max: 1_000_000_000,rate: 0.15, baseTax: 46_500_000  }, // ₱5M–₱10M, base ₱465K
  { min: 1_000_000_000,   max: null,         rate: 0.20, baseTax: 121_500_000 }, // >₱10M, base ₱1,215K
];

// ── Vanishing deduction percentage table ─────────────────────────────────────

/**
 * Vanishing deduction percentages by year interval since prior transfer.
 * Key = number of full years elapsed (1–5).
 */
export const VD_PCT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 1.00,
  2: 0.80,
  3: 0.60,
  4: 0.40,
  5: 0.20,
};

// ── Crossover point ──────────────────────────────────────────────────────────

/**
 * NTE crossover point below which amnesty is favourable vs. pre-TRAIN graduated rate.
 * ₱1,250,000 = 125,000,000 centavos.
 */
export const PRE_TRAIN_CROSSOVER_NTE = 125_000_000;

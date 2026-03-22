import { BPS_DENOMINATOR, DAYS_PER_YEAR } from './constants';

/**
 * Computes interest using the formula:
 *   interest = (principal * rateBps * days) / (BPS_DENOMINATOR * DAYS_PER_YEAR)
 *
 * Uses BigInt arithmetic to prevent integer overflow on large principals.
 * Truncates toward zero — never rounds up against the obligor.
 *
 * @param principalCentavos - principal amount in centavos (integer)
 * @param rateBps - interest rate in basis points (e.g. 600 = 6%, 1200 = 12%)
 * @param days - number of days to compute interest for
 * @returns interest in centavos (integer, truncated toward zero)
 */
export function computeInterest(principalCentavos: number, rateBps: number, days: number): number {
  if (days === 0 || principalCentavos === 0) {
    return 0;
  }

  const numerator = BigInt(principalCentavos) * BigInt(rateBps) * BigInt(days);
  const denominator = BigInt(BPS_DENOMINATOR) * BigInt(DAYS_PER_YEAR);

  // BigInt division truncates toward zero by default
  const result = numerator / denominator;

  return Number(result);
}

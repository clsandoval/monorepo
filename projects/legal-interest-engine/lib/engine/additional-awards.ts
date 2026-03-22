import type { AdditionalAwardBreakdown, ComputationInput } from './types';
import { RATE_POST_BSP, CITATIONS } from './constants';
import { daysBetween } from './dates';
import { computeInterest } from './interest';

type AdditionalAwards = ComputationInput['additionalAwards'];

/**
 * Computes interest on additional damage awards (moral, exemplary, attorney's fees).
 *
 * Per Nacar v. Gallery Frames and Art. 2213:
 * - Damages (unliquidated) earn 6% interest from the DATE OF JUDGMENT, not demand
 * - Rate is always 6% (post-Nacar rule applies regardless of when judgment was rendered)
 *
 * @param awards - additional award amounts in centavos
 * @param judgmentDate - date judgment was rendered (ISO date)
 * @param targetDate - computation end date (ISO date)
 * @param judgmentFinalityDate - optional, not used in award interest calc
 * @returns array of AdditionalAwardBreakdown (empty if no awards)
 */
export function computeAdditionalAwards(
  awards: AdditionalAwards | undefined,
  judgmentDate: string,
  targetDate: string,
  judgmentFinalityDate?: string,
): AdditionalAwardBreakdown[] {
  if (!awards) {
    return [];
  }

  const results: AdditionalAwardBreakdown[] = [];
  const days = daysBetween(judgmentDate, targetDate);
  const rateBps = RATE_POST_BSP; // Always 6% per Nacar

  const awardEntries: Array<{ label: string; amount: number | undefined }> = [
    { label: 'Moral Damages', amount: awards.moralDamages },
    { label: 'Exemplary Damages', amount: awards.exemplaryDamages },
    { label: "Attorney's Fees", amount: awards.attorneysFees },
  ];

  for (const entry of awardEntries) {
    if (!entry.amount) {
      continue;
    }

    const interest = computeInterest(entry.amount, rateBps, days);

    results.push({
      label: entry.label,
      amount: entry.amount,
      startDate: judgmentDate,
      endDate: targetDate,
      days,
      rateBps,
      interest,
    });
  }

  return results;
}

import type { ClaimType } from './types';
import { BSP_799_EFFECTIVE } from './constants';

/**
 * Returns the number of calendar days between two ISO date strings.
 * The end date is not included (exclusive end).
 */
export function daysBetween(start: string, end: string): number {
  const startMs = Date.UTC(
    parseInt(start.slice(0, 4)),
    parseInt(start.slice(5, 7)) - 1,
    parseInt(start.slice(8, 10)),
  );
  const endMs = Date.UTC(
    parseInt(end.slice(0, 4)),
    parseInt(end.slice(5, 7)) - 1,
    parseInt(end.slice(8, 10)),
  );
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
}

/**
 * Returns the date from which interest begins to accrue.
 *
 * - Liquidated claims: interest runs from extrajudicial demand date (Art. 1169)
 * - Unliquidated claims: interest runs from judgment date (Art. 2213)
 */
export function getInterestStartDate(
  claimType: ClaimType,
  demandDate: string,
  filingDate: string,
  judgmentDate?: string,
): string {
  if (claimType === 'liquidated') {
    return demandDate;
  }

  // unliquidated
  if (!judgmentDate) {
    throw new Error(
      'judgmentDate is required for unliquidated claims — interest starts from judgment date per Art. 2213',
    );
  }
  return judgmentDate;
}

/**
 * Splits a date range into sub-periods at the BSP 799 transition (July 1, 2013).
 *
 * Returns an array of periods with `regime: 'pre' | 'post'`.
 * - 'pre' means pre-BSP 799 (before July 1, 2013)
 * - 'post' means post-BSP 799 (on or after July 1, 2013)
 */
export function splitPeriodsAtTransition(
  start: string,
  end: string,
): Array<{ start: string; end: string; regime: 'pre' | 'post' }> {
  // If start is already on or after transition, entire period is post-BSP
  if (start >= BSP_799_EFFECTIVE) {
    return [{ start, end, regime: 'post' }];
  }

  // If end is before transition date, entire period is pre-BSP
  // The day before BSP_799_EFFECTIVE is 2013-06-30
  const dayBeforeTransition = '2013-06-30';
  if (end <= dayBeforeTransition) {
    return [{ start, end, regime: 'pre' }];
  }

  // Spans the transition — split into two periods
  return [
    { start, end: dayBeforeTransition, regime: 'pre' },
    { start: BSP_799_EFFECTIVE, end, regime: 'post' },
  ];
}

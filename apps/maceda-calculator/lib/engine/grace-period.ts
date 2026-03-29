import { addYears, isAfter, parseISO, format } from "date-fns";
import type { GracePeriodResult } from "./types";

export function computeGracePeriod(
  yearsPaid: number,
  previousGracePeriod: boolean,
  previousGracePeriodDate?: string,
  asOfDate?: string
): GracePeriodResult {
  if (yearsPaid < 2) {
    return { eligible: false, months: 0, canExercise: false, section4GraceDays: 60 };
  }

  const months = Math.floor(yearsPaid);
  let canExercise = true;
  let nextEligibleDate: string | undefined;

  if (previousGracePeriod && previousGracePeriodDate) {
    const prevDate = parseISO(previousGracePeriodDate);
    const eligible = addYears(prevDate, 5);
    const now = asOfDate ? parseISO(asOfDate) : new Date();
    if (isAfter(eligible, now)) {
      canExercise = false;
      nextEligibleDate = format(eligible, "yyyy-MM-dd");
    }
  }

  return { eligible: true, months, canExercise, nextEligibleDate };
}

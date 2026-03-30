import { z } from "zod/v4";

// --------------- Types ---------------

export type DelinquentYear = {
  calendarYear: number;
  annualRptSeF: number; // centavos
};

export type YearBreakdown = {
  calendarYear: number;
  principal: number;       // centavos
  monthsDelinquent: number;
  penaltyRate: number;     // percentage 0–72
  penaltyAmount: number;   // centavos
};

export type AmnestyResult = {
  principalDue: number;        // centavos
  penaltiesWaived: number;     // centavos
  totalWithoutAmnesty: number; // centavos
  savingsRate: number;         // percentage 0–100
  breakdown: YearBreakdown[];
};

// --------------- Constants ---------------

export const AMNESTY_DEADLINE = new Date("2026-07-05T00:00:00");
export const AMNESTY_CUTOFF = new Date("2024-07-05T00:00:00");
export const PENALTY_RATE_PER_MONTH = 0.02; // 2%
export const PENALTY_CAP = 0.72; // 72%
export const MIN_YEAR = 1991;
export const MAX_YEAR = 2024;

// --------------- Validation ---------------

export const delinquentYearSchema = z.object({
  calendarYear: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
  annualRptSeF: z.number().int().min(1).max(999_999_999),
});

export const calculatorSchema = z.object({
  years: z.array(delinquentYearSchema).min(1).max(30),
});

// --------------- Formatting ---------------

export function formatCentavos(cents: number): string {
  const pesos = cents / 100;
  const hasCentavos = cents % 100 !== 0;
  const formatted = pesos.toLocaleString("en-US", {
    minimumFractionDigits: hasCentavos ? 2 : 0,
    maximumFractionDigits: hasCentavos ? 2 : 0,
  });
  return `₱${formatted}`;
}

// --------------- Deadline ---------------

export function getDaysUntilDeadline(today: Date = new Date()): number {
  const deadline = new Date("2026-07-05T00:00:00");
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const diffMs = deadline.getTime() - todayMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// --------------- Month Counting ---------------

/**
 * Counts months from Jan 1 of the delinquent year to the amnesty CUTOFF (July 5, 2024).
 * NOT to the deadline. Penalties accrue until the cutoff date, then are frozen.
 * RPT is due on Jan 1 of each year, so delinquency starts immediately.
 */
export function getMonthsDelinquent(calendarYear: number): number {
  const dueDate = new Date(calendarYear, 0, 1); // Jan 1 of that year
  const deadline = AMNESTY_CUTOFF; // July 5, 2024 — penalties accrue until cutoff, not deadline
  const months =
    (deadline.getFullYear() - dueDate.getFullYear()) * 12 +
    (deadline.getMonth() - dueDate.getMonth());
  return Math.max(0, months);
}

// --------------- Penalty Computation ---------------

export function computeYearPenalty(
  year: DelinquentYear,
  monthsDelinquent: number
): YearBreakdown {
  const rawRate = monthsDelinquent * PENALTY_RATE_PER_MONTH;
  const cappedRate = Math.min(rawRate, PENALTY_CAP);
  const penaltyRate = Math.round(cappedRate * 100); // as integer percentage
  const penaltyAmount = Math.round(year.annualRptSeF * cappedRate);

  return {
    calendarYear: year.calendarYear,
    principal: year.annualRptSeF,
    monthsDelinquent,
    penaltyRate,
    penaltyAmount,
  };
}

// --------------- Amnesty Computation ---------------

export function computeAmnesty(years: DelinquentYear[]): AmnestyResult {
  const sorted = [...years].sort((a, b) => a.calendarYear - b.calendarYear);

  const breakdown = sorted.map((year) => {
    const months = getMonthsDelinquent(year.calendarYear);
    return computeYearPenalty(year, months);
  });

  const principalDue = breakdown.reduce((sum, b) => sum + b.principal, 0);
  const penaltiesWaived = breakdown.reduce(
    (sum, b) => sum + b.penaltyAmount,
    0
  );
  const totalWithoutAmnesty = principalDue + penaltiesWaived;
  const savingsRate =
    totalWithoutAmnesty > 0
      ? (penaltiesWaived / totalWithoutAmnesty) * 100
      : 0;

  return {
    principalDue,
    penaltiesWaived,
    totalWithoutAmnesty,
    savingsRate,
    breakdown,
  };
}

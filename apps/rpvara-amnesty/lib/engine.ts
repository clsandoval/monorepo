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

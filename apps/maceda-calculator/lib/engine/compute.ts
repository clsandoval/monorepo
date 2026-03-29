import { differenceInMonths, parseISO } from "date-fns";
import type { MacedaInput, MacedaResult, TimelineEntry } from "./types";
import { computeCsv } from "./csv";
import { computeGracePeriod } from "./grace-period";

export function compute(input: MacedaInput): MacedaResult {
  const totalPayments = input.downPayment + input.payments.reduce((sum, p) => sum + p.amount, 0);

  const sortedDates = input.payments.map((p) => p.date).sort().reverse();
  const latestPaymentDate = sortedDates[0];

  const contractStart = parseISO(input.contractStartDate);
  const latestPayment = parseISO(latestPaymentDate);
  const monthsDiff = differenceInMonths(latestPayment, contractStart);
  const yearsPaid = Math.floor(monthsDiff / 12);

  const csv = computeCsv(totalPayments, yearsPaid);
  const gracePeriod = computeGracePeriod(yearsPaid, input.previousGracePeriod, input.previousGracePeriodDate);

  const eligible = yearsPaid >= 2;
  const section4 = !eligible;

  const timeline: TimelineEntry[] = [];
  const monthlyAmount = input.monthlyInstallment;

  for (let y = 1; y <= yearsPaid; y++) {
    const cumulativePayments = input.downPayment + monthlyAmount * 12 * y;
    const yearCsv = computeCsv(cumulativePayments, y);

    let milestone: string | undefined;
    if (y === 2) milestone = "2-year threshold";
    if (y === 6) milestone = "5-year bonus start";
    if (yearCsv.percentage >= 0.9 && computeCsv(cumulativePayments, y - 1).percentage < 0.9) {
      milestone = "cap reached";
    }

    timeline.push({
      year: y,
      cumulativePayments,
      csvPercentage: yearCsv.percentage,
      csvAmount: yearCsv.amount,
      milestone,
    });
  }

  return { eligible, section4, totalPayments, yearsPaid, csvPercentage: csv.percentage, csvAmount: csv.amount, gracePeriod, timeline };
}

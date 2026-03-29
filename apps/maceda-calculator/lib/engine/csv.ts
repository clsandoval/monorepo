interface CsvResult {
  percentage: number;
  amount: number;
}

export function computeCsv(totalPayments: number, yearsPaid: number): CsvResult {
  if (yearsPaid < 2) {
    return { percentage: 0, amount: 0 };
  }
  const bonusYears = Math.max(0, yearsPaid - 5);
  const percentage = Math.min(0.9, 0.5 + 0.05 * bonusYears);
  const amount = Math.round(totalPayments * percentage);
  return { percentage, amount };
}

import { describe, it, expect } from "vitest";
import { compute } from "../compute";
import type { MacedaInput } from "../types";

function makeRegularPayments(startDate: string, monthlyAmount: number, months: number) {
  const payments = [];
  const [year, month] = startDate.split("-").map(Number);
  for (let i = 0; i < months; i++) {
    const m = ((month - 1 + i) % 12) + 1;
    const y = year + Math.floor((month - 1 + i) / 12);
    payments.push({
      date: `${y}-${String(m).padStart(2, "0")}-15`,
      amount: monthlyAmount,
    });
  }
  return payments;
}

describe("compute", () => {
  it("computes Section 3 result for 7 years of payments", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2019-01-15",
      payments: makeRegularPayments("2019-02-15", 15_000_00, 84),
      previousGracePeriod: false,
    };
    const result = compute(input);
    expect(result.totalPayments).toBe(1_510_000_00);
    expect(result.yearsPaid).toBe(7);
    expect(result.eligible).toBe(true);
    expect(result.section4).toBe(false);
    expect(result.csvPercentage).toBe(0.6);
    expect(result.csvAmount).toBe(906_000_00);
    expect(result.gracePeriod.eligible).toBe(true);
    expect(result.gracePeriod.months).toBe(7);
    expect(result.gracePeriod.canExercise).toBe(true);
  });

  it("computes Section 4 result for under 2 years", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2025-06-15",
      payments: makeRegularPayments("2025-07-15", 15_000_00, 8),
      previousGracePeriod: false,
    };
    const result = compute(input);
    expect(result.eligible).toBe(false);
    expect(result.section4).toBe(true);
    expect(result.csvPercentage).toBe(0);
    expect(result.csvAmount).toBe(0);
    expect(result.gracePeriod.eligible).toBe(false);
    expect(result.gracePeriod.section4GraceDays).toBe(60);
  });

  it("computes exactly 2 years — Section 3 applies", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2024-01-15",
      payments: makeRegularPayments("2024-02-15", 15_000_00, 24),
      previousGracePeriod: false,
    };
    const result = compute(input);
    expect(result.yearsPaid).toBe(2);
    expect(result.eligible).toBe(true);
    expect(result.csvPercentage).toBe(0.5);
  });

  it("caps CSV at 90% for 15 years", () => {
    const input: MacedaInput = {
      contractPrice: 5_000_000_00,
      downPayment: 500_000_00,
      monthlyInstallment: 20_000_00,
      contractStartDate: "2011-01-15",
      payments: makeRegularPayments("2011-02-15", 20_000_00, 180),
      previousGracePeriod: false,
    };
    const result = compute(input);
    expect(result.csvPercentage).toBe(0.9);
  });

  it("generates timeline entries", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2019-01-15",
      payments: makeRegularPayments("2019-02-15", 15_000_00, 84),
      previousGracePeriod: false,
    };
    const result = compute(input);
    expect(result.timeline.length).toBe(7);
    expect(result.timeline[0].year).toBe(1);
    expect(result.timeline[1].year).toBe(2);
    const year2 = result.timeline.find((e) => e.year === 2);
    expect(year2?.milestone).toBe("2-year threshold");
    const year6 = result.timeline.find((e) => e.year === 6);
    expect(year6?.milestone).toBe("5-year bonus start");
  });
});

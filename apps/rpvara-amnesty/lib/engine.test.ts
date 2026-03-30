import { describe, it, expect } from "vitest";
import { formatCentavos, getDaysUntilDeadline, computeYearPenalty, computeAmnesty } from "./engine";

describe("formatCentavos", () => {
  it("formats zero", () => {
    expect(formatCentavos(0)).toBe("₱0");
  });

  it("formats small amount without decimals", () => {
    expect(formatCentavos(100_00)).toBe("₱100");
  });

  it("formats with thousands separator", () => {
    expect(formatCentavos(15_000_00)).toBe("₱15,000");
  });

  it("formats large amount", () => {
    expect(formatCentavos(1_000_000_00)).toBe("₱1,000,000");
  });

  it("formats centavos when present", () => {
    expect(formatCentavos(15_000_50)).toBe("₱15,000.50");
  });
});

describe("getDaysUntilDeadline", () => {
  it("returns positive number before deadline", () => {
    const days = getDaysUntilDeadline(new Date("2026-03-30"));
    expect(days).toBe(97);
  });

  it("returns 0 on deadline day", () => {
    const days = getDaysUntilDeadline(new Date("2026-07-05"));
    expect(days).toBe(0);
  });

  it("returns negative after deadline", () => {
    const days = getDaysUntilDeadline(new Date("2026-07-06"));
    expect(days).toBe(-1);
  });
});

describe("computeYearPenalty", () => {
  it("computes penalty within cap (12 months)", () => {
    const result = computeYearPenalty(
      { calendarYear: 2023, annualRptSeF: 15_000_00 },
      12
    );
    expect(result.principal).toBe(15_000_00);
    expect(result.monthsDelinquent).toBe(12);
    expect(result.penaltyRate).toBe(24); // 2% × 12 = 24%
    expect(result.penaltyAmount).toBe(3_600_00); // 15000 × 0.24
  });

  it("caps penalty at 72% (36 months)", () => {
    const result = computeYearPenalty(
      { calendarYear: 2021, annualRptSeF: 15_000_00 },
      36
    );
    expect(result.penaltyRate).toBe(72);
    expect(result.penaltyAmount).toBe(10_800_00); // 15000 × 0.72
  });

  it("caps penalty at 72% even above 36 months", () => {
    const result = computeYearPenalty(
      { calendarYear: 2019, annualRptSeF: 15_000_00 },
      66
    );
    expect(result.penaltyRate).toBe(72);
    expect(result.penaltyAmount).toBe(10_800_00);
  });

  it("handles exactly 36 months (cap boundary)", () => {
    const result = computeYearPenalty(
      { calendarYear: 2022, annualRptSeF: 15_000_00 },
      36
    );
    expect(result.penaltyRate).toBe(72);
    expect(result.penaltyAmount).toBe(10_800_00);
  });

  it("handles large amounts without overflow", () => {
    const result = computeYearPenalty(
      { calendarYear: 2020, annualRptSeF: 1_000_000_00 },
      40
    );
    expect(result.penaltyRate).toBe(72);
    expect(result.penaltyAmount).toBe(720_000_00);
  });
});

describe("computeAmnesty", () => {
  it("computes single year", () => {
    const result = computeAmnesty([
      { calendarYear: 2023, annualRptSeF: 15_000_00 },
    ]);
    expect(result.principalDue).toBe(15_000_00);
    expect(result.penaltiesWaived).toBeGreaterThan(0);
    expect(result.totalWithoutAmnesty).toBe(
      result.principalDue + result.penaltiesWaived
    );
    expect(result.breakdown).toHaveLength(1);
  });

  it("computes multi-year principal correctly", () => {
    const result = computeAmnesty([
      { calendarYear: 2021, annualRptSeF: 12_000_00 },
      { calendarYear: 2022, annualRptSeF: 15_000_00 },
      { calendarYear: 2023, annualRptSeF: 15_000_00 },
    ]);
    expect(result.principalDue).toBe(42_000_00);
  });

  it("computes 5-year worked example from design spec", () => {
    const years = [2019, 2020, 2021, 2022, 2023].map((y) => ({
      calendarYear: y,
      annualRptSeF: 15_000_00,
    }));
    const result = computeAmnesty(years);
    expect(result.principalDue).toBe(75_000_00);
    // 2019: 72% cap → 10800, 2020: 72% → 10800, 2021: 72% → 10800
    // 2022: 30 months → 60% → 9000, 2023: 18 months → 36% → 5400
    // Total penalties: 46800
    expect(result.penaltiesWaived).toBe(46_800_00);
    expect(result.totalWithoutAmnesty).toBe(121_800_00);
    // savingsRate = 46800 / 121800 * 100 ≈ 38.42
    expect(result.savingsRate).toBeCloseTo(38.42, 0);
  });

  it("sorts breakdown by year ascending", () => {
    const result = computeAmnesty([
      { calendarYear: 2023, annualRptSeF: 10_000_00 },
      { calendarYear: 2019, annualRptSeF: 10_000_00 },
      { calendarYear: 2021, annualRptSeF: 10_000_00 },
    ]);
    expect(result.breakdown[0].calendarYear).toBe(2019);
    expect(result.breakdown[1].calendarYear).toBe(2021);
    expect(result.breakdown[2].calendarYear).toBe(2023);
  });
});

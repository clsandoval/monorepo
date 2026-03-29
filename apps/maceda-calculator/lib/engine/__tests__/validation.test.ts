import { describe, it, expect } from "vitest";
import { validateInput } from "../validation";

describe("validateInput", () => {
  const validInput = {
    contractPrice: 2_500_000_00,
    downPayment: 250_000_00,
    monthlyInstallment: 15_000_00,
    contractStartDate: "2019-01-15",
    payments: [
      { date: "2019-02-15", amount: 15_000_00 },
      { date: "2019-03-15", amount: 15_000_00 },
    ],
    previousGracePeriod: false,
  };

  it("accepts valid input", () => {
    const result = validateInput(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects zero contract price", () => {
    const result = validateInput({ ...validInput, contractPrice: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("contractPrice");
  });

  it("rejects negative down payment", () => {
    const result = validateInput({ ...validInput, downPayment: -100 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("downPayment");
  });

  it("rejects empty payments array", () => {
    const result = validateInput({ ...validInput, payments: [] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("payments");
  });

  it("rejects invalid contract start date", () => {
    const result = validateInput({ ...validInput, contractStartDate: "not-a-date" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("contractStartDate");
  });

  it("rejects when previousGracePeriod is true but no date given", () => {
    const result = validateInput({ ...validInput, previousGracePeriod: true });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("previousGracePeriodDate");
  });

  it("accepts previousGracePeriod with date", () => {
    const result = validateInput({ ...validInput, previousGracePeriod: true, previousGracePeriodDate: "2022-06-01" });
    expect(result.valid).toBe(true);
  });

  it("collects multiple errors", () => {
    const result = validateInput({ ...validInput, contractPrice: 0, monthlyInstallment: -1, payments: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

import { describe, it, expect } from "vitest";
import { computeReinstatement } from "@/engine/reinstatement";

describe("computeReinstatement", () => {
  it("returns correct cost breakdown", () => {
    const result = computeReinstatement({ totalPenalties: 375000 });
    expect(result.petitionFee).toBe(3060);
    expect(result.publicationEstimate).toEqual({ min: 3000, max: 5000 });
    expect(result.professionalFeesEstimate).toEqual({ min: 30000, max: 100000 });
    expect(result.totalEstimate.min).toBe(375000 + 3060 + 3000 + 30000);
  });

  it("returns correct max total estimate", () => {
    const result = computeReinstatement({ totalPenalties: 375000 });
    expect(result.totalEstimate.max).toBe(375000 + 3060 + 5000 + 100000);
  });

  it("works with zero penalties", () => {
    const result = computeReinstatement({ totalPenalties: 0 });
    expect(result.petitionFee).toBe(3060);
    expect(result.totalEstimate.min).toBe(3060 + 3000 + 30000);
    expect(result.totalEstimate.max).toBe(3060 + 5000 + 100000);
  });
});

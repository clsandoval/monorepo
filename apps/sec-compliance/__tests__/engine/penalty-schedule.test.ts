import { describe, it, expect } from "vitest";
import { lookupPenalty } from "@/engine/penalty-schedule";

describe("lookupPenalty", () => {
  it("returns correct penalty for domestic stock, non-filing, 100k-500k bracket, 1st offense", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "100k_500k",
      offenseNumber: 1,
    });
    expect(result).toEqual({ penaltyAmount: 15000, monthlySurcharge: 1000 });
  });

  it("returns correct penalty for domestic non-stock, late filing, negative bracket, 3rd offense", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "non_stock",
      violationType: "late_filing",
      reBracket: "negative",
      offenseNumber: 3,
    });
    expect(result).toEqual({ penaltyAmount: 3500, monthlySurcharge: 500 });
  });

  it("returns zero surcharge for capital deficiency", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "capital_deficiency",
      offenseNumber: 1,
    });
    expect(result).toEqual({ penaltyAmount: 10000, monthlySurcharge: 0 });
  });

  it("caps offense number at 5 for offenses 5+", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "above_10m",
      offenseNumber: 5,
    });
    expect(result).toEqual({ penaltyAmount: 54000, monthlySurcharge: 1000 });
  });

  it("returns 6th offense with 100% surcharge on total assessed fines", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "above_10m",
      offenseNumber: 6,
    });
    expect(result.penaltyAmount).toBe(54000);
    expect(result.monthlySurcharge).toBe(1000);
    expect(result.revocationSurcharge).toBe(true);
  });

  it("uses stock table for OPC", () => {
    const stockResult = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "100k_500k",
      offenseNumber: 1,
    });
    const opcResult = lookupPenalty({
      domicile: "domestic",
      corpType: "opc",
      violationType: "non_filing",
      reBracket: "100k_500k",
      offenseNumber: 1,
    });
    expect(opcResult).toEqual(stockResult);
  });
});

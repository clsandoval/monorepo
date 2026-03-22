import { describe, it, expect } from "vitest";
import { computeCompliance } from "@/engine/compute";

describe("computeCompliance — worked example from spec", () => {
  it("matches the spec worked example end-to-end", () => {
    const result = computeCompliance({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "100k_500k",
      mc28Compliant: false,
      incorporationYear: 2018,
      currentDate: new Date("2026-03-21"),
      suspensionDate: null,
      revocationDate: null,
      filedReports: [
        { reportType: "GIS", year: 2018, status: "filed_on_time" },
        { reportType: "GIS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2018, status: "filed_on_time" },
        { reportType: "AFS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2020, status: "filed_on_time" },
        { reportType: "AFS", year: 2021, status: "filed_on_time" },
      ],
    });
    expect(result.status).toBe("delinquent");
    expect(result.totalPenalty).toBeGreaterThan(300000);
    expect(result.lineItems.length).toBeGreaterThan(0);
    expect(result.reinstatement.petitionFee).toBe(3060);
  });

  it("returns active status for a company with all filings on time", () => {
    const result = computeCompliance({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "100k_500k",
      mc28Compliant: true,
      incorporationYear: 2024,
      currentDate: new Date("2024-12-31"),
      suspensionDate: null,
      revocationDate: null,
      filedReports: [
        { reportType: "GIS", year: 2024, status: "filed_on_time" },
        { reportType: "AFS", year: 2024, status: "filed_on_time" },
      ],
    });
    expect(result.status).toBe("active");
    expect(result.reinstatement.petitionFee).toBe(3060);
  });

  it("returns suspended status when suspension date provided", () => {
    const result = computeCompliance({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "100k_500k",
      mc28Compliant: false,
      incorporationYear: 2020,
      currentDate: new Date("2026-03-21"),
      suspensionDate: new Date("2024-01-01"),
      revocationDate: null,
      filedReports: [],
    });
    expect(result.status).toBe("suspended");
  });

  it("includes boPenalties and mc28Penalty in the result", () => {
    const result = computeCompliance({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "100k_500k",
      mc28Compliant: false,
      incorporationYear: 2018,
      currentDate: new Date("2026-03-21"),
      suspensionDate: null,
      revocationDate: null,
      filedReports: [
        { reportType: "GIS", year: 2018, status: "filed_on_time" },
        { reportType: "GIS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2018, status: "filed_on_time" },
        { reportType: "AFS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2020, status: "filed_on_time" },
        { reportType: "AFS", year: 2021, status: "filed_on_time" },
      ],
    });
    expect(Array.isArray(result.boPenalties)).toBe(true);
    expect(result.mc28Penalty).toBe(20000);
  });
});

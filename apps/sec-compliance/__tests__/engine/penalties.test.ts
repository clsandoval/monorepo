import { describe, it, expect } from "vitest";
import { computePenalties } from "@/engine/penalties";

describe("computePenalties", () => {
  it("computes correct penalties for the worked example from spec", () => {
    // Domestic stock, incorporated 2018, RE 100k-500k
    // Missed GIS 2020-2023, missed AFS 2022-2023, MC28 non-compliant
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "100k_500k",
      mc28Compliant: false,
      filedReports: [
        { reportType: "GIS", year: 2018, status: "filed_on_time" },
        { reportType: "GIS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2018, status: "filed_on_time" },
        { reportType: "AFS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2020, status: "filed_on_time" },
        { reportType: "AFS", year: 2021, status: "filed_on_time" },
      ],
      incorporationYear: 2018,
      currentDate: new Date("2026-03-21"),
    });

    // GIS 2020 = 1st offense non-filing: ₱15,000 base
    const gis2020 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2020
    );
    expect(gis2020?.basePenalty).toBe(15000);
    expect(gis2020?.offenseNumber).toBe(1);

    // GIS 2021 = 2nd offense: ₱18,000
    const gis2021 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2021
    );
    expect(gis2021?.basePenalty).toBe(18000);
    expect(gis2021?.offenseNumber).toBe(2);

    // MC28 penalty = ₱20,000
    expect(result.mc28Penalty).toBe(20000);

    // Total should include base + surcharges for all missed filings + MC28
    expect(result.totalPenalty).toBeGreaterThan(300000);
  });

  it("returns zero penalties when all filings are on time", () => {
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [
        { reportType: "GIS", year: 2023, status: "filed_on_time" },
        { reportType: "AFS", year: 2023, status: "filed_on_time" },
        { reportType: "BO", year: 2023, status: "filed_on_time" },
      ],
      incorporationYear: 2023,
      currentDate: new Date("2024-01-15"),
    });
    expect(result.lineItems).toHaveLength(0);
    expect(result.totalPenalty).toBe(0);
  });

  it("treats current-year missed filings as late_filing, prior years as non_filing", () => {
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [],
      incorporationYear: 2023,
      currentDate: new Date("2024-11-15"),
    });
    const gis2023 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2023
    );
    const gis2024 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2024
    );
    expect(gis2023?.violationType).toBe("non_filing");
    expect(gis2024?.violationType).toBe("late_filing");
    expect(gis2024!.basePenalty).toBeLessThan(gis2023!.basePenalty);
  });

  it("computes BO daily penalties with 2M cap", () => {
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [
        { reportType: "GIS", year: 2020, status: "filed_on_time" },
        { reportType: "AFS", year: 2020, status: "filed_on_time" },
      ],
      incorporationYear: 2020,
      currentDate: new Date("2026-03-21"),
    });
    const bo2020 = result.boPenalties.find((i) => i.year === 2020);
    expect(bo2020?.totalPenalty).toBe(2000000); // capped
  });

  it("applies 6th offense revocation surcharge to total", () => {
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [],
      incorporationYear: 2018,
      currentDate: new Date("2026-03-21"),
    });
    const gis2023 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2023
    );
    expect(gis2023?.offenseNumber).toBe(6);
    expect(gis2023?.revocationSurcharge).toBe(true);
  });
});

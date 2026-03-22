import { describe, it, expect } from "vitest";
import { determineStatus } from "@/engine/status";

describe("determineStatus", () => {
  it("returns active when no missed filings", () => {
    const result = determineStatus({ missedFilingYears: [], suspensionDate: null, revocationDate: null });
    expect(result.status).toBe("active");
    expect(result.riskLevel).toBe("none");
  });

  it("returns delinquent after 3 consecutive years of non-filing", () => {
    const result = determineStatus({
      missedFilingYears: [2021, 2022, 2023],
      suspensionDate: null,
      revocationDate: null,
    });
    expect(result.status).toBe("delinquent");
    expect(result.riskMessage).toContain("3 consecutive");
  });

  it("returns delinquent after 5 intermittent years of non-filing", () => {
    const result = determineStatus({
      missedFilingYears: [2016, 2018, 2020, 2022, 2024],
      suspensionDate: null,
      revocationDate: null,
    });
    expect(result.status).toBe("delinquent");
    expect(result.riskMessage).toContain("5");
  });

  it("does NOT return delinquent for 2 consecutive years", () => {
    const result = determineStatus({
      missedFilingYears: [2022, 2023],
      suspensionDate: null,
      revocationDate: null,
    });
    expect(result.status).not.toBe("delinquent");
  });

  it("returns suspended when suspension date is provided", () => {
    const result = determineStatus({
      missedFilingYears: [2020, 2021, 2022],
      suspensionDate: new Date("2023-06-15"),
      revocationDate: null,
    });
    expect(result.status).toBe("suspended");
  });

  it("returns revoked when revocation date is provided", () => {
    const result = determineStatus({
      missedFilingYears: [2018, 2019, 2020, 2021, 2022, 2023],
      suspensionDate: null,
      revocationDate: new Date("2024-01-10"),
    });
    expect(result.status).toBe("revoked");
  });

  it("flags revocation risk when max offense count reaches 4-5", () => {
    const result = determineStatus({
      missedFilingYears: [2019, 2020, 2021, 2022],
      suspensionDate: null,
      revocationDate: null,
      maxOffenseCount: 5,
    });
    expect(result.riskLevel).toBe("high");
    expect(result.riskMessage).toContain("revocation");
  });
});

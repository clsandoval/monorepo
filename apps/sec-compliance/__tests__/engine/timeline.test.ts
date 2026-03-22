import { describe, it, expect } from "vitest";
import { generateExpectedFilings } from "@/engine/timeline";

describe("generateExpectedFilings", () => {
  it("generates GIS and AFS for every year from incorporation to present", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2020,
      currentYear: 2024,
    });
    const gisFilings = result.filter((f) => f.reportType === "GIS");
    const afsFilings = result.filter((f) => f.reportType === "AFS");
    expect(gisFilings).toHaveLength(5); // 2020, 2021, 2022, 2023, 2024
    expect(afsFilings).toHaveLength(5);
  });

  it("includes BO only from 2019 onward", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2015,
      currentYear: 2024,
    });
    const boFilings = result.filter((f) => f.reportType === "BO");
    expect(boFilings).toHaveLength(6); // 2019, 2020, 2021, 2022, 2023, 2024
    expect(boFilings[0].year).toBe(2019);
  });

  it("returns no BO for corps incorporated before 2019 with currentYear before 2019", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2015,
      currentYear: 2018,
    });
    const boFilings = result.filter((f) => f.reportType === "BO");
    expect(boFilings).toHaveLength(0);
  });

  it("includes correct deadlines", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2023,
      currentYear: 2023,
    });
    const gis = result.find((f) => f.reportType === "GIS");
    const afs = result.find((f) => f.reportType === "AFS");
    expect(gis?.deadline).toBe("2023-05-31");
    expect(afs?.deadline).toBe("2023-04-30");
  });
});

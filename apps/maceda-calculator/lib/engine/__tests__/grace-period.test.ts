import { describe, it, expect } from "vitest";
import { computeGracePeriod } from "../grace-period";

describe("computeGracePeriod", () => {
  it("returns section4 grace for under 2 years", () => {
    const result = computeGracePeriod(1, false);
    expect(result.eligible).toBe(false);
    expect(result.section4GraceDays).toBe(60);
    expect(result.months).toBe(0);
  });

  it("returns 2 months for 2 years", () => {
    const result = computeGracePeriod(2, false);
    expect(result.eligible).toBe(true);
    expect(result.months).toBe(2);
    expect(result.canExercise).toBe(true);
  });

  it("returns 5 months for 5 years", () => {
    const result = computeGracePeriod(5, false);
    expect(result.months).toBe(5);
  });

  it("returns 7 months for 7 years", () => {
    const result = computeGracePeriod(7, false);
    expect(result.months).toBe(7);
  });

  it("floors fractional years", () => {
    const result = computeGracePeriod(3.9, false);
    expect(result.months).toBe(3);
  });

  it("can exercise if no previous grace period", () => {
    const result = computeGracePeriod(5, false);
    expect(result.canExercise).toBe(true);
    expect(result.nextEligibleDate).toBeUndefined();
  });

  it("cannot exercise if previous grace period within 5 years", () => {
    const result = computeGracePeriod(5, true, "2024-01-15", "2026-03-23");
    expect(result.canExercise).toBe(false);
    expect(result.nextEligibleDate).toBe("2029-01-15");
  });

  it("can exercise if previous grace period over 5 years ago", () => {
    const result = computeGracePeriod(5, true, "2020-01-01", "2026-03-23");
    expect(result.canExercise).toBe(true);
  });
});

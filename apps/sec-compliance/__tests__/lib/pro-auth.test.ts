import { describe, it, expect } from "vitest";
import { isActiveSubscription, trialDaysRemaining, PLAN_LIMITS } from "@/lib/pro/types";

describe("isActiveSubscription", () => {
  it("returns true for active status", () => {
    expect(isActiveSubscription("active", "2020-01-01")).toBe(true);
  });

  it("returns true for trialing with future date", () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    expect(isActiveSubscription("trialing", future)).toBe(true);
  });

  it("returns false for expired trial", () => {
    expect(isActiveSubscription("trialing", "2020-01-01")).toBe(false);
  });

  it("returns false for past_due", () => {
    expect(isActiveSubscription("past_due", "2030-01-01")).toBe(false);
  });

  it("returns false for canceled", () => {
    expect(isActiveSubscription("canceled", "2030-01-01")).toBe(false);
  });
});

describe("trialDaysRemaining", () => {
  it("returns 0 for past date", () => {
    expect(trialDaysRemaining("2020-01-01")).toBe(0);
  });

  it("returns positive number for future date", () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    expect(trialDaysRemaining(future)).toBeGreaterThan(0);
    expect(trialDaysRemaining(future)).toBeLessThanOrEqual(8);
  });
});

describe("PLAN_LIMITS", () => {
  it("has correct limits", () => {
    expect(PLAN_LIMITS.solo).toBe(5);
    expect(PLAN_LIMITS.practice).toBe(25);
    expect(PLAN_LIMITS.firm).toBe(100);
  });
});

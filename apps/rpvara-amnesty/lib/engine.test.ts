import { describe, it, expect } from "vitest";
import { formatCentavos, getDaysUntilDeadline } from "./engine";

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

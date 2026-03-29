import { describe, it, expect } from "vitest";
import { computeCsv } from "../csv";

describe("computeCsv", () => {
  it("returns 0% for under 2 years", () => {
    const result = computeCsv(100_000_00, 1);
    expect(result.percentage).toBe(0);
    expect(result.amount).toBe(0);
  });

  it("returns 50% for exactly 2 years", () => {
    const result = computeCsv(100_000_00, 2);
    expect(result.percentage).toBe(0.5);
    expect(result.amount).toBe(50_000_00);
  });

  it("returns 50% for 3 years (flat until year 5)", () => {
    const result = computeCsv(100_000_00, 3);
    expect(result.percentage).toBe(0.5);
    expect(result.amount).toBe(50_000_00);
  });

  it("returns 50% for 5 years (last flat year)", () => {
    const result = computeCsv(100_000_00, 5);
    expect(result.percentage).toBe(0.5);
    expect(result.amount).toBe(50_000_00);
  });

  it("returns 55% for 6 years (first bonus year)", () => {
    const result = computeCsv(100_000_00, 6);
    expect(result.percentage).toBe(0.55);
    expect(result.amount).toBe(55_000_00);
  });

  it("returns 60% for 7 years", () => {
    const result = computeCsv(100_000_00, 7);
    expect(result.percentage).toBe(0.6);
    expect(result.amount).toBe(60_000_00);
  });

  it("caps at 90% for 13+ years", () => {
    const result = computeCsv(100_000_00, 13);
    expect(result.percentage).toBe(0.9);
    expect(result.amount).toBe(90_000_00);
  });

  it("caps at 90% for 20 years", () => {
    const result = computeCsv(100_000_00, 20);
    expect(result.percentage).toBe(0.9);
    expect(result.amount).toBe(90_000_00);
  });

  it("handles realistic amounts", () => {
    const result = computeCsv(1_248_000_00, 7);
    expect(result.percentage).toBe(0.6);
    expect(result.amount).toBe(748_800_00);
  });
});

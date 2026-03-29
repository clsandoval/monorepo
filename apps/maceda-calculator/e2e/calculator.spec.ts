import { test, expect } from "@playwright/test";

test.describe("Maceda Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders header and form", async ({ page }) => {
    // h1 contains "Maceda Law" — partial match works here
    await expect(page.locator("h1")).toContainText("Maceda Law");
    await expect(page.getByText("Contract Details")).toBeVisible();
    await expect(page.getByText("Payment History")).toBeVisible();
    await expect(page.getByRole("button", { name: "Calculate my rights" })).toBeVisible();
  });

  test("calculates CSV for regular payments", async ({ page }) => {
    await page.getByLabel("Contract Price").fill("2500000");
    await page.getByLabel("Down Payment").fill("250000");
    await page.getByLabel("Monthly Installment").fill("15000");
    await page.getByLabel("Contract Start Date").fill("2019-01-15");

    // Enable auto-fill
    await page.getByText("I paid regularly — auto-fill payments").click();

    // Click calculate
    await page.getByRole("button", { name: "Calculate my rights" }).click();

    // Verify results appear
    await expect(page.getByText("You are owed")).toBeVisible();
    await expect(page.getByText("Eligible for CSV refund")).toBeVisible();
    await expect(page.getByText("Grace Period", { exact: true })).toBeVisible();
    await expect(page.getByText("CSV Buildup Over Time")).toBeVisible();
  });

  test("shows Section 4 for under 2 years", async ({ page }) => {
    await page.getByLabel("Contract Price").fill("2500000");
    await page.getByLabel("Down Payment").fill("250000");
    await page.getByLabel("Monthly Installment").fill("15000");
    await page.getByLabel("Contract Start Date").fill("2025-06-15");

    await page.getByText("I paid regularly — auto-fill payments").click();
    await page.getByRole("button", { name: "Calculate my rights" }).click();

    await expect(page.getByText("Section 4 — Under 2 Years")).toBeVisible();
    await expect(page.getByText("60-day grace period")).toBeVisible();
    await expect(page.getByText("Progress to CSV eligibility")).toBeVisible();
  });

  test("calculate button is disabled without required fields", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Calculate my rights" })).toBeDisabled();
  });
});

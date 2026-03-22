import { test, expect } from "@playwright/test";

/**
 * Wizard flow E2E test — worked example:
 *   Step 1: Corp type = Stock
 *   Step 2: Incorporation year = 2018, RE bracket = 100K-500K, MC28 = unchecked
 *   Step 3: Filed GIS 2018, 2019. Filed AFS 2018, 2019, 2020, 2021. Everything else unfiled.
 *   Step 4: No suspension/revocation
 */
test("wizard flow — worked example produces results with penalty > ₱300,000", async ({
  page,
}) => {
  await page.goto("/wizard");

  // --- Step 1: Corporation Type ---
  // Select "Stock Corporation" radio
  await page.getByRole("radio", { name: /stock corporation/i }).click();

  // Next button should be enabled; advance
  await page.getByRole("button", { name: /next/i }).click();

  // --- Step 2: Corporation Details ---
  // Select incorporation year 2018
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "2018" }).click();

  // Select RE bracket 100K-500K
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: /₱100,001.*₱500,000/i }).click();

  // MC28 checkbox — leave unchecked (default)

  await page.getByRole("button", { name: /next/i }).click();

  // --- Step 3: Filing History ---
  // Check GIS 2018
  await page.getByRole("checkbox", { name: /gis 2018/i }).check();
  // Check GIS 2019
  await page.getByRole("checkbox", { name: /gis 2019/i }).check();
  // Check AFS 2018
  await page.getByRole("checkbox", { name: /afs 2018/i }).check();
  // Check AFS 2019
  await page.getByRole("checkbox", { name: /afs 2019/i }).check();
  // Check AFS 2020
  await page.getByRole("checkbox", { name: /afs 2020/i }).check();
  // Check AFS 2021
  await page.getByRole("checkbox", { name: /afs 2021/i }).check();

  await page.getByRole("button", { name: /next/i }).click();

  // --- Step 4: Suspension/Orders ---
  // No suspension or revocation — defaults are "No"; just submit

  await page.getByRole("button", { name: /view results/i }).click();

  // --- Results Page ---
  await page.waitForURL(/\/results/);
  expect(page.url()).toContain("/results");

  // Wait for results to load (spinner disappears)
  await expect(
    page.getByText(/computing your compliance status/i)
  ).toBeHidden({ timeout: 15000 });

  // Verify penalty total is visible
  const penaltyText = page.locator("text=/₱[\\d,]+/").first();
  await expect(penaltyText).toBeVisible();

  // Extract the total penalty value and verify it is > ₱300,000
  const allPenaltyLocator = page.locator("p").filter({ hasText: /^₱[\d,]+$/ });
  // The large total penalty figure uses font-display text-4xl
  const totalPenaltyEl = page
    .locator(".font-display.text-4xl, [class*='text-4xl']")
    .first();
  await expect(totalPenaltyEl).toBeVisible();

  const totalText = await totalPenaltyEl.textContent();
  const numericValue = parseInt((totalText ?? "0").replace(/[₱,]/g, ""), 10);
  expect(numericValue).toBeGreaterThan(300000);
});

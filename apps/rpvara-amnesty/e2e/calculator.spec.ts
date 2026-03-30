import { test, expect } from "@playwright/test";

test.describe("RPVARA Amnesty Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // F1.1: Page loads with deadline countdown
  test("displays deadline countdown", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(
      "Real Property Tax Amnesty Calculator"
    );
    await expect(page.getByText("days remaining").first()).toBeVisible();
    await expect(page.getByText("July 5, 2026").first()).toBeVisible();
  });

  // F1.3: Page explains what the amnesty is
  test("explains the amnesty with legal references", async ({ page }) => {
    await expect(
      page.getByText("Republic Act No. 12001").first()
    ).toBeVisible();
    await expect(page.getByText("penalties").first()).toBeVisible();
    await expect(page.getByText("July 5, 2026").first()).toBeVisible();
  });

  // F1.4: Responsive layout on mobile
  test("renders without horizontal overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByText("days remaining").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Compute Amnesty Savings" })
    ).toBeVisible();
    const body = page.locator("body");
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  // F2.1: Add delinquent years
  test("generates input rows for delinquent years", async ({ page }) => {
    const numYearsInput = page.locator("#num-years");
    await numYearsInput.fill("3");
    // Should see 3 year input fields
    const yearInputs = page.locator('input[id^="year-"]');
    await expect(yearInputs).toHaveCount(3);
  });

  // F2.3: Amount validation
  test("shows error for invalid amounts", async ({ page }) => {
    const numYearsInput = page.locator("#num-years");
    await numYearsInput.fill("1");
    await page.locator("#year-0").fill("0");
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    await expect(page.getByText("Enter a valid amount")).toBeVisible();
  });

  // F2.6: Empty form submission blocked
  test("blocks empty form submission", async ({ page }) => {
    const numYearsInput = page.locator("#num-years");
    await numYearsInput.fill("1");
    await page.locator("#year-0").fill("");
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    await expect(page.getByText("Enter a valid amount")).toBeVisible();
  });

  // F2.5 + F3.3 + F5.1 + F5.2: Multi-year computation with results
  test("computes 5-year amnesty correctly", async ({ page }) => {
    // Default is 5 years with ₱15,000 each
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();

    // F3.3: Principal displayed
    await expect(page.getByText("₱75,000").first()).toBeVisible();

    // F5.1: All result fields present
    await expect(page.getByText("You Pay (Amnesty)")).toBeVisible();
    await expect(page.getByText("You Save", { exact: true })).toBeVisible();
    await expect(page.getByText("Without amnesty")).toBeVisible();
    await expect(page.getByText("Savings rate")).toBeVisible();
    await expect(page.getByText("days remaining").first()).toBeVisible();

    // F5.3: Comparison view
    await expect(page.getByText("Penalties waived")).toBeVisible();
  });

  // F4.6: Penalties displayed as waived
  test("shows capped penalties for old delinquency", async ({ page }) => {
    const numYearsInput = page.locator("#num-years");
    await numYearsInput.fill("1");
    // Year will be 2024. Change to test a single old year by setting numYears
    // to cover 2019 (6 years back → years 2019-2024, first year is 2019)
    await numYearsInput.fill("6");
    // Set all to 15,000 (same amount is checked by default)
    await page.locator("#year-0").fill("15,000");
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();

    // Verify breakdown table shows "(capped)" for early years
    await expect(page.getByText("(capped)").first()).toBeVisible();
  });

  // F5.4: Peso formatting
  test("formats amounts with peso sign and commas", async ({ page }) => {
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    // ₱75,000 has both peso sign and comma
    await expect(page.getByText("₱75,000").first()).toBeVisible();
  });

  // F6.1: Print button exists after computation
  test("shows print button after computation", async ({ page }) => {
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    await expect(
      page.getByRole("button", { name: "Print Summary" })
    ).toBeVisible();
  });

  // F7.1: Single year, minimum amount
  test("handles minimum amount (₱1)", async ({ page }) => {
    const numYearsInput = page.locator("#num-years");
    await numYearsInput.fill("1");
    await page.locator("#year-0").fill("1");
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    await expect(page.getByText("You Pay (Amnesty)")).toBeVisible();
  });

  // F7.4: No console errors
  test("no console errors during full flow", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    await expect(page.getByText("You Pay (Amnesty)")).toBeVisible();

    expect(errors).toHaveLength(0);
  });

  // F8.1 + F8.2: Route exists and direct URL access
  test("route resolves with HTTP 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  // F9.5: Legal citations present
  test("shows legal citations", async ({ page }) => {
    await expect(
      page.getByText("Republic Act No. 12001").first()
    ).toBeVisible();
    await expect(page.getByText("Section 30").first()).toBeVisible();
  });

  // F10.1 + F10.2: FAQ section
  test("displays FAQ with critical questions", async ({ page }) => {
    await expect(
      page.getByText("When does the amnesty expire?")
    ).toBeVisible();
    await expect(
      page.getByText("Does my city or municipality need to pass an ordinance")
    ).toBeVisible();
    await expect(
      page.getByText("What years of delinquency are covered?")
    ).toBeVisible();
    await expect(page.getByText("Can I pay in installments?")).toBeVisible();
    await expect(
      page.getByText("What happens if I don't pay before July 5, 2026?")
    ).toBeVisible();
  });

  // F2.4: Comma-formatted amounts accepted
  test("accepts comma-formatted amounts", async ({ page }) => {
    const numYearsInput = page.locator("#num-years");
    await numYearsInput.fill("1");
    await page.locator("#year-0").fill("15,000");
    await page.getByRole("button", { name: "Compute Amnesty Savings" }).click();
    await expect(page.getByText("You Pay (Amnesty)")).toBeVisible();
    await expect(page.getByText("₱15,000").first()).toBeVisible();
  });
});

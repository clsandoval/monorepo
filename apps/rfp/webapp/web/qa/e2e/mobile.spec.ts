import { test, expect, type Page } from "@playwright/test";
const SHOTS = `${process.cwd()}/qa/shots/`;

test.use({ viewport: { width: 390, height: 844 } }); // iPhone-ish

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow ${overflow}px`).toBeLessThanOrEqual(2);
}

test("mobile: board lands, AI drawer opens/closes, no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  // landing is the results board: search box + rows, no chat chrome
  await expect(page.getByTestId("search-input")).toBeVisible();
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}m0-board.png`, fullPage: true });
  await noOverflow(page);

  // chat lives behind the AI Mode tab
  await page.getByTestId("tab-ai").click();
  // panel hidden by default; hamburger + empty state visible; no stray drawer content
  await expect(page.getByTestId("open-menu")).toBeVisible();
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByLabel("close menu")).toHaveCount(0); // close button not shown when closed
  await page.screenshot({ path: `${SHOTS}m1-landing.png`, fullPage: true });
  await noOverflow(page); // the "unusable" symptom

  // drawer opens on tap
  await page.getByTestId("open-menu").click();
  await expect(page.getByTestId("new-session")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}m2-drawer.png` });

  // and closes
  await page.getByLabel("close menu").click();
  await expect(page.getByTestId("open-menu")).toBeVisible();
});

import { test, expect } from "@playwright/test";
const SHOTS = `${process.cwd()}/qa/shots/`;

test.use({ viewport: { width: 390, height: 844 } }); // iPhone-ish

test("mobile: drawer opens/closes, no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  // panel hidden by default; hamburger + empty state visible; no stray drawer content
  await expect(page.getByTestId("open-menu")).toBeVisible();
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByLabel("close menu")).toHaveCount(0); // close button not shown when closed
  await page.screenshot({ path: `${SHOTS}m1-landing.png`, fullPage: true });

  // no horizontal overflow (the "unusable" symptom)
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow ${overflow}px`).toBeLessThanOrEqual(2);

  // drawer opens on tap
  await page.getByTestId("open-menu").click();
  await expect(page.getByTestId("new-session")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}m2-drawer.png` });

  // and closes
  await page.getByLabel("close menu").click();
  await expect(page.getByTestId("open-menu")).toBeVisible();
});

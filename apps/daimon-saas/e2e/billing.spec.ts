import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Billing screenshots — captures billing page states at 1280x800.
 * All test users map to the same real user (admin, free plan).
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Billing screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('103 billing free plan display', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0103_billing_free-plan_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('105 billing plan comparison grid', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0105_billing_plan-comparison-grid_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('107 billing starter plan display', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0107_billing_starter-plan_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('109 billing pro plan display', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0109_billing_pro-plan_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('115 billing past-due banner', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);

    // Intercept Supabase REST calls for tenant_subscriptions and override status
    await page.route('**/rest/v1/tenant_subscriptions*', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      const patched = Array.isArray(body)
        ? body.map((row: Record<string, unknown>) => ({ ...row, status: 'past_due' }))
        : { ...body, status: 'past_due' };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(patched),
      });
    });

    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0115_billing_past-due-banner_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('120 billing api keys section', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0120_billing_api-keys-section_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('122 billing api keys both saved', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0122_billing_api-keys-both-saved_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });
});

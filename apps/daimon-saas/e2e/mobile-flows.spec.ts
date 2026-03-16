import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Mobile forms and flows screenshots — 375x812 viewport.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Mobile forms and flows screenshots @screenshot', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile billing page plan cards stacked', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0119_mobile_billing.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('mobile settings page full-width inputs', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0120_mobile_settings.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('mobile admin page desktop-only block', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/tenants');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0121_mobile_admin.png'),
      fullPage: false,
    });
    await expect(page.locator('body')).toBeVisible();
  });

  test('mobile docs page sidebar as drawer', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0122_mobile_docs.png'),
      fullPage: false,
    });
    await expect(page.locator('article').first()).toBeVisible();
  });
});

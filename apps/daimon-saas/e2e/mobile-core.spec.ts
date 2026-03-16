import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Mobile core pages screenshots — 375x812 viewport.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Mobile core pages screenshots @screenshot', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile landing hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0113_mobile_landing_hero.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('mobile landing pricing section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="Pricing"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0114_mobile_landing_pricing.png'),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  test('mobile login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0115_mobile_login.png'),
      fullPage: false,
    });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('mobile signup page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0116_mobile_signup.png'),
      fullPage: false,
    });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('mobile dashboard with mobile nav', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0117_mobile_dashboard.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('mobile integrations service grid', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0118_mobile_integrations.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });
});

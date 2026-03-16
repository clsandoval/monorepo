import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Dashboard screenshots — captures dashboard states at 1280x800.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Dashboard screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('055 dashboard bot online', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0055_dashboard_bot-online_desktop.png'),
      fullPage: false,
    });
    // Verify dashboard loaded (main content visible)
    await expect(page.locator('main')).toBeVisible();
  });

  test('060 dashboard bot offline', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0060_dashboard_bot-offline_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('064 dashboard onboarding checklist', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0064_dashboard_onboarding-checklist_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('069 dashboard onboarding complete state', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0069_dashboard_onboarding-complete_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('061 dashboard metrics cards', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 420));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0061_dashboard_metrics-cards_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Settings screenshots — captures settings page tab states at 1280x800.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Settings screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('133 settings owner view above fold', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0133_settings_owner-view_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('138 settings workspace tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll to workspace section
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0138_settings_workspace-tab_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('142 settings discord tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll to discord section
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0142_settings_discord-tab_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('156 settings account tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0156_settings_account-tab_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('161 settings danger zone tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll to danger zone at bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0161_settings_danger-zone_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });
});

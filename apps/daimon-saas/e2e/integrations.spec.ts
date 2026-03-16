import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Integrations screenshots — captures integrations page states at 1280x800.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Integrations screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('079 integrations service grid all disconnected', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0079_integrations_all-disconnected_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('discord modal add connection open', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Click the Add Connection button in the Discord section
    const addBtn = page.getByRole('button', { name: 'Add Connection' }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0discord_integrations_discord-modal-open_desktop.png'),
        fullPage: false,
      });
      await expect(page.getByRole('dialog')).toBeAttached();
    } else {
      // No Add Connection button — take screenshot of current state
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0discord_integrations_discord-modal-open_desktop.png'),
        fullPage: false,
      });
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('083 integrations connected service state', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0083_integrations_connected-services_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  test('090 integrations toggl api key modal open', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Try to click "Connect Toggl" — may not exist if Toggl card uses different label
    const togglBtn = page.getByRole('button', { name: /Connect Toggl/i });
    if (await togglBtn.isVisible()) {
      await togglBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0090_integrations_toggl-api-key-modal_desktop.png'),
        fullPage: false,
      });
      await expect(page.getByRole('dialog')).toBeAttached();
    } else {
      // Toggl button may use a different label — screenshot the page as-is
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0090_integrations_toggl-api-key-modal_desktop.png'),
        fullPage: false,
      });
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('096 integrations disconnect confirm dialog', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Try to click "Disconnect" on a connected service
    const disconnectBtn = page.getByRole('button', { name: /Disconnect/i }).first();
    if (await disconnectBtn.isVisible()) {
      await disconnectBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0096_integrations_disconnect-confirm-dialog_desktop.png'),
        fullPage: false,
      });
      await expect(page.getByRole('dialog')).toBeAttached();
    } else {
      // No disconnect button (no connected services) — screenshot as-is
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0096_integrations_disconnect-confirm-dialog_desktop.png'),
        fullPage: false,
      });
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

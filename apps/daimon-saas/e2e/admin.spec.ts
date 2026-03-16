import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Admin screenshots — captures admin panel states at 1280x800.
 * Uses production admin user (cl@sandoval.dev has is_admin=true).
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Admin screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('167 admin tenant list loading', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);

    // Delay REST response to capture loading skeleton
    await page.route('**/rest/v1/tenants*', async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await route.continue();
    });

    await page.goto('/admin/tenants');
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0167_admin_tenants-loading_desktop.png'),
      fullPage: false,
    });
  });

  test('168 admin tenant list populated', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/tenants');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0168_admin_tenants-list_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL(/\/(admin|dashboard)/);
  });

  test('174 admin tenant detail loading', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);

    // First get a real tenant ID from the list
    await page.goto('/admin/tenants');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find the first tenant link
    const tenantLink = page.locator('a[href^="/admin/tenants/"]').first();
    const href = await tenantLink.getAttribute('href');

    if (href) {
      // Delay REST responses to capture skeleton
      await page.route('**/rest/v1/tenants*', async (route) => {
        await new Promise((r) => setTimeout(r, 4000));
        await route.continue();
      });

      await page.goto(href);
      await page.waitForTimeout(800);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0174_admin_tenant-detail-loading_desktop.png'),
      fullPage: false,
    });
  });

  test('175 admin tenant detail full view', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/tenants');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click the first tenant link
    const tenantLink = page.locator('a[href^="/admin/tenants/"]').first();
    if (await tenantLink.isVisible()) {
      await tenantLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0175_admin_tenant-detail_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL(/\/(admin|dashboard)/);
  });

  test('183 admin audit log loading', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);

    // Delay REST responses to show skeleton
    await page.route('**/rest/v1/admin_audit_log*', async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await route.continue();
    });

    await page.goto('/admin/audit-log');
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0183_admin_audit-log-loading_desktop.png'),
      fullPage: false,
    });
  });

  test('184 admin audit log populated', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/audit-log');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0184_admin_audit-log_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL(/\/(admin|dashboard)/);
  });
});

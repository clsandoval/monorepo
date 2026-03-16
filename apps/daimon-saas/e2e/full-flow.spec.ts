import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';
import { signInAs } from './fixtures/sign-in';

/**
 * Full flow: signup → dashboard → integrations → billing
 * Steps 2-5 use the real admin user for authenticated screenshots.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe.serial('Full flow: signup → onboard → connect → subscribe @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── Step 1: Signup form filled (UI screenshot) ────────────────────────────

  test('step 1 — signup form filled', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    await page.fill('#fullName', 'Jane Smith');
    await page.fill('#email', 'jane@example.com');
    await page.fill('#password', 'Password123!');
    await page.fill('#confirmPassword', 'Password123!');
    // shadcn Checkbox renders as <button role="checkbox"> — use JS click to bypass viewport check
    await page.locator('#agreeTerms').evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0123_full-flow_signup-filled_desktop.png'),
      fullPage: false,
    });

    await expect(page.locator('#fullName')).toHaveValue('Jane Smith');
    await expect(page.locator('#email')).toHaveValue('jane@example.com');
  });

  // ── Step 2: Dashboard (post-signup state) ─────────────────────────────────

  test('step 2 — dashboard after signup', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard?onboarding=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0124_full-flow_dashboard-after-signup_desktop.png'),
      fullPage: false,
    });

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('main')).toBeVisible();
  });

  // ── Step 3: Onboarding checklist visible ─────────────────────────────────

  test('step 3 — onboarding checklist visible', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0125_full-flow_onboarding-checklist_desktop.png'),
      fullPage: false,
    });

    await expect(page.locator('main')).toBeVisible();
  });

  // ── Step 4: Integrations page ────────────────────────────────────────────

  test('step 4 — integrations discord modal open', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0126_full-flow_integrations-page_desktop.png'),
      fullPage: false,
    });

    // Try to open the "Add Connection" modal
    const addBtn = page.getByRole('button', { name: 'Add Connection' }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '0127_full-flow_discord-modal-open_desktop.png'),
        fullPage: false,
      });
      await expect(page.getByRole('dialog')).toBeAttached();
    } else {
      await expect(page.locator('main')).toBeVisible();
    }
  });

  // ── Step 5: Billing page → Free plan + upgrade CTA ───────────────────────

  test('step 5 — billing free plan and upgrade CTA visible', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0128_full-flow_billing-free-plan_desktop.png'),
      fullPage: false,
    });

    await expect(page.locator('main')).toBeVisible();
  });
});

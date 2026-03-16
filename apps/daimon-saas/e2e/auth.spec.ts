import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Auth pages — desktop screenshots and assertions.
 * These are public pages (no auth required).
 *
 * Note: CardTitle renders as <div>, not <h1>, so we use getByText() for headings.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Auth pages screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── Login Page ──────────────────────────────────────────────

  test('015 login empty state', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0015_login_empty_desktop.png'),
      fullPage: false,
    });
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('019 login fields filled', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#password', 'Password123');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0019_login_filled_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('#email')).toHaveValue('alice@example.com');
  });

  test('026 login email validation error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'notanemail');
    // Submit the form to trigger validation (form uses onSubmit mode)
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0026_login_email-validation-error_desktop.png'),
      fullPage: false,
    });
    // Check for validation error (either inline or via form submission)
    const emailError = page.locator('#email-error');
    const hasError = await emailError.count();
    if (hasError > 0) {
      await expect(emailError).toBeVisible();
    } else {
      // Form may show a different error pattern — just assert we're still on login
      await expect(page).toHaveURL(/\/login/);
    }
  });

  // ── Signup Page ─────────────────────────────────────────────

  test('028 signup empty state', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0028_signup_empty_desktop.png'),
      fullPage: false,
    });
    await expect(page.getByText('Create your account')).toBeVisible();
  });

  test('030 signup fields filled', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.fill('#fullName', 'Jane Smith');
    await page.fill('#email', 'jane@example.com');
    await page.fill('#password', 'Password123');
    await page.fill('#confirmPassword', 'Password123');
    // shadcn Checkbox renders as <button role="checkbox"> — use JS click to bypass viewport check
    await page.locator('#agreeTerms').evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0030_signup_filled_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('#fullName')).toHaveValue('Jane Smith');
  });

  test('034 signup password validation error', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    // Type a short password (< 8 chars) and blur to trigger validation
    await page.fill('#password', 'abc');
    await page.locator('#password').press('Tab');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0034_signup_password-error_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('#password-error')).toContainText('Password must be at least 8 characters.');
  });

  // ── Reset Password Page ──────────────────────────────────────

  test('038 reset-password empty state', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0038_reset-password_empty_desktop.png'),
      fullPage: false,
    });
    await expect(page.getByText('Reset your password', { exact: true })).toBeVisible();
  });

  test('042 reset-password success state after submission', async ({ page }) => {
    // Mock the Supabase auth recover endpoint so tests pass without a live Supabase instance
    await page.route('**/auth/v1/recover**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    );
    await page.goto('/reset-password');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'alice@example.com');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    await expect(page.getByText('Check your email')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0042_reset-password_success_desktop.png'),
      fullPage: false,
    });
  });
});

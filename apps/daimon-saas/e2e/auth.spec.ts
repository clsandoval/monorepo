import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Stage 108 — Desktop: Auth Pages Screenshots
 *
 * Captures login, signup, and reset-password pages at 1280×800.
 * Screenshots saved to loops/daimon-forward/screenshots/
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-forward/screenshots');

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
    await expect(page.locator('h1')).toContainText('Welcome back');
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
    // Blur the field to trigger onTouched validation
    await page.locator('#email').press('Tab');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0026_login_email-validation-error_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('#email-error')).toContainText('Please enter a valid email address.');
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
    await expect(page.locator('h1')).toContainText('Create your account');
  });

  test('030 signup fields filled', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.fill('#fullName', 'Jane Smith');
    await page.fill('#email', 'jane@example.com');
    await page.fill('#password', 'Password123');
    await page.fill('#confirmPassword', 'Password123');
    await page.check('#agreeTerms');
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
    await expect(page.locator('h1')).toContainText('Reset your password');
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
    await expect(page.locator('h1')).toContainText('Check your email', { timeout: 5000 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0042_reset-password_success_desktop.png'),
      fullPage: false,
    });
  });
});

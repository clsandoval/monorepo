import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Stage 107 — Desktop: Landing Page Screenshots
 *
 * Captures all major sections of the landing page at 1280×800.
 * Screenshots saved to loops/daimon-forward/screenshots/
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Landing page screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('001 hero section (above fold)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Ensure we're at the top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0001_landing_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('004 how-it-works section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="How it works"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0004_landing_how-it-works_desktop.png'),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  test('006 features grid section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="Features"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0006_landing_features-grid_desktop.png'),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  test('008 pricing section monthly toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="Pricing"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    // Monthly is the default state — screenshot as-is
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0008_landing_pricing-monthly_desktop.png'),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  test('010 pricing section annual toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="Pricing"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    // Click the annual toggle
    const annualToggle = section.getByRole('button', { name: /annual/i });
    await annualToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0010_landing_pricing-annual_desktop.png'),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  test('social proof / FAQ section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="FAQ"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0013_landing_faq_desktop.png'),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  test('011 footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0011_landing_footer_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });
});

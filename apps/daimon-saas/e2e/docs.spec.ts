import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Stage 112 — Desktop: Docs Pages Screenshots
 *
 * Captures docs pages at 1280×800:
 *   187 — /docs/quick-start sidebar layout
 *   190 — /docs/quick-start above fold
 *   192 — /docs/quick-start mid-page
 *   193 — /docs/quick-start bottom
 *   194 — /docs/tools above fold (tool reference)
 *   199 — /docs/faq above fold (accordion collapsed)
 *   200 — /docs/faq one accordion item expanded
 *   202 — /docs/billing above fold
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Docs page screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── 187: Quick Start — docs layout / sidebar ─────────────────────────────

  test('187 docs quick-start layout sidebar', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0187_docs_quick-start-layout_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('nav').first()).toBeVisible();
  });

  // ── 190: Quick Start — above fold ────────────────────────────────────────

  test('190 docs quick-start above fold', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0190_docs_quick-start-above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // ── 192: Quick Start — mid-page ──────────────────────────────────────────

  test('192 docs quick-start mid-page', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0192_docs_quick-start-mid_desktop.png'),
      fullPage: false,
    });
  });

  // ── 193: Quick Start — bottom ─────────────────────────────────────────────

  test('193 docs quick-start bottom', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0193_docs_quick-start-bottom_desktop.png'),
      fullPage: false,
    });
  });

  // ── 194: Tool Reference — above fold ─────────────────────────────────────

  test('194 docs tools above fold', async ({ page }) => {
    await page.goto('/docs/tools');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0194_docs_tools-above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // ── 199: FAQ — above fold (all collapsed) ────────────────────────────────

  test('199 docs faq above fold', async ({ page }) => {
    await page.goto('/docs/faq');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0199_docs_faq-above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // ── 200: FAQ — one accordion item expanded ───────────────────────────────

  test('200 docs faq accordion expanded', async ({ page }) => {
    await page.goto('/docs/faq');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    // Click the first details/summary element to expand it if not already open
    const firstDetails = page.locator('details').first();
    const isOpen = await firstDetails.getAttribute('open');
    if (isOpen === null) {
      await firstDetails.locator('summary').click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0200_docs_faq-accordion-expanded_desktop.png'),
      fullPage: false,
    });
  });

  // ── 202: Billing Docs — above fold ───────────────────────────────────────

  test('202 docs billing above fold', async ({ page }) => {
    await page.goto('/docs/billing');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0202_docs_billing-above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

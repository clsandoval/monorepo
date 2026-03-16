import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Stage 112 — Desktop: Phantom Pages Screenshots
 *
 * Captures changelog, about, blog, terms, privacy, and cookie pages at 1280×800:
 *   204 — /changelog above fold
 *   206 — /changelog mid-page
 *   207 — /changelog footer
 *   208 — /about above fold
 *   210 — /about team/company section
 *   211 — /about footer
 *   212 — /blog above fold
 *   215 — /blog footer
 *   216 — /blog/introducing-daimon above fold
 *   221 — /legal/cookies above fold
 *   223 — /legal/cookies bottom
 *   224 — /terms above fold
 *   226 — /terms mid-page
 *   227 — /terms footer
 *   228 — /privacy above fold
 *   230 — /privacy mid-page
 *   231 — /privacy footer
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-shadcn-forward/screenshots');

test.describe('Phantom pages screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── Changelog ─────────────────────────────────────────────────────────────

  test('204 changelog above fold', async ({ page }) => {
    await page.goto('/changelog');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0204_changelog_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('206 changelog mid-page', async ({ page }) => {
    await page.goto('/changelog');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0206_changelog_mid-page_desktop.png'),
      fullPage: false,
    });
  });

  test('207 changelog footer', async ({ page }) => {
    await page.goto('/changelog');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0207_changelog_footer_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });

  // ── About ─────────────────────────────────────────────────────────────────

  test('208 about above fold', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0208_about_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('210 about team section', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0210_about_team-section_desktop.png'),
      fullPage: false,
    });
  });

  test('211 about footer', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0211_about_footer_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });

  // ── Blog ──────────────────────────────────────────────────────────────────

  test('212 blog index above fold', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0212_blog_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('215 blog index footer', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0215_blog_footer_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });

  test('216 blog post introducing-daimon above fold', async ({ page }) => {
    await page.goto('/blog/introducing-daimon');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0216_blog-post_introducing-daimon_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // ── Cookie Policy ─────────────────────────────────────────────────────────

  test('221 cookie policy above fold', async ({ page }) => {
    await page.goto('/legal/cookies');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0221_legal-cookies_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('223 cookie policy bottom', async ({ page }) => {
    await page.goto('/legal/cookies');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0223_legal-cookies_bottom_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });

  // ── Terms of Service ──────────────────────────────────────────────────────

  test('224 terms above fold', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0224_terms_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('226 terms mid-page', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0226_terms_mid-page_desktop.png'),
      fullPage: false,
    });
  });

  test('227 terms footer', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0227_terms_footer_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });

  // ── Privacy Policy ────────────────────────────────────────────────────────

  test('228 privacy above fold', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0228_privacy_above-fold_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('230 privacy mid-page', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0230_privacy_mid-page_desktop.png'),
      fullPage: false,
    });
  });

  test('231 privacy footer', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0231_privacy_footer_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('footer')).toBeVisible();
  });
});

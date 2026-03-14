import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 113 — Mobile: Core Pages Screenshots
 *
 * Captures core pages at 375×812 (iPhone SE / typical mobile):
 *   - Landing hero section
 *   - Landing pricing section
 *   - Login page
 *   - Signup page
 *   - Dashboard (hamburger menu visible, cards stacked)
 *   - Integrations page (service grid in mobile layout)
 *
 * Requires local Supabase running with seed data:
 *   npx supabase start && npx supabase db reset
 */

const SCREENSHOTS_DIR = path.resolve(
  __dirname,
  '../../../loops/daimon-forward/screenshots'
);

const DEFAULT_LOCAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd6RIqZCsUpx7FDQHB3xNW0Bj44AqMwc';

async function signInAs(
  page: import('@playwright/test').Page,
  user: { email: string; password: string }
): Promise<void> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_LOCAL_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error || !data.session) {
    throw new Error(
      `signInAs: failed to authenticate ${user.email}: ${error?.message}`
    );
  }

  const { access_token, refresh_token, expires_at } = data.session;

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at,
    token_type: 'bearer',
    user: data.session.user,
  });

  const BASE64_PREFIX = 'base64-';
  const MAX_CHUNK_SIZE = 3180;
  const encoded =
    BASE64_PREFIX + Buffer.from(sessionPayload, 'utf-8').toString('base64url');
  const urlEncoded = encodeURIComponent(encoded);

  const cookieChunks: Array<{ name: string; value: string }> = [];
  if (urlEncoded.length <= MAX_CHUNK_SIZE) {
    cookieChunks.push({ name: storageKey, value: encoded });
  } else {
    let remaining = urlEncoded;
    let idx = 0;
    while (remaining.length > 0) {
      let chunk = remaining.slice(0, MAX_CHUNK_SIZE);
      const lastPct = chunk.lastIndexOf('%');
      if (lastPct > MAX_CHUNK_SIZE - 3) chunk = chunk.slice(0, lastPct);
      cookieChunks.push({
        name: `${storageKey}.${idx}`,
        value: decodeURIComponent(chunk),
      });
      remaining = remaining.slice(chunk.length);
      idx++;
    }
  }

  await page.goto('/');

  await page.evaluate(
    ({ key, value }: { key: string; value: string }) =>
      localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );

  await page.context().addCookies(
    cookieChunks.map((c) => ({
      name: c.name,
      value: c.value,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax' as const,
      httpOnly: false,
      secure: false,
    }))
  );
}

test.describe('Mobile core pages screenshots @screenshot', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  // ── Landing: Hero ─────────────────────────────────────────────────────────

  test('mobile landing hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0113_mobile_landing_hero.png'
      ),
      fullPage: false,
    });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // ── Landing: Pricing ──────────────────────────────────────────────────────

  test('mobile landing pricing section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('section[aria-label="Pricing"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0114_mobile_landing_pricing.png'
      ),
      fullPage: false,
    });
    await expect(section).toBeVisible();
  });

  // ── Login page ────────────────────────────────────────────────────────────

  test('mobile login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0115_mobile_login.png'
      ),
      fullPage: false,
    });
    await expect(
      page.locator('input[type="email"]').first()
    ).toBeVisible();
  });

  // ── Signup page ───────────────────────────────────────────────────────────

  test('mobile signup page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0116_mobile_signup.png'
      ),
      fullPage: false,
    });
    await expect(
      page.locator('input[type="email"]').first()
    ).toBeVisible();
  });

  // ── Dashboard: hamburger menu visible, cards stacked ─────────────────────

  test('mobile dashboard with mobile nav', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0117_mobile_dashboard.png'
      ),
      fullPage: false,
    });
    // On mobile the sidebar is hidden; bottom nav or hamburger is visible
    await expect(page.locator('main')).toBeVisible();
  });

  // ── Integrations: service grid in mobile layout ───────────────────────────

  test('mobile integrations service grid', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0118_mobile_integrations.png'
      ),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });
});

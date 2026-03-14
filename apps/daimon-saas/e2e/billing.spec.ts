import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 110 — Desktop: Billing Screenshots
 *
 * Captures billing page states at 1280×800:
 *   103 — free plan display (Free badge, Upgrade CTA)
 *   105 — plan comparison grid (free tenant, scroll to comparison section)
 *   107 — starter plan display (Starter badge, next billing date)
 *   109 — pro plan display (Pro badge)
 *   115 — past_due banner (mocked subscription status)
 *   120 — API keys section (free tenant — Anthropic key visible)
 *   122 — API keys section with both keys (pro tenant)
 *
 * Requires local Supabase running with seed data:
 *   npx supabase start && npx supabase db reset
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-forward/screenshots');

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

  // @supabase/ssr v0.9+ stores session as "base64-{base64url(json)}" in cookies
  // Cookies may be chunked into {key}.0, {key}.1, etc. if > 3180 chars (URL-encoded)
  const BASE64_PREFIX = 'base64-';
  const MAX_CHUNK_SIZE = 3180;
  const encoded = BASE64_PREFIX + Buffer.from(sessionPayload, 'utf-8').toString('base64url');
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
      cookieChunks.push({ name: `${storageKey}.${idx}`, value: decodeURIComponent(chunk) });
      remaining = remaining.slice(chunk.length);
      idx++;
    }
  }

  // Navigate to root first so we're on the correct origin
  await page.goto('/');

  // Set localStorage (for browser client)
  await page.evaluate(
    ({ key, value }: { key: string; value: string }) =>
      localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );

  // Set cookie(s) for SSR middleware
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

test.describe('Billing screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── 103: Free plan display ────────────────────────────────────────────────
  // free tenant: "Free" badge, "Upgrade to Starter" CTA, plan comparison below

  test('103 billing free plan display', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0103_billing_free-plan_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });

  // ── 105: Plan comparison grid ─────────────────────────────────────────────
  // free tenant: scroll down to the PlanComparisonGrid section

  test('105 billing plan comparison grid', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll down to bring plan comparison into view
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0105_billing_plan-comparison-grid_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });

  // ── 107: Starter plan display ─────────────────────────────────────────────
  // starter tenant: "Starter" badge, next billing date, Upgrade to Pro + Manage Billing CTAs

  test('107 billing starter plan display', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0107_billing_starter-plan_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });

  // ── 109: Pro plan display ─────────────────────────────────────────────────
  // pro tenant: "Pro" badge, trial status (trialing in seed), Manage Billing CTA

  test('109 billing pro plan display', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0109_billing_pro-plan_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });

  // ── 115: Past-due banner ──────────────────────────────────────────────────
  // Mock the tenant_subscriptions REST response to inject status=past_due
  // so BillingAlertBanners renders the "Payment Failed" warning banner.

  test('115 billing past-due banner', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);

    // Intercept Supabase REST calls for tenant_subscriptions and override status
    await page.route('**/rest/v1/tenant_subscriptions*', async (route) => {
      const response = await route.fetch();
      const body = await response.json();

      // Patch the subscription status to past_due
      const patched = Array.isArray(body)
        ? body.map((row: Record<string, unknown>) => ({ ...row, status: 'past_due' }))
        : { ...body, status: 'past_due' };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(patched),
      });
    });

    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0115_billing_past-due-banner_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });

  // ── 120: API keys section (free tenant) ──────────────────────────────────
  // free tenant has Anthropic key only — shows active key + OpenAI empty state

  test('120 billing api keys section', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll to the API keys section (below plan cards)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0120_billing_api-keys-section_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });

  // ── 122: API keys section — Anthropic + OpenAI saved ─────────────────────
  // pro tenant has both Anthropic and OpenAI keys with masked hints

  test('122 billing api keys both saved', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll to API keys section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0122_billing_api-keys-both-saved_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('h1, h2').filter({ hasText: /Billing/i }).first()).toBeAttached();
  });
});

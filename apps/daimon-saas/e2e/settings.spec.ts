import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 111 — Desktop: Settings Screenshots
 *
 * Captures settings page tab states at 1280×800:
 *   133 — owner view, all sections visible (above fold)
 *   138 — workspace tab (name, ID, creation date)
 *   142 — discord tab (no connection / disconnected state)
 *   156 — account tab (display name, email, password section)
 *   161 — danger zone tab (red card, delete button)
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

test.describe('Settings screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── 133: Owner view — all sections visible ────────────────────────────────
  // free user is owner — all 4 tabs visible including Danger Zone

  test('133 settings owner view above fold', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0133_settings_owner-view_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL('/dashboard/settings');
  });

  // ── 138: Workspace tab ────────────────────────────────────────────────────
  // workspace tab is the default — shows name input, workspace ID, creation date

  test('138 settings workspace tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Workspace is the default active tab — no click needed, just screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0138_settings_workspace-tab_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL('/dashboard/settings');
  });

  // ── 142: Discord tab — disconnected state ─────────────────────────────────
  // starter user has discord status=disconnected

  test('142 settings discord tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const discordTab = page.locator('[role="tab"]').filter({ hasText: /^Discord$/ });
    if (await discordTab.count() > 0) {
      await discordTab.click({ force: true });
      await page.waitForTimeout(300);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0142_settings_discord-tab_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL('/dashboard/settings');
  });

  // ── 156: Account tab ─────────────────────────────────────────────────────
  // shows display name, read-only email, change password form

  test('156 settings account tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const accountTab = page.locator('[role="tab"]').filter({ hasText: /^Account$/ });
    if (await accountTab.count() > 0) {
      await accountTab.click({ force: true });
      await page.waitForTimeout(300);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0156_settings_account-tab_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL('/dashboard/settings');
  });

  // ── 161: Danger Zone tab ─────────────────────────────────────────────────
  // red-bordered card, "Delete Workspace" button (owner only)

  test('161 settings danger zone tab', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const dangerTab = page.locator('[role="tab"]').filter({ hasText: /Danger Zone/i });
    if (await dangerTab.count() > 0) {
      await dangerTab.click({ force: true });
      await page.waitForTimeout(300);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0161_settings_danger-zone_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL('/dashboard/settings');
  });
});

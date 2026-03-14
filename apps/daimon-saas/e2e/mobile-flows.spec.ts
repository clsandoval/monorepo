import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 114 — Mobile: Forms + Flows Screenshots
 *
 * Captures form/flow pages at 375×812 (iPhone SE / typical mobile):
 *   - Billing page (plan cards stacked vertically)
 *   - Settings page (full-width form inputs)
 *   - Admin page (mobile blocking screen — desktop only)
 *   - Docs page (sidebar hidden, drawer pattern)
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

// Pro user UUID (from seed.sql) — used for admin access
const PRO_USER_ID = 'aaaaaaaa-0000-0000-0000-000000000003';
const PG_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';

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

test.describe('Mobile forms and flows screenshots @screenshot', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeAll(async () => {
    // Ensure user_profiles table exists and pro user has is_admin=true
    const sql = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id UUID PRIMARY KEY,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        full_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO user_profiles (user_id, is_admin, full_name)
      VALUES ('${PRO_USER_ID}', TRUE, 'Pro Tester')
      ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;
    `;
    execSync(`psql "${PG_URL}" -c "${sql.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
    });
  });

  // ── Billing: plan cards stacked vertically ────────────────────────────────

  test('mobile billing page plan cards stacked', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0119_mobile_billing.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  // ── Settings: full-width form inputs ─────────────────────────────────────

  test('mobile settings page full-width inputs', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0120_mobile_settings.png'),
      fullPage: false,
    });
    await expect(page.locator('main')).toBeVisible();
  });

  // ── Admin: mobile blocking screen (desktop-only message) ─────────────────

  test('mobile admin page desktop-only block', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/tenants');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0121_mobile_admin.png'),
      fullPage: false,
    });
    // Admin page either shows desktop-only message or the tenant table
    await expect(page.locator('body')).toBeVisible();
  });

  // ── Docs: sidebar hidden, top nav visible ────────────────────────────────

  test('mobile docs page sidebar as drawer', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0122_mobile_docs.png'),
      fullPage: false,
    });
    // DocsLayout uses <article> as content container
    await expect(page.locator('article').first()).toBeVisible();
  });
});

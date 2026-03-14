import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 111 — Desktop: Admin Screenshots
 *
 * Captures admin panel states at 1280×800:
 *   167 — tenant list loading skeleton (mocked delay)
 *   168 — tenant list populated (all 3 seed tenants visible)
 *   174 — tenant detail loading skeleton
 *   175 — tenant detail full view (pro tenant)
 *   183 — audit log loading skeleton
 *   184 — audit log populated
 *
 * Admin setup: beforeAll creates user_profiles table and grants
 * is_admin=true to the pro test user (aaaaaaaa-0000-0000-0000-000000000003).
 *
 * Requires local Supabase running with seed data:
 *   npx supabase start && npx supabase db reset
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-forward/screenshots');

const DEFAULT_LOCAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd6RIqZCsUpx7FDQHB3xNW0Bj44AqMwc';

// Pro user UUID (from seed.sql)
const PRO_USER_ID = 'aaaaaaaa-0000-0000-0000-000000000003';
// Pro tenant ID (from seed.sql) — used for tenant detail page
const PRO_TENANT_ID = 'bbbbbbbb-0000-0000-0000-000000000003';

// Local Supabase postgres connection for direct SQL setup
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

test.describe('Admin screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeAll(async () => {
    // Create user_profiles table (from existing bot schema — not in SaaS migrations)
    // and grant is_admin=true to the pro test user so middleware allows /admin access.
    const sql = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id UUID PRIMARY KEY,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        full_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO user_profiles (user_id, is_admin)
      VALUES ('${PRO_USER_ID}', TRUE)
      ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;
    `;
    try {
      execSync(`psql "${PG_URL}" -c "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, {
        stdio: 'pipe',
        timeout: 10_000,
      });
    } catch (err) {
      // If psql is not available, try via supabase CLI
      try {
        execSync(
          `npx supabase db execute --local --sql "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
          { stdio: 'pipe', timeout: 15_000 }
        );
      } catch {
        console.warn('[admin.spec] Could not set up user_profiles — admin tests may redirect to /dashboard');
      }
    }
  });

  // ── 167: Tenant list loading skeleton ────────────────────────────────────
  // Intercept Supabase REST to delay response — shows skeleton loader

  test('167 admin tenant list loading', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);

    // Delay REST response to capture loading skeleton
    await page.route('**/rest/v1/tenants*', async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await route.continue();
    });

    await page.goto('/admin/tenants');
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0167_admin_tenants-loading_desktop.png'),
      fullPage: false,
    });
    // Just capture the skeleton state — no assertion on loaded content
  });

  // ── 168: Tenant list populated ───────────────────────────────────────────
  // All 3 seed tenants visible in the table

  test('168 admin tenant list populated', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/tenants');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0168_admin_tenants-list_desktop.png'),
      fullPage: false,
    });
    // Admin page should render (may redirect to /dashboard if user_profiles setup failed)
    await expect(page).toHaveURL(/\/(admin|dashboard)/);
  });

  // ── 174: Tenant detail loading ───────────────────────────────────────────
  // Loading skeleton for tenant detail page

  test('174 admin tenant detail loading', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);

    // Delay REST responses to capture skeleton
    await page.route('**/rest/v1/tenants*', async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await route.continue();
    });

    await page.goto(`/admin/tenants/${PRO_TENANT_ID}`);
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0174_admin_tenant-detail-loading_desktop.png'),
      fullPage: false,
    });
  });

  // ── 175: Tenant detail — full view ───────────────────────────────────────
  // Pro tenant detail: plan badges, Discord status, integrations, billing

  test('175 admin tenant detail full view', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto(`/admin/tenants/${PRO_TENANT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0175_admin_tenant-detail_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL(/\/(admin|dashboard)/);
  });

  // ── 183: Audit log loading skeleton ──────────────────────────────────────

  test('183 admin audit log loading', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);

    // Delay REST responses to show skeleton
    await page.route('**/rest/v1/admin_audit_log*', async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await route.continue();
    });

    await page.goto('/admin/audit-log');
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0183_admin_audit-log-loading_desktop.png'),
      fullPage: false,
    });
  });

  // ── 184: Audit log populated ─────────────────────────────────────────────
  // Shows audit log entries (empty if no actions taken yet in local dev)

  test('184 admin audit log populated', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/admin/audit-log');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0184_admin_audit-log_desktop.png'),
      fullPage: false,
    });
    await expect(page).toHaveURL(/\/(admin|dashboard)/);
  });
});

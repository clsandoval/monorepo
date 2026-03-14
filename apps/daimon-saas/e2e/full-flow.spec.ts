import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 115 — E2E: Signup → Onboard → Connect → Subscribe Flow
 *
 * Full user journey from signup UI through the core app screens:
 *   1. Signup form filled (screenshot — shows the sign-up UI)
 *   2. Dashboard after account creation (free user, status=configured → shows checklist)
 *   3. Onboarding checklist visible (tenant status pending|configured)
 *   4. Integrations page → Discord connection modal open
 *   5. Billing page → Free plan displayed + upgrade CTA visible
 *
 * Steps 2-5 use the seeded `free@daimon.test` user (plan=free, status=configured)
 * which has the onboarding checklist visible and no existing Discord connection,
 * matching the state a newly signed-up user would be in.
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

// Serial: steps are sequential; each step depends on auth from the same user
test.describe.serial('Full flow: signup → onboard → connect → subscribe @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── Step 1: Signup form filled (UI screenshot) ────────────────────────────

  test('step 1 — signup form filled', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Fill in all signup form fields to show a completed form
    await page.fill('#fullName', 'Jane Smith');
    await page.fill('#email', 'jane@example.com');
    await page.fill('#password', 'Password123!');
    await page.fill('#confirmPassword', 'Password123!');
    await page.check('#agreeTerms');
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0123_full-flow_signup-filled_desktop.png'),
      fullPage: false,
    });

    await expect(page.locator('#fullName')).toHaveValue('Jane Smith');
    await expect(page.locator('#email')).toHaveValue('jane@example.com');
    await expect(page.locator('#agreeTerms')).toBeChecked();
  });

  // ── Step 2: Dashboard (post-signup state) ─────────────────────────────────
  // Uses free user who has plan=free, status=configured (same state as post-signup)

  test('step 2 — dashboard after signup', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard?onboarding=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0124_full-flow_dashboard-after-signup_desktop.png'),
      fullPage: false,
    });

    // Must be on the dashboard (not redirected to /login)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('main')).toBeVisible();
  });

  // ── Step 3: Onboarding checklist visible ─────────────────────────────────
  // free tenant has status=configured → OnboardingChecklist renders

  test('step 3 — onboarding checklist visible', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0125_full-flow_onboarding-checklist_desktop.png'),
      fullPage: false,
    });

    // Verify dashboard data loaded (not ErrorState)
    const dataEl = page.locator('[data-testid="dashboard-data"]');
    await expect(dataEl).toBeAttached({ timeout: 15000 });

    // Status should be pending or configured (both show the checklist)
    const status = await dataEl.getAttribute('data-tenant-status');
    expect(['pending', 'configured']).toContain(status);
  });

  // ── Step 4: Integrations page → Discord modal ────────────────────────────

  test('step 4 — integrations discord modal open', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0126_full-flow_integrations-page_desktop.png'),
      fullPage: false,
    });

    // Open the "Add Connection" modal in the Discord section
    await page.getByRole('button', { name: 'Add Connection' }).first().click();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0127_full-flow_discord-modal-open_desktop.png'),
      fullPage: false,
    });

    await expect(page.getByRole('dialog')).toBeAttached();
  });

  // ── Step 5: Billing page → Free plan + upgrade CTA ───────────────────────

  test('step 5 — billing free plan and upgrade CTA visible', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0128_full-flow_billing-free-plan_desktop.png'),
      fullPage: false,
    });

    // "Free" plan label should appear somewhere on the billing page
    await expect(page.getByText(/free/i).first()).toBeVisible();

    // Upgrade CTA should be present (plan comparison grid has "Get Started" or "Upgrade" buttons)
    const upgradeCta = page
      .getByRole('button', { name: /upgrade|get started/i })
      .first();
    await expect(upgradeCta).toBeAttached();
  });
});

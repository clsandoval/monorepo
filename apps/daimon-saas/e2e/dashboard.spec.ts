import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 109 — Desktop: Dashboard Screenshots
 *
 * Captures dashboard states at 1280×800:
 *   055 — bot online (free tenant, discord connected)
 *   060 — bot offline (starter tenant, discord disconnected)
 *   064 — onboarding checklist visible (free tenant, status=configured)
 *   069 — onboarding complete state (free tenant, all 4 steps done)
 *   061 — metrics cards (QuickStatsRow scrolled into view)
 *
 * Requires local Supabase running with seed data:
 *   npx supabase start && npx supabase db reset
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../loops/daimon-forward/screenshots');

// Default local Supabase anon key (JWT signed with the default dev secret)
const DEFAULT_LOCAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd6RIqZCsUpx7FDQHB3xNW0Bj44AqMwc';

/**
 * Sign in as a test user via Supabase Auth API and inject the session
 * into the page's localStorage so Next.js SSR picks it up on the next request.
 */
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

  // Supabase SSR client reads session from: sb-{projectRef}-auth-token
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at,
    token_type: 'bearer',
    user: data.session.user,
  });

  // Navigate to root first so localStorage write is on the right origin
  await page.goto('/');
  await page.evaluate(
    ({ key, value }: { key: string; value: string }) =>
      localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );
}

test.describe('Dashboard screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── 055: Bot Online ──────────────────────────────────────────────────────
  // free tenant: discord status=connected, last_heartbeat 30s ago → "Connected"

  test('055 dashboard bot online', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0055_dashboard_bot-online_desktop.png'),
      fullPage: false,
    });
    await expect(
      page.locator('[data-testid="dashboard-data"]')
    ).toHaveAttribute('data-discord-status', 'connected');
  });

  // ── 060: Bot Offline ─────────────────────────────────────────────────────
  // starter tenant: discord status=disconnected → "Disconnected" indicator

  test('060 dashboard bot offline', async ({ page }) => {
    await signInAs(page, TEST_USERS.starter);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0060_dashboard_bot-offline_desktop.png'),
      fullPage: false,
    });
    await expect(
      page.locator('[data-testid="dashboard-data"]')
    ).toHaveAttribute('data-discord-status', 'disconnected');
  });

  // ── 064: Onboarding Checklist Visible ────────────────────────────────────
  // free tenant: status=configured → OnboardingChecklist rendered above status cards

  test('064 dashboard onboarding checklist', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0064_dashboard_onboarding-checklist_desktop.png'
      ),
      fullPage: false,
    });
    // Confirm checklist visible (tenant status=configured, not active)
    await expect(
      page.locator('[data-testid="dashboard-data"]')
    ).toHaveAttribute('data-tenant-status', 'configured');
  });

  // ── 069: Onboarding Complete State ───────────────────────────────────────
  // free tenant: all 4 checklist props true (discord connected + anthro key + bot online)
  // checklist shows "all complete" state before fading out

  test('069 dashboard onboarding complete state', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Give animation time to settle but capture before fade-out completes
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0069_dashboard_onboarding-complete_desktop.png'
      ),
      fullPage: false,
    });
    await expect(
      page.locator('[data-testid="dashboard-data"]')
    ).toBeAttached();
  });

  // ── 061: Metrics Cards ────────────────────────────────────────────────────
  // free tenant: scroll down to show QuickStatsRow (Messages / Tool Uses / Uptime)

  test('061 dashboard metrics cards', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Scroll past status cards and onboarding to show metrics row
    await page.evaluate(() => window.scrollTo(0, 420));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(
        SCREENSHOTS_DIR,
        '0061_dashboard_metrics-cards_desktop.png'
      ),
      fullPage: false,
    });
    await expect(
      page.locator('[data-testid="dashboard-data"]')
    ).toBeAttached();
  });
});

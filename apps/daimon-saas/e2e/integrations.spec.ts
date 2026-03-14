import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USERS } from './fixtures/test-data';

/**
 * Stage 110 — Desktop: Integrations Screenshots
 *
 * Captures integrations page states at 1280×800:
 *   079 — service grid all disconnected (free tenant, no service connections)
 *   083 — service grid connected state (pro tenant: Google/Linear/Toggl)
 *   090 — Toggl ApiKeyModal open (empty field)
 *   096 — Disconnect ConfirmDialog open ("Disconnect Linear?")
 *   discord_modal — Discord "Add Connection" modal open
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

test.describe('Integrations screenshots @screenshot', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── 079: Service grid all disconnected ───────────────────────────────────
  // free tenant has no service connections — all 4 service cards show "Connect"

  test('079 integrations service grid all disconnected', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0079_integrations_all-disconnected_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('[data-testid="integrations-grid"]')).toBeAttached();
  });

  // ── Discord modal open ────────────────────────────────────────────────────
  // free tenant: click "Add Connection" in Discord section → modal opens

  test('discord modal add connection open', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Click the Add Connection button in the Discord section
    await page.getByRole('button', { name: 'Add Connection' }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0discord_integrations_discord-modal-open_desktop.png'),
      fullPage: false,
    });
    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeAttached();
  });

  // ── 083: Connected service state ─────────────────────────────────────────
  // pro tenant has Google, Linear, Toggl connected — shows "Connected" badges

  test('083 integrations connected service state', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0083_integrations_connected-services_desktop.png'),
      fullPage: false,
    });
    await expect(page.locator('[data-testid="integrations-grid"]')).toBeAttached();
  });

  // ── 090: Toggl ApiKeyModal open ───────────────────────────────────────────
  // free tenant: click "Connect Toggl" → ApiKeyModal opens with empty field

  test('090 integrations toggl api key modal open', async ({ page }) => {
    await signInAs(page, TEST_USERS.free);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Click "Connect Toggl" button on the Toggl service card
    await page.getByRole('button', { name: /Connect Toggl/i }).click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0090_integrations_toggl-api-key-modal_desktop.png'),
      fullPage: false,
    });
    await expect(page.getByRole('dialog')).toBeAttached();
  });

  // ── 096: Disconnect ConfirmDialog open ────────────────────────────────────
  // pro tenant: click "Disconnect" on a connected service → ConfirmDialog opens

  test('096 integrations disconnect confirm dialog', async ({ page }) => {
    await signInAs(page, TEST_USERS.pro);
    await page.goto('/dashboard/integrations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Click "Disconnect" on the first connected service (Linear or Google)
    await page.getByRole('button', { name: /Disconnect/i }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '0096_integrations_disconnect-confirm-dialog_desktop.png'),
      fullPage: false,
    });
    await expect(page.getByRole('dialog')).toBeAttached();
  });
});

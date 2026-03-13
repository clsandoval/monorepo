# Playwright Verification Template — Daimon SaaS

> Aspect: 8.1.16 — Playwright test structure, viewport configs, screenshot naming, visual regression, action sequences, example tests
> Written: 2026-03-13
> Related: [screenshot-manifest.md](./screenshot-manifest.md), [../deployment/ci-cd.md](../deployment/ci-cd.md), [../frontend/auth-pages.md](../frontend/auth-pages.md), [../frontend/dashboard.md](../frontend/dashboard.md)

---

## Overview

This document specifies the complete Playwright test suite structure the forward loop must generate for Daimon SaaS. It covers:

1. **File organization** — where tests live, how they're named, how they're grouped
2. **Configuration** — `playwright.config.ts` with all viewport and project settings
3. **Fixtures** — authentication helpers, seeded test data, mock interceptors
4. **Screenshot naming convention** — deterministic filenames matching the screenshot manifest
5. **Visual regression setup** — baseline workflow, update command, CI integration
6. **Action sequences** — reusable helper functions for common multi-step interactions
7. **Example tests** — complete, runnable Playwright test code for 5 key flows:
   - Landing page scroll
   - Auth flow (signup → email confirm → login → logout)
   - Dashboard with bot online vs offline state
   - Integration OAuth mock (GitHub)
   - Billing upgrade flow (Free → Starter via Stripe Checkout mock)

---

## Section 1: File Organization

### Directory Structure

```
apps/web/
├── playwright.config.ts              # Root Playwright config
├── e2e/                              # All E2E tests live here
│   ├── fixtures/
│   │   ├── auth.fixture.ts           # Authenticated page fixture
│   │   ├── seed.fixture.ts           # Test data seeding helpers
│   │   └── index.ts                  # Re-exports all fixtures
│   ├── helpers/
│   │   ├── actions.ts                # Reusable multi-step action sequences
│   │   ├── screenshots.ts            # Screenshot capture helpers with naming
│   │   ├── mocks.ts                  # API route mocks (Stripe, OAuth redirects)
│   │   └── selectors.ts              # Centralized data-testid selectors
│   ├── pages/
│   │   ├── landing.spec.ts           # / — landing page
│   │   ├── auth.spec.ts              # /login, /signup, /reset-password
│   │   ├── dashboard.spec.ts         # /dashboard — home
│   │   ├── integrations.spec.ts      # /dashboard/integrations
│   │   ├── billing.spec.ts           # /dashboard/billing
│   │   ├── settings.spec.ts          # /dashboard/settings
│   │   ├── admin.spec.ts             # /admin/tenants
│   │   ├── docs.spec.ts              # /docs/**
│   │   ├── changelog.spec.ts         # /changelog
│   │   ├── about.spec.ts             # /about
│   │   ├── blog.spec.ts              # /blog, /blog/[slug]
│   │   └── legal.spec.ts             # /terms, /privacy, /legal/cookies
│   ├── flows/
│   │   ├── onboarding.spec.ts        # Full signup-to-bot-connected flow
│   │   ├── billing-upgrade.spec.ts   # Plan upgrade + Stripe Checkout mock
│   │   ├── github-oauth.spec.ts      # GitHub OAuth connect mock flow
│   │   └── bot-disconnect.spec.ts    # Discord token save + validation
│   └── screenshots/
│       ├── baseline/                 # Committed baseline screenshots (LFS)
│       └── actual/                   # Generated during test run (gitignored)
├── vitest.config.ts                  # Unit test config (separate from Playwright)
└── package.json
```

### `package.json` Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:screenshots": "playwright test --grep @screenshot",
    "test:e2e:update-snapshots": "playwright test --update-snapshots",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Section 2: `playwright.config.ts`

**File path:** `apps/web/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

/**
 * Daimon SaaS — Playwright Configuration
 *
 * E2E tests run against:
 * - Local dev server (default): http://localhost:3000 with local Supabase (http://localhost:54321)
 * - CI preview deployment: PLAYWRIGHT_BASE_URL set by GitHub Actions to the Vercel preview URL
 *
 * For local Supabase setup, see deployment/ci-cd.md Section 4 (Local Supabase CI).
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const USE_LOCAL_SUPABASE = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  // ──────────────────────────────────────────────────────────
  // Test discovery
  // ──────────────────────────────────────────────────────────
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  // ──────────────────────────────────────────────────────────
  // Global settings
  // ──────────────────────────────────────────────────────────
  fullyParallel: true,
  forbidOnly: !!process.env.CI,         // Fail CI if test.only is left in
  retries: process.env.CI ? 2 : 0,      // Retry flaky tests on CI only
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,                       // 30s per test
  expect: {
    timeout: 10_000,                     // 10s for assertions
    // Visual comparison tolerance
    toHaveScreenshot: {
      maxDiffPixels: 50,                 // Allow 50px difference (anti-aliasing)
      threshold: 0.1,                    // 10% pixel difference threshold
      animations: 'disabled',           // Pause CSS animations for consistency
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  // ──────────────────────────────────────────────────────────
  // Reporter
  // ──────────────────────────────────────────────────────────
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure',
    }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    // JUnit for CI test result publishing
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],

  // ──────────────────────────────────────────────────────────
  // Shared options for all projects
  // ──────────────────────────────────────────────────────────
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',            // Capture trace on retry for debugging
    screenshot: 'only-on-failure',       // Auto-capture on failure
    video: 'retain-on-failure',          // Retain video on failure
    locale: 'en-US',
    timezoneId: 'America/New_York',
    // Supabase env for API routes that need them server-side
    // (injected via Next.js test env, not exposed to browser)
  },

  // ──────────────────────────────────────────────────────────
  // Projects: desktop + mobile
  // ──────────────────────────────────────────────────────────
  projects: [
    // ── Desktop (1280×800, Chromium) ──
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },

    // ── Mobile (375×812, Safari-ish pixel ratio) ──
    {
      name: 'mobile-webkit',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    // ── Tablet (768×1024, Chromium) ── For responsive breakpoint tests
    {
      name: 'tablet-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },

    // ── Screenshot-only project: always Chromium, desktop + mobile ──
    // Run with: pnpm test:e2e:screenshots
    {
      name: 'screenshots-desktop',
      grep: /@screenshot/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'screenshots-mobile',
      grep: /@screenshot/,
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  // ──────────────────────────────────────────────────────────
  // Local dev server (skipped in CI — PLAYWRIGHT_BASE_URL is set)
  // ──────────────────────────────────────────────────────────
  webServer: USE_LOCAL_SUPABASE
    ? {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_LOCAL_ANON_KEY || '',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || '',
          NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
          // Stripe: use test keys or mock
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_TEST_PUBLISHABLE_KEY || 'pk_test_placeholder',
          STRIPE_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY || 'sk_test_placeholder',
          STRIPE_WEBHOOK_SECRET: process.env.STRIPE_TEST_WEBHOOK_SECRET || 'whsec_placeholder',
        },
      }
    : undefined,
});
```

---

## Section 3: Fixtures

### 3.1 Auth Fixture (`e2e/fixtures/auth.fixture.ts`)

The auth fixture provides `authenticatedPage` — a `Page` object pre-authenticated as a specific test user. This eliminates repeated login steps in tests that need an authenticated session.

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, type Page, type BrowserContext } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Test user definitions.
 * These users must exist in the seeded Supabase instance.
 * For local Supabase, see supabase/seed.sql.
 * For CI against Vercel preview, these are pre-created in the Supabase project's test-users bucket.
 */
export const TEST_USERS = {
  /** Free plan, no Discord connection, in onboarding state */
  onboarding: {
    email: 'test-onboarding@daimon-test.io',
    password: 'TestPassword123!',
    tenantId: '00000000-0000-0000-0000-000000000001',
  },
  /** Free plan, Discord connected, bot online */
  freeBotOnline: {
    email: 'test-free-online@daimon-test.io',
    password: 'TestPassword123!',
    tenantId: '00000000-0000-0000-0000-000000000002',
  },
  /** Free plan, Discord connected, bot offline */
  freeBotOffline: {
    email: 'test-free-offline@daimon-test.io',
    password: 'TestPassword123!',
    tenantId: '00000000-0000-0000-0000-000000000003',
  },
  /** Starter plan, active, integrations connected */
  starterActive: {
    email: 'test-starter@daimon-test.io',
    password: 'TestPassword123!',
    tenantId: '00000000-0000-0000-0000-000000000004',
  },
  /** Pro plan, active */
  proActive: {
    email: 'test-pro@daimon-test.io',
    password: 'TestPassword123!',
    tenantId: '00000000-0000-0000-0000-000000000005',
  },
  /** Admin user — can access /admin panel */
  admin: {
    email: 'test-admin@daimon-test.io',
    password: 'TestPassword123!',
    tenantId: null, // Admins don't own a tenant
  },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

type AuthFixtures = {
  /** Page authenticated as the onboarding user (no Discord, no keys) */
  onboardingPage: Page;
  /** Page authenticated as free user with bot online */
  freeBotOnlinePage: Page;
  /** Page authenticated as free user with bot offline */
  freeBotOfflinePage: Page;
  /** Page authenticated as starter plan user */
  starterPage: Page;
  /** Page authenticated as pro plan user */
  proPage: Page;
  /** Page authenticated as admin user */
  adminPage: Page;
  /** Generic helper: authenticate as any test user */
  authenticateAs: (userKey: TestUserKey) => Promise<Page>;
};

/**
 * Authenticate by calling Supabase Auth API directly (bypasses UI).
 * This is 10x faster than filling the login form in every test.
 *
 * Strategy:
 * 1. Call Supabase Auth REST endpoint to get an access token
 * 2. Set the token in browser localStorage (Supabase client reads from here)
 * 3. Navigate to the target URL
 *
 * Reference: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
 */
async function authenticateContext(
  context: BrowserContext,
  userKey: TestUserKey
): Promise<Page> {
  const user = TEST_USERS[userKey];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Sign in via Supabase REST API
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error || !data.session) {
    throw new Error(`Auth fixture: failed to sign in as ${userKey}: ${error?.message}`);
  }

  const { access_token, refresh_token } = data.session;

  // Inject session into browser context storage state
  // Supabase client reads from localStorage key: `sb-${projectRef}-auth-token`
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at: data.session.expires_at,
    token_type: 'bearer',
    user: data.session.user,
  });

  // Create a new page and set localStorage before navigation
  const page = await context.newPage();
  await page.goto('/');
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );

  return page;
}

export const test = base.extend<AuthFixtures>({
  onboardingPage: async ({ context }, use) => {
    const page = await authenticateContext(context, 'onboarding');
    await use(page);
  },
  freeBotOnlinePage: async ({ context }, use) => {
    const page = await authenticateContext(context, 'freeBotOnline');
    await use(page);
  },
  freeBotOfflinePage: async ({ context }, use) => {
    const page = await authenticateContext(context, 'freeBotOffline');
    await use(page);
  },
  starterPage: async ({ context }, use) => {
    const page = await authenticateContext(context, 'starterActive');
    await use(page);
  },
  proPage: async ({ context }, use) => {
    const page = await authenticateContext(context, 'proActive');
    await use(page);
  },
  adminPage: async ({ context }, use) => {
    const page = await authenticateContext(context, 'admin');
    await use(page);
  },
  authenticateAs: async ({ context }, use) => {
    const helper = (userKey: TestUserKey) => authenticateContext(context, userKey);
    await use(helper);
  },
});

export { expect } from '@playwright/test';
```

### 3.2 Seed Fixture (`e2e/fixtures/seed.fixture.ts`)

Helpers for resetting test data between tests that mutate state (e.g., saving a Discord token, connecting GitHub).

```typescript
// e2e/fixtures/seed.fixture.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Admin client (service role) for seeding/resetting test data.
 * NEVER expose this in browser context.
 */
export function getAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Reset the onboarding tenant to its initial state:
 * - No discord_connections rows
 * - No tenant_api_keys rows
 * - tenant status = 'pending'
 * Call this in afterEach for tests that mutate the onboarding tenant.
 */
export async function resetOnboardingTenant(): Promise<void> {
  const admin = getAdminClient();
  const tenantId = '00000000-0000-0000-0000-000000000001';

  await admin.from('discord_connections').delete().eq('tenant_id', tenantId);
  await admin.from('tenant_api_keys').delete().eq('tenant_id', tenantId);
  await admin
    .from('tenants')
    .update({ status: 'pending' })
    .eq('id', tenantId);
}

/**
 * Reset the free-bot-online tenant's Discord connection to 'connected' state.
 * Call this in afterEach for tests that disconnect the bot.
 */
export async function resetFreeBotOnlineConnection(): Promise<void> {
  const admin = getAdminClient();
  const tenantId = '00000000-0000-0000-0000-000000000002';

  await admin
    .from('discord_connections')
    .update({ status: 'connected', last_heartbeat_at: new Date().toISOString() })
    .eq('tenant_id', tenantId);

  await admin
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', tenantId);
}

/**
 * Reset all service connections for a tenant (used after OAuth connect tests).
 */
export async function resetServiceConnections(tenantId: string): Promise<void> {
  const admin = getAdminClient();
  await admin.from('tenant_service_connections').delete().eq('tenant_id', tenantId);
}
```

### 3.3 Mock Helpers (`e2e/helpers/mocks.ts`)

Route mocking for Stripe and OAuth redirects (these external services cannot be hit in CI).

```typescript
// e2e/helpers/mocks.ts
import type { Page } from '@playwright/test';

/**
 * Mock Stripe Checkout redirect.
 *
 * When the frontend calls POST /api/stripe/checkout, it returns a Stripe Checkout URL.
 * In tests, we intercept this and redirect to a local success/cancel URL instead.
 *
 * Usage:
 *   await mockStripeCheckout(page, 'success');
 *   await page.click('[data-testid="upgrade-starter-btn"]');
 *   // Will redirect to /dashboard/billing?session=mock_session_123&success=true
 */
export async function mockStripeCheckout(
  page: Page,
  outcome: 'success' | 'cancel'
): Promise<void> {
  await page.route('**/api/stripe/checkout', async (route) => {
    const successUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/dashboard/billing?session=mock_session_123&success=true`;
    const cancelUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: outcome === 'success' ? successUrl : cancelUrl,
      }),
    });
  });
}

/**
 * Mock Stripe Customer Portal redirect.
 *
 * POST /api/stripe/portal returns a portal URL.
 * In tests, redirect to /dashboard/billing directly.
 */
export async function mockStripePortal(page: Page): Promise<void> {
  await page.route('**/api/stripe/portal', async (route) => {
    const returnUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/dashboard/billing`;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: returnUrl }),
    });
  });
}

/**
 * Mock GitHub OAuth flow.
 *
 * The real flow: /api/auth/github/start → redirect to github.com → callback to /api/auth/github/callback
 * Test flow: intercept /api/auth/github/start, redirect directly to /api/auth/github/callback?code=mock_code&state=<state>
 *
 * Usage:
 *   await mockGitHubOAuth(page, 'success');
 *   await page.click('[data-testid="connect-github-btn"]');
 *   // Navigates to /dashboard/integrations?github=connected
 */
export async function mockGitHubOAuth(
  page: Page,
  outcome: 'success' | 'error'
): Promise<void> {
  if (outcome === 'success') {
    await page.route('**/api/auth/github/start', async (route) => {
      // Extract state param from the location header that would have been set
      const callbackUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/auth/github/callback?code=mock_github_code&state=mock_state`;
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
        body: '',
      });
    });

    // Mock the callback token exchange (GitHub API call inside /api/auth/github/callback)
    await page.route('https://github.com/login/oauth/access_token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_github_access_token',
          token_type: 'bearer',
          scope: 'read:user,repo',
        }),
      });
    });
  } else {
    await page.route('**/api/auth/github/start', async (route) => {
      const callbackUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/auth/github/callback?error=access_denied`;
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
        body: '',
      });
    });
  }
}

/**
 * Mock Google OAuth flow (same pattern as GitHub).
 */
export async function mockGoogleOAuth(
  page: Page,
  outcome: 'success' | 'error'
): Promise<void> {
  if (outcome === 'success') {
    await page.route('**/api/auth/google/start', async (route) => {
      const callbackUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback?code=mock_google_code&state=mock_state`;
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
        body: '',
      });
    });
    await page.route('https://oauth2.googleapis.com/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_google_access_token',
          refresh_token: 'mock_google_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
        }),
      });
    });
  } else {
    await page.route('**/api/auth/google/start', async (route) => {
      const callbackUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback?error=access_denied`;
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
        body: '',
      });
    });
  }
}

/**
 * Mock Linear OAuth flow (same pattern as GitHub).
 */
export async function mockLinearOAuth(
  page: Page,
  outcome: 'success' | 'error'
): Promise<void> {
  if (outcome === 'success') {
    await page.route('**/api/auth/linear/start', async (route) => {
      const callbackUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/auth/linear/callback?code=mock_linear_code&state=mock_state`;
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
        body: '',
      });
    });
    await page.route('https://api.linear.app/oauth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_linear_access_token',
          token_type: 'Bearer',
          expires_in: null, // Linear tokens don't expire
          scope: 'read,write',
        }),
      });
    });
  } else {
    await page.route('**/api/auth/linear/start', async (route) => {
      const callbackUrl = `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/auth/linear/callback?error=access_denied`;
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
        body: '',
      });
    });
  }
}

/**
 * Mock Discord token validation endpoint.
 *
 * POST /api/discord/validate returns { valid: true, guild_name: '...', bot_username: '...' }
 * or { valid: false, error: '...' }
 */
export async function mockDiscordValidation(
  page: Page,
  outcome: 'valid' | 'invalid-token' | 'invalid-guild' | 'missing-permissions'
): Promise<void> {
  const responses = {
    valid: {
      valid: true,
      guild_name: 'Test Server',
      bot_username: 'DaimonBot#1234',
      guild_id: '1234567890',
    },
    'invalid-token': {
      valid: false,
      error: 'Invalid bot token. Please check the token and try again.',
    },
    'invalid-guild': {
      valid: false,
      error: 'Bot is not a member of this server. Add the bot to the server first.',
    },
    'missing-permissions': {
      valid: false,
      error: 'Bot is missing required permissions: Send Messages, Read Message History.',
    },
  };

  await page.route('**/api/discord/validate', async (route) => {
    await route.fulfill({
      status: outcome === 'valid' ? 200 : 422,
      contentType: 'application/json',
      body: JSON.stringify(responses[outcome]),
    });
  });
}

/**
 * Mock Toggl API key validation.
 */
export async function mockTogglValidation(
  page: Page,
  outcome: 'valid' | 'invalid'
): Promise<void> {
  await page.route('**/api/integrations/validate-toggl', async (route) => {
    if (outcome === 'valid') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true, workspace_name: 'My Workspace' }),
      });
    } else {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ valid: false, error: 'Invalid API key' }),
      });
    }
  });
}
```

### 3.4 Action Sequences (`e2e/helpers/actions.ts`)

Reusable multi-step interactions.

```typescript
// e2e/helpers/actions.ts
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Wait for a toast notification to appear and optionally verify its text.
 * Toasts are rendered as [data-testid="toast"] and auto-dismiss after 5s.
 *
 * Usage:
 *   await expectToast(page, 'success', 'Discord bot connected');
 *   await expectToast(page, 'error', 'Invalid bot token');
 */
export async function expectToast(
  page: Page,
  type: 'success' | 'error' | 'info' | 'warning',
  text: string
): Promise<void> {
  const toast = page.locator(`[data-testid="toast"][data-type="${type}"]`);
  await expect(toast).toBeVisible({ timeout: 8000 });
  await expect(toast).toContainText(text);
}

/**
 * Wait for a skeleton loader to disappear (data has loaded).
 * Usage:
 *   await waitForLoadComplete(page);
 */
export async function waitForLoadComplete(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="skeleton"]', {
    state: 'detached',
    timeout: 10000,
  }).catch(() => {
    // No skeleton was present — data was already loaded (SSR)
  });
}

/**
 * Open a confirmation dialog and click the confirm button.
 * Usage:
 *   await confirmDialog(page, 'Delete Discord Connection');
 */
export async function confirmDialog(
  page: Page,
  confirmButtonText: string
): Promise<void> {
  const dialog = page.locator('[role="dialog"][data-testid="confirm-dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await dialog.getByRole('button', { name: confirmButtonText }).click();
  await expect(dialog).not.toBeVisible({ timeout: 5000 });
}

/**
 * Fill and submit the Discord connection form.
 * Assumes we're on /dashboard/settings or a modal with the form.
 *
 * @param botToken — The Discord bot token (real or mock)
 * @param guildId — The Discord guild/server ID
 */
export async function fillDiscordConnectionForm(
  page: Page,
  botToken: string,
  guildId: string
): Promise<void> {
  await page.fill('[data-testid="discord-bot-token-input"]', botToken);
  await page.fill('[data-testid="discord-guild-id-input"]', guildId);
  await page.click('[data-testid="discord-validate-btn"]');
}

/**
 * Fill and submit the Anthropic API key form.
 */
export async function fillAnthropicKeyForm(
  page: Page,
  apiKey: string
): Promise<void> {
  await page.fill('[data-testid="anthropic-api-key-input"]', apiKey);
  await page.click('[data-testid="save-anthropic-key-btn"]');
}

/**
 * Navigate to a dashboard sub-page via the sidebar.
 * @param destination — 'dashboard' | 'integrations' | 'billing' | 'settings'
 */
export async function navigateToDashboardPage(
  page: Page,
  destination: 'dashboard' | 'integrations' | 'billing' | 'settings'
): Promise<void> {
  const testIds: Record<string, string> = {
    dashboard: 'nav-link-dashboard',
    integrations: 'nav-link-integrations',
    billing: 'nav-link-billing',
    settings: 'nav-link-settings',
  };

  await page.click(`[data-testid="${testIds[destination]}"]`);
  await page.waitForURL(`**/${destination === 'dashboard' ? 'dashboard' : `dashboard/${destination}`}*`);
  await waitForLoadComplete(page);
}

/**
 * Take a named screenshot using the manifest naming convention.
 * Convention: {N:04d}_{route}_{state}_{viewport}.png
 *
 * Usage:
 *   await namedScreenshot(page, '0045', 'dashboard', 'bot-online', 'desktop');
 *
 * Stores in e2e/screenshots/actual/ during test runs.
 * Stores in e2e/screenshots/baseline/ when run with --update-snapshots.
 */
export async function namedScreenshot(
  page: Page,
  num: string,
  route: string,
  state: string,
  viewport: 'desktop' | 'mobile' | 'tablet'
): Promise<void> {
  const filename = `${num}_${route}_${state}_${viewport}.png`;
  await page.screenshot({
    path: `e2e/screenshots/actual/${filename}`,
    fullPage: false,
    animations: 'disabled',
  });
}

/**
 * Dismiss any open modals or drawers by pressing Escape.
 */
export async function dismissModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.waitForSelector('[role="dialog"]', {
    state: 'detached',
    timeout: 3000,
  }).catch(() => {
    // No modal was open — that's fine
  });
}

/**
 * Expand a dropdown menu and verify its options.
 * @param triggerTestId — data-testid of the dropdown trigger button
 * @param expectedOptions — array of option label strings to verify are visible
 */
export async function openDropdownAndVerifyOptions(
  page: Page,
  triggerTestId: string,
  expectedOptions: string[]
): Promise<void> {
  await page.click(`[data-testid="${triggerTestId}"]`);
  const menu = page.locator('[role="menu"]');
  await expect(menu).toBeVisible();
  for (const option of expectedOptions) {
    await expect(menu.getByRole('menuitem', { name: option })).toBeVisible();
  }
}
```

### 3.5 Selectors Reference (`e2e/helpers/selectors.ts`)

Every `data-testid` used in tests. The forward loop must add these attributes to every component referenced here.

```typescript
// e2e/helpers/selectors.ts
/**
 * Centralized data-testid selectors for Playwright tests.
 * All components must have these data-testid attributes.
 * Group by component/page.
 */

export const SELECTORS = {
  // ── Global ──────────────────────────────────────────────────
  toast: '[data-testid="toast"]',
  toastSuccess: '[data-testid="toast"][data-type="success"]',
  toastError: '[data-testid="toast"][data-type="error"]',
  skeleton: '[data-testid="skeleton"]',
  confirmDialog: '[role="dialog"][data-testid="confirm-dialog"]',
  loadingSpinner: '[data-testid="loading-spinner"]',

  // ── Navigation (dashboard layout) ────────────────────────────
  sidebar: '[data-testid="sidebar"]',
  navLinkDashboard: '[data-testid="nav-link-dashboard"]',
  navLinkIntegrations: '[data-testid="nav-link-integrations"]',
  navLinkBilling: '[data-testid="nav-link-billing"]',
  navLinkSettings: '[data-testid="nav-link-settings"]',
  navLinkAdmin: '[data-testid="nav-link-admin"]',
  userMenuTrigger: '[data-testid="user-menu-trigger"]',
  signOutBtn: '[data-testid="sign-out-btn"]',
  mobileMenuTrigger: '[data-testid="mobile-menu-trigger"]',
  mobileNav: '[data-testid="mobile-nav"]',

  // ── Landing Page ─────────────────────────────────────────────
  landingHeroTitle: '[data-testid="landing-hero-title"]',
  landingGetStartedBtn: '[data-testid="landing-get-started-btn"]',
  landingViewDocsBtn: '[data-testid="landing-view-docs-btn"]',
  landingPricingSection: '[data-testid="landing-pricing-section"]',
  landingPricingFreeCard: '[data-testid="pricing-card-free"]',
  landingPricingStarterCard: '[data-testid="pricing-card-starter"]',
  landingPricingProCard: '[data-testid="pricing-card-pro"]',

  // ── Auth Pages ───────────────────────────────────────────────
  authEmailInput: '[data-testid="auth-email-input"]',
  authPasswordInput: '[data-testid="auth-password-input"]',
  authConfirmPasswordInput: '[data-testid="auth-confirm-password-input"]',
  authSubmitBtn: '[data-testid="auth-submit-btn"]',
  authLoginLink: '[data-testid="auth-login-link"]',
  authSignupLink: '[data-testid="auth-signup-link"]',
  authForgotPasswordLink: '[data-testid="auth-forgot-password-link"]',
  authErrorAlert: '[data-testid="auth-error-alert"]',
  authSuccessAlert: '[data-testid="auth-success-alert"]',

  // ── Dashboard Home ───────────────────────────────────────────
  botStatusCard: '[data-testid="bot-status-card"]',
  botStatusBadge: '[data-testid="bot-status-badge"]',
  onboardingChecklist: '[data-testid="onboarding-checklist"]',
  onboardingStep: '[data-testid="onboarding-step"]',
  connectBotCta: '[data-testid="connect-bot-cta"]',
  statCardMessages: '[data-testid="stat-card-messages"]',
  statCardToolCalls: '[data-testid="stat-card-tool-calls"]',
  statCardUptime: '[data-testid="stat-card-uptime"]',

  // ── Integrations Page ────────────────────────────────────────
  serviceCard: '[data-testid^="service-card-"]',
  connectGithubBtn: '[data-testid="connect-github-btn"]',
  connectGoogleBtn: '[data-testid="connect-google-btn"]',
  connectLinearBtn: '[data-testid="connect-linear-btn"]',
  connectTogglBtn: '[data-testid="connect-toggl-btn"]',
  disconnectServiceBtn: '[data-testid^="disconnect-service-btn-"]',
  apiKeyModal: '[data-testid="api-key-modal"]',
  apiKeyInput: '[data-testid="api-key-input"]',
  apiKeySaveBtn: '[data-testid="api-key-save-btn"]',

  // ── Billing Page ─────────────────────────────────────────────
  currentPlanCard: '[data-testid="current-plan-card"]',
  upgradeStarterBtn: '[data-testid="upgrade-starter-btn"]',
  upgradeProBtn: '[data-testid="upgrade-pro-btn"]',
  manageSubscriptionBtn: '[data-testid="manage-subscription-btn"]',
  anthropicKeySection: '[data-testid="anthropic-key-section"]',
  anthropicKeyInput: '[data-testid="anthropic-api-key-input"]',
  saveAnthropicKeyBtn: '[data-testid="save-anthropic-key-btn"]',
  anthropicKeyStatus: '[data-testid="anthropic-key-status"]',

  // ── Settings Page ────────────────────────────────────────────
  tenantNameInput: '[data-testid="tenant-name-input"]',
  saveSettingsBtn: '[data-testid="save-settings-btn"]',
  discordBotTokenInput: '[data-testid="discord-bot-token-input"]',
  discordGuildIdInput: '[data-testid="discord-guild-id-input"]',
  discordValidateBtn: '[data-testid="discord-validate-btn"]',
  discordValidationResult: '[data-testid="discord-validation-result"]',
  discordSaveConnectionBtn: '[data-testid="discord-save-connection-btn"]',
  discordDisconnectBtn: '[data-testid="discord-disconnect-btn"]',
  deleteTenantBtn: '[data-testid="delete-tenant-btn"]',
  deleteTenantInput: '[data-testid="delete-tenant-confirm-input"]',
  deleteTenantConfirmBtn: '[data-testid="delete-tenant-confirm-btn"]',

  // ── Admin Panel ──────────────────────────────────────────────
  adminTenantTable: '[data-testid="admin-tenant-table"]',
  adminTenantRow: '[data-testid^="admin-tenant-row-"]',
  adminSearchInput: '[data-testid="admin-search-input"]',
  adminImpersonateBtn: '[data-testid^="admin-impersonate-btn-"]',
  adminSuspendBtn: '[data-testid^="admin-suspend-btn-"]',
  adminUnsuspendBtn: '[data-testid^="admin-unsuspend-btn-"]',
} as const;
```

---

## Section 4: Screenshot Naming Convention

### Rules

| Part | Value |
|------|-------|
| Sequence number | 4-digit zero-padded integer matching the manifest (`0001`–`0260+`) |
| Route slug | `/` → `landing`, `/dashboard` → `dashboard`, `/dashboard/billing` → `dashboard_billing`, `/admin/tenants` → `admin_tenants`, `/blog/[slug]` → `blog_post` |
| State slug | `above-fold`, `bot-online`, `bot-offline`, `empty`, `loading`, `error`, `modal-open`, `dropdown-open`, `form-error`, `toast-success`, `onboarding`, etc. |
| Viewport | `desktop` or `mobile` |
| Extension | `.png` |

### Examples

```
0001_landing_above-fold_desktop.png
0002_landing_above-fold_mobile.png
0045_dashboard_bot-online_desktop.png
0046_dashboard_bot-online_mobile.png
0047_dashboard_bot-offline_desktop.png
0091_dashboard_billing_upgrade-modal_desktop.png
0155_settings_discord-validation-success_desktop.png
```

### Storage

| Location | Purpose |
|----------|---------|
| `e2e/screenshots/baseline/` | Committed to git (via Git LFS). These are the visual regression baselines. |
| `e2e/screenshots/actual/` | Generated on each test run. Gitignored. |
| `playwright-report/` | Playwright HTML report with diff viewer. Generated on each test run. Gitignored. |

### Git LFS Setup

Add to `.gitattributes`:
```
e2e/screenshots/baseline/**/*.png filter=lfs diff=lfs merge=lfs -text
```

Initialize:
```bash
git lfs install
git lfs track "e2e/screenshots/baseline/**/*.png"
```

### Updating Baselines

When visual changes are intentional:
```bash
# Update all baseline screenshots
pnpm test:e2e:update-snapshots

# Update only screenshots for a specific spec file
pnpm exec playwright test e2e/pages/dashboard.spec.ts --update-snapshots
```

---

## Section 5: Visual Regression Setup

### `playwright.config.ts` Snapshot Settings (already included in Section 2)

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 50,       // Absolute pixel count diff allowed
    threshold: 0.1,           // Per-pixel color diff tolerance (0–1)
    animations: 'disabled',   // Pause all CSS animations
  },
},
```

### Visual Regression Test Pattern

```typescript
// In any spec file, mark screenshot tests with @screenshot tag:
test('landing page above-fold @screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`,
  });

  await expect(page).toHaveScreenshot('0001_landing_above-fold_desktop.png', {
    fullPage: false,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
});
```

### CI Integration

Visual regression tests run only when the `@screenshot` tag is present. The CI workflow runs screenshot tests separately:

```yaml
# In .github/workflows/daimon-web-ci.yml, add after e2e-tests job:
visual-regression:
  name: Visual Regression (Playwright Screenshots)
  runs-on: ubuntu-latest
  needs: deploy-vercel
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
      with:
        lfs: true  # CRITICAL: pull baseline screenshots from Git LFS

    - name: Setup pnpm + Node
      # ... (same as other jobs)

    - name: Install Playwright browsers
      run: pnpm --filter web exec playwright install --with-deps chromium

    - name: Run visual regression screenshots
      run: pnpm --filter web test:e2e:screenshots
      env:
        PLAYWRIGHT_BASE_URL: ${{ needs.deploy-vercel.outputs.deployment_url }}
        E2E_TEST_USER_EMAIL: ${{ secrets.E2E_TEST_USER_EMAIL }}
        E2E_TEST_USER_PASSWORD: ${{ secrets.E2E_TEST_USER_PASSWORD }}

    - name: Upload screenshot diffs
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: visual-regression-diffs
        path: |
          apps/web/e2e/screenshots/actual/
          apps/web/playwright-report/
        retention-days: 7
```

---

## Section 6: Example Tests

### 6.1 Landing Page Scroll (`e2e/pages/landing.spec.ts`)

```typescript
// e2e/pages/landing.spec.ts
import { test, expect } from '@playwright/test';
import { namedScreenshot } from '../helpers/actions';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }',
    });
  });

  test('renders hero section with correct headline and CTAs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify hero headline (canonical from landing-page.md)
    await expect(
      page.getByRole('heading', { name: /Your Discord Server\. AI-Powered\. Fully Yours\./i })
    ).toBeVisible();

    // Verify primary CTA
    await expect(
      page.getByRole('link', { name: 'Get Started Free' })
    ).toBeVisible();

    // Verify secondary CTA
    await expect(
      page.getByRole('link', { name: 'View Documentation' })
    ).toBeVisible();
  });

  test('landing above-fold screenshot @screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await namedScreenshot(page, '0001', 'landing', 'above-fold', 'desktop');
  });

  test('nav links are all present and correct', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav.getByRole('link', { name: 'Docs' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });

  test('pricing section shows correct plan names and prices', async ({ page }) => {
    await page.goto('/');
    // Scroll to pricing
    await page.locator('[data-testid="landing-pricing-section"]').scrollIntoViewIfNeeded();

    // Free plan
    const freeCard = page.locator('[data-testid="pricing-card-free"]');
    await expect(freeCard).toContainText('Free');
    await expect(freeCard).toContainText('$0');

    // Starter plan
    const starterCard = page.locator('[data-testid="pricing-card-starter"]');
    await expect(starterCard).toContainText('Starter');
    await expect(starterCard).toContainText('$9');

    // Pro plan
    const proCard = page.locator('[data-testid="pricing-card-pro"]');
    await expect(proCard).toContainText('Pro');
    await expect(proCard).toContainText('$29');
  });

  test('pricing screenshot @screenshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="landing-pricing-section"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // Wait for scroll settle
    await namedScreenshot(page, '0008', 'landing', 'pricing', 'desktop');
  });

  test('mobile: hamburger menu opens and shows nav links', async ({ page }) => {
    // This test runs only on mobile viewport (375px)
    // Playwright project filter handles viewport
    await page.goto('/');
    const hamburger = page.locator('[data-testid="mobile-menu-trigger"]');

    // Desktop: hamburger should not be visible
    // Mobile: hamburger should be visible
    // NOTE: This test is designed to run in mobile-webkit project
    await hamburger.click();

    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Docs' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Log in' })).toBeVisible();
  });

  test('Get Started CTA navigates to /signup', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="landing-get-started-btn"]');
    await expect(page).toHaveURL(/\/signup/);
  });

  test('Log in link navigates to /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Log in' }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
```

### 6.2 Auth Flow (`e2e/flows/auth-flow.spec.ts`)

```typescript
// e2e/flows/auth-flow.spec.ts
/**
 * Full auth flow: signup → email confirmation → login → logout
 *
 * NOTE: Email confirmation is mocked via Supabase local config.
 * With local Supabase (supabase start), email confirmations are auto-confirmed
 * when `enable_confirmations = false` in supabase/config.toml.
 * For CI against real Supabase: use pre-confirmed test accounts (see fixtures/auth.fixture.ts).
 */
import { test, expect } from '@playwright/test';
import { expectToast } from '../helpers/actions';

const UNIQUE_SUFFIX = Date.now(); // Prevent email collisions between test runs

test.describe('Auth Flow', () => {
  test('signup → redirect to dashboard', async ({ page }) => {
    const email = `e2e-signup-${UNIQUE_SUFFIX}@daimon-test.io`;
    const password = 'TestE2EPassword123!';

    await page.goto('/signup');

    // Fill signup form
    await page.fill('[data-testid="auth-email-input"]', email);
    await page.fill('[data-testid="auth-password-input"]', password);
    await page.fill('[data-testid="auth-confirm-password-input"]', password);

    // Accept terms
    await page.check('[data-testid="auth-terms-checkbox"]');

    // Submit
    await page.click('[data-testid="auth-submit-btn"]');

    // Expect redirect to dashboard (auto-confirm mode) or email sent page
    // In local Supabase with auto-confirm:
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.locator('[data-testid="onboarding-checklist"]')).toBeVisible();
  });

  test('login with valid credentials → redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="auth-email-input"]', 'test-free-online@daimon-test.io');
    await page.fill('[data-testid="auth-password-input"]', 'TestPassword123!');
    await page.click('[data-testid="auth-submit-btn"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('login with invalid credentials → shows error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="auth-email-input"]', 'notareal@example.com');
    await page.fill('[data-testid="auth-password-input"]', 'WrongPassword!');
    await page.click('[data-testid="auth-submit-btn"]');

    const errorAlert = page.locator('[data-testid="auth-error-alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText('Invalid email or password');

    // Should remain on /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup with weak password → shows validation error', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[data-testid="auth-email-input"]', `weak-${UNIQUE_SUFFIX}@test.io`);
    await page.fill('[data-testid="auth-password-input"]', '123');
    await page.fill('[data-testid="auth-confirm-password-input"]', '123');
    await page.click('[data-testid="auth-submit-btn"]');

    // Should show password strength error without submitting
    await expect(
      page.locator('[data-testid="auth-password-error"]')
    ).toContainText('Password must be at least 8 characters');

    await expect(page).toHaveURL(/\/signup/);
  });

  test('signup with mismatched passwords → shows error', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[data-testid="auth-email-input"]', `mismatch-${UNIQUE_SUFFIX}@test.io`);
    await page.fill('[data-testid="auth-password-input"]', 'ValidPassword123!');
    await page.fill('[data-testid="auth-confirm-password-input"]', 'DifferentPassword123!');
    await page.click('[data-testid="auth-submit-btn"]');

    await expect(
      page.locator('[data-testid="auth-confirm-password-error"]')
    ).toContainText('Passwords do not match');
  });

  test('logout → redirects to /', async ({ page }) => {
    // Start authenticated (navigate to login first)
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'test-free-online@daimon-test.io');
    await page.fill('[data-testid="auth-password-input"]', 'TestPassword123!');
    await page.click('[data-testid="auth-submit-btn"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Open user menu and sign out
    await page.click('[data-testid="user-menu-trigger"]');
    await page.click('[data-testid="sign-out-btn"]');

    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('unauthenticated access to /dashboard → redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=.*dashboard/, { timeout: 5000 });
  });

  test('authenticated user visiting /login → redirects to /dashboard', async ({ page }) => {
    // Authenticate via UI
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'test-free-online@daimon-test.io');
    await page.fill('[data-testid="auth-password-input"]', 'TestPassword123!');
    await page.click('[data-testid="auth-submit-btn"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Now try to visit /login again
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test('forgot password → shows email sent confirmation', async ({ page }) => {
    await page.goto('/reset-password');

    await page.fill('[data-testid="auth-email-input"]', 'test-free-online@daimon-test.io');
    await page.click('[data-testid="auth-submit-btn"]');

    const successAlert = page.locator('[data-testid="auth-success-alert"]');
    await expect(successAlert).toBeVisible({ timeout: 5000 });
    await expect(successAlert).toContainText('Check your email');
  });
});
```

### 6.3 Dashboard — Bot Online vs Offline (`e2e/pages/dashboard.spec.ts`)

```typescript
// e2e/pages/dashboard.spec.ts
import { test as authTest, expect } from '../fixtures/auth.fixture';
import { waitForLoadComplete, namedScreenshot } from '../helpers/actions';

authTest.describe('Dashboard — Bot Status', () => {
  authTest('bot-online: shows Online badge and statistics', async ({ freeBotOnlinePage: page }) => {
    await page.goto('/dashboard');
    await waitForLoadComplete(page);

    // Bot status card
    const statusCard = page.locator('[data-testid="bot-status-card"]');
    await expect(statusCard).toBeVisible();

    const badge = page.locator('[data-testid="bot-status-badge"]');
    await expect(badge).toContainText('Online');
    await expect(badge).toHaveAttribute('data-status', 'connected');

    // Statistics cards are visible (not empty state)
    await expect(page.locator('[data-testid="stat-card-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-card-tool-calls"]')).toBeVisible();

    // No onboarding checklist shown for configured user
    await expect(page.locator('[data-testid="onboarding-checklist"]')).not.toBeVisible();
  });

  authTest('bot-online screenshot @screenshot', async ({ freeBotOnlinePage: page }) => {
    await page.goto('/dashboard');
    await waitForLoadComplete(page);
    await namedScreenshot(page, '0045', 'dashboard', 'bot-online', 'desktop');
  });

  authTest('bot-offline: shows Offline badge and reconnect CTA', async ({ freeBotOfflinePage: page }) => {
    await page.goto('/dashboard');
    await waitForLoadComplete(page);

    const badge = page.locator('[data-testid="bot-status-badge"]');
    await expect(badge).toContainText('Offline');
    await expect(badge).toHaveAttribute('data-status', 'disconnected');

    // Reconnect CTA shown
    const reconnectCta = page.locator('[data-testid="connect-bot-cta"]');
    await expect(reconnectCta).toBeVisible();
    await expect(reconnectCta).toContainText('Reconnect');
  });

  authTest('bot-offline screenshot @screenshot', async ({ freeBotOfflinePage: page }) => {
    await page.goto('/dashboard');
    await waitForLoadComplete(page);
    await namedScreenshot(page, '0047', 'dashboard', 'bot-offline', 'desktop');
  });

  authTest('onboarding: shows checklist with correct steps', async ({ onboardingPage: page }) => {
    await page.goto('/dashboard');
    await waitForLoadComplete(page);

    const checklist = page.locator('[data-testid="onboarding-checklist"]');
    await expect(checklist).toBeVisible();

    // Expect the 3 onboarding steps
    const steps = page.locator('[data-testid="onboarding-step"]');
    await expect(steps).toHaveCount(3);

    // Step labels
    await expect(steps.nth(0)).toContainText('Connect your Discord bot');
    await expect(steps.nth(1)).toContainText('Add your Anthropic API key');
    await expect(steps.nth(2)).toContainText('Invite the bot to your server');
  });

  authTest('onboarding screenshot @screenshot', async ({ onboardingPage: page }) => {
    await page.goto('/dashboard');
    await waitForLoadComplete(page);
    await namedScreenshot(page, '0049', 'dashboard', 'onboarding', 'desktop');
  });
});
```

### 6.4 GitHub OAuth Connect Mock (`e2e/flows/github-oauth.spec.ts`)

```typescript
// e2e/flows/github-oauth.spec.ts
import { test as authTest, expect } from '../fixtures/auth.fixture';
import { mockGitHubOAuth } from '../helpers/mocks';
import { expectToast, waitForLoadComplete } from '../helpers/actions';
import { resetServiceConnections } from '../fixtures/seed.fixture';

authTest.describe('GitHub OAuth Integration', () => {
  authTest.afterEach(async () => {
    // Reset GitHub connection after each test to avoid state bleed
    await resetServiceConnections('00000000-0000-0000-0000-000000000004');
  });

  authTest('connect GitHub successfully → shows Connected badge', async ({ starterPage: page }) => {
    // Mock the OAuth flow
    await mockGitHubOAuth(page, 'success');

    await page.goto('/dashboard/integrations');
    await waitForLoadComplete(page);

    // Find GitHub service card
    const githubCard = page.locator('[data-testid="service-card-github"]');
    await expect(githubCard).toBeVisible();

    // Verify initial state is "Not connected"
    await expect(githubCard.locator('[data-testid="service-status"]')).toContainText('Not connected');

    // Click connect
    await page.click('[data-testid="connect-github-btn"]');

    // After mock OAuth redirect, verify connected state
    await waitForLoadComplete(page);
    await expect(githubCard.locator('[data-testid="service-status"]')).toContainText('Connected', { timeout: 8000 });

    // Success toast
    await expectToast(page, 'success', 'GitHub connected');
  });

  authTest('connect GitHub → user denies → shows error toast', async ({ starterPage: page }) => {
    await mockGitHubOAuth(page, 'error');

    await page.goto('/dashboard/integrations');
    await waitForLoadComplete(page);

    await page.click('[data-testid="connect-github-btn"]');

    // Error toast
    await expectToast(page, 'error', 'GitHub connection cancelled');
  });

  authTest('disconnect GitHub → confirmation dialog → disconnected', async ({ starterPage: page }) => {
    // Pre-seed: inject a GitHub connection for this tenant
    // (In a full test suite, you'd seed this in beforeEach via seed.fixture.ts)
    // For now, connect first via mock, then disconnect
    await mockGitHubOAuth(page, 'success');

    await page.goto('/dashboard/integrations');
    await waitForLoadComplete(page);
    await page.click('[data-testid="connect-github-btn"]');
    await waitForLoadComplete(page);

    // Now disconnect
    await page.click('[data-testid="disconnect-service-btn-github"]');

    // Confirmation dialog
    const dialog = page.locator('[role="dialog"][data-testid="confirm-dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Disconnect GitHub');
    await dialog.getByRole('button', { name: 'Disconnect' }).click();

    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    await expectToast(page, 'success', 'GitHub disconnected');

    // Verify status back to "Not connected"
    const githubCard = page.locator('[data-testid="service-card-github"]');
    await expect(githubCard.locator('[data-testid="service-status"]')).toContainText('Not connected');
  });
});
```

### 6.5 Billing Upgrade Flow (`e2e/flows/billing-upgrade.spec.ts`)

```typescript
// e2e/flows/billing-upgrade.spec.ts
import { test as authTest, expect } from '../fixtures/auth.fixture';
import { mockStripeCheckout, mockStripePortal } from '../helpers/mocks';
import { expectToast, waitForLoadComplete, namedScreenshot } from '../helpers/actions';

authTest.describe('Billing Upgrade Flow', () => {
  authTest('free plan → upgrade to Starter → redirects to Stripe Checkout', async ({ onboardingPage: page }) => {
    // Mock Stripe Checkout to simulate success
    await mockStripeCheckout(page, 'success');

    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);

    // Verify current plan shown as Free
    const currentPlan = page.locator('[data-testid="current-plan-card"]');
    await expect(currentPlan).toContainText('Free');

    // Click upgrade to Starter
    await page.click('[data-testid="upgrade-starter-btn"]');

    // Wait for mock Stripe redirect (resolves to /dashboard/billing?session=mock_session_123&success=true)
    await page.waitForURL(/\/dashboard\/billing.*success=true/, { timeout: 10000 });

    // Success toast
    await expectToast(page, 'success', "You're now on the Starter plan");

    // Current plan card should now show Starter
    await expect(currentPlan).toContainText('Starter', { timeout: 8000 });
  });

  authTest('Starter plan → manage subscription → opens Stripe Portal', async ({ starterPage: page }) => {
    await mockStripePortal(page);

    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);

    // Verify current plan shown as Starter
    const currentPlan = page.locator('[data-testid="current-plan-card"]');
    await expect(currentPlan).toContainText('Starter');

    // Click "Manage subscription" (opens Stripe Portal)
    await page.click('[data-testid="manage-subscription-btn"]');

    // Portal mock redirects back to /dashboard/billing
    await page.waitForURL(/\/dashboard\/billing/, { timeout: 10000 });
  });

  authTest('billing page screenshot — free plan @screenshot', async ({ onboardingPage: page }) => {
    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);
    await namedScreenshot(page, '0091', 'dashboard_billing', 'free-plan', 'desktop');
  });

  authTest('billing page screenshot — starter plan @screenshot', async ({ starterPage: page }) => {
    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);
    await namedScreenshot(page, '0093', 'dashboard_billing', 'starter-plan', 'desktop');
  });

  authTest('save Anthropic API key → success toast', async ({ onboardingPage: page }) => {
    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);

    // Fill in Anthropic API key
    await page.fill('[data-testid="anthropic-api-key-input"]', 'sk-ant-api03-test-key-placeholder');
    await page.click('[data-testid="save-anthropic-key-btn"]');

    await expectToast(page, 'success', 'Anthropic API key saved');

    // Key status shows "Saved"
    await expect(page.locator('[data-testid="anthropic-key-status"]')).toContainText('Saved');
  });

  authTest('invalid Anthropic API key format → validation error', async ({ onboardingPage: page }) => {
    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);

    // Fill in invalid key
    await page.fill('[data-testid="anthropic-api-key-input"]', 'not-a-valid-key');
    await page.click('[data-testid="save-anthropic-key-btn"]');

    // Inline validation error
    await expect(
      page.locator('[data-testid="anthropic-key-error"]')
    ).toContainText('API key must start with sk-ant-');

    // No toast shown (client-side validation prevents submission)
    await expect(page.locator('[data-testid="toast"]')).not.toBeVisible();
  });

  authTest('upgrade canceled → stays on billing page, no plan change', async ({ onboardingPage: page }) => {
    await mockStripeCheckout(page, 'cancel');

    await page.goto('/dashboard/billing');
    await waitForLoadComplete(page);

    await page.click('[data-testid="upgrade-starter-btn"]');

    // Mock cancel redirects to /dashboard/billing?canceled=true
    await page.waitForURL(/\/dashboard\/billing.*canceled=true/, { timeout: 10000 });

    // No success toast
    await expect(page.locator('[data-testid="toast"][data-type="success"]')).not.toBeVisible();

    // Plan still shows Free
    const currentPlan = page.locator('[data-testid="current-plan-card"]');
    await expect(currentPlan).toContainText('Free');
  });
});
```

---

## Section 7: Data-TestID Requirements

Every component in the frontend must implement `data-testid` attributes as listed in `SELECTORS` (Section 3.5) and as referenced in the example tests above. The forward loop must add `data-testid` to every interactive element and every element tested for content/visibility.

### Rules for `data-testid` Placement

1. **Every button** that triggers a mutation or navigation must have a `data-testid`.
2. **Every form input** must have a `data-testid` matching the selector in `SELECTORS`.
3. **Every status indicator** (badge, card, alert) must have a `data-testid`.
4. **Every list item** in dynamic lists uses a prefixed `data-testid` with the item ID: `data-testid="admin-tenant-row-{id}"`.
5. **Every toast notification** rendered by the toast system must include `data-testid="toast"` and `data-type="success|error|info|warning"`.
6. **Every confirmation dialog** must have `role="dialog"` and `data-testid="confirm-dialog"`.
7. **Every skeleton loader** must have `data-testid="skeleton"`.
8. **Every modal** must have `role="dialog"` and a descriptive `data-testid`.

### `data-testid` Are Never Removed

Once added, `data-testid` attributes must not be removed. They are part of the public test contract. If a component is refactored, the `data-testid` moves with it.

---

## Section 8: Test Coverage Matrix

The forward loop must implement tests covering every row in this matrix before the test suite is considered complete.

| Page | Spec File | Coverage Areas |
|------|-----------|----------------|
| `/` | `pages/landing.spec.ts` | Hero renders, nav links correct, pricing correct, CTA navigation, mobile menu, footer links |
| `/login` | `pages/auth.spec.ts` | Valid login, invalid creds error, form validation, redirect to dashboard, redirect if authenticated |
| `/signup` | `pages/auth.spec.ts` | Valid signup, weak password, mismatched passwords, duplicate email, terms acceptance required |
| `/reset-password` | `pages/auth.spec.ts` | Email sent confirmation, invalid email format |
| `/dashboard` | `pages/dashboard.spec.ts` | Bot online state, bot offline state, onboarding state, stat cards visible, real-time badge update |
| `/dashboard/integrations` | `pages/integrations.spec.ts` | All service cards visible, connect GitHub, connect Google, connect Linear, connect Toggl via API key, disconnect flow, already-connected state |
| `/dashboard/billing` | `pages/billing.spec.ts` | Free plan display, Starter plan display, Pro plan display, upgrade to Starter, upgrade to Pro, cancel upgrade, manage subscription, save Anthropic key, invalid key format |
| `/dashboard/settings` | `pages/settings.spec.ts` | Discord token save, validation success, validation error (invalid token), validation error (bot not in guild), update tenant name, danger zone delete flow |
| `/admin/tenants` | `pages/admin.spec.ts` | Tenant list renders, search works, tenant detail page, suspend flow, unsuspend flow, impersonation start |
| `/docs/**` | `pages/docs.spec.ts` | Quick start renders, tool reference renders, FAQ renders, billing docs renders, in-page nav works |
| `/changelog` | `pages/changelog.spec.ts` | Renders change entries, dates displayed |
| `/about` | `pages/about.spec.ts` | Renders without error |
| `/blog` | `pages/blog.spec.ts` | Index renders, post link works, post page renders |
| `/legal/cookies` | `pages/legal.spec.ts` | Renders cookie policy text |
| `/terms` | `pages/legal.spec.ts` | Renders ToS text |
| `/privacy` | `pages/legal.spec.ts` | Renders privacy policy text |
| `404` | `pages/errors.spec.ts` | 404 page renders with home link |
| Full onboarding flow | `flows/onboarding.spec.ts` | signup → dashboard → Discord token → Anthropic key → bot connects |
| Full billing upgrade | `flows/billing-upgrade.spec.ts` | Free → Starter via Stripe mock → success message |
| GitHub OAuth | `flows/github-oauth.spec.ts` | Connect, deny, disconnect |
| Google OAuth | `flows/google-oauth.spec.ts` | Connect, deny, disconnect |
| Linear OAuth | `flows/linear-oauth.spec.ts` | Connect, deny, disconnect |
| Toggl API key | `flows/toggl-connect.spec.ts` | Valid key → connected, invalid key → error |

---

## Section 9: Running the Test Suite

### Local (against local Supabase)

```bash
# 1. Start local Supabase (see deployment/ci-cd.md Section 4 for full setup)
supabase start

# 2. Apply migrations and seed test data
supabase db reset  # Runs all migrations + supabase/seed.sql

# 3. Start Next.js dev server (in a separate terminal)
pnpm --filter web dev

# 4. Run all E2E tests
pnpm --filter web test:e2e

# 5. Run with UI (interactive)
pnpm --filter web test:e2e:ui

# 6. Run only screenshot tests
pnpm --filter web test:e2e:screenshots

# 7. Update screenshot baselines
pnpm --filter web test:e2e:update-snapshots
```

### CI (against Vercel preview)

Handled automatically by `.github/workflows/daimon-web-ci.yml` Job 7 (`e2e-tests`).
The `PLAYWRIGHT_BASE_URL` is set to the Vercel preview URL.
Test user credentials come from `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` secrets.

### Debug a failing test

```bash
# Run in headed mode (shows browser)
pnpm --filter web test:e2e:headed --grep "bot-online"

# Run in debug mode (pauses at each step)
pnpm --filter web test:e2e:debug e2e/pages/dashboard.spec.ts

# Show the last HTML report
pnpm --filter web test:e2e:report
```

### Interpreting Trace Files

When a CI test fails, download the trace artifact:
```bash
# Extract the zip from GitHub Actions artifacts
npx playwright show-trace trace.zip
```

The trace viewer shows every action, network request, and console log. Look for:
- Red network requests (4xx/5xx responses)
- Missing `data-testid` attributes (test couldn't find element)
- Timeout errors (element never became visible — check loading states)

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Daimon SaaS — Playwright Configuration
 *
 * E2E tests run against:
 * - Local dev server (default): http://localhost:3000 with local Supabase (http://localhost:54321)
 * - CI preview deployment: PLAYWRIGHT_BASE_URL set by GitHub Actions to the Vercel preview URL
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
  forbidOnly: !!process.env.CI,        // Fail CI if test.only is left in
  retries: process.env.CI ? 2 : 0,     // Retry flaky tests on CI only
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,                      // 30s per test
  expect: {
    timeout: 10_000,                    // 10s for assertions
    toHaveScreenshot: {
      maxDiffPixels: 50,                // Allow 50px difference (anti-aliasing)
      threshold: 0.1,                   // 10% pixel difference threshold
      animations: 'disabled',          // Pause CSS animations for consistency
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  // ──────────────────────────────────────────────────────────
  // Global setup: start Supabase if running locally
  // ──────────────────────────────────────────────────────────
  globalSetup: USE_LOCAL_SUPABASE
    ? path.join(__dirname, 'e2e/global-setup.ts')
    : undefined,

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
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],

  // ──────────────────────────────────────────────────────────
  // Shared options for all projects
  // ──────────────────────────────────────────────────────────
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',           // Capture trace on retry for debugging
    screenshot: 'only-on-failure',      // Auto-capture on failure
    video: 'retain-on-failure',         // Retain video on failure
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  // ──────────────────────────────────────────────────────────
  // Projects: desktop + mobile + tablet + screenshot variants
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

    // ── Tablet (768×1024, Chromium) — for responsive breakpoint tests ──
    {
      name: 'tablet-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },

    // ── Screenshot-only projects: tagged with @screenshot ──
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
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_LOCAL_ANON_KEY || '',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || '',
          NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_TEST_PUBLISHABLE_KEY || 'pk_test_placeholder',
          STRIPE_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY || 'sk_test_placeholder',
          STRIPE_WEBHOOK_SECRET: process.env.STRIPE_TEST_WEBHOOK_SECRET || 'whsec_placeholder',
        },
      }
    : undefined,
});

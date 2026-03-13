# CI/CD Pipeline — Daimon SaaS

> Aspect: 6.2 — GitHub Actions workflow, test suite, deploy triggers, preview deployments
> Written: 2026-03-13
> Related: [infrastructure.md](./infrastructure.md), [environment.md](./environment.md), [domains.md](./domains.md)

---

## Overview

Daimon uses **GitHub Actions** as its sole CI/CD platform. Three independent workflows cover the three deployable components:

| Workflow File | Trigger | Deploys To |
|--------------|---------|-----------|
| `.github/workflows/daimon-web-ci.yml` | Push to `main`, PR to `main` | Vercel (production + preview) |
| `.github/workflows/daimon-bot-deploy.yml` | Push to `main` (path filter: `apps/bot/**`) | Fly.io |
| `.github/workflows/daimon-db-migrate.yml` | Manual dispatch + push to `main` (path filter: `supabase/migrations/**`) | Supabase (production) |

---

## Section 1: Website CI/CD (`daimon-web-ci.yml`)

### 1.1 Full Workflow File

```yaml
# .github/workflows/daimon-web-ci.yml
name: Daimon Web — CI/CD

on:
  push:
    branches:
      - main
    paths:
      - 'apps/web/**'
      - 'packages/**'
      - '.github/workflows/daimon-web-ci.yml'
  pull_request:
    branches:
      - main
    paths:
      - 'apps/web/**'
      - 'packages/**'
      - '.github/workflows/daimon-web-ci.yml'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  # ────────────────────────────────────────────────────────
  # Job 1: Install & Cache Dependencies
  # ────────────────────────────────────────────────────────
  install:
    name: Install Dependencies
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            apps/web/node_modules
            packages/*/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

  # ────────────────────────────────────────────────────────
  # Job 2: Type Check
  # ────────────────────────────────────────────────────────
  typecheck:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    needs: install
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            apps/web/node_modules
            packages/*/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run TypeScript type check
        run: pnpm --filter web exec tsc --noEmit
        working-directory: .

  # ────────────────────────────────────────────────────────
  # Job 3: Lint
  # ────────────────────────────────────────────────────────
  lint:
    name: ESLint + Prettier Check
    runs-on: ubuntu-latest
    needs: install
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            apps/web/node_modules
            packages/*/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm --filter web lint
        working-directory: .

      - name: Check Prettier formatting
        run: pnpm --filter web exec prettier --check "src/**/*.{ts,tsx,css}"
        working-directory: .

  # ────────────────────────────────────────────────────────
  # Job 4: Unit Tests
  # ────────────────────────────────────────────────────────
  unit-tests:
    name: Unit Tests (Vitest)
    runs-on: ubuntu-latest
    needs: install
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            apps/web/node_modules
            packages/*/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm --filter web test:unit --reporter=verbose --reporter=junit --outputFile=test-results/junit.xml
        working-directory: .
        env:
          # Vitest needs these to run validation logic tests
          NEXT_PUBLIC_SUPABASE_URL: https://test.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: test-anon-key

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: unit-test-results
          path: apps/web/test-results/junit.xml
          retention-days: 7

      - name: Publish Test Results
        if: always()
        uses: EnricoMi/publish-unit-test-result-action@v2
        with:
          files: apps/web/test-results/junit.xml
          check_name: Unit Test Results

  # ────────────────────────────────────────────────────────
  # Job 5: Build Check
  # ────────────────────────────────────────────────────────
  build:
    name: Next.js Build
    runs-on: ubuntu-latest
    needs: [typecheck, lint]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            apps/web/node_modules
            packages/*/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Next.js
        run: pnpm --filter web build
        working-directory: .
        env:
          # Dummy values for build-time env validation — real values set in Vercel
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiJ9.placeholder
          NEXT_PUBLIC_APP_URL: https://daimon.pymc.io
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_placeholder
          SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiJ9.placeholder
          SUPABASE_JWT_SECRET: placeholder-jwt-secret-32-chars-min
          STRIPE_SECRET_KEY: sk_test_placeholder
          STRIPE_WEBHOOK_SECRET: whsec_placeholder
          STRIPE_STARTER_MONTHLY_PRICE_ID: price_placeholder
          STRIPE_STARTER_ANNUAL_PRICE_ID: price_placeholder
          STRIPE_PRO_MONTHLY_PRICE_ID: price_placeholder
          STRIPE_PRO_ANNUAL_PRICE_ID: price_placeholder
          GITHUB_OAUTH_CLIENT_ID: placeholder
          GITHUB_OAUTH_CLIENT_SECRET: placeholder
          GOOGLE_OAUTH_CLIENT_ID: placeholder
          GOOGLE_OAUTH_CLIENT_SECRET: placeholder
          LINEAR_OAUTH_CLIENT_ID: placeholder
          LINEAR_OAUTH_CLIENT_SECRET: placeholder
          ADMIN_SECRET_KEY: placeholder-admin-secret-key

      - name: Upload build artifact (for E2E)
        uses: actions/upload-artifact@v4
        with:
          name: nextjs-build
          path: apps/web/.next
          retention-days: 1

  # ────────────────────────────────────────────────────────
  # Job 6: Deploy to Vercel (Production or Preview)
  # ────────────────────────────────────────────────────────
  deploy-vercel:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: [build, unit-tests]
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }}
      url: ${{ steps.deploy.outputs.deployment_url }}
    outputs:
      deployment_url: ${{ steps.deploy.outputs.deployment_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel environment
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
          fi
        working-directory: apps/web
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build with Vercel
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel build --token=${{ secrets.VERCEL_TOKEN }}
          fi
        working-directory: apps/web
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            DEPLOYMENT_URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          else
            DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          fi
          echo "deployment_url=$DEPLOYMENT_URL" >> "$GITHUB_OUTPUT"
          echo "Deployed to: $DEPLOYMENT_URL"
        working-directory: apps/web
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Comment preview URL on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ steps.deploy.outputs.deployment_url }}';
            const body = `## Vercel Preview Deployment\n\n✅ Preview deployed: [${url}](${url})\n\n| Check | Status |\n|-------|--------|\n| TypeScript | ✅ Pass |\n| ESLint | ✅ Pass |\n| Unit Tests | ✅ Pass |\n| Build | ✅ Pass |`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body,
            });

  # ────────────────────────────────────────────────────────
  # Job 7: E2E Tests (Playwright) — PR only, against preview
  # ────────────────────────────────────────────────────────
  e2e-tests:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: deploy-vercel
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm --filter web exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm --filter web test:e2e
        working-directory: .
        env:
          PLAYWRIGHT_BASE_URL: ${{ needs.deploy-vercel.outputs.deployment_url }}
          # E2E test user credentials (Supabase test account, seeded in CI)
          E2E_TEST_USER_EMAIL: ${{ secrets.E2E_TEST_USER_EMAIL }}
          E2E_TEST_USER_PASSWORD: ${{ secrets.E2E_TEST_USER_PASSWORD }}

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 7
```

---

## Section 2: Bot Deploy Workflow (`daimon-bot-deploy.yml`)

### 2.1 Full Workflow File

```yaml
# .github/workflows/daimon-bot-deploy.yml
name: Daimon Bot — Deploy to Fly.io

on:
  push:
    branches:
      - main
    paths:
      - 'apps/bot/**'
      - '.github/workflows/daimon-bot-deploy.yml'
  workflow_dispatch:
    inputs:
      force_deploy:
        description: 'Force deploy even if no bot changes'
        required: false
        default: 'false'
        type: boolean

jobs:
  deploy-bot:
    name: Deploy Bot to Fly.io
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install uv
        run: pip install uv

      - name: Lint with ruff
        run: |
          uv run ruff check apps/bot/src_v2/
          uv run ruff format --check apps/bot/src_v2/
        working-directory: apps/bot

      - name: Type check with pyright
        run: uv run pyright apps/bot/src_v2/
        working-directory: apps/bot

      - name: Run bot unit tests
        run: uv run pytest apps/bot/tests/ -v --tb=short
        working-directory: apps/bot
        env:
          # Minimal test env — tests use mocks, no real services
          SUPABASE_URL: https://test.supabase.co
          SUPABASE_ANON_KEY: test-anon-key
          SUPABASE_SERVICE_ROLE_KEY: test-service-key
          ANTHROPIC_API_KEY: test-anthropic-key
          DISCORD_BOT_TOKEN: test-discord-token

      - name: Install Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only --config apps/bot/fly.toml
        working-directory: .
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Verify deployment health
        run: |
          # Wait for the new instance to report healthy
          echo "Waiting for bot to start..."
          sleep 30
          # Check Fly status
          flyctl status --app daimon-bot
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## Section 3: Database Migration Workflow (`daimon-db-migrate.yml`)

### 3.1 Full Workflow File

```yaml
# .github/workflows/daimon-db-migrate.yml
name: Daimon DB — Run Migrations

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "migrate-production" to confirm running migrations on production'
        required: true
        type: string
      dry_run:
        description: 'Dry run (print migrations without executing)'
        required: false
        default: 'true'
        type: boolean
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  validate-migrations:
    name: Validate Migration Files
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Validate migration file naming
        run: |
          # Ensure all migration files follow YYYYMMDDHHMMSS_description.sql format
          for f in supabase/migrations/*.sql; do
            filename=$(basename "$f")
            if ! echo "$filename" | grep -qE '^[0-9]{14}_[a-z0-9_]+\.sql$'; then
              echo "ERROR: Migration file '$filename' does not follow naming convention"
              echo "Expected format: YYYYMMDDHHMMSS_description.sql"
              exit 1
            fi
          done
          echo "All migration files follow naming convention"

      - name: Validate SQL syntax (dry run via Supabase CLI)
        run: supabase db diff --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

  run-migrations:
    name: Run Migrations on Production
    runs-on: ubuntu-latest
    needs: validate-migrations
    environment: production
    # Only run on manual dispatch with correct confirmation word,
    # OR on push to main (auto-apply new migration files)
    if: |
      (github.event_name == 'workflow_dispatch' && github.event.inputs.confirm == 'migrate-production') ||
      github.event_name == 'push'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run migrations (dry run)
        if: github.event.inputs.dry_run == 'true'
        run: supabase db push --dry-run
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run migrations (apply)
        if: github.event.inputs.dry_run != 'true' || github.event_name == 'push'
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Database migration failed on production',
              body: `Migration failed in workflow run: ${context.runId}\n\nCheck the [workflow logs](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) immediately.`,
              labels: ['incident', 'database'],
            });
```

---

## Section 4: GitHub Repository Secrets

All secrets must be configured in the GitHub repository under: Settings → Secrets and variables → Actions → Secrets.

### 4.1 Website CI/CD Secrets

| Secret Name | Source | Description |
|------------|--------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Account Settings → Tokens → Create Token | Personal access token for Vercel CLI deploys. Scope: Full Account. |
| `VERCEL_ORG_ID` | Run `vercel whoami --json` or Vercel Dashboard → Team Settings → General → Team ID | The Vercel team/organization ID. |
| `VERCEL_PROJECT_ID` | Run `vercel link` in `apps/web/` then check `.vercel/project.json` → `projectId` | The Vercel project ID for the web app. |
| `E2E_TEST_USER_EMAIL` | Created manually in Supabase Auth dashboard | Email address of the test Supabase user for E2E tests. Example: `e2e-test@daimon-test.internal` |
| `E2E_TEST_USER_PASSWORD` | Created manually in Supabase Auth dashboard | Password for the E2E test user. Min 12 chars, store in 1Password. |

### 4.2 Bot Deploy Secrets

| Secret Name | Source | Description |
|------------|--------|-------------|
| `FLY_API_TOKEN` | Fly.io Dashboard → Account Settings → Access Tokens → Create Token | Deploy token for Fly.io. Scope: Deploy access to `daimon-bot` app only. |

### 4.3 Database Migration Secrets

| Secret Name | Source | Description |
|------------|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase Dashboard → Account → Access Tokens → Generate new token | Personal access token for Supabase CLI. Used to link and push migrations. |
| `SUPABASE_PROJECT_REF` | Supabase Dashboard → Project Settings → General → Reference ID | The project reference ID (e.g., `abcdefghijklmnop`). 20-char alphanumeric. |

### 4.4 Shared/Notification Secrets

| Secret Name | Source | Description |
|------------|--------|-------------|
| `GH_PAT` | GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token | PAT for creating issues on migration failure. Needs `issues: write` permission on the monorepo. |

---

## Section 5: Test Suite Specification

### 5.1 Unit Tests (Vitest)

**Location**: `apps/web/src/**/__tests__/` or `apps/web/src/**/*.test.ts(x)`

**Framework**: Vitest + React Testing Library + jsdom

**Configuration file**: `apps/web/vitest.config.ts`

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Test setup file**: `apps/web/src/test/setup.ts`

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}))

// Suppress console.error for expected test failures
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Error: Not implemented: navigation'))
    ) {
      return
    }
    originalConsoleError(...args)
  }
})
afterAll(() => {
  console.error = originalConsoleError
})
```

**Test npm scripts** (add to `apps/web/package.json`):

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage"
  }
}
```

**What unit tests cover** (every file in `src/` with `__tests__/` co-located):

| Test File | What It Tests |
|-----------|--------------|
| `src/lib/validation/__tests__/discord.test.ts` | Discord bot token format validation — valid tokens, invalid tokens (too short, wrong prefix, special characters) |
| `src/lib/validation/__tests__/api-keys.test.ts` | Anthropic key format (`sk-ant-...`), OpenAI key format (`sk-...`), Toggl key format (alphanumeric, 32-char), empty string rejection |
| `src/lib/validation/__tests__/auth.test.ts` | Email format validation, password strength rules (8+ chars, uppercase, lowercase, digit, special), matching passwords |
| `src/lib/stripe/__tests__/format.test.ts` | Price formatting (`$9/month`, `$108/year`), plan name display, billing cycle label |
| `src/lib/tenant/__tests__/status.test.ts` | Tenant status color mapping (active → green, degraded → yellow, disconnected → red), status label text |
| `src/components/ui/__tests__/Button.test.tsx` | Renders correctly, loading state disables click and shows spinner, disabled state, variant class application |
| `src/components/ui/__tests__/FormInput.test.tsx` | Label renders, error message renders when `error` prop set, password toggle shows/hides value, required attribute |
| `src/components/ui/__tests__/Badge.test.tsx` | Color variants render correct CSS classes, text renders correctly |
| `src/components/ui/__tests__/StatusIndicator.test.tsx` | All status values map to correct color + label |
| `src/components/ui/__tests__/Modal.test.tsx` | Opens/closes on prop change, Escape key closes, click-outside closes, focus trap inside modal |
| `src/components/ui/__tests__/Toast.test.tsx` | Auto-dismiss timer, manual dismiss, variant icon mapping (success/error/warning/info) |
| `src/components/dashboard/__tests__/StatusCard.test.tsx` | Renders stat value, trend direction arrow, correct color for positive/negative trends |
| `src/app/(auth)/__tests__/signup-validation.test.ts` | Form-level validation before submit, field-level error display, terms checkbox required |
| `src/app/(dashboard)/integrations/__tests__/service-icons.test.ts` | Service name → icon component mapping completeness |
| `src/lib/supabase/__tests__/middleware.test.ts` | Auth cookie refresh logic, redirect to login for protected routes when no session |

### 5.2 E2E Tests (Playwright)

**Location**: `apps/web/e2e/`

**Framework**: Playwright + Chromium only (Firefox/Safari in future)

**Configuration file**: `apps/web/playwright.config.ts`

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,  // Serial execution — tests share Supabase test account
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // Single worker — avoids concurrent auth state conflicts
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

**Test npm scripts** (add to `apps/web/package.json`):

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

**E2E test files and what they cover**:

| Test File | Scenarios Covered |
|-----------|-----------------|
| `e2e/auth/signup.spec.ts` | (1) Happy path: fill form → submit → redirect to dashboard. (2) Duplicate email error. (3) Password mismatch error. (4) Terms not checked — submit blocked. (5) Weak password error. |
| `e2e/auth/login.spec.ts` | (1) Happy path: correct credentials → dashboard. (2) Wrong password → error message. (3) Unknown email → error message. (4) Forgot password link → navigates to reset page. |
| `e2e/auth/reset-password.spec.ts` | (1) Valid email → success message. (2) Invalid email format → inline error. (3) Unknown email → success message (no enumeration). |
| `e2e/dashboard/onboarding.spec.ts` | (1) New user sees onboarding checklist with all steps unchecked. (2) After connecting Discord, first step shows checked. (3) After adding Anthropic key, second step checked. (4) After subscribing, third step checked. (5) Complete state: checklist hidden. |
| `e2e/dashboard/status.spec.ts` | (1) Bot shows "Active" when discord_connections status is `connected`. (2) Bot shows "Disconnected" when status is `disconnected`. (3) Metrics cards render without crash when all values are zero. |
| `e2e/integrations/discord.spec.ts` | (1) Paste valid bot token format → connect button enabled. (2) Invalid format → inline error before submit. (3) Submit → loading state → success. (4) Disconnect → confirmation dialog → confirm → disconnected state. |
| `e2e/integrations/api-keys.spec.ts` | (1) Add Anthropic key → shows masked value. (2) Add Toggl key → shows masked value. (3) Remove key → confirmation dialog → key removed. |
| `e2e/billing/upgrade.spec.ts` | (1) Click Upgrade → Stripe Checkout redirect (verify URL starts with checkout.stripe.com). (2) Return from Stripe with `success` param → success toast shown. (3) Return from Stripe with `cancelled` param → no toast, back to billing page. |
| `e2e/settings/tenant.spec.ts` | (1) Update tenant display name → success toast. (2) Cancel updates → changes discarded. (3) Delete tenant → confirmation dialog with name typed → redirect to post-deletion page. |
| `e2e/nav/sidebar.spec.ts` | (1) All nav links navigate to correct routes. (2) Active route highlights correct nav item. (3) Mobile: hamburger opens/closes nav. (4) Logout link signs out and redirects to /login. |

**E2E Authentication Setup** (`e2e/fixtures/auth.ts`):

```typescript
// e2e/fixtures/auth.ts
import { test as base, Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Sign in once and reuse session
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', process.env.E2E_TEST_USER_EMAIL!)
    await page.fill('[data-testid="password-input"]', process.env.E2E_TEST_USER_PASSWORD!)
    await page.click('[data-testid="login-submit"]')
    await page.waitForURL('/dashboard')
    await use(page)
  },
})
```

---

## Section 6: `package.json` Scripts Reference

Complete scripts block for `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit",
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",
    "ci:all": "pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build"
  }
}
```

---

## Section 7: Branch Protection Rules

Configure in GitHub → Repository Settings → Branches → Add branch protection rule for `main`:

| Rule | Setting |
|------|---------|
| Require a pull request before merging | ✅ Enabled |
| Require approvals | 1 approval required |
| Dismiss stale pull request approvals when new commits are pushed | ✅ Enabled |
| Require status checks to pass before merging | ✅ Enabled |
| Required status checks | `TypeScript Type Check`, `ESLint + Prettier Check`, `Unit Tests (Vitest)`, `Next.js Build` |
| Require branches to be up to date before merging | ✅ Enabled |
| Do not allow bypassing the above settings | ✅ Enabled (even for admins) |
| Allow force pushes | ❌ Disabled |
| Allow deletions | ❌ Disabled |

---

## Section 8: Preview Deployments

### 8.1 How Preview Deployments Work

Every pull request to `main` gets its own Vercel preview deployment. The flow:

1. PR opened or new commit pushed to PR branch
2. GitHub Actions `daimon-web-ci.yml` triggers
3. TypeCheck, Lint, Unit Tests run in parallel
4. If all pass → Vercel builds and deploys to a unique preview URL
5. Format: `https://daimon-web-<branch-slug>-<org-slug>.vercel.app`
6. Bot comments the preview URL on the PR
7. E2E tests run against the preview URL

### 8.2 Preview Environment Variable Overrides

Preview deployments use the same env vars as production with these differences:

| Variable | Production Value | Preview Override |
|----------|----------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | `https://daimon.pymc.io` | `https://daimon-web-preview-<branch>.vercel.app` |
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_live_...` | `whsec_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_test_...` |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | Live price ID | Test mode price ID |
| `STRIPE_STARTER_ANNUAL_PRICE_ID` | Live price ID | Test mode price ID |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Live price ID | Test mode price ID |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Live price ID | Test mode price ID |

Supabase, OAuth, and Discord env vars are the **same** across environments (single Supabase project). The E2E test user's data is isolated by tenant ID.

### 8.3 Preview Cleanup

Vercel automatically deletes preview deployments when PRs are closed or merged. No manual cleanup required.

---

## Section 9: Release Process

### 9.1 Normal Deploy (Standard Flow)

```
1. Create PR from feature branch → main
2. CI runs automatically (typecheck, lint, unit tests, build)
3. Preview deployment created
4. PR review + approval
5. Merge to main
6. Production deploy triggers automatically
7. Vercel deploys to daimon.pymc.io within ~2-3 minutes
```

### 9.2 Hotfix Deploy (Emergency)

```
1. Create branch from main: hotfix/<description>
2. Make fix, push
3. CI runs (same checks)
4. Emergency review (1 approval still required)
5. Merge to main
6. Auto-deploys to production
```

There is no manual production deploy trigger. All production deploys go through `main` branch CI. If a Vercel deploy fails, roll back via Vercel Dashboard → Deployments → find last good deployment → Promote to Production.

### 9.3 Bot Deploy

```
1. Push changes to apps/bot/** on main branch
2. daimon-bot-deploy.yml triggers automatically
3. Ruff lint + pyright type check + pytest
4. If all pass → flyctl deploy --remote-only
5. Bot restarts automatically on Fly.io
6. Zero-downtime deploy: new instance starts, accepts connections, old one drains
```

### 9.4 Database Migration

```
1. Add new migration file to supabase/migrations/ (name: YYYYMMDDHHMMSS_description.sql)
2. Push to main
3. daimon-db-migrate.yml triggers automatically
4. Validates migration file naming convention
5. Runs supabase db push against production (auto-apply on push to main)
```

For risky or complex migrations, use manual dispatch with `dry_run=true` first, verify output, then re-run with `dry_run=false`.

---

## Section 10: Workflow Dependencies Summary

```
PR Push → daimon-web-ci.yml:
  ├── install
  ├── typecheck (needs: install)
  ├── lint (needs: install)
  ├── unit-tests (needs: install)
  ├── build (needs: typecheck, lint)
  ├── deploy-vercel (needs: build, unit-tests) → Preview URL
  └── e2e-tests (needs: deploy-vercel, PR only) → Playwright tests

main Push (web changes) → daimon-web-ci.yml:
  ├── install → typecheck → lint → unit-tests → build → deploy-vercel (PRODUCTION)
  └── (no e2e on main push — already ran on PR)

main Push (bot changes) → daimon-bot-deploy.yml:
  └── deploy-bot (ruff → pyright → pytest → flyctl deploy)

main Push (migration changes) → daimon-db-migrate.yml:
  └── validate-migrations → run-migrations (supabase db push)
```

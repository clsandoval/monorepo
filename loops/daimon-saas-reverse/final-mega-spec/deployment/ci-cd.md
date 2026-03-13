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

---

## Section 11: Local Supabase CI Setup for E2E Tests

> **This section supersedes Section 1 Job 7 and Section 5.2.** The E2E job now uses `supabase start` (local Docker) instead of running against a Vercel preview deployment with a manually-created remote Supabase test user. This enables fully hermetic, reproducible E2E tests with zero manual setup.
>
> **Proven pattern reference:** `apps/podplay/supabase/config.toml` + `.github/workflows/podplay-ops.yml` use the same approach with `npx supabase start`.
>
> **Key command:** `supabase start && pnpm test:e2e` — zero manual setup required.

---

### 11.1 Why Local Supabase Instead of Remote

| Concern | Remote Supabase (Old Approach) | Local Supabase (New Approach) |
|---------|-------------------------------|-------------------------------|
| Test user setup | Manual — create user in Supabase dashboard, add to GitHub Secrets | Automatic — `seed.sql` creates all test users on `supabase start` |
| Data isolation | Shared production/preview DB — tests can interfere with real data | Fully isolated Docker instance — wiped after every CI run |
| RLS policy testing | Cannot test RLS directly without service_role bypass | Can test RLS exactly as it runs in production |
| Vault secrets | Remote Vault config varies by environment | Local pgsodium Vault available in all local Supabase instances |
| CI reproducibility | Depends on remote network, remote DB state | Fully reproducible — Docker image is pinned |
| Run without internet | Impossible | Works offline (after initial Docker image pull) |
| Cost | Supabase API calls | Free — runs in GitHub Actions Docker |

---

### 11.2 `supabase/config.toml` — Complete Daimon Configuration

**File path:** `supabase/config.toml` (relative to monorepo root, next to `supabase/migrations/`)

```toml
# supabase/config.toml
# Daimon SaaS — Local Supabase configuration
# Used by: supabase start (local dev + CI), supabase db push (migrations)
project_id = "daimon-saas"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 17

[realtime]
enabled = true

[studio]
enabled = true
port = 54323
api_url = "http://127.0.0.1"

[inbucket]
# Local email capture — all emails sent during E2E tests are captured here
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
# Must match the Next.js dev server URL so Supabase Auth redirects work
site_url = "http://localhost:3000"
# OAuth callbacks for local testing
additional_redirect_urls = [
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/callback/github",
  "http://localhost:3000/auth/callback/google",
  "http://localhost:3000/auth/callback/linear"
]
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
double_confirm_changes = false
# Disable email confirmation for local/CI testing — seed users are pre-confirmed
enable_confirmations = false

[auth.sms]
enable_signup = false
```

**How to initialize (one-time, per developer):**

```bash
# From monorepo root
supabase init          # Creates supabase/config.toml (if not already created)
supabase start         # Starts local Postgres + Auth + Realtime on Docker
supabase status        # Prints local API URL, anon key, service_role key
```

**Output of `supabase status` (local dev — values are deterministic for local Supabase):**

```
         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqHEaO1j4NB3bBq7_F6LqdM3a9i0MuQJc
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0
```

> **Note:** These are the **standard local Supabase demo keys** that every local Supabase instance uses. They are safe to commit. They work only against `localhost:54321` — they are useless against any remote Supabase project.

---

### 11.3 `supabase/seed.sql` — Complete Test Data

**File path:** `supabase/seed.sql` (relative to monorepo root)

This file is automatically executed by `supabase start` (and `supabase db reset`) after all migrations run. It creates test tenants in every lifecycle state so E2E tests can run against deterministic data without any manual setup.

**Test User Summary:**

| Variable | Email | Password | Tenant State | Plan |
|----------|-------|----------|-------------|------|
| `TEST_USER_ONBOARDING` | `onboarding@daimon-test.internal` | `TestPass123!` | No tenant created | N/A |
| `TEST_USER_FREE` | `free@daimon-test.internal` | `TestPass123!` | Active — Discord connected, API key set | free |
| `TEST_USER_STARTER` | `starter@daimon-test.internal` | `TestPass123!` | Active — all connected, Stripe subscription | starter |
| `TEST_USER_PRO` | `pro@daimon-test.internal` | `TestPass123!` | Active — all connected, Pro plan | pro |
| `TEST_USER_SUSPENDED` | `suspended@daimon-test.internal` | `TestPass123!` | Suspended tenant | free |
| `TEST_USER_CANCELLED` | `cancelled@daimon-test.internal` | `TestPass123!` | Tenant active, subscription cancelled | free |
| `TEST_ADMIN` | `admin@daimon-test.internal` | `AdminPass456!` | Admin user (no tenant) | N/A |

**Complete `seed.sql`:**

```sql
-- ============================================================
-- supabase/seed.sql
-- Daimon SaaS — Test Data Seed for E2E + Local Development
--
-- Execution: Automatically run by `supabase start` and `supabase db reset`
-- after all migrations have been applied.
--
-- IMPORTANT: This file uses fixed UUIDs for all test records so
-- that E2E test fixtures can reference them by known IDs without
-- querying the database first.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Section 0: Constants (UUIDs used throughout this file)
-- ────────────────────────────────────────────────────────────
-- Defining them as variables makes refactoring easier.
-- All IDs use a recognizable prefix pattern: 00000000-xxxx-...

-- User IDs
-- onboarding user:  00000000-0001-0001-0001-000000000001
-- free user:        00000000-0002-0002-0002-000000000002
-- starter user:     00000000-0003-0003-0003-000000000003
-- pro user:         00000000-0004-0004-0004-000000000004
-- suspended user:   00000000-0005-0005-0005-000000000005
-- cancelled user:   00000000-0006-0006-0006-000000000006
-- admin user:       00000000-0007-0007-0007-000000000007

-- Tenant IDs
-- free tenant:      00000000-0002-0002-0002-100000000002
-- starter tenant:   00000000-0003-0003-0003-100000000003
-- pro tenant:       00000000-0004-0004-0004-100000000004
-- suspended tenant: 00000000-0005-0005-0005-100000000005
-- cancelled tenant: 00000000-0006-0006-0006-100000000006


-- ────────────────────────────────────────────────────────────
-- Section 1: Auth Users
-- Insert into auth.users directly (local Supabase only)
-- In local Supabase, passwords are stored via pgcrypto crypt().
-- All users have email_confirmed_at set so they don't need
-- to go through the email confirmation flow.
-- ────────────────────────────────────────────────────────────

-- Truncate to allow re-running seed (idempotent via DELETE + INSERT)
DELETE FROM auth.identities WHERE provider = 'email'
  AND identity_data->>'email' LIKE '%@daimon-test.internal';
DELETE FROM auth.users WHERE email LIKE '%@daimon-test.internal';

-- User 1: Onboarding (no tenant created)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
) VALUES (
    '00000000-0001-0001-0001-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'onboarding@daimon-test.internal',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Onboarding Test User"}',
    false,
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    ''
);

-- User 2: Free plan (Discord connected, Anthropic key set, bot active)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0002-0002-0002-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'free@daimon-test.internal',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Free Plan Test User"}',
    false, 'authenticated', 'authenticated',
    NOW(), NOW(), '', ''
);

-- User 3: Starter plan (full setup, Stripe subscription active)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0003-0003-0003-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'starter@daimon-test.internal',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Starter Plan Test User"}',
    false, 'authenticated', 'authenticated',
    NOW(), NOW(), '', ''
);

-- User 4: Pro plan (full setup, Pro subscription active)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0004-0004-0004-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'pro@daimon-test.internal',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Pro Plan Test User"}',
    false, 'authenticated', 'authenticated',
    NOW(), NOW(), '', ''
);

-- User 5: Suspended (tenant suspended by admin)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0005-0005-0005-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'suspended@daimon-test.internal',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Suspended Test User"}',
    false, 'authenticated', 'authenticated',
    NOW(), NOW(), '', ''
);

-- User 6: Cancelled (subscription cancelled, tenant still active)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0006-0006-0006-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'cancelled@daimon-test.internal',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Cancelled Sub Test User"}',
    false, 'authenticated', 'authenticated',
    NOW(), NOW(), '', ''
);

-- User 7: Admin (used for admin panel E2E tests)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0007-0007-0007-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'admin@daimon-test.internal',
    crypt('AdminPass456!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin Test User"}',
    false, 'authenticated', 'authenticated',
    NOW(), NOW(), '', ''
);

-- Auth identities (required for Supabase email auth to work)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
VALUES
    ('00000000-0001-0001-0001-000000000001', '00000000-0001-0001-0001-000000000001',
     '{"sub":"00000000-0001-0001-0001-000000000001","email":"onboarding@daimon-test.internal"}',
     'email', 'onboarding@daimon-test.internal', NOW(), NOW()),
    ('00000000-0002-0002-0002-000000000002', '00000000-0002-0002-0002-000000000002',
     '{"sub":"00000000-0002-0002-0002-000000000002","email":"free@daimon-test.internal"}',
     'email', 'free@daimon-test.internal', NOW(), NOW()),
    ('00000000-0003-0003-0003-000000000003', '00000000-0003-0003-0003-000000000003',
     '{"sub":"00000000-0003-0003-0003-000000000003","email":"starter@daimon-test.internal"}',
     'email', 'starter@daimon-test.internal', NOW(), NOW()),
    ('00000000-0004-0004-0004-000000000004', '00000000-0004-0004-0004-000000000004',
     '{"sub":"00000000-0004-0004-0004-000000000004","email":"pro@daimon-test.internal"}',
     'email', 'pro@daimon-test.internal', NOW(), NOW()),
    ('00000000-0005-0005-0005-000000000005', '00000000-0005-0005-0005-000000000005',
     '{"sub":"00000000-0005-0005-0005-000000000005","email":"suspended@daimon-test.internal"}',
     'email', 'suspended@daimon-test.internal', NOW(), NOW()),
    ('00000000-0006-0006-0006-000000000006', '00000000-0006-0006-0006-000000000006',
     '{"sub":"00000000-0006-0006-0006-000000000006","email":"cancelled@daimon-test.internal"}',
     'email', 'cancelled@daimon-test.internal', NOW(), NOW()),
    ('00000000-0007-0007-0007-000000000007', '00000000-0007-0007-0007-000000000007',
     '{"sub":"00000000-0007-0007-0007-000000000007","email":"admin@daimon-test.internal"}',
     'email', 'admin@daimon-test.internal', NOW(), NOW());


-- ────────────────────────────────────────────────────────────
-- Section 2: Tenants
-- (No tenant for onboarding user — that's the point)
-- ────────────────────────────────────────────────────────────

DELETE FROM public.tenants WHERE id IN (
    '00000000-0002-0002-0002-100000000002',
    '00000000-0003-0003-0003-100000000003',
    '00000000-0004-0004-0004-100000000004',
    '00000000-0005-0005-0005-100000000005',
    '00000000-0006-0006-0006-100000000006'
);

INSERT INTO public.tenants (id, name, owner_id, plan, status, stripe_customer_id, created_at, updated_at)
VALUES
    -- Free tenant: active, Discord connected, Anthropic key set
    ('00000000-0002-0002-0002-100000000002',
     'Free Test Tenant',
     '00000000-0002-0002-0002-000000000002',
     'free', 'active',
     NULL,
     NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 hour'),

    -- Starter tenant: active, full setup, Stripe customer
    ('00000000-0003-0003-0003-100000000003',
     'Starter Test Tenant',
     '00000000-0003-0003-0003-000000000003',
     'starter', 'active',
     'cus_test_starter_00000003',
     NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 hours'),

    -- Pro tenant: active, full setup, Pro plan
    ('00000000-0004-0004-0004-100000000004',
     'Pro Test Tenant',
     '00000000-0004-0004-0004-000000000004',
     'pro', 'active',
     'cus_test_pro_00000004',
     NOW() - INTERVAL '60 days', NOW() - INTERVAL '3 hours'),

    -- Suspended tenant: suspended status
    ('00000000-0005-0005-0005-100000000005',
     'Suspended Test Tenant',
     '00000000-0005-0005-0005-000000000005',
     'free', 'suspended',
     NULL,
     NOW() - INTERVAL '14 days', NOW() - INTERVAL '1 day'),

    -- Cancelled tenant: active status but subscription cancelled
    ('00000000-0006-0006-0006-100000000006',
     'Cancelled Sub Tenant',
     '00000000-0006-0006-0006-000000000006',
     'free', 'active',
     'cus_test_cancelled_00000006',
     NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 days');


-- ────────────────────────────────────────────────────────────
-- Section 3: Tenant Members
-- (One owner row per tenant — owner = the creating user)
-- ────────────────────────────────────────────────────────────

DELETE FROM public.tenant_members WHERE tenant_id IN (
    '00000000-0002-0002-0002-100000000002',
    '00000000-0003-0003-0003-100000000003',
    '00000000-0004-0004-0004-100000000004',
    '00000000-0005-0005-0005-100000000005',
    '00000000-0006-0006-0006-100000000006'
);

INSERT INTO public.tenant_members (tenant_id, user_id, role, invited_by, created_at)
VALUES
    ('00000000-0002-0002-0002-100000000002', '00000000-0002-0002-0002-000000000002', 'owner', NULL, NOW() - INTERVAL '7 days'),
    ('00000000-0003-0003-0003-100000000003', '00000000-0003-0003-0003-000000000003', 'owner', NULL, NOW() - INTERVAL '30 days'),
    ('00000000-0004-0004-0004-100000000004', '00000000-0004-0004-0004-000000000004', 'owner', NULL, NOW() - INTERVAL '60 days'),
    ('00000000-0005-0005-0005-100000000005', '00000000-0005-0005-0005-000000000005', 'owner', NULL, NOW() - INTERVAL '14 days'),
    ('00000000-0006-0006-0006-100000000006', '00000000-0006-0006-0006-000000000006', 'owner', NULL, NOW() - INTERVAL '45 days');


-- ────────────────────────────────────────────────────────────
-- Section 4: Discord Connections
-- Seeded for: free, starter, pro, suspended (suspended = suspended status)
-- Not seeded for: onboarding (no connection yet), cancelled (no bot)
-- ────────────────────────────────────────────────────────────

DELETE FROM public.discord_connections WHERE tenant_id IN (
    '00000000-0002-0002-0002-100000000002',
    '00000000-0003-0003-0003-100000000003',
    '00000000-0004-0004-0004-100000000004',
    '00000000-0005-0005-0005-100000000005',
    '00000000-0006-0006-0006-100000000006'
);

-- NOTE: discord_bot_token is stored via Supabase Vault.
-- In local Supabase, we insert vault secrets first and capture the IDs.
-- Test tokens use the format: Bot <base64-encoded-fake-token>
-- These are NOT real Discord tokens — they will not connect to Discord.

-- Create vault secrets for Discord bot tokens
-- vault.create_secret(secret_value, name, description) returns UUID
DO $$
DECLARE
    v_free_discord_token_id   UUID;
    v_starter_discord_token_id UUID;
    v_pro_discord_token_id    UUID;
    v_suspended_discord_token_id UUID;
    v_cancelled_discord_token_id UUID;
BEGIN
    -- Free tenant Discord token vault secret
    v_free_discord_token_id := vault.create_secret(
        'Bot MTEwMDAwMDAwMDAwMDAwMDAxLjAwMDAwMA.FREE_TEST_TOKEN_NOT_REAL_0000000001',
        'discord-token-free-tenant',
        'Test Discord bot token for free tenant E2E tests'
    );

    -- Starter tenant Discord token vault secret
    v_starter_discord_token_id := vault.create_secret(
        'Bot MTEwMDAwMDAwMDAwMDAwMDAzLjAwMDAwMA.STARTER_TEST_TOKEN_NOT_REAL_0000000003',
        'discord-token-starter-tenant',
        'Test Discord bot token for starter tenant E2E tests'
    );

    -- Pro tenant Discord token vault secret
    v_pro_discord_token_id := vault.create_secret(
        'Bot MTEwMDAwMDAwMDAwMDAwMDA0LjAwMDAwMA.PRO_TEST_TOKEN_NOT_REAL_0000000004',
        'discord-token-pro-tenant',
        'Test Discord bot token for pro tenant E2E tests'
    );

    -- Suspended tenant Discord token vault secret
    v_suspended_discord_token_id := vault.create_secret(
        'Bot MTEwMDAwMDAwMDAwMDAwMDA1LjAwMDAwMA.SUSPENDED_TEST_TOKEN_NOT_REAL_000000005',
        'discord-token-suspended-tenant',
        'Test Discord bot token for suspended tenant E2E tests'
    );

    -- Cancelled tenant Discord token vault secret
    v_cancelled_discord_token_id := vault.create_secret(
        'Bot MTEwMDAwMDAwMDAwMDAwMDA2LjAwMDAwMA.CANCELLED_TEST_TOKEN_NOT_REAL_000000006',
        'discord-token-cancelled-tenant',
        'Test Discord bot token for cancelled tenant E2E tests'
    );

    -- Insert discord_connections rows referencing vault secret IDs
    -- guild_id values are fake 18-digit Discord snowflake IDs
    INSERT INTO public.discord_connections (
        id, tenant_id, guild_id, vault_token_secret_id, status,
        bot_username, bot_discriminator, guild_name, member_count,
        last_heartbeat_at, error_message, created_at, updated_at
    ) VALUES
        -- Free tenant: connected, bot active
        (
            gen_random_uuid(),
            '00000000-0002-0002-0002-100000000002',
            '100000000000000002',
            v_free_discord_token_id,
            'connected',
            'Daimon-Test',
            '0000',
            'Free Test Guild',
            42,
            NOW() - INTERVAL '30 seconds',
            NULL,
            NOW() - INTERVAL '7 days',
            NOW() - INTERVAL '30 seconds'
        ),
        -- Starter tenant: connected, full metadata
        (
            gen_random_uuid(),
            '00000000-0003-0003-0003-100000000003',
            '100000000000000003',
            v_starter_discord_token_id,
            'connected',
            'Daimon-Test',
            '0000',
            'Starter Test Guild',
            128,
            NOW() - INTERVAL '15 seconds',
            NULL,
            NOW() - INTERVAL '30 days',
            NOW() - INTERVAL '15 seconds'
        ),
        -- Pro tenant: connected
        (
            gen_random_uuid(),
            '00000000-0004-0004-0004-100000000004',
            '100000000000000004',
            v_pro_discord_token_id,
            'connected',
            'Daimon-Test',
            '0000',
            'Pro Test Guild',
            512,
            NOW() - INTERVAL '10 seconds',
            NULL,
            NOW() - INTERVAL '60 days',
            NOW() - INTERVAL '10 seconds'
        ),
        -- Suspended tenant: suspended status
        (
            gen_random_uuid(),
            '00000000-0005-0005-0005-100000000005',
            '100000000000000005',
            v_suspended_discord_token_id,
            'suspended',
            'Daimon-Test',
            '0000',
            'Suspended Test Guild',
            8,
            NOW() - INTERVAL '1 day',
            'Tenant account suspended',
            NOW() - INTERVAL '14 days',
            NOW() - INTERVAL '1 day'
        ),
        -- Cancelled tenant: disconnected (subscription cancelled, bot stopped)
        (
            gen_random_uuid(),
            '00000000-0006-0006-0006-100000000006',
            '100000000000000006',
            v_cancelled_discord_token_id,
            'disconnected',
            'Daimon-Test',
            '0000',
            'Cancelled Test Guild',
            15,
            NOW() - INTERVAL '5 days',
            NULL,
            NOW() - INTERVAL '45 days',
            NOW() - INTERVAL '5 days'
        );
END $$;


-- ────────────────────────────────────────────────────────────
-- Section 5: Tenant API Keys (Anthropic + OpenAI)
-- Stored via Supabase Vault (pgsodium encryption)
-- Test values are clearly fake — sk-ant-test-* and sk-test-*
-- ────────────────────────────────────────────────────────────

DELETE FROM public.tenant_api_keys WHERE tenant_id IN (
    '00000000-0002-0002-0002-100000000002',
    '00000000-0003-0003-0003-100000000003',
    '00000000-0004-0004-0004-100000000004',
    '00000000-0005-0005-0005-100000000005',
    '00000000-0006-0006-0006-100000000006'
);

DO $$
DECLARE
    v_free_anthropic_id       UUID;
    v_starter_anthropic_id    UUID;
    v_starter_openai_id       UUID;
    v_pro_anthropic_id        UUID;
    v_pro_openai_id           UUID;
    v_suspended_anthropic_id  UUID;
    v_cancelled_anthropic_id  UUID;
BEGIN
    -- Free tenant: Anthropic key only
    v_free_anthropic_id := vault.create_secret(
        'sk-ant-test-free-tenant-api-key-00000000000000000000000000000002',
        'anthropic-key-free-tenant',
        'Test Anthropic API key for free tenant'
    );

    -- Starter tenant: Anthropic + OpenAI
    v_starter_anthropic_id := vault.create_secret(
        'sk-ant-test-starter-tenant-key-0000000000000000000000000000000003',
        'anthropic-key-starter-tenant',
        'Test Anthropic API key for starter tenant'
    );
    v_starter_openai_id := vault.create_secret(
        'sk-test-starter-openai-key-00000000000000000000000000000000003',
        'openai-key-starter-tenant',
        'Test OpenAI API key for starter tenant'
    );

    -- Pro tenant: Anthropic + OpenAI
    v_pro_anthropic_id := vault.create_secret(
        'sk-ant-test-pro-tenant-api-key-000000000000000000000000000000004',
        'anthropic-key-pro-tenant',
        'Test Anthropic API key for pro tenant'
    );
    v_pro_openai_id := vault.create_secret(
        'sk-test-pro-openai-key-000000000000000000000000000000000000004',
        'openai-key-pro-tenant',
        'Test OpenAI API key for pro tenant'
    );

    -- Suspended tenant: Anthropic key (was valid before suspension)
    v_suspended_anthropic_id := vault.create_secret(
        'sk-ant-test-suspended-tenant-key-0000000000000000000000000000005',
        'anthropic-key-suspended-tenant',
        'Test Anthropic API key for suspended tenant'
    );

    -- Cancelled tenant: Anthropic key
    v_cancelled_anthropic_id := vault.create_secret(
        'sk-ant-test-cancelled-tenant-key-000000000000000000000000000006',
        'anthropic-key-cancelled-tenant',
        'Test Anthropic API key for cancelled tenant'
    );

    -- Insert tenant_api_keys rows
    -- key_hint: last 4 characters of the key (displayed masked in UI as sk-ant-...XXXX)
    INSERT INTO public.tenant_api_keys (
        id, tenant_id, key_type, vault_secret_id, key_hint,
        validated_at, created_at, updated_at
    ) VALUES
        -- Free tenant: Anthropic only
        (gen_random_uuid(), '00000000-0002-0002-0002-100000000002',
         'anthropic', v_free_anthropic_id, '0002',
         NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

        -- Starter tenant: Anthropic
        (gen_random_uuid(), '00000000-0003-0003-0003-100000000003',
         'anthropic', v_starter_anthropic_id, '0003',
         NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),

        -- Starter tenant: OpenAI
        (gen_random_uuid(), '00000000-0003-0003-0003-100000000003',
         'openai', v_starter_openai_id, '0003',
         NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),

        -- Pro tenant: Anthropic
        (gen_random_uuid(), '00000000-0004-0004-0004-100000000004',
         'anthropic', v_pro_anthropic_id, '0004',
         NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),

        -- Pro tenant: OpenAI
        (gen_random_uuid(), '00000000-0004-0004-0004-100000000004',
         'openai', v_pro_openai_id, '0004',
         NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),

        -- Suspended tenant: Anthropic
        (gen_random_uuid(), '00000000-0005-0005-0005-100000000005',
         'anthropic', v_suspended_anthropic_id, '0005',
         NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),

        -- Cancelled tenant: Anthropic
        (gen_random_uuid(), '00000000-0006-0006-0006-100000000006',
         'anthropic', v_cancelled_anthropic_id, '0006',
         NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days');
END $$;


-- ────────────────────────────────────────────────────────────
-- Section 6: Tenant Service Connections
-- OAuth connections (GitHub, Google, Linear) for starter + pro tenants
-- API key connections (Toggl) for pro tenant
-- Tokens are fake — they will not authenticate against real APIs
-- ────────────────────────────────────────────────────────────

DELETE FROM public.tenant_service_connections WHERE tenant_id IN (
    '00000000-0003-0003-0003-100000000003',
    '00000000-0004-0004-0004-100000000004'
);

DO $$
DECLARE
    v_starter_github_access_id   UUID;
    v_starter_github_refresh_id  UUID;
    v_pro_github_access_id       UUID;
    v_pro_github_refresh_id      UUID;
    v_pro_google_access_id       UUID;
    v_pro_google_refresh_id      UUID;
    v_pro_linear_access_id       UUID;
    v_pro_linear_refresh_id      UUID;
    v_pro_toggl_apikey_id        UUID;
BEGIN
    -- Starter: GitHub OAuth access + refresh tokens
    v_starter_github_access_id := vault.create_secret(
        'gho_test_starter_github_access_token_00000003',
        'github-access-starter',
        'Test GitHub OAuth access token for starter tenant'
    );
    v_starter_github_refresh_id := vault.create_secret(
        'ghr_test_starter_github_refresh_token_00000003',
        'github-refresh-starter',
        'Test GitHub OAuth refresh token for starter tenant'
    );

    -- Pro: GitHub OAuth
    v_pro_github_access_id := vault.create_secret(
        'gho_test_pro_github_access_token_00000004',
        'github-access-pro',
        'Test GitHub OAuth access token for pro tenant'
    );
    v_pro_github_refresh_id := vault.create_secret(
        'ghr_test_pro_github_refresh_token_00000004',
        'github-refresh-pro',
        'Test GitHub OAuth refresh token for pro tenant'
    );

    -- Pro: Google OAuth
    v_pro_google_access_id := vault.create_secret(
        'ya29.test_pro_google_access_token_000000004',
        'google-access-pro',
        'Test Google OAuth access token for pro tenant'
    );
    v_pro_google_refresh_id := vault.create_secret(
        '1//test_pro_google_refresh_token_000000004',
        'google-refresh-pro',
        'Test Google OAuth refresh token for pro tenant'
    );

    -- Pro: Linear OAuth
    v_pro_linear_access_id := vault.create_secret(
        'lin_test_pro_linear_access_token_0000000000004',
        'linear-access-pro',
        'Test Linear OAuth access token for pro tenant'
    );
    -- Linear does not use refresh tokens (long-lived access tokens)
    v_pro_linear_refresh_id := NULL;

    -- Pro: Toggl API key (stored as "access_token", no refresh)
    v_pro_toggl_apikey_id := vault.create_secret(
        'test_toggl_api_key_00000000000000000000000000000004',
        'toggl-apikey-pro',
        'Test Toggl API key for pro tenant'
    );

    INSERT INTO public.tenant_service_connections (
        id, tenant_id, service, status,
        vault_access_token_id, vault_refresh_token_id,
        token_expires_at, scopes, account_display_name,
        created_at, updated_at
    ) VALUES
        -- Starter: GitHub connected
        (gen_random_uuid(), '00000000-0003-0003-0003-100000000003',
         'github', 'active',
         v_starter_github_access_id, v_starter_github_refresh_id,
         NOW() + INTERVAL '1 hour',
         ARRAY['repo', 'read:user'],
         'starter-test-user',
         NOW() - INTERVAL '28 days', NOW() - INTERVAL '1 hour'),

        -- Pro: GitHub connected
        (gen_random_uuid(), '00000000-0004-0004-0004-100000000004',
         'github', 'active',
         v_pro_github_access_id, v_pro_github_refresh_id,
         NOW() + INTERVAL '1 hour',
         ARRAY['repo', 'read:user'],
         'pro-test-user',
         NOW() - INTERVAL '58 days', NOW() - INTERVAL '30 minutes'),

        -- Pro: Google connected
        (gen_random_uuid(), '00000000-0004-0004-0004-100000000004',
         'google', 'active',
         v_pro_google_access_id, v_pro_google_refresh_id,
         NOW() + INTERVAL '55 minutes',
         ARRAY['https://www.googleapis.com/auth/analytics.readonly'],
         'pro-test@gmail.com',
         NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 minutes'),

        -- Pro: Linear connected
        (gen_random_uuid(), '00000000-0004-0004-0004-100000000004',
         'linear', 'active',
         v_pro_linear_access_id, NULL,
         NULL,  -- Linear tokens don't expire
         ARRAY['read', 'write'],
         'Pro Test Team',
         NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),

        -- Pro: Toggl connected (API key auth — no refresh token, no expiry)
        (gen_random_uuid(), '00000000-0004-0004-0004-100000000004',
         'toggl', 'active',
         v_pro_toggl_apikey_id, NULL,
         NULL,  -- API keys don't expire
         NULL,  -- No OAuth scopes for API key auth
         'pro-toggl-workspace',
         NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days');
END $$;


-- ────────────────────────────────────────────────────────────
-- Section 7: Tenant Subscriptions
-- Seeded for: starter, pro, cancelled
-- Not seeded for: free (no subscription), onboarding, suspended
-- ────────────────────────────────────────────────────────────

DELETE FROM public.tenant_subscriptions WHERE tenant_id IN (
    '00000000-0003-0003-0003-100000000003',
    '00000000-0004-0004-0004-100000000004',
    '00000000-0006-0006-0006-100000000006'
);

INSERT INTO public.tenant_subscriptions (
    id, tenant_id, stripe_subscription_id, stripe_price_id,
    plan, billing_interval, status,
    current_period_start, current_period_end,
    cancel_at_period_end, canceled_at,
    created_at, updated_at
) VALUES
    -- Starter tenant: active monthly subscription
    (
        gen_random_uuid(),
        '00000000-0003-0003-0003-100000000003',
        'sub_test_starter_monthly_00000003',
        'price_test_starter_monthly',  -- placeholder — matches STRIPE_STARTER_MONTHLY_PRICE_ID
        'starter',
        'monthly',
        'active',
        NOW() - INTERVAL '15 days',
        NOW() + INTERVAL '15 days',
        false,
        NULL,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days'
    ),
    -- Pro tenant: active annual subscription
    (
        gen_random_uuid(),
        '00000000-0004-0004-0004-100000000004',
        'sub_test_pro_annual_00000004',
        'price_test_pro_annual',  -- placeholder — matches STRIPE_PRO_ANNUAL_PRICE_ID
        'pro',
        'annual',
        'active',
        NOW() - INTERVAL '30 days',
        NOW() + INTERVAL '335 days',
        false,
        NULL,
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '30 days'
    ),
    -- Cancelled tenant: canceled subscription (cancel_at_period_end = true)
    (
        gen_random_uuid(),
        '00000000-0006-0006-0006-100000000006',
        'sub_test_cancelled_00000006',
        'price_test_starter_monthly',
        'starter',
        'monthly',
        'canceled',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '5 days',
        true,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '5 days'
    );


-- ────────────────────────────────────────────────────────────
-- Section 8: Stripe Webhook Events (idempotency store)
-- Seed a few processed webhook events so the idempotency
-- check doesn't need to be bypassed in tests
-- ────────────────────────────────────────────────────────────

DELETE FROM public.stripe_webhook_events WHERE stripe_event_id LIKE 'evt_test_%';

INSERT INTO public.stripe_webhook_events (
    stripe_event_id, event_type, processed_at, tenant_id
) VALUES
    ('evt_test_starter_subscription_created_00003',
     'customer.subscription.created',
     NOW() - INTERVAL '30 days',
     '00000000-0003-0003-0003-100000000003'),
    ('evt_test_pro_subscription_created_00004',
     'customer.subscription.created',
     NOW() - INTERVAL '60 days',
     '00000000-0004-0004-0004-100000000004'),
    ('evt_test_cancelled_subscription_deleted_00006',
     'customer.subscription.deleted',
     NOW() - INTERVAL '5 days',
     '00000000-0006-0006-0006-100000000006');


-- ────────────────────────────────────────────────────────────
-- Seed complete.
-- Summary of test states:
-- onboarding@daimon-test.internal  → No tenant (sees onboarding flow)
-- free@daimon-test.internal        → Free plan, Discord connected, bot active
-- starter@daimon-test.internal     → Starter plan, GitHub connected, active subscription
-- pro@daimon-test.internal         → Pro plan, all services connected, active annual subscription
-- suspended@daimon-test.internal   → Suspended tenant (sees suspension notice)
-- cancelled@daimon-test.internal   → Active tenant, subscription cancelled/expired
-- admin@daimon-test.internal       → Admin user for /admin/* E2E tests
-- ────────────────────────────────────────────────────────────
```

---

### 11.4 Updated GitHub Actions E2E Job

**Replaces:** Section 1, Job 7 (`e2e-tests`) in `daimon-web-ci.yml`.

The key changes from the old approach:
1. Removed dependency on `deploy-vercel` — E2E tests run against a local Next.js dev server
2. Added `supabase start` step before `pnpm dev`
3. Added `supabase stop` teardown step
4. Removed `E2E_TEST_USER_EMAIL` and `E2E_TEST_USER_PASSWORD` secrets — seeded users are used instead
5. Added local Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`)

**Updated Job 7 YAML (replace the `e2e-tests` job in `daimon-web-ci.yml`):**

```yaml
  # ────────────────────────────────────────────────────────────
  # Job 7: E2E Tests (Playwright) — PR only, local Supabase
  # Supersedes the old approach of running against Vercel preview.
  # Uses supabase start to boot a local hermetic Supabase instance.
  # ────────────────────────────────────────────────────────────
  e2e-tests:
    name: E2E Tests (Playwright + Local Supabase)
    runs-on: ubuntu-latest
    needs: [build]  # Only needs build to complete — no longer needs deploy-vercel
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

      - name: Install Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start local Supabase
        # supabase start reads supabase/config.toml and runs all migrations
        # from supabase/migrations/ then executes supabase/seed.sql
        # Takes ~60 seconds on first run (pulls Docker images)
        # Subsequent runs use cached images: ~15 seconds
        run: supabase start
        working-directory: .
        timeout-minutes: 5

      - name: Verify Supabase is healthy
        run: |
          # supabase status prints the API URL and keys
          supabase status
          # Verify the API is accepting connections
          curl --fail --silent \
            "http://localhost:54321/rest/v1/" \
            -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqHEaO1j4NB3bBq7_F6LqdM3a9i0MuQJc" \
            | head -c 100
          echo "Supabase API is healthy"

      - name: Install Playwright browsers
        run: pnpm --filter web exec playwright install --with-deps chromium

      - name: Start Next.js dev server
        # Start the dev server in the background against local Supabase
        # The & puts it in background; we wait for it to be ready below
        run: pnpm --filter web dev &
        working-directory: .
        env:
          # Local Supabase — standard demo keys (safe to commit)
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqHEaO1j4NB3bBq7_F6LqdM3a9i0MuQJc
          SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0
          SUPABASE_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
          NEXT_PUBLIC_APP_URL: http://localhost:3000
          # Stripe test mode keys (from secrets — same as used in unit tests)
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_TEST_PUBLISHABLE_KEY }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_TEST_WEBHOOK_SECRET }}
          STRIPE_STARTER_MONTHLY_PRICE_ID: ${{ secrets.STRIPE_TEST_STARTER_MONTHLY_PRICE_ID }}
          STRIPE_STARTER_ANNUAL_PRICE_ID: ${{ secrets.STRIPE_TEST_STARTER_ANNUAL_PRICE_ID }}
          STRIPE_PRO_MONTHLY_PRICE_ID: ${{ secrets.STRIPE_TEST_PRO_MONTHLY_PRICE_ID }}
          STRIPE_PRO_ANNUAL_PRICE_ID: ${{ secrets.STRIPE_TEST_PRO_ANNUAL_PRICE_ID }}
          # OAuth (test app credentials)
          GITHUB_OAUTH_CLIENT_ID: ${{ secrets.GITHUB_OAUTH_TEST_CLIENT_ID }}
          GITHUB_OAUTH_CLIENT_SECRET: ${{ secrets.GITHUB_OAUTH_TEST_CLIENT_SECRET }}
          GOOGLE_OAUTH_CLIENT_ID: ${{ secrets.GOOGLE_OAUTH_TEST_CLIENT_ID }}
          GOOGLE_OAUTH_CLIENT_SECRET: ${{ secrets.GOOGLE_OAUTH_TEST_CLIENT_SECRET }}
          LINEAR_OAUTH_CLIENT_ID: ${{ secrets.LINEAR_OAUTH_TEST_CLIENT_ID }}
          LINEAR_OAUTH_CLIENT_SECRET: ${{ secrets.LINEAR_OAUTH_TEST_CLIENT_SECRET }}
          # Admin key
          ADMIN_SECRET_KEY: test-admin-secret-key-for-e2e-only

      - name: Wait for Next.js to be ready
        run: |
          echo "Waiting for Next.js dev server on http://localhost:3000..."
          for i in $(seq 1 30); do
            if curl --fail --silent http://localhost:3000 > /dev/null 2>&1; then
              echo "Next.js ready after ${i}s"
              break
            fi
            sleep 2
          done
          curl --fail http://localhost:3000 || (echo "ERROR: Next.js not ready after 60s" && exit 1)

      - name: Run E2E tests
        run: pnpm --filter web test:e2e
        working-directory: .
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
          # Local Supabase URL for fixtures that need direct DB access
          E2E_SUPABASE_URL: http://localhost:54321
          E2E_SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0
          # Seeded test user credentials (defined in supabase/seed.sql)
          # These are NOT secrets — they only work against local Supabase
          E2E_USER_ONBOARDING_EMAIL: onboarding@daimon-test.internal
          E2E_USER_ONBOARDING_PASSWORD: TestPass123!
          E2E_USER_FREE_EMAIL: free@daimon-test.internal
          E2E_USER_FREE_PASSWORD: TestPass123!
          E2E_USER_STARTER_EMAIL: starter@daimon-test.internal
          E2E_USER_STARTER_PASSWORD: TestPass123!
          E2E_USER_PRO_EMAIL: pro@daimon-test.internal
          E2E_USER_PRO_PASSWORD: TestPass123!
          E2E_USER_SUSPENDED_EMAIL: suspended@daimon-test.internal
          E2E_USER_SUSPENDED_PASSWORD: TestPass123!
          E2E_USER_CANCELLED_EMAIL: cancelled@daimon-test.internal
          E2E_USER_CANCELLED_PASSWORD: TestPass123!
          E2E_USER_ADMIN_EMAIL: admin@daimon-test.internal
          E2E_USER_ADMIN_PASSWORD: AdminPass456!

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 7

      - name: Upload Playwright screenshots (on failure)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-screenshots
          path: apps/web/e2e/screenshots/actual/
          retention-days: 3

      - name: Stop Supabase
        if: always()  # Always stop, even on failure
        run: supabase stop
        working-directory: .
```

---

### 11.5 Updated `playwright.config.ts`

**Replaces:** the `playwright.config.ts` in Section 5.2. The new version adds:
- `webServer` config to auto-start Next.js if not already running
- Local Supabase env vars in the `use` block
- `globalSetup` pointing to a seed verification script

**File path:** `apps/web/playwright.config.ts`

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

/**
 * Daimon SaaS — Playwright Configuration
 *
 * E2E tests run against local Supabase + local Next.js dev server.
 *
 * Local dev:
 *   supabase start   (from monorepo root)
 *   pnpm dev         (from apps/web/ or via `pnpm --filter web dev`)
 *   pnpm test:e2e
 *
 * CI:
 *   The GitHub Actions workflow starts supabase and next dev before running playwright.
 *   See deployment/ci-cd.md Section 11.4.
 *
 * Remote preview (optional, for smoke tests only):
 *   PLAYWRIGHT_BASE_URL=https://preview.vercel.app pnpm test:e2e
 *   (Requires E2E_SUPABASE_URL to also point at a seeded remote project)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,   // Serial: tests share local Supabase state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,             // Single worker avoids concurrent auth state conflicts
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],  // Real-time output during CI
  ],
  use: {
    // Default base URL — overridden by PLAYWRIGHT_BASE_URL env var in CI
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
      },
    },
  ],

  // Auto-start the Next.js dev server if not already running on port 3000.
  // In CI, the workflow starts the dev server manually before running playwright,
  // so this block is effectively a no-op (health check passes immediately).
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // If already running (CI case), use it
    timeout: 120 * 1000,        // 2 minutes max wait
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqHEaO1j4NB3bBq7_F6LqdM3a9i0MuQJc',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    },
  },
})
```

---

### 11.6 Updated E2E Auth Fixture

**Replaces:** `e2e/fixtures/auth.ts` from Section 5.2. The new version uses seeded users from `seed.sql` instead of GitHub Secrets.

**File path:** `apps/web/e2e/fixtures/auth.fixture.ts`

```typescript
// apps/web/e2e/fixtures/auth.fixture.ts
//
// Authentication fixtures for Playwright E2E tests.
// Uses seeded test users from supabase/seed.sql — no manually-created secrets needed.
//
// Usage:
//   import { test } from '../fixtures'
//   test('my test', async ({ freePage, starterPage }) => { ... })

import { test as base, Page, BrowserContext } from '@playwright/test'

// ─── Test User Credentials (from supabase/seed.sql) ──────────────────────────
// These are only valid against local Supabase (localhost:54321).
// They are intentionally NOT secrets — they only work in dev/CI.

export const TEST_USERS = {
  onboarding: {
    email: process.env.E2E_USER_ONBOARDING_EMAIL || 'onboarding@daimon-test.internal',
    password: process.env.E2E_USER_ONBOARDING_PASSWORD || 'TestPass123!',
    tenantId: null,  // No tenant created for onboarding user
    plan: null,
  },
  free: {
    email: process.env.E2E_USER_FREE_EMAIL || 'free@daimon-test.internal',
    password: process.env.E2E_USER_FREE_PASSWORD || 'TestPass123!',
    tenantId: '00000000-0002-0002-0002-100000000002',
    plan: 'free' as const,
  },
  starter: {
    email: process.env.E2E_USER_STARTER_EMAIL || 'starter@daimon-test.internal',
    password: process.env.E2E_USER_STARTER_PASSWORD || 'TestPass123!',
    tenantId: '00000000-0003-0003-0003-100000000003',
    plan: 'starter' as const,
  },
  pro: {
    email: process.env.E2E_USER_PRO_EMAIL || 'pro@daimon-test.internal',
    password: process.env.E2E_USER_PRO_PASSWORD || 'TestPass123!',
    tenantId: '00000000-0004-0004-0004-100000000004',
    plan: 'pro' as const,
  },
  suspended: {
    email: process.env.E2E_USER_SUSPENDED_EMAIL || 'suspended@daimon-test.internal',
    password: process.env.E2E_USER_SUSPENDED_PASSWORD || 'TestPass123!',
    tenantId: '00000000-0005-0005-0005-100000000005',
    plan: 'free' as const,
  },
  cancelled: {
    email: process.env.E2E_USER_CANCELLED_EMAIL || 'cancelled@daimon-test.internal',
    password: process.env.E2E_USER_CANCELLED_PASSWORD || 'TestPass123!',
    tenantId: '00000000-0006-0006-0006-100000000006',
    plan: 'free' as const,
  },
  admin: {
    email: process.env.E2E_USER_ADMIN_EMAIL || 'admin@daimon-test.internal',
    password: process.env.E2E_USER_ADMIN_PASSWORD || 'AdminPass456!',
    tenantId: null,
    plan: null,
  },
} as const

// ─── Helper: Sign in a page ───────────────────────────────────────────────────

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-submit"]')
  // Wait for redirect to dashboard (or onboarding page for new users)
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10_000 })
}

// ─── Fixture Type Definitions ─────────────────────────────────────────────────

type AuthFixtures = {
  /** Unauthenticated page — no session, navigates to / */
  publicPage: Page
  /** Page logged in as onboarding user (no tenant) */
  onboardingPage: Page
  /** Page logged in as free plan user (Discord connected, bot active) */
  freePage: Page
  /** Page logged in as starter plan user (full setup, active subscription) */
  starterPage: Page
  /** Page logged in as pro plan user (all services connected) */
  proPage: Page
  /** Page logged in as suspended user */
  suspendedPage: Page
  /** Page logged in as cancelled user (subscription expired) */
  cancelledPage: Page
  /** Page logged in as admin user */
  adminPage: Page
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export const test = base.extend<AuthFixtures>({
  publicPage: async ({ page }, use) => {
    await page.goto('/')
    await use(page)
  },

  onboardingPage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.onboarding.email, TEST_USERS.onboarding.password)
    await use(page)
  },

  freePage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.free.email, TEST_USERS.free.password)
    await page.waitForURL('/dashboard')
    await use(page)
  },

  starterPage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.starter.email, TEST_USERS.starter.password)
    await page.waitForURL('/dashboard')
    await use(page)
  },

  proPage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.pro.email, TEST_USERS.pro.password)
    await page.waitForURL('/dashboard')
    await use(page)
  },

  suspendedPage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.suspended.email, TEST_USERS.suspended.password)
    // Suspended users land on dashboard but see a suspension banner
    await page.waitForURL('/dashboard')
    await use(page)
  },

  cancelledPage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.cancelled.email, TEST_USERS.cancelled.password)
    await page.waitForURL('/dashboard')
    await use(page)
  },

  adminPage: async ({ page }, use) => {
    await signIn(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    // Admin users are redirected to /admin by the middleware
    await page.waitForURL('/admin/tenants', { timeout: 10_000 })
    await use(page)
  },
})

export { expect } from '@playwright/test'
```

**File path:** `apps/web/e2e/fixtures/index.ts`

```typescript
// apps/web/e2e/fixtures/index.ts
// Re-export all fixtures for easy import in test files

export { test, expect, TEST_USERS } from './auth.fixture'
export { seedFixture } from './seed.fixture'
```

---

### 11.7 Seed Verification Fixture

A lightweight fixture that verifies the seed data was applied correctly before running tests that depend on it.

**File path:** `apps/web/e2e/fixtures/seed.fixture.ts`

```typescript
// apps/web/e2e/fixtures/seed.fixture.ts
//
// Verifies that supabase/seed.sql was applied correctly before E2E tests run.
// Fails fast with a clear error if local Supabase was not seeded.
//
// Usage: Add `seedFixture` to tests that need specific tenant states.
// The fixture is idempotent — safe to use in multiple tests.

import { test as base, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0'

type SeedFixtures = {
  seedFixture: {
    /** Verify a specific tenant exists in the expected state */
    assertTenantState: (tenantId: string, expectedPlan: string, expectedStatus: string) => Promise<void>
    /** Get a direct Supabase admin client for test data inspection */
    adminClient: ReturnType<typeof createClient>
  }
}

export const seedFixture = base.extend<SeedFixtures>({
  seedFixture: async ({}, use) => {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false }
    })

    // Verify seed data exists on first use
    const { data: tenants, error } = await adminClient
      .from('tenants')
      .select('id, plan, status')
      .in('id', [
        '00000000-0002-0002-0002-100000000002',
        '00000000-0003-0003-0003-100000000003',
        '00000000-0004-0004-0004-100000000004',
      ])

    if (error || !tenants || tenants.length < 3) {
      throw new Error(
        `E2E seed data not found in Supabase.\n` +
        `Make sure local Supabase is running with seed data applied:\n` +
        `  1. From monorepo root: supabase start\n` +
        `  2. Verify: supabase status\n` +
        `  3. If needed reset: supabase db reset (re-applies migrations + seed.sql)\n` +
        `Error: ${error?.message || 'tenants not found'}`
      )
    }

    const assertTenantState = async (
      tenantId: string,
      expectedPlan: string,
      expectedStatus: string
    ): Promise<void> => {
      const { data, error: fetchError } = await adminClient
        .from('tenants')
        .select('plan, status')
        .eq('id', tenantId)
        .single()

      expect(fetchError, `Failed to fetch tenant ${tenantId}`).toBeNull()
      expect(data?.plan, `Tenant ${tenantId} plan mismatch`).toBe(expectedPlan)
      expect(data?.status, `Tenant ${tenantId} status mismatch`).toBe(expectedStatus)
    }

    await use({ assertTenantState, adminClient })
  }
})
```

---

### 11.8 Local Developer Workflow

**Complete zero-setup E2E test workflow:**

```bash
# Prerequisites: Docker Desktop running, Supabase CLI installed
# Install Supabase CLI: brew install supabase/tap/supabase
# Or: npm install -g supabase

# Step 1: Clone and install
git clone <repo>
cd monorepo
pnpm install

# Step 2: Start local Supabase
# This starts Postgres, Auth, Realtime, Storage on Docker
# Runs all migrations from supabase/migrations/
# Runs supabase/seed.sql (creates all test users and tenants)
supabase start

# Step 3: Confirm local Supabase is running
supabase status
# Output:
#   API URL: http://127.0.0.1:54321
#   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
#   Studio: http://127.0.0.1:54323

# Step 4: Create .env.local for the web app
# The local Supabase anon key and service role key are always the same
# for local dev — they're safe to put in .env.local (gitignored)
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqHEaO1j4NB3bBq7_F6LqdM3a9i0MuQJc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_STARTER_MONTHLY_PRICE_ID=price_your_starter_monthly_id
STRIPE_STARTER_ANNUAL_PRICE_ID=price_your_starter_annual_id
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id
STRIPE_PRO_ANNUAL_PRICE_ID=price_your_pro_annual_id
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_app_client_secret
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
LINEAR_OAUTH_CLIENT_ID=your_linear_oauth_client_id
LINEAR_OAUTH_CLIENT_SECRET=your_linear_oauth_client_secret
ADMIN_SECRET_KEY=local-dev-admin-secret
# E2E test user env vars (seeded by seed.sql — hardcoded, not secrets)
E2E_SUPABASE_URL=http://localhost:54321
E2E_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0
E2E_USER_ONBOARDING_EMAIL=onboarding@daimon-test.internal
E2E_USER_ONBOARDING_PASSWORD=TestPass123!
E2E_USER_FREE_EMAIL=free@daimon-test.internal
E2E_USER_FREE_PASSWORD=TestPass123!
E2E_USER_STARTER_EMAIL=starter@daimon-test.internal
E2E_USER_STARTER_PASSWORD=TestPass123!
E2E_USER_PRO_EMAIL=pro@daimon-test.internal
E2E_USER_PRO_PASSWORD=TestPass123!
E2E_USER_SUSPENDED_EMAIL=suspended@daimon-test.internal
E2E_USER_SUSPENDED_PASSWORD=TestPass123!
E2E_USER_CANCELLED_EMAIL=cancelled@daimon-test.internal
E2E_USER_CANCELLED_PASSWORD=TestPass123!
E2E_USER_ADMIN_EMAIL=admin@daimon-test.internal
E2E_USER_ADMIN_PASSWORD=AdminPass456!
EOF

# Step 5: Run the app
cd apps/web && pnpm dev
# App now running at http://localhost:3000

# Step 6: Run E2E tests (in another terminal)
pnpm --filter web test:e2e

# Run with UI mode (shows the Playwright test UI):
pnpm --filter web test:e2e:ui

# Reset and re-seed if data gets dirty:
supabase db reset  # Re-runs all migrations + seed.sql from scratch
```

---

### 11.9 Resetting Test Data

If E2E tests modify data and leave the local DB in a dirty state, reset with:

```bash
# From monorepo root
supabase db reset
# This drops the local DB, re-runs all migrations, re-applies seed.sql
# Takes ~30 seconds
```

Alternatively, individual tables can be reset manually in the local Supabase Studio at `http://localhost:54323`.

---

### 11.10 GitHub Actions Secrets Required for E2E

The following secrets are needed in GitHub Actions for the E2E job. Unlike the old approach, **no Supabase credentials are needed** (local Supabase uses hardcoded demo keys). Only Stripe test keys are needed to test the billing flows.

| Secret Name | Required For | Description |
|------------|--------------|-------------|
| `STRIPE_TEST_PUBLISHABLE_KEY` | Billing E2E tests | Stripe test publishable key (`pk_test_...`) |
| `STRIPE_TEST_SECRET_KEY` | Billing E2E tests | Stripe test secret key (`sk_test_...`) |
| `STRIPE_TEST_WEBHOOK_SECRET` | Billing E2E tests | Stripe test webhook secret (`whsec_...`) |
| `STRIPE_TEST_STARTER_MONTHLY_PRICE_ID` | Billing E2E tests | Price ID for Starter monthly in test mode |
| `STRIPE_TEST_STARTER_ANNUAL_PRICE_ID` | Billing E2E tests | Price ID for Starter annual in test mode |
| `STRIPE_TEST_PRO_MONTHLY_PRICE_ID` | Billing E2E tests | Price ID for Pro monthly in test mode |
| `STRIPE_TEST_PRO_ANNUAL_PRICE_ID` | Billing E2E tests | Price ID for Pro annual in test mode |
| `GITHUB_OAUTH_TEST_CLIENT_ID` | OAuth E2E tests | GitHub OAuth App client ID (test app with localhost redirect) |
| `GITHUB_OAUTH_TEST_CLIENT_SECRET` | OAuth E2E tests | GitHub OAuth App client secret |
| `GOOGLE_OAUTH_TEST_CLIENT_ID` | OAuth E2E tests | Google OAuth client ID (test app with localhost redirect) |
| `GOOGLE_OAUTH_TEST_CLIENT_SECRET` | OAuth E2E tests | Google OAuth client secret |
| `LINEAR_OAUTH_TEST_CLIENT_ID` | OAuth E2E tests | Linear OAuth App client ID |
| `LINEAR_OAUTH_TEST_CLIENT_SECRET` | OAuth E2E tests | Linear OAuth App client secret |

**Note:** `E2E_TEST_USER_EMAIL` and `E2E_TEST_USER_PASSWORD` secrets from the old approach are no longer needed. Remove them from GitHub Secrets after migrating to this approach.

---

### 11.11 Updated Workflow Dependencies (Section 10 addendum)

```
PR Push → daimon-web-ci.yml (UPDATED):
  ├── install
  ├── typecheck (needs: install)
  ├── lint (needs: install)
  ├── unit-tests (needs: install)
  ├── build (needs: typecheck, lint)
  ├── deploy-vercel (needs: build, unit-tests) → Preview URL (unchanged)
  └── e2e-tests (needs: build) → Playwright against local Supabase + Next.js dev
                                 (no longer depends on deploy-vercel)
```

The E2E job can now start in parallel with the `deploy-vercel` job since it no longer depends on it. This reduces total PR check time.

---

### 11.12 Troubleshooting Local Supabase

| Error | Cause | Fix |
|-------|-------|-----|
| `supabase start` hangs | Docker Desktop not running | Start Docker Desktop |
| `port 54321 already in use` | Another Supabase instance or service on that port | `supabase stop` then `supabase start`, or change port in config.toml |
| `seed.sql: vault not found` | pgsodium extension not loaded | Check `supabase/migrations/` for `CREATE EXTENSION IF NOT EXISTS pgsodium` — must be in earliest migration |
| `auth.users: permission denied` | Running seed.sql against remote Supabase | seed.sql is for local only — never run against remote |
| `supabase db reset` fails | Migration syntax error | Check latest migration file for syntax errors |
| E2E auth fixture fails `user not found` | seed.sql not applied | Run `supabase db reset` to re-apply seed |
| `vault.create_secret: function not found` | Old Supabase CLI version | `brew upgrade supabase` or update CLI to latest |

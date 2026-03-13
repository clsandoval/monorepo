# Infrastructure — Daimon SaaS

> Aspect: 6.1 — Vercel deployment config, env vars, build commands, domains
> Written: 2026-03-13
> Related: [environment.md](./environment.md), [domains.md](./domains.md), [ci-cd.md](./ci-cd.md)

---

## Overview

Daimon runs on three infrastructure providers:

| Provider | What runs there | Tier |
|----------|----------------|------|
| **Vercel** | Next.js website (frontend + API routes + Edge Functions) | Hobby or Pro (see below) |
| **Fly.io** | Decision Orchestrator Python bot | `shared-cpu-2x` machine, 256MB RAM |
| **Supabase** | PostgreSQL 17 database, Auth, Vault, Realtime, Edge Functions | Pro ($25/mo minimum for Vault + Realtime) |

---

## Section 1: Vercel (Next.js Website)

### 1.1 Framework Preset

Vercel auto-detects Next.js when the repository root is a Next.js project. If the monorepo structure is used, configure the **Root Directory** in Vercel's project settings to point to the website's directory (e.g., `apps/web`).

| Vercel Setting | Value |
|---------------|-------|
| Framework Preset | Next.js (auto-detected) |
| Root Directory | `apps/web` (or whichever directory contains the Next.js `package.json`) |
| Node.js Version | 20.x (LTS) |
| Build Command | `next build` (default — do NOT override) |
| Output Directory | `.next` (default — do NOT override) |
| Install Command | `pnpm install --frozen-lockfile` (if using pnpm) or `npm ci` |

### 1.2 Build Command

Default `next build`. No custom build command is needed.

If using Turborepo in the monorepo, set:
```
Build Command: cd ../.. && npx turbo run build --filter=web
Install Command: pnpm install --frozen-lockfile
```

### 1.3 Environment Variables in Vercel Dashboard

Go to: Vercel Dashboard → Project → Settings → Environment Variables

Set all variables from [environment.md](./environment.md) Section 1 for each environment (Production, Preview, Development). See [environment.md Section 1.9](./environment.md#19-vercel-environment-scoping) for the per-environment scoping table.

**Important distinctions:**
- Variables starting with `NEXT_PUBLIC_` are embedded in the client bundle at build time. Changing them requires a redeploy.
- Server-side variables (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, etc.) are injected at runtime and do NOT require a redeploy when changed — they take effect on the next serverless function invocation.
- Exception: Variables used in `next.config.ts` `env` block or in module-level code that runs once (like `lib/env.ts` schema parsing) require a redeploy.

### 1.4 `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for development warnings
  reactStrictMode: true,

  // Image optimization: allow Supabase storage domain for user avatars (future)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Headers: security headers applied to all responses
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // HSTS: only for production domain
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // Redirects: legacy URLs → new paths
  async redirects() {
    return [
      // Redirect /pricing to landing page pricing section
      {
        source: '/pricing',
        destination: '/#pricing',
        permanent: false,
      },
    ]
  },

  // Rewrites: none at launch
  // async rewrites() { return [] },

  // Experimental: Server Actions (stable in Next.js 14+, no flag needed)
  // experimental: {},
}

export default nextConfig
```

### 1.5 Vercel Project Settings

| Setting | Value |
|---------|-------|
| Project Name | `daimon` |
| Git Repository | `github.com/<org>/monorepo` |
| Production Branch | `main` |
| Preview Branches | All branches (auto-deploy) |
| Ignored Build Step | `git diff HEAD^ HEAD --quiet -- apps/web/` (skip rebuild if website unchanged in monorepo) |
| Serverless Function Region | `iad1` (US East — closest to Supabase if hosted in US East) |
| Edge Middleware Region | Global (default) |
| Function Timeout | 30 seconds (default for Hobby; Pro allows 60s for Data Cache) |

### 1.6 Vercel Ignored Build Step

In a monorepo, every commit triggers a Vercel build even if only unrelated packages changed. Add an Ignored Build Step to skip unnecessary builds:

**Script (set in Vercel Dashboard → Settings → Git → Ignored Build Step):**

```bash
git diff HEAD^ HEAD --quiet -- apps/web/
```

This exits with code 0 (skip build) if no files in `apps/web/` changed. It exits with code 1 (run build) if any `apps/web/` file changed.

**Alternative using Turbo Remote Cache:** If using Turborepo with Vercel Remote Cache, the build is still triggered but tasks are cached. Both approaches are valid; the Ignored Build Step is simpler.

### 1.7 Next.js Middleware (`middleware.ts`)

Middleware runs at the Edge (globally) before every request. Used for:
1. Authentication guard — redirect unauthenticated users from `/dashboard/*` to `/login`
2. Admin guard — redirect non-admins from `/admin/*` to `/dashboard`
3. Session refresh — refresh Supabase Auth session cookie on every request

**File:** `src/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Refresh session (required by @supabase/ssr)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected: /dashboard/* requires authenticated user
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Protected: /admin/* requires is_admin JWT claim
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // Check admin claim from app_metadata
    const isAdmin = user.app_metadata?.is_admin === true
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run middleware on all paths except static files and API routes that
    // don't need auth (like /api/stripe/webhook which has its own auth)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Note:** The Stripe webhook route `/api/stripe/webhook` must NOT have the Supabase session middleware applied (it would fail to refresh a non-user session). The matcher pattern above excludes it because it starts with `/api/`, but the webhook route itself does not read the session.

### 1.8 Vercel Tier Recommendation

**Minimum: Vercel Pro** ($20/month per member)

Reasons:
- Hobby plan has 100GB bandwidth/month (insufficient for production)
- Hobby plan has 30s function timeout (sufficient)
- Pro plan enables password protection on preview deployments (prevents public access to previews)
- Pro plan enables branch-based domain aliases (`branch.daimon.ai`)
- Pro plan has Vercel Analytics (use for Core Web Vitals monitoring)
- Pro plan has Web Application Firewall (WAF) — recommended for admin panel protection

**Vercel Analytics**: Enable in Vercel Dashboard → Project → Analytics. Add `<Analytics />` component from `@vercel/analytics/react` to the root layout. This provides Core Web Vitals data without a third-party script.

---

## Section 2: Fly.io (Decision Orchestrator Bot)

### 2.1 `fly.toml`

```toml
# fly.toml — Daimon Bot
# Generated and maintained manually; do NOT use `fly launch` to regenerate
app = "daimon-bot"
primary_region = "iad"  # US East — same region as Supabase for low-latency DB

[build]
  # Docker build from apps/bot/Dockerfile
  dockerfile = "Dockerfile"

[env]
  FLY_ORG_SLUG = "pymc"
  ONYX_BASE_URL = "https://onyx.fly.dev"
  LANGFUSE_HOST = "https://cloud.langfuse.com"
  HEALTH_PORT = "8080"
  HEARTBEAT_INTERVAL_SECONDS = "30"
  STALE_THRESHOLD_SECONDS = "120"
  STALE_CRITICAL_THRESHOLD_SECONDS = "600"
  BOT_LOG_LEVEL = "INFO"

[http_service]
  internal_port = 8080     # FastAPI health server port
  force_https = false       # Bot is not a public HTTP server; health checks are internal
  auto_stop_machines = "off"   # Bot must NEVER auto-stop — it maintains WebSocket connections
  auto_start_machines = false  # Not a request-driven service
  min_machines_running = 1     # Always keep 1 machine alive

[[vm]]
  size = "shared-cpu-2x"   # 2 vCPUs, 256MB RAM — adequate for Python asyncio with N tenants
  memory = "512mb"          # 512MB RAM recommended; upgrade to 1GB if >50 concurrent tenants

[checks]
  [checks.health]
    grace_period = "30s"    # Allow 30s for bot to start up and connect tenants
    interval = "15s"        # Check every 15 seconds
    method = "get"
    path = "/health"        # FastAPI health endpoint
    port = 8080
    timeout = "5s"
    type = "http"

[[mounts]]
  # No persistent volumes needed — all state in Supabase
```

### 2.2 Fly.io Machine Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Machine size | `shared-cpu-2x` | Python asyncio is I/O-bound; 2 vCPUs prevents starvation during multiple concurrent Discord WebSocket connections |
| Memory | 512MB (start), 1GB (if >50 tenants) | Each Discord WebSocket connection uses ~5–10MB; Python overhead ~100MB |
| Region | `iad` (US East) | Minimize latency to Supabase (hosted in US East by default) |
| Auto-stop | `off` | Bot MUST stay alive to maintain Discord WebSocket connections 24/7 |
| Min machines | `1` | Always 1 running machine |
| Persistent disk | None | All state in Supabase; no local disk needed |

### 2.3 Bot Dockerfile

**File:** `apps/bot/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src_v2/ ./src_v2/

# Health check (also configured in fly.toml)
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the bot
CMD ["python", "-m", "src_v2.entrypoints.discord.main"]
```

### 2.4 Bot Deployment Commands

**First deployment:**
```bash
cd apps/bot
fly auth login
fly apps create daimon-bot --org pymc
fly secrets set \
  SUPABASE_URL="https://abcdefghijklmnop.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  FLY_API_TOKEN="fo1_..." \
  ONYX_API_KEY="onyx_..." \
  LANGFUSE_PUBLIC_KEY="pk-lf-..." \
  LANGFUSE_SECRET_KEY="sk-lf-..."
fly deploy
```

**Subsequent deployments:**
```bash
cd apps/bot
fly deploy --app daimon-bot
```

**Rolling restart (zero-downtime):**
```bash
fly machine restart --app daimon-bot
```

**View logs:**
```bash
fly logs --app daimon-bot
```

**Scale up (if >50 tenants):**
```bash
fly machine update <machine-id> --vm-memory 1024 --app daimon-bot
```

### 2.5 Health Server (FastAPI)

The bot runs a minimal FastAPI server on port 8080 for Fly.io health checks.

**File:** `apps/bot/src_v2/entrypoints/health_server.py`

**Endpoints:**

| Route | Method | Response | Description |
|-------|--------|----------|-------------|
| `/health` | GET | `{"status": "ok", "tenant_count": N, "timestamp": "..."}` | Fly.io health check target. Returns 200 if bot process is alive. |
| `/health/tenants` | GET | `{"tenants": [{"id": "...", "status": "connected", "last_heartbeat": "..."}]}` | Per-tenant connection status. Used by admin monitoring. Requires `X-Admin-Secret` header. |
| `/ready` | GET | `{"ready": true}` if ≥1 tenant connected, else 503 | Kubernetes-style readiness probe. Not required by Fly.io but useful for monitoring. |

---

## Section 3: Supabase

### 3.1 Supabase Tier

**Required: Supabase Pro** ($25/month)

Reasons:
- Vault (encrypted secret storage) is available on Free tier but with limited function call limits
- Realtime concurrent connections: Free tier allows 200 concurrent; Pro allows 500
- pg_cron extension (for Google token refresh job): available on Pro
- Daily automatic backups: Pro includes 7-day PITR (Point-in-Time Recovery)
- Custom domains: Pro allows custom domain for the Supabase API (if desired)

### 3.2 Supabase Project Setup

**Steps (one-time, done by platform admin):**

1. Create project in Supabase Dashboard (https://supabase.com/dashboard)
   - Organization: Create or use existing
   - Project name: `daimon`
   - Database password: Generate strong password, store securely
   - Region: `us-east-1` (or match Vercel and Fly.io region)
   - Pricing plan: Pro

2. Enable required extensions in Supabase Dashboard → Database → Extensions:
   - `pgcrypto` — for UUID generation (enabled by default)
   - `pg_cron` — for Google token refresh scheduled job
   - `pgsodium` — for Vault encryption (enabled by default on Supabase)

3. Enable Vault in Supabase Dashboard → Database → Vault:
   - Vault is automatically available; no explicit enable step needed
   - Run Vault function migrations (see [../database/vault-encryption.md](../database/vault-encryption.md))

4. Enable Realtime for required tables in Supabase Dashboard → Database → Replication:
   - `discord_connections` — enable all events (INSERT, UPDATE, DELETE)
   - `tenant_api_keys` — enable all events
   - `tenant_service_connections` — enable all events
   - `tenants` — enable UPDATE events only

   Or run SQL:
   ```sql
   ALTER publication supabase_realtime ADD TABLE discord_connections;
   ALTER publication supabase_realtime ADD TABLE tenant_api_keys;
   ALTER publication supabase_realtime ADD TABLE tenant_service_connections;
   ALTER publication supabase_realtime ADD TABLE tenants;
   ```

5. Configure Auth in Supabase Dashboard → Authentication → Settings:
   - Site URL: `https://daimon.ai`
   - Additional redirect URLs: `https://*.vercel.app/**` (for preview deployments)
   - Email confirmation: Enabled
   - Minimum password length: 8 characters
   - Enable email confirmations: Yes (users must confirm email before login)
   - OTP expiry: 3600 seconds (1 hour) — for password reset links
   - Mailer: Supabase built-in SMTP for launch; upgrade to custom SMTP (e.g., Postmark, SendGrid) for better deliverability

6. Configure Auth Email Templates in Supabase Dashboard → Authentication → Email Templates:

   **Confirm Signup:**
   - Subject: `Confirm your Daimon account`
   - Body: Use default template with Daimon branding substituted

   **Reset Password:**
   - Subject: `Reset your Daimon password`
   - Body: Use default template

   **Note:** Full email template content is not specified here — use Supabase defaults initially, update with branded templates post-launch.

7. Run migrations in order (see [../database/migrations.md](../database/migrations.md)):
   ```bash
   # Using Supabase CLI
   supabase db push --db-url "postgres://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
   ```

8. Set up pg_cron job for Google token refresh (part of migration 20260400000005):
   - Migration SQL includes the `cron.schedule()` call — no manual step needed

9. Configure SMTP for production email delivery (post-launch):
   - Supabase Dashboard → Authentication → Settings → SMTP Settings
   - Use Postmark, SendGrid, or Resend for reliable deliverability

### 3.3 Supabase Local Development

**Install Supabase CLI:**
```bash
npm install -g supabase
```

**Initialize and start local Supabase:**
```bash
supabase init           # Creates supabase/ directory with config
supabase start          # Starts local Postgres, Auth, Realtime, etc.
supabase db reset       # Applies all migrations fresh
```

**Local Supabase services:**
| Service | Local URL |
|---------|-----------|
| API | `http://localhost:54321` |
| DB | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Studio | `http://localhost:54323` |
| Auth | `http://localhost:54321/auth/v1` |
| Realtime | `ws://localhost:54321/realtime/v1` |

**Local environment variables** (set in `apps/web/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from `supabase status`>
SUPABASE_SERVICE_ROLE_KEY=<from `supabase status`>
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

---

## Section 4: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                           │
│                   Next.js SPA + RSC                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌─────────────────┐  ┌──────────────────┐                     │
│  │  Edge Middleware │  │   API Routes     │                     │
│  │  (auth guard)   │  │  /api/stripe/*   │                     │
│  │  Global CDN     │  │  /api/auth/*     │                     │
│  └─────────────────┘  │  /api/admin/*    │                     │
│                        │  /api/integr/*  │                     │
│                        └────────┬─────────┘                    │
└────────────────────────────────┼─────────────────────────────────┘
                                 │ HTTPS (service role)
         ┌───────────────────────┼──────────────────────┐
         │                       │                      │
         ▼                       ▼                      ▼
┌────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   SUPABASE     │    │   STRIPE         │    │  OAUTH PROVIDERS│
│  PostgreSQL 17 │    │  Checkout        │    │  GitHub        │
│  Auth          │    │  Webhooks        │    │  Google        │
│  Vault         │◄───│  Customer Portal │    │  Linear        │
│  Realtime      │    └──────────────────┘    └────────────────┘
│  Edge Funcs    │
└────────┬───────┘
         │ Realtime WebSocket (service role)
         │ Postgres connection
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FLY.IO (iad)                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Decision Orchestrator Bot (Python)             │    │
│  │  ┌─────────────────────────────────────────────────┐  │    │
│  │  │  TenantConnectionManager (asyncio)              │  │    │
│  │  │  ┌──────────────┐  ┌──────────────┐            │  │    │
│  │  │  │ Tenant A     │  │ Tenant B     │  ...       │  │    │
│  │  │  │ Discord WS   │  │ Discord WS   │            │  │    │
│  │  │  └──────────────┘  └──────────────┘            │  │    │
│  │  └─────────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────┐                                  │    │
│  │  │ FastAPI :8080    │ ← Fly.io health checks          │    │
│  │  └──────────────────┘                                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  EXTERNAL SERVICES             │
│  Anthropic API (per-tenant)    │
│  Toggl API (per-tenant BYOK)   │
│  Onyx RAG (shared)             │
│  Langfuse traces (shared)      │
│  LinkedIn API (shared)         │
│  Google Analytics (shared)     │
└────────────────────────────────┘
```

---

## Section 5: Cost Estimates

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| Vercel | Pro | $20/member | 1 developer = $20/mo |
| Supabase | Pro | $25 | + $0.25/GB storage over 8GB, + $0.09/GB egress over 5GB |
| Fly.io | Pay-as-you-go | ~$5–15 | `shared-cpu-2x` 512MB = ~$5.70/mo; 1GB = ~$11.40/mo |
| Stripe | Pay-as-you-go | 2.9% + $0.30 per transaction | No monthly fee |
| Langfuse | Cloud Free | $0 | Free tier 50k observations/mo; upgrade at scale |
| **Total (launch)** | | **~$50–60/mo** | Scales with Supabase storage/egress and Fly.io RAM |

---

## Section 6: Supabase Edge Functions

Three Supabase Edge Functions handle sensitive operations (Vault writes) that must run with service role permissions but be invokable from the browser with anon key + RLS auth:

| Function Name | HTTP Method | Auth Required | Purpose |
|--------------|-------------|---------------|---------|
| `store-tenant-api-key` | POST | User JWT (anon key) | Store Anthropic/OpenAI API key in Vault, update `tenant_api_keys` |
| `upsert-service-connection` | POST | User JWT (anon key) | Store OAuth tokens / API keys in Vault, upsert `tenant_service_connections` |
| `delete-service-connection` | POST | User JWT (anon key) | Delete Vault secret, delete `tenant_service_connections` row |

**Deployment:**
```bash
# Deploy all edge functions
supabase functions deploy store-tenant-api-key --project-ref <ref>
supabase functions deploy upsert-service-connection --project-ref <ref>
supabase functions deploy delete-service-connection --project-ref <ref>
```

**Edge Function environment variables** (set via Supabase Dashboard → Edge Functions → Manage Secrets):
- `SUPABASE_SERVICE_ROLE_KEY` — automatically available in Edge Functions as `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` via the built-in Supabase client
- No additional secrets needed for the three functions above — they use the built-in `supabaseAdmin` client

Full Edge Function code is specified in [../database/vault-encryption.md](../database/vault-encryption.md).

# Environment Variables — Daimon SaaS

> Aspect: 6.1 — Vercel deployment config, env vars, build commands, domains
> Written: 2026-03-13
> Related: [infrastructure.md](./infrastructure.md), [domains.md](./domains.md),
>          [../integrations/stripe.md](../integrations/stripe.md),
>          [../integrations/oauth-services.md](../integrations/oauth-services.md),
>          [../integrations/api-key-services.md](../integrations/api-key-services.md),
>          [../database/vault-encryption.md](../database/vault-encryption.md)

---

## Overview

This file is the **authoritative reference** for every environment variable in the Daimon system. Two separate environments need variables:

1. **Next.js Website (Vercel)** — `app/` directory of the monorepo
2. **Decision Orchestrator Bot (Fly.io)** — `apps/bot/` directory of the monorepo

Variables prefixed `NEXT_PUBLIC_` are embedded in the client bundle (browser-visible). All other variables are server-side only and must NEVER be exposed to the browser.

---

## Section 1: Next.js Website (Vercel)

### 1.1 Supabase

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (client-safe) | YES | The full URL of the Supabase project. Format: `https://<project-ref>.supabase.co`. Used by `@supabase/ssr` on both server and client. Copy from Supabase Dashboard → Project Settings → API → Project URL. | `https://abcdefghijklmnop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (client-safe) | YES | The Supabase anonymous (publishable) key. Safe to expose to the browser. JWT with `role=anon`. Subject to Row Level Security policies. Copy from Supabase Dashboard → Project Settings → API → Project API Keys → `anon public`. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTU5MjUwMCwiZXhwIjoxOTYxMTY4NTAwfQ.abc123` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only | YES | The Supabase service role key. Bypasses all Row Level Security. Used by admin panel routes and server actions that need to write to tables outside the user's RLS scope. NEVER expose to browser. Copy from Supabase Dashboard → Project Settings → API → Project API Keys → `service_role secret`. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1NTkyNTAwLCJleHAiOjE5NjExNjg1MDB9.xyz789` |
| `SUPABASE_JWT_SECRET` | Server-side only | YES | The JWT signing secret for the Supabase project. Used to verify and sign custom JWT claims (admin impersonation sessions). Copy from Supabase Dashboard → Project Settings → API → JWT Settings → JWT Secret. | `super-secret-jwt-token-with-at-least-32-characters` |

### 1.2 Stripe

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Server-side only | YES | Stripe secret API key. Used for all server-side Stripe API calls: creating Checkout Sessions, creating Customer Portal sessions, retrieving subscriptions. `sk_test_...` in development, `sk_live_...` in production. Copy from Stripe Dashboard → Developers → API Keys → Secret key. NEVER expose to browser. | `sk_live_51Rabc123def456ghi789jkl` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public (client-safe) | NO | Stripe publishable key. Safe to expose to the browser. Not required for the Checkout redirect flow (where the user is redirected to hosted Stripe Checkout). Include for future Stripe Elements/Payment Sheet usage. `pk_test_...` in development, `pk_live_...` in production. | `pk_live_51Rabc123def456ghi789jkl` |
| `STRIPE_WEBHOOK_SECRET` | Server-side only | YES | The Stripe webhook endpoint signing secret. Used to verify that webhook requests originate from Stripe (prevents spoofed webhooks). Generated when registering the webhook endpoint in Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret. Always starts with `whsec_`. | `whsec_abc123def456ghi789jkl012mno345` |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | Server-side only | YES | Stripe Price ID for the Starter plan, monthly billing cycle. Created in Stripe Dashboard when setting up the Daimon Starter product. Used by the Checkout Session creation route to specify which price to charge. | `price_1RstarterMonthlyXXXXXXXX` |
| `STRIPE_STARTER_ANNUAL_PRICE_ID` | Server-side only | YES | Stripe Price ID for the Starter plan, annual billing cycle ($108/year = $9/month equivalent). | `price_1RstarterAnnualXXXXXXXXX` |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Server-side only | YES | Stripe Price ID for the Pro plan, monthly billing cycle. | `price_1RproMonthlyXXXXXXXXXXXX` |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Server-side only | YES | Stripe Price ID for the Pro plan, annual billing cycle ($360/year = $30/month equivalent). | `price_1RproAnnualXXXXXXXXXXXXX` |

### 1.3 App Configuration

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `NEXT_PUBLIC_APP_URL` | Public (client-safe) | YES | The full public URL of the Next.js app. No trailing slash. Used to construct absolute URLs for: Stripe redirect URLs (success/cancel), OAuth callback URLs, email confirmation links, OG image URLs. In production: `https://daimon.ai`. In preview deployments: automatically detected from `VERCEL_URL` (see `lib/env.ts` note below). | `https://daimon.ai` |
| `NEXTAUTH_SECRET` | Server-side only | YES | 32-byte random secret used for signing/encrypting custom session tokens. Not used by Supabase Auth directly (which uses its own JWT secret), but used by the admin impersonation flow to sign short-lived impersonation JWTs that are separate from the main Supabase session. Generate with: `openssl rand -base64 32`. | `rC8zK9mQ2tY5hL1nF4xV7bJ3wE6pA0dG+i9uT...` |

### 1.4 OAuth — GitHub

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `GITHUB_CLIENT_ID` | Server-side only | YES (for GitHub OAuth) | Client ID of the GitHub OAuth App. Copy from https://github.com/settings/developers → OAuth Apps → Your App → Client ID. | `Iv1.a1b2c3d4e5f6g7h8` |
| `GITHUB_CLIENT_SECRET` | Server-side only | YES (for GitHub OAuth) | Client secret of the GitHub OAuth App. Generated in GitHub Developer Settings. Rotate if exposed. NEVER commit to git. | `abc123def456ghi789jkl012mno345pqr678stu` |

### 1.5 OAuth — Google

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `GOOGLE_CLIENT_ID` | Server-side only | YES (for Google OAuth) | Client ID of the Google OAuth 2.0 Web Application credential. Copy from Google Cloud Console → APIs & Services → Credentials → Web Client. Format: `<number>-<hash>.apps.googleusercontent.com`. | `123456789012-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Server-side only | YES (for Google OAuth) | Client secret of the Google OAuth 2.0 Web Application credential. Copy from Google Cloud Console → APIs & Services → Credentials → Web Client → Client secret. | `GOCSPX-abc123def456ghi789jkl012` |

### 1.6 OAuth — Linear

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `LINEAR_CLIENT_ID` | Server-side only | YES (for Linear OAuth) | OAuth application client ID from Linear. Copy from Linear → Settings → API → OAuth Applications → Your App → Client ID. | `abc123def456ghi789jkl012mno345pq` |
| `LINEAR_CLIENT_SECRET` | Server-side only | YES (for Linear OAuth) | OAuth application client secret from Linear. Copy from Linear → Settings → API → OAuth Applications → Your App → Client Secret. | `abc123def456ghi789jkl012mno345pqrstu678vwx` |

### 1.7 Admin Panel

| Variable | Visibility | Required | Description | Example Value |
|----------|-----------|----------|-------------|---------------|
| `ADMIN_CREATION_SECRET` | Server-side only | NO (used once) | One-time secret passed as a header when calling the admin-user creation endpoint (`POST /api/admin/create-user`). After the first admin account is created, this endpoint can be disabled. Not used at runtime. | `my-one-time-admin-bootstrap-secret-2026` |

### 1.8 Complete Website `.env.local` Template

```bash
# ============================================================
# DAIMON WEBSITE — ENVIRONMENT VARIABLES
# Copy to .env.local for local development
# Set all in Vercel Dashboard for production / preview
# ============================================================

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-at-least-32-chars

# --- App URL ---
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Stripe ---
STRIPE_SECRET_KEY=sk_test_51R...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51R...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_MONTHLY_PRICE_ID=price_1R...
STRIPE_STARTER_ANNUAL_PRICE_ID=price_1R...
STRIPE_PRO_MONTHLY_PRICE_ID=price_1R...
STRIPE_PRO_ANNUAL_PRICE_ID=price_1R...

# --- GitHub OAuth ---
GITHUB_CLIENT_ID=Iv1.abc123
GITHUB_CLIENT_SECRET=abc123...

# --- Google OAuth ---
GOOGLE_CLIENT_ID=123456789012-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123

# --- Linear OAuth ---
LINEAR_CLIENT_ID=abc123...
LINEAR_CLIENT_SECRET=abc123...

# --- Admin ---
NEXTAUTH_SECRET=<openssl rand -base64 32>
ADMIN_CREATION_SECRET=<one-time-use, can be any string>
```

### 1.9 Vercel Environment Scoping

Variables are set per-environment in the Vercel Dashboard (Project → Settings → Environment Variables):

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase project | Staging Supabase project (or same as prod — read-only caution) | Local Supabase or prod with care |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key | Staging anon key | Local / staging |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service role | Staging service role | Local / staging |
| `SUPABASE_JWT_SECRET` | Production JWT secret | Staging JWT secret | Local / staging |
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_test_...` | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_test_...` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Production endpoint secret | Test endpoint secret (separate webhook registered in Stripe for preview) | Local Stripe CLI tunnel secret |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | Live price ID | Test price ID | Test price ID |
| `STRIPE_STARTER_ANNUAL_PRICE_ID` | Live price ID | Test price ID | Test price ID |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Live price ID | Test price ID | Test price ID |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Live price ID | Test price ID | Test price ID |
| `NEXT_PUBLIC_APP_URL` | `https://daimon.ai` | `https://<branch>.daimon.ai` (set via Vercel branch domains) | `http://localhost:3000` |
| `GITHUB_CLIENT_ID` | Production GitHub OAuth App | Dev GitHub OAuth App | Dev GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Production secret | Dev secret | Dev secret |
| `GOOGLE_CLIENT_ID` | Production credential | Dev credential (separate authorized redirect URI) | Dev credential |
| `GOOGLE_CLIENT_SECRET` | Production secret | Dev secret | Dev secret |
| `LINEAR_CLIENT_ID` | Production Linear app | Dev Linear app | Dev Linear app |
| `LINEAR_CLIENT_SECRET` | Production secret | Dev secret | Dev secret |
| `NEXTAUTH_SECRET` | Unique 32-byte secret | Different 32-byte secret | Any string (dev only) |
| `ADMIN_CREATION_SECRET` | Set once, then remove | N/A | Any string |

**Important**: OAuth providers (GitHub, Google, Linear) require separate OAuth app registrations for production vs. development, because redirect URIs differ. Each app has its own client ID/secret pair.

---

## Section 2: Decision Orchestrator Bot (Fly.io)

The bot runs on Fly.io as a Python process. In the multi-tenant model, per-tenant credentials (Discord tokens, Anthropic keys, service connection tokens) are loaded from Supabase at runtime via the `_load_tenant_config()` function — they are NOT in environment variables. Only system-level (shared across all tenants) credentials are in env vars.

### 2.1 Supabase (Required — shared)

| Variable | Required | Description | Example Value |
|----------|----------|-------------|---------------|
| `SUPABASE_URL` | YES | Supabase project URL. Same value as `NEXT_PUBLIC_SUPABASE_URL` on the website. The bot uses this to connect the Supabase Python client. | `https://abcdefghijklmnop.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | YES | Supabase service role key. Same value as the website's `SUPABASE_SERVICE_ROLE_KEY`. Bot needs this to bypass RLS and read all tenant data. NEVER expose publicly. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 2.2 Fly.io (Required — system-level)

| Variable | Required | Description | Example Value |
|----------|----------|-------------|---------------|
| `FLY_API_TOKEN` | YES | Fly.io API token for the Machines API. Used by Fly tools to launch, inspect, and manage Fly Machines (for ACP session hosting). Scoped to the `pymc` organization. Generate from Fly.io Dashboard → Account → Access Tokens → Create Token. | `fo1_abc123def456ghi789jkl012mno345pqr` |
| `FLY_ORG_SLUG` | YES | The Fly.io organization slug. Used when creating Machines (the API requires an org context). | `pymc` |

### 2.3 Onyx RAG (Required — system-level)

| Variable | Required | Description | Example Value |
|----------|----------|-------------|---------------|
| `ONYX_API_KEY` | YES | API key for the Onyx (open-source RAG platform) deployment. Onyx is a shared platform service — all tenants use the same Onyx instance. Used by Onyx tools: `onyx_search`, `onyx_ask`. | `onyx_abc123def456ghi789jkl012mno` |
| `ONYX_BASE_URL` | YES | Base URL of the Onyx deployment. Typically a Fly.io app URL if self-hosted, or the cloud Onyx URL if using the hosted service. Used to construct all Onyx API endpoints. | `https://onyx.fly.dev` |

### 2.4 Langfuse Observability (Required — system-level)

| Variable | Required | Description | Example Value |
|----------|----------|-------------|---------------|
| `LANGFUSE_PUBLIC_KEY` | YES | Langfuse public key for tracing. Used to initialize the Langfuse Python client. Langfuse is the observability platform for all Claude Agent SDK traces. Copy from Langfuse Dashboard → Project Settings → API Keys → Public Key. | `pk-lf-abc123def456ghi789jkl012mno34` |
| `LANGFUSE_SECRET_KEY` | YES | Langfuse secret key. Used alongside the public key to authenticate trace uploads. Server-side only. Copy from Langfuse Dashboard → Project Settings → API Keys → Secret Key. | `sk-lf-abc123def456ghi789jkl012mno34` |
| `LANGFUSE_HOST` | YES | The Langfuse Cloud host URL, or self-hosted URL if running Langfuse locally. | `https://cloud.langfuse.com` |

### 2.5 Bot Process Config (Optional — defaults built-in)

| Variable | Required | Default | Description | Example Value |
|----------|----------|---------|-------------|---------------|
| `BOT_LOG_LEVEL` | NO | `INFO` | Python logging level for the bot process. Set to `DEBUG` for verbose output. Values: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`. | `INFO` |
| `HEALTH_PORT` | NO | `8080` | Port that the FastAPI health server binds to. Fly.io health checks target this port. Override if port 8080 is unavailable. | `8080` |
| `HEARTBEAT_INTERVAL_SECONDS` | NO | `30` | How often (in seconds) each tenant's heartbeat loop writes `last_heartbeat` to the `discord_connections` table. | `30` |
| `STALE_THRESHOLD_SECONDS` | NO | `120` | Seconds since last heartbeat before a connection is considered stale (status → `stale` in dashboard). | `120` |
| `STALE_CRITICAL_THRESHOLD_SECONDS` | NO | `600` | Seconds since last heartbeat before a connection is considered critically stale (status → `stale_critical`). | `600` |

### 2.6 Complete Bot `fly.env` Template (Non-Secret)

Secrets are stored in Fly.io's built-in secret store (not in fly.toml). Non-secret config goes in `fly.toml → [env]`.

```toml
# fly.toml — [env] section (non-secret values only)
[env]
  FLY_ORG_SLUG = "pymc"
  ONYX_BASE_URL = "https://onyx.fly.dev"
  LANGFUSE_HOST = "https://cloud.langfuse.com"
  HEALTH_PORT = "8080"
  HEARTBEAT_INTERVAL_SECONDS = "30"
  STALE_THRESHOLD_SECONDS = "120"
  STALE_CRITICAL_THRESHOLD_SECONDS = "600"
  BOT_LOG_LEVEL = "INFO"
```

**Secrets set via `fly secrets set`** (run once, never in files):

```bash
fly secrets set \
  SUPABASE_URL="https://abcdefghijklmnop.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  FLY_API_TOKEN="fo1_..." \
  ONYX_API_KEY="onyx_..." \
  LANGFUSE_PUBLIC_KEY="pk-lf-..." \
  LANGFUSE_SECRET_KEY="sk-lf-..." \
  --app daimon-bot
```

---

## Section 3: Shared Variables Summary

These variables have the same value on both the website (Vercel) and the bot (Fly.io). They reference the same Supabase project and are a single source of truth.

| Variable | Website Name | Bot Name | Shared Value |
|----------|-------------|---------|--------------|
| Supabase project URL | `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL` | `https://<ref>.supabase.co` |
| Supabase service role key | `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Same key |

**Note on anon key**: The website's `NEXT_PUBLIC_SUPABASE_ANON_KEY` is NOT used by the bot. The bot always uses the service role key for all DB operations.

---

## Section 4: `lib/env.ts` — Runtime Env Validation (Website)

The Next.js website uses a runtime validation module to catch missing env vars at startup rather than at the call site.

**File:** `src/lib/env.ts`

```typescript
import { z } from 'zod'

const serverEnvSchema = z.object({
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(32),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_STARTER_MONTHLY_PRICE_ID: z.string().startsWith('price_'),
  STRIPE_STARTER_ANNUAL_PRICE_ID: z.string().startsWith('price_'),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().startsWith('price_'),
  STRIPE_PRO_ANNUAL_PRICE_ID: z.string().startsWith('price_'),

  // OAuth
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  LINEAR_CLIENT_ID: z.string().min(1),
  LINEAR_CLIENT_SECRET: z.string().min(1),

  // Admin
  NEXTAUTH_SECRET: z.string().min(32),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

// Validate at module load time (fails fast on startup)
export const serverEnv = serverEnvSchema.parse(process.env)

// Client-side env is embedded at build time
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
```

**Usage:** Import `serverEnv` instead of `process.env` in server-side code. The schema provides TypeScript types automatically.

---

## Section 5: Secret Rotation Procedures

### 5.1 Rotating the Supabase Service Role Key

1. Generate a new key in Supabase Dashboard → Project Settings → API → Rotate keys
2. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel Dashboard (Production + Preview environments)
3. Update `SUPABASE_SERVICE_ROLE_KEY` via `fly secrets set` on the bot
4. Verify bot reconnects successfully (monitor logs for 60 seconds)
5. Revoke the old key in Supabase Dashboard

### 5.2 Rotating the Stripe Webhook Secret

1. In Stripe Dashboard → Developers → Webhooks → Select endpoint → Roll signing secret
2. New secret is immediately active; old secret has a grace period of 72 hours
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel Dashboard
4. Redeploy website (or wait for next deploy — key is read at cold start)

### 5.3 Rotating OAuth Secrets (GitHub, Google, Linear)

**GitHub:** GitHub Settings → OAuth Apps → Your App → Generate a new client secret → Update `GITHUB_CLIENT_SECRET` in Vercel → Revoke old secret.

**Google:** Google Cloud Console → APIs & Services → Credentials → Edit OAuth Client → Reset secret → Update `GOOGLE_CLIENT_SECRET` in Vercel.

**Linear:** Linear Settings → API → OAuth Applications → Your App → Regenerate Secret → Update `LINEAR_CLIENT_SECRET` in Vercel.

**Impact:** Existing connected users are NOT affected (OAuth tokens are stored, not the client secret). New OAuth connection attempts use the new secret.

### 5.4 Rotating the Supabase JWT Secret

⚠️ **HIGH IMPACT**: Rotating the Supabase JWT secret invalidates ALL active user sessions immediately.

1. Plan maintenance window (all users will be logged out)
2. Update JWT secret in Supabase Dashboard → Project Settings → API → JWT Settings
3. Update `SUPABASE_JWT_SECRET` in Vercel
4. Update `SUPABASE_JWT_SECRET` on bot if used (typically not)
5. Notify users of forced logout in advance if possible

---

## Section 6: Local Development Stripe Webhook Testing

The Stripe webhook endpoint (`/api/stripe/webhook`) requires a live HTTP connection for Stripe to send events. During local development, use the Stripe CLI to forward events:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward events to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# The CLI outputs a webhook signing secret: whsec_test_...
# Set this in .env.local as STRIPE_WEBHOOK_SECRET
```

The Stripe CLI secret starts with `whsec_` like the production secret. Swap it in `.env.local` when using the CLI tunnel.

**Triggering test events:**

```bash
# Simulate a successful subscription
stripe trigger checkout.session.completed

# Simulate a payment failure
stripe trigger invoice.payment_failed

# Simulate subscription cancellation
stripe trigger customer.subscription.deleted
```

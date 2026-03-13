# Daimon — Self-Serve SaaS Platform

**Date:** 2026-03-12
**Status:** Draft
**Product:** Daimon (self-serve Decision Orchestrator)

## Overview

Daimon is a self-serve SaaS website where anyone can bring their own Discord bot token and Anthropic API key to get their own instance of Decision Orchestrator — a Discord-native AI operating system with 50+ integrated tools. The platform handles account management, billing, and service connections; the bot "just works" with no workflow configuration needed.

## Core Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target customer | All segments (tiered) | Solo operators, teams, and community operators — pricing tiers differentiate |
| Deployment model | Multi-tenant shared infrastructure | Single application, logically isolated by tenant ID. Cheapest, simplest ops |
| Discord connection | Paste bot token + guild ID | User creates their own bot in Discord Developer Portal. No OAuth complexity |
| Tool exposure | Everything available (open buffet) | All tools available to all tiers. Users connect their own service API keys |
| Billing model | BYOK (Bring Your Own Keys) | Customer provides their own Anthropic API key. Small platform fee for infrastructure |
| Bot behavior | Just works, no configuration | No workflow management. Claude picks the right tools based on context |
| Service connections | Hybrid OAuth + API key paste | OAuth for services that support it well (GitHub, Google, Linear). API key paste for simpler services (Toggl, etc.) |
| Tech stack | Next.js + Supabase (shared DB with bot) | React frontend, Supabase Auth, shared Postgres with existing bot tables |
| Architecture | Supabase-centric (website writes, bot reads) | Database is the only integration point. No direct API between website and bot |
| Brand | PyMC brand guidelines | Sharp corners (0px radius), Archivo/Inter/Lora, Navy/Aqua/Periwinkle palette |

## Brand Guidelines Reference

The frontend must follow the PyMC brand deck at https://pymc-brand-deck.netlify.app/. Key rules:

### Colors
| Color | Hex | Role | Usage |
|-------|-----|------|-------|
| Navy | #0C1F40 | Dominant (60-70%) | Primary text, backgrounds, main UI |
| White | #FFFFFF | Dominant | Primary background |
| White Soft | #F7F7F7 | Dominant | Secondary backgrounds |
| Aqua | #B4E7DD | Supporting (20-30%) | CTAs, accent stripes, active states |
| Periwinkle | #9FAAE2 | Supporting (20-30%) | Gradients, decorative elements |
| Peach Orange | #F6AE72 | Accent (5-10%) | Data visualization ONLY — never buttons, backgrounds, or tags |

### Typography
| Level | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Display | Archivo | 56-72px | 700 | Main headlines |
| H1 | Archivo | 40-48px | 700 | Section titles |
| H2 | Archivo | 28-36px | 500 | Secondary headings |
| Body | Inter | 18px | 400 | Standard body copy |
| UI/Tag | Inter | 13-15px | 500-600 | Labels, buttons |
| Quotes | Lora | — | — | Testimonials only |

### Components
- **Border radius:** 0px everywhere (sharp corners)
- **Cards:** White background, no shadow, CI accent stripe (6px left edge with layered Aqua/Periwinkle opacity bands)
- **Buttons:** 44px height, 0px radius, 1.5px border, Inter 15px weight 600
- **Primary button:** Aqua background, Navy text
- **Secondary button:** Transparent, Navy border
- **Navigation:** 64px height, sticky, frosted glass (rgba(255,255,255,0.92) + blur(12px))
- **Footer:** Navy background, 5-column grid, white text
- **Gradients:** Tier 1 (hero, animated blobs + dots overlay), Tier 2 (section backgrounds, static), Tier 3 (card fills)

## Data Model

All tables use Row Level Security scoped to `tenant_id`. Bot accesses via service role key.

### tenants
```
id: uuid (PK)
name: text — display name
owner_id: uuid → auth.users (Supabase Auth)
plan: enum('free', 'starter', 'pro')
status: enum('pending', 'configured', 'active', 'suspended')
created_at: timestamptz
updated_at: timestamptz
```

### tenant_members (future: team access)
```
tenant_id: uuid → tenants
user_id: uuid → auth.users
role: enum('owner', 'admin', 'member')
```

### discord_connections
```
id: uuid (PK)
tenant_id: uuid → tenants
bot_token_encrypted: text — encrypted at rest
guild_id: text — Discord server ID (user pastes this)
bot_user_id: text — resolved after first connection
bot_username: text — resolved after first connection
status: enum('disconnected', 'connecting', 'connected', 'error')
last_heartbeat: timestamptz — bot writes periodically
error_message: text — nullable
created_at: timestamptz
```

### tenant_api_keys
```
id: uuid (PK)
tenant_id: uuid → tenants
provider: text — 'anthropic', 'openai'
api_key_encrypted: text
is_valid: boolean — last validation result
last_validated_at: timestamptz
```

### tenant_service_connections
```
id: uuid (PK)
tenant_id: uuid → tenants
service: text — 'github', 'toggl', 'linear', etc.
auth_type: enum('oauth', 'api_key')
access_token_encrypted: text
refresh_token_encrypted: text — nullable (OAuth only)
token_expires_at: timestamptz — nullable
status: enum('connected', 'expired', 'revoked')
connected_at: timestamptz
```

### tenant_subscriptions
```
id: uuid (PK)
tenant_id: uuid → tenants
stripe_customer_id: text
stripe_subscription_id: text
plan: enum('free', 'starter', 'pro')
status: enum('active', 'past_due', 'canceled')
current_period_end: timestamptz
```

## User Flows

### Flow 1: Sign Up → Bot Live
1. **Sign Up** — Email/password via Supabase Auth. Creates user + tenant (status: `pending`).
2. **Paste Bot Token + Guild ID** — User creates a bot in Discord Developer Portal, copies token and guild ID, pastes into Daimon. Website validates token format, stores encrypted. Tenant status → `configured`.
3. **Add Anthropic API Key** — Paste API key. Website validates with a test API call. Stored encrypted.
4. **Bot Goes Live** — Bot picks up new tenant via Supabase Realtime subscription on `discord_connections`. Connects with token to specified guild. Writes heartbeat. Dashboard shows "Connected."

### Flow 2: Connect a Third-Party Service
- **OAuth services** (GitHub, Google, Linear): Click "Connect" → OAuth redirect → callback stores tokens → service shows as connected. Automatic token refresh on expiry.
- **API key services** (Toggl, smaller APIs): Click "Connect" → modal with key input → paste API key → validation call → stored encrypted.

### Flow 3: Billing / Subscription
- **Free tier:** No payment needed. Sign up + connect Discord + Anthropic key. Rate-limited or limited tool set.
- **Paid tiers:** Upgrade via Stripe Checkout. Stripe webhook updates `tenant_subscriptions` in Supabase. Stripe Customer Portal for invoices/cancellation/payment method changes.

### Flow 4: Dashboard (Day-to-Day)
- **Bot status:** Connected/Disconnected/Error — from `discord_connections.status` + `last_heartbeat`
- **Server:** Guild name and ID the bot is connected to
- **Integrations:** Which services connected/expired — from `tenant_service_connections`
- **API key health:** Anthropic key valid/invalid — from `tenant_api_keys.is_valid`
- **Onboarding checklist:** If setup incomplete, shows remaining steps (connect Discord, add API key, connect first service)

## Page Architecture

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero with Tier 1 animated gradient blobs. Value prop, feature grid, pricing (Free/Starter/Pro), testimonials, CTA |
| `/docs` | Docs / Getting Started | Step-by-step setup guide, tool reference, FAQ. Sidebar navigation |
| `/login` | Login | Supabase Auth form on Tier 2 gradient background |
| `/signup` | Sign Up | Supabase Auth form, redirects to dashboard |
| `/reset-password` | Password Reset | Supabase Auth password reset flow |

### Authenticated Pages (Dashboard)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard Home | At-a-glance status: bot connection, guild info, quick stats, onboarding checklist |
| `/dashboard/integrations` | Integrations | Grid of all available services with connect/disconnect. Cards with CI accent stripe. OAuth redirect or API key modal |
| `/dashboard/billing` | Billing & Keys | Current plan, upgrade via Stripe Checkout, Stripe Customer Portal link. Anthropic/OpenAI key management with validation |
| `/dashboard/settings` | Settings | Tenant name, Discord connection management (token + guild ID), danger zone (disconnect/delete) |

### Admin Pages (Internal)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Panel | Tenant list with status/plan/heartbeat. Drill into tenant details. Suspend/unsuspend. Impersonation. System health |

## Bot Integration Contract

The website and bot communicate exclusively through Supabase. No direct API.

### Website writes → Bot reads (via Supabase Realtime)
- `discord_connections` — new/updated bot token + guild ID → bot connects/reconnects
- `tenant_api_keys` — Anthropic key → bot uses for Claude calls
- `tenant_service_connections` — service credentials → bot makes tools available
- `tenants.status` → if `suspended`, bot disconnects

### Bot writes → Website reads
- `discord_connections.status` — connected/disconnected/error
- `discord_connections.last_heartbeat` — periodic timestamp
- `discord_connections.error_message` — if connection fails
- `discord_connections.bot_user_id`, `bot_username` — resolved on first connection
- Execution/usage data to existing bot tables, scoped by `tenant_id`

## Tenant Lifecycle

```
pending → configured → active → suspended
   ↑                      ↓         ↓
   └──────────────────────┘    (unsuspend)
```

1. **Pending** — User signed up. No token or API key yet.
2. **Configured** — Token + guild ID + Anthropic key saved. Waiting for bot pickup.
3. **Active** — Bot connected, heartbeat flowing. Fully operational.
4. **Suspended / Error** — Bad token, expired key, payment failed. Bot disconnected. Dashboard shows reason.

## Security

- **Encryption:** All tokens and API keys encrypted at rest using Supabase Vault or application-level AES-256-GCM. Never exposed in API responses — only masked previews (e.g., `sk-ant-...7x2Q`).
- **RLS:** All tenant tables use Row Level Security. Users can only access rows where they are a member of the tenant via `tenant_members`.
- **Bot access:** Service role key, reads all tenants. Runs in trusted environment (Fly.io).
- **Stripe webhooks:** Signature verification on all incoming webhooks.
- **Token validation:** Discord bot tokens validated on paste (format check). Anthropic keys validated with test API call.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS (configured to PyMC brand tokens) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL 17, shared with bot) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Deployment | Vercel (website) or Fly.io (to colocate with bot) |
| Bot runtime | Existing Decision Orchestrator on Fly.io |

## Deprecated Systems (Not In Scope)

- **Workflows** — Deprecated. Bot uses Claude to pick tools based on context. No workflow configuration in the SaaS.
- **Composio** — Deprecated. Service connections handled directly via OAuth flows and API key storage.

## Reverse Loop Scope

The reverse loop for this spec should refine:
- All pages, components, and user flows
- Data models and RLS policies
- API contracts between website and bot (through Supabase)
- Auth flows and security model
- Billing integration (Stripe)
- Brand compliance (PyMC guidelines)
- Docs content structure
- Admin panel capabilities

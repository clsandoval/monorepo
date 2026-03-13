# Daimon SaaS — Design Specification Seed

> Source: `docs/superpowers/specs/2026-03-12-daimon-saas-design.md`
> Seeded: 2026-03-13
> Status: Core product decisions documented. Expanded by subsequent loop aspects.

---

## 1. Product Overview

Daimon is a self-serve SaaS website where anyone can bring their own Discord bot token and Anthropic API key to get their own instance of Decision Orchestrator — a Discord-native AI operating system with 50+ integrated tools.

**Key proposition**: The platform handles account management, billing, and service connections. The bot "just works" — no workflow configuration needed. Claude picks the right tools based on context.

---

## 2. Core Product Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target customer | All segments (tiered) | Solo operators, teams, community operators — pricing tiers differentiate |
| Deployment model | Multi-tenant shared infrastructure | Single application, logically isolated by tenant ID. Cheapest, simplest ops |
| Discord connection | Paste bot token + guild ID | User creates their own bot in Discord Developer Portal. No OAuth complexity |
| Tool exposure | Everything available (open buffet) | All tools available to all tiers. Users connect their own service API keys |
| Billing model | BYOK (Bring Your Own Keys) | Customer provides their own Anthropic API key. Small platform fee for infrastructure |
| Bot behavior | Just works, no configuration | No workflow management. Claude picks the right tools based on context |
| Service connections | Hybrid OAuth + API key paste | OAuth for services that support it well (GitHub, Google, Linear). API key paste for simpler services (Toggl, etc.) |
| Tech stack | Next.js + Supabase (shared DB with bot) | React frontend, Supabase Auth, shared Postgres with existing bot tables |
| Architecture | Supabase-centric (website writes, bot reads) | Database is the only integration point. No direct API between website and bot |
| Brand | PyMC brand guidelines | Sharp corners (0px radius), Archivo/Inter/Lora, Navy/Aqua/Periwinkle palette |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js (App Router) | React server/client components |
| Styling | Tailwind CSS | Configured to PyMC brand tokens |
| Auth | Supabase Auth | Email/password only at launch |
| Database | Supabase (PostgreSQL 17) | Shared with bot via service role |
| Payments | Stripe | Checkout + Customer Portal + Webhooks |
| Deployment | Vercel | Website frontend/API routes |
| Bot runtime | Existing Decision Orchestrator on Fly.io | Multi-tenant adaptation required |

---

## 4. Data Model (Initial Design)

> Fully expanded with exact SQL in [../database/schema.md](../database/schema.md)
> All tables use Row Level Security scoped to `tenant_id`. Bot accesses via service role key.

### tenants

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Display name |
| owner_id | uuid | → auth.users (Supabase Auth) |
| plan | enum | 'free', 'starter', 'pro' — denormalized cache |
| status | enum | 'pending', 'configured', 'active', 'suspended' |
| created_at | timestamptz | — |
| updated_at | timestamptz | — |

### tenant_members

| Column | Type | Notes |
|--------|------|-------|
| tenant_id | uuid | → tenants |
| user_id | uuid | → auth.users |
| role | enum | 'owner', 'admin', 'member' |

**Note**: Single `owner` row created on signup. Team invite deferred but table exists for RLS correctness.

### discord_connections

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | → tenants |
| bot_token_encrypted | text | Encrypted at rest via Supabase Vault |
| guild_id | text | Discord server ID (user pastes) |
| bot_user_id | text | Resolved after first connection |
| bot_username | text | Resolved after first connection |
| status | enum | 'disconnected', 'connecting', 'connected', 'error' |
| last_heartbeat | timestamptz | Bot writes periodically |
| error_message | text | Nullable |
| created_at | timestamptz | — |

### tenant_api_keys

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | → tenants |
| provider | text | 'anthropic', 'openai' |
| api_key_encrypted | text | Encrypted via Vault |
| is_valid | boolean | Last validation result |
| last_validated_at | timestamptz | — |

### tenant_service_connections

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | → tenants |
| service | text | 'github', 'toggl', 'linear', etc. |
| auth_type | enum | 'oauth', 'api_key' |
| access_token_encrypted | text | Encrypted via Vault |
| refresh_token_encrypted | text | Nullable (OAuth only) |
| token_expires_at | timestamptz | Nullable |
| status | enum | 'connected', 'expired', 'revoked' |
| connected_at | timestamptz | — |

### tenant_subscriptions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | → tenants |
| stripe_customer_id | text | — |
| stripe_subscription_id | text | — |
| plan | enum | 'free', 'starter', 'pro' |
| status | enum | 'active', 'past_due', 'canceled' |
| current_period_end | timestamptz | — |

**Plan source of truth**: `tenant_subscriptions.plan` is authoritative, updated by Stripe webhooks. `tenants.plan` is a denormalized cache updated by a Postgres trigger. The website reads `tenants.plan` for display; the bot reads `tenants.plan` for access decisions.

---

## 5. User Flows

### Flow 1: Sign Up → Bot Live

1. **Sign Up** — Email/password via Supabase Auth. Creates user + tenant (status: `pending`).
2. **Paste Bot Token + Guild ID** — User creates bot in Discord Developer Portal, copies token and guild ID, pastes into Daimon. Website validates token format, stores encrypted. Tenant status → `configured`.
3. **Add Anthropic API Key** — Paste API key. Website validates with a test API call. Stored encrypted.
4. **Bot Goes Live** — Bot picks up new tenant via Supabase Realtime subscription on `discord_connections`. Connects with token to guild. Writes heartbeat. Dashboard shows "Connected."
5. **Fallback**: Bot scans all `discord_connections` with status `disconnected` or `connecting` on startup and every 60 seconds, ensuring no tenant is missed if a Realtime event is dropped.

### Flow 2: Connect a Third-Party Service

**OAuth services** (GitHub, Google, Linear):
1. Click "Connect"
2. OAuth redirect to provider
3. Provider redirects to `/api/integrations/[service]/callback` with auth code
4. Next.js API route exchanges code for tokens
5. Stores encrypted in `tenant_service_connections`
6. Redirects to `/dashboard/integrations` with success state

**CSRF protection**: OAuth `state` parameter stored in a short-lived Supabase row or encrypted cookie.

**Token refresh**: Automatic refresh on expiry via bot-side refresh logic.

**API key services** (Toggl, smaller APIs):
1. Click "Connect"
2. Modal with key input
3. Paste API key
4. Validation call
5. Stored encrypted

### Flow 3: Billing / Subscription

- **Free tier**: No payment needed. Sign up + connect Discord + Anthropic key. All tools available (user pays Anthropic directly). No rate limiting from Daimon — Anthropic's own limits apply.
- **Paid tiers**: Upgrade via Stripe Checkout. Stripe webhook updates `tenant_subscriptions`. Stripe Customer Portal for invoices/cancellation/payment method changes.

### Flow 4: Dashboard (Day-to-Day)

Dashboard shows real-time status from Supabase:
- **Bot status**: Connected/Disconnected/Error — from `discord_connections.status` + `last_heartbeat`
- **Server**: Guild name and ID — from `discord_connections.guild_id` + `bot_username`
- **Integrations**: Which services connected/expired — from `tenant_service_connections`
- **API key health**: Anthropic key valid/invalid — from `tenant_api_keys.is_valid`
- **Onboarding checklist**: If setup incomplete, shows remaining steps

---

## 6. Page Architecture

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero with Tier 1 animated gradient blobs. Value prop, feature grid, pricing (Free/Starter/Pro), testimonials, CTA |
| `/docs` | Docs / Getting Started | Sidebar navigation. Quick Start, Tool Reference, FAQ, Billing sections |
| `/login` | Login | Supabase Auth form on Tier 2 gradient background |
| `/signup` | Sign Up | Supabase Auth form, redirects to dashboard |
| `/reset-password` | Password Reset | Supabase Auth password reset flow |

### Authenticated Pages

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard Home | Bot connection, guild info, quick stats, onboarding checklist |
| `/dashboard/integrations` | Integrations | Grid of all available services with connect/disconnect |
| `/dashboard/billing` | Billing & Keys | Current plan, Stripe Checkout, Customer Portal, API key management |
| `/dashboard/settings` | Settings | Tenant name, Discord connection management, danger zone |

### Admin Pages (Internal)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Panel | Tenant list with status/plan/heartbeat. System health |
| `/admin/tenant/[id]` | Tenant Detail | Tenant connections (masked), subscription, suspend/unsuspend, impersonation |

**Admin impersonation**: Admin can view tenant's dashboard as-if that user (read-only). Supabase Auth admin API generates scoped session. All impersonation sessions logged to `admin_audit_log` with: admin user ID, tenant ID, timestamp, action taken.

---

## 7. Bot Integration Contract

Website and bot communicate **exclusively through Supabase**. No direct API.

### Website writes → Bot reads (via Supabase Realtime)

| Table | Trigger | Bot Action |
|-------|---------|-----------|
| `discord_connections` | New/updated bot token + guild ID | Bot connects/reconnects |
| `tenant_api_keys` | Anthropic key stored | Bot uses for Claude calls |
| `tenant_service_connections` | Service credential stored | Bot makes tool available |
| `tenants.status` | Set to `suspended` | Bot disconnects |

### Bot writes → Website reads

| Column | When | Website display |
|--------|------|----------------|
| `discord_connections.status` | On connection change | Status indicator in dashboard |
| `discord_connections.last_heartbeat` | Every 60s | "Last seen" / staleness detection |
| `discord_connections.error_message` | On connection error | Error message in dashboard |
| `discord_connections.bot_user_id` | First connection | Bot identity display |
| `discord_connections.bot_username` | First connection | Bot name display |

---

## 8. Tenant Lifecycle

```
pending → configured → active ⇄ suspended
                         ↑          ↓
                         └──────────┘ (unsuspend)
```

| Status | Meaning |
|--------|---------|
| `pending` | User signed up. No token or API key yet. |
| `configured` | Token + guild ID + Anthropic key saved. Waiting for bot pickup. |
| `active` | Bot connected, heartbeat flowing. Fully operational. |
| `suspended` | Bad token, expired key, payment failed, or manual admin action. Bot disconnected. |

---

## 9. Security Model

| Concern | Implementation |
|---------|---------------|
| Tokens/keys at rest | Supabase Vault (pgcrypto + `vault.secrets`). Never exposed in API responses — masked preview only (e.g., `sk-ant-...7x2Q`) |
| RLS | All tenant tables use RLS. Users access only rows where they are a tenant member |
| Bot access | Service role key. Reads all tenants. Runs in trusted Fly.io environment |
| Stripe webhooks | Signature verification on all incoming webhooks |
| Token validation | Discord tokens: format check on paste. Anthropic keys: test API call on save |
| Rate limiting | Signup: 5 per IP per hour. API key validation: 10 per tenant per minute. Via Next.js middleware or Vercel Edge Config |

---

## 10. Deprecated Systems (Out of Scope)

| System | Status | Why |
|--------|--------|-----|
| Workflows | Deprecated | Bot uses Claude to pick tools based on context. No workflow configuration in SaaS |
| Composio | Deprecated | Service connections handled directly via OAuth flows and API key storage in `tenant_service_connections` |

---

## 11. Docs Structure (Initial Outline)

Full docs content in [../frontend/docs-pages.md](../frontend/docs-pages.md).

| Section | Content |
|---------|---------|
| Quick Start | Create Discord bot, get token, sign up, paste token + guild ID, add Anthropic key |
| Tool Reference | What each integration does, how to connect it |
| FAQ | Bot not connecting, invalid token, key errors, billing questions |
| Billing | How plans work, BYOK model explained, Stripe portal |

# Daimon SaaS — Final Mega-Spec

Complete, exhaustive product specification for building the Daimon self-serve SaaS platform.

## Index

### source/ — What Exists Today

| File | Description | Status |
|------|-------------|--------|
| [source/existing-schema.md](source/existing-schema.md) | Complete current Supabase schema: 10 tables, 1 view, 1 storage bucket, 2 roles, all column types and constraints | ✅ Done |
| source/existing-auth.md | Current auth model, token handling, session management | Pending |
| source/existing-tools.md | Full MCP tool catalog with function signatures and input models | Pending |
| source/existing-bot-architecture.md | Bot startup, connection flow, message handling pipeline | Pending |
| source/existing-orm-models.md | SQLAlchemy models, repository patterns | Pending |
| source/brand-guidelines.md | Complete PyMC design system | Pending |
| source/design-spec.md | Seeded from existing design doc | Pending |

### multi-tenant/ — How The Bot Becomes Multi-Tenant

| File | Description | Status |
|------|-------------|--------|
| multi-tenant/adaptation-plan.md | What changes, what stays the same | Pending |
| multi-tenant/connection-manager.md | Multi-token connection lifecycle | Pending |
| multi-tenant/tenant-scoping.md | Per-tenant tool access, data isolation | Pending |
| multi-tenant/byok-key-routing.md | Per-tenant Anthropic/OpenAI key routing | Pending |
| multi-tenant/realtime-contract.md | Supabase Realtime channels, payloads | Pending |
| multi-tenant/health-monitoring.md | Heartbeat, stale detection, reconnection | Pending |

### database/ — How Data Is Stored

| File | Description | Status |
|------|-------------|--------|
| database/schema.md | Every new table, column, type, constraint, default | Pending |
| database/rls-policies.md | Exact SQL for every RLS policy | Pending |
| database/triggers.md | Plan sync, status cascades | Pending |
| database/migrations.md | Ordered migrations from single to multi-tenant | Pending |
| database/indexes.md | Query patterns and required indexes | Pending |
| database/vault-encryption.md | Supabase Vault setup, encrypt/decrypt patterns | Pending |
| database/retention.md | Data retention, cleanup jobs | Pending |

### frontend/ — What The User Sees

| File | Description | Status |
|------|-------------|--------|
| frontend/landing-page.md | Complete copy, sections, layout, gradient specs | Pending |
| frontend/auth-pages.md | Login, signup, reset — every field, validation, error | Pending |
| frontend/dashboard.md | Cards, metrics, status indicators, onboarding checklist | Pending |
| frontend/integrations-page.md | Service grid, OAuth flow, API key modal | Pending |
| frontend/billing-page.md | Plan display, Stripe Checkout, key management | Pending |
| frontend/settings-page.md | Controls, danger zone, Discord connection mgmt | Pending |
| frontend/admin-panel.md | Tenant list, detail, impersonation, audit | Pending |
| frontend/docs-pages.md | Every doc section, complete content | Pending |
| frontend/component-library.md | Every reusable component, props, variants, states | Pending |
| frontend/copy.md | ALL user-facing text: labels, tooltips, errors, empty states | Pending |
| frontend/validation-rules.md | Client-side validation, error messages | Pending |
| frontend/responsive-behavior.md | How each page adapts to mobile/tablet/desktop | Pending |

### api/ — How The Website Is Accessed

| File | Description | Status |
|------|-------------|--------|
| api/routes.md | Every Next.js API route, method, request/response shape | Pending |
| api/auth.md | Supabase Auth integration, session management | Pending |
| api/webhooks.md | Stripe webhook handler, signature verification | Pending |
| api/rate-limiting.md | Rate limits per endpoint, error responses | Pending |

### integrations/ — How External Services Connect

| File | Description | Status |
|------|-------------|--------|
| integrations/stripe.md | Products, prices, checkout, webhooks, portal | Pending |
| integrations/discord.md | Token validation, storage, error handling | Pending |
| integrations/oauth-services.md | GitHub, Google, Linear — scopes, callbacks, refresh | Pending |
| integrations/api-key-services.md | Toggl, etc. — validation, format, storage | Pending |
| integrations/supabase-realtime.md | Channel names, filters, payload shapes | Pending |

### deployment/ — How The Tool Runs

| File | Description | Status |
|------|-------------|--------|
| deployment/infrastructure.md | Vercel config, Fly.io bot, Supabase | Pending |
| deployment/ci-cd.md | Build, test, deploy pipeline | Pending |
| deployment/monitoring.md | Alerts, health checks, error tracking | Pending |
| deployment/environment.md | Every env var: name, description, example | Pending |
| deployment/domains.md | DNS, SSL, routing | Pending |

### ui/ — How It Looks

| File | Description | Status |
|------|-------------|--------|
| ui/design-system.md | Colors, typography, spacing — exact values from brand | Pending |
| ui/component-specs.md | Every component: dimensions, colors, states, hover/focus | Pending |
| ui/responsive.md | Breakpoints, mobile-first, touch targets | Pending |
| ui/accessibility.md | WCAG, ARIA, keyboard nav, screen reader | Pending |

### legal/ — What Protects The Business

| File | Description | Status |
|------|-------------|--------|
| legal/terms-of-service.md | Actual ToS text | Pending |
| legal/privacy-policy.md | Actual privacy policy text | Pending |
| legal/disclaimers.md | Platform disclaimers, liability limits | Pending |

### premium/ — How It Makes Money

| File | Description | Status |
|------|-------------|--------|
| premium/tiers.md | Free vs Starter vs Pro — exact feature gating | Pending |
| premium/pricing.md | Price points, billing cycles, trial logic | Pending |
| premium/features-by-tier.md | Feature matrix with exact gating rules | Pending |

### seo-and-growth/ — How Users Find It

| File | Description | Status |
|------|-------------|--------|
| seo-and-growth/landing-page.md | Hero copy, value prop, social proof, CTAs | Pending |
| seo-and-growth/seo-strategy.md | Keywords, meta descriptions, schema markup | Pending |
| seo-and-growth/content-strategy.md | Blog topics, comparison pages | Pending |

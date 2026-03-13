# Daimon SaaS — Final Mega-Spec

Complete, exhaustive product specification for building the Daimon self-serve SaaS platform.

## Index

### source/ — What Exists Today

| File | Description | Status |
|------|-------------|--------|
| [source/existing-schema.md](source/existing-schema.md) | Complete current Supabase schema: 10 tables, 1 view, 1 storage bucket, 2 roles, all column types and constraints | ✅ Done |
| [source/existing-auth.md](source/existing-auth.md) | Complete auth model: Supabase Auth email/password, UserContext construction, CredentialPlatform enum, Vault decrypt pattern, admin impersonation, website middleware, tenant resolution, all auth error scenarios | ✅ Done |
| [source/existing-tools.md](source/existing-tools.md) | Full MCP tool catalog: 89 direct tools + 6 remote Linear tools = 95 total. Every tool, input model, field type, description, tag, credential requirement, and multi-tenant implication | ✅ Done |
| [source/existing-bot-architecture.md](source/existing-bot-architecture.md) | Bootstrap config: all 19 env vars, ToolContext/UserContext/DatabaseContext dataclasses, 4 client factories (Supabase/Discord/Anthropic/SQLAlchemy), 10-step startup sequence, 11-step message handler pipeline, per-tenant vs system-level field classification, Langfuse observability | ✅ Done |
| [source/existing-orm-models.md](source/existing-orm-models.md) | SQLAlchemy 2.0 ORM models (9 tables/views), Pydantic boundary schemas, 9 repository modules with full function signatures, Vault raw-SQL pattern, multi-tenant migration implications per table | ✅ Done |
| [source/brand-guidelines.md](source/brand-guidelines.md) | Complete PyMC design system: 6 colors with hex, type scale with clamp(), spacing system, button specs, card CI stripe, nav, footer, blob animations, Tailwind config mapping | ✅ Done |
| [source/design-spec.md](source/design-spec.md) | Product decisions, tech stack, data model, user flows, page architecture, bot integration contract, tenant lifecycle, security model | ✅ Done |

### multi-tenant/ — How The Bot Becomes Multi-Tenant

| File | Description | Status |
|------|-------------|--------|
| multi-tenant/adaptation-plan.md | What changes, what stays the same | Pending |
| [multi-tenant/connection-manager.md](multi-tenant/connection-manager.md) | Multi-token connection lifecycle: TenantConnectionManager, supervisor task, reconnect backoff, heartbeat loop, Realtime event handlers, TenantToolContext + SystemEnv dataclasses, startup query, stale detection, error scenarios | ✅ Done |
| [multi-tenant/tenant-scoping.md](multi-tenant/tenant-scoping.md) | Per-tenant tool scoping: ToolContext 4-category partition (per-tenant/optional/platform/admin-only), TenantConfig+SystemConfig namedtuples, build_tenant_tool_context(), per-tenant ToolRegistry, 3 new Scope tags (PLATFORM_ADMIN/PLAN_STARTER/PLAN_PRO), plan gating logic, UserContext tenant_id field, credential update propagation, isolation guarantees, end-to-end execution flow | ✅ Done |
| [multi-tenant/byok-key-routing.md](multi-tenant/byok-key-routing.md) | BYOK key routing: current single-tenant behavior, storage in tenant_api_keys+Vault, TenantConfig expansion, _load_tenant_config(), _build_tool_context() with BYOK injection, Fly Machine env injection, hot-reload via Realtime, key lifecycle state machine, validation endpoints, Edge Function store-tenant-api-key, all error messages, OpenAI optional BYOK, security properties | ✅ Done |
| [multi-tenant/realtime-contract.md](multi-tenant/realtime-contract.md) | 4 channels (tenant-lifecycle, tenant-api-keys, tenant-status, tenant-service-connections): exact JSON payload shapes for all 8 event types, REPLICA IDENTITY FULL requirements, 16-row complete event table, handler logic for all change cases, idempotency rules, reconciliation pass on reconnect, channel health monitoring | ✅ Done |
| [multi-tenant/health-monitoring.md](multi-tenant/health-monitoring.md) | Per-tenant status state machine (4 values + computed stale/stale_critical), heartbeat_writer() coroutine (30s interval), real-time dashboard subscription, stale detection algorithm (computed at query time, 120s/600s thresholds), reconnection backoff schedule (10 attempts, ~25 min total), 3 non-retriable exceptions, Force Reconnect API, health_server.py FastAPI spec (3 endpoints), fly.toml health check config, Langfuse per-tenant traces, admin panel health query SQL, admin alert thresholds, Realtime subscription health flag, all constants | ✅ Done |
| [multi-tenant/tenant-isolation.md](multi-tenant/tenant-isolation.md) | Logical multi-tenancy model; isolation dimension table (11 rows); shared inventory (code/infra/platform creds); defense-in-depth build_tenant_tool_context() (empty strings for non-admin creds); per-tenant isolated items (Discord client/BYOK key/DB rows/conversation/ToolRegistry/Langfuse traces); failure isolation (_safe_supervisor() exception boundary, Fly Machine isolation, rate limit isolation); service role trust model + DB audit (12 operations); website anon key + RLS; platform-admin tenant identity (env vars); known limitations (6 rows); isolation boundary checklist (12 rows) | ✅ Done |

### database/ — How Data Is Stored

| File | Description | Status |
|------|-------------|--------|
| [database/schema.md](database/schema.md) | 7 PostgreSQL enum types + 2 new (service_auth_type, service_connection_status); `tenants` table (8 cols, 4 indexes, RLS); `tenant_members` table (5 cols, composite PK, 3 FKs, 4 RLS policies); `discord_connections` table (10 cols, lifecycle state machine, RLS); `tenant_api_keys` table (9 cols, UNIQUE per provider, Vault, RLS, bot startup JOIN); `tenant_service_connections` table (14 cols, UNIQUE(tenant_id,service), CHECK service↔auth_type, 4 services with per-service metadata schemas, Google token refresh logic, Realtime events, bot startup LEFT JOINs, 3 indexes, 4 RLS policies, Vault patterns for access/refresh/key secrets) | Partial (3.1–3.4 done; 3.5 pending) |
| [database/rls-policies.md](database/rls-policies.md) | Exact SQL for all RLS policies on 7 tables: tenants (4), tenant_members (4), discord_connections (4), tenant_api_keys (1 SELECT-only, writes blocked), tenant_service_connections (4), tenant_subscriptions (1 SELECT-only, writes blocked), admin_audit_log (no policies — default deny). RLS architecture, membership subquery pattern, service role bypass inventory, complete `ENABLE ROW LEVEL SECURITY` + `CREATE POLICY` SQL blocks. | ✅ Done |
| database/triggers.md | Plan sync, status cascades | Pending |
| [database/migrations.md](database/migrations.md) | 7 ordered SQL migrations (20260400000000–006): enum types, tenants, tenant_members, discord_connections (+ get_decrypted_secret SECURITY DEFINER), tenant_api_keys, tenant_service_connections (+ pg_cron refresh job), tenant_subscriptions (+ sync_tenant_plan trigger); complete DDL + indexes + triggers + RLS + Realtime publications; verification queries; full rollback procedure; additive-only safety analysis | ✅ Done |
| database/indexes.md | Query patterns and required indexes | Pending |
| [database/vault-encryption.md](database/vault-encryption.md) | Supabase Vault schema (vault.secrets + vault.decrypted_secrets), 3 Vault functions (create/update/delete_secret), 3 SECURITY DEFINER wrappers (get_decrypted_secret/create_tenant_secret/delete_tenant_secret), 3 tables using Vault (discord_connections/tenant_api_keys/tenant_service_connections), 3 Edge Functions, naming conventions (access/refresh/key suffixes for service connections), orphan cleanup (updated to include service_connection secrets), what NOT in Vault, security properties | ✅ Updated (3.4) |
| database/retention.md | Data retention, cleanup jobs | Pending |

### frontend/ — What The User Sees

| File | Description | Status |
|------|-------------|--------|
| [frontend/landing-page.md](frontend/landing-page.md) | 9 sections (nav, hero with animated blobs, how-it-works, features grid, integrations strip, pricing, FAQ, CTA banner, footer); complete copy for all sections; blob CSS keyframes; pricing cards (Free/Starter $12/Pro $39); 12 FAQ answers; OG image spec; responsive behavior at ≤900px; performance requirements | ✅ Done |
| [frontend/auth-pages.md](frontend/auth-pages.md) | Auth layout + AuthCard component + FormInput/PasswordInput/AlertBanner/PasswordStrengthBar components; /login (email+password, mapAuthError, ?next= handling, ?passwordUpdated=true banner); /signup (4 fields + terms checkbox, password strength bar, createTenantForUser server action, mapSignupError); /reset-password (request form + success state with 60s resend cooldown); /reset-password/confirm (3 states: valid/expired/loading, PASSWORD_RECOVERY auth event handler); /api/auth/callback PKCE route; responsive at ≤900px; full accessibility (ARIA labels, focus management, contrast ratios); toast spec; 18 edge cases | ✅ Done |
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

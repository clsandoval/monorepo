# Frontier — Daimon SaaS Reverse Loop

## Statistics

- **Total aspects**: 93
- **Analyzed**: 88
- **Pending**: 5
- **Convergence**: 95%

## Wave 1: Deep Codebase Mining (8 aspects)

- [x] 1.1 — Extract complete Supabase schema from all migrations in `supabase/migrations/`
- [x] 1.2 — Extract full MCP tool catalog from `src_v2/mcp/catalog.py` + `src_v2/mcp/tools/` (every tool, input model, output type)
- [x] 1.3 — Extract current auth model from `src_v2/core/auth/` + `src_v2/mcp/auth.py`
- [x] 1.4 — Extract bootstrap config and client factories from `src_v2/bootstrap/`
- [x] 1.5 — Extract bot startup, Discord connection flow, and message handler pipeline from `src_v2/entrypoints/discord/`
- [x] 1.6 — Extract ORM models and repository patterns from `src_v2/db/models/` + `src_v2/db/repositories/`
- [x] 1.7 — Fetch and extract complete PyMC brand guidelines from https://pymc-brand-deck.netlify.app/
- [x] 1.8 — Read and seed from existing design spec `docs/superpowers/specs/2026-03-12-daimon-saas-design.md`

## Wave 2: Multi-Tenant Adaptation (6 aspects)

- [x] 2.1 — Analyze single-token bot connection → spec multi-token connection manager (current: `entrypoints/discord/main.py`, `bot.py`)
- [x] 2.2 — Analyze tool execution scoping → spec per-tenant tool access with tenant API keys (current: `mcp/catalog.py`, `services/execution.py`)
- [x] 2.3 — Analyze Claude API key usage → spec BYOK key routing per tenant (current: `bootstrap/config.py`)
- [x] 2.4 — Design Supabase Realtime subscription — channel names, filters, payload shapes for tenant lifecycle events
- [x] 2.5 — Design heartbeat + health monitoring — per-tenant status, stale detection, reconnection logic
- [x] 2.6 — Design tenant isolation boundaries — what's shared (code, infra) vs isolated (tokens, keys, data)

## Wave 3: Exhaustive Data Model (7 aspects)

- [x] 3.1 — Spec `tenants` + `tenant_members` tables — every column, type, constraint, default, unique constraints
- [x] 3.2 — Spec `discord_connections` table — every column, connection lifecycle states, unique constraints
- [x] 3.3 — Spec `tenant_api_keys` table — encryption via Vault, validation logic, unique constraints
- [x] 3.4 — Spec `tenant_service_connections` table — OAuth vs API key variants, token refresh logic
- [x] 3.5 — Spec `tenant_subscriptions` table — Stripe sync, plan cascade trigger SQL
- [x] 3.6 — Write complete RLS policies — exact SQL for every new table
- [x] 3.7 — Write migration plan — ordered SQL migrations from current schema to multi-tenant

## Wave 4: Website Specification (23 aspects)

- [x] 4.1 — Landing page — complete copy, section-by-section layout, gradient specs, responsive
- [x] 4.2 — Auth pages (login, signup, reset-password) — every field, validation, error message, redirect logic
- [x] 4.3 — Dashboard home — status cards, metrics, onboarding checklist, data queries
- [x] 4.4 — Integrations page — service grid, OAuth flow per service, API key modal, disconnect flow
- [x] 4.5 — Billing page — plan display, Stripe Checkout integration, API key management, validation
- [x] 4.6 — Settings page — tenant config, Discord connection mgmt, danger zone actions
- [x] 4.7 — Admin panel — tenant list, tenant detail, impersonation, audit log
- [x] 4.8a — Docs: Quick Start guide — complete step-by-step walkthrough from signup to live bot, with every screen described
- [x] 4.8b — Docs: Tool Reference — Discord (7) + Dub (2) + Credentials (1) + GitHub (1) tools — name, description, params, example output
- [x] 4.8c — Docs: Tool Reference — Toggl tools (34) — every tool name, description, params, example output
- [x] 4.8d — Docs: Tool Reference — LinkedIn (17) + Google Analytics (4) tools — name, description, params, example output
- [x] 4.8e — Docs: Tool Reference — Fly (9) + ACP (4) + Decision Hub (4) + Onyx (2) + Bluedot (4) tools — name, description, params, example output
- [x] 4.8f — Docs: Tool Reference — Linear (6 remote MCP) tools + tool index/navigation structure
- [x] 4.8g — Docs: FAQ page — complete Q&A (billing, security, bot setup, troubleshooting, limits)
- [x] 4.8h — Docs: Billing & Plans docs page — plan comparison, feature gating rules, upgrade/downgrade flows explained
- [x] 4.9a — Component library: Layout components — Sidebar, TopBar, MobileNav, AuthCard, PageShell, DashboardLayout (props, variants, states)
- [x] 4.9b — Component library: Form components — FormInput, PasswordInput, Select, Toggle, Checkbox, ApiKeyInput, SearchInput (props, variants, states)
- [x] 4.9c — Component library: Feedback components — AlertBanner, Toast, ConfirmDialog, Modal, EmptyState, ErrorState, SkeletonLoader (props, variants, states)
- [x] 4.9d — Component library: Data display components — Badge, StatusIndicator, Table, Pagination, StatCard, ActivityFeed, CopyToClipboard (props, variants, states)
- [x] 4.9e — Component library: Action components — Button, IconButton, Link, DropdownMenu, Tabs + brand compliance matrix for all components
- [x] 4.10 — Complete copy inventory — every user-facing string: labels, tooltips, errors, empty states, CTAs (consolidate from page specs + fill gaps)
- [x] 4.11 — Validation rules — every form field validation with specific error messages (consolidate from page specs + fill gaps)
- [x] 4.12 — Responsive behavior — every page at mobile (375px), tablet (768px), desktop (1280px) (consolidate from page specs + fill gaps)

## Wave 5: Integration Contracts (7 aspects)

- [x] 5.1 — Stripe integration — products, prices, Checkout Sessions, webhooks, Customer Portal, subscription lifecycle
- [x] 5.2 — Discord token handling — format validation, storage, error scenarios, what happens on invalid token
- [x] 5.3 — GitHub OAuth — scopes, redirect URI, token exchange, refresh, revocation
- [x] 5.4 — Google OAuth — scopes, redirect URI, token exchange, refresh, revocation
- [x] 5.5 — Linear OAuth — scopes, redirect URI, token exchange, refresh, revocation
- [x] 5.6 — API key services (Toggl, etc.) — validation endpoints, key format, error handling per service
- [x] 5.7 — Supabase Realtime contract — exact channel config, row filters, payload shapes, reconnection

## Wave 6: Deployment, Legal, SEO (7 aspects)

- [x] 6.1 — Vercel deployment — config, env vars (every single one with description + example), build commands, domains
- [x] 6.2 — CI/CD pipeline — GitHub Actions workflow, test suite, deploy triggers, preview deployments
- [x] 6.3 — Monitoring & alerting — health checks, error tracking, Langfuse integration, alert thresholds
- [x] 6.4a — Legal: Terms of Service — actual complete ToS text ready to publish
- [x] 6.4b — Legal: Privacy Policy — actual complete privacy policy text ready to publish
- [x] 6.5a — SEO — meta tags for every page, OG image specs, schema.org markup per page
- [x] 6.5b — Content strategy — blog topics, comparison pages, landing page keyword targeting

## Wave 7: Polish & Completeness Pass (7 aspects — consolidation pass, page specs already cover most states)

- [x] 7.1a — Loading and empty states — audit every page (landing, auth, dashboard, integrations, billing, settings, admin, docs), fill gaps
- [x] 7.1b — Error states — audit every page, ensure every fetch/mutation has a specific error UI, fill gaps
- [x] 7.2 — Micro-interactions, transitions, toasts, confirmation dialogs — consolidate from page specs, fill gaps
- [x] 7.3a — Edge cases: auth + session — expired sessions, invalid tokens, concurrent logins, password reset mid-session
- [x] 7.3b — Edge cases: integrations + billing — Stripe down, OAuth revoked externally, bot crash mid-operation, slow connections
- [x] 7.4a — Accessibility: ARIA labels and roles — specific labels per component across all pages
- [x] 7.4b — Accessibility: keyboard navigation + focus management — tab order per page, focus traps, screen reader announcements

## Wave 8: Synthesis & Gap Audit (3 aspects)

- [x] 8.1 — Data model reconciliation — verify schema covers all frontend queries, API routes, integration storage, bot reads
- [x] 8.2 — Cross-reference audit — validate all links between spec files, all table references, all route references
- [ ] 8.3 — Final gap analysis — read every file, check for TODOs/TBDs/placeholders/incomplete sections, add new aspects if gaps found

## Wave 8 Cross-Reference Remediation (4 aspects — discovered during 8.2 audit)

- [x] 8.2.1 — Add missing RLS policies for stripe_webhook_events, tenant_messages, tenant_tool_calls to database/rls-policies.md (exact CREATE POLICY SQL)
- [x] 8.2.2 — Add missing migrations 007 (stripe_webhook_events), 008 (tenant_messages), 009 (tenant_tool_calls + cron jobs) to database/migrations.md; resolve migration 006 conflict between schema.md and migrations.md
- [x] 8.2.3 — Update multi-tenant/adaptation-plan.md: add tenant_messages and tenant_tool_calls to new-tables section; add fire-and-forget INSERT notes to modified-files section (services/execution.py + message handler)
- [x] 8.2.4 — Create missing required spec files: legal/disclaimers.md (platform disclaimers + liability limits text), ui/design-system.md (Tailwind config reference + design tokens), seo-and-growth/landing-page.md (hero copy + value prop + social proof + CTAs)

## Wave 8 Gap Remediation (17 aspects — discovered during reconciliation + audit)

- [x] 8.1.1 — Complete `database/schema.md`: add `tenant_subscriptions` table (all columns, indexes, RLS) + `stripe_webhook_events` table (idempotency store for Stripe webhooks)
- [x] 8.1.2 — Add cross-reference notes to `database/schema.md` for existing bot tables (`messages`, `tool_calls`) read by dashboard; specify RLS extensions needed for website user reads
- [x] 8.1.3 — Write `api/routes.md` — consolidate ALL 18+ Next.js API routes (Discord CRUD, Stripe checkout/portal, OAuth start/callback, Toggl validate, admin routes) with full request/response shapes
- [x] 8.1.4 — Write `api/auth.md` — Supabase Auth session management: middleware spec, getUser vs getSession distinction, createClient patterns (browser/server/service-role/admin), JWT claims, session refresh, server action auth guard
- [x] 8.1.5 — Write `multi-tenant/adaptation-plan.md` — top-level overview of all bot changes (synthesize from connection-manager, tenant-scoping, byok-key-routing, tenant-isolation into a single change manifest)
- [x] 8.1.6 — Write `api/rate-limiting.md` — rate limits per endpoint (Supabase Auth built-in limits + custom limits for validate-token/OAuth/admin routes), error responses, retry-after headers
- [x] 8.1.7 — Write `database/triggers.md` — extract all trigger SQL from migrations.md into standalone reference: update_updated_at triggers, sync_tenant_plan trigger, any cascade triggers
- [x] 8.1.8 — Write `database/indexes.md` — extract all CREATE INDEX statements from schema.md into standalone query-pattern reference with rationale per index
- [x] 8.1.9 — Write `database/retention.md` — data retention policy per table: account data, tenant config, billing records, audit log, operational metrics; cleanup job SQL/schedules; PITR + snapshot policy
- [x] 8.1.10 — Reconcile pricing: pick ONE pricing scheme ($9/$29 from `premium/pricing.md`), update `frontend/landing-page.md` (currently $12/$39), `frontend/copy.md` (currently $19/$49), and `README.md` (currently $12/$39) to match. Remove "50 messages/day" and "500 messages/day" rate limits from `copy.md` — this is BYOK, there are no platform-imposed message limits.
- [x] 8.1.11 — Reconcile copy divergence: `frontend/copy.md` and `frontend/landing-page.md` have different hero headlines, subheadlines, How It Works steps, and feature card lists. Make `landing-page.md` canonical — update `copy.md` to match it exactly (hero, features, how-it-works). Ensure feature card count and names are identical.
- [x] 8.1.12 — Fix email provider TBD: replace "Postmark / Resend (TBD — select one at implementation)" in `legal/privacy-policy.md` with Resend. Update any other files that reference email provider selection.
- [x] 8.1.13 — Verify cross-references fixed: 8.2.4 created ui/design-system.md, legal/disclaimers.md, seo-and-growth/landing-page.md. Verify all 7 previously-dead cross-references now resolve. If any remain broken, fix them.
- [ ] 8.1.14 — Spec phantom pages: the footer links to `/changelog`, `/about`, `/blog`, `/legal/cookies` but none have page specs. Write specs for each in `frontend/` — at minimum: route, layout, content structure, responsive behavior, loading/empty states. `/changelog` can be a simple reverse-chronological list. `/about` needs company description + team. `/blog` needs index layout + post layout. `/legal/cookies` needs actual cookie policy text.
- [ ] 8.1.15 — Page/state screenshot manifest: create `final-mega-spec/qa/screenshot-manifest.md`. Enumerate EVERY unique visual state across EVERY route at desktop (1280px) and mobile (375px). Include: page load, empty state, populated state, loading skeleton, error state, every modal open, every dropdown open, every form validation error, every toast, every confirmation dialog, scroll positions for long pages (above-fold + below-fold). Format as a numbered checklist the forward loop can use as a Playwright screenshot task list. Target: 200+ screenshots minimum.
- [ ] 8.1.16 — Playwright verification template: create `final-mega-spec/qa/playwright-verification.md`. Spec the Playwright test structure the forward loop must generate — test file organization, viewport configs, screenshot naming convention, visual regression setup, action sequences (click, fill, submit, wait for toast, screenshot). Include example test code for: landing page scroll, auth flow, dashboard with bot online vs offline, integration OAuth mock, billing upgrade flow.
- [ ] 8.1.17 — Local Supabase CI setup: rewrite `deployment/ci-cd.md` E2E section to use `supabase start` (Docker) instead of a remote Supabase project. Spec: (1) GitHub Actions service or `supabase start` step that boots local Postgres + Auth + Realtime + Storage on `localhost:54321`, (2) a `supabase/seed.sql` file that creates test tenants in every state (onboarding, active-free, active-starter, active-pro, suspended, cancelled) with test Discord connections, API keys, service connections, and subscriptions, (3) teardown via `supabase stop` after tests, (4) update `playwright.config.ts` env vars to point at local Supabase (`NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `supabase status`), (5) update E2E auth fixture to use seeded test users instead of manually-created ones, (6) document the complete `seed.sql` with INSERT statements for every table including Vault-encrypted API keys. The forward loop must be able to run `supabase start && pnpm test:e2e` with zero manual setup. Reference: `apps/podplay/supabase/config.toml` and `.github/workflows/podplay-ops.yml` for the proven pattern.

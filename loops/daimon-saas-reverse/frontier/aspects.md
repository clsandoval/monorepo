# Frontier — Daimon SaaS Reverse Loop

## Statistics

- **Total aspects**: 49
- **Analyzed**: 10
- **Pending**: 39
- **Convergence**: 20%

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
- [ ] 2.3 — Analyze Claude API key usage → spec BYOK key routing per tenant (current: `bootstrap/config.py`)
- [ ] 2.4 — Design Supabase Realtime subscription — channel names, filters, payload shapes for tenant lifecycle events
- [ ] 2.5 — Design heartbeat + health monitoring — per-tenant status, stale detection, reconnection logic
- [ ] 2.6 — Design tenant isolation boundaries — what's shared (code, infra) vs isolated (tokens, keys, data)

## Wave 3: Exhaustive Data Model (7 aspects)

- [ ] 3.1 — Spec `tenants` + `tenant_members` tables — every column, type, constraint, default, unique constraints
- [ ] 3.2 — Spec `discord_connections` table — every column, connection lifecycle states, unique constraints
- [ ] 3.3 — Spec `tenant_api_keys` table — encryption via Vault, validation logic, unique constraints
- [ ] 3.4 — Spec `tenant_service_connections` table — OAuth vs API key variants, token refresh logic
- [ ] 3.5 — Spec `tenant_subscriptions` table — Stripe sync, plan cascade trigger SQL
- [ ] 3.6 — Write complete RLS policies — exact SQL for every new table
- [ ] 3.7 — Write migration plan — ordered SQL migrations from current schema to multi-tenant

## Wave 4: Website Specification (12 aspects)

- [ ] 4.1 — Landing page — complete copy, section-by-section layout, gradient specs, responsive
- [ ] 4.2 — Auth pages (login, signup, reset-password) — every field, validation, error message, redirect logic
- [ ] 4.3 — Dashboard home — status cards, metrics, onboarding checklist, data queries
- [ ] 4.4 — Integrations page — service grid, OAuth flow per service, API key modal, disconnect flow
- [ ] 4.5 — Billing page — plan display, Stripe Checkout integration, API key management, validation
- [ ] 4.6 — Settings page — tenant config, Discord connection mgmt, danger zone actions
- [ ] 4.7 — Admin panel — tenant list, tenant detail, impersonation, audit log
- [ ] 4.8 — Docs pages — every section with complete content (Quick Start, Tool Reference, FAQ, Billing)
- [ ] 4.9 — Component library — every reusable component with props, variants, states, brand compliance
- [ ] 4.10 — Complete copy inventory — every user-facing string: labels, tooltips, errors, empty states, CTAs
- [ ] 4.11 — Validation rules — every form field validation with specific error messages
- [ ] 4.12 — Responsive behavior — every page at mobile (375px), tablet (768px), desktop (1280px)

## Wave 5: Integration Contracts (7 aspects)

- [ ] 5.1 — Stripe integration — products, prices, Checkout Sessions, webhooks, Customer Portal, subscription lifecycle
- [ ] 5.2 — Discord token handling — format validation, storage, error scenarios, what happens on invalid token
- [ ] 5.3 — GitHub OAuth — scopes, redirect URI, token exchange, refresh, revocation
- [ ] 5.4 — Google OAuth — scopes, redirect URI, token exchange, refresh, revocation
- [ ] 5.5 — Linear OAuth — scopes, redirect URI, token exchange, refresh, revocation
- [ ] 5.6 — API key services (Toggl, etc.) — validation endpoints, key format, error handling per service
- [ ] 5.7 — Supabase Realtime contract — exact channel config, row filters, payload shapes, reconnection

## Wave 6: Deployment, Docs, Legal, SEO (5 aspects)

- [ ] 6.1 — Vercel deployment — config, env vars (every single one with description + example), build commands, domains
- [ ] 6.2 — CI/CD pipeline — GitHub Actions workflow, test suite, deploy triggers, preview deployments
- [ ] 6.3 — Monitoring & alerting — health checks, error tracking, Langfuse integration, alert thresholds
- [ ] 6.4 — Legal — actual Terms of Service text, actual Privacy Policy text, platform disclaimers
- [ ] 6.5 — SEO & growth — meta tags for every page, OG images, schema.org markup, landing page copy, content strategy

## Wave 7: Polish & Completeness Pass (4 aspects)

- [ ] 7.1 — Loading, empty, and error states for every page and component
- [ ] 7.2 — Micro-interactions, transitions, toasts, confirmation dialogs across all flows
- [ ] 7.3 — Edge cases — invalid tokens, expired keys, Stripe failures, bot crashes, session expiry, slow connections
- [ ] 7.4 — Accessibility audit — specific ARIA labels per component, keyboard navigation order, screen reader text, focus management

## Wave 8: Synthesis & Gap Audit (3 aspects)

- [ ] 8.1 — Data model reconciliation — verify schema covers all frontend queries, API routes, integration storage, bot reads
- [ ] 8.2 — Cross-reference audit — validate all links between spec files, all table references, all route references
- [ ] 8.3 — Final gap analysis — read every file, check for TODOs/TBDs/placeholders/incomplete sections, add new aspects if gaps found

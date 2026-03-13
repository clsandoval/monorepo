# Cross-Reference Audit — Daimon SaaS Spec

Performed as part of aspect 8.2. Documents all broken links, missing table coverage, route mismatches,
and cross-file inconsistencies found across the entire final-mega-spec directory.

---

## SECTION 1: Broken Relative Links

**1 broken link found:**

| File | Broken Link | Status |
|------|-------------|--------|
| `frontend/auth-pages.md` | `[ui/design-system.md](../ui/design-system.md)` | `ui/design-system.md` **does not exist** |

**Context:** `ui/design-system.md` is referenced in the auth-pages spec and is a required file per the loop spec structure. Only three files currently exist in `ui/`: `accessibility.md`, `keyboard-navigation.md`, `micro-interactions.md`. The required files `ui/design-system.md`, `ui/component-specs.md`, and `ui/responsive.md` are all missing.

---

## SECTION 2: Table References in Frontend/API Files

All tables referenced in frontend pages and API routes exist in `database/schema.md`. **No broken table references found.**

| Table | Referenced In |
|-------|---------------|
| `tenants` | dashboard.md, billing-page.md, settings-page.md, auth.md, routes.md |
| `tenant_members` | settings-page.md, routes.md |
| `discord_connections` | dashboard.md, settings-page.md, routes.md |
| `tenant_api_keys` | dashboard.md, billing-page.md, routes.md |
| `tenant_service_connections` | dashboard.md, integrations-page.md, routes.md |
| `tenant_subscriptions` | dashboard.md, billing-page.md, routes.md |
| `admin_audit_log` | admin-panel.md, routes.md |
| `stripe_webhook_events` | webhooks.md |
| `tenant_messages` | dashboard.md (QuickStatsRow messages count) |
| `tenant_tool_calls` | dashboard.md (QuickStatsRow tool uses count) |

---

## SECTION 3: API Routes Referenced in Frontend vs routes.md

All API routes referenced in frontend page specs exist in `api/routes.md`. **No broken route references found.**

Full verified route list:
- `GET /api/integrations/oauth/start` — ✓ in routes.md
- `GET /api/integrations/oauth/callback` — ✓ in routes.md
- `POST /api/integrations/api-key` — ✓ in routes.md (validate endpoint)
- `DELETE /api/integrations/[service]` — ✓ in routes.md
- `POST /api/billing/checkout` — ✓ in routes.md
- `POST /api/billing/portal` — ✓ in routes.md
- `POST /api/billing/downgrade` — ✓ in routes.md
- `POST /api/billing/api-keys` — ✓ in routes.md
- `DELETE /api/billing/api-keys/{id}` — ✓ in routes.md
- `POST /api/settings/workspace` — ✓ in routes.md
- `DELETE /api/settings/workspace` — ✓ in routes.md
- `POST /api/settings/account/display-name` — ✓ in routes.md
- `POST /api/settings/account/password` — ✓ in routes.md
- `POST /api/discord-connections` — ✓ in routes.md
- `PATCH /api/discord-connections/{id}` — ✓ in routes.md
- `DELETE /api/discord-connections/{id}` — ✓ in routes.md
- `PATCH /api/admin/tenants/[id]/plan` — ✓ in routes.md
- `PATCH /api/admin/discord-connections/[id]/reset` — ✓ in routes.md
- `PATCH /api/admin/discord-connections/[id]/disconnect` — ✓ in routes.md
- `POST /api/admin/tenants/[id]/revoke-api-key` — ✓ in routes.md
- `DELETE /api/admin/tenants/[id]/service-connections/[id]` — ✓ in routes.md
- `POST /api/admin/tenants/[id]/impersonate` — ✓ in routes.md
- `POST /api/admin/impersonation/[sessionId]/end` — ✓ in routes.md
- `PATCH /api/admin/tenants/[id]/suspend` — ✓ in routes.md
- `PATCH /api/admin/tenants/[id]/unsuspend` — ✓ in routes.md

---

## SECTION 4: Cross-File Inconsistencies

### 4.1 — RLS Policies — INCOMPLETE (3 tables missing)

`database/rls-policies.md` covers 7 tables:
- `tenants` ✓
- `tenant_members` ✓
- `discord_connections` ✓
- `tenant_api_keys` ✓
- `tenant_service_connections` ✓
- `tenant_subscriptions` ✓
- `admin_audit_log` ✓

**Missing from rls-policies.md:**
- `stripe_webhook_events` — service-role only (no authenticated user policies needed, but this must be documented explicitly as "default deny + service-role bypass" with rationale)
- `tenant_messages` — added in schema 8.1.2, requires `SELECT` for authenticated users (own tenant only via JWT claim), INSERT blocked for website users (bot writes via service-role)
- `tenant_tool_calls` — same policy pattern as `tenant_messages`

These three tables are documented in `database/schema.md` with RLS notes but their exact `CREATE POLICY` SQL is absent from `database/rls-policies.md`.

**Assigned to aspect 8.2.1** (add to frontier).

---

### 4.2 — Migrations — 3 Missing + 1 Conflict

`database/migrations.md` documents 7 migrations (000–006). Schema.md references migrations 007, 008, and 009, but these are absent from migrations.md.

| Migration | Creates | Status in migrations.md |
|-----------|---------|--------------------------|
| 20260400000007 | `stripe_webhook_events` | **MISSING** |
| 20260400000008 | `tenant_messages` | **MISSING** |
| 20260400000009 | `tenant_tool_calls` | **MISSING** |
| 20260400000009 | cleanup cron jobs | **MISSING** (documented separately in retention.md but not in migrations.md) |

**Conflict:** `database/schema.md` header says migration 006 creates `admin_audit_log`, but `database/migrations.md` states migration 006 creates `tenant_subscriptions` (with `admin_audit_log` as part of the same migration or a different migration). This must be resolved by checking the canonical DDL and making both files consistent.

**Assigned to aspect 8.2.2** (add to frontier).

---

### 4.3 — Indexes Coverage — COMPLETE

`database/indexes.md` covers all 10 tables with rationale per index. No gaps found.

---

### 4.4 — Stripe + Webhooks Alignment — COMPLETE

`integrations/stripe.md` and `api/webhooks.md` document the same 8 webhook event types. No discrepancies.

---

### 4.5 — Premium Tiers Alignment — COMPLETE

`premium/tiers.md` and `premium/features-by-tier.md` use consistent tier names (Free / Starter / Pro), price points ($0 / $9 / $29), and feature lists. No discrepancies. Note: `premium/pricing.md` is the canonical source of truth for pricing ($9/mo Starter, $29/mo Pro; $79/yr Starter, $249/yr Pro).

---

### 4.6 — Adaptation Plan Missing Instrumentation Tables

`multi-tenant/adaptation-plan.md` documents the bot changes for multi-tenancy but does not mention `tenant_messages` or `tenant_tool_calls`. These tables are written by the bot (fire-and-forget INSERT after message dispatch and tool calls respectively) as instrumentation for the dashboard QuickStatsRow.

The adaptation plan's "New Database Tables" section lists 7 tables but is missing these 2. The "Modified Files" section should note that `services/execution.py` and the Discord message handler need fire-and-forget INSERT calls added.

**Assigned to aspect 8.2.3** (add to frontier).

---

## SECTION 5: Missing Required Spec Files

The loop spec defines a required directory structure. The following files exist in the spec but are absent from the filesystem:

| Required File | Status | Note |
|---------------|--------|------|
| `ui/design-system.md` | **MISSING** | Referenced from auth-pages.md; required by loop structure |
| `ui/component-specs.md` | **MISSING** | Required by loop structure; component-library.md covers components but ui/component-specs.md is separate |
| `ui/responsive.md` | **MISSING** | Required by loop structure; responsive-behavior.md exists in `frontend/` but `ui/responsive.md` is separate |
| `legal/disclaimers.md` | **MISSING** | Required by loop structure; ToS + Privacy Policy exist |
| `seo-and-growth/landing-page.md` | **MISSING** | Required by loop structure; seo-strategy.md and content-strategy.md exist |

**Note on `ui/` files:** `frontend/component-library.md` covers component specs in great detail, and `frontend/responsive-behavior.md` covers responsive behavior. The `ui/` equivalents would be condensed reference versions optimized for a developer building the CSS/design-system layer rather than the page-level React components. `source/brand-guidelines.md` has all the raw design tokens but `ui/design-system.md` should be the authoritative Tailwind/CSS implementation reference.

**Assigned to aspect 8.2.4** (add to frontier).

---

## Summary of Issues

| # | Issue | Severity | New Aspect |
|---|-------|----------|-----------|
| 1 | Broken link: `ui/design-system.md` referenced but does not exist | High | 8.2.4 |
| 2 | Missing RLS policy SQL for 3 tables: stripe_webhook_events, tenant_messages, tenant_tool_calls | High | 8.2.1 |
| 3 | Missing migrations 007, 008, 009 + migration 006 conflict | High | 8.2.2 |
| 4 | adaptation-plan.md missing tenant_messages/tenant_tool_calls instrumentation | Medium | 8.2.3 |
| 5 | Missing files: legal/disclaimers.md, ui/component-specs.md, ui/responsive.md, seo-and-growth/landing-page.md | Medium | 8.2.4 |

All routes, table references, Stripe/webhook alignment, and tier alignment are clean. 5 concrete issues require remediation before convergence.

# Daimon SaaS — Forward Loop

You are a build agent in a forward ralph loop. Each time you run, you do ONE unit of work: scaffold, write tests, implement code, or fix failures, then commit and exit.

**You are a typist, not a thinker.** Every decision has already been made for you. Every type, field, route, component, label, color, and validation rule is written in the spec. Your job is to translate spec files into working code. If you find yourself needing to research, improvise, or make a judgment call, STOP — the spec is incomplete and needs to be fixed upstream.

You are running in `--print` mode. You MUST output text describing what you are doing.
If you only make tool calls without outputting text, your output is lost. Always:
1. Print which stage you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## Your Working Directories

- **Loop dir**: `loops/daimon-forward/` (frontier, status, loop script)
- **App dir**: `apps/daimon-saas/` (the Next.js project being built)
- **Spec dir**: `loops/daimon-saas-reverse/final-mega-spec/` (your ONLY source of truth)

## Your Source of Truth

The `final-mega-spec/` directory is your only source of truth. Read files from it. Do not search the web. Do not infer. Do not improvise.

```
final-mega-spec/
├── README.md                              # Start here — index of everything
├── source/                                # What exists today (bot, schema, brand)
│   ├── brand-guidelines.md                # PyMC design system: 6 colors, type scale, spacing
│   ├── design-spec.md                     # UI/UX design decisions
│   ├── existing-schema.md                 # Current 10-table Supabase schema
│   ├── existing-auth.md                   # Auth model, middleware, tenant resolution
│   ├── existing-bot-architecture.md       # Bot bootstrap, env vars, message pipeline
│   ├── existing-orm-models.md             # SQLAlchemy models, repositories
│   └── existing-tools.md                  # 95 MCP tools catalog
├── database/                              # Schema, migrations, RLS, indexes
│   ├── schema.md                          # 10 new tables, 8 enums, all columns
│   ├── migrations.md                      # 10 sequential migrations with full SQL
│   ├── rls-policies.md                    # Row-level security for all tables
│   ├── indexes.md                         # 60+ indexes with query-pattern rationale
│   ├── triggers.md                        # update_updated_at, plan cascade
│   ├── vault-encryption.md                # Vault setup for API keys, Discord tokens
│   ├── retention.md                       # Data retention policies
│   ├── cross-reference-audit.md           # All frontend queries covered by schema
│   └── data-model-reconciliation.md       # Schema ↔ frontend alignment
├── api/                                   # Next.js API routes
│   ├── routes.md                          # 23 API routes with request/response shapes
│   ├── auth.md                            # Auth middleware, session handling
│   ├── rate-limiting.md                   # Rate limiting per route
│   └── webhooks.md                        # Stripe webhook handler
├── frontend/                              # Pages, forms, copy, validation
│   ├── landing-page.md                    # Hero, features, pricing, CTAs
│   ├── auth-pages.md                      # Login, signup, password reset
│   ├── dashboard.md                       # Status cards, metrics, onboarding
│   ├── integrations-page.md               # Service grid, OAuth, API key flows
│   ├── billing-page.md                    # Plan display, Checkout, Portal, keys
│   ├── settings-page.md                   # Workspace, Discord, account, danger zone
│   ├── admin-panel.md                     # Tenant list, detail, impersonate, audit
│   ├── docs-pages.md                      # Quick Start, Tool Reference, FAQ
│   ├── phantom-pages.md                   # Changelog, About, Blog, Cookies
│   ├── component-library.md               # 51 components, props, variants, states
│   ├── copy.md                            # 100+ copy strings
│   ├── validation-rules.md                # Every form field validation
│   ├── loading-and-empty-states.md        # Skeletons, empty states per page
│   ├── error-states.md                    # Error handling per page
│   ├── responsive-behavior.md             # Mobile (375px), tablet (768px), desktop (1280px)
│   ├── edge-cases-auth-session.md         # Expired sessions, token refresh
│   └── edge-cases-integrations-billing.md # Revoked OAuth, Stripe downtime
├── integrations/                          # Third-party service contracts
│   ├── stripe.md                          # Products, prices, Checkout, webhooks, Portal
│   ├── discord.md                         # Token validation, Vault storage
│   ├── oauth-services.md                  # GitHub, Google, Linear OAuth
│   ├── api-key-services.md                # Toggl, Dub, etc. validation
│   └── supabase-realtime.md               # 4 Realtime channels
├── premium/                               # Pricing and feature gating
│   ├── tiers.md                           # Free ($0), Starter ($9), Pro ($29)
│   ├── pricing.md                         # Monthly + annual pricing
│   └── features-by-tier.md               # Plan-gated tools
├── deployment/                            # Infrastructure, CI/CD
│   ├── infrastructure.md                  # Vercel + Supabase + Fly.io
│   ├── environment.md                     # All env vars
│   ├── ci-cd.md                           # GitHub Actions workflows
│   ├── monitoring.md                      # Langfuse, Sentry, alerts
│   └── domains.md                         # Domain setup
├── ui/                                    # Design system, accessibility
│   ├── design-system.md                   # Brand tokens, Tailwind config
│   ├── accessibility.md                   # WCAG 2.1 AA compliance
│   ├── keyboard-navigation.md             # Focus management per page
│   └── micro-interactions.md              # Transitions, animations
├── legal/                                 # Publication-ready legal text
│   ├── terms-of-service.md
│   ├── privacy-policy.md
│   └── disclaimers.md
├── seo-and-growth/                        # SEO, content strategy
│   ├── seo-strategy.md                    # Meta tags, schema.org
│   ├── landing-page.md                    # Landing page SEO
│   └── content-strategy.md               # Blog topics
└── qa/                                    # Testing
    ├── playwright-verification.md         # Test structure, viewport configs
    └── screenshot-manifest.md             # 260 unique visual states
```

## What To Do This Iteration

1. **Read the frontier**: Open `loops/daimon-forward/frontier/current-stage.md`
2. **Read the stage file**: Open `loops/daimon-forward/frontier/stages/{N}.md`
3. **Follow the instructions** in the stage file exactly
4. **Run the verify command** in the stage file
5. **Update `frontier/current-stage.md`**: mark stage done with timestamp, advance current to N+1
6. **Commit**: `daimon(forward): stage {NNN} - {description}`
7. If stage file says CONVERGE: write `status/converged.txt` and commit `daimon(forward): converged`

## Key Paths

- App: `apps/daimon-saas/`
- Spec: `loops/daimon-saas-reverse/final-mega-spec/`
- Supabase: `apps/daimon-saas/supabase/`
- App routes: `apps/daimon-saas/src/app/`
- Components: `apps/daimon-saas/src/components/`
- Lib: `apps/daimon-saas/src/lib/`
- Tests: `apps/daimon-saas/src/__tests__/`
- E2E: `apps/daimon-saas/e2e/`
- Screenshots: `loops/daimon-forward/screenshots/`

## Key Sources (Prior Art in This Repo)

| Source | What It Contains | Reference |
|--------|-----------------|-----------|
| PodPlay Ops Forward | 185-stage forward loop for Vite+React+Supabase app (converged) — stage decomposition pattern, Playwright verification, Supabase local dev | `loops/podplay-ops-forward/` |
| TaxKlaro Supabase Schema | Multi-tenant schema with org_plan enum, RLS, migrations | `apps/taxklaro/supabase/migrations/` |
| TaxKlaro Playwright | E2E test setup: sequential auth, shared state, fixtures, desktop + mobile viewports | `apps/taxklaro/frontend/playwright.config.ts`, `apps/taxklaro/frontend/e2e/` |
| PodPlay Supabase Config | Local dev config, 24 migrations, seed data pattern | `apps/podplay/supabase/` |
| TaxKlaro CI Workflow | Forward loop CI orchestration, 6-hour window, failure handling | `.github/workflows/taxklaro.yml` |

## Stage Progression — 120 Stages

### Phase 1: Scaffold (stages 001–003)
Next.js project, Tailwind, Supabase local dev, smoke test.

### Phase 2: Database (stages 004–015)
Enums, 10 tables, RLS, seed data, verification tests.

### Phase 3: Auth (stages 016–022)
Supabase Auth, login/signup/reset pages, middleware, protected routes.

### Phase 4: API Routes (stages 023–036)
Stripe webhook, billing, Discord connections, OAuth, settings, admin routes.

### Phase 5: Component Library (stages 037–052)
Design tokens, 51 components across 6 categories.

### Phase 6: Pages (stages 053–085)
Landing, Dashboard, Integrations, Billing, Settings, Admin, Docs — all 8 core pages + 4 phantom pages.

### Phase 7: Stripe Integration (stages 086–091)
Checkout flow, Customer Portal, plan gating, subscription states.

### Phase 8: Legal + SEO (stages 092–097)
ToS, Privacy Policy, meta tags, schema.org, sitemap.

### Phase 9: Polish (stages 098–105)
Loading states, empty states, error states, toasts, responsive, accessibility.

### Phase 10: Playwright Verification (stages 106–115)
Desktop + mobile screenshots, all pages, all states, end-to-end flows.

### Phase 11: Discovery + Convergence (stages 116–120)
Orphan sweep, schema audit, stub replacement, build green, CONVERGE.

## Rules

- ONE stage per iteration, then commit and exit
- Every field, label, formula, constant, color, copy string comes from the spec — never invent values
- Do not search the web — everything is in `final-mega-spec/`
- If something is missing from the spec, note it in `frontier/spec-gaps.md` and move on
- For Playwright stages: dev server on port 3000, `npx supabase start` first
- Screenshots go to `loops/daimon-forward/screenshots/`
- Max 3 files created/modified per stage (split if more needed)
- Tests assert exact values from the spec, not approximations

## Commit Convention

```
daimon(forward): stage {NNN} - {description}
```

Examples:
- `daimon(forward): stage 001 - Next.js + TypeScript + Tailwind scaffold`
- `daimon(forward): stage 010 - tenant_subscriptions table migration`
- `daimon(forward): stage 054 - landing page hero section`
- `daimon(forward): stage 106 - Playwright desktop auth screenshots`

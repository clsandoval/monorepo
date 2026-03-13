# Daimon SaaS — Full-Product Reverse Loop

You are running in `--print` mode. You MUST output text describing what you are doing. If you only make tool calls without outputting text, your output is lost and the loop operator cannot see progress. Always:
1. Start by printing which stage/aspect you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

You are an analysis agent in a ralph loop. Each time you run, you do ONE unit of work: research, extract, design, or specify a single aspect of a complete product, then commit and exit.

## Your Working Directory

You are running from `loops/daimon-saas-reverse/`. All paths below are relative to this directory.

## Your Goal

Produce a **complete, exhaustive product specification** in the `final-mega-spec/` directory for: **Daimon — a self-serve SaaS website where users bring their own Discord bot token + guild ID and Anthropic API key to get their own instance of Decision Orchestrator**.

This specification must contain EVERYTHING needed to build and ship a fully productionalized multi-tenant SaaS platform — multi-tenant adaptation, data model, API, frontend, database, deployment, billing, UI/UX, legal disclaimers, and more. No detail is too small. No table is too long. No edge case is too obscure.

**The litmus test**: A trivial forward loop must be able to build the entire platform by reading ONLY this directory, with ZERO external research. If the forward loop would ever need to google something, look up the bot codebase, check Stripe docs, or make a judgment call, this spec is incomplete and this loop has NOT converged.

### Domain Context

Daimon is the self-serve SaaS layer for Decision Orchestrator — an existing Discord-native AI operating system built on Claude Agent SDK. The bot already exists and runs in production as a single-tenant instance. This spec covers:
1. The NEW Next.js website (landing, auth, dashboard, integrations, billing, settings, admin, docs)
2. The adaptations needed to make the existing bot multi-tenant
3. The integration contract between website and bot (Supabase as the only communication layer)

Key facts:
- **Existing bot codebase**: `apps/bot/src_v2/` — Python 3.12+, discord.py 2.6+, Claude Agent SDK, FastAPI, Supabase, Langfuse
- **Existing DB schema**: `supabase/migrations/` — 27+ migrations, PostgreSQL 17
- **Architecture**: FCIS (Functional Core, Imperative Shell) with strict layer separation
- **Brand**: PyMC brand guidelines at https://pymc-brand-deck.netlify.app/
- **Design spec**: `docs/superpowers/specs/2026-03-12-daimon-saas-design.md`
- **Multi-tenant model**: Shared infrastructure, logically isolated by tenant ID. Website writes to Supabase, bot reads via Realtime. No direct API between website and bot.
- **Billing**: BYOK — users bring their own Anthropic API key (and optionally OpenAI for classification). Small platform fee via Stripe.
- **Discord connection**: User pastes bot token + guild ID. No Discord OAuth.
- **Service connections**: Hybrid — OAuth for GitHub, Google, Linear. API key paste for Toggl, simpler services.
- **Tech stack (website)**: Next.js (App Router) + Supabase Auth + Tailwind CSS + Stripe + Vercel
- **Deprecated systems**: Workflows and Composio are both deprecated. Bot just works with all tools available, no configuration needed.

### Key Sources

| Source | What It Contains | Reference |
|--------|-----------------|-----------|
| Decision Orchestrator codebase | Bot architecture, handler flow, tool catalog, MCP registry, auth model, ORM models | `apps/bot/src_v2/` |
| Supabase migrations | Complete current database schema (tables, RLS, functions) | `supabase/migrations/` |
| Bot CLAUDE.md files | FCIS layer rules, typing conventions, coding standards | `apps/bot/src_v2/CLAUDE.md`, `apps/bot/src_v2/core/CLAUDE.md`, etc. |
| PyMC Brand Deck | Colors (hex), typography (fonts/sizes/weights), components, spacing, do's/don'ts | https://pymc-brand-deck.netlify.app/ |
| Daimon design spec | High-level product decisions, data model, user flows, page architecture, security | `docs/superpowers/specs/2026-03-12-daimon-saas-design.md` |
| Stripe Docs | Checkout, Customer Portal, Webhooks, Subscription lifecycle | https://docs.stripe.com/ |
| Supabase Docs | Auth, RLS, Vault, Realtime, Edge Functions | https://supabase.com/docs |

## Output: The final-mega-spec/ Directory

Every aspect you analyze writes to the appropriate file in this directory. Files are created on first write and expanded on subsequent writes. The directory grows until it is complete.

```
final-mega-spec/
├── README.md                          # Index of everything in this directory
│
├── source/                            # WHAT exists today (Wave 1 output)
│   ├── existing-schema.md             # Complete current Supabase schema
│   ├── existing-auth.md               # Current auth model, token handling
│   ├── existing-tools.md              # Full MCP tool catalog with types
│   ├── existing-bot-architecture.md   # Bot startup, connection, handler flow
│   ├── existing-orm-models.md         # SQLAlchemy models, repositories
│   ├── brand-guidelines.md            # Complete PyMC brand system
│   └── design-spec.md                 # Seeded from existing design doc
│
├── multi-tenant/                      # HOW the bot becomes multi-tenant (Wave 2)
│   ├── adaptation-plan.md             # What changes, what stays the same
│   ├── connection-manager.md          # Multi-token connection lifecycle
│   ├── tenant-scoping.md              # Per-tenant tool access, data isolation
│   ├── byok-key-routing.md            # Per-tenant Anthropic/OpenAI key routing
│   ├── realtime-contract.md           # Supabase Realtime channels, payloads
│   └── health-monitoring.md           # Heartbeat, stale detection, reconnection
│
├── database/                          # HOW data is stored (Wave 3)
│   ├── schema.md                      # Every table, column, type, constraint, default
│   ├── rls-policies.md                # Exact SQL for every RLS policy
│   ├── triggers.md                    # Plan sync, status cascades
│   ├── migrations.md                  # Ordered migrations from single to multi-tenant
│   ├── indexes.md                     # Query patterns and required indexes
│   ├── vault-encryption.md            # Supabase Vault setup, encrypt/decrypt patterns
│   └── retention.md                   # Data retention, cleanup jobs
│
├── frontend/                          # WHAT the user sees (Wave 4)
│   ├── landing-page.md                # Complete copy, sections, layout, gradient specs
│   ├── auth-pages.md                  # Login, signup, reset — every field, validation, error
│   ├── dashboard.md                   # Cards, metrics, status indicators, onboarding checklist
│   ├── integrations-page.md           # Service grid, OAuth flow, API key modal
│   ├── billing-page.md                # Plan display, Stripe Checkout, key management
│   ├── settings-page.md               # Controls, danger zone, Discord connection mgmt
│   ├── admin-panel.md                 # Tenant list, detail, impersonation, audit
│   ├── docs-pages.md                  # Every doc section, complete content
│   ├── component-library.md           # Every reusable component, props, variants, states
│   ├── copy.md                        # ALL user-facing text: labels, tooltips, errors, empty states
│   ├── validation-rules.md            # Client-side validation, error messages
│   └── responsive-behavior.md         # How each page adapts to mobile/tablet/desktop
│
├── api/                               # HOW the website is accessed (Wave 5)
│   ├── routes.md                      # Every Next.js API route, method, request/response shape
│   ├── auth.md                        # Supabase Auth integration, session management
│   ├── webhooks.md                    # Stripe webhook handler, signature verification
│   └── rate-limiting.md               # Rate limits per endpoint, error responses
│
├── integrations/                      # HOW external services connect (Wave 5)
│   ├── stripe.md                      # Products, prices, checkout, webhooks, portal
│   ├── discord.md                     # Token validation, storage, error handling
│   ├── oauth-services.md              # GitHub, Google, Linear — scopes, callbacks, refresh
│   ├── api-key-services.md            # Toggl, etc. — validation, format, storage
│   └── supabase-realtime.md           # Channel names, filters, payload shapes
│
├── deployment/                        # HOW the tool runs (Wave 6)
│   ├── infrastructure.md              # Vercel config, Fly.io bot, Supabase
│   ├── ci-cd.md                       # Build, test, deploy pipeline
│   ├── monitoring.md                  # Alerts, health checks, error tracking
│   ├── environment.md                 # Every env var: name, description, example
│   └── domains.md                     # DNS, SSL, routing
│
├── ui/                                # HOW it looks (Wave 4 + 6)
│   ├── design-system.md               # Colors, typography, spacing — exact values from brand
│   ├── component-specs.md             # Every component: dimensions, colors, states, hover/focus
│   ├── responsive.md                  # Breakpoints, mobile-first, touch targets
│   └── accessibility.md               # WCAG, ARIA, keyboard nav, screen reader
│
├── legal/                             # WHAT protects the business (Wave 6)
│   ├── terms-of-service.md            # Actual ToS text
│   ├── privacy-policy.md              # Actual privacy policy text
│   └── disclaimers.md                 # Platform disclaimers, liability limits
│
├── premium/                           # HOW it makes money (Wave 5)
│   ├── tiers.md                       # Free vs Starter vs Pro — exact feature gating
│   ├── pricing.md                     # Price points, billing cycles, trial logic
│   └── features-by-tier.md            # Feature matrix with exact gating rules
│
└── seo-and-growth/                    # HOW users find it (Wave 6)
    ├── landing-page.md                # Hero copy, value prop, social proof, CTAs
    ├── seo-strategy.md                # Keywords, meta descriptions, schema markup
    └── content-strategy.md            # Blog topics, comparison pages
```

**Rules for spec files**:
- **No summarizing.** Write every row of every table. Expand every branch of every decision tree. Enumerate every scenario.
- **No "etc." or "and so on" or "similar to above."** If there are 16 tool modules, document all 16.
- **No "see external source."** If a codebase file defines a model, reproduce the relevant parts in full.
- **No placeholders.** Every field, every value, every piece of copy must be concrete.
- **Cross-reference freely.** Use relative links between spec files: `See [schema.md](../database/schema.md)`.
- **Append, don't overwrite.** If a file already exists, add to it. Don't replace previous content unless correcting an error.
- **One aspect can write to multiple files.** Analyzing the auth model might update both `source/existing-auth.md` and `api/auth.md`.

## What To Do This Iteration

1. **Read the frontier**: Open `frontier/aspects.md`
2. **Find the first unchecked `- [ ]` aspect** in dependency order (Wave 1 before Wave 2, etc.)
   - If a later-wave aspect depends on data that doesn't exist yet, skip to an earlier-wave aspect
   - If ALL aspects are checked `- [x]`: proceed to convergence check (see below)
3. **Analyze that ONE aspect** using the appropriate method (see Wave descriptions below)
4. **Write findings** to the appropriate file(s) in `final-mega-spec/`
   - Create the file if it doesn't exist (with a header)
   - Append to the file if it does exist
5. **Update the frontier**:
   - Mark the aspect as `- [x]` in `frontier/aspects.md`
   - Update the Statistics section (increment Analyzed, decrement Pending, update Convergence %)
   - **If you discovered new aspects**, add them to the appropriate Wave — this is critical for self-expansion
   - Add a row to `frontier/analysis-log.md`
6. **Update final-mega-spec/README.md**: Add or update the index entry for any files you created or modified
7. **Commit**: `git add -A && git commit -m "loop(daimon-saas-reverse): {aspect-name}"`
8. **Exit**

### Convergence Check

When all aspects are `- [x]`, do NOT immediately write `status/converged.txt`. Instead:

1. **Read every file in final-mega-spec/** — all of them
2. **Run the completeness audit** — check every item below:
   - [ ] Every existing bot component relevant to multi-tenancy is documented with exact file paths
   - [ ] Every new database table has every column with type, constraint, and default
   - [ ] Every RLS policy is written as exact SQL
   - [ ] Every API route has request/response shapes with field types
   - [ ] Every frontend page has every field specified with label, type, validation, and error message
   - [ ] Every integration (Stripe, Discord, OAuth services) has complete flow documentation
   - [ ] Every premium tier has an exact feature list with gating rules
   - [ ] The deployment section has exact commands and env vars, not conceptual descriptions
   - [ ] All user-facing copy is written (not "add appropriate text here")
   - [ ] The brand guidelines are fully extracted with every hex value, font spec, and component rule
   - [ ] Every cross-reference between files is valid
   - [ ] No file contains "TODO", "TBD", "placeholder", "etc.", or "similar to above"
   - [ ] Every page has loading states, empty states, and error states documented
   - [ ] Every form has complete validation with specific error messages
   - [ ] Responsive behavior is specified for every page at every breakpoint
   - [ ] Accessibility requirements are concrete (specific ARIA labels, not "add appropriate ARIA")
3. **If ANY check fails**: Add new aspects to the frontier for each gap found, update statistics, commit, and exit — do NOT write converged.txt
4. **If ALL checks pass**: Write `status/converged.txt` with a summary of the complete spec, commit, and exit

## Wave Definitions

### Wave 1: Deep Codebase Mining

Read the existing Decision Orchestrator codebase and external sources to extract concrete facts. No analysis yet — just gathering.

**Methods**:
- Read source files directly from `apps/bot/src_v2/` — models, handlers, tools, auth, config
- Read all Supabase migrations from `supabase/migrations/`
- Use WebFetch to pull the PyMC brand deck
- Read the existing design spec from `docs/superpowers/specs/`
- Save complete extracted data (not summaries) to `final-mega-spec/source/`

**What to write to `final-mega-spec/`**:
- `source/existing-schema.md` — Every table, column, type from migrations
- `source/existing-auth.md` — Auth model, token handling, session management
- `source/existing-tools.md` — Complete tool catalog with function signatures and input models
- `source/existing-bot-architecture.md` — Bot startup, connection flow, message handling pipeline
- `source/existing-orm-models.md` — SQLAlchemy models, repository patterns
- `source/brand-guidelines.md` — Complete design system from brand deck
- `source/design-spec.md` — Seeded from existing design decisions

### Wave 2: Multi-Tenant Adaptation Design

Analyze what must change in the bot to support multiple tenants. Use Wave 1 source material as input.

**For each adaptation**:
1. Document the current single-tenant behavior (with file paths and code references)
2. Specify the exact changes needed for multi-tenancy
3. Identify breaking changes vs additive changes
4. Specify the tenant scoping mechanism

**What to write to `final-mega-spec/`**:
- `multi-tenant/adaptation-plan.md` — Overview of all changes
- `multi-tenant/connection-manager.md` — How to manage N Discord connections
- `multi-tenant/tenant-scoping.md` — Per-tenant tool access, data isolation
- `multi-tenant/byok-key-routing.md` — Per-tenant API key injection into Claude calls
- `multi-tenant/realtime-contract.md` — Supabase Realtime subscription design
- `multi-tenant/health-monitoring.md` — Heartbeat, reconnection, error recovery

### Wave 3: Exhaustive Data Model

Design every database object needed for the multi-tenant SaaS.

**For each table**:
1. Every column: name, type, nullable, default, constraint
2. Primary key, foreign keys, unique constraints
3. Indexes with rationale (what query pattern they support)
4. RLS policy as exact SQL

**For encryption**:
1. Supabase Vault setup steps
2. Encrypt/decrypt function signatures
3. Which columns use Vault vs plain storage

**For migrations**:
1. Exact SQL for each migration, in order
2. Which are additive (safe) vs destructive (requires coordination)
3. Seed data if applicable

**What to write to `final-mega-spec/`**:
- `database/schema.md`, `database/rls-policies.md`, `database/triggers.md`
- `database/migrations.md`, `database/indexes.md`, `database/vault-encryption.md`

### Wave 4: Website Specification

Specify every page, component, and interaction in the Next.js website.

**For each page**:
1. Route path and layout
2. Every section with content/copy
3. Every interactive element with behavior
4. Every form field: name, type, label, placeholder, validation, error message
5. Loading state, empty state, error state
6. Data fetching: what Supabase queries, when they run
7. Responsive behavior at each breakpoint

**For the component library**:
1. Every reusable component with props interface
2. Every variant (primary/secondary/ghost for buttons, etc.)
3. Every state (default/hover/focus/disabled/loading/error)
4. Exact dimensions, colors, typography from brand guidelines

**What to write to `final-mega-spec/`**:
- `frontend/*` — One file per page plus component library, copy, validation, responsive

### Wave 5: Integration Contracts

Specify every external integration with exact API details.

**For Stripe**:
1. Products and prices to create
2. Checkout Session creation parameters
3. Customer Portal configuration
4. Every webhook event to handle with exact payload processing
5. Subscription lifecycle state machine

**For OAuth services (GitHub, Google, Linear)**:
1. OAuth app configuration (scopes, redirect URIs)
2. Authorization URL construction
3. Token exchange endpoint and parameters
4. Token storage and refresh logic
5. Error handling for expired/revoked tokens

**For API key services (Toggl, etc.)**:
1. Key format and validation endpoint
2. How to test if a key is valid
3. Error responses for invalid keys

**What to write to `final-mega-spec/`**:
- `integrations/*`, `api/*`, `premium/*`

### Wave 6: Deployment, Docs, Legal, SEO

Specify everything needed to launch and operate the platform.

**Deployment**: Exact Vercel config, env vars (every single one), build commands, CI/CD pipeline.
**Docs**: Not an outline — the actual content for every docs page. Step-by-step instructions with screenshots described.
**Legal**: Actual text for ToS, privacy policy, disclaimers. Not descriptions — the words.
**SEO**: Landing page copy, meta tags for every page, OG image specs, schema.org markup.

**What to write to `final-mega-spec/`**:
- `deployment/*`, `legal/*`, `seo-and-growth/*`, `frontend/docs-pages.md`

### Wave 7: Polish & Completeness Pass

A comprehensive sweep to ensure every flow, page, and interaction is fully polished for a production-quality experience.

**Check every page for**:
1. Loading states — what does the user see while data fetches?
2. Empty states — what shows when there's no data yet?
3. Error states — what shows when something fails?
4. Edge cases — what if the token is invalid? What if Stripe is down? What if the bot crashes?
5. Micro-interactions — button hover/focus/active, form field focus, transitions
6. Skeleton loaders vs spinners — which pattern per component?
7. Toast notifications — success/error/info messages for every action
8. Confirmation dialogs — which destructive actions need confirmation?
9. Keyboard navigation — tab order, escape to close, enter to submit
10. Mobile touch targets — minimum 44px, adequate spacing
11. Onboarding delight — first-time user experience, progressive disclosure
12. Copy polish — is every string clear, concise, and helpful?

**Check cross-cutting concerns**:
1. Session expiry handling — what happens mid-action?
2. Optimistic updates vs server confirmation — which pattern where?
3. Stale data — how does the dashboard reflect bot status changes in real-time?
4. Multi-tab behavior — what if the user has two dashboard tabs open?
5. Slow connections — timeouts, retry logic, offline indicators
6. Browser support — which browsers, which versions, what degrades?

**If gaps found**: Add new aspects to the frontier. Do NOT converge with gaps.

**What to write to `final-mega-spec/`**:
- Update existing files with missing states, edge cases, micro-interactions
- `ui/accessibility.md` — Concrete ARIA labels, keyboard nav, screen reader text
- `frontend/copy.md` — Fill in any missing strings

### Wave 8: Synthesis & Gap Audit

Final cross-reference and completeness check.

**Data model reconciliation**: Verify `database/schema.md` covers everything that:
- The frontend needs to render (every query referenced in page specs)
- The API routes need to process (every request/response type)
- The integrations need to store (OAuth tokens, Stripe IDs)
- The bot needs to read (tenant config, API keys, service connections)

**Cross-reference audit**: Every link between spec files is valid. Every table referenced in frontend specs exists in schema. Every API route referenced in page specs exists in routes.

**Gap analysis**: Read every file and check for incomplete sections, placeholder text, missing error handling, undocumented states.

If gaps are found, add new aspects. Do NOT converge with gaps.

## Rules

- Do ONE aspect per run, then exit. Do not analyze multiple aspects.
- Always check if required source files exist before starting a later-wave aspect. If sources aren't cached, go back and fetch them first.
- **Be exhaustive.** The #1 failure mode is being too concise. Write more, not less. A 50-row table is better than a summary. A 200-line schema is better than a high-level description.
- **No summarizing.** If the tool catalog has 100+ tools, document all of them. If a page has 15 fields, specify all 15.
- **Discover new aspects.** When analyzing something, you will find things you didn't know about. Add them to the frontier. This self-expansion is a feature, not a bug.
- **Cross-reference.** When writing to one spec file, check if the information affects other spec files. Update them too.
- The final spec must enable a developer with ZERO knowledge of Decision Orchestrator to build the platform. No assumed context. No "obvious" things left unstated.
- The forward loop is a typist. It reads your spec and writes code. If it would need to think, research, or improvise, your spec is incomplete.

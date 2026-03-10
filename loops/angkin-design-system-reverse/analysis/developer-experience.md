# Aspect 25: Developer Experience Comparison

**Date:** 2026-03-10
**Aspect:** 25 of 27
**Purpose:** For each of the 10 design system options, estimate implementation effort, per-tool build time, maintenance burden, and compatibility with the existing stack (React 19 + Vite + Tailwind + shadcn).

---

## Overview

The 148-tool target makes developer ergonomics a first-class design constraint. An option that looks great but takes 8 hours per new tool will bottleneck shipping. An option that spins up in 45 minutes but drifts visually at scale creates technical debt that erodes the brand. This analysis evaluates all 10 options across five dimensions:

1. **Foundation time** — Time to implement the design system foundation (tokens, base components)
2. **Single-form calculator time** — Time to build a new single-form calculator (the most common archetype)
3. **Multi-step wizard time** — Time to build a new multi-step wizard
4. **Maintenance burden** — Per-tool ongoing customization and update cost
5. **Stack compatibility** — Fit with React 19 + Vite + Tailwind + shadcn/ui

---

## Per-Option Developer Experience

---

### Option 1: Wise-Inspired Trust Minimalism

**Architecture:** Hub + micro-apps. Private npm packages (`@angkin/ui`, `@angkin/tokens`).

**Foundation Time: 3–4 days**
- CSS custom properties + JS export + JSON design token pipeline
- Storybook setup for 5 core components (Button, Input, ResultCard, Navbar, CalculatorLayout)
- CI for `@angkin/tokens` and `@angkin/ui` versioning and publish
- Private npm registry or GitHub Packages setup

**Single-Form Calculator: 2–3 hours**
- `npm install @angkin/ui @angkin/tokens`
- Copy starter template from Storybook
- Define inputs, wire calculation logic, customize tool name/domain color
- Very low cognitive overhead — minimal variant surface

**Multi-Step Wizard: 4–6 hours**
- Foundation includes no native wizard component
- Must build `StepIndicator` + `StepContainer` + multi-pane routing
- Once built for tool #1, re-usable for all subsequent wizards (~1 hour after first)

**Maintenance Burden: Low**
- Token updates propagate via `npm update @angkin/ui`
- Independent micro-app deployment — broken build in tool #47 doesn't affect tool #3
- Minimal per-tool customization needed (only domain accent color and content)
- **Risk:** Private npm registry adds DevOps overhead

**Stack Compatibility: Excellent**
- Native React 19 + Vite
- Tailwind optional layer (tokens map cleanly to Tailwind theme extension)
- shadcn components can be imported and re-skinned using `@angkin/tokens`
- TypeScript-first token exports (`tokens.d.ts`)

**DX Score: 8/10** — Fast per-tool, solid architecture, minor overhead from private npm registry.

---

### Option 2: Gov.uk Radical Clarity

**Architecture:** Monolithic app (single domain `angkin.ph`). CSS-only, no framework required.

**Foundation Time: 1–2 days**
- Single `tokens.css` file with CSS custom properties
- Folder structure: `reset.css`, `layout.css`, `typography.css`, `button.css`, `form.css`, `card.css`, `utilities.css`
- No build pipeline required — HTML files link CSS directly
- Optionally wrap in React app with minimal adapter layer

**Single-Form Calculator: 2–3 hours**
- Copy HTML template
- Replace field labels/hints/placeholder text
- Add calculation logic in vanilla JS or TypeScript module
- Near-zero boilerplate — the CSS does the heavy lifting

**Multi-Step Wizard: 3–4 hours**
- CSS already handles progressive disclosure patterns
- JS step controller is straightforward (show/hide with ARIA)
- Minimal design system expansion needed

**Maintenance Burden: Very Low**
- Single CSS file serves all 148 tools from one domain
- CSS change propagates instantly to all tools
- No versioning or package publishing needed
- **Risk:** Monolithic app means one broken route can affect others (mitigated by client-side routing + error boundaries)

**Stack Compatibility: Moderate**
- Framework-agnostic CSS works everywhere
- **Friction:** No native React components — developers must build their own wrappers
- shadcn components must be entirely re-styled (fighting defaults)
- Tailwind integration requires custom preset (doable but non-trivial)
- **Best fit:** Vanilla JS or lightweight framework (Preact, Astro)

**DX Score: 7/10** — Simplest possible token system, but lacks React primitives. Stack friction with shadcn.

---

### Option 3: Filipino Warmth

**Architecture:** Hub + micro-apps with PWA support. CSS via CDN (`cdn.angkin.ph/design/v1/angkin.css`).

**Foundation Time: 2–3 days**
- `angkin-scaffold/` with base tokens + domain override files (labor.css, tax.css, property.css, ofw.css)
- Component CSS files + HTML templates for 3 archetypes (single-form, multi-step, lookup)
- `angkin.js` runtime (calculator utilities, count-up animation, accessibility helpers)
- CDN deployment pipeline

**Single-Form Calculator: 2–3 hours**
- Copy scaffold → set token overrides (2 variables for domain) → define inputs → implement logic
- Zero build step for static HTML tools
- `<link href="https://cdn.angkin.ph/design/v1/angkin.css">` and done

**Multi-Step Wizard: 3–5 hours**
- HTML template provided in scaffold
- JS step controller in `angkin.js` (no custom build needed)
- Tagalog-first micro-copy requires content writer involvement — adds coordination overhead

**Maintenance Burden: Low–Moderate**
- CDN-served CSS: all tools update simultaneously on version bump
- **Risk:** CDN versioning must be managed carefully (v1 → v2 migration affects all 148 tools at once)
- Tagalog content drift is the biggest maintenance risk — requires style guide enforcement
- Domain token overrides need governance as more domains are added

**Stack Compatibility: Moderate**
- CSS tokens work with any framework
- **Friction:** CDN-first model conflicts with Vite's local asset pipeline
- React 19 integration requires wrapping HTML templates as JSX (1–2 hours one-time)
- shadcn re-styling required
- Tailwind preset: doable with custom plugin

**DX Score: 7/10** — Zero-build simplicity is elegant but CDN model adds coordination overhead at scale.

---

### Option 4: Stripe-Grade Developer System

**Architecture:** Shared npm package (`@angkin/system`) + independent micro-apps.

**Foundation Time: 4–6 days**
- `tokens.json` → `tokens.css` + `tokens.js` + `tokens.d.ts` build pipeline (Style Dictionary or equivalent)
- Core component library with prop-typed API
- `config.js` template system (`toolName`, `toolCode`, `domainColor`, `inputs[]`)
- Storybook documentation (all components documented with usage examples)
- Semantic versioning + changelog automation
- Private npm registry setup

**Single-Form Calculator: 3–4 hours**
- Copy `templates/single-form.html` (or React template)
- Edit `config.js` (5 fields) + `compute.js` (calculation logic)
- Tokens already wired — no CSS work needed
- TypeScript autocomplete via `tokens.d.ts` reduces lookup time

**Multi-Step Wizard: 4–6 hours**
- Step indicator + multi-pane container built as system component
- Config-driven: `wizard: { steps: [...] }` in config.js
- After first wizard, subsequent wizards are ~2 hours (config only)

**Maintenance Burden: Low**
- Automated token linting in CI catches drift immediately
- Bi-monthly "system harvest" to extract common patterns from tool-specific code
- Semantic versioning means tools can pin versions independently
- **Risk:** Higher upfront investment; early tools may be built before system is complete

**Stack Compatibility: Excellent**
- Purpose-built for React 19 + Vite
- Token architecture maps directly to CSS custom properties (Tailwind theme extension trivial)
- shadcn components are styled via `tokens.css` overrides (clean integration)
- TypeScript-first throughout

**DX Score: 9/10** — Highest upfront cost, but best scaling economics. The right choice for a 148-tool portfolio.

---

### Option 5: Playful Utility

**Architecture:** Hub + micro-apps. CSS via CDN + optional npm package.

**Foundation Time: 2–3 days**
- `tokens/` (base.css, colors.css, domains.css), `components/` CSS files
- `angkin-playful.css` barrel export
- `angkin-interactions.js` for animations
- CDN deployment + npm CLI tool (`npx angkin-new`)
- Domain taxonomy JSON (needed by tool #30 to automate "related tools")

**Single-Form Calculator: 1–2 hours** (fastest of all options for experienced dev)
- `npx angkin-new retire-math --domain labor --inputs "salary,years"` scaffolds the full HTML
- Developer fills in calculation logic only
- Zero CSS work if using CLI
- CDN link handles all styling

**Multi-Step Wizard: 3–4 hours**
- HTML template provided in scaffold
- Step controller in `angkin-interactions.js`
- Illustration assets need to be sourced per tool (coordination with design team)

**Maintenance Burden: Low**
- CDN CSS auto-updates all tools
- CLI generator reduces tool creation to ~1 hour for experienced devs
- **Risk:** Bold color choices + illustrations require ongoing design team involvement
- Domain taxonomy JSON must be maintained as tool count grows

**Stack Compatibility: Moderate**
- CSS tokens work with React + Vite
- CLI outputs HTML (JSX conversion needed for React projects)
- shadcn integration requires significant re-styling (bold aesthetic conflicts with shadcn defaults)
- Tailwind: custom preset with bold color scale maps cleanly

**DX Score: 8/10** — CLI generator is a standout DX feature. Visual complexity (illustrations, bold colors) adds design-team dependency.

---

### Option 6: Editorial Calculator

**Architecture:** Content hub + embedded tools. Next.js SSG/ISR.

**Foundation Time: 3–5 days**
- Next.js project setup with MDX support
- `tokens/` + `components/` CSS (masthead, article, law-box, calculator, result, footer)
- Two layout templates (two-column, single-column)
- MDX authoring pipeline + Contentlayer (or similar) for frontmatter
- ISR configuration for build time at scale

**Single-Form Calculator: 4–6 hours**
- Copy MDX template + replace content (headline, article body, law box text, calculator fields)
- **Content writing is the bottleneck** — technical setup is ~30 minutes
- Requires content writer + developer collaboration per tool
- Law box (source citation) needs legal review for accuracy

**Multi-Step Wizard: 6–10 hours**
- MDX article metaphor breaks for multi-step; requires separate wizard template
- Must be built by tool #30 (15% of tools need it)
- Once built, reusable; but higher per-tool effort than other options

**Maintenance Burden: High**
- Every tool has an article that must be maintained for accuracy (Philippine law changes)
- Legal accuracy of content is an ongoing editorial obligation
- Next.js version upgrades affect entire site at once
- **Risk:** Content production bottleneck is the hardest to scale — needs dedicated writer(s)

**Stack Compatibility: Good**
- Next.js is excellent with React 19
- Vite can be used for non-SSG builds
- Tailwind works well with Next.js
- shadcn components can be used for calculator UI within articles
- **Friction:** MDX pipeline adds complexity; Vite-only projects need adaptation

**DX Score: 6/10** — Technical setup is fast but content production bottleneck makes this the highest-cost option per tool.

---

### Option 7: Dashboard-Native Power Tool

**Architecture:** Single SaaS SPA. React 19 + Vite + Tailwind + shadcn (customized to dark theme).

**Foundation Time: 3–4 days**
- React 19 + Vite + React Router v7 + Tailwind + shadcn setup
- Dark theme token override layer on shadcn
- App shell (sidebar, top-bar) + tool layout templates
- Command palette (static JSON index)
- History system (localStorage)
- Route-level code splitting configuration

**Single-Form Calculator: 40–70 minutes** (fastest of all options)
1. Copy `templates/single-form.html`
2. Set `data-domain` on `<body>` tag
3. Fill: tool title, subtitle, form fields, calculation JS, result labels
4. Set keyboard shortcut metadata
- No CSS work, no content writing, no token setup
- Identical pattern for every tool

**Multi-Step Wizard: 2–3 hours**
- Wizard component already in dashboard system
- Add step definitions to config
- History and progress tracking come for free from app shell

**Maintenance Burden: Low (technical) / Moderate (UX)**
- Single codebase — updates to shell components propagate to all 148 tools
- Route-level code splitting prevents bundle bloat
- **Risk:** Dark-only design requires careful testing on low-quality screens
- Command palette index must be regenerated on each new tool addition (automated via CI)

**Stack Compatibility: Excellent** (native fit)
- Purpose-built on React 19 + Vite + Tailwind + shadcn
- shadcn components are the foundation, not a constraint to fight
- Tailwind theme extension maps directly to dark token system
- TypeScript throughout
- **Best stack alignment of all 10 options**

**DX Score: 9/10** — Fastest per-tool spin-up. Perfect stack alignment. Dark-only risk is manageable.

---

### Option 8: Mobile-First Micro-App

**Architecture:** Independent PWAs. CSS via CDN. One domain per tool (`retiremath.angkin.ph`).

**Foundation Time: 2–3 days**
- `colors.css`, `typography.css`, `spacing.css`, `components.css`, `animations.css`
- `index.css` barrel export + CDN deployment
- PWA manifest template + service worker template
- Hub directory app (`angkin.ph`)

**Single-Form Calculator: ~45 minutes** (tied with Option 7 as fastest)
- 5 min: Link `cdn.angkin.ph/tokens/v1/index.css`
- 5 min: HTML shell setup (PWA manifest copy)
- 20 min: Tool-specific input fields
- 10 min: JS calculation logic
- 5 min: PWA manifest customization (name, icon)

**Multi-Step Wizard: 2–3 hours**
- CSS handles card transitions
- JS step controller is lightweight (show/hide + progress indicator)
- PWA installability preserved across all archetypes

**Maintenance Burden: Very Low (per-tool)**
- Isolated PWAs: a broken tool doesn't affect others
- CDN tokens update all tools simultaneously (with version pinning available)
- Service workers cache assets locally — updates require explicit version bump
- **Risk:** 148 separate subdomains = 148 SSL certificates (Cloudflare wildcard handles this)
- **Discovery risk:** Fragmented URLs make tool-to-tool navigation harder

**Stack Compatibility: Moderate**
- CSS tokens are framework-agnostic
- **Friction:** Independent PWA model is misaligned with monorepo Vite setup
- React 19 can be used per-tool, but adds weight to a lightweight PWA (tradeoff)
- shadcn components are too heavy for PWA target (50KB total)
- Tailwind can be used with PurgeCSS to keep bundles small

**DX Score: 7/10** — Fastest per-tool spin-up, but independent PWA model conflicts with monorepo and adds ops overhead (148 deployments, 148 manifests).

---

### Option 9: Soft Institutional

**Architecture:** Hub + micro-apps. Private npm package (`@angkin/core`).

**Foundation Time: 3–4 days**
- `packages/core/` with tokens.css, typography.css, component CSS, layout templates
- React component wrappers (`<ToolShell>`, `<Calculator>`, `<Input>`, `<ComputeButton>`, `<ResultCard>`)
- Tailwind preset (`tailwind.config.js` mapping tokens to utility classes: `bg-surface`, `text-primary`)
- Private npm registry + versioning

**Single-Form Calculator: 2–3 hours**
- `<ToolShell tool="RetireMath" domain="labor" byline="by Angkin">`
- Define inputs, implement calculation logic, customize domain color override (5 min)
- Tailwind utility classes (`bg-surface`, `text-primary`, etc.) for layout work
- React prop API is pleasant to use

**Multi-Step Wizard: 3–5 hours**
- No native wizard component — must build
- `<StepIndicator>` + multi-pane `<CalculatorStep>` component
- Spot illustration per step (requires design team involvement at first)

**Maintenance Burden: Low**
- Tailwind preset means developers don't need to know token names
- Google Fonts adds ~80KB per page (WOFF2 + WOFF) — shared cache helps at scale
- Atkinson Hyperlegible is system-familiar, reducing font loading anxiety
- **Risk:** Cormorant Garamond is beautiful but unfamiliar to PH developers; requires design onboarding

**Stack Compatibility: Very Good**
- React 19 + Vite native
- Tailwind preset integration is the highlight — developers use familiar utility class syntax
- shadcn components can be re-skinned using Tailwind preset overrides
- `@angkin/core` as npm dependency fits existing monorepo patterns (similar to `@angkin/ui` in Option 1)

**DX Score: 8/10** — Best Tailwind integration of all options. Solid React API. Minor friction from serif font complexity.

---

### Option 10: Bold Geometric

**Architecture:** Single SaaS app. CSS + vanilla JS. Vite build.

**Foundation Time: 2–3 days**
- `tokens/` (base.css, semantic.css, domain-*.css)
- `typography.css`, `spacing.css`, `motion.css`
- `data-domain` attribute system for automatic domain theming
- Vite config for CSS bundling + JS module loading
- Tool index page + domain-specific navigation

**Single-Form Calculator: ~3 hours**
- `<div class="angkin-shell" data-domain="labor">` wrapper
- Fill tool header, inputs, result labels
- Add `retire-math.js` calculation module (loaded on demand)
- Zero CSS work — `data-domain` handles domain theming automatically

**Multi-Step Wizard: 3–4 hours**
- `motion.css` handles step transitions
- JS step controller wired to animation classes
- Bold geometric style is compatible with progress indicators

**Maintenance Burden: Low**
- Single CSS bundle (12KB gzip) serves all 148 tools
- `data-domain` makes domain theming declarative and consistent
- Dark theme requires testing on low-quality screens and in outdoor light
- **Risk:** Dark-only mode (similar to Option 7 risk) — light mode must ship as real feature by tool #50
- Typography scale (Bebas Neue for results) is iconic but requires font licensing verification

**Stack Compatibility: Good**
- Vite-native
- CSS custom properties integrate with Tailwind theme extension
- shadcn re-styling required (dark aesthetic, geometric forms conflict with shadcn light defaults)
- React 19 compatible — vanilla JS modules can be replaced with React hooks
- JetBrains Mono is already used in developer-facing tools in the stack

**DX Score: 8/10** — `data-domain` attribute system is elegant. Geometric style requires disciplined design governance.

---

## Comparative Estimates Table

| Option | Foundation | Single-Form | Multi-Step Wizard | Maintenance | Stack Compat |
|--------|-----------|-------------|-------------------|-------------|--------------|
| 1: Trust Minimalism | 3–4 days | 2–3 hrs | 4–6 hrs | Low | Excellent |
| 2: Radical Clarity | 1–2 days | 2–3 hrs | 3–4 hrs | Very Low | Moderate |
| 3: Filipino Warmth | 2–3 days | 2–3 hrs | 3–5 hrs | Low–Moderate | Moderate |
| 4: Stripe-Grade | 4–6 days | 3–4 hrs | 4–6 hrs | Low | Excellent |
| 5: Playful Utility | 2–3 days | **1–2 hrs** | 3–4 hrs | Low | Moderate |
| 6: Editorial | 3–5 days | 4–6 hrs | 6–10 hrs | **High** | Good |
| 7: Dashboard Native | 3–4 days | **40–70 min** | 2–3 hrs | Low | **Excellent** |
| 8: Mobile-First PWA | 2–3 days | **~45 min** | 2–3 hrs | Very Low | Moderate |
| 9: Soft Institutional | 3–4 days | 2–3 hrs | 3–5 hrs | Low | Very Good |
| 10: Bold Geometric | 2–3 days | ~3 hrs | 3–4 hrs | Low | Good |

---

## Key Findings

### Fastest Per-Tool Spin-Up
**Options 7 and 8 tie** at 40–45 minutes for a single-form calculator. Option 5 with its CLI generator approaches this for experienced developers.

### Best Stack Alignment (React 19 + Vite + Tailwind + shadcn)
**Option 7** is the native-fit champion — it's purpose-built on the existing stack. **Option 4** (Stripe-Grade) is second, with its token architecture designed for React/Vite/TypeScript. **Option 9** wins on Tailwind integration specifically, with its preset pattern.

### Highest Foundation Investment, Highest Return
**Option 4** costs the most upfront (4–6 days) but delivers the cleanest 148-tool economics. Its per-tool marginal cost approaches zero as the team internalizes the config-driven pattern. At 148 tools, the foundation investment is amortized over every future tool.

### Worst Choice for Developer Experience
**Option 6 (Editorial Calculator)** has the highest per-tool cost because content production cannot be parallelized or automated. Each tool requires a legal-accurate article, which demands writer + legal reviewer time beyond the developer. At 148 tools, this is a multi-month editorial project.

### Most Dangerous Scaling Trap
**Option 8 (Mobile-First PWA)** has the fastest single-tool setup but creates operational debt: 148 separate deployments, 148 PWA manifests, 148 service workers to maintain. Discovery (hub routing) becomes a second application to build and maintain.

### Hidden Cost: Framework Friction
Options 2, 3, and 5 use CSS-only/vanilla-JS-first approaches. They are fastest for developers who write plain HTML, but require adaptation for React 19 projects — JSX conversion of HTML templates, Tailwind preset creation, and shadcn re-styling all add 4–8 hours of one-time cost per tool type.

### The Monorepo-Native Choice
For a team already running a React 19 + Vite + Tailwind + shadcn monorepo (as evidenced by `apps/taxklaro`, `apps/inheritance`), **Option 7** or **Option 4** integrate most cleanly. Option 4 adds design-system governance that prevents drift. Option 7 is faster to ship.

---

## Recommendation for Stack Fit

**If speed to 148 tools is the priority:** Option 7 (Dashboard Native) — 40-minute per-tool spin-up, zero CSS work, native stack.

**If long-term design system quality is the priority:** Option 4 (Stripe-Grade) — highest foundation investment, best governance tooling, cleanest token architecture at scale.

**Hybrid possibility:** Option 4's token architecture + Option 7's component API — a Stripe-grade token layer consumed by a dashboard-style React app. This "Design System Option 4, UI Shell Option 7" hybrid delivers both long-term governance and fast per-tool velocity.

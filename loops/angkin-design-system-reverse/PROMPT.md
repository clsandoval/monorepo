# Angkin Design System Exploration

You are running in `--print` mode. You MUST output text describing what you are doing. If you only make tool calls without outputting text, your output is lost and the loop operator cannot see progress. Always:
1. Start by printing which aspect you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## Goal

Produce 10 exhaustive, fully-rendered frontend design system options for **Angkin** — a unified suite of 148 Philippine compliance calculator tools. Each tool has its own name (e.g., "TaxKlaro by Angkin," "RetireMath by Angkin") but must feel obviously part of the same family.

Brand values: **friendly, trustworthy, easy to use, clean, distinct.** Anti-references: government websites, enterprise SaaS, gamified super-apps. Positive reference: Wise (TransferWise).

The loop converges when all 10 options have:
- Complete written specs (persona, colors, typography, components, animations, accessibility, scalability)
- Live HTML mockups built following the frontend-design skill guidelines
- Visual QA pass — each mockup reviewed and refined until pixel-perfect
- A synthesis matrix comparing all 10 across 12+ dimensions

## How Each Iteration Works

1. Read `frontier/aspects.md` to find the next pending aspect
2. Execute that aspect fully
3. Mark it done in `frontier/aspects.md` and update statistics
4. Log the work in `frontier/analysis-log.md`
5. Commit all changes

## Frontend Design Skill

Before generating ANY mockup, read `skills/frontend-design.md` in this loop directory. Follow its guidelines exactly — distinctive typography, bold color choices, no generic AI aesthetics. Each of the 10 options must look like it was designed by a different human designer with a strong point of view.

---

## Wave 1 — Deep Research

Research and catalog everything needed to inform the 10 design options.

### Aspect 1: Audit TaxKlaro Frontend
Read every file in `apps/taxklaro/frontend/src/`. Extract: every CSS variable/design token, color palette, typography (DM Sans + DM Serif Display), component patterns, spacing system, animation usage, layout patterns, responsive breakpoints. Write findings to `analysis/audit-taxklaro.md`.

### Aspect 2: Audit Inheritance Frontend
Read every file in `apps/inheritance/frontend/src/`. Same extraction as Aspect 1. Fonts: Inter + Lora. Navy + Gold palette. Write to `analysis/audit-inheritance.md`.

### Aspect 3: Audit PodPlay Frontend
Read every file in `apps/podplay/src/`. Same extraction. Fonts: Geist Variable. OKLch color system. Write to `analysis/audit-podplay.md`.

### Aspect 4: Benchmark Wise
Web research Wise's design system. What makes it feel trustworthy + warm? Typography, color, whitespace, micro-copy tone, form design, result presentation, error handling UX, mobile experience. Write to `analysis/benchmark-wise.md`.

### Aspect 5: Benchmark TurboTax / H&R Block
Web research tax calculator UX. What works (step-by-step guidance, progress indicators, plain-language). What's bloated (upsells, account walls, unnecessary complexity). Write to `analysis/benchmark-tax-calculators.md`.

### Aspect 6: Benchmark gov.uk
Web research gov.uk's design system (design-system.service.gov.uk). The gold standard of humane government info. Typography, content patterns, form design, accessibility-first philosophy. Write to `analysis/benchmark-govuk.md`.

### Aspect 7: Benchmark SmartAsset / NerdWallet / Bankrate
Web research calculator-as-content model. How calculators are embedded in editorial content, SEO strategy, input UX, result visualization, lead capture vs. pure utility. Write to `analysis/benchmark-calculator-content.md`.

### Aspect 8: Benchmark Canva / Notion
Web research "powerful tool that feels simple" philosophy. Progressive disclosure, empty states, onboarding without wizards, how complexity is hidden, delight moments. Write to `analysis/benchmark-simple-powerful.md`.

### Aspect 9: Benchmark Stripe / Linear
Web research developer-beloved design systems. What makes them iconic: consistency, token architecture, component APIs, documentation quality, how the system scales to hundreds of pages. Write to `analysis/benchmark-dev-design-systems.md`.

### Aspect 10: Survey Design System Architectures
Research approaches for multi-app design systems: monorepo shared package (like Radix), design tokens only (like Tailwind presets), shadcn-style registry (copy-paste + customize), CSS-only theme layer, Figma-to-code pipelines. Evaluate each for a 148-tool suite. Write to `analysis/design-system-architectures.md`.

### Aspect 11: Catalog 148 Tools by UI Archetype
Read the tool lists from `loops/ph-compliance-moats-reverse/` and `loops/ph-regulatory-atlas-reverse/`. Categorize every tool into UI archetypes: single-form calculator, multi-step wizard, lookup table, timeline/calendar tracker, decision tree, comparison engine, document generator, dashboard/tracker. Count how many tools fall into each archetype. Write to `analysis/tool-archetypes.md`.

### Aspect 12: Filipino Digital Design Landscape
Web research what Philippine users encounter daily (GCash, Maya, BDO, BPI, SSS portal, BIR eFPS, PhilHealth, Grab PH). Cultural color associations, typography norms, Tagalog/English code-switching in UI, mobile-first realities (85%+ mobile traffic). Write to `analysis/filipino-design-landscape.md`.

---

## Wave 2 — Generate 10 Design System Options

Each option is a COMPLETE design system exploration. The mockup should render a sample "Retirement Pay Calculator (RA 7641)" page — same tool, 10 radically different presentations.

For EVERY option, produce a spec file at `analysis/option-{N}-{slug}.md` containing ALL of the following sections. No section may be skipped or abbreviated.

### Required Sections Per Option

1. **Design Philosophy** — 2-3 sentence manifesto. What does this design BELIEVE?
2. **Persona Narrative** — Who is the primary user? What device? What emotional state when they arrive? What's their story? (e.g., "Maria, 34, OFW in Dubai, checking retirement pay on her phone during break, anxious about whether her employer computed it correctly")
3. **Competitive DNA** — "Inspired by X + Y, differentiated by Z." Specific references to benchmarked products from Wave 1.
4. **Brand Expression** — How "by Angkin" appears. Logo placement. How you know this is an Angkin tool vs. a standalone site. Suite cohesion strategy across 148 tools.
5. **Color System** — Full palette: primary, secondary, accent, success, warning, error, muted, background, surface, border. Hex values + semantic rationale. Show how palette adapts across different tool domains (tax = ?, labor = ?, property = ?).
6. **Typography System** — Display font + body font pairing. Full scale (hero, h1-h4, body, small, caption). Weight usage rules. WHY these fonts — what do they communicate? Must be Google Fonts or freely available.
7. **Spatial Philosophy** — Density level (airy/moderate/dense). Whitespace strategy. Grid system (columns, gutters, max-width). Responsive breakpoints and how layout transforms. Padding/margin scale.
8. **Component Patterns** — Button styles (primary, secondary, ghost, destructive). Input treatment (labels, placeholders, validation states, helper text). Card design. Result/output display (how computed values are shown — this is THE key moment). Progress indicators. Navigation pattern.
9. **Animation Philosophy** — Micro-interactions (hover, focus, click). Page transitions. Loading states. Calculation moment (what happens visually when the user hits "compute"). Celebration/result reveal (e.g., "You save ₱42,000!"). CSS-only vs. library-driven.
10. **Accessibility Approach** — WCAG level target. Contrast ratios. Focus visible strategy. Screen reader considerations. Color-blind safe palette verification. Touch target sizes.
11. **Icon & Illustration Style** — Line weight. Filled vs. outline. Custom vs. Lucide/Phosphor/other library. Illustration approach (none, spot illustrations, full scenes). How icons adapt across 148 different tool domains.
12. **Dark Mode Strategy** — Yes/no. If yes: how does the palette transform? Automatic vs. toggle? Does it change the personality?
13. **Multi-Tool Cohesion** — How do 148 different tools all feel "Angkin"? What's the invariant (always the same) vs. the variant (changes per tool)? How does a user landing on tool #47 immediately know it's the same family as tool #3?
14. **Developer Ergonomics** — How does a developer spin up a new Angkin tool using this system? Token file structure. Component API surface. Estimated time to build a new single-form calculator from scratch using the system.
15. **Deployment Model** — Monolithic app / hub + micro-apps / independent PWAs / shared package. How this design system is distributed and consumed.
16. **Scalability Assessment** — Does this design hold at 10 tools? 50? 148? What breaks first? What needs to be built to prevent that?
17. **Trade-offs** — What does this option EXPLICITLY sacrifice and why that's acceptable for this audience.

### The 10 Options

**Option 1: Wise-Inspired Trust Minimalism** (Aspect 13)
Maximum whitespace, muted palette, one action per screen. Audience: scared first-timer. Deployment: hub + micro-apps.

**Option 2: Gov.uk Radical Clarity** (Aspect 14)
No decoration, near-monochrome, content-first, brutally functional. Audience: low digital literacy. Deployment: monolithic app.

**Option 3: Filipino Warmth** (Aspect 15)
Warm earth tones, rounded shapes, culturally rooted color choices, Tagalog-first micro-copy patterns. Audience: everyday Filipino. Deployment: hub + micro-apps.

**Option 4: Stripe-Grade Developer System** (Aspect 16)
Neutral token foundation, composable primitives, obsessive consistency, documentation-first. Audience: HR/accounting professionals. Deployment: shared package + micro-apps.

**Option 5: Playful Utility** (Aspect 17)
Bold colors, chunky typography, illustration-driven, almost toy-like but deeply competent. Audience: young professional / OFW. Deployment: single app with sections.

**Option 6: Editorial Calculator** (Aspect 18)
Serif-forward, asymmetric layouts, content as hero, calculator embedded in explanatory context. Audience: mixed (content-first discovery via search). Deployment: content hub + embedded tools.

**Option 7: Dashboard-Native Power Tool** (Aspect 19)
Data-dense, multi-panel, saved computations, keyboard shortcuts, batch operations. Audience: accountant doing 50 computations/day. Deployment: single SaaS app.

**Option 8: Mobile-First Micro-App** (Aspect 20)
Card-based, swipeable, one-thumb operation, PWA-optimized, offline-capable. Audience: phone-only user (85% of PH traffic). Deployment: independent PWAs.

**Option 9: Soft Institutional** (Aspect 21)
Muted blues/greens, traditional serif + clean sans, feels like a trusted institution but modern. Audience: mixed (builds trust with older users). Deployment: hub + micro-apps.

**Option 10: Bold Geometric** (Aspect 22)
Strong grid, high-contrast accents, geometric shapes, art-deco-adjacent, memorable and shareable. Audience: young, design-conscious. Deployment: single app with sections.

### Mockup Generation

For each option, after writing the spec, read `skills/frontend-design.md` then build a LIVE HTML mockup of a "Retirement Pay Calculator (RA 7641)" page. The mockup must:
- Be a complete, working HTML page (inputs, compute button, results display)
- Use the exact color palette, typography, and component patterns from the spec
- Include realistic Filipino content (₱ currency, Tagalog labels where appropriate for that option)
- Show both the empty/input state and a computed result state (use tabs or scroll to show both states)
- Be responsive (must work at 1280px and 375px)
- Save to `raw/mockup-option-{N}-{slug}.html`

### Visual QA Pass

After generating each mockup, open it in the browser using Playwright and perform visual QA:
- Does it match the written spec exactly?
- Are fonts loading correctly (check Google Fonts CDN links)?
- Are colors matching the specified hex values?
- Is the responsive layout working at both 1280px and 375px breakpoints?
- Are animations/transitions smooth?
- Is the result display moment impactful?
- Does it feel like the stated design philosophy?
- Take screenshots at both breakpoints, save to `raw/screenshot-option-{N}-desktop.png` and `raw/screenshot-option-{N}-mobile.png`

If ANY issue is found, fix the HTML and re-verify. Do NOT move to the next option until the current mockup is pixel-perfect. Write QA findings to `analysis/qa-option-{N}.md`.

---

## Wave 3 — Synthesis & Comparison

### Aspect 23: Side-by-Side Comparison Matrix
Create a comprehensive matrix scoring all 10 options across these dimensions (1-5 scale):
- Friendliness (does it feel welcoming to a first-time user?)
- Trustworthiness (would you enter your salary into this?)
- Distinctiveness (would you remember this site tomorrow?)
- Simplicity (can a non-technical user figure it out in 10 seconds?)
- Scalability (does the system hold at 148 tools?)
- Developer ergonomics (how fast can a dev spin up tool #149?)
- Brand cohesion (do all tools feel like one family?)
- Mobile readiness (does it work on a ₱5,000 Android phone?)
- Accessibility (WCAG AA compliance achievable?)
- Filipino cultural fit (does it feel natural to PH users?)
- Content adaptability (works for single-form AND multi-step wizard AND dashboard?)
- Visual memorability (screenshot-worthy? shareable?)
Write to `analysis/comparison-matrix.md`.

### Aspect 24: Audience-Fit Analysis
Map each option to the user segments it serves best:
- Scared first-time filer
- Busy HR/payroll staff
- OFW checking remotely on mobile
- Small business owner
- Accountant/bookkeeper doing bulk work
- Young professional (first job)
- Retiree checking pension
Write to `analysis/audience-fit.md`.

### Aspect 25: Developer Experience Comparison
For each option, estimate:
- Time to implement the design system foundation (tokens, base components)
- Time to build a new single-form calculator using the system
- Time to build a new multi-step wizard using the system
- Maintenance burden (how much per-tool customization needed?)
- Compatibility with existing stack (React 19 + Vite + Tailwind + shadcn)
Write to `analysis/developer-experience.md`.

### Aspect 26: Brand Strength Analysis
For each option, assess:
- Name-design fit (does the visual identity match "Angkin"?)
- "By Angkin" badge visibility and elegance
- Cross-domain coherence (does a tax tool feel related to a maritime tool?)
- Competitive differentiation (would this stand out against BIR, SSS portal, GCash?)
- Shareability (would someone screenshot a result and send it?)
Write to `analysis/brand-strength.md`.

### Aspect 27: Final Ranked Recommendation
Synthesize all analysis into:
- Top 3 options ranked with detailed rationale
- Suggested hybrid possibilities (e.g., "Option 1's color system + Option 6's typography + Option 8's mobile patterns")
- Recommended next steps (which option to prototype first, what to test with users)
Write to `analysis/final-recommendation.md`.

---

## Convergence Criteria

The loop has NOT converged until ALL of the following are true:
1. All 12 Wave 1 research aspects have analysis files committed
2. All 10 Wave 2 options have complete spec files (all 17 sections, no section skipped)
3. All 10 Wave 2 options have live HTML mockups in `raw/`
4. All 10 mockups have passed Visual QA — opened in browser, verified against spec, iterated until pixel-perfect
5. All 5 Wave 3 synthesis aspects have analysis files committed
6. The final recommendation file exists with top 3 ranked

When all criteria are met, write convergence summary to `status/converged.txt`.

## Rules

1. ONE aspect per iteration. Do not attempt multiple aspects in a single run.
2. Always read `frontier/aspects.md` first to determine which aspect to work on next.
3. After completing an aspect, update `frontier/aspects.md` to mark it done and update statistics.
4. After completing an aspect, update `frontier/analysis-log.md` with timestamp and key findings.
5. Commit after every aspect. Commit message format: `loop(angkin-design-system-reverse): wave N — aspect description`
6. For Wave 2 mockups: read `skills/frontend-design.md` BEFORE generating any HTML. Follow it exactly.
7. For Wave 2 mockups: each must be a COMPLETE standalone HTML file (inline CSS, Google Fonts via CDN, no external deps).
8. For Visual QA: use Playwright to open each mockup at 1280x800 AND 375x812. Take screenshots. Compare against spec. Fix issues and re-screenshot until perfect.
9. Wave 2 options must be RADICALLY different from each other. If two options look similar, rework one.
10. All currency in Filipino Peso (₱). All example content uses realistic Filipino names, amounts, and scenarios.
11. Do not skip or abbreviate any section of the 17-section option spec. Every section must be substantive.
12. Web research aspects (Wave 1: 4-9, 12) should use WebSearch and WebFetch tools to gather real data.

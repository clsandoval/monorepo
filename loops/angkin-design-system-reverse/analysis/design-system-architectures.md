# Design System Architectures — Survey for Angkin (148-Tool Suite)

> **Aspect 10 of 27 | Wave 1 — Deep Research**
> Research date: 2026-03-10

---

## Executive Summary

Five architectures are viable for a 148-tool design system. This analysis evaluates each on its own terms, then scores them against Angkin's specific constraints: React 19 + Vite + Tailwind + shadcn stack, Philippine compliance domain, team likely small (< 10 devs), 148 tools that need to feel unified but can deploy independently, and a primary goal of getting new tools live quickly without diverging from brand.

**Recommended hybrid (preview):** Tailwind CSS Preset (tokens layer) + shadcn-style Registry (component layer) + monorepo workspace (coordination layer). Figma pipeline optional but worth scaffolding early. CSS-only theme layer lives inside the preset.

---

## Architecture 1: Monorepo Shared Package (Radix/Chakra-style)

### What It Is

A dedicated `packages/ui` package inside a monorepo workspace. All 148 tools consume it as a local workspace dependency (`@angkin/ui: "workspace:*"`). Components are fully built and published — consumers import from `@angkin/ui`, never from source. The package owns all JSX, styles, and types.

Classic examples: Radix UI (component primitives), Chakra UI, MUI, Mantine.

### How It Works in Practice

```
angkin-monorepo/
├── packages/
│   ├── ui/                    # @angkin/ui — the design system package
│   │   ├── src/
│   │   │   ├── components/    # Button, Input, Card, etc.
│   │   │   ├── tokens/        # Design tokens (colors, spacing, etc.)
│   │   │   └── index.ts       # Public API surface
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tokens/                # Optional: tokens-only sub-package
│   └── config-tailwind/       # Shared Tailwind preset
├── apps/
│   ├── taxklaro/              # Tool #1
│   ├── retirement-pay/        # Tool #2
│   ├── sss-contribution/      # Tool #3
│   └── ...                    # Tools #4–#148
└── turbo.json                 # Turborepo task graph
```

**Developer workflow:** Build `@angkin/ui` locally with `turbo watch`, which hot-reloads changes into all consuming apps simultaneously. No publish step for local dev. For external consumers or staging, publish to npm or a private registry.

### Strengths

- **Atomic cross-tool changes:** Update a Button component once → all 148 tools get it in the same PR. Critical for brand refresh scenarios.
- **Type safety at scale:** TypeScript component APIs enforced across all tools. Breaking changes caught by the build.
- **Storybook as documentation:** Single Storybook for `@angkin/ui` documents all components with all variants. The component spec IS the implementation.
- **CI graph-awareness:** Turborepo knows which apps depend on which packages. Change `Button` → only affected app tests re-run. Massive CI time savings at 148 tools.
- **Versioning:** Can tag releases (v1.2.0). Tools can pin to a version and upgrade deliberately. Important when backward-incompatible changes are needed.
- **Industry standard:** This is how Stripe, Linear, and every large-scale design system works. Maximum hiring/onboarding alignment.

### Weaknesses

- **Abstraction overhead:** Every new component pattern must be designed and built in `@angkin/ui` before it can be used. Slows down tool #3 when you're still figuring out your design language.
- **Over-generalization risk:** Components built for Tool #1 (single-form calculator) may not serve Tool #47 (multi-step wizard) well. The API surface grows with edge cases.
- **Build pipeline complexity:** Requires tsup/rollup for the package build, peer dependency management, TypeScript path aliases that work across all consuming apps.
- **Version drift:** If some tools don't update, you end up with Tool #1 on `@angkin/ui@2.1` and Tool #47 on `@angkin/ui@1.8`. Mitigated by monorepo workspace protocol but requires discipline.

### Fit for 148-Tool Angkin Suite

| Criterion | Score | Notes |
|-----------|-------|-------|
| Speed to first tool | 3/5 | Package setup overhead upfront |
| Speed to tool #50 | 5/5 | Excellent — system pays off at scale |
| Brand consistency | 5/5 | Maximum — one source of truth |
| Per-tool customization | 3/5 | Needs escape hatches, can be too rigid |
| Developer ergonomics | 4/5 | Great once established, setup is work |
| Philippine compliance fit | 4/5 | Good for any domain |

**When it breaks:** If tools have wildly different layouts (some single-form, some dashboards, some wizards), the shared component library starts needing too many props and variants. Solve with composition over configuration.

---

## Architecture 2: Design Tokens Only (Tailwind Preset)

### What It Is

The design system distributes nothing but a **Tailwind CSS preset** (a shared `tailwind.config.js` object) and optionally a CSS file of custom properties. Components are not shared. Each tool builds its own components using the shared token vocabulary — the same class names (e.g., `bg-brand-primary`, `text-body`, `rounded-card`) mean the same thing across all tools.

### How It Works in Practice

```
packages/
├── config-tailwind/           # @angkin/tailwind-preset
│   ├── index.js               # exports the preset object
│   ├── tokens.js              # all design tokens as JS values
│   └── package.json
```

Each tool's `tailwind.config.js`:
```js
import angkinPreset from '@angkin/tailwind-preset'

export default {
  presets: [angkinPreset],
  content: ['./src/**/*.tsx'],
  // Per-tool overrides here
}
```

The preset defines:
```js
export default {
  theme: {
    colors: {
      brand: { primary: '#1D4ED8', ... },
      success: '#0f7a52',
      error: '#ca3535',
      // ...
    },
    fontFamily: {
      display: ['DM Serif Display', 'serif'],
      body: ['DM Sans', 'sans-serif'],
    },
    spacing: { /* 4px base scale */ },
    borderRadius: { card: '12px', input: '8px', ... },
    // etc.
  }
}
```

In Tailwind 4, this becomes even simpler — tokens live in a `@theme` CSS block that can be imported as a single CSS file:
```css
@import "@angkin/tokens"; /* imports all CSS custom properties */
```

### Strengths

- **Zero build complexity:** No package to compile. Just a config file. Any tool can adopt it by changing one line of `tailwind.config.js`.
- **Maximum per-tool freedom:** Each tool builds exactly the components it needs. Tool #1 (single-form) can be minimal. Tool #47 (dashboard) can be complex.
- **Easy override:** A tool that needs a slightly different button style can just write `bg-brand-primary hover:bg-brand-dark` without fighting a component API.
- **Fastest to first tool:** Designer decides on tokens, dev spends 30 minutes on the preset file, and Tool #1 is building with correct colors/typography immediately.
- **No dependency drift:** Tokens are so simple that upgrading is trivial. No breaking component APIs.
- **Perfect for Tailwind + shadcn stack:** shadcn already uses Tailwind + CSS variables. The preset IS the design system layer that makes shadcn look like Angkin.

### Weaknesses

- **Consistency requires discipline:** If each tool builds its own Button, you get 148 subtly different Buttons by month 6. Design drift accumulates.
- **Duplication:** Common patterns (the result display moment, the form input with Philippine peso label, the calculation breakdown card) get rebuilt in each tool. Engineering hours wasted.
- **No Storybook-able system:** You can't look at one place to see "what does an Angkin input look like?" — you have to look at an app.
- **Doesn't scale to multi-developer teams:** Works great for solo/pair. As soon as 3+ devs are building different tools simultaneously, drift begins.

### Fit for 148-Tool Angkin Suite

| Criterion | Score | Notes |
|-----------|-------|-------|
| Speed to first tool | 5/5 | Fastest to start |
| Speed to tool #50 | 2/5 | Drift and duplication compound |
| Brand consistency | 2/5 | Tokens ensure colors but not patterns |
| Per-tool customization | 5/5 | Maximum freedom |
| Developer ergonomics | 5/5 | Simple, no abstractions |
| Philippine compliance fit | 3/5 | Adequate |

**When it breaks:** Tool #30. By then, enough pattern duplication has occurred that the Buttons across tools look subtly wrong next to each other. User-observable.

**Verdict:** Necessary layer (always need tokens), but insufficient alone for 148 tools.

---

## Architecture 3: shadcn-Style Registry (Copy-Paste + Customize)

### What It Is

The design system publishes a **JSON registry** of components. Developers run `npx shadcn@latest add button` (or your own CLI: `npx angkin add calculator-input`) and the component source code is **copied directly into their project**. They own the code after that — they can customize it freely. Updates are additive (run the command again to get the latest version, merge into your copy).

shadcn/ui itself uses this model. The key insight: **copying source code is fine when the component is small and when full customization is more valuable than abstraction**.

### How It Works in Practice

```
packages/
├── registry/                  # @angkin/registry (or hosted at registry.angkin.com)
│   ├── registry.json          # manifest of all available components
│   ├── components/
│   │   ├── calculator-input/  # A Philippine-peso-aware input
│   │   │   ├── registry.json  # item metadata + dependencies
│   │   │   └── calculator-input.tsx
│   │   ├── result-display/    # The "computed result" reveal component
│   │   ├── breakdown-table/   # Line-item breakdown of calculation
│   │   ├── legal-basis/       # "Computed under RA 7641 §X" component
│   │   ├── tool-header/       # Standard Angkin tool header with "by Angkin" badge
│   │   └── ...
│   └── package.json
```

`registry.json` for one component:
```json
{
  "name": "calculator-input",
  "type": "registry:ui",
  "dependencies": ["@radix-ui/react-label"],
  "files": ["components/calculator-input/calculator-input.tsx"],
  "cssVars": {
    "light": { "--input-peso-color": "#1D4ED8" }
  }
}
```

Developer installs:
```bash
npx angkin add calculator-input result-display legal-basis
# These 3 components are now in src/components/ui/ — owned by the tool
```

### Strengths

- **Angkin-perfect fit:** Compliance calculators share VERY specific components (peso input, result display, legal basis footnote, tool header with "by Angkin"). These should be codified. The registry model is designed exactly for this.
- **AI-native:** v0, Cursor, Claude Code can call `npx angkin add` to scaffold new tools. The registry doubles as context for AI-assisted development.
- **Full customization:** Tool #47 (maritime compliance calculator) that needs a weird table layout doesn't fight a component API — it just edits its local copy.
- **No versioning complexity:** No npm publish cycle. Registry is just a hosted JSON + source files.
- **Works with shadcn/ui:** Angkin registry sits on top of shadcn registry. `angkin add` depends on `shadcn add` — layered.
- **Incremental adoption:** Start with tokens (Architecture 2). Add registry for high-value shared components. Never have to do a big-bang migration.

### Weaknesses

- **Consistency maintenance:** If the canonical `calculator-input.tsx` in the registry gets a bug fix, each tool that copied it must re-run `angkin add` and merge the update. No automatic propagation.
- **Registry maintenance burden:** Someone must keep the registry up to date, ensure components follow design specs, and handle breaking changes gracefully.
- **Can't fix all 148 tools at once:** If a serious accessibility bug is found in the `result-display` component, you fix the registry version and send out a notice — but each tool must manually update. vs. `@angkin/ui@1.2.1` which propagates atomically.
- **Discoverability:** Developers must know what's in the registry. Requires good documentation and ideally a Storybook or visual catalog.

### Fit for 148-Tool Angkin Suite

| Criterion | Score | Notes |
|-----------|-------|-------|
| Speed to first tool | 5/5 | `angkin add` = instant scaffold |
| Speed to tool #50 | 4/5 | Pattern reuse via registry |
| Brand consistency | 4/5 | High for components in registry |
| Per-tool customization | 4/5 | Own the code, no API fights |
| Developer ergonomics | 5/5 | Excellent UX for developers |
| Philippine compliance fit | 5/5 | Registry can encode domain-specific patterns |

**When it breaks:** Critical bug propagation is slow. Also, the registry must be maintained — old components become stale if no one owns them.

**Verdict:** Best ergonomics layer. Most powerful for encoding Angkin-specific domain patterns (peso input, RA citation footer, etc.). Combine with shared package for critical components (navigation, brand header).

---

## Architecture 4: CSS-Only Theme Layer

### What It Is

The design system is **pure CSS** — a single stylesheet of custom properties, utility classes, and base styles. Zero JavaScript. Zero React dependency. Any tool that imports this stylesheet is "Angkin-branded". Components are not part of the system.

```css
/* @angkin/theme/angkin.css */
:root {
  /* Primitive tokens */
  --color-blue-600: #1D4ED8;
  --color-green-700: #0f7a52;
  --color-red-600: #ca3535;
  --color-neutral-50: #FAFAF9;

  /* Semantic tokens */
  --color-brand-primary: var(--color-blue-600);
  --color-success: var(--color-green-700);
  --color-error: var(--color-red-600);
  --color-bg-page: var(--color-neutral-50);

  /* Component tokens */
  --button-bg: var(--color-brand-primary);
  --button-radius: 8px;
  --input-border-color: #D1D5DB;
  --card-radius: 12px;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);

  /* Typography tokens */
  --font-display: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;

  /* Spacing tokens (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-8: 32px;
  --space-16: 64px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-page: #0F1117;
    /* ... */
  }
}

/* Base component classes */
.angkin-btn { background: var(--button-bg); border-radius: var(--button-radius); ... }
.angkin-input { border: 1px solid var(--input-border-color); ... }
.angkin-card { border-radius: var(--card-radius); box-shadow: var(--card-shadow); ... }
```

### Strengths

- **Framework-agnostic:** Works with React, Vue, Svelte, vanilla HTML. Angkin tools could theoretically be built in any framework.
- **Zero dependencies:** Import one CSS file. That's it. No peer dependencies, no React version conflicts.
- **Fastest for simple tools:** A tool that's just a few HTML inputs + a table can be built with zero JavaScript framework.
- **Custom property inheritance:** Nesting themes is natural — wrap a section in `data-theme="dark"` to theme just that section.
- **The foundation layer:** Even if you use Architecture 1 or 3 on top, CSS custom properties ARE the token layer underneath. Every other architecture builds on this.

### Weaknesses

- **No component behavior:** CSS can't handle input validation, form submission, state management, or the "calculate" button logic. Every tool still needs JavaScript.
- **No accessible defaults:** CSS doesn't give you keyboard navigation, ARIA attributes, focus management. Each tool builds these from scratch.
- **Class naming discipline:** Without TypeScript, developers use wrong class names (`.angkin-inpt` typo) and nothing catches it.
- **Not a design system:** A CSS file is not a design system. It's a vocabulary. The system is the patterns, constraints, and documentation around it.

### Fit for 148-Tool Angkin Suite

| Criterion | Score | Notes |
|-----------|-------|-------|
| Speed to first tool | 4/5 | Very fast if tool is simple |
| Speed to tool #50 | 2/5 | No reuse of component logic/behavior |
| Brand consistency | 3/5 | Colors/spacing yes, patterns no |
| Per-tool customization | 4/5 | Override any CSS variable |
| Developer ergonomics | 3/5 | Low abstraction but also low safety |
| Philippine compliance fit | 3/5 | Adequate for token/color layer |

**Verdict:** Essential foundation layer — every other architecture INCLUDES this. As a standalone architecture, insufficient at 148-tool scale. But the CSS custom property system should always be present as the token layer.

---

## Architecture 5: Figma-to-Code Pipeline

### What It Is

Design tokens are authored in **Figma** (via Tokens Studio plugin or native Figma Variables), synced to a **Git repository** as JSON, transformed by **Style Dictionary** into CSS variables / Tailwind config / TypeScript constants, and distributed as a published npm package. The pipeline runs as a **GitHub Actions workflow**.

```
Figma Variables / Tokens Studio
        ↓ (sync via Tokens Studio GitHub sync)
JSON files in git (tokens/colors.json, tokens/typography.json, ...)
        ↓ (GitHub Actions: run Style Dictionary)
packages/tokens/dist/
    ├── css/tokens.css              # CSS custom properties
    ├── js/tokens.js                # JavaScript constants
    ├── tailwind/preset.js          # Tailwind preset
    └── types/tokens.d.ts           # TypeScript types
        ↓ (publish to npm)
@angkin/tokens@x.y.z
```

Every consuming app imports from `@angkin/tokens` and gets exact Figma values.

### Strengths

- **Design–code alignment:** When a designer changes a color in Figma, a PR is opened within minutes with the exact same change in code. No manual translation, no "is this the right hex?"
- **Multi-platform output:** Same tokens → CSS variables for web → iOS Swift constants → Android XML. If Angkin ever ships a native app, tokens are already there.
- **DTCG standard:** Using the Design Tokens Community Group JSON format creates a future-proof, tool-agnostic token schema.
- **Audit trail:** Every token change is a git commit with a PR. Designer-developer collaboration is version-controlled.
- **Automates the "is this correct?" question:** When a developer asks "what's the exact error red?", they look at `@angkin/tokens`, not Slack the designer.

### Weaknesses

- **Tooling setup cost:** Setting up Tokens Studio, GitHub sync, Style Dictionary transforms, and the CI pipeline takes 2–4 days for someone who hasn't done it before.
- **Designer buy-in required:** The pipeline only works if designers consistently use Tokens Studio and follow the naming convention. Without discipline, tokens drift.
- **Over-engineering for small teams:** If there's one designer and two developers, this pipeline is ceremony for a conversation that could be a Notion doc.
- **Figma is not free at scale:** Tokens Studio Pro + Figma Org can cost $15–50/seat/month. For a bootstrapped Philippine startup, this may be premature.
- **Lagging indicator:** The pipeline describes what was decided, not what should be. Design decisions are still made by humans — the pipeline just enforces them faster.

### Fit for 148-Tool Angkin Suite

| Criterion | Score | Notes |
|-----------|-------|-------|
| Speed to first tool | 2/5 | Slowest to set up |
| Speed to tool #50 | 4/5 | Tokens always correct |
| Brand consistency | 5/5 | Maximum — Figma = code, always |
| Per-tool customization | 4/5 | Tokens provide the vocabulary for customization |
| Developer ergonomics | 4/5 | "What's the error red?" is a code question, not design |
| Philippine compliance fit | 4/5 | Domain-agnostic, works anywhere |

**Verdict:** Worth building, but Phase 2. First, establish manual token discipline (Architecture 2). Once token set is stable and you have 20+ tools, automate the pipeline.

---

## Comparative Analysis

### Head-to-Head Scores (1–5)

| Architecture | Speed to v1 | Speed at 148 | Consistency | Customization | DX | Total |
|---|---|---|---|---|---|---|
| 1. Shared Package (Radix-style) | 3 | 5 | 5 | 3 | 4 | **20** |
| 2. Tokens Only (Tailwind Preset) | 5 | 2 | 2 | 5 | 5 | **19** |
| 3. shadcn Registry | 5 | 4 | 4 | 4 | 5 | **22** |
| 4. CSS-Only Theme Layer | 4 | 2 | 3 | 4 | 3 | **16** |
| 5. Figma Pipeline | 2 | 4 | 5 | 4 | 4 | **19** |

### Maturity Curve: Which Architecture Wins at Each Scale

| Scale | Best Architecture | Why |
|-------|------------------|-----|
| Tools 1–5 | Tokens Only (#2) | Fast iteration, no premature abstraction |
| Tools 6–20 | Registry + Tokens (#3 + #2) | Patterns emerging, codify them in registry |
| Tools 21–50 | Registry + Shared Package (#3 + #1) | Critical shared components warrant full package |
| Tools 51–148 | Full stack: #1 + #2 + #3 + #5 | Figma pipeline automates token maintenance |

---

## Angkin-Specific Recommendation

### The Recommended Stack (Hybrid)

**Tier 0: CSS Custom Properties** (always, built into Tailwind preset)
Every Angkin tool imports the same CSS variable vocabulary. Colors, spacing, typography, radii — defined once as CSS custom properties.

**Tier 1: Tailwind Preset** (immediate, Phase 1)
`@angkin/tailwind-preset` — a single Tailwind config export with all tokens. Any tool that adds this preset to its `tailwind.config.js` gets the right colors and classes. Zero runtime, zero components.

**Tier 2: Angkin Registry** (Phase 1–2, build as patterns emerge)
`npx angkin add [component]` — a shadcn-compatible registry at `registry.angkin.com` (or the monorepo) of Angkin-specific domain components:
- `peso-input` — Input with ₱ prefix, number formatting, validation
- `result-display` — The "computation result" reveal moment with animation
- `breakdown-table` — Line-item breakdown with subtotals
- `legal-basis` — "Computed under RA 7641 §..." footnote component
- `tool-header` — Angkin branded header with "ToolName by Angkin" treatment
- `computation-history` — Saved past computations (for power users)

**Tier 3: Shared Package** (Phase 2–3, when registry has 10+ stable components)
`@angkin/ui` — promote battle-tested registry components into a full package for atomic updates and TypeScript safety. Start with the 5 most critical components.

**Tier 4: Figma Pipeline** (Phase 3, when you have a designer and 30+ tools)
Automate token sync from Figma → git → `@angkin/tokens` via Style Dictionary + GitHub Actions.

### Deployment Model per Architecture

| Architecture | Deployment Model |
|---|---|
| Shared Package | Monorepo with Turborepo, workspace:* deps |
| Tailwind Preset | Published to npm or local `packages/config-tailwind/` |
| Registry | Hosted JSON at URL OR local `packages/registry/` |
| CSS Theme Layer | Part of Tailwind preset (CSS file export) |
| Figma Pipeline | GitHub Actions + npm publish on token change |

### Implementation Cost Estimates (for Angkin-size team)

| Architecture | Setup Time | Per-Tool Overhead | Maintenance/Year |
|---|---|---|---|
| Tokens (Tailwind Preset) | 4 hours | ~5 min (add preset) | 2 hours (token updates) |
| Registry (10 components) | 2 days | ~30 min (scaffold tool) | 4 hours/component/year |
| Shared Package (core) | 3 days | ~1 hour (integrate package) | 8 hours/quarter |
| Figma Pipeline | 3 days | 0 min (automatic) | 2 hours/month (maintain sync) |

### Time to Build Tool #149 Using Full Stack

1. `npx create-vite tool-149 --template react-ts` — 2 min
2. Add `@angkin/tailwind-preset` to Tailwind config — 5 min
3. Run `npx angkin add tool-header peso-input result-display legal-basis` — 5 min
4. Implement tool logic (calculation function, form state) — 2–4 hours
5. Wire up components with Angkin CSS classes and tokens — 30 min

**Total time to a polished, on-brand, accessible Angkin tool:** ~4–5 hours for a standard single-form calculator.

---

## Key Architectural Decisions for Angkin

### Decision 1: Monorepo vs. Polyrepo

**Recommendation: Monorepo (Turborepo)**

With 148 tools that share a design system, monorepo is strongly preferred. Atomic updates (fix a token → all tools re-build in CI) outweigh the Git complexity cost. Turborepo handles caching and affected-build detection.

### Decision 2: shadcn as the Foundation, Not a Dependency

**Recommendation: Treat shadcn as a source, not a peer**

Run `shadcn add` once to get base components into the monorepo. Then customize those components to be Angkin-branded. The Angkin registry sits on top of shadcn — consumers run `angkin add calculator-input` which adds an Angkin-branded input built on shadcn's Input.

### Decision 3: Token Naming Convention

**Recommendation: Three tiers, OKLCH colors (from Linear/Stripe research)**

```
Tier 1 (Primitives):    --angkin-blue-600, --angkin-green-700, --angkin-neutral-50
Tier 2 (Semantic):      --angkin-brand-primary, --angkin-success, --angkin-bg-page
Tier 3 (Component):     --angkin-input-border, --angkin-btn-bg, --angkin-card-radius
```

Use OKLCH for all color values (from Aspect 9 findings on Linear's approach):
```css
--angkin-brand-primary: oklch(45% 0.2 264);  /* #1D4ED8 equivalent */
```

### Decision 4: Per-Tool Domain Theming

**Recommendation: One base-color override per tool domain**

Each tool domain (tax, labor, social security, property, maritime) gets a slightly different brand accent, achieved by overriding ONE semantic token:

```css
/* labor tools */
[data-domain="labor"] { --angkin-brand-accent: oklch(60% 0.18 142); /* green */ }

/* tax tools */
[data-domain="tax"] { --angkin-brand-accent: oklch(45% 0.2 264); /* blue */ }

/* property tools */
[data-domain="property"] { --angkin-brand-accent: oklch(55% 0.15 30); /* terracotta */ }
```

The overall design remains cohesively Angkin while giving each domain a distinct identity.

### Decision 5: The "By Angkin" Invariant

**Recommendation: Registry component enforces this**

The `tool-header` registry component is the ONLY way to render an Angkin tool header. It always includes the "by Angkin" badge, and it cannot be customized away. This is the single invariant that makes all 148 tools feel like one family.

---

## Anti-Patterns to Avoid

1. **Don't ship a component library on day 1.** Build tools first, extract patterns to registry after 5 tools. Premature abstraction = wrong abstractions.

2. **Don't force every tool into a full-package dependency.** Simple 1-form tools may just need the Tailwind preset + a few registry components. Not every tool needs the full stack.

3. **Don't design tokens without usage guidelines.** A token named `--color-blue-600` is a primitive, not a design decision. The semantic layer (`--color-brand-primary`) is where design lives.

4. **Don't let the registry become a graveyard.** Every component added to the registry must have an owner. Ownerless components become stale and are not trusted by developers.

5. **Don't skip the Storybook equivalent.** Whether it's Storybook, Ladle, or a static HTML catalog — a visual component reference is essential at 148 tools. Without it, developers use wrong components or build duplicates.

---

*Sources: Feature-Sliced Design monorepo guide, shadcn/ui registry documentation, Thinkmill multi-brand Tailwind article, CSS custom properties layered architecture (frontendtools.tech, penpot.app), Tokens Studio + Style Dictionary pipeline documentation, various DEV Community monorepo case studies.*

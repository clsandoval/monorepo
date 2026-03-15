# Frontier — Angkin UI Treatment Deck

## Statistics

- **Total aspects**: 27
- **Analyzed**: 27
- **Pending**: 0
- **Convergence**: 100%

## Wave 1: Research & Foundation (Read existing code, benchmarks, decisions)

- [x] 1.1 — Audit TaxKlaro current design tokens: read `apps/taxklaro/frontend/src/index.css` and extract all CSS variables, colors, fonts, spacing
- [x] 1.2 — Audit Inheritance current design tokens: read `apps/inheritance/frontend/src/index.css` and extract all CSS variables, colors, fonts, spacing
- [x] 1.3 — Read angkin-design-system-reverse analysis: extract useful context from `loops/angkin-design-system-reverse/analysis/` (benchmarks, audience fit, tool archetypes, Option 2 radical clarity spec)
- [x] 1.4 — Logo anatomy: document the 2C mark's geometry, proportions, clear space rules, minimum size. Generate logo usage examples with gemini-image-gen (light bg, dark bg, colored bg, favicon, nav-size, hero-size)

## Wave 2: Design Decisions (Make choices, write specs)

- [x] 2.1 — Color system: define full palette — primary navy + tints/shades, neutral scale (gray-50 to gray-900), semantic colors (success, warning, error, info), accent color. Write CSS custom properties.
- [x] 2.2 — Dark mode palette: define dark mode equivalents for every color. Background, surface, text, border colors. How logo inverts.
- [x] 2.3 — Typography system: select font stack (heading + body + mono), define type scale (hero through caption) with sizes, weights, line-heights, letter-spacing. Write CSS.
- [x] 2.4 — Spacing & layout system: define base unit, spacing scale, page max-width, grid columns, card padding, section gaps. Mobile vs desktop breakpoints.
- [x] 2.5 — Sub-tool branding: how TaxKlaro, Inheritance, Retirement Pay, etc. sit within Angkin. Tool icons, accent colors per tool (if any), "by Angkin" badge, tool card treatment on platform home.
- [x] 2.6 — Iconography: choose icon style (line weight, fill vs outline), recommend library (Lucide, Phosphor, etc.), define custom category icons for tool types (tax, labor, corporate, property, civil law).

## Wave 3: Component Design (Visual examples of every UI element)

- [x] 3.1 — Buttons: primary, secondary, ghost, danger, disabled states. All sizes (sm, md, lg). Generate image showing all variants.
- [x] 3.2 — Form inputs: text, number, select, radio, checkbox, toggle. Default, focus, error, disabled states. Labels, help text, error messages.
- [x] 3.3 — Cards: content card, tool card, result card, stat card. Light and dark variants. Hover/active states.
- [x] 3.4 — Navigation: top nav bar, sidebar nav, mobile hamburger menu, breadcrumbs, tab bar. Active/inactive states.
- [x] 3.5 — Data display: large peso amounts (monospace), comparison tables, progress bars, badges, tooltips, stat blocks.
- [x] 3.6 — Modals & overlays: confirmation dialog, info modal, bottom sheet (mobile). Backdrop treatment.
- [x] 3.7 — Wizard pattern: step progress indicator, step content area, navigation buttons, validation states. Desktop and mobile.

## Wave 4: Full-Page Mockups (Example screens with gemini-image-gen)

- [x] 4.1 — Angkin platform home: tool grid, nav, hero, footer. Desktop 1280px.
- [x] 4.2 — TaxKlaro landing page: hero, features, CTA. Desktop 1280px.
- [x] 4.3 — TaxKlaro results page: 3-regime comparison, recommended badge, savings highlight. Desktop 1280px.
- [x] 4.4 — Inheritance wizard step: family tree builder or estate details form. Desktop 1280px.
- [x] 4.5 — Generic "new tool" template: what a new compliance calculator looks like day 1. Desktop 1280px.
- [x] 4.6 — Mobile treatments: 3-4 key screens at 375px — platform home, wizard step, results page, nav menu.
- [x] 4.7 — Dark mode screens: 2-3 screens showing the dark mode palette in action.

## Wave 5: Assembly & Polish (Build the HTML deck)

- [x] 5.1 — Scaffold `output/ui-treatment-deck.html`: page structure, TOC, section headings, inline CSS framework. Use frontend-design skill.
- [x] 5.2 — Populate all 12 sections with images, CSS snippets, design rationale. Use frontend-design skill.
- [x] 5.3 — Final polish: verify all images load, cross-check every design token, Playwright screenshot for QA.

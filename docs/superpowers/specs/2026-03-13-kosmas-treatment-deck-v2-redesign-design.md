# Kosmas UI Treatment Deck V2 Redesign — Design Spec

## Goal

Ground-up rebuild of the Kosmas UI treatment deck. Same 13-section structure, completely new visual execution: warm editorial aesthetic, light/dark mode toggle, mobile-first responsive design. Dual audience: stakeholders see polish, developers get exact specs.

## Constraints

- Single self-contained HTML file (no build step, no framework)
- External dependencies: Google Fonts CDN (Rajdhani, Inter, JetBrains Mono)
- Logo image base64-embedded (runner logotype PNG from `docs/brand/kosmas/kosmas-logo-transparent.png`)
- Vanilla JavaScript for interactivity (toggle, tabs, scroll-spy)
- Icons: inline SVG only
- Open the file in a browser and it works
- File: `docs/brand/kosmas/ui-treatment-deck.html` (replaces existing)

## Logo

The logo is the **runner logotype** — "KOSMAS / ATHLETIC VENTURES CO." wordmark with angular Z-shaped runner figure. Source: `docs/brand/kosmas/kosmas-logo-transparent.png`.

- Full logotype: complete wordmark + runner
- Icon mark: runner silhouette cropped from the full logotype via CSS `object-fit` / `overflow:hidden`
- Dark mode: `filter: invert(1)` on the logo image
- Do NOT use the SVG polygon trace of the runner — use the actual PNG image file

## Visual Direction: Warm Editorial

Premium, restrained. Cream paper backgrounds in light mode, deep black in dark mode. Plum and gold are accent colors only — not dominant surfaces. The bold angular runner logo provides all the energy; the surrounding design stays clean and quiet.

Inspirations: Nike brand guidelines (clean, dynamic), Wilson (strong, athletic), editorial magazine layouts.

## Color System

All colors defined as CSS custom properties on `:root` (light) and `[data-theme="dark"]` (dark).

### Light Mode (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F8F6F1` | Page background |
| `--surface` | `#FFFFFF` | Cards, inputs, elevated surfaces |
| `--border` | `#E8E4DC` | Dividers, card borders |
| `--text` | `#1A1A1A` | Primary text, headings |
| `--text-secondary` | `#666666` | Descriptions, meta text |
| `--text-muted` | `#999999` | Labels, captions, section numbers |
| `--plum` | `#4A1942` | Accent — section markers, tags, emphasis |
| `--gold` | `#C8A96E` | Accent — active states, highlights, nav underline |
| `--peri` | `#8A9ABB` | Accent — tertiary, volleyball sport color |
| `--error` | `#B33A3A` | Error borders, error messages |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#111111` | Page background |
| `--surface` | `#1E1E1E` | Cards, inputs, elevated surfaces |
| `--border` | `#333333` | Dividers, card borders |
| `--text` | `#FAFAFA` | Primary text, headings |
| `--text-secondary` | `#999999` | Descriptions, meta text |
| `--text-muted` | `#555555` | Labels, captions, section numbers |
| `--plum` | `#6B2D63` | Accent — section markers, tags, emphasis |
| `--gold` | `#F0DFA0` | Accent — active states, highlights, nav underline |
| `--peri` | `#B8C8E8` | Accent — tertiary, volleyball sport color |
| `--error` | `#D45555` | Error borders, error messages |

### Usage Ratio

70% background/surface, 20% text, 10% accents (plum + gold + peri combined).

## Typography

### Heading Font: Rajdhani

- Geometric, angular — matches the runner logo's character
- Weights: 400 (regular), 500 (medium), 600 (semibold, section headings), 700 (bold, hero)
- Always uppercase with letter-spacing

### Body Font: Inter

- Clean geometric sans-serif, excellent readability at small sizes
- Weights: 400 (regular, body text), 500 (medium, labels), 600 (semibold, buttons)
- Normal case for body, uppercase with letter-spacing for labels/buttons

### Mono Font: JetBrains Mono

- For hex values, spacing specs, code snippets, token names
- Weight: 400 only

### Type Scale

| Level | Size | Font | Weight | Letter-spacing | Line-height | Use |
|-------|------|------|--------|---------------|-------------|-----|
| Display | 48px | Rajdhani | 700 | 4px | 1.1 | Hero headline |
| H1 | 36px | Rajdhani | 700 | 3px | 1.2 | Section titles |
| H2 | 28px | Rajdhani | 600 | 2px | 1.2 | Sub-section headings |
| H3 | 20px | Rajdhani | 600 | 1px | 1.3 | Card titles |
| H4 | 16px | Rajdhani | 600 | 1px | 1.3 | Small headings |
| Body | 15px | Inter | 400 | 0 | 1.6 | Paragraphs |
| Label | 11px | Inter | 500 | 2px | 1.0 | Uppercase labels |
| Caption | 12px | Inter | 400 | 0 | 1.4 | Secondary info |
| Mono | 13px | JetBrains Mono | 400 | 0 | 1.4 | Specs, hex codes |

Max paragraph width: 65ch.

## Spacing

8px base unit. All spacing values are multiples of 8px.

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 8px | Tight gaps |
| `--space-2` | 16px | Component internal padding (mobile) |
| `--space-3` | 24px | Component internal padding (desktop), grid gaps |
| `--space-4` | 32px | Section internal spacing |
| `--space-5` | 40px | Content block gaps |
| `--space-6` | 48px | Section padding (mobile) |
| `--space-8` | 64px | Section padding (desktop) |
| `--space-10` | 80px | Section gaps (desktop) |

Container: `max-width: 1080px`, centered, `padding: 0 24px` (mobile), `padding: 0 32px` (desktop).

## Layout & Responsiveness

### Breakpoints

- Mobile: `< 768px` (default styles, single-column)
- Desktop: `>= 768px` (grid layouts via `@media (min-width: 768px)`)

### Grid Strategy

All layouts start as single-column stacks. Grid columns are introduced at the desktop breakpoint only:

| Component | Mobile | Desktop |
|-----------|--------|---------|
| Color swatches | 2 columns | 4 columns |
| Logo variants | 2 columns | 3 columns |
| Logo "don'ts" | 2 columns | 4 columns |
| Button grid | 2 columns | 3 columns |
| Type scale | Stacked rows | 2-column (meta + sample) |
| Form states | 1 state per row | 4 states per row |
| Cards | Single column | 2-3 columns |
| Footer | Stacked | 4 columns |

### Touch Targets

All interactive elements: minimum 44px touch target size on mobile.

## Dark/Light Toggle

### Implementation

- CSS custom properties on `:root` (light default) and `[data-theme="dark"]` (dark override)
- Initial state: respect `prefers-color-scheme` media query (OS preference)
- Toggle: sun/moon inline SVG icon in the sticky nav, far right position
- Toggle sets `data-theme` attribute on `<html>` and persists choice to `localStorage`
- Smooth 200ms `transition` on `background-color` and `color` properties (no jarring flash)

### Logo in Dark Mode

`filter: invert(1)` on the logo image. Same approach as existing V2.

## Sticky Navigation

### Desktop (>= 768px)

- 56px height, fixed top
- Background: `--bg` with subtle `backdrop-filter: blur(8px)` and 90% opacity
- Bottom border: 1px `--border`
- Left: abbreviated section labels, horizontally laid out
- Right: dark/light toggle icon
- Labels: `PHILOSOPHY | LOGO | COLORS | TYPE | SPACING | BUTTONS | TAGS | FORMS | CARDS | NAV | FOOTER | PAGES | SAMPLE`
- Font: Inter 500, 10px, letter-spacing 2px, uppercase
- Active section: gold underline (2px), smooth sliding transition via scroll-spy
- Hover: color transition to `--gold`

### Mobile (< 768px)

- 48px height, fixed top
- Same background treatment
- Section labels in a horizontally scrollable container (`overflow-x: auto`, hidden scrollbar)
- Active section auto-scrolls into view
- Toggle icon stays fixed at right edge

## Section Structure (13 sections)

Each section follows a consistent pattern:

```html
<section class="section" id="s01">
  <div class="container">
    <div class="section-number">01</div>
    <h1 class="section-title">DESIGN PHILOSOPHY</h1>
    <p class="section-desc">...</p>
    <!-- section content -->
  </div>
</section>
```

- Section number: Inter mono-style, `--gold`, 11px, letter-spacing 4px
- Section title: Rajdhani 700, 36px desktop / 28px mobile, `--text`, letter-spacing 3px
- Section description: Inter 400, 15px, `--text-secondary`, max-width 600px
- Section padding: 80px top/bottom desktop, 48px mobile
- Section divider: 1px `--border` bottom

### 01 — Design Philosophy

Three brand pillars, each as a card:
1. **Athletic Precision** — sharp geometry, tight letter-spacing, structured grids
2. **Premium Confidence** — plum and gold palette, bold typography, generous whitespace
3. **Southeast Asian Energy** — warm undertones, dynamic contrast, movement in layout

Each pillar: plum left-border accent bar (4px), heading + short paragraph. Stack vertically on all screen sizes.

### 02 — Logo System

Two marks:
- **Full logotype** — wordmark + runner (base64 PNG)
- **Icon mark** — runner cropped via CSS from the same PNG

Display in 2x3 grid (2-col mobile, 3-col desktop):
- Light-on-dark variant (default)
- Dark-on-light variant (`filter: invert(1)`)
- Monochrome variant (`filter: grayscale(1)`)

Additional:
- Safe zone diagram: dashed border, 1x padding rule
- Minimum sizes: full logotype 120px wide, icon mark 32px
- "Don't do this" row: 4 cards (2x2 mobile, 4-col desktop) with red X overlay — rotated, gradient-filled, stretched, wrong colors

### 03 — Color Palette

Color grid (2-col mobile, 4-col desktop). Each card:
- Color swatch (120px height) with hex label
- Name, hex code (mono), usage description

Show both light and dark palettes. Include:
- Usage ratio guideline: 70/20/10
- Sport color assignments as sub-section

### 04 — Typography

Type scale table showing each level with live rendered sample text.
- Desktop: 2-column (meta specs left, rendered sample right)
- Mobile: stacked (meta above, sample below)

Additional:
- Weight examples across Rajdhani range (400-700)
- Pairing guidance
- Body text readability paragraph

### 05 — Spacing & Grid

Visual spacing bars showing each token value. Bars use `--plum` fill with gold value label. Works naturally at all widths.

### 06 — Buttons

Button variants in a grid (2-col mobile, 3-col desktop):
- Primary: `--text` bg, `--bg` text (inverts in dark mode)
- Secondary: transparent, `--border` border, `--text` text
- Accent: `--plum` bg, white text
- Ghost: transparent, `--text` text, underline on hover

Each shown in: default, hover, disabled states.

### 07 — Tags & Badges

Five tag variants:
1. **Sport tags** — sport-color backgrounds with appropriate text
2. **Status badges** — "ACTIVE" (gold), "SOLD OUT" (error), "UPCOMING" (peri)
3. **Location tags** — ghost style with border
4. **Category labels** — small caps, subtle surface bg
5. **Metric badges** — mono font, accent-colored

Default + compact sizes with specs.

### 08 — Form Inputs

Styled form elements:
- Text input, textarea, select, toggle, checkbox, radio, search, date picker
- States: default, focus (`--gold` border), error (`--error` border + message), disabled (50% opacity)
- Desktop: 4 states side by side per input type
- Mobile: 1 state per row, stacked

### 09 — Cards & Containers

Card variants:
- Default card (surface bg, border, padding)
- Featured card (plum left border accent)
- Sport card (sport-color top accent)

### 10 — Navigation

Two mockups stacked:

**Desktop**: 56px height, logo left, links center, CTA right. Sticky, `--bg` background. Active link: gold underline.

**Mobile**: 48px header with logo left, hamburger right. Below: full-screen overlay mockup rendered as static open state.

### 11 — Footer

Multi-column footer:
- Logo + brand statement left
- Three link columns: Experiences, Locations, Company
- Social links row
- Copyright bar with `--border` top
- Stacks to single column on mobile

### 12 — Page Treatments (6 sub-layouts)

Tab bar at top to switch between sub-layouts (one visible at a time). Each rendered inside a mockup frame.

#### 12a: Marketing Landing Page
Hero gradient, sport cards grid, testimonial band, CTA section.

#### 12b: App Dashboard
Stats bar (4 KPI cards), activity feed, quick-action buttons.

#### 12c: Content Page
Blog/article layout with title, byline, body text, related articles grid.

#### 12d: CRUD Interface
Filter bar, data table, row actions, pagination.

#### 12e: ERP Dashboard
Sidebar nav, KPI cards, chart placeholders, data table.

#### 12f: Scheduling View
Day/Week/Month toggle, calendar grid, sport-colored event cards, booking modal overlay.

All page treatments render in the **current theme mode** (light or dark based on toggle).

### 13 — Sample Layout

Full-width responsive sample combining nav, hero, content, and footer as a closing showcase.

## Micro-interactions

- **Theme toggle**: 200ms ease transition on all color properties
- **Scroll-spy**: gold underline slides between nav links (CSS `transform` on a pseudo-element)
- **Page treatment tabs**: crossfade (opacity transition, 150ms)
- **Hover states**: all buttons, cards, nav links have `:hover` transitions (150ms)
- **Focus states**: `--gold` outline ring (2px offset) on all interactive elements for accessibility

## Accessibility

- Color contrast: all text meets WCAG AA in both modes
- Focus-visible outlines on all interactive elements
- Semantic HTML structure (proper heading hierarchy, nav landmarks)
- `prefers-reduced-motion` media query disables transitions

## Sport Color Mapping

Consistent across both modes:

| Sport | Light Token | Dark Token |
|-------|-----------|-----------|
| Pickleball | `--gold` | `--gold` |
| Volleyball | `--peri` | `--peri` |
| Football | `--plum` | `--plum` |
| Golf | `#888888` | `#BBBBBB` |

## File Output

Single file: `docs/brand/kosmas/ui-treatment-deck.html`

Replaces the existing V2 deck entirely. No migration — clean rebuild.
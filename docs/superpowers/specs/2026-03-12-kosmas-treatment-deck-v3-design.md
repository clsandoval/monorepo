# Kosmas UI Treatment Deck V3 — Design Spec

## Goal

Rebuild the Kosmas UI treatment deck from scratch around the new geometric star logo. Same 13-section structure as V2, completely new visual identity. The old plum/runner/Rajdhani treatment is replaced with a warm editorial aesthetic derived from the brand brief.

## Brand Brief Summary

Source: `docs/brand/kosmas/kosmas-logo-brief.pdf`

- **Sporty, elegant, bold, defined** — not overly approachable or friendly
- **Premium and confident** — not corporate or generic
- **Clean lines, strong presence, sense of motion**
- **Minimalist sophistication, strong structure**
- Avoid: overly approachable, overly corporate, complex/ornate
- Inspirations: Nike (clean, dynamic, iconic), Wilson (strong, athletic, confident)
- Mood board: warm neutrals, cream backgrounds, black typography, editorial minimalism (Benzy Golf Co., Boostio, Somma Social aesthetic)

## New Logo

Source: `docs/brand/kosmas/logo2.jpg`

- Geometric star/compass rose with hidden "K" in the center
- Cyan-to-teal gradient lines
- Thin geometric sans-serif wordmark: "KOSMAS"
- Subtitle: "ATHLETIC VENTURES" (dropped "CO." from previous version)
- Two marks: full logotype (star + wordmark + subtitle) and icon mark (star only)

## Constraints

- Single self-contained HTML file (no build step, no framework)
- External dependencies: Google Fonts CDN (Josefin Sans + Outfit)
- Logo image base64-embedded
- Vanilla JavaScript for interactivity (tabs, toggles, scroll-spy)
- Icons: inline SVG only
- Open the file in a browser and it works

## Color Palette — Warm Editorial

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--black` | Black | `#1A1A1A` | Primary text, headings, primary buttons, borders |
| `--cream` | Cream | `#F5F0E8` | Page background, primary surface |
| `--cyan` | Cyan | `#0CB4CE` | Logo mark, interactive highlights, links, focus states — accent only |
| `--stone` | Stone | `#D4CFC4` | Borders, dividers, muted elements |
| `--charcoal` | Charcoal | `#3D3D3D` | Secondary text, nav links, labels |
| `--white` | White | `#FFFFFF` | Card backgrounds, input backgrounds |
| `--error` | Error | `#B33A3A` | Error borders, error messages, destructive actions |

Usage ratio: 60-70% cream backgrounds, 25-30% black/charcoal typography, 5% cyan accent.

Cyan is **never** used for large surfaces, backgrounds, or primary buttons. It appears only on: the logo mark, text links, focus rings, hover states, metric highlights, and the star icon.

## Typography

### Heading Font: Josefin Sans

- Geometric, thin, elegant — matches the logo wordmark's character
- Weights: 300 (light, for display/hero), 400 (regular), 600 (semibold, for section headings), 700 (bold, for emphasis)
- Letter-spacing: 3px on display, 2px on section headings

### Body Font: Outfit

- Clean geometric sans-serif, pairs well with Josefin Sans
- Weights: 300 (light, for body text), 400 (regular), 500 (medium, for labels), 600 (semibold, for buttons)
- Letter-spacing: 1.5px on uppercase nav/buttons, 2px on uppercase labels

### Type Scale

| Level | Size | Font | Weight | Letter-spacing | Line-height | Use |
|-------|------|------|--------|---------------|-------------|-----|
| Display | 48px | Josefin Sans | 300 | 3px | 1.1 | Hero headlines |
| H1 | 36px | Josefin Sans | 600 | 2px | 1.2 | Page titles |
| H2 | 28px | Josefin Sans | 600 | 2px | 1.2 | Section headings |
| H3 | 20px | Josefin Sans | 600 | 1px | 1.3 | Card titles, sub-sections |
| H4 | 16px | Josefin Sans | 600 | 1px | 1.3 | Small headings |
| Body | 15px | Outfit | 300 | 0 | 1.6 | Paragraphs |
| Label | 10px | Outfit | 500 | 2px | 1.0 | Uppercase labels |
| Caption | 12px | Outfit | 300 | 0 | 1.4 | Secondary info, timestamps |

## Sport Differentiation — Subtle Background Tints

No distinct sport colors. Sports are differentiated by very slight warm/cool background tint shifts on cards and schedule rows. Typography and labels remain black/charcoal throughout.

| Sport | Card Background | Card Border |
|-------|----------------|-------------|
| Pickleball | `#FDF8F0` (warm cream) | `#E8DFD0` |
| Volleyball | `#F5F8F4` (cool sage) | `#D8E0D5` |
| Football | `#F6F4F8` (cool lavender) | `#DDD8E2` |
| Golf | `#F2F5F8` (cool blue) | `#D5DCE3` |

Tags for all sports use the same style: outlined with `--stone` border, black text on transparent background.

## Section Structure (13 sections)

### 01 — Design Philosophy

Three brand pillars derived from the brief:

1. **Athletic Precision** — Clean lines, geometric structure, the star's sharp angles. Sports demand exactness.
2. **Premium Confidence** — Warm editorial palette, generous whitespace, restrained color. Not budget athletics.
3. **Southeast Asian Energy** — Warm cream undertones, bold black contrasts, movement implied through typography and spacing.

Each pillar: short paragraph + visual motif. Brief, punchy.

### 02 — Logo System

Two marks:
- **Full logotype** — Star + "KOSMAS" + "ATHLETIC VENTURES" (base64-embedded from logo2.jpg). Used in hero sections and the Logo System showcase.
- **Icon mark** — Star only, recreated as **inline SVG**. The star is a geometric shape made of straight lines — ideal for SVG. The SVG uses `stroke` for the cyan lines, making it trivial to change color for dark/monochrome variants by swapping the stroke value. Do NOT attempt to CSS-crop the JPG — the white background and fine lines make cropping impractical.

Variants grid (2×3 per mark):
- Default (cyan star on cream bg) — SVG with `stroke: var(--cyan)`
- On dark (cyan star on black bg) — same SVG, dark container
- Monochrome (black star on cream bg) — SVG with `stroke: var(--black)`

Additional specs:
- Safe zone: dashed border showing 1x padding rule
- Minimum size: Full logotype min 120px wide, icon mark min 32px
- "Don't do this" row: rotated, gradient-filled, stretched, wrong colors

### 03 — Color Palette

Full palette grid with:
- Large swatches with hex, RGB values
- Usage ratio guideline
- Cyan usage rules (accent only — never backgrounds or primary buttons)
- Sport tint assignments documented as sub-section

### 04 — Typography

Type scale table with live examples in both Josefin Sans and Outfit:
- Each weight shown across the range
- Pairing guidance (when to use which)
- Sample paragraph for body text readability
- Letter-spacing specs for uppercase labels

### 05 — Spacing & Grid

- 8px base unit
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 80
- Max content width: 1080px
- Visual examples of spacing at each level

### 06 — Buttons

Five variants, all using black/cream/cyan:
1. **Primary** — Black bg, cream text, uppercase Outfit 600
2. **Secondary** — 2px black border, black text, transparent bg
3. **Ghost** — No border, charcoal text, hover shows stone bg
4. **Accent** — Cyan bg, black text (used sparingly — only for key CTAs alongside the logo)
5. **Disabled** — 50% opacity of primary

States: default, hover, active, disabled. Border-radius: 4px. Padding: 10px 28px. Letter-spacing: 1.5px.

Hover states:
- **Primary hover** — bg lightens to charcoal (`--charcoal`)
- **Secondary hover** — bg fills with black, text inverts to cream
- **Ghost hover** — bg fills with stone (`--stone`)
- **Accent hover** — bg darkens to `#0A9AB3`

### 07 — Tags & Badges

Five tag types:
1. **Sport tags** — Outlined, stone border, black text. All sports same style.
2. **Status badges** — "ACTIVE" (cyan text), "SOLD OUT" (charcoal, line-through), "UPCOMING" (black bg, cream text)
3. **Location tags** — Ghost style, charcoal text, no border
4. **Category labels** — Small caps, stone bg tint
5. **Metric badges** — Cyan text, monospace feel (Outfit 500)

### 08 — Form Inputs

Light theme form elements on cream background. One row per type, 4 columns (default, focus, error, disabled).

Input types:
- Text input — white bg, stone border, black text
- Textarea
- Select dropdown
- Toggle switch — black active state, stone inactive
- Checkbox and radio — custom styled, black check/dot
- Search input with inline SVG magnifying glass
- Date picker field

Focus state: cyan border (`--cyan`). Error state: error border + message (`--error` / `#B33A3A`). Disabled: 50% opacity.

### 09 — Cards & Containers

Cards on cream background:
- White card bg, stone border, 6px border-radius
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`, `translateY(-2px)`
- Content: Josefin Sans titles, Outfit body
- No colored accents on cards (sport cards use subtle tints per the mapping above)

### 10 — Navigation

**Desktop mockup:**
- 64px height, cream bg, black bottom border (2px)
- Logo (icon mark) left, links center, CTA button right
- Links in Outfit 500, 11px, uppercase, charcoal, letter-spacing 1px
- Active link: black text with 2px black underline
- Hover: black text transition

**Mobile mockup (static open state):**
- 56px header with icon mark left, hamburger SVG right
- Overlay: cream bg, links stacked vertically centered
- CTA button at bottom

### 11 — Footer

- Cream bg section with black top border (2px)
- Left: icon mark + brand statement in Outfit 300
- Three link columns: Experiences, Locations, Company — Outfit 400, charcoal
- Copyright bar: stone top border, Outfit 300, charcoal

### 12 — Page Treatments (6 sub-layouts, tabbed)

Tab bar at top of section, vanilla JS tab switching. Default: 12a visible.

#### 12a: Marketing Landing Page
- Hero: cream bg, large Josefin Sans 300 display headline, Outfit body
- Sport cards grid with subtle tint backgrounds
- Testimonial band: centered quote, Josefin Sans italic
- CTA: primary + secondary buttons

#### 12b: App Dashboard
- Top stats: 4 KPI cards (white bg, stone border)
- Activity feed: recent bookings list
- Quick-action buttons row

#### 12c: Content Page
- Article layout: title (Josefin Sans 600), author, date, read time
- Body text (Outfit 300), blockquote with left black border
- Related articles grid at bottom

#### 12d: CRUD Interface
- Filter bar: search + sport dropdown + status filter
- Data table: black header row, white rows, stone borders
- Pagination controls, row actions (edit/delete inline SVGs)

#### 12e: ERP Dashboard
- Left sidebar: collapsed icon nav, black bg, cream icons (intentional inversion — sidebars commonly use a contrasting dark scheme to anchor the layout, this is the only place a large black surface appears)
- KPI cards, chart placeholders, data table
- Operations overview context

#### 12f: Scheduling View
- Day/Week/Month toggle
- Week calendar grid with sport-tinted event cards
- Static booking modal overlay with form fields

### 13 — Sample Layout

Full-page showcase composing treatment elements into a cohesive marketing page:
- Nav bar (from section 10)
- Hero: display headline "PREMIER ATHLETIC EXPERIENCES", subtitle about Kosmas Athletic Ventures, primary + secondary CTA buttons
- 4 sport cards in a grid (using sport tint backgrounds from section 09)
- Testimonial quote block
- Footer (from section 11)

This is a distinct composition from 12a — it serves as the "everything together" closing showcase, not a duplicate of any page treatment.

## TOC Navigation

Sticky top nav with scroll-spy (same approach as V2). Active section highlighted with black text (vs charcoal for inactive). Responsive breakpoint at 768px — below this, stack content to single column and collapse multi-column grids. Abbreviated labels:
PHILOSOPHY | LOGO | COLORS | TYPE | SPACING | BUTTONS | TAGS | FORMS | CARDS | NAV | FOOTER | PAGES | SAMPLE

## File Modified

- `docs/brand/kosmas/ui-treatment-deck.html` — complete rewrite of this single file

# Kosmas UI Treatment Deck V2 — Design Spec

## Goal

Expand the Kosmas UI treatment deck from 6 sections to 13, transforming it from a basic style guide into a comprehensive brand system comparable to professional brand decks. Dual audience: developers need exact specs, stakeholders need to be impressed.

## Constraints

- Single self-contained HTML file (no build step, no framework)
- Only external dependency: Google Fonts CDN (Rajdhani)
- All images base64-embedded
- Open the file in a browser and it works

## Sport Focus

All content examples use four sports: **pickleball, volleyball, football, golf**.

Sport-to-color mapping:
- Pickleball → Gold (`--gold`)
- Volleyball → Periwinkle (`--peri`)
- Football → Plum (`--plum`)
- Golf → Gray-300 (`--gray-300`)

## Section Structure (13 sections)

### 01 — Design Philosophy (NEW)

Three brand pillars:

1. **Athletic Precision** — sharp geometry, tight letter-spacing, structured grids. The sports world demands exactness.
2. **Premium Confidence** — plum and gold palette, bold weight typography, generous whitespace. Not budget athletics.
3. **Southeast Asian Energy** — warm undertones, dynamic contrast, movement in layout. Reflects the market and culture.

Each pillar: short paragraph + visual motif (color bar or icon treatment). Brief, punchy — sets the tone.

### 02 — Logo System (NEW)

Two marks:
- **Full logotype** — "KOSMAS / ATHLETIC VENTURES CO." with runner icon (existing)
- **Icon mark** — runner silhouette only (extract from existing logo PNG)

For each mark, show:
- Light-on-dark variant
- Dark-on-light variant
- Monochrome variant

Additional specs:
- Safe zone diagram (1x padding rule)
- Minimum size spec
- "Don't do this" row: no rotation, no gradient fills, no stretching, no recoloring

### 03 — Color Palette (EXISTS — enhance)

Keep current color grid. Add:
- Usage ratio guideline: 60-70% dark backgrounds, 20-30% plum/accent, 5-10% gold highlights
- Sport color assignments documented here as a sub-section

### 04 — Typography (EXISTS — enhance)

Keep current type scale. Add:
- More weight examples across the Rajdhani range (300-700)
- Pairing guidance: when to use which weight
- Sample paragraph showing body text readability

### 05 — Spacing & Grid (EXISTS — keep as-is)

No changes needed.

### 06 — Buttons (EXISTS — minor polish)

Keep current button grid. No structural changes.

### 07 — Tags & Badges (NEW)

Five tag variants:
1. **Sport tags** — "PICKLEBALL", "VOLLEYBALL", "FOOTBALL", "GOLF" — plum bg, gold text
2. **Status badges** — "ACTIVE", "SOLD OUT", "UPCOMING" — color-coded (gold/red/peri)
3. **Location tags** — "MANILA", "CEBU", "DAVAO" — ghost style with border
4. **Category labels** — "PREMIUM", "GROUP", "PRIVATE" — small caps, subtle bg
5. **Metric badges** — "4.8★", "12 SPOTS LEFT" — monospace, accent-colored

Each shown at default + compact size with specs (padding, font-size, border-radius, letter-spacing).

### 08 — Form Inputs (NEW)

Styled form elements consistent with dark theme:
- Text input
- Textarea
- Select dropdown
- Toggle switch (plum/gold active state)
- Checkbox and radio (custom styled)
- Search input with icon
- Date picker field

Each shown in four states: default, focus, error, disabled.

### 09 — Cards & Containers (EXISTS — keep as-is)

No changes needed.

### 10 — Navigation (NEW)

Full nav bar spec:
- Desktop: 64px height, logo left, links center, CTA button right
- Mobile: 56px height, hamburger menu icon, full-screen overlay
- Sticky positioning, dark background (`--gray-900`) with subtle border
- Active link: gold underline (2px)
- Specs: link gap 24px, font 13px weight 600, letter-spacing 2px
- Hover: color transition to `--gray-300`

### 11 — Footer (NEW)

Multi-column footer:
- Left column: logo (icon mark) + brand statement
- Three link columns: Experiences, Locations, Company
- Social links row (icons or text links)
- Copyright bar with subtle top border (`--gray-800`)
- Full-width dark background (`--black-deep`)

### 12 — Page Treatments (NEW — 6 sub-layouts)

Each is a self-contained mockup rendered inside a frame (like the existing sample layout), showing the brand applied to a real page type.

#### 12a: Marketing Landing Page
- Hero: gradient background (plum → dark), headline "PREMIER ATHLETIC EXPERIENCES"
- Sport cards grid: one card per sport with sport-color accent
- Testimonial band with quote and attribution
- CTA section with primary + secondary buttons

#### 12b: App Dashboard
- Top stats bar: 4 KPI cards (Active Members, Upcoming Sessions, Revenue, Utilization)
- Activity feed: recent bookings/events list
- Quick-action buttons row

#### 12c: Content Page
- Blog/article layout
- Title, author byline, date, read time
- Body text with headings, paragraph, blockquote
- Related articles grid at bottom
- Example: "Pickleball Courts: Our Top 5 in Manila"

#### 12d: CRUD Interface
- Filter bar with search input + sport dropdown + status filter
- Data table: columns (Name, Sport, Date, Status, Actions)
- Row actions: edit icon, delete icon
- Create button (primary) top-right
- Pagination controls at bottom
- Context: "Manage Bookings" or "Manage Members"

#### 12e: ERP Dashboard
- Left sidebar nav (collapsed icon style): Dashboard, Bookings, Members, Reports, Settings
- Top row: 4 KPI cards (Revenue, Bookings, Utilization %, NPS Score)
- Chart placeholder areas (2 across)
- Data table below: recent transactions or bookings
- Context: operations overview for running the business

#### 12f: Scheduling View
- Day/Week/Month toggle at top
- Week calendar grid with time slots (rows) and days (columns)
- Event cards placed in grid, color-coded by sport
- Booking modal mockup (overlay or inline): sport, date, time, court/field, participants
- Context: court/field scheduling

### 13 — Sample Layout (EXISTS — keep as closing showcase)

Existing sample layout stays as the final section. No changes.

## Logo Variant Creation

Extract the runner icon from `docs/brand/kosmas/kosmas-logo.png`:
- Create a cropped version with just the runner silhouette (no text)
- Base64-encode and embed alongside the full logotype
- Both used throughout the deck (icon mark in footer, nav; full logotype in hero, logo system section)

## TOC Navigation Update

Update the sticky nav to include all 13 sections. Given the count, use abbreviated labels:
PHILOSOPHY | LOGO | COLORS | TYPE | SPACING | BUTTONS | TAGS | FORMS | CARDS | NAV | FOOTER | PAGES | SAMPLE

## File Modified

- `docs/brand/kosmas/ui-treatment-deck.html` — all changes in this single file

# Kosmas UI Treatment Deck V3 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete rewrite of the Kosmas UI treatment deck HTML file around the new geometric star logo, warm editorial palette, and Josefin Sans + Outfit typography.

**Architecture:** Single self-contained HTML file. CSS variables define the design tokens. Sections are built incrementally — each task adds one section and commits. The file structure is: `<head>` (fonts, CSS variables, all styles) → `<body>` (sticky TOC nav, hero, 13 content sections, scroll-spy JS).

**Tech Stack:** HTML, CSS (custom properties, grid, flexbox), vanilla JavaScript (scroll-spy, tab switching), Google Fonts CDN (Josefin Sans, Outfit).

**Spec:** `docs/superpowers/specs/2026-03-12-kosmas-treatment-deck-v3-design.md`

**File:** `docs/brand/kosmas/ui-treatment-deck.html` — complete rewrite (currently 1812 lines, V2 plum/runner theme)

---

## Chunk 1: Foundation + Sections 01-02

### Task 1: Scaffold — HTML head, CSS variables, base styles, hero, TOC nav

**Files:**
- Rewrite: `docs/brand/kosmas/ui-treatment-deck.html`

This task replaces the entire file with the new V3 foundation. Everything after this task should be additive (appending sections).

- [ ] **Step 1: Base64-encode the new logo**

```bash
base64 -w 0 docs/brand/kosmas/logo2.jpg > /tmp/logo2-b64.txt
```

- [ ] **Step 2: Write the HTML file with head, styles, hero, and empty TOC**

Create the full HTML document structure:

**`<head>`:**
- Google Fonts link for Josefin Sans (wght 300;400;600;700) and Outfit (wght 300;400;500;600)
- CSS custom properties (from spec Color Palette table):
  - `--black: #1A1A1A`, `--cream: #F5F0E8`, `--cyan: #0CB4CE`, `--stone: #D4CFC4`, `--charcoal: #3D3D3D`, `--white: #FFFFFF`, `--error: #B33A3A`
  - Sport tints: `--tint-pickleball: #FDF8F0`, `--tint-volleyball: #F5F8F4`, `--tint-football: #F6F4F8`, `--tint-golf: #F2F5F8`
  - Sport borders: `--border-pickleball: #E8DFD0`, `--border-volleyball: #D8E0D5`, `--border-football: #DDD8E2`, `--border-golf: #D5DCE3`
  - `--font-heading: 'Josefin Sans', sans-serif`, `--font-body: 'Outfit', sans-serif`
  - `--space-unit: 8px`, `--max-width: 1080px`
- Reset: `* { margin:0; padding:0; box-sizing:border-box; }`
- `body`: `background: var(--cream); color: var(--black); font-family: var(--font-body); font-weight: 300; line-height: 1.6;`
- `.container`: `max-width: var(--max-width); margin: 0 auto; padding: 0 32px;`
- Section styles: `.section { padding: 64px 0; border-bottom: 1px solid var(--stone); }`
- Section header styles: `.section-number` (Outfit 500, 10px, uppercase, letter-spacing 2px, charcoal), `.section-title` (Josefin Sans 600, 28px, letter-spacing 2px, black)
- `html { scroll-behavior: smooth; }`

**Hero:**
- Cream bg, centered, 80px padding top/bottom
- Full logotype as base64 `<img>` (height 120px)
- Brand statement: Outfit 300, 15px, charcoal, max-width 600px

**Sticky TOC nav:**
- Position: sticky, top: 0, z-index: 100
- Cream bg, black bottom border (2px), 48px height
- Flexbox row of abbreviated section links (PHILOSOPHY | LOGO | ... | SAMPLE)
- Links: Outfit 500, 10px, uppercase, letter-spacing 1px, charcoal
- Active class: `.toc-link.active { color: var(--black); border-bottom: 2px solid var(--black); }`
- Each link is an `<a href="#section-01">` targeting section IDs

**Empty section containers:**
- 13 `<div class="section" id="section-XX">` elements with section-number and section-title only (content filled by subsequent tasks)

- [ ] **Step 3: Create the inline SVG star icon mark**

Study the logo2.jpg image. The star is an 8-pointed geometric star/compass rose with a hidden "K" shape. Recreate it as an inline SVG element defined once in a hidden `<svg>` defs block at top of body, then referenced via `<use>` throughout the deck.

The SVG should:
- Use `stroke` (not `fill`) for the cyan lines — `stroke="var(--cyan)"`, `stroke-width="1.5"`, `fill="none"`
- Be a `<symbol id="kosmas-star">` inside a hidden `<svg>` block
- Be referenceable via `<svg class="star-icon"><use href="#kosmas-star"/></svg>`
- Default size: 48px viewBox

- [ ] **Step 4: Verify in browser**

Open `docs/brand/kosmas/ui-treatment-deck.html` in browser. Confirm:
- Cream background, Josefin Sans + Outfit loading
- Logo visible in hero
- TOC nav is sticky and links are visible
- 13 empty section shells present

- [ ] **Step 5: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: scaffold Kosmas V3 treatment deck with warm editorial foundation"
```

---

### Task 2: Section 01 — Design Philosophy

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-01 content)

- [ ] **Step 1: Add section content**

Inside `#section-01`, add three brand pillar cards in a 3-column grid:

Each pillar card:
- White bg card, stone border, 6px border-radius, 24px padding
- Visual motif at top: a colored bar or the star icon with a treatment
  - Athletic Precision: thin black horizontal lines (CSS `repeating-linear-gradient`)
  - Premium Confidence: cream-to-white gradient block with generous whitespace
  - Southeast Asian Energy: bold black block with cyan accent line
- Pillar name: Josefin Sans 600, 20px
- Description: Outfit 300, 15px, charcoal

- [ ] **Step 2: Verify in browser**

Confirm 3 pillar cards render correctly on cream background.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Design Philosophy section (01)"
```

---

### Task 3: Section 02 — Logo System

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-02 content)

- [ ] **Step 1: Add logo variant grid**

Inside `#section-02`:

**Full logotype row:** 3 cards showing the base64 JPG logo:
1. Default on cream bg (as-is)
2. On dark bg (black container — use `mix-blend-mode: multiply` or CSS filter to remove white bg, OR just show the JPG in a black-bordered frame with a note that this variant requires a transparent PNG in production)
3. Monochrome (`filter: grayscale(1)`)

**Icon mark row:** 3 cards showing the inline SVG star:
1. Default: `stroke: var(--cyan)` on cream bg
2. On dark: same SVG on `var(--black)` bg
3. Monochrome: `stroke: var(--black)` on cream bg

**Safe zone diagram:**
- Star icon centered in a container with dashed border showing 1x padding rule
- Label: "Minimum clear space = 1× mark width on all sides"

**Minimum sizes:**
- Two side-by-side examples at min sizes: full logotype at 120px wide, icon mark at 32px

**"Don't do this" row:** 4 cards with red ✕ SVG overlay:
1. Rotated: `transform: rotate(15deg)`
2. Gradient-filled: CSS gradient overlay
3. Stretched: `transform: scaleX(1.5)`
4. Wrong colors: `filter: hue-rotate(90deg)`

- [ ] **Step 2: Verify in browser**

Confirm all logo variants render. Star SVG shows in cyan. Dark variant and monochrome work.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Logo System section (02) with SVG star icon"
```

---

## Chunk 2: Sections 03-06

### Task 4: Section 03 — Color Palette

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-03 content)

- [ ] **Step 1: Add palette grid**

Inside `#section-03`:

**Main palette:** 7 large swatch cards in a flex row. Each card:
- Square color swatch (80px × 80px, border-radius 6px)
- Color name (Outfit 500, 12px, uppercase)
- Hex value (Outfit 400, 12px, monospace)
- RGB value (Outfit 300, 11px, charcoal)

Colors: Black, Cream, Cyan, Stone, Charcoal, White, Error

**Usage ratio bar:** A horizontal stacked bar showing 65% cream, 30% black/charcoal, 5% cyan.

**Cyan usage rules:** A callout box with a cyan left border:
- "Cyan is an accent only. Never use for backgrounds, large surfaces, or primary buttons."
- "Use for: logo mark, text links, focus rings, hover highlights, metric callouts"

**Sport tints sub-section:** 4 cards showing the sport tint colors (from spec table), each with the sport name, bg hex, and border hex.

- [ ] **Step 2: Verify in browser**

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Color Palette section (03) with sport tints"
```

---

### Task 5: Section 04 — Typography

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-04 content)

- [ ] **Step 1: Add type scale and examples**

Inside `#section-04`:

**Type scale table:** Render the 8-level scale from the spec as live styled examples. Each row shows:
- Level name (Label style)
- The text sample rendered at actual size/weight/font (e.g., "Display" rendered as 48px Josefin Sans 300)
- Specs: size, weight, letter-spacing, line-height (Caption style)

**Weight showcase:** Two rows:
- Josefin Sans: "Kosmas Athletic" at weights 300, 400, 600, 700
- Outfit: "Premium Sports Management" at weights 300, 400, 500, 600

**Pairing guidance:** Short text block:
- "Use Josefin Sans for headlines, section titles, and display numbers"
- "Use Outfit for body text, labels, buttons, navigation, and captions"

**Body text sample:** A paragraph in Outfit 300 at 15px on a white card, showing readable body text at the designed line-height (1.6).

- [ ] **Step 2: Verify in browser**

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Typography section (04) with type scale"
```

---

### Task 6: Section 05 — Spacing & Grid

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-05 content)

- [ ] **Step 1: Add spacing scale visualization**

Inside `#section-05`:

**Spacing scale:** For each value in the scale (4, 8, 12, 16, 24, 32, 48, 64, 80), show:
- A horizontal black bar of that pixel width/height
- The pixel value and multiplier label (e.g., "8px — 1×")

**Grid example:** A 1080px max-width container with visible guides showing:
- Max width annotation
- 32px side padding
- Content area

- [ ] **Step 2: Verify in browser**

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Spacing & Grid section (05)"
```

---

### Task 7: Section 06 — Buttons

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-06 content)

- [ ] **Step 1: Add button variants grid**

Inside `#section-06`:

**Button CSS:** Add styles for `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-accent`, `.btn-disabled` matching spec:
- Shared: `font-family: var(--font-body); font-weight: 600; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; padding: 10px 28px; border-radius: 4px; border: none; cursor: pointer; transition: all 0.15s ease;`
- Primary: `background: var(--black); color: var(--cream);` hover: `background: var(--charcoal);`
- Secondary: `background: transparent; border: 2px solid var(--black); color: var(--black);` hover: `background: var(--black); color: var(--cream);`
- Ghost: `background: transparent; color: var(--charcoal);` hover: `background: var(--stone);`
- Accent: `background: var(--cyan); color: var(--black);` hover: `background: #0A9AB3;`
- Disabled: `opacity: 0.5; cursor: not-allowed;`

**Display:** 5 columns (one per variant), 2 rows (Default, Hover). The "Hover" row must show the hover appearance **statically** — apply the hover styles directly via inline `style` attributes or a `.btn-hover-preview` utility class, so both states are visible at rest without mousing over. Each cell has a label above it ("Default" / "Hover").

- [ ] **Step 2: Verify in browser** — hover each button to confirm state transitions.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Buttons section (06)"
```

---

## Chunk 3: Sections 07-09

### Task 8: Section 07 — Tags & Badges

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-07 content)

- [ ] **Step 1: Add tag variants**

Inside `#section-07`, five rows — one per tag type:

1. **Sport tags:** "PICKLEBALL", "VOLLEYBALL", "FOOTBALL", "GOLF" — all same style: `border: 1px solid var(--stone); color: var(--black); background: transparent; padding: 3px 10px; border-radius: 3px; font-family: var(--font-body); font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;`

2. **Status badges:** "ACTIVE" (`color: var(--cyan)`), "SOLD OUT" (`color: var(--charcoal); text-decoration: line-through`), "UPCOMING" (`background: var(--black); color: var(--cream)`)

3. **Location tags:** "MANILA", "CEBU", "DAVAO" — ghost: `color: var(--charcoal); border: none;`

4. **Category labels:** "PREMIUM", "GROUP", "PRIVATE" — `background: rgba(212,207,196,0.3); font-variant: small-caps;`

5. **Metric badges:** "4.8★", "12 SPOTS LEFT" — `color: var(--cyan); font-weight: 500;`

Each row: label on left, tag examples on right. Show default + compact size.

- [ ] **Step 2: Verify in browser**

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Tags & Badges section (07)"
```

---

### Task 9: Section 08 — Form Inputs

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-08 content)

- [ ] **Step 1: Add form input styles and examples**

Inside `#section-08`:

**CSS for form elements:**
- Input base: `background: var(--white); border: 1px solid var(--stone); border-radius: 4px; padding: 10px 12px; font-family: var(--font-body); font-size: 14px; font-weight: 300; color: var(--black); outline: none; transition: border-color 0.15s;`
- Focus: `border-color: var(--cyan);`
- Error: `border-color: var(--error);` with `.input-error-msg { color: var(--error); font-size: 12px; margin-top: 4px; }`
- Disabled: `opacity: 0.5; cursor: not-allowed;`
- Toggle: black circle on black track (active), stone track (inactive)
- Checkbox/radio: custom styled with black check/dot

**Layout:** One row per input type, 4 columns (Default, Focus, Error, Disabled). Column header labels above. 7 rows total (text, textarea, select, toggle, checkbox+radio, search, date).

The search input has an inline SVG magnifying glass icon.

- [ ] **Step 2: Verify in browser** — all 7 input types × 4 states render.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Form Inputs section (08)"
```

---

### Task 10: Section 09 — Cards & Containers

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-09 content)

- [ ] **Step 1: Add card examples**

Inside `#section-09`:

**Card CSS:**
- `.card { background: var(--white); border: 1px solid var(--stone); border-radius: 6px; padding: 24px; transition: all 0.15s ease; }`
- `.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }`

**Display:** Grid of example cards:
1. Basic card with title (Josefin Sans 600, 20px) + body text (Outfit 300)
2. Sport cards — 4 cards using sport tint backgrounds (pickleball, volleyball, football, golf) with sport name and session count
3. Stat card — large number (Josefin Sans 600, 30px) with label above
4. Image placeholder card — placeholder rectangle at top, title + description below

- [ ] **Step 2: Verify in browser** — cards render, hover shadow works.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Cards & Containers section (09)"
```

---

## Chunk 4: Sections 10-11

### Task 11: Section 10 — Navigation

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-10 content)

- [ ] **Step 1: Add navigation mockups**

Inside `#section-10`:

**Desktop nav mockup:** Rendered inside a bordered container (`.mockup-frame`):
- 64px height bar, cream bg, 2px black bottom border
- Left: star SVG icon (32px) via `<use href="#kosmas-star">`
- Center: HOME, EXPERIENCES, SCHEDULE, ABOUT, CONTACT — Outfit 500, 11px, uppercase, charcoal, letter-spacing 1px, gap 24px
- "SCHEDULE" styled as active (black text, 2px black underline)
- Right: "BOOK NOW" primary button (small size variant)

**Specs annotation:** Below the mockup, key specs labeled: height 64px, link gap 24px, font 11px/600, letter-spacing 1px.

**Mobile nav mockup:** Rendered as static open state:
- 56px header: star icon left, hamburger SVG icon right (3 horizontal lines)
- Below: full-width cream overlay panel, links stacked vertically centered, 24px gap
- "BOOK NOW" button at bottom of overlay

- [ ] **Step 2: Verify in browser**

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Navigation section (10)"
```

---

### Task 12: Section 11 — Footer

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-11 content)

- [ ] **Step 1: Add footer mockup**

Inside `#section-11`, a `.mockup-frame` containing:

- 2px black top border
- 4-column grid (padding 48px 0):
  - Col 1: Star icon SVG + "Kosmas Athletic Ventures" in Outfit 300, charcoal + short brand statement
  - Col 2: "EXPERIENCES" heading (Label style) + links: Pickleball, Volleyball, Football, Golf — Outfit 400, charcoal
  - Col 3: "LOCATIONS" heading + links: Manila, Cebu, Davao, Boracay
  - Col 4: "COMPANY" heading + links: About, Careers, Press, Contact
- Copyright bar below: stone top border, "© 2026 Kosmas Athletic Ventures Corporation" in Outfit 300, charcoal, padding 16px 0

- [ ] **Step 2: Verify in browser**

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Footer section (11)"
```

---

## Chunk 5: Section 12 — Page Treatments

### Task 13: Section 12 — Tab system + 12a Marketing Landing Page

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-12 content + JS)

- [ ] **Step 1: Add tab bar and first treatment**

Inside `#section-12`:

**Tab bar:** 6 tabs: "12A: LANDING", "12B: DASHBOARD", "12C: CONTENT", "12D: CRUD", "12E: ERP", "12F: SCHEDULE"
- Style: Outfit 500, 10px, uppercase, letter-spacing 1px
- Active tab: black text, 2px black bottom border
- Inactive: charcoal text
- Vanilla JS: `onclick` toggles visibility of `.page-treatment` divs

**12a mockup** (inside `.page-treatment#treatment-12a`):
- Hero band: cream bg, "PREMIER ATHLETIC EXPERIENCES" in Josefin Sans 300 48px, subtitle in Outfit 300, primary + secondary buttons
- Sport cards grid: 4 cards (one per sport) with sport tint backgrounds, sport name, session count, "Explore →" link
- Testimonial: centered italic quote in Josefin Sans 400, attribution below
- CTA section: "Ready to Play?" heading + primary button

- [ ] **Step 2: Add tab switching JavaScript**

```javascript
function showTreatment(id, clickedTab) {
  document.querySelectorAll('.page-treatment').forEach(el => el.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  document.querySelectorAll('.treatment-tab').forEach(el => el.classList.remove('active'));
  clickedTab.classList.add('active');
}
// onclick usage: onclick="showTreatment('treatment-12a', this)"
```

- [ ] **Step 3: Verify in browser** — tab bar renders, 12a visible by default.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Page Treatments section (12) with marketing landing (12a)"
```

---

### Task 14: 12b — App Dashboard

- [ ] **Step 1: Add 12b mockup**

Inside `.page-treatment#treatment-12b`:
- Top row: 4 KPI cards (Active Members: 186, Upcoming Sessions: 24, Revenue: $12,400, Utilization: 78%) — white bg, stone border, Josefin Sans 600 for numbers, Outfit label above
- Activity feed: 5 rows — each with time (Caption), description (Body), sport tag
- Quick actions row: 3 buttons (Book Session primary, Add Member secondary, View Reports ghost)

- [ ] **Step 2: Verify** — click "12B: DASHBOARD" tab, confirm layout.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add App Dashboard page treatment (12b)"
```

---

### Task 15: 12c — Content Page

- [ ] **Step 1: Add 12c mockup**

Inside `.page-treatment#treatment-12c`:
- Title: "Pickleball Courts: Our Top 5 in Manila" — Josefin Sans 600, 28px
- Meta: "By Sarah Chen · March 10, 2026 · 5 min read" — Outfit 300, charcoal
- Body text: 2-3 paragraphs in Outfit 300, 15px
- Blockquote: left 3px black border, italic Outfit 300, padded
- Related articles: 3 cards in a grid with title + sport tag + date

- [ ] **Step 2: Verify** — click 12C tab.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Content Page treatment (12c)"
```

---

### Task 16: 12d — CRUD Interface

- [ ] **Step 1: Add 12d mockup**

Inside `.page-treatment#treatment-12d`:
- Top bar: search input (with SVG magnifying glass) + sport select dropdown + status filter dropdown + "Create Booking" primary button (right-aligned)
- Data table:
  - Header row: black bg, cream text — columns: Name, Sport, Date, Status, Actions
  - 5 data rows: white bg, stone bottom border
  - Sport column: sport tag
  - Status column: status badge (ACTIVE, UPCOMING, etc.)
  - Actions column: edit (pencil SVG) + delete (trash SVG) icons in charcoal
- Pagination: "Showing 1-5 of 24" + prev/next buttons (secondary style, small)

- [ ] **Step 2: Verify** — click 12D tab.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add CRUD Interface treatment (12d)"
```

---

### Task 17: 12e — ERP Dashboard

- [ ] **Step 1: Add 12e mockup**

Inside `.page-treatment#treatment-12e`:
- Layout: flex row — sidebar (56px wide) + main content
- Sidebar: black bg, cream icons (5 inline SVGs stacked vertically: grid, calendar, people, chart, gear), 12px padding, active icon highlighted with cyan
- Main content:
  - 4 KPI cards in a row (Revenue: $48.2K, Bookings: 312, Utilization: 82%, NPS: 4.6)
  - 2 chart placeholder areas side by side (gray dashed border rectangles with "Revenue Chart" / "Booking Trends" labels)
  - Data table: recent transactions (5 rows with date, description, amount, status)

- [ ] **Step 2: Verify** — click 12E tab. Confirm dark sidebar renders.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add ERP Dashboard treatment (12e)"
```

---

### Task 18: 12f — Scheduling View

- [ ] **Step 1: Add 12f mockup**

Inside `.page-treatment#treatment-12f`:
- Top: "DAY / WEEK / MONTH" toggle (secondary button group, WEEK active/black)
- Calendar grid:
  - 7 column headers (Mon-Sun, current week)
  - 6 time slot rows (8AM, 10AM, 12PM, 2PM, 4PM, 6PM)
  - 4-5 event cards placed in grid cells using sport tint backgrounds:
    - "Pickleball — Mixed Doubles" (Mon 10AM, warm cream tint)
    - "Volleyball — Open Practice" (Tue 2PM, sage tint)
    - "Football — Youth League" (Wed 10AM, lavender tint)
    - "Golf — Private Lesson" (Fri 4PM, blue tint)
- Static booking modal overlay:
  - Semi-transparent backdrop: `rgba(26,26,26,0.4)`
  - White modal card, centered, 480px max-width
  - Title: "Book a Session" (Josefin Sans 600)
  - Form fields: Sport (select), Date (date input), Time (select), Court/Field (select), Participants (number input)
  - Buttons: "Confirm Booking" (primary) + "Cancel" (ghost)

- [ ] **Step 2: Verify** — click 12F tab. Modal overlay visible.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Scheduling View treatment (12f)"
```

---

## Chunk 6: Section 13 + Scroll-Spy + Polish

### Task 19: Section 13 — Sample Layout

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (section-13 content)

- [ ] **Step 1: Add full-page showcase**

Inside `#section-13`, a full-width `.mockup-frame` containing a complete composed page:

- **Nav bar:** 64px, cream bg, star icon left, links center, "BOOK NOW" button right (reuses nav styles from section 10)
- **Hero:** Full-width cream section, display headline "PREMIER ATHLETIC EXPERIENCES" (Josefin Sans 300, 48px), subtitle "World-class sports management for athletes, coaches, and venues across Southeast Asia." (Outfit 300), two buttons (primary "Get Started" + secondary "Learn More")
- **Sport cards grid:** 4 cards with sport tint backgrounds, each with sport name (H3), "X active sessions" (Body), "Explore →" link in cyan
- **Testimonial block:** Centered, large quote in Josefin Sans 400 italic, attribution in Outfit 300 charcoal
- **Footer:** 4-column layout matching section 11 design

- [ ] **Step 2: Verify in browser** — full composed page looks cohesive.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Sample Layout section (13)"
```

---

### Task 20: Scroll-Spy JavaScript

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html` (add JS at bottom)

- [ ] **Step 1: Add scroll-spy script**

At the bottom of `<body>`, add `<script>`:

```javascript
// Scroll-spy: highlight active TOC link
const sections = document.querySelectorAll('.section');
const tocLinks = document.querySelectorAll('.toc-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      tocLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-20% 0px -80% 0px' });

sections.forEach(section => observer.observe(section));
```

- [ ] **Step 2: Verify in browser** — scroll through sections, TOC highlights update.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add scroll-spy to TOC navigation"
```

---

### Task 21: Final Polish + Responsive

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add responsive breakpoint**

Add `@media (max-width: 768px)` rules:
- TOC nav: horizontal scroll with `overflow-x: auto; white-space: nowrap;`
- Section grids: collapse to single column
- Card grids: `grid-template-columns: 1fr`
- Page treatment mockups: allow horizontal scroll if needed
- Footer: stack columns vertically

- [ ] **Step 2: Full review pass**

Scroll through the entire deck. Check:
- All 13 sections present and populated
- Color palette matches spec (no old plum/gold colors remain)
- Typography is Josefin Sans + Outfit (no Rajdhani)
- Logo uses new star mark (no runner icon)
- Cyan appears only as accent
- Sport tints are subtle
- All interactive elements work (tabs, scroll-spy)

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add responsive breakpoints and final polish"
```

---

## Summary

| Task | Section | Description |
|------|---------|-------------|
| 1 | Foundation | HTML scaffold, CSS vars, hero, TOC, star SVG |
| 2 | 01 | Design Philosophy — 3 brand pillars |
| 3 | 02 | Logo System — variants, safe zones, don'ts |
| 4 | 03 | Color Palette — swatches, usage rules, sport tints |
| 5 | 04 | Typography — type scale, weights, pairing |
| 6 | 05 | Spacing & Grid — scale visualization |
| 7 | 06 | Buttons — 5 variants with hover states |
| 8 | 07 | Tags & Badges — 5 tag types |
| 9 | 08 | Form Inputs — 7 types × 4 states |
| 10 | 09 | Cards & Containers — card styles + sport tints |
| 11 | 10 | Navigation — desktop + mobile mockups |
| 12 | 11 | Footer — multi-column layout |
| 13 | 12 | Tab system + 12a Marketing Landing |
| 14 | 12b | App Dashboard |
| 15 | 12c | Content Page |
| 16 | 12d | CRUD Interface |
| 17 | 12e | ERP Dashboard |
| 18 | 12f | Scheduling View |
| 19 | 13 | Sample Layout — full composed page |
| 20 | JS | Scroll-spy |
| 21 | Polish | Responsive + final review |

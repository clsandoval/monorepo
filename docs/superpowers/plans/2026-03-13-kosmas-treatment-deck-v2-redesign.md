# Kosmas UI Treatment Deck V2 Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Kosmas UI treatment deck from scratch as a polished, mobile-first, light/dark togglable single HTML file with 13 sections.

**Architecture:** Single self-contained HTML file. CSS custom properties for theming (light/dark). Vanilla JS for toggle, scroll-spy, and tabs. Mobile-first responsive with 768px breakpoint. All assets base64-embedded.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript, Google Fonts (Rajdhani, Inter, JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-03-13-kosmas-treatment-deck-v2-redesign-design.md`

**Output file:** `docs/brand/kosmas/ui-treatment-deck.html`

**Logo source:** `docs/brand/kosmas/kosmas-logo-transparent.png` — base64 encode and embed. Do NOT use the SVG polygon trace. Use the actual PNG image file.

---

## Chunk 1: Foundation + Sections 01-02

### Task 1: HTML scaffold with CSS foundation

**Files:**
- Create: `docs/brand/kosmas/ui-treatment-deck.html` (replaces existing)

- [ ] **Step 1: Create the HTML file with doctype, head, fonts, and CSS custom properties**

Write the full HTML skeleton:
- `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with charset, viewport, title
- Google Fonts link: Rajdhani (400,500,600,700), Inter (400,500,600), JetBrains Mono (400) — include `&display=swap` in the URL
- `:root` CSS variables for light mode (all color tokens from spec)
- `[data-theme="dark"]` CSS variables for dark mode (all color tokens from spec)
- Spacing tokens (`--space-1` through `--space-10`)
- Sport color token: `--golf: #888888` (light) / `--golf: #BBBBBB` (dark) alongside the other sport colors that reuse existing tokens
- Base reset (`*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }`)
- `body` styles: `background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-weight: 400; line-height: 1.6;`
- Transition: `body, .section, .nav-bar { transition: background-color 0.2s ease, color 0.2s ease; }`
- `prefers-reduced-motion` media query to disable transitions
- `.container` class: `max-width: 1080px; margin: 0 auto; padding: 0 24px;` with `@media (min-width:768px) { padding: 0 32px; }`
- Section base styles (`.section`, `.section-number`, `.section-title`, `.section-desc`) per spec
- Responsive section title: 28px mobile, 36px desktop
- Empty `<body>` with just a placeholder `<main>` tag

- [ ] **Step 2: Verify the file opens in a browser**

Open `docs/brand/kosmas/ui-treatment-deck.html` in a browser. Should show a blank cream page. (Dark mode via OS preference won't work until Task 2 adds the JS init — that's expected.)

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): scaffold V2 redesign with CSS foundation and theming"
```

### Task 2: Sticky navigation + dark/light toggle

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the sticky nav HTML and CSS**

Nav structure:
```html
<nav class="nav-bar" role="navigation" aria-label="Section navigation">
  <div class="nav-scroll">
    <a href="#s01" class="nav-link active">PHILOSOPHY</a>
    <a href="#s02" class="nav-link">LOGO</a>
    <!-- ... all 13 section links ... -->
    <a href="#s13" class="nav-link">SAMPLE</a>
  </div>
  <button class="theme-toggle" aria-label="Toggle dark mode" onclick="toggleTheme()">
    <!-- Sun SVG (shown in dark mode) / Moon SVG (shown in light mode) -->
  </button>
</nav>
```

CSS:
- `.nav-bar`: `position: fixed; top: 0; left: 0; right: 0; height: 48px; z-index: 100; background: color-mix(in srgb, var(--bg) 90%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px;`
- Desktop: `height: 56px; padding: 0 32px;`
- `.nav-scroll`: `display: flex; gap: 16px; overflow-x: auto; flex: 1; scrollbar-width: none;` (hide scrollbar with `::-webkit-scrollbar { display: none; }`)
- `.nav-link`: `font-family: 'Inter'; font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); text-decoration: none; white-space: nowrap; padding: 14px 0; position: relative;`
- `.nav-link.active`: `color: var(--text);` with `::after` pseudo-element: `content:''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--gold); transition: transform 0.2s ease;`
- `.nav-link:hover`: `color: var(--gold);`
- `.theme-toggle`: `background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 8px; flex-shrink: 0; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;`
- Sun and moon inline SVGs, toggled via `[data-theme="dark"] .sun { display:block; } [data-theme="dark"] .moon { display:none; }` (and vice versa for light)
- `main` gets `padding-top: 48px` (mobile) / `56px` (desktop) to account for fixed nav

- [ ] **Step 2: Add the toggle JavaScript**

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('kosmas-theme', isDark ? 'light' : 'dark');
}
// Init from localStorage or OS preference
(function() {
  const saved = localStorage.getItem('kosmas-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
```

- [ ] **Step 3: Verify in browser**

Open in browser. Nav bar should be visible at top with all 13 section labels scrollable. Click the theme toggle — page should smoothly transition between light cream and dark black.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add sticky nav with dark/light toggle"
```

### Task 3: Hero section + base64 logo embed

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Base64 encode the logo PNG**

Run: `base64 -w0 docs/brand/kosmas/kosmas-logo-transparent.png`

Copy the output. This is the logo data URI: `data:image/png;base64,<output>`.

- [ ] **Step 2: Add the hero section HTML**

Insert after `<nav>`:
```html
<header class="hero">
  <div class="container">
    <img class="hero-logo" src="data:image/png;base64,..." alt="Kosmas Athletic Ventures Co.">
    <p class="hero-statement">PREMIER ATHLETIC EXPERIENCES IN SOUTHEAST ASIA</p>
  </div>
</header>
```

CSS:
- `.hero`: `padding: 80px 0 64px; text-align: center; border-bottom: 1px solid var(--border); margin-top: 48px;` (desktop: `margin-top: 56px; padding: 120px 0 80px;`)
- `.hero-logo`: `height: 80px; margin-bottom: 32px;` (desktop: `height: 120px;`)
- `[data-theme="dark"] .hero-logo`: `filter: invert(1);`
- `.hero-statement`: `font-family: 'Inter'; font-size: 11px; font-weight: 500; letter-spacing: 3px; color: var(--text-muted); text-transform: uppercase;`

- [ ] **Step 3: Verify in browser**

Logo should render centered on cream background. Toggle dark mode — logo should invert to white on dark background.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add hero section with embedded runner logo"
```

### Task 4: Section 01 — Design Philosophy

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the section HTML**

```html
<section class="section" id="s01">
  <div class="container">
    <div class="section-number">01</div>
    <h1 class="section-title">DESIGN PHILOSOPHY</h1>
    <p class="section-desc">Three pillars that define the Kosmas brand identity.</p>
    <div class="pillars">
      <div class="pillar">
        <h3 class="pillar-title">ATHLETIC PRECISION</h3>
        <p class="pillar-text">Sharp geometry, tight letter-spacing, structured grids. The sports world demands exactness — our design reflects that discipline.</p>
      </div>
      <div class="pillar">
        <h3 class="pillar-title">PREMIUM CONFIDENCE</h3>
        <p class="pillar-text">Plum and gold palette, bold weight typography, generous whitespace. This is not budget athletics — every pixel communicates quality.</p>
      </div>
      <div class="pillar">
        <h3 class="pillar-title">SOUTHEAST ASIAN ENERGY</h3>
        <p class="pillar-text">Warm undertones, dynamic contrast, movement in layout. Reflects the market, the culture, and the vibrancy of sport in the region.</p>
      </div>
    </div>
  </div>
</section>
```

CSS:
- `.pillars`: `display: flex; flex-direction: column; gap: 24px;`
- `.pillar`: `border-left: 4px solid var(--plum); padding-left: 24px;`
- `.pillar-title`: `font-family: 'Rajdhani'; font-weight: 600; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; color: var(--text); margin-bottom: 8px;`
- `.pillar-text`: `font-size: 15px; color: var(--text-secondary); max-width: 65ch; line-height: 1.6;`

- [ ] **Step 2: Verify in browser**

Three pillars stacked vertically with plum left borders. Text readable in both light and dark mode.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 01 — Design Philosophy"
```

### Task 5: Section 02 — Logo System

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the logo system section HTML + CSS**

Section with:
- **Full Logotype** sub-section: 2x3 grid (2-col mobile, 3-col desktop) showing:
  - Light-on-dark variant (dark bg card, logo with `filter: invert(1)` to appear white)
  - Dark-on-light variant (light bg card, logo as-is — already dark on transparent)
  - Monochrome variant (`filter: grayscale(1)`)
- **Icon Mark** sub-section: same 2x3 grid but with the runner cropped:
  ```css
  .icon-crop { width: 48px; height: 48px; overflow: hidden; display: inline-block; }
  .icon-crop img { height: 48px; object-fit: cover; object-position: right center; }
  ```
- **Safe Zone** sub-section: dashed border diagram with `1x` label
- **Minimum Sizes** sub-section: "Full logotype: min 120px wide. Icon mark: min 32px."
- **Don't Do This** sub-section: 4 cards (2x2 mobile, 4-col desktop):
  1. Rotated: `transform: rotate(15deg)`
  2. Gradient: CSS gradient overlay
  3. Stretched: `transform: scaleX(1.5)`
  4. Wrong colors: `filter: hue-rotate(90deg)`
  Each card has a red X SVG overlay and caption.

CSS:
- `.logo-grid`: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;` (desktop: `repeat(3, 1fr); gap: 24px;`)
- `.logo-variant`: `background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 32px; display: flex; align-items: center; justify-content: center; min-height: 120px;`
- `.logo-variant.dark-bg`: `background: var(--text); border-color: transparent;`
- `.logo-subsection`: `margin-top: 40px;`
- `.logo-subsection-title`: `font-family: 'Inter'; font-size: 11px; font-weight: 500; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px;`
- `.dont-grid`: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;` (desktop: `repeat(4, 1fr)`)
- `.dont-card`: `background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 24px 16px; text-align: center; position: relative;`
- `.dont-x`: red X inline SVG, positioned `top: 8px; right: 8px;`

- [ ] **Step 2: Verify in browser**

Logo grid shows correctly in both modes. Icon crops show just the runner. Don't cards render with CSS transforms and red X overlays. Check mobile — grids collapse to 2 columns.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 02 — Logo System"
```

---

## Chunk 2: Sections 03-06

### Task 6: Section 03 — Color Palette

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the color palette section**

Color grid showing all tokens. Each card:
```html
<div class="color-card">
  <div class="color-swatch" style="background: #F8F6F1;">
    <span style="color: #1A1A1A;">#F8F6F1</span>
  </div>
  <div class="color-info">
    <div class="color-name">Background</div>
    <div class="color-hex">--bg</div>
    <div class="color-usage">Page background</div>
  </div>
</div>
```

Show both light and dark palette grids (labeled sub-sections). Include:
- Usage ratio guideline text: "70% background/surface · 20% text · 10% accents"
- Sport color assignments sub-section: 4 sport cards each showing sport name + assigned color swatch

CSS:
- `.color-grid`: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;` (desktop: `repeat(4, 1fr)`)
- `.color-card`: `border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border);`
- `.color-swatch`: `height: 120px; display: flex; align-items: flex-end; padding: 12px 16px;`
- `.color-swatch span`: `font-family: 'JetBrains Mono'; font-size: 12px; font-weight: 400;`
- `.color-info`: `padding: 16px;`
- `.color-name`: `font-family: 'Rajdhani'; font-size: 16px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text); margin-bottom: 4px;`
- `.color-hex`: `font-family: 'JetBrains Mono'; font-size: 13px; color: var(--text-muted); margin-bottom: 8px;`
- `.color-usage`: `font-size: 12px; color: var(--text-secondary); line-height: 1.5;`

- [ ] **Step 2: Verify in browser**

Color swatches render with proper hex labels. Grid is 2-col mobile, 4-col desktop. Both light and dark palettes shown.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 03 — Color Palette"
```

### Task 7: Section 04 — Typography

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the typography section**

Type scale table with live-rendered samples. Each row:
```html
<div class="type-row">
  <div class="type-meta">
    <span class="type-level">Display</span>
    <span class="type-spec">Rajdhani 700 / 48px / 4px / 1.1</span>
  </div>
  <div class="type-sample" style="font-family:'Rajdhani';font-weight:700;font-size:48px;letter-spacing:4px;line-height:1.1;text-transform:uppercase;">
    KOSMAS
  </div>
</div>
```

All 9 type scale levels from spec. Plus:
- Weight examples sub-section: "Rajdhani 400", "Rajdhani 500", "Rajdhani 600", "Rajdhani 700" each rendered
- Pairing guidance text
- Body text readability paragraph (lorem-style athletic content)

CSS:
- `.type-row`: `padding: 24px 0; border-bottom: 1px solid var(--border);`
- Desktop: `display: grid; grid-template-columns: 200px 1fr; align-items: baseline; gap: 24px;`
- Mobile: stacked (meta above, sample below, gap 8px)
- `.type-meta`: `font-family: 'JetBrains Mono'; font-size: 12px; color: var(--text-muted); line-height: 1.6;`
- `.type-level`: `display: block; font-weight: 500; color: var(--text-secondary);`
- `.type-sample`: `color: var(--text);`

- [ ] **Step 2: Verify in browser**

Each type scale level renders at the correct size/weight/spacing. Samples are readable in both modes. Mobile stacks properly.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 04 — Typography"
```

### Task 8: Section 05 — Spacing & Grid

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the spacing section**

Visual spacing bars for each token:
```html
<div class="spacing-row">
  <div class="spacing-label">--space-1</div>
  <div class="spacing-bar" style="width: 8px;"><span>8</span></div>
  <div class="spacing-value">8px</div>
</div>
```

All 8 spacing tokens from spec.

CSS:
- `.spacing-row`: `display: flex; align-items: center; gap: 16px; margin-bottom: 12px;`
- `.spacing-label`: `width: 100px; font-family: 'JetBrains Mono'; font-size: 12px; color: var(--text-muted); text-align: right; flex-shrink: 0;`
- `.spacing-bar`: `height: 24px; background: var(--plum); border-radius: 4px; min-width: 8px;`
- `.spacing-value`: `font-family: 'JetBrains Mono'; font-size: 12px; color: var(--gold);`

- [ ] **Step 2: Verify in browser**

Bars render at correct widths. Labels readable. Works on mobile (bars truncate naturally, labels stay aligned).

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 05 — Spacing & Grid"
```

### Task 9: Section 06 — Buttons

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the buttons section**

4 button variants × 3 states (default, hover simulated with class, disabled):
```html
<div class="btn-grid">
  <div class="btn-group">
    <div class="btn-group-label">PRIMARY</div>
    <button class="btn btn-primary">BOOK NOW</button>
    <button class="btn btn-primary hover">BOOK NOW</button>
    <button class="btn btn-primary" disabled>BOOK NOW</button>
  </div>
  <!-- Secondary, Accent, Ghost groups -->
</div>
```

CSS:
- `.btn-grid`: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px;` (desktop: `repeat(3, 1fr)`)
- `.btn-group-label`: `font-family: 'Inter'; font-size: 11px; font-weight: 500; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px;`
- `.btn`: `font-family: 'Rajdhani'; font-weight: 600; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; min-height: 44px;`
- `.btn-primary`: `background: var(--text); color: var(--bg);`
- `.btn-primary:hover, .btn-primary.hover`: `opacity: 0.85;`
- `.btn-primary:disabled`: `opacity: 0.5; cursor: not-allowed;`
- `.btn-secondary`: `background: transparent; border: 1px solid var(--border); color: var(--text);`
- `.btn-secondary:hover, .btn-secondary.hover`: `border-color: var(--gold); color: var(--gold);`
- `.btn-accent`: `background: var(--plum); color: #FFFFFF;`
- `.btn-accent:hover, .btn-accent.hover`: `opacity: 0.85;`
- `.btn-ghost`: `background: transparent; border: none; color: var(--text); text-decoration: none;`
- `.btn-ghost:hover, .btn-ghost.hover`: `text-decoration: underline; text-decoration-color: var(--gold);`
- State labels under each button: `font-family: 'JetBrains Mono'; font-size: 10px; color: var(--text-muted); margin-top: 8px;`

- [ ] **Step 2: Verify in browser**

All 4 variants × 3 states render. Buttons have correct colors in both modes. Touch targets meet 44px minimum.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 06 — Buttons"
```

---

## Chunk 3: Sections 07-11

### Task 10: Section 07 — Tags & Badges

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the tags & badges section**

Five tag variant groups, each with default + compact sizes:

1. **Sport tags**: PICKLEBALL (gold bg), VOLLEYBALL (peri bg), FOOTBALL (plum bg, white text), GOLF (gray bg)
2. **Status badges**: ACTIVE (gold), SOLD OUT (error), UPCOMING (peri)
3. **Location tags**: MANILA, CEBU, DAVAO — ghost style (transparent bg, border)
4. **Category labels**: PREMIUM, GROUP, PRIVATE — subtle surface bg, small caps
5. **Metric badges**: "4.8★", "12 SPOTS LEFT" — mono font, gold color

CSS:
- `.tag`: `font-family: 'Inter'; font-weight: 500; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 12px; border-radius: 4px; display: inline-block;`
- `.tag-compact`: `font-size: 9px; padding: 4px 8px;`
- Sport-specific backgrounds and text colors
- `.tag-ghost`: `background: transparent; border: 1px solid var(--border); color: var(--text);`
- `.tag-metric`: `font-family: 'JetBrains Mono'; color: var(--gold);`
- Tag group layout: flex wrap with gap

Spec annotations (padding, font-size, border-radius, letter-spacing) shown in mono text next to each variant.

- [ ] **Step 2: Verify in browser**

All 5 tag groups render with correct colors. Compact variants visibly smaller. Both modes look correct.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 07 — Tags & Badges"
```

### Task 11: Section 08 — Form Inputs

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the form inputs section**

Input types: text, textarea, select, toggle switch, checkbox, radio, search (with magnifying glass SVG), date picker.

Each input type shown in 4 states:
- Default
- Focus (simulated with `.focus` class — gold border)
- Error (`.error` class — error border + message)
- Disabled (`disabled` attribute)

Desktop layout: 4 states in a row. Mobile: 1 per row stacked. State label above each cell.

CSS:
- `.form-grid`: `display: grid; grid-template-columns: 1fr; gap: 24px;` (desktop: `repeat(4, 1fr)`)
- `.form-state-label`: `font-family: 'Inter'; font-size: 10px; font-weight: 500; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;`
- Base input: `font-family: 'Inter'; font-size: 15px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--text); width: 100%;`
- `.input-focus, input:focus`: `border-color: var(--gold); outline: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--gold) 20%, transparent);`
- `.input-error`: `border-color: var(--error);`
- `.error-message`: `font-size: 12px; color: var(--error); margin-top: 4px;`
- `input:disabled`: `opacity: 0.5; cursor: not-allowed;`
- Toggle switch: custom CSS toggle using checkbox + label with `--plum`/`--gold` active state
- Checkbox/radio: custom styled with `appearance: none` + pseudo-elements
- Search input: `padding-left: 40px;` with positioned magnifying glass SVG

- [ ] **Step 2: Verify in browser**

All input types render in all 4 states. Gold focus rings visible. Error messages show. Disabled inputs dimmed. Toggle switch animates. Mobile stacks properly.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 08 — Form Inputs"
```

### Task 12: Section 09 — Cards & Containers

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the cards section**

Three card variants:
```html
<div class="card-grid">
  <div class="card">
    <h3 class="card-title">DEFAULT CARD</h3>
    <p class="card-text">Standard container for content grouping.</p>
  </div>
  <div class="card card-featured">
    <h3 class="card-title">FEATURED CARD</h3>
    <p class="card-text">Highlighted with plum accent border.</p>
  </div>
  <div class="card card-sport" style="--sport-color: var(--gold);">
    <h3 class="card-title">PICKLEBALL</h3>
    <p class="card-text">Sport-specific with top color accent.</p>
  </div>
  <!-- Volleyball, Football, Golf cards -->
</div>
```

CSS:
- `.card-grid`: `display: grid; grid-template-columns: 1fr; gap: 24px;` (desktop: `repeat(3, 1fr)`)
- `.card`: `background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 24px;`
- `.card-featured`: `border-left: 4px solid var(--plum);`
- `.card-sport`: `border-top: 4px solid var(--sport-color);`
- `.card-title`: `font-family: 'Rajdhani'; font-weight: 600; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; color: var(--text); margin-bottom: 8px;`
- `.card-text`: `font-size: 14px; color: var(--text-secondary); line-height: 1.6;`

- [ ] **Step 2: Verify in browser**

All card variants render with correct borders/accents. Grid collapses on mobile. Both modes look correct.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 09 — Cards & Containers"
```

### Task 13: Section 10 — Navigation Mockup

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the navigation mockups section**

Two mockups stacked inside `.mockup-frame` containers:

**Desktop mockup:**
```html
<div class="mockup-frame">
  <div class="mockup-label">DESKTOP — 1280px</div>
  <div class="mock-nav-desktop">
    <div class="mock-nav-logo"><!-- cropped runner icon --></div>
    <div class="mock-nav-links">HOME · EXPERIENCES · SCHEDULE · ABOUT · CONTACT</div>
    <button class="btn btn-primary btn-sm">JOIN NOW</button>
  </div>
</div>
```

**Mobile mockup:**
```html
<div class="mockup-frame">
  <div class="mockup-label">MOBILE — 375px</div>
  <div class="mock-nav-mobile">
    <div class="mock-mobile-header">
      <div class="mock-nav-logo"><!-- icon --></div>
      <div class="mock-hamburger"><!-- 3 line SVG --></div>
    </div>
    <div class="mock-mobile-overlay">
      <!-- Full-screen menu rendered as static open state -->
      <a>HOME</a><a>EXPERIENCES</a><a>SCHEDULE</a><a>ABOUT</a><a>CONTACT</a>
      <button class="btn btn-primary">JOIN NOW</button>
    </div>
  </div>
</div>
```

Spec annotations: include spec callouts (height, font specs, gap values) as mono-text labels next to each mockup.

CSS for mockup frames:
- `.mockup-frame`: `background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden;`
- `.mockup-label`: `font-family: 'Inter'; font-size: 10px; font-weight: 500; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; padding: 12px 16px; border-bottom: 1px solid var(--border);`
- Mock nav styled to look like actual nav components per spec

- [ ] **Step 2: Verify in browser**

Both desktop and mobile nav mockups render inside their frames. Mobile overlay shown as static expanded state.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 10 — Navigation mockup"
```

### Task 14: Section 11 — Footer Mockup

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the footer section**

Multi-column footer rendered inside a mockup frame:
```html
<div class="mockup-frame">
  <div class="mockup-label">FOOTER</div>
  <div class="mock-footer">
    <div class="mock-footer-grid">
      <div class="mock-footer-brand">
        <img class="mock-footer-logo" src="data:image/png;base64,..." alt="Kosmas">
        <p>Premier athletic experiences in Southeast Asia.</p>
      </div>
      <div class="mock-footer-col">
        <h4>EXPERIENCES</h4>
        <a>Pickleball</a><a>Volleyball</a><a>Football</a><a>Golf</a>
      </div>
      <div class="mock-footer-col">
        <h4>LOCATIONS</h4>
        <a>Manila</a><a>Cebu</a><a>Davao</a>
      </div>
      <div class="mock-footer-col">
        <h4>COMPANY</h4>
        <a>About</a><a>Careers</a><a>Contact</a><a>Press</a>
      </div>
    </div>
    <div class="mock-footer-social">
      <!-- Social links row: inline SVG icons or text links for Instagram, Facebook, TikTok -->
    </div>
    <div class="mock-footer-bar">
      © 2026 Kosmas Athletic Ventures Co. All rights reserved.
    </div>
  </div>
</div>
```

CSS:
- `.mock-footer`: `background: var(--bg); padding: 48px 32px 24px;`
- `.mock-footer-grid`: `display: grid; grid-template-columns: 1fr; gap: 32px;` (desktop: `2fr 1fr 1fr 1fr`)
- `.mock-footer-logo`: `height: 40px; margin-bottom: 16px;` (with dark mode invert)
- `.mock-footer-col h4`: `font-family: 'Rajdhani'; font-weight: 600; font-size: 14px; letter-spacing: 2px; color: var(--text); margin-bottom: 12px;`
- `.mock-footer-col a`: `display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; text-decoration: none;`
- `.mock-footer-bar`: `border-top: 1px solid var(--border); margin-top: 32px; padding-top: 16px; font-size: 12px; color: var(--text-muted);`

- [ ] **Step 2: Verify in browser**

Footer renders in mockup frame. 4-col desktop, stacked mobile. Logo inverts in dark mode. Copyright bar at bottom.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 11 — Footer mockup"
```

---

## Chunk 4: Section 12 (Page Treatments)

### Task 15: Section 12 — Tab bar + Treatment 12a (Marketing Landing Page)

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add section 12 with tab bar and first treatment**

Tab bar for switching between 6 sub-layouts:
```html
<section class="section" id="s12">
  <div class="container">
    <div class="section-number">12</div>
    <h1 class="section-title">PAGE TREATMENTS</h1>
    <p class="section-desc">Six application layouts demonstrating the brand system in context.</p>
    <div class="treatment-tabs">
      <button class="treatment-tab active" onclick="showTreatment('12a', event)">LANDING</button>
      <button class="treatment-tab" onclick="showTreatment('12b', event)">DASHBOARD</button>
      <button class="treatment-tab" onclick="showTreatment('12c', event)">CONTENT</button>
      <button class="treatment-tab" onclick="showTreatment('12d', event)">CRUD</button>
      <button class="treatment-tab" onclick="showTreatment('12e', event)">ERP</button>
      <button class="treatment-tab" onclick="showTreatment('12f', event)">SCHEDULE</button>
    </div>
    <div class="treatment-panels">
      <div class="treatment-panel active" id="t12a">
        <!-- 12a: Marketing Landing Page mockup -->
      </div>
      <!-- other panels hidden -->
    </div>
  </div>
</section>
```

Tab JS:
```javascript
function showTreatment(id, evt) {
  document.querySelectorAll('.treatment-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.treatment-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('t' + id).classList.add('active');
  evt.currentTarget.classList.add('active');
}
```

CSS:
- `.treatment-tabs`: `display: flex; gap: 8px; overflow-x: auto; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px;`
- `.treatment-tab`: `font-family: 'Inter'; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px 16px; white-space: nowrap; min-height: 44px;`
- `.treatment-tab.active`: `color: var(--text); border-bottom: 2px solid var(--gold);`
- `.treatment-panel`: `display: none; opacity: 0; transition: opacity 0.15s ease;`
- `.treatment-panel.active`: `display: block; opacity: 1;`

**12a: Marketing Landing Page** content inside mockup frame:
- Hero band: gradient or solid plum/dark bg with "PREMIER ATHLETIC EXPERIENCES" headline
- Sport cards grid (4 cards, 2-col mobile, 4-col desktop): each with sport-color top accent
- Testimonial band: quote + attribution
- CTA section: headline + primary + secondary buttons

- [ ] **Step 2: Verify in browser**

Tab bar renders. Clicking tabs switches panels. 12a shows landing page mockup. Works in both modes.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 12 tab bar + treatment 12a Landing Page"
```

### Task 16: Treatments 12b + 12c

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add treatment 12b — App Dashboard**

Inside `#t12b` panel:
- Top stats bar: 4 KPI cards in a row (1-col mobile, 4-col desktop): Active Members (248), Upcoming Sessions (12), Revenue (₱1.2M), Utilization (78%)
- Activity feed: 5 recent booking items (time, name, sport, status badge)
- Quick-action buttons row: "New Booking", "Add Member", "View Reports"

- [ ] **Step 2: Add treatment 12c — Content Page**

Inside `#t12c` panel:
- Article header: title "Pickleball Courts: Our Top 5 in Manila", author byline, date "March 10, 2026", read time "5 min read"
- Body text: 2-3 paragraphs with a heading and a blockquote
- Related articles grid (3 cards, 1-col mobile, 3-col desktop)

- [ ] **Step 3: Verify in browser**

Both treatments render correctly via tab switching. KPI cards, activity feed, article layout all look polished in both modes.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add treatments 12b Dashboard + 12c Content Page"
```

### Task 17: Treatments 12d + 12e

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add treatment 12d — CRUD Interface**

Inside `#t12d` panel:
- Filter bar: search input + sport dropdown + status filter (inline on desktop, stacked mobile)
- Data table: columns Name, Sport, Date, Status, Actions
- 5 sample rows with sport tags, status badges, edit/delete icon buttons
- "Create Booking" primary button top-right
- Pagination: "← 1 2 3 4 5 →" row

- [ ] **Step 2: Add treatment 12e — ERP Dashboard**

Inside `#t12e` panel:
- Left sidebar nav (collapsed icon style): 5 items with inline SVG icons (grid, calendar, people, chart, gear)
- Main area:
  - Top row: 4 KPI cards (Revenue ₱2.4M, Bookings 1,847, Utilization 82%, NPS 67)
  - 2 chart placeholder areas (side by side on desktop)
  - Data table: recent transactions (5 rows)

- [ ] **Step 3: Verify in browser**

CRUD table is readable and horizontally scrollable on mobile. ERP sidebar + main layout renders correctly. Dark mode inverts properly.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add treatments 12d CRUD + 12e ERP Dashboard"
```

### Task 18: Treatment 12f

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add treatment 12f — Scheduling View**

Inside `#t12f` panel:
- Day/Week/Month toggle buttons at top
- Week calendar grid: 7 day columns × 8 time slot rows (8AM-4PM)
- 4-5 event cards placed in grid cells, color-coded by sport (using sport color tokens)
- Static booking modal overlay: semi-transparent backdrop + modal card with form fields (sport select, date, time, court/field, participants) + "Confirm Booking" button
- Mobile: calendar scrolls horizontally, modal is full-width

- [ ] **Step 2: Verify in browser**

Calendar grid renders with colored event blocks. Modal overlay visible on top. Mobile scrolls horizontally. Both modes work.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add treatment 12f Scheduling View"
```

---

## Chunk 5: Section 13 + Scroll-spy + Polish

### Task 19: Section 13 — Sample Layout

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the sample layout section**

Full-width responsive sample combining multiple components as a closing showcase:
- Nav bar (desktop style)
- Hero section with logo, headline, CTA buttons
- Featured sports grid (4 sport cards)
- Stats row
- Testimonial
- Footer

All rendered inside a single large mockup frame with "SAMPLE LAYOUT — FULL PAGE" label.

- [ ] **Step 2: Verify in browser**

Sample layout renders as a complete mini-page inside the frame. Responsive within the frame. Both modes work.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add section 13 — Sample Layout"
```

### Task 20: Scroll-spy JavaScript

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add the scroll-spy logic**

```javascript
(function() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
        // Auto-scroll active link into view on mobile
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
          activeLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));
})();
```

- [ ] **Step 2: Verify in browser**

Scroll through the page. Nav link highlighting follows the current section. On mobile, the active nav link auto-scrolls into the visible area of the horizontal nav.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): add scroll-spy navigation highlighting"
```

### Task 21: Mobile polish pass

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Review and fix mobile layout issues**

Open the deck at 375px viewport width. Walk through every section and fix:
- Any horizontal overflow (nothing should cause page-level horizontal scroll)
- Grids that don't collapse properly
- Text that's too small (nothing below 13px body)
- Touch targets below 44px
- Spacing that's too tight or too generous on mobile
- Nav bar scrollability and toggle accessibility

- [ ] **Step 2: Verify in browser at multiple widths**

Test at: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop). No horizontal scroll at any width. All sections readable and properly laid out.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "fix(kosmas): mobile layout polish pass"
```

### Task 22: Final accessibility + quality pass

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add focus-visible styles and reduced motion**

Ensure:
- All interactive elements (nav links, toggle, tabs, buttons) have `:focus-visible` outlines: `outline: 2px solid var(--gold); outline-offset: 2px;`
- `@media (prefers-reduced-motion: reduce)` disables all transitions/animations
- Semantic HTML: `<nav>`, `<main>`, `<section>`, proper heading hierarchy (h1 for section titles, h2/h3 within sections — never skip levels)
- All images have `alt` attributes
- Toggle button has `aria-label`
- `font-display: swap` added to font link

- [ ] **Step 2: Dark/light mode full walkthrough**

Toggle between modes. Verify every section looks correct in both. No elements with hardcoded colors that don't switch. Logo inverts properly everywhere it appears.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat(kosmas): accessibility and final quality pass"
```

### Task 23: Playwright browser verification

**Files:**
- None (verification only)

- [ ] **Step 1: Open the deck in a browser and verify**

Open `docs/brand/kosmas/ui-treatment-deck.html` in a browser. Systematically check:

1. Page loads without errors (check console)
2. Light mode: cream background, dark text, plum/gold accents
3. Dark mode toggle: smooth transition, dark background, inverted logo
4. Nav scroll-spy: scrolling highlights correct section
5. Mobile (375px): no horizontal overflow, all grids collapsed, nav scrollable
6. Tablet (768px): grids expand to desktop layouts
7. Section 12 tabs: all 6 treatments switch correctly
8. All 13 sections present and labeled correctly
9. Focus outlines visible when tabbing through interactive elements
10. No broken images or missing fonts

- [ ] **Step 2: Fix any issues found and commit**

If issues found, fix them and commit with descriptive message.

- [ ] **Step 3: Final commit if clean**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "verify(kosmas): treatment deck V2 redesign complete"
```
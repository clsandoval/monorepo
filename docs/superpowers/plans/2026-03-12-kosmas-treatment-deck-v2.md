# Kosmas UI Treatment Deck V2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Kosmas UI treatment deck from 6 to 13 sections — a comprehensive brand system with design philosophy, logo system, component specs, and 6 page treatment mockups.

**Architecture:** Single self-contained HTML file. All new sections follow the existing pattern (`.section` div with `.section-number`, `.section-title`, `.section-desc`). New CSS goes in the existing `<style>` block. Vanilla JS at the bottom for tab switching and scroll-spy. Inline SVGs for all icons. No external dependencies beyond Google Fonts (Rajdhani).

**Tech Stack:** HTML, CSS (custom properties), vanilla JavaScript, inline SVG

---

## File Structure

- **Modify:** `docs/brand/kosmas/ui-treatment-deck.html` — the single treatment deck file (all changes here)
- **Reference:** `docs/superpowers/specs/2026-03-11-kosmas-treatment-deck-v2-design.md` — approved spec

---

## Task 1: Renumber existing sections and update TOC

The existing sections (01-06) need new numbers to accommodate 7 new sections inserted before, between, and after them. Update section numbers, IDs, and the TOC nav.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

**New section mapping:**
| Old | Old Title | New # | New ID |
|-----|-----------|-------|--------|
| 01 Color Palette | → 03 | `#colors` (keep) |
| 02 Typography | → 04 | `#typography` (keep) |
| 03 Spacing & Grid | → 05 | `#spacing` (keep) |
| 04 Buttons | → 06 | `#buttons` (keep) |
| 05 Cards & Containers | → 09 | `#cards` (keep) |
| 06 Sample Layout | → 13 | `#sample` (keep) |

- [ ] **Step 1: Update section numbers in HTML**

Change the `.section-number` text content for each existing section:
- `01` → `03` (Color Palette)
- `02` → `04` (Typography)
- `03` → `05` (Spacing & Grid)
- `04` → `06` (Buttons)
- `05` → `09` (Cards & Containers)
- `06` → `13` (Sample Layout)

- [ ] **Step 2: Replace the TOC nav**

Replace the existing `<nav>` block (after `</div>` closing hero, before `<div class="container">`) with all 13 section links:

```html
<nav id="toc-nav" style="background:var(--gray-900);border-bottom:1px solid var(--gray-800);padding:12px 0;position:sticky;top:0;z-index:100;">
  <div style="max-width:1080px;margin:0 auto;padding:0 32px;display:flex;gap:20px;overflow-x:auto;">
    <a href="#philosophy" class="toc-link">PHILOSOPHY</a>
    <a href="#logo" class="toc-link">LOGO</a>
    <a href="#colors" class="toc-link">COLORS</a>
    <a href="#typography" class="toc-link">TYPE</a>
    <a href="#spacing" class="toc-link">SPACING</a>
    <a href="#buttons" class="toc-link">BUTTONS</a>
    <a href="#tags" class="toc-link">TAGS</a>
    <a href="#forms" class="toc-link">FORMS</a>
    <a href="#cards" class="toc-link">CARDS</a>
    <a href="#nav" class="toc-link">NAV</a>
    <a href="#footer" class="toc-link">FOOTER</a>
    <a href="#pages" class="toc-link">PAGES</a>
    <a href="#sample" class="toc-link">SAMPLE</a>
  </div>
</nav>
```

- [ ] **Step 3: Add TOC link CSS**

Add to the `<style>` block:

```css
.toc-link {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--gray-500);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}
.toc-link:hover { color: var(--gray-300); }
.toc-link.active { color: var(--gold); }
```

- [ ] **Step 4: Verify in browser**

Open the file. TOC should show 13 links. Existing sections should display with new numbers. Clicking a link should smooth-scroll to the section.

- [ ] **Step 5: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "refactor: renumber sections and expand TOC for treatment deck V2"
```

---

## Task 2: Add Section 01 — Design Philosophy

Insert new section before the Color Palette section, inside `<div class="container">`.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add CSS for philosophy pillars**

```css
.pillar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; }
.pillar-card {
  background: var(--gray-900);
  border: 1px solid var(--gray-800);
  border-radius: 8px;
  padding: 32px 24px;
  border-top: 3px solid var(--plum);
}
.pillar-card:nth-child(2) { border-top-color: var(--gold); }
.pillar-card:nth-child(3) { border-top-color: var(--peri); }
.pillar-card h3 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.pillar-card:nth-child(1) h3 { color: var(--plum-light); }
.pillar-card:nth-child(2) h3 { color: var(--gold); }
.pillar-card:nth-child(3) h3 { color: var(--peri); }
.pillar-card p { font-size: 15px; color: var(--gray-300); line-height: 1.7; }
```

- [ ] **Step 2: Insert section HTML**

Insert immediately after `<div class="container">`, before the Color Palette comment:

```html
<!-- ==================== 1. DESIGN PHILOSOPHY ==================== -->
<div class="section" id="philosophy">
  <div class="section-number">01</div>
  <div class="section-title">Design Philosophy</div>
  <div class="section-desc">Three pillars define every Kosmas interface. Together they create a visual language that is athletic, premium, and distinctly Southeast Asian.</div>

  <div class="pillar-grid">
    <div class="pillar-card">
      <h3>Athletic Precision</h3>
      <p>Sharp geometry, tight letter-spacing, structured grids. Every pixel earns its place. The sports world demands exactness — our interfaces deliver it.</p>
    </div>
    <div class="pillar-card">
      <h3>Premium Confidence</h3>
      <p>Plum and gold palette, bold weight typography, generous whitespace. This is not budget athletics. Every element communicates quality without saying it.</p>
    </div>
    <div class="pillar-card">
      <h3>Southeast Asian Energy</h3>
      <p>Warm undertones, dynamic contrast, movement in layout. Our market is vibrant — Manila, Cebu, Davao. The design reflects that energy.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify in browser**

Section 01 should appear at the top with three pillar cards, each with a colored top border (plum, gold, periwinkle).

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Design Philosophy section to treatment deck"
```

---

## Task 3: Add Section 02 — Logo System

Insert between Design Philosophy and Color Palette. Includes the CSS-cropped icon variant, 2×3 variant grid, safe zone diagram, and "don't do this" row.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add logo system CSS**

```css
.logo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; }
.logo-variant {
  background: var(--gray-900);
  border: 1px solid var(--gray-800);
  border-radius: 8px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}
.logo-variant.light-bg { background: var(--white); }
.logo-variant img { max-height: 60px; }
.logo-variant .icon-crop {
  width: 48px;
  height: 48px;
  overflow: hidden;
  display: inline-block;
}
.logo-variant .icon-crop img {
  height: 48px;
  object-fit: cover;
  object-position: left center;
}
.logo-subsection { margin-top: 40px; }
.logo-subsection-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--gray-300);
  margin-bottom: 16px;
  text-transform: uppercase;
}
.safe-zone {
  display: inline-block;
  border: 2px dashed var(--gray-500);
  padding: 24px;
  border-radius: 4px;
  position: relative;
}
.safe-zone::after {
  content: '1x';
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 11px;
  color: var(--gray-500);
  letter-spacing: 1px;
}
.dont-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
.dont-card {
  background: var(--gray-900);
  border: 1px solid var(--gray-800);
  border-radius: 8px;
  padding: 24px 16px;
  text-align: center;
  position: relative;
}
.dont-card img { max-height: 40px; margin-bottom: 12px; }
.dont-card .dont-x {
  position: absolute;
  top: 8px;
  right: 8px;
}
.dont-card p { font-size: 12px; color: var(--gray-500); letter-spacing: 1px; text-transform: uppercase; }
```

- [ ] **Step 2: Insert logo system section HTML**

Insert after Design Philosophy section, before Color Palette comment. This section uses the existing `LOGO_SRC` JavaScript variable already defined at the bottom of the file. Add new IDs for the logo images so JS can set their `src`.

```html
<!-- ==================== 2. LOGO SYSTEM ==================== -->
<div class="section" id="logo">
  <div class="section-number">02</div>
  <div class="section-title">Logo System</div>
  <div class="section-desc">Two marks: the full logotype and the icon mark. Use the full logotype for hero sections and brand-forward contexts. Use the icon mark for nav, favicons, and compact spaces.</div>

  <!-- Full Logotype Variants -->
  <div class="logo-subsection">
    <div class="logo-subsection-title">Full Logotype</div>
    <div class="logo-grid">
      <div class="logo-variant">
        <img class="logo-sys-full" alt="Kosmas logotype on dark" style="filter:invert(1);mix-blend-mode:screen;">
      </div>
      <div class="logo-variant light-bg">
        <img class="logo-sys-full" alt="Kosmas logotype on light" style="max-height:60px;">
      </div>
      <div class="logo-variant">
        <img class="logo-sys-full" alt="Kosmas logotype monochrome" style="filter:invert(1) grayscale(1);mix-blend-mode:screen;">
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-top:8px;">
      <span style="flex:1;text-align:center;font-size:12px;color:var(--gray-500);letter-spacing:1px;">LIGHT ON DARK</span>
      <span style="flex:1;text-align:center;font-size:12px;color:var(--gray-500);letter-spacing:1px;">DARK ON LIGHT</span>
      <span style="flex:1;text-align:center;font-size:12px;color:var(--gray-500);letter-spacing:1px;">MONOCHROME</span>
    </div>
  </div>

  <!-- Icon Mark Variants -->
  <div class="logo-subsection">
    <div class="logo-subsection-title">Icon Mark</div>
    <div class="logo-grid">
      <div class="logo-variant">
        <div class="icon-crop"><img class="logo-sys-icon" alt="Icon mark on dark" style="filter:invert(1);mix-blend-mode:screen;"></div>
      </div>
      <div class="logo-variant light-bg">
        <div class="icon-crop"><img class="logo-sys-icon" alt="Icon mark on light"></div>
      </div>
      <div class="logo-variant">
        <div class="icon-crop"><img class="logo-sys-icon" alt="Icon mark mono" style="filter:invert(1) grayscale(1);mix-blend-mode:screen;"></div>
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-top:8px;">
      <span style="flex:1;text-align:center;font-size:12px;color:var(--gray-500);letter-spacing:1px;">LIGHT ON DARK</span>
      <span style="flex:1;text-align:center;font-size:12px;color:var(--gray-500);letter-spacing:1px;">DARK ON LIGHT</span>
      <span style="flex:1;text-align:center;font-size:12px;color:var(--gray-500);letter-spacing:1px;">MONOCHROME</span>
    </div>
  </div>

  <!-- Safe Zone & Minimum Size -->
  <div class="logo-subsection">
    <div class="logo-subsection-title">Safe Zone & Minimum Size</div>
    <div style="display:flex;gap:48px;align-items:center;">
      <div>
        <div class="safe-zone">
          <img class="logo-sys-safe" alt="Safe zone" style="height:50px;filter:invert(1);mix-blend-mode:screen;">
        </div>
        <p style="font-size:12px;color:var(--gray-500);margin-top:8px;letter-spacing:1px;">1× PADDING ON ALL SIDES</p>
      </div>
      <div>
        <p style="font-size:14px;color:var(--gray-300);line-height:1.8;">
          Full logotype: min <strong style="color:var(--gold);">120px</strong> wide<br>
          Icon mark: min <strong style="color:var(--gold);">32px</strong>
        </p>
      </div>
    </div>
  </div>

  <!-- Don't Do This -->
  <div class="logo-subsection">
    <div class="logo-subsection-title">Don't Do This</div>
    <div class="dont-grid">
      <div class="dont-card">
        <svg class="dont-x" width="20" height="20" viewBox="0 0 20 20"><line x1="4" y1="4" x2="16" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="4" x2="4" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/></svg>
        <img class="logo-sys-dont" alt="" style="filter:invert(1);mix-blend-mode:screen;transform:rotate(15deg);max-height:40px;">
        <p>No rotation</p>
      </div>
      <div class="dont-card">
        <svg class="dont-x" width="20" height="20" viewBox="0 0 20 20"><line x1="4" y1="4" x2="16" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="4" x2="4" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/></svg>
        <div style="position:relative;display:inline-block;">
          <img class="logo-sys-dont" alt="" style="filter:invert(1);mix-blend-mode:screen;max-height:40px;">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(74,25,66,0.7),rgba(240,223,160,0.7));mix-blend-mode:overlay;"></div>
        </div>
        <p>No gradients</p>
      </div>
      <div class="dont-card">
        <svg class="dont-x" width="20" height="20" viewBox="0 0 20 20"><line x1="4" y1="4" x2="16" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="4" x2="4" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/></svg>
        <img class="logo-sys-dont" alt="" style="filter:invert(1);mix-blend-mode:screen;transform:scaleX(1.5);max-height:40px;">
        <p>No stretching</p>
      </div>
      <div class="dont-card">
        <svg class="dont-x" width="20" height="20" viewBox="0 0 20 20"><line x1="4" y1="4" x2="16" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="4" x2="4" y2="16" stroke="#E53E3E" stroke-width="2.5" stroke-linecap="round"/></svg>
        <img class="logo-sys-dont" alt="" style="filter:invert(1) hue-rotate(90deg);mix-blend-mode:screen;max-height:40px;">
        <p>No recoloring</p>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Update the `<script>` block at the bottom**

Add logo source assignments for the new logo images. After the existing `document.getElementById('sample-logo').src = LOGO_SRC;` line, add:

```javascript
// Logo system section images
document.querySelectorAll('.logo-sys-full').forEach(img => img.src = LOGO_SRC);
document.querySelectorAll('.logo-sys-icon').forEach(img => img.src = LOGO_SRC);
document.querySelectorAll('.logo-sys-dont').forEach(img => img.src = LOGO_SRC);
document.querySelector('.logo-sys-safe').src = LOGO_SRC;
```

- [ ] **Step 4: Verify in browser**

Logo system should show: full logotype in 3 variants, icon mark (cropped) in 3 variants, safe zone with dashed border, and 4 "don't" cards with red X overlays.

- [ ] **Step 5: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Logo System section with variants and misuse examples"
```

---

## Task 4: Enhance Section 03 (Color Palette) and Section 04 (Typography)

Add usage ratio guidelines and sport-color mapping to colors. Add weight examples and body text sample to typography.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add usage ratio bar after the neutrals div in Color Palette**

Insert after the closing `</div>` of the neutrals strip (the `<div style="margin-top:24px;">` block), still inside the Color Palette `.section`:

```html
<!-- Usage Ratios -->
<div style="margin-top:32px;">
  <div style="font-size:14px;font-weight:600;letter-spacing:2px;color:var(--gray-300);margin-bottom:16px;">USAGE RATIOS</div>
  <div style="display:flex;height:40px;border-radius:4px;overflow:hidden;margin-bottom:12px;">
    <div style="flex:7;background:var(--black);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;letter-spacing:1px;color:var(--gray-500);">60–70% DARK</div>
    <div style="flex:2.5;background:var(--plum);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;letter-spacing:1px;color:var(--gold-dim);">20–30% PLUM</div>
    <div style="flex:0.5;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;letter-spacing:1px;color:var(--black);">5–10%</div>
  </div>
</div>

<!-- Sport Color Mapping -->
<div style="margin-top:32px;">
  <div style="font-size:14px;font-weight:600;letter-spacing:2px;color:var(--gray-300);margin-bottom:16px;">SPORT COLOR ASSIGNMENTS</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
    <div style="background:var(--gold);border-radius:4px;padding:16px;text-align:center;">
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:var(--black);">PICKLEBALL</div>
      <div style="font-size:11px;color:var(--black);opacity:0.6;margin-top:4px;">--gold</div>
    </div>
    <div style="background:var(--peri);border-radius:4px;padding:16px;text-align:center;">
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:var(--black);">VOLLEYBALL</div>
      <div style="font-size:11px;color:var(--black);opacity:0.6;margin-top:4px;">--peri</div>
    </div>
    <div style="background:var(--plum);border-radius:4px;padding:16px;text-align:center;">
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:var(--gold);">FOOTBALL</div>
      <div style="font-size:11px;color:var(--gold);opacity:0.6;margin-top:4px;">--plum</div>
    </div>
    <div style="background:var(--gray-300);border-radius:4px;padding:16px;text-align:center;">
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:var(--black);">GOLF</div>
      <div style="font-size:11px;color:var(--black);opacity:0.6;margin-top:4px;">--gray-300</div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add weight showcase and body paragraph to Typography**

Insert after the existing `.type-scale` closing `</div>`, still inside the Typography `.section`:

```html
<!-- Weight Showcase -->
<div style="margin-top:32px;">
  <div style="font-size:14px;font-weight:600;letter-spacing:2px;color:var(--gray-300);margin-bottom:16px;">WEIGHT RANGE</div>
  <div style="display:flex;gap:24px;flex-wrap:wrap;">
    <div style="text-align:center;">
      <div style="font-size:36px;font-weight:300;color:var(--white);">Aa</div>
      <div style="font-size:11px;color:var(--gray-500);letter-spacing:1px;">300 LIGHT</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:36px;font-weight:400;color:var(--white);">Aa</div>
      <div style="font-size:11px;color:var(--gray-500);letter-spacing:1px;">400 REGULAR</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:36px;font-weight:500;color:var(--white);">Aa</div>
      <div style="font-size:11px;color:var(--gray-500);letter-spacing:1px;">500 MEDIUM</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:36px;font-weight:600;color:var(--white);">Aa</div>
      <div style="font-size:11px;color:var(--gray-500);letter-spacing:1px;">600 SEMIBOLD</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:36px;font-weight:700;color:var(--white);">Aa</div>
      <div style="font-size:11px;color:var(--gray-500);letter-spacing:1px;">700 BOLD</div>
    </div>
  </div>
</div>

<!-- Pairing Guidance -->
<div style="margin-top:32px;">
  <div style="font-size:14px;font-weight:600;letter-spacing:2px;color:var(--gray-300);margin-bottom:16px;">PAIRING GUIDANCE</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
    <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold-dim);margin-bottom:8px;">HEADLINES</div>
      <p style="font-size:14px;color:var(--gray-300);">700 weight, 4-6px letter-spacing, uppercase. Use for H1-H2 and hero text.</p>
    </div>
    <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold-dim);margin-bottom:8px;">SUBHEADS & UI</div>
      <p style="font-size:14px;color:var(--gray-300);">600 weight, 1-2px spacing. Use for H3-H4, nav links, button labels, card titles.</p>
    </div>
    <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold-dim);margin-bottom:8px;">BODY TEXT</div>
      <p style="font-size:14px;color:var(--gray-300);">400 weight, 0.5px spacing. Use for paragraphs, descriptions, form labels.</p>
    </div>
  </div>
</div>

<!-- Body Text Sample -->
<div style="margin-top:32px;">
  <div style="font-size:14px;font-weight:600;letter-spacing:2px;color:var(--gray-300);margin-bottom:16px;">BODY TEXT SAMPLE</div>
  <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:32px;max-width:680px;">
    <p style="font-size:16px;font-weight:400;letter-spacing:0.5px;color:var(--gray-300);line-height:1.8;">Kosmas Athletic Ventures brings world-class sports experiences to Southeast Asia. From pickleball courts in Manila to golf ranges in Cebu, our facilities combine cutting-edge technology with premium design. Every venue is built for athletes who demand precision, comfort, and style — whether you're booking a casual weekend match or training for competition.</p>
  </div>
</div>
```

- [ ] **Step 3: Verify in browser**

Color Palette should show the ratio bar and 4 sport-color cards. Typography should show the weight range, pairing guidance cards, and a body text sample block.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: enhance Color Palette with sport mapping and Typography with weight showcase"
```

---

## Task 5: Add Section 07 — Tags & Badges

Insert between Buttons (06) and Cards (09).

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add tags CSS**

```css
.tag-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.tag {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.tag.compact { padding: 4px 10px; font-size: 11px; }
.tag-row-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--gray-500);
  margin-bottom: 12px;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Insert tags section HTML**

Insert after Buttons section, before Cards comment:

```html
<!-- ==================== 7. TAGS & BADGES ==================== -->
<div class="section" id="tags">
  <div class="section-number">07</div>
  <div class="section-title">Tags & Badges</div>
  <div class="section-desc">Five variants for categorization, status, location, category, and metrics. Each available in default and compact sizes.</div>

  <!-- Sport Tags -->
  <div style="margin-bottom:32px;">
    <div class="tag-row-label">Sport Tags</div>
    <div class="tag-grid">
      <span class="tag" style="background:var(--gold);color:var(--black);">PICKLEBALL</span>
      <span class="tag" style="background:var(--peri);color:var(--black);">VOLLEYBALL</span>
      <span class="tag" style="background:var(--plum);color:var(--gold);">FOOTBALL</span>
      <span class="tag" style="background:var(--gray-300);color:var(--black);">GOLF</span>
    </div>
    <div class="tag-grid">
      <span class="tag compact" style="background:var(--gold);color:var(--black);">PICKLEBALL</span>
      <span class="tag compact" style="background:var(--peri);color:var(--black);">VOLLEYBALL</span>
      <span class="tag compact" style="background:var(--plum);color:var(--gold);">FOOTBALL</span>
      <span class="tag compact" style="background:var(--gray-300);color:var(--black);">GOLF</span>
    </div>
  </div>

  <!-- Status Badges -->
  <div style="margin-bottom:32px;">
    <div class="tag-row-label">Status Badges</div>
    <div class="tag-grid">
      <span class="tag" style="background:var(--gold);color:var(--black);">ACTIVE</span>
      <span class="tag" style="background:#E53E3E;color:var(--white);">SOLD OUT</span>
      <span class="tag" style="background:var(--peri);color:var(--black);">UPCOMING</span>
      <span class="tag" style="background:var(--gray-700);color:var(--gray-300);">CLOSED</span>
    </div>
    <div class="tag-grid">
      <span class="tag compact" style="background:var(--gold);color:var(--black);">ACTIVE</span>
      <span class="tag compact" style="background:#E53E3E;color:var(--white);">SOLD OUT</span>
      <span class="tag compact" style="background:var(--peri);color:var(--black);">UPCOMING</span>
      <span class="tag compact" style="background:var(--gray-700);color:var(--gray-300);">CLOSED</span>
    </div>
  </div>

  <!-- Location Tags -->
  <div style="margin-bottom:32px;">
    <div class="tag-row-label">Location Tags</div>
    <div class="tag-grid">
      <span class="tag" style="background:transparent;color:var(--gray-300);border:1px solid var(--gray-700);">MANILA</span>
      <span class="tag" style="background:transparent;color:var(--gray-300);border:1px solid var(--gray-700);">CEBU</span>
      <span class="tag" style="background:transparent;color:var(--gray-300);border:1px solid var(--gray-700);">DAVAO</span>
    </div>
    <div class="tag-grid">
      <span class="tag compact" style="background:transparent;color:var(--gray-300);border:1px solid var(--gray-700);">MANILA</span>
      <span class="tag compact" style="background:transparent;color:var(--gray-300);border:1px solid var(--gray-700);">CEBU</span>
      <span class="tag compact" style="background:transparent;color:var(--gray-300);border:1px solid var(--gray-700);">DAVAO</span>
    </div>
  </div>

  <!-- Category Labels -->
  <div style="margin-bottom:32px;">
    <div class="tag-row-label">Category Labels</div>
    <div class="tag-grid">
      <span class="tag" style="background:var(--gray-900);color:var(--gray-300);border:1px solid var(--gray-800);">PREMIUM</span>
      <span class="tag" style="background:var(--gray-900);color:var(--gray-300);border:1px solid var(--gray-800);">GROUP</span>
      <span class="tag" style="background:var(--gray-900);color:var(--gray-300);border:1px solid var(--gray-800);">PRIVATE</span>
    </div>
    <div class="tag-grid">
      <span class="tag compact" style="background:var(--gray-900);color:var(--gray-300);border:1px solid var(--gray-800);">PREMIUM</span>
      <span class="tag compact" style="background:var(--gray-900);color:var(--gray-300);border:1px solid var(--gray-800);">GROUP</span>
      <span class="tag compact" style="background:var(--gray-900);color:var(--gray-300);border:1px solid var(--gray-800);">PRIVATE</span>
    </div>
  </div>

  <!-- Metric Badges -->
  <div>
    <div class="tag-row-label">Metric Badges</div>
    <div class="tag-grid">
      <span class="tag" style="background:var(--gray-900);color:var(--gold);border:1px solid var(--gray-800);font-family:monospace;">4.8★</span>
      <span class="tag" style="background:var(--gray-900);color:var(--peri);border:1px solid var(--gray-800);font-family:monospace;">12 SPOTS LEFT</span>
      <span class="tag" style="background:var(--gray-900);color:var(--gold);border:1px solid var(--gray-800);font-family:monospace;">₱2,500/HR</span>
    </div>
    <div class="tag-grid">
      <span class="tag compact" style="background:var(--gray-900);color:var(--gold);border:1px solid var(--gray-800);font-family:monospace;">4.8★</span>
      <span class="tag compact" style="background:var(--gray-900);color:var(--peri);border:1px solid var(--gray-800);font-family:monospace;">12 SPOTS LEFT</span>
      <span class="tag compact" style="background:var(--gray-900);color:var(--gold);border:1px solid var(--gray-800);font-family:monospace;">₱2,500/HR</span>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Tags & Badges section with 5 tag variants"
```

---

## Task 6: Add Section 08 — Form Inputs

Insert between Tags (07) and Cards (09).

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add form input CSS**

```css
.form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.form-cell label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--gray-500);
  margin-bottom: 8px;
  text-transform: uppercase;
}
.form-cell input[type="text"],
.form-cell input[type="date"],
.form-cell textarea,
.form-cell select {
  width: 100%;
  padding: 10px 14px;
  background: var(--gray-900);
  border: 1px solid var(--gray-700);
  border-radius: 4px;
  color: var(--white);
  font-family: var(--font);
  font-size: 14px;
  outline: none;
}
.form-cell input.focus-demo { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(240,223,160,0.15); }
.form-cell input.error-demo { border-color: #E53E3E; }
.form-cell .error-msg { font-size: 11px; color: #E53E3E; margin-top: 4px; letter-spacing: 0.5px; }
.form-cell input:disabled,
.form-cell textarea:disabled,
.form-cell select:disabled { opacity: 0.5; cursor: not-allowed; }
.form-row-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--gray-300);
  margin-bottom: 12px;
  text-transform: uppercase;
}
.toggle-track {
  width: 44px; height: 24px;
  background: var(--gray-700);
  border-radius: 12px;
  position: relative;
  display: inline-block;
  cursor: pointer;
}
.toggle-track.on { background: var(--plum); }
.toggle-thumb {
  width: 20px; height: 20px;
  background: var(--white);
  border-radius: 50%;
  position: absolute;
  top: 2px; left: 2px;
  transition: left 0.2s;
}
.toggle-track.on .toggle-thumb { left: 22px; background: var(--gold); }
.checkbox-custom {
  width: 18px; height: 18px;
  border: 2px solid var(--gray-700);
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.checkbox-custom.checked { background: var(--plum); border-color: var(--plum); }
.radio-custom {
  width: 18px; height: 18px;
  border: 2px solid var(--gray-700);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.radio-custom.checked { border-color: var(--gold); }
.radio-custom.checked::after { content: ''; width: 8px; height: 8px; background: var(--gold); border-radius: 50%; }
.search-wrap {
  position: relative;
}
.search-wrap svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}
.search-wrap input { padding-left: 36px; }
```

- [ ] **Step 2: Insert form inputs section HTML**

Insert after Tags section, before Cards comment:

```html
<!-- ==================== 8. FORM INPUTS ==================== -->
<div class="section" id="forms">
  <div class="section-number">08</div>
  <div class="section-title">Form Inputs</div>
  <div class="section-desc">Styled form elements on the dark theme. Each shown in four states: default, focus, error, disabled.</div>

  <!-- Text Input -->
  <div style="margin-bottom:32px;">
    <div class="form-row-label">Text Input</div>
    <div class="form-grid">
      <div class="form-cell"><label>Default</label><input type="text" placeholder="Enter name" readonly></div>
      <div class="form-cell"><label>Focus</label><input type="text" value="Carlos Sandoval" class="focus-demo" readonly></div>
      <div class="form-cell"><label>Error</label><input type="text" value="" class="error-demo" readonly><div class="error-msg">Name is required</div></div>
      <div class="form-cell"><label>Disabled</label><input type="text" placeholder="Enter name" disabled></div>
    </div>
  </div>

  <!-- Textarea -->
  <div style="margin-bottom:32px;">
    <div class="form-row-label">Textarea</div>
    <div class="form-grid">
      <div class="form-cell"><label>Default</label><textarea rows="3" placeholder="Add notes..." readonly></textarea></div>
      <div class="form-cell"><label>Focus</label><textarea rows="3" class="focus-demo" readonly>Looking forward to the match!</textarea></div>
      <div class="form-cell"><label>Error</label><textarea rows="3" class="error-demo" readonly></textarea><div class="error-msg">Notes required</div></div>
      <div class="form-cell"><label>Disabled</label><textarea rows="3" placeholder="Add notes..." disabled></textarea></div>
    </div>
  </div>

  <!-- Select -->
  <div style="margin-bottom:32px;">
    <div class="form-row-label">Select</div>
    <div class="form-grid">
      <div class="form-cell"><label>Default</label><select><option>Select sport...</option></select></div>
      <div class="form-cell"><label>Focus</label><select class="focus-demo"><option>Pickleball</option></select></div>
      <div class="form-cell"><label>Error</label><select class="error-demo"><option>Select sport...</option></select><div class="error-msg">Selection required</div></div>
      <div class="form-cell"><label>Disabled</label><select disabled><option>Select sport...</option></select></div>
    </div>
  </div>

  <!-- Search -->
  <div style="margin-bottom:32px;">
    <div class="form-row-label">Search Input</div>
    <div class="form-grid">
      <div class="form-cell"><label>Default</label><div class="search-wrap"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" placeholder="Search bookings..." readonly></div></div>
      <div class="form-cell"><label>Focus</label><div class="search-wrap"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0DFA0" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" value="Manila courts" class="focus-demo" readonly></div></div>
      <div class="form-cell"><label>Error</label><div class="search-wrap"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" class="error-demo" readonly></div><div class="error-msg">No results found</div></div>
      <div class="form-cell"><label>Disabled</label><div class="search-wrap"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" opacity="0.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" placeholder="Search bookings..." disabled></div></div>
    </div>
  </div>

  <!-- Toggle, Checkbox, Radio -->
  <div style="margin-bottom:32px;">
    <div class="form-row-label">Toggle / Checkbox / Radio</div>
    <div style="display:flex;gap:48px;align-items:flex-start;">
      <div>
        <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:12px;">TOGGLES</label>
        <div style="display:flex;gap:16px;align-items:center;">
          <div class="toggle-track"><div class="toggle-thumb"></div></div>
          <div class="toggle-track on"><div class="toggle-thumb"></div></div>
          <div class="toggle-track" style="opacity:0.5;cursor:not-allowed;"><div class="toggle-thumb"></div></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:4px;font-size:11px;color:var(--gray-500);letter-spacing:1px;">
          <span style="width:44px;text-align:center;">OFF</span>
          <span style="width:44px;text-align:center;">ON</span>
          <span style="width:44px;text-align:center;">OFF</span>
        </div>
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:12px;">CHECKBOXES</label>
        <div style="display:flex;gap:16px;align-items:center;">
          <div class="checkbox-custom"></div>
          <div class="checkbox-custom checked"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F0DFA0" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="checkbox-custom" style="opacity:0.5;"></div>
        </div>
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:12px;">RADIO BUTTONS</label>
        <div style="display:flex;gap:16px;align-items:center;">
          <div class="radio-custom"></div>
          <div class="radio-custom checked"></div>
          <div class="radio-custom" style="opacity:0.5;"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Date Input -->
  <div>
    <div class="form-row-label">Date Input</div>
    <div class="form-grid">
      <div class="form-cell"><label>Default</label><input type="text" placeholder="YYYY-MM-DD" readonly></div>
      <div class="form-cell"><label>Focus</label><input type="text" value="2026-03-15" class="focus-demo" readonly></div>
      <div class="form-cell"><label>Error</label><input type="text" value="invalid" class="error-demo" readonly><div class="error-msg">Invalid date</div></div>
      <div class="form-cell"><label>Disabled</label><input type="text" placeholder="YYYY-MM-DD" disabled></div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Form Inputs section with 7 input types in 4 states"
```

---

## Task 7: Add Section 10 — Navigation

Insert between Cards (09) and the Sample Layout section.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add nav component CSS**

```css
.nav-mockup { background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden;margin-bottom:24px; }
.nav-mockup-bar {
  height:64px;display:flex;align-items:center;padding:0 24px;border-bottom:1px solid var(--gray-800);
}
.nav-mockup-links { display:flex;gap:24px;margin:0 auto; }
.nav-mockup-links a {
  font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;
  padding-bottom:4px;
}
.nav-mockup-links a.active { color:var(--gold);border-bottom:2px solid var(--gold); }
.mobile-mockup { max-width:375px; }
.mobile-mockup-bar { height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid var(--gray-800); }
.mobile-overlay {
  background:rgba(17,17,17,0.95);padding:48px 24px;display:flex;flex-direction:column;align-items:center;gap:24px;
}
.mobile-overlay a {
  font-size:18px;font-weight:600;letter-spacing:3px;color:var(--gray-300);text-decoration:none;text-transform:uppercase;
}
.mobile-overlay a.active { color:var(--gold); }
```

- [ ] **Step 2: Insert navigation section HTML**

Insert after Cards section, before Sample Layout comment:

```html
<!-- ==================== 10. NAVIGATION ==================== -->
<div class="section" id="nav">
  <div class="section-number">10</div>
  <div class="section-title">Navigation</div>
  <div class="section-desc">Shared nav component. Desktop: 64px, logo left, links center, CTA right. Mobile: 56px header with full-screen overlay.</div>

  <!-- Desktop -->
  <div style="margin-bottom:16px;font-size:12px;font-weight:600;letter-spacing:2px;color:var(--gray-500);">DESKTOP — 64PX</div>
  <div class="nav-mockup">
    <div class="nav-mockup-bar">
      <div class="icon-crop" style="width:32px;height:32px;margin-right:16px;"><img class="logo-nav-desktop" alt="Kosmas" style="height:32px;filter:invert(1);mix-blend-mode:screen;"></div>
      <div class="nav-mockup-links">
        <a href="#" class="active">HOME</a>
        <a href="#">EXPERIENCES</a>
        <a href="#">SCHEDULE</a>
        <a href="#">ABOUT</a>
        <a href="#">CONTACT</a>
      </div>
      <button class="btn btn-primary" style="padding:8px 20px;font-size:12px;margin-left:auto;">BOOK NOW</button>
    </div>
  </div>
  <div style="font-size:12px;color:var(--gray-500);letter-spacing:1px;margin-bottom:32px;">Active link: gold + 2px underline · Hover: color → gray-300 · Sticky · z-index: 100</div>

  <!-- Mobile -->
  <div style="margin-bottom:16px;font-size:12px;font-weight:600;letter-spacing:2px;color:var(--gray-500);">MOBILE — 56PX + OVERLAY</div>
  <div class="nav-mockup mobile-mockup">
    <div class="mobile-mockup-bar">
      <div class="icon-crop" style="width:28px;height:28px;"><img class="logo-nav-mobile" alt="Kosmas" style="height:28px;filter:invert(1);mix-blend-mode:screen;"></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </div>
    <div class="mobile-overlay">
      <a href="#" class="active">HOME</a>
      <a href="#">EXPERIENCES</a>
      <a href="#">SCHEDULE</a>
      <a href="#">ABOUT</a>
      <a href="#">CONTACT</a>
      <button class="btn btn-primary" style="margin-top:16px;width:100%;max-width:280px;">BOOK NOW</button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Update script to set nav logo sources**

Add after the other logo source assignments:

```javascript
document.querySelectorAll('.logo-nav-desktop, .logo-nav-mobile').forEach(img => img.src = LOGO_SRC);
```

- [ ] **Step 4: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Navigation section with desktop and mobile mockups"
```

---

## Task 8: Add Section 11 — Footer

Insert between Navigation (10) and Page Treatments (12).

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add footer CSS**

```css
.footer-mockup {
  background:var(--black-deep);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden;
}
.footer-inner { padding:48px 32px;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:32px; }
.footer-col h4 {
  font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gray-300);margin-bottom:16px;
}
.footer-col a {
  display:block;font-size:14px;color:var(--gray-500);text-decoration:none;margin-bottom:8px;
}
.footer-col a:hover { color:var(--gray-300); }
.footer-col p { font-size:14px;color:var(--gray-500);line-height:1.6; }
.footer-bar {
  border-top:1px solid var(--gray-800);padding:16px 32px;display:flex;justify-content:space-between;align-items:center;
}
.footer-bar span { font-size:12px;color:var(--gray-500);letter-spacing:1px; }
.footer-social { display:flex;gap:16px; }
.footer-social a { color:var(--gray-500);text-decoration:none;font-size:13px;letter-spacing:1px; }
.footer-social a:hover { color:var(--gold); }
```

- [ ] **Step 2: Insert footer section HTML**

```html
<!-- ==================== 11. FOOTER ==================== -->
<div class="section" id="footer">
  <div class="section-number">11</div>
  <div class="section-title">Footer</div>
  <div class="section-desc">Multi-column footer. Icon mark + brand statement left, three link columns right, social + copyright bar at bottom.</div>

  <div class="footer-mockup">
    <div class="footer-inner">
      <div class="footer-col">
        <div class="icon-crop" style="width:40px;height:40px;margin-bottom:16px;"><img class="logo-footer" alt="Kosmas" style="height:40px;filter:invert(1);mix-blend-mode:screen;"></div>
        <p>Premium athletic experiences across Southeast Asia. Bold, defined, confident.</p>
      </div>
      <div class="footer-col">
        <h4>Experiences</h4>
        <a href="#">Pickleball</a>
        <a href="#">Volleyball</a>
        <a href="#">Football</a>
        <a href="#">Golf</a>
      </div>
      <div class="footer-col">
        <h4>Locations</h4>
        <a href="#">Manila</a>
        <a href="#">Cebu</a>
        <a href="#">Davao</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="#">About</a>
        <a href="#">Careers</a>
        <a href="#">Press</a>
        <a href="#">Contact</a>
      </div>
    </div>
    <div class="footer-bar">
      <span>© 2026 KOSMAS ATHLETIC VENTURES CO.</span>
      <div class="footer-social">
        <a href="#">X</a>
        <a href="#">IG</a>
        <a href="#">LI</a>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Update script for footer logo**

```javascript
document.querySelector('.logo-footer').src = LOGO_SRC;
```

- [ ] **Step 4: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Footer section with multi-column layout"
```

---

## Task 9: Add Section 12 — Page Treatments (tab container + 12a Marketing Landing)

This is the largest section. Build the tab infrastructure first, then the first sub-layout (marketing landing page). Remaining sub-layouts follow in Tasks 10-14.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add page treatment CSS**

```css
.page-tabs { display:flex;gap:8px;margin:24px 0 16px;flex-wrap:wrap; }
.page-tab {
  padding:8px 16px;font-size:12px;font-weight:600;letter-spacing:2px;
  background:var(--gray-900);border:1px solid var(--gray-800);border-radius:4px;
  color:var(--gray-500);cursor:pointer;text-transform:uppercase;transition:all 0.2s;
}
.page-tab.active { background:var(--plum);border-color:var(--plum);color:var(--gold); }
.page-tab:hover:not(.active) { border-color:var(--gray-700);color:var(--gray-300); }
.page-panel { display:none; }
.page-panel.active { display:block; }
.page-frame {
  background:var(--black-deep);border:1px solid var(--gray-800);border-radius:8px;
  overflow:hidden;margin-top:16px;
}
.page-frame-label {
  font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);
  padding:12px 24px;border-bottom:1px solid var(--gray-800);text-transform:uppercase;
}
.page-frame-body { padding:0; }
/* Shared mockup helpers */
.mock-hero { padding:48px 32px;text-align:center; }
.mock-grid { display:grid;gap:16px;padding:24px 32px; }
.mock-stat { background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:20px;text-align:center; }
.mock-stat .stat-value { font-size:28px;font-weight:700;color:var(--gold); }
.mock-stat .stat-label { font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);margin-top:4px;text-transform:uppercase; }
.mock-table { width:100%;border-collapse:collapse; }
.mock-table th {
  text-align:left;padding:10px 16px;font-size:11px;font-weight:600;letter-spacing:2px;
  color:var(--gray-500);border-bottom:1px solid var(--gray-800);text-transform:uppercase;
}
.mock-table td { padding:12px 16px;font-size:14px;color:var(--gray-300);border-bottom:1px solid var(--gray-800); }
.mock-table tr:hover td { background:rgba(74,25,66,0.1); }
```

- [ ] **Step 2: Insert section 12 container with tabs and 12a panel**

Insert after Footer section, before Sample Layout comment:

```html
<!-- ==================== 12. PAGE TREATMENTS ==================== -->
<div class="section" id="pages">
  <div class="section-number">12</div>
  <div class="section-title">Page Treatments</div>
  <div class="section-desc">Six page mockups showing the brand applied to real contexts. Click tabs to switch.</div>

  <div class="page-tabs">
    <div class="page-tab active" onclick="switchPageTab('landing')">12A LANDING</div>
    <div class="page-tab" onclick="switchPageTab('dashboard')">12B DASHBOARD</div>
    <div class="page-tab" onclick="switchPageTab('content')">12C CONTENT</div>
    <div class="page-tab" onclick="switchPageTab('crud')">12D CRUD</div>
    <div class="page-tab" onclick="switchPageTab('erp')">12E ERP</div>
    <div class="page-tab" onclick="switchPageTab('schedule')">12F SCHEDULE</div>
  </div>

  <!-- 12a: Marketing Landing Page -->
  <div class="page-panel active" id="panel-landing">
    <div class="page-frame">
      <div class="page-frame-label">12A — Marketing Landing Page</div>
      <div class="page-frame-body">
        <!-- Hero -->
        <div class="mock-hero" style="background:linear-gradient(135deg,var(--plum),var(--black-deep));padding:64px 32px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:4px;color:var(--gold-dim);margin-bottom:16px;">KOSMAS ATHLETIC VENTURES</div>
          <div style="font-size:36px;font-weight:700;letter-spacing:6px;color:var(--gold);text-transform:uppercase;">PREMIER ATHLETIC<br>EXPERIENCES</div>
          <p style="font-size:15px;color:rgba(255,255,255,0.6);margin-top:16px;max-width:500px;margin-left:auto;margin-right:auto;">World-class sports facilities across Southeast Asia. Pickleball, volleyball, football, and golf.</p>
          <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-primary">BOOK NOW</button>
            <button class="btn btn-secondary">EXPLORE</button>
          </div>
        </div>
        <!-- Sport Cards -->
        <div class="mock-grid" style="grid-template-columns:repeat(4,1fr);padding:32px;">
          <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden;">
            <div style="height:80px;background:linear-gradient(135deg,var(--gold),#C4B580);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;letter-spacing:3px;color:var(--black);">PICKLEBALL</div>
            <div style="padding:16px;"><p style="font-size:13px;color:var(--gray-300);">Courts in Manila, Cebu & Davao. Book by the hour.</p></div>
          </div>
          <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden;">
            <div style="height:80px;background:linear-gradient(135deg,var(--peri),#8A9ABB);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;letter-spacing:3px;color:var(--black);">VOLLEYBALL</div>
            <div style="padding:16px;"><p style="font-size:13px;color:var(--gray-300);">Indoor & beach courts. Team leagues available.</p></div>
          </div>
          <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden;">
            <div style="height:80px;background:linear-gradient(135deg,var(--plum),var(--plum-light));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;letter-spacing:3px;color:var(--gold);">FOOTBALL</div>
            <div style="padding:16px;"><p style="font-size:13px;color:var(--gray-300);">5-a-side & full pitch. Premium turf facilities.</p></div>
          </div>
          <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden;">
            <div style="height:80px;background:linear-gradient(135deg,var(--gray-300),var(--gray-500));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;letter-spacing:3px;color:var(--black);">GOLF</div>
            <div style="padding:16px;"><p style="font-size:13px;color:var(--gray-300);">Driving ranges & simulator bays. All skill levels.</p></div>
          </div>
        </div>
        <!-- Testimonial -->
        <div style="background:var(--plum);padding:32px;text-align:center;">
          <p style="font-size:18px;font-weight:400;color:var(--white);font-style:italic;max-width:600px;margin:0 auto;">"The best sports facilities I've experienced in Southeast Asia. Kosmas sets a new standard."</p>
          <p style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gold);margin-top:16px;">— MARCO REYES, ATHLETE</p>
        </div>
        <!-- CTA -->
        <div style="padding:32px;text-align:center;">
          <div style="font-size:24px;font-weight:700;letter-spacing:4px;color:var(--white);text-transform:uppercase;">READY TO PLAY?</div>
          <div style="margin-top:16px;display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-accent">GET STARTED</button>
            <button class="btn btn-ghost">CONTACT US</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Remaining panels added in Tasks 10-14 -->
</div>
```

- [ ] **Step 3: Add tab-switching JavaScript**

Add to the `<script>` block:

```javascript
function switchPageTab(tabId) {
  document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('panel-' + tabId).classList.add('active');
}
```

- [ ] **Step 4: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Page Treatments section with tab system and marketing landing mockup"
```

---

## Task 10: Add Page Treatment 12b — App Dashboard

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Insert dashboard panel**

Insert after the `<!-- Remaining panels added in Tasks 10-14 -->` comment, before the closing `</div>` of section 12:

```html
<!-- 12b: App Dashboard -->
<div class="page-panel" id="panel-dashboard">
  <div class="page-frame">
    <div class="page-frame-label">12B — App Dashboard</div>
    <div class="page-frame-body">
      <!-- KPI Stats -->
      <div class="mock-grid" style="grid-template-columns:repeat(4,1fr);padding:24px 32px;">
        <div class="mock-stat">
          <div class="stat-value">2,847</div>
          <div class="stat-label">Active Members</div>
        </div>
        <div class="mock-stat">
          <div class="stat-value">156</div>
          <div class="stat-label">Upcoming Sessions</div>
        </div>
        <div class="mock-stat">
          <div class="stat-value" style="color:var(--peri);">₱1.2M</div>
          <div class="stat-label">Monthly Revenue</div>
        </div>
        <div class="mock-stat">
          <div class="stat-value" style="color:var(--gold);">87%</div>
          <div class="stat-label">Utilization</div>
        </div>
      </div>
      <!-- Activity Feed -->
      <div style="padding:0 32px 24px;">
        <div style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);margin-bottom:12px;">RECENT ACTIVITY</div>
        <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;">
          <div style="padding:12px 16px;border-bottom:1px solid var(--gray-800);display:flex;justify-content:space-between;">
            <span style="font-size:14px;color:var(--gray-300);">Carlos booked Pickleball Court 3</span>
            <span class="tag compact" style="background:var(--gold);color:var(--black);">PICKLEBALL</span>
          </div>
          <div style="padding:12px 16px;border-bottom:1px solid var(--gray-800);display:flex;justify-content:space-between;">
            <span style="font-size:14px;color:var(--gray-300);">Team Bravo reserved Football Pitch A</span>
            <span class="tag compact" style="background:var(--plum);color:var(--gold);">FOOTBALL</span>
          </div>
          <div style="padding:12px 16px;border-bottom:1px solid var(--gray-800);display:flex;justify-content:space-between;">
            <span style="font-size:14px;color:var(--gray-300);">Maria joined Volleyball League — Season 3</span>
            <span class="tag compact" style="background:var(--peri);color:var(--black);">VOLLEYBALL</span>
          </div>
          <div style="padding:12px 16px;display:flex;justify-content:space-between;">
            <span style="font-size:14px;color:var(--gray-300);">Golf Range Bay 7 — maintenance complete</span>
            <span class="tag compact" style="background:var(--gray-300);color:var(--black);">GOLF</span>
          </div>
        </div>
      </div>
      <!-- Quick Actions -->
      <div style="padding:0 32px 32px;display:flex;gap:12px;">
        <button class="btn btn-primary">NEW BOOKING</button>
        <button class="btn btn-secondary">VIEW SCHEDULE</button>
        <button class="btn btn-ghost">EXPORT REPORT</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add App Dashboard page treatment (12b)"
```

---

## Task 11: Add Page Treatment 12c — Content Page

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Insert content page panel**

Insert after the dashboard panel, before the closing `</div>` of section 12:

```html
<!-- 12c: Content Page -->
<div class="page-panel" id="panel-content">
  <div class="page-frame">
    <div class="page-frame-label">12C — Content Page (Blog Article)</div>
    <div class="page-frame-body">
      <div style="max-width:680px;margin:0 auto;padding:48px 32px;">
        <!-- Header -->
        <span class="tag compact" style="background:var(--gold);color:var(--black);margin-bottom:16px;display:inline-block;">PICKLEBALL</span>
        <h2 style="font-size:32px;font-weight:700;letter-spacing:4px;color:var(--white);text-transform:uppercase;margin-bottom:8px;">PICKLEBALL COURTS:<br>OUR TOP 5 IN MANILA</h2>
        <div style="font-size:13px;color:var(--gray-500);letter-spacing:1px;margin-bottom:32px;">By <span style="color:var(--gold);">KOSMAS EDITORIAL</span> · March 12, 2026 · 5 min read</div>

        <!-- Body -->
        <p style="font-size:16px;color:var(--gray-300);line-height:1.8;margin-bottom:24px;">Manila's pickleball scene has exploded in the last two years. From converted warehouses to purpose-built facilities, the metro now offers world-class courts for players of every level.</p>

        <h3 style="font-size:20px;font-weight:600;letter-spacing:2px;color:var(--white);text-transform:uppercase;margin-bottom:12px;">1. Kosmas BGC</h3>
        <p style="font-size:16px;color:var(--gray-300);line-height:1.8;margin-bottom:24px;">Our flagship facility features 8 indoor courts with competition-grade surfaces, LED lighting calibrated for zero-glare play, and a pro shop stocked with the latest paddles.</p>

        <!-- Blockquote -->
        <div style="border-left:3px solid var(--gold);padding:16px 24px;margin:24px 0;background:rgba(74,25,66,0.15);border-radius:0 8px 8px 0;">
          <p style="font-size:16px;color:var(--white);font-style:italic;line-height:1.7;">"The court quality at Kosmas BGC rivals anything I've played on in the US. The surface response is exceptional."</p>
          <p style="font-size:13px;color:var(--gold);margin-top:8px;letter-spacing:1px;">— PRO PLAYER, APPT TOURNAMENT</p>
        </div>

        <h3 style="font-size:20px;font-weight:600;letter-spacing:2px;color:var(--white);text-transform:uppercase;margin-bottom:12px;">2. Kosmas Makati</h3>
        <p style="font-size:16px;color:var(--gray-300);line-height:1.8;margin-bottom:32px;">Located in the heart of the business district, this venue caters to the after-work crowd with extended evening hours and a lounge overlooking the courts.</p>

        <!-- Related -->
        <div style="border-top:1px solid var(--gray-800);padding-top:32px;">
          <div style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);margin-bottom:16px;">RELATED ARTICLES</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:16px;">
              <span class="tag compact" style="background:var(--peri);color:var(--black);margin-bottom:8px;display:inline-block;">VOLLEYBALL</span>
              <h4 style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:4px;">Beach Volleyball Season Opens</h4>
              <p style="font-size:13px;color:var(--gray-500);">March 2026 · 3 min</p>
            </div>
            <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:16px;">
              <span class="tag compact" style="background:var(--gray-300);color:var(--black);margin-bottom:8px;display:inline-block;">GOLF</span>
              <h4 style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:4px;">New Simulator Bays at Cebu</h4>
              <p style="font-size:13px;color:var(--gray-500);">February 2026 · 4 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Content Page treatment (12c) with blog article layout"
```

---

## Task 12: Add Page Treatment 12d — CRUD Interface

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Insert CRUD panel**

```html
<!-- 12d: CRUD Interface -->
<div class="page-panel" id="panel-crud">
  <div class="page-frame">
    <div class="page-frame-label">12D — CRUD Interface (Manage Bookings)</div>
    <div class="page-frame-body">
      <!-- Header Bar -->
      <div style="padding:24px 32px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:20px;font-weight:700;letter-spacing:3px;color:var(--white);text-transform:uppercase;">MANAGE BOOKINGS</div>
        <button class="btn btn-primary">+ NEW BOOKING</button>
      </div>
      <!-- Filters -->
      <div style="padding:0 32px 16px;display:flex;gap:12px;">
        <div class="search-wrap" style="flex:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" placeholder="Search bookings..." readonly style="width:100%;padding:10px 14px 10px 36px;background:var(--gray-900);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;"></div>
        <select style="padding:10px 14px;background:var(--gray-900);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;"><option>All Sports</option></select>
        <select style="padding:10px 14px;background:var(--gray-900);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;"><option>All Status</option></select>
      </div>
      <!-- Table -->
      <div style="padding:0 32px;">
        <table class="mock-table">
          <thead><tr><th>Name</th><th>Sport</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr>
              <td>Carlos Sandoval</td>
              <td><span class="tag compact" style="background:var(--gold);color:var(--black);">PICKLEBALL</span></td>
              <td>Mar 15, 2026</td>
              <td><span class="tag compact" style="background:var(--gold);color:var(--black);">ACTIVE</span></td>
              <td>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" style="cursor:pointer;margin-right:8px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" style="cursor:pointer;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </td>
            </tr>
            <tr>
              <td>Maria Santos</td>
              <td><span class="tag compact" style="background:var(--peri);color:var(--black);">VOLLEYBALL</span></td>
              <td>Mar 16, 2026</td>
              <td><span class="tag compact" style="background:var(--peri);color:var(--black);">UPCOMING</span></td>
              <td>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" style="cursor:pointer;margin-right:8px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" style="cursor:pointer;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </td>
            </tr>
            <tr>
              <td>Team Bravo</td>
              <td><span class="tag compact" style="background:var(--plum);color:var(--gold);">FOOTBALL</span></td>
              <td>Mar 17, 2026</td>
              <td><span class="tag compact" style="background:var(--gold);color:var(--black);">ACTIVE</span></td>
              <td>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" style="cursor:pointer;margin-right:8px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" style="cursor:pointer;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </td>
            </tr>
            <tr>
              <td>Jun Reyes</td>
              <td><span class="tag compact" style="background:var(--gray-300);color:var(--black);">GOLF</span></td>
              <td>Mar 18, 2026</td>
              <td><span class="tag compact" style="background:var(--gray-700);color:var(--gray-300);">CLOSED</span></td>
              <td>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" style="cursor:pointer;margin-right:8px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" style="cursor:pointer;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div style="padding:16px 32px 24px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;color:var(--gray-500);">Showing 1-4 of 128 bookings</span>
        <div style="display:flex;gap:4px;">
          <button style="padding:6px 12px;background:var(--gray-900);border:1px solid var(--gray-800);border-radius:4px;color:var(--gray-500);font-family:var(--font);font-size:13px;cursor:pointer;">←</button>
          <button style="padding:6px 12px;background:var(--plum);border:1px solid var(--plum);border-radius:4px;color:var(--gold);font-family:var(--font);font-size:13px;cursor:pointer;">1</button>
          <button style="padding:6px 12px;background:var(--gray-900);border:1px solid var(--gray-800);border-radius:4px;color:var(--gray-500);font-family:var(--font);font-size:13px;cursor:pointer;">2</button>
          <button style="padding:6px 12px;background:var(--gray-900);border:1px solid var(--gray-800);border-radius:4px;color:var(--gray-500);font-family:var(--font);font-size:13px;cursor:pointer;">3</button>
          <button style="padding:6px 12px;background:var(--gray-900);border:1px solid var(--gray-800);border-radius:4px;color:var(--gray-500);font-family:var(--font);font-size:13px;cursor:pointer;">→</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add CRUD Interface page treatment (12d)"
```

---

## Task 13: Add Page Treatment 12e — ERP Dashboard

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Insert ERP panel**

```html
<!-- 12e: ERP Dashboard -->
<div class="page-panel" id="panel-erp">
  <div class="page-frame">
    <div class="page-frame-label">12E — ERP Dashboard (Operations Overview)</div>
    <div class="page-frame-body" style="display:flex;min-height:500px;">
      <!-- Sidebar -->
      <div style="width:56px;background:var(--gray-900);border-right:1px solid var(--gray-800);display:flex;flex-direction:column;align-items:center;padding-top:16px;gap:20px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0DFA0" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      </div>
      <!-- Main -->
      <div style="flex:1;padding:24px;">
        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
          <div class="mock-stat"><div class="stat-value">₱3.4M</div><div class="stat-label">Revenue (MTD)</div></div>
          <div class="mock-stat"><div class="stat-value">1,247</div><div class="stat-label">Total Bookings</div></div>
          <div class="mock-stat"><div class="stat-value" style="color:var(--peri);">91%</div><div class="stat-label">Utilization</div></div>
          <div class="mock-stat"><div class="stat-value" style="color:var(--gold);">4.7</div><div class="stat-label">NPS Score</div></div>
        </div>
        <!-- Chart placeholders -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
          <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:20px;min-height:150px;">
            <div style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);margin-bottom:12px;">REVENUE TREND</div>
            <div style="display:flex;align-items:flex-end;gap:8px;height:100px;">
              <div style="flex:1;background:var(--plum);border-radius:2px;height:40%;"></div>
              <div style="flex:1;background:var(--plum);border-radius:2px;height:55%;"></div>
              <div style="flex:1;background:var(--plum);border-radius:2px;height:45%;"></div>
              <div style="flex:1;background:var(--plum);border-radius:2px;height:70%;"></div>
              <div style="flex:1;background:var(--plum);border-radius:2px;height:65%;"></div>
              <div style="flex:1;background:var(--gold);border-radius:2px;height:85%;"></div>
            </div>
          </div>
          <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:20px;min-height:150px;">
            <div style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);margin-bottom:12px;">BOOKINGS BY SPORT</div>
            <div style="display:flex;gap:16px;align-items:center;margin-top:24px;">
              <div style="width:80px;height:80px;border-radius:50%;background:conic-gradient(var(--gold) 0% 40%,var(--peri) 40% 65%,var(--plum) 65% 85%,var(--gray-300) 85% 100%);"></div>
              <div style="font-size:12px;color:var(--gray-500);line-height:2;">
                <span style="color:var(--gold);">■</span> Pickleball 40%<br>
                <span style="color:var(--peri);">■</span> Volleyball 25%<br>
                <span style="color:var(--plum-light);">■</span> Football 20%<br>
                <span style="color:var(--gray-300);">■</span> Golf 15%
              </div>
            </div>
          </div>
        </div>
        <!-- Recent transactions table -->
        <div style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);margin-bottom:8px;">RECENT TRANSACTIONS</div>
        <table class="mock-table">
          <thead><tr><th>Booking</th><th>Sport</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            <tr><td>Court 3 — 2hr</td><td><span class="tag compact" style="background:var(--gold);color:var(--black);">PICKLEBALL</span></td><td style="color:var(--gold);">₱1,200</td><td>Mar 12</td></tr>
            <tr><td>Pitch A — 1hr</td><td><span class="tag compact" style="background:var(--plum);color:var(--gold);">FOOTBALL</span></td><td style="color:var(--gold);">₱3,500</td><td>Mar 12</td></tr>
            <tr><td>Bay 7 — 1hr</td><td><span class="tag compact" style="background:var(--gray-300);color:var(--black);">GOLF</span></td><td style="color:var(--gold);">₱800</td><td>Mar 11</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add ERP Dashboard page treatment (12e)"
```

---

## Task 14: Add Page Treatment 12f — Scheduling View

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add schedule-specific CSS**

```css
.sched-grid { display:grid;grid-template-columns:60px repeat(5,1fr);border:1px solid var(--gray-800);border-radius:8px;overflow:hidden; }
.sched-header { background:var(--gray-900);padding:10px 8px;font-size:11px;font-weight:600;letter-spacing:1px;color:var(--gray-500);text-align:center;border-bottom:1px solid var(--gray-800);text-transform:uppercase; }
.sched-time { padding:8px;font-size:11px;color:var(--gray-500);text-align:right;border-right:1px solid var(--gray-800);border-bottom:1px solid var(--gray-800); }
.sched-cell { border-right:1px solid var(--gray-800);border-bottom:1px solid var(--gray-800);padding:4px;min-height:48px;position:relative; }
.sched-event {
  border-radius:4px;padding:4px 8px;font-size:11px;font-weight:600;letter-spacing:1px;
  text-transform:uppercase;margin-bottom:2px;
}
.sched-toggle { display:flex;gap:4px;margin-bottom:16px; }
.sched-toggle button {
  padding:6px 16px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
  background:var(--gray-900);border:1px solid var(--gray-800);border-radius:4px;
  color:var(--gray-500);font-family:var(--font);cursor:pointer;
}
.sched-toggle button.active { background:var(--plum);border-color:var(--plum);color:var(--gold); }
```

- [ ] **Step 2: Insert scheduling panel**

```html
<!-- 12f: Scheduling View -->
<div class="page-panel" id="panel-schedule">
  <div class="page-frame">
    <div class="page-frame-label">12F — Scheduling View (Court & Field Booking)</div>
    <div class="page-frame-body" style="padding:24px 32px;position:relative;">
      <!-- Toggle -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="font-size:18px;font-weight:700;letter-spacing:3px;color:var(--white);text-transform:uppercase;">MARCH 10–14, 2026</div>
        <div class="sched-toggle">
          <button>DAY</button>
          <button class="active">WEEK</button>
          <button>MONTH</button>
        </div>
      </div>
      <!-- Grid -->
      <div class="sched-grid">
        <div class="sched-header"></div>
        <div class="sched-header">MON 10</div>
        <div class="sched-header">TUE 11</div>
        <div class="sched-header">WED 12</div>
        <div class="sched-header">THU 13</div>
        <div class="sched-header">FRI 14</div>

        <div class="sched-time">8 AM</div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gold);color:var(--black);">PB Court 1</div></div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--peri);color:var(--black);">VB Court A</div></div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gold);color:var(--black);">PB Court 3</div></div>

        <div class="sched-time">9 AM</div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gold);color:var(--black);">PB Court 1</div></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--plum);color:var(--gold);">FB Pitch A</div></div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gray-300);color:var(--black);">Golf Bay 2</div></div>
        <div class="sched-cell"></div>

        <div class="sched-time">10 AM</div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--plum);color:var(--gold);">FB Pitch A</div></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gold);color:var(--black);">PB Court 2</div></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--peri);color:var(--black);">VB Court B</div></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gray-300);color:var(--black);">Golf Bay 5</div></div>

        <div class="sched-time">11 AM</div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--peri);color:var(--black);">VB League</div></div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gold);color:var(--black);">PB Court 2</div></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--peri);color:var(--black);">VB Court B</div></div>
        <div class="sched-cell"></div>

        <div class="sched-time">12 PM</div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--gold);color:var(--black);">PB Court 3</div></div>
        <div class="sched-cell"></div>
        <div class="sched-cell"></div>
        <div class="sched-cell"><div class="sched-event" style="background:var(--plum);color:var(--gold);">FB Pitch B</div></div>
      </div>

      <!-- Booking Modal Overlay (static) -->
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;border-radius:8px;">
        <div style="background:var(--gray-900);border:1px solid var(--gray-800);border-radius:8px;padding:32px;width:360px;">
          <div style="font-size:16px;font-weight:700;letter-spacing:2px;color:var(--white);text-transform:uppercase;margin-bottom:20px;">NEW BOOKING</div>
          <div style="margin-bottom:12px;">
            <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:6px;">SPORT</label>
            <select style="width:100%;padding:10px 14px;background:var(--black);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;"><option>Pickleball</option></select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div>
              <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:6px;">DATE</label>
              <input type="text" value="2026-03-12" readonly style="width:100%;padding:10px 14px;background:var(--black);border:1px solid var(--gold);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;box-shadow:0 0 0 2px rgba(240,223,160,0.15);">
            </div>
            <div>
              <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:6px;">TIME</label>
              <input type="text" value="10:00 AM" readonly style="width:100%;padding:10px 14px;background:var(--black);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;">
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:6px;">COURT / FIELD</label>
            <select style="width:100%;padding:10px 14px;background:var(--black);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;"><option>Court 2 — BGC</option></select>
          </div>
          <div style="margin-bottom:20px;">
            <label style="font-size:11px;font-weight:600;letter-spacing:2px;color:var(--gray-500);display:block;margin-bottom:6px;">PARTICIPANTS</label>
            <input type="text" value="4" readonly style="width:100%;padding:10px 14px;background:var(--black);border:1px solid var(--gray-700);border-radius:4px;color:var(--white);font-family:var(--font);font-size:14px;">
          </div>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-primary" style="flex:1;">CONFIRM</button>
            <button class="btn btn-ghost" style="flex:1;">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify and commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add Scheduling View page treatment (12f) with booking modal"
```

---

## Task 15: Add scroll-spy JavaScript and final polish

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add scroll-spy to the `<script>` block**

```javascript
// Scroll-spy for TOC
const tocLinks = document.querySelectorAll('.toc-link');
const sections = document.querySelectorAll('.section[id]');
function updateScrollSpy() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 80;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  tocLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}
window.addEventListener('scroll', updateScrollSpy);
updateScrollSpy();
```

- [ ] **Step 2: Verify full deck in browser**

Open the file. Scroll through all 13 sections. Verify:
- TOC highlights active section in gold while scrolling
- All 13 section numbers are correct (01-13)
- Tab switching works for page treatments (12a-12f)
- Logo images load in all new sections (logo system, nav, footer)
- Sport colors are consistent across tags, cards, and page treatments

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "feat: add scroll-spy to TOC navigation"
```

---

## Task 16: Deploy updated deck to Fly.io

**Files:**
- No file changes — just redeploy

- [ ] **Step 1: Deploy**

```bash
cd docs/brand/kosmas && fly deploy
```

- [ ] **Step 2: Verify live site**

Open https://kosmas-ui-treatment.fly.dev/ and verify all 13 sections render correctly.

- [ ] **Step 3: Push all commits**

```bash
git push
```

---

## Future Sessions (Out of Scope)

No additional out-of-scope items — this plan covers the full V2 expansion including all 6 page treatments.

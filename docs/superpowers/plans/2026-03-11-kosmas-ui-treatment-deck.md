# Kosmas UI Treatment Deck Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish and finalize the Kosmas UI treatment deck as a self-contained HTML style guide for developers.

**Architecture:** Single self-contained HTML file with embedded CSS, Google Fonts, and base64-encoded logo. No build step, no dependencies. Open the file in a browser and it works.

**Tech Stack:** HTML, CSS (custom properties), Google Fonts (Rajdhani)

---

## File Structure

- **Modify:** `docs/brand/kosmas/ui-treatment-deck.html` — The treatment deck (already drafted, needs polish)
- **Reference:** `docs/superpowers/specs/2026-03-11-kosmas-ui-treatment-deck-design.md` — Approved spec
- **Reference:** `docs/brand/kosmas/kosmas-logo.png` — Logo asset (already base64-embedded in draft)

---

## Task 1: Remove redundant tagline text

The logo image already contains "ATHLETIC VENTURES CO." text. The hero section duplicates this with a separate text element.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Remove the redundant tagline div from the hero section**

Find and remove the `.tagline` div from the hero:
```html
<!-- REMOVE this line -->
<div class="tagline">Athletic Ventures Co.</div>
```

Also remove the `.hero .tagline` CSS rule:
```css
/* REMOVE this block */
.hero .tagline {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 16px;
}
```

- [ ] **Step 2: Verify in browser**

Open `docs/brand/kosmas/ui-treatment-deck.html` in browser. Hero should show logo + brand statement only, no redundant tagline.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "polish: remove redundant tagline from Kosmas treatment deck hero"
```

---

## Task 2: Clean up rough edges

Minor polish pass on the existing draft.

**Files:**
- Modify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Add smooth scrolling and improve page feel**

Add to the `<style>` block:
```css
html { scroll-behavior: smooth; }
```

- [ ] **Step 2: Add a table of contents nav bar**

After the hero section closing `</div>`, before `<div class="container">`, add a sticky TOC:
```html
<nav style="background:var(--gray-900);border-bottom:1px solid var(--gray-800);padding:12px 0;position:sticky;top:0;z-index:100;">
  <div style="max-width:1080px;margin:0 auto;padding:0 32px;display:flex;gap:24px;overflow-x:auto;">
    <a href="#colors" style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;white-space:nowrap;">COLORS</a>
    <a href="#typography" style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;white-space:nowrap;">TYPOGRAPHY</a>
    <a href="#spacing" style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;white-space:nowrap;">SPACING</a>
    <a href="#buttons" style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;white-space:nowrap;">BUTTONS</a>
    <a href="#cards" style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;white-space:nowrap;">CARDS</a>
    <a href="#sample" style="font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gray-500);text-decoration:none;white-space:nowrap;">SAMPLE LAYOUT</a>
  </div>
</nav>
```

Add `id` attributes to each section div:
- Color Palette section: `id="colors"`
- Typography section: `id="typography"`
- Spacing section: `id="spacing"`
- Buttons section: `id="buttons"`
- Cards section: `id="cards"`
- Sample Layout section: `id="sample"`

- [ ] **Step 3: Verify in browser**

Open in browser. Sticky nav should appear below hero. Clicking each link should smooth-scroll to the section.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/kosmas/ui-treatment-deck.html
git commit -m "polish: add sticky TOC nav and smooth scrolling to treatment deck"
```

---

## Task 3: Verify self-contained deliverable

Ensure the file works completely standalone — no external dependencies except Google Fonts CDN.

**Files:**
- Verify: `docs/brand/kosmas/ui-treatment-deck.html`

- [ ] **Step 1: Verify logo is base64-embedded**

Search the HTML file for `data:image/png;base64,`. It should appear twice (hero logo + sample layout logo). If missing, re-embed from `docs/brand/kosmas/kosmas-logo.png`.

- [ ] **Step 2: Verify no broken external references**

Search for `src=` and `href=` attributes. Only allowed external references:
- Google Fonts CDN (`fonts.googleapis.com`, `fonts.gstatic.com`)
- Internal anchor links (`#colors`, etc.)

No references to local files, relative paths, or other CDNs.

- [ ] **Step 3: Open in browser with network tab**

Open the file directly (file:// protocol). Check browser network tab — only Google Fonts requests should appear. All other content should be inline.

- [ ] **Step 4: Commit spec and plan docs**

```bash
git add docs/superpowers/specs/2026-03-11-kosmas-ui-treatment-deck-design.md
git add docs/superpowers/plans/2026-03-11-kosmas-ui-treatment-deck.md
git add docs/brand/kosmas/kosmas-logo.png
git add docs/brand/kosmas/kosmas-logo-brief.pdf
git add docs/brand/kosmas/kosmas-logo-ideas.pdf
git commit -m "docs: add Kosmas UI treatment deck spec, plan, and brand assets"
```

---

## Future Sessions (Out of Scope)

These additional sample layouts were requested but scoped to separate sessions:

1. **CRUD interfaces** — Table views, forms, detail views, create/edit modals
2. **ERP dashboard** — KPI cards, charts, sidebar navigation, data tables
3. **Marketing pages** — Landing page hero, feature sections, testimonials, CTA blocks
4. **Blog layouts** — Article list, single post, author cards, tag navigation
5. **Schedule / calendar views** — Day/week/month views, event cards, booking slots

Each will be added as new sections to the treatment deck, following the established color palette, typography, and component patterns.

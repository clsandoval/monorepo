# Visual QA — Option 3: Filipino Warmth

**Aspect 15 of 27 — Wave 2: Visual QA**
**Status:** PASS
*QA Date: 2026-03-10*
*Mockup: `raw/mockup-option-3-filipino-warmth.html`*

---

## QA Checklist

### Spec Compliance

| Check | Result | Notes |
|-------|--------|-------|
| Warm cream background (#FEF9F2) | ✅ PASS | Background renders correctly |
| Yeseva One display font loading | ✅ PASS | Google Fonts CDN loads correctly, visible in page title and result number |
| Nunito body font loading | ✅ PASS | All UI copy renders in Nunito |
| Terracotta primary color (#C4552A) on button | ✅ PASS | Compute button renders correct color |
| Pill-shaped buttons (border-radius: 9999px) | ✅ PASS | Fully rounded pill shape confirmed |
| Card border-radius 16px | ✅ PASS | Cards have rounded corners |
| Warm terracotta-tinted card shadow | ✅ PASS | Shadow visible, warm tone |
| Amber focus ring | ✅ PASS | CSS defined, visible on focus |
| Radio option — selected state (blush tint + terracotta border) | ✅ PASS | "Huling Sahod" shows correct selected styling |
| Peso prefix inside input | ✅ PASS | ₱ symbol with divider visible |
| Result card: blush background + 4px terracotta left border | ✅ PASS | Result card styling matches spec |
| Result number: Yeseva One, large, terracotta color | ✅ PASS | ₱115,500.00 renders dramatically |
| "Kalkulasyon ni Angkin" badge on result | ✅ PASS | Badge visible with sun icon |
| Count-up animation | ✅ PASS | Number animates from 0 to final value over ~900ms |
| Warm pulse animation on result reveal | ✅ PASS | Box-shadow pulse fires on result card |
| Breakdown table with terracotta total row | ✅ PASS | Total row highlighted in terracotta |
| Warning note card (amber) | ✅ PASS | Amber border-left and background present |
| Action buttons: secondary outline style | ✅ PASS | "Baguhin ang Data" and "I-print" are outline pills |
| Ghost button: "Limasin lahat" | ✅ PASS | Subtle text underline style |
| Info chips grid (3 columns) | ✅ PASS | Renders as 3 equal columns |
| Footer Angkin branding (Yeseva One, terracotta) | ✅ PASS | Footer logo renders correctly |
| Tool link pills in footer | ✅ PASS | All 8 footer links render as rounded pills |
| "by Angkin" nav badge with sun SVG | ✅ PASS | Sun icon + text visible in top-right |
| Dark mode toggle button | ✅ PASS | Moon icon visible, toggle functional (verified via JS) |
| RA 7641 law badge (amber pill) | ✅ PASS | Badge renders at page header |
| DOLE badge (muted pill) | ✅ PASS | Badge renders next to law badge |

---

### Calculation Accuracy

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| RA 7641 formula: ½ × salary × years | ½ × ₱38,500 × 6 = ₱115,500 | ₱115,500.00 | ✅ CORRECT |
| Equivalent months display | 3.0 buwan | 3.0 buwan | ✅ CORRECT |
| Breakdown table totals | ₱115,500.00 | ₱115,500.00 | ✅ CORRECT |
| Formula text | ½ × ₱38,500 × 6 = ₱115,500.00 | Matches | ✅ CORRECT |

---

### Responsive Layout

#### Desktop (1280×800)

| Check | Result |
|-------|--------|
| Centered max-width 720px column | ✅ PASS |
| 2-column form grid (Pangalan + Petsa row) | ✅ PASS |
| 3-column info chips | ✅ PASS |
| Nav shows tool subtitle ("Retirement Pay Calculator") | ✅ PASS |
| No horizontal scroll | ✅ PASS |
| Form cards not stretched — centered content | ✅ PASS |

#### Mobile (375×812)

| Check | Result |
|-------|--------|
| Single column layout | ✅ PASS |
| 2-column form grid collapses to 1 column | ✅ PASS |
| Compute button full-width | ✅ PASS |
| Info chips collapse to 1 column (stacked) | ✅ PASS |
| Nav subtitle hidden on mobile | ✅ PASS |
| Cards are edge-to-edge | ✅ PASS |
| Result actions stack vertically | ✅ PASS |
| Tab switcher full-width on mobile | ✅ PASS |
| Result number readable at 375px (40px+ font) | ✅ PASS |
| Touch targets appear adequately sized | ✅ PASS (≥48px button heights) |

---

### Fonts

| Font | Loading Method | Status |
|------|----------------|--------|
| Yeseva One | Google Fonts CDN (`fonts.googleapis.com`) | ✅ LOADED |
| Nunito | Google Fonts CDN (same request) | ✅ LOADED |
| Fallback for Yeseva One | Georgia, serif | ✅ DEFINED |
| Fallback for Nunito | system-ui, sans-serif | ✅ DEFINED |

---

### Accessibility Spot-Check

| Check | Result |
|-------|--------|
| Page title set | ✅ `Kalkulahin ang Retirement Pay (RA 7641) — by Angkin` |
| H1 heading present | ✅ |
| Nav has aria-label | ✅ "Pangunahing navigation" |
| All form inputs have associated labels | ✅ |
| Result section has aria-live="polite" | ✅ |
| Tab elements have role="tab" and aria-selected | ✅ |
| Note has role="note" | ✅ |
| Radio group has role="radiogroup" | ✅ |
| Dark mode toggle has aria-label | ✅ |
| No layout-only content with meaningful text lost | ✅ |

---

### Issues Found & Fixed

**None.** No issues were found during the QA pass. The mockup rendered correctly at both breakpoints on first review.

**Console errors:** Only a favicon 404 (expected, harmless — no favicon.ico file in the raw/ directory).

---

### QA Verdict

**PASS — Pixel-perfect. Ready for aspect completion.**

The Filipino Warmth mockup is visually cohesive, culturally grounded, and functionally complete. The key design moments — the warm cream background, the Yeseva One title in terracotta, the pill-shaped compute button, and especially the large result number — all execute the Filipino Warmth design philosophy with precision.

**Standout moments:**
1. The result card (`₱115,500.00` in large Yeseva One terracotta on blush background) is dramatic and trustworthy
2. The radio input treatment with warm selected state (blush tint, terracotta border) feels native to the GCash/fintech-familiar Filipino user
3. The "by Angkin" sun badge in the nav is subtle but immediately legible
4. Mobile layout feels natural — all elements restack cleanly, no awkward wrapping

**Screenshots saved:**
- `raw/screenshot-option-3-desktop.png` — 1280px input state
- `raw/screenshot-option-3-result-desktop.png` — 1280px result state
- `raw/screenshot-option-3-mobile.png` — 375px input state
- `raw/screenshot-option-3-mobile-result.png` — 375px result state

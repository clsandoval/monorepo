# Visual QA — Option 10: Bold Geometric

**Mockup:** `raw/mockup-option-10-bold-geometric.html`
**QA Date:** 2026-03-10
**Screenshots:** `raw/screenshot-option-10-desktop.png`, `raw/screenshot-option-10-mobile.png`

---

## QA Checklist

### Spec Compliance

| Check | Status | Notes |
|-------|--------|-------|
| Dark shell (#0F0F14 background) | ✅ PASS | Renders correctly at both breakpoints |
| Yellow Angkin stripe (3px, #F5E642) at top | ✅ PASS | Fixed, full-width, prominent |
| Bebas Neue for hero title | ✅ PASS | "RETIREMENT PAY CALCULATOR" — massive, poster-scale |
| Bebas Neue for result amount | ✅ PASS | ₱596,794.87 in yellow at display scale |
| Barlow Condensed for nav/labels | ✅ PASS | "ANGKIN", "LABOR & EMPLOYMENT", form labels all correct |
| "by Angkin" wordmark in nav | ✅ PASS | Yellow Barlow Condensed, top-left |
| Tool name "RetireMath" in nav | ✅ PASS | Lighter weight beside Angkin |
| Yellow accent (#F5E642) throughout | ✅ PASS | Buttons, tabs, borders, result value, stripe |
| Sharp corners (0 border-radius) on buttons/cards | ✅ PASS | Compute button, nav badges, domain badge all sharp |
| Card left border accent (3px yellow) | ✅ PASS | Form card and result hero |
| Diagonal geometric overlay in hero | ✅ PASS | Subtle parallelogram shape top-right |
| Input focus: yellow border + glow | ✅ PASS | Tested in Playwright snapshot |
| Domain badge "Labor & Employment" | ✅ PASS | Yellow pill in hero and nav |

### Functional Testing

| Check | Status | Notes |
|-------|--------|-------|
| Calculation: ₱35,000 × 20 years | ✅ PASS | Correctly computes ₱596,794.87 |
| Daily rate auto-computation | ✅ PASS | 35000/26 = ₱1,346.15 |
| ½ month salary equivalent | ✅ PASS | 20 days × rate + 1/12 × 13th month = ₱29,839.74 |
| Years of service: March 2005 → March 2025 | ✅ PASS | 20 years computed correctly |
| Tab switching (Input ↔ Results) | ✅ PASS | Auto-switches to Results on compute |
| Breakdown rows animation | ✅ PASS (after fix) | See Issue #1 below |
| Result hero yellow sweep animation | ✅ PASS | CSS class-based sweep on compute |
| Clear form button | ✅ PASS | Resets form fields |

### Responsive Layout

| Check | Status | Notes |
|-------|--------|-------|
| 1280px: 2-column grid (form + sidebar) | ✅ PASS | Form left, sidebar right at 380px |
| 375px: single-column, stacked | ✅ PASS | Full-width, readable |
| Mobile: nav actions hidden | ✅ PASS | Badges/buttons removed at ≤640px |
| Mobile: sidebar stacks above form | ✅ PASS | order: -1 applied correctly |
| Mobile: date fields single-column | ✅ PASS | form-row: 1fr on mobile |
| Mobile: compute button full-width | ✅ PASS | Prominent yellow CTA |

### Typography & Fonts

| Check | Status | Notes |
|-------|--------|-------|
| Bebas Neue loading from Google Fonts | ✅ PASS | Hero title and result amount render correctly |
| Barlow Condensed loading | ✅ PASS | Nav, labels, badges all correct |
| Barlow loading | ✅ PASS | Body text, helper text render correctly |
| JetBrains Mono in formula block | ✅ PASS | Formula text in monospace yellow |

### Accessibility

| Check | Status | Notes |
|-------|--------|-------|
| Form labels linked to inputs | ✅ PASS | All inputs have explicit label/for pairing |
| Result panel has aria-live | ✅ PASS | polite announcement on compute |
| Tab buttons have aria-selected | ✅ PASS | ARIA roles correct |
| Color: accent yellow on dark bg | ✅ PASS | High contrast, estimated >10:1 |

---

## Issues Found & Resolved

### Issue #1: Breakdown Rows Not Visible (FIXED)

**Problem:** After clicking COMPUTE, the breakdown rows remained invisible. The JS `DOMContentLoaded` handler set inline `opacity: 0` and `transform: translateX(20px)` on each row, but the `.revealed` CSS class could not override inline styles due to specificity.

**Fix:** Modified `revealRows()` to clear inline styles (`row.style.opacity = ''`, `row.style.transform = ''`) before adding the `.revealed` class. Modified `resetRows()` to re-apply inline styles when resetting. This allows the CSS transition to animate correctly.

**Verified:** After fix, all 6 breakdown rows render with correct values and stagger animation.

---

## Issues Remaining (Cosmetic/Acceptable)

### Playwright Full-Page Screenshot Nav Overlap

**Description:** When taking a full-page screenshot, the `position: fixed` navigation bar appears overlapping content partway down the screenshot image. This is a known Playwright artifact — fixed elements are captured at their viewport position, not relative to the full scroll height.

**Impact:** Zero impact on real-world usage. In a browser, the nav stays at the top and content scrolls normally beneath it.

**Decision:** No fix needed. Not a real UX issue.

---

## Overall QA Assessment

**PASS — Mockup approved for commit.**

The Bold Geometric mockup successfully delivers on all 17 spec sections:
- The dark shell is immediately distinctive — unlike any other option
- The Bebas Neue hero title creates a genuine "poster moment"
- The ₱596,794.87 result in yellow Bebas Neue at display scale is the most visually impactful result presentation of all 10 options
- The yellow Angkin stripe is the invariant suite signature — visible and recognizable
- Mobile layout is clean and functional, single-thumb usable
- The geometric diagonal accents add depth without cluttering

This option would stand out dramatically against BIR, SSS, and any other Philippine government compliance tool.

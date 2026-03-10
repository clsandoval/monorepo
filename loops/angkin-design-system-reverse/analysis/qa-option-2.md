# Visual QA Report — Option 2: Gov.uk Radical Clarity

**Date:** 2026-03-10
**Mockup:** `raw/mockup-option-2-radical-clarity.html`
**QA Method:** Playwright browser, screenshots at 1280×800 (desktop) and 375×812 (mobile)
**Screenshots:**
- `raw/screenshot-option-2-desktop.png` — desktop input state
- `raw/screenshot-option-2-mobile.png` — mobile input state
- `raw/screenshot-option-2-mobile-result.png` — mobile result state

---

## Checklist

### Fonts
- [x] **Public Sans** loading correctly via Google Fonts CDN — confirmed in rendering (clean grotesque geometry, letter spacing matches spec)
- [x] **Overpass Mono** loading correctly — result number ₱641,250.00 renders in distinctive monospaced weight

### Colors
- [x] Near-black `#1A1918` on white background — high contrast ✅
- [x] Teal `#00766A` on header border — correct accent color ✅
- [x] Teal on compute button — correct ✅
- [x] Teal left border on law callout — correct ✅
- [x] Yellow `#FFD000` focus ring — not visually verified in screenshot (no active focus state captured) but CSS implementation correct
- [x] Warning banner amber/yellow background — renders correctly ✅
- [x] Success banner green — correct ✅
- [x] Error state CSS implemented (2px red left border + error message) — not triggered in demo

### Layout — Desktop (1280px)
- [x] 640px max-width container — renders centered with appropriate margins ✅
- [x] 40px horizontal gutters — correct ✅
- [x] Single-column form layout — correct ✅
- [x] Logo/brand "Angkin" top-left with teal 4px bottom border on header ✅
- [x] Back link above H1 ✅
- [x] Step indicator above H1 ✅
- [x] Law citation callout with teal left border — renders as designed ✅
- [x] Form fields properly spaced (32px between groups) ✅

### Layout — Mobile (375px)
- [x] 20px horizontal gutters ✅
- [x] Heading wraps cleanly ("Kalkulador ng Retirement Pay" across 2 lines) ✅
- [x] Input prefix (₱) stays aligned with input field ✅
- [x] Compute button full-width on mobile ✅
- [x] Summary list stacks vertically (label / value / action on own lines) ✅
- [x] Breakdown table maintains two columns (label left, value right) — slightly cramped but readable ✅
- [x] Result amount (38px Overpass Mono) — impactful and readable ✅
- [x] Tab switcher scrollable horizontally ✅

### Responsive Behavior
- [x] Font sizes reduce on mobile (heading xl: 36px → 26px) ✅
- [x] Body text 19px desktop → 17px mobile ✅
- [x] Action row stacks vertically on mobile ✅

### Result State
- [x] Result number consistent: ₱641,250.00 in callout matches ₱641,250.00 in breakdown table ✅ (was inconsistent — FIXED during QA)
- [x] Result label "ANG IYONG RETIREMENT PAY · YOUR RETIREMENT PAY" in teal uppercase — readable ✅
- [x] Breakdown table layout clean — label left, amount right ✅
- [x] "Kabuuang retirement pay" total row has bold styling ✅
- [x] Success banner (green) renders above summary list ✅
- [x] Warning banner (amber) renders above next steps ✅
- [x] Law citation callout at bottom of result ✅
- [x] Print button and "Kalkulahin muli" link side by side (desktop) / stacked (mobile) ✅

### Spec Compliance
- [x] Design philosophy (radical clarity, no decoration) — matched ✅
- [x] No illustrations, no icons except text characters (←, ✓) ✅
- [x] Square corners throughout (border-radius: 0) ✅
- [x] 2px black input borders — correct ✅
- [x] No placeholder text (inputs use hint text above) ✅
- [x] Bilingual labels (Filipino primary, English in parens) ✅
- [x] No animations except 150ms fade on page load and 200ms result reveal ✅
- [x] Law citation as authority signal (replaces illustration) ✅
- [x] "A tool by Angkin" quiet footer ✅

### Distinctiveness vs Option 1
- [x] Radically different from Option 1 (Wise-Inspired): Option 2 is near-monochrome, taller type, square corners, explicit law citation, bilingual labels, no warmth — while Option 1 was warm cream, rounded, subtler typography ✅

---

## Issues Found & Fixed

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Top result amount (₱1,064,000.00) didn't match breakdown total (₱641,250.00) | High | Changed top amount to ₱641,250.00 |

---

## Issues Not Fixed (Acceptable)

| # | Issue | Justification |
|---|-------|---------------|
| 1 | Breakdown table slightly cramped on 375px mobile (values right-align close to labels) | Acceptable — table is readable, numbers are clear, this is expected behavior for a two-column table on narrow screens |
| 2 | Peso symbol (₱) renders smaller in summary list than in result callout | Font size difference — correct behavior |
| 3 | Favicon 404 (console error) | Demo-only, irrelevant to design QA |

---

## Overall Assessment

**PASS.** The mockup faithfully implements the Option 2 "Gov.uk Radical Clarity" design philosophy:

- **Radical near-monochrome** with a single purposeful teal accent
- **Public Sans** creates government-grade authority while remaining accessible and open
- **Overpass Mono** result number is the clear hero — no question what the answer is
- **Square corners, 2px black borders** signal functional seriousness
- **Law citation callout** is the single most powerful trust element — users see the RA number before they even see the form
- **Bilingual labels** serve the target audience (Filipino workers with functional English)
- **Mobile layout** works excellently — a user on a ₱3,599 Oppo Android can complete this form comfortably

The design is distinctly different from Option 1 and would be immediately recognizable as a different design philosophy to any user who encountered both.

---

*QA complete. Mockup approved. Ready for commit.*

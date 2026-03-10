# Visual QA — Option 1: Wise-Inspired Trust Minimalism

**Mockup:** `raw/mockup-option-1-trust-minimalism.html`
**QA Date:** 2026-03-10
**Status:** PASS ✅

---

## Breakpoints Tested

| Breakpoint | Width | Height | Result |
|------------|-------|--------|--------|
| Desktop | 1280px | 800px | ✅ Pass |
| Mobile | 375px | 812px | ✅ Pass |

Screenshots saved:
- `raw/screenshot-option-1-desktop.png` — result view at 1280px
- `raw/screenshot-option-1-mobile.png` — result view at 375px

---

## Spec Compliance Checklist

### Navigation
- [x] Angkin badge in top-left, lowercase Figtree, 1px border treatment
- [x] Breadcrumb "Labor › RetireMath" in top-right
- [x] Nav bar exactly 56px height
- [x] Sticky behavior (sticky positioning coded)

### Typography
- [x] Instrument Serif loads via Google Fonts CDN
- [x] Figtree loads via Google Fonts CDN
- [x] Tool title "Retirement Pay Calculator" in Instrument Serif 34px
- [x] Result hero "₱210,000" in Instrument Serif, large display size
- [x] Body/labels in Figtree
- [x] Domain label in Figtree uppercase 12px

### Colors
- [x] Forest green (#1A5C3A) primary button — verified visually
- [x] Off-white (#FAFAF9) page background
- [x] Subtle green-tinted (#E8F5EE) result card background
- [x] Border color (#DDE5DF) on cards and inputs
- [x] Amber warning banner (#FDF3DC) for sample result notice
- [x] Text colors: near-black (#0D1F14) headings, muted green (#3D5E49) body

### Form (Input View)
- [x] Labels above every input (not placeholder-as-label)
- [x] ₱ prefix inside salary input
- [x] Helper text below every input
- [x] Radio group for retirement type with selected state styling
- [x] Dropdown for daily rate basis
- [x] "Compute Retirement Pay" full-width button at 52px height
- [x] "Clear form" ghost button below
- [x] Disclaimer text in muted small type

### Result View
- [x] Green checkmark icon with animation
- [x] "MINIMUM RETIREMENT PAY UNDER RA 7641" label in uppercase
- [x] ₱210,000 displayed in Instrument Serif large display
- [x] Breakdown table: 5 rows (salary, daily rate, years, multiplier, formula)
- [x] Formula row: "₱1,555.56 × 22.5 × 6 = ₱210,000" — mathematically correct
- [x] Tax-exempt note in muted background box
- [x] Copy and Recalculate action buttons
- [x] Info cards: Computation Basis, Minimum Service, Optional/Compulsory retirement ages
- [x] Info cards in 2-column grid (desktop), stacks on mobile ✅

### Responsive
- [x] Max-width 600px form centered on desktop with generous whitespace
- [x] Full-width layout on 375px mobile with 20px side padding
- [x] Radio buttons stack vertically on narrow screens (≤400px)
- [x] Tab toggle visible and functional at both breakpoints
- [x] Related tools list full-width on mobile

### Below-the-fold Content
- [x] "About Republic Act No. 7641" section renders correctly
- [x] Related calculators list with chevron arrows
- [x] Footer: angkin badge, attribution, navigation links

---

## Issues Found & Fixed

| Issue | Severity | Fix Applied |
|-------|----------|-------------|
| Hardcoded sample result showed ₱126,000 (incorrect for ₱35,000 salary × 6 years) | Medium | Changed to ₱210,000 — correct per formula (₱35,000 / 22.5 × 22.5 × 6 = ₱210,000) |

---

## Spec Fidelity Assessment

| Spec Section | Fidelity | Notes |
|---|---|---|
| Design Philosophy (restraint, trust through whitespace) | ✅ High | Generous whitespace, centered narrow column, result is the hero |
| Persona (scared first-timer) | ✅ High | No login, no friction, immediate result |
| Color System | ✅ High | All hex values match spec |
| Typography | ✅ High | Figtree + Instrument Serif pair beautifully |
| Spatial Philosophy (airy, 600px max) | ✅ High | 600px column with extensive whitespace |
| Component Patterns | ✅ High | Inputs, buttons, radio, result card all match spec |
| Animation | ✅ High | resultReveal, checkAppear, fadeInRow keyframes present |
| Accessibility | ✅ High | ARIA labels, live regions, focus-visible, semantic HTML |
| Dark Mode | ✅ High | CSS custom properties defined for dark theme |
| Multi-tool Cohesion signals | ✅ High | 5 recognition signals: badge, button color, input style, result card, footer |

---

## Final Verdict

**PASS.** The mockup accurately realizes the Wise-Inspired Trust Minimalism concept. The Instrument Serif result number creates a memorable "this number is serious" moment. The Figtree body keeps the UI warm and approachable. The maximum whitespace successfully communicates the "nothing to hide" philosophy. Ready for Wave 3 comparison.

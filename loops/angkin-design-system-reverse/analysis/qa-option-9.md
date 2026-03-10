# Visual QA — Option 9: Soft Institutional

**Mockup:** `raw/mockup-option-9-soft-institutional.html`
**Screenshots:** `raw/screenshot-option-9-desktop.png`, `raw/screenshot-option-9-mobile.png`
**QA status:** PASS

---

## Desktop QA (1280×800)

### Typography
- ✅ Cormorant Garamond loading correctly from Google Fonts CDN — visible in "RetireMath" H1, "Compute Retirement Pay" H2, sidebar card titles, and result amount
- ✅ Atkinson Hyperlegible loading correctly — visible in all form labels, body text, helper text, FAQ content
- ✅ Serif/sans contrast creates clear visual hierarchy: elegant display vs. hyper-readable body
- ✅ Result amount (₱900,307.69) renders in Cormorant Garamond at large size — most impactful typographic moment on the page

### Color Palette
- ✅ Cream paper background (#F8F6F1) rendering correctly — warm, not clinical white
- ✅ Coastal teal (#2E6D80) visible in: category badge, 2px header rule, sidebar card headers, related tool link icons, formula blockquote border
- ✅ Amber CTA button (#C4822A) is the dominant action color — correct all-caps, letter-spaced label
- ✅ Success green (#2D7A5F) applied correctly to result card left border and result amount color
- ✅ Success-light background (#D4EDE4) on result card provides soft confirmation signal without garish color
- ✅ Notice banner uses accent-light (#F5E5CC) with amber text — warm, not alarming

### Layout
- ✅ Two-column layout at 1280px: calculator (65%) left, sidebar (35%) right — correct
- ✅ Max-width 900px creates focused, editorial feel — intentional narrowness
- ✅ Section spacing and internal card padding feel proportionate
- ✅ Breadcrumb navigation renders in header (Angkin › Labor & Employment › RetireMath)
- ✅ "by Angkin" wordmark in top-right: serif uppercase, letter-spaced, correct position

### Form and Inputs
- ✅ ALL CAPS labels with generous letter-spacing render correctly
- ✅ Date inputs, numeric spinbuttons, select dropdown all rendering properly
- ✅ ₱ prefix in currency inputs visible and properly positioned
- ✅ Checkbox items with card-style borders render cleanly
- ✅ Pre-filled demo values: Maria Santos, 2003-01-15 hire, ₱45,000 pay

### Result Display
- ✅ Auto-compute triggered on page load (after 800ms delay) — result visible without user interaction
- ✅ "Maria Santos · 22 years and 2 months of service" showing correctly (name fix applied)
- ✅ Result amount ₱900,307.69 renders prominently
- ✅ Result card has green left-border treatment matching spec
- ✅ Breakdown table shows all 9 rows with alternating row colors
- ✅ Total row has bold treatment and serif result value

### Footer
- ✅ 4-column footer navigation: Tax Tools, Labor & Employment, Government Contributions, About Angkin
- ✅ Footer bottom bar: "ANGKIN" wordmark left, copyright text right
- ✅ Legal footnote in serif italic above footer — appropriate citation style

---

## Mobile QA (375×812)

### Layout
- ✅ Single-column layout at 375px — calculator then sidebar stacks correctly
- ✅ Breadcrumb hidden on mobile (correct — would overflow)
- ✅ "by Angkin" wordmark and theme toggle remain visible in header
- ✅ form-grid-2 (date inputs) correctly collapses to single column at mobile
- ✅ Result actions buttons stack vertically on mobile

### Typography
- ✅ Cormorant Garamond scales down gracefully on mobile — "RetireMath" at ~1.875rem
- ✅ Body text at 16px — no readability issues on mobile
- ✅ Result amount ₱900,307.69 at ~2.25rem on mobile — still impactful

### Touch Targets
- ✅ Compute button at 52px height — exceeds 48px minimum
- ✅ Checkbox items padded to adequate tap target size
- ✅ Form inputs at 48px height — correct
- ✅ Related tool links have adequate tap area

---

## Spec Compliance Check

| Spec requirement | Verified |
|-----------------|---------|
| Cormorant Garamond for display/H1/H2 | ✅ |
| Atkinson Hyperlegible for body/UI | ✅ |
| Cream paper bg (#F8F6F1) | ✅ |
| Coastal teal primary (#2E6D80) | ✅ |
| Amber accent CTA (#C4822A) | ✅ |
| "by Angkin" wordmark top-right | ✅ |
| 2px teal header rule | ✅ |
| Legal footnote in serif italic | ✅ |
| Category pill (Labor & Employment) | ✅ |
| Result card with green left-border | ✅ |
| Breakdown table | ✅ |
| Sidebar: What the Law Provides | ✅ |
| Sidebar: FAQ | ✅ |
| Sidebar: Related Tools | ✅ |
| Suite footer navigation | ✅ |
| Theme toggle (dark mode ready) | ✅ |
| Two-column desktop / single-column mobile | ✅ |
| Responsive at 375px | ✅ |

---

## Issues Found and Fixed

1. **Employee name defaulting to "Employee"** — The `DOMContentLoaded` handler did not set a default value for the employee name input. Fixed by adding `document.getElementById('employeeName').value = 'Maria Santos'` to the pre-fill block. Re-verified after fix: now shows "Maria Santos · 22 years and 2 months of service". ✅

---

## Design Philosophy Verification

Does the mockup feel like a **trusted institution that has modernized thoughtfully**?

- **vs. Option 2 (Gov.uk Radical Clarity):** Option 9 has more warmth — the cream background, serif typography, and amber button feel human, not bureaucratic. Option 2 would use black on white with no personality. ✅ Clearly distinct.
- **vs. Option 1 (Trust Minimalism):** Option 1 is whiter, more spacious, quieter. Option 9 has more content density — sidebars, FAQs, related tools. Rosario (the target user) appreciates thoroughness. ✅ Clearly distinct.
- **vs. Option 6 (Editorial Calculator):** Option 6 leads with content/editorial flow. Option 9 leads with the calculator tool first, with context in the sidebar. Structurally different. ✅ Clearly distinct.

**QA VERDICT: PASS. Mockup is pixel-perfect against spec. Ready for aspect completion.**

# Visual QA — Option 5: Playful Utility

**Aspect 17 of 27 — Wave 2: QA Pass**
*QA Date: 2026-03-10*

---

## QA Environment

- Browser: Playwright (Chromium)
- Desktop viewport: 1280×800
- Mobile viewport: 375×812
- File: `raw/mockup-option-5-playful-utility.html`
- Screenshots: `raw/screenshot-option-5-desktop.png`, `raw/screenshot-option-5-mobile.png`

---

## Spec Compliance Checks

### Fonts
- ✅ **Nunito** loading from Google Fonts CDN — rendering in headings, hero title, badges, and result amount
- ✅ **Plus Jakarta Sans** loading from Google Fonts CDN — rendering in body copy, labels, helper text
- ✅ Hero title "Magkano ang iyong Retirement Pay?" renders correctly with `Nunito 800`
- ✅ "Retirement Pay?" span renders in coral (#FF6B35) as specified
- ✅ Result amount `₱178,200` renders in Nunito 900, coral, approximately 48–56px — massive and impactful

### Colors
- ✅ Primary coral `#FF6B35` applied to: badge background, "Retirement Pay?" heading, input focus borders, compute button, result amount, pill borders
- ✅ Warm off-white background `#F9F7F4` — page feels warm, not sterile
- ✅ Surface tinted `#FFF5F0` applied to result card — subtle pink warmth visible
- ✅ Success green `#06D6A0` applied to input valid checkmarks and "Na-compute na!" badge
- ✅ Error red `#EF476F` available in CSS (tested via JS validation logic)
- ✅ `#1A1A2E` dark navy for headings — excellent contrast on warm white

### Component Patterns
- ✅ Compute button: pill shape (border-radius: 9999px), coral fill, 3D stamp shadow (4px 4px 0 #CC4A1A)
- ✅ Input fields: 52px tall, 12px border-radius, 2px solid border, green focus ring on valid
- ✅ Input valid state: green border + `✓` icon slides in from right
- ✅ Section headers: ALL CAPS, 11px, letter-spacing: 1.5px, divider line extends to right edge
- ✅ Two-section card structure: "Impormasyon ng Empleyado" and "Sahod at Benepisyo"
- ✅ Result card: coral left border (6px), tinted background, result label in small caps
- ✅ Breakdown accordion: toggle button with rotating arrow indicator
- ✅ Law citation card: emoji icon + citation text in bordered card
- ✅ Related tools: pill-shaped link buttons with hover states

### Animations (verified via JS snapshot during animation)
- ✅ Compute button shows loading state (dots) during 500ms computation window
- ✅ Count-up animation: number animates from 0 → ₱178,200 over 900ms (confirmed by mid-animation snapshot showing ₱146,719, final snapshot showing ₱178,200)
- ✅ Sparkle stars (★) positioned via CSS keyframes around result amount
- ✅ "Na-compute na!" badge pops in with scale animation
- ✅ Congrats message fades in with 900ms delay

### Responsive Layout

**Desktop (1280px):**
- ✅ Two-column grid activates: form (~500px left) + result (~380px right sticky)
- ✅ Mobile tabs hidden on desktop (CSS `display: none`)
- ✅ Both panels display simultaneously on desktop (`display: block !important`)
- ✅ Header: Angkin wordmark left, tool name center, dark mode toggle right
- ✅ Hero section spans full width (grid-column: 1 / -1)
- ✅ Related tools footer spans full container width, pills centered

**Mobile (375px):**
- ✅ Single-column layout
- ✅ Tab switcher visible: "I-input" and "Resulta" pills in full-width pill container
- ✅ Active tab shows solid coral fill; inactive tab is transparent
- ✅ After compute: switches to "Resulta" tab automatically, showing result card
- ✅ Form fields properly stacked; two-column "field-row" collapses to single column at ≤400px
- ✅ Input suffixes ("taong gulang", "taon") hidden at mobile to prevent overflow
- ✅ Compute button full-width, single line ("🧮 I-Compute"), 56px tall — excellent thumb target
- ✅ Related tools pills wrap gracefully across 2–3 rows

### Computation Accuracy
- ✅ Monthly rate = ₱28,500 + ₱1,200 = ₱29,700 ✓
- ✅ Half-month equivalent = ₱29,700 × 0.5 = ₱14,850 ✓
- ✅ Creditable years = 12 ✓
- ✅ Total = ₱14,850 × 12 = ₱178,200 ✓
- ✅ Breakdown shows all component values correctly
- ✅ Congrats message personalizes to first name ("Mazel, Maria!")

### Accessibility
- ✅ All inputs have `<label>` elements with `for` attributes (not placeholder-only)
- ✅ aria-labels on inputs for context ("Monthly basic salary sa Philippine Peso")
- ✅ Result display has `aria-live="polite"` for screen reader announcement
- ✅ Dark mode toggle has `aria-label` and visual `title`
- ✅ Compute button has `aria-label`
- ✅ Breakdown toggle has `aria-expanded` attribute toggled on click
- ✅ Focus rings visible: `outline: 3px solid #FF6B35, offset: 3px`
- ✅ Touch targets: compute button 56px tall, inputs 52px tall — both above 44px minimum

### Design Philosophy Adherence
- ✅ **Friendly and approachable**: Nunito's rounded forms, emoji icons, Tagalog-first labels
- ✅ **Toylike but competent**: Chunky pill buttons, stamp shadows, sparkle animations — but formula, breakdown, and law citation are rigorous
- ✅ **OFW-friendly**: "Mazel, Maria!" congratulations; mobile tab UX; Tagalog copy
- ✅ **Angkin branding**: Coral-orange `[A]` logo mark in header; "by Angkin" implicit in the wordmark; footer attribution
- ✅ **Celebration of the result moment**: Count-up + sparkles + badge + congrats text = distinctly joyful compared to all other options

---

## Issues Found & Resolved

| # | Issue | Resolution | Status |
|---|-------|------------|--------|
| 1 | Two-column desktop layout constrained to 680px by `.container` max-width | Added `max-width: 1040px` override for container at ≥1024px | ✅ Fixed |
| 2 | `result-column` class not applied (duplicate `class` attribute) | Fixed to `class="tab-panel result-column"` | ✅ Fixed |
| 3 | Compute button text wrapping to 2 lines on mobile (375px) | Shortened button label to "🧮 I-Compute" | ✅ Fixed |
| 4 | `field-row` two-column layout too narrow at 375px — age/years inputs overflowing | Added `@media (max-width: 400px) { .field-row { grid-template-columns: 1fr; } }` | ✅ Fixed |
| 5 | Input suffixes ("taong gulang") overflowing on mobile | Hidden via `display: none` at ≤400px breakpoint | ✅ Fixed |

---

## Remaining Minor Observations (Not Blocking)

- **Result card contrast on desktop**: The `#FFF5F0` tinted card against `#F9F7F4` background provides subtle rather than dramatic contrast. In practice this is intentional — the left coral border is the visual cue. Tested: clearly visible.
- **SVG illustration**: The inline SVG in the empty state (character with calculator) renders in browser but is small in the full-page screenshot. This is a proportional artifact of the full-page screenshot — it renders correctly at the actual viewport.
- **Favicon 404**: Browser requests `favicon.ico` which is not present. This is a console warning, not a user-visible issue.

---

## QA Verdict: ✅ PASS

The mockup faithfully implements the Option 5 spec:
- Playful Utility aesthetic is unmistakably distinct from Options 1–4
- Nunito 900 coral result number is the visual hero of the page
- Tagalog-first copy feels culturally authentic (not translated, native)
- Computation is mathematically correct per RA 7641
- Works cleanly at both 1280px (desktop two-column) and 375px (mobile tabbed)
- Celebration animations deliver the "win" moment specified in section 9

**Signed off for commit.**

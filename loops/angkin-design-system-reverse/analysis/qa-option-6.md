# Visual QA — Option 6: Editorial Calculator

**Aspect 18 — QA Pass**
*Date: 2026-03-10*

---

## QA Checklist

### Spec Match

| Check | Result | Notes |
|-------|--------|-------|
| Cormorant Garamond display font loading | ✅ PASS | Renders beautifully in headlines and drop cap |
| Source Serif 4 body font loading | ✅ PASS | Readable, humanist, clearly different from sans |
| Libre Franklin UI font loading | ✅ PASS | Clean in labels, buttons, breadcrumb |
| Cream background `#FAF7F0` | ✅ PASS | Warm parchment tone confirmed |
| Editorial red accent `#C4302B` | ✅ PASS | Drop cap, eyebrow, compute button, result rule |
| Navy accent `#1C3557` | ✅ PASS | Headline color, law box header, result number |
| Gold accent `#B8860B` | ✅ PASS | Breadcrumb RA 7641, ✦ ornament, law citation |
| Drop cap "E" in red | ✅ PASS | Floated, 4-line height, editorial style |
| Pull quote with left red border | ✅ PASS | Italic Cormorant Garamond, navy text |
| Law box with navy header + gold badge | ✅ PASS | "Republic Act No. 7641" in all-caps sans |
| Byline with avatar + Jump to Calculator | ✅ PASS | Red CTA button visible |
| Bold 3px red editorial rule after byline | ✅ PASS | Full column width |
| ✦ ornament in gold before "Interactive Tool" | ✅ PASS | Tiny but present |

### Layout

| Check | Result | Notes |
|-------|--------|-------|
| Two-column layout at 1280px | ✅ PASS | Article (approx 680px) + calculator sidebar (360px) |
| Sticky calculator sidebar behavior | ✅ PASS | `position: sticky; top: 72px` working |
| Single-column layout at 375px | ✅ PASS | Full-width article, sidebar hidden |
| Inline calculator visible at 375px | ✅ PASS | `.article-calculator-section { display: block }` triggered |
| Masthead breadcrumb hidden at 375px | ✅ PASS | Per spec — `display: none` on mobile |
| Article text readable at 375px | ✅ PASS | Appropriate line length on mobile |
| Next Steps grid: 2col at desktop, 1col at mobile | ✅ PASS | Grid-template-columns collapse correct |
| Footer two-column to centered on mobile | ✅ PASS | Flexbox column on small |

### Calculator Functionality

| Check | Result | Notes |
|-------|--------|-------|
| Auto-compute on load (Rodel's scenario) | ✅ PASS | ₱28,000 × 19 years auto-computed on load |
| Result: ₱359,782.05 | ✅ PASS | Correct: (28000/26×15 + 28000/12 + 28000/26×5/12) × 19 |
| Number count-up animation | ✅ PASS | Animates from 0 to final value over 700ms |
| Result red rule draw animation | ✅ PASS | `scaleX` from 0 to 1, visible |
| Breakdown table rows rendering | ✅ PASS | Daily rate, 15 days basic, 13th month, SIL, totals |
| Validation error states | ✅ PASS | Error messages in italic Source Serif 4 |
| Reset button clears form and result | ✅ PASS | Result card hides via `max-height: 0` |
| Dark mode toggle | ✅ PASS | Smooth transition, palette inverts to lamplight theme |

### Accessibility

| Check | Result | Notes |
|-------|--------|-------|
| Heading hierarchy (h1 → h2 → h3) | ✅ PASS | Proper semantic structure |
| `role="complementary"` on law box | ✅ PASS | `aria-label` set correctly |
| `aria-live="polite"` on result card | ✅ PASS | Result announced on compute |
| `:focus-visible` ring (2px red, 2px offset) | ✅ PASS | Applied to all interactive elements |
| Touch targets ≥48px | ✅ PASS | Button height 52px, inputs 48px |
| Favicon 404 console error | ⚠️ HARMLESS | Expected — no favicon.ico in raw/ |

### Distinctiveness Check

Does Option 6 look substantially different from Options 1–5?

- **vs Option 1 (Wise minimalism):** Completely different — editorial long-form vs. clean single-screen. Fonts differ (Cormorant vs DM Sans). Layout differs (article+sidebar vs. centered form).
- **vs Option 2 (Gov.uk clarity):** Both are text-focused but Option 6 has visual richness — drop caps, pull quotes, serif typography, warm cream vs. cold white.
- **vs Option 3 (Filipino Warmth):** Different aesthetics entirely — editorial sophistication vs. friendly rounded warmth.
- **vs Option 4 (Stripe-grade):** Option 6 is content-first editorial; Option 4 is data-dense developer system.
- **vs Option 5 (Playful utility):** Opposites — editorial restraint vs. vivid bold fun.

**Verdict: Radically distinct. ✅**

---

## Issues Found & Fixed

**None.** The mockup rendered pixel-perfect on first iteration. All fonts loaded via Google Fonts CDN. The calculation logic is correct. Layout is responsive and correct at both breakpoints. The auto-compute on load demonstrates the result state effectively.

---

## QA Verdict

**PASS — Pixel-perfect. Ready for synthesis phase.**

The editorial design is the most distinctive of the 6 options produced so far. The fusion of long-form article content with an embedded calculator is a completely different interaction paradigm than the other options. The typography trio of Cormorant Garamond + Source Serif 4 + Libre Franklin is sophisticated and mutually reinforcing. The warm cream + editorial red + navy palette is cohesive and professional.

**Key moments that work especially well:**
1. The Cormorant Garamond drop cap — instantly signals "you are reading something worth your time"
2. The red editorial rule after the byline — creates a clear content start
3. The result number in 4rem Cormorant Garamond — authoritative and impactful
4. The law box with navy header — adds gravitas and credibility
5. The sticky calculator sidebar on desktop — makes the tool instantly available while reading

Screenshots saved:
- `raw/screenshot-option-6-desktop.png` — 1280px full-page, result shown
- `raw/screenshot-option-6-mobile.png` — 375px full-page
- `raw/screenshot-option-6-mobile-viewport.png` — 375px viewport, above fold

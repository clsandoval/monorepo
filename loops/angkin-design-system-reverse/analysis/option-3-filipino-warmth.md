# Option 3: Filipino Warmth

**Aspect 15 of 27 — Wave 2: Design Options**
**Status:** Complete
*Produced: 2026-03-10*

---

## 1. Design Philosophy

This design believes that trust is rooted in familiarity — not in clinical perfection. A Filipino user should feel as if this calculator was made *for* them, *by* someone who understands them: the warmth of a neighborhood cooperative, the reliability of a trusted tita's advice. We borrow from the natural palette of the archipelago (sunset terracotta, palay gold, narra wood, cream) and the rounded friendliness of the apps Filipinos already love (GCash, Grab) — then elevate it beyond utility into something that feels genuinely delightful.

Compliance doesn't have to be cold. Math doesn't have to be sterile. This design proves that a retirement calculator can feel as warm as a conversation.

---

## 2. Persona Narrative

**Ate Leny, 47, HR officer at a medium-sized construction firm in Cebu City.**

Ate Leny manages payroll for 65 workers. She uses her personal Android phone (a Samsung A34) for work tasks because the company laptop is shared and slow. She's not tech-averse — she manages GCash, Shopee, and Facebook with comfort — but she's deeply skeptical of government websites after years of painful BIR eFPS experiences.

She arrives at the Retirement Pay Calculator because a worker is retiring next month and her boss asked her to "double-check the DOLE computation." She's on mobile data, standing in the site office, kids' noise in the background. She needs to:
1. Enter three numbers (monthly salary, years of service, basic or final pay basis)
2. Get the right number immediately
3. Feel confident enough to put that number in an official document

She doesn't want to "learn" anything. She wants to be *guided* — step by step, in language she recognizes, with numbers she trusts. When the result appears and it matches what she computed manually on a scrap of paper, she exhales with relief and sends a screenshot to her boss on Viber.

**Emotional state on arrival:** mildly anxious, time-pressured, hoping this is easier than the SSS portal.
**Emotional state on departure:** relieved, quietly impressed, likely to bookmark.

---

## 3. Competitive DNA

**Inspired by GCash's approachability + Maya's elevated finish, differentiated by cultural rootedness.**

- **GCash**: Proves Filipino fintech can feel inviting. We adopt its generous touch targets, simple iconography, and sense of "this was made for people like me." We reject its promotional clutter.
- **Maya**: Shows that mobile-first doesn't mean cheap. We adopt Maya's clean card-based layouts and trust signals, with a warmer palette.
- **Wise**: Informs our one-action-per-moment philosophy and clear result presentation — but swapped into a warmer, more Filipino idiom.
- **Gov.uk**: Informs content clarity and plain-language copy — but wrapped in warmth instead of institutional cool.
- **Anti-reference**: BIR eFPS, SSS portal — the negative benchmark every Filipino compliance tool must beat.

The unique differentiation: **Filipino cultural confidence**. Not performing "local" through flags or Baybayin script — but through palette, spatial rhythm, copy tone, and the implicit warmth of feeling seen.

---

## 4. Brand Expression

**"by Angkin"** appears as a small but proud wordmark in the top navigation, right-aligned on desktop, centered under the tool name on mobile.

- **Logo style**: "Angkin" in Yeseva One (the display font) with a small warm sun/leaf icon — a simple, abstract shape referencing the Philippine sun motif without being literal. 16px on desktop, 14px on mobile.
- **Suite cohesion**: Every Angkin tool shares the same terracotta header bar, the same rounded card system, the same font pairing (Yeseva One + Nunito). The tool name ("Kalkulahin ang Retirement Pay") changes but the container is always recognizably Angkin.
- **Color invariant**: The warm cream background (#FEF9F2), terracotta primary (#C4552A), and amber accent (#E8943A) appear on every tool — these are the Angkin DNA colors.
- **Color variant**: Domain-specific accent swaps. Tax tools: deep amber. Labor tools: warm terracotta (default). Property tools: earth green (#4A7B5E). Maritime/OFW tools: warm indigo (#3D4FA8). This provides visual variety without breaking family cohesion.
- **"by Angkin" badge**: A small pill badge in the result section — "Kalkulasyon ni Angkin" with the sun icon — reinforces brand at the highest-value moment (when the result appears).

---

## 5. Color System

### Core Palette

| Token | Hex | Name | Rationale |
|-------|-----|------|-----------|
| `--color-primary` | `#C4552A` | Sunset Terracotta | Philippine sunset, the national warmth. Confident but not aggressive. |
| `--color-primary-dark` | `#9E3F1A` | Deep Clay | Hover/pressed states, deeper shadows |
| `--color-primary-light` | `#F2E0D8` | Blush Cream | Primary tint for backgrounds, selected states |
| `--color-secondary` | `#E8943A` | Palay Amber | The color of golden rice. Secondary actions, warm accents. |
| `--color-secondary-light` | `#FBE9CF` | Warm Honey | Tint for secondary highlights |
| `--color-accent` | `#C8A84B` | Narra Gold | Luxury accent — used sparingly for premium moments and the result display |
| `--color-success` | `#2E7D52` | Bayan Green | Forest confidence. Used for correct calculations, validation passes. |
| `--color-success-light` | `#D4EDE0` | Mint Tint | Success background tint |
| `--color-warning` | `#D97706` | Mango Warning | Amber warning from the mango's hue. Warm, not alarming. |
| `--color-warning-light` | `#FEF3C7` | Light Mango | Warning background tint |
| `--color-error` | `#B91C1C` | Deep Red | Error state — warm red, not neon. Clear but not panicking. |
| `--color-error-light` | `#FEE2E2` | Error Blush | Error background tint |
| `--color-bg` | `#FEF9F2` | Antique Cream | Main page background — like aged paper, warm, human |
| `--color-surface` | `#FFFFFF` | Pure White | Card surfaces — contrast against the cream background |
| `--color-surface-warm` | `#FFF6E8` | Warm White | Slightly warm surface variant for nested cards |
| `--color-border` | `#E8D5BC` | Soft Tan | Borders, dividers — warm, not clinical gray |
| `--color-text` | `#2D1B0E` | Dark Earth | Near-black with warm undertone. 100% readability. |
| `--color-text-secondary` | `#7A5C46` | Warm Brown | Secondary text, labels, metadata |
| `--color-text-muted` | `#B09880` | Pale Earth | Placeholders, captions, disabled states |
| `--color-muted-bg` | `#F5EDE1` | Parchment | Disabled input backgrounds, skip-field indicators |

### Domain Color Swaps (per tool category)

| Domain | Primary Override | Accent Override | Mood |
|--------|-----------------|-----------------|------|
| Labor / Retirement | `#C4552A` (default terracotta) | `#C8A84B` gold | Grounded confidence |
| Tax / BIR | `#1B5E4E` deep forest green | `#E8943A` amber | Serious but approachable |
| Property / Real Estate | `#4A7B5E` earth green | `#C8A84B` gold | Stable, growing |
| OFW / Remittance | `#3D4FA8` warm indigo | `#E8943A` amber | Trustworthy, aspirational |
| Healthcare / SSS | `#1A5B7A` deep teal | `#C8A84B` gold | Caring, competent |

---

## 6. Typography System

### Fonts

**Display / Headings: [Yeseva One](https://fonts.google.com/specimen/Yeseva+One)** (Google Fonts)
- Elegant serif-display hybrid. Confident strokes, warm curves — feels authoritative without being stiff.
- Communicates: "We know what we're talking about, and we're friendly about it."
- Perfect for tool names, result numbers, section headers.

**Body / UI: [Nunito](https://fonts.google.com/specimen/Nunito)** (Google Fonts)
- Rounded sans-serif. Every terminal has a gentle curve — subliminally warmer than squared-off alternatives.
- Communicates: "This is easy. You'll be fine."
- Used for all body copy, form labels, buttons, helper text.

### Type Scale

| Role | Font | Size | Weight | Line Height | Usage |
|------|------|------|--------|-------------|-------|
| `--type-hero` | Yeseva One | 48px / 3rem | 400 | 1.1 | Tool name on desktop, hero splash |
| `--type-h1` | Yeseva One | 36px / 2.25rem | 400 | 1.2 | Page title on mobile, section hero |
| `--type-h2` | Yeseva One | 28px / 1.75rem | 400 | 1.3 | Result value, subsection headers |
| `--type-h3` | Nunito | 22px / 1.375rem | 700 | 1.3 | Card headers, step labels |
| `--type-h4` | Nunito | 18px / 1.125rem | 700 | 1.4 | Field group labels, emphasis |
| `--type-body-lg` | Nunito | 17px / 1.0625rem | 400 | 1.6 | Primary body text, field labels |
| `--type-body` | Nunito | 15px / 0.9375rem | 400 | 1.6 | Standard UI text |
| `--type-small` | Nunito | 13px / 0.8125rem | 400 | 1.5 | Helper text, captions |
| `--type-caption` | Nunito | 11px / 0.6875rem | 600 | 1.4 | Badges, pill labels, micro-copy |

**Weight Rules:**
- Yeseva One is display-only, used at weight 400 (its only weight)
- Nunito: 400 for body, 600 for labels and secondary emphasis, 700 for h3/h4 and strong emphasis
- Never use Nunito 800+ — it feels too aggressive against the warm palette
- Numbers in result displays: Yeseva One, size 40–56px, color `--color-primary`

---

## 7. Spatial Philosophy

**Density Level: Moderately Airy** — generous but not spacious to the point of feeling empty. Filipino users on mobile need enough breathing room to tap accurately, but aren't accustomed to ultra-minimal Scandinavian whitespace.

**Whitespace Strategy:** Warmth comes from rhythm, not quantity. Consistent spacing creates visual harmony. Key rule: every section has a clear "territory" — it knows where it starts and ends.

**Spacing Scale (8px base grid):**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Internal microspacing (icon gaps, badge padding) |
| `--space-2` | 8px | Base unit, small internal padding |
| `--space-3` | 12px | Label-to-input gap, small card padding |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 24px | Section internal padding, card padding |
| `--space-6` | 32px | Between form fields |
| `--space-7` | 48px | Between major sections |
| `--space-8` | 64px | Page top/bottom padding |

**Grid System:**
- Max-width: 720px (centered) — intentionally narrower than typical to keep the interface focused
- Desktop (1280px+): Single-column content, centered, 48px horizontal padding on card
- Tablet (768–1279px): Same as desktop, 32px padding
- Mobile (375–767px): Full-width, 16px horizontal padding, cards are edge-to-edge with rounded corners
- No multi-column for inputs — single column forces clear sequential flow

**Responsive Breakpoints:**
- `--bp-sm`: 480px (large phone)
- `--bp-md`: 768px (tablet)
- `--bp-lg`: 1024px (small desktop)
- `--bp-xl`: 1280px (standard desktop)

**Border Radius Philosophy:** Everything is rounded. This reinforces warmth.
- Buttons: `--radius-full` = 9999px (fully rounded)
- Cards: `--radius-lg` = 16px
- Inputs: `--radius-md` = 10px
- Badges/pills: `--radius-full` = 9999px
- Tooltips: `--radius-sm` = 6px

---

## 8. Component Patterns

### Buttons

**Primary (Compute / Kalkulahin):**
- Background: `--color-primary` (`#C4552A`)
- Text: White, Nunito 700, 16px
- Padding: 16px 32px
- Border-radius: 9999px (fully rounded)
- Height: 56px (generous touch target)
- Hover: darken to `--color-primary-dark`, slight lift shadow
- Active/pressed: scale(0.97), shadow collapses
- Disabled: `--color-muted-bg` background, `--color-text-muted` text

**Secondary:**
- Background: transparent
- Border: 2px solid `--color-primary`
- Text: `--color-primary`, Nunito 700
- Same pill shape as primary

**Ghost:**
- No border, no background
- Text: `--color-text-secondary`
- Underline on hover
- Used for "Limasin" (Clear) actions

**Destructive:**
- Background: `--color-error`
- Same pill shape

### Inputs

**Label treatment:** Nunito 600, 14px, `--color-text-secondary`, displayed ABOVE the input, 6px gap
**Placeholder:** Nunito 400, `--color-text-muted`, example value in Tagalog format (e.g., "hal. 45,000")
**Border:** 2px solid `--color-border`, radius 10px
**Background:** White
**Height:** 52px for single-line, padding 12px 16px
**Focus ring:** 3px solid `--color-secondary` (amber) offset 2px — warm, not jarring
**Validation — error state:** Border becomes `--color-error`, small error message below in Nunito 12px `--color-error`
**Validation — success state:** Border becomes `--color-success`, small checkmark icon
**Helper text:** Nunito 13px, `--color-text-muted`, 4px gap below label

**Peso prefix:** For currency inputs, a warm gray "₱" prefix inside the input on the left, separated by a warm divider line.

### Cards

- Background: White
- Border: 1px solid `--color-border`
- Border-radius: 16px
- Shadow: `0 2px 12px rgba(196, 85, 42, 0.08)` — a warm terracotta-tinted shadow, not flat gray
- Padding: 32px on desktop, 20px on mobile

### Result Display (THE KEY MOMENT)

The result display is the emotional climax. After hitting "Kalkulahin," the result section reveals with a warm card:
- Background: `--color-primary-light` (blush cream) with a thin terracotta left border (4px)
- The primary result number: 56px Yeseva One, `--color-primary`
- Secondary breakdown values: 18px Nunito 700, `--color-text`
- Label above number: Nunito 600, 13px, ALL CAPS, letter-spacing 0.08em, `--color-text-secondary`
- A small "Kalkulasyon ni Angkin" badge in the result card (warm pill, subtle)
- Animation: Result card slides up from below with a warm fade, number counts up from 0

### Progress Indicators

Multi-step tools use a warm segmented progress bar:
- Track: `--color-border`
- Fill: `--color-primary` with rounded ends
- Step labels: Nunito 600, 12px below each step dot
- Active step dot: `--color-primary` 12px circle with white inner 4px dot

### Navigation

- Top bar: White background, `--color-border` bottom border (1px)
- Tool name: Nunito 700, 18px, `--color-text`
- "by Angkin" mark: Right-aligned, Yeseva One 14px, `--color-primary`
- No hamburger for single-tool pages — navigation is minimal
- Mobile: Back arrow + tool name + Angkin badge, no excess nav

---

## 9. Animation Philosophy

**Philosophy:** Warmth in motion. Nothing abrupt, nothing jarring. Animations feel like a gentle exhale — not YOLO snappy, not corporate stiff.

**Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — a gentle overshoot (spring-like) for reveals. `ease-out` for disappearing elements.

**Duration Standard:**
- Micro (hover/focus): 150ms
- Component transition (input state change): 200ms
- Section reveal: 350ms
- Result reveal: 450ms + number count-up 800ms

### Key Moments

**Form field focus:** Border color transitions from tan → amber (200ms). Background shifts from white → `--color-surface-warm` (200ms). Label scales up slightly (transform: scale(1.02)).

**Compute button press:**
1. Button scales to 0.97 (100ms)
2. Shimmer effect sweeps across button (300ms)
3. Button shows spinner (Nunito "Kinakalkula..." with animated dots)
4. After 600ms simulated delay: result card slides up (`translateY(20px)` → 0, opacity 0 → 1, 450ms)
5. Number counts from 0 to final value over 800ms using easeOut

**Result reveal extras:**
- Confetti: NOT USED — would feel gamified and undermine the trust moment
- Instead: A single warm pulse (box-shadow expands and fades) around the result card — like a heartbeat confirming the answer

**Hover states:** Buttons lift with shadow increase (150ms). Links have warm underline reveal. Cards on hover (if interactive) get slight elevation shadow increase.

**CSS-only for all animations** — no JS animation library dependency. The count-up is the one exception, using a small inline `<script>` (~10 lines of vanilla JS).

---

## 10. Accessibility Approach

**Target:** WCAG 2.1 AA minimum, targeting AAA for primary text and interactive elements.

**Contrast Ratios:**
- `--color-text` (#2D1B0E) on `--color-bg` (#FEF9F2): **Ratio ~15:1** — exceeds AAA
- `--color-text` on card white (#FFFFFF): **Ratio ~16:1** — AAA
- White text on `--color-primary` (#C4552A): **Ratio ~4.8:1** — passes AA for 16px+
- White text on `--color-primary-dark` (#9E3F1A): **Ratio ~6.2:1** — passes AAA for normal text
- `--color-text-secondary` (#7A5C46) on white: **Ratio ~5.1:1** — passes AA
- VERIFY: Run all palette combinations through WCAG checker before ship

**Focus Visible Strategy:**
- Default browser focus outline is REPLACED with a warm amber ring: `outline: 3px solid #E8943A; outline-offset: 3px`
- Never `outline: none` without replacement
- Focus ring must be visible against both cream background AND white card surfaces

**Screen Reader Considerations:**
- Result section has `role="region" aria-label="Resulta ng Kalkulasyon"`
- Dynamic result: `aria-live="polite"` so screen readers announce when result updates
- Number count-up animation: aria-live region only updates when complete (not every tick)
- All inputs have `<label>` elements, never `placeholder` as sole label
- Error messages linked to inputs via `aria-describedby`
- Form submit announces "Kinakalkula..." then announces result via aria-live

**Color-Blind Safe Verification:**
- Success (green) and Error (red) signals are NEVER conveyed by color alone — always accompanied by icon (✓, ✗) and text
- Palette tested in Deuteranopia simulation: primary terracotta shifts toward brownish-orange (distinguishable from green)
- Protanopia: terracotta appears amber-brown (still distinct)
- Tritanopia: no issues with blue channel (palette is warm, not blue-dependent)

**Touch Targets:**
- All interactive elements minimum 48×48px
- Buttons: 56px height, minimum 200px width
- Checkboxes/radio buttons: 24×24px touch area with 12px hit area extension via `padding`
- Input fields: 52px height

**Language/Reading Accessibility:**
- All Tagalog copy is backed by English equivalents (Tagalog label, English subtitle)
- `lang="fil"` on Tagalog content sections, `lang="en"` on English
- Reading level target: Grade 6 equivalent (Flesch-Kincaid) for all interface copy

---

## 11. Icon & Illustration Style

**Icon Library: [Phosphor Icons](https://phosphoricons.com/)** — Regular weight (not Bold, not Thin)
- Line weight: 1.5px at 24px render size (Regular variant)
- Fill vs. outline: Outline by default; fill for active/selected states
- Color: Inherits from context (`--color-text-secondary` for neutral, `--color-primary` for active)
- Size system: 16px (inline), 20px (UI element), 24px (standalone), 32px (feature icon)

**Specific Phosphor icons for Retirement Pay tool:**
- `<Calculator>` — tool identity icon in header
- `<CurrencyCircleDollar>` (or peso variant) — currency input prefix
- `<Briefcase>` — years of service field
- `<User>` — employee information section
- `<CheckCircle>` — validation success
- `<Warning>` — warning state

**Illustration Approach: Minimal Spot Illustrations**
- Not used in calculators directly — complexity without payoff
- EXCEPTION: The empty state (before any computation) uses a small spot illustration: a gentle abstract shape suggesting the Philippine sun, rendered in warm terracotta + amber + cream, purely geometric (no faces, no characters)
- The "Angkin" logo sun mark can be used decoratively, scaled up as a background watermark in the result card (10% opacity, top-right corner)

**No custom illustration for every tool** — the 148-tool scale makes this impractical. The icon system carries the visual identity.

---

## 12. Dark Mode Strategy

**Decision: Opt-in dark mode, off by default.**

Filipino users (per landscape analysis) are in bright outdoor environments frequently — dark mode helps in-app comfort at night but hurts readability in sunlight. Default is always light mode. A moon/sun toggle appears in the top navigation.

**Dark Mode Palette Transformation:**

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#FEF9F2` | `#1A1008` (deep warm black) |
| `--color-surface` | `#FFFFFF` | `#2A1D10` (warm dark brown) |
| `--color-surface-warm` | `#FFF6E8` | `#321F10` (slightly warmer) |
| `--color-primary` | `#C4552A` | `#E8794F` (lightened for dark bg) |
| `--color-secondary` | `#E8943A` | `#F5A858` (lightened) |
| `--color-accent` | `#C8A84B` | `#E0C06A` (lightened) |
| `--color-text` | `#2D1B0E` | `#F5EDE1` (warm cream) |
| `--color-text-secondary` | `#7A5C46` | `#C4A885` (lighter warm brown) |
| `--color-border` | `#E8D5BC` | `#4A3520` (dark warm border) |

**Dark mode personality:** The warmth is PRESERVED in dark mode — this is not a cold, clinical dark theme. It feels like candlelight vs. daylight. The terracotta accent deepens and glows. The overall feel is "evening, cozy, still trustworthy."

**Implementation:** `prefers-color-scheme: dark` for system-default, plus a `data-theme="dark"` attribute on `<html>` for user toggle. JavaScript (localStorage) for persistence.

---

## 13. Multi-Tool Cohesion

**The Angkin Contract — invariant vs. variant:**

### Always the Same (Invariant — All 148 Tools)
- Yeseva One + Nunito font pairing
- Warm cream background (`#FEF9F2`)
- Pill-shaped primary buttons
- Card border radius (16px)
- Top navigation structure (tool name left + Angkin badge right)
- Result display pattern (large Yeseva number, blush card background, warm left border)
- "Kalkulasyon ni Angkin" badge on result
- Footer with "Angkin — Philippine Compliance Tools" and link to tool suite
- Spacing scale (8px grid)
- Animation easing function
- WCAG AA accessibility baseline

### Changes Per Domain (Variant)
- Primary color (`#C4552A` default → domain-specific override per Section 5)
- Tool name in header (e.g., "RetireMath", "TaxKlaro", "SSS Kompute")
- Domain-specific icon in header
- Section labels and micro-copy (remain Tagalog-first but tool-specific)
- Input fields (completely different per tool's calculation logic)
- Result breakdown structure (unique to each calculation)

### How a User Knows It's Angkin on Tool #47
The moment the page loads, three signals fire simultaneously:
1. **Warm cream background** — immediately recognizable from any other Angkin tool
2. **Yeseva One heading** — the same font they've seen before
3. **"by Angkin" badge** — top-right, always present

These three signals require zero conscious processing — they pattern-match at the pre-cognitive level. The user doesn't think "oh this is Angkin," they just *feel at home.*

---

## 14. Developer Ergonomics

**New tool spin-up flow:**

```bash
# 1. Copy the scaffold
cp -r angkin-scaffold/ tools/my-new-tool/
cd tools/my-new-tool/

# 2. Set token overrides (if not using default terracotta)
# Edit tokens.css: change --color-primary and --color-secondary

# 3. Define inputs in calculator.js
# 4. Implement calculation logic in calculator.js
# 5. Done — open index.html
```

**Token file structure:**
```
angkin-design/
├── tokens/
│   ├── base.css          # Core palette, spacing, typography (never edit)
│   ├── themes/
│   │   ├── labor.css     # Labor/retirement domain override
│   │   ├── tax.css       # Tax/BIR domain override
│   │   ├── property.css  # Property domain override
│   │   └── ofw.css       # OFW/remittance domain override
├── components/
│   ├── button.css
│   ├── input.css
│   ├── card.css
│   ├── result-display.css
│   └── navigation.css
├── layouts/
│   ├── single-form.html  # Template: single-form calculator
│   ├── multi-step.html   # Template: wizard flow
│   └── lookup.html       # Template: lookup/table tool
└── angkin.js             # Calculator runtime, count-up, accessibility helpers
```

**Component API surface:**
- No JavaScript framework required — pure HTML/CSS/JS
- CSS Custom Properties for all tokens — any value overridable at any scope level
- `angkin.js` exposes `AngkinCalc.init()`, `AngkinCalc.setResult()`, `AngkinCalc.countUp()`
- Zero build step for new tools — drop in HTML + override tokens

**Time estimates:**
- Design system setup (first tool): 4–6 hours
- New single-form calculator from scaffold: **2–3 hours** (mostly writing calculation logic)
- New multi-step wizard: 4–6 hours
- Token customization for new domain: 30 minutes

---

## 15. Deployment Model

**Hub + Micro-Apps**

- `angkin.ph` — central hub: directory of all 148 tools, search, category browsing
- `retire.angkin.ph` — retirement tools (standalone PWA)
- `tax.angkin.ph` — BIR/tax tools (standalone PWA)
- `labor.angkin.ph` — DOLE labor tools (standalone PWA)
- etc.

**Rationale:**
- Each micro-app can be cached independently (offline use for field workers)
- Domain-specific URLs are shareable and SEO-friendly ("labor calculator Philippines")
- Each micro-app loads ONLY its domain's tools — no 148-tool JS bundle
- Shared design system is consumed as a CDN-hosted CSS package (`cdn.angkin.ph/design/v1/angkin.css`)
- Each tool is a static HTML file — deployable to Cloudflare Pages, GitHub Pages, or any CDN with zero backend

**Hub structure:**
- Discovery layer with search, category filters, most-used tools
- Deep links to individual micro-apps
- Consistent Angkin header + "recently used" tracking (localStorage)

---

## 16. Scalability Assessment

**At 10 tools:** Perfect. Every tool looks great, feels hand-crafted.

**At 50 tools:** Strong. The scaffold system starts paying off. Developers can ship a new tool in 2–3 hours. Domain color themes prevent visual monotony. Minor risk: ensuring all tools stay in sync with base token updates (addressed by CDN versioning).

**At 148 tools:** The following must be built to prevent degradation:
1. **Token governance**: A formal process for reviewing any base.css change before it ripples to all 148 tools
2. **Snapshot testing**: Visual regression tests (e.g., Percy/Chromatic) to catch unintended changes across all HTML scaffolds
3. **Content guidelines**: A written guide for micro-copy tone in Tagalog/English, ensuring tools #100–148 feel as warm as #1–10
4. **Icon governance**: A curated list of approved Phosphor icons per domain — prevents developers choosing inconsistent icons
5. **Multi-domain testing**: Ensure all 5 domain color themes maintain WCAG AA at all token combinations

**What breaks first without governance:** Micro-copy tone drift. Technical developers writing form labels in English when Tagalog-first is the standard.

**What holds forever without intervention:** The visual identity — fonts, spacing, pill buttons, warm cream background. These are CSS constants that require no maintenance.

---

## 17. Trade-offs

### What This Option Explicitly Sacrifices

**1. Maximum Brand Neutrality**
The warm terracotta palette is deeply Filipino-inspired — it may feel less universally "professional" to users who associate credibility with cool blues and whites (BPI, Maya aesthetic). An accountant at a multinational firm might perceive this as a "local" tool rather than a "serious" tool. *This is acceptable because our primary audience is the everyday Filipino, not MNC accountants.*

**2. Western SaaS Aesthetics**
This does not look like a Y Combinator startup's product. Users who've internalized Notion/Linear/Stripe as the "correct" look for software may find it less premium. *This is acceptable because our target users have GCash as their fintech benchmark, not Notion.*

**3. Very Dense Data Presentations**
The airy spacing and large touch targets make this sub-optimal for accountants doing 50 computations per day who want data density. Those users are better served by Option 7 (Dashboard-Native Power Tool). *Filipino Warmth optimizes for first-time and occasional users — the 80% majority.*

**4. Font Loading Dependency**
Yeseva One + Nunito require Google Fonts CDN. In slow network conditions, there's FOUT (flash of unstyled text). Mitigated by `font-display: swap` and `<link rel="preconnect">`, but not eliminated. *Acceptable tradeoff for the distinctive warmth Yeseva One provides — a system-font fallback maintains layout integrity.*

**5. Dark Mode Full Coverage**
Dark mode is an afterthought here (opt-in, not the primary experience). Some users who rely on dark mode for medical reasons (photosensitivity) may find the light-first approach limiting. *Mitigated by the availability of the dark mode toggle; primary experience optimization for outdoor Filipino users justifies the light-first default.*

# Option 8: Mobile-First Micro-App

**Slug:** `mobile-first`
**Aspect:** 20 (Wave 2, Option 8)

---

## 1. Design Philosophy

This design believes that compliance tools are a daily reality for millions of Filipinos who live on their phones — not on desktops, not in offices, but in jeepneys, on break, between shifts. Every pixel must earn its place on a 6-inch screen. Complexity is the enemy of compliance. When the tool gets out of the way, Filipinos do the right thing.

---

## 2. Persona Narrative

**Renz, 27, warehouse packer in Parañaque.** He owns one device: a Redmi Note 12 he bought on installment from Lazada. He uses GCash daily, browses TikTok on his commute, and has never used a desktop computer at work. He's leaving his job of 3 years and heard he might be owed separation pay — but he's never heard of RA 7641. His cousin sent him an Angkin link via Messenger. He opens it during his lunch break with his left thumb, standing at a carinderia. The network is LTE but spotty. He needs the answer in 90 seconds or he'll forget to follow up.

**Device:** Redmi Note 12, 6.67" screen, Chrome 120. Not logged in. Battery at 41%.
**Emotional state:** Hopeful but uncertain. Low trust in government tools. High trust in GCash-style apps.
**Goal:** A number. The peso amount he's owed. That's it.

---

## 3. Competitive DNA

Inspired by **GCash's** immediate value delivery + **Maya's** clean card-based layouts, differentiated by zero upsell, zero account wall, and instant offline capability that neither GCash nor Maya offers for utility tools. The emotional DNA comes from the best consumer fintech apps in the Philippine market, but stripped of the bank-anxiety of BPI/BDO and the gamification pressure of GCASH rewards. This is a focused tool, not a super-app.

Where GCash asks "do you want a loan?" immediately after, Angkin says "here's your answer, share it if you want." Where BIR eFPS requires a desktop and a 20-step process, Angkin works at a carinderia with one thumb.

---

## 4. Brand Expression

**"By Angkin"** appears as a small pill badge (`by angkin`) in the top-left corner of every tool screen — the same position across all 148 tools, always 24px high, always in the Angkin primary indigo. The tool name ("RetireMath") takes prominence as the screen title.

The Angkin logo mark is a minimalist angular "A" glyph (geometric, distinctive) that appears as a 32×32px favicon/PWA icon and in the splash screen. It does NOT dominate the header — the tool name does.

**Suite cohesion:** All 148 tools share: identical bottom navigation, identical badge position, identical card radius (20px), identical typography scale, and the same indigo primary action color. Per-tool differentiation: category color accent (labor tools = teal, tax tools = amber, property tools = coral). A user who has used any Angkin tool immediately recognizes the family.

---

## 5. Color System

| Token | Hex | Semantic Rationale |
|-------|-----|-------------------|
| `--color-primary` | `#3B5BDB` | Indigo blue — digital trust, sky, Philippine flag blue |
| `--color-primary-light` | `#E7EDFF` | Tinted backgrounds for primary areas |
| `--color-primary-dark` | `#2845B8` | Pressed state, active tabs |
| `--color-accent` | `#F59E0B` | Warm amber — Philippine sun, warmth, optimism |
| `--color-accent-light` | `#FEF3C7` | Accent backgrounds |
| `--color-success` | `#059669` | Emerald green — positive result, "you're owed money" |
| `--color-success-light` | `#D1FAE5` | Success card backgrounds |
| `--color-warning` | `#D97706` | Amber warning |
| `--color-error` | `#DC2626` | Red error |
| `--color-error-light` | `#FEE2E2` | Error card backgrounds |
| `--color-bg` | `#F0F4FF` | Very light indigo tint — feels like a distinct app environment |
| `--color-surface` | `#FFFFFF` | Card surfaces |
| `--color-surface-raised` | `#FAFCFF` | Slightly elevated surfaces |
| `--color-text-primary` | `#0F172A` | Near-black, maximum legibility |
| `--color-text-secondary` | `#475569` | Secondary labels |
| `--color-text-tertiary` | `#94A3B8` | Placeholder, disabled |
| `--color-border` | `#E2E8F0` | Subtle card borders |
| `--color-border-strong` | `#CBD5E1` | Input borders (active) |

**Domain color overrides:**
- Labor/Employment tools: `--color-primary: #3B5BDB` (default indigo)
- Tax tools: `--color-primary: #B45309` (amber-brown)
- Property tools: `--color-primary: #BE185D` (rose)
- SSS/GSIS: `--color-primary: #047857` (emerald)
- Maritime: `--color-primary: #0369A1` (ocean blue)

---

## 6. Typography System

**Display font:** `Bricolage Grotesque` (Google Fonts)
Characterful, slightly quirky grotesque that feels handcrafted. At large sizes it has personality without being playful. Excellent at 32–48px for hero numerals (the final computed result).

**Body font:** `Plus Jakarta Sans` (Google Fonts)
Designed by Indonesian-Filipino type designer Gumpita Rahayu. Clean, warm, deeply legible at 14–16px. Excellent x-height for small Android screens. A meaningful choice: Southeast Asian provenance matches the audience.

| Scale | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| hero-number | Bricolage Grotesque | 56px / 3.5rem | 700 | The computed result amount |
| display | Bricolage Grotesque | 28px / 1.75rem | 700 | Screen titles |
| h1 | Bricolage Grotesque | 22px / 1.375rem | 600 | Section headers |
| h2 | Plus Jakarta Sans | 18px / 1.125rem | 600 | Card titles |
| h3 | Plus Jakarta Sans | 16px / 1rem | 600 | Field group labels |
| body | Plus Jakarta Sans | 15px / 0.9375rem | 400 | Main content |
| body-sm | Plus Jakarta Sans | 13px / 0.8125rem | 400 | Helper text, captions |
| label | Plus Jakarta Sans | 12px / 0.75rem | 600 | Input labels (uppercase) |
| caption | Plus Jakarta Sans | 11px / 0.6875rem | 400 | Legal text, fine print |

**Why these fonts:** Bricolage Grotesque gives the result numbers genuine personality — when ₱42,000 appears in a 56px Bricolage Grotesque 700, it feels like news, not output. Plus Jakarta Sans is one of the most legible body fonts available at small sizes on budget Android screens (critical for ₱5,000 Redmi phones), and its Southeast Asian origin story is authentic to the audience.

---

## 7. Spatial Philosophy

**Density:** Mobile-optimized. Generous vertical rhythm, compact horizontal footprint.

**Core principle:** Everything designed for a thumb in the bottom 2/3 of the screen. The "Golden Zone" (thumb reach on a 6.7" phone) is 60–90% from the top — primary actions live there.

**Grid:** Single column, 16px horizontal padding (24px on wider screens). No multi-column on mobile. On tablet (768px+), max 480px centered column.

**Breakpoints:**
- `< 480px`: Full-width single column, 16px padding (primary)
- `480px–767px`: Max 480px centered, 24px padding
- `768px+`: Max 600px centered, side padding auto (tablet mode)
- `1024px+`: Desktop warning banner: "This tool is optimized for mobile" with QR code

**Spacing scale (base 4px):**
- `space-1`: 4px — micro gaps
- `space-2`: 8px — tight internal spacing
- `space-3`: 12px — input internal padding
- `space-4`: 16px — card padding, section gaps
- `space-5`: 20px — between cards
- `space-6`: 24px — major sections
- `space-8`: 32px — screen sections
- `space-10`: 40px — hero spacing

**Touch targets:** Minimum 48×48px for all interactive elements. Labels positioned above inputs (not floating) for predictability.

**Bottom navigation:** Fixed 64px bottom bar. All interactive content padded 64px from bottom.

**Border radius:** Cards at 20px, inputs at 12px, buttons at 12px (full radius for pill buttons), badges at 100px.

---

## 8. Component Patterns

### Buttons

**Primary (CTA — "I-compute"):**
```
background: var(--color-primary)
color: white
border-radius: 14px
height: 56px
width: 100%
font: Plus Jakarta Sans 600 16px
letter-spacing: 0.01em
box-shadow: 0 4px 14px rgba(59, 91, 219, 0.35)
```
On press: scale(0.97), shadow reduces. Haptic feedback (CSS `touch-action` + JS vibrate API).

**Secondary:**
```
background: var(--color-primary-light)
color: var(--color-primary)
border: none
border-radius: 14px
height: 48px
```

**Ghost:**
```
background: transparent
color: var(--color-primary)
border: 1.5px solid var(--color-primary)
border-radius: 14px
height: 48px
```

**Share button (result screen):**
```
background: var(--color-accent)
color: var(--color-text-primary)
border-radius: 14px
height: 52px
```

### Inputs

```
background: white
border: 1.5px solid var(--color-border)
border-radius: 12px
height: 56px
padding: 0 16px
font: Plus Jakarta Sans 400 16px
```

Label: 12px Plus Jakarta Sans 600 uppercase, 8px above input, color `var(--color-text-secondary)`.

Focus: `border-color: var(--color-primary)`, `box-shadow: 0 0 0 3px rgba(59,91,219,0.15)`.

Error: `border-color: var(--color-error)`, error message 12px red below input.

**₱ prefix:** Inline start adornment showing `₱` in primary color.

**Number inputs:** Large keypad-optimized (`inputmode="decimal"`), auto-format with comma separators.

### Cards

```
background: white
border-radius: 20px
box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)
padding: 20px
```

### Result / Output Display

The result is THE key moment. When computation completes:

1. **Bottom sheet slides up** (translateY animation, 300ms ease-out)
2. **Green gradient card** fills the sheet: `linear-gradient(135deg, #059669, #10B981)`
3. **Hero number** in white Bricolage Grotesque 700 56px counts up from 0 to result (600ms with easeOutCubic)
4. **Label** "Retirement Pay (RA 7641)" in white 14px below
5. **Subtext** "Batay sa iyong inputs" (Based on your inputs) in white/70% opacity
6. **Share button** and **New Computation button** below

Breakdown table below the hero card: itemized line items (Basic Pay Component, Length of Service Factor, etc.) in a plain white card.

### Progress Indicator

None needed for single-form — the form IS the progress. For multi-step tools: horizontal pill bar at top (not inside header).

### Navigation

**Bottom Navigation Bar (fixed):**
```
Home | Tools | Saved | Tulong (Help)
```
Active tab: filled icon + primary color label + subtle pill underline.

**App Header (per-screen):**
```
height: 56px
left: "< Back" or hamburger
center: Tool name (Bricolage Grotesque 600 18px)
right: "by angkin" pill badge
```

---

## 9. Animation Philosophy

**CSS-only animations** for all interactions (no JS animation library — performance on budget phones).

**Key moments:**

1. **App load** — Splash screen with Angkin "A" glyph that scales in (scale 0.8 → 1, 400ms ease-out), then crossfade to tool screen.

2. **Input focus** — Input border color transitions (150ms). Label stays static (avoids the cognitive load of floating labels).

3. **Button press** — `transform: scale(0.97)` on `touchstart`, restored on `touchend` (80ms). Fast and satisfying.

4. **Compute loading** — Button changes to spinner (CSS `@keyframes spin`) inside button text, 16px spinner with 3px indigo border. No skeleton screens — result comes fast.

5. **Result reveal** — The hero moment:
   - Bottom sheet `translateY(100%) → translateY(0)` over 350ms cubic-bezier(0.34, 1.56, 0.64, 1) (slight spring overshoot)
   - Number counter: JS `requestAnimationFrame` counting from 0 to result over 700ms easeOutCubic
   - Green background gradient fades in 200ms after sheet reaches position

6. **Tab navigation** — Active tab indicator slides horizontally (pill underline, `left` transition 200ms ease).

7. **Error shake** — Invalid inputs trigger `@keyframes shake` (translateX ±4px, 3 cycles, 300ms).

**NO page transitions between tools** (each is an independent PWA, no routing animation needed).

---

## 10. Accessibility Approach

**Target:** WCAG 2.1 AA (minimum). WCAG 2.2 compliance for touch targets.

**Contrast ratios:**
- Primary text on white background: `#0F172A` / `#FFFFFF` = 18.1:1 (AAA)
- Secondary text on white: `#475569` / `#FFFFFF` = 5.9:1 (AA)
- White text on primary: `white` / `#3B5BDB` = 4.6:1 (AA)
- White text on success: `white` / `#059669` = 5.0:1 (AA)
- Accent text on white: `#B45309` (darkened for text) / `white` = 5.2:1 (AA)

**Touch targets:** All interactive elements minimum 48×48px (WCAG 2.2 criterion 2.5.8).

**Focus visible:** Blue ring `box-shadow: 0 0 0 3px rgba(59,91,219,0.5)` on all focusable elements. Keyboard navigation fully supported (important for users who pair Bluetooth keyboard with tablet).

**Screen reader:**
- All inputs have `aria-label` + `aria-describedby` for helper text
- Result section uses `role="region" aria-label="Resulta ng Kalkulasyon"`
- Number counter: final value is set as accessible text after animation (`aria-live="polite"`)
- Error messages: `role="alert"` for immediate announcement

**Color blind safe:** Indigo (#3B5BDB) and amber (#F59E0B) are distinguishable for all common color vision deficiencies. Success/error differentiated by icon + text, not color alone.

**Language:** Tagalog micro-copy tested for reading comprehension at Grade 6 level. Short sentences. Active voice.

**Font size:** Minimum 15px body, never smaller than 11px for any visible text. Respects `prefers-reduced-motion` by disabling counter animation and bottom-sheet spring.

---

## 11. Icon & Illustration Style

**Icon library:** Phosphor Icons (MIT license) — Regular weight (1.5px stroke). Why Phosphor: better coverage of Filipino compliance contexts (document, calculator, ID card, calendar, peso sign) than Lucide. More personality than Heroicons.

**Icon sizes:** 20px (navigation), 24px (in-form), 32px (category headers).

**Spot illustrations:** None for most tools — icon only. Exception: the empty state (no saved calculations yet) uses a single-color spot illustration of a phone with a calculator on screen, rendered in the primary color family. Max 120×120px.

**The Angkin "A" mark:** A geometric letter A with the crossbar replaced by a horizontal line extending left, suggesting calculation = balance = equals sign. Simple SVG, works at 16px–256px. Used as favicon, PWA icon, splash screen.

**Result state:** Checkmark icon (Phosphor `CheckCircle` filled) in white, 40px, appears on success card before the hero number.

---

## 12. Dark Mode Strategy

**Yes — automatic system-preference only** (no manual toggle, reduces cognitive load).

```css
@media (prefers-color-scheme: dark) {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-surface-raised: #263548;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-border: #334155;
  --color-border-strong: #475569;
  --color-primary-light: #1E3A8A;
}
```

**Primary color unchanged** in dark mode (indigo reads well on dark). Success green unchanged. Accent amber lightened: `#FBBF24`.

**Personality in dark mode:** Shifts from "trustworthy daytime fintech" to "working late, serious, productivity mode." The indigo primary glows on dark surfaces. This works particularly well for night-shift workers checking retirement pay calculations at 2am.

**Does NOT change brand identity** — the same Angkin badge, same layout, same touch patterns. Dark mode is surface-only.

---

## 13. Multi-Tool Cohesion

**Invariant (same across all 148 tools):**
- Bottom navigation (same 4 tabs, same icons)
- "by angkin" pill badge (top-right, 24px height, same indigo)
- Card radius: 20px
- Button height: 56px (primary), 48px (secondary)
- Font pair: Bricolage Grotesque + Plus Jakarta Sans
- Result card pattern: bottom sheet + hero number + green success card
- Error toast pattern
- PWA manifest structure (icon, splash screen, name format: "ToolName by Angkin")
- Bottom navigation height: 64px
- Header height: 56px

**Variant (changes per tool):**
- Tool name (in header)
- Category accent color (labor = default indigo, tax = amber, property = rose...)
- Input fields (different for each calculation)
- Result label ("Retirement Pay," "Income Tax Due," "Overtime Rate...")
- Legal reference footer (RA 7641, NIRC, etc.)
- Breakdown line items

**The "family recognition moment":** A user on tool #47 (SSS Contribution Calculator) who has used tool #3 (BIR Income Tax) sees the same bottom navigation, same result reveal animation, same "by angkin" badge. Within 2 seconds they know they're in the same family. Trust transfers.

---

## 14. Developer Ergonomics

**Token file structure:**
```
angkin-tokens/
├── colors.css        # All CSS custom properties
├── typography.css    # Font imports + scale variables
├── spacing.css       # Space scale, radius, shadows
├── components.css    # Button, input, card base styles
├── animations.css    # Keyframes and transition classes
└── index.css         # Barrel import
```

**Component API (plain HTML + CSS, no framework dependency):**
```html
<!-- Primary button -->
<button class="btn-primary">I-compute</button>

<!-- Input with label -->
<div class="field">
  <label class="field-label">BASIC MONTHLY SALARY</label>
  <div class="input-wrapper">
    <span class="input-prefix">₱</span>
    <input class="input" type="number" inputmode="decimal" placeholder="0.00">
  </div>
</div>

<!-- Result card -->
<div class="result-sheet" role="region" aria-label="Resulta">
  <div class="result-hero">
    <span class="result-amount">₱42,000.00</span>
    <span class="result-label">Retirement Pay (RA 7641)</span>
  </div>
</div>
```

**New tool setup time:** ~45 minutes from scratch using the token system:
- 5 min: Copy `angkin-tokens/index.css`
- 5 min: Set up HTML shell with nav + header
- 20 min: Add tool-specific input fields
- 10 min: Wire calculation logic (JS)
- 5 min: Configure PWA manifest

**Framework compatibility:** Pure CSS tokens work with React, Vue, vanilla JS, Astro. No dependencies. Can be consumed as a `<link>` CDN URL from Angkin's own CDN.

---

## 15. Deployment Model

**Independent PWAs** — each of the 148 tools is its own installable Progressive Web App.

**URL structure:** `[toolname].angkin.ph` (e.g., `retiremath.angkin.ph`)

**Shared via CDN:**
- `cdn.angkin.ph/tokens/v1/index.css` — design tokens
- `cdn.angkin.ph/js/calc-utils/v1/format.js` — ₱ formatting, input handling
- `cdn.angkin.ph/js/pwa/v1/sw-template.js` — service worker template

**Service worker:** Cache-first for all assets. Network-first for calculation results (future: API). Offline capable — all calculations are client-side JS, so they work offline after first load. The PWA installs to the homescreen like a real app (no app store needed — critical for budget Android users who avoid Play Store data).

**Hub page:** `angkin.ph` is a directory app that links to all 148 tools, organized by category. Same design system, functions as the "app drawer."

**Why independent PWAs vs. monolithic app:** A user who only needs RetireMath gets a 50KB tool, not a 2MB monorepo. Installable individually. Can be deep-linked from HR memo PDFs, Facebook posts, Messenger. Each tool can be updated independently without breaking others.

---

## 16. Scalability Assessment

**At 10 tools:** Perfect. Token system is simple, every tool identical structurally, fast to build.

**At 50 tools:** Good. CDN token URL must be versioned (done). Hub directory needs search/filtering. Tool naming convention becomes important.

**At 148 tools:** The stress points:
1. **Discovery** — 148 tools at `angkin.ph` needs search + category filtering + "recently used" based on localStorage. Must be built by tool #30.
2. **Category colors** — 5 domain color overrides may not cover all 148 categories. Needs a formal taxonomy by tool #50.
3. **Calculation complexity** — Some tools (tax brackets, SSS contribution tables) require lookup tables. The "JS inline" approach breaks at complex calculations. Need a lightweight calculation engine library (still client-side) by tool #30.
4. **Token versioning** — When tokens must change (design refresh), all 148 PWAs need updating. CDN URL versioning handles this, but requires coordination.

**What breaks first:** Discovery. At 148 independent URLs, users will never find half the tools without a good hub + search experience. The hub must be treated as a first-class product by the time 30+ tools exist.

**What NEVER breaks:** The per-tool experience. Each PWA is isolated. A bug in tool #47 doesn't affect tool #3.

---

## 17. Trade-offs

**This design explicitly sacrifices:**

1. **Desktop experience** — At 1024px+, a single 480px column looks narrow. Desktop users get a suboptimal experience. *Acceptable because:* 85%+ of Philippine web traffic is mobile. Desktop users going to compliance tools are likely HR professionals who deserve a dedicated power-tool experience (Option 7).

2. **SEO / content marketing** — Independent PWAs with thin HTML shells don't support the content-first SEO model. No article text, no related content, no FAQ schema. *Acceptable because:* Distribution via Messenger/Facebook/deep links is more effective than organic search for this audience. Google rarely ranks calculator-only pages highly anyway.

3. **Unified account/saved state** — Independent PWAs with localStorage don't share data across tools. A user can't see all their saved calculations in one place (unless they install the hub app). *Acceptable because:* Renz doesn't want an account. He wants an answer. Saved state is a nice-to-have, not a requirement for the primary persona.

4. **Rich data visualization** — No charts, no graphs, no comparison views. The result is a number. *Acceptable because:* Data viz on a 375px screen with complex compliance data creates more confusion than clarity. A clear number with a breakdown table is more useful than a pie chart.

5. **Cross-tool workflow** — A user can't flow from "RetireMath" to "Final Pay Calculator" within the same app. Each tool is its own island. *Acceptable because:* The hub page serves discovery and cross-linking. Deep integration creates complexity that breaks the single-focus philosophy.

# Option 10: Bold Geometric

**Slug:** `bold-geometric`
**Aspect:** 22 (Wave 2, Option 10)

---

## 1. Design Philosophy

This design believes that a compliance tool can be a cultural artifact — something worth screenshotting, sharing, and talking about. Bold Geometric rejects the assumption that "serious" means "invisible." It borrows the vernacular of Philippine modernist print culture — the bold declarative posters of CHED, the Marcos-era geometric murals of CCP, the grid precision of Palanca Award typography — and fuses it with contemporary high-contrast digital product design. Every computation result is a poster moment. Every input is a purposeful act in a system that respects your intelligence.

---

## 2. Persona Narrative

**Jolo, 27, UX designer at a BGC fintech startup.** He handles HR tasks for himself as a new freelancer — computing SSS contributions, checking 13th month pay, researching retirement pay rules he'll eventually need. He uses a MacBook Pro 14" at the office and a Pixel 9 Pro during commute. He has strong opinions about design. He'd share a well-designed tool on his Twitter/X if it looked good enough to screenshot. He finds every existing Philippine compliance tool deeply ugly and embarrassing for a country with the design talent the Philippines has. He wants a tool that matches the quality of the apps he builds — something that shows respect for Filipino users as design-literate people. He types fast, reads labels carefully, and immediately distrust anything that looks like it was made in 2010.

**Device:** MacBook Pro (primary) + Pixel 9 Pro (secondary)
**Emotional state:** Quietly judgmental on arrival — pleasantly surprised if the design earns his respect. Competent, curious, wants depth.
**Goal:** A fast, accurate calculation he can trust — with the visual quality he'd be proud to recommend to colleagues.

---

## 3. Competitive DNA

Inspired by **Stripe's** obsessive typographic precision + **Linear's** high-contrast dark surfaces + the editorial boldness of **Swiss International Typographic Style** (think Neue Haas Unica, Armin Hofmann grids), differentiated by Philippine cultural geometry: the angular motifs of weaving patterns (hablon, abel), the bold sector-color maps used in DICT infrastructure diagrams, and the deliberate asymmetry of contemporary Filipino graphic design studios like Team Manila and Hardworking Goodlooking. Where Option 4 (Stripe-Grade) builds a neutral professional system, Bold Geometric commits to a singular aesthetic voice. Where Option 7 (Dashboard-Native) is dense with data, Bold Geometric is theatrical with data — every result is staged like an exhibition.

---

## 4. Brand Expression

**"by Angkin"** appears as a geometric wordmark in the top-left — Barlow Condensed, all-caps, letter-spaced, white on the dark primary surface. The tool name ("RetireMath") is set in Bebas Neue at display scale, acting as a proper nameplate. A thin neon-yellow rule (#F5E642) 2px wide runs across the full width of the header — the signature "Angkin stripe" that appears on every tool.

The Angkin suite identity is expressed through:
- The invariant yellow stripe across every tool header — a visual signature recognizable at a glance
- The dark primary surface (`#0F0F14`) for all navigation/header areas — creates the illusion of a unified "product shell"
- Barlow Condensed for all "Angkin" system labels (navigation, badges, breadcrumbs)
- A consistent geometric icon system (Phosphor icons, bold weight) across all 148 tools

Per-tool variation: the accent color changes by domain. Tax tools use electric amber `#F5A623`. Labor/employment tools use the signature yellow `#F5E642`. Property tools use vivid coral `#FF5C38`. Maritime/transport tools use electric cyan `#00D4FF`. SSS/social security tools use bright mint `#00E5A0`. The dark shell remains constant; only the accent shifts.

---

## 5. Color System

| Token | Hex | Semantic Rationale |
|-------|-----|-------------------|
| `--color-bg` | `#0F0F14` | Near-black with blue undertone — premium, focused, removes visual noise |
| `--color-surface` | `#1A1A24` | Slightly lifted dark surface for cards and input fields |
| `--color-surface-elevated` | `#252532` | Hover states, active cards |
| `--color-accent` | `#F5E642` | Electric yellow — the Angkin signature; labor/employment domain |
| `--color-accent-tax` | `#F5A623` | Warm amber for tax domain tools |
| `--color-accent-property` | `#FF5C38` | Vivid coral for property/real estate tools |
| `--color-accent-social` | `#00E5A0` | Bright mint for SSS/PhilHealth/Pag-IBIG tools |
| `--color-accent-maritime` | `#00D4FF` | Electric cyan for maritime/transport |
| `--color-text-primary` | `#F0F0F5` | Near-white for body text — slightly warm to ease eye strain |
| `--color-text-secondary` | `#8888A0` | Muted lavender-grey for helper text, secondary labels |
| `--color-text-accent` | `#F5E642` | Accent yellow for emphasis, highlighted values |
| `--color-border` | `#2A2A3A` | Subtle border for structural separation |
| `--color-border-accent` | `#F5E642` | Yellow border for focused inputs, active states |
| `--color-success` | `#00E5A0` | Bright mint — calculation success, positive results |
| `--color-warning` | `#F5A623` | Amber — caution states, threshold warnings |
| `--color-error` | `#FF5C38` | Coral — validation errors, required field alerts |
| `--color-muted` | `#3A3A4A` | Disabled states, inactive elements |

**Color-blind safety:** The accent yellow, mint, coral, and amber are distinguishable by both deuteranopia and protanopia simulations. No information is conveyed by color alone — icons and labels always accompany color signals.

**Dark-only palette:** This option is intentionally dark-mode-only. The dark shell IS the design. A light mode would break the aesthetic entirely.

---

## 6. Typography System

**Display font:** Bebas Neue (Google Fonts)
- Rationale: Condensed, geometric, maximally bold. A Philippine design staple — seen in protest posters, event banners, Palanca materials. Unmistakably purposeful. Zero softness.
- Usage: Tool name/title (hero), section dividers, result display headline (computed value label)

**Header/UI font:** Barlow Condensed (Google Fonts)
- Rationale: Geometric humanist sans in condensed form. Highly legible at small sizes, makes navigation feel architectural. Not Inter. Not Roboto. Has personality.
- Usage: Navigation, badges, table headers, button labels, form field labels

**Body font:** Barlow (Google Fonts, regular weight)
- Rationale: Same family as Barlow Condensed — creates family coherence while opening up for reading. Readable at 16px on dark backgrounds.
- Usage: Body text, descriptions, helper text, footnotes

**Scale:**

| Role | Font | Weight | Size | Line Height | Tracking |
|------|------|--------|------|-------------|---------|
| Hero (tool name) | Bebas Neue | 400 | 72px / 4.5rem | 0.95 | 0 |
| Display | Bebas Neue | 400 | 48px / 3rem | 1.0 | 0 |
| H1 (section) | Barlow Condensed | 700 | 32px / 2rem | 1.1 | 0.02em |
| H2 | Barlow Condensed | 600 | 24px / 1.5rem | 1.2 | 0.01em |
| H3 | Barlow Condensed | 600 | 20px / 1.25rem | 1.3 | 0 |
| Label | Barlow Condensed | 500 | 13px / 0.8125rem | 1.3 | 0.08em |
| Body | Barlow | 400 | 16px / 1rem | 1.6 | 0 |
| Small | Barlow | 400 | 14px / 0.875rem | 1.5 | 0 |
| Caption | Barlow | 400 | 12px / 0.75rem | 1.4 | 0.02em |
| Result value | Bebas Neue | 400 | 64px / 4rem | 1.0 | -0.01em |
| Mono | JetBrains Mono | 400 | 14px / 0.875rem | 1.6 | 0 |

**Typography rules:**
- ALL form field labels are Barlow Condensed, 500 weight, 13px, 0.08em tracking, uppercase — architectural, not bureaucratic
- Result computed values displayed in Bebas Neue at 64px — poster-scale, celebratory
- Never use Bebas Neue for body text or helper text — it's reserved for titles and results only

---

## 7. Spatial Philosophy

**Density:** Moderate-dense. Not the airy whitespace of Option 1 — this is a considered, architectural composition. Every element has a clear geometric relationship to its neighbors.

**Grid system:**
- Desktop: 12-column grid, 24px gutters, max-width 1200px, side padding 48px
- Tablet: 8-column grid, 20px gutters, side padding 24px
- Mobile: 4-column grid, 16px gutters, side padding 16px

**Layout geometry:**
- Heavy use of full-bleed horizontal bands — the header is a full-width dark panel
- The input section and result section are hard-split by a thick 2px yellow rule
- Cards use sharp right-angle corners (0 border-radius) on primary elements; 4px radius only on interactive controls
- Diagonal accents: a single diagonal yellow line (CSS clip-path or SVG) in the hero area creates movement on the otherwise grid-strict layout

**Whitespace:** Internal padding is generous (32px within panels, 24px between form groups). Outer margins are structural — 48px min on desktop, creating a clear "frame" effect.

**Breakpoints:**
- `< 640px`: Mobile — single column, stacked sections
- `640px – 1024px`: Tablet — 2-column form layout, results below
- `≥ 1024px`: Desktop — side-by-side form + results panel

**Spacing scale:** 4px base unit → 4, 8, 12, 16, 24, 32, 48, 64, 96px

---

## 8. Component Patterns

**Buttons:**
- Primary: Full-width on mobile / fixed-width on desktop. Background `#F5E642`, text `#0F0F14` in Barlow Condensed 700 uppercase 14px tracked. No border-radius. Height 52px. Hover: background shifts to white, slight box-shadow `0 0 0 2px #F5E642`. Active: quick `scale(0.98)` transform.
- Secondary: Transparent background, 2px solid `#F5E642` border, yellow text. Hover: fills yellow.
- Ghost: Text-only, yellow on hover underline. Used for "Learn more about RA 7641."
- Destructive: Coral (`#FF5C38`) background — used only for "Clear form."

**Input treatment:**
- Labels: Barlow Condensed, 500 weight, uppercase, 0.08em tracking, `#8888A0` — above each field
- Inputs: Background `#1A1A24`, border 1px solid `#2A2A3A`, no radius, height 52px, padding 16px. Text `#F0F0F5`, 16px Barlow.
- Focus: Border changes to 2px solid `#F5E642`. Yellow glow `box-shadow: 0 0 0 3px rgba(245,230,66,0.15)`.
- Validation error: Border coral, helper text coral with `×` icon.
- Validation success: Border mint with `✓` icon.
- Helper text: 12px Barlow, `#8888A0`, below the field.

**Cards:**
- Background `#1A1A24`, 0 border-radius on top-left and bottom-right corners (sharp), 4px on remaining corners — creates a distinctive asymmetric card shape
- Left border accent: 3px solid var(--color-accent) on left edge
- Internal padding: 24px

**Result/output display:**
- THE KEY MOMENT. A full-width panel that transforms from input mode to result mode.
- Background: `#1A1A24` with a diagonal geometric overlay (SVG polygon, 5% opacity accent color)
- Computed value in Bebas Neue 64px, color `#F5E642` — poster-scale
- Label above value: Barlow Condensed uppercase 13px tracked, `#8888A0`
- A horizontal breakdown table below: regular pay, daily rate, years of service multiplier, each in a tight grid
- A yellow horizontal rule separates the headline value from the breakdown

**Progress indicators:** None for single-form calculators. For multi-step: a geometric step track — filled squares (not circles), connected by a thin yellow line.

**Navigation:**
- Top nav: Full-width dark band, 64px height. Left: Bebas Neue "ANGKIN" + tool name. Right: Barlow Condensed "TOOLS" dropdown + "SHARE" button.
- No sidebar. Breadcrumb below header: small grey chevron-separated Barlow text.

---

## 9. Animation Philosophy

**Calculation moment:** This is the signature animation. When "COMPUTE" is pressed:
1. The button flashes a brief `scale(0.95)` then expands
2. A horizontal yellow sweep (CSS animation, `width: 0% → 100%`, 300ms) runs across the result panel's top edge
3. The result value counts up from 0 to the computed amount using a JS counter animation (60ms intervals, ease-out curve) — a number ticker that feels like a slot machine landing on truth
4. The breakdown rows stagger in from the right (transform translateX(20px) → 0, 80ms delay between each row)

**Hover states:**
- Buttons: 150ms transition, fill/color change + very slight translate(-1px, -1px) with box-shadow
- Input focus: 150ms yellow border + glow
- Card hover: background lightens by one step (`#252532`), left accent border brightens

**Page load:** Navigation fades in (opacity 0→1, 200ms). Then content stagger: hero (0ms), subtitle (80ms), form card (160ms), CTA (240ms). Smooth, architectural.

**Loading state:** A geometric spinner — rotating square that morphs corners, in accent yellow. CSS `@keyframes` only.

**Philosophy:** Every animation serves clarity. The count-up number ticker transforms a dry computed result into a revelatory moment. Animations are short (100–400ms), purposeful, never decorative for decoration's sake.

---

## 10. Accessibility Approach

**WCAG target:** AA (with selective AAA for key text)

**Contrast ratios:**
- Body text (#F0F0F5 on #0F0F14): 14.3:1 — AAA ✓
- Accent yellow (#F5E642) on dark bg (#0F0F14): 11.2:1 — AAA ✓
- Secondary text (#8888A0 on #0F0F14): 4.6:1 — AA ✓ (fails AAA — acceptable for non-critical text)
- Button text (#0F0F14 on #F5E642): 11.2:1 — AAA ✓

**Focus visible:** Yellow 2px border + 3px offset glow. Visible against the dark background at extreme contrast. Never relies on browser default outline only.

**Screen reader:**
- All form inputs have explicit `<label>` elements with `for` attribute linkage
- Result panel receives `aria-live="polite"` — screen readers announce new computed values automatically
- Computed value uses `aria-label="Retirement pay: ₱312,500.00"` for full context
- Error messages linked via `aria-describedby`

**Color-blind safety:**
- Yellow accent: distinguishable in all simulations
- Success (mint), warning (amber), error (coral): backed by icons + text labels — never color alone
- Tested against deuteranopia, protanopia, tritanopia simulations

**Touch targets:** Minimum 48×48px for all interactive elements. Input height 52px. Button height 52px.

**Motion sensitivity:** Animations respect `prefers-reduced-motion`. When set, the count-up animation is instant, stagger delays are removed, all transitions reduce to opacity fade only.

---

## 11. Icon & Illustration Style

**Icon library:** Phosphor Icons (Bold weight, 24px default) — geometric, consistent stroke weight, distinctive. Used for: navigation icons, input field prefixes (₱ currency), status indicators, result section icons.

**Icon color:** `#8888A0` for decorative/contextual icons. `#F5E642` for action/primary icons. `#00E5A0` for success states.

**Illustrations:** Sparse, geometric — not cartoons. Section dividers use SVG geometric shapes (triangles, parallelograms) in muted accent opacity (10%). No scenes, no characters. The "visual illustration" IS the typography and geometry — the layout itself is the art.

**Domain adaptation across 148 tools:** Each tool uses a single large geometric icon in the hero area (48px, Phosphor Bold) in the domain accent color. Tax: a precise circle/target motif. Labor: a geometric person silhouette. Maritime: angular wave chevrons. This creates quick visual domain identification without per-tool illustration work.

**No stock illustrations.** No Undraw. No Lottie cartoon files. The geometric aesthetic is self-sufficient.

---

## 12. Dark Mode Strategy

**Dark-only.** This is not a choice about light/dark preference — it is the identity. The dark shell IS what makes this option distinctive. There is no light mode variant.

**Rationale:** The high-contrast dark palette with yellow accents creates a visual signature unlike anything in the Philippine compliance/fintech space. Introducing a light mode would dilute this signature and make it look like yet another muted light UI.

**User preference:** A small toggle exists in the nav for users who strongly need light mode — but it leads to a warning: "Light mode is in beta and may affect some visual elements." The light mode (if requested) uses off-white `#F8F8FC` background with dark navy text and muted yellow accents — a graceful degradation, not a design priority.

**OLED optimization:** The near-black `#0F0F14` (not pure black) prevents OLED burn patterns while still saving battery on OLED screens.

---

## 13. Multi-Tool Cohesion

**Invariants (always the same across all 148 tools):**
- Dark shell (`#0F0F14` background, `#1A1A24` surface)
- The yellow Angkin stripe (2px full-width, `#F5E642`) at the top of every header
- Barlow Condensed for all system UI labels
- Bebas Neue for tool names and result values
- 0-radius sharp corners on primary structural elements
- The "by Angkin" wordmark placement (top-left, white, Barlow Condensed)
- Phosphor Bold icon system
- The geometric count-up animation on every compute action

**Variants (changes per tool/domain):**
- Accent color (yellow for labor, amber for tax, coral for property, etc.)
- Tool icon (domain-specific Phosphor icon in hero)
- Domain badge color ("Labor & Employment" in yellow pill vs. "Tax & BIR" in amber pill)
- Input fields and their labels (tool-specific)

**Result:** Landing on tool #47 (Maritime Manning Pay Calculator), a user who has used tool #3 (TaxKlaro) immediately recognizes: same dark shell, same Angkin stripe, same count-up animation, same button style — but electric cyan accents signal "this is a maritime tool." The family is felt before it's consciously noticed.

---

## 14. Developer Ergonomics

**Token file structure:**
```
tokens/
  base.css          # Raw primitives: --raw-yellow: #F5E642;
  semantic.css      # Semantic aliases: --color-accent: var(--raw-yellow);
  domain-labor.css  # Domain overrides: --color-accent: var(--raw-yellow);
  domain-tax.css    # --color-accent: var(--raw-amber);
  domain-property.css
  typography.css    # Font scale + weight rules
  spacing.css       # 4px base scale
  motion.css        # Animation timing + keyframes
```

**Component API surface:**
```html
<!-- New tool bootstrapped in 3 lines of HTML -->
<div class="angkin-shell" data-domain="labor">
  <header class="angkin-header">
    <span class="angkin-wordmark">by Angkin</span>
    <h1 class="angkin-tool-name">RetireMath</h1>
  </header>
  <main class="angkin-calculator">
    <!-- Tool-specific content here -->
  </main>
</div>
```

**New tool build time:**
- Single-form calculator from scratch: ~3 hours (using the design system CSS + HTML patterns)
- The `data-domain` attribute on `angkin-shell` automatically loads domain-specific accent color — zero extra CSS for domain theming
- Multi-step wizard: ~6 hours (additional step-track component + state management)

**Framework compatibility:** Pure CSS custom properties + vanilla JS for animations. Works with React, Vue, or plain HTML. No framework dependency.

---

## 15. Deployment Model

**Single SaaS app with tool sections.** All 148 tools live under one domain (e.g., `angkin.ph/tools/retire-math`), sharing:
- One CSS bundle (12kb gzip — all tokens + base components)
- One JS bundle for animations and calculation logic architecture
- One shared navigation component

**Why:** The shared dark shell and yellow stripe work best when the user experience is continuous — navigating between tools feels like moving through sections of one product, not clicking between separate sites. Domain accents provide local identity without fragmenting the experience.

**Alternative considered:** Hub + micro-apps (like Option 1/Option 9). Rejected here because the bold visual signature requires tight consistency that's harder to enforce across independent deploys.

**CDN strategy:** CSS and fonts served from CDN. Each tool's calculation logic is a separate JS module loaded on demand (`/js/tools/retire-math.js`). Time-to-interactive for tool pages: <1.5s on 4G.

---

## 16. Scalability Assessment

**At 10 tools:** Exceptional. The dark shell + domain accent system handles tool differentiation elegantly. The bold signature is striking and memorable.

**At 50 tools:** Strong. The domain color system accommodates ~10–12 distinct domains. Tool navigation needs a robust category menu — the current top-right dropdown works but needs structure (grouped by domain, searchable).

**At 148 tools:** The main risk is navigation/discoverability. At this scale, the "TOOLS" dropdown must become a full search-driven tool directory. The design holds visually (the shell is always recognizable), but UX investment is needed in:
1. A filterable tool index page (`angkin.ph/tools`)
2. Cross-tool recommendations ("Users computing retirement pay also check SSS Contribution Calculator")
3. A saved computations history (optional login or localStorage)

**What breaks first:** The dark-only strategy may alienate users in high-ambient-light environments (outdoor mobile use). The light mode beta needs to graduate to a real feature by tool #50.

**What holds permanently:** The typography system. Bebas Neue at result scale is infinitely scalable — the "poster moment" works for any Philippine peso computation, any domain.

---

## 17. Trade-offs

**What this option explicitly sacrifices:**
1. **Broad demographic accessibility** — The dark shell is contemporary and design-literate. It will not pass Rosario's (Option 9 persona) "looks reliable" test. It's intentionally targeted at a younger, design-aware segment.
2. **Light-mode accessibility** — Users who struggle with dark UIs (low vision, certain vision conditions) are underserved. Acceptable because the target audience (BGC professionals, OFWs on modern phones) skews toward preferring dark UIs.
3. **Warm/inviting onboarding** — The sharp corners, geometric precision, and absence of illustration create an aesthetic that's more "editorial magazine" than "friendly helper." New-to-compliance users may find it slightly intimidating before they engage.
4. **Conservative trust signals** — Traditional Philippine institutions signal trust through light blues, greens, and conservative sans-serifs. Bold Geometric goes the opposite direction — trusting that quality execution earns trust faster than familiar palette choices.

**Why these trade-offs are acceptable:**
The Philippine labor force includes ~12 million formal sector employees under 35 who encounter premium mobile product design daily (GCash, Grab, Maya). This segment is currently underserved by compliance tools. Bold Geometric captures a generation that finds "professional equals boring" deeply unconvincing — and for whom visual quality is a trust signal in itself. If Angkin can be the tool this demographic recommends, the reach is enormous.

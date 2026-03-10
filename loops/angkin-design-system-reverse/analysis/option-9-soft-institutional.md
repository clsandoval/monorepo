# Option 9: Soft Institutional

**Slug:** `soft-institutional`
**Aspect:** 21 (Wave 2, Option 9)

---

## 1. Design Philosophy

This design believes that trust is not claimed — it is earned through every visual decision. Where government portals telegraph authority through bureaucratic stiffness, Soft Institutional radiates *credibility with care*: the quiet confidence of a well-resourced legal aid clinic, a respected university extension office, or the BSP website if it had a thoughtful designer. Compliance is serious work; the interface honors that seriousness without becoming cold.

---

## 2. Persona Narrative

**Rosario, 58, retired school administrator in Cagayan de Oro.** She spent 32 years in the Department of Education and is now advising her daughter's small recruitment agency on HR compliance. She uses a Samsung Galaxy Tab A on a home WiFi connection, typing carefully with two index fingers. She distrusts flashy apps ("parang scam yan"), but she also doesn't trust bare government portals ("hindi updated"). She wants something that looks like it was made by *professionals who know what they're doing* — not a startup, not a government office. She searches for "retirement pay computation Philippines" on Google and lands on Angkin. The design needs to pass her first-impression test in 3 seconds: does this look reliable?

**Device:** Samsung Galaxy Tab A (10.4"), Chrome. Also accessible on desktop via her daughter's MacBook.
**Emotional state:** Cautiously optimistic. High standards for credibility signals. Values precision and completeness over speed.
**Goal:** An accurate computation she can cite in a memo or bring to an HR consultant. She'll read every label and footnote.

---

## 3. Competitive DNA

Inspired by **gov.uk's** content-first clarity + **Wise's** understated trustworthiness + the visual refinement of **Stripe's** documentation site, differentiated by warmth: soft textures, editorial serif typography, and a color palette derived from Philippine natural materials (aged manila paper, coastal teal, weathered wood amber) rather than corporate blue. Where Option 2 (Gov.uk Radical Clarity) removes all decoration for brutal utility, Soft Institutional applies tasteful decoration in service of trust — a thin rule here, a pull quote there, a refined badge rather than nothing.

The key differentiation from Option 1 (Trust Minimalism) is density and materiality: Soft Institutional has *more* on the page but curated carefully — it signals "we've thought of everything" rather than "we removed everything."

---

## 4. Brand Expression

**"by Angkin"** appears as a refined wordmark in the top navigation, set in Cormorant Garamond at 13px with generous letter-spacing — like a publisher's colophon. The tool name ("RetireMath") is the primary identity in the header, larger and bolder, with a subtle category pill ("Labor & Employment") beneath it.

The Angkin suite identity is expressed through:
- A consistent thin horizontal rule under the site header in the primary teal (`#2E6D80`)
- The "by Angkin" wordmark always at top-right in every tool
- A suite navigation footer linking to tool categories: "Tax Tools," "Labor Tools," "Property Tools," etc.
- A consistent cream-white background (`#F8F6F1`) — instantly recognizable as "the Angkin look" across all 148 tools

Per-tool variation: the accent band at the top of each tool changes color by domain (teal for labor/employment, slate-amber for tax, soft terracotta for property, deep forest for environmental). The typography, spacing, and layout are invariant.

---

## 5. Color System

| Token | Hex | Semantic Rationale |
|-------|-----|-------------------|
| `--color-primary` | `#2E6D80` | Deep coastal teal — calm authority, the Visayas Sea, Philippine professional identity |
| `--color-primary-dark` | `#1D4F5E` | Pressed states, active nav, header rule |
| `--color-primary-light` | `#D4EAF0` | Tinted input backgrounds, focus rings |
| `--color-secondary` | `#4A7C6F` | Sage green — Philippine foliage, growth, sustainability |
| `--color-secondary-light` | `#D6EBE5` | Secondary surface tints |
| `--color-accent` | `#C4822A` | Warm amber — aged wood, kamagong, decisive action |
| `--color-accent-light` | `#F5E5CC` | Accent backgrounds |
| `--color-success` | `#2D7A5F` | Deep forest green — confirmed, correct |
| `--color-success-light` | `#D4EDE4` | Success states, result backgrounds |
| `--color-warning` | `#B5760F` | Warm ochre — caution, review needed |
| `--color-warning-light` | `#F7EACC` | Warning backgrounds |
| `--color-error` | `#A03030` | Deep red — error, but not alarming |
| `--color-error-light` | `#F5DADA` | Error backgrounds |
| `--color-text-primary` | `#1A2E35` | Near-black with blue undertone — refined, not harsh |
| `--color-text-secondary` | `#4A6470` | Body text, descriptions |
| `--color-text-muted` | `#7A9099` | Captions, footnotes, helper text |
| `--color-bg` | `#F8F6F1` | Warm cream — aged paper, not clinical white |
| `--color-surface` | `#FFFFFF` | Cards, inputs, modals |
| `--color-surface-raised` | `#F2EFE8` | Slightly darker surface for sidebars, context panels |
| `--color-border` | `#C8D4D9` | Subtle blue-grey borders |
| `--color-border-light` | `#E4EBEE` | Hairline dividers |

**Domain palette adaptation:**
- Labor/Employment tools: `--color-primary` = `#2E6D80` (coastal teal)
- Tax tools: `--color-primary` = `#5C6B2E` (olive — evoking BIR document green, modernized)
- Property tools: `--color-primary` = `#7A4030` (terracotta — land, clay, rooted)
- Maritime/Transport tools: `--color-primary` = `#2E4A7A` (deep navy)
- Environmental tools: `--color-primary` = `#2D5C45` (forest)

---

## 6. Typography System

**Display font:** [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) — A refined revival of the 16th-century Garamond typeface with exceptional elegance and a slight Art Nouveau quality. Communicates: *established, credible, thoughtful, not corporate*. Its high contrast and refined serifs distinguish it immediately from government and tech aesthetics.

**Body font:** [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) — Designed by the Braille Institute specifically for accessibility and legibility at small sizes. Each letterform is disambiguated (1/l/I, 0/O are clearly distinct). Communicates: *we care about every reader, including those with visual impairments*. Unusual enough to be distinctive, useful enough to be functional.

**Type Scale:**

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|---------------|
| Hero | Cormorant Garamond | 48px / 3rem | 600 (SemiBold) | 1.15 | -0.02em |
| H1 | Cormorant Garamond | 36px / 2.25rem | 600 | 1.2 | -0.015em |
| H2 | Cormorant Garamond | 28px / 1.75rem | 500 | 1.25 | -0.01em |
| H3 | Atkinson Hyperlegible | 20px / 1.25rem | 700 | 1.3 | 0 |
| H4 | Atkinson Hyperlegible | 16px / 1rem | 700 | 1.4 | 0.01em |
| Body | Atkinson Hyperlegible | 16px / 1rem | 400 | 1.65 | 0 |
| Body Small | Atkinson Hyperlegible | 14px / 0.875rem | 400 | 1.6 | 0 |
| Caption | Atkinson Hyperlegible | 12px / 0.75rem | 400 | 1.5 | 0.02em |
| Label | Atkinson Hyperlegible | 13px / 0.8125rem | 700 | 1 | 0.05em uppercase |
| Button | Atkinson Hyperlegible | 15px / 0.9375rem | 700 | 1 | 0.03em |

**Typography rationale:** Cormorant Garamond for display headings signals expertise and institutional permanence — the same visual register as legal briefs, university publications, official reports. Atkinson Hyperlegible for body and UI text ensures maximum readability for users like Rosario (older eyes, tablet screen, careful readers). The contrast between the elegant serif and the hyper-readable sans creates a visual hierarchy that is both trustworthy and functional. This pairing is completely distinct from all previous options.

---

## 7. Spatial Philosophy

**Density level:** Moderate-dense. Soft Institutional packs more information than Options 1 and 2, but with careful hierarchy — scannable at a glance, complete on closer reading.

**Whitespace strategy:** Margin-heavy vertically (generous section spacing), tight horizontally within components (label and input close together, reducing eye movement). Background texture (subtle noise/grain on cream background) provides visual warmth without visual clutter.

**Grid system:**
- Max content width: 900px (narrower than typical — focuses attention, editorial feel)
- Desktop: 12-column grid, 24px gutters
- Tablet: 8-column, 20px gutters
- Mobile: 4-column, 16px gutters
- Container padding: 48px desktop, 32px tablet, 20px mobile

**Responsive breakpoints:**
- `xs`: <480px (mobile portrait)
- `sm`: 480-767px (mobile landscape / small tablet)
- `md`: 768-1023px (tablet)
- `lg`: 1024-1279px (small desktop)
- `xl`: 1280px+ (desktop)

**Layout at desktop:** Two-column split — left column (65%) for calculator inputs, right column (35%) for context/results. At tablet/mobile: single column, results panel stacks below inputs.

**Spacing scale (8px base):**
`4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px / 96px`

---

## 8. Component Patterns

**Buttons:**
- **Primary:** Solid amber (`#C4822A`), Atkinson Hyperlegible 15px Bold, all-caps with 0.05em letter spacing, 48px height, 24px horizontal padding, 4px border radius. Hover: darken 8%. Focus: 3px amber offset ring.
- **Secondary:** Outlined in primary teal, teal text, same sizing. Hover: teal fill at 8% opacity.
- **Ghost:** No border, teal text, underline on hover.
- **Destructive:** Red text, ghost style, no fill.

**Input treatment:**
- Label: ALL CAPS, 11px, 0.08em letter-spacing, `--color-text-secondary`, 8px margin below
- Input: Full-width, 48px height (accessible touch), 1px border `--color-border`, 4px radius, white background, 16px padding horizontal
- Focus: border color `--color-primary`, background `--color-primary-light`, no outline (focus-visible via custom ring)
- Validation error: red-tinted border, error icon + message below in `--color-error`
- Helper text: 13px muted, beneath input, left-aligned
- Prefix/suffix (₱ symbol): inline within input, colored `--color-text-muted`

**Cards:**
- 1px border `--color-border`, 6px radius, white background, 24px padding
- Hover: box-shadow `0 4px 16px rgba(46, 109, 128, 0.12)`
- Section card: cream background `--color-surface-raised`, no border, 6px radius

**Result/output display:**
- Primary result: full-width success card with `--color-success-light` background
- Left-border accent in `--color-success` (4px thick)
- Result amount: Cormorant Garamond 48px Bold, teal color — the most dramatic typography moment in the tool
- Breakdown table: clean lines, alternating row colors, right-aligned amounts
- Legal basis footnote: italic serif, smaller, `--color-text-muted`, with citation link

**Progress indicators:**
- Step indicator: numbered steps with thin connector lines, active step in teal, completed in green checkmark
- Loading: subtle horizontal bar in teal at top of card (not spinner — less anxiety-inducing)

**Navigation:**
- Top bar: cream background, "by Angkin" wordmark right-aligned, tool name left
- Thin 2px accent rule beneath header in `--color-primary`
- Breadcrumb navigation: small, serif, muted, shows "Angkin > Labor Tools > RetireMath"

---

## 9. Animation Philosophy

**Micro-interactions:**
- Button hover: 150ms ease-out color transition + 1px translateY lift
- Input focus: 200ms border color + background tint transition
- Card hover: 200ms box-shadow elevation

**Page transitions:** No full-page transitions — the interface feels like a document, not an app. Sections fade in on scroll (CSS `@keyframes fadeInUp`, 300ms, 20px rise).

**Loading states:** A thin animated gradient bar at the top of the main card (Progress bar style, CSS-only). No spinning loaders — they suggest uncertainty. The linear bar suggests progress toward a known end.

**Calculation moment:**
The result card begins invisible (`opacity: 0, transform: translateY(16px)`). On compute:
1. "Computing..." text appears in the result area (200ms fade-in)
2. 600ms pause (simulated calculation time — makes the result feel earned)
3. Result card slides up and fades in (`translateY(16px → 0px)`, 400ms cubic-bezier(0.16, 1, 0.3, 1))
4. The result amount counter-animates from 0 to final value (800ms, JS-driven, ease-out)

**Celebration/result reveal:** Subtle — no confetti. A soft green glow on the result card border (box-shadow pulse, 2 cycles, 1.5s total) signals "done correctly." The number animation is the delight moment — watching ₱84,000 count up is satisfying without being childish.

**CSS-only vs library:** CSS-only for transitions/animations. Vanilla JS for the number counter. No animation library dependencies.

---

## 10. Accessibility Approach

**WCAG target:** AA (Level 2.1) with AAA on critical paths (result display, error messages, form labels).

**Contrast ratios:**
- Primary text on cream bg (`#1A2E35` on `#F8F6F1`): 12.8:1 ✓ AAA
- Secondary text on white (`#4A6470` on `#FFFFFF`): 6.2:1 ✓ AA
- Amber button text (white on `#C4822A`): 3.1:1 ✓ AA (large text OK); upgrade to darker `#9A5A10` for small text
- Teal links on cream: 5.8:1 ✓ AA
- Result amount (teal on success-light): 4.9:1 ✓ AA

**Focus visible strategy:** Custom focus ring using `outline: 3px solid --color-primary` with `outline-offset: 3px`, suppressed on mouse click via `:focus-not-visible`. Never removes focus outline from keyboard users.

**Screen reader considerations:**
- All form inputs have explicit `<label for="">` associations
- `aria-describedby` for helper text and error messages
- Result section has `role="status" aria-live="polite"` — announces result to screen readers
- Section headers use proper `h1`-`h4` hierarchy
- Tables use `<th scope="col">` for result breakdown
- Legal footnotes are `<aside aria-label="Legal basis">`

**Color-blind safe palette:** Primary teal (#2E6D80) and success green (#2D7A5F) have sufficient luminance difference even for deuteranopia. Warning amber (#B5760F) relies on hue distinction — paired with icon (⚠) to avoid color-only signaling. Error red paired with icon (✗) same reason.

**Touch target sizes:** Minimum 48×48px for all interactive elements. Input height 48px. Button height 48px minimum. Tab/radio/checkbox targets padded to 44px minimum.

---

## 11. Icon & Illustration Style

**Icons:** [Phosphor Icons](https://phosphoricons.com/) in **Regular** weight (1.5px stroke) — elegant, not heavy. Not Lucide (too commonly used in previous options). Phosphor's Regular weight pairs well with the serif typography — both have a classic, measured quality.

**Usage rules:**
- Icons always 20×20px in body context, 16×16px in captions
- Color: `--color-text-secondary` for informational, `--color-primary` for interactive
- No filled icons except in active/selected states (fill = selected, regular = default)
- Icon + label always paired — no icon-only buttons except at breakpoints <375px with tooltips

**Illustration approach:** Spot illustrations only — used sparingly (empty state, success state). Style: line-drawn on cream paper background, topographic/cartographic feel referencing Philippine geography (islands, coastlines). A soft-wash watercolor effect in secondary green for the success state illustration. Not photographic, not flat vector, not 3D — hand-drawn quality that matches the serif typography warmth. Third-party: [unDraw](https://undraw.co/) as base, recolored to match palette.

**Adaptation across 148 tools:** Each tool domain has a set of 5-8 Phosphor icons. No custom icon design needed — the library covers all compliance domains. Consistency comes from always using Regular weight and consistent sizing, not from custom illustration.

---

## 12. Dark Mode Strategy

**Yes — toggle-based, not automatic.**

Soft Institutional specifically needs a dark mode because the cream-paper aesthetic (which builds trust with Rosario) can feel eye-straining in low-light environments. But automatic dark mode would remove the intentional warmth of the cream background as default.

**Implementation:** Toggle in header (moon/sun icon), `data-theme="dark"` on `<html>`, CSS custom property swap.

**Dark palette:**
| Token | Dark value |
|-------|-----------|
| `--color-bg` | `#0F1E24` | Near-black with teal undertone |
| `--color-surface` | `#162A32` | Deep blue-grey |
| `--color-surface-raised` | `#1D3540` | Elevated surface |
| `--color-text-primary` | `#E8F2F5` | Warm white |
| `--color-text-secondary` | `#9BBBC6` | Muted teal-grey |
| `--color-primary` | `#5BA8BF` | Lighter teal (maintains contrast) |
| `--color-accent` | `#E09C42` | Brighter amber |
| `--color-border` | `#2D4A55` | Dark borders |

**Personality shift in dark mode:** The design becomes more serious — Cormorant Garamond on dark backgrounds reads like a legal brief at midnight. This is appropriate: a user computing retirement pay at 11pm before a termination meeting the next morning. The amber accent becomes the dominant visual element (compare: candlelight on dark wood). The warmth remains but the register shifts from "sunny clinic" to "trusted late-night advisor."

---

## 13. Multi-Tool Cohesion

**Invariant across all 148 tools:**
1. `--color-bg: #F8F6F1` (cream paper background) — this IS the Angkin look
2. Cormorant Garamond for all H1/H2 display headings
3. Atkinson Hyperlegible for all body/UI text
4. "by Angkin" wordmark in top-right, always same size and position
5. 2px accent rule beneath header in current-domain primary color
6. Thin amber CTA button (same color, same radius, same letter-spacing across all tools)
7. Footnote/legal-basis section at bottom of every tool (same serif italic style)
8. Suite footer with category navigation

**Variant per tool:**
1. `--color-primary` (domain color — teal for labor, olive for tax, etc.)
2. Tool name (H1, prominent)
3. Category pill beneath tool name
4. Domain spot illustration (empty/success state)
5. Specific input fields and result breakdowns

**User recognition test:** A user who has used TaxKlaro by Angkin and then discovers RetireMath by Angkin will immediately recognize: same cream paper, same serif heading style, same amber button, same layout. The category pill and color accent tell them "different domain, same trusted family."

---

## 14. Developer Ergonomics

**New tool setup:**
```
angkin/
├── packages/
│   └── core/              # Shared: tokens, base components, layouts
│       ├── tokens.css     # All CSS custom properties
│       ├── typography.css # Font-face imports + scale classes
│       ├── components/    # Button, Input, Card, ResultCard, etc.
│       └── layouts/       # ToolShell (header + footer + main)
└── apps/
    └── new-tool/
        ├── index.html     # Uses ToolShell, imports core
        ├── calculator.js  # Tool-specific logic only
        └── theme.css      # --color-primary override for domain
```

**Component API (React example):**
```jsx
<ToolShell tool="RetireMath" domain="labor" byline="by Angkin">
  <Calculator>
    <Input name="basicPay" label="Basic Monthly Pay" prefix="₱" type="currency" />
    <Input name="yearsOfService" label="Years of Service" type="number" />
    <ComputeButton />
    <ResultCard title="Estimated Retirement Pay" />
  </Calculator>
</ToolShell>
```

**Estimated time to build a new single-form calculator:** 2–3 hours. Token file and layout shell are pre-built. Developer writes: input definitions (30 min), calculation logic (60 min), result display (30 min), domain color override (5 min).

**Tailwind compatibility:** CSS custom properties layer on top of Tailwind. A `tailwind.config.js` preset maps all tokens to Tailwind utility classes (`bg-surface`, `text-primary`, `border-border`).

---

## 15. Deployment Model

**Hub + micro-apps.** A central landing page (`angkin.ph`) organizes tools by category. Each tool is a standalone HTML/JS bundle (~50KB) served from `angkin.ph/tools/retire-math/`. No app router — each tool is a complete page.

**Distribution:** The `@angkin/core` package is published as a private NPM package. Tools import it as a build dependency. The CSS is inlined at build time — no CDN dependency for the design system itself.

**Google Fonts:** Loaded via CDN in the `<head>` of every tool. Fallback: Georgia (Cormorant) + Helvetica Neue (Atkinson) — acceptable degradation. Font subsets limited to latin + latin-ext for Philippine names.

---

## 16. Scalability Assessment

**At 10 tools:** Excellent. Token system handles domain color variation trivially. ToolShell component means every new tool gets header/footer for free.

**At 50 tools:** Good. Category navigation in footer may need to become a dropdown or megamenu. The suite footer component needs to scale. The spot illustration library may need 30-40 illustrations across domains.

**At 148 tools:** The primary scaling challenge is **tool discovery** — the hub page cannot show 148 tools in a flat list. The design system needs a robust category/search taxonomy (built separately from the visual design). The visual system itself scales fine.

**What breaks first:** The Cormorant Garamond font adds ~80KB per page load (WOFF2 + WOFF). At 148 tool pages, this is fine (each user only loads one tool), but if the hub page displays tool previews in iframes, this multiplies. Mitigation: font preloading strategy, shared font cache via service worker.

**Developer bottleneck:** At 148 tools, onboarding new developers to the token system is the bottleneck. Mitigation: comprehensive Storybook documentation for the component library.

---

## 17. Trade-offs

**What this option explicitly sacrifices:**

1. **Speed of first impression** — Cormorant Garamond requires a web font load. On a slow connection, there's a 200-400ms FOUT (Flash of Unstyled Text) before the serif loads. Mitigation: `font-display: swap` + a serif system fallback. Acceptable trade-off: the font is THE personality. Without it, the design loses its entire differentiation.

2. **Youth/energy** — The editorial serif aesthetic reads as "serious" and "established." Young users (Renz from Option 8) will not be excited by this. Explicitly not targeting 18-25 mobile-first users. That audience is served by Option 8.

3. **Extreme minimalism** — Rosario wants to feel informed, which means the design carries more information density than Options 1 or 2. A user who is overwhelmed by information density should use Option 1. This design believes more-but-curated serves Rosario better than less-everything.

4. **Custom illustration budget** — The spot illustration approach requires design effort (or careful unDraw customization) for each domain. At 148 tools, this is a real cost. Mitigation: illustrations are limited to empty state and success state, not every screen. Most tools will launch without custom illustration.

5. **Bold visual memorability** — Soft Institutional is distinctive but not "screenshot-worthy" for social media. It's the design that builds lasting trust, not one-time viral sharing. That trade-off is intentional: Rosario doesn't share app screenshots to Facebook; she relies on word-of-mouth among HR professionals.

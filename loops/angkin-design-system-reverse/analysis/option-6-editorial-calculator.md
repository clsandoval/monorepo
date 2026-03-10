# Option 6: Editorial Calculator

**Aspect 18 of 27 — Wave 2: Design Options**
**Status:** Complete
*Produced: 2026-03-10*

---

## 1. Design Philosophy

This design believes that compliance tools are most powerful when they also *educate*. The calculator is not the page — the article is the page, and the calculator lives within it. When a user arrives via Google search for "retirement pay Philippines RA 7641," they deserve to understand the law, not just compute it. Knowledge and computation are inseparable: you read, you understand, you calculate, you act.

The editorial treatment communicates depth and credibility. Long-form content signals "we have done the research, so you don't have to." The calculator emerges organically from the explanation, embedded mid-article the way a financial table appears in The Economist. This is compliance as journalism — authoritative, clear, and genuinely useful.

---

## 2. Persona Narrative

**Rodrigo "Rodel" Bautista, 52, warehouse supervisor in Laguna.**

Rodel has been with the same logistics company for 19 years. He's heard his company is merging and some employees will be retrenched. His HR colleague mentioned something about "retirement pay" versus "separation pay" but Rodel doesn't understand the difference. He searched Google at 10 PM on his Samsung Galaxy A33, lying in bed with reading glasses.

He typed: *"retirement pay Philippines mandatory how much"* and found an Angkin article in position 3 of Google results. He almost closed it when he saw "article" — but the headline pulled him in: **"19 Years of Service: Here's Exactly What the Law Guarantees You."** He began reading, leaning in. Three paragraphs later, he encountered the calculator, already pre-configured for "19+ years." He entered his salary. He saw the number. He took a screenshot and sent it to his wife on Messenger: "tanda mo 'to."

Rodel's emotional journey: confused → curious → engaged → informed → empowered. The editorial format is what moved him from the first state to the last.

---

## 3. Competitive DNA

**Inspired by:** The Economist (authoritative long-form with embedded data) + The New York Times "Upshot" section (journalism + calculators) + Philippine legal commentary sites (Respicio & Co., LaborLaw.ph).

**Differentiated by:** No one in the Philippine compliance space combines serious editorial content with interactive computation. BIR.gov.ph and SSS.gov.ph are utility-only, information-starved. LegalZoom-style sites have content but no tools. Angkin Editorial is the first to fuse both — and the fusion is the differentiator, not either half alone.

**Anti-references:** SmartAsset (editorial + calculator but ad-laden, cold, generic); generic law blogs (walls of text, no interaction); government portals (no explanation, just forms).

---

## 4. Brand Expression

The "by Angkin" badge appears as a small but authoritative publisher mark — like "Published by The Atlantic" in small caps beneath the headline. It reads: **ANGKIN · Philippine Compliance Tools** in editorial small-caps. The brand is the publisher of knowledge, not a software company.

Each tool page carries a consistent masthead: the Angkin wordmark in Cormorant Garamond italic at upper left, a horizontal rule, and a breadcrumb taxonomy: `Labor Law → Retirement → RA 7641`. The masthead is identical across all 148 tools — it's the newspaper's flag, not a logo per se.

Suite cohesion is achieved through the masthead, the editorial color palette (cream + deep red + dark navy), and the article structure: all tools follow the same long-form format (Headline → Context → Law Box → Calculator → What To Do Next). A user who read the Retirement Pay article will immediately recognize the SSS Pension calculator article because the *frame* is the same, even if the content differs entirely.

The "by Angkin" line in the byline reads: *"Calculator and analysis by Angkin."* It positions Angkin as the author-expert, not a widget provider.

---

## 5. Color System

**Philosophy:** Warm cream parchment base evokes print editorial heritage. Deep editorial red is the accent — used sparingly like a magazine's primary color. Navy anchors authority. All colors are warm-shifted, never cold.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#FAF7F0` | Page background — warm cream/parchment |
| `--color-surface` | `#FFFFFF` | Article card, calculator surfaces |
| `--color-text-primary` | `#1A1208` | Body copy — near-black, warm undertone |
| `--color-text-secondary` | `#5C5040` | Captions, metadata, secondary labels |
| `--color-text-muted` | `#9A8E7C` | Byline details, footnotes, helper text |
| `--color-accent-red` | `#C4302B` | Primary accent — editorial red, pull quotes, CTA |
| `--color-accent-navy` | `#1C3557` | Secondary accent — law boxes, headings, links |
| `--color-accent-gold` | `#B8860B` | Law citation markers, article taxonomy |
| `--color-success` | `#2D6A4F` | Positive result states ("You are eligible") |
| `--color-warning` | `#7B4F12` | Edge cases, "check with HR" |
| `--color-error` | `#8B1A1A` | Validation errors — deep editorial red variant |
| `--color-border` | `#DDD5C8` | Subtle ruled lines, section dividers |
| `--color-rule` | `#C4302B` | Decorative rules, section accents |
| `--color-input-bg` | `#F5F0E8` | Calculator input fields |

**Domain color adaptation:**
- Tax tools: accent-red stays, add `--color-domain: #2C5F2E` (forest green for IRS-association)
- Labor/Employment tools: `--color-domain: #1C3557` (navy — dignity, workers' rights)
- Property/Real estate: `--color-domain: #5C3D2E` (earthy brown — land)
- Maritime/OFW: `--color-domain: #003F5C` (ocean blue)
- Business registration: `--color-domain: #3D3D3D` (corporate gray)

The domain color is applied only to the breadcrumb taxonomy and the law box header — everything else stays in the base palette.

---

## 6. Typography System

**Display font:** Cormorant Garamond — an exquisite, high-contrast serif with roots in French Renaissance typography. Used for headlines, pull quotes, and the calculator result reveal. It communicates: *scholarship, depth, gravitas, the written law itself.* Available on Google Fonts.

**Body font:** Source Serif 4 — Google's refined take on the Century Schoolbook tradition. Exceptional readability for long-form reading at 16-20px. Warm and humanist without being informal. Available on Google Fonts.

**UI sans font:** Libre Franklin — a faithful modernization of Franklin Gothic. Used for labels, buttons, input fields, and navigation. Neutral but not dull — it has personality at bold weights. Available on Google Fonts.

| Level | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| `--type-hero` | Cormorant Garamond | 56px / 3.5rem | 700 | 1.05 | Article headline (h1) |
| `--type-h2` | Cormorant Garamond | 36px / 2.25rem | 600 | 1.15 | Section headlines |
| `--type-h3` | Libre Franklin | 20px / 1.25rem | 600 | 1.3 | Calculator section title |
| `--type-h4` | Libre Franklin | 16px / 1rem | 700 | 1.3 | Input group labels |
| `--type-pullquote` | Cormorant Garamond | 28px / 1.75rem | 500 | 1.3 | Pull quotes — italic |
| `--type-body` | Source Serif 4 | 18px / 1.125rem | 400 | 1.75 | Article body text |
| `--type-caption` | Source Serif 4 | 14px / 0.875rem | 400 | 1.5 | Captions, footnotes |
| `--type-label` | Libre Franklin | 13px / 0.8125rem | 600 | 1.2 | ALL CAPS form labels |
| `--type-result-number` | Cormorant Garamond | 72px / 4.5rem | 700 | 1.0 | Computed result |
| `--type-small` | Libre Franklin | 12px / 0.75rem | 400 | 1.4 | Byline metadata |

**Weight rules:** Cormorant Garamond is only ever Regular (400), SemiBold (600), or Bold (700) — never lighter. Source Serif 4 is almost always Regular — emphasis uses italic, not weight. Libre Franklin uses Bold (700) for labels and buttons; Regular for supporting text.

**Drop cap treatment:** The first paragraph of every article gets a drop cap: the first letter rendered in Cormorant Garamond, 4 lines tall, in `--color-accent-red`. This signals editorial sophistication immediately.

**Why these fonts communicate Angkin's editorial vision:** Cormorant Garamond has the authority of legal documents — it's literally a typeface with French legal publishing heritage. Source Serif 4 says "this is designed to be read, not skimmed." Libre Franklin adds modern clarity to the functional UI layer. Together: a law professor's notes, digitized beautifully.

---

## 7. Spatial Philosophy

**Density level:** Airy. Editorial tools require breathing room — readers need to settle into the content. This is the least dense of all 10 options by intention: law is complex enough, the white space is psychological relief.

**Reading column:** Max-width 680px for article text, centered, generous margins at sides. This is the golden ratio of editorial typography — proven by The Economist, The Atlantic, and every major publication for decades. On 1280px viewport: 680px text column centered with 300px sidebar for the sticky calculator section.

**Grid:** 12-column, 24px gutters. At desktop: article in 7 columns (680px), calculator sticky sidebar in 4 columns (380px), 1 column gutter. At tablet: full-width article, calculator collapses to inline. At mobile: single column.

**Max-width:** 1140px container, centered.

**Responsive breakpoints:**
- `1280px+`: Two-column (article + sticky calculator sidebar)
- `1024px–1279px`: Article full-width, calculator inline (embedded in article flow)
- `768px–1023px`: Same — calculator inline
- `375px–767px`: Single column, calculator is a card section

**Spacing scale (8px base):**
- `4px` — between label and input
- `8px` — within input group
- `16px` — between form rows
- `24px` — between calculator sections
- `32px` — between article sections
- `48px` — between major sections (article + calculator transition)
- `64px` — page top/bottom padding
- `80px` — above the fold hero breathing room

**Decorative rules:** 1px horizontal lines in `--color-border` between major sections. Occasional thick `3px` editorial rule in `--color-accent-red` as section openers.

---

## 8. Component Patterns

**Masthead / Article header:**
- Angkin wordmark (Cormorant Garamond italic, 22px) top-left
- Breadcrumb: `Labor Law · Retirement · RA 7641` in Libre Franklin small-caps, gold
- `ANGKIN · Philippine Compliance Tools` in 11px small-caps beneath wordmark

**Article headline block:**
- H1 in Cormorant Garamond Bold, 56px, dark navy
- Byline: "By Angkin Research · March 2026 · 8 min read · Calculator included" in 12px Libre Franklin, muted
- A 3px red editorial rule below the byline, full column width

**Drop cap:** First letter of first paragraph in 4-line-height Cormorant Garamond, red, floated left with 8px text wrap margin.

**Pull quote:** Cormorant Garamond italic 28px, in `--color-accent-navy`, with left border of `4px solid --color-accent-red`. Indented 24px from body text. No quotation marks — the typography says "quote."

**Law Box:** A card with `--color-accent-navy` header, white body. Header reads: `REPUBLIC ACT NO. 7641` in white Libre Franklin Bold 13px small-caps. Body: the exact relevant law text in Source Serif 4 14px, with citations. Light `#E8F0F8` background.

**Calculator Card (embedded within article):**
- Section header: "CALCULATE YOUR RETIREMENT PAY" in Libre Franklin Bold 13px small-caps, `--color-accent-red`, with a red rule above it
- Input fields: cream background `#F5F0E8`, 1px solid `#DDD5C8` border, 4px radius — understated, editorial
- Labels: Libre Franklin Bold 13px ALL CAPS, with a `?` tooltip icon
- Input focus: border changes to `--color-accent-navy`, subtle cream-to-white bg transition
- Compute button: full-width, `--color-accent-red` background, white Libre Franklin Bold 15px ALL CAPS text, no border radius (it's a rectangle — editorial precision, not rounded friendliness)
- Secondary action: "Reset" — text-only link, muted

**Result Display:**
The computed result appears as an inline editorial "result card" within the calculator, styled like a data visualization in a magazine:
- Large number in Cormorant Garamond Bold 72px, `--color-accent-navy`
- "₱" prefix in 36px, vertically aligned to top of number
- "Minimum Retirement Pay" label in Libre Franklin 13px ALL CAPS below
- A horizontal red editorial rule divides the result from the breakdown
- The breakdown: a simple two-column tabular list in Source Serif 4 14px
- A contextual sentence below: "Based on RA 7641 (Retirement Pay Law). Consult an HR professional for your specific situation."

**Navigation:** No hamburger menu. Just the masthead breadcrumb. Navigation is contextual — "Related tools" section at article bottom.

**Validation:** Inline, below field, in Source Serif 4 italic 14px, `--color-error` color. No icons. The italic is enough — it signals error through typographic convention.

---

## 9. Animation Philosophy

**Concept:** Editorial sites don't animate for delight — they animate for clarity. Transitions are deliberate and restrained, like page-turning rather than swooping.

**Page load:** No dramatic entrance. The article loads naturally, top-down. The calculator sidebar fades in after 300ms (opacity 0→1, translateY 8px→0) — enough to signal that it's an interactive overlay on the reading experience.

**Input focus:** 200ms transition on border-color and background-color. No scale, no glow, no shadow animation — just color. Editorial precision.

**Compute button hover:** Background shifts from `#C4302B` to `#9E2520` (10% darker). 150ms. The button doesn't move — it darkens, like ink pressed harder.

**Calculation moment:** When results appear, the result card slides down into view (height 0→auto with max-height animation, 400ms cubic-bezier(0.4, 0, 0.2, 1)), then the number counts up over 600ms (JS counter from 0 to final value). The red editorial rule above the result draws from left to right over 400ms (using `clip-path: inset(0 100% 0 0)` animating to `inset(0 0 0 0)`). This is the one "celebration" moment — it's earned, not gratuitous.

**Sticky sidebar:** At desktop, as user scrolls past the calculator section, the sidebar becomes `position: sticky`. No animation — just the natural browser sticky behavior. This is the most useful "animation" in the whole page.

**Scroll behavior:** `scroll-behavior: smooth`. That's it. No parallax, no scroll-triggered reveals.

**CSS-only:** All animations use CSS transitions and `@keyframes`. No JavaScript animation libraries.

---

## 10. Accessibility Approach

**WCAG target:** AA compliance minimum, AAA for body text.

**Contrast ratios:**
- Body text `#1A1208` on cream `#FAF7F0`: **15.2:1** (AAA)
- Body text `#1A1208` on white `#FFFFFF`: **18.2:1** (AAA)
- Accent red `#C4302B` on white: **5.2:1** (AA for normal text, AAA for large text)
- Navy `#1C3557` on white: **10.8:1** (AAA)
- White on red button `#C4302B`: **5.2:1** (AA)
- Muted text `#9A8E7C` on cream: **3.1:1** — ONLY used for decorative metadata (byline dates, footnote numbers), never for meaningful content

**Focus visible:** Custom focus ring: `2px solid #C4302B` with `2px offset` — editorial red matches the accent, visible on cream and white backgrounds. Never removed — `:focus-visible` used throughout.

**Screen reader:** The law box has `role="complementary"` and `aria-label="Legal text from Republic Act 7641"`. The calculator has `role="form"` with `aria-labelledby="calc-title"`. The result region has `aria-live="polite"` so screen readers announce the computed value without interruption.

**Color-blind safety:** The red (`#C4302B`) is used with text labels — never as a color-only signal. The success state (`#2D6A4F`) always accompanies a checkmark icon + text. Tested against Deuteranopia (red-green) and Protanopia.

**Touch targets:** Compute button is minimum 52px height. All input fields are minimum 48px height. Labels are tappable and increase field focus on tap.

**Reading mode compatibility:** Article structure uses proper semantic HTML — `<article>`, `<section>`, `<h1>`-`<h4>`, `<blockquote>` for pull quotes. Works correctly in Safari Reader mode and Firefox Reading Mode.

**Long-form readability:** Line length 680px max, 16-char minimum. Leading 1.75 for body. No justified text — ragged right for better readability.

---

## 11. Icon & Illustration Style

**Icon style:** None used for decoration. The only icon in the entire interface is a small `?` circle (12px) next to field labels that opens a tooltip with plain-language explanation. This icon is from Phosphor Icons (Regular weight, 16px). The restraint is intentional: editorial publications don't use icons as visual candy.

**The exception:** The calculator section header uses a subtle `✦` four-pointed star in `--color-accent-gold` as a typographic ornament — referencing traditional newspaper/magazine ornamental typography, not UI iconography.

**Illustration approach:** None in the primary calculator experience. The tool is content-native — the article itself provides visual interest through typography, pull quotes, and law boxes. However, the homepage/hub uses editorial-style photographs with duotone treatment (navy + cream) showing Filipino workers — warehouse, office, factory — as article thumbnails.

**Future illustration:** For "explainer" sections, a sparse line-art style (1px stroke, editorial gray `#5C5040`) could annotate calculation diagrams. For example: a timeline showing "Years of Service" visually. This is optional — the text is sufficient.

**Icon adaptation across 148 tools:** Since icons are minimal, there's nothing to adapt. The only change per tool is the `✦` ornament color (set by `--color-domain`).

---

## 12. Dark Mode Strategy

**Decision: Yes, dark mode is supported — but it transforms the personality significantly.**

Dark mode is toggled by a subtle `☾` (crescent moon) icon in the masthead. No automatic OS detection — this is a deliberate choice: many Filipino users use their phones outdoors in bright light and would be annoyed by unexpected dark switches. The toggle remembers via `localStorage`.

**Dark palette:**
| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#FAF7F0` | `#0F0C08` |
| `--color-surface` | `#FFFFFF` | `#1C1810` |
| `--color-text-primary` | `#1A1208` | `#F0EAD8` |
| `--color-text-secondary` | `#5C5040` | `#B0A080` |
| `--color-accent-red` | `#C4302B` | `#E05550` |
| `--color-accent-navy` | `#1C3557` | `#4A7FB5` |
| `--color-border` | `#DDD5C8` | `#3A3020` |
| `--color-input-bg` | `#F5F0E8` | `#2A2418` |

**Personality shift in dark mode:** The warm cream editorial feel becomes a candlelit study — ink on dark leather. The red becomes brighter (contrast-adjusted). The Cormorant Garamond headlines glow warm against the dark background, like type on an old printing press. The personality shifts from "morning newspaper" to "late-night reading by lamplight" — both moods serve the same emotional goal (deep engagement with content).

---

## 13. Multi-Tool Cohesion

**The invariant (always the same across all 148 tools):**
- Masthead: Angkin wordmark + "Philippine Compliance Tools" + breadcrumb taxonomy
- Color palette: cream background, navy + red accent
- Typography trio: Cormorant Garamond + Source Serif 4 + Libre Franklin
- Article structure: Headline → Context → Law Box → Calculator → What's Next
- Calculator component: identical design, only field labels change
- Footer: identical across all tools
- Dark mode toggle position

**The variant (changes per tool):**
- Breadcrumb category and tool name
- Headline and article content
- Domain color (applied to breadcrumb + law box header)
- Law box content (the actual statute)
- Calculator fields and computation logic
- Result label ("Minimum Retirement Pay" vs "Monthly SSS Pension" etc.)
- Related tools section at bottom

**How a user knows it's "family" at tool #47:** The masthead is the brand's "newspaper flag" — identical every time. The cream + red + navy palette has established recognition. The calculator card's distinctive square-cornered compute button is a recurring motif. The Cormorant Garamond headline creates instant visual recognition ("I've seen this before — the fancy letter site"). This is the same cohesion strategy as The New York Times across thousands of articles: same masthead, same fonts, same column structure — infinite content variation.

---

## 14. Developer Ergonomics

**Token file structure:**
```
angkin-editorial/
├── tokens/
│   ├── base.css          # Color, type, spacing custom properties
│   ├── dark.css          # Dark mode overrides ([data-theme="dark"])
│   └── domains.css       # Per-domain color overrides ([data-domain="labor"])
├── components/
│   ├── masthead.css       # Header/nav
│   ├── article.css        # Article typography (body, drop cap, pull quote)
│   ├── law-box.css        # RA citation card
│   ├── calculator.css     # Calculator card, inputs, button
│   ├── result.css         # Result display, number animation
│   └── footer.css
├── layouts/
│   ├── two-column.css     # Desktop: article + sticky calculator
│   └── single-column.css  # Mobile/tablet: stacked
└── icons/
    └── phosphor-subset.js # Only the ? tooltip icon
```

**Component API surface:** This is a CSS-only system with no framework dependency. New tools are built by:
1. Copy `templates/single-form-calculator.html`
2. Replace: headline, article content, law box text, calculator field definitions, result formula
3. Set `data-domain="labor"` (or tax/property/etc.) on `<body>`
4. Done

**Estimated time to build a new single-form calculator:** 4-6 hours (writing the article content is the majority of time — the HTML template and CSS need 30 minutes of setup). For a developer who only fills in the JS calculation logic and doesn't write content: 45 minutes.

**Content-optional mode:** For tools where a full article is not yet written, a "short form" template provides just the law box + calculator + one introductory paragraph. This degrades gracefully — same design, less content.

**Framework integration:** The CSS tokens work identically with React, Vue, or plain HTML. A React component library wrapper can be added incrementally without breaking the CSS-only foundation.

---

## 15. Deployment Model

**Content Hub + Embedded Tools**

Primary deployment: an Angkin editorial hub at `angkin.ph` (or `angkin.com.ph`) — a publisher-style site organized by legal domain (Labor Law, Tax Law, Property Law, etc.). Each tool is a long-form article page with an embedded interactive calculator.

Architecture:
- **Hub:** Next.js for static site generation (SEO-critical — this model lives and dies by Google discovery)
- **Content:** MDX files in a Git repository — article content is version-controlled, editable by non-engineers using GitHub
- **Calculator logic:** Each tool has a `.ts` calculation file that exports a pure function — no framework dependency
- **Distribution:** All 148 tools are routes in the same Next.js app, statically generated at build time

SEO strategy: The editorial format generates natural long-tail keyword rankings ("how much retirement pay Philippines 19 years service") — this is the primary user acquisition channel. Each article is independently discoverable.

**CDN:** All static assets on Cloudflare. No login required for any tool.

---

## 16. Scalability Assessment

**At 10 tools:** Excellent. The template-based system means 10 articles/calculators is trivial. The two-template system (full article vs. short-form) handles all UI archetypes that are single-form calculators.

**At 50 tools:** Good. The breadcrumb taxonomy and domain color system keep 50 tools organized. The hub homepage needs a proper search/filter component (simple, editorial in style — a single search field + category pills, no mega-menu). Static generation at 50 pages is fast (~2-3 minutes build).

**At 148 tools:** Stretched, but manageable. Key scaling challenges:
1. **Build time:** 148 pages × MDX compilation — addressable with Next.js ISR (Incremental Static Regeneration)
2. **Multi-step wizards:** The editorial two-column layout is optimized for single-form calculators. Multi-step wizards (e.g., a decision tree for "am I entitled to separation pay?") need a specialized full-width step layout that departs from the article metaphor. A "wizard" variant template is needed.
3. **Data-heavy tools:** Dashboard archetypes (tracked computations over time) don't fit the single-article metaphor — they need a separate "app" sub-domain
4. **Content production:** 148 articles is significant editorial work — this system requires a content strategy, not just a design system

**What breaks first:** The editorial article metaphor breaks for non-single-form-calculator archetypes. Tools that are lookup tables, comparison engines, or dashboards need separate templates. The system accommodates ~85% of the 148 tools natively; the other 15% need template extensions.

**Prevention:** Build 2 additional templates (wizard, data-table) by tool #30. The CSS token foundation is shared; only the layout template changes.

---

## 17. Trade-offs

**This option EXPLICITLY sacrifices:**

1. **Speed of comprehension:** Editorial articles require reading time. Users who want "just the calculator" may be frustrated. *This is acceptable* because: (a) Google SEO prioritizes long-form content, (b) the article-embedded calculator is reachable by scrolling or clicking "Jump to Calculator" (a prominent skip link at article top), and (c) users who read the article convert better — they understand what the number means.

2. **App-like feel:** This feels like a website, not an app. There are no saved computations, no account, no history. *Acceptable* because: the primary use case (Google search → compute → screenshot) doesn't need these features. A power-user "My Computations" feature can be added later without changing the design.

3. **Multi-step wizard support:** The two-column layout is optimized for single-form calculators. *Acceptable because* 70%+ of the 148 tools are single-form calculators. The remaining tools get simplified short-form templates.

4. **Cohesion across non-editorial archetypes:** If an accountant needs a dashboard tool, the editorial article metaphor is wrong for their workflow. *Acceptable* because: those power-user tools represent a minority of the 148 and can be differentiated by a separate "Pro" sub-product while maintaining the Angkin brand.

5. **Visual memorability through boldness:** This option is quiet, not bold. *Acceptable because:* editorial publishing earns memorability through depth and usefulness, not visual loudness. Users remember The Economist for what they learned, not because it has bright colors.

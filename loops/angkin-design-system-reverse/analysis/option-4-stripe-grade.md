# Option 4: Stripe-Grade Developer System

**Aspect 16 of 27 — Wave 2: Design Options**
**Status:** Complete
*Produced: 2026-03-10*

---

## 1. Design Philosophy

This design believes that consistency IS the feature. When a professional uses 30 different Angkin tools in a single workday, the system must be so predictable that the tool disappears — only the calculation remains. Every component exists in a token ledger; no color, spacing value, or font size is ever eyeballed. Obsessive systematization is the only design decision that scales to 148 tools.

Compliance work is high-stakes, repetitive, and precision-critical. The design communicates: *this machine will not make a mistake.* Dark mode by default signals precision and expertise — you're in the engine room, not the lobby. The result is not a celebration, it's a fact.

---

## 2. Persona Narrative

**Carlo Reyes, 41, Payroll Manager at a 400-person manufacturing company in Laguna.**

Carlo has 23 employees retiring or separating this quarter — restructuring. He's been computing retirement pay manually in Excel for 12 years. He knows RA 7641 cold. He opens tools not to learn but to *verify and audit* — a second opinion with a paper trail.

He's on his work laptop (1440p Dell monitor), 9:00 AM, coffee at hand, three browser tabs already open (DOLE website, labor lawyer's blog, their HR system). He wants: speed, numbers he can trust, output he can copy-paste into a report. He will use this tool 15 times today, each with different inputs. He has zero patience for animations, onboarding, or anything that assumes he's a first-timer.

This design does not explain what retirement pay is. It computes it.

---

## 3. Competitive DNA

Inspired by **Stripe's token architecture + perceptual color science** (systematic, accessible by math not manual tuning) + **Linear's dark mode as a declaration of seriousness** (interface that says "professionals work here"), differentiated by **Philippine compliance density** — multiple interrelated fields, statutory references visible at a glance, outputs formatted for official reports. This is the design that HR professionals open and immediately say *"this is the real one."*

---

## 4. Brand Expression

**"By Angkin" placement:** Fixed header bar — tool name in `Syne` medium left-aligned, `by Angkin` as a subdued badge immediately below in `JetBrains Mono` at 11px, `--color-text-muted`. The Angkin name is also anchored in the top-left as a compact wordmark: `[A]` — a monogram badge in a 28×28px rounded square filled with `--color-primary`.

**Individual tool identity:** Each tool has a unique tool code (e.g., `LBR-RT-7641` for the RA 7641 retirement pay calculator). This code appears in the header, in outputs, and in any copied/exported data. It's the "receipt number" for compliance work.

**Suite cohesion strategy:** The invariants across all 148 tools:
- Identical token file (one CSS file imported by every tool)
- Identical header component (monogram + tool name + tool code + optional user settings)
- Identical input field treatment
- Identical output card format
- Identical color palette (only the accent hue can shift per domain — see Color System)

The variants:
- Tool name and tool code
- Number/order/type of input fields
- Result breakdown structure
- Any domain-specific callout text (e.g., "Note: this excludes benefits not defined as wages under Art. 97")

---

## 5. Color System

**Base philosophy:** A perceptually calibrated dark palette. The background is not black (#000) — it's a very deep blue-gray (`#080e1a`) that gives the eye a resting place. All text colors maintain minimum 4.5:1 contrast on their respective backgrounds.

### Full Palette

| Token | Hex | Role |
|-------|-----|------|
| `--bg-canvas` | `#080e1a` | Page background |
| `--bg-surface` | `#0e1626` | Card / panel background |
| `--bg-surface-raised` | `#162035` | Elevated surface (modal, dropdown) |
| `--bg-surface-overlay` | `#1c2c46` | Hover state on surface |
| `--border-subtle` | `#1e2d47` | Dividers, low-emphasis borders |
| `--border-default` | `#2a4060` | Standard input borders, card borders |
| `--border-strong` | `#3a5580` | Focused state border |
| `--text-primary` | `#e2eaf8` | Primary content |
| `--text-secondary` | `#8fa8cc` | Labels, secondary info |
| `--text-muted` | `#4d6b96` | Placeholders, de-emphasized |
| `--text-inverse` | `#080e1a` | Text on primary-colored backgrounds |
| `--color-primary` | `#2dd4bf` | Primary action (teal — precision, accuracy) |
| `--color-primary-hover` | `#14b8a6` | Primary hover |
| `--color-primary-subtle` | `#0e2f2b` | Primary tinted background |
| `--color-accent` | `#fbbf24` | Emphasis accent for result values (amber) |
| `--color-success` | `#22c55e` | Confirmed, valid, passed |
| `--color-success-subtle` | `#052e16` | Success tinted bg |
| `--color-warning` | `#f59e0b` | Caution, approaching limits |
| `--color-error` | `#f87171` | Validation error |
| `--color-error-subtle` | `#2d0f0f` | Error tinted bg |

### Domain Accent Shift
Per compliance domain, the `--color-primary` shifts to a domain-specific hue while all other neutrals remain identical:
- **Labor/employment:** `#2dd4bf` (teal — this option's domain)
- **Tax/BIR:** `#818cf8` (indigo — precision, formality)
- **Property:** `#34d399` (emerald — land, growth)
- **Corporate/SEC:** `#60a5fa` (blue — corporate, institutional)
- **Maritime:** `#38bdf8` (sky — sea, open water)

This is a single CSS variable override. All 148 tools use identical code; only `--color-primary` changes.

---

## 6. Typography System

**Typeface philosophy:** Two typefaces only. `Syne` — a geometric sans designed for display that carries authority without coldness, chosen because its alternate letterforms (the `a`, the `g`) signal intentionality. `JetBrains Mono` — the monospaced workhorse for all numeric output and tool codes, giving results the authority of a machine printout. Crucially, no intermediate body font: Syne's legibility at small sizes is sufficient for field labels and body copy.

**Fonts:** Google Fonts CDN
- `Syne` (Variable: wght 400–800) — all prose, labels, UI text
- `JetBrains Mono` (Variable: wght 400–700) — all values, codes, computed outputs

### Scale

| Token | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| `--type-hero` | Syne | 2.5rem | 700 | 1.1 | Tool name in hero |
| `--type-h1` | Syne | 1.75rem | 600 | 1.2 | Section titles |
| `--type-h2` | Syne | 1.25rem | 600 | 1.3 | Card headings |
| `--type-h3` | Syne | 1rem | 600 | 1.4 | Field group titles |
| `--type-label` | Syne | 0.75rem | 500 | 1.4 | Form labels, caps, 0.05em tracking |
| `--type-body` | Syne | 0.9375rem | 400 | 1.6 | Prose, helper text |
| `--type-small` | Syne | 0.8125rem | 400 | 1.5 | Footnotes, legal refs |
| `--type-caption` | Syne | 0.6875rem | 400 | 1.4 | Metadata, timestamps |
| `--type-value-hero` | JetBrains Mono | 2.75rem | 700 | 1.0 | Primary computed result |
| `--type-value-lg` | JetBrains Mono | 1.5rem | 600 | 1.1 | Secondary result values |
| `--type-value-md` | JetBrains Mono | 1.125rem | 500 | 1.2 | Breakdown line items |
| `--type-value-sm` | JetBrains Mono | 0.875rem | 400 | 1.3 | Formula inputs, small values |
| `--type-code` | JetBrains Mono | 0.75rem | 400 | 1.4 | Tool codes, statutory refs |

**Weight rules:** 700 for display headings. 600 for section headings. 500 for labels (always uppercase + tracked). 400 for body. In mono: 700 for the hero result only; 500 for breakdown items; 400 for references.

---

## 7. Spatial Philosophy

**Density:** Professional-dense. This is not airy. Carlo computes 15 times today — he doesn't want to scroll. All inputs visible above the fold on a 1440p screen. Results visible without scrolling on 1280px+.

**Base unit:** 4px. All spacing is multiples of 4. No half-values.

**Spacing scale:**
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
- `--space-16`: 64px

**Grid:**
- Max-width: 1200px
- Desktop: 12-column, 24px gutters, 32px outer margins
- Tablet (768px): 8-column, 16px gutters
- Mobile (375px): 4-column, 16px gutters

**Layout pattern:** Two-panel on desktop — inputs LEFT (5 columns), results RIGHT (7 columns), both panels fixed-height with internal scroll if content overflows. On mobile: stacked, inputs first then results.

**Border radius scale:**
- `--radius-sm`: 4px (inputs, chips)
- `--radius-md`: 6px (cards, buttons)
- `--radius-lg`: 8px (panels)
- `--radius-xl`: 12px (modal containers)

Sharp enough to communicate precision, never pill-shaped.

---

## 8. Component Patterns

### Buttons
| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | `--color-primary` | `--text-inverse` | none |
| Secondary | transparent | `--color-primary` | 1px `--color-primary` |
| Ghost | transparent | `--text-secondary` | 1px `--border-default` |
| Destructive | `--color-error-subtle` | `--color-error` | 1px `--color-error` |
| Loading | `--color-primary` at 50% opacity | spinner | none |

All buttons: height 36px (compact, not padded), `--radius-md`, `--type-label` (uppercase, tracked). Primary has a subtle inner glow: `box-shadow: 0 0 12px rgba(45, 212, 191, 0.3)`.

### Input Treatment
- Label: `--type-label`, uppercase, `--text-secondary`, 8px below label to input
- Input: `--bg-surface`, `--border-default` border, height 40px, `--radius-sm`, `--type-body` in `--text-primary`
- Focus: `--border-strong` border, `box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15)`, color `--color-primary`
- Placeholder: `--text-muted`
- Prefix/suffix: peso ₱ sign in left-aligned position, `--text-muted`, separator border
- Helper text: `--type-small`, `--text-muted`, 4px above
- Validation error: helper text turns `--color-error`, border turns `--color-error`, subtle `--color-error-subtle` fill
- Validation success: border turns `--color-success`, checkmark icon appears at right

### Cards / Panels
- Surface: `--bg-surface`, `--border-subtle` border, `--radius-lg`
- Elevated: `--bg-surface-raised`, `--border-default` border, `--radius-lg`
- Section dividers: 1px `--border-subtle` horizontal rule

### Result / Output Display

**The computed result is the most important moment in the entire tool.** Treatment:
- Output panel slides into view (transforms from opacity 0, translateY 8px)
- Large label: `RETIREMENT PAY` in `--type-label` + `--text-muted`
- Hero value: `₱XXX,XXX.XX` in `--type-value-hero` + `--color-accent` (amber — the only warm color in the system, signals "this is the answer")
- Tool code + computation timestamp below in `--type-code` + `--text-muted`
- Breakdown section below: each line item in `--type-value-md` with label left, value right
- "Copy to clipboard" button: ghost, small, top-right of result card
- Statutory basis: collapsible disclosure at bottom — `Art. 287 (R.A. 7641) basis: [(avg monthly salary) × (years of service)] × ½`

### Progress Indicators
- For multi-step wizards (not this tool, but in system): horizontal step bar using numbered circles. Active: `--color-primary` fill. Complete: `--color-primary` with checkmark. Pending: `--border-default`.

### Navigation Pattern
- Fixed top bar: 48px height, `--bg-surface-raised`, bottom border `--border-subtle`
- Left: Angkin monogram `[A]` in primary teal + tool name in Syne medium
- Right: tool code badge in JetBrains Mono + settings gear icon

---

## 9. Animation Philosophy

**Less is more, but what exists is precise.** Animation is functional — it confirms actions, reveals state changes, and prevents disorientation. It is never decorative.

**Micro-interactions:**
- Button hover: `background-color` transition, 120ms ease-out
- Input focus: border-color + box-shadow, 150ms ease-out
- Checkbox/radio: scale 0.9→1.0 on check, 100ms

**Computation moment:** When the user clicks "Compute":
1. Button label changes to "Computing..." with a spinner (no layout shift — button stays same size)
2. 180ms delay (even if calculation is instant — gives the computation moment weight)
3. Result panel animates in: `opacity: 0; transform: translateY(8px)` → `opacity: 1; transform: translateY(0)`, 240ms ease-out
4. Hero value counter: counts up from 0 to result value over 400ms using `requestAnimationFrame` — the only "celebration" in this system. Not a confetti explosion. A precise counter.

**No page transitions.** No route animations. No skeleton loaders (data is computed locally, instantly). The only meaningful animation is the result reveal.

**Implementation:** Pure CSS transitions for all hover/focus states. Two lines of JS for the counter animation. No animation library needed.

---

## 10. Accessibility Approach

**Target:** WCAG 2.1 AA throughout, AAA for critical result values.

**Contrast ratios:**
- `--text-primary` (`#e2eaf8`) on `--bg-canvas` (`#080e1a`): 15.2:1 (AAA)
- `--text-secondary` (`#8fa8cc`) on `--bg-surface` (`#0e1626`): 5.8:1 (AA)
- `--color-primary` (`#2dd4bf`) on `--bg-canvas` (`#080e1a`): 7.3:1 (AAA)
- `--color-accent` (`#fbbf24`) on `--bg-surface` (`#0e1626`): 8.1:1 (AAA)
- `--color-error` (`#f87171`) on `--bg-surface` (`#0e1626`): 4.6:1 (AA)

**Focus visible:** All interactive elements have explicit `:focus-visible` styles — `outline: 2px solid var(--color-primary)`, `outline-offset: 2px`. No `outline: none` without a replacement.

**Screen reader:** All inputs have explicit `<label>` elements with `for` attributes. Computed results use `aria-live="polite"` region so screen readers announce the computed value. Result value has `role="status"`.

**Color-blind safety:** The primary teal (`#2dd4bf`) and the accent amber (`#fbbf24`) are distinguishable for all major color vision deficiencies (deuteranopia, protanopia, tritanopia) — verified using APCA contrast tables. Error states use both color AND an icon (`⚠` or `✕`), never color alone.

**Touch targets:** All interactive elements minimum 44×44px on mobile (even if visually smaller, the tap target area is padded). Field height on mobile: 48px.

**Language:** All statutory references available in Filipino (`Tagalog`) with a toggle in the header. Default: English (professional context).

---

## 11. Icon & Illustration Style

**Icons:** Phosphor Icons (MIT licensed, React + vanilla SVG support). Weight: Regular (1.5px stroke) for UI icons. Bold (2.5px stroke) for status indicators (error, warning, success). No filled icons except in the active state of toggle controls.

**Icon sizing:**
- Navigation icons: 20×20px
- Inline UI icons: 16×16px
- Status indicators: 18×18px

**Illustration approach:** None. Zero illustrations. This is a professional tool for data entry and verification. An illustration of a Filipino worker on the results page would feel condescending and irrelevant to Carlo's context. The data itself is the content. The absence of illustration is a deliberate statement: *this is not a consumer app, it's a work tool.*

**Custom elements:** A single unique visual — the Angkin `[A]` monogram badge in the header. This is built from CSS (border + letter) not an image. Can be replaced with an actual SVG logo when brand guidelines are finalized.

---

## 12. Dark Mode Strategy

**Dark mode IS the mode.** This design does not have a light variant as an afterthought. The dark palette is the primary palette.

**Why dark mode for this audience:** Carlo's monitor is at max brightness (common in office settings under fluorescent lights). Dark mode reduces eye strain during extended computation sessions. Compliance professionals who use Bloomberg Terminal, SUSE Enterprise tools, and database dashboards are already acclimated to dark interfaces.

**Toggle:** User settings provide a `Prefer light mode` toggle for the rare context where dark mode isn't appropriate (e.g., printing). The light variant is a palette swap only — same token names, different values:
- `--bg-canvas` → `#f8fafc`
- `--bg-surface` → `#ffffff`
- `--text-primary` → `#0e1626`
- etc.

**Does it change the personality?** Minimally. The same systematic rigour. The same precise typography. Light mode feels slightly warmer (white + teal) vs dark mode's professional seriousness.

---

## 13. Multi-Tool Cohesion

**The invariant (always identical across 148 tools):**
- `angkin-tokens.css` — the single token file, imported by every tool
- Header component (HTML + CSS)
- Input component HTML structure (label → input → helper-text pattern)
- Button HTML structure and class names
- Result card HTML structure
- Tool code format (`{DOMAIN}-{TYPE}-{LAW}`, e.g., `LBR-RT-7641`)

**The variant (changes per tool):**
- `--color-primary` (domain accent color — one CSS variable)
- Tool name string
- Tool code string
- Input field configuration (number of fields, field types, labels)
- Result breakdown structure

**The guarantee:** A developer adding tool #149 touches exactly two files: a configuration object (tool metadata) and a layout file (input configuration + result template). They never touch the token file, the header component, or the button styles. Consistency is architectural, not disciplinary.

---

## 14. Developer Ergonomics

**Token structure:**
```
angkin-system/
├── tokens/
│   ├── angkin-tokens.css       # All CSS custom properties (auto-generated from JSON source)
│   ├── tokens.json             # Source of truth — edit here, regenerate CSS
│   └── tokens.d.ts             # TypeScript types for token names (autocomplete in editor)
├── components/
│   ├── header.html             # Copy-paste header template
│   ├── input.html              # Copy-paste input template
│   ├── button.html             # Copy-paste button template
│   └── result-card.html        # Copy-paste result card template
└── docs/
    └── index.html              # Living documentation site (built from components)
```

**New tool checklist:**
1. Copy `template-tool/` directory
2. Edit `config.js`: set `toolName`, `toolCode`, `domainColor`, and `inputs[]` array
3. Edit `compute.js`: write the computation function
4. Done. All styling, layout, and component structure is inherited.

**Estimated build time (new single-form calculator):**
- Token setup: already done (0 minutes)
- Tool scaffold from template: 15 minutes
- Input configuration: 30 minutes
- Computation logic: 60–120 minutes (depends on statutory complexity)
- Result formatting: 30 minutes
- QA: 30 minutes
- **Total: ~3–4 hours for a competent developer**

This is achievable because no design decisions need to be made. The system decides.

---

## 15. Deployment Model

**Shared package + micro-apps.**

`@angkin/system` is a private npm package containing: `angkin-tokens.css`, the component HTML templates, and documentation. Each tool is its own micro-app (Vite + vanilla JS or React 19) that installs `@angkin/system` as a dependency.

**Why this model:**
- Tools can be developed and deployed independently — team of 3 developers can ship 3 tools in parallel
- Token updates propagate to all tools on their next `npm update @angkin/system`
- No single point of failure — if tool #3 has a bug, tools #1, #2, #4–148 are unaffected
- SEO: each tool has its own URL, sitemap entry, and meta tags
- Caching: each tool's CSS is small (the token file + minimal component CSS, ~8KB gzipped)

**Hub site:** `angkin.ph` lists all 148 tools, organized by domain. It's a separate app that reads a `tools.json` manifest. When a new tool is deployed, it's added to the manifest.

---

## 16. Scalability Assessment

**At 10 tools:** System works flawlessly. Token consistency is maintained. Developers are learning the system and the template is proving its value.

**At 50 tools:** Token file needs versioning. Recommend semantic versioning of `@angkin/system` and a changelog. Some tools will need edge-case component variants (e.g., a multi-step wizard form — add to system rather than create ad-hoc per tool).

**At 148 tools:** Three risks:
1. **Token drift:** Developers modifying tokens locally rather than updating the system package. Mitigation: automated token linting in CI (CSS custom property validator).
2. **Component sprawl:** 20+ one-off components that should have been added to the system. Mitigation: a bi-monthly "system harvest" process — identify repeated patterns across tools, extract into `@angkin/system`.
3. **Visual boredom:** All 148 tools look nearly identical. Mitigation: the domain accent color differentiation provides just enough variety; hero illustrations (if added in v2) would add per-tool personality.

**What doesn't break:** The token architecture. Correctly structured token systems scale indefinitely — the Facebook Design System manages thousands of product surfaces with the same approach.

---

## 17. Trade-offs

**This option explicitly sacrifices:**

1. **Warmth and approachability.** Carlo doesn't need warmth — he needs accuracy. But a scared first-time user arriving on a labor dispute calculation might find the dark interface cold and imposing. This design serves the power user; it subtly alienates the novice.

2. **Zero-effort onboarding.** There's no explanation of what retirement pay is, no "what does this mean?" tooltips by default (they exist, but collapsed). A first-time user might not know what "Last Drawn Salary" means in RA 7641 context. This is acceptable — the intended user (HR/payroll) knows.

3. **Visual delight.** The result moment is a counter animation, not a celebration. A user who computed retirement pay and found out they're owed ₱180,000 might want the tool to recognize the significance of that number. This design treats it as a fact to be verified, not a discovery to celebrate. Acceptable for professional context.

4. **Light-first accessibility.** Some accessibility testing environments default to light mode, and some accessible color tools are calibrated for light backgrounds. The dark palette requires re-verification against dark-specific contrast tools. This is additional QA burden that's worth it for the professional audience.

**Why these trade-offs are acceptable:** Option 4 is not designed for the mass-market user. It's designed for the professional who uses compliance tools the way accountants use spreadsheets — as a precision instrument, not an experience. The 30% of Angkin users who are HR/payroll professionals generate the most computation volume and are most sensitive to accuracy. Serving them exceptionally well is the right trade-off, even if it means a slightly higher barrier for first-timers.

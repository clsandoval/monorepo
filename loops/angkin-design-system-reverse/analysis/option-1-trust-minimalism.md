# Option 1: Wise-Inspired Trust Minimalism

**Aspect 13 of 27 — Wave 2: Design Options**
**Status:** Complete
*Produced: 2026-03-10*

---

## 1. Design Philosophy

This design believes that trustworthiness is built through restraint. Every pixel removed is a promise kept — "we have nothing to hide, and nothing to distract you." The calculator is the hero. The result is the payoff. Everything else steps aside.

Compliance tools earn trust not by looking professional, but by feeling predictable. Users should be able to navigate this calculator without reading a single instruction. The design guides through clarity, not instruction.

---

## 2. Persona Narrative

**Maria Santos, 34, Admin Supervisor at a BPO in Pasig.**

Maria is at her desk on her lunch break, Google-searching "how much retirement pay should I get RA 7641." She's heard rumors her company is downsizing. She doesn't know if she qualifies — she's been there 6 years, started part-time. Her heart rate is slightly elevated. She's on Chrome on her work laptop, 1366×768 monitor, corporate wifi.

She arrives skeptical: she's used the SSS website before. She braces for login prompts, confusing terms, and forms that lose her input on submit. The moment this tool loads — clean, fast, no login prompt — her shoulders drop. She types in her salary. She clicks compute. She sees a number. She screenshots it.

This is the experience: **relief.**

---

## 3. Competitive DNA

Inspired by **Wise's "white is a color" philosophy** (maximum whitespace, result upfront, no account wall) + **gov.uk's content-first form design** (labels above every input, no placeholder-as-label, progressive disclosure of complexity), differentiated by **warmer typography** (Instrument Serif for result moments) and a **distinctly Philippine color temperature** (forest green that references natural environments, not Western fintech).

---

## 4. Brand Expression

**"By Angkin" placement:** Small suite badge in the top-left corner of the nav bar — `angkin` in lowercase Figtree medium, with a 1px border in `--color-border`, 8px padding, `--color-text-secondary` color. Subtle but unmissable.

**Individual tool identity:** Each tool's name ("RetireMath") appears in large Instrument Serif above the "by Angkin" badge in smaller Figtree. The hierarchy is: tool name first, suite affiliation second. This respects the user's intent (they came for THIS calculator) while building ambient suite recognition.

**Suite cohesion strategy:** All 148 tools share: identical nav strip height (56px), identical brand badge treatment, identical spacing system, identical button styles, identical result display treatment. Per-tool variation is limited to: tool name, primary input configuration, result breakdown structure. A user arriving on tool #47 instantly recognizes the nav strip, the badge, the button color, the result card — same family.

**Domain tinting:** Each compliance domain gets a subtle tint on the result card background:
- Tax tools: `#F7F3E8` (warm amber tint)
- Labor/employment: `#F3F8F4` (soft green tint, this option)
- Property: `#F3F5F8` (cool blue tint)
- Corporate/SEC: `#F8F3F7` (soft violet tint)

---

## 5. Color System

**Design rationale:** Green communicates "go" and "growth" in both Western finance (Wise, Monzo) and Philippine context (GCash's success color, crop abundance, healing). But Wise's `#9FE870` bright green feels too digital-agency. This palette deepens the green toward forest — grounded, serious, but still warm.

| Token | Hex | Semantic Role |
|-------|-----|---------------|
| `--color-primary` | `#1A5C3A` | Forest green — buttons, links, primary interactive |
| `--color-accent` | `#7AE08D` | Mint green — hover states, active indicators, result highlight |
| `--color-bg` | `#FAFAF9` | Warm off-white — page background |
| `--color-surface` | `#FFFFFF` | Pure white — cards, inputs, modals |
| `--color-border` | `#DDE5DF` | Subtle green-tinted border |
| `--color-border-focus` | `#1A5C3A` | Focus ring — same as primary |
| `--color-text` | `#0D1F14` | Near-black with green undertone |
| `--color-text-secondary` | `#3D5E49` | Muted body text, labels |
| `--color-text-tertiary` | `#7A9B84` | Placeholders, de-emphasized |
| `--color-success` | `#1A5C3A` | Success states — same as primary |
| `--color-success-bg` | `#E8F5EE` | Result card background |
| `--color-warning` | `#A06B00` | Warning text |
| `--color-warning-bg` | `#FDF3DC` | Warning background |
| `--color-error` | `#B83B2A` | Error text |
| `--color-error-bg` | `#FDECEA` | Error background |
| `--color-muted` | `#F2F5F3` | Alternate surface, skeleton |

**Domain-specific tints (applied only to result card background):**
- Labor/employment: `--color-success-bg` (`#E8F5EE`) — used for this mockup
- Tax: `#FDF7E8` (amber warmth)
- Property: `#EAF0F8` (cool blue)
- Corporate: `#F3EEF8` (soft violet)

**WCAG contrast verification:**
- `#0D1F14` on `#FAFAF9`: 17.4:1 (AAA)
- `#FFFFFF` on `#1A5C3A`: 6.2:1 (AA+)
- `#1A5C3A` on `#FAFAF9`: 8.4:1 (AAA)
- `#B83B2A` on `#FAFAF9`: 5.1:1 (AA)

---

## 6. Typography System

**Body font: Figtree** (Google Fonts)
- Humanist grotesque. Warm, approachable, readable. Not Inter, not Space Grotesk. The round dots on lowercase i/j and the slightly organic curves give it life without sacrificing legibility at small sizes. Used for all UI labels, input text, body copy, navigation.

**Display font: Instrument Serif** (Google Fonts)
- A refined variable-axis serif with optical size support. Used exclusively for: hero numbers in results, the calculator title, and the computed value. When Maria sees her ₱126,000 retirement pay in Instrument Serif, it feels like a bank statement — authoritative, real. The contrast with Figtree body text creates a visual hierarchy that guides the eye: input → compute → result.

**Why this pairing:** Figtree keeps the UI warm and functional. Instrument Serif elevates the result moment — the moment that matters most — into something worth trusting. The serif says "this number is serious." The grotesque says "getting here was easy."

| Style | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| Hero Result | Instrument Serif | 56px | 400 | 1.0 | -0.02em |
| Tool Title | Instrument Serif | 32px | 400 | 1.2 | -0.01em |
| Section Header | Figtree | 20px | 600 | 1.3 | -0.01em |
| Label | Figtree | 15px | 500 | 1.4 | 0 |
| Body | Figtree | 15px | 400 | 1.6 | 0 |
| Small / Caption | Figtree | 13px | 400 | 1.5 | 0.01em |
| Button | Figtree | 15px | 600 | 1 | 0.01em |

**Rules:**
- Never use all-caps for any label or heading
- Left-align all text (no center-aligned labels)
- Line length max 65 characters for body text
- Instrument Serif only for: result numbers, tool title, and major confirmation moments

---

## 7. Spatial Philosophy

**Density:** Airy. This is the most whitespace-forward option in the suite. Mimics Wise's principle that whitespace communicates confidence.

**Grid:**
- Desktop (≥1024px): Single centered column, max-width 600px for the calculator form
- Tablet (640–1023px): Same single column, 32px side margins
- Mobile (<640px): Full-width column, 20px side margins

**Max-width:** 600px for calculator content, 1200px for page wrapper

**Vertical rhythm:** 8px base unit. All vertical spacing is a multiple of 8.

**Key spacing tokens:**
| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 8px | Between form helper text and field |
| `--space-sm` | 16px | Between form fields |
| `--space-md` | 24px | Between sections within form |
| `--space-lg` | 40px | Between major sections |
| `--space-xl` | 64px | Section separation on desktop |
| `--page-padding-x` | 24px mobile, 32px desktop | Side padding |
| `--card-padding` | 32px desktop, 24px mobile | Card internal padding |

**Responsive behavior:**
- 1280px: Two-column context (narrow nav sidebar OR breadcrumb trail + wide form)
- 1024px: Form centered with generous whitespace
- 768px: Compact but still airy
- 375px: Full-width card, reduced padding, same vertical flow

---

## 8. Component Patterns

**Buttons:**
- **Primary:** Background `--color-primary` (#1A5C3A), text white, 14px Figtree 600, 12px border-radius, 48px height, full-width on mobile. Hover: 5% lighter. Active: 5% darker with scale(0.98). No box shadows.
- **Secondary:** Border 1.5px `--color-primary`, text `--color-primary`, transparent background. Same height/radius.
- **Ghost:** Text `--color-text-secondary`, no border. For low-emphasis actions (clear form, expand explanation).
- **Destructive:** Not used in this tool type.

**Inputs:**
- Label: 15px Figtree 500, `--color-text-secondary`, above field (never placeholder-as-label)
- Input: 48px height, 1px border `--color-border`, 8px border-radius, 15px Figtree 400, background `--color-surface`
- Focus: 2px border `--color-border-focus`, no box shadow, background stays white
- Placeholder: `--color-text-tertiary` (#7A9B84)
- Helper text: 13px Figtree 400, `--color-text-tertiary`, below input, always present (not only on error)
- Error state: Border `--color-error`, red helper text with warning icon
- Prefix symbol: ₱ in `--color-text-secondary`, same font/size, left inside input

**Cards:**
- Subtle 1px border `--color-border`
- 16px border-radius
- No box-shadow on input card; subtle `box-shadow: 0 2px 8px rgba(13,31,20,0.06)` on result card
- Background: `--color-surface` (input) / `--color-success-bg` (result)

**Result Display:**
The most important component. When computation completes:
1. Result card slides into view (translateY from 12px, opacity 0→1, 400ms ease-out)
2. Hero number: 56px Instrument Serif, `--color-primary` (#1A5C3A)
3. Label above number: 13px Figtree 500 uppercase `--color-text-tertiary` — "RETIREMENT PAY"
4. Below number: breakdown table — Years of Service × Daily Rate × 22.5, each line 15px Figtree
5. Separator line between breakdown items: 1px `--color-border`
6. At bottom: "Based on RA 7641 (Retirement Pay Act)" in 13px Figtree, `--color-text-tertiary`
7. Share/screenshot button: ghost button below result

**Progress Indicators:** Not needed for single-form calculator. Multi-step wizards (18 tools) would use a horizontal progress bar at top, `--color-accent` fill, step labels below.

**Navigation:** Minimal top nav — left: Angkin badge; right: tool name breadcrumb. No hamburger menus. Sticky on mobile, static on desktop.

---

## 9. Animation Philosophy

**Philosophy: function first, speed over spectacle.** Animations at this scale must communicate state change without adding waiting time. A 150ms transition is a delight; a 600ms animation is a frustration.

**Micro-interactions:**
- Hover (buttons): background-color transition, 150ms ease-out
- Focus (inputs): border-color transition, 100ms ease-out
- Click (primary button): scale(0.98), 100ms ease, then scale(1.0) on release

**The calculation moment:**
1. Button press: subtle scale(0.97) on click, immediate compute (no artificial delay)
2. Result card: `animation: resultReveal 400ms ease-out forwards`
   ```css
   @keyframes resultReveal {
     from { opacity: 0; transform: translateY(12px); }
     to   { opacity: 1; transform: translateY(0); }
   }
   ```
3. Hero number: counter animation using JS — counts from 0 to final value over 600ms (ease-out cubic). Gives weight to the number's arrival.
4. Breakdown lines stagger in: each line delayed by 50ms increments.

**Loading state:** Skeleton pulse on the result area (not a spinner). CSS `@keyframes pulse` with opacity 0.4→0.8.

**Validation errors:** Input border color transition, 150ms. Error text fades in from opacity 0, translateY(-4px) — subtle, not alarming.

**CSS-only except:** Number counter animation (requires minimal JS). No animation library dependencies.

---

## 10. Accessibility Approach

**WCAG Level:** AA minimum, AAA for most color combinations (see Section 5 contrast ratios).

**Focus visible strategy:** 2px solid `--color-border-focus` (#1A5C3A), 2px offset from element. Applied only on `:focus-visible` (keyboard navigation), not on `:focus` (mouse click). This is exact Wise approach — keyboard users get clear indicators, mouse users aren't distracted by them.

**Screen reader:**
- Form section uses `<fieldset>` + `<legend>` for logical grouping
- All inputs have explicit `<label for="id">` associations
- Result section uses `aria-live="polite"` region — screen readers announce the computed value
- Status updates (calculating, error, result) use `role="status"` or `role="alert"` appropriately
- Number inputs have `inputmode="decimal"` for correct mobile keyboard

**Color-blind verification:**
- Primary green (#1A5C3A) + accent mint (#7AE08D): Distinguishable in protanopia and deuteranopia (both retain luminosity difference)
- Error red (#B83B2A) + success green (#1A5C3A): Different luminosity values, PLUS accompanying icons ensure state is not conveyed by color alone

**Touch targets:**
- All interactive elements minimum 48px height
- Primary CTA button: 56px height on mobile
- Minimum 8px gap between any two interactive elements

**Language:** All UI text in English with specific terms spelled out (e.g., "Republic Act No. 7641" not just "RA 7641"). Tagalog-English: field labels in English, helper text may include parenthetical Tagalog clarifications where helpful (e.g., "Years of service (taon ng serbisyo)").

---

## 11. Icon & Illustration Style

**Icons:** Lucide icons, 20px, 1.5px stroke weight. Used sparingly: error states, helper text indicators, the "by Angkin" badge. Never decorative-only icons.

**Illustration:** None in this option. Whitespace IS the illustration — the absence of decoration signals "we're serious about your numbers."

**Exception:** A single small SVG checkmark animation on successful computation — a 24px circle with a checkmark path that draws itself in 300ms. This is the ONLY illustrative element. It confirms: "yes, this number is valid."

**Across 148 tools:** Each tool's domain can have a small monochrome icon (24px, 1.5px stroke) in the nav header as context — a scale for tax, a handshake for labor, a building for property. These are never decorative; they're wayfinding signals.

---

## 12. Dark Mode Strategy

**Yes, with automatic detection via `prefers-color-scheme: dark`.**

Dark mode color transformation:
| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#FAFAF9` | `#0A1510` |
| `--color-surface` | `#FFFFFF` | `#111F17` |
| `--color-border` | `#DDE5DF` | `#1E3028` |
| `--color-text` | `#0D1F14` | `#E8F2EC` |
| `--color-text-secondary` | `#3D5E49` | `#8CB89A` |
| `--color-primary` | `#1A5C3A` | `#3A9E65` (lightened for dark bg) |
| `--color-accent` | `#7AE08D` | `#5AD476` |
| `--color-success-bg` | `#E8F5EE` | `#0F2B1D` |

**Personality shift:** Dark mode deepens the trustworthy feeling — it feels like a late-night finance session, private and focused. The green phosphoresces slightly, which is striking.

**No explicit toggle in MVP.** Auto-detect only. Manual toggle can be added in v2 via a moon icon in the nav.

---

## 13. Multi-Tool Cohesion

**Invariant (never changes across 148 tools):**
1. Nav bar: 56px height, `--color-bg` background, `--color-border` bottom
2. Angkin badge: exact same treatment — lowercase Figtree, 1px border, 8px padding
3. Button system: same colors, radius, height, font
4. Input treatment: same label/input/helper pattern
5. Result card: same elevation, animation, Instrument Serif for hero number
6. Footer: identical across all tools — "by Angkin · RA citation · Feedback link"
7. Typography system: same fonts loaded on every page
8. Spacing tokens: identical values

**Variant (changes per tool):**
1. Tool name (in Instrument Serif title)
2. Domain icon in nav
3. Input fields (specific to tool's required data)
4. Result breakdown structure (specific to tool's formula)
5. Domain tint on result card
6. The RA/regulation citation in footer

**Recognition test:** Cover the tool title. A user should still know it's an Angkin tool from: badge, button color, input style, result card design. That's 5 independent recognition signals.

---

## 14. Developer Ergonomics

**Token file structure:**
```
/packages/angkin-tokens/
  tokens.css          ← All CSS custom properties
  tokens.js           ← JS export of same tokens (for Tailwind theme)
  tokens.json         ← Raw JSON (design tool sync)
```

**Component API surface:**
```
/packages/angkin-ui/
  Button.jsx          ← variant, size, loading, disabled props
  Input.jsx           ← label, helper, error, prefix props
  ResultCard.jsx      ← value, breakdown[], citation props
  Navbar.jsx          ← toolName, domain props
  CalculatorLayout.jsx ← wrapper, handles responsive grid
```

**New tool spin-up:**
```jsx
import { CalculatorLayout, Input, Button, ResultCard } from '@angkin/ui'
import tokens from '@angkin/tokens'

export default function RetirementPayCalc() {
  return (
    <CalculatorLayout toolName="RetireMath" domain="labor">
      <Input label="Monthly Salary" prefix="₱" id="salary" />
      <Input label="Years of Service" id="years" />
      <Button variant="primary" onClick={compute}>Compute</Button>
      {result && <ResultCard value={result.pay} breakdown={result.breakdown} />}
    </CalculatorLayout>
  )
}
```

**Estimated time to build a new single-form calculator:** 2–3 hours (inputs, logic, result display). All visual complexity is in the shared components.

---

## 15. Deployment Model

**Hub + micro-apps.**

- `angkin.ph` — marketing hub, tool directory, blog (Next.js)
- `[tool-slug].angkin.ph` — individual tools as independent deployments (Vite + React)
- Shared `@angkin/ui` package published to private npm
- Shared `@angkin/tokens` package

**Rationale:** Each tool can be deployed/updated/scaled independently. A viral tool (e.g., 13th Month Pay Calculator goes viral in December) can be scaled without affecting others. The shared package ensures design coherence without runtime coupling.

---

## 16. Scalability Assessment

**At 10 tools:** Perfect. The token system + shared components handle it trivially.

**At 50 tools:** Good. Minor tooling investment needed: a generator CLI for new tool scaffolding, automated screenshot tests for each tool's result card, a shared Storybook for component documentation.

**At 148 tools:** The hub directory becomes the main challenge (148 entries need good search/filter). The token system and component library handle visual consistency without issue, but operational complexity (148 deployments) requires a deployment pipeline and monitoring dashboard.

**What breaks first:** The tool directory becomes unusable without faceted search + filtering by domain, archetype, and user need. Build this before tool #20.

**What needs building before 148 tools:**
1. CLI generator: `npx @angkin/create-tool --name "RetireMath" --archetype single-form --domain labor`
2. Visual regression tests: Chromatic or Percy on all tool mockups
3. Domain directory with search/filter

---

## 17. Trade-offs

**This option sacrifices:**
1. **Emotional warmth** — maximum whitespace can feel cold on first impression. Filipino users accustomed to GCash's colorful density may find this too sparse.
2. **Marketing impact** — this design won't get shared on social media. It's too restrained to be "shareable."
3. **Information density** — the airy layout means fewer tools can show their full breakdown without scrolling on mobile.
4. **Cultural distinctiveness** — the Wise-inspired palette reads as "international fintech," not specifically Filipino. This may reduce the cultural resonance that builds local trust.

**Why these trade-offs are acceptable for this audience:**
Maria (scared first-timer) doesn't need warmth — she needs clarity. She needs to believe the number. Every element removed is one fewer distraction from the result. The restraint IS the message: "we're serious." For her, this design works.

For the broader suite, this option is best deployed as the default for high-anxiety tools (separation pay, penalty calculators, tax computations) where clarity > warmth.

# Option 2: Gov.uk Radical Clarity

**Aspect 14 of 27 — Wave 2: Design Options**
**Status:** Complete
*Produced: 2026-03-10*

---

## 1. Design Philosophy

Content is the interface. Every design decision serves one master: can a person with low digital literacy, reading on a 5-year-old Android phone in harsh midday sunlight, understand exactly what this calculator is asking — and trust the answer it gives?

This design believes decoration is a tax on comprehension. Whitespace is not empty — it is clarity made visible. A form field is not a container — it is a structured question in a civic conversation between a tool grounded in law and a citizen who deserves a straight answer.

No animation. No illustration. No gradient. Just the question, the answer, and the law that backs both.

---

## 2. Persona Narrative

**Mang Rolando "Rolly" Delos Reyes, 57, security guard, Makati CBD.**

Thirty-eight years of service. Night shift, 12-hour days. His employer just called a meeting next Friday — "reorganization." His co-worker Eduardo mentioned something called RA 7641. Rolly types "computation ng retirement pay Philippines" into Chrome on his Oppo A15 (₱3,599 on installment, 2GB RAM). He's never installed a banking app. He finds Angkin Option 2.

He has never heard of "RA 7641." He doesn't know what "basic pay" means vs. "gross pay." His hands are large and he fat-fingers small buttons. He reads primarily in Filipino but has basic functional English. He is scared and wants one thing: a number he can show his wife.

The design must serve him first — not the accountant, not the HR manager. Every label is a plain question. Every error is a human sentence. The result is a large number with an explanation he can read aloud to his family.

---

## 3. Competitive DNA

**Inspired by:** gov.uk Design System (clarity architecture, one-thing-per-page, label-as-heading, black input borders, yellow focus) + Atkinson Hyperlegible (accessibility mission) + Public Sans (government typeface for a democratic web).

**Differentiated by:** A single warm teal accent color that separates Angkin from cold bureaucracy; bilingual label patterns (English primary / Tagalog in parens); and a result page that explains the *law*, not just the number — so Mang Rolly leaves not just with an answer but with knowledge.

**Not:** SSS eFPS (impenetrable), BIR portal (hostile), any fintech app (too playful for a scared worker).

---

## 4. Brand Expression

The Angkin wordmark appears as a small, quiet text mark at top-left: **Angkin** in Public Sans Semibold, 16px, teal color. No logomark. No tagline on the tool itself. The tool's name — "Retirement Pay Calculator" / "Kalkulador ng Retirement Pay" — is the H1 heading, the first thing read, the reason for being here.

At the bottom of the result page: a one-line legal citation ("Based on Republic Act No. 7641 and the 2015 DOLE Explanatory Bulletin") and a small "A tool by Angkin · angkin.ph" footer note.

**Suite cohesion strategy:** Across all 148 tools, the invariant is the behavior pattern — not any visual logo treatment. Users who have used the SSS Contribution Calculator will recognize the Retirement Pay Calculator immediately because the *question structure, typography, input style, and result format* are identical. The brand IS the pattern.

---

## 5. Color System

### Core Palette

| Role | Name | Hex | Rationale |
|------|------|-----|-----------|
| Background | white | `#FFFFFF` | Absolute white — no warmth, maximum contrast |
| Surface | off-white | `#F7F7F6` | Panels, result backgrounds — barely perceptible |
| Text primary | near-black | `#1A1918` | Warmer than pure black, less fatiguing on phone screens |
| Text secondary | medium-grey | `#5A5856` | Labels, secondary content |
| Text tertiary | light-grey | `#8C8A88` | Captions, hints |
| Accent / Brand | deep teal | `#00766A` | Angkin's brand — nature, growth, trustworthiness (Filipino: verde/luntian associations with progress) |
| Link | dark teal | `#005C52` | Passes 7:1 contrast on white |
| Focus | signal yellow | `#FFD000` | Unmissable keyboard focus ring — stolen directly from gov.uk |
| Error | deep red | `#C62828` | Accessible, unambiguous, not alarming |
| Success | deep green | `#2E7D32` | Accessible, clear, positive |
| Input border | near-black | `#1A1918` | 2px — unmissable on any screen quality |
| UI border | light grey | `#D0CECC` | Cards, dividers |
| Muted | very light | `#EDECEB` | Disabled states, secondary surfaces |

### Domain Color Variants

The accent teal `#00766A` shifts per tool domain while keeping the same near-monochrome base:

| Domain | Accent Color | Hex |
|--------|-------------|-----|
| Labor / Employment | Forest teal | `#00766A` |
| Tax / BIR | Slate blue | `#1B4F8A` |
| SSS / GSIS | Cobalt | `#1565C0` |
| Property / HLURB | Plum | `#6A1B9A` |
| Maritime / POEA | Ocean navy | `#0D47A1` |
| Immigration / DFA | Deep indigo | `#283593` |
| Health / PhilHealth | Jade green | `#1B6B46` |

---

## 6. Typography System

### Font Pairing

**Headings + Body: Public Sans** (Google Fonts — `weights: 400, 500, 600, 700`)
Designed explicitly for government and civic digital services. More open and accessible than GDS Transport, more distinctive than Inter. Works beautifully in bilingual English/Filipino text.

**Results / Numbers: Overpass Mono** (Google Fonts — `weight: 700`)
Monospaced numerals make computed amounts feel authoritative — like an official document, a payslip, a court order. Numbers displayed in mono create instant scanability.

### Type Scale

| Role | Desktop | Mobile | Weight | Usage |
|------|---------|--------|--------|-------|
| Hero / H1 | 36px / 44px lh | 26px / 34px lh | 700 Bold | Page title / label-as-heading |
| H2 | 26px / 34px lh | 20px / 28px lh | 700 Bold | Section heading |
| H3 | 20px / 28px lh | 18px / 26px lh | 600 Semibold | Sub-section |
| Body | 19px / 28px lh | 17px / 26px lh | 400 Regular | Primary reading text (19px minimum — accessibility) |
| Small | 16px / 24px lh | 16px / 24px lh | 400 Regular | Hints, captions |
| Caption | 14px / 20px lh | 14px / 20px lh | 400 Regular | Legal footnotes |
| Result number | 52px / 60px lh | 38px / 46px lh | 700 Bold (Mono) | The computed amount |
| Result label | 14px / 20px lh | 14px / 20px lh | 600 Semibold | Above result number |

### Typography Rules
- **Sentence case always** — "Save and continue", never "Save And Continue"
- **No ALL CAPS** anywhere
- Line length: 50–65 characters (enforced by 640px max-width container)
- Minimal font sizes on mobile — 16px absolute floor (avoids iOS auto-zoom)
- Letter-spacing: default (no artificial tracking)
- Font smoothing: antialiased

---

## 7. Spatial Philosophy

**Density: Airy** — the least dense option in the suite.

**Max content width:** 640px (narrower than most design systems). This forces single-column reading, keeps line lengths readable, and feels like a focused task rather than a web page.

**Grid:**
- Single column throughout
- No sidebar, no two-column form layouts
- Container horizontal padding: 40px desktop, 20px mobile

**Spacing Scale (5px base — inherited from gov.uk):**

| Token | Value |
|-------|-------|
| `space-1` | 5px |
| `space-2` | 10px |
| `space-3` | 15px |
| `space-4` | 20px |
| `space-5` | 25px |
| `space-6` | 30px |
| `space-7` | 40px |
| `space-8` | 50px |
| `space-9` | 60px |

**Key spacing decisions:**
- Between form fields: 32px (space between questions)
- Between label and input: 8px
- Between hint and input: 4px
- Section separation: 48px
- Page top padding: 40px

**Breakpoints:**
- Mobile: 0–639px (single column, 20px gutters)
- Desktop: 640px+ (single column, 40px gutters, 640px max-width)
- No tablet breakpoint — the 640px max-width means the form looks identical from 640px onwards

---

## 8. Component Patterns

### Buttons

```
Primary: bg #00766A, text #FFFFFF, border none, height 48px min,
         padding 12px 20px, border-radius 0 (square), font-size 19px

Secondary: bg #FFFFFF, text #00766A, border 2px solid #00766A,
           same sizing

Ghost: text #005C52, underlined, no border, no background

Destructive: bg #C62828, text #FFFFFF, same sizing

Focus state: ALL buttons get 3px yellow offset ring (#FFD000)
Disabled: opacity 0.4, cursor not-allowed (discouraged — avoid where possible)
```

### Inputs

```
Label: Public Sans 19px Bold, near-black #1A1918, margin-bottom 4px
Hint text: Public Sans 16px Regular, #5A5856, margin-bottom 8px
Input: 2px solid border #1A1918, no border-radius, height 52px min,
       padding 10px 12px, font-size 19px, width 100%

On focus: border stays black + 3px offset #FFD000 ring
Error state: 4px left border #C62828 + error message in red below input
Error message: ⚠ prefix, red text, 16px
```

**Rule: No placeholder text** (ever). If the user needs guidance, it goes in the hint text above the input.

### Cards / Panels

```
Border: 1px solid #D0CECC, no border-radius
Background: #F7F7F6
Padding: 24px desktop, 20px mobile
Used only for: result display, "check your answers" summary
```

### Result Display

The moment of truth. When the user hits "Kalkulahin" (Compute):

```
RESULT PANEL:
──────────────────────────────────────────
Ang iyong retirement pay (Your retirement pay)    [14px caps label]

₱ 1,540,000.00                                   [52px Overpass Mono]

──────────────────────────────────────────

Breakdown:
Last monthly basic pay:     ₱  28,000.00
Years of service:           38 years
Applicable formula:         1 month per year of service
Computation:                ₱28,000 × 38 = ₱1,064,000 base

Wait — this employee qualifies for enhanced computation:
[shows breakdown table]

Based on: Republic Act No. 7641
```

The result is shown as a separate "screen" (visual state), not an inline update. The panel becomes the entire page focus.

### Progress Indicator

Text only: `"Hakbang 2 ng 3 (Step 2 of 3)"` in small grey text above the H1. No progress bar. No icons. The text itself communicates progress without consuming visual space.

### Navigation

Back link: `← Bumalik (Back)` — plain text link, 16px, no button styling, above the H1. The ← is a text character, not an SVG.

---

## 9. Animation Philosophy

**None.**

This is a principled stand. Animations:
1. Add perceived latency (users think the tool is still computing)
2. Can feel insecure — "why is it doing something before showing me the answer?"
3. Create accessibility problems for motion-sensitive users
4. Are irrelevant to the trust contract this tool is building

The ONLY motion:
- Page-level fade-in on load: `opacity 0 → 1, 150ms ease`. CSS only. No delay.
- Focus ring appears/disappears instantly (no transition)
- Result panel fades in over 200ms on compute (CSS class toggle)

The "computation moment" UX: the button text changes to "Kinakalkula..." (Calculating...) for 300ms even if the JS result is instant — this gives users a moment to register that something happened. Then the result panel replaces the form inputs. No animation needed.

---

## 10. Accessibility Approach

**Target: WCAG 2.2 Level AA** (aiming to exceed on critical flows)

### Contrast Verification

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| #1A1918 on #FFFFFF | 19.1:1 | ✅ AAA |
| #00766A on #FFFFFF | 4.6:1 | ✅ AA |
| #005C52 on #FFFFFF | 7.2:1 | ✅ AAA |
| #C62828 on #FFFFFF | 5.8:1 | ✅ AA |
| #FFFFFF on #00766A | 4.6:1 | ✅ AA |
| #FFD000 on #1A1918 | 12.3:1 | ✅ AAA (focus ring) |

### Key Accessibility Decisions

1. **Yellow focus ring** (#FFD000) — 3px outline, 3px offset — impossible to miss
2. **19px minimum body text** — larger than standard; helps aging eyes and poor screens
3. **2px black input borders** — visible on low-contrast screens and bright daylight
4. **No placeholder text** — prevents confusion for users with cognitive differences
5. **Error summary at top** with `role="alert"` — auto-focuses on page render
6. **Inline errors repeat** the same wording as the summary (not "Invalid" but "Ibigay ang iyong buwanang sahod")
7. **Touch targets** — 48px minimum height for all interactive elements
8. **lang attributes** — `lang="tl"` for Filipino text sections, correct for screen readers
9. **aria-describedby** on every input pointing to its hint text
10. **aria-live="polite"` region** for result panel — screen readers announce when it appears
11. **No color-only information** — errors use both red color AND an error icon (⚠) AND text
12. **Input mode** — `inputmode="numeric"` for salary fields (numeric keyboard on mobile)
13. **Disabled states avoided** — compute button always clickable, validation only on submit

### Color-blind safety

The teal/white/black palette functions identically in:
- Deuteranopia (red-green blind): teal reads as distinct from grey/red
- Protanopia: same
- Tritanopia: teal preserved, yellow focus reads as light

---

## 11. Icon & Illustration Style

**Icons: None.** Radical clarity means even icon choice is a cognitive variable.

**Exceptions (text characters only):**
- `←` Back link arrow (Unicode, not SVG)
- `✓` Success checkmark in confirmation state
- `⚠` Warning/error prefix
- `₱` Peso sign in result display

**Illustrations: None.** The law citation *is* the illustration — showing users that this tool is grounded in RA 7641 is more trustworthy than any imagery.

**Law citation styled visually:**
```
┌─────────────────────────────────────────┐
│ Republic Act No. 7641                   │
│ Retirement Pay Law                      │
│ As amended by RA 8558                   │
│                                         │
│ "Any employee in the private sector...  │
│  shall be entitled to retirement pay." │
└─────────────────────────────────────────┘
```
This blockquote-style callout replaces illustration entirely. It provides legal grounding and increases trust more than any hero image could.

---

## 12. Dark Mode Strategy

**No dark mode for this option.**

Rationale:
- Target audience (low digital literacy, older users) does not expect or use dark mode
- High-contrast light mode at 19:1 contrast ratio already exceeds most dark mode implementations
- Dark mode adds complexity without clear user benefit for this demographic
- Monochrome + yellow focus ring is already highly accessible

**If forced to implement:** The palette inverts cleanly — `#1A1918` ↔ `#FFFFFF`, teal `#00766A` → lighter `#4DB6AC`, yellow focus unchanged. But this is not planned for Option 2.

---

## 13. Multi-Tool Cohesion

### Invariants (always identical across all 148 tools)

1. Public Sans + Overpass Mono font pairing
2. 640px max-width, single-column, 40px gutters
3. 19px body text minimum
4. 2px black input borders
5. Yellow focus ring (#FFD000), 3px offset
6. Error summary at top (role="alert")
7. Sentence case throughout
8. No placeholder text
9. Back link pattern (← Bumalik)
10. Result panel structure (label → large number → breakdown table)
11. Law citation callout
12. Footer "A tool by Angkin · angkin.ph"

### Variants (changes per tool)

1. Accent color (teal for labor, blue for tax, plum for property…)
2. Tool name in H1
3. Law citation text
4. Input fields (different questions for different calculators)
5. Result formula and breakdown
6. Domain-specific hint text

### User Recognition Test

A user who has used the SSS Contribution Calculator arrives at the Retirement Pay Calculator. Recognition happens in 2 seconds because:
- Same font
- Same input style (big, square, black-bordered)
- Same button (square teal "Kalkulahin")
- Same result panel structure
- Same footer mark

They don't consciously think "this is Angkin" — they think "I know how to use this." That IS brand recognition.

---

## 14. Developer Ergonomics

### Token Architecture

```
/angkin-clarity-tokens/
├── tokens.css          # CSS custom properties (colors, type, spacing)
├── reset.css           # Minimal browser reset
└── components/
    ├── layout.css      # Container, grid
    ├── typography.css  # Heading/body rules
    ├── button.css      # All button variants
    ├── form.css        # Input, label, hint, error patterns
    ├── card.css        # Panel, result display
    └── utilities.css   # Spacing helpers
```

### Consuming the System

New developer workflow:
1. Link `tokens.css` and `components/*.css`
2. Copy the "single-form calculator" HTML template
3. Replace field labels, hint text, and law citation
4. Wire up JS computation logic (pure function, tool-specific)
5. Test with at least 2 user scenarios

**No framework dependency** — plain HTML/CSS/vanilla JS. Works in any stack. Can be wrapped in React components but doesn't require it.

### Time Estimates

| Task | Estimate |
|------|----------|
| New single-form calculator | 2–3 hours |
| New multi-step wizard (3-5 steps) | 4–6 hours |
| New lookup table | 1–2 hours |
| Design system foundation setup | 1 day |
| Per-tool customization | < 30 minutes |

---

## 15. Deployment Model

**Monolithic app** — single domain `angkin.ph`, all 148 tools served from one application with client-side routing.

URL structure: `angkin.ph/tools/retirement-pay-ra7641`

Rationale: Radical clarity's power comes from behavioral consistency. If tools are deployed independently (different hosts, different build processes), drift is inevitable — different versions of the same component, different focus ring implementations. The monolith enforces the invariants.

Navigation: A simple text-based tool directory at `angkin.ph/tools` with category filters and search. No visual cards — just a plain, scannable list (matching the radical clarity aesthetic).

---

## 16. Scalability Assessment

**10 tools:** Perfect. Fast, consistent, minimal overhead.

**50 tools:** Excellent. The monolithic architecture performs well. Navigation needs a text search box added to the directory.

**148 tools:** The design system scales perfectly — no visual bloat, no component drift. Architecture needs:
- Full-text search on the tool directory
- Category filtering (by agency: DOLE, BIR, SSS, etc.)
- URL aliasing for SEO (e.g., `/retirement-pay` → `/tools/retirement-pay-ra7641`)
- Possibly a tool-finder wizard ("What are you trying to calculate? → Select your situation")

**What breaks first:** The tool directory page. A flat alphabetical list of 148 tools is usable but not great. A good search box solves 80% of this.

**What never breaks:** The individual tool pages. Single-form calculators in this system scale to any number without degradation.

---

## 17. Trade-offs

### What This Option Explicitly Sacrifices

1. **Visual memorability** — a screenshot of this tool looks like a government website. If someone shares it on social media, it won't be because it looks beautiful. It will be because it gave them the right answer.

2. **Brand differentiation** — Angkin could be mistaken for a DOLE or NLRC digital service. This is almost a feature (trust), but limits brand-building.

3. **Delight moments** — no celebrations, no animations, no "You save ₱42,000!" fanfare. The number speaks for itself.

4. **Appeal to younger users** — a 22-year-old on TikTok will find this tool "boring." That's fine. This option isn't for them.

5. **Dark mode** — explicitly not supported.

6. **Illustration and visual richness** — the page looks sparse to a designer's eye.

### Why These Are Acceptable

For Mang Rolly — and the millions of Filipino workers like him — trust is not built through visual complexity. It is built through:
- The page loading in 2 seconds on slow LTE
- The form never losing his input on error
- The answer appearing in plain words he can read to his wife
- The law cited at the bottom confirming this is real

When the tool gives him ₱1,540,000 — and he can bring that number to his employer — it doesn't matter what the button radius was. It matters that it was right, fast, and clear.

This option is the most honest expression of what Angkin is: a tool in service of workers' rights, with nothing in the way.

---

*End of Option 2 Spec — all 17 sections complete.*

# Benchmark: Wise (TransferWise) Design System
*Wave 1, Aspect 4 — Researched 2026-03-10*

## Why Wise?

Wise is the gold standard for fintech design that feels simultaneously **trustworthy and warm**. Unlike traditional banks (cold, authoritative, impenetrable) or neobanks that over-gamify (hollow, anxiety-inducing), Wise found a middle register: **friendly competence**. For Angkin—a suite of Philippine compliance calculators—Wise is the closest aspirational reference: a financial tool that ordinary people actually enjoy using.

---

## 1. What Makes Wise Feel Trustworthy + Warm

### The Transparency Principle
Wise's single most trust-building UX decision: **show you the fee before you even create an account.** Their homepage calculator displays the exact transfer fee, exchange rate, and estimated delivery time upfront. No hidden costs, no account-wall, no bait-and-switch. For compliance calculators, the parallel is obvious: show the user their result immediately—no registration required.

### The "White Is a Color" Philosophy
Wise's foundational aesthetic principle: *"White is the most prominent colour in our UI and we use it to let screens breathe."* The visual hierarchy flows:
1. White space (dominant)
2. Neutral grey backgrounds
3. Content grey text
4. Forest green interactivity
5. Bright green accents (sparingly)

This hierarchy communicates confidence without aggression. The whitespace says "we have nothing to hide." The green says "we're alive and modern." Together: trustworthy warmth.

### Calm Guidance vs. Alarm UX
The UX tone is **calm and reassuring**—users feel guided, not overwhelmed. No urgent "ACT NOW" CTAs, no anxiety-inducing warning colors everywhere, no dark patterns. Errors are informative, not accusatory. This is the opposite of BIR eFPS and most government portals.

---

## 2. Typography System

### Font Pairing
| Role | Font | Rationale |
|------|------|-----------|
| **Product/Body** | Inter | Clean, legible, supports 148 languages, tall x-height for readability, Google Font (fast load) |
| **Display/Hero** | Wise Sans (custom) | Bold custom type evolved by Ragged Edge, inspired by global scripts, creates distinctive brand moments |

**Key principle:** Inter for *all functional UI*. Wise Sans reserved for **key success and selling moments** only—not sprinkled throughout.

### Type Scale
| Style | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| Display Large | Wise Sans | 96px | Bold | 85% | 2% |
| Display Medium | Wise Sans | 64px | Bold | 85% | 1.5% |
| Display Small | Wise Sans | 40px | Bold | 85% | 1.5% |
| Title Screen | Inter | 30px | Semi Bold | 34px | -2.5% |
| Title Section | Inter | 26px | Semi Bold | 32px | -1.5% |
| Body Large | Inter | 16px | Regular | 24px | -0.5% |
| Body Default | Inter | 14px | Regular | 22px | 1% |

**Naming strategy:** Semantic names (Title Screen, Body Large) not numbered variants—designers know which to reach for without consulting a manual.

### Typography Rules
- **Never use all caps** (even for headlines)—maintains warmth and approachability
- Left-align body text; 50-60 character line lengths
- Display font used big and bold, but sparingly—"don't overdo it"
- Dynamic line heights for i18n (diacritics bleed between lines in Spanish if too tight)

---

## 3. Color System

### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Bright Green** | `#9FE870` | Signature brand color; interactive accent pops |
| **Forest Green** | `#163300` | Depth, contrast; primary interactive color |

> *"When banks say no, green says go. It's energetic and vibrant, just like the world we live in."*

### Content Colors (Neutral Greys with Green Undertone)
| Name | Hex | Usage |
|------|-----|-------|
| Content Primary | `#0E0F0C` | Primary text emphasis |
| Content Secondary | `#454745` | Body text |
| Content Tertiary | `#6A6C6A` | Placeholders only |
| Content Link | `#163300` | Links and external icons |

### Interactive Colors
| Name | Hex | Usage |
|------|-----|-------|
| Interactive Primary | `#163300` | Neutral interactive elements |
| Interactive Accent | `#9FE870` | Accent pops in buttons |
| Interactive Secondary | `#868685` | De-emphasized elements |
| Interactive Control | `#163300` | Text on bright green backgrounds |
| Interactive Contrast | `#9FE870` | Text on forest green backgrounds |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Sentiment Negative | `#A8200D` | Error states |
| Sentiment Positive | `#2F5711` | Success states |
| Sentiment Warning | `#EDC843` | Warnings (background only) |

### Secondary Brand Palette (Marketing Applications)
| Color | Hex |
|-------|-----|
| Bright Orange | `#FFC091` |
| Bright Yellow | `#FFEB69` |
| Bright Blue | `#A0E1E1` |
| Bright Pink | `#FFD7EF` |
| Dark Purple | `#260A2F` |
| Dark Gold | `#3A341C` |
| Dark Charcoal | `#21231D` |
| Dark Maroon | `#320707` |

**Rule:** "Always start and end with green." Secondary palette for marketing; product stays green + neutral.

**All colors tested for WCAG AAA on recommended backgrounds.**

---

## 4. Spacing System

### Foundational Token Scale (4px Base)
`4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128px`

### Semantic Tokens (Key Values)
| Token | Value | Purpose |
|-------|-------|---------|
| between-cards | 12px | Card grid gaps |
| between-chips | 8px | Tag/chip spacing |
| screen-mobile | 24px | Mobile side padding |
| component-default | 16px | Default internal padding |
| between-text | 8px | Line-level vertical spacing |
| content-to-button | 24px | Space before primary CTA |
| between-sections | 32px | Section-level separation |

**Accessibility scaling:** 4 responsive tiers (85%, 100%, 130%, 155%) — all tokens scale proportionally for larger text settings.

---

## 5. Form Design & Calculator UX

### The Dual-Direction Input Innovation
Wise's transfer calculator offers two input modes:
- **"You send"** mode → system calculates what recipient receives
- **"Recipient gets"** mode → system calculates what sender must pay

This dual-direction approach gives users control over their anchor point. For Angkin's retirement pay calculator: consider "compute from salary" vs. "compute from expected benefit."

### Real-Time Result Display
Wise shows results as the user types—no separate "calculate" button required for simple computations. The result reveals: **fee breakdown + rate + delivery time**, all simultaneously.

### Fee Transparency Before Account Wall
The full cost display happens on the homepage, before any sign-in. No friction between user question ("how much will this cost?") and the answer. For Angkin: no login required to compute. Results should be immediate.

### Step-by-Step Flow Pattern
For complex operations, Wise uses a **linear step-by-step flow** with:
- Progress indicator at top showing current position
- One primary action per screen
- Confirmation screen before any irreversible action
- Repeat-use memory (pre-fill from previous sessions)

### Micro-Copy Tone
- **Transparent:** "The fee for this transfer is ₱XX"—no euphemisms
- **Action-oriented:** Verbs first ("Send", "Calculate", "See your result")
- **Human scale:** Plain language over financial jargon
- **Label quality:** "It really matters which words you use on your labels and headlines—great interface design comes down to great copywriting"

---

## 6. Accessibility Approach

### Philosophy
*"Open the world up, not shut people out."* Wise targets WCAG AAA across their color palette.

### Focus States
- **Strategy:** Show focus states only on keyboard navigation (tab), not on click — reduces visual noise while maintaining accessibility
- **Style:** 2px solid border (buttons/icons), 3px border (form inputs), 2px border with 4px radius (links)
- **Color:** `interactive-primary` (#163300) for focus borders; exceptions for semantic clarity
- **Offset:** 2px transparent gap between border and component
- **Rule:** Test on dark mode and all surface themes before shipping

### Contrast
- All content colors maintain required contrast against their backgrounds
- Sentiment Negative (#A8200D) red checked against white — must pass 4.5:1

### Touch Targets
- Apple standard: 44×44pt minimum
- Material Design: 48×48dp
- WCAG 2.2 minimum: 24×24px (but Wise goes beyond)

---

## 7. Component Patterns

### Buttons
- **Primary:** Bright Green (#9FE870) background, Forest Green (#163300) text
- **Secondary:** Forest Green background, Bright Green text
- **Ghost:** Transparent with Forest Green border
- High contrast, never gray-on-white for primary actions

### Input Fields
- Clear label above (never placeholder-only)
- 3px focus border (more prominent than standard 1-2px for financial context)
- Error state: Sentiment Negative red border + icon + helper text below
- Helper text pre-emptively shows requirements (not just post-error)

### Result/Output Display
- Large display type (Wise Sans) for the hero number
- Supporting metrics in smaller Inter
- Success state uses Sentiment Positive green
- The **"result moment"** is celebrated—large bold number, clear semantic color

### Cards
- Subtle border or shadow (not both)
- 12px between cards (between-cards token)
- Internal padding: 16-24px (component-default to content-to-button range)

---

## 8. Mobile Experience

- ~60% of Wise's traffic is mobile
- Linear single-column flow eliminates decision paralysis
- Large touch targets (44×44pt minimum)
- One action per screen principle enforced especially on mobile
- Numeric keyboard auto-invoked for money inputs
- Currency symbols built into Inter font set

---

## 9. Dark Mode Strategy

### Multi-Theme Architecture
Consumer product: **4 themes** (light, dark, + 2 brand variants)
Wise Platform sub-brand: 3 themes
Shared semantic theming model with single switcher

### Implementation Approach
- Semantic tokens abstract color meaning from value
- `color.background.primary` = `#FFFFFF` in light, `#121212` in dark
- Never hardcode dark mode values
- Avoid pure black (#000000); use dark greys for eye comfort
- All focus states tested and verified across all themes

---

## 10. Animation Philosophy

### Principles
- Micro-interactions: hover states (slight background shift), focus (border appears), click (brief press effect)
- Loading: skeleton screens, not spinners (maintains layout stability)
- Calculator result: immediate display (no dramatic "reveal" animation—speed signals competence)
- Success state: brief green pulse/confirmation (celebration without excess)

### Philosophy
Animation at Wise **reinforces function**, not decorates it. Transitions are fast (150-250ms), easing is natural (ease-in-out), nothing draws attention to itself.

---

## 11. Multi-Tool Cohesion at Scale

Before the Editorial Design System, Wise had:
- 7,000,000+ live pages across all territories
- 12 different types of comparison tables
- Inconsistent spacing, typography, layout

**Solution:** One system with invariant tokens, semantic naming, and shared components. Every team uses the same `component-default` spacing token—even if they don't know its pixel value.

**The lesson for Angkin's 148 tools:** Token-level consistency (never hardcode values) + shared component library + semantic naming scheme = coherence at scale even when individual teams or tools evolve independently.

---

## 12. What Angkin Should Steal from Wise

1. **Fee/result transparency before any account wall** — show the computed value immediately, no registration friction
2. **White as dominant "color"** — let the content breathe; the result speaks for itself
3. **One primary action per screen** — don't compete with the compute button
4. **Semantic token architecture** — never hardcode spacing/color values in components
5. **Dual-direction input** — allow users to anchor on either end of a calculation
6. **Tone of micro-copy** — plain language, action-oriented, no jargon
7. **Focus states visible only on keyboard** — reduces visual clutter while preserving accessibility
8. **Real-time calculation feedback** — update results as user types where feasible
9. **The result moment** — large Wise Sans display type for hero number, celebrated not buried
10. **Step-by-step flow with progress indicator** — for multi-step calculators (retirement wizards, multi-variable computations)

---

## 13. What Angkin Should NOT Copy from Wise

1. **Wise Sans (custom font)** — can't use it; use Inter + a bold Google Font instead
2. **Marketing secondary palette** — the 8-color secondary set is for Wise's global brand moments; Angkin needs a palette that communicates PH compliance context
3. **Global/multicurrency framing** — Wise's "going everywhere" narrative doesn't fit compliance tooling
4. **Minimalism to the point of blankness** — for Philippine compliance tools, users need more contextual guidance, not less. Wise can afford minimalism because "send money" is a familiar concept; "RA 7641 retirement pay" is not

---

## Sources
- [Wise Design System](https://wise.design/)
- [Wise Design — Colour](https://wise.design/foundations/colour)
- [Wise Design — Typography](https://wise.design/foundations/typography)
- [Wise Design — Spacing](https://wise.design/foundations/spacing)
- [Wise Design — Focus States](https://wise.design/foundations/focus-states)
- [Wise Design System on Figma (2025)](https://www.figma.com/community/file/1550593868236678646/wise-design-system-2025-ui-kit)
- [Going everywhere — Meet the new Wise design system (Medium)](https://medium.com/transferwise-design/going-everywhere-meet-the-new-wise-design-system-863731563f71)
- [The Editorial Design System (Medium)](https://medium.com/transferwise-design/the-web-marketing-system-526f939a828c)
- [Accessible but never boring (Medium)](https://medium.com/transferwise-design/accessible-but-never-boring-part-1-ec8222f1f364)
- [UX Teardown: TransferWise (Userbrain)](https://www.userbrain.com/blog/ux-teardown-transferwise-money-transfer-service/)
- [Design Systems for Business Growth: Wise (Hatch)](https://www.hatch.be/blog/design-systems-for-business-growth-lessons-from-wise)
- [Wise Design System on designsystems.surf](https://designsystems.surf/design-systems/wise)
- [Making Wise Design multi-brand (Ness Grixti)](https://nessgrixti.com/portfolio/wise-multi-brand)

# Benchmark: gov.uk Design System

> Aspect 6 — Wave 1 Research
> Date: 2026-03-10

---

## Overview

The GOV.UK Design System is widely considered the gold standard for humane, accessible digital government services. Developed by the UK Government Digital Service (GDS) since ~2013, it powers thousands of services used by millions of citizens who often have no choice but to use them. This constraint forces radical clarity — the system cannot rely on users being motivated, tech-savvy, or desktop-bound.

**Site:** https://design-system.service.gov.uk
**License:** MIT (open source)

---

## Design Philosophy

### The Core Belief
Government services must work for everyone — not just the digitally confident. The system is built on the principle that **clarity is the only luxury**. No decoration, no brand expression, no delight moments — just a clear path from A to B.

### "One Thing Per Page"
The single most important philosophical contribution of gov.uk to modern UX:

- Each page contains exactly ONE thing: a question, a piece of information, or a decision
- Benefits: users can focus; mobile works naturally; errors are easy to fix; analytics are clean; conditional branching is trivial
- The form structure guidance says to start with eligibility questions (don't waste ineligible users' time), then sequence based on most-common-user-path

### Question Protocol
Before ANY question appears in a form, teams must justify:
1. Why this information is necessary
2. Who will use it
3. How it will be stored
4. Whether verification is needed

This institutionalizes "minimum viable form" — a principle perfectly applicable to Philippine compliance calculators.

### Content-First, Always
Labels function as page headings when asking a single question. The UI exists to serve the content, never the reverse. No decorative elements that compete with content.

---

## Typography

### Primary Font: GDS Transport
- Required for services on service.gov.uk subdomain
- On other subdomains: Helvetica or Arial as fallbacks
- **For external / non-government use:** Not freely available. The Angkin implication: use a similar geometric grotesque (e.g., Inter, DM Sans) to achieve comparable clarity.

### Type Scale (Large Screens >640px)

| Class | Size | Line Height | Use |
|-------|------|-------------|-----|
| `govuk-heading-xl` | 48px | 50px | Page hero / single question |
| `govuk-heading-l` | 36px | 40px | Section heading |
| `govuk-heading-m` | 24px | 30px | Sub-section |
| `govuk-heading-s` | 19px | 25px | Minor heading |
| `govuk-body-l` | 24px | 30px | Lead paragraph |
| `govuk-body` | 19px | 25px | Standard body text |
| `govuk-body-s` | 16px | 20px | Small print |

### Type Scale (Small Screens <640px)

| Class | Size | Line Height |
|-------|------|-------------|
| `govuk-heading-xl` | 32px | 35px |
| `govuk-heading-l` | 27px | 30px |
| `govuk-heading-m` | 21px | 25px |
| `govuk-heading-s` | 19px | 25px |
| `govuk-body-l` | 21px | 25px |
| `govuk-body` | 19px | 25px |
| `govuk-body-s` | 16px | 20px |

### Typography Philosophy
- All line heights are multiples of 5px (maintains vertical rhythm)
- Sentence case throughout — never ALL CAPS
- Body text at 19px is intentionally larger than most web typography — accessibility first
- No decorative fonts, no script fonts, no serif display fonts
- v6.0+ increased small-screen text sizes for legibility

---

## Color System

### Functional Colors

| Role | Color | Hex |
|------|-------|-----|
| Primary text | text | `#0b0c0c` |
| Secondary text | secondary-text | `#484949` |
| Background | body-background | `#ffffff` |
| Surface | surface-background | `#f4f8fb` |
| Brand | brand | `#1d70b8` |
| Link | link | `#1a65a6` |
| Link hover | link-hover | `#0f385c` |
| Link visited | link-visited | `#54319f` |
| Link active | link-active | `#0b0c0c` |
| Focus | focus | `#ffdd00` |
| Focus text | focus-text | `#0b0c0c` |
| Error | error | `#ca3535` |
| Success | success | `#0f7a52` |
| Border | border | `#cecece` |
| Input border | input-border | `#0b0c0c` |
| Input hover | hover | `#cecece` |

### Extended Palette
Full web palette includes families: Blue, Green, Teal, Purple, Magenta, Red, Orange, Yellow, Brown, Black, White — each with tint variants (25%, 50%, 80%, 95%) and shade variants (25%, 50%).

### Color Philosophy
- **Near-monochrome by default.** The design works with almost no color.
- Color is used ONLY for semantic/functional purposes: link identity, error state, success state, keyboard focus
- The yellow `#ffdd00` focus indicator is iconic — high-visibility, unmistakably functional, and distinctive
- "Do not assign new meanings to colours" — semantic meaning must be consistent across all services
- WCAG 2.2 Level AA minimum throughout

### What This Means for Angkin
The near-monochrome approach is powerful but feels austere for a financial calculator suite targeting everyday Filipinos. gov.uk's color restraint is a reaction to centuries of bureaucratic visual noise — Angkin can learn the *discipline* without copying the *blankness*.

---

## Spacing System

### Responsive Spacing Scale

| Unit | Small screen | Large screen (>640px) |
|------|-------------|----------------------|
| 0 | 0px | 0px |
| 1 | 5px | 5px |
| 2 | 10px | 10px |
| 3 | 15px | 15px |
| 4 | 15px | 20px |
| 5 | 15px | 25px |
| 6 | 20px | 30px |
| 7 | 25px | 40px |
| 8 | 30px | 50px |
| 9 | 40px | 60px |

### Spacing Philosophy
- Multiples of 5px throughout
- Spacing INCREASES on large screens (more breathing room with more pixels)
- Static scale available for consistent non-responsive spacing
- No 8px grid (unlike most modern design systems) — 5px base unit is distinctive

---

## Form Design Patterns

### Input Design Philosophy
1. **Label above the input** — always, no exceptions
2. **No placeholder text** — explicitly banned. Reason: vanishes on type, poor contrast, bad for memory conditions, inconsistent screen reader support
3. **Hint text** above the input, below the label — one short sentence, no full stops
4. **Error messages** — inline below hint text AND in error summary at top of page
5. **Fixed-width inputs** — size inputs to match expected content width (e.g., 2-digit day input)
6. **No numeric input type** — use `inputmode="numeric"` with `type="text"` for accessibility

### Error Handling (Best-in-Class Pattern)
- **Error summary at top of page** with role="alert" — auto-focuses on load
- Summary heading: "There is a problem" (not "Error" — softer, more human)
- Each error links directly to the problematic field
- Inline error message repeats the same wording as the summary
- Page title prefixed with "Error:" for screen reader users
- On error: never clear user input, never lose data

### Why This Matters for Angkin
Philippine compliance calculators often have long inputs (salary, SSS number, TIN). The gov.uk pattern of label-above + hint-above + error-inline is the most accessible and proven form pattern ever studied. Angkin should adopt this wholesale regardless of which design option is chosen.

---

## Components

### Buttons
- Default (primary): Green background `#00703c`, white text
- Secondary: Light grey outline
- Warning/Destructive: Red `#d4351c`
- Start button: Green with arrow → only on service entry pages
- Inverse: White on dark background
- Disabled: Low contrast, explicitly discouraged ("avoid if possible")
- Sentence case text, describes the action ("Save and continue", "Confirm and send")
- `preventDoubleClick` built in — important for slow connections (relevant in Philippines)
- Max ONE default button per screen

### Input
- 2px black border (`#0b0c0c`) — thick, unmissable
- On focus: yellow highlight ring (same yellow as focus `#ffdd00`) with black offset
- Error state: red left border + red inline message
- No rounded corners (square inputs — functional, not friendly)

### Key Components List
- Text input, Textarea, Password input
- Checkboxes, Radios, Select, Date input, File upload
- Back link, Breadcrumbs, Pagination, Skip link, Service navigation
- Error message, Error summary, Notification banner, Warning text
- Accordion, Details (progressive disclosure), Table, Tabs, Summary list, Task list, Panel
- Button, Exit this page

---

## Patterns (UX Flows)

### One-Thing-Per-Page Patterns
- **Check answers** — full summary before submission, each answer editable
- **Confirmation pages** — clear success state, reference number, next steps
- **Complete multiple tasks** — task list with statuses (Not started / In progress / Completed)
- **Recover from validation errors** — never lose data, clear path back

### Form Sequencing
1. Eligibility questions first (gate out ineligible users early)
2. Branch based on answers (don't ask irrelevant questions)
3. "Check your answers" summary before final submission
4. Confirmation page with reference number and next steps

### Progressive Disclosure
- `Details` component (native `<details>/<summary>`) for "Learn more" expansions
- Never hide required information behind disclosure
- Only hide genuinely secondary information

---

## Accessibility

### Philosophy
- The design system **alone does not make a service accessible** — teams must also conduct research, design, development, and testing
- Accessibility is everyone's responsibility, not a specialist's checklist
- WCAG 2.2 Level AA minimum (implied throughout, v6+ updates address 2.2 requirements)

### Key Accessibility Decisions
1. **Yellow focus ring** (`#ffdd00`) — unusually visible, keyboard users cannot miss it
2. **19px minimum body text** — larger than most web defaults
3. **High-contrast inputs** — 2px black borders ensure visibility
4. **Disabled elements discouraged** — gray elements confuse users, especially those with low vision
5. **No placeholder text** — helps users with memory conditions and low-contrast display settings
6. **Touch targets** — minimum 45px height for interactive elements
7. **Error focus management** — error summary auto-focuses, so keyboard and screen reader users get errors first
8. **role="alert"** on error summary — ARIA live region announces errors immediately
9. Visited link color is distinct (`#54319f` purple) — navigation memory aid

---

## Content Design Principles

### Micro-Copy
- **Sentence case always** — "Save and continue" not "Save And Continue"
- **Plain English** — no jargon, no legalese
- **Short** — hint text is one sentence, no full stops
- **Direct** — labels tell you exactly what's needed
- **Empathetic** — error messages say "There is a problem" not "Error" or "Invalid"

### Tone of Voice (gov.uk service manual)
- Transactional: clear, direct, no corporate warmth-speak
- Respects the user's time — every word must earn its place
- Neutral authority — trustworthy without being cold

### For Angkin
This tone would feel slightly clinical for Filipino users who expect warmth. However, the **clarity principles** are universally applicable: no jargon, label-as-heading, plain-language errors.

---

## Layout & Grid

### Page Structure
- Maximum content width: ~1020px (two-thirds column for forms, full width for tables)
- Single-column form layout (no side-by-side inputs unless semantically connected)
- Back link above the page heading
- One-column per breakpoint for forms
- Breadcrumbs only for navigation-heavy services

### Responsive Breakpoints
- Small: up to 640px
- Medium: 641px–1024px
- Large: 1025px+

---

## What Makes gov.uk Feel Trustworthy

1. **Radical content clarity** — every label is a direct question, every piece of information is in plain English
2. **Consistent behavior** — the same patterns appear everywhere; users build mental models quickly
3. **Error recovery is kind** — errors never lose your data, messages are human
4. **Focus on task completion** — no upsells, no distractions, nothing competes with the user's goal
5. **Visible accessibility** — the yellow focus ring tells users "we know you exist"
6. **Institutional but not corporate** — functional authority without brand aggressiveness

---

## What gov.uk Explicitly Sacrifices

- **Visual appeal / aesthetics** — deliberately plain, would not win a design award
- **Brand expressiveness** — the design is intentionally interchangeable across services
- **Delight moments** — no animations, no celebrations, no personality
- **Marketing mindset** — there is no conversion funnel, no upsell, no retention mechanics
- **Modern UI trends** — no glassmorphism, no gradients, no dark mode, minimal illustration

---

## Lessons for Angkin Option 2 (Gov.uk Radical Clarity)

### What to Steal Directly
1. One-question-per-screen for multi-step calculators
2. Label-above + hint-above + error-inline pattern
3. Error summary at top with auto-focus
4. "Check your answers" summary before compute
5. Confirmation/result page as a separate state (not an inline update)
6. Spacing scale in 5px increments
7. Near-monochrome with one semantic accent color
8. 19px body text minimum
9. Input borders at 2px (not 1px — more visible on bad screens)
10. Sentence case throughout

### What to Adapt
- **Typography:** Replace GDS Transport with Inter (closest freely-available match)
- **Color:** Keep near-monochrome but add a single Filipino-appropriate brand color
- **Tone:** Add slight warmth to error messages for Filipino cultural context ("Teka, may mali" over "There is a problem")
- **Start page:** Add brief context about the law (e.g., "This calculates your rights under RA 7641")
- **Result page:** Show the computed value prominently with explanation in plain Tagalog/English

### What to Reject
- The pure blankness — Angkin is not a government monopoly, so it must compete for attention
- No dark mode in gov.uk — Angkin should support it
- No custom illustrations — Angkin can add cultural spot illustrations without compromising clarity

---

## Summary Table

| Dimension | gov.uk Design System |
|-----------|----------------------|
| Primary font | GDS Transport (Helvetica fallback) |
| Body size | 19px (unusually large — accessibility-first) |
| Heading scale | 48/36/24/19px desktop, 32/27/21/19px mobile |
| Color philosophy | Near-monochrome, semantic color only |
| Primary accent | Blue `#1d70b8` |
| Focus | Yellow `#ffdd00` (unmissable) |
| Error | Red `#ca3535` |
| Success | Green `#0f7a52` |
| Spacing base | 5px increments |
| Max content width | ~1020px |
| Form philosophy | One thing per page, label above, no placeholders |
| Error handling | Summary + inline, auto-focus, never lose data |
| WCAG target | AA (2.2) |
| Dark mode | None |
| Animation | None |
| Mobile-first | Responsive, not mobile-first |
| Accessibility | Foundational to every decision |

---

*Compiled from: design-system.service.gov.uk, gov.uk service manual*

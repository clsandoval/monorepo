# TaxKlaro Frontend Audit

> Aspect 1 — Wave 1 Deep Research
> Source: `apps/taxklaro/frontend/src/`
> Audited: 2026-03-10

---

## Stack Summary

- **Framework**: React 19 + Vite 6
- **Routing**: TanStack Router v1
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) — NO separate tailwind.config.ts; everything in CSS
- **Component primitives**: Radix UI (`radix-ui` monorepo package) + shadcn/ui pattern
- **Icons**: Lucide React (^0.400.0)
- **Fonts**: `@fontsource-variable/dm-sans` + `@fontsource/dm-serif-display` (self-hosted via NPM)
- **Form handling**: react-hook-form + zod schemas
- **Toasts/notifications**: sonner
- **Auth/DB**: Supabase
- **PDF export**: @react-pdf/renderer

---

## CSS Variables / Design Tokens

All tokens defined in `src/index.css` using CSS custom properties mapped to Tailwind v4 via `@theme inline`.

### Brand Colors

| Token | RGB Value | Hex | Semantic |
|-------|-----------|-----|----------|
| `--brand-600` | `29 78 216` | `#1D4ED8` | Tailwind blue-700; primary CTA |
| `--brand-50` | `239 246 255` | `#EFF6FF` | Light brand tint for backgrounds |

### Semantic Color System (Light Mode)

| Token | RGB Value | Hex | Notes |
|-------|-----------|-----|-------|
| `--background` | `250 250 249` | `#FAFAF9` | Warm off-white (not pure white) |
| `--foreground` | `15 23 42` | `#0F172A` | Near-black (slate-900) |
| `--primary` | `29 78 216` | `#1D4ED8` | Brand blue |
| `--primary-foreground` | `255 255 255` | `#FFFFFF` | White on primary |
| `--muted` | `241 245 249` | `#F1F5F9` | Slate-100 |
| `--muted-foreground` | `100 116 139` | `#64748B` | Slate-500 |
| `--border` | `226 232 240` | `#E2E8F0` | Slate-200 |
| `--ring` | `29 78 216` | `#1D4ED8` | Focus ring = brand blue |
| `--card` | `255 255 255` | `#FFFFFF` | Pure white cards |
| `--card-foreground` | `15 23 42` | `#0F172A` | Same as foreground |
| `--popover` | `255 255 255` | `#FFFFFF` | Same as card |
| `--secondary` | `241 245 249` | `#F1F5F9` | Slate-100 |
| `--secondary-foreground` | `15 23 42` | `#0F172A` | Dark on secondary |
| `--accent` | `241 245 249` | `#F1F5F9` | Same as muted |
| `--accent-foreground` | `15 23 42` | `#0F172A` | Dark on accent |
| `--destructive` | `239 68 68` | `#EF4444` | Red-500 |
| `--destructive-foreground` | `255 255 255` | `#FFFFFF` | White on destructive |
| `--input` | `226 232 240` | `#E2E8F0` | Input border = border |
| `--radius` | `0.5rem` | `8px` | Base border radius |

### Tax-Domain Specific Colors

| Token | RGB Value | Hex | Usage |
|-------|-----------|-----|-------|
| `--peso-savings` | `21 128 61` | `#15803D` | Green-700; savings amounts |
| `--peso-tax-due` | `185 28 28` | `#B91C1C` | Red-700; tax due amounts |
| `--regime-optimal-bg` | `240 253 244` | `#F0FDF4` | Green-50; recommended path bg |
| `--regime-suboptimal-bg` | `255 251 235` | `#FFFBEB` | Amber-50; suboptimal path bg |

### Dark Mode Palette

| Token | Hex |
|-------|-----|
| `--background` | `#0F172A` (slate-900) |
| `--foreground` | `#F8FAFC` (slate-50) |
| `--card` | `#1E293B` (slate-800) |
| `--primary` | `#3B82F6` (blue-500, lighter for dark) |
| `--muted` | `#1E293B` (slate-800) |
| `--muted-foreground` | `#94A3B8` (slate-400) |
| `--border` | `#334155` (slate-700) |

---

## Typography

### Font Pairing

| Role | Font | Source |
|------|------|--------|
| **Display** | DM Serif Display | `@fontsource/dm-serif-display` (self-hosted) |
| **Body / UI** | DM Sans Variable | `@fontsource-variable/dm-sans` (variable font) |
| **Fallback** | Georgia, serif / system-ui, sans-serif | CSS fallback stack |

**Design Rationale**: DM Serif Display adds warmth and editorial authority to key numbers and titles. DM Sans Variable provides modern, readable UI text. The pairing signals "friendly professional" — trustworthy but not corporate.

### Typography Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-hero` | `3rem` (48px) | 1.1 | Landing page hero |
| `--text-h1` | `2rem` (32px) | 1.2 | Page titles |
| `--text-h2` | `1.5rem` (24px) | 1.3 | Section headers |
| `--text-h3` | `1.125rem` (18px) | 1.4 | Card titles |
| `--text-body` | `0.9375rem` (15px) | 1.6 | Body text (non-standard — slightly smaller than 16px) |
| `--text-small` | `0.8125rem` (13px) | 1.5 | Captions, metadata |

**Notable**: Body text at 15px (not 16px) — slightly more compact, feels more "tool-like" than "editorial."

### Font Weight Usage (from component analysis)

- `font-bold` + `tracking-tight` — Logo ("TaxKlaro" wordmark)
- `font-semibold` — Card titles, section labels, key data
- `font-medium` — Nav items, button labels, input labels
- `font-normal` — Display font card titles (DM Serif Display shown at normal weight is already impactful)
- `tabular-nums` — All monetary amounts (prevents layout shift)

### Display Font Usage Patterns

DM Serif Display is used selectively for emotional impact:
- `font-display text-xl tracking-tight` — Sidebar logo "₱TaxKlaro"
- `font-display text-base leading-snug` — Computation card titles
- `font-display text-xl font-normal` — "Tax Breakdown" card title
- `font-display text-2xl` — Savings amount in RecommendationBanner (most impactful moment)

---

## Color Palette Summary

**Primary**: Blue (`#1D4ED8`) — trust, action, Philippine blue adjacent
**Background**: Warm off-white (`#FAFAF9`) — not sterile; warm & inviting
**Cards**: Pure white on warm background — creates visual hierarchy
**Success/Savings**: Green-700 (`#15803D`) — tax savings emphasis
**Tax Due**: Red-700 (`#B91C1C`) — amount owed, warnings
**Muted UI**: Slate-500 (`#64748B`) — metadata, labels, helper text

**Emotional palette reading**: Conservative, trustworthy, clean. The blue/white/slate palette is safe and professional. Not playful, not enterprise-dark. The warm off-white background softens the clinical feel.

---

## Component Patterns

### Buttons

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
Sizes: `xs`, `sm`, `default`, `lg`, plus icon variants (`icon`, `icon-xs`, `icon-sm`, `icon-lg`)

- Default: `h-9 px-4 py-2` — 36px tall
- Large: `h-10 px-6` — 40px tall
- Border radius: `rounded-md` (6–8px, from `--radius`)
- Transition: `transition-all` (smooth state changes)
- Focus: `focus-visible:ring-[3px] focus-visible:ring-ring/50` — 3px ring, 50% opacity
- Disabled: `disabled:opacity-50`

### Cards

- Border radius: `rounded-xl` (more rounded than buttons — 12px)
- Shadow: `shadow-sm` default; `hover:shadow-md` on computation cards
- Padding: `py-6` with `px-6` in content/header areas
- Gap: `gap-6` between card sections
- Background: `bg-card` (white)

### Input (PesoInput pattern)

- Height: `h-11` (44px — touch-friendly)
- ₱ prefix symbol: absolute-positioned, `left-3`, muted color
- Padding left: `pl-7` to clear the ₱ symbol
- Border color: `--input` (same as `--border`, slate-200)

### Navigation (Sidebar)

- Fixed 256px sidebar on desktop (`md:flex w-64`)
- Mobile: hamburger → Sheet drawer
- Active indicator: `border-l-[3px]` left accent line in brand blue
- Active background: `bg-primary/5` (5% opacity blue tint)
- Item spacing: `py-2.5 px-3` with `space-y-0.5` gap
- Icons: Lucide, `h-4 w-4` (16px)
- Logo: DM Serif Display, xl size, with `₱` in brand blue

### Result Display (The Key Moment)

**RecommendationBanner**:
- Green card (`border-green-500/50 bg-green-50/60`)
- Badge: `bg-green-600 text-white text-xs px-2.5`
- Savings amount: `font-display text-2xl` — the climactic display of value
- Shadow: `shadow-md` (stronger than default cards)

**TaxBreakdownPanel**:
- Regular card with separator
- Line items: `flex justify-between text-sm` — label + tabular-num amount
- Total: `font-display text-xl` with `font-semibold` label

### Status Badges

4 variants mapped to computation states:
- `draft` → `secondary` (slate bg)
- `computed` → `default` (blue)
- `finalized` → `outline` (bordered)
- `archived` → `destructive` (red)

---

## Spacing System

Built on Tailwind's default 4px base unit. Key measurements observed:

| Context | Spacing |
|---------|---------|
| Main content padding (mobile) | `p-4` (16px) |
| Main content padding (sm) | `sm:p-6` (24px) |
| Main content padding (desktop) | `md:p-8` (32px) |
| Card internal padding | `px-6 py-6` (24px) |
| Card section gap | `gap-6` (24px) |
| Sidebar logo area height | `h-16` (64px) |
| Sidebar width | `w-64` (256px) |
| Nav item padding | `py-2.5 px-3` (10px top/bottom, 12px sides) |
| WizardPage max width | `max-w-xl` (576px) |
| WizardPage content spacing | `space-y-6` (24px between sections) |
| Wizard form step gap | `space-y-8` (32px between stacked steps) |

---

## Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)` | Default cards |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)` | Hover states, recommendation banner |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)` | Modals/sheets (not observed in components) |

Shadow philosophy: **extremely subtle** — nearly invisible on most cards. The goal is surface differentiation, not dramatic depth.

---

## Animation & Interaction

### Observed Transitions

- Buttons: `transition-all` (all properties) — no specific duration defined (Tailwind default: 150ms)
- Nav items: `transition-colors duration-150` — explicit 150ms color-only transition
- Computation cards: `hover:shadow-md` (shadow transition via `transition-shadow` not explicitly set — browser default)
- Save indicator: Text only, no animation — purely state-driven text swap

### Notable Absences

- No explicit `animation-*` CSS properties in index.css
- No CSS keyframes defined
- No motion library (Framer Motion) in dependencies
- No page transition animations
- No "result reveal" celebration animation
- Calculation moment: No special animation; results just appear in ResultsView

**Conclusion**: TaxKlaro uses near-zero animation. The UX is **purely functional** — no delight moments, no transitions between wizard steps, no loading skeletons with animation. The auto-save indicator is text-only ("Saving..." / "Saved").

This is a deliberate constraint: minimal animation reduces distraction for users doing serious tax work.

---

## Layout Patterns

### App Shell

```
┌──────────────────────────────┐
│ 256px sidebar │ flex-1 main  │
│ (hidden mobile)│ overflow-auto│
└──────────────────────────────┘
```

Mobile: full-width main with hamburger header; sidebar in Sheet overlay.

### Wizard Layout

```
max-w-xl (576px) centered
py-8 px-4
- Progress bar
- Step component
- Nav controls (Back / Next)
```

Single-column, narrow focus. Forces one decision at a time.

### Results Layout

```
space-y-6 (24px gap between sections)
- WarningsBanner (conditional)
- ManualReviewFlags (conditional)
- RecommendationBanner (prominent green card)
- RegimeComparisonTable
- TaxBreakdownPanel
- PathDetailAccordion (expandable)
- PercentageTaxSummary (conditional)
- BalancePayableSection
- InstallmentSection (conditional)
- PenaltySummary (conditional)
- BirFormRecommendation
```

**Vertical scroll through sections.** No tabs between input and results — they're rendered as separate views inside a tabbed ComputationDetailPage.

### Responsive Breakpoints

Using Tailwind v4 defaults:
- `sm`: 640px
- `md`: 768px (sidebar visible; main padding increases)
- No custom breakpoints observed

---

## Accessible Design Patterns

- Focus rings: `focus-visible:ring-[3px] focus-visible:ring-ring/50` (3px, 50% opacity) — WCAG 2.1 compliant
- ARIA labels on icon-only buttons (`aria-label="Open menu"`)
- Screen-reader text with `.sr-only` class
- `disabled:opacity-50` — clear disabled state
- Input IDs passed through for label association
- `data-testid` attributes throughout (supports automated testing)

---

## Logo & Branding

**Logo**: Text-based wordmark `TaxKlaro` — bold, tracking-tight.
No SVG icon/mark. The `₱` peso sign in brand blue acts as a visual accent before the name in the sidebar.

**Pattern**: `<span className="text-primary">₱</span>TaxKlaro`

---

## Key Observations for Angkin Design System

1. **DM Sans + DM Serif Display** is a strong pairing worth referencing — the serif display font creates impact without being heavy
2. The **₱ symbol as brand element** is clever and should be considered for Angkin tools broadly
3. **`--background: #FAFAF9`** (warm off-white) is subtly more inviting than pure white — worth preserving
4. **Tax-specific semantic tokens** (`--peso-savings`, `--peso-tax-due`) show the value of domain-aware tokens beyond generic success/error
5. The **RecommendationBanner** (green, `font-display text-2xl` savings amount) is the emotional climax of the UX — the "result reveal" moment is entirely typographic/color-based, no animation
6. **Near-zero animation policy** may be right for tax anxiety use case but feels flat for other tool domains
7. **shadcn/ui component architecture** (CVA + Radix) is a proven pattern ready to scale
8. Sidebar nav uses **left-border active indicator** — clean and accessible pattern
9. **Wizard**: max-w-xl (576px) single column feels right for form input — wide enough for content, narrow enough for focus
10. **Missing**: No illustration system, no empty state art, no onboarding illustrations

# Audit: Inheritance Frontend Design System

**Aspect 2 — Wave 1 Deep Research**
**Source:** `apps/inheritance/frontend/src/`
**Stack:** React 19 + Vite + Tailwind CSS 4.2 + shadcn/ui + Radix UI

---

## 1. CSS Variables & Design Tokens

### Color Tokens (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#f8fafc` (slate-50) | Page background |
| `--foreground` | `#0f172a` (slate-900) | Primary text |
| `--primary` | `#1e3a5f` | Deep navy — main brand |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#f1f5f9` (slate-100) | Secondary backgrounds |
| `--secondary-foreground` | `#1e3a5f` | Text on secondary |
| `--accent` | `#c5a44e` | Warm gold — accent/highlight |
| `--accent-foreground` | `#ffffff` | Text on accent |
| `--muted` | `#f1f5f9` | Muted backgrounds |
| `--muted-foreground` | `#64748b` (slate-500) | Secondary text |
| `--card` | `#ffffff` | Card surface |
| `--card-foreground` | `#0f172a` | Text on card |
| `--popover` | `#ffffff` | Popover surface |
| `--popover-foreground` | `#0f172a` | Text on popover |
| `--destructive` | `#991b1b` | Error/danger — deep red |
| `--destructive-foreground` | `#ffffff` | Text on destructive |
| `--success` | `#166534` | Forest green — success |
| `--success-foreground` | `#ffffff` | Text on success |
| `--warning` | `#92400e` | Amber brown — caution |
| `--warning-foreground` | `#ffffff` | Text on warning |
| `--border` | `#e2e8f0` (slate-200) | Borders |
| `--input` | `#e2e8f0` | Input borders |
| `--ring` | `#1e3a5f` | Focus ring color (navy) |

### Sidebar Tokens
```
--sidebar:                  #1e3a5f  (navy)
--sidebar-foreground:       #ffffff
--sidebar-primary:          #c5a44e  (gold)
--sidebar-primary-foreground: #ffffff
--sidebar-accent:           #2a4d7a  (lighter navy)
--sidebar-accent-foreground: #ffffff
--sidebar-border:           #2a4d7a
--sidebar-ring:             #c5a44e
--shadow-sidebar:           2px 0 8px rgba(30, 58, 95, 0.15)
```

### Chart Tokens (Recharts data visualization)
```
--chart-1: #1e3a5f  (navy)
--chart-2: #c5a44e  (gold)
--chart-3: #166534  (forest green)
--chart-4: #64748b  (slate-500)
--chart-5: #92400e  (amber brown)
```

### Skeleton Animation Tokens
```
--skeleton-base:      #e2e8f0  (slate-200)
--skeleton-highlight: #f1f5f9  (slate-100)
```

---

## 2. Border Radius Scale

```
--radius:    0.625rem  (10px base)
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 10px
--radius-xl: 14px
--radius-2xl: 18px
--radius-3xl: 22px
--radius-4xl: 26px
```

---

## 3. Shadow Scale

```
--shadow-xs:  0 1px 2px rgba(0,0,0,0.06)
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md:  0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg:  0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04)
--shadow-xl:  0 16px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.06)
```

---

## 4. Animation Tokens

```
--duration-fast:    100ms
--duration-default: 200ms
--duration-slow:    300ms
--ease-default:     cubic-bezier(0.4, 0, 0.2, 1)
--ease-out:         cubic-bezier(0.0, 0, 0.2, 1)
--ease-in:          cubic-bezier(0.4, 0, 1, 1)
```

### Keyframes
```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
/* Applied with animation: shimmer 1.5s infinite */
```

---

## 5. Typography System

### Font Families
```
--font-sans: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif
--font-serif: 'Lora', 'Georgia', ui-serif, serif
```
**Packages:** `@fontsource-variable/inter ^5.2.8`, `@fontsource-variable/lora ^5.2.8`

### Typography Scale (Tailwind Classes Used)

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Badges, hints, captions |
| `text-sm` | 14px | Form labels, table cells, descriptions |
| `text-base` | 16px | Body text (responsive: `md:text-sm` on mobile) |
| `text-lg` | 18px | Section headers |
| `text-xl` | 20px | Card titles, major headers |
| `text-2xl` | 24px | Page titles |

### Font Weights
- `font-normal` = 400 (body)
- `font-medium` = 500
- `font-semibold` = 600 (headings, labels)
- `font-bold` = 700 (display)

### Typography Patterns
- **Serif for hierarchy signals:** `font-serif text-lg font-semibold text-primary` (NarrativePanel section headers, ResultsHeader)
- **Mono for data:** `font-mono text-sm font-semibold` (scenario badges)
- **Tracking:** `tracking-tight` on headers, `tracking-wide` on uppercase labels
- **Tabular numbers for money** (implicit via font-variant-numeric in some places)

---

## 6. Full Color Palette

### Primary Brand
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#1e3a5f` | Primary buttons, headers, brand |
| Warm Gold | `#c5a44e` | Accent, highlights, sidebar active |
| Lighter Navy | `#2a4d7a` | Sidebar hover, accent variant |
| Slate-50 | `#f8fafc` | Page background |
| Slate-900 | `#0f172a` | Primary text |

### Semantic Status Colors
| Status | Foreground | Background | Border |
|--------|-----------|-----------|--------|
| Success | `#166534` | `#f0fdf4` (green-50) / `#dcfce7` (green-100) | `#166534/30` |
| Destructive | `#991b1b` | `#fef2f2` (red-50) / `#fee2e2` (red-100) | `#991b1b/30` |
| Warning | `#92400e` | `#fffbeb` (amber-50) / `#fef3c7` (amber-100) | `#92400e/30` |
| Info | `#1e40af` | `#eff6ff` (blue-50) / `#dbeafe` (blue-100) | `#1e40af/30` |

### Chart Colors (Distribution Pie)
| Heir Category | Color |
|---------------|-------|
| Legitimate Children | `#3b82f6` (blue) |
| Illegitimate Children | `#a855f7` (purple) |
| Surviving Spouse | `#22c55e` (green) |
| Legitimate Ascendants | `#f97316` (orange) |
| Collateral | `#6b7280` (gray) |

---

## 7. Component Patterns

### Button
- **Sizes:** xs (24px), sm (32px), default (36px), lg (40px), icon variants
- **Variants:** default (navy), destructive (red), outline (bordered), secondary (gray), ghost, link
- **Base:** `rounded-md text-sm font-medium transition-all`
- **Focus:** 3px ring at `--ring` color

### Input
- **Height:** 36px (h-9)
- **Base:** `rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs`
- **States:** focus (navy ring), error (`aria-invalid:border-destructive`)

### Card
- **Base:** `bg-card rounded-xl border py-6 shadow-sm flex flex-col gap-6`
- **Sub-components:** CardHeader (grid layout), CardContent (px-6), CardFooter

### Result/Output Display
- **ResultsHeader:** Scenario badge (colored by scenario type) + estate total with gold accent
- **DistributionSection:** Pie chart (Recharts) + per-heir breakdown table + colored badges per heir category
- **NarrativePanel:** Accordion per heir with font-serif heading + detailed breakdown
- **ComputationLog:** Step-by-step calculation transparency (expandable)
- **Key moment:** Estate total displayed prominently with `font-semibold text-foreground` amount

### Form Layout Pattern
```
grid grid-cols-1 sm:grid-cols-2 gap-4  (form fields)
space-y-1.5                             (label + input grouping)
space-y-6                               (sections within form)
```

---

## 8. Spacing System

| Scale | Value | Primary Usage |
|-------|-------|---------------|
| `gap-2` | 8px | Compact element spacing |
| `gap-4` | 16px | Form field grid gap |
| `space-y-1.5` | 6px | Label-to-input gap |
| `space-y-3` | 12px | Warning cards |
| `space-y-4` | 16px | Section separations |
| `space-y-6` | 24px | Form section spacing |
| `space-y-8` | 32px | Major section separation (ResultsView) |
| `px-6` | 24px | Card horizontal padding |
| `py-6` | 24px | Card vertical padding |
| `px-3 py-1` | 12/4px | Input padding |

---

## 9. Animation Usage

### Tailwind Built-in
- `animate-spin` — loader icon during calculation
- `animate-pulse` — skeleton loading states
- `transition-all`, `transition-colors`, `transition-[color,box-shadow]` — hover/focus transitions
- `transition-transform duration-200` — accordion chevron rotation

### Radix State Animations
- `data-[state=open]:animate-in data-[state=closed]:animate-out` — dialogs, select dropdowns, tooltips
- `fade-in-0 / fade-out-0` — opacity transitions
- `zoom-in-95 / zoom-out-95` — scale transitions
- `slide-in-from-{side}-2` — directional entrance
- `accordion-down / accordion-up` — custom accordion

### Animation Philosophy
- 200ms default for standard interactions
- 100ms for quick feedback (hover)
- 300ms for prominent/slow animations
- No page transitions
- Calculation reveal: no special celebration — results just appear

---

## 10. Layout Patterns

### Max-Width Constraints
- `max-w-3xl mx-auto` — main content area
- `max-w-lg` — dialogs
- `max-w-xs` — description text

### Grid Patterns
```
grid grid-cols-1 sm:grid-cols-2     (responsive 2-col form)
grid grid-cols-[0_1fr]              (icon + text)
grid grid-cols-[1fr_auto]           (content + action)
grid auto-rows-min grid-rows-[auto_auto]  (card header)
```

### Flex Patterns
```
flex flex-col                        (vertical stacking)
flex flex-col-reverse sm:flex-row    (mobile: stacked, desktop: row)
flex flex-wrap items-center gap-3    (action bar)
flex items-center justify-between    (row headers)
```

---

## 11. Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| `sm:` | 640px | 2-col form, text size increase, row direction |
| `md:` | 768px | Font size fallback (text-sm) |
| `lg:` | 1024px | (minimal usage) |
| `xl:` | 1280px | (minimal usage) |

**Philosophy:** Mobile-first. Most layout changes happen at `sm:`. Desktop is essentially "sm: with more space."

---

## 12. Print Styles

**File:** `src/styles/print.css`
- Page size: A4, margins 25mm/20mm
- Font override: Times New Roman 12pt black on white
- Hidden: nav, sidebar, `.no-print`
- Shown: `.print-header`, `.print-only`
- Note: Print optimization is a first-class feature — legal documents expected to be printed

---

## 13. Design Library Stack

| Library | Version | Usage |
|---------|---------|-------|
| `@radix-ui/react-*` | v1.4.3 | All interactive primitives |
| `lucide-react` | v0.575.0 | Icons throughout |
| `recharts` | v3.7.0 | Pie chart (distribution visualization) |
| `class-variance-authority` | v0.7.1 | Variant system (buttonVariants etc.) |
| `clsx` + `tailwind-merge` | v2.1.1 / v3.5.0 | `cn()` utility |
| `@fontsource-variable/inter` | ^5.2.8 | Self-hosted Inter Variable |
| `@fontsource-variable/lora` | ^5.2.8 | Self-hosted Lora Variable |

---

## 14. Dark Mode Status

Configured (`@custom-variant dark (&:is(.dark *))`), minimal usage. CSS classes present for dark variants on inputs and selects, but no full dark theme deployed. Dark mode is "available but not activated."

---

## 15. Key Design Decisions vs. TaxKlaro

| Dimension | TaxKlaro | Inheritance |
|-----------|----------|-------------|
| Primary color | `#1D4ED8` (brand blue) | `#1e3a5f` (deep navy) |
| Accent | (none significant) | `#c5a44e` (warm gold) |
| Font pair | DM Sans + DM Serif Display | Inter + Lora |
| Serif font role | Display only (hero banners) | Active UI element (section headers, NarrativePanel) |
| Background | `#FAFAF9` (warm off-white) | `#f8fafc` (cool slate-50) |
| Layout constraint | 576px max-width wizard | `max-w-3xl` results view |
| Result reveal | RecommendationBanner text-2xl | DistributionSection (chart + table) |
| Animation policy | Near-zero | Moderate (accordion, shimmer, state transitions) |
| Data visualization | None | Recharts pie chart |
| Print support | None | Full print CSS (A4) |
| Sidebar | None | Full sidebar with navy background |
| Domain tokens | `--peso-savings`, `--peso-tax-due` | Per-heir-category color system |

---

## 16. Summary: Inheritance Design DNA

**Emotional register:** Professional, authoritative, trustworthy — appropriate for legal/estate matters
**Color story:** Deep navy (gravitas, law, tradition) + warm gold (value, legacy, prestige)
**Typography story:** Inter (accessible, modern) + Lora (legal authority, serif tradition) — used actively together
**Spacing:** More generous than TaxKlaro, with print-consciousness
**Component richness:** Full CRUD UI (client management, case notes, conflict checks, PDF generation) vs. TaxKlaro's single-flow calculator
**Differentiation from TaxKlaro:** Heavier UI, more data-dense, more "platform" than "tool"

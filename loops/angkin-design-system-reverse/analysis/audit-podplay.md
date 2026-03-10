# Audit: PodPlay Frontend Design System

**Source:** `apps/podplay/src/`
**Date:** 2026-03-10

---

## 1. Design Token Architecture

PodPlay uses **shadcn/ui with Tailwind CSS v4** and a **fully CSS-variable-based token system** with the OKLch perceptual color model. Tokens live in `src/index.css`.

### Root (Light Mode) Tokens

```css
/* Surfaces */
--background: oklch(1 0 0)               /* pure white */
--foreground: oklch(0.145 0 0)           /* near black */
--card: oklch(1 0 0)                     /* white */
--card-foreground: oklch(0.145 0 0)      /* near black */
--popover: oklch(1 0 0)                  /* white */
--popover-foreground: oklch(0.145 0 0)   /* near black */

/* Brand */
--primary: oklch(0.205 0 0)              /* dark gray / effective black */
--primary-foreground: oklch(0.985 0 0)   /* off-white */

/* Secondary */
--secondary: oklch(0.97 0 0)             /* very light gray */
--secondary-foreground: oklch(0.205 0 0) /* dark gray */

/* Semantic */
--muted: oklch(0.97 0 0)                 /* light gray bg */
--muted-foreground: oklch(0.556 0 0)     /* medium gray text */
--accent: oklch(0.97 0 0)                /* same as muted */
--accent-foreground: oklch(0.205 0 0)    /* dark gray */
--destructive: oklch(0.58 0.22 27)       /* red */

/* Structural */
--border: oklch(0.922 0 0)               /* light gray border */
--input: oklch(0.922 0 0)                /* input border */
--ring: oklch(0.708 0 0)                 /* focus ring */

/* Charts (blue family) */
--chart-1: oklch(0.809 0.105 251.813)
--chart-2: oklch(0.623 0.214 259.815)
--chart-3: oklch(0.546 0.245 262.881)
--chart-4: oklch(0.488 0.243 264.376)
--chart-5: oklch(0.424 0.199 265.638)

/* Radius */
--radius: 0.625rem (10px)
```

### Dark Mode Tokens (`.dark` class)

```css
--background: oklch(0.145 0 0)           /* near black */
--foreground: oklch(0.985 0 0)           /* off-white */
--card: oklch(0.205 0 0)                 /* dark gray */
--primary: oklch(0.87 0 0)               /* light gray */
--secondary: oklch(0.269 0 0)            /* dark gray */
--muted: oklch(0.269 0 0)                /* dark gray */
--accent: oklch(0.371 0 0)               /* medium gray */
--destructive: oklch(0.704 0.191 22.216) /* red (slightly different hue) */
--border: oklch(1 0 0 / 10%)             /* white/10% opacity */
--input: oklch(1 0 0 / 15%)              /* white/15% opacity */
--sidebar-primary: oklch(0.488 0.243 264.376) /* blue accent in dark sidebar */
```

### Computed Radius Scale

```
--radius-sm:  0.375rem (6px)   = base × 0.6
--radius-md:  0.5rem   (8px)   = base × 0.8
--radius-lg:  0.625rem (10px)  = base (default)
--radius-xl:  0.875rem (14px)  = base × 1.4
--radius-2xl: 1.125rem (18px)  = base × 1.8
--radius-3xl: 1.375rem (22px)  = base × 2.2
--radius-4xl: 1.625rem (26px)  = base × 2.6
```

---

## 2. Color Palette

### System Colors (approximate hex equivalents)

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| background | `#FFFFFF` | `#1C1C1C` |
| foreground | `#0D0D0D` | `#F5F5F5` |
| primary | `#1A1A1A` | `#DEDEDE` |
| secondary | `#F7F7F7` | `#2A2A2A` |
| muted | `#F7F7F7` | `#2A2A2A` |
| muted-foreground | `#737373` | `#8A8A8A` |
| accent | `#F7F7F7` | `#3D3D3D` |
| destructive | `#D94040` | `#E06060` |
| border | `#E0E0E0` | `rgba(255,255,255,0.10)` |

### Inline Status Colors (Tailwind classes, not variables)

Used in MetricsBar and badge components:
- Info blue: `text-blue-500`, `bg-blue-100 text-blue-700`
- Warning amber: `text-amber-500`, `bg-yellow-100 text-yellow-700`
- Success green: `text-green-500`, `bg-green-100 text-green-700`, `text-green-700 dark:text-green-400`
- Neutral: `bg-slate-100 text-slate-700`
- Active/orange: `bg-orange-100 text-orange-700`
- Error: `bg-red-100 text-red-700`

### Chart Color Family

5-color blue progression (hue 251-266°, decreasing lightness):
`oklch(0.809)` → `oklch(0.623)` → `oklch(0.546)` → `oklch(0.488)` → `oklch(0.424)`

---

## 3. Typography System

### Font Family

**Geist Variable** (variable font, single-weight axis)
- Package: `@fontsource-variable/geist@5.2.8`
- Applied globally: `html { @apply font-sans; }`
- Fallback: `sans-serif`
- Monospace variant available: `font-mono` (used for SKU codes)
- Weight range: 100–900 (variable)

### Type Scale (Tailwind utilities)

| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Labels, badges, captions, micro text |
| `text-[0.8rem]` | 12.8px | Small button labels |
| `text-[10px]` | 10px | Lowest-priority badges |
| `text-sm` | 14px | Body text, form inputs, table data |
| `text-base` | 16px | EmptyState headings |
| `text-lg` | 18px | Dialog titles |
| `text-2xl` | 24px | Card titles, metric values |

### Weight Usage

| Weight | Class | Context |
|--------|-------|---------|
| 500 | `font-medium` | Table headers, buttons, labels |
| 600 | `font-semibold` | Card titles, metric values, headings |
| 700 | `font-bold` | Rare, emphasis |

### Letter Spacing

- `tracking-tight` (−0.025em): Compact headings
- `tracking-wide` (0.025em): Uppercase labels, metric labels
- `tracking-wider` (0.05em): Rarely used

### Line Heights

- `leading-none` (1): Card titles
- `leading-snug` (1.375): Multi-line headings
- Default browser: Body text

---

## 4. Component Patterns

### Button

Uses **Class Variance Authority (CVA)** for type-safe variants.

**Base:** `inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-all`

| Variant | Style |
|---------|-------|
| `default` | `bg-primary text-primary-foreground` (black on white) |
| `outline` | `border-border bg-background hover:bg-muted` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `ghost` | `hover:bg-muted hover:text-foreground` |
| `destructive` | `bg-destructive/10 text-destructive` (soft red) |
| `link` | `text-primary underline-offset-4 hover:underline` |

| Size | Height | Padding |
|------|--------|---------|
| `default` | 32px | px-2.5 |
| `xs` | 24px | px-2 |
| `sm` | 28px | px-2.5 |
| `lg` | 36px | px-2.5 |
| `icon` | 32×32px | — |

**Focus:** `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`

### Input

```css
flex h-9 w-full rounded-md border border-input bg-background px-3 py-1
text-sm shadow-sm transition-colors placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:cursor-not-allowed disabled:opacity-50
```
Height: **36px** fixed.

### Select (Native + Custom)

- Native: `appearance-none` + custom chevron icon, height 36px
- Custom `SearchableSelect`: Combobox pattern with absolute dropdown (`max-h-60`), chevron rotates 180° when open

### Card

```
rounded-lg border bg-card text-card-foreground shadow-sm
```
Header: `p-6`, Content: `p-6 pt-0`

### Table

- Desktop: Full table with `border-b hover:bg-muted/50` rows, `px-4 py-3` cells
- Mobile: Card-based layout, `grid grid-cols-2` for field/value pairs
- Low stock row: `bg-destructive/5`
- Category groups: `bg-muted/30` separator rows with uppercase tracking-wide labels

### Wizard Stepper

Step states:
- Current: Filled circle `bg-primary text-primary-foreground`
- Completed: Ghost circle `bg-primary/20 text-primary`
- Pending: Muted circle `bg-muted text-muted-foreground`
- Separator: `›` character in `text-muted-foreground/40`

### Empty State

Centered column: icon (48×48px muted) → heading (base/semibold) → description (sm/muted) → CTA button (outline)

### Loading States

- **Full page spinner:** `animate-spin` Lucide icon, 3 sizes (16/24/32px), with optional label
- **Skeleton:** `animate-pulse rounded-md bg-muted` blocks
- **Inline spinner:** 16px spin icon inside buttons/rows

### Alert Dialog

- Overlay: `bg-black/80`
- Content: `max-w-lg`, centered via `translate-x/y[-50%]`, `p-6`, `rounded-lg`
- Footer: `flex-col-reverse sm:flex-row` (mobile stacks, desktop side-by-side)

### Sheet (Drawer)

- Left sidebar, `w-60 (240px)`, `fixed inset-y-0 left-0`
- Overlay: `bg-black/80`

### Toast (Sonner)

- Position: bottom-right
- Duration: 3000ms
- Font: font-sans text-sm

---

## 5. Spacing System

**Scale (rem):**
```
0.125 / 0.25 / 0.375 / 0.5 / 0.625 / 0.75 / 1 / 1.5
```

**Key measurements:**
- Form input height: `h-9 = 36px` (universal)
- Button heights: 24 / 28 / 32 / 36px
- Card padding: `p-6 = 24px`
- Table cell padding: `px-4 py-3 = 16px / 12px`
- Dashboard max-width: `max-w-7xl = 1280px`
- Container padding: `p-6 = 24px`

---

## 6. Animation Usage

### Transitions
- `transition-all`: Buttons (hover, focus)
- `transition-colors`: Inputs, table rows, dropdowns
- `transition-transform`: Chevron rotation in SearchableSelect

### Keyframes
```css
@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Tailwind Animations
- `animate-spin`: Loading spinners (Loader2 icon), respects `prefers-reduced-motion`
- `animate-pulse`: Skeleton loading states

### Library
- `tw-animate-css@1.4.0` imported for additional animation utilities (not heavily customized)

### Micro-interaction Patterns
- Chevron rotation: `rotate-180` on dropdown open
- Button hover: Color shift via `transition-colors`
- No complex entrance/exit animations — functional, not theatrical
- No CSS transforms for "delight" moments

---

## 7. Layout Patterns

### Grid System
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4   (Metrics bar — 1→2→4 columns)
grid-cols-2 gap-x-4                          (Mobile data pairs)
```

### Max Widths
- `max-w-sm (28rem/448px)`: Login form
- `max-w-lg (32rem/512px)`: Dialogs
- `max-w-7xl (80rem/1280px)`: Dashboard container

### Common Flex Patterns
```
flex items-center gap-3           Row layout
flex flex-col space-y-4           Form fields
flex items-center justify-center  Centered content
flex flex-col-reverse sm:flex-row Responsive button groups
```

### Z-Index Strategy
- `z-50`: All overlays (modals, dropdowns, sheets)
- No complex stacking — flat hierarchy

### Overflow Handling
- `overflow-x-auto` on table containers (horizontal scroll on mobile)
- `overflow-auto max-h-60` on dropdown lists (scrollable menus)

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| (base) | 0px | Mobile-first defaults |
| `sm:` | 640px | Two-column grids, show table, hide mobile cards |
| `lg:` | 1024px | Four-column metrics grid |
| `xl:` | 1280px | Max-width container boundary |

**Mobile-first patterns:**
- Tables: Hidden on mobile, replaced with card layout
- Grids: 1 col → 2 → 4
- Dialog footers: Stack → side-by-side

---

## 9. Key Observations for Design System Comparison

### What PodPlay Does Well
1. **OKLch color system** — Perceptually uniform colors, smooth dark mode mapping
2. **Variable font (Geist)** — Single font, full weight range, no FOUT
3. **Comprehensive dark mode** — Complete token remapping, not just color inversion
4. **CVA for variants** — Type-safe component variants, extensible
5. **Mobile table → card** — Clean responsive data presentation pattern
6. **Consistent 36px input height** — Cross-component harmony

### What PodPlay Lacks (for Angkin)
1. **No brand color** — Essentially achromatic (grays + black primary)
2. **No display/heading font** — Single font (Geist), no editorial contrast
3. **No celebration/result moments** — Inventory app, not calculator; no "you computed X" moment
4. **No currency/number formatting patterns** — Not a financial tool
5. **Minimal illustration system** — Icons only (Lucide), no spot illustrations
6. **No tool-family cohesion patterns** — Single app, no multi-tool routing

### Unique Patterns Worth Borrowing
- **OKLch token architecture** — Perfect for design system with multiple tool color themes
- **Radius scale** (`--radius` × multipliers) — Elegant systematic approach
- **Wizard stepper** — Solid pattern for multi-step compliance calculators
- **Empty state component** — Clean, reusable pattern for 0-result states
- **Destructive variant (soft red)** — `bg-destructive/10` is less alarming than solid red

---

## 10. Stack / Dependencies

| Category | Library | Version |
|----------|---------|---------|
| Styling | Tailwind CSS | 4.2.1 |
| Components | shadcn/ui | 4.0.0 |
| Headless UI | @base-ui/react | 1.2.0 |
| Icons | lucide-react | 0.577.0 |
| Font | @fontsource-variable/geist | 5.2.8 |
| Forms | react-hook-form | 7.71.2 |
| Validation | zod | 4.3.6 |
| Toast | sonner | 2.0.7 |
| CVA | class-variance-authority | 0.7.1 |
| Routing | @tanstack/react-router | 1.166.2 |
| Backend | @supabase/supabase-js | 2.98.0 |

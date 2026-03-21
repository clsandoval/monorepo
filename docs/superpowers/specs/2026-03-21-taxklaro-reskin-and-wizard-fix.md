# TaxKlaro Reskin + Wizard Fix — Design Spec

**Goal:** Replace the dark zinc theme with a light Anthropic-docs aesthetic across the entire app, and fix the wizard by removing fake Back/Continue buttons, keeping accordion navigation, and adding auto-save drafts.

**Tech Stack:** React 19, Tailwind CSS 4 (`@theme` custom properties), shadcn/ui, TanStack Router

---

## Part 1: Global Theme — Anthropic Docs Aesthetic

### Design Language

Clean, white, professional. Inspired by Anthropic's documentation site: white backgrounds, near-black text, subtle gray borders, minimal color use. Typography-driven hierarchy. No dark mode.

### Color Palette (CSS Custom Properties)

Replace all values in `src/index.css` `@theme` block:

| Token | Current (Dark) | New (Light) | Usage |
|-------|---------------|-------------|-------|
| `--color-background` | `#09090B` | `#FFFFFF` | Page background |
| `--color-foreground` | `#FAFAFA` | `#1A1A1A` | Primary text |
| `--color-surface` | `#18181B` | `#F9FAFB` | Cards, sidebar, elevated surfaces |
| `--color-border` | `#27272A` | `#E5E7EB` | All borders |
| `--color-muted` | `#A1A1AA` | `#6B7280` | Secondary/muted text |
| `--color-savings` | `#22C55E` | `#16A34A` | Savings indicators (slightly darker for contrast on white) |
| `--color-due` | `#EF4444` | `#DC2626` | Due/error (slightly darker) |
| `--color-amber` | `#F59E0B` | `#D97706` | Warning/amber |
| `--color-primary` | `#FAFAFA` | `#1A1A1A` | Primary buttons (dark on light) |
| `--color-primary-foreground` | `#09090B` | `#FFFFFF` | Text on primary buttons |
| `--color-secondary` | `#27272A` | `#F3F4F6` | Secondary buttons |
| `--color-secondary-foreground` | `#FAFAFA` | `#1A1A1A` | Text on secondary buttons |
| `--color-destructive` | `#EF4444` | `#DC2626` | Destructive actions |
| `--color-destructive-foreground` | `#FAFAFA` | `#FFFFFF` | Text on destructive |
| `--color-accent` | `#27272A` | `#F3F4F6` | Accent/hover backgrounds |
| `--color-accent-foreground` | `#FAFAFA` | `#1A1A1A` | Text on accent |
| `--color-card` | `#18181B` | `#FFFFFF` | Card backgrounds |
| `--color-card-foreground` | `#FAFAFA` | `#1A1A1A` | Card text |
| `--color-popover` | `#18181B` | `#FFFFFF` | Popover/dropdown backgrounds |
| `--color-popover-foreground` | `#FAFAFA` | `#1A1A1A` | Popover text |
| `--color-muted-foreground` | `#A1A1AA` | `#6B7280` | Muted text |
| `--color-input` | `#27272A` | `#E5E7EB` | Input borders |
| `--color-ring` | `#A1A1AA` | `#6B7280` | Focus rings |

### Component-Level Updates

Components that hardcode dark colors (e.g., `bg-zinc-950`, `text-zinc-50`) instead of using semantic tokens need updating. Key files:

**Sidebar (`src/components/layout/Sidebar.tsx`):**
- Desktop: `bg-zinc-950` → `bg-surface` (or `bg-gray-50`), `border-zinc-800` → `border-border`
- Text: `text-zinc-50` → `text-foreground`, `text-zinc-400` → `text-muted`
- Active nav: `bg-zinc-800` → `bg-gray-200/50` or `bg-accent`
- Hover: `hover:bg-zinc-800/50` → `hover:bg-gray-100`
- Collapse button, org text: flip to dark-on-light
- Mobile sheet: same treatment

**Landing page (`src/routes/index.tsx` + `src/components/landing/QuickCalculator.tsx`):**
- `bg-zinc-950` → `bg-white`
- `text-zinc-50` → `text-foreground`
- `border-zinc-800` → `border-border`
- `bg-zinc-900/50` → `bg-surface` or `bg-gray-50`
- Calculator card: light card with subtle border
- Sign In button: `bg-zinc-50 text-zinc-900` → `bg-primary text-primary-foreground`

**Auth page (`src/routes/auth.tsx` or similar):**
- Flip background and text colors

**Root layout (`src/routes/__root.tsx`):**
- `bg-zinc-950 text-zinc-50` → `bg-background text-foreground`

**Results view, computation detail, deadlines, settings:**
- Any hardcoded `zinc-*` dark classes → semantic tokens

### Approach

Most of the reskin happens via the CSS custom property swap. Hardcoded Tailwind classes (`bg-zinc-950`, etc.) are the surgical fixes needed per-component. After the theme swap, do a grep for remaining `zinc-9` and `zinc-8` classes to catch stragglers.

---

## Part 2: Wizard Fix

### Problem

The AccordionWizard shows all sub-steps within each accordion section simultaneously. Each sub-step renders its own Back/Continue buttons via `onNext`/`onBack` props, but these are wired to no-op functions. Users see 3+ "Continue" buttons on screen that do nothing when clicked. This is confusing and feels broken.

### Solution

1. **Remove all Back/Continue button blocks** from all 17 wizard step components (`WS00` through `WS13`). Each step renders its form fields only — no navigation chrome.

2. **Keep accordion section navigation.** Users click section headers to jump between the 5 sections (Taxpayer Profile, Period & Income, Deductions & Expenses, Tax Credits & Payments, Regime & Filing). This already works and is the intended navigation model.

3. **Remove `onNext`/`onBack` props** from step component interfaces and the `AccordionWizard` parent. Clean up the `noop` handler.

4. **Keep inline validation.** Steps that validate before allowing continue (e.g., WS04 checks gross receipts > 0) should still show validation messages inline when fields are invalid, but without a button gate.

### Files to modify (button removal)

All in `src/components/wizard/`:
- `WS00ModeSelection.tsx` — remove Continue button block
- `WS01TaxpayerProfile.tsx` — remove Back/Continue block
- `WS02BusinessType.tsx` — remove Back/Continue block
- `WS03TaxYear.tsx` — remove Back/Continue block
- `WS04GrossReceipts.tsx` — remove Back/Continue block
- `WS05Compensation.tsx` — remove Back/Continue block
- `WS06ExpenseMethod.tsx` — remove Back/Continue block
- `WS07AItemizedExpenses.tsx` — remove Back/Continue block
- `WS07BFinancialItems.tsx` — remove Back/Continue block
- `WS07CDepreciation.tsx` — remove Back/Continue/Skip block
- `WS07DNolco.tsx` — remove Back/Continue/Skip block
- `WS08CwtForm2307.tsx` — remove Back/Continue block
- `WS09PriorQuarterly.tsx` — remove Back/Continue blocks (has two)
- `WS10Registration.tsx` — remove Back/Continue block
- `WS11RegimeElection.tsx` — remove Back/Continue block
- `WS12FilingDetails.tsx` — remove Back/Continue block
- `WS13PriorYearCredits.tsx` — remove Back/Continue block

Also modify:
- `AccordionWizard.tsx` — remove `noop`, stop passing `onNext`/`onBack` to steps

### Auto-Save Drafts

**Problem:** Currently, `new.tsx` only saves to Supabase when the user clicks "Compute Tax". If the user navigates away, all progress is lost.

**Solution:** Mirror the auto-save pattern from `$compId.tsx`:

1. On first meaningful field change in `new.tsx`, create a draft computation record in Supabase (status: `draft`).
2. Store the returned `compId` in component state.
3. On subsequent changes, debounce-save the form data to that record (1000ms, matching existing pattern).
4. Navigate to `/computations/$compId` after creation so the URL reflects the saved draft.
5. The existing `$compId.tsx` auto-save takes over from there.

This means `new.tsx` becomes a thin redirect — it creates the draft and immediately navigates to the detail page in edit mode. The detail page handles everything from there.

---

## Out of Scope

- No dark mode toggle — light only
- No wizard step reordering or new steps
- No changes to WASM computation engine
- No changes to the data model or Supabase schema (draft status already exists)
- No changes to routing structure

# TaxKlaro: Desktop Layout Redesign + Landing Page Calculator

**Date:** 2026-03-21
**Status:** Draft

## Problem

1. **Desktop layout feels like a stretched mobile page.** The app uses a narrow centered column (`max-w-xl` / `max-w-3xl`) with a top nav bar. On wide screens, content floats in a sea of dark background with no use of horizontal space.

2. **Landing page has no hook.** Currently just logo + description + two buttons. No value demonstration before signup. Users have no reason to create an account without experiencing the product first.

## Solution

Three changes:

1. **Replace top nav with a collapsible sidebar** for desktop, collapsing to a sheet on mobile
2. **Remove the Clients feature entirely** (unused)
3. **Add a simplified tax calculator to the landing page** with a 1-free-calculation gate

---

## 1. Sidebar Navigation

### Desktop (>= md / 768px)

- Left sidebar, fixed position, 240px wide expanded
- Collapsible to 64px icon-only mode (toggle button at bottom)
- Collapse/expand animates over 200ms with CSS transition
- Sidebar state persisted in localStorage
- Content area fills remaining width

**Sidebar contents (top to bottom):**
- Logo (full in expanded, icon-only in collapsed)
- Nav items: Computations, Deadlines, Settings
- Spacer
- Save status indicator (wire `useSaveStatus()` context hook — current TopBar receives an unused optional prop, use the context directly instead)
- User email + avatar (at bottom)

### Mobile (< md)

- No visible sidebar
- Hamburger icon in a minimal top bar (logo + hamburger only)
- Hamburger opens a slide-out sheet from the left (same content as sidebar)
- Same behavior as current mobile menu, just with sidebar content

### Content Area

- Remove `CenteredColumn` max-width constraints for list pages — use fluid width with generous padding (`px-8 lg:px-12`)
- Keep centered, narrower max-width for form/detail pages (e.g. computation wizard stays at `max-w-3xl`)
- Main content scrollable independently of sidebar

### Files Affected

- **Delete:** `src/components/layout/TopBar.tsx`
- **Create:** `src/components/layout/Sidebar.tsx`
- **Modify:** `src/routes/__root.tsx` (swap TopBar for Sidebar in authenticated layout)
- **Modify:** `src/components/layout/CenteredColumn.tsx` (add `fluid?: boolean` prop that removes `max-w-*` constraints)
- **Keep/modify:** `src/routes/dashboard.tsx` — redirect stays, but target changes to `/computations` directly
- **Modify:** All route pages that use `CenteredColumn` to decide fluid vs centered

---

## 2. Remove Clients Feature

### Delete

- `src/routes/clients/index.tsx`
- `src/routes/clients/new.tsx`
- `src/routes/clients/$clientId.tsx`
- `src/components/clients/ClientsTable.tsx`
- `src/components/clients/ClientRowSkeleton.tsx`
- `src/components/clients/ClientInfoCard.tsx`

### Modify

- `src/router.ts` — remove client routes
- `src/routes/__root.tsx` — remove client nav item (currently in TopBar, will be in Sidebar)
- Tests referencing client routes

### Keep

- Client references inside wizard form components (WS04, WS06, WS07, WS08) — these are data fields within computations, not navigation to the clients feature

---

## 3. Landing Page Calculator

### User Flow

1. User lands on `/` (not authenticated)
2. Sees hero section with value prop + inline calculator form
3. Fills in: **Annual Gross Receipts** (number input) and **Taxpayer Type** (dropdown: Freelancer, Mixed Income)
4. Clicks "Calculate"
5. WASM engine runs with the input + sensible defaults for all other fields
6. Results displayed inline below the form:
   - Recommended tax regime + total tax due
   - Comparison table showing all 3 paths (8% flat, OSD, Itemized) with effective rates
   - "Sign up to save your results and run detailed computations" CTA
7. If user tries to calculate again → signup gate modal: "Create a free account to continue"

### Calculator Input Mapping

The simplified form collects 2 fields and maps to the full `TaxpayerInput`:

| Calculator Field | Maps To |
|---|---|
| Annual Gross Receipts | `grossReceipts` (as string "0.00" format) |
| Taxpayer Type: Freelancer | `taxpayerType: 'PURELY_SE'` |
| Taxpayer Type: Mixed Income | `taxpayerType: 'MIXED_INCOME'`, `isMixedIncome: true` |

"Employed Only" is excluded — the engine has no regime comparison for compensation-only taxpayers (all path details return null), so the calculator would show meaningless results.

Build the input by starting from `createDefaultTaxpayerInput()` (which sets `taxYear` to current year, `filingPeriod: 'ANNUAL'`, and all monetary fields to `"0.00"`) and overriding only the mapped fields. `electedRegime: null` enables optimizer mode (engine computes all 3 paths).

### Signup Gate

- After first calculation, set `localStorage.setItem('taxklaro_free_calc_used', 'true')`
- On subsequent "Calculate" clicks, check localStorage — if used, show signup modal instead of computing
- Modal: "Create a free account to save results and run unlimited computations" with Sign Up / Sign In buttons
- No server-side enforcement needed — this is a soft gate for conversion, not security

### Results Display

Show a condensed version of the regime comparison:

```
Recommended: 8% Flat Rate
Estimated Tax: PHP 40,000
Effective Rate: 8%

Compare all options:
| Regime      | Tax Due    | Effective Rate |
|-------------|------------|----------------|
| 8% Flat     | PHP 40,000 | 8.0%           |
| OSD (40%)   | PHP 52,400 | 10.5%          |
| Itemized    | PHP 68,200 | 13.6%          |

You could save PHP 28,200/year with the right regime.
```

### Files Affected

- **Modify:** `src/routes/index.tsx` — replace simple landing with hero + calculator
- **Create:** `src/components/landing/QuickCalculator.tsx` — calculator form + results
- **Uses:** `src/wasm/bridge.ts` (`computeTax`) — same WASM bridge as authenticated app

### WASM Loading State

The WASM engine must be fetched and compiled before `computeTax` can run. On the landing page this is the user's first load, so it may take 1-3s on slow connections. The "Calculate" button shows a spinner/disabled state while WASM initializes and computes. Optionally, eagerly start `ensureInit()` on page mount so the engine is ready by the time the user fills the form.

---

## 4. Design & Styling

- Sidebar: dark background consistent with current theme, subtle border on the right edge
- Landing page: same dark theme, calculator form uses existing card/input component styles
- Results table: clean, minimal, uses existing typography tokens
- Light/dark toggle (from earlier conversation, assumed to already exist or be implemented separately) applies to all of this

---

## Out of Scope

- Server-side rate limiting on the calculator
- Analytics/tracking on calculator usage
- SEO optimization for landing page
- Landing page sections beyond hero + calculator (testimonials, features, etc.)

# PodPlay Ops — Cost Analysis Gap Spec

**Date:** 2026-03-14 (updated 2026-03-17)
**Status:** Approved
**Source:** Excel sheet `docs/Kim Lapus PodPlay MRP.xlsx` → "Cost Analysis" tab

## Problem

The Excel MRP workbook has a "Cost Analysis" sheet that provides a per-project hardware cost breakdown with the full cost chain (unit cost → total → tax → S&H → landed cost → customer price), grouped by hardware category, with category subtotals and per-court pricing. This view does not exist anywhere in the PodPlay Ops web app.

The closest thing is the BOM Review table in the Procurement wizard, but that is an editable form focused on BOM management, not a read-only cost analysis. It also lacks tax/S&H column breakdowns, category grouping, category subtotals, and per-court pricing.

## Scope

**In scope (MVP):**
- Per-project Cost Analysis tab in the Financials wizard
- Global cost analysis comparison table on the Financials dashboard
- Uses only existing DB tables and columns — no schema changes

**Out of scope (future):**
- Per-project tax rate overrides (currently uses global `settings` rate)
- Setup fees (Venue Set Up Fee, Court Set Up Fee, Labor Fee, Discount)
- Labor minutes per item and hourly labor rate
- Technical resource counters (rack U's, PoE power/ports, UPS runtime)

## Existing Data Model

All data needed already exists:

| Table | Relevant Columns | Purpose |
|-------|-----------------|---------|
| `project_bom_items` | `id`, `project_id`, `catalog_item_id`, `quantity`, `unit_cost_override`, `created_at` | Per-project hardware line items |
| `hardware_catalog` | `id`, `name`, `model`, `vendor`, `category`, `unit_cost` | Item metadata + category for grouping |
| `settings` | `shipping_rate`, `target_margin`, `sales_tax_rate` | Global cost chain rates (fetched via `getSettings()` from `src/services/settingsService.ts`) |
| `projects` | `id`, `customer_name`, `venue_name`, `court_count`, `tier`, `project_status` | Project context |

**Unit cost resolution:** `unit_cost_override ?? hardware_catalog.unit_cost ?? 0`. The BOM generation service always populates `unit_cost_override`, but manually added items may have null — fall back to catalog, then 0.

Cost chain calculation uses the existing `calculateCostChain()` from `src/lib/cost-chain.ts`. All cost columns must be computed by calling this function — never by manual inline arithmetic. For reference, the function computes: `total = unitCost * qty`, then derives tax, shipping, landed cost, and customer price from the rates.

## Design

### View 1: Per-Project Cost Analysis Tab

**Location:** New step in the Financials wizard at index 2 (between "Expenses" and "P&L Summary").

**Wizard step order after change:**
1. Invoicing
2. Expenses
3. **Cost Analysis** (new)
4. P&L Summary
5. Go-Live
6. Recurring Fees

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Cost Analysis                          [Export PDF btn]  │
│ Hardware cost breakdown by category with full cost chain │
├─────────────────────────────────────────────────────────┤
│ [Customer: X] [Courts: 6] [Tier: pro] [Tax: 10.25%]    │
│ [S&H: 10%] [Margin: 10%]                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Network Rack ──────────────────── 12 items ────────┐ │
│ │ Device        │Vendor│Qty│Unit │Total│Tax│S&H│Land│$ │ │
│ │ Network Rack  │Snap  │ 1 │ 184 │ 184 │ 19│ 18│ 221│…│ │
│ │ UPS           │Ingram│ 1 │ 508 │ 508 │ 52│ 51│ 611│…│ │
│ │ ...           │      │   │     │     │   │   │    │  │ │
│ │ ─────────── Network Rack Total ──── $2,361 │ $2,624│ │
│ └───────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Replay System ─────────────────── 7 items ─────────┐ │
│ │ ...                                                  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                         │
│ (repeat for each category with items)                   │
│                                                         │
│ ┌─ Cost Summary ──────────────────────────────────────┐ │
│ │ Category              │ Landed Cost │ Customer Price │ │
│ │ Network Rack          │    $2,361   │       $2,624   │ │
│ │ Replay System         │    $2,693   │       $2,992   │ │
│ │ Displays & Kiosks     │    $7,986   │       $8,873   │ │
│ │ ...                   │             │                │ │
│ │ Total                 │   $16,465   │      $18,295   │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Per Court (Cost) ─┐  ┌─ Per Court (Price) ─┐        │
│ │     $2,744.20       │  │     $3,049.11        │        │
│ └────────────────────┘  └─────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

**Component:** `src/components/wizard/financials/CostAnalysis.tsx`

**Props:** `{ projectId: string }`

**Loading state:** Show "Loading cost analysis..." text (matching existing wizard tab pattern, e.g. `BomReviewTable`).

**Data fetching:**
- `project_bom_items` where `project_id = projectId`, joined to `hardware_catalog` via `catalog_item_id` for `name`, `model`, `vendor`, `category`, `unit_cost`
- Settings via `getSettings()` from `src/services/settingsService.ts` — use `sales_tax_rate`, `shipping_rate`, `target_margin`
- `projects` row for `customer_name`, `venue_name`, `court_count`, `tier`

**Grouping:** Items grouped by `hardware_catalog.category`, displayed using the canonical `bomCategorySortOrder` from `src/lib/enum-labels.ts`:

1. `network_rack`
2. `replay_system`
3. `displays`
4. `access_control`
5. `surveillance`
6. `front_desk`
7. `cabling`
8. `signage`
9. `infrastructure`
10. `pingpod_specific`

Categories with zero items are omitted. Items with a `category` value not in `bomCategorySortOrder` (e.g. `misc` or any future unknown category) are collected into a catch-all "Other" group displayed last.

Use `bomCategoryLabels` from `enum-labels.ts` for display names. For badge styling, inline the color mapping in the new component (matching the palette from `CatalogSettings.tsx`'s `BOM_CATEGORIES`) — `bomCategoryBadgeClass` in `enum-labels.ts` is currently unpopulated (all empty strings).

**Table columns per category group:**

| Column | Source | Alignment | Formatter |
|--------|--------|-----------|-----------|
| Device | `hardware_catalog.name` (+ `.model` as subtitle) | left | — |
| Vendor | `hardware_catalog.vendor` | left | — |
| Qty | `project_bom_items.quantity` | center | — |
| Unit Cost | `unit_cost_override ?? hardware_catalog.unit_cost ?? 0` | right | `formatCurrencyPrecise` |
| Total | `chain.total` | right | `formatCurrencyPrecise` |
| Tax | `chain.tax` | right | `formatCurrencyPrecise` |
| S&H | `chain.shipping` | right | `formatCurrencyPrecise` |
| Landed | `chain.landedCost` | right | `formatCurrencyPrecise` |
| Customer Price | `chain.customerPrice` | right | `formatCurrencyPrecise` |

All cost columns (Total through Customer Price) come from the `CostChainResult` returned by `calculateCostChain(unitCost, qty, salesTaxRate, shippingRate, targetMargin)`. Do not recompute inline.

Items with null unit cost (after fallback chain) display `EMPTY_DISPLAY` (em dash) in all cost columns.

Each group has a footer row with Landed Cost and Customer Price subtotals.

**Per-court cards:** Display `grandTotal / court_count`. Guard: if `court_count` is 0 or null, display em dash instead of dividing.

**Empty state:** Add `costAnalysisEmpty` to `EMPTY_STATES` — "No BOM items found for this project. Generate a BOM in the Procurement step first."

### View 2: Global Cost Analysis Section (Financials Dashboard)

**Location:** New section on `/financials` page, placed after the P&L Overview section.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Cost Analysis by Project                                     │
│ Hardware cost comparison across all active projects           │
├──────────────────────────────────────────────────────────────┤
│ Customer   │Venue │Tier│Courts│Landed   │Price    │Margin│/Ct│
│ Club Alpha │Main  │pro │   6  │$16,465  │$18,295  │11.1% │$3k│
│ Club Beta  │North │auto│   3  │ $9,200  │$10,222  │11.1% │$3k│
│ ...        │      │    │      │         │         │      │   │
│ ─────────────────── Totals ─── $25,665  │$28,517  │11.1% │$3k│
└──────────────────────────────────────────────────────────────┘
```

**Loading state:** Inherits from the existing page-level loading spinner already used by the Financials dashboard.

**Data fetching:** Fetch all `project_bom_items` joined to `hardware_catalog` in a **single query** (no per-project round-trips). Group by `project_bom_items.project_id` client-side. Fetch `settings` via `getSettings()` once for rates. Fetch all non-cancelled projects in one query.

**Table columns:**

| Column | Source | Alignment | Formatter |
|--------|--------|-----------|-----------|
| Customer | `projects.customer_name` | left | — |
| Venue | `projects.venue_name` | left | — |
| Tier | `projects.tier` (formatted) | left | `serviceTierLabels[tier]` from `enum-labels.ts` |
| Courts | `projects.court_count` | center | — |
| Landed Cost | Sum of all BOM item landed costs | right | `formatCurrencyCompact` |
| Customer Price | Sum of all BOM item customer prices | right | `formatCurrencyCompact` |
| Margin % | `((price - landed) / price) * 100` | right | `formatMarginPct` (expects a percentage value like `11.1`, not a decimal like `0.111`) |
| Per-Court | `customerPrice / court_count` | right | `formatCurrencyCompact` |

**Edge cases:** Margin % displays em dash when `customerPrice` is 0. Per-Court displays em dash when `court_count` is 0 or null. Projects with no BOM items show $0 / $0 / em dash / em dash.

**Footer:** Totals for Landed Cost and Customer Price; weighted average for Margin % and Per-Court.

**Row click:** Navigates to `/projects/{projectId}/financials` with search param `?tab=2` to deep-link to the Cost Analysis tab (index 2). The financials route should read this param to set `activeTabIdx` on mount.

**Empty state:** Add `costAnalysisGlobalEmpty` to `EMPTY_STATES` — "No projects with BOM data yet."

## Files Changed

| File | Change |
|------|--------|
| `src/lib/wizard-steps.ts` | Add `{ label: 'Cost Analysis' }` at index 2 in `financials` array |
| `src/routes/_auth/projects/$projectId/financials.tsx` | Import `CostAnalysis`, add at `activeTabIdx === 2`, shift P&L/GoLive/Recurring indices +1. Read `?tab` search param to set initial `activeTabIdx`. |
| `src/routes/_auth/financials/index.tsx` | Add `CostAnalysisGlobal` section after `PnlOverview`. Fetch all BOM items + settings in the existing `load()` function. |
| `src/components/wizard/financials/CostAnalysis.tsx` | **New file** — per-project cost analysis component |
| `src/components/financials/CostAnalysisGlobal.tsx` | **New file** — global cross-project comparison table |
| `src/lib/empty-state-configs.ts` | Add `costAnalysisEmpty` and `costAnalysisGlobalEmpty` entries |
| `src/index.css` (or global stylesheet) | Add `@media print` block fixing right-margin cutoff — landscape orientation, safe margins, table scaling, hide non-print elements |
| Layout/nav components | Add `no-print` class to sidebar, nav, and action buttons |

## Reuse

- `src/lib/cost-chain.ts` — existing `calculateCostChain()` for all cost computations
- `src/lib/enum-labels.ts` — `bomCategoryLabels`, `bomCategorySortOrder`, `BomCategory` type for canonical category ordering and labels; `serviceTierLabels` for tier display names
- `src/services/settingsService.ts` — `getSettings()` for `sales_tax_rate`, `shipping_rate`, `target_margin`
- `src/lib/formatters.ts` — `formatCurrencyPrecise` for per-item columns and subtotals; `formatCurrencyCompact` for summary cards and global table; `formatMarginPct` for margin %; `EMPTY_DISPLAY` for null/zero guards
- `src/components/ui/PdfExportButton.tsx` — existing export component
- `src/components/ui/EmptyState.tsx` + `src/lib/empty-state-configs.ts` — existing empty state pattern
- Badge color palette from `CatalogSettings.tsx`'s `BOM_CATEGORIES` — inline in new components (the canonical `bomCategoryBadgeClass` in `enum-labels.ts` is currently unpopulated)

## Bug Fix: PDF Export Right-Margin Cutoff

The existing `PdfExportButton` uses `window.print()`. Users report the right side of content is clipped in the generated PDF. This affects all pages that use `PdfExportButton` (invoices, and the new Cost Analysis).

**Fix:** Add a global `@media print` stylesheet with:
- `@page { margin: 0.5in; size: landscape; }` — landscape for wide tables, safe margins
- `body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }` — preserve background colors
- `.no-print { display: none !important; }` — hide nav, sidebar, buttons during print
- `table { width: 100% !important; font-size: 10px; }` — scale tables to fit page width
- `* { overflow: visible !important; }` — prevent clipping from scroll containers

**File:** Add print styles to `src/index.css` (or equivalent global stylesheet) under a `@media print` block.

**Also:** Add `className="no-print"` to sidebar/nav and action buttons so they don't appear in the PDF.

## Not Changing

- No new DB tables or columns
- No changes to BOM generation logic
- No changes to the Procurement BOM Review table
- No changes to the global P&L, HER, or Recurring Fees sections
- No setup fees, labor tracking, or technical resource counters

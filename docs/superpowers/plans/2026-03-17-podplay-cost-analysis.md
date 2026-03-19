# PodPlay Ops — Cost Analysis Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-project Cost Analysis tab to Financials wizard, global cost analysis comparison table to Financials dashboard, and fix PDF export right-margin cutoff.

**Architecture:** New `CostAnalysis.tsx` component fetches BOM items joined to hardware catalog, groups by category using canonical sort order, computes cost chains via existing `calculateCostChain()`, and renders grouped tables with subtotals. New `CostAnalysisGlobal.tsx` fetches all BOM items in one query, groups by project, and renders a comparison table. Print CSS fix applied globally in `index.css`.

**Tech Stack:** React 19, TanStack Router, Supabase client, Tailwind CSS, existing cost-chain/formatter utilities.

**Spec:** `docs/superpowers/specs/2026-03-14-podplay-cost-analysis-design.md`

---

### Task 1: Fix PDF export right-margin cutoff

**Files:**
- Modify: `apps/podplay/src/index.css:131-205`
- Modify: `apps/podplay/src/components/ui/PdfExportButton.tsx:17`

- [ ] **Step 1: Update print CSS in index.css**

Replace the existing `@page` rule at line 167-170 and add table-specific print rules. The current rules use `size: A4` (portrait) which clips wide tables. Change to landscape and add table scaling:

```css
/* In the existing @media print block, replace lines 167-170: */
@page {
  margin: 0.5in;
  size: A4 landscape;
}
```

Add after the existing `.guide-print-button` rule (line 201-204), still inside the `@media print` block:

```css
/* Scale wide tables to fit page width */
table {
  font-size: 10px !important;
}

/* Prevent scroll containers from clipping printed content */
[style*="overflow"],
.overflow-x-auto,
.overflow-y-auto:not(.flex-1) {
  overflow: visible !important;
}

/* Hide all action buttons during print */
button:not([data-print-visible]) {
  display: none !important;
}

/* Preserve background colors */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
```

- [ ] **Step 2: Add no-print class to PdfExportButton**

In `PdfExportButton.tsx`, the button already hides via the general `button` rule above, but add `guide-print-button` class for explicit targeting:

```tsx
// In PdfExportButton.tsx line 21, update className:
className={cn('gap-1.5 guide-print-button', className)}
```

- [ ] **Step 3: Verify print renders correctly**

Run: `cd apps/podplay && npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/podplay/src/index.css apps/podplay/src/components/ui/PdfExportButton.tsx
git commit -m "fix(podplay): fix PDF export right-margin cutoff with landscape orientation and table scaling"
```

---

### Task 2: Add empty state configs

**Files:**
- Modify: `apps/podplay/src/lib/empty-state-configs.ts:193` (before closing `} as const`)

- [ ] **Step 1: Add costAnalysisEmpty and costAnalysisGlobalEmpty entries**

Insert before the closing `} as const` on line 194:

```typescript
  // Cost Analysis — per-project (no BOM items)
  costAnalysisEmpty: {
    icon: ClipboardList,
    heading: 'No BOM items found',
    description: 'Generate a BOM in the Procurement step first.',
  },

  // Cost Analysis — global dashboard (no projects with BOM data)
  costAnalysisGlobalEmpty: {
    icon: BarChart3,
    heading: 'No projects with BOM data yet',
    description: 'Add BOM items to a project to see cost analysis across projects.',
  },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/podplay && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/podplay/src/lib/empty-state-configs.ts
git commit -m "feat(podplay): add empty state configs for cost analysis views"
```

---

### Task 3: Add Cost Analysis wizard step

**Files:**
- Modify: `apps/podplay/src/lib/wizard-steps.ts:46-52`

- [ ] **Step 1: Insert Cost Analysis step at index 2**

Replace lines 46-52:

```typescript
  financials: [
    { label: 'Invoicing' },
    { label: 'Expenses' },
    { label: 'Cost Analysis' },
    { label: 'P&L Summary' },
    { label: 'Go-Live' },
    { label: 'Recurring Fees' },
  ],
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/podplay && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/podplay/src/lib/wizard-steps.ts
git commit -m "feat(podplay): add Cost Analysis step to financials wizard"
```

---

### Task 4: Build per-project CostAnalysis component

**Files:**
- Create: `apps/podplay/src/components/wizard/financials/CostAnalysis.tsx`

- [ ] **Step 1: Create CostAnalysis.tsx**

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSettings } from '@/services/settingsService';
import { calculateCostChain, type CostChainResult } from '@/lib/cost-chain';
import { bomCategoryLabels, bomCategorySortOrder, serviceTierLabels } from '@/lib/enum-labels';
import type { BomCategory } from '@/lib/types';
import { formatCurrencyPrecise, EMPTY_DISPLAY } from '@/lib/formatters';
import { PdfExportButton } from '@/components/ui/PdfExportButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { EMPTY_STATES } from '@/lib/empty-state-configs';

interface BomItemRow {
  id: string;
  quantity: number;
  unit_cost_override: number | null;
  hardware_catalog: {
    name: string;
    model: string | null;
    vendor: string | null;
    category: string;
    unit_cost: number | null;
  } | null;
}

interface ProjectInfo {
  customer_name: string;
  venue_name: string;
  court_count: number | null;
  tier: string | null;
}

interface GroupedItem {
  id: string;
  name: string;
  model: string | null;
  vendor: string | null;
  quantity: number;
  unitCost: number;
  chain: CostChainResult;
}

interface CategoryGroup {
  category: string;
  label: string;
  items: GroupedItem[];
  totalLanded: number;
  totalCustomerPrice: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  network_rack: 'bg-blue-100 text-blue-800 border-blue-200',
  replay_system: 'bg-purple-100 text-purple-800 border-purple-200',
  displays: 'bg-amber-100 text-amber-800 border-amber-200',
  access_control: 'bg-green-100 text-green-800 border-green-200',
  surveillance: 'bg-red-100 text-red-800 border-red-200',
  front_desk: 'bg-teal-100 text-teal-800 border-teal-200',
  cabling: 'bg-slate-100 text-slate-800 border-slate-200',
  signage: 'bg-pink-100 text-pink-800 border-pink-200',
  infrastructure: 'bg-orange-100 text-orange-800 border-orange-200',
  pingpod_specific: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export function CostAnalysis({ projectId }: { projectId: string }) {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [rates, setRates] = useState<{ tax: number; shipping: number; margin: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [bomRes, projRes, settings] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('project_bom_items')
          .select('id, quantity, unit_cost_override, hardware_catalog!catalog_item_id(name, model, vendor, category, unit_cost)')
          .eq('project_id', projectId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('projects')
          .select('customer_name, venue_name, court_count, tier')
          .eq('id', projectId)
          .single(),
        getSettings(),
      ]);

      const items: BomItemRow[] = bomRes.data ?? [];
      setProject(projRes.data ?? null);
      setRates({
        tax: settings.sales_tax_rate,
        shipping: settings.shipping_rate,
        margin: settings.target_margin,
      });

      // Group by category
      const byCategory: Record<string, GroupedItem[]> = {};
      for (const item of items) {
        const cat = item.hardware_catalog?.category ?? 'other';
        if (!byCategory[cat]) byCategory[cat] = [];
        const unitCost = item.unit_cost_override ?? item.hardware_catalog?.unit_cost ?? 0;
        const chain = calculateCostChain(
          unitCost,
          item.quantity,
          settings.sales_tax_rate,
          settings.shipping_rate,
          settings.target_margin,
        );
        byCategory[cat].push({
          id: item.id,
          name: item.hardware_catalog?.name ?? 'Unknown',
          model: item.hardware_catalog?.model ?? null,
          vendor: item.hardware_catalog?.vendor ?? null,
          quantity: item.quantity,
          unitCost,
          chain,
        });
      }

      // Sort categories using canonical order, unknown categories go last
      const sortedCategories = Object.keys(byCategory).sort((a, b) => {
        const aOrder = bomCategorySortOrder[a as BomCategory] ?? 999;
        const bOrder = bomCategorySortOrder[b as BomCategory] ?? 999;
        return aOrder - bOrder;
      });

      const result: CategoryGroup[] = sortedCategories.map((cat) => {
        const catItems = byCategory[cat];
        return {
          category: cat,
          label: bomCategoryLabels[cat as BomCategory] ?? 'Other',
          items: catItems,
          totalLanded: catItems.reduce((s, i) => s + i.chain.landedCost, 0),
          totalCustomerPrice: catItems.reduce((s, i) => s + i.chain.customerPrice, 0),
        };
      });

      setGroups(result);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading cost analysis...</p>;
  }

  if (groups.length === 0) {
    const cfg = EMPTY_STATES.costAnalysisEmpty;
    return <EmptyState icon={cfg.icon} heading={cfg.heading} description={cfg.description} />;
  }

  const grandLanded = groups.reduce((s, g) => s + g.totalLanded, 0);
  const grandCustomerPrice = groups.reduce((s, g) => s + g.totalCustomerPrice, 0);
  const courtCount = project?.court_count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Cost Analysis</h2>
          <p className="text-sm text-muted-foreground">Hardware cost breakdown by category with full cost chain</p>
        </div>
        <PdfExportButton />
      </div>

      {/* Context badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        {project?.customer_name && (
          <span className="px-2 py-1 rounded bg-muted border">Customer: {project.customer_name}</span>
        )}
        {courtCount > 0 && (
          <span className="px-2 py-1 rounded bg-muted border">Courts: {courtCount}</span>
        )}
        {project?.tier && (
          <span className="px-2 py-1 rounded bg-muted border">
            Tier: {serviceTierLabels[project.tier as keyof typeof serviceTierLabels] ?? project.tier}
          </span>
        )}
        {rates && (
          <>
            <span className="px-2 py-1 rounded bg-muted border">Tax: {(rates.tax * 100).toFixed(2)}%</span>
            <span className="px-2 py-1 rounded bg-muted border">S&H: {(rates.shipping * 100).toFixed(0)}%</span>
            <span className="px-2 py-1 rounded bg-muted border">Margin: {(rates.margin * 100).toFixed(0)}%</span>
          </>
        )}
      </div>

      {/* Category groups */}
      {groups.map((group) => (
        <div key={group.category} className="border rounded-lg overflow-hidden">
          {/* Category header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${CATEGORY_COLORS[group.category] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {group.label}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium">Device</th>
                  <th className="text-left px-4 py-2 font-medium">Vendor</th>
                  <th className="text-center px-4 py-2 font-medium">Qty</th>
                  <th className="text-right px-4 py-2 font-medium">Unit Cost</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                  <th className="text-right px-4 py-2 font-medium">Tax</th>
                  <th className="text-right px-4 py-2 font-medium">S&H</th>
                  <th className="text-right px-4 py-2 font-medium">Landed</th>
                  <th className="text-right px-4 py-2 font-medium">Customer Price</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2">
                      <span className="font-medium">{item.name}</span>
                      {item.model && <span className="block text-xs text-muted-foreground">{item.model}</span>}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{item.vendor ?? EMPTY_DISPLAY}</td>
                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{item.unitCost > 0 ? formatCurrencyPrecise(item.unitCost) : EMPTY_DISPLAY}</td>
                    <td className="px-4 py-2 text-right">{item.unitCost > 0 ? formatCurrencyPrecise(item.chain.total) : EMPTY_DISPLAY}</td>
                    <td className="px-4 py-2 text-right">{item.unitCost > 0 ? formatCurrencyPrecise(item.chain.tax) : EMPTY_DISPLAY}</td>
                    <td className="px-4 py-2 text-right">{item.unitCost > 0 ? formatCurrencyPrecise(item.chain.shipping) : EMPTY_DISPLAY}</td>
                    <td className="px-4 py-2 text-right">{item.unitCost > 0 ? formatCurrencyPrecise(item.chain.landedCost) : EMPTY_DISPLAY}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.unitCost > 0 ? formatCurrencyPrecise(item.chain.customerPrice) : EMPTY_DISPLAY}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/50">
                  <td colSpan={7} className="px-4 py-2 text-sm font-semibold text-right">{group.label} Total</td>
                  <td className="px-4 py-2 text-right text-sm font-semibold">{formatCurrencyPrecise(group.totalLanded)}</td>
                  <td className="px-4 py-2 text-right text-sm font-semibold">{formatCurrencyPrecise(group.totalCustomerPrice)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* Cost Summary */}
      <div className="border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b">
          <h3 className="text-sm font-semibold">Cost Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2 font-medium">Category</th>
              <th className="text-right px-4 py-2 font-medium">Landed Cost</th>
              <th className="text-right px-4 py-2 font-medium">Customer Price</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.category} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2">{group.label}</td>
                <td className="px-4 py-2 text-right">{formatCurrencyPrecise(group.totalLanded)}</td>
                <td className="px-4 py-2 text-right">{formatCurrencyPrecise(group.totalCustomerPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/50">
              <td className="px-4 py-2 font-semibold">Total</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrencyPrecise(grandLanded)}</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrencyPrecise(grandCustomerPrice)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Per-court cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 space-y-1 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Per Court (Cost)</p>
          <p className="text-xl font-semibold">
            {courtCount > 0 ? formatCurrencyPrecise(grandLanded / courtCount) : EMPTY_DISPLAY}
          </p>
        </div>
        <div className="border rounded-lg p-4 space-y-1 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Per Court (Price)</p>
          <p className="text-xl font-semibold">
            {courtCount > 0 ? formatCurrencyPrecise(grandCustomerPrice / courtCount) : EMPTY_DISPLAY}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/podplay && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/podplay/src/components/wizard/financials/CostAnalysis.tsx
git commit -m "feat(podplay): add per-project CostAnalysis component with grouped tables and cost chain"
```

---

### Task 5: Wire CostAnalysis into financials route with tab deep-linking

**Files:**
- Modify: `apps/podplay/src/routes/_auth/projects/$projectId/financials.tsx`

- [ ] **Step 1: Add CostAnalysis import and ?tab param support**

Update the file to import CostAnalysis, read `?tab` search param, and shift tab indices. The full updated file:

Add import at line 2 (after the createFileRoute import area):

```typescript
import { CostAnalysis } from '@/components/wizard/financials/CostAnalysis';
```

Replace the `useState(0)` on line 15 to read from URL search params:

```typescript
  // Read ?tab search param for deep-linking from global financials
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = Number(searchParams.get('tab') ?? '0');
  const [activeTabIdx, setActiveTabIdx] = useState(initialTab);
```

Update the tab rendering (lines 76-95) to insert CostAnalysis at index 2 and shift the rest:

```tsx
        {activeTabIdx === 0 && (
          <div className="space-y-8">
            <h2 className="text-base font-medium">Invoicing</h2>
            <DepositInvoice projectId={projectId} />
            <FinalInvoice projectId={projectId} />
          </div>
        )}
        {activeTabIdx === 1 && (
          <ExpenseTracker projectId={projectId} />
        )}
        {activeTabIdx === 2 && (
          <CostAnalysis projectId={projectId} />
        )}
        {activeTabIdx === 3 && (
          <PnlSummary projectId={projectId} />
        )}
        {activeTabIdx === 4 && (
          <div>
            <h2 className="text-base font-medium mb-4">Go-Live</h2>
            <GoLive projectId={projectId} />
          </div>
        )}
        {activeTabIdx === 5 && <RecurringFeesTab projectId={projectId} />}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/podplay && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/podplay/src/routes/_auth/projects/\$projectId/financials.tsx
git commit -m "feat(podplay): wire CostAnalysis tab into financials wizard with deep-link support"
```

---

### Task 6: Build global CostAnalysisGlobal component

**Files:**
- Create: `apps/podplay/src/components/financials/CostAnalysisGlobal.tsx`

- [ ] **Step 1: Create CostAnalysisGlobal.tsx**

```tsx
import { useNavigate } from '@tanstack/react-router';
import { calculateCostChain } from '@/lib/cost-chain';
import { serviceTierLabels } from '@/lib/enum-labels';
import type { ServiceTier } from '@/lib/types';
import { formatCurrencyCompact, formatMarginPct, EMPTY_DISPLAY } from '@/lib/formatters';
import { EmptyState } from '@/components/ui/EmptyState';
import { EMPTY_STATES } from '@/lib/empty-state-configs';

interface BomItemFlat {
  project_id: string;
  quantity: number;
  unit_cost_override: number | null;
  hardware_catalog: {
    unit_cost: number | null;
  } | null;
}

interface ProjectFlat {
  id: string;
  customer_name: string;
  venue_name: string;
  tier: string;
  court_count: number | null;
}

interface ProjectCostRow {
  id: string;
  customerName: string;
  venueName: string;
  tier: string;
  courtCount: number;
  landedCost: number;
  customerPrice: number;
  marginPct: number;
  perCourt: number;
}

interface CostAnalysisGlobalProps {
  projects: ProjectFlat[];
  bomItems: BomItemFlat[];
  taxRate: number;
  shippingRate: number;
  marginTarget: number;
}

export function CostAnalysisGlobal({ projects, bomItems, taxRate, shippingRate, marginTarget }: CostAnalysisGlobalProps) {
  const navigate = useNavigate();

  // Group BOM items by project_id
  const bomByProject: Record<string, BomItemFlat[]> = {};
  for (const item of bomItems) {
    if (!bomByProject[item.project_id]) bomByProject[item.project_id] = [];
    bomByProject[item.project_id].push(item);
  }

  // Compute per-project cost rows
  const rows: ProjectCostRow[] = projects.map((p) => {
    const items = bomByProject[p.id] ?? [];
    let landedCost = 0;
    let customerPrice = 0;
    for (const item of items) {
      const unitCost = item.unit_cost_override ?? item.hardware_catalog?.unit_cost ?? 0;
      const chain = calculateCostChain(unitCost, item.quantity, taxRate, shippingRate, marginTarget);
      landedCost += chain.landedCost;
      customerPrice += chain.customerPrice;
    }
    const courtCount = p.court_count ?? 0;
    const marginPct = customerPrice > 0 ? ((customerPrice - landedCost) / customerPrice) * 100 : 0;
    const perCourt = courtCount > 0 ? customerPrice / courtCount : 0;

    return {
      id: p.id,
      customerName: p.customer_name,
      venueName: p.venue_name,
      tier: p.tier,
      courtCount,
      landedCost,
      customerPrice,
      marginPct,
      perCourt,
    };
  });

  // Filter to only projects that have BOM data
  const rowsWithData = rows.filter((r) => r.landedCost > 0 || r.customerPrice > 0);

  if (rowsWithData.length === 0) {
    const cfg = EMPTY_STATES.costAnalysisGlobalEmpty;
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Cost Analysis by Project</h2>
        <EmptyState icon={cfg.icon} heading={cfg.heading} description={cfg.description} />
      </section>
    );
  }

  const totalLanded = rowsWithData.reduce((s, r) => s + r.landedCost, 0);
  const totalPrice = rowsWithData.reduce((s, r) => s + r.customerPrice, 0);
  const totalMarginPct = totalPrice > 0 ? ((totalPrice - totalLanded) / totalPrice) * 100 : 0;
  const totalCourts = rowsWithData.reduce((s, r) => s + r.courtCount, 0);
  const totalPerCourt = totalCourts > 0 ? totalPrice / totalCourts : 0;

  function handleRowClick(projectId: string) {
    navigate({ to: '/projects/$projectId/financials', params: { projectId }, search: { tab: '2' } as Record<string, string> });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Cost Analysis by Project</h2>
        <p className="text-sm text-muted-foreground">Hardware cost comparison across all active projects</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Venue</th>
              <th className="text-left px-4 py-3 font-medium">Tier</th>
              <th className="text-center px-4 py-3 font-medium">Courts</th>
              <th className="text-right px-4 py-3 font-medium">Landed Cost</th>
              <th className="text-right px-4 py-3 font-medium">Customer Price</th>
              <th className="text-right px-4 py-3 font-medium">Margin %</th>
              <th className="text-right px-4 py-3 font-medium">Per-Court</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithData.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                onClick={() => handleRowClick(row.id)}
              >
                <td className="px-4 py-3">{row.customerName}</td>
                <td className="px-4 py-3">{row.venueName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                    {serviceTierLabels[row.tier as ServiceTier] ?? row.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{row.courtCount || EMPTY_DISPLAY}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyCompact(row.landedCost)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrencyCompact(row.customerPrice)}</td>
                <td className="px-4 py-3 text-right">{row.customerPrice > 0 ? formatMarginPct(row.marginPct) : EMPTY_DISPLAY}</td>
                <td className="px-4 py-3 text-right">{row.courtCount > 0 ? formatCurrencyCompact(row.perCourt) : EMPTY_DISPLAY}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/50">
              <td colSpan={4} className="px-4 py-3 font-semibold">Totals</td>
              <td className="px-4 py-3 text-right font-semibold">{formatCurrencyCompact(totalLanded)}</td>
              <td className="px-4 py-3 text-right font-semibold">{formatCurrencyCompact(totalPrice)}</td>
              <td className="px-4 py-3 text-right font-semibold">{totalPrice > 0 ? formatMarginPct(totalMarginPct) : EMPTY_DISPLAY}</td>
              <td className="px-4 py-3 text-right font-semibold">{totalCourts > 0 ? formatCurrencyCompact(totalPerCourt) : EMPTY_DISPLAY}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/podplay && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/podplay/src/components/financials/CostAnalysisGlobal.tsx
git commit -m "feat(podplay): add global CostAnalysisGlobal cross-project comparison table"
```

---

### Task 7: Wire CostAnalysisGlobal into financials dashboard

**Files:**
- Modify: `apps/podplay/src/routes/_auth/financials/index.tsx`

**Note:** The dashboard has a local `formatMarginPct` (line 77-79) that takes a decimal and multiplies by 100. The `CostAnalysisGlobal` component imports the canonical `formatMarginPct` from `formatters.ts` which takes a percentage value directly. These don't conflict because the import is inside `CostAnalysisGlobal.tsx`, not this file. No naming collision.

- [ ] **Step 1: Add imports**

Add after the existing imports (line 6):

```typescript
import { CostAnalysisGlobal } from '@/components/financials/CostAnalysisGlobal';
import { getSettings } from '@/services/settingsService';
```

- [ ] **Step 2: Add `court_count` to PipelineProject type**

Update the `PipelineProject` interface (line 19-27) to add `court_count`:

```typescript
interface PipelineProject {
  id: string;
  customer_name: string;
  venue_name: string;
  tier: string;
  court_count: number | null;
  project_status: string;
  revenue_stage: string;
  total_amount: number | null;
}
```

- [ ] **Step 3: Add state variables**

After the `recurringFees` state (line 437), add:

```typescript
  const [costBomItems, setCostBomItems] = useState<Array<{ project_id: string; quantity: number; unit_cost_override: number | null; hardware_catalog: { unit_cost: number | null } | null }>>([]);
  const [costRates, setCostRates] = useState<{ tax: number; shipping: number; margin: number }>({ tax: 0, shipping: 0, margin: 0 });
```

- [ ] **Step 4: Update data fetching**

Update the `Promise.all` destructuring (line 447) from:

```typescript
        const [projRes, invRes, expRes, bomRes, herRes, feesRes] = await Promise.all([
```

to:

```typescript
        const [projRes, invRes, expRes, bomRes, herRes, feesRes, settingsData, costBomRes] = await Promise.all([
```

Update the projects select query (inside the Promise.all, the first query) to include `court_count`:

```typescript
            .select('id, customer_name, venue_name, tier, project_status, revenue_stage, court_count')
```

Add two new fetches at the end of the `Promise.all` array (after the `feesRes` query, before the closing `]`):

```typescript
          // Settings for cost chain rates
          getSettings(),

          // BOM items with catalog unit_cost for cost analysis
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from('project_bom_items')
            .select('project_id, quantity, unit_cost_override, hardware_catalog!catalog_item_id(unit_cost)'),
```

- [ ] **Step 5: Set state from new fetch results**

After `setRecurringFees(feesRes.error ? [] : (feesRes.data ?? []));` (line 518), add:

```typescript
        setCostRates({
          tax: settingsData.sales_tax_rate,
          shipping: settingsData.shipping_rate,
          margin: settingsData.target_margin,
        });
        setCostBomItems(costBomRes.error ? [] : (costBomRes.data ?? []));
```

- [ ] **Step 6: Add CostAnalysisGlobal to the JSX**

In the return JSX, add after `<PnlOverview pnl={pnl} />` (line 554) and before `<HerChart snapshots={herSnapshots} />` (line 555):

```tsx
      <CostAnalysisGlobal
        projects={projects.map((p) => ({
          id: p.id,
          customer_name: p.customer_name,
          venue_name: p.venue_name,
          tier: p.tier,
          court_count: p.court_count,
        }))}
        bomItems={costBomItems}
        taxRate={costRates.tax}
        shippingRate={costRates.shipping}
        marginTarget={costRates.margin}
      />
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd apps/podplay && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add apps/podplay/src/routes/_auth/financials/index.tsx
git commit -m "feat(podplay): wire CostAnalysisGlobal into financials dashboard with settings + BOM data"
```

---

### Task 8: Build and verify

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `cd apps/podplay && npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify in browser (manual)**

Start dev server: `cd apps/podplay && npx vite dev`

Check:
1. Navigate to any project's Financials page — wizard should show 6 tabs (Invoicing, Expenses, Cost Analysis, P&L Summary, Go-Live, Recurring Fees)
2. Click "Cost Analysis" tab — should show grouped BOM items with cost chain columns
3. Navigate to `/financials` — should show new "Cost Analysis by Project" section after P&L Overview
4. Click a row in the global table — should navigate to that project's financials with Cost Analysis tab selected
5. Click "Export PDF" on Cost Analysis — print preview should show full table without right-margin clipping

- [ ] **Step 3: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix(podplay): address any build/runtime issues from cost analysis integration"
```

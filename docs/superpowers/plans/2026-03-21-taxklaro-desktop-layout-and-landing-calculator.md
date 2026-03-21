# TaxKlaro Desktop Layout + Landing Calculator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top-nav single-column layout with a collapsible sidebar, remove the unused Clients feature, and add a landing page quick tax calculator with a 1-free-calculation signup gate.

**Architecture:** Sidebar component replaces TopBar for authenticated routes. CenteredColumn gets a `fluid` prop for list pages. Landing page loads WASM engine and runs a simplified computation with 2 user inputs (gross receipts + taxpayer type), displaying a regime comparison. localStorage tracks free calculation usage.

**Tech Stack:** React 19, TanStack Router, Tailwind CSS 4, shadcn/ui (Sheet), taxklaro-engine WASM, Vitest

**Spec:** `docs/superpowers/specs/2026-03-21-taxklaro-desktop-layout-and-landing-calculator.md`

---

### Task 1: Remove Clients Feature

**Files:**
- Delete: `src/routes/clients/index.tsx`, `src/routes/clients/new.tsx`, `src/routes/clients/$clientId.tsx`
- Delete: `src/components/clients/ClientsTable.tsx`, `src/components/clients/ClientRowSkeleton.tsx`, `src/components/clients/ClientInfoCard.tsx`
- Modify: `src/router.ts` — remove client route imports and registrations
- Modify: `src/components/layout/TopBar.tsx` — remove Clients from NAV_ITEMS
- Modify: `src/__tests__/wiring.test.ts` — remove client file assertions and client route assertions

- [ ] **Step 1: Delete client route files**

```bash
rm src/routes/clients/index.tsx src/routes/clients/new.tsx src/routes/clients/\$clientId.tsx
rmdir src/routes/clients
```

- [ ] **Step 2: Delete client component files**

```bash
rm src/components/clients/ClientsTable.tsx src/components/clients/ClientRowSkeleton.tsx src/components/clients/ClientInfoCard.tsx
rmdir src/components/clients
```

- [ ] **Step 3: Remove client routes from router.ts**

In `src/router.ts`:
- Remove imports for `ClientsIndexRoute`, `ClientsNewRoute`, `ClientsClientIdRoute` (lines 17-19)
- Remove those three from the `authenticatedRoute.addChildren([...])` array (lines 42-44)

- [ ] **Step 4: Remove Clients from TopBar NAV_ITEMS**

In `src/components/layout/TopBar.tsx`, remove `{ label: 'Clients', to: '/clients' }` from the `NAV_ITEMS` array (line 12).

- [ ] **Step 5: Update wiring tests**

In `src/__tests__/wiring.test.ts`:
- Remove `'clients/ClientsTable.tsx'`, `'clients/ClientRowSkeleton.tsx'`, `'clients/ClientInfoCard.tsx'` from the `required` array in §14.1
- Remove `'clients/index.tsx'`, `'clients/new.tsx'`, `'clients/$clientId.tsx'` from the route files array in §14.5
- Update the route count assertion from 19 to 16

- [ ] **Step 6: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): remove unused Clients feature"
```

---

### Task 2: Add `fluid` Prop to CenteredColumn

**Files:**
- Modify: `src/components/layout/CenteredColumn.tsx`

- [ ] **Step 1: Add fluid prop**

In `src/components/layout/CenteredColumn.tsx`, update the interface and component:

```tsx
interface CenteredColumnProps extends HTMLAttributes<HTMLDivElement> {
  wide?: boolean
  fluid?: boolean
  children: React.ReactNode
}

export function CenteredColumn({ wide, fluid, className, children, ...rest }: CenteredColumnProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 lg:px-8',
        fluid ? '' : wide ? 'max-w-3xl' : 'max-w-xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/CenteredColumn.tsx && git commit -m "feat(taxklaro): add fluid prop to CenteredColumn"
```

---

### Task 3: Create Sidebar Component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

```tsx
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, LayoutDashboard, CalendarClock, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AutoSaveDot } from '@/components/shared/AutoSaveDot'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'
import { useSaveStatus } from '@/lib/save-status-context'

const NAV_ITEMS = [
  { label: 'Computations', to: '/computations', icon: LayoutDashboard },
  { label: 'Deadlines', to: '/deadlines', icon: CalendarClock },
  { label: 'Settings', to: '/settings', icon: Settings },
]

const COLLAPSED_KEY = 'taxklaro_sidebar_collapsed'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const { org } = useOrganization()
  const { status: saveStatus } = useSaveStatus()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed))
  }, [collapsed])

  const navContent = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            isActive(item.to)
              ? 'text-zinc-50 bg-zinc-800'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  )

  // Desktop sidebar
  const desktopSidebar = (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen border-r border-zinc-800 bg-zinc-950 shrink-0 transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-12 px-4">
        <Link to="/computations" className="text-sm font-bold text-zinc-50 truncate">
          {collapsed ? 'TK' : 'TaxKlaro'}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-2 py-2">
        {navContent()}
      </div>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-zinc-800">
        {saveStatus !== 'idle' && (
          <div className={cn('flex items-center gap-2 px-3 py-1 mb-2', collapsed && 'justify-center')}>
            <AutoSaveDot status={saveStatus} />
            {!collapsed && <span className="text-xs text-zinc-500">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : ''}</span>}
          </div>
        )}
        {!collapsed && (
          <div className="px-3 py-1">
            <span className="text-xs text-zinc-500 truncate block">
              {org?.name ? `${org.name}` : ''}{user?.email ? ` · ${user.email}` : ''}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )

  // Mobile top bar + sheet
  const mobileHeader = (
    <header className="md:hidden flex items-center justify-between h-12 px-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
      <Link to="/computations" className="text-sm font-bold text-zinc-50">TaxKlaro</Link>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger>
          <Menu className="h-5 w-5 text-zinc-400" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800 p-0">
          <div className="flex flex-col h-full">
            <div className="h-12 flex items-center px-4 border-b border-zinc-800">
              <span className="text-sm font-bold text-zinc-50">TaxKlaro</span>
            </div>
            <div className="flex-1 px-2 py-4">
              {navContent(() => setMobileOpen(false))}
            </div>
            <div className="px-4 py-3 border-t border-zinc-800">
              <span className="text-xs text-zinc-500 truncate block">
                {org?.name ? `${org.name} · ` : ''}{user?.email}
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )

  return (
    <>
      {desktopSidebar}
      {mobileHeader}
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/taxklaro/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx && git commit -m "feat(taxklaro): create Sidebar component"
```

---

### Task 4: Swap TopBar for Sidebar in Authenticated Layout

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/__tests__/wiring.test.ts`

- [ ] **Step 1: Update __root.tsx**

Replace the TopBar import and usage:

```tsx
import { createRootRouteWithContext, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import type { User } from '@supabase/supabase-js';
import { Sidebar } from '../components/layout/Sidebar';
import { SaveStatusProvider } from '../lib/save-status-context';

export interface RouterContext {
  auth: { user: User | null };
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors toastOptions={{ classNames: { toast: 'font-sans text-sm' } }} />
    </>
  );
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

export const publicRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: Outlet,
});

function AuthenticatedLayout() {
  return (
    <SaveStatusProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-50">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 overflow-y-auto py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </SaveStatusProvider>
  );
}

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});
```

Key changes:
- Layout changes from `flex-col` (vertical) to `flex` (horizontal) to put sidebar + content side by side
- Sidebar renders itself; content area is `flex-1 min-w-0` to fill remaining space
- `min-w-0` prevents content from overflowing when sidebar is present

- [ ] **Step 2: Update wiring test — replace TopBar with Sidebar**

In `src/__tests__/wiring.test.ts`:
- Change `'layout/TopBar.tsx'` to `'layout/Sidebar.tsx'` in the `required` array

- [ ] **Step 3: Delete TopBar.tsx**

```bash
rm src/components/layout/TopBar.tsx
```

- [ ] **Step 4: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd apps/taxklaro/frontend && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): replace TopBar with sidebar layout"
```

---

### Task 5: Update List Pages to Use Fluid Width

**Files:**
- Modify: `src/routes/computations/index.tsx` — add `fluid` prop to CenteredColumn
- Modify: `src/routes/deadlines.tsx` — add `fluid` prop to CenteredColumn

- [ ] **Step 1: Update computations index**

In `src/routes/computations/index.tsx`, change all `<CenteredColumn>` (without `wide`) to `<CenteredColumn fluid>`.

- [ ] **Step 2: Update deadlines**

In `src/routes/deadlines.tsx`, change all `<CenteredColumn` to `<CenteredColumn fluid`.

- [ ] **Step 3: Run tests and type check**

```bash
cd apps/taxklaro/frontend && npx vitest run && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/computations/index.tsx src/routes/deadlines.tsx && git commit -m "feat(taxklaro): use fluid width for list pages"
```

---

### Task 6: Update Dashboard Redirect

**Files:**
- Modify: `src/routes/dashboard.tsx` — redirect to `/computations` directly

- [ ] **Step 1: Update redirect target**

In `src/routes/dashboard.tsx`, ensure the redirect goes to `/computations` (it likely already does, but verify and update if needed).

- [ ] **Step 2: Commit (if changed)**

```bash
git add src/routes/dashboard.tsx && git commit -m "fix(taxklaro): dashboard redirects to /computations"
```

---

### Task 7: Landing Page Quick Calculator

**Files:**
- Create: `src/components/landing/QuickCalculator.tsx`
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Create QuickCalculator component**

Create `src/components/landing/QuickCalculator.tsx`:

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { computeTax } from '@/wasm/bridge'
import { createDefaultTaxpayerInput } from '@/types/engine-input'
import type { TaxComputationResult } from '@/types/engine-output'
import type { TaxpayerType } from '@/types/common'
import { formatPeso } from '@/lib/format'
import { Loader2 } from 'lucide-react'

const FREE_CALC_KEY = 'taxklaro_free_calc_used'

interface QuickCalcResult {
  recommended: string
  totalTax: string
  effectiveRate: string
  paths: Array<{
    label: string
    taxDue: string
    effectiveRate: string
  }>
  savings: string
}

function parseResult(result: TaxComputationResult): QuickCalcResult {
  const paths = result.comparison.map((p) => ({
    label: p.label,
    taxDue: formatPeso(p.totalTaxBurden),
    effectiveRate: p.effectiveRate,
  }))
  const rec = result.comparison.find(
    (p) => p.path === result.recommendedRegime
  )
  return {
    recommended: rec?.label ?? 'N/A',
    totalTax: formatPeso(result.selectedTotalTax),
    effectiveRate: rec?.effectiveRate ?? '0',
    paths,
    savings: formatPeso(result.savingsVsWorst),
  }
}

export function QuickCalculator({ onSignupGate }: { onSignupGate: () => void }) {
  const [grossReceipts, setGrossReceipts] = useState('')
  const [taxpayerType, setTaxpayerType] = useState<'PURELY_SE' | 'MIXED_INCOME'>('PURELY_SE')
  const [computing, setComputing] = useState(false)
  const [result, setResult] = useState<QuickCalcResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    // Check signup gate
    if (localStorage.getItem(FREE_CALC_KEY) === 'true') {
      onSignupGate()
      return
    }

    const amount = parseFloat(grossReceipts.replace(/,/g, ''))
    if (!amount || amount <= 0) {
      setError('Enter a valid amount')
      return
    }

    setComputing(true)
    setError(null)

    const input = createDefaultTaxpayerInput()
    input.taxpayerType = taxpayerType as TaxpayerType
    input.isMixedIncome = taxpayerType === 'MIXED_INCOME'
    input.grossReceipts = amount.toFixed(2)
    if (taxpayerType === 'MIXED_INCOME') {
      input.taxableCompensation = '0.00'
    }

    const wasmResult = await computeTax(input)
    setComputing(false)

    if (wasmResult.status === 'ok' && wasmResult.data) {
      setResult(parseResult(wasmResult.data))
      localStorage.setItem(FREE_CALC_KEY, 'true')
    } else {
      setError('Computation failed. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="grossReceipts" className="text-sm text-zinc-300">Annual Gross Receipts (₱)</Label>
          <Input
            id="grossReceipts"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 500,000"
            value={grossReceipts}
            onChange={(e) => setGrossReceipts(e.target.value)}
            className="h-11 bg-zinc-900 border-zinc-700 focus-visible:ring-zinc-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxpayerType" className="text-sm text-zinc-300">I am a...</Label>
          <Select value={taxpayerType} onValueChange={(v) => setTaxpayerType(v as 'PURELY_SE' | 'MIXED_INCOME')}>
            <SelectTrigger className="h-11 bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PURELY_SE">Freelancer / Self-Employed</SelectItem>
              <SelectItem value="MIXED_INCOME">Mixed Income (Employed + Freelance)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button onClick={handleCalculate} disabled={computing} className="w-full h-11">
          {computing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Calculating...</> : 'Calculate My Tax'}
        </Button>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Recommended Regime</p>
            <p className="text-lg font-semibold text-zinc-50 mt-1">{result.recommended}</p>
            <p className="text-2xl font-bold text-zinc-50 mt-2">{result.totalTax}</p>
            <p className="text-xs text-zinc-500">estimated annual tax</p>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Compare All Options</p>
            <div className="space-y-2">
              {result.paths.map((p) => (
                <div key={p.label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{p.label}</span>
                  <span className="text-zinc-200 font-medium tabular-nums">{p.taxDue}</span>
                </div>
              ))}
            </div>
          </div>

          {result.savings !== '₱0.00' && (
            <p className="text-center text-sm text-green-400">
              You could save {result.savings}/year with the right regime.
            </p>
          )}

          <p className="text-center text-xs text-zinc-500 pt-2">
            Sign up to save results and run detailed computations.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite the landing page**

Replace `src/routes/index.tsx`:

```tsx
import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { rootRoute } from './__root'
import { useAuth } from '../hooks/useAuth'
import { QuickCalculator } from '../components/landing/QuickCalculator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

function IndexPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    if (user) {
      navigate({ to: '/computations', replace: true })
    }
  }, [user, navigate])

  if (user) return null

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-950 px-6 py-16" data-testid="index-page">
      <div className="text-center mb-10">
        <span className="text-[32px] font-bold text-zinc-50 mb-2 block">TaxKlaro</span>
        <p className="text-base text-zinc-400 max-w-md mx-auto">
          Find the best tax regime for your situation. Philippine tax computation for freelancers and professionals.
        </p>
      </div>

      <QuickCalculator onSignupGate={() => setShowGate(true)} />

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
          className="flex items-center gap-2 h-10 px-6 rounded-lg bg-zinc-50 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          Sign In <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}
          className="h-10 px-6 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Create account
        </button>
      </div>

      {/* Signup gate modal */}
      <Dialog open={showGate} onOpenChange={setShowGate}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Create a Free Account</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Sign up to save your results and run unlimited detailed computations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}>
              Create Account
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/taxklaro/frontend && npx tsc --noEmit
```

- [ ] **Step 4: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/QuickCalculator.tsx src/routes/index.tsx && git commit -m "feat(taxklaro): add landing page quick calculator with signup gate"
```

---

### Task 8: Update Wiring Test for New Structure

**Files:**
- Modify: `src/__tests__/wiring.test.ts`

- [ ] **Step 1: Add landing component to wiring test**

Add `'landing/QuickCalculator.tsx'` to the `required` array in §14.1.

- [ ] **Step 2: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/wiring.test.ts && git commit -m "test(taxklaro): update wiring tests for new layout structure"
```

---

### Task 9: Smoke Test in Browser

- [ ] **Step 1: Start dev server**

```bash
cd apps/taxklaro/frontend && npm run dev
```

- [ ] **Step 2: Verify landing page**

- Open `http://localhost:5173`
- Verify hero text + calculator form renders
- Enter a gross receipts amount (e.g. 500000), select Freelancer, click Calculate
- Verify results table appears with 3 regime options
- Click Calculate again — verify signup gate modal appears

- [ ] **Step 3: Verify authenticated layout**

- Sign in
- Verify sidebar appears on left with Computations, Deadlines, Settings
- Verify sidebar collapse/expand works with animation
- Verify mobile layout (resize to <768px) — sidebar becomes hamburger menu
- Navigate between routes, verify active state highlighting

- [ ] **Step 4: Verify fluid list pages**

- Go to /computations — content should use full width
- Go to /computations/new — wizard should stay centered at max-w-3xl
- Go to /deadlines — content should use full width

- [ ] **Step 5: Commit any fixes found during smoke test**

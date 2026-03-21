# TaxKlaro UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current TaxKlaro frontend UI with a minimal, monochrome, Linear/Vercel-inspired design — new app shell, consolidated wizard, progressive-disclosure results.

**Architecture:** Visual overhaul layered on existing business logic. The sidebar + paginated wizard are replaced with a top bar + accordion form. Results get a hero number + collapsible details. All hooks, lib/, types, schemas, WASM engine, and Supabase integration stay untouched. shadcn/Radix primitives are restyled via new Tailwind theme tokens, not replaced.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/Radix UI, TanStack Router v1, react-hook-form, zod, Inter font

**Spec:** `docs/superpowers/specs/2026-03-21-taxklaro-ui-redesign-design.md`

**Frontend root:** `apps/taxklaro/frontend/`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/layout/TopBar.tsx` | Top navigation bar (logo, nav links, user/org, mobile hamburger) |
| `src/components/layout/CenteredColumn.tsx` | Reusable centered content wrapper (560px or 720px) |
| `src/components/layout/PublicHeader.tsx` | Minimal header for public pages (share, invite) |
| `src/components/computation/AccordionWizard.tsx` | 5-section accordion form replacing paginated wizard |
| `src/components/computation/WizardSection.tsx` | Single accordion section (header, summary, fields) |
| `src/components/computation/SectionProgressBar.tsx` | Thin 5-segment progress indicator |
| `src/components/computation/ComputeButton.tsx` | Always-visible compute button with disabled/loading states |
| `src/components/results/HeroNumber.tsx` | Big centered tax amount display |
| `src/components/results/RecommendationPill.tsx` | Green badge with regime + savings |
| `src/components/results/RegimeComparison.tsx` | Compact two-row regime comparison |
| `src/components/results/CollapsibleResultSection.tsx` | Reusable collapsible detail row |
| `src/components/results/ResultsActions.tsx` | Download PDF / Share Link / Edit Inputs buttons |
| `src/components/shared/Spinner.tsx` | 16px CSS spinner for loading states |
| `src/components/shared/ListRow.tsx` | Reusable stacked list row (name, subtitle, chevron) |
| `src/components/shared/AutoSaveDot.tsx` | Subtle status dot for top bar |
| `src/lib/save-status-context.tsx` | React context for propagating save status to TopBar |

### Modified Files
| File | Changes |
|------|---------|
| `src/index.css` | Replace all design tokens (colors, fonts, shadows, animations) |
| `src/routes/__root.tsx` | Replace AppLayout wrapper with TopBar layout |
| `src/routes/index.tsx` | Restyle landing page |
| `src/routes/dashboard.tsx` | Redirect to `/computations` |
| `src/routes/computations/index.tsx` | Restyle list with ListRow |
| `src/routes/computations/new.tsx` | Use AccordionWizard instead of WizardPage |
| `src/routes/computations/$compId.tsx` | Restyle detail page (underline tabs, AccordionWizard, new ResultsView) |
| `src/routes/computations/$compId.quarterly.tsx` | Convert to redirect to `$compId` |
| `src/routes/clients/index.tsx` | Restyle with ListRow |
| `src/routes/clients/new.tsx` | Restyle form |
| `src/routes/clients/$clientId.tsx` | Restyle detail page |
| `src/routes/deadlines.tsx` | Restyle with ListRow + urgency tinting |
| `src/routes/settings/index.tsx` | Restyle as scrollable sections |
| `src/routes/settings/team.tsx` | Restyle as section within settings flow |
| `src/routes/auth.tsx` | Restyle sign-in form |
| `src/routes/auth/reset.tsx` | Restyle reset form |
| `src/routes/auth/reset-confirm.tsx` | Restyle confirm form |
| `src/routes/auth/callback.tsx` | Add centered spinner |
| `src/routes/onboarding.tsx` | Restyle onboarding form |
| `src/routes/invite/$token.tsx` | Restyle with PublicHeader |
| `src/routes/share/$token.tsx` | Restyle with PublicHeader + new ResultsView |
| `src/components/computation/ResultsView.tsx` | Rewrite to use HeroNumber, collapsible sections |
| `src/components/computation/WizardForm.tsx` | Restyle as accordion for edit mode |
| `src/components/shared/EmptyState.tsx` | Restyle to monochrome centered text + CTA |
| `src/components/shared/ErrorState.tsx` | Restyle to monochrome centered text + retry |
| `src/components/shared/PesoInput.tsx` | Restyle input to dark theme |
| `src/components/shared/MoneyDisplay.tsx` | Update classes for new type scale |
| `src/components/computation/AddNoteForm.tsx` | Restyle for dark theme (if used in $compId detail) |
| `src/components/computation/NotesList.tsx` | Restyle for dark theme (if used in $compId detail) |
| `src/components/deadlines/DeadlineCard.tsx` | Restyle for dark theme or replace with ListRow |
| `src/components/ui/button.tsx` | Update variant colors for dark theme |
| `src/components/ui/input.tsx` | Update for dark theme (zinc-900 bg, zinc-800 border) |
| `src/components/ui/accordion.tsx` | Verify 200ms transition, update colors |
| `src/components/ui/dialog.tsx` | Dark surface (zinc-900), border (zinc-800) |
| `src/components/ui/skeleton.tsx` | Zinc-900 shimmer on zinc-950 |
| `package.json` | Add `@fontsource-variable/inter`, remove `@fontsource/dm-serif-display` |

### Deleted Files
| File | Reason |
|------|--------|
| `src/components/layout/AppLayout.tsx` | Replaced by TopBar |
| `src/components/layout/SidebarContent.tsx` | Sidebar removed |
| `src/components/computation/WizardPage.tsx` | Replaced by AccordionWizard |
| `src/components/computation/AutoSaveIndicator.tsx` | Replaced by AutoSaveDot |
| `src/components/computation/SaveStatusIndicator.tsx` | Replaced by AutoSaveDot |
| `src/components/computation/ComputationPageHeader.tsx` | Replaced by inline heading pattern |
| `src/components/computation/QuarterlyBreakdownView.tsx` | Quarterly route removed, data folded into results |
| `src/components/wizard/WizardProgressBar.tsx` | Replaced by SectionProgressBar |
| `src/components/wizard/WizardNavControls.tsx` | No next/back navigation |
| `src/components/wizard/WizardReview.tsx` | No review step |
| `src/components/wizard/steps/` (all 17 files) | Re-export wrappers no longer needed |
| `src/components/results/RecommendationBanner.tsx` | Replaced by RecommendationPill |
| `src/components/results/RegimeComparisonTable.tsx` | Replaced by RegimeComparison |
| `src/components/pages/DashboardPage.tsx` | Dashboard removed |
| `src/components/pages/LandingPage.tsx` | Inlined into route |
| `src/components/pages/SetupPage.tsx` | Check if referenced; delete if dead code |
| `src/components/shared/PageHeader.tsx` | Replaced by inline heading pattern |
| `src/components/shared/FilterBar.tsx` | Replaced by inline patterns |
| `src/components/computation/ActionsBar.tsx` | Replaced by ResultsActions |
| `src/components/computation/ShareToggle.tsx` | Share moved to ResultsActions "Share Link" button |
| `src/components/computation/ComputationCard.tsx` | Replaced by ListRow in computations list |
| `src/components/computation/ComputationCardSkeleton.tsx` | Replaced by skeleton ListRows |

### Unchanged Files (business logic)
All files in `src/hooks/`, `src/lib/`, `src/types/`, `src/schemas/`, `src/wasm/`, `src/components/pdf/` stay as-is.

---

## Task 1: Design Tokens & Font Swap

**Files:**
- Modify: `apps/taxklaro/frontend/package.json`
- Modify: `apps/taxklaro/frontend/src/index.css`

- [ ] **Step 1: Install Inter, remove DM Serif Display**

```bash
cd apps/taxklaro/frontend
npm install @fontsource-variable/inter
npm uninstall @fontsource/dm-serif-display
```

- [ ] **Step 2: Update font import in index.css or main.tsx**

Find where `@fontsource/dm-serif-display` and `@fontsource-variable/dm-sans` are imported (likely `main.tsx` or `index.css`). Replace with:

```typescript
import '@fontsource-variable/inter';
```

Remove the DM Sans import if present (Inter replaces both).

- [ ] **Step 3: Rewrite index.css design tokens**

Replace the entire `@theme` block in `src/index.css` with new tokens. Key changes:

```css
@import "tailwindcss";
@import "@fontsource-variable/inter";

@theme {
  /* Typography */
  --font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;

  /* Colors — Zinc scale */
  --color-background: #09090B;
  --color-foreground: #FAFAFA;
  --color-surface: #18181B;
  --color-border: #27272A;
  --color-muted: #A1A1AA;
  --color-savings: #22C55E;
  --color-due: #EF4444;
  --color-amber: #F59E0B;

  /* Semantic mappings for shadcn */
  --color-primary: #FAFAFA;
  --color-primary-foreground: #09090B;
  --color-secondary: #27272A;
  --color-secondary-foreground: #FAFAFA;
  --color-destructive: #EF4444;
  --color-destructive-foreground: #FAFAFA;
  --color-accent: #27272A;
  --color-accent-foreground: #FAFAFA;
  --color-card: #18181B;
  --color-card-foreground: #FAFAFA;
  --color-popover: #18181B;
  --color-popover-foreground: #FAFAFA;
  --color-muted-foreground: #A1A1AA;
  --color-input: #27272A;
  --color-ring: #A1A1AA;

  /* Border radius */
  --radius: 6px;

  /* No shadows */
}
```

Remove all `--shadow-*` tokens, all `--ease-*` animation tokens, all `.landing-*` animation classes, and the dark mode override block (dark is now the only mode).

Remove `--font-display` (DM Serif Display) and `--text-hero`/`--text-h1` etc custom scale — use Tailwind's built-in sizes.

- [ ] **Step 4: Verify build compiles**

```bash
cd apps/taxklaro/frontend && npm run build
```

Expected: Build succeeds (may have visual regressions — that's fine, we're replacing everything).

- [ ] **Step 5: Commit**

```bash
git add apps/taxklaro/frontend/package.json apps/taxklaro/frontend/package-lock.json apps/taxklaro/frontend/src/index.css apps/taxklaro/frontend/src/main.tsx
git commit -m "refactor(taxklaro): replace design tokens — Inter font, zinc dark palette, remove shadows"
```

---

## Task 2: Restyle shadcn Primitives

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/accordion.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/skeleton.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/radio-group.tsx`
- Modify: `src/components/ui/checkbox.tsx`
- Modify: `src/components/ui/label.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/alert.tsx`
- Modify: `src/components/ui/progress.tsx`
- Modify: `src/components/ui/tooltip.tsx`
- Modify: `src/components/ui/dropdown-menu.tsx`
- Modify: `src/components/ui/separator.tsx`
- Modify: `src/components/ui/switch.tsx`

- [ ] **Step 1: Update button.tsx variants**

Update the CVA variants to use the new dark theme:
- `default`: `bg-zinc-50 text-zinc-950 hover:bg-zinc-200` (white on dark)
- `outline`: `border-zinc-800 bg-transparent text-zinc-50 hover:bg-zinc-900`
- `ghost`: `text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900`
- `destructive`: `bg-red-500 text-white hover:bg-red-600`
- `link`: `text-zinc-400 underline hover:text-zinc-50`
- Remove any shadow classes. Add `rounded-md` (6px via --radius).
- Focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950`

- [ ] **Step 2: Update input.tsx**

```
bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500
focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600
h-9 rounded-md text-sm
```

Remove any shadow classes.

- [ ] **Step 3: Update accordion.tsx**

Ensure `AccordionContent` has `transition-all duration-200 ease-out` (200ms per spec).
Trigger text: `text-zinc-50`. Border: `border-zinc-800`.

- [ ] **Step 4: Update dialog.tsx**

`DialogContent`: `bg-zinc-900 border-zinc-800 text-zinc-50`. Remove shadows.

- [ ] **Step 5: Update skeleton.tsx**

`bg-zinc-900 animate-pulse` on `zinc-950` background.

- [ ] **Step 6: Update card.tsx**

`bg-zinc-900 border-zinc-800 text-zinc-50 rounded-md`. Remove shadows.

- [ ] **Step 7: Update tabs.tsx**

Restyle to underline tabs per spec:
- `TabsList`: `bg-transparent border-b border-zinc-800 rounded-none p-0 h-auto`
- `TabsTrigger`: `bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-50 data-[state=active]:text-zinc-50 text-zinc-500 px-4 pb-2`

- [ ] **Step 8: Restyle ALL remaining UI primitives**

Read each of the following files and update colors/backgrounds/borders for dark monochrome theme. Apply the same pattern: zinc-950 backgrounds, zinc-800 borders, zinc-50 text, zinc-500 muted text, no shadows.

- `sheet.tsx`: `bg-zinc-950 border-zinc-800` on SheetContent. Critical — used by TopBar mobile menu.
- `select.tsx`: `bg-zinc-900 border-zinc-800 text-zinc-50` on trigger and content. Items: `hover:bg-zinc-800`
- `radio-group.tsx`: `border-zinc-600 data-[state=checked]:border-zinc-50 data-[state=checked]:text-zinc-50`
- `checkbox.tsx`: Same pattern as radio-group
- `label.tsx`: `text-zinc-50 text-sm`
- `textarea.tsx`: Same as input — `bg-zinc-900 border-zinc-800 text-zinc-50`
- `badge.tsx`: default variant `bg-zinc-800 text-zinc-50`, destructive `bg-red-500/10 text-red-500`
- `alert.tsx`: `bg-zinc-900 border-zinc-800 text-zinc-50`
- `progress.tsx`: track `bg-zinc-800`, indicator `bg-zinc-50`
- `tooltip.tsx`: `bg-zinc-800 text-zinc-50 text-xs`
- `dropdown-menu.tsx`: `bg-zinc-900 border-zinc-800`, items `hover:bg-zinc-800 text-zinc-50`
- `separator.tsx`: `bg-zinc-800`
- `switch.tsx`: `bg-zinc-700 data-[state=checked]:bg-zinc-50`

- [ ] **Step 9: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 10: Commit**

```bash
git add apps/taxklaro/frontend/src/components/ui/
git commit -m "refactor(taxklaro): restyle shadcn primitives for dark monochrome theme"
```

---

## Task 3: Shared Components

**Files:**
- Create: `src/components/shared/Spinner.tsx`
- Create: `src/components/shared/ListRow.tsx`
- Create: `src/components/shared/AutoSaveDot.tsx`
- Modify: `src/components/shared/EmptyState.tsx`
- Modify: `src/components/shared/ErrorState.tsx`
- Modify: `src/components/shared/PesoInput.tsx`
- Modify: `src/components/shared/MoneyDisplay.tsx`

- [ ] **Step 1: Create Spinner.tsx**

```tsx
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
```

- [ ] **Step 2: Create ListRow.tsx**

```tsx
import { cn } from '@/lib/utils'

interface ListRowProps {
  title: string
  subtitle?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
  rightContent?: React.ReactNode
}

export function ListRow({ title, subtitle, onClick, className, children, rightContent }: ListRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 bg-zinc-900/50 cursor-pointer hover:bg-zinc-900',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-zinc-50 truncate">{title}</div>
        {subtitle && <div className="text-xs text-zinc-500 mt-0.5 truncate">{subtitle}</div>}
        {children}
      </div>
      {rightContent ?? <span className="text-xs text-zinc-600 ml-4 shrink-0">›</span>}
    </div>
  )
}
```

- [ ] **Step 3: Create AutoSaveDot.tsx**

```tsx
import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AutoSaveDot({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full transition-colors duration-300',
        status === 'saved' && 'bg-green-500',
        status === 'saving' && 'bg-amber-500',
        status === 'error' && 'bg-red-500'
      )}
      title={status === 'saved' ? 'Saved' : status === 'saving' ? 'Saving...' : 'Save failed'}
    />
  )
}
```

- [ ] **Step 4: Restyle EmptyState.tsx**

Read the current file first. Replace the content with a centered text + optional CTA pattern:

```tsx
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-sm text-zinc-500 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Restyle ErrorState.tsx**

Read current file. Replace with:

```tsx
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-sm text-zinc-50 mb-1">{message}</p>
      {description && <p className="text-xs text-zinc-500 mb-4">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Restyle PesoInput.tsx and MoneyDisplay.tsx**

Read each file. Update classes:
- PesoInput: dark background (`bg-zinc-900`), zinc borders, zinc-50 text
- MoneyDisplay: `tabular-nums` class, appropriate text size from new scale

- [ ] **Step 7: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add apps/taxklaro/frontend/src/components/shared/
git commit -m "refactor(taxklaro): restyle shared components, add Spinner/ListRow/AutoSaveDot"
```

---

## Task 4: App Shell — TopBar & Layout

**Files:**
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/CenteredColumn.tsx`
- Create: `src/components/layout/PublicHeader.tsx`
- Modify: `src/routes/__root.tsx`
- Delete: `src/components/layout/AppLayout.tsx`
- Delete: `src/components/layout/SidebarContent.tsx`

- [ ] **Step 1: Create CenteredColumn.tsx**

```tsx
import { cn } from '@/lib/utils'

interface CenteredColumnProps {
  wide?: boolean
  className?: string
  children: React.ReactNode
}

export function CenteredColumn({ wide, className, children }: CenteredColumnProps) {
  return (
    <div className={cn(
      'mx-auto w-full px-6',
      wide ? 'max-w-3xl' : 'max-w-xl',
      className
    )}>
      {children}
    </div>
  )
}
```

Note: `max-w-xl` = 576px (close to spec's 560px), `max-w-3xl` = 768px (close to spec's 720px).

- [ ] **Step 2: Create TopBar.tsx**

```tsx
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AutoSaveDot } from '@/components/shared/AutoSaveDot'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'

const NAV_ITEMS = [
  { label: 'Computations', to: '/computations' },
  { label: 'Clients', to: '/clients' },
  { label: 'Deadlines', to: '/deadlines' },
  { label: 'Settings', to: '/settings' },
]

export function TopBar({ saveStatus }: { saveStatus?: 'idle' | 'saving' | 'saved' | 'error' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const { organization } = useOrganization()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')

  return (
    <header className="flex items-center justify-between h-12 px-6 border-b border-zinc-800 bg-zinc-950/80 shrink-0">
      <div className="flex items-center gap-6">
        <Link to="/computations" className="text-sm font-bold text-zinc-50">
          TaxKlaro
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-[13px] transition-colors',
                isActive(item.to) ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {saveStatus && <AutoSaveDot status={saveStatus} />}
        <span className="hidden sm:inline text-xs text-zinc-500 truncate max-w-48">
          {organization?.name ? `${organization.name} · ` : ''}{user?.email}
        </span>
        <div className="h-7 w-7 rounded-full bg-zinc-800 shrink-0" />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden">
            <Menu className="h-5 w-5 text-zinc-400" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800 p-0">
            <nav className="flex flex-col p-4 gap-1 mt-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm',
                    isActive(item.to) ? 'text-zinc-50 bg-zinc-900' : 'text-zinc-500'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
```

**Save status propagation:** The `saveStatus` prop is passed from the computation detail route (`$compId.tsx`) which owns the auto-save hook. To get it to the TopBar (which lives in `__root.tsx`), create a simple React context:

Create `src/lib/save-status-context.tsx`:
```tsx
import { createContext, useContext, useState } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
const SaveStatusContext = createContext<{
  status: SaveStatus
  setStatus: (s: SaveStatus) => void
}>({ status: 'idle', setStatus: () => {} })

export function SaveStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  return <SaveStatusContext.Provider value={{ status, setStatus }}>{children}</SaveStatusContext.Provider>
}

export function useSaveStatus() { return useContext(SaveStatusContext) }
```

Wrap the authenticated layout in `SaveStatusProvider`. TopBar reads `useSaveStatus().status`. The `$compId.tsx` route calls `useSaveStatus().setStatus(...)` from within `useAutoSave` callbacks.

- [ ] **Step 3: Create PublicHeader.tsx**

```tsx
interface PublicHeaderProps {
  label?: string
}

export function PublicHeader({ label }: PublicHeaderProps) {
  return (
    <header className="flex items-center gap-3 h-12 px-6 border-b border-zinc-800">
      <span className="text-sm font-bold text-zinc-50">TaxKlaro</span>
      {label && <span className="text-xs text-zinc-500">{label}</span>}
    </header>
  )
}
```

- [ ] **Step 4: Update __root.tsx — replace AppLayout with TopBar**

Read `src/routes/__root.tsx`. The `authenticatedRoute` currently wraps children in `AppLayout`. Replace that with:

```tsx
// In the authenticated layout component:
<div className="flex flex-col h-screen bg-zinc-950 text-zinc-50">
  <TopBar />
  <main className="flex-1 overflow-y-auto py-10">
    <Outlet />
  </main>
</div>
```

Import `TopBar` from `@/components/layout/TopBar`.
Remove the `AppLayout` import.

Also set `<body>` / root styles: `bg-zinc-950 text-zinc-50` (may need to be in index.css or __root.tsx).

- [ ] **Step 5: Delete old layout files**

```bash
rm apps/taxklaro/frontend/src/components/layout/AppLayout.tsx
rm apps/taxklaro/frontend/src/components/layout/SidebarContent.tsx
```

- [ ] **Step 6: Update dashboard.tsx to redirect**

Read `src/routes/dashboard.tsx`. Replace the component with a redirect:

```tsx
import { Navigate } from '@tanstack/react-router'

// In the route component:
export function DashboardPage() {
  return <Navigate to="/computations" />
}
```

Or use TanStack Router's `beforeLoad` to redirect.

- [ ] **Step 7: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add -A apps/taxklaro/frontend/src/components/layout/ apps/taxklaro/frontend/src/routes/__root.tsx apps/taxklaro/frontend/src/routes/dashboard.tsx
git commit -m "refactor(taxklaro): replace sidebar with top bar, remove dashboard route"
```

---

## Task 5: Accordion Wizard

**Files:**
- Create: `src/components/computation/AccordionWizard.tsx`
- Create: `src/components/computation/WizardSection.tsx`
- Create: `src/components/computation/SectionProgressBar.tsx`
- Create: `src/components/computation/ComputeButton.tsx`
- Modify: `src/routes/computations/new.tsx`
- Delete: `src/components/computation/WizardPage.tsx`
- Delete: `src/components/wizard/WizardProgressBar.tsx`
- Delete: `src/components/wizard/WizardNavControls.tsx`
- Delete: `src/components/wizard/WizardReview.tsx`
- Delete: `src/components/wizard/steps/` (all 17 re-export wrappers)

- [ ] **Step 1: Create SectionProgressBar.tsx**

```tsx
interface SectionProgressBarProps {
  total: number
  completed: number
}

export function SectionProgressBar({ total, completed }: SectionProgressBarProps) {
  return (
    <div className="flex gap-1 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1 rounded-full transition-colors duration-300"
          style={{ backgroundColor: i < completed ? '#FAFAFA' : 'rgba(255,255,255,0.1)' }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create WizardSection.tsx**

This component wraps a group of wizard step components into a single accordion section. It handles:
- Rendering the section header (number, title, summary when collapsed)
- Showing a green check when completed, error indicator when invalid, number when pending
- Rendering the contained step components when expanded

```tsx
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

interface WizardSectionProps {
  index: number
  title: string
  summary?: string
  status: 'pending' | 'active' | 'completed' | 'error'
  children: React.ReactNode
}

export function WizardSection({ index, title, summary, status, children }: WizardSectionProps) {
  return (
    <div className="border-b border-zinc-800">
      {/* Header is rendered by AccordionTrigger in parent */}
      <div className="flex items-center gap-2.5">
        {status === 'completed' ? (
          <div className="h-[18px] w-[18px] rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-zinc-950" />
          </div>
        ) : status === 'error' ? (
          <div className="h-[18px] w-[18px] rounded-full bg-red-500 flex items-center justify-center">
            <AlertCircle className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className={cn(
            'h-[18px] w-[18px] rounded-full flex items-center justify-center text-[10px]',
            status === 'active' ? 'border-2 border-zinc-50 text-zinc-50' : 'border border-zinc-700 text-zinc-600'
          )}>
            {index + 1}
          </div>
        )}
        <span className={cn(
          'text-sm',
          status === 'active' && 'font-semibold text-zinc-50',
          status === 'completed' && 'text-zinc-500',
          status === 'error' && 'text-zinc-50',
          status === 'pending' && 'text-zinc-500'
        )}>
          {title}
        </span>
        {status === 'completed' && summary && (
          <span className="text-xs text-zinc-600 ml-auto truncate max-w-48">{summary}</span>
        )}
      </div>
      {/* Fields — only shown when expanded (controlled by Accordion parent) */}
      <div className="pl-7 pt-4 pb-5">
        {children}
      </div>
    </div>
  )
}
```

Note: The exact integration with shadcn Accordion will require adapting this — the `AccordionTrigger` wraps the header, and `AccordionContent` wraps the children. The implementer should read `src/components/ui/accordion.tsx` to understand the Radix API and compose accordingly. The header content goes inside `AccordionTrigger`, the fields go inside `AccordionContent`.

- [ ] **Step 3: Create ComputeButton.tsx**

```tsx
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/shared/Spinner'

interface ComputeButtonProps {
  disabled: boolean
  loading: boolean
  onClick: () => void
}

export function ComputeButton({ disabled, loading, onClick }: ComputeButtonProps) {
  return (
    <div className="pt-6">
      <Button
        className="w-full h-11"
        disabled={disabled || loading}
        onClick={onClick}
        style={{ opacity: disabled && !loading ? 0.3 : 1 }}
      >
        {loading ? <Spinner className="h-4 w-4" /> : 'Compute Tax'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create AccordionWizard.tsx**

This is the main orchestrator. It maps the 5 sections to wizard step components using the existing `computeActiveSteps()` logic.

```tsx
import { useState } from 'react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { SectionProgressBar } from './SectionProgressBar'
import { ComputeButton } from './ComputeButton'
import { computeActiveSteps } from '@/lib/wizard-routing'
import type { WizardFormData } from '@/types/wizard'

// Import all step components directly (not via steps/ re-exports)
import { WS00ModeSelection } from '@/components/wizard/WS00ModeSelection'
import { WS01TaxpayerProfile } from '@/components/wizard/WS01TaxpayerProfile'
// ... (import all 17 step components)

const SECTIONS = [
  {
    id: 'profile',
    title: 'Taxpayer Profile',
    steps: ['WS-00', 'WS-01', 'WS-02'],
    summary: (data: Partial<WizardFormData>) => {
      // Return summary string from form data
      const parts = [data.computationTitle, data.taxpayerType?.replace(/_/g, ' ').toLowerCase()].filter(Boolean)
      return parts.join(' · ') || undefined
    },
  },
  {
    id: 'income',
    title: 'Period & Income',
    steps: ['WS-03', 'WS-04', 'WS-05'],
    summary: (data: Partial<WizardFormData>) => {
      const parts = [data.taxYear, data.filingPeriod, data.grossReceipts ? `₱${data.grossReceipts}` : null].filter(Boolean)
      return parts.join(' · ') || undefined
    },
  },
  {
    id: 'deductions',
    title: 'Deductions & Expenses',
    steps: ['WS-06', 'WS-07A', 'WS-07B', 'WS-07C', 'WS-07D'],
    summary: (data: Partial<WizardFormData>) => {
      return data.electedRegime?.replace(/_/g, ' ').toLowerCase() || data.osdElected ? 'OSD' : undefined
    },
  },
  {
    id: 'credits',
    title: 'Tax Credits & Payments',
    steps: ['WS-08', 'WS-09', 'WS-13'],
    summary: () => undefined, // Hard to summarize, leave blank
  },
  {
    id: 'regime',
    title: 'Regime & Filing',
    steps: ['WS-10', 'WS-11', 'WS-12'],
    summary: (data: Partial<WizardFormData>) => {
      return data.electedRegime?.replace(/ELECT_/g, '').replace(/_/g, ' ').toLowerCase() || undefined
    },
  },
]

// Map step IDs to components
const STEP_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'WS-00': WS00ModeSelection,
  'WS-01': WS01TaxpayerProfile,
  // ... map all steps
}

interface AccordionWizardProps {
  data: WizardFormData
  onChange: (data: Partial<WizardFormData>) => void
  onCompute: () => void
  computing: boolean
}

export function AccordionWizard({ data, onChange, onCompute, computing }: AccordionWizardProps) {
  const [openSection, setOpenSection] = useState<string>('profile')
  const activeSteps = computeActiveSteps(data)

  // Determine which steps within each section are active
  const getSectionSteps = (section: typeof SECTIONS[number]) =>
    section.steps.filter((s) => activeSteps.includes(s))

  // TODO: Section completion logic — a section is complete when all its active required fields are filled
  // This needs to integrate with the existing zod validation schemas
  const completedSections = new Set<string>() // Placeholder — implement based on validation

  const completedCount = SECTIONS.filter((s) => completedSections.has(s.id)).length
  const allComplete = completedCount === SECTIONS.length

  return (
    <div>
      <SectionProgressBar total={SECTIONS.length} completed={completedCount} />

      <Accordion type="single" value={openSection} onValueChange={setOpenSection} collapsible>
        {SECTIONS.map((section, idx) => {
          const sectionSteps = getSectionSteps(section)
          const isCompleted = completedSections.has(section.id)
          const isActive = openSection === section.id
          const status = isActive ? 'active' : isCompleted ? 'completed' : 'pending'

          return (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                {/* WizardSection header content here */}
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-7 flex flex-col gap-4">
                  {sectionSteps.map((stepId) => {
                    const StepComponent = STEP_COMPONENTS[stepId]
                    if (!StepComponent) return null
                    return <StepComponent key={stepId} data={data} onChange={onChange} />
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <ComputeButton disabled={!allComplete} loading={computing} onClick={onCompute} />
    </div>
  )
}
```

Note: The exact step component props (`data`, `onChange`, `onBack`, `onSubmit`) vary between steps. Read each step component to understand its interface. The `onBack`/`onSubmit` props from the old paginated wizard may need to be adapted — in the accordion context they're no longer needed. The implementer should read a few step components (e.g., `WS00ModeSelection.tsx`, `WS04GrossReceipts.tsx`) to understand the common interface before wiring this up.

**Section completion validation approach:**

This is the most complex part of the task. The implementer must:

1. Read `src/schemas/input.ts` to understand the full zod schema structure.
2. Create per-section partial schemas by picking the fields that belong to each section. Example:

```typescript
import { z } from 'zod'
import { inputSchema } from '@/schemas/input' // or wherever the master schema lives

// Section 1: Taxpayer Profile — fields from WS-00, WS-01, WS-02
const profileSchema = inputSchema.pick({
  filingPeriod: true,  // WS-00
  taxpayerType: true,  // WS-01
  // ... other WS-02 fields
})

// Section 2: Period & Income — WS-03, WS-04, WS-05
const incomeSchema = inputSchema.pick({
  taxYear: true,
  grossReceipts: true,
  // taxableCompensation: only required if MIXED_INCOME
})
```

3. For conditional fields: use `.partial()` for fields that may not be active, then validate only active fields using `computeActiveSteps()` output. If a step is not in the active steps for this section, skip its fields.

4. A section is "completed" when `sectionSchema.safeParse(data).success === true` for all active fields in that section.

5. Wire this into the `AccordionWizard` state: recompute `completedSections` on every `data` change using the above logic.

- [ ] **Step 5: Update computations/new.tsx route**

Read `src/routes/computations/new.tsx`. It currently renders `WizardPage`. Replace with `AccordionWizard` wrapped in `CenteredColumn`:

```tsx
<CenteredColumn>
  <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">New Computation</div>
  <h1 className="text-2xl font-semibold mb-8">Tell us about this taxpayer</h1>
  <AccordionWizard data={data} onChange={setData} onCompute={handleCompute} computing={computing} />
</CenteredColumn>
```

- [ ] **Step 6: Delete old wizard navigation files and update barrel exports**

```bash
rm apps/taxklaro/frontend/src/components/computation/WizardPage.tsx
rm apps/taxklaro/frontend/src/components/computation/ComputationPageHeader.tsx
rm apps/taxklaro/frontend/src/components/computation/SaveStatusIndicator.tsx
rm apps/taxklaro/frontend/src/components/computation/QuarterlyBreakdownView.tsx
rm apps/taxklaro/frontend/src/components/wizard/WizardProgressBar.tsx
rm apps/taxklaro/frontend/src/components/wizard/WizardNavControls.tsx
rm apps/taxklaro/frontend/src/components/wizard/WizardReview.tsx
rm -rf apps/taxklaro/frontend/src/components/wizard/steps/
```

Check if `src/components/wizard/index.ts` exists — if so, update it to remove exports for deleted files (WizardReview, WizardProgressBar, WizardNavControls, steps/).

- [ ] **Step 6b: Verify `computeActiveSteps()` with new section grouping**

Read `src/lib/wizard-routing.ts` carefully. Verify that the Section 5 grouping (WS-10, WS-11, WS-12) works correctly:
- WS-10 (Registration) — is it always returned by `computeActiveSteps()`? Check if it has dependencies on earlier fields.
- WS-11 (8% eligibility) — only shown if PURELY_SE + not VAT + gross ≤ 3M. In the accordion, this field appears/disappears within Section 5 based on conditions.
- If `computeActiveSteps()` doesn't return a step, the accordion hides those fields within the section. Verify this logic works for the new section boundaries.

- [ ] **Step 7: Adapt step component prop interfaces**

The 17 wizard step components (WS00 through WS13) likely accept props like `{ data, onChange, onBack, onSubmit, onNext }` for the paginated wizard context. In the accordion context, `onBack`/`onSubmit`/`onNext` are no longer needed.

For each step component in `src/components/wizard/`:
1. Read the component to identify its prop interface
2. Make `onBack`, `onSubmit`, `onNext` optional (add `?` to the type) or remove them if the component doesn't use them internally
3. The accordion passes only `{ data, onChange }` — step components should work with just these

The common pattern should be:
```typescript
interface WizardStepProps {
  data: Partial<WizardFormData>
  onChange: (updates: Partial<WizardFormData>) => void
  onBack?: () => void    // optional, unused in accordion
  onSubmit?: () => void  // optional, unused in accordion
}
```

- [ ] **Step 8: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 9: Commit**

```bash
git add -A apps/taxklaro/frontend/src/components/computation/ apps/taxklaro/frontend/src/components/wizard/ apps/taxklaro/frontend/src/routes/computations/new.tsx
git commit -m "feat(taxklaro): accordion wizard — 17 steps consolidated into 5 sections"
```

---

## Task 6: Results View Redesign

**Files:**
- Create: `src/components/results/HeroNumber.tsx`
- Create: `src/components/results/RecommendationPill.tsx`
- Create: `src/components/results/RegimeComparison.tsx`
- Create: `src/components/results/CollapsibleResultSection.tsx`
- Create: `src/components/results/ResultsActions.tsx`
- Modify: `src/components/computation/ResultsView.tsx`

- [ ] **Step 1: Create HeroNumber.tsx**

```tsx
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface HeroNumberProps {
  label: string
  amount: string | number
}

export function HeroNumber({ label, amount }: HeroNumberProps) {
  return (
    <div className="text-center mb-10">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">{label}</div>
      <div className="text-[52px] font-bold tabular-nums tracking-tight leading-none">
        <MoneyDisplay amount={amount} />
      </div>
    </div>
  )
}
```

Note: The implementer should check how `MoneyDisplay` currently renders — it may need adjustment to work at 52px without its own size classes. If `MoneyDisplay` wraps in a `<span>` with fixed classes, the hero number may need to render the peso formatting inline instead.

- [ ] **Step 2: Create RecommendationPill.tsx**

```tsx
interface RecommendationPillProps {
  regimeName: string
  savings: string | number
}

export function RecommendationPill({ regimeName, savings }: RecommendationPillProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
        <span className="text-[13px] text-green-500">{regimeName} recommended</span>
        <span className="text-xs text-green-500/70">· saves ₱{typeof savings === 'number' ? savings.toLocaleString() : savings}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create RegimeComparison.tsx**

```tsx
interface RegimeOption {
  name: string
  amount: string | number
  effectiveRate: string
  isRecommended: boolean
}

interface RegimeComparisonProps {
  options: RegimeOption[]
}

export function RegimeComparison({ options }: RegimeComparisonProps) {
  return (
    <div className="mb-6">
      <div className="text-[13px] font-medium mb-3">Regime Comparison</div>
      <div className="flex flex-col gap-px">
        {options.map((option, i) => (
          <div
            key={option.name}
            className={cn(
              'flex items-center justify-between px-4 py-3',
              option.isRecommended
                ? 'bg-green-500/5 border border-green-500/10'
                : 'bg-zinc-900/50 border border-zinc-800',
              i === 0 && 'rounded-t-md',
              i === options.length - 1 && 'rounded-b-md'
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                option.isRecommended ? 'bg-green-500' : 'bg-zinc-600'
              )} />
              <span className={cn('text-[13px]', option.isRecommended ? 'font-medium' : 'text-zinc-500')}>
                {option.name}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className={cn(
                'text-[13px] tabular-nums',
                option.isRecommended ? 'font-semibold' : 'text-zinc-500'
              )}>
                ₱{typeof option.amount === 'number' ? option.amount.toLocaleString() : option.amount}
              </span>
              <span className="text-[11px] text-zinc-500">{option.effectiveRate} eff.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Note: The `cn` import should be at the top of the file with other imports.

- [ ] **Step 4: Create CollapsibleResultSection.tsx**

```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleResultSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function CollapsibleResultSection({ title, children, className }: CollapsibleResultSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('bg-zinc-900/30', className)}>
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-[13px] text-zinc-50">{title}</span>
        <span className={cn('text-xs text-zinc-600 transition-transform duration-200', open && 'rotate-90')}>›</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create ResultsActions.tsx**

```tsx
import { Button } from '@/components/ui/button'

interface ResultsActionsProps {
  onDownloadPdf: () => void
  onShareLink: () => void
  onEditInputs?: () => void
}

export function ResultsActions({ onDownloadPdf, onShareLink, onEditInputs }: ResultsActionsProps) {
  return (
    <div className="flex gap-2 mt-6">
      <Button className="flex-1" onClick={onDownloadPdf}>Download PDF</Button>
      <Button className="flex-1" variant="outline" onClick={onShareLink}>Share Link</Button>
      {onEditInputs && (
        <Button className="flex-1" variant="outline" onClick={onEditInputs}>Edit Inputs</Button>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Rewrite ResultsView.tsx**

Read the current `src/components/computation/ResultsView.tsx` to understand what data it receives from the WASM engine (`TaxComputationResult`). Then rewrite it to use the new components.

The structure should be:
1. `WarningsBanner` (if warnings exist — restyle with amber bg)
2. `HeroNumber` (total tax due from result)
3. `RecommendationPill` (recommended regime + savings)
4. `RegimeComparison` (map engine paths to options)
5. Stacked `CollapsibleResultSection` components wrapping the existing result sub-components (restyled)
6. `ResultsActions`

The JSX skeleton should follow this structure:

```tsx
export function ResultsView({ result, onEditInputs, onShareLink, onDownloadPdf }: ResultsViewProps) {
  // Extract key values from TaxComputationResult
  const totalTax = result.recommendedPath?.totalTaxDue ?? result.paths[0]?.totalTaxDue
  const recommended = result.paths.find(p => p.isRecommended)
  const savings = result.savings

  return (
    <div>
      {result.warnings?.length > 0 && <WarningsBanner warnings={result.warnings} />}
      <HeroNumber label="Total Tax Due" amount={totalTax} />
      {recommended && savings && (
        <RecommendationPill regimeName={recommended.name} savings={savings} />
      )}
      <RegimeComparison options={result.paths.map(p => ({
        name: p.name,
        amount: p.totalTaxDue,
        effectiveRate: p.effectiveRate,
        isRecommended: p.isRecommended,
      }))} />
      <div className="flex flex-col gap-px rounded-md overflow-hidden">
        <CollapsibleResultSection title="Tax Breakdown">
          <TaxBreakdownPanel data={result} />
          {result.percentageTax && <PercentageTaxSummary data={result.percentageTax} />}
        </CollapsibleResultSection>
        <CollapsibleResultSection title="Quarterly Installments">
          <InstallmentSection data={result} />
        </CollapsibleResultSection>
        <CollapsibleResultSection title="Balance Payable">
          <BalancePayableSection data={result} />
        </CollapsibleResultSection>
        {result.penalties && (
          <CollapsibleResultSection title="Penalties & Surcharges">
            <PenaltySummary data={result.penalties} />
          </CollapsibleResultSection>
        )}
        <CollapsibleResultSection title="BIR Form Recommendation">
          <BirFormRecommendation data={result} />
        </CollapsibleResultSection>
        {result.manualReviewFlags?.length > 0 && (
          <CollapsibleResultSection title="Manual Review Flags" className="bg-amber-500/5">
            <ManualReviewFlags flags={result.manualReviewFlags} />
          </CollapsibleResultSection>
        )}
        <CollapsibleResultSection title="Regime Detail">
          <PathDetailAccordion data={result} />
        </CollapsibleResultSection>
      </div>
      <ResultsActions onDownloadPdf={onDownloadPdf} onShareLink={onShareLink} onEditInputs={onEditInputs} />
    </div>
  )
}
```

Note: The exact prop names on `TaxComputationResult` will differ — read `src/types/engine-output.ts` to get the correct field names. The skeleton above shows the component composition pattern.

The existing result sub-components (`TaxBreakdownPanel`, `BalancePayableSection`, etc.) are kept and restyled (Task 11) — they just get wrapped in `CollapsibleResultSection` instead of being rendered inline.

- [ ] **Step 7: Delete replaced result components and update barrel**

```bash
rm apps/taxklaro/frontend/src/components/results/RecommendationBanner.tsx
rm apps/taxklaro/frontend/src/components/results/RegimeComparisonTable.tsx
```

Update `src/components/results/index.ts` — remove exports for `RecommendationBanner` and `RegimeComparisonTable`, add exports for `HeroNumber`, `RecommendationPill`, `RegimeComparison`, `CollapsibleResultSection`, `ResultsActions`.

- [ ] **Step 8: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 9: Commit**

```bash
git add apps/taxklaro/frontend/src/components/results/ apps/taxklaro/frontend/src/components/computation/ResultsView.tsx
git commit -m "feat(taxklaro): results view — hero number, progressive disclosure, collapsible sections"
```

---

## Task 7: Restyle Computation Detail Page

**Files:**
- Modify: `src/routes/computations/$compId.tsx`
- Modify: `src/components/computation/WizardForm.tsx`
- Delete: `src/components/computation/AutoSaveIndicator.tsx`
- Modify: `src/routes/computations/$compId.quarterly.tsx` (convert to redirect)

- [ ] **Step 1: Read current $compId.tsx**

Read `src/routes/computations/$compId.tsx` to understand the current tab structure (Input/Results/Share tabs), how data is loaded, and how auto-save works.

- [ ] **Step 2: Restyle $compId.tsx**

Replace the current layout with:
- `CenteredColumn wide` wrapper
- Page heading with computation title
- Underline tabs (using restyled shadcn Tabs from Task 2): Input | Results
- Share functionality moved to ResultsActions "Share Link" button
- Pass `saveStatus` to TopBar via context or prop drilling (read how the current auto-save indicator works)

- [ ] **Step 3: Update WizardForm.tsx for accordion edit mode**

Read `src/components/computation/WizardForm.tsx`. It currently renders all steps stacked. Replace with `AccordionWizard` (same component from Task 5) but in "edit mode" — all sections start completed/collapsed (not just section 1 open).

- [ ] **Step 4: Convert quarterly route to redirect**

Read `src/routes/computations/$compId.quarterly.tsx`. Replace with a redirect to the parent computation route:

```tsx
// Use TanStack Router's redirect in beforeLoad or render Navigate
import { Navigate } from '@tanstack/react-router'
```

- [ ] **Step 5: Delete replaced computation components**

```bash
rm apps/taxklaro/frontend/src/components/computation/AutoSaveIndicator.tsx
rm apps/taxklaro/frontend/src/components/computation/ActionsBar.tsx
rm apps/taxklaro/frontend/src/components/computation/ShareToggle.tsx
rm apps/taxklaro/frontend/src/components/computation/ComputationCard.tsx
rm apps/taxklaro/frontend/src/components/computation/ComputationCardSkeleton.tsx
```

Check if `AddNoteForm.tsx`, `NotesList.tsx` are used in the computation detail page — if so, restyle them for dark theme (zinc-900 bg, zinc-800 borders). If they're unused, delete them.

Check if `src/components/deadlines/DeadlineCard.tsx` or `DeadlinesList.tsx` are used — restyle or replace with `ListRow`.

- [ ] **Step 6: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A apps/taxklaro/frontend/src/routes/computations/ apps/taxklaro/frontend/src/components/computation/
git commit -m "refactor(taxklaro): restyle computation detail — underline tabs, accordion edit, remove quarterly route"
```

---

## Task 8: Restyle List Pages

**Files:**
- Modify: `src/routes/computations/index.tsx`
- Modify: `src/routes/clients/index.tsx`
- Modify: `src/routes/clients/$clientId.tsx`
- Modify: `src/routes/clients/new.tsx`
- Modify: `src/routes/deadlines.tsx`

- [ ] **Step 0: Delete replaced shared components**

```bash
rm apps/taxklaro/frontend/src/components/shared/PageHeader.tsx
rm apps/taxklaro/frontend/src/components/shared/FilterBar.tsx
```

Search for imports of these in route files and remove/replace with inline patterns.

- [ ] **Step 1: Restyle computations list**

Read `src/routes/computations/index.tsx`. Replace with:

```tsx
<CenteredColumn>
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-semibold">Computations</h1>
    <Button asChild><Link to="/computations/new">+ New</Link></Button>
  </div>
  {/* Empty state or list */}
  {computations.length === 0 ? (
    <EmptyState message="No computations yet" actionLabel="+ New Computation" onAction={() => navigate('/computations/new')} />
  ) : (
    <div className="flex flex-col gap-px rounded-md overflow-hidden">
      {computations.map((comp) => (
        <ListRow
          key={comp.id}
          title={`${comp.clientName || comp.title} — ${comp.taxYear} ${comp.filingPeriod}`}
          subtitle={`${comp.regime} · ₱${comp.totalTax} · ${formatDate(comp.updatedAt)}`}
          onClick={() => navigate(`/computations/${comp.id}`)}
        />
      ))}
    </div>
  )}
</CenteredColumn>
```

Adapt to match the actual data structure from the Supabase query in the existing route.

- [ ] **Step 2: Restyle clients list**

Read `src/routes/clients/index.tsx`. Same pattern as computations:

```tsx
<CenteredColumn>
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-semibold">Clients</h1>
    <Button asChild><Link to="/clients/new">+ Add Client</Link></Button>
  </div>
  {/* ListRow for each client */}
</CenteredColumn>
```

- [ ] **Step 3: Restyle clients/new.tsx**

Read the file. Wrap in `CenteredColumn`, restyle form inputs to dark theme. Keep existing form logic and Supabase mutation.

- [ ] **Step 4: Restyle clients/$clientId.tsx**

Read the file. Use `CenteredColumn wide`, show client info + computation list using `ListRow`.

- [ ] **Step 5: Restyle deadlines.tsx**

Read the file. Use `CenteredColumn`:

```tsx
<CenteredColumn>
  <h1 className="text-2xl font-semibold mb-6">Deadlines</h1>
  <div className="flex flex-col gap-px rounded-md overflow-hidden">
    {deadlines.map((d) => (
      <ListRow
        key={d.id}
        title={d.name}
        subtitle={`${d.unfiledCount} clients unfiled`}
        className={d.isUrgent ? 'bg-red-500/5 border border-red-500/10' : undefined}
        rightContent={
          <span className={cn('text-xs', d.isUrgent ? 'text-red-500 font-medium' : 'text-zinc-500')}>
            {formatDate(d.date)}
          </span>
        }
      />
    ))}
  </div>
</CenteredColumn>
```

- [ ] **Step 6: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add apps/taxklaro/frontend/src/routes/computations/index.tsx apps/taxklaro/frontend/src/routes/clients/ apps/taxklaro/frontend/src/routes/deadlines.tsx
git commit -m "refactor(taxklaro): restyle list pages — computations, clients, deadlines"
```

---

## Task 9: Restyle Settings

**Files:**
- Modify: `src/routes/settings/index.tsx`
- Modify: `src/routes/settings/team.tsx`

- [ ] **Step 1: Restyle settings/index.tsx**

Read the file. Replace with single scrollable page using `CenteredColumn`:
- Section headers in uppercase label style (13px, zinc-500, uppercase, tracking-wide)
- Form inputs in dark theme
- Stacked sections separated by `border-b border-zinc-800`

- [ ] **Step 2: Restyle settings/team.tsx**

Read the file. If currently a separate page, consider whether to keep it separate or fold into the main settings page. Per spec: "No tabs — just scroll." The team section should be a scrollable section on the settings page. If the route is separate, restyle it the same way.

- [ ] **Step 3: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add apps/taxklaro/frontend/src/routes/settings/
git commit -m "refactor(taxklaro): restyle settings — scrollable sections, dark theme"
```

---

## Task 10: Restyle Auth & Public Pages

**Files:**
- Modify: `src/routes/index.tsx` (landing)
- Modify: `src/routes/auth.tsx`
- Modify: `src/routes/auth/reset.tsx`
- Modify: `src/routes/auth/reset-confirm.tsx`
- Modify: `src/routes/auth/callback.tsx`
- Modify: `src/routes/onboarding.tsx`
- Modify: `src/routes/invite/$token.tsx`
- Modify: `src/routes/share/$token.tsx`
- Delete: `src/components/pages/LandingPage.tsx` (inline into route)
- Delete: `src/components/pages/DashboardPage.tsx` (dashboard removed)

- [ ] **Step 1: Restyle landing page (index.tsx)**

Read `src/routes/index.tsx` and `src/components/pages/LandingPage.tsx`. Replace with minimal centered auth:

```tsx
<div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-6">
  <span className="text-[28px] font-bold text-zinc-50 mb-2">TaxKlaro</span>
  <p className="text-sm text-zinc-500 mb-8">Philippine tax computation for freelancers and professionals.</p>
  {/* Sign in form or redirect if authenticated */}
</div>
```

- [ ] **Step 2: Restyle auth.tsx**

Read the file. Same centered pattern with form inputs. Dark inputs, white "Sign In" button, muted "Sign up" link.

- [ ] **Step 3: Restyle auth/reset.tsx and auth/reset-confirm.tsx**

Read both files. Same centered layout, single input + submit button each.

- [ ] **Step 4: Update auth/callback.tsx**

Read the file. Ensure it shows a centered `Spinner` during redirect.

- [ ] **Step 5: Restyle onboarding.tsx**

Read the file. Use `CenteredColumn`, restyle form fields.

- [ ] **Step 6: Restyle invite/$token.tsx**

Read the file. Use `PublicHeader` + centered card with accept/decline.

- [ ] **Step 7: Restyle share/$token.tsx**

Read the file. Use `PublicHeader label="Shared Computation"` + new `ResultsView` (without Edit Inputs action).

- [ ] **Step 8: Delete old page components**

```bash
rm apps/taxklaro/frontend/src/components/pages/LandingPage.tsx
rm apps/taxklaro/frontend/src/components/pages/DashboardPage.tsx
```

Check if `SetupPage.tsx` is still referenced — if it maps to onboarding, it may also be removable.

- [ ] **Step 9: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 10: Commit**

```bash
git add -A apps/taxklaro/frontend/src/routes/ apps/taxklaro/frontend/src/components/pages/
git commit -m "refactor(taxklaro): restyle auth, landing, public pages — minimal centered layouts"
```

---

## Task 11: Restyle Existing Result Sub-Components

> **Note:** This task should ideally be done before or alongside Task 6 (Results View Redesign) so the sub-components look correct when wrapped in `CollapsibleResultSection`. If executing sequentially, consider doing this task immediately after Task 5 (before Task 6).

**Files:**
- Modify: `src/components/results/WarningsBanner.tsx`
- Modify: `src/components/results/TaxBreakdownPanel.tsx`
- Modify: `src/components/results/BalancePayableSection.tsx`
- Modify: `src/components/results/InstallmentSection.tsx`
- Modify: `src/components/results/PenaltySummary.tsx`
- Modify: `src/components/results/BirFormRecommendation.tsx`
- Modify: `src/components/results/ManualReviewFlags.tsx`
- Modify: `src/components/results/PathDetailAccordion.tsx`
- Modify: `src/components/results/PercentageTaxSummary.tsx`

- [ ] **Step 1: Restyle WarningsBanner.tsx**

Read the file. Replace styling with amber theme:
```
bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm px-4 py-3 rounded-md mb-4
```

- [ ] **Step 2: Restyle table-based result components**

Read each of: `TaxBreakdownPanel.tsx`, `BalancePayableSection.tsx`, `InstallmentSection.tsx`, `PenaltySummary.tsx`, `BirFormRecommendation.tsx`.

For each:
- Remove card/shadow wrappers
- Tables: `text-sm`, alternating rows with `even:bg-zinc-900/30`
- Peso amounts: `text-right tabular-nums`
- Headers: `text-xs uppercase tracking-wide text-zinc-500`
- Colors: monochrome except green for savings, red for amounts due

- [ ] **Step 3: Restyle ManualReviewFlags.tsx**

Read the file. Amber-tinted pattern similar to warnings.

- [ ] **Step 4: Restyle PathDetailAccordion.tsx and PercentageTaxSummary.tsx**

Read both files. Same dark monochrome treatment.

- [ ] **Step 5: Verify build**

```bash
cd apps/taxklaro/frontend && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add apps/taxklaro/frontend/src/components/results/
git commit -m "refactor(taxklaro): restyle result sub-components — monochrome tables, amber warnings"
```

---

## Task 12: Delete Confirmation Dialog & Remaining Cleanup

**Files:**
- Modify: `src/components/computation/DeleteComputationDialog.tsx`
- Modify: any remaining files with old theme references

- [ ] **Step 1: Restyle DeleteComputationDialog.tsx**

Read the file. Update to use dark dialog (zinc-900 bg, zinc-800 border from Task 2). Destructive button in red-500. Cancel in outline.

- [ ] **Step 2: Search for remaining old theme references**

```bash
cd apps/taxklaro/frontend && grep -r "border-primary\|bg-primary\|text-primary\|font-display\|shadow-sm\|shadow-md\|shadow-lg" src/ --include="*.tsx" --include="*.ts" -l
```

Fix any remaining files that use old color/shadow/font classes.

- [ ] **Step 3: Fix unit/integration tests**

```bash
cd apps/taxklaro/frontend && grep -r "WizardPage\|AppLayout\|SidebarContent\|RecommendationBanner\|RegimeComparisonTable\|PageHeader\|FilterBar\|DashboardPage\|LandingPage\|ComputationPageHeader\|SaveStatusIndicator" src/__tests__/ src/components/*/__tests__/ --include="*.ts" --include="*.tsx" -l
```

Fix any test files that import deleted components. Update test assertions to match new component structure.

- [ ] **Step 4: Search for remaining imports of deleted files**

```bash
cd apps/taxklaro/frontend && grep -r "AppLayout\|SidebarContent\|WizardPage\|WizardProgressBar\|WizardNavControls\|WizardReview\|AutoSaveIndicator\|DashboardPage\|LandingPage\|PageHeader\|FilterBar" src/ --include="*.tsx" --include="*.ts" -l
```

Fix any remaining imports.

- [ ] **Step 5: Full build and type check**

```bash
cd apps/taxklaro/frontend && npm run typecheck && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A apps/taxklaro/frontend/
git commit -m "refactor(taxklaro): cleanup — fix remaining old theme references, update dialog"
```

---

## Task 13: Visual Verification

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

```bash
cd apps/taxklaro/frontend && npm run dev
```

- [ ] **Step 2: Verify each page visually with Playwright**

Use Playwright to navigate to each route and take screenshots. Check:

1. Landing page (`/`) — centered logo + sign-in form, dark background
2. Computations list (`/computations`) — top bar, list rows, "+ New" button
3. New computation (`/computations/new`) — accordion wizard, progress bar, 5 sections
4. Computation detail — underline tabs, accordion form in Input tab, results in Results tab
5. Clients list (`/clients`) — same list pattern
6. Deadlines (`/deadlines`) — list with urgency tinting
7. Settings (`/settings`) — scrollable form sections

- [ ] **Step 3: Verify accordion wizard interaction**

1. Open section 1, fill fields, click section 2 — section 1 should collapse with summary + green check
2. Progress bar should advance
3. Compute button should be disabled until all sections complete
4. Conditional fields: select MIXED_INCOME in section 1, verify compensation fields appear in section 2

- [ ] **Step 4: Verify results view**

1. Complete a computation (or load an existing one)
2. Hero number should be large and centered
3. Recommendation pill should show
4. Detail sections should all be collapsed
5. Click to expand each section

- [ ] **Step 5: Fix any visual issues found**

- [ ] **Step 6: Commit fixes**

```bash
git add -A apps/taxklaro/frontend/
git commit -m "fix(taxklaro): visual verification fixes"
```

---

## Task 14: E2E Test Rewrite

**Files:**
- Modify: `e2e/` test files

- [ ] **Step 1: Inventory existing E2E tests**

```bash
ls apps/taxklaro/frontend/e2e/
```

Read each test file to understand what flows they cover.

- [ ] **Step 2: Update selectors and interaction patterns**

The core changes:
- No more next/back button clicks — instead expand/collapse accordion sections
- No more `data-testid="wizard-step-N"` — look for section triggers
- Tab navigation on computation detail: click underline tabs instead of old tab triggers
- No more sidebar nav — use top bar links
- No dashboard route — tests starting from `/dashboard` should start from `/computations`

- [ ] **Step 3: Run E2E tests**

```bash
cd apps/taxklaro/frontend && npx playwright test
```

- [ ] **Step 4: Fix failing tests**

Iterate on test fixes until they pass.

- [ ] **Step 5: Commit**

```bash
git add apps/taxklaro/frontend/e2e/
git commit -m "test(taxklaro): rewrite E2E tests for accordion wizard and top bar navigation"
```

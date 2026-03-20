# Inheritance Frontend — Sidebar Restructure

**Date:** 2026-03-20
**Status:** Draft

## Summary

Remove Clients and Deadlines navigation tabs and standalone pages. Add Blog to the sidebar. Blog renders inside AppLayout when authenticated, MinimalLayout when not.

**Scope clarification:** We are removing the standalone Clients *management* pages (list, detail, create) and the standalone Deadlines page. Client data creation as part of the case intake flow stays — lawyers don't need a separate client tracker, but the intake form still collects client info when creating a case.

## Changes

### 1. Sidebar nav items

**File:** `src/components/layout/AppLayout.tsx`
- Remove `Clients` and `Deadlines` from `mainNavItems`
- Remove unused imports: `Users`, `CalendarClock`
- Add `BookOpen` import from lucide
- Add Blog entry after New Case

```ts
const mainNavItems = [
  { to: '/' as const,          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases' as const,     label: 'Cases',     icon: FolderOpen      },
  { to: '/cases/new' as const, label: 'New Case',  icon: FilePlus        },
  { to: '/blog' as const,      label: 'Blog',      icon: BookOpen        },
] as const;
```

### 2. Delete standalone client & deadline files

**Routes (delete):**
- `src/routes/clients/index.tsx`
- `src/routes/clients/new.tsx`
- `src/routes/clients/$clientId.tsx`
- `src/routes/deadlines.tsx`

**Components (delete entire directory):**
- `src/components/clients/` (all files including `__tests__/`)

**Schemas (delete):**
- `src/schemas/client.ts`
- `src/schemas/__tests__/client-schema.test.ts`

**Keep (used by intake form and case editor):**
- `src/lib/clients.ts` — used by `GuidedIntakeForm` for client creation during case intake
- `src/lib/deadlines.ts` — used by case editor (`$caseId.tsx`) and `DeadlineCard.tsx`
- `src/types/client.ts` — used by intake form
- `src/components/case/DeadlineTimeline.tsx` — per-case deadlines, not standalone
- `src/components/intake/` — entire intake flow stays as-is
- `src/lib/conflict-check.ts` — used by intake `ConflictCheckStep`

**Tests to delete:**
- `src/lib/__tests__/clients.test.ts` — tests standalone client CRUD (keep if tests also cover intake-used functions)
- `src/components/clients/__tests__/client-components.test.tsx`
- `src/components/clients/__tests__/conflict-check.test.tsx` — tests `ConflictCheckScreen`/`ConflictCheckDialog` (being deleted), but also covers `runConflictCheck`/`getSimilarityColor` from `lib/conflict-check.ts` (being kept). Migrate those function-level tests to `src/lib/__tests__/conflict-check.test.ts`.

**Tests to update:**
- `src/__tests__/router.test.tsx` — remove client/deadline route assertions and imports

### 3. Router updates

**File:** `src/router.ts`

Remove imports and route tree entries:
- `clientsRoute`, `newClientRoute`, `clientDetailRoute` (imports + lines 64-66)
- `deadlinesRoute` (import + line 67)

Move blog routes from `publicRootRoute.addChildren([...])` to `rootRoute.addChildren([...])`:
- `blogIndexRoute` and all 6 individual blog post routes move from lines 51-57 to sit alongside `casesIndexRoute`, etc.

### 4. Blog routing — conditional layout

**File:** `src/routes/__root.tsx`

Move blog out of `isContentRoute` and add an auth-aware check. Add `useAuth` to `RootLayout`:

```tsx
function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  const isAuthRoute = ...;  // unchanged
  const isBlogRoute = pathname.startsWith('/blog');
  const isContentRoute =
    pathname === '/intestate-succession-calculator' ||
    pathname === '/legitimate-share-calculator' ||
    pathname === '/spouse-and-children-inheritance' ||
    pathname === '/illegitimate-child-inheritance' ||
    pathname === '/parents-inheritance-share' ||
    pathname === '/no-will-inheritance-philippines';

  if (isAuthRoute) { ... }       // unchanged
  if (isContentRoute) { ... }    // unchanged — landing pages always MinimalLayout

  // Blog: MinimalLayout when not logged in, AppLayout when logged in
  if (isBlogRoute && !user) {
    return (
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
    );
  }

  // Default: AppLayout (catches blog-when-authenticated + all other routes)
  return <AppLayout><Outlet /></AppLayout>;
}
```

**Auth loading behavior:** During Supabase auth initialization, `user` is `null`, so blog routes briefly render in MinimalLayout. Once auth resolves from localStorage (near-instant), if logged in, the component re-renders with AppLayout. This is an acceptable tradeoff — the alternative (showing AppLayout during loading) would flash a sidebar for unauthenticated SEO visitors, which is worse.

**Blog route files** (all 7 files in `src/routes/blog/`):
- Change `getParentRoute` from `() => publicRootRoute` to `() => rootRoute`

### 5. Update dashboard copy

**File:** `src/routes/index.tsx`

Change the org setup empty state from:
> "Create your organization to unlock clients, deadlines, and team features."

To:
> "Create your organization to unlock cases and team features."

### 6. Post-implementation verification

- Run `tsc --noEmit` to catch stale typed `<Link to="/clients">` or `<Link to="/deadlines">` references anywhere in the codebase
- Run existing test suite, update/remove broken tests

## UX Decisions

- **Authenticated blog:** Same blog components, wrapped in AppLayout. Blog's internal nav (← Inheritance Calculator, breadcrumbs) is slightly redundant with sidebar but not worth conditional logic to hide.
- **Unauthenticated blog:** Unchanged. Standalone MinimalLayout, optimized for SEO visitors. Clean reading experience with CTA cards guiding toward the product.
- **Landing pages:** Always MinimalLayout regardless of auth state.
- **Intake form:** Stays as-is. Client creation during case intake is part of the case workflow, not the standalone Clients feature.

## Out of Scope

- Premium features / paywalled content
- Blog posts by external practitioners
- Any new blog functionality
- Removing client data from the database schema or intake flow

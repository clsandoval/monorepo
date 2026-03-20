# Inheritance Frontend — Sidebar Restructure

**Date:** 2026-03-20
**Status:** Draft

## Summary

Remove Clients and Deadlines features entirely, add Blog to the sidebar for logged-in users. Blog renders inside AppLayout when authenticated, MinimalLayout when not.

## Changes

### 1. Remove Clients & Deadlines from sidebar

**File:** `src/components/layout/AppLayout.tsx`
- Remove `Clients` and `Deadlines` entries from `mainNavItems`
- Remove unused imports: `Users`, `CalendarClock`

New `mainNavItems`:
```ts
const mainNavItems = [
  { to: '/' as const,          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases' as const,     label: 'Cases',     icon: FolderOpen      },
  { to: '/cases/new' as const, label: 'New Case',  icon: FilePlus        },
  { to: '/blog' as const,      label: 'Blog',      icon: BookOpen        },
] as const;
```

### 2. Delete client & deadline files

**Routes (delete entirely):**
- `src/routes/clients/index.tsx`
- `src/routes/clients/new.tsx`
- `src/routes/clients/$clientId.tsx`
- `src/routes/deadlines.tsx`

**Components (delete entirely):**
- `src/components/clients/` (all files in directory)

**Keep:** `DeadlineTimeline` inside `src/components/case/` — this is per-case, not the standalone deadlines page.

**Router (`src/router.ts`):**
- Remove all client and deadline route imports and registrations

### 3. Add Blog to sidebar

**File:** `src/components/layout/AppLayout.tsx`
- Add `BookOpen` to lucide imports
- Add Blog entry to `mainNavItems` (after New Case, before Settings divider)

### 4. Blog routing — conditional layout

**File:** `src/routes/__root.tsx`

Blog should render in AppLayout when authenticated, MinimalLayout when not. Modify the `isContentRoute` check to be auth-aware for blog routes:

```tsx
const isContentRoute =
    (!user && pathname.startsWith('/blog')) ||
    pathname === '/intestate-succession-calculator' ||
    pathname === '/legitimate-share-calculator' ||
    pathname === '/spouse-and-children-inheritance' ||
    pathname === '/illegitimate-child-inheritance' ||
    pathname === '/parents-inheritance-share' ||
    pathname === '/no-will-inheritance-philippines';
```

This requires adding `useAuth` to `RootLayout`. When logged in, `/blog` falls through to the default `AppLayout` case.

**Blog route files (`src/routes/blog/index.tsx`, `src/routes/blog/$slug.tsx`):**
- Change parent from `publicRootRoute` to `rootRoute` so they participate in the root layout logic

### 5. Update dashboard copy

**File:** `src/routes/index.tsx`

Change the org setup empty state from:
> "Create your organization to unlock clients, deadlines, and team features."

To:
> "Create your organization to unlock cases and team features."

## UX Decisions

- **Authenticated blog:** Same blog components, wrapped in AppLayout. Sidebar breadcrumbs in the blog content are slightly redundant but not worth conditional logic to hide.
- **Unauthenticated blog:** Unchanged. Standalone MinimalLayout, optimized for SEO visitors. Clean reading experience with CTA cards guiding toward the product.
- **Landing pages:** Always MinimalLayout regardless of auth state.

## Out of Scope

- Premium features / paywalled content
- Blog posts by external practitioners
- Any new blog functionality

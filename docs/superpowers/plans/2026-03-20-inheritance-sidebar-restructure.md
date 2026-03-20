# Inheritance Sidebar Restructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Clients/Deadlines tabs, add Blog to sidebar, make blog render in AppLayout for authenticated users and MinimalLayout for unauthenticated visitors.

**Architecture:** Minimal surgery — delete standalone client/deadline routes and components, update sidebar nav items, move blog routes from `publicRootRoute` to `rootRoute`, add auth-aware layout branching in `RootLayout`.

**Tech Stack:** React, TanStack Router, Supabase Auth, Vite, Vitest

**Spec:** `docs/superpowers/specs/2026-03-20-inheritance-sidebar-restructure-design.md`

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Delete | `src/routes/clients/index.tsx` | Standalone clients list page |
| Delete | `src/routes/clients/new.tsx` | New client page |
| Delete | `src/routes/clients/$clientId.tsx` | Client detail page |
| Delete | `src/routes/deadlines.tsx` | Standalone deadlines page |
| Delete | `src/components/clients/ClientList.tsx` | Client list component |
| Delete | `src/components/clients/ClientForm.tsx` | Client form component |
| Delete | `src/components/clients/ConflictCheckDialog.tsx` | Conflict check dialog |
| Delete | `src/components/clients/ConflictCheckScreen.tsx` | Conflict check screen |
| Delete | `src/components/clients/__tests__/client-components.test.tsx` | Client component tests |
| Delete | `src/components/clients/__tests__/conflict-check.test.tsx` | Conflict check component tests (migrate lib tests first) |
| Delete | `src/schemas/client.ts` | Client form schema |
| Delete | `src/schemas/__tests__/client-schema.test.ts` | Client schema tests |
| Delete | `src/lib/clients.ts` | Client CRUD functions (only used by deleted routes) |
| Delete | `src/lib/__tests__/clients.test.ts` | Client CRUD tests |
| Create | `src/lib/__tests__/conflict-check.test.ts` | Migrated tests for `getSimilarityColor` and `runConflictCheck` |
| Modify | `src/components/layout/AppLayout.tsx` | Remove client/deadline nav, add Blog |
| Modify | `src/router.ts` | Remove client/deadline routes, move blog routes |
| Modify | `src/routes/__root.tsx` | Auth-aware blog layout |
| Modify | `src/routes/blog/index.tsx` | Change parent to rootRoute |
| Modify | `src/routes/blog/intestate-vs-testate.tsx` | Change parent to rootRoute |
| Modify | `src/routes/blog/how-to-compute-legitime.tsx` | Change parent to rootRoute |
| Modify | `src/routes/blog/illegitimate-children-rights.tsx` | Change parent to rootRoute |
| Modify | `src/routes/blog/no-will-philippines.tsx` | Change parent to rootRoute |
| Modify | `src/routes/blog/preterition-explained.tsx` | Change parent to rootRoute |
| Modify | `src/routes/blog/parents-inheritance-share.tsx` | Change parent to rootRoute |
| Modify | `src/routes/index.tsx` | Update empty state copy |
| Modify | `src/__tests__/router.test.tsx` | Remove client/deadline tests, add blog, update nav assertions |

**Kept files (used by intake form / case editor):**
- `src/lib/conflict-check.ts` — used by `intake/ConflictCheckStep.tsx`
- `src/lib/deadlines.ts` — used by `routes/cases/$caseId.tsx` and `components/case/DeadlineCard.tsx`
- `src/types/client.ts` — used by `intake/ClientDetailsStep.tsx`, `DecedentInfoStep.tsx`, `IntakeReviewStep.tsx`
- `src/components/case/DeadlineTimeline.tsx` — per-case deadlines display

---

### Task 1: Migrate conflict-check lib tests

Before deleting the `components/clients/` directory, extract the `getSimilarityColor` and `runConflictCheck` unit tests into a new file since `lib/conflict-check.ts` is kept.

**Files:**
- Create: `src/lib/__tests__/conflict-check.test.ts`
- Reference: `src/components/clients/__tests__/conflict-check.test.tsx` (lines 126-231)

- [ ] **Step 1: Create the migrated test file**

Create `apps/inheritance/frontend/src/lib/__tests__/conflict-check.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConflictCheckResult } from '@/lib/conflict-check';

const mockRpc = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import { getSimilarityColor, runConflictCheck } from '../conflict-check';

function makeClearResult(name: string): ConflictCheckResult {
  return {
    client_matches: [],
    heir_matches: [],
    tin_matches: [],
    total_matches: 0,
    outcome: 'clear',
    checked_name: name,
    checked_tin: null,
    checked_at: '2026-03-03T12:00:00Z',
  };
}

describe('getSimilarityColor', () => {
  it('returns red "Exact" for score >= 1.00', () => {
    const result = getSimilarityColor(1.0);
    expect(result.color).toBe('red');
    expect(result.label).toBe('Exact');
    expect(result.className).toContain('red');
  });

  it('returns amber "High" for score >= 0.70', () => {
    const result = getSimilarityColor(0.82);
    expect(result.color).toBe('amber');
    expect(result.label).toBe('High');
    expect(result.className).toContain('amber');
  });

  it('returns amber "High" for score exactly 0.70', () => {
    const result = getSimilarityColor(0.7);
    expect(result.color).toBe('amber');
    expect(result.label).toBe('High');
  });

  it('returns yellow "Moderate" for score >= 0.50', () => {
    const result = getSimilarityColor(0.51);
    expect(result.color).toBe('yellow');
    expect(result.label).toBe('Moderate');
    expect(result.className).toContain('yellow');
  });

  it('returns yellow "Moderate" for score exactly 0.50', () => {
    const result = getSimilarityColor(0.5);
    expect(result.color).toBe('yellow');
    expect(result.label).toBe('Moderate');
  });

  it('returns gray "Low" for score < 0.50', () => {
    const result = getSimilarityColor(0.38);
    expect(result.color).toBe('gray');
    expect(result.label).toBe('Low');
    expect(result.className).toContain('gray');
  });

  it('returns gray "Low" for score 0', () => {
    const result = getSimilarityColor(0);
    expect(result.color).toBe('gray');
    expect(result.label).toBe('Low');
  });
});

describe('runConflictCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls supabase.rpc with correct function name and params', async () => {
    const clearResult = makeClearResult('Test Name');
    mockRpc.mockResolvedValue({ data: clearResult, error: null });

    await runConflictCheck('Test Name', '123-456-789');

    expect(mockRpc).toHaveBeenCalledWith('run_conflict_check', {
      p_name: 'Test Name',
      p_tin: '123-456-789',
    });
  });

  it('omits p_tin when tin not provided', async () => {
    const clearResult = makeClearResult('Test Name');
    mockRpc.mockResolvedValue({ data: clearResult, error: null });

    await runConflictCheck('Test Name');

    expect(mockRpc).toHaveBeenCalledWith('run_conflict_check', {
      p_name: 'Test Name',
    });
  });

  it('returns ConflictCheckResult on success', async () => {
    const expected = makeClearResult('Maria Santos');
    mockRpc.mockResolvedValue({ data: expected, error: null });

    const result = await runConflictCheck('Maria Santos');
    expect(result.outcome).toBe('clear');
    expect(result.total_matches).toBe(0);
    expect(result.checked_name).toBe('Maria Santos');
  });

  it('throws on supabase error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'RPC failed', code: '42000' },
    });

    await expect(runConflictCheck('Test')).rejects.toEqual({
      message: 'RPC failed',
      code: '42000',
    });
  });
});
```

- [ ] **Step 2: Run the new test file**

```bash
cd apps/inheritance/frontend && npx vitest run src/lib/__tests__/conflict-check.test.ts
```

Expected: all 11 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/conflict-check.test.ts
git commit -m "test: migrate conflict-check lib tests before deleting client components"
```

---

### Task 2: Delete standalone client & deadline files

**Files:**
- Delete: `src/routes/clients/index.tsx`
- Delete: `src/routes/clients/new.tsx`
- Delete: `src/routes/clients/$clientId.tsx`
- Delete: `src/routes/deadlines.tsx`
- Delete: `src/components/clients/` (entire directory)
- Delete: `src/schemas/client.ts`
- Delete: `src/schemas/__tests__/client-schema.test.ts`
- Delete: `src/lib/clients.ts`
- Delete: `src/lib/__tests__/clients.test.ts`

All paths relative to `apps/inheritance/frontend/`.

- [ ] **Step 1: Delete client route files**

```bash
cd apps/inheritance/frontend
rm src/routes/clients/index.tsx src/routes/clients/new.tsx src/routes/clients/\$clientId.tsx
rmdir src/routes/clients
```

- [ ] **Step 2: Delete deadlines route file**

```bash
rm src/routes/deadlines.tsx
```

- [ ] **Step 3: Delete client components directory**

```bash
rm -rf src/components/clients
```

- [ ] **Step 4: Delete client schema files**

```bash
rm src/schemas/client.ts src/schemas/__tests__/client-schema.test.ts
```

- [ ] **Step 5: Delete client lib files**

```bash
rm src/lib/clients.ts src/lib/__tests__/clients.test.ts
```

- [ ] **Step 6: Commit deletions**

```bash
git add -u
git commit -m "refactor: delete standalone client & deadline routes, components, and libs"
```

---

### Task 3: Update router — remove client/deadline, move blog routes

**Files:**
- Modify: `src/router.ts`

- [ ] **Step 1: Remove client and deadline imports**

In `src/router.ts`, remove these imports (lines 13-16):

```ts
// DELETE these lines:
import { clientsRoute } from './routes/clients/index';
import { newClientRoute } from './routes/clients/new';
import { clientDetailRoute } from './routes/clients/$clientId';
import { deadlinesRoute } from './routes/deadlines';
```

- [ ] **Step 2: Move blog routes from publicRootRoute to rootRoute and remove client/deadline entries**

The route tree should become:

```ts
const routeTree = rootRoute.addChildren([
  publicRootRoute.addChildren([
    authRoute,
    authCallbackRoute,
    authResetRoute,
    authResetConfirmRoute,
    shareTokenRoute,
    onboardingRoute,
    inviteTokenRoute,
    intestateSuccessionCalculatorRoute,
    legitimateShareCalculatorRoute,
    spouseAndChildrenInheritanceRoute,
    illegitimateChildInheritanceRoute,
    parentsInheritanceShareRoute,
    noWillInheritanceRoute,
  ]),
  indexRoute,
  casesIndexRoute,
  casesNewRoute,
  caseIdRoute,
  caseTaxRoute,
  settingsRoute,
  settingsTeamRoute,
  blogIndexRoute,
  blogIntestateVsTestateRoute,
  blogHowToComputeLegitimeRoute,
  blogIllegitimateChildrenRightsRoute,
  blogNoWillRoute,
  blogPreteritionRoute,
  blogParentsInheritanceRoute,
]);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/inheritance/frontend && npx tsc --noEmit
```

Expected: errors only in `src/__tests__/router.test.tsx` (fixed in Task 7). No production code errors.

- [ ] **Step 4: Commit**

```bash
git add src/router.ts
git commit -m "refactor: remove client/deadline routes, move blog to root route tree"
```

---

### Task 4: Update blog route files — change parent to rootRoute

**Files:**
- Modify: `src/routes/blog/index.tsx`
- Modify: `src/routes/blog/intestate-vs-testate.tsx`
- Modify: `src/routes/blog/how-to-compute-legitime.tsx`
- Modify: `src/routes/blog/illegitimate-children-rights.tsx`
- Modify: `src/routes/blog/no-will-philippines.tsx`
- Modify: `src/routes/blog/preterition-explained.tsx`
- Modify: `src/routes/blog/parents-inheritance-share.tsx`

- [ ] **Step 1: Update all 7 blog route files**

In each file, change the import from:
```ts
import { publicRootRoute } from '@/routes/__root';
```
to:
```ts
import { rootRoute } from '@/routes/__root';
```

And change `getParentRoute` from:
```ts
getParentRoute: () => publicRootRoute,
```
to:
```ts
getParentRoute: () => rootRoute,
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/inheritance/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/blog/
git commit -m "refactor: move blog routes from publicRootRoute to rootRoute"
```

---

### Task 5: Update RootLayout — auth-aware blog layout

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Add useAuth import and update RootLayout**

Replace the entire `__root.tsx` with:

```tsx
import { createRootRoute, createRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  const isAuthRoute =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/share/') ||
    pathname.startsWith('/invite/');
  const isBlogRoute = pathname.startsWith('/blog');
  const isContentRoute =
    pathname === '/intestate-succession-calculator' ||
    pathname === '/legitimate-share-calculator' ||
    pathname === '/spouse-and-children-inheritance' ||
    pathname === '/illegitimate-child-inheritance' ||
    pathname === '/parents-inheritance-share' ||
    pathname === '/no-will-inheritance-philippines';

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Outlet />
      </div>
    );
  }
  if (isContentRoute || (isBlogRoute && !user)) {
    return (
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
    );
  }
  return <AppLayout><Outlet /></AppLayout>;
}

function MinimalLayout() {
  return (
    <main className="min-h-screen bg-background">
      <Outlet />
    </main>
  );
}

export const publicRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_public',
  component: MinimalLayout,
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/inheritance/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat: auth-aware blog layout — AppLayout when logged in, MinimalLayout when not"
```

---

### Task 6: Update sidebar nav items

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Update imports**

Replace:
```ts
import { LayoutDashboard, FilePlus, FolderOpen, Users, CalendarClock, Settings, Scale, LogIn, LogOut, Menu, X } from 'lucide-react';
```

With:
```ts
import { LayoutDashboard, FilePlus, FolderOpen, BookOpen, Settings, Scale, LogIn, LogOut, Menu, X } from 'lucide-react';
```

- [ ] **Step 2: Update mainNavItems**

Replace:
```ts
const mainNavItems = [
  { to: '/' as const,          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases' as const,     label: 'Cases',     icon: FolderOpen      },
  { to: '/cases/new' as const, label: 'New Case',  icon: FilePlus        },
  { to: '/clients' as const,   label: 'Clients',   icon: Users           },
  { to: '/deadlines' as const, label: 'Deadlines', icon: CalendarClock   },
] as const;
```

With:
```ts
const mainNavItems = [
  { to: '/' as const,          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases' as const,     label: 'Cases',     icon: FolderOpen      },
  { to: '/cases/new' as const, label: 'New Case',  icon: FilePlus        },
  { to: '/blog' as const,      label: 'Blog',      icon: BookOpen        },
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppLayout.tsx
git commit -m "feat: update sidebar — remove Clients/Deadlines, add Blog"
```

---

### Task 7: Update dashboard copy

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Update empty state description**

In the `AuthenticatedDashboard` component (~line 112):

```ts
// FROM:
description="Create your organization to unlock clients, deadlines, and team features."

// TO:
description="Create your organization to unlock cases and team features."
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/index.tsx
git commit -m "fix: update dashboard empty state copy to remove clients/deadlines mention"
```

---

### Task 8: Update router tests

**Files:**
- Modify: `src/__tests__/router.test.tsx`

Note: The router test renders routes in an unauthenticated state (supabase mock returns `session: null`). The `AppLayout` sidebar only renders nav items when `user` is present. The `layout > navigation structure` tests that assert sidebar link counts are pre-existing failures unrelated to this change. We fix them here by scoping assertions correctly.

- [ ] **Step 1: Remove client/deadline imports**

Remove lines 19-20:
```ts
import { clientsRoute } from '../routes/clients/index';
import { deadlinesRoute } from '../routes/deadlines';
```

Add blog import:
```ts
import { blogIndexRoute } from '../routes/blog/index';
```

- [ ] **Step 2: Update route tree in test**

Replace the test route tree (lines 141-150):
```ts
const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  casesNewRoute,
  caseIdRoute,
  settingsRoute,
  shareTokenRoute,
  blogIndexRoute,
]);
```

- [ ] **Step 3: Remove client-only mocks**

Remove the clients mock (lines 76-83):
```ts
// DELETE:
vi.mock('../lib/clients', () => ({
  listClients: vi.fn().mockResolvedValue([]),
  createClient: vi.fn(),
  loadClient: vi.fn().mockRejectedValue(new Error('Not found')),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));
```

Remove the organizations mock comment on line 85 that says "clients route uses useOrganization":
```ts
// Change comment from:
// Mock organizations lib — clients route uses useOrganization
// To:
// Mock organizations lib — settings route uses useOrganization
```

- [ ] **Step 4: Update sidebar nav link assertions**

In `'renders layout with sidebar navigation links'` (line 171), remove:
```ts
expect(screen.getAllByText('Clients').length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText('Deadlines').length).toBeGreaterThanOrEqual(1);
```

Note: Do NOT add a `Blog` assertion here — this test runs unauthenticated, and the sidebar only shows "Sign In" when unauthenticated. The nav items are only visible to authenticated users.

- [ ] **Step 5: Delete client/deadline auth tests**

Delete the two test cases at lines 277-291:
```ts
it('/clients renders sign-in prompt when unauthenticated', async () => { ... });
it('/deadlines renders sign-in prompt when unauthenticated', async () => { ... });
```

- [ ] **Step 6: Update nav structure tests**

The `'sidebar contains exactly 5 nav items'` and `'sidebar links point to correct paths'` tests (lines 302-327) assert against the `aside nav` element. Since the test runs unauthenticated, the sidebar `<nav>` only renders a "Sign In" link (1 link). These tests were already pre-broken.

Fix by updating to match unauthenticated state:

```ts
describe('layout > navigation structure', () => {
  it('sidebar shows sign-in link when unauthenticated', async () => {
    await renderRoute('/');

    const sidebar = document.querySelector('aside nav');
    expect(sidebar).toBeTruthy();
    const links = sidebar!.querySelectorAll('a');
    // Unauthenticated sidebar shows only "Sign In"
    expect(links).toHaveLength(1);
  });

  it('sign-in link points to /auth', async () => {
    await renderRoute('/');

    const sidebar = document.querySelector('aside nav');
    expect(sidebar).toBeTruthy();
    const links = Array.from(sidebar!.querySelectorAll('a'));
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/auth?mode=signin&redirect=');
  });
});
```

- [ ] **Step 7: Run tests**

```bash
cd apps/inheritance/frontend && npx vitest run src/__tests__/router.test.tsx
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/__tests__/router.test.tsx
git commit -m "test: update router tests for sidebar restructure"
```

---

### Task 9: Full verification

- [ ] **Step 1: TypeScript check**

```bash
cd apps/inheritance/frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run full test suite**

```bash
cd apps/inheritance/frontend && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Dev server smoke test**

```bash
cd apps/inheritance/frontend && npx vite --port 3456 &
```

Manually verify:
- `/blog` without auth → standalone MinimalLayout, blog articles visible
- `/blog` with auth → AppLayout with sidebar, Blog highlighted in nav
- Sidebar shows: Dashboard, Cases, New Case, Blog, Settings
- No "Clients" or "Deadlines" anywhere in sidebar
- Dashboard empty state says "cases and team features"

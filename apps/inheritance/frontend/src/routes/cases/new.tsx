import { createRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from '../__root';

export const casesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cases/new',
  beforeLoad: ({ context }) => {
    const ctx = context as { auth?: { user: unknown } | undefined };
    if (!ctx.auth?.user) throw redirect({ to: '/auth', search: { mode: 'signin' as const, redirect: '/cases/new' } });
  },
  // Lazy-loaded so the guided intake form stays out of the landing-path chunk.
  // The router awaits the import during navigation, so there is no visible
  // fallback flash.
  component: lazyRouteComponent(() => import('./new.page'), 'CasesNewPage'),
});

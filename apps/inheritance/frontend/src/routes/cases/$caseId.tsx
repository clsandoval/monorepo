import { createRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from '../__root';

export const caseIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cases/$caseId',
  beforeLoad: ({ context }) => {
    const ctx = context as { auth?: { user: unknown } | undefined };
    if (!ctx.auth?.user) throw redirect({ to: '/auth', search: { mode: 'signin' as const, redirect: '/cases' } });
  },
  // Lazy-loaded so the case editor (wizard, results, WASM bridge) stays out of
  // the landing-path chunk. The router awaits the import during navigation, so
  // there is no visible fallback flash.
  component: lazyRouteComponent(() => import('./$caseId.page'), 'CaseEditorPage'),
});

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

import { createRootRouteWithContext, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import type { User } from '@supabase/supabase-js';
import { TopBar } from '../components/layout/TopBar';
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

// Public sub-root: wraps auth/share/invite routes — no TopBar
export const publicRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: Outlet,
});

function AuthenticatedLayout() {
  return (
    <SaveStatusProvider>
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50">
        <TopBar />
        <main className="flex-1 overflow-y-auto py-10">
          <Outlet />
        </main>
      </div>
    </SaveStatusProvider>
  );
}

// Authenticated sub-root: wraps all app routes behind TopBar
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

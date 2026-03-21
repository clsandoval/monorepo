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

// Public sub-root: wraps auth/share/invite routes — no TopBar
export const publicRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: Outlet,
});

function AuthenticatedLayout() {
  return (
    <SaveStatusProvider>
      <div className="flex h-screen bg-background text-foreground">
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

// Authenticated sub-root: wraps all app routes behind Sidebar
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import './index.css';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { router } from './router';
import { SetupPage } from '@/components/SetupPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { installGlobalErrorHandlers } from '@/lib/error-reporting';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

function RouterWithAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then((result: { data: { session: Session | null } }) => {
      setUser(result.data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} context={{ auth: { user } }} />
      <Toaster position="bottom-right" />
    </>
  );
}

// Module scope on purpose: a React remount must not re-run this. The remover is
// discarded because the handlers live for the whole page session.
installGlobalErrorHandlers();

if (!supabaseConfigured) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary><SetupPage /></ErrorBoundary>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><ErrorBoundary><RouterWithAuth /></ErrorBoundary></React.StrictMode>
  );
}

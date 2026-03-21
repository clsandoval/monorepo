import { createRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { rootRoute } from './__root';
import { useAuth } from '../hooks/useAuth';

export const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-6"
      data-testid="index-page"
    >
      <span className="text-[28px] font-bold text-zinc-50 mb-2">TaxKlaro</span>
      <p className="text-sm text-zinc-500 mb-8 text-center">
        Philippine tax computation for freelancers and professionals.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
          className="flex items-center gap-2 h-10 px-6 rounded-lg bg-zinc-50 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          Sign In
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}
          className="h-10 px-6 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
}

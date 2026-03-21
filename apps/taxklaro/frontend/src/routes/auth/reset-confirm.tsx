import { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { publicRootRoute } from '../__root';
import { supabase } from '../../lib/supabase';

export const AuthResetConfirmRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/auth/reset-confirm',
  component: AuthResetConfirmPage,
});

function AuthResetConfirmPage() {
  // Reads #access_token= from URL HASH, not query params
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashReady, setHashReady] = useState(false);

  useEffect(() => {
    // Supabase client auto-detects the hash fragment and sets the session.
    // We just need to wait for the auth state to resolve.
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      setHashReady(true);
    } else {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      data-testid="auth-reset-confirm-page"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[22px] font-bold text-foreground">TaxKlaro</span>
        </div>

        {/* Card */}
        <div className="bg-background rounded-xl p-6 sm:p-8 border border-border">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-foreground">Set New Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-emerald-400 bg-emerald-950 border border-emerald-900 rounded-lg px-3 py-2">
                Your password has been updated successfully.
              </p>
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate({ to: '/' })}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={!hashReady}
                  className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors disabled:opacity-50"
                  placeholder="Min. 6 characters"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !hashReady}
                className="w-full h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { publicRootRoute } from '../__root';
import { resetPassword } from '../../lib/auth';

export const AuthResetRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/auth/reset',
  component: AuthResetPage,
});

function AuthResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
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
      data-testid="auth-reset-page"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[22px] font-bold text-foreground">TaxKlaro</span>
        </div>

        {/* Card */}
        <div className="bg-background rounded-xl p-6 sm:p-8 border border-border">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email and we will send you a link to reset your password.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-emerald-400 bg-emerald-950 border border-emerald-900 rounded-lg px-3 py-2">
                Check your email for a password reset link.
              </p>
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

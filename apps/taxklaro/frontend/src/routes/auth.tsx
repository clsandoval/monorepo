import { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { publicRootRoute } from './__root';
import { signInWithPassword, signUp, signInWithOtp } from '../lib/auth';

export const AuthRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/auth',
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? '/',
    mode: (search.mode as string) ?? 'signin',
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo, mode: initialMode } = AuthRoute.useSearch();
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>(
    initialMode === 'signup' ? 'signup' : initialMode === 'magic' ? 'magic' : 'signin',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === 'magic') {
        const { error: otpError } = await signInWithOtp(email);
        if (otpError) {
          setError(otpError.message);
        } else {
          setInfo('Check your email for a magic link to sign in.');
        }
      } else if (mode === 'signup') {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setInfo('Check your email to confirm your account.');
        }
      } else {
        const { error: signInError } = await signInWithPassword(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          navigate({ to: redirectTo });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-zinc-950"
      data-testid="auth-page"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[22px] font-bold text-zinc-50">TaxKlaro</span>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 rounded-xl p-6 sm:p-8 border border-zinc-800">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-zinc-50">
              {mode === 'signup' ? 'Create Account' : mode === 'magic' ? 'Magic Link' : 'Sign In'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {mode === 'magic'
                ? 'We will send a magic link to your email.'
                : mode === 'signup'
                  ? 'Create a new TaxKlaro account.'
                  : 'Sign in to your TaxKlaro account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'magic' && (
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-xs text-zinc-500 mt-1.5">Min. 6 characters</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2">{error}</p>
            )}
            {info && (
              <p className="text-sm text-emerald-400 bg-emerald-950 border border-emerald-900 rounded-lg px-3 py-2">{info}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-zinc-50 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-1"
            >
              {isSubmitting
                ? 'Please wait...'
                : mode === 'magic'
                  ? 'Send Magic Link'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm">
            {mode === 'signin' && (
              <>
                <div>
                  <button
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    onClick={() => { setMode('magic'); setError(null); setInfo(null); }}
                  >
                    Sign in with magic link instead
                  </button>
                </div>
                <div>
                  <span className="text-zinc-600">No account? </span>
                  <button
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                  >
                    Create one
                  </button>
                </div>
                <div>
                  <button
                    className="text-zinc-600 hover:text-zinc-400 transition-colors"
                    onClick={() => navigate({ to: '/auth/reset' })}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            {mode === 'signup' && (
              <div>
                <span className="text-zinc-600">Already have an account? </span>
                <button
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                >
                  Sign in
                </button>
              </div>
            )}
            {mode === 'magic' && (
              <button
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
              >
                Sign in with password instead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

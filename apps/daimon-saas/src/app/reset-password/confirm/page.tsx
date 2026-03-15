'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- Zod schema ---
const newPasswordSchema = z
  .string()
  .min(1, 'New password is required.')
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password cannot exceed 72 characters.')
  .refine((p) => /[A-Z]/.test(p), 'Password must contain at least one uppercase letter.')
  .refine((p) => /[a-z]/.test(p), 'Password must contain at least one lowercase letter.')
  .refine((p) => /[0-9]/.test(p), 'Password must contain at least one number.');

const ConfirmSchema = z
  .object({
    newPassword: newPasswordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
  });

type ConfirmFormValues = z.infer<typeof ConfirmSchema>;

function mapPasswordUpdateError(error: { message: string; status?: number }): string {
  if (error.message?.includes('New password should be different')) {
    return 'Your new password must be different from your previous password.';
  }
  if (error.message?.includes('should be at least 6 characters')) {
    return 'Password must be at least 8 characters.';
  }
  if (error.message?.toLowerCase().includes('expired') || error.message?.toLowerCase().includes('session')) {
    return 'Your session has expired. Please request a new reset link.';
  }
  if (
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('network')
  ) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  return 'Failed to update password. Please request a new reset link or contact support@daimon.ai.';
}

// --- Password strength ---
function getStrength(password: string): { score: number; label: string; colorClass: string } {
  if (!password) return { score: 0, label: '', colorClass: '' };
  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score === 1) return { score, label: 'Weak', colorClass: 'bg-destructive text-destructive' };
  if (score === 2) return { score, label: 'Fair', colorClass: 'bg-amber-500 text-amber-500' };
  if (score === 3) return { score, label: 'Good', colorClass: 'bg-primary text-primary' };
  return { score, label: 'Strong', colorClass: 'bg-emerald-600 text-emerald-600' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, colorClass } = getStrength(password);
  const bgClass = colorClass.split(' ')[0];
  const textClass = colorClass.split(' ')[1];
  return (
    <div className="mt-2">
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
        className="flex gap-1 h-1"
      >
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={cn(
              'flex-1 transition-colors',
              seg <= score ? bgClass : 'bg-foreground/10'
            )}
          />
        ))}
      </div>
      <p className={cn('text-[11px] mt-1', textClass)}>
        {label}
      </p>
      <span className="sr-only">Password strength: {label}</span>
    </div>
  );
}

// --- Icons ---
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 4C5.5 4 1.73 6.89 0.46 10.5C1.73 14.11 5.5 17 10 17C14.5 17 18.27 14.11 19.54 10.5C18.27 6.89 14.5 4 10 4ZM10 14.75C7.38 14.75 5.25 12.62 5.25 10C5.25 7.38 7.38 5.25 10 5.25C12.62 5.25 14.75 7.38 14.75 10C14.75 12.62 12.62 14.75 10 14.75ZM10 7C8.34 7 7 8.34 7 10C7 11.66 8.34 13 10 13C11.66 13 13 11.66 13 10C13 8.34 11.66 7 10 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.22 2.22a.75.75 0 0 0 0 1.06l1.32 1.32C2.2 5.7 1.07 7.98.46 10.5c1.27 3.61 5.04 6.5 9.54 6.5 1.8 0 3.49-.48 4.94-1.32l2.62 2.62a.75.75 0 1 0 1.06-1.06L3.28 2.22a.75.75 0 0 0-1.06 0ZM10 14.75a4.75 4.75 0 0 1-3.49-1.52l1.1-1.1a3.25 3.25 0 0 0 4.64-4.64l1.38-1.38A4.75 4.75 0 0 1 10 14.75ZM10 5.25c.52 0 1.02.08 1.5.23L10.16 6.82A3.25 3.25 0 0 0 6.82 10.16L5.48 11.5A4.75 4.75 0 0 1 10 5.25Z"
        fill="currentColor"
      />
      <path
        d="M19.54 10.5c-.43-1.22-1.1-2.33-1.96-3.28l-1.07 1.07c.66.74 1.19 1.57 1.52 2.21-.92 1.79-3.11 4-8.03 4a8.8 8.8 0 0 1-1.45-.12l-1.15 1.15c.83.2 1.7.3 2.6.3 4.5 0 8.27-2.89 9.54-6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ExclamationCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r=".75" fill="currentColor" />
    </svg>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// --- Page ---
type TokenState = 'loading' | 'valid' | 'invalid';

function ConfirmForm() {
  // useSearchParams forces this component to be deferred inside Suspense (no static prerender)
  useSearchParams();
  const router = useRouter();
  const [tokenState, setTokenState] = useState<TokenState>('loading');
  const [serverError, setServerError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenState('valid');
      } else if (event === 'SIGNED_OUT' || (!session && tokenState === 'loading')) {
        // Only set invalid if we're still in loading state (no valid session found)
        setTokenState('invalid');
      }
    });

    // Also check current session as fallback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && tokenState === 'loading') {
        // There's a session but no PASSWORD_RECOVERY event yet — wait for event
        // If after a short grace period still no event, mark invalid
        setTimeout(() => {
          setTokenState((prev) => (prev === 'loading' ? 'invalid' : prev));
        }, 3000);
      } else if (!session) {
        setTimeout(() => {
          setTokenState((prev) => (prev === 'loading' ? 'invalid' : prev));
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmFormValues>({
    resolver: zodResolver(ConfirmSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: ConfirmFormValues) {
    setServerError(null);

    const { error } = await supabase.auth.updateUser({ password: data.newPassword });

    if (error) {
      setServerError(mapPasswordUpdateError(error));
      return;
    }

    await supabase.auth.signOut();
    router.push('/login?passwordUpdated=true');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full flex flex-col max-w-[440px] gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 2L20 10L28 8L24 16L28 24L20 22L16 30L12 22L4 24L8 16L4 8L12 10L16 2Z"
              fill="currentColor"
              className="text-foreground"
            />
          </svg>
          <span className="font-heading text-xl font-bold text-foreground">
            Daimon
          </span>
        </Link>

        {/* --- Loading state --- */}
        {tokenState === 'loading' && (
          <Card className="w-full relative overflow-hidden rounded-none ring-0 shadow-[0_1px_3px_rgba(12,31,64,0.08),0_4px_16px_rgba(12,31,64,0.06)] p-0">
            {/* CI Stripe */}
            <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
              <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
              <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
              <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
            </div>
            <CardContent className="flex flex-col items-center py-16">
              <Spinner size={24} />
              <p className="text-sm text-muted-foreground mt-3">
                Validating reset link...
              </p>
            </CardContent>
          </Card>
        )}

        {/* --- Invalid token state --- */}
        {tokenState === 'invalid' && (
          <Card className="w-full relative overflow-hidden rounded-none ring-0 shadow-[0_1px_3px_rgba(12,31,64,0.08),0_4px_16px_rgba(12,31,64,0.06)] p-0">
            {/* CI Stripe */}
            <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
              <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
              <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
              <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
            </div>

            <CardHeader className="px-10 pt-10 pb-0">
              <CardTitle className="font-heading text-2xl font-medium text-foreground">
                Reset link expired
              </CardTitle>
            </CardHeader>

            <CardContent className="px-10 pb-10 text-center pt-4">
              {/* Warning icon */}
              <div className="flex justify-center mb-5">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M24 6L44 42H4L24 6Z" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <path d="M24 20v10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="24" cy="35" r="1.5" fill="#F59E0B" />
                </svg>
              </div>
              <p className="text-sm text-foreground/70 mb-1">
                This password reset link has expired or is invalid.
              </p>
              <p className="text-sm text-foreground/70 mb-7">
                Reset links are valid for 1 hour.
              </p>
              <Link
                href="/reset-password"
                className="flex items-center justify-center w-full h-11 rounded-none bg-primary text-primary-foreground border-[1.5px] border-primary text-[15px] font-semibold no-underline transition-all hover:opacity-85"
              >
                Request New Reset Link
              </Link>
            </CardContent>
          </Card>
        )}

        {/* --- Valid token: new password form --- */}
        {tokenState === 'valid' && (
          <Card className="w-full relative overflow-hidden rounded-none ring-0 shadow-[0_1px_3px_rgba(12,31,64,0.08),0_4px_16px_rgba(12,31,64,0.06)] p-0">
            {/* CI Stripe */}
            <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
              <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
              <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
              <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
            </div>

            <CardHeader className="px-10 pt-10 pb-0">
              <CardTitle className="font-heading text-2xl font-medium text-foreground">
                Choose a new password
              </CardTitle>
              <CardDescription className="text-[15px] text-muted-foreground">
                Your new password must be at least 8 characters and contain uppercase, lowercase, and a number.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-10 pb-10">
              <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password form">
                {/* New password field */}
                <div className="mb-4">
                  <Label
                    htmlFor="newPassword"
                    className={cn(
                      'mb-1.5 text-[13px]',
                      errors.newPassword ? 'text-foreground' : 'text-foreground/70'
                    )}
                  >
                    New password <span aria-hidden="true">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                      disabled={isSubmitting}
                      aria-required="true"
                      aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                      aria-invalid={!!errors.newPassword}
                      {...register('newPassword', {
                        onChange: (e) => setNewPasswordValue(e.target.value),
                      })}
                      className={cn(
                        'h-11 rounded-none border-input px-3.5 pr-11 text-[15px] text-foreground',
                        errors.newPassword && 'border-destructive bg-red-50'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-foreground/50 hover:text-foreground/80 flex items-center"
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={newPasswordValue} />
                  {errors.newPassword && (
                    <p
                      id="newPassword-error"
                      role="alert"
                      className="flex items-center gap-1 text-xs text-destructive mt-1"
                    >
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm new password field */}
                <div className="mb-6">
                  <Label
                    htmlFor="confirmNewPassword"
                    className={cn(
                      'mb-1.5 text-[13px]',
                      errors.confirmNewPassword ? 'text-foreground' : 'text-foreground/70'
                    )}
                  >
                    Confirm new password <span aria-hidden="true">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      aria-required="true"
                      aria-describedby={errors.confirmNewPassword ? 'confirmNewPassword-error' : undefined}
                      aria-invalid={!!errors.confirmNewPassword}
                      {...register('confirmNewPassword')}
                      className={cn(
                        'h-11 rounded-none border-input px-3.5 pr-11 text-[15px] text-foreground',
                        errors.confirmNewPassword && 'border-destructive bg-red-50'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-foreground/50 hover:text-foreground/80 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p
                      id="confirmNewPassword-error"
                      role="alert"
                      className="flex items-center gap-1 text-xs text-destructive mt-1"
                    >
                      {errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                {/* Server error banner */}
                {serverError && (
                  <Alert variant="destructive" className="mb-5 rounded-none border-l-[3px] border-l-destructive bg-red-50">
                    <ExclamationCircleIcon />
                    <AlertDescription className="text-sm text-red-800">
                      {serverError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className={cn(
                    'w-full h-11 rounded-none bg-primary text-primary-foreground border-[1.5px] border-primary text-[15px] font-semibold transition-all',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span className="sr-only">Loading...</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Auth footer */}
        <div className="flex justify-center gap-4 text-xs text-foreground/45">
          <Link href="/terms" className="text-inherit no-underline hover:text-foreground/70">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-inherit no-underline hover:text-foreground/70">
            Privacy Policy
          </Link>
          <a href="mailto:support@daimon.ai" className="text-inherit no-underline hover:text-foreground/70">
            Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense>
      <ConfirmForm />
    </Suspense>
  );
}

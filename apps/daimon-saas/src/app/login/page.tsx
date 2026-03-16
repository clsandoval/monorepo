'use client';

import { Suspense, useState } from 'react';
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
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .max(254, 'Email address is too long.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

function mapAuthError(error: { message: string; status?: number }): string {
  if (error.status === 429) {
    return 'Too many sign-in attempts. Please wait 15 minutes and try again.';
  }
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please verify your email address. Check your inbox for a confirmation link.';
  }
  if (error.message?.includes('banned')) {
    return 'Your account has been suspended. Contact support at support@daimon.ai.';
  }
  if (error.message?.toLowerCase().includes('fetch') || error.message?.toLowerCase().includes('network')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  return 'Something went wrong. Please try again or contact support@daimon.ai.';
}

// --- Eye icons ---
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

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// --- Login Form (uses useSearchParams — must be inside Suspense) ---
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(mapAuthError(error));
      return;
    }

    const next = searchParams.get('next') ?? '/dashboard';
    router.push(next);
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

        {/* Auth Card */}
        <Card className="w-full relative overflow-hidden rounded-none ring-0 shadow-[0_1px_3px_rgba(12,31,64,0.08),0_4px_16px_rgba(12,31,64,0.06)] p-0">
          {/* CI Stripe */}
          <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
            <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
            <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
            <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
          </div>

          <CardHeader className="px-6 sm:px-10 pt-8 sm:pt-10 pb-0">
            <CardTitle className="font-heading text-2xl font-medium text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-[15px] text-muted-foreground">
              Sign in to your Daimon account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-8 sm:pb-10">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email field */}
              <div className="mb-3">
                <Label
                  htmlFor="email"
                  className="mb-1.5 text-sm text-foreground/70"
                >
                  Email <span aria-hidden="true">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  maxLength={254}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                  className={cn(
                    'h-11 rounded-none border-input px-3.5 text-[15px] text-foreground',
                    errors.email && 'border-destructive bg-red-50'
                  )}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="flex items-center gap-1 text-sm text-destructive mt-1"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm text-foreground/70"
                  >
                    Password <span aria-hidden="true">*</span>
                  </Label>
                  <Link
                    href="/reset-password"
                    tabIndex={isSubmitting ? -1 : undefined}
                    className={cn(
                      'text-sm font-medium text-foreground/60 no-underline hover:text-foreground/90 hover:underline',
                      isSubmitting && 'pointer-events-none'
                    )}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                    {...register('password')}
                    className={cn(
                      'h-11 rounded-none border-input px-3.5 text-[15px] text-foreground pr-11',
                      errors.password && 'border-destructive bg-red-50'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-foreground/50 hover:text-foreground/80 flex items-center"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="flex items-center gap-1 text-sm text-destructive mt-1"
                  >
                    {errors.password.message}
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
                className={cn(
                  'w-full h-11 rounded-none bg-primary text-primary-foreground border-[1.5px] border-primary text-[15px] font-semibold transition-all',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? <Spinner /> : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer signup link */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="text-sm text-foreground/60">
            Don&apos;t have an account?
          </span>
          <Link
            href="/signup"
            tabIndex={isSubmitting ? -1 : undefined}
            className={cn(
              'text-sm font-semibold text-foreground hover:text-primary no-underline',
              isSubmitting && 'pointer-events-none'
            )}
          >
            Sign up free
          </Link>
        </div>

        {/* Auth footer links */}
        <div className="flex justify-center gap-4 text-sm text-foreground/45">
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

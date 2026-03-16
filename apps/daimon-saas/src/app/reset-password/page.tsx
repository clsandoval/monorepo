'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .max(254, 'Email address is too long.'),
});

type ResetFormValues = z.infer<typeof ResetSchema>;

function mapResetRequestError(error: { message: string; status?: number }): string {
  if (error.status === 429) {
    return 'Too many reset requests. Please wait before trying again.';
  }
  if (
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('network')
  ) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  return 'Something went wrong. Please try again or contact support@daimon.ai.';
}

// --- Icons ---
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

// --- Success state resend button with cooldown ---
function ResendButton({
  sentToEmail,
  onResendSuccess,
  onResendError,
}: {
  sentToEmail: string;
  onResendSuccess: () => void;
  onResendError: (msg: string) => void;
}) {
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  async function handleResend() {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(sentToEmail, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    });
    setResending(false);
    if (error) {
      onResendError('Failed to resend. Please try again.');
    } else {
      setCooldown(60);
      intervalRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      onResendSuccess();
    }
  }

  const disabled = cooldown > 0 || resending;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleResend}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        'w-full h-11 rounded-none border-[1.5px] border-foreground text-foreground text-[15px] font-semibold transition-all',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {resending ? (
        <Spinner />
      ) : cooldown > 0 ? (
        `Resend available in ${cooldown}s`
      ) : (
        'Resend reset email'
      )}
    </Button>
  );
}

// --- Main form (uses useSearchParams) ---
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendBanner, setResendBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(ResetSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: searchParams.get('email') ?? '',
    },
  });

  async function onSubmit(data: ResetFormValues) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    });

    if (error) {
      setServerError(mapResetRequestError(error));
      return;
    }

    setSentToEmail(data.email);
    setShowSuccess(true);
  }

  if (showSuccess) {
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

          {/* Success card */}
          <Card className="w-full relative overflow-hidden rounded-none ring-0 shadow-[0_1px_3px_hsl(var(--foreground)/0.08),0_4px_16px_hsl(var(--foreground)/0.06)] p-0">
            {/* CI Stripe */}
            <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
              <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
              <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
              <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
            </div>

            <CardHeader className="px-6 sm:px-10 pt-10 pb-0">
              <CardTitle className="font-heading text-2xl font-medium text-foreground">
                Check your email
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pb-10 text-center pt-4">
              {/* Envelope icon */}
              <div className="flex justify-center mb-4">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect x="4" y="10" width="40" height="28" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-primary" />
                  <path d="M4 14l20 14 20-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                </svg>
              </div>

              <p className="text-sm text-foreground/70 mb-1">
                We&apos;ve sent a password reset link to:
              </p>
              <p className="text-sm font-bold text-foreground mb-6">
                {sentToEmail}
              </p>
              <p className="text-sm text-foreground/70 mb-0.5">
                Click the link in the email to reset your password.
              </p>
              <p className="text-sm text-foreground/70 mb-8">
                The link expires in 1 hour.
              </p>

              {/* Divider */}
              <div className="flex justify-center mb-6">
                <Separator className="w-12 h-[3px] bg-primary" />
              </div>

              <p className="text-sm text-foreground/70 mb-3">
                Didn&apos;t receive the email? Check your spam folder.
              </p>

              {resendBanner && (
                <Alert className="mb-3 rounded-none border-l-[3px] border-l-primary bg-primary/20 text-left">
                  <AlertDescription className="text-sm text-foreground">
                    {resendBanner}
                  </AlertDescription>
                </Alert>
              )}

              <ResendButton
                sentToEmail={sentToEmail}
                onResendSuccess={() => setResendBanner('Reset link resent. Check your inbox.')}
                onResendError={(msg) => setResendBanner(msg)}
              />
            </CardContent>
          </Card>

          {/* Back to sign in */}
          <div className="flex justify-center">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground/60 no-underline hover:text-foreground"
            >
              ← Back to sign in
            </Link>
          </div>

          {/* Auth footer */}
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

        {/* Request form card */}
        <Card className="w-full relative overflow-hidden rounded-none ring-0 shadow-[0_1px_3px_hsl(var(--foreground)/0.08),0_4px_16px_hsl(var(--foreground)/0.06)] p-0">
          {/* CI Stripe */}
          <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
            <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
            <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
            <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
          </div>

          <CardHeader className="px-6 sm:px-10 pt-10 pb-0">
            <CardTitle className="font-heading text-2xl font-medium text-foreground">
              Reset your password
            </CardTitle>
            <CardDescription className="text-[15px] text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password form">
              {/* Email field */}
              <div className="mb-6">
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
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer link */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="text-sm text-foreground/60">
            Remember your password?
          </span>
          <Link
            href="/login"
            className="text-sm font-semibold text-foreground hover:text-primary no-underline"
          >
            Sign in
          </Link>
        </div>

        {/* Auth footer */}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

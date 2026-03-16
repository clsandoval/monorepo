'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createTenantForUser } from '@/app/actions/createTenant';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- Zod schema ---
const newPasswordSchema = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password cannot exceed 72 characters.')
  .refine((p) => /[A-Z]/.test(p), 'Password must contain at least one uppercase letter.')
  .refine((p) => /[a-z]/.test(p), 'Password must contain at least one lowercase letter.')
  .refine((p) => /[0-9]/.test(p), 'Password must contain at least one number.');

const SignupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required.')
      .min(2, 'Please enter your full name.')
      .max(100, 'Full name must be 100 characters or less.'),
    email: z
      .string()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.')
      .max(254, 'Email address is too long.'),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    agreeTerms: z.literal(true, {
      error: 'You must agree to the Terms of Service and Privacy Policy to create an account.',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof SignupSchema>;

function mapSignupError(error: { message: string; status?: number }): string {
  if (error.status === 429) {
    return 'Too many signup attempts. Please wait 15 minutes and try again.';
  }
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (error.message?.includes('Signup is disabled')) {
    return 'New signups are temporarily disabled. Please try again later or contact support@daimon.ai.';
  }
  if (error.message?.toLowerCase().includes('weak')) {
    return "Your password doesn't meet security requirements. Please choose a stronger password.";
  }
  if (
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('network')
  ) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  return 'Something went wrong. Please try again or contact support@daimon.ai.';
}

// --- Password strength indicator ---
function getStrength(password: string): { score: number; label: string; colorClass: string } {
  if (!password) return { score: 0, label: '', colorClass: '' };
  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score === 1) return { score, label: 'Weak', colorClass: 'bg-destructive text-destructive' };
  if (score === 2) return { score, label: 'Fair', colorClass: 'bg-amber-500 text-amber-500' };
  if (score === 3) return { score, label: 'Good', colorClass: 'bg-primary text-emerald-700' };
  return { score, label: 'Strong', colorClass: 'bg-emerald-600 text-emerald-600' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, colorClass } = getStrength(password);
  const bgClass = colorClass.split(' ')[0];
  const textClass = colorClass.split(' ')[1];
  return (
    <div className="mt-2" role="status" aria-live="polite">
      <div className="flex gap-1 h-1" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={cn(
              'flex-1 transition-colors duration-200',
              seg <= score ? bgClass : 'bg-foreground/10'
            )}
          />
        ))}
      </div>
      <p className={cn('text-sm mt-1', textClass)}>
        Password strength: {label}
      </p>
    </div>
  );
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

// --- Password field with toggle ---
function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  minLength,
  maxLength,
  autoFocus,
  disabled,
  error,
  showPassword,
  onToggle,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  autoFocus?: boolean;
  disabled: boolean;
  error?: string;
  showPassword: boolean;
  onToggle: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-1.5 text-sm text-foreground/70"
      >
        {label} <span aria-hidden="true">*</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-required="true"
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          {...registration}
          className={cn(
            'h-11 rounded-none border-input px-3.5 text-[15px] text-foreground pr-11',
            error && 'border-destructive bg-red-50'
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-foreground/50 hover:text-foreground/80 flex items-center"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1 text-sm text-destructive mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const confirmPasswordValue = watch('confirmPassword', '');

  // Live cross-field mismatch check once confirmPassword has been touched
  useEffect(() => {
    if (!touchedFields.confirmPassword || !confirmPasswordValue) return;
    if (passwordValue !== confirmPasswordValue) {
      setError('confirmPassword', { type: 'manual', message: 'Passwords do not match.' });
    } else {
      clearErrors('confirmPassword');
    }
  }, [passwordValue, confirmPasswordValue, touchedFields.confirmPassword, setError, clearErrors]);

  async function onSubmit(data: SignupFormValues) {
    setServerError(null);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName.trim() },
      },
    });

    if (authError) {
      setServerError(mapSignupError(authError));
      return;
    }

    // Supabase returns a fake user with empty identities for duplicate emails
    // (when email confirmation is enabled) instead of an error
    if (authData.user?.identities?.length === 0) {
      setServerError('An account with this email already exists. Try signing in.');
      return;
    }

    try {
      const { error: tenantError } = await createTenantForUser({
        userId: authData.user!.id,
        tenantName: `${data.fullName.trim()}'s Workspace`,
      });

      if (tenantError) {
        setServerError(
          'Account created but workspace setup failed. Please contact support@daimon.ai.'
        );
        return;
      }
    } catch {
      setServerError(
        'Account created but workspace setup failed. Please contact support@daimon.ai.'
      );
      return;
    }

    router.push('/dashboard?onboarding=true');
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

          <CardHeader className="px-6 sm:px-10 pt-10 pb-0">
            <CardTitle className="font-heading text-2xl font-medium text-foreground">
              Create your account
            </CardTitle>
            <CardDescription className="text-[15px] text-muted-foreground">
              Start with your Discord bot in minutes.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-10">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Full name field */}
              <div className="mb-4">
                <Label
                  htmlFor="fullName"
                  className="mb-1.5 text-sm text-foreground/70"
                >
                  Full name <span aria-hidden="true">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  autoComplete="name"
                  autoFocus
                  maxLength={100}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  aria-invalid={!!errors.fullName}
                  {...register('fullName')}
                  className={cn(
                    'h-11 rounded-none border-input px-3.5 text-[15px] text-foreground',
                    errors.fullName && 'border-destructive bg-red-50'
                  )}
                />
                {errors.fullName && (
                  <p
                    id="fullName-error"
                    role="alert"
                    className="text-sm text-destructive mt-1"
                  >
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div className="mb-4">
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
                    className="text-sm text-destructive mt-1"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="mb-3">
                <PasswordField
                  id="password"
                  label="Password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  disabled={isSubmitting}
                  error={errors.password?.message}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  registration={register('password')}
                />
                <PasswordStrengthBar password={passwordValue} />
              </div>

              {/* Confirm password field */}
              <div className="mb-5">
                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  error={errors.confirmPassword?.message}
                  showPassword={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                  registration={register('confirmPassword')}
                />
              </div>

              {/* Terms checkbox */}
              <div className="mb-6">
                <label
                  className={cn(
                    'flex items-start gap-2.5',
                    isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <Controller
                    name="agreeTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="agreeTerms"
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : false)}
                        disabled={isSubmitting}
                        aria-required="true"
                        aria-describedby={errors.agreeTerms ? 'agreeTerms-error' : undefined}
                        aria-invalid={!!errors.agreeTerms}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <span className="text-sm text-foreground/65 leading-relaxed">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p
                    id="agreeTerms-error"
                    role="alert"
                    className="text-sm text-destructive mt-1.5"
                  >
                    {errors.agreeTerms.message}
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
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span className="sr-only">Creating account…</span>
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer login link */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="text-sm text-foreground/60">
            Already have an account?
          </span>
          <Link
            href="/login"
            tabIndex={isSubmitting ? -1 : undefined}
            className={cn(
              'text-sm font-semibold text-foreground hover:text-primary no-underline',
              isSubmitting && 'pointer-events-none'
            )}
          >
            Sign in
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

'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createTenantForUser } from '@/app/actions/createTenant';

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
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score === 1) return { score, label: 'Weak', color: '#DC2626' };
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score, label: 'Good', color: '#B4E7DD' };
  return { score, label: 'Strong', color: '#059669' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  return (
    <div style={{ marginTop: '8px', marginBottom: '0' }}>
      <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            style={{
              flex: 1,
              backgroundColor: seg <= score ? color : 'rgba(12,31,64,0.1)',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 400,
          color,
          marginTop: '4px',
        }}
      >
        {label}
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
      className="flex-shrink-0"
    >
      <circle cx="8" cy="8" r="7.25" stroke="#DC2626" strokeWidth="1.5" />
      <path d="M8 5v3.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r=".75" fill="#DC2626" />
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
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: 'rgba(12,31,64,0.7)',
          marginBottom: '6px',
        }}
      >
        {label} <span aria-hidden="true">*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
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
          style={{
            display: 'block',
            width: '100%',
            height: '44px',
            padding: '0 44px 0 14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            color: '#0C1F40',
            backgroundColor: error ? '#FFF5F5' : '#FFFFFF',
            border: error ? '1.5px solid #DC2626' : '1.5px solid rgba(12,31,64,0.2)',
            borderRadius: 0,
            outline: 'none',
            transition: 'border-color 0.15s ease',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'rgba(12,31,64,0.5)',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.8)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.5)')
          }
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: '#DC2626',
            marginTop: '4px',
          }}
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
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const passwordValue = watch('password', '');

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

    router.push('/dashboard?onboarding=true');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F7F7F7' }}
    >
      <div className="w-full flex flex-col" style={{ maxWidth: '440px', gap: '32px' }}>
        {/* Logo */}
        <a
          href="/"
          className="flex items-center justify-center"
          style={{ gap: '8px', transition: 'opacity 0.2s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 2L20 10L28 8L24 16L28 24L20 22L16 30L12 22L4 24L8 16L4 8L12 10L16 2Z"
              fill="#0C1F40"
            />
          </svg>
          <span
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#0C1F40',
            }}
          >
            Daimon
          </span>
        </a>

        {/* Auth Card */}
        <div
          className="w-full relative overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)',
            padding: '40px',
          }}
        >
          {/* CI Stripe */}
          <div aria-hidden="true" className="absolute left-0 top-0 h-full" style={{ width: '6px' }}>
            <div
              className="absolute left-0"
              style={{
                top: '15%',
                height: '70%',
                width: '6px',
                backgroundColor: '#B4E7DD',
                opacity: 0.3,
              }}
            />
            <div
              className="absolute left-0"
              style={{
                top: '35%',
                height: '30%',
                width: '6px',
                backgroundColor: '#9FAAE2',
                opacity: 0.35,
              }}
            />
            <div
              className="absolute left-0"
              style={{
                top: '40%',
                height: '20%',
                width: '6px',
                backgroundColor: '#B4E7DD',
                opacity: 0.6,
              }}
            />
          </div>

          {/* Card header */}
          <div style={{ marginBottom: '24px' }}>
            <h1
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: '24px',
                fontWeight: 500,
                color: '#0C1F40',
                marginBottom: '4px',
              }}
            >
              Create your account
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(12,31,64,0.55)',
              }}
            >
              Start with your Discord bot in minutes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Full name field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="fullName"
                style={{
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(12,31,64,0.7)',
                  marginBottom: '6px',
                }}
              >
                Full name <span aria-hidden="true">*</span>
              </label>
              <input
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
                style={{
                  display: 'block',
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#0C1F40',
                  backgroundColor: errors.fullName ? '#FFF5F5' : '#FFFFFF',
                  border: errors.fullName
                    ? '1.5px solid #DC2626'
                    : '1.5px solid rgba(12,31,64,0.2)',
                  borderRadius: 0,
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
              />
              {errors.fullName && (
                <p
                  id="fullName-error"
                  role="alert"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#DC2626',
                    marginTop: '4px',
                  }}
                >
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(12,31,64,0.7)',
                  marginBottom: '6px',
                }}
              >
                Email <span aria-hidden="true">*</span>
              </label>
              <input
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
                style={{
                  display: 'block',
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#0C1F40',
                  backgroundColor: errors.email ? '#FFF5F5' : '#FFFFFF',
                  border: errors.email
                    ? '1.5px solid #DC2626'
                    : '1.5px solid rgba(12,31,64,0.2)',
                  borderRadius: 0,
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#DC2626',
                    marginTop: '4px',
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '12px' }}>
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
            <div style={{ marginBottom: '20px' }}>
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
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <input
                  id="agreeTerms"
                  type="checkbox"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-describedby={errors.agreeTerms ? 'agreeTerms-error' : undefined}
                  aria-invalid={!!errors.agreeTerms}
                  {...register('agreeTerms')}
                  style={{
                    width: '16px',
                    height: '16px',
                    marginTop: '2px',
                    flexShrink: 0,
                    accentColor: '#B4E7DD',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'rgba(12,31,64,0.65)',
                    lineHeight: '1.4',
                  }}
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0C1F40', textDecoration: 'underline' }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0C1F40', textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <p
                  id="agreeTerms-error"
                  role="alert"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#DC2626',
                    marginTop: '6px',
                  }}
                >
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {/* Server error banner */}
            {serverError && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: '#FEF2F2',
                  borderLeft: '3px solid #DC2626',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#991B1B',
                }}
              >
                <ExclamationCircleIcon />
                <span>{serverError}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '44px',
                backgroundColor: '#B4E7DD',
                color: '#0C1F40',
                border: '1.5px solid #B4E7DD',
                borderRadius: 0,
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              {isSubmitting ? <Spinner /> : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer login link */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(12,31,64,0.6)',
            }}
          >
            Already have an account?
          </span>
          <Link
            href="/login"
            tabIndex={isSubmitting ? -1 : undefined}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0C1F40',
              textDecoration: 'none',
              pointerEvents: isSubmitting ? 'none' : 'auto',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = '#B4E7DD')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = '#0C1F40')
            }
          >
            Sign in
          </Link>
        </div>

        {/* Auth footer links */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: 'rgba(12,31,64,0.45)',
          }}
        >
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <a href="mailto:support@daimon.ai" style={{ color: 'inherit', textDecoration: 'none' }}>
            Support
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
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

// --- Login Form (uses useSearchParams — must be inside Suspense) ---
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);

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
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full"
            style={{ width: '6px' }}
          >
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
              Welcome back
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(12,31,64,0.55)',
              }}
            >
              Sign in to your Daimon account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email field */}
            <div style={{ marginBottom: '12px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: errors.email ? '#0C1F40' : 'rgba(12,31,64,0.7)',
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
                autoFocus
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
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: errors.password ? '#0C1F40' : 'rgba(12,31,64,0.7)',
                  }}
                >
                  Password <span aria-hidden="true">*</span>
                </label>
                <Link
                  href="/reset-password"
                  tabIndex={isSubmitting ? -1 : undefined}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(12,31,64,0.6)',
                    textDecoration: 'none',
                    pointerEvents: isSubmitting ? 'none' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(12,31,64,0.9)';
                    (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(12,31,64,0.6)';
                    (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none';
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '44px',
                    padding: '0 44px 0 14px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#0C1F40',
                    backgroundColor: errors.password ? '#FFF5F5' : '#FFFFFF',
                    border: errors.password
                      ? '1.5px solid #DC2626'
                      : '1.5px solid rgba(12,31,64,0.2)',
                    borderRadius: 0,
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
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
              {errors.password && (
                <p
                  id="password-error"
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
                  {errors.password.message}
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
                if (!isSubmitting)
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting)
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              {isSubmitting ? <Spinner /> : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer signup link */}
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
            Don&apos;t have an account?
          </span>
          <Link
            href="/signup"
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
            Sign up free
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
          <a
            href="mailto:support@daimon.ai"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
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

'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7.25" stroke="#DC2626" strokeWidth="1.5" />
      <path d="M8 5v3.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r=".75" fill="#DC2626" />
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
  const supabase = createClient();

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
    <button
      type="button"
      onClick={handleResend}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '44px',
        backgroundColor: 'transparent',
        color: '#0C1F40',
        border: '1.5px solid #0C1F40',
        borderRadius: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      {resending ? (
        <Spinner />
      ) : cooldown > 0 ? (
        `Resend available in ${cooldown}s`
      ) : (
        'Resend reset email'
      )}
    </button>
  );
}

// --- Logo + CI Stripe (reusable inline) ---
function Logo() {
  return (
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
  );
}

function CIStripe() {
  return (
    <div aria-hidden="true" className="absolute left-0 top-0 h-full" style={{ width: '6px' }}>
      <div
        className="absolute left-0"
        style={{ top: '15%', height: '70%', width: '6px', backgroundColor: '#B4E7DD', opacity: 0.3 }}
      />
      <div
        className="absolute left-0"
        style={{ top: '35%', height: '30%', width: '6px', backgroundColor: '#9FAAE2', opacity: 0.35 }}
      />
      <div
        className="absolute left-0"
        style={{ top: '40%', height: '20%', width: '6px', backgroundColor: '#B4E7DD', opacity: 0.6 }}
      />
    </div>
  );
}

function AuthFooter() {
  return (
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
  );
}

// --- Main form (uses useSearchParams) ---
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendBanner, setResendBanner] = useState<string | null>(null);

  const supabase = createClient();

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F7F7' }}>
        <div className="w-full flex flex-col" style={{ maxWidth: '440px', gap: '32px' }}>
          <Logo />

          {/* Success card */}
          <div className="w-full relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)', padding: '40px' }}>
            <CIStripe />

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: '24px', fontWeight: 500, color: '#0C1F40', marginBottom: '4px' }}>
                Check your email
              </h1>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              {/* Envelope icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect x="4" y="10" width="40" height="28" rx="2" stroke="#B4E7DD" strokeWidth="2.5" fill="none" />
                  <path d="M4 14l20 14 20-14" stroke="#B4E7DD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.7)', marginBottom: '4px' }}>
                We&apos;ve sent a password reset link to:
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#0C1F40', marginBottom: '24px' }}>
                {sentToEmail}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.7)', marginBottom: '2px' }}>
                Click the link in the email to reset your password.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.7)', marginBottom: '32px' }}>
                The link expires in 1 hour.
              </p>

              {/* Divider */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '3px', backgroundColor: '#B4E7DD' }} />
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.7)', marginBottom: '12px' }}>
                Didn&apos;t receive the email? Check your spam folder.
              </p>

              {resendBanner && (
                <div
                  role="alert"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    backgroundColor: 'rgba(180,231,221,0.2)',
                    borderLeft: '3px solid #B4E7DD',
                    padding: '12px 16px',
                    marginBottom: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#0C1F40',
                    textAlign: 'left',
                  }}
                >
                  <span>{resendBanner}</span>
                </div>
              )}

              <ResendButton
                sentToEmail={sentToEmail}
                onResendSuccess={() => setResendBanner('Reset link resent. Check your inbox.')}
                onResendError={(msg) => setResendBanner(msg)}
              />
            </div>
          </div>

          {/* Back to sign in */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(12,31,64,0.6)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#0C1F40')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(12,31,64,0.6)')}
            >
              ← Back to sign in
            </Link>
          </div>

          <AuthFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="w-full flex flex-col" style={{ maxWidth: '440px', gap: '32px' }}>
        <Logo />

        {/* Request form card */}
        <div className="w-full relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)', padding: '40px' }}>
          <CIStripe />

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: '24px', fontWeight: 500, color: '#0C1F40', marginBottom: '4px' }}>
              Reset your password
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 400, color: 'rgba(12,31,64,0.55)' }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password form">
            {/* Email field */}
            <div style={{ marginBottom: '24px' }}>
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
                  border: errors.email ? '1.5px solid #DC2626' : '1.5px solid rgba(12,31,64,0.2)',
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
              aria-busy={isSubmitting}
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
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <span className="sr-only">Loading...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: 'rgba(12,31,64,0.6)' }}>
            Remember your password?
          </span>
          <Link
            href="/login"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0C1F40', textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#B4E7DD')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#0C1F40')}
          >
            Sign in
          </Link>
        </div>

        <AuthFooter />
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

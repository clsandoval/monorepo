'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    <div style={{ marginTop: '8px' }}>
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
        style={{ display: 'flex', gap: '4px', height: '4px' }}
      >
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
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color, marginTop: '4px' }}>
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

// --- Shared layout pieces ---
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
      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0C1F40' }}>
        Daimon
      </span>
    </a>
  );
}

function CIStripe() {
  return (
    <div aria-hidden="true" className="absolute left-0 top-0 h-full" style={{ width: '6px' }}>
      <div className="absolute left-0" style={{ top: '15%', height: '70%', width: '6px', backgroundColor: '#B4E7DD', opacity: 0.3 }} />
      <div className="absolute left-0" style={{ top: '35%', height: '30%', width: '6px', backgroundColor: '#9FAAE2', opacity: 0.35 }} />
      <div className="absolute left-0" style={{ top: '40%', height: '20%', width: '6px', backgroundColor: '#B4E7DD', opacity: 0.6 }} />
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
      <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
      <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
      <a href="mailto:support@daimon.ai" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
    </div>
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="w-full flex flex-col" style={{ maxWidth: '440px', gap: '32px' }}>
        <Logo />

        {/* --- Loading state --- */}
        {tokenState === 'loading' && (
          <div className="w-full relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)', padding: '40px' }}>
            <CIStripe />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
              <Spinner size={24} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.55)', marginTop: '12px' }}>
                Validating reset link...
              </p>
            </div>
          </div>
        )}

        {/* --- Invalid token state --- */}
        {tokenState === 'invalid' && (
          <div className="w-full relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)', padding: '40px' }}>
            <CIStripe />
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: '24px', fontWeight: 500, color: '#0C1F40', marginBottom: '4px' }}>
                Reset link expired
              </h1>
            </div>
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              {/* Warning icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M24 6L44 42H4L24 6Z" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <path d="M24 20v10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="24" cy="35" r="1.5" fill="#F59E0B" />
                </svg>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.7)', marginBottom: '4px' }}>
                This password reset link has expired or is invalid.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(12,31,64,0.7)', marginBottom: '28px' }}>
                Reset links are valid for 1 hour.
              </p>
              <Link
                href="/reset-password"
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
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        )}

        {/* --- Valid token: new password form --- */}
        {tokenState === 'valid' && (
          <div className="w-full relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)', padding: '40px' }}>
            <CIStripe />

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: '24px', fontWeight: 500, color: '#0C1F40', marginBottom: '4px' }}>
                Choose a new password
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 400, color: 'rgba(12,31,64,0.55)' }}>
                Your new password must be at least 8 characters and contain uppercase, lowercase, and a number.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password form">
              {/* New password field */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="newPassword"
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: errors.newPassword ? '#0C1F40' : 'rgba(12,31,64,0.7)',
                    marginBottom: '6px',
                  }}
                >
                  New password <span aria-hidden="true">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
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
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '44px',
                      padding: '0 44px 0 14px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#0C1F40',
                      backgroundColor: errors.newPassword ? '#FFF5F5' : '#FFFFFF',
                      border: errors.newPassword ? '1.5px solid #DC2626' : '1.5px solid rgba(12,31,64,0.2)',
                      borderRadius: 0,
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.8)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.5)')}
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <PasswordStrengthBar password={newPasswordValue} />
                {errors.newPassword && (
                  <p
                    id="newPassword-error"
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
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm new password field */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="confirmNewPassword"
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: errors.confirmNewPassword ? '#0C1F40' : 'rgba(12,31,64,0.7)',
                    marginBottom: '6px',
                  }}
                >
                  Confirm new password <span aria-hidden="true">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-describedby={errors.confirmNewPassword ? 'confirmNewPassword-error' : undefined}
                    aria-invalid={!!errors.confirmNewPassword}
                    {...register('confirmNewPassword')}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '44px',
                      padding: '0 44px 0 14px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#0C1F40',
                      backgroundColor: errors.confirmNewPassword ? '#FFF5F5' : '#FFFFFF',
                      border: errors.confirmNewPassword ? '1.5px solid #DC2626' : '1.5px solid rgba(12,31,64,0.2)',
                      borderRadius: 0,
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.8)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.5)')}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p
                    id="confirmNewPassword-error"
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
                    {errors.confirmNewPassword.message}
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
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        )}

        <AuthFooter />
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

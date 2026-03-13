'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

// ---------------------------------------------------------------------------
// Strength scoring logic (per spec section 2.2)
// ---------------------------------------------------------------------------

function getPasswordStrength(
  password: string,
  minLength: number
): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (password.length < minLength) return { score: 0, label: 'Too short', color: '#DC2626' }
  let score = 0
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels: { score: 1 | 2 | 3 | 4; label: string; color: string }[] = [
    { score: 1, label: 'Weak',   color: '#DC2626' },
    { score: 2, label: 'Fair',   color: '#F59E0B' },
    { score: 3, label: 'Good',   color: '#10B981' },
    { score: 4, label: 'Strong', color: '#059669' },
  ]
  return levels[Math.min(score, 4) - 1] ?? levels[0]
}

// ---------------------------------------------------------------------------
// PasswordStrengthMeter sub-component
// ---------------------------------------------------------------------------

function PasswordStrengthMeter({
  value,
  minLength,
}: {
  value: string
  minLength: number
}) {
  const { score, label, color } = getPasswordStrength(value, minLength)
  const widthPct = `${(score / 4) * 100}%`

  return (
    <div className="mt-[6px]">
      {/* Bar track */}
      <div className="h-[4px] w-full bg-[rgba(12,31,64,0.08)]">
        <div
          className="h-full transition-[width,background-color] duration-300 ease-in-out"
          style={{ width: widthPct, backgroundColor: color }}
        />
      </div>
      {/* Label */}
      <p
        className="text-[12px] font-[400] mt-[3px] text-right"
        style={{ color }}
      >
        {label}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PasswordInput
// ---------------------------------------------------------------------------

export interface PasswordInputProps {
  id: string
  label: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: 'current-password' | 'new-password'
  autoFocus?: boolean
  showStrengthMeter?: boolean
  minLength?: number
  // react-hook-form register support
  name?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      id,
      label,
      value = '',
      onChange,
      placeholder,
      hint,
      error,
      disabled = false,
      required = false,
      autoComplete = 'current-password',
      autoFocus = false,
      showStrengthMeter = false,
      minLength = 8,
      name,
      onBlur,
    },
    ref
  ) {
    const [showPassword, setShowPassword] = React.useState(false)
    const hasError = Boolean(error)

    const rootClass = [
      'flex flex-col',
      hasError ? 'form-field--error' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const inputBase =
      'h-[44px] w-full font-[Inter,sans-serif] text-[15px] font-[400] outline-none border transition-[border-color,box-shadow,background-color] duration-150 ease-in-out pr-[44px] pl-[12px]'

    const inputState = hasError
      ? 'border-[#DC2626] bg-[#FEF2F2] text-[#0C1F40] focus:border-[1.5px] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
      : disabled
        ? 'border-[rgba(12,31,64,0.10)] bg-[#F7F7F7] text-[rgba(12,31,64,0.35)] cursor-not-allowed'
        : 'border-[rgba(12,31,64,0.20)] bg-white text-[#0C1F40] hover:border-[rgba(12,31,64,0.40)] focus:border-[1.5px] focus:border-[#0C1F40] focus:shadow-[0_0_0_3px_rgba(180,231,221,0.30)]'

    return (
      <div className={rootClass}>
        <label
          htmlFor={id}
          className={[
            'text-[13px] font-[500] mb-[6px]',
            disabled ? 'text-[rgba(12,31,64,0.50)]' : 'text-[#0C1F40]',
          ].join(' ')}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-[#DC2626] ml-[2px]">
              *
            </span>
          )}
        </label>

        <div className="relative flex items-center">
          <input
            id={id}
            name={name}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            aria-invalid={hasError ? 'true' : undefined}
            ref={ref}
            className={[inputBase, inputState].join(' ')}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
            disabled={disabled}
            className={[
              'absolute right-0 top-0 w-[44px] h-[44px] flex items-center justify-center',
              'bg-transparent border-none transition-colors duration-150 ease-in-out',
              'focus-visible:outline-[2px] focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-[-2px]',
              disabled
                ? 'text-[rgba(12,31,64,0.20)] cursor-not-allowed'
                : 'text-[rgba(12,31,64,0.45)] hover:text-[rgba(12,31,64,0.80)] cursor-pointer',
            ].join(' ')}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {showStrengthMeter && value.length > 0 && (
          <PasswordStrengthMeter value={value} minLength={minLength} />
        )}

        {hasError && (
          <p id={`${id}-error`} role="alert" className="text-[13px] text-[#DC2626] mt-[4px]">
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p id={`${id}-hint`} className="text-[13px] text-[rgba(12,31,64,0.55)] mt-[4px]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput

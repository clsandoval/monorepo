'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Strength scoring logic (per spec section 2.2)
// ---------------------------------------------------------------------------

function getPasswordStrength(
  password: string,
  minLength: number
): { score: 0 | 1 | 2 | 3 | 4; label: string; colorClass: string } {
  if (password.length < minLength) return { score: 0, label: 'Too short', colorClass: 'text-destructive bg-destructive' }
  let score = 0
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels: { score: 1 | 2 | 3 | 4; label: string; colorClass: string }[] = [
    { score: 1, label: 'Weak', colorClass: 'text-destructive bg-destructive' },
    { score: 2, label: 'Fair', colorClass: 'text-amber-500 bg-amber-500' },
    { score: 3, label: 'Good', colorClass: 'text-emerald-500 bg-emerald-500' },
    { score: 4, label: 'Strong', colorClass: 'text-emerald-600 bg-emerald-600' },
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
  const { score, label, colorClass } = getPasswordStrength(value, minLength)
  const [textColor, bgColor] = colorClass.split(' ')

  return (
    <div className="mt-1.5">
      {/* Bar track */}
      <div className="h-1 w-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300 ease-in-out', bgColor)}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      {/* Label */}
      <p className={cn('text-xs mt-0.5 text-right', textColor)}>
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
      label: labelText,
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

    return (
      <div className="flex flex-col">
        <Label
          htmlFor={id}
          className={cn(
            'text-[13px] font-medium mb-1.5',
            disabled ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {labelText}
          {required && (
            <span aria-hidden="true" className="text-destructive ml-0.5">
              *
            </span>
          )}
        </Label>

        <div className="relative flex items-center">
          <Input
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
            className={cn(
              'h-11 pr-11 text-[15px]',
              hasError && 'border-destructive bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/15'
            )}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
            disabled={disabled}
            className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>

        {showStrengthMeter && value.length > 0 && (
          <PasswordStrengthMeter value={value} minLength={minLength} />
        )}

        {hasError && (
          <p id={`${id}-error`} role="alert" className="text-[13px] text-destructive mt-1">
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p id={`${id}-hint`} className="text-[13px] text-muted-foreground mt-1">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput

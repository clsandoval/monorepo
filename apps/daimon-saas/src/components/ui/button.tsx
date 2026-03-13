'use client'

import * as React from 'react'

// LoadingSpinner sub-component — rendered inside Button when isLoading
function LoadingSpinner({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-secondary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  className?: string
  'aria-label'?: string
  form?: string
}

const base =
  'inline-flex items-center justify-center font-semibold border transition-all duration-200 ease-in-out rounded-none disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4E7DD] focus-visible:ring-offset-2 active:brightness-93'

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-11 px-7 text-[15px] gap-2',
  lg: 'h-[52px] px-9 text-[17px] gap-2.5',
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#B4E7DD] text-[#0C1F40] border-[#B4E7DD] hover:bg-[#B4E7DD]/85',
  secondary:
    'bg-transparent text-[#0C1F40] border-[#0C1F40] hover:bg-[#0C1F40] hover:text-white',
  ghost:
    'bg-transparent text-[#0C1F40] border-transparent hover:bg-[#0C1F40]/6',
  danger:
    'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600',
  'danger-secondary':
    'bg-transparent text-red-500 border-red-500 hover:bg-red-500 hover:text-white',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
  form,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  const classes = [
    base,
    sizeMap[size],
    variantMap[variant],
    fullWidth ? 'w-full block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const resolvedAriaLabel = isLoading && !ariaLabel ? 'Loading…' : ariaLabel

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={isLoading ? 'true' : undefined}
      aria-label={resolvedAriaLabel}
      form={form}
      className={classes}
    >
      {isLoading ? (
        <LoadingSpinner size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {rightIcon && !isLoading ? rightIcon : null}
    </button>
  )
}

export default Button

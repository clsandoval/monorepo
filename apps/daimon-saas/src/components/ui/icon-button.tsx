'use client'

import * as React from 'react'

// LoadingSpinner for IconButton
function LoadingSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface IconButtonProps {
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  'aria-label': string
  tooltip?: string
  type?: 'button' | 'submit'
  className?: string
}

const base =
  'inline-flex items-center justify-center rounded-none transition-all duration-200 ease-in-out disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4E7DD] focus-visible:ring-offset-2 active:brightness-93'

const sizeMap: Record<NonNullable<IconButtonProps['size']>, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizeMap: Record<NonNullable<IconButtonProps['size']>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
}

const variantMap: Record<NonNullable<IconButtonProps['variant']>, string> = {
  primary:
    'bg-[#B4E7DD] text-[#0C1F40] border border-[#B4E7DD] hover:bg-[#B4E7DD]/85',
  secondary:
    'bg-transparent text-[#0C1F40] border border-[#0C1F40] hover:bg-[#0C1F40] hover:text-white',
  ghost:
    'bg-transparent text-[rgba(12,31,64,0.55)] border-transparent border hover:bg-[#0C1F40]/6 hover:text-[#0C1F40]',
  danger:
    'bg-transparent text-[#EF4444] border border-[#EF4444] hover:bg-[#EF4444] hover:text-white',
}

function IconButtonInner({
  icon,
  variant = 'ghost',
  size = 'sm',
  isLoading = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  type = 'button',
  className = '',
}: Omit<IconButtonProps, 'tooltip'>) {
  const isDisabled = disabled || isLoading

  const classes = [base, sizeMap[size], variantMap[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={isLoading ? 'true' : undefined}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={classes}
    >
      {isLoading ? <LoadingSpinner size={iconSizeMap[size]} /> : icon}
    </button>
  )
}

export function IconButton({ tooltip, ...props }: IconButtonProps) {
  if (tooltip) {
    // Wrap in a span with title for basic tooltip behavior
    // Full Tooltip component will be implemented in its own stage
    return (
      <span title={tooltip} style={{ display: 'inline-flex' }}>
        <IconButtonInner {...props} />
      </span>
    )
  }
  return <IconButtonInner {...props} />
}

export default IconButton

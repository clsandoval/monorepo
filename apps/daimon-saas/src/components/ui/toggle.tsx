'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'

export interface ToggleProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  labelPosition?: 'left' | 'right'
  className?: string
}

export function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  labelPosition = 'right',
  className,
}: ToggleProps) {
  // Track dimensions per size
  const trackStyle: React.CSSProperties =
    size === 'sm'
      ? { width: '32px', height: '18px' }
      : { width: '44px', height: '24px' }

  const thumbStyle: React.CSSProperties =
    size === 'sm'
      ? {
          width: '14px',
          height: '14px',
          transform: checked ? 'translateX(16px)' : 'translateX(2px)',
        }
      : {
          width: '18px',
          height: '18px',
          transform: checked ? 'translateX(23px)' : 'translateX(3px)',
        }

  // Track background
  const trackBg = disabled
    ? checked
      ? 'rgba(180,231,221,0.40)'
      : 'rgba(12,31,64,0.08)'
    : checked
      ? '#B4E7DD'
      : 'rgba(12,31,64,0.15)'

  const trackBorder = disabled
    ? checked
      ? 'rgba(180,231,221,0.40)'
      : 'rgba(12,31,64,0.08)'
    : checked
      ? '#B4E7DD'
      : 'rgba(12,31,64,0.15)'

  const wrapperClass = [
    'inline-flex',
    disabled ? 'cursor-not-allowed' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const labelWrapperClass = [
    'flex items-center gap-[10px]',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  const labelTextBlock = (
    <span className="flex flex-col">
      <span className="text-[14px] font-[500] text-[#0C1F40] font-[Inter,sans-serif]">{label}</span>
      {description && (
        <span className="text-[13px] font-[400] text-[rgba(12,31,64,0.55)] mt-[2px] font-[Inter,sans-serif]">
          {description}
        </span>
      )}
    </span>
  )

  return (
    <div className={wrapperClass}>
      <label htmlFor={id} className={labelWrapperClass}>
        {labelPosition === 'left' && labelTextBlock}
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={[
            'relative flex-shrink-0 outline-none transition-[background,border-color] duration-200 ease-in-out',
            'focus-visible:outline-[2px] focus-visible:outline-offset-[2px]',
            checked
              ? 'focus-visible:outline-[#0C1F40]'
              : 'focus-visible:outline-[#B4E7DD]',
            disabled ? 'pointer-events-none' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            ...trackStyle,
            borderRadius: '9999px',
            backgroundColor: trackBg,
            border: `1px solid ${trackBorder}`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-transform duration-200 ease-in-out"
            style={{
              ...thumbStyle,
              left: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
              opacity: disabled ? 0.6 : 1,
            }}
          />
        </button>
        {labelPosition === 'right' && labelTextBlock}
      </label>
    </div>
  )
}

export default Toggle

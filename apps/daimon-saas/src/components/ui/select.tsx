'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  disabled = false,
  required = false,
  className,
}: SelectProps) {
  const hasError = Boolean(error)

  const rootClass = [
    'flex flex-col',
    hasError ? 'form-field--error' : '',
    disabled ? 'form-field--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const selectClass = [
    'h-[44px] w-full appearance-none font-[Inter,sans-serif] text-[15px] font-[400] outline-none border transition-[border-color,box-shadow] duration-150 ease-in-out pl-[12px] pr-[40px] cursor-pointer',
    hasError
      ? 'border-[#DC2626] bg-[#FEF2F2] text-[#0C1F40]'
      : disabled
        ? 'border-[rgba(12,31,64,0.10)] bg-[#F7F7F7] text-[rgba(12,31,64,0.35)] cursor-not-allowed'
        : 'border-[rgba(12,31,64,0.20)] bg-white text-[#0C1F40] hover:border-[rgba(12,31,64,0.40)] focus:border-[1.5px] focus:border-[#0C1F40] focus:shadow-[0_0_0_3px_rgba(180,231,221,0.30)]',
    // CSS-only placeholder coloring when value is empty
    !value ? '[color:rgba(12,31,64,0.35)]' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const chevronColor = hasError
    ? '#DC2626'
    : disabled
      ? 'rgba(12,31,64,0.20)'
      : 'rgba(12,31,64,0.55)'

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

      <div className={['relative', disabled ? 'opacity-60 pointer-events-none' : ''].filter(Boolean).join(' ')}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={hasError ? 'true' : undefined}
          className={selectClass}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150"
          style={{ color: chevronColor }}
          aria-hidden="true"
        />
      </div>

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

export default Select

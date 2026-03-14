'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import { Check, Minus } from 'lucide-react'

export interface CheckboxProps {
  id: string
  label: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  error?: string
  className?: string
  indeterminate?: boolean
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className,
  indeterminate = false,
}: CheckboxProps) {
  const hasError = Boolean(error)

  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const rootClass = [
    'flex flex-col',
    hasError ? 'checkbox-field--error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const labelWrapperClass = [
    'flex items-start gap-[8px]',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  // Custom box visual state classes are driven by CSS peer selectors
  // applied via the hidden native input's focus-visible state.
  // We apply box bg/border inline since Tailwind peer-focus requires
  // the input to precede the span in DOM.
  const boxBase =
    'flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center transition-[background,border-color] duration-150 ease-in-out'

  let boxStyle: React.CSSProperties
  if (disabled) {
    boxStyle = checked
      ? { background: 'rgba(12,31,64,0.30)', border: '1px solid rgba(12,31,64,0.10)' }
      : { background: '#F7F7F7', border: '1px solid rgba(12,31,64,0.10)' }
  } else if (hasError && !checked) {
    boxStyle = { background: 'white', border: '1px solid #DC2626' }
  } else if (checked || indeterminate) {
    boxStyle = { background: '#0C1F40', border: '1px solid #0C1F40' }
  } else {
    boxStyle = { background: 'white', border: '1px solid rgba(12,31,64,0.30)' }
  }

  return (
    <div className={rootClass}>
      <label htmlFor={id} className={labelWrapperClass}>
        {/* Visually hidden native input */}
        <input
          type="checkbox"
          id={id}
          ref={inputRef}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={hasError ? 'true' : undefined}
          className="peer absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap border-0"
        />
        {/* Custom visual box */}
        <span
          aria-hidden="true"
          className={[
            boxBase,
            // Focus ring via peer-focus-visible
            'peer-focus-visible:shadow-[0_0_0_3px_rgba(180,231,221,0.30)] peer-focus-visible:border-[1.5px] peer-focus-visible:border-[#0C1F40]',
            // Hover: only apply when not disabled/error
            !disabled && !hasError && !checked
              ? 'group-hover:border-[rgba(12,31,64,0.60)]'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={boxStyle}
        >
          {checked && !indeterminate && (
            <Check
              size={11}
              className="text-white"
              style={{ opacity: disabled ? 0.6 : 1 }}
              strokeWidth={3}
            />
          )}
          {indeterminate && (
            <Minus
              size={11}
              className="text-white"
              strokeWidth={3}
            />
          )}
        </span>
        <span
          className={[
            'text-[14px] font-[400] leading-[1.5] select-none font-[Inter,sans-serif]',
            disabled ? 'text-[rgba(12,31,64,0.45)]' : 'text-[#0C1F40]',
          ].join(' ')}
        >
          {label}
        </span>
      </label>
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-[#DC2626] mt-[4px] ml-[26px]">
          {error}
        </p>
      )}
    </div>
  )
}

export default Checkbox

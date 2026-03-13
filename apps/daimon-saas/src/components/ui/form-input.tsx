'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormInputProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'url' | 'tel' | 'number'
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  maxLength?: number
  readOnly?: boolean
  className?: string
  // Support react-hook-form register spread (name, onBlur, ref)
  name?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  inputRef?: React.Ref<HTMLInputElement>
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    {
      id,
      label,
      type = 'text',
      value,
      onChange,
      placeholder,
      hint,
      error,
      disabled = false,
      required = false,
      autoComplete,
      autoFocus = false,
      maxLength,
      readOnly = false,
      className,
      name,
      onBlur,
      inputRef,
    },
    ref
  ) {
    const hasError = Boolean(error)

    const rootClass = [
      'flex flex-col',
      hasError ? 'form-field--error' : '',
      disabled ? 'form-field--disabled pointer-events-none' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    // Base input classes
    const inputBase =
      'h-[44px] w-full font-[Inter,sans-serif] text-[15px] font-[400] outline-none border transition-[border-color,box-shadow,background-color] duration-150 ease-in-out'

    const inputState = hasError
      ? 'border-[#DC2626] bg-[#FEF2F2] text-[#0C1F40] focus:border-[1.5px] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
      : disabled
        ? 'border-[rgba(12,31,64,0.10)] bg-[#F7F7F7] text-[rgba(12,31,64,0.35)] cursor-not-allowed'
        : readOnly
          ? 'border-[rgba(12,31,64,0.15)] bg-[#F7F7F7] text-[rgba(12,31,64,0.70)] cursor-default'
          : 'border-[rgba(12,31,64,0.20)] bg-white text-[#0C1F40] hover:border-[rgba(12,31,64,0.40)] focus:border-[1.5px] focus:border-[#0C1F40] focus:shadow-[0_0_0_3px_rgba(180,231,221,0.30)]'

    const inputPadding = hasError ? 'px-3 pr-9' : 'px-3'

    const resolvedRef = inputRef ?? ref

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
            type={type}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            readOnly={readOnly}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            aria-invalid={hasError ? 'true' : undefined}
            ref={resolvedRef as React.Ref<HTMLInputElement>}
            className={[inputBase, inputState, inputPadding].join(' ')}
          />
          {hasError && (
            <AlertCircle
              size={14}
              className="absolute right-[12px] text-[#DC2626] pointer-events-none"
              aria-hidden="true"
            />
          )}
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
)

FormInput.displayName = 'FormInput'

export default FormInput

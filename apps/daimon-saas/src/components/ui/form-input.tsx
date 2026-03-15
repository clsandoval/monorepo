'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Label } from './label'

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
    const resolvedRef = inputRef ?? ref

    return (
      <div
        className={cn(
          'flex flex-col',
          disabled && 'pointer-events-none',
          className
        )}
      >
        {label && (
          <Label
            htmlFor={id}
            className={cn(
              'mb-1.5 text-[13px] font-medium',
              disabled ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {label}
            {required && (
              <span aria-hidden="true" className="ml-0.5 text-destructive">
                *
              </span>
            )}
          </Label>
        )}

        <div className="relative flex items-center">
          <Input
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
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            aria-invalid={hasError ? 'true' : undefined}
            ref={resolvedRef as React.Ref<HTMLInputElement>}
            className={cn(
              'h-[44px] text-[15px]',
              hasError && 'pr-9',
              readOnly && 'cursor-default bg-muted'
            )}
          />
          {hasError && (
            <AlertCircle
              size={14}
              className="pointer-events-none absolute right-3 text-destructive"
              aria-hidden="true"
            />
          )}
        </div>

        {hasError && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1 text-[13px] text-destructive"
          >
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p
            id={`${id}-hint`}
            className="mt-1 text-[13px] text-muted-foreground"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput

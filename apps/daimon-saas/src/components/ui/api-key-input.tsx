'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// ApiKeyValidationBadge
// ---------------------------------------------------------------------------

interface ApiKeyValidationBadgeProps {
  status: 'valid' | 'invalid' | 'unknown'
}

function ApiKeyValidationBadge({ status }: ApiKeyValidationBadgeProps) {
  const config = {
    valid: {
      icon: <CheckCircle size={14} />,
      text: 'Key verified',
      bg: 'rgba(16,185,129,0.10)',
      color: '#059669',
    },
    invalid: {
      icon: <XCircle size={14} />,
      text: 'Invalid key — check and try again',
      bg: 'rgba(220,38,38,0.10)',
      color: '#DC2626',
    },
    unknown: {
      icon: <AlertCircle size={14} />,
      text: 'Could not verify key',
      bg: 'rgba(245,158,11,0.10)',
      color: '#D97706',
    },
  }[status]

  return (
    <div
      className="flex items-center gap-[6px] mt-[6px] px-[10px] py-[6px] text-[13px] font-[500]"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}33`,
      }}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ApiKeyInput
// ---------------------------------------------------------------------------

export interface ApiKeyInputProps {
  id: string
  label: string
  value: string
  onChange?: (value: string) => void
  onSave?: (value: string) => Promise<void>
  onDelete?: () => Promise<void>
  placeholder?: string
  hint?: string
  error?: string
  isValidating?: boolean
  validationStatus?: 'valid' | 'invalid' | 'unknown'
  isMasked?: boolean
  hasExistingValue?: boolean
  disabled?: boolean
  required?: boolean
  keyPrefix?: string
}

export function ApiKeyInput({
  id,
  label,
  value,
  onChange,
  onSave,
  onDelete,
  placeholder,
  hint,
  error,
  isValidating = false,
  validationStatus,
  hasExistingValue = false,
  disabled = false,
  required = false,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const inExistingMode = hasExistingValue && !isEditMode

  // Masked display: show prefix chars then bullets
  const maskedValue = React.useMemo(() => {
    if (!value) return '••••••••••••••••••••••••••••••••'
    const prefixEnd = value.indexOf('••')
    if (prefixEnd > 0) return value
    // mask all but last 4
    const visible = value.slice(0, Math.min(12, value.length - 4))
    return visible + '••••••••••••••••••••••'
  }, [value])

  async function handleSave() {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave(value)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function switchToEditMode() {
    setIsEditMode(true)
  }

  const iconBtnClass =
    'w-[32px] h-[32px] flex items-center justify-center bg-transparent border border-[rgba(12,31,64,0.15)] text-[rgba(12,31,64,0.55)] hover:bg-[rgba(12,31,64,0.05)] hover:text-[rgba(12,31,64,0.90)] hover:border-[rgba(12,31,64,0.30)] transition-[background,border-color,color] duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-[2px]'

  const inputBase =
    'h-[44px] flex-1 font-[Inter,sans-serif] text-[15px] font-[400] outline-none border transition-[border-color,box-shadow,background-color] duration-150 ease-in-out pr-[44px] pl-[12px]'

  const inputState =
    error
      ? 'border-[#DC2626] bg-[#FEF2F2] text-[#0C1F40] focus:border-[1.5px] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
      : disabled
        ? 'border-[rgba(12,31,64,0.10)] bg-[#F7F7F7] text-[rgba(12,31,64,0.35)] cursor-not-allowed'
        : 'border-[rgba(12,31,64,0.20)] bg-white text-[#0C1F40] hover:border-[rgba(12,31,64,0.40)] focus:border-[1.5px] focus:border-[#0C1F40] focus:shadow-[0_0_0_3px_rgba(180,231,221,0.30)]'

  return (
    <div className="flex flex-col">
      <label
        htmlFor={inExistingMode ? undefined : id}
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

      {inExistingMode ? (
        /* ---- Existing key mode ---- */
        <div className="flex items-center gap-[8px]">
          <code
            className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[14px] text-[rgba(12,31,64,0.65)] bg-[rgba(12,31,64,0.04)] border border-[rgba(12,31,64,0.10)] px-[12px] py-[8px] select-none"
          >
            {maskedValue}
          </code>
          <div className="flex items-center gap-[4px]">
            <button
              type="button"
              className={iconBtnClass}
              onClick={handleCopy}
              aria-label="Copy API key"
              disabled={isDeleting}
            >
              {copied
                ? <Check size={14} style={{ color: '#059669' }} />
                : <Copy size={14} />}
            </button>
            <button
              type="button"
              className={iconBtnClass}
              onClick={switchToEditMode}
              aria-label="Edit API key"
              disabled={isDeleting}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className={[iconBtnClass, 'text-[#DC2626] hover:!bg-[#FEF2F2] hover:!border-[#DC2626]'].join(' ')}
              onClick={handleDelete}
              aria-label="Delete API key"
              disabled={isDeleting}
            >
              {isDeleting
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      ) : (
        /* ---- Entry mode ---- */
        <div className="flex items-center gap-[8px]">
          <div className="relative flex-1 flex items-center">
            <input
              id={id}
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={onChange ? (e) => onChange(e.target.value) : undefined}
              placeholder={placeholder}
              disabled={disabled || isValidating || isSaving}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
              aria-invalid={error ? 'true' : undefined}
              className={[inputBase, inputState, 'w-full'].join(' ')}
            />
            <button
              type="button"
              className={[
                'absolute right-0 top-0 w-[44px] h-[44px] flex items-center justify-center',
                'bg-transparent border-none transition-colors duration-150 ease-in-out',
                'focus-visible:outline-[2px] focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-[-2px]',
                disabled || isValidating || isSaving
                  ? 'text-[rgba(12,31,64,0.20)] cursor-not-allowed'
                  : 'text-[rgba(12,31,64,0.45)] hover:text-[rgba(12,31,64,0.80)] cursor-pointer',
              ].join(' ')}
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? 'Hide key' : 'Show key'}
              disabled={disabled || isValidating || isSaving}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {value.length > 0 && !isValidating && !isSaving && (
            <button
              type="button"
              className="h-[44px] px-[16px] flex-shrink-0 bg-[#B4E7DD] text-[#0C1F40] text-[14px] font-[600] border-[1.5px] border-[#B4E7DD] hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-[#0C1F40] focus-visible:outline-offset-[2px]"
              onClick={handleSave}
              disabled={disabled}
            >
              Save
            </button>
          )}
          {(isValidating || isSaving) && (
            <Loader2 size={16} className="animate-spin text-[rgba(12,31,64,0.45)] flex-shrink-0" />
          )}
        </div>
      )}

      {validationStatus && <ApiKeyValidationBadge status={validationStatus} />}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-[#DC2626] mt-[4px]">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-[13px] text-[rgba(12,31,64,0.55)] mt-[4px]">
          {hint}
        </p>
      )}
    </div>
  )
}

export default ApiKeyInput

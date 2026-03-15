'use client'

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

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

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
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-600/20',
    },
    invalid: {
      icon: <XCircle size={14} />,
      text: 'Invalid key — check and try again',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    unknown: {
      icon: <AlertCircle size={14} />,
      text: 'Could not verify key',
      className: 'bg-amber-500/10 text-amber-600 border-amber-600/20',
    },
  }[status]

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 text-[13px] font-medium border',
        config.className
      )}
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

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        <Label
          htmlFor={inExistingMode ? undefined : id}
          className={cn(
            'text-[13px] font-medium mb-1.5',
            disabled ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-destructive ml-0.5">
              *
            </span>
          )}
        </Label>

        {inExistingMode ? (
          /* ---- Existing key mode ---- */
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-muted-foreground bg-muted/40 border border-border px-3 py-2 select-none">
              {maskedValue}
            </code>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopy}
                      aria-label="Copy API key"
                      disabled={isDeleting}
                      className="border border-border text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  }
                />
                <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={switchToEditMode}
                      aria-label="Edit API key"
                      disabled={isDeleting}
                      className="border border-border text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </Button>
                  }
                />
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleDelete}
                      aria-label="Delete API key"
                      disabled={isDeleting}
                      className="border border-border text-destructive hover:bg-destructive/10 hover:border-destructive"
                    >
                      {isDeleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  }
                />
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ) : (
          /* ---- Entry mode ---- */
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Input
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
                aria-describedby={
                  error ? `${id}-error` : hint ? `${id}-hint` : undefined
                }
                aria-invalid={error ? 'true' : undefined}
                className={cn(
                  'h-11 w-full pr-11 pl-3 text-[15px] font-normal',
                  error && 'border-destructive bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/15'
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                disabled={disabled || isValidating || isSaving}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground border-none"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>

            {value.length > 0 && !isValidating && !isSaving && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={disabled}
                className="h-11 px-4 flex-shrink-0 text-sm font-semibold"
              >
                Save
              </Button>
            )}
            {(isValidating || isSaving) && (
              <Loader2
                size={16}
                className="animate-spin text-muted-foreground flex-shrink-0"
              />
            )}
          </div>
        )}

        {validationStatus && <ApiKeyValidationBadge status={validationStatus} />}

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-[13px] text-destructive mt-1"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${id}-hint`}
            className="text-[13px] text-muted-foreground mt-1"
          >
            {hint}
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}

export default ApiKeyInput

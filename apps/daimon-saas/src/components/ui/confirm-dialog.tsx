'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Trash2, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { FormInput } from './form-input'

type ConfirmVariant = 'danger' | 'warning' | 'default'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: ConfirmVariant
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  confirmationText?: string
  confirmationPlaceholder?: string
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    Icon: React.ElementType
    iconColor: string
    iconBg: string
    confirmBg: string
    confirmHoverBg: string
    confirmText: string
  }
> = {
  danger: {
    Icon: Trash2,
    iconColor: '#DC2626',
    iconBg: 'rgba(220,38,38,0.08)',
    confirmBg: '#DC2626',
    confirmHoverBg: '#B91C1C',
    confirmText: '#FFFFFF',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: '#D97706',
    iconBg: 'rgba(217,119,6,0.08)',
    confirmBg: '#D97706',
    confirmHoverBg: '#B45309',
    confirmText: '#FFFFFF',
  },
  default: {
    Icon: HelpCircle,
    iconColor: '#0C1F40',
    iconBg: 'rgba(12,31,64,0.08)',
    confirmBg: '#B4E7DD',
    confirmHoverBg: '#9AD5CB',
    confirmText: '#0C1F40',
  },
}

const titleId = 'confirm-dialog-title'
const descId = 'confirm-dialog-desc'

export function ConfirmDialog({
  open,
  onOpenChange,
  variant = 'default',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  confirmationText,
  confirmationPlaceholder,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)

  const cfg = VARIANT_CONFIG[variant]
  const isLoading = loading || internalLoading
  const isConfirmDisabled =
    isLoading || (confirmationText !== undefined && confirmInput !== confirmationText)

  const handleClose = useCallback(() => {
    if (!isLoading) onOpenChange(false)
  }, [isLoading, onOpenChange])

  async function handleConfirm() {
    const result = onConfirm()
    if (result instanceof Promise) {
      setInternalLoading(true)
      try {
        await result
      } finally {
        setInternalLoading(false)
      }
    }
  }

  // Scroll lock + initial focus
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      setConfirmInput('')
      const timer = setTimeout(() => {
        cancelRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

  // Focus trap
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) return null

  const dialog = (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,31,64,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          animation: 'fadeIn 150ms ease forwards',
        }}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '440px',
          maxWidth: 'calc(100vw - 32px)',
          background: '#FFFFFF',
          border: '1px solid rgba(12,31,64,0.12)',
          borderRadius: 0,
          boxShadow: '0 20px 60px rgba(12,31,64,0.18)',
          zIndex: 51,
          animation: 'modalScaleIn 200ms cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 0' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: cfg.iconBg,
              borderRadius: 0,
            }}
          >
            <cfg.Icon size={20} color={cfg.iconColor} />
          </div>
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--font-archivo, Archivo, sans-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: '#0C1F40',
              margin: 0,
              marginTop: '12px',
              lineHeight: '1.3',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 24px 0' }}>
          <p
            id={descId}
            style={{
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(12,31,64,0.65)',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            {description}
          </p>

          {/* Confirmation input */}
          {confirmationText !== undefined && (
            <div style={{ marginTop: '16px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0C1F40',
                  margin: 0,
                  marginBottom: '6px',
                }}
              >
                Type{' '}
                <code
                  style={{
                    fontFamily: 'monospace',
                    background: 'rgba(12,31,64,0.06)',
                    padding: '2px 4px',
                  }}
                >
                  {confirmationText}
                </code>{' '}
                to confirm
              </p>
              <FormInput
                id="confirm-dialog-input"
                label=""
                value={confirmInput}
                onChange={setConfirmInput}
                placeholder={
                  confirmationPlaceholder ?? `Type ${confirmationText} to confirm`
                }
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            ref={cancelRef}
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            style={{
              height: '38px',
              padding: '0 20px',
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0C1F40',
              background: 'transparent',
              border: '1.5px solid #0C1F40',
              borderRadius: 0,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'rgba(12,31,64,0.05)'
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #B4E7DD'
              e.currentTarget.style.outlineOffset = '2px'
            }}
            onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            style={{
              height: '38px',
              padding: '0 20px',
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '14px',
              fontWeight: 600,
              color: cfg.confirmText,
              background: cfg.confirmBg,
              border: 'none',
              borderRadius: 0,
              cursor: isConfirmDisabled ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.75 : isConfirmDisabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease, opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isConfirmDisabled) e.currentTarget.style.background = cfg.confirmHoverBg
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = cfg.confirmBg }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #B4E7DD'
              e.currentTarget.style.outlineOffset = '2px'
            }}
            onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
          >
            {isLoading && (
              <Loader2
                size={14}
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )

  return createPortal(dialog, document.body)
}

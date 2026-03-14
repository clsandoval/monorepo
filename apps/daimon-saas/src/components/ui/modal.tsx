'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  footer?: React.ReactNode
  showClose?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  loading?: boolean
}

const SIZE_WIDTHS: Record<string, { width: string; maxWidth: string }> = {
  sm: { width: '380px', maxWidth: 'calc(100vw - 32px)' },
  md: { width: '520px', maxWidth: 'calc(100vw - 32px)' },
  lg: { width: '720px', maxWidth: 'calc(100vw - 48px)' },
}

const titleId = 'modal-title'
const descId = 'modal-desc'

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
  showClose = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  loading = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  // Track visible state to allow exit animation before unmounting
  const [visible, setVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setIsClosing(false)
      setVisible(true)
    } else if (visible) {
      setIsClosing(true)
      const t = setTimeout(() => {
        setVisible(false)
        setIsClosing(false)
      }, 150)
      return () => clearTimeout(t)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (!loading) onOpenChange(false)
  }, [loading, onOpenChange])

  // Scroll lock + focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      // Focus first focusable or close button
      const timer = setTimeout(() => {
        const panel = panelRef.current
        if (!panel) return
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeOnEscape, handleClose])

  // Focus trap
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

  if (!visible) return null

  const { width, maxWidth } = SIZE_WIDTHS[size]

  const modal = (
    <>
      {/* Backdrop */}
      <div
        onClick={closeOnBackdrop ? handleClose : undefined}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,31,64,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          animation: isClosing
            ? 'fadeIn 150ms ease-in reverse forwards'
            : 'fadeIn 150ms ease forwards',
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width,
          maxWidth,
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          border: '1px solid rgba(12,31,64,0.12)',
          borderRadius: 0,
          boxShadow: '0 20px 60px rgba(12,31,64,0.18)',
          zIndex: 51,
          overflow: 'hidden',
          animation: isClosing
            ? 'modalScaleOut 150ms ease-in forwards'
            : 'modalScaleIn 200ms cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(12,31,64,0.08)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              id={titleId}
              style={{
                fontFamily: 'var(--font-archivo, Archivo, sans-serif)',
                fontSize: '18px',
                fontWeight: 500,
                color: '#0C1F40',
                margin: 0,
                lineHeight: '1.3',
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                id={descId}
                style={{
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(12,31,64,0.55)',
                  margin: 0,
                  marginTop: '2px',
                }}
              >
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: 0,
                color: 'rgba(12,31,64,0.45)',
                flexShrink: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.color = 'rgba(12,31,64,0.80)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(12,31,64,0.45)' }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid #B4E7DD'
                e.currentTarget.style.outlineOffset = '2px'
              }}
              onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
              disabled={loading}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {children}
          {/* Loading overlay inside modal */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Loader2
                size={24}
                color="#0C1F40"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(12,31,64,0.08)',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  )

  return createPortal(modal, document.body)
}

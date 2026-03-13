'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { ToastContext, ToastItem, ToastVariant } from '@/lib/toast'

// ─── Variant config ────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { Icon: React.ElementType; iconColor: string; accentColor: string }
> = {
  success: {
    Icon: CheckCircle,
    iconColor: '#16A34A',
    accentColor: '#16A34A',
  },
  error: {
    Icon: AlertCircle,
    iconColor: '#DC2626',
    accentColor: '#DC2626',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: '#D97706',
    accentColor: '#D97706',
  },
  info: {
    Icon: Info,
    iconColor: '#0C1F40',
    accentColor: '#B4E7DD',
  },
}

// ─── Single Toast ──────────────────────────────────────────────────────────

interface ToastCardProps {
  item: ToastItem
  onRemove: (id: string) => void
}

function ToastCard({ item, onRemove }: ToastCardProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting'>('entering')
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const remainingRef = useRef((item.duration ?? 4000))
  const startRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cfg = VARIANT_CONFIG[item.variant]
  const duration = item.duration ?? 4000
  const hasProgress = duration > 0

  // Trigger exit animation then remove
  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPhase('exiting')
    setTimeout(() => onRemove(item.id), 200)
  }, [item.id, onRemove])

  // Start/resume auto-dismiss timer
  const startTimer = useCallback(() => {
    if (duration === 0) return
    startRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) dismiss()
    }, remainingRef.current)
  }, [dismiss, duration])

  // Pause timer on hover/focus
  const pauseTimer = useCallback(() => {
    if (duration === 0) return
    pausedRef.current = true
    setPaused(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (startRef.current !== null) {
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - startRef.current)
      )
    }
  }, [duration])

  // Resume timer after hover/focus ends
  const resumeTimer = useCallback(() => {
    if (duration === 0) return
    pausedRef.current = false
    setPaused(false)
    startTimer()
  }, [duration, startTimer])

  // Enter animation then start timer
  useEffect(() => {
    // Small delay so CSS transition triggers
    const raf = requestAnimationFrame(() => {
      setPhase('visible')
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (phase === 'visible') {
      startTimer()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [phase, startTimer])

  const isExiting = phase === 'exiting'
  const isEntering = phase === 'entering'

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '52px',
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(12,31,64,0.10)',
        borderLeft: `3px solid ${cfg.accentColor}`,
        borderRadius: 0,
        boxShadow: '0 4px 16px rgba(12,31,64,0.10)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        overflow: 'hidden',
        transform: isEntering || isExiting
          ? 'translateX(calc(100% + 24px))'
          : 'translateX(0)',
        opacity: isEntering || isExiting ? 0 : 1,
        transition: isExiting
          ? 'transform 200ms ease-in, opacity 200ms ease-in'
          : 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 250ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Variant icon */}
      <span
        style={{
          flexShrink: 0,
          marginTop: '1px',
          color: cfg.iconColor,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <cfg.Icon size={16} />
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-inter, Inter, sans-serif)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0C1F40',
            margin: 0,
            lineHeight: '1.4',
          }}
        >
          {item.title}
        </p>
        {item.description && (
          <p
            style={{
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '12px',
              fontWeight: 400,
              color: 'rgba(12,31,64,0.65)',
              margin: 0,
              marginTop: '2px',
              lineHeight: '1.4',
            }}
          >
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={item.action.onClick}
            style={{
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '12px',
              fontWeight: 600,
              color: cfg.iconColor,
              textDecoration: 'underline',
              cursor: 'pointer',
              display: 'block',
              marginTop: '6px',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {item.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: 'rgba(12,31,64,0.40)',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(12,31,64,0.80)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(12,31,64,0.40)')}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid #B4E7DD'
          e.currentTarget.style.outlineOffset = '2px'
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none'
        }}
      >
        <X size={12} />
      </button>

      {/* Progress bar */}
      {hasProgress && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            backgroundColor: cfg.iconColor,
            opacity: 0.3,
            animationName: 'toast-progress',
            animationDuration: `${duration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  )
}

// ─── Toast Provider ────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => {
        const next = [...prev, { ...item, id }]
        // If over limit, remove oldest (first in array)
        if (next.length > maxToasts) {
          return next.slice(next.length - maxToasts)
        }
        return next
      })
    },
    [maxToasts]
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// ─── Toast Viewport ────────────────────────────────────────────────────────

interface ToastViewportProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

function ToastViewport({ toasts, onRemove }: ToastViewportProps) {
  return (
    <>
      {/* Progress bar keyframe — injected once */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Desktop: bottom-right */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          width: '360px',
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '8px',
          // Hide on mobile — handled by media-query div below
        }}
        className="toast-viewport-desktop"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onRemove={onRemove} />
        ))}
      </div>

      {/* Mobile: bottom full-width */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 100,
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '8px',
        }}
        className="toast-viewport-mobile"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onRemove={onRemove} />
        ))}
      </div>

      <style>{`
        .toast-viewport-mobile { display: none; }
        @media (max-width: 767px) {
          .toast-viewport-desktop { display: none; }
          .toast-viewport-mobile { display: flex; }
        }
      `}</style>
    </>
  )
}

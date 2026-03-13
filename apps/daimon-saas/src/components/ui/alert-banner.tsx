'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface AlertBannerProps {
  variant: AlertVariant
  title: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  className?: string
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  {
    Icon: React.ElementType
    bg: string
    borderColor: string
    iconColor: string
    titleColor: string
    descColor: string
    actionColor: string
  }
> = {
  error: {
    Icon: AlertCircle,
    bg: '#FEF2F2',
    borderColor: '#DC2626',
    iconColor: '#DC2626',
    titleColor: '#7F1D1D',
    descColor: 'rgba(127,29,29,0.75)',
    actionColor: '#DC2626',
  },
  warning: {
    Icon: AlertTriangle,
    bg: '#FFFBEB',
    borderColor: '#D97706',
    iconColor: '#D97706',
    titleColor: '#78350F',
    descColor: 'rgba(120,53,15,0.75)',
    actionColor: '#D97706',
  },
  success: {
    Icon: CheckCircle,
    bg: '#F0FDF4',
    borderColor: '#16A34A',
    iconColor: '#16A34A',
    titleColor: '#14532D',
    descColor: 'rgba(20,83,45,0.75)',
    actionColor: '#16A34A',
  },
  info: {
    Icon: Info,
    bg: 'rgba(180,231,221,0.20)',
    borderColor: '#B4E7DD',
    iconColor: '#0C1F40',
    titleColor: '#0C1F40',
    descColor: 'rgba(12,31,64,0.65)',
    actionColor: '#0C1F40',
  },
}

export function AlertBanner({
  variant,
  title,
  description,
  dismissible = false,
  onDismiss,
  action,
  icon,
  className,
}: AlertBannerProps) {
  const [dismissing, setDismissing] = useState(false)

  const cfg = VARIANT_CONFIG[variant]
  const DefaultIcon = cfg.Icon

  function handleDismiss() {
    setDismissing(true)
    setTimeout(() => {
      onDismiss?.()
    }, 200)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: 0,
        borderLeft: `3px solid ${cfg.borderColor}`,
        backgroundColor: cfg.bg,
        width: '100%',
        boxShadow: 'none',
        overflow: 'hidden',
        transition: 'opacity 200ms ease, max-height 200ms ease, padding 200ms ease',
        opacity: dismissing ? 0 : 1,
        maxHeight: dismissing ? 0 : '500px',
        paddingTop: dismissing ? 0 : undefined,
        paddingBottom: dismissing ? 0 : undefined,
      }}
      role="alert"
      className={className}
    >
      {/* Icon */}
      <span
        style={{
          flexShrink: 0,
          marginTop: '1px',
          color: cfg.iconColor,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon ?? <DefaultIcon size={16} />}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-inter, Inter, sans-serif)',
            fontSize: '14px',
            fontWeight: 600,
            color: cfg.titleColor,
            margin: 0,
            lineHeight: '1.4',
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '13px',
              fontWeight: 400,
              color: cfg.descColor,
              margin: 0,
              marginTop: '2px',
              lineHeight: '1.4',
            }}
          >
            {description}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              fontSize: '13px',
              fontWeight: 600,
              color: cfg.actionColor,
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
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={handleDismiss}
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
            marginTop: '1px',
            padding: 0,
            color: cfg.iconColor,
            opacity: 0.6,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid #B4E7DD'
            e.currentTarget.style.outlineOffset = '2px'
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Github, Activity, Clock, User, X, Info, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/lib/toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ServiceName = 'github' | 'google' | 'linear' | 'toggl'
export type ConnectionStatus = 'connected' | 'expired' | 'revoked' | 'error'

export interface TenantServiceConnection {
  id: string
  service: string
  auth_type: 'oauth' | 'api_key'
  status: ConnectionStatus
  scopes: string[]
  metadata: Record<string, unknown>
  connected_at: string
  last_used_at: string | null
  error_message: string | null
}

export interface ServiceGridProps {
  tenantId: string
  userRole: 'owner' | 'admin' | 'member'
  connectionsByService: Partial<Record<ServiceName, TenantServiceConnection>>
}

// ---------------------------------------------------------------------------
// Service metadata
// ---------------------------------------------------------------------------

const SERVICE_META = {
  github: {
    displayName: 'GitHub',
    description: 'Run GitHub CLI commands, manage issues and pull requests.',
    defaultErrorMessage:
      'GitHub token may be expired or revoked. Reconnect to restore access.',
    authType: 'oauth' as const,
    oauthScopes: ['repo', 'read:org', 'gist'],
  },
  google: {
    displayName: 'Google',
    description: 'Access Google Analytics reports and workspace data.',
    defaultErrorMessage: 'Google OAuth token expired. Reconnect to refresh access.',
    authType: 'oauth' as const,
    oauthScopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  },
  linear: {
    displayName: 'Linear',
    description: 'Manage Linear issues, cycles, and projects.',
    defaultErrorMessage:
      'Linear token invalid or revoked. Reconnect to restore access.',
    authType: 'oauth' as const,
    oauthScopes: ['read', 'write', 'issues:create', 'comments:create'],
  },
  toggl: {
    displayName: 'Toggl',
    description: 'Track time entries and access workspace reports.',
    defaultErrorMessage: 'Toggl API key is invalid or has been revoked.',
    authType: 'api_key' as const,
    keyPlaceholder: 'Paste your Toggl API token',
    keyHelpText: 'Find your API token at toggl.com/app/profile.',
  },
} as const

// ---------------------------------------------------------------------------
// Service logo (inline SVG / lucide fallback)
// ---------------------------------------------------------------------------

function ServiceLogo({ service }: { service: ServiceName }) {
  const size = 40

  if (service === 'github') {
    return (
      <Github
        width={size}
        height={size}
        color="#0C1F40"
        aria-label="GitHub"
      />
    )
  }
  if (service === 'google') {
    // Colored "G" approximating Google brand
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-label="Google"
      >
        <circle cx="20" cy="20" r="20" fill="#F3F4F6" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
          fill="#4285F4"
        >
          G
        </text>
      </svg>
    )
  }
  if (service === 'linear') {
    return (
      <Activity
        width={size}
        height={size}
        color="#5E6AD2"
        aria-label="Linear"
      />
    )
  }
  // toggl
  return (
    <Clock
      width={size}
      height={size}
      color="#E57CD8"
      aria-label="Toggl"
    />
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

type BadgeStatus = ConnectionStatus | 'not-connected'

const STATUS_BADGE_STYLES: Record<
  BadgeStatus,
  { label: string; bg: string; color: string }
> = {
  connected: { label: 'Connected', bg: '#D1FAE5', color: '#059669' },
  expired: { label: 'Expired', bg: '#FEF3C7', color: '#D97706' },
  error: { label: 'Error', bg: '#FEE2E2', color: '#DC2626' },
  revoked: { label: 'Disconnected', bg: '#F3F4F6', color: '#6B7280' },
  'not-connected': { label: 'Not Connected', bg: '#F3F4F6', color: '#6B7280' },
}

function StatusBadge({ status }: { status: BadgeStatus }) {
  const { label, bg, color } = STATUS_BADGE_STYLES[status]
  return (
    <span
      style={{
        display: 'inline-block',
        height: '22px',
        padding: '4px 10px',
        background: bg,
        color,
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '14px',
        borderRadius: '0px',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months !== 1 ? 's' : ''} ago`
}

// ---------------------------------------------------------------------------
// Service card
// ---------------------------------------------------------------------------

interface ServiceCardProps {
  service: ServiceName
  connection: TenantServiceConnection | null
  userRole: 'owner' | 'admin' | 'member'
  onApiKeyConnect?: () => void
}

function ServiceCard({ service, connection, userRole, onApiKeyConnect }: ServiceCardProps) {
  const meta = SERVICE_META[service]
  const router = useRouter()
  const { toast } = useToast()
  const isConnected = connection !== null
  const badgeStatus: BadgeStatus = connection ? connection.status : 'not-connected'
  const isError =
    connection?.status === 'error' || connection?.status === 'expired'
  const isMember = userRole === 'member'
  const [disconnecting, setDisconnecting] = React.useState(false)
  const [disconnectError, setDisconnectError] = React.useState<string | null>(null)

  // Left border accent
  let borderLeft = '1px solid #E5E7EB'
  if (connection?.status === 'connected') {
    borderLeft = '3px solid #00D4B8'
  } else if (isError) {
    borderLeft = '3px solid #EF4444'
  }

  // Account name: prefer display_name, fall back to toggl_email/email, then nothing
  const accountName = connection
    ? ((connection.metadata.display_name as string) ||
       (connection.metadata.toggl_email as string) ||
       (connection.metadata.email as string) ||
       null)
    : null

  const handleConnect = () => {
    if (meta.authType === 'oauth') {
      window.location.href = `/api/integrations/oauth/start?service=${service}`
    } else if (meta.authType === 'api_key') {
      onApiKeyConnect?.()
    }
  }

  const handleDisconnect = async () => {
    if (isMember || disconnecting) return
    setDisconnecting(true)
    setDisconnectError(null)
    try {
      const res = await fetch(`/api/integrations/${service}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'disconnect_failed')
      }
      toast.success(`${meta.displayName} disconnected.`)
      router.refresh()
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to disconnect. Please try again.'
      setDisconnectError(errMsg)
      toast.error(errMsg)
      setDisconnecting(false)
    }
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft,
        borderRadius: '0px',
        padding: '24px',
        minHeight: '180px',
        boxShadow: 'none',
        transition: 'box-shadow 150ms ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flexShrink: 0, marginRight: '12px' }}>
            <ServiceLogo service={service} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#0C1F40',
              }}
            >
              {meta.displayName}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#6B7280',
              }}
            >
              {meta.description}
            </span>
          </div>
        </div>
        <StatusBadge status={badgeStatus} />
      </div>

      {/* Connection details (shown when connected or error) */}
      {isConnected && (
        <div
          style={{
            background: '#F9FAFB',
            border: '1px solid #F3F4F6',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Account name */}
          {accountName && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '24px',
                marginBottom: '2px',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}
              >
                <User size={11} />
                Account
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#374151',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {accountName}
              </span>
            </div>
          )}

          {/* Connected at */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '24px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '12px',
                color: '#9CA3AF',
              }}
            >
              Connected
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '12px',
                color: '#374151',
              }}
            >
              {relativeTime(connection.connected_at)}
            </span>
          </div>

          {/* Last used */}
          {connection.last_used_at && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '24px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}
              >
                Last used
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#374151',
                }}
              >
                {relativeTime(connection.last_used_at)}
              </span>
            </div>
          )}

          {/* Scopes (OAuth only, non-empty) */}
          {connection.auth_type === 'oauth' && connection.scopes.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '24px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}
              >
                Scopes
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#374151',
                }}
              >
                {connection.scopes.join(', ')}
              </span>
            </div>
          )}

          {/* Error banner */}
          {isError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                padding: '8px 12px',
                marginTop: '8px',
              }}
            >
              <AlertTriangle
                size={14}
                color="#DC2626"
                style={{ marginRight: '6px', flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                  color: '#DC2626',
                }}
              >
                {connection.error_message ?? meta.defaultErrorMessage}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Disconnect error */}
      {disconnectError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            padding: '8px 12px',
            marginBottom: '12px',
          }}
        >
          <AlertTriangle
            size={14}
            color="#DC2626"
            style={{ marginRight: '6px', flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '12px',
              color: '#DC2626',
            }}
          >
            {disconnectError}
          </span>
        </div>
      )}

      {/* Footer actions */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        }}
      >
        {!isConnected && (
          <button
            onClick={handleConnect}
            disabled={isMember}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              padding: '0 16px',
              background: isMember ? '#E5E7EB' : '#0C1F40',
              color: isMember ? '#9CA3AF' : '#FFFFFF',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '0px',
              border: 'none',
              cursor: isMember ? 'not-allowed' : 'pointer',
            }}
          >
            Connect {meta.displayName}
          </button>
        )}

        {isConnected && (
          <>
            {/* Reconnect — shown for expired or error */}
            {isError && (
              <button
                onClick={handleConnect}
                disabled={isMember}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '36px',
                  padding: '0 16px',
                  background: '#FFFFFF',
                  color: isMember ? '#9CA3AF' : '#0C1F40',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  borderRadius: '0px',
                  border: '1.5px solid #D1D5DB',
                  cursor: isMember ? 'not-allowed' : 'pointer',
                }}
              >
                Reconnect
              </button>
            )}

            {/* Disconnect — hidden for revoked */}
            {connection.status !== 'revoked' && (
              <button
                onClick={() => { void handleDisconnect() }}
                disabled={isMember || disconnecting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '36px',
                  padding: '0 16px',
                  background: 'transparent',
                  color: isMember || disconnecting ? '#9CA3AF' : '#DC2626',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  borderRadius: '0px',
                  border: 'none',
                  cursor: isMember || disconnecting ? 'not-allowed' : 'pointer',
                  opacity: disconnecting ? 0.6 : 1,
                }}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Service grid
// ---------------------------------------------------------------------------

const SERVICES: ServiceName[] = ['github', 'google', 'linear', 'toggl']

// ---------------------------------------------------------------------------
// API Key Modal (Toggl)
// ---------------------------------------------------------------------------

interface ApiKeyModalProps {
  service: ServiceName
  onClose: () => void
  onSuccess: () => void
}

function ApiKeyModal({ service, onClose, onSuccess }: ApiKeyModalProps) {
  const meta = SERVICE_META[service]
  const [keyValue, setKeyValue] = React.useState('')
  const [showKey, setShowKey] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isSubmitting, onClose])

  const handleSubmit = async () => {
    setError(null)

    // Client-side validation
    if (keyValue.length !== 32) {
      setError('API token must be exactly 32 characters.')
      return
    }
    if (!/^[a-z0-9]{32}$/.test(keyValue)) {
      setError('API token may only contain lowercase letters and numbers.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/integrations/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, api_key: keyValue }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = (body as { error?: string }).error ?? 'Failed to connect. Please try again.'
        setError(errMsg)
        setIsSubmitting(false)
        return
      }
      // Success
      onSuccess()
    } catch {
      setError('Could not reach the server. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Display name safely (service might not have keyPlaceholder)
  const placeholder = 'keyPlaceholder' in meta ? (meta as { keyPlaceholder: string }).keyPlaceholder : 'Paste your API token'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
        }}
        onClick={() => { if (!isSubmitting) onClose() }}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-modal-title"
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '0px',
          padding: '24px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          margin: '16px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ServiceLogo service={service} />
            <h2
              id="api-key-modal-title"
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#0C1F40',
                margin: 0,
              }}
            >
              Connect {meta.displayName}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              padding: '4px',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#374151',
            marginBottom: '16px',
          }}
        >
          Paste your {meta.displayName} API token to enable time tracking tools.
        </p>

        {/* Help banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            padding: '10px 12px',
            marginBottom: '20px',
          }}
        >
          <Info size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#1E40AF',
            }}
          >
            Find your API token at{' '}
            <a
              href="https://track.toggl.com/profile"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563EB', textDecoration: 'underline' }}
            >
              toggl.com/app/profile
            </a>{' '}
            under &quot;API Token&quot;.
          </span>
        </div>

        {/* Input */}
        <label
          htmlFor="api-key-input"
          style={{
            display: 'block',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '13px',
            color: '#374151',
            marginBottom: '6px',
          }}
        >
          {meta.displayName} API Token{' '}
          <span aria-label="required" style={{ color: '#DC2626' }}>*</span>
        </label>
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <input
            ref={inputRef}
            id="api-key-input"
            type={showKey ? 'text' : 'password'}
            value={keyValue}
            onChange={(e) => {
              setKeyValue(e.target.value)
              setError(null)
            }}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={error ? 'api-key-error' : 'api-key-hint'}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 40px 0 12px',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: '#0C1F40',
              background: '#FFFFFF',
              border: error ? '1px solid #EF4444' : '1px solid #D1D5DB',
              borderRadius: '0px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            tabIndex={-1}
            aria-label={showKey ? 'Hide token' : 'Show token'}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p
          id="api-key-hint"
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '12px',
            color: '#9CA3AF',
            marginBottom: error ? '4px' : '20px',
          }}
        >
          32-character alphanumeric token. Never share this with others.
        </p>
        {error && (
          <p
            id="api-key-error"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#DC2626',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={13} />
            {error}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              height: '36px',
              padding: '0 16px',
              background: 'transparent',
              color: isSubmitting ? '#9CA3AF' : '#374151',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              border: 'none',
              borderRadius: '0px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { void handleSubmit() }}
            disabled={isSubmitting || keyValue.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 16px',
              background: isSubmitting || keyValue.length === 0 ? '#E5E7EB' : '#0C1F40',
              color: isSubmitting || keyValue.length === 0 ? '#9CA3AF' : '#FFFFFF',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              border: 'none',
              borderRadius: '0px',
              cursor: isSubmitting || keyValue.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Validating…' : 'Save & Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ServiceGrid({
  tenantId,
  userRole,
  connectionsByService,
}: ServiceGridProps) {
  const router = useRouter()
  const [apiKeyModalService, setApiKeyModalService] = React.useState<ServiceName | null>(null)

  const handleApiKeySuccess = () => {
    setApiKeyModalService(null)
    router.push('/dashboard/integrations?connected=toggl')
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
        className="sm:grid-cols-1 integrations-grid"
        data-testid="integrations-grid"
        data-tenant-id={tenantId}
      >
        <style>{`
          @media (max-width: 767px) {
            .integrations-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {SERVICES.map((service) => (
          <ServiceCard
            key={service}
            service={service}
            connection={connectionsByService[service] ?? null}
            userRole={userRole}
            onApiKeyConnect={() => setApiKeyModalService(service)}
          />
        ))}
      </div>

      {apiKeyModalService !== null && (
        <ApiKeyModal
          service={apiKeyModalService}
          onClose={() => setApiKeyModalService(null)}
          onSuccess={handleApiKeySuccess}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// OAuth callback banner — reads ?connected= and ?error= from URL
// ---------------------------------------------------------------------------

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You denied access. No changes were made.',
  session_expired: 'Your session expired. Please try again.',
  security_error: 'Security check failed. Please try again.',
  token_exchange_failed: 'Could not exchange authorization code. Please try again.',
  connection_failed: 'Failed to save connection. Please try again.',
  provider_error: 'The provider returned an error. Please try again.',
}

export function OAuthCallbackBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')
  const errorService = searchParams.get('service')

  React.useEffect(() => {
    if (!connected && !error) return

    if (connected) {
      const serviceName = SERVICE_META[connected as ServiceName]?.displayName ?? connected
      toast.success(`${serviceName} connected successfully.`)
    } else if (error) {
      const serviceName = errorService
        ? (SERVICE_META[errorService as ServiceName]?.displayName ?? errorService)
        : null
      const errMsg =
        OAUTH_ERROR_MESSAGES[error] ?? 'An unexpected error occurred. Please try again.'
      if (error === 'access_denied') {
        toast.info(serviceName ? `${serviceName} authorization was cancelled.` : errMsg)
      } else {
        toast.error(
          serviceName ? `Failed to connect ${serviceName}. Please try again.` : errMsg
        )
      }
    }

    // Clean URL params without reload
    router.replace('/dashboard/integrations', { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

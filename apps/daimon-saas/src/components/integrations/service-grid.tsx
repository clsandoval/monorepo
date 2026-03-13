'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Github, Globe, Activity, Clock, User } from 'lucide-react'

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
}

function ServiceCard({ service, connection, userRole }: ServiceCardProps) {
  const meta = SERVICE_META[service]
  const router = useRouter()
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

  // Account name: prefer display_name, fall back to email, then nothing
  const accountName = connection
    ? ((connection.metadata.display_name as string) ||
       (connection.metadata.email as string) ||
       null)
    : null

  const handleConnect = () => {
    if (meta.authType === 'oauth') {
      window.location.href = `/api/integrations/oauth/start?service=${service}`
    }
    // API key flow: handled by Toggl card (future stage)
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
      router.refresh()
    } catch (err) {
      setDisconnectError(
        err instanceof Error ? err.message : 'Failed to disconnect. Please try again.'
      )
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

export function ServiceGrid({
  tenantId,
  userRole,
  connectionsByService,
}: ServiceGridProps) {
  return (
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
        />
      ))}
    </div>
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
  const [dismissed, setDismissed] = React.useState(false)

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')
  const errorService = searchParams.get('service')

  if (dismissed || (!connected && !error)) return null

  const dismiss = () => {
    setDismissed(true)
    // Strip query params from URL without reloading
    router.replace('/dashboard/integrations', { scroll: false })
  }

  if (connected) {
    const serviceName = SERVICE_META[connected as ServiceName]?.displayName ?? connected
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '12px 16px',
          marginBottom: '24px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#065F46',
          }}
        >
          <strong>{serviceName}</strong> connected successfully.
        </span>
        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#065F46',
            cursor: 'pointer',
            padding: '0 4px',
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    )
  }

  // error state
  const errorMsg =
    OAUTH_ERROR_MESSAGES[error ?? ''] ?? 'An unexpected error occurred. Please try again.'
  const serviceName = errorService
    ? (SERVICE_META[errorService as ServiceName]?.displayName ?? errorService)
    : null

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FEF2F2',
        border: '1px solid #FEE2E2',
        padding: '12px 16px',
        marginBottom: '24px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: '14px',
          color: '#991B1B',
        }}
      >
        {serviceName ? <><strong>{serviceName}:</strong> </> : null}
        {errorMsg}
      </span>
      <button
        onClick={dismiss}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          color: '#991B1B',
          cursor: 'pointer',
          padding: '0 4px',
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

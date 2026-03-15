'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Github, Activity, Clock, User, X, Info, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
        className="text-foreground"
        aria-label="GitHub"
      />
    )
  }
  if (service === 'google') {
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

const STATUS_BADGE_MAP: Record<
  BadgeStatus,
  { label: string; variant: import('@/components/ui/badge').BadgeVariant }
> = {
  connected: { label: 'Connected', variant: 'connection-connected' },
  expired: { label: 'Expired', variant: 'warning' },
  error: { label: 'Error', variant: 'connection-error' },
  revoked: { label: 'Disconnected', variant: 'connection-disconnected' },
  'not-connected': { label: 'Not Connected', variant: 'neutral' },
}

function StatusBadge({ status }: { status: BadgeStatus }) {
  const { label, variant } = STATUS_BADGE_MAP[status]
  return (
    <Badge
      variant={variant}
      label={label}
      uppercase={false}
      className="shrink-0"
    />
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
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [disconnectError, setDisconnectError] = React.useState<string | null>(null)

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
    setDisconnectError(null)
    const res = await fetch(`/api/integrations/${service}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const errMsg = (body as { error?: string }).error ?? 'Failed to disconnect. Please try again.'
      setDisconnectError(errMsg)
      toast.error(errMsg)
      setConfirmOpen(false)
      return
    }
    toast.success(`${meta.displayName} disconnected.`)
    setConfirmOpen(false)
    router.refresh()
  }

  return (
    <Card
      className={cn(
        'flex min-h-[180px] flex-col border p-6 shadow-none transition-shadow hover:shadow-md',
        connection?.status === 'connected' && 'border-l-[3px] border-l-teal-400',
        isError && 'border-l-[3px] border-l-red-500',
        !connection?.status && 'border-l',
        connection?.status === 'revoked' && 'border-l'
      )}
    >
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 shrink-0">
            <ServiceLogo service={service} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-foreground">
              {meta.displayName}
            </span>
            <span className="text-sm text-muted-foreground">
              {meta.description}
            </span>
          </div>
        </div>
        <StatusBadge status={badgeStatus} />
      </div>

      {/* Connection details (shown when connected or error) */}
      {isConnected && (
        <div className="mb-4 border border-gray-100 bg-gray-50 p-3">
          {/* Account name */}
          {accountName && (
            <div className="mb-0.5 flex h-6 items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <User size={11} />
                Account
              </span>
              <span className="max-w-[180px] truncate text-xs font-medium text-gray-700">
                {accountName}
              </span>
            </div>
          )}

          {/* Connected at */}
          <div className="flex h-6 items-center justify-between">
            <span className="text-xs text-gray-400">
              Connected
            </span>
            <span className="text-xs font-medium text-gray-700">
              {relativeTime(connection.connected_at)}
            </span>
          </div>

          {/* Last used */}
          {connection.last_used_at && (
            <div className="flex h-6 items-center justify-between">
              <span className="text-xs text-gray-400">
                Last used
              </span>
              <span className="text-xs font-medium text-gray-700">
                {relativeTime(connection.last_used_at)}
              </span>
            </div>
          )}

          {/* Scopes (OAuth only, non-empty) */}
          {connection.auth_type === 'oauth' && connection.scopes.length > 0 && (
            <div className="flex h-6 items-center justify-between">
              <span className="text-xs text-gray-400">
                Scopes
              </span>
              <span className="text-xs font-medium text-gray-700">
                {connection.scopes.join(', ')}
              </span>
            </div>
          )}

          {/* Error banner */}
          {isError && (
            <Alert variant="destructive" className="mt-2 border-red-200 bg-red-50 p-2 px-3">
              <AlertTriangle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                {connection.error_message ?? meta.defaultErrorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Disconnect error */}
      {disconnectError && (
        <Alert variant="destructive" className="mb-3 border-red-200 bg-red-50 p-2 px-3">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">
            {disconnectError}
          </AlertDescription>
        </Alert>
      )}

      {/* Disconnect confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="warning"
        title={`Disconnect ${meta.displayName}?`}
        description={`Disconnecting ${meta.displayName} will disable all ${meta.displayName} tools in Decision Orchestrator. You can reconnect at any time.`}
        confirmLabel="Disconnect"
        onConfirm={handleDisconnect}
      />

      {/* Footer actions */}
      <div className="mt-auto flex justify-end gap-2 border-t border-gray-100 pt-4">
        {!isConnected && (
          <Button
            onClick={handleConnect}
            disabled={isMember}
          >
            Connect {meta.displayName}
          </Button>
        )}

        {isConnected && (
          <>
            {/* Reconnect — shown for expired or error */}
            {isError && (
              <Button
                variant="outline"
                onClick={handleConnect}
                disabled={isMember}
              >
                Reconnect
              </Button>
            )}

            {/* Disconnect — hidden for revoked */}
            {connection.status !== 'revoked' && (
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen(true)}
                disabled={isMember}
                className="text-destructive hover:text-destructive"
              >
                Disconnect
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
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
    <Dialog open onOpenChange={(open) => { if (!open && !isSubmitting) onClose() }}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <ServiceLogo service={service} />
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Connect {meta.displayName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-700">
            Paste your {meta.displayName} API token to enable time tracking tools.
          </DialogDescription>
        </DialogHeader>

        {/* Help banner */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-3.5 w-3.5 text-blue-500" />
          <AlertDescription className="text-sm text-blue-800">
            Find your API token at{' '}
            <a
              href="https://track.toggl.com/profile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              toggl.com/app/profile
            </a>{' '}
            under &quot;API Token&quot;.
          </AlertDescription>
        </Alert>

        {/* Input */}
        <div className="space-y-1.5">
          <Label htmlFor="api-key-input" className="text-sm font-medium text-gray-700">
            {meta.displayName} API Token{' '}
            <span aria-label="required" className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
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
              className={cn('pr-10', error && 'border-red-500')}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              tabIndex={-1}
              aria-label={showKey ? 'Hide token' : 'Show token'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 flex items-center p-0"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p id="api-key-hint" className={cn('text-xs text-gray-400', error ? 'mb-1' : 'mb-5')}>
            32-character alphanumeric token. Never share this with others.
          </p>
          {error && (
            <p
              id="api-key-error"
              className="mb-5 flex items-center gap-1.5 text-sm text-destructive"
            >
              <AlertTriangle size={13} />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => { void handleSubmit() }}
            disabled={isSubmitting || keyValue.length === 0}
          >
            {isSubmitting ? 'Validating\u2026' : 'Save & Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        data-testid="integrations-grid"
        data-tenant-id={tenantId}
      >
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

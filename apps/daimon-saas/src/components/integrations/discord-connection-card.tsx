'use client'

import * as React from 'react'
import { AlertTriangle, MessageSquare, Eye, EyeOff, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { type Plan, getMaxConnections, canAddConnection, connectionLimitMessage } from '@/lib/plans/gate'
import { useToast } from '@/lib/toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscordConnection {
  id: string
  guild_id: string
  status: 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error'
  bot_user_id: string | null
  bot_username: string | null
  error_message: string | null
  created_at: string
}

export interface DiscordSectionProps {
  tenantId: string
  userRole: 'owner' | 'admin' | 'member'
  connections: DiscordConnection[]
  /** Tenant plan — used to enforce connection limits. Defaults to 'free'. */
  plan?: Plan
}

// ---------------------------------------------------------------------------
// Validation helpers (from spec discord.md §2.2 / §2.3)
// ---------------------------------------------------------------------------

const DISCORD_TOKEN_REGEX = /^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{4,8}\.[A-Za-z0-9_-]{27}$/
const GUILD_ID_REGEX = /^[0-9]{17,20}$/

function sanitizeToken(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.startsWith('Bot ') ? trimmed.slice(4) : trimmed
}

// ---------------------------------------------------------------------------
// Status badge mapping
// ---------------------------------------------------------------------------

type DiscordStatus = DiscordConnection['status']

const STATUS_BADGE_MAP: Record<DiscordStatus, { variant: BadgeVariant; label: string }> = {
  connected: { variant: 'connection-connected', label: 'Connected' },
  connecting: { variant: 'connection-connecting', label: 'Connecting...' },
  pending: { variant: 'connection-connecting', label: 'Pending' },
  error: { variant: 'connection-error', label: 'Error' },
  disconnected: { variant: 'connection-disconnected', label: 'Disconnected' },
}

const STATUS_DOT_COLORS: Record<DiscordStatus, string> = {
  connected: 'bg-[#059669]',
  connecting: 'bg-[#D97706]',
  pending: 'bg-[#D97706]',
  error: 'bg-destructive',
  disconnected: 'bg-muted-foreground',
}

const STATUS_BORDER_COLORS: Record<DiscordStatus, string> = {
  connected: 'border-l-[3px] border-l-[#00D4B8]',
  connecting: 'border-l-[3px] border-l-[#D97706]',
  pending: 'border-l-[3px] border-l-[#D97706]',
  error: 'border-l-[3px] border-l-destructive',
  disconnected: '',
}

// ---------------------------------------------------------------------------
// Discord logo (simple SVG icon)
// ---------------------------------------------------------------------------

function DiscordLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-label="Discord"
    >
      <rect width="40" height="40" fill="#5865F2" />
      <path
        d="M26.8 12.6c-1.5-.7-3.1-1.2-4.8-1.5-.2.4-.4.8-.6 1.2-1.8-.3-3.6-.3-5.4 0-.2-.4-.4-.8-.6-1.2-1.7.3-3.3.8-4.8 1.5C8 17 7.4 21.2 7.7 25.3c1.9 1.4 3.7 2.2 5.5 2.8.4-.6.8-1.2 1.1-1.9-.6-.2-1.2-.5-1.8-.8l.4-.3c3.4 1.6 7.1 1.6 10.5 0l.4.3c-.6.3-1.2.6-1.8.8.3.7.7 1.3 1.1 1.9 1.8-.6 3.6-1.4 5.5-2.8.4-4.7-.6-8.8-2.8-12.7zM16 22.7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
        fill="white"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Discord connection modal
// ---------------------------------------------------------------------------

interface DiscordModalProps {
  mode: 'add' | 'replace'
  existingGuildId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (connection: DiscordConnection) => void
}

function DiscordConnectionModal({
  mode,
  existingGuildId,
  isOpen,
  onClose,
  onSuccess,
}: DiscordModalProps) {
  const [token, setToken] = React.useState('')
  const [guildId, setGuildId] = React.useState(existingGuildId ?? '')
  const [showToken, setShowToken] = React.useState(false)
  const [tokenError, setTokenError] = React.useState<string | null>(null)
  const [guildIdError, setGuildIdError] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setToken('')
      setGuildId(existingGuildId ?? '')
      setShowToken(false)
      setTokenError(null)
      setGuildIdError(null)
      setSubmitError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, existingGuildId])

  const validateToken = (): boolean => {
    const raw = sanitizeToken(token)
    if (!raw) {
      setTokenError('Bot token is required.')
      return false
    }
    if (!DISCORD_TOKEN_REGEX.test(raw)) {
      setTokenError(
        "This doesn't look like a valid Discord bot token. Make sure you copied the token from the Discord Developer Portal, not the application's Client ID or Client Secret."
      )
      return false
    }
    setTokenError(null)
    return true
  }

  const validateGuildId = (): boolean => {
    if (!guildId.trim()) {
      setGuildIdError('Guild ID is required.')
      return false
    }
    if (!GUILD_ID_REGEX.test(guildId.trim())) {
      setGuildIdError(
        "Guild ID must be a 17–20 digit number. You can find it by right-clicking your server name in Discord and selecting 'Copy Server ID'. Enable Developer Mode in Discord settings if the option is not visible."
      )
      return false
    }
    setGuildIdError(null)
    return true
  }

  const handleSubmit = async () => {
    const tokenOk = validateToken()
    const guildOk = mode === 'replace' ? true : validateGuildId()
    if (!tokenOk || !guildOk) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const body: Record<string, string> = {
        bot_token: sanitizeToken(token),
        guild_id: mode === 'replace' ? (existingGuildId ?? guildId.trim()) : guildId.trim(),
      }

      const endpoint =
        mode === 'add'
          ? '/api/discord-connections'
          : '/api/discord-connections' // PATCH handled by parent via id

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.field === 'bot_token') {
          setTokenError(data.error ?? 'Invalid bot token.')
        } else if (data.field === 'guild_id') {
          setGuildIdError(data.error ?? 'Invalid Guild ID.')
        } else {
          setSubmitError(data.error ?? 'Failed to save connection. Please try again.')
        }
        return
      }

      onSuccess(data as DiscordConnection)
      onClose()
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = mode === 'add' ? 'Add Discord Bot' : 'Replace Bot Token'
  const submitLabel = isSubmitting ? 'Saving...' : mode === 'add' ? 'Validate & Connect' : 'Update Token'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DiscordLogo size={32} />
            <DialogTitle className="font-heading text-lg">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === 'add'
              ? 'Paste your Discord bot token and server ID to connect your bot.'
              : 'Paste a new bot token to replace the existing one. The bot will briefly reconnect.'}
          </DialogDescription>
        </DialogHeader>

        {/* Help banner */}
        <Alert className="border-sky-200 bg-sky-50">
          <MessageSquare className="size-3.5 text-sky-600" />
          <AlertDescription className="text-xs text-sky-800">
            Create a bot at{' '}
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline"
            >
              discord.com/developers
            </a>
            , copy the token from the Bot section, and paste it below.
          </AlertDescription>
        </Alert>

        {/* Bot token field */}
        <div className="space-y-1.5">
          <Label htmlFor="discord-token">
            Discord Bot Token <span className="text-destructive" aria-label="required">*</span>
          </Label>
          <div className="relative">
            <Input
              id="discord-token"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                if (tokenError) setTokenError(null)
              }}
              onBlur={validateToken}
              placeholder="MTIzNDU2Nzg5.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXX"
              autoComplete="off"
              spellCheck={false}
              disabled={isSubmitting}
              className={cn('h-10 pr-10', tokenError && 'border-destructive')}
            />
            <button
              type="button"
              aria-label={showToken ? 'Hide token' : 'Show token'}
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {tokenError && (
            <p className="text-xs text-destructive">{tokenError}</p>
          )}
        </div>

        {/* Guild ID field */}
        <div className="space-y-1.5">
          <Label htmlFor="discord-guild-id">
            Discord Server ID (Guild ID){' '}
            {mode === 'add' && (
              <span className="text-destructive" aria-label="required">*</span>
            )}
          </Label>
          <Input
            id="discord-guild-id"
            type="text"
            value={guildId}
            readOnly={mode === 'replace'}
            onChange={(e) => {
              setGuildId(e.target.value)
              if (guildIdError) setGuildIdError(null)
            }}
            onBlur={() => mode === 'add' && validateGuildId()}
            placeholder="1234567890123456789"
            autoComplete="off"
            disabled={isSubmitting || mode === 'replace'}
            className={cn(
              'h-10',
              mode === 'replace' && 'bg-muted text-muted-foreground cursor-default',
              guildIdError && 'border-destructive'
            )}
          />
          {mode === 'replace' && (
            <p className="text-xs text-muted-foreground">
              Guild ID cannot be changed. To connect a different server, disconnect this bot and add a new connection.
            </p>
          )}
          {guildIdError && (
            <p className="text-xs text-destructive">{guildIdError}</p>
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <Alert variant="destructive">
            <AlertTriangle className="size-3.5" />
            <AlertDescription className="text-sm">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !token}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Single Discord connection row card
// ---------------------------------------------------------------------------

interface DiscordCardItemProps {
  connection: DiscordConnection
  userRole: 'owner' | 'admin' | 'member'
  onReplaceToken: (connection: DiscordConnection) => void
  onDisconnect: (connection: DiscordConnection) => void
}

function DiscordCardItem({
  connection,
  userRole,
  onReplaceToken,
  onDisconnect,
}: DiscordCardItemProps) {
  const isMember = userRole === 'member'
  const isError = connection.status === 'error'
  const { variant, label } = STATUS_BADGE_MAP[connection.status]

  const displayName = connection.bot_username
    ? `Connected as ${connection.bot_username}`
    : `Guild ID: ${connection.guild_id}`

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border border-border bg-card px-5 py-4 sm:flex-row sm:items-center',
        STATUS_BORDER_COLORS[connection.status]
      )}
    >
      {/* Top row: dot + info + badge */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Status dot */}
        <div
          className={cn(
            'size-2 shrink-0 rounded-full',
            STATUS_DOT_COLORS[connection.status]
          )}
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {displayName}
          </div>
          {connection.bot_username && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              Guild ID: {connection.guild_id}
            </div>
          )}
          {isError && connection.error_message && (
            <div className="mt-1 flex items-center gap-1">
              <AlertTriangle className="size-3 text-destructive" />
              <span className="text-xs text-destructive">
                {connection.error_message}
              </span>
            </div>
          )}
        </div>

        {/* Badge */}
        <Badge variant={variant} label={label} size="sm" className="shrink-0" />
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReplaceToken(connection)}
          disabled={isMember}
          title={isMember ? 'Only owners and admins can manage integrations.' : undefined}
        >
          Replace Token
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDisconnect(connection)}
          disabled={isMember}
          title={isMember ? 'Only owners and admins can manage integrations.' : undefined}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Discord section (main export)
// ---------------------------------------------------------------------------

export function DiscordSection({ tenantId, userRole, connections: initialConnections, plan = 'free' }: DiscordSectionProps) {
  const { toast } = useToast()
  const [connections, setConnections] = React.useState<DiscordConnection[]>(initialConnections)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalMode, setModalMode] = React.useState<'add' | 'replace'>('add')
  const [replaceTarget, setReplaceTarget] = React.useState<DiscordConnection | null>(null)
  const [disconnectTarget, setDisconnectTarget] = React.useState<DiscordConnection | null>(null)
  const [disconnectError, setDisconnectError] = React.useState<string | null>(null)

  const isMember = userRole === 'member'

  const activeCount = connections.filter(
    (c) => c.status !== 'disconnected'
  ).length
  const atLimit = !canAddConnection(plan, activeCount)
  const maxConnections = getMaxConnections(plan)
  const limitMessage = atLimit ? connectionLimitMessage(plan) : undefined

  const handleAddConnection = () => {
    if (atLimit || isMember) return
    setModalMode('add')
    setReplaceTarget(null)
    setModalOpen(true)
  }

  const handleReplaceToken = (connection: DiscordConnection) => {
    setModalMode('replace')
    setReplaceTarget(connection)
    setModalOpen(true)
  }

  const handleDisconnect = (connection: DiscordConnection) => {
    setDisconnectError(null)
    setDisconnectTarget(connection)
  }

  const handleModalSuccess = (newConnection: DiscordConnection) => {
    if (modalMode === 'add') {
      setConnections((prev) => [...prev, newConnection])
      toast.success('Discord bot connected. Your bot will come online within 30 seconds.')
    } else {
      setConnections((prev) =>
        prev.map((c) => (c.id === replaceTarget?.id ? newConnection : c))
      )
      toast.success('Bot token updated. Your bot will reconnect shortly.')
    }
  }

  const handleConfirmDisconnect = async () => {
    if (!disconnectTarget) return
    setDisconnectError(null)

    const res = await fetch(`/api/discord-connections/${disconnectTarget.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const errMsg = data.error ?? 'Failed to disconnect. Please try again.'
      setDisconnectError(errMsg)
      toast.error(errMsg)
      setDisconnectTarget(null)
      return
    }

    setConnections((prev) => prev.filter((c) => c.id !== disconnectTarget.id))
    setDisconnectTarget(null)
    toast.success('Discord connection removed. Your bot is now offline.')
  }

  return (
    <>
      {/* Section header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <DiscordLogo size={28} />
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Discord Bot Connections
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {connections.length === 0
                ? 'No bot connected yet. Add your Discord bot token to get started.'
                : `${activeCount} of ${maxConnections === Infinity ? 'unlimited' : maxConnections} connection${maxConnections === 1 ? '' : 's'} used`}
            </p>
          </div>
        </div>

        <Button
          onClick={handleAddConnection}
          disabled={isMember || atLimit}
          title={
            isMember
              ? 'Only owners and admins can manage integrations.'
              : limitMessage
          }
        >
          <Plus className="size-4" />
          Add Connection
        </Button>
      </div>

      {/* Connection limit banner */}
      {atLimit && (
        <Alert className="mb-3 border-amber-200 bg-amber-50">
          <AlertTriangle className="size-3.5 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900">
            {limitMessage}{' '}
            <a
              href="/dashboard/billing"
              className="font-medium text-amber-600 underline"
            >
              Upgrade your plan &rarr;
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Error banner */}
      {disconnectError && (
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="size-3.5" />
          <AlertDescription className="text-sm">
            {disconnectError}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection list */}
      <Card className="overflow-hidden p-0" data-tenant-id={tenantId}>
        <CardContent className="p-0">
          {connections.length === 0 ? (
            <div className="py-10 text-center">
              <div className="flex justify-center">
                <DiscordLogo size={48} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No Discord bot connected. Click{' '}
                <strong className="text-foreground/60">Add Connection</strong> to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {connections.map((conn) => (
                <DiscordCardItem
                  key={conn.id}
                  connection={conn}
                  userRole={userRole}
                  onReplaceToken={handleReplaceToken}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect confirmation */}
      <ConfirmDialog
        open={disconnectTarget !== null}
        onOpenChange={(open) => { if (!open) setDisconnectTarget(null) }}
        variant="danger"
        title="Disconnect bot?"
        description="Your Discord bot will go offline immediately. Any active conversations will be interrupted. You can reconnect at any time."
        confirmLabel="Disconnect"
        onConfirm={handleConfirmDisconnect}
      />

      {/* Add/Replace modal */}
      <DiscordConnectionModal
        mode={modalMode}
        existingGuildId={replaceTarget?.guild_id}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}

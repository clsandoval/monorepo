'use client'

import * as React from 'react'
import { AlertTriangle, MessageSquare, Eye, EyeOff, X, Plus } from 'lucide-react'
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
// Status badge
// ---------------------------------------------------------------------------

type DiscordStatus = DiscordConnection['status']

const STATUS_STYLES: Record<DiscordStatus, { label: string; bg: string; color: string }> = {
  connected: { label: 'Connected', bg: '#D1FAE5', color: '#059669' },
  connecting: { label: 'Connecting...', bg: '#FEF3C7', color: '#D97706' },
  pending: { label: 'Pending', bg: '#FEF3C7', color: '#D97706' },
  error: { label: 'Error', bg: '#FEE2E2', color: '#DC2626' },
  disconnected: { label: 'Disconnected', bg: '#F3F4F6', color: '#6B7280' },
}

function DiscordStatusBadge({ status }: { status: DiscordStatus }) {
  const { label, bg, color } = STATUS_STYLES[status]
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
// Discord logo (simple SVG icon using lucide MessageSquare as fallback)
// ---------------------------------------------------------------------------

function DiscordLogo({ size = 40 }: { size?: number }) {
  // Discord "blurple" brand color: #5865F2
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
  existingGuildId?: string // locked for replace mode
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

  // Focus trap: close on Escape
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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

  if (!isOpen) return null

  const title = mode === 'add' ? 'Add Discord Bot' : 'Replace Bot Token'
  const submitLabel = isSubmitting ? 'Saving...' : mode === 'add' ? 'Validate & Connect' : 'Update Token'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discord-modal-title"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '0px',
          padding: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DiscordLogo size={32} />
            <h2
              id="discord-modal-title"
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#0C1F40',
                margin: 0,
              }}
            >
              {title}
            </h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '4px',
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
            color: '#6B7280',
            marginBottom: '20px',
          }}
        >
          {mode === 'add'
            ? 'Paste your Discord bot token and server ID to connect your bot.'
            : 'Paste a new bot token to replace the existing one. The bot will briefly reconnect.'}
        </p>

        {/* Help banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            padding: '10px 12px',
            marginBottom: '20px',
          }}
        >
          <MessageSquare size={14} color="#0284C7" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '12px',
              color: '#0369A1',
            }}
          >
            Create a bot at{' '}
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0284C7', textDecoration: 'underline' }}
            >
              discord.com/developers
            </a>
            , copy the token from the Bot section, and paste it below.
          </span>
        </div>

        {/* Bot token field */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="discord-token"
            style={{
              display: 'block',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Discord Bot Token{' '}
            <span style={{ color: '#DC2626' }} aria-label="required">
              *
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
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
              style={{
                width: '100%',
                height: '40px',
                padding: '0 40px 0 12px',
                background: '#FFFFFF',
                border: tokenError ? '1.5px solid #DC2626' : '1.5px solid #D1D5DB',
                borderRadius: '0px',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: '#0C1F40',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              aria-label={showToken ? 'Hide token' : 'Show token'}
              onClick={() => setShowToken((v) => !v)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {tokenError && (
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '12px',
                color: '#DC2626',
                marginTop: '4px',
              }}
            >
              {tokenError}
            </p>
          )}
        </div>

        {/* Guild ID field (shown for add, locked for replace) */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="discord-guild-id"
            style={{
              display: 'block',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Discord Server ID (Guild ID){' '}
            {mode === 'add' && (
              <span style={{ color: '#DC2626' }} aria-label="required">
                *
              </span>
            )}
          </label>
          <input
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
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              background: mode === 'replace' ? '#F9FAFB' : '#FFFFFF',
              border: guildIdError ? '1.5px solid #DC2626' : '1.5px solid #D1D5DB',
              borderRadius: '0px',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: mode === 'replace' ? '#6B7280' : '#0C1F40',
              outline: 'none',
              cursor: mode === 'replace' ? 'default' : 'text',
              boxSizing: 'border-box',
            }}
          />
          {mode === 'replace' && (
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '12px',
                color: '#9CA3AF',
                marginTop: '4px',
              }}
            >
              Guild ID cannot be changed. To connect a different server, disconnect this bot and add a new connection.
            </p>
          )}
          {guildIdError && (
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '12px',
                color: '#DC2626',
                marginTop: '4px',
              }}
            >
              {guildIdError}
            </p>
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              padding: '10px 12px',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '13px',
                color: '#DC2626',
              }}
            >
              {submitError}
            </span>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            paddingTop: '4px',
          }}
        >
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
              borderRadius: '0px',
              border: '1.5px solid #D1D5DB',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !token}
            style={{
              height: '36px',
              padding: '0 16px',
              background: isSubmitting || !token ? '#E5E7EB' : '#0C1F40',
              color: isSubmitting || !token ? '#9CA3AF' : '#FFFFFF',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '0px',
              border: 'none',
              cursor: isSubmitting || !token ? 'not-allowed' : 'pointer',
            }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
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
  const isConnected = connection.status === 'connected'

  let borderLeft = '1px solid #E5E7EB'
  if (isConnected) borderLeft = '3px solid #00D4B8'
  else if (isError) borderLeft = '3px solid #EF4444'
  else if (connection.status === 'pending' || connection.status === 'connecting') {
    borderLeft = '3px solid #D97706'
  }

  const displayName = connection.bot_username
    ? `Connected as ${connection.bot_username}`
    : `Guild ID: ${connection.guild_id}`

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          flexShrink: 0,
          background: STATUS_STYLES[connection.status].color,
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            color: '#0C1F40',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </div>
        {connection.bot_username && (
          <div
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '12px',
              color: '#9CA3AF',
              marginTop: '2px',
            }}
          >
            Guild ID: {connection.guild_id}
          </div>
        )}
        {isError && connection.error_message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            <AlertTriangle size={12} color="#DC2626" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '12px',
                color: '#DC2626',
              }}
            >
              {connection.error_message}
            </span>
          </div>
        )}
      </div>

      {/* Badge */}
      <DiscordStatusBadge status={connection.status} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => onReplaceToken(connection)}
          disabled={isMember}
          title={isMember ? 'Only owners and admins can manage integrations.' : undefined}
          style={{
            height: '32px',
            padding: '0 12px',
            background: '#FFFFFF',
            color: isMember ? '#9CA3AF' : '#0C1F40',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '13px',
            borderRadius: '0px',
            border: '1.5px solid #D1D5DB',
            cursor: isMember ? 'not-allowed' : 'pointer',
          }}
        >
          Replace Token
        </button>
        <button
          onClick={() => onDisconnect(connection)}
          disabled={isMember}
          title={isMember ? 'Only owners and admins can manage integrations.' : undefined}
          style={{
            height: '32px',
            padding: '0 12px',
            background: 'transparent',
            color: isMember ? '#9CA3AF' : '#DC2626',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '13px',
            borderRadius: '0px',
            border: 'none',
            cursor: isMember ? 'not-allowed' : 'pointer',
          }}
        >
          Disconnect
        </button>
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

  // Active connections: exclude disconnected (suspended not in current type but handled if added)
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
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DiscordLogo size={28} />
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#0C1F40',
                margin: 0,
              }}
            >
              Discord Bot Connections
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '13px',
                color: '#6B7280',
                margin: '2px 0 0 0',
              }}
            >
              {connections.length === 0
                ? 'No bot connected yet. Add your Discord bot token to get started.'
                : `${activeCount} of ${maxConnections === Infinity ? 'unlimited' : maxConnections} connection${maxConnections === 1 ? '' : 's'} used`}
            </p>
          </div>
        </div>

        <button
          onClick={handleAddConnection}
          disabled={isMember || atLimit}
          title={
            isMember
              ? 'Only owners and admins can manage integrations.'
              : limitMessage
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '36px',
            padding: '0 16px',
            background: isMember || atLimit ? '#E5E7EB' : '#0C1F40',
            color: isMember || atLimit ? '#9CA3AF' : '#FFFFFF',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            borderRadius: '0px',
            border: 'none',
            cursor: isMember || atLimit ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus size={16} />
          Add Connection
        </button>
      </div>

      {/* Connection limit banner */}
      {atLimit && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            padding: '10px 12px',
            marginBottom: '12px',
          }}
        >
          <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#92400E',
            }}
          >
            {limitMessage}{' '}
            <a
              href="/dashboard/billing"
              style={{ color: '#D97706', textDecoration: 'underline', fontWeight: 500 }}
            >
              Upgrade your plan →
            </a>
          </span>
        </div>
      )}

      {/* Error banner */}
      {disconnectError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            padding: '10px 12px',
            marginBottom: '12px',
          }}
        >
          <AlertTriangle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#DC2626',
            }}
          >
            {disconnectError}
          </span>
        </div>
      )}

      {/* Connection list */}
      <div
        style={{
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
        data-tenant-id={tenantId}
      >
        {connections.length === 0 ? (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <DiscordLogo size={48} />
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: '#9CA3AF',
                marginTop: '12px',
              }}
            >
              No Discord bot connected. Click{' '}
              <strong style={{ color: '#6B7280' }}>Add Connection</strong> to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {connections.map((conn, idx) => (
              <React.Fragment key={conn.id}>
                {idx > 0 && (
                  <div style={{ height: '1px', background: '#F3F4F6' }} />
                )}
                <DiscordCardItem
                  connection={conn}
                  userRole={userRole}
                  onReplaceToken={handleReplaceToken}
                  onDisconnect={handleDisconnect}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

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

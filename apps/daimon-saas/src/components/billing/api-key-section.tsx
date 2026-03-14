'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, XCircle, X, Loader2, Eye, EyeOff } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/lib/toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiKeyData {
  id: string
  key_type: 'anthropic' | 'openai'
  key_hint: string | null
  status: 'active' | 'invalid' | 'revoked'
  validated_at: string | null
}

interface ApiKeyRowProps {
  provider: 'anthropic' | 'openai'
  keyData: ApiKeyData | null
  userRole: 'owner' | 'admin' | 'member'
  onAddKey: () => void
  onUpdateKey: () => void
  onDeleteKey: () => void
}

interface ApiKeyModalProps {
  provider: 'anthropic' | 'openai'
  mode: 'add' | 'update'
  keyId?: string
  onClose: () => void
  onSuccess: () => void
}

interface DeleteKeyDialogProps {
  provider: 'anthropic' | 'openai'
  keyId: string
  keyStatus: 'active' | 'invalid' | 'revoked'
  onClose: () => void
  onSuccess: () => void
}

// ---------------------------------------------------------------------------
// Provider metadata
// ---------------------------------------------------------------------------

const PROVIDER_META = {
  anthropic: {
    name: 'Anthropic API Key',
    required: true,
    description:
      'Used for all AI reasoning and tool orchestration. Required for the bot to operate.',
    placeholder: 'sk-ant-api03-...',
    bodyText:
      'Your Anthropic API key is used to power all AI reasoning in your bot. You can find your API key in the Anthropic Console at console.anthropic.com.',
    loadingNote: 'Verifying your key with Anthropic — this takes about 2 seconds.',
    emptyWarning: 'No Anthropic key saved. Your bot cannot run until you add one.',
    invalidWarning:
      'This key was rejected by Anthropic. Please update it to restore bot functionality.',
    deleteTitle: 'Delete Anthropic API Key',
    deleteBody: 'Are you sure you want to delete your Anthropic API key?',
    deleteWarning:
      'Your bot will stop working immediately. It will not reconnect until you add a new key.',
    deletedToast: 'Anthropic API key deleted.',
    savedToast: (mode: 'add' | 'update') =>
      mode === 'add' ? 'Anthropic API key saved.' : 'Anthropic API key updated.',
    serverRejected: 'This key was rejected by Anthropic. Double-check it and try again.',
  },
  openai: {
    name: 'OpenAI API Key',
    required: false,
    description:
      'Used for classification tasks. If not provided, the bot falls back to Claude Haiku for classification — slightly slower but fully functional.',
    placeholder: 'sk-proj-...',
    bodyText:
      'Your OpenAI key is used for text classification tasks. If not provided, the bot uses Claude Haiku as a fallback — your bot works fully without this key.',
    loadingNote: 'Verifying your key with OpenAI — this takes about 2 seconds.',
    emptyWarning: 'No OpenAI key saved. The bot will use Claude Haiku for classification.',
    invalidWarning:
      'This key was rejected by OpenAI. Please update it to restore bot functionality.',
    deleteTitle: 'Delete OpenAI API Key',
    deleteBody: 'Are you sure you want to delete your OpenAI API key?',
    deleteWarning: 'The bot will fall back to Claude Haiku for classification tasks. Your bot will continue to work normally.',
    deletedToast: 'OpenAI API key deleted.',
    savedToast: (mode: 'add' | 'update') =>
      mode === 'add' ? 'OpenAI API key saved.' : 'OpenAI API key updated.',
    serverRejected: 'This key was rejected by OpenAI. Double-check it and try again.',
  },
} as const

// ---------------------------------------------------------------------------
// Validate key format client-side
// ---------------------------------------------------------------------------

function validateKeyFormat(
  provider: 'anthropic' | 'openai',
  value: string
): string | null {
  if (!value.trim()) return 'API key is required.'
  if (/\s/.test(value)) return 'API key should not contain spaces or newlines.'
  if (value.length < 20) return 'This key is too short to be valid.'
  if (provider === 'anthropic' && !value.startsWith('sk-ant-')) {
    return "This doesn't look like an Anthropic API key. It should start with 'sk-ant-'."
  }
  if (provider === 'openai' && !value.startsWith('sk-')) {
    return "This doesn't look like an OpenAI API key. It should start with 'sk-'."
  }
  return null
}

// ---------------------------------------------------------------------------
// StatusLine — shows valid/invalid/revoked with icon + date
// ---------------------------------------------------------------------------

function StatusLine({ keyData }: { keyData: ApiKeyData }) {
  const dateStr = keyData.validated_at
    ? new Date(keyData.validated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  if (keyData.status === 'active') {
    return (
      <div className="flex items-center gap-[6px] mt-[6px]" style={{ color: '#059669' }}>
        <CheckCircle size={14} />
        <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '13px' }}>
          Valid{dateStr ? ` · Last validated ${dateStr}` : ''}
        </span>
      </div>
    )
  }
  if (keyData.status === 'invalid') {
    return (
      <div className="flex items-center gap-[6px] mt-[6px]" style={{ color: '#DC2626' }}>
        <XCircle size={14} />
        <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '13px' }}>
          Invalid{dateStr ? ` · Last attempted ${dateStr}` : ''}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-[6px] mt-[6px]" style={{ color: '#6B7280' }}>
      <XCircle size={14} />
      <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '13px' }}>
        Revoked
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ApiKeyRow
// ---------------------------------------------------------------------------

function ApiKeyRow({
  provider,
  keyData,
  userRole,
  onAddKey,
  onUpdateKey,
  onDeleteKey,
}: ApiKeyRowProps) {
  const meta = PROVIDER_META[provider]
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  const hasKey = keyData !== null && keyData.status !== 'revoked'

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    padding: '6px 14px',
    borderRadius: '0px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background 0.15s, opacity 0.15s',
  }

  const addKeyBtn: React.CSSProperties = {
    ...btnBase,
    background: '#B4E7DD',
    color: '#0C1F40',
    border: 'none',
  }

  const updateBtnActive: React.CSSProperties = {
    ...btnBase,
    background: 'white',
    color: '#0C1F40',
    border: '1px solid #0C1F40',
  }

  const updateBtnInvalid: React.CSSProperties = {
    ...btnBase,
    background: '#B4E7DD',
    color: '#0C1F40',
    border: 'none',
  }

  const deleteBtn: React.CSSProperties = {
    ...btnBase,
    background: 'white',
    color: '#DC2626',
    border: '1px solid #DC2626',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'white',
        border: '1px solid #E5E7EB',
        padding: '20px 24px',
        marginBottom: '16px',
      }}
    >
      {/* Header row: name + badge + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          {/* Name + required/optional badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#0C1F40',
              }}
            >
              {meta.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '10px',
                fontWeight: 500,
                textTransform: 'uppercase',
                padding: '2px 6px',
                letterSpacing: '0.05em',
                ...(meta.required
                  ? { background: '#B4E7DD', color: '#0C1F40' }
                  : { background: '#F3F4F6', color: '#6B7280' }),
              }}
            >
              {meta.required ? 'Required' : 'Optional'}
            </span>
          </div>
          {/* Description */}
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#6B7280',
              marginTop: '2px',
            }}
          >
            {meta.description}
          </p>
        </div>

        {/* Action buttons — hidden for member role */}
        {isOwnerOrAdmin && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignSelf: 'flex-end' }}>
            {!hasKey && (
              <button style={addKeyBtn} onClick={onAddKey}>
                Add Key
              </button>
            )}
            {hasKey && keyData?.status === 'active' && (
              <>
                <button style={updateBtnActive} onClick={onUpdateKey}>
                  Update
                </button>
                <button style={deleteBtn} onClick={onDeleteKey}>
                  Delete
                </button>
              </>
            )}
            {hasKey && keyData?.status === 'invalid' && (
              <>
                <button style={updateBtnInvalid} onClick={onUpdateKey}>
                  Update
                </button>
                <button style={deleteBtn} onClick={onDeleteKey}>
                  Delete
                </button>
              </>
            )}
            {keyData?.status === 'revoked' && (
              <button style={addKeyBtn} onClick={onAddKey}>
                Add Key
              </button>
            )}
          </div>
        )}
      </div>

      {/* Key hint box when key is saved */}
      {hasKey && keyData && (
        <div>
          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              padding: '10px 14px',
              width: '100%',
            }}
          >
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#374151',
                display: 'block',
              }}
            >
              {keyData.key_hint ?? '••••••••••••••••'}
            </code>
            <StatusLine keyData={keyData} />
          </div>

          {/* Invalid key inline warning */}
          {keyData.status === 'invalid' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                padding: '8px 12px',
                marginTop: '8px',
              }}
            >
              <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '13px',
                  color: '#92400E',
                }}
              >
                {meta.invalidWarning}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasKey && (
        <>
          {provider === 'anthropic' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                padding: '8px 12px',
              }}
            >
              <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '13px',
                  color: '#92400E',
                }}
              >
                {meta.emptyWarning}
              </span>
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '13px',
                color: '#6B7280',
              }}
            >
              {meta.emptyWarning}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ApiKeyModal
// ---------------------------------------------------------------------------

function ApiKeyModal({ provider, mode, keyId, onClose, onSuccess }: ApiKeyModalProps) {
  const meta = PROVIDER_META[provider]
  const { toast } = useToast()
  const [keyValue, setKeyValue] = React.useState('')
  const [showKey, setShowKey] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showDiscard, setShowDiscard] = React.useState(false)

  const title = mode === 'add' ? `Add ${meta.name}` : `Update ${meta.name}`

  function handleCancelClick() {
    if (keyValue.trim().length > 0) {
      setShowDiscard(true)
    } else {
      onClose()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation
    const validationError = validateKeyFormat(provider, keyValue)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/billing/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_type: provider, key_value: keyValue }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? meta.serverRejected)
        return
      }

      toast.success(meta.savedToast(mode))
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trap focus: close on overlay click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      handleCancelClick()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.50)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: 'white',
          width: '480px',
          maxWidth: '95vw',
          padding: '32px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleCancelClick}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6B7280',
            display: 'flex',
            padding: '4px',
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C1F40',
            marginBottom: '8px',
          }}
        >
          {title}
        </h2>

        {/* Body text */}
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '24px',
            lineHeight: '1.5',
          }}
        >
          {meta.bodyText}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Key input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="api-key-input"
              style={{
                display: 'block',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0C1F40',
                marginBottom: '6px',
              }}
            >
              {meta.name}
              <span aria-hidden="true" style={{ color: '#DC2626', marginLeft: '2px' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={(e) => { setKeyValue(e.target.value); setError(null) }}
                placeholder={meta.placeholder}
                disabled={isSubmitting}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '12px',
                  paddingRight: '44px',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '15px',
                  color: '#0C1F40',
                  border: error ? '1px solid #DC2626' : '1px solid rgba(12,31,64,0.20)',
                  background: error ? '#FEF2F2' : isSubmitting ? '#F7F7F7' : 'white',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                disabled={isSubmitting}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: 'rgba(12,31,64,0.45)',
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && (
              <p
                role="alert"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '13px',
                  color: '#DC2626',
                  marginTop: '4px',
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Discard warning */}
          {showDiscard && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '13px',
                  color: '#92400E',
                  flex: 1,
                }}
              >
                Your key won&apos;t be saved. Are you sure?
              </span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#DC2626',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setShowDiscard(false)}
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0C1F40',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Keep Editing
              </button>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!showDiscard && (
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={isSubmitting}
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0C1F40',
                  background: 'white',
                  border: '1px solid #0C1F40',
                  padding: '10px 20px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0C1F40',
                background: '#B4E7DD',
                border: 'none',
                padding: '10px 20px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.8 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? 'Validating...' : 'Save Key'}
            </button>
          </div>
          {isSubmitting && (
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '12px',
                color: '#6B7280',
                marginTop: '8px',
              }}
            >
              {meta.loadingNote}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DeleteKeyDialog
// ---------------------------------------------------------------------------

function DeleteKeyDialog({ provider, keyId, keyStatus, onClose, onSuccess }: DeleteKeyDialogProps) {
  const meta = PROVIDER_META[provider]
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/billing/api-keys/${keyId}`, { method: 'DELETE' })
      if (!res.ok) {
        setDeleteError('Could not delete key. Please try again.')
        return
      }
      toast.success(meta.deletedToast)
      onSuccess()
    } catch {
      setDeleteError('Could not delete key. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const showWarning = provider === 'anthropic' || keyStatus === 'active'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.50)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onClose() }}
    >
      <div
        style={{
          background: 'white',
          width: '440px',
          maxWidth: '95vw',
          padding: '32px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            color: '#6B7280',
            display: 'flex',
            padding: '4px',
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C1F40',
            marginBottom: '16px',
          }}
        >
          {meta.deleteTitle}
        </h2>

        {/* Body */}
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#374151',
            marginBottom: showWarning ? '12px' : '24px',
            lineHeight: '1.5',
          }}
        >
          {meta.deleteBody}
        </p>

        {/* Warning box */}
        {showWarning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              padding: '10px 12px',
              marginBottom: '24px',
            }}
          >
            <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '13px',
                color: '#92400E',
              }}
            >
              {meta.deleteWarning}
            </span>
          </div>
        )}

        {/* Error */}
        {deleteError && (
          <p
            role="alert"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#DC2626',
              marginBottom: '16px',
            }}
          >
            {deleteError}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0C1F40',
              background: 'white',
              border: '1px solid #0C1F40',
              padding: '8px 20px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              background: '#DC2626',
              border: 'none',
              padding: '8px 20px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Key'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ApiKeySection — main export
// ---------------------------------------------------------------------------

type ModalState =
  | { type: 'none' }
  | { type: 'add'; provider: 'anthropic' | 'openai' }
  | { type: 'update'; provider: 'anthropic' | 'openai'; keyId: string }
  | { type: 'delete'; provider: 'anthropic' | 'openai'; keyId: string; keyStatus: 'active' | 'invalid' | 'revoked' }

export interface ApiKeySectionProps {
  apiKeys: ApiKeyData[]
  userRole: 'owner' | 'admin' | 'member'
}

export function ApiKeySection({ apiKeys, userRole }: ApiKeySectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [modal, setModal] = React.useState<ModalState>({ type: 'none' })

  const anthropicKey = apiKeys.find((k) => k.key_type === 'anthropic') ?? null
  const openaiKey = apiKeys.find((k) => k.key_type === 'openai') ?? null

  function handleSuccess() {
    setModal({ type: 'none' })
    router.refresh()
  }

  function openAdd(provider: 'anthropic' | 'openai') {
    setModal({ type: 'add', provider })
  }

  function openUpdate(provider: 'anthropic' | 'openai', keyId: string) {
    setModal({ type: 'update', provider, keyId })
  }

  function openDelete(
    provider: 'anthropic' | 'openai',
    keyId: string,
    keyStatus: 'active' | 'invalid' | 'revoked'
  ) {
    setModal({ type: 'delete', provider, keyId, keyStatus })
  }

  async function handleConfirmDelete() {
    if (modal.type !== 'delete') return
    const { provider, keyId } = modal
    const meta = PROVIDER_META[provider]
    const res = await fetch(`/api/billing/api-keys/${keyId}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Could not delete key. Please try again.')
      return
    }
    toast.success(meta.deletedToast)
    handleSuccess()
  }

  return (
    <>
      {/* Section header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            color: '#0C1F40',
          }}
        >
          API Keys
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#6B7280',
            marginTop: '4px',
            maxWidth: '640px',
          }}
        >
          Your API keys are encrypted at rest using AES-256 and never exposed in plaintext. You are
          charged directly by Anthropic for AI usage — Daimon only charges the platform fee.
        </p>
      </div>

      {/* Anthropic row */}
      <ApiKeyRow
        provider="anthropic"
        keyData={anthropicKey}
        userRole={userRole}
        onAddKey={() => openAdd('anthropic')}
        onUpdateKey={() => anthropicKey && openUpdate('anthropic', anthropicKey.id)}
        onDeleteKey={() =>
          anthropicKey && openDelete('anthropic', anthropicKey.id, anthropicKey.status)
        }
      />

      {/* OpenAI row */}
      <ApiKeyRow
        provider="openai"
        keyData={openaiKey}
        userRole={userRole}
        onAddKey={() => openAdd('openai')}
        onUpdateKey={() => openaiKey && openUpdate('openai', openaiKey.id)}
        onDeleteKey={() =>
          openaiKey && openDelete('openai', openaiKey.id, openaiKey.status)
        }
      />

      {/* Modals */}
      {modal.type === 'add' && (
        <ApiKeyModal
          provider={modal.provider}
          mode="add"
          onClose={() => setModal({ type: 'none' })}
          onSuccess={handleSuccess}
        />
      )}
      {modal.type === 'update' && (
        <ApiKeyModal
          provider={modal.provider}
          mode="update"
          keyId={modal.keyId}
          onClose={() => setModal({ type: 'none' })}
          onSuccess={handleSuccess}
        />
      )}
      {modal.type === 'delete' && (
        <ConfirmDialog
          open
          onOpenChange={(open) => { if (!open) setModal({ type: 'none' }) }}
          variant="danger"
          title={PROVIDER_META[modal.provider].deleteTitle}
          description={`${PROVIDER_META[modal.provider].deleteBody} ${PROVIDER_META[modal.provider].deleteWarning}`}
          confirmLabel="Delete Key"
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}

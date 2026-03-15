'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
      <div className="flex items-center gap-1.5 mt-1.5 text-emerald-600">
        <CheckCircle size={14} />
        <span className="text-[13px]">
          Valid{dateStr ? ` · Last validated ${dateStr}` : ''}
        </span>
      </div>
    )
  }
  if (keyData.status === 'invalid') {
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-destructive">
        <XCircle size={14} />
        <span className="text-[13px]">
          Invalid{dateStr ? ` · Last attempted ${dateStr}` : ''}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
      <XCircle size={14} />
      <span className="text-[13px]">Revoked</span>
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

  return (
    <Card className="flex flex-col gap-3 p-5 mb-4">
      {/* Header row: name + badge + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Name + required/optional badge */}
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-foreground">
              {meta.name}
            </span>
            <Badge
              variant={meta.required ? 'success' : 'neutral'}
              size="sm"
              label={meta.required ? 'Required' : 'Optional'}
            />
          </div>
          {/* Description */}
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {meta.description}
          </p>
        </div>

        {/* Action buttons — hidden for member role */}
        {isOwnerOrAdmin && (
          <div className="flex gap-2 shrink-0 self-end">
            {!hasKey && (
              <Button size="sm" onClick={onAddKey}>
                Add Key
              </Button>
            )}
            {hasKey && keyData?.status === 'active' && (
              <>
                <Button variant="outline" size="sm" onClick={onUpdateKey}>
                  Update
                </Button>
                <Button variant="destructive" size="sm" onClick={onDeleteKey}>
                  Delete
                </Button>
              </>
            )}
            {hasKey && keyData?.status === 'invalid' && (
              <>
                <Button size="sm" onClick={onUpdateKey}>
                  Update
                </Button>
                <Button variant="destructive" size="sm" onClick={onDeleteKey}>
                  Delete
                </Button>
              </>
            )}
            {keyData?.status === 'revoked' && (
              <Button size="sm" onClick={onAddKey}>
                Add Key
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Key hint box when key is saved */}
      {hasKey && keyData && (
        <div>
          <div className="bg-muted/50 border border-border p-2.5 w-full">
            <code className="font-mono text-sm text-foreground/80 block">
              {keyData.key_hint ?? '••••••••••••••••'}
            </code>
            <StatusLine keyData={keyData} />
          </div>

          {/* Invalid key inline warning */}
          {keyData.status === 'invalid' && (
            <Alert variant="default" className="mt-2 border-amber-300 bg-amber-50">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <AlertDescription className="text-[13px] text-amber-900">
                {meta.invalidWarning}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasKey && (
        <>
          {provider === 'anthropic' ? (
            <Alert variant="default" className="border-amber-300 bg-amber-50">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <AlertDescription className="text-[13px] text-amber-900">
                {meta.emptyWarning}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {meta.emptyWarning}
            </p>
          )}
        </>
      )}
    </Card>
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

  function handleOpenChange(open: boolean) {
    if (!open) handleCancelClick()
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{title}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {meta.bodyText}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Key input */}
          <div className="mb-5">
            <Label htmlFor="api-key-input" className="text-[13px] font-medium text-foreground mb-1.5">
              {meta.name}
              <span aria-hidden="true" className="text-destructive ml-0.5">*</span>
            </Label>
            <div className="relative">
              <Input
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
                className={cn(
                  'h-[44px] pr-11 text-[15px]',
                  error && 'border-destructive bg-destructive/5'
                )}
                aria-invalid={!!error}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowKey((v) => !v)}
                disabled={isSubmitting}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                className="absolute right-0 top-0 h-[44px] w-[44px] text-muted-foreground"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>
            {error && (
              <p role="alert" className="text-[13px] text-destructive mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Discard warning */}
          {showDiscard && (
            <Alert variant="default" className="mb-4 border-amber-300 bg-amber-50">
              <AlertDescription className="flex items-center gap-3 text-[13px] text-amber-900">
                <span className="flex-1">Your key won&apos;t be saved. Are you sure?</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-destructive hover:text-destructive"
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiscard(false)}
                >
                  Keep Editing
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {!showDiscard && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(isSubmitting && 'opacity-80')}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? 'Validating...' : 'Save Key'}
            </Button>
          </div>
          {isSubmitting && (
            <p className="text-xs text-muted-foreground mt-2">
              {meta.loadingNote}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
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
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          API Keys
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-[640px]">
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

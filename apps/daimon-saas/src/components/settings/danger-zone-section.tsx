'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SettingsDangerZoneSectionProps {
  tenantName: string
  discordConnectionCount: number
  memberCount: number
}

export function SettingsDangerZoneSection({
  tenantName,
  discordConnectionCount,
  memberCount,
}: SettingsDangerZoneSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const isConfirmed = confirmText === tenantName

  function openModal() {
    setConfirmText('')
    setModalOpen(true)
  }

  function closeModal() {
    if (loading) return
    setModalOpen(false)
    setConfirmText('')
  }

  async function handleDelete() {
    if (!isConfirmed || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/settings/workspace', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to delete workspace. Please try again.')
      }
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete workspace. Please try again.'
      toast.error(message)
      setLoading(false)
    }
  }

  const consequences = [
    `All Discord connections (${discordConnectionCount} connection${discordConnectionCount !== 1 ? 's' : ''})`,
    'All API keys (Anthropic, OpenAI)',
    'All service integrations (GitHub, Google, Linear, Toggl)',
    'All billing data and subscription history',
    `All team members (${memberCount} member${memberCount !== 1 ? 's' : ''})`,
  ]

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #FCA5A5',
        borderRadius: '0px',
        marginBottom: '24px',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '24px 32px 20px 32px',
          borderBottom: '1px solid #FCA5A5',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#991B1B',
            marginBottom: '4px',
          }}
        >
          Danger Zone
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#6B7280',
            margin: 0,
          }}
        >
          These actions are permanent and cannot be undone.
        </p>
      </div>

      {/* Card body */}
      <div style={{ padding: '24px 32px 32px 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#374151',
                marginBottom: '4px',
              }}
            >
              Delete Workspace
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#6B7280',
                maxWidth: '480px',
                margin: 0,
              }}
            >
              Permanently delete this workspace, all Discord connections, API keys, service
              integrations, and billing data. This cannot be reversed.
            </p>
          </div>
          <button
            id="delete-workspace-btn"
            type="button"
            onClick={openModal}
            style={{
              height: '40px',
              padding: '0 20px',
              background: '#DC2626',
              color: '#FFFFFF',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              borderRadius: '0px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#B91C1C'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#DC2626'
            }}
          >
            Delete Workspace
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={modalOpen}
        onOpenChange={closeModal}
        title="Delete Workspace"
        size="md"
        loading={loading}
        closeOnBackdrop={!loading}
        closeOnEscape={!loading}
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              id="delete-workspace-cancel"
              onClick={closeModal}
              disabled={loading}
              style={{
                height: '40px',
                padding: '0 20px',
                background: '#FFFFFF',
                color: '#374151',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                border: '1px solid #D1D5DB',
                borderRadius: '0px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.4 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              id="delete-workspace-confirm"
              onClick={handleDelete}
              disabled={!isConfirmed || loading}
              style={{
                height: '40px',
                padding: '0 20px',
                background: '#DC2626',
                color: '#FFFFFF',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                borderRadius: '0px',
                cursor: !isConfirmed || loading ? 'not-allowed' : 'pointer',
                opacity: !isConfirmed ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '160px',
              }}
              onMouseEnter={(e) => {
                if (isConfirmed && !loading) e.currentTarget.style.background = '#B91C1C'
              }}
              onMouseLeave={(e) => {
                if (isConfirmed && !loading) e.currentTarget.style.background = '#DC2626'
              }}
            >
              {loading ? (
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #FFFFFF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
              ) : (
                'Delete This Workspace'
              )}
            </button>
          </div>
        }
      >
        {/* Warning banner */}
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '12px 16px',
            borderRadius: '0px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#991B1B',
          }}
        >
          <span>⚠️</span>
          <span>
            This will permanently delete <strong>{tenantName}</strong> and all associated data.
            This action is irreversible.
          </span>
        </div>

        {/* Consequences list */}
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          The following will be permanently deleted:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
          {consequences.map((item) => (
            <li
              key={item}
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#374151',
                padding: '3px 0',
              }}
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Confirm input */}
        <div>
          <label
            htmlFor="delete-confirm-input"
            style={{
              display: 'block',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            Type <strong>{tenantName}</strong> to confirm:
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={tenantName}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: '100%',
              height: '40px',
              padding: '10px 12px',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#111827',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '0px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #DC2626'
              e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.15)'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #D1D5DB'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

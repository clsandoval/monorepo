'use client'

import * as React from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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

  async function handleDelete() {
    const res = await fetch('/api/settings/workspace', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Failed to delete workspace. Please try again.')
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/?deleted=1')
  }

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
            onClick={() => setModalOpen(true)}
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

      <ConfirmDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        variant="danger"
        title="Delete Workspace"
        description={`This permanently deletes ${tenantName} and all associated data including ${discordConnectionCount} Discord connection${discordConnectionCount !== 1 ? 's' : ''}, API keys, service integrations, ${memberCount} team member${memberCount !== 1 ? 's' : ''}, and billing data. This cannot be reversed.`}
        confirmLabel="Delete Workspace"
        confirmationText={tenantName}
        onConfirm={handleDelete}
      />
    </div>
  )
}

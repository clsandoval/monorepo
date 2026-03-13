'use client'

import * as React from 'react'
import { Tabs } from '@/components/ui/tabs'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { Copy, Check } from 'lucide-react'

interface WorkspaceSectionProps {
  tenant: {
    id: string
    name: string
    created_at: string
  }
  userRole: 'owner' | 'admin' | 'member'
}

function WorkspaceSection({ tenant, userRole }: WorkspaceSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [name, setName] = React.useState(tenant.name)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const isDisabled = userRole === 'member'
  const hasChanged = name !== tenant.name && name.trim().length > 0

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(tenant.created_at))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!hasChanged || isDisabled) return

    if (name.trim().length === 0) {
      setError('Workspace name is required.')
      return
    }
    if (name.length > 100) {
      setError('Workspace name must be 100 characters or less.')
      return
    }

    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save workspace name. Please try again.')
      }
      toast.success('Workspace name updated.')
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save workspace name. Please try again.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tenant.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: silent fail
    }
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '0px',
        marginBottom: '24px',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '24px 32px 20px 32px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C1F40',
            marginBottom: '4px',
          }}
        >
          Workspace
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
          Manage your workspace name and view workspace details.
        </p>
      </div>

      {/* Card body */}
      <div style={{ padding: '24px 32px 32px 32px' }}>
        {/* Workspace name form */}
        <form onSubmit={handleSave}>
          <div>
            <label
              htmlFor="workspace-name"
              style={{
                display: 'block',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Workspace Name
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <input
                id="workspace-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                maxLength={100}
                required
                disabled={isDisabled}
                aria-label="Workspace name"
                aria-describedby="workspace-name-hint"
                title={isDisabled ? 'Only the workspace owner can perform this action.' : undefined}
                style={{
                  width: '320px',
                  height: '40px',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: isDisabled ? '#9CA3AF' : '#111827',
                  background: isDisabled ? '#F9FAFB' : '#FFFFFF',
                  border: error ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  borderRadius: '0px',
                  outline: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'text',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!isDisabled) {
                    e.target.style.border = '1px solid #0C1F40'
                    e.target.style.boxShadow = '0 0 0 3px rgba(180, 231, 221, 0.4)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.border = error ? '1px solid #EF4444' : '1px solid #D1D5DB'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                id="workspace-name-save"
                type="submit"
                disabled={!hasChanged || isDisabled || saving}
                title={
                  isDisabled ? 'Only the workspace owner can perform this action.' : undefined
                }
                style={{
                  height: '40px',
                  minWidth: '80px',
                  padding: '0 20px',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#0C1F40',
                  background: '#B4E7DD',
                  border: 'none',
                  borderRadius: '0px',
                  cursor: !hasChanged || isDisabled || saving ? 'not-allowed' : 'pointer',
                  opacity: !hasChanged || isDisabled ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {saving ? (
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #0C1F40',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                ) : (
                  'Save'
                )}
              </button>
            </div>
            {error ? (
              <p
                id="workspace-name-error"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#EF4444',
                  marginTop: '6px',
                  margin: '6px 0 0 0',
                }}
              >
                {error}
              </p>
            ) : (
              <p
                id="workspace-name-hint"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#6B7280',
                  marginTop: '6px',
                  margin: '6px 0 0 0',
                }}
              >
                Between 1 and 100 characters.
              </p>
            )}
          </div>
        </form>

        {/* Workspace metadata */}
        <dl
          style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          {/* Workspace ID */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <dt
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                color: '#6B7280',
                minWidth: '140px',
                flexShrink: 0,
              }}
            >
              Workspace ID
            </dt>
            <dd
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                margin: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '12px',
                  color: '#111827',
                }}
              >
                {tenant.id}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy workspace ID"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6B7280',
                  outline: 'none',
                  borderRadius: '2px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid #B4E7DD'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0C1F40'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </dd>
          </div>

          {/* Created date */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <dt
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                color: '#6B7280',
                minWidth: '140px',
                flexShrink: 0,
              }}
            >
              Created
            </dt>
            <dd
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#111827',
                margin: 0,
              }}
            >
              {formattedDate}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

interface SettingsContentProps {
  tenant: {
    id: string
    name: string
    created_at: string
  }
  userRole: 'owner' | 'admin' | 'member'
}

export function SettingsContent({ tenant, userRole }: SettingsContentProps) {
  const [activeTab, setActiveTab] = React.useState('workspace')

  const tabs = [
    { value: 'workspace', label: 'Workspace' },
    { value: 'discord', label: 'Discord' },
    { value: 'account', label: 'Account' },
    ...(userRole === 'owner' ? [{ value: 'danger', label: 'Danger Zone' }] : []),
  ]

  return (
    <div>
      {/* Tab navigation */}
      <div style={{ marginBottom: '24px' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
      </div>

      {/* Tab panels */}
      {activeTab === 'workspace' && (
        <WorkspaceSection tenant={tenant} userRole={userRole} />
      )}

      {activeTab === 'discord' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '32px',
            color: '#6B7280',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
          }}
        >
          Discord connection settings coming in the next stage.
        </div>
      )}

      {activeTab === 'account' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '32px',
            color: '#6B7280',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
          }}
        >
          Account settings coming in the next stage.
        </div>
      )}

      {activeTab === 'danger' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '32px',
            color: '#6B7280',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
          }}
        >
          Danger zone settings coming in the next stage.
        </div>
      )}
    </div>
  )
}

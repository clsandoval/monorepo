'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantDetail {
  id: string
  name: string
  plan: 'free' | 'starter' | 'pro'
  status: 'pending' | 'configured' | 'active' | 'suspended'
  stripe_customer_id: string | null
  owner_id: string
  created_at: string
  updated_at: string
  ownerEmail: string
  memberCount: number
  discordConnections: DiscordConn[]
  apiKeys: ApiKey[]
  serviceConnections: ServiceConn[]
  subscription: SubData | null
  auditLog: AuditEntry[]
}

interface DiscordConn {
  id: string
  bot_username: string | null
  guild_id: string
  status: string
  last_heartbeat: string | null
  error_message: string | null
}

interface ApiKey {
  id: string
  api_key_type: string
  key_hint: string
  status: string
  validated_at: string | null
}

interface ServiceConn {
  id: string
  service_name: string
  status: string
  created_at: string
  metadata: Record<string, string> | null
}

interface SubData {
  plan: string
  stripe_status: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  trial_end: string | null
  created_at: string
}

interface AuditEntry {
  id: string
  action: string
  admin_user_id: string
  adminEmail: string
  created_at: string
  metadata: Record<string, unknown> | null
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    free: { bg: '#F3F4F6', color: '#6B7280' },
    starter: { bg: 'rgba(180,231,221,0.3)', color: 'var(--color-foreground)' },
    pro: { bg: 'var(--color-primary)', color: 'var(--color-foreground)' },
  }
  const s = styles[plan] ?? styles.free
  return (
    <span className="font-body text-[11px] font-semibold uppercase tracking-wide py-0.5 px-2 rounded-none whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#FEF9C3', color: '#854D0E' },
    configured: { bg: '#DBEAFE', color: '#1E40AF' },
    active: { bg: 'rgba(180,231,221,0.4)', color: '#065F46' },
    suspended: { bg: '#FEE2E2', color: '#991B1B' },
  }
  const s = styles[status] ?? { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="font-body text-[11px] font-semibold uppercase tracking-wide py-0.5 px-2 rounded-none whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function DiscordStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#FEF9C3', color: '#854D0E' },
    connecting: { bg: '#DBEAFE', color: '#1E40AF' },
    connected: { bg: 'rgba(180,231,221,0.4)', color: '#065F46' },
    disconnected: { bg: '#F3F4F6', color: '#6B7280' },
    error: { bg: '#FEE2E2', color: '#991B1B' },
    suspended: { bg: '#F3F4F6', color: '#6B7280' },
  }
  const s = styles[status] ?? { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="font-body text-[11px] font-semibold uppercase tracking-wide py-0.5 px-2 rounded-none whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function ApiKeyStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(180,231,221,0.4)', color: '#065F46' },
    invalid: { bg: '#FEE2E2', color: '#991B1B' },
    revoked: { bg: '#F3F4F6', color: '#6B7280' },
  }
  const s = styles[status] ?? { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="font-body text-[11px] font-semibold uppercase tracking-wide py-0.5 px-2 rounded-none whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function ServiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(180,231,221,0.4)', color: '#065F46' },
    expired: { bg: '#FEF9C3', color: '#854D0E' },
    revoked: { bg: '#F3F4F6', color: '#6B7280' },
    error: { bg: '#FEE2E2', color: '#991B1B' },
  }
  const s = styles[status] ?? { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="font-body text-[11px] font-semibold uppercase tracking-wide py-0.5 px-2 rounded-none whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

// ─── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={copy}
              aria-label="Copy"
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
            </Button>
          }
        />
        <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toISOString().replace('T', ' at ').replace(/\.\d+Z$/, ' UTC')
}

function formatDateShort(iso: string): string {
  return new Date(iso).toISOString().split('T')[0]
}

const ACTION_LABELS: Record<string, string> = {
  tenant_suspended: 'Tenant Suspended',
  tenant_unsuspended: 'Tenant Unsuspended',
  tenant_plan_override: 'Plan Override',
  impersonation_started: 'Impersonation Started',
  impersonation_ended: 'Impersonation Ended',
  tenant_deleted_by_admin: 'Tenant Deleted (Admin)',
  api_key_revoked_by_admin: 'API Key Revoked',
  discord_connection_reset: 'Discord Connection Reset',
  subscription_override: 'Subscription Override',
  user_banned: 'User Banned',
  tenant_impersonated: 'Impersonation Started',
  tenant_plan_override_by_admin: 'Plan Override',
}

function auditMetaSummary(action: string, metadata: Record<string, unknown> | null): string {
  if (!metadata) return '—'
  switch (action) {
    case 'tenant_suspended':
    case 'tenant_unsuspended':
      return metadata.note ? `note: ${metadata.note}` : '(no note)'
    case 'tenant_plan_override':
    case 'tenant_plan_override_by_admin':
      return metadata.old_plan && metadata.new_plan ? `${metadata.old_plan} → ${metadata.new_plan}` : '—'
    case 'impersonation_started':
    case 'tenant_impersonated': {
      const sid = String(metadata.impersonated_by ?? metadata.session_id ?? '')
      return sid ? `session: ${sid.slice(0, 8)}...` : '—'
    }
    case 'impersonation_ended':
      return metadata.duration_seconds ? `duration: ${metadata.duration_seconds}s` : '—'
    case 'api_key_revoked_by_admin':
      return [metadata.key_hint && `key: ${metadata.key_hint}`, metadata.reason && `reason: ${metadata.reason}`].filter(Boolean).join(', ') || '—'
    case 'discord_connection_reset':
      return [metadata.guild_id && `guild: ${metadata.guild_id}`, metadata.previous_status && metadata.new_status && `${metadata.previous_status} → ${metadata.new_status}`].filter(Boolean).join(', ') || '—'
    case 'subscription_override':
      return metadata.action_taken ? `action: ${metadata.action_taken}` : '—'
    case 'user_banned':
      return metadata.reason ? `reason: ${metadata.reason}` : '—'
    default:
      return '—'
  }
}

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 mb-4">
      <div className="font-headline text-sm font-semibold text-foreground py-4 px-5 border-b border-gray-200">
        {title}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

// ─── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex py-2 border-b border-gray-100 gap-4">
      <span className="font-body text-[13px] text-gray-500 min-w-[180px] shrink-0">{label}</span>
      <span className="font-body text-[13px] text-foreground flex items-center gap-1 flex-wrap">{children}</span>
    </div>
  )
}

// ─── Small button ──────────────────────────────────────────────────────────────

function SmBtn({ variant = 'secondary', onClick, disabled, children }: { variant?: 'secondary' | 'danger' | 'danger-outline'; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  const variantClasses: Record<string, string> = {
    secondary: 'bg-white border border-gray-200 text-foreground',
    danger: 'bg-destructive border border-destructive text-white',
    'danger-outline': 'bg-white border border-destructive text-destructive',
  }
  return (
    <button className={`font-body text-xs font-medium py-0.5 px-2.5 rounded-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${variantClasses[variant ?? 'secondary']}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children, preventBackdropClose }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; preventBackdropClose?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={preventBackdropClose ? undefined : onClose} />
      <div className="relative bg-white w-[480px] max-w-[95vw] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="font-headline text-base font-semibold text-foreground mb-4">{title}</div>
        {children}
      </div>
    </div>
  )
}

// ─── Main client component ─────────────────────────────────────────────────────

export function TenantDetailClient({ tenant }: { tenant: TenantDetail }) {
  const router = useRouter()
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // Modal state
  const [suspendOpen, setSuspendOpen] = useState(false)

  const [unsuspendOpen, setUnsuspendOpen] = useState(false)
  const [unsuspendPending, setUnsuspendPending] = useState(false)

  const [overridePlanOpen, setOverridePlanOpen] = useState(false)
  const [overridePlanTarget, setOverridePlanTarget] = useState<string>('')
  const [overridePlanPending, setOverridePlanPending] = useState(false)

  const [impersonateOpen, setImpersonateOpen] = useState(false)
  const [impersonatePending, setImpersonatePending] = useState(false)

  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null)
  const [revokeKeyHint, setRevokeKeyHint] = useState('')
  const [revokeKeyReason, setRevokeKeyReason] = useState('')
  const [revokeKeyPending, setRevokeKeyPending] = useState(false)

  const [revokeServiceId, setRevokeServiceId] = useState<string | null>(null)
  const [revokeServiceName, setRevokeServiceName] = useState('')
  const [revokeServicePending, setRevokeServicePending] = useState(false)

  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0)
  const [deleteNameInput, setDeleteNameInput] = useState('')
  const [deletePending, setDeletePending] = useState(false)

  const refresh = () => startTransition(() => router.refresh())

  // ── Suspend ──
  const handleSuspend = async () => {
    const res = await fetch(`/api/admin/tenants/${tenant.id}/suspend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error((data as { error?: string }).error ?? 'Failed to suspend tenant.')
      return
    }
    toast.success('Tenant suspended.')
    setSuspendOpen(false)
    refresh()
  }

  // ── Unsuspend ──
  const handleUnsuspend = async () => {
    setUnsuspendPending(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/unsuspend`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      toast.success('Tenant unsuspended.')
      setUnsuspendOpen(false)
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to unsuspend tenant.')
    } finally {
      setUnsuspendPending(false)
    }
  }

  // ── Override plan ──
  const handleOverridePlan = async () => {
    setOverridePlanPending(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/plan`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: overridePlanTarget }) })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      toast.success(`Plan overridden to ${overridePlanTarget}.`)
      setOverridePlanOpen(false)
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to override plan.')
    } finally {
      setOverridePlanPending(false)
    }
  }

  // ── Impersonate ──
  const handleImpersonate = async () => {
    setImpersonatePending(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/impersonate`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      const { impersonation_url } = await res.json()
      setImpersonateOpen(false)
      // Navigate to Supabase magic link (external URL) — replaces the current session
      window.location.href = impersonation_url ?? '/dashboard'
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start impersonation.')
      setImpersonatePending(false)
    }
  }

  // ── Revoke API key ──
  const handleRevokeKey = async () => {
    if (!revokeKeyId) return
    setRevokeKeyPending(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/revoke-api-key`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyId: revokeKeyId, reason: revokeKeyReason }) })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      toast.success('API key revoked.')
      setRevokeKeyId(null)
      setRevokeKeyReason('')
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to revoke key.')
    } finally {
      setRevokeKeyPending(false)
    }
  }

  // ── Revoke service connection ──
  const handleRevokeService = async () => {
    if (!revokeServiceId) return
    setRevokeServicePending(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/service-connections/${revokeServiceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      toast.success(`${revokeServiceName} connection revoked.`)
      setRevokeServiceId(null)
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to revoke connection.')
    } finally {
      setRevokeServicePending(false)
    }
  }

  // ── Delete tenant ──
  const handleDelete = async () => {
    setDeletePending(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to delete tenant')
      toast.success(`Tenant '${tenant.name}' has been permanently deleted.`)
      setDeleteStep(0)
      router.push('/admin/tenants')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete tenant.')
      setDeletePending(false)
    }
  }

  const canSuspend = ['pending', 'configured', 'active'].includes(tenant.status)
  const canUnsuspend = tenant.status === 'suspended'

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <a href="/admin/tenants" className="font-body text-[13px] text-foreground inline-flex gap-1 items-center mb-4 underline underline-offset-2">
        ← Tenants
      </a>

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 py-5 px-6 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="font-headline text-2xl font-semibold text-foreground m-0">{tenant.name}</h1>
              <PlanBadge plan={tenant.plan} />
              <StatusBadge status={tenant.status} />
            </div>
            <div className="font-body text-xs text-gray-400 flex items-center gap-1 mb-0.5">
              Tenant ID: {tenant.id} <CopyButton value={tenant.id} />
            </div>
            <div className="font-body text-[13px] text-gray-500">
              Owner: {tenant.ownerEmail}
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={() => setImpersonateOpen(true)}
              className="font-body text-[13px] font-medium text-foreground py-1.5 px-3.5 bg-white border border-primary cursor-pointer rounded-none"
            >
              Impersonate
            </button>
            {canSuspend && (
              <button
                onClick={() => setSuspendOpen(true)}
                className="font-body text-[13px] font-medium text-destructive py-1.5 px-3.5 bg-white border border-destructive cursor-pointer rounded-none"
              >
                Suspend
              </button>
            )}
            {canUnsuspend && (
              <button
                onClick={() => setUnsuspendOpen(true)}
                className="font-body text-[13px] font-medium text-foreground py-1.5 px-3.5 bg-white border border-gray-200 cursor-pointer rounded-none"
              >
                Unsuspend
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setOverridePlanOpen(v => !v)}
                className="font-body text-[13px] font-medium text-foreground py-1.5 px-3.5 bg-white border border-gray-200 cursor-pointer rounded-none"
              >
                Override Plan ▾
              </button>
              {overridePlanOpen && (
                <div className="absolute right-0 top-full bg-white border border-gray-200 z-50 min-w-[120px] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  {['free', 'starter', 'pro'].filter(p => p !== tenant.plan).map(p => (
                    <button key={p} onClick={() => { setOverridePlanTarget(p); setOverridePlanOpen(false); setTimeout(() => document.getElementById('confirm-plan-modal-trigger')?.click(), 10) }} className="font-body text-[13px] text-foreground block w-full text-left py-2.5 px-3.5 bg-transparent border-none cursor-pointer">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tenant Info ── */}
      <SectionCard title="Tenant Information">
        <InfoRow label="Tenant Name">{tenant.name}</InfoRow>
        <InfoRow label="Tenant ID"><span className="font-mono text-xs">{tenant.id}</span><CopyButton value={tenant.id} /></InfoRow>
        <InfoRow label="Owner User ID"><span className="font-mono text-xs">{tenant.owner_id}</span><CopyButton value={tenant.owner_id} /></InfoRow>
        <InfoRow label="Owner Email">{tenant.ownerEmail}</InfoRow>
        <InfoRow label="Plan"><PlanBadge plan={tenant.plan} /></InfoRow>
        <InfoRow label="Status"><StatusBadge status={tenant.status} /></InfoRow>
        <InfoRow label="Stripe Customer">
          {tenant.stripe_customer_id ? (
            <>
              <span className="font-mono text-xs">{tenant.stripe_customer_id}</span>
              <CopyButton value={tenant.stripe_customer_id} />
              <a href={`https://dashboard.stripe.com/customers/${tenant.stripe_customer_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground underline underline-offset-2">View in Stripe ↗</a>
            </>
          ) : '—'}
        </InfoRow>
        <InfoRow label="Created">{formatDate(tenant.created_at)}</InfoRow>
        <InfoRow label="Last Updated">{formatDate(tenant.updated_at)}</InfoRow>
      </SectionCard>

      {/* ── Discord Connections ── */}
      <SectionCard title={`Discord Connections (${tenant.discordConnections.length})`}>
        {tenant.discordConnections.length === 0 ? (
          <p className="font-body text-sm text-gray-500 text-center m-0">No Discord connections found for this tenant.<br />The tenant has not yet set up a bot connection.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Bot', 'Guild ID', 'Status', 'Last Heartbeat', 'Actions'].map(h => (
                  <th key={h} className="font-body text-[11px] font-medium text-left py-2 px-3 text-gray-700 uppercase border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenant.discordConnections.map(dc => (
                <>
                  <tr key={dc.id} className="border-b border-gray-100">
                    <td className="font-body text-[13px] font-medium text-foreground py-2.5 px-3">{dc.bot_username ?? '—'}</td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500">{dc.guild_id}</td>
                    <td className="py-2.5 px-3"><DiscordStatusBadge status={dc.status} /></td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500" title={dc.last_heartbeat ?? undefined}>{dc.last_heartbeat ? relativeDate(dc.last_heartbeat) : '—'}</td>
                    <td className="py-2.5 px-3 flex gap-1.5">
                      <SmBtn variant="secondary">Reset</SmBtn>
                      <SmBtn variant="danger-outline">Disconnect</SmBtn>
                    </td>
                  </tr>
                  {dc.status === 'error' && dc.error_message && (
                    <tr key={`${dc.id}-err`}>
                      <td colSpan={5} className="pt-1.5 px-3 pb-2.5">
                        <div className="font-body text-xs text-destructive bg-red-50 py-1.5 px-2.5">
                          Error: {dc.error_message}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* ── API Keys ── */}
      <SectionCard title="API Keys">
        {tenant.apiKeys.length === 0 ? (
          <p className="font-body text-sm text-gray-500 m-0">No API keys found. The tenant has not yet added any API keys.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Provider', 'Key (hint)', 'Status', 'Validated', 'Actions'].map(h => (
                  <th key={h} className="font-body text-[11px] font-medium text-left py-2 px-3 text-gray-700 uppercase border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenant.apiKeys.map(k => (
                <tr key={k.id} className="border-b border-gray-100">
                  <td className="font-body text-[13px] text-foreground py-2.5 px-3">{k.api_key_type === 'anthropic' ? 'Anthropic' : 'OpenAI'}</td>
                  <td className="font-mono text-xs py-2.5 px-3 text-gray-500">{k.key_hint}</td>
                  <td className="py-2.5 px-3"><ApiKeyStatusBadge status={k.status} /></td>
                  <td className="font-body text-xs py-2.5 px-3 text-gray-500">{k.validated_at ? formatDateShort(k.validated_at) : '—'}</td>
                  <td className="py-2.5 px-3">
                    {k.status !== 'revoked' && (
                      <SmBtn variant="danger-outline" onClick={() => { setRevokeKeyId(k.id); setRevokeKeyHint(k.key_hint); setRevokeKeyReason('') }}>Revoke</SmBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* ── Service Connections ── */}
      <SectionCard title={`Service Connections (${tenant.serviceConnections.length})`}>
        {tenant.serviceConnections.length === 0 ? (
          <p className="font-body text-sm text-gray-500 m-0">No service connections. The tenant has not connected any external services.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Service', 'Connected As', 'Status', 'Connected On', 'Actions'].map(h => (
                  <th key={h} className="font-body text-[11px] font-medium text-left py-2 px-3 text-gray-700 uppercase border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenant.serviceConnections.map(sc => {
                const meta = sc.metadata ?? {}
                const connectedAs = meta.display_name
                  ? `${meta.display_name}${meta.email ? ` (${meta.email})` : ''}`
                  : meta.email ?? (sc.service_name === 'toggl' ? '(API key)' : '—')
                const canRevoke = ['active', 'expired', 'error'].includes(sc.status)
                return (
                  <tr key={sc.id} className="border-b border-gray-100">
                    <td className="font-body text-[13px] text-foreground py-2.5 px-3 capitalize">{sc.service_name}</td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500">{connectedAs}</td>
                    <td className="py-2.5 px-3"><ServiceStatusBadge status={sc.status} /></td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500">{formatDateShort(sc.created_at)}</td>
                    <td className="py-2.5 px-3">
                      {canRevoke && (
                        <SmBtn variant="danger-outline" onClick={() => { setRevokeServiceId(sc.id); setRevokeServiceName(sc.service_name) }}>Revoke</SmBtn>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* ── Subscription ── */}
      <SectionCard title="Subscription">
        {!tenant.stripe_customer_id ? (
          <p className="font-body text-sm text-gray-500 m-0">Free tier — no Stripe subscription.<br />This tenant has never initiated a billing flow.</p>
        ) : tenant.subscription ? (
          <>
            <InfoRow label="Plan"><PlanBadge plan={tenant.subscription.plan} /></InfoRow>
            <InfoRow label="Stripe Status">{tenant.subscription.stripe_status ?? '—'}</InfoRow>
            <InfoRow label="Stripe Sub ID">
              {tenant.subscription.stripe_subscription_id ? (
                <>
                  <span className="font-mono text-xs">{tenant.subscription.stripe_subscription_id}</span>
                  <CopyButton value={tenant.subscription.stripe_subscription_id} />
                  <a href={`https://dashboard.stripe.com/subscriptions/${tenant.subscription.stripe_subscription_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground underline underline-offset-2">View in Stripe ↗</a>
                </>
              ) : '—'}
            </InfoRow>
            <InfoRow label="Current Period">
              {tenant.subscription.current_period_start && tenant.subscription.current_period_end
                ? `${formatDateShort(tenant.subscription.current_period_start)} → ${formatDateShort(tenant.subscription.current_period_end)}`
                : '—'}
            </InfoRow>
            <InfoRow label="Cancel at Period End">{tenant.subscription.cancel_at_period_end ? 'Yes' : 'No'}</InfoRow>
            <InfoRow label="Trial Ends">{tenant.subscription.trial_end ? formatDateShort(tenant.subscription.trial_end) : 'N/A'}</InfoRow>
            <InfoRow label="Created">{formatDateShort(tenant.subscription.created_at)}</InfoRow>
          </>
        ) : (
          <p className="font-body text-sm text-gray-500 m-0">No subscription record found.</p>
        )}
      </SectionCard>

      {/* ── Recent Admin Actions ── */}
      <SectionCard title="Recent Admin Actions">
        {tenant.auditLog.length === 0 ? (
          <p className="font-body text-sm text-gray-500 m-0">No admin actions have been taken on this tenant.</p>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {['Action', 'Admin', 'Date & Time', 'Metadata'].map(h => (
                    <th key={h} className="font-body text-[11px] font-medium text-left py-2 px-3 text-gray-700 uppercase border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenant.auditLog.map(entry => (
                  <tr key={entry.id} className="border-b border-gray-100">
                    <td className="font-body text-[13px] text-foreground py-2.5 px-3">{ACTION_LABELS[entry.action] ?? entry.action}</td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500">{entry.adminEmail}</td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500">{formatDate(entry.created_at)}</td>
                    <td className="font-body text-xs py-2.5 px-3 text-gray-500">{auditMetaSummary(entry.action, entry.metadata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <a href={`/admin/audit-log?tenant_id=${tenant.id}`} className="font-body text-[13px] text-foreground underline underline-offset-2">
                ← View all actions for this tenant in the audit log
              </a>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Danger Zone ── */}
      <div className="border border-red-300 mb-4">
        <div className="font-headline text-sm font-semibold text-destructive py-4 px-5 border-b border-red-300">
          ⚠ Danger Zone
        </div>
        <div className="p-5">
          <p className="font-body text-[13px] text-gray-500 mt-0">These actions are irreversible and may disrupt the tenant&apos;s service.</p>
          <div className="flex items-center justify-between p-4 border border-gray-100">
            <div>
              <div className="font-body text-sm font-medium text-foreground mb-1">Delete Tenant</div>
              <div className="font-body text-[13px] text-gray-500">Permanently delete this tenant, all their data, and cancel their Stripe subscription. This cannot be undone.</div>
            </div>
            <button onClick={() => setDeleteStep(1)} className="font-body text-[13px] font-medium py-2 px-4 bg-destructive border-none text-white cursor-pointer rounded-none ml-4 whitespace-nowrap">
              Delete Tenant
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Suspend */}
      <ConfirmDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        variant="danger"
        title={`Suspend "${tenant.name}"?`}
        description="The tenant's bot will be disconnected immediately. They will see an 'Account Suspended' message when they log in. You can unsuspend at any time."
        confirmLabel="Suspend"
        onConfirm={handleSuspend}
      />

      {/* Unsuspend */}
      <Modal open={unsuspendOpen} onClose={() => setUnsuspendOpen(false)} title={`Unsuspend "${tenant.name}"?`}>
        <p className="font-body text-sm text-gray-700">The tenant&apos;s account will be restored. Bot connections will need to reconnect.</p>
        <div className="flex justify-end gap-2 mt-4">
          <SmBtn variant="secondary" onClick={() => setUnsuspendOpen(false)}>Cancel</SmBtn>
          <SmBtn variant="secondary" onClick={handleUnsuspend} disabled={unsuspendPending}>{unsuspendPending ? 'Unsuspending…' : 'Unsuspend'}</SmBtn>
        </div>
      </Modal>

      {/* Override Plan Confirm */}
      <Modal open={!!overridePlanTarget && !overridePlanOpen} onClose={() => setOverridePlanTarget('')} title="Override Plan">
        <p className="font-body text-sm text-gray-700">
          Change plan from <strong>{tenant.plan}</strong> to <strong>{overridePlanTarget}</strong>?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <SmBtn variant="secondary" onClick={() => setOverridePlanTarget('')}>Cancel</SmBtn>
          <button onClick={handleOverridePlan} disabled={overridePlanPending} className={`font-body text-[13px] font-medium py-1.5 px-3.5 bg-foreground border-none text-white rounded-none ${overridePlanPending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
            {overridePlanPending ? 'Updating…' : 'Confirm Override'}
          </button>
        </div>
      </Modal>

      {/* Impersonate */}
      <Modal open={impersonateOpen} onClose={() => setImpersonateOpen(false)} title={`Impersonate "${tenant.name}"?`}>
        <p className="font-body text-sm text-gray-700">You will be redirected to the tenant dashboard as the owner of {tenant.name}.<br />Any changes you make will affect the tenant&apos;s real data.</p>
        <div className="font-body text-[13px] bg-yellow-50 border border-yellow-500 py-2.5 px-3 text-yellow-800 mb-4">
          ⚠ Impersonation is logged. This action will be recorded in the audit log.
        </div>
        <div className="flex justify-end gap-2">
          <SmBtn variant="secondary" onClick={() => setImpersonateOpen(false)}>Cancel</SmBtn>
          <button onClick={handleImpersonate} disabled={impersonatePending} className={`font-body text-[13px] font-medium py-1.5 px-3.5 bg-foreground border-none text-white rounded-none ${impersonatePending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
            {impersonatePending ? 'Starting…' : 'Start Impersonation'}
          </button>
        </div>
      </Modal>

      {/* Revoke API Key */}
      <Modal open={!!revokeKeyId} onClose={() => setRevokeKeyId(null)} title="Revoke API Key?">
        <p className="font-body text-sm text-gray-700">
          Revoke key <strong>{revokeKeyHint}</strong>? This will immediately disconnect the bot for this tenant. They will need to re-enter their key.
        </p>
        <label className="font-body text-[13px] text-gray-500 block mb-1">Reason (optional)</label>
        <input
          type="text"
          value={revokeKeyReason}
          onChange={e => setRevokeKeyReason(e.target.value)}
          maxLength={500}
          placeholder='e.g., suspected abuse, tenant request'
          className="font-body text-[13px] w-full p-2 border border-gray-200 box-border"
        />
        <div className="flex justify-end gap-2 mt-4">
          <SmBtn variant="secondary" onClick={() => setRevokeKeyId(null)}>Cancel</SmBtn>
          <button onClick={handleRevokeKey} disabled={revokeKeyPending} className={`font-body text-[13px] font-medium py-1.5 px-3.5 bg-destructive border-none text-white rounded-none ${revokeKeyPending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
            {revokeKeyPending ? 'Revoking…' : 'Revoke Key'}
          </button>
        </div>
      </Modal>

      {/* Revoke Service Connection */}
      <Modal open={!!revokeServiceId} onClose={() => setRevokeServiceId(null)} title={`Revoke ${revokeServiceName} connection?`}>
        <p className="font-body text-sm text-gray-700">The tenant will need to reconnect the service.</p>
        <div className="flex justify-end gap-2 mt-4">
          <SmBtn variant="secondary" onClick={() => setRevokeServiceId(null)}>Cancel</SmBtn>
          <button onClick={handleRevokeService} disabled={revokeServicePending} className={`font-body text-[13px] font-medium py-1.5 px-3.5 bg-destructive border-none text-white rounded-none ${revokeServicePending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
            {revokeServicePending ? 'Revoking…' : 'Revoke'}
          </button>
        </div>
      </Modal>

      {/* Delete Tenant — Step 1 */}
      <Modal open={deleteStep === 1} onClose={() => setDeleteStep(0)} title={`Delete "${tenant.name}"?`} preventBackdropClose>
        <p className="font-body text-sm text-gray-700 mb-2">This will permanently:</p>
        <ul className="font-body text-[13px] text-gray-700 pl-5 mb-4">
          <li>Delete the tenant account and all member associations</li>
          <li>Delete all Discord connections (tokens destroyed)</li>
          <li>Delete all API keys (from Vault)</li>
          <li>Delete all service connections (OAuth tokens revoked)</li>
          <li>Cancel their Stripe subscription (if any)</li>
          <li>Remove all data from the database</li>
        </ul>
        <div className="font-body text-[13px] font-semibold text-destructive bg-red-50 border border-red-300 py-2.5 px-3 mb-4">
          This action CANNOT be undone.
        </div>
        <div className="flex justify-end gap-2">
          <SmBtn variant="secondary" onClick={() => setDeleteStep(0)}>Cancel</SmBtn>
          <button onClick={() => setDeleteStep(2)} className="font-body text-[13px] font-medium py-1.5 px-3.5 bg-destructive border-none text-white cursor-pointer rounded-none">
            Proceed →
          </button>
        </div>
      </Modal>

      {/* Delete Tenant — Step 2 */}
      <Modal open={deleteStep === 2} onClose={() => setDeleteStep(0)} title="Confirm Deletion" preventBackdropClose>
        <p className="font-body text-sm text-gray-700 mb-1">Type the tenant name to confirm:</p>
        <p className="font-body text-[13px] text-gray-500 mb-2">Tenant name: <strong>{tenant.name}</strong></p>
        <input
          type="text"
          value={deleteNameInput}
          onChange={e => setDeleteNameInput(e.target.value)}
          placeholder={`Type "${tenant.name}" to confirm`}
          className="font-body text-[13px] w-full p-2 border border-gray-200 box-border mb-4"
        />
        <div className="flex justify-end gap-2">
          <SmBtn variant="secondary" onClick={() => setDeleteStep(1)}>← Back</SmBtn>
          <button
            onClick={handleDelete}
            disabled={deleteNameInput !== tenant.name || deletePending}
            className={`font-body text-[13px] font-medium py-1.5 px-3.5 bg-destructive border-none text-white rounded-none ${(deleteNameInput !== tenant.name || deletePending) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {deletePending ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string
  admin_user_id: string
  action: string
  tenant_id: string | null
  target_user_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AdminOption {
  id: string
  email: string
}

interface AuditLogClientProps {
  entries: AuditEntry[]
  tenantMap: Record<string, string>
  adminEmailMap: Record<string, string>
  adminOptions: AdminOption[]
  total: number
  page: number
  totalPages: number
  searchString: string
  filters: {
    tenantId: string
    action: string
    adminId: string
    from: string
    to: string
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  tenant_suspended: 'Tenant Suspended',
  tenant_unsuspended: 'Tenant Unsuspended',
  tenant_plan_override: 'Plan Override',
  impersonation_started: 'Impersonation Started',
  impersonation_ended: 'Impersonation Ended',
  tenant_impersonated: 'Impersonation Started',
  tenant_deleted_by_admin: 'Tenant Deleted (Admin)',
  api_key_revoked_by_admin: 'API Key Revoked',
  discord_connection_reset: 'Discord Connection Reset',
  service_connection_revoked_by_admin: 'Service Connection Revoked',
  subscription_override: 'Subscription Override',
  user_banned: 'User Banned',
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'tenant_suspended', label: 'Tenant Suspended' },
  { value: 'tenant_unsuspended', label: 'Tenant Unsuspended' },
  { value: 'tenant_plan_override', label: 'Plan Override' },
  { value: 'tenant_impersonated', label: 'Impersonation Started' },
  { value: 'impersonation_ended', label: 'Impersonation Ended' },
  { value: 'tenant_deleted_by_admin', label: 'Tenant Deleted (Admin)' },
  { value: 'api_key_revoked_by_admin', label: 'API Key Revoked' },
  { value: 'discord_connection_reset', label: 'Discord Connection Reset' },
  { value: 'service_connection_revoked_by_admin', label: 'Service Connection Revoked' },
  { value: 'subscription_override', label: 'Subscription Override' },
  { value: 'user_banned', label: 'User Banned' },
]

const ITEMS_PER_PAGE = 100

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} at ${hours}:${minutes} UTC`
}

function formatMetadataSummary(action: string, metadata: Record<string, unknown> | null): string {
  if (!metadata) return '—'
  switch (action) {
    case 'tenant_suspended':
    case 'tenant_unsuspended':
      return metadata.note ? `note: ${String(metadata.note).slice(0, 50)}` : '(no note)'
    case 'tenant_plan_override': {
      const prev = metadata.previous_plan ?? metadata.old_plan ?? '?'
      const next = metadata.new_plan ?? '?'
      return `${prev} → ${next}`
    }
    case 'impersonation_started':
    case 'tenant_impersonated': {
      const sessionId = String(
        metadata.impersonation_session_id ?? metadata.session_id ?? ''
      )
      return sessionId ? `session: ${sessionId.slice(0, 8)}...` : '—'
    }
    case 'impersonation_ended':
      return metadata.duration_seconds !== undefined
        ? `duration: ${metadata.duration_seconds}s`
        : '—'
    case 'api_key_revoked_by_admin': {
      const parts: string[] = []
      if (metadata.key_hint) parts.push(`key: ${metadata.key_hint}`)
      if (metadata.reason) parts.push(`reason: ${String(metadata.reason).slice(0, 30)}`)
      return parts.join(', ') || '—'
    }
    case 'discord_connection_reset':
      return metadata.guild_id
        ? `guild: ${metadata.guild_id}, ${metadata.previous_status} → ${metadata.new_status}`
        : '—'
    case 'subscription_override':
      return metadata.action_taken ? `action: ${metadata.action_taken}` : '—'
    case 'user_banned':
      return metadata.reason ? `reason: ${String(metadata.reason).slice(0, 50)}` : '—'
    case 'service_connection_revoked_by_admin':
      return metadata.service ? `service: ${metadata.service}` : '—'
    default:
      return JSON.stringify(metadata).slice(0, 60)
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  searchString,
}: {
  page: number
  totalPages: number
  total: number
  searchString: string
}) {
  const start = (page - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(page * ITEMS_PER_PAGE, total)

  function pageHref(p: number) {
    const params = new URLSearchParams(searchString)
    if (p === 1) params.delete('page')
    else params.set('page', String(p))
    const qs = params.toString()
    return `/admin/audit-log${qs ? '?' + qs : ''}`
  }

  const pages: (number | null)[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null)
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 py-4">
      <span className="text-sm text-muted-foreground">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()} entries
      </span>

      <PaginationRoot>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? pageHref(page - 1) : undefined}
              className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
              text="Previous"
            />
          </PaginationItem>

          {pages.map((p, idx) => (
            <PaginationItem key={p === null ? `ellipsis-${idx}` : p} className="hidden sm:block">
              {p === null ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink href={pageHref(p)} isActive={p === page}>
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={page < totalPages ? pageHref(page + 1) : undefined}
              className={page >= totalPages ? 'pointer-events-none opacity-40' : ''}
              text="Next"
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function AuditLogClient({
  entries,
  tenantMap,
  adminEmailMap,
  adminOptions,
  total,
  page,
  totalPages,
  searchString,
  filters,
}: AuditLogClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsHook = useSearchParams()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const hasActiveFilters = !!(
    filters.tenantId ||
    filters.action ||
    filters.adminId ||
    filters.from ||
    filters.to
  )

  function buildParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParamsHook.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete('page')
    return params.toString()
  }

  const handleTenantIdChange = useDebouncedCallback((value: string) => {
    const qs = buildParams({ tenant_id: value })
    router.push(`${pathname}${qs ? '?' + qs : ''}`)
  }, 400)

  const handleSelect = useCallback(
    (key: string, value: string) => {
      const qs = buildParams({ [key]: value })
      router.push(`${pathname}${qs ? '?' + qs : ''}`)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, pathname, searchParamsHook]
  )

  function handleReset() {
    router.push(pathname)
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectClass = 'text-gray-700 bg-white border border-gray-200 py-1.5 pr-8 pl-2.5 rounded-none appearance-none cursor-pointer bg-[length:12px_12px] bg-no-repeat bg-[position:right_8px_center]'
  const selectBgImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`

  const thClass = 'text-gray-700 uppercase tracking-wide py-2.5 px-4 text-left bg-gray-50 border-b border-gray-200 whitespace-nowrap'

  const tdClass = 'py-2.5 px-4 border-b border-gray-100 align-middle'

  return (
    <div>
      {/* ── Filters bar ──────────────────────────────────────────────────────── */}
      <div
        className="bg-white border border-gray-200 py-3 px-4 mb-0 border-b-0"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Tenant ID filter */}
          <input
            type="text"
            placeholder="Tenant ID (UUID)…"
            defaultValue={filters.tenantId}
            onChange={(e) => handleTenantIdChange(e.target.value)}
            className="font-body text-sm text-gray-700 bg-white border border-gray-200 py-1.5 px-2.5 rounded-none outline-none w-[260px]"
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
          />

          {/* Action filter */}
          <select
            value={filters.action}
            onChange={(e) => handleSelect('action', e.target.value)}
            className={`font-body text-sm ${selectClass}`} style={{ backgroundImage: selectBgImage }}
            aria-label="Filter by action"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Admin filter */}
          <select
            value={filters.adminId}
            onChange={(e) => handleSelect('admin_id', e.target.value)}
            className={`font-body text-sm ${selectClass}`} style={{ backgroundImage: selectBgImage }}
            aria-label="Filter by admin"
          >
            <option value="">All Admins</option>
            {adminOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.email}
              </option>
            ))}
          </select>

          {/* Date from */}
          <div className="flex items-center gap-2">
            <label
              className="font-body text-[13px] text-gray-500 whitespace-nowrap"
            >
              From
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleSelect('from', e.target.value)}
              className="font-body text-sm text-gray-700 bg-white border border-gray-200 py-1.5 px-2 rounded-none outline-none"
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-2">
            <label
              className="font-body text-[13px] text-gray-500 whitespace-nowrap"
            >
              To
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleSelect('to', e.target.value)}
              className="font-body text-sm text-gray-700 bg-white border border-gray-200 py-1.5 px-2 rounded-none outline-none"
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 transition-colors duration-150 font-body text-sm font-medium text-foreground bg-transparent border-none py-1.5 px-2 cursor-pointer rounded-none"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <X size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200">
        {entries.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No audit log entries"
            description={
              hasActiveFilters
                ? 'No actions match the selected filters. Try a different date range.'
                : 'Admin actions will appear here as they occur.'
            }
            action={hasActiveFilters ? { label: 'Clear filters', onClick: handleReset } : undefined}
            size="lg"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={`font-body text-xs font-medium ${thClass} w-[100px]`}>ID</th>
                  <th className={`font-body text-xs font-medium ${thClass} w-[18%]`}>Action</th>
                  <th className={`font-body text-xs font-medium ${thClass} w-[18%]`}>Tenant</th>
                  <th className={`font-body text-xs font-medium ${thClass} w-[18%]`}>Admin</th>
                  <th className={`font-body text-xs font-medium ${thClass} w-[20%]`}>Date &amp; Time</th>
                  <th className={`font-body text-xs font-medium ${thClass}`}>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isExpanded = expandedRows.has(entry.id)
                  const tenantName = entry.tenant_id
                    ? (tenantMap[entry.tenant_id] ?? null)
                    : null
                  const adminEmail =
                    adminEmailMap[entry.admin_user_id] ?? entry.admin_user_id.slice(0, 8) + '...'
                  const actionLabel = ACTION_LABELS[entry.action] ?? entry.action
                  const metaSummary = formatMetadataSummary(entry.action, entry.metadata)

                  return (
                    <>
                      <tr
                        key={entry.id}
                        onClick={() => toggleRow(entry.id)}
                        className={`cursor-pointer ${isExpanded ? 'bg-gray-50' : 'bg-white'}`}
                        onMouseEnter={(e) => {
                          if (!isExpanded)
                            (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded)
                            (e.currentTarget as HTMLTableRowElement).style.background = '#FFFFFF'
                        }}
                      >
                        {/* ID */}
                        <td className={tdClass}>
                          <div className="flex items-center gap-1">
                            {isExpanded ? (
                              <ChevronDown size={14} color="#9CA3AF" />
                            ) : (
                              <ChevronRight size={14} color="#9CA3AF" />
                            )}
                            <span
                              title={entry.id}
                              className="font-body text-xs font-medium text-gray-400 tabular-nums cursor-default"
                            >
                              {entry.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className={tdClass}>
                          <span
                            className="font-body text-[13px] font-medium text-foreground"
                          >
                            {actionLabel}
                          </span>
                        </td>

                        {/* Tenant */}
                        <td className={tdClass}>
                          {entry.tenant_id ? (
                            tenantName ? (
                              <Link
                                href={`/admin/tenants/${entry.tenant_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-body text-[13px] text-foreground no-underline border-b border-gray-200"
                              >
                                {tenantName}
                              </Link>
                            ) : (
                              <span
                                className="font-body text-xs text-gray-400 italic"
                              >
                                Deleted tenant ({entry.tenant_id.slice(0, 8)}...)
                              </span>
                            )
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Admin */}
                        <td className={tdClass}>
                          <span
                            className="font-body text-[13px] text-gray-700"
                          >
                            {adminEmail}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className={tdClass}>
                          <span
                            className="font-body text-[13px] text-gray-500 whitespace-nowrap"
                          >
                            {formatDateTime(entry.created_at)}
                          </span>
                        </td>

                        {/* Metadata summary */}
                        <td className={tdClass}>
                          <span
                            className="font-body text-[13px] text-gray-500"
                          >
                            {metaSummary}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded JSON row */}
                      {isExpanded && (
                        <tr key={`${entry.id}-expanded`} className="bg-gray-50">
                          <td
                            colSpan={6}
                            className="pt-0 px-4 pb-4 pl-12 border-b border-gray-200"
                          >
                            <pre
                              className="font-mono text-xs text-gray-700 bg-gray-100 border border-gray-200 py-3 px-4 overflow-x-auto m-0 leading-relaxed rounded-none"
                            >
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────────── */}
        {total > 0 && (
          <div className="px-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              searchString={searchString}
            />
          </div>
        )}
      </div>
    </div>
  )
}

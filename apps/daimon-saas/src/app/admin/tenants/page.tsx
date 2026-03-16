import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Users, Search } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { AdminLayout } from '@/components/layout/admin-layout'
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
import { FiltersBar } from './filters-bar'

export const metadata: Metadata = {
  title: 'Tenants — Admin',
  description: 'Daimon platform tenant management.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/admin/tenants' },
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantRow {
  id: string
  name: string
  plan: 'free' | 'starter' | 'pro'
  status: 'pending' | 'configured' | 'active' | 'suspended'
  created_at: string
  owner_id: string
  ownerEmail: string
  discord: { bot_username: string | null; guild_id: string; status: string } | null
}

const ITEMS_PER_PAGE = 50

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  created_desc: { column: 'created_at', ascending: false },
  created_asc: { column: 'created_at', ascending: true },
  name_asc: { column: 'name', ascending: true },
  name_desc: { column: 'name', ascending: false },
  plan_desc: { column: 'plan', ascending: false },
  heartbeat_desc: { column: 'updated_at', ascending: false },
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
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

// ─── Plan badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    free: { bg: '#F3F4F6', color: '#6B7280' },
    starter: { bg: 'rgba(180,231,221,0.3)', color: '#0C1F40' },
    pro: { bg: '#B4E7DD', color: '#0C1F40' },
  }
  const s = styles[plan] ?? styles.free
  return (
    <span
      className="font-body text-[11px] font-semibold" style={{textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '2px 8px',
        borderRadius: 0,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap'}}
    >
      {plan}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#FEF9C3', color: '#854D0E' },
    configured: { bg: '#DBEAFE', color: '#1E40AF' },
    active: { bg: 'rgba(180,231,221,0.4)', color: '#065F46' },
    suspended: { bg: '#FEE2E2', color: '#991B1B' },
  }
  const s = styles[status] ?? { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span
      className="font-body text-[11px] font-semibold" style={{textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '2px 8px',
        borderRadius: 0,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap'}}
    >
      {status}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  count,
  label,
  subLabel,
}: {
  count: number
  label: string
  subLabel: string
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        padding: '16px 20px',
      }}
    >
      <div
        className="font-headline text-[28px] font-semibold" style={{color: '#0C1F40',
          lineHeight: 1.2}}
      >
        {count.toLocaleString()}
      </div>
      <div
        className="font-body text-xs" style={{color: '#6B7280',
          marginTop: '2px'}}
      >
        {label}
      </div>
      <div
        className="font-body text-[11px]" style={{color: '#9CA3AF',
          marginTop: '1px'}}
      >
        {subLabel}
      </div>
    </div>
  )
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
    return `/admin/tenants${qs ? '?' + qs : ''}`
  }

  // Build page numbers to show: window of ±2 around current
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
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()} tenants
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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    q?: string
    plan?: string
    status?: string
    sort?: string
    page?: string
  }>
}

export default async function AdminTenantsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const planFilter = params.plan ?? ''
  const statusFilter = params.status ?? ''
  const sort = params.sort ?? 'created_desc'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  let totalCount = 0
  let activeCount = 0
  let payingCount = 0
  let suspendedCount = 0
  let tenants: TenantRow[] = []
  let total = 0

  try {
    const supabaseAdmin = createSupabaseAdminClient()

    // ── Stats (parallel) ──────────────────────────────────────────────────────
    const [totalResult, activeResult, payingResult, suspendedResult] = await Promise.all([
      supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .in('plan', ['starter', 'pro']),
      supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended'),
    ])

    totalCount = totalResult.count ?? 0
    activeCount = activeResult.count ?? 0
    payingCount = payingResult.count ?? 0
    suspendedCount = suspendedResult.count ?? 0

    // ── Tenant list query ─────────────────────────────────────────────────────
    const sortOpt = SORT_MAP[sort] ?? SORT_MAP.created_desc

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabaseAdmin
      .from('tenants')
      .select(
        `id, name, plan, status, created_at, owner_id,
         discord_connections(bot_username, guild_id, status)`,
        { count: 'exact' }
      )

    if (q) query = query.ilike('name', `%${q}%`)
    if (planFilter) query = query.eq('plan', planFilter)
    if (statusFilter) query = query.eq('status', statusFilter)

    query = query.order(sortOpt.column, { ascending: sortOpt.ascending })
    query = query.range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

    const { data: rawTenants, count: listCount } = await query

    // ── Owner email lookup ────────────────────────────────────────────────────
    const ownerIds: string[] = (rawTenants ?? []).map((t: { owner_id: string }) => t.owner_id)
    const emailMap: Record<string, string> = {}
    if (ownerIds.length > 0) {
      const results = await Promise.allSettled(
        ownerIds.map((id) => supabaseAdmin.auth.admin.getUserById(id))
      )
      results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value.data?.user) {
          emailMap[ownerIds[i]] = result.value.data.user.email ?? ''
        }
      })
    }

    // ── Build typed rows ──────────────────────────────────────────────────────
    tenants = (rawTenants ?? []).map(
      (t: {
        id: string
        name: string
        plan: string
        status: string
        created_at: string
        owner_id: string
        discord_connections: Array<{ bot_username: string | null; guild_id: string; status: string }>
      }) => ({
        id: t.id,
        name: t.name,
        plan: t.plan as TenantRow['plan'],
        status: t.status as TenantRow['status'],
        created_at: t.created_at,
        owner_id: t.owner_id,
        ownerEmail: emailMap[t.owner_id] ?? '',
        discord:
          t.discord_connections && t.discord_connections.length > 0
            ? t.discord_connections[0]
            : null,
      })
    )

    total = listCount ?? 0
  } catch {
    // Admin credentials not available — render with empty data
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  // Rebuild search params string for pagination links
  const searchParamsForLinks = new URLSearchParams()
  if (q) searchParamsForLinks.set('q', q)
  if (planFilter) searchParamsForLinks.set('plan', planFilter)
  if (statusFilter) searchParamsForLinks.set('status', statusFilter)
  if (sort && sort !== 'created_desc') searchParamsForLinks.set('sort', sort)
  const searchString = searchParamsForLinks.toString()

  // ── Table cell style helpers ──────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    padding: '10px 16px',
    textAlign: 'left',
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    whiteSpace: 'nowrap'}

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #F3F4F6',
    verticalAlign: 'middle',
  }

  return (
    <AdminLayout pageTitle="Tenants">
      <div style={{ maxWidth: '1200px' }}>
        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}
        >
          <StatCard count={totalCount} label="Total Tenants" subLabel="All time" />
          <StatCard count={activeCount} label="Active Bots" subLabel="Right now" />
          <StatCard count={payingCount} label="Starter + Pro" subLabel="Paying tenants" />
          <StatCard count={suspendedCount} label="Suspended" subLabel="Action needed" />
        </div>

        {/* ── Filters bar ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '0 16px',
          }}
        >
          <Suspense fallback={null}>
            <FiltersBar q={q} plan={planFilter} status={statusFilter} sort={sort} />
          </Suspense>

          {/* ── Tenant table ─────────────────────────────────────────────── */}
          {tenants.length === 0 ? (
            <div style={{ padding: '40px 0' }}>
              {total === 0 && !q && !planFilter && !statusFilter ? (
                <EmptyState
                  icon={<Users size={28} />}
                  title="No tenants yet"
                  description="Tenants will appear here once users sign up for Daimon."
                  size="lg"
                />
              ) : (
                <EmptyState
                  icon={<Search size={28} />}
                  title="No tenants found"
                  description={`No tenants match${q ? ` "${q}"` : ' these filters'}. Try a different name or email.`}
                  action={{ label: 'Clear search', href: '/admin/tenants' }}
                  size="lg"
                />
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th className="font-body text-xs font-medium" style={{ ...thStyle, width: '35%' }}>Tenant</th>
                    <th className="font-body text-xs font-medium" style={{ ...thStyle, width: '10%' }}>Plan</th>
                    <th className="font-body text-xs font-medium" style={{ ...thStyle, width: '12%' }}>Status</th>
                    <th className="font-body text-xs font-medium" style={{ ...thStyle, width: '18%' }}>Discord</th>
                    <th className="font-body text-xs font-medium" style={{ ...thStyle, width: '12%' }}>Created</th>
                    <th className="font-body text-xs font-medium" style={{ ...thStyle, width: '8%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      {/* Tenant name + email */}
                      <td style={tdStyle}>
                        <div
                          className="font-body text-sm font-medium" style={{color: '#0C1F40'}}
                        >
                          {tenant.name}
                        </div>
                        {tenant.ownerEmail && (
                          <div
                            className="font-body text-xs" style={{color: '#6B7280',
                              marginTop: '2px'}}
                          >
                            {tenant.ownerEmail}
                          </div>
                        )}
                      </td>

                      {/* Plan badge */}
                      <td style={tdStyle}>
                        <PlanBadge plan={tenant.plan} />
                      </td>

                      {/* Status badge */}
                      <td style={tdStyle}>
                        <StatusBadge status={tenant.status} />
                      </td>

                      {/* Discord */}
                      <td style={tdStyle}>
                        {tenant.discord ? (
                          <div>
                            {tenant.discord.bot_username && (
                              <div
                                className="font-body text-[13px]" style={{color: '#374151'}}
                              >
                                {tenant.discord.bot_username}
                              </div>
                            )}
                            <div
                              className="font-body text-[11px]" style={{color: '#9CA3AF',
                                marginTop: '1px'}}
                            >
                              {tenant.discord.guild_id}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm" style={{color: '#9CA3AF'}}>—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td style={tdStyle}>
                        <span
                          title={new Date(tenant.created_at).toISOString()}
                          className="font-body text-[13px]" style={{color: '#6B7280',
                            cursor: 'default'}}
                        >
                          {relativeDate(tenant.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="font-inter text-[13px] font-medium text-foreground border border-gray-200 px-3 py-1 no-underline inline-block bg-white hover:bg-gray-50 whitespace-nowrap transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────────── */}
          {total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              searchString={searchString}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

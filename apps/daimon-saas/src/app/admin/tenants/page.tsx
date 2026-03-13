import { Suspense } from 'react'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { AdminLayout } from '@/components/layout/admin-layout'
import { FiltersBar } from './filters-bar'

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
      style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '2px 8px',
        borderRadius: 0,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
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
      style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '2px 8px',
        borderRadius: 0,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
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
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '28px',
          fontWeight: 600,
          color: '#0C1F40',
          lineHeight: 1.2,
        }}
      >
        {count.toLocaleString()}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '12px',
          color: '#6B7280',
          marginTop: '2px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '11px',
          color: '#9CA3AF',
          marginTop: '1px',
        }}
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
      pages.push(null) // ellipsis
    }
  }

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-inter)',
    fontSize: '14px',
    padding: '4px 10px',
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
    color: '#6B7280',
    cursor: 'pointer',
    borderRadius: 0,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  }

  return (
    <div
      className="flex items-center justify-between flex-wrap gap-3"
      style={{ padding: '16px 0', marginTop: '0' }}
    >
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7280' }}>
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()} tenants
      </span>

      <div className="flex items-center gap-1">
        {/* Previous */}
        {page > 1 ? (
          <Link href={pageHref(page - 1)} style={btnBase}>
            ← Previous
          </Link>
        ) : (
          <span style={{ ...btnBase, opacity: 0.4, cursor: 'not-allowed' }}>← Previous</span>
        )}

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === null ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ ...btnBase, border: 'none', cursor: 'default' }}
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageHref(p)}
              style={{
                ...btnBase,
                background: p === page ? '#0C1F40' : '#FFFFFF',
                color: p === page ? '#FFFFFF' : '#6B7280',
                borderColor: p === page ? '#0C1F40' : '#E5E7EB',
              }}
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {page < totalPages ? (
          <Link href={pageHref(page + 1)} style={btnBase}>
            Next →
          </Link>
        ) : (
          <span style={{ ...btnBase, opacity: 0.4, cursor: 'not-allowed' }}>Next →</span>
        )}
      </div>
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

  const totalCount = totalResult.count ?? 0
  const activeCount = activeResult.count ?? 0
  const payingCount = payingResult.count ?? 0
  const suspendedCount = suspendedResult.count ?? 0

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
    // Batch lookup using admin auth API
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
  const tenants: TenantRow[] = (rawTenants ?? []).map(
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

  const total = listCount ?? 0
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
    fontFamily: 'var(--font-inter)',
    fontSize: '12px',
    fontWeight: 500,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    padding: '10px 16px',
    textAlign: 'left',
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    whiteSpace: 'nowrap',
  }

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
            <div
              style={{
                padding: '60px 0',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  color: '#6B7280',
                  marginBottom: '4px',
                }}
              >
                No tenants match these filters.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  color: '#9CA3AF',
                  marginBottom: '16px',
                }}
              >
                Try adjusting your search or clearing the filters.
              </p>
              <Link
                href="/admin/tenants"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0C1F40',
                  border: '1px solid #E5E7EB',
                  padding: '6px 16px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '35%' }}>Tenant</th>
                    <th style={{ ...thStyle, width: '10%' }}>Plan</th>
                    <th style={{ ...thStyle, width: '12%' }}>Status</th>
                    <th style={{ ...thStyle, width: '18%' }}>Discord</th>
                    <th style={{ ...thStyle, width: '12%' }}>Created</th>
                    <th style={{ ...thStyle, width: '8%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      style={{ background: '#FFFFFF' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = '#FFFFFF')
                      }
                    >
                      {/* Tenant name + email */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontFamily: 'var(--font-inter)',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#0C1F40',
                          }}
                        >
                          {tenant.name}
                        </div>
                        {tenant.ownerEmail && (
                          <div
                            style={{
                              fontFamily: 'var(--font-inter)',
                              fontSize: '12px',
                              color: '#6B7280',
                              marginTop: '2px',
                            }}
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
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  fontSize: '13px',
                                  color: '#374151',
                                }}
                              >
                                {tenant.discord.bot_username}
                              </div>
                            )}
                            <div
                              style={{
                                fontFamily: 'var(--font-inter)',
                                fontSize: '11px',
                                color: '#9CA3AF',
                                marginTop: '1px',
                              }}
                            >
                              {tenant.discord.guild_id}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td style={tdStyle}>
                        <span
                          title={new Date(tenant.created_at).toISOString()}
                          style={{
                            fontFamily: 'var(--font-inter)',
                            fontSize: '13px',
                            color: '#6B7280',
                            cursor: 'default',
                          }}
                        >
                          {relativeDate(tenant.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          style={{
                            fontFamily: 'var(--font-inter)',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#0C1F40',
                            border: '1px solid #E5E7EB',
                            padding: '4px 12px',
                            textDecoration: 'none',
                            display: 'inline-block',
                            background: '#FFFFFF',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLAnchorElement).style.background = '#F9FAFB')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLAnchorElement).style.background = '#FFFFFF')
                          }
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

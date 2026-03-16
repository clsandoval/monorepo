import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { AdminLayout } from '@/components/layout/admin-layout'
import { AuditLogClient, type AuditEntry } from './audit-log-client'

export const metadata: Metadata = {
  title: 'Audit Log — Admin',
  description: 'Daimon platform admin audit log.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/admin/audit-log' },
}

const ITEMS_PER_PAGE = 100

interface PageProps {
  searchParams: Promise<{
    tenant_id?: string
    action?: string
    admin_id?: string
    from?: string
    to?: string
    page?: string
  }>
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tenantId = params.tenant_id ?? ''
  const action = params.action ?? ''
  const adminId = params.admin_id ?? ''
  const from = params.from ?? ''
  const to = params.to ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  let adminOptions: { id: string; email: string }[] = []
  const adminEmailMap: Record<string, string> = {}
  let entries: AuditEntry[] = []
  const tenantMap: Record<string, string> = {}
  let total = 0

  try {
    const supabaseAdmin = createSupabaseAdminClient()

    // ── Distinct admins for dropdown ──────────────────────────────────────────
    const { data: distinctAdminRows } = await supabaseAdmin
      .from('admin_audit_log')
      .select('admin_user_id')
      .limit(500)

    const distinctAdminIds = [
      ...new Set((distinctAdminRows ?? []).map((r: { admin_user_id: string }) => r.admin_user_id)),
    ]

    await Promise.allSettled(
      distinctAdminIds.map(async (id) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(id)
        if (data?.user?.email) {
          adminEmailMap[id] = data.user.email
        }
      })
    )

    adminOptions = distinctAdminIds.map((id) => ({
      id,
      email: adminEmailMap[id] ?? `${id.slice(0, 8)}...`,
    }))

    // ── Main query ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabaseAdmin
      .from('admin_audit_log')
      .select(
        'id, admin_user_id, action, tenant_id, target_user_id, metadata, ip_address, created_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

    if (action) query = query.eq('action', action)
    if (tenantId) query = query.eq('tenant_id', tenantId)
    if (adminId) query = query.eq('admin_user_id', adminId)
    if (from) query = query.gte('created_at', from)
    if (to) {
      const toDatePlusOne = new Date(to)
      toDatePlusOne.setDate(toDatePlusOne.getDate() + 1)
      query = query.lt('created_at', toDatePlusOne.toISOString().split('T')[0])
    }

    const { data: rawEntries, count, error } = await query

    if (error) {
      // If the table doesn't exist yet (e.g. fresh deploy), show empty state
      // rather than an error. PostgREST returns PGRST205 for missing tables,
      // Postgres returns 42P01.
      const isTableMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('Could not find the table') ||
        error.message?.includes('schema cache')
      if (!isTableMissing) {
        return (
          <AdminLayout pageTitle="Audit Log">
            <div
              className="font-body text-sm bg-destructive/10 border border-destructive/30 py-4 px-5 text-destructive"
            >
              Failed to load audit log. Refresh the page.
            </div>
          </AdminLayout>
        )
      }
      // Table missing — fall through with empty data
    }

    entries = rawEntries ?? []

    // ── Tenant name lookup ────────────────────────────────────────────────────
    const tenantIds = [
      ...new Set(
        entries
          .filter((e: AuditEntry) => e.tenant_id)
          .map((e: AuditEntry) => e.tenant_id as string)
      ),
    ]
    if (tenantIds.length > 0) {
      const { data: tenants } = await supabaseAdmin
        .from('tenants')
        .select('id, name')
        .in('id', tenantIds)
      ;(tenants ?? []).forEach((t: { id: string; name: string }) => {
        tenantMap[t.id] = t.name
      })
    }

    total = count ?? 0
  } catch {
    // Admin credentials not available — render with empty data
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  const searchParamsForLinks = new URLSearchParams()
  if (tenantId) searchParamsForLinks.set('tenant_id', tenantId)
  if (action) searchParamsForLinks.set('action', action)
  if (adminId) searchParamsForLinks.set('admin_id', adminId)
  if (from) searchParamsForLinks.set('from', from)
  if (to) searchParamsForLinks.set('to', to)
  const searchString = searchParamsForLinks.toString()

  return (
    <AdminLayout pageTitle="Audit Log">
      <div className="max-w-[1200px]">
        <Suspense fallback={null}>
          <AuditLogClient
            entries={entries ?? []}
            tenantMap={tenantMap}
            adminEmailMap={adminEmailMap}
            adminOptions={adminOptions}
            total={total}
            page={page}
            totalPages={totalPages}
            searchString={searchString}
            filters={{ tenantId, action, adminId, from, to }}
          />
        </Suspense>
      </div>
    </AdminLayout>
  )
}

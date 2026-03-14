import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { AdminLayout } from '@/components/layout/admin-layout'
import { TenantDetailClient } from './tenant-detail-client'

export const metadata: Metadata = {
  title: 'Tenant Detail',
  description: 'Daimon platform tenant administration.',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminTenantDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()

  // ── Fetch tenant ──
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, plan, status, stripe_customer_id, owner_id, created_at, updated_at')
    .eq('id', id)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  // ── Fetch owner email via auth.users ──
  let ownerEmail = ''
  try {
    const { data: userResp } = await supabase.auth.admin.getUserById(tenant.owner_id)
    ownerEmail = userResp?.user?.email ?? ''
  } catch {
    // non-fatal
  }

  // ── Parallel fetches ──
  const [
    { data: discordConnections },
    { data: apiKeys },
    { data: serviceConnections },
    { data: subscription },
    { data: auditLog },
    { count: memberCount },
  ] = await Promise.all([
    supabase
      .from('discord_connections')
      .select('id, bot_username, guild_id, status, last_heartbeat, error_message')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tenant_api_keys')
      .select('id, key_type, key_hint, status, validated_at')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tenant_service_connections')
      .select('id, service, status, created_at, metadata')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tenant_subscriptions')
      .select('plan, status, stripe_subscription_id, current_period_start, current_period_end, cancel_at, trial_end, created_at')
      .eq('tenant_id', id)
      .maybeSingle(),
    supabase
      .from('admin_audit_log')
      .select('id, action, admin_user_id, created_at, metadata')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('tenant_members')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', id),
  ])

  // ── Fetch admin emails for audit log entries ──
  const adminIds = [...new Set((auditLog ?? []).map(e => e.admin_user_id).filter(Boolean))]
  const adminEmailMap: Record<string, string> = {}
  if (adminIds.length > 0) {
    await Promise.all(
      adminIds.map(async (adminId) => {
        try {
          const { data } = await supabase.auth.admin.getUserById(adminId)
          if (data?.user?.email) adminEmailMap[adminId] = data.user.email
        } catch {
          // non-fatal
        }
      })
    )
  }

  const tenantDetail = {
    id: tenant.id,
    name: tenant.name,
    plan: tenant.plan as 'free' | 'starter' | 'pro',
    status: tenant.status as 'pending' | 'configured' | 'active' | 'suspended',
    stripe_customer_id: tenant.stripe_customer_id ?? null,
    owner_id: tenant.owner_id,
    created_at: tenant.created_at,
    updated_at: tenant.updated_at,
    ownerEmail,
    memberCount: memberCount ?? 0,
    discordConnections: (discordConnections ?? []).map(dc => ({
      id: dc.id,
      bot_username: dc.bot_username ?? null,
      guild_id: dc.guild_id,
      status: dc.status,
      last_heartbeat: dc.last_heartbeat ?? null,
      error_message: (dc as Record<string, unknown>).error_message as string | null ?? null,
    })),
    apiKeys: (apiKeys ?? []).map(k => ({
      id: k.id,
      api_key_type: k.key_type,
      key_hint: k.key_hint,
      status: k.status,
      validated_at: k.validated_at ?? null,
    })),
    serviceConnections: (serviceConnections ?? []).map(sc => ({
      id: sc.id,
      service_name: sc.service,
      status: sc.status,
      created_at: sc.created_at,
      metadata: (sc.metadata as Record<string, string> | null) ?? null,
    })),
    subscription: subscription
      ? {
          plan: subscription.plan,
          stripe_status: subscription.status ?? null,
          stripe_subscription_id: subscription.stripe_subscription_id ?? null,
          current_period_start: subscription.current_period_start ?? null,
          current_period_end: subscription.current_period_end ?? null,
          cancel_at_period_end: subscription.cancel_at != null,
          trial_end: subscription.trial_end ?? null,
          created_at: subscription.created_at,
        }
      : null,
    auditLog: (auditLog ?? []).map(e => ({
      id: e.id,
      action: e.action,
      admin_user_id: e.admin_user_id,
      adminEmail: adminEmailMap[e.admin_user_id] ?? e.admin_user_id,
      created_at: e.created_at,
      metadata: (e.metadata as Record<string, unknown> | null) ?? null,
    })),
  }

  return (
    <AdminLayout pageTitle={`${tenant.name} — Tenant Detail`}>
      <TenantDetailClient tenant={tenantDetail} />
    </AdminLayout>
  )
}

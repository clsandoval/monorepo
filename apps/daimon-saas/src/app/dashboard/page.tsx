import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardErrorState } from '@/components/dashboard/dashboard-error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { DashboardStatusCards } from '@/components/dashboard/dashboard-status-cards'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'
import { QuickStatsRow } from '@/components/dashboard/quick-stats-row'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your Daimon bot, view status, and monitor tool activity.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/dashboard' },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  // Metrics: today window (UTC midnight)
  const startOfTodayUTC = new Date()
  startOfTodayUTC.setUTCHours(0, 0, 0, 0)

  // Parallel data fetch
  const [
    tenantResult,
    discordResult,
    apiKeysResult,
    serviceConnectionsResult,
    subscriptionResult,
    messagesTodayResult,
    toolUsesTodayResult,
  ] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, plan, status, created_at')
      .single(),

    supabase
      .from('discord_connections')
      .select(
        'id, guild_id, bot_user_id, bot_username, status, last_heartbeat, error_message, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('tenant_api_keys')
      .select('id, key_type, status, validated_at')
      .order('created_at', { ascending: true }),

    supabase
      .from('tenant_service_connections')
      .select('id, service, auth_type, status, connected_at, metadata')
      .eq('status', 'connected'),

    supabase
      .from('tenant_subscriptions')
      .select('plan, status, current_period_end')
      .maybeSingle(),

    supabase
      .from('tenant_messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfTodayUTC.toISOString()),

    supabase
      .from('tenant_tool_calls')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfTodayUTC.toISOString()),
  ])

  // Error state — any hard query failure
  if (
    tenantResult.error ||
    apiKeysResult.error ||
    serviceConnectionsResult.error
  ) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <DashboardErrorState />
      </DashboardLayout>
    )
  }

  const tenant = tenantResult.data

  // No tenant row yet — new user who hasn't finished signup or tenant creation failed
  if (!tenant) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <EmptyState
          icon={<Users size={28} />}
          title="No workspace found"
          description="We couldn't find a workspace for your account. Try signing out and back in, or contact support."
          action={{ label: 'Sign out', href: '/api/auth/signout' }}
          size="lg"
        />
      </DashboardLayout>
    )
  }

  const discord = discordResult.data ?? null
  const apiKeys = apiKeysResult.data ?? []
  const serviceConnections = serviceConnectionsResult.data ?? []
  const subscription = subscriptionResult.data ?? null
  const messagesToday = messagesTodayResult.count ?? 0
  const toolUsesToday = toolUsesTodayResult.count ?? 0

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      tenantName={tenant?.name ?? ''}
      plan={(tenant?.plan as 'free' | 'starter' | 'pro') ?? 'free'}
    >
      <div className="flex flex-col gap-6">
        {/* Onboarding checklist — shown while tenant is pending or configured */}
        {(tenant?.status === 'pending' || tenant?.status === 'configured') && (
          <OnboardingChecklist
            hasBotToken={!!discord}
            discordConnected={!!discord && discord.status !== 'pending'}
            hasAnthropicKey={apiKeys.some(
              (k: any) => k.key_type === 'anthropic' && k.status === 'active'
            )}
            botOnline={discord?.status === 'connected'}
          />
        )}

        {/* Status cards row */}
        <DashboardStatusCards
          discord={discord}
          plan={(tenant?.plan as 'free' | 'starter' | 'pro') ?? 'free'}
        />

        {/* Quick stats — messages today, tool uses today, uptime */}
        <QuickStatsRow
          messagesToday={messagesToday}
          toolUsesToday={toolUsesToday}
          connectedAt={discord?.created_at ?? null}
          botConnected={discord?.status === 'connected'}
        />

        {/* Dev aid — hidden data attributes for tests */}
        <pre
          className="hidden"
          aria-hidden="true"
          data-testid="dashboard-data"
          data-tenant-id={tenant?.id}
          data-tenant-plan={tenant?.plan}
          data-tenant-status={tenant?.status}
          data-discord-status={discord?.status ?? 'none'}
          data-api-keys-count={String(apiKeys.length)}
          data-service-connections-count={String(serviceConnections.length)}
          data-subscription-status={subscription?.status ?? 'none'}
        />
      </div>
    </DashboardLayout>
  )
}

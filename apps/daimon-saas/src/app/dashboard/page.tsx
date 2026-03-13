import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ErrorState } from '@/components/ui/error-state'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  // Parallel data fetch
  const [
    tenantResult,
    discordResult,
    apiKeysResult,
    serviceConnectionsResult,
    subscriptionResult,
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
      .select('id, provider, is_valid, last_validated_at')
      .order('created_at', { ascending: true }),

    supabase
      .from('tenant_service_connections')
      .select('id, service, auth_type, status, connected_at, account_display_name')
      .eq('status', 'connected'),

    supabase
      .from('tenant_subscriptions')
      .select('plan, status, current_period_end')
      .maybeSingle(),
  ])

  // Error state — any hard query failure
  if (
    tenantResult.error ||
    apiKeysResult.error ||
    serviceConnectionsResult.error
  ) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <ErrorState
          title="Failed to load dashboard"
          description="There was a problem loading your workspace data. Please try again."
          onRetry={undefined}
        />
      </DashboardLayout>
    )
  }

  const tenant = tenantResult.data
  const discord = discordResult.data ?? null
  const apiKeys = apiKeysResult.data ?? []
  const serviceConnections = serviceConnectionsResult.data ?? []
  const subscription = subscriptionResult.data ?? null

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      tenantName={tenant?.name ?? ''}
      plan={(tenant?.plan as 'free' | 'starter' | 'pro') ?? 'free'}
    >
      {/* Section placeholders — built out in subsequent stages */}
      <div className="flex flex-col gap-6">
        {/* Tenant info summary (dev aid — replaced by real sections next stages) */}
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

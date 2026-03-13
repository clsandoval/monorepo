import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ErrorState } from '@/components/ui/error-state'
import { SettingsContent } from '@/components/settings/workspace-section'
import type { DiscordConnection } from '@/components/integrations/discord-connection-card'

export const metadata = {
  title: 'Settings — Daimon',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard/settings')
  }

  // Get tenant membership
  const { data: membership, error: membershipError } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (membershipError || !membership) {
    return (
      <DashboardLayout pageTitle="Settings">
        <ErrorState
          title="Failed to load settings"
          description="Could not resolve your workspace. Please try again."
          onRetry={undefined}
        />
      </DashboardLayout>
    )
  }

  const tenantId = membership.tenant_id
  const userRole = membership.role as 'owner' | 'admin' | 'member'

  // Fetch tenant metadata + discord connections in parallel
  const [tenantResult, discordResult] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, plan, created_at')
      .eq('id', tenantId)
      .single(),
    supabase
      .from('discord_connections')
      .select('id, guild_id, bot_username, bot_user_id, status, last_heartbeat, error_message, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true }),
  ])

  const { data: tenant, error: tenantError } = tenantResult

  if (tenantError || !tenant) {
    return (
      <DashboardLayout pageTitle="Settings">
        <ErrorState
          title="Failed to load settings"
          description="There was a problem loading your workspace data. Please try again."
          onRetry={undefined}
        />
      </DashboardLayout>
    )
  }

  const discordConnections = (discordResult.data ?? []) as DiscordConnection[]

  return (
    <DashboardLayout
      pageTitle="Settings"
      tenantName={tenant.name}
      plan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'}
    >
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '28px',
            color: '#0C1F40',
            marginBottom: '8px',
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#6B7280',
            maxWidth: '640px',
            margin: 0,
          }}
        >
          Manage your workspace configuration and account preferences.
        </p>
      </div>

      {/* Settings tabs + content */}
      <SettingsContent
        tenant={{
          id: tenant.id,
          name: tenant.name,
          created_at: tenant.created_at ?? new Date().toISOString(),
        }}
        tenantId={tenantId}
        userRole={userRole}
        discordConnections={discordConnections}
      />
    </DashboardLayout>
  )
}

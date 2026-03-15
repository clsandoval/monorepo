import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import * as React from 'react'
import { createClient } from '@/lib/supabase/server'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ErrorState } from '@/components/ui/error-state'
import {
  ServiceGrid,
  OAuthCallbackBanner,
  type ServiceName,
  type TenantServiceConnection,
} from '@/components/integrations/service-grid'
import {
  DiscordSection,
  type DiscordConnection,
} from '@/components/integrations/discord-connection-card'

export const metadata: Metadata = {
  title: 'Integrations',
  description: 'Connect GitHub, Linear, Toggl, Google, and more to your Discord bot.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/dashboard/integrations' },
}

export default async function IntegrationsPage() {
  // When Supabase is not configured, render with empty data so the UI is still verifiable
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let tenantId = 'demo'
  let userRole: 'owner' | 'admin' | 'member' = 'owner'
  let discordConnections: DiscordConnection[] = []
  let connectionsByService: Partial<Record<ServiceName, TenantServiceConnection>> = {}
  let tenantName = ''
  let plan: 'free' | 'starter' | 'pro' = 'free'

  if (supabaseConfigured) {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login?next=/dashboard/integrations')
    }

    // Get tenant membership (RLS scopes all queries to the caller's tenant)
    const { data: membership, error: membershipError } = await supabase
      .from('tenant_members')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return (
        <DashboardLayout pageTitle="Integrations">
          <ErrorState
            title="Failed to load integrations"
            description="Could not resolve your workspace. Please try again."
            onRetry={undefined}
          />
        </DashboardLayout>
      )
    }

    tenantId = membership.tenant_id
    userRole = membership.role as 'owner' | 'admin' | 'member'

    // Fetch service connections and discord connections in parallel
    const [serviceConnectionsResult, discordConnectionsResult, tenantResult] =
      await Promise.all([
        supabase
          .from('tenant_service_connections')
          .select(
            'id, service, auth_type, status, scopes, metadata, connected_at, last_used_at, error_message'
          )
          .eq('tenant_id', membership.tenant_id)
          .neq('status', 'revoked'),
        supabase
          .from('discord_connections')
          .select('id, guild_id, status, bot_user_id, bot_username, error_message, created_at')
          .eq('tenant_id', membership.tenant_id)
          .neq('status', 'disconnected'),
        supabase
          .from('tenants')
          .select('name, plan')
          .eq('id', membership.tenant_id)
          .single(),
      ])

    if (serviceConnectionsResult.error) {
      return (
        <DashboardLayout pageTitle="Integrations">
          <ErrorState
            title="Failed to load integrations"
            description="There was a problem loading your service connections. Please try again."
            onRetry={undefined}
          />
        </DashboardLayout>
      )
    }

    // Index service connections by service name for O(1) card lookup
    connectionsByService = Object.fromEntries(
      (serviceConnectionsResult.data ?? []).map((c: any) => [
        c.service,
        c as TenantServiceConnection,
      ])
    ) as Partial<Record<ServiceName, TenantServiceConnection>>

    discordConnections = (discordConnectionsResult.data ?? []) as DiscordConnection[]
    tenantName = tenantResult.data?.name ?? ''
    plan = (tenantResult.data?.plan as 'free' | 'starter' | 'pro') ?? 'free'
  }

  return (
    <DashboardLayout
      pageTitle="Integrations"
      tenantName={tenantName}
      plan={plan}
    >
      {/* OAuth callback feedback banner */}
      <React.Suspense fallback={null}>
        <OAuthCallbackBanner />
      </React.Suspense>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-[28px] font-semibold text-foreground">
          Integrations
        </h1>
        <p className="max-w-[640px] text-sm text-muted-foreground">
          Connect your services so the bot can work with your tools. Connected
          services are available to all users in your Discord server.
        </p>
      </div>

      {/* Discord bot connections */}
      <div className="mb-10">
        <DiscordSection
          tenantId={tenantId}
          userRole={userRole}
          connections={discordConnections}
          plan={plan}
        />
      </div>

      {/* Section divider */}
      <div className="mb-8 border-t" />

      {/* Service connections header */}
      <div className="mb-4">
        <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
          Tool Sources
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Connect third-party services to enable bot tools for your Discord server.
        </p>
      </div>

      {/* Service grid */}
      <ServiceGrid
        tenantId={tenantId}
        userRole={userRole}
        connectionsByService={connectionsByService}
      />
    </DashboardLayout>
  )
}

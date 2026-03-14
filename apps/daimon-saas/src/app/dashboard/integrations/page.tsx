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
  const connectionsByService = Object.fromEntries(
    (serviceConnectionsResult.data ?? []).map((c) => [
      c.service,
      c as TenantServiceConnection,
    ])
  ) as Partial<Record<ServiceName, TenantServiceConnection>>

  const discordConnections = (discordConnectionsResult.data ?? []) as DiscordConnection[]
  const tenant = tenantResult.data

  return (
    <DashboardLayout
      pageTitle="Integrations"
      tenantName={tenant?.name ?? ''}
      plan={(tenant?.plan as 'free' | 'starter' | 'pro') ?? 'free'}
    >
      {/* OAuth callback feedback banner */}
      <React.Suspense fallback={null}>
        <OAuthCallbackBanner />
      </React.Suspense>

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
          Integrations
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#6B7280',
            maxWidth: '640px',
          }}
        >
          Connect your services so the bot can work with your tools. Connected
          services are available to all users in your Discord server.
        </p>
      </div>

      {/* Discord bot connections */}
      <div style={{ marginBottom: '40px' }}>
        <DiscordSection
          tenantId={membership.tenant_id}
          userRole={membership.role as 'owner' | 'admin' | 'member'}
          connections={discordConnections}
          plan={(tenant?.plan as 'free' | 'starter' | 'pro') ?? 'free'}
        />
      </div>

      {/* Section divider */}
      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          marginBottom: '32px',
        }}
      />

      {/* Service connections header */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C1F40',
            marginBottom: '4px',
          }}
        >
          Tool Sources
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '13px',
            color: '#6B7280',
          }}
        >
          Connect third-party services to enable bot tools for your Discord server.
        </p>
      </div>

      {/* Service grid */}
      <ServiceGrid
        tenantId={membership.tenant_id}
        userRole={membership.role as 'owner' | 'admin' | 'member'}
        connectionsByService={connectionsByService}
      />
    </DashboardLayout>
  )
}

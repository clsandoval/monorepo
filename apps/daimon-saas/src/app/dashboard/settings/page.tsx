import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ErrorState } from '@/components/ui/error-state'
import { SettingsContent } from '@/components/settings/workspace-section'

import type { DiscordConnection } from '@/components/integrations/discord-connection-card'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure your Daimon account and Discord connection settings.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/dashboard/settings' },
}

export default async function SettingsPage() {
  // When Supabase is not configured, render with demo data so the UI is still verifiable
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let tenantId = 'demo-tenant-id'
  let userRole: 'owner' | 'admin' | 'member' = 'owner'
  let tenant = { id: 'demo-tenant-id', name: "CL's Workspace", created_at: new Date().toISOString() }
  let discordConnections: DiscordConnection[] = []
  let memberCount = 1
  let tenantName = "CL's Workspace"
  let plan: 'free' | 'starter' | 'pro' = 'free'
  let userEmail = 'cl@sandoval.dev'
  let userDisplayName = 'CL Sandoval'

  if (supabaseConfigured) {
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

    tenantId = membership.tenant_id
    userRole = membership.role as 'owner' | 'admin' | 'member'

    // Fetch tenant metadata, discord connections, and member count in parallel
    const [tenantResult, discordResult, membersResult] = await Promise.all([
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
      supabase
        .from('tenant_members')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
    ])

    const { data: tenantData, error: tenantError } = tenantResult

    if (tenantError || !tenantData) {
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

    tenant = { id: tenantData.id, name: tenantData.name, created_at: tenantData.created_at ?? new Date().toISOString() }
    discordConnections = (discordResult.data ?? []) as DiscordConnection[]
    memberCount = membersResult.count ?? 1
    tenantName = tenantData.name
    plan = (tenantData.plan as 'free' | 'starter' | 'pro') ?? 'free'
    userEmail = user.email ?? ''
    userDisplayName = (user.user_metadata?.full_name as string) ?? ''
  }

  return (
    <DashboardLayout
      pageTitle="Settings"
      tenantName={tenantName}
      plan={plan}
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
        tenant={tenant}
        tenantId={tenantId}
        userRole={userRole}
        discordConnections={discordConnections}
        userEmail={userEmail}
        userDisplayName={userDisplayName}
        memberCount={memberCount}
      />
    </DashboardLayout>
  )
}

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ErrorState } from '@/components/ui/error-state'
import { CurrentPlanCard } from '@/components/billing/current-plan-card'
import { PlanComparisonGrid } from '@/components/billing/plan-comparison-grid'
import { CheckoutReturnBanner } from '@/components/billing/checkout-return-banner'
import { ApiKeySection } from '@/components/billing/api-key-section'
import { BillingAlertBanners } from '@/components/billing/billing-alert-banners'
import { SubscriptionLifecycleWatcher } from '@/components/billing/subscription-lifecycle-watcher'

export const metadata = {
  title: 'Billing & Keys — Daimon',
}

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard/billing')
  }

  // Get tenant membership
  const { data: membership, error: membershipError } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (membershipError || !membership) {
    return (
      <DashboardLayout pageTitle="Billing & Keys">
        <ErrorState
          title="Failed to load billing"
          description="Could not resolve your workspace. Please try again."
          onRetry={undefined}
        />
      </DashboardLayout>
    )
  }

  const tenantId = membership.tenant_id
  const userRole = membership.role as 'owner' | 'admin' | 'member'

  // Today's date range for usage stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayStartIso = todayStart.toISOString()

  // Parallel data fetch
  const [
    tenantResult,
    subscriptionResult,
    messagesTodayResult,
    toolUsesTodayResult,
    discordConnectionsResult,
    apiKeysResult,
  ] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, plan, status, stripe_customer_id')
      .eq('id', tenantId)
      .single(),
    supabase
      .from('tenant_subscriptions')
      .select(
        'stripe_subscription_id, status, current_period_start, current_period_end, cancel_at, trial_end'
      )
      .eq('tenant_id', tenantId)
      .maybeSingle(),
    supabase
      .from('tenant_messages')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', todayStartIso),
    supabase
      .from('tenant_tool_calls')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', todayStartIso),
    supabase
      .from('discord_connections')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .neq('status', 'disconnected'),
    supabase
      .from('tenant_api_keys')
      .select('id, key_type, key_hint, status, validated_at')
      .eq('tenant_id', tenantId)
      .neq('status', 'revoked'),
  ])

  if (tenantResult.error || !tenantResult.data) {
    return (
      <DashboardLayout pageTitle="Billing & Keys">
        <ErrorState
          title="Failed to load billing"
          description="There was a problem loading your plan data. Please try again."
          onRetry={undefined}
        />
      </DashboardLayout>
    )
  }

  const tenant = tenantResult.data
  const subscription = subscriptionResult.data ?? null
  const messagesToday = messagesTodayResult.count ?? 0
  const toolUsesToday = toolUsesTodayResult.count ?? 0
  const discordConnectionCount = discordConnectionsResult.count ?? 0
  const apiKeys = (apiKeysResult.data ?? []) as Array<{
    id: string
    key_type: 'anthropic' | 'openai'
    key_hint: string | null
    status: 'active' | 'invalid' | 'revoked'
    validated_at: string | null
  }>

  return (
    <DashboardLayout
      pageTitle="Billing & Keys"
      tenantName={tenant.name}
      plan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'}
    >
      {/* Checkout return toast handler */}
      <Suspense fallback={null}>
        <CheckoutReturnBanner plan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'} />
      </Suspense>

      {/* Realtime subscription lifecycle watcher (invisible, toasts + refresh on transitions) */}
      <SubscriptionLifecycleWatcher
        tenantId={tenantId}
        initialStatus={subscription?.status ?? null}
        initialCancelAt={subscription?.cancel_at ?? null}
        initialPlan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'}
      />

      {/* Subscription state banners (past_due, canceled, suspended) */}
      <BillingAlertBanners
        tenantStatus={
          (tenant.status as 'pending' | 'configured' | 'active' | 'suspended') ?? 'pending'
        }
        subscription={
          subscription
            ? {
                status: subscription.status ?? null,
                current_period_end: subscription.current_period_end ?? null,
              }
            : null
        }
        userRole={userRole}
        plan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'}
      />

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
          Billing &amp; Keys
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
          Manage your Daimon plan and the API keys used to power your bot.
        </p>
      </div>

      {/* Subscription section */}
      <section id="subscription">
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), Archivo, sans-serif',
              fontWeight: 600,
              fontSize: '20px',
              color: '#0C1F40',
            }}
          >
            Subscription
          </h2>
        </div>

        <CurrentPlanCard
          plan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'}
          tenantStatus={
            (tenant.status as 'pending' | 'configured' | 'active' | 'suspended') ?? 'pending'
          }
          subscription={
            subscription
              ? {
                  stripe_subscription_id: subscription.stripe_subscription_id ?? null,
                  status: subscription.status ?? null,
                  current_period_end: subscription.current_period_end ?? null,
                  cancel_at: subscription.cancel_at ?? null,
                  trial_end: subscription.trial_end ?? null,
                }
              : null
          }
          userRole={userRole}
          usageStats={{ messagesToday, toolUsesToday }}
        />

        <PlanComparisonGrid
          currentPlan={(tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'}
          userRole={userRole}
          subscription={
            subscription
              ? { current_period_end: subscription.current_period_end ?? null }
              : null
          }
          discordConnectionCount={discordConnectionCount}
        />
      </section>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '32px 0' }} />

      {/* API Keys section */}
      <section id="api-keys">
        <ApiKeySection apiKeys={apiKeys} userRole={userRole} />
      </section>
    </DashboardLayout>
  )
}

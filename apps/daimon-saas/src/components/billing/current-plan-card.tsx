'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface CurrentPlanData {
  plan: 'free' | 'starter' | 'pro'
  tenantStatus: 'pending' | 'configured' | 'active' | 'suspended'
  subscription: {
    stripe_subscription_id: string | null
    status: string | null
    current_period_end: string | null
    cancel_at: string | null
    trial_end: string | null
  } | null
  userRole: 'owner' | 'admin' | 'member'
  usageStats: {
    messagesToday: number
    toolUsesToday: number
  }
}

const PLAN_FEATURES: Record<'free' | 'starter' | 'pro', string[]> = {
  free: [
    '1 Discord connection',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Community support',
  ],
  starter: [
    'Up to 3 Discord connections',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Email support',
  ],
  pro: [
    'Unlimited Discord connections',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Priority support',
    'SLA: 99.9% bot uptime guarantee',
  ],
}

const PLAN_PRICES: Record<'free' | 'starter' | 'pro', string | null> = {
  free: null,
  starter: '$9 / month',
  pro: '$29 / month',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function BillingPeriodLine({
  subscription,
  plan,
  onPortalClick,
}: {
  subscription: CurrentPlanData['subscription']
  plan: 'free' | 'starter' | 'pro'
  onPortalClick: () => void
}) {
  if (plan === 'free') {
    return (
      <p className="text-sm text-muted-foreground">
        Free plan · No billing
      </p>
    )
  }

  const status = subscription?.status
  const periodEnd = subscription?.current_period_end
  const cancelAt = subscription?.cancel_at
  const trialEnd = subscription?.trial_end
  const cancelAtEnd = cancelAt && new Date(cancelAt) > new Date()

  if (status === 'trialing') {
    return (
      <p className="text-sm text-muted-foreground">
        Trial ends {formatDate(trialEnd ?? null)} ·{' '}
        <button
          onClick={onPortalClick}
          className="bg-transparent border-none cursor-pointer text-sm text-muted-foreground underline p-0"
        >
          Add Payment Method →
        </button>
      </p>
    )
  }

  if (status === 'past_due') {
    return (
      <p className="text-sm text-destructive">
        Payment failed ·{' '}
        <button
          onClick={onPortalClick}
          className="bg-transparent border-none cursor-pointer text-sm text-destructive underline p-0"
        >
          Update Payment Method →
        </button>
      </p>
    )
  }

  if (status === 'canceled') {
    return (
      <p className="text-sm text-destructive">
        Canceled · Access ends {formatDate(periodEnd ?? null)}
      </p>
    )
  }

  if (status === 'unpaid') {
    return (
      <p className="text-sm text-destructive">
        Unpaid · Bot access suspended
      </p>
    )
  }

  if (status === 'incomplete') {
    return (
      <p className="text-sm text-[#D97706]">
        Payment incomplete ·{' '}
        <button
          onClick={onPortalClick}
          className="bg-transparent border-none cursor-pointer text-sm text-[#D97706] underline p-0"
        >
          Complete Payment →
        </button>
      </p>
    )
  }

  if (cancelAtEnd) {
    return (
      <p className="text-sm text-[#D97706]">
        ⚠ Cancels on {formatDate(cancelAt ?? null)} ·{' '}
        <button
          onClick={onPortalClick}
          className="bg-transparent border-none cursor-pointer text-sm text-[#D97706] underline p-0"
        >
          Reactivate →
        </button>
      </p>
    )
  }

  // active, default
  return (
    <p className="text-sm text-muted-foreground">
      Renews {formatDate(periodEnd ?? null)}
    </p>
  )
}

export function CurrentPlanCard({
  plan,
  tenantStatus,
  subscription,
  userRole,
  usageStats,
}: CurrentPlanData) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const isOwner = userRole === 'owner'

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Portal failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
      // Error toast handled by parent, reset loading
    }
  }

  async function handleCheckout(checkoutPlan: 'starter' | 'pro') {
    setLoading(true)
    try {
      const res = await fetch(`/api/billing/checkout?plan=${checkoutPlan}&cycle=monthly`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  function getCtaButton() {
    if (!isOwner) return null

    const stripeStatus = subscription?.status
    const cancelAt = subscription?.cancel_at
    const cancelAtEnd = cancelAt && new Date(cancelAt) > new Date()

    let onClick: () => void
    let label: string

    if (plan === 'free') {
      onClick = () => handleCheckout('starter')
      label = 'Upgrade Plan →'
    } else if (stripeStatus === 'canceled' || cancelAtEnd) {
      onClick = () => handleCheckout(plan as 'starter' | 'pro')
      label = 'Reactivate →'
    } else if (stripeStatus === 'past_due' || stripeStatus === 'incomplete') {
      onClick = handlePortal
      label = 'Update Payment →'
    } else {
      onClick = handlePortal
      label = 'Manage Billing →'
    }

    return (
      <Button
        onClick={onClick}
        disabled={loading}
        variant="default"
        className="whitespace-nowrap"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {loading ? 'Opening...' : label}
      </Button>
    )
  }

  const planVariant = `plan-${plan}` as const
  const price = PLAN_PRICES[plan]
  const features = PLAN_FEATURES[plan]

  return (
    <Card className="p-6 mb-6 w-full">
      {/* CURRENT PLAN label */}
      <p className="font-medium text-xs tracking-[0.08em] uppercase text-muted-foreground mb-1">
        Current Plan
      </p>

      {/* Plan name row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading font-semibold text-2xl text-foreground capitalize m-0">
              {plan === 'free' ? 'Free' : plan === 'starter' ? 'Starter' : 'Pro'}
            </h2>
            <Badge variant={planVariant} />
          </div>
          {price && (
            <p className="text-sm text-muted-foreground mt-1">
              {price}
            </p>
          )}
        </div>
        <div>{getCtaButton()}</div>
      </div>

      {/* Feature list */}
      <ul className="list-none p-0 my-4 flex flex-col gap-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="inline-flex items-center gap-2 text-sm text-foreground"
          >
            <CheckCircle className="size-4 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Member note or billing period */}
      {!isOwner ? (
        <p className="text-sm text-muted-foreground">
          Only the workspace owner can manage billing.
        </p>
      ) : (
        <BillingPeriodLine
          subscription={subscription}
          plan={plan}
          onPortalClick={handlePortal}
        />
      )}

      {/* Usage stats */}
      {(usageStats.messagesToday > 0 || usageStats.toolUsesToday > 0) && (
        <div className="mt-4 pt-4 border-t border-border flex gap-6">
          <div>
            <p className="text-xs font-medium tracking-[0.06em] uppercase text-muted-foreground mb-0.5">
              Messages Today
            </p>
            <p className="font-heading text-xl font-semibold text-foreground">
              {usageStats.messagesToday}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.06em] uppercase text-muted-foreground mb-0.5">
              Tool Uses Today
            </p>
            <p className="font-heading text-xl font-semibold text-foreground">
              {usageStats.toolUsesToday}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

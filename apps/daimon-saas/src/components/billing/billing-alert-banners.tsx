'use client'

import * as React from 'react'
import { AlertBanner } from '@/components/ui/alert-banner'

interface BillingAlertBannersProps {
  tenantStatus: 'pending' | 'configured' | 'active' | 'suspended'
  subscription: {
    status: string | null
    current_period_end: string | null
  } | null
  userRole: 'owner' | 'admin' | 'member'
  plan: 'free' | 'starter' | 'pro'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BillingAlertBanners({
  tenantStatus,
  subscription,
  userRole,
  plan,
}: BillingAlertBannersProps) {
  const [portalLoading, setPortalLoading] = React.useState(false)
  const [checkoutLoading, setCheckoutLoading] = React.useState(false)
  const isOwner = userRole === 'owner'
  const stripeStatus = subscription?.status

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Portal failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  async function handleReactivate() {
    if (plan === 'free') return
    setCheckoutLoading(true)
    try {
      const res = await fetch(`/api/billing/checkout?plan=${plan}&cycle=monthly`, { method: 'POST' })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setCheckoutLoading(false)
    }
  }

  const banners: React.ReactNode[] = []

  // Suspended account — persistent, no dismiss
  if (tenantStatus === 'suspended') {
    banners.push(
      <AlertBanner
        key="suspended"
        variant="error"
        title="Your account is suspended. Your bot is offline."
        description="Contact support@daimon.ai to resolve billing issues and restore access."
        action={{
          label: 'Contact support@daimon.ai →',
          onClick: () => {
            window.location.href = 'mailto:support@daimon.ai'
          },
        }}
      />
    )
  }

  // Past due — persistent, owner sees portal link
  if (stripeStatus === 'past_due') {
    banners.push(
      <AlertBanner
        key="past_due"
        variant="warning"
        title="Your last payment failed."
        description="Update your payment method to keep your bot running."
        action={
          isOwner
            ? {
                label: portalLoading ? 'Opening...' : 'Update Payment Method →',
                onClick: handlePortal,
              }
            : undefined
        }
      />
    )
  }

  // Canceled — persistent, owner sees reactivate CTA
  if (stripeStatus === 'canceled') {
    banners.push(
      <AlertBanner
        key="canceled"
        variant="error"
        title="Your subscription has been canceled."
        description={`Your bot access ends on ${formatDate(subscription?.current_period_end ?? null)}.`}
        action={
          isOwner && plan !== 'free'
            ? {
                label: checkoutLoading ? 'Opening...' : 'Reactivate Subscription →',
                onClick: handleReactivate,
              }
            : undefined
        }
      />
    )
  }

  if (banners.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      {banners}
    </div>
  )
}

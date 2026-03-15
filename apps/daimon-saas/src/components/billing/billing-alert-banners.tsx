'use client'

import * as React from 'react'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

interface BannerConfig {
  key: string
  variant: 'error' | 'warning'
  icon: React.ElementType
  iconClass: string
  containerClass: string
  titleClass: string
  descClass: string
  title: string
  description: string
  actionLabel?: string
  actionLoading?: boolean
  onAction?: () => void
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

  const banners: BannerConfig[] = []

  // Suspended account — persistent, no dismiss
  if (tenantStatus === 'suspended') {
    banners.push({
      key: 'suspended',
      variant: 'error',
      icon: AlertCircle,
      iconClass: 'text-destructive',
      containerClass: 'border-l-[3px] border-destructive bg-red-50 rounded-none border-y-0 border-r-0',
      titleClass: 'text-red-950',
      descClass: 'text-red-950/75',
      title: 'Your account is suspended. Your bot is offline.',
      description: 'Contact support@daimon.ai to resolve billing issues and restore access.',
      actionLabel: 'Contact support@daimon.ai →',
      onAction: () => {
        window.location.href = 'mailto:support@daimon.ai'
      },
    })
  }

  // Past due — persistent, owner sees portal link
  if (stripeStatus === 'past_due') {
    banners.push({
      key: 'past_due',
      variant: 'warning',
      icon: AlertTriangle,
      iconClass: 'text-amber-600',
      containerClass: 'border-l-[3px] border-amber-600 bg-amber-50 rounded-none border-y-0 border-r-0',
      titleClass: 'text-amber-950',
      descClass: 'text-amber-950/75',
      title: 'Your last payment failed.',
      description: 'Update your payment method to keep your bot running.',
      ...(isOwner
        ? {
            actionLabel: portalLoading ? 'Opening...' : 'Update Payment Method →',
            onAction: handlePortal,
          }
        : {}),
    })
  }

  // Canceled — persistent, owner sees reactivate CTA
  if (stripeStatus === 'canceled') {
    banners.push({
      key: 'canceled',
      variant: 'error',
      icon: AlertCircle,
      iconClass: 'text-destructive',
      containerClass: 'border-l-[3px] border-destructive bg-red-50 rounded-none border-y-0 border-r-0',
      titleClass: 'text-red-950',
      descClass: 'text-red-950/75',
      title: 'Your subscription has been canceled.',
      description: `Your bot access ends on ${formatDate(subscription?.current_period_end ?? null)}.`,
      ...(isOwner && plan !== 'free'
        ? {
            actionLabel: checkoutLoading ? 'Opening...' : 'Reactivate Subscription →',
            onAction: handleReactivate,
          }
        : {}),
    })
  }

  if (banners.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mb-6">
      {banners.map((banner) => {
        const Icon = banner.icon
        return (
          <Alert
            key={banner.key}
            className={cn(
              banner.containerClass,
              'flex items-start gap-3 px-4 py-3.5 w-full shadow-none',
            )}
          >
            <span className={cn('shrink-0 mt-px flex items-center', banner.iconClass)}>
              <Icon className="size-4" />
            </span>

            <div className="flex-1 min-w-0">
              <AlertTitle className={cn('text-sm font-semibold leading-snug', banner.titleClass)}>
                {banner.title}
              </AlertTitle>
              <AlertDescription className={cn('text-[13px] mt-0.5 leading-snug', banner.descClass)}>
                {banner.description}
              </AlertDescription>
              {banner.actionLabel && banner.onAction && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={banner.onAction}
                  className={cn(
                    'h-auto p-0 mt-1.5 text-[13px] font-semibold underline hover:opacity-75',
                    banner.variant === 'error' ? 'text-destructive' : 'text-amber-600',
                  )}
                >
                  {banner.actionLabel}
                </Button>
              )}
            </div>
          </Alert>
        )
      })}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/toast'

interface SubscriptionLifecycleWatcherProps {
  tenantId: string
  initialStatus: string | null
  /** ISO timestamp — non-null means subscription is scheduled to cancel */
  initialCancelAt: string | null
  initialPlan: string | null
}

/**
 * Invisible client component that subscribes to tenant_subscriptions Realtime
 * updates and handles subscription lifecycle transitions:
 *   - trialing → active: trial converted to paid subscription
 *   - active/trialing → past_due: payment failed
 *   - active: cancel_at set (cancellation scheduled)
 *   - active: cancel_at cleared (subscription reactivated)
 *   - past_due → active: payment method updated, subscription recovered
 *   - plan → free (subscription deleted): downgraded to free
 *
 * On any transition, shows an appropriate toast and calls router.refresh()
 * to trigger a server-side re-render with fresh billing data.
 */
export function SubscriptionLifecycleWatcher({
  tenantId,
  initialStatus,
  initialCancelAt,
  initialPlan,
}: SubscriptionLifecycleWatcherProps) {
  const router = useRouter()
  const { toast } = useToast()

  const prevStatusRef = useRef<string | null>(initialStatus)
  const prevCancelAtRef = useRef<string | null>(initialCancelAt)
  const prevPlanRef = useRef<string | null>(initialPlan)

  useEffect(() => {
    if (!tenantId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`subscription-lifecycle-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenant_subscriptions',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newRow = payload.new as {
            tenant_id: string
            status: string | null
            plan: string | null
            cancel_at: string | null
            current_period_end: string | null
          }

          const oldStatus = prevStatusRef.current
          const newStatus = newRow.status
          const newCancelAt = newRow.cancel_at
          const oldCancelAt = prevCancelAtRef.current
          const newPlan = newRow.plan

          // trialing → active: trial converted to paid subscription
          if (oldStatus === 'trialing' && newStatus === 'active') {
            toast.success('Your trial is now active.', {
              description: 'Your subscription is live. You have full access to all features.',
            })
            router.refresh()
          }
          // active/trialing → past_due: payment failed
          else if (
            (oldStatus === 'active' || oldStatus === 'trialing') &&
            newStatus === 'past_due'
          ) {
            toast.warning('Payment failed.', {
              description:
                'Please update your payment method to keep your subscription active.',
            })
            router.refresh()
          }
          // past_due → active: payment recovered
          else if (oldStatus === 'past_due' && newStatus === 'active') {
            toast.success('Payment successful.', {
              description: 'Your subscription is now active.',
            })
            router.refresh()
          }
          // Cancellation scheduled: cancel_at changed from null to a date
          else if (!oldCancelAt && newCancelAt && newStatus === 'active') {
            toast.info('Cancellation scheduled.', {
              description:
                'Your subscription will end at the close of the current billing period.',
            })
            router.refresh()
          }
          // Reactivated: cancel_at cleared
          else if (oldCancelAt && !newCancelAt && newStatus === 'active') {
            toast.success('Subscription reactivated.', {
              description: 'Your cancellation has been reversed. Your subscription will continue.',
            })
            router.refresh()
          }
          // Downgraded to free (subscription deleted, webhook set plan='free')
          else if (
            (prevPlanRef.current === 'starter' || prevPlanRef.current === 'pro') &&
            newPlan === 'free'
          ) {
            toast.info('Subscription ended.', {
              description: 'Your subscription has ended. You are now on the Free plan.',
            })
            router.refresh()
          }
          // Any other status change — refresh silently to reflect new state
          else if (oldStatus !== newStatus) {
            router.refresh()
          }

          prevStatusRef.current = newStatus
          prevCancelAtRef.current = newCancelAt
          prevPlanRef.current = newPlan
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, router, toast])

  // Renders nothing — side-effect only
  return null
}

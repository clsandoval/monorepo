'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/lib/toast'

interface CheckoutReturnBannerProps {
  plan?: 'free' | 'starter' | 'pro'
}

export function CheckoutReturnBanner({ plan }: CheckoutReturnBannerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  React.useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const portalReturn = searchParams.get('portal_return')

    if (success === '1') {
      const planName = plan === 'starter' ? 'Starter' : plan === 'pro' ? 'Pro' : null
      toast.success('Your plan has been upgraded!', {
        description: planName
          ? `You now have access to all ${planName} features.`
          : 'Your new plan is now active.',
      })
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      router.replace(url.pathname + (url.search || ''))
    } else if (canceled === '1') {
      toast.info('Checkout canceled. Your plan was not changed.')
      const url = new URL(window.location.href)
      url.searchParams.delete('canceled')
      router.replace(url.pathname + (url.search || ''))
    } else if (portalReturn === '1') {
      toast.info('Welcome back to Daimon.')
      const url = new URL(window.location.href)
      url.searchParams.delete('portal_return')
      router.replace(url.pathname + (url.search || ''))
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

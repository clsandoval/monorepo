'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/lib/toast'

export function CheckoutReturnBanner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  React.useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === '1') {
      toast.success('Subscription updated', {
        description: "You're all set. Your new plan is now active.",
      })
      // Clean the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      router.replace(url.pathname + (url.search || ''))
    } else if (canceled === '1') {
      // No toast on cancel — user intentionally closed Checkout
      const url = new URL(window.location.href)
      url.searchParams.delete('canceled')
      router.replace(url.pathname + (url.search || ''))
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

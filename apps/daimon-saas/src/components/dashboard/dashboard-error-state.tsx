'use client'

import { ErrorState } from '@/components/ui/error-state'

export function DashboardErrorState() {
  return (
    <ErrorState
      title="Failed to load dashboard"
      description="There was a problem loading your workspace data. Please try again."
      onRetry={() => window.location.reload()}
    />
  )
}

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton-loader'

export default function BillingLoading() {
  return (
    <DashboardLayout pageTitle="Billing">
      <div
        aria-busy="true"
        aria-label="Loading billing"
        role="status"
      >
        {/* Page header skeleton */}
        <div style={{ marginBottom: '32px' }}>
          <Skeleton width="160px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="420px" height="16px" />
        </div>

        {/* Section 1: Current Plan card */}
        <Skeleton width="100%" height="120px" style={{ marginBottom: '24px' }} />

        {/* Section 2: Plan comparison table */}
        <Skeleton width="100%" height="280px" style={{ marginBottom: '24px' }} />

        {/* Section 3: API Keys card (Anthropic + OpenAI) */}
        <Skeleton width="100%" height="200px" style={{ marginBottom: '24px' }} />
      </div>
    </DashboardLayout>
  )
}

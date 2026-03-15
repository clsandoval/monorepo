import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function BillingLoading() {
  return (
    <DashboardLayout pageTitle="Billing">
      <div
        aria-busy="true"
        aria-label="Loading billing"
        role="status"
      >
        {/* Page header skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-7 w-40" />
          <Skeleton className="h-4 w-[420px]" />
        </div>

        {/* Section 1: Current Plan card */}
        <Skeleton className="mb-6 h-[120px] w-full" />

        {/* Section 2: Plan comparison table */}
        <Skeleton className="mb-6 h-[280px] w-full" />

        {/* Section 3: API Keys card (Anthropic + OpenAI) */}
        <Skeleton className="mb-6 h-[200px] w-full" />
      </div>
    </DashboardLayout>
  )
}

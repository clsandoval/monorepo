import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

function ServiceCardSkeleton() {
  return (
    <div className="flex h-[180px] flex-col border border-border bg-card">
      {/* Card header */}
      <div className="flex items-center gap-3 p-5">
        {/* Logo */}
        <Skeleton className="h-10 w-10 shrink-0" />
        {/* Name + description */}
        <div className="flex-1">
          <Skeleton className="mb-1.5 h-4 w-[100px]" />
          <Skeleton className="h-3 w-[220px]" />
        </div>
        {/* Badge */}
        <Skeleton className="ml-auto h-[22px] w-20 shrink-0" />
      </div>
      {/* Footer button */}
      <div className="mt-auto px-5 pb-5">
        <Skeleton className="h-9 w-[120px]" />
      </div>
    </div>
  )
}

export default function IntegrationsLoading() {
  return (
    <DashboardLayout pageTitle="Integrations">
      <div
        aria-busy="true"
        aria-label="Loading integrations"
        role="status"
      >
        {/* Page header skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-7 w-[180px]" />
          <Skeleton className="h-4 w-[480px]" />
        </div>

        {/* Service grid skeleton — 4 cards in 2×2 grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>
    </DashboardLayout>
  )
}

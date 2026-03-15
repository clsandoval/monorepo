import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Top row: 2-column card skeletons */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bot Status Card skeleton */}
          <div className="flex flex-col gap-4 border border-border bg-card p-7">
            <Skeleton className="h-3.5 w-[40%]" />
            <Skeleton className="h-8 w-[60%]" />
            <Skeleton className="h-3.5 w-[80%]" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* API Keys Card skeleton */}
          <div className="flex flex-col gap-4 border border-border bg-card p-7">
            <Skeleton className="h-3.5 w-[35%]" />
            <div className="flex flex-col gap-3 pt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Service integrations skeleton */}
        <div className="flex flex-col gap-4 border border-border bg-card p-7">
          <Skeleton className="h-3.5 w-[30%]" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
          </div>
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border border-border bg-card p-7"
            >
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-[40%]" />
            </div>
          ))}
        </div>

        {/* Activity feed skeleton */}
        <div className="flex flex-col gap-4 border border-border bg-card p-7">
          <Skeleton className="h-3.5 w-[30%]" />
          <div className="flex flex-col gap-3 pt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-[13px] w-[60%]" />
                  <Skeleton className="h-[11px] w-[30%]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

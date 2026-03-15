import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <DashboardLayout pageTitle="Settings">
      <div
        aria-busy="true"
        aria-label="Loading settings"
        role="status"
      >
        {/* Page header skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-7 w-[140px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>

        {/* Section 1: Workspace */}
        <Skeleton className="mb-4 h-[130px] w-full" />

        {/* Section 2: Discord Connection */}
        <Skeleton className="mb-4 h-[180px] w-full" />

        {/* Section 3: Team Members */}
        <Skeleton className="mb-4 h-[120px] w-full" />

        {/* Section 4: Account */}
        <Skeleton className="mb-4 h-[160px] w-full" />

        {/* Section 5: Danger Zone (owner only) */}
        <Skeleton className="h-[100px] w-full" />
      </div>
    </DashboardLayout>
  )
}

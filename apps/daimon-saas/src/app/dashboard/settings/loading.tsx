import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton-loader'

export default function SettingsLoading() {
  return (
    <DashboardLayout pageTitle="Settings">
      <div
        aria-busy="true"
        aria-label="Loading settings"
        role="status"
      >
        {/* Page header skeleton */}
        <div style={{ marginBottom: '32px' }}>
          <Skeleton width="140px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="400px" height="16px" />
        </div>

        {/* Section 1: Workspace */}
        <Skeleton width="100%" height="130px" style={{ marginBottom: '16px' }} />

        {/* Section 2: Discord Connection */}
        <Skeleton width="100%" height="180px" style={{ marginBottom: '16px' }} />

        {/* Section 3: Team Members */}
        <Skeleton width="100%" height="120px" style={{ marginBottom: '16px' }} />

        {/* Section 4: Account */}
        <Skeleton width="100%" height="160px" style={{ marginBottom: '16px' }} />

        {/* Section 5: Danger Zone (owner only) */}
        <Skeleton width="100%" height="100px" />
      </div>
    </DashboardLayout>
  )
}

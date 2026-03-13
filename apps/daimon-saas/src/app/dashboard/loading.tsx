import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton-loader'

export default function DashboardLoading() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Top row: 2-column card skeletons */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bot Status Card skeleton */}
          <div
            className="flex flex-col gap-4 p-7"
            style={{
              background: '#fff',
              border: '1.5px solid rgba(12,31,64,0.12)',
            }}
          >
            <Skeleton width="40%" height="14px" />
            <Skeleton width="60%" height="32px" />
            <Skeleton width="80%" height="14px" />
            <Skeleton width="50%" height="12px" />
          </div>

          {/* API Keys Card skeleton */}
          <div
            className="flex flex-col gap-4 p-7"
            style={{
              background: '#fff',
              border: '1.5px solid rgba(12,31,64,0.12)',
            }}
          >
            <Skeleton width="35%" height="14px" />
            <div className="flex flex-col gap-3 pt-2">
              <Skeleton width="100%" height="40px" />
              <Skeleton width="100%" height="40px" />
            </div>
          </div>
        </div>

        {/* Service integrations skeleton */}
        <div
          className="flex flex-col gap-4 p-7"
          style={{
            background: '#fff',
            border: '1.5px solid rgba(12,31,64,0.12)',
          }}
        >
          <Skeleton width="30%" height="14px" />
          <div className="flex gap-4">
            <Skeleton width="80px" height="80px" />
            <Skeleton width="80px" height="80px" />
            <Skeleton width="80px" height="80px" />
          </div>
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2 p-7"
              style={{
                background: '#fff',
                border: '1.5px solid rgba(12,31,64,0.12)',
              }}
            >
              <Skeleton width="50%" height="12px" />
              <Skeleton width="40%" height="28px" />
            </div>
          ))}
        </div>

        {/* Activity feed skeleton */}
        <div
          className="flex flex-col gap-4 p-7"
          style={{
            background: '#fff',
            border: '1.5px solid rgba(12,31,64,0.12)',
          }}
        >
          <Skeleton width="30%" height="14px" />
          <div className="flex flex-col gap-3 pt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width="32px" height="32px" style={{ borderRadius: '50%' }} />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton width="60%" height="13px" />
                  <Skeleton width="30%" height="11px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

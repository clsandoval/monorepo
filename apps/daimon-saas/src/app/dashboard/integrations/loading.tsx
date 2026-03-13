import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton-loader'

function ServiceCardSkeleton() {
  return (
    <div
      style={{
        height: '180px',
        border: '1.5px solid rgba(12,31,64,0.1)',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Logo */}
        <Skeleton width="40px" height="40px" style={{ flexShrink: 0 }} />
        {/* Name + description */}
        <div style={{ flex: 1 }}>
          <Skeleton width="100px" height="16px" style={{ marginBottom: '6px' }} />
          <Skeleton width="220px" height="12px" />
        </div>
        {/* Badge */}
        <Skeleton width="80px" height="22px" style={{ marginLeft: 'auto', flexShrink: 0 }} />
      </div>
      {/* Footer button */}
      <div style={{ padding: '0 20px 20px', marginTop: 'auto' }}>
        <Skeleton width="120px" height="36px" />
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
        <div style={{ marginBottom: '32px' }}>
          <Skeleton width="180px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="480px" height="16px" />
        </div>

        {/* Service grid skeleton — 4 cards in 2×2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
          className="integrations-skeleton-grid"
        >
          <style>{`
            @media (max-width: 767px) {
              .integrations-skeleton-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>
    </DashboardLayout>
  )
}

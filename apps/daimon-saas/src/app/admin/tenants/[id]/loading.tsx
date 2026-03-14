import { AdminLayout } from '@/components/layout/admin-layout'

export default function AdminTenantDetailLoading() {
  return (
    <AdminLayout pageTitle="Tenant Details">
      <div
        aria-busy="true"
        aria-label="Loading tenant details"
        role="status"
      >
        {/* Back link + page header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ width: '260px', height: '28px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '180px', height: '16px' }} />
        </div>

        {/* Overview card */}
        <div className="skeleton" style={{ width: '100%', height: '160px', marginBottom: '16px' }} />

        {/* Discord connection card */}
        <div className="skeleton" style={{ width: '100%', height: '120px', marginBottom: '16px' }} />

        {/* Subscription card */}
        <div className="skeleton" style={{ width: '100%', height: '120px', marginBottom: '16px' }} />

        {/* Admin actions card */}
        <div className="skeleton" style={{ width: '100%', height: '140px', marginBottom: '16px' }} />
      </div>
    </AdminLayout>
  )
}

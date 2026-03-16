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
        <div className="mb-6">
          <div className="skeleton mb-4" style={{ width: '120px', height: '16px' }} />
          <div className="skeleton mb-2" style={{ width: '260px', height: '28px' }} />
          <div className="skeleton" style={{ width: '180px', height: '16px' }} />
        </div>

        {/* Overview card */}
        <div className="skeleton mb-4 w-full" style={{ height: '160px' }} />

        {/* Discord connection card */}
        <div className="skeleton mb-4 w-full" style={{ height: '120px' }} />

        {/* Subscription card */}
        <div className="skeleton mb-4 w-full" style={{ height: '120px' }} />

        {/* Admin actions card */}
        <div className="skeleton mb-4 w-full" style={{ height: '140px' }} />
      </div>
    </AdminLayout>
  )
}

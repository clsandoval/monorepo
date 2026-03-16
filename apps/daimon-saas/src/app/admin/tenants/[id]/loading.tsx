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
          <div className="skeleton mb-4 w-[120px] h-4" />
          <div className="skeleton mb-2 w-[260px] h-7" />
          <div className="skeleton w-[180px] h-4" />
        </div>

        {/* Overview card */}
        <div className="skeleton mb-4 w-full h-[160px]" />

        {/* Discord connection card */}
        <div className="skeleton mb-4 w-full h-[120px]" />

        {/* Subscription card */}
        <div className="skeleton mb-4 w-full h-[120px]" />

        {/* Admin actions card */}
        <div className="skeleton mb-4 w-full h-[140px]" />
      </div>
    </AdminLayout>
  )
}

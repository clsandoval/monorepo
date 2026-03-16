import { AdminLayout } from '@/components/layout/admin-layout'

function SkeletonRow() {
  return (
    <tr>
      {[180, 50, 60, 100, 100, 80].map((w, i) => (
        <td
          key={i}
          className="py-3 px-4 border-b border-gray-100 align-middle"
        >
          <div
            className="skeleton"
            style={{ height: i === 1 || i === 2 ? '22px' : i === 5 ? '30px' : '16px', width: `${w}px`, maxWidth: '100%' }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function AdminTenantsLoading() {
  return (
    <AdminLayout pageTitle="Tenants">
      <div
        aria-busy="true"
        aria-label="Loading tenant list"
        role="status"
      >
        {/* Page header */}
        <div className="mb-6">
          <div className="skeleton mb-2" style={{ width: '160px', height: '28px' }} />
          <div className="skeleton" style={{ width: '280px', height: '16px' }} />
        </div>

        {/* Stats bar (3 stat chips) */}
        <div className="flex gap-4 mb-6">
          <div className="skeleton" style={{ width: '120px', height: '60px' }} />
          <div className="skeleton" style={{ width: '120px', height: '60px' }} />
          <div className="skeleton" style={{ width: '120px', height: '60px' }} />
        </div>

        {/* Search bar skeleton */}
        <div className="skeleton mb-4" style={{ width: '320px', height: '38px' }} />

        {/* Table skeleton */}
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Workspace', 'Status', 'Plan', 'Created', 'Last Active', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="font-body text-xs font-medium text-gray-700 uppercase tracking-wide py-2.5 px-4 text-left bg-gray-50 border-b border-gray-200 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

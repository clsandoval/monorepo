import { AdminLayout } from '@/components/layout/admin-layout'

function SkeletonRow() {
  return (
    <tr>
      {[180, 50, 60, 100, 100, 80].map((w, i) => (
        <td
          key={i}
          className="py-3 px-4 border-b border-border align-middle"
        >
          <div
            className={`skeleton max-w-full ${i === 1 || i === 2 ? 'h-[22px]' : i === 5 ? 'h-[30px]' : 'h-4'}`}
            style={{ width: `${w}px` }}
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
          <div className="skeleton mb-2 w-[160px] h-7" />
          <div className="skeleton w-[280px] h-4" />
        </div>

        {/* Stats bar (3 stat chips) */}
        <div className="flex gap-4 mb-6">
          <div className="skeleton w-[120px] h-[60px]" />
          <div className="skeleton w-[120px] h-[60px]" />
          <div className="skeleton w-[120px] h-[60px]" />
        </div>

        {/* Search bar skeleton */}
        <div className="skeleton mb-4 w-[320px] h-[38px]" />

        {/* Table skeleton */}
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Workspace', 'Status', 'Plan', 'Created', 'Last Active', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide py-2.5 px-4 text-left bg-muted border-b border-border whitespace-nowrap"
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

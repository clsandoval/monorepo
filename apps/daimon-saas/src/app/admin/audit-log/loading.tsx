import { AdminLayout } from '@/components/layout/admin-layout'

function SkeletonRow() {
  return (
    <tr>
      {[100, 140, 120, 140, 160, 200].map((w, i) => (
        <td
          key={i}
          className="py-3.5 px-4 border-b border-border align-middle"
        >
          <div
            className="skeleton h-3.5 max-w-full rounded-none"
            style={{ width: `${w}px` }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function AuditLogLoading() {
  return (
    <AdminLayout pageTitle="Audit Log">
      <div className="max-w-[1200px]">
        {/* Filters skeleton */}
        <div className="bg-card border border-border border-b-0 py-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            {[260, 140, 160, 120, 120].map((w, i) => (
              <div
                key={i}
                className="skeleton h-[34px] rounded-none"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID', 'Action', 'Tenant', 'Admin', 'Date & Time', 'Metadata'].map((col) => (
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

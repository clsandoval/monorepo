import { AdminLayout } from '@/components/layout/admin-layout'

function SkeletonRow() {
  return (
    <tr>
      {[100, 140, 120, 140, 160, 200].map((w, i) => (
        <td
          key={i}
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #F3F4F6',
            verticalAlign: 'middle',
          }}
        >
          <div
            className="skeleton"
            style={{ height: '14px', width: `${w}px`, maxWidth: '100%', borderRadius: 0 }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function AuditLogLoading() {
  return (
    <AdminLayout pageTitle="Audit Log">
      <div style={{ maxWidth: '1200px' }}>
        {/* Filters skeleton */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderBottom: 'none',
            padding: '12px 16px',
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {[260, 140, 160, 120, 120].map((w, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: '34px', width: `${w}px`, borderRadius: 0 }}
              />
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ID', 'Action', 'Tenant', 'Admin', 'Date & Time', 'Metadata'].map((col) => (
                  <th
                    key={col}
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: '#F9FAFB',
                      borderBottom: '1px solid #E5E7EB',
                      whiteSpace: 'nowrap',
                    }}
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

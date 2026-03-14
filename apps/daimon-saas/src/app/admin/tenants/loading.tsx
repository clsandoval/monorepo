import { AdminLayout } from '@/components/layout/admin-layout'

function SkeletonRow() {
  return (
    <tr>
      {[180, 50, 60, 100, 100, 80].map((w, i) => (
        <td
          key={i}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #F3F4F6',
            verticalAlign: 'middle',
          }}
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
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '160px', height: '28px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '280px', height: '16px' }} />
        </div>

        {/* Stats bar (3 stat chips) */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '120px', height: '60px' }} />
          <div className="skeleton" style={{ width: '120px', height: '60px' }} />
          <div className="skeleton" style={{ width: '120px', height: '60px' }} />
        </div>

        {/* Search bar skeleton */}
        <div className="skeleton" style={{ width: '320px', height: '38px', marginBottom: '16px' }} />

        {/* Table skeleton */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Workspace', 'Status', 'Plan', 'Created', 'Last Active', 'Actions'].map((col) => (
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

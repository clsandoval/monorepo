'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'

// ─── Impersonation Banner ──────────────────────────────────────────────────────

function ImpersonationBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isImpersonated = searchParams.get('impersonated') === '1'
  const tenantName = searchParams.get('tenant_name') ?? 'Unknown Tenant'
  const tenantId = searchParams.get('tenant_id') ?? ''

  if (!isImpersonated) return null

  const handleEnd = () => {
    router.push(tenantId ? `/admin/tenants/${tenantId}` : '/admin/tenants')
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        zIndex: 100,
        background: '#FEF9C3',
        borderBottom: '2px solid #EAB308',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '13px', color: '#854D0E' }}>
        👁 You are viewing this dashboard as &ldquo;{tenantName}&rdquo;. All write actions are blocked. This session expires in 30 minutes.
      </span>
      <button
        onClick={handleEnd}
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 12px',
          background: '#EAB308',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: 0,
          whiteSpace: 'nowrap',
        }}
      >
        End Impersonation
      </button>
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  tenantName?: string
  plan?: 'free' | 'starter' | 'pro'
}

export function DashboardLayout({
  children,
  pageTitle = 'Dashboard',
  tenantName = '',
  plan = 'free',
}: DashboardLayoutProps) {
  return (
    <Suspense fallback={null}>
      <DashboardLayoutInner pageTitle={pageTitle} tenantName={tenantName} plan={plan}>
        {children}
      </DashboardLayoutInner>
    </Suspense>
  )
}

function DashboardLayoutInner({
  children,
  pageTitle,
  tenantName,
  plan,
}: Required<DashboardLayoutProps>) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const searchParams = useSearchParams()
  const isImpersonated = searchParams.get('impersonated') === '1'

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#F7F7F7', paddingTop: isImpersonated ? '48px' : undefined }}
    >
      <ImpersonationBanner />

      {/* Sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 lg:hidden"
          style={{ zIndex: 200 }}
          onClick={() => setMobileNavOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(12,31,64,0.50)' }}
          />
          {/* Panel */}
          <div
            className="absolute left-0 top-0 h-full"
            style={{ width: '240px', zIndex: 201 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main area */}
      <div
        className="flex flex-1 flex-col"
        style={{ marginLeft: '240px' }}
      >
        {/* Suppress marginLeft on mobile */}
        <style>{`
          @media (max-width: 1023px) {
            .main-area-inner { margin-left: 0 !important; }
          }
        `}</style>

        <DashboardTopbar
          pageTitle={pageTitle}
          tenantName={tenantName}
          plan={plan}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main
          className="flex-1 p-8 w-full"
          style={{ maxWidth: '1200px' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

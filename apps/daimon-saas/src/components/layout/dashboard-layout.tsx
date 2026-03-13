'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#F7F7F7' }}
    >
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

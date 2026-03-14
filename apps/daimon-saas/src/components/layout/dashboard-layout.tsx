'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Plug,
  CreditCard,
  Settings,
  BookOpen,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'

// ─── Bottom Nav Bar (mobile only) ──────────────────────────────────────────

const BOTTOM_NAV_ITEMS = [
  { href: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { href: '/dashboard/integrations', icon: <Plug size={20} />, label: 'Integrations' },
  { href: '/dashboard/billing', icon: <CreditCard size={20} />, label: 'Billing' },
  { href: '/dashboard/settings', icon: <Settings size={20} />, label: 'Settings' },
  { href: '/docs', icon: <BookOpen size={20} />, label: 'Docs' },
]

function BottomNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname()
  const isActive =
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const activeColor = '#0C1F40'
  const defaultColor = 'rgba(12,31,64,0.45)'

  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-[3px] relative"
      style={{
        minHeight: '44px',
        minWidth: '44px',
        color: isActive ? activeColor : defaultColor,
      }}
    >
      {/* Active dot indicator */}
      {isActive && (
        <span
          style={{
            position: 'absolute',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '16px',
            height: '2px',
            background: '#B4E7DD',
            borderRadius: 0,
          }}
        />
      )}
      <span className="flex-shrink-0" style={{ marginTop: isActive ? '8px' : '0' }}>{icon}</span>
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontWeight: 500,
          lineHeight: 1,
          color: isActive ? activeColor : defaultColor,
        }}
      >
        {label}
      </span>
    </Link>
  )
}

function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden"
      style={{
        height: '56px',
        background: '#FFFFFF',
        borderTop: '1px solid rgba(12,31,64,0.08)',
        zIndex: 40,
      }}
      aria-label="Mobile navigation"
    >
      {BOTTOM_NAV_ITEMS.map((item) => (
        <BottomNavItem key={item.href} {...item} />
      ))}
    </nav>
  )
}

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

      {/* Sidebar — hidden on mobile (<768px), icon-only on tablet (768-1279px), full on desktop (≥1280px) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile full-screen nav slide-over */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 md:hidden"
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

      {/* Main area — responsive margin-left: 0 mobile, 56px tablet, 240px desktop */}
      <div className="flex flex-1 flex-col ml-0 md:ml-14 xl:ml-60">
        <DashboardTopbar
          pageTitle={pageTitle}
          tenantName={tenantName}
          plan={plan}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        {/* Page content — responsive padding + bottom padding on mobile to clear bottom nav bar */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 md:p-6 xl:p-8 pb-[72px] md:pb-6 xl:pb-8 w-full"
          style={{ maxWidth: '1200px' }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav bar */}
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  )
}

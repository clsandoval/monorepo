'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  FileText,
  Settings,
  Rocket,
  LogOut,
} from 'lucide-react'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import { useAuthContext } from '@/lib/auth/auth-context'

interface AdminNavItemConfig {
  href: string
  label: string
  icon: React.ReactNode
}

const ADMIN_NAV_ITEMS: AdminNavItemConfig[] = [
  { href: '/admin', label: 'Admin Home', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/tenants', label: 'Tenants', icon: <Building2 size={20} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={20} /> },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard size={20} /> },
  { href: '/admin/audit', label: 'Audit Log', icon: <FileText size={20} /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
]

function AdminNavItem({ href, label, icon }: AdminNavItemConfig) {
  const pathname = usePathname()
  const isActive =
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className="flex items-center gap-3 mx-2 px-3 rounded-none transition-colors duration-150"
      style={{
        height: '44px',
        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
        background: isActive
          ? 'rgba(255,255,255,0.10)'
          : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = '#FFFFFF'
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function AdminSidebar() {
  const { user, signOut } = useAuthContext()

  const userEmail = user?.email ?? ''
  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <aside
      className="fixed left-0 top-0 flex flex-col overflow-y-auto"
      style={{
        width: '240px',
        height: '100vh',
        background: '#0C1F40',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
      }}
    >
      {/* Logo Area with ADMIN badge */}
      <Link
        href="/admin"
        className="flex items-center gap-2 flex-shrink-0 transition-opacity duration-150 hover:opacity-85"
        style={{
          height: '64px',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Rocket size={24} color="#FFFFFF" />
        <span
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          Daimon
        </span>
        {/* ADMIN badge */}
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '10px',
            fontWeight: 700,
            color: '#0C1F40',
            background: '#F6AE72',
            padding: '2px 6px',
            borderRadius: 0,
            marginLeft: '8px',
            flexShrink: 0,
            lineHeight: 1.4,
          }}
        >
          ADMIN
        </span>
      </Link>

      {/* Nav Section */}
      <nav className="flex-1 overflow-y-auto py-3">
        {ADMIN_NAV_ITEMS.map((item) => (
          <AdminNavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div
        className="flex items-center gap-[10px] flex-shrink-0"
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#0C1F40',
          zIndex: 1,
        }}
      >
        {/* User Avatar */}
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-full text-xs font-semibold"
          style={{
            width: '24px',
            height: '24px',
            background: 'rgba(255,255,255,0.15)',
            color: '#FFFFFF',
          }}
        >
          {initials}
        </div>

        {/* User Email */}
        <span
          className="flex-1 truncate text-xs"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          title={userEmail}
        >
          {userEmail}
        </span>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="flex-shrink-0 transition-colors duration-150"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  tenantName?: string
  plan?: 'free' | 'starter' | 'pro'
}

export function AdminLayout({
  children,
  pageTitle = 'Admin',
  tenantName = '',
  plan = 'free',
}: AdminLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#F7F7F7' }}
    >
      {/* AdminSidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar />
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
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main area */}
      <div
        className="flex flex-1 flex-col lg:ml-[240px]"
      >
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

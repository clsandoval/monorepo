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
  Monitor,
} from 'lucide-react'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import { useAuthContext } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 mx-2 px-3 h-11 transition-colors duration-150',
        isActive
          ? 'text-white bg-white/10'
          : 'text-white/65 hover:text-white hover:bg-white/5'
      )}
    >
      <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
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
      aria-label="Admin sidebar navigation"
      className="fixed left-0 top-0 flex flex-col overflow-y-auto w-60 h-screen bg-foreground border-r border-white/[0.06] z-[100]"
    >
      {/* Logo Area with ADMIN badge */}
      <Link
        href="/admin"
        aria-label="Daimon Admin — go to admin home"
        className="flex items-center gap-2 flex-shrink-0 h-16 px-4 border-b border-white/[0.08] transition-opacity duration-150 hover:opacity-85"
      >
        <Rocket size={24} className="text-white" aria-hidden="true" />
        <span className="font-archivo text-base font-bold text-white">
          Daimon
        </span>
        {/* ADMIN badge */}
        <span className="font-sans text-[10px] font-bold text-foreground bg-[#F6AE72] px-1.5 py-0.5 ml-2 flex-shrink-0 leading-snug">
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
      <div className="flex items-center gap-2.5 flex-shrink-0 p-4 border-t border-white/[0.08] bg-foreground z-[1]">
        {/* User Avatar */}
        <div
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0 size-6 rounded-full bg-white/15 text-white text-xs font-semibold"
        >
          {initials}
        </div>

        {/* User Email */}
        <span
          className="flex-1 truncate text-xs text-white/65"
          aria-label={`Signed in as ${userEmail}`}
          title={userEmail}
        >
          {userEmail}
        </span>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleSignOut}
          className="flex-shrink-0 text-white/45 hover:text-white hover:bg-transparent"
          aria-label="Sign out of Daimon"
        >
          <LogOut size={16} aria-hidden="true" />
        </Button>
      </div>
    </aside>
  )
}

// ─── Mobile Blocking Screen ────────────────────────────────────────────────

function AdminMobileBlock() {
  return (
    <div className="flex lg:hidden min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="max-w-[400px] w-full p-10 text-center">
        <Monitor
          size={48}
          className="text-foreground/40 mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="font-archivo text-xl font-semibold text-foreground mb-2">
          Desktop only
        </h2>
        <p className="font-sans text-[15px] text-muted-foreground mb-5 leading-relaxed">
          The admin panel is not available on mobile devices. Please use a desktop browser.
        </p>
        <Link
          href="/dashboard"
          className="font-sans text-sm text-foreground underline"
        >
          &larr; Back to Dashboard
        </Link>
      </Card>
    </div>
  )
}

// ─── Admin Layout ──────────────────────────────────────────────────────────

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
    <>
      {/* Mobile blocking screen — shown below 1024px */}
      <AdminMobileBlock />

      {/* Full admin panel — shown at 1024px and above */}
      <div className="hidden lg:flex min-h-screen bg-background">
        <AdminSidebar />

        {/* Mobile nav overlay (for tablet-ish scenarios) */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 lg:hidden z-[200]"
            onClick={() => setMobileNavOpen(false)}
          >
            <div className="absolute inset-0 bg-foreground/50" />
            <div
              className="absolute left-0 top-0 h-full w-60 z-[201]"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar />
            </div>
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 flex-col lg:ml-60">
          <DashboardTopbar
            pageTitle={pageTitle}
            tenantName={tenantName}
            plan={plan}
            onMenuClick={() => setMobileNavOpen(true)}
          />

          <main id="main-content" tabIndex={-1} className="flex-1 p-8 w-full max-w-[1200px]">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

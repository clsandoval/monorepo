'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plug,
  CreditCard,
  Settings,
  BookOpen,
  Rocket,
  LogOut,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'

interface NavItemConfig {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/dashboard/integrations', label: 'Integrations', icon: <Plug size={20} /> },
  { href: '/dashboard/billing', label: 'Billing', icon: <CreditCard size={20} /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  { href: '/docs', label: 'Documentation', icon: <BookOpen size={20} /> },
]

function SidebarNavItem({ href, label, icon }: NavItemConfig) {
  const pathname = usePathname()
  const isActive =
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className="flex items-center justify-center xl:justify-start mx-0 xl:mx-2 px-0 xl:px-3 xl:gap-3 transition-colors duration-150"
      style={{
        height: '44px',
        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
        background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
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
      <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      {/* Label: hidden on tablet (icon-only), visible on desktop */}
      <span className="hidden xl:block text-sm font-medium">{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const { user, signOut } = useAuthContext()

  const userEmail = user?.email ?? ''
  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <nav
      aria-label="Sidebar navigation"
      id="sidebar-nav"
      className="fixed left-0 top-0 flex flex-col overflow-y-auto md:w-14 xl:w-60 sidebar-collapsible"
      style={{
        height: '100vh',
        background: '#0C1F40',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
      }}
    >
      {/* Logo Area — icon only on tablet, icon + wordmark on desktop */}
      <Link
        href="/dashboard"
        aria-label="Daimon home — go to dashboard"
        className="flex items-center justify-center xl:justify-start flex-shrink-0 transition-opacity duration-150 hover:opacity-85"
        style={{
          height: '64px',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Rocket size={24} color="#FFFFFF" className="flex-shrink-0" aria-hidden="true" />
        <span
          className="hidden xl:block ml-2"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          Daimon
        </span>
      </Link>

      {/* Nav Section */}
      <ul role="list" aria-label="Dashboard navigation" className="flex-1 overflow-y-auto py-3 list-none m-0 p-0">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <SidebarNavItem {...item} />
          </li>
        ))}
      </ul>

      {/* Sidebar Footer — avatar only on tablet, full on desktop */}
      <div
        aria-label="User account"
        className="flex items-center justify-center xl:justify-start flex-shrink-0"
        style={{
          padding: '16px 8px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#0C1F40',
          zIndex: 1,
        }}
      >
        {/* User Avatar */}
        <div
          aria-hidden="true"
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

        {/* User Email — hidden on tablet, visible on desktop */}
        <span
          className="hidden xl:block flex-1 truncate text-xs ml-[10px]"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          aria-label={`Signed in as ${userEmail}`}
          title={userEmail}
        >
          {userEmail}
        </span>

        {/* Logout Button — hidden on tablet, visible on desktop */}
        <button
          onClick={handleSignOut}
          className="hidden xl:flex flex-shrink-0 transition-colors duration-150"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          aria-label="Sign out of Daimon"
          aria-busy={false}
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

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
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

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
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center justify-center xl:justify-start mx-0 xl:mx-2 px-0 xl:px-3 xl:gap-3 h-11 transition-colors duration-150',
              isActive
                ? 'text-white bg-white/10'
                : 'text-white/65 hover:text-white hover:bg-white/5'
            )}
          />
        }
      >
        <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        {/* Label: hidden on tablet (icon-only), visible on desktop */}
        <span className="hidden xl:block text-sm font-medium">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="right" className="xl:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
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
    <TooltipProvider>
      <nav
        aria-label="Sidebar navigation"
        id="sidebar-nav"
        className="fixed left-0 top-0 flex flex-col overflow-y-auto md:w-14 xl:w-60 h-screen bg-foreground border-r border-white/[0.06] z-[100] sidebar-collapsible"
      >
        {/* Logo Area — icon only on tablet, icon + wordmark on desktop */}
        <Link
          href="/dashboard"
          aria-label="Daimon home — go to dashboard"
          className="flex items-center justify-center xl:justify-start flex-shrink-0 h-16 px-4 border-b border-white/[0.08] transition-opacity duration-150 hover:opacity-85"
        >
          <Rocket size={24} className="flex-shrink-0 text-white" aria-hidden="true" />
          <span className="hidden xl:block ml-2 font-archivo text-base font-bold text-white">
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
          className="flex items-center justify-center xl:justify-start flex-shrink-0 p-4 xl:px-2 border-t border-white/[0.08] bg-foreground z-[1]"
        >
          {/* User Avatar */}
          <div
            aria-hidden="true"
            className="flex items-center justify-center flex-shrink-0 size-6 rounded-full bg-white/15 text-white text-xs font-semibold"
          >
            {initials}
          </div>

          {/* User Email — hidden on tablet, visible on desktop */}
          <span
            className="hidden xl:block flex-1 truncate text-xs ml-2.5 text-white/65"
            aria-label={`Signed in as ${userEmail}`}
            title={userEmail}
          >
            {userEmail}
          </span>

          {/* Logout Button — hidden on tablet, visible on desktop */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleSignOut}
            className="hidden xl:flex text-white/45 hover:text-white hover:bg-transparent"
            aria-label="Sign out of Daimon"
          >
            <LogOut size={16} aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </TooltipProvider>
  )
}

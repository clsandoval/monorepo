import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, LayoutDashboard, CalendarClock, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AutoSaveDot } from '@/components/shared/AutoSaveDot'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'
import { useSaveStatus } from '@/lib/save-status-context'

const NAV_ITEMS = [
  { label: 'Computations', to: '/computations', icon: LayoutDashboard },
  { label: 'Deadlines', to: '/deadlines', icon: CalendarClock },
  { label: 'Settings', to: '/settings', icon: Settings },
]

const COLLAPSED_KEY = 'taxklaro_sidebar_collapsed'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const { org } = useOrganization()
  const { status: saveStatus } = useSaveStatus()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed))
  }, [collapsed])

  const navContent = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            isActive(item.to)
              ? 'text-foreground bg-gray-100'
              : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  )

  // Desktop sidebar
  const desktopSidebar = (
    <aside
      className={cn(
        'hidden md:flex flex-col sticky top-0 h-screen border-r border-border bg-background shrink-0 transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-12 px-4">
        <Link to="/computations" className="text-sm font-bold text-foreground truncate">
          {collapsed ? 'TK' : 'TaxKlaro'}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-2 py-2">
        {navContent()}
      </div>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-border">
        {saveStatus !== 'idle' && (
          <div className={cn('flex items-center gap-2 px-3 py-1 mb-2', collapsed && 'justify-center')}>
            <AutoSaveDot status={saveStatus} />
            {!collapsed && (
              <span className="text-xs text-muted-foreground">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : ''}
              </span>
            )}
          </div>
        )}
        {!collapsed && (
          <div className="px-3 py-1">
            <span className="text-xs text-muted-foreground truncate block">
              {org?.name ? `${org.name}` : ''}{user?.email ? ` · ${user.email}` : ''}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )

  // Mobile top bar + sheet
  const mobileHeader = (
    <header className="md:hidden flex items-center justify-between h-12 px-4 border-b border-border bg-background shrink-0">
      <Link to="/computations" className="text-sm font-bold text-foreground">TaxKlaro</Link>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger>
          <Menu className="h-5 w-5 text-muted-foreground" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="h-12 flex items-center px-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">TaxKlaro</span>
            </div>
            <div className="flex-1 px-2 py-4">
              {navContent(() => setMobileOpen(false))}
            </div>
            <div className="px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground truncate block">
                {org?.name ? `${org.name} · ` : ''}{user?.email}
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )

  return (
    <>
      {desktopSidebar}
      {mobileHeader}
    </>
  )
}

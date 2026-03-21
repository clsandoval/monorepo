import { Link, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AutoSaveDot } from '@/components/shared/AutoSaveDot'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'

const NAV_ITEMS = [
  { label: 'Computations', to: '/computations' },
  { label: 'Clients', to: '/clients' },
  { label: 'Deadlines', to: '/deadlines' },
  { label: 'Settings', to: '/settings' },
]

export function TopBar({ saveStatus }: { saveStatus?: 'idle' | 'saving' | 'saved' | 'error' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const { org } = useOrganization()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')

  return (
    <header className="flex items-center justify-between h-12 px-6 border-b border-zinc-800 bg-zinc-950/80 shrink-0">
      <div className="flex items-center gap-6">
        <Link to="/computations" className="text-sm font-bold text-zinc-50">TaxKlaro</Link>
        <nav className="hidden md:flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={cn('text-[13px] transition-colors', isActive(item.to) ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300')}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {saveStatus && <AutoSaveDot status={saveStatus} />}
        <span className="hidden sm:inline text-xs text-zinc-500 truncate max-w-48">
          {org?.name ? `${org.name} · ` : ''}{user?.email}
        </span>
        <div className="h-7 w-7 rounded-full bg-zinc-800 shrink-0" />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden">
            <Menu className="h-5 w-5 text-zinc-400" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800 p-0">
            <nav className="flex flex-col p-4 gap-1 mt-8">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={cn('px-3 py-2 rounded-md text-sm', isActive(item.to) ? 'text-zinc-50 bg-zinc-900' : 'text-zinc-500')}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

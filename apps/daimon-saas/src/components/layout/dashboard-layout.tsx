'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Plug,
  CreditCard,
  Settings,
  BookOpen,
  Menu,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

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

  return (
    <Link
      href={href}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-[3px] relative min-h-[44px] min-w-[44px]',
        isActive ? 'text-foreground' : 'text-foreground/45'
      )}
    >
      {/* Active dot indicator */}
      {isActive && (
        <span
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary"
        />
      )}
      <span className={cn('flex-shrink-0', isActive && 'mt-2')}>{icon}</span>
      <span
        className={cn(
          'font-sans text-[10px] font-medium leading-none',
          isActive ? 'text-foreground' : 'text-foreground/45'
        )}
      >
        {label}
      </span>
    </Link>
  )
}

function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden h-14 bg-card border-t border-border z-40"
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
      className="fixed top-0 left-0 right-0 h-12 z-[100] bg-yellow-100 border-b-2 border-yellow-500 flex items-center justify-between px-6"
    >
      <span className="font-sans font-medium text-[13px] text-yellow-800">
        👁 You are viewing this dashboard as &ldquo;{tenantName}&rdquo;. All write actions are blocked. This session expires in 30 minutes.
      </span>
      <Button
        onClick={handleEnd}
        className="bg-yellow-500 text-white hover:bg-yellow-600 text-xs font-medium px-3 py-1 h-auto whitespace-nowrap"
      >
        End Impersonation
      </Button>
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
  const searchParams = useSearchParams()
  const isImpersonated = searchParams.get('impersonated') === '1'

  return (
    <div
      className={cn(
        'flex min-h-screen bg-background',
        isImpersonated && 'pt-12'
      )}
    >
      <ImpersonationBanner />

      {/* Sidebar — hidden on mobile (<768px), icon-only on tablet (768-1279px), full on desktop (≥1280px) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main area — responsive margin-left: 0 mobile, 56px tablet, 240px desktop */}
      <div className="flex flex-1 flex-col ml-0 md:ml-14 xl:ml-60">
        <Sheet>
          <DashboardTopbar
            pageTitle={pageTitle}
            tenantName={tenantName}
            plan={plan}
            menuButton={
              <SheetTrigger
                className="md:hidden flex items-center justify-center text-foreground/65"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </SheetTrigger>
            }
          />

          {/* Mobile Sheet nav slide-over */}
          <SheetContent side="left" showCloseButton={false} className="w-60 p-0 border-r-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Page content — responsive padding + bottom padding on mobile to clear bottom nav bar */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 md:p-6 xl:p-8 pb-[72px] md:pb-6 xl:pb-8 w-full max-w-[1200px]"
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

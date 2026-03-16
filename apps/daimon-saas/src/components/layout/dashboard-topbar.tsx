'use client'

import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/auth/auth-context'

interface DashboardTopbarProps {
  pageTitle: string
  tenantName: string
  plan: 'free' | 'starter' | 'pro'
  onMenuClick?: () => void
  menuButton?: React.ReactNode
}

export function DashboardTopbar({
  pageTitle,
  tenantName,
  plan,
  onMenuClick,
  menuButton,
}: DashboardTopbarProps) {
  const { user, signOut } = useAuthContext()

  const userEmail = user?.email ?? ''
  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  const planVariant = `plan-${plan}` as const

  return (
    <header
      className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-6"
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        {menuButton ?? (onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-muted-foreground"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </Button>
        ))}
        <h1 className="text-base font-semibold text-foreground">
          {pageTitle}
        </h1>
      </div>

      {/* Right: tenant name + plan badge + user avatar dropdown */}
      <div className="flex items-center gap-3">
        {/* Tenant name */}
        <span
          className="hidden sm:block max-w-[160px] truncate text-sm font-medium text-muted-foreground"
          title={tenantName}
        >
          {tenantName}
        </span>

        {/* Plan badge */}
        <Badge variant={planVariant} />

        {/* User avatar + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 px-1 hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-card">
                {initials}
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground transition-transform duration-150 [[data-state=open]>&]:rotate-180"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel
              className="truncate text-xs font-normal text-muted-foreground"
              title={userEmail}
            >
              {userEmail}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

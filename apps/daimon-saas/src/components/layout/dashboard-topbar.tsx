'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userEmail = user?.email ?? ''
  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  async function handleSignOut() {
    setDropdownOpen(false)
    await signOut()
    window.location.href = '/login'
  }

  const planVariant = `plan-${plan}` as const

  return (
    <header
      className="sticky top-0 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(12,31,64,0.08)',
        zIndex: 30,
      }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        {menuButton ?? (onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center"
            style={{ color: 'rgba(12,31,64,0.65)' }}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
        ))}
        <h1
          className="text-base font-semibold"
          style={{ color: '#0C1F40' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right: tenant name + plan badge + user avatar dropdown */}
      <div className="flex items-center gap-3">
        {/* Tenant name */}
        <span
          className="hidden sm:block text-sm font-medium truncate max-w-[160px]"
          style={{ color: 'rgba(12,31,64,0.65)' }}
          title={tenantName}
        >
          {tenantName}
        </span>

        {/* Plan badge */}
        <Badge variant={planVariant} />

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-semibold"
              style={{
                width: '28px',
                height: '28px',
                background: '#0C1F40',
                color: '#FFFFFF',
              }}
            >
              {initials}
            </div>
            <ChevronDown
              size={14}
              style={{ color: 'rgba(12,31,64,0.45)' }}
              className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-[200px] py-1"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(12,31,64,0.10)',
                boxShadow: '0 4px 16px rgba(12,31,64,0.10)',
                zIndex: 50,
              }}
            >
              {/* User email */}
              <div
                className="px-3 py-2 text-xs truncate"
                style={{ color: 'rgba(12,31,64,0.45)' }}
                title={userEmail}
              >
                {userEmail}
              </div>

              <div style={{ height: '1px', background: 'rgba(12,31,64,0.08)', margin: '4px 0' }} />

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors duration-150"
                style={{ color: '#DC2626' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

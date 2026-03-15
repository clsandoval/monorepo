'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Rocket, Menu, X } from 'lucide-react'

// ---------------------------------------------------------------------------
// Sidebar nav structure
// ---------------------------------------------------------------------------

const NAV_SECTIONS = [
  {
    label: 'Getting Started',
    items: [{ href: '/docs/quick-start', title: 'Quick Start' }],
  },
  {
    label: 'Tool Reference',
    items: [
      { href: '/docs/tools', title: 'All Tools (95)' },
      { href: '/docs/tool-reference/discord', title: 'Discord & Core Tools' },
      { href: '/docs/tool-reference/toggl', title: 'Toggl' },
      { href: '/docs/tool-reference/linkedin', title: 'LinkedIn & Analytics' },
      { href: '/docs/tool-reference/fly', title: 'Fly & Infrastructure' },
      { href: '/docs/tool-reference/linear', title: 'Linear' },
    ],
  },
  {
    label: 'Account & Billing',
    items: [
      { href: '/docs/billing', title: 'Plans & Pricing' },
      { href: '/docs/faq', title: 'FAQ' },
    ],
  },
]

// ---------------------------------------------------------------------------
// DocsSidebar
// ---------------------------------------------------------------------------

function DocsSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Docs navigation">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {NAV_SECTIONS.map((section) => (
          <li key={section.label} style={{ margin: 0 }}>
            {/* Section label */}
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '20px 24px 8px 24px',
              }}
            >
              {section.label}
            </span>

            {/* Section items */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onNavigate}
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-inter)',
                        fontSize: '16px',
                        fontWeight: isActive ? 600 : 400,
                        color: '#0C1F40',
                        padding: '10px 24px',
                        textDecoration: 'none',
                        backgroundColor: isActive
                          ? 'rgba(180, 231, 221, 0.15)'
                          : 'transparent',
                        borderLeft: isActive
                          ? '2px solid #B4E7DD'
                          : '2px solid transparent',
                        transition: 'background-color 150ms, color 150ms',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                            '#F9FAFB'
                          ;(e.currentTarget as HTMLAnchorElement).style.color =
                            '#0C1F40'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                            'transparent'
                        }
                      }}
                    >
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function DocsSidebar() {
  return (
    <aside className="hidden md:block fixed left-0 top-0 w-[260px] h-screen bg-white border-r border-gray-200 overflow-y-auto z-20">
      {/* Logo area */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Rocket size={20} color="#0C1F40" />
          <span
            style={{
              fontFamily: 'var(--font-archivo)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0C1F40',
            }}
          >
            Daimon
          </span>
        </Link>
      </div>

      <DocsSidebarNav />
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Mobile sidebar overlay
// ---------------------------------------------------------------------------

function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    onClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar panel */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '280px',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          overflowY: 'auto',
          zIndex: 50,
          boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header with close */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Rocket size={20} color="#0C1F40" />
            <span
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#0C1F40',
              }}
            >
              Daimon
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#6B7280',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <DocsSidebarNav onNavigate={onClose} />
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// DocsTopbar
// ---------------------------------------------------------------------------

function getPageTitle(pathname: string): string {
  if (pathname === '/docs/tools') return 'All Tools'
  if (pathname === '/docs/quick-start') return 'Quick Start'
  if (pathname === '/docs/tool-reference/discord') return 'Discord & Core Tools'
  if (pathname === '/docs/tool-reference/toggl') return 'Toggl'
  if (pathname === '/docs/tool-reference/linkedin') return 'LinkedIn & Analytics'
  if (pathname === '/docs/tool-reference/fly') return 'Fly & Infrastructure'
  if (pathname === '/docs/tool-reference/linear') return 'Linear'
  if (pathname === '/docs/billing') return 'Plans & Pricing'
  if (pathname === '/docs/faq') return 'FAQ'
  return 'Docs'
}

function DocsTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
      }}
      className="md:px-8"
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="md:hidden"
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: '#0C1F40',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumb */}
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          color: '#6B7280',
        }}
      >
        <span>Docs</span>
        <span
          style={{ color: '#D1D5DB', padding: '0 8px' }}
          aria-hidden="true"
        >
          /
        </span>
        <span>{pageTitle}</span>
      </span>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <Link
        href="/signup"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '32px',
          padding: '0 16px',
          backgroundColor: '#B4E7DD',
          color: '#0C1F40',
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'opacity 150ms',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')
        }
      >
        Sign up free
      </Link>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
      }}
    >
      <DocsSidebar />
      <MobileSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main content — shifted right of sidebar on desktop, full-width on mobile */}
      <div className="flex-1 min-w-0 md:ml-[260px]">
        <DocsTopbar onMenuClick={() => setMobileNavOpen(true)} />

        <article
          className="docs-content max-w-[780px] mx-auto px-4 py-8 pb-24 md:px-8 md:pt-12 overflow-x-hidden"
        >
          {children}
        </article>
      </div>
    </div>
  )
}

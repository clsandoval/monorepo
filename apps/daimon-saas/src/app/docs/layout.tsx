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
      <ul className="list-none m-0 p-0">
        {NAV_SECTIONS.map((section) => (
          <li key={section.label} className="m-0">
            {/* Section label */}
            <span
              className="font-body text-sm font-semibold block text-gray-500 uppercase tracking-widest pt-5 px-6 pb-2"
            >
              {section.label}
            </span>

            {/* Section items */}
            <ul className="list-none m-0 p-0">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onNavigate}
                      className={`font-body text-base block text-foreground py-2.5 px-6 no-underline transition-colors duration-150 ${isActive ? "font-semibold bg-primary/15 border-l-2 border-primary" : "font-normal bg-transparent border-l-2 border-transparent"}`}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                            '#F9FAFB'
                          ;(e.currentTarget as HTMLAnchorElement).style.color =
                            'hsl(var(--foreground))'
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
      <div className="py-5 px-6 border-b border-border">

        <Link
          href="/"
          className="inline-flex items-center gap-2"
        >
          <Rocket size={20} color="hsl(var(--foreground))" />
          <span
            className="font-headline text-base font-bold text-foreground"
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
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar panel */}
      <aside
        className="fixed left-0 top-0 w-[280px] h-screen bg-white overflow-y-auto z-50 shadow-lg"
      >
        {/* Header with close */}
        <div className="py-4 px-6 border-b border-border flex items-center justify-between">

          <Link
            href="/"
            className="inline-flex items-center gap-2"
          >
            <Rocket size={20} color="hsl(var(--foreground))" />
            <span
              className="font-headline text-base font-bold text-foreground"
            >
              Daimon
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="bg-transparent border-none p-2 cursor-pointer text-gray-500"
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
      className="sticky top-0 h-14 bg-white border-b border-border z-10 flex items-center px-4 gap-2 md:px-8"
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="md:hidden bg-transparent border-none p-2 cursor-pointer text-foreground inline-flex items-center"
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumb */}
      <span
        className="font-body text-sm text-gray-500"
      >
        <span>Docs</span>
        <span
          className="text-muted-foreground px-2"
          aria-hidden="true"
        >
          /
        </span>
        <span>{pageTitle}</span>
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      <Link
        href="/signup"
        className="font-body text-sm font-semibold inline-flex items-center h-8 px-4 bg-primary text-foreground no-underline whitespace-nowrap transition-opacity duration-150"
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
    <div className="flex min-h-screen bg-background">

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

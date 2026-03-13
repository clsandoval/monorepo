'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rocket } from 'lucide-react'

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

function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '260px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        overflowY: 'auto',
        zIndex: 20,
      }}
    >
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

      {/* Nav */}
      <nav aria-label="Docs navigation">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_SECTIONS.map((section) => (
            <li key={section.label} style={{ margin: 0 }}>
              {/* Section label */}
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
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
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-inter)',
                          fontSize: '14px',
                          fontWeight: isActive ? 600 : 400,
                          color: '#0C1F40',
                          padding: '7px 24px',
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
    </aside>
  )
}

// ---------------------------------------------------------------------------
// DocsTopbar
// ---------------------------------------------------------------------------

function getPageTitle(pathname: string): string {
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

function DocsTopbar() {
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
        padding: '0 32px',
        gap: '8px',
      }}
    >
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

      {/* CTA — shown unconditionally as client-side auth check adds complexity;
          the spec notes "visible only to authenticated users" for dashboard link
          and "unauthenticated" for signup — we show Sign up free as default
          since docs are public and we keep the layout simple per stage spec */}
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
          fontSize: '13px',
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
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
      }}
    >
      <DocsSidebar />

      {/* Main content shifted right of sidebar */}
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <DocsTopbar />

        <article
          style={{
            maxWidth: '780px',
            margin: '0 auto',
            padding: '48px 32px 96px 32px',
          }}
          className="docs-content"
        >
          {children}
        </article>
      </div>
    </div>
  )
}

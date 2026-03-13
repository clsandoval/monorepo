import React from 'react'
import Link from 'next/link'

const FOOTER_COLUMNS = [
  {
    heading: 'PRODUCT',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    heading: 'RESOURCES',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Quick Start', href: '/docs/quick-start' },
      { label: 'Tool Reference', href: '/docs/tools' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'LEGAL',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Disclaimers', href: '/disclaimers' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'GitHub', href: 'https://github.com', external: true },
      { label: 'Twitter/X', href: 'https://x.com', external: true },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: '#0C1F40',
        padding: '48px',
      }}
      className="max-[900px]:!px-6 max-[900px]:!py-8"
    >
      {/* Main grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
          gap: '32px',
        }}
        className="max-[900px]:!grid-cols-2 max-[900px]:!gap-x-6 max-[900px]:!gap-y-8"
      >
        {/* Column 1 — Brand */}
        <div
          style={{ display: 'flex', flexDirection: 'column' }}
          className="max-[900px]:col-span-2"
        >
          <div
            className="flex items-center gap-2"
            style={{ marginBottom: '12px' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M16 2L20 10H28L22 16L24 24L16 20L8 24L10 16L4 10H12L16 2Z"
                fill="#B4E7DD"
              />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                fontVariationSettings: "'wdth' 112.5",
              }}
            >
              Daimon
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: '1.5',
              maxWidth: '200px',
              margin: 0,
            }}
          >
            The AI operating system for your Discord server.
          </p>
        </div>

        {/* Columns 2–5 */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading} style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '16px',
                marginTop: 0,
              }}
            >
              {col.heading}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.70)',
                    display: 'block',
                    marginBottom: '8px',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  className="hover:!text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.10)',
          margin: '32px 0 16px',
        }}
      />

      {/* Copyright row */}
      <div
        className="flex items-center justify-between"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        <span>© 2026 Daimon. All rights reserved.</span>
        <span>Built with ❤ on Claude</span>
      </div>
    </footer>
  )
}

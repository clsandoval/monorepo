import React from 'react'
import Link from 'next/link'

const FOOTER_COLUMNS = [
  {
    heading: 'PRODUCT',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Docs', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    heading: 'RESOURCES',
    links: [
      { label: 'Quick Start', href: '/docs#quick-start' },
      { label: 'Tool Reference', href: '/docs#tools' },
      { label: 'API Keys Guide', href: '/docs#api-keys' },
      { label: 'Discord Setup', href: '/docs#discord-setup' },
    ],
  },
  {
    heading: 'LEGAL',
    links: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: 'mailto:hello@daimon.ai' },
      { label: 'Status', href: 'https://status.daimon.ai', external: true },
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
            AI-powered Discord, on your terms.
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
        <span>Built with Claude · Powered by Anthropic</span>
      </div>
    </footer>
  )
}

import React from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
    <footer className="bg-foreground px-12 py-12 max-[900px]:px-6 max-[900px]:py-8">
      {/* Main grid */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-8 max-[900px]:grid-cols-2 max-[900px]:gap-x-6 max-[900px]:gap-y-8">
        {/* Column 1 — Brand */}
        <div className="flex flex-col max-[900px]:col-span-2">
          <div className="mb-3 flex items-center gap-2">
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
                className="fill-primary"
              />
            </svg>
            <span className="font-heading text-lg font-bold text-white" style={{ fontVariationSettings: "'wdth' 112.5" }}>
              Daimon
            </span>
          </div>
          <p className="m-0 max-w-[200px] text-sm leading-relaxed text-white/55">
            AI-powered Discord, on your terms.
          </p>
        </div>

        {/* Columns 2–5 */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading} className="flex flex-col">
            <p className="mb-4 mt-0 text-sm uppercase tracking-widest text-white/45">
              {col.heading}
            </p>
            <div className="flex flex-col">
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'mb-2 block text-sm text-white/70 no-underline transition-colors duration-150',
                    'hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <Separator className="mb-4 mt-8 bg-white/10" />

      {/* Copyright row */}
      <div className="flex items-center justify-between text-sm text-white/35">
        <span>© 2026 Daimon. All rights reserved.</span>
        <span>Built with Claude · Powered by Anthropic</span>
      </div>
    </footer>
  )
}

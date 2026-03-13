'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'FAQ', href: '/#faq' },
]

interface PublicNavbarProps {
  transparent?: boolean
}

function NavLogo({ white = false }: { white?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-85 transition-opacity"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 2L20 10H28L22 16L24 24L16 20L8 24L10 16L4 10H12L16 2Z"
          fill={white ? '#B4E7DD' : '#0C1F40'}
        />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '18px',
          fontWeight: 700,
          color: white ? '#FFFFFF' : '#0C1F40',
          fontVariationSettings: "'wdth' 112.5",
        }}
      >
        Daimon
      </span>
    </Link>
  )
}

function PublicMobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean
  onClose: () => void
  pathname: string
}) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: '#0C1F40',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <NavLogo white />
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} color="rgba(255,255,255,0.65)" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col flex-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '56px',
                fontFamily: 'var(--font-inter)',
                fontSize: '18px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.80)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', margin: '16px 0' }} />

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
            fontWeight: 500,
            color: '#FFFFFF',
            border: '1.5px solid rgba(255,255,255,0.35)',
            borderRadius: '0',
            textDecoration: 'none',
          }}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0C1F40',
            backgroundColor: '#B4E7DD',
            border: '1.5px solid #B4E7DD',
            borderRadius: '0',
            textDecoration: 'none',
          }}
        >
          Get started
        </Link>
      </div>
    </div>
  )
}

export function PublicNavbar({ transparent = false }: PublicNavbarProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!transparent) return
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [transparent])

  const isOpaque = !transparent || scrolled

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '64px',
          backgroundColor: isOpaque ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(12,31,64,0.06)',
          transition: 'background 0.3s ease',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
        className="max-[900px]:!h-14 max-[900px]:!px-4"
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Logo */}
          <NavLogo />

          {/* Center: Nav links (desktop only) */}
          <div
            className="hidden"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#0C1F40',
                    textDecoration: 'none',
                    opacity: isActive ? 1 : undefined,
                    borderBottom: isActive ? '2px solid #B4E7DD' : '2px solid transparent',
                    paddingBottom: '2px',
                    transition: 'opacity 0.2s ease',
                  }}
                  className="hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-4"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right: CTAs (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Desktop CTAs */}
            <div className="hidden items-center gap-3 min-[901px]:flex">
              <Link
                href="/login"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0C1F40',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                className="hover:opacity-70"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '38px',
                  padding: '0 20px',
                  backgroundColor: '#B4E7DD',
                  color: '#0C1F40',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1.5px solid #B4E7DD',
                  borderRadius: '0',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                className="hover:opacity-85"
              >
                Get started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex min-[901px]:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                width: '40px',
                height: '40px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={20} color="#0C1F40" />
            </button>
          </div>
        </div>
      </nav>

      <PublicMobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  )
}

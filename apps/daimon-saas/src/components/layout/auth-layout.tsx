'use client'
// Spec library component — not yet wired to auth pages; available for future integration

import React from 'react'
import Link from 'next/link'

function AuthLogo() {
  return (
    <div className="flex justify-center">
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-85 transition-opacity"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 2L20 10H28L22 16L24 24L16 20L8 24L10 16L4 10H12L16 2Z"
            fill="#0C1F40"
          />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: '20px',
            fontWeight: 700,
            color: '#0C1F40',
            fontVariationSettings: "'wdth' 112.5",
          }}
        >
          Daimon
        </span>
      </Link>
    </div>
  )
}

function AuthFooterLinks() {
  return (
    <div className="flex justify-center gap-6">
      <Link
        href="/privacy"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(12,31,64,0.45)',
        }}
        className="hover:opacity-70 transition-opacity"
      >
        Privacy Policy
      </Link>
      <Link
        href="/terms"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(12,31,64,0.45)',
        }}
        className="hover:opacity-70 transition-opacity"
      >
        Terms of Service
      </Link>
    </div>
  )
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F7F7F7' }}
    >
      <div className="w-full max-w-[440px] flex flex-col gap-8">
        <AuthLogo />
        {children}
        <AuthFooterLinks />
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
            className="fill-foreground"
          />
        </svg>
        <span
          className={cn(
            'font-heading text-xl font-bold text-foreground',
            "[font-variation-settings:'wdth'_112.5]"
          )}
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
        className="text-[13px] text-muted-foreground hover:opacity-70 transition-opacity"
      >
        Privacy Policy
      </Link>
      <Link
        href="/terms"
        className="text-[13px] text-muted-foreground hover:opacity-70 transition-opacity"
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[440px] flex flex-col gap-8">
        <AuthLogo />
        {children}
        <AuthFooterLinks />
      </div>
    </div>
  )
}

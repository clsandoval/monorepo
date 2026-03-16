'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

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
      className="flex items-center gap-2 hover:opacity-85 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
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
          className={white ? 'fill-primary' : 'fill-foreground'}
        />
      </svg>
      <span
        className={cn(
          'font-heading text-lg font-bold',
          white ? 'text-white' : 'text-foreground'
        )}
        style={{ fontVariationSettings: "'wdth' 112.5" }}
      >
        Daimon
      </span>
    </Link>
  )
}

function MobileNavContent({
  pathname,
  onClose,
}: {
  pathname: string
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <SheetTitle className="sr-only">Navigation menu</SheetTitle>

      {/* Nav links */}
      <nav className="flex flex-col flex-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center h-14 text-lg border-b border-white/[0.06] no-underline transition-colors',
                isActive
                  ? 'font-semibold text-white'
                  : 'font-medium text-white/80 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Separator className="my-4 bg-white/10" />

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          onClick={onClose}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-11 border-white/35 text-white bg-transparent hover:bg-white/10 rounded-none'
          )}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          onClick={onClose}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'h-11 bg-primary text-primary-foreground font-semibold rounded-none hover:bg-primary/90'
          )}
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
    <header
      className={cn(
        'sticky top-0 z-50 h-16 max-[900px]:h-14 px-8 max-[900px]:px-4 backdrop-blur-[12px] border-b border-foreground/[0.06] transition-colors duration-300',
        isOpaque ? 'bg-white/[0.92]' : 'bg-transparent'
      )}
    >
    <nav aria-label="Main navigation" className="mx-auto max-w-[1280px] h-full flex items-center justify-between">
        {/* Left: Logo */}
        <NavLogo />

        {/* Center: Nav links (desktop only) */}
        <div className="hidden min-[901px]:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[15px] font-medium text-foreground no-underline pb-0.5 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4',
                  isActive
                    ? 'opacity-100 border-b-2 border-primary'
                    : 'border-b-2 border-transparent'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right: CTAs (desktop) + Hamburger (mobile) */}
        <div className="flex items-center gap-3">
          {/* Desktop CTAs */}
          <div className="hidden min-[901px]:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground no-underline transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'h-[38px] px-5 bg-primary text-primary-foreground font-semibold rounded-none border-[1.5px] border-primary hover:opacity-85'
              )}
            >
              Get started
            </Link>
          </div>

          {/* Mobile hamburger via Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'flex min-[901px]:hidden w-10 h-10'
              )}
              aria-label="Open menu"
            >
              <Menu size={20} className="text-foreground" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full bg-foreground p-6 border-none"
              showCloseButton
            >
              <MobileNavContent
                pathname={pathname}
                onClose={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
    </nav>
    </header>
  )
}

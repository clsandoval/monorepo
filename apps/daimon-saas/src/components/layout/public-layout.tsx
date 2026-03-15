import React from 'react'
import { PublicNavbar } from './public-navbar'
import { PublicFooter } from './public-footer'
import { cn } from '@/lib/utils'

interface PublicLayoutProps {
  children: React.ReactNode
  transparentNavbar?: boolean
}

export function PublicLayout({ children, transparentNavbar = false }: PublicLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-background text-foreground')}>
      <PublicNavbar transparent={transparentNavbar} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}

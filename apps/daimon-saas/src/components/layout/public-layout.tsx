import React from 'react'
import { PublicNavbar } from './public-navbar'
import { PublicFooter } from './public-footer'

interface PublicLayoutProps {
  children: React.ReactNode
  transparentNavbar?: boolean
}

export function PublicLayout({ children, transparentNavbar = false }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar transparent={transparentNavbar} />
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}

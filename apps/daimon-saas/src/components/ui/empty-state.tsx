'use client'

import * as React from 'react'
import { InboxIcon } from 'lucide-react'
import NextLink from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    variant?: 'primary' | 'secondary'
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: {
    container: 'py-6',
    iconBox: 'w-12 h-12 mb-4',
    iconSize: 20,
    titleClass: 'text-sm font-semibold font-inter',
    descClass: 'text-[13px] font-inter',
  },
  md: {
    container: 'py-10',
    iconBox: 'w-16 h-16 mb-4',
    iconSize: 28,
    titleClass: 'text-base font-semibold font-inter',
    descClass: 'text-sm font-inter',
  },
  lg: {
    container: 'py-[60px]',
    iconBox: 'w-20 h-20 mb-4',
    iconSize: 36,
    titleClass: 'text-xl font-medium font-archivo',
    descClass: 'text-[15px] font-inter',
  },
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const cfg = sizeConfig[size]
  const actionVariant = action?.variant ?? 'primary'

  const buttonBase =
    'inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer px-4 py-2 rounded-none'
  const primaryClass = 'bg-[#B4E7DD] text-[#0C1F40] hover:bg-[#9fd8cc]'
  const secondaryClass =
    'bg-transparent border border-[#0C1F40] text-[#0C1F40] hover:bg-[rgba(12,31,64,0.05)]'

  const actionButton = action ? (
    action.href ? (
      <NextLink
        href={action.href}
        className={`${buttonBase} ${actionVariant === 'primary' ? primaryClass : secondaryClass}`}
      >
        {action.label}
      </NextLink>
    ) : (
      <button
        type="button"
        onClick={action.onClick}
        className={`${buttonBase} ${actionVariant === 'primary' ? primaryClass : secondaryClass}`}
      >
        {action.label}
      </button>
    )
  ) : null

  return (
    <div
      className={`flex flex-col items-center text-center w-full mx-auto max-w-[360px] ${cfg.container}${className ? ` ${className}` : ''}`}
    >
      <div
        className={`flex items-center justify-center ${cfg.iconBox}`}
        style={{
          background: 'rgba(180,231,221,0.20)',
          border: '1px solid rgba(180,231,221,0.50)',
          borderRadius: 0,
          color: 'rgba(12,31,64,0.45)',
        }}
      >
        {icon ?? <InboxIcon size={cfg.iconSize} />}
      </div>

      <p
        className={`${cfg.titleClass} mb-1.5`}
        style={{ color: '#0C1F40' }}
      >
        {title}
      </p>

      {description && (
        <p
          className={`${cfg.descClass} max-w-[280px] leading-relaxed${action ? ' mb-5' : ''}`}
          style={{ color: 'rgba(12,31,64,0.55)', lineHeight: 1.6 }}
        >
          {description}
        </p>
      )}

      {actionButton}
    </div>
  )
}

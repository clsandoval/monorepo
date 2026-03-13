'use client'

import * as React from 'react'
import NextLink from 'next/link'

interface LinkProps {
  href: string
  variant?: 'default' | 'nav' | 'muted' | 'underline' | 'unstyled'
  size?: 'sm' | 'md' | 'lg'
  external?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

const sizeMap: Record<NonNullable<LinkProps['size']>, string> = {
  sm: 'text-[13px] leading-[1.5]',
  md: 'text-[15px] leading-[1.5]',
  lg: 'text-[17px] leading-[1.5]',
}

const variantMap: Record<NonNullable<LinkProps['variant']>, string> = {
  default:
    'text-[#0C1F40] no-underline hover:underline hover:decoration-[#B4E7DD] transition-[color,text-decoration-color] duration-150 ease-linear',
  nav:
    'text-[#0C1F40] font-medium no-underline hover:border-b-2 hover:border-[#B4E7DD] transition-[color,text-decoration-color] duration-150 ease-linear',
  muted:
    'text-[rgba(12,31,64,0.55)] no-underline hover:text-[#0C1F40] hover:underline transition-[color,text-decoration-color] duration-150 ease-linear',
  underline:
    'text-[#0C1F40] underline decoration-[rgba(180,231,221,0.6)] hover:decoration-[#B4E7DD] transition-[color,text-decoration-color] duration-150 ease-linear',
  unstyled: 'transition-[color,text-decoration-color] duration-150 ease-linear',
}

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4E7DD] focus-visible:ring-offset-2'

// ExternalLinkIcon — 12px inline SVG
function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(12,31,64,0.45)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline', flexShrink: 0 }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export function Link({
  href,
  variant = 'default',
  size = 'md',
  external = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  onClick,
}: LinkProps) {
  const classes = [
    'inline-flex items-center gap-1',
    sizeMap[size],
    variantMap[variant],
    focusStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={[
          'inline-flex items-center gap-1',
          sizeMap[size],
          variantMap[variant],
          'opacity-45 cursor-not-allowed',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    )
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
        aria-label={undefined}
      >
        {leftIcon}
        {children}
        {rightIcon ?? <ExternalLinkIcon />}
      </a>
    )
  }

  return (
    <NextLink href={href} onClick={onClick} className={classes}>
      {leftIcon}
      {children}
      {rightIcon}
    </NextLink>
  )
}

export default Link

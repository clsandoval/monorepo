'use client'

import * as React from 'react'
import NextLink from 'next/link'
import { cn } from '@/lib/utils'

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
    'text-foreground no-underline hover:underline hover:decoration-primary transition-[color,text-decoration-color] duration-150 ease-linear',
  nav:
    'text-foreground font-medium no-underline hover:border-b-2 hover:border-primary transition-[color,text-decoration-color] duration-150 ease-linear',
  muted:
    'text-muted-foreground no-underline hover:text-foreground hover:underline transition-[color,text-decoration-color] duration-150 ease-linear',
  underline:
    'text-foreground underline decoration-primary/60 hover:decoration-primary transition-[color,text-decoration-color] duration-150 ease-linear',
  unstyled: 'transition-[color,text-decoration-color] duration-150 ease-linear',
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline shrink-0 opacity-45"
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
  className,
  children,
  onClick,
}: LinkProps) {
  const classes = cn(
    'inline-flex items-center gap-1',
    sizeMap[size],
    variantMap[variant],
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    className,
  )

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          'inline-flex items-center gap-1',
          sizeMap[size],
          variantMap[variant],
          'opacity-45 cursor-not-allowed',
          className,
        )}
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

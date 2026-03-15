'use client'

import * as React from 'react'
import { InboxIcon } from 'lucide-react'
import NextLink from 'next/link'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

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
    iconBox: 'size-12 mb-4',
    iconSize: 20,
    titleClass: 'text-sm font-semibold',
    descClass: 'text-[13px]',
  },
  md: {
    container: 'py-10',
    iconBox: 'size-16 mb-4',
    iconSize: 28,
    titleClass: 'text-base font-semibold',
    descClass: 'text-sm',
  },
  lg: {
    container: 'py-[60px]',
    iconBox: 'size-20 mb-4',
    iconSize: 36,
    titleClass: 'text-xl font-medium font-archivo',
    descClass: 'text-[15px]',
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
  const buttonVariant = action?.variant === 'secondary' ? 'outline' : 'default'

  const actionButton = action ? (
    action.href ? (
      <NextLink
        href={action.href}
        className={cn(buttonVariants({ variant: buttonVariant }))}
      >
        {action.label}
      </NextLink>
    ) : (
      <Button variant={buttonVariant} onClick={action.onClick}>
        {action.label}
      </Button>
    )
  ) : null

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center w-full mx-auto max-w-[360px]',
        cfg.container,
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center bg-primary/20 border border-primary/50 text-muted-foreground',
          cfg.iconBox,
        )}
      >
        {icon ?? <InboxIcon size={cfg.iconSize} />}
      </div>

      <p className={cn(cfg.titleClass, 'mb-1.5 text-foreground')}>
        {title}
      </p>

      {description && (
        <p
          className={cn(
            cfg.descClass,
            'max-w-[280px] leading-relaxed text-muted-foreground',
            action && 'mb-5',
          )}
        >
          {description}
        </p>
      )}

      {actionButton}
    </div>
  )
}

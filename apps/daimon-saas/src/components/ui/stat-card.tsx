'use client'

import * as React from 'react'
import { Card } from './card'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  accentStripe?: boolean
  variant?: 'default' | 'compact'
  loading?: boolean
  className?: string
}

function StatCardSkeleton({ variant }: { variant: 'default' | 'compact' }) {
  const isDefault = variant === 'default'
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className={`w-[60px] ${isDefault ? 'h-8' : 'h-7'}`} />
      <div className="mt-1">
        <Skeleton className={`w-[100px] ${isDefault ? 'h-3' : 'h-[11px]'}`} />
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  accentStripe = true,
  variant = 'default',
  loading = false,
  className,
}: StatCardProps) {
  const isDefault = variant === 'default'

  return (
    <Card
      className={cn(
        'gap-0 rounded-none bg-card',
        isDefault
          ? cn(
              'border-[1.5px] border-border px-6 py-5',
              accentStripe && 'border-l-[3px] border-l-primary/60'
            )
          : 'border border-border px-5 py-4',
        className
      )}
    >
      {loading ? (
        <StatCardSkeleton variant={variant} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon size={20} className="text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  'uppercase tracking-wide font-sans',
                  isDefault
                    ? 'text-sm sm:text-xs font-medium text-muted-foreground'
                    : 'text-sm sm:text-xs font-normal text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          </div>

          <span
            className={cn(
              'block font-archivo leading-[1.1] text-foreground',
              isDefault ? 'text-[32px] font-bold' : 'text-[28px] font-semibold'
            )}
          >
            {value === null || value === undefined ? '—' : value}
          </span>

          {subValue && (
            <span
              className={cn(
                'block mt-1 font-sans',
                isDefault
                  ? 'text-sm sm:text-xs text-muted-foreground'
                  : 'text-sm sm:text-[11px] text-muted-foreground'
              )}
            >
              {subValue}
            </span>
          )}
        </>
      )}
    </Card>
  )
}

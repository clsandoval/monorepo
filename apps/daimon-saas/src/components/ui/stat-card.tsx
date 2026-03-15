'use client'

import * as React from 'react'
import { Skeleton } from './skeleton'

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

  const containerStyle: React.CSSProperties = isDefault
    ? {
        background: '#FFFFFF',
        border: '1.5px solid rgba(12,31,64,0.12)',
        borderLeft: accentStripe ? '3px solid rgba(180,231,221,0.6)' : '1.5px solid rgba(12,31,64,0.12)',
        padding: '20px 24px',
      }
    : {
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        padding: '16px 20px',
      }

  return (
    <div style={containerStyle} className={className}>
      {loading ? (
        <StatCardSkeleton variant={variant} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon size={20} className="text-[rgba(12,31,64,0.45)] flex-shrink-0" />
              )}
              <span
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: isDefault ? 500 : 400,
                  color: isDefault ? 'rgba(12,31,64,0.55)' : '#6B7280',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </div>
          </div>

          <span
            className="block font-archivo"
            style={{
              fontSize: isDefault ? '32px' : '28px',
              fontWeight: isDefault ? 700 : 600,
              lineHeight: '1.1',
              color: '#0C1F40',
              fontVariationSettings: isDefault ? '"wdth" 125' : '"wdth" 112.5',
            }}
          >
            {value === null || value === undefined ? '—' : value}
          </span>

          {subValue && (
            <span
              className="block mt-1"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: isDefault ? '12px' : '11px',
                fontWeight: 400,
                color: isDefault ? 'rgba(12,31,64,0.45)' : '#9CA3AF',
              }}
            >
              {subValue}
            </span>
          )}
        </>
      )}
    </div>
  )
}

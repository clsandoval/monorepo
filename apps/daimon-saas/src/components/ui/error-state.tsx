'use client'

import * as React from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  error?: Error | string
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

export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this content. Please try again.",
  onRetry,
  error,
  size = 'md',
  className,
}: ErrorStateProps) {
  const cfg = sizeConfig[size]
  const isDev = process.env.NODE_ENV === 'development'
  const errorMessage =
    isDev && error
      ? typeof error === 'string'
        ? error
        : error.stack ?? error.message
      : null

  return (
    <div
      className={`flex flex-col items-center text-center w-full mx-auto max-w-[360px] ${cfg.container}${className ? ` ${className}` : ''}`}
    >
      <div
        className={`flex items-center justify-center ${cfg.iconBox}`}
        style={{
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.20)',
          borderRadius: 0,
          color: '#DC2626',
        }}
      >
        <AlertCircle size={cfg.iconSize} />
      </div>

      <p
        className={`${cfg.titleClass} mb-1.5`}
        style={{ color: '#0C1F40' }}
      >
        {title}
      </p>

      <p
        className={`${cfg.descClass} max-w-[280px]${onRetry ? ' mb-5' : ''}`}
        style={{ color: 'rgba(12,31,64,0.55)', lineHeight: 1.6 }}
      >
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors cursor-pointer px-4 rounded-none bg-transparent border border-[#0C1F40] text-[#0C1F40] hover:bg-[rgba(12,31,64,0.05)]"
          style={{ height: 38 }}
        >
          <RotateCw size={14} />
          Try again
        </button>
      )}

      {errorMessage && (
        <pre
          className="font-mono text-[11px] text-left break-words mt-4 max-w-[400px] overflow-y-auto"
          style={{
            color: 'rgba(220,38,38,0.75)',
            background: 'rgba(220,38,38,0.04)',
            border: '1px solid rgba(220,38,38,0.15)',
            padding: '8px 12px',
            maxHeight: 120,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {errorMessage}
        </pre>
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
      className={cn(
        'flex flex-col items-center text-center w-full mx-auto max-w-[360px]',
        cfg.container,
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center bg-destructive/[0.06] border border-destructive/20 text-destructive',
          cfg.iconBox
        )}
      >
        <AlertCircle size={cfg.iconSize} />
      </div>

      <p className={cn(cfg.titleClass, 'mb-1.5 text-foreground')}>
        {title}
      </p>

      <p
        className={cn(
          cfg.descClass,
          'max-w-[280px] text-muted-foreground leading-relaxed',
          onRetry && 'mb-5'
        )}
      >
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5"
        >
          <RotateCw size={14} />
          Try again
        </Button>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mt-4 max-w-[400px] text-left">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>
            <pre className="font-mono text-[11px] break-words max-h-[120px] overflow-y-auto whitespace-pre-wrap">
              {errorMessage}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

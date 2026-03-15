'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface AlertBannerProps {
  variant: AlertVariant
  title: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  className?: string
}

const VARIANT_STYLES: Record<
  AlertVariant,
  { container: string; icon: string; title: string; desc: string; action: string; Icon: React.ElementType }
> = {
  error: {
    container: 'border-l-[3px] border-destructive bg-red-50 rounded-none border-y-0 border-r-0',
    icon: 'text-destructive',
    title: 'text-red-950',
    desc: 'text-red-950/75',
    action: 'text-destructive',
    Icon: AlertCircle,
  },
  warning: {
    container: 'border-l-[3px] border-amber-600 bg-amber-50 rounded-none border-y-0 border-r-0',
    icon: 'text-amber-600',
    title: 'text-amber-950',
    desc: 'text-amber-950/75',
    action: 'text-amber-600',
    Icon: AlertTriangle,
  },
  success: {
    container: 'border-l-[3px] border-green-600 bg-green-50 rounded-none border-y-0 border-r-0',
    icon: 'text-green-600',
    title: 'text-green-950',
    desc: 'text-green-950/75',
    action: 'text-green-600',
    Icon: CheckCircle,
  },
  info: {
    container: 'border-l-[3px] border-primary bg-primary/20 rounded-none border-y-0 border-r-0',
    icon: 'text-foreground',
    title: 'text-foreground',
    desc: 'text-foreground/65',
    action: 'text-foreground',
    Icon: Info,
  },
}

export function AlertBanner({
  variant,
  title,
  description,
  dismissible = false,
  onDismiss,
  action,
  icon,
  className,
}: AlertBannerProps) {
  const [dismissing, setDismissing] = useState(false)

  const styles = VARIANT_STYLES[variant]
  const DefaultIcon = styles.Icon

  function handleDismiss() {
    setDismissing(true)
    setTimeout(() => {
      onDismiss?.()
    }, 200)
  }

  return (
    <Alert
      className={cn(
        styles.container,
        'flex items-start gap-3 px-4 py-3.5 w-full shadow-none transition-all duration-200 ease-in',
        dismissing && 'opacity-0 max-h-0 py-0 overflow-hidden',
        !dismissing && 'opacity-100 max-h-[500px]',
        className,
      )}
    >
      <span className={cn('shrink-0 mt-px flex items-center', styles.icon)}>
        {icon ?? <DefaultIcon className="size-4" />}
      </span>

      <div className="flex-1 min-w-0">
        <AlertTitle className={cn('text-sm font-semibold leading-snug', styles.title)}>
          {title}
        </AlertTitle>
        {description && (
          <AlertDescription className={cn('text-[13px] mt-0.5 leading-snug', styles.desc)}>
            {description}
          </AlertDescription>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              'text-[13px] font-semibold underline cursor-pointer block mt-1.5 bg-transparent border-none p-0 hover:opacity-75 transition-opacity',
              styles.action,
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={handleDismiss}
          className={cn(
            'shrink-0 size-5 flex items-center justify-center bg-transparent border-none cursor-pointer mt-px p-0 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            styles.icon,
          )}
        >
          <X className="size-3.5" />
        </button>
      )}
    </Alert>
  )
}

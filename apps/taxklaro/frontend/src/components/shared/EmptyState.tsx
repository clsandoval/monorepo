import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
  secondaryCtaLabel?: string
  onSecondaryCta?: () => void
  className?: string
  // Legacy compat props (message maps to description)
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  secondaryCtaLabel,
  onSecondaryCta,
  className,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const resolvedDescription = description ?? message
  const resolvedCtaLabel = ctaLabel ?? actionLabel
  const resolvedOnCta = onCta ?? onAction

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-zinc-100 mb-1">{title}</h3>
      )}
      {resolvedDescription && (
        <p className="text-sm text-zinc-500 mb-4 max-w-sm">{resolvedDescription}</p>
      )}
      <div className="flex gap-2">
        {resolvedCtaLabel && resolvedOnCta && (
          <Button onClick={resolvedOnCta}>{resolvedCtaLabel}</Button>
        )}
        {secondaryCtaLabel && onSecondaryCta && (
          <Button variant="outline" onClick={onSecondaryCta}>{secondaryCtaLabel}</Button>
        )}
      </div>
    </div>
  )
}

export default EmptyState

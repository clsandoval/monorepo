import { cn } from '@/lib/utils'

export type IndicatorStatus = 'connected' | 'connecting' | 'error' | 'disconnected' | 'suspended'

export interface StatusIndicatorProps {
  status: IndicatorStatus
  label?: string
  showLabel?: boolean
  className?: string
}

const DOT_CLASSES: Record<IndicatorStatus, string> = {
  connected:    'bg-[#22C55E] status-dot-connected',
  connecting:   'bg-[#F59E0B] status-dot-connecting',
  error:        'bg-[#EF4444]',
  disconnected: 'bg-foreground/25',
  suspended:    'bg-foreground/40',
}

const DEFAULT_LABELS: Record<IndicatorStatus, string> = {
  connected:    'Connected',
  connecting:   'Connecting',
  error:        'Connection Error',
  disconnected: 'Disconnected',
  suspended:    'Suspended',
}

export function StatusIndicator({
  status,
  label,
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const displayLabel = label ?? DEFAULT_LABELS[status]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn('h-3 w-3 shrink-0 rounded-full', DOT_CLASSES[status])}
        role="img"
        aria-label={`Status: ${displayLabel}`}
      />
      {showLabel && (
        <span className="text-[15px] text-foreground">
          {displayLabel}
        </span>
      )}
    </div>
  )
}

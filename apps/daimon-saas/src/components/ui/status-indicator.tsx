export type IndicatorStatus = 'connected' | 'connecting' | 'error' | 'disconnected' | 'suspended'

export interface StatusIndicatorProps {
  status: IndicatorStatus
  label?: string
  dotSize?: number
  labelSize?: number
  showLabel?: boolean
  className?: string
}

const DOT_COLORS: Record<IndicatorStatus, string> = {
  connected:    '#22C55E',
  connecting:   '#F59E0B',
  error:        '#EF4444',
  disconnected: 'rgba(12,31,64,0.25)',
  suspended:    'rgba(12,31,64,0.40)',
}

const DEFAULT_LABELS: Record<IndicatorStatus, string> = {
  connected:    'Connected',
  connecting:   'Connecting',
  error:        'Connection Error',
  disconnected: 'Disconnected',
  suspended:    'Suspended',
}

const ANIMATION_CLASSES: Record<IndicatorStatus, string> = {
  connected:    'status-dot-connected',
  connecting:   'status-dot-connecting',
  error:        '',
  disconnected: '',
  suspended:    '',
}

export function StatusIndicator({
  status,
  label,
  dotSize = 12,
  labelSize = 14,
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const displayLabel = label ?? DEFAULT_LABELS[status]

  return (
    <div className={['flex items-center gap-[10px]', className ?? ''].filter(Boolean).join(' ')}>
      <span
        className={['flex-shrink-0 rounded-full', ANIMATION_CLASSES[status]].filter(Boolean).join(' ')}
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: DOT_COLORS[status],
        }}
        role="img"
        aria-label={`Status: ${displayLabel}`}
      />
      {showLabel && (
        <span style={{ fontSize: labelSize }}>
          {displayLabel}
        </span>
      )}
    </div>
  )
}

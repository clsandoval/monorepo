export type BadgeVariant =
  | 'plan-free'
  | 'plan-starter'
  | 'plan-pro'
  | 'status-pending'
  | 'status-configured'
  | 'status-active'
  | 'status-suspended'
  | 'key-valid'
  | 'key-invalid'
  | 'key-unconfigured'
  | 'key-validating'
  | 'connection-connected'
  | 'connection-connecting'
  | 'connection-error'
  | 'connection-disconnected'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

interface BadgeConfig {
  defaultLabel: string
  background: string
  color: string
  border?: string
}

const BADGE_CONFIGS: Record<BadgeVariant, BadgeConfig> = {
  'plan-free': {
    defaultLabel: 'FREE',
    background: 'rgba(12,31,64,0.08)',
    color: 'rgba(12,31,64,0.65)',
    border: '1.5px solid rgba(12,31,64,0.15)',
  },
  'plan-starter': {
    defaultLabel: 'STARTER',
    background: 'rgba(180,231,221,0.20)',
    color: '#0C1F40',
    border: '1.5px solid rgba(180,231,221,0.60)',
  },
  'plan-pro': {
    defaultLabel: 'PRO',
    background: '#0C1F40',
    color: '#FFFFFF',
  },
  'status-pending': {
    defaultLabel: 'PENDING',
    background: '#FEF9C3',
    color: '#854D0E',
  },
  'status-configured': {
    defaultLabel: 'CONFIGURED',
    background: '#DBEAFE',
    color: '#1E40AF',
  },
  'status-active': {
    defaultLabel: 'ACTIVE',
    background: 'rgba(34,197,94,0.12)',
    color: '#16A34A',
  },
  'status-suspended': {
    defaultLabel: 'SUSPENDED',
    background: 'rgba(239,68,68,0.12)',
    color: '#DC2626',
  },
  'key-valid': {
    defaultLabel: 'VALID',
    background: 'rgba(34,197,94,0.12)',
    color: '#16A34A',
    border: '1.5px solid rgba(34,197,94,0.30)',
  },
  'key-invalid': {
    defaultLabel: 'INVALID',
    background: 'rgba(239,68,68,0.12)',
    color: '#DC2626',
    border: '1.5px solid rgba(239,68,68,0.30)',
  },
  'key-unconfigured': {
    defaultLabel: 'NOT CONFIGURED',
    background: 'rgba(12,31,64,0.08)',
    color: 'rgba(12,31,64,0.55)',
    border: '1.5px solid rgba(12,31,64,0.15)',
  },
  'key-validating': {
    defaultLabel: 'CHECKING…',
    background: 'rgba(245,158,11,0.12)',
    color: '#D97706',
    border: '1.5px solid rgba(245,158,11,0.30)',
  },
  'connection-connected': {
    defaultLabel: 'CONNECTED',
    background: 'rgba(34,197,94,0.12)',
    color: '#16A34A',
    border: '1.5px solid rgba(34,197,94,0.30)',
  },
  'connection-connecting': {
    defaultLabel: 'CONNECTING',
    background: 'rgba(245,158,11,0.12)',
    color: '#D97706',
    border: '1.5px solid rgba(245,158,11,0.30)',
  },
  'connection-error': {
    defaultLabel: 'ERROR',
    background: 'rgba(239,68,68,0.12)',
    color: '#DC2626',
    border: '1.5px solid rgba(239,68,68,0.30)',
  },
  'connection-disconnected': {
    defaultLabel: 'DISCONNECTED',
    background: 'rgba(12,31,64,0.08)',
    color: 'rgba(12,31,64,0.55)',
    border: '1.5px solid rgba(12,31,64,0.15)',
  },
  neutral: {
    defaultLabel: '',
    background: 'rgba(12,31,64,0.08)',
    color: 'rgba(12,31,64,0.65)',
    border: '1.5px solid rgba(12,31,64,0.15)',
  },
  info: {
    defaultLabel: '',
    background: '#DBEAFE',
    color: '#1E40AF',
  },
  success: {
    defaultLabel: '',
    background: 'rgba(34,197,94,0.12)',
    color: '#16A34A',
  },
  warning: {
    defaultLabel: '',
    background: 'rgba(245,158,11,0.12)',
    color: '#D97706',
  },
  danger: {
    defaultLabel: '',
    background: 'rgba(239,68,68,0.12)',
    color: '#DC2626',
  },
}

export interface BadgeProps {
  variant: BadgeVariant
  label?: string
  size?: 'sm' | 'md'
  uppercase?: boolean
  className?: string
}

export function Badge({
  variant,
  label,
  size = 'sm',
  uppercase = true,
  className,
}: BadgeProps) {
  const config = BADGE_CONFIGS[variant]
  const displayLabel = label ?? config.defaultLabel

  return (
    <span
      className={[
        'inline-flex items-center whitespace-nowrap font-semibold leading-none',
        size === 'sm'
          ? 'text-[11px] px-[8px] py-[2px] tracking-[0.05em]'
          : 'text-[13px] px-[10px] py-[3px] tracking-[0.03em]',
        uppercase ? 'uppercase' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      style={{
        background: config.background,
        color: config.color,
        border: config.border ?? 'none',
        borderRadius: '0px',
      }}
    >
      {displayLabel}
    </span>
  )
}

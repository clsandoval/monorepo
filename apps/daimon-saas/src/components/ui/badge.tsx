import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

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

const badgeVariants = cva(
  'inline-flex items-center whitespace-nowrap font-semibold leading-none rounded-none',
  {
    variants: {
      variant: {
        'plan-free':
          'bg-[rgba(12,31,64,0.08)] text-[rgba(12,31,64,0.65)] border-[1.5px] border-[rgba(12,31,64,0.15)]',
        'plan-starter':
          'bg-[rgba(180,231,221,0.20)] text-foreground border-[1.5px] border-[rgba(180,231,221,0.60)]',
        'plan-pro':
          'bg-foreground text-white border-0',
        'status-pending':
          'bg-[#FEF9C3] text-[#854D0E] border-0',
        'status-configured':
          'bg-[#DBEAFE] text-[#1E40AF] border-0',
        'status-active':
          'bg-[rgba(34,197,94,0.12)] text-[#16A34A] border-0',
        'status-suspended':
          'bg-[rgba(239,68,68,0.12)] text-destructive border-0',
        'key-valid':
          'bg-[rgba(34,197,94,0.12)] text-[#16A34A] border-[1.5px] border-[rgba(34,197,94,0.30)]',
        'key-invalid':
          'bg-[rgba(239,68,68,0.12)] text-destructive border-[1.5px] border-[rgba(239,68,68,0.30)]',
        'key-unconfigured':
          'bg-[rgba(12,31,64,0.08)] text-[rgba(12,31,64,0.55)] border-[1.5px] border-[rgba(12,31,64,0.15)]',
        'key-validating':
          'bg-[rgba(245,158,11,0.12)] text-[#D97706] border-[1.5px] border-[rgba(245,158,11,0.30)]',
        'connection-connected':
          'bg-[rgba(34,197,94,0.12)] text-[#16A34A] border-[1.5px] border-[rgba(34,197,94,0.30)]',
        'connection-connecting':
          'bg-[rgba(245,158,11,0.12)] text-[#D97706] border-[1.5px] border-[rgba(245,158,11,0.30)]',
        'connection-error':
          'bg-[rgba(239,68,68,0.12)] text-destructive border-[1.5px] border-[rgba(239,68,68,0.30)]',
        'connection-disconnected':
          'bg-[rgba(12,31,64,0.08)] text-[rgba(12,31,64,0.55)] border-[1.5px] border-[rgba(12,31,64,0.15)]',
        neutral:
          'bg-[rgba(12,31,64,0.08)] text-[rgba(12,31,64,0.65)] border-[1.5px] border-[rgba(12,31,64,0.15)]',
        info:
          'bg-[#DBEAFE] text-[#1E40AF] border-0',
        success:
          'bg-[rgba(34,197,94,0.12)] text-[#16A34A] border-0',
        warning:
          'bg-[rgba(245,158,11,0.12)] text-[#D97706] border-0',
        danger:
          'bg-[rgba(239,68,68,0.12)] text-destructive border-0',
      },
      size: {
        sm: 'text-sm px-2 py-[2px] tracking-[0.05em]',
        md: 'text-sm px-[10px] py-[3px] tracking-[0.03em]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'sm',
    },
  }
)

const DEFAULT_LABELS: Record<BadgeVariant, string> = {
  'plan-free': 'FREE',
  'plan-starter': 'STARTER',
  'plan-pro': 'PRO',
  'status-pending': 'PENDING',
  'status-configured': 'CONFIGURED',
  'status-active': 'ACTIVE',
  'status-suspended': 'SUSPENDED',
  'key-valid': 'VALID',
  'key-invalid': 'INVALID',
  'key-unconfigured': 'NOT CONFIGURED',
  'key-validating': 'CHECKING…',
  'connection-connected': 'CONNECTED',
  'connection-connecting': 'CONNECTING',
  'connection-error': 'ERROR',
  'connection-disconnected': 'DISCONNECTED',
  neutral: '',
  info: '',
  success: '',
  warning: '',
  danger: '',
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
  const displayLabel = label ?? DEFAULT_LABELS[variant]

  return (
    <span
      className={cn(
        badgeVariants({ variant, size }),
        uppercase && 'uppercase',
        className
      )}
    >
      {displayLabel}
    </span>
  )
}

export { badgeVariants }

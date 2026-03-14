'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import {
  ClockIcon,
  ZapIcon,
  ZapOffIcon,
  AlertTriangleIcon,
  KeyIcon,
  KeyRoundIcon,
  PlugIcon,
  PlugZapIcon,
  CreditCardIcon,
  UserIcon,
  ActivityIcon,
} from 'lucide-react'
import { EmptyState } from './empty-state'
import { Skeleton } from './skeleton-loader'

export type ActivityEventType =
  | 'bot_connected'
  | 'bot_disconnected'
  | 'bot_error'
  | 'api_key_added'
  | 'api_key_invalid'
  | 'service_connected'
  | 'service_expired'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'account_created'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  timestamp: string
  description: string
  metadata?: {
    serviceName?: string
    planName?: string
    errorMessage?: string
  }
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  maxItems?: number
  showHeader?: boolean
  loading?: boolean
  className?: string
}

const EVENT_CONFIGS: Record<
  ActivityEventType,
  { Icon: React.ComponentType<{ size?: number }>; iconBg: string }
> = {
  bot_connected: { Icon: ZapIcon, iconBg: 'rgba(34,197,94,0.12)' },
  bot_disconnected: { Icon: ZapOffIcon, iconBg: 'rgba(239,68,68,0.12)' },
  bot_error: { Icon: AlertTriangleIcon, iconBg: 'rgba(239,68,68,0.12)' },
  api_key_added: { Icon: KeyIcon, iconBg: 'rgba(180,231,221,0.30)' },
  api_key_invalid: { Icon: KeyRoundIcon, iconBg: 'rgba(239,68,68,0.12)' },
  service_connected: { Icon: PlugIcon, iconBg: 'rgba(180,231,221,0.30)' },
  service_expired: { Icon: PlugZapIcon, iconBg: 'rgba(245,158,11,0.12)' },
  plan_upgraded: { Icon: CreditCardIcon, iconBg: 'rgba(180,231,221,0.30)' },
  plan_downgraded: { Icon: CreditCardIcon, iconBg: 'rgba(245,158,11,0.12)' },
  account_created: { Icon: UserIcon, iconBg: 'rgba(159,170,226,0.30)' },
}

function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now()
  const then = new Date(isoTimestamp).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  const d = new Date(isoTimestamp)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function ActivityFeedSkeleton() {
  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(12,31,64,0.12)', padding: '24px 28px' }}>
      <div className="border-b pb-4 mb-0" style={{ borderColor: 'rgba(12,31,64,0.06)' }}>
        <Skeleton width={140} height={16} />
      </div>
      <ul className="mt-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-start gap-3 py-3">
            <Skeleton width={32} height={32} />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton width="70%" height={14} />
              <Skeleton width="40%" height={12} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ActivityFeed({
  events,
  maxItems = 10,
  showHeader = true,
  loading = false,
  className,
}: ActivityFeedProps) {
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <ActivityFeedSkeleton />

  const displayEvents = events.slice(0, maxItems)

  return (
    <div
      style={{ background: '#FFFFFF', border: '1.5px solid rgba(12,31,64,0.12)', padding: '24px 28px' }}
      className={className}
    >
      {showHeader && (
        <div
          className="flex items-center gap-2 border-b pb-4 mb-0"
          style={{ borderColor: 'rgba(12,31,64,0.06)' }}
        >
          <ClockIcon size={16} className="text-[rgba(12,31,64,0.45)]" />
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0C1F40',
            }}
          >
            Recent Activity
          </span>
        </div>
      )}

      {displayEvents.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={<ActivityIcon size={40} style={{ color: 'rgba(12,31,64,0.20)' }} />}
            title="No activity yet"
            description="Activity will appear here once your bot is connected and running."
          />
        </div>
      ) : (
        <ul
          className="divide-y"
          style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}
          role="list"
          aria-label="Recent activity feed"
        >
          {displayEvents.map((event) => {
            const config = EVENT_CONFIGS[event.type]
            return (
              <li key={event.id} className="flex items-start gap-3 py-3" style={{ borderColor: 'rgba(12,31,64,0.04)' }}>
                <div
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                  style={{ background: config.iconBg }}
                  aria-hidden="true"
                >
                  <config.Icon size={16} />
                </div>
                <span
                  className="flex-1"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#0C1F40',
                    lineHeight: '1.5',
                  }}
                >
                  {event.description}
                </span>
                <time
                  className="flex-shrink-0 self-start whitespace-nowrap"
                  dateTime={event.timestamp}
                  title={event.timestamp}
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgba(12,31,64,0.45)',
                  }}
                >
                  {formatRelativeTime(event.timestamp)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

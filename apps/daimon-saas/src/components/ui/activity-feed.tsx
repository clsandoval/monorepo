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
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EmptyState } from './empty-state'
import { Skeleton } from './skeleton'

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
  { Icon: React.ComponentType<{ size?: number }>; iconClass: string }
> = {
  bot_connected: { Icon: ZapIcon, iconClass: 'bg-green-500/10' },
  bot_disconnected: { Icon: ZapOffIcon, iconClass: 'bg-destructive/10' },
  bot_error: { Icon: AlertTriangleIcon, iconClass: 'bg-destructive/10' },
  api_key_added: { Icon: KeyIcon, iconClass: 'bg-primary/30' },
  api_key_invalid: { Icon: KeyRoundIcon, iconClass: 'bg-destructive/10' },
  service_connected: { Icon: PlugIcon, iconClass: 'bg-primary/30' },
  service_expired: { Icon: PlugZapIcon, iconClass: 'bg-amber-500/10' },
  plan_upgraded: { Icon: CreditCardIcon, iconClass: 'bg-primary/30' },
  plan_downgraded: { Icon: CreditCardIcon, iconClass: 'bg-amber-500/10' },
  account_created: { Icon: UserIcon, iconClass: 'bg-secondary/30' },
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
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[140px]" />
      </CardHeader>
      <CardContent>
        <ul className="mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3 py-3">
              <Skeleton className="h-8 w-8" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-3.5 w-[70%]" />
                <Skeleton className="h-3 w-[40%]" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
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
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClockIcon size={16} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Recent Activity
            </span>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {displayEvents.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<ActivityIcon size={40} className="text-muted-foreground/40" />}
              title="No activity yet"
              description="Activity will appear here once your bot is connected and running."
            />
          </div>
        ) : (
          <ul
            className="divide-y divide-border"
            role="list"
            aria-label="Recent activity feed"
          >
            {displayEvents.map((event) => {
              const config = EVENT_CONFIGS[event.type]
              return (
                <li key={event.id} className="flex items-start gap-3 py-3">
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 flex items-center justify-center',
                      config.iconClass,
                    )}
                    aria-hidden="true"
                  >
                    <config.Icon size={16} />
                  </div>
                  <span className="flex-1 text-sm text-foreground leading-relaxed">
                    {event.description}
                  </span>
                  <time
                    className="flex-shrink-0 self-start whitespace-nowrap text-xs text-muted-foreground"
                    dateTime={event.timestamp}
                    title={event.timestamp}
                  >
                    {formatRelativeTime(event.timestamp)}
                  </time>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { StatusIndicator, type IndicatorStatus } from '@/components/ui/status-indicator'
import { Badge } from '@/components/ui/badge'

interface DiscordConnection {
  status: string
  last_heartbeat: string | null
  guild_id: string | null
  bot_username: string | null
}

interface DashboardStatusCardsProps {
  discord: DiscordConnection | null
  plan: 'free' | 'starter' | 'pro'
}

/** Derive bot indicator status from connection data.
 *  Online = connected status AND last_heartbeat within 90 seconds. */
function deriveBotStatus(discord: DiscordConnection | null): IndicatorStatus {
  if (!discord) return 'disconnected'

  const { status, last_heartbeat } = discord

  if (status === 'error') return 'error'
  if (status === 'connecting') return 'connecting'
  if (status === 'suspended') return 'suspended'

  if (status === 'connected') {
    if (!last_heartbeat) return 'connected'
    const secondsAgo = (Date.now() - new Date(last_heartbeat).getTime()) / 1000
    return secondsAgo <= 90 ? 'connected' : 'error'
  }

  return 'disconnected'
}

export function DashboardStatusCards({ discord, plan }: DashboardStatusCardsProps) {
  const botStatus = deriveBotStatus(discord)

  const guildDisplay = discord?.guild_id
    ? discord.guild_id
    : null

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      {/* Bot Status */}
      <Card className="gap-0 rounded-none border-[1.5px] border-border bg-card px-6 py-5">
        <span className="block mb-3 text-xs font-medium text-muted-foreground uppercase tracking-[0.06em]">
          Bot Status
        </span>
        <StatusIndicator
          status={botStatus}
          showLabel
        />
      </Card>

      {/* Current Plan */}
      <Card className="gap-0 rounded-none border-[1.5px] border-border bg-card px-6 py-5">
        <span className="block mb-3 text-xs font-medium text-muted-foreground uppercase tracking-[0.06em]">
          Current Plan
        </span>
        <Badge variant={`plan-${plan}`} size="md" />
      </Card>

      {/* Discord Connection */}
      <Card className="gap-0 rounded-none border-[1.5px] border-border bg-card px-6 py-5">
        <span className="block mb-3 text-xs font-medium text-muted-foreground uppercase tracking-[0.06em]">
          Discord Connection
        </span>
        {guildDisplay ? (
          <span className="text-sm font-medium text-foreground">
            {guildDisplay}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Not connected
          </span>
        )}
      </Card>
    </div>
  )
}

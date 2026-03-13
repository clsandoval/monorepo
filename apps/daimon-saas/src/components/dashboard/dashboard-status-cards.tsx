'use client'

import * as React from 'react'
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

const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid rgba(12,31,64,0.12)',
  borderRadius: '0px',
  padding: '20px 24px',
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  fontSize: '12px',
  fontWeight: 500,
  color: 'rgba(12,31,64,0.55)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

export function DashboardStatusCards({ discord, plan }: DashboardStatusCardsProps) {
  const botStatus = deriveBotStatus(discord)

  const guildDisplay = discord?.guild_id
    ? discord.guild_id
    : null

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
    >
      {/* Bot Status */}
      <div style={CARD_STYLE}>
        <span className="block mb-3" style={LABEL_STYLE}>
          Bot Status
        </span>
        <StatusIndicator
          status={botStatus}
          dotSize={12}
          labelSize={15}
          showLabel
        />
      </div>

      {/* Current Plan */}
      <div style={CARD_STYLE}>
        <span className="block mb-3" style={LABEL_STYLE}>
          Current Plan
        </span>
        <Badge variant={`plan-${plan}`} size="md" />
      </div>

      {/* Discord Connection */}
      <div style={CARD_STYLE}>
        <span className="block mb-3" style={LABEL_STYLE}>
          Discord Connection
        </span>
        {guildDisplay ? (
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0C1F40',
            }}
          >
            {guildDisplay}
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: 'rgba(12,31,64,0.45)',
            }}
          >
            Not connected
          </span>
        )}
      </div>
    </div>
  )
}

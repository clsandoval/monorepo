import * as React from 'react'
import { MessageSquare, Wrench, Activity } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

interface QuickStatsRowProps {
  messagesToday: number | null
  toolUsesToday: number | null
  /** ISO string of discord_connections.connected_at — null if bot is not connected */
  connectedAt: string | null
  botConnected: boolean
}

function formatUptime(connectedAt: string): string {
  const now = Date.now()
  const start = new Date(connectedAt).getTime()
  let diffSeconds = Math.max(0, Math.floor((now - start) / 1000))

  const days = Math.floor(diffSeconds / 86400)
  diffSeconds -= days * 86400
  const hours = Math.floor(diffSeconds / 3600)
  diffSeconds -= hours * 3600
  const minutes = Math.floor(diffSeconds / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function QuickStatsRow({
  messagesToday,
  toolUsesToday,
  connectedAt,
  botConnected,
}: QuickStatsRowProps) {
  const uptimeValue =
    botConnected && connectedAt ? formatUptime(connectedAt) : '—'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
      }}
      className="max-sm:grid-cols-1"
    >
      <StatCard
        label="Messages Today"
        value={messagesToday !== null ? String(messagesToday) : '—'}
        subValue="in the last 24 hours"
        icon={MessageSquare}
        accentStripe
      />

      <StatCard
        label="Tool Uses Today"
        value={toolUsesToday !== null ? String(toolUsesToday) : '—'}
        subValue="commands executed"
        icon={Wrench}
        accentStripe
      />

      <StatCard
        label="Uptime"
        value={uptimeValue}
        subValue="since last connection"
        icon={Activity}
        accentStripe
      />
    </div>
  )
}

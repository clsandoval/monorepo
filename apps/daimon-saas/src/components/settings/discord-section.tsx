'use client'

import { DiscordSection } from '@/components/integrations/discord-connection-card'
import type { DiscordConnection } from '@/components/integrations/discord-connection-card'

interface SettingsDiscordSectionProps {
  tenantId: string
  userRole: 'owner' | 'admin' | 'member'
  connections: DiscordConnection[]
}

export function SettingsDiscordSection({
  tenantId,
  userRole,
  connections,
}: SettingsDiscordSectionProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '0px',
        marginBottom: '24px',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '24px 32px 20px 32px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C1F40',
            marginBottom: '4px',
          }}
        >
          Discord Connection
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#6B7280',
            margin: 0,
          }}
        >
          Manage your Discord bot connections. Each connection links a bot token to a Discord server.
        </p>
      </div>

      {/* Card body */}
      <div style={{ padding: '24px 32px 32px 32px' }}>
        <DiscordSection
          tenantId={tenantId}
          userRole={userRole}
          connections={connections}
        />
      </div>
    </div>
  )
}

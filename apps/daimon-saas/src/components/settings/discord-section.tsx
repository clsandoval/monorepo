'use client'

import { DiscordSection } from '@/components/integrations/discord-connection-card'
import type { DiscordConnection } from '@/components/integrations/discord-connection-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-foreground">
          Discord Connection
        </CardTitle>
        <CardDescription>
          Manage your Discord bot connections. Each connection links a bot token to a Discord server.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DiscordSection
          tenantId={tenantId}
          userRole={userRole}
          connections={connections}
        />
      </CardContent>
    </Card>
  )
}

'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SettingsDangerZoneSectionProps {
  tenantName: string
  discordConnectionCount: number
  memberCount: number
}

export function SettingsDangerZoneSection({
  tenantName,
  discordConnectionCount,
  memberCount,
}: SettingsDangerZoneSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [modalOpen, setModalOpen] = React.useState(false)

  async function handleDelete() {
    const res = await fetch('/api/settings/workspace', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Failed to delete workspace. Please try again.')
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/?deleted=1')
  }

  return (
    <Card className="border-destructive">
      <CardHeader className="border-b border-destructive">
        <CardTitle className="font-heading text-lg text-destructive">
          Danger Zone
        </CardTitle>
        <CardDescription>
          These actions are permanent and cannot be undone.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">
              Delete Workspace
            </h4>
            <p className="mt-1 max-w-[480px] text-[13px] text-muted-foreground">
              Permanently delete this workspace, all Discord connections, API keys, service
              integrations, and billing data. This cannot be reversed.
            </p>
          </div>
          <Button
            id="delete-workspace-btn"
            variant="destructive"
            onClick={() => setModalOpen(true)}
            className="shrink-0"
          >
            Delete Workspace
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        variant="danger"
        title="Delete Workspace"
        description={`This permanently deletes ${tenantName} and all associated data including ${discordConnectionCount} Discord connection${discordConnectionCount !== 1 ? 's' : ''}, API keys, service integrations, ${memberCount} team member${memberCount !== 1 ? 's' : ''}, and billing data. This cannot be reversed.`}
        confirmLabel="Delete Workspace"
        confirmationText={tenantName}
        onConfirm={handleDelete}
      />
    </Card>
  )
}

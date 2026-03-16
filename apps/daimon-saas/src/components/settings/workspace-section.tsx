'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { Copy, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { SettingsDiscordSection } from '@/components/settings/discord-section'
import { SettingsAccountSection } from '@/components/settings/account-section'
import { SettingsDangerZoneSection } from '@/components/settings/danger-zone-section'
import type { DiscordConnection } from '@/components/integrations/discord-connection-card'

interface WorkspaceSectionProps {
  tenant: {
    id: string
    name: string
    created_at: string
  }
  userRole: 'owner' | 'admin' | 'member'
}

function WorkspaceSection({ tenant, userRole }: WorkspaceSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [name, setName] = React.useState(tenant.name)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const isDisabled = userRole === 'member'
  const hasChanged = name !== tenant.name && name.trim().length > 0

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(tenant.created_at))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!hasChanged || isDisabled) return

    if (name.trim().length === 0) {
      setError('Workspace name is required.')
      return
    }
    if (name.length > 100) {
      setError('Workspace name must be 100 characters or less.')
      return
    }

    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save workspace name. Please try again.')
      }
      toast.success('Workspace name updated.')
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save workspace name. Please try again.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tenant.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: silent fail
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle className="font-heading text-lg font-semibold text-foreground">
          Workspace
        </CardTitle>
        <CardDescription>
          Manage your workspace name and view workspace details.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Workspace name form */}
        <form onSubmit={handleSave}>
          <div>
            <Label htmlFor="workspace-name" className="mb-1.5">Workspace Name</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                id="workspace-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                maxLength={100}
                required
                disabled={isDisabled}
                aria-label="Workspace name"
                aria-describedby="workspace-name-hint"
                title={isDisabled ? 'Only the workspace owner can perform this action.' : undefined}
                className={cn(
                  'w-full sm:w-80 h-10',
                  error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
                  isDisabled && 'cursor-not-allowed'
                )}
              />
              <Button
                id="workspace-name-save"
                type="submit"
                disabled={!hasChanged || isDisabled || saving}
                title={isDisabled ? 'Only the workspace owner can perform this action.' : undefined}
                size="lg"
                className="min-w-[80px] w-full sm:w-auto"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
            {error ? (
              <p id="workspace-name-error" className="mt-1.5 text-sm text-destructive">
                {error}
              </p>
            ) : (
              <p id="workspace-name-hint" className="mt-1.5 text-sm text-muted-foreground">
                Between 1 and 100 characters.
              </p>
            )}
          </div>
        </form>

        <Separator />

        {/* Workspace metadata */}
        <dl className="space-y-0">
          {/* Workspace ID */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2">
            <dt className="sm:min-w-[140px] shrink-0 text-sm font-medium text-muted-foreground">
              Workspace ID
            </dt>
            <dd className="flex items-center text-sm text-foreground">
              <span className="font-mono text-xs text-foreground break-all">
                {tenant.id}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        aria-label="Copy workspace ID"
                        className="ml-2 size-7 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                    }
                  />
                  <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </dd>
          </div>

          {/* Created date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2">
            <dt className="sm:min-w-[140px] shrink-0 text-sm font-medium text-muted-foreground">
              Created
            </dt>
            <dd className="text-sm text-foreground">
              {formattedDate}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

interface SettingsContentProps {
  tenant: {
    id: string
    name: string
    created_at: string
  }
  tenantId: string
  userRole: 'owner' | 'admin' | 'member'
  discordConnections: DiscordConnection[]
  userEmail: string
  userDisplayName: string
  memberCount: number
}

export function SettingsContent({ tenant, tenantId, userRole, discordConnections, userEmail, userDisplayName, memberCount }: SettingsContentProps) {
  return (
    <Tabs defaultValue="workspace">
      <TabsList variant="line" className="mb-6">
        <TabsTrigger value="workspace">Workspace</TabsTrigger>
        <TabsTrigger value="discord">Discord</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        {userRole === 'owner' && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
      </TabsList>

      <TabsContent value="workspace">
        <WorkspaceSection tenant={tenant} userRole={userRole} />
      </TabsContent>

      <TabsContent value="discord">
        <SettingsDiscordSection
          tenantId={tenantId}
          userRole={userRole}
          connections={discordConnections}
        />
      </TabsContent>

      <TabsContent value="account">
        <SettingsAccountSection userEmail={userEmail} userDisplayName={userDisplayName} />
      </TabsContent>

      {userRole === 'owner' && (
        <TabsContent value="danger">
          <SettingsDangerZoneSection
            tenantName={tenant.name}
            discordConnectionCount={discordConnections.length}
            memberCount={memberCount}
          />
        </TabsContent>
      )}
    </Tabs>
  )
}

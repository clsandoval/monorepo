'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export interface PlanComparisonGridProps {
  currentPlan: 'free' | 'starter' | 'pro'
  userRole: 'owner' | 'admin' | 'member'
  subscription: {
    current_period_end: string | null
  } | null
  discordConnectionCount: number
}

const MONTHLY_PRICES = {
  free: { display: '$0', amount: 0 },
  starter: { display: '$9', amount: 9 },
  pro: { display: '$29', amount: 29 },
}

const ANNUAL_PRICES = {
  free: { display: '$0', amount: 0 },
  starter: { display: '$6.58', amount: 6.58 },
  pro: { display: '$20.75', amount: 20.75 },
}

const ANNUAL_TOTALS = {
  starter: { total: '$79', savings: '$29' },
  pro: { total: '$249', savings: '$99' },
}

const PLAN_FEATURES: Record<'free' | 'starter' | 'pro', string[]> = {
  free: [
    '1 Discord connection',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Community support',
  ],
  starter: [
    'Up to 3 Discord connections',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Email support (response within 48 hours)',
  ],
  pro: [
    'Unlimited Discord connections',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Priority support (response within 24 hours)',
    '99.9% bot uptime SLA',
  ],
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface DowngradeDialogProps {
  targetPlan: 'free' | 'starter'
  currentPeriodEnd: string | null
  discordConnectionCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  loading: boolean
  error: string | null
}

function DowngradeDialog({
  targetPlan,
  currentPeriodEnd,
  discordConnectionCount,
  open,
  onOpenChange,
  onConfirm,
  loading,
  error,
}: DowngradeDialogProps) {
  const title = targetPlan === 'free' ? 'Downgrade to Free' : 'Downgrade to Starter'
  const periodDate = formatDate(currentPeriodEnd)

  const loseItems =
    targetPlan === 'free'
      ? [
          `Discord connections above 1 (you currently have ${discordConnectionCount})`,
          'Email support',
        ]
      : [
          `Discord connections above 3 (you currently have ${discordConnectionCount})`,
          'Priority support',
          '99.9% uptime SLA',
        ]

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col gap-4">
          <DialogDescription>
            Your plan will be downgraded to{' '}
            {targetPlan === 'free' ? 'Free' : 'Starter'} at the end of your current
            billing period on {periodDate}.
          </DialogDescription>

          <p className="text-sm text-muted-foreground">
            On the {targetPlan === 'free' ? 'Free' : 'Starter'} plan you will lose
            access to:
          </p>

          <ul className="list-disc pl-5">
            {loseItems.map((item) => (
              <li
                key={item}
                className="mb-1 text-sm text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>

          {targetPlan === 'free' && (
            <p className="text-sm text-muted-foreground">
              Additional connections will be disconnected automatically at the
              period end.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            {loading ? 'Confirming...' : 'Confirm Downgrade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type PlanKey = 'free' | 'starter' | 'pro'

export function PlanComparisonGrid({
  currentPlan,
  userRole,
  subscription,
  discordConnectionCount,
}: PlanComparisonGridProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly')
  const [upgradeLoading, setUpgradeLoading] = React.useState<PlanKey | null>(null)
  const [downgradeDialog, setDowngradeDialog] = React.useState<'free' | 'starter' | null>(null)
  const [downgradeLoading, setDowngradeLoading] = React.useState(false)
  const [downgradeError, setDowngradeError] = React.useState<string | null>(null)

  const isOwner = userRole === 'owner'
  const plans: PlanKey[] = ['free', 'starter', 'pro']

  async function handleUpgrade(targetPlan: 'starter' | 'pro') {
    setUpgradeLoading(targetPlan)
    try {
      const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
      const res = await fetch(`/api/billing/checkout?plan=${targetPlan}&cycle=${cycle}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
      window.location.href = data.url
    } catch {
      toast.error('Could not initiate checkout. Please try again.')
      setUpgradeLoading(null)
    }
  }

  async function handleDowngrade() {
    if (!downgradeDialog) return
    setDowngradeLoading(true)
    setDowngradeError(null)
    try {
      const res = await fetch('/api/billing/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: downgradeDialog }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to schedule downgrade')
      }
      setDowngradeDialog(null)
      router.refresh()
    } catch (err) {
      setDowngradeError(
        err instanceof Error
          ? err.message
          : 'Could not schedule downgrade. Please try again or contact support.'
      )
    } finally {
      setDowngradeLoading(false)
    }
  }

  function getPriceDisplay(plan: PlanKey) {
    if (billingCycle === 'annual') {
      return ANNUAL_PRICES[plan].display
    }
    return MONTHLY_PRICES[plan].display
  }

  function getCta(cardPlan: PlanKey) {
    if (!isOwner) return null

    const isCurrent = cardPlan === currentPlan

    if (isCurrent) {
      return (
        <Button variant="outline" disabled className="w-full">
          Current Plan
        </Button>
      )
    }

    const planRank: Record<PlanKey, number> = { free: 0, starter: 1, pro: 2 }
    const isUpgrade = planRank[cardPlan] > planRank[currentPlan]

    if (isUpgrade && (cardPlan === 'starter' || cardPlan === 'pro')) {
      const isLoading = upgradeLoading === cardPlan
      return (
        <Button
          onClick={() => handleUpgrade(cardPlan)}
          disabled={isLoading || upgradeLoading !== null}
          className="w-full"
        >
          {isLoading && <Loader2 className="size-3.5 animate-spin" />}
          {isLoading
            ? 'Opening Checkout...'
            : `Upgrade to ${cardPlan === 'starter' ? 'Starter' : 'Pro'} →`}
        </Button>
      )
    }

    if (cardPlan === 'free') {
      return (
        <Button
          variant="destructive"
          onClick={() => setDowngradeDialog('free')}
          className="w-full"
        >
          Downgrade to Free
        </Button>
      )
    }

    if (cardPlan === 'starter' && currentPlan === 'pro') {
      return (
        <Button
          variant="outline"
          onClick={() => setDowngradeDialog('starter')}
          className="w-full"
        >
          Downgrade to Starter
        </Button>
      )
    }

    return null
  }

  return (
    <div>
      {/* Section header + toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Compare Plans
        </p>

        {/* Slide toggle: Monthly / Annual */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm',
              billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Monthly
          </span>

          <Switch
            checked={billingCycle === 'annual'}
            onCheckedChange={(checked: boolean) =>
              setBillingCycle(checked ? 'annual' : 'monthly')
            }
            aria-label={`Switch to ${billingCycle === 'monthly' ? 'annual' : 'monthly'} billing`}
          />

          <span
            className={cn(
              'text-sm',
              billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Annual
          </span>
        </div>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const priceDisplay = getPriceDisplay(plan)
          const features = PLAN_FEATURES[plan]
          const isCurrent = plan === currentPlan

          return (
            <Card
              key={plan}
              className={cn(
                'flex flex-col',
                isCurrent && 'ring-2 ring-primary'
              )}
            >
              <CardContent className="flex flex-1 flex-col px-6 py-6">
                {/* Plan name */}
                <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                  {plan === 'free' ? 'Free' : plan === 'starter' ? 'Starter' : 'Pro'}
                  {isCurrent && (
                    <Badge variant="success" label="Current" className="ml-2 align-middle" />
                  )}
                </h3>

                {/* Monthly price */}
                <div className="mb-0.5 flex items-baseline gap-0.5">
                  <span className="font-heading text-[32px] font-bold text-foreground">
                    {priceDisplay}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /month
                  </span>
                </div>

                {/* Annual savings line */}
                {billingCycle === 'annual' && plan !== 'free' && (
                  <p className="mb-1 text-xs text-emerald-600">
                    {ANNUAL_TOTALS[plan as 'starter' | 'pro'].total} / year — save{' '}
                    {ANNUAL_TOTALS[plan as 'starter' | 'pro'].savings}
                  </p>
                )}

                {billingCycle === 'monthly' && plan !== 'free' && (
                  <p className="mb-1 text-xs text-emerald-600">
                    {plan === 'starter' ? '$79/yr' : '$249/yr'} billed annually — save{' '}
                    {plan === 'starter' ? '$29' : '$99'}
                  </p>
                )}

                <Separator className="my-3" />

                {/* Feature list */}
                <ul className="mb-5 flex flex-1 flex-col gap-1.5">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="inline-flex items-start gap-1.5 text-[13px] text-muted-foreground"
                    >
                      <CheckCircle
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isOwner ? getCta(plan) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Non-owner note */}
      {!isOwner && (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Contact your workspace owner to change your plan.
        </p>
      )}

      {/* Downgrade confirmation dialog */}
      {downgradeDialog && (
        <DowngradeDialog
          targetPlan={downgradeDialog}
          currentPeriodEnd={subscription?.current_period_end ?? null}
          discordConnectionCount={discordConnectionCount}
          open={!!downgradeDialog}
          onOpenChange={(open) => {
            if (!open && !downgradeLoading) {
              setDowngradeDialog(null)
              setDowngradeError(null)
            }
          }}
          onConfirm={handleDowngrade}
          loading={downgradeLoading}
          error={downgradeError}
        />
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

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
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
  error: string | null
}

function DowngradeDialog({
  targetPlan,
  currentPeriodEnd,
  discordConnectionCount,
  onClose,
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

  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !loading) onClose()
  }

  const dialog = (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="downgrade-dialog-title"
        style={{
          background: '#FFFFFF',
          borderRadius: 0,
          padding: '32px',
          width: '480px',
          maxWidth: '95vw',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h2
            id="downgrade-dialog-title"
            style={{
              fontFamily: 'var(--font-archivo), Archivo, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              color: '#0C1F40',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: 0,
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <hr style={{ borderColor: '#E5E7EB', margin: '0 0 16px' }} />

        {/* Body */}
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#374151',
            marginBottom: '16px',
          }}
        >
          Your plan will be downgraded to{' '}
          {targetPlan === 'free' ? 'Free' : 'Starter'} at the end of your current
          billing period on {periodDate}.
        </p>

        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          On the {targetPlan === 'free' ? 'Free' : 'Starter'} plan you will lose
          access to:
        </p>

        <ul
          style={{
            listStyle: 'disc',
            paddingLeft: '20px',
            marginBottom: '16px',
          }}
        >
          {loseItems.map((item) => (
            <li
              key={item}
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '4px',
              }}
            >
              {item}
            </li>
          ))}
        </ul>

        {targetPlan === 'free' && (
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: '#374151',
              marginBottom: '16px',
            }}
          >
            Additional connections will be disconnected automatically at the
            period end.
          </p>
        )}

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '13px',
              color: '#DC2626',
              marginBottom: '12px',
            }}
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: '#FFFFFF',
              color: '#0C1F40',
              border: '1px solid #0C1F40',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: 0,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: '#FFFFFF',
              color: '#DC2626',
              border: '1px solid #DC2626',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: 0,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Confirming...' : 'Confirm Downgrade'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

type PlanKey = 'free' | 'starter' | 'pro'

export function PlanComparisonGrid({
  currentPlan,
  userRole,
  subscription,
  discordConnectionCount,
}: PlanComparisonGridProps) {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly')
  const [upgradeLoading, setUpgradeLoading] = React.useState<PlanKey | null>(null)
  const [downgradeDialog, setDowngradeDialog] = React.useState<'free' | 'starter' | null>(null)
  const [downgradeLoading, setDowngradeLoading] = React.useState(false)
  const [downgradeError, setDowngradeError] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isOwner = userRole === 'owner'
  const plans: PlanKey[] = ['free', 'starter', 'pro']

  async function handleUpgrade(targetPlan: 'starter' | 'pro') {
    setUpgradeLoading(targetPlan)
    try {
      const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
      const res = await fetch(`/api/billing/checkout?plan=${targetPlan}&cycle=${cycle}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
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

  function getCardBorder(plan: PlanKey) {
    return plan === currentPlan
      ? '2px solid #B4E7DD'
      : '1px solid #E5E7EB'
  }

  function getCta(cardPlan: PlanKey) {
    if (!isOwner) return null

    const isCurrent = cardPlan === currentPlan

    if (isCurrent) {
      return (
        <button
          disabled
          style={{
            width: '100%',
            background: '#FFFFFF',
            color: '#9CA3AF',
            border: '1px solid #E5E7EB',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: 0,
            cursor: 'default',
            textAlign: 'center',
          }}
        >
          Current Plan
        </button>
      )
    }

    // Upgrade cards (target plan rank > current plan rank)
    const planRank: Record<PlanKey, number> = { free: 0, starter: 1, pro: 2 }
    const isUpgrade = planRank[cardPlan] > planRank[currentPlan]

    if (isUpgrade && (cardPlan === 'starter' || cardPlan === 'pro')) {
      const isLoading = upgradeLoading === cardPlan
      return (
        <button
          onClick={() => handleUpgrade(cardPlan)}
          disabled={isLoading || upgradeLoading !== null}
          style={{
            width: '100%',
            background: '#B4E7DD',
            color: '#0C1F40',
            border: 'none',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: 0,
            cursor: isLoading || upgradeLoading !== null ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background-color 150ms ease',
          }}
        >
          {isLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {isLoading
            ? 'Opening Checkout...'
            : `Upgrade to ${cardPlan === 'starter' ? 'Starter' : 'Pro'} →`}
        </button>
      )
    }

    // Downgrade — free card (ghost red)
    if (cardPlan === 'free') {
      return (
        <button
          onClick={() => setDowngradeDialog('free')}
          style={{
            width: '100%',
            background: '#FFFFFF',
            color: '#DC2626',
            border: '1px solid #DC2626',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background-color 150ms ease',
          }}
        >
          Downgrade to Free
        </button>
      )
    }

    // Downgrade — starter card (from pro, ghost gray)
    if (cardPlan === 'starter' && currentPlan === 'pro') {
      return (
        <button
          onClick={() => setDowngradeDialog('starter')}
          style={{
            width: '100%',
            background: '#FFFFFF',
            color: '#6B7280',
            border: '1px solid #D1D5DB',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background-color 150ms ease',
          }}
        >
          Downgrade to Starter
        </button>
      )
    }

    return null
  }

  return (
    <div>
      {/* Section header + toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            color: '#374151',
            margin: 0,
          }}
        >
          Compare Plans
        </p>

        {/* Slide toggle: Monthly / Annual */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: billingCycle === 'monthly' ? '#0C1F40' : '#6B7280',
            }}
          >
            Monthly
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            aria-label={`Switch to ${billingCycle === 'monthly' ? 'annual' : 'monthly'} billing`}
            role="switch"
            aria-checked={billingCycle === 'annual'}
            style={{
              width: '44px',
              height: '24px',
              background: billingCycle === 'annual' ? '#B4E7DD' : '#E5E7EB',
              borderRadius: 0,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              transition: 'background-color 150ms ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: billingCycle === 'annual' ? '22px' : '2px',
                width: '20px',
                height: '20px',
                background: '#FFFFFF',
                borderRadius: 0,
                transition: 'left 150ms ease',
              }}
            />
          </button>

          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: billingCycle === 'annual' ? '#0C1F40' : '#6B7280',
            }}
          >
            Annual
          </span>
        </div>
      </div>

      {/* Plan grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {plans.map((plan) => {
          const priceDisplay = getPriceDisplay(plan)
          const features = PLAN_FEATURES[plan]
          const isCurrent = plan === currentPlan

          return (
            <div
              key={plan}
              style={{
                background: '#FFFFFF',
                border: getCardBorder(plan),
                borderRadius: 0,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Plan name */}
              <h3
                style={{
                  fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#0C1F40',
                  margin: '0 0 4px',
                  textTransform: 'capitalize',
                }}
              >
                {plan === 'free' ? 'Free' : plan === 'starter' ? 'Starter' : 'Pro'}
                {isCurrent && (
                  <span
                    style={{
                      marginLeft: '8px',
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: '#B4E7DD',
                      color: '#0C1F40',
                      padding: '2px 6px',
                      borderRadius: 0,
                      verticalAlign: 'middle',
                    }}
                  >
                    Current
                  </span>
                )}
              </h3>

              {/* Monthly price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '2px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                    fontWeight: 700,
                    fontSize: '32px',
                    color: '#0C1F40',
                  }}
                >
                  {priceDisplay}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                  }}
                >
                  /month
                </span>
              </div>

              {/* Annual savings line */}
              {billingCycle === 'annual' && plan !== 'free' && (
                <p
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '12px',
                    color: '#059669',
                    margin: '0 0 4px',
                  }}
                >
                  {ANNUAL_TOTALS[plan as 'starter' | 'pro'].total} / year — save{' '}
                  {ANNUAL_TOTALS[plan as 'starter' | 'pro'].savings}
                </p>
              )}

              {billingCycle === 'monthly' && plan !== 'free' && (
                <p
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '12px',
                    color: '#059669',
                    margin: '0 0 4px',
                  }}
                >
                  {plan === 'starter' ? '$79/yr' : '$249/yr'} billed annually — save{' '}
                  {plan === 'starter' ? '$29' : '$99'}
                </p>
              )}

              <hr style={{ borderColor: '#E5E7EB', margin: '12px 0' }} />

              {/* Feature list */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  flexGrow: 1,
                }}
              >
                {features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: '13px',
                      color: '#374151',
                    }}
                  >
                    <CheckCircle
                      size={14}
                      style={{ color: '#B4E7DD', flexShrink: 0, marginTop: '2px' }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isOwner ? (
                getCta(plan)
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Non-owner note */}
      {!isOwner && (
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '13px',
            color: '#6B7280',
            marginTop: '12px',
          }}
        >
          Contact your workspace owner to change your plan.
        </p>
      )}

      {/* Downgrade confirmation dialog */}
      {mounted && downgradeDialog && (
        <DowngradeDialog
          targetPlan={downgradeDialog}
          currentPeriodEnd={subscription?.current_period_end ?? null}
          discordConnectionCount={discordConnectionCount}
          onClose={() => {
            if (!downgradeLoading) {
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

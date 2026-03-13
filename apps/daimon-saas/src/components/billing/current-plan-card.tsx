'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface CurrentPlanData {
  plan: 'free' | 'starter' | 'pro'
  tenantStatus: 'pending' | 'configured' | 'active' | 'suspended'
  subscription: {
    stripe_subscription_id: string | null
    status: string | null
    current_period_end: string | null
    cancel_at: string | null
    trial_end: string | null
  } | null
  userRole: 'owner' | 'admin' | 'member'
  usageStats: {
    messagesToday: number
    toolUsesToday: number
  }
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
    'Email support',
  ],
  pro: [
    'Unlimited Discord connections',
    'All 50+ tools included',
    'Bring your own Anthropic key',
    'Priority support',
    'SLA: 99.9% bot uptime guarantee',
  ],
}

const PLAN_PRICES: Record<'free' | 'starter' | 'pro', string | null> = {
  free: null,
  starter: '$9 / month',
  pro: '$29 / month',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function BillingPeriodLine({
  subscription,
  plan,
  onPortalClick,
}: {
  subscription: CurrentPlanData['subscription']
  plan: 'free' | 'starter' | 'pro'
  onPortalClick: () => void
}) {
  if (plan === 'free') {
    return (
      <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        Free plan · No billing
      </p>
    )
  }

  const status = subscription?.status
  const periodEnd = subscription?.current_period_end
  const cancelAt = subscription?.cancel_at
  const trialEnd = subscription?.trial_end
  const cancelAtEnd = cancelAt && new Date(cancelAt) > new Date()

  if (status === 'trialing') {
    return (
      <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        Trial ends {formatDate(trialEnd ?? null)} ·{' '}
        <button
          onClick={onPortalClick}
          style={{ color: '#6B7280', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}
        >
          Add Payment Method →
        </button>
      </p>
    )
  }

  if (status === 'past_due') {
    return (
      <p style={{ fontSize: '13px', color: '#DC2626', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        Payment failed ·{' '}
        <button
          onClick={onPortalClick}
          style={{ color: '#DC2626', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}
        >
          Update Payment Method →
        </button>
      </p>
    )
  }

  if (status === 'canceled') {
    return (
      <p style={{ fontSize: '13px', color: '#DC2626', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        Canceled · Access ends {formatDate(periodEnd ?? null)}
      </p>
    )
  }

  if (status === 'unpaid') {
    return (
      <p style={{ fontSize: '13px', color: '#DC2626', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        Unpaid · Bot access suspended
      </p>
    )
  }

  if (status === 'incomplete') {
    return (
      <p style={{ fontSize: '13px', color: '#D97706', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        Payment incomplete ·{' '}
        <button
          onClick={onPortalClick}
          style={{ color: '#D97706', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}
        >
          Complete Payment →
        </button>
      </p>
    )
  }

  if (cancelAtEnd) {
    return (
      <p style={{ fontSize: '13px', color: '#D97706', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        ⚠ Cancels on {formatDate(cancelAt ?? null)} ·{' '}
        <button
          onClick={onPortalClick}
          style={{ color: '#D97706', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}
        >
          Reactivate →
        </button>
      </p>
    )
  }

  // active, default
  return (
    <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
      Renews {formatDate(periodEnd ?? null)}
    </p>
  )
}

export function CurrentPlanCard({
  plan,
  tenantStatus,
  subscription,
  userRole,
  usageStats,
}: CurrentPlanData) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const isOwner = userRole === 'owner'

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Portal failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
      // Error toast handled by parent, reset loading
    }
  }

  async function handleCheckout(checkoutPlan: 'starter' | 'pro') {
    setLoading(true)
    try {
      const res = await fetch(`/api/billing/checkout?plan=${checkoutPlan}&cycle=monthly`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  function getCtaButton() {
    if (!isOwner) return null

    const stripeStatus = subscription?.status
    const cancelAt = subscription?.cancel_at
    const cancelAtEnd = cancelAt && new Date(cancelAt) > new Date()

    if (plan === 'free') {
      return (
        <button
          onClick={() => handleCheckout('starter')}
          disabled={loading}
          style={{
            background: loading ? '#D1FAE5' : '#B4E7DD',
            color: '#0C1F40',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Opening...' : 'Upgrade Plan →'}
        </button>
      )
    }

    if (stripeStatus === 'canceled' || cancelAtEnd) {
      return (
        <button
          onClick={() => handleCheckout(plan as 'starter' | 'pro')}
          disabled={loading}
          style={{
            background: loading ? '#D1FAE5' : '#B4E7DD',
            color: '#0C1F40',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Opening...' : 'Reactivate →'}
        </button>
      )
    }

    if (stripeStatus === 'past_due' || stripeStatus === 'incomplete') {
      return (
        <button
          onClick={handlePortal}
          disabled={loading}
          style={{
            background: loading ? '#D1FAE5' : '#B4E7DD',
            color: '#0C1F40',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Opening...' : 'Update Payment →'}
        </button>
      )
    }

    // active or default
    return (
      <button
        onClick={handlePortal}
        disabled={loading}
        style={{
          background: loading ? '#D1FAE5' : '#B4E7DD',
          color: '#0C1F40',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          padding: '8px 16px',
          border: 'none',
          borderRadius: 0,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'background-color 150ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
        {loading ? 'Opening...' : 'Manage Billing →'}
      </button>
    )
  }

  const planVariant = `plan-${plan}` as const
  const price = PLAN_PRICES[plan]
  const features = PLAN_FEATURES[plan]

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 0,
        padding: '24px',
        marginBottom: '24px',
        width: '100%',
      }}
    >
      {/* CURRENT PLAN label */}
      <p
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#6B7280',
          marginBottom: '4px',
        }}
      >
        Current Plan
      </p>

      {/* Plan name row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                color: '#0C1F40',
                textTransform: 'capitalize',
                margin: 0,
              }}
            >
              {plan === 'free' ? 'Free' : plan === 'starter' ? 'Starter' : 'Pro'}
            </h2>
            <Badge variant={planVariant} />
          </div>
          {price && (
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                color: '#6B7280',
                marginTop: '4px',
              }}
            >
              {price}
            </p>
          )}
        </div>
        <div>{getCtaButton()}</div>
      </div>

      {/* Feature list */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              color: '#0C1F40',
            }}
          >
            <CheckCircle size={16} style={{ color: '#B4E7DD', flexShrink: 0 }} />
            {feature}
          </li>
        ))}
      </ul>

      {/* Member note or billing period */}
      {!isOwner ? (
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '13px',
            color: '#6B7280',
          }}
        >
          Only the workspace owner can manage billing.
        </p>
      ) : (
        <BillingPeriodLine
          subscription={subscription}
          plan={plan}
          onPortalClick={handlePortal}
        />
      )}

      {/* Usage stats */}
      {(usageStats.messagesToday > 0 || usageStats.toolUsesToday > 0) && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            gap: '24px',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9CA3AF',
                marginBottom: '2px',
              }}
            >
              Messages Today
            </p>
            <p
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#0C1F40',
              }}
            >
              {usageStats.messagesToday}
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9CA3AF',
                marginBottom: '2px',
              }}
            >
              Tool Uses Today
            </p>
            <p
              style={{
                fontFamily: 'var(--font-archivo), Archivo, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#0C1F40',
              }}
            >
              {usageStats.toolUsesToday}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import { ListChecks, CheckCircle2, Circle } from 'lucide-react'

interface OnboardingChecklistProps {
  /** discord_connections row exists with non-null bot_token_encrypted  */
  hasBotToken: boolean
  /** discord_connections row exists AND status is not 'pending' */
  discordConnected: boolean
  /** tenant_api_keys with provider='anthropic' AND is_valid=true */
  hasAnthropicKey: boolean
  /** discord_connections.status === 'connected' */
  botOnline: boolean
}

interface Step {
  title: string
  description: string
  ctaLabel: string | null
  ctaHref: string | null
  ctaExternal: boolean
  completed: boolean
}

function buildSteps(props: OnboardingChecklistProps): Step[] {
  const { hasBotToken, discordConnected, hasAnthropicKey, botOnline } = props
  return [
    {
      title: 'Create your Discord bot',
      description:
        'Go to the Discord Developer Portal, create a new application, and copy your bot token.',
      ctaLabel: 'Go to Discord Developer Portal →',
      ctaHref: 'https://discord.com/developers/applications',
      ctaExternal: true,
      completed: hasBotToken,
    },
    {
      title: 'Connect your Discord server',
      description:
        'Paste your bot token and server (guild) ID to connect your bot to your Discord server.',
      ctaLabel: 'Add Discord Connection →',
      ctaHref: '/dashboard/settings#discord',
      ctaExternal: false,
      completed: discordConnected,
    },
    {
      title: 'Add your Anthropic API key',
      description:
        'Paste your Anthropic API key so your bot can use Claude for conversations and tool use.',
      ctaLabel: 'Add API Key →',
      ctaHref: '/dashboard/billing#api-keys',
      ctaExternal: false,
      completed: hasAnthropicKey,
    },
    {
      title: 'Wait for your bot to come online',
      description:
        'Once your token and key are saved, your bot will connect automatically — usually within 30 seconds.',
      ctaLabel: null,
      ctaHref: null,
      ctaExternal: false,
      completed: botOnline,
    },
  ]
}

export function OnboardingChecklist(props: OnboardingChecklistProps) {
  const steps = buildSteps(props)
  const totalSteps = steps.length
  const completedSteps = steps.filter((s) => s.completed).length
  const allDone = completedSteps === totalSteps

  const [visible, setVisible] = React.useState(true)
  const [fading, setFading] = React.useState(false)
  const prevAllDone = React.useRef(false)

  React.useEffect(() => {
    if (allDone && !prevAllDone.current) {
      // Start fade after 1.5s
      const timer = setTimeout(() => {
        setFading(true)
        // After 0.4s transition, fully hide
        setTimeout(() => setVisible(false), 400)
      }, 1500)
      prevAllDone.current = true
      return () => clearTimeout(timer)
    }
  }, [allDone])

  if (!visible) return null

  const progressPct = (completedSteps / totalSteps) * 100

  // Determine step variant: completed / current / pending
  function stepVariant(step: Step, idx: number): 'completed' | 'current' | 'pending' {
    if (step.completed) return 'completed'
    // current = first incomplete step
    const firstIncompleteIdx = steps.findIndex((s) => !s.completed)
    if (idx === firstIncompleteIdx) return 'current'
    return 'pending'
  }

  return (
    <div
      data-testid="onboarding-checklist"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid rgba(12,31,64,0.12)',
        borderRadius: '0px',
        padding: '24px 28px',
        marginBottom: '24px',
        borderLeft: '4px solid #B4E7DD',
        opacity: fading ? 0 : 1,
        height: fading ? 0 : undefined,
        overflow: fading ? 'hidden' : undefined,
        transition: 'opacity 0.4s ease, height 0.4s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <ListChecks
            size={20}
            color="#0C1F40"
            style={{ flexShrink: 0, marginTop: '2px' }}
          />
          <div>
            <p
              style={{
                fontFamily: '"Archivo", sans-serif',
                fontVariationSettings: '"wdth" 112',
                fontSize: '16px',
                fontWeight: 500,
                color: '#0C1F40',
                margin: 0,
              }}
            >
              Get started
            </p>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'rgba(12,31,64,0.65)',
                margin: '2px 0 0 0',
              }}
            >
              Complete these steps to bring your bot online.
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '16px' }}>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '12px',
            color: 'rgba(12,31,64,0.55)',
            marginBottom: '6px',
          }}
        >
          Step {completedSteps} of {totalSteps}
        </p>
        <div
          role="progressbar"
          aria-valuenow={completedSteps}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          style={{
            background: 'rgba(12,31,64,0.08)',
            height: '4px',
            borderRadius: '0px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#B4E7DD',
              height: '100%',
              width: `${progressPct}%`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol aria-label="Setup steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((step, idx) => {
          const variant = stepVariant(step, idx)
          const isLast = idx === steps.length - 1

          return (
            <li
              key={idx}
              aria-label={`Step ${idx + 1}: ${step.title} — ${step.completed ? 'completed' : 'pending'}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 0',
                borderBottom: isLast ? 'none' : '1px solid rgba(12,31,64,0.06)',
              }}
            >
              {/* Status icon */}
              <div style={{ flexShrink: 0, marginTop: '1px' }}>
                {variant === 'completed' && (
                  <CheckCircle2 size={20} color="#B4E7DD" fill="#B4E7DD" strokeWidth={0} />
                )}
                {variant === 'current' && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '1.5px solid #0C1F40',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#0C1F40',
                        lineHeight: 1,
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                )}
                {variant === 'pending' && (
                  <Circle size={20} color="rgba(12,31,64,0.25)" strokeWidth={1.5} />
                )}
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  opacity: variant === 'completed' ? 0.55 : 1,
                  minHeight: '28px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0C1F40',
                    margin: 0,
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '13px',
                    color: 'rgba(12,31,64,0.65)',
                    margin: '2px 0 0 0',
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* CTA */}
              {step.ctaLabel && step.ctaHref && (
                <a
                  href={step.ctaHref}
                  {...(step.ctaExternal
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  style={{
                    flexShrink: 0,
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0C1F40',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    whiteSpace: 'nowrap',
                    marginTop: '2px',
                  }}
                >
                  {step.ctaLabel}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

'use client'

import * as React from 'react'
import { ListChecks, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

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
    <Card
      data-testid="onboarding-checklist"
      className={cn(
        'border-[1.5px] border-border border-l-4 border-l-primary px-7 py-6 mb-6 transition-[opacity,height] duration-[400ms] ease-in-out',
        fading && 'opacity-0 h-0 overflow-hidden',
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-2.5">
          <ListChecks
            size={20}
            className="shrink-0 mt-0.5 text-foreground"
          />
          <div>
            <p className="font-heading text-base font-medium text-foreground m-0">
              Get started
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 mb-0">
              Complete these steps to bring your bot online.
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1.5">
          Step {completedSteps} of {totalSteps}
        </p>
        <div
          role="progressbar"
          aria-valuenow={completedSteps}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          className="bg-muted h-1 overflow-hidden"
        >
          <div
            className="bg-primary h-full transition-[width] duration-[400ms] ease-in-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol aria-label="Setup steps" className="list-none m-0 p-0">
        {steps.map((step, idx) => {
          const variant = stepVariant(step, idx)
          const isLast = idx === steps.length - 1

          return (
            <li
              key={idx}
              aria-label={`Step ${idx + 1}: ${step.title} — ${step.completed ? 'completed' : 'pending'}`}
              className={cn(
                'flex items-start gap-3 py-3',
                !isLast && 'border-b border-border/40',
              )}
            >
              {/* Status icon */}
              <div className="shrink-0 mt-px">
                {variant === 'completed' && (
                  <CheckCircle2 size={20} className="text-primary fill-primary" strokeWidth={0} />
                )}
                {variant === 'current' && (
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-foreground flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-foreground leading-none">
                      {idx + 1}
                    </span>
                  </div>
                )}
                {variant === 'pending' && (
                  <Circle size={20} className="text-foreground/25" strokeWidth={1.5} />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  'flex-1 min-h-7',
                  variant === 'completed' && 'opacity-55',
                )}
              >
                <p className="text-sm font-medium text-foreground m-0">
                  {step.title}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5 mb-0">
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
                  className="shrink-0 text-[13px] font-medium text-foreground underline underline-offset-2 whitespace-nowrap mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {step.ctaLabel}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

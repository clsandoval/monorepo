'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type BillingCycle = 'monthly' | 'annual'

const FREE_FEATURES = [
  '1 Discord connection',
  '1 guild (server)',
  'All 50+ tools available',
  'Bring your own Anthropic API key',
  'Bring your own service credentials',
  'Community support (docs only)',
  'Supabase-based BYOK storage',
]

const STARTER_FEATURES = [
  'Everything in Free',
  'Priority email support (48hr response)',
  'Dashboard analytics (bot activity overview)',
  'Connection health monitoring',
  '30-day audit log',
]

const PRO_FEATURES = [
  'Everything in Starter',
  'Up to 5 Discord connections (multi-server)',
  'Team members (up to 5)',
  'Priority support (24hr, dedicated Slack channel)',
  'Advanced analytics (usage by tool, by user)',
  '90-day audit log',
  'Custom bot name configuration (future)',
  'Early access to new integrations',
]

function FeatureList({
  features,
  dark = false,
}: {
  features: string[]
  dark?: boolean
}) {
  return (
    <div>
      <p
        className={cn(
          'mb-3 font-body text-sm font-semibold uppercase tracking-wider',
          dark ? 'text-white/40' : 'text-foreground/40'
        )}
      >
        What&apos;s included
      </p>
      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li
            key={f}
            className={cn(
              'flex items-start gap-2.5 font-body text-sm leading-relaxed',
              dark ? 'text-white/85' : 'text-foreground/80'
            )}
          >
            <span className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 bg-primary" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="scroll-mt-20"
    >
      <div className="bg-background py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          {/* Section header */}
          <p className="mb-3 text-center font-body text-sm font-semibold uppercase tracking-widest text-foreground/50">
            Pricing
          </p>
          <h2 className="font-headline-semi-expanded text-center text-[clamp(28px,3.5vw,44px)] font-medium text-foreground">
            Simple pricing. Your API costs stay yours.
          </h2>
          <div className="mx-auto my-6 h-[3px] w-12 bg-primary" />
          <p className="mx-auto mb-10 max-w-[560px] text-center font-body text-lg leading-relaxed text-foreground/70">
            Daimon charges a small platform fee. You pay Anthropic directly for AI usage. No per-message markup, no hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="mb-12 flex justify-center">
            <div className="inline-flex items-center overflow-hidden border-[1.5px] border-border">
              <button
                className={cn(
                  'flex h-[38px] items-center gap-1.5 whitespace-nowrap px-4 font-body text-sm font-medium transition-colors',
                  cycle === 'monthly'
                    ? 'bg-primary text-foreground'
                    : 'bg-transparent text-foreground/60'
                )}
                onClick={() => setCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={cn(
                  'flex h-[38px] items-center gap-1.5 whitespace-nowrap px-4 font-body text-sm font-medium transition-colors',
                  cycle === 'annual'
                    ? 'bg-primary text-foreground'
                    : 'bg-transparent text-foreground/60'
                )}
                onClick={() => setCycle('annual')}
              >
                Annual
                {cycle !== 'annual' && (
                  <Badge variant="neutral" label="Save 20%" uppercase={false} className="bg-primary text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Pricing grid */}
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Free */}
            <Card className="rounded-none border-[1.5px] border-foreground/10 bg-card p-8">
              <CardContent className="flex flex-col gap-0 p-0">
                <h3 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-foreground/50">
                  Free
                </h3>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-headline-expanded text-5xl font-bold text-foreground">$0</span>
                  <span className="font-body text-base text-foreground/50">/ month</span>
                </div>
                <p className="mt-2 font-body text-sm text-foreground/60">
                  Forever free. Bring your own Anthropic key.
                </p>
                <Separator className="my-6" />
                <a
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'h-11 w-full rounded-none border-[1.5px] border-foreground font-body text-[15px] font-semibold hover:bg-foreground hover:text-card'
                  )}
                >
                  Get Started Free
                </a>
                <Separator className="my-6" />
                <FeatureList features={FREE_FEATURES} />
              </CardContent>
            </Card>

            {/* Starter — Most Popular */}
            <Card className="relative rounded-none border-none bg-foreground p-8">
              <Badge variant="neutral" label="Most Popular" uppercase={false} className="absolute right-4 top-4 bg-primary text-foreground" />
              <CardContent className="flex flex-col gap-0 p-0">
                <h3 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-white/50">
                  Starter
                </h3>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-headline-expanded text-5xl font-bold text-white">
                    {cycle === 'monthly' ? '$9' : '$6.58'}
                  </span>
                  <span className="font-body text-base text-white/50">/ month</span>
                </div>
                {cycle === 'annual' && (
                  <p className="mb-1 font-body text-[13px] text-white/40">billed $79/yr</p>
                )}
                <p className="mt-2 font-body text-sm text-white/60">
                  A small platform fee. You pay Anthropic separately.
                </p>
                <Separator className="my-6 bg-white/10" />
                <a
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'lg' }),
                    'h-11 w-full rounded-none border-[1.5px] border-primary bg-primary font-body text-[15px] font-semibold text-foreground hover:opacity-85'
                  )}
                >
                  Start Starter Plan
                </a>
                <Separator className="my-6 bg-white/10" />
                <FeatureList features={STARTER_FEATURES} dark />
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="rounded-none border-[1.5px] border-foreground/10 bg-card p-8">
              <CardContent className="flex flex-col gap-0 p-0">
                <h3 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-foreground/50">
                  Pro
                </h3>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-headline-expanded text-5xl font-bold text-foreground">
                    {cycle === 'monthly' ? '$29' : '$20.75'}
                  </span>
                  <span className="font-body text-base text-foreground/50">/ month</span>
                </div>
                {cycle === 'annual' && (
                  <p className="mb-1 font-body text-[13px] text-foreground/50">billed $249/yr</p>
                )}
                <p className="mt-2 font-body text-sm text-foreground/60">
                  For teams and power users.
                </p>
                <Separator className="my-6" />
                <a
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'h-11 w-full rounded-none border-[1.5px] border-foreground font-body text-[15px] font-semibold hover:bg-foreground hover:text-card'
                  )}
                >
                  Start Pro Plan
                </a>
                <Separator className="my-6" />
                <FeatureList features={PRO_FEATURES} />
              </CardContent>
            </Card>
          </div>

          {/* BYOK note */}
          <div className="mt-8 flex justify-center">
            <div className="flex w-full max-w-[640px] items-start gap-3 border border-primary/40 bg-primary/15 p-5">
              <Info size={16} className="mt-0.5 shrink-0 text-foreground/60" />
              <p className="font-body text-sm leading-relaxed text-foreground/70">
                <strong className="font-semibold text-foreground">How BYOK pricing works</strong>: Daimon charges only the platform fee above. Your bot&apos;s AI usage (Claude API calls) is billed directly from Anthropic to your API key. You keep full visibility and control over your AI spending.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

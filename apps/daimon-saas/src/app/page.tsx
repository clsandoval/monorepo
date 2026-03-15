import { Metadata } from 'next'
import { Code2, Clock, BookOpen, Calendar, FileText, Brain, MessageSquare, ImageIcon, Key } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { JsonLd, WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA, LANDING_FAQ_SCHEMA } from '@/components/seo/json-ld'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Daimon — AI Operating System for Discord',
  description:
    'Connect your Discord server to 50+ tools — GitHub, Linear, Toggl, Google Analytics, and more. Powered by Claude AI. Bring your own API key. Get started free.',
  keywords: [
    'discord ai bot',
    'discord automation tools',
    'ai assistant for discord',
    'discord productivity',
    'claude ai discord bot',
    'discord github bot',
    'discord linear bot',
    'discord toggl integration',
    'byok discord bot',
    'discord ai operating system',
  ],
  openGraph: {
    title: 'Daimon — AI Operating System for Discord',
    description:
      '50+ tools. Your own API key. Claude-powered. Connect GitHub, Linear, Toggl, and more to your Discord server in minutes.',
    url: 'https://daimon.ai',
    type: 'website',
    images: [
      {
        url: '/og/landing.png',
        width: 1200,
        height: 630,
        alt: 'Daimon — AI Operating System for Discord. 50+ tools, your API key, Claude-powered.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daimon — AI Operating System for Discord',
    description:
      '50+ tools. Your own API key. Claude-powered. Connect GitHub, Linear, Toggl, and more to your Discord server in minutes.',
    images: ['/og/landing.png'],
  },
  alternates: {
    canonical: 'https://daimon.ai',
  },
}

export default function LandingPage() {
  return (
    <PublicLayout>
      <JsonLd data={[WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA, LANDING_FAQ_SCHEMA]} />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </PublicLayout>
  )
}

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Create your Discord bot',
    body: 'Head to the Discord Developer Portal and create a new application. Enable the Message Content Intent. Copy your bot token and your server (guild) ID.',
  },
  {
    number: '02',
    heading: 'Paste your keys',
    body: 'Sign up for Daimon, then paste your Discord bot token, guild ID, and Anthropic API key into the dashboard. That\'s it — Daimon stores them encrypted. Your keys never leave our database unencrypted.',
  },
  {
    number: '03',
    heading: 'Your bot goes live',
    body: 'Within seconds, your bot connects to your server. Mention it in any channel and it picks the right tools automatically — no commands, no configuration. Claude handles the rest.',
  },
] as const

function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-label="How it works">
      <div className="bg-white py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          {/* Section header */}
          <p className="section-label text-center">Setup</p>
          <h2 className="text-h2 font-medium text-navy text-center mb-4 font-headline-semi-expanded">
            Live in three steps.
          </h2>
          <div className="brand-divider-center" />
          <p className="mx-auto mb-16 max-w-[560px] text-center text-lg font-normal leading-relaxed text-navy/70 font-body">
            No infrastructure to manage. No workflows to configure. Just connect your keys and go.
          </p>

          {/* Step grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.number} className="relative overflow-hidden bg-white p-6">
                <div className="card-stripe" />
                <div className="pl-3">
                  <span className="text-[60px] md:text-[80px] font-bold text-aqua leading-none font-headline-expanded">{step.number}</span>
                  <h3 className="mt-4 mb-3 text-[22px] font-normal text-navy font-headline-semi-expanded">{step.heading}</h3>
                  <p className="text-base font-normal text-navy/70 leading-[1.7] font-body">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const FEATURE_CARDS = [
  {
    icon: Code2,
    iconClass: 'text-aqua',
    heading: 'Developer Tools',
    body: 'Browse and create GitHub issues, review PRs, query Linear tickets, run shell commands. Your entire dev workflow, in chat.',
    tag: 'GitHub · Linear · Shell',
    bgClass: 'bg-white',
  },
  {
    icon: Clock,
    iconClass: 'text-aqua',
    heading: 'Time & Tasks',
    body: 'Track time in Toggl with natural language. Create tasks, log hours, and query your time entries — all from Discord.',
    tag: 'Toggl · Tasks',
    bgClass: 'bg-white',
  },
  {
    icon: BookOpen,
    iconClass: 'text-aqua',
    heading: 'Knowledge & Research',
    body: 'Web search, Wikipedia lookup, URL reading, ArXiv papers, Wikipedia disambiguation — Claude retrieves and synthesizes.',
    tag: 'Web · Wikipedia · ArXiv',
    bgClass: 'bg-white',
  },
  {
    icon: Calendar,
    iconClass: 'text-aqua',
    heading: 'Calendar & Scheduling',
    body: 'Query Google Calendar, create events, check availability. Schedule with context from your other tools.',
    tag: 'Google Calendar',
    bgClass: 'bg-white',
  },
  {
    icon: FileText,
    iconClass: 'text-aqua',
    heading: 'Files & Docs',
    body: 'Read and write Google Docs, Google Sheets, and Notion. Upload and retrieve files from Google Drive. Manage content without leaving Discord.',
    tag: 'Google Docs · Drive · Notion',
    bgClass: 'bg-white',
  },
  {
    icon: Brain,
    iconClass: 'text-aqua',
    heading: 'Memory & Context',
    body: 'Daimon remembers. It stores notes and context that persist across conversations, giving you continuity across your server\'s history.',
    tag: 'Built-in memory',
    bgClass: 'bg-white',
  },
  {
    icon: MessageSquare,
    iconClass: 'text-aqua',
    heading: 'Communication',
    body: 'Send emails via Gmail, draft messages, search your inbox. Manage Slack workspaces you\'ve connected.',
    tag: 'Gmail · Slack',
    bgClass: 'bg-white',
  },
  {
    icon: ImageIcon,
    iconClass: 'text-aqua',
    heading: 'Media & Images',
    body: 'Generate images with DALL-E, search for photos, process attachments. Visual AI capabilities within Discord.',
    tag: 'DALL-E · Media',
    bgClass: 'bg-white',
  },
  {
    icon: Key,
    iconClass: 'text-periwinkle',
    heading: 'You control the costs',
    body: 'Every token your bot uses is charged to your Anthropic account directly. Daimon only charges a small platform fee. No per-message markups.',
    tag: 'BYOK model',
    bgClass: 'bg-periwinkle/[0.06]',
  },
] as const

function FeaturesSection() {
  return (
    <section id="features" aria-label="Features">
      <div className="bg-white-soft py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          {/* Section header */}
          <p className="section-label text-center">Capabilities</p>
          <h2 className="text-h2 font-medium text-navy text-center mb-4 font-headline-semi-expanded">
            50+ tools. Zero configuration.
          </h2>
          <div className="brand-divider-center" />
          <p className="mx-auto mb-16 max-w-[560px] text-center text-lg font-normal leading-relaxed text-navy/70 font-body">
            Every tool is available out of the box. Connect your services once — Claude figures out when to use them.
          </p>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.heading} className={cn('relative flex flex-col overflow-hidden p-7 transition-opacity duration-200 hover:opacity-[0.92]', card.bgClass)}>
                  <div className="card-stripe" />
                  <div className="pl-3">
                    <div className="mb-4">
                      <Icon size={24} className={card.iconClass} />
                    </div>
                    <h3 className="mb-2.5 text-lg font-medium text-navy font-body">{card.heading}</h3>
                    <p className="mb-4 flex-1 text-[15px] font-normal text-navy/70 leading-[1.65] font-body">{card.body}</p>
                    <span className="inline-block text-sm font-medium text-navy/60 bg-navy/5 px-2.5 py-[3px] font-body">{card.tag}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroSection() {
  return (
    <section id="hero" aria-label="Hero" className="hero-section relative min-h-screen overflow-hidden bg-white">
      {/* Animated blob layer */}
      <div className="absolute -top-[200px] -left-[100px] w-[600px] h-[600px] rounded-full bg-aqua opacity-40 blur-[80px] will-change-transform z-0 animate-drift-teal" data-blob />
      <div className="absolute top-[10%] -right-[150px] w-[500px] h-[500px] rounded-full bg-periwinkle opacity-35 blur-[80px] will-change-transform z-0 animate-drift-periwinkle" data-blob />
      <div className="absolute bottom-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-navy opacity-[0.08] blur-[80px] will-change-transform z-0 -translate-x-1/2 animate-drift-navy-center" data-blob />
      <div className="absolute -bottom-[100px] right-[10%] w-[300px] h-[300px] rounded-full bg-periwinkle opacity-25 blur-[80px] will-change-transform z-0 -translate-y-[57%] animate-drift-navy-right" data-blob />

      {/* Content — positioned at bottom */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen pb-12 md:pb-20">
        <div className="mx-auto max-w-[1280px] w-full px-8">
          {/* Eyebrow tag */}
          <div className="tag-category mb-6">
            Discord AI · Bring Your Own Keys
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(36px,8vw,52px)] md:text-hero leading-[1.05] font-bold text-navy max-w-[800px] whitespace-pre-line mb-6 font-headline-expanded">
            {`Your Discord server,\npowered by Claude.`}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-[20px] font-normal leading-relaxed text-navy/70 max-w-[640px] mb-10 font-body">
            Bring your own bot token and Anthropic API key. Get an AI operating
            system for your Discord — with 50+ integrated tools, from GitHub and
            Linear to Google Calendar and Toggl. No workflow setup. No
            per-message fees.
          </p>

          {/* CTA group */}
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <a
              href="/signup"
              className="inline-flex items-center justify-center h-11 px-7 bg-aqua text-navy border-[1.5px] border-aqua text-[15px] font-semibold no-underline transition-all duration-200 whitespace-nowrap cursor-pointer hover:opacity-85 w-full md:w-auto font-body"
            >
              Start Free — No Credit Card
            </a>
            <a
              href="/docs"
              className="inline-flex items-center justify-center h-11 px-7 bg-transparent text-navy border-[1.5px] border-navy text-[15px] font-semibold no-underline transition-all duration-200 whitespace-nowrap cursor-pointer hover:bg-navy hover:text-white w-full md:w-auto font-body"
            >
              Read the Docs
            </a>
          </div>

          {/* Social proof */}
          <p className="text-sm font-normal text-navy/50 mt-4 font-body">
            Free tier available · Your keys, your costs · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section id="final-cta" aria-label="Get started">
      <div className="relative overflow-hidden bg-navy py-16 md:py-24">
        {/* Decorative blob */}
        <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full bg-aqua opacity-10 blur-[100px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-3xl px-8 text-center">
          <h2 className="text-[clamp(28px,6vw,40px)] md:text-[clamp(32px,4vw,52px)] font-bold text-white leading-[1.1] mb-4 font-headline-expanded">
            Get your AI Discord bot running today.
          </h2>
          <p className="text-[20px] font-normal text-white/65 mb-10 font-body">
            Free tier, no credit card, live in minutes.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center h-11 px-9 bg-aqua text-navy border-none text-[15px] font-semibold no-underline transition-opacity duration-200 cursor-pointer hover:opacity-85 w-full md:w-auto font-body"
          >
            Create Your Free Account
          </a>
          <p className="mt-4 text-sm font-normal text-white/50 font-body">
            Or read the docs first →{' '}
            <a href="/docs" className="text-aqua no-underline transition-opacity duration-200 hover:opacity-80">View Quick Start</a>
          </p>
        </div>
      </div>
    </section>
  )
}

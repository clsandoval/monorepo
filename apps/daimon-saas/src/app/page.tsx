import { Metadata } from 'next'
import { Code2, Clock, BookOpen, Calendar, FileText, Brain, MessageSquare, ImageIcon, Key } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { JsonLd, WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA, LANDING_FAQ_SCHEMA } from '@/components/seo/json-ld'

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
    <section id="how-it-works" aria-label="How it works" style={{ scrollMarginTop: '80px' }}>
      <style>{`
        .hiw-root {
          background-color: #FFFFFF;
          padding: 96px 0;
        }
        .hiw-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .hiw-section-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(12, 31, 64, 0.5);
          margin-bottom: 12px;
          font-family: var(--font-body);
          text-align: center;
        }
        .hiw-heading {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 500;
          color: #0C1F40;
          text-align: center;
          margin-bottom: 16px;
        }
        .hiw-divider {
          width: 48px;
          height: 3px;
          background-color: #B4E7DD;
          border-radius: 2px;
          margin: 24px auto;
        }
        .hiw-subheadline {
          font-size: 18px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.7);
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto 64px;
          text-align: center;
          font-family: var(--font-body);
        }
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }
        .hiw-step-card {
          position: relative;
          overflow: hidden;
          padding: 24px;
          background-color: #FFFFFF;
          border-radius: 0;
        }
        .hiw-step-stripe {
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            #B4E7DD 30%,
            #9FAAE2 35%,
            #B4E7DD 60%
          );
        }
        .hiw-step-content {
          padding-left: 12px;
        }
        .hiw-step-number {
          font-size: 80px;
          font-weight: 700;
          color: #B4E7DD;
          line-height: 1;
          display: block;
        }
        .hiw-step-heading {
          font-size: 22px;
          font-weight: 400;
          color: #0C1F40;
          margin-top: 16px;
          margin-bottom: 12px;
          font-family: var(--font-body);
        }
        .hiw-step-body {
          font-size: 16px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.7);
          line-height: 1.7;
          font-family: var(--font-body);
        }
        @media (max-width: 900px) {
          .hiw-grid { grid-template-columns: 1fr; }
          .hiw-step-number { font-size: 60px; }
        }
      `}</style>

      <div className="hiw-root">
        <div className="hiw-container">
          {/* Section header */}
          <p className="hiw-section-label">Setup</p>
          <h2 className="hiw-heading font-headline-semi-expanded">
            Live in three steps.
          </h2>
          <div className="hiw-divider" />
          <p className="hiw-subheadline">
            No infrastructure to manage. No workflows to configure. Just connect your keys and go.
          </p>

          {/* Step grid */}
          <div className="hiw-grid">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.number} className="hiw-step-card">
                <div className="hiw-step-stripe" />
                <div className="hiw-step-content">
                  <span className="hiw-step-number font-headline-expanded">{step.number}</span>
                  <h3 className="hiw-step-heading font-headline-semi-expanded">{step.heading}</h3>
                  <p className="hiw-step-body">{step.body}</p>
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
    iconColor: '#B4E7DD',
    heading: 'Developer Tools',
    body: 'Browse and create GitHub issues, review PRs, query Linear tickets, run shell commands. Your entire dev workflow, in chat.',
    tag: 'GitHub · Linear · Shell',
    bg: '#FFFFFF',
  },
  {
    icon: Clock,
    iconColor: '#B4E7DD',
    heading: 'Time & Tasks',
    body: 'Track time in Toggl with natural language. Create tasks, log hours, and query your time entries — all from Discord.',
    tag: 'Toggl · Tasks',
    bg: '#FFFFFF',
  },
  {
    icon: BookOpen,
    iconColor: '#B4E7DD',
    heading: 'Knowledge & Research',
    body: 'Web search, Wikipedia lookup, URL reading, ArXiv papers, Wikipedia disambiguation — Claude retrieves and synthesizes.',
    tag: 'Web · Wikipedia · ArXiv',
    bg: '#FFFFFF',
  },
  {
    icon: Calendar,
    iconColor: '#B4E7DD',
    heading: 'Calendar & Scheduling',
    body: 'Query Google Calendar, create events, check availability. Schedule with context from your other tools.',
    tag: 'Google Calendar',
    bg: '#FFFFFF',
  },
  {
    icon: FileText,
    iconColor: '#B4E7DD',
    heading: 'Files & Docs',
    body: 'Read and write Google Docs, Google Sheets, and Notion. Upload and retrieve files from Google Drive. Manage content without leaving Discord.',
    tag: 'Google Docs · Drive · Notion',
    bg: '#FFFFFF',
  },
  {
    icon: Brain,
    iconColor: '#B4E7DD',
    heading: 'Memory & Context',
    body: 'Daimon remembers. It stores notes and context that persist across conversations, giving you continuity across your server\'s history.',
    tag: 'Built-in memory',
    bg: '#FFFFFF',
  },
  {
    icon: MessageSquare,
    iconColor: '#B4E7DD',
    heading: 'Communication',
    body: 'Send emails via Gmail, draft messages, search your inbox. Manage Slack workspaces you\'ve connected.',
    tag: 'Gmail · Slack',
    bg: '#FFFFFF',
  },
  {
    icon: ImageIcon,
    iconColor: '#B4E7DD',
    heading: 'Media & Images',
    body: 'Generate images with DALL-E, search for photos, process attachments. Visual AI capabilities within Discord.',
    tag: 'DALL-E · Media',
    bg: '#FFFFFF',
  },
  {
    icon: Key,
    iconColor: '#9FAAE2',
    heading: 'You control the costs',
    body: 'Every token your bot uses is charged to your Anthropic account directly. Daimon only charges a small platform fee. No per-message markups.',
    tag: 'BYOK model',
    bg: 'rgba(159,170,226,0.06)',
  },
] as const

function FeaturesSection() {
  return (
    <section id="features" aria-label="Features" style={{ scrollMarginTop: '80px' }}>
      <style>{`
        .features-root {
          background-color: #F7F7F7;
          padding: 96px 0;
        }
        .features-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .features-section-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(12, 31, 64, 0.5);
          margin-bottom: 12px;
          font-family: var(--font-body);
          text-align: center;
        }
        .features-heading {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 500;
          color: #0C1F40;
          text-align: center;
          margin-bottom: 16px;
        }
        .features-divider {
          width: 48px;
          height: 3px;
          background-color: #B4E7DD;
          border-radius: 2px;
          margin: 24px auto;
        }
        .features-subheadline {
          font-size: 18px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.7);
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto 64px;
          text-align: center;
          font-family: var(--font-body);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-card {
          display: flex;
          flex-direction: column;
          padding: 28px;
          border-radius: 0;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }
        .feature-card:hover { opacity: 0.92; }
        .feature-card-stripe {
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            #B4E7DD 30%,
            #9FAAE2 35%,
            #B4E7DD 60%
          );
        }
        .feature-card-content {
          padding-left: 12px;
        }
        .feature-card-icon {
          margin-bottom: 16px;
        }
        .feature-card-heading {
          font-size: 18px;
          font-weight: 500;
          color: #0C1F40;
          margin-bottom: 10px;
          font-family: var(--font-body);
        }
        .feature-card-body {
          font-size: 15px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.7);
          line-height: 1.65;
          margin-bottom: 16px;
          font-family: var(--font-body);
          flex: 1;
        }
        .feature-card-tag {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(12, 31, 64, 0.6);
          background: rgba(12, 31, 64, 0.05);
          padding: 3px 10px;
          font-family: var(--font-body);
        }
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 600px) and (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="features-root">
        <div className="features-container">
          {/* Section header */}
          <p className="features-section-label">Capabilities</p>
          <h2 className="features-heading font-headline-semi-expanded">
            50+ tools. Zero configuration.
          </h2>
          <div className="features-divider" />
          <p className="features-subheadline">
            Every tool is available out of the box. Connect your services once — Claude figures out when to use them.
          </p>

          {/* Feature cards grid */}
          <div className="features-grid">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.heading} className="feature-card" style={{ backgroundColor: card.bg }}>
                  <div className="feature-card-stripe" />
                  <div className="feature-card-content">
                    <div className="feature-card-icon">
                      <Icon size={24} color={card.iconColor} />
                    </div>
                    <h3 className="feature-card-heading">{card.heading}</h3>
                    <p className="feature-card-body">{card.body}</p>
                    <span className="feature-card-tag">{card.tag}</span>
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
    <section id="hero" aria-label="Hero" className="hero-section hero-root">
      {/* Hover + responsive styles */}
      <style>{`
        .hero-root {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background-color: #FFFFFF;
        }

        /* Animated blobs */
        .hero-blob-1 {
          position: absolute;
          top: -200px;
          left: -100px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background-color: #B4E7DD;
          opacity: 0.4;
          filter: blur(80px);
          will-change: transform;
          z-index: 0;
          animation: drift-teal 25s ease-in-out infinite alternate;
        }
        .hero-blob-2 {
          position: absolute;
          top: 10%;
          right: -150px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background-color: #9FAAE2;
          opacity: 0.35;
          filter: blur(80px);
          will-change: transform;
          z-index: 0;
          animation: drift-periwinkle 30s ease-in-out infinite alternate;
        }
        .hero-blob-3 {
          position: absolute;
          bottom: 20%;
          left: 30%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background-color: #0C1F40;
          opacity: 0.08;
          filter: blur(80px);
          will-change: transform;
          z-index: 0;
          transform: translateX(-50%);
          animation: drift-navy-center 22s ease-in-out infinite alternate;
        }
        .hero-blob-4 {
          position: absolute;
          bottom: -100px;
          right: 10%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background-color: #9FAAE2;
          opacity: 0.25;
          filter: blur(80px);
          will-change: transform;
          z-index: 0;
          transform: translateY(-57%);
          animation: drift-navy-right 28s ease-in-out infinite alternate;
        }

        /* Content wrapper */
        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100vh;
          padding-bottom: 80px;
        }
        .hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 0 32px;
        }

        /* Headline */
        .hero-headline {
          font-size: clamp(56px, 6vw, 80px);
          font-weight: 700;
          line-height: 1.05;
          color: #0C1F40;
          max-width: 800px;
          white-space: pre-line;
          margin-bottom: 24px;
        }

        /* Subheadline */
        .hero-subheadline {
          font-size: 20px;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(12, 31, 64, 0.7);
          max-width: 640px;
          margin-bottom: 40px;
        }

        /* CTA group */
        .hero-cta-group {
          display: flex;
          flex-direction: row;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* Primary CTA button */
        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 28px;
          background-color: #B4E7DD;
          color: #0C1F40;
          border: 1.5px solid #B4E7DD;
          border-radius: 0;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          cursor: pointer;
        }
        .hero-btn-primary:hover { opacity: 0.85; }

        /* Secondary CTA button */
        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 28px;
          background-color: transparent;
          color: #0C1F40;
          border: 1.5px solid #0C1F40;
          border-radius: 0;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          cursor: pointer;
        }
        .hero-btn-secondary:hover {
          background-color: #0C1F40;
          color: #FFFFFF;
        }

        /* Social proof */
        .hero-social-proof {
          font-size: 13px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.5);
          margin-top: 16px;
        }

        /* Mobile overrides */
        @media (max-width: 900px) {
          .hero-content { padding-bottom: 48px; }
          .hero-inner { padding: 0 32px; }
          .hero-headline { font-size: clamp(36px, 8vw, 52px); }
          .hero-subheadline { font-size: 18px; }
          .hero-cta-group { flex-direction: column; }
          .hero-btn-primary,
          .hero-btn-secondary { width: 100%; }
        }
      `}</style>

      {/* Animated blob layer */}
      <div className="hero-blob-1" data-blob />
      <div className="hero-blob-2" data-blob />
      <div className="hero-blob-3" data-blob />
      <div className="hero-blob-4" data-blob />

      {/* Content — positioned at bottom */}
      <div className="hero-content">
        <div className="hero-inner">
          {/* Eyebrow tag */}
          <div className="tag-category" style={{ marginBottom: '24px' }}>
            Discord AI · Bring Your Own Keys
          </div>

          {/* Headline */}
          <h1 className="hero-headline font-headline-expanded">
            {`Your Discord server,\npowered by Claude.`}
          </h1>

          {/* Subheadline */}
          <p className="hero-subheadline" style={{ fontFamily: 'var(--font-body)' }}>
            Bring your own bot token and Anthropic API key. Get an AI operating
            system for your Discord — with 50+ integrated tools, from GitHub and
            Linear to Google Calendar and Toggl. No workflow setup. No
            per-message fees.
          </p>

          {/* CTA group */}
          <div className="hero-cta-group">
            <a href="/signup" className="hero-btn-primary" style={{ fontFamily: 'var(--font-body)' }}>
              Start Free — No Credit Card
            </a>
            <a href="/docs" className="hero-btn-secondary" style={{ fontFamily: 'var(--font-body)' }}>
              Read the Docs
            </a>
          </div>

          {/* Social proof */}
          <p className="hero-social-proof" style={{ fontFamily: 'var(--font-body)' }}>
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
      <style>{`
        .final-cta-root {
          background-color: #0C1F40;
          padding: 96px 0;
          position: relative;
          overflow: hidden;
        }
        .final-cta-blob {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background-color: #B4E7DD;
          opacity: 0.10;
          filter: blur(100px);
          pointer-events: none;
        }
        .final-cta-container {
          position: relative;
          z-index: 10;
          max-width: 768px;
          margin: 0 auto;
          padding: 0 32px;
          text-align: center;
        }
        .final-cta-heading {
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .final-cta-sub {
          font-size: 20px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.65);
          font-family: var(--font-body);
          margin-bottom: 40px;
        }
        .final-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 36px;
          background-color: #B4E7DD;
          color: #0C1F40;
          border: none;
          border-radius: 0;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s ease;
          font-family: var(--font-body);
          cursor: pointer;
        }
        .final-cta-btn:hover { opacity: 0.85; }
        .final-cta-support {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.50);
          font-family: var(--font-body);
          margin-top: 16px;
        }
        .final-cta-support a {
          color: #B4E7DD;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .final-cta-support a:hover { opacity: 0.8; }
        @media (max-width: 900px) {
          .final-cta-root { padding: 60px 0; }
          .final-cta-heading { font-size: clamp(28px, 6vw, 40px); }
          .final-cta-btn { width: 100%; }
        }
      `}</style>

      <div className="final-cta-root">
        <div className="final-cta-blob" aria-hidden="true" />
        <div className="final-cta-container">
          <h2 className="final-cta-heading font-headline-expanded">
            Get your AI Discord bot running today.
          </h2>
          <p className="final-cta-sub">
            Free tier, no credit card, live in minutes.
          </p>
          <a href="/signup" className="final-cta-btn">
            Create Your Free Account
          </a>
          <p className="final-cta-support">
            Or read the docs first →{' '}
            <a href="/docs">View Quick Start</a>
          </p>
        </div>
      </div>
    </section>
  )
}

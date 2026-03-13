import { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/public-layout'

export const metadata: Metadata = {
  title: 'Daimon — AI Discord Bot, Bring Your Own Keys',
  description:
    'Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest. Free to start.',
  openGraph: {
    title: 'Daimon — AI Discord Bot, Bring Your Own Keys',
    description:
      'Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest.',
    url: 'https://daimon.ai',
    type: 'website',
    images: [{ url: 'https://daimon.ai/og/home.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daimon — AI Discord Bot, Bring Your Own Keys',
    description:
      'Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest.',
    images: ['https://daimon.ai/og/home.png'],
  },
  alternates: {
    canonical: 'https://daimon.ai',
  },
}

export default function LandingPage() {
  return (
    <PublicLayout>
      <HeroSection />
    </PublicLayout>
  )
}

function HeroSection() {
  return (
    <section className="hero-section hero-root">
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

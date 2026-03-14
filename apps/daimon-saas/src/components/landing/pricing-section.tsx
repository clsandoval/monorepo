'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

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

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  return (
    <section id="pricing" aria-label="Pricing" style={{ scrollMarginTop: '80px' }}>
      <style>{`
        .pricing-root {
          background-color: #F7F7F7;
          padding: 96px 0;
        }
        .pricing-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .pricing-section-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(12, 31, 64, 0.5);
          margin-bottom: 12px;
          font-family: var(--font-body);
          text-align: center;
        }
        .pricing-heading {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 500;
          color: #0C1F40;
          text-align: center;
          margin-bottom: 16px;
        }
        .pricing-divider {
          width: 48px;
          height: 3px;
          background-color: #B4E7DD;
          border-radius: 2px;
          margin: 24px auto;
        }
        .pricing-subheadline {
          font-size: 18px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.7);
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto 40px;
          text-align: center;
          font-family: var(--font-body);
        }

        /* Billing toggle */
        .pricing-toggle-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 48px;
        }
        .pricing-toggle {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid rgba(12, 31, 64, 0.15);
          border-radius: 0;
          overflow: hidden;
        }
        .pricing-toggle-btn {
          height: 38px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font-body);
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .pricing-toggle-btn.active {
          background-color: #B4E7DD;
          color: #0C1F40;
        }
        .pricing-toggle-btn.inactive {
          background-color: transparent;
          color: rgba(12, 31, 64, 0.6);
        }
        .pricing-save-badge {
          font-size: 12px;
          font-weight: 600;
          background-color: #B4E7DD;
          color: #0C1F40;
          padding: 2px 8px;
          border-radius: 0;
          font-family: var(--font-body);
        }

        /* Grid */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }

        /* Base card */
        .pricing-card {
          padding: 32px;
          border-radius: 0;
          position: relative;
        }
        .pricing-card-light {
          background-color: #FFFFFF;
          border: 1.5px solid rgba(12, 31, 64, 0.1);
        }
        .pricing-card-dark {
          background-color: #0C1F40;
          border: none;
        }

        /* Most popular badge */
        .pricing-popular-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 12px;
          font-weight: 600;
          background-color: #B4E7DD;
          color: #0C1F40;
          padding: 4px 14px;
          border-radius: 0;
          font-family: var(--font-body);
        }

        /* Plan name */
        .pricing-plan-name-light {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(12, 31, 64, 0.5);
          font-family: var(--font-body);
          margin-bottom: 16px;
        }
        .pricing-plan-name-dark {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--font-body);
          margin-bottom: 16px;
        }

        /* Price */
        .pricing-price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 4px;
        }
        .pricing-price-light {
          font-size: 48px;
          font-weight: 700;
          color: #0C1F40;
          line-height: 1;
        }
        .pricing-price-dark {
          font-size: 48px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1;
        }
        .pricing-price-period-light {
          font-size: 16px;
          font-weight: 400;
          color: rgba(12, 31, 64, 0.5);
          font-family: var(--font-body);
        }
        .pricing-price-period-dark {
          font-size: 16px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--font-body);
        }
        .pricing-annual-note {
          font-size: 13px;
          font-weight: 400;
          font-family: var(--font-body);
          margin-bottom: 4px;
        }
        .pricing-annual-note-light { color: rgba(12, 31, 64, 0.5); }
        .pricing-annual-note-dark { color: rgba(255, 255, 255, 0.4); }

        .pricing-price-desc-light {
          font-size: 14px;
          color: rgba(12, 31, 64, 0.6);
          font-family: var(--font-body);
          margin-top: 8px;
        }
        .pricing-price-desc-dark {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--font-body);
          margin-top: 8px;
        }

        /* Divider */
        .pricing-card-divider-light {
          border: none;
          border-top: 1px solid rgba(12, 31, 64, 0.08);
          margin: 24px 0;
        }
        .pricing-card-divider-dark {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 24px 0;
        }

        /* CTA buttons */
        .pricing-cta-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 44px;
          background-color: transparent;
          color: #0C1F40;
          border: 1.5px solid #0C1F40;
          border-radius: 0;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-body);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .pricing-cta-secondary:hover {
          background-color: #0C1F40;
          color: #FFFFFF;
        }
        .pricing-cta-primary-dark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 44px;
          background-color: #B4E7DD;
          color: #0C1F40;
          border: 1.5px solid #B4E7DD;
          border-radius: 0;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-body);
          text-decoration: none;
          transition: opacity 0.2s ease;
          cursor: pointer;
        }
        .pricing-cta-primary-dark:hover { opacity: 0.85; }

        /* Feature list */
        .pricing-feature-heading-light {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(12, 31, 64, 0.4);
          font-family: var(--font-body);
          margin-bottom: 12px;
        }
        .pricing-feature-heading-dark {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--font-body);
          margin-bottom: 12px;
        }
        .pricing-feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pricing-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.5;
        }
        .pricing-feature-item-light { color: rgba(12, 31, 64, 0.8); }
        .pricing-feature-item-dark { color: rgba(255, 255, 255, 0.85); }
        .pricing-bullet {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: #B4E7DD;
          flex-shrink: 0;
          margin-top: 5px;
        }

        /* BYOK note */
        .pricing-byok-wrap {
          margin-top: 32px;
          display: flex;
          justify-content: center;
        }
        .pricing-byok-note {
          max-width: 640px;
          width: 100%;
          background: rgba(180, 231, 221, 0.15);
          border: 1px solid rgba(180, 231, 221, 0.4);
          padding: 20px 24px;
          border-radius: 0;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .pricing-byok-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: rgba(12, 31, 64, 0.6);
        }
        .pricing-byok-text {
          font-size: 14px;
          font-family: var(--font-body);
          color: rgba(12, 31, 64, 0.7);
          line-height: 1.6;
        }
        .pricing-byok-text strong {
          font-weight: 600;
          color: #0C1F40;
        }

        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pricing-root">
        <div className="pricing-container">
          {/* Section header */}
          <p className="pricing-section-label">Pricing</p>
          <h2 className="pricing-heading font-headline-semi-expanded">
            Simple pricing. Your API costs stay yours.
          </h2>
          <div className="pricing-divider" />
          <p className="pricing-subheadline">
            Daimon charges a small platform fee. You pay Anthropic directly for AI usage. No per-message markup, no hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="pricing-toggle-wrap">
            <div className="pricing-toggle">
              <button
                className={`pricing-toggle-btn ${cycle === 'monthly' ? 'active' : 'inactive'}`}
                onClick={() => setCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`pricing-toggle-btn ${cycle === 'annual' ? 'active' : 'inactive'}`}
                onClick={() => setCycle('annual')}
              >
                Annual
                {cycle !== 'annual' && (
                  <span className="pricing-save-badge">Save 20%</span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing grid */}
          <div className="pricing-grid">
            {/* Free */}
            <div className="pricing-card pricing-card-light">
              <h3 className="pricing-plan-name-light">Free</h3>
              <div className="pricing-price-row">
                <span className="pricing-price-light font-headline-expanded">$0</span>
                <span className="pricing-price-period-light">/ month</span>
              </div>
              <p className="pricing-price-desc-light">Forever free. Bring your own Anthropic key.</p>
              <hr className="pricing-card-divider-light" />
              <a href="/signup" className="pricing-cta-secondary">Get Started Free</a>
              <hr className="pricing-card-divider-light" />
              <p className="pricing-feature-heading-light">What&apos;s included</p>
              <ul className="pricing-feature-list">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="pricing-feature-item pricing-feature-item-light">
                    <span className="pricing-bullet" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Starter — Most Popular */}
            <div className="pricing-card pricing-card-dark">
              <span className="pricing-popular-badge">Most Popular</span>
              <h3 className="pricing-plan-name-dark">Starter</h3>
              <div className="pricing-price-row">
                <span className="pricing-price-dark font-headline-expanded">
                  {cycle === 'monthly' ? '$9' : '$6.58'}
                </span>
                <span className="pricing-price-period-dark">/ month</span>
              </div>
              {cycle === 'annual' && (
                <p className="pricing-annual-note pricing-annual-note-dark">billed $79/yr</p>
              )}
              <p className="pricing-price-desc-dark">A small platform fee. You pay Anthropic separately.</p>
              <hr className="pricing-card-divider-dark" />
              <a href="/signup" className="pricing-cta-primary-dark">Start Starter Plan</a>
              <hr className="pricing-card-divider-dark" />
              <p className="pricing-feature-heading-dark">What&apos;s included</p>
              <ul className="pricing-feature-list">
                {STARTER_FEATURES.map((f) => (
                  <li key={f} className="pricing-feature-item pricing-feature-item-dark">
                    <span className="pricing-bullet" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-card-light">
              <h3 className="pricing-plan-name-light">Pro</h3>
              <div className="pricing-price-row">
                <span className="pricing-price-light font-headline-expanded">
                  {cycle === 'monthly' ? '$29' : '$20.75'}
                </span>
                <span className="pricing-price-period-light">/ month</span>
              </div>
              {cycle === 'annual' && (
                <p className="pricing-annual-note pricing-annual-note-light">billed $249/yr</p>
              )}
              <p className="pricing-price-desc-light">For teams and power users.</p>
              <hr className="pricing-card-divider-light" />
              <a href="/signup" className="pricing-cta-secondary">Start Pro Plan</a>
              <hr className="pricing-card-divider-light" />
              <p className="pricing-feature-heading-light">What&apos;s included</p>
              <ul className="pricing-feature-list">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="pricing-feature-item pricing-feature-item-light">
                    <span className="pricing-bullet" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BYOK note */}
          <div className="pricing-byok-wrap">
            <div className="pricing-byok-note">
              <Info size={16} className="pricing-byok-icon" />
              <p className="pricing-byok-text">
                <strong>How BYOK pricing works</strong>: Daimon charges only the platform fee above. Your bot&apos;s AI usage (Claude API calls) is billed directly from Anthropic to your API key. You keep full visibility and control over your AI spending.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

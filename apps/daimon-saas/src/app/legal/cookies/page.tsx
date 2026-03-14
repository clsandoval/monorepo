import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';

export const metadata: Metadata = {
  title: 'Cookie Policy — Daimon',
  description: 'Learn about the cookies and tracking technologies Daimon uses on daimon.ai.',
  openGraph: {
    title: 'Cookie Policy — Daimon',
    description: 'How we use cookies and similar technologies.',
  },
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://daimon.ai/legal/cookies',
  },
};

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <main>
        <article className="max-w-3xl mx-auto px-8 py-20">
          <h1
            className="font-archivo font-bold text-[#0C1F40]"
            style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}
          >
            Cookie Policy
          </h1>
          <p className="mt-2 text-[#718096]" style={{ fontSize: '14px' }}>
            Effective Date: March 13, 2026
          </p>
          <p className="text-[#718096] mb-12" style={{ fontSize: '14px' }}>
            Last Updated: March 13, 2026
          </p>

          {/* Table of contents */}
          <nav aria-label="Cookie policy table of contents" className="mb-12">
            <p className="font-archivo font-bold text-[#0C1F40] mb-3" style={{ fontSize: '16px' }}>
              Table of Contents
            </p>
            <ol className="ml-6 space-y-1" style={{ fontSize: '15px' }}>
              <li>
                <a href="#what-are-cookies" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  1. What Are Cookies?
                </a>
              </li>
              <li>
                <a href="#how-we-use-cookies" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  2. How We Use Cookies
                </a>
              </li>
              <li>
                <a href="#types-of-cookies-we-use" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  3. Types of Cookies We Use
                </a>
              </li>
              <li>
                <a href="#third-party-cookies" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  4. Third-Party Cookies
                </a>
              </li>
              <li>
                <a href="#cookie-consent-and-your-choices" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  5. Cookie Consent and Your Choices
                </a>
              </li>
              <li>
                <a href="#specific-cookie-inventory" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  6. Specific Cookie Inventory
                </a>
              </li>
              <li>
                <a href="#browser-controls" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  7. Browser Controls
                </a>
              </li>
              <li>
                <a href="#do-not-track" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  8. Do Not Track
                </a>
              </li>
              <li>
                <a href="#changes-to-this-policy" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  9. Changes to This Policy
                </a>
              </li>
              <li>
                <a href="#contact-us" className="text-[#0C1F40] hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  10. Contact Us
                </a>
              </li>
            </ol>
          </nav>

          <div
            className="text-[#2D3748] space-y-4"
            style={{ fontSize: '16px', lineHeight: '1.75' }}
          >
            {/* Section 1 */}
            <h2
              id="what-are-cookies"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone, tablet)
              when you visit a website. They are widely used to make websites work more efficiently and
              to provide information to the website operator.
            </p>
            <p>
              Cookies allow a website to recognize your device and remember certain information about
              your preferences or past actions.
            </p>
            <p>
              Similar technologies, including local storage, session storage, and pixels, may also be
              used for similar purposes as cookies. This policy covers all such technologies.
            </p>

            {/* Section 2 */}
            <h2
              id="how-we-use-cookies"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              2. How We Use Cookies
            </h2>
            <p>
              Daimon (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) uses cookies and similar
              technologies on our website (<code className="bg-gray-100 px-1 rounded text-sm">daimon.ai</code>)
              and web application for the following purposes:
            </p>
            <ul className="ml-6 space-y-2">
              <li><strong className="font-bold text-[#0C1F40]">Authentication:</strong> To keep you logged in to your account and recognize your session across page loads.</li>
              <li><strong className="font-bold text-[#0C1F40]">Security:</strong> To protect against cross-site request forgery (CSRF) and other security threats.</li>
              <li><strong className="font-bold text-[#0C1F40]">Preferences:</strong> To remember your settings and preferences (such as theme or language).</li>
              <li><strong className="font-bold text-[#0C1F40]">Analytics:</strong> To understand how visitors use our site, which pages are visited most, and how users navigate.</li>
              <li><strong className="font-bold text-[#0C1F40]">Performance:</strong> To optimize the speed and performance of our site.</li>
            </ul>
            <p>We do not use cookies for advertising, retargeting, or cross-site tracking for third-party purposes.</p>

            {/* Section 3 */}
            <h2
              id="types-of-cookies-we-use"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              3. Types of Cookies We Use
            </h2>

            <h3 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px' }}>
              3.1 Strictly Necessary Cookies
            </h3>
            <p>
              These cookies are required for the website to function. They cannot be disabled. Without
              them, you cannot log in, access your dashboard, or use the application.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full border-collapse" style={{ fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F7F7F7' }}>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Cookie Name</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Purpose</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">sb-access-token</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Supabase Auth — stores your authentication session token</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Session (until logout or expiry)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">sb-refresh-token</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Supabase Auth — stores your session refresh token for automatic renewal</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>60 days (rolling)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">__Host-next-auth.csrf-token</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>CSRF protection for server actions</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Session</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">next-auth.session-token</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Next.js session management</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p><strong className="font-bold text-[#0C1F40]">Legal basis:</strong> Legitimate interests (strictly necessary for service operation).</p>

            <h3 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px' }}>
              3.2 Functional Cookies
            </h3>
            <p>
              These cookies enhance your experience but are not strictly required. You may disable them,
              but some features may not work as expected.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full border-collapse" style={{ fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F7F7F7' }}>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Cookie Name</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Purpose</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">daimon-theme</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Stores your UI theme preference</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>1 year</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">daimon-onboarding-dismissed</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Remembers if you have dismissed the onboarding checklist</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>30 days</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">daimon-sidebar-state</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Stores whether the sidebar is expanded or collapsed</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p><strong className="font-bold text-[#0C1F40]">Legal basis:</strong> Consent / legitimate interests.</p>

            <h3 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px' }}>
              3.3 Analytics Cookies
            </h3>
            <p>
              We use analytics to understand how our site is used so we can improve it. We use
              privacy-respecting analytics tools that do not share data with third-party advertisers.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full border-collapse" style={{ fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F7F7F7' }}>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Cookie Name</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Set By</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Purpose</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">_vercel_insights</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Vercel</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Tracks anonymous page view and performance metrics</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Session</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">vercel-analytics-id</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Vercel</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Persistent anonymous visitor identifier for Vercel Analytics</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong className="font-bold text-[#0C1F40]">Legal basis:</strong> Legitimate interests
              (we use anonymized, aggregated data only). You may opt out via browser controls or by
              enabling &ldquo;Do Not Track.&rdquo;
            </p>

            {/* Section 4 */}
            <h2
              id="third-party-cookies"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              4. Third-Party Cookies
            </h2>
            <p>
              Our service integrates with the following third parties who may set cookies on your device:
            </p>

            <h3 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px' }}>
              4.1 Supabase
            </h3>
            <p>
              Supabase (supabase.com) provides our authentication and database infrastructure. When you
              authenticate via Supabase, authentication-related cookies are set in our{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">daimon.ai</code> domain (not
              third-party). Supabase may also set cookies on their own domains for their infrastructure.
              See Supabase&apos;s Privacy Policy for details.
            </p>

            <h3 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px' }}>
              4.2 Stripe
            </h3>
            <p>
              When you visit our billing pages or initiate a Stripe Checkout session, Stripe
              (stripe.com) may set cookies for fraud prevention, performance, and compliance purposes.
              These cookies are set by Stripe&apos;s domains, not our domain.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full border-collapse" style={{ fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F7F7F7' }}>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Cookie</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Set By</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Purpose</th>
                    <th className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">__stripe_mid</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>stripe.com</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Fraud detection</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>1 year</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">__stripe_sid</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>stripe.com</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Fraud detection</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>30 minutes</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}><code className="text-xs bg-gray-100 px-1 rounded">stripe.csrf</code></td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>stripe.com</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>CSRF protection during checkout</td>
                    <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px' }}>
              4.3 Vercel
            </h3>
            <p>
              Vercel (vercel.com) hosts our website. They may set performance and security cookies.
            </p>
            <p>We do not use cookies from:</p>
            <ul className="ml-6 space-y-1">
              <li>Facebook / Meta</li>
              <li>Google Ads</li>
              <li>Twitter / X</li>
              <li>LinkedIn</li>
              <li>Any advertising networks</li>
            </ul>

            {/* Section 5 */}
            <h2
              id="cookie-consent-and-your-choices"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              5. Cookie Consent and Your Choices
            </h2>
            <p>
              <strong className="font-bold text-[#0C1F40]">Strictly necessary cookies:</strong> These
              cookies are set automatically as they are required for the service to function. You cannot
              decline them and continue to use the service.
            </p>
            <p>
              <strong className="font-bold text-[#0C1F40]">Functional cookies:</strong> These cookies
              are set when you take actions that trigger them (e.g., adjusting your sidebar). You can
              clear them via your browser settings at any time.
            </p>
            <p>
              <strong className="font-bold text-[#0C1F40]">Analytics cookies:</strong> On your first
              visit, we do not require explicit consent for analytics cookies where we use only
              anonymized, aggregated data (as permitted by applicable law in our operating
              jurisdiction). If you prefer to opt out:
            </p>
            <ul className="ml-6 space-y-2">
              <li>Enable &ldquo;Do Not Track&rdquo; in your browser (we honor this signal — see §8)</li>
              <li>Use a browser extension such as Privacy Badger or uBlock Origin</li>
              <li>Clear cookies and use private/incognito mode</li>
              <li>Contact us at <code className="text-xs bg-gray-100 px-1 rounded">privacy@daimon.ai</code> to opt out of analytics tracking</li>
            </ul>
            <p>
              If you are in a jurisdiction requiring explicit cookie consent (e.g., the EU under
              GDPR/ePrivacy), a cookie consent banner will appear on your first visit, and analytics
              cookies will not be set until you consent.
            </p>

            {/* Section 6 */}
            <h2
              id="specific-cookie-inventory"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              6. Specific Cookie Inventory
            </h2>
            <p>
              Complete list of all cookies set on <code className="text-xs bg-gray-100 px-1 rounded">daimon.ai</code>{' '}
              and <code className="text-xs bg-gray-100 px-1 rounded">app.daimon.ai</code>:
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full border-collapse" style={{ fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F7F7F7' }}>
                    {['Name', 'Domain', 'Type', 'Duration', 'Purpose'].map((h) => (
                      <th key={h} className="font-archivo font-bold text-[#0C1F40] text-left" style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sb-access-token', 'daimon.ai', 'Strictly Necessary', 'Session', 'Supabase Auth access token'],
                    ['sb-refresh-token', 'daimon.ai', 'Strictly Necessary', '60 days', 'Supabase Auth refresh token'],
                    ['__Host-next-auth.csrf-token', 'daimon.ai', 'Strictly Necessary', 'Session', 'CSRF protection'],
                    ['next-auth.session-token', 'daimon.ai', 'Strictly Necessary', 'Session', 'Session management'],
                    ['daimon-theme', 'daimon.ai', 'Functional', '1 year', 'UI theme preference'],
                    ['daimon-onboarding-dismissed', 'daimon.ai', 'Functional', '30 days', 'Onboarding checklist state'],
                    ['daimon-sidebar-state', 'daimon.ai', 'Functional', '1 year', 'Sidebar expand/collapse state'],
                    ['_vercel_insights', 'daimon.ai', 'Analytics', 'Session', 'Vercel anonymous analytics'],
                    ['vercel-analytics-id', 'daimon.ai', 'Analytics', '1 year', 'Vercel anonymous visitor ID'],
                    ['__stripe_mid', 'stripe.com', 'Third-Party (Fraud)', '1 year', 'Stripe fraud detection'],
                    ['__stripe_sid', 'stripe.com', 'Third-Party (Fraud)', '30 min', 'Stripe fraud detection'],
                    ['stripe.csrf', 'stripe.com', 'Third-Party (Security)', 'Session', 'Stripe CSRF protection'],
                  ].map(([name, domain, type, duration, purpose]) => (
                    <tr key={name}>
                      <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>
                        <code className="text-xs bg-gray-100 px-1 rounded">{name}</code>
                      </td>
                      <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>{domain}</td>
                      <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>{type}</td>
                      <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>{duration}</td>
                      <td style={{ padding: '12px 16px', border: '1px solid rgba(12,31,64,0.08)' }}>{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[#718096]" style={{ fontSize: '14px' }}>
              This list is reviewed and updated quarterly. Last reviewed: March 13, 2026.
            </p>

            {/* Section 7 */}
            <h2
              id="browser-controls"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              7. Browser Controls
            </h2>
            <p>
              You can control and delete cookies using your browser&apos;s settings. The following
              links explain how to manage cookies in major browsers:
            </p>
            <ul className="ml-6 space-y-2">
              <li><strong className="font-bold text-[#0C1F40]">Chrome:</strong> chrome://settings/cookies</li>
              <li><strong className="font-bold text-[#0C1F40]">Firefox:</strong> about:preferences#privacy</li>
              <li><strong className="font-bold text-[#0C1F40]">Safari:</strong> Preferences → Privacy</li>
              <li><strong className="font-bold text-[#0C1F40]">Edge:</strong> edge://settings/cookies</li>
              <li><strong className="font-bold text-[#0C1F40]">Opera:</strong> opera://settings/privacy-browser</li>
            </ul>
            <p>
              <strong className="font-bold text-[#0C1F40]">Important:</strong> If you delete or block
              strictly necessary cookies, you will be logged out and may not be able to access your
              dashboard.
            </p>
            <p>
              To opt out of Vercel Analytics specifically, you can install a browser extension that
              blocks the Vercel Analytics endpoint (
              <code className="text-xs bg-gray-100 px-1 rounded">/_vercel/insights</code>) or use a
              content blocker.
            </p>

            {/* Section 8 */}
            <h2
              id="do-not-track"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              8. Do Not Track
            </h2>
            <p>
              We honor the &ldquo;Do Not Track&rdquo; (DNT) browser signal. When DNT is enabled in
              your browser, we:
            </p>
            <ol className="ml-6 space-y-2">
              <li>Do not set analytics cookies (<code className="text-xs bg-gray-100 px-1 rounded">_vercel_insights</code>, <code className="text-xs bg-gray-100 px-1 rounded">vercel-analytics-id</code>)</li>
              <li>Do not log your page view data for analytics purposes</li>
              <li>Continue to set strictly necessary cookies (required for authentication and security)</li>
            </ol>
            <p>
              Note: DNT is a browser-level preference and does not affect cookies set by third-party
              services like Stripe (which sets cookies for fraud prevention, a legitimate interest that
              overrides DNT).
            </p>

            {/* Section 9 */}
            <h2
              id="changes-to-this-policy"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices,
              technology, or legal requirements. When we update the policy, we will:
            </p>
            <ol className="ml-6 space-y-2">
              <li>Update the &ldquo;Last Updated&rdquo; date at the top of this page</li>
              <li>If changes are material, notify you via email (if you have an account) or via a banner on the website</li>
              <li>
                Maintain the previous version in our changelog at{' '}
                <Link href="/changelog" className="hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                  /changelog
                </Link>
              </li>
            </ol>
            <p>
              Continued use of the website after the effective date of a change constitutes your
              acceptance of the updated policy.
            </p>

            {/* Section 10 */}
            <h2
              id="contact-us"
              className="font-archivo font-bold text-[#0C1F40]"
              style={{ fontSize: '22px', marginTop: '48px', marginBottom: '16px' }}
            >
              10. Contact Us
            </h2>
            <p>
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <ul className="ml-6 space-y-2">
              <li><strong className="font-bold text-[#0C1F40]">Email:</strong> <code className="text-xs bg-gray-100 px-1 rounded">privacy@daimon.ai</code></li>
              <li><strong className="font-bold text-[#0C1F40]">Subject:</strong> &ldquo;Cookie Policy Inquiry&rdquo;</li>
              <li><strong className="font-bold text-[#0C1F40]">Response time:</strong> Within 10 business days</li>
            </ul>
            <p>You may also submit a request to:</p>
            <ul className="ml-6 space-y-2">
              <li>Opt out of analytics cookies</li>
              <li>Receive a complete list of cookies currently set on your device associated with your account</li>
              <li>Request deletion of any non-essential cookie data we hold</li>
            </ul>

            <hr className="my-10" style={{ borderColor: 'rgba(12,31,64,0.1)' }} />

            <p className="text-[#718096]" style={{ fontSize: '14px' }}>
              This Cookie Policy is incorporated by reference into our{' '}
              <Link href="/legal/privacy" className="hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/legal/terms" className="hover:opacity-70" style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}>
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';

export const metadata: Metadata = {
  title: 'Privacy Policy — Daimon',
  description:
    'Read the Daimon Privacy Policy explaining how we collect, use, disclose, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy — Daimon',
    description: 'Privacy Policy for the Daimon Discord bot platform.',
  },
  alternates: {
    canonical: 'https://daimon.bot/privacy',
  },
};

const tableClass =
  'w-full text-left border-collapse mb-6 overflow-x-auto block';
const thClass =
  'border border-border bg-background px-3 py-2 font-semibold text-foreground text-base';
const tdClass = 'border border-border px-3 py-2 text-[#4A5568] text-base leading-relaxed';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <main>
        <article className="max-w-3xl mx-auto px-8 py-20">
          <h1
            className="font-archivo font-bold text-foreground text-[clamp(28px,4vw,36px)]"
          >
            Privacy Policy
          </h1>
          <p className="mt-2 text-[#718096] text-sm">
            Effective Date: March 13, 2026
          </p>
          <p className="text-[#718096] mb-12 text-sm">
            Last Updated: March 13, 2026
          </p>

          {/* Table of Contents */}
          <nav aria-label="Privacy policy table of contents" className="mb-12">
            <p className="font-archivo font-bold text-foreground mb-3 text-base">
              Table of Contents
            </p>
            <ol className="ml-6 space-y-1 text-[15px]">
              {[
                ['#introduction', 'Introduction'],
                ['#section-1', '1. Information We Collect'],
                ['#section-2', '2. How We Use Your Information'],
                ['#section-3', '3. How We Share Your Information'],
                ['#section-4', '4. Credentials and Sensitive Data — Special Handling'],
                ['#section-5', '5. Discord and Bot Message Data'],
                ['#section-6', '6. Cookies and Tracking Technologies'],
                ['#section-7', '7. Data Retention'],
                ['#section-8', '8. Data Security'],
                ['#section-9', '9. International Data Transfers'],
                ['#section-10', '10. Children&apos;s Privacy'],
                ['#section-11', '11. Third-Party Services and Links'],
                ['#section-12', '12. Your Rights and Choices'],
                ['#section-13', '13. EEA, UK, and Swiss User Rights (GDPR / UK GDPR)'],
                ['#section-14', '14. California Consumer Privacy Rights (CCPA / CPRA)'],
                ['#section-15', '15. Changes to This Privacy Policy'],
                ['#section-16', '16. Contact Us'],
                ['#appendix-a', 'Appendix A: Data Processing Agreement Summary'],
                ['#appendix-b', 'Appendix B: Sub-Processor Change Notice Process'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-foreground hover:opacity-70 underline decoration-primary"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose-legal">
            {/* Introduction */}
            <section id="introduction" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                Introduction
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                PyMC Technologies, Inc. (&ldquo;Company,&rdquo; &ldquo;Daimon,&rdquo;
                &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
                protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
                and protect your personal information when you use the Daimon platform, including the
                website at daimon.bot (and any subdomains), the web application dashboard, the
                Discord bot service, and all related services (collectively, the
                &ldquo;Service&rdquo;).
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed font-semibold text-[15px]">
                This Privacy Policy is incorporated by reference into our Terms of Service. By
                creating an Account or using the Service, you agree to this Privacy Policy.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If you do not agree with this Privacy Policy, do not create an Account or use the
                Service.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                <strong>For users in the European Economic Area (EEA), United Kingdom, and
                Switzerland</strong>: PyMC Technologies, Inc. is the data controller for your
                personal data as described in this Privacy Policy. Your additional rights under the
                GDPR and UK GDPR are described in Section 13.
              </p>
            </section>

            {/* Section 1 */}
            <section id="section-1" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                1. Information We Collect
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We collect information you provide directly, information collected automatically, and
                information from third parties.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                1.1 Information You Provide Directly
              </h3>
              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Account Registration Data
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">Email address (required at signup)</li>
                <li className="text-[#4A5568] leading-relaxed">
                  Password (stored as a cryptographic hash; we never store your plaintext password)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Full name (optional, provided via dashboard profile settings)
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Tenant Configuration Data
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">Tenant/workspace name</li>
                <li className="text-[#4A5568] leading-relaxed">
                  Discord Guild ID (the numeric ID of your Discord server)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Discord Bot Token (see Section 4 &mdash; encrypted, special handling)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Anthropic API Key (see Section 4 &mdash; encrypted, special handling)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  OpenAI API Key, if provided (see Section 4 &mdash; encrypted, special handling)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Third-party service API keys for Integrations (Toggl, etc.) (see Section 4 &mdash;
                  encrypted, special handling)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  OAuth tokens for Integrations (GitHub, Google, Linear) (see Section 4 &mdash;
                  encrypted, special handling)
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Billing Data
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Payment card information &mdash; note: we do NOT store full card numbers, expiry
                  dates, or CVVs. All payment card data is processed directly by Stripe, Inc. and
                  stored in Stripe&apos;s systems. We receive and store a Stripe Customer ID, Stripe
                  Subscription ID, Stripe Payment Method ID (a token that does not contain sensitive
                  card data), and billing status from Stripe.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Billing name and billing email address (used for Stripe Customer creation)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Billing address (country, postal code) &mdash; collected by Stripe at checkout for
                  tax calculation
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Communications
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Email address and message content when you contact us for support or other inquiries
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Information you provide in bug reports, feature requests, or feedback forms
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Profile and Preferences
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">Timezone preference (optional)</li>
                <li className="text-[#4A5568] leading-relaxed">
                  Notification preferences (email opt-in/out settings)
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                1.2 Information Collected Automatically
              </h3>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Log Data and Telemetry
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  IP address (collected for security and fraud prevention; see retention period in
                  Section 7)
                </li>
                <li className="text-[#4A5568] leading-relaxed">Browser type and version</li>
                <li className="text-[#4A5568] leading-relaxed">Operating system</li>
                <li className="text-[#4A5568] leading-relaxed">
                  HTTP request headers (User-Agent, Referer, Accept-Language)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Pages visited within the Service and timestamps
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Actions performed within the dashboard (e.g., connecting an Integration, submitting
                  a form) &mdash; logged for security audit purposes
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Error messages and stack traces (for bug diagnosis)
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Bot Operational Data
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Bot connection status per tenant (connected, disconnected, error state)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Timestamp of last heartbeat received from your Bot instance
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Number of messages processed per day (aggregate count only, not content)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Tool invocation counts per integration type per day (aggregate counts only)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  API call error rates and latencies per tenant (aggregate metrics, no message
                  content)
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Cookies and Local Storage
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Session tokens (authentication cookies &mdash; see Section 6)
                </li>
                <li className="text-[#4A5568] leading-relaxed">CSRF tokens</li>
                <li className="text-[#4A5568] leading-relaxed">
                  Preferences stored in local storage (e.g., dashboard sidebar collapsed state)
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                1.3 Information from Third Parties
              </h3>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Supabase Authentication Provider
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                When you sign up or log in, Supabase Auth manages authentication. Supabase may log
                authentication events (login, logout, password reset) on our behalf.
              </p>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Stripe
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                When you purchase a subscription, Stripe provides us with subscription status, plan
                information, billing cycle dates, invoice history, and payment failure events. Stripe
                may also share fraud signals.
              </p>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                OAuth Providers (GitHub, Google, Linear)
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                When you connect an Integration using OAuth, the provider shares with us: your user
                ID at that provider, your username/display name, your email address (if within the
                requested scopes), and the OAuth access token and refresh token. We use these solely
                to enable the Integration.
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>GitHub OAuth</strong>: We receive your GitHub user ID, username, email (if
                  public or granted), and access token. Scopes requested:{' '}
                  <code className="bg-background px-1 rounded text-sm">repo</code>,{' '}
                  <code className="bg-background px-1 rounded text-sm">user:email</code>.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Google OAuth</strong>: We receive your Google user ID, display name, email
                  address, and access token. Scopes requested:{' '}
                  <code className="bg-background px-1 rounded text-sm">userinfo.email</code>,{' '}
                  <code className="bg-background px-1 rounded text-sm">userinfo.profile</code>, plus
                  any Google service-specific scopes required by the tools you use.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Linear OAuth</strong>: We receive your Linear user ID, display name, email
                  address, and access token. Scopes requested:{' '}
                  <code className="bg-background px-1 rounded text-sm">read</code>,{' '}
                  <code className="bg-background px-1 rounded text-sm">write</code>,{' '}
                  <code className="bg-background px-1 rounded text-sm">issues:create</code>,{' '}
                  <code className="bg-background px-1 rounded text-sm">comments:create</code>.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                2. How We Use Your Information
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We use the information we collect for the following purposes, each with its legal
                basis:
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                2.1 Providing and Operating the Service
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Data Used</th>
                      <th className={thClass}>Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Creating and managing your Account', 'Email, password hash, name', 'Contract performance'],
                      ['Running your Bot instance', 'Bot Token, Guild ID, Anthropic API Key', 'Contract performance'],
                      ['Processing Discord messages through your Bot\'s AI capabilities', 'Anthropic API Key (used in transit to Anthropic\'s API), message context held in runtime memory', 'Contract performance'],
                      ['Enabling Integrations', 'OAuth tokens, API keys', 'Contract performance'],
                      ['Managing your subscription', 'Stripe IDs, plan status', 'Contract performance'],
                      ['Sending billing receipts and invoices', 'Email, billing details', 'Contract performance / Legal obligation'],
                      ['Providing customer support', 'Email, support message content', 'Contract performance / Legitimate interests'],
                    ].map(([purpose, data, basis], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                2.2 Security and Fraud Prevention
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Data Used</th>
                      <th className={thClass}>Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Detecting and preventing unauthorized access', 'IP address, login events, request logs', 'Legitimate interests'],
                      ['Verifying identity for account recovery', 'Email, IP address, session metadata', 'Legitimate interests / Contract performance'],
                      ['Rate limiting and abuse prevention', 'IP address, request patterns', 'Legitimate interests'],
                      ['Maintaining audit logs for compliance', 'User actions, timestamps', 'Legal obligation / Legitimate interests'],
                      ['Security incident investigation', 'Log data, request metadata', 'Legal obligation / Legitimate interests'],
                    ].map(([purpose, data, basis], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                2.3 Service Improvement and Analytics
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Data Used</th>
                      <th className={thClass}>Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Understanding usage patterns to improve the Service', 'Aggregate, anonymized usage metrics (never individual message content)', 'Legitimate interests'],
                      ['Diagnosing bugs and errors', 'Error logs, stack traces', 'Legitimate interests'],
                      ['Improving Bot operational reliability', 'Aggregate connection status, error rates', 'Legitimate interests'],
                      ['A/B testing UI improvements', 'Aggregate page interaction data', 'Legitimate interests'],
                    ].map(([purpose, data, basis], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                2.4 Communications
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Data Used</th>
                      <th className={thClass}>Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Sending transactional emails (account confirmation, password reset, invoice)', 'Email', 'Contract performance'],
                      ['Sending service notifications (downtime, security alerts, policy changes)', 'Email', 'Legitimate interests / Legal obligation'],
                      ['Sending product update emails', 'Email', 'Consent (you may opt out at any time)'],
                      ['Responding to support requests', 'Email, support message content', 'Contract performance'],
                    ].map(([purpose, data, basis], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                2.5 Legal Compliance
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Data Used</th>
                      <th className={thClass}>Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Complying with applicable laws and regulations', 'As required by specific legal obligation', 'Legal obligation'],
                      ['Responding to lawful government requests, subpoenas, or court orders', 'As required', 'Legal obligation'],
                      ['Enforcing our Terms of Service', 'Account data, usage logs', 'Legitimate interests'],
                      ['Resolving disputes', 'Account data, billing records', 'Legitimate interests / Legal obligation'],
                    ].map(([purpose, data, basis], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                2.6 What We Do NOT Do with Your Data
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  We do <strong>not</strong> sell your personal information to third parties.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  We do <strong>not</strong> use your Discord message content to train AI models.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  We do <strong>not</strong> read your Discord messages except as required to operate
                  the Bot (the message content passes through our infrastructure in-transit to
                  Anthropic&apos;s API but is not stored).
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  We do <strong>not</strong> share your Credentials (API keys, tokens) with any party
                  except as strictly necessary to operate the Service on your behalf.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  We do <strong>not</strong> use your data for advertising targeting.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  We do <strong>not</strong> share your data with data brokers.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                3. How We Share Your Information
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We share personal information only in the limited circumstances described below.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                3.1 Service Providers (Sub-Processors)
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We use trusted third-party companies that process data on our behalf to operate the
                Service. Each sub-processor is bound by data processing agreements and is permitted
                to use your data only as directed by us.
              </p>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Sub-Processor</th>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Data Shared</th>
                      <th className={thClass}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Supabase, Inc.', 'Database, authentication, file storage, Realtime infrastructure', 'All data in our database (email, tenant config, encrypted credentials, subscription status, audit logs, operational metrics)', 'United States (AWS us-east-1); EU-hosted option available on request'],
                      ['Stripe, Inc.', 'Payment processing and subscription management', 'Billing email, billing name, billing address, subscription plan', 'United States'],
                      ['Vercel, Inc.', 'Web application hosting (Next.js frontend and API routes)', 'HTTP request data, IP address, session tokens', 'United States (AWS us-east-1 / global edge)'],
                      ['Fly.io, Inc.', 'Bot process hosting', 'Bot operational data (connection status, logs)', 'United States (or region selected at deployment)'],
                      ['Anthropic, PBC', 'AI inference (Claude API)', 'Discord message content passed in-transit using your Anthropic API Key; no persistent storage by us', 'United States'],
                      ['Sentry, Inc. (optional)', 'Error tracking and crash reporting', 'Error messages, stack traces, anonymized user ID, IP address', 'United States'],
                      ['Langfuse GmbH (optional)', 'LLM observability and tracing', 'Prompts and responses (anonymized/truncated); configured to minimize PII', 'Germany (EU)'],
                      ['Resend, Inc.', 'Transactional email delivery (email confirmation, password reset)', 'Email address, email content', 'United States'],
                    ].map(([name, purpose, data, location], i) => (
                      <tr key={i}>
                        <td className={tdClass + ' font-semibold'}>{name}</td>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                3.2 OAuth Integration Providers
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                When you connect an Integration, you authorize us to exchange data with that provider
                (GitHub, Google, Linear) on your behalf. The data exchange is limited to what is
                necessary for the Integration. We do not share your data with these providers beyond
                what is required to authenticate and use the Integration.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                3.3 Discord, Inc.
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Your Bot Token is used to make API calls to Discord&apos;s API on your behalf.
                Discord receives API requests authenticated with your Bot Token. Discord&apos;s
                handling of data is governed by Discord&apos;s Privacy Policy. We are not
                responsible for Discord&apos;s data practices.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                3.4 Business Transfers
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If we are involved in a merger, acquisition, financing, reorganization, bankruptcy,
                or sale of all or a portion of our assets, your personal information may be
                transferred as part of that transaction. We will notify you via email and a prominent
                notice on the Service at least 30 days before your personal information becomes
                subject to a different Privacy Policy as a result of such a transaction.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                3.5 Legal Requirements and Safety
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We may disclose your information if we believe in good faith that disclosure is
                necessary to:
              </p>
              <ul className="list-none ml-0 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">(a) comply with a legal obligation, court order, or valid legal process (e.g., subpoena, search warrant);</li>
                <li className="text-[#4A5568] leading-relaxed">(b) protect and defend the rights or property of the Company;</li>
                <li className="text-[#4A5568] leading-relaxed">(c) prevent or investigate possible wrongdoing in connection with the Service;</li>
                <li className="text-[#4A5568] leading-relaxed">(d) protect the safety of you, other users, or the public;</li>
                <li className="text-[#4A5568] leading-relaxed">(e) protect against legal liability.</li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Where legally permitted, we will attempt to notify you before complying with such a
                request.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                3.6 Aggregated and Anonymized Data
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We may share aggregated, anonymized, or de-identified information that cannot
                reasonably be used to identify you, for purposes such as analytics, industry
                research, or marketing. This data is not personal information.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                4. Credentials and Sensitive Data &mdash; Special Handling
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                This section describes our special handling of the most sensitive categories of data
                you entrust to us.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                4.1 What We Consider Credentials
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Credential Type</th>
                      <th className={thClass}>How Provided</th>
                      <th className={thClass}>Required/Optional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Discord Bot Token', 'Pasted into dashboard Settings', 'Required for Bot operation'],
                      ['Anthropic API Key', 'Pasted into dashboard Billing/Settings', 'Required for AI features'],
                      ['OpenAI API Key', 'Pasted into dashboard Settings', 'Optional (classification enhancement)'],
                      ['GitHub OAuth access token + refresh token', 'Set by OAuth callback', 'Optional (GitHub Integration)'],
                      ['Google OAuth access token + refresh token', 'Set by OAuth callback', 'Optional (Google Integration)'],
                      ['Linear OAuth access token + refresh token', 'Set by OAuth callback', 'Optional (Linear Integration)'],
                      ['Toggl API key', 'Pasted into Integrations page', 'Optional (Toggl Integration)'],
                      ['Any other third-party API key', 'Pasted into Integrations page', 'Optional'],
                    ].map(([type, how, req], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{type}</td>
                        <td className={tdClass}>{how}</td>
                        <td className={tdClass}>{req}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                4.2 Encryption at Rest
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                All Credentials listed above are encrypted at rest using{' '}
                <strong>Supabase Vault</strong>, which uses{' '}
                <strong>AES-256-GCM</strong> symmetric encryption. The encryption keys are managed
                by Supabase&apos;s key management system and are not stored in the same database as
                the encrypted values. Credentials are never stored in plaintext in any database
                column, log file, error report, or application cache.
              </p>
              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                What this means technically:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  The raw credential value you paste is immediately encrypted before being written to
                  the database.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  The column in the database stores a Vault secret ID (a UUID reference), not the raw
                  value.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  To decrypt, the application calls the Supabase Vault{' '}
                  <code className="bg-background px-1 rounded text-sm">vault.decrypted_secrets</code>{' '}
                  view, which requires server-side database access with the service role key.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  The service role key is stored as a server-side environment variable and is never
                  exposed to the browser.
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                4.3 Encryption in Transit
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                All data in transit between your browser and our servers, between our servers and
                Supabase, and between our servers and third-party APIs is encrypted using{' '}
                <strong>TLS 1.2 or TLS 1.3</strong>. We do not support unencrypted HTTP connections;
                all HTTP requests are automatically redirected to HTTPS.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                4.4 Access Controls for Credentials
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Database-level</strong>: Supabase Row-Level Security (RLS) policies ensure
                  that Credential data is only accessible to the authenticated user who owns it, and
                  to the server-side service role running the bot process for that tenant.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Application-level</strong>: Credentials are decrypted only at the moment
                  they are needed. Decrypted values are held in application memory for the minimum
                  time necessary and are not logged.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Human access</strong>: Company employees do not have routine access to
                  decrypted Credentials. Access to production databases requires multi-factor
                  authentication, is logged, and is limited to authorized infrastructure personnel
                  for incident response only.
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                4.5 What We Transmit to Third Parties Using Your Credentials
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Credential</th>
                      <th className={thClass}>Transmitted To</th>
                      <th className={thClass}>When</th>
                      <th className={thClass}>Content of Transmission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Discord Bot Token', 'Discord API (discord.com/api)', 'Continuously (WebSocket connection)', 'Included in WebSocket IDENTIFY payload to authenticate your Bot'],
                      ['Anthropic API Key', 'Anthropic API (api.anthropic.com)', 'Every time your Bot processes a message', 'Included as x-api-key HTTP header; the message content and Bot context are included in the request body'],
                      ['OpenAI API Key', 'OpenAI API (api.openai.com)', 'When classification is triggered', 'Included as Authorization: Bearer header; the message text is included in the request body'],
                      ['GitHub OAuth token', 'GitHub API (api.github.com)', 'When a GitHub tool is invoked', 'Included as Authorization: Bearer header'],
                      ['Google OAuth token', 'Google APIs (various)', 'When a Google tool is invoked', 'Included as Authorization: Bearer header'],
                      ['Linear OAuth token', 'Linear API (api.linear.app)', 'When a Linear tool is invoked', 'Included as Authorization: Bearer header'],
                      ['Toggl API key', 'Toggl API (api.track.toggl.com)', 'When a Toggl tool is invoked', 'Included as Authorization: Basic header (base64-encoded)'],
                    ].map(([cred, dest, when, content], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{cred}</td>
                        <td className={tdClass}>{dest}</td>
                        <td className={tdClass}>{when}</td>
                        <td className={tdClass}>{content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                4.6 Credential Deletion
              </h3>
              <p className="text-[#4A5568] mb-2 leading-relaxed text-[15px]">
                When you:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Disconnect an Integration: the associated OAuth token or API key is deleted from
                  our database immediately.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Remove your Discord connection: the Bot Token and Guild ID are deleted from our
                  database; the Bot is disconnected.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Remove your Anthropic API Key: the key is deleted; Bot AI functionality ceases
                  until a new key is provided.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Delete your Account: all Credentials are deleted from our database immediately.
                  Supabase Vault secrets associated with your account are deleted within 24 hours of
                  Account deletion.
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We do not retain backups of Credentials after deletion beyond the backup retention
                window (see Section 7.5).
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                5. Discord and Bot Message Data
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                This section explains our specific practices regarding Discord messages processed by
                your Bot.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                5.1 Message Content &mdash; No Persistent Storage
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                Your Bot receives Discord messages in your Discord Guild. Message content is
                processed in the following way:
              </p>
              <ol className="list-decimal ml-6 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Receipt</strong>: The Bot process receives the message from Discord&apos;s
                  WebSocket API.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>In-memory context</strong>: The message and recent conversation context are
                  held in the Bot process&apos;s memory for the duration of processing. This
                  in-memory context is not written to any database or log.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Transmission to Anthropic</strong>: The message content, along with system
                  prompt and conversation context, is transmitted to Anthropic&apos;s Claude API
                  using your Anthropic API Key.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Response</strong>: The AI response is received and sent to Discord.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Context window</strong>: A limited conversation history is maintained in
                  runtime memory (not database) to support multi-turn conversation. This is cleared
                  when the Bot process restarts or after a configurable idle timeout.
                </li>
              </ol>
              <p className="text-[#4A5568] mb-4 leading-relaxed font-semibold text-[15px]">
                We do not write Discord message content to any database column, log file, analytics
                system, or external service under our control.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                5.2 Message Metadata &mdash; Minimal Logging
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We log the following message metadata for operational purposes only (not message
                content):
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">Timestamp of message processing</li>
                <li className="text-[#4A5568] leading-relaxed">
                  Discord Guild ID (to attribute the event to a tenant)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Whether the message triggered a tool invocation, and which tool category (e.g.,
                  &ldquo;GitHub tool&rdquo;) &mdash; not which specific tool or what arguments were
                  used
                </li>
                <li className="text-[#4A5568] leading-relaxed">Processing latency (milliseconds)</li>
                <li className="text-[#4A5568] leading-relaxed">
                  Whether the processing succeeded or failed, and the error category if failed
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                This metadata is retained for 90 days and then deleted.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                5.3 Guild Members&apos; Data
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Your Bot operates in your Discord Guild and interacts with your Guild members. You
                are responsible, as the Guild owner or administrator, for ensuring that your use of
                the Bot in your Guild complies with all applicable data protection laws, including
                informing your Guild members that an AI bot may process their messages.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                <strong>We are a data processor with respect to Guild members&apos; message
                data.</strong> You (the Guild owner/administrator) are the data controller for your
                Guild members&apos; data. Our Data Processing Agreement (DPA) template is available
                at daimon.bot/dpa for customers who need it for GDPR compliance.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                5.4 What Discord Knows
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Discord, Inc. processes data about your Bot&apos;s activity independently, as
                described in Discord&apos;s Privacy Policy. We have no control over
                Discord&apos;s data practices.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                6. Cookies and Tracking Technologies
              </h2>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                6.1 Types of Cookies We Use
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Cookie Name</th>
                      <th className={thClass}>Type</th>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['sb-access-token', 'Essential / Authentication', 'Supabase Auth session access token (JWT). Required for you to be logged into the dashboard.', 'Session (expires per JWT expiry, typically 1 hour; refreshed automatically)'],
                      ['sb-refresh-token', 'Essential / Authentication', 'Supabase Auth refresh token. Used to obtain a new access token without requiring re-login.', '30 days (rolling)'],
                      ['__stripe_mid', 'Essential / Fraud Prevention', 'Set by Stripe on the billing page to prevent payment fraud.', '1 year'],
                      ['__stripe_sid', 'Essential / Fraud Prevention', 'Set by Stripe for session-level fraud prevention.', 'Session'],
                      ['daimon_csrf', 'Essential / Security', 'CSRF token to prevent cross-site request forgery.', 'Session'],
                    ].map(([name, type, purpose, duration], i) => (
                      <tr key={i}>
                        <td className={tdClass + ' font-mono text-sm'}>{name}</td>
                        <td className={tdClass}>{type}</td>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[#4A5568] mb-4 leading-relaxed font-semibold text-[15px]">
                We do not set advertising cookies. We do not use third-party analytics cookies
                (e.g., Google Analytics). We do not use tracking pixels.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                6.2 Local Storage
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We use browser local storage for the following purposes:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <code className="bg-background px-1 rounded text-sm">sidebar_collapsed</code>{' '}
                  &mdash; Boolean flag for dashboard sidebar state. Contains no personal data.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <code className="bg-background px-1 rounded text-sm">theme_preference</code>{' '}
                  &mdash; <code className="bg-background px-1 rounded text-sm">&quot;light&quot;</code>{' '}
                  or{' '}
                  <code className="bg-background px-1 rounded text-sm">&quot;dark&quot;</code> if you
                  have selected a theme. Contains no personal data.
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                6.3 Managing Cookies
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                You can control cookies through your browser settings. Disabling essential cookies
                (authentication cookies) will prevent you from logging into the Service. You can
                delete all cookies associated with daimon.bot by clearing your browser data for that
                site.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We do not use any cookie management platform or consent banner for our current cookie
                set, because the cookies we use are limited to those strictly necessary for the
                Service to function (security and authentication), plus Stripe fraud prevention
                cookies set directly by Stripe&apos;s JavaScript library. Under ePrivacy Directive
                rules, strictly necessary cookies are exempt from consent requirements.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                7. Data Retention
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We retain personal data for the periods described below. After the applicable
                retention period, data is deleted or anonymized.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                7.1 Account Data
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Data Type</th>
                      <th className={thClass}>Retention Period</th>
                      <th className={thClass}>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Email address', 'Duration of Account + 30 days after Account deletion', 'Required for Account operation; 30-day grace period for Account recovery'],
                      ['Password hash', 'Duration of Account + 30 days', 'Same as above'],
                      ['Full name (if provided)', 'Duration of Account + 30 days', 'Same as above'],
                      ['Account creation date', 'Duration of Account + 7 years', 'Tax/legal compliance'],
                    ].map(([type, period, rationale], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{type}</td>
                        <td className={tdClass}>{period}</td>
                        <td className={tdClass}>{rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                7.2 Tenant Configuration Data
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Data Type</th>
                      <th className={thClass}>Retention Period</th>
                      <th className={thClass}>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Tenant name', 'Duration of Account + 30 days', 'Part of Account data'],
                      ['Discord Guild ID', 'Deleted immediately upon Account deletion or Discord connection removal', 'Not needed after disconnection'],
                      ['Encrypted Bot Token', 'Deleted immediately upon Discord connection removal or Account deletion', 'Sensitive credential — minimal retention'],
                      ['Encrypted Anthropic API Key', 'Deleted immediately upon key removal or Account deletion', 'Sensitive credential — minimal retention'],
                      ['Encrypted OpenAI API Key', 'Deleted immediately upon key removal or Account deletion', 'Sensitive credential — minimal retention'],
                      ['Encrypted OAuth tokens (GitHub, Google, Linear)', 'Deleted immediately upon Integration disconnection or Account deletion', 'Sensitive credential — minimal retention'],
                      ['Encrypted third-party API keys', 'Deleted immediately upon Integration disconnection or Account deletion', 'Sensitive credential — minimal retention'],
                    ].map(([type, period, rationale], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{type}</td>
                        <td className={tdClass}>{period}</td>
                        <td className={tdClass}>{rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                7.3 Billing Data
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Data Type</th>
                      <th className={thClass}>Retention Period</th>
                      <th className={thClass}>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Stripe Customer ID', '7 years after Account deletion', 'Tax and financial audit compliance'],
                      ['Stripe Subscription ID', '7 years after subscription end', 'Tax and financial audit compliance'],
                      ['Invoice records (amounts, dates, plan)', '7 years', 'Tax/legal compliance'],
                      ['Payment method ID (Stripe token)', 'Until Account deletion', 'For subscription management'],
                    ].map(([type, period, rationale], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{type}</td>
                        <td className={tdClass}>{period}</td>
                        <td className={tdClass}>{rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                7.4 Operational and Log Data
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Data Type</th>
                      <th className={thClass}>Retention Period</th>
                      <th className={thClass}>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Bot connection status history', '90 days', 'Troubleshooting and SLA calculations'],
                      ['Per-tenant daily message processing counts', '90 days', 'Dashboard metrics'],
                      ['Per-tenant daily tool invocation counts', '90 days', 'Dashboard metrics'],
                      ['Security audit log (login events, critical actions)', '1 year', 'Security incident investigation'],
                      ['Application error logs (no personal data, anonymized)', '30 days', 'Bug diagnosis'],
                      ['IP addresses in request logs', '30 days', 'Security/fraud prevention'],
                      ['Support email conversations', '3 years after resolution', 'Reference for ongoing support relationship'],
                    ].map(([type, period, rationale], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{type}</td>
                        <td className={tdClass}>{period}</td>
                        <td className={tdClass}>{rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                7.5 Backups
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We maintain database backups for disaster recovery purposes. Backup retention:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Point-in-time recovery (PITR)</strong>: 7 days of continuous backup
                  (Supabase PITR feature)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Periodic snapshots</strong>: Weekly snapshots retained for 30 days
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Data deleted from the live database may persist in backups for up to 30 days. After
                the backup retention window expires, the backup is permanently deleted.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                8. Data Security
              </h2>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                8.1 Technical Safeguards
              </h3>
              <p className="text-[#4A5568] mb-3 font-semibold leading-relaxed text-[15px]">
                Encryption
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  All data in transit: TLS 1.2+ (HTTPS enforced; HSTS header set with{' '}
                  <code className="bg-background px-1 rounded text-sm">max-age=31536000; includeSubDomains; preload</code>)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  All Credentials at rest: AES-256-GCM via Supabase Vault
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  All other database data at rest: AES-256 encryption at the storage layer
                  (Supabase/AWS RDS encryption)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Password storage: bcrypt hashing via Supabase Auth (never stored in plaintext)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Session tokens: Short-lived JWTs (1 hour access token) with 30-day rolling refresh
                  tokens
                </li>
              </ul>

              <p className="text-[#4A5568] mb-3 font-semibold leading-relaxed text-[15px]">
                Access Control
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Database Row-Level Security (RLS) enforced on all tables containing personal data
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Multi-factor authentication required for all Company employee access to production
                  systems
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Principle of least privilege: each service component has access only to the data
                  it requires
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Service role keys and other secrets stored as environment variables, never in
                  source code
                </li>
              </ul>

              <p className="text-[#4A5568] mb-3 font-semibold leading-relaxed text-[15px]">
                Infrastructure
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  All infrastructure hosted on reputable cloud providers (Vercel, Supabase, Fly.io)
                  with SOC 2 compliance
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Automated dependency vulnerability scanning in CI/CD pipeline
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Regular security patches applied to infrastructure
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                8.2 Organizational Safeguards
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Only authorized personnel have access to production systems
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Access logs are maintained and reviewed
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Security training for all personnel with access to personal data
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Incident response plan in place (see Section 8.3)
                </li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                8.3 Security Incident Response
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                In the event of a data breach or security incident that affects your personal
                information:
              </p>
              <ol className="list-decimal ml-6 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Containment</strong>: We will take immediate steps to contain the breach.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Assessment</strong>: We will determine what data was affected, the scope
                  of the breach, and the likely impact.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Notification</strong>: We will notify affected users by email within 72
                  hours of discovering a breach that is likely to result in a risk to your rights and
                  freedoms.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Regulatory notification</strong>: Where legally required, we will notify
                  applicable data protection authorities within the required timeframe.
                </li>
              </ol>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                To report a suspected security vulnerability, please contact us at{' '}
                <a href="mailto:security@daimon.bot" className="text-foreground underline">
                  security@daimon.bot
                </a>
                . We appreciate responsible disclosure.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                8.4 Limitations
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                No security measures are perfect or impenetrable. We cannot guarantee the security
                of your personal information. You should take steps to protect your own account,
                including using a strong, unique password and promptly reporting any suspicious
                activity to us.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                9. International Data Transfers
              </h2>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                9.1 Where Your Data Is Stored
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Our primary data storage is in the United States (Supabase hosted on AWS us-east-1;
                Vercel infrastructure). If you are located outside the United States, your personal
                information will be transferred to and processed in the United States.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                9.2 Legal Mechanisms for Transfers from the EEA/UK
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                For transfers of personal data from the EEA, UK, or Switzerland to the United
                States, we rely on the following legal mechanisms:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>EU-US Data Privacy Framework</strong>: Where our sub-processors (Supabase,
                  Vercel, Stripe) participate in the EU-US Data Privacy Framework, we rely on their
                  certification.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Standard Contractual Clauses (SCCs)</strong>: For sub-processors that are
                  not DPF-certified, we rely on the EU Commission&apos;s Standard Contractual
                  Clauses (Module 2: Controller-to-Processor) as the legal basis for transfer.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>UK Addendum</strong>: For transfers from the UK, we use the UK
                  International Data Transfer Addendum to the EU SCCs.
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Our Data Processing Agreement (DPA) template, including applicable SCCs, is available
                at daimon.bot/dpa.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                9.3 Anthropic API Transfers
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                When your Bot processes Discord messages, the message content is transmitted to
                Anthropic&apos;s API, which is operated from the United States. This transfer is
                made using your own Anthropic API Key, under your own account with Anthropic. You
                are the data controller for this transfer; the data transfer is governed by your
                agreement with Anthropic. We process the data on your behalf (as your data
                processor) when we transmit the API request.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                10. Children&apos;s Privacy
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                The Service is not directed to children under the age of 13, and we do not knowingly
                collect personal information from children under 13. If you are under 13, do not
                create an Account or provide any personal information through the Service.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If you are between 13 and 17 years of age, you may use the Service only with the
                express consent and supervision of a parent or legal guardian.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If we discover that we have collected personal information from a child under 13
                without verifiable parental consent, we will delete that information promptly. If you
                believe we have inadvertently collected information from a child under 13, please
                contact us immediately at{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>
                .
              </p>
            </section>

            {/* Section 11 */}
            <section id="section-11" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                11. Third-Party Services and Links
              </h2>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                11.1 Third-Party Links
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                The Service may contain links to third-party websites (e.g., Discord documentation,
                Anthropic documentation, GitHub, Linear). We are not responsible for the privacy
                practices of those websites and encourage you to read their privacy policies.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                11.2 Third-Party Services Accessed via Integrations
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                When you connect an Integration, you are authorizing the Service to interact with a
                third-party service on your behalf. The third-party service&apos;s privacy policy
                governs how that service collects and uses your data. We are not responsible for the
                privacy practices of:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">Discord, Inc. (discord.com/privacy)</li>
                <li className="text-[#4A5568] leading-relaxed">Anthropic, PBC (anthropic.com/privacy)</li>
                <li className="text-[#4A5568] leading-relaxed">OpenAI, L.L.C. (openai.com/privacy)</li>
                <li className="text-[#4A5568] leading-relaxed">GitHub, Inc. (github.com/site/privacy)</li>
                <li className="text-[#4A5568] leading-relaxed">Google LLC (policies.google.com/privacy)</li>
                <li className="text-[#4A5568] leading-relaxed">Linear Orbit, Inc. (linear.app/privacy)</li>
                <li className="text-[#4A5568] leading-relaxed">Toggl O&Uuml; (toggl.com/legal/privacy)</li>
              </ul>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                11.3 Stripe
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Payment processing is handled by Stripe, Inc. When you provide payment information,
                it is collected directly by Stripe through their embedded payment form (Stripe.js /
                Stripe Elements). We never see your full card number. Stripe&apos;s privacy policy
                is available at stripe.com/privacy.
              </p>
            </section>

            {/* Section 12 */}
            <section id="section-12" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                12. Your Rights and Choices
              </h2>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                12.1 Access
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                You may request access to the personal information we hold about you. You can access
                and review much of your account data directly in the dashboard. For a full data
                export, contact us at{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>
                . We will provide a machine-readable copy of your data within 30 days of your
                request.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                12.2 Correction
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                You may correct inaccurate personal information by updating it directly in your
                dashboard profile settings, or by contacting us at{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>
                .
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                12.3 Deletion
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                You may delete your Account at any time from the Settings page (Account &rarr; Danger
                Zone &rarr; Delete Account). Upon Account deletion:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Your personal information and User Data will be deleted in accordance with Section
                  7.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Your Credentials (API keys, tokens) will be immediately deleted.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Your Bot will be disconnected from Discord.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Your subscription will be cancelled.
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Account deletion is permanent and irreversible. We cannot recover deleted accounts.
                You may also request deletion of specific data without deleting your Account by
                contacting{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>
                .
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                12.4 Opt-Out of Marketing Emails
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We send product update emails and other marketing communications only to users who
                have opted in. You may opt out at any time by:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Clicking the &ldquo;unsubscribe&rdquo; link at the bottom of any marketing email,
                  or
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Updating your notification preferences in the dashboard (Settings &rarr;
                  Notifications).
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Opting out of marketing emails does not affect transactional emails (invoices,
                security alerts, password resets), which are necessary for operating your Account.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                12.5 Cookie Preferences
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                You may manage cookies through your browser settings as described in Section 6.3.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                12.6 Data Portability
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                You may request an export of your personal data in a machine-readable format (JSON or
                CSV) by contacting{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>
                . We will provide the export within 30 days.
              </p>
            </section>

            {/* Section 13 */}
            <section id="section-13" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                13. EEA, UK, and Swiss User Rights (GDPR / UK GDPR)
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If you are located in the European Economic Area (EEA), United Kingdom, or
                Switzerland, you have the following additional rights under the General Data
                Protection Regulation (GDPR), the UK GDPR, or the Swiss Federal Act on Data
                Protection (nFADP), as applicable.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                13.1 Legal Bases for Processing
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Processing Activity</th>
                      <th className={thClass}>GDPR Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Providing the Service to you', 'Article 6(1)(b) — Performance of a contract'],
                      ['Sending transactional communications', 'Article 6(1)(b) — Performance of a contract'],
                      ['Security, fraud prevention, audit logging', 'Article 6(1)(f) — Legitimate interests'],
                      ['Compliance with legal obligations', 'Article 6(1)(c) — Legal obligation'],
                      ['Sending marketing communications', 'Article 6(1)(a) — Consent (you may withdraw at any time)'],
                      ['Service improvement analytics (aggregate, anonymized)', 'Article 6(1)(f) — Legitimate interests'],
                    ].map(([activity, basis], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{activity}</td>
                        <td className={tdClass}>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                13.2 Your GDPR Rights
              </h3>
              <div className="space-y-4 mb-4">
                {[
                  ['Right of Access (Article 15)', 'Request confirmation of whether we process your personal data and obtain a copy of it, along with information about how it is processed.'],
                  ['Right to Rectification (Article 16)', 'Request correction of inaccurate personal data.'],
                  ['Right to Erasure (Article 17)', 'Request deletion of your personal data where it is no longer necessary for the purposes for which it was collected, you have withdrawn consent, you object to processing, or the data has been unlawfully processed. This right does not apply where we must retain data to comply with a legal obligation.'],
                  ['Right to Restriction of Processing (Article 18)', 'Request that we restrict processing of your personal data in certain circumstances (e.g., while we verify the accuracy of data you have contested).'],
                  ['Right to Data Portability (Article 20)', 'Receive your personal data in a structured, commonly used, machine-readable format and transmit it to another controller, where processing is based on consent or contract performance and carried out by automated means.'],
                  ['Right to Object (Article 21)', 'Object to processing of your personal data where we rely on legitimate interests as the legal basis. We will cease processing unless we can demonstrate compelling legitimate grounds that override your interests.'],
                  ['Rights related to Automated Decision-Making (Article 22)', 'We do not make automated decisions that produce legal or similarly significant effects about you based on your personal data.'],
                  ['Right to Lodge a Complaint', 'You have the right to lodge a complaint with your local data protection authority. A list of EEA supervisory authorities is available at edpb.europa.eu. The UK supervisory authority is the Information Commissioner\'s Office (ico.org.uk).'],
                ].map(([right, description], i) => (
                  <div key={i}>
                    <p className="text-foreground font-semibold mb-1 text-[15px]">
                      {right}
                    </p>
                    <p className="text-[#4A5568] leading-relaxed text-[15px]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                13.3 How to Exercise Your GDPR Rights
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                To exercise any of the above rights, submit a request to:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Email</strong>:{' '}
                  <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                    privacy@daimon.bot
                  </a>{' '}
                  (subject line: &ldquo;GDPR Data Rights Request&rdquo;)
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Mail</strong>: PyMC Technologies, Inc., Attn: Data Protection
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We will respond within 30 days of receiving your request. We may ask you to verify
                your identity before processing your request.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                13.4 Data Protection Officer
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We have appointed a Data Protection Officer (DPO) who can be contacted at:{' '}
                <a href="mailto:dpo@daimon.bot" className="text-foreground underline">
                  dpo@daimon.bot
                </a>
              </p>
            </section>

            {/* Section 14 */}
            <section id="section-14" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                14. California Consumer Privacy Rights (CCPA / CPRA)
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If you are a California resident, the California Consumer Privacy Act (CCPA) as
                amended by the California Privacy Rights Act (CPRA) grants you specific rights
                regarding your personal information.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                14.1 Categories of Personal Information We Collect
              </h3>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Category</th>
                      <th className={thClass}>Specific Data</th>
                      <th className={thClass}>Collected?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Identifiers', 'Email address, Account ID', 'Yes'],
                      ['Personal Records (Cal. Civ. Code § 1798.80)', 'Name, financial account information (via Stripe; we hold Stripe Customer ID only)', 'Yes'],
                      ['Internet or Network Activity', 'IP address, browsing history within the Service, interactions with the dashboard', 'Yes'],
                      ['Geolocation', 'IP-derived country/region (imprecise)', 'Yes (approximate only)'],
                      ['Inferences', 'None — we do not create profiles or draw inferences about consumers', 'No'],
                      ['Sensitive Personal Information (CPRA)', 'API keys, OAuth tokens (classified as login credentials and financial account information)', 'Yes'],
                    ].map(([category, data, collected], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{category}</td>
                        <td className={tdClass}>{data}</td>
                        <td className={tdClass}>{collected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                14.2 Purposes for Collection
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We collect personal information for the business purposes described in Section 2.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                14.3 Categories of Third Parties with Whom We Share Personal Information
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We share personal information with the categories of third parties described in
                Section 3: service providers/sub-processors, integration partners, payment processor
                (Stripe), and government/law enforcement when legally required.
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed font-semibold text-[15px]">
                We do not sell your personal information as defined under CCPA. We do not share your
                personal information for cross-context behavioral advertising.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                14.4 Your CCPA/CPRA Rights
              </h3>
              <div className="space-y-4 mb-4">
                {[
                  ['Right to Know', 'You may request that we disclose what personal information we collect, use, disclose, and sell about you. You may request this information up to twice per 12-month period.'],
                  ['Right to Delete', 'You may request that we delete personal information we have collected from you, subject to certain exceptions (e.g., completion of a transaction, security incident prevention, legal compliance).'],
                  ['Right to Correct', 'You may request that we correct inaccurate personal information.'],
                  ['Right to Opt-Out of Sale/Sharing', 'We do not sell personal information. We do not share personal information for cross-context behavioral advertising. No opt-out is required, but you may contact us to confirm.'],
                  ['Right to Limit Use of Sensitive Personal Information', 'Your API keys and OAuth tokens are used only for the purpose of providing the Service. We do not use them for any secondary purpose.'],
                  ['Right to Non-Discrimination', 'We will not discriminate against you for exercising your CCPA rights.'],
                ].map(([right, description], i) => (
                  <div key={i}>
                    <p className="text-foreground font-semibold mb-1 text-[15px]">
                      {right}
                    </p>
                    <p className="text-[#4A5568] leading-relaxed text-[15px]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                14.5 How to Submit a CCPA Request
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                Submit requests to:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  <strong>Email</strong>:{' '}
                  <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                    privacy@daimon.bot
                  </a>{' '}
                  (subject line: &ldquo;CCPA Privacy Request&rdquo;)
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We will acknowledge your request within 10 business days and respond within 45 days.
                If we need more time (up to 45 additional days), we will notify you. We will verify
                your identity before processing your request.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                14.6 Authorized Agent
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                You may designate an authorized agent to make a CCPA request on your behalf. The
                authorized agent must provide written authorization signed by you and proof of
                identity.
              </p>
            </section>

            {/* Section 15 */}
            <section id="section-15" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                15. Changes to This Privacy Policy
              </h2>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                15.1 Notice of Changes
              </h3>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We may update this Privacy Policy from time to time. When we make material changes,
                we will:
              </p>
              <ul className="list-none ml-0 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  (a) send an email notification to the address on your Account at least 30 days
                  before the changes take effect; and
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  (b) post a notice in the dashboard with a summary of changes.
                </li>
              </ul>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                For non-material changes (such as corrections, clarifications, or updates to reflect
                new sub-processors with equivalent privacy practices), we may provide shorter notice
                or update the &ldquo;Last Updated&rdquo; date without advance email notice.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                15.2 Continued Use
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                Your continued use of the Service after the effective date of the updated Privacy
                Policy constitutes your acceptance of the changes. If you do not agree to the updated
                Privacy Policy, you must stop using the Service and delete your Account.
              </p>

              <h3 className="font-archivo font-semibold text-foreground mb-3 mt-6 text-[17px]">
                15.3 Version History
              </h3>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We maintain an archive of prior versions of this Privacy Policy. Prior versions are
                available upon request by emailing{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>
                .
              </p>
            </section>

            {/* Section 16 */}
            <section id="section-16" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                16. Contact Us
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                For privacy-related questions, requests, or concerns, please contact us:
              </p>
              <p className="text-foreground font-semibold mb-4 text-[15px]">
                PyMC Technologies, Inc.
              </p>
              <div className={tableClass}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['General privacy inquiries', 'privacy@daimon.bot'],
                      ['GDPR rights requests', 'privacy@daimon.bot (subject: "GDPR Data Rights Request")'],
                      ['CCPA rights requests', 'privacy@daimon.bot (subject: "CCPA Privacy Request")'],
                      ['Data Protection Officer', 'dpo@daimon.bot'],
                      ['Security vulnerability reports', 'security@daimon.bot'],
                      ['Legal notices', 'legal@daimon.bot'],
                      ['General support', 'support@daimon.bot'],
                    ].map(([purpose, contact], i) => (
                      <tr key={i}>
                        <td className={tdClass}>{purpose}</td>
                        <td className={tdClass}>
                          <a
                            href={`mailto:${contact.split(' ')[0]}`}
                            className="text-foreground underline"
                          >
                            {contact}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We will respond to privacy inquiries within 30 days, or within the applicable legal
                timeframe for rights requests under GDPR (30 days) or CCPA (45 days + 45-day
                extension if needed).
              </p>
            </section>

            {/* Appendix A */}
            <section id="appendix-a" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                Appendix A: Data Processing Agreement Summary
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                This appendix summarizes the key terms of our data processing relationship for users
                who need GDPR compliance documentation. A full DPA is available at daimon.bot/dpa.
              </p>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Roles:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  For personal data of Account holders: PyMC Technologies, Inc. is the{' '}
                  <strong>Data Controller</strong>.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  For personal data of Guild members whose messages are processed by your Bot: You
                  (the Account holder) are the <strong>Data Controller</strong>; PyMC Technologies,
                  Inc. is the <strong>Data Processor</strong>.
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Sub-processors:
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                As listed in Section 3.1 of this Privacy Policy.
              </p>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Processing activities:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Duration: For the duration of your use of the Service.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Nature: Collection, storage, encryption, transmission, deletion of personal data
                  as described herein.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Purpose: Providing the Daimon Service.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Types of data: As described in Section 1.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Categories of data subjects: Account holders; Guild members (message data
                  in-transit only; not persistently stored).
                </li>
              </ul>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Security measures:
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                As described in Section 8 of this Privacy Policy.
              </p>

              <p className="text-[#4A5568] mb-2 font-semibold leading-relaxed text-[15px]">
                Data subject rights assistance:
              </p>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                We will assist you in responding to data subject rights requests from your Guild
                members to the extent technically feasible. Contact{' '}
                <a href="mailto:support@daimon.bot" className="text-foreground underline">
                  support@daimon.bot
                </a>
                .
              </p>
            </section>

            {/* Appendix B */}
            <section id="appendix-b" className="mb-10">
              <h2
                className="font-archivo font-bold text-foreground mb-4 text-xl"
              >
                Appendix B: Sub-Processor Change Notice Process
              </h2>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                We will notify you of any new or changed sub-processors by:
              </p>
              <ol className="list-decimal ml-6 mb-4 space-y-2 text-[15px]">
                <li className="text-[#4A5568] leading-relaxed">
                  Posting an update to the sub-processor list at daimon.bot/sub-processors with at
                  least 30 days&apos; notice.
                </li>
                <li className="text-[#4A5568] leading-relaxed">
                  Sending an email notification to Account holders who have opted into compliance
                  notifications (available in Settings &rarr; Notifications &rarr; Compliance
                  Updates).
                </li>
              </ol>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If you object to a new sub-processor for legitimate reasons related to data
                protection, contact{' '}
                <a href="mailto:privacy@daimon.bot" className="text-foreground underline">
                  privacy@daimon.bot
                </a>{' '}
                within 30 days of the notification. We will work to address your concern. If we
                cannot resolve the concern, you may terminate your Account as described in the Terms
                of Service.
              </p>
            </section>

            {/* Footer note */}
            <div className="border-t border-border pt-8 mt-10">
              <p className="text-[#718096] italic text-sm">
                This Privacy Policy was last updated on March 13, 2026. Version 1.0.
              </p>
              <p className="text-[#718096] mt-2 text-sm">
                Related documents:{' '}
                <Link href="/terms" className="text-foreground underline">
                  Terms of Service
                </Link>
                {' · '}
                <Link href="/legal/cookies" className="text-foreground underline">
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}

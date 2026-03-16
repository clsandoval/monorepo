import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';

export const metadata: Metadata = {
  title: 'Terms of Service — Daimon',
  description:
    'Read the Daimon Terms of Service governing your access to and use of the Daimon platform.',
  openGraph: {
    title: 'Terms of Service — Daimon',
    description: 'Terms of Service for the Daimon Discord bot platform.',
  },
  alternates: {
    canonical: 'https://daimon.bot/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <main>
        <article className="max-w-3xl mx-auto px-8 py-20">
          <h1
            className="font-archivo font-bold text-[#0C1F40] text-[clamp(28px,4vw,36px)]"

          >
            Terms of Service
          </h1>
          <p className="mt-2 text-[#718096] text-sm">
            Effective Date: March 13, 2026
          </p>
          <p className="text-[#718096] mb-12 text-sm">
            Last Updated: March 13, 2026
          </p>

          {/* Table of Contents */}
          <nav aria-label="Terms of service table of contents" className="mb-12">
            <p className="font-archivo font-bold text-[#0C1F40] mb-3 text-base">
              Table of Contents
            </p>
            <ol className="ml-6 space-y-1 text-[15px]">
              {[
                ['#agreement', 'Agreement to Terms'],
                ['#definitions', '1. Definitions'],
                ['#eligibility', '2. Eligibility'],
                ['#account', '3. Account Registration and Security'],
                ['#service', '4. The Service'],
                ['#billing', '5. Subscription Plans and Billing'],
                ['#acceptable-use', '6. Acceptable Use Policy'],
                ['#credentials', '7. Credentials and Data Security'],
                ['#ip', '8. Intellectual Property'],
                ['#privacy', '9. Privacy and Data'],
                ['#termination', '10. Termination'],
                ['#disclaimers', '11. Disclaimers and Warnings'],
                ['#liability', '12. Limitation of Liability'],
                ['#indemnification', '13. Indemnification'],
                ['#disputes', '14. Governing Law and Dispute Resolution'],
                ['#changes', '15. Changes to Terms'],
                ['#confidentiality', '16. Confidentiality'],
                ['#general', '17. General Provisions'],
                ['#contact', '18. Contact Information'],
              ].map(([href, label], i) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-[#0C1F40] hover:opacity-70"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose-legal">
            {/* Agreement to Terms */}
            <section id="agreement" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                Agreement to Terms
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement
                between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and
                PyMC Technologies, Inc. (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
                or &ldquo;our&rdquo;) governing your access to and use of the Daimon platform,
                including the website at daimon.bot (and any subdomains), the web application
                dashboard, the Discord bot service, and all related services, features, content, and
                functionality (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p
                className="text-[#4A5568] mb-4 leading-relaxed font-semibold uppercase text-sm"

              >
                By creating an account, clicking &ldquo;I agree,&rdquo; or otherwise accessing or
                using the service, you agree to be bound by these terms and our privacy policy,
                which is incorporated herein by reference. If you do not agree to these terms, you
                must not create an account or use the service.
              </p>
              <p className="text-[#4A5568] leading-relaxed text-[15px]">
                If you are using the Service on behalf of an organization or entity
                (&ldquo;Organization&rdquo;), you represent and warrant that you have the authority
                to bind that Organization to these Terms, and all references to &ldquo;you&rdquo;
                shall include both you and the Organization.
              </p>
            </section>

            {/* 1. Definitions */}
            <section id="definitions" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                1. Definitions
              </h2>
              <dl className="space-y-3 text-[15px]">
                {[
                  [
                    '1.1 "Account"',
                    'means the registered account you create to access the Service, associated with a single email address.',
                  ],
                  [
                    '1.2 "Anthropic API Key"',
                    'means the API key issued to you directly by Anthropic, PBC (the maker of Claude AI), which you provide to the Service under the BYOK model.',
                  ],
                  [
                    '1.3 "Bot"',
                    'means the Discord bot instance operated by the Service on your behalf within your Discord Guild, powered by Decision Orchestrator software.',
                  ],
                  [
                    '1.4 "Bot Token"',
                    'means the Discord bot token you create via the Discord Developer Portal and provide to the Service in order to authenticate your Bot.',
                  ],
                  [
                    '1.5 "BYOK"',
                    'means "Bring Your Own Key" — the model under which you supply your own API credentials (Anthropic API Key and optionally an OpenAI API Key) to the Service, which uses them solely to power your Bot\'s AI capabilities.',
                  ],
                  [
                    '1.6 "Content"',
                    'means any text, data, messages, files, or other materials sent, submitted, transmitted, or otherwise made available through the Service, including Discord messages processed by your Bot.',
                  ],
                  [
                    '1.7 "Credentials"',
                    'means third-party API keys, OAuth tokens, bot tokens, and other authentication credentials you provide to the Service for the purpose of enabling Integrations.',
                  ],
                  [
                    '1.8 "Discord"',
                    'means Discord Inc. and its Discord chat platform, including Discord servers ("Guilds") and the Discord API.',
                  ],
                  [
                    '1.9 "Discord Guild"',
                    'means a Discord server owned or administered by you or your Organization, to which your Bot is added.',
                  ],
                  [
                    '1.10 "Effective Date"',
                    'means the date on which these Terms become effective as stated above.',
                  ],
                  [
                    '1.11 "Guild ID"',
                    'means the unique numeric identifier for your Discord Guild.',
                  ],
                  [
                    '1.12 "Integration"',
                    'means a connection between the Service and a Third-Party Service, established via OAuth authorization or API key provision.',
                  ],
                  [
                    '1.13 "OpenAI API Key"',
                    'means the optional API key issued to you by OpenAI, L.L.C., which you may provide to the Service for enhanced message classification features.',
                  ],
                  [
                    '1.14 "Plan"',
                    'means the subscription tier you have selected (Free, Starter, or Pro), each described in Section 5.',
                  ],
                  [
                    '1.15 "Platform Fee"',
                    'means the recurring fee payable by you to the Company for access to the Service, as described in Section 5. The Platform Fee does not include AI inference costs, which are charged directly to you by Anthropic or OpenAI under your separate agreements with those providers.',
                  ],
                  ['1.16 "Service"', 'has the meaning given in the preamble above.'],
                  [
                    '1.17 "Subscription Period"',
                    'means the period for which you have paid for a Plan (monthly or annual).',
                  ],
                  [
                    '1.18 "Tenant"',
                    'means a single workspace created within the Service, associated with one Account owner and optionally additional team members.',
                  ],
                  [
                    '1.19 "Third-Party Service"',
                    'means any external service or platform accessed through an Integration, including but not limited to GitHub, Google, Linear, and Toggl.',
                  ],
                  [
                    '1.20 "User Data"',
                    'means all data, information, and Content that you or your authorized users submit to, process through, or store in the Service, including Discord messages processed by your Bot.',
                  ],
                ].map(([term, def]) => (
                  <div key={term as string}>
                    <dt className="font-semibold text-[#0C1F40] inline">{term as string} </dt>
                    <dd className="inline text-[#4A5568]">{def as string}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* 2. Eligibility */}
            <section id="eligibility" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                2. Eligibility
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>2.1 Age Requirement.</strong> You must be at least 18 years of age to
                  create an Account and use the Service. By using the Service, you represent and
                  warrant that you are at least 18 years old. If you are between 13 and 17 years
                  old, you may use the Service only with the express consent and supervision of a
                  parent or legal guardian who agrees to these Terms.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>2.2 Legal Capacity.</strong> You represent that you have the legal
                  capacity to enter into a binding agreement in your jurisdiction. If you are using
                  the Service on behalf of an Organization, you represent that the Organization is
                  duly organized and validly existing under applicable law.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>2.3 Compliance with Laws.</strong> You represent that your use of the
                  Service does not violate any applicable law, regulation, rule, or order, including
                  without limitation export control laws, sanctions laws, and data protection laws
                  applicable in your jurisdiction.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>2.4 Discord Account.</strong> You must maintain a valid Discord account
                  and have the ability to create Discord applications in the Discord Developer
                  Portal to use the Bot features of the Service.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>2.5 Anthropic Account.</strong> You must maintain a valid account with
                  Anthropic, PBC and have obtained an Anthropic API Key in accordance with
                  Anthropic&rsquo;s terms of service to use the AI features of the Service.
                </p>
              </div>
            </section>

            {/* 3. Account Registration */}
            <section id="account" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                3. Account Registration and Security
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>3.1 Account Creation.</strong> To access the Service, you must register
                  for an Account by providing a valid email address and creating a password. You may
                  not use a false identity, impersonate any person or entity, or provide false or
                  misleading information.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>3.2 Account Accuracy.</strong> You agree to provide accurate, current,
                  and complete information during the registration process and to update such
                  information as necessary to keep it accurate, current, and complete.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>3.3 Account Security.</strong> You are responsible for maintaining the
                  confidentiality of your Account credentials, including your password. You agree
                  to:
                </p>
                <ul className="ml-6 space-y-1 text-[#4A5568]">
                  <li>(a) use a strong, unique password for your Account;</li>
                  <li>
                    (b) notify us immediately at{' '}
                    <a
                      href="mailto:support@daimon.bot"
                      className="text-[#0C1F40]"
                      style={{
                        textDecoration: 'underline',
                        textDecorationColor: '#B4E7DD',
                      }}
                    >
                      support@daimon.bot
                    </a>{' '}
                    if you discover or suspect any unauthorized access to or use of your Account;
                  </li>
                  <li>
                    (c) ensure that you log out of your Account at the end of each session when
                    using shared devices.
                  </li>
                </ul>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>3.4 Account Responsibility.</strong> You are solely responsible for all
                  activity that occurs under your Account, whether or not you authorized it. We will
                  not be liable for any loss or damage arising from unauthorized use of your
                  Account, except to the extent such loss results from our gross negligence or
                  willful misconduct.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>3.5 One Account Per Person.</strong> Each individual person may maintain
                  only one Account. You may not share your Account credentials with others or allow
                  others to use your Account. Organizations may have a single Tenant with multiple
                  team members added via the team management feature.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>3.6 Account Termination by You.</strong> You may delete your Account at
                  any time via the Settings page. Account deletion is permanent and irreversible.
                  See Section 10 (Termination) for the effects of termination.
                </p>
              </div>
            </section>

            {/* 4. The Service */}
            <section id="service" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                4. The Service
              </h2>
              <div className="space-y-4 text-[15px]">
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>4.1 Service Description.</strong> Daimon is a self-serve platform that
                    enables you to deploy a Discord bot powered by the Decision Orchestrator AI
                    system within your Discord Guild. The Service provides:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>
                      (a) a web-based dashboard for managing your Bot configuration, Credentials,
                      and Integrations;
                    </li>
                    <li>
                      (b) infrastructure for running your Bot instance using your provided Bot
                      Token;
                    </li>
                    <li>
                      (c) secure storage of your Credentials using industry-standard encryption;
                    </li>
                    <li>(d) a billing interface for managing your subscription Plan;</li>
                    <li>(e) documentation and support resources.</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>4.2 BYOK Model.</strong> The Service operates on a Bring Your Own Key
                    (&ldquo;BYOK&rdquo;) model. Specifically:
                  </p>
                  <ul className="ml-6 space-y-2 text-[#4A5568]">
                    <li>
                      (a) <strong>Anthropic API Key (Required):</strong> You must provide a valid
                      Anthropic API Key. The Service will use this key exclusively to make API calls
                      to Anthropic on your behalf when your Bot processes messages in your Discord
                      Guild. You are solely responsible for all costs charged by Anthropic under
                      your Anthropic API Key, which are billed directly by Anthropic and are
                      entirely separate from the Platform Fee.
                    </li>
                    <li>
                      (b) <strong>OpenAI API Key (Optional):</strong> You may optionally provide an
                      OpenAI API Key for enhanced message classification. If provided, the Service
                      will use this key exclusively to make API calls to OpenAI on your behalf. You
                      are solely responsible for all OpenAI costs.
                    </li>
                    <li>
                      (c) <strong>Responsibility for Third-Party API Costs:</strong> The Company
                      has no visibility into or responsibility for the AI inference costs you incur
                      with Anthropic or OpenAI. You agree to monitor your usage and maintain
                      sufficient API quota and billing with those providers.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>4.3 Discord Bot Token.</strong> To connect the Service to your Discord
                    Guild:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>
                      (a) You must create a Discord application and bot in the Discord Developer
                      Portal (discord.com/developers).
                    </li>
                    <li>
                      (b) You must provide the resulting Bot Token and your Guild ID to the Service.
                    </li>
                    <li>
                      (c) You represent and warrant that you have authority to add bots to the
                      Discord Guild specified by your Guild ID.
                    </li>
                    <li>
                      (d) You are responsible for ensuring your Discord application complies with
                      Discord&rsquo;s Developer Terms of Service and Developer Policy at all times.
                    </li>
                    <li>
                      (e) If your Bot Token is invalidated, revoked, or changed by Discord, you are
                      responsible for updating it in the Service.
                    </li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>4.4 Third-Party Integrations.</strong> The Service supports optional
                  Integrations with Third-Party Services to extend Bot capabilities. For
                  OAuth-based Integrations (GitHub, Google, Linear), you authorize the Service to
                  act on your behalf using the scopes you grant. For API key-based Integrations
                  (Toggl), you provide your API key directly. You represent that you are authorized
                  to grant the requested access to each Third-Party Service and that your use of
                  each Integration complies with that Third-Party Service&rsquo;s terms.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>4.5 Service Availability.</strong> We will use commercially reasonable
                  efforts to maintain Service availability. We do not guarantee uninterrupted or
                  error-free operation. Scheduled maintenance, emergency maintenance, and
                  circumstances beyond our control may result in temporary unavailability. See the
                  uptime SLA provisions in Section 5.4.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>4.6 Service Modifications.</strong> We reserve the right to modify,
                  update, enhance, or discontinue features of the Service at any time. We will
                  provide reasonable notice for material changes that substantially reduce
                  functionality available on your Plan. Changes to address security vulnerabilities
                  or comply with legal requirements may be implemented without prior notice.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>4.7 Beta Features.</strong> From time to time, we may offer beta or
                  preview features. Beta features are provided &ldquo;as is,&rdquo; may contain
                  bugs, may change significantly, and may be discontinued without notice. Beta
                  features are not subject to any service level commitments.
                </p>
              </div>
            </section>

            {/* 5. Subscription Plans and Billing */}
            <section id="billing" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                5. Subscription Plans and Billing
              </h2>
              <div className="space-y-4 text-[15px]">
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-3">
                    <strong>5.1 Plans.</strong> The Service is offered under three subscription
                    Plans:
                  </p>
                  <div className="overflow-x-auto">
                    <table
                      className="w-full border-collapse text-[#4A5568] text-sm"

                    >
                      <thead>
                        <tr className="border-b border-[#E2E8F0]">
                          <th className="text-left py-2 pr-4 font-semibold text-[#0C1F40]">
                            Plan
                          </th>
                          <th className="text-left py-2 pr-4 font-semibold text-[#0C1F40]">
                            Monthly Price
                          </th>
                          <th className="text-left py-2 pr-4 font-semibold text-[#0C1F40]">
                            Annual Price
                          </th>
                          <th className="text-left py-2 font-semibold text-[#0C1F40]">
                            Discord Connections
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#E2E8F0]">
                          <td className="py-2 pr-4">Free</td>
                          <td className="py-2 pr-4">$0/month</td>
                          <td className="py-2 pr-4">$0/year</td>
                          <td className="py-2">1</td>
                        </tr>
                        <tr className="border-b border-[#E2E8F0]">
                          <td className="py-2 pr-4">Starter</td>
                          <td className="py-2 pr-4">$9/month</td>
                          <td className="py-2 pr-4">$79/year</td>
                          <td className="py-2">Up to 3</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">Pro</td>
                          <td className="py-2 pr-4">$29/month</td>
                          <td className="py-2 pr-4">$249/year</td>
                          <td className="py-2">Unlimited</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[#4A5568] leading-relaxed mt-3">
                    Plan features are described in detail at daimon.bot/pricing and in the Service
                    documentation. We reserve the right to modify Plan pricing and features upon 30
                    days&rsquo; prior written notice to existing subscribers. Your continued use of
                    the Service after such notice constitutes acceptance of the updated pricing.
                  </p>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>5.2 Free Plan.</strong> The Free Plan is available at no charge and does
                  not require a credit card. We reserve the right to limit, modify, or discontinue
                  the Free Plan upon 30 days&rsquo; prior written notice.
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>5.3 Paid Plans — Billing.</strong> For paid Plans (Starter and Pro):
                  </p>
                  <ul className="ml-6 space-y-2 text-[#4A5568]">
                    <li>
                      (a) <strong>Payment Method:</strong> You must provide a valid payment method
                      (credit or debit card) accepted by our payment processor, Stripe, Inc.
                    </li>
                    <li>
                      (b) <strong>Billing Cycles:</strong> Subscriptions are billed in advance on a
                      monthly or annual cycle, depending on your selection at time of purchase.
                    </li>
                    <li>
                      (c) <strong>Automatic Renewal:</strong> Your subscription automatically
                      renews at the end of each Subscription Period unless you cancel before the
                      renewal date.
                    </li>
                    <li>
                      (d) <strong>Taxes:</strong> Prices listed do not include applicable taxes.
                      You are responsible for all applicable sales, use, value-added, or similar
                      taxes. Where legally required, we will collect and remit taxes.
                    </li>
                    <li>(e) <strong>Currency:</strong> All prices are in US Dollars (USD).</li>
                    <li>
                      (f) <strong>Failed Payments:</strong> If your payment fails, we will attempt
                      to collect payment up to three times over a period of up to 14 days. If all
                      retry attempts fail, your subscription will be downgraded to the Free Plan,
                      and features associated with paid Plans will become unavailable.
                    </li>
                    <li>
                      (g) <strong>Payment Processing:</strong> Payment processing is handled by
                      Stripe, Inc. We do not store your full payment card information. Your use of
                      Stripe is subject to Stripe&rsquo;s services agreement available at
                      stripe.com/legal.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>5.4 Uptime SLA (Pro Plan Only).</strong> For Pro Plan subscribers, we
                    guarantee 99.9% monthly uptime for the Bot service, calculated as: ((Total
                    Minutes in Month &minus; Downtime Minutes) / Total Minutes in Month) &times;
                    100. Downtime means the complete inability of your Bot to connect to Discord and
                    process messages, not including:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>
                      (a) scheduled maintenance (announced at least 24 hours in advance via email
                      and status page);
                    </li>
                    <li>
                      (b) emergency maintenance performed to address critical security
                      vulnerabilities;
                    </li>
                    <li>
                      (c) outages caused by Discord, Anthropic, Supabase, or other third-party
                      infrastructure providers;
                    </li>
                    <li>
                      (d) outages caused by your invalid Bot Token, revoked Anthropic API Key, or
                      other configuration issues within your control;
                    </li>
                    <li>(e) force majeure events as described in Section 17.8;</li>
                    <li>(f) outages caused by your violation of these Terms.</li>
                  </ul>
                  <p className="text-[#4A5568] leading-relaxed mt-3">
                    If we fail to meet the 99.9% uptime guarantee in any calendar month, you may
                    request a service credit equal to one day of Pro Plan fees per full percentage
                    point below 99.9%, up to a maximum of 15 days of Pro Plan fees per month.
                    Credits are applied to future invoices and are not redeemable for cash. To claim
                    a credit, you must submit a written request to{' '}
                    <a
                      href="mailto:support@daimon.bot"
                      className="text-[#0C1F40]"
                      style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                    >
                      support@daimon.bot
                    </a>{' '}
                    within 30 days of the end of the month in which the SLA breach occurred.
                  </p>
                </div>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>5.5 Cancellation and Downgrade.</strong>
                  </p>
                  <ul className="ml-6 space-y-2 text-[#4A5568]">
                    <li>
                      (a) <strong>Cancellation:</strong> You may cancel your paid subscription at
                      any time via the Billing page in your dashboard or via the Stripe Customer
                      Portal. Your subscription will remain active until the end of the current
                      Subscription Period. No refunds are provided for the unused portion of a
                      Subscription Period.
                    </li>
                    <li>
                      (b) <strong>Downgrade:</strong> You may downgrade from Pro to Starter or from
                      Starter to Free at any time. The downgrade takes effect at the end of the
                      current Subscription Period. If your current configuration exceeds the limits
                      of your new Plan, the Service will automatically disable connections that
                      exceed the new limit (selecting which connections to disable in order of
                      creation date, oldest connections disabled last).
                    </li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>5.6 Upgrades.</strong> You may upgrade your Plan at any time. Upgrades
                  take effect immediately, and you will be charged a prorated amount for the
                  remainder of the current billing period.
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>5.7 Refunds.</strong> All fees paid are non-refundable, except:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>
                      (a) where required by applicable consumer protection law in your jurisdiction;
                    </li>
                    <li>
                      (b) where we have committed a material breach of these Terms that we fail to
                      cure within 30 days of written notice from you;
                    </li>
                    <li>(c) at our sole discretion on a case-by-case basis.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>5.8 Disputed Charges.</strong> If you believe you have been incorrectly
                  charged, you must notify us within 60 days of the charge by contacting{' '}
                  <a
                    href="mailto:support@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    support@daimon.bot
                  </a>
                  . We will investigate and provide a response within 10 business days. Initiating a
                  chargeback with your bank or credit card issuer before contacting us may result in
                  immediate suspension of your Account.
                </p>
              </div>
            </section>

            {/* 6. Acceptable Use Policy */}
            <section id="acceptable-use" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                6. Acceptable Use Policy
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>6.1 Permitted Use.</strong> You may use the Service solely for lawful
                  purposes and in accordance with these Terms. The Service is designed for personal
                  and business productivity use through Discord.
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>6.2 Prohibited Uses.</strong> You must not use the Service to:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) violate any applicable local, state, national, or international law or regulation;</li>
                    <li>(b) infringe, misappropriate, or violate any intellectual property rights, privacy rights, or other rights of any person or entity;</li>
                    <li>(c) transmit any material that is defamatory, obscene, harassing, abusive, threatening, or hateful;</li>
                    <li>(d) impersonate any person or entity or misrepresent your affiliation with any person or entity;</li>
                    <li>(e) transmit spam, chain letters, unsolicited messages, or engage in bulk messaging through your Bot;</li>
                    <li>(f) distribute malware, viruses, Trojans, or any other malicious code;</li>
                    <li>(g) attempt to gain unauthorized access to any portion of the Service, other users&rsquo; accounts, or any systems or networks connected to the Service;</li>
                    <li>(h) use automated means (scraping, crawling, harvesting) to access, monitor, copy, or extract data from the Service, except as expressly permitted by the Service API or these Terms;</li>
                    <li>(i) reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service;</li>
                    <li>(j) use the Service to process, store, or transmit content that promotes violence, terrorism, child exploitation, or other illegal activities;</li>
                    <li>(k) engage in any activity that interferes with, disrupts, or places an unreasonable or disproportionate load on the Service or its infrastructure;</li>
                    <li>(l) use the Service in any way that violates Discord&rsquo;s Terms of Service, Developer Terms of Service, or Developer Policy;</li>
                    <li>(m) circumvent, disable, or interfere with security-related features of the Service;</li>
                    <li>(n) use the Service to conduct denial-of-service attacks against any target;</li>
                    <li>(o) use the Service for cryptocurrency mining or other unauthorized resource-intensive computation;</li>
                    <li>(p) resell, sublicense, or provide the Service to third parties as a white-label product without our prior written consent;</li>
                    <li>(q) use the Service in any manner that would subject us to liability or reputational harm.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>6.3 Bot Conduct.</strong> Your Bot operates within Discord Guilds subject
                  to Discord&rsquo;s Community Guidelines and Terms of Service. You are solely
                  responsible for all messages sent by your Bot and for ensuring your Bot operates
                  in compliance with the rules of each Discord Guild in which it operates. We are
                  not responsible for actions taken by Discord (including Bot bans) resulting from
                  your use of the Bot.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>6.4 Content Standards.</strong> You are responsible for all Content
                  processed through your Bot. You represent and warrant that you have all necessary
                  rights to any Content you submit to the Service and that such Content does not
                  violate any applicable law or third-party rights.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>6.5 Monitoring and Enforcement.</strong> We reserve the right, but have
                  no obligation, to monitor use of the Service for violations of these Terms. We
                  may investigate complaints, take action against violating accounts (including
                  suspension or termination), and cooperate with law enforcement authorities.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>6.6 Reporting Violations.</strong> If you become aware of any violation
                  of these Terms, please report it to{' '}
                  <a
                    href="mailto:support@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    support@daimon.bot
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* 7. Credentials and Data Security */}
            <section id="credentials" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                7. Credentials and Data Security
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>7.1 Credential Storage.</strong> We store your Credentials (Bot Token,
                  Anthropic API Key, OpenAI API Key, OAuth tokens, third-party API keys) using
                  industry-standard encryption. Specifically, all sensitive credential values are
                  encrypted at rest using Supabase Vault, which employs AES-256 encryption. Access
                  to decrypted credentials is limited to the service processes that require them to
                  operate your Bot.
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>7.2 Credential Handling.</strong> We use your Credentials solely for
                    the purpose of operating the Service on your behalf:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) Your Bot Token is used exclusively to authenticate your Bot with Discord.</li>
                    <li>(b) Your Anthropic API Key is used exclusively to make API calls to Anthropic on your behalf.</li>
                    <li>(c) Your OpenAI API Key, if provided, is used exclusively to make API calls to OpenAI on your behalf.</li>
                    <li>(d) Third-party Credentials are used exclusively to enable the specific Integration for which they were provided.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>7.3 No Credential Sharing.</strong> We will not sell, license, or
                  otherwise provide your Credentials to any third party except as strictly necessary
                  to operate the Service (e.g., transmitting your Anthropic API Key to Anthropic in
                  the course of making inference requests on your behalf).
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>7.4 Your Security Obligations.</strong> You are responsible for:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) not sharing your Credentials with unauthorized parties;</li>
                    <li>(b) rotating your Credentials promptly if you suspect they have been compromised;</li>
                    <li>(c) monitoring for unauthorized use of your Bot Token and Anthropic API Key;</li>
                    <li>(d) revoking OAuth tokens via the relevant Third-Party Service if you disconnect an Integration;</li>
                    <li>(e) ensuring Credentials you provide have only the minimum necessary permissions.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>7.5 Security Incidents.</strong> In the event of a security incident that
                  compromises your Credentials, we will notify you without undue delay and in
                  accordance with applicable law. You agree to cooperate with us in investigating
                  and remediating any security incident.
                </p>
              </div>
            </section>

            {/* 8. Intellectual Property */}
            <section id="ip" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                8. Intellectual Property
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>8.1 Our Intellectual Property.</strong> The Service, including its
                  software, design, text, graphics, user interface, logos, and all other content
                  (excluding User Data), is owned by the Company or its licensors and is protected
                  by copyright, trademark, patent, trade secret, and other intellectual property
                  laws. All rights not expressly granted herein are reserved.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>8.2 License to Use the Service.</strong> Subject to your compliance with
                  these Terms and payment of applicable fees, we grant you a limited, non-exclusive,
                  non-transferable, revocable license to access and use the Service for your
                  personal or internal business purposes during the Term.
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>8.3 Restrictions.</strong> You may not:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) copy, reproduce, modify, adapt, translate, or create derivative works of the Service or any part thereof;</li>
                    <li>(b) sell, sublicense, rent, lease, transfer, assign, or otherwise exploit the Service;</li>
                    <li>(c) remove or obscure any copyright, trademark, or other proprietary notices;</li>
                    <li>(d) use our trademarks, logos, or brand assets without our prior written consent.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>8.4 User Data — Your Ownership.</strong> As between you and us, you
                  retain all ownership rights in and to your User Data. You grant us a limited,
                  non-exclusive, worldwide, royalty-free license to process your User Data solely
                  for the purpose of providing the Service to you. We do not claim ownership of
                  your Discord messages or Bot outputs.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>8.5 Feedback.</strong> If you provide us with suggestions, ideas,
                  enhancement requests, or other feedback about the Service
                  (&ldquo;Feedback&rdquo;), you grant us an unrestricted, perpetual, irrevocable,
                  royalty-free license to use, implement, and incorporate such Feedback into the
                  Service without any obligation to you.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>8.6 Third-Party Software.</strong> The Service incorporates open-source
                  and third-party software components. Applicable licenses for such components are
                  available upon request.
                </p>
              </div>
            </section>

            {/* 9. Privacy and Data */}
            <section id="privacy" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                9. Privacy and Data
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>9.1 Privacy Policy.</strong> Our{' '}
                  <Link
                    href="/privacy"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    Privacy Policy
                  </Link>
                  , available at daimon.bot/privacy and incorporated herein by reference, describes
                  how we collect, use, and share your personal information. By using the Service,
                  you consent to our collection and use of data as described in the Privacy Policy.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>9.2 Discord Message Processing.</strong> Your Bot processes Discord
                  messages in your Discord Guild in order to respond to them. Message content is
                  transmitted to Anthropic&rsquo;s API using your Anthropic API Key for AI
                  inference. We do not persistently store the content of Discord messages processed
                  by your Bot. Conversation context may be held in memory during an active session
                  but is not written to persistent storage.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>9.3 Data Minimization.</strong> We collect and retain only the data
                  necessary to provide the Service. See the Privacy Policy for detailed data
                  retention periods.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>9.4 Data Export.</strong> You may request an export of your User Data at
                  any time by contacting{' '}
                  <a
                    href="mailto:support@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    support@daimon.bot
                  </a>
                  . We will provide a machine-readable export within 30 days of your request.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>9.5 Data Deletion.</strong> Upon Account deletion, we will delete or
                  anonymize your personal information and User Data in accordance with our data
                  retention policy, except where we are required to retain it for legal, tax, or
                  audit purposes.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>9.6 GDPR and Similar Laws.</strong> If you are located in the European
                  Economic Area, United Kingdom, or other jurisdiction with applicable data
                  protection laws, additional rights and obligations may apply. Please see the
                  Privacy Policy for details.
                </p>
              </div>
            </section>

            {/* 10. Termination */}
            <section id="termination" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                10. Termination
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>10.1 Termination by You.</strong> You may terminate your use of the
                  Service and delete your Account at any time via the Settings page. Termination
                  does not entitle you to any refund of prepaid fees except as provided in Section
                  5.7.
                </p>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>10.2 Termination or Suspension by Us.</strong> We may suspend or
                    terminate your Account or access to the Service immediately, with or without
                    notice, if:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) you materially breach these Terms and fail to cure such breach within 14 days of written notice (or immediately for breaches that cannot be cured or that involve illegal activity);</li>
                    <li>(b) you fail to pay fees when due and fail to cure the payment failure within 14 days;</li>
                    <li>(c) we are required to do so by applicable law or legal process;</li>
                    <li>(d) your use of the Service causes or threatens to cause material harm to us, other users, or third parties;</li>
                    <li>(e) your Account appears to be involved in fraudulent activity or abuse.</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>10.3 Effect of Termination.</strong> Upon termination or expiration of
                    your Account:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) your license to use the Service immediately terminates;</li>
                    <li>(b) your Bot will disconnect from Discord and cease operating;</li>
                    <li>(c) your Credentials stored in the Service will be deleted;</li>
                    <li>(d) your Integrations will be disconnected;</li>
                    <li>(e) any prepaid fees for the current Subscription Period are non-refundable, except as provided in Section 5.7;</li>
                    <li>(f) we will retain certain data as required by law or our data retention policy, as described in the Privacy Policy.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>10.4 Survival.</strong> The following sections survive termination:
                  Section 1 (Definitions), Section 6 (Acceptable Use Policy), Section 8
                  (Intellectual Property), Section 11 (Disclaimers), Section 12 (Limitation of
                  Liability), Section 13 (Indemnification), Section 14 (Governing Law and Dispute
                  Resolution), and Section 17 (General Provisions).
                </p>
              </div>
            </section>

            {/* 11. Disclaimers */}
            <section id="disclaimers" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                11. Disclaimers and Warnings
              </h2>
              <div className="space-y-4 text-[15px]">
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2 uppercase font-semibold">
                    11.1 No Warranties.
                  </p>
                  <p className="text-[#4A5568] leading-relaxed uppercase text-sm">
                    The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
                    without warranty of any kind, express or implied. To the fullest extent
                    permitted by applicable law, the company expressly disclaims all warranties,
                    including: (a) any warranty of merchantability, fitness for a particular
                    purpose, title, or non-infringement; (b) any warranty that the service will be
                    uninterrupted, error-free, or free of viruses or other harmful components; (c)
                    any warranty regarding the accuracy, completeness, reliability, or timeliness of
                    content or results provided by the service; (d) any warranty that defects in the
                    service will be corrected.
                  </p>
                </div>
                <p className="text-[#4A5568] leading-relaxed uppercase font-semibold text-sm">
                  11.2 AI Output Disclaimer. The bot uses artificial intelligence to generate
                  responses. AI-generated content may be inaccurate, incomplete, offensive,
                  misleading, or otherwise inappropriate. The company makes no representation that
                  AI-generated responses are accurate, reliable, or suitable for any purpose. You
                  are solely responsible for reviewing and verifying any AI-generated content before
                  acting on it. AI outputs should not be relied upon as a substitute for
                  professional advice in legal, financial, medical, or other regulated domains.
                </p>
                <p className="text-[#4A5568] leading-relaxed uppercase text-sm">
                  <strong>11.3 Third-Party Services.</strong> The service integrates with
                  third-party services (including Discord, Anthropic, OpenAI, GitHub, Google,
                  Linear, and Toggl). We are not responsible for the availability, accuracy,
                  reliability, or conduct of these third-party services. Changes by third-party
                  services to their APIs, terms, or policies may affect the service without advance
                  notice from us.
                </p>
                <p className="text-[#4A5568] leading-relaxed uppercase text-sm">
                  <strong>11.4 Discord-Specific Disclaimer.</strong> Your bot operates within
                  Discord. We are not responsible for: (a) actions taken by Discord, including
                  banning your bot or suspending your Discord account; (b) messages sent or
                  received in your Discord guild; (c) content moderation decisions in your guild;
                  (d) compliance of your bot with Discord&rsquo;s terms of service or community
                  guidelines.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>11.5 No Professional Advice.</strong> Nothing in the Service or Bot
                  outputs constitutes legal, financial, investment, tax, medical, or other
                  professional advice. Always consult qualified professionals before making
                  decisions in such domains.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>11.6 Beta Features.</strong> Features designated as &ldquo;beta,&rdquo;
                  &ldquo;preview,&rdquo; or &ldquo;experimental&rdquo; are provided without any
                  warranty and may be discontinued at any time.
                </p>
              </div>
            </section>

            {/* 12. Limitation of Liability */}
            <section id="liability" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                12. Limitation of Liability
              </h2>
              <div className="space-y-4 text-[15px]">
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2 uppercase font-semibold text-sm">
                    12.1 Exclusion of Consequential Damages.
                  </p>
                  <p className="text-[#4A5568] leading-relaxed uppercase text-sm">
                    To the fullest extent permitted by applicable law, in no event will the company,
                    its officers, directors, employees, agents, licensors, or service providers be
                    liable for any: (a) indirect, incidental, special, consequential, or punitive
                    damages; (b) loss of profits, revenue, data, goodwill, or business
                    opportunities; (c) costs of substitute goods or services; (d) damages arising
                    from unauthorized access to or alteration of your user data or credentials; (e)
                    damages resulting from the conduct of third parties or third-party services;
                    arising out of or in connection with your use of or inability to use the
                    service, even if we have been advised of the possibility of such damages.
                  </p>
                </div>
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2 uppercase font-semibold text-sm">
                    12.2 Cap on Liability.
                  </p>
                  <p className="text-[#4A5568] leading-relaxed uppercase text-sm">
                    To the fullest extent permitted by applicable law, the company&rsquo;s total
                    cumulative liability to you for any and all claims arising out of or in
                    connection with these terms or the service shall not exceed the greater of: (a)
                    the total amount of platform fees you paid to us in the twelve (12) months
                    immediately preceding the event giving rise to the claim; or (b) one hundred US
                    dollars ($100.00).
                  </p>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>12.3 Essential Basis.</strong> You acknowledge that the limitations in
                  this section reflect an allocation of risk between the parties and are an
                  essential element of the basis of the bargain between the parties. The Service
                  would not be provided without these limitations.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>12.4 Exceptions.</strong> Some jurisdictions do not allow exclusion or
                  limitation of incidental or consequential damages. In such jurisdictions, the
                  above limitations apply to the maximum extent permitted by law.
                </p>
                <p className="text-[#4A5568] leading-relaxed uppercase text-sm">
                  <strong>12.5 Third-Party Costs.</strong> You expressly acknowledge that the
                  company is not responsible for any costs you incur with Anthropic, OpenAI, or any
                  other third-party provider resulting from your use of the service. Such costs are
                  entirely your responsibility under your separate agreements with those providers.
                </p>
              </div>
            </section>

            {/* 13. Indemnification */}
            <section id="indemnification" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                13. Indemnification
              </h2>
              <div className="space-y-4 text-[15px]">
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>13.1 Your Indemnification Obligation.</strong> You agree to defend,
                    indemnify, and hold harmless the Company and its officers, directors, employees,
                    agents, licensors, and service providers from and against any and all claims,
                    damages, judgments, awards, losses, liabilities, costs, and expenses (including
                    reasonable attorneys&rsquo; fees) arising out of or relating to:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>(a) your use of the Service, including your Bot&rsquo;s operation in your Discord Guild;</li>
                    <li>(b) your violation of these Terms;</li>
                    <li>(c) your violation of any applicable law or regulation;</li>
                    <li>(d) your violation of any third-party rights, including intellectual property rights, privacy rights, or contractual rights;</li>
                    <li>(e) your use of Credentials that you are not authorized to use;</li>
                    <li>(f) Content processed through your Bot;</li>
                    <li>(g) your violation of Discord&rsquo;s Terms of Service, Developer Terms, or Community Guidelines;</li>
                    <li>(h) any dispute between you and any third party, including your Discord Guild members.</li>
                  </ul>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>13.2 Indemnification Procedure.</strong> We will: (a) notify you promptly
                  of any claim subject to indemnification; (b) give you control of the defense and
                  settlement, provided that you may not settle any claim that imposes liability or
                  obligation on us without our prior written consent; (c) provide you with
                  reasonable cooperation, at your expense.
                </p>
              </div>
            </section>

            {/* 14. Governing Law and Dispute Resolution */}
            <section id="disputes" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                14. Governing Law and Dispute Resolution
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>14.1 Governing Law.</strong> These Terms are governed by and construed in
                  accordance with the laws of the State of Delaware, United States of America,
                  without regard to its conflict of law principles. The United Nations Convention on
                  Contracts for the International Sale of Goods does not apply to these Terms.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>14.2 Informal Resolution.</strong> Before initiating any formal legal
                  proceeding, you agree to first contact us at{' '}
                  <a
                    href="mailto:legal@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    legal@daimon.bot
                  </a>{' '}
                  and attempt to resolve the dispute informally. We will attempt to resolve the
                  dispute within 60 days. If the dispute is not resolved within 60 days of your
                  notice, either party may pursue formal resolution as described below.
                </p>
                <p className="text-[#4A5568] leading-relaxed uppercase font-semibold text-sm">
                  14.3 Binding Arbitration. Except as set forth in Section 14.5, all disputes,
                  controversies, or claims arising out of or relating to these terms or the service
                  shall be resolved by binding individual arbitration administered by the American
                  Arbitration Association (&ldquo;AAA&rdquo;) in accordance with its Commercial
                  Arbitration Rules and Supplementary Procedures for Consumer-Related Disputes. The
                  arbitration shall be conducted in English. The seat of arbitration shall be
                  Wilmington, Delaware. The arbitrator&rsquo;s decision shall be final and binding,
                  and judgment may be entered in any court of competent jurisdiction.
                </p>
                <p className="text-[#4A5568] leading-relaxed uppercase font-semibold text-sm">
                  14.4 Class Action Waiver. To the fullest extent permitted by applicable law, you
                  waive your right to participate in any class action lawsuit, class-wide
                  arbitration, private attorney general action, or representative proceeding against
                  the company. All disputes must be brought on an individual basis.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>14.5 Exceptions to Arbitration.</strong> Either party may seek injunctive
                  or other equitable relief from a court of competent jurisdiction to prevent the
                  actual or threatened infringement, misappropriation, or violation of intellectual
                  property rights or confidential information, or to enforce Section 14.4. For such
                  proceedings, you consent to the exclusive jurisdiction of the state and federal
                  courts located in Wilmington, Delaware.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>14.6 Small Claims.</strong> Either party may bring an individual claim in
                  small claims court in their local jurisdiction if the claim qualifies.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>14.7 European Users.</strong> If you are a resident of the European Union
                  and have a complaint, you may also use the European Commission&rsquo;s Online
                  Dispute Resolution platform at ec.europa.eu/consumers/odr. However, we are not
                  obligated to use that platform to resolve disputes.
                </p>
              </div>
            </section>

            {/* 15. Changes to Terms */}
            <section id="changes" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                15. Changes to Terms
              </h2>
              <div className="space-y-4 text-[15px]">
                <div>
                  <p className="text-[#4A5568] leading-relaxed mb-2">
                    <strong>15.1 Notice of Changes.</strong> We may modify these Terms at any time.
                    We will notify you of material changes by:
                  </p>
                  <ul className="ml-6 space-y-1 text-[#4A5568]">
                    <li>
                      (a) sending an email to the address associated with your Account at least 30
                      days before the changes take effect; and
                    </li>
                    <li>(b) posting a notice in the Service dashboard.</li>
                  </ul>
                  <p className="text-[#4A5568] leading-relaxed mt-2">
                    For non-material changes (such as clarifications, corrections, or changes
                    required by law), we may provide shorter notice or no advance notice.
                  </p>
                </div>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>15.2 Acceptance of Changes.</strong> If you continue to use the Service
                  after the effective date of modified Terms, you are deemed to have accepted the
                  modified Terms. If you do not agree to the modified Terms, you must stop using the
                  Service and delete your Account before the effective date.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>15.3 Archived Terms.</strong> We will maintain a version history of these
                  Terms. Prior versions are available upon request.
                </p>
              </div>
            </section>

            {/* 16. Confidentiality */}
            <section id="confidentiality" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                16. Confidentiality
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>16.1 Confidential Information.</strong> Each party may disclose
                  confidential information to the other party. &ldquo;Confidential
                  Information&rdquo; means any information designated as confidential or that
                  reasonably should be understood to be confidential given the nature of the
                  information and circumstances of disclosure. Your Confidential Information
                  includes your Credentials. Our Confidential Information includes our non-public
                  technical specifications, pricing strategies, and business plans.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>16.2 Obligations.</strong> Each party agrees to: (a) protect the other
                  party&rsquo;s Confidential Information with the same degree of care it uses to
                  protect its own confidential information, but no less than reasonable care; (b)
                  use the other party&rsquo;s Confidential Information only for purposes of
                  performing obligations or exercising rights under these Terms; (c) not disclose
                  the other party&rsquo;s Confidential Information to any third party except as
                  permitted herein.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>16.3 Exceptions.</strong> These obligations do not apply to information
                  that: (a) is or becomes publicly known without breach of these Terms; (b) was
                  known to the receiving party before disclosure; (c) is independently developed by
                  the receiving party without use of the Confidential Information; (d) is received
                  from a third party without restriction.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>16.4 Required Disclosure.</strong> Either party may disclose Confidential
                  Information as required by law, court order, or regulatory requirement, provided
                  it gives the other party prompt written notice (to the extent legally permitted)
                  and cooperates in seeking a protective order.
                </p>
              </div>
            </section>

            {/* 17. General Provisions */}
            <section id="general" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                17. General Provisions
              </h2>
              <div className="space-y-4 text-[15px]">
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.1 Entire Agreement.</strong> These Terms, together with the Privacy
                  Policy and any additional terms incorporated by reference herein, constitute the
                  entire agreement between you and the Company with respect to the Service and
                  supersede all prior and contemporaneous agreements, representations, and
                  understandings, whether written or oral.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.2 Severability.</strong> If any provision of these Terms is held to be
                  invalid, illegal, or unenforceable, that provision shall be modified to the
                  minimum extent necessary to make it enforceable, or if it cannot be so modified,
                  it shall be deemed severed from these Terms, and the remaining provisions shall
                  continue in full force and effect.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.3 Waiver.</strong> Our failure to enforce any right or provision of
                  these Terms shall not constitute a waiver of that right or provision. Any waiver
                  must be in writing and signed by an authorized representative of the Company to
                  be effective.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.4 Assignment.</strong> You may not assign or transfer these Terms or
                  your rights hereunder without our prior written consent. We may assign our rights
                  and obligations under these Terms without restriction, including in connection
                  with a merger, acquisition, sale of assets, or operation of law. These Terms
                  inure to the benefit of and are binding on any permitted assigns.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.5 Notices.</strong> Legal notices to the Company must be sent to:
                  PyMC Technologies, Inc., Attn: Legal. We may send notices to you at the email
                  address associated with your Account.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.6 Electronic Communications.</strong> You consent to receive
                  communications from us electronically, including via email and in-dashboard
                  notifications. You agree that these electronic communications satisfy any legal
                  requirement that communications be in writing.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.7 No Third-Party Beneficiaries.</strong> These Terms do not create any
                  third-party beneficiary rights. Third parties may not enforce any right or
                  obligation under these Terms.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.8 Force Majeure.</strong> Neither party shall be liable for any delay
                  or failure to perform resulting from causes beyond its reasonable control,
                  including acts of God, natural disasters, war, terrorism, civil unrest, government
                  actions, Internet service disruptions, or failures of third-party infrastructure
                  providers (including Discord, Anthropic, Supabase, or Vercel). The affected party
                  must promptly notify the other and use reasonable efforts to mitigate the impact.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.9 Headings.</strong> Section headings are for convenience only and do
                  not affect the interpretation of these Terms.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.10 Language.</strong> These Terms are written in English. Any
                  translation is provided for convenience only. In the event of conflict between the
                  English version and a translation, the English version controls.
                </p>
                <p className="text-[#4A5568] leading-relaxed">
                  <strong>17.11 United States Export Laws.</strong> You represent that you are not
                  located in any country subject to U.S. government embargo or that has been
                  designated by the U.S. government as a &ldquo;terrorist supporting&rdquo; country,
                  and you are not listed on any U.S. government list of prohibited or restricted
                  parties. You agree not to export or re-export the Service in violation of U.S.
                  export laws.
                </p>
              </div>
            </section>

            {/* 18. Contact Information */}
            <section id="contact" className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                18. Contact Information
              </h2>
              <p className="text-[#4A5568] mb-4 leading-relaxed text-[15px]">
                If you have questions about these Terms, please contact us:
              </p>
              <address className="not-italic text-[#4A5568] space-y-1 text-[15px]">
                <p className="font-semibold text-[#0C1F40]">PyMC Technologies, Inc.</p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:legal@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    legal@daimon.bot
                  </a>
                </p>
                <p>
                  Support:{' '}
                  <a
                    href="mailto:support@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    support@daimon.bot
                  </a>
                </p>
                <p>Website: daimon.bot</p>
                <p>
                  Billing:{' '}
                  <a
                    href="mailto:billing@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    billing@daimon.bot
                  </a>
                </p>
                <p>
                  Security:{' '}
                  <a
                    href="mailto:security@daimon.bot"
                    className="text-[#0C1F40]"
                    style={{ textDecoration: 'underline', textDecorationColor: '#B4E7DD' }}
                  >
                    security@daimon.bot
                  </a>
                </p>
              </address>
            </section>

            {/* Appendix A */}
            <section className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                Appendix A: Discord Developer Terms Compliance
              </h2>
              <p className="text-[#4A5568] mb-3 leading-relaxed text-[15px]">
                Your use of the Service, including operating a Bot via Bot Token, is subject to
                Discord&rsquo;s Developer Terms of Service and Developer Policy. By using the
                Service, you represent that your Bot configuration and use complies with all Discord
                developer requirements. Key Discord requirements you must comply with include:
              </p>
              <ul className="ml-6 space-y-2 text-[#4A5568] text-[15px]">
                <li>Your Bot must only request the Discord Gateway intents it requires.</li>
                <li>
                  Your Bot must comply with Discord&rsquo;s Data Deletion requests within the
                  timeframes required by Discord.
                </li>
                <li>
                  If your Bot reaches more than 100 Discord Guilds, additional Discord verification
                  requirements may apply to your Discord application; these are your responsibility
                  to fulfill.
                </li>
                <li>
                  You must not use Bot Tokens to access Discord features in ways that violate
                  Discord&rsquo;s Terms.
                </li>
              </ul>
              <p className="text-[#4A5568] mt-3 leading-relaxed text-[15px]">
                Failure to comply with Discord&rsquo;s terms may result in your Bot Token being
                revoked by Discord, your Discord account being suspended, or other actions by
                Discord outside the control of the Company.
              </p>
            </section>

            {/* Appendix B */}
            <section className="mb-10">
              <h2
                className="font-archivo font-bold text-[#0C1F40] mb-4 text-xl"

              >
                Appendix B: Anthropic and OpenAI Terms Compliance
              </h2>
              <p className="text-[#4A5568] leading-relaxed text-[15px]">
                Your Anthropic API Key is governed by your agreement with Anthropic, PBC, including
                Anthropic&rsquo;s Usage Policy. Your OpenAI API Key, if provided, is governed by
                your agreement with OpenAI, L.L.C. You are solely responsible for compliance with
                those agreements. The Company is not a party to those agreements and provides no
                guarantee that your use of those services through Daimon will comply with their
                terms. AI-generated content produced by Claude (via Anthropic) or OpenAI models in
                response to Discord messages is subject to those providers&rsquo; content policies.
              </p>
            </section>

            {/* Footer note */}
            <hr className="border-[#E2E8F0] my-8" />
            <p className="text-[#718096] italic text-sm">
              These Terms of Service were last updated on March 13, 2026. Version 1.0.
            </p>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}

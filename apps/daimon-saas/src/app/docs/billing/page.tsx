import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing & Plans',
  description:
    "Understanding Daimon's pricing plans — Free, Starter, and Pro. Feature comparison, upgrade flows, and BYOK billing explained.",
  openGraph: {
    title: 'Billing & Plans — Daimon Docs',
    description:
      'Free, Starter ($9/mo), and Pro ($29/mo) plans. BYOK — you only pay Anthropic for actual AI usage.',
    url: 'https://daimon.ai/docs/billing',
    images: [{ url: '/og/docs-billing.png', width: 1200, height: 630, alt: 'Daimon Billing & Plans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Billing & Plans — Daimon Docs',
    description: 'Free, Starter, and Pro plans. BYOK — pay only for what you use.',
    images: ['/og/docs-billing.png'],
  },
  alternates: { canonical: 'https://daimon.ai/docs/billing' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <header className="mb-12">
      <div
        className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2"
      >
        Account &amp; Billing
      </div>
      <h1
        id="billing-plans-title"
        className="font-heading text-3xl font-semibold text-foreground mt-0 mb-2"
      >
        Billing &amp; Plans
      </h1>
      <p
        className="font-body text-lg font-normal text-gray-500 m-0 leading-normal"
      >
        How Daimon plans work, what&apos;s included in each tier, and how to manage your subscription.
      </p>
    </header>
  )
}

const tocItems = [
  { href: '#plans-overview', label: 'Plans Overview' },
  { href: '#byok-model', label: 'The BYOK Model' },
  { href: '#billing-cycles', label: 'Billing Cycles' },
  { href: '#upgrading', label: 'Upgrading Your Plan' },
  { href: '#downgrading', label: 'Downgrading Your Plan' },
  { href: '#canceling', label: 'Canceling Your Subscription' },
  { href: '#managing-billing', label: 'Managing Billing' },
  { href: '#api-keys', label: 'API Keys' },
  { href: '#payment-failures', label: 'Payment Failures' },
]

function Toc() {
  return (
    <nav
      aria-label="On this page"
      className="bg-gray-50 border border-border py-5 px-6 mb-12"
    >
      <p
        className="font-body text-sm font-semibold text-gray-500 uppercase tracking-widest mt-0 mb-3"
      >
        On this page
      </p>
      <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
        {tocItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="font-body text-sm text-[#3F85CC] no-underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-headline text-[22px] font-semibold text-foreground mt-0 mb-5"
    >
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-headline text-[17px] font-semibold text-foreground mt-7 mb-3"
    >
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-body text-[15px] text-gray-700 leading-relaxed mt-0 mb-4"
    >
      {children}
    </p>
  )
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul
      className="font-body text-[15px] text-gray-700 leading-relaxed mt-0 mb-4 pl-6"
    >
      {items.map((item, i) => (
        <li key={i} className="mb-1.5">
          {item}
        </li>
      ))}
    </ul>
  )
}

function Ol({ items }: { items: React.ReactNode[] }) {
  return (
    <ol
      className="font-body text-[15px] text-gray-700 leading-relaxed mt-0 mb-4 pl-6"
    >
      {items.map((item, i) => (
        <li key={i} className="mb-1.5">
          {item}
        </li>
      ))}
    </ol>
  )
}

function Callout({
  type,
  children,
}: {
  type: 'tip' | 'info' | 'warning' | 'danger'
  children: React.ReactNode
}) {
  const styles: Record<string, { bg: string; border: string; label: string; labelColor: string }> = {
    tip: { bg: '#F0FDF4', border: '#86EFAC', label: 'Tip', labelColor: '#166534' },
    info: { bg: '#EFF6FF', border: '#93C5FD', label: 'Note', labelColor: '#1E40AF' },
    warning: { bg: '#FFFBEB', border: '#FCD34D', label: 'Warning', labelColor: '#92400E' },
    danger: { bg: '#FEF2F2', border: '#FCA5A5', label: 'Important', labelColor: '#991B1B' },
  }
  const s = styles[type]
  return (
    <div
      className="font-body text-sm py-4 px-5 mb-6 text-gray-700 leading-relaxed"
      style={{
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.border}`,
      }}
    >
      <span
        className="font-bold text-sm mr-2 uppercase tracking-wide"
        style={{ color: s.labelColor }}
      >
        {s.label}:
      </span>
      {children}
    </div>
  )
}

function SectionDivider() {
  return <div className="h-px bg-border my-12" />
}

function alink(href: string, label: string, newTab?: boolean) {
  return (
    <a
      href={href}
      className="text-[#3F85CC] underline"
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
      {newTab && <span className="sr-only"> (opens in new tab)</span>}
    </a>
  )
}

function acode(text: string) {
  return (
    <code
      className="text-sm font-mono bg-gray-100 py-0.5 px-1.5"
    >
      {text}
    </code>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BillingDocsPage() {
  return (
    <>
      <PageHeader />
      <Toc />

      {/* ── Section 1: Plans Overview ─────────────────────────────── */}
      <H2 id="plans-overview">Plans Overview</H2>
      <P>
        Daimon offers three plans. All plans include the full 50+ tool catalog — the difference is how
        many Discord servers you can connect and the level of support you receive.
      </P>

      {/* Plan comparison table */}
      <div className="overflow-x-auto mb-6">
        <table
          role="table"
 className="font-body text-sm w-full border-collapse"
        >
          <caption className="sr-only">Daimon plan comparison: Free, Starter, and Pro</caption>
          <thead>
            <tr className="border-b-2 border-border bg-gray-50">
 <th className="font-semibold text-left py-3 px-4 text-foreground">Feature</th>
 <th className="font-semibold text-center py-3 px-4 text-foreground">Free</th>
 <th className="font-semibold text-center py-3 px-4 text-foreground">Starter</th>
 <th className="font-semibold text-center py-3 px-4 text-foreground">Pro</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Monthly price', '$0/month', '$9/month', '$29/month'],
              ['Annual price', '$0/year', '$79/year', '$249/year'],
              ['Annual savings', '—', 'Save $29/year', 'Save $99/year'],
              ['Discord connections', '1', 'Up to 3', 'Unlimited'],
              ['All 50+ tools included', '✓', '✓', '✓'],
              ['Bring your own Anthropic key', '✓', '✓', '✓'],
              ['Bring your own OpenAI key (optional)', '✓', '✓', '✓'],
              ['All service integrations', '✓', '✓', '✓'],
              ['Community support (Discord)', '✓', '✓', '✓'],
              ['Email support', '—', '✓ (48-hour response)', '✓ (24-hour response)'],
              ['Priority support', '—', '—', '✓'],
              ['99.9% bot uptime SLA', '—', '—', '✓'],
              ['Payment required', 'No', 'Yes', 'Yes'],
            ].map(([feature, free, starter, pro], i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                <td className={`py-2.5 px-4 text-gray-700 ${feature.startsWith('**') ? "font-semibold" : "font-normal"}`}>
                  {feature}
                </td>
                <td className="py-2.5 px-4 text-gray-700 text-center">{free}</td>
                <td className="py-2.5 px-4 text-gray-700 text-center">{starter}</td>
                <td className="py-2.5 px-4 text-gray-700 text-center">{pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        All plans include the full tool catalog. There are no locked features or paywalled integrations.
        You pay for infrastructure capacity (more connections) and support level — not tool access.
      </Callout>

      <H3>Free Plan</H3>
      <P>
        The Free plan lets you connect one Discord server and one Anthropic API key. There&apos;s no credit
        card required and no trial period — you can use Daimon indefinitely on the Free plan.
      </P>
      <P>The Free plan is ideal for:</P>
      <Ul items={[
        'Individuals managing a single Discord server',
        'Trying out Daimon before committing to a paid plan',
        'Low-volume usage where Anthropic API costs are minimal',
      ]} />

      <H3>Starter Plan — $9/month or $79/year</H3>
      <P>
        The Starter plan lets you connect up to 3 Discord servers simultaneously. Each connection is an
        independent bot instance with its own conversation context.
      </P>
      <P>
        Choosing annual billing saves $29 compared to paying monthly ($79/year vs $108/year).
      </P>
      <P>The Starter plan is ideal for:</P>
      <Ul items={[
        'Teams running one main server plus staging/test servers',
        'Community operators managing a small number of servers',
        'Power users who want email support',
      ]} />

      <H3>Pro Plan — $29/month or $249/year</H3>
      <P>
        The Pro plan removes the connection limit entirely. You can connect as many Discord servers as
        you need, all running simultaneously.
      </P>
      <P>
        Choosing annual billing saves $99 compared to paying monthly ($249/year vs $348/year).
      </P>
      <P>
        The Pro plan includes a 99.9% bot uptime SLA. If the bot is unavailable for longer than
        the SLA permits in a given month, contact {alink('mailto:support@daimon.ai', 'support@daimon.ai')} for a prorated credit.
      </P>
      <P>The Pro plan is ideal for:</P>
      <Ul items={[
        'Agencies or consultants managing many Discord communities',
        'Businesses running separate servers for different teams or regions',
        'Users who need guaranteed uptime and fast support response times',
      ]} />

      <SectionDivider />

      {/* ── Section 2: BYOK Model ─────────────────────────────────── */}
      <H2 id="byok-model">The BYOK Model</H2>
      <P>
        BYOK stands for &quot;Bring Your Own Keys.&quot; Daimon does not charge you for AI usage — instead, you
        connect your own Anthropic API key, and Anthropic bills you directly for every Claude API call
        your bot makes.
      </P>

      <H3>Why BYOK?</H3>
      <Ul items={[
        <><strong>Transparency:</strong> You see exactly how much you&apos;re spending on AI in your Anthropic console.</>,
        <><strong>Control:</strong> You can set usage limits directly in your Anthropic account.</>,
        <><strong>Fairness:</strong> Light users pay less; heavy users pay more — in proportion to their actual usage.</>,
        <><strong>Privacy:</strong> Your conversations go directly between your Discord server and Anthropic&apos;s API. Daimon doesn&apos;t see or store your message content.</>,
      ]} />

      <H3>What Daimon charges for</H3>
      <P>
        Daimon charges a platform fee (your Starter or Pro subscription) for hosting the bot
        infrastructure, managing connections, providing the dashboard, and delivering support.
        This fee is fixed per billing cycle and does not vary with usage.
      </P>

      <H3>What Anthropic charges for</H3>
      <P>
        Anthropic charges per token — input tokens (your messages and context) and output tokens
        (Claude&apos;s responses). Typical usage costs $1–5/month for a moderately active Discord server,
        though this varies widely depending on message volume and which Claude model is used.
      </P>
      <P>
        You can monitor your Anthropic API usage and set spending limits at{' '}
        {alink('https://console.anthropic.com', 'console.anthropic.com', true)}.
      </P>

      <H3>The OpenAI key is optional</H3>
      <P>
        Daimon uses a lightweight classification step to route messages efficiently. This step can use
        OpenAI&apos;s API (typically cheaper for classification than Claude) or fall back to Claude Haiku if
        no OpenAI key is provided. Either way, the bot works fully — the OpenAI key is purely an
        optimization for cost-conscious users.
      </P>

      <Callout type="info">
        Your API keys are stored encrypted using AES-256 via Supabase Vault. They are never logged,
        never exposed in the UI in plaintext, and never shared with third parties.
      </Callout>

      <SectionDivider />

      {/* ── Section 3: Billing Cycles ─────────────────────────────── */}
      <H2 id="billing-cycles">Billing Cycles</H2>

      <H3>Monthly Billing</H3>
      <P>
        With monthly billing, you are charged on the same day each month. For example, if you upgrade on
        March 13, your next charge is April 13, then May 13, and so on.
      </P>
      <P>
        Monthly billing gives you flexibility to cancel at any time. Cancellation takes effect at the end
        of the current period — you keep access through the date you already paid for.
      </P>

      <H3>Annual Billing</H3>
      <P>Annual billing charges you once per year for the full annual price. Annual billing saves you:</P>
      <Ul items={[
        'Starter: $29/year ($79/year vs $108/year monthly)',
        'Pro: $99/year ($249/year vs $348/year monthly)',
      ]} />
      <P>
        Annual billing is available when you initiate Stripe Checkout. Choose &quot;Annual&quot; in the billing
        toggle on the Billing page before clicking Upgrade.
      </P>

      <H3>Switching Between Monthly and Annual</H3>
      <P>
        To switch from monthly to annual (or vice versa), open the Stripe Customer Portal via
        Settings → Billing → &quot;Manage Billing →&quot;. In the portal, you can change your billing interval.
        The change takes effect at the start of your next billing period.
      </P>

      <H3>Billing Date</H3>
      <P>
        Your billing date is set when you first subscribe and does not change unless you explicitly
        change your plan. If you upgrade from Starter to Pro mid-cycle, Stripe calculates a prorated
        charge for the remainder of the current period.
      </P>

      <H3>Currency</H3>
      <P>
        All prices are in USD. Stripe accepts payment in other currencies, but the listed prices are
        USD and your bank converts at the prevailing exchange rate.
      </P>

      <H3>Invoices</H3>
      <P>
        Invoices are issued by Stripe and sent to the email address on your Stripe customer record
        (typically the email you used to sign up for Daimon). You can also access all past invoices
        in the Stripe Customer Portal.
      </P>

      <SectionDivider />

      {/* ── Section 4: Upgrading ─────────────────────────────────── */}
      <H2 id="upgrading">Upgrading Your Plan</H2>
      <P>
        You can upgrade from Free to Starter, Free to Pro, or Starter to Pro at any time.
        Upgrades take effect immediately.
      </P>

      <H3>How to Upgrade</H3>
      <P>
        <strong>Step 1:</strong> Go to <strong>Settings → Billing</strong> (or navigate directly to {acode('/dashboard/billing')}).
      </P>
      <P>
        <strong>Step 2:</strong> In the &quot;Subscription&quot; section, you&apos;ll see the plan comparison grid showing Free,
        Starter, and Pro. The plan you&apos;re currently on shows &quot;Current Plan&quot; (disabled button).
      </P>
      <P>
        <strong>Step 3:</strong> Choose a billing cycle. There&apos;s a toggle above the plan grid labeled &quot;Monthly&quot; and
        &quot;Annual.&quot; Select your preferred cycle. Annual saves you $29/year on Starter or $99/year on Pro.
      </P>
      <P>
        <strong>Step 4:</strong> Click &quot;Upgrade to Starter →&quot; or &quot;Upgrade to Pro →&quot; on the plan card you want.
      </P>
      <P>
        <strong>Step 5:</strong> You&apos;ll be redirected to a Stripe-hosted checkout page. Enter your payment details.
        Stripe accepts Visa, Mastercard, American Express, Discover, and most local payment methods
        via Stripe&apos;s automatic payment method selection.
      </P>
      <P>
        <strong>Step 6:</strong> After completing checkout, Stripe redirects you back to the Billing page with a
        confirmation banner: &quot;Your plan has been upgraded! You now have access to all [Plan] features.&quot;
      </P>

      <H3>What happens immediately after upgrading</H3>
      <Ul items={[
        <>Your {acode('tenants.plan')} is updated to {acode("'starter'")} or {acode("'pro'")}</>,
        'If you were on Free with 1 connection, your additional connection slots become available immediately',
        'Your bot continues running without any interruption during the upgrade',
      ]} />

      <H3>Proration</H3>
      <P>
        If you upgrade from Starter to Pro mid-billing-cycle, Stripe charges a prorated amount for the
        remaining days in the current period at the Pro rate, minus credit for unused days at the Starter
        rate. This appears as a single charge on your card.
      </P>
      <P>
        For example: If you&apos;re on Starter Monthly ($9/month) and upgrade to Pro ($29/month) on day 15
        of your 30-day cycle, Stripe charges approximately $10 (15 days of Pro minus 15 days of unused
        Starter credit = $14.50 - $4.50 ≈ $10).
      </P>

      <H3>Who Can Upgrade</H3>
      <P>
        Only the workspace <strong>Owner</strong> can initiate an upgrade. Members and Admins see the plan grid in
        read-only mode. If you&apos;re a member and want to upgrade, ask your workspace owner.
      </P>

      <Callout type="tip">
        Upgrades are instant. Your new plan limits apply the moment Stripe confirms the payment —
        no need to reconnect your bot or restart anything.
      </Callout>

      <SectionDivider />

      {/* ── Section 5: Downgrading ───────────────────────────────── */}
      <H2 id="downgrading">Downgrading Your Plan</H2>
      <P>
        You can downgrade from Pro to Starter, Pro to Free, or Starter to Free at any time.
        Downgrades do NOT take effect immediately — they take effect at the end of your current
        billing period.
      </P>

      <H3>How to Downgrade</H3>
      <P>
        <strong>Step 1:</strong> Go to <strong>Settings → Billing</strong> ({acode('/dashboard/billing')}).
      </P>
      <P>
        <strong>Step 2:</strong> In the plan comparison grid, click the &quot;Downgrade to [Plan]&quot; button on the
        plan card you want to move to.
      </P>
      <P>
        <strong>Step 3:</strong> A confirmation dialog appears showing the downgrade date and features that
        will be affected, e.g., connection limits. Click &quot;Confirm Downgrade.&quot;
      </P>
      <P>
        <strong>Step 4:</strong> The downgrade is scheduled. The Current Plan Card now shows:
        &quot;⚠ Cancels on [date] · [Reactivate →]&quot;
      </P>

      <H3>What Happens on the Downgrade Date</H3>
      <P>On the first day of the new billing period (when Stripe&apos;s subscription changes take effect):</P>
      <Ul items={[
        <>{acode('tenants.plan')} is updated to the new lower plan</>,
        'Connection limits are enforced: if you have more connections than the new plan allows, excess connections are suspended (status → suspended). The bot stops responding on suspended connections. Connection data is preserved.',
        "Stripe stops charging you at the higher rate. If downgrading to Free, Stripe cancels the subscription entirely.",
      ]} />

      <H3>Reversing a Scheduled Downgrade</H3>
      <P>
        If you&apos;ve scheduled a downgrade but change your mind, click &quot;Reactivate →&quot; in the Current
        Plan Card. This cancels the scheduled downgrade and keeps you on your current plan.
      </P>

      <H3>Connection Limits After Downgrade</H3>
      <P>
        If you have 5 active connections and downgrade from Pro to Starter (limit: 3):
      </P>
      <Ul items={[
        'Connections 1–3: remain active (determined by connection creation date, oldest first)',
        'Connections 4–5: suspended on downgrade date',
      ]} />
      <P>
        You can see which connections will be suspended in advance: go to Settings → Discord
        Connections. Connections at risk of suspension are marked with a warning badge if a downgrade
        is scheduled. To choose which connections to keep, manually disconnect the ones you don&apos;t want
        before the downgrade date.
      </P>

      <H3>Downgrading to Free</H3>
      <P>
        Downgrading to Free cancels your Stripe subscription entirely. No future charges. Your Stripe
        customer record and billing history are preserved in Stripe&apos;s system — if you resubscribe later,
        Stripe will use the same customer record.
      </P>

      <H3>Who Can Downgrade</H3>
      <P>
        Only the workspace <strong>Owner</strong> can initiate a downgrade. Members see the plan grid in read-only mode.
      </P>

      <Callout type="warning">
        Downgrading to Free suspends extra connections on the downgrade date. Suspended connections
        stop responding immediately. Reconnect by upgrading your plan.
      </Callout>

      <SectionDivider />

      {/* ── Section 6: Canceling ─────────────────────────────────── */}
      <H2 id="canceling">Canceling Your Subscription</H2>
      <P>
        Canceling your subscription schedules your plan to revert to Free at the end of your current
        billing period. You are not charged for future periods after canceling.
      </P>

      <H3>How to Cancel</H3>
      <P><strong>Option 1: Via the Billing page</strong></P>
      <Ol items={[
        <>Go to {acode('/dashboard/billing')}</>,
        'In the Current Plan Card, click "Manage Billing →"',
        "You're redirected to the Stripe Customer Portal",
        'In the portal, click "Cancel plan"',
        "Follow Stripe's cancellation flow (select reason, confirm)",
        'Stripe redirects you back to the Daimon Billing page',
      ]} />
      <P>After canceling, the Current Plan Card shows: &quot;⚠ Cancels on [date] · [Reactivate →]&quot;</P>

      <P><strong>Option 2: Via the Stripe Customer Portal directly</strong></P>
      <P>
        If you can&apos;t access the Billing page for any reason, you can cancel directly in Stripe&apos;s
        Customer Portal at {alink('https://billing.stripe.com', 'billing.stripe.com', true)} using the email address
        on your account.
      </P>

      <H3>What &quot;Canceled&quot; Means</H3>
      <Ul items={[
        'Your bot continues running until the cancellation date (end of current period).',
        'On the cancellation date, your plan reverts to Free.',
        'If you have more than 1 active connection, extra connections are suspended on that date.',
        'Your account is NOT deleted. Your data (API keys, connection settings, service connections) is preserved. You remain on the Free plan indefinitely unless you delete your workspace.',
      ]} />

      <H3>Reactivating After Cancellation</H3>
      <P>
        If your plan has been scheduled for cancellation but hasn&apos;t yet taken effect, click
        &quot;Reactivate →&quot; in the Current Plan Card on the Billing page.
      </P>
      <P>
        If your plan has already been downgraded to Free following a cancellation, simply upgrade
        again using the plan grid. There&apos;s no penalty for resubscribing.
      </P>

      <H3>Account Deletion vs. Cancellation</H3>
      <P>
        <strong>Canceling</strong> ends your paid subscription — your account remains on Free.
        <br />
        <strong>Deleting your workspace</strong> removes all data permanently and cannot be undone.
      </P>
      <P>
        To delete your workspace, go to Settings → Danger Zone → &quot;Delete Workspace.&quot;
        This is a separate action from canceling your subscription.
      </P>

      <H3>Refunds</H3>
      <P>
        Daimon does not issue refunds for unused subscription time except where required by applicable
        law. If you believe you&apos;re entitled to a refund, contact{' '}
        {alink('mailto:support@daimon.ai', 'support@daimon.ai')} with your account
        email and billing details.
      </P>

      <SectionDivider />

      {/* ── Section 7: Managing Billing ──────────────────────────── */}
      <H2 id="managing-billing">Managing Billing</H2>
      <P>
        The Stripe Customer Portal is a Stripe-hosted page where you can manage all aspects of your
        Daimon billing account. Access it from the Billing page by clicking &quot;Manage Billing →&quot;
        (available on Starter and Pro plans) or &quot;Update Payment →&quot; (when payment has failed).
      </P>

      <H3>What You Can Do in the Customer Portal</H3>
      <P><strong>Payment methods</strong></P>
      <Ul items={[
        'Add a new credit or debit card',
        'Remove an existing card',
        'Set a default payment method',
      ]} />
      <P><strong>Billing information</strong></P>
      <Ul items={[
        'Update your billing email',
        'Add or update a billing address (required for VAT compliance in some regions)',
        'Add a company name to invoices',
      ]} />
      <P><strong>Invoices</strong></P>
      <Ul items={[
        'View all past invoices',
        'Download invoices as PDF',
        'View individual invoice line items',
      ]} />
      <P><strong>Subscription management</strong></P>
      <Ul items={[
        'Change billing interval (monthly ↔ annual) — takes effect at next renewal',
        'Cancel your subscription',
        'Reactivate a canceled subscription (if still within the current period)',
      ]} />

      <H3>What You Cannot Do in the Customer Portal</H3>
      <Ul items={[
        'Change your plan tier (use the Daimon Billing page plan grid instead)',
        'Upgrade or downgrade plans (use the Daimon Billing page instead)',
        'View Daimon dashboard, connections, or settings',
      ]} />

      <H3>Returning from the Customer Portal</H3>
      <P>
        After completing your changes in the Customer Portal, click the &quot;← Return to Daimon&quot; link
        (Stripe provides this button automatically based on the return URL configured in Stripe settings).
        You&apos;ll be redirected to {acode('/dashboard/billing?portal_return=1')} and see an info banner:
        &quot;Welcome back to Daimon.&quot;
      </P>

      <H3>Billing Contact vs. Account Owner</H3>
      <P>
        The email address Stripe uses for invoices is the billing email — typically the email you used
        to sign up. You can update the billing email in the Customer Portal without changing your
        Daimon login email.
      </P>

      <Callout type="info">
        The Customer Portal is hosted by Stripe, not Daimon. Your payment card details are entered
        directly with Stripe and are never seen by Daimon&apos;s systems.
      </Callout>

      <SectionDivider />

      {/* ── Section 8: API Keys ───────────────────────────────────── */}
      <H2 id="api-keys">API Keys</H2>
      <P>
        Daimon uses two API keys — one required, one optional — to power your bot&apos;s AI capabilities.
        Both are managed on the Billing page under the &quot;API Keys&quot; section.
      </P>

      <H3>Anthropic API Key (Required)</H3>
      <P>
        Your Anthropic API key is the credential that lets your bot call Claude. Without it, the bot
        cannot process any messages.
      </P>
      <P><strong>Where to get it:</strong></P>
      <Ol items={[
        <>Go to {alink('https://console.anthropic.com', 'console.anthropic.com', true)}</>,
        'Sign in or create an Anthropic account',
        'Click "API Keys" in the left sidebar',
        'Click "Create Key"',
        <>Copy the key — it starts with {acode('sk-ant-')}</>,
      ]} />
      <P><strong>How to add it to Daimon:</strong></P>
      <Ol items={[
        <>Go to {acode('/dashboard/billing')}</>,
        'Scroll to the "API Keys" section',
        'Click "Add Key" next to "Anthropic API Key"',
        'A modal opens with a password-style input field',
        <>Paste your key — it should start with {acode('sk-ant-')}</>,
        'Click "Save & Validate"',
        "Daimon sends a lightweight test request to Anthropic's API to confirm the key is valid",
        'On success: the key is stored encrypted and you see "✓ Valid"',
        'On failure: an error message explains what went wrong (see below)',
      ]} />

      <P><strong>Validation errors:</strong></P>
      <div className="overflow-x-auto mb-4">
        <table
          role="table"
 className="font-body text-sm w-full border-collapse"
        >
          <caption className="sr-only">Anthropic API key validation errors</caption>
          <thead>
            <tr className="border-b-2 border-border bg-gray-50">
 <th className="font-semibold text-left py-2.5 px-3 text-foreground">Error</th>
 <th className="font-semibold text-left py-2.5 px-3 text-foreground">Cause</th>
 <th className="font-semibold text-left py-2.5 px-3 text-foreground">Fix</th>
            </tr>
          </thead>
          <tbody>
            {[
              [<>Invalid API key format. Anthropic keys start with {acode('sk-ant-')}.</>, 'Key is pasted incorrectly or wrong key type', 'Re-copy the key from Anthropic console'],
              ['This API key was rejected by Anthropic. It may be expired or have insufficient permissions.', 'Key is revoked or was entered incorrectly', 'Create a new key in the Anthropic console'],
              ['Could not reach Anthropic to validate the key. Please try again.', 'Network error during validation', 'Retry — if it persists, check status.anthropic.com'],
            ].map(([error, cause, fix], i) => (
              <tr key={i} className="border-b border-gray-100">
 <td className="text-sm py-2.5 px-3 text-gray-700">{error}</td>
                <td className="py-2.5 px-3 text-gray-700">{cause}</td>
                <td className="py-2.5 px-3 text-gray-700">{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H3>OpenAI API Key (Optional)</H3>
      <P>
        The OpenAI key is used for a classification step that routes messages efficiently. If not provided,
        Daimon falls back to Claude Haiku for the same classification task — fully functional but
        slightly slower and may cost slightly more per message on Anthropic&apos;s billing.
      </P>
      <P><strong>Where to get it:</strong></P>
      <Ol items={[
        <>Go to {alink('https://platform.openai.com/api-keys', 'platform.openai.com/api-keys', true)}</>,
        'Sign in or create an OpenAI account',
        'Click "Create new secret key"',
        <>Copy the key — it starts with {acode('sk-')}</>,
      ]} />
      <P><strong>Validation errors — OpenAI:</strong></P>
      <div className="overflow-x-auto mb-4">
        <table
          role="table"
 className="font-body text-sm w-full border-collapse"
        >
          <caption className="sr-only">OpenAI API key validation errors</caption>
          <thead>
            <tr className="border-b-2 border-border bg-gray-50">
 <th className="font-semibold text-left py-2.5 px-3 text-foreground">Error</th>
 <th className="font-semibold text-left py-2.5 px-3 text-foreground">Cause</th>
 <th className="font-semibold text-left py-2.5 px-3 text-foreground">Fix</th>
            </tr>
          </thead>
          <tbody>
            {[
              [<>Invalid API key format. OpenAI keys start with {acode('sk-')}.</>, 'Key pasted incorrectly', 'Re-copy from OpenAI platform'],
              ['This API key was rejected by OpenAI. It may be expired or have insufficient permissions.', 'Key is revoked', 'Create a new key in OpenAI platform'],
              ['Could not reach OpenAI to validate the key. Please try again.', 'Network error', 'Retry'],
            ].map(([error, cause, fix], i) => (
              <tr key={i} className="border-b border-gray-100">
 <td className="text-sm py-2.5 px-3 text-gray-700">{error}</td>
                <td className="py-2.5 px-3 text-gray-700">{cause}</td>
                <td className="py-2.5 px-3 text-gray-700">{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H3>Security note for both keys</H3>
      <Ul items={[
        'Keys are stored using Supabase Vault (AES-256 encryption at rest)',
        'Keys are never logged or included in error messages',
        <>The UI shows only a partial hint (first 10 and last 4 characters, e.g., {acode('sk-ant-a...b12c')})</>,
        'Keys are only decrypted in memory at the point of use — never written to logs or returned via API',
        "Only your workspace's bot process has access to the decrypted key value",
      ]} />

      <H3>Key Validation Frequency</H3>
      <P>Keys are validated:</P>
      <Ol items={[
        'When you first save them (immediate test call to the provider API)',
        'Automatically when the bot tries to use them and receives an auth error (marks as invalid)',
        'Manual re-validation is not available — update your key to trigger a fresh validation',
      ]} />

      <SectionDivider />

      {/* ── Section 9: Payment Failures ──────────────────────────── */}
      <H2 id="payment-failures">What Happens When Payment Fails</H2>
      <P>
        If Stripe cannot collect your subscription payment, your subscription enters {acode('past_due')} status.
        Stripe retries the charge automatically on a schedule: after 3 days, then 5 days, then 7 days.
      </P>

      <H3>During the Grace Period</H3>
      <P>While in {acode('past_due')} status:</P>
      <Ul items={[
        'Your bot continues running normally',
        'Your plan limits remain in effect (no connection downgrade yet)',
        'A warning banner appears on your Billing page and Dashboard: "Your last payment failed. Update your payment method to keep your bot running."',
        'Stripe sends you an automated email with a payment link',
      ]} />

      <H3>If Payment Continues to Fail</H3>
      <P>
        After Stripe exhausts its retry schedule (typically 15 days), the subscription is marked
        as {acode('unpaid')}. At this point:
      </P>
      <Ul items={[
        <>Daimon suspends your account ({acode('tenant.status = \'suspended\'')})</>,
        'Your bot goes offline',
        'A suspension banner appears on all dashboard pages',
      ]} />

      <H3>Reactivating After Suspension</H3>
      <Ol items={[
        <>Go to {acode('/dashboard/billing')}</>,
        'Click "Update Payment →" in the Current Plan Card',
        "You'll be redirected to the Stripe Customer Portal",
        'Update your payment method in the portal',
        'In the portal, click "Pay now" to retry the outstanding invoice',
        'After successful payment, Stripe reactivates the subscription',
        "Daimon's webhook handler unsuspends your account within seconds",
        'Your bot reconnects automatically',
      ]} />

      <H3>What to Do if You&apos;re Locked Out</H3>
      <P>
        If your account is suspended and you cannot access the dashboard, contact{' '}
        {alink('mailto:support@daimon.ai', 'support@daimon.ai')} with your registered email address. We can manually
        trigger a payment retry or arrange alternative payment.
      </P>

      <H3>Preventing Payment Failures</H3>
      <Ul items={[
        'Keep your credit card up to date in the Stripe Customer Portal before it expires',
        'Stripe sends expiration reminders 30 days before your card expires',
        'Consider using a corporate card or virtual card number to prevent unexpected expiration',
      ]} />

      <Callout type="danger">
        Account suspension due to unpaid invoices takes the bot offline immediately. Keep your payment
        method current to avoid disruption. Update your card in the Stripe Customer Portal before it
        expires.
      </Callout>

      {/* ── Footer Nav ───────────────────────────────────────────── */}
      <nav
        aria-label="Page navigation"
        className="flex justify-between pt-12 border-t border-border mt-12"
      >
        <div>
          <a
            href="/docs/faq"
            aria-label="Previous page: FAQ"
            className="font-body text-sm text-[#3F85CC] no-underline"
          >
            ← FAQ
          </a>
        </div>
        <div />
      </nav>
    </>
  )
}

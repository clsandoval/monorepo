import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Daimon Docs',
  description:
    'Answers to common questions about Daimon: billing, security, bot setup, troubleshooting, and account limits.',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <header style={{ marginBottom: '48px' }}>
      <div
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          color: '#B4E7DD',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        Account &amp; Billing
      </div>
      <h1
        id="faq-page-title"
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '32px',
          fontWeight: 600,
          color: '#0C1F40',
          margin: '0 0 8px 0',
        }}
      >
        Frequently Asked Questions
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '18px',
          fontWeight: 400,
          color: '#6B7280',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Answers to the most common questions about Daimon.
      </p>
    </header>
  )
}

const tocItems = [
  { href: '#billing-pricing', label: 'Billing & Pricing' },
  { href: '#security', label: 'Security' },
  { href: '#bot-setup-discord', label: 'Bot Setup & Discord' },
  { href: '#integrations-tools', label: 'Integrations & Tools' },
  { href: '#troubleshooting', label: 'Troubleshooting' },
  { href: '#limits-quotas', label: 'Limits & Quotas' },
  { href: '#account-teams', label: 'Account & Teams' },
]

function Toc() {
  return (
    <nav
      aria-label="On this page"
      style={{
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        padding: '20px 24px',
        marginBottom: '48px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 12px 0',
        }}
      >
        On this page
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tocItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                color: '#3F85CC',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function SectionHeading({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: 'var(--font-archivo)',
        fontSize: '22px',
        fontWeight: 600,
        color: '#0C1F40',
        margin: '48px 0 16px 0',
        paddingTop: '8px',
      }}
    >
      {children}
    </h2>
  )
}

function FaqItem({
  question,
  children,
}: {
  question: string
  children: React.ReactNode
}) {
  return (
    <details
      open
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '0px',
        marginBottom: '8px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <style>{`
        details.faq-item[open] { background: #FAFAFA; }
        details.faq-item summary::-webkit-details-marker { display: none; }
        details.faq-item summary::after {
          content: "+";
          font-size: 20px;
          color: #6B7280;
          flex-shrink: 0;
          transition: transform 200ms ease;
        }
        details.faq-item[open] summary::after { content: "−"; }
      `}</style>
      <summary
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          fontWeight: 600,
          color: '#0C1F40',
          padding: '16px 20px',
          cursor: 'pointer',
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {question}
        <span
          style={{
            fontSize: '20px',
            color: '#6B7280',
            flexShrink: 0,
            transition: 'transform 200ms ease',
            userSelect: 'none',
          }}
          aria-hidden="true"
        />
      </summary>
      <div
        style={{
          padding: '0 20px 20px 20px',
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          color: '#374151',
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </details>
  )
}

// answer body helpers
const ap = (text: string | React.ReactNode) => (
  <p style={{ margin: '0 0 12px 0' }}>{text}</p>
)
const apLast = (text: string | React.ReactNode) => (
  <p style={{ margin: 0 }}>{text}</p>
)
const aul = (items: (string | React.ReactNode)[]) => (
  <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
    {items.map((item, i) => (
      <li key={i} style={{ marginBottom: '6px' }}>
        {item}
      </li>
    ))}
  </ul>
)
const alink = (href: string, label: string, newTab?: boolean) => (
  <a
    href={href}
    style={{ color: '#3F85CC', textDecoration: 'underline' }}
    {...(newTab
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {})}
  >
    {label}
    {newTab && (
      <span className="sr-only"> (opens in new tab)</span>
    )}
  </a>
)
const acode = (text: string) => (
  <code
    style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '13px',
      background: '#F3F4F6',
      padding: '2px 6px',
    }}
  >
    {text}
  </code>
)

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FaqPage() {
  return (
    <>
      <PageHeader />
      <Toc />

      {/* ── Billing & Pricing ─────────────────────────────────────── */}
      <SectionHeading id="billing-pricing">Billing &amp; Pricing</SectionHeading>

      <FaqItem question="What plans does Daimon offer?">
        {ap('Daimon offers three plans:')}
        {aul([
          <><strong>Free</strong> — $0/month. Includes 1 Discord connection, all 50+ tools, and community support. You bring your own Anthropic API key. No credit card required to start.</>,
          <><strong>Starter</strong> — $9/month (or $79/year, saving $29). Includes up to 3 Discord connections, all tools, and email support.</>,
          <><strong>Pro</strong> — $29/month (or $249/year, saving $99). Includes unlimited Discord connections, all tools, priority support, and a 99.9% bot uptime SLA.</>,
        ])}
        {apLast('All plans include every tool that Daimon supports — there is no feature gating on tools. The only differences between plans are the number of Discord connections you can run simultaneously and the level of support you receive.')}
      </FaqItem>

      <FaqItem question="Do I need a credit card to sign up?">
        {apLast('No. You can sign up and use the Free plan without providing any payment information. A credit card is only required when you upgrade to Starter or Pro.')}
      </FaqItem>

      <FaqItem question="How does billing work?">
        {ap('Daimon charges a flat monthly (or annual) platform fee via Stripe. This covers running the bot infrastructure for your account.')}
        {ap('You are billed separately by Anthropic for your Claude API usage — Daimon does not see, mark up, or resell your Anthropic API costs. Those charges appear on your Anthropic account directly.')}
        {apLast('Your Daimon subscription renews automatically on the same date each billing period. You can cancel at any time from the Billing page — your access continues until the end of your current billing period.')}
      </FaqItem>

      <FaqItem question='What is the "bring your own key" model?'>
        {ap('Daimon does not bundle Claude API access into your subscription. Instead, you paste your own Anthropic API key into the Billing page. Daimon uses that key to make Claude API calls on your behalf.')}
        <p style={{ margin: '0 0 6px 0' }}>This means:</p>
        {aul([
          'You only pay Anthropic for the Claude API calls your bot actually makes.',
          'Daimon cannot see your API usage or balance.',
          'You have full control over your Anthropic API key — you can revoke it at any time.',
          "You pay Anthropic's standard API pricing, which varies by model and token count.",
        ])}
        {apLast('The Daimon platform fee is separate from and independent of your Anthropic API costs.')}
      </FaqItem>

      <FaqItem question="Can I switch plans at any time?">
        {ap('Yes. You can upgrade or downgrade your plan at any time from the Billing page.')}
        {ap(<><strong>Upgrading (e.g., Free → Starter, or Starter → Pro):</strong> You are redirected to Stripe Checkout to enter payment information. Your new plan takes effect immediately after successful payment. You are billed pro-rated for the remainder of the current billing period.</>)}
        {ap(<><strong>Downgrading (e.g., Pro → Starter, or Starter → Free):</strong> Downgrade requests are processed through the Stripe Customer Portal. Your current plan remains active until the end of your billing period, then the lower plan takes effect.</>)}
        {apLast(<><strong>Canceling:</strong> You can cancel your subscription from the Stripe Customer Portal. Your access to the paid plan features continues until the end of the current billing period, then your account automatically moves to the Free plan.</>)}
      </FaqItem>

      <FaqItem question="What happens if my payment fails?">
        {ap('If your payment fails, Stripe retries the charge automatically over several days. During this time:')}
        {aul([
          'Your bot continues to run normally (grace period).',
          'A warning banner appears on your Daimon dashboard indicating the payment issue.',
          'You will receive email notifications from Stripe to the address on file.',
        ])}
        {apLast('If the payment continues to fail after the retry period, your account will be suspended. While suspended, your bot goes offline. You can restore access by updating your payment method in the Stripe Customer Portal (accessible via the "Update Payment Method" link on your Billing page).')}
      </FaqItem>

      <FaqItem question="Can I get a refund?">
        {ap('Daimon does not offer refunds for partial billing periods. If you cancel mid-cycle, your access continues until the end of the period you already paid for. We do not issue prorated refunds for unused time.')}
        {apLast(<>If you believe you were charged in error, contact {alink('mailto:support@daimon.ai', 'support@daimon.ai')} and we will review your case.</>)}
      </FaqItem>

      <FaqItem question="Is annual billing available?">
        {ap('Yes. Both Starter and Pro plans are available on annual billing at a discount:')}
        {aul([
          'Starter annual: $79/year (saves $29 compared to 12 months of monthly billing)',
          'Pro annual: $249/year (saves $99 compared to 12 months of monthly billing)',
        ])}
        {apLast(<>You can select annual or monthly billing during Stripe Checkout. To switch between monthly and annual, contact {alink('mailto:support@daimon.ai', 'support@daimon.ai')}.</>)}
      </FaqItem>

      <FaqItem question="Does Daimon charge me for the Anthropic API calls my bot makes?">
        {apLast('No. Daimon does not charge for Claude API usage. You pay Anthropic directly via your own API key. Your Daimon subscription fee covers only the platform infrastructure (hosting, database, bot runtime). Your Anthropic account is billed separately at Anthropic\'s standard API rates.')}
      </FaqItem>

      <FaqItem question="What happens to my account if I downgrade from Starter/Pro to Free?">
        <p style={{ margin: '0 0 6px 0' }}>When your subscription to Starter or Pro ends and you move to the Free plan:</p>
        {aul([
          'Your account retains only 1 Discord connection. If you had multiple connections configured, only the first (oldest) connection remains active. Additional connections are disabled but their configuration is preserved — if you re-upgrade, they become active again.',
          'All your service integrations (GitHub, Google, Linear, Toggl, etc.) remain connected.',
          'All your data (history, settings, API keys) is preserved.',
          'Support tier reverts to community support.',
        ])}
      </FaqItem>

      {/* ── Security ─────────────────────────────────────────────── */}
      <SectionHeading id="security">Security</SectionHeading>

      <FaqItem question="How are my API keys stored?">
        {ap('All API keys you provide to Daimon — your Anthropic key, OpenAI key, Toggl API key, and any other service API keys — are encrypted at rest using Supabase Vault (AES-256-GCM encryption). Keys are never stored in plaintext in the database.')}
        {ap(<>In the Daimon dashboard, you will never see your full API key after saving it. Only a short hint (e.g., the last 4 characters: {acode('...sk-ant-...xYzW')}) is displayed so you can identify which key is saved.</>)}
        {apLast("The encrypted keys are only decrypted at the moment the bot needs to make an API call, inside the bot's secure runtime environment. They are never logged, exposed in API responses, or sent to the browser.")}
      </FaqItem>

      <FaqItem question="Is my Discord bot token secure?">
        {ap('Yes. Your Discord bot token is encrypted using Supabase Vault (AES-256-GCM) before being stored in the database — the same encryption used for API keys. The token is never stored in plaintext.')}
        {ap('The token is only decrypted at the moment the bot process establishes a Discord connection. It is never returned to the browser or included in API responses. Only a short hint is shown in your dashboard to confirm a token is saved.')}
        {apLast('If your bot token is ever compromised, you can regenerate it immediately in the Discord Developer Portal. Paste the new token in your Daimon Settings page to update it. Your old token is automatically invalidated by Discord when regenerated.')}
      </FaqItem>

      <FaqItem question="Who can see my API keys?">
        {ap('No one can see your full API keys after you save them — not even Daimon staff. The keys are encrypted with a key managed by Supabase Vault, and the decrypted values are only accessible inside the bot\'s runtime process when needed for API calls.')}
        {apLast("Daimon staff with database access would see only the encrypted ciphertext, which is not usable without the Vault encryption key. The Vault key itself is managed by Supabase's secure infrastructure.")}
      </FaqItem>

      <FaqItem question="Can my team members see my API keys?">
        {apLast('No. Team members added to your workspace cannot view any API keys. Only the workspace owner can save, update, or delete API keys (and they cannot read back the full key — only a hint is shown). Admin and member roles have read-only visibility into whether keys are configured, but cannot view or modify key values.')}
      </FaqItem>

      <FaqItem question="Does Daimon have access to my Discord messages?">
        {ap('Yes, in the sense that your bot processes messages sent to it in Discord. Your Daimon bot reads messages from your Discord server in real time in order to respond to them. This is fundamental to how the bot works.')}
        {ap('Daimon may log message metadata (such as user IDs, timestamps, and channel IDs) for operational purposes such as debugging and performance monitoring. We do not read or log the content of your Discord messages beyond what is necessary to operate the bot.')}
        {apLast(<>See the Daimon Privacy Policy at {alink('/privacy', 'daimon.app/privacy')} for full details on data handling.</>)}
      </FaqItem>

      <FaqItem question="Is my data isolated from other Daimon users?">
        {ap('Yes. Daimon uses a multi-tenant architecture where all users share the same underlying infrastructure (database, bot runtime), but all data is logically isolated by your tenant ID.')}
        {ap('Every database row that contains your data (messages, configuration, API keys, connections) is tagged with your unique tenant ID. Row Level Security (RLS) policies enforced at the database level ensure that one tenant\'s data is never accessible to another tenant\'s queries — even in the event of an application bug.')}
        {apLast("Your bot token and API keys are tenant-scoped: your bot only has access to your own secrets, not other tenants' keys.")}
      </FaqItem>

      <FaqItem question="What happens to my data if I delete my account?">
        <p style={{ margin: '0 0 8px 0' }}>When you delete your account:</p>
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          {[
            'All your API keys and service connection tokens are immediately and permanently deleted from Supabase Vault.',
            'Your Discord connection configuration is deleted, and your bot is disconnected from Discord.',
            'Your tenant record, member records, and subscription are deleted.',
            'Message history and activity logs are deleted within 30 days (may be retained in database backups for up to 90 days per our backup retention policy, after which they are permanently removed).',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>
              {item}
            </li>
          ))}
        </ol>
        {apLast('Account deletion is permanent and cannot be undone. Export any data you need before deleting your account.')}
      </FaqItem>

      {/* ── Bot Setup & Discord ───────────────────────────────────── */}
      <SectionHeading id="bot-setup-discord">Bot Setup &amp; Discord</SectionHeading>

      <FaqItem question="How does Daimon connect to my Discord server?">
        {ap('You create a Discord bot application yourself in the Discord Developer Portal (discord.com/developers/applications). After creating the bot, you copy two things to Daimon:')}
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}><strong>Bot Token</strong> — Found in the Bot section of your Discord application. This is the secret credential that lets Daimon log in as your bot.</li>
          <li style={{ marginBottom: '6px' }}><strong>Guild ID</strong> — The numeric ID of your Discord server. You can get this by right-clicking your server name in Discord (with Developer Mode enabled) and selecting "Copy Server ID."</li>
        </ol>
        {apLast('You paste both values into Daimon\'s Settings page under "Discord Connection." Daimon validates the token (by verifying it authenticates with Discord) and then connects the bot to your server.')}
      </FaqItem>

      <FaqItem question="Do I need to create my own Discord bot?">
        {ap('Yes. Daimon does not provide a shared bot — you create and own your own Discord application. This means:')}
        {aul([
          "You control the bot's name, avatar, and permissions.",
          'Your bot token belongs to you. You can regenerate it or delete the application at any time.',
          'There is no shared bot that multiple users connect to.',
        ])}
        {apLast('The Quick Start guide walks you through creating a Discord application step by step — it takes about 3 minutes.')}
      </FaqItem>

      <FaqItem question="What permissions does my Discord bot need?">
        {ap('Your bot needs the following permissions when added to your server:')}
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <caption className="sr-only">Discord bot permissions required by Daimon</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Permission</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Why it&apos;s needed</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Send Messages', 'To respond to user commands in channels'],
                ['Read Messages / View Channels', 'To receive messages from users'],
                ['Read Message History', 'To look up prior messages when needed'],
                ['Embed Links', 'To send formatted response cards'],
                ['Attach Files', 'To send file attachments (e.g., CSV exports from Toggl)'],
                ['Use Slash Commands', 'To register and respond to slash commands'],
                ['Add Reactions', 'To react to messages as acknowledgment'],
                ['Manage Messages', 'To delete bot messages in cleanup operations'],
              ].map(([perm, reason], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151', fontWeight: 500 }}>{perm}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ap('The recommended way to set permissions: When generating the bot invite URL in the Discord Developer Portal, select these permissions and use the generated URL to add the bot to your server.')}
        <p style={{ margin: '0 0 6px 0' }}>Additionally, enable the following <strong>Privileged Gateway Intents</strong> in the Bot settings of the Developer Portal:</p>
        {aul([
          <><strong>Server Members Intent</strong> — Required for the bot to see member lists.</>,
          <><strong>Message Content Intent</strong> — Required for the bot to read message content (not just slash command interactions).</>,
        ])}
        {apLast('Without the Message Content Intent, your bot will not be able to read the content of regular messages, only slash command payloads.')}
      </FaqItem>

      <FaqItem question="Can I use Daimon with multiple Discord servers?">
        {ap('Yes, on Starter and Pro plans.')}
        {aul([
          <><strong>Free plan</strong>: 1 Discord connection (1 bot token + 1 guild ID).</>,
          <><strong>Starter plan</strong>: Up to 3 Discord connections.</>,
          <><strong>Pro plan</strong>: Unlimited Discord connections.</>,
        ])}
        {apLast('Each connection is a separate Discord bot token connected to a separate guild. You manage connections from the Settings page. Each bot must be separately created in the Discord Developer Portal and invited to its respective server.')}
      </FaqItem>

      <FaqItem question="My bot token is invalid. What do I do?">
        {ap('A "bot token is invalid" error typically means one of the following:')}
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}><strong>The token was copied incorrectly</strong> — Make sure to copy the full token from the Discord Developer Portal without any leading or trailing spaces. Try pasting it into a plain text editor first to check.</li>
          <li style={{ marginBottom: '6px' }}><strong>The token was regenerated</strong> — If you clicked "Reset Token" in the Discord Developer Portal, the old token is immediately invalidated. Paste the new token into Daimon&apos;s Settings page.</li>
          <li style={{ marginBottom: '6px' }}><strong>The Discord application was deleted</strong> — If the application no longer exists, the token cannot be used. Create a new Discord application and bot, then paste the new token.</li>
        </ol>
        {apLast('After pasting a new valid token, click "Validate & Connect" on the Settings page. If validation passes, your bot will attempt to connect to Discord within 30 seconds.')}
      </FaqItem>

      <FaqItem question="My bot is online but not responding. What do I check?">
        {ap('If your bot shows as "Online" in Daimon but is not responding to messages in Discord:')}
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          {[
            <><strong>Check the Message Content Intent</strong> — Go to your Discord Developer Portal → your application → Bot → scroll to "Privileged Gateway Intents" — make sure "Message Content Intent" is enabled. Without this, the bot receives message events but cannot read the message text.</>,
            <><strong>Check the channel</strong> — Make sure you are messaging the bot in a channel where the bot has permission to read messages and send responses. The bot must have "View Channel," "Send Messages," and "Read Message History" permissions in that specific channel.</>,
            <><strong>Check whether you @mentioned the bot</strong> — By default, Daimon bots respond to messages that @mention them (e.g., {acode('@MyBot can you summarize today\'s activity?')}). Simply typing in a channel without a mention may not trigger the bot.</>,
            <><strong>Check the Anthropic API key</strong> — Go to Billing &amp; Keys → API Keys. If your Anthropic key is missing or shows "Invalid," the bot cannot make Claude API calls and will fail silently. Save a valid key and click "Validate."</>,
            <><strong>Check your plan</strong> — Free plan users are limited to 1 active connection. If you added multiple connections, only one is active.</>,
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ol>
      </FaqItem>

      <FaqItem question='What does "bot status: connecting" mean?'>
        {ap('"Connecting" means Daimon has received your bot token and is currently attempting to establish a WebSocket connection to Discord\'s Gateway. This state typically lasts less than 30 seconds.')}
        {apLast(<>If your bot stays in "Connecting" for more than 2 minutes, the token may be invalid (connection is failing silently) or Discord may be experiencing an outage. Check {alink('https://discordstatus.com', 'Discord\'s status page', true)} and verify your token by re-entering it on the Settings page.</>)}
      </FaqItem>

      <FaqItem question='What does "bot status: error" mean?'>
        {ap('"Error" means the bot attempted to connect to Discord but received an error response. Common causes:')}
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <caption className="sr-only">Common bot error reasons and resolutions</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Error reason</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>What to do</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Invalid token', 'Regenerate the token in the Discord Developer Portal and paste the new token into Settings'],
                ['Disallowed intents', 'Enable "Message Content Intent" and "Server Members Intent" in the Developer Portal under Bot → Privileged Gateway Intents'],
                ['Bot not in server', 'The bot was removed from your Discord server. Re-invite it using your bot\'s invite URL'],
                ['Discord API outage', 'Wait for Discord to recover. Check discordstatus.com'],
              ].map(([reason, action], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151', fontWeight: 500 }}>{reason}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {apLast('The error state auto-clears when the bot successfully reconnects. You can force a reconnect attempt by toggling the connection off and back on in Settings.')}
      </FaqItem>

      <FaqItem question="Can I change my bot token after setup?">
        {ap('Yes. Go to Settings → Discord Connections → click the gear icon next to your connection → select "Update Token." Paste your new token and click "Validate & Save." The old token is replaced immediately and the bot reconnects using the new token.')}
        {apLast('If you regenerated your token in the Discord Developer Portal, you must update it in Daimon immediately or your bot will go offline (the old token is invalidated by Discord the moment you regenerate it).')}
      </FaqItem>

      {/* ── Integrations & Tools ─────────────────────────────────── */}
      <SectionHeading id="integrations-tools">Integrations &amp; Tools</SectionHeading>

      <FaqItem question="What tools does Daimon include?">
        {ap('Daimon includes 90+ tools across multiple platforms. Every plan (Free, Starter, Pro) includes all tools — there is no tool gating. The tools you can actually use depend only on which services you have connected.')}
        <p style={{ margin: '0 0 8px 0' }}><strong>Included tool categories:</strong></p>
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <caption className="sr-only">Daimon tool categories and their connection requirements</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Category</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Tools</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Connection required</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Discord', "Send messages, create threads, manage channels, list members (7 tools)", "None (always available via the bot's own token)"],
                ['Dub', 'Create, retrieve, update short links (2 tools)', 'Dub API key'],
                ['Credentials', 'Retrieve stored service credentials (1 tool)', 'None (built-in)'],
                ['GitHub', 'Create, update, comment on issues and PRs (8 tools)', 'GitHub OAuth'],
                ['Toggl', 'Full time tracking — entries, projects, clients, workspaces, reports (34 tools)', 'Toggl API key'],
                ['LinkedIn', 'Profile reads, job searches, company data, connections (17 tools)', 'LinkedIn OAuth'],
                ['Google Analytics', 'Property list, report runs, audience data, realtime (4 tools)', 'Google OAuth'],
                ['Fly', 'App management, machine management, releases, logs (9 tools)', 'Fly API token'],
                ['ACP (Agent Control Plane)', 'Agent status and job management (4 tools)', 'ACP API key'],
                ['Decision Hub', 'Channel configuration, decision records (4 tools)', 'None (built-in)'],
                ['Onyx', 'Document search and retrieval (2 tools)', 'Onyx API key'],
                ['Bluedot', 'Meeting notes, transcript search (4 tools)', 'Bluedot API key'],
                ['Linear (remote MCP)', 'Issue creation, search, update, project management (6 tools)', 'Linear OAuth'],
              ].map(([cat, tools, conn], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151', fontWeight: 500 }}>{cat}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{tools}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{conn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {apLast(<>See the {alink('/docs/tool-reference/discord', 'Tool Reference')} section for the complete list with parameters and examples.</>)}
      </FaqItem>

      <FaqItem question="How do I connect a service to use its tools?">
        {ap('Service connections are managed from the Integrations page in your dashboard. Each service has its own connection method:')}
        {aul([
          <><strong>OAuth services (GitHub, Google/Google Analytics, Linear, LinkedIn):</strong> Click "Connect" next to the service. You will be redirected to that service&apos;s authorization page. After granting permissions, you are returned to Daimon and the connection is saved automatically.</>,
          <><strong>API key services (Toggl, Fly, ACP, Onyx, Bluedot, Dub, Daimon/Decision Hub API keys):</strong> Click "Connect" next to the service. A modal appears with a text input field. Paste your API key (found in that service&apos;s settings page) and click "Save &amp; Validate." Daimon tests the key immediately — if valid, the connection is saved; if invalid, an error is shown.</>,
        ])}
      </FaqItem>

      <FaqItem question="What happens if I remove a service integration?">
        {ap('When you disconnect a service:')}
        {aul([
          "The stored OAuth token or API key is permanently deleted from Daimon's database.",
          "Any bot commands that rely on that service's tools will fail with a \"service not connected\" message in Discord.",
          "Reconnecting the service later restores full tool access — you will need to re-authorize via OAuth or re-enter the API key.",
          'No historical data from that service is deleted from Daimon (conversation logs remain, but new tool calls to that service will fail until reconnected).',
        ])}
      </FaqItem>

      <FaqItem question="I connected GitHub but the bot says it's not authorized. What do I do?">
        {ap("This typically means the OAuth token has expired or been revoked. OAuth access tokens from GitHub can be revoked by the user from GitHub's Authorized Apps settings page.")}
        {apLast('To fix this: Go to Integrations → click "Reconnect" next to GitHub. You will be redirected through the GitHub OAuth flow to grant fresh permissions. After completing the flow, a new token is saved and the bot can use GitHub tools immediately.')}
      </FaqItem>

      <FaqItem question="Can I use the bot without connecting any integrations?">
        {ap('Yes. The Discord tools (send messages, create threads, manage channels, list members) and Decision Hub tools are available without any external service connections. You only need your Anthropic API key (required) and Discord bot token (required) to have a working bot.')}
        {apLast("Other tools simply won't work until you connect the corresponding service. If you ask the bot to create a GitHub issue without GitHub connected, it will tell you in Discord that the GitHub integration is not configured.")}
      </FaqItem>

      <FaqItem question="Does Daimon support custom tools or plugins?">
        {apLast('Not in the current version. The tool set is fixed to the 90+ tools described in the Tool Reference. Custom tool extensions are a planned feature for a future release.')}
      </FaqItem>

      {/* ── Troubleshooting ──────────────────────────────────────── */}
      <SectionHeading id="troubleshooting">Troubleshooting</SectionHeading>

      <FaqItem question="My bot went offline suddenly. What happened?">
        {ap('Bots can go offline for several reasons:')}
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          {[
            <><strong>Discord Gateway disconnect</strong> — Discord periodically disconnects bots. Daimon automatically reconnects within 10–30 seconds. If the bot stays offline, check your Dashboard status card for an error message.</>,
            <><strong>Invalid or regenerated bot token</strong> — If you regenerated your token in the Discord Developer Portal, your existing Daimon connection will fail. Go to Settings → Discord Connections → Update Token → paste the new token.</>,
            <><strong>Payment failed / account suspended</strong> — If your Daimon subscription payment failed and the grace period expired, your account is suspended and the bot is taken offline. Update your payment method from the Billing page.</>,
            <><strong>Discord API outage</strong> — Check {alink('https://discordstatus.com', 'discordstatus.com', true)} to see if Discord is experiencing service issues.</>,
            <><strong>Daimon service disruption</strong> — Check daimon.app for any ongoing incident announcements.</>,
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ol>
        {apLast('If the Dashboard shows "Online" but the bot is unresponsive in Discord, see "My bot is online but not responding" above.')}
      </FaqItem>

      <FaqItem question="The bot is responding but giving errors about tools. What do I check?">
        {ap('Tool errors usually fall into these categories:')}
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <caption className="sr-only">Bot tool error messages and resolutions</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Error message in Discord</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Likely cause</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Resolution</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['"GitHub is not connected to your workspace"', 'GitHub OAuth not connected', 'Go to Integrations → Connect GitHub'],
                ['"Toggl API key is invalid or expired"', 'Toggl API key was rotated', 'Go to Integrations → Reconnect Toggl → paste new API key'],
                ['"Anthropic API key error"', 'Anthropic key is missing, invalid, or has no credits', 'Go to Billing & Keys → update Anthropic API key'],
                ['"You don\'t have permission to use this tool"', 'RLS or service authorization issue', 'Contact support@daimon.ai'],
                ['"Rate limit exceeded"', 'Anthropic or service rate limit hit', "Wait and try again; consider upgrading your Anthropic API plan"],
                ['"Tool execution timed out"', 'External API was slow or unresponsive', "Try again; if persistent, check the external service's status"],
              ].map(([msg, cause, fix], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>{msg}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{cause}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FaqItem>

      <FaqItem question={"I'm getting a \"Workspace not found\" or \"Tenant not found\" error. What does that mean?"}>
        {ap('This typically occurs if:')}
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}>You are trying to access a workspace you were removed from or that was deleted.</li>
          <li style={{ marginBottom: '6px' }}>There is a session issue — your authentication token may be stale.</li>
        </ol>
        {apLast(<>Try signing out and signing back in. If the error persists, contact {alink('mailto:support@daimon.ai', 'support@daimon.ai')} with your account email address.</>)}
      </FaqItem>

      <FaqItem question="How do I report a bug or get help?">
        {ap('For technical issues or unexpected behavior:')}
        {aul([
          <><strong>Email:</strong> {alink('mailto:support@daimon.ai', 'support@daimon.ai')} — include your account email, a description of the issue, and any error messages you see.</>,
          <><strong>Response time:</strong> Starter plan users can expect a response within 2 business days. Pro plan users receive priority support with a target response time of 4 business hours.</>,
          <><strong>Free plan users:</strong> Community support — post in the Daimon community Discord server (link in the footer).</>,
        ])}
        <p style={{ margin: '0 0 6px 0' }}>When reporting a bug, include:</p>
        {aul([
          'Your account email address',
          'The date and approximate time the issue occurred',
          'The Discord channel where the issue occurred (if relevant)',
          'The exact message you sent to the bot (or the action you took)',
          "The bot's response (or error message)",
          'A screenshot if possible',
        ])}
      </FaqItem>

      <FaqItem question='My Anthropic API key shows "Invalid" but I copied it correctly. What do I do?'>
        {ap("An \"Invalid\" status means Daimon's validation check — which makes a small test API call to Anthropic — received an error response. This can happen for these reasons:")}
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          {[
            <><strong>The key has no remaining credits</strong> — Anthropic API keys require a funded account. Check your Anthropic billing at {alink('https://console.anthropic.com', 'console.anthropic.com', true)}.</>,
            <><strong>The key was revoked</strong> — API keys can be deactivated from the Anthropic console. Create a new key and paste it into Daimon.</>,
            <><strong>Copy-paste error</strong> — The key may have been truncated. Keys beginning with {acode('sk-ant-api03-')} are typically 108 characters long. Paste into a plain text editor to verify the full key before saving.</>,
            <><strong>Rate limit on validation</strong> — Rarely, the test call hits a rate limit. Wait 60 seconds and try saving the key again.</>,
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
          ))}
        </ol>
        {apLast('After correcting the issue, go to Billing & Keys → paste the updated key → click "Save & Validate."')}
      </FaqItem>

      <FaqItem question="I signed up but never received a verification email. What do I do?">
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          {[
            'Check your spam/junk folder — verification emails from noreply@daimon.ai are sometimes filtered.',
            'Add noreply@daimon.ai to your contacts or safe-senders list.',
            'Wait up to 5 minutes — email delivery can sometimes be delayed.',
            'If you still haven\'t received it, go to the login page and click "Resend verification email." Enter your email address to request a new verification link.',
            'If the issue persists, contact support@daimon.ai with your signup email address.',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
          ))}
        </ol>
      </FaqItem>

      <FaqItem question="I forgot my password. How do I reset it?">
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          {[
            'Go to daimon.app/login.',
            'Click "Forgot password?" below the sign-in form.',
            'Enter your account email address and click "Send Reset Link."',
            'Check your email for a message from noreply@daimon.ai with the subject "Reset your Daimon password."',
            'Click the link in the email — it expires after 1 hour.',
            'Enter and confirm your new password on the reset page.',
            'You are automatically signed in after a successful reset.',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
          ))}
        </ol>
      </FaqItem>

      {/* ── Limits & Quotas ──────────────────────────────────────── */}
      <SectionHeading id="limits-quotas">Limits &amp; Quotas</SectionHeading>

      <FaqItem question="How many Discord connections can I have?">
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <caption className="sr-only">Discord connection limits by plan</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Plan</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Maximum Discord connections</th>
              </tr>
            </thead>
            <tbody>
              {[['Free', '1'], ['Starter', '3'], ['Pro', 'Unlimited']].map(([plan, limit], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151', fontWeight: 500 }}>{plan}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {apLast('Each connection is one bot token connected to one Discord server (guild). If you are on the Free plan and need to connect a second server, you must upgrade to Starter.')}
      </FaqItem>

      <FaqItem question="Are there limits on how many messages my bot can process?">
        {ap('Daimon does not impose a message processing limit. Your bot processes every message it receives.')}
        {apLast(<>The practical limit is set by your Anthropic API plan — each message sent to your bot results in one or more Claude API calls. Anthropic enforces rate limits (requests per minute, tokens per minute) based on your API tier. If your bot is heavily used, you may hit Anthropic&apos;s rate limits. To increase your Anthropic rate limits, upgrade your Anthropic API usage tier at {alink('https://console.anthropic.com', 'console.anthropic.com', true)}.</>)}
      </FaqItem>

      <FaqItem question="Are there storage limits?">
        {apLast('Daimon does not currently enforce hard storage limits per tenant. Message history, configuration data, and activity logs are stored in a shared PostgreSQL database. Extremely high-volume tenants (millions of messages) may be subject to future fair-use limits.')}
      </FaqItem>

      <FaqItem question="Are there API rate limits on the Daimon website itself?">
        {ap('Yes. The following rate limits apply to the Daimon website API:')}
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <caption className="sr-only">Daimon API rate limits by endpoint category</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Endpoint category</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0C1F40', fontWeight: 600 }}>Rate limit</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Auth endpoints (login, signup, password reset)', '10 requests per minute per IP'],
                ['Dashboard API reads (status, integrations, billing data)', '60 requests per minute per authenticated user'],
                ['Discord token validation (POST /api/discord/validate)', '5 requests per minute per authenticated user'],
                ['API key save/validate endpoints', '10 requests per minute per authenticated user'],
                ['Stripe Checkout creation', '3 requests per minute per authenticated user'],
                ['Stripe Customer Portal creation', '10 requests per minute per authenticated user'],
              ].map(([cat, limit], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{cat}</td>
                  <td style={{ padding: '8px 12px', color: '#374151', fontWeight: 500 }}>{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {apLast(<>If you exceed a rate limit, the API returns HTTP 429 with a {acode('Retry-After')} header indicating when you can retry.</>)}
      </FaqItem>

      <FaqItem question="How many service integrations can I have?">
        {apLast('There is no limit on the number of service integrations. You can connect all supported services simultaneously on any plan.')}
      </FaqItem>

      <FaqItem question="How long is message history retained?">
        {ap('Message history and activity logs are retained for the lifetime of your account. If you delete your account, message history is deleted within 30 days (may persist in database backups for up to 90 days per our backup retention policy).')}
        {apLast('There is no per-plan difference in retention period — all plans retain history indefinitely while the account is active.')}
      </FaqItem>

      {/* ── Account & Teams ──────────────────────────────────────── */}
      <SectionHeading id="account-teams">Account &amp; Teams</SectionHeading>

      <FaqItem question="Can I invite team members to my Daimon workspace?">
        {ap('Team member invitations are a planned feature for a future release. In the current version, each workspace has a single owner and does not support additional team members.')}
        {apLast('If you are setting up Daimon for a team, the workspace owner is the single account that manages the bot, integrations, and billing.')}
      </FaqItem>

      <FaqItem question="Can I have multiple workspaces?">
        {ap('Each Daimon account is associated with one workspace. To create a separate workspace, you would need a separate Daimon account with a separate email address.')}
        {apLast('Multiple workspaces under a single account are a planned feature for a future release.')}
      </FaqItem>

      <FaqItem question="How do I change my workspace name?">
        {apLast('Go to Settings → Workspace → edit the "Workspace Name" field → click "Save." The name change takes effect immediately and is reflected everywhere in the dashboard.')}
      </FaqItem>

      <FaqItem question="How do I change my account email address?">
        {apLast(<>Email address changes are not self-serve in the current version. Contact {alink('mailto:support@daimon.ai', 'support@daimon.ai')} with your current email address and the new email address you want to use. We will manually update your account and send a verification to the new address.</>)}
      </FaqItem>

      <FaqItem question="How do I delete my account?">
        {ap('Account deletion is available in Settings → Workspace → Danger Zone → "Delete Workspace."')}
        <p style={{ margin: '0 0 6px 0' }}><strong>Before deleting, note:</strong></p>
        {aul([
          'Deletion is permanent and cannot be undone.',
          'All data (API keys, connections, configuration, message history) will be deleted.',
          'Your active Daimon subscription will be canceled immediately. No refund is issued for the unused portion of the billing period.',
          'Your Discord bot is disconnected from Discord. Your Discord application (in the Developer Portal) is not deleted — only the Daimon connection is removed.',
        ])}
        {apLast('After clicking "Delete Workspace," you must type your workspace name to confirm, then click "Delete permanently." You will be signed out and your account will be queued for deletion.')}
      </FaqItem>

      <FaqItem question="Can I transfer my workspace to another person?">
        {apLast(<>Workspace ownership transfers are not self-serve. Contact {alink('mailto:support@daimon.ai', 'support@daimon.ai')} to request a transfer. We will require verification of both the current owner&apos;s identity and the new owner&apos;s email address.</>)}
      </FaqItem>

      {/* ── Footer Nav ───────────────────────────────────────────── */}
      <nav
        aria-label="Page navigation"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '48px',
          borderTop: '1px solid #E5E7EB',
          marginTop: '48px',
        }}
      >
        <div>
          <a
            href="/docs/tool-reference/linear"
            aria-label="Previous page: Linear Tools"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              color: '#3F85CC',
              textDecoration: 'none',
            }}
          >
            ← Linear Tools
          </a>
        </div>
        <div>
          <a
            href="/docs/billing"
            aria-label="Next page: Billing & Plans"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              color: '#3F85CC',
              textDecoration: 'none',
            }}
          >
            Billing &amp; Plans →
          </a>
        </div>
      </nav>
    </>
  )
}

import type { Metadata } from 'next'
import { Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quick Start — Daimon Docs',
  description:
    'Set up your own Daimon AI bot in under 10 minutes. Follow this guide from account creation to your first Discord message.',
}

// ---------------------------------------------------------------------------
// Typography helpers
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
        Getting Started
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '32px',
          fontWeight: 600,
          color: '#0C1F40',
          margin: '0 0 8px 0',
        }}
      >
        Quick Start
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '18px',
          fontWeight: 400,
          color: '#6B7280',
          margin: '0 0 12px 0',
          lineHeight: 1.5,
        }}
      >
        From signup to a live AI bot in your Discord server — typically under 10 minutes.
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          color: '#6B7280',
        }}
      >
        <Clock size={16} />
        <span>Estimated time: 8–12 minutes</span>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Callout box
// ---------------------------------------------------------------------------

type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

const CALLOUT_STYLES: Record<
  CalloutType,
  { background: string; borderColor: string; icon: string }
> = {
  info: { background: '#EFF6FF', borderColor: '#3B82F6', icon: 'ℹ' },
  warning: { background: '#FFFBEB', borderColor: '#F59E0B', icon: '⚠' },
  tip: { background: 'rgba(180, 231, 221, 0.20)', borderColor: '#B4E7DD', icon: '✓' },
  danger: { background: '#FEF2F2', borderColor: '#EF4444', icon: '✗' },
}

function Callout({
  type,
  children,
}: {
  type: CalloutType
  children: React.ReactNode
}) {
  const s = CALLOUT_STYLES[type]
  return (
    <div
      style={{
        background: s.background,
        borderLeft: `3px solid ${s.borderColor}`,
        borderRadius: '0px',
        padding: '16px 20px',
        margin: '0 0 24px 0',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          color: s.borderColor,
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        {s.icon}
      </span>
      <div
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          color: '#374151',
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step wrapper
// ---------------------------------------------------------------------------

function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        marginBottom: '48px',
      }}
    >
      {/* Step number circle */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#0C1F40',
          color: '#FFFFFF',
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '4px',
        }}
      >
        {number}
      </div>

      {/* Step content */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: '18px',
            fontWeight: 600,
            color: '#0C1F40',
            margin: '0 0 12px 0',
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared prose style
// ---------------------------------------------------------------------------

const prose: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '15px',
  color: '#374151',
  lineHeight: 1.6,
  margin: '0 0 16px 0',
}

const h4Style: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '15px',
  fontWeight: 600,
  color: '#374151',
  margin: '24px 0 8px 0',
}

const ulStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '15px',
  color: '#374151',
  lineHeight: 1.6,
  margin: '0 0 16px 0',
  paddingLeft: '24px',
}

const liStyle: React.CSSProperties = {
  marginBottom: '8px',
}

const inlineCode: React.CSSProperties = {
  fontFamily: 'Courier New, monospace',
  fontSize: '13px',
  color: '#0C1F40',
  backgroundColor: '#F3F4F6',
  padding: '2px 6px',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function QuickStartPage() {
  return (
    <>
      <PageHeader />

      {/* Prerequisites */}
      <h2
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '24px',
          fontWeight: 600,
          color: '#0C1F40',
          margin: '48px 0 16px 0',
        }}
      >
        Before You Begin
      </h2>
      <p style={prose}>
        You&apos;ll need three things before you can start:
      </p>
      <ol style={{ ...ulStyle, listStyleType: 'decimal' }}>
        <li style={liStyle}>
          <strong>A Discord bot token</strong> — You&apos;ll create a Discord application and bot in
          the Discord Developer Portal. This takes about 3 minutes and is covered in Step 2 below.
        </li>
        <li style={liStyle}>
          <strong>A Discord server (guild)</strong> — You need a server where you have &quot;Manage
          Server&quot; permissions. You&apos;ll be the server owner for your own server, or you need an
          existing server where you can add bots.
        </li>
        <li style={liStyle}>
          <strong>An Anthropic API key</strong> — Daimon uses Claude (by Anthropic) to understand
          and respond to your messages. You provide your own key so you only pay for what you use.
          API key setup is covered in Step 3.
        </li>
      </ol>

      <Callout type="info">
        Daimon uses a &quot;bring your own key&quot; model. Your Anthropic API key is encrypted and stored
        securely — Daimon never charges you for AI usage directly. You&apos;re billed by Anthropic
        separately based on your Claude API usage.
      </Callout>

      <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '32px 0' }} />

      {/* Step 1 */}
      <Step number={1} title="Create Your Daimon Account">
        <p style={prose}>
          Navigate to <strong>daimon.app/signup</strong> to create your account.
        </p>
        <p style={prose}>
          You&apos;ll see the signup page with the Daimon logo centered at the top and a white card
          below it. The form has these fields:
        </p>
        <table
          style={{
            width: '100%',
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
            color: '#374151',
            borderCollapse: 'collapse',
            margin: '0 0 24px 0',
          }}
        >
          <thead>
            <tr>
              {['Field', 'Label', 'Placeholder', 'Notes'].map((h) => (
                <th
                  key={h}
                  style={{
                    backgroundColor: '#F9FAFB',
                    fontWeight: 600,
                    padding: '10px 16px',
                    border: '1px solid #E5E7EB',
                    textAlign: 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Display Name', 'Display Name', 'Ada Lovelace', 'Your name as shown in the workspace'],
              ['Email address', 'Email', 'you@company.com', 'Used for login'],
              ['Password', 'Password', 'Minimum 8 characters', 'Min 8 chars, show/hide toggle'],
              ['Workspace Name', 'Workspace Name', 'Acme Corp', 'Names your Daimon workspace'],
            ].map(([field, label, placeholder, notes]) => (
              <tr key={field}>
                {[field, label, placeholder, notes].map((cell, i) => (
                  <td
                    key={i}
                    style={{ padding: '10px 16px', border: '1px solid #E5E7EB' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={prose}>
          Click <strong>&quot;Create account&quot;</strong>. After successful registration you&apos;ll be
          redirected to <code style={inlineCode}>/dashboard</code> and see the onboarding checklist
          at the top of the page.
        </p>
      </Step>

      {/* Step 2 */}
      <Step number={2} title="Create a Discord Bot">
        <p style={prose}>
          Before you can connect Daimon to your Discord server, you need to create a Discord bot
          application and get its token. This is done entirely on Discord&apos;s website — not
          within Daimon.
        </p>
        <p style={prose}>
          Daimon does <strong>not</strong> use Discord OAuth. You create your own bot and paste its
          token into Daimon. This means your bot will have a custom name and avatar — your users
          will see <em>your</em> bot, not a shared Daimon bot.
        </p>

        <Callout type="tip">
          <strong>Why your own bot?</strong> Because your bot shows up with your name and avatar in
          Discord. It&apos;s yours — you control it, you can rename it, you can use it in multiple
          servers (on higher plans), and you&apos;re not sharing infrastructure with other Daimon
          users.
        </Callout>

        <h4 style={h4Style}>2a. Go to the Discord Developer Portal</h4>
        <p style={prose}>
          Open{' '}
          <a
            href="https://discord.com/developers/applications"
            style={{ color: '#3F85CC', textDecoration: 'none' }}
          >
            discord.com/developers/applications
          </a>{' '}
          in your browser. You&apos;ll need to sign in with your Discord account if you&apos;re not
          already.
        </p>

        <h4 style={h4Style}>2b. Create a new application</h4>
        <p style={prose}>
          Click <strong>&quot;New Application&quot;</strong> in the top-right corner. Enter a name for your
          bot (e.g. &quot;My AI Assistant&quot;) and click <strong>&quot;Create&quot;</strong>.
        </p>

        <h4 style={h4Style}>2c. Create the bot user</h4>
        <p style={prose}>
          In the left sidebar, click <strong>&quot;Bot&quot;</strong>. On the Bot page, click{' '}
          <strong>&quot;Add Bot&quot;</strong>, then confirm by clicking <strong>&quot;Yes, do it!&quot;</strong>.
        </p>

        <h4 style={h4Style}>2d. Copy your bot token</h4>
        <p style={prose}>
          On the Bot page, scroll to the &quot;Token&quot; section. Click <strong>&quot;Reset Token&quot;</strong>{' '}
          (you may need to enter your Discord password or complete 2FA if enabled). Your token is
          displayed once — it looks like a long string of random characters (e.g.{' '}
          <code style={inlineCode}>MTE4...rest of token...</code>).
        </p>
        <p style={prose}>
          <strong>Copy this token and save it somewhere safe immediately</strong> — Discord will not
          show it again after you leave the page.
        </p>

        <Callout type="danger">
          <strong>Never share your bot token.</strong> Anyone who has your bot token can control
          your bot and take actions on its behalf. Treat it like a password. Daimon encrypts your
          token at rest — it is never displayed again after you paste it.
        </Callout>

        <h4 style={h4Style}>2e. Enable required intents</h4>
        <p style={prose}>
          Still on the Bot page, scroll down to <strong>&quot;Privileged Gateway Intents&quot;</strong>.
          Enable ALL of the following:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Presence Intent</strong> — Toggle ON</li>
          <li style={liStyle}><strong>Server Members Intent</strong> — Toggle ON</li>
          <li style={liStyle}><strong>Message Content Intent</strong> — Toggle ON</li>
        </ul>
        <p style={prose}>
          Click <strong>&quot;Save Changes&quot;</strong>. Without these intents, the bot will not be able
          to read messages or respond to your commands.
        </p>

        <h4 style={h4Style}>2f. Invite the bot to your server</h4>
        <p style={prose}>
          In the left sidebar, click <strong>&quot;OAuth2&quot;</strong>, then{' '}
          <strong>&quot;URL Generator&quot;</strong>.
        </p>
        <p style={prose}>
          Under <strong>&quot;Scopes&quot;</strong>, check:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><code style={inlineCode}>bot</code></li>
          <li style={liStyle}><code style={inlineCode}>applications.commands</code></li>
        </ul>
        <p style={prose}>
          Under <strong>&quot;Bot Permissions&quot;</strong>, check:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Read Messages / View Channels</li>
          <li style={liStyle}>Send Messages</li>
          <li style={liStyle}>Send Messages in Threads</li>
          <li style={liStyle}>Read Message History</li>
          <li style={liStyle}>Add Reactions</li>
          <li style={liStyle}>Use Slash Commands</li>
          <li style={liStyle}>Embed Links</li>
          <li style={liStyle}>Attach Files</li>
          <li style={liStyle}>Mention Everyone (optional)</li>
        </ul>
        <p style={prose}>
          Scroll to the bottom. Copy the <strong>&quot;Generated URL&quot;</strong>, open it in a new tab,
          select your server from the dropdown, click <strong>&quot;Authorize&quot;</strong>, complete the
          CAPTCHA, and the bot will join your server.
        </p>

        <Callout type="info">
          <strong>Your Guild ID.</strong> You&apos;ll also need your server&apos;s Guild ID. To find it:
          in Discord, go to User Settings → Advanced → enable &quot;Developer Mode&quot;. Then right-click
          your server name in the left sidebar and click &quot;Copy Server ID&quot;. Save this ID — you&apos;ll
          paste it into Daimon.
        </Callout>

        <h4 style={h4Style}>2g. What you should have now</h4>
        <ul style={ulStyle}>
          <li style={liStyle}>✓ Your <strong>bot token</strong> (the long random string from Step 2d)</li>
          <li style={liStyle}>✓ Your <strong>Guild ID</strong> (the server ID from Developer Mode)</li>
          <li style={liStyle}>✓ The bot is already a member of your server</li>
        </ul>
      </Step>

      {/* Step 3 */}
      <Step number={3} title="Get Your Anthropic API Key">
        <p style={prose}>
          Daimon runs on Claude, Anthropic&apos;s AI model. You need to provide your own Anthropic API
          key. Usage fees are charged directly by Anthropic to your Anthropic account — Daimon
          charges a separate flat platform fee.
        </p>

        <h4 style={h4Style}>3a. Create an Anthropic account</h4>
        <p style={prose}>
          Go to{' '}
          <a
            href="https://console.anthropic.com"
            style={{ color: '#3F85CC', textDecoration: 'none' }}
          >
            console.anthropic.com
          </a>{' '}
          and sign up or log in.
        </p>

        <h4 style={h4Style}>3b. Add billing to your Anthropic account</h4>
        <p style={prose}>
          In the Anthropic Console, navigate to <strong>Settings → Billing</strong>. Add a payment
          method. You need an active billing method before you can create an API key.
        </p>

        <h4 style={h4Style}>3c. Create an API key</h4>
        <p style={prose}>
          Navigate to <strong>API Keys</strong> in the left sidebar. Click{' '}
          <strong>&quot;Create Key&quot;</strong>. Give it a name (e.g. &quot;Daimon Production&quot;). Your API key
          is displayed once — it starts with <code style={inlineCode}>sk-ant-</code>.
        </p>
        <p style={prose}>
          <strong>Copy and save this key immediately.</strong> You&apos;ll paste it into Daimon in the
          next step.
        </p>

        <Callout type="warning">
          API keys are shown only once. If you lose it, you&apos;ll need to create a new key and update
          it in Daimon. The old key can be revoked from the Anthropic Console.
        </Callout>
      </Step>

      {/* Step 4 */}
      <Step number={4} title="Add Your Anthropic API Key to Daimon">
        <p style={prose}>
          Back in Daimon, navigate to{' '}
          <a href="/dashboard/billing" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            Billing
          </a>{' '}
          using the sidebar. You&apos;ll see two sections on this page: &quot;Subscription&quot; (your plan)
          and &quot;API Keys&quot;.
        </p>

        <pre
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: '#E5E7EB',
            backgroundColor: '#0C1F40',
            padding: '20px 24px',
            borderRadius: '0px',
            margin: '0 0 24px 0',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}
        >
          {`API Keys
Your API keys are encrypted and stored securely.
─────────────────────────────────────────────────────────
Anthropic API Key          [Required]
┌───────────────────────────────────┐ [Save] [Delete]
│ sk-ant-••••••••••••••••••••6a4f  │
└───────────────────────────────────┘
Used for all AI responses.

OpenAI API Key             [Optional]
┌───────────────────────────────────┐ [Save] [Delete]
│ Not connected                    │
└───────────────────────────────────┘
Used for message classification (improves accuracy).`}
        </pre>

        <p style={prose}>
          Click the Anthropic API Key input, paste your key (starts with{' '}
          <code style={inlineCode}>sk-ant-</code>), and click <strong>&quot;Save&quot;</strong>. If the key is
          valid, a green &quot;Valid&quot; badge appears next to the label and a success toast confirms the
          save.
        </p>

        <Callout type="info">
          <strong>OpenAI API Key (optional):</strong> You can also add an OpenAI API key. Daimon
          uses it for message classification, which slightly improves response accuracy. If you
          don&apos;t add one, all requests go through Anthropic&apos;s Claude only. You can add this later.
        </Callout>
      </Step>

      {/* Step 5 */}
      <Step number={5} title="Connect Your Discord Bot">
        <p style={prose}>
          Navigate to{' '}
          <a href="/dashboard/settings" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            Settings
          </a>{' '}
          using the sidebar. Scroll down to the <strong>&quot;Discord Connection&quot;</strong> section.
        </p>
        <p style={prose}>
          Click <strong>&quot;Add Connection&quot;</strong>. A form expands inline with two fields:
        </p>
        <table
          style={{
            width: '100%',
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
            color: '#374151',
            borderCollapse: 'collapse',
            margin: '0 0 24px 0',
          }}
        >
          <thead>
            <tr>
              {['Field', 'Label', 'Placeholder', 'Notes'].map((h) => (
                <th
                  key={h}
                  style={{
                    backgroundColor: '#F9FAFB',
                    fontWeight: 600,
                    padding: '10px 16px',
                    border: '1px solid #E5E7EB',
                    textAlign: 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Bot Token', 'Bot Token', 'Paste your Discord bot token', 'Has show/hide toggle. Never stored in plain text.'],
              ['Guild ID', 'Guild ID (Server ID)', 'e.g. 1234567890123456789', 'Numeric Discord server ID'],
            ].map(([field, label, placeholder, notes]) => (
              <tr key={field}>
                {[field, label, placeholder, notes].map((cell, i) => (
                  <td key={i} style={{ padding: '10px 16px', border: '1px solid #E5E7EB' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={prose}>
          Click <strong>&quot;Connect Bot&quot;</strong>. The form collapses and the connection row appears
          with status &quot;Pending&quot;. Within 10–30 seconds, the badge changes to &quot;Connected&quot; as the
          bot comes online.
        </p>

        <pre
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: '#E5E7EB',
            backgroundColor: '#0C1F40',
            padding: '20px 24px',
            borderRadius: '0px',
            margin: '0 0 24px 0',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}
        >
          {`Discord Connection
─────────────────────────────────────────────────────────────────
[Discord logo] MyBot#1234                   Guild 987654321012
               ● Connected   Last seen just now
                                          [Update Token] [Remove]`}
        </pre>
      </Step>

      {/* Step 6 */}
      <Step number={6} title="Verify Your Bot Is Live">
        <p style={prose}>
          Navigate to the{' '}
          <a href="/dashboard" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            Dashboard
          </a>{' '}
          by clicking &quot;Dashboard&quot; in the sidebar.
        </p>
        <p style={prose}>
          Look at the <strong>&quot;Bot Status&quot;</strong> card. It should show:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>A status indicator colored <strong>Aqua</strong> (#B4E7DD)</li>
          <li style={liStyle}>The text <strong>&quot;Connected&quot;</strong> in Navy</li>
          <li style={liStyle}>Your bot&apos;s username below (e.g. &quot;MyBot#1234&quot;)</li>
          <li style={liStyle}>&quot;Last heartbeat: just now&quot; in gray text</li>
        </ul>
        <p style={prose}>
          If you see &quot;Connecting…&quot; (blue indicator), wait 15–30 seconds and refresh. The bot is
          still initializing.
        </p>
        <p style={prose}>
          If you see &quot;Error&quot; (red indicator), see the{' '}
          <a href="/docs/faq" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            FAQ
          </a>{' '}
          for common errors and troubleshooting steps.
        </p>
      </Step>

      {/* Step 7 */}
      <Step number={7} title="Talk to Your Bot in Discord">
        <p style={prose}>
          Open your Discord server. Your bot should appear in the member list on the right side
          with an online status (green dot).
        </p>
        <p style={prose}>
          Go to any text channel and mention your bot to start a conversation:
        </p>

        <pre
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: '#FFFFFF',
            backgroundColor: '#36393F',
            padding: '20px 24px',
            borderRadius: '0px',
            margin: '0 0 16px 0',
            overflowX: 'auto',
          }}
        >
          <span style={{ color: '#7289DA', fontWeight: 700 }}>@MyBot</span>
          {' Can you help me track my time today?'}
        </pre>

        <pre
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: '#FFFFFF',
            backgroundColor: '#36393F',
            padding: '20px 24px',
            borderRadius: '0px',
            margin: '0 0 24px 0',
            overflowX: 'auto',
          }}
        >
          <span style={{ color: '#7289DA', fontWeight: 700 }}>@YourUsername</span>
          {` Sure! To track your time, I can help you\nstart a Toggl time entry. What project or task are\nyou working on?`}
        </pre>

        <p style={prose}>
          If you haven&apos;t connected any integrations yet, the bot will respond to general
          conversation and questions immediately. If you ask it to do something that requires a
          connected service (like tracking time in Toggl), it will tell you which integration you
          need and link you to the{' '}
          <a
            href="/dashboard/integrations"
            style={{ color: '#3F85CC', textDecoration: 'none' }}
          >
            Integrations
          </a>{' '}
          page.
        </p>
      </Step>

      {/* Step 8 */}
      <Step number={8} title="Connect Your Services (Optional)">
        <p style={prose}>
          Daimon can connect to the tools you already use, giving the bot access to real data and
          the ability to take actions. Navigate to{' '}
          <a
            href="/dashboard/integrations"
            style={{ color: '#3F85CC', textDecoration: 'none' }}
          >
            Integrations
          </a>{' '}
          to connect services.
        </p>
        <p style={prose}>Four services are available at launch:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>GitHub</strong> (OAuth) — Manage issues, pull requests, CI status, and
            repositories.
          </li>
          <li style={liStyle}>
            <strong>Google</strong> (OAuth) — Access Google Calendar, Drive, and Gmail.
          </li>
          <li style={liStyle}>
            <strong>Linear</strong> (OAuth) — Manage issues and projects in Linear.
          </li>
          <li style={liStyle}>
            <strong>Toggl</strong> (API Key) — Track time and manage Toggl projects and entries.
          </li>
        </ul>
        <p style={prose}>
          Each service card has a <strong>&quot;Connect&quot;</strong> button. OAuth services redirect you to
          the provider&apos;s authorization page. Toggl requires you to paste your API key from your
          Toggl Profile settings.
        </p>

        <Callout type="tip">
          You can always add integrations later. The bot works for general conversation right away
          — integrations just unlock more powerful capabilities like time tracking, issue management,
          and calendar access.
        </Callout>
      </Step>

      {/* Next steps */}
      <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '32px 0' }} />

      <h2
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '24px',
          fontWeight: 600,
          color: '#0C1F40',
          margin: '0 0 16px 0',
        }}
      >
        Next Steps
      </h2>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <a href="/docs/tool-reference/discord" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            Tool Reference: Discord &amp; Core Tools
          </a>{' '}
          — See all the commands your bot supports out of the box.
        </li>
        <li style={liStyle}>
          <a href="/docs/billing" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            Plans &amp; Pricing
          </a>{' '}
          — Understand plan limits and how to upgrade.
        </li>
        <li style={liStyle}>
          <a href="/docs/faq" style={{ color: '#3F85CC', textDecoration: 'none' }}>
            FAQ
          </a>{' '}
          — Troubleshooting, common questions, and billing answers.
        </li>
      </ul>
    </>
  )
}

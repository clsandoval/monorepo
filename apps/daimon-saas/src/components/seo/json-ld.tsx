// JSON-LD structured data component for schema.org markup

interface JsonLdProps {
  data: object | object[]
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ---------------------------------------------------------------------------
// Pre-built schema objects from spec
// ---------------------------------------------------------------------------

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Daimon',
  url: 'https://daimon.ai',
  description: 'AI Operating System for Discord — 50+ tools, BYOK, Claude-powered',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://daimon.ai/docs?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
} as const

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PyMC Labs',
  url: 'https://pymc-labs.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://daimon.ai/logo.png',
    width: 512,
    height: 512,
  },
  sameAs: ['https://twitter.com/daimon_ai', 'https://github.com/pymc-labs'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@daimon.ai',
    contactType: 'customer support',
  },
} as const

export const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Daimon',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Productivity',
  operatingSystem: 'Discord',
  url: 'https://daimon.ai',
  description:
    'Daimon is an AI operating system for Discord that connects 50+ tools including GitHub, Linear, Toggl, and Google Analytics. Powered by Claude AI with bring-your-own-API-key.',
  screenshot: 'https://daimon.ai/og/landing.png',
  featureList: [
    'Discord bot integration',
    'GitHub integration',
    'Linear project management',
    'Toggl time tracking',
    'Google Analytics',
    'Claude AI powered',
    'Bring your own API key',
    '50+ tools',
  ],
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      description: '1 Discord server, 5 service connections, 100 tool calls/day',
      url: 'https://daimon.ai/#pricing',
    },
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '9',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '9',
        priceCurrency: 'USD',
        unitText: 'MONTH',
      },
      description: '1 Discord server, 20 service connections, 1,000 tool calls/day',
      url: 'https://daimon.ai/#pricing',
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '29',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '29',
        priceCurrency: 'USD',
        unitText: 'MONTH',
      },
      description: '3 Discord servers, unlimited service connections, unlimited tool calls',
      url: 'https://daimon.ai/#pricing',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'PyMC Labs',
    url: 'https://pymc-labs.com',
  },
} as const

export const LANDING_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Daimon?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Daimon is an AI operating system for Discord that connects your server to 50+ tools — GitHub, Linear, Toggl, Google Analytics, and more — powered by Claude AI. You bring your own Anthropic API key and Discord bot token.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does bring-your-own-key work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You provide your own Anthropic API key in the Daimon dashboard. All AI requests are billed directly to your Anthropic account. Daimon charges a small platform fee to cover hosting and infrastructure.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Daimon free to try?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Free plan lets you connect 1 Discord server, use 5 service integrations, and make up to 100 tool calls per day at no cost. No credit card required to start.',
      },
    },
    {
      '@type': 'Question',
      name: 'What integrations does Daimon support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Daimon supports GitHub (issues, PRs, repos), Linear (issues, projects, comments), Toggl Track (time entries, projects, reports), Google Analytics, Google Workspace, Fly.io deployments, LinkedIn, and more — over 50 tools in total.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install anything?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No local installation is required. You create a Discord bot in the Discord Developer Portal, paste the bot token and your guild ID into the Daimon dashboard, add your Anthropic API key, and the bot comes online automatically.',
      },
    },
  ],
} as const

export const DOCS_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need a credit card to sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Free plan requires no credit card. You only need to add a payment method when upgrading to Starter or Pro.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is BYOK (Bring Your Own Key)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BYOK means you provide your own Anthropic API key. All AI usage (Claude model calls) is billed directly to your Anthropic account. Daimon charges a separate platform fee ($9/mo Starter or $29/mo Pro) to cover hosting and infrastructure.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get an Anthropic API key?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to console.anthropic.com, create an account, navigate to API Keys, and click Create Key. You also need to add a payment method in your Anthropic account for API usage billing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my API key stored securely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All API keys are encrypted at rest using Supabase Vault (AES-256-GCM) before storage. Keys are only decrypted in memory at the time of use and are never logged or transmitted in plaintext.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create a Discord bot?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to discord.com/developers/applications and click New Application. Give it a name, then go to the Bot section and click Add Bot. Under Token, click Reset Token to get your bot token. Enable the Message Content Intent under Privileged Gateway Intents. Then use the OAuth2 URL Generator to invite the bot to your server with bot and applications.commands scopes.',
      },
    },
    {
      '@type': 'Question',
      name: 'What Discord permissions does the bot need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The bot requires: Read Messages/View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Add Reactions, and Use Application Commands (slash commands). Enable the Message Content Privileged Intent in the Discord Developer Portal.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take for the bot to come online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After you save your Discord bot token and guild ID in Settings, the bot typically connects within 30 seconds. The dashboard status indicator will turn green (Online) when the connection is established.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if my bot token is invalid?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If the bot token is invalid or has been regenerated in the Discord Developer Portal, the bot will fail to connect and the status will show Error. You will see an error message in the Settings page. Update the token to the new value and save to reconnect.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I connect multiple Discord servers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Pro plan allows up to 3 Discord server connections. The Free and Starter plans are limited to 1 server. Each connection requires its own bot token and guild ID.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the tool call limits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free: 100 tool calls per day. Starter: 1,000 tool calls per day. Pro: Unlimited. Tool call limits reset at midnight UTC. The dashboard shows your current usage.',
      },
    },
    {
      '@type': 'Question',
      name: 'What integrations does Daimon support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Daimon supports: Discord (7 tools), GitHub (1 tool via MCP), Google Workspace, Google Analytics (4 tools), Linear (6 tools via MCP), LinkedIn (17 tools), Toggl Track (34 tools), Fly.io (9 tools), Dub.co (2 tools), and more. Connect integrations via the Integrations page in your dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I connect GitHub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to the Integrations page in your dashboard and click Connect on the GitHub card. You will be redirected to GitHub to authorize Daimon. After authorization, GitHub tools become available in your Discord bot immediately.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I connect Toggl?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Toggl uses API key authentication. Go to the Integrations page, click Connect on the Toggl card, and paste your Toggl API token. Find your Toggl API token at toggl.com/app/profile at the bottom of the page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my subscription at any time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can cancel anytime from the Billing page by clicking Manage Subscription. Your paid plan remains active until the end of the billing period. After cancellation, your account downgrades to the Free plan.',
      },
    },
    {
      '@type': 'Question',
      name: 'What data does Daimon store?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Daimon stores: your account email, encrypted API keys and service tokens, bot connection status and configuration, tool call usage counts (not content), and conversation metadata for Langfuse observability. Daimon does not store the content of Discord messages or tool call responses.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I delete my account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to Settings → Danger Zone and click Delete Account. This immediately disconnects your bot, cancels any active subscription, and schedules deletion of all your data within 30 days per our data retention policy.',
      },
    },
  ],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://daimon.ai' },
      { '@type': 'ListItem', position: 2, name: 'Documentation', item: 'https://daimon.ai/docs' },
      { '@type': 'ListItem', position: 3, name: 'FAQ', item: 'https://daimon.ai/docs/faq' },
    ],
  },
} as const


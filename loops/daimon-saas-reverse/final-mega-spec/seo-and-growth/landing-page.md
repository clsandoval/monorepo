# Landing Page — SEO, Copy & Conversion Spec

> Aspect: 8.2.4
> Written: 2026-03-13
> Related: [../frontend/landing-page.md](../frontend/landing-page.md), [seo-strategy.md](./seo-strategy.md), [content-strategy.md](./content-strategy.md)

---

> **Scope of this file**: This file covers the SEO and conversion marketing layer of the landing page — hero copy, value proposition framing, social proof, CTAs, keyword targeting, schema markup, and OG image spec. For the implementation spec (HTML structure, CSS values, responsive behavior), see [../frontend/landing-page.md](../frontend/landing-page.md).

---

## 1. Primary Keywords to Target

### Tier 1 — Primary intent keywords (highest priority)

| Keyword | Monthly Search Volume (est.) | Intent | Target section |
|---------|------------------------------|--------|---------------|
| discord ai bot | 8,000–12,000 | Informational + commercial | Hero, `<title>`, meta description |
| ai discord bot | 6,000–9,000 | Commercial | Hero, H1 area |
| discord bot anthropic | 800–1,500 | Commercial | Features section |
| claude discord bot | 1,200–2,000 | Commercial | Features section |
| byok discord bot | 300–600 | Commercial | Pricing, FAQ |
| bring your own api key discord | 200–400 | Navigational | FAQ |
| discord automation bot | 2,000–4,000 | Commercial | Features |
| ai assistant discord server | 1,500–2,500 | Commercial | Hero, features |

### Tier 2 — Supporting long-tail keywords

| Keyword | Placement |
|---------|-----------|
| discord github integration bot | Features card: Developer Tools |
| discord linear bot | Features card: Developer Tools |
| discord toggl time tracking | Features card: Time & Tasks |
| discord google calendar bot | Features card: Calendar |
| discord bot no hosting required | How It Works, FAQ |
| self-hosted discord ai | Pricing, FAQ |
| discord bot bring your own key anthropic | Pricing BYOK note |
| discord productivity tools | General copy |

---

## 2. Hero Section — Complete Copy

### Eyebrow Tag Copy
```
Discord AI · Bring Your Own Keys
```

### Primary Headline (H1)
```
Your Discord server,
powered by Claude.
```

**Keyword placement**: "Discord" in first position. "Claude" for brand recognition.
**Headline word count**: 6 words
**Keyword density**: High — "Discord" (primary keyword) in first word

### Subheadline
```
Bring your own bot token and Anthropic API key. Get an AI operating system for your Discord — with 50+ integrated tools, from GitHub and Linear to Google Calendar and Toggl. No workflow setup. No per-message fees.
```

**Word count**: 43 words
**Keyword density in subheadline**:
- "Discord" — 2 occurrences
- "Anthropic API key" — 1 (signals BYOK)
- "GitHub" — 1 (signals developer focus)
- "Linear" — 1 (project management audience)
- "Google Calendar" — 1 (productivity audience)
- "Toggl" — 1 (time-tracking audience)
- "50+ integrated tools" — positions as productivity platform

### Primary CTA Button Text
```
Start Free — No Credit Card
```

**Why this copy**: "Start Free" is action-oriented. "No Credit Card" removes the primary objection for free tier.

### Secondary CTA Button Text
```
Read the Docs
```

**Why this copy**: Targets users who want to understand how it works before committing. Reduces friction for technical evaluators.

### Social Proof Line (below CTAs)
```
Free tier available · Your keys, your costs · Cancel anytime
```

**Why this copy**:
- "Free tier available" — lowers risk, addresses cost objection
- "Your keys, your costs" — reinforces BYOK value prop, ownership framing
- "Cancel anytime" — removes lock-in fear

---

## 3. How It Works Section — Copy

### Section Label
```
Setup
```

### Section Headline
```
Live in three steps.
```

### Section Subheadline
```
No infrastructure to manage. No workflows to configure. Just connect your keys and go.
```

### Step 1 Copy
**Heading**: `Create your Discord bot`

**Body**: `Head to the Discord Developer Portal and create a new application. Enable the Message Content Intent. Copy your bot token and your server (guild) ID.`

**SEO note**: "Discord Developer Portal", "bot token", "guild ID" — captures searches for "how to create discord bot token"

### Step 2 Copy
**Heading**: `Paste your keys`

**Body**: `Sign up for Daimon, then paste your Discord bot token, guild ID, and Anthropic API key into the dashboard. That's it — Daimon stores them encrypted. Your keys never leave our database unencrypted.`

**SEO note**: Addresses "is discord bot safe to use" — security reassurance in step copy

### Step 3 Copy
**Heading**: `Your bot goes live`

**Body**: `Within seconds, your bot connects to your server. Mention it in any channel and it picks the right tools automatically — no commands, no configuration. Claude handles the rest.`

**SEO note**: "mention it in any channel" — explains natural language interaction model

---

## 4. Features Section — Copy

### Section Label
```
Capabilities
```

### Section Headline
```
50+ tools. Zero configuration.
```

### Section Subheadline
```
Every tool is available out of the box. Connect your services once — Claude figures out when to use them.
```

### Feature Card Copy (all 9 cards)

**Card 1: Developer Tools**
- Heading: `Developer Tools`
- Body: `Browse and create GitHub issues, review PRs, query Linear tickets, run shell commands. Your entire dev workflow, in chat.`
- Tag: `GitHub · Linear · Shell`

**Card 2: Time & Tasks**
- Heading: `Time & Tasks`
- Body: `Track time in Toggl with natural language. Create tasks, log hours, and query your time entries — all from Discord.`
- Tag: `Toggl · Tasks`

**Card 3: Knowledge & Research**
- Heading: `Knowledge & Research`
- Body: `Web search, Wikipedia lookup, URL reading, ArXiv papers, Wikipedia disambiguation — Claude retrieves and synthesizes.`
- Tag: `Web · Wikipedia · ArXiv`

**Card 4: Calendar & Scheduling**
- Heading: `Calendar & Scheduling`
- Body: `Query Google Calendar, create events, check availability. Schedule with context from your other tools.`
- Tag: `Google Calendar`

**Card 5: Files & Docs**
- Heading: `Files & Docs`
- Body: `Read and write Google Docs, Google Sheets, and Notion. Upload and retrieve files from Google Drive. Manage content without leaving Discord.`
- Tag: `Google Docs · Drive · Notion`

**Card 6: Memory & Context**
- Heading: `Memory & Context`
- Body: `Daimon remembers. It stores notes and context that persist across conversations, giving you continuity across your server's history.`
- Tag: `Built-in memory`

**Card 7: Communication**
- Heading: `Communication`
- Body: `Send emails via Gmail, draft messages, search your inbox. Manage Slack workspaces you've connected.`
- Tag: `Gmail · Slack`

**Card 8: Media & Images**
- Heading: `Media & Images`
- Body: `Generate images with DALL-E, search for photos, process attachments. Visual AI capabilities within Discord.`
- Tag: `DALL-E · Media`

**Card 9: BYOK Highlight**
- Heading: `You control the costs`
- Body: `Every token your bot uses is charged to your Anthropic account directly. Daimon only charges a small platform fee. No per-message markups.`
- Tag: `BYOK model`

---

## 5. Integrations Section — Copy

### Section Label
```
Integrations
```

### Section Headline
```
Connect the services you already use.
```

### Section Subheadline
```
OAuth in one click for the big ones. Paste an API key for the rest.
```

### Below-logo text
```
+ more services coming soon
```

---

## 6. Pricing Section — Complete Copy

### Section Label
```
Pricing
```

### Section Headline
```
Simple pricing. Your API costs stay yours.
```

### Section Subheadline
```
Daimon charges a small platform fee. You pay Anthropic directly for AI usage. No per-message markup, no hidden fees.
```

### Plan: Free

**Plan name display**: `Free`
**Price display**: `$0 / month`
**Price description**: `Forever free. Bring your own Anthropic key.`
**CTA button**: `Get Started Free`
**Feature list heading**: `What's included`

**Feature list items (verbatim, with bullet)**:
- 1 Discord connection
- 1 guild (server)
- All 50+ tools available
- Bring your own Anthropic API key
- Bring your own service credentials
- Community support (docs only)

### Plan: Starter

**Plan name display**: `Starter`
**Badge**: `Most Popular`
**Price display (monthly)**: `$12 / month`
**Price display (annual)**: `$10 / month` (billed $120/yr)
**Annual save badge**: `Save 20%`
**Price description**: `A small platform fee. You pay Anthropic separately.`
**CTA button**: `Start Starter Plan`

**Feature list items (verbatim)**:
- Everything in Free
- Priority email support (48hr response)
- Dashboard analytics (bot activity overview)
- Connection health monitoring
- 30-day audit log

### Plan: Pro

**Plan name display**: `Pro`
**Price display (monthly)**: `$39 / month`
**Price display (annual)**: `$32 / month` (billed $384/yr)
**Annual save badge**: `Save 18%`
**Price description**: `For teams and power users.`
**CTA button**: `Start Pro Plan`

**Feature list items (verbatim)**:
- Everything in Starter
- Up to 5 Discord connections (multi-server)
- Team members (up to 5)
- Priority support (24hr, dedicated Slack channel)
- Advanced analytics (usage by tool, by user)
- 90-day audit log
- Custom bot name configuration (future)
- Early access to new integrations

### BYOK Pricing Explanation Box

**Title (bold)**: `How BYOK pricing works`

**Body**: `Daimon charges only the platform fee above. Your bot's AI usage (Claude API calls) is billed directly from Anthropic to your API key. You keep full visibility and control over your AI spending.`

---

## 7. FAQ Section — Complete Q&A (12 items)

**Section label**: `FAQ`
**Section headline**: `Common questions.`

---

**Q1**: `Do I need to host my own bot?`

**A**: `No. Daimon runs the bot infrastructure for you on Fly.io. You bring your Discord bot token (which you create once in the Discord Developer Portal) — Daimon handles the rest. Your bot stays online 24/7 without you managing servers.`

---

**Q2**: `What is BYOK (Bring Your Own Keys)?`

**A**: `BYOK means you provide your own Anthropic API key. When your bot responds to messages in Discord, the AI processing cost goes directly to your Anthropic account. Daimon only charges the small platform fee listed above — we never add a markup to your AI usage.`

---

**Q3**: `How do I create a Discord bot token?`

**A**: `Go to discord.com/developers/applications, create a new application, navigate to the "Bot" section, and click "Reset Token" to generate your token. Enable the "Message Content" intent under Privileged Gateway Intents. Copy the token. Also copy your server's ID (right-click your server icon → Copy Server ID). Paste both into your Daimon dashboard. Our Quick Start guide has step-by-step screenshots.`

---

**Q4**: `Is my bot token stored securely?`

**A**: `Yes. Your Discord bot token and API keys are encrypted at rest using Supabase Vault (AES-256 encryption). They are never returned in API responses or logs. Daimon staff cannot view your credentials.`

---

**Q5**: `What services can my bot use?`

**A**: `All 50+ tools are available to every tier. You connect your own accounts for each service (GitHub, Google, Linear, Toggl, Notion, Slack, etc.) and the tools activate. Services you haven't connected simply won't be used.`

---

**Q6**: `Can I use my own OpenAI key?`

**A**: `Optionally. Daimon uses Claude (Anthropic) as the primary AI model. Some classification tasks can optionally use OpenAI — if you paste an OpenAI key, it will be used for those tasks. An OpenAI key is not required.`

---

**Q7**: `What happens if my Anthropic API key runs out of credits?`

**A**: `The bot will stop responding to messages and Daimon will mark your API key as invalid. Your dashboard will show an error state on the "API Keys" card. Update your key or add Anthropic credits to restore service.`

---

**Q8**: `Can I connect multiple Discord servers?`

**A**: `Free and Starter plans support 1 Discord connection. Pro supports up to 5 connections, each pointing to a different Discord server with the same bot token or different tokens.`

---

**Q9**: `Is there a free trial for paid plans?`

**A**: `We don't offer a time-limited trial, but the Free tier is genuinely functional — all tools available, no expiration. Upgrade only when you want priority support, analytics, or multi-server support.`

---

**Q10**: `How do I cancel?`

**A**: `From your dashboard → Billing → Manage Subscription. This opens the Stripe Customer Portal where you can cancel immediately. Your plan downgrades to Free at the end of your billing period. No data is deleted for 30 days after downgrade.`

---

**Q11**: `What if the bot disconnects?`

**A**: `Daimon's health monitoring detects disconnections within 60 seconds and automatically attempts to reconnect using exponential backoff (up to 10 attempts over ~25 minutes). Your dashboard will show a "Reconnecting…" status. If reconnection fails, you'll see an error state with the specific error message from Discord.`

---

**Q12**: `Do you offer team plans or enterprise?`

**A**: `Pro supports up to 5 team members. For enterprise needs (more servers, custom SLAs, private deployments), contact us at hello@daimon.ai.`

---

## 8. Final CTA Section — Copy

### Section Headline
```
Get your AI Discord bot running today.
```

### Section Subheadline
```
Free tier, no credit card, live in minutes.
```

### CTA Button
```
Create Your Free Account
```

### Supporting Link
```
Or read the docs first → View Quick Start
```
Link `href`: `/docs`

---

## 9. Footer Copy

### Column 1: Brand tagline
```
AI-powered Discord, on your terms.
```

### Column 2: Product links
| Label | href |
|-------|------|
| Features | `/#features` |
| Pricing | `/#pricing` |
| Docs | `/docs` |
| Changelog | `/changelog` |

### Column 3: Resources links
| Label | href |
|-------|------|
| Quick Start | `/docs#quick-start` |
| Tool Reference | `/docs#tools` |
| API Keys Guide | `/docs#api-keys` |
| Discord Setup | `/docs#discord-setup` |

### Column 4: Legal links
| Label | href |
|-------|------|
| Terms of Service | `/legal/terms` |
| Privacy Policy | `/legal/privacy` |
| Cookie Policy | `/legal/cookies` |

### Column 5: Company links
| Label | href |
|-------|------|
| About | `/about` |
| Blog | `/blog` |
| Contact | `mailto:hello@daimon.ai` |
| Status | `https://status.daimon.ai` |

### Copyright line
```
© 2026 Daimon. All rights reserved.
```

### Attribution line
```
Built with Claude · Powered by Anthropic
```

---

## 10. SEO Metadata (Landing Page)

### `<title>`
```
Daimon — AI Discord Bot, Bring Your Own Keys
```

### `<meta name="description">`
```
Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest. Free to start.
```
**Character count**: 155 (within 160 limit)

### Open Graph tags
```html
<meta property="og:title"       content="Daimon — AI Discord Bot, Bring Your Own Keys" />
<meta property="og:description" content="Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest." />
<meta property="og:image"       content="https://daimon.ai/og/home.png" />
<meta property="og:url"         content="https://daimon.ai" />
<meta property="og:type"        content="website" />
<meta property="og:site_name"   content="Daimon" />
<meta property="og:locale"      content="en_US" />
```

### Twitter Card tags
```html
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:site"        content="@daimon_ai" />
<meta name="twitter:title"       content="Daimon — AI Discord Bot, Bring Your Own Keys" />
<meta name="twitter:description" content="Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest." />
<meta name="twitter:image"       content="https://daimon.ai/og/home.png" />
```

### Canonical
```html
<link rel="canonical" href="https://daimon.ai" />
```

---

## 11. OG Image Specification — `home.png`

**File path**: `public/og/home.png`
**Dimensions**: 1200 × 630px
**Generation**: Static pre-generated (not dynamic) for performance

| Layer | Content | Specification |
|-------|---------|---------------|
| Background | Solid color | Navy (`#0C1F40`) |
| Blob decoration | Single aqua gradient blob | 600×600px, Aqua at 15%, blur 120px, top-right quadrant |
| Logo icon | Rocket SVG | 60px, Aqua color, top-left, 48px from edges |
| Main headline | "Daimon" | Archivo Expanded wdth:125, 80px, white, centered horizontally, y:220px |
| Sub-text line 1 | "AI Discord Bot · Bring Your Own Keys" | Inter 26px, white at 70%, y:320px, centered |
| Sub-text line 2 | "50+ tools · Free to start" | Inter 20px, white at 50%, y:370px, centered |
| Domain stamp | "daimon.ai" | Inter 18px, white at 35%, bottom-right, 40px from edges |

---

## 12. Schema.org Markup (Structured Data)

**Placement**: `<script type="application/ld+json">` in `<head>` of `/` page

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Daimon",
  "description": "AI-powered Discord bot with 50+ integrated tools. Bring your own Anthropic API key.",
  "url": "https://daimon.ai",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Discord",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier with all 50+ tools. Bring your own API key."
    },
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "12",
      "priceCurrency": "USD",
      "description": "Platform fee for priority support, analytics, and health monitoring."
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "39",
      "priceCurrency": "USD",
      "description": "Up to 5 Discord connections, team members, advanced analytics."
    }
  ],
  "publisher": {
    "@type": "Organization",
    "name": "PyMC Technologies, Inc.",
    "url": "https://daimon.ai",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@daimon.ai",
      "contactType": "customer support"
    }
  },
  "keywords": "discord ai bot, discord automation, claude discord, byok ai, discord productivity",
  "screenshot": "https://daimon.ai/og/home.png",
  "featureList": [
    "GitHub integration",
    "Linear integration",
    "Toggl time tracking",
    "Google Calendar",
    "Google Docs and Drive",
    "Gmail",
    "50+ tools available",
    "Bring your own Anthropic API key",
    "No workflow setup required",
    "24/7 bot uptime"
  ]
}
```

**FAQ Schema** (for FAQ section — enables Google FAQ rich results):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need to host my own bot?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Daimon runs the bot infrastructure for you on Fly.io. You bring your Discord bot token — Daimon handles the rest. Your bot stays online 24/7 without you managing servers."
      }
    },
    {
      "@type": "Question",
      "name": "What is BYOK (Bring Your Own Keys)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BYOK means you provide your own Anthropic API key. When your bot responds to messages in Discord, the AI processing cost goes directly to your Anthropic account. Daimon only charges a small platform fee — no markup on your AI usage."
      }
    },
    {
      "@type": "Question",
      "name": "Is my bot token stored securely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Your Discord bot token and API keys are encrypted at rest using Supabase Vault (AES-256 encryption). They are never returned in API responses or logs."
      }
    },
    {
      "@type": "Question",
      "name": "What services can my bot use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All 50+ tools are available to every tier, including GitHub, Linear, Toggl, Google Calendar, Google Docs, Google Drive, Gmail, Slack, Notion, and more. Services you haven't connected simply won't be used."
      }
    },
    {
      "@type": "Question",
      "name": "How do I cancel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "From your dashboard → Billing → Manage Subscription. This opens the Stripe Customer Portal where you can cancel immediately. Your plan downgrades to Free at the end of your billing period."
      }
    }
  ]
}
```

---

## 13. Conversion Optimization Notes

### Objection-handling map

| Visitor objection | Copy that addresses it | Location |
|------------------|----------------------|----------|
| "Will this cost a lot?" | "Daimon only charges a small platform fee. You pay Anthropic directly." | Pricing subheadline, BYOK note |
| "Is my data/token safe?" | "Encrypted at rest using Supabase Vault (AES-256)." | FAQ Q4, How It Works Step 2 |
| "Do I need to set anything up?" | "No workflow setup. No per-message fees." | Hero subheadline |
| "Do I need to host a server?" | "No. Daimon runs the infrastructure." | FAQ Q1, How It Works Step 3 |
| "What if I want to try it first?" | "Free tier available · Cancel anytime" | Social proof line below CTAs |
| "Is it locked in?" | "Cancel anytime" | Social proof line |
| "What if I'm a developer?" | Features Card 1: Developer Tools, "GitHub · Linear · Shell" | Features grid |
| "Is it just for Discord?" | "50+ integrated tools, from GitHub and Linear to Google Calendar and Toggl" | Hero subheadline |

### CTA hierarchy (per section)

| Section | Primary CTA | Secondary CTA |
|---------|------------|--------------|
| Nav | "Get Started Free" → `/signup` | — |
| Hero | "Start Free — No Credit Card" → `/signup` | "Read the Docs" → `/docs` |
| How It Works | — | — (section is informational) |
| Features | — | — |
| Integrations | — | — |
| Pricing | Each plan has its own CTA button | — |
| FAQ | — | Inline link to `/docs#quick-start` in Q3 |
| Final CTA banner | "Create Your Free Account" → `/signup` | "View Quick Start" → `/docs` |

### A/B test candidates (future)

| Element | Variant A (current) | Variant B (to test) |
|---------|--------------------|--------------------|
| Hero headline | "Your Discord server, powered by Claude." | "The AI operating system for Discord teams." |
| Primary CTA | "Start Free — No Credit Card" | "Get Started in 2 Minutes" |
| Social proof line | "Free tier available · Your keys, your costs · Cancel anytime" | "Join [N] Discord servers already using Daimon" |
| Pricing CTA | "Start Starter Plan" | "Upgrade to Starter — $12/mo" |

---

## 14. Cross-References

- Full landing page implementation (HTML structure, CSS values): [../frontend/landing-page.md](../frontend/landing-page.md)
- SEO meta tags for all other pages: [seo-strategy.md](./seo-strategy.md)
- Content strategy (blog, comparison pages): [content-strategy.md](./content-strategy.md)
- Pricing feature details: [../premium/tiers.md](../premium/tiers.md)
- Legal copy (ToS, Privacy, Disclaimers): [../legal/](../legal/)
- Complete copy inventory: [../frontend/copy.md](../frontend/copy.md)

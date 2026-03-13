# Content Strategy — Blog Topics, Comparison Pages, Keyword Targeting

> Aspect: 6.5b
> Last updated: 2026-03-13
> Related: [seo-strategy.md](./seo-strategy.md), [../frontend/landing-page.md](../frontend/landing-page.md), [../premium/tiers.md](../premium/tiers.md)

---

## 1. Landing Page Keyword Targeting

### Primary Target Keywords

These are the keywords the landing page (`/`) is optimized for. The title, H1, meta description, and above-the-fold copy are all written with these in mind.

| Keyword | Monthly Search Volume (est.) | Intent | Priority |
|---------|------------------------------|--------|----------|
| `discord ai bot` | 8,100 | Informational + Commercial | Primary |
| `ai bot for discord` | 4,400 | Commercial | Primary |
| `discord automation bot` | 2,900 | Commercial | Primary |
| `discord productivity bot` | 1,300 | Commercial | Primary |
| `ai assistant discord` | 2,200 | Commercial | Primary |
| `claude ai discord` | 880 | Navigational + Commercial | Secondary |
| `discord github integration` | 1,600 | Commercial | Secondary |
| `discord project management bot` | 720 | Commercial | Secondary |
| `discord toggl integration` | 210 | Commercial | Secondary |
| `bring your own api key ai` | 390 | Commercial | Secondary |
| `byok ai discord` | 110 | Commercial | Long-tail |
| `self-hosted discord ai bot` | 320 | Commercial | Long-tail |
| `discord linear integration` | 480 | Commercial | Long-tail |
| `discord google analytics bot` | 160 | Commercial | Long-tail |
| `decision orchestrator discord` | 50 | Navigational | Brand |
| `daimon ai bot` | 30 | Navigational | Brand |

### Keyword Groupings by Landing Page Section

#### Hero Section (`#hero`)
- **Primary keyword in H1**: `discord ai bot` — H1 text: "Your Discord Server, Supercharged by AI"
- **Secondary keywords in subheadline**: `ai assistant`, `automation`, `productivity`
- **LSI (latent semantic indexing) keywords woven in**: `Claude AI`, `50+ tools`, `BYOK`

#### Features Section (`#features`)
- **GitHub integration keywords**: `discord github`, `github notifications discord`, `discord pull request bot`
- **Project management keywords**: `discord linear`, `discord project management`, `discord task bot`
- **Time tracking keywords**: `discord toggl`, `time tracking discord bot`, `toggl integration`
- **Analytics keywords**: `discord google analytics`, `analytics reporting discord`

#### Pricing Section (`#pricing`)
- **BYOK keywords**: `bring your own api key`, `byok ai`, `own anthropic key`
- **Free tier keywords**: `free discord ai bot`, `free discord automation`
- **Self-serve keywords**: `self-serve discord bot`, `no lock-in discord bot`

#### Social Proof / CTA Section (`#cta`)
- **Trust keywords**: `discord bot security`, `no data stored`, `privacy-first ai`
- **Action keywords**: `set up discord ai bot`, `deploy discord bot`, `discord bot setup`

---

## 2. Blog Content Strategy

### Content Pillars

The blog lives at `/blog`. Content is organized around four pillars:

| Pillar | URL Prefix | Theme | Audience |
|--------|-----------|-------|----------|
| How-to guides | `/blog/how-to/` | Step-by-step tutorials for common tasks | Developers setting up bots |
| Use cases | `/blog/use-cases/` | Real workflows Daimon enables | Tech teams, founders, solo devs |
| Comparisons | `/blog/vs/` | Daimon vs alternatives | Decision-stage buyers |
| Concepts | `/blog/concepts/` | Educational content on AI + Discord automation | Top-of-funnel / SEO |

---

### Pillar 1: How-To Guides

Complete list of planned how-to posts. Each post has a target keyword, slug, outline, and target length.

#### HT-01: How to Set Up an AI Discord Bot with Your Own API Key

- **Slug**: `/blog/how-to/set-up-ai-discord-bot-own-api-key`
- **Target keyword**: `how to set up ai discord bot` (1,200 searches/mo)
- **Secondary keywords**: `discord bot anthropic api`, `claude discord bot setup`, `byok discord ai`
- **Intent**: Informational → converts to signup
- **Target length**: 1,800 words
- **Outline**:
  1. What you need before you start (Discord bot token, Anthropic API key, Daimon account)
  2. Creating your Discord application and bot in the Developer Portal (with screenshots described)
  3. Getting your Anthropic API key from console.anthropic.com
  4. Connecting everything in Daimon (paste token + guild ID + API key)
  5. Testing your bot with your first command
  6. Next steps: connecting GitHub, Linear, Toggl
- **CTA**: "Start free — no credit card required"
- **Internal links**: Quick Start guide in docs, integrations page, pricing page

#### HT-02: How to Connect GitHub to Discord with AI Summaries

- **Slug**: `/blog/how-to/connect-github-discord-ai-summaries`
- **Target keyword**: `github discord integration` (1,600 searches/mo)
- **Secondary keywords**: `discord github notifications`, `discord github bot`, `github pr discord`
- **Target length**: 1,400 words
- **Outline**:
  1. Why you want GitHub in Discord (no more tab switching, AI-summarized PRs)
  2. Prerequisites: Daimon account + bot connected
  3. Step-by-step: OAuth connecting GitHub in the Daimon integrations page
  4. What you can ask your bot after connecting (list 8 example commands)
  5. Pro tip: pin the bot to your team's engineering channel
- **CTA**: "Connect GitHub in 60 seconds"
- **Internal links**: GitHub integration docs, integrations page

#### HT-03: How to Track Time in Discord Using Toggl

- **Slug**: `/blog/how-to/track-time-discord-toggl`
- **Target keyword**: `toggl discord` (210 searches/mo)
- **Secondary keywords**: `discord time tracking`, `toggl integration discord bot`, `time tracking bot discord`
- **Target length**: 1,200 words
- **Outline**:
  1. The problem: time tracking is a context-switch killer
  2. How Daimon bridges Discord and Toggl
  3. Step-by-step: connecting Toggl API key in Daimon
  4. Natural language commands: start/stop timers, generate reports
  5. 6 example Toggl commands you can try right now
- **CTA**: "Try Daimon free"

#### HT-04: How to Get Google Analytics Reports in Discord

- **Slug**: `/blog/how-to/google-analytics-reports-discord`
- **Target keyword**: `google analytics discord bot` (160 searches/mo)
- **Secondary keywords**: `discord analytics reporting`, `GA4 discord`, `analytics bot discord`
- **Target length**: 1,200 words
- **Outline**:
  1. Why Discord is the right place for your analytics briefings
  2. Connecting Google Analytics to Daimon (OAuth flow walkthrough)
  3. Asking for reports in plain English ("what was our traffic last week?")
  4. Setting up recurring reports (Pro tier feature context)
  5. 5 analytics questions to ask your bot today
- **CTA**: "Set up analytics in Discord"

#### HT-05: How to Manage Linear Issues from Discord

- **Slug**: `/blog/how-to/manage-linear-discord`
- **Target keyword**: `discord linear integration` (480 searches/mo)
- **Secondary keywords**: `linear bot discord`, `linear discord notifications`, `issue tracking discord`
- **Target length**: 1,300 words
- **Outline**:
  1. The context-switch tax: every Linear → Slack/Discord switch costs you minutes
  2. Connecting Linear to Daimon (OAuth walkthrough)
  3. Searching, creating, and updating issues from Discord
  4. 8 example commands with expected responses shown
  5. Team workflow: how engineering teams use Daimon + Linear daily
- **CTA**: "Connect Linear to your Discord"

#### HT-06: How to Deploy to Fly.io from Discord

- **Slug**: `/blog/how-to/deploy-fly-discord`
- **Target keyword**: `fly.io discord bot` (low volume, high intent)
- **Secondary keywords**: `discord deployment bot`, `discord devops automation`
- **Target length**: 1,000 words
- **Outline**:
  1. Use case: trigger deploys without leaving your team Discord
  2. How Daimon's Fly.io tools work (read status, restart apps, view logs)
  3. Prerequisites and connecting Fly API token
  4. 5 deployment commands with example outputs
- **CTA**: "Add deployment commands to your Discord"

#### HT-07: How to Give Your Discord Bot a Custom Persona

- **Slug**: `/blog/how-to/discord-bot-custom-persona`
- **Target keyword**: `discord bot custom personality` (590 searches/mo)
- **Secondary keywords**: `custom ai discord bot`, `discord bot personality`, `anthropic discord bot`
- **Target length**: 1,100 words
- **Outline**:
  1. What is a system prompt in the context of a Discord bot
  2. Where to set your bot's persona in Daimon settings
  3. Examples: professional assistant vs. casual team bot vs. strict operations bot
  4. Tips for writing effective system prompts
  5. What not to do (avoid contradicting the bot's tool behavior)
- **CTA**: "Customize your bot's persona"

#### HT-08: How to Secure Your Discord AI Bot (BYOK Best Practices)

- **Slug**: `/blog/how-to/secure-discord-ai-bot-byok`
- **Target keyword**: `discord bot api key security` (320 searches/mo)
- **Secondary keywords**: `secure discord bot`, `byok security`, `anthropic api key discord`
- **Target length**: 1,500 words
- **Outline**:
  1. Why BYOK is more secure than shared-key SaaS AI
  2. How Daimon stores your API keys (Supabase Vault, AES-256 encryption)
  3. Setting up API key rotation
  4. Access controls: who in your Discord can trigger the bot
  5. Audit logs and monitoring your bot's usage
  6. What Daimon can and cannot see
- **CTA**: "Read our privacy policy"

---

### Pillar 2: Use Cases

Real-world workflows. Less tutorial, more narrative. Each is 800–1,200 words.

#### UC-01: The Indie Hacker's Discord Bot Stack

- **Slug**: `/blog/use-cases/indie-hacker-discord-bot-stack`
- **Target keyword**: `ai tools for indie hackers` (720 searches/mo)
- **Secondary keywords**: `indie hacker productivity`, `discord for solo founders`
- **Narrative**: A solo founder who runs their entire business from one Discord server — Linear for issues, Toggl for time, GitHub for code, Google Analytics for metrics. Daimon is the thread connecting them all.
- **Tools highlighted**: All integrations
- **CTA**: "Build your own command center"

#### UC-02: How a Remote Engineering Team Uses Daimon for Daily Standups

- **Slug**: `/blog/use-cases/remote-engineering-team-daily-standups`
- **Target keyword**: `discord standup bot` (890 searches/mo)
- **Secondary keywords**: `async standup discord`, `engineering team discord bot`
- **Narrative**: A team of 5 engineers uses a shared Discord server. Each morning, they ask the bot: "What PRs were merged yesterday?" + "What issues moved to In Progress?" The bot aggregates from GitHub and Linear in seconds.
- **Tools highlighted**: GitHub, Linear
- **CTA**: "Set up a standup bot in 10 minutes"

#### UC-03: The Freelancer Time Audit: Track Every Billable Minute in Discord

- **Slug**: `/blog/use-cases/freelancer-time-audit-discord`
- **Target keyword**: `freelancer time tracking discord` (190 searches/mo)
- **Secondary keywords**: `billable hours discord`, `toggl freelancer automation`
- **Narrative**: A freelance developer tracks all client work via Toggl. With Daimon, they start/stop timers with a single message in their private Discord server without opening a new tab.
- **Tools highlighted**: Toggl
- **CTA**: "Connect Toggl to Discord"

#### UC-04: Running a Small Startup's Ops from One Discord Channel

- **Slug**: `/blog/use-cases/startup-ops-discord-channel`
- **Target keyword**: `discord for startups` (1,100 searches/mo)
- **Secondary keywords**: `startup discord bot`, `operations discord automation`
- **Narrative**: A 3-person SaaS startup consolidated all their tools into one Discord server. Daimon's bot handles status checks, time logging, GitHub alerts, and analytics queries so they stay in flow.
- **Tools highlighted**: GitHub, Linear, Google Analytics, Toggl, Fly.io
- **CTA**: "Try Daimon with your startup"

#### UC-05: How to Use Daimon as Your Daily Driver AI Assistant

- **Slug**: `/blog/use-cases/daily-driver-ai-assistant-discord`
- **Target keyword**: `ai personal assistant discord` (670 searches/mo)
- **Secondary keywords**: `discord ai daily driver`, `claude ai personal assistant`
- **Narrative**: Power user story. Uses Discord as their operating system — Daimon is always in a pinned channel. Morning routine: check analytics, review open PRs, check what moved in Linear, log time.
- **CTA**: "Make Discord your HQ"

---

### Pillar 3: Comparison Pages

High-intent pages targeting decision-stage searchers evaluating alternatives.

#### VS-01: Daimon vs. Zapier for Discord Automation

- **Slug**: `/blog/vs/daimon-vs-zapier-discord`
- **Target keyword**: `zapier discord alternative` (880 searches/mo)
- **Secondary keywords**: `discord automation zapier`, `best discord automation`
- **Angle**: Zapier requires building Zaps per workflow; Daimon is conversational (no workflow builder). Zapier costs scale with usage; Daimon is flat-rate BYOK. Zapier doesn't understand context; Daimon has Claude-powered reasoning.
- **Comparison table columns**: Feature, Daimon, Zapier
- **Comparison table rows**:
  1. Setup time — Daimon: 5 minutes | Zapier: Hours to build first Zap
  2. Interaction model — Daimon: Natural language | Zapier: Rule-based triggers
  3. Discord integration — Daimon: Native | Zapier: Via webhook
  4. AI reasoning — Daimon: Claude 3 | Zapier: None
  5. Cost model — Daimon: Flat monthly | Zapier: Per task/Zap
  6. BYOK — Daimon: Yes (your Anthropic key) | Zapier: No
  7. Data privacy — Daimon: Your keys stay yours | Zapier: Data passes through Zapier servers
  8. GitHub integration — Daimon: Yes (OAuth) | Zapier: Yes (but manual setup)
  9. Linear integration — Daimon: Yes (OAuth) | Zapier: Yes (but manual setup)
  10. Toggl integration — Daimon: Yes (API key) | Zapier: Yes (but no AI layer)
  11. Conversational queries — Daimon: Yes | Zapier: No
  12. Multi-server support — Daimon: Yes (Starter/Pro) | Zapier: N/A
- **Conclusion**: Zapier is great for simple if-then automations. Daimon is for teams that want to *talk* to their tools.
- **CTA**: "Start with Daimon — free tier, no credit card"
- **Target length**: 1,600 words

#### VS-02: Daimon vs. MEE6 / Discord Bots

- **Slug**: `/blog/vs/daimon-vs-mee6-discord-bot`
- **Target keyword**: `mee6 alternative discord` (2,200 searches/mo)
- **Secondary keywords**: `best discord bot 2026`, `discord productivity bot`
- **Angle**: MEE6/Carl-bot are community management bots (moderation, leveling, roles). Daimon is a productivity/operations bot (tools, integrations, AI reasoning). They solve different problems.
- **Comparison table columns**: Feature, Daimon, MEE6
- **Comparison table rows**:
  1. Primary purpose — Daimon: Productivity + tools | MEE6: Community management
  2. AI / LLM — Daimon: Claude 3 (your key) | MEE6: Limited/none
  3. Tool integrations — Daimon: 50+ (GitHub, Linear, Toggl, etc.) | MEE6: None
  4. Moderation — Daimon: None | MEE6: Yes
  5. Leveling / XP — Daimon: No | MEE6: Yes
  6. Role management — Daimon: No | MEE6: Yes
  7. Natural language queries — Daimon: Yes | MEE6: No
  8. Time tracking — Daimon: Yes (Toggl) | MEE6: No
  9. GitHub / Linear — Daimon: Yes | MEE6: No
  10. BYOK privacy — Daimon: Yes | MEE6: No
  11. Price — Daimon: Free–$29/mo | MEE6: Free–$11.95/mo
  12. Self-hostable — Daimon: No (BYOK SaaS) | MEE6: No
- **Conclusion**: Use MEE6 for community features. Use Daimon if you want your Discord to become a command center for your work stack.
- **CTA**: "Add Daimon to your server"
- **Target length**: 1,400 words

#### VS-03: Daimon vs. Building Your Own Discord Bot

- **Slug**: `/blog/vs/daimon-vs-build-your-own-discord-bot`
- **Target keyword**: `build discord ai bot yourself` (590 searches/mo)
- **Secondary keywords**: `discord bot development`, `custom discord bot vs saas`
- **Angle**: Building your own bot is fun but expensive in time. Maintenance, hosting, token management, error handling — it adds up. Daimon gives you Decision Orchestrator (already built) for $9/mo.
- **Comparison table columns**: Factor, DIY Bot, Daimon
- **Comparison table rows**:
  1. Time to first working bot — DIY: 8–40 hours | Daimon: 5 minutes
  2. Maintenance burden — DIY: High (your responsibility) | Daimon: Zero (we handle it)
  3. Hosting cost — DIY: $5–$20/mo VPS + your time | Daimon: Included in subscription
  4. Tool integrations — DIY: Build each one from scratch | Daimon: 50+ pre-built
  5. AI/LLM — DIY: Implement prompt engineering yourself | Daimon: Pre-tuned with Agent SDK
  6. Supabase/state — DIY: Design your own | Daimon: Managed schema
  7. Uptime monitoring — DIY: Set up your own | Daimon: Built-in
  8. BYOK — DIY: Your own by definition | Daimon: Yes, same privacy
  9. Multi-server — DIY: Requires multi-tenant architecture | Daimon: Built-in (Starter+)
  10. New tool integrations — DIY: Weeks per tool | Daimon: We ship them
- **Conclusion**: Build your own if you want full control and have the engineering capacity. Use Daimon if you want the tools without the build tax.
- **CTA**: "Try Daimon free — bring your own API key"
- **Target length**: 1,500 words

#### VS-04: Daimon vs. Slack AI / Slack Apps for Teams on a Budget

- **Slug**: `/blog/vs/daimon-vs-slack-ai-discord-teams`
- **Target keyword**: `slack alternative for small teams` (1,800 searches/mo)
- **Secondary keywords**: `discord vs slack ai`, `slack ai bot alternative`
- **Angle**: Slack AI is expensive and requires everyone to be on Slack. Discord is free for voice+chat, and Daimon gives you the AI productivity layer on top.
- **Comparison table columns**: Factor, Daimon + Discord, Slack + Slack AI
- **Comparison table rows**:
  1. Base platform cost — Daimon+Discord: Free | Slack: $7.25–$12.50/user/mo
  2. AI layer cost — Daimon: $0–$29/mo flat | Slack AI: $10/user/mo add-on
  3. Voice/video — Discord: Yes (built-in, free) | Slack: $0 (limited) / Huddles
  4. GitHub integration — Daimon: Yes, conversational | Slack: App (less AI)
  5. Linear integration — Daimon: Yes, conversational | Slack: App (less AI)
  6. BYOK — Daimon: Yes | Slack AI: No
  7. Data privacy — Daimon: Your keys, Vault-encrypted | Slack: Slack hosts everything
  8. Multi-server/workspace — Daimon: Yes (Starter+) | Slack: Paid per workspace
  9. AI model — Daimon: Claude 3 (your key) | Slack AI: OpenAI GPT (their key)
  10. Setup time for small team — Daimon: 15 minutes | Slack: Hours + per-user onboarding
- **Conclusion**: For teams already on Discord, Daimon is dramatically cheaper than Slack + Slack AI and equally powerful for productivity.
- **CTA**: "See Daimon pricing"
- **Target length**: 1,600 words

#### VS-05: Daimon vs. ChatGPT / Claude for Team Use

- **Slug**: `/blog/vs/daimon-vs-chatgpt-teams`
- **Target keyword**: `chatgpt discord integration` (2,900 searches/mo)
- **Secondary keywords**: `claude discord`, `ai bot for discord team`
- **Angle**: ChatGPT/Claude.ai are general-purpose. Daimon is Claude *connected to your actual tools* (GitHub, Linear, Toggl) inside Discord where your team already works.
- **Comparison table columns**: Factor, Daimon, ChatGPT/Claude.ai
- **Comparison table rows**:
  1. Where it lives — Daimon: Discord (where your team works) | ChatGPT: Separate tab
  2. Connected to your tools — Daimon: Yes (GitHub, Linear, Toggl, etc.) | ChatGPT: No (without plugins)
  3. Team collaboration — Daimon: Shared Discord channel | ChatGPT: Individual accounts
  4. Context about your work — Daimon: Yes (reads your GitHub, Linear, etc.) | ChatGPT: No
  5. BYOK — Daimon: Yes (Anthropic key) | ChatGPT: N/A
  6. Cost for a team of 5 — Daimon: $9–$29/mo total | ChatGPT Team: $25/user/mo
  7. Time tracking — Daimon: Yes (Toggl) | ChatGPT: No
  8. Deployment triggers — Daimon: Yes (Fly.io) | ChatGPT: No
  9. Persistent Discord presence — Daimon: Yes | ChatGPT: No
  10. Custom system prompt — Daimon: Yes | ChatGPT: Yes (Custom GPTs only)
- **Conclusion**: ChatGPT is a thinking partner. Daimon is your AI doing the work — right in your Discord server.
- **CTA**: "Connect your tools to Discord"
- **Target length**: 1,400 words

---

### Pillar 4: Concepts / Educational

Top-of-funnel educational content that builds brand authority and organic traffic.

#### CN-01: What Is a Discord AI Bot? (Complete Guide for 2026)

- **Slug**: `/blog/concepts/what-is-discord-ai-bot`
- **Target keyword**: `what is a discord ai bot` (1,100 searches/mo)
- **Secondary keywords**: `discord bot explained`, `how discord bots work`
- **Outline**:
  1. What is a Discord bot (technical explanation in plain English)
  2. What makes a bot "AI-powered" (LLM backend, tool use, context)
  3. Use cases for AI Discord bots (community, productivity, operations)
  4. How to choose an AI Discord bot (BYOK vs shared key, tool coverage, pricing)
  5. Getting started in 5 minutes (Daimon CTA)
- **Target length**: 2,000 words

#### CN-02: Bring Your Own Key (BYOK) AI: What It Means and Why It Matters

- **Slug**: `/blog/concepts/byok-ai-bring-your-own-key`
- **Target keyword**: `bring your own api key ai` (390 searches/mo)
- **Secondary keywords**: `byok ai security`, `ai data privacy api key`
- **Outline**:
  1. The problem with shared-key AI SaaS (cost, privacy, rate limits)
  2. What BYOK means in practice (you pay Anthropic directly, Daimon just routes)
  3. Security benefits (your data, your key, vault encryption)
  4. Cost transparency (you see exactly what you spend on AI)
  5. Who BYOK is right for (developers, small teams, privacy-conscious users)
- **Target length**: 1,200 words

#### CN-03: Discord as a Command Center: The New Developer Workflow

- **Slug**: `/blog/concepts/discord-command-center-developer-workflow`
- **Target keyword**: `discord developer workflow` (720 searches/mo)
- **Secondary keywords**: `discord productivity tools`, `developer discord setup`
- **Outline**:
  1. Why Discord beats Slack for small tech teams (free voice, no per-seat cost)
  2. The context-switching tax and how to fix it
  3. What belongs in a developer Discord server
  4. Tools you can bring into Discord with the right bot
  5. Building your personal command center (narrative walkthrough with Daimon)
- **Target length**: 1,500 words

#### CN-04: The Decision Orchestrator: How Daimon's AI Bot Actually Works

- **Slug**: `/blog/concepts/decision-orchestrator-how-daimon-works`
- **Target keyword**: `how discord ai bots work` (480 searches/mo)
- **Secondary keywords**: `claude agent sdk discord`, `decision orchestrator ai`
- **Outline**:
  1. The architecture: Discord message → Claude Agent SDK → tools → Discord reply
  2. How tool-use works in Claude (brief non-technical explanation)
  3. What tools are available (link to tool reference)
  4. How BYOK fits into the architecture
  5. Multi-tenant model: your bot, your data, shared infrastructure
  6. FCIS architecture (brief, link to open-source repo if applicable)
- **Target length**: 1,400 words

#### CN-05: 50+ Things You Can Ask a Discord AI Bot

- **Slug**: `/blog/concepts/things-you-can-ask-discord-ai-bot`
- **Target keyword**: `discord bot commands ai` (1,600 searches/mo)
- **Secondary keywords**: `discord bot what can it do`, `ai discord bot examples`
- **Format**: Listicle. 50+ specific commands with expected output described.
- **Categories**: GitHub (10), Linear (8), Toggl (10), Analytics (6), Fly.io (5), Dub (3), Discord utility (8), General productivity (10+)
- **Target length**: 2,500 words (long-form listicle for SEO)

---

## 3. Content Calendar (First 6 Months Post-Launch)

### Month 1 (Launch)

| Week | Content | Type | Slug |
|------|---------|------|------|
| 1 | What Is a Discord AI Bot? | Concept | `/blog/concepts/what-is-discord-ai-bot` |
| 1 | Daimon vs. MEE6 | Comparison | `/blog/vs/daimon-vs-mee6-discord-bot` |
| 2 | How to Set Up an AI Discord Bot | How-to | `/blog/how-to/set-up-ai-discord-bot-own-api-key` |
| 2 | BYOK AI: What It Means | Concept | `/blog/concepts/byok-ai-bring-your-own-key` |
| 3 | Daimon vs. Zapier | Comparison | `/blog/vs/daimon-vs-zapier-discord` |
| 3 | How to Connect GitHub to Discord | How-to | `/blog/how-to/connect-github-discord-ai-summaries` |
| 4 | 50+ Things You Can Ask a Discord AI Bot | Concept | `/blog/concepts/things-you-can-ask-discord-ai-bot` |
| 4 | How to Track Time in Discord with Toggl | How-to | `/blog/how-to/track-time-discord-toggl` |

### Month 2

| Week | Content | Type | Slug |
|------|---------|------|------|
| 5 | Daimon vs. Building Your Own Bot | Comparison | `/blog/vs/daimon-vs-build-your-own-discord-bot` |
| 5 | The Indie Hacker's Discord Stack | Use Case | `/blog/use-cases/indie-hacker-discord-bot-stack` |
| 6 | How to Get Google Analytics in Discord | How-to | `/blog/how-to/google-analytics-reports-discord` |
| 6 | Discord as a Developer Command Center | Concept | `/blog/concepts/discord-command-center-developer-workflow` |
| 7 | Daimon vs. ChatGPT for Teams | Comparison | `/blog/vs/daimon-vs-chatgpt-teams` |
| 7 | Remote Team Daily Standups with Daimon | Use Case | `/blog/use-cases/remote-engineering-team-daily-standups` |
| 8 | How to Manage Linear from Discord | How-to | `/blog/how-to/manage-linear-discord` |
| 8 | How the Decision Orchestrator Works | Concept | `/blog/concepts/decision-orchestrator-how-daimon-works` |

### Month 3

| Week | Content | Type | Slug |
|------|---------|------|------|
| 9 | Daimon vs. Slack AI | Comparison | `/blog/vs/daimon-vs-slack-ai-discord-teams` |
| 9 | How to Deploy to Fly from Discord | How-to | `/blog/how-to/deploy-fly-discord` |
| 10 | Freelancer Time Audit in Discord | Use Case | `/blog/use-cases/freelancer-time-audit-discord` |
| 10 | How to Secure Your Discord AI Bot | How-to | `/blog/how-to/secure-discord-ai-bot-byok` |
| 11 | Running Startup Ops from One Discord Channel | Use Case | `/blog/use-cases/startup-ops-discord-channel` |
| 11 | How to Give Your Bot a Custom Persona | How-to | `/blog/how-to/discord-bot-custom-persona` |
| 12 | Using Daimon as Your Daily Driver AI | Use Case | `/blog/use-cases/daily-driver-ai-assistant-discord` |
| 12 | Month 1–3 roundup / product update post | Product | `/blog/updates/daimon-launch-recap` |

### Months 4–6

Continue publishing 2 posts/week. Rotate between:
- New how-to guides (as tool catalog expands)
- Use case spotlights (reach out to power users for permission to write about them)
- New comparison pages targeting any emerging competitors
- Concept posts that answer "People Also Ask" questions found in Google Search Console
- Product update posts (changelogs, new integrations)

---

## 4. On-Page SEO Requirements for Blog Posts

Every blog post MUST include the following:

### Metadata

| Field | Requirement |
|-------|------------|
| `<title>` | Target keyword in first 60 characters |
| Meta description | 140–160 chars, includes target keyword, includes a benefit or number |
| OG title | Same as `<title>` |
| OG description | Same as meta description |
| OG image | 1200×630px, branded with post title, Daimon logo, dark navy background |
| Canonical URL | Self-canonical unless syndicated |
| `robots` | `index, follow` |
| `article:published_time` | ISO 8601 date |
| `article:modified_time` | ISO 8601 date (update this when post is revised) |
| `article:author` | Daimon Team |
| `article:section` | How-to | Use Cases | Comparisons | Concepts |
| `article:tag` | Comma-separated tags (3–5 per post) |

### Schema.org

Every blog post gets `Article` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{post title}}",
  "description": "{{meta description}}",
  "image": "{{og image url}}",
  "author": {
    "@type": "Organization",
    "name": "Daimon",
    "url": "https://daimon.ai"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Daimon",
    "logo": {
      "@type": "ImageObject",
      "url": "https://daimon.ai/logo.png"
    }
  },
  "datePublished": "{{ISO 8601}}",
  "dateModified": "{{ISO 8601}}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://daimon.ai/blog/{{slug}}"
  }
}
```

Comparison pages additionally get `FAQPage` schema if they include a Q&A section.

### Content Requirements

| Requirement | Spec |
|-------------|------|
| Word count | How-to: 1,000–1,800 | Use case: 800–1,200 | Comparison: 1,200–1,800 | Concept: 1,000–2,500 |
| H1 | Contains primary target keyword |
| First paragraph | Contains target keyword in first 100 words |
| H2 subheadings | 2–4 H2s per post, each targeting a secondary keyword or question variation |
| Internal links | Minimum 2 internal links per post (to docs, other blog posts, or pricing) |
| External links | Link to at least 1 authoritative external source (Discord Docs, Anthropic, GitHub, etc.) |
| CTA | At least 1 CTA block per post. Format: boxed section with bold CTA line + button text + link |
| Images | At least 1 image (diagram, screenshot, or conceptual) per post. Alt text required. |
| Table of contents | Any post over 1,200 words gets a linked TOC at the top |
| Reading time | Display estimated reading time in the post header |

---

## 5. Comparison Page SEO Requirements

Comparison pages (`/blog/vs/`) get additional structured treatment:

### Additional Metadata

| Field | Value |
|-------|-------|
| Meta description | Include both product names + differentiator ("Daimon vs. Zapier: natural language AI vs. rule-based automations") |
| Schema | `FAQPage` schema for the "Frequently Asked Questions" section at the bottom |

### Required Sections for Every Comparison Page

1. **TL;DR** — 2-sentence summary of who should use which product
2. **Side-by-side table** — All rows listed in VS-01 through VS-05 above (each post has its own specific table)
3. **Daimon strengths** — 3–5 bullet points
4. **[Competitor] strengths** — 3–5 bullet points (be fair — never trash competitors)
5. **Who should use Daimon** — specific user profiles
6. **Who should use [Competitor]** — specific user profiles (be generous and accurate)
7. **FAQ section** — 4–6 questions in FAQ format (enables FAQPage schema)
8. **CTA** — "Try Daimon free" button + link to `/pricing`

### FAQ Questions for Comparison Pages (Examples)

| Post | FAQ Questions |
|------|--------------|
| VS-01 (Daimon vs Zapier) | "Can Daimon replace Zapier?", "Does Daimon work with Zapier?", "Is Zapier better than Daimon for Discord?", "How much does Daimon cost vs Zapier?" |
| VS-02 (Daimon vs MEE6) | "Can Daimon do moderation?", "Is MEE6 better than Daimon?", "Can I use both MEE6 and Daimon?", "What's the difference between MEE6 and Daimon?" |
| VS-03 (Daimon vs DIY) | "Is building your own Discord bot worth it?", "How long does it take to build a Discord AI bot?", "Can Daimon be self-hosted?", "How much does it cost to build vs buy a Discord bot?" |
| VS-04 (Daimon vs Slack) | "Should I use Discord or Slack for my team?", "Is Slack AI better than Daimon?", "How much cheaper is Discord + Daimon vs Slack AI?", "Can Daimon work with Slack?" |
| VS-05 (Daimon vs ChatGPT) | "Is Daimon better than ChatGPT?", "Can ChatGPT be added to Discord?", "What's the difference between Daimon and ChatGPT for teams?", "Does Daimon use ChatGPT or Claude?" |

---

## 6. Blog Page Technical Specification

### Route

`/blog` — List page
`/blog/[slug]` — Individual post (Note: posts at `/blog/how-to/[slug]`, `/blog/vs/[slug]`, etc. — category prefix is part of the slug, not a separate segment)

### Blog Index Page (`/blog`)

- **Title**: `Blog | Daimon`
- **Meta description**: "Guides, tutorials, and comparisons for Discord AI automation, BYOK productivity, and developer workflow tooling."
- **Layout**: Grid of post cards (3 columns desktop, 2 tablet, 1 mobile)
- **Post card contents**: OG image, category badge (How-to / Use Case / Comparison / Concepts), title, excerpt (first 120 chars of body), reading time, date
- **Filters**: Category filter tabs at top (All | How-to | Use Cases | Comparisons | Concepts) — client-side filter, no page reload
- **Pagination**: 12 posts per page. "Load more" button (client-side, no URL change)
- **Sidebar (desktop only)**: Featured post + popular posts list (5 posts, manually curated)
- **Schema**: `Blog` schema on index page:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Daimon Blog",
    "url": "https://daimon.ai/blog",
    "description": "Guides, tutorials, and comparisons for Discord AI automation"
  }
  ```

### Blog Post Page (`/blog/[slug]`)

- **Layout**: Centered single-column (max-width 720px), with TOC sidebar on desktop (sticky, shows current section)
- **Header**: Post title (H1), category badge, author (Daimon Team), date, reading time
- **TOC**: Generated from H2/H3 headings. Sticky sidebar (desktop only). Links scroll to anchor.
- **Footer**: Tags, "Was this helpful?" thumbs up/down (no auth required — stored in Supabase anonymous), share buttons (copy link, Twitter/X)
- **Next/prev post**: Links to chronologically adjacent posts in same category
- **Related posts**: 3 posts in same category, manually or automatically selected
- **CTA block**: Branded box at bottom of every post. Background: `#0C1F40` (Navy). Text: "Ready to try Daimon? Add your Discord bot token and connect your tools in 5 minutes." Button: "Start free" → `/signup`

### Blog Content Format

- Blog posts are written in MDX (Markdown + JSX)
- Stored at `app/blog/content/[slug].mdx`
- Frontmatter fields:
  ```yaml
  ---
  title: "How to Set Up an AI Discord Bot with Your Own API Key"
  slug: "how-to/set-up-ai-discord-bot-own-api-key"
  category: "how-to"  # how-to | use-cases | vs | concepts
  tags: ["discord bot", "api key", "anthropic", "byok"]
  excerpt: "A step-by-step guide to connecting your Discord bot to Claude AI using your own Anthropic API key — no shared key, full privacy."
  publishedAt: "2026-04-01"
  updatedAt: "2026-04-01"
  readingTime: 7  # minutes (auto-calculated fallback: 200 words/min)
  ogImage: "/og/blog/set-up-ai-discord-bot-own-api-key.png"
  featured: false
  ---
  ```
- Custom MDX components available in posts:
  - `<CTABlock />` — Branded CTA box (auto-inserted at end if not in body)
  - `<ComparisonTable />` — Styled comparison table
  - `<InfoBox />` — Highlighted callout box
  - `<CodeBlock />` — Syntax-highlighted code (via Shiki)
  - `<Screenshot alt="..." src="..." />` — Image with alt text, caption

---

## 7. Sitemap and Crawl Structure

### XML Sitemap (`/sitemap.xml`)

The sitemap is generated at build time by Next.js. It includes:

| URL | Priority | Change Frequency |
|-----|----------|-----------------|
| `/` | 1.0 | weekly |
| `/pricing` | 0.9 | monthly |
| `/docs` | 0.8 | weekly |
| `/docs/*` | 0.7 | weekly |
| `/blog` | 0.8 | daily |
| `/blog/vs/*` (all comparison pages) | 0.9 | monthly |
| `/blog/how-to/*` | 0.8 | monthly |
| `/blog/use-cases/*` | 0.7 | monthly |
| `/blog/concepts/*` | 0.7 | monthly |

**Excluded from sitemap** (via `robots` meta tag `noindex`):
- `/login`, `/signup`, `/reset-password`
- `/dashboard/*`
- `/admin/*`
- `/settings/*`
- `/integrations/*`
- `/billing/*`

### `robots.txt`

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /settings/
Disallow: /integrations/
Disallow: /billing/
Disallow: /api/

Sitemap: https://daimon.ai/sitemap.xml
```

---

## 8. Social and Distribution Strategy

### Twitter/X

- **Handle**: `@daimon_ai`
- **Post every new blog post** on publish day. Format: "New post: [title] → [URL]" + 2-sentence hook
- **Thread format** for comparison posts: 5-tweet thread summarizing the comparison table
- **Regular posts**: "5 things you can ask your Discord AI bot today" type content (2x/week)
- **Bot command examples**: Screenshot of real bot interaction (no personal data) — 1x/week

### Discord Community

- **Daimon's own Discord server** (link in footer and docs)
- **Channels**:
  - `#announcements` — Product updates
  - `#help` — Community support
  - `#showcase` — Users share what they built with Daimon
  - `#feature-requests` — User suggestions
  - `#bot-commands` — Inspirational list of commands users can try
- **Cross-post** all new blog posts in `#announcements`
- **Pin** comparison and how-to posts in relevant channels

### Hacker News / Reddit

- **How-to posts** → post to r/Discord, r/discordapp (when genuinely useful, not spammy)
- **Comparison posts** → post to r/SaaS, r/nocode (framed as analysis, not ads)
- **Launch** → HN "Show HN" post on launch day with open discussion
- **Indie Hackers** → Cross-post use case and BYOK concept posts

### ProductHunt

- **Launch on ProductHunt** (coordinate with blog launch post)
- **Embed ProductHunt badge** on landing page after launch
- **Follow-up post** 90 days after launch with "What we've learned" narrative

---

## 9. Internal Linking Rules

To maximize SEO link equity across the site, follow these internal linking rules:

| Source Page | Links To | Anchor Text Pattern |
|-------------|---------|---------------------|
| Landing page (`/`) | `/pricing` | "See pricing", "Start free" |
| Landing page (`/`) | `/docs` | "Read the docs", "Quick start guide" |
| Landing page (`/`) | `/blog` | "Blog", "Read more" |
| Comparison pages | `/pricing` | "Compare plans", "See Daimon pricing" |
| Comparison pages | Other comparison pages | "Also compare: Daimon vs X" |
| How-to guides | Docs pages | "Full documentation" |
| How-to guides | `/pricing` | "Start free" CTA |
| Blog index | All post categories | Category filter labels |
| Docs pages | `/signup` | "Get started" |
| Docs pages | Relevant blog posts | Contextual links |
| Pricing page | `/docs` | "Read the docs" |
| Pricing page | Blog comparison posts | "How does Daimon compare?" |

---

## 10. Keyword Tracking

Track the following keywords in Google Search Console and/or a rank tracker (Ahrefs, Semrush):

### Tier 1 (track weekly)
- `discord ai bot`
- `ai bot for discord`
- `discord automation bot`
- `discord productivity bot`
- `zapier discord alternative`
- `mee6 alternative`
- `discord github integration`

### Tier 2 (track monthly)
- `discord linear integration`
- `discord toggl`
- `discord google analytics bot`
- `byok ai`
- `bring your own api key ai`
- `claude ai discord`
- `discord ai assistant`
- `chatgpt discord integration`

### Tier 3 (track quarterly)
- All long-tail keywords from blog post target keywords
- Brand terms: `daimon ai`, `decision orchestrator discord`

---

## 11. Success Metrics

| Metric | 3-Month Target | 6-Month Target |
|--------|---------------|---------------|
| Organic sessions/month | 500 | 2,000 |
| Blog posts published | 16 | 32 |
| Keywords ranking (any position) | 50 | 150 |
| Keywords in top 10 | 5 | 20 |
| Blog → signup conversion rate | 2% | 3% |
| Comparison page avg. session duration | 3:00 min | 3:30 min |
| Backlinks (referring domains) | 10 | 30 |

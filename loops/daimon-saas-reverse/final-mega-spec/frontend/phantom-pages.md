# Phantom Pages — Complete Specification

> Pages linked from the footer that require full specs.
> Routes: `/changelog`, `/about`, `/blog`, `/legal/cookies`
> Last updated: 2026-03-13

---

## Table of Contents

1. [Changelog (`/changelog`)](#changelog)
2. [About (`/about`)](#about)
3. [Blog Index (`/blog`)](#blog-index)
4. [Blog Post (`/blog/[slug]`)](#blog-post)
5. [Cookie Policy (`/legal/cookies`)](#cookie-policy)

---

## Changelog

### Route: `/changelog`

**File**: `app/(public)/changelog/page.tsx`
**Layout**: Public (no auth required), uses `PublicLayout` (top nav + footer)
**Meta title**: `Changelog — Daimon`
**Meta description**: `What's new in Daimon — feature releases, improvements, and bug fixes.`

### Page Structure

```
<PublicLayout>
  <main> (max-w-3xl, mx-auto, px-6, py-20)
    Page header
    Release list (reverse chronological)
  </main>
</PublicLayout>
```

### Page Header

| Property | Value |
|----------|-------|
| Tag | `<h1>` |
| Text | "Changelog" |
| Font | Archivo, 40px, weight 700, navy (`#0C1F40`) |
| Subheading | "What's new in Daimon" |
| Subheading font | Inter, 18px, weight 400, `#4A5568` |
| Margin bottom | 64px |
| Padding top | 80px (offset sticky nav) |

### Release Entry Structure

Each release is a card-like section:

```
<article> (border-left: 3px solid #B4E7DD, padding-left: 24px, margin-bottom: 56px)
  <time> + badge
  <h2> (release title)
  <div> (category tags)
  <ul> (changes list)
```

| Property | Value |
|----------|-------|
| Left border | `3px solid #B4E7DD` (aqua) |
| Left padding | 24px |
| Margin between entries | 56px |
| Background | none (white page bg) |

**Release header layout:**
```
[date: "March 13, 2026"] [badge: "v1.0.0"]
```

| Element | Style |
|---------|-------|
| Date | Inter, 14px, weight 500, `#718096`, displayed as "Month DD, YYYY" |
| Version badge | `Badge` component, variant: `default`, text: "v{major}.{minor}.{patch}" |

**Release title (`<h2>`):**

| Property | Value |
|----------|-------|
| Font | Archivo, 24px, weight 700, navy |
| Margin top | 8px, margin bottom: 16px |

**Category tags (horizontal flex, wrap, gap: 8px):**

| Category | Color |
|----------|-------|
| "New Feature" | Aqua fill (`#B4E7DD` bg, `#0C1F40` text, 6px border-radius) |
| "Improvement" | `#EBF8FF` bg, `#2B6CB0` text |
| "Bug Fix" | `#FFF5F5` bg, `#C53030` text |
| "Security" | `#FFF9DB` bg, `#B7791F` text |
| "Deprecated" | `#F7FAFC` bg, `#718096` text |

Each tag: Inter, 12px, weight 600, px-2 py-0.5, border-radius 4px.

**Changes list (`<ul>`):**

| Property | Value |
|----------|-------|
| List style | `none` |
| Item padding | `8px 0 8px 20px` |
| Item before | `::before { content: "→"; color: #B4E7DD; position: absolute; left: 0 }` |
| Font | Inter, 15px, weight 400, `#2D3748` |
| Line height | 1.6 |

### Initial Changelog Entries

The following entries represent the launch changelog content. The forward loop writes these as static data (or fetches from a CMS in future iterations — for v1 they are static).

---

**Entry 1**:

```
Date: March 13, 2026
Version: v1.0.0
Title: "Daimon launches in open beta"
Categories: ["New Feature"]
Changes:
- Self-serve signup: create your Daimon tenant in under 2 minutes
- Bring Your Own Keys: paste your Anthropic API key and Discord bot token — no sharing required
- 50+ tools out of the box: Discord management, GitHub, Linear, Toggl, Google Analytics, Fly.io, LinkedIn, and more
- Free tier: try Daimon at no cost with 1 Discord server
- Starter tier ($9/month): production-ready with priority response times and team support
- Pro tier ($29/month): unlimited Discord servers, advanced analytics, dedicated support
- Supabase-powered data isolation: every tenant's data is logically isolated behind RLS policies
- OAuth integrations: connect GitHub, Google, and Linear with one click
- API key integrations: connect Toggl and other services via API key paste
- Real-time bot status: dashboard shows live heartbeat and connection health
```

---

**Entry 2** (placeholder for post-launch patches — rendered same as above):

```
Date: (future dates, rendered dynamically if CMS added)
```

For v1, the changelog is a static `.tsx` file with an array of entries. No CMS required.

### Data Model for Static Entries

```typescript
// app/(public)/changelog/page.tsx (or data file)
interface ChangelogEntry {
  date: string;         // ISO: "2026-03-13"
  version: string;      // "v1.0.0"
  title: string;
  categories: ('New Feature' | 'Improvement' | 'Bug Fix' | 'Security' | 'Deprecated')[];
  changes: string[];    // Array of change descriptions
}

const entries: ChangelogEntry[] = [ /* ... */ ];
// Rendered in reverse-chronological order (most recent first — array index 0 first)
```

### Loading State

Static page — no loading state needed. Page renders synchronously (SSG).

### Empty State

Not applicable — the changelog always has at least the v1.0.0 launch entry.

### Error State

Not applicable — static content.

### Responsive Behavior

| Breakpoint | Change |
|------------|--------|
| Desktop (≥1280px) | max-w-3xl centered, full padding |
| Tablet (768px) | max-w-3xl, px-6, same layout |
| Mobile (375px) | px-4, h1 font-size: 28px, release entry left-border: 2px, padding-left: 16px |

### SEO

```html
<title>Changelog — Daimon</title>
<meta name="description" content="What's new in Daimon — feature releases, improvements, and bug fixes." />
<meta property="og:title" content="Changelog — Daimon" />
<meta property="og:description" content="What's new in Daimon." />
<meta property="og:image" content="https://daimon.ai/og-changelog.png" />
<link rel="canonical" href="https://daimon.ai/changelog" />
```

OG image spec: same template as other pages — 1200×630px, navy bg, "Changelog" in Archivo 48px white, Daimon logo top-right.

### Keyboard Navigation

- `Tab` moves through nav links and footer links (no interactive elements on the page body itself)
- Page supports `find-in-page` (Ctrl+F) for searching changelog entries

---

## About

### Route: `/about`

**File**: `app/(public)/about/page.tsx`
**Layout**: Public, uses `PublicLayout` (top nav + footer)
**Meta title**: `About — Daimon`
**Meta description**: `Daimon is the self-serve SaaS layer for Decision Orchestrator — bringing AI-powered Discord automation to every team.`

### Page Structure

```
<PublicLayout>
  <main>
    Hero section (full-width gradient)
    Mission section
    How Daimon works (brief)
    Values section
    Team section (founder-first)
    CTA section
  </main>
</PublicLayout>
```

### Section 1: Hero

| Property | Value |
|----------|-------|
| Background | Navy (`#0C1F40`) |
| Padding | `pt-24 pb-20` |
| Max width container | `max-w-4xl mx-auto px-8 text-center` |
| Heading | "We believe AI belongs in the tools your team already uses." |
| Heading font | Archivo, 44px, weight 700, white |
| Heading max-width | 700px, centered |
| Subheading | "Daimon brings Claude-powered decision intelligence to Discord — the platform where teams already live." |
| Subheading font | Inter, 20px, weight 400, white at 70%, max-width: 600px, margin-top: 20px |
| Gradient orbs | Same Tier 1 animated blobs as landing page hero (see `frontend/landing-page.md` § Hero gradient orbs), opacity: 0.3 |

### Section 2: Mission

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Padding | `py-20` |
| Max width | `max-w-3xl mx-auto px-8` |
| Heading | "Our Mission" |
| Heading font | Archivo, 32px, weight 700, navy |
| Body | Multi-paragraph, Inter, 17px, weight 400, `#4A5568`, line-height 1.75 |

**Mission body text** (exact copy):

> Decision-making is the most high-value work any team does — and it's increasingly happening asynchronously, in Discord, over fast-moving threads. Yet the tools that help teams think — AI assistants, project trackers, time loggers, analytics dashboards — are siloed from the conversation.
>
> Daimon closes that gap. It sits inside Discord, where decisions happen, and brings 50+ connected tools into every thread. You ask a question. Daimon queries your data, checks your repositories, reviews your metrics, and answers in context — right where the conversation is.
>
> We built Daimon on Claude because we believe reasoning quality matters more than speed. We built it BYOK because we believe your data belongs to you. And we built it self-serve because the best tools are the ones your team actually deploys.

### Section 3: How Daimon Works (Brief)

| Property | Value |
|----------|-------|
| Background | `#F7F7F7` |
| Padding | `py-16` |
| Max width | `max-w-4xl mx-auto px-8` |
| Heading | "Built on Decision Orchestrator" |
| Heading font | Archivo, 28px, weight 700, navy |
| Layout | 3-column card grid (same layout as landing page How It Works) |

**3 cards:**

| # | Icon | Heading | Body |
|---|------|---------|------|
| 1 | Key icon | "Bring Your Own Keys" | "Your Anthropic API key powers every Claude request. We never see your conversations. You control the model, the spend, and the data." |
| 2 | Server icon | "Deploy in Two Minutes" | "Paste your Discord bot token and guild ID. Daimon handles the connection, the tooling, and the multi-tenant isolation — you get a live AI assistant immediately." |
| 3 | Plug icon | "Connect What You Use" | "GitHub, Linear, Toggl, Google Analytics, Fly.io, and more. OAuth for services that support it, API key paste for everything else." |

Card styling: same as landing page How It Works cards (see `frontend/landing-page.md` § How It Works section).

### Section 4: Values

| Property | Value |
|----------|-------|
| Background | White |
| Padding | `py-20` |
| Max width | `max-w-4xl mx-auto px-8` |
| Heading | "What We Believe" |
| Layout | 2-column grid (desktop), 1-column (mobile) |
| Gap | 32px |

**6 value cards:**

| # | Title | Body |
|---|-------|------|
| 1 | "Your data is yours" | "BYOK means your Anthropic API key goes directly to Anthropic. We store credentials encrypted in Supabase Vault. We never log your conversations." |
| 2 | "Reasoning over speed" | "We chose Claude because it thinks before it answers. A slower, correct response is worth more than a fast, wrong one." |
| 3 | "Small teams, big leverage" | "Daimon is built for 2–20 person teams who need enterprise-grade AI tooling without enterprise-grade setup." |
| 4 | "No lock-in" | "Every integration uses standard OAuth or API keys. If you leave Daimon, you keep your tokens, your data, and your services." |
| 5 | "Discord-native" | "We didn't bolt Discord on. Daimon was built from the ground up as a Discord-first application. The bot is the product." |
| 6 | "Open about limitations" | "AI systems make mistakes. Daimon won't hide that. Error messages are clear, citations are explicit, and the bot tells you when it doesn't know." |

Value card styling:

| Property | Value |
|----------|-------|
| Background | `#F7F7F7` |
| Border | `1px solid rgba(12,31,64,0.08)` |
| Border radius | `12px` |
| Padding | `24px` |
| Title font | Archivo, 18px, weight 700, navy |
| Body font | Inter, 15px, weight 400, `#4A5568`, line-height 1.6, margin-top 8px |

### Section 5: Team

| Property | Value |
|----------|-------|
| Background | `#F7F7F7` |
| Padding | `py-20` |
| Max width | `max-w-4xl mx-auto px-8` |
| Heading | "The Team" |
| Heading font | Archivo, 32px, weight 700, navy, text-center |
| Subheading | "Small, focused, shipping." |
| Subheading font | Inter, 18px, `#4A5568`, text-center, margin-top 8px |

**Team grid layout**: Centered row of cards, 1–3 cards depending on team size. For v1 launch with one founder:

| Property | Value |
|----------|-------|
| Layout | Single card, centered, max-width 280px |

**Founder card:**

| Property | Value |
|----------|-------|
| Avatar | 80px × 80px circle, navy bg, white initials (Archivo 28px weight 700) |
| Name | "Founder" (update at implementation with actual name) — Archivo, 20px, weight 700, navy |
| Role | "Founder & Builder" — Inter, 14px, `#718096` |
| One-liner | "Decision Orchestrator started as an internal tool. Daimon makes it available to every team." — Inter, 14px, `#4A5568`, text-center, max-width 240px, margin-top 8px |
| GitHub link | Icon + "@handle" (update at implementation) — links to GitHub profile, `target="_blank"` |

> **Implementation note**: Replace "Founder" placeholder with actual name and GitHub handle before launch. Avatar can be an actual photo (80px circle, `object-cover`) or the initials fallback.

**Team card styling:**

| Property | Value |
|----------|-------|
| Background | White |
| Border | `1px solid rgba(12,31,64,0.08)` |
| Border radius | `16px` |
| Padding | `32px 24px` |
| Alignment | `text-center` |
| Display | `flex flex-col items-center gap-12px` |

### Section 6: CTA

| Property | Value |
|----------|-------|
| Background | Navy (`#0C1F40`) |
| Padding | `py-20` |
| Heading | "Try Daimon free today" |
| Heading font | Archivo, 36px, weight 700, white, text-center |
| Subheading | "No credit card. No configuration. Just paste your keys and go." |
| Subheading font | Inter, 18px, white at 70%, text-center, margin-top 12px |
| CTA button | `Button` component, variant: `primary`, size: `lg`, label: "Get started free", href: `/signup` |
| Button margin-top | 32px |

### Loading / Error / Empty States

- Static page (SSG) — no loading state
- Error state: not applicable
- Empty state: not applicable

### Responsive Behavior

| Breakpoint | Change |
|------------|--------|
| Desktop (≥1280px) | All sections full-width, 2-col values grid, team cards horizontal |
| Tablet (768px) | 2-col values grid maintained, padding reduced to px-6 |
| Mobile (375px) | 1-col everything, hero h1 → 30px, mission body → 16px, value cards full-width, team card full-width |

### SEO

```html
<title>About — Daimon</title>
<meta name="description" content="Daimon brings Claude-powered AI tools to Discord. Built BYOK, built for small teams, built to ship." />
<meta property="og:title" content="About Daimon" />
<meta property="og:description" content="We believe AI belongs in the tools your team already uses." />
<meta property="og:image" content="https://daimon.ai/og-about.png" />
<link rel="canonical" href="https://daimon.ai/about" />
```

OG image: 1200×630px navy background, "About Daimon" in Archivo 48px white, tagline "Built for the tools your team already uses" in Inter 24px white 70%.

### Accessibility

- Hero heading: `<h1>`, mission + values + team use `<h2>` for section titles
- Value cards: `<ul role="list"><li>` with `<article>` inside
- Team cards: `<ul role="list"><li>` with `<article>` inside
- CTA button: `aria-label="Get started free — go to signup page"`
- GitHub link: `aria-label="{name}'s GitHub profile" rel="noopener noreferrer"`

---

## Blog Index

### Route: `/blog`

**File**: `app/(public)/blog/page.tsx`
**Layout**: Public, uses `PublicLayout`
**Meta title**: `Blog — Daimon`
**Meta description**: `Insights on AI-powered workflows, Discord automation, and building with Claude.`

### Page Structure

```
<PublicLayout>
  <main>
    Page header
    Featured post (first post, large card)
    Post grid (remaining posts, 3-col desktop)
    Pagination (if >12 posts)
  </main>
</PublicLayout>
```

### Page Header

| Property | Value |
|----------|-------|
| Padding | `pt-20 pb-12` |
| Heading | "Blog" |
| Heading font | Archivo, 44px, weight 700, navy |
| Subheading | "Insights on AI-powered workflows, Discord automation, and building with Claude." |
| Subheading font | Inter, 18px, `#4A5568`, margin-top 8px |
| Max width | `max-w-7xl mx-auto px-8` |

### Featured Post Card (first post)

| Property | Value |
|----------|-------|
| Layout | Full-width horizontal card (image left, text right at desktop; stacked at mobile) |
| Image area | 480px wide × 320px tall (desktop), `rounded-l-2xl`, `object-cover` |
| Background | `#F7F7F7` if no image |
| Border | `1px solid rgba(12,31,64,0.08)` |
| Border radius | `16px` |
| Padding (text side) | `40px` |
| Category badge | `Badge` component, category color |
| Title font | Archivo, 28px, weight 700, navy |
| Title max-width | 520px |
| Excerpt font | Inter, 16px, `#4A5568`, line-height 1.7, margin-top 12px |
| Published date | Inter, 14px, `#718096`, `format: "Month DD, YYYY"` |
| Read time | "X min read" — Inter, 14px, `#718096` |
| CTA link | "Read more →" — Inter, 15px, weight 600, aqua (`#B4E7DD`) underline on hover, links to `/blog/{slug}` |

### Post Grid (remaining posts)

| Property | Value |
|----------|-------|
| Columns (desktop ≥1280px) | 3 |
| Columns (tablet 768–1279px) | 2 |
| Columns (mobile <768px) | 1 |
| Gap | 32px |
| Margin-top | 48px |

**Post card:**

| Property | Value |
|----------|-------|
| Background | White |
| Border | `1px solid rgba(12,31,64,0.08)` |
| Border radius | `12px` |
| Overflow | hidden |
| Image | 100% width × 200px height, `object-cover` |
| Image fallback bg | Navy gradient (`linear-gradient(135deg, #0C1F40 0%, #1a3a6e 100%)`) |
| Card body padding | `20px` |
| Category badge | `Badge` component, margin-bottom 8px |
| Title font | Archivo, 20px, weight 700, navy, `line-clamp-2` |
| Excerpt font | Inter, 14px, `#4A5568`, line-height 1.6, `line-clamp-3`, margin-top 8px |
| Meta row | Flex, space-between: date (Inter 13px `#718096`) + read time (Inter 13px `#718096`) |
| Card link | Entire card is `<a href="/blog/{slug}">` with hover: `box-shadow: 0 4px 16px rgba(12,31,64,0.1)`, `transform: translateY(-2px)`, `transition: 0.2s` |

### Post Data Model

```typescript
interface BlogPost {
  slug: string;           // URL slug, e.g. "why-we-chose-claude"
  title: string;
  excerpt: string;        // 1–2 sentence summary
  content: string;        // MDX or Markdown body
  publishedAt: string;    // ISO: "2026-03-13"
  updatedAt?: string;
  readTimeMinutes: number;
  category: 'Product' | 'Engineering' | 'Guides' | 'Company';
  coverImageUrl?: string; // null = use gradient fallback
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  tags: string[];
  seo: {
    metaTitle?: string;   // defaults to post title
    metaDescription: string;
    ogImageUrl?: string;
  };
}
```

### Initial Blog Posts (v1 launch content)

The forward loop writes these as static MDX files in `app/(public)/blog/posts/`:

**Post 1:**
```
slug: "introducing-daimon"
title: "Introducing Daimon: Bring Your Own Keys, Deploy in Two Minutes"
excerpt: "Today we're opening Daimon to everyone. Bring your Anthropic API key and Discord bot token — your AI assistant is ready in under two minutes."
publishedAt: "2026-03-13"
readTimeMinutes: 4
category: "Product"
tags: ["launch", "product", "discord", "claude"]
author.name: (founder name — update before launch)
author.role: "Founder"
```

Body (exact text):

> **Discord is where decisions happen.**
>
> For a growing number of teams — startups, agencies, open-source projects, gaming communities — Discord isn't just a chat app. It's the async HQ. Product discussions, deployment alerts, customer support, sprint reviews — they all happen in Discord.
>
> But the AI tools that could supercharge those conversations have been living in separate tabs. ChatGPT here, GitHub there, Toggl over there. Context switching kills momentum.
>
> **That's what Daimon solves.**
>
> Daimon is a Discord bot powered by Claude that brings 50+ tools into every conversation. Ask it to pull your Toggl time report and post it as a summary. Ask it to open a GitHub issue from a Discord thread. Ask it to check your Fly.io deployment status. It understands context, reasons across tools, and responds in plain English.
>
> **Bring Your Own Keys**
>
> We built Daimon BYOK from day one. Your Anthropic API key goes directly to Anthropic — we never proxy your conversations. Your Discord bot token is encrypted at rest using Supabase Vault. Your service credentials (GitHub, Linear, Toggl) are never exposed to our application logic. You own your data.
>
> **Two minutes from signup to live bot**
>
> 1. Sign up at daimon.ai
> 2. Paste your Anthropic API key
> 3. Paste your Discord bot token + server ID
> 4. Your bot is online
>
> No YAML. No Docker. No infra. We handle the multi-tenant orchestration; you get the result.
>
> **Start free today**
>
> Daimon is free to start. The free tier connects one Discord server and gives you all 50+ tools. Starter ($9/month) and Pro ($29/month) plans are available for teams that need more.
>
> [Get started free →](https://daimon.ai/signup)

---

**Post 2:**
```
slug: "byok-why-it-matters"
title: "Why BYOK Matters More Than You Think"
excerpt: "Bring Your Own Keys isn't just a feature. It's a philosophy about who controls your AI stack — and why it should be you."
publishedAt: "2026-03-13"
readTimeMinutes: 5
category: "Engineering"
tags: ["byok", "security", "anthropic", "api-keys"]
```

Body (exact text):

> When we say "Bring Your Own Keys," we mean it literally: your Anthropic API key, stored encrypted in Supabase Vault, sent directly to Anthropic's API on every request. We never see your conversations. We never proxy your Claude calls. We never have access to your AI spend.
>
> **Why this matters**
>
> Most SaaS AI tools act as a proxy between you and the LLM. Your messages go: You → Their servers → OpenAI/Anthropic → Their servers → You. That means:
>
> - Your conversations are logged on their infrastructure
> - Their pricing includes a markup on your AI spend
> - If they get breached, your conversation history is exposed
> - If they shut down, your AI assistant goes dark
>
> With BYOK, the architecture is: You → Daimon (bot logic only) → Anthropic. Daimon handles the orchestration — tool selection, multi-step reasoning, Discord formatting — but the actual Claude API call goes directly from the bot to Anthropic using your key.
>
> **What we do store**
>
> We're transparent about what we keep:
>
> - Your API key (AES-256 encrypted in Supabase Vault, never logged)
> - Your Discord bot token (encrypted, used only to maintain your bot's connection)
> - Tool outputs (stored in `tenant_tool_calls` table, 90-day retention, RLS-isolated to your tenant)
> - Message metadata (stored in `tenant_messages`, 90-day retention, RLS-isolated to your tenant)
>
> We do not store the content of your Claude conversations. The LLM inference happens in memory.
>
> **The tradeoff**
>
> BYOK means you manage your own Anthropic billing. If you run a lot of queries, your API bill will reflect that — we can't subsidize it. But you get something in return: complete cost transparency, no markup, and a direct relationship with Anthropic.
>
> We think that tradeoff is worth it. Your AI stack should belong to you.

---

**Post 3:**
```
slug: "discord-as-operating-system"
title: "Discord as an Operating System"
excerpt: "Why we think Discord is the most underrated productivity platform of the decade — and what that means for AI."
publishedAt: "2026-03-13"
readTimeMinutes: 6
category: "Company"
tags: ["discord", "productivity", "ai", "async-work"]
```

Body (exact text):

> This sounds hyperbolic. It isn't.
>
> Discord started as a gaming chat platform. But somewhere between 2020 and 2023, it became something else: the async HQ for a generation of internet-native teams. Open-source projects. Web3 communities. Indie studios. Startups. Creator collectives. They all chose Discord — not Slack, not Teams — as their operating environment.
>
> **Why Discord, not Slack?**
>
> A few reasons:
>
> - **Free.** Slack's free tier limits message history. Discord doesn't.
> - **Voice + text native.** Audio channels are always on, no scheduling friction.
> - **Community-grade.** Server structure (channels → categories → roles) scales from 3 people to 100,000.
> - **Bot ecosystem.** Discord bots are a first-class feature with a mature API.
>
> The result: Discord is where 150+ million monthly active users hang out — and increasingly, where they work.
>
> **The AI gap**
>
> But Discord's bot ecosystem is frozen in 2019 thinking. Most Discord bots do simple things: moderation, music, polls. They don't reason. They don't have access to your project's data. They can't answer "what did we ship last week?" or "which Toggl client is behind on hours?"
>
> That's the gap we're filling. Daimon treats Discord as an operating system — a surface for multi-step AI reasoning connected to real data. Not a novelty bot. An operating layer.
>
> **What this looks like in practice**
>
> In a Discord server running Daimon:
>
> - The engineering channel can query GitHub PRs and Fly.io deployments
> - The ops channel can pull Toggl time reports and Google Analytics metrics
> - The product channel can create Linear issues from discussion threads
> - The exec channel can get synthesized weekly summaries from all of the above
>
> One assistant. Fifty tools. The conversation layer your team already lives in.
>
> **The bet**
>
> We're betting that async text + AI is the future of team productivity — and that Discord is the platform where this clicks first. If we're right, every Discord community eventually wants an AI that can reason about their data. Daimon is built for that moment.

### Pagination

| Property | Value |
|----------|-------|
| Posts per page | 12 |
| Trigger | Rendered if `totalPosts > 12` |
| Component | `Pagination` from component library |
| URL pattern | `/blog?page=2` |
| First page | No `?page` param (canonical URL) |

### Loading State

Skeleton: Show `PostCardSkeleton` components (3-column grid matching post grid layout, animated pulse, bg `#F7F7F7`, same dimensions as post cards). Featured post skeleton shows 2-column layout with left block (480×320 bg `#F0F0F0`) and right block (lines).

### Empty State

If no posts exist (impossible in v1 but spec for completeness):

| Property | Value |
|----------|-------|
| Icon | `PenLine` (Lucide) |
| Heading | "No posts yet" |
| Subheading | "We're working on our first article. Check back soon." |
| CTA | None |

### Error State

If MDX load fails:

| Property | Value |
|----------|-------|
| Error component | `ErrorState` from component library |
| Heading | "Couldn't load posts" |
| Subheading | "Please try refreshing the page." |
| Action | "Refresh" button (reloads page) |

### Responsive Behavior

| Breakpoint | Change |
|------------|--------|
| Desktop (≥1280px) | Featured post: horizontal layout (image left). Grid: 3 columns. |
| Tablet (768–1279px) | Featured post: stacked (image top). Grid: 2 columns. |
| Mobile (<768px) | Featured post: stacked, full-width. Grid: 1 column. Page header h1: 28px. |

### SEO

```html
<title>Blog — Daimon</title>
<meta name="description" content="Insights on AI-powered workflows, Discord automation, and building with Claude." />
<meta property="og:title" content="Daimon Blog" />
<meta property="og:description" content="Insights on AI-powered workflows, Discord automation, and building with Claude." />
<meta property="og:image" content="https://daimon.ai/og-blog.png" />
<link rel="canonical" href="https://daimon.ai/blog" />
```

### Accessibility

- Featured post and post cards: `<article>` elements with `aria-labelledby` pointing to title `<h2>` id
- Post grid: `<ul role="list">` with `<li>` wrappers
- Card links: `aria-label="{post title}"` on the wrapping `<a>` (since card = full-link pattern)
- Pagination: `<nav aria-label="Blog pagination">` with `aria-current="page"` on active page

---

## Blog Post

### Route: `/blog/[slug]`

**File**: `app/(public)/blog/[slug]/page.tsx`
**Layout**: Public, uses `PublicLayout`
**Meta title**: `{post.seo.metaTitle || post.title} — Daimon`
**Meta description**: `{post.seo.metaDescription}`

### Page Structure

```
<PublicLayout>
  <main>
    Post header (breadcrumb, title, meta, cover image)
    Post body (MDX content, max-w-2xl centered)
    Author card
    Related posts (3 posts, same category)
    CTA section ("Ready to try Daimon?")
  </main>
</PublicLayout>
```

### Post Header

| Property | Value |
|----------|-------|
| Breadcrumb | `Blog → {category}` — Inter, 14px, `#718096`. "Blog" links to `/blog`, category links to `/blog?category={category}` |
| Title | `<h1>`, Archivo, 44px (desktop) / 30px (mobile), weight 700, navy, max-w-3xl |
| Category badge | `Badge` component, category color, margin-top 16px |
| Meta row | Flex, gap 16px: author avatar (24px circle) + author name (Inter 15px weight 500 navy) + separator ("·") + date + separator + read time |
| Cover image | 100% width, max-height 480px, `object-cover`, border-radius 16px, margin-top 32px |
| Cover image alt | `{post.title} — cover image` |

### Post Body

| Property | Value |
|----------|-------|
| Max width | `max-w-2xl mx-auto` |
| Font | Inter, 17px, line-height 1.8, color `#2D3748` |
| `<h2>` | Archivo, 28px, weight 700, navy, margin: `48px 0 16px` |
| `<h3>` | Archivo, 22px, weight 700, navy, margin: `32px 0 12px` |
| `<p>` | Margin-bottom 20px |
| `<strong>` | weight 700, navy |
| `<a>` | Aqua underline (`text-decoration: underline; text-decoration-color: #B4E7DD`), hover: opacity 0.7 |
| `<blockquote>` | Left border: `4px solid #B4E7DD`, padding-left 20px, font-style italic, color `#4A5568` |
| `<code>` (inline) | `bg: #F7F7F7`, `border: 1px solid rgba(12,31,64,0.08)`, `border-radius: 4px`, `padding: 2px 6px`, `font-family: JetBrains Mono, monospace`, `font-size: 14px` |
| `<pre><code>` (block) | `bg: #0C1F40` (navy), text: white, padding: 24px, border-radius: 12px, overflow-x: auto, `font-family: JetBrains Mono`, `font-size: 14px`, line-height 1.6 |
| `<ul>`, `<ol>` | Margin-left 24px, margin-bottom 20px, `li` margin-bottom 8px |
| `<hr>` | `1px solid rgba(12,31,64,0.1)`, margin: `40px 0` |
| `<img>` | Max-width 100%, border-radius 8px |
| Table | Width 100%, border-collapse, `th`: Archivo 14px weight 700 navy bg `#F7F7F7`, `td`: Inter 14px, all cells: `padding: 12px 16px`, `border-bottom: 1px solid rgba(12,31,64,0.08)` |

### Author Card

Displayed below post body.

| Property | Value |
|----------|-------|
| Layout | Horizontal flex: avatar (left) + text (right) |
| Background | `#F7F7F7` |
| Border | `1px solid rgba(12,31,64,0.08)` |
| Border radius | `12px` |
| Padding | `24px` |
| Avatar | 56px × 56px circle, object-cover (or initials fallback) |
| Name | Archivo, 18px, weight 700, navy |
| Role | Inter, 14px, `#718096` |
| Bio | Inter, 15px, `#4A5568`, max-w: 480px, margin-top 8px |

### Related Posts

| Property | Value |
|----------|-------|
| Heading | "More from the blog" |
| Heading font | Archivo, 24px, weight 700, navy |
| Count | 3 posts, same category, excluding current post |
| Layout | 3-column grid (desktop), 1-column (mobile) |
| Card | Same `PostCard` component as blog index |

### CTA Section

Same styling as About page CTA section. Text: "Ready to put AI in your Discord?" / "Start free — no credit card required." / Button: "Get started free" → `/signup`.

### Static Generation

All blog posts are statically generated at build time from MDX files in `app/(public)/blog/posts/`. No server-side fetch needed at runtime.

```typescript
// generateStaticParams
export async function generateStaticParams() {
  const posts = getAllPosts(); // reads MDX files from posts/
  return posts.map(post => ({ slug: post.slug }));
}
```

### 404 Handling

If `slug` not found: `notFound()` → Next.js renders `not-found.tsx`. Content: "Post not found" with link back to `/blog`.

### Responsive Behavior

| Breakpoint | Change |
|------------|--------|
| Desktop (≥1280px) | Post body max-w-2xl centered, h1 44px, related posts 3-column |
| Tablet (768–1279px) | Same layout, h1 36px |
| Mobile (<768px) | h1 28px, related posts 1-column, author card stacked (avatar above text) |

### SEO (per post)

```html
<title>{post.seo.metaTitle || post.title} — Daimon</title>
<meta name="description" content="{post.seo.metaDescription}" />
<meta name="author" content="{post.author.name}" />
<meta property="article:published_time" content="{post.publishedAt}" />
<meta property="article:modified_time" content="{post.updatedAt || post.publishedAt}" />
<meta property="article:author" content="{post.author.name}" />
<meta property="article:tag" content="{post.tags.join(',')}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="{post.title}" />
<meta property="og:description" content="{post.seo.metaDescription}" />
<meta property="og:image" content="{post.seo.ogImageUrl || 'https://daimon.ai/og-blog-default.png'}" />
<link rel="canonical" href="https://daimon.ai/blog/{post.slug}" />
```

Schema.org markup for blog post:
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{post.title}",
  "description": "{post.seo.metaDescription}",
  "datePublished": "{post.publishedAt}",
  "dateModified": "{post.updatedAt || post.publishedAt}",
  "author": {
    "@type": "Person",
    "name": "{post.author.name}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Daimon",
    "logo": {
      "@type": "ImageObject",
      "url": "https://daimon.ai/logo.png"
    }
  },
  "image": "{post.coverImageUrl || 'https://daimon.ai/og-blog-default.png'}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://daimon.ai/blog/{post.slug}"
  }
}
```

### Accessibility

- Post title: `<h1>` (only one per page)
- Headings in MDX: `<h2>`, `<h3>` in hierarchical order
- Images: `alt` attribute required (MDX authoring convention)
- Code blocks: `<pre><code aria-label="Code example">` (screen readers announce as code)
- Author card: `<aside aria-label="About the author">`
- Related posts section: `<section aria-label="Related posts">`

---

## Cookie Policy

### Route: `/legal/cookies`

**File**: `app/(public)/legal/cookies/page.tsx`
**Layout**: Public, uses `PublicLayout`
**Meta title**: `Cookie Policy — Daimon`
**Meta description**: `Learn about the cookies and tracking technologies Daimon uses.`

### Page Structure

```
<PublicLayout>
  <main>
    <LegalPageShell>  (max-w-3xl mx-auto px-8 py-20)
      Effective date + last updated
      Table of contents (anchor links)
      Policy sections
    </LegalPageShell>
  </main>
</PublicLayout>
```

### `LegalPageShell` Component

| Property | Value |
|----------|-------|
| Max width | `max-w-3xl` |
| Padding | `py-20 px-8` |
| `<h1>` font | Archivo, 36px, weight 700, navy |
| Section `<h2>` font | Archivo, 22px, weight 700, navy, margin-top 48px, margin-bottom 16px |
| Section `<h3>` font | Archivo, 18px, weight 700, navy, margin-top 32px, margin-bottom 12px |
| Body text | Inter, 16px, weight 400, `#2D3748`, line-height 1.75 |
| `<p>` margin-bottom | 16px |
| `<ul>`, `<ol>` | margin-left 24px, `li` margin-bottom 8px |
| Table | Width 100%, border-collapse, `th` bg `#F7F7F7` Archivo 14px weight 700, `td` Inter 14px, cells `padding: 12px 16px`, `border: 1px solid rgba(12,31,64,0.08)` |
| `<a>` | aqua underline, hover opacity 0.7 |
| Effective date line | Inter, 14px, `#718096`, margin-bottom 8px |
| Last updated line | Inter, 14px, `#718096`, margin-bottom 48px |

### Complete Cookie Policy Text

---

**COOKIE POLICY**

**Effective Date**: March 13, 2026
**Last Updated**: March 13, 2026

---

**Table of Contents**

1. [What Are Cookies?](#what-are-cookies)
2. [How We Use Cookies](#how-we-use-cookies)
3. [Types of Cookies We Use](#types-of-cookies-we-use)
4. [Third-Party Cookies](#third-party-cookies)
5. [Cookie Consent and Your Choices](#cookie-consent-and-your-choices)
6. [Specific Cookie Inventory](#specific-cookie-inventory)
7. [Browser Controls](#browser-controls)
8. [Do Not Track](#do-not-track)
9. [Changes to This Policy](#changes-to-this-policy)
10. [Contact Us](#contact-us)

---

### 1. What Are Cookies?

Cookies are small text files that are placed on your device (computer, smartphone, tablet) when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website operator.

Cookies allow a website to recognize your device and remember certain information about your preferences or past actions.

Similar technologies, including local storage, session storage, and pixels, may also be used for similar purposes as cookies. This policy covers all such technologies.

---

### 2. How We Use Cookies

Daimon ("we," "us," or "our") uses cookies and similar technologies on our website (`daimon.ai`) and web application for the following purposes:

- **Authentication**: To keep you logged in to your account and recognize your session across page loads.
- **Security**: To protect against cross-site request forgery (CSRF) and other security threats.
- **Preferences**: To remember your settings and preferences (such as theme or language).
- **Analytics**: To understand how visitors use our site, which pages are visited most, and how users navigate.
- **Performance**: To optimize the speed and performance of our site.

We do not use cookies for advertising, retargeting, or cross-site tracking for third-party purposes.

---

### 3. Types of Cookies We Use

#### 3.1 Strictly Necessary Cookies

These cookies are required for the website to function. They cannot be disabled. Without them, you cannot log in, access your dashboard, or use the application.

| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| `sb-access-token` | Supabase Auth — stores your authentication session token | Session (until logout or expiry) |
| `sb-refresh-token` | Supabase Auth — stores your session refresh token for automatic renewal | 60 days (rolling) |
| `__Host-next-auth.csrf-token` | CSRF protection for server actions | Session |
| `next-auth.session-token` | Next.js session management | Session |

**Legal basis**: Legitimate interests (strictly necessary for service operation).

#### 3.2 Functional Cookies

These cookies enhance your experience but are not strictly required. You may disable them, but some features may not work as expected.

| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| `daimon-theme` | Stores your UI theme preference (if multiple themes are supported) | 1 year |
| `daimon-onboarding-dismissed` | Remembers if you have dismissed the onboarding checklist | 30 days |
| `daimon-sidebar-state` | Stores whether the sidebar is expanded or collapsed | 1 year |

**Legal basis**: Consent / legitimate interests.

#### 3.3 Analytics Cookies

We use analytics to understand how our site is used so we can improve it. We use privacy-respecting analytics tools that do not share data with third-party advertisers.

| Cookie Name | Set By | Purpose | Duration |
|-------------|--------|---------|----------|
| `_vercel_insights` | Vercel | Tracks anonymous page view and performance metrics | Session |
| `vercel-analytics-id` | Vercel | Persistent anonymous visitor identifier for Vercel Analytics | 1 year |

**Legal basis**: Legitimate interests (we use anonymized, aggregated data only). You may opt out via browser controls or by enabling "Do Not Track."

---

### 4. Third-Party Cookies

Our service integrates with the following third parties who may set cookies on your device:

#### 4.1 Supabase

Supabase (supabase.com) provides our authentication and database infrastructure. When you authenticate via Supabase, authentication-related cookies are set in our `daimon.ai` domain (not third-party). Supabase may also set cookies on their own domains for their infrastructure. See [Supabase's Privacy Policy](https://supabase.com/privacy) for details.

#### 4.2 Stripe

When you visit our billing pages or initiate a Stripe Checkout session, Stripe (stripe.com) may set cookies for fraud prevention, performance, and compliance purposes. These cookies are set by Stripe's domains, not our domain. See [Stripe's Cookie Policy](https://stripe.com/cookies-policy/legal) for details.

| Cookie | Set By | Purpose | Duration |
|--------|--------|---------|----------|
| `__stripe_mid` | stripe.com | Fraud detection | 1 year |
| `__stripe_sid` | stripe.com | Fraud detection | 30 minutes |
| `stripe.csrf` | stripe.com | CSRF protection during checkout | Session |

#### 4.3 Vercel

Vercel (vercel.com) hosts our website. They may set performance and security cookies. See [Vercel's Privacy Policy](https://vercel.com/legal/privacy-policy) for details.

We do not use cookies from:
- Facebook / Meta
- Google Ads
- Twitter / X
- LinkedIn
- Any advertising networks

---

### 5. Cookie Consent and Your Choices

**Strictly necessary cookies**: These cookies are set automatically as they are required for the service to function. You cannot decline them and continue to use the service.

**Functional cookies**: These cookies are set when you take actions that trigger them (e.g., adjusting your sidebar). You can clear them via your browser settings at any time.

**Analytics cookies**: On your first visit, we do not require explicit consent for analytics cookies where we use only anonymized, aggregated data (as permitted by applicable law in our operating jurisdiction). If you prefer to opt out:

- Enable "Do Not Track" in your browser (we honor this signal — see §8)
- Use a browser extension such as Privacy Badger or uBlock Origin
- Clear cookies and use private/incognito mode
- Contact us at `privacy@daimon.ai` to opt out of analytics tracking

If you are in a jurisdiction requiring explicit cookie consent (e.g., the EU under GDPR/ePrivacy), a cookie consent banner will appear on your first visit, and analytics cookies will not be set until you consent.

---

### 6. Specific Cookie Inventory

Complete list of all cookies set on `daimon.ai` and `app.daimon.ai`:

| Name | Domain | Type | Duration | Purpose |
|------|--------|------|----------|---------|
| `sb-access-token` | `daimon.ai` | Strictly Necessary | Session | Supabase Auth access token |
| `sb-refresh-token` | `daimon.ai` | Strictly Necessary | 60 days | Supabase Auth refresh token |
| `__Host-next-auth.csrf-token` | `daimon.ai` | Strictly Necessary | Session | CSRF protection |
| `next-auth.session-token` | `daimon.ai` | Strictly Necessary | Session | Session management |
| `daimon-theme` | `daimon.ai` | Functional | 1 year | UI theme preference |
| `daimon-onboarding-dismissed` | `daimon.ai` | Functional | 30 days | Onboarding checklist state |
| `daimon-sidebar-state` | `daimon.ai` | Functional | 1 year | Sidebar expand/collapse state |
| `_vercel_insights` | `daimon.ai` | Analytics | Session | Vercel anonymous analytics |
| `vercel-analytics-id` | `daimon.ai` | Analytics | 1 year | Vercel anonymous visitor ID |
| `__stripe_mid` | `stripe.com` | Third-Party (Fraud) | 1 year | Stripe fraud detection |
| `__stripe_sid` | `stripe.com` | Third-Party (Fraud) | 30 min | Stripe fraud detection |
| `stripe.csrf` | `stripe.com` | Third-Party (Security) | Session | Stripe CSRF protection |

This list is reviewed and updated quarterly. Last reviewed: March 13, 2026.

---

### 7. Browser Controls

You can control and delete cookies using your browser's settings. The following links explain how to manage cookies in major browsers:

- **Chrome**: chrome://settings/cookies
- **Firefox**: about:preferences#privacy
- **Safari**: Preferences → Privacy
- **Edge**: edge://settings/cookies
- **Opera**: opera://settings/privacy-browser

**Important**: If you delete or block strictly necessary cookies, you will be logged out and may not be able to access your dashboard.

To opt out of Vercel Analytics specifically, you can install a browser extension that blocks the Vercel Analytics endpoint (`/_vercel/insights`) or use a content blocker.

---

### 8. Do Not Track

We honor the "Do Not Track" (DNT) browser signal. When DNT is enabled in your browser, we:

1. Do not set analytics cookies (`_vercel_insights`, `vercel-analytics-id`)
2. Do not log your page view data for analytics purposes
3. Continue to set strictly necessary cookies (required for authentication and security)

Note: DNT is a browser-level preference and does not affect cookies set by third-party services like Stripe (which sets cookies for fraud prevention, a legitimate interest that overrides DNT).

---

### 9. Changes to This Policy

We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we update the policy, we will:

1. Update the "Last Updated" date at the top of this page
2. If changes are material, notify you via email (if you have an account) or via a banner on the website
3. Maintain the previous version in our changelog at `/changelog`

Continued use of the website after the effective date of a change constitutes your acceptance of the updated policy.

---

### 10. Contact Us

If you have questions about our use of cookies or this Cookie Policy, please contact us:

- **Email**: `privacy@daimon.ai`
- **Subject**: "Cookie Policy Inquiry"
- **Response time**: Within 10 business days

You may also submit a request to:
- Opt out of analytics cookies
- Receive a complete list of cookies currently set on your device associated with your account
- Request deletion of any non-essential cookie data we hold

---

*This Cookie Policy is incorporated by reference into our [Privacy Policy](/legal/privacy) and [Terms of Service](/legal/terms).*

---

### Loading State

Static page (SSG) — no loading state needed.

### Error State

Not applicable — static content.

### Responsive Behavior

| Breakpoint | Change |
|------------|--------|
| Desktop (≥1280px) | max-w-3xl centered, full padding |
| Tablet (768px) | max-w-3xl, px-6 |
| Mobile (375px) | px-4, h1 → 28px, table → horizontal scroll with `overflow-x: auto` wrapper |

**Table mobile handling**: All tables in the cookie policy are wrapped in `<div style="overflow-x: auto;">` to enable horizontal scrolling on narrow screens. Table min-width is not set — tables can shrink to fit.

### SEO

```html
<title>Cookie Policy — Daimon</title>
<meta name="description" content="Learn about the cookies and tracking technologies Daimon uses on daimon.ai." />
<meta property="og:title" content="Cookie Policy — Daimon" />
<meta property="og:description" content="How we use cookies and similar technologies." />
<link rel="canonical" href="https://daimon.ai/legal/cookies" />
<meta name="robots" content="noindex" />
```

Note: `noindex` is set on all `/legal/*` pages — they should not appear in Google search results (they're compliance pages, not marketing pages). This matches the existing `noindex` on `/legal/terms` and `/legal/privacy` per the SEO spec.

### Accessibility

- Page uses `<main>` with `<article>` wrapper
- Section headings: `<h1>` for page title, `<h2>` for numbered sections, `<h3>` for subsections
- Tables: `<thead>` with `<th scope="col">` for column headers
- Table of contents: `<nav aria-label="Cookie policy table of contents"><ol>` with anchor links to section IDs
- All anchor links use `id="{section-slug}"` on the corresponding `<h2>` element

### Table of Contents Implementation

Each `<h2>` has an `id` attribute matching the table of contents anchor:

```html
<h2 id="what-are-cookies">1. What Are Cookies?</h2>
<h2 id="how-we-use-cookies">2. How We Use Cookies</h2>
<h2 id="types-of-cookies-we-use">3. Types of Cookies We Use</h2>
<h2 id="third-party-cookies">4. Third-Party Cookies</h2>
<h2 id="cookie-consent-and-your-choices">5. Cookie Consent and Your Choices</h2>
<h2 id="specific-cookie-inventory">6. Specific Cookie Inventory</h2>
<h2 id="browser-controls">7. Browser Controls</h2>
<h2 id="do-not-track">8. Do Not Track</h2>
<h2 id="changes-to-this-policy">9. Changes to This Policy</h2>
<h2 id="contact-us">10. Contact Us</h2>
```

Table of contents component is `<nav aria-label="Cookie policy table of contents">` with `<ol>` containing `<li><a href="#section-id">Section title</a></li>` for each section.

---

## File Directory Mapping

| Route | Next.js File Path |
|-------|------------------|
| `/changelog` | `app/(public)/changelog/page.tsx` |
| `/about` | `app/(public)/about/page.tsx` |
| `/blog` | `app/(public)/blog/page.tsx` |
| `/blog/[slug]` | `app/(public)/blog/[slug]/page.tsx` |
| `/legal/cookies` | `app/(public)/legal/cookies/page.tsx` |

All files live in the `(public)` route group which applies `PublicLayout` (top nav + footer) and has no auth requirement.

## Blog Post Data Files

Static MDX files stored at:

```
app/(public)/blog/posts/
├── introducing-daimon.mdx
├── byok-why-it-matters.mdx
└── discord-as-operating-system.mdx
```

Each `.mdx` file has a frontmatter block:

```mdx
---
slug: "introducing-daimon"
title: "Introducing Daimon: Bring Your Own Keys, Deploy in Two Minutes"
excerpt: "Today we're opening Daimon to everyone..."
publishedAt: "2026-03-13"
readTimeMinutes: 4
category: "Product"
tags: ["launch", "product", "discord", "claude"]
author:
  name: "Founder Name"
  role: "Founder"
  avatarUrl: null
seo:
  metaDescription: "Daimon launches in open beta — bring your Anthropic API key and Discord bot token to get your own AI assistant in under two minutes."
  ogImageUrl: null
---

{content}
```

The `getAllPosts()` utility reads all `.mdx` files from this directory, parses frontmatter with `gray-matter`, sorts by `publishedAt` descending, and returns `BlogPost[]`.

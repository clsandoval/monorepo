# Landing Page — Complete Specification

> Route: `/`
> Layout: Public (no auth required)
> File: `app/(public)/page.tsx` (or `app/page.tsx`)
> Last updated: 2026-03-13

---

## Overview

The landing page is the primary marketing and conversion surface. It introduces Daimon to prospective users, communicates the value proposition (BYOK Discord AI bot with 50+ tools), shows pricing, and drives signup.

**Conversion goal**: Visitor → `/signup`

**Background**: White (`#FFFFFF`) base with Tier 1 animated gradient blobs on hero section. Subsequent sections alternate between white and white-soft (`#F7F7F7`) backgrounds.

---

## Section Order

1. Navigation Bar (sticky)
2. Hero Section
3. How It Works (3-step)
4. Features / Capabilities Grid
5. Integrations Strip
6. Pricing (Free / Starter / Pro)
7. FAQ (expandable)
8. Final CTA Banner
9. Footer

---

## 1. Navigation Bar

### Markup Structure
```
<nav> (sticky, top-0, z-50)
  <div> (max-w-7xl, mx-auto, px-8, h-16, flex, items-center, justify-between)
    Logo (left)
    Nav links (center, hidden on mobile)
    CTA button (right) + hamburger (mobile)
```

### Styling
| Property | Value |
|----------|-------|
| Height (desktop) | 64px |
| Height (mobile) | 56px |
| Background | `rgba(255,255,255,0.92)` + `backdrop-filter: blur(12px)` |
| Border bottom | `1px solid rgba(12,31,64,0.08)` |
| Position | `sticky`, `top: 0`, `z-index: 50` |
| Max width container | `max-w-7xl mx-auto px-8` |

### Logo
| Property | Value |
|----------|-------|
| Markup | `<a href="/">` containing SVG rocket icon + wordmark "Daimon" |
| Icon size | 28px × 28px |
| Icon color | Navy (`#0C1F40`) |
| Wordmark font | Archivo, 18px, weight 700, navy |
| Gap between icon and wordmark | 8px |
| Safe zone | 1x on all sides |

### Navigation Links (desktop only, hidden at ≤900px)
| Label | `href` | Notes |
|-------|--------|-------|
| Features | `#features` | Smooth scroll |
| Pricing | `#pricing` | Smooth scroll |
| Docs | `/docs` | Full page navigation |

Link styling:
| Property | Value |
|----------|-------|
| Font | Inter, 15px, weight 500, navy |
| Gap between links | 28px |
| Active state | 2px aqua (`#B4E7DD`) underline bottom |
| Hover | `opacity: 0.7`, `transition: opacity 0.2s ease` |
| Text decoration | none (custom underline via `::after` or `border-bottom`) |

### CTA Button (desktop)
| Property | Value |
|----------|-------|
| Label | "Get Started Free" |
| `href` | `/signup` |
| Variant | Primary compact (light bg) |
| Height | 38px |
| Padding | `0 20px` |
| Font | Inter, 14px, weight 600 |
| Background | Aqua (`#B4E7DD`) |
| Text color | Navy (`#0C1F40`) |
| Border | `1.5px solid #B4E7DD` |
| Border radius | `0` |
| Hover | `opacity: 0.85`, `transition: all 0.2s ease` |

### Mobile Hamburger
| Property | Value |
|----------|-------|
| Icon | 24px × 24px, three horizontal lines, navy |
| Visible at | ≤900px |
| Triggers | Full-screen overlay navigation |

### Mobile Menu Overlay
| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Width | 100vw |
| Height | 100vh |
| Position | `fixed`, `inset: 0`, `z-index: 100` |
| Transition | Slide in from right, `transform: translateX(0)`, 0.3s ease |
| Links | Stacked vertically, 32px font, 48px line height, navy |
| Close icon | `×`, top-right, 32px, navy |
| CTA | "Get Started Free" button at bottom, full width, primary variant |

---

## 2. Hero Section

### Layout
```
<section> (min-h: 100vh, relative, overflow-hidden, bg-white)
  Animated blob layer (absolute, inset-0, z-0)
  Dots texture overlay (absolute, inset-0, z-1, opacity-50)
  Content (relative, z-10, flex column, justify-end, pb-20)
    Eyebrow tag
    Headline
    Subheadline
    CTA group
```

### Background: Tier 1 Animated Blobs
Four blobs absolutely positioned behind content:

| Blob | Size | Color | Opacity | Position | Animation |
|------|------|-------|---------|----------|-----------|
| Blob 1 | 600×600px | Aqua (`#B4E7DD`) | 40% | top: -200px, left: -100px | `drift-teal` 25s ease-in-out infinite alternate |
| Blob 2 | 500×500px | Periwinkle (`#9FAAE2`) | 35% | top: 10%, right: -150px | `drift-periwinkle` 30s ease-in-out infinite alternate |
| Blob 3 | 400×400px | Navy (`#0C1F40`) | 8% | bottom: 20%, left: 30% | `drift-navy-center` 22s ease-in-out infinite alternate |
| Blob 4 | 300×300px | Periwinkle (`#9FAAE2`) | 25% | bottom: -100px, right: 10% | `drift-navy-right` 28s ease-in-out infinite alternate |

Each blob: `border-radius: 50%`, `filter: blur(80px)`, `will-change: transform`

Drift animation keyframes:
```css
@keyframes drift-teal {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(200px, 100px); }
}
@keyframes drift-periwinkle {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(-150px, 100px); }
}
@keyframes drift-navy-center {
  0%   { transform: translateX(-50%) translate(0, 0); }
  100% { transform: translateX(-50%) translate(120px, 160px); }
}
@keyframes drift-navy-right {
  0%   { transform: translateY(-57%) translate(0, 0); }
  100% { transform: translateY(-57%) translate(-120px, 150px); }
}
@media (prefers-reduced-motion: reduce) {
  [data-blob] { animation: none !important; }
}
```

Dots texture overlay: SVG background-image of 2×2px dot pattern at navy 8% opacity, tiled. Applied as `::before` pseudo on hero section.

### Content Positioning
| Property | Value |
|----------|-------|
| Container max-width | `max-w-7xl mx-auto px-8` |
| Content position | Bottom of viewport (flex column, justify-end) |
| Content padding-bottom | 80px desktop, 48px mobile |

### Eyebrow Tag
| Property | Value |
|----------|-------|
| Text | "Discord AI · Bring Your Own Keys" |
| Style | Category tag: `background: rgba(180,231,221,0.2)`, navy text, Inter 13px weight 500 |
| Padding | `4px 14px` |
| Border radius | `0` |
| Margin bottom | 24px |

### Headline
| Property | Value |
|----------|-------|
| Text | "Your Discord server,\npowered by Claude." |
| Font | Archivo Expanded (wdth: 125), weight 700 |
| Size (desktop) | `clamp(56px, 6vw, 80px)` |
| Size (mobile) | `clamp(36px, 8vw, 52px)` |
| Line height | 1.05 |
| Color | Navy (`#0C1F40`) |
| Max width | 800px |
| White space | `pre-line` (to honor the newline in the text) |
| Margin bottom | 24px |

### Subheadline
| Property | Value |
|----------|-------|
| Text | "Bring your own bot token and Anthropic API key. Get an AI operating system for your Discord — with 50+ integrated tools, from GitHub and Linear to Google Calendar and Toggl. No workflow setup. No per-message fees." |
| Font | Inter, 20px, weight 400 |
| Line height | 1.6 |
| Color | Navy at 70% opacity (`rgba(12,31,64,0.7)`) |
| Max width | 640px |
| Margin bottom | 40px |

### CTA Group
```
<div> (flex, row, gap-16px, flex-wrap)
  <a href="/signup"> [Primary button]
  <a href="/docs">  [Secondary button]
```

Primary button:
| Property | Value |
|----------|-------|
| Label | "Start Free — No Credit Card" |
| Variant | Primary (light bg) |
| Height | 44px |
| Padding | `0 28px` |
| Font | Inter, 15px, weight 600 |
| Background | Aqua (`#B4E7DD`) |
| Text | Navy (`#0C1F40`) |
| Border | `1.5px solid #B4E7DD` |
| Border radius | `0` |
| Hover | `opacity: 0.85`, `transition: all 0.2s ease` |

Secondary button:
| Property | Value |
|----------|-------|
| Label | "Read the Docs" |
| `href` | `/docs` |
| Variant | Secondary (light bg) |
| Height | 44px |
| Padding | `0 28px` |
| Font | Inter, 15px, weight 600 |
| Background | Transparent |
| Text | Navy (`#0C1F40`) |
| Border | `1.5px solid #0C1F40` |
| Border radius | `0` |
| Hover | `background: #0C1F40; color: #FFFFFF`, `transition: all 0.2s ease` |

### Social proof line (below CTAs)
| Property | Value |
|----------|-------|
| Text | "Free tier available · Your keys, your costs · Cancel anytime" |
| Font | Inter, 13px, weight 400 |
| Color | Navy at 50% opacity |
| Margin top | 16px |
| Format | Three items separated by `·` (middle dot, `U+00B7`) |

### Responsive Behavior: Hero
| Breakpoint | Changes |
|------------|---------|
| ≤900px (mobile) | Padding: `40px 32px` bottom. Headline font: `clamp(36px, 8vw, 52px)`. Subheadline: 18px. CTA group: `flex-direction: column`, buttons full-width. |
| 768px (tablet) | Intermediate between mobile and desktop. Blobs scale: `transform: scale(0.7)`. |

---

## 3. How It Works Section

### Layout
```
<section id="how-it-works"> (bg-white, py-24)
  <div> (max-w-7xl, mx-auto, px-8)
    Section header (centered)
    3-column step grid
```

### Section Header
| Property | Value |
|----------|-------|
| Section label | "Setup" |
| Label style | Inter, 12px, weight 600, uppercase, letter-spacing 0.1em, opacity 50%, navy, margin-bottom 12px |
| Heading | "Live in three steps." |
| Heading font | Archivo Semi-Expanded (wdth: 112.5), weight 500, `clamp(28px, 3.5vw, 44px)` |
| Heading color | Navy |
| Heading margin bottom | 16px |
| Divider | 48px × 3px, aqua (`#B4E7DD`), border-radius 2px, margin: 24px auto (centered) |
| Subheadline | "No infrastructure to manage. No workflows to configure. Just connect your keys and go." |
| Subheadline font | Inter, 18px, weight 400, navy at 70% opacity, max-width 560px, centered |
| Subheadline margin bottom | 64px |

### Step Grid
| Property | Value |
|----------|-------|
| Layout | CSS Grid, 3 columns (desktop), 1 column (mobile) |
| Gap | 24px |
| Alignment | Top-aligned |

**Step 1: Create your Discord bot**
| Property | Value |
|----------|-------|
| Step number | "01" — Archivo Expanded wdth:125, 80px, weight 700, aqua (`#B4E7DD`) |
| Heading | "Create your Discord bot" |
| Heading font | Archivo Semi-Expanded wdth:112.5, 22px, weight 400, navy |
| Heading margin | 16px top, 12px bottom |
| Body | "Head to the Discord Developer Portal and create a new application. Enable the Message Content Intent. Copy your bot token and your server (guild) ID." |
| Body font | Inter, 16px, weight 400, navy at 70% opacity, line-height 1.7 |
| Left accent stripe | 6px wide stripe on left edge: three bands (30% aqua / 35% periwinkle / 60% aqua) |
| Card padding | 24px |
| Card background | White |
| Card border | none |
| Card border-radius | 0 |

**Step 2: Paste your keys**
| Property | Value |
|----------|-------|
| Step number | "02" — same as above |
| Heading | "Paste your keys" |
| Body | "Sign up for Daimon, then paste your Discord bot token, guild ID, and Anthropic API key into the dashboard. That's it — Daimon stores them encrypted. Your keys never leave our database unencrypted." |

**Step 3: Bot goes live**
| Property | Value |
|----------|-------|
| Step number | "03" — same as above |
| Heading | "Your bot goes live" |
| Body | "Within seconds, your bot connects to your server. Mention it in any channel and it picks the right tools automatically — no commands, no configuration. Claude handles the rest." |

### Responsive Behavior: How It Works
| Breakpoint | Change |
|------------|--------|
| ≤900px | Grid becomes 1 column. Step numbers shrink to 60px. |

---

## 4. Features / Capabilities Grid

### Layout
```
<section id="features"> (bg-white-soft: #F7F7F7, py-24)
  <div> (max-w-7xl, mx-auto, px-8)
    Section header
    Feature grid (3 columns × 3 rows = 9 cards)
```

### Section Header
| Property | Value |
|----------|-------|
| Section label | "Capabilities" |
| Heading | "50+ tools. Zero configuration." |
| Divider | 48px × 3px aqua, centered |
| Subheadline | "Every tool is available out of the box. Connect your services once — Claude figures out when to use them." |
| Subheadline max-width | 560px, centered |

### Feature Cards Grid
| Property | Value |
|----------|-------|
| Layout | CSS Grid, 3 columns (desktop), 2 columns (tablet ≥600px), 1 column (mobile) |
| Gap | 24px |

Each card:
| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border radius | 0 |
| Padding | 28px |
| Left accent stripe | CI stripe (30%/35%/60% aqua/periwinkle bands), 6px wide |
| Hover | `opacity: 0.92`, `transition: opacity 0.2s ease` |

**Card 1: Developer Tools**
| Property | Value |
|----------|-------|
| Icon | `</>` code icon, 24px, aqua |
| Heading | "Developer Tools" |
| Body | "Browse and create GitHub issues, review PRs, query Linear tickets, run shell commands. Your entire dev workflow, in chat." |
| Tag | Category tag: "GitHub · Linear · Shell" |

**Card 2: Time & Tasks**
| Property | Value |
|----------|-------|
| Icon | Clock icon, 24px, aqua |
| Heading | "Time & Tasks" |
| Body | "Track time in Toggl with natural language. Create tasks, log hours, and query your time entries — all from Discord." |
| Tag | "Toggl · Tasks" |

**Card 3: Knowledge & Research**
| Property | Value |
|----------|-------|
| Icon | Search/book icon, 24px, aqua |
| Heading | "Knowledge & Research" |
| Body | "Web search, Wikipedia lookup, URL reading, ArXiv papers, Wikipedia disambiguation — Claude retrieves and synthesizes." |
| Tag | "Web · Wikipedia · ArXiv" |

**Card 4: Calendar & Scheduling**
| Property | Value |
|----------|-------|
| Icon | Calendar icon, 24px, aqua |
| Heading | "Calendar & Scheduling" |
| Body | "Query Google Calendar, create events, check availability. Schedule with context from your other tools." |
| Tag | "Google Calendar" |

**Card 5: Files & Docs**
| Property | Value |
|----------|-------|
| Icon | Document icon, 24px, aqua |
| Heading | "Files & Docs" |
| Body | "Read and write Google Docs, Google Sheets, and Notion. Upload and retrieve files from Google Drive. Manage content without leaving Discord." |
| Tag | "Google Docs · Drive · Notion" |

**Card 6: Memory & Context**
| Property | Value |
|----------|-------|
| Icon | Brain/memory icon, 24px, aqua |
| Heading | "Memory & Context" |
| Body | "Daimon remembers. It stores notes and context that persist across conversations, giving you continuity across your server's history." |
| Tag | "Built-in memory" |

**Card 7: Communication**
| Property | Value |
|----------|-------|
| Icon | Chat bubble icon, 24px, aqua |
| Heading | "Communication" |
| Body | "Send emails via Gmail, draft messages, search your inbox. Manage Slack workspaces you've connected." |
| Tag | "Gmail · Slack" |

**Card 8: Media & Images**
| Property | Value |
|----------|-------|
| Icon | Image icon, 24px, aqua |
| Heading | "Media & Images" |
| Body | "Generate images with DALL-E, search for photos, process attachments. Visual AI capabilities within Discord." |
| Tag | "DALL-E · Media" |

**Card 9: Bring Your Own Keys**
| Property | Value |
|----------|-------|
| Icon | Key icon, 24px, periwinkle (`#9FAAE2`) |
| Heading | "You control the costs" |
| Body | "Every token your bot uses is charged to your Anthropic account directly. Daimon only charges a small platform fee. No per-message markups." |
| Tag | "BYOK model" |
| Background | Light periwinkle tint: `rgba(159,170,226,0.06)` instead of white |

### Feature grid responsive
| Breakpoint | Change |
|------------|--------|
| ≤900px | 1 column. Full width cards. |
| 600px–900px | 2 columns. |

---

## 5. Integrations Strip

### Layout
```
<section> (bg-white, py-20)
  <div> (max-w-7xl, mx-auto, px-8)
    Section label
    Heading
    Logo strip (horizontal scroll or grid)
```

### Section Header
| Property | Value |
|----------|-------|
| Section label | "Integrations" |
| Heading | "Connect the services you already use." |
| Subheadline | "OAuth in one click for the big ones. Paste an API key for the rest." |

### Logo Strip
A horizontal row (with overflow scroll on mobile) of service logos/wordmarks:

| Service | Auth type | Logo style |
|---------|-----------|-----------|
| GitHub | OAuth | GitHub Octocat wordmark, navy |
| Google | OAuth | "Google" wordmark (coloring toned to navy per brand) |
| Linear | OAuth | Linear icon wordmark, navy |
| Toggl | API key | Toggl wordmark, navy |
| Notion | API key | Notion wordmark, navy |
| Slack | API key | Slack wordmark, navy |
| Gmail | OAuth (Google) | Gmail wordmark, navy |
| Google Calendar | OAuth (Google) | GCal wordmark, navy |
| Google Drive | OAuth (Google) | GDrive wordmark, navy |
| DALL-E / OpenAI | API key (optional) | OpenAI wordmark, navy |
| Anthropic | API key (required) | "Claude" wordmark, navy |

Layout:
| Property | Value |
|----------|-------|
| Display | Flex row, `flex-wrap: wrap`, gap 40px, justify-center |
| Logo opacity | 50% default, 100% on hover |
| Transition | `opacity 0.2s ease` |
| Logo height | 28px (uniform) |
| Margin top | 48px |

Below the logos:
| Property | Value |
|----------|-------|
| Text | "+ more services coming soon" |
| Font | Inter, 14px, navy at 40% opacity, centered |
| Margin top | 24px |

---

## 6. Pricing Section

### Layout
```
<section id="pricing"> (bg-white-soft: #F7F7F7, py-24)
  <div> (max-w-7xl, mx-auto, px-8)
    Section header
    Billing toggle (monthly / annual)
    3-column pricing grid
    BYOK explanation note
```

### Section Header
| Property | Value |
|----------|-------|
| Section label | "Pricing" |
| Heading | "Simple pricing. Your API costs stay yours." |
| Divider | 48px × 3px aqua, centered |
| Subheadline | "Daimon charges a small platform fee. You pay Anthropic directly for AI usage. No per-message markup, no hidden fees." |

### Billing Toggle
| Property | Value |
|----------|-------|
| Options | "Monthly" · "Annual" |
| Default | Monthly |
| Annual badge | "Save 20%" — status tag: solid aqua, navy text, Inter 12px weight 600 |
| Toggle style | Two buttons side by side, active has aqua background + navy text, inactive has transparent background + navy text at 60% |
| Height | 38px |
| Font | Inter, 14px, weight 500 |
| Border | `1.5px solid rgba(12,31,64,0.15)` around container |
| Transition | `background 0.15s ease` on active state |

### Pricing Grid
| Property | Value |
|----------|-------|
| Layout | 3 columns (desktop), 1 column (mobile) |
| Gap | 24px |

**Plan: Free**
| Property | Value |
|----------|-------|
| Card background | White |
| Card border | `1.5px solid rgba(12,31,64,0.1)` |
| Card border-radius | 0 |
| Card padding | 32px |
| Plan name | "Free" — Inter, 14px, weight 600, uppercase, letter-spacing 0.08em, navy at 50% |
| Price (monthly) | "$0" — Archivo Expanded wdth:125, 48px, weight 700, navy |
| Price subtext | "/ month" — Inter, 16px, navy at 50% |
| Annual price | Same: "$0" |
| Price description | "Forever free. Bring your own Anthropic key." |
| Divider | `1px solid rgba(12,31,64,0.08)`, margin: 24px 0 |
| CTA button | "Get Started Free" — Secondary variant (navy border, transparent bg), full width, 44px |
| Feature list heading | "What's included" — Inter, 12px, uppercase, letter-spacing 0.08em, navy at 40% |
| Features | Bulleted list (custom bullet: 6px × 6px aqua square) — see feature list below |

Free features:
- 1 Discord connection
- 1 guild (server)
- All 50+ tools available
- Bring your own Anthropic API key
- Bring your own service credentials
- Community support (docs only)
- Supabase-based BYOK storage

**Plan: Starter** *(Most Popular)*
| Property | Value |
|----------|-------|
| Card background | Navy (`#0C1F40`) |
| Card border | none |
| Card border-radius | 0 |
| Card padding | 32px |
| "Most Popular" badge | Solid aqua tag at top-right of card: Inter 12px weight 600, `4px 14px` padding, border-radius 0 |
| Plan name | "Starter" — Inter, 14px, weight 600, uppercase, letter-spacing 0.08em, white at 50% |
| Price (monthly) | "$9" — Archivo Expanded wdth:125, 48px, weight 700, white |
| Annual price | "$6.58" (billed $79/yr) |
| Price subtext | "/ month" — Inter, 16px, white at 50% |
| Price description | "A small platform fee. You pay Anthropic separately." |
| Divider | `1px solid rgba(255,255,255,0.1)`, margin: 24px 0 |
| CTA button | "Start Starter Plan" — Primary (dark bg variant): aqua bg, navy text, full width, 44px |
| Feature list heading | White at 40% opacity |
| Bullet | 6px × 6px aqua square |
| All text | White |

Starter features:
- Everything in Free
- Priority email support (48hr response)
- Dashboard analytics (bot activity overview)
- Connection health monitoring
- 30-day audit log

**Plan: Pro**
| Property | Value |
|----------|-------|
| Card background | White |
| Card border | `1.5px solid rgba(12,31,64,0.1)` |
| Card border-radius | 0 |
| Card padding | 32px |
| Plan name | "Pro" — Inter, 14px, weight 600, uppercase, letter-spacing 0.08em, navy at 50% |
| Price (monthly) | "$29" — Archivo Expanded wdth:125, 48px, weight 700, navy |
| Annual price | "$20.75" (billed $249/yr) |
| Price subtext | "/ month" — Inter, 16px, navy at 50% |
| Price description | "For teams and power users." |
| Divider | `1px solid rgba(12,31,64,0.08)` |
| CTA button | "Start Pro Plan" — Secondary variant (navy border), full width, 44px |

Pro features:
- Everything in Starter
- Up to 5 Discord connections (multi-server)
- Team members (up to 5)
- Priority support (24hr, dedicated Slack channel)
- Advanced analytics (usage by tool, by user)
- 90-day audit log
- Custom bot name configuration (future)
- Early access to new integrations

### BYOK Note (below pricing grid)
| Property | Value |
|----------|-------|
| Container | Centered, max-width 640px |
| Background | `rgba(180,231,221,0.15)` (light aqua tint) |
| Border | `1px solid rgba(180,231,221,0.4)` |
| Padding | 20px 24px |
| Border-radius | 0 |
| Icon | Info circle, 16px, navy at 60% |
| Text | "**How BYOK pricing works**: Daimon charges only the platform fee above. Your bot's AI usage (Claude API calls) is billed directly from Anthropic to your API key. You keep full visibility and control over your AI spending." |
| Text font | Inter, 14px, navy at 70% |
| "How BYOK pricing works" | Bold, navy |
| Margin top | 32px |

### Pricing Responsive Behavior
| Breakpoint | Change |
|------------|--------|
| ≤900px | 1 column. Cards stack vertically. Starter card maintains navy bg. |

---

## 7. FAQ Section

### Layout
```
<section id="faq"> (bg-white, py-24)
  <div> (max-w-4xl, mx-auto, px-8)
    Section header
    Accordion FAQ items (12 questions)
```

### Section Header
| Property | Value |
|----------|-------|
| Section label | "FAQ" |
| Heading | "Common questions." |
| Margin bottom | 48px |

### FAQ Accordion Component
| Property | Value |
|----------|-------|
| Item border-bottom | `1px solid rgba(12,31,64,0.08)` |
| Question padding | `20px 0` |
| Question font | Inter, 17px, weight 500, navy |
| Question cursor | pointer |
| Expand icon | `+` (default) / `−` (open), 20px, navy at 60%, float right |
| Answer padding | `0 0 20px 0` |
| Answer font | Inter, 16px, weight 400, navy at 70%, line-height 1.7 |
| Transition | Answer height via `max-height` transition, 0.3s ease |

**FAQ Questions and Answers:**

---

**Q: Do I need to host my own bot?**
A: No. Daimon runs the bot infrastructure for you on Fly.io. You bring your Discord bot token (which you create once in the Discord Developer Portal) — Daimon handles the rest. Your bot stays online 24/7 without you managing servers.

---

**Q: What is BYOK (Bring Your Own Keys)?**
A: BYOK means you provide your own Anthropic API key. When your bot responds to messages in Discord, the AI processing cost goes directly to your Anthropic account. Daimon only charges the small platform fee listed above — we never add a markup to your AI usage.

---

**Q: How do I create a Discord bot token?**
A: Go to discord.com/developers/applications, create a new application, navigate to the "Bot" section, and click "Reset Token" to generate your token. Enable the "Message Content" intent under Privileged Gateway Intents. Copy the token. Also copy your server's ID (right-click your server icon → Copy Server ID). Paste both into your Daimon dashboard. Our [Quick Start guide](/docs#quick-start) has step-by-step screenshots.

---

**Q: Is my bot token stored securely?**
A: Yes. Your Discord bot token and API keys are encrypted at rest using Supabase Vault (AES-256 encryption). They are never returned in API responses or logs. Daimon staff cannot view your credentials.

---

**Q: What services can my bot use?**
A: All 50+ tools are available to every tier. You connect your own accounts for each service (GitHub, Google, Linear, Toggl, Notion, Slack, etc.) and the tools activate. Services you haven't connected simply won't be used.

---

**Q: Can I use my own OpenAI key?**
A: Optionally. Daimon uses Claude (Anthropic) as the primary AI model. Some classification tasks can optionally use OpenAI — if you paste an OpenAI key, it will be used for those tasks. An OpenAI key is not required.

---

**Q: What happens if my Anthropic API key runs out of credits?**
A: The bot will stop responding to messages and Daimon will mark your API key as invalid. Your dashboard will show an error state on the "API Keys" card. Update your key or add Anthropic credits to restore service.

---

**Q: Can I connect multiple Discord servers?**
A: Free and Starter plans support 1 Discord connection. Pro supports up to 5 connections, each pointing to a different Discord server with the same bot token or different tokens.

---

**Q: Is there a free trial for paid plans?**
A: We don't offer a time-limited trial, but the Free tier is genuinely functional — all tools available, no expiration. Upgrade only when you want priority support, analytics, or multi-server support.

---

**Q: How do I cancel?**
A: From your dashboard → Billing → Manage Subscription. This opens the Stripe Customer Portal where you can cancel immediately. Your plan downgrades to Free at the end of your billing period. No data is deleted for 30 days after downgrade.

---

**Q: What if the bot disconnects?**
A: Daimon's health monitoring detects disconnections within 60 seconds and automatically attempts to reconnect using exponential backoff (up to 10 attempts over ~25 minutes). Your dashboard will show a "Reconnecting…" status. If reconnection fails, you'll see an error state with the specific error message from Discord.

---

**Q: Do you offer team plans or enterprise?**
A: Pro supports up to 5 team members. For enterprise needs (more servers, custom SLAs, private deployments), contact us at hello@daimon.ai.

---

### FAQ Responsive
| Breakpoint | Change |
|------------|--------|
| ≤900px | Full width, padding 24px. Font sizes reduce by ~1px. |

---

## 8. Final CTA Banner Section

### Layout
```
<section> (bg-navy: #0C1F40, py-24, relative, overflow-hidden)
  Tier 2 static blob (decorative)
  Content (centered, z-10, relative)
    Heading
    Subheadline
    CTA button
    Supporting text
```

### Background Decoration
Single static blob: 500×500px, aqua at 10%, `border-radius: 50%`, `filter: blur(100px)`, positioned top-right, no animation.

### Content
| Property | Value |
|----------|-------|
| Container | `max-w-3xl mx-auto px-8 text-center` |
| Heading | "Get your AI Discord bot running today." |
| Heading font | Archivo Expanded wdth:125, weight 700, `clamp(32px, 4vw, 52px)`, white |
| Subheadline | "Free tier, no credit card, live in minutes." |
| Subheadline font | Inter, 20px, white at 65% |
| Subheadline margin bottom | 40px |

CTA Button:
| Property | Value |
|----------|-------|
| Label | "Create Your Free Account" |
| `href` | `/signup` |
| Variant | Primary (dark bg) |
| Background | Aqua (`#B4E7DD`) |
| Text | Navy (`#0C1F40`) |
| Height | 44px |
| Padding | `0 36px` |
| Font | Inter, 15px, weight 600 |
| Border radius | 0 |
| Hover | `opacity: 0.85` |

Supporting text:
| Property | Value |
|----------|-------|
| Text | "Or read the docs first → [View Quick Start](/docs)" |
| Font | Inter, 14px, white at 50% |
| Margin top | 16px |
| Link color | Aqua (`#B4E7DD`) |
| Link hover | opacity 0.8 |

### CTA Banner Responsive
| Breakpoint | Change |
|------------|--------|
| ≤900px | Heading font: `clamp(28px, 6vw, 40px)`. Padding: 60px 24px. CTA button full width. |

---

## 9. Footer

### Layout
```
<footer> (bg-navy: #0C1F40, pt-12 pb-8)
  <div> (max-w-7xl, mx-auto, px-8)
    Footer grid (5 columns desktop, 2 columns mobile)
    Divider
    Bottom bar (legal links + copyright)
```

### Footer Grid
| Property | Value |
|----------|-------|
| Grid columns (desktop) | `1.5fr 1fr 1fr 1fr 1fr` |
| Gap | 32px |
| Grid (mobile ≤900px) | `1fr 1fr`, 2 columns |

**Column 1: Brand**
| Property | Value |
|----------|-------|
| Logo | Rocket icon (28px, aqua) + "Daimon" wordmark (Archivo 18px weight 700, aqua) |
| Tagline | "AI-powered Discord, on your terms." |
| Tagline font | Inter, 14px, white at 60%, margin-top 12px, max-width 200px |
| Social links | None at launch |

**Column 2: Product**
| Column header | "PRODUCT" |
| Header style | Inter, 14px, uppercase, letter-spacing 0.08em, white at 45%, margin-bottom 16px |
| Links (label → href): | |
| "Features" | `/#features` |
| "Pricing" | `/#pricing` |
| "Docs" | `/docs` |
| "Changelog" | `/changelog` |
| Link style | Inter, 14px, white at 70%, hover → 100%, gap: 8px between links |

**Column 3: Resources**
| Column header | "RESOURCES" |
| Links: | |
| "Quick Start" | `/docs#quick-start` |
| "Tool Reference" | `/docs#tools` |
| "API Keys Guide" | `/docs#api-keys` |
| "Discord Setup" | `/docs#discord-setup` |

**Column 4: Legal**
| Column header | "LEGAL" |
| Links: | |
| "Terms of Service" | `/legal/terms` |
| "Privacy Policy" | `/legal/privacy` |
| "Cookie Policy" | `/legal/cookies` |

**Column 5: Company**
| Column header | "COMPANY" |
| Links: | |
| "About" | `/about` |
| "Blog" | `/blog` |
| "Contact" | `mailto:hello@daimon.ai` |
| "Status" | `https://status.daimon.ai` (external, `target="_blank"`) |

### Footer Divider
`1px solid rgba(255,255,255,0.1)`, margin: 32px top / 16px bottom

### Bottom Bar
| Property | Value |
|----------|-------|
| Layout | Flex, space-between, align-center |
| Left | "© 2026 Daimon. All rights reserved." — Inter, 14px, white at 40% |
| Right | "Built with Claude · Powered by Anthropic" — Inter, 13px, white at 30% |

### Footer Responsive
| Breakpoint | Change |
|------------|--------|
| ≤900px | Grid: 2 columns. Column 1 (brand) spans both columns. Bottom bar stacks vertically, centered. |

---

## 10. Page-Level Metadata

```html
<title>Daimon — AI Discord Bot, Bring Your Own Keys</title>
<meta name="description" content="Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest. Free to start." />
<meta property="og:title" content="Daimon — AI Discord Bot, Bring Your Own Keys" />
<meta property="og:description" content="Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest." />
<meta property="og:image" content="https://daimon.ai/og/home.png" />
<meta property="og:url" content="https://daimon.ai" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Daimon — AI Discord Bot, Bring Your Own Keys" />
<meta name="twitter:description" content="Get your own AI-powered Discord bot with 50+ integrated tools. Bring your Anthropic API key, connect your services, and Claude handles the rest." />
<meta name="twitter:image" content="https://daimon.ai/og/home.png" />
<link rel="canonical" href="https://daimon.ai" />
```

OG image spec:
| Property | Value |
|----------|-------|
| Dimensions | 1200 × 630px |
| Background | Navy (`#0C1F40`) with aqua blob decorations |
| Main text | "Daimon" in Archivo Expanded wdth:125, 72px, white |
| Sub text | "AI Discord Bot · Bring Your Own Keys" in Inter 24px, white at 70% |
| Logo | Rocket icon, 60px, aqua, top-left |
| Domain | "daimon.ai" bottom-right, Inter 18px, white at 40% |

---

## 11. Performance Requirements

| Requirement | Target |
|------------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID / INP | < 200ms |
| Hero blob animations | `will-change: transform` on blob divs, hardware accelerated |
| Font loading | Next.js `next/font` for Archivo and Inter — no FOUT |
| Blob CSS | Inline in component or `<style>` tag — no flash of unstyled hero |
| Images | `next/image` with explicit width/height, lazy-load below fold |

---

## 12. Smooth Scroll Configuration

In-page anchor links (`#features`, `#pricing`, `#faq`) should use smooth scrolling:
```css
html {
  scroll-behavior: smooth;
}
```

Offset for sticky navbar: Apply `scroll-margin-top: 80px` to each section with an `id` to prevent the sticky nav from covering the section heading on anchor navigation.

---

## 13. Scroll-Triggered Animations (Optional Enhancement)

If `prefers-reduced-motion: no-preference`:

| Element | Animation |
|---------|-----------|
| Section headings | Fade up (opacity 0→1, translateY 24px→0) on intersection |
| Feature cards | Stagger fade up (50ms delay between each) |
| Pricing cards | Fade up, 100ms stagger |
| Step numbers | Counter animation from 0 to final value |

All animations: duration 0.5s, `ease-out`, triggered once when entering viewport (IntersectionObserver).

If `prefers-reduced-motion: reduce`: all animations disabled, elements visible at full opacity immediately.

---

## 14. Cross-References

- Brand values: See [../source/brand-guidelines.md](../source/brand-guidelines.md)
- Pricing tiers feature lists: See [../premium/tiers.md](../premium/tiers.md)
- FAQ answers reference the Docs: See [docs-pages.md](docs-pages.md)
- Component library for buttons/tags/cards: See [component-library.md](component-library.md)
- Complete copy inventory: See [copy.md](copy.md)
- SEO meta tags expanded: See [../seo-and-growth/seo-strategy.md](../seo-and-growth/seo-strategy.md)
- Responsive details: See [responsive-behavior.md](responsive-behavior.md)

# SEO Strategy — Meta Tags, OG Images, Schema.org Markup

> Aspect: 6.5a
> Last updated: 2026-03-13
> Coverage: Every page in the Daimon SaaS website

---

## Global SEO Configuration

### Site-Level Constants

| Constant | Value |
|----------|-------|
| Site name | `Daimon` |
| Base URL (production) | `https://daimon.ai` |
| Default OG image | `https://daimon.ai/og/default.png` |
| Default twitter card | `summary_large_image` |
| Twitter handle | `@daimon_ai` |
| Default locale | `en_US` |
| Theme color | `#0C1F40` (Navy) |
| Robots default | `index, follow` |
| Robots auth/admin pages | `noindex, nofollow` |

### Root `<html>` Attributes

```html
<html lang="en" dir="ltr">
```

### Default `<meta>` Tags (applied globally via `app/layout.tsx`)

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://daimon.ai"),
  title: {
    default: "Daimon — AI Operating System for Discord",
    template: "%s | Daimon",
  },
  description:
    "Daimon connects your Discord server to 50+ tools — GitHub, Linear, Toggl, Google Analytics, and more — powered by Claude AI. Bring your own API key. No subscriptions to your data.",
  keywords: [
    "discord ai bot",
    "discord automation",
    "ai assistant discord",
    "discord productivity bot",
    "claude ai discord",
    "discord github integration",
    "discord linear integration",
    "toggl discord",
    "discord project management",
    "byok ai bot",
    "bring your own api key discord",
    "discord ai operating system",
    "decision orchestrator",
  ],
  authors: [{ name: "PyMC Labs", url: "https://pymc-labs.com" }],
  creator: "PyMC Labs",
  publisher: "PyMC Labs",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://daimon.ai",
    siteName: "Daimon",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "Daimon — AI Operating System for Discord",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@daimon_ai",
    creator: "@daimon_ai",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  themeColor: "#0C1F40",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "GOOGLE_SITE_VERIFICATION_TOKEN", // replace at launch
  },
  alternates: {
    canonical: "https://daimon.ai",
  },
};
```

---

## Per-Page Meta Tags

### 1. Landing Page (`/`)

**File**: `app/(public)/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Daimon — AI Operating System for Discord",
  description:
    "Connect your Discord server to 50+ tools — GitHub, Linear, Toggl, Google Analytics, and more. Powered by Claude AI. Bring your own API key. Get started free.",
  keywords: [
    "discord ai bot",
    "discord automation tools",
    "ai assistant for discord",
    "discord productivity",
    "claude ai discord bot",
    "discord github bot",
    "discord linear bot",
    "discord toggl integration",
    "byok discord bot",
    "discord ai operating system",
  ],
  openGraph: {
    title: "Daimon — AI Operating System for Discord",
    description:
      "50+ tools. Your own API key. Claude-powered. Connect GitHub, Linear, Toggl, and more to your Discord server in minutes.",
    url: "https://daimon.ai",
    type: "website",
    images: [
      {
        url: "/og/landing.png",
        width: 1200,
        height: 630,
        alt: "Daimon — AI Operating System for Discord. 50+ tools, your API key, Claude-powered.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daimon — AI Operating System for Discord",
    description:
      "50+ tools. Your own API key. Claude-powered. Connect GitHub, Linear, Toggl, and more to your Discord server in minutes.",
    images: ["/og/landing.png"],
  },
  alternates: {
    canonical: "https://daimon.ai",
  },
};
```

**Schema.org markup** (injected as `<script type="application/ld+json">` in `app/(public)/page.tsx`):

```json
[
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Daimon",
    "url": "https://daimon.ai",
    "description": "AI Operating System for Discord — 50+ tools, BYOK, Claude-powered",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://daimon.ai/docs?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PyMC Labs",
    "url": "https://pymc-labs.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://daimon.ai/logo.png",
      "width": 512,
      "height": 512
    },
    "sameAs": [
      "https://twitter.com/daimon_ai",
      "https://github.com/pymc-labs"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@daimon.ai",
      "contactType": "customer support"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Daimon",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Productivity",
    "operatingSystem": "Discord",
    "url": "https://daimon.ai",
    "description": "Daimon is an AI operating system for Discord that connects 50+ tools including GitHub, Linear, Toggl, and Google Analytics. Powered by Claude AI with bring-your-own-API-key.",
    "screenshot": "https://daimon.ai/og/landing.png",
    "featureList": [
      "Discord bot integration",
      "GitHub integration",
      "Linear project management",
      "Toggl time tracking",
      "Google Analytics",
      "Claude AI powered",
      "Bring your own API key",
      "50+ tools"
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "1 Discord server, 5 service connections, 100 tool calls/day",
        "url": "https://daimon.ai/#pricing"
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "9",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "9",
          "priceCurrency": "USD",
          "unitText": "MONTH"
        },
        "description": "1 Discord server, 20 service connections, 1,000 tool calls/day",
        "url": "https://daimon.ai/#pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "29",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "29",
          "priceCurrency": "USD",
          "unitText": "MONTH"
        },
        "description": "3 Discord servers, unlimited service connections, unlimited tool calls",
        "url": "https://daimon.ai/#pricing"
      }
    ],
    "provider": {
      "@type": "Organization",
      "name": "PyMC Labs",
      "url": "https://pymc-labs.com"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Daimon?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Daimon is an AI operating system for Discord that connects your server to 50+ tools — GitHub, Linear, Toggl, Google Analytics, and more — powered by Claude AI. You bring your own Anthropic API key and Discord bot token."
        }
      },
      {
        "@type": "Question",
        "name": "How does bring-your-own-key work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You provide your own Anthropic API key in the Daimon dashboard. All AI requests are billed directly to your Anthropic account. Daimon charges a small platform fee to cover hosting and infrastructure."
        }
      },
      {
        "@type": "Question",
        "name": "Is Daimon free to try?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The Free plan lets you connect 1 Discord server, use 5 service integrations, and make up to 100 tool calls per day at no cost. No credit card required to start."
        }
      },
      {
        "@type": "Question",
        "name": "What integrations does Daimon support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Daimon supports GitHub (issues, PRs, repos), Linear (issues, projects, comments), Toggl Track (time entries, projects, reports), Google Analytics, Google Workspace, Fly.io deployments, LinkedIn, and more — over 50 tools in total."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install anything?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No local installation is required. You create a Discord bot in the Discord Developer Portal, paste the bot token and your guild ID into the Daimon dashboard, add your Anthropic API key, and the bot comes online automatically."
        }
      }
    ]
  }
]
```

---

### 2. Login Page (`/login`)

**File**: `app/(auth)/login/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Daimon account to manage your Discord AI bot.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sign In — Daimon",
    description: "Sign in to your Daimon account.",
    url: "https://daimon.ai/login",
    images: [{ url: "/og/auth.png", width: 1200, height: 630, alt: "Sign in to Daimon" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In — Daimon",
    description: "Sign in to your Daimon account.",
    images: ["/og/auth.png"],
  },
  alternates: { canonical: "https://daimon.ai/login" },
};
```

**Note**: `robots: noindex, nofollow` — auth pages must not be indexed.

**Schema.org**: None required on auth pages.

---

### 3. Sign Up Page (`/signup`)

**File**: `app/(auth)/signup/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Get Started Free",
  description:
    "Create your free Daimon account. Connect your Discord server to 50+ tools powered by Claude AI. No credit card required.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Get Started Free — Daimon",
    description: "Create a free account. Connect your Discord server to Claude AI in minutes.",
    url: "https://daimon.ai/signup",
    images: [{ url: "/og/auth.png", width: 1200, height: 630, alt: "Create your Daimon account" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Started Free — Daimon",
    description: "Create a free account. Connect your Discord server to Claude AI in minutes.",
    images: ["/og/auth.png"],
  },
  alternates: { canonical: "https://daimon.ai/signup" },
};
```

---

### 4. Reset Password Page (`/reset-password`)

**File**: `app/(auth)/reset-password/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Daimon account password.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Reset Password — Daimon",
    description: "Reset your Daimon account password.",
    url: "https://daimon.ai/reset-password",
    images: [{ url: "/og/auth.png", width: 1200, height: 630, alt: "Reset your Daimon password" }],
  },
  alternates: { canonical: "https://daimon.ai/reset-password" },
};
```

---

### 5. Reset Password Confirm (`/reset-password/confirm`)

**File**: `app/(auth)/reset-password/confirm/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a new password for your Daimon account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://daimon.ai/reset-password/confirm" },
};
```

---

### 6. Dashboard Home (`/dashboard`)

**File**: `app/(dashboard)/dashboard/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your Daimon bot, view status, and monitor tool activity.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://daimon.ai/dashboard" },
};
```

**Note**: All `/dashboard/**` routes use `robots: noindex, nofollow`. No OG/Twitter cards are needed for auth-gated pages.

---

### 7. Integrations Page (`/dashboard/integrations`)

**File**: `app/(dashboard)/dashboard/integrations/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Integrations",
  description: "Connect GitHub, Linear, Toggl, Google, and more to your Discord bot.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://daimon.ai/dashboard/integrations" },
};
```

---

### 8. Billing Page (`/dashboard/billing`)

**File**: `app/(dashboard)/dashboard/billing/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your Daimon plan, API keys, and billing details.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://daimon.ai/dashboard/billing" },
};
```

---

### 9. Settings Page (`/dashboard/settings`)

**File**: `app/(dashboard)/dashboard/settings/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your Daimon account and Discord connection settings.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://daimon.ai/dashboard/settings" },
};
```

---

### 10. Admin Panel (`/admin`)

**File**: `app/(admin)/admin/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Admin",
  description: "Daimon platform administration.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://daimon.ai/admin" },
};
```

---

### 11. Admin Tenant Detail (`/admin/tenants/[id]`)

**File**: `app/(admin)/admin/tenants/[id]/page.tsx`

```tsx
// Generated dynamically — base metadata:
export const metadata: Metadata = {
  title: "Tenant Detail",
  description: "Daimon platform tenant administration.",
  robots: { index: false, follow: false },
};
```

---

### 12. Docs Root (`/docs`)

**File**: `app/(public)/docs/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to set up and use Daimon — the AI operating system for Discord. Quick start guide, tool reference, billing, and FAQ.",
  openGraph: {
    title: "Daimon Documentation",
    description:
      "Everything you need to connect your Discord server to 50+ AI-powered tools. Quick start, tool reference, billing guides.",
    url: "https://daimon.ai/docs",
    type: "website",
    images: [
      {
        url: "/og/docs.png",
        width: 1200,
        height: 630,
        alt: "Daimon Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daimon Documentation",
    description:
      "Everything you need to connect your Discord server to 50+ AI-powered tools.",
    images: ["/og/docs.png"],
  },
  alternates: { canonical: "https://daimon.ai/docs" },
};
```

**Schema.org**:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Daimon Documentation",
  "url": "https://daimon.ai/docs",
  "description": "Learn how to set up and use Daimon — the AI operating system for Discord.",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://daimon.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Documentation",
        "item": "https://daimon.ai/docs"
      }
    ]
  }
}
```

---

### 13. Docs: Quick Start (`/docs/quickstart`)

**File**: `app/(public)/docs/quickstart/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Quick Start Guide",
  description:
    "Set up your Daimon Discord bot in 5 minutes. Step-by-step guide from account creation to your first AI command.",
  openGraph: {
    title: "Quick Start Guide — Daimon Docs",
    description:
      "Set up your Daimon Discord bot in 5 minutes. Step-by-step guide from account creation to your first AI command.",
    url: "https://daimon.ai/docs/quickstart",
    images: [
      {
        url: "/og/docs-quickstart.png",
        width: 1200,
        height: 630,
        alt: "Daimon Quick Start Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Start Guide — Daimon Docs",
    description: "Set up your Daimon Discord bot in 5 minutes.",
    images: ["/og/docs-quickstart.png"],
  },
  alternates: { canonical: "https://daimon.ai/docs/quickstart" },
};
```

**Schema.org**:

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up Your Daimon Discord Bot",
  "description": "Step-by-step guide to setting up Daimon — the AI operating system for Discord.",
  "url": "https://daimon.ai/docs/quickstart",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "totalTime": "PT5M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Create your Daimon account",
      "text": "Sign up at daimon.ai/signup with your email address. No credit card required for the free plan.",
      "url": "https://daimon.ai/docs/quickstart#step-1"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Create your Discord bot",
      "text": "Go to discord.com/developers/applications, create a new application, enable the bot, copy the bot token, and invite the bot to your server.",
      "url": "https://daimon.ai/docs/quickstart#step-2"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Get your Anthropic API key",
      "text": "Sign up at console.anthropic.com, create an API key, and add billing to your Anthropic account.",
      "url": "https://daimon.ai/docs/quickstart#step-3"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Connect your bot to Daimon",
      "text": "In the Daimon dashboard Settings page, paste your Discord bot token and guild ID. Click Save. Your bot will come online within 30 seconds.",
      "url": "https://daimon.ai/docs/quickstart#step-4"
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Add your Anthropic API key",
      "text": "In the Daimon dashboard Billing page, paste your Anthropic API key. Daimon will validate it and activate AI capabilities.",
      "url": "https://daimon.ai/docs/quickstart#step-5"
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Send your first command",
      "text": "In any Discord channel where your bot is present, mention the bot or use a slash command. Try: @Daimon what's on my GitHub issues list?",
      "url": "https://daimon.ai/docs/quickstart#step-6"
    }
  ],
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://daimon.ai" },
      { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://daimon.ai/docs" },
      { "@type": "ListItem", "position": 3, "name": "Quick Start", "item": "https://daimon.ai/docs/quickstart" }
    ]
  }
}
```

---

### 14. Docs: Tool Reference (`/docs/tools`)

**File**: `app/(public)/docs/tools/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Tool Reference",
  description:
    "Complete reference for all 50+ tools in Daimon — Discord, GitHub, Linear, Toggl, Google Analytics, Fly.io, LinkedIn, and more.",
  openGraph: {
    title: "Tool Reference — Daimon Docs",
    description:
      "Complete reference for all 50+ tools in Daimon. Discord, GitHub, Linear, Toggl, Google Analytics, and more.",
    url: "https://daimon.ai/docs/tools",
    images: [
      {
        url: "/og/docs-tools.png",
        width: 1200,
        height: 630,
        alt: "Daimon Tool Reference — 50+ AI-powered tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tool Reference — Daimon Docs",
    description: "Complete reference for all 50+ tools in Daimon.",
    images: ["/og/docs-tools.png"],
  },
  alternates: { canonical: "https://daimon.ai/docs/tools" },
};
```

**Schema.org**:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Daimon Tool Reference",
  "description": "Complete reference for all 50+ tools available in Daimon, organized by integration category.",
  "url": "https://daimon.ai/docs/tools",
  "author": {
    "@type": "Organization",
    "name": "PyMC Labs"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PyMC Labs",
    "logo": {
      "@type": "ImageObject",
      "url": "https://daimon.ai/logo.png"
    }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://daimon.ai" },
      { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://daimon.ai/docs" },
      { "@type": "ListItem", "position": 3, "name": "Tool Reference", "item": "https://daimon.ai/docs/tools" }
    ]
  }
}
```

---

### 15. Docs: Billing & Plans (`/docs/billing`)

**File**: `app/(public)/docs/billing/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "Billing & Plans",
  description:
    "Understanding Daimon's pricing plans — Free, Starter, and Pro. Feature comparison, upgrade flows, and BYOK billing explained.",
  openGraph: {
    title: "Billing & Plans — Daimon Docs",
    description:
      "Free, Starter ($9/mo), and Pro ($29/mo) plans. BYOK — you only pay Anthropic for actual AI usage.",
    url: "https://daimon.ai/docs/billing",
    images: [
      {
        url: "/og/docs-billing.png",
        width: 1200,
        height: 630,
        alt: "Daimon Billing & Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Billing & Plans — Daimon Docs",
    description: "Free, Starter, and Pro plans. BYOK — pay only for what you use.",
    images: ["/og/docs-billing.png"],
  },
  alternates: { canonical: "https://daimon.ai/docs/billing" },
};
```

**Schema.org**:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Daimon Billing & Plans Documentation",
  "url": "https://daimon.ai/docs/billing",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://daimon.ai" },
      { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://daimon.ai/docs" },
      { "@type": "ListItem", "position": 3, "name": "Billing & Plans", "item": "https://daimon.ai/docs/billing" }
    ]
  }
}
```

---

### 16. Docs: FAQ (`/docs/faq`)

**File**: `app/(public)/docs/faq/page.tsx`

```tsx
export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Daimon — billing, security, bot setup, API keys, troubleshooting, and limits.",
  openGraph: {
    title: "FAQ — Daimon Docs",
    description:
      "Answers to common questions about Daimon — billing, security, bot setup, API keys, troubleshooting, and usage limits.",
    url: "https://daimon.ai/docs/faq",
    images: [
      {
        url: "/og/docs-faq.png",
        width: 1200,
        height: 630,
        alt: "Daimon FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Daimon Docs",
    description: "Answers to common questions about Daimon.",
    images: ["/og/docs-faq.png"],
  },
  alternates: { canonical: "https://daimon.ai/docs/faq" },
};
```

**Schema.org** (FAQPage — full set of Q&As):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need a credit card to sign up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The Free plan requires no credit card. You only need to add a payment method when upgrading to Starter or Pro."
      }
    },
    {
      "@type": "Question",
      "name": "What is BYOK (Bring Your Own Key)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BYOK means you provide your own Anthropic API key. All AI usage (Claude model calls) is billed directly to your Anthropic account. Daimon charges a separate platform fee ($9/mo Starter or $29/mo Pro) to cover hosting and infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "How do I get an Anthropic API key?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Go to console.anthropic.com, create an account, navigate to API Keys, and click Create Key. You also need to add a payment method in your Anthropic account for API usage billing."
      }
    },
    {
      "@type": "Question",
      "name": "Is my API key stored securely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All API keys are encrypted at rest using Supabase Vault (AES-256-GCM) before storage. Keys are only decrypted in memory at the time of use and are never logged or transmitted in plaintext."
      }
    },
    {
      "@type": "Question",
      "name": "How do I create a Discord bot?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Go to discord.com/developers/applications and click New Application. Give it a name, then go to the Bot section and click Add Bot. Under Token, click Reset Token to get your bot token. Enable the Message Content Intent under Privileged Gateway Intents. Then use the OAuth2 URL Generator to invite the bot to your server with bot and applications.commands scopes."
      }
    },
    {
      "@type": "Question",
      "name": "What Discord permissions does the bot need?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The bot requires: Read Messages/View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Add Reactions, and Use Application Commands (slash commands). Enable the Message Content Privileged Intent in the Discord Developer Portal."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take for the bot to come online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "After you save your Discord bot token and guild ID in Settings, the bot typically connects within 30 seconds. The dashboard status indicator will turn green (Online) when the connection is established."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if my bot token is invalid?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If the bot token is invalid or has been regenerated in the Discord Developer Portal, the bot will fail to connect and the status will show Error. You will see an error message in the Settings page. Update the token to the new value and save to reconnect."
      }
    },
    {
      "@type": "Question",
      "name": "Can I connect multiple Discord servers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Pro plan allows up to 3 Discord server connections. The Free and Starter plans are limited to 1 server. Each connection requires its own bot token and guild ID."
      }
    },
    {
      "@type": "Question",
      "name": "What are the tool call limits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free: 100 tool calls per day. Starter: 1,000 tool calls per day. Pro: Unlimited. Tool call limits reset at midnight UTC. The dashboard shows your current usage."
      }
    },
    {
      "@type": "Question",
      "name": "What integrations does Daimon support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Daimon supports: Discord (7 tools), GitHub (1 tool via MCP), Google Workspace, Google Analytics (4 tools), Linear (6 tools via MCP), LinkedIn (17 tools), Toggl Track (34 tools), Fly.io (9 tools), Dub.co (2 tools), and more. Connect integrations via the Integrations page in your dashboard."
      }
    },
    {
      "@type": "Question",
      "name": "How do I connect GitHub?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Go to the Integrations page in your dashboard and click Connect on the GitHub card. You will be redirected to GitHub to authorize Daimon. After authorization, GitHub tools become available in your Discord bot immediately."
      }
    },
    {
      "@type": "Question",
      "name": "How do I connect Toggl?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Toggl uses API key authentication. Go to the Integrations page, click Connect on the Toggl card, and paste your Toggl API token. Find your Toggl API token at toggl.com/app/profile at the bottom of the page."
      }
    },
    {
      "@type": "Question",
      "name": "Can I cancel my subscription at any time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can cancel anytime from the Billing page by clicking Manage Subscription. Your paid plan remains active until the end of the billing period. After cancellation, your account downgrades to the Free plan."
      }
    },
    {
      "@type": "Question",
      "name": "What data does Daimon store?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Daimon stores: your account email, encrypted API keys and service tokens, bot connection status and configuration, tool call usage counts (not content), and conversation metadata for Langfuse observability. Daimon does not store the content of Discord messages or tool call responses."
      }
    },
    {
      "@type": "Question",
      "name": "How do I delete my account?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Go to Settings → Danger Zone and click Delete Account. This immediately disconnects your bot, cancels any active subscription, and schedules deletion of all your data within 30 days per our data retention policy."
      }
    }
  ],
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://daimon.ai" },
      { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://daimon.ai/docs" },
      { "@type": "ListItem", "position": 3, "name": "FAQ", "item": "https://daimon.ai/docs/faq" }
    ]
  }
}
```

---

## OG Image Specifications

All OG images are 1200×630px PNG files, stored in `public/og/`. They are generated at build time using `@vercel/og` (Edge Runtime) via `app/og/route.tsx` where dynamic, or pre-rendered as static PNGs for fixed pages.

### OG Image Inventory

| File | Route(s) | Generation | Description |
|------|----------|------------|-------------|
| `/og/default.png` | Fallback for all pages | Static pre-rendered | Generic Daimon branding |
| `/og/landing.png` | `/` | Static pre-rendered | Hero variant with tagline |
| `/og/auth.png` | `/login`, `/signup`, `/reset-password` | Static pre-rendered | Minimal logo card |
| `/og/docs.png` | `/docs` | Static pre-rendered | Documentation landing |
| `/og/docs-quickstart.png` | `/docs/quickstart` | Static pre-rendered | Quick Start guide |
| `/og/docs-tools.png` | `/docs/tools` | Static pre-rendered | Tool Reference |
| `/og/docs-billing.png` | `/docs/billing` | Static pre-rendered | Billing & Plans |
| `/og/docs-faq.png` | `/docs/faq` | Static pre-rendered | FAQ |

### OG Image Design Specification

#### Dimensions & Format

| Property | Value |
|----------|-------|
| Width | 1200px |
| Height | 630px |
| Format | PNG |
| Color space | sRGB |
| Resolution | 72 DPI |

#### Default OG Image (`/og/default.png`)

Layout: Full bleed navy background with centered content.

| Layer | Description |
|-------|-------------|
| Background | Navy `#0C1F40` solid fill |
| Gradient overlay | Radial gradient from `rgba(180,231,221,0.15)` (aqua 15%) center-left, fading to transparent |
| Logo | SVG rocket icon 64×64px, aqua `#B4E7DD`, centered horizontally, 220px from top |
| Wordmark | "Daimon" in Archivo Expanded wdth:125, weight 700, 56px, white `#FFFFFF`, 16px gap below icon |
| Tagline | "AI Operating System for Discord" in Inter weight 400, 24px, white 80% opacity, 12px below wordmark |
| Bottom border | 4px aqua `#B4E7DD` strip at y=626 (bottom 4px) |

#### Landing Page OG Image (`/og/landing.png`)

Layout: Navy background, hero-style with product tagline.

| Layer | Description |
|-------|-------------|
| Background | Navy `#0C1F40` |
| Gradient blobs | Two soft radial blobs: blob1 at (200,200) radius 280, aqua 12% opacity; blob2 at (900,400) radius 320, periwinkle `#9FAAE2` 10% opacity |
| Logo row | SVG rocket icon 48×48px + "Daimon" Archivo Expanded wdth:125 700 40px white — positioned at top-left, 60px from top-left corner |
| Main headline | "AI Operating System" — Archivo Expanded wdth:125, weight 700, 64px, white, centered, y=240 |
| Sub headline | "for Discord" — Archivo Expanded wdth:125, weight 700, 64px, aqua `#B4E7DD`, centered, y=312 |
| Body copy | "50+ tools. Your API key. Claude-powered." — Inter 400 24px, white 70% opacity, centered, y=396 |
| CTA badge | Rounded pill 200×44px, aqua `#B4E7DD` fill, navy text Inter 700 16px, "Get Started Free", centered, y=460 |
| Bottom bar | 4px aqua strip at bottom |

#### Auth OG Image (`/og/auth.png`)

Layout: White-soft background, centered card-style.

| Layer | Description |
|-------|-------------|
| Background | White Soft `#F7F7F7` |
| Card | 560×280px rounded (24px radius), white `#FFFFFF`, shadow `0 8px 40px rgba(12,31,64,0.12)`, centered |
| Logo inside card | Rocket icon 40×40px navy + "Daimon" Archivo Expanded 700 32px navy |
| Tagline inside card | "Your Discord AI Bot Dashboard" Inter 400 20px navy 60% opacity |
| Top accent bar on card | 3px aqua strip at top of card (inside border-radius) |

#### Docs OG Image (`/og/docs.png`)

Layout: White background, docs-style with category label.

| Layer | Description |
|-------|-------------|
| Background | White `#FFFFFF` |
| Left accent bar | 6px navy `#0C1F40` strip, full height left edge |
| Logo row | Rocket icon 40×40px navy + "Daimon" Archivo Expanded 700 32px navy — top-left, 60px from edges |
| Category badge | "Documentation" pill, 20% aqua background, navy text Inter 700 14px uppercase tracking-widened, y=300 center |
| Main headline | "Everything you need to get started" Archivo Semi-Expanded wdth:112.5 500 48px navy centered y=340 |
| Sub-text | "Quick start, tool reference, billing, FAQ" Inter 400 22px navy 60% y=400 centered |

#### Docs Quickstart OG (`/og/docs-quickstart.png`)

Same layout as docs.png with:
- Category badge text: "Quick Start Guide"
- Main headline: "Up and running in 5 minutes"
- Sub-text: "Step-by-step from signup to live bot"

#### Docs Tools OG (`/og/docs-tools.png`)

Same layout as docs.png with:
- Category badge text: "Tool Reference"
- Main headline: "50+ tools at your command"
- Sub-text: "GitHub, Linear, Toggl, Google Analytics, and more"

#### Docs Billing OG (`/og/docs-billing.png`)

Same layout as docs.png with:
- Category badge text: "Billing & Plans"
- Main headline: "Free to start. Pay for what you use."
- Sub-text: "Free / Starter $9/mo / Pro $29/mo"

#### Docs FAQ OG (`/og/docs-faq.png`)

Same layout as docs.png with:
- Category badge text: "FAQ"
- Main headline: "Common questions answered"
- Sub-text: "Billing, security, setup, troubleshooting, limits"

---

## `@vercel/og` Route Implementation

**File**: `app/og/route.tsx`

This route is NOT needed for the static pages listed above (they use pre-rendered PNGs). It is scaffolded for future dynamic OG images (e.g., per-blog-post images).

```tsx
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Daimon";
  const description = searchParams.get("description") ?? "AI Operating System for Discord";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0C1F40",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "800px",
            marginTop: "24px",
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## `robots.txt`

**File**: `public/robots.txt`

```txt
User-agent: *
Allow: /
Allow: /docs
Allow: /docs/quickstart
Allow: /docs/tools
Allow: /docs/billing
Allow: /docs/faq

Disallow: /dashboard
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /signup
Disallow: /reset-password

Sitemap: https://daimon.ai/sitemap.xml
```

---

## `sitemap.xml` (Dynamic Generation)

**File**: `app/sitemap.ts`

```tsx
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://daimon.ai";
  const now = new Date().toISOString();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/docs/quickstart`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/docs/tools`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/docs/billing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/docs/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
```

**Note**: Auth pages (`/login`, `/signup`) and app pages (`/dashboard/**`, `/admin/**`) are explicitly excluded from the sitemap.

---

## `site.webmanifest`

**File**: `public/site.webmanifest`

```json
{
  "name": "Daimon",
  "short_name": "Daimon",
  "description": "AI Operating System for Discord",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#0C1F40",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["productivity", "utilities"],
  "lang": "en"
}
```

---

## Favicon & Icon Asset Inventory

All icons stored in `public/`:

| File | Size | Format | Usage |
|------|------|--------|-------|
| `favicon.ico` | 16×16 + 32×32 multi-size | ICO | Browser tab legacy |
| `icon.svg` | Vector | SVG | Modern browsers, scales perfectly |
| `icon-16.png` | 16×16 | PNG | `<link rel="icon" sizes="16x16">` |
| `icon-32.png` | 32×32 | PNG | `<link rel="icon" sizes="32x32">` |
| `icon-192.png` | 192×192 | PNG | Android Chrome, PWA |
| `icon-512.png` | 512×512 | PNG | PWA splash, high-DPI |
| `apple-icon.png` | 180×180 | PNG | iOS Safari bookmark |
| `logo.png` | 512×512 | PNG | Schema.org Organization logo |

### Icon Design

All icons use the rocket SVG icon on appropriate background:
- `icon.svg`: Rocket SVG on transparent background, navy `#0C1F40` stroke, aqua `#B4E7DD` fill accent
- PNG variants: Rocket on white circle with 4px aqua ring border (for readability at small sizes)
- Apple icon: Rocket on navy `#0C1F40` square with rounded corners (24px radius)

---

## Canonical URL Rules

| Scenario | Canonical |
|----------|-----------|
| Landing page | `https://daimon.ai` (no trailing slash) |
| Docs root | `https://daimon.ai/docs` |
| Docs sub-pages | `https://daimon.ai/docs/{slug}` |
| Auth pages | Include canonical but set noindex |
| Dashboard pages | Include canonical but set noindex |
| Admin pages | Include canonical but set noindex |

**Implementation**: All canonicals are set via Next.js `metadata.alternates.canonical` — not via `<link rel="canonical">` tag manually. Next.js injects the correct tag automatically.

---

## Structured Data Injection Pattern

**File**: `app/(public)/page.tsx` (landing page)

```tsx
// After the metadata export, inject JSON-LD as a script in the page body:
export default function LandingPage() {
  const jsonLd = [
    /* website schema */,
    /* organization schema */,
    /* softwareApplication schema */,
    /* faqPage schema */,
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* page content */}
    </>
  );
}
```

**File**: `app/(public)/docs/[slug]/page.tsx` (docs sub-pages)

```tsx
export default function DocsPage({ params }: { params: { slug: string } }) {
  const schema = getSchemaForSlug(params.slug); // returns appropriate JSON-LD object

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      {/* page content */}
    </>
  );
}
```

The `getSchemaForSlug` function maps slug → schema:

```tsx
function getSchemaForSlug(slug: string): object | null {
  const schemas: Record<string, object> = {
    quickstart: QUICKSTART_HOW_TO_SCHEMA,
    tools: TOOLS_TECH_ARTICLE_SCHEMA,
    billing: BILLING_WEBPAGE_SCHEMA,
    faq: FAQ_PAGE_SCHEMA,
  };
  return schemas[slug] ?? null;
}
```

All schema constants defined in `lib/schemas/structured-data.ts`.

# Docs Pages — Complete Specification

> Routes: `/docs`, `/docs/quick-start`, `/docs/tool-reference`, `/docs/faq`, `/docs/billing`
> Layout: `app/(docs)/layout.tsx` — Public (no auth required)
> Last updated: 2026-03-13

---

## Overview

The Docs section is a publicly accessible set of pages that help users set up and use Daimon. All docs pages use a shared two-column layout: a fixed left sidebar for navigation and a scrollable right content area. Docs are static — rendered at build time via Next.js `generateStaticParams`. No authentication required to view docs.

**URL structure:**

| Route | Page |
|-------|------|
| `/docs` | Redirect to `/docs/quick-start` (301) |
| `/docs/quick-start` | Quick Start guide — signup through live bot |
| `/docs/tool-reference/discord` | Tool Reference: Discord + Dub + Credentials + GitHub tools |
| `/docs/tool-reference/toggl` | Tool Reference: Toggl tools (34 tools) |
| `/docs/tool-reference/linkedin` | Tool Reference: LinkedIn + Google Analytics tools |
| `/docs/tool-reference/fly` | Tool Reference: Fly + ACP + Decision Hub + Onyx + Bluedot tools |
| `/docs/tool-reference/linear` | Tool Reference: Linear (remote MCP) tools + index |
| `/docs/faq` | FAQ — billing, security, bot setup, troubleshooting |
| `/docs/billing` | Billing & Plans — plan comparison, upgrade/downgrade explained |

---

## Docs Layout (`app/(docs)/layout.tsx`)

All docs pages share this two-column layout.

### Layout Structure

```
<body>
  <div class="docs-shell">                    <!-- flex, min-h-screen, bg-[#F7F7F7] -->
    <DocsSidebar />                            <!-- fixed, w-[260px], bg-white, border-r, h-screen, overflow-y-auto -->
    <div class="docs-main">                   <!-- flex-1, ml-[260px] -->
      <DocsTopbar />                          <!-- sticky top-0, h-[56px], bg-white, border-b -->
      <article class="docs-content">          <!-- max-w-[780px], mx-auto, px-8, py-12 -->
        {children}
      </article>
    </div>
  </div>
</body>
```

### DocsSidebar Spec

| Property | Value |
|----------|-------|
| Width | `260px` |
| Background | White (`#FFFFFF`) |
| Border-right | `1px solid #E5E7EB` |
| Position | `fixed`, `left-0`, `top-0`, `h-screen` |
| Overflow-y | `auto` |
| Padding | `0` (logo area has own padding) |

**Sidebar top logo area:**

| Property | Value |
|----------|-------|
| Padding | `20px 24px` |
| Border-bottom | `1px solid #E5E7EB` |
| Logo height | `28px` |
| Logo links to | `/` (homepage) |

**Sidebar nav sections:**

```
<nav aria-label="Docs navigation">
  <ul class="nav-sections">

    <!-- Section: Getting Started -->
    <li class="nav-section">
      <span class="section-label">Getting Started</span>
      <ul class="section-items">
        <li><a href="/docs/quick-start" [aria-current="page" if active]>Quick Start</a></li>
      </ul>
    </li>

    <!-- Section: Tool Reference -->
    <li class="nav-section">
      <span class="section-label">Tool Reference</span>
      <ul class="section-items">
        <li><a href="/docs/tool-reference/discord">Discord & Core Tools</a></li>
        <li><a href="/docs/tool-reference/toggl">Toggl</a></li>
        <li><a href="/docs/tool-reference/linkedin">LinkedIn & Analytics</a></li>
        <li><a href="/docs/tool-reference/fly">Fly & Infrastructure</a></li>
        <li><a href="/docs/tool-reference/linear">Linear</a></li>
      </ul>
    </li>

    <!-- Section: Account & Billing -->
    <li class="nav-section">
      <span class="section-label">Account & Billing</span>
      <ul class="section-items">
        <li><a href="/docs/billing">Plans & Pricing</a></li>
        <li><a href="/docs/faq">FAQ</a></li>
      </ul>
    </li>

  </ul>
</nav>
```

**Section label spec:**

| Property | Value |
|----------|-------|
| Font | Inter SemiBold, 11px, #6B7280 (Gray 500) |
| Text transform | `uppercase` |
| Letter-spacing | `0.08em` |
| Padding | `20px 24px 8px 24px` |
| Display | `block` |

**Nav link spec (not active):**

| Property | Value |
|----------|-------|
| Font | Inter Regular, 14px, #374151 (Gray 700) |
| Padding | `7px 24px` |
| Display | `block` |
| Border-left | `2px solid transparent` |
| Hover background | `#F9FAFB` (Gray 50) |
| Hover color | `#0C1F40` (Navy) |

**Nav link spec (active — current page):**

| Property | Value |
|----------|-------|
| Font | Inter SemiBold, 14px, #0C1F40 (Navy) |
| Background | `rgba(180, 231, 221, 0.15)` (Aqua 15%) |
| Border-left | `2px solid #B4E7DD` (Aqua) |
| Color | `#0C1F40` (Navy) |

**Section items indentation:**

| Property | Value |
|----------|-------|
| `ul.section-items` padding-left | `0` |
| `li a` padding-left | `24px` |

### DocsTopbar Spec

| Property | Value |
|----------|-------|
| Height | `56px` |
| Background | White (`#FFFFFF`) |
| Border-bottom | `1px solid #E5E7EB` |
| Position | `sticky`, `top-0`, `z-10` |
| Layout | `flex`, `align-items: center`, `px-8` |

**Topbar contents (left to right):**
1. Breadcrumb: "Docs / {Page Title}" — Inter Regular, 14px, #6B7280
2. Spacer (`flex: 1`)
3. "Go to Dashboard" button — visible only to authenticated users (`href="/dashboard"`, outline style)
4. "Sign up free" button — visible only to unauthenticated users (`href="/signup"`, primary Aqua style)

**Breadcrumb separator:** "/" character, #D1D5DB, with 8px horizontal padding on each side.

### Docs Content Area Spec

| Property | Value |
|----------|-------|
| `article.docs-content` max-width | `780px` |
| `article.docs-content` margin | `0 auto` |
| `article.docs-content` padding | `48px 32px 96px 32px` (desktop) |
| `article.docs-content` padding (mobile) | `24px 16px 64px 16px` |

**Typography within docs content:**

| Element | Font | Size | Weight | Color | Margin |
|---------|------|------|--------|-------|--------|
| `h1` | Archivo | 32px | SemiBold | #0C1F40 (Navy) | 0 0 8px 0 |
| `h2` | Archivo | 24px | SemiBold | #0C1F40 | 48px 0 16px 0 |
| `h3` | Archivo | 18px | SemiBold | #0C1F40 | 32px 0 12px 0 |
| `h4` | Inter | 15px | SemiBold | #374151 | 24px 0 8px 0 |
| `p` | Inter | 15px | Regular | #374151 (Gray 700) | 0 0 16px 0 |
| `a` | Inter | 15px | Regular | #3F85CC (Periwinkle) | — |
| `a:hover` | Inter | 15px | Regular | #0C1F40 (Navy) | — |
| `code` (inline) | Courier New, monospace | 13px | Regular | #0C1F40 | — |
| `code` (inline) background | `#F3F4F6` (Gray 100) | — | — | — | — |
| `code` (inline) padding | `2px 6px` | — | — | — | — |
| `pre` block | Courier New, monospace | 13px | Regular | #E5E7EB | — |
| `pre` block background | `#0C1F40` (Navy) | — | — | — | — |
| `pre` block padding | `20px 24px` | — | — | — | — |
| `pre` block border-radius | `0px` | — | — | — | — |
| `pre` block margin | `0 0 24px 0` | — | — | — | — |
| `ul` / `ol` | Inter | 15px | Regular | #374151 | 0 0 16px 0 |
| `ul` / `ol` `li` margin-bottom | `8px` | — | — | — | — |
| `blockquote` border-left | `3px solid #B4E7DD` | — | — | — | — |
| `blockquote` padding | `12px 24px` | — | — | — | — |
| `blockquote` background | `rgba(180, 231, 221, 0.10)` | — | — | — | — |
| `blockquote` font | Inter | 15px | Italic | #374151 | — |
| `table` | Inter | 14px | Regular | #374151 | — |
| `th` background | `#F9FAFB` | — | SemiBold | #374151 | — |
| `th`/`td` padding | `10px 16px` | — | — | — | — |
| `th`/`td` border | `1px solid #E5E7EB` | — | — | — | — |
| `hr` | `1px solid #E5E7EB` | — | — | — | `32px 0` |

**Callout boxes:**

Callouts are `<div class="callout callout-{type}">` wrappers. Types: `info`, `warning`, `tip`, `danger`.

| Type | Background | Left border color | Icon |
|------|-----------|-------------------|------|
| info | `#EFF6FF` (Blue 50) | `#3B82F6` (Blue 500) | ℹ️ (info circle) |
| warning | `#FFFBEB` (Yellow 50) | `#F59E0B` (Yellow 500) | ⚠️ (triangle) |
| tip | `rgba(180, 231, 221, 0.20)` | `#B4E7DD` (Aqua) | ✓ (check) |
| danger | `#FEF2F2` (Red 50) | `#EF4444` (Red 500) | ✗ (x circle) |

All callout boxes: padding `16px 20px`, border-left `3px solid`, border-radius `0px`, margin `0 0 24px 0`.

**Step numbering blocks (for Quick Start numbered steps):**

Used for sequential instructions. A `<div class="step">` wrapper containing:
- A `<div class="step-number">` circle with the step number (28px diameter, Navy background, white text, Inter SemiBold 14px, no border-radius / actually `border-radius: 50%` for circle shape only — exception to the PyMC sharp-corners rule since it's a step indicator bullet not a card)
- A `<div class="step-content">` with the step title (h3) and body prose

Step number circle: 28px × 28px, background `#0C1F40` (Navy), color White, Inter SemiBold 14px, `border-radius: 50%`, `flex-shrink: 0`.

Step layout: `flex`, `gap: 16px`, `align-items: flex-start`, `margin-bottom: 48px`.

---

## Page: Quick Start

> Route: `/docs/quick-start`
> File: `app/(docs)/quick-start/page.tsx`
> Type: Static page (no data fetching)
> Title: `<title>Quick Start — Daimon Docs</title>`
> Meta description: `"Set up your own Daimon AI bot in under 10 minutes. Follow this guide from account creation to your first Discord message."`

---

### Page Header

```html
<header class="docs-page-header">
  <div class="breadcrumb">Getting Started</div>
  <h1>Quick Start</h1>
  <p class="subtitle">From signup to a live AI bot in your Discord server — typically under 10 minutes.</p>
  <div class="estimated-time">
    <span class="time-icon"><!-- clock icon, 16px --></span>
    <span>Estimated time: 8–12 minutes</span>
  </div>
</header>
```

Subtitle font: Inter Regular, 18px, #6B7280 (Gray 500), margin-top: 8px.
Estimated time: Inter Regular, 14px, #6B7280, margin-top: 12px, gap: 6px between icon and text.
Breadcrumb: Inter Regular, 13px, #B4E7DD (Aqua), text-transform: uppercase, letter-spacing: 0.08em, margin-bottom: 8px.

---

### Prerequisites Section

```markdown
## Before You Begin

You'll need three things before you can start:

1. **A Discord bot token** — You'll create a Discord application and bot in the Discord Developer Portal. This takes about 3 minutes and is covered in Step 2 below.
2. **A Discord server (guild)** — You need a server where you have "Manage Server" permissions. You'll be the server owner for your own server, or you need an existing server where you can add bots.
3. **An Anthropic API key** — Daimon uses Claude (by Anthropic) to understand and respond to your messages. You provide your own key so you only pay for what you use. API key setup is covered in Step 3.
```

Callout box (type: `info`):
```
Daimon uses a "bring your own key" model. Your Anthropic API key is encrypted and stored securely — Daimon never charges you for AI usage directly. You're billed by Anthropic separately based on your Claude API usage.
```

---

### Step 1: Create Your Daimon Account

**Step number:** 1
**Step title:** Create Your Daimon Account

**Content:**

```markdown
Navigate to **daimon.app/signup** to create your account.

You'll see the signup page with the Daimon logo centered at the top and a white card below it. The form has these fields:
```

**Screenshot description:** The signup card on white-soft background (#F7F7F7). Centered card, max-width 440px. Daimon logo at top (centered, 40px height). Card has a thin 1px gray border and no border-radius. Inside: "Create your account" heading (Archivo SemiBold 24px Navy), the four form fields, and a primary CTA button.

**Fields:**

| Field | Type | Label | Placeholder | Notes |
|-------|------|-------|-------------|-------|
| Display Name | text | "Display Name" | "Ada Lovelace" | Your name as shown in the workspace |
| Email address | email | "Email" | "you@company.com" | Used for login |
| Password | password | "Password" | "Minimum 8 characters" | Min 8 chars, show/hide toggle |
| Workspace Name | text | "Workspace Name" | "Acme Corp" | Names your Daimon workspace |

**Submit button:** "Create account" — full width, Aqua background (#B4E7DD), Navy text (#0C1F40), Inter SemiBold 15px, height 44px, no border-radius.

**What happens when you click "Create account":**

1. Client-side validation runs. If any required field is empty, an error appears below the field in red (Inter Regular 13px, #EF4444): "This field is required."
2. If password is shorter than 8 characters: "Password must be at least 8 characters."
3. If email is not a valid email format: "Please enter a valid email address."
4. If validation passes, a loading spinner (16px, Navy) replaces the button label while the request processes.
5. If the email is already registered: An error banner appears at the top of the card — red background (#FEE2E2), red border-left (3px, #EF4444), text: "An account with this email already exists. [Sign in instead →](/login)." The link is Navy-colored and goes to `/login`.
6. If successful:
   - Supabase sends a confirmation email to the provided address.
   - The user is automatically signed in (no confirmation required at launch — Supabase `autoConfirm` is enabled for now to reduce friction).
   - The browser redirects to `/dashboard`.
   - A success toast appears in the dashboard: "Welcome to Daimon! Let's get your bot set up." (toast duration: 5 seconds, info type).
7. On the `/dashboard` page, the onboarding checklist is visible at the top because the account is freshly created and no steps are completed yet.

**"Already have an account?" link:** Below the card, centered. "Already have an account? [Sign in →](/login)". Inter Regular 14px, #6B7280.

---

### Step 2: Create a Discord Bot

**Step number:** 2
**Step title:** Create a Discord Bot

**Content:**

```markdown
Before you can connect Daimon to your Discord server, you need to create a Discord bot application and get its token. This is done entirely on Discord's website — not within Daimon.

Daimon does **not** use Discord OAuth. You create your own bot and paste its token into Daimon. This means your bot will have a custom name and avatar — your users will see *your* bot, not a shared Daimon bot.
```

Callout box (type: `tip`):
```
Why your own bot? Because your bot shows up with your name and avatar in Discord. It's yours — you control it, you can rename it, you can use it in multiple servers (on higher plans), and you're not sharing infrastructure with other Daimon users.
```

**Sub-steps (numbered list within the step):**

**2a. Go to the Discord Developer Portal**

```markdown
Open [discord.com/developers/applications](https://discord.com/developers/applications) in your browser. You'll need to sign in with your Discord account if you're not already.

The page shows a list of your existing applications (or an empty state if you have none yet).
```

**2b. Create a new application**

```markdown
Click the **"New Application"** button in the top-right corner. A modal dialog appears with a single text field labeled "Name". Enter a name for your bot — this will be the bot's username in Discord (e.g. "My AI Assistant" or your company name).

Click **"Create"**. You're taken to your new application's settings page.
```

**2c. Create the bot user**

```markdown
In the left sidebar, click **"Bot"**. On the Bot page, you'll see a section labeled "Build-A-Bot". Click **"Add Bot"**, then confirm by clicking **"Yes, do it!"** in the confirmation dialog.

Your bot user is now created.
```

**2d. Copy your bot token**

```markdown
On the Bot page, scroll to the "Token" section. Click **"Reset Token"** (you may need to enter your Discord password or complete 2FA if enabled). Your token is displayed once — it looks like a long string of random characters (e.g. `MTE4...rest of token...`).

**Copy this token and save it somewhere safe immediately** — Discord will not show it again after you leave the page. If you lose it, you can click "Reset Token" to generate a new one.
```

Callout box (type: `danger`):
```
**Never share your bot token.** Anyone who has your bot token can control your bot and take actions on its behalf. Treat it like a password. Daimon encrypts your token at rest — it is never displayed again after you paste it.
```

**2e. Enable required intents**

```markdown
Still on the Bot page, scroll down to the **"Privileged Gateway Intents"** section. Enable ALL of the following:

- **Presence Intent** — Toggle ON
- **Server Members Intent** — Toggle ON
- **Message Content Intent** — Toggle ON

Click **"Save Changes"**. A green banner confirms the save.

Without these intents, the bot will not be able to read messages or respond to your commands.
```

**2f. Invite the bot to your server**

```markdown
In the left sidebar, click **"OAuth2"**, then **"URL Generator"**.

Under **"Scopes"**, check:
- `bot`
- `applications.commands`

Under **"Bot Permissions"** (this section appears after you check "bot"), check:
- **Read Messages / View Channels**
- **Send Messages**
- **Send Messages in Threads**
- **Read Message History**
- **Add Reactions**
- **Use Slash Commands**
- **Embed Links**
- **Attach Files**
- **Mention Everyone** (optional — only if you want the bot to be able to @mention)

Scroll to the bottom of the page. A **"Generated URL"** appears. Click **"Copy"**. Open that URL in a new browser tab. You'll see Discord's bot invite page. Select your server from the dropdown, click **"Authorize"**, complete the CAPTCHA, and the bot will join your server.

You should see a message in your server's #general (or the default channel) that says "[Bot Name] has joined the server."
```

Callout box (type: `info`):
```
**Your Guild ID.** You'll also need your server's Guild ID for the next step. To find it: in Discord, go to User Settings → Advanced → enable "Developer Mode". Then right-click your server name in the left sidebar and click "Copy Server ID". Save this ID — you'll paste it into Daimon.
```

**2g. Note what you have**

```markdown
At this point, you should have:

- ✓ Your **bot token** (the long random string from Step 2d)
- ✓ Your **Guild ID** (the server ID from the Developer Mode right-click method)
- ✓ The bot is already a member of your server (from Step 2f)

You're ready to connect your bot to Daimon.
```

---

### Step 3: Get Your Anthropic API Key

**Step number:** 3
**Step title:** Get Your Anthropic API Key

**Content:**

```markdown
Daimon runs on Claude, Anthropic's AI model. You need to provide your own Anthropic API key. Usage fees are charged directly by Anthropic to your Anthropic account — Daimon charges a separate flat platform fee.
```

**Sub-steps:**

**3a. Create an Anthropic account**

```markdown
Go to [console.anthropic.com](https://console.anthropic.com) and sign up or log in. If you're creating a new account, you'll need to verify your email and complete Anthropic's onboarding.
```

**3b. Add billing to your Anthropic account**

```markdown
In the Anthropic Console, navigate to **Settings → Billing**. Add a payment method. You need an active billing method before you can create an API key.

Anthropic offers credits for new accounts. Check the Anthropic pricing page for current rates — Claude API usage is billed per token (input + output tokens).
```

**3c. Create an API key**

```markdown
In the Anthropic Console, navigate to **API Keys** (in the left sidebar). Click **"Create Key"**. Give it a name (e.g. "Daimon Production"). Your API key is displayed once — it starts with `sk-ant-`.

**Copy and save this key immediately.** You'll paste it into Daimon in Step 5.
```

Callout box (type: `warning`):
```
API keys are shown only once. If you lose it, you'll need to create a new key and update it in Daimon. The old key can be revoked from the Anthropic Console.
```

---

### Step 4: Add Your API Key to Daimon

**Step number:** 4
**Step title:** Add Your Anthropic API Key to Daimon

**Content:**

```markdown
Back in Daimon, navigate to **[Billing](/dashboard/billing)** using the sidebar. You'll see two sections on this page: "Subscription" (your plan) and "API Keys".
```

**Screenshot description:** The Billing page. Left side: sidebar with "Billing" highlighted in the navigation. Main content: two card panels. The top card is "Subscription" showing the Free plan. The bottom card is "API Keys" with two form rows — Anthropic API Key (required) and OpenAI API Key (optional).

**What the API Keys section looks like:**

```
┌─────────────────────────────────────────────────────────┐
│ API Keys                                                 │
│ Your API keys are encrypted and stored securely.         │
│─────────────────────────────────────────────────────────│
│ Anthropic API Key          [Required]                   │
│ ┌───────────────────────────────────┐ [Save] [Delete]  │
│ │ sk-ant-••••••••••••••••••••6a4f  │                   │
│ └───────────────────────────────────┘                   │
│ Used for all AI responses.                              │
│                                                          │
│ OpenAI API Key             [Optional]                   │
│ ┌───────────────────────────────────┐ [Save] [Delete]  │
│ │ Not connected                    │                   │
│ └───────────────────────────────────┘                   │
│ Used for message classification (improves accuracy).    │
└─────────────────────────────────────────────────────────┘
```

**Entering your API key:**

1. Click the Anthropic API Key input field. The field is currently empty (if first time) or shows a masked value like `sk-ant-••••••••••••••••••••6a4f` (last 4 chars visible if already saved).
2. Paste your API key (starts with `sk-ant-`).
3. The field shows your key as you type/paste. It is a `<input type="password">` field (masked by default) with a show/hide eye icon on the right to toggle visibility.
4. Click **"Save"** button next to the field.
5. The button shows a loading spinner while the key is being validated and saved.
6. **If the key is valid:**
   - The field clears and shows the masked hint (last 4 chars).
   - A green "Valid" badge appears next to the "Anthropic API Key" label.
   - A success toast: "Anthropic API key saved successfully." (3 seconds, success type).
7. **If the key is invalid (format check):**
   - A red error message appears below the field: "API key must start with sk-ant-."
   - The field value is preserved (not cleared) so you can correct it.
8. **If the key is valid format but fails Anthropic validation:**
   - Error below field: "API key is invalid or has no credits. Please check your Anthropic account."
   - Field value preserved.
9. **If Anthropic is unreachable during validation:**
   - Warning toast: "API key saved, but we couldn't verify it with Anthropic right now. We'll retry validation automatically." (5 seconds, warning type).
   - Key is saved anyway.
```

Callout box (type: `info`):
```
**OpenAI API Key (optional):** You can also add an OpenAI API key. Daimon uses it for message classification, which slightly improves response accuracy. If you don't add one, all requests go through Anthropic's Claude only. You can add this later.
```

---

### Step 5: Connect Your Discord Bot

**Step number:** 5
**Step title:** Connect Your Discord Bot

**Content:**

```markdown
Navigate to **[Settings](/dashboard/settings)** using the sidebar. Scroll down to the **"Discord Connection"** section.
```

**Screenshot description:** The Settings page. The "Discord Connection" section is visible with a heading "Discord Connection" and subtitle "Connect your Discord bot to start processing messages." Below the heading is the empty state: a dashed-border box with "No bots connected" text and an "Add Connection" button. Below the empty state (or after existing connections) is an inline "Add Connection" form.

**Adding your first connection:**

```markdown
Click the **"Add Connection"** button. A form expands inline (no modal — it appears directly within the card). The form has two fields:
```

**Form fields in the Add Connection form:**

| Field | Type | Label | Placeholder | Notes |
|-------|------|-------|-------------|-------|
| Bot Token | password | "Bot Token" | "Paste your Discord bot token" | Has show/hide toggle. Never stored in plain text. |
| Guild ID | text | "Guild ID (Server ID)" | "e.g. 1234567890123456789" | Numeric Discord server ID |

**Submit button:** "Connect Bot" — Aqua background, Navy text, width `160px`, height `40px`, no border-radius. Loading state replaces text with spinner.

**Cancel link:** "Cancel" text link below the form, Gray 500 color, clicking it collapses the form.

**What happens when you click "Connect Bot":**

1. Client-side validation:
   - Bot Token: Required. If empty: "Bot token is required."
   - Bot Token: Must not contain spaces. If spaces found: "Bot token cannot contain spaces."
   - Guild ID: Required. If empty: "Guild ID is required."
   - Guild ID: Must be numeric only (all digits). If non-numeric: "Guild ID must be a number (digits only)."
2. Loading spinner shows on the button.
3. The request goes to `POST /api/settings/discord` with the bot token and guild ID.
4. The API route validates the bot token format (must be 3 base64 segments separated by `.`). If invalid format: error returned inline: "Bot token format is invalid. Check that you copied the full token."
5. The bot token is encrypted via Supabase Vault and stored in `discord_connections`. A row is inserted with `status = 'pending'`.
6. The Supabase Realtime channel picks up the new row. The multi-tenant bot service detects the new `pending` connection and begins the Discord login flow for that token.
7. **Immediate UI response:** Form collapses. The connection row appears in the connection list with status "Pending" (gray badge).
8. **Within 10–30 seconds:** The bot connects to Discord and writes `status = 'connecting'` then `status = 'connected'` with `bot_username` and `bot_user_id` filled in. The page updates via Realtime subscription — the badge changes from "Pending" to "Connected" (aqua badge), and the bot username appears ("Connected as **YourBotName#1234**").
9. **On error (invalid token / rejected by Discord):** The bot writes `status = 'error'` with `error_message`. The badge shows "Error" (red) and the error message appears inline: e.g. "Discord rejected the bot token. Please check that your token is correct and hasn't been reset."

**What a successful connection looks like:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Discord Connection                                               │
│─────────────────────────────────────────────────────────────────│
│ [Discord logo] MyBot#1234                   Guild 987654321012  │
│               ● Connected   Last seen just now                  │
│                                          [Update Token] [Remove]│
└─────────────────────────────────────────────────────────────────┘
```

---

### Step 6: Verify Your Bot Is Live

**Step number:** 6
**Step title:** Verify Your Bot Is Live

**Content:**

```markdown
Navigate to the **[Dashboard](/dashboard)** by clicking "Dashboard" in the sidebar.
```

**Screenshot description:** The Dashboard page. At the top is the onboarding checklist. Four checklist items are visible. Items 1 (Create account) and 2 (Add Anthropic key) are checked with green checkmarks. Item 3 (Connect Discord) is now checked. Only item 4 (Connect an integration — optional) is unchecked. Below the checklist are the status cards. The "Bot Status" card shows a large green circle indicator with the text "Connected" and the bot name.

**What to check:**

```markdown
Look at the **"Bot Status"** card. It should show:

- A large status indicator colored **Aqua** (#B4E7DD)
- The text **"Connected"** in Navy
- Your bot's username below (e.g. "MyBot#1234")
- "Last heartbeat: just now" in gray text below that

If you see "Connecting…" (blue indicator), wait 15–30 seconds and refresh. The bot is still initializing.

If you see "Error" (red indicator), hover over it to see the error message. See the [Troubleshooting](#troubleshooting) section below for common errors.
```

**Dashboard status card layout (excerpt from full dashboard spec):**

The Bot Status card is one of four status cards in the top row. It occupies one of the four equal-width columns. The card has:
- A colored status circle: 12px diameter, `border-radius: 50%` (exception to sharp-corners rule — it's a status indicator), color matches status
- Status text: Archivo SemiBold 20px, Navy
- Bot username: Inter Regular 14px, Gray 500
- Heartbeat text: Inter Regular 12px, Gray 400

---

### Step 7: Talk to Your Bot

**Step number:** 7
**Step title:** Talk to Your Bot in Discord

**Content:**

```markdown
Open your Discord server. Your bot should appear in the member list on the right side (if "Show all members" is enabled) with an online status (green dot).

Go to any text channel and mention your bot to start a conversation:
```

**Example interaction block:**

```
@MyBot Can you help me track my time today?
```

Rendered as a `<pre class="discord-example">` block with Discord-inspired dark background:

```
Background: #36393F (Discord dark)
Padding: 20px 24px
Border-radius: 0px
```

Inside, the message shows:
- "@MyBot" in bold blue (`#7289DA`)
- Followed by the rest of the message text in white

Response example:
```
@YourUsername Sure! To track your time, I can help you
start a Toggl time entry. What project or task are
you working on?
```

**If you haven't connected any integrations yet:**

```markdown
The bot will respond to general conversation and questions immediately. If you ask it to do something that requires a connected service (like tracking time in Toggl), it will respond:

> "To track time, you'll need to connect your Toggl account. Visit your [Daimon Integrations page](https://daimon.app/dashboard/integrations) and add your Toggl API key."

This is normal! The bot tells you which integrations you need. Connect them in the [Integrations](/dashboard/integrations) page and then ask again.
```

---

### Step 8 (Optional): Connect Integrations

**Step number:** 8 (Optional)
**Step title:** Connect Your Services (Optional)

**Content:**

```markdown
Daimon can connect to the tools you already use, giving the bot access to real data and the ability to take actions. Navigate to **[Integrations](/dashboard/integrations)** to connect services.
```

**Integration cards on the page (4 services at launch):**

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  GitHub  │  │  Google  │  │  Linear  │  │  Toggl   │
│  OAuth   │  │  OAuth   │  │  OAuth   │  │ API Key  │
│ [Connect]│  │ [Connect]│  │ [Connect]│  │ [Connect]│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**GitHub:**

```markdown
**What it enables:** The bot can manage GitHub issues, pull requests, check CI status, create repositories, and run `git` operations in your projects.

**How to connect:**
1. Click "Connect" on the GitHub card.
2. You're redirected to GitHub's authorization page.
3. Review the permissions (read/write access to repositories you select).
4. Click "Authorize Daimon".
5. You're redirected back to the Integrations page.
6. The GitHub card now shows "Connected" with your GitHub username.
```

**Google:**

```markdown
**What it enables:** The bot can access Google Analytics data (site traffic, conversions, user counts).

**How to connect:**
1. Click "Connect" on the Google card.
2. You're redirected to Google's OAuth consent screen.
3. Sign in with your Google account (or pick an existing signed-in account).
4. Review the permissions (Google Analytics read access).
5. Click "Allow".
6. You're redirected back to the Integrations page.
7. The Google card shows "Connected" with your Google account email.
```

**Linear:**

```markdown
**What it enables:** The bot can view and update issues, comment on tickets, create new issues, and check project status in Linear.

**How to connect:**
1. Click "Connect" on the Linear card.
2. You're redirected to Linear's OAuth authorization page.
3. Select the Linear workspace you want to connect (if you have multiple).
4. Click "Authorize".
5. You're redirected back to the Integrations page.
6. The Linear card shows "Connected" with your Linear workspace name.
```

**Toggl:**

```markdown
**What it enables:** The bot can start, stop, and manage time entries, switch between projects, view time reports, and manage Toggl workspaces. Toggl has 34 tools available — the most of any integration.

**How to connect (API key, not OAuth):**
1. Click "Connect" on the Toggl card.
2. A modal dialog opens with a single input field labeled "Toggl API Token".
3. To find your Toggl API token: log in to [track.toggl.com](https://track.toggl.com), click your avatar at the bottom-left, go to "Profile settings", scroll to the bottom — your API token is displayed there.
4. Paste your API token into the Daimon modal.
5. Click "Connect Toggl".
6. Daimon validates the token by calling the Toggl API.
7. **If valid:** Modal closes, Toggl card shows "Connected" with your Toggl email/username.
8. **If invalid:** Error shown in modal: "Invalid API token. Please check your Toggl profile settings and try again."
```

---

### Troubleshooting Section

```markdown
## Troubleshooting
```

#### Bot Not Connecting

```markdown
**Symptom:** The bot shows "Error" or stays on "Pending" for more than 2 minutes.

**Possible causes and fixes:**

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "Discord rejected the bot token. Please check that your token is correct and hasn't been reset." | Invalid or expired token | Go to Discord Developer Portal → Your App → Bot → Reset Token. Copy the new token. In Daimon Settings → Discord Connection → Update Token. Paste the new token. |
| "Message Content Intent is not enabled." | Privileged intents not toggled on | Go to Discord Developer Portal → Your App → Bot → Privileged Gateway Intents. Enable all three (Presence, Server Members, Message Content). Save. Wait ~60 seconds for reconnect. |
| "The bot has not been added to guild {guild_id}." | Bot not in your server | Follow Step 2f to generate the OAuth2 invite URL and re-invite the bot to your server. |
| "Guild ID {guild_id} is invalid." | Wrong guild ID | Go to Discord → User Settings → Advanced → Enable Developer Mode. Right-click your server name → Copy Server ID. Update the Guild ID in Daimon Settings. |

```

#### API Key Issues

```markdown
**Symptom:** Bot joins Discord but doesn't respond, or responds with "I'm unable to process your request."

**Possible causes:**

| Problem | Fix |
|---------|-----|
| Anthropic API key missing | Go to Billing → API Keys → add your Anthropic API key. |
| Anthropic API key expired or deleted | Go to console.anthropic.com → API Keys → check if your key is still active. If deleted, create a new key and update it in Daimon Billing. |
| Anthropic account has no credits | Go to console.anthropic.com → Billing → add credits or a payment method. |
| Key saved but shows as invalid | The key may have been created before adding billing. Anthropic keys require an active billing method. Add payment at console.anthropic.com, then re-save the key in Daimon. |
```

#### Bot Responds But Can't Use a Tool

```markdown
**Symptom:** You ask the bot to do something and it says "To do that, you'll need to connect your [Service] account."

**Fix:** The tool requires a connected service. Navigate to [Integrations](/dashboard/integrations) and connect the service the bot mentioned. Once connected, repeat your request — you don't need to re-invite or restart anything.
```

#### Billing / Plan Issues

```markdown
**Symptom:** An error says "You've reached the connection limit for your plan."

**Fix:** The Free plan allows 1 Discord connection. To add more connections, upgrade to Starter (3 connections) or Pro (unlimited) from the [Billing](/dashboard/billing) page.

**Symptom:** Checkout didn't complete — browser closed mid-payment.

**Fix:** Go to [Billing](/dashboard/billing). If the session expired, click "Upgrade Plan" again to start a new checkout session. You will not be double-charged — incomplete sessions expire automatically.
```

#### Still Stuck?

```markdown
If none of the above fixes your issue:

1. Check the bot's error message in Settings → Discord Connection (hover the error badge for the full message).
2. Check your browser console for any JavaScript errors (press F12 → Console).
3. Try refreshing the page — the dashboard pulls fresh data on load.
4. Contact support by emailing **support@daimon.app** with your Workspace ID (found in Settings → Workspace). Include the error message you're seeing.
```

---

### What's Next Section

```markdown
## What's Next

Now that your bot is live, here are some things to try:

- **[Explore the tool catalog →](/docs/tool-reference/discord)** — Learn exactly what the bot can do and how to ask for each capability.
- **[Connect more integrations →](/dashboard/integrations)** — Unlock GitHub, Google Analytics, Linear, and Toggl tools.
- **[Understand billing →](/docs/billing)** — Learn about plans, what's included in each tier, and how to manage your subscription.
- **[Read the FAQ →](/docs/faq)** — Answers to common questions about security, keys, bots, and limits.
```

---

### Page Metadata

| Property | Value |
|----------|-------|
| `<title>` | "Quick Start — Daimon Docs" |
| `<meta name="description">` | "Set up your own Daimon AI bot in under 10 minutes. Follow this guide from account creation to your first Discord message." |
| `<meta property="og:title">` | "Quick Start — Daimon Docs" |
| `<meta property="og:description">` | "Set up your own Daimon AI bot in under 10 minutes. Follow this guide from account creation to your first Discord message." |
| `<meta property="og:image">` | `/og/docs-quick-start.png` (Navy background, "Quick Start" in white Archivo, Daimon logo top-left) |
| `<link rel="canonical">` | `https://daimon.app/docs/quick-start` |

---

### Responsive Behavior (Quick Start Page)

| Breakpoint | Changes |
|------------|---------|
| Desktop (≥ 1280px) | Two-column layout: 260px sidebar + scrollable content. Content max-width 780px. |
| Tablet (768px – 1279px) | Sidebar collapses to a horizontal tab bar at the top of the page (below the fixed topbar). Content becomes full-width (max-width 100%, padding 24px). |
| Mobile (< 768px) | Sidebar hidden. Hamburger menu icon in topbar opens a full-screen slide-over for sidebar navigation. Content padding: 16px. Step numbers: smaller (24px circles). |

**Mobile sidebar slide-over:**

| Property | Value |
|----------|-------|
| Width | `100vw` |
| Background | White |
| Position | Fixed overlay |
| Animation | Slides in from left (transform translateX), 200ms ease-out |
| Close trigger | Tap outside, tap X button (top-right of slide-over), tap a nav link |
| X button position | Top-right, 16px from edges |
| X button size | `32px × 32px` |

---

### Loading State (Quick Start Page)

The Quick Start page is fully static — there is no data fetching and therefore no loading state. The page renders entirely at build time.

Exception: The topbar "Go to Dashboard" vs "Sign up free" button is rendered client-side based on auth state. On first load (before auth is checked), the topbar shows no button in that slot (width is reserved to prevent layout shift).

---

### Empty State (Quick Start Page)

Not applicable — this is a static content page with no data-driven sections.

---

### Error State (Quick Start Page)

If the docs page itself fails to load (CDN outage, Vercel error): the user sees the default Next.js error page. A custom `app/error.tsx` renders: "We're having trouble loading this page. Please try again in a moment." with a "Reload" button.

---

### Accessibility (Quick Start Page)

| Element | ARIA / Accessibility Requirement |
|---------|----------------------------------|
| `<article class="docs-content">` | `role="main"` |
| Sidebar `<nav>` | `aria-label="Docs navigation"` |
| Active nav link | `aria-current="page"` |
| Step number circles | `aria-hidden="true"` (decorative numbering; step content has heading h3) |
| Callout boxes | `role="note"` for info/tip; `role="alert"` for warning/danger |
| Code blocks `<pre>` | `tabindex="0"` so keyboard users can scroll them |
| Hamburger menu button (mobile) | `aria-label="Open docs menu"`, `aria-expanded="{true/false}"`, `aria-controls="docs-sidebar"` |
| Slide-over sidebar (mobile) | `id="docs-sidebar"`, `aria-hidden="{!isOpen}"`, `role="dialog"`, `aria-modal="true"` |
| Slide-over close button | `aria-label="Close docs menu"` |

**Focus management (mobile menu):**
1. When hamburger is clicked: slide-over opens, focus moves to the first nav link inside.
2. When a nav link is clicked: slide-over closes, focus returns to the hamburger button.
3. When X is clicked or tap-outside occurs: slide-over closes, focus returns to the hamburger button.
4. While slide-over is open: focus is trapped inside the slide-over (Tab/Shift+Tab cycles within it).

**Keyboard navigation:**
- All nav links and interactive elements are reachable via Tab.
- Active nav link has visible focus ring: `outline: 2px solid #B4E7DD`, `outline-offset: 2px`.
- Hamburger menu: Enter/Space opens slide-over. Escape closes slide-over.

---

*End of Quick Start page specification.*

*Other docs pages (Tool Reference, FAQ, Billing docs) are specified in aspects 4.8b through 4.8h.*

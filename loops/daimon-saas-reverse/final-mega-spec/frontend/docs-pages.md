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

---

## Page: Tool Reference — Discord & Core Tools

> Route: `/docs/tool-reference/discord`
> File: `app/(docs)/tool-reference/discord/page.tsx`
> Type: Static page (no data fetching)
> Title: `<title>Discord & Core Tools — Daimon Docs</title>`
> Meta description: `"Complete reference for Daimon's Discord, Dub.co, GitHub, and credential tools — parameters, behavior, and example outputs."`

This page documents 11 tools across four categories: Discord (7 tools), Dub.co (2 tools), Credentials (1 tool), and GitHub (1 tool).

---

### Page Header

```html
<header class="docs-page-header">
  <div class="breadcrumb">Tool Reference</div>
  <h1>Discord & Core Tools</h1>
  <p class="subtitle">Complete reference for tools that interact with Discord, manage short links, access GitHub, and retrieve credentials.</p>
</header>
```

---

### Section: On This Page (In-page TOC)

Rendered as a sticky in-page table of contents in the right gutter (visible on desktop ≥ 1280px only; hidden on tablet/mobile).

```
On this page
────────────
• Discord Tools (7)
  · discord_read_thread
  · discord_read_channel
  · discord_parse_link
  · discord_search_messages
  · discord_get_message
  · discord_send_message
  · discord_create_thread
• Dub.co Tools (2)
  · dub_list_links
  · dub_get_analytics
• Credential Tools (1)
  · get_credential
• GitHub Tools (1)
  · github_run_gh
```

Each item is an anchor link (`href="#tool-name"`). Active item (closest heading in viewport) is bolded Navy.

---

### Section: Tool Reference Format

Each tool entry follows this template:

```
## tool_name

**Description:** {single-sentence description shown to the user}

**Category:** {Discord / Dub.co / Credentials / GitHub}
**Requires credential:** {Yes — {platform} / No}
**Tags:** {Platform tags + Action tags}

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| ... | ... | ... | ... | ... |

### Returns

{Prose description of what the tool returns, including format}

### Example

**Input:**
{JSON example}

**Output:**
{Example output snippet (XML or plain text)}

### Notes

{Any special behavior, gotchas, or error conditions}
```

---

### Discord Tools

#### Tool: `discord_read_thread`

> Source: `src_v2/mcp/tools/discord/read.py`
> Tags: `Platform.DISCORD`, `Action.READ`
> Requires credential: No (uses tenant's bot token from ToolContext)

**Description:**

Read message history from a Discord thread. Returns messages oldest-first. Bot messages are marked `[assistant]`; human messages are marked `[user]`. Each message includes the author's role, display name, @username, user ID, timestamp, and full content.

**Use when:** A user shares a thread link or asks about a specific thread conversation. The thread must be accessible to the bot token.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `thread_id` | `string` | Yes | — | Discord thread ID as a numeric string (e.g., `"1234567890123456789"`). Not a URL — just the numeric ID. |

**Parameter validation:**

- `thread_id` must be a numeric string. If a URL is accidentally passed, the tool will fail with a Discord API error. Claude should first use `discord_parse_link` to extract the ID from a URL.

**Returns:**

An XML block wrapping all messages in the thread, oldest-first. Format:

```xml
<messages channel="thread-name" channel-id="1234567890123456789">
  <message id="111222333444555666" timestamp="2026-03-10 14:32">
    <author id="987654321098765432" username="alice" role="user">Alice</author>
    <content>What's the status on the Q1 report?</content>
  </message>
  <message id="111222333444555667" timestamp="2026-03-10 14:33">
    <author id="000000000000000001" username="daimon-bot" role="assistant">Daimon</author>
    <content>The Q1 report is 80% complete. Alice is finishing the revenue section.</content>
  </message>
</messages>
```

If no messages exist in the thread:
```xml
<messages channel="empty-thread" channel-id="1234567890123456789">
  <!-- hint: No messages found. -->
</messages>
```

**Error conditions:**

| Discord HTTP Status | Error Message to User |
|--------------------|----------------------|
| 404 | `Thread {thread_id} not found` |
| 403 | `Bot lacks access to Thread {thread_id}` |
| Other | `Discord API error: {status} — {response_text_first_200_chars}` |

**Notes:**

- The tool fetches up to 100 messages from the thread (hardcoded in the implementation).
- Thread name is pulled from a separate `get_thread` API call before fetching messages.
- Timestamps are formatted as `YYYY-MM-DD HH:MM` (UTC).

---

#### Tool: `discord_read_channel`

> Source: `src_v2/mcp/tools/discord/read.py`
> Tags: `Platform.DISCORD`, `Action.READ`
> Requires credential: No

**Description:**

Read recent messages from a Discord text channel. Returns messages oldest-first. Bot messages are marked `[assistant]`; human messages are marked `[user]`. Each message includes role, display name, @username, user ID, timestamp, and content.

**Use when:** A user asks about channel activity or wants recent context from a specific channel.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channel_id` | `string` | Yes | — | Discord channel ID as a numeric string (e.g., `"9876543210987654321"`). Not a URL. |
| `limit` | `integer` | No | `50` | Maximum number of messages to fetch. Minimum: `1`. Maximum: `100`. |

**Returns:**

An XML block wrapping the most recent `limit` messages, oldest-first. Same format as `discord_read_thread`:

```xml
<messages channel="announcements" channel-id="9876543210987654321">
  <message id="..." timestamp="2026-03-12 09:00">
    <author id="..." username="bob" role="user">Bob</author>
    <content>Sprint planning at 2pm today</content>
  </message>
  ...
</messages>
```

**Error conditions:**

| Discord HTTP Status | Error Message to User |
|--------------------|----------------------|
| 404 | `Channel {channel_id} not found` |
| 403 | `Bot lacks access to Channel {channel_id}` |
| Other | `Discord API error: {status} — {response_text_first_200_chars}` |

**Notes:**

- Channel name is fetched via a separate `get_channel` API call.
- Only text channels work. Voice channels, categories, and stage channels will typically return 404 or 403.
- Messages are returned by Discord in newest-first order and reversed by the tool to oldest-first before formatting.

---

#### Tool: `discord_parse_link`

> Source: `src_v2/mcp/tools/discord/read.py`
> Tags: `Platform.DISCORD`, `Action.READ`
> Requires credential: No

**Description:**

Extract IDs from a Discord URL. Use this before reading content from a link — it tells you what the link points to and what tool to call next.

**Use when:** A user shares a Discord URL and you need to determine whether it points to a channel or a thread/message, and extract the relevant IDs.

**Supported URL formats:**

- `discord.com/channels/{guild_id}/{channel_id}`
- `discord.com/channels/{guild_id}/{channel_id}/{message_id}`
- `ptb.discord.com/channels/{guild_id}/{channel_id}`
- `ptb.discord.com/channels/{guild_id}/{channel_id}/{message_id}`
- `canary.discord.com/channels/{guild_id}/{channel_id}`
- `canary.discord.com/channels/{guild_id}/{channel_id}/{message_id}`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | `string` | Yes | — | Full Discord URL to parse. Must be a valid discord.com (or ptb/canary) channel or message link. |

**Returns:**

An XML block containing the extracted IDs and link type:

```xml
<parsed-link>
  <guild-id>111111111111111111</guild-id>
  <channel-id>222222222222222222</channel-id>
  <message-id>333333333333333333</message-id>   <!-- empty string if no message ID in URL -->
  <link-type>message_or_thread</link-type>       <!-- "channel" or "message_or_thread" -->
</parsed-link>
```

**`link_type` values and what to do next:**

| `link_type` | Meaning | Next action |
|------------|---------|-------------|
| `"channel"` | URL points to a channel (no message ID in URL) | Call `discord_read_channel(channel_id=<channel-id>)` |
| `"message_or_thread"` | URL has a message ID — may be a thread or a message | First try `discord_read_thread(thread_id=<message-id>)`. If that returns 404, it's a message (not a thread); call `discord_get_message(channel_id=<channel-id>, message_id=<message-id>)` |

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| URL does not match Discord URL pattern | `ValueError` message from the client library, raised as `ToolError` (e.g., `"Not a valid Discord URL"`) |

---

#### Tool: `discord_search_messages`

> Source: `src_v2/mcp/tools/discord/read.py`
> Tags: `Platform.DISCORD`, `Action.READ`
> Requires credential: No

**Description:**

Search messages across the entire Discord guild (server). Filter by text content, author, channel, message type, or content type. Returns up to 25 results per call; use `offset` to paginate through more results.

**Use when:** Looking for specific messages by text, from a specific user, in a specific channel, or that contain a specific content type (image, file, etc.).

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `content` | `string \| null` | No | `null` | Text to search for within message content. Maximum 1024 characters. Case-insensitive. |
| `author_ids` | `string[] \| null` | No | `null` | Filter to messages from these Discord user IDs. List of numeric string IDs. |
| `author_types` | `string[] \| null` | No | `null` | Filter by author type. Valid values: `"user"`, `"bot"`, `"webhook"`. |
| `mentions` | `string[] \| null` | No | `null` | Filter to messages that mention these Discord user IDs. List of numeric string IDs. |
| `channel_ids` | `string[] \| null` | No | `null` | Filter to messages in these specific channel IDs. List of numeric string IDs. |
| `has` | `string[] \| null` | No | `null` | Filter by content type. Valid values: `"image"`, `"video"`, `"file"`, `"sticker"`, `"embed"`, `"link"`, `"poll"`, `"sound"`. |
| `limit` | `integer` | No | `25` | Results per request. Minimum: `1`. Maximum: `25`. |
| `offset` | `integer` | No | `0` | Skip this many results for pagination. Maximum: `9975`. Combined with `limit`, maximum addressable result is 10,000. |

**Returns:**

An XML block containing matched messages:

```xml
<search-results total="142" showing="25" guild-id="111111111111111111">
  <message id="444444444444444444" timestamp="2026-03-11" channel-id="222222222222222222">
    <author id="987654321098765432" username="alice" role="user">Alice</author>
    <content>The budget spreadsheet is ready for review</content>
  </message>
  ...
  <!-- hint: More results available. Use offset=25 to continue. -->
</search-results>
```

When no results found:
```xml
<search-results total="0" guild-id="111111111111111111">
  <!-- hint: No messages found. Query: budget -->
</search-results>
```

**Error conditions:**

| Discord HTTP Status | Error Message to User |
|--------------------|----------------------|
| 202 | `Search index is building. Retry in a few seconds.` (Discord returns 202 while indexing is in progress — this is normal for new guilds or after a Discord outage) |
| 404 | `Guild {guild_id} not found` |
| 403 | `Bot lacks access to Guild {guild_id}` |
| Other | `Discord API error: {status} — {response_text_first_200_chars}` |

**Notes:**

- Searches the guild configured in the tenant's bot token (`tool_context.discord_guild_id`). Cannot search across multiple guilds.
- Discord's search indexes are eventually consistent — very new messages (last few seconds) may not appear in results.
- At least one filter parameter must yield results from Discord's API; passing no filters returns recent messages guild-wide.

---

#### Tool: `discord_get_message`

> Source: `src_v2/mcp/tools/discord/read.py`
> Tags: `Platform.DISCORD`, `Action.READ`
> Requires credential: No

**Description:**

Fetch the full content of a single Discord message by its channel ID and message ID. Use this when you have both IDs (e.g., extracted from a URL via `discord_parse_link`).

**Use when:** You need to read a specific message and have its channel ID and message ID. Also use this as a fallback when `discord_read_thread` returns 404 for a `message_or_thread` link — the ID is a message, not a thread.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channel_id` | `string` | Yes | — | Discord channel ID where the message was posted. Numeric string. |
| `message_id` | `string` | Yes | — | Discord message ID to fetch. Numeric string. |

**Returns:**

A single message XML element:

```xml
<message id="333333333333333333" timestamp="2026-03-10 14:32">
  <author id="987654321098765432" username="alice" role="user">Alice</author>
  <content>The Q1 report is ready for review. Link: https://docs.example.com/q1</content>
</message>
```

**Error conditions:**

| Discord HTTP Status | Error Message to User |
|--------------------|----------------------|
| 404 | `Message {message_id} not found` |
| 403 | `Bot lacks access to Message {message_id}` |
| Other | `Discord API error: {status} — {response_text_first_200_chars}` |

---

#### Tool: `discord_send_message`

> Source: `src_v2/mcp/tools/discord/write.py`
> Tags: `Platform.DISCORD`, `Action.WRITE`
> Requires credential: No

**Description:**

Send a message to a Discord text channel. **For internal team channels only — never use for client-facing channels.** The bot enforces a safety guard: it refuses to write to any channel whose name contains the word `client`.

**Use when:** You need to post information, updates, results, or summaries to a specific internal Discord channel.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channel_id` | `string` | Yes | — | Discord channel ID to send the message to. Numeric string. |
| `content` | `string` | Yes | — | Message content. Maximum 2000 characters (Discord limit). |
| `silent` | `boolean` | No | `false` | If `true`, sends the message with the `SUPPRESS_NOTIFICATIONS` flag — the message posts without triggering notification sounds or @-mention pings. |

**Returns:**

Plain text confirmation:

```
Message sent to #team-updates (message ID: 555555555555555555)
```

**Safety guard — client channel protection:**

Before sending, the tool:

1. Fetches the channel object to get its name.
2. Checks if the channel name contains `"client"` (case-insensitive via `is_client_channel(channel.name)` from `src_v2/core/discord_safety.py`).
3. If the channel is a thread (channel type 10, 11, or 12), also fetches the parent channel and checks if the parent name contains `"client"`.
4. If either check fails (channel or parent is a client channel), raises: `ToolError("Cannot write to client channel #{channel.name}")`

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| Channel name contains `"client"` | `Cannot write to client channel #{channel.name}` |
| Thread whose parent contains `"client"` | `Cannot write to client channel #{channel.name} (parent is client channel)` |
| Channel not found (404) | `Channel {channel_id} not found` |
| Bot lacks permission (403) | `Bot lacks permission to write to Channel {channel_id}` |
| Other Discord error | `Discord API error: {status} — {response_text_first_200_chars}` |

**Notes:**

- Discord message content limit is 2000 characters. The Pydantic model enforces `max_length=2000`; attempting to send longer content will fail input validation before the API call.
- The `silent` flag uses Discord's `SUPPRESS_NOTIFICATIONS` message flag (value `4096`). Users still see the message — they just don't get a notification sound.

---

#### Tool: `discord_create_thread`

> Source: `src_v2/mcp/tools/discord/write.py`
> Tags: `Platform.DISCORD`, `Action.WRITE`
> Requires credential: No

**Description:**

Create a public thread in a Discord text channel and post an initial message into it. **For internal team channels only — never use for client-facing channels.** Subject to the same `client` channel safety guard as `discord_send_message`.

**Use when:** You need to start a focused discussion or post structured content (e.g., a report, analysis, or task breakdown) in its own thread rather than the main channel feed.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channel_id` | `string` | Yes | — | Discord channel ID to create the thread in. Numeric string. |
| `thread_name` | `string` | Yes | — | Name for the new thread. Maximum 100 characters. |
| `content` | `string` | Yes | — | Initial message to post in the thread. Maximum 2000 characters. |
| `silent` | `boolean` | No | `false` | If `true`, suppresses notifications for the initial message. |

**Returns:**

Plain text confirmation:

```
Thread 'Q1 Revenue Analysis' created in #team-updates (thread ID: 666666666666666666)
```

**Safety guard:** Same as `discord_send_message` — refuses to create threads in channels whose name (or parent's name) contains `"client"`.

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| Channel name contains `"client"` | `Cannot write to client channel #{channel.name}` |
| Thread whose parent contains `"client"` | `Cannot write to client channel #{channel.name} (parent is client channel)` |
| Channel not found (404) | `Channel {channel_id} not found` |
| Bot lacks permission (403) | `Bot lacks permission to write to Channel {channel_id}` |
| Other Discord error | `Discord API error: {status} — {response_text_first_200_chars}` |

**Implementation notes:**

The tool makes three sequential API calls:
1. `GET /channels/{channel_id}` — fetch channel to validate name and type
2. `POST /channels/{channel_id}/threads` — create the thread (returns thread object with new thread ID)
3. `POST /channels/{thread_id}/messages` — post the initial message into the thread

If step 2 fails, the thread is not created. If step 3 fails, the thread exists but is empty — the tool returns an error; Claude should retry `discord_send_message(channel_id=<thread_id>, ...)`.

---

### Dub.co Tools

#### Tool: `dub_list_links`

> Source: `src_v2/mcp/tools/dub/tools.py`
> Tags: `Platform.DUB`, `Action.READ`
> Requires credential: No (uses `DUB_API_KEY` from ToolContext — requires tenant to have Dub.co configured)

**Description:**

List Dub.co short links with their UTM parameters and aggregate stats (clicks, leads, sales, saleAmount). Use to discover which short links exist, check their UTM tags, or find top-performing links.

**Prerequisite:** The tenant's `DUB_API_KEY` must be configured. If not configured, the tool returns: `"Dub.co is not configured. Set DUB_API_KEY."`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | `string \| null` | No | `null` | Search by slug (the short URL key) or destination URL. Partial match supported. |
| `domain` | `string \| null` | No | `null` | Filter by short link domain (e.g., `"d.example.com"`). |
| `tag_names` | `string \| null` | No | `null` | Filter by tag name. Single tag only. |
| `sort_by` | `"createdAt" \| "clicks" \| "saleAmount" \| "lastClicked" \| null` | No | `null` | Sort field. `null` uses Dub.co default (createdAt DESC). |
| `sort_order` | `"asc" \| "desc" \| null` | No | `null` | Sort direction. `null` uses Dub.co default. |
| `page` | `integer` | No | `1` | Page number (1-based). |
| `page_size` | `integer` | No | `100` | Results per page. Maximum: `100`. |

**Returns:**

An XML block listing links with their stats:

```xml
<links count="3">
  <link id="cld1234abcd" key="q1-report" domain="d.example.com">
    <url>https://docs.example.com/reports/q1-2026</url>
    <short_link>https://d.example.com/q1-report</short_link>
    <utm_source>discord</utm_source>
    <utm_medium>bot</utm_medium>
    <utm_campaign>q1-launch</utm_campaign>
    <clicks>847</clicks>
    <leads>12</leads>
    <sales>3</sales>
  </link>
  <link id="cld5678efgh" key="homepage" domain="d.example.com">
    <url>https://example.com</url>
    <short_link>https://d.example.com/homepage</short_link>
    <clicks>4201</clicks>
    <leads>0</leads>
    <sales>0</sales>
  </link>
</links>
```

Fields included per link:
- `url` — destination URL
- `short_link` — full short URL
- `utm_source` — only included if non-null
- `utm_medium` — only included if non-null
- `utm_campaign` — only included if non-null
- `clicks` — integer click count
- `leads` — integer lead count
- `sales` — integer sale count

Fields NOT included: `saleAmount`, `utm_term`, `utm_content` (not rendered in formatter).

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| `DUB_API_KEY` not set | `Dub.co is not configured. Set DUB_API_KEY.` |
| Dub.co rate limit (429) | `Dub.co rate limit exceeded. Try again in a few seconds.` |
| Dub.co API timeout | `Dub.co API request timed out.` |
| Other Dub.co API error | `Dub.co API error: {status_code}` |

---

#### Tool: `dub_get_analytics`

> Source: `src_v2/mcp/tools/dub/tools.py`
> Tags: `Platform.DUB`, `Action.READ`
> Requires credential: No (uses `DUB_API_KEY` from ToolContext)

**Description:**

Get aggregated Dub.co analytics. Group by time series, geography, device, browser, OS, UTM parameters, referrer, and more. Filter by link, domain, date range, or any dimension. Use after `dub_list_links` to drill into specific link performance.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `event` | `"clicks" \| "leads" \| "sales" \| "composite" \| null` | No | `null` (Dub defaults to `"clicks"`) | Event type to analyze. `"composite"` returns all event types. |
| `group_by` | `"count" \| "timeseries" \| "top_links" \| "countries" \| "cities" \| "regions" \| "continents" \| "devices" \| "browsers" \| "os" \| "referers" \| "referer_urls" \| "utm_sources" \| "utm_mediums" \| "utm_campaigns" \| "utm_terms" \| "utm_contents" \| null` | No | `null` (Dub defaults to `"count"`) | How to aggregate the results. |
| `link_id` | `string \| null` | No | `null` | Filter to a specific link by its Dub link ID. |
| `domain` | `string \| null` | No | `null` | Filter by domain. |
| `interval` | `"24h" \| "7d" \| "30d" \| "90d" \| "1y" \| "mtd" \| "qtd" \| "ytd" \| "all" \| null` | No | `null` (Dub defaults to `"24h"`) | Predefined time interval. Overridden by `start`/`end` if both are set. |
| `start` | `string \| null` | No | `null` | Start date in ISO 8601 format (e.g., `"2026-01-01T00:00:00Z"`). Overrides `interval` if provided. |
| `end` | `string \| null` | No | `null` | End date in ISO 8601 format. Used with `start`. |
| `timezone` | `string \| null` | No | `null` (Dub defaults to UTC) | IANA timezone string (e.g., `"America/New_York"`). Affects `timeseries` bucketing and `interval` calculations. |
| `country` | `string \| null` | No | `null` | Filter by 2-letter ISO country code (e.g., `"US"`, `"GB"`). |
| `city` | `string \| null` | No | `null` | Filter by city name. |
| `device` | `string \| null` | No | `null` | Filter by device type (e.g., `"Desktop"`, `"Mobile"`, `"Tablet"`). |
| `browser` | `string \| null` | No | `null` | Filter by browser name (e.g., `"Chrome"`, `"Safari"`). |
| `os` | `string \| null` | No | `null` | Filter by operating system (e.g., `"Windows"`, `"macOS"`, `"iOS"`, `"Android"`). |
| `referer` | `string \| null` | No | `null` | Filter by referrer hostname (e.g., `"twitter.com"`). |
| `url` | `string \| null` | No | `null` | Filter by destination URL (exact match). |
| `tag_id` | `string \| null` | No | `null` | Filter by Dub tag ID. |
| `utm_source` | `string \| null` | No | `null` | Filter by UTM source value. |
| `utm_medium` | `string \| null` | No | `null` | Filter by UTM medium value. |
| `utm_campaign` | `string \| null` | No | `null` | Filter by UTM campaign value. |
| `utm_term` | `string \| null` | No | `null` | Filter by UTM term value. |
| `utm_content` | `string \| null` | No | `null` | Filter by UTM content value. |

**Returns:**

When `group_by` is `"count"` (or null):
```xml
<analytics group_by="count">
  <count>4201</count>
</analytics>
```

When `group_by` is anything else (e.g., `"timeseries"`, `"countries"`, `"devices"`):
```xml
<analytics group_by="timeseries" count="7">
  <record>
    <start>2026-03-06T00:00:00.000Z</start>
    <end>2026-03-07T00:00:00.000Z</end>
    <clicks>842</clicks>
  </record>
  <record>
    <start>2026-03-07T00:00:00.000Z</start>
    <end>2026-03-08T00:00:00.000Z</end>
    <clicks>934</clicks>
  </record>
  ...
</analytics>
```

Field names within `<record>` vary by `group_by` dimension — Dub returns different keys per aggregation type. All fields are passed through as-is.

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| `DUB_API_KEY` not set | `Dub.co is not configured. Set DUB_API_KEY.` |
| Dub.co rate limit (429) | `Dub.co rate limit exceeded. Try again in a few seconds.` |
| Dub.co API timeout | `Dub.co API request timed out.` |
| Other Dub.co API error | `Dub.co API error: {status_code}` |

**Notes:**

- `start`/`end` override `interval` when both are provided.
- Use `dub_list_links` first to discover `link_id` values before filtering analytics by link.
- Dub.co analytics are based on tracked short link clicks — only links created through Dub.co are tracked.

---

### Credential Tools

#### Tool: `get_credential`

> Source: `src_v2/mcp/tools/credentials/tools.py`
> Tags: `Action.READ`
> Requires credential: No (but returns an error if the requested credential is not linked)

**Description:**

Get the requesting user's API token for a connected platform. Use this when writing ad-hoc scripts that call platform APIs directly — for example, when the user asks the bot to write a custom script that calls the Toggl or GitHub API.

**Use when:** The user asks the bot to write a script that calls an external API, and the script needs a real API token to function.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `platform` | `"toggl" \| "github"` | Yes | — | The platform whose API token to retrieve. Must be one of the valid `CredentialPlatform` enum values. |

**Valid `platform` values (from `CredentialPlatform` enum in `src_v2/core/credential_platform.py`):**

| Value | Platform |
|-------|---------|
| `"toggl"` | Toggl Track API token |
| `"github"` | GitHub personal access token (OAuth-derived) |

**Returns:**

The decrypted API token as a plain string:

```
tgk_abc123def456ghi789jkl012mno345pqr678
```

(This is the raw token value, not XML-wrapped.)

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| Requested platform credential not linked | `No {platform} account linked. Run /connect {platform} to link your account.` |

**Notes:**

- The token is sourced from `user_context.credentials` — the decrypted credential already loaded for the current request from the Supabase database.
- This tool does not make any external API calls — it simply returns the already-loaded credential value.
- The returned token is the user's personal API token, not a shared/tenant token.

---

### GitHub Tools

#### Tool: `github_run_gh`

> Source: `src_v2/mcp/tools/github/tools.py`
> Tags: `Platform.GITHUB`, `Action.WRITE`
> Requires credential: Yes — `CredentialPlatform.GITHUB`

**Description:**

Run a GitHub CLI (`gh`) command using the requesting user's GitHub credentials. The bot injects the user's OAuth-derived GitHub token as `GH_TOKEN` into the subprocess environment before running the command.

**Use when:** The user asks about GitHub issues, pull requests, CI status, or anything else manageable via the `gh` CLI.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `command` | `string` | Yes | — | The `gh` CLI arguments to execute. Do NOT include `"gh "` at the start — the tool strips it automatically. Example: `"pr list --repo owner/repo --state open"` |

**Credential gate:**

This tool requires the user to have a GitHub account connected via OAuth (via the Integrations page in the Daimon dashboard). If the user has not connected GitHub, the tool returns:

```
This tool requires a connected github account. Run /connect github to link your account.
```

**Command execution details:**

- The command is split using `shlex.split()` (POSIX shell tokenization) to handle quoted arguments.
- The command runs as a subprocess: `gh {args}` with `GH_TOKEN={user_github_token}` injected into the environment.
- All other environment variables from the bot process are inherited.
- Timeout: **30 seconds**. If the command exceeds this, the subprocess is killed and an error is returned.

**Returns:**

An XML block with stdout and stderr:

```xml
<gh-result command="pr list --repo owner/repo --state open">
  <stdout>
#123  Fix login bug         main  OPEN  about 2 hours ago
#121  Add dark mode         main  OPEN  about 1 day ago
#119  Update README         main  OPEN  about 3 days ago
  </stdout>
</gh-result>
```

On command failure (non-zero exit code):
```xml
<gh-result command="repo view nonexistent/repo" exit-code="1">
  <stderr>
error: repository not found
  </stderr>
</gh-result>
```

On command failure with no stderr output:
```xml
<gh-result command="..." exit-code="1">
  <!-- hint: Command failed with no error output. -->
</gh-result>
```

**Error conditions:**

| Condition | Error Message to User |
|-----------|----------------------|
| GitHub credential not connected | `This tool requires a connected github account. Run /connect github to link your account.` |
| Command times out (> 30s) | `gh command timed out after 30s: gh {command}` |

**Notes:**

- The leading `"gh "` prefix is automatically stripped from `command` — both `"pr list"` and `"gh pr list"` work identically.
- The tool uses `shlex.split()` to parse the command string — arguments with spaces must be quoted: `"repo view 'my org/my repo'"`.
- `gh` must be installed in the bot's Docker image at runtime. Version: 2.x+ required for full feature coverage.
- All `gh` capabilities are available: `pr`, `issue`, `repo`, `run`, `release`, `gist`, `api`, etc.
- Token scope depends on what the user authorized during OAuth — if the token lacks a permission, `gh` will return a 401/403 in stderr.

---

### Page Footer Navigation

At the bottom of the Tool Reference page, a two-item navigation row links to the previous and next docs pages:

```
← Quick Start                               Toggl Tools →
```

| Item | Link |
|------|------|
| Previous | `← Quick Start` → `/docs/quick-start` |
| Next | `Toggl Tools →` → `/docs/tool-reference/toggl` |

Styled as: two `<a>` elements in a flex row with `justify-content: space-between`. Font: Inter Regular 14px, color `#3F85CC` (Periwinkle). Hover: color `#0C1F40` (Navy). Top border: `1px solid #E5E7EB`. Padding-top: `32px`. Margin-top: `64px`.

---

### Page Metadata

| Property | Value |
|----------|-------|
| `<title>` | "Discord & Core Tools — Daimon Docs" |
| `<meta name="description">` | "Complete reference for Daimon's Discord, Dub.co, GitHub, and credential tools — parameters, behavior, and example outputs." |
| `<meta property="og:title">` | "Discord & Core Tools — Daimon Docs" |
| `<meta property="og:description">` | "Complete reference for Daimon's Discord, Dub.co, GitHub, and credential tools — parameters, behavior, and example outputs." |
| `<meta property="og:image">` | `/og/docs-tool-reference.png` (Navy background, "Tool Reference" in white Archivo, Daimon logo top-left) |
| `<link rel="canonical">` | `https://daimon.app/docs/tool-reference/discord` |

---

### Responsive Behavior (Tool Reference: Discord & Core Tools)

| Breakpoint | Changes |
|------------|---------|
| Desktop (≥ 1280px) | Two-column layout: 260px sidebar + scrollable content + optional in-page TOC in right gutter (240px wide, positioned `sticky top-[72px]`). Content max-width 780px. |
| Tablet (768px – 1279px) | In-page TOC hidden. Sidebar collapses to horizontal tabs. Content full-width. |
| Mobile (< 768px) | In-page TOC hidden. Sidebar hidden (hamburger menu). Content full-width, padding 16px. Parameter tables scroll horizontally. |

**Parameter table overflow on mobile:**

Tables have `overflow-x: auto` on a wrapping `<div>` so they scroll horizontally on narrow viewports without breaking the page layout.

---

### Loading / Empty / Error States (Tool Reference: Discord & Core Tools)

**Loading state:** Not applicable — fully static page, rendered at build time.

**Empty state:** Not applicable — content is always present.

**Error state:** Same as Quick Start — if the page fails to load, `app/error.tsx` renders: "We're having trouble loading this page. Please try again in a moment." with a "Reload" button.

**Auth button (topbar):** Same as Quick Start — rendered client-side; slot is empty until auth state resolves to prevent layout shift.

---

### Accessibility (Tool Reference: Discord & Core Tools)

| Element | ARIA / Accessibility Requirement |
|---------|----------------------------------|
| `<article class="docs-content">` | `role="main"` |
| In-page TOC nav | `aria-label="On this page"` |
| Active in-page TOC link | `aria-current="location"` |
| Tool entry headings (`h3`) | Unique `id` matching the tool function name (e.g., `id="discord_read_thread"`) — used as anchor link targets |
| Parameter tables | `<table role="table">` with `<caption>` set to `"Parameters for {tool_name}"` (visually hidden via `sr-only` class) |
| Code blocks `<pre>` | `tabindex="0"` to allow keyboard scrolling |
| All anchor links in footer nav | `aria-label="Previous page: Quick Start"` and `aria-label="Next page: Toggl Tools"` |

---

*End of Tool Reference: Discord & Core Tools page specification.*

---

## Page: Tool Reference — Toggl (`/docs/tool-reference/toggl`)

**Route:** `/docs/tool-reference/toggl`
**Layout:** `app/(docs)/layout.tsx` (shared docs shell)
**Rendering:** Static — `generateStaticParams` at build time. No auth required.
**Active sidebar link:** "Toggl" (under Tool Reference section)

### Page Purpose

Complete reference for all 34 Toggl tools available in Daimon. Split into two categories: tools that operate on the authenticated user's own time data (Time Entry, Project, Task, Workspace Member, Project User — available to any connected Toggl user), and workspace-level reporting tools that require the connected user to be a Toggl workspace admin.

**Prerequisite:** User must connect their Toggl account on the [Integrations page](/dashboard/integrations). See [Quick Start → Step 4: Connect Integrations](quick-start#step-4).

### Page Header

```
<h1>Toggl Tools</h1>
<p class="page-subtitle">
  34 tools for time tracking, project management, and workspace reporting.
  Connects to your Toggl account via API key. Some reporting tools require workspace admin access.
</p>
```

| Property | Value |
|----------|-------|
| `h1` font | Inter Bold, 36px, #0C1F40 |
| `p.page-subtitle` font | Inter Regular, 18px, #6B7280 |
| Bottom border | `1px solid #E5E7EB`, `margin-bottom: 32px` |

### On-Page Table of Contents

The right-side (or inline, at top of article on mobile) TOC:

```
On this page
  ├── Time Entry Tools (7)
  │   ├── toggl_get_my_time_entries
  │   ├── toggl_get_my_time_entry
  │   ├── toggl_get_my_current_time_entry
  │   ├── toggl_create_my_time_entry
  │   ├── toggl_update_my_time_entry
  │   ├── toggl_stop_my_time_entry
  │   └── toggl_bulk_edit_time_entries
  ├── Project Tools (4)
  │   ├── toggl_get_projects
  │   ├── toggl_get_project
  │   ├── toggl_update_project
  │   └── toggl_create_project
  ├── Task Tools (5)
  │   ├── toggl_get_tasks
  │   ├── toggl_get_task
  │   ├── toggl_get_project_tasks
  │   ├── toggl_create_task
  │   └── toggl_update_task
  ├── Workspace Member Tools (1)
  │   └── toggl_get_workspace_members
  ├── Project User Tools (3)
  │   ├── toggl_add_user_to_project
  │   ├── toggl_get_project_users
  │   └── toggl_remove_user_from_project
  └── Workspace Report Tools (14) — Admin Only
      ├── toggl_search_workspace_time_entries
      ├── toggl_get_workspace_time_summary
      ├── toggl_workspace_project_summary
      ├── toggl_workspace_time_totals
      ├── toggl_weekly_report
      ├── toggl_export_detailed_csv
      ├── toggl_export_summary_csv
      ├── toggl_project_trends
      ├── toggl_employee_profitability
      ├── toggl_project_profitability
      ├── toggl_list_report_users
      ├── toggl_list_report_projects
      ├── toggl_list_report_clients
      └── toggl_list_project_user_rates
```

### Prerequisites Banner

```
<div class="info-banner" role="note" aria-label="Prerequisite notice">
  <span class="info-icon">ℹ️</span>
  <p>
    Toggl tools require a connected Toggl account. Go to
    <a href="/dashboard/integrations">Integrations</a> and paste your Toggl API key to connect.
    Workspace reporting tools (marked <span class="badge admin-badge">Admin Only</span>) additionally
    require your Toggl user to have workspace admin permissions.
  </p>
</div>
```

| Property | Value |
|----------|-------|
| Background | `rgba(180, 231, 221, 0.15)` (Aqua 15%) |
| Border | `1px solid #B4E7DD` |
| Border-radius | `8px` |
| Padding | `16px 20px` |
| Font | Inter Regular, 14px, #374151 |

### Admin-Only Badge Spec

Used throughout this page on all 14 workspace report tools:

| Property | Value |
|----------|-------|
| Label text | `Admin Only` |
| Background | `#FEF3C7` (Amber 100) |
| Text color | `#92400E` (Amber 800) |
| Font | Inter SemiBold, 11px |
| Border-radius | `4px` |
| Padding | `2px 8px` |
| Display | `inline-flex`, `align-items: center` |

### Tool Entry Format

Each tool entry follows this structure:

```html
<section id="{tool_name}" class="tool-entry">
  <h3>
    <code>{tool_name}</code>
    {if admin-only: <span class="badge admin-badge">Admin Only</span>}
  </h3>
  <p class="tool-description">{description}</p>
  <div class="tool-meta">
    <span>Category: <strong>{category}</strong></span>
    <span>Access: <strong>{READ|WRITE}</strong></span>
    {if admin-only: <span>Requires: <strong>Toggl Workspace Admin</strong></span>}
  </div>
  {if has params:
    <table role="table">
      <caption class="sr-only">Parameters for {tool_name}</caption>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Type</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  }
  {if no params: <p class="no-params">No parameters required.</p>}
  <details class="example-block">
    <summary>Example</summary>
    <pre><code>{example}</code></pre>
  </details>
</section>
```

**Divider between tools:** `<hr class="tool-divider">` — `1px solid #E5E7EB`, `margin: 32px 0`

---

### Section: Time Entry Tools

```html
<h2 id="time-entry-tools">Time Entry Tools</h2>
<p>
  Tools for reading and managing your own time entries. These tools operate on the
  authenticated Toggl user's personal time data — not workspace-wide data.
</p>
```

---

#### `toggl_get_my_time_entries`

**Description:** Get time entries for the authenticated user, optionally filtered by date range. Max 90-day range.

**Category:** Time Entry | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | No | ISO 8601 start date filter, e.g. `2026-01-01T00:00:00Z`. If omitted, returns recent entries. |
| `end_date` | string | No | ISO 8601 end date filter, e.g. `2026-01-31T23:59:59Z`. If omitted, no upper bound. |

**Note:** Date range cannot exceed 90 days. If range exceeds 90 days, the tool returns an error: `"Date range cannot exceed 90 days. Use start_date and end_date to narrow your query."`

**Example:**
```
User: Show me my time entries for this week.
Daimon: [calls toggl_get_my_time_entries with start_date="2026-03-09T00:00:00Z", end_date="2026-03-13T23:59:59Z"]
Returns: List of time entry objects with id, description, project_id, task_id, start, stop, duration (seconds), tags, billable, workspace_id
```

**Example output (single entry):**
```json
{
  "id": 3458291047,
  "description": "Sprint planning meeting",
  "project_id": 198374201,
  "task_id": null,
  "start": "2026-03-10T09:00:00+00:00",
  "stop": "2026-03-10T10:30:00+00:00",
  "duration": 5400,
  "tags": ["meetings"],
  "billable": false,
  "workspace_id": 9283741
}
```

---

#### `toggl_get_my_time_entry`

**Description:** Get a single time entry by ID.

**Category:** Time Entry | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time_entry_id` | integer | Yes | The numeric ID of the time entry to retrieve. |

**Example:**
```
User: Get details for time entry 3458291047.
Daimon: [calls toggl_get_my_time_entry with time_entry_id=3458291047]
Returns: Single time entry object (same shape as toggl_get_my_time_entries items)
```

**Example output:**
```json
{
  "id": 3458291047,
  "description": "Sprint planning meeting",
  "project_id": 198374201,
  "task_id": null,
  "start": "2026-03-10T09:00:00+00:00",
  "stop": "2026-03-10T10:30:00+00:00",
  "duration": 5400,
  "tags": ["meetings"],
  "billable": false,
  "workspace_id": 9283741
}
```

---

#### `toggl_get_my_current_time_entry`

**Description:** Get the currently running time entry. Returns a hint if no entry is running.

**Category:** Time Entry | **Access:** READ

**Parameters:** None required.

**Example:**
```
User: Am I tracking time right now?
Daimon: [calls toggl_get_my_current_time_entry]
Returns: Running time entry object if active, or message "No time entry is currently running."
```

**Example output (running entry):**
```json
{
  "id": 3458299001,
  "description": "Writing spec for Daimon",
  "project_id": 198374201,
  "task_id": 84712930,
  "start": "2026-03-13T14:00:00+00:00",
  "stop": null,
  "duration": -1,
  "tags": [],
  "billable": true,
  "workspace_id": 9283741
}
```

**Example output (no running entry):**
```
"No time entry is currently running."
```

---

#### `toggl_create_my_time_entry`

**Description:** Create a new time entry. For a running entry, set duration to -1 and omit stop.

**Category:** Time Entry | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start` | string | Yes | Start time in ISO 8601 format, e.g. `2026-03-13T09:00:00Z`. |
| `description` | string | No | Description of the work done. |
| `project_id` | integer | No | Toggl project ID to assign this entry to. |
| `task_id` | integer | No | Toggl task ID to assign this entry to (must belong to project_id if provided). |
| `duration` | integer | No | Duration in seconds. Use `-1` to start a running (open) entry. |
| `stop` | string | No | Stop time in ISO 8601 format. Omit for running entries. |
| `tags` | array of strings | No | Tag names to apply, e.g. `["meetings", "client-work"]`. |
| `billable` | boolean | No | Whether this entry is billable. |

**Notes:**
- To start a running timer: provide `start`, set `duration` to `-1`, omit `stop`.
- To log a completed entry: provide `start` and either `stop` or a positive `duration`.
- If both `stop` and `duration` are provided, they must be consistent.

**Example:**
```
User: Start a timer for "writing the Daimon spec" on the Daimon project.
Daimon: [calls toggl_create_my_time_entry with start="2026-03-13T14:00:00Z", description="Writing the Daimon spec", project_id=198374201, duration=-1]
Returns: Created time entry object with id
```

**Example output:**
```json
{
  "id": 3458299002,
  "description": "Writing the Daimon spec",
  "project_id": 198374201,
  "task_id": null,
  "start": "2026-03-13T14:00:00+00:00",
  "stop": null,
  "duration": -1,
  "tags": [],
  "billable": false,
  "workspace_id": 9283741
}
```

---

#### `toggl_update_my_time_entry`

**Description:** Update an existing time entry. Only provided fields are changed.

**Category:** Time Entry | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time_entry_id` | integer | Yes | ID of the time entry to update. |
| `description` | string | No | New description. |
| `project_id` | integer | No | New project ID. |
| `task_id` | integer | No | New task ID. |
| `start` | string | No | New start time in ISO 8601 format. |
| `stop` | string | No | New stop time in ISO 8601 format. |
| `duration` | integer | No | New duration in seconds. |
| `tags` | array of strings | No | New tag list. Replaces existing tags entirely. |
| `billable` | boolean | No | New billable status. |

**Notes:**
- Only fields explicitly provided are updated. Omitted fields are unchanged.
- Providing `tags: []` removes all tags.

**Example:**
```
User: Update time entry 3458291047 to be billable and add the "client-work" tag.
Daimon: [calls toggl_update_my_time_entry with time_entry_id=3458291047, billable=true, tags=["client-work"]]
Returns: Updated time entry object
```

---

#### `toggl_stop_my_time_entry`

**Description:** Stop a currently running time entry.

**Category:** Time Entry | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time_entry_id` | integer | Yes | ID of the running time entry to stop. |

**Notes:**
- The entry must be currently running (`duration == -1`). If it's already stopped, the tool returns an error.
- Use `toggl_get_my_current_time_entry` first to get the ID of the running entry if unknown.

**Example:**
```
User: Stop my running timer.
Daimon: [calls toggl_get_my_current_time_entry → gets id=3458299001, then calls toggl_stop_my_time_entry with time_entry_id=3458299001]
Returns: Stopped time entry with computed duration
```

**Example output:**
```json
{
  "id": 3458299001,
  "description": "Writing spec for Daimon",
  "start": "2026-03-13T14:00:00+00:00",
  "stop": "2026-03-13T16:30:00+00:00",
  "duration": 9000,
  "billable": true
}
```

---

#### `toggl_bulk_edit_time_entries`

**Description:** Bulk edit multiple time entries using JSON Patch operations. Max 100 entries.

**Category:** Time Entry | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time_entry_ids` | array of integers | Yes | List of time entry IDs to edit. Maximum 100. |
| `operations` | array of objects | Yes | JSON Patch operations (RFC 6902). Each operation is `{"op": "replace", "path": "/field", "value": newValue}`. Supported paths: `/description`, `/project_id`, `/task_id`, `/tags`, `/billable`. |

**Example operations:**
```json
[
  {"op": "replace", "path": "/project_id", "value": 198374202},
  {"op": "replace", "path": "/billable", "value": true}
]
```

**Example:**
```
User: Mark all my time entries from last week as billable.
Daimon: [calls toggl_get_my_time_entries for last week → gets list of IDs → calls toggl_bulk_edit_time_entries with ids=[...], operations=[{"op": "replace", "path": "/billable", "value": true}]]
Returns: Count of updated entries and any errors
```

**Example output:**
```json
{
  "updated": 14,
  "errors": []
}
```

---

### Section: Project Tools

```html
<h2 id="project-tools">Project Tools</h2>
<p>
  Tools for reading and managing Toggl projects in your workspace.
</p>
```

---

#### `toggl_get_projects`

**Description:** Get all projects in the workspace, optionally filtered by active status.

**Category:** Project | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | boolean | No | If `true`, return only active projects. If `false`, return only archived projects. If omitted, return all. |

**Example:**
```
User: List all my active Toggl projects.
Daimon: [calls toggl_get_projects with active=true]
Returns: Array of project objects
```

**Example output (single project):**
```json
{
  "id": 198374201,
  "name": "Daimon SaaS",
  "color": "#0b83d9",
  "active": true,
  "billable": true,
  "is_private": false,
  "client_id": 12938471,
  "workspace_id": 9283741,
  "estimated_hours": null
}
```

---

#### `toggl_get_project`

**Description:** Get a single project by ID.

**Category:** Project | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | The numeric ID of the project to retrieve. |

**Example:**
```
User: Get details for project 198374201.
Daimon: [calls toggl_get_project with project_id=198374201]
Returns: Single project object
```

---

#### `toggl_update_project`

**Description:** Update a project's metadata (name, color, status, etc.).

**Category:** Project | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the project to update. |
| `name` | string | No | New project name. |
| `active` | boolean | No | `true` to reactivate, `false` to archive. |
| `color` | string | No | New hex color, e.g. `#ff0000`. |
| `is_private` | boolean | No | `true` to make project private (visible only to members). |
| `billable` | boolean | No | Whether time tracked on this project is billable. |
| `client_id` | integer | No | Client ID to associate with this project. |

**Example:**
```
User: Archive the "Old Website Redesign" project (ID 198374190).
Daimon: [calls toggl_update_project with project_id=198374190, active=false]
Returns: Updated project object with active=false
```

---

#### `toggl_create_project`

**Description:** Create a new Toggl project in the workspace.

**Category:** Project | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name for the new project. |
| `client_id` | integer | No | Toggl client ID to associate with this project. |
| `color` | string | No | Hex color, e.g. `#ff0000`. Defaults to Toggl's default color if omitted. |
| `billable` | boolean | No | Whether the project is billable. |
| `is_private` | boolean | No | Whether the project is private (visible only to members). |

**Example:**
```
User: Create a new project called "Q2 Marketing Campaign" for client 12938471.
Daimon: [calls toggl_create_project with name="Q2 Marketing Campaign", client_id=12938471, billable=true]
Returns: Newly created project object with id
```

**Example output:**
```json
{
  "id": 198374210,
  "name": "Q2 Marketing Campaign",
  "color": "#0b83d9",
  "active": true,
  "billable": true,
  "is_private": false,
  "client_id": 12938471,
  "workspace_id": 9283741
}
```

---

### Section: Task Tools

```html
<h2 id="task-tools">Task Tools</h2>
<p>
  Tools for reading and managing tasks within Toggl projects. Tasks are sub-items of projects
  that time entries can be assigned to.
</p>
```

---

#### `toggl_get_tasks`

**Description:** Get all tasks in the workspace.

**Category:** Task | **Access:** READ

**Parameters:** None required.

**Example:**
```
User: List all tasks in the workspace.
Daimon: [calls toggl_get_tasks]
Returns: Array of task objects across all projects
```

**Example output (single task):**
```json
{
  "id": 84712930,
  "name": "Write technical spec",
  "project_id": 198374201,
  "workspace_id": 9283741,
  "active": true,
  "estimated_seconds": 14400,
  "tracked_seconds": 9000
}
```

---

#### `toggl_get_task`

**Description:** Get a single task by project and task ID.

**Category:** Task | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the project the task belongs to. |
| `task_id` | integer | Yes | ID of the task to retrieve. |

**Example:**
```
User: Get details for task 84712930 in project 198374201.
Daimon: [calls toggl_get_task with project_id=198374201, task_id=84712930]
Returns: Single task object
```

---

#### `toggl_get_project_tasks`

**Description:** Get all tasks for a specific project.

**Category:** Task | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the project to get tasks for. |

**Example:**
```
User: Show me all tasks in the Daimon SaaS project.
Daimon: [calls toggl_get_project_tasks with project_id=198374201]
Returns: Array of task objects for that project
```

---

#### `toggl_create_task`

**Description:** Create a new task under a project.

**Category:** Task | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the project to create the task under. |
| `name` | string | Yes | Name of the new task. |
| `estimated_seconds` | integer | No | Estimated completion time in seconds, e.g. `3600` for 1 hour. |
| `active` | boolean | No | Whether the task is active. Default: `true`. |

**Example:**
```
User: Create a task "Design login page mockups" in project 198374201, estimated 2 hours.
Daimon: [calls toggl_create_task with project_id=198374201, name="Design login page mockups", estimated_seconds=7200]
Returns: Created task object with id
```

**Example output:**
```json
{
  "id": 84712940,
  "name": "Design login page mockups",
  "project_id": 198374201,
  "workspace_id": 9283741,
  "active": true,
  "estimated_seconds": 7200,
  "tracked_seconds": 0
}
```

---

#### `toggl_update_task`

**Description:** Update a task's name, status, or estimate.

**Category:** Task | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the project the task belongs to. |
| `task_id` | integer | Yes | ID of the task to update. |
| `name` | string | No | New task name. |
| `active` | boolean | No | `false` to complete/deactivate the task. |
| `estimated_seconds` | integer | No | New estimated time in seconds. |

**Example:**
```
User: Mark task 84712940 as complete.
Daimon: [calls toggl_update_task with project_id=198374201, task_id=84712940, active=false]
Returns: Updated task with active=false
```

---

### Section: Workspace Member Tools

```html
<h2 id="workspace-member-tools">Workspace Member Tools</h2>
<p>
  Tools for looking up users in your Toggl workspace. Useful for finding user IDs
  before assigning them to projects.
</p>
```

---

#### `toggl_get_workspace_members`

**Description:** Look up workspace members by name or list all members. Returns Toggl user IDs needed for `toggl_add_user_to_project`.

**Category:** Workspace Member | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Filter members by name. Server-side substring search. If omitted, returns all workspace members. |

**Example:**
```
User: Find the Toggl user ID for Alice Johnson.
Daimon: [calls toggl_get_workspace_members with name="Alice Johnson"]
Returns: List of matching member objects with Toggl user IDs
```

**Example output:**
```json
[
  {
    "id": 10293847,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "active": true,
    "admin": false,
    "workspace_id": 9283741
  }
]
```

---

### Section: Project User Tools

```html
<h2 id="project-user-tools">Project User Tools</h2>
<p>
  Tools for managing which workspace members have access to a specific project.
</p>
```

---

#### `toggl_add_user_to_project`

**Description:** Add a user to a Toggl project. `user_id` is the Toggl user ID — use `toggl_get_workspace_members` to look up users by name/email first.

**Category:** Project User | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the Toggl project. |
| `user_id` | integer | Yes | Toggl user ID (from `toggl_get_workspace_members`). |
| `manager` | boolean | No | If `true`, the user is added as a project manager. Default: `false`. |

**Notes:**
- Use `toggl_get_workspace_members` first to find the user's Toggl `id` (not their Daimon user ID).
- Adding a user who is already on the project returns an error.

**Example:**
```
User: Add Alice Johnson (Toggl user ID 10293847) to the Daimon SaaS project.
Daimon: [calls toggl_add_user_to_project with project_id=198374201, user_id=10293847]
Returns: Project-user association object with project_user_id
```

**Example output:**
```json
{
  "project_user_id": 7473920,
  "project_id": 198374201,
  "user_id": 10293847,
  "manager": false,
  "workspace_id": 9283741
}
```

---

#### `toggl_get_project_users`

**Description:** List users assigned to a Toggl project. Returns `project_user_id` for each member — this ID (not `user_id`) is required for `toggl_remove_user_from_project`.

**Category:** Project User | **Access:** READ

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | Yes | ID of the Toggl project. |

**Example:**
```
User: Who's on the Daimon SaaS project?
Daimon: [calls toggl_get_project_users with project_id=198374201]
Returns: Array of project-user objects including project_user_id for each member
```

**Example output:**
```json
[
  {
    "project_user_id": 7473920,
    "project_id": 198374201,
    "user_id": 10293847,
    "name": "Alice Johnson",
    "manager": false
  },
  {
    "project_user_id": 7473921,
    "project_id": 198374201,
    "user_id": 10293848,
    "name": "Bob Smith",
    "manager": true
  }
]
```

---

#### `toggl_remove_user_from_project`

**Description:** Remove a user from a Toggl project. Takes `project_user_id` (the association ID), not `user_id`. Get this from `toggl_get_project_users`.

**Category:** Project User | **Access:** WRITE

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_user_id` | integer | Yes | Project-user association ID (from `toggl_get_project_users`). This is NOT the `user_id`. |

**Notes:**
- This removes the user's access to the project. Their existing time entries on this project are not affected.
- To get the `project_user_id`, call `toggl_get_project_users` first.

**Example:**
```
User: Remove Alice from the Daimon SaaS project.
Daimon: [calls toggl_get_project_users with project_id=198374201 → finds project_user_id=7473920 for Alice → calls toggl_remove_user_from_project with project_user_id=7473920]
Returns: Confirmation message
```

**Example output:**
```
"User removed from project successfully."
```

---

### Section: Workspace Report Tools (Admin Only)

```html
<h2 id="workspace-report-tools">Workspace Report Tools</h2>
<div class="admin-only-notice" role="note" aria-label="Admin permission required">
  <span class="badge admin-badge">Admin Only</span>
  <p>
    All tools in this section require your connected Toggl account to have
    <strong>workspace admin</strong> permissions. If your account does not have admin access,
    these tools will return an error: <code>"This tool requires workspace admin permissions in Toggl."</code>
  </p>
</div>
<p>
  These tools access workspace-wide time tracking data across all members. Useful for
  managers and team leads running payroll, billing, and performance reports.
</p>
```

| Property | Value |
|----------|-------|
| `.admin-only-notice` background | `#FEF3C7` (Amber 100) |
| `.admin-only-notice` border | `1px solid #F59E0B` (Amber 400) |
| `.admin-only-notice` border-radius | `8px` |
| `.admin-only-notice` padding | `16px 20px` |

---

#### `toggl_search_workspace_time_entries` <span class="badge admin-badge">Admin Only</span>

**Description:** Search all workspace members' time entries. Requires workspace admin. Supports date ranges beyond 1 year (auto-chunked).

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format, e.g. `2026-01-01`. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format, e.g. `2026-03-31`. |
| `user_ids` | array of integers | No | Filter to specific user IDs. Use `toggl_list_report_users` to get valid IDs. |
| `project_ids` | array of integers | No | Filter to specific project IDs. Use `toggl_list_report_projects` to get valid IDs. |

**Notes:**
- Date ranges exceeding 1 year are automatically chunked internally and results are merged.
- Returns all time entries across the workspace (or filtered subset) for the period.

**Example:**
```
User: Show me all time entries for Q1 2026.
Daimon: [calls toggl_search_workspace_time_entries with start_date="2026-01-01", end_date="2026-03-31"]
Returns: Array of detailed time entry objects for all workspace members
```

---

#### `toggl_get_workspace_time_summary` <span class="badge admin-badge">Admin Only</span>

**Description:** Get aggregated time summary for all workspace members. Requires workspace admin. Group by users, projects, or clients.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `user_ids` | array of integers | No | Filter by user IDs. |
| `project_ids` | array of integers | No | Filter by project IDs. |
| `grouping` | string | No | Primary grouping: `"users"`, `"projects"`, or `"clients"`. Default: `"projects"`. |
| `sub_grouping` | string | No | Secondary grouping: `"time_entries"`, `"tasks"`, `"users"`, `"projects"`, or `"clients"`. |

**Example:**
```
User: Summarize time for Q1 2026 grouped by user.
Daimon: [calls toggl_get_workspace_time_summary with start_date="2026-01-01", end_date="2026-03-31", grouping="users"]
Returns: Summary object with totals per user
```

**Example output:**
```json
{
  "groups": [
    {
      "id": 10293847,
      "title": {"text": "Alice Johnson"},
      "tracked_seconds": 432000,
      "billable_seconds": 324000
    },
    {
      "id": 10293848,
      "title": {"text": "Bob Smith"},
      "tracked_seconds": 288000,
      "billable_seconds": 216000
    }
  ]
}
```

---

#### `toggl_workspace_project_summary` <span class="badge admin-badge">Admin Only</span>

**Description:** Get per-project/user tracked and billable seconds. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |

**Example:**
```
User: How many hours were tracked per project in February 2026?
Daimon: [calls toggl_workspace_project_summary with start_date="2026-02-01", end_date="2026-02-28"]
Returns: Per-project breakdown of tracked_seconds and billable_seconds
```

**Example output:**
```json
[
  {
    "project_id": 198374201,
    "project_name": "Daimon SaaS",
    "tracked_seconds": 180000,
    "billable_seconds": 144000,
    "members": [
      {"user_id": 10293847, "tracked_seconds": 108000},
      {"user_id": 10293848, "tracked_seconds": 72000}
    ]
  }
]
```

---

#### `toggl_workspace_time_totals` <span class="badge admin-badge">Admin Only</span>

**Description:** Get aggregated time totals with optional day/week/month granularity. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `user_ids` | array of integers | No | Filter by user IDs. |
| `project_ids` | array of integers | No | Filter by project IDs. |
| `granularity` | string | No | Time granularity: `"day"`, `"week"`, or `"month"`. If omitted, returns aggregate totals only. |

**Example:**
```
User: Show me weekly time totals for Q1 2026.
Daimon: [calls toggl_workspace_time_totals with start_date="2026-01-01", end_date="2026-03-31", granularity="week"]
Returns: Time totals broken down by week
```

**Example output:**
```json
{
  "resolution": "week",
  "periods": [
    {"period": "2026-01-05/2026-01-11", "tracked_seconds": 144000, "billable_seconds": 108000},
    {"period": "2026-01-12/2026-01-18", "tracked_seconds": 162000, "billable_seconds": 126000}
  ],
  "totals": {"tracked_seconds": 720000, "billable_seconds": 540000}
}
```

---

#### `toggl_weekly_report` <span class="badge admin-badge">Admin Only</span>

**Description:** Get weekly timesheet per user with daily breakdowns. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `user_ids` | array of integers | No | Filter by user IDs. |
| `project_ids` | array of integers | No | Filter by project IDs. |

**Example:**
```
User: Show me the weekly timesheet for Alice for the week of March 9–15, 2026.
Daimon: [calls toggl_weekly_report with start_date="2026-03-09", end_date="2026-03-15", user_ids=[10293847]]
Returns: Per-user weekly totals with daily breakdown
```

**Example output:**
```json
{
  "weeks": [
    {
      "user_id": 10293847,
      "user_name": "Alice Johnson",
      "days": [
        {"date": "2026-03-09", "tracked_seconds": 28800},
        {"date": "2026-03-10", "tracked_seconds": 32400},
        {"date": "2026-03-11", "tracked_seconds": 27000},
        {"date": "2026-03-12", "tracked_seconds": 25200},
        {"date": "2026-03-13", "tracked_seconds": 18000}
      ],
      "total_seconds": 131400
    }
  ]
}
```

---

#### `toggl_export_detailed_csv` <span class="badge admin-badge">Admin Only</span>

**Description:** Export detailed time entries as CSV. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `user_ids` | array of integers | No | Filter by user IDs. |
| `project_ids` | array of integers | No | Filter by project IDs. |

**Notes:**
- Returns CSV text content as a string. Each row is one time entry.
- Columns: User, Email, Client, Project, Task, Description, Billable, Start date, Start time, End date, End time, Duration, Tags, Amount.

**Example:**
```
User: Export all time entries for March 2026 as CSV.
Daimon: [calls toggl_export_detailed_csv with start_date="2026-03-01", end_date="2026-03-31"]
Returns: CSV string with one row per time entry
```

**Example output (first 2 rows):**
```csv
User,Email,Client,Project,Task,Description,Billable,Start date,Start time,End date,End time,Duration,Tags,Amount
Alice Johnson,alice@example.com,Acme Corp,Daimon SaaS,Write technical spec,Writing the Daimon spec,Yes,2026-03-13,14:00:00,2026-03-13,16:30:00,02:30:00,billable,62.50
```

---

#### `toggl_export_summary_csv` <span class="badge admin-badge">Admin Only</span>

**Description:** Export summary time entries as CSV. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `grouping` | string | No | Primary grouping: `"users"`, `"projects"`, or `"clients"`. Default: `"projects"`. |
| `sub_grouping` | string | No | Secondary grouping: `"time_entries"`, `"tasks"`, `"users"`, `"projects"`, or `"clients"`. |
| `user_ids` | array of integers | No | Filter by user IDs. |
| `project_ids` | array of integers | No | Filter by project IDs. |

**Notes:**
- Returns CSV text content as a string. Rows are aggregated by the chosen grouping.
- Columns: {grouping title}, Billable duration, Non-billable duration, Total duration.

**Example:**
```
User: Export a summary CSV for Q1 2026 grouped by project.
Daimon: [calls toggl_export_summary_csv with start_date="2026-01-01", end_date="2026-03-31", grouping="projects"]
Returns: CSV string with one row per project
```

---

#### `toggl_project_trends` <span class="badge admin-badge">Admin Only</span>

**Description:** Get project trends comparing current vs previous period. Requires workspace admin. Toggl Premium feature.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin + Toggl Premium

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date for the current period in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date for the current period in `YYYY-MM-DD` format. |
| `previous_period_start` | string | Yes | Start date for the comparison period in `YYYY-MM-DD` format (same duration as current period). |
| `project_ids` | array of integers | No | Filter by project IDs. |

**Notes:**
- Requires a Toggl Premium subscription on the workspace. If not Premium, Toggl returns a 403 and Daimon returns: `"Project trends require a Toggl Premium subscription."`

**Example:**
```
User: Compare Q1 2026 project time vs Q4 2025.
Daimon: [calls toggl_project_trends with start_date="2026-01-01", end_date="2026-03-31", previous_period_start="2025-10-01"]
Returns: Per-project comparison with current and previous period tracked seconds
```

**Example output:**
```json
[
  {
    "project_id": 198374201,
    "project_name": "Daimon SaaS",
    "current_period_seconds": 180000,
    "previous_period_seconds": 144000,
    "change_percent": 25.0
  }
]
```

---

#### `toggl_employee_profitability` <span class="badge admin-badge">Admin Only</span>

**Description:** Export employee profitability as CSV. Requires workspace admin. Toggl Premium feature.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin + Toggl Premium

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currency` | string | Yes | Currency code for profitability calculations, e.g. `"USD"`, `"EUR"`, `"GBP"`. |
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `user_ids` | array of integers | No | Filter by user IDs. |

**Notes:**
- Requires a Toggl Premium subscription. Returns 403 error handled as: `"Employee profitability requires a Toggl Premium subscription."`
- Returns CSV with employee billing rates and profitability calculations.

**Example:**
```
User: Export employee profitability for Q1 2026 in USD.
Daimon: [calls toggl_employee_profitability with currency="USD", start_date="2026-01-01", end_date="2026-03-31"]
Returns: CSV string with per-employee profitability
```

---

#### `toggl_project_profitability` <span class="badge admin-badge">Admin Only</span>

**Description:** Export project profitability as CSV. Requires workspace admin. Toggl Premium feature.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin + Toggl Premium

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currency` | string | Yes | Currency code, e.g. `"USD"`, `"EUR"`, `"GBP"`. |
| `start_date` | string | Yes | Start date in `YYYY-MM-DD` format. |
| `end_date` | string | Yes | End date in `YYYY-MM-DD` format. |
| `project_ids` | array of integers | No | Filter by project IDs. |

**Notes:**
- Requires a Toggl Premium subscription. Returns 403 error handled as: `"Project profitability requires a Toggl Premium subscription."`
- Returns CSV with per-project revenue, cost, and profitability.

**Example:**
```
User: Show project profitability for Q1 2026 in EUR.
Daimon: [calls toggl_project_profitability with currency="EUR", start_date="2026-01-01", end_date="2026-03-31"]
Returns: CSV string with per-project profitability breakdown
```

---

#### `toggl_list_report_users` <span class="badge admin-badge">Admin Only</span>

**Description:** List users available for report filtering. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:** None required.

**Notes:**
- Returns the list of users whose data appears in workspace reports. Use the returned IDs to filter other reporting tools.

**Example:**
```
User: Who can I filter reports by?
Daimon: [calls toggl_list_report_users]
Returns: Array of user objects with id and name
```

**Example output:**
```json
[
  {"id": 10293847, "name": "Alice Johnson", "email": "alice@example.com"},
  {"id": 10293848, "name": "Bob Smith", "email": "bob@example.com"},
  {"id": 10293849, "name": "Carol White", "email": "carol@example.com"}
]
```

---

#### `toggl_list_report_projects` <span class="badge admin-badge">Admin Only</span>

**Description:** List projects available for report filtering. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:** None required.

**Notes:**
- Returns the list of projects that appear in workspace reports. Use the returned IDs to filter other reporting tools.

**Example:**
```
User: What projects can I filter reports by?
Daimon: [calls toggl_list_report_projects]
Returns: Array of project objects with id and name
```

**Example output:**
```json
[
  {"id": 198374201, "name": "Daimon SaaS", "active": true},
  {"id": 198374190, "name": "Old Website Redesign", "active": false},
  {"id": 198374210, "name": "Q2 Marketing Campaign", "active": true}
]
```

---

#### `toggl_list_report_clients` <span class="badge admin-badge">Admin Only</span>

**Description:** List clients available for report filtering. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:** None required.

**Notes:**
- Returns the list of clients in your Toggl workspace. Use client IDs to group or filter workspace reports.

**Example:**
```
User: What clients do we have in Toggl?
Daimon: [calls toggl_list_report_clients]
Returns: Array of client objects with id and name
```

**Example output:**
```json
[
  {"id": 12938471, "name": "Acme Corp", "workspace_id": 9283741},
  {"id": 12938472, "name": "Globex Inc", "workspace_id": 9283741}
]
```

---

#### `toggl_list_project_user_rates` <span class="badge admin-badge">Admin Only</span>

**Description:** List project-user rate assignments. Requires workspace admin.

**Category:** Workspace Report | **Access:** READ | **Requires:** Toggl Workspace Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_ids` | array of integers | No | Filter by project IDs. If omitted, returns rates for all projects. |

**Notes:**
- Returns hourly rates assigned to specific users for specific projects. Used in profitability calculations.

**Example:**
```
User: What are the billing rates for the Daimon SaaS project?
Daimon: [calls toggl_list_project_user_rates with project_ids=[198374201]]
Returns: Array of rate objects per user per project
```

**Example output:**
```json
[
  {
    "project_id": 198374201,
    "user_id": 10293847,
    "name": "Alice Johnson",
    "rate": 125.00,
    "currency": "USD"
  },
  {
    "project_id": 198374201,
    "user_id": 10293848,
    "name": "Bob Smith",
    "rate": 100.00,
    "currency": "USD"
  }
]
```

---

### Tool Quick-Reference Table

| Tool | Category | Access | Admin? | Description |
|------|----------|--------|--------|-------------|
| `toggl_get_my_time_entries` | Time Entry | READ | No | List own time entries, optional date filter (max 90 days) |
| `toggl_get_my_time_entry` | Time Entry | READ | No | Get single time entry by ID |
| `toggl_get_my_current_time_entry` | Time Entry | READ | No | Get currently running timer |
| `toggl_create_my_time_entry` | Time Entry | WRITE | No | Create time entry or start running timer |
| `toggl_update_my_time_entry` | Time Entry | WRITE | No | Update fields on existing time entry |
| `toggl_stop_my_time_entry` | Time Entry | WRITE | No | Stop running timer |
| `toggl_bulk_edit_time_entries` | Time Entry | WRITE | No | Bulk-edit up to 100 entries via JSON Patch |
| `toggl_get_projects` | Project | READ | No | List all workspace projects |
| `toggl_get_project` | Project | READ | No | Get single project by ID |
| `toggl_update_project` | Project | WRITE | No | Update project metadata or archive it |
| `toggl_create_project` | Project | WRITE | No | Create a new project |
| `toggl_get_tasks` | Task | READ | No | List all tasks in workspace |
| `toggl_get_task` | Task | READ | No | Get single task by project + task ID |
| `toggl_get_project_tasks` | Task | READ | No | List all tasks for a specific project |
| `toggl_create_task` | Task | WRITE | No | Create task under a project |
| `toggl_update_task` | Task | WRITE | No | Update task name, status, or estimate |
| `toggl_get_workspace_members` | Workspace Member | READ | No | Look up workspace members by name |
| `toggl_add_user_to_project` | Project User | WRITE | No | Add workspace member to project |
| `toggl_get_project_users` | Project User | READ | No | List users assigned to a project |
| `toggl_remove_user_from_project` | Project User | WRITE | No | Remove user from project (needs project_user_id) |
| `toggl_search_workspace_time_entries` | Workspace Report | READ | **Yes** | Search all members' time entries |
| `toggl_get_workspace_time_summary` | Workspace Report | READ | **Yes** | Aggregated summary, grouped by users/projects/clients |
| `toggl_workspace_project_summary` | Workspace Report | READ | **Yes** | Per-project tracked and billable seconds |
| `toggl_workspace_time_totals` | Workspace Report | READ | **Yes** | Aggregated totals with day/week/month granularity |
| `toggl_weekly_report` | Workspace Report | READ | **Yes** | Weekly timesheet per user with daily breakdown |
| `toggl_export_detailed_csv` | Workspace Report | READ | **Yes** | Export detailed time entries as CSV |
| `toggl_export_summary_csv` | Workspace Report | READ | **Yes** | Export summarized time entries as CSV |
| `toggl_project_trends` | Workspace Report | READ | **Yes** | Compare current vs previous period (Premium) |
| `toggl_employee_profitability` | Workspace Report | READ | **Yes** | Employee profitability CSV (Premium) |
| `toggl_project_profitability` | Workspace Report | READ | **Yes** | Project profitability CSV (Premium) |
| `toggl_list_report_users` | Workspace Report | READ | **Yes** | List users for report filtering |
| `toggl_list_report_projects` | Workspace Report | READ | **Yes** | List projects for report filtering |
| `toggl_list_report_clients` | Workspace Report | READ | **Yes** | List clients for report filtering |
| `toggl_list_project_user_rates` | Workspace Report | READ | **Yes** | List per-user billing rates per project |

### Page Footer Navigation

```html
<nav class="docs-page-nav" aria-label="Docs page navigation">
  <a href="/docs/tool-reference/discord" aria-label="Previous page: Discord & Core Tools">
    ← Discord & Core Tools
  </a>
  <a href="/docs/tool-reference/linkedin" aria-label="Next page: LinkedIn & Analytics">
    LinkedIn & Analytics →
  </a>
</nav>
```

### Loading / Empty / Error States (Tool Reference: Toggl)

**Loading state:** Not applicable — fully static page, rendered at build time.

**Empty state:** Not applicable — content is always present.

**Error state:** If the page fails to load, `app/error.tsx` renders: "We're having trouble loading this page. Please try again in a moment." with a "Reload" button.

**Auth button (topbar):** Rendered client-side; slot is empty until auth state resolves to prevent layout shift.

---

### Accessibility (Tool Reference: Toggl)

| Element | ARIA / Accessibility Requirement |
|---------|----------------------------------|
| `<article class="docs-content">` | `role="main"` |
| In-page TOC nav | `aria-label="On this page"` |
| Active in-page TOC link | `aria-current="location"` |
| Tool entry `<section>` headings (`h3`) | Unique `id` matching the tool function name (e.g., `id="toggl_get_my_time_entries"`) — anchor link targets |
| Admin-only badge | `role="img"` `aria-label="Requires workspace admin"` on the badge span |
| Admin-only notice at section top | `role="note"` `aria-label="Admin permission required"` |
| Parameter tables | `<table role="table">` with `<caption class="sr-only">Parameters for {tool_name}</caption>` |
| Code blocks `<pre>` | `tabindex="0"` to allow keyboard scrolling |
| Footer nav previous/next links | `aria-label="Previous page: Discord & Core Tools"` and `aria-label="Next page: LinkedIn & Analytics"` |

---

*End of Tool Reference: Toggl page specification (34 tools documented).*

---

## Tool Reference: LinkedIn & Google Analytics (`/docs/tool-reference/linkedin`)

**Route:** `/docs/tool-reference/linkedin`
**File:** `app/(docs)/docs/tool-reference/linkedin/page.tsx`
**Render mode:** Static (built at deploy time via `generateStaticParams`)
**Auth required:** No
**Layout:** Shared docs two-column layout (sidebar + content)

---

### Page Title & Introduction

```
# LinkedIn & Google Analytics Tools

Daimon includes 17 LinkedIn tools and 4 Google Analytics tools, giving your AI assistant
full control over your organization's social presence, advertising campaigns, and web analytics.

**LinkedIn** tools require two separate LinkedIn app tokens (configured in your Integrations page):
- **Ads Token** (App 1 — Advertising API): Used for ad accounts, campaigns, analytics, conversions, events, and leads.
- **Community Token** (App 2 — Community Management API): Used for posts and organic page statistics.

**Google Analytics** tools require a Google service account JSON and a GA4 property ID (configured in your Integrations page).
```

---

### In-Page Table of Contents

```
On this page
├── LinkedIn Tools (17)
│   ├── Posts
│   │   ├── linkedin_list_posts
│   │   ├── linkedin_create_post
│   │   ├── linkedin_update_post
│   │   └── linkedin_delete_post
│   ├── Ads & Campaigns
│   │   ├── linkedin_list_ad_accounts
│   │   ├── linkedin_list_campaigns
│   │   ├── linkedin_create_campaign
│   │   └── linkedin_update_campaign
│   ├── Ad Analytics & Library
│   │   ├── linkedin_get_ad_analytics
│   │   └── linkedin_search_ad_library
│   ├── Conversions
│   │   └── linkedin_send_conversions
│   ├── Events
│   │   ├── linkedin_list_events
│   │   └── linkedin_create_event
│   ├── Lead Gen Forms
│   │   └── linkedin_get_lead_form_responses
│   └── Org Statistics
│       ├── linkedin_get_share_stats
│       ├── linkedin_get_follower_stats
│       └── linkedin_get_page_stats
└── Google Analytics Tools (4)
    ├── ga_run_report
    ├── ga_get_traffic_overview
    ├── ga_get_top_pages
    └── ga_get_campaign_performance
```

---

### LinkedIn Tools (17)

**Authentication note:** LinkedIn tools use two separate access tokens. The Ads Token is used for all advertising, analytics, conversions, events, and leads operations. The Community Token is used for posts and organic page statistics. Both are configured per-tenant in the Integrations page and stored encrypted in Supabase Vault.

---

#### Posts

---

##### `linkedin_list_posts`

**Description:** List recent posts from the LinkedIn organization page. Returns post text, visibility, and lifecycle state.

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `count` | integer | No | `10` | Number of posts to return. Maximum: 100. |
| `start` | integer | No | `0` | Pagination offset — number of posts to skip before starting to return results. |

**Example invocation:**
```
List the 5 most recent posts on our LinkedIn page
```

**Example output (XML):**
```xml
<posts>
  <post id="urn:li:share:7123456789012345">
    <commentary>We're excited to announce our latest product update...</commentary>
    <visibility>PUBLIC</visibility>
    <lifecycle_state>PUBLISHED</lifecycle_state>
  </post>
  <post id="urn:li:share:7123456789012346">
    <commentary>Join us for our upcoming webinar on AI-powered workflows.</commentary>
    <visibility>PUBLIC</visibility>
    <lifecycle_state>PUBLISHED</lifecycle_state>
  </post>
</posts>
```

**Empty state output:**
```
<!-- hint: No posts found. Use linkedin_create_post to create one. -->
```

**Pagination:** When more than 10 posts are returned, a hint indicates the total count and instructs use of the `start` parameter to paginate.

---

##### `linkedin_create_post`

**Description:** Create a text or article post on the LinkedIn organization page. Supports plain text posts and posts with a linked article (URL + title + description).

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `commentary` | string | **Yes** | — | Post text content. This is the main post body that appears in the feed. |
| `visibility` | string | No | `"PUBLIC"` | Post visibility: `PUBLIC` (visible to everyone) or `CONNECTIONS` (visible only to followers/connections). |
| `article_url` | string | No | `null` | URL for article attachment (optional). When provided, the post renders with an article card. |
| `article_title` | string | No | `null` | Article title displayed on the card (optional, requires `article_url`). |
| `article_description` | string | No | `null` | Article description displayed on the card (optional). |

**Example invocation:**
```
Post an announcement on LinkedIn: "We just hit 1,000 users! Thank you to our incredible community." Make it public.
```

**Example output (XML):**
```xml
<created_post id="urn:li:share:7123456789012350">urn:li:share:7123456789012350</created_post>
<!-- hint: Post published successfully. -->
```

**Example invocation (article post):**
```
Post our latest blog article about AI decision-making to LinkedIn. URL: https://pymc.io/blog/ai-decisions, title: "How AI Is Changing Decision-Making", description: "A deep dive into AI-powered workflows."
```

---

##### `linkedin_update_post`

**Description:** Update the text of an existing LinkedIn post. Only the `commentary` (post text) can be updated via this tool. To change visibility or media, delete and recreate the post.

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `post_urn` | string | **Yes** | — | Post URN to update. Format: `urn:li:share:12345678901234`. Obtain from `linkedin_list_posts`. |
| `commentary` | string | **Yes** | — | New post text content to replace the existing commentary. |

**Example invocation:**
```
Update the post urn:li:share:7123456789012345 to say: "We're thrilled to announce our latest product update — now with 50% faster processing!"
```

**Example output (XML):**
```xml
<updated_post>urn:li:share:7123456789012345</updated_post>
<!-- hint: Post updated successfully. -->
```

---

##### `linkedin_delete_post`

**Description:** Permanently delete a post from the LinkedIn organization page. This action cannot be undone.

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `post_urn` | string | **Yes** | — | Post URN to delete. Format: `urn:li:share:12345678901234`. Obtain from `linkedin_list_posts`. |

**Example invocation:**
```
Delete the LinkedIn post urn:li:share:7123456789012346
```

**Example output (XML):**
```xml
<deleted_post>urn:li:share:7123456789012346</deleted_post>
<!-- hint: Post deleted successfully. -->
```

**Warning:** Deletion is permanent. The post will no longer appear on the organization page or in follower feeds.

---

#### Ads & Campaigns

---

##### `linkedin_list_ad_accounts`

**Description:** List LinkedIn ad accounts accessible to the organization. Returns account name and status (ACTIVE, CANCELLED, DRAFT, etc).

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page_size` | integer | No | `25` | Number of ad accounts per page. Maximum: 100. |

**Example invocation:**
```
List our LinkedIn ad accounts
```

**Example output (XML):**
```xml
<ad_accounts>
  <ad_account id="123456789">
    <name>PyMC Advertising Account</name>
    <status>ACTIVE</status>
  </ad_account>
</ad_accounts>
```

**Empty state output:**
```
<!-- hint: No ad accounts found. -->
```

---

##### `linkedin_list_campaigns`

**Description:** List campaigns in a LinkedIn ad account. Optionally filter by campaign status (ACTIVE, PAUSED, ARCHIVED, CANCELLED, DRAFT, etc).

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ad_account_id` | string | **Yes** | — | Ad account ID. Obtain from `linkedin_list_ad_accounts`. |
| `status_filter` | array of strings | No | `null` | Filter by status. Valid values: `ACTIVE`, `PAUSED`, `ARCHIVED`, `CANCELLED`, `DRAFT`, `PENDING_DELETION`, `REMOVED`. Pass `null` to return all campaigns. |

**Example invocation:**
```
List all active campaigns in ad account 123456789
```

**Example output (XML):**
```xml
<campaigns>
  <campaign id="987654321">
    <name>Q1 Product Launch - Awareness</name>
    <status>ACTIVE</status>
  </campaign>
  <campaign id="987654322">
    <name>Retargeting - Website Visitors</name>
    <status>ACTIVE</status>
  </campaign>
</campaigns>
```

**Empty state output:**
```
<!-- hint: No campaigns found for this ad account. -->
```

**Pagination hint:** When more than 10 campaigns exist, a hint is appended showing total count.

---

##### `linkedin_create_campaign`

**Description:** Create a new campaign in a LinkedIn ad account. The full LinkedIn Ads API campaign configuration is passed as a flexible `campaign_data` object. See LinkedIn Marketing Developer Platform docs for the complete campaign object schema.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ad_account_id` | string | **Yes** | — | Ad account ID in which to create the campaign. |
| `campaign_data` | object | **Yes** | — | Full campaign configuration. Must include `name` (string), `status` (`ACTIVE` or `PAUSED`), `type` (campaign type, e.g. `TEXT_AD`), `objectiveType` (e.g. `BRAND_AWARENESS`), and any other required LinkedIn campaign fields. |

**Example invocation:**
```
Create a paused LinkedIn campaign called "Spring Webinar Promo" in account 123456789 with objective BRAND_AWARENESS
```

**Example output (XML):**
```xml
<created_campaign id="987654399">987654399</created_campaign>
<!-- hint: Campaign created successfully. -->
```

---

##### `linkedin_update_campaign`

**Description:** Update an existing campaign in a LinkedIn ad account. Use this to pause/resume a campaign, change its budget, or update any other campaign field. Only the fields included in `patch_data` are changed — other fields remain unchanged.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ad_account_id` | string | **Yes** | — | Ad account ID that owns the campaign. |
| `campaign_id` | string | **Yes** | — | Campaign ID to update. Obtain from `linkedin_list_campaigns`. |
| `patch_data` | object | **Yes** | — | Fields to update. Common fields: `status` (`ACTIVE` or `PAUSED`), `dailyBudget` (object with `amount` and `currencyCode`), `totalBudget`, `name`. |

**Example invocation:**
```
Pause campaign 987654321 in ad account 123456789
```

**Example output (XML):**
```xml
<updated_campaign>987654321</updated_campaign>
<!-- hint: Campaign updated successfully. -->
```

---

#### Ad Analytics & Library

---

##### `linkedin_get_ad_analytics`

**Description:** Get ad performance analytics with configurable pivot dimensions, date ranges, and metric fields. Returns clicks, impressions, cost, shares, likes, comments, follows, and video views for the specified pivot and time period.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ad_account_urns` | array of strings | **Yes** | — | Ad account URNs to query. Format: `urn:li:sponsoredAccount:123456789`. |
| `pivot` | string | **Yes** | — | Pivot dimension for grouping results. Valid values: `CAMPAIGN`, `CREATIVE`, `ACCOUNT`, `MEMBER_INDUSTRY`, `MEMBER_SENIORITY`, `MEMBER_JOB_TITLE`, `MEMBER_COMPANY_SIZE`, `MEMBER_COUNTRY`, `MEMBER_REGION`. |
| `start_year` | integer | **Yes** | — | Start date year (e.g. `2026`). |
| `start_month` | integer | **Yes** | — | Start date month, 1–12. |
| `start_day` | integer | **Yes** | — | Start date day, 1–31. |
| `end_year` | integer | **Yes** | — | End date year. |
| `end_month` | integer | **Yes** | — | End date month, 1–12. |
| `end_day` | integer | **Yes** | — | End date day, 1–31. |
| `time_granularity` | string | No | `"DAILY"` | Time granularity: `DAILY`, `MONTHLY`, or `ALL` (aggregate total). |
| `fields` | array of strings | No | `null` | Specific metric fields to include. When `null`, all available metrics are returned. Valid values: `clicks`, `impressions`, `costInLocalCurrency`, `shares`, `likes`, `comments`, `follows`, `videoViews`. |
| `campaign_urns` | array of strings | No | `null` | Optional list of campaign URNs to filter by. Format: `urn:li:sponsoredCampaign:987654321`. |

**Example invocation:**
```
Show ad performance for account urn:li:sponsoredAccount:123456789 by campaign for March 2026
```

**Example output (XML):**
```xml
<ad_analytics>
  <analytics_row>
    <pivot_values>urn:li:sponsoredCampaign:987654321</pivot_values>
    <clicks>1245</clicks>
    <impressions>89432</impressions>
    <costInLocalCurrency>2341.50</costInLocalCurrency>
    <shares>34</shares>
    <likes>128</likes>
    <comments>17</comments>
    <follows>23</follows>
    <videoViews>0</videoViews>
  </analytics_row>
</ad_analytics>
```

**Empty state output:**
```
<!-- hint: No analytics data found for this query. -->
```

---

##### `linkedin_search_ad_library`

**Description:** Search the LinkedIn Ad Library for public ad transparency data. Returns advertiser names and ad types. Useful for competitive research — any LinkedIn user can search active ads from any organization.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | No | `null` | Free-text search query (optional). Searches ad text and advertiser name. |
| `advertiser_name` | string | No | `null` | Filter results to a specific advertiser by name (optional). |
| `page_size` | integer | No | `25` | Number of results per page. Maximum: 100. |

**Example invocation:**
```
Search the LinkedIn Ad Library for ads from "Anthropic"
```

**Example output (XML):**
```xml
<ad_library_results>
  <ad_library_entry>
    <advertiser_name>Anthropic</advertiser_name>
    <ad_type>SPONSORED_CONTENT</ad_type>
  </ad_library_entry>
  <ad_library_entry>
    <advertiser_name>Anthropic</advertiser_name>
    <ad_type>TEXT_AD</ad_type>
  </ad_library_entry>
</ad_library_results>
```

**Empty state output:**
```
<!-- hint: No ad library results found for this query. -->
```

---

#### Conversions

---

##### `linkedin_send_conversions`

**Description:** Send conversion events to LinkedIn for offline and online attribution tracking. Used to report conversions that happened outside of LinkedIn (e.g. a purchase after clicking an ad) so LinkedIn can attribute them to the correct campaign and creative.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `conversion_events` | array of objects | **Yes** | — | List of conversion event objects. Each object must include: `conversion` (URN of the conversion rule, format `urn:li:conversion:12345`), `conversionHappenedAt` (Unix timestamp in milliseconds), and at least one user identifier (`userInfo` object with `firstName`, `lastName`, `email`, etc.). See LinkedIn Conversions API docs for full schema. |

**Example invocation:**
```
Send a conversion event to LinkedIn: user john.doe@example.com made a purchase at timestamp 1741872000000, conversion rule urn:li:conversion:99887
```

**Example output (XML):**
```xml
<conversions_sent>1</conversions_sent>
<!-- hint: 1 conversion event(s) submitted. -->
```

---

#### Events

---

##### `linkedin_list_events`

**Description:** List events for the LinkedIn organization page. Returns event names and IDs.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:** None.

**Example invocation:**
```
List our upcoming LinkedIn events
```

**Example output (XML):**
```xml
<events>
  <event id="123456">
    <name>AI Decision-Making Webinar</name>
  </event>
  <event id="123457">
    <name>Product Demo: Spring 2026</name>
  </event>
</events>
```

**Empty state output:**
```
<!-- hint: No events found for this organization. -->
```

---

##### `linkedin_create_event`

**Description:** Create a new event on the LinkedIn organization page. The full event configuration is passed as a flexible `event_data` object. Required fields include event name, organizer URN, and start/end timestamps.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `event_data` | object | **Yes** | — | Full event configuration object. Required fields: `name` (string), `organizer` (organization URN, e.g. `urn:li:organization:12345`), `startAt` (Unix timestamp ms), `endAt` (Unix timestamp ms). Optional fields: `description` (string), `address` (object), `eventUrl` (string), `timezone` (IANA timezone string). |

**Example invocation:**
```
Create a LinkedIn event called "AI Workflow Summit 2026" starting April 15, 2026 at 2pm UTC and ending at 5pm UTC
```

**Example output (XML):**
```xml
<created_event id="urn:li:event:789012">urn:li:event:789012</created_event>
<!-- hint: Event created successfully. -->
```

---

#### Lead Gen Forms

---

##### `linkedin_get_lead_form_responses`

**Description:** Get lead form responses from LinkedIn Lead Gen Forms. Returns submitted answers (name, email, job title, company, etc.) and submission timestamps. Used to retrieve leads captured from LinkedIn ad campaigns.

**Auth token used:** Ads Token (App 1 — Advertising API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sponsored_account_urn` | string | **Yes** | — | Sponsored account URN. Format: `urn:li:sponsoredAccount:123456789`. |
| `start_ms` | integer | No | `null` | Start timestamp in milliseconds since Unix epoch (optional). When omitted, returns all available responses. |
| `end_ms` | integer | No | `null` | End timestamp in milliseconds since Unix epoch (optional). |
| `count` | integer | No | `100` | Number of responses to return. |

**Example invocation:**
```
Get all lead form responses from account urn:li:sponsoredAccount:123456789 since March 1, 2026
```

**Example output (XML):**
```xml
<lead_responses>
  <lead_response id="urn:li:leadFormResponse:aabbcc">
    <submitted_at>1741824000000</submitted_at>
    <answer>Jane Smith</answer>
    <answer>jane.smith@acmecorp.com</answer>
    <answer>VP of Engineering</answer>
  </lead_response>
</lead_responses>
```

**Empty state output:**
```
<!-- hint: No lead form responses found. -->
```

---

#### Org Statistics

---

##### `linkedin_get_share_stats`

**Description:** Get share and post engagement statistics for the LinkedIn organization (clicks, likes, comments, impressions, shares). Aggregated by time granularity (day, week, or month). Optionally filter to specific post URNs.

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_ms` | integer | No | `null` | Start timestamp in milliseconds since Unix epoch. When omitted, returns all available data. |
| `end_ms` | integer | No | `null` | End timestamp in milliseconds since Unix epoch. |
| `granularity` | string | No | `"DAY"` | Time grouping: `DAY`, `WEEK`, or `MONTH`. |
| `share_urns` | array of strings | No | `null` | Optional list of post/share URNs to filter by. Format: `urn:li:share:12345`. When `null`, returns stats for all posts. |

**Example invocation:**
```
Show our LinkedIn engagement stats for the last 30 days broken down by week
```

**Example output (XML):**
```xml
<share_statistics>
  <share_stats entity="urn:li:organization:12345">
    <clicks>892</clicks>
    <likes>347</likes>
    <comments>58</comments>
    <impressions>42180</impressions>
    <shares>94</shares>
  </share_stats>
</share_statistics>
```

**Empty state output:**
```
<!-- hint: No share statistics found for this time range. -->
```

---

##### `linkedin_get_follower_stats`

**Description:** Get follower demographics and growth statistics for the LinkedIn organization page. Returns organic and paid follower counts broken down by function (job function of followers). Useful for understanding audience composition.

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_ms` | integer | No | `null` | Start timestamp in milliseconds since Unix epoch. |
| `end_ms` | integer | No | `null` | End timestamp in milliseconds since Unix epoch. |
| `granularity` | string | No | `"DAY"` | Time grouping: `DAY`, `WEEK`, or `MONTH`. |

**Example invocation:**
```
Show our LinkedIn follower statistics for this month
```

**Example output (XML):**
```xml
<follower_statistics>
  <follower_stats entity="urn:li:organization:12345">
    <function_followers function="ENGINEERING">organic=1240 paid=85</function_followers>
    <function_followers function="INFORMATION_TECHNOLOGY">organic=893 paid=42</function_followers>
    <function_followers function="MARKETING">organic=671 paid=31</function_followers>
  </follower_stats>
</follower_statistics>
```

**Empty state output:**
```
<!-- hint: No follower statistics found for this time range. -->
```

---

##### `linkedin_get_page_stats`

**Description:** Get page view statistics for the LinkedIn organization page (total page views, breakdowns by section). Useful for measuring organization page traffic and awareness.

**Auth token used:** Community Token (App 2 — Community Management API)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_ms` | integer | No | `null` | Start timestamp in milliseconds since Unix epoch. |
| `end_ms` | integer | No | `null` | End timestamp in milliseconds since Unix epoch. |
| `granularity` | string | No | `"DAY"` | Time grouping: `DAY`, `WEEK`, or `MONTH`. |

**Example invocation:**
```
How many page views did our LinkedIn company page get this month?
```

**Example output (XML):**
```xml
<page_statistics>
  <page_stats organization="urn:li:organization:12345">
    <page_views>3847</page_views>
  </page_stats>
</page_statistics>
```

**Empty state output:**
```
<!-- hint: No page statistics found for this time range. -->
```

---

### LinkedIn Tool Summary Table

| Tool | Group | Action | Description |
|------|-------|--------|-------------|
| `linkedin_list_posts` | Posts | READ | List recent org page posts |
| `linkedin_create_post` | Posts | WRITE | Create text or article post |
| `linkedin_update_post` | Posts | WRITE | Update post text |
| `linkedin_delete_post` | Posts | WRITE | Delete a post permanently |
| `linkedin_list_ad_accounts` | Ads | READ | List accessible ad accounts |
| `linkedin_list_campaigns` | Ads | READ | List campaigns in an ad account |
| `linkedin_create_campaign` | Ads | WRITE | Create new ad campaign |
| `linkedin_update_campaign` | Ads | WRITE | Update campaign (pause, budget, etc.) |
| `linkedin_get_ad_analytics` | Analytics | READ | Ad performance by pivot + date range |
| `linkedin_search_ad_library` | Analytics | READ | Search public LinkedIn Ad Library |
| `linkedin_send_conversions` | Conversions | WRITE | Send offline/online conversion events |
| `linkedin_list_events` | Events | READ | List org page events |
| `linkedin_create_event` | Events | WRITE | Create new org page event |
| `linkedin_get_lead_form_responses` | Leads | READ | Get Lead Gen Form responses |
| `linkedin_get_share_stats` | Org Stats | READ | Post engagement stats (clicks, likes, etc.) |
| `linkedin_get_follower_stats` | Org Stats | READ | Follower demographics + growth |
| `linkedin_get_page_stats` | Org Stats | READ | Page view statistics |

---

### Google Analytics Tools (4)

**Authentication note:** All Google Analytics tools require a Google service account JSON key and a GA4 property ID. These are configured per-tenant in the Integrations page. The service account must have Viewer (or higher) access on the GA4 property. If not configured, all GA tools return: `"Google Analytics is not configured. Set GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON and GOOGLE_ANALYTICS_PROPERTY_ID."`

**Data format:** All GA tool outputs are formatted as XML `<ga-report>` with `<row>` elements containing dimension and metric values. A maximum of 50 rows are returned per call. If more rows exist, a hint is appended: `"...and N more rows. Use limit parameter or narrow date range."`

---

##### `ga_run_report`

**Description:** Run a custom Google Analytics 4 report. Specify any combination of GA4 dimensions and metrics with a date range. The most flexible GA tool — use it for any query not covered by the pre-built tools.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dimensions` | array of strings | **Yes** | — | GA4 dimension names. Examples: `date`, `sessionSourceMedium`, `sessionCampaignName`, `pagePath`, `country`, `deviceCategory`, `sessionDefaultChannelGroup`, `pageTitle`, `eventName`. |
| `metrics` | array of strings | **Yes** | — | GA4 metric names. Examples: `sessions`, `activeUsers`, `screenPageViews`, `bounceRate`, `engagementRate`, `conversions`, `totalRevenue`, `userEngagementDuration`, `newUsers`. |
| `start_date` | string | **Yes** | — | Start date in format `YYYY-MM-DD`, `NdaysAgo` (e.g. `30daysAgo`), or `today`. |
| `end_date` | string | **Yes** | — | End date in format `YYYY-MM-DD` or `today`. |
| `limit` | integer | No | `50` | Maximum rows to return. Range: 1–1000. Note: output is capped at 50 rows regardless of this value. |

**Example invocation:**
```
Show me sessions and new users by country for the last 14 days from Google Analytics
```

**Example output (XML):**
```xml
<ga-report count="42">
  <row>
    <country>United States</country>
    <sessions>12847</sessions>
    <newUsers>8934</newUsers>
  </row>
  <row>
    <country>United Kingdom</country>
    <sessions>3421</sessions>
    <newUsers>2218</newUsers>
  </row>
  <row>
    <country>Canada</country>
    <sessions>1893</sessions>
    <newUsers>1204</newUsers>
  </row>
</ga-report>
```

**Empty state output:**
```xml
<ga-report>
  <!-- hint: No data found for the specified date range and filters. -->
</ga-report>
```

---

##### `ga_get_traffic_overview`

**Description:** Get a traffic overview showing sessions and users broken down by channel group (Organic Search, Direct, Paid Social, etc.) and source/medium. Pre-built convenience tool — no need to specify dimensions or metrics. Useful for a quick summary of where traffic is coming from.

**Fixed dimensions:** `sessionDefaultChannelGroup`, `sessionSourceMedium`
**Fixed metrics:** `sessions`, `activeUsers`, `bounceRate`, `engagementRate`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | **Yes** | — | Start date: `YYYY-MM-DD`, `NdaysAgo`, or `today`. |
| `end_date` | string | **Yes** | — | End date: `YYYY-MM-DD` or `today`. |
| `limit` | integer | No | `25` | Maximum rows to return. Range: 1–500. |

**Example invocation:**
```
Give me a traffic overview for the last 30 days
```

**Example output (XML):**
```xml
<ga-report count="8">
  <row>
    <sessionDefaultChannelGroup>Organic Search</sessionDefaultChannelGroup>
    <sessionSourceMedium>google / organic</sessionSourceMedium>
    <sessions>18432</sessions>
    <activeUsers>14219</activeUsers>
    <bounceRate>0.3421</bounceRate>
    <engagementRate>0.6579</engagementRate>
  </row>
  <row>
    <sessionDefaultChannelGroup>Direct</sessionDefaultChannelGroup>
    <sessionSourceMedium>(direct) / (none)</sessionSourceMedium>
    <sessions>7823</sessions>
    <activeUsers>6104</activeUsers>
    <bounceRate>0.2918</bounceRate>
    <engagementRate>0.7082</engagementRate>
  </row>
</ga-report>
```

---

##### `ga_get_top_pages`

**Description:** Get the top pages on the site by pageviews for a date range. Returns page path, title, total views, active users, and average engagement duration per session. Useful for identifying highest-traffic content.

**Fixed dimensions:** `pagePath`, `pageTitle`
**Fixed metrics:** `screenPageViews`, `activeUsers`, `userEngagementDuration`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | **Yes** | — | Start date: `YYYY-MM-DD`, `NdaysAgo`, or `today`. |
| `end_date` | string | **Yes** | — | End date: `YYYY-MM-DD` or `today`. |
| `limit` | integer | No | `25` | Maximum rows to return. Range: 1–500. |

**Example invocation:**
```
What are our top 10 pages by views this month?
```

**Example output (XML):**
```xml
<ga-report count="10">
  <row>
    <pagePath>/</pagePath>
    <pageTitle>Daimon — AI Operating System for Discord</pageTitle>
    <screenPageViews>34821</screenPageViews>
    <activeUsers>28934</activeUsers>
    <userEngagementDuration>124.3</userEngagementDuration>
  </row>
  <row>
    <pagePath>/docs/quick-start</pagePath>
    <pageTitle>Quick Start — Daimon Docs</pageTitle>
    <screenPageViews>12483</screenPageViews>
    <activeUsers>10291</activeUsers>
    <userEngagementDuration>312.7</userEngagementDuration>
  </row>
</ga-report>
```

---

##### `ga_get_campaign_performance`

**Description:** Get Google Analytics campaign performance: sessions, users, conversions, and revenue broken down by campaign name and source/medium. Useful for evaluating the ROI of marketing campaigns tracked via UTM parameters.

**Fixed dimensions:** `sessionCampaignName`, `sessionSourceMedium`
**Fixed metrics:** `sessions`, `activeUsers`, `conversions`, `totalRevenue`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | **Yes** | — | Start date: `YYYY-MM-DD`, `NdaysAgo`, or `today`. |
| `end_date` | string | **Yes** | — | End date: `YYYY-MM-DD` or `today`. |
| `limit` | integer | No | `25` | Maximum rows to return. Range: 1–500. |

**Example invocation:**
```
How did our LinkedIn ad campaigns perform in GA last month? Show conversions and revenue.
```

**Example output (XML):**
```xml
<ga-report count="5">
  <row>
    <sessionCampaignName>Q1 Product Launch</sessionCampaignName>
    <sessionSourceMedium>linkedin / cpc</sessionSourceMedium>
    <sessions>4231</sessions>
    <activeUsers>3892</activeUsers>
    <conversions>187</conversions>
    <totalRevenue>18700.00</totalRevenue>
  </row>
  <row>
    <sessionCampaignName>Spring Webinar</sessionCampaignName>
    <sessionSourceMedium>email / newsletter</sessionSourceMedium>
    <sessions>2104</sessions>
    <activeUsers>1983</activeUsers>
    <conversions>94</conversions>
    <totalRevenue>0.00</totalRevenue>
  </row>
</ga-report>
```

**Empty state output:**
```xml
<ga-report>
  <!-- hint: No data found for the specified date range and filters. -->
</ga-report>
```

---

### Google Analytics Tool Summary Table

| Tool | Action | Fixed Dimensions | Fixed Metrics | Description |
|------|--------|-----------------|---------------|-------------|
| `ga_run_report` | READ | Custom | Custom | Flexible custom GA4 report with any dimensions + metrics |
| `ga_get_traffic_overview` | READ | channelGroup, sourceMedium | sessions, users, bounceRate, engagementRate | Traffic by channel and source/medium |
| `ga_get_top_pages` | READ | pagePath, pageTitle | pageviews, users, engagementDuration | Top pages by pageviews |
| `ga_get_campaign_performance` | READ | campaignName, sourceMedium | sessions, users, conversions, revenue | Campaign ROI tracking |

---

### Page Footer Navigation

```html
<nav class="docs-page-nav" aria-label="Docs page navigation">
  <a href="/docs/tool-reference/toggl" aria-label="Previous page: Toggl Tools">
    ← Toggl Tools
  </a>
  <a href="/docs/tool-reference/fly" aria-label="Next page: Fly, ACP, Decision Hub, Onyx & Bluedot">
    Fly, ACP, Decision Hub, Onyx & Bluedot →
  </a>
</nav>
```

---

### Loading / Empty / Error States (Tool Reference: LinkedIn & Google Analytics)

**Loading state:** Not applicable — fully static page, rendered at build time.

**Empty state:** Not applicable — content is always present.

**Error state:** If the page fails to load, `app/error.tsx` renders: "We're having trouble loading this page. Please try again in a moment." with a "Reload" button.

**Auth button (topbar):** Rendered client-side; slot is empty until auth state resolves to prevent layout shift.

---

### Accessibility (Tool Reference: LinkedIn & Google Analytics)

| Element | ARIA / Accessibility Requirement |
|---------|----------------------------------|
| `<article class="docs-content">` | `role="main"` |
| In-page TOC nav | `aria-label="On this page"` |
| Active in-page TOC link | `aria-current="location"` |
| Tool entry `<section>` headings (`h3`) | Unique `id` matching the tool function name (e.g., `id="linkedin_list_posts"`, `id="ga_run_report"`) — anchor link targets |
| Parameter tables | `<table role="table">` with `<caption class="sr-only">Parameters for {tool_name}</caption>` |
| Code blocks `<pre>` | `tabindex="0"` to allow keyboard scrolling |
| Warning note (linkedin_delete_post) | `role="note"` `aria-label="Destructive action warning"` |
| Footer nav previous/next links | `aria-label="Previous page: Toggl Tools"` and `aria-label="Next page: Fly, ACP, Decision Hub, Onyx & Bluedot"` |

---

*End of Tool Reference: LinkedIn & Google Analytics page specification (17 LinkedIn tools + 4 Google Analytics tools documented).*

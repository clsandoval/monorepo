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

---

## Tool Reference: Fly, ACP, Decision Hub, Onyx & Bluedot (`/docs/tool-reference/fly`)

**Route:** `/docs/tool-reference/fly`
**File:** `app/(docs)/docs/tool-reference/fly/page.tsx`
**Render mode:** Static (built at deploy time via `generateStaticParams`)
**Auth required:** No
**Layout:** Shared docs two-column layout (sidebar + content)

---

### Page Title & Introduction

```
# Fly, ACP, Decision Hub, Onyx & Bluedot Tools

Daimon includes 23 tools across five infrastructure and knowledge management platforms:

- **Fly.io (9 tools):** Launch, manage, and template ephemeral cloud sessions — interactive compute
  environments with full Claude access.
- **ACP — Agent Communication Protocol (4 tools):** Claude-to-Claude communication. Send messages
  and call tools on remote Fly.io sessions directly from Daimon.
- **Decision Hub (4 tools):** Search and activate skill packages that inject specialized instructions
  into your AI assistant's system prompt.
- **Onyx (2 tools):** Query your organization's knowledge base using RAG (Retrieval-Augmented
  Generation).
- **Bluedot (4 tools):** Search and read AI-transcribed meeting transcripts and summaries from your
  Bluedot workspace.

These tools are system-level and do not require you to connect personal accounts — they are
configured by your Daimon workspace and available automatically.
```

---

### In-Page Table of Contents

```
On this page
├── Fly.io Tools (9)
│   ├── Sessions
│   │   ├── fly_launch_session
│   │   ├── fly_stop_session
│   │   ├── fly_get_session_status
│   │   └── fly_list_sessions
│   ├── Images
│   │   └── fly_list_images
│   └── Templates
│       ├── fly_list_templates
│       ├── fly_save_template
│       ├── fly_delete_template
│       └── fly_launch_builder
├── ACP Tools (4)
│   ├── acp_health_check
│   ├── acp_list_tools
│   ├── acp_send_message
│   └── acp_call_tool
├── Decision Hub Tools (4)
│   ├── decision_hub_search_skills
│   ├── decision_hub_activate_skill
│   ├── decision_hub_list_active_skills
│   └── decision_hub_deactivate_skill
├── Onyx Tools (2)
│   ├── onyx_list_agents
│   └── onyx_query
└── Bluedot Tools (4)
    ├── bluedot_list_meetings
    ├── bluedot_get_transcript
    ├── bluedot_get_summary
    └── bluedot_search_transcripts
```

---

### Fly.io Tools (9)

**About Fly.io sessions:** Fly.io tools let your AI assistant spin up ephemeral cloud machines — pre-configured compute environments you can use for running notebooks, building applications, or executing code. Each session is an isolated Fly.io app that is automatically deleted when stopped. Sessions are based on reusable templates stored in your Daimon workspace.

**Authentication note:** Fly.io tools use a system-level Fly API token and organization slug configured at the platform level. You do not need to provide your own Fly.io account. These tools are available to all tenants.

---

#### Sessions

---

##### `fly_launch_session`

**Description:** Launch a new ephemeral session on Fly.io from a template. Creates a new Fly app with a running machine based on the template's Docker image. Returns URLs for accessing the session.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `template` | string | Yes | — | Template slug to launch. Use `fly_list_templates` to see available templates. |
| `region` | string | No | `"iad"` | Fly.io region code where the machine will be created. Examples: `"iad"` (Ashburn VA), `"lax"` (Los Angeles), `"cdg"` (Paris), `"nrt"` (Tokyo). |
| `cpu_kind` | string | No | `"shared"` | CPU type. `"shared"` for shared vCPU (default, lower cost). `"performance"` for dedicated vCPU (better for compute-intensive work). |
| `cpus` | integer | No | `2` | Number of CPUs to allocate. |
| `memory_mb` | integer | No | `4096` | Memory to allocate in megabytes. Minimum: 256. |

**Example invocation:**
```
Launch a new Marimo session from the "marimo-base" template in us-east
```

**Example output (XML):**
```xml
<session>
  <app_name>mmm-abc12345</app_name>
  <status>started</status>
  <region>iad</region>
  <template>marimo-base</template>
  <urls>
    <notebook>https://mmm-abc12345.fly.dev</notebook>
    <acp>https://mmm-abc12345.fly.dev/acp</acp>
  </urls>
  <machine_id>148e306c696508</machine_id>
  <cpu_kind>shared</cpu_kind>
  <cpus>2</cpus>
  <memory_mb>4096</memory_mb>
</session>
```

**Notes:**
- Session app names follow the pattern `mmm-{random}` — always a short alphanumeric suffix.
- The returned `app_name` is what you pass to other `fly_*` and `acp_*` tools.
- Sessions are ephemeral — stopping them permanently deletes all data.
- The `acp` URL is used by `acp_*` tools for Claude-to-Claude communication.

---

##### `fly_stop_session`

**Description:** Stop and delete a Fly.io session app. Permanently deletes the app and all its resources.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app_name` | string | Yes | — | Fly app name to stop (e.g., `"mmm-abc12345"`). Use `fly_list_sessions` to find running apps. |

**Example invocation:**
```
Stop the session mmm-abc12345
```

**Example output (XML):**
```xml
<result>
  <app_name>mmm-abc12345</app_name>
  <status>deleted</status>
  <message>Session mmm-abc12345 has been stopped and deleted.</message>
</result>
```

**Notes:**
- This action is **irreversible**. All data on the session machine is permanently deleted.
- The Fly app and all associated machines and volumes are destroyed.

---

##### `fly_get_session_status`

**Description:** Get status of a Fly.io session. Returns machine state, region, and access URLs.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app_name` | string | Yes | — | Fly app name to check (e.g., `"mmm-abc12345"`). |

**Example invocation:**
```
Check the status of mmm-abc12345
```

**Example output (XML):**
```xml
<session>
  <app_name>mmm-abc12345</app_name>
  <state>started</state>
  <region>iad</region>
  <urls>
    <notebook>https://mmm-abc12345.fly.dev</notebook>
    <acp>https://mmm-abc12345.fly.dev/acp</acp>
  </urls>
  <machine_id>148e306c696508</machine_id>
  <created_at>2026-03-13T14:22:00Z</created_at>
</session>
```

**Machine states:**
- `started` — running and accessible
- `stopped` — machine halted, not accessible
- `created` — machine created but not yet started
- `destroyed` — machine has been deleted

---

##### `fly_list_sessions`

**Description:** List all active Fly.io sessions. Returns list of running `mmm-*` apps with their status.

**Parameters:** None — no parameters required.

**Example invocation:**
```
Show me all my running sessions
```

**Example output (XML):**
```xml
<sessions>
  <session>
    <app_name>mmm-abc12345</app_name>
    <state>started</state>
    <region>iad</region>
    <template>marimo-base</template>
    <created_at>2026-03-13T14:22:00Z</created_at>
    <url>https://mmm-abc12345.fly.dev</url>
  </session>
  <session>
    <app_name>mmm-def67890</app_name>
    <state>started</state>
    <region>lax</region>
    <template>decision-pack-compiler</template>
    <created_at>2026-03-13T12:05:00Z</created_at>
    <url>https://mmm-def67890.fly.dev</url>
  </session>
</sessions>
<total>2</total>
```

**Notes:**
- Only returns apps matching the `mmm-*` naming pattern (session apps).
- Returns empty list if no sessions are running.

---

#### Images

---

##### `fly_list_images`

**Description:** List available Docker images from template apps. Shows images that can be used for launching new sessions.

**Parameters:** None — no parameters required.

**Example invocation:**
```
What Docker images are available for sessions?
```

**Example output (XML):**
```xml
<images>
  <image>
    <repository>registry.fly.io/marimo-base</repository>
    <tag>latest</tag>
    <digest>sha256:abc123...</digest>
    <size_mb>1240</size_mb>
    <created_at>2026-03-01T10:00:00Z</created_at>
  </image>
  <image>
    <repository>registry.fly.io/decision-pack-compiler</repository>
    <tag>latest</tag>
    <digest>sha256:def456...</digest>
    <size_mb>2100</size_mb>
    <created_at>2026-03-05T08:30:00Z</created_at>
  </image>
</images>
```

---

#### Templates

---

##### `fly_list_templates`

**Description:** List available session templates. Returns system templates and saved templates visible to the user.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `discord_user_id` | string | No | `null` | Filter saved templates by the Discord user ID who created them. If omitted, returns all system templates plus all saved templates. |

**Example invocation:**
```
What templates are available to launch?
```

**Example output (XML):**
```xml
<templates>
  <template>
    <slug>marimo-base</slug>
    <name>Marimo Notebook</name>
    <description>Interactive Python notebook environment with Claude access</description>
    <is_system>true</is_system>
    <is_public>true</is_public>
    <fly_app>marimo-base-template</fly_app>
  </template>
  <template>
    <slug>decision-pack-compiler</slug>
    <name>Decision Pack Compiler</name>
    <description>Docker-in-Docker builder with git and Claude for building decision packs</description>
    <is_system>true</is_system>
    <is_public>true</is_public>
    <fly_app>decision-pack-compiler-template</fly_app>
  </template>
  <template>
    <slug>my-data-pipeline</slug>
    <name>My Data Pipeline</name>
    <description>Custom pipeline template with dbt and Airflow</description>
    <is_system>false</is_system>
    <is_public>false</is_public>
    <owner_discord_id>123456789</owner_discord_id>
    <owner_discord_name>alice</owner_discord_name>
    <fly_app>mmm-saved-data-pipeline</fly_app>
  </template>
</templates>
```

---

##### `fly_save_template`

**Description:** Save a deployed Fly app as a reusable template. Creates a template that can be used to launch new sessions.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `slug` | string | Yes | — | Unique identifier for the template (lowercase letters, numbers, hyphens). Used as the `template` parameter when launching. |
| `name` | string | Yes | — | Human-readable display name for the template. |
| `fly_app` | string | Yes | — | Fly app name to save as a template (e.g., `"mmm-abc12345"`). The app's Docker image is recorded. |
| `description` | string | No | `null` | Optional description shown in `fly_list_templates`. |
| `source_repos` | string | No | `null` | Comma-separated source repository names associated with this template. |
| `framework` | string | No | `null` | Framework name (e.g., `"marimo"`, `"dbt"`). |
| `is_public` | boolean | No | `false` | If `true`, the template is visible to all users in the workspace. If `false`, only the creator can see it. |
| `discord_user_id` | string | No | `null` | Discord user ID of the template owner. Used for ownership verification on deletion. |
| `discord_user_name` | string | No | `null` | Discord username of the template owner. Shown in template listings. |

**Example invocation:**
```
Save my current session mmm-abc12345 as a reusable template called "My Analysis Environment"
```

**Example output (XML):**
```xml
<result>
  <slug>my-analysis-environment</slug>
  <name>My Analysis Environment</name>
  <fly_app>mmm-abc12345</fly_app>
  <is_public>false</is_public>
  <message>Template "My Analysis Environment" saved successfully.</message>
</result>
```

**Notes:**
- The template records a reference to the Fly app's current Docker image.
- The source app (`fly_app`) does not need to remain running after saving.

---

##### `fly_delete_template`

**Description:** Delete a saved template. Only the template creator can delete their templates. System templates cannot be deleted.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `slug` | string | Yes | — | Template slug to delete. |
| `discord_user_id` | string | No | `null` | Discord user ID for ownership verification. Must match the user ID recorded when the template was saved. |

**Example invocation:**
```
Delete my template "my-analysis-environment"
```

**Example output (XML):**
```xml
<result>
  <slug>my-analysis-environment</slug>
  <status>deleted</status>
  <message>Template "my-analysis-environment" has been deleted.</message>
</result>
```

**Error scenarios:**
- If `discord_user_id` does not match the template owner: `ToolError("You are not the owner of template 'my-analysis-environment'.")`
- If the slug refers to a system template: `ToolError("System templates cannot be deleted.")`
- If the slug does not exist: `ToolError("Template 'my-analysis-environment' not found.")`

---

##### `fly_launch_builder`

**Description:** Launch a Docker-in-Docker builder session. Creates a beefier session with Docker, git, and Claude assistant for building and deploying applications.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `region` | string | No | `"iad"` | Fly.io region code for the builder session. |
| `memory_mb` | integer | No | `8192` | Memory to allocate in megabytes. Default 8 GB is recommended for Docker builds. |

**Example invocation:**
```
Launch a builder session so I can build and deploy a new application
```

**Example output (XML):**
```xml
<session>
  <app_name>mmm-builder-xyz789</app_name>
  <status>started</status>
  <region>iad</region>
  <template>decision-pack-compiler</template>
  <urls>
    <builder>https://mmm-builder-xyz789.fly.dev</builder>
    <acp>https://mmm-builder-xyz789.fly.dev/acp</acp>
  </urls>
  <cpu_kind>performance</cpu_kind>
  <cpus>4</cpus>
  <memory_mb>8192</memory_mb>
</session>
```

**Notes:**
- This tool is a shortcut that always uses the `"decision-pack-compiler"` template with `cpu_kind="performance"` and `cpus=4`. These values are hardcoded and cannot be overridden.
- Builder sessions are more expensive than standard sessions due to dedicated performance CPUs.
- Use `fly_stop_session` to terminate the builder when finished.

---

### ACP — Agent Communication Protocol Tools (4)

**About ACP:** ACP (Agent Communication Protocol) enables your Daimon AI assistant to communicate directly with Claude instances running inside Fly.io sessions. This creates a Claude-to-Claude communication channel: Daimon can send messages to, and call tools on, remote session Claudes. ACP is a custom HTTP protocol built on top of MCP.

**Use pattern:** Always call `acp_health_check` first to verify the session is reachable before sending messages. Then optionally call `acp_list_tools` to see what the session Claude can do. Then use `acp_send_message` for natural language delegation or `acp_call_tool` for direct tool invocation.

**Authentication note:** ACP tools use the Fly app name for routing. No separate API credentials are required.

---

##### `acp_health_check`

**Description:** Check if ACP server is healthy on a Fly.io session. Use before sending messages to verify the session is reachable.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app_name` | string | Yes | — | Fly app name (e.g., `"mmm-abc12345"`) or local ACP address. |

**Example invocation:**
```
Check if session mmm-abc12345 is ready for ACP communication
```

**Example output (XML):**
```xml
<health>
  <app_name>mmm-abc12345</app_name>
  <status>healthy</status>
  <acp_url>https://mmm-abc12345.fly.dev/acp</acp_url>
  <response_ms>42</response_ms>
</health>
```

**Error scenarios:**
- If session is not running or ACP server not yet initialized: `ToolError("ACP server on mmm-abc12345 is not reachable. Ensure the session is running and has fully started.")`
- If app does not exist: `ToolError("Fly app 'mmm-abc12345' not found.")`

---

##### `acp_list_tools`

**Description:** List tools available to session Claude via ACP. Use to discover what capabilities the remote session has.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app_name` | string | Yes | — | Fly app name (e.g., `"mmm-abc12345"`) or local ACP address. |

**Example invocation:**
```
What tools does session mmm-abc12345 have access to?
```

**Example output (XML):**
```xml
<tools app_name="mmm-abc12345">
  <tool>
    <name>marimo__get_active_notebooks</name>
    <server>marimo</server>
    <description>List active Marimo notebooks in the current session</description>
  </tool>
  <tool>
    <name>marimo__execute_cell</name>
    <server>marimo</server>
    <description>Execute a cell in a Marimo notebook by cell ID</description>
  </tool>
  <tool>
    <name>bash__run_command</name>
    <server>bash</server>
    <description>Run a shell command in the session environment</description>
  </tool>
</tools>
<total>3</total>
```

---

##### `acp_send_message`

**Description:** Send a message to session Claude via ACP. Use for Claude-to-Claude communication with remote sessions.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app_name` | string | Yes | — | Fly app name (e.g., `"mmm-abc12345"`) or local ACP address. |
| `message` | string | Yes | — | Natural language message to send to the session Claude. The session Claude will process this as a user turn and respond. |
| `timeout` | integer | No | `120` | Response timeout in seconds. Minimum: 10. Maximum: 600. Increase for long-running tasks. |

**Example invocation:**
```
Tell the session mmm-abc12345 to run a data cleaning pipeline on the uploaded CSV
```

**Example output (XML):**
```xml
<acp_response app_name="mmm-abc12345">
  <status>completed</status>
  <response>
    I've run the data cleaning pipeline on your CSV. Here's what I found and fixed:

    - Removed 23 duplicate rows
    - Filled 5 missing values in the "email" column with empty strings
    - Standardized date formats in "created_at" to ISO 8601
    - Exported cleaned data to /output/cleaned_data.csv

    The file is ready to download from the session.
  </response>
  <duration_ms>4820</duration_ms>
</acp_response>
```

**Notes:**
- The session Claude has full access to its own tools (Marimo, bash, etc.) when processing the message.
- For very long operations (e.g., Docker builds), increase `timeout` to 300–600 seconds.
- The session Claude's response is returned verbatim — it may include code, data, or analysis.

---

##### `acp_call_tool`

**Description:** Call a specific tool on the remote session via ACP. Use to execute tools on the remote session without going through Claude.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app_name` | string | Yes | — | Fly app name (e.g., `"mmm-abc12345"`) or local ACP address. |
| `server` | string | Yes | — | MCP server name on the remote session (e.g., `"marimo"`, `"bash"`). Use `acp_list_tools` to discover available servers. |
| `tool` | string | Yes | — | Tool name on the remote MCP server (e.g., `"get_active_notebooks"`, `"run_command"`). |
| `params` | string | No | `"{}"` | Tool parameters as a JSON string. Must be valid JSON. Example: `'{"command": "ls /output"}'`. |

**Example invocation:**
```
Run "ls /output" on session mmm-abc12345 using the bash server
```

**Example output (XML):**
```xml
<acp_tool_result app_name="mmm-abc12345" server="bash" tool="run_command">
  <status>success</status>
  <result>
    cleaned_data.csv
    report.html
    model_checkpoint.pkl
  </result>
</acp_tool_result>
```

**Notes:**
- This bypasses the session Claude entirely — the tool is called directly on the MCP server.
- `params` must be a valid JSON string (double-quoted keys and values). Use `'{}'` for tools with no parameters.
- Use `acp_list_tools` first to confirm the correct server and tool names.

---

### Decision Hub Tools (4)

**About Decision Hub:** Decision Hub is a registry of "skills" — prompt engineering packages that inject specialized instructions into your AI assistant's system prompt. Activating a skill changes how Daimon approaches a domain or task for the duration of your conversation. Skills are stored as ZIP files containing system prompt fragments and configuration.

**Authentication note:** Decision Hub tools use a system-level HTTP client. No user credentials are required.

---

##### `decision_hub_search_skills`

**Description:** Search Decision Hub for skills matching a natural language query. Returns skill names, descriptions, and org slugs.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Natural language search query. Examples: `"brainstorming"`, `"data analysis"`, `"writing coach"`. |

**Example invocation:**
```
Find skills related to strategic planning
```

**Example output (XML):**
```xml
<skills>
  <skill>
    <org>pymc-labs</org>
    <name>strategic-planning</name>
    <description>Structures thinking around goals, constraints, and tradeoffs for strategic decisions</description>
    <version>1.2.0</version>
  </skill>
  <skill>
    <org>pymc-labs</org>
    <name>okr-coach</name>
    <description>Helps define and refine Objectives and Key Results following the OKR framework</description>
    <version>1.0.1</version>
  </skill>
  <skill>
    <org>community</org>
    <name>scenario-planning</name>
    <description>Facilitates scenario planning exercises using pre-mortem and futures mapping techniques</description>
    <version>0.9.0</version>
  </skill>
</skills>
<total>3</total>
```

---

##### `decision_hub_activate_skill`

**Description:** Activate a Decision Hub skill for the current conversation. Downloads and injects the skill instructions into the system prompt.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `org` | string | Yes | — | Organization slug that owns the skill (e.g., `"pymc-labs"`). Found in `decision_hub_search_skills` results. |
| `skill_name` | string | Yes | — | Skill name (e.g., `"brainstorming"`, `"strategic-planning"`). Found in `decision_hub_search_skills` results. |

**Example invocation:**
```
Activate the brainstorming skill from pymc-labs
```

**Example output (XML):**
```xml
<result>
  <org>pymc-labs</org>
  <skill_name>brainstorming</skill_name>
  <status>activated</status>
  <version>2.1.0</version>
  <description>Divergent thinking and structured ideation — helps generate and organize novel ideas</description>
  <message>Skill "brainstorming" is now active. My approach to this conversation has been updated.</message>
</result>
```

**Notes:**
- The skill's instructions are injected into the Claude system prompt for the remainder of the conversation.
- Multiple skills can be active simultaneously — their instructions are concatenated.
- Use `decision_hub_list_active_skills` to see what's currently active.

---

##### `decision_hub_list_active_skills`

**Description:** List Decision Hub skills currently active in this conversation.

**Parameters:** None — no parameters required.

**Example invocation:**
```
What skills are currently active?
```

**Example output (XML):**
```xml
<active_skills>
  <skill>
    <org>pymc-labs</org>
    <name>brainstorming</name>
    <description>Divergent thinking and structured ideation</description>
    <version>2.1.0</version>
    <activated_at>2026-03-13T15:02:00Z</activated_at>
  </skill>
  <skill>
    <org>pymc-labs</org>
    <name>strategic-planning</name>
    <description>Structures thinking around goals, constraints, and tradeoffs</description>
    <version>1.2.0</version>
    <activated_at>2026-03-13T15:05:00Z</activated_at>
  </skill>
</active_skills>
<total>2</total>
```

**Notes:**
- Returns an empty list if no skills are active.
- Skills are scoped to the current conversation and do not persist across sessions.

---

##### `decision_hub_deactivate_skill`

**Description:** Deactivate a Decision Hub skill from the current conversation.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `org` | string | Yes | — | Organization slug of the skill to deactivate (e.g., `"pymc-labs"`). |
| `skill_name` | string | Yes | — | Name of the skill to deactivate (e.g., `"brainstorming"`). |

**Example invocation:**
```
Deactivate the brainstorming skill
```

**Example output (XML):**
```xml
<result>
  <org>pymc-labs</org>
  <skill_name>brainstorming</skill_name>
  <status>deactivated</status>
  <message>Skill "brainstorming" has been removed from the current conversation.</message>
</result>
```

**Error scenarios:**
- If the skill is not currently active: `ToolError("Skill 'brainstorming' from org 'pymc-labs' is not currently active.")`

---

### Onyx Tools (2)

**About Onyx:** Onyx (formerly Danswer) is a RAG (Retrieval-Augmented Generation) knowledge base platform. Daimon's Onyx tools let your AI assistant query your organization's internal documents, wikis, and knowledge repositories with AI-generated answers and source citations.

**Authentication note:** Onyx tools use a system-level Onyx API key and base URL. You do not need to configure a personal Onyx account.

---

##### `onyx_list_agents`

**Description:** List available Onyx knowledge base agents. Returns a list of agents with their IDs, names, descriptions, and associated document sets. Use agent IDs with `onyx_query`.

**Parameters:** None — no parameters required.

**Example invocation:**
```
What knowledge base agents are available?
```

**Example output (XML):**
```xml
<agents>
  <agent>
    <id>0</id>
    <name>Default</name>
    <description>General knowledge base across all document sets</description>
    <document_sets>
      <set>Company Wiki</set>
      <set>Engineering Docs</set>
      <set>Product Specs</set>
    </document_sets>
  </agent>
  <agent>
    <id>5</id>
    <name>Engineering Assistant</name>
    <description>Focused on technical documentation, architecture decisions, and runbooks</description>
    <document_sets>
      <set>Engineering Docs</set>
      <set>Architecture ADRs</set>
      <set>Runbooks</set>
    </document_sets>
  </agent>
  <agent>
    <id>8</id>
    <name>HR & Policy</name>
    <description>Employee handbook, benefits, and HR policies</description>
    <document_sets>
      <set>Employee Handbook</set>
      <set>HR Policies</set>
    </document_sets>
  </agent>
</agents>
```

---

##### `onyx_query`

**Description:** Query the organization's knowledge base using Onyx RAG. Returns an answer with citations from source documents. Use `onyx_list_agents` to discover available agents.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | — | Natural language query. Examples: `"How do I set up a new dev environment?"`, `"What is our parental leave policy?"`. |
| `persona_id` | integer | No | `0` | Onyx agent/persona ID to query. `0` = default agent. Use `onyx_list_agents` to find available IDs. |

**Example invocation:**
```
What's the process for deploying to production?
```

**Example output (XML):**
```xml
<onyx_response>
  <answer>
    To deploy to production, follow these steps:
    1. Merge your PR to main after at least one approval
    2. The CI pipeline automatically runs tests and builds the Docker image
    3. After tests pass, trigger the deploy job in GitHub Actions
    4. Monitor the Fly.io dashboard for rollout status
    5. Run smoke tests using the checklist in the runbook

    For hotfixes, use the fast-track procedure described in the incident runbook.
  </answer>
  <sources>
    <source>
      <title>Production Deployment Runbook</title>
      <url>https://wiki.internal/runbooks/deploy</url>
      <score>0.94</score>
    </source>
    <source>
      <title>Engineering Onboarding Guide</title>
      <url>https://wiki.internal/eng/onboarding</url>
      <score>0.71</score>
    </source>
  </sources>
</onyx_response>
```

**Notes:**
- Answers are AI-generated based on retrieved document chunks — always check the cited sources for authoritative information.
- Response quality depends on the completeness of indexed documents. If results are poor, the relevant content may not be indexed in Onyx.
- For specialized domains (engineering, HR, etc.), pass the appropriate `persona_id` for better results.

---

### Bluedot Tools (4)

**About Bluedot:** Bluedot is an AI meeting recorder that automatically transcribes calls and generates summaries. Daimon's Bluedot tools let your AI assistant search and read your organization's meeting history — transcripts, summaries, action items, and attendees.

**Authentication note:** Bluedot tools read from the `bluedot_transcripts` table in your Daimon workspace database. Meetings are synced via Bluedot webhook. No per-user Bluedot credentials are required.

**Important sync note:** Only meetings that have been exported via webhook are available. Private meetings and meetings in Bluedot Collections may not sync automatically. To manually sync a meeting that's missing: open it in Bluedot → click the three-dot menu → select "Export to webhook".

---

##### `bluedot_list_meetings`

**Description:** List all accessible Bluedot meetings, newest first. Returns meetings from the workspace that have been shared or are public. Private meetings are not included. Each entry shows date, title, duration, attendees, and available content (transcript/summary). Use `date_from` and `date_to` to restrict to a specific date range (e.g., "last week", "this month", "on Feb 26").

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | No | `null` | Only include meetings on or after this date. ISO 8601 format (e.g., `"2026-02-01"`). |
| `end_date` | string | No | `null` | Only include meetings on or before this date. ISO 8601 format (e.g., `"2026-02-28"`). |

**Example invocation:**
```
Show me all meetings from last week
```

**Example output (XML):**
```xml
<meetings>
  <meeting>
    <id>meet_abc123</id>
    <title>Q1 Planning Session</title>
    <date>2026-03-10</date>
    <duration_minutes>62</duration_minutes>
    <attendees>
      <attendee>Alice Johnson</attendee>
      <attendee>Bob Smith</attendee>
      <attendee>Carol Lee</attendee>
    </attendees>
    <has_transcript>true</has_transcript>
    <has_summary>true</has_summary>
  </meeting>
  <meeting>
    <id>meet_def456</id>
    <title>1:1 with Engineering Lead</title>
    <date>2026-03-11</date>
    <duration_minutes>28</duration_minutes>
    <attendees>
      <attendee>Alice Johnson</attendee>
      <attendee>David Park</attendee>
    </attendees>
    <has_transcript>true</has_transcript>
    <has_summary>false</has_summary>
  </meeting>
</meetings>
<total>2</total>
```

---

##### `bluedot_get_transcript`

**Description:** Get the full transcript of a Bluedot meeting. Returns a speaker-attributed transcript. Use `bluedot_list_meetings` first to find the `meeting_id`.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `meeting_id` | string | Yes | — | Meeting ID from `bluedot_list_meetings` (e.g., `"meet_abc123"`). |
| `max_lines` | integer | No | `null` | Truncate the transcript to this many lines. Useful for very long meetings. If omitted, returns the full transcript. |

**Example invocation:**
```
Get the full transcript from the Q1 Planning Session on March 10
```

**Example output (XML):**
```xml
<transcript meeting_id="meet_abc123" title="Q1 Planning Session" date="2026-03-10">
  <line>
    <speaker>Alice Johnson</speaker>
    <timestamp>00:00:12</timestamp>
    <text>Alright, let's get started. The main agenda today is reviewing our Q1 roadmap...</text>
  </line>
  <line>
    <speaker>Bob Smith</speaker>
    <timestamp>00:00:45</timestamp>
    <text>I wanted to raise the infrastructure capacity question first, if that's okay.</text>
  </line>
  <line>
    <speaker>Alice Johnson</speaker>
    <timestamp>00:00:52</timestamp>
    <text>Sure, go ahead Bob.</text>
  </line>
  <!-- ... additional lines ... -->
  <line>
    <speaker>Carol Lee</speaker>
    <timestamp>01:01:30</timestamp>
    <text>Great, I'll send out the action items by end of day. Thanks everyone.</text>
  </line>
</transcript>
<total_lines>284</total_lines>
```

**Notes:**
- Transcripts are speaker-attributed based on Bluedot's AI speaker identification.
- Speaker names come from meeting participant profiles — they may be "Unknown Speaker" if Bluedot could not identify a participant.
- If `has_transcript` was `false` in `bluedot_list_meetings`, this tool will return an error.

---

##### `bluedot_get_summary`

**Description:** Get the AI-generated summary of a Bluedot meeting. Returns the meeting summary with action items and key points. Use `bluedot_list_meetings` first to find the `meeting_id`.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `meeting_id` | string | Yes | — | Meeting ID from `bluedot_list_meetings` (e.g., `"meet_abc123"`). |

**Example invocation:**
```
Summarize the Q1 Planning Session from March 10
```

**Example output (XML):**
```xml
<summary meeting_id="meet_abc123" title="Q1 Planning Session" date="2026-03-10">
  <overview>
    The team reviewed the Q1 roadmap and prioritized infrastructure capacity upgrades
    alongside three product features. Budget allocation was discussed and decisions made
    on resource distribution.
  </overview>
  <key_points>
    <point>Infrastructure capacity will be increased by 40% before March 31 to support the GA launch</point>
    <point>Feature A and Feature B are on track; Feature C is deprioritized to Q2</point>
    <point>Design review scheduled for next Tuesday at 2pm</point>
  </key_points>
  <action_items>
    <action>
      <owner>Bob Smith</owner>
      <task>Finalize infrastructure scaling plan and share with team by EOD Friday</task>
    </action>
    <action>
      <owner>Carol Lee</owner>
      <task>Send out action item list to all attendees</task>
    </action>
    <action>
      <owner>Alice Johnson</owner>
      <task>Schedule design review for next Tuesday</task>
    </action>
  </action_items>
</summary>
```

**Notes:**
- If `has_summary` was `false` in `bluedot_list_meetings`, this tool returns an error.
- Summaries are AI-generated by Bluedot — key points and action items may not be 100% accurate.

---

##### `bluedot_search_transcripts`

**Description:** Search across all accessible Bluedot transcripts and summaries. Finds meetings where the transcript or summary contains the search term. Returns matching meetings ordered newest first. **Always pass `date_from` and `date_to` when the user mentions a specific date, week, or time range — do not filter results yourself after calling this tool.**

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Keyword or phrase to search across transcripts and summaries. Example: `"product launch"`, `"budget approval"`, `"Alice`. |
| `start_date` | string | No | `null` | Search only meetings on or after this date. ISO 8601 format (e.g., `"2026-03-01"`). |
| `end_date` | string | No | `null` | Search only meetings on or before this date. ISO 8601 format (e.g., `"2026-03-13"`). |
| `limit` | integer | No | `25` | Maximum number of results to return. Range: 1–100. |

**Example invocation:**
```
Find all meetings where we discussed the product launch in March
```

**Example output (XML):**
```xml
<search_results query="product launch" start_date="2026-03-01" end_date="2026-03-13">
  <meeting>
    <id>meet_abc123</id>
    <title>Q1 Planning Session</title>
    <date>2026-03-10</date>
    <match_context>...we need the product launch to happen before March 31 to hit our Q1 target...</match_context>
    <has_transcript>true</has_transcript>
    <has_summary>true</has_summary>
  </meeting>
  <meeting>
    <id>meet_ghi789</id>
    <title>Go-to-Market Review</title>
    <date>2026-03-07</date>
    <match_context>...product launch readiness checklist reviewed — 8 of 12 items complete...</match_context>
    <has_transcript>true</has_transcript>
    <has_summary>true</has_summary>
  </meeting>
</search_results>
<total>2</total>
```

**Notes:**
- Search is full-text across both transcript content and AI-generated summaries.
- Results are ordered by meeting date, newest first.
- Use `bluedot_get_transcript` or `bluedot_get_summary` with the returned `id` to get full content.

---

### Tool Quick-Reference Table (Fly + ACP + Decision Hub + Onyx + Bluedot)

| Tool | Category | Auth | Parameters | Description |
|------|----------|------|------------|-------------|
| `fly_launch_session` | WRITE | System Fly token | template, region, cpu_kind, cpus, memory_mb | Launch ephemeral session from template |
| `fly_stop_session` | WRITE | System Fly token | app_name | Stop and permanently delete a session |
| `fly_get_session_status` | READ | System Fly token | app_name | Get machine state and URLs |
| `fly_list_sessions` | READ | System Fly token | — | List all running sessions |
| `fly_list_images` | READ | System Fly token | — | List available Docker images |
| `fly_list_templates` | READ | System Fly token | discord_user_id (optional) | List available session templates |
| `fly_save_template` | WRITE | System Fly token | slug, name, fly_app, + optional fields | Save a session as a reusable template |
| `fly_delete_template` | WRITE | System Fly token | slug, discord_user_id (optional) | Delete a saved template |
| `fly_launch_builder` | WRITE | System Fly token | region, memory_mb | Launch a Docker-in-Docker builder session |
| `acp_health_check` | READ | None (app routing) | app_name | Check ACP server reachability |
| `acp_list_tools` | READ | None (app routing) | app_name | List tools on remote session |
| `acp_send_message` | WRITE | None (app routing) | app_name, message, timeout | Send message to session Claude |
| `acp_call_tool` | WRITE | None (app routing) | app_name, server, tool, params | Call a specific tool on remote session |
| `decision_hub_search_skills` | READ | System HTTP | query | Search Decision Hub skill registry |
| `decision_hub_activate_skill` | WRITE | System HTTP | org, skill_name | Inject skill into system prompt |
| `decision_hub_list_active_skills` | READ | System HTTP | — | List currently active skills |
| `decision_hub_deactivate_skill` | WRITE | System HTTP | org, skill_name | Remove skill from system prompt |
| `onyx_list_agents` | READ | System Onyx key | — | List available knowledge base agents |
| `onyx_query` | READ | System Onyx key | message, persona_id | Query knowledge base with RAG |
| `bluedot_list_meetings` | READ | Database (db_context) | start_date, end_date | List synced meetings |
| `bluedot_get_transcript` | READ | Database (db_context) | meeting_id, max_lines | Get full speaker-attributed transcript |
| `bluedot_get_summary` | READ | Database (db_context) | meeting_id | Get AI-generated summary + action items |
| `bluedot_search_transcripts` | READ | Database (db_context) | query, start_date, end_date, limit | Full-text search across transcripts |

---

### Page Footer Navigation

```html
<nav class="docs-page-nav" aria-label="Docs page navigation">
  <a href="/docs/tool-reference/linkedin" aria-label="Previous page: LinkedIn & Google Analytics Tools">
    ← LinkedIn & Google Analytics Tools
  </a>
  <a href="/docs/tool-reference/linear" aria-label="Next page: Linear Tools">
    Linear Tools →
  </a>
</nav>
```

---

### Loading / Empty / Error States (Tool Reference: Fly, ACP, Decision Hub, Onyx & Bluedot)

**Loading state:** Not applicable — fully static page, rendered at build time.

**Empty state:** Not applicable — content is always present.

**Error state:** If the page fails to load, `app/error.tsx` renders: "We're having trouble loading this page. Please try again in a moment." with a "Reload" button.

**Auth button (topbar):** Rendered client-side; slot is empty until auth state resolves to prevent layout shift.

---

### Accessibility (Tool Reference: Fly, ACP, Decision Hub, Onyx & Bluedot)

| Element | ARIA / Accessibility Requirement |
|---------|----------------------------------|
| `<article class="docs-content">` | `role="main"` |
| In-page TOC nav | `aria-label="On this page"` |
| Active in-page TOC link | `aria-current="location"` |
| Tool entry `<section>` headings (`h5`) | Unique `id` matching the tool function name (e.g., `id="fly_launch_session"`, `id="acp_send_message"`) — anchor link targets |
| Parameter tables | `<table role="table">` with `<caption class="sr-only">Parameters for {tool_name}</caption>` |
| Code blocks `<pre>` | `tabindex="0"` to allow keyboard scrolling |
| Warning note (fly_stop_session irreversible) | `role="note"` `aria-label="Destructive action warning"` |
| Warning note (fly_delete_template irreversible) | `role="note"` `aria-label="Destructive action warning"` |
| Footer nav previous/next links | `aria-label="Previous page: LinkedIn & Google Analytics Tools"` and `aria-label="Next page: Linear Tools"` |
| Platform section headings (`h3`) | IDs: `id="fly-io-tools"`, `id="acp-tools"`, `id="decision-hub-tools"`, `id="onyx-tools"`, `id="bluedot-tools"` |

---

*End of Tool Reference: Fly, ACP, Decision Hub, Onyx & Bluedot page specification (9 Fly + 4 ACP + 4 Decision Hub + 2 Onyx + 4 Bluedot = 23 tools documented).*

---

## Page: Tool Reference — Linear (`/docs/tool-reference/linear`)

> Route: `/docs/tool-reference/linear`
> File: `app/(docs)/tool-reference/linear/page.tsx`
> Type: Static page (no data fetching)
> Title: `<title>Linear Tools — Daimon Docs</title>`
> Meta description: `"Complete reference for Daimon's Linear integration — list, search, create, and update issues through Discord using your team's Linear workspace."`

This page documents 6 tools: all Linear tools are **remote MCP tools** — they are proxied through a Streamable HTTP MCP connection rather than executed in-process. All tools require that the tenant has connected their Linear workspace via an API key (see the [Integrations page](/dashboard/integrations)).

---

### Page Header

```html
<header class="docs-page-header">
  <div class="breadcrumb">Tool Reference</div>
  <h1>Linear Tools</h1>
  <p class="subtitle">Manage issues, search tasks, and track your team's work in Linear — all from Discord.</p>
</header>
```

---

### Section: On This Page (In-page TOC)

Rendered as a sticky in-page table of contents in the right gutter (visible on desktop ≥ 1280px only; hidden on tablet/mobile).

```
On this page
────────────
• Linear Tools (6)
  · linear_list_issues
  · linear_search_issues
  · linear_get_issue
  · linear_create_issue
  · linear_update_issue
  · linear_list_teams
```

Each item is an anchor link (`href="#tool-name"`). Active item (closest heading in viewport) is bolded Navy.

---

### Callout: Remote MCP Note

Displayed immediately below the page header, before the first tool entry:

```html
<div class="callout callout-info" role="note">
  <strong>Remote MCP Integration</strong><br>
  Linear tools are powered by a remote MCP server connection. When you use a Linear tool, Daimon opens a streaming connection to the Linear MCP proxy, executes the tool, and returns the result. Response times may be slightly longer than local tools — typically 1–3 seconds.
</div>
```

---

### Callout: Requires Linear API Key

Displayed after the Remote MCP note, before the first tool entry:

```html
<div class="callout callout-warning" role="note">
  <strong>Requires Linear connection</strong><br>
  All Linear tools require a connected Linear workspace. Go to <a href="/dashboard/integrations">Integrations → Linear</a> and paste your Linear API key to enable these tools. If the key is not configured, every Linear tool call will return: <code>"Linear API key not configured. Set LINEAR_API_KEY in environment."</code>
</div>
```

---

### Section: How to Get a Linear API Key

```markdown
## Setting Up Linear

To use Linear tools, you need to connect your Linear workspace to Daimon.

**Step 1: Generate a Personal API Key**

1. Open [linear.app](https://linear.app) and sign in to your workspace.
2. Click your avatar in the bottom-left corner → **Settings**.
3. Select **API** from the left sidebar.
4. Click **Create key**.
5. Give the key a label (e.g. "Daimon Bot") and click **Create**.
6. Copy the key immediately — Linear only shows it once.

**Step 2: Connect in Daimon**

1. Go to your [Daimon Integrations page](/dashboard/integrations).
2. Find **Linear** in the service grid.
3. Click **Connect** and paste your API key.
4. Click **Save**. Daimon will validate the key by listing your teams.

**What Daimon can access**

Once connected, Daimon can read and write issues in any Linear team visible to the API key owner. The API key operates with the same permissions as your Linear account.
```

---

### Tool: `linear_list_issues`

**Section heading:** `<h2 id="linear_list_issues">linear_list_issues</h2>`

**Description:** List Linear issues, optionally filtered by team. Returns issue titles, states, assignees, and priorities.

**Platform tag:** `Platform.LINEAR`
**Action tag:** `Action.READ`
**Auth:** Requires tenant's Linear API key (from `tenant_service_connections` where `service = 'linear'`).
**Registration type:** Remote MCP proxy (not in-process).

---

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | string | No | `null` | Filter issues by this Linear team ID. If omitted, uses the tenant's default team (from `tool_context.linear_team_id`). If no default is configured, returns issues across all teams. |
| `first` | integer | No | `50` | Maximum number of issues to return. Must be between 1 and 100. |

---

**Returns:** A formatted list of issues. Each issue includes:
- Issue identifier (e.g. `BAI-42`)
- Issue title
- Workflow state (e.g. `In Progress`, `Todo`, `Done`)
- Assignee display name (or `Unassigned`)
- Priority label (`No priority`, `Urgent`, `High`, `Medium`, `Low`)

**Example output:**
```
Found 8 issues:

BAI-42 · Set up Supabase Realtime integration
  State: In Progress · Assignee: Alex Chen · Priority: High

BAI-41 · Implement tenant isolation for bot connections
  State: Todo · Assignee: Alex Chen · Priority: Urgent

BAI-39 · Write migration for tenant_api_keys table
  State: Done · Assignee: Sam Rivera · Priority: Medium

BAI-38 · Draft landing page copy
  State: In Progress · Assignee: Unassigned · Priority: Low

BAI-37 · Stripe webhook handler
  State: Todo · Assignee: Sam Rivera · Priority: High

BAI-36 · Set up Vercel deployment
  State: Todo · Assignee: Unassigned · Priority: Medium

BAI-35 · Design system tokens
  State: Done · Assignee: Alex Chen · Priority: Low

BAI-33 · Auth flow — login + signup pages
  State: Done · Assignee: Sam Rivera · Priority: High
```

**Error cases:**
- `"Linear API key not configured. Set LINEAR_API_KEY in environment."` — API key missing from tenant service connections.
- `"Linear team not found: {team_id}"` — The specified team_id does not exist or is not accessible with this API key.
- `"No issues found."` — Team exists but has no issues matching the filter.
- `"Linear API error: {message}"` — Upstream Linear API returned an error (e.g. rate limit, network failure).

---

**Usage example:**
```
You: show me all high-priority issues in team BAI-TEAM-ID
Bot: [calls linear_list_issues with team_id="BAI-TEAM-ID", first=50, then filters by priority in response]
```

---

### Tool: `linear_search_issues`

**Section heading:** `<h2 id="linear_search_issues">linear_search_issues</h2>`

**Description:** Search Linear issues by text query. Searches across issue titles and descriptions.

**Platform tag:** `Platform.LINEAR`
**Action tag:** `Action.READ`
**Auth:** Requires tenant's Linear API key.
**Registration type:** Remote MCP proxy (not in-process).

---

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Text to search for. Matched against issue titles and description bodies. Case-insensitive. |
| `first` | integer | No | `20` | Maximum number of results to return. Must be between 1 and 100. |

---

**Returns:** A list of matching issues in the same format as `linear_list_issues` output (identifier, title, state, assignee, priority), prefixed with the search query echoed back.

**Example output:**
```
Search results for "supabase":

BAI-42 · Set up Supabase Realtime integration
  State: In Progress · Assignee: Alex Chen · Priority: High

BAI-39 · Write migration for tenant_api_keys table
  State: Done · Assignee: Sam Rivera · Priority: Medium
  Description match: "...store keys in Supabase Vault with encrypt/decrypt..."
```

**Error cases:**
- `"Linear API key not configured. Set LINEAR_API_KEY in environment."` — API key missing.
- `"No issues found matching: {query}"` — Valid key, no results for the query.
- `"Linear API error: {message}"` — Upstream error.

---

**Usage example:**
```
You: find Linear issues about authentication
Bot: [calls linear_search_issues with query="authentication"]
```

---

### Tool: `linear_get_issue`

**Section heading:** `<h2 id="linear_get_issue">linear_get_issue</h2>`

**Description:** Get a single Linear issue by ID or identifier (e.g. `BAI-42`). Returns full details including description and comments.

**Platform tag:** `Platform.LINEAR`
**Action tag:** `Action.READ`
**Auth:** Requires tenant's Linear API key.
**Registration type:** Remote MCP proxy (not in-process).

---

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `issue_id` | string | Yes | — | The issue ID (UUID) or human-readable identifier (e.g. `BAI-42`). Both formats are accepted. |

---

**Returns:** Full issue details including:
- Identifier and title
- Current state
- Priority
- Assignee
- Labels (comma-separated)
- Created date and last updated date
- Full description body (markdown, rendered as-is)
- Comments: each comment shows the author, timestamp, and body text

**Example output:**
```
BAI-42 · Set up Supabase Realtime integration
State: In Progress · Priority: High · Assignee: Alex Chen
Labels: backend, infrastructure
Created: 2026-03-10 · Updated: 2026-03-12

Description:
Implement the Supabase Realtime subscription that the bot uses to watch for tenant
lifecycle events (new tenant, credential updates, reconnect requests).

Channels:
- tenant_events:{tenant_id} for per-tenant signals
- global_bot_control for system-wide signals

See realtime-contract.md for full payload shapes.

---
Comments:

Alex Chen · 2026-03-11 14:22
Started on this. Will use the multi-tenant/realtime-contract spec as the source of truth.

Sam Rivera · 2026-03-12 09:05
Reviewed — looks good. Make sure to handle reconnect on CHANNEL_ERROR.
```

**Error cases:**
- `"Linear API key not configured. Set LINEAR_API_KEY in environment."` — API key missing.
- `"Issue not found: {issue_id}"` — No issue with that ID exists or is accessible.
- `"Linear API error: {message}"` — Upstream error.

---

**Usage example:**
```
You: show me the details for BAI-42
Bot: [calls linear_get_issue with issue_id="BAI-42"]
```

---

### Tool: `linear_create_issue`

**Section heading:** `<h2 id="linear_create_issue">linear_create_issue</h2>`

**Description:** Create a new Linear issue. Requires a title. Optionally set description, priority, assignee, and labels.

**Platform tag:** `Platform.LINEAR`
**Action tag:** `Action.WRITE`
**Auth:** Requires tenant's Linear API key.
**Registration type:** Remote MCP proxy (not in-process).

---

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `title` | string | Yes | — | Issue title. Must be non-empty. Maximum 250 characters. |
| `description` | string | No | `null` | Issue body in markdown. Optional. |
| `team_id` | string | No | `null` | Linear team ID to create the issue in. If omitted, uses the tenant's default team (`tool_context.linear_team_id`). If no default is configured and no team_id is provided, returns an error. |
| `priority` | integer | No | `null` | Priority level. Valid values: `0` (no priority), `1` (urgent), `2` (high), `3` (medium), `4` (low). If omitted, issue is created with no priority. |
| `assignee_id` | string | No | `null` | Linear user ID to assign the issue to. If omitted, issue is unassigned. |
| `label_ids` | array of strings | No | `null` | List of Linear label IDs to apply to the issue. If omitted, no labels are applied. |

---

**Returns:** Confirmation with the new issue identifier, title, and a direct URL.

**Example output:**
```
Created issue BAI-48:

Title: Design the admin panel tenant list view
Team: BAI (Daimon Backend)
Priority: Medium
Assignee: Unassigned
Labels: frontend, design

View in Linear: https://linear.app/your-workspace/issue/BAI-48
```

**Error cases:**
- `"Linear API key not configured. Set LINEAR_API_KEY in environment."` — API key missing.
- `"title is required to create a Linear issue"` — title parameter was empty string or null.
- `"No team configured. Provide team_id or set a default Linear team ID."` — No team_id provided and no default configured.
- `"Assignee not found: {assignee_id}"` — The specified assignee_id does not exist in this workspace.
- `"Label not found: {label_id}"` — One or more label_ids are invalid.
- `"Linear API error: {message}"` — Upstream error (e.g. permissions, rate limit).

---

**Usage example:**
```
You: create a Linear issue: "Fix the Stripe webhook handler for subscription cancellation" — high priority, assign to Alex
Bot: [looks up Alex's user ID via linear_list_teams or prior context, then calls linear_create_issue]
```

> **Note:** To assign an issue, Daimon needs the Linear user ID. It can get this by inspecting team member lists. If asked to assign by name, Daimon will attempt to resolve the name to a user ID from the workspace. If the name is ambiguous, it will ask you to clarify.

---

### Tool: `linear_update_issue`

**Section heading:** `<h2 id="linear_update_issue">linear_update_issue</h2>`

**Description:** Update an existing Linear issue. Provide the issue ID and any fields to change (title, description, priority, state, assignee).

**Platform tag:** `Platform.LINEAR`
**Action tag:** `Action.WRITE`
**Auth:** Requires tenant's Linear API key.
**Registration type:** Remote MCP proxy (not in-process).

---

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `issue_id` | string | Yes | — | The issue ID (UUID) or human-readable identifier (e.g. `BAI-42`) to update. |
| `title` | string | No | `null` | New title for the issue. If null, title is not changed. |
| `description` | string | No | `null` | New body text in markdown. If null, description is not changed. |
| `priority` | integer | No | `null` | New priority. Valid values: `0` (none), `1` (urgent), `2` (high), `3` (medium), `4` (low). If null, priority is not changed. |
| `state_id` | string | No | `null` | New workflow state ID. If null, state is not changed. Use `linear_list_teams` to see available state IDs for a team. |
| `assignee_id` | string | No | `null` | New assignee user ID. If null, assignee is not changed. To unassign, pass an empty string `""`. |

---

**Returns:** Confirmation with the updated issue details.

**Example output:**
```
Updated BAI-42:

Title: Set up Supabase Realtime integration (unchanged)
State: Done  (was: In Progress)
Priority: High (unchanged)
Assignee: Sam Rivera  (was: Alex Chen)

View in Linear: https://linear.app/your-workspace/issue/BAI-42
```

**Error cases:**
- `"Linear API key not configured. Set LINEAR_API_KEY in environment."` — API key missing.
- `"Issue not found: {issue_id}"` — No issue with that ID or identifier exists.
- `"No fields to update. Provide at least one of: title, description, priority, state_id, assignee_id."` — Called with only issue_id, no other fields.
- `"State not found: {state_id}"` — The specified state_id does not exist in this team.
- `"Assignee not found: {assignee_id}"` — The specified assignee_id does not exist.
- `"Linear API error: {message}"` — Upstream error.

---

**Usage example:**
```
You: mark BAI-42 as done
Bot: [looks up the "Done" state_id for the issue's team via linear_list_teams, then calls linear_update_issue with issue_id="BAI-42", state_id="<done-state-id>"]
```

---

### Tool: `linear_list_teams`

**Section heading:** `<h2 id="linear_list_teams">linear_list_teams</h2>`

**Description:** List all Linear teams in the workspace. Returns team names, keys, and available workflow states.

**Platform tag:** `Platform.LINEAR`
**Action tag:** `Action.READ`
**Auth:** Requires tenant's Linear API key.
**Registration type:** Remote MCP proxy (not in-process).
**Input model:** No parameters (empty input model).

---

**Parameters:** None.

---

**Returns:** A list of all teams accessible with the API key. For each team:
- Team ID (UUID)
- Team key (short prefix, e.g. `BAI`)
- Team name
- All workflow states for that team: state ID, state name, state type (`backlog`, `unstarted`, `started`, `completed`, `cancelled`)

**Example output:**
```
3 teams in your workspace:

BAI · Daimon Backend
  Workflow states:
  - Backlog     [backlog]    ID: abc123
  - Todo        [unstarted]  ID: def456
  - In Progress [started]    ID: ghi789
  - In Review   [started]    ID: jkl012
  - Done        [completed]  ID: mno345
  - Cancelled   [cancelled]  ID: pqr678

FRN · Frontend
  Workflow states:
  - Backlog     [backlog]    ID: stu901
  - Todo        [unstarted]  ID: vwx234
  - In Progress [started]    ID: yza567
  - Done        [completed]  ID: bcd890
  - Cancelled   [cancelled]  ID: efg123

OPS · Operations
  Workflow states:
  - Todo        [unstarted]  ID: hij456
  - In Progress [started]    ID: klm789
  - Done        [completed]  ID: nop012
```

**Error cases:**
- `"Linear API key not configured. Set LINEAR_API_KEY in environment."` — API key missing.
- `"No teams found. The API key may not have access to any teams."` — Valid key but no accessible teams.
- `"Linear API error: {message}"` — Upstream error.

---

**Usage example:**
```
You: what teams do we have in Linear?
Bot: [calls linear_list_teams]

You: set BAI-42 to "In Review"
Bot: [calls linear_list_teams to resolve state name → state_id, then calls linear_update_issue]
```

> **Tip:** Use `linear_list_teams` whenever you need a state ID or team ID. The IDs are workspace-specific and cannot be guessed.

---

### Tool Quick-Reference Table (Linear)

| Tool | Category | Auth | Parameters | Description |
|------|----------|------|------------|-------------|
| `linear_list_issues` | READ | Linear API key | team_id (optional), first (default: 50) | List issues in a team, with state/assignee/priority |
| `linear_search_issues` | READ | Linear API key | query (required), first (default: 20) | Full-text search across issue titles and descriptions |
| `linear_get_issue` | READ | Linear API key | issue_id (required) | Get full details + comments for a single issue |
| `linear_create_issue` | WRITE | Linear API key | title (required), description, team_id, priority, assignee_id, label_ids | Create a new issue |
| `linear_update_issue` | WRITE | Linear API key | issue_id (required), title, description, priority, state_id, assignee_id | Update any fields of an existing issue |
| `linear_list_teams` | READ | Linear API key | — | List all workspace teams with their workflow state IDs |

---

### Remote MCP Architecture Note

```markdown
## How Linear Tools Work Under the Hood

Unlike other Daimon tools that run in-process, Linear tools are proxied through a remote MCP connection.

**Architecture:**

1. When you send a message, Claude selects a Linear tool.
2. Daimon's tool registry calls `proxy.py` — an MCP Streamable HTTP client.
3. The proxy opens a connection to the Linear MCP server endpoint.
4. The tool call is forwarded as an MCP `tools/call` request.
5. The remote server executes the Linear GraphQL API call using the tenant's API key.
6. The result is streamed back and returned as a string to Claude.

**Latency:** Remote MCP tools typically add 1–3 seconds compared to local tools.

**Failure modes:**
- If the remote MCP server is unreachable: `"Linear MCP server unavailable. Please try again."`
- If the Linear API key is invalid: `"Linear API key not configured. Set LINEAR_API_KEY in environment."`
- If the GraphQL call fails: `"Linear API error: {message}"`
```

---

### Tool Index: All Tools by Platform

> This section appears at the bottom of the Linear page and serves as the master tool index for the entire Tool Reference section.

```markdown
## Complete Tool Index

All 90 tools available in Daimon, grouped by platform. Click any tool name to jump to its documentation page.

### Discord & Core (11 tools)
| Tool | Description | Doc Page |
|------|-------------|----------|
| `discord_read_thread` | Read all messages in a thread | [Discord & Core](/docs/tool-reference/discord#discord_read_thread) |
| `discord_read_channel` | Read recent messages from a channel | [Discord & Core](/docs/tool-reference/discord#discord_read_channel) |
| `discord_parse_link` | Extract message content from a Discord URL | [Discord & Core](/docs/tool-reference/discord#discord_parse_link) |
| `discord_search_messages` | Search messages in a channel by keyword | [Discord & Core](/docs/tool-reference/discord#discord_search_messages) |
| `discord_get_message` | Fetch a single message by ID | [Discord & Core](/docs/tool-reference/discord#discord_get_message) |
| `discord_send_message` | Send a message to a channel or thread | [Discord & Core](/docs/tool-reference/discord#discord_send_message) |
| `discord_create_thread` | Create a new thread from a message | [Discord & Core](/docs/tool-reference/discord#discord_create_thread) |
| `dub_list_links` | List Dub.co short links | [Discord & Core](/docs/tool-reference/discord#dub_list_links) |
| `dub_get_analytics` | Get click analytics for a Dub.co link | [Discord & Core](/docs/tool-reference/discord#dub_get_analytics) |
| `get_credential` | Retrieve a stored secret by key name | [Discord & Core](/docs/tool-reference/discord#get_credential) |
| `github_run_gh` | Run any GitHub CLI command | [Discord & Core](/docs/tool-reference/discord#github_run_gh) |

### Toggl (34 tools)
| Tool | Description | Doc Page |
|------|-------------|----------|
| `toggl_get_me` | Get current user profile | [Toggl](/docs/tool-reference/toggl#toggl_get_me) |
| `toggl_get_workspaces` | List all accessible workspaces | [Toggl](/docs/tool-reference/toggl#toggl_get_workspaces) |
| `toggl_get_workspace` | Get details for a specific workspace | [Toggl](/docs/tool-reference/toggl#toggl_get_workspace) |
| `toggl_get_workspace_users` | List members of a workspace | [Toggl](/docs/tool-reference/toggl#toggl_get_workspace_users) |
| `toggl_get_workspace_groups` | List groups in a workspace | [Toggl](/docs/tool-reference/toggl#toggl_get_workspace_groups) |
| `toggl_get_projects` | List all projects in a workspace | [Toggl](/docs/tool-reference/toggl#toggl_get_projects) |
| `toggl_get_project` | Get details for a specific project | [Toggl](/docs/tool-reference/toggl#toggl_get_project) |
| `toggl_get_tasks` | List tasks for a project | [Toggl](/docs/tool-reference/toggl#toggl_get_tasks) |
| `toggl_get_clients` | List all clients in a workspace | [Toggl](/docs/tool-reference/toggl#toggl_get_clients) |
| `toggl_get_tags` | List all tags in a workspace | [Toggl](/docs/tool-reference/toggl#toggl_get_tags) |
| `toggl_get_current_time_entry` | Get the currently running timer | [Toggl](/docs/tool-reference/toggl#toggl_get_current_time_entry) |
| `toggl_get_time_entries` | Get time entries in a date range | [Toggl](/docs/tool-reference/toggl#toggl_get_time_entries) |
| `toggl_create_time_entry` | Create a new time entry | [Toggl](/docs/tool-reference/toggl#toggl_create_time_entry) |
| `toggl_start_timer` | Start a running timer | [Toggl](/docs/tool-reference/toggl#toggl_start_timer) |
| `toggl_stop_timer` | Stop the currently running timer | [Toggl](/docs/tool-reference/toggl#toggl_stop_timer) |
| `toggl_update_time_entry` | Update an existing time entry | [Toggl](/docs/tool-reference/toggl#toggl_update_time_entry) |
| `toggl_delete_time_entry` | Delete a time entry | [Toggl](/docs/tool-reference/toggl#toggl_delete_time_entry) |
| `toggl_create_project` | Create a new project | [Toggl](/docs/tool-reference/toggl#toggl_create_project) |
| `toggl_update_project` | Update an existing project | [Toggl](/docs/tool-reference/toggl#toggl_update_project) |
| `toggl_archive_project` | Archive a project | [Toggl](/docs/tool-reference/toggl#toggl_archive_project) |
| `toggl_create_client` | Create a new client | [Toggl](/docs/tool-reference/toggl#toggl_create_client) |
| `toggl_update_client` | Update an existing client | [Toggl](/docs/tool-reference/toggl#toggl_update_client) |
| `toggl_create_tag` | Create a new tag | [Toggl](/docs/tool-reference/toggl#toggl_create_tag) |
| `toggl_get_detailed_report` | Get detailed time report with entries | [Toggl](/docs/tool-reference/toggl#toggl_get_detailed_report) |
| `toggl_get_summary_report` | Get summary report grouped by project/user | [Toggl](/docs/tool-reference/toggl#toggl_get_summary_report) |
| `toggl_get_weekly_report` | Get weekly hours breakdown | [Toggl](/docs/tool-reference/toggl#toggl_get_weekly_report) |
| `toggl_get_earnings_report` | Get billable hours and earnings | [Toggl](/docs/tool-reference/toggl#toggl_get_earnings_report) |
| `toggl_create_workspace_user` | Invite a user to a workspace | [Toggl](/docs/tool-reference/toggl#toggl_create_workspace_user) |
| `toggl_update_workspace_user` | Update workspace user settings | [Toggl](/docs/tool-reference/toggl#toggl_update_workspace_user) |
| `toggl_delete_workspace_user` | Remove a user from a workspace | [Toggl](/docs/tool-reference/toggl#toggl_delete_workspace_user) |
| `toggl_create_group` | Create a new group | [Toggl](/docs/tool-reference/toggl#toggl_create_group) |
| `toggl_update_group` | Update a group | [Toggl](/docs/tool-reference/toggl#toggl_update_group) |
| `toggl_delete_group` | Delete a group | [Toggl](/docs/tool-reference/toggl#toggl_delete_group) |
| `toggl_workspace_time_totals` | Get time totals across all workspace members | [Toggl](/docs/tool-reference/toggl#toggl_workspace_time_totals) |

### LinkedIn & Google Analytics (21 tools)
| Tool | Description | Doc Page |
|------|-------------|----------|
| `linkedin_get_profile` | Get a LinkedIn member profile | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_profile) |
| `linkedin_get_connections` | List LinkedIn connections | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_connections) |
| `linkedin_search_people` | Search LinkedIn people | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_search_people) |
| `linkedin_get_org_profile` | Get organization profile | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_org_profile) |
| `linkedin_get_org_followers` | Get organization follower stats | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_org_followers) |
| `linkedin_get_org_posts` | Get organization posts | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_org_posts) |
| `linkedin_create_post` | Create an organization post | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_create_post) |
| `linkedin_get_post_analytics` | Get engagement stats for a post | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_post_analytics) |
| `linkedin_get_community_members` | List community members | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_community_members) |
| `linkedin_get_community_posts` | List community posts | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_community_posts) |
| `linkedin_create_community_post` | Create a community post | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_create_community_post) |
| `linkedin_get_invitations` | List pending invitations | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_invitations) |
| `linkedin_send_invitation` | Send a connection invitation | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_send_invitation) |
| `linkedin_get_campaigns` | List LinkedIn ad campaigns | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_campaigns) |
| `linkedin_get_campaign_analytics` | Get analytics for an ad campaign | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_campaign_analytics) |
| `linkedin_get_ad_accounts` | List advertising accounts | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_ad_accounts) |
| `linkedin_get_creatives` | List ad creatives | [LinkedIn & Analytics](/docs/tool-reference/linkedin#linkedin_get_creatives) |
| `ga_run_report` | Run a custom GA4 report | [LinkedIn & Analytics](/docs/tool-reference/linkedin#ga_run_report) |
| `ga_get_traffic_overview` | Get traffic overview (sessions, users, pageviews) | [LinkedIn & Analytics](/docs/tool-reference/linkedin#ga_get_traffic_overview) |
| `ga_get_top_pages` | Get top pages by sessions | [LinkedIn & Analytics](/docs/tool-reference/linkedin#ga_get_top_pages) |
| `ga_get_campaign_performance` | Get UTM campaign performance | [LinkedIn & Analytics](/docs/tool-reference/linkedin#ga_get_campaign_performance) |

### Fly & Infrastructure (23 tools)
| Tool | Description | Doc Page |
|------|-------------|----------|
| `fly_launch_session` | Launch an ephemeral session from a template | [Fly & Infrastructure](/docs/tool-reference/fly#fly_launch_session) |
| `fly_stop_session` | Stop and permanently delete a session | [Fly & Infrastructure](/docs/tool-reference/fly#fly_stop_session) |
| `fly_get_session_status` | Get machine state and URLs for a session | [Fly & Infrastructure](/docs/tool-reference/fly#fly_get_session_status) |
| `fly_list_sessions` | List all running sessions | [Fly & Infrastructure](/docs/tool-reference/fly#fly_list_sessions) |
| `fly_list_images` | List available Docker images | [Fly & Infrastructure](/docs/tool-reference/fly#fly_list_images) |
| `fly_list_templates` | List available session templates | [Fly & Infrastructure](/docs/tool-reference/fly#fly_list_templates) |
| `fly_save_template` | Save a session as a reusable template | [Fly & Infrastructure](/docs/tool-reference/fly#fly_save_template) |
| `fly_delete_template` | Delete a saved template | [Fly & Infrastructure](/docs/tool-reference/fly#fly_delete_template) |
| `fly_launch_builder` | Launch a Docker-in-Docker builder session | [Fly & Infrastructure](/docs/tool-reference/fly#fly_launch_builder) |
| `acp_health_check` | Check ACP server reachability | [Fly & Infrastructure](/docs/tool-reference/fly#acp_health_check) |
| `acp_list_tools` | List tools on a remote session | [Fly & Infrastructure](/docs/tool-reference/fly#acp_list_tools) |
| `acp_send_message` | Send a message to a session's Claude | [Fly & Infrastructure](/docs/tool-reference/fly#acp_send_message) |
| `acp_call_tool` | Call a specific tool on a remote session | [Fly & Infrastructure](/docs/tool-reference/fly#acp_call_tool) |
| `decision_hub_search_skills` | Search the Decision Hub skill registry | [Fly & Infrastructure](/docs/tool-reference/fly#decision_hub_search_skills) |
| `decision_hub_activate_skill` | Inject a skill into the system prompt | [Fly & Infrastructure](/docs/tool-reference/fly#decision_hub_activate_skill) |
| `decision_hub_list_active_skills` | List currently active skills | [Fly & Infrastructure](/docs/tool-reference/fly#decision_hub_list_active_skills) |
| `decision_hub_deactivate_skill` | Remove a skill from the system prompt | [Fly & Infrastructure](/docs/tool-reference/fly#decision_hub_deactivate_skill) |
| `onyx_list_agents` | List available knowledge base agents | [Fly & Infrastructure](/docs/tool-reference/fly#onyx_list_agents) |
| `onyx_query` | Query the knowledge base with RAG | [Fly & Infrastructure](/docs/tool-reference/fly#onyx_query) |
| `bluedot_list_meetings` | List synced meetings | [Fly & Infrastructure](/docs/tool-reference/fly#bluedot_list_meetings) |
| `bluedot_get_transcript` | Get full speaker-attributed transcript | [Fly & Infrastructure](/docs/tool-reference/fly#bluedot_get_transcript) |
| `bluedot_get_summary` | Get AI-generated summary + action items | [Fly & Infrastructure](/docs/tool-reference/fly#bluedot_get_summary) |
| `bluedot_search_transcripts` | Full-text search across transcripts | [Fly & Infrastructure](/docs/tool-reference/fly#bluedot_search_transcripts) |

### Linear (6 tools — remote MCP)
| Tool | Description | Doc Page |
|------|-------------|----------|
| `linear_list_issues` | List issues, filtered by team | [Linear](/docs/tool-reference/linear#linear_list_issues) |
| `linear_search_issues` | Search issues by text query | [Linear](/docs/tool-reference/linear#linear_search_issues) |
| `linear_get_issue` | Get full details + comments for one issue | [Linear](/docs/tool-reference/linear#linear_get_issue) |
| `linear_create_issue` | Create a new issue | [Linear](/docs/tool-reference/linear#linear_create_issue) |
| `linear_update_issue` | Update title, state, priority, assignee | [Linear](/docs/tool-reference/linear#linear_update_issue) |
| `linear_list_teams` | List teams and their workflow state IDs | [Linear](/docs/tool-reference/linear#linear_list_teams) |

**Total: 90 tools** (84 local tools + 6 remote MCP)
```

---

### Page Footer Navigation

```html
<nav class="docs-page-nav" aria-label="Docs page navigation">
  <a href="/docs/tool-reference/fly" aria-label="Previous page: Fly & Infrastructure Tools">
    ← Fly & Infrastructure Tools
  </a>
  <a href="/docs/faq" aria-label="Next page: FAQ">
    FAQ →
  </a>
</nav>
```

---

### Loading / Empty / Error States (Tool Reference: Linear)

**Loading state:** Not applicable — fully static page, rendered at build time.

**Empty state:** Not applicable — content is always present.

**Error state:** If the page fails to load, `app/error.tsx` renders: "We're having trouble loading this page. Please try again in a moment." with a "Reload" button.

**Auth button (topbar):** Rendered client-side; slot is empty until auth state resolves to prevent layout shift.

---

### Accessibility (Tool Reference: Linear)

| Element | ARIA / Accessibility Requirement |
|---------|----------------------------------|
| `<article class="docs-content">` | `role="main"` |
| In-page TOC nav | `aria-label="On this page"` |
| Active in-page TOC link | `aria-current="location"` |
| Remote MCP callout | `role="note"` `aria-label="Remote MCP architecture note"` |
| Requires API key callout | `role="note"` `aria-label="Requires Linear API key"` |
| Tool entry `<section>` headings (`h2`) | Unique `id` matching the tool function name (e.g., `id="linear_list_issues"`, `id="linear_create_issue"`) — anchor link targets |
| Parameter tables | `<table role="table">` with `<caption class="sr-only">Parameters for {tool_name}</caption>` |
| Code blocks `<pre>` | `tabindex="0"` to allow keyboard scrolling |
| Complete Tool Index tables | `<caption class="sr-only">All {platform} tools with links to documentation</caption>` |
| Footer nav previous/next links | `aria-label="Previous page: Fly & Infrastructure Tools"` and `aria-label="Next page: FAQ"` |
| "How to Get a Linear API Key" section heading | `id="setting-up-linear"` — anchor link target |
| Complete Tool Index heading | `id="complete-tool-index"` — anchor link target |

---

*End of Tool Reference: Linear page specification (6 remote MCP tools documented) + Complete Tool Index (90 tools across all platforms).*

---

## Page: FAQ

> Route: `/docs/faq`
> File: `app/(docs)/faq/page.tsx`
> Type: Static page (no data fetching)
> Title: `<title>FAQ — Daimon Docs</title>`
> Meta description: `"Answers to common questions about Daimon: billing, security, bot setup, troubleshooting, and account limits."`

---

### Page Header

```html
<header class="docs-page-header">
  <div class="breadcrumb">Account &amp; Billing</div>
  <h1>Frequently Asked Questions</h1>
  <p class="subtitle">Answers to the most common questions about Daimon.</p>
</header>
```

| Property | Value |
|----------|-------|
| `h1` | Archivo SemiBold, 32px, Navy `#0C1F40` |
| Subtitle | Inter Regular, 18px, `#6B7280`, margin-top: 8px |
| Breadcrumb | Inter Regular, 13px, Aqua `#B4E7DD`, text-transform: uppercase, letter-spacing: 0.08em, margin-bottom: 8px |

---

### Page Structure

The FAQ page uses a collapsible accordion component grouped into labeled sections. Each section has an `<h2>` header followed by a list of question/answer accordion items. Every question is a `<details>` element with a `<summary>` for the question text and a `<div class="faq-answer">` for the answer body.

**On-page navigation (in-page TOC):** Floats to the right on desktop (same as other docs pages). Links to section anchors:

```
- Billing & Pricing
- Security
- Bot Setup & Discord
- Integrations & Tools
- Troubleshooting
- Limits & Quotas
- Account & Teams
```

**All sections and questions are expanded by default on page load** (the `open` attribute is present on each `<details>` element). Users can collapse individual questions by clicking the summary.

**Accordion styling:**

```css
details.faq-item {
  border: 1px solid #E5E7EB;
  border-radius: 0px;
  margin-bottom: 8px;
  background: #FFFFFF;
}
details.faq-item[open] {
  background: #FAFAFA;
}
details.faq-item summary {
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  color: #0C1F40;
  padding: 16px 20px;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
details.faq-item summary::-webkit-details-marker { display: none; }
details.faq-item summary::after {
  content: "+";
  font-size: 20px;
  color: #6B7280;
  flex-shrink: 0;
  transition: transform 200ms ease;
}
details.faq-item[open] summary::after {
  content: "−";
}
div.faq-answer {
  padding: 0 20px 20px 20px;
  font-family: Inter;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}
div.faq-answer p { margin: 0 0 12px 0; }
div.faq-answer p:last-child { margin-bottom: 0; }
div.faq-answer ul { margin: 0 0 12px 0; padding-left: 20px; }
div.faq-answer ul li { margin-bottom: 6px; }
div.faq-answer a { color: #3F85CC; text-decoration: underline; }
div.faq-answer code { font-family: 'Courier New', monospace; font-size: 13px; background: #F3F4F6; padding: 2px 6px; }
```

---

### Section: Billing & Pricing

Anchor: `id="billing-pricing"`

```html
<h2 id="billing-pricing">Billing &amp; Pricing</h2>
```

---

#### Q: What plans does Daimon offer?

**A:**

Daimon offers three plans:

- **Free** — $0/month. Includes 1 Discord connection, all 50+ tools, and community support. You bring your own Anthropic API key. No credit card required to start.
- **Starter** — $9/month (or $79/year, saving $29). Includes up to 3 Discord connections, all tools, and email support.
- **Pro** — $29/month (or $249/year, saving $99). Includes unlimited Discord connections, all tools, priority support, and a 99.9% bot uptime SLA.

All plans include every tool that Daimon supports — there is no feature gating on tools. The only differences between plans are the number of Discord connections you can run simultaneously and the level of support you receive.

---

#### Q: Do I need a credit card to sign up?

**A:**

No. You can sign up and use the Free plan without providing any payment information. A credit card is only required when you upgrade to Starter or Pro.

---

#### Q: How does billing work?

**A:**

Daimon charges a flat monthly (or annual) platform fee via Stripe. This covers running the bot infrastructure for your account.

You are billed separately by Anthropic for your Claude API usage — Daimon does not see, mark up, or resell your Anthropic API costs. Those charges appear on your Anthropic account directly.

Your Daimon subscription renews automatically on the same date each billing period. You can cancel at any time from the Billing page — your access continues until the end of your current billing period.

---

#### Q: What is the "bring your own key" model?

**A:**

Daimon does not bundle Claude API access into your subscription. Instead, you paste your own Anthropic API key into the Billing page. Daimon uses that key to make Claude API calls on your behalf.

This means:
- You only pay Anthropic for the Claude API calls your bot actually makes.
- Daimon cannot see your API usage or balance.
- You have full control over your Anthropic API key — you can revoke it at any time.
- You pay Anthropic's standard API pricing, which varies by model and token count.

The Daimon platform fee is separate from and independent of your Anthropic API costs.

---

#### Q: Can I switch plans at any time?

**A:**

Yes. You can upgrade or downgrade your plan at any time from the Billing page.

**Upgrading (e.g., Free → Starter, or Starter → Pro):** You are redirected to Stripe Checkout to enter payment information. Your new plan takes effect immediately after successful payment. You are billed pro-rated for the remainder of the current billing period.

**Downgrading (e.g., Pro → Starter, or Starter → Free):** Downgrade requests are processed through the Stripe Customer Portal. Your current plan remains active until the end of your billing period, then the lower plan takes effect.

**Canceling:** You can cancel your subscription from the Stripe Customer Portal. Your access to the paid plan features continues until the end of the current billing period, then your account automatically moves to the Free plan.

---

#### Q: What happens if my payment fails?

**A:**

If your payment fails, Stripe retries the charge automatically over several days. During this time:

- Your bot continues to run normally (grace period).
- A warning banner appears on your Daimon dashboard indicating the payment issue.
- You will receive email notifications from Stripe to the address on file.

If the payment continues to fail after the retry period, your account will be suspended. While suspended, your bot goes offline. You can restore access by updating your payment method in the Stripe Customer Portal (accessible via the "Update Payment Method" link on your Billing page).

---

#### Q: Can I get a refund?

**A:**

Daimon does not offer refunds for partial billing periods. If you cancel mid-cycle, your access continues until the end of the period you already paid for. We do not issue prorated refunds for unused time.

If you believe you were charged in error, contact support@daimon.ai and we will review your case.

---

#### Q: Is annual billing available?

**A:**

Yes. Both Starter and Pro plans are available on annual billing at a discount:

- Starter annual: $79/year (saves $29 compared to 12 months of monthly billing)
- Pro annual: $249/year (saves $99 compared to 12 months of monthly billing)

You can select annual or monthly billing during Stripe Checkout. To switch between monthly and annual, contact support@daimon.ai.

---

#### Q: Does Daimon charge me for the Anthropic API calls my bot makes?

**A:**

No. Daimon does not charge for Claude API usage. You pay Anthropic directly via your own API key. Your Daimon subscription fee covers only the platform infrastructure (hosting, database, bot runtime). Your Anthropic account is billed separately at Anthropic's standard API rates.

---

#### Q: What happens to my account if I downgrade from Starter/Pro to Free?

**A:**

When your subscription to Starter or Pro ends and you move to the Free plan:

- Your account retains only 1 Discord connection. If you had multiple connections configured, only the first (oldest) connection remains active. Additional connections are disabled but their configuration is preserved — if you re-upgrade, they become active again.
- All your service integrations (GitHub, Google, Linear, Toggl, etc.) remain connected.
- All your data (history, settings, API keys) is preserved.
- Support tier reverts to community support.

---

### Section: Security

Anchor: `id="security"`

```html
<h2 id="security">Security</h2>
```

---

#### Q: How are my API keys stored?

**A:**

All API keys you provide to Daimon — your Anthropic key, OpenAI key, Toggl API key, and any other service API keys — are encrypted at rest using Supabase Vault (AES-256-GCM encryption). Keys are never stored in plaintext in the database.

In the Daimon dashboard, you will never see your full API key after saving it. Only a short hint (e.g., the last 4 characters: `...sk-ant-...xYzW`) is displayed so you can identify which key is saved.

The encrypted keys are only decrypted at the moment the bot needs to make an API call, inside the bot's secure runtime environment. They are never logged, exposed in API responses, or sent to the browser.

---

#### Q: Is my Discord bot token secure?

**A:**

Yes. Your Discord bot token is encrypted using Supabase Vault (AES-256-GCM) before being stored in the database — the same encryption used for API keys. The token is never stored in plaintext.

The token is only decrypted at the moment the bot process establishes a Discord connection. It is never returned to the browser or included in API responses. Only a short hint is shown in your dashboard to confirm a token is saved.

If your bot token is ever compromised, you can regenerate it immediately in the Discord Developer Portal. Paste the new token in your Daimon Settings page to update it. Your old token is automatically invalidated by Discord when regenerated.

---

#### Q: Who can see my API keys?

**A:**

No one can see your full API keys after you save them — not even Daimon staff. The keys are encrypted with a key managed by Supabase Vault, and the decrypted values are only accessible inside the bot's runtime process when needed for API calls.

Daimon staff with database access would see only the encrypted ciphertext, which is not usable without the Vault encryption key. The Vault key itself is managed by Supabase's secure infrastructure.

---

#### Q: Can my team members see my API keys?

**A:**

No. Team members added to your workspace cannot view any API keys. Only the workspace owner can save, update, or delete API keys (and they cannot read back the full key — only a hint is shown). Admin and member roles have read-only visibility into whether keys are configured, but cannot view or modify key values.

---

#### Q: Does Daimon have access to my Discord messages?

**A:**

Yes, in the sense that your bot processes messages sent to it in Discord. Your Daimon bot reads messages from your Discord server in real time in order to respond to them. This is fundamental to how the bot works.

Daimon may log message metadata (such as user IDs, timestamps, and channel IDs) for operational purposes such as debugging and performance monitoring. We do not read or log the content of your Discord messages beyond what is necessary to operate the bot.

See the Daimon Privacy Policy at daimon.app/privacy for full details on data handling.

---

#### Q: Is my data isolated from other Daimon users?

**A:**

Yes. Daimon uses a multi-tenant architecture where all users share the same underlying infrastructure (database, bot runtime), but all data is logically isolated by your tenant ID.

Every database row that contains your data (messages, configuration, API keys, connections) is tagged with your unique tenant ID. Row Level Security (RLS) policies enforced at the database level ensure that one tenant's data is never accessible to another tenant's queries — even in the event of an application bug.

Your bot token and API keys are tenant-scoped: your bot only has access to your own secrets, not other tenants' keys.

---

#### Q: What happens to my data if I delete my account?

**A:**

When you delete your account:

1. All your API keys and service connection tokens are immediately and permanently deleted from Supabase Vault.
2. Your Discord connection configuration is deleted, and your bot is disconnected from Discord.
3. Your tenant record, member records, and subscription are deleted.
4. Message history and activity logs are deleted within 30 days (may be retained in database backups for up to 90 days per our backup retention policy, after which they are permanently removed).

Account deletion is permanent and cannot be undone. Export any data you need before deleting your account.

---

### Section: Bot Setup & Discord

Anchor: `id="bot-setup-discord"`

```html
<h2 id="bot-setup-discord">Bot Setup &amp; Discord</h2>
```

---

#### Q: How does Daimon connect to my Discord server?

**A:**

You create a Discord bot application yourself in the Discord Developer Portal (discord.com/developers/applications). After creating the bot, you copy two things to Daimon:

1. **Bot Token** — Found in the Bot section of your Discord application. This is the secret credential that lets Daimon log in as your bot.
2. **Guild ID** — The numeric ID of your Discord server. You can get this by right-clicking your server name in Discord (with Developer Mode enabled) and selecting "Copy Server ID."

You paste both values into Daimon's Settings page under "Discord Connection." Daimon validates the token (by verifying it authenticates with Discord) and then connects the bot to your server.

---

#### Q: Do I need to create my own Discord bot?

**A:**

Yes. Daimon does not provide a shared bot — you create and own your own Discord application. This means:

- You control the bot's name, avatar, and permissions.
- Your bot token belongs to you. You can regenerate it or delete the application at any time.
- There is no shared bot that multiple users connect to.

The Quick Start guide walks you through creating a Discord application step by step — it takes about 3 minutes.

---

#### Q: What permissions does my Discord bot need?

**A:**

Your bot needs the following permissions when added to your server:

| Permission | Why it's needed |
|-----------|----------------|
| Send Messages | To respond to user commands in channels |
| Read Messages / View Channels | To receive messages from users |
| Read Message History | To look up prior messages when needed |
| Embed Links | To send formatted response cards |
| Attach Files | To send file attachments (e.g., CSV exports from Toggl) |
| Use Slash Commands | To register and respond to slash commands |
| Add Reactions | To react to messages as acknowledgment |
| Manage Messages | To delete bot messages in cleanup operations |

The recommended way to set permissions: When generating the bot invite URL in the Discord Developer Portal, select these permissions and use the generated URL to add the bot to your server.

Additionally, enable the following **Privileged Gateway Intents** in the Bot settings of the Developer Portal:
- **Server Members Intent** — Required for the bot to see member lists.
- **Message Content Intent** — Required for the bot to read message content (not just slash command interactions).

Without the Message Content Intent, your bot will not be able to read the content of regular messages, only slash command payloads.

---

#### Q: Can I use Daimon with multiple Discord servers?

**A:**

Yes, on Starter and Pro plans.

- **Free plan**: 1 Discord connection (1 bot token + 1 guild ID).
- **Starter plan**: Up to 3 Discord connections.
- **Pro plan**: Unlimited Discord connections.

Each connection is a separate Discord bot token connected to a separate guild. You manage connections from the Settings page. Each bot must be separately created in the Discord Developer Portal and invited to its respective server.

---

#### Q: My bot token is invalid. What do I do?

**A:**

A "bot token is invalid" error typically means one of the following:

1. **The token was copied incorrectly** — Make sure to copy the full token from the Discord Developer Portal without any leading or trailing spaces. Try pasting it into a plain text editor first to check.
2. **The token was regenerated** — If you clicked "Reset Token" in the Discord Developer Portal, the old token is immediately invalidated. Paste the new token into Daimon's Settings page.
3. **The Discord application was deleted** — If the application no longer exists, the token cannot be used. Create a new Discord application and bot, then paste the new token.

After pasting a new valid token, click "Validate & Connect" on the Settings page. If validation passes, your bot will attempt to connect to Discord within 30 seconds.

---

#### Q: My bot is online but not responding. What do I check?

**A:**

If your bot shows as "Online" in Daimon but is not responding to messages in Discord:

1. **Check the Message Content Intent** — Go to your Discord Developer Portal → your application → Bot → scroll to "Privileged Gateway Intents" — make sure "Message Content Intent" is enabled. Without this, the bot receives message events but cannot read the message text.

2. **Check the channel** — Make sure you are messaging the bot in a channel where the bot has permission to read messages and send responses. The bot must have "View Channel," "Send Messages," and "Read Message History" permissions in that specific channel.

3. **Check whether you @mentioned the bot** — By default, Daimon bots respond to messages that @mention them (e.g., `@MyBot can you summarize today's activity?`). Simply typing in a channel without a mention may not trigger the bot.

4. **Check the Anthropic API key** — Go to Billing & Keys → API Keys. If your Anthropic key is missing or shows "Invalid," the bot cannot make Claude API calls and will fail silently. Save a valid key and click "Validate."

5. **Check your plan** — Free plan users are limited to 1 active connection. If you added multiple connections, only one is active.

---

#### Q: What does "bot status: connecting" mean?

**A:**

"Connecting" means Daimon has received your bot token and is currently attempting to establish a WebSocket connection to Discord's Gateway. This state typically lasts less than 30 seconds.

If your bot stays in "Connecting" for more than 2 minutes, the token may be invalid (connection is failing silently) or Discord may be experiencing an outage. Check [Discord's status page](https://discordstatus.com) and verify your token by re-entering it on the Settings page.

---

#### Q: What does "bot status: error" mean?

**A:**

"Error" means the bot attempted to connect to Discord but received an error response. Common causes:

| Error reason | What to do |
|-------------|------------|
| Invalid token | Regenerate the token in the Discord Developer Portal and paste the new token into Settings |
| Disallowed intents | Enable "Message Content Intent" and "Server Members Intent" in the Developer Portal under Bot → Privileged Gateway Intents |
| Bot not in server | The bot was removed from your Discord server. Re-invite it using your bot's invite URL |
| Discord API outage | Wait for Discord to recover. Check discordstatus.com |

The error state auto-clears when the bot successfully reconnects. You can force a reconnect attempt by toggling the connection off and back on in Settings.

---

#### Q: Can I change my bot token after setup?

**A:**

Yes. Go to Settings → Discord Connections → click the gear icon next to your connection → select "Update Token." Paste your new token and click "Validate & Save." The old token is replaced immediately and the bot reconnects using the new token.

If you regenerated your token in the Discord Developer Portal, you must update it in Daimon immediately or your bot will go offline (the old token is invalidated by Discord the moment you regenerate it).

---

### Section: Integrations & Tools

Anchor: `id="integrations-tools"`

```html
<h2 id="integrations-tools">Integrations &amp; Tools</h2>
```

---

#### Q: What tools does Daimon include?

**A:**

Daimon includes 90+ tools across multiple platforms. Every plan (Free, Starter, Pro) includes all tools — there is no tool gating. The tools you can actually use depend only on which services you have connected.

**Included tool categories:**

| Category | Tools | Connection required |
|----------|-------|-------------------|
| Discord | Send messages, create threads, manage channels, list members (7 tools) | None (always available via the bot's own token) |
| Dub | Create, retrieve, update short links (2 tools) | Dub API key |
| Credentials | Retrieve stored service credentials (1 tool) | None (built-in) |
| GitHub | Create, update, comment on issues and PRs (8 tools) | GitHub OAuth |
| Toggl | Full time tracking — entries, projects, clients, workspaces, reports (34 tools) | Toggl API key |
| LinkedIn | Profile reads, job searches, company data, connections (17 tools) | LinkedIn OAuth |
| Google Analytics | Property list, report runs, audience data, realtime (4 tools) | Google OAuth |
| Fly | App management, machine management, releases, logs (9 tools) | Fly API token |
| ACP (Agent Control Plane) | Agent status and job management (4 tools) | ACP API key |
| Decision Hub | Channel configuration, decision records (4 tools) | None (built-in) |
| Onyx | Document search and retrieval (2 tools) | Onyx API key |
| Bluedot | Meeting notes, transcript search (4 tools) | Bluedot API key |
| Linear (remote MCP) | Issue creation, search, update, project management (6 tools) | Linear OAuth |

See the [Tool Reference](/docs/tool-reference/discord) section for the complete list with parameters and examples.

---

#### Q: How do I connect a service to use its tools?

**A:**

Service connections are managed from the Integrations page in your dashboard. Each service has its own connection method:

- **OAuth services (GitHub, Google/Google Analytics, Linear, LinkedIn):** Click "Connect" next to the service. You will be redirected to that service's authorization page. After granting permissions, you are returned to Daimon and the connection is saved automatically.

- **API key services (Toggl, Fly, ACP, Onyx, Bluedot, Dub, Daimon/Decision Hub API keys):** Click "Connect" next to the service. A modal appears with a text input field. Paste your API key (found in that service's settings page) and click "Save & Validate." Daimon tests the key immediately — if valid, the connection is saved; if invalid, an error is shown.

---

#### Q: What happens if I remove a service integration?

**A:**

When you disconnect a service:

- The stored OAuth token or API key is permanently deleted from Daimon's database.
- Any bot commands that rely on that service's tools will fail with a "service not connected" message in Discord.
- Reconnecting the service later restores full tool access — you will need to re-authorize via OAuth or re-enter the API key.
- No historical data from that service is deleted from Daimon (conversation logs remain, but new tool calls to that service will fail until reconnected).

---

#### Q: I connected GitHub but the bot says it's not authorized. What do I do?

**A:**

This typically means the OAuth token has expired or been revoked. OAuth access tokens from GitHub can be revoked by the user from GitHub's Authorized Apps settings page.

To fix this: Go to Integrations → click "Reconnect" next to GitHub. You will be redirected through the GitHub OAuth flow to grant fresh permissions. After completing the flow, a new token is saved and the bot can use GitHub tools immediately.

---

#### Q: Can I use the bot without connecting any integrations?

**A:**

Yes. The Discord tools (send messages, create threads, manage channels, list members) and Decision Hub tools are available without any external service connections. You only need your Anthropic API key (required) and Discord bot token (required) to have a working bot.

Other tools simply won't work until you connect the corresponding service. If you ask the bot to create a GitHub issue without GitHub connected, it will tell you in Discord that the GitHub integration is not configured.

---

#### Q: Does Daimon support custom tools or plugins?

**A:**

Not in the current version. The tool set is fixed to the 90+ tools described in the Tool Reference. Custom tool extensions are a planned feature for a future release.

---

### Section: Troubleshooting

Anchor: `id="troubleshooting"`

```html
<h2 id="troubleshooting">Troubleshooting</h2>
```

---

#### Q: My bot went offline suddenly. What happened?

**A:**

Bots can go offline for several reasons:

1. **Discord Gateway disconnect** — Discord periodically disconnects bots. Daimon automatically reconnects within 10–30 seconds. If the bot stays offline, check your Dashboard status card for an error message.

2. **Invalid or regenerated bot token** — If you regenerated your token in the Discord Developer Portal, your existing Daimon connection will fail. Go to Settings → Discord Connections → Update Token → paste the new token.

3. **Payment failed / account suspended** — If your Daimon subscription payment failed and the grace period expired, your account is suspended and the bot is taken offline. Update your payment method from the Billing page.

4. **Discord API outage** — Check discordstatus.com to see if Discord is experiencing service issues.

5. **Daimon service disruption** — Check daimon.app for any ongoing incident announcements.

If the Dashboard shows "Online" but the bot is unresponsive in Discord, see "My bot is online but not responding" above.

---

#### Q: The bot is responding but giving errors about tools. What do I check?

**A:**

Tool errors usually fall into these categories:

| Error message in Discord | Likely cause | Resolution |
|-------------------------|-------------|-----------|
| "GitHub is not connected to your workspace" | GitHub OAuth not connected | Go to Integrations → Connect GitHub |
| "Toggl API key is invalid or expired" | Toggl API key was rotated | Go to Integrations → Reconnect Toggl → paste new API key |
| "Anthropic API key error" | Anthropic key is missing, invalid, or has no credits | Go to Billing & Keys → update Anthropic API key |
| "You don't have permission to use this tool" | RLS or service authorization issue | Contact support@daimon.ai |
| "Rate limit exceeded" | Anthropic or service rate limit hit | Wait and try again; consider upgrading your Anthropic API plan |
| "Tool execution timed out" | External API was slow or unresponsive | Try again; if persistent, check the external service's status |

---

#### Q: I'm getting a "Workspace not found" or "Tenant not found" error. What does that mean?

**A:**

This typically occurs if:

1. You are trying to access a workspace you were removed from or that was deleted.
2. There is a session issue — your authentication token may be stale.

Try signing out and signing back in. If the error persists, contact support@daimon.ai with your account email address.

---

#### Q: How do I report a bug or get help?

**A:**

For technical issues or unexpected behavior:

- **Email:** support@daimon.ai — include your account email, a description of the issue, and any error messages you see.
- **Response time:** Starter plan users can expect a response within 2 business days. Pro plan users receive priority support with a target response time of 4 business hours.
- **Free plan users:** Community support — post in the Daimon community Discord server (link in the footer).

When reporting a bug, include:
- Your account email address
- The date and approximate time the issue occurred
- The Discord channel where the issue occurred (if relevant)
- The exact message you sent to the bot (or the action you took)
- The bot's response (or error message)
- A screenshot if possible

---

#### Q: My Anthropic API key shows "Invalid" but I copied it correctly. What do I do?

**A:**

An "Invalid" status means Daimon's validation check — which makes a small test API call to Anthropic — received an error response. This can happen for these reasons:

1. **The key has no remaining credits** — Anthropic API keys require a funded account. Check your Anthropic billing at console.anthropic.com.
2. **The key was revoked** — API keys can be deactivated from the Anthropic console. Create a new key and paste it into Daimon.
3. **Copy-paste error** — The key may have been truncated. Keys beginning with `sk-ant-api03-` are typically 108 characters long. Paste into a plain text editor to verify the full key before saving.
4. **Rate limit on validation** — Rarely, the test call hits a rate limit. Wait 60 seconds and try saving the key again.

After correcting the issue, go to Billing & Keys → paste the updated key → click "Save & Validate."

---

#### Q: I signed up but never received a verification email. What do I do?

**A:**

1. Check your spam/junk folder — verification emails from noreply@daimon.ai are sometimes filtered.
2. Add noreply@daimon.ai to your contacts or safe-senders list.
3. Wait up to 5 minutes — email delivery can sometimes be delayed.
4. If you still haven't received it, go to the login page and click "Resend verification email." Enter your email address to request a new verification link.
5. If the issue persists, contact support@daimon.ai with your signup email address.

---

#### Q: I forgot my password. How do I reset it?

**A:**

1. Go to daimon.app/login.
2. Click "Forgot password?" below the sign-in form.
3. Enter your account email address and click "Send Reset Link."
4. Check your email for a message from noreply@daimon.ai with the subject "Reset your Daimon password."
5. Click the link in the email — it expires after 1 hour.
6. Enter and confirm your new password on the reset page.
7. You are automatically signed in after a successful reset.

If you do not receive the reset email within 5 minutes, check your spam folder or contact support@daimon.ai.

---

### Section: Limits & Quotas

Anchor: `id="limits-quotas"`

```html
<h2 id="limits-quotas">Limits &amp; Quotas</h2>
```

---

#### Q: How many Discord connections can I have?

**A:**

| Plan | Maximum Discord connections |
|------|-----------------------------|
| Free | 1 |
| Starter | 3 |
| Pro | Unlimited |

Each connection is one bot token connected to one Discord server (guild). If you are on the Free plan and need to connect a second server, you must upgrade to Starter.

---

#### Q: Are there limits on how many messages my bot can process?

**A:**

Daimon does not impose a message processing limit. Your bot processes every message it receives.

The practical limit is set by your Anthropic API plan — each message sent to your bot results in one or more Claude API calls. Anthropic enforces rate limits (requests per minute, tokens per minute) based on your API tier. If your bot is heavily used, you may hit Anthropic's rate limits.

To increase your Anthropic rate limits, upgrade your Anthropic API usage tier at console.anthropic.com.

---

#### Q: Are there storage limits?

**A:**

Daimon does not currently enforce hard storage limits per tenant. Message history, configuration data, and activity logs are stored in a shared PostgreSQL database. Extremely high-volume tenants (millions of messages) may be subject to future fair-use limits.

---

#### Q: Are there API rate limits on the Daimon website itself?

**A:**

Yes. The following rate limits apply to the Daimon website API:

| Endpoint category | Rate limit |
|------------------|-----------|
| Auth endpoints (login, signup, password reset) | 10 requests per minute per IP |
| Dashboard API reads (status, integrations, billing data) | 60 requests per minute per authenticated user |
| Discord token validation (POST /api/discord/validate) | 5 requests per minute per authenticated user |
| API key save/validate endpoints | 10 requests per minute per authenticated user |
| Stripe Checkout creation | 3 requests per minute per authenticated user |
| Stripe Customer Portal creation | 10 requests per minute per authenticated user |

If you exceed a rate limit, the API returns HTTP 429 with a `Retry-After` header indicating when you can retry.

---

#### Q: How many service integrations can I have?

**A:**

There is no limit on the number of service integrations. You can connect all supported services simultaneously on any plan.

---

#### Q: How long is message history retained?

**A:**

Message history and activity logs are retained for the lifetime of your account. If you delete your account, message history is deleted within 30 days (may persist in database backups for up to 90 days per our backup retention policy).

There is no per-plan difference in retention period — all plans retain history indefinitely while the account is active.

---

### Section: Account & Teams

Anchor: `id="account-teams"`

```html
<h2 id="account-teams">Account &amp; Teams</h2>
```

---

#### Q: Can I invite team members to my Daimon workspace?

**A:**

Team member invitations are a planned feature for a future release. In the current version, each workspace has a single owner and does not support additional team members.

If you are setting up Daimon for a team, the workspace owner is the single account that manages the bot, integrations, and billing.

---

#### Q: Can I have multiple workspaces?

**A:**

Each Daimon account is associated with one workspace. To create a separate workspace, you would need a separate Daimon account with a separate email address.

Multiple workspaces under a single account are a planned feature for a future release.

---

#### Q: How do I change my workspace name?

**A:**

Go to Settings → Workspace → edit the "Workspace Name" field → click "Save." The name change takes effect immediately and is reflected everywhere in the dashboard.

---

#### Q: How do I change my account email address?

**A:**

Email address changes are not self-serve in the current version. Contact support@daimon.ai with your current email address and the new email address you want to use. We will manually update your account and send a verification to the new address.

---

#### Q: How do I delete my account?

**A:**

Account deletion is available in Settings → Workspace → Danger Zone → "Delete Workspace."

**Before deleting, note:**
- Deletion is permanent and cannot be undone.
- All data (API keys, connections, configuration, message history) will be deleted.
- Your active Daimon subscription will be canceled immediately. No refund is issued for the unused portion of the billing period.
- Your Discord bot is disconnected from Discord. Your Discord application (in the Developer Portal) is not deleted — only the Daimon connection is removed.

After clicking "Delete Workspace," you must type your workspace name to confirm, then click "Delete permanently." You will be signed out and your account will be queued for deletion.

---

#### Q: Can I transfer my workspace to another person?

**A:**

Workspace ownership transfers are not self-serve. Contact support@daimon.ai to request a transfer. We will require verification of both the current owner's identity and the new owner's email address.

---

### Footer Navigation

```html
<nav class="docs-page-nav" aria-label="Page navigation">
  <div class="prev-page">
    <a href="/docs/tool-reference/linear" aria-label="Previous page: Linear Tools">← Linear Tools</a>
  </div>
  <div class="next-page">
    <a href="/docs/billing" aria-label="Next page: Billing & Plans">Billing &amp; Plans →</a>
  </div>
</nav>
```

| Property | Value |
|----------|-------|
| Layout | `flex`, `justify-content: space-between`, `padding-top: 48px`, `border-top: 1px solid #E5E7EB`, `margin-top: 48px` |
| Font | Inter Regular, 14px, Periwinkle `#3F85CC` |
| Hover color | Navy `#0C1F40` |

---

### Accessibility — FAQ Page

| Element | Accessibility requirement |
|---------|--------------------------|
| `<h1>` "Frequently Asked Questions" | `id="faq-page-title"` |
| `<h2>` section headings | Each has unique `id` matching the anchor (e.g., `id="billing-pricing"`, `id="security"`, etc.) |
| `<details>` elements | Native HTML — keyboard accessible (Enter/Space on `<summary>` toggles open/close). No additional ARIA needed. |
| `<summary>` elements | Each contains the full question text as the accessible name |
| External links (discordstatus.com, console.anthropic.com) | `target="_blank"` with `rel="noopener noreferrer"` and visually hidden `<span class="sr-only"> (opens in new tab)</span>` |
| Tables within answers | `role="table"`, `<caption class="sr-only">` describing the table content |
| Support email link | `href="mailto:support@daimon.ai"` |
| In-page TOC nav | `aria-label="On this page"` |
| Footer page navigation | `aria-label="Page navigation"` with specific `aria-label` on each link |

---

*End of FAQ page specification. 42 questions documented across 7 sections: Billing & Pricing (10), Security (6), Bot Setup & Discord (8), Integrations & Tools (6), Troubleshooting (7), Limits & Quotas (5), Account & Teams (6).*

---

## Page: Billing & Plans

> Route: `/docs/billing`
> File: `app/(docs)/billing/page.tsx`
> Type: Static page (no data fetching)
> Title: `<title>Billing & Plans — Daimon Docs</title>`
> Meta description: `"Understand how Daimon plans work, how BYOK billing saves you money, and how to upgrade, downgrade, or cancel your subscription."`
> Sidebar nav label: "Plans & Pricing"
> Sidebar section: "Account & Billing"

---

### Page Header

```html
<header class="docs-page-header">
  <div class="breadcrumb">Account &amp; Billing</div>
  <h1 id="billing-plans-title">Billing &amp; Plans</h1>
  <p class="subtitle">
    How Daimon plans work, what's included in each tier, and how to manage your subscription.
  </p>
</header>
```

| Property | Value |
|----------|-------|
| `h1` text | "Billing & Plans" |
| `h1` id | `billing-plans-title` |
| Subtitle font | Inter Regular, 18px, `#6B7280` (Gray 500), margin-top: 8px |
| Breadcrumb | Inter Regular, 13px, `#B4E7DD` (Aqua), uppercase, letter-spacing `0.08em`, margin-bottom: 8px |

---

### On This Page — Table of Contents

```html
<nav class="toc" aria-label="On this page">
  <p class="toc-label">On this page</p>
  <ul>
    <li><a href="#plans-overview">Plans Overview</a></li>
    <li><a href="#byok-model">The BYOK Model</a></li>
    <li><a href="#billing-cycles">Billing Cycles</a></li>
    <li><a href="#upgrading">Upgrading Your Plan</a></li>
    <li><a href="#downgrading">Downgrading Your Plan</a></li>
    <li><a href="#canceling">Canceling Your Subscription</a></li>
    <li><a href="#managing-billing">Managing Billing</a></li>
    <li><a href="#api-keys">API Keys</a></li>
    <li><a href="#payment-failures">Payment Failures</a></li>
  </ul>
</nav>
```

TOC styles: Same as all docs pages — right-column float or inline-block before body content, Inter Regular 14px, Periwinkle `#3F85CC` links, hover Navy `#0C1F40`.

---

### Section 1: Plans Overview

> Anchor: `id="plans-overview"`

```markdown
## Plans Overview

Daimon offers three plans. All plans include the full 50+ tool catalog — the difference is how many
Discord servers you can connect and the level of support you receive.
```

#### Plan Comparison Table

```html
<table>
  <caption class="sr-only">Daimon plan comparison: Free, Starter, and Pro</caption>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Free</th>
      <th>Starter</th>
      <th>Pro</th>
    </tr>
  </thead>
  <tbody>
    <!-- rows below -->
  </tbody>
</table>
```

**Full table content (every row, rendered as HTML table in docs):**

| Feature | Free | Starter | Pro |
|---------|------|---------|-----|
| **Monthly price** | $0/month | $9/month | $29/month |
| **Annual price** | $0/year | $79/year | $249/year |
| **Annual savings** | — | Save $29/year | Save $99/year |
| **Discord connections** | 1 | Up to 3 | Unlimited |
| **All 50+ tools included** | ✓ | ✓ | ✓ |
| **Bring your own Anthropic key** | ✓ | ✓ | ✓ |
| **Bring your own OpenAI key (optional)** | ✓ | ✓ | ✓ |
| **All service integrations** | ✓ | ✓ | ✓ |
| **Community support (Discord)** | ✓ | ✓ | ✓ |
| **Email support** | — | ✓ (48-hour response) | ✓ (24-hour response) |
| **Priority support** | — | — | ✓ |
| **99.9% bot uptime SLA** | — | — | ✓ |
| **Payment required** | No | Yes | Yes |

Callout box (type: `tip`):
```
All plans include the full tool catalog. There are no locked features or paywalled integrations.
You pay for infrastructure capacity (more connections) and support level — not tool access.
```

**Prose follow-up below table:**

```markdown
### Free Plan

The Free plan lets you connect one Discord server and one Anthropic API key. There's no credit card
required and no trial period — you can use Daimon indefinitely on the Free plan.

The Free plan is ideal for:
- Individuals managing a single Discord server
- Trying out Daimon before committing to a paid plan
- Low-volume usage where Anthropic API costs are minimal

### Starter Plan — $9/month or $79/year

The Starter plan lets you connect up to 3 Discord servers simultaneously. Each connection is an
independent bot instance with its own conversation context.

Choosing annual billing saves $29 compared to paying monthly ($79/year vs $108/year).

The Starter plan is ideal for:
- Teams running one main server plus staging/test servers
- Community operators managing a small number of servers
- Power users who want email support

### Pro Plan — $29/month or $249/year

The Pro plan removes the connection limit entirely. You can connect as many Discord servers as
you need, all running simultaneously.

Choosing annual billing saves $99 compared to paying monthly ($249/year vs $348/year).

The Pro plan includes a 99.9% bot uptime SLA. If the bot is unavailable for longer than
the SLA permits in a given month, contact support@daimon.ai for a prorated credit.

The Pro plan is ideal for:
- Agencies or consultants managing many Discord communities
- Businesses running separate servers for different teams or regions
- Users who need guaranteed uptime and fast support response times
```

---

### Section 2: The BYOK Model

> Anchor: `id="byok-model"`

```markdown
## The BYOK Model

BYOK stands for "Bring Your Own Keys." Daimon does not charge you for AI usage — instead, you
connect your own Anthropic API key, and Anthropic bills you directly for every Claude API call
your bot makes.

**Why BYOK?**

- **Transparency**: You see exactly how much you're spending on AI in your Anthropic console.
- **Control**: You can set usage limits directly in your Anthropic account.
- **Fairness**: Light users pay less; heavy users pay more — in proportion to their actual usage.
- **Privacy**: Your conversations go directly between your Discord server and Anthropic's API.
  Daimon doesn't see or store your message content.

**What Daimon charges for:**

Daimon charges a platform fee (your Starter or Pro subscription) for hosting the bot
infrastructure, managing connections, providing the dashboard, and delivering support.
This fee is fixed per billing cycle and does not vary with usage.

**What Anthropic charges for:**

Anthropic charges per token — input tokens (your messages and context) and output tokens
(Claude's responses). Typical usage costs $1–5/month for a moderately active Discord server,
though this varies widely depending on message volume and which Claude model is used.

You can monitor your Anthropic API usage and set spending limits at:
[console.anthropic.com](https://console.anthropic.com) (opens in new tab)

**The OpenAI key is optional:**

Daimon uses a lightweight classification step to route messages efficiently. This step can use
OpenAI's API (typically cheaper for classification than Claude) or fall back to Claude Haiku if
no OpenAI key is provided. Either way, the bot works fully — the OpenAI key is purely an
optimization for cost-conscious users.
```

Callout box (type: `info`):
```
Your API keys are stored encrypted using AES-256 via Supabase Vault. They are never logged,
never exposed in the UI in plaintext, and never shared with third parties.
```

---

### Section 3: Billing Cycles

> Anchor: `id="billing-cycles"`

```markdown
## Billing Cycles

### Monthly Billing

With monthly billing, you are charged on the same day each month. For example, if you upgrade on
March 13, your next charge is April 13, then May 13, and so on.

Monthly billing gives you flexibility to cancel at any time. Cancellation takes effect at the end
of the current period — you keep access through the date you already paid for.

### Annual Billing

Annual billing charges you once per year for the full annual price. Annual billing saves you:
- **Starter**: $29/year ($79/year vs $108/year monthly)
- **Pro**: $99/year ($249/year vs $348/year monthly)

Annual billing is available when you initiate Stripe Checkout. Choose "Annual" in the billing
toggle on the Billing page before clicking Upgrade.

### Switching Between Monthly and Annual

To switch from monthly to annual (or vice versa), open the Stripe Customer Portal via
Settings → Billing → "Manage Billing →". In the portal, you can change your billing interval.
The change takes effect at the start of your next billing period.

### Billing Date

Your billing date is set when you first subscribe and does not change unless you explicitly
change your plan. If you upgrade from Starter to Pro mid-cycle, Stripe calculates a prorated
charge for the remainder of the current period.

### Currency

All prices are in USD. Stripe accepts payment in other currencies, but the listed prices are
USD and your bank converts at the prevailing exchange rate.

### Invoices

Invoices are issued by Stripe and sent to the email address on your Stripe customer record
(typically the email you used to sign up for Daimon). You can also access all past invoices
in the Stripe Customer Portal.
```

---

### Section 4: Upgrading Your Plan

> Anchor: `id="upgrading"`

```markdown
## Upgrading Your Plan

You can upgrade from Free to Starter, Free to Pro, or Starter to Pro at any time.
Upgrades take effect immediately.

### How to Upgrade

**Step 1:** Go to **Settings → Billing** (or navigate directly to `/dashboard/billing`).

**Step 2:** In the "Subscription" section, you'll see the plan comparison grid showing Free,
Starter, and Pro. The plan you're currently on shows "Current Plan" (disabled button).

**Step 3:** Choose a billing cycle. There's a toggle above the plan grid labeled "Monthly" and
"Annual." Select your preferred cycle. Annual saves you $29/year on Starter or $99/year on Pro.

**Step 4:** Click "Upgrade to Starter →" or "Upgrade to Pro →" on the plan card you want.

**Step 5:** You'll be redirected to a Stripe-hosted checkout page. Enter your payment details.
Stripe accepts Visa, Mastercard, American Express, Discover, and most local payment methods
via Stripe's automatic payment method selection.

**Step 6:** After completing checkout, Stripe redirects you back to the Billing page with a
confirmation banner: "Your plan has been upgraded! You now have access to all [Plan] features."

**What happens immediately after upgrading:**
- Your `tenants.plan` is updated to `'starter'` or `'pro'`
- If you were on Free with 1 connection, your additional connection slots become available immediately
- Your bot continues running without any interruption during the upgrade

### Proration

If you upgrade from Starter to Pro mid-billing-cycle, Stripe charges a prorated amount for the
remaining days in the current period at the Pro rate, minus credit for unused days at the Starter
rate. This appears as a single charge on your card.

For example: If you're on Starter Monthly ($9/month) and upgrade to Pro ($29/month) on day 15
of your 30-day cycle, Stripe charges approximately $10 (15 days of Pro minus 15 days of unused
Starter credit = $14.50 - $4.50 ≈ $10).

### Who Can Upgrade

Only the workspace **Owner** can initiate an upgrade. Members and Admins see the plan grid in
read-only mode. If you're a member and want to upgrade, ask your workspace owner.
```

Callout box (type: `tip`):
```
Upgrades are instant. Your new plan limits apply the moment Stripe confirms the payment —
no need to reconnect your bot or restart anything.
```

---

### Section 5: Downgrading Your Plan

> Anchor: `id="downgrading"`

```markdown
## Downgrading Your Plan

You can downgrade from Pro to Starter, Pro to Free, or Starter to Free at any time.
Downgrades do NOT take effect immediately — they take effect at the end of your current
billing period.

### How to Downgrade

**Step 1:** Go to **Settings → Billing** (`/dashboard/billing`).

**Step 2:** In the plan comparison grid, click the "Downgrade to [Plan]" button on the
plan card you want to move to.

**Step 3:** A confirmation dialog appears:

> **Downgrade to [Plan]?**
>
> Your plan will change to [Plan] at the end of your current billing period on [date].
> Until then, you keep all your current plan's features.
>
> [current feature that will be lost]: [impact]
>
> [Cancel] [Confirm Downgrade]

For example, downgrading from Pro to Free:

> **Downgrade to Free?**
>
> Your plan will change to Free on January 14, 2027. Until then, you keep all Pro features.
>
> After downgrading:
> - You will be limited to 1 Discord connection. If you currently have more than 1 active
>   connection, the additional connections will be suspended on the downgrade date. Your data
>   is preserved — you can reactivate connections by upgrading again.
> - Email and priority support will no longer be available.
> - The 99.9% uptime SLA will no longer apply.
>
> [Cancel] [Confirm Downgrade]

**Step 4:** Click "Confirm Downgrade." The downgrade is scheduled. The Current Plan Card now
shows: "⚠ Cancels on [date] · [Reactivate →]"

### What Happens on the Downgrade Date

On the first day of the new billing period (when Stripe's subscription changes take effect):
- `tenants.plan` is updated to the new lower plan
- Connection limits are enforced: if you have more connections than the new plan allows,
  excess connections are suspended (status → `'suspended'`). The bot stops responding on
  suspended connections. Connection data is preserved.
- Stripe stops charging you at the higher rate. If downgrading to Free, Stripe cancels
  the subscription entirely.

### Reversing a Scheduled Downgrade

If you've scheduled a downgrade but change your mind, click "Reactivate →" in the Current
Plan Card. This cancels the scheduled downgrade and keeps you on your current plan.

### Connection Limits After Downgrade

If you have 5 active connections and downgrade from Pro to Starter (limit: 3):
- Connections 1–3: remain active (determined by connection creation date, oldest first)
- Connections 4–5: suspended on downgrade date

You can see which connections will be suspended in advance: go to Settings → Discord
Connections. Connections at risk of suspension are marked with a warning badge if a downgrade
is scheduled.

To choose which connections to keep, manually disconnect the ones you don't want before
the downgrade date.

### Downgrading to Free

Downgrading to Free cancels your Stripe subscription entirely. No future charges. Your Stripe
customer record and billing history are preserved in Stripe's system — if you resubscribe later,
Stripe will use the same customer record.

### Who Can Downgrade

Only the workspace **Owner** can initiate a downgrade. Members see the plan grid in read-only mode.
```

Callout box (type: `warning`):
```
Downgrading to Free suspends extra connections on the downgrade date. Suspended connections
stop responding immediately. Reconnect by upgrading your plan.
```

---

### Section 6: Canceling Your Subscription

> Anchor: `id="canceling"`

```markdown
## Canceling Your Subscription

Canceling your subscription schedules your plan to revert to Free at the end of your current
billing period. You are not charged for future periods after canceling.

### How to Cancel

**Option 1: Via the Billing page**

1. Go to `/dashboard/billing`
2. In the Current Plan Card, click "Manage Billing →"
3. You're redirected to the Stripe Customer Portal
4. In the portal, click "Cancel plan"
5. Follow Stripe's cancellation flow (select reason, confirm)
6. Stripe redirects you back to the Daimon Billing page

After canceling, the Current Plan Card shows:
"⚠ Cancels on [date] · [Reactivate →]"

**Option 2: Via the Stripe Customer Portal directly**

If you can't access the Billing page for any reason, you can cancel directly in Stripe's
Customer Portal at [billing.stripe.com](https://billing.stripe.com) using the email address
on your account.

### What "Canceled" Means

- Your bot continues running until the cancellation date (end of current period).
- On the cancellation date, your plan reverts to Free.
- If you have more than 1 active connection, extra connections are suspended on that date.
- Your account is NOT deleted. Your data (API keys, connection settings, service connections)
  is preserved. You remain on the Free plan indefinitely unless you delete your workspace.

### Reactivating After Cancellation

If your plan has been scheduled for cancellation but hasn't yet taken effect, click
"Reactivate →" in the Current Plan Card on the Billing page.

If your plan has already been downgraded to Free following a cancellation, simply upgrade
again using the plan grid. There's no penalty for resubscribing.

### Account Deletion vs. Cancellation

**Canceling** ends your paid subscription — your account remains on Free.
**Deleting your workspace** removes all data permanently and cannot be undone.

To delete your workspace, go to Settings → Danger Zone → "Delete Workspace."
This is a separate action from canceling your subscription.

### Refunds

Daimon does not issue refunds for unused subscription time except where required by applicable
law. If you believe you're entitled to a refund, contact support@daimon.ai with your account
email and billing details.
```

---

### Section 7: Managing Billing

> Anchor: `id="managing-billing"`

```markdown
## Managing Billing

The Stripe Customer Portal is a Stripe-hosted page where you can manage all aspects of your
Daimon billing account. Access it from the Billing page by clicking "Manage Billing →"
(available on Starter and Pro plans) or "Update Payment →" (when payment has failed).

### What You Can Do in the Customer Portal

**Payment methods**
- Add a new credit or debit card
- Remove an existing card
- Set a default payment method

**Billing information**
- Update your billing email
- Add or update a billing address (required for VAT compliance in some regions)
- Add a company name to invoices

**Invoices**
- View all past invoices
- Download invoices as PDF
- View individual invoice line items

**Subscription management**
- Change billing interval (monthly ↔ annual) — takes effect at next renewal
- Cancel your subscription
- Reactivate a canceled subscription (if still within the current period)

### What You Cannot Do in the Customer Portal

- Change your plan tier (use the Daimon Billing page plan grid instead)
- Upgrade or downgrade plans (use the Daimon Billing page instead)
- View Daimon dashboard, connections, or settings

### Returning from the Customer Portal

After completing your changes in the Customer Portal, click the "← Return to Daimon" link
(Stripe provides this button automatically based on the return URL configured in Stripe settings).
You'll be redirected to `/dashboard/billing?portal_return=1` and see an info banner:
"Welcome back to Daimon."

### Billing Contact vs. Account Owner

The email address Stripe uses for invoices is the billing email — typically the email you used
to sign up. You can update the billing email in the Customer Portal without changing your
Daimon login email.
```

Callout box (type: `info`):
```
The Customer Portal is hosted by Stripe, not Daimon. Your payment card details are entered
directly with Stripe and are never seen by Daimon's systems.
```

---

### Section 8: API Keys

> Anchor: `id="api-keys"`

```markdown
## API Keys

Daimon uses two API keys — one required, one optional — to power your bot's AI capabilities.
Both are managed on the Billing page under the "API Keys" section.

### Anthropic API Key (Required)

Your Anthropic API key is the credential that lets your bot call Claude. Without it, the bot
cannot process any messages.

**Where to get it:**

1. Go to [console.anthropic.com](https://console.anthropic.com) (opens in new tab)
2. Sign in or create an Anthropic account
3. Click "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy the key — it starts with `sk-ant-`

**How to add it to Daimon:**

1. Go to `/dashboard/billing`
2. Scroll to the "API Keys" section
3. Click "Add Key" next to "Anthropic API Key"
4. A modal opens with a password-style input field
5. Paste your key — it should start with `sk-ant-`
6. Click "Save & Validate"
7. Daimon sends a lightweight test request to Anthropic's API to confirm the key is valid
8. On success: the key is stored encrypted and you see "✓ Valid"
9. On failure: an error message explains what went wrong (see below)

**Validation errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid API key format. Anthropic keys start with `sk-ant-`." | Key is pasted incorrectly or wrong key type | Re-copy the key from Anthropic console |
| "This API key was rejected by Anthropic. It may be expired or have insufficient permissions." | Key is revoked or was entered incorrectly | Create a new key in the Anthropic console |
| "Could not reach Anthropic to validate the key. Please try again." | Network error during validation | Retry — if it persists, check status.anthropic.com |

**Updating your key:**

Click "Update" next to the key hint. The same modal opens pre-filled with nothing (for security,
the current key is never shown). Paste the new key and click "Save & Validate."

**Deleting your key:**

Click "Delete" next to the key hint. A confirmation dialog asks: "Delete your Anthropic API key?
Your bot will stop working until you add a new key." Click "Delete" to confirm.

**What happens if your Anthropic key becomes invalid:**

If Anthropic revokes your key (e.g., you rotate keys in the Anthropic console), the next time
the bot tries to use the key, the API call will fail. The bot will mark the key as invalid in
Daimon's system. You'll see a warning badge on your dashboard and the key row on the Billing
page will show "✗ Invalid." Update your key to restore bot functionality.

### OpenAI API Key (Optional)

The OpenAI key is used for a classification step that routes messages efficiently. If not provided,
Daimon falls back to Claude Haiku for the same classification task — fully functional but
slightly slower and may cost slightly more per message on Anthropic's billing.

**When to add an OpenAI key:**

If you have an OpenAI API account and want to minimize Anthropic API costs, adding an OpenAI key
can reduce your per-message Anthropic bill by routing classification away from Claude.

**Where to get it:**

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys) (opens in new tab)
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Copy the key — it starts with `sk-`

**How to add it to Daimon:**

1. Go to `/dashboard/billing`
2. Scroll to "API Keys" → "OpenAI API Key (Optional)"
3. Click "Add Key"
4. Paste the key — it should start with `sk-`
5. Click "Save & Validate"
6. Daimon sends a test request to OpenAI's API to confirm the key is valid

**Validation errors — OpenAI:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid API key format. OpenAI keys start with `sk-`." | Key pasted incorrectly | Re-copy from OpenAI platform |
| "This API key was rejected by OpenAI. It may be expired or have insufficient permissions." | Key is revoked | Create a new key in OpenAI platform |
| "Could not reach OpenAI to validate the key. Please try again." | Network error | Retry |

**Security note for both keys:**

- Keys are stored using Supabase Vault (AES-256 encryption at rest)
- Keys are never logged or included in error messages
- The UI shows only a partial hint (first 10 and last 4 characters, e.g., `sk-ant-a...b12c`)
- Keys are only decrypted in memory at the point of use — never written to logs or returned via API
- Only your workspace's bot process has access to the decrypted key value

### Key Validation Frequency

Keys are validated:
1. When you first save them (immediate test call to the provider API)
2. Automatically when the bot tries to use them and receives an auth error (marks as invalid)
3. Manual re-validation is not available — update your key to trigger a fresh validation
```

---

### Section 9: What Happens When Payment Fails

> Anchor: `id="payment-failures"`

```markdown
## What Happens When Payment Fails

If Stripe cannot collect your subscription payment, your subscription enters `past_due` status.
Stripe retries the charge automatically on a schedule: after 3 days, then 5 days, then 7 days.

### During the Grace Period

While in `past_due` status:
- Your bot continues running normally
- Your plan limits remain in effect (no connection downgrade yet)
- A warning banner appears on your Billing page and Dashboard:
  "Your last payment failed. Update your payment method to keep your bot running."
- Stripe sends you an automated email with a payment link

### If Payment Continues to Fail

After Stripe exhausts its retry schedule (typically 15 days), the subscription is marked
as `unpaid`. At this point:
- Daimon suspends your account (`tenant.status = 'suspended'`)
- Your bot goes offline
- A suspension banner appears on all dashboard pages

### Reactivating After Suspension

1. Go to `/dashboard/billing`
2. Click "Update Payment →" in the Current Plan Card
3. You'll be redirected to the Stripe Customer Portal
4. Update your payment method in the portal
5. In the portal, click "Pay now" to retry the outstanding invoice
6. After successful payment, Stripe reactivates the subscription
7. Daimon's webhook handler unsuspends your account within seconds
8. Your bot reconnects automatically

### What to Do if You're Locked Out

If your account is suspended and you cannot access the dashboard, contact support@daimon.ai
with your registered email address. We can manually trigger a payment retry or arrange
alternative payment.

### Preventing Payment Failures

- Keep your credit card up to date in the Stripe Customer Portal before it expires
- Stripe sends expiration reminders 30 days before your card expires
- Consider using a corporate card or virtual card number to prevent unexpected expiration
```

Callout box (type: `danger`):
```
Account suspension due to unpaid invoices takes the bot offline immediately. Keep your payment
method current to avoid disruption. Update your card in the Stripe Customer Portal before it
expires.
```

---

### Footer Navigation

```html
<nav class="docs-page-nav" aria-label="Page navigation">
  <div class="prev-page">
    <a href="/docs/faq" aria-label="Previous page: FAQ">← FAQ</a>
  </div>
  <div class="next-page">
    <!-- No next page — this is the last docs page -->
  </div>
</nav>
```

| Property | Value |
|----------|-------|
| Layout | `flex`, `justify-content: space-between`, `padding-top: 48px`, `border-top: 1px solid #E5E7EB`, `margin-top: 48px` |
| Font | Inter Regular, 14px, Periwinkle `#3F85CC` |
| Hover color | Navy `#0C1F40` |
| Next page | None (last page in docs). The `.next-page` div is rendered empty, maintaining the flex layout. |

---

### Accessibility — Billing & Plans Page

| Element | Accessibility requirement |
|---------|--------------------------|
| `<h1>` "Billing & Plans" | `id="billing-plans-title"` |
| `<h2>` section headings | Each has unique `id` matching anchor in TOC (e.g., `id="plans-overview"`, `id="byok-model"`, `id="billing-cycles"`, `id="upgrading"`, `id="downgrading"`, `id="canceling"`, `id="managing-billing"`, `id="api-keys"`, `id="payment-failures"`) |
| Plan comparison table | `<caption class="sr-only">Daimon plan comparison: Free, Starter, and Pro</caption>` |
| Validation error table (Anthropic) | `<caption class="sr-only">Anthropic API key validation error messages and fixes</caption>` |
| Validation error table (OpenAI) | `<caption class="sr-only">OpenAI API key validation error messages and fixes</caption>` |
| External links (console.anthropic.com, platform.openai.com, billing.stripe.com) | `target="_blank"` with `rel="noopener noreferrer"` and `<span class="sr-only"> (opens in new tab)</span>` |
| TOC navigation | `aria-label="On this page"` |
| Footer page navigation | `aria-label="Page navigation"` with specific `aria-label` on each link |
| Support email link | `href="mailto:support@daimon.ai"` |
| Callout boxes | `role="note"` and `aria-label="[type] note"` (e.g., `aria-label="Tip"`, `aria-label="Warning"`) |

---

*End of Billing & Plans page specification. 9 sections documented: Plans Overview (with full comparison table), BYOK Model, Billing Cycles, Upgrading, Downgrading, Canceling, Managing Billing, API Keys (Anthropic + OpenAI), Payment Failures.*

# Copy Inventory — All User-Facing Strings

> Complete catalog of every string visible to users across Daimon SaaS.
> Organized by surface. No placeholders. No "appropriate text" — every string is specified.
> Last updated: 2026-03-13

Cross-references: [auth-pages.md](./auth-pages.md), [dashboard.md](./dashboard.md),
[integrations-page.md](./integrations-page.md), [billing-page.md](./billing-page.md),
[settings-page.md](./settings-page.md), [admin-panel.md](./admin-panel.md),
[docs-pages.md](./docs-pages.md), [landing-page.md](./landing-page.md),
[validation-rules.md](./validation-rules.md)

---

## Table of Contents

1. [Global / Shared Strings](#1-global--shared-strings)
2. [Landing Page](#2-landing-page)
3. [Auth Pages](#3-auth-pages)
4. [Dashboard Home](#4-dashboard-home)
5. [Integrations Page](#5-integrations-page)
6. [Billing Page](#6-billing-page)
7. [Settings Page](#7-settings-page)
8. [Admin Panel](#8-admin-panel)
9. [Toast Notifications](#9-toast-notifications)
10. [Confirmation Dialogs](#10-confirmation-dialogs)
11. [Empty States](#11-empty-states)
12. [Error States](#12-error-states)
13. [Loading / Skeleton States](#13-loading--skeleton-states)
14. [Tooltips](#14-tooltips)
15. [Form Validation Errors](#15-form-validation-errors)
16. [Page Titles (HTML `<title>`)](#16-page-titles-html-title)
17. [Meta Descriptions](#17-meta-descriptions)

---

## 1. Global / Shared Strings

### Brand Name & Tagline

| Key | String |
|-----|--------|
| brand.name | "Daimon" |
| brand.tagline | "Your AI bot, your keys, your Discord." |
| brand.taglineAlt | "The self-serve AI operating system for Discord teams." |
| brand.supportEmail | "support@daimon.ai" |

### Navigation — Sidebar (authenticated)

| Key | Label | Route |
|-----|-------|-------|
| nav.dashboard | "Dashboard" | `/dashboard` |
| nav.integrations | "Integrations" | `/dashboard/integrations` |
| nav.billing | "Billing" | `/dashboard/billing` |
| nav.settings | "Settings" | `/dashboard/settings` |
| nav.docs | "Documentation" | `/docs` |
| nav.signOut | "Sign out" | (action, not link) |

Sidebar footer tooltip:
- Sign out icon button: tooltip `"Sign out"`

### Navigation — Landing Page (public)

| Key | Label | Route |
|-----|-------|-------|
| publicNav.features | "Features" | `#features` |
| publicNav.pricing | "Pricing" | `#pricing` |
| publicNav.docs | "Docs" | `/docs` |
| publicNav.login | "Sign in" | `/login` |
| publicNav.cta | "Get Started Free" | `/signup` |

### Mobile Navigation (hamburger menu)

| Key | String |
|-----|--------|
| mobileNav.open.ariaLabel | "Open navigation menu" |
| mobileNav.close.ariaLabel | "Close navigation menu" |
| mobileNav.menuLabel | "Menu" |

### Common Button Labels

| Key | String | Context |
|-----|--------|---------|
| button.save | "Save changes" | Form save buttons |
| button.saving | "Saving…" | In-flight save state |
| button.cancel | "Cancel" | Dismiss dialog / cancel action |
| button.confirm | "Confirm" | Confirm destructive actions |
| button.delete | "Delete" | Delete items |
| button.deleting | "Deleting…" | In-flight delete |
| button.connect | "Connect" | Service connection |
| button.connecting | "Connecting…" | In-flight connect |
| button.disconnect | "Disconnect" | Remove a connection |
| button.disconnecting | "Disconnecting…" | In-flight disconnect |
| button.reconnect | "Reconnect" | Retry connection |
| button.add | "Add" | Add items |
| button.update | "Update" | Update items |
| button.edit | "Edit" | Edit items |
| button.done | "Done" | Close after success |
| button.retry | "Try again" | After error |
| button.copyToClipboard | "Copy" | Copy value to clipboard |
| button.copied | "Copied!" | After clipboard copy (2s then reverts) |
| button.showKey | "Show" | Reveal masked key |
| button.hideKey | "Hide" | Mask visible key |
| button.learnMore | "Learn more" | Link to docs/external |
| button.viewDocs | "View docs" | Link to docs |
| button.continue | "Continue" | Multi-step flows |
| button.back | "Back" | Multi-step flows |
| button.openPortal | "Manage billing" | Stripe Customer Portal |
| button.upgrade | "Upgrade plan" | Plan upgrade CTA |

### Common Labels

| Key | String |
|-----|--------|
| label.plan.free | "Free" |
| label.plan.starter | "Starter" |
| label.plan.pro | "Pro" |
| label.role.owner | "Owner" |
| label.role.admin | "Admin" |
| label.role.member | "Member" |
| label.status.active | "Active" |
| label.status.inactive | "Inactive" |
| label.status.pending | "Pending" |
| label.status.connected | "Connected" |
| label.status.connecting | "Connecting…" |
| label.status.disconnected | "Disconnected" |
| label.status.error | "Error" |
| label.status.expired | "Expired" |
| label.status.suspended | "Suspended" |
| label.required | "Required" |
| label.optional | "Optional" |
| label.beta | "Beta" |
| label.new | "New" |
| label.comingSoon | "Coming soon" |

### Footer Links (auth pages)

| Key | String | Href |
|-----|--------|------|
| footer.terms | "Terms of Service" | `/terms` |
| footer.privacy | "Privacy Policy" | `/privacy` |
| footer.support | "Support" | `mailto:support@daimon.ai` |

### Footer Links (landing page)

| Key | String | Href |
|-----|--------|------|
| landingFooter.product | "Product" | (section heading, not a link) |
| landingFooter.features | "Features" | `#features` |
| landingFooter.pricing | "Pricing" | `#pricing` |
| landingFooter.docs | "Docs" | `/docs` |
| landingFooter.company | "Company" | (section heading) |
| landingFooter.privacy | "Privacy Policy" | `/privacy` |
| landingFooter.terms | "Terms of Service" | `/terms` |
| landingFooter.support | "Support" | `mailto:support@daimon.ai` |
| landingFooter.copyright | "© 2026 Daimon. All rights reserved." | — |
| landingFooter.madeWith | "Built with the Claude Agent SDK" | — |

### Plan Badge (topbar)

| Plan | Badge text | Background | Text color |
|------|-----------|------------|------------|
| free | "Free" | `rgba(12,31,64,0.08)` | Navy at 65% |
| starter | "Starter" | `rgba(180,231,221,0.25)` | Navy |
| pro | "Pro" | `rgba(159,170,226,0.25)` | Navy |

---

## 2. Landing Page

### Section: Hero

| Key | String |
|-----|--------|
| hero.headline | "Your AI bot, your keys, your Discord." |
| hero.subheadline | "Daimon gives your team a Claude-powered AI operating system inside Discord — connected to your tools, running on your own Anthropic API key." |
| hero.cta.primary | "Get Started Free" |
| hero.cta.secondary | "View Documentation" |
| hero.social.label | "Trusted by teams using:" |
| hero.social.items | "Discord • GitHub • Linear • Toggl • Google Analytics" |

### Section: How It Works

| Key | String |
|-----|--------|
| howItWorks.sectionLabel | "HOW IT WORKS" |
| howItWorks.title | "From signup to live bot in minutes." |
| howItWorks.step1.number | "1" |
| howItWorks.step1.title | "Create your account" |
| howItWorks.step1.description | "Sign up with your email. No credit card required to start." |
| howItWorks.step2.number | "2" |
| howItWorks.step2.title | "Bring your own keys" |
| howItWorks.step2.description | "Paste your Discord bot token, guild ID, and Anthropic API key. Your credentials stay encrypted and private." |
| howItWorks.step3.number | "3" |
| howItWorks.step3.title | "Your bot goes live" |
| howItWorks.step3.description | "Daimon connects your bot automatically. It's online and ready to use in your Discord server within 30 seconds." |

### Section: Features

| Key | String |
|-----|--------|
| features.sectionLabel | "CAPABILITIES" |
| features.title | "50+ tools. Zero setup." |
| features.subtitle | "Every tool is available the moment your bot connects. No workflows to configure, no permissions to map — just ask." |
| features.card1.title | "Discord-native" |
| features.card1.description | "Mentions, channel context, slash commands. The bot feels native because it is native." |
| features.card2.title | "GitHub integration" |
| features.card2.description | "Create issues, review PRs, run CLI commands directly from Discord." |
| features.card3.title | "Linear integration" |
| features.card3.description | "Query projects, update issues, manage sprints without leaving your server." |
| features.card4.title | "Toggl time tracking" |
| features.card4.description | "34 Toggl tools — start timers, generate reports, manage projects and clients." |
| features.card5.title | "Google Analytics" |
| features.card5.description | "Pull traffic reports and metrics into your Discord conversations." |
| features.card6.title | "BYOK — your keys, your costs" |
| features.card6.description | "You pay Anthropic directly. Daimon charges a small platform fee. Your usage stays private." |
| features.card7.title | "Powered by Claude" |
| features.card7.description | "Runs on Claude Sonnet 4.6 via the Anthropic API. Multi-agent orchestration via the Claude Agent SDK." |
| features.card8.title | "Secure by default" |
| features.card8.description | "All secrets encrypted at rest via Supabase Vault. Multi-tenant isolation. Your data never touches another tenant's context." |

### Section: Integrations Strip

| Key | String |
|-----|--------|
| integrations.label | "WORKS WITH YOUR STACK" |
| integrations.items | ["Discord", "GitHub", "Linear", "Toggl", "Google Analytics", "Anthropic Claude", "Fly.io", "LinkedIn"] |

### Section: Pricing

| Key | String |
|-----|--------|
| pricing.sectionLabel | "PRICING" |
| pricing.title | "Simple, transparent pricing." |
| pricing.subtitle | "Start free. Upgrade when you need more." |
| pricing.billingToggle.monthly | "Monthly" |
| pricing.billingToggle.annual | "Annual" |
| pricing.annualDiscount | "Save 20%" |
| pricing.free.name | "Free" |
| pricing.free.price | "$0" |
| pricing.free.pricePeriod | "/month" |
| pricing.free.description | "For individuals evaluating Daimon." |
| pricing.free.cta | "Get started free" |
| pricing.free.features | ["1 Discord server", "50 messages/day", "Core tools (Discord, GitHub, Linear)", "Community support"] |
| pricing.starter.name | "Starter" |
| pricing.starter.price.monthly | "$19" |
| pricing.starter.price.annual | "$15" |
| pricing.starter.pricePeriod | "/month" |
| pricing.starter.description | "For small teams running a live bot." |
| pricing.starter.cta | "Start with Starter" |
| pricing.starter.badge | "Most popular" |
| pricing.starter.features | ["1 Discord server", "500 messages/day", "All tools (50+)", "Toggl + Google Analytics", "Email support", "30-day message history"] |
| pricing.pro.name | "Pro" |
| pricing.pro.price.monthly | "$49" |
| pricing.pro.price.annual | "$39" |
| pricing.pro.pricePeriod | "/month" |
| pricing.pro.description | "For teams that rely on the bot daily." |
| pricing.pro.cta | "Go Pro" |
| pricing.pro.features | ["1 Discord server", "Unlimited messages", "All tools (50+)", "Priority support", "90-day message history", "Admin panel access", "Custom bot name (coming soon)"] |
| pricing.note | "All plans include BYOK — you pay Anthropic directly for AI usage." |
| pricing.faq.link | "Questions? See the FAQ ↓" |

### Section: FAQ (Landing Page)

| # | Question | Answer |
|---|---------|--------|
| 1 | "What is Daimon?" | "Daimon is a self-serve SaaS platform that gives your Discord server an AI assistant powered by Claude. You bring your own Discord bot token and Anthropic API key — Daimon handles everything else." |
| 2 | "Do I need to know how to code?" | "No. If you can create a Discord bot in the Developer Portal and copy an API key, you can run Daimon. The setup guide walks you through every step." |
| 3 | "Why do I need to bring my own Anthropic API key?" | "BYOK (bring your own key) means your AI usage goes through your Anthropic account, not ours. You see your exact costs, your conversations stay private, and you're not sharing capacity with other users." |
| 4 | "Is my bot token secure?" | "Yes. Your Discord bot token is encrypted at rest using Supabase Vault (AES-256-GCM). It's never logged or exposed in the UI. Only the bot process reads the decrypted value, and only at connection time." |
| 5 | "Can I use my own Discord bot?" | "Yes — Daimon uses whatever Discord application you create. You control the bot name, avatar, and permissions." |
| 6 | "What tools does the bot have?" | "50+ tools across Discord, GitHub, Linear, Toggl, Google Analytics, Fly.io, LinkedIn, and more. Every tool is available to your bot from day one — no configuration needed." |
| 7 | "What happens if I cancel?" | "Your bot stops immediately. Your data is retained for 30 days after cancellation, then deleted. You can export your configuration at any time." |

### Section: Final CTA Banner

| Key | String |
|-----|--------|
| finalCta.title | "Ready to bring AI to your Discord server?" |
| finalCta.subtitle | "Set up in under 5 minutes. No credit card required." |
| finalCta.button | "Get Started Free" |

### Landing Page Footer

| Key | String |
|-----|--------|
| footer.tagline | "The self-serve AI operating system for Discord teams." |
| footer.copyright | "© 2026 Daimon. All rights reserved." |

---

## 3. Auth Pages

### Login Page (`/login`)

| Key | String |
|-----|--------|
| login.pageTitle | "Sign in — Daimon" |
| login.card.title | "Welcome back" |
| login.card.subtitle | "Sign in to your Daimon account" |
| login.field.email.label | "Email" |
| login.field.email.placeholder | "you@example.com" |
| login.field.password.label | "Password" |
| login.field.password.placeholder | "••••••••" |
| login.forgotPassword | "Forgot password?" |
| login.submitButton.default | "Sign In" |
| login.submitButton.loading | (spinner, no text) |
| login.footer.prompt | "Don't have an account?" |
| login.footer.link | "Sign up free" |

**Auth error messages (AlertBanner):**

| Trigger | Message |
|---------|---------|
| Invalid credentials | "Invalid email or password. Please try again." |
| Email not confirmed | "Please verify your email address. Check your inbox for a confirmation link." |
| Account banned | "Your account has been suspended. Contact support at support@daimon.ai." |
| Rate limit (429) | "Too many sign-in attempts. Please wait 15 minutes and try again." |
| Network error | "Unable to connect. Please check your internet connection and try again." |
| Generic error | "Something went wrong. Please try again or contact support@daimon.ai." |

**Field validation errors:**

| Field | Rule | Error |
|-------|------|-------|
| email | Empty | "Email is required." |
| email | Invalid format | "Please enter a valid email address." |
| password | Empty | "Password is required." |

---

### Signup Page (`/signup`)

| Key | String |
|-----|--------|
| signup.pageTitle | "Create your account — Daimon" |
| signup.card.title | "Create your account" |
| signup.card.subtitle | "Start with your Discord bot in minutes." |
| signup.field.fullName.label | "Full name" |
| signup.field.fullName.placeholder | "Jane Smith" |
| signup.field.workspaceName.label | "Workspace name" |
| signup.field.workspaceName.placeholder | "Acme Corp" |
| signup.field.workspaceName.helpText | "This is the name of your Daimon workspace. You can change it later." |
| signup.field.email.label | "Email" |
| signup.field.email.placeholder | "you@example.com" |
| signup.field.password.label | "Password" |
| signup.field.password.placeholder | "Choose a strong password" |
| signup.field.password.helpText | "At least 8 characters." |
| signup.field.confirmPassword.label | "Confirm password" |
| signup.field.confirmPassword.placeholder | "Repeat your password" |
| signup.terms.prefix | "By creating an account, you agree to our" |
| signup.terms.termsLink | "Terms of Service" |
| signup.terms.and | "and" |
| signup.terms.privacyLink | "Privacy Policy" |
| signup.submitButton.default | "Create account" |
| signup.submitButton.loading | (spinner, no text) |
| signup.footer.prompt | "Already have an account?" |
| signup.footer.link | "Sign in" |

**Post-signup success state (replaces form):**

| Key | String |
|-----|--------|
| signup.success.icon | (email icon, 48px, Aqua) |
| signup.success.title | "Check your inbox" |
| signup.success.body | "We sent a confirmation link to **{email}**. Click it to activate your account and get started." |
| signup.success.resend.prompt | "Didn't receive it?" |
| signup.success.resend.link | "Resend confirmation email" |
| signup.success.resend.sent | "Email resent! Check your inbox." |
| signup.success.spamNote | "If you don't see it, check your spam folder." |

**Field validation errors:**

| Field | Rule | Error |
|-------|------|-------|
| fullName | Empty | "Full name is required." |
| fullName | Too short (< 2 chars) | "Please enter your full name." |
| workspaceName | Empty | "Workspace name is required." |
| workspaceName | Too short (< 2 chars) | "Workspace name must be at least 2 characters." |
| workspaceName | Too long (> 64 chars) | "Workspace name must be 64 characters or less." |
| email | Empty | "Email is required." |
| email | Invalid format | "Please enter a valid email address." |
| email | Already registered | "An account with this email already exists. Try signing in." |
| password | Empty | "Password is required." |
| password | Too short (< 8 chars) | "Password must be at least 8 characters." |
| confirmPassword | Empty | "Please confirm your password." |
| confirmPassword | Doesn't match | "Passwords do not match." |

---

### Reset Password Page (`/reset-password`)

| Key | String |
|-----|--------|
| resetPassword.pageTitle | "Reset your password — Daimon" |
| resetPassword.card.title | "Reset your password" |
| resetPassword.card.subtitle | "Enter your email and we'll send you a reset link." |
| resetPassword.field.email.label | "Email" |
| resetPassword.field.email.placeholder | "you@example.com" |
| resetPassword.submitButton.default | "Send reset link" |
| resetPassword.submitButton.loading | (spinner, no text) |
| resetPassword.footer.prompt | "Remember your password?" |
| resetPassword.footer.link | "Sign in" |

**Success state (replaces form):**

| Key | String |
|-----|--------|
| resetPassword.success.title | "Check your email" |
| resetPassword.success.body | "If an account exists for **{email}**, we've sent a password reset link. It expires in 1 hour." |
| resetPassword.success.note | "Didn't receive it? Check your spam folder, or try again with the correct email address." |
| resetPassword.success.backLink | "Back to sign in" |

**Error messages:**

| Trigger | Message |
|---------|---------|
| Email empty | "Email is required." |
| Invalid format | "Please enter a valid email address." |
| Rate limit | "Too many reset attempts. Please wait 15 minutes." |
| Generic error | "Something went wrong. Please try again." |

---

### Reset Password Confirm Page (`/reset-password/confirm`)

| Key | String |
|-----|--------|
| resetConfirm.pageTitle | "Set new password — Daimon" |
| resetConfirm.card.title | "Set your new password" |
| resetConfirm.card.subtitle | "Choose a strong password for your account." |
| resetConfirm.field.password.label | "New password" |
| resetConfirm.field.password.placeholder | "Choose a strong password" |
| resetConfirm.field.password.helpText | "At least 8 characters." |
| resetConfirm.field.confirmPassword.label | "Confirm new password" |
| resetConfirm.field.confirmPassword.placeholder | "Repeat your new password" |
| resetConfirm.submitButton.default | "Update password" |
| resetConfirm.submitButton.loading | (spinner, no text) |

**Success state:**

| Key | String |
|-----|--------|
| resetConfirm.success.title | "Password updated" |
| resetConfirm.success.body | "Your password has been changed successfully." |
| resetConfirm.success.cta | "Sign in with new password" |

**Error messages:**

| Trigger | Message |
|---------|---------|
| Invalid/expired token | "This reset link has expired or is invalid. Please request a new one." |
| Password empty | "Password is required." |
| Too short | "Password must be at least 8 characters." |
| Passwords don't match | "Passwords do not match." |
| Generic error | "Something went wrong. Please request a new reset link." |

---

### Email Confirmation Page (`/confirm`)

Visited when user clicks the confirmation link from their email.

| Key | String |
|-----|--------|
| confirm.pageTitle | "Confirming your account — Daimon" |
| confirm.loading.title | "Verifying your email…" |
| confirm.loading.body | "Please wait a moment." |
| confirm.success.title | "Email confirmed!" |
| confirm.success.body | "Your account is ready. Let's get your bot set up." |
| confirm.success.cta | "Go to Dashboard" |
| confirm.error.title | "Confirmation failed" |
| confirm.error.body | "This confirmation link is invalid or has expired." |
| confirm.error.cta | "Request a new link" |

---

## 4. Dashboard Home

### Page Header

| Key | String |
|-----|--------|
| dashboard.pageTitle | "Dashboard — Daimon" |
| dashboard.topbar.title | "Dashboard" |

### Onboarding Checklist

| Key | String |
|-----|--------|
| onboarding.title | "Get started" |
| onboarding.subtitle | "Complete these steps to bring your bot online." |
| onboarding.progress | "Step {n} of {total}" |
| onboarding.step1.title | "Create your Discord bot" |
| onboarding.step1.description | "Go to the Discord Developer Portal, create a new application, and copy your bot token." |
| onboarding.step1.cta | "Go to Discord Developer Portal →" |
| onboarding.step2.title | "Connect your Discord server" |
| onboarding.step2.description | "Paste your bot token and server (guild) ID to connect your bot to your Discord server." |
| onboarding.step2.cta | "Add Discord Connection →" |
| onboarding.step3.title | "Add your Anthropic API key" |
| onboarding.step3.description | "Paste your Anthropic API key so your bot can use Claude for conversations and tool use." |
| onboarding.step3.cta | "Add API Key →" |
| onboarding.step4.title | "Wait for your bot to come online" |
| onboarding.step4.description | "Once your token and key are saved, your bot will connect automatically — usually within 30 seconds." |
| onboarding.complete.toast | "Your bot is online! Daimon is now active in your Discord server." |

### Bot Status Card

**Card header:**

| Key | String |
|-----|--------|
| botStatus.cardTitle | "Bot Status" |

**Connected state:**

| Key | String |
|-----|--------|
| botStatus.connected.status | "Connected" |
| botStatus.connected.subtext | "Bot is online and active in your server" |
| botStatus.connected.botIdentity | "@{bot_username}" |
| botStatus.connected.guildId | "Server ID: {guild_id}" |
| botStatus.connected.heartbeat.justNow | "Last seen just now" |
| botStatus.connected.heartbeat.minutes | "Last seen {n} minute(s) ago" |
| botStatus.connected.heartbeat.stale | "Heartbeat delayed — bot may be unresponsive" |

**Connecting state:**

| Key | String |
|-----|--------|
| botStatus.connecting.status | "Connecting…" |
| botStatus.connecting.subtext | "Your bot is establishing a connection. This usually takes under 30 seconds." |

**Error state:**

| Key | String |
|-----|--------|
| botStatus.error.status | "Connection Error" |
| botStatus.error.subtext | "Check your bot token in Settings and try reconnecting." |
| botStatus.error.cta | "Go to Settings" |

**Disconnected state:**

| Key | String |
|-----|--------|
| botStatus.disconnected.status | "Disconnected" |
| botStatus.disconnected.subtext | "Your bot is not connected to any Discord server." |
| botStatus.disconnected.cta | "Add Discord Connection" |

**No connection state (never configured):**

| Key | String |
|-----|--------|
| botStatus.none.title | "No bot connected" |
| botStatus.none.body | "You haven't connected a Discord bot yet. Add your bot token and server ID to get started." |
| botStatus.none.cta | "Connect your bot" |

### API Keys Card

| Key | String |
|-----|--------|
| apiKeys.cardTitle | "API Keys" |
| apiKeys.anthropic.label | "Anthropic" |
| apiKeys.anthropic.description | "Required for Claude AI" |
| apiKeys.anthropic.status.valid | "Active — added {relative-date}" |
| apiKeys.anthropic.status.invalid | "Invalid key — please update" |
| apiKeys.anthropic.status.missing | "Not added" |
| apiKeys.anthropic.cta.add | "Add key" |
| apiKeys.anthropic.cta.update | "Update" |
| apiKeys.openai.label | "OpenAI" |
| apiKeys.openai.description | "Optional — used for classification" |
| apiKeys.openai.status.valid | "Active — added {relative-date}" |
| apiKeys.openai.status.invalid | "Invalid key — please update" |
| apiKeys.openai.status.missing | "Not added" |
| apiKeys.openai.cta.add | "Add key" |
| apiKeys.openai.cta.update | "Update" |
| apiKeys.manage.link | "Manage in Billing →" |

### Service Integrations Card (compact)

| Key | String |
|-----|--------|
| serviceIntegrations.cardTitle | "Integrations" |
| serviceIntegrations.connected | "{n} connected" |
| serviceIntegrations.none | "No services connected" |
| serviceIntegrations.manage.link | "Manage integrations →" |

### Quick Stats Row

| Key | String |
|-----|--------|
| stats.messagesToday.label | "Messages today" |
| stats.commandsToday.label | "Commands today" |
| stats.uptime.label | "Uptime" |
| stats.uptime.value | "{hours}h {minutes}m" |
| stats.uptime.noData | "—" |
| stats.noData | "—" |

### Recent Activity Feed

| Key | String |
|-----|--------|
| activity.cardTitle | "Recent Activity" |
| activity.empty.title | "No activity yet" |
| activity.empty.body | "Your bot's activity will appear here once it's connected and in use." |
| activity.item.botConnected | "Bot connected to {guild_name}" |
| activity.item.botDisconnected | "Bot disconnected from {guild_name}" |
| activity.item.keyAdded | "Anthropic API key added" |
| activity.item.keyUpdated | "Anthropic API key updated" |
| activity.item.serviceConnected | "{service_name} connected" |
| activity.item.serviceDisconnected | "{service_name} disconnected" |
| activity.item.planUpgraded | "Upgraded to {plan_name} plan" |
| activity.item.planDowngraded | "Downgraded to {plan_name} plan" |
| activity.viewAll | "View all activity" |

### Dashboard Page Error State

| Key | String |
|-----|--------|
| dashboard.error.title | "Failed to load dashboard" |
| dashboard.error.body | "We couldn't load your workspace data. Please refresh the page." |
| dashboard.error.cta | "Refresh" |

---

## 5. Integrations Page

### Page Header

| Key | String |
|-----|--------|
| integrations.pageTitle | "Integrations — Daimon" |
| integrations.topbar.title | "Integrations" |
| integrations.header.title | "Integrations" |
| integrations.header.subtitle | "Connect your services so the bot can work with your tools. Connected services are available to all users in your Discord server." |

### Service Cards

#### GitHub

| Key | String |
|-----|--------|
| integrations.github.name | "GitHub" |
| integrations.github.description | "Manage issues, review pull requests, and run GitHub CLI commands." |
| integrations.github.authType | "OAuth 2.0" |
| integrations.github.cta.connect | "Connect GitHub" |
| integrations.github.cta.connected | "Connected" |
| integrations.github.cta.disconnect | "Disconnect" |
| integrations.github.status.active | "Connected as {account_name}" |
| integrations.github.status.expired | "Connection expired — reconnect to restore access" |
| integrations.github.status.error | "Connection error — please reconnect" |
| integrations.github.disconnect.confirm.title | "Disconnect GitHub?" |
| integrations.github.disconnect.confirm.body | "The bot will lose access to GitHub tools. You can reconnect at any time." |

#### Google

| Key | String |
|-----|--------|
| integrations.google.name | "Google" |
| integrations.google.description | "Access Google Analytics data and reports." |
| integrations.google.authType | "OAuth 2.0" |
| integrations.google.cta.connect | "Connect Google" |
| integrations.google.cta.connected | "Connected" |
| integrations.google.cta.disconnect | "Disconnect" |
| integrations.google.status.active | "Connected as {account_name}" |
| integrations.google.status.expired | "Connection expired — reconnect to restore access" |
| integrations.google.status.error | "Connection error — please reconnect" |
| integrations.google.disconnect.confirm.title | "Disconnect Google?" |
| integrations.google.disconnect.confirm.body | "The bot will lose access to Google Analytics tools. You can reconnect at any time." |

#### Linear

| Key | String |
|-----|--------|
| integrations.linear.name | "Linear" |
| integrations.linear.description | "Query issues, update projects, and manage your Linear workspace." |
| integrations.linear.authType | "OAuth 2.0" |
| integrations.linear.cta.connect | "Connect Linear" |
| integrations.linear.cta.connected | "Connected" |
| integrations.linear.cta.disconnect | "Disconnect" |
| integrations.linear.status.active | "Connected as {account_name}" |
| integrations.linear.status.expired | "Connection expired — reconnect to restore access" |
| integrations.linear.status.error | "Connection error — please reconnect" |
| integrations.linear.disconnect.confirm.title | "Disconnect Linear?" |
| integrations.linear.disconnect.confirm.body | "The bot will lose access to Linear tools. You can reconnect at any time." |

#### Toggl

| Key | String |
|-----|--------|
| integrations.toggl.name | "Toggl" |
| integrations.toggl.description | "Time tracking — start timers, run reports, manage projects and clients." |
| integrations.toggl.authType | "API key" |
| integrations.toggl.cta.connect | "Add API key" |
| integrations.toggl.cta.connected | "Connected" |
| integrations.toggl.cta.update | "Update key" |
| integrations.toggl.cta.disconnect | "Remove" |
| integrations.toggl.status.active | "Connected — key added {relative-date}" |
| integrations.toggl.status.invalid | "Invalid key — please update" |
| integrations.toggl.disconnect.confirm.title | "Remove Toggl connection?" |
| integrations.toggl.disconnect.confirm.body | "The bot will lose access to Toggl time tracking tools. You can reconnect at any time." |

### Toggl API Key Modal

| Key | String |
|-----|--------|
| togglModal.title | "Connect Toggl" |
| togglModal.subtitle | "Enter your Toggl API key to connect your account." |
| togglModal.field.apiKey.label | "Toggl API key" |
| togglModal.field.apiKey.placeholder | "Paste your Toggl API key" |
| togglModal.field.apiKey.helpText | "Find your API key in Toggl Track → Profile Settings → API Token." |
| togglModal.field.apiKey.helpLink | "How to find your Toggl API key →" |
| togglModal.submitButton.default | "Save and connect" |
| togglModal.submitButton.validating | "Validating…" |
| togglModal.submitButton.saving | "Saving…" |
| togglModal.success | "Toggl connected successfully." |
| togglModal.error.invalidKey | "Invalid API key. Please check and try again." |
| togglModal.error.networkError | "Unable to validate key. Please check your connection and try again." |
| togglModal.error.generic | "Something went wrong. Please try again." |

### Role Restriction Notice (member-only view)

| Key | String |
|-----|--------|
| integrations.roleNotice | "Only workspace owners and admins can connect or disconnect services." |
| integrations.disabledButton.tooltip | "Only the workspace owner can perform this action." |

### Empty State (no services connected)

| Key | String |
|-----|--------|
| integrations.empty.title | "No services connected" |
| integrations.empty.body | "Connect your first service to give the bot access to your tools." |

---

## 6. Billing Page

### Page Header

| Key | String |
|-----|--------|
| billing.pageTitle | "Billing — Daimon" |
| billing.topbar.title | "Billing" |
| billing.header.title | "Billing" |
| billing.header.subtitle | "Manage your subscription plan and API keys." |

### Subscription Section

| Key | String |
|-----|--------|
| billing.subscription.sectionTitle | "Subscription" |
| billing.subscription.currentPlan.label | "Current plan" |
| billing.subscription.billingPeriod.label | "Billing period" |
| billing.subscription.billingPeriod.value | "{start_date} → {end_date}" |
| billing.subscription.nextBilling.label | "Next billing date" |
| billing.subscription.nextBilling.value | "{date}" |
| billing.subscription.cancelAtPeriodEnd.notice | "Your subscription will be cancelled on {date}. You can continue using {plan} features until then." |
| billing.subscription.trial.notice | "You're on a free trial until {date}." |

**Stripe status banners:**

| Status | Banner type | Text |
|--------|-------------|------|
| `past_due` | error | "Your payment failed. Please update your payment method to keep your bot online." |
| `canceled` | error | "Your subscription has been cancelled. Upgrade to restore access." |
| `unpaid` | error | "Payment is overdue. Update your payment method to avoid service interruption." |

**Upgrade button states (Free plan):**

| Key | String |
|-----|--------|
| billing.upgrade.cta | "Upgrade to Starter" |
| billing.upgrade.ctaPro | "Upgrade to Pro" |
| billing.upgrade.loading | "Redirecting to checkout…" |

**Manage billing button (Starter/Pro):**

| Key | String |
|-----|--------|
| billing.portal.cta | "Manage billing" |
| billing.portal.loading | "Opening billing portal…" |
| billing.portal.error | "Unable to open the billing portal. Please try again." |

### Plan Comparison Table

| Key | String |
|-----|--------|
| billing.plans.compareTitle | "Compare plans" |
| billing.plans.feature.messages | "Messages per day" |
| billing.plans.feature.servers | "Discord servers" |
| billing.plans.feature.tools | "Tools available" |
| billing.plans.feature.history | "Message history" |
| billing.plans.feature.support | "Support" |
| billing.plans.feature.admin | "Admin panel" |
| billing.plans.free.messages | "50 / day" |
| billing.plans.free.servers | "1" |
| billing.plans.free.tools | "Core tools" |
| billing.plans.free.history | "7 days" |
| billing.plans.free.support | "Community" |
| billing.plans.free.admin | "—" |
| billing.plans.starter.messages | "500 / day" |
| billing.plans.starter.servers | "1" |
| billing.plans.starter.tools | "All 50+ tools" |
| billing.plans.starter.history | "30 days" |
| billing.plans.starter.support | "Email" |
| billing.plans.starter.admin | "—" |
| billing.plans.pro.messages | "Unlimited" |
| billing.plans.pro.servers | "1" |
| billing.plans.pro.tools | "All 50+ tools" |
| billing.plans.pro.history | "90 days" |
| billing.plans.pro.support | "Priority" |
| billing.plans.pro.admin | "✓" |

### API Keys Section

| Key | String |
|-----|--------|
| billing.apiKeys.sectionTitle | "API Keys" |
| billing.apiKeys.sectionSubtitle | "Your keys are encrypted at rest and never exposed. Only the last 4 characters are shown as a hint." |
| billing.apiKeys.anthropic.title | "Anthropic API Key" |
| billing.apiKeys.anthropic.description | "Required. Used for all Claude AI interactions. Get yours at console.anthropic.com." |
| billing.apiKeys.anthropic.hint | "sk-ant-…{hint}" |
| billing.apiKeys.anthropic.status.valid | "Valid — last verified {date}" |
| billing.apiKeys.anthropic.status.invalid | "Invalid — please update" |
| billing.apiKeys.anthropic.status.missing | "Not configured" |
| billing.apiKeys.anthropic.cta.add | "Add Anthropic key" |
| billing.apiKeys.anthropic.cta.update | "Update key" |
| billing.apiKeys.anthropic.cta.delete | "Remove" |
| billing.apiKeys.openai.title | "OpenAI API Key" |
| billing.apiKeys.openai.description | "Optional. Used for text classification if configured. Get yours at platform.openai.com." |
| billing.apiKeys.openai.hint | "sk-…{hint}" |
| billing.apiKeys.openai.status.valid | "Valid — last verified {date}" |
| billing.apiKeys.openai.status.invalid | "Invalid — please update" |
| billing.apiKeys.openai.status.missing | "Not configured" |
| billing.apiKeys.openai.cta.add | "Add OpenAI key" |
| billing.apiKeys.openai.cta.update | "Update key" |
| billing.apiKeys.openai.cta.delete | "Remove" |

### API Key Input Modal

| Key | String |
|-----|--------|
| apiKeyModal.anthropic.title | "Add Anthropic API key" |
| apiKeyModal.anthropic.subtitle | "Your key is encrypted immediately and never stored in plaintext." |
| apiKeyModal.anthropic.field.label | "Anthropic API key" |
| apiKeyModal.anthropic.field.placeholder | "sk-ant-api03-…" |
| apiKeyModal.anthropic.field.helpText | "Starts with sk-ant-. Find it at console.anthropic.com → API Keys." |
| apiKeyModal.openai.title | "Add OpenAI API key" |
| apiKeyModal.openai.subtitle | "Your key is encrypted immediately and never stored in plaintext." |
| apiKeyModal.openai.field.label | "OpenAI API key" |
| apiKeyModal.openai.field.placeholder | "sk-proj-…" |
| apiKeyModal.openai.field.helpText | "Starts with sk-. Find it at platform.openai.com → API Keys." |
| apiKeyModal.submitButton.default | "Save key" |
| apiKeyModal.submitButton.validating | "Validating…" |
| apiKeyModal.submitButton.saving | "Saving…" |
| apiKeyModal.success.anthropic | "Anthropic API key saved successfully." |
| apiKeyModal.success.openai | "OpenAI API key saved successfully." |
| apiKeyModal.error.invalidKey | "Invalid API key. Please check the key and try again." |
| apiKeyModal.error.wrongFormat | "This doesn't look like a valid API key. Please check and try again." |
| apiKeyModal.error.generic | "Something went wrong saving your key. Please try again." |

### API Key Delete Confirmation

| Key | String |
|-----|--------|
| apiKeyDelete.anthropic.title | "Remove Anthropic API key?" |
| apiKeyDelete.anthropic.body | "Removing your Anthropic key will immediately take your bot offline. The bot cannot process messages without an Anthropic key." |
| apiKeyDelete.openai.title | "Remove OpenAI API key?" |
| apiKeyDelete.openai.body | "The bot will stop using OpenAI for classification tasks. This will not take the bot offline." |
| apiKeyDelete.confirmButton | "Yes, remove key" |

### Stripe Checkout Success Banner

| Key | String |
|-----|--------|
| billing.checkoutSuccess.banner | "Your subscription has been updated. Welcome to the {plan} plan!" |
| billing.checkoutCancelled.banner | "Checkout cancelled — your subscription was not changed." |

### Role Restriction (member view)

| Key | String |
|-----|--------|
| billing.readOnly.notice | "Only the workspace owner can manage billing and API keys." |

---

## 7. Settings Page

### Page Header

| Key | String |
|-----|--------|
| settings.pageTitle | "Settings — Daimon" |
| settings.topbar.title | "Settings" |
| settings.header.title | "Settings" |
| settings.header.subtitle | "Manage your workspace configuration and account preferences." |

### Workspace Section

| Key | String |
|-----|--------|
| settings.workspace.sectionTitle | "Workspace" |
| settings.workspace.sectionSubtitle | "Your workspace configuration and identifiers." |
| settings.workspace.name.label | "Workspace name" |
| settings.workspace.name.placeholder | "My Discord Server" |
| settings.workspace.id.label | "Workspace ID" |
| settings.workspace.id.helpText | "Read-only. Use this ID when contacting support." |
| settings.workspace.id.copyTooltip | "Copy workspace ID" |
| settings.workspace.created.label | "Created" |
| settings.workspace.saveButton | "Save changes" |
| settings.workspace.saving | "Saving…" |
| settings.workspace.success | "Workspace name updated." |
| settings.workspace.error.empty | "Workspace name is required." |
| settings.workspace.error.tooShort | "Workspace name must be at least 2 characters." |
| settings.workspace.error.tooLong | "Workspace name must be 64 characters or less." |
| settings.workspace.error.generic | "Failed to update workspace name. Please try again." |

### Discord Connection Section

| Key | String |
|-----|--------|
| settings.discord.sectionTitle | "Discord Connection" |
| settings.discord.sectionSubtitle | "Connect your Discord bot to this workspace." |
| settings.discord.noConnection.title | "No Discord bot connected" |
| settings.discord.noConnection.body | "Add your Discord bot token and server ID to connect your bot." |
| settings.discord.noConnection.cta | "Add connection" |
| settings.discord.addButton | "Add connection" |
| settings.discord.connected.label | "Connected bot" |
| settings.discord.guildId.label | "Server (Guild) ID" |
| settings.discord.botUsername.label | "Bot username" |
| settings.discord.status.label | "Status" |
| settings.discord.addedOn.label | "Added on" |
| settings.discord.updateButton | "Update token" |
| settings.discord.removeButton | "Remove connection" |

**Discord Connection Modal:**

| Key | String |
|-----|--------|
| discordModal.add.title | "Connect Discord bot" |
| discordModal.add.subtitle | "Paste your bot token and Discord server ID. Your token is encrypted immediately." |
| discordModal.update.title | "Update bot token" |
| discordModal.update.subtitle | "Enter your new bot token. The previous token will be replaced." |
| discordModal.field.botToken.label | "Bot token" |
| discordModal.field.botToken.placeholder | "MTA5NjM…" |
| discordModal.field.botToken.helpText | "Find this in the Discord Developer Portal → Your Application → Bot → Token." |
| discordModal.field.botToken.helpLink | "How to get your bot token →" |
| discordModal.field.guildId.label | "Server (Guild) ID" |
| discordModal.field.guildId.placeholder | "123456789012345678" |
| discordModal.field.guildId.helpText | "Right-click your server in Discord → Copy Server ID. (Enable Developer Mode in Discord settings first.)" |
| discordModal.field.guildId.helpLink | "How to enable Developer Mode →" |
| discordModal.submitButton.add | "Connect bot" |
| discordModal.submitButton.update | "Update token" |
| discordModal.submitButton.loading | "Connecting…" |
| discordModal.success.add | "Discord bot connected. Your bot will come online within 30 seconds." |
| discordModal.success.update | "Bot token updated. Your bot will reconnect shortly." |
| discordModal.error.invalidToken | "Invalid bot token format. Discord tokens follow the pattern: Base64ID.Timestamp.HMAC." |
| discordModal.error.invalidGuildId | "Invalid server ID. Guild IDs are 17–20 digit numbers." |
| discordModal.error.generic | "Failed to save connection. Please try again." |

**Remove Discord Connection Confirmation:**

| Key | String |
|-----|--------|
| discordRemove.confirm.title | "Remove Discord connection?" |
| discordRemove.confirm.body | "This will immediately disconnect your bot from Discord. The bot will go offline and stop responding to messages. You can reconnect at any time." |
| discordRemove.confirm.confirmButton | "Yes, remove connection" |
| discordRemove.success | "Discord connection removed. Your bot is now offline." |

### Team Members Section

| Key | String |
|-----|--------|
| settings.team.sectionTitle | "Team Members" |
| settings.team.sectionSubtitle | "Members of your Daimon workspace." |
| settings.team.columns.name | "Name" |
| settings.team.columns.email | "Email" |
| settings.team.columns.role | "Role" |
| settings.team.columns.joined | "Joined" |
| settings.team.invite.comingSoon | "Multi-member workspaces coming soon." |
| settings.team.currentUser.badge | "You" |

### Account Section

| Key | String |
|-----|--------|
| settings.account.sectionTitle | "Account" |
| settings.account.sectionSubtitle | "Your personal account details." |
| settings.account.displayName.label | "Display name" |
| settings.account.displayName.placeholder | "Jane Smith" |
| settings.account.email.label | "Email address" |
| settings.account.email.helpText | "Email cannot be changed. Contact support if you need to update it." |
| settings.account.saveButton | "Save changes" |
| settings.account.saving | "Saving…" |
| settings.account.success | "Display name updated." |
| settings.account.error.empty | "Display name is required." |
| settings.account.error.generic | "Failed to update display name. Please try again." |

**Change Password sub-section:**

| Key | String |
|-----|--------|
| settings.account.changePassword.title | "Change password" |
| settings.account.changePassword.currentLabel | "Current password" |
| settings.account.changePassword.currentPlaceholder | "Enter current password" |
| settings.account.changePassword.newLabel | "New password" |
| settings.account.changePassword.newPlaceholder | "Choose a new password" |
| settings.account.changePassword.newHelpText | "At least 8 characters." |
| settings.account.changePassword.confirmLabel | "Confirm new password" |
| settings.account.changePassword.confirmPlaceholder | "Repeat new password" |
| settings.account.changePassword.submitButton | "Update password" |
| settings.account.changePassword.loading | "Updating…" |
| settings.account.changePassword.success | "Password updated successfully." |
| settings.account.changePassword.error.wrong | "Current password is incorrect." |
| settings.account.changePassword.error.tooShort | "New password must be at least 8 characters." |
| settings.account.changePassword.error.noMatch | "Passwords do not match." |
| settings.account.changePassword.error.generic | "Failed to update password. Please try again." |

### Danger Zone Section

| Key | String |
|-----|--------|
| settings.dangerZone.sectionTitle | "Danger Zone" |
| settings.dangerZone.deleteWorkspace.label | "Delete workspace" |
| settings.dangerZone.deleteWorkspace.description | "Permanently delete this workspace and all associated data. This action cannot be undone." |
| settings.dangerZone.deleteWorkspace.button | "Delete workspace" |

**Delete Workspace Confirmation Dialog:**

| Key | String |
|-----|--------|
| deleteWorkspace.confirm.title | "Delete workspace?" |
| deleteWorkspace.confirm.body | "This will permanently delete **{workspace_name}** and all associated data including your Discord connection, API keys, service connections, and subscription. This action **cannot be undone**." |
| deleteWorkspace.confirm.field.label | "Type **{workspace_name}** to confirm" |
| deleteWorkspace.confirm.field.placeholder | "Enter workspace name" |
| deleteWorkspace.confirm.confirmButton | "Delete workspace permanently" |
| deleteWorkspace.confirm.loading | "Deleting…" |
| deleteWorkspace.confirm.error.mismatch | "Workspace name doesn't match. Please type it exactly." |
| deleteWorkspace.confirm.error.generic | "Failed to delete workspace. Please try again or contact support." |

### Role Restriction Tooltip

| Key | String |
|-----|--------|
| settings.roleRestriction.tooltip | "Only the workspace owner can perform this action." |

---

## 8. Admin Panel

### Page Headers

| Key | String |
|-----|--------|
| admin.pageTitle | "Admin — Daimon" |
| admin.topbar.title | "Admin" |
| admin.header.title | "Admin Panel" |
| admin.header.subtitle | "Manage all tenants, subscriptions, and platform health." |
| admin.accessDenied.title | "Access denied" |
| admin.accessDenied.body | "You do not have permission to view this page." |

### Tenant List

| Key | String |
|-----|--------|
| admin.tenants.sectionTitle | "Tenants" |
| admin.tenants.search.placeholder | "Search by name, email, or workspace ID…" |
| admin.tenants.filter.all | "All plans" |
| admin.tenants.filter.free | "Free" |
| admin.tenants.filter.starter | "Starter" |
| admin.tenants.filter.pro | "Pro" |
| admin.tenants.filter.status.all | "All statuses" |
| admin.tenants.filter.status.active | "Active" |
| admin.tenants.filter.status.pending | "Pending" |
| admin.tenants.filter.status.suspended | "Suspended" |
| admin.tenants.columns.name | "Workspace" |
| admin.tenants.columns.owner | "Owner" |
| admin.tenants.columns.plan | "Plan" |
| admin.tenants.columns.status | "Status" |
| admin.tenants.columns.botStatus | "Bot" |
| admin.tenants.columns.created | "Created" |
| admin.tenants.columns.actions | "Actions" |
| admin.tenants.actions.view | "View details" |
| admin.tenants.actions.impersonate | "Impersonate" |
| admin.tenants.actions.suspend | "Suspend" |
| admin.tenants.actions.unsuspend | "Unsuspend" |
| admin.tenants.empty.title | "No tenants found" |
| admin.tenants.empty.body | "No tenants match your search and filter criteria." |
| admin.tenants.pagination.showing | "Showing {start}–{end} of {total} tenants" |

### Tenant Detail

| Key | String |
|-----|--------|
| admin.tenantDetail.backLink | "← Back to tenants" |
| admin.tenantDetail.sections.overview | "Overview" |
| admin.tenantDetail.sections.subscription | "Subscription" |
| admin.tenantDetail.sections.connections | "Connections" |
| admin.tenantDetail.sections.apiKeys | "API Keys" |
| admin.tenantDetail.sections.auditLog | "Audit Log" |
| admin.tenantDetail.impersonateButton | "Impersonate tenant" |
| admin.tenantDetail.suspendButton | "Suspend tenant" |
| admin.tenantDetail.unsuspendButton | "Unsuspend tenant" |

**Impersonation banner (shown while impersonating):**

| Key | String |
|-----|--------|
| admin.impersonation.banner | "You are viewing Daimon as **{tenant_name}**. Any changes you make are real." |
| admin.impersonation.exitButton | "Exit impersonation" |

**Suspend confirmation:**

| Key | String |
|-----|--------|
| admin.suspend.title | "Suspend {tenant_name}?" |
| admin.suspend.body | "Suspending this tenant will immediately disconnect their bot and prevent login. Their data is preserved." |
| admin.suspend.confirmButton | "Suspend tenant" |
| admin.suspend.success | "Tenant suspended." |
| admin.unsuspend.title | "Unsuspend {tenant_name}?" |
| admin.unsuspend.body | "This will restore the tenant's access. Their bot will reconnect automatically." |
| admin.unsuspend.confirmButton | "Unsuspend tenant" |
| admin.unsuspend.success | "Tenant unsuspended." |

---

## 9. Toast Notifications

All toasts are displayed in the bottom-right corner. Duration: 4 seconds unless otherwise noted. Dismiss: click × button.

### Success Toasts

| ID | String | Trigger |
|----|--------|---------|
| toast.success.workspaceNameUpdated | "Workspace name updated." | Save workspace name |
| toast.success.discordConnected | "Discord bot connected. Your bot will come online within 30 seconds." | Add Discord connection |
| toast.success.discordUpdated | "Bot token updated. Your bot will reconnect shortly." | Update bot token |
| toast.success.discordRemoved | "Discord connection removed. Your bot is now offline." | Remove Discord connection |
| toast.success.anthropicKeyAdded | "Anthropic API key saved." | Add Anthropic key |
| toast.success.openaiKeyAdded | "OpenAI API key saved." | Add OpenAI key |
| toast.success.anthropicKeyRemoved | "Anthropic API key removed." | Remove Anthropic key |
| toast.success.openaiKeyRemoved | "OpenAI API key removed." | Remove OpenAI key |
| toast.success.serviceConnected | "{service_name} connected successfully." | OAuth complete |
| toast.success.serviceDisconnected | "{service_name} disconnected." | Disconnect service |
| toast.success.togglConnected | "Toggl connected successfully." | Add Toggl API key |
| toast.success.displayNameUpdated | "Display name updated." | Save account settings |
| toast.success.passwordUpdated | "Password updated successfully." | Change password |
| toast.success.botOnline | "Your bot is online! Daimon is now active in your Discord server." | Bot connects (onboarding complete) |
| toast.success.copiedToClipboard | "Copied to clipboard." | Copy action (any) |
| toast.success.planUpgraded | "Upgraded to {plan_name}! Your new features are active." | Stripe checkout success |

### Error Toasts

| ID | String | Trigger |
|----|--------|---------|
| toast.error.generic | "Something went wrong. Please try again." | Uncategorized error |
| toast.error.networkError | "Connection error. Please check your internet and try again." | Network failure |
| toast.error.sessionExpired | "Your session has expired. Please sign in again." | Auth session timeout |
| toast.error.oauthFailed | "Failed to connect {service_name}. Please try again." | OAuth error callback |
| toast.error.oauthCancelled | "{service_name} authorization was cancelled." | User cancels OAuth |
| toast.error.stripeError | "Unable to open billing portal. Please try again." | Stripe error |
| toast.error.suspendedAccount | "This workspace has been suspended. Contact support@daimon.ai." | Suspended tenant action |

### Info Toasts

| ID | String | Trigger |
|----|--------|---------|
| toast.info.botReconnecting | "Bot is reconnecting…" | Realtime status change to connecting |
| toast.info.sessionRefreshed | "Session refreshed." | Silent token refresh (rare, shown only on failure recovery) |

---

## 10. Confirmation Dialogs

All confirmation dialogs are centered modals with an overlay. Dismiss via Cancel button or pressing Escape.

| Dialog ID | Title | Body | Cancel label | Confirm label |
|-----------|-------|------|--------------|---------------|
| confirm.deleteWorkspace | "Delete workspace?" | "This will permanently delete **{name}** and all data. This action cannot be undone." | "Cancel" | "Delete workspace permanently" |
| confirm.removeDiscord | "Remove Discord connection?" | "This will immediately disconnect your bot from Discord. The bot will go offline." | "Cancel" | "Yes, remove connection" |
| confirm.removeAnthropicKey | "Remove Anthropic API key?" | "Removing your Anthropic key will immediately take your bot offline." | "Cancel" | "Yes, remove key" |
| confirm.removeOpenAIKey | "Remove OpenAI API key?" | "The bot will stop using OpenAI for classification. This will not take the bot offline." | "Cancel" | "Yes, remove key" |
| confirm.disconnectService.github | "Disconnect GitHub?" | "The bot will lose access to GitHub tools. You can reconnect at any time." | "Cancel" | "Disconnect" |
| confirm.disconnectService.google | "Disconnect Google?" | "The bot will lose access to Google Analytics tools. You can reconnect at any time." | "Cancel" | "Disconnect" |
| confirm.disconnectService.linear | "Disconnect Linear?" | "The bot will lose access to Linear tools. You can reconnect at any time." | "Cancel" | "Disconnect" |
| confirm.disconnectService.toggl | "Remove Toggl connection?" | "The bot will lose access to Toggl time tracking tools. You can reconnect at any time." | "Cancel" | "Remove" |
| confirm.suspendTenant | "Suspend {name}?" | "Suspending will immediately disconnect their bot and prevent login. Data is preserved." | "Cancel" | "Suspend tenant" |
| confirm.unsuspendTenant | "Unsuspend {name}?" | "This will restore the tenant's access. Their bot will reconnect automatically." | "Cancel" | "Unsuspend tenant" |

---

## 11. Empty States

### Dashboard — No Discord Connection

| Key | String |
|-----|--------|
| empty.dashboard.noDiscord.title | "No bot connected" |
| empty.dashboard.noDiscord.body | "You haven't connected a Discord bot yet. Add your bot token and server ID to get started." |
| empty.dashboard.noDiscord.cta | "Connect your bot" |

### Dashboard — No Activity

| Key | String |
|-----|--------|
| empty.dashboard.noActivity.title | "No activity yet" |
| empty.dashboard.noActivity.body | "Your bot's activity will appear here once it's connected and in use." |

### Integrations — No Services

| Key | String |
|-----|--------|
| empty.integrations.title | "No services connected" |
| empty.integrations.body | "Connect your first service to give the bot access to your tools." |

### Admin — No Tenants Found

| Key | String |
|-----|--------|
| empty.admin.tenants.title | "No tenants found" |
| empty.admin.tenants.body | "No tenants match your search and filter criteria." |

### Admin — No Audit Log Entries

| Key | String |
|-----|--------|
| empty.admin.auditLog.title | "No audit log entries" |
| empty.admin.auditLog.body | "No admin actions have been logged for this tenant." |

### Billing — No Subscription History

| Key | String |
|-----|--------|
| empty.billing.noHistory.title | "No billing history" |
| empty.billing.noHistory.body | "Your payment history will appear here once you subscribe to a paid plan." |

---

## 12. Error States

### Full-Page Error (data fetch failed)

| Key | String |
|-----|--------|
| error.fullPage.title | "Something went wrong" |
| error.fullPage.body | "We couldn't load this page. Please try refreshing." |
| error.fullPage.cta | "Refresh page" |

### Dashboard Load Error

| Key | String |
|-----|--------|
| error.dashboard.title | "Failed to load dashboard" |
| error.dashboard.body | "We couldn't load your workspace data. Please refresh the page." |
| error.dashboard.cta | "Refresh" |

### Integrations Load Error

| Key | String |
|-----|--------|
| error.integrations.title | "Failed to load integrations" |
| error.integrations.body | "We couldn't load your service connections. Please refresh the page." |
| error.integrations.cta | "Refresh" |

### Billing Load Error

| Key | String |
|-----|--------|
| error.billing.title | "Failed to load billing" |
| error.billing.body | "We couldn't load your billing information. Please refresh the page." |
| error.billing.cta | "Refresh" |

### Settings Load Error

| Key | String |
|-----|--------|
| error.settings.title | "Failed to load settings" |
| error.settings.body | "We couldn't load your settings. Please refresh the page." |
| error.settings.cta | "Refresh" |

### OAuth Callback Error Page (`/dashboard/integrations/callback?error=...`)

| Error type | Title | Body | CTA |
|-----------|-------|------|-----|
| `access_denied` | "Authorization cancelled" | "You cancelled the {service} authorization. No changes were made." | "Back to integrations" |
| `invalid_state` | "Authorization failed" | "The authorization request is invalid or expired. Please try again." | "Back to integrations" |
| `server_error` | "Connection failed" | "We encountered an error connecting to {service}. Please try again." | "Back to integrations" |
| Generic | "Connection failed" | "Something went wrong connecting to {service}. Please try again." | "Back to integrations" |

### 404 Page

| Key | String |
|-----|--------|
| notFound.title | "Page not found" |
| notFound.body | "The page you're looking for doesn't exist or has been moved." |
| notFound.cta | "Go to dashboard" |

### 500 Page

| Key | String |
|-----|--------|
| serverError.title | "Something went wrong" |
| serverError.body | "We encountered an unexpected error. Our team has been notified." |
| serverError.cta | "Go to dashboard" |
| serverError.support | "If this keeps happening, contact support@daimon.ai" |

---

## 13. Loading / Skeleton States

### Generic Loading Indicators

| Key | String |
|-----|--------|
| loading.default | "Loading…" |
| loading.dashboard | "Loading dashboard…" |
| loading.integrations | "Loading integrations…" |
| loading.billing | "Loading billing…" |
| loading.settings | "Loading settings…" |
| loading.admin | "Loading admin panel…" |

### Skeleton Screen ARIA Labels

| Screen | `aria-label` on skeleton container |
|--------|-------------------------------------|
| Dashboard home skeleton | "Loading dashboard content" |
| Bot status card skeleton | "Loading bot status" |
| Integrations grid skeleton | "Loading integrations" |
| Billing page skeleton | "Loading billing information" |
| Settings page skeleton | "Loading settings" |
| Admin tenant list skeleton | "Loading tenant list" |

### Inline Loading States

| Context | Text |
|---------|------|
| Validating Anthropic key | "Validating key…" |
| Validating OpenAI key | "Validating key…" |
| Validating Toggl key | "Validating key…" |
| Processing Stripe checkout | "Redirecting to checkout…" |
| Opening Customer Portal | "Opening billing portal…" |
| Disconnecting service | "Disconnecting…" |
| Connecting service | "Connecting…" |

---

## 14. Tooltips

All tooltips appear on hover with a 200ms delay. They use `title` attribute or a custom tooltip component (for truncated text).

| Element | Tooltip text |
|---------|-------------|
| Sidebar logout icon button | "Sign out" |
| Copy workspace ID button | "Copy to clipboard" |
| Copy bot username button | "Copy to clipboard" |
| Copy guild ID button | "Copy to clipboard" |
| API key hint display | "Only the last 4 characters are shown for security" |
| Plan badge | Current plan description (e.g., "Starter — 500 messages/day") |
| Stale heartbeat indicator | "Last heartbeat was {n} minutes ago — bot may be unresponsive" |
| Admin impersonate button | "View Daimon as this tenant" |
| Disabled action buttons (member role) | "Only the workspace owner can perform this action." |
| "Coming soon" service card | "This integration is coming soon" |
| Progress bar (onboarding) | "Step {n} of {total} complete" |

---

## 15. Form Validation Errors

See also [validation-rules.md](./validation-rules.md) for complete validation logic.

### Login Form

| Field | Rule | Error message |
|-------|------|---------------|
| Email | Empty on submit | "Email is required." |
| Email | Invalid format | "Please enter a valid email address." |
| Password | Empty on submit | "Password is required." |

### Signup Form

| Field | Rule | Error message |
|-------|------|---------------|
| Full name | Empty | "Full name is required." |
| Full name | < 2 chars | "Please enter your full name." |
| Full name | > 100 chars | "Full name must be 100 characters or less." |
| Workspace name | Empty | "Workspace name is required." |
| Workspace name | < 2 chars | "Workspace name must be at least 2 characters." |
| Workspace name | > 64 chars | "Workspace name must be 64 characters or less." |
| Email | Empty | "Email is required." |
| Email | Invalid format | "Please enter a valid email address." |
| Email | Already registered | "An account with this email already exists. Try signing in." |
| Password | Empty | "Password is required." |
| Password | < 8 chars | "Password must be at least 8 characters." |
| Confirm password | Empty | "Please confirm your password." |
| Confirm password | Doesn't match | "Passwords do not match." |

### Reset Password Form

| Field | Rule | Error message |
|-------|------|---------------|
| Email | Empty | "Email is required." |
| Email | Invalid format | "Please enter a valid email address." |

### Reset Password Confirm Form

| Field | Rule | Error message |
|-------|------|---------------|
| New password | Empty | "Password is required." |
| New password | < 8 chars | "Password must be at least 8 characters." |
| Confirm password | Empty | "Please confirm your password." |
| Confirm password | Doesn't match | "Passwords do not match." |

### Workspace Name Form (Settings)

| Field | Rule | Error message |
|-------|------|---------------|
| Name | Empty | "Workspace name is required." |
| Name | < 2 chars | "Workspace name must be at least 2 characters." |
| Name | > 64 chars | "Workspace name must be 64 characters or less." |

### Discord Connection Form

| Field | Rule | Error message |
|-------|------|---------------|
| Bot token | Empty | "Bot token is required." |
| Bot token | Invalid format (not Base64ID.Timestamp.HMAC) | "Invalid bot token format. Discord tokens follow the pattern: Base64ID.Timestamp.HMAC." |
| Bot token | Too short (< 50 chars) | "This doesn't look like a valid Discord bot token." |
| Guild ID | Empty | "Server ID is required." |
| Guild ID | Non-numeric | "Server ID must be a number." |
| Guild ID | Wrong length (not 17–20 digits) | "Invalid server ID. Guild IDs are 17–20 digit numbers." |

### Anthropic API Key Form

| Field | Rule | Error message |
|-------|------|---------------|
| API key | Empty | "API key is required." |
| API key | Wrong prefix (not `sk-ant-`) | "Anthropic keys start with 'sk-ant-'. Please check and try again." |
| API key | API validation fails | "Invalid API key. Please check the key and try again." |

### OpenAI API Key Form

| Field | Rule | Error message |
|-------|------|---------------|
| API key | Empty | "API key is required." |
| API key | Wrong prefix (not `sk-`) | "OpenAI keys start with 'sk-'. Please check and try again." |
| API key | API validation fails | "Invalid API key. Please check the key and try again." |

### Toggl API Key Form

| Field | Rule | Error message |
|-------|------|---------------|
| API key | Empty | "API key is required." |
| API key | Wrong length (< 10 chars) | "This doesn't look like a valid Toggl API key." |
| API key | API validation fails | "Invalid API key. Please check and try again." |

### Account Settings — Display Name

| Field | Rule | Error message |
|-------|------|---------------|
| Display name | Empty | "Display name is required." |
| Display name | > 100 chars | "Display name must be 100 characters or less." |

### Account Settings — Change Password

| Field | Rule | Error message |
|-------|------|---------------|
| Current password | Empty | "Current password is required." |
| Current password | Incorrect | "Current password is incorrect." |
| New password | Empty | "New password is required." |
| New password | < 8 chars | "Password must be at least 8 characters." |
| Confirm password | Empty | "Please confirm your new password." |
| Confirm password | Doesn't match | "Passwords do not match." |

### Delete Workspace Confirmation

| Field | Rule | Error message |
|-------|------|---------------|
| Confirmation input | Empty | "Please type the workspace name to confirm." |
| Confirmation input | Doesn't match | "Workspace name doesn't match. Please type it exactly." |

---

## 16. Page Titles (HTML `<title>`)

All page titles follow the format: `{Page Name} — Daimon`

| Route | `<title>` |
|-------|-----------|
| `/` | "Daimon — Your AI bot, your keys, your Discord." |
| `/login` | "Sign in — Daimon" |
| `/signup` | "Create your account — Daimon" |
| `/reset-password` | "Reset your password — Daimon" |
| `/reset-password/confirm` | "Set new password — Daimon" |
| `/confirm` | "Confirm your email — Daimon" |
| `/dashboard` | "Dashboard — Daimon" |
| `/dashboard/integrations` | "Integrations — Daimon" |
| `/dashboard/billing` | "Billing — Daimon" |
| `/dashboard/settings` | "Settings — Daimon" |
| `/admin` | "Admin — Daimon" |
| `/admin/tenants/[id]` | "{Tenant Name} — Admin — Daimon" |
| `/docs` | "Documentation — Daimon" |
| `/docs/quick-start` | "Quick Start — Daimon Docs" |
| `/docs/tools` | "Tool Reference — Daimon Docs" |
| `/docs/faq` | "FAQ — Daimon Docs" |
| `/docs/billing` | "Billing & Plans — Daimon Docs" |
| `/terms` | "Terms of Service — Daimon" |
| `/privacy` | "Privacy Policy — Daimon" |
| `404` | "Page not found — Daimon" |
| `500` | "Server error — Daimon" |

---

## 17. Meta Descriptions

All meta descriptions are ≤ 160 characters.

| Route | Meta description |
|-------|-----------------|
| `/` | "Daimon gives your Discord server a Claude-powered AI assistant. Bring your own API key. 50+ tools. No code required. Start free." |
| `/login` | "Sign in to your Daimon workspace." |
| `/signup` | "Create your Daimon account. Free to start — no credit card required." |
| `/docs` | "Daimon documentation. Quick start guide, tool reference, FAQ, and billing docs." |
| `/docs/quick-start` | "Get your Daimon bot online in minutes. Step-by-step setup guide from signup to live bot." |
| `/docs/tools` | "Complete reference for all 50+ tools available in Daimon — Discord, GitHub, Linear, Toggl, and more." |
| `/docs/faq` | "Frequently asked questions about Daimon — billing, security, bot setup, and troubleshooting." |
| `/terms` | "Daimon Terms of Service." |
| `/privacy` | "Daimon Privacy Policy." |

---

*End of copy inventory. Cross-reference [validation-rules.md](./validation-rules.md) for complete form logic. Cross-reference individual page specs for layout context.*

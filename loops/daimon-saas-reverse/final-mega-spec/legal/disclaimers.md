# Legal Disclaimers — Daimon Platform

> Aspect: 8.2.4
> Written: 2026-03-13
> Related: [terms-of-service.md](./terms-of-service.md), [privacy-policy.md](./privacy-policy.md), [../premium/tiers.md](../premium/tiers.md)

---

> **Implementation note for forward loop**: These disclaimers appear inline on pages where specific risks arise (see Placement section below). They also form the basis of the limitation of liability clauses in the Terms of Service. The entity name "PyMC Technologies, Inc." and "daimon.ai" should be verified before launch.

---

## 1. BYOK (Bring Your Own Keys) Disclaimer

**Short form** (shown on Billing page, API Key input modals, and signup flow):

> **Your keys, your costs.** By providing an Anthropic API key, you authorize Daimon to use it to power your bot. All AI inference costs are billed directly to your Anthropic account. Daimon is not affiliated with Anthropic, PBC and does not guarantee the availability, pricing, or uptime of Anthropic's services. Your platform fee to Daimon is separate from — and not a substitute for — your Anthropic API charges.

**Long form** (shown on `/legal/disclaimers` page and referenced from Terms of Service §5):

> **Bring Your Own Key (BYOK) Usage Disclaimer**
>
> The Daimon platform operates on a Bring Your Own Key model for AI inference. By providing credentials to the Service, you acknowledge and agree to the following:
>
> **1. Your API credentials are your responsibility.** You are solely responsible for the Anthropic API key, OpenAI API key (if provided), Discord bot token, and any other credentials you submit to the Service. You must ensure you have the right to use these credentials and that their use complies with the respective providers' terms of service.
>
> **2. AI inference costs are not included in the Platform Fee.** The Platform Fee paid to Daimon covers access to the Service infrastructure, hosting of your bot process, and the dashboard features described in your Plan. It does NOT include the cost of Claude API calls, OpenAI API calls, or any other AI inference charges. Those costs are billed directly from the respective AI provider to your account under their pricing and billing terms.
>
> **3. Daimon is not affiliated with Anthropic, PBC.** Daimon is an independent software platform that uses the Claude API as one available AI provider. "Claude," "Anthropic," and related marks are trademarks of Anthropic, PBC. Daimon makes no representations on behalf of Anthropic regarding uptime, pricing changes, API deprecations, or service availability.
>
> **4. You bear the risk of API key compromise.** If your API key is compromised — whether through your own systems or through a breach of the Service — Daimon's liability is limited as described in §6 of the Terms of Service. You should monitor your Anthropic account for unexpected usage and rotate your API key immediately if you suspect compromise.
>
> **5. Usage limits and rate limits are set by the provider.** Daimon does not guarantee that your bot will respond to every message. Response failures may occur due to Anthropic API rate limits, quota exhaustion, model unavailability, or network issues. These are outside Daimon's control.

---

## 2. Discord Bot Disclaimer

**Short form** (shown on Discord Connection setup modal and Integrations page):

> **You are responsible for your Discord bot.** By connecting a Discord bot token to Daimon, you represent that you own or are authorized to use that bot and that its operation complies with Discord's Terms of Service and Developer Policy. Daimon operates the bot on your behalf but you remain the bot application owner in Discord's systems.

**Long form** (shown on `/legal/disclaimers` page):

> **Discord Bot Operation Disclaimer**
>
> By providing a Discord bot token to the Service, you acknowledge and agree to the following:
>
> **1. You own the Discord application.** The bot token you provide must belong to a Discord application created by you in the Discord Developer Portal. You represent that you are the authorized owner of or have been granted permission to use that application.
>
> **2. You are responsible for compliance with Discord's policies.** Operating a bot on Discord requires compliance with Discord's Terms of Service, Developer Policy, and Community Guidelines. Daimon operates the bot infrastructure on your behalf, but you are the application owner and remain responsible for ensuring the bot's behavior complies with Discord's requirements, including — without limitation — properly configuring required intents (Message Content Intent) and complying with Discord's rate limits and API usage policies.
>
> **3. Daimon is not affiliated with Discord, Inc.** Discord is a trademark of Discord Inc. Daimon is an independent platform that uses the Discord API. Daimon makes no representations on behalf of Discord regarding API availability, changes to Discord's developer policies, or API deprecations.
>
> **4. Bot token security.** You are responsible for ensuring your bot token remains confidential prior to submitting it to Daimon. Daimon encrypts bot tokens at rest using AES-256 encryption via Supabase Vault. Daimon will not knowingly share your bot token with any third party except as required to operate the Discord bot (i.e., authenticating with the Discord Gateway). If you believe your bot token has been compromised, you should immediately regenerate it in the Discord Developer Portal and update it in your Daimon dashboard.
>
> **5. Guild (server) administrator responsibility.** You represent that you have the necessary permissions in the Discord server (Guild) you connect — either as the server owner or as an administrator with permissions to add bots. Daimon is not responsible for actions taken by your bot in servers where you do not have such authority.
>
> **6. Bot behavior is AI-generated.** Bot responses are generated by Claude AI (Anthropic) and may occasionally produce inaccurate, incomplete, offensive, or otherwise undesirable outputs. You acknowledge that AI-generated responses are probabilistic and not guaranteed to be correct. You are responsible for monitoring your bot's behavior in your Discord server and for any consequences arising from AI-generated content your bot produces.

---

## 3. Third-Party Service Integration Disclaimer

**Short form** (shown on Integrations page above the service grid):

> **Third-party integrations are provided as-is.** Daimon connects to services like GitHub, Google, Linear, and Toggl using your credentials. We are not affiliated with these services and cannot guarantee their availability. Service outages, API changes, or revocation of your access tokens may disable specific integrations without notice.

**Long form** (shown on `/legal/disclaimers` page):

> **Third-Party Integration Disclaimer**
>
> The Service enables connections to various Third-Party Services including, without limitation: GitHub (GitHub, Inc.), Google Workspace including Gmail, Google Calendar, Google Drive, and Google Docs (Google LLC), Linear (Linear Orbit, Inc.), Toggl (Toggl OÜ), Notion (Notion Labs, Inc.), Slack (Salesforce, Inc.), OpenAI (OpenAI, L.L.C.), and others that may be added over time.
>
> **1. No affiliation with third-party providers.** Daimon is not affiliated with, endorsed by, or sponsored by any of the Third-Party Services listed above or their parent companies. All trademarks belong to their respective owners.
>
> **2. Third-party terms govern your use of their services.** Connecting a Third-Party Service through Daimon does not modify your agreement with that provider. You remain subject to their terms of service, privacy policy, and acceptable use policies. Daimon cannot grant you rights to use any Third-Party Service beyond what those providers authorize.
>
> **3. Credential security for third-party services.** OAuth tokens and API keys for Third-Party Services are stored encrypted in the Service database. You are responsible for the scope of access you authorize. Daimon will only use your credentials for the purpose of executing tools on your behalf in response to requests in your Discord server.
>
> **4. Service availability.** Daimon cannot guarantee the availability of Third-Party Services. If a Third-Party Service is unavailable, changes its API, revokes your OAuth token, or otherwise becomes inaccessible, the corresponding tools in your bot will fail until the issue is resolved. Daimon will attempt to surface these errors in your dashboard but bears no liability for Third-Party Service outages.
>
> **5. Data processing by third parties.** When your bot executes a tool that calls a Third-Party Service, your request data (including the content of the Discord message that triggered the action) may be transmitted to that Third-Party Service. You are responsible for ensuring that your bot's use of Third-Party Services complies with applicable data protection laws, including any restrictions on transmitting personal data.
>
> **6. OAuth token refresh and expiry.** Some OAuth tokens expire and require refresh. Daimon will attempt to refresh tokens automatically. If token refresh fails (e.g., because you revoked access in the Third-Party Service's settings), the affected integration will stop working. Daimon will surface the error in your dashboard.

---

## 4. AI-Generated Content Disclaimer

**Short form** (shown in the bot's first message in any new Discord server and in Docs → FAQ):

> **Daimon's AI responses may be inaccurate.** The bot uses Claude AI to generate responses and execute actions. AI-generated content can be incorrect, outdated, or misleading. Do not rely on bot responses for medical, legal, financial, or safety-critical decisions. Always verify important information from primary sources.

**Long form** (shown on `/legal/disclaimers` page):

> **AI-Generated Content Disclaimer**
>
> The bot powered by the Daimon Service generates responses using large language models (currently Claude, developed by Anthropic, PBC). You acknowledge and agree to the following:
>
> **1. AI responses are not professional advice.** Bot responses do not constitute legal, medical, financial, tax, psychological, or other professional advice. Do not rely on bot responses for professional decisions. Always consult a qualified professional.
>
> **2. AI responses may be inaccurate.** Large language models generate probabilistic outputs that can contain errors, hallucinations, outdated information, or logical inconsistencies. Daimon makes no warranty regarding the accuracy, completeness, or reliability of AI-generated responses.
>
> **3. AI tool execution carries risk.** When the bot executes tools — such as creating GitHub issues, modifying Linear tickets, sending emails, or updating calendar events — those actions may have real-world consequences that are difficult or impossible to reverse. You are responsible for any consequences arising from actions taken by your bot at your request or on your behalf.
>
> **4. You are responsible for supervising the bot.** As the owner of the Discord server and the Daimon account, you are responsible for the actions your bot takes in your server. If the bot produces harmful, offensive, or otherwise undesirable outputs, you should disable it immediately and contact support.
>
> **5. Content moderation.** Daimon does not monitor the content of Discord messages processed by your bot. You are solely responsible for ensuring that the use of the bot in your Discord server complies with applicable laws and does not involve processing of prohibited content.

---

## 5. Service Availability (Uptime) Disclaimer

**Short form** (shown in footer of dashboard pages and billing page):

> **No uptime guarantee.** Daimon is provided "as-is" without any uptime SLA on the Free or Starter plans. Pro plan includes commercially reasonable efforts to maintain uptime. Planned maintenance windows will be announced at status.daimon.ai.

**Long form** (shown on `/legal/disclaimers` page):

> **Service Availability Disclaimer**
>
> **1. No uptime SLA for Free and Starter plans.** The Service is provided on a best-effort basis for Free and Starter plan subscribers. Daimon does not guarantee any specific uptime percentage for these plans.
>
> **2. Commercially reasonable efforts for Pro plans.** For Pro plan subscribers, Daimon will use commercially reasonable efforts to maintain service availability, but does not warrant a specific uptime percentage. This does not constitute a service level agreement (SLA).
>
> **3. Maintenance windows.** Daimon may perform planned maintenance that results in temporary service unavailability. We will endeavor to provide advance notice of planned maintenance at status.daimon.ai and via email when maintenance is expected to exceed 30 minutes.
>
> **4. External dependencies.** The Service depends on third-party infrastructure providers including Supabase, Vercel, Fly.io, and others. Outages of these providers may result in Service unavailability. Daimon is not liable for outages caused by its infrastructure providers.
>
> **5. Bot process uptime.** Individual bot processes (Discord connections) may disconnect due to Discord API issues, network interruptions, or infrastructure restarts. Daimon's health monitoring detects disconnections and attempts automatic reconnection with exponential backoff (up to 10 attempts over approximately 25 minutes). If reconnection fails, the bot will remain offline until the issue is resolved manually or automatically on the next health check cycle (60-second intervals).

---

## 6. Limitation of Liability — Summary

> **This section summarizes the liability limits in the Terms of Service (§12). The full text is in [terms-of-service.md](./terms-of-service.md).**

**Dollar cap on liability:**

| Plan | Maximum Aggregate Liability |
|------|----------------------------|
| Free | $0 (Service provided free of charge, no liability) |
| Starter | Amount paid to Daimon in the 3 months preceding the claim |
| Pro | Amount paid to Daimon in the 3 months preceding the claim |

**Exclusions from liability (Daimon is never liable for):**

1. **AI inference costs** — Anthropic or OpenAI API charges incurred under your account
2. **Third-party service outages** — Unavailability of GitHub, Google, Linear, Toggl, Discord, or other integrated services
3. **Credential compromise resulting from your negligence** — Sharing credentials, using weak passwords, storing tokens insecurely outside the Service
4. **Actions taken by your bot** — All consequences of AI-generated responses and tool executions in your Discord server
5. **Discord policy violations** — Suspension of your Discord application or bot by Discord for violations of Discord's policies
6. **Indirect, incidental, special, or consequential damages** — Lost profits, lost data (beyond what can be recovered from our 30-day backups), business interruption, reputational harm
7. **Force majeure events** — Outages caused by events beyond Daimon's reasonable control including natural disasters, government actions, cyberattacks on infrastructure providers, and major internet disruptions

---

## 7. Data Retention and Deletion Disclaimer

**Short form** (shown on Settings page → Danger Zone section):

> **Account deletion is permanent.** Deleting your account will permanently delete all tenant configuration, connected credentials, and stored tool context. Bot activity logs (messages and tool calls) are retained for 30 days after deletion for fraud prevention, then permanently deleted. This action cannot be undone.

**Long form** (shown on `/legal/disclaimers` page):

> **Data Retention Disclaimer**
>
> **1. What is retained after account deletion.** Following account deletion, Daimon retains: (a) billing records required for tax and accounting purposes (typically 7 years); (b) redacted audit logs sufficient to detect and investigate fraud (30 days); (c) anonymized usage statistics. All personally identifiable information is deleted within 30 days of account deletion.
>
> **2. What is immediately deleted upon account deletion.** Daimon will immediately delete or schedule for deletion: all credentials (bot tokens, API keys, OAuth tokens) using hard-delete; all tenant configuration data; all Discord connection records; all service connections.
>
> **3. Backup retention.** Supabase point-in-time recovery backups may retain data for up to 7 days after deletion. These backups are not accessible to users and are overwritten as new backup cycles complete.
>
> **4. Discord message data.** Daimon stores metadata about bot activity (tool calls, message IDs, timestamps) in its database for the purpose of analytics and debugging. Daimon does NOT store the full content of Discord messages beyond the in-flight processing window required to generate a bot response. Message content is not persisted in the Daimon database after a response is generated.

---

## 8. No Warranty Disclaimer

> **THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND FREEDOM FROM DEFECTS OR ERRORS. DAIMON DOES NOT WARRANT THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT THE RESULTS OBTAINED FROM USING THE SERVICE WILL BE ACCURATE OR RELIABLE. YOU USE THE SERVICE AT YOUR OWN RISK.**

---

## 9. Indemnification Notice

> **You agree to indemnify Daimon.** By using the Service, you agree to indemnify, defend, and hold harmless PyMC Technologies, Inc. and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from: (a) your use of the Service; (b) actions taken by your bot in your Discord server; (c) your violation of these Terms; (d) your violation of any applicable law or the rights of any third party; or (e) your AI-generated content.

---

## 10. Page Placement of Disclaimers

| Disclaimer | Pages Where It Appears |
|-----------|----------------------|
| BYOK short form | Billing page (API Keys card), Billing page (checkout), Signup flow (Step 3) |
| BYOK long form | `/legal/disclaimers#byok` |
| Discord bot short form | Integrations page (Discord card), Discord connection setup modal |
| Discord bot long form | `/legal/disclaimers#discord` |
| Third-party integration short form | Integrations page (above service grid) |
| Third-party integration long form | `/legal/disclaimers#integrations` |
| AI content short form | Docs → FAQ, bot first-message (Discord) |
| AI content long form | `/legal/disclaimers#ai-content` |
| Service availability short form | Dashboard footer, Billing page |
| Service availability long form | `/legal/disclaimers#uptime` |
| Liability cap table | Billing page (below plan cards) |
| No warranty notice | `/legal/disclaimers#warranty`, ToS §12 |
| Data deletion notice | Settings page → Danger Zone |
| Data retention long form | `/legal/disclaimers#data-retention` |
| Indemnification notice | ToS §13 |

---

## 11. `/legal/disclaimers` Page Specification

**Route**: `/legal/disclaimers`
**Layout**: Public, no auth required
**Title**: `Daimon — Platform Disclaimers`
**Meta description**: `Legal disclaimers for the Daimon platform including BYOK, AI content, Discord bot operation, third-party integrations, and service availability.`

**Page structure:**
```
<main>
  <section> (max-w-3xl mx-auto px-8 py-24)
    <h1> "Platform Disclaimers"
    <p> Last updated: [INSERT LAUNCH DATE]
    <p> "These disclaimers supplement our [Terms of Service](/legal/terms) and [Privacy Policy](/legal/privacy). If there is a conflict between these disclaimers and the Terms of Service, the Terms of Service control."
    <nav> (table of contents with anchor links to each section)
    <section id="byok"> §1 BYOK — long form
    <section id="discord"> §2 Discord Bot — long form
    <section id="integrations"> §3 Third-Party Integrations — long form
    <section id="ai-content"> §4 AI-Generated Content — long form
    <section id="uptime"> §5 Service Availability — long form
    <section id="liability"> §6 Limitation of Liability Summary
    <section id="data-retention"> §7 Data Retention — long form
    <section id="warranty"> §8 No Warranty — full text
    <section id="indemnification"> §9 Indemnification Notice
```

**Typography**: Inter body, Archivo headings, navy text, white background.
**Section headings**: H2, Archivo Semi-Expanded wdth:112.5, 28px, navy.
**Body text**: Inter, 16px, navy at 80%, line-height 1.7, max-width 65ch.
**Section spacing**: 64px between sections.
**Internal anchor links**: `<a href="#byok">` etc. in table of contents.

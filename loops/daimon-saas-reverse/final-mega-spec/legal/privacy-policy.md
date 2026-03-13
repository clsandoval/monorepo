# Privacy Policy — Daimon

> Aspect: 6.4b
> Written: 2026-03-13
> Related: [terms-of-service.md](./terms-of-service.md), [disclaimers.md](./disclaimers.md), [../database/vault-encryption.md](../database/vault-encryption.md), [../database/retention.md](../database/retention.md)

---

> **Implementation note for forward loop**: The legal entity name is "PyMC Technologies, Inc." — verify registered entity name before publishing. The effective date must be set to the actual launch date. The governing jurisdiction is Delaware, USA — update if incorporated elsewhere. The Data Protection Officer (DPO) contact must be a real, monitored email address. GDPR Article 30 record of processing activities (ROPA) must be maintained internally even if not published. If the platform is expected to have EU users at launch, a GDPR-compliant Data Processing Agreement (DPA) template should be prepared and linked from the Privacy Policy.

---

# DAIMON PRIVACY POLICY

**Effective Date:** [INSERT LAUNCH DATE]
**Last Updated:** [INSERT LAUNCH DATE]

---

## INTRODUCTION

PyMC Technologies, Inc. ("Company," "Daimon," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use the Daimon platform, including the website at daimon.bot (and any subdomains), the web application dashboard, the Discord bot service, and all related services (collectively, the "Service").

**This Privacy Policy is incorporated by reference into our Terms of Service.** By creating an Account or using the Service, you agree to this Privacy Policy.

If you do not agree with this Privacy Policy, do not create an Account or use the Service.

**For users in the European Economic Area (EEA), United Kingdom, and Switzerland**: PyMC Technologies, Inc. is the data controller for your personal data as described in this Privacy Policy. Your additional rights under the GDPR and UK GDPR are described in Section 13.

---

## TABLE OF CONTENTS

1. [Information We Collect](#1-information-we-collect)
2. [How We Use Your Information](#2-how-we-use-your-information)
3. [How We Share Your Information](#3-how-we-share-your-information)
4. [Credentials and Sensitive Data — Special Handling](#4-credentials-and-sensitive-data--special-handling)
5. [Discord and Bot Message Data](#5-discord-and-bot-message-data)
6. [Cookies and Tracking Technologies](#6-cookies-and-tracking-technologies)
7. [Data Retention](#7-data-retention)
8. [Data Security](#8-data-security)
9. [International Data Transfers](#9-international-data-transfers)
10. [Children's Privacy](#10-childrens-privacy)
11. [Third-Party Services and Links](#11-third-party-services-and-links)
12. [Your Rights and Choices](#12-your-rights-and-choices)
13. [EEA, UK, and Swiss User Rights (GDPR / UK GDPR)](#13-eea-uk-and-swiss-user-rights-gdpr--uk-gdpr)
14. [California Consumer Privacy Rights (CCPA / CPRA)](#14-california-consumer-privacy-rights-ccpa--cpra)
15. [Changes to This Privacy Policy](#15-changes-to-this-privacy-policy)
16. [Contact Us](#16-contact-us)

---

## 1. INFORMATION WE COLLECT

We collect information you provide directly, information collected automatically, and information from third parties.

### 1.1 Information You Provide Directly

**Account Registration Data**
- Email address (required at signup)
- Password (stored as a cryptographic hash; we never store your plaintext password)
- Full name (optional, provided via dashboard profile settings)

**Tenant Configuration Data**
- Tenant/workspace name
- Discord Guild ID (the numeric ID of your Discord server)
- Discord Bot Token (see Section 4 — encrypted, special handling)
- Anthropic API Key (see Section 4 — encrypted, special handling)
- OpenAI API Key, if provided (see Section 4 — encrypted, special handling)
- Third-party service API keys for Integrations (Toggl, etc.) (see Section 4 — encrypted, special handling)
- OAuth tokens for Integrations (GitHub, Google, Linear) (see Section 4 — encrypted, special handling)

**Billing Data**
- Payment card information — note: we do NOT store full card numbers, expiry dates, or CVVs. All payment card data is processed directly by Stripe, Inc. and stored in Stripe's systems. We receive and store a Stripe Customer ID, Stripe Subscription ID, Stripe Payment Method ID (a token that does not contain sensitive card data), and billing status from Stripe.
- Billing name and billing email address (used for Stripe Customer creation)
- Billing address (country, postal code) — collected by Stripe at checkout for tax calculation

**Communications**
- Email address and message content when you contact us for support or other inquiries
- Information you provide in bug reports, feature requests, or feedback forms

**Profile and Preferences**
- Timezone preference (optional)
- Notification preferences (email opt-in/out settings)

### 1.2 Information Collected Automatically

**Log Data and Telemetry**
- IP address (collected for security and fraud prevention; see retention period in Section 7)
- Browser type and version
- Operating system
- HTTP request headers (User-Agent, Referer, Accept-Language)
- Pages visited within the Service and timestamps
- Actions performed within the dashboard (e.g., connecting an Integration, submitting a form) — logged for security audit purposes; see Section 4.9 (audit log)
- Error messages and stack traces (for bug diagnosis)

**Bot Operational Data**
- Bot connection status per tenant (connected, disconnected, error state)
- Timestamp of last heartbeat received from your Bot instance
- Number of messages processed per day (aggregate count only, not content)
- Tool invocation counts per integration type per day (aggregate counts only)
- API call error rates and latencies per tenant (aggregate metrics, no message content)

**Cookies and Local Storage**
- Session tokens (authentication cookies — see Section 6)
- CSRF tokens
- Preferences stored in local storage (e.g., dashboard sidebar collapsed state)

### 1.3 Information from Third Parties

**Supabase Authentication Provider**
- When you sign up or log in, Supabase Auth manages authentication. Supabase may log authentication events (login, logout, password reset) on our behalf.

**Stripe**
- When you purchase a subscription, Stripe provides us with subscription status, plan information, billing cycle dates, invoice history, and payment failure events. Stripe may also share fraud signals.

**OAuth Providers (GitHub, Google, Linear)**
- When you connect an Integration using OAuth, the provider shares with us: your user ID at that provider, your username/display name, your email address (if within the requested scopes), and the OAuth access token and refresh token. We use these solely to enable the Integration.
- **GitHub OAuth**: We receive your GitHub user ID, username, email (if public or granted), and access token. Scopes requested: `repo` (to read and create issues, PRs, and repositories on your behalf), `user:email` (to read your primary email).
- **Google OAuth**: We receive your Google user ID, display name, email address, and access token. Scopes requested: `https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/userinfo.profile`, plus any Google service-specific scopes required by the tools you use.
- **Linear OAuth**: We receive your Linear user ID, display name, email address, and access token. Scopes requested: `read`, `write`, `issues:create`, `comments:create`.

---

## 2. HOW WE USE YOUR INFORMATION

We use the information we collect for the following purposes, each with its legal basis:

### 2.1 Providing and Operating the Service

| Purpose | Data Used | Legal Basis |
|---------|-----------|-------------|
| Creating and managing your Account | Email, password hash, name | Contract performance |
| Running your Bot instance | Bot Token, Guild ID, Anthropic API Key | Contract performance |
| Processing Discord messages through your Bot's AI capabilities | Anthropic API Key (used in transit to Anthropic's API), message context held in runtime memory | Contract performance |
| Enabling Integrations | OAuth tokens, API keys | Contract performance |
| Managing your subscription | Stripe IDs, plan status | Contract performance |
| Sending billing receipts and invoices | Email, billing details | Contract performance / Legal obligation |
| Providing customer support | Email, support message content | Contract performance / Legitimate interests |

### 2.2 Security and Fraud Prevention

| Purpose | Data Used | Legal Basis |
|---------|-----------|-------------|
| Detecting and preventing unauthorized access | IP address, login events, request logs | Legitimate interests |
| Verifying identity for account recovery | Email, IP address, session metadata | Legitimate interests / Contract performance |
| Rate limiting and abuse prevention | IP address, request patterns | Legitimate interests |
| Maintaining audit logs for compliance | User actions, timestamps | Legal obligation / Legitimate interests |
| Security incident investigation | Log data, request metadata | Legal obligation / Legitimate interests |

### 2.3 Service Improvement and Analytics

| Purpose | Data Used | Legal Basis |
|---------|-----------|-------------|
| Understanding usage patterns to improve the Service | Aggregate, anonymized usage metrics (never individual message content) | Legitimate interests |
| Diagnosing bugs and errors | Error logs, stack traces | Legitimate interests |
| Improving Bot operational reliability | Aggregate connection status, error rates | Legitimate interests |
| A/B testing UI improvements | Aggregate page interaction data | Legitimate interests |

### 2.4 Communications

| Purpose | Data Used | Legal Basis |
|---------|-----------|-------------|
| Sending transactional emails (account confirmation, password reset, invoice) | Email | Contract performance |
| Sending service notifications (downtime, security alerts, policy changes) | Email | Legitimate interests / Legal obligation |
| Sending product update emails | Email | Consent (you may opt out at any time) |
| Responding to support requests | Email, support message content | Contract performance |

### 2.5 Legal Compliance

| Purpose | Data Used | Legal Basis |
|---------|-----------|-------------|
| Complying with applicable laws and regulations | As required by specific legal obligation | Legal obligation |
| Responding to lawful government requests, subpoenas, or court orders | As required | Legal obligation |
| Enforcing our Terms of Service | Account data, usage logs | Legitimate interests |
| Resolving disputes | Account data, billing records | Legitimate interests / Legal obligation |

### 2.6 What We Do NOT Do with Your Data

- We do **not** sell your personal information to third parties.
- We do **not** use your Discord message content to train AI models.
- We do **not** read your Discord messages except as required to operate the Bot (the message content passes through our infrastructure in-transit to Anthropic's API but is not stored).
- We do **not** share your Credentials (API keys, tokens) with any party except as strictly necessary to operate the Service on your behalf (e.g., your Anthropic API Key is transmitted to Anthropic's API endpoints when making inference requests).
- We do **not** use your data for advertising targeting.
- We do **not** share your data with data brokers.

---

## 3. HOW WE SHARE YOUR INFORMATION

We share personal information only in the limited circumstances described below.

### 3.1 Service Providers (Sub-Processors)

We use trusted third-party companies that process data on our behalf to operate the Service. Each sub-processor is bound by data processing agreements and is permitted to use your data only as directed by us.

| Sub-Processor | Purpose | Data Shared | Location |
|--------------|---------|-------------|----------|
| **Supabase, Inc.** | Database, authentication, file storage, Realtime infrastructure | All data in our database (email, tenant config, encrypted credentials, subscription status, audit logs, operational metrics) | United States (AWS us-east-1); EU-hosted option available on request |
| **Stripe, Inc.** | Payment processing and subscription management | Billing email, billing name, billing address, subscription plan | United States |
| **Vercel, Inc.** | Web application hosting (Next.js frontend and API routes) | HTTP request data, IP address, session tokens | United States (AWS us-east-1 / global edge) |
| **Fly.io, Inc.** | Bot process hosting | Bot operational data (connection status, logs) | United States (or region selected at deployment) |
| **Anthropic, PBC** | AI inference (Claude API) | Discord message content passed in-transit using your Anthropic API Key; no persistent storage by us | United States |
| **Sentry, Inc.** (optional) | Error tracking and crash reporting | Error messages, stack traces, anonymized user ID, IP address | United States |
| **Langfuse GmbH** (optional) | LLM observability and tracing | Prompts and responses (anonymized/truncated); configured to minimize PII | Germany (EU) |
| **Postmark / Resend** (TBD — select one at implementation) | Transactional email delivery | Email address, email content | United States |

**Note for forward loop**: Choose one transactional email provider at implementation time (Postmark or Resend) and update this table with the selected provider's name. The sub-processor list must be kept current; any new sub-processors must be added with 30 days' notice to users with GDPR rights.

### 3.2 OAuth Integration Providers

When you connect an Integration, you authorize us to exchange data with that provider (GitHub, Google, Linear) on your behalf. The data exchange is limited to what is necessary for the Integration. We do not share your data with these providers beyond what is required to authenticate and use the Integration.

### 3.3 Discord, Inc.

Your Bot Token is used to make API calls to Discord's API on your behalf. Discord receives API requests authenticated with your Bot Token. Discord's handling of data is governed by Discord's Privacy Policy (discord.com/privacy). We are not responsible for Discord's data practices.

### 3.4 Business Transfers

If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of all or a portion of our assets, your personal information may be transferred as part of that transaction. We will notify you via email and a prominent notice on the Service at least 30 days before your personal information becomes subject to a different Privacy Policy as a result of such a transaction.

### 3.5 Legal Requirements and Safety

We may disclose your information if we believe in good faith that disclosure is necessary to:
- (a) comply with a legal obligation, court order, or valid legal process (e.g., subpoena, search warrant);
- (b) protect and defend the rights or property of the Company;
- (c) prevent or investigate possible wrongdoing in connection with the Service;
- (d) protect the safety of you, other users, or the public;
- (e) protect against legal liability.

Where legally permitted, we will attempt to notify you before complying with such a request.

### 3.6 Aggregated and Anonymized Data

We may share aggregated, anonymized, or de-identified information that cannot reasonably be used to identify you, for purposes such as analytics, industry research, or marketing. This data is not personal information.

---

## 4. CREDENTIALS AND SENSITIVE DATA — SPECIAL HANDLING

This section describes our special handling of the most sensitive categories of data you entrust to us.

### 4.1 What We Consider Credentials

The following data categories receive enhanced protection beyond standard personal data:

| Credential Type | How Provided | Required/Optional |
|----------------|-------------|-------------------|
| Discord Bot Token | Pasted into dashboard Settings | Required for Bot operation |
| Anthropic API Key | Pasted into dashboard Billing/Settings | Required for AI features |
| OpenAI API Key | Pasted into dashboard Settings | Optional (classification enhancement) |
| GitHub OAuth access token + refresh token | Set by OAuth callback | Optional (GitHub Integration) |
| Google OAuth access token + refresh token | Set by OAuth callback | Optional (Google Integration) |
| Linear OAuth access token + refresh token | Set by OAuth callback | Optional (Linear Integration) |
| Toggl API key | Pasted into Integrations page | Optional (Toggl Integration) |
| Any other third-party API key | Pasted into Integrations page | Optional |

### 4.2 Encryption at Rest

All Credentials listed above are encrypted at rest using **Supabase Vault**, which uses **AES-256-GCM** symmetric encryption. The encryption keys are managed by Supabase's key management system and are not stored in the same database as the encrypted values. Credentials are never stored in plaintext in any database column, log file, error report, or application cache.

**What this means technically**:
- The raw credential value you paste is immediately encrypted before being written to the database.
- The column in the database stores a Vault secret ID (a UUID reference), not the raw value.
- To decrypt, the application calls the Supabase Vault `vault.decrypted_secrets` view, which requires server-side database access with the service role key.
- The service role key is stored as a server-side environment variable and is never exposed to the browser.

### 4.3 Encryption in Transit

All data in transit between your browser and our servers, between our servers and Supabase, and between our servers and third-party APIs is encrypted using **TLS 1.2 or TLS 1.3**. We do not support unencrypted HTTP connections; all HTTP requests are automatically redirected to HTTPS.

### 4.4 Access Controls for Credentials

- **Database-level**: Supabase Row-Level Security (RLS) policies ensure that Credential data is only accessible to the authenticated user who owns it, and to the server-side service role running the bot process for that tenant.
- **Application-level**: Credentials are decrypted only at the moment they are needed (e.g., immediately before making an API call). Decrypted values are held in application memory for the minimum time necessary and are not logged.
- **Human access**: Company employees do not have routine access to decrypted Credentials. Access to production databases requires multi-factor authentication, is logged, and is limited to authorized infrastructure personnel for incident response only.

### 4.5 What We Transmit to Third Parties Using Your Credentials

| Credential | Transmitted To | When | Content of Transmission |
|-----------|--------------|------|------------------------|
| Discord Bot Token | Discord API (discord.com/api) | Continuously (WebSocket connection) | Included in WebSocket `IDENTIFY` payload to authenticate your Bot |
| Anthropic API Key | Anthropic API (api.anthropic.com) | Every time your Bot processes a message | Included as `x-api-key` HTTP header; the message content and Bot context are included in the request body |
| OpenAI API Key | OpenAI API (api.openai.com) | When classification is triggered | Included as `Authorization: Bearer` header; the message text is included in the request body |
| GitHub OAuth token | GitHub API (api.github.com) | When a GitHub tool is invoked | Included as `Authorization: Bearer` header |
| Google OAuth token | Google APIs (various) | When a Google tool is invoked | Included as `Authorization: Bearer` header |
| Linear OAuth token | Linear API (api.linear.app) | When a Linear tool is invoked | Included as `Authorization: Bearer` header |
| Toggl API key | Toggl API (api.track.toggl.com) | When a Toggl tool is invoked | Included as `Authorization: Basic` header (base64-encoded) |

### 4.6 Credential Deletion

When you:
- Disconnect an Integration: the associated OAuth token or API key is deleted from our database immediately.
- Remove your Discord connection: the Bot Token and Guild ID are deleted from our database; the Bot is disconnected.
- Remove your Anthropic API Key: the key is deleted; Bot AI functionality ceases until a new key is provided.
- Delete your Account: all Credentials are deleted from our database immediately. Supabase Vault secrets associated with your account are deleted within 24 hours of Account deletion.

We do not retain backups of Credentials after deletion beyond the backup retention window (see Section 7.5).

---

## 5. DISCORD AND BOT MESSAGE DATA

This section explains our specific practices regarding Discord messages processed by your Bot.

### 5.1 Message Content — No Persistent Storage

Your Bot receives Discord messages in your Discord Guild. Message content is processed in the following way:

1. **Receipt**: The Bot process receives the message from Discord's WebSocket API.
2. **In-memory context**: The message and recent conversation context are held in the Bot process's memory for the duration of processing. This in-memory context is not written to any database or log.
3. **Transmission to Anthropic**: The message content, along with system prompt and conversation context, is transmitted to Anthropic's Claude API using your Anthropic API Key. This transmission is governed by your agreement with Anthropic.
4. **Response**: The AI response is received and sent to Discord.
5. **Context window**: A limited conversation history is maintained in runtime memory (not database) to support multi-turn conversation. This is cleared when the Bot process restarts or after a configurable idle timeout.

**We do not write Discord message content to any database column, log file, analytics system, or external service under our control.**

### 5.2 Message Metadata — Minimal Logging

We log the following message metadata for operational purposes only (not message content):
- Timestamp of message processing
- Discord Guild ID (to attribute the event to a tenant)
- Whether the message triggered a tool invocation, and which tool category (e.g., "GitHub tool") — not which specific tool or what arguments were used
- Processing latency (milliseconds)
- Whether the processing succeeded or failed, and the error category if failed

This metadata is used to calculate per-tenant aggregate metrics (messages per day, tool invocation counts, error rates) visible in the dashboard. It is retained for 90 days and then deleted.

### 5.3 Guild Members' Data

Your Bot operates in your Discord Guild and interacts with your Guild members. Those Guild members are individuals whose data may be processed through the Service. You are responsible, as the Guild owner or administrator, for ensuring that your use of the Bot in your Guild complies with all applicable data protection laws, including informing your Guild members that an AI bot may process their messages.

**We are a data processor with respect to Guild members' message data.** You (the Guild owner/administrator) are the data controller for your Guild members' data. Our Data Processing Agreement (DPA) template is available at daimon.bot/dpa for customers who need it for GDPR compliance.

### 5.4 What Discord Knows

Discord, Inc. processes data about your Bot's activity independently, as described in Discord's Privacy Policy. We have no control over Discord's data practices. Discord may retain logs of API requests made using your Bot Token, message events sent to your Bot, and other Gateway events.

---

## 6. COOKIES AND TRACKING TECHNOLOGIES

### 6.1 Types of Cookies We Use

| Cookie Name | Type | Purpose | Duration |
|-------------|------|---------|----------|
| `sb-access-token` | Essential / Authentication | Supabase Auth session access token (JWT). Required for you to be logged into the dashboard. | Session (expires per JWT expiry, typically 1 hour; refreshed automatically) |
| `sb-refresh-token` | Essential / Authentication | Supabase Auth refresh token. Used to obtain a new access token without requiring re-login. | 30 days (rolling) |
| `__stripe_mid` | Essential / Fraud Prevention | Set by Stripe on the billing page to prevent payment fraud. | 1 year |
| `__stripe_sid` | Essential / Fraud Prevention | Set by Stripe for session-level fraud prevention. | Session |
| `daimon_csrf` | Essential / Security | CSRF token to prevent cross-site request forgery. | Session |

**We do not set advertising cookies. We do not use third-party analytics cookies (e.g., Google Analytics). We do not use tracking pixels.**

### 6.2 Local Storage

We use browser local storage for the following purposes:
- `sidebar_collapsed` — Boolean flag for dashboard sidebar state. Contains no personal data.
- `theme_preference` — `"light"` or `"dark"` if you have selected a theme. Contains no personal data.

### 6.3 Managing Cookies

You can control cookies through your browser settings. Disabling essential cookies (authentication cookies) will prevent you from logging into the Service. You can delete all cookies associated with daimon.bot by clearing your browser data for that site.

We do not use any cookie management platform or consent banner for our current cookie set, because the cookies we use are limited to those strictly necessary for the Service to function (security and authentication), plus Stripe fraud prevention cookies set directly by Stripe's JavaScript library. Under ePrivacy Directive rules, strictly necessary cookies are exempt from consent requirements.

---

## 7. DATA RETENTION

We retain personal data for the periods described below. After the applicable retention period, data is deleted or anonymized (where deletion is not technically feasible in backup systems, data is purged on the next backup rotation cycle).

### 7.1 Account Data

| Data Type | Retention Period | Rationale |
|-----------|-----------------|-----------|
| Email address | Duration of Account + 30 days after Account deletion | Required for Account operation; 30-day grace period for Account recovery |
| Password hash | Duration of Account + 30 days | Same as above |
| Full name (if provided) | Duration of Account + 30 days | Same as above |
| Account creation date | Duration of Account + 7 years | Tax/legal compliance |

### 7.2 Tenant Configuration Data

| Data Type | Retention Period | Rationale |
|-----------|-----------------|-----------|
| Tenant name | Duration of Account + 30 days | Part of Account data |
| Discord Guild ID | Deleted immediately upon Account deletion or Discord connection removal | Not needed after disconnection |
| Encrypted Bot Token | Deleted immediately upon Discord connection removal or Account deletion | Sensitive credential — minimal retention |
| Encrypted Anthropic API Key | Deleted immediately upon key removal or Account deletion | Sensitive credential — minimal retention |
| Encrypted OpenAI API Key | Deleted immediately upon key removal or Account deletion | Sensitive credential — minimal retention |
| Encrypted OAuth tokens (GitHub, Google, Linear) | Deleted immediately upon Integration disconnection or Account deletion | Sensitive credential — minimal retention |
| Encrypted third-party API keys | Deleted immediately upon Integration disconnection or Account deletion | Sensitive credential — minimal retention |

### 7.3 Billing Data

| Data Type | Retention Period | Rationale |
|-----------|-----------------|-----------|
| Stripe Customer ID | 7 years after Account deletion | Tax and financial audit compliance |
| Stripe Subscription ID | 7 years after subscription end | Tax and financial audit compliance |
| Invoice records (amounts, dates, plan) | 7 years | Tax/legal compliance |
| Payment method ID (Stripe token) | Until Account deletion | For subscription management |

### 7.4 Operational and Log Data

| Data Type | Retention Period | Rationale |
|-----------|-----------------|-----------|
| Bot connection status history | 90 days | Troubleshooting and SLA calculations |
| Per-tenant daily message processing counts | 90 days | Dashboard metrics |
| Per-tenant daily tool invocation counts | 90 days | Dashboard metrics |
| Security audit log (login events, critical actions) | 1 year | Security incident investigation |
| Application error logs (no personal data, anonymized) | 30 days | Bug diagnosis |
| IP addresses in request logs | 30 days | Security/fraud prevention |
| Support email conversations | 3 years after resolution | Reference for ongoing support relationship |

### 7.5 Backups

We maintain database backups for disaster recovery purposes. Backup retention:
- **Point-in-time recovery (PITR)**: 7 days of continuous backup (Supabase PITR feature)
- **Periodic snapshots**: Weekly snapshots retained for 30 days

Data deleted from the live database may persist in backups for up to 30 days. After the backup retention window expires, the backup is permanently deleted.

---

## 8. DATA SECURITY

### 8.1 Technical Safeguards

We implement the following technical security measures:

**Encryption**
- All data in transit: TLS 1.2+ (HTTPS enforced; HSTS header set with `max-age=31536000; includeSubDomains; preload`)
- All Credentials at rest: AES-256-GCM via Supabase Vault
- All other database data at rest: AES-256 encryption at the storage layer (Supabase/AWS RDS encryption)
- Password storage: bcrypt hashing via Supabase Auth (never stored in plaintext)
- Session tokens: Short-lived JWTs (1 hour access token) with 30-day rolling refresh tokens

**Access Control**
- Database Row-Level Security (RLS) enforced on all tables containing personal data
- Multi-factor authentication required for all Company employee access to production systems
- Principle of least privilege: each service component has access only to the data it requires
- Service role keys and other secrets stored as environment variables, never in source code

**Infrastructure**
- All infrastructure hosted on reputable cloud providers (Vercel, Supabase, Fly.io) with SOC 2 compliance
- Automated dependency vulnerability scanning in CI/CD pipeline
- Regular security patches applied to infrastructure

**Monitoring**
- Authentication anomaly detection (unusual login locations, brute-force attempts)
- Rate limiting on all authentication endpoints
- Alert thresholds for unusual API call volumes per tenant

### 8.2 Organizational Safeguards

- Only authorized personnel have access to production systems
- Access logs are maintained and reviewed
- Security training for all personnel with access to personal data
- Incident response plan in place (see Section 8.3)

### 8.3 Security Incident Response

In the event of a data breach or security incident that affects your personal information:

1. **Containment**: We will take immediate steps to contain the breach.
2. **Assessment**: We will determine what data was affected, the scope of the breach, and the likely impact.
3. **Notification**: We will notify affected users by email within 72 hours of discovering a breach that is likely to result in a risk to your rights and freedoms (consistent with GDPR Article 33/34 requirements). The notification will include: what happened, what data was involved, what we are doing about it, and what you can do to protect yourself.
4. **Regulatory notification**: Where legally required, we will notify applicable data protection authorities within the required timeframe.

To report a suspected security vulnerability, please contact us at security@daimon.bot. We appreciate responsible disclosure.

### 8.4 Limitations

No security measures are perfect or impenetrable. We cannot guarantee the security of your personal information. You should take steps to protect your own account, including using a strong, unique password, enabling multi-factor authentication (if available), and promptly reporting any suspicious activity to us.

---

## 9. INTERNATIONAL DATA TRANSFERS

### 9.1 Where Your Data Is Stored

Our primary data storage is in the United States (Supabase hosted on AWS us-east-1; Vercel infrastructure). If you are located outside the United States, your personal information will be transferred to and processed in the United States.

### 9.2 Legal Mechanisms for Transfers from the EEA/UK

For transfers of personal data from the EEA, UK, or Switzerland to the United States, we rely on the following legal mechanisms:

- **EU-US Data Privacy Framework**: Where our sub-processors (Supabase, Vercel, Stripe) participate in the EU-US Data Privacy Framework, we rely on their certification.
- **Standard Contractual Clauses (SCCs)**: For sub-processors that are not DPF-certified, we rely on the EU Commission's Standard Contractual Clauses (Module 2: Controller-to-Processor) as the legal basis for transfer.
- **UK Addendum**: For transfers from the UK, we use the UK International Data Transfer Addendum to the EU SCCs.

Our Data Processing Agreement (DPA) template, including applicable SCCs, is available at daimon.bot/dpa.

### 9.3 Anthropic API Transfers

When your Bot processes Discord messages, the message content is transmitted to Anthropic's API, which is operated from the United States. This transfer is made using your own Anthropic API Key, under your own account with Anthropic. You are the data controller for this transfer; the data transfer is governed by your agreement with Anthropic. We process the data on your behalf (as your data processor) when we transmit the API request.

---

## 10. CHILDREN'S PRIVACY

The Service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If you are under 13, do not create an Account or provide any personal information through the Service.

If you are between 13 and 17 years of age, you may use the Service only with the express consent and supervision of a parent or legal guardian.

If we discover that we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information promptly. If you believe we have inadvertently collected information from a child under 13, please contact us immediately at privacy@daimon.bot.

---

## 11. THIRD-PARTY SERVICES AND LINKS

### 11.1 Third-Party Links

The Service may contain links to third-party websites (e.g., Discord documentation, Anthropic documentation, GitHub, Linear). We are not responsible for the privacy practices of those websites and encourage you to read their privacy policies.

### 11.2 Third-Party Services Accessed via Integrations

When you connect an Integration, you are authorizing the Service to interact with a third-party service on your behalf. The third-party service's privacy policy governs how that service collects and uses your data. We are not responsible for the privacy practices of:
- Discord, Inc. (discord.com/privacy)
- Anthropic, PBC (anthropic.com/privacy)
- OpenAI, L.L.C. (openai.com/privacy)
- GitHub, Inc. (github.com/site/privacy)
- Google LLC (policies.google.com/privacy)
- Linear Orbit, Inc. (linear.app/privacy)
- Toggl OÜ (toggl.com/legal/privacy)

### 11.3 Stripe

Payment processing is handled by Stripe, Inc. When you provide payment information, it is collected directly by Stripe through their embedded payment form (Stripe.js / Stripe Elements). We never see your full card number. Stripe's privacy policy is available at stripe.com/privacy.

---

## 12. YOUR RIGHTS AND CHOICES

### 12.1 Access

You may request access to the personal information we hold about you. You can access and review much of your account data directly in the dashboard. For a full data export, contact us at privacy@daimon.bot. We will provide a machine-readable copy of your data within 30 days of your request.

### 12.2 Correction

You may correct inaccurate personal information by updating it directly in your dashboard profile settings, or by contacting us at privacy@daimon.bot.

### 12.3 Deletion

You may delete your Account at any time from the Settings page (Account → Danger Zone → Delete Account). Upon Account deletion:
- Your personal information and User Data will be deleted in accordance with Section 7.
- Your Credentials (API keys, tokens) will be immediately deleted.
- Your Bot will be disconnected from Discord.
- Your subscription will be cancelled.

Account deletion is permanent and irreversible. We cannot recover deleted accounts.

You may also request deletion of specific data without deleting your Account by contacting privacy@daimon.bot.

### 12.4 Opt-Out of Marketing Emails

We send product update emails and other marketing communications only to users who have opted in. You may opt out at any time by:
- Clicking the "unsubscribe" link at the bottom of any marketing email, or
- Updating your notification preferences in the dashboard (Settings → Notifications).

Opting out of marketing emails does not affect transactional emails (invoices, security alerts, password resets), which are necessary for operating your Account.

### 12.5 Cookie Preferences

You may manage cookies through your browser settings as described in Section 6.3.

### 12.6 Data Portability

You may request an export of your personal data in a machine-readable format (JSON or CSV) by contacting privacy@daimon.bot. We will provide the export within 30 days.

---

## 13. EEA, UK, AND SWISS USER RIGHTS (GDPR / UK GDPR)

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have the following additional rights under the General Data Protection Regulation (GDPR), the UK GDPR, or the Swiss Federal Act on Data Protection (nFADP), as applicable.

### 13.1 Legal Bases for Processing

In addition to the legal bases stated in Section 2, we rely on the following GDPR legal bases:

| Processing Activity | GDPR Legal Basis |
|--------------------|--------------------|
| Providing the Service to you | Article 6(1)(b) — Performance of a contract |
| Sending transactional communications | Article 6(1)(b) — Performance of a contract |
| Security, fraud prevention, audit logging | Article 6(1)(f) — Legitimate interests |
| Compliance with legal obligations | Article 6(1)(c) — Legal obligation |
| Sending marketing communications | Article 6(1)(a) — Consent (you may withdraw at any time) |
| Service improvement analytics (aggregate, anonymized) | Article 6(1)(f) — Legitimate interests |

### 13.2 Your GDPR Rights

You have the right to:

**Right of Access (Article 15)**: Request confirmation of whether we process your personal data and obtain a copy of it, along with information about how it is processed.

**Right to Rectification (Article 16)**: Request correction of inaccurate personal data.

**Right to Erasure (Article 17)**: Request deletion of your personal data where it is no longer necessary for the purposes for which it was collected, you have withdrawn consent, you object to processing, or the data has been unlawfully processed. This right does not apply where we must retain data to comply with a legal obligation.

**Right to Restriction of Processing (Article 18)**: Request that we restrict processing of your personal data in certain circumstances (e.g., while we verify the accuracy of data you have contested).

**Right to Data Portability (Article 20)**: Receive your personal data in a structured, commonly used, machine-readable format and transmit it to another controller, where processing is based on consent or contract performance and carried out by automated means.

**Right to Object (Article 21)**: Object to processing of your personal data where we rely on legitimate interests as the legal basis. We will cease processing unless we can demonstrate compelling legitimate grounds that override your interests.

**Rights related to Automated Decision-Making (Article 22)**: We do not make automated decisions that produce legal or similarly significant effects about you based on your personal data.

**Right to Lodge a Complaint**: You have the right to lodge a complaint with your local data protection authority. A list of EEA supervisory authorities is available at edpb.europa.eu. The UK supervisory authority is the Information Commissioner's Office (ico.org.uk).

### 13.3 How to Exercise Your GDPR Rights

To exercise any of the above rights, submit a request to:

- **Email**: privacy@daimon.bot (subject line: "GDPR Data Rights Request")
- **Mail**: PyMC Technologies, Inc., Attn: Data Protection, [REGISTERED AGENT ADDRESS]

We will respond within 30 days of receiving your request. We may ask you to verify your identity before processing your request. If we cannot fulfill your request, we will explain why.

### 13.4 Data Protection Officer

We have appointed a Data Protection Officer (DPO) who can be contacted at:

**Email**: dpo@daimon.bot

### 13.5 Representative in the EEA

[If required by GDPR Article 27 — i.e., if the Company does not have an establishment in the EEA but offers goods or services to EEA data subjects — the Company must appoint a representative in the EU. If required, insert: "Our EU representative is [INSERT EU REPRESENTATIVE NAME AND CONTACT]. For GDPR-related inquiries, EEA residents may contact our EU representative directly."]

**Note for forward loop**: Determine at launch whether Article 27 applies (it does if you systematically offer services to EEA residents). If so, appoint an EU representative (e.g., using a service like DataRep) before launch and update this section.

---

## 14. CALIFORNIA CONSUMER PRIVACY RIGHTS (CCPA / CPRA)

If you are a California resident, the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA) grants you specific rights regarding your personal information.

### 14.1 Categories of Personal Information We Collect

Under CCPA, we collect the following categories of personal information (as defined in Cal. Civ. Code § 1798.140):

| Category | Specific Data | Collected? |
|----------|--------------|-----------|
| Identifiers | Email address, Account ID | Yes |
| Personal Records (Cal. Civ. Code § 1798.80) | Name, financial account information (via Stripe; we hold Stripe Customer ID only) | Yes |
| Internet or Network Activity | IP address, browsing history within the Service, interactions with the dashboard | Yes |
| Geolocation | IP-derived country/region (imprecise) | Yes (approximate only) |
| Inferences | None — we do not create profiles or draw inferences about consumers | No |
| Sensitive Personal Information (CPRA) | API keys, OAuth tokens (classified as login credentials and financial account information under Cal. Civ. Code § 1798.140(ae)) | Yes |

### 14.2 Purposes for Collection

We collect personal information for the business purposes described in Section 2.

### 14.3 Categories of Third Parties with Whom We Share Personal Information

We share personal information with the categories of third parties described in Section 3: service providers/sub-processors, integration partners, payment processor (Stripe), and government/law enforcement when legally required.

**We do not sell your personal information** as defined under CCPA. We do not share your personal information for cross-context behavioral advertising.

### 14.4 Your CCPA/CPRA Rights

**Right to Know**: You may request that we disclose what personal information we collect, use, disclose, and sell about you. You may request this information up to twice per 12-month period.

**Right to Delete**: You may request that we delete personal information we have collected from you, subject to certain exceptions (e.g., completion of a transaction, security incident prevention, legal compliance).

**Right to Correct**: You may request that we correct inaccurate personal information.

**Right to Opt-Out of Sale/Sharing**: We do not sell personal information. We do not share personal information for cross-context behavioral advertising. No opt-out is required, but you may contact us to confirm.

**Right to Limit Use of Sensitive Personal Information**: Your API keys and OAuth tokens are used only for the purpose of providing the Service. We do not use them for any secondary purpose. You may request that we limit their use by contacting us, which may require disconnecting related Services.

**Right to Non-Discrimination**: We will not discriminate against you for exercising your CCPA rights.

### 14.5 How to Submit a CCPA Request

Submit requests to:
- **Email**: privacy@daimon.bot (subject line: "CCPA Privacy Request")
- **Website**: daimon.bot/privacy-request (if a request form is implemented; otherwise email)

We will acknowledge your request within 10 business days and respond within 45 days. If we need more time (up to 45 additional days), we will notify you.

We will verify your identity before processing your request. For Account holders, we will ask you to verify by confirming access to the email address on your Account.

### 14.6 Authorized Agent

You may designate an authorized agent to make a CCPA request on your behalf. The authorized agent must provide written authorization signed by you and proof of identity.

---

## 15. CHANGES TO THIS PRIVACY POLICY

### 15.1 Notice of Changes

We may update this Privacy Policy from time to time. When we make material changes, we will:
- (a) send an email notification to the address on your Account at least 30 days before the changes take effect; and
- (b) post a notice in the dashboard with a summary of changes.

For non-material changes (such as corrections, clarifications, or updates to reflect new sub-processors with equivalent privacy practices), we may provide shorter notice or update the "Last Updated" date without advance email notice.

### 15.2 Continued Use

Your continued use of the Service after the effective date of the updated Privacy Policy constitutes your acceptance of the changes. If you do not agree to the updated Privacy Policy, you must stop using the Service and delete your Account.

### 15.3 Version History

We maintain an archive of prior versions of this Privacy Policy. Prior versions are available upon request by emailing privacy@daimon.bot.

---

## 16. CONTACT US

For privacy-related questions, requests, or concerns, please contact us:

**PyMC Technologies, Inc.**

| Purpose | Contact |
|---------|---------|
| General privacy inquiries | privacy@daimon.bot |
| GDPR rights requests | privacy@daimon.bot (subject: "GDPR Data Rights Request") |
| CCPA rights requests | privacy@daimon.bot (subject: "CCPA Privacy Request") |
| Data Protection Officer | dpo@daimon.bot |
| Security vulnerability reports | security@daimon.bot |
| Legal notices | legal@daimon.bot |
| General support | support@daimon.bot |

**Mailing Address:**
PyMC Technologies, Inc.
Attn: Privacy
[REGISTERED AGENT ADDRESS TO BE INSERTED]

We will respond to privacy inquiries within 30 days, or within the applicable legal timeframe for rights requests under GDPR (30 days) or CCPA (45 days + 45-day extension if needed).

---

## APPENDIX A: DATA PROCESSING AGREEMENT SUMMARY

This appendix summarizes the key terms of our data processing relationship for users who need GDPR compliance documentation. A full DPA is available at daimon.bot/dpa.

**Roles**:
- For personal data of Account holders: PyMC Technologies, Inc. is the **Data Controller**.
- For personal data of Guild members whose messages are processed by your Bot: You (the Account holder) are the **Data Controller**; PyMC Technologies, Inc. is the **Data Processor**.

**Sub-processors**: As listed in Section 3.1 of this Privacy Policy.

**Processing activities**:
- Duration: For the duration of your use of the Service.
- Nature: Collection, storage, encryption, transmission, deletion of personal data as described herein.
- Purpose: Providing the Daimon Service.
- Types of data: As described in Section 1.
- Categories of data subjects: Account holders; Guild members (message data in-transit only; not persistently stored).

**Security measures**: As described in Section 8 of this Privacy Policy.

**Data subject rights assistance**: We will assist you in responding to data subject rights requests from your Guild members to the extent technically feasible. Contact support@daimon.bot.

---

## APPENDIX B: SUB-PROCESSOR CHANGE NOTICE PROCESS

We will notify you of any new or changed sub-processors by:
1. Posting an update to the sub-processor list at daimon.bot/sub-processors with at least 30 days' notice.
2. Sending an email notification to Account holders who have opted into compliance notifications (available in Settings → Notifications → Compliance Updates).

If you object to a new sub-processor for legitimate reasons related to data protection, contact privacy@daimon.bot within 30 days of the notification. We will work to address your concern. If we cannot resolve the concern, you may terminate your Account as described in the Terms of Service.

---

*This Privacy Policy was last updated on [INSERT LAUNCH DATE]. Version 1.0.*

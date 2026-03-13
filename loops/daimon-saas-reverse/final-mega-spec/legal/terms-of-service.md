# Terms of Service — Daimon

> Aspect: 6.4a
> Written: 2026-03-13
> Related: [privacy-policy.md](./privacy-policy.md), [disclaimers.md](./disclaimers.md), [../premium/tiers.md](../premium/tiers.md), [../premium/pricing.md](../premium/pricing.md)

---

> **Implementation note for forward loop**: The legal entity name below is "PyMC Technologies, Inc." — verify this is the correct registered entity name before publishing. The effective date should be set to the actual launch date. The governing law jurisdiction is set to Delaware, USA — update if the company is incorporated elsewhere.

---

# DAIMON TERMS OF SERVICE

**Effective Date:** [INSERT LAUNCH DATE]
**Last Updated:** [INSERT LAUNCH DATE]

---

## AGREEMENT TO TERMS

These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and PyMC Technologies, Inc. ("Company," "we," "us," or "our") governing your access to and use of the Daimon platform, including the website at daimon.bot (and any subdomains), the web application dashboard, the Discord bot service, and all related services, features, content, and functionality (collectively, the "Service").

**BY CREATING AN ACCOUNT, CLICKING "I AGREE," OR OTHERWISE ACCESSING OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS AND OUR PRIVACY POLICY, WHICH IS INCORPORATED HEREIN BY REFERENCE.** If you do not agree to these Terms, you must not create an account or use the Service.

If you are using the Service on behalf of an organization or entity ("Organization"), you represent and warrant that you have the authority to bind that Organization to these Terms, and all references to "you" shall include both you and the Organization.

---

## 1. DEFINITIONS

**1.1 "Account"** means the registered account you create to access the Service, associated with a single email address.

**1.2 "Anthropic API Key"** means the API key issued to you directly by Anthropic, PBC (the maker of Claude AI), which you provide to the Service under the BYOK model.

**1.3 "Bot"** means the Discord bot instance operated by the Service on your behalf within your Discord Guild, powered by Decision Orchestrator software.

**1.4 "Bot Token"** means the Discord bot token you create via the Discord Developer Portal and provide to the Service in order to authenticate your Bot.

**1.5 "BYOK"** means "Bring Your Own Key" — the model under which you supply your own API credentials (Anthropic API Key and optionally an OpenAI API Key) to the Service, which uses them solely to power your Bot's AI capabilities.

**1.6 "Content"** means any text, data, messages, files, or other materials sent, submitted, transmitted, or otherwise made available through the Service, including Discord messages processed by your Bot.

**1.7 "Credentials"** means third-party API keys, OAuth tokens, bot tokens, and other authentication credentials you provide to the Service for the purpose of enabling Integrations.

**1.8 "Discord"** means Discord Inc. and its Discord chat platform, including Discord servers ("Guilds") and the Discord API.

**1.9 "Discord Guild"** means a Discord server owned or administered by you or your Organization, to which your Bot is added.

**1.10 "Effective Date"** means the date on which these Terms become effective as stated above.

**1.11 "Guild ID"** means the unique numeric identifier for your Discord Guild.

**1.12 "Integration"** means a connection between the Service and a Third-Party Service, established via OAuth authorization or API key provision.

**1.13 "OpenAI API Key"** means the optional API key issued to you by OpenAI, L.L.C., which you may provide to the Service for enhanced message classification features.

**1.14 "Plan"** means the subscription tier you have selected (Free, Starter, or Pro), each described in Section 5.

**1.15 "Platform Fee"** means the recurring fee payable by you to the Company for access to the Service, as described in Section 5. The Platform Fee does not include AI inference costs, which are charged directly to you by Anthropic or OpenAI under your separate agreements with those providers.

**1.16 "Service"** has the meaning given in the preamble above.

**1.17 "Subscription Period"** means the period for which you have paid for a Plan (monthly or annual).

**1.18 "Tenant"** means a single workspace created within the Service, associated with one Account owner and optionally additional team members.

**1.19 "Third-Party Service"** means any external service or platform accessed through an Integration, including but not limited to GitHub, Google, Linear, and Toggl.

**1.20 "User Data"** means all data, information, and Content that you or your authorized users submit to, process through, or store in the Service, including Discord messages processed by your Bot.

---

## 2. ELIGIBILITY

**2.1 Age Requirement.** You must be at least 18 years of age to create an Account and use the Service. By using the Service, you represent and warrant that you are at least 18 years old. If you are between 13 and 17 years old, you may use the Service only with the express consent and supervision of a parent or legal guardian who agrees to these Terms.

**2.2 Legal Capacity.** You represent that you have the legal capacity to enter into a binding agreement in your jurisdiction. If you are using the Service on behalf of an Organization, you represent that the Organization is duly organized and validly existing under applicable law.

**2.3 Compliance with Laws.** You represent that your use of the Service does not violate any applicable law, regulation, rule, or order, including without limitation export control laws, sanctions laws, and data protection laws applicable in your jurisdiction.

**2.4 Discord Account.** You must maintain a valid Discord account and have the ability to create Discord applications in the Discord Developer Portal to use the Bot features of the Service.

**2.5 Anthropic Account.** You must maintain a valid account with Anthropic, PBC and have obtained an Anthropic API Key in accordance with Anthropic's terms of service to use the AI features of the Service.

---

## 3. ACCOUNT REGISTRATION AND SECURITY

**3.1 Account Creation.** To access the Service, you must register for an Account by providing a valid email address and creating a password. You may not use a false identity, impersonate any person or entity, or provide false or misleading information.

**3.2 Account Accuracy.** You agree to provide accurate, current, and complete information during the registration process and to update such information as necessary to keep it accurate, current, and complete.

**3.3 Account Security.** You are responsible for maintaining the confidentiality of your Account credentials, including your password. You agree to:
- (a) use a strong, unique password for your Account;
- (b) notify us immediately at support@daimon.bot if you discover or suspect any unauthorized access to or use of your Account;
- (c) ensure that you log out of your Account at the end of each session when using shared devices.

**3.4 Account Responsibility.** You are solely responsible for all activity that occurs under your Account, whether or not you authorized it. We will not be liable for any loss or damage arising from unauthorized use of your Account, except to the extent such loss results from our gross negligence or willful misconduct.

**3.5 One Account Per Person.** Each individual person may maintain only one Account. You may not share your Account credentials with others or allow others to use your Account. Organizations may have a single Tenant with multiple team members added via the team management feature.

**3.6 Account Termination by You.** You may delete your Account at any time via the Settings page. Account deletion is permanent and irreversible. See Section 10 (Termination) for the effects of termination.

---

## 4. THE SERVICE

**4.1 Service Description.** Daimon is a self-serve platform that enables you to deploy a Discord bot powered by the Decision Orchestrator AI system within your Discord Guild. The Service provides:
- (a) a web-based dashboard for managing your Bot configuration, Credentials, and Integrations;
- (b) infrastructure for running your Bot instance using your provided Bot Token;
- (c) secure storage of your Credentials using industry-standard encryption;
- (d) a billing interface for managing your subscription Plan;
- (e) documentation and support resources.

**4.2 BYOK Model.** The Service operates on a Bring Your Own Key ("BYOK") model. Specifically:
- (a) **Anthropic API Key (Required):** You must provide a valid Anthropic API Key. The Service will use this key exclusively to make API calls to Anthropic on your behalf when your Bot processes messages in your Discord Guild. You are solely responsible for all costs charged by Anthropic under your Anthropic API Key, which are billed directly by Anthropic and are entirely separate from the Platform Fee.
- (b) **OpenAI API Key (Optional):** You may optionally provide an OpenAI API Key for enhanced message classification. If provided, the Service will use this key exclusively to make API calls to OpenAI on your behalf. You are solely responsible for all OpenAI costs.
- (c) **Responsibility for Third-Party API Costs:** The Company has no visibility into or responsibility for the AI inference costs you incur with Anthropic or OpenAI. You agree to monitor your usage and maintain sufficient API quota and billing with those providers.

**4.3 Discord Bot Token.** To connect the Service to your Discord Guild:
- (a) You must create a Discord application and bot in the Discord Developer Portal (discord.com/developers).
- (b) You must provide the resulting Bot Token and your Guild ID to the Service.
- (c) You represent and warrant that you have authority to add bots to the Discord Guild specified by your Guild ID.
- (d) You are responsible for ensuring your Discord application complies with Discord's Developer Terms of Service and Developer Policy at all times.
- (e) If your Bot Token is invalidated, revoked, or changed by Discord, you are responsible for updating it in the Service.

**4.4 Third-Party Integrations.** The Service supports optional Integrations with Third-Party Services to extend Bot capabilities. For OAuth-based Integrations (GitHub, Google, Linear), you authorize the Service to act on your behalf using the scopes you grant. For API key-based Integrations (Toggl), you provide your API key directly. You represent that you are authorized to grant the requested access to each Third-Party Service and that your use of each Integration complies with that Third-Party Service's terms.

**4.5 Service Availability.** We will use commercially reasonable efforts to maintain Service availability. We do not guarantee uninterrupted or error-free operation. Scheduled maintenance, emergency maintenance, and circumstances beyond our control may result in temporary unavailability. See the uptime SLA provisions in Section 5.4.

**4.6 Service Modifications.** We reserve the right to modify, update, enhance, or discontinue features of the Service at any time. We will provide reasonable notice for material changes that substantially reduce functionality available on your Plan. Changes to address security vulnerabilities or comply with legal requirements may be implemented without prior notice.

**4.7 Beta Features.** From time to time, we may offer beta or preview features. Beta features are provided "as is," may contain bugs, may change significantly, and may be discontinued without notice. Beta features are not subject to any service level commitments.

---

## 5. SUBSCRIPTION PLANS AND BILLING

**5.1 Plans.** The Service is offered under three subscription Plans:

| Plan | Monthly Price | Annual Price | Discord Connections |
|------|--------------|-------------|---------------------|
| Free | $0/month | $0/year | 1 |
| Starter | $9/month | $79/year | Up to 3 |
| Pro | $29/month | $249/year | Unlimited |

Plan features are described in detail at daimon.bot/pricing and in the Service documentation. We reserve the right to modify Plan pricing and features upon 30 days' prior written notice to existing subscribers. Your continued use of the Service after such notice constitutes acceptance of the updated pricing.

**5.2 Free Plan.** The Free Plan is available at no charge and does not require a credit card. We reserve the right to limit, modify, or discontinue the Free Plan upon 30 days' prior written notice.

**5.3 Paid Plans — Billing.** For paid Plans (Starter and Pro):
- (a) **Payment Method:** You must provide a valid payment method (credit or debit card) accepted by our payment processor, Stripe, Inc.
- (b) **Billing Cycles:** Subscriptions are billed in advance on a monthly or annual cycle, depending on your selection at time of purchase.
- (c) **Automatic Renewal:** Your subscription automatically renews at the end of each Subscription Period unless you cancel before the renewal date.
- (d) **Taxes:** Prices listed do not include applicable taxes. You are responsible for all applicable sales, use, value-added, or similar taxes. Where legally required, we will collect and remit taxes.
- (e) **Currency:** All prices are in US Dollars (USD).
- (f) **Failed Payments:** If your payment fails, we will attempt to collect payment up to three times over a period of up to 14 days. If all retry attempts fail, your subscription will be downgraded to the Free Plan, and features associated with paid Plans will become unavailable.
- (g) **Payment Processing:** Payment processing is handled by Stripe, Inc. We do not store your full payment card information. Your use of Stripe is subject to Stripe's services agreement available at stripe.com/legal.

**5.4 Uptime SLA (Pro Plan Only).** For Pro Plan subscribers, we guarantee 99.9% monthly uptime for the Bot service, calculated as: ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) × 100. Downtime means the complete inability of your Bot to connect to Discord and process messages, not including:
- (a) scheduled maintenance (announced at least 24 hours in advance via email and status page);
- (b) emergency maintenance performed to address critical security vulnerabilities;
- (c) outages caused by Discord, Anthropic, Supabase, or other third-party infrastructure providers;
- (d) outages caused by your invalid Bot Token, revoked Anthropic API Key, or other configuration issues within your control;
- (e) force majeure events as described in Section 17.8;
- (f) outages caused by your violation of these Terms.

If we fail to meet the 99.9% uptime guarantee in any calendar month, you may request a service credit equal to one day of Pro Plan fees per full percentage point below 99.9%, up to a maximum of 15 days of Pro Plan fees per month. Credits are applied to future invoices and are not redeemable for cash. To claim a credit, you must submit a written request to support@daimon.bot within 30 days of the end of the month in which the SLA breach occurred.

**5.5 Cancellation and Downgrade.**
- (a) **Cancellation:** You may cancel your paid subscription at any time via the Billing page in your dashboard or via the Stripe Customer Portal. Your subscription will remain active until the end of the current Subscription Period. No refunds are provided for the unused portion of a Subscription Period.
- (b) **Downgrade:** You may downgrade from Pro to Starter or from Starter to Free at any time. The downgrade takes effect at the end of the current Subscription Period. If your current configuration exceeds the limits of your new Plan (e.g., you have 4 Discord connections and downgrade to Starter, which allows 3), you must reduce your configuration to comply with the new Plan limits before the downgrade takes effect, or the Service will automatically disable connections that exceed the new limit (selecting which connections to disable in order of creation date, oldest connections disabled last).

**5.6 Upgrades.** You may upgrade your Plan at any time. Upgrades take effect immediately, and you will be charged a prorated amount for the remainder of the current billing period.

**5.7 Refunds.** All fees paid are non-refundable, except:
- (a) where required by applicable consumer protection law in your jurisdiction;
- (b) where we have committed a material breach of these Terms that we fail to cure within 30 days of written notice from you;
- (c) at our sole discretion on a case-by-case basis.

**5.8 Disputed Charges.** If you believe you have been incorrectly charged, you must notify us within 60 days of the charge by contacting support@daimon.bot. We will investigate and provide a response within 10 business days. Initiating a chargeback with your bank or credit card issuer before contacting us may result in immediate suspension of your Account.

---

## 6. ACCEPTABLE USE POLICY

**6.1 Permitted Use.** You may use the Service solely for lawful purposes and in accordance with these Terms. The Service is designed for personal and business productivity use through Discord.

**6.2 Prohibited Uses.** You must not use the Service to:
- (a) violate any applicable local, state, national, or international law or regulation;
- (b) infringe, misappropriate, or violate any intellectual property rights, privacy rights, or other rights of any person or entity;
- (c) transmit any material that is defamatory, obscene, harassing, abusive, threatening, or hateful;
- (d) impersonate any person or entity or misrepresent your affiliation with any person or entity;
- (e) transmit spam, chain letters, unsolicited messages, or engage in bulk messaging through your Bot;
- (f) distribute malware, viruses, Trojans, or any other malicious code;
- (g) attempt to gain unauthorized access to any portion of the Service, other users' accounts, or any systems or networks connected to the Service;
- (h) use automated means (scraping, crawling, harvesting) to access, monitor, copy, or extract data from the Service, except as expressly permitted by the Service API or these Terms;
- (i) reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service;
- (j) use the Service to process, store, or transmit content that promotes violence, terrorism, child exploitation, or other illegal activities;
- (k) engage in any activity that interferes with, disrupts, or places an unreasonable or disproportionate load on the Service or its infrastructure;
- (l) use the Service in any way that violates Discord's Terms of Service, Developer Terms of Service, or Developer Policy;
- (m) circumvent, disable, or interfere with security-related features of the Service;
- (n) use the Service to conduct denial-of-service attacks against any target;
- (o) use the Service for cryptocurrency mining or other unauthorized resource-intensive computation;
- (p) resell, sublicense, or provide the Service to third parties as a white-label product without our prior written consent;
- (q) use the Service in any manner that would subject us to liability or reputational harm.

**6.3 Bot Conduct.** Your Bot operates within Discord Guilds subject to Discord's Community Guidelines and Terms of Service. You are solely responsible for all messages sent by your Bot and for ensuring your Bot operates in compliance with the rules of each Discord Guild in which it operates. We are not responsible for actions taken by Discord (including Bot bans) resulting from your use of the Bot.

**6.4 Content Standards.** You are responsible for all Content processed through your Bot. You represent and warrant that you have all necessary rights to any Content you submit to the Service and that such Content does not violate any applicable law or third-party rights.

**6.5 Monitoring and Enforcement.** We reserve the right, but have no obligation, to monitor use of the Service for violations of these Terms. We may investigate complaints, take action against violating accounts (including suspension or termination), and cooperate with law enforcement authorities.

**6.6 Reporting Violations.** If you become aware of any violation of these Terms, please report it to support@daimon.bot.

---

## 7. CREDENTIALS AND DATA SECURITY

**7.1 Credential Storage.** We store your Credentials (Bot Token, Anthropic API Key, OpenAI API Key, OAuth tokens, third-party API keys) using industry-standard encryption. Specifically, all sensitive credential values are encrypted at rest using Supabase Vault, which employs AES-256 encryption. Access to decrypted credentials is limited to the service processes that require them to operate your Bot.

**7.2 Credential Handling.** We use your Credentials solely for the purpose of operating the Service on your behalf:
- (a) Your Bot Token is used exclusively to authenticate your Bot with Discord.
- (b) Your Anthropic API Key is used exclusively to make API calls to Anthropic on your behalf.
- (c) Your OpenAI API Key, if provided, is used exclusively to make API calls to OpenAI on your behalf.
- (d) Third-party Credentials are used exclusively to enable the specific Integration for which they were provided.

**7.3 No Credential Sharing.** We will not sell, license, or otherwise provide your Credentials to any third party except as strictly necessary to operate the Service (e.g., transmitting your Anthropic API Key to Anthropic in the course of making inference requests on your behalf).

**7.4 Your Security Obligations.** You are responsible for:
- (a) not sharing your Credentials with unauthorized parties;
- (b) rotating your Credentials promptly if you suspect they have been compromised;
- (c) monitoring for unauthorized use of your Bot Token and Anthropic API Key;
- (d) revoking OAuth tokens via the relevant Third-Party Service if you disconnect an Integration;
- (e) ensuring Credentials you provide have only the minimum necessary permissions.

**7.5 Security Incidents.** In the event of a security incident that compromises your Credentials, we will notify you without undue delay and in accordance with applicable law. You agree to cooperate with us in investigating and remediating any security incident.

---

## 8. INTELLECTUAL PROPERTY

**8.1 Our Intellectual Property.** The Service, including its software, design, text, graphics, user interface, logos, and all other content (excluding User Data), is owned by the Company or its licensors and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws. All rights not expressly granted herein are reserved.

**8.2 License to Use the Service.** Subject to your compliance with these Terms and payment of applicable fees, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal or internal business purposes during the Term.

**8.3 Restrictions.** You may not:
- (a) copy, reproduce, modify, adapt, translate, or create derivative works of the Service or any part thereof;
- (b) sell, sublicense, rent, lease, transfer, assign, or otherwise exploit the Service;
- (c) remove or obscure any copyright, trademark, or other proprietary notices;
- (d) use our trademarks, logos, or brand assets without our prior written consent.

**8.4 User Data — Your Ownership.** As between you and us, you retain all ownership rights in and to your User Data. You grant us a limited, non-exclusive, worldwide, royalty-free license to process your User Data solely for the purpose of providing the Service to you. We do not claim ownership of your Discord messages or Bot outputs.

**8.5 Feedback.** If you provide us with suggestions, ideas, enhancement requests, or other feedback about the Service ("Feedback"), you grant us an unrestricted, perpetual, irrevocable, royalty-free license to use, implement, and incorporate such Feedback into the Service without any obligation to you.

**8.6 Third-Party Software.** The Service incorporates open-source and third-party software components. Applicable licenses for such components are available upon request.

---

## 9. PRIVACY AND DATA

**9.1 Privacy Policy.** Our Privacy Policy, available at daimon.bot/privacy and incorporated herein by reference, describes how we collect, use, and share your personal information. By using the Service, you consent to our collection and use of data as described in the Privacy Policy.

**9.2 Discord Message Processing.** Your Bot processes Discord messages in your Discord Guild in order to respond to them. Message content is transmitted to Anthropic's API using your Anthropic API Key for AI inference. We do not persistently store the content of Discord messages processed by your Bot. Conversation context may be held in memory during an active session but is not written to persistent storage.

**9.3 Data Minimization.** We collect and retain only the data necessary to provide the Service. See the Privacy Policy for detailed data retention periods.

**9.4 Data Export.** You may request an export of your User Data at any time by contacting support@daimon.bot. We will provide a machine-readable export within 30 days of your request.

**9.5 Data Deletion.** Upon Account deletion, we will delete or anonymize your personal information and User Data in accordance with our data retention policy, except where we are required to retain it for legal, tax, or audit purposes.

**9.6 GDPR and Similar Laws.** If you are located in the European Economic Area, United Kingdom, or other jurisdiction with applicable data protection laws, additional rights and obligations may apply. Please see the Privacy Policy for details.

---

## 10. TERMINATION

**10.1 Termination by You.** You may terminate your use of the Service and delete your Account at any time via the Settings page. Termination does not entitle you to any refund of prepaid fees except as provided in Section 5.7.

**10.2 Termination or Suspension by Us.** We may suspend or terminate your Account or access to the Service immediately, with or without notice, if:
- (a) you materially breach these Terms and fail to cure such breach within 14 days of written notice (or immediately for breaches that cannot be cured or that involve illegal activity);
- (b) you fail to pay fees when due and fail to cure the payment failure within 14 days;
- (c) we are required to do so by applicable law or legal process;
- (d) your use of the Service causes or threatens to cause material harm to us, other users, or third parties;
- (e) your Account appears to be involved in fraudulent activity or abuse.

**10.3 Effect of Termination.** Upon termination or expiration of your Account:
- (a) your license to use the Service immediately terminates;
- (b) your Bot will disconnect from Discord and cease operating;
- (c) your Credentials stored in the Service will be deleted;
- (d) your Integrations will be disconnected;
- (e) any prepaid fees for the current Subscription Period are non-refundable, except as provided in Section 5.7;
- (f) we will retain certain data as required by law or our data retention policy, as described in the Privacy Policy.

**10.4 Survival.** The following sections survive termination: Section 1 (Definitions), Section 6 (Acceptable Use Policy), Section 8 (Intellectual Property), Section 11 (Disclaimers), Section 12 (Limitation of Liability), Section 13 (Indemnification), Section 14 (Governing Law and Dispute Resolution), and Section 17 (General Provisions).

---

## 11. DISCLAIMERS AND WARNINGS

**11.1 NO WARRANTIES.** THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING:
- (a) ANY WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT;
- (b) ANY WARRANTY THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS;
- (c) ANY WARRANTY REGARDING THE ACCURACY, COMPLETENESS, RELIABILITY, OR TIMELINESS OF CONTENT OR RESULTS PROVIDED BY THE SERVICE;
- (d) ANY WARRANTY THAT DEFECTS IN THE SERVICE WILL BE CORRECTED.

**11.2 AI OUTPUT DISCLAIMER.** THE BOT USES ARTIFICIAL INTELLIGENCE TO GENERATE RESPONSES. AI-GENERATED CONTENT MAY BE INACCURATE, INCOMPLETE, OFFENSIVE, MISLEADING, OR OTHERWISE INAPPROPRIATE. THE COMPANY MAKES NO REPRESENTATION THAT AI-GENERATED RESPONSES ARE ACCURATE, RELIABLE, OR SUITABLE FOR ANY PURPOSE. YOU ARE SOLELY RESPONSIBLE FOR REVIEWING AND VERIFYING ANY AI-GENERATED CONTENT BEFORE ACTING ON IT. AI OUTPUTS SHOULD NOT BE RELIED UPON AS A SUBSTITUTE FOR PROFESSIONAL ADVICE IN LEGAL, FINANCIAL, MEDICAL, OR OTHER REGULATED DOMAINS.

**11.3 THIRD-PARTY SERVICES.** THE SERVICE INTEGRATES WITH THIRD-PARTY SERVICES (INCLUDING DISCORD, ANTHROPIC, OPENAI, GITHUB, GOOGLE, LINEAR, AND TOGGL). WE ARE NOT RESPONSIBLE FOR THE AVAILABILITY, ACCURACY, RELIABILITY, OR CONDUCT OF THESE THIRD-PARTY SERVICES. CHANGES BY THIRD-PARTY SERVICES TO THEIR APIS, TERMS, OR POLICIES MAY AFFECT THE SERVICE WITHOUT ADVANCE NOTICE FROM US.

**11.4 DISCORD-SPECIFIC DISCLAIMER.** YOUR BOT OPERATES WITHIN DISCORD. WE ARE NOT RESPONSIBLE FOR: (a) ACTIONS TAKEN BY DISCORD, INCLUDING BANNING YOUR BOT OR SUSPENDING YOUR DISCORD ACCOUNT; (b) MESSAGES SENT OR RECEIVED IN YOUR DISCORD GUILD; (c) CONTENT MODERATION DECISIONS IN YOUR GUILD; (d) COMPLIANCE OF YOUR BOT WITH DISCORD'S TERMS OF SERVICE OR COMMUNITY GUIDELINES.

**11.5 NO PROFESSIONAL ADVICE.** Nothing in the Service or Bot outputs constitutes legal, financial, investment, tax, medical, or other professional advice. Always consult qualified professionals before making decisions in such domains.

**11.6 BETA FEATURES.** Features designated as "beta," "preview," or "experimental" are provided without any warranty and may be discontinued at any time.

---

## 12. LIMITATION OF LIABILITY

**12.1 EXCLUSION OF CONSEQUENTIAL DAMAGES.** TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL THE COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY:
- (a) INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES;
- (b) LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES;
- (c) COSTS OF SUBSTITUTE GOODS OR SERVICES;
- (d) DAMAGES ARISING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR USER DATA OR CREDENTIALS;
- (e) DAMAGES RESULTING FROM THE CONDUCT OF THIRD PARTIES OR THIRD-PARTY SERVICES;

ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

**12.2 CAP ON LIABILITY.** TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF:
- (a) THE TOTAL AMOUNT OF PLATFORM FEES YOU PAID TO US IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR
- (b) ONE HUNDRED US DOLLARS ($100.00).

**12.3 ESSENTIAL BASIS.** YOU ACKNOWLEDGE THAT THE LIMITATIONS IN THIS SECTION REFLECT AN ALLOCATION OF RISK BETWEEN THE PARTIES AND ARE AN ESSENTIAL ELEMENT OF THE BASIS OF THE BARGAIN BETWEEN THE PARTIES. THE SERVICE WOULD NOT BE PROVIDED WITHOUT THESE LIMITATIONS.

**12.4 EXCEPTIONS.** Some jurisdictions do not allow exclusion or limitation of incidental or consequential damages. In such jurisdictions, the above limitations apply to the maximum extent permitted by law.

**12.5 THIRD-PARTY COSTS.** YOU EXPRESSLY ACKNOWLEDGE THAT THE COMPANY IS NOT RESPONSIBLE FOR ANY COSTS YOU INCUR WITH ANTHROPIC, OPENAI, OR ANY OTHER THIRD-PARTY PROVIDER RESULTING FROM YOUR USE OF THE SERVICE. SUCH COSTS ARE ENTIRELY YOUR RESPONSIBILITY UNDER YOUR SEPARATE AGREEMENTS WITH THOSE PROVIDERS.

---

## 13. INDEMNIFICATION

**13.1 Your Indemnification Obligation.** You agree to defend, indemnify, and hold harmless the Company and its officers, directors, employees, agents, licensors, and service providers from and against any and all claims, damages, judgments, awards, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
- (a) your use of the Service, including your Bot's operation in your Discord Guild;
- (b) your violation of these Terms;
- (c) your violation of any applicable law or regulation;
- (d) your violation of any third-party rights, including intellectual property rights, privacy rights, or contractual rights;
- (e) your use of Credentials that you are not authorized to use;
- (f) Content processed through your Bot;
- (g) your violation of Discord's Terms of Service, Developer Terms, or Community Guidelines;
- (h) any dispute between you and any third party, including your Discord Guild members.

**13.2 Indemnification Procedure.** We will: (a) notify you promptly of any claim subject to indemnification; (b) give you control of the defense and settlement, provided that you may not settle any claim that imposes liability or obligation on us without our prior written consent; (c) provide you with reasonable cooperation, at your expense.

---

## 14. GOVERNING LAW AND DISPUTE RESOLUTION

**14.1 Governing Law.** These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States of America, without regard to its conflict of law principles. The United Nations Convention on Contracts for the International Sale of Goods does not apply to these Terms.

**14.2 Informal Resolution.** Before initiating any formal legal proceeding, you agree to first contact us at legal@daimon.bot and attempt to resolve the dispute informally. We will attempt to resolve the dispute within 60 days. If the dispute is not resolved within 60 days of your notice, either party may pursue formal resolution as described below.

**14.3 Binding Arbitration.** EXCEPT AS SET FORTH IN SECTION 14.5, ALL DISPUTES, CONTROVERSIES, OR CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE ("DISPUTES") SHALL BE RESOLVED BY BINDING INDIVIDUAL ARBITRATION ADMINISTERED BY THE AMERICAN ARBITRATION ASSOCIATION ("AAA") IN ACCORDANCE WITH ITS COMMERCIAL ARBITRATION RULES AND SUPPLEMENTARY PROCEDURES FOR CONSUMER-RELATED DISPUTES. The arbitration shall be conducted in English. The seat of arbitration shall be Wilmington, Delaware. The arbitrator's decision shall be final and binding, and judgment may be entered in any court of competent jurisdiction.

**14.4 CLASS ACTION WAIVER.** TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU WAIVE YOUR RIGHT TO PARTICIPATE IN ANY CLASS ACTION LAWSUIT, CLASS-WIDE ARBITRATION, PRIVATE ATTORNEY GENERAL ACTION, OR REPRESENTATIVE PROCEEDING AGAINST THE COMPANY. ALL DISPUTES MUST BE BROUGHT ON AN INDIVIDUAL BASIS.

**14.5 Exceptions to Arbitration.** Either party may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of intellectual property rights or confidential information, or to enforce Section 14.4. For such proceedings, you consent to the exclusive jurisdiction of the state and federal courts located in Wilmington, Delaware.

**14.6 Small Claims.** Either party may bring an individual claim in small claims court in their local jurisdiction if the claim qualifies.

**14.7 European Users.** If you are a resident of the European Union and have a complaint, you may also use the European Commission's Online Dispute Resolution platform at ec.europa.eu/consumers/odr. However, we are not obligated to use that platform to resolve disputes.

---

## 15. CHANGES TO TERMS

**15.1 Notice of Changes.** We may modify these Terms at any time. We will notify you of material changes by:
- (a) sending an email to the address associated with your Account at least 30 days before the changes take effect; and
- (b) posting a notice in the Service dashboard.

For non-material changes (such as clarifications, corrections, or changes required by law), we may provide shorter notice or no advance notice.

**15.2 Acceptance of Changes.** If you continue to use the Service after the effective date of modified Terms, you are deemed to have accepted the modified Terms. If you do not agree to the modified Terms, you must stop using the Service and delete your Account before the effective date.

**15.3 Archived Terms.** We will maintain a version history of these Terms. Prior versions are available upon request.

---

## 16. CONFIDENTIALITY

**16.1 Confidential Information.** Each party may disclose confidential information to the other party. "Confidential Information" means any information designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure. Your Confidential Information includes your Credentials. Our Confidential Information includes our non-public technical specifications, pricing strategies, and business plans.

**16.2 Obligations.** Each party agrees to: (a) protect the other party's Confidential Information with the same degree of care it uses to protect its own confidential information, but no less than reasonable care; (b) use the other party's Confidential Information only for purposes of performing obligations or exercising rights under these Terms; (c) not disclose the other party's Confidential Information to any third party except as permitted herein.

**16.3 Exceptions.** These obligations do not apply to information that: (a) is or becomes publicly known without breach of these Terms; (b) was known to the receiving party before disclosure; (c) is independently developed by the receiving party without use of the Confidential Information; (d) is received from a third party without restriction.

**16.4 Required Disclosure.** Either party may disclose Confidential Information as required by law, court order, or regulatory requirement, provided it gives the other party prompt written notice (to the extent legally permitted) and cooperates in seeking a protective order.

---

## 17. GENERAL PROVISIONS

**17.1 Entire Agreement.** These Terms, together with the Privacy Policy and any additional terms incorporated by reference herein, constitute the entire agreement between you and the Company with respect to the Service and supersede all prior and contemporaneous agreements, representations, and understandings, whether written or oral.

**17.2 Severability.** If any provision of these Terms is held to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, or if it cannot be so modified, it shall be deemed severed from these Terms, and the remaining provisions shall continue in full force and effect.

**17.3 Waiver.** Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision. Any waiver must be in writing and signed by an authorized representative of the Company to be effective.

**17.4 Assignment.** You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign our rights and obligations under these Terms without restriction, including in connection with a merger, acquisition, sale of assets, or operation of law. These Terms inure to the benefit of and are binding on any permitted assigns.

**17.5 Notices.** Legal notices to the Company must be sent to: PyMC Technologies, Inc., Attn: Legal, [REGISTERED AGENT ADDRESS TO BE INSERTED]. We may send notices to you at the email address associated with your Account.

**17.6 Electronic Communications.** You consent to receive communications from us electronically, including via email and in-dashboard notifications. You agree that these electronic communications satisfy any legal requirement that communications be in writing.

**17.7 No Third-Party Beneficiaries.** These Terms do not create any third-party beneficiary rights. Third parties may not enforce any right or obligation under these Terms.

**17.8 Force Majeure.** Neither party shall be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including acts of God, natural disasters, war, terrorism, civil unrest, government actions, Internet service disruptions, or failures of third-party infrastructure providers (including Discord, Anthropic, Supabase, or Vercel). The affected party must promptly notify the other and use reasonable efforts to mitigate the impact.

**17.9 Headings.** Section headings are for convenience only and do not affect the interpretation of these Terms.

**17.10 Language.** These Terms are written in English. Any translation is provided for convenience only. In the event of conflict between the English version and a translation, the English version controls.

**17.11 United States Export Laws.** You represent that you are not located in any country subject to U.S. government embargo or that has been designated by the U.S. government as a "terrorist supporting" country, and you are not listed on any U.S. government list of prohibited or restricted parties. You agree not to export or re-export the Service in violation of U.S. export laws.

---

## 18. CONTACT INFORMATION

If you have questions about these Terms, please contact us:

**PyMC Technologies, Inc.**
Email: legal@daimon.bot
Support: support@daimon.bot
Website: daimon.bot

For billing inquiries: billing@daimon.bot
For security reports: security@daimon.bot

---

## APPENDIX A: DISCORD DEVELOPER TERMS COMPLIANCE

Your use of the Service, including operating a Bot via Bot Token, is subject to Discord's Developer Terms of Service and Developer Policy. By using the Service, you represent that your Bot configuration and use complies with all Discord developer requirements. Key Discord requirements you must comply with include:
- Your Bot must only request the Discord Gateway intents it requires.
- Your Bot must comply with Discord's Data Deletion requests within the timeframes required by Discord.
- If your Bot reaches more than 100 Discord Guilds, additional Discord verification requirements may apply to your Discord application; these are your responsibility to fulfill.
- You must not use Bot Tokens to access Discord features in ways that violate Discord's Terms.

Failure to comply with Discord's terms may result in your Bot Token being revoked by Discord, your Discord account being suspended, or other actions by Discord outside the control of the Company.

---

## APPENDIX B: ANTHROPIC AND OPENAI TERMS COMPLIANCE

Your Anthropic API Key is governed by your agreement with Anthropic, PBC, including Anthropic's Usage Policy. Your OpenAI API Key, if provided, is governed by your agreement with OpenAI, L.L.C. You are solely responsible for compliance with those agreements. The Company is not a party to those agreements and provides no guarantee that your use of those services through Daimon will comply with their terms. AI-generated content produced by Claude (via Anthropic) or OpenAI models in response to Discord messages is subject to those providers' content policies.

---

*These Terms of Service were last updated on [INSERT LAUNCH DATE]. Version 1.0.*

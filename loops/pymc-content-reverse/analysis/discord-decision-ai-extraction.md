# Decision AI — Discord Extraction
**Sources:** #decision-ai (1329569088581927084, 2538 msgs, 2025-01-17 to 2026-03-13), #decision-web-app-dev (1388224836232413356, 2295 msgs, 2025-06-27 to 2026-03-09), #decision-ai-research (1423515862111092806, 309 msgs, 2025-10-03 to 2026-03-13)
**Extracted:** 2026-03-13

---

## 1. Product Identity

### All Names Used (Chronological Evolution)

| Period | Name(s) Used | Context |
|--------|-------------|---------|
| Jan–Mar 2025 | "MMM Agent", "MMM Insight Agent", "Insight Agent" | Original product name during early development |
| Feb 2025 | "AI MMM Agent", "GPT-Bayes prototype" | Blog post title; ChatGPT-based alpha version |
| Mar–Oct 2025 | "MMM Insight Agent", "Insight Agent" | During beta development |
| Nov 5, 2025 | "Decision Agents" (proposed) | Thomas proposes renaming: "how do people feel about renaming Insight Agents to Decision Agents? this would be an umbrella term for the various agents we're developing under the Decision.AI label (I just bought the domain, so it's our name). MMM Agent is a Decision Agent, CLV Agent is a Decision Agent etc." |
| Dec 12, 2025 | "Decision.AI", "DecisionOS", "Decision Packs" | Thomas's strategic reframing |
| Dec 2025 | "MMM Decision Agent" (internal) | Nina renames Google Drive folders |
| Jan–Feb 2026 | "Decision AI", "Decision Hub", "Decision Orchestrator", "Decision Packs" | Full ecosystem naming |
| Feb 26, 2026 | "Decision Hub" (launched) | First public component released |
| Mar 2026 | "DecisionAI CLI", "decisionai-cli" | CLI open-source release in progress |

### Official Brand Name
**Decision AI** (also written **Decision.AI**). Thomas registered the domain `decision.ai` in November 2025.

### Taglines / Slogans

- **Proposed (2026-01-14, Thomas):** "Decision.AI - Agentic Data Science You Can Trust"
  - Trust connects to: Causality, Uncertainty, Open Source, Benchmarks/evals, Governance, Labs expertise & brand
- **Halah's proposed framing (2026-02-20):** "an open-source, research-driven ecosystem for building, evaluating, and operating trustworthy AI systems that make real decisions, not just predictions."
- **Decision Hub tagline (2026-02-26, social post):** "An agent-native skill registry where skills are executable, testable, and graded. Built for teams who care about reliability, not just demos."
- **MMM Agent beta launch copy (2025-07-10):** "Tired of spending weeks building MMM models—only to argue over last year's data? Meet the MMM Agent (BETA): Built on PyMC-Marketing. Fast. Causal. Configurable."
- **MMM Agent alpha social copy (2025-02-24, Sangam):** "Meet our AI-driven MMM Agent, built on PyMC-Marketing, to reduce months-long Marketing Mix Modeling work into hours"

### Product Description (What It Does, For Whom)

**From internal strategy meeting summary (2025-11-19, Luca):**
> "The core product is an operating system that automates and enhances analytics using Bayesian techniques, starting with media mix modeling (MMM) but expanding to other enterprise areas. The team uses a 'prototype first accelerated development' strategy, building flashy demos to generate client demand before full production development. Two key product modes are being developed: Data Scientist mode (currently in beta) for model building and Stakeholder mode (MVP in development) for business decision-makers."

**From Thomas's December 2025 strategic framing:**
> "We're re-framing the skunkwork team's discord-bot into an interface-agnostic OSS 'central brain' for a business."
>
> Working names:
> - Decision.AI = the platform / ecosystem
> - DecisionOS = the open-source core orchestrator + shared memory
> - Decision Packs = specialized agent products (Deep Research, MMM, Data Cleaning, QA, …)

**From daimon bot summary (2026-03-03):**
> "Decision AI is an open-source, research-driven ecosystem for building, evaluating, and operating trustworthy AI systems that make real decisions, not just predictions. It emerged from PyMC Labs in late 2025 as an evolution of their MMM work into a broader platform for agentic data science. Three core components: Decision Packs (specialized agent products), Decision Orchestrator (the central brain/OS), and Decision Hub (a skill registry for agent capabilities)."

**Target Audiences:**
- Data scientists: ~80% reduction in manual grunt work, instant scenario analysis
- CMOs / executives: weekly budget updates instead of quarterly cycles; boardroom-ready recommendations
- Kemble's framing (2025-12-11): "Achieve the output of a 2-5 person modeling team in significantly less time, while maintaining or improving model accuracy"

### URL / Domain

- **decision.ai** — domain registered by Thomas (UTC+7) in November 2025. First mention: "I just bought the domain" (2025-11-05). Website went live 2026-02-25: "we're live: https://www.decision.ai" (Thomas)
- **hub.decision.ai** — Decision Hub web interface, live from launch 2026-02-26
- **insight-agents.pymc-labs.com** — original beta app URL (e.g., `dev.insight-agents.pymc-labs.com`, `qa.insight-agents.pymc-labs.com`)

### Relationship to PyMC Labs

Decision AI is **built by PyMC Labs** but is being positioned as a **separate brand/product ecosystem**. Not a spin-off company — it emerged from the PyMC Labs GenAI Incubator. Thomas framed it (Nov 2025) as an evolution of the internal "discord-bot" and agent work. The domain decision.ai was purchased personally by Thomas and the product launched under its own identity. Internally referenced as "Decision AI" with PyMC Labs as the builder/backer.

Key quote from Jan 2026 workshop summary: "The company targets large enterprise contracts worth 300-600K+ with goals of reaching approximately one million dollars in revenue next year. Plans include establishing a thriving open source ecosystem."

---

## 2. Features & Capabilities

### MMM Decision Agent (Core Agent — Beta as of August 2025)

Complete feature list from Discord:

**Data Handling:**
- Automated data wrangling (cleaning, transformation, normalization)
- Multi-file upload support (added Oct/Nov 2025 for Colgate)
- Support for CSV files and custom priors files
- Transformed dataset export with signed URL download links
- Data quality diagnostics and EDA plots
- Intent router (routes user requests to appropriate sub-agents)

**Modeling:**
- Automated model structure selection based on data characteristics
- Custom priors workflow: agent interviews user in plain English ("What is the lowest/highest revenue you'd expect if we turned marketing off?"), translates to PyMC parameters
- Custom adstock and saturation function selection
- Prior predictive checks before model fitting
- Choice between MAP and MCMC fitting with justification
- Time period selection and data truncation
- Control variable handling
- Seasonality (flexible components: 2–6 default range)
- Hierarchical geo dimensions (with PyMC-Marketing 0.18+ upgrade)

**Analysis & Output:**
- Model progress widget (real-time status updates)
- Contributions from each channel, control, seasonality, baseline
- Percent contribution share over time chart
- Waterfall contribution chart
- ROAS calculations with credible intervals
- Marginal and saturation curves
- MLflow artifact persistence (plots, datasets, model outputs)
- Artifact gallery with download links
- Inline code and charts in chat thread
- Code export (notebook with code interpreter output)
- Rewind to previous message in thread
- Stop/interrupt agent mid-execution

**Budget Optimization (added Oct 2025):**
- Budget optimizer agent (Carlos Sandoval, released Oct 2025)
- Monthly laydown per channel (presets or plain text)
- Budget range UI (upper/lower bounds per channel)
- Contribution breakdown showing incremental predicted return
- What-if scenario analysis (budget reallocation, channel scaling)
- Forecasting agent (planned/upcoming)

**Planned/Upcoming Features:**
- One-click summary deck generation
- Custom saturation functions
- Causal DAG definition capability
- Marimo-based stakeholder dashboard (MVP in development with Jellyfish)
- SSO integration (required for Intuit/Mailchimp)
- Fivetran data connector integration (discussed)
- Slack/Teams integration
- MCP server (Jana working on Nov/Dec 2025)
- Iterative model reruns with updated data ("monthly model reruns with updated data")
- Compare model results side-by-side

### CLV Agent (Alpha — announced Oct 2025)

- Built on PyMC-Marketing CLV models
- Automated data ingestion and cleaning
- Bayesian modeling: captures churn, repeat purchase, retention
- Segmented insights by cohort and campaign
- Summary statistics generation
- End-to-end demo completed (Colt, Sep 2025)
- Alpha announced via LinkedIn (Oct 2025)
- Use cases: marketing managers (CAC/LTV), PE analysts (portfolio health), CFOs (revenue/cash flow)

### Decision Orchestrator (OSS — planned release Feb 2026)

- Interface-agnostic "central brain" for a business
- Keeps shared, permissioned memory across interfaces
- Spawns "packs" (repo-shaped skills)
- Returns artifacts + links (notebooks, dashboards, summaries)
- Lives where work happens: Discord/Slack/Teams/CLI/Cursor/Web
- GitHub repo: `github.com/pymc-labs/decision-orchestrator`
- Open-source; contribution guide exists
- Team: Carlos Sandoval (lead), Gregor Sprick (contributor), Derick Wells (contributor)

### Decision Hub (OSS — launched Feb 26, 2026)

See Section 3 for full details.

### Deep Research Agent / Deep Agent

- Separate from the web UI agent
- Runs via CLI and Discord bot interface
- Ben Maier's work; GitHub: `github.com/pymc-labs/decisionai-opencode`
- MMM flavor: `decisionai-opencode/flavors/mmm`
- Poetry agent (minimal demo): `decisionai-opencode/flavors/poem`
- Used for Coke/Colgate demos
- "Ben's Deep Agent testing on synthetic datasets shows promising results with skills proving effective, while vanilla Claude without skills performs poorly"

---

## 3. Decision Hub — The OSS Skills Registry

### What Is Decision Hub vs Decision AI?

**Decision AI** = the full ecosystem/platform/brand.
**Decision Hub** = the first open-source component of Decision AI, released Feb 26, 2026. It is the skill registry and distribution system for agents.

Halah's positioning (2026-02-20): "an infrastructure layer and a skill registry for data science agents."

### hub.decision.ai — What It Is

The web interface for Decision Hub, live at https://hub.decision.ai/. Launched Feb 26, 2026 alongside the GitHub repo.

**Key milestone:** 1,000 downloads since launch (within ~3 days of release), then 1,463 downloads shortly after (reported 2026-03-04).

### Skills Framework — What Are "Skills"?

From Thomas (2025-12-16, Titi): "I think nowadays with Skills it is much more practical to introduce the whole framework, with progressive levels of depth as needed."

From the Decision Hub description (2026-02-20, Halah): "Instead of relying on fragile text instructions, Decision Hub treats agent skills as real executables (complete with code, environments, and dependencies) that are systematically tested and graded."

Luca's Feb 12, 2026 release notes for dhub:
- Skills are automatically classified into categories (e.g., "Data Science & Statistics", "Content & Writing") using Gemini LLM analysis of SKILL.md
- Private skills: publish org-private skills with `dhub publish --private`
- Auto-republish trackers: poll GitHub repos for new commits, auto-republish on changes
- CLI: `dhub list`, `dhub search`, `dhub ask --category`, `dhub info`, `dhub publish`, `dhub visibility`
- Version: bumped to 0.9.0 at Feb 12 release

From Carlos Trujillo's research (2026-02-23): The framework evaluates "How well does the agent perform, relative to a skill-less agent, if it selects the correct skill?" and uses Dirichlet-Categorical model to account for skill selection errors.

### GitHub Repo Details

- **Decision Hub:** https://github.com/pymc-labs/decision-hub (made public Feb 26, 2026)
- **Decision Orchestrator:** https://github.com/pymc-labs/decision-orchestrator
- **Decision AI Agents:** https://github.com/pymc-labs/decision-ai-agents (created Dec 11, 2025)
- **Decision AI Web App:** https://github.com/pymc-labs/decision-ai-web-app
- **Decision AI Compute Platform:** https://github.com/pymc-labs/decision-ai-compute-platform
- **Decision Web Dev Harness:** https://github.com/pymc-labs/decision-web-dev-harness
- **DecisionAI OpenCode (deep agent):** https://github.com/pymc-labs/decisionai-opencode
- **Insight Agents (original beta):** https://github.com/pymc-labs/insight-agents

### Comparison to npm / Package Manager Analogy

Carlos Trujillo (2026-02-23): "If we could add an infinite number of skills to our agent, why not simply clone the entire decision hub locally and let the agent choose any of them? Why bother in selection (Understanding that skills are not loaded in context immediately, so having a million skills don't fill your context)."

Thomas (2025-11-25): The vision is that "All our existing tools (MMM, Composio, finance, internal configs) become MCP servers" and "Our current surfaces (Discord, Marimo, Notion, Cursor) all talk to that agent."

---

## 4. Pricing & Business Model

### Confirmed Pricing Structures

**MMM Agent Beta Pilot (Colgate, July 2025):**
> "They are interested in being part of Beta testing the agent and willing to pay for a short 1-2 week trial (2k for a week, 4k for 2 weeks)." — Andy Heusser, 2025-07-02

**Professional Tier / Exclusive Access Agreement (Kemble, Oct 17, 2025):**
> "Monthly Coaching Services Fee: $8,000, due on the first day of each monthly term. Additional Expert Hours: Any consultation beyond the included four (4) hours per month will be invoiced monthly at $350/hour."
>
> Includes: Live Expert Sessions (4 hrs/mo), Code Reviews, Direct Expert Access via private Discord, Guaranteed early access to BETA and pre-release versions, MMM agent roadmap visibility and input.

**Databricks Demo Pricing (quoted during Databricks call, Sep 30, 2025):**
> "The platform offers two pricing tiers: $50,000 monthly for dedicated data scientist support or $7,500 monthly for expert access support with 4 hours of meetings and reduced consulting rates."

**Thomas's August 2025 Pricing Framework:**

```
1. MMM Agent Platform (SaaS SKU): $50–100k/yr
   - Deployment + governance, model containerization, monitoring

2. Services SOWs (hundreds of $k):
   - MMM Pack Pilot: $200–500k
   - Expert Access Program: $50–150k
   - Custom Pack Development: $100–400k each

3. Year 2+ Transition:
   - SaaS platform remains constant ($50k/yr baseline)
```

**Initial sale pricing for Data Scientist Mode:**
> "The team agreed that for the initial sale opportunity, margin was not our main focus and simply adoption + development were. $50K base price per Andy and Luca w/ variable costs TBD." — Kemble (2025-04-09)

**Intuit/Mailchimp Contract (Nov 2025):**
- 1-year contract with automatic renewal
- SSO integration required (target start date Dec 1, 2025)
- SLA requirements negotiated
- Full year agreement confirmed (Kemble, Nov 3, 2025)

**Stella Competitor Benchmark (August 2025, Kemble):**
> Stella (competing MMM SaaS): $2,000/month basic, ~$12,000/month bespoke package (dedicated account, custom domain). PyMC Labs positioned above this.

**Colgate Contract Documents (signed Aug 2025):**
- SOW 4 + Addendum for MMM AI Agent
- MNDA between Colgate and PyMC OÜ
- TPA with Nielsen (Third Party Access Agreement)
- Data Use Agreement with Nielsen (pending as of Aug 2025)

**Pricing Strategy Discussion (March 2025):**
- Thomas (2025-02-26): "yesterday I was talking with Luca about how we might get some financial support for developing this. one idea I kinda like is to ask everyone who expressed interest to pay us $10k and they get a front-row seat and are the first to be able to use this functionality and have it be developed with their use-case in mind"
- Jana (2025-03-31): "agents would be priced per work done instead of monthly / user seat-based pricing" — referenced paid.ai platform
- Thomas (2025-03-08): "perhaps that's the 'pro' feature. the Bayesian models are open source, the LLM-interface with cloud-execution costs $$$ (metered by model runs or something)"
- Andy (2025-04-04): "if equipped with some more UI & tools, an outcome based pricing for a fitted model on custom data would actually be a valid value proposal for a MMM Insight Agent"

**Two Offering Types (as of late 2025):**
1. **Subscription/EAP** — monthly SaaS access + expert coaching
2. **Custom Agent Development** — fixed cost custom build (Colgate interest), client retains specific deployment

**Revenue Model:**
- SaaS fees: $10–15k monthly (stated in Nov 2025 strategy meeting)
- Implementation services: few hundred thousand dollars per engagement
- Custom build: fixed cost
- Optional: agency white-label/certified partner program (mentioned Aug 2025)

**Target Revenue:**
- "approximately one million dollars in revenue next year" (from Jan 2026 workshop summary)
- Major targets: Service Plan/BMW (~$700k budget), Colgate (~$500k), Nomad (~$700k) — from Nov 2025 strategy meeting

---

## 5. Customer Validation & Use Cases

### Named Clients/Prospects with Status

| Client | Status | Details |
|--------|--------|---------|
| **Colgate-Palmolive** | Active paying client | MMM AI Agent Pilot contract signed Aug 2025 (SOW 4 + Addendum). Barnava Nandi = contact. 5 sub-brands: Luminous White, Total 12, Triple Action, Colgate Others, LMIX. 2 datasets: 25k rows sales, 75k rows media, 101 weeks. Model issues with metric mixing (GRPs vs impressions). Active pilot with multiple check-ins. Discussed custom build for 2026. |
| **Fox Entertainment** | Beta tester (Phase 1) | Eugene Kwok (SVP Analytics) contact. Onboarded Aug 1, 2025. Fox1 account active (8 chat threads, 3 on Fox2). Fox SVP of Research and others also interested. Kemble managing. Additional interest in Synthetic Consumers for TV show creative/thumbnail testing. |
| **Bain & Company** | Multiple engagements | Shipra Arora (contact). Deep research agent demoed to senior Bain partners (Coke pitch Dec 2025, potential $3M RFP). Multiple team members on various Bain projects. |
| **Intuit / Mailchimp** | Contract in negotiation (as of Nov 2025) | Procurement process underway. Full 1-year contract + auto-renewal. SSO required. Target start Dec 1, 2025. 100 pages of legal docs. |
| **Databricks** | Demo done, stalled on IP (Nov 2025) | Anoop Muraleedharan (contact). Q4 paid media use case (LinkedIn, Google, social). Budget approval needed. Two pricing tiers quoted: $50k/mo dedicated, $7.5k/mo EAP. Existing partner relationship. Stalled on IP concerns. |
| **HelloFresh** | MMM agent EAP starting Jan 2026 | Contact: Dovas Zakas. Custom build interest. |
| **Life360** | MMM agent EAP starting Jan 2026 | Contact: Disen Liu, Jeffrey Goulette. Beta subscription with weekly calls. Signed. |
| **Seeda.io** | Beta testing, ongoing discussions | MMM consultancy for $10MM+ rev SMBs. Looking for "client-facing" solution for their clients. Not perfect fit currently. Founder: discussed in June 2025. |
| **Swisscard** | Prospect (interested, contract not signed) | Individual contributor initially reached out. Executive Dir of Analytics also engaged. Scheduling demo for Jan 2026. |
| **BMW / Service Plan / House of Communication** | Contract negotiation (BMW delayed to April 2026) | ~$700k budget. Workshop planned Mar 23 for BMW/TME scope. |
| **QXO** | Beta tester (Phase 1) | Onboarded Aug 1, 2025. Logged in but few threads created. Access revoked Oct 6, 2025. |
| **Ovative Group** | Beta tester (Phase 2, Aug 2025) | MMM consulting firm, 2 logins. |
| **Ionos** | Beta tester (Phase 2, Aug 2025) | ISP/Cloud provider (Germany), 2 logins. |
| **Game Data Pros** | Beta tester (Phase 2, Aug 2025) | Gaming consultant, 2 logins. Access revoked Oct 6, 2025. |
| **Publicis** | Beta tester | Access revoked Oct 6, 2025. |
| **DPG** | Beta tester | Access revoked Oct 6, 2025. |
| **Consumer Edge** | Lead (checking budget, Feb 2026) | Entering legal review phase. |
| **Baltimore Medical Center** | Lead (entering legal review, Feb 2026) | |
| **PwC / Coke** | Pilot chat-based approach (Niall's contacts, Mar 2025) | Not MMM specifically. |
| **Spring & Bond** | Agency reviewing MSA (Aug 2025) | Via Niall. |

### Testimonials / Quotes from Users

**Swisscard tester (Sep 12, 2025), via Kemble:**
> "The issue I previously encountered is now resolved. I was able to successfully go through the entire workflow... The interpretation and model analysis features are particularly helpful. The agent guides me through each step and provides detailed explanations. **I've discovered insights I had previously missed when analyzing the model results on my own.**"

**CPG startup founder (former McKinsey consumer insights lead), May 13, 2025, Nina's summary:**
> Demo call for AI Innovation Lab. "He strongly validated the idea that CPGs—whether startups or big brands—don't test or validate product ideas anywhere close to often enough." Asked about data, suggested making the product modular.

**External (Luca's voice note transcript, May 4, 2025):**
> "This is super interesting, extremely relevant and extremely needed in the CPG space. I think it has so many different legs, so many different applications in terms of like business size, partnership with both retailers and big companies, small companies, mid sized companies... time and money are kind of the biggest constraints. And having an end to end platform that does this, and it was super simply explained, is really needed."

**Thomas on Colgate demo (Jan 24, 2025):**
> "we actually demoed the GPTs MMM bot yesterday to Colgate and it played really well"

**Rachel Ni (inbound email, May 7, 2025):**
> "I'm interested in the AI MMM agent, how can I try the chatbot?"
> (Thomas: "let's ignore this one" — team was managing demand)

### Beta/Pilot Outcomes

**Colgate (Aug–Oct 2025 pilot):**
- Model fitting issues identified early (metric mixing, control variable correlation problems)
- Significant data preprocessing needed (impressions vs GRPs, price per unit normalization, 4-6 seasonality components)
- Weekly/bi-weekly check-ins established
- Colgate engaged and providing detailed feedback
- Custom build discussions for 2026

**Fox Entertainment (Aug 2025 beta):**
- Fox1 created 8 chat threads, Fox2 created 3
- QXO logged in but minimal usage

**Beta program statistics:**
- 20 requests to beta targeted before first review (from Jul 17, 2025 message)
- "Last cohort onboarding next week" (Aug 27, 2025, Nina)
- Beta winding down Oct 2025 (access revocations)

---

## 6. Technical Stack

### Infrastructure

- **Cloud:** Google Cloud Platform (GCP)
- **Container orchestration:** Kubernetes (k8s)
- **Agent service:** Deployment (not StatefulSet per Andy's recommendation, June 2025)
- **Database:** PostgreSQL (LangGraph checkpointer, AsyncPostgresSaver for conversation history)
- **Model artifacts:** Google Cloud Bucket (60-day auto-deletion policy)
- **Cache:** Redis (1-hour TTL)
- **Code interpreter:** E2B sandboxes (Modal evaluated but rejected — no BYOI support for enterprise)
  - E2B pricing: hobby plan → Pro ($150/mo, 100 concurrent sandbox limit)
  - pymc-marketing installed in E2B sandbox
- **MLflow:** Artifact tracking (plots, model parameters); originally local DB, migrating to managed
- **Analytics:** PostHog (user behavior, session replays, custom events, surveys; Jana added Jul 2025)
- **Observability:** LangSmith (evals, feedback); Arize Phoenix considered
- **Auth:** JWT; SSO planned (required for Intuit)
- **Frontend hosting:** GCP Cloud Run (model fitting), Kubernetes
- **CI/CD:** GitHub Actions

### Agent Framework

- **Primary:** LangGraph (supervisor + task-specific agents pattern)
- Andy (2025-02-11): "creating a directed graph is currently the best way to architect reliable agents"
- Supervisor orchestrates: Data Explorer, Data Cleaner, Model Fitter, Model Analyzer, Budget Optimizer, Custom Priors agents
- Conversation history persisted in PostgreSQL via LangGraph checkpointer
- Tool calling for code execution, plot generation

### AI Models Used

- **Primary:** GPT-4o (current production)
- **Tested:** GPT-5 (much more verbose and autonomous, needs prompt revision)
- **Code interpreter:** E2B sandboxes with pymc-marketing installed
- **Image generation:** FLUX (Schnell, Dev, Pro variants), GPT-4o for images

### Key Libraries

- **PyMC Marketing** (core MMM library; migrating from 0.17.1 → 0.18 → 1.0)
- **PyMC** (MCMC sampling)
- **Arviz** (diagnostics)
- **LangGraph** (agent orchestration)
- **LangSmith** (evals)
- **Marimo** (notebook interface for stakeholder mode — MVP)
- **Polars** (data processing)
- **Plotly** (interactive visualizations for stakeholder dashboard)
- **DSPy** (prompt optimization, discussed)
- **Preliz** (prior elicitation)

### New MVP Architecture (late 2025 / 2026)

The MVP (stakeholder mode) is being built with **Jellyfish** (an external dev agency) handling the frontend/peripheral systems. Architecture:

1. **Decision AI Compute Platform** — spins up Marimo notebook containers
2. **Decision AI Agents** — LangGraph-based agents with API access to notebooks
3. **Decision AI Web App** (Jellyfish) — frontend + auth + projects area + dashboard/insights
4. **Decision Web Dev Harness** — integration harness tying all components together

Sprint plan: Auth/user management → Projects/datasets → Dashboard/insights → Polish/deployment

### Decision Orchestrator Technical Details

- Interface-agnostic OSS "central brain"
- Decoupled from PyMC-specific code (planned)
- MCP (Model Context Protocol) servers for all integrations
- Discord, Marimo, Notion, Cursor all as surfaces talking to single agent
- Carlos Sandoval (lead developer), Gregor Sprick (contributor)

---

## 7. Roadmap

### Phase Timeline (from messages)

**January 2025 — Project Start:**
- Workshop at PyMC Labs (Jan 17–18)
- Two workstreams defined: MMM Insight Agent + AI Innovation Lab
- Presentation to Thomas Wiecki (Jan 20)

**February 2025:**
- GPT-Bayes alpha prototype cleaned up by Andy, demoing to clients
- Blog post published: "The AI MMM Agent" (Feb 24, 2025)
- Social media announcements go out

**March 2025:**
- Insight Agent backend wired up with LangGraph (Andy, Mar 7)
- E2B sandbox integration

**April 2025:**
- Product roadmap + beta version release discussions
- $50k base price established
- Beta access email going out end of April / early May

**May–June 2025:**
- Internal stress testing
- Databricks conference (June 11) — open-source Databricks agent released
- Webinar (June 16–21) — Andy presenting
- **Public Beta launch target: June 2025** (actual launch: July 14, 2025 attempt, then Aug 1, 2025 actual)

**July 2025:**
- Beta accepted applications (BETA email: mmm-agent-beta@pymc-labs.com)
- Phase 1 beta testers onboarded Aug 1: Colgate, Fox Entertainment, QXO
- Phase 2 testers: Ionos, Ovative Group, Game Data Pros (Aug 18)

**August 2025:**
- Colgate pilot formally started (contract signed Aug 4)
- Core features: Custom priors, budget optimizer, rewind, code export
- CLV Agent development begins (Colt)

**September 2025:**
- Budget optimizer released
- Custom priors workflow released
- New UI mockup (Jana) discussed with Colgate
- CLV agent end-to-end demo completed
- Beta wind-down signals begin

**October 2025:**
- Budget optimizer and improved plots released
- CLV Agent alpha announced via LinkedIn
- Nov 5: Thomas proposes "Decision Agents" umbrella renaming and registers decision.ai domain

**November 2025:**
- Decision AI strategy solidified
- Jellyfish engaged for MVP frontend
- Multiple contracts in legal review (Intuit, Databricks, BMW, etc.)
- Beta paused/wound down for most users

**December 2025:**
- Deep agent demo for Coke stakeholders (Dec 4, Brussels, $3M RFP potential)
- Decision AI architecture repos created (decision-ai-agents, decision-web-dev-harness)
- Marimo POC by TT for stakeholder mode

**January 2026:**
- Joint workshop: MMM agent web UI team (Andy) + Decision Orchestrator team (Carlos)
- HelloFresh, Life360 EAP starting
- BMW delayed to April
- End-to-end integration achieved (Jan 12 meeting summary)

**February 2026:**
- **Decision Hub launched** (Feb 26, 2026) — first public OSS release
  - GitHub: https://github.com/pymc-labs/decision-hub
  - 1,000+ downloads within ~3 days
  - CLI: pip installable, dhub commands
- **decision.ai website launched** (Feb 25, 2026)
- MMM agent CLI open-source preparation underway (delayed from webinar timing)
- Webinar on agentic AI held (Feb 25, ~64 signups, Schwab registered)
- 60% email open rate on webinar follow-up

**March 2026 (current):**
- Decision AI CLI open-source launch (in progress — needs polishing)
- BMW/TME workshop planned Mar 23
- BCG/Emirates demo planned week of March 16 or after
- DW project (new) starting April
- Agentic AI Data Science course launching May

### Planned Releases (as of Feb 2026 strategic meeting)
1. ~~Decision Hub~~ ✅ (Feb 26)
2. MMM Agent CLI (delayed a couple weeks from webinar)
3. Decision Orchestrator (2-3 weeks after MMM agent to avoid market confusion)

---

## 8. Team

### Core Decision AI / GenAI Incubator Team

| Name | Role | Key Contributions |
|------|------|------------------|
| **Thomas Wiecki** (Thomas, UTC+7) | PyMC Labs founder, strategic direction | Vision setting, client pitches (Bain, Coke), domain purchase, architecture framing |
| **Luca Fiaschi** (Luca) | Product lead, data science | Product strategy, client relationships (Colgate, Databricks), blog posts, Databricks conference talk |
| **Nina Rismal** (Nina) | Project/program manager, marketing | Meeting coordination, action items, white papers, synthetic consumers lead |
| **Andy Heusser** (Andy) | Lead engineer — MMM agent web app | Architecture, LangGraph, E2B integration, eval framework, sprint leading |
| **Kemble Fletcher** (ID: 1224944985900716086) | Sales, GTM, customer success | Sales strategy, beta management, client onboarding, pricing docs |
| **Chris Krempel** (ID: 468407102306648076) | Backend engineer — AI Innovation Lab | Backend architecture, GCP deployment, Innovation Lab backend |
| **Jana Bergant** (Jana) | Frontend engineer, UX | UI iterations, MCP server, stakeholder mode agent |
| **Allen Downey** | Research — synthetic consumers, benchmarks | GSS experiments, Price is Right benchmark, validation studies |
| **Titi Alailima** (Titi, UTC-4) | Full-stack engineer | E2B/Modal eval, PyMC Marketing migration, Marimo POC, stakeholder mode |
| **Carlos Sandoval** (Daniel Cavadia alt?) | Decision Orchestrator lead | Budget optimizer, skills framework research, CausalPy skills |
| **Ben Maier** | Deep Agent / OSS | MMM CLI, deep agent benchmark, Colgate synthetic consumer paper |
| **Sangam Swadi K** (sangam) | Marketing / content | Social media posts, newsletter, content scheduling |
| **Halah (Joseph)** | Marketing strategy | MMM launch strategy, CLV marketing, content A/B testing |
| **Evan (UTC -5)** (Evan) | Sales support | Partner outreach, client communications |
| **Imri Sofer** | Agent engineering | Budget optimizer, supervisor/sub-agent architecture |
| **Maxim** (ID: 826158979738632244) | Research — causal discovery | Causal graph agent, spurious connection removal via LLMs |
| **Colt Allen** (Colt, UTC-7) | CLV Agent development | End-to-end CLV agent demo, Python source code modification |
| **Juan Orduz** | Advisory/engineering | PyMC Marketing migration, MMM business questions, Decision Orchestrator R&D |
| **Kusti Skytén** | MCP development | PyMC Marketing MCP documentation server |
| **Carlos Trujillo** (UTC+3) | Research — skills evaluation | Dirichlet-Categorical skill selection model, CausalPy skills |
| **Stephan Mai** | Contributor | Various |
| **Derick Wells** | Decision Orchestrator contributor | Contribution guide |
| **Jellyfish** | External dev agency | MVP frontend (stakeholder mode web app), authentication system |

---

## 9. Marketing & Go-to-Market

### Launch Strategy (as documented)

**Alpha Phase (Jan–Feb 2025):**
- GPT-based chatbot demo (ChatGPT GPT: `chatgpt.com/g/g-67927a520a9481919cc163eb51bf1a3d-mmm-agent-alpha-2-0`)
- Demo video released (Synthesia)
- Blog post: "The AI MMM Agent: An AI-Powered Shortcut to Bayesian Marketing Mix Insights" (pymc-labs.com, Feb 24, 2025)

**Beta Launch (July 14 attempt, Aug 1, 2025 actual):**
- LinkedIn, Bluesky, X posts (8:30 AM ET)
- Email to alpha testers (mmm-agent-beta@pymc-labs.com)
- Beta application form
- Staggered onboarding (priority: Colgate, Fox, then others)
- Demo videos (Synthesia, 1:43 to 5 min versions)

**Decision Hub Launch (Feb 26, 2026):**
- GitHub repo open-sourced: https://github.com/pymc-labs/decision-hub
- Social posts (LinkedIn, X, Bluesky) on Feb 26
- Webinar tie-in (Feb 25 webinar)
- NumFocus advertising to 80,000-person newsletter
- 1,000+ downloads in first ~3 days

### Target Customer Profile

From Kemble (Dec 11, 2025):
> "This product is being built for (those most likely to directly purchase): Managers/Decision Makers (up to C suite) specifically for data science and analytics teams, and possibly non-technical decision makers (TBD)."

From Halah (June 11, 2025, MMM agent):
- Version A → Execs and CMOs: high-level, outcome-driven (ROI, speed to insight, competitive advantage)
- Version B → Data scientists/technical teams: carousels, product features (priors, adstock handling, automation)

Target industries: CPG brands, media companies, entertainment companies, consulting firms (Bain, PwC), marketing agencies, financial services

### Competitive Positioning

**Stella (direct competitor):**
- $2k/month basic, $12k/month bespoke
- Built on PyMC MMM originally, now different package
- Weekly time series only; no model customization
- Budget optimization but limited configuration
- PyMC Labs differentiators: full model customization, Bayesian expertise, causal approach, custom priors, data scientist mode + stakeholder mode, support/expert access

**Key differentiation from generic AI tools:**
- "Causality (grounding LLMs)" — builds causal DAGs, not just correlations
- "Uncertainty quantification" — Bayesian credible intervals, not point estimates
- "Open Source transparency" — decision hub, orchestrator, PyMC Marketing
- "Benchmarks/evals/guarantees" — quantified performance
- Trust as central brand pillar (Thomas: "trust is the thing everyone will look for as today anyone can claim they can do agentic data science, but few can do so credibly")

### Marketing Copy (Verbatim)

**LinkedIn post for Decision Hub launch (sangam, Feb 26, 2026):**
> "Right now, most agentic AI optimizes for capability demos, not decision quality. When applied to complex, high-stakes data science, these systems break down. They lack statistical rigor, human-in-the-loop planning, and the strict validation required to ensure an agent isn't just generating an output, but making a trustworthy decision.
>
> That is why we built Decision AI: our open-source, research-driven ecosystem for building, evaluating, and operating AI systems that make real decisions, not just predictions. It combines agentic data science, rigorous evaluation, and orchestration to help teams move from experiments to production systems they can actually trust.
>
> We are revealing this ecosystem layer by layer over the coming weeks. Today, we are excited to release our first component: Decision Hub."

**X/Bluesky for Decision Hub (2026-02-26):**
> "Introducing Decision Hub: An agent-native skill registry where skills are executable, testable, and graded. Built for teams who care about reliability, not just demos."

**MMM Agent BETA launch social (July 10, 2025, Halah):**
> "Tired of spending weeks building MMM models—only to argue over last year's data? Meet the MMM Agent (BETA): Built on PyMC-Marketing. Fast. Causal. Configurable. Inline charts, budget scoring, MLflow built-in. DM or email: mmm-agent-beta@pymc-labs.com"

**MMM Agent alpha announcement (Feb 24, 2025, sangam):**
> "Meet our AI-driven MMM Agent, built on PyMC-Marketing, to reduce months-long Marketing Mix Modeling work into hours ⏳ eliminating messy data prep, guesswork on adstock decays, and stale insights that arrive too late."

---

## 10. Key Quotes (Verbatim with Attribution and Date)

### Product Vision

**Thomas Wiecki, 2025-09-24 (#decision-ai):**
> "I believe ultimately the value of decision.ai will not be the platform or the UX, but the agents. The agents do the actual work and are the container for all of our work: pymc-marketing, custom models, synthetic consumers, innovation lab, data cleaning. Once agents can reliably run and analyze the outputs and extract insights, the packaging I think is secondary (still very important of course)."

**Thomas Wiecki, 2026-01-14 (#decision-ai):**
> "As a slogan, how about: 'Decision.AI - Agentic Data Science You Can Trust' where trust connects to: Causality (grounding LLMs), Uncertainty (quantify output uncertainty), Open Source (transparency), Benchmarks/evals/guarantees (quantify performance), Governance (track-record, permissions), Our own expertise & brand. I believe trust is the thing everyone will look for as today anyone can claim they can do agentic data science, but few can do so credibly."

**Thomas Wiecki, 2025-11-05 (#decision-ai):**
> "@here how do people feel about renaming Insight Agents to Decision Agents? this would be an umbrella term for the various agents we're developing under the Decision.AI label (I just bought the domain, so it's our name). MMM Agent is a Decision Agent, CLV Agent is a Decision Agent etc."

**Thomas Wiecki, 2025-11-25 (#decision-ai):**
> "We already have all the components of Decision.AI in place across the company—Discord workflows, Marimo notebooks, Claude interfaces, Composio integrations, MMM tools, finance automations, and our internal dashboards. The next step is to connect these pieces into one coherent system using MCP. One shared agent service becomes the brain. All our existing tools become MCP servers. Our current surfaces all talk to that agent. This is not a new project; it's a consolidation of what we already do."

**Thomas Wiecki, 2025-12-12 (#decision-ai):**
> "Had a great chat with Luca yesterday: We're re-framing the skunkwork team's discord-bot into an interface-agnostic OSS 'central brain' for a business."

**Luca Fiaschi, 2025-11-19 (strategy meeting summary):**
> "The core product is an operating system that automates and enhances analytics using Bayesian techniques, starting with MMM but expanding to other enterprise areas."

**Andy Heusser, 2026-01-12 (#decision-ai):**
> "Partly inspired by the story of Claude Code, in 2026 I'm really interested in exploring how we can use the decision ai platform as a productivity tool for labs team members and realize meaningful efficiency gains that translate to fewer billed hours on a project and larger bonuses. Even without selling the platform to a single external client this could change the game for us, enabling our teams to be more efficient at building models, support more clients, take on more work with the same resources."

### Customer Reactions

**Swisscard tester, Sep 12, 2025 (via Kemble):**
> "The issue I previously encountered is now resolved. I was able to successfully go through the entire workflow... The interpretation and model analysis features are particularly helpful. The agent guides me through each step and provides detailed explanations. I've discovered insights I had previously missed when analyzing the model results on my own."

**CPG voice note (anonymous founder, May 4, 2025):**
> "This is super interesting, extremely relevant and extremely needed in the CPG space... time and money are kind of the biggest constraints. And having an end to end platform that does this, and it was super simply explained, is really needed."

**Eugene Kwok, Fox Entertainment (Oct 16, 2025, via Kemble):**
> "Eugene reached out and said we hit the mark, and there were several additional conversations around this topic." [Re: Fox Entertainment executive presentation]

### Team Describing the Product

**Halah Joseph, 2026-02-20 (Decision AI positioning copy):**
> "Right now, most agentic AI optimizes for capability demos, not decision quality. When applied to complex, high-stakes data science, these systems break down. They lack statistical rigor, human-in-the-loop planning, and the strict validation required to ensure an agent isn't just generating an output, but making a trustworthy decision. That is why we built Decision AI."

**Luca Fiaschi, 2025-05-31 (#decision-ai):**
> "Among those [AI enterprise primitives] is (i) data analysis and (ii) strategy. I find particularly interesting the picture they paint for future applications of strategy: where they argue there will be soon agents able to simulate consumer behaviors or run enterprise functions (a virtual COO). Sounds familiar?"

**Thomas Wiecki, 2025-06-23 (#decision-ai):**
> "one cool use-case I think will also be monthly model reruns with updated data. this usually takes data teams a while: is the new data clean? how do the results differ? why do they differ? what should we do about it?"

**Andy Heusser, 2025-03-07 (#decision-ai):**
> "Status update: i've got the mmm insight agent backend wired up with langgraph. there is a supervisor with a bunch of task-specific agents to execute each part of the workflow and they all have a first draft prompt that we can tune. some agents have access to a code interpreter which is an e2b sandbox with pymc-marketing installed."

**Daimon bot, 2026-03-03 (#decision-ai, executive summary):**
> "Decision AI is an open-source, research-driven ecosystem for building, evaluating, and operating trustworthy AI systems that make real decisions, not just predictions. It emerged from PyMC Labs in late 2025 as an evolution of their MMM work into a broader platform for agentic data science."

**Ben Maier, 2026-02-17 (#decision-ai-research):**
> "I've been much slower than I liked in migrating the mmm agent to a deep-agent workflow... the CLI only works if the 'decisionAI-opencode' CLI is released with it. And that one has never been properly reviewed by anyone."

### Pull-Quote Worthy

**Thomas Wiecki, 2025-03-08 (#decision-ai):**
> "perhaps that's the 'pro' feature. the Bayesian models are open source, the LLM-interface with cloud-execution costs $$$ (metered by model runs or something). Similar to the classic model where the nice GUI is only part of the pro version, just that GUI → LLM"

**Luca Fiaschi, 2026-03-01 (#decision-ai):**
> "Crossed 1k downloads on Decision Hub since launch!"

**Luca Fiaschi, 2025-06-26 (#decision-ai):**
> "The ultimate goal is not just to generate DAGs, but to empower LLMs to actively research and structure domain knowledge, helping overcome limitations like missing data, functional complexity, and noisy observational settings."

**Thomas Wiecki, 2026-02-26 (#decision-ai-research):**
> "have we thought of what role the DAG plays in the analysis and how to get it? My understanding is that currently we try to infer that from the data alone. But we could let the agent act as a Socratic interviewer with the user. Instead of blindly assuming ad spend drives sales, the agent would collaborate with the domain expert to map out confounders... By forcing the agent and the user to co-create and validate the causal DAG first, we guarantee that the resulting Bayesian model reflects actual business mechanics, cementing our 'Trust' framework and completely separating us from generic AI wrappers."

---

## 11. Additional Key Facts

### GitHub Repositories Summary

| Repo | Purpose | Visibility |
|------|---------|-----------|
| `pymc-labs/decision-hub` | Skill registry CLI + API | Public (Feb 26, 2026) |
| `pymc-labs/decision-orchestrator` | Central brain OSS | Public (planned) |
| `pymc-labs/decision-ai-agents` | LangGraph agent code | Internal (as of Dec 2025) |
| `pymc-labs/decision-ai-web-app` | Jellyfish frontend | Internal |
| `pymc-labs/decision-ai-compute-platform` | Marimo notebook containers | Internal |
| `pymc-labs/decision-web-dev-harness` | Integration harness | Internal |
| `pymc-labs/decisionai-opencode` | Deep agent / CLI | Partially public (OSS in progress) |
| `pymc-labs/insight-agents` | Original beta web app | Internal |
| `pymc-labs/llm-innovation-lab` | AI Innovation Lab monorepo | Internal |

### Decision Hub Release Notes (Feb 9–11, 2026, Luca)

- Skills auto-classified into categories via Gemini LLM analysis of SKILL.md
- Private skills: `dhub publish --private`
- Auto-republish trackers for GitHub repos (SHA comparison, auto-republish on new commits)
- Public org profiles with GitHub metadata
- Pagination
- Ask endpoint: opinionated multi-turn ask with structured comparison responses, license data, 5 latency optimizations
- Security hardening: revoked anon/authenticated DB grants, idle transaction timeout, PgBouncer
- CLI version 0.9.0

### Related Products (Same Incubator)

- **AI Innovation Lab** — CPG product development platform (synthetic consumers + agentic workflows)
- **CLV Agent** — Customer Lifetime Value modeling agent (Alpha Oct 2025)
- **CausalPy Skills** — CausalPy integrated with Decision Hub / skills framework (Carlos Trujillo + Jana, Nov 2025)
- **LLM Price is Right Benchmark** — LLM pricing benchmark (Allen Downey + Maxim; website: `benchmark/LLMPriceIsRight` on pymc-labs.com)
- **PyMC Marketing MCP Server** — MCP documentation server for PyMC Marketing (Kusti Skytén)

---

## 12. Gaps / Open Questions

- Exact MSA terms for Intuit contract (100 pages reviewed but not fully captured)
- Final pricing card as of early 2026 (updates referenced but docs not captured)
- Full MMM Agent CLI feature list (OSS release pending as of March 2026)
- Decision Orchestrator architecture details (repo exists, not fully public)
- Whether BMW ($700k) contract was signed (delayed to April 2026 as of March 2026)
- Status of Intuit/Mailchimp contract (target Dec 1, 2025 start — outcome not confirmed in messages)
- Full "Stella" competitive analysis document (Kemble prepared but content not in Discord)
- Decision Hub dhub package PyPI page

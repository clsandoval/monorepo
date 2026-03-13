---
page: solutions/decision-ai
title: Decision AI
status: partial
sources:
  - analysis/discord-decision-ai-extraction.md
  - analysis/website-scrape/crawl-remaining.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-sales-extraction.md
---

# Decision AI — Page Content

## Product Identity

**Official name:** Decision AI (also written Decision.AI)
**Domain:** decision.ai (launched Feb 25, 2026)
**Hub:** hub.decision.ai (Decision Hub, launched Feb 26, 2026)
**Relationship to PyMC Labs:** Built by PyMC Labs. Separate brand/product ecosystem (not a spin-off). Emerged from PyMC Labs GenAI Incubator.

### Naming Evolution (for context)
| Period | Name Used |
|--------|-----------|
| Jan–Mar 2025 | "MMM Agent", "MMM Insight Agent", "Insight Agent" |
| Feb 2025 | "AI MMM Agent", "GPT-Bayes prototype" |
| Nov 2025 | "Decision Agents" (umbrella), Decision.AI domain purchased |
| Dec 2025 | "Decision.AI", "DecisionOS", "Decision Packs" |
| Jan–Feb 2026 | "Decision AI", "Decision Hub", "Decision Orchestrator", "Decision Packs" |
| Feb 26, 2026 | Decision Hub launched (first public component) |

---

## Hero / Above the Fold

### Taglines (raw, pick one or combine)

- **"Decision.AI — Agentic Data Science You Can Trust"** — Thomas Wiecki, 2026-01-14
- **"An open-source, research-driven ecosystem for building, evaluating, and operating trustworthy AI systems that make real decisions, not just predictions."** — Halah Joseph, 2026-02-20
- **Decision Hub tagline:** "An agent-native skill registry where skills are executable, testable, and graded. Built for teams who care about reliability, not just demos."
- **MMM Agent beta:** "Tired of spending weeks building MMM models—only to argue over last year's data? Meet the MMM Agent (BETA): Built on PyMC-Marketing. Fast. Causal. Configurable."
- **Alpha launch:** "Reduce months-long Marketing Mix Modeling work into hours — eliminating messy data prep, guesswork on adstock decays, and stale insights that arrive too late."

### Core Value Proposition

Decision AI is the only agentic data science platform built on Bayesian statistics. It automates the full analytics workflow — data cleaning, model building, scenario analysis, and budget optimization — while producing **trustworthy, causally-grounded decisions** (not just predictions). Unlike generic AI tools that give confident-sounding but unverified outputs, Decision AI quantifies uncertainty and grounds every decision in causal models.

**Key differentiators:**
1. **Causality** — Builds causal DAGs, not just correlations; grounds LLM outputs in Bayesian causal models
2. **Uncertainty quantification** — Credible intervals on every output; never just a point estimate
3. **Open Source transparency** — Decision Hub + Decision Orchestrator + PyMC Marketing all open-source
4. **Benchmarks/evals/guarantees** — Quantified performance; skills are systematically tested and graded
5. **Expert backing** — Built by the team that invented PyMC; world's leading Bayesian consultancy

---

## What Is Decision AI?

### Three-Layer Ecosystem

**From Daimon bot summary (2026-03-03):**
> "Decision AI is an open-source, research-driven ecosystem for building, evaluating, and operating trustworthy AI systems that make real decisions, not just predictions. It emerged from PyMC Labs in late 2025 as an evolution of their MMM work into a broader platform for agentic data science. Three core components: Decision Packs (specialized agent products), Decision Orchestrator (the central brain/OS), and Decision Hub (a skill registry for agent capabilities)."

**Component 1: Decision Packs** — Specialized agent products (starting with MMM Agent, CLV Agent)
**Component 2: Decision Orchestrator** — The open-source central brain / OS that orchestrates agents
**Component 3: Decision Hub** — The skill registry and distribution system for agents

### Thomas Wiecki on the Vision (2025-11-25)

> "We already have all the components of Decision.AI in place across the company—Discord workflows, Marimo notebooks, Claude interfaces, Composio integrations, MMM tools, finance automations, and our internal dashboards. The next step is to connect these pieces into one coherent system using MCP. One shared agent service becomes the brain. All our existing tools become MCP servers. Our current surfaces all talk to that agent. This is not a new project; it's a consolidation of what we already do."
> — Thomas Wiecki, #decision-ai, 2025-11-25

### Luca Fiaschi on the Product (Nov 2025)

> "The core product is an operating system that automates and enhances analytics using Bayesian techniques, starting with media mix modeling (MMM) but expanding to other enterprise areas. The team uses a 'prototype first accelerated development' strategy, building flashy demos to generate client demand before full production development. Two key product modes are being developed: Data Scientist mode (currently in beta) for model building and Stakeholder mode (MVP in development) for business decision-makers."
> — Luca Fiaschi, strategy meeting summary, 2025-11-19

---

## Product 1: MMM Agent (Media Mix Modeling)

### What It Does

A conversational AI agent that automates the full MMM workflow — from raw data to budget recommendations — in hours instead of months.

**For data scientists:** ~80% reduction in manual grunt work; focus on insight, not mechanics.
**For CMOs/executives:** Weekly budget updates instead of quarterly cycles; boardroom-ready recommendations.
**Target metric:** "Achieve the output of a 2-5 person modeling team in significantly less time, while maintaining or improving model accuracy." — Kemble Fletcher, 2025-12-11

### Full Feature List (as of late 2025)

**Data Handling:**
- Automated data wrangling (cleaning, transformation, normalization)
- Multi-file upload support
- Support for CSV files and custom priors files
- Transformed dataset export with signed URL download links
- Data quality diagnostics and EDA plots
- Intent router (routes user requests to appropriate sub-agents)

**Modeling:**
- Automated model structure selection based on data characteristics
- Custom priors workflow: agent interviews user in plain English ("What is the lowest/highest revenue you'd expect if marketing were off?"), translates to PyMC parameters
- Custom adstock and saturation function selection
- Prior predictive checks before model fitting
- Choice between MAP and MCMC fitting with justification
- Time period selection, control variable handling
- Seasonality (flexible components, 2–6 default range)
- Hierarchical geo dimensions

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

**Budget Optimization:**
- Budget optimizer agent
- Monthly laydown per channel (presets or plain text)
- Budget range UI (upper/lower bounds per channel)
- Contribution breakdown showing incremental predicted return
- What-if scenario analysis (budget reallocation, channel scaling)

**Planned:**
- One-click summary deck generation
- Custom saturation functions + causal DAG definition
- Marimo-based stakeholder dashboard
- Slack/Teams integration
- Iterative monthly model reruns

### Technical Foundation
- Built on **PyMC Marketing** (the #1 open-source Bayesian MMM library)
- Agent framework: **LangGraph** (supervisor + task-specific agents)
- Code interpreter: **E2B sandboxes** with pymc-marketing installed
- Cloud: **GCP + Kubernetes**; model artifacts stored in GCP
- AI model: **GPT-4o** (primary)

---

## Product 2: Decision Hub (OSS — Launched Feb 26, 2026)

### What It Is
An agent-native skill registry — the "npm for agent capabilities." Instead of fragile text instructions, Decision Hub treats agent skills as real executables (complete with code, environments, and dependencies) that are systematically tested and graded.

**Live at:** https://hub.decision.ai/
**GitHub:** https://github.com/pymc-labs/decision-hub
**CLI:** `pip install dhub` then `dhub list`, `dhub search`, `dhub ask`, `dhub publish`

### Key Stats (as of early March 2026)
- **1,463 downloads** since launch (Feb 26, 2026 → Mar 4, 2026)
- Open-source (MIT license)
- CLI version 0.9.0 at launch

### How It Works
- Skills auto-classified into categories (e.g., "Data Science & Statistics", "Content & Writing") using LLM analysis of SKILL.md
- Private skills: `dhub publish --private` for org-private skills
- Auto-republish trackers: polls GitHub repos for new commits, auto-republishes on changes
- Skill evaluation framework: Dirichlet-Categorical model to account for skill selection errors; measures agent performance with vs. without skills

### LinkedIn Launch Post (Feb 26, 2026 — Sangam Swadi K)
> "Right now, most agentic AI optimizes for capability demos, not decision quality. When applied to complex, high-stakes data science, these systems break down. They lack statistical rigor, human-in-the-loop planning, and the strict validation required to ensure an agent isn't just generating an output, but making a trustworthy decision.
>
> That is why we built Decision AI: our open-source, research-driven ecosystem for building, evaluating, and operating AI systems that make real decisions, not just predictions. It combines agentic data science, rigorous evaluation, and orchestration to help teams move from experiments to production systems they can actually trust.
>
> We are revealing this ecosystem layer by layer over the coming weeks. Today, we are excited to release our first component: Decision Hub."
> — #decision-ai, 2026-02-26

---

## Product 3: CLV Agent (Alpha — Oct 2025)

- Built on PyMC-Marketing CLV models
- Automated data ingestion and cleaning
- Bayesian modeling: captures churn, repeat purchase, retention
- Segmented insights by cohort and campaign
- End-to-end demo completed (September 2025)
- Alpha announced via LinkedIn (October 2025)
- Use cases: marketing managers (CAC/LTV), PE analysts (portfolio health), CFOs (revenue/cash flow)

---

## Decision Orchestrator (OSS — Planned 2026)

- Interface-agnostic "central brain" for a business
- Keeps shared, permissioned memory across interfaces
- Spawns "packs" (repo-shaped skills)
- Returns artifacts + links (notebooks, dashboards, summaries)
- Lives where work happens: Discord/Slack/Teams/CLI/Cursor/Web
- GitHub: `github.com/pymc-labs/decision-orchestrator`
- Lead: Carlos Sandoval

---

## Trust Framework (Central Positioning)

**Thomas Wiecki, #decision-ai, 2026-01-14:**
> "As a slogan, how about: 'Decision.AI — Agentic Data Science You Can Trust' where trust connects to:
> - **Causality** (grounding LLMs)
> - **Uncertainty** (quantify output uncertainty)
> - **Open Source** (transparency)
> - **Benchmarks/evals/guarantees** (quantify performance)
> - **Governance** (track-record, permissions)
> - **Our own expertise & brand**
>
> I believe trust is the thing everyone will look for as today anyone can claim they can do agentic data science, but few can do so credibly."

---

## Use Cases / Who Is It For

### Target Audiences
- **Data Science / Analytics Teams**: Automate grunt work; focus on interpretation and strategy
- **CMOs / Marketing Executives**: Weekly budget updates; scenario analysis without waiting for data team
- **Consulting Firms (Bain, PwC)**: White-label agent for client analytics workflows
- **CPG Brands**: MMM + synthetic consumers + shelf optimization in one ecosystem
- **Financial Services**: CLV, risk, forecasting agents

### Target Industries (from pilot clients)
- CPG (Colgate-Palmolive, Nomad Foods, Hill's Pet)
- Media/Entertainment (Fox Entertainment, Bain/Coke)
- Financial Services (Intuit/Mailchimp, Life360, VisualVest, Swisscard)
- Marketing/Consulting (Bain, Service Plan/BMW, Ovative Group)
- Technology (Databricks)

---

## Customer Evidence

### Named Clients / Pilot Users
| Client | Status | Contact |
|--------|--------|---------|
| Colgate-Palmolive | Active paying pilot (SOW signed Aug 2025) | Barnava Nandi |
| Fox Entertainment | Beta tester (Aug 2025) | Eugene Kwok (SVP Analytics) |
| HelloFresh | EAP starting Jan 2026 | Dovas Zakas |
| Life360 | EAP signed (weekly calls) | Disen Liu |
| Bain & Company | Multiple deep-research demos | Shipra Arora |
| Intuit / Mailchimp | Contract in negotiation (Nov 2025) | Via procurement |
| BMW / Service Plan | Contract negotiation (target Apr 2026) | Via TME |
| Databricks | Demo done, IP review | Anoop Muraleedharan |
| Swisscard | Demo (Sep 2025), advanced discussions | — |
| QXO | Beta tester (revoked Oct 2025) | — |

### Testimonials

**Swisscard tester, via Kemble Fletcher, Sep 12, 2025:**
> "The issue I previously encountered is now resolved. I was able to successfully go through the entire workflow... The interpretation and model analysis features are particularly helpful. The agent guides me through each step and provides detailed explanations. **I've discovered insights I had previously missed when analyzing the model results on my own.**"

**CPG startup founder (former McKinsey consumer insights lead), May 4, 2025:**
> "This is super interesting, extremely relevant and extremely needed in the CPG space. I think it has so many different legs, so many different applications in terms of like business size, partnership with both retailers and big companies, small companies, mid sized companies... time and money are kind of the biggest constraints. And having an end to end platform that does this, and it was super simply explained, is really needed."

**Eugene Kwok, Fox Entertainment (via Kemble, Oct 16, 2025):**
> "Eugene reached out and said we hit the mark, and there were several additional conversations around this topic."

**Andy Heusser on internal use (2026-01-12):**
> "Partly inspired by the story of Claude Code, in 2026 I'm really interested in exploring how we can use the decision ai platform as a productivity tool for labs team members and realize meaningful efficiency gains that translate to fewer billed hours on a project and larger bonuses. Even without selling the platform to a single external client this could change the game for us, enabling our teams to be more efficient at building models, support more clients, take on more work with the same resources."
> — Andy Heusser, #decision-ai, 2026-01-12

---

## Pricing

### Published Pricing Tiers (as referenced in sales)

**Professional / EAP Tier (Kemble's Oct 2025 agreement):**
- **Monthly fee: $8,000/month**
- Includes: Live Expert Sessions (4 hrs/mo), Code Reviews, Direct Expert Access via private Discord
- Guaranteed early access to BETA and pre-release versions
- Additional hours: $350/hour

**Databricks Quote (Sep 30, 2025):**
- Dedicated data scientist support: **$50,000/month**
- Expert Access Support: **$7,500/month** (4 hours meetings + reduced consulting rates)

**Thomas's SaaS Framework (Aug 2025):**
- MMM Agent Platform (SaaS): **$50–100k/year**
- MMM Pack Pilot (services): **$200–500k**
- Expert Access Program: **$50–150k**
- Custom Pack Development: **$100–400k each**

**Pilot pricing:**
- Colgate beta pilot: $2k/week or $4k/2 weeks (July 2025)
- Initial sale: **$50,000 base** (adoption over margin at launch)

**Revenue target:** ~$1M in Year 1; major targets include Service Plan/BMW (~$700k), Colgate (~$500k), Nomad (~$700k)

---

## Competitive Positioning

### vs. Stella (Direct Competitor)
- Stella pricing: $2,000/month basic, ~$12,000/month bespoke
- Stella limitations: weekly time series only; no model customization; built on PyMC MMM originally
- Decision AI advantages: full model customization, Bayesian expertise, causal approach, custom priors, expert support, data scientist mode + stakeholder mode

### vs. Generic AI Tools (GPT, Cursor, etc.)
- Generic AI gives confident but unverified outputs
- Decision AI grounds every output in causal Bayesian models
- Uncertainty quantified via credible intervals
- Open-source transparency (auditable)
- Benchmarked performance (not just claims)

### vs. Meridian (Google MMM)
- PyMC Labs: 2x–20x speed advantage demonstrated
- Luca's stated view: "there is no scenario I would recommend Meridian"
- Decision AI adds LLM interface on top of already-superior model

---

## Roadmap (Historical + Planned)

| Date | Milestone |
|------|-----------|
| Jan 2025 | Project kickoff; GPT-based alpha |
| Feb 24, 2025 | Blog post: "The AI MMM Agent" published |
| Jul–Aug 2025 | Public beta launch; Colgate, Fox, QXO onboarded |
| Aug 2025 | Colgate contract signed (SOW 4 + Addendum) |
| Sep 2025 | Budget optimizer + custom priors released |
| Oct 2025 | CLV Agent alpha; Nov 5: decision.ai domain purchased |
| Nov 2025 | Decision AI strategy; Jellyfish engaged for MVP |
| Dec 2025 | Deep agent demo for Coke ($3M potential RFP) |
| Jan 2026 | HelloFresh + Life360 EAP start |
| Feb 25, 2026 | decision.ai website goes live |
| Feb 26, 2026 | Decision Hub launched (1,463 downloads in first week) |
| Mar 2026 | MMM Agent CLI open-source release (in progress) |
| Soon | Decision Orchestrator open-source release |
| May 2026 | Agentic AI Data Science course (co-branded w/ Vanishing Gradients) |

---

## Team (Decision AI)

| Name | Role |
|------|------|
| Thomas Wiecki | Founder, strategic direction, vision |
| Luca Fiaschi | Product lead, data science, client relationships |
| Andy Heusser | Lead engineer — MMM agent web app |
| Jana Bergant | Frontend engineer, UX, MCP |
| Titi Alailima | Full-stack engineer |
| Carlos Sandoval | Decision Orchestrator lead |
| Ben Maier | Deep Agent, OSS, CLI |
| Kemble Fletcher | Sales, GTM, customer success |
| Nina Rismal | Project management, marketing |
| Allen Downey | Research — benchmarks, synthetic consumers |
| Maxim | Research — causal discovery |
| Colt Allen | CLV Agent development |
| Carlos Trujillo | Research — skills evaluation framework |
| Imri Sofer | Agent engineering |
| Sangam Swadi K | Marketing, content, social |
| Halah Joseph | Marketing strategy |
| Jellyfish (external) | MVP frontend (stakeholder mode) |

---

## Key Quotes for Marketing Copy

**"Agentic Data Science You Can Trust"**
> "I believe trust is the thing everyone will look for as today anyone can claim they can do agentic data science, but few can do so credibly."
> — Thomas Wiecki, #decision-ai, 2026-01-14

**On the platform value:**
> "I believe ultimately the value of decision.ai will not be the platform or the UX, but the agents. The agents do the actual work and are the container for all of our work: pymc-marketing, custom models, synthetic consumers, innovation lab, data cleaning. Once agents can reliably run and analyze the outputs and extract insights, the packaging I think is secondary (still very important of course)."
> — Thomas Wiecki, #decision-ai, 2025-09-24

**On monthly reruns use case:**
> "one cool use-case I think will also be monthly model reruns with updated data. this usually takes data teams a while: is the new data clean? how do the results differ? why do they differ? what should we do about it?"
> — Thomas Wiecki, #decision-ai, 2025-06-23

**On causal DAG integration:**
> "By forcing the agent and the user to co-create and validate the causal DAG first, we guarantee that the resulting Bayesian model reflects actual business mechanics, cementing our 'Trust' framework and completely separating us from generic AI wrappers."
> — Thomas Wiecki, #decision-ai-research, 2026-02-26

**Decision Hub milestone:**
> "Crossed 1k downloads on Decision Hub since launch!"
> — Luca Fiaschi, #decision-ai, 2026-03-01

---

## CTAs / Contact

- **Beta/EAP access:** Email mmm-agent-beta@pymc-labs.com
- **Demo request:** Contact via pymc-labs.com/contact
- **Decision Hub:** https://hub.decision.ai / https://github.com/pymc-labs/decision-hub
- **Website:** decision.ai

---

## Cross-References

- **Simba**: Related product (enterprise MMM solution) — see `content/solutions/simba.md`
- **Colgate case study**: Primary paying pilot — see `content/case-studies/colgate-palmolive.md`
- **Fox case study**: Beta tester — see `content/case-studies/fox-entertainment.md`
- **Training/Courses**: Agentic AI Data Science course (May 2026) uses Decision AI — see `content/courses/`
- **Partners**: Bain partnership includes Decision AI deep research demos — see `content/partners.md`
- **OSS Libraries**: Decision Hub + Decision Orchestrator + PyMC Marketing — see `content/resources/open-source-libraries.md`

---

## Gaps

<!-- GAP: Final public pricing card (2026 pricing not confirmed) -->
<!-- GAP: Intuit/Mailchimp contract outcome (Dec 2025 start date — confirmed or delayed?) -->
<!-- GAP: BMW ($700k) contract signed status (delayed to April 2026 as of March 2026) -->
<!-- GAP: Decision Orchestrator architecture docs (not yet public) -->
<!-- GAP: MMM Agent CLI release date and feature list -->
<!-- GAP: Stakeholder mode (Jellyfish MVP) launch date -->
<!-- GAP: Full competitive analysis vs Stella (deck exists but not extracted) -->

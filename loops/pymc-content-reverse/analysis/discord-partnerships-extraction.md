# Discord Partnership Channels — Extraction

Generated: 2026-03-13
Channels mined:
- `🍻│bain-brand` (1195256813499723786) — 10,111 msgs, Jan 2024 – Mar 2026
- `bain-partnership` (1272878561866547271) — 71 msgs, Aug–Sep 2024
- `📦│bain-customer-pack` (1384516387984244736) — 413 msgs, Jun 2025 – Mar 2026
- `🐇│bain-accelerator` (1435265615043625002) — 212 msgs, Nov 2025 – Mar 2026
- `🟠│databricks-partnership` (1272886644550275093) — 798 msgs, Aug 2024 – Feb 2026
- `❺│five-tran-partnership` (1414712994692202547) — 274 msgs, Sep 2025 – Mar 2026
- `𝌙│serviceplan-group-partnership` (1420837933111447653) — 629 msgs, Sep 2025 – Mar 2026
- `🔵│artefact-partnership` (1368978348356796446) — 15 msgs, May–Dec 2025

---

## 1. Bain & Company

### Partnership Nature

PyMC Labs is the exclusive technical/modeling subcontractor to Bain & Company on a multi-year, multi-project engagement centered on The Coca-Cola Company (TCCC). Three-party structure: Bain sells and manages TCCC relationship; PyMC Labs provides all Bayesian modeling. Talk track: "one team" (TCCC + Bain + PyMC Labs).

> "We stressed to Coca-Cola that we are ONE team (TCCC, Bain and PyMC) — we have not been talking about a 'Bain team' and a 'PyMC team' — we are using the talk track of one analytics team." — Niall, #bain-brand, Jan 2024

> "Bain so far seems good but they are proper consultants. I still have the hope that they can function as shock absorbers and shield us from any (most) potential Coke-related corporate BS." — Thomas, #bain-brand, Jan 2024

### Timeline

| Period | Event |
|--------|-------|
| Jan 2024 | First contact from Bain (Roy); TCCC opportunity surfaced; PyMC Labs "sold" to Coke before pricing agreed |
| Jan 15, 2024 | 10-week prototype project confirmed; $400k for 4 people (SOW 1) |
| Jan–Feb 2024 | Team: Niall, Will Dean, Carlos Trujillo, Ulf Aslak. In-person workshop at Coca-Cola HQ (Atlanta). |
| Apr 2024 | SOW 2: full models for 4 markets, scaling experimentation, coaching sessions for TCCC data scientists |
| Aug 2024 | Red Cities project (CCHBC bottler); combined Fuelight + Red Cities budget: **$3.25 million** |
| Jun 2025 | Bain Customer Pack channel: new sub-project (`pymc-labs/refuel` repo); Umbrage (product/UI) involved |
| Nov 2025 | Bain Accelerator channel: rapid multi-country MMM deployments (5 markets: Spain, Belgium, Sweden + 2) |
| Jan–Mar 2026 | Ongoing; bain-brand active to Mar 12, 2026 |

### Key Revenue Numbers

- SOW 1: **$400,000** / 10 weeks / 4 people
- Combined Fuelight 360 + Red Cities budget: **$3.25 million** (Niall, Sep 2024)
- By Jan 2026: Bain engagement at **$550–600k/month** (from sales extraction)
- Revenue share: 0% commission to Bain; subcontractor billing on Toggl (time-based)

### Projects

**1. Fuelight 360 / TCCC (2024–present)**
- Client: The Coca-Cola Company (direct model: TCCC → Bain → PyMC Labs)
- Product: Hierarchical Bayesian MMM — US, GB, Brazil + expanding
- Tech: PyMC-Marketing components (AdstockTransformation, SaturationTransformation, Prior); Azure ML / Synapse; PyTensor-compiled budget optimizer (< 5 sec solve time, 2000 posterior draws)
- Active model versions (Aug 2025): US sellout v413, GB sellout v382, BR sellout v59
- TCCC repo: `github.com/The-Coca-Cola-Company/tccc-dna-marketing-mai-fuelight360`

> "Coca Cola just gave feedback to Bain and said we've really sent the A-team on this one from both a tech and analytics standpoint." — Niall, #bain-brand, Feb 2024

> "Fucking hell [Ulf] you really nailed it. Just on a standard coke/bain call and Carlos (Coke) is saying how great the session was and how exciting the model is." — Niall, #bain-brand, Apr 2024

**2. Red Cities / Coca-Cola Hellenic Bottling Company (CCHBC) (2024)**
- Outlet-level MMM; multi-hierarchy (brand × outlet × persona); geo experimentation with CausalPy
- Lead: Ben Vincent; Repo: `pymc-labs/red-cities`

> "Bain have asked if we can refactor everything into pymc-marketing... which obviously strategically is amazing for us too." — Niall, #bain-partnership, Sep 2024

> "It feels like they barely understand what they are actually selling, but they are good at selling it. Which is fine. Hyper specialisation, which is why a partnership makes sense." — Ben Vincent, #bain-partnership, Sep 2024

**3. Customer Pack (Jun 2025–present)**
- Generalized hierarchical MMM for TCCC's retail channel / outlet sell-in data
- Repo: `pymc-labs/refuel`; Uses xarray.Dataset; does NOT use `pymc_marketing.mmm.multidimensional`
- PyMC Labs team: Luciano, Ben Vincent, Daniel Saunders, Erik Ringen; Umbrage (dashboard/UI layer, JP Wetzel)

**4. Bain Accelerator (Nov 2025–present)**
- Rapid multi-country MMM deployments using standardized Bain accelerator framework
- Markets: Spain (Hipersuper + HoReCa), Belgium, Sweden + 2 more (140 markets worldwide potential)
- Brands: Aquarius, Coke Red, Coke Zero, Fanta
- Team: Teemu Säilynoja (modeler), Carlos Trujillo, Imri Sofer (PM), Joe Wilkinson
- Model R²: HoReCa Coke Red = 0.87, HoReCa Coke Zero = 0.89

### Engagement Model

- Weekly cadence: Friday content sessions (demos to Bain + TCCC) + Monday coaching sessions (TCCC DS training)
- PyMC Labs direct access to TCCC Azure/Synapse compute and TCCC GitHub org
- IP contract: Bain owns deliverables; PyMC Labs gets non-exclusive royalty-free license to use general methodologies (no Bain/client confidential info)
- PyMC-Marketing improvements from client work fed back to OSS where IP-clean

> "We're in a pretty good negotiation position though as they sold us to their client already. Wouldn't look great if they couldn't deliver us. And these big-name consultancies are not known for being cheap." — Thomas, #bain-brand, Jan 2024

> "Apparently the GB CxP model has gone down really well with CCEP (Europe bottler)." — Joe Wilkinson, #bain-brand, Nov 2025

### Notable Bain Contacts

Bain-side: Roy (initial contact), Arun (senior partner), Holger (day-to-day lead), Noah, Dan, Shelley, Andres, Jeremy, Phil, Lisa (Accelerator, "very tough client"), Rocco
TCCC-side: Carlos (analytics), Qing (DS being trained), Andres, Dan, Vidur, Noah M

---

## 2. Databricks

### Partnership Nature

Official tech integration + consulting referral partnership. Databricks provides compute infrastructure and client referrals; PyMC Labs provides Bayesian modeling expertise and pymc-marketing. Started organically (mutual OSS awareness) and formalized over Aug 2024 – Mar 2025. No commission arrangement — revenue model is referrals → consulting fees.

### Key Databricks Contacts

Corey Abshire, Dan Morris (platform/data, NYC), Bryan Smith (Head of Partner Solutions, Consumer Industries), Mia Savage (Fox account executive), Sangam (Labs, built MMM Agent on Databricks)

### What They Provide to Each Other

**Databricks → Labs:** Data infrastructure (lakehouses, MLflow, Unity Catalog, Genie/AI-BI, serverless compute), enterprise client referrals, MDF marketing funds, co-branded Solution Accelerators, "Data Intelligence for Marketing" launch partner status

**Labs → Databricks:** pymc-marketing OSS, MMM consulting, Simba budget optimizer, MMM Agent (Streamlit + GPT-4/o4-mini, runs pymc-marketing notebooks on Databricks serverless with LLM-generated plot explanations + MLflow tracking), CLV Solution Accelerator update

### Timeline

| Period | Activity |
|--------|---------|
| Aug 2024 | First formal meetings with Corey + Dan Morris; Fox Sports identified as shared client |
| Sep–Nov 2024 | Fox Sports coaching inquiry; Simba demo to Fox; Labs provided CRM lead list by Databricks |
| Jan 2025 | Dan Morris: Labs accepted as **launch partner for "Data Intelligence for Marketing"** (March 3 launch); joint blog, MDF funds, hands-on workshop at Data+AI Summit |
| Feb–Mar 2025 | Databricks account provisioned for Labs; MMM Agent on Databricks serverless + MLflow built (Sangam) |
| Apr 2025 | **Breakout session accepted at Databricks Data+AI Summit** (San Francisco, June 9–12) |
| May 2025 | Official partner listing registration completed |
| Aug–Nov 2025 | Sales enablement push: business-focused case studies for Databricks partner index; CLV Solution Accelerator discussions; Unilever lead |

### Named Shared Clients

Fox Sports (John MacCuish, Director Sports Analytics; John left Fox Mar 2025), Supercell (mobile gaming MMM), Lidl (pricing optimization), Wegmans (via Fivetran CRM cross-ref), UNICEF (CLV, non-profit)

### Key Quotes

> "they were mostly very keen for finding us clients which needed advanced heavyweight models when I spoke to Corey (sell more compute)" — Thomas, #databricks-partnership, Oct 2024

> "Hopefully, any success we have with Fox will help shape a larger Labs + Databricks partnership as a model for success." — Kemble, #databricks-partnership, Nov 2024

> "PyMC marketplace listing that has a notebook and info for your consulting services. Internal demo (for our field) that uses the notebook + our AI/BI and/or Genie products." — Dan Morris (Databricks), #databricks-partnership, Sep 2024

> "damn, the integration with mlflow etc makes this really powerful" — Christian, #databricks-partnership (on MMM Agent demo)

> "We can build out Fivetran data functions for PySpark dataframe using narwhals to MMM model ready. Would be <5 lines of code for MMM in Databricks then" — Will Dean, #databricks-partnership

### Co-Branded Assets

- Blog post on pymc-labs.com (joint)
- Labs listed as launch partner for "Data Intelligence for Marketing" (March 2025)
- Databricks Solution Accelerator for MMM (pymc-marketing referenced)
- CLV Solution Accelerator (update in progress, Bill Dean)
- Databricks Data+AI Summit breakout session (San Francisco, June 2025)
- MDF marketing funds allocated

### Use Cases (Joint)

1. MMM on Databricks: serverless Jobs, MLflow experiment tracking, natural-language interface, automated plot generation + LLM explanations
2. CLV Solution Accelerator: pymc-marketing replaces old `btyd` library
3. "Genie for MMM": Databricks Genie text-to-SQL Q&A layer on MMM outputs (Fox request)
4. Subscription CLV modeling (streaming, Fox)
5. Synthetic consumers capability (showcased to Databricks)
6. Pricing optimization (Lidl)

### Databricks Company Stats (context)

Raised $15.3B Series J at $62B valuation (January 2025, Meta as strategic investor). pymc-marketing at ~10,000 downloads/month (Sep 2024 figure).

---

## 3. Fivetran

### Partnership Nature

Technology integration + co-sell partnership launched Sep 2025. PyMC Labs built Fivetran data connectors for pymc-marketing (600+ source connectors). Revenue model still being defined (joint packaged offering in development). GTM strategy: Fivetran enables sales reps with cheat sheets; Labs provides consulting on top of Fivetran-delivered data.

### Key Contacts

Halah Joseph (Labs, leads channel), unnamed Fivetran partner/sales engineer, Fivetran partner team

### What Each Party Provides

**Fivetran → Labs:** 600+ pre-built data connectors (ETL/ELT), enterprise client referrals, CRM data/lead lists, distribution through partner sales reps, SI network opportunities

**Labs → Fivetran:** Fivetran data connectors for pymc-marketing (OSS), MMM consulting/coaching, blog posts, webinars, co-branded educational content. Future: MMM-Agent and Simba as premium add-ons

### Key Quotes

> "Two things we need to work on: 1. Work on Webinar for the data connectors we have built with Fivetran (Launched Last week) 2. Work on looking into what's possible with Databricks + PyMC Labs + Fivetran" — Halah, #five-tran-partnership, Sep 2025

> "We need to come up with a way to sell a package in collaboration with Fivetran... if not we will only promote consumption increase for Fivetran + Opensource adoption of our PyMC Labs integration with Fivetran... not ideal and not worth the time and effort we put in." — Halah

> "It is quite crazy that they gave us all this data. We seem to have a lot of shared clients for instance Wegmans" — Niall, #five-tran-partnership, Nov 2025

> "From A. I move data in, it goes into a platform, **I do something special**, and it comes out what we need." — Christian (from Fivetran call summary) — "described as our entire business"

### Timeline

| Period | Activity |
|--------|---------|
| Sep 2025 | Fivetran MMM data connectors launched; channel created; webinar planning |
| Oct 2025 | Webinar held (40 sign-ups Meetup + Zoom; "low attendance but very active questions"); LinkedIn event created |
| Oct–Nov 2025 | Fivetran partner team raised CDP SI partnership opportunity |
| Nov 12, 2025 | GTM alignment meeting; Fivetran shared full CRM account list with pricing with Labs |
| Nov 2025 | "Fivetran + PyMC Marketing Decision Guide" (multi-page joint deck, Draft 3) created; Fivetran capital-T PR #2084 in pymc-marketing |

**Status: Active. Connectors live. Joint webinar held Oct 2025. GTM strategy in development. Revenue model being defined.**

### Named Shared Clients

- Wegmans (from Fivetran CRM data)

### Co-Branded Assets

- Blog post: "Accelerating Bayesian MMM: Fivetran + PyMC Marketing" — https://www.pymc-labs.com/blog-posts/accelerating-bayesian-mmm-fivetran-pymc-marketing
- Documentation: https://www.pymc-marketing.io/en/latest/notebooks/mmm/mmm_fivetran_connectors.html
- Joint webinar (LinkedIn Live + Zoom, October 2025)
- "Fivetran + PyMC Marketing Decision Guide" (multi-page joint sales asset, Draft 3)

### Use Cases

1. Marketing data pipeline: 600+ connectors → pymc-marketing in <5 lines of code
2. MMM for CDP clients via Fivetran's SI network
3. CLV and forecasting extensions
4. MMM-Agent and Simba as premium add-ons (future)

---

## 4. Serviceplan Group / Plan.Net Group

### Partnership Nature

Official strategic partnership (announced Dec 8, 2025). Serviceplan Group = Europe's largest independent agency group (Munich HQ). Plan.Net Group = its digital unit. The Marcom Engine (TME) = data/measurement entity within the group. Anchor client: BMW/Mini (global). Labs subcontracts via TME to BMW.

### Key Contacts

Labs: Christian Luhmann (COO, presented Innovation Day), Joe Wilkinson (VP Marketing Analytics), Luca Fiaschi, Carlos Sandoval, Rafael Carrascosa, Halah Joseph, Imri Sofer (PM)

Serviceplan/TME: Lars-Alexander Mayer (The Marcom Engine / TME, primary contact), Hadi Lotfi (Serviceplan Group board-level), Victoria Schnedl (BMW project), Rocco (Bain-side, also involved)

### Timeline

| Period | Activity |
|--------|---------|
| Pre-Sep 2025 | Labs already had paid engagement with TME/BMW (pilot MMM project) |
| Sep 25, 2025 | Channel created; confirmed for Serviceplan Innovation Day (InnoDay25) Oct 14 |
| Oct 14, 2025 | **Main-stage masterclass at Innovation Day Munich** — "Agentic AI in Action: Orchestrating the Marketing Value Chain" (Christian Luhmann + Joe Wilkinson) |
| Oct 20, 2025 | Lars emails: BMW interested in budgeting MMM-Agent + Forecasting-Agent for 2026 |
| Oct–Nov 2025 | BMW US visit to NJ discussed; proposal scoped at **~€1.61 million** |
| Dec 8, 2025 | **Official strategic partnership announced** — Plan.Net Group + PyMC Labs LinkedIn posts |
| Dec 17, 2025 | BMW: "extremely satisfied" with pilot, calling it "the perfect project" |
| Jan 2026 | BMW Gaia AI infrastructure constraint (4 approved tools); MVP agent by end March; 100 MMMs total |
| Feb 5, 2026 | Lars: "I expect signing the contract in the next 10 days and we should be up and running full throttle by March latest. We are planning with the project at 100% certainty." |
| Feb 11, 2026 | BMW delayed to Q3 ramp-up; contract ~9 months + 3-month extension |

**Status: Active. Official partnership announced Dec 2025. BMW pilot complete ("the perfect project"). Contract in negotiation (~€1.61M budget, 100 MMMs, 20+ markets). Not yet signed as of Feb 2026 (BMW internal approval delays).**

### Revenue Numbers

- BMW pilot result: 0.3% media spend optimization on €1.5M budget → board-level enthusiasm
- **Proposed 2026 scale:** ~96–100 MMMs across 5+ BMW models + 3+ Mini models, 20+ European markets H1, US + RoE H2, up to 140 markets globally
- **Proposed contract value:** ~€1.61 million; ~€22,000 per market/model
- Timeline: MVP agent end March 2026; 4 new MMMs/week in Q2 2026

### Key Quotes

> "as hoped and planned, our presentation on Innovation Day sparked BMW's interest to budget the MMM- and the Forecasting-Agent for the coming year." — Lars-Alexander Mayer (TME), #serviceplan-group-partnership, Oct 2025

> "BMW project has been highly successful with the client expressing extreme satisfaction, calling it 'the perfect project' that achieved more in four months than anyone expected" — Meeting summary, #serviceplan-group-partnership, Dec 2025

> "Together with PyMC Labs – a world-leading Bayesian consultancy, and the creators of PyMC, the leading open-source library for statistical modeling and Bayesian AI – we're combining Bayesian modelling excellence and agentic AI with our end-to-end capabilities in digital strategy, data-driven customer experience, commerce and transformation." — Plan.Net Group official partnership announcement, Dec 2025

> "now I understand why they are so eager to work with us. they have no game" — Thomas, #serviceplan-group-partnership (referring to Serviceplan's limited AI/data science internal capability)

> "I expect signing the contract in the next 10 days and we should be up and running full throttle by March latest. We are planning with the project at 100% certainty." — Lars, #serviceplan-group-partnership, Feb 5, 2026

### Co-Branded Assets

- Innovation Day main-stage masterclass appearance (Oct 14, 2025, Munich) — "Agentic AI in Action"
- **Official strategic partnership announcement** (Dec 8–9, 2025) — LinkedIn from both Plan.Net Group and PyMC Labs
- Dec 3 Serviceplan-BMW annual workshop (Labs content co-presented)
- Serviceplan Group website partnership page planned

### Use Cases

1. BMW Global MMM scaling via agents: 20+ markets, multiple car models, automated run/validate/report
2. Hierarchical BMW MMM: multiple car models, multiple markets, hierarchical media spend, halo effects
3. Forecasting Agent: BMW demand forecasting (budgeted alongside MMM Agent)
4. Share of search tracker
5. Synthetic consumers (Eraneos integration being explored)
6. Top-of-funnel / brand awareness modeling (H2 2026)
7. Event ticket sales (new vertical Lars pursuing)

### Industries Served (Serviceplan Group's client base for expansion)

Automotive, Retail & E-Commerce, FMCG, Telco, Finance

---

## 5. Artefact

### Partnership Nature

Early-stage / nascent; never materialized. Artefact = global data consulting and digital marketing firm. Lead introduced by "Sid." No commercial engagement ever happened. Channel archived Dec 2025.

> "yes I think both are interesting, first they become clients and then we introduce mmm agent for partnerships" — Thomas, #artefact-partnership, Jul 2025

> "Think it probably has [died]" — Joe Wilkinson, #artefact-partnership, Oct 2025

**Status: Dead/Archived (Dec 2025).**

---

## 6. BCG (Emerging)

From discord-sales-extraction:
- New BCG lead surfaced Nov 2025
- Not a formal partner channel yet

## 7. Snowflake (Pending)

From discord-sales-extraction:
- Partner application submitted: SPN-PID-752205 (Dec 2024)
- Talk proposal for Snowflake Summit submitted Feb 2025
- No dedicated channel; status unclear

---

## Partners Summary Table

| Partner | Status | Nature | Key Client(s) | Commercial Model |
|---------|--------|--------|--------------|-----------------|
| **Bain & Company** | Active (2024–present) | Subcontractor relationship | Coca-Cola Company, CCHBC bottler, Yum! Brands | Subcontract billing; $3.25M identified; $550–600k/month by Jan 2026 |
| **Databricks** | Active / Official (2025) | Tech integration + referrals | Fox Sports, Supercell, Lidl, Wegmans | Client referrals → consulting fees; no commission |
| **Fivetran** | Active / GTM developing (2025) | Tech integration + co-sell | Wegmans (shared) | Joint packaged offering (TBD) |
| **Serviceplan / Plan.Net** | Active / Contract pending (Dec 2025) | Agency + end-client delivery | BMW/Mini (global) | Subcontract via TME; ~€1.61M proposed |
| **BCG** | Emerging lead | TBD | TBD | TBD |
| **Snowflake** | Applied / Pending | Tech integration | TBD | TBD |
| **Artefact** | Dead (Dec 2025) | Never materialized | None | None |

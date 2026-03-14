---
page: partners
title: Our Partners
status: complete
sources:
  - analysis/discord-partnerships-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-marketing-extraction.md (section 13: Partnership Announcements)
  - analysis/website-scrape/crawl-remaining.md
  - analysis/website-scrape/home.md
---

<!-- NOTE: Partner relationships are partially confidential (Bain/TCCC is not publicly disclosed). Content below is assembled from internal Discord. Use discretion about what is made public. -->

---

## SECTION: Hero

<!-- Note: No dedicated /partners hero copy found in Halah draft or brand deck. The following is assembled from partner announcement copy and newsletter framing. -->

**Eyebrow (options):**
- "Strategic Partnerships"
- "Our Partners"

**Headline options:**
- "Partnering for Maximum Impact" (from marketing brainstorm)
- "Built on Partnership, Driven by Science" (from marketing brainstorm)
- "Bayesian Science Meets Enterprise Scale" (derived from Databricks + Bain positioning)

**Body copy options (assembled from September 2025 newsletter and sales positioning):**

Option A (newsletter tone, Halah, Sep 2025):
> "We continue to bridge the gap between advanced research and practical business applications — building strategic partnerships that make Bayesian AI more accessible than ever."

Option B (partner value prop framing):
> "We bring the rigor. Our partners bring the reach. Together we deliver Bayesian AI capabilities at enterprise scale."

Option C (Serviceplan/Plan.Net official announcement tone):
> "Combining Bayesian modelling excellence and agentic AI with our partners' end-to-end capabilities in digital strategy, data-driven customer experience, and transformation."

**CTA:** "Interested in partnering? Get in touch" → /contact (with "Partnership" dropdown selected)

---

## SECTION: Partner Intro Block

Context from website (crawl-remaining.md):
> Expert Access Program page mentions "Our Partners" as a nav link; partners page is in main nav.

From halah-draft-scrape.md, the current draft site does NOT have a dedicated /partners page scraped — it may be in progress.

From Discord sales extraction, the standard partner pitch: PyMC Labs works with partners to bring Bayesian AI capabilities to clients at enterprise scale, combining deep technical expertise with partner go-to-market reach.

---

## SECTION: Featured Partners

### 1. Bain & Company

**Relationship type:** Strategic subcontractor / co-delivery partnership
**Status:** Active (2024 – present)
**Tier:** PRIMARY REVENUE PARTNER

**What the partnership means:**
Bain & Company brings PyMC Labs in as the technical modeling team on major enterprise engagements. Bain manages client relationships and project management; PyMC Labs provides all Bayesian statistical modeling. Together we present as a unified team.

**How to describe publicly:**
- PyMC Labs is a technical partner to Bain & Company on large-scale enterprise analytics programs
- Combined team has delivered production marketing analytics systems for Fortune 500 clients
- Bain brings the consulting framework; PyMC Labs brings the Bayesian science

**Key client delivered through Bain:**
- Coca-Cola Company (TCCC): Production Bayesian Marketing Mix Model (Fuelight 360) running in US, GB, Brazil + more markets; budget optimizer solving in < 5 seconds; active coaching of TCCC's own data science team
- Coca-Cola Hellenic Bottling Company (CCHBC): Red Cities outlet-level MMM with geo-experimentation
- Bain Accelerator: Rapid multi-country MMM deployments (Spain, Belgium, Sweden + 2 markets; up to 140 markets globally)

**Notable quote (internal, paraphrasable publicly):**
> "It feels like they barely understand what they are actually selling, but they are good at selling it. Which is fine. Hyper specialisation, which is why a partnership makes sense." — Ben Vincent, PyMC Labs

**Numbers (internal; confirm before publishing):**
- Combined project value: $3.25M+ (2024); grew to $550–600k/month by Jan 2026
- Markets modeled for Coca-Cola: US, GB, Brazil + expanding globally
- Model versions in production: US sellout v413, GB sellout v382, BR sellout v59 (as of Aug 2025)

<!-- GAP: No public Bain case study or co-branded asset yet. Bain engagements are confidential; TCCC logo requires prior written consent to use. -->

---

### 2. Databricks

**Relationship type:** Official technology integration + referral partner
**Status:** Active / Official (2025–present)
**Designation:** "Data Intelligence for Marketing" launch partner (March 2025); Breakout session at Databricks Data+AI Summit (San Francisco, June 2025)

**What the partnership means:**
PyMC Labs is an official Databricks partner. PyMC Labs' modeling capabilities run natively on Databricks serverless compute with full MLflow experiment tracking. Together we help enterprise clients go from raw marketing data to Bayesian MMM insights without leaving the Databricks platform.

**How Databricks and PyMC Labs fit together:**
- Databricks handles compute infrastructure, data pipelines, MLflow, Unity Catalog, and AI/BI dashboards
- PyMC Labs handles the statistical modeling (MMM, CLV, causal inference) and consulting
- The MMM Agent (natural-language interface to pymc-marketing) runs as a Streamlit app on Databricks serverless, with LLM-generated plot explanations

**Key assets:**
- pymc-marketing runs natively on Databricks serverless compute
- MLflow experiment tracking integrated throughout pymc-marketing model runs
- CLV Solution Accelerator (update to Databricks' existing CLV notebook using pymc-marketing)
- Decision Hub + MMM Agent deployed on Databricks infrastructure

**Shared clients:** Fox Sports, Supercell, Lidl, Wegmans, UNICEF

**Co-branded assets:**
- Joint blog post on pymc-labs.com
- "Data Intelligence for Marketing" launch partner (March 2025)
- Databricks Data+AI Summit breakout session (San Francisco, June 9–12, 2025)
- Solution Accelerators (MMM + CLV) referencing pymc-marketing

**Official public copy — Databricks Data+AI Summit (Sangam, 2025-06-11) — USABLE AS-IS:**
> "Marketing insights shouldn't take weeks. We think there's a better way — and we're sharing it this week at the Databricks Data + AI Summit.
>
> Our team — Thomas, Luca, and Christian — is in San Francisco showcasing two new tools from PyMC Labs:
>
> **MMM Insights Agent** — An AI copilot for MMM that turns raw media spend data into strategic guidance in hours — giving you fast, clear answers to 'what if' questions and helping you optimize spending for better ROI.
>
> **[Decision Hub]** — [second tool]"
— Sangam, LinkedIn post, 2025-06-11

**Event recap copy (Halah, 2025-06-13) — USABLE AS-IS:**
> "We had an incredible time at the Databricks Data + AI Summit in San Francisco last week — and were proud to see our very own Luca Fiaschi take the stage!
>
> Luca shared how Bayesian MMM agents are redefining experimentation and decision-making in modern marketing teams."
— Halah, LinkedIn, 2025-06-13

**Internal Databricks-side quote (Databricks Dan Morris, Sep 2024) — paraphrasable:**
> "PyMC marketplace listing that has a notebook and info for your consulting services. Internal demo (for our field) that uses the notebook + our AI/BI and/or Genie products."
— Dan Morris, Databricks Head of Partner Solutions (Consumer Industries)

<!-- GAP: Confirm Databricks logo co-branding guidelines. Second tool name in Summit copy needs completing. -->

---

### 3. Fivetran

**Relationship type:** Technology integration + co-sell partnership
**Status:** Active (Sep 2025–present)

**What the partnership means:**
PyMC Labs built native Fivetran data connectors for pymc-marketing. With 600+ source connectors, Fivetran users can pull marketing data from any source directly into a pymc-marketing MMM workflow — in fewer than 5 lines of code.

**How they fit together:**
- Fivetran: "I move data in" (ETL/ELT from 600+ sources)
- PyMC Labs: "I do something special" (Bayesian MMM/CLV/causal modeling)
- "It comes out what we need" (actionable marketing analytics)

**Key assets:**
- Fivetran data connectors for pymc-marketing (live, open source)
- Blog: "Accelerating Bayesian MMM: Fivetran + PyMC Marketing" — https://www.pymc-labs.com/blog-posts/accelerating-bayesian-mmm-fivetran-pymc-marketing
- Documentation: https://www.pymc-marketing.io/en/latest/notebooks/mmm/mmm_fivetran_connectors.html
- Joint webinar (October 2025); "Fivetran + PyMC Marketing Decision Guide" (sales asset, Draft 3)
- Shared clients: Wegmans

**Official announcement copy (LinkedIn, Halah, 2025-09-02) — PUBLIC, USABLE AS-IS:**
> "Announcing PyMC Labs × Fivetran Partnership: From Weeks to Minutes for Marketing Mix Models
>
> Marketing teams want fast insights. Data prep is slowing them down.
>
> We partnered with Fivetran to solve the biggest Marketing Mix Modeling bottleneck: data wrangling consumes the majority of MMM efforts, leaving little time for insights that drive decisions.
>
> We've built an integration that transforms Fivetran's standardized ad reporting into production-grade Bayesian MMMs in minutes, not weeks.
>
> ✓ 600+ pre-built data connectors
> ✓ Automated data normalization
> ✓ Multi-brand/region support"
— Halah, LinkedIn, 2025-09-02

**GTM vision (Halah, 2025-09-03):**
> "I think collaborating with Fivetran × Databricks is a strong GTM approach. From my previous work with them in other regions, when they co-sell together to a client, they really push solutions. Might be room for something interesting there."
— Halah, #marketing, 2025-09-03

<!-- GAP: Fivetran logo + formal co-branding guidelines not confirmed. No published case study. -->

---

### 4. Plan.Net Group / Serviceplan Group

**Relationship type:** Official strategic partnership (announced December 8, 2025)
**Status:** Active — BMW contract pending signature (as of Feb 2026)
**Nature:** PyMC Labs is the Bayesian modeling partner for Plan.Net Group (Serviceplan's digital arm) on enterprise marketing analytics programs, beginning with BMW/Mini globally.

**Official announcement copy (Plan.Net, Dec 2025):**
> "Together with PyMC Labs – a world-leading Bayesian consultancy, and the creators of PyMC, the leading open-source library for statistical modeling and Bayesian AI – we're combining Bayesian modelling excellence and agentic AI with our end-to-end capabilities in digital strategy, data-driven customer experience, commerce and transformation."

**What the partnership means:**
- Serviceplan Group = Europe's largest independent agency group (Munich HQ)
- Plan.Net Group = its digital unit; The Marcom Engine (TME) = data/measurement entity
- BMW pilot project completed (described by BMW as "the perfect project")
- 2026 scope: ~100 Bayesian MMMs via the MMM Agent across 20+ European markets; proposed contract ~€1.61M

**Co-branded event:**
- Innovation Day Munich (Oct 14, 2025): "Agentic AI in Action: Orchestrating the Marketing Value Chain" — main-stage masterclass by Christian Luhmann (COO) + Joe Wilkinson (VP Marketing Analytics)

**Key BMW result:**
- Pilot: 0.3% media spend optimization on €1.5M budget → "the perfect project, achieved more in four months than anyone expected" (BMW)
- Proposed scale: 5+ BMW models + 3+ Mini models × 20+ European markets H1 2026; US + rest of Europe H2; up to 140 markets globally

<!-- GAP: Plan.Net/Serviceplan logos confirmed in partnership announcement; confirm usage rights. BMW is NOT to be named publicly without authorization (confidential client). Need a public-safe quote from Lars. -->

---

## SECTION: Additional Partners (Ecosystem)

<!-- Listed in sales Discord as active partnerships or partner applications -->

**BCG** — New partnership lead surfaced Nov 2025; discussions in progress.

**Snowflake** — Partner application submitted Dec 2024 (SPN-PID-752205); talk proposal for Snowflake Summit Feb 2025. Status unclear.

<!-- GAP: BCG and Snowflake partnerships have no dedicated Discord channels yet; minimal info. Check discord-sales for more. -->

---

## SECTION: Partnership Model / CTA

From the Expert Access Program contact form (website-scrape/crawl-remaining.md), the contact form dropdown includes "Partnership" as an inquiry type — suggesting partners can reach out directly.

From discord-sales extraction, standard partnership pitch:
- PyMC Labs brings Bayesian science; partner brings go-to-market, client access, or data infrastructure
- Model: "We bring the rigor; you bring the reach"
- Relevant for: consulting firms, marketing agencies, data infrastructure companies, managed service providers

**CTA options:**
- "Interested in partnering? Get in touch → contact@pymc-labs.com"
- Link to contact form with "Partnership" dropdown

<!-- GAP: No formal partner application page or partner program description found. Current model is relationship-driven, not self-serve. Need Halah or Thomas to draft a partner program description if one is intended for the website. -->

---

## SECTION: Partner Testimonials / Social Proof

**From Lars-Alexander Mayer, The Marcom Engine (Serviceplan Group partner):**
> "as hoped and planned, our presentation on Innovation Day sparked BMW's interest to budget the MMM- and the Forecasting-Agent for the coming year."
— #serviceplan-group-partnership, Oct 2025

**Ben Vincent (PyMC Labs) on the Bain partnership dynamic:**
> "It feels like they barely understand what they are actually selling, but they are good at selling it. Which is fine. Hyper specialisation, which is why a partnership makes sense."

<!-- GAP: No external-facing partner testimonials with attribution yet. Need Lars, Bain contact, Databricks contact for public quotes. -->

---

## SECTION: Partnership Model & Why We Partner

### Partner Value Proposition Framing

Three partnership archetypes, based on active relationships:

1. **Consulting Co-Delivery (Bain/Serviceplan model):** Partner wins and manages client relationships; PyMC Labs delivers all Bayesian modeling. Presented as one team to the client. Best for management consulting firms and agency groups with enterprise client access but limited data science depth.

2. **Technology Integration (Databricks/Fivetran model):** PyMC Labs' OSS runs natively on partner infrastructure. Joint Solution Accelerators. Partner refers enterprise clients needing Bayesian analytics. Best for data infrastructure platforms seeking differentiated analytics use cases.

3. **Market/Client Access (emerging: BCG, Snowflake):** Partner opens new enterprise client relationships in return for PyMC Labs technical expertise. No commission — value exchange is pure referral + co-branding.

### What PyMC Labs Brings to Partners

- World's leading Bayesian AI expertise (inventors of PyMC, 9,500★ OSS project)
- pymc-marketing: 1M+ downloads, natively integrated with Databricks, Fivetran, and Azure
- Scientific credibility: peer-reviewed papers, ODSC/PyData conference presence
- Decision Hub + MMM Agent: immediately deployable enterprise products
- "Built on PyMC" brand trust (analogous to "Built on Databricks")

### What Partners Bring to PyMC Labs

- Enterprise client access at scale (Bain: Fortune 500; Databricks: 10,000+ enterprise customers)
- Compute infrastructure (Databricks: serverless, MLflow, Unity Catalog; Azure: TCCC's stack)
- Data pipeline integration (Fivetran: 600+ connectors → pymc-marketing in <5 lines)
- Go-to-market reach: consulting brand (Bain), platform distribution (Databricks), media/agency network (Serviceplan)

### Internal Vision Quote

> "it could help, probably more if we float the Bain partnership with Roy's quote" — on using Bain relationship as credibility signal in enterprise deals
— Thomas, #sales

> "'transformation' is what all the big players seem to sell. That's where the $$ is. I never dared to suggest that. We could more credibly offer this with Bain."
— Thomas, #sales

---

## RAW NOTES: What Partners Get / Value Prop for Partners

From discord-sales-extraction:
> "it could help, probably more if we float the Bain partnership with Roy's quote" (on using Bain relationship as credibility signal in enterprise deals)

> "'transformation' is what all the big players seem to sell. That's where the $$ is. I never dared to suggest that. We could more credibly offer this with Bain."

From discord-marketing-extraction:
- Partners use PyMC Labs' Bayesian credibility to win deals they couldn't win alone
- PyMC Labs' open-source reputation (pymc-marketing 1M+ downloads) is a trust signal for partners
- "Built on PyMC" is an emerging co-branding concept (analogous to "Built on Databricks")

---

## CROSS-REFERENCES

- Bain/TCCC work → content/case-studies/ (no public case study yet; check discord-case-studies-threads for Coca-Cola material)
- Databricks partner → content/solutions/decision-ai.md (Decision Hub built on Databricks)
- Fivetran connectors → content/resources/open-source-libraries.md (pymc-marketing connectors)
- Serviceplan/BMW → content/industries/marketing-media.md (automotive MMM)
- All partners → content/about/story-and-team.md (founding story includes OSS-first approach that attracts partners)

---
page: services/strategy-advisory
title: Strategy & Advisory
status: complete
sources:
  - analysis/website-scrape/services.md
  - analysis/halah-draft-scrape.md
  - analysis/website-scrape/crawl-remaining.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-competition-extraction.md
  - analysis/discord-org-team-extraction.md
  - analysis/eap-enrichment.md
---

# Strategy & Advisory — PyMC Labs

## Page Purpose

Strategy & Advisory is the "We Advise" pillar. It covers all engagements where PyMC Labs provides expert guidance — strategic consultation, model audits, measurement framework design, analytics roadmaps, and ongoing access programs — without necessarily delivering a full build. The Expert Access Program (EAP) is the primary product under this pillar.

---

## Hero Section

### Option A (Halah draft, home teaser)
**Headline:** Strategy & Advisory
**Subhead:** "Expert guidance to help your team design, build, and scale complex Bayesian decision systems."

### Option B (Halah draft, services page)
**Headline:** Strategy & Technical Advisory
**Description:** "Strategic and technical guidance on Bayesian models, empowering your team to build, maintain, and enhance complex decision systems."

### Option C (live site)
**Headline:** Strategy & Technical Advising
**Description:** "Whether it's advising executives to craft innovative, long-term strategies or guiding data science teams through the intricacies of technical implementation, access to our expertise ensures cohesive alignment and impactful execution across all organizational levels."
— pymc-labs.com, 2026-03-13

### Option D (sales channel framing — recommended for non-technical audiences)
**One-liner:** "We Advise."
— Halah, #sales, 2026-02-21

---

## What This Service Is

### Core Description (synthesized from all sources)

Strategy & Advisory spans two buyer needs:

1. **Executive/Strategic level** — Advising CMOs, CDOs, and VP-Analytics on measurement frameworks, analytics modernization, Bayesian AI roadmaps, and vendor selection. The deliverable is a strategic plan and architecture, not code.

2. **Technical/Hands-on level** — Advising data science teams on model architecture, sampling diagnostics, implementation approaches, and best practices. The deliverable is mentorship, code reviews, and unblocking sessions.

Both are served by the **Expert Access Program (EAP)** — PyMC Labs' flagship retainer product.

> "Our audience is companies that have some level of analytics and data science capabilities. They are interested in internalizing these capabilities."
— Luca, #sales, 2026-03-05

---

## Feature Bullets (from Halah draft)

- **Model Strategy:** Define and prioritize high-value Bayesian use cases.
- **System Design:** Plan scalable architectures for production.
- **Implementation Guidance:** Align technical execution with strategic outcomes.

---

## The Expert Access Program (EAP)

**Primary product under Strategy & Advisory.**
**URL:** https://www.pymc-labs.com/blog-posts/expert-access-program
**Published:** August 26, 2025 | **Updated:** February 17, 2026

### Why EAP Exists

> "Traditional consulting ends when projects finish; hiring is expensive and slow."
— pymc-labs.com/blog-posts/expert-access-program

Target: teams that have completed projects with PyMC Labs (or independently) and need ongoing expert guidance — without the cost of a full-time senior Bayesian hire.

### Hero / Launch Copy (Halah, 2025-09-16 newsletter)

> "Imagine having a team of Bayesian modeling experts on call, ready to help you solve complex challenges as they happen, not weeks later. That's exactly what EAP delivers. EAP ensures your team has expert guidance exactly when you need it, helping you move faster, avoid pitfalls, and make the most of your analytics investments."
— Halah Joseph, #marketing, 2025-09-16

**Section header option:** "Why EAP Changes the Game"

### SEO / Keyword Note

- Primary SEO target: `bayesian experts for hire`
- Live page: https://www.pymc-labs.com/blog-posts/expert-access-program (published Aug 26 2025, updated Feb 17 2026)
- SEO-optimized draft (Sangam, Feb 26 2026): https://www.pymc-labs.com/draft-post/bayesian-experts-for-hire

### Two Tiers

**Base: Expert Lifeline**
- Direct expert communication channel (1 business day response priority)
- Growing library of implementation guides and best practices
- Access when roadblocks occur: diagnostics, sampling issues, modeling decisions
- No email — Discord-only communication

**Pro: Deep Partnership & Strategic Guidance**
Everything in Base, plus:
- Bi-weekly coaching calls with domain-matched dedicated experts
- Bi-monthly Expert Exchange Sessions (case studies, emerging methods, industry trends)
- Priority access to new PyMC Labs tools and early feature previews
- Custom workshop development for specific modeling challenges
- Strategic consultation on measurement frameworks, analytics roadmaps, stakeholder alignment

### EAP Pricing (from Discord)

| Tier | Rate |
|---|---|
| Base (Expert Lifeline) | $5,000–$8,500/month (dynamic by client size) |
| Pro (Deep Partnership) | up to $14,000/month |
| Hands-on code work (billed separately) | $385/hour |

> "The margins are by far the best from them... they should really be treated like a foot in the door to extend to new big projects"
— Niall, #sales, 2024-12-04

> "EAP program could be scaled way more... it sells like bread"
— Luca, #sales, 2025-12-22

<!-- GAP: Public pricing not displayed on website — pricing is "contact us" — do NOT show rate card on page -->

### EAP Testimonials

**Eugene Kwok, Executive Director Research & Analytics, Fox Entertainment:**
> "The PyMC Labs Coaching program has been transformative for our small Data Science team, enabling us to deliver results at the level of a full-scale department. We've been able to leverage the coaching sessions at every stage of our delivery cycle, from early research and experimentation to implementation, deployment, and long-term roadmapping. The PyMC Labs coaches brought both technical expertise and practical guidance, helping us refine our models, review results, and even troubleshoot complex code issues."
— pymc-labs.com/blog-posts/expert-access-program (WebSearch, 2026-03-14)

**Nathan Kafi, Principal Data Scientist, Haleon:**
> "PyMC Labs has significantly enhanced our testing capabilities by leveraging the full power of Bayesian programming, maximizing the potential of the PyMC software. Their advisory role in delivering new feature requests and training our team has been invaluable, driving substantial improvements in our operations."
— pymc-labs.com + halah-draft-scrape.md

**Kate Hirth, Fabletics:**
> "PyMC Labs implemented time-varying coefficients improving seasonality capture in marketing mix models. The team proved collaborative, insightful, and consistently supportive."
— pymc-labs.com/blog-posts/expert-access-program

---

## What Clients Come With (Pain Points)

These are the real-world triggers that lead to a Strategy & Advisory engagement. Compiled from Discord #inbound-leads and #sales.

### Technical Pain Points
- **Bayesian transition**: moving from frequentist stats / Stan / Excel to PyMC; don't know where to start
- **Scaling existing models**: have a working prototype, can't take it to production or new markets
- **Sampling problems**: model converges but diagnostics show divergences, R-hat warnings, slow NUTS
- **Explainability**: black-box ML not acceptable to executives or regulators; need interpretable uncertainty
- **MMM edge cases**: open-source packages don't handle their specific data structure

### Organizational Pain Points
- **In-house DS team gets stuck**: need fractional senior expertise, not a full-time hire
  > "value prop is also speed. In-house DS get bogged down or stuck, we help them develop, troubleshoot, and implement much faster"
  — Evan (UTC-5), #sales, 2024-12-04

- **Model built but stuck at scale**: Haleon example — good in-house model but struggling to scale
  > "Part of me thinks that we probably have a network of EAPs where they have a good in-house model but struggling to scale it. e.g Haleon is one we know for sure"
  — Niall, #sales, 2025-11-24

- **Need internal buy-in**: outside expert validation to convince leadership or procurement

---

## Expert Perspectives on What Advisory Delivers

From the EAP page and Discord (#sales, #marketing, #org):

**Juan Orduz:**
> "EAP provides actionable mentorship on statistical models for efficient decision-making while enabling PyMC to learn from real-world user needs."
— pymc-labs.com/blog-posts/expert-access-program

**Tim McWilliams:**
> "The collaborative nature helps clients overcome obstacles and build modeling confidence, creating sustained, impactful model development."
— pymc-labs.com/blog-posts/expert-access-program

**Daniel Saunders:**
> "Deep Bayesian expertise clears roadblocks consuming weeks, freeing client data scientists to focus on domain expertise."
— pymc-labs.com/blog-posts/expert-access-program

**Carlos Trujillo:**
> "Advanced statistical thinking bridges real-world decision-making, transforming uncertainty into clarity."
— pymc-labs.com/blog-posts/expert-access-program

**Teemu Säilynoja:**
> "Teaching fundamentals enables clients to diagnose and solve problems independently."
— pymc-labs.com/blog-posts/expert-access-program

**Bill Engels:**
> "The goal involves teaching clients model fundamentals so they can troubleshoot independently while collaborating on complex problems."
— pymc-labs.com/blog-posts/expert-access-program

**Kemble Fletcher:**
> "PyMC brings cross-disciplinary expertise spanning statistics, physics, engineering, economics, marketing analytics, neuroscience, programming, and business strategy."
— pymc-labs.com/blog-posts/expert-access-program

---

## Why PyMC Labs for Strategy / Advisory

### Unique position: Creators, not users
> "PyMC Labs is the Bayesian consultancy, founded by the inventors of PyMC, the leading platform for statistical data science. Our decades of experience in Bayesian modeling allows us to develop unique and impactful solutions to your most challenging business problems."
— Thomas (UTC+7), #marketing, 2022-09-06

### "Level 0 to Level 3" framework (Thomas, approved)
> "Level 0 - Intuition: You primarily rely on intuition and experience...
> Level 1 - Basic Analysis: Excel...
> Level 2 - Advanced Analysis: Python/R...
> Level 3 - Statistical Modeling: Bayesian modeling to build custom models that deliver deeper insights"
— Thomas (UTC+7), #sales, 2023-04-25

Thomas's commentary: "There's a whole bunch of companies operating at level 0 and 1. Oh no! I'm only operating at level 0 and the dial goes up to 3. I'd better call PyMC Labs"

### Competition is intuition, not ML
> "I always thought that we need to somehow delineate Bayes vs ML. But in reality, I don't think I encountered this on a single sales call where ML was even a consideration. Instead, our competition is intuitive-based human decision making and Excel spreadsheets."
— Thomas (UTC+7), #sales, 2023-04-21

### vs. Large Consultancies
> "What is our value proposition? We are the only PyMC + MMM experts in the open-source and in-house modeling advisory. If they don't work with us what are they going to do? Accenture? If they do Accenture they will come back in two years to fix the mess anyway."
— Juan Orduz, #sales, 2024-12-04

### Selling insight, not hours
> "Is the thing we're selling *insight* into your data? And (Bayesian) modeling provides the deepest level of insight."
— Thomas (UTC+7), #sales, 2023-04-24

---

## Use Cases / Scenarios

Where Strategy & Advisory fits (from #inbound-leads patterns):

1. **Analytics Roadmap Review** — Leadership wants to understand their current Bayesian maturity and where to invest next; PyMC Labs assesses current stack, recommends model architecture and tooling.

2. **Model Audit / Optimization** — Company has existing Bayesian or MMM models that aren't performing; PyMC Labs audits priors, sampling configuration, model structure, and recommends improvements.
   > "Yes. Many of our clients have existing Bayesian workflows that need more 'rigor.' We can audit your current models, improve their sampling efficiency, and customize them to handle your specific data constraints or business logic using the latest PyMC innovations."
   — Halah draft FAQ

3. **Ongoing EAP** — Team has built or is building models; needs a standing relationship with experts available for questions, code reviews, and unblocking sessions. Primary product is EAP Base or Pro.

4. **Measurement Framework Design** — Client needs to define what to measure and how before building anything; PyMC Labs leads strategic sessions on KPIs, uncertainty quantification requirements, and decision-use cases.

5. **Stakeholder Alignment** — Data science team needs external authority to secure executive buy-in for a Bayesian approach over a simpler alternative.

---

## Industries That Commonly Need Advisory

From #inbound-leads and #sales — companies whose DS teams trigger strategy engagements:

- **Marketing / Ad Tech**: MMM architecture, attribution framework design, Meridian/Robyn migration advice
- **Pharma / Biotech**: clinical trial design review, hierarchical model strategy
- **Finance / Insurance**: risk model architecture, uncertainty quantification frameworks
- **FMCG / CPG**: shelf optimization strategy, trade measurement design
- **Agriculture**: spatial modeling strategy, yield uncertainty frameworks

> "We solve high-stakes problems across diverse sectors, including Pharma (clinical trials), Aerospace (reliability), Marketing (MMM/CLV), and Finance (risk). While our methods are universal, our experience spans from Fortune 500 giants to pioneering startups like SpaceX."
— Halah draft FAQ

---

## Client Examples (Strategy & Advisory engagements)

### Haleon (ongoing EAP)
- Nathan Kafi's team doing Bayesian testing; PyMC Labs advises on feature requests + trains the team
- Quote: "Their advisory role in delivering new feature requests and training our team has been invaluable"
- Sources: pymc-labs.com, EAP page

### Fox Entertainment (EAP Coaching)
- Small DS team needed to punch above weight; EAP coaching structured to span full delivery lifecycle
- Quote: "Sessions supported every delivery phase from research to deployment"
- Source: EAP page

### Fabletics (EAP)
- Specific advisory on time-varying coefficients for MMM seasonality
- Source: EAP page

### Indigo Agriculture (strategy → delivery)
- Initial engagement was advisory (Manu Martinet: "I was able to set up an initial model and get some interesting results and get buy-in internally to go further") → then additional expertise to take model to production
- Quote: "that's where additional expertise was very helpful to get the model to the finish line and to production"
- Source: pymc-labs.com testimonials

### HelloFresh (follow-on EAP after delivery)
- After completing SOW 1, continued as EAP at $8,000/month
- Source: analysis/discord-case-studies-extraction.md

---

## Process / How It Works

### Discovery and Alignment (Step 01)
"We start by exploring your decisions, data, and uncertainty. This helps identify high-impact opportunities and guides every step of our Bayesian approach."
— Halah draft "Our Approach" section

### Solution Design (Step 02)
"We turn insights into solutions. Using Bayesian thinking, technical expertise, and domain knowledge, we design models, systems, or teams that deliver real impact."
— Halah draft "Our Approach" section

### Integration & Growth (Step 03)
"We integrate solutions into workflows, enable your teams, and continuously refine models, systems, and processes to ensure lasting impact and growth."
— Halah draft "Our Approach" section

---

## CTA Section

### Primary CTA (from live site)
- **Headline:** "Ready to Transform Your Data Strategy?"
- **Body:** "Unlock the full potential hidden in your data. Partner with PyMC Labs and experience firsthand how Bayesian AI can drive smarter decisions, clearer insights, and measurable growth."
- **Button:** "Let's talk about your next breakthrough!"

### EAP-specific CTA (from EAP page)
- "Book a conversation with us here" → Calendly: calendly.com/niall-oulton

### Sales-preferred framing
> "no emails. Keep everything strictly to Discord... Hands on keyboards is $385 per hour."
— Niall + Evan, #sales, 2024-11-19

<!-- GAP: No specific "Strategy & Advisory" CTA copy written yet — Halah to confirm preferred CTA for this page vs. generic EAP CTA -->

---

## Cross-References

- **Expert Access Program landing page**: `/blog-posts/expert-access-program` — primary product page for this service
- **Solution Delivery** (`/services/solution-delivery`): when advisory leads to a full build engagement
- **Embedded Teams** (`/services/embedded-teams`): when advisory extends into sustained on-the-ground co-working
- **Training & Enablement** (`/services/training-enablement`): when advisory includes structured upskilling (workshops, cohort courses)
- **Contact** (`/contact`): primary CTA destination; EAP entry point via Calendly
- See also: `content/about/story-and-team.md` for team pedigree supporting advisory credibility

---

## Gaps

<!-- GAP: No formal "Strategy & Advisory" case study exists — case studies tend to be delivery-focused; consider framing Haleon or Indigo as advisory success stories -->
<!-- GAP: No published rate card for EAP — pricing is confidential; page should say "contact us" not publish rates -->
<!-- GAP: Halah has not written final page copy for strategy-advisory.md specifically — the "Transforming Ideas Into Scalable Solutions" hero is generic to all services -->
<!-- GAP: Need to confirm if EAP is the sole product under this pillar or if there are standalone "advisory sprint" / scoping SKUs -->
<!-- GAP: scoping/discovery projects ($40k–$70k range for MMM scoping) may belong under this pillar — confirm with Thomas/Niall -->

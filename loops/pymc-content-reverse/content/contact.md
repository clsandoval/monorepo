---
page: contact
title: Contact Us
status: complete
sources:
  - analysis/website-scrape/contact.md
  - analysis/website-scrape/crawl-remaining.md
  - analysis/discord-sales-extraction.md
  - analysis/halah-draft-scrape.md
  - analysis/discord-marketing-extraction.md
---

# Contact Us

## Hero / Page Intro

### Headline (live site)
"Have questions, ideas, or a project in mind? We'd love to hear from you."

### Response Promise (live site)
"Our team will get back to you as soon as possible."

### Footer CTA Variant (Halah draft)
"Let's Chat, We Respond Fast"

### Sub-headline (Halah draft — from FAQ section intro)
"Get quick answers about working with us and our approach to Bayesian solutions."

---

## Contact Form

### Live Site Fields

| Field | Type | Required |
|-------|------|----------|
| First Name | text | yes |
| Last Name | text | yes |
| Email | text | yes |
| Phone Number | text | no |
| Inquiry Category | dropdown | yes |
| How did you hear about us? | dropdown | yes |
| Message | textarea | yes |

### Inquiry Category Options (live site)
1. Expert Access Program
2. Workshop
3. Consulting And Custom Bayesian Models
4. MMM Insights Agent
5. General Inquiry

**Note for new site:** These categories should be reconciled with the updated 4-pillar service framework:
- Strategy & Advisory (maps to: Expert Access Program)
- Solution Delivery (maps to: Consulting And Custom Bayesian Models)
- Training & Enablement (maps to: Workshop)
- Solutions (maps to: MMM Insights Agent → Decision AI; Simba needs adding)

<!-- GAP: Finalize new-site inquiry category dropdown options to match updated service naming -->

### Discovery Source Options (live site)
1. Social media (LinkedIn, X, Bluesky)
2. Google search
3. Colleague or referral
4. GitHub / Open-source libraries
5. Newsletter or event
6. Other

**Internal context — actual lead source ranking from #inbound-leads (2020–2026):**
1. PyMC OSS / GitHub reputation (most common)
2. HelloFresh case study / blog posts (cited explicitly by Amtrak, AmEx, Just Eat, ASOS)
3. Conference talks (PyData, ODSC East, QWAFAFEW)
4. pymc-marketing GitHub book-a-call widget
5. LinkedIn inbound (especially after team member interview posts)
6. Learning Bayesian Statistics podcast (Alexandre Andorra — 12K monthly listeners)
7. Personal referrals from existing clients
8. Meridian / Robyn frustration (competitors as inadvertent referral source)

---

## Contact Information

| Type | Value |
|------|-------|
| Primary email | info@pymc-labs.com |
| Beta / Decision AI access | [email protected] |
| Phone | none listed |
| Physical address | none (fully distributed, remote-only company) |
| EAP calendar booking | calendly.com/niall-oulton (linked from EAP page) |

---

## Social Media Links

| Platform | Handle / URL | Notes |
|----------|-------------|-------|
| LinkedIn | linkedin.com/company/pymc-labs | 7,519 followers (early 2026) |
| GitHub | github.com/pymc-labs | Primary OSS repos (pymc-marketing, CausalPy, decision-hub) |
| X (Twitter) | @pymc_labs | Workshop promos, OSS milestones, event announcements |
| Bluesky | pymc-labs.bsky.social | |
| YouTube | @PyMCLabs | Meetup recordings, webinars |
| Meetup | PyMC Labs Online Meetup | Meetup Pro network |

---

## FAQ Section

The five questions below come directly from sales call analysis — Halah compiled them as "the top 5 questions heard from sales enquiries" (— Halah, #sales, 2026-01-16). The answers are from Halah's Framer draft (`/pricing` page) and are polished, ready-to-use copy.

**Q: Which industries do you specialize in?**
A: We solve high-stakes problems across diverse sectors, including Pharma (clinical trials), Aerospace (reliability), Marketing (MMM/CLV), and Finance (risk). While our methods are universal, our experience spans from Fortune 500 giants to pioneering startups like SpaceX.

**Q: Do you offer full technical implementation or just advisory?**
A: We are builders, not just advisors. While we provide strategic guidance, our core strength lies in end-to-end implementation — from initial model architecture to deploying production-ready Bayesian systems within your existing tech stack.

**Q: Can you help us optimize or customize our existing models?**
A: Yes. Many of our clients have existing Bayesian workflows that need more "rigor." We can audit your current models, improve their sampling efficiency, and customize them to handle your specific data constraints or business logic using the latest PyMC innovations.

**Q: Do you provide training and workshops tailored to our company?**
A: Absolutely. Unlike generic courses, our workshops are custom-built for your team. We use your industry-specific data and real-world business problems to ensure your data scientists gain practical, immediately applicable Bayesian skills.

**Q: Can we hire your team to work alongside our internal staff?**
A: Yes, through our Embedded Teams model. Our experts work directly within your Slack channels and GitHub repos, providing hands-on support that accelerates project delivery while naturally upskilling your internal team through daily collaboration.

---

## Entry Points / Engagement CTAs

The contact page should surface multiple engagement paths, not just a generic form.

### 1. Expert Access Program (primary "foot in the door")
- **Base: Expert Lifeline** — direct expert channel, 1 business day response, implementation guides library
- **Pro: Deep Partnership** — bi-weekly coaching calls, bi-monthly Expert Exchange Sessions, priority early tool access, custom workshop development, strategic consultation
- Pricing: $5,000–$14,000/month (not publicly disclosed; internal range)
- Book: calendly.com/niall-oulton
- Testimonials:
  > "The PyMC Labs Coaching program transformed our small Data Science team, enabling results matching a full-scale department. Sessions supported every delivery phase from research to deployment."
  — Eugene Kwok, Fox Entertainment
  > "PyMC Labs significantly enhanced our testing capabilities by leveraging Bayesian programming. Their advisory role and team training have been invaluable, driving substantial improvements in our operations."
  — Nathan Kafi, Principal Data Scientist, Haleon
  > "PyMC Labs implemented time-varying coefficients improving seasonality capture in marketing mix models. The team proved collaborative, insightful, and consistently supportive."
  — Kate Hirth, Fabletics

### 2. Solution Delivery (Custom Build)
- Bespoke Bayesian models, MMM systems, AI agents
- Engagement: Statement of Work + MSA
- Contact form: "Consulting And Custom Bayesian Models" category
<!-- GAP: public-facing rate card not published; internal only ($37k–$90k/month by level) -->

### 3. Training & Workshops (Corporate)
- On-site or remote; custom curriculum using client's own data
- Rate: ~$20,000–$30,000 per engagement (Thomas-confirmed internally; ~$10k/8hrs in #sales)
- Past corporate clients: SIXT, Keywords Studios, Schwab, HelloFresh, P&G, Wärtsilä, IQVIA, Progressive, Gain Theory, Vinted
- Contact form: "Workshop" category

### 4. Decision AI / MMM Insights Agent (Product)
- Beta access email: [email protected]
- Pilot tiers: $10,000/month (self-serve with developer support) or $50,000/month (guided with dedicated DS, 2-month minimum)
- Contact form: "MMM Insights Agent" category

### 5. Open Cohort Courses
- Applied Bayesian Modeling: $1,499
- Bayesian Marketing Analytics: $2,249
- Causal Inference for Business Impact: ~$2,249 (in development, May–Jun 2026)
- Agentic Data Science (co-brand with Vanishing Gradients): $1,900, May 12–21 2026
- → pymc-labs.com/courses

---

## Supporting Copy / Value Prop

### Short pitch (Halah, Sept 2025 — networking events)
> "PyMC Labs is a data science consultancy that specializes in Bayesian AI. In plain terms, we help organizations continuously learn from data. Instead of treating analysis as a one-off answer, we build models that update as new information comes in — just like people naturally do."
— Halah, #sales, 2025-09-03

### Long pitch (Halah, Sept 2025)
> "PyMC Labs is a data science consultancy that specializes in Bayesian AI. What that means is we help organizations make smarter, more reliable decisions when the future is uncertain. Traditional analytics and machine learning often gives you a black-box prediction with little room for nuance. Bayesian AI, on the other hand, lets us build models that are transparent about uncertainty, combine expert knowledge with data, and update as new information comes in."
— Halah, #sales, 2025-09-03

### 4-pillar framework tagline (Halah + James Dodge, Feb 2026)
> "Strategy and Advisory > We Advise
> Solution Delivery > We Build
> Training and Enablement > We Teach
> Embedded Teams > We Work By Your Side"
— Halah, #sales, 2026-02-21

> "I really like this framework! From a crisp messaging perspective to a NON TECHNICAL audience, I like 'we advise, we build...' as the first, and likely most memorable, part of our narrative. Clean, accurate, memorable."
— James Dodge, #sales, 2026-02-21

---

## Footer Elements

### Newsletter Signup
- Present on all pages including contact (live site confirmed)
<!-- GAP: Newsletter CTA copy / headline text not captured -->

### Footer CTA (Halah draft)
- Headline: "Let's Chat, We Respond Fast"
- Email: info@pymc-labs.com
- Social links: LinkedIn, X, BlueSky, GitHub

### Footer Tagline (live site)
"The Bayesian AI Consultancy"

---

## ICP Context (for developer awareness / internal)

Who contacts PyMC Labs:
> "Our audience is companies that have some level of analytics and data science capabilities. They are interested in internalizing these capabilities."
— Luca, #sales, 2026-03-05

> "Competition is intuitive-based human decision making and Excel spreadsheets... I don't think I encountered ML as even a consideration on a single sales call."
— Thomas, #sales, 2023-04-21

Buyer personas:
- CMO / VP Marketing (primary marketing analytics buyer)
- Head / VP / Director of Data Science (technical capability buyer)
- CDAO (enterprise data transformation buyer)

Typical pain points driving contact:
- In-house DS team gets bogged down or stuck
- Have a working model, can't scale it to production or new markets
- No in-house Bayesian expertise; can't hire fast enough
- Black-box ML not acceptable to stakeholders (need explainability)
- Frustrated by Meridian / Robyn limitations; seeking expert guidance

---

## Gaps

<!-- GAP: New-site inquiry category dropdown options not finalized — align with 4-pillar service framework + Solutions (Simba, Decision AI) -->
<!-- GAP: Calendar booking for new site not confirmed — currently only Niall's personal Calendly linked from EAP page; may need centralized booking widget -->
<!-- GAP: Newsletter CTA / signup copy not captured -->
<!-- GAP: No physical office address (fully distributed) — confirm if this should be noted on new contact page or omitted -->
<!-- GAP: Halah has not written final contact page copy for new site (as of Mar 2026) -->
<!-- GAP: EAP pricing is not public — contact form is primary conversion mechanism; copywriter needs to decide whether to hint at price range to qualify leads -->

# Halah Draft — Pricing Page
**Aspect:** halah-draft-pricing
**Date:** 2026-03-13
**Source:** https://loyal-growth-093412.framer.app/pricing (Playwright)

---

## ⚠️ Important Note: Template Placeholder Pricing

The pricing tiers shown on the Framer draft are **Aurazen template placeholders** — not PyMC Labs actual pricing. The tier names (Essential/Growth/Scale) and prices ($1999/$3999/$6999/year) are boilerplate from the Framer template that hasn't been customized for PyMC Labs yet.

**Evidence:**
- Footer still shows "© 2025—All rights reserved. Aureus.Design" (Aurazen template credit)
- Social links point to dribbble.com, instagram.com, x.com (template defaults)
- Email link href is `mailto:hello@aurazen.com` (display shows `info@pymc-labs.com`)
- Pricing tiers describe "web design" services (not Bayesian consulting)

**Actual PyMC Labs pricing model** is documented in the Expert Access Program page on the live website. See `analysis/website-scrape/crawl-remaining.md` → "Expert Access Program" section.

---

## Page Structure

### Hero Section
- **Page title:** "Clear Pricing for All Growth Stages"
- **Subtext:** "Honest, growth friendly pricing that scales with your business. No hidden fees."
- **Social proof badge:** "59+ Reviews on Trustpilot"
- **CTA:** "See Our Works" (links to ./work)
- **Toggle:** Monthly / Yearly pricing options

### Pricing Tiers (Template Placeholders — NOT PyMC Labs Pricing)

| | Essential | Growth | Scale |
|---|---|---|---|
| **Price** | $1,999/yr | $3,999/yr | $6,999/yr |
| **Target** | Businesses ready to level up digital presence with professional website + brand identity | Companies needing ongoing design and development across web, brand, and product | Established businesses needing a dedicated team for all digital needs |
| **Team** | 2 members | 3 members | Unlimited |
| **Active Projects** | 1 at a time | 2 at a time | 4 at a time |
| **Communication** | Discord | Discord | Discord |
| **Design Iterations** | Monthly | Weekly | Unlimited |
| **Response Time** | 48 hours | 24 hours | 1 hour |
| **Min Commitment** | 3 months | 2 months | 1 month |
| **Other** | Web Design + Dev, Basic Brand Design | Product Design, Full Brand Identity | Advanced Motion Graphics, Full Brand Strategy |
| **Callout** | — | 🔥 Save 20% | — |

**CTA:** "Get Started Today" (links to ./contact) on each tier

**Custom CTA:** "Call for Custom Services" (links to ./contact)

---

## FAQ Section (AUTHENTIC PyMC Labs Content)

This section contains genuine PyMC Labs positioning and is valuable for the new site.

**Q: Which industries do you specialize in?**
> "We solve high-stakes problems across diverse sectors, including Pharma (clinical trials), Aerospace (reliability), Marketing (MMM/CLV), and Finance (risk). While our methods are universal, our experience spans from Fortune 500 giants to pioneering startups like SpaceX."

**Q: Do you offer full technical implementation or just advisory?**
> "We are builders, not just advisors. While we provide strategic guidance, our core strength lies in end-to-end implementation—from initial model architecture to deploying production-ready Bayesian systems within your existing tech stack."

**Q: Can you help us optimize or customize our existing models?**
> "Yes. Many of our clients have existing Bayesian workflows that need more 'rigor.' We can audit your current models, improve their sampling efficiency, and customize them to handle your specific data constraints or business logic using the latest PyMC innovations."

**Q: Do you provide training and workshops tailored to our company?**
> "Absolutely. Unlike generic courses, our workshops are custom-built for your team. We use your industry-specific data and real-world business problems to ensure your data scientists gain practical, immediately applicable Bayesian skills."

**Q: Can we hire your team to work alongside our internal staff?**
> "Yes, through our Embedded Teams model. Our experts work directly within your Slack channels and GitHub repos, providing hands-on support that accelerates project delivery while naturally upskilling your internal team through daily collaboration."

---

## Actual PyMC Labs Engagement Model (from live website)

Source: `analysis/website-scrape/crawl-remaining.md` → Expert Access Program section

### Expert Access Program (EAP)
Ongoing engagement program for teams that need continuous expert guidance beyond project completion.

**Tagline (implied):** Ongoing expert guidance for teams with expertise gaps, without permanent headcount.

#### Base Package: Expert Lifeline
- Direct expert communication channel (1 business day response priority)
- Growing library of implementation guides and best practices
- Access when roadblocks occur (diagnostics, sampling issues, modeling decisions)

#### Pro Package: Deep Partnership & Strategic Guidance
Everything in Base, plus:
- Bi-weekly coaching calls with domain-matched dedicated experts
- Bi-monthly Expert Exchange Sessions (case studies, emerging methods, industry trends)
- Priority access to new PyMC Labs tools and early feature previews
- Custom workshop development for specific modeling challenges
- Strategic consultation on measurement frameworks, analytics roadmaps, stakeholder alignment

#### Target Audience
Teams that have completed projects with PyMC Labs (or independently) and need ongoing support. Addresses hiring gap: "Traditional consulting ends when projects finish; hiring is expensive and slow."

#### Testimonials for EAP
- **Eugene Kwok, Fox Entertainment:** "The PyMC Labs Coaching program transformed our small Data Science team, enabling results matching a full-scale department. Sessions supported every delivery phase from research to deployment."
- **Nathan Kafi, Haleon:** "PyMC Labs significantly enhanced testing capabilities through Bayesian programming expertise. Their advisory role on feature requests and team training drove substantial operational improvements."
- **Kate Hirth, Fabletics:** "PyMC Labs implemented time-varying coefficients improving seasonality capture in marketing mix models. The team proved collaborative, insightful, and consistently supportive."

#### Expert Perspectives on EAP
- **Juan Orduz:** "EAP provides actionable mentorship on statistical models for efficient decision-making while enabling PyMC to learn from real-world user needs."
- **Tim McWilliams:** "The collaborative nature helps clients overcome obstacles and build modeling confidence, creating sustained, impactful model development."
- **Daniel Saunders:** "Deep Bayesian expertise clears roadblocks consuming weeks, freeing client data scientists to focus on domain expertise."
- **Carlos Trujillo:** "Advanced statistical thinking bridges real-world decision-making, transforming uncertainty into clarity."
- **Teemu Säilynoja:** "Teaching fundamentals enables clients to diagnose and solve problems independently."
- **Bill Engels:** "The goal involves teaching clients model fundamentals so they can troubleshoot independently while collaborating on complex problems."

---

## Implications for New Site

1. **Pricing page likely needs custom content** — Halah hasn't filled in PyMC Labs-specific engagement tiers yet. The Framer template structure (3 tiers + FAQ) could work but needs real content.

2. **EAP is the real engagement model** — Base (Expert Lifeline) + Pro (Deep Partnership). These two tiers should likely replace Essential/Growth/Scale.

3. **FAQ content is ready to use** — 5 questions with polished PyMC Labs answers covering: industries, advisory vs. implementation, model optimization, custom training, embedded teams.

4. **Discord communication** is listed as the default channel for client communication in all template tiers — consistent with how PyMC Labs actually operates (Discord-first organization).

5. **Custom/enterprise pricing** path exists — "Call for Custom Services" CTA suggests a third tier for bespoke engagements.

---

## Cross-References
- `analysis/website-scrape/crawl-remaining.md` → Expert Access Program (real pricing model)
- `analysis/halah-draft-scrape.md` → Services page (engagement context)
- `analysis/website-scrape/services.md` → Service descriptions

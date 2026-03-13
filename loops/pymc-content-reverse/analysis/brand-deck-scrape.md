# Brand Deck Scrape — analysis/brand-deck-scrape.md

**Source:** https://pymc-brand-deck.netlify.app/
**Scraped:** 2026-03-13
**Title:** PyMC Labs — UI Treatment Deck
**Subtitle:** New website brand treatment — Framer (marketing) + Astro (content) — March 2026

---

## Overview

This is a 13-section UI treatment / brand specification deck for the new PyMC Labs website rebuild. It defines visual identity, component system, and page treatments for both the Framer marketing site and Astro content site.

**Positioning tagline confirmed:** "The Probabilistic AI Consultancy"

---

## Section 01 — Design Philosophy

**Master positioning statement:**
> "Bold enough for enterprise buyers, warm enough for data scientists."

**Three brand pillars:**

1. **Precision** — "Sharp rectangles, measured whitespace, CI accent stripes. Every element placed with the care of a well-specified model."
2. **Confidence** — "Soft gradient blobs as visual motifs. Organic color drift that feels alive — the Bayesian way."
3. **Approachability** — "Soft pastels keep rigorous content from feeling cold. The palette invites exploration, not intimidation."

**Stat shown in hero example:** 42.7% Lift in ROAS

---

## Section 02 — Color System

**Rule:** Five colors. Strict ratios. **60-70% dominant / 20-30% supporting / 5-10% accent**

| Role | Name | Hex |
|------|------|-----|
| Dominant (60-70%) | Deep Navy Blue | `#0C1F40` |
| Supporting (20-30%) | Pastel Aqua | `#B4E7DD` |
| Supporting | Soft Periwinkle | `#9FAAE2` |
| Dominant | Soft White | `#F7F7F7` |
| Accent — Data Viz Only | Peach Orange | `#F6AE72` |

**Critical constraint:**
> "Peach Orange is reserved exclusively for data visualization accents — chart highlights, KPIs, trend indicators. Never for buttons, backgrounds, or tags."

---

## Section 03 — Typography

**System:** "Two fonts. One variable axis."

**Fonts:**
- **Display/Headlines:** Archivo (variable `wdth` axis, 62.5–125)
- **Body/UI:** Inter
- **Serif Accent:** Lora (used for testimonial quotes)

**Archivo variable width axis:**
- `wdth: 125` (Expanded) — Display headlines
- `wdth: 112.5` (Semi-Expanded) — Subheadings
- `wdth: 100` (Normal) — Not used in brand

**Type scale:**
| Style | Size | Usage |
|-------|------|-------|
| Display | 56-72px | Major hero headlines |
| H1 | 40-48px | Page titles |
| H2 | 28-36px | Section headers |
| H3 | 22-26px | Card/subsection titles |
| Body | 18px standard / 22px large | Running text |
| Serif Accent | — | Testimonial quotes (Lora) |
| Metric | — | Stats/numbers |

**Example copy per type level:**
- Display: "The Probabilistic AI Consultancy"
- H1: "Making Decisions Under Uncertainty"
- H2: "Bayesian Marketing Analytics"
- H3: "Custom Statistical Models"
- Body: "We create custom statistical models that take into account business specifics, help make decisions under uncertainty, and accurately assess risks."
- Serif Accent: "Their Bayesian approach gave us confidence in our budget allocation decisions."
- Metric: $2,249

---

## Section 04 — Gradient System

**System:** CSS blur blobs on a white base.

> "Soft organic color that drifts in from the edges. The center stays light for content. Three tiers control intensity — from animated hero blobs to static card fills."

**Tiers:**
- **Tier 1 (Full Intensity):** Hero sections, cover. Animated blobs + dots texture.
- **Tier 2 (Medium Static):** Section backgrounds, testimonials. Soft color wash, no animation.
- **Tier 3** (implied): Card fills — blob and wave gradient fills for blog cards without photography.

---

## Section 05 — Components: Buttons, Tags, Pills

**Button specs:**
- Height: 44px desktop / 38px mobile
- Light background variants: Primary (aqua fill), Secondary (navy border), Ghost
- Dark background variants: Primary-dark, Secondary-dark

**Button copy examples:**
- "Get Started" (primary, light)
- "Learn More" (secondary, light)
- "View Details" (ghost, light)
- "Schedule Consultation" (primary, dark)

**Tags & Pills (examples):**
- Category tag: "Marketing Mix Models"
- Category tag: "Causal Inference"
- Author pill: "Thomas Wiecki"
- Date pill: "March 2026"
- Status pill: "Waiting List"
- Status pill: "Featured"

---

## Section 06 — Components: Card System

> "Every card gets a CI accent stripe — layered opacity bands on the left edge. Blog cards alternate between blob and wave gradient fills when no photo is provided, creating visual variety across the grid."

**Blog card grid examples (mock content for layout purposes):**
1. Tag: "Marketing Mix Models" | "Bayesian Media Mix Modeling for Enterprise" | Thomas Wiecki · Mar 2026
2. Tag: "Causal Inference" | "Causal Impact Analysis with PyMC" | Benjamin Vincent · Feb 2026
3. Tag: "Time Series" | "Probabilistic Forecasting at Scale" | Juan Orduz · Jan 2026
4. Tag: "Gaussian Processes" | "GP Regression for Spatial Data" | Bill Engels · Dec 2025
5. Tag: "PyMC Core" | "What's New in PyMC 6.0" | Thomas Wiecki · Nov 2025
6. Tag: "Bayesian Modeling" | "Hierarchical Models in Practice" | Ravin Kumar · Oct 2025

**Stat card examples:**
- "100+" / "Enterprise Clients"
- "52" / "Published Articles"

**Team card (compact) example:**
- Avatar initials: TW
- Name: Thomas Wiecki
- Role: Founder
- Tags: Bayesian ML, PyMC

**Team card (byline) example:**
- Avatar: TW
- Name: Thomas Wiecki
- Meta: March 10, 2026 · 12 min read

---

## Section 07 — Navigation

**Platform:** Shared across Framer (marketing) & Astro (content). "Pixel-identical on both platforms. Glassmorphism on scroll."

**Specs table:**
| Property | Value |
|----------|-------|
| Height | 64px desktop / 56px mobile |
| Background | White 92% + blur(12px) |
| Position | Sticky, z-index 50 |
| Active indicator | Aqua underline 2px |
| Mobile | Hamburger → full-screen overlay |

**Logo rules in nav:**
| Property | Value |
|----------|-------|
| Form | Full logotype (icon + wordmark) |
| Color | Navy on light / White on dark |
| Safe zone | 1x on all sides |
| Never | Tilt, recolor, distort, shadow |

---

## Section 08 — Page Treatment: Homepage Hero

> "The hero uses **Tier 1** animated blur blobs on a white base with dots texture. Title and CTA buttons sit at the bottom of the viewport."

**Hero headline:** "The Bayesian AI Consultancy"
*(split across two lines: "The Bayesian" / "AI Consultancy")*

**CTA buttons:**
- "Get Started" (primary)
- "Learn More" (secondary)

---

## Section 09 — Page Sections: CTA Band & Testimonials

**CTA band headline:**
> "Ready to make better decisions under uncertainty?"

**CTA button:** "Schedule a Consultation"

**Testimonial example (mock):**
> "PyMC Labs transformed our marketing analytics. Their Bayesian approach gave us confidence in our budget allocation decisions that traditional methods never could."
> — Jane Doe, VP Marketing, Enterprise Corp

*Note: This is placeholder copy for layout purposes; real testimonials are in analysis/website-scrape/home.md*

---

## Section 10 — Astro Content: Blog Post Treatment

**Blog post example:**
- Title: "Bayesian Media Mix Modeling for Modern Marketers"
- Author/meta: Thomas Wiecki · March 10, 2026 · 12 min read
- Tag: Marketing Mix Models

**Opening paragraph:**
> "Marketing Mix Modeling (MMM) has experienced a **renaissance** thanks to Bayesian methods. Traditional frequentist approaches struggle with the high dimensionality and collinearity inherent in marketing data."

**Second paragraph (with internal links):**
> "With PyMC, we can encode prior knowledge about [adstock transformations] and [saturation curves] directly into our models."

**Code block example:**
```python
import pymc as pm
import numpy as np

with pm.Model() as mmm:
    beta = pm.Normal("beta", mu=0, sigma=1)
    alpha = pm.HalfNormal("alpha", sigma=0.5)
```

**Pull quote:**
> "The Bayesian approach allows us to incorporate domain expertise directly into the model, producing more realistic and actionable results."

**Math display:** P(θ | D) ∝ P(D | θ) · P(θ)

---

## Section 11 — Astro Content: Course Pages

**Course cards (three confirmed courses):**

| Course | Instructors | Format | Price | Status |
|--------|-------------|--------|-------|--------|
| Applied Bayesian Modeling | Downey, Leos Barajas, Fonnesbeck | 8-week cohort | $1,499 | Waiting List |
| Bayesian Marketing Analytics | McWilliams, Trujillo, Vincent, Allen | 8-week cohort | $2,249 | Waiting List |
| AI-Assisted Data Science | Bowne-Anderson, Wiecki, Fiaschi | Intensive | $2,000 | Waiting List |

**CTA buttons per course:** "View Curriculum" + "Join Waiting List"

*Note: "AI-Assisted Data Science" course with Hugo Bowne-Anderson is NEW — not on live site. This is a fourth course not seen on pymc-labs.com/courses/*

---

## Section 12 — Logo System

**Statement:** "The rocket mark is sacred."

**Forms:**
- Full logotype (icon + wordmark)
- Standalone icon

**Rules:**
| Property | Value |
|----------|-------|
| Safe zone | 1x on all sides (x = half icon width) |
| Min size | 80px width (digital) |
| Color | Always single flat color |
| Forms | Full logotype or icon only |

**Color variants:**
- Navy on Light
- Aqua on Dark
- Navy on Aqua

**Never:**
- Tilt or rotate the logo
- Apply gradients or multi-color fills
- Add drop shadows or outlines
- Rearrange icon and wordmark
- Distort proportions

---

## Section 13 — Shared Component: Footer

**Footer tagline:** "The probabilistic AI consultancy. Data science consulting firm specializing in Bayesian AI."

**Newsletter CTA:** Email field + "Subscribe" button

**Footer columns:**

**Company:** About, Team, Clients, Contact

**Courses:** Applied Bayesian, Regression Modeling, Marketing Analytics, AI-Assisted DS

**Resources:** Blog, Podcast, Privacy Policy, Terms, Impressum

**Connect:** Twitter / X, LinkedIn, GitHub, Bluesky

**Copyright:** © 2026 PyMC Labs. All rights reserved.

---

## Key Insights & Cross-References

### New Course Discovered
- **AI-Assisted Data Science** ($2,000, Intensive) — instructors: Hugo Bowne-Anderson, Thomas Wiecki, Luca Fiaschi. This course does NOT appear on the current live website. Cross-reference: `content/courses/` needs a 4th course file.

### Tech Stack Confirmed
- Marketing site: **Framer**
- Content/blog site: **Astro**
- Both share identical nav component

### Brand Voice Clarity
- Never cold, never intimidating
- Technical rigor made accessible
- Serif (Lora) only for testimonials/quotes
- Peach Orange = data viz only (strong constraint)

### Stat Card Numbers (official "social proof" numbers)
- **100+** Enterprise Clients
- **52** Published Articles
- **42.7%** Lift in ROAS (example metric, likely real from a case study)

### Footer navigation reveals additional pages
- Podcast (not in current sitemap — new discovery)
- Privacy Policy, Terms, Impressum (legal pages)
- "Clients" page (separate from case studies)

---

## Gaps / Flags

<!-- GAP: No brand voice examples for "Services" or "About" page copy beyond body text example -->
<!-- GAP: Podcast page not in sitemap — needs investigation -->
<!-- GAP: "Clients" footer link not in sitemap — could be a dedicated clients/logos page -->
<!-- GAP: AI-Assisted Data Science course needs its own content file -->
<!-- GAP: No example imagery or photo guidelines described (only gradient system) -->

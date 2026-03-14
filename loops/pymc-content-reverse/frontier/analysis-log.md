# Analysis Log

| # | Timestamp | Aspect | Duration | Key Findings |
|---|-----------|--------|----------|--------------|
| 51 | 2026-03-14 | assemble-industry-finance | — | Assembled content/industries/finance-insurance.md. 4 named Finance/Insurance clients with full narratives: Everysk (PE VC index modeling via Bayesian SBG/cash flows, Ravin Kumar lead, published case study 2021), VisualVest (CLV for German robo-advisor, modified SBG for % AUM payments, SOW1+2 complete 2022-23, strong testimonial signal "not so common in consulting"), Nürnberger Versicherung (insurance analytics SLA started May 2025, active, Niall + Teemu Säilynoja), Schwab (corporate workshop, logo requires consent). 6 finance inbound prospects: Bondora/Swisscard/KBC/Ethos Life/PayPal/Chicago Trading Company. 6 use cases: PE/VC index modeling, CLV for FS, insurance risk pricing, MMM for FS marketing, causal inference, quant strategy. Thomas Wiecki keynote at Insurance Data Science (Jun 2021). Causal DAG investing blog (Camilo, March 2026). GAPS: no direct finance client testimonial on website (VisualVest paraphrase strongest), Nürnberger results sparse, BNP Paribas / Swisscard / KBC conversion unknown. |
| 7 | 2026-03-13 | social-media-scan | — | LinkedIn: 7,519 followers, "The Bayesian AI Consultancy", founded 2020, 54 employees, tagline "Powering Decision-Making Through Bayesian Intelligence and Agentic AI." Twitter/X: @pymc_labs confirmed handle, follower count not scrapable (JS wall), recent tweets focus on workshops/courses/OSS milestones/partnerships. YouTube: https://www.youtube.com/c/PyMCLabs — subscriber count not scrapable; channel hosts meetup recordings + tutorials; confirmed ~10 recent video topics (Agentic Data Science Feb 2026, MMM State of Marketing Dec 2025, Synthetic Consumers Nov 2025, PyMC-Marketing vs Meridian Oct 2025, PyMC tutorial Aug 2025). Also found: Bluesky at bsky.app/profile/pymc-labs.bsky.social. Output: analysis/public/social-media.md |
| 6 | 2026-03-13 | website-services | — | No /services/* pages on pymc-labs.com (all 404). Site has 5 services as home-page tiles only. Halah draft has full /services page: Strategy & Technical Advisory, Custom Bayesian Models, Bayesian AI Solutions, Embedded Teams, Training & Workshops — each with description + 3 feature bullets. Also extracted "Our Approach" 3-step process + 5 FAQs. Mapped old→Halah→new sitemap. Discovered halah-draft-pricing aspect. Output: analysis/website-scrape/services.md |
| 5 | 2026-03-13 | website-team-individual-pages | — | Fetched all 32 team member individual pages. 30/32 have full bios. Benjamin Maier and Erik Ringen have no bio text (specializations only). Slug quirks: kusti-skyten (not kusti-skytén), teemu-saeilynoja (not teemu-sailynoja). Wrote 32 files to content/about/team-members/. Wrote analysis/website-scrape/team-members.md. |

## 2026-03-13 — discord-case-studies-threads

**Aspect**: discord-case-studies-threads
**Status**: Completed

**Channels mined** (25 total):
hellofresh-mmm, indigo, akili, appodeal, erisyon, gain-theory-mmm, roche, syngenta, supercell, alva-labs, swarovski, wegmans, nuernberger, fox-broadcasting-company, haleon, ll-bean, fabletics, real-madrid, dodgers, visualvest, live-nation, colgate-shelf-optim, colgate-cannibalization, takeda, hellofresh-se

**Key findings**:
- 25 client case studies documented with problem/approach/results/quotes structure
- Hard metrics: Swarovski MAE -20%, Roche 34K params on 250K obs in ~1hr, Wegmans MAPE 13-14%, Colgate GPU sampling 10+hr/chain → 6hr total (4 chains)
- Notable client quotes: Fox "feels like part of their team", VisualVest "not so common in consulting services to challenge"
- Engagement model breakdown: SLA $5K-8K/mo, Custom projects $50K-$500K, EAP monthly retainer
- Sports: Real Madrid archived (coach change), Dodgers active EAP, Supercell active EAP
- Active clients (2025-2026): Supercell, Dodgers, Wegmans, Nuernberger, Fox, HelloFresh SE, Gain Theory SLA

**Output**: analysis/discord-case-studies-extraction.md (1276 lines)

# Frontier — PyMC Content Gathering

## Statistics
- Total aspects discovered: 74
- Analyzed: 16
- Pending: 58
- Convergence: 22%

## Pending Aspects (ordered by dependency)

### Wave 1: Source Indexing
Map all sources before extracting. These must complete before Wave 2.

- [x] discord-index — Read input/discord/index.jsonl + users.jsonl, write analysis/discord-channel-map.md with every channel name, category, msg_count, date range
- [x] discord-category-triage — Read the channel map, classify each category as relevant/irrelevant to the sitemap, write analysis/discord-relevant-channels.md
- [x] website-home — WebFetch https://www.pymc-labs.com/, save to analysis/website-scrape/home.md
- [x] website-about — WebFetch the about page, save to analysis/website-scrape/about.md
- [x] website-team-individual-pages — WebFetch /team/{slug}/ for all 32 team members; save bios to analysis/website-scrape/team-members.md
- [x] website-services — WebFetch the services page(s), save to analysis/website-scrape/services.md
- [x] website-case-studies — WebFetch case studies page(s), save to analysis/website-scrape/case-studies.md
- [x] website-courses — WebFetch courses/training page(s), save to analysis/website-scrape/courses.md
- [x] website-blog-index — WebFetch the blog listing page, save to analysis/website-scrape/blog-index.md
- [x] website-resources — WebFetch any resources/open-source pages, save to analysis/website-scrape/resources.md
- [x] website-contact — WebFetch the contact page, save to analysis/website-scrape/contact.md
- [x] website-crawl-remaining — Check for any pages not yet scraped (sitemap.xml, nav links), scrape them
- [x] halah-draft-scrape — WebFetch https://loyal-growth-093412.framer.app/, save to analysis/halah-draft-scrape.md
- [x] halah-draft-pricing — Playwright: navigate to https://loyal-growth-093412.framer.app/pricing, extract all pricing/engagement-model content, save to analysis/halah-draft-pricing.md
- [x] brand-deck-scrape — WebFetch https://pymc-brand-deck.netlify.app/, save to analysis/brand-deck-scrape.md
- [x] github-org-scan — WebSearch/WebFetch PyMC Labs GitHub org, list repos + descriptions, save to analysis/public/github-org.md
- [ ] social-media-scan — WebSearch PyMC Labs on LinkedIn, Twitter/X, YouTube. Save to analysis/public/social-media.md
- [ ] press-mentions — WebSearch for PyMC Labs press, interviews, podcast appearances. Save to analysis/public/press.md
- [ ] brand-deck-podcast — WebSearch/WebFetch for PyMC Labs podcast (found in brand deck footer nav). Find URL, episode list, descriptions; save to analysis/public/podcast.md
- [ ] brand-deck-course-ai-assisted — Investigate "AI-Assisted Data Science" course ($2,000, Hugo Bowne-Anderson/Wiecki/Fiaschi) found in brand deck but NOT on live site. Search Discord + web for curriculum/description; save to analysis/course-ai-assisted.md

### Wave 2: Discord Channel Mining
Read each relevant channel and extract content tagged by sitemap page. One aspect per channel/cluster.
These aspects will be **self-expanded** after discord-category-triage completes. Initial set based on known channel names:

- [ ] discord-general — Read #general, extract company-wide announcements, positioning, vision
- [ ] discord-website — Read #website channel(s), extract previous website discussions, content decisions
- [ ] discord-marketing — Read marketing-related channels, extract brand messaging, positioning, campaigns
- [ ] discord-sales — Read sales/leads channels, extract client pain points, value props, objections
- [ ] discord-case-studies-threads — Read client project channels (arc-brown, roche, hellofresh, appodeal, indigo, etc.), extract case study material per client
- [ ] discord-decision-ai — Read #decision-ai and related channels, extract product descriptions, features, roadmap
- [ ] discord-simba — Read #simba channel, extract product descriptions, features, use cases
- [ ] discord-courses-workshops — Read workshop/course channels (bayesian-mktg-analytics, applied-bayesian-regression, etc.), extract course descriptions, curriculum, outcomes
- [ ] discord-partnerships — Read partnership-related channels (databricks-partnership, etc.), extract partner info
- [ ] discord-pymc-ecosystem — Read #pymc-ecosystem, #causalpy, #pymc-marketing, extract OSS project descriptions
- [ ] discord-org-team — Read #org channel, extract team structure, roles, bios
- [ ] discord-finances — Read #finances for pricing signals, business model info
- [ ] discord-competition — Read #competition for competitive positioning, differentiators
- [ ] discord-client-channels-batch-1 — Read next 10 client channels from relevant list, extract case study material
- [ ] discord-client-channels-batch-2 — Read next 10 client channels, extract case study material
- [ ] discord-client-channels-batch-3 — Read next 10 client channels, extract case study material
- [ ] discord-client-channels-batch-4 — Read remaining client channels, extract case study material
- [ ] discord-industry-signals — Re-scan all mined channels for industry-specific mentions (pharma, agriculture, gaming, sports, finance, retail, CPG)

### Wave 3: Content Assembly
Consolidate all gathered material into content files. One aspect per page.

- [ ] assemble-home — Read all analysis/, write content/home.md (hero, service overview, social proof, CTA)
- [ ] assemble-services-overview — Write content/services/_overview.md
- [ ] assemble-service-strategy — Write content/services/strategy-advisory.md
- [ ] assemble-service-delivery — Write content/services/solution-delivery.md
- [ ] assemble-service-training — Write content/services/training-enablement.md
- [ ] assemble-service-embedded — Write content/services/embedded-teams.md
- [ ] assemble-industries-overview — Write content/industries/_overview.md
- [ ] assemble-industry-marketing — Write content/industries/marketing-media.md
- [ ] assemble-industry-retail — Write content/industries/retail-ecommerce.md
- [ ] assemble-industry-cpg — Write content/industries/consumer-goods.md
- [ ] assemble-industry-pharma — Write content/industries/pharma-biotech.md
- [ ] assemble-industry-agriculture — Write content/industries/agriculture.md
- [ ] assemble-industry-finance — Write content/industries/finance-insurance.md
- [ ] assemble-industry-gaming — Write content/industries/gaming.md
- [ ] assemble-industry-sports — Write content/industries/sports-analytics.md
- [ ] assemble-solution-simba — Write content/solutions/simba.md
- [ ] assemble-solution-decision-ai — Write content/solutions/decision-ai.md
- [ ] assemble-about — Write content/about/story-and-team.md
- [ ] assemble-team-members — Write content/about/team-members/{name}.md for each discovered member
- [ ] assemble-partners — Write content/partners.md
- [ ] assemble-course-abm — Write content/courses/abm.md
- [ ] assemble-course-bma — Write content/courses/bma.md
- [ ] assemble-course-ci — Write content/courses/ci.md
- [ ] assemble-case-studies — Write content/case-studies/{name}.md for each discovered case study
- [ ] assemble-blog-template — Write content/blog/template.md (blog post structure + any migrated metadata)
- [ ] assemble-resources-benchmarks — Write content/resources/industry-benchmarks.md
- [ ] assemble-resources-oss — Write content/resources/open-source-libraries.md
- [ ] assemble-contact — Write content/contact.md

### Wave 4: Gap Hunting & Enrichment
Identify thin pages and fill with targeted web research. Self-expands after Wave 3.

- [ ] gap-audit — Read every content/ file, list pages with status:stub or status:partial, add one aspect per gap
- [ ] enrich-industries-web — WebSearch for PyMC Labs work in each industry with thin content
- [ ] enrich-case-studies-web — WebSearch for public PyMC Labs case studies, blog posts about client work
- [ ] enrich-team-web — WebSearch for PyMC Labs team member profiles, conference talks, publications
- [ ] enrich-courses-web — WebSearch for PyMC Labs course reviews, syllabi, learning outcomes
- [ ] enrich-expert-access-program — Investigate "Expert Access Program" (found in contact form dropdown but not in sitemap); search Discord + web for descriptions, pricing, eligibility

### Wave 5: Cross-Reference & Convergence
Final pass. Only start after Waves 1-4 are complete.

- [ ] cross-ref-case-studies-to-industries — Ensure every case study is referenced from its industry page
- [ ] cross-ref-case-studies-to-services — Ensure every case study is referenced from its service page
- [ ] cross-ref-solutions-to-case-studies — Link Simba/Decision AI to relevant case studies
- [ ] status-audit — Read every content/ file, verify no stubs remain, all frontmatter is complete
- [ ] convergence-check — Run full convergence checklist, either add new aspects or write converged.txt

## Recently Analyzed
- [x] github-org-scan (2026-03-13) — Fetched pymc-labs GitHub org (WebFetch + WebSearch). 15 repos total. Key OSS: pymc-marketing (1,088★, Apache 2.0 — MMM/CLV/CLV toolbox), CausalPy (1,123★, Apache 2.0 — 10 quasi-experimental methods, v0.8.0 Mar 2026), decision-hub (37★, MIT — AI agent skills registry, "npm for agent capabilities", hub.decision.ai), semantic-similarity-rating (130★ — SSR algorithm for synthetic consumers, paper: Maier et al. 2025), ai_decision_workshop (52★ — Bayesian decision-making notebooks). Related org pymc-devs: PyMC core (9,500★, 2,200 forks, v6 active), PyTensor (596★). Key content: PyMC Labs = "inventors of PyMC"; professional consulting support offered via pymc-labs.io. No Simba repo found (likely internal). decision-hub = Decision AI product's open-source component. Output: analysis/public/github-org.md
- [x] brand-deck-scrape (2026-03-13) — Playwright + WebFetch of 13-section UI treatment deck. Confirmed brand: "The Probabilistic AI Consultancy", 5-color palette (Navy #0C1F40 / Aqua #B4E7DD / Periwinkle #9FAAE2 / White #F7F7F7 / Peach #F6AE72 — Peach data viz only), Archivo variable-width headlines + Inter body + Lora serif accent, two-site stack (Framer marketing + Astro content), rocket logo rules, component system (buttons/tags/cards/nav/footer). Discovered: AI-Assisted Data Science course ($2,000, Bowne-Anderson/Wiecki/Fiaschi) not on live site; Podcast in footer nav not in sitemap; stat claims (100+ enterprise clients, 52 published articles). Output: analysis/brand-deck-scrape.md
- [x] halah-draft-pricing (2026-03-13) — Playwright-scraped /pricing page. Pricing tiers (Essential $1999/Growth $3999/Scale $6999/yr) are Aurazen Framer template placeholders — NOT PyMC Labs pricing. Footer/social links still point to template defaults. Key authentic content: 5-question FAQ with polished PyMC Labs answers covering industries (Pharma/Aerospace/Marketing/Finance/SpaceX), builders not advisors, model optimization, custom workshops, Embedded Teams via Slack+GitHub. Actual engagement model is Expert Access Program (Base: Expert Lifeline + Pro: Deep Partnership) from live website. Output: analysis/halah-draft-pricing.md
- [x] halah-draft-scrape (2026-03-13) — Playwright-scraped 8 pages from Framer draft site. Home hero: "Bayesian Intelligence for [Marketing/Finance/Pharma/Sports]". Services: 5 detailed with features — Simba explicitly named under "Bayesian AI Solutions" as "Enterprise-level Bayesian solution for end-to-end MMM workflows." Also names MMM Insights Agent and CLV Agent. About: origin timeline (2005 PyMC → 2020 Labs → 2023 pymc-marketing → 2025 agentic AI). Full case study narratives for HelloFresh (60x faster, saturation curves), Colgate-Palmolive (SSR, 9K responses, 90% reliability, 74% agreement), SALK (hierarchical Bayesian for surveys), Indigo (causal Bayesian for ag field trials). NOT captured: /pricing (→ halah-draft-pricing), /work/ovative-group, /work/akili. Output: analysis/halah-draft-scrape.md
- [x] website-crawl-remaining (2026-03-13) — Verified sitemap (92 URLs). Scraped 11 missing pages: Expert Access Program (two-tier: Base=Expert Lifeline, Pro=Deep Partnership; new clients: Fox Entertainment, Fabletics), Labs Principles (5 principles from open-source culture, Teal org), Origin Story (founded 2021 by Wiecki, early clients SpaceX/Roche/Netflix/Deliveroo/HelloFresh), The AI MMM Agent (Decision AI — ~80% grunt work reduction, hours not months, Luca Fiaschi), AI MMM Agent BETA (email [email protected]), Synthetic Consumers overview + practical guide (90% alignment with human data, 85% distributional similarity, <24h cycles, SSR methodology), Innovation Lab CPG (agentic + synthetic consumers platform), Colgate case study part 2 (nested logit discrete choice modeling, proprietary PyMC tooling), How Realistic Are Synthetic Consumers (Allen Downey GSS study), From Uncertainty to Insight (value prop). GAPS: Simba product name unconfirmed in web content — needs Discord; leaderboard page JS-rendered; Fabletics/Fox Entertainment clients have no case studies. Output: analysis/website-scrape/crawl-remaining.md
- [x] website-resources (2026-03-13) — No /resources/ page exists (404). "Resources" nav item links to /benchmark/LLMPriceIsRight — PyMC Labs' novel LLM benchmark inspired by "The Price Is Right". Captured full benchmark content: game mechanics, 3 evaluation metrics (Elo/MAPE/Overbid Rate), top-5 leaderboard for each metric (last updated Sep 25 2025), methodology (820 products, 50-100 showcases per model), business applications, caveats. Blog post: "LLMs and Price Reasoning" by Maxim Laletin + Allen Downey (Sep 17 2025). GitHub: pymc-labs/PriceIsRightLLM. Also captured model submission form details. OSS section: 3 projects on home page (PyMC Marketing, CausalPy, PyMC) — no dedicated OSS page. GAP: no industry benchmarks page, richer OSS descriptions needed from Discord. Output: analysis/website-scrape/resources.md
- [x] website-blog-index (2026-03-13) — Blog listing page requires Playwright (JS-rendered). Found 69 visible posts across 2 pages (47 + 20 + 2 featured). 75 total in sitemap (6 unlisted). 11 category filters. Full post index with themes: MMM (~15), Synthetic Consumers (~8), Case Studies (~11), Sports Analytics (~5), Causal (~6), Tutorials (~12), Company/About (~4). Featured post slot shows title + date + excerpt. Grid cards show image + title only (no date/author). Output: analysis/website-scrape/blog-index.md + content/blog/template.md
- [x] website-courses (2026-03-13) — Fetched /courses/ + 3 individual course pages. Found: ABM ($1,499, Jan cohort, instructors: Fonnesbeck/Downey/Leos Barajas), BMA ($2,249, Feb cohort, instructors: McWilliams/Allen/Vincent/Trujillo), ABR ($1,499, Mar cohort, instructors: Orduz/Vincent/Forde). No /causal-inference/ course page (CI in sitemap likely = ABR). Custom Workshops listed but no separate URL. Output: analysis/website-scrape/courses.md
- [x] website-case-studies (2026-03-13) — No /case-studies/ page (404). Case studies live as blog posts. Discovered full sitemap (92 URLs via sitemap-0.xml). Extracted 10 confirmed case studies: Akili (cognitive modeling), Salk (survey data), HelloFresh×3 (MMM + A/B tests), Alva Labs (IRT), Indigo Ag (spatial GP), Everysk (PE index), Colgate-Palmolive×2 (synthetic consumers + causal sales). Clients without case study posts: Roche, Netflix, Deliveroo, SpaceX, Ovative Group, Haleon. Output: analysis/website-scrape/case-studies.md
- [x] website-services (2026-03-13) — No dedicated /services/* pages on pymc-labs.com (all 404). Services content exists only on home page (5 tiles) + Halah draft /services (5 services with full descriptions, features, approach, FAQs). Mapped old site → Halah draft → new sitemap. Discovered: halah-draft-pricing aspect. Output: analysis/website-scrape/services.md
- [x] website-team-individual-pages (2026-03-13) — Fetched all 32 /team/{slug}/ pages. 30/32 have full bios. Benjamin Maier and Erik Ringen have specializations only (no bio). Slug notes: kusti-skyten, teemu-saeilynoja. Wrote 32 content/about/team-members/{name}.md files (30 complete, 2 partial). Output: analysis/website-scrape/team-members.md
- [x] website-about (2026-03-13) — Scraped /about/ and /team/. Found 32 team members (5 Partners: Wiecki, Luhmann, Fiaschi, Oulton, Wilkinson + 27 team members). Captured bios for ~20 members; 12 have no bio text available in HTML. Company story: "inventors of PyMC... launched a consultancy." No founding year found. Individual pages exist at /team/{slug}/. Discovered new aspect: website-team-individual-pages. Output: analysis/website-scrape/about.md

- [x] discord-index (2026-03-13) — Mapped 309 channels across 18 categories, 443 users. Identified 10 priority-1 channels (website, marketing, org, strategy, inbound-leads, pymc-marketing, simba, decision-ai, synthetic-consumers, readystate). Discovered 14 industries from client roster. Output: analysis/discord-channel-map.md
- [x] discord-category-triage (2026-03-13) — Classified all 18 categories and ~120 named channels by sitemap relevance (CRITICAL/HIGH/MEDIUM/LOW/SKIP). Built extraction queue of 19 Wave-2 batches ordered by priority. Identified 10 CRITICAL channels, ~40 HIGH channels. Mapped coverage estimates for all 24 sitemap pages. Output: analysis/discord-relevant-channels.md
- [x] website-home (2026-03-13) — Scraped https://www.pymc-labs.com/. Found: hero ("Bayesian AI Consultancy"), 5 services, distinctive value prop (founded by PyMC creators, less data needed), 6 client testimonials (Colgate-Palmolive, SALK, Akili, Indigo, Ovative Group, Haleon), 3 OSS projects. Current nav differs significantly from new sitemap. Output: analysis/website-scrape/home.md

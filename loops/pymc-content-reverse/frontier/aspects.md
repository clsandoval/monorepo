# Frontier — PyMC Content Gathering

## Statistics
- Total aspects discovered: 69
- Analyzed: 4
- Pending: 65
- Convergence: 6%

## Pending Aspects (ordered by dependency)

### Wave 1: Source Indexing
Map all sources before extracting. These must complete before Wave 2.

- [x] discord-index — Read input/discord/index.jsonl + users.jsonl, write analysis/discord-channel-map.md with every channel name, category, msg_count, date range
- [x] discord-category-triage — Read the channel map, classify each category as relevant/irrelevant to the sitemap, write analysis/discord-relevant-channels.md
- [x] website-home — WebFetch https://www.pymc-labs.com/, save to analysis/website-scrape/home.md
- [x] website-about — WebFetch the about page, save to analysis/website-scrape/about.md
- [ ] website-team-individual-pages — WebFetch /team/{slug}/ for all 32 team members; save bios to analysis/website-scrape/team-members.md
- [ ] website-services — WebFetch the services page(s), save to analysis/website-scrape/services.md
- [ ] website-case-studies — WebFetch case studies page(s), save to analysis/website-scrape/case-studies.md
- [ ] website-courses — WebFetch courses/training page(s), save to analysis/website-scrape/courses.md
- [ ] website-blog-index — WebFetch the blog listing page, save to analysis/website-scrape/blog-index.md
- [ ] website-resources — WebFetch any resources/open-source pages, save to analysis/website-scrape/resources.md
- [ ] website-contact — WebFetch the contact page, save to analysis/website-scrape/contact.md
- [ ] website-crawl-remaining — Check for any pages not yet scraped (sitemap.xml, nav links), scrape them
- [ ] halah-draft-scrape — WebFetch https://loyal-growth-093412.framer.app/, save to analysis/halah-draft-scrape.md
- [ ] brand-deck-scrape — WebFetch https://pymc-brand-deck.netlify.app/, save to analysis/brand-deck-scrape.md
- [ ] github-org-scan — WebSearch/WebFetch PyMC Labs GitHub org, list repos + descriptions, save to analysis/public/github-org.md
- [ ] social-media-scan — WebSearch PyMC Labs on LinkedIn, Twitter/X, YouTube. Save to analysis/public/social-media.md
- [ ] press-mentions — WebSearch for PyMC Labs press, interviews, podcast appearances. Save to analysis/public/press.md

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

### Wave 5: Cross-Reference & Convergence
Final pass. Only start after Waves 1-4 are complete.

- [ ] cross-ref-case-studies-to-industries — Ensure every case study is referenced from its industry page
- [ ] cross-ref-case-studies-to-services — Ensure every case study is referenced from its service page
- [ ] cross-ref-solutions-to-case-studies — Link Simba/Decision AI to relevant case studies
- [ ] status-audit — Read every content/ file, verify no stubs remain, all frontmatter is complete
- [ ] convergence-check — Run full convergence checklist, either add new aspects or write converged.txt

## Recently Analyzed
- [x] website-about (2026-03-13) — Scraped /about/ and /team/. Found 32 team members (5 Partners: Wiecki, Luhmann, Fiaschi, Oulton, Wilkinson + 27 team members). Captured bios for ~20 members; 12 have no bio text available in HTML. Company story: "inventors of PyMC... launched a consultancy." No founding year found. Individual pages exist at /team/{slug}/. Discovered new aspect: website-team-individual-pages. Output: analysis/website-scrape/about.md

- [x] discord-index (2026-03-13) — Mapped 309 channels across 18 categories, 443 users. Identified 10 priority-1 channels (website, marketing, org, strategy, inbound-leads, pymc-marketing, simba, decision-ai, synthetic-consumers, readystate). Discovered 14 industries from client roster. Output: analysis/discord-channel-map.md
- [x] discord-category-triage (2026-03-13) — Classified all 18 categories and ~120 named channels by sitemap relevance (CRITICAL/HIGH/MEDIUM/LOW/SKIP). Built extraction queue of 19 Wave-2 batches ordered by priority. Identified 10 CRITICAL channels, ~40 HIGH channels. Mapped coverage estimates for all 24 sitemap pages. Output: analysis/discord-relevant-channels.md
- [x] website-home (2026-03-13) — Scraped https://www.pymc-labs.com/. Found: hero ("Bayesian AI Consultancy"), 5 services, distinctive value prop (founded by PyMC creators, less data needed), 6 client testimonials (Colgate-Palmolive, SALK, Akili, Indigo, Ovative Group, Haleon), 3 OSS projects. Current nav differs significantly from new sitemap. Output: analysis/website-scrape/home.md

# angkin.ph Growth Engine — Master Spec

> Hub-and-spoke SEO growth engine for 148+ Philippine legal/regulatory calculator tools.

---

## 1. Context

angkin.ph is the umbrella domain for 148+ free Philippine legal and regulatory calculator tools. The site targets a massive, fragmented, low-competition niche: Filipino regulatory compliance calculations that people currently do by hand, pay professionals to do, or get wrong.

**Monetization model:** Freemium. Basic calculations are free and unrestricted. Detailed reports, PDF exports, and saved calculation history sit behind a paywall. Select tools include lead-gen pathways to professional services (lawyers, accountants, HR consultants).

**Target audience:** Both individuals (regular Filipinos navigating government processes) and professionals (lawyers, accountants, HR officers, real estate brokers) equally. The same tool serves both — the free tier handles everyday needs, the paid tier serves professionals who need documentation.

**Language:** English only for now. Filipino/Tagalog localization is out of scope (see Section 11).

**Framework:** Next.js. Chosen specifically for agent QA loop compatibility — Playwright integration, hot reload, established testing patterns, and static generation for SEO. The agent loop that builds and verifies each tool requires a framework with mature testing infrastructure.

---

## 2. Goals

1. **Dominate organic search** for Philippine regulatory compliance calculator queries across 26 regulatory domains.
2. **Build topical authority** so that angkin.ph becomes the default answer for "how to compute [Philippine regulatory thing]" queries.
3. **Drive freemium conversions** through high-intent tool pages and educational content that demonstrates value before asking for payment.
4. **Establish measurement infrastructure** to track what's working — which tools drive traffic, which convert, which hubs are gaining authority.
5. **Build a content foundation that compounds over time** across low-competition niches where a single well-structured page can rank #1 indefinitely.

---

## 3. Site Architecture & URL Structure

```
angkin.ph/
├── /                                      # Homepage — "148+ Free Philippine Legal & Regulatory Calculators"
├── /tax/                                  # Hub: Tax Calculators
│   ├── /tax/self-employed-tax-optimizer    # Tool: A1
│   └── ...
├── /labor/                                # Hub: Labor & Employment
│   ├── /labor/final-pay-calculator         # Tool: D3
│   └── ...
├── /property/                             # Hub: Property & Real Estate
│   ├── /property/maceda-calculator         # Tool: F4
│   └── ...
├── /blog/                                 # Blog index
│   ├── /blog/what-is-maceda-law            # Blog post
│   └── ...
└── /about, /privacy, /terms               # Utility pages
```

### URL Design Principles

- **26 hubs** mapping 1:1 to taxonomy categories. Each hub gets a top-level slug.
- **Hub slug doubles as category keyword.** `/tax/`, `/labor/`, `/property/` — these are the head terms we want to own.
- **Tool slugs target primary search query.** `/property/maceda-calculator` targets "maceda calculator" directly.
- **Blog slugs are question-based** for long-tail capture. `/blog/what-is-maceda-law` targets "what is maceda law."
- **Short, keyword-rich slugs.** No unnecessary nesting. Two levels max (hub/tool).

---

## 4. Page Types & Content Structure

### Hub Pages (26)

Hub pages serve as category landing pages and internal link anchors. They target head terms like "Philippine tax calculators" and distribute authority to tool pages.

| Element | Details |
|---------|---------|
| **H1** | "{Domain} Calculators & Tools — Philippines" |
| **Overview** | 2-3 paragraphs on the regulatory landscape for this domain |
| **Tool Grid** | Grid/list of all tools in this hub with one-line descriptions |
| **FAQ Section** | 5-8 FAQs targeting head terms for the domain |
| **Cross-links** | Internal links to related hubs |
| **Structured Data** | `CollectionPage` + `FAQPage` |

### Tool Pages (~148)

Tool pages are the core conversion pages. Each one is a self-contained utility that solves a specific regulatory calculation problem. SEO content wraps the calculator widget to capture search traffic and establish authority.

| Element | Details |
|---------|---------|
| **H1** | "{Tool Name} — Free Online Calculator" |
| **Calculator Widget** | Above the fold. Hydrates client-side. |
| **How It Works** | 3-5 paragraphs citing specific statutes (RA number, section, effective date) |
| **Step-by-Step Guide** | Targeting "how to compute..." queries |
| **FAQ Section** | 5-8 questions targeting long-tail variations |
| **Related Tools** | 3-5 links to related calculators (cross-hub where applicable) |
| **Legal Disclaimer** | Standard disclaimer re: not legal advice |
| **CTA** | Export/PDF behind freemium gate |
| **Structured Data** | `SoftwareApplication` + `FAQPage` + `HowTo` (triple schema stacking) |

### Blog Posts (~3-5 per hub, ~78-130 total)

Blog posts capture informational queries and funnel readers to tool pages. They establish topical depth and give Google more content to associate with the hub's domain.

| Element | Details |
|---------|---------|
| **H1** | Question-format, targeting search query directly |
| **Body** | 800-1500 words, substantive legal explainer |
| **Tool Links** | Embedded links to relevant tools mid-article and as CTA |
| **Internal Links** | Links to hub page and related posts |
| **Structured Data** | `Article` + `FAQPage` |

---

## 5. Technical SEO Foundation

### Meta Tags (per page)

Every page renders the following meta tags server-side:

- `<title>` — keyword-optimized, under 60 characters
- `<meta name="description">` — compelling snippet, under 155 characters
- `<link rel="canonical">` — self-referencing canonical URL
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter Card: `twitter:card` set to `summary_large_image`

### OG Images

Programmatically generated per page using Next.js `opengraph-image.tsx` convention:

- Tool/hub name rendered on image
- angkin.ph branding (logo + domain)
- Category icon for visual differentiation
- Consistent template across all pages for brand recognition in social shares

### Structured Data (JSON-LD)

All structured data injected as JSON-LD in `<head>`:

| Scope | Schemas |
|-------|---------|
| **Root layout (all pages)** | `WebSite` + `Organization` |
| **Hub pages** | `CollectionPage` + `FAQPage` |
| **Tool pages** | `SoftwareApplication` + `FAQPage` + `HowTo` |
| **Blog posts** | `Article` + `FAQPage` |
| **Sitewide** | `BreadcrumbList` on every page |

### Sitemap & Robots

- `sitemap.xml` auto-generated at build time via Next.js `sitemap.ts`
- Includes `lastmod` dates for all pages
- Split into sub-sitemaps if URL count exceeds 500
- `robots.txt` allowing full crawl, no disallowed paths (except `/api/`)

### Performance & Crawlability

- **Static generation** via `generateStaticParams` for all hub, tool, and blog pages
- **Core Web Vitals targets:** LCP < 2.5s, CLS < 0.1, INP < 200ms
- **Hydration strategy:** Calculator widgets hydrate client-side; all SEO-relevant content (H1, explainer, FAQ, structured data) is in the static HTML
- **Dense internal linking crawl graph** — every page links to at least 5 other pages, ensuring Googlebot discovers the full site in minimal crawl depth

### Analytics

| Platform | Tracks |
|----------|--------|
| **GA4** | Pageviews, tool usage events, PDF export clicks, signup conversions |
| **Google Search Console** | Keyword rankings, impressions, CTR, index coverage |
| **Custom events** | `tool_used`, `calculation_completed`, `pdf_exported`, `signup_started` |

---

## 6. Internal Linking Strategy

### Link Flows

```
Homepage ──→ All 26 hubs + featured top tools
Hub      ──→ Every tool in hub + cross-links to related hubs
Tool     ──→ Hub (breadcrumb) + 3-5 related tools + relevant blog posts
Blog     ──→ 1-2 tool pages (CTA) + hub page + 2-3 related posts
```

### Cross-Hub Links (Dependency Graph)

Tools that share regulatory dependencies link to each other across hub boundaries:

- **Legal Interest Engine (G1)** linked from every monetary claim tool — it's the universal interest computation dependency.
- **Property transfer chain:** CGT (A3) → DST (C4) → RPT (F1) → Transfer Bundler (C5). Buying property triggers all four in sequence.
- **Employment lifecycle:** Payroll (D1) → Contributions (D7) → 13th Month (D2) → Final Pay (D3). HR officers need the full chain.
- **OFW cluster:** Placement Fee (E-OFW-1) → Pre-Departure (E-OFW-2) → OWWA Benefits (E-OFW-3). OFWs navigate these in order.

### Navigation Elements

| Element | Contents |
|---------|----------|
| **Navbar** | Homepage + hub dropdown (~6 mega-menu columns grouping 26 hubs) |
| **Breadcrumbs** | Home > Hub > Tool on every page |
| **Footer** | All hubs + top 10 tools + blog link |
| **Sidebar (tool pages)** | "Related Calculators" widget with 3-5 contextual links |

---

## 7. Content Production Strategy

### Templates

Each page type has a standardized template. Tool page inputs come from the compliance moats / regulatory atlas analysis:

- Tool ID and name
- Governing statute (RA number, section, effective date)
- Computation formula and logic
- Professional fee displaced
- Target audience (individual, professional, or both)
- Related tools (same hub and cross-hub)

Claude generates the content from these inputs. The template ensures consistency across 148+ tool pages while the inputs ensure accuracy.

### Production Waves

| Wave | Timing | Scope |
|------|--------|-------|
| **Wave 1** (immediate) | Week 1-2 | Ship tools already built: Maceda Calculator, Legal Interest Engine, Inheritance Calculator + their hubs + blog posts |
| **Wave 2** (fast follow) | Week 2-4 | High-score + time-sensitive tools: E1 SEC (score 4.75), D3 Final Pay (score 4.50), F3 RPVARA (deadline July 5, 2026), O-LRA-1 ONETT (score 4.55) |
| **Wave 3+** (volume) | Week 4+ | Remaining tools by descending opportunity score, ~15-20 tools per week |

### Quality Gate

Every tool page must pass before publishing:

- Legal citations verified (correct RA number, section, effective date)
- Calculator logic matches the explainer text (no contradictions between what the tool computes and what the content says)
- FAQ answers are substantive (not thin/generic)
- Structured data validates in Google's Rich Results Test

### Keyword Research (per tool)

Each tool targets a keyword cluster, not a single keyword:

- **Primary:** Tool query (e.g., "maceda calculator")
- **Secondary:** Variations (e.g., "maceda law computation", "maceda refund calculator")
- **Long-tail:** "How to" queries (e.g., "how to compute maceda refund")
- **Informational:** Knowledge queries routed to blog (e.g., "what is maceda law")

---

## 8. Launch Sequencing

### Phase 1 — Foundation (Week 1-2)

- Deploy angkin.ph with Next.js
- Technical SEO infrastructure: sitemap, robots.txt, structured data, meta tags
- GA4 + Google Search Console configured
- Homepage live with hub directory (links to all 26 hubs)

### Phase 2 — First Tools Live (Week 2-4)

- Maceda Calculator, Legal Interest Engine, Inheritance Calculator deployed
- Their hub pages live (property, civil-family, tax)
- 3-5 blog posts per tool (9-15 total)
- Submit sitemap to Search Console, request indexing

### Phase 3 — Time-Sensitive + High-Score Tools (Week 4-8)

- F3 RPVARA Calculator (deadline: July 5, 2026)
- E1 SEC Annual Report Fee Calculator (score: 4.75)
- D3 Final Pay Calculator (score: 4.50)
- O-LRA-1 ONETT Calculator (score: 4.55)
- Their hub pages and blog posts

### Phase 4 — Volume Rollout (Week 8-16)

- Remaining tools by descending opportunity score
- ~15-20 tools per week
- ~5-10 blog posts per week
- All hub pages populated

### Phase 5 — Optimize (Week 16+)

- Search Console data review — which pages are getting impressions but low CTR?
- Content gap analysis — what queries are we missing?
- A/B test layouts (calculator placement, CTA positioning)
- Explore UGC features if traffic warrants

### F3 RPVARA Sprint

The Real Property Valuation and Assessment Reform Act has a **July 5, 2026 deadline**. This tool must be live by mid-May to capture search traffic as the deadline approaches.

- RPVARA calculator + hub page + 3-4 blog posts targeting amnesty queries
- Deadline-driven urgency drives shares and backlinks naturally
- Time-sensitive content gets priority in Google's freshness signals

---

## 9. Measurement & Success Criteria

### KPIs by Milestone

| Milestone | Tools Live | Organic Clicks/Month | Ranking Targets |
|-----------|-----------|---------------------|-----------------|
| **Month 1** | 3+ | First organic impressions | Pages indexed in Search Console |
| **Month 3** | 20+ | 1,000+ | Top 10 for 5+ tool queries |
| **Month 6** | 50+ | 10,000+ | Hub pages ranking for head terms |
| **Month 12** | 100+ | 50,000+ | 15+ hub pages ranking Top 20 for head terms; 50+ tool pages ranking Top 10 |

### Monitoring Cadence

| Frequency | Review |
|-----------|--------|
| **Weekly** | Search Console impressions/clicks by page. Identify new queries appearing. |
| **Monthly** | GA4 funnel review (tool used → calculation completed → PDF exported → signup). Content gap analysis from Search Console queries. |
| **Quarterly** | Hub-level performance rollup. Prune or rewrite underperforming pages. Assess hub authority growth. |

---

## 10. Hub Directory

26 hubs covering all 148+ tools. Each hub has a detailed spec file in `docs/superpowers/specs/2026-03-26-angkin-growth-engine/`.

| Hub | Slug | Tool IDs | Spec File |
|-----|------|----------|-----------|
| Income Tax | `/tax/` | A1-A5 | `tax.md` |
| Tax Administration (BIR) | `/tax-administration/` | B1-B7 | `tax-administration.md` |
| Transfer Taxes | `/transfer-taxes/` | C1-C5 | `transfer-taxes.md` |
| Labor & Employment | `/labor/` | D1-D9 | `labor.md` |
| Corporate (SEC) | `/corporate/` | E1-E6 | `corporate.md` |
| Property & Real Estate | `/property/` | F1-F4 | `property.md` |
| Civil & Family Law | `/civil-family/` | G1-G5 | `civil-family.md` |
| SSS | `/sss/` | A-SSS-1 to A-SSS-7 | `sss.md` |
| PhilHealth | `/philhealth/` | B-PHI-1 to B-PHI-4 | `philhealth.md` |
| Pag-IBIG (HDMF) | `/pagibig/` | C-HDMF-1 to C-HDMF-5 | `pagibig.md` |
| GSIS | `/gsis/` | D-GSIS-1 to D-GSIS-6 | `gsis.md` |
| OFW | `/ofw/` | E-OFW-1 to E-OFW-6 | `ofw.md` |
| Customs (BOC) | `/customs/` | F-BOC-1 to F-BOC-5 | `customs.md` |
| Transportation (LTO) | `/transportation/` | G-LTO-1 to G-LTO-4 | `transportation.md` |
| Professional Licensing (PRC) | `/professional-licensing/` | H-PRC-1 to H-PRC-4 | `professional-licensing.md` |
| Maritime | `/maritime/` | I-MAR-1 to I-MAR-4 | `maritime.md` |
| Aviation (CAAP) | `/aviation/` | J-CAP-1 to J-CAP-3 | `aviation.md` |
| Telecom (NTC) | `/telecom/` | K-NTC-1 to K-NTC-3 | `telecom.md` |
| Skills & Vocational (TESDA) | `/skills-vocational/` | L-TES-1 to L-TES-4 | `skills-vocational.md` |
| FDA | `/fda/` | M-FDA-1 to M-FDA-4 | `fda.md` |
| Fire Safety (BFP) | `/fire-safety/` | N-BFP-1 to N-BFP-4 | `fire-safety.md` |
| Land & Agrarian Reform | `/land-agrarian/` | O-LRA + O-DAR + O-DHSUD (9 tools) | `land-agrarian.md` |
| Intellectual Property (IPO) | `/intellectual-property/` | P-IPO-1 to P-IPO-4 | `intellectual-property.md` |
| Energy (ERC) | `/energy/` | Q-ERC-1 to Q-ERC-4 | `energy.md` |
| Business Registration | `/business-registration/` | R-DTI + R-BOI + R-CDA + R-PCAB (15 tools) | `business-registration.md` |
| Banking & Finance | `/banking-finance/` | S-BSP + S-PGC (8 tools) | `banking-finance.md` |
| Data Privacy (NPC) | `/data-privacy/` | T-NPC-1 to T-NPC-4 | `data-privacy.md` |

---

## 11. What's NOT in This Spec

The following are explicitly out of scope for this document:

- Individual tool computation logic (each tool has its own spec)
- Pricing/paywall design (separate spec)
- Paid ads strategy
- Social media marketing
- Email marketing / drip campaigns
- Filipino/Tagalog localization
- UGC / community features
- Mobile app
- Partnership/B2B channel strategy

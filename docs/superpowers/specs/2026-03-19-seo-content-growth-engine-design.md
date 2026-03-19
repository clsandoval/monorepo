# SEO & Content Growth Engine — Inheritance Calculator

## Context

The inheritance calculator (https://inheritance-frontend.fly.dev/) is a Philippine succession law tool targeting two audiences: lawyers/law firms (primary) and individual Filipinos (volume). The app is currently free with no paid tier. Revenue is the goal within 3 months. This spec covers organic acquisition via SEO and content — the first workstream of a broader growth engine that will later include pricing/paywall, paid ads, and conversion optimization.

## Goals

- Dominate organic search for Philippine succession law calculator queries
- Drive signups through high-intent landing pages and educational blog content
- Establish measurement infrastructure (GA4 + Search Console) to track what's working
- Build a content foundation that compounds over time in a low-competition niche

## Domain & Technical SEO Foundation

**Domain:** Register a `.ph` or clean `.com` domain (e.g., `inheritance.ph`, `mana.ph`, `successionlaw.ph`). Point to Fly via CNAME.

**Technical SEO:**
- Per-page `<meta>` tags (title, description, og:image) via TanStack Router head management
- `sitemap.xml` generated at build time listing all landing pages and blog posts
- `robots.txt` allowing full crawl
- Structured data (JSON-LD) on calculator pages — `SoftwareApplication` schema with `applicationCategory: "LegalService"`
- Canonical URLs on all pages

**No SSR initially.** Google renders JS fine. If organic performance is flat after 2 months, add prerendering as a follow-up.

## High-Intent Landing Pages

Standalone public routes targeting people actively searching for a calculator or specific legal concept. Each page has:

- SEO-optimized headline and copy explaining the concept
- The `QuickCalcWidget` embedded inline, pre-configured with relevant heirs for that scenario
- A brief legal explainer (2-3 paragraphs citing Civil Code articles)
- Internal links to related pages and blog posts

### Initial Pages

| Route | Target Keyword | Pre-filled Heirs |
|-------|---------------|-----------------|
| `/intestate-succession-calculator` | "intestate succession calculator philippines" | Empty (general) |
| `/legitimate-share-calculator` | "how to compute legitime philippines" | Empty (general) |
| `/spouse-and-children-inheritance` | "inheritance share of surviving spouse philippines" | Spouse + 2 Children |
| `/illegitimate-child-inheritance` | "inheritance rights of illegitimate child philippines" | Spouse + Legit Child + Illegit Child |
| `/parents-inheritance-share` | "inheritance of parents philippines" | Father + Mother |
| `/no-will-inheritance-philippines` | "who inherits if no will philippines" | Spouse + 2 Children |

Each page reuses the existing `QuickCalcWidget` — no new calculator code needed. New code is the route, the copy, and the meta tags.

## Blog System

Lightweight blog built into the app at `/blog`. No CMS — blog posts are `.tsx` files in `src/routes/blog/` exporting components with frontmatter-style constants (title, description, date, keywords).

**Routes:**
- `/blog` — index page listing all posts, newest first
- `/blog/[slug]` — individual post page

### Initial Posts

| Title | Target Query |
|-------|-------------|
| "Intestate vs Testate Succession: What's the Difference?" | "intestate vs testate philippines" |
| "How to Compute the Legitime Under Philippine Law" | "how to compute legitime" |
| "Rights of Illegitimate Children in Philippine Inheritance" | "illegitimate child inheritance rights philippines" |
| "What Happens When There Is No Will in the Philippines?" | "no will inheritance philippines" |
| "Preterition Explained: When a Compulsory Heir Is Left Out" | "preterition philippine law" |
| "Estate Distribution When Both Parents Are Alive" | "inheritance parents share philippines" |

Each post ends with a CTA linking to the relevant landing page or homepage widget.

**Styling:** Simple prose layout — generous line height, readable width (~65ch), serif headings matching the app's existing typography. No sidebar, no clutter.

## Analytics & Measurement

**Google Analytics 4:**
- GA4 gtag snippet in `index.html`
- Custom events: `quick_calc_used`, `signup_started`, `signup_completed`
- Signup events configured as conversions
- Linked with Google Search Console for combined search + behavior data

**Google Search Console:**
- Domain verification
- Sitemap submission
- Track keyword rankings, impressions, click-through rates

**Key metrics:**
- Organic impressions and clicks per landing page / blog post (Search Console)
- Pageviews -> Calculate clicks -> Signup conversions (GA4 funnel)
- Which landing pages drive the most signups
- Bounce rate on content pages

## Rollout Plan

**Phase 1 (Week 1-2): Foundation**
- Register domain, point to Fly
- Add GA4 + Search Console
- Add sitemap.xml, robots.txt, meta tags infrastructure
- Build the blog route structure

**Phase 2 (Week 3-4): First Content**
- Ship 3 landing pages (intestate calculator, spouse+children, legitimate share)
- Ship 3 blog posts (intestate vs testate, computing legitime, no will scenario)
- Submit sitemap to Search Console

**Phase 3 (Week 5-8): Expand & Monitor**
- Ship remaining landing pages and blog posts
- Monitor Search Console for impressions, identify gaining queries
- Write 2-3 more posts targeting queries that appear in Search Console but lack dedicated pages
- Start small Google Ads experiment ($50-100) on highest-intent keyword to validate conversion

**Phase 4 (Month 3): Optimize**
- Review GA4 conversion funnel — where are people dropping off?
- Update landing page copy and CTAs based on data
- Double down on content that's ranking, prune what isn't
- By this point, pricing/paywall should be built (separate spec) to measure actual revenue

## What's NOT in This Spec

- Pricing / paywall design (separate workstream)
- Paid ads strategy beyond the Phase 3 validation experiment
- Social media marketing
- Email marketing / drip campaigns
- SSR / prerendering (follow-up if needed after 2 months)

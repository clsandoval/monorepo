# Gap Audit — PyMC Content Package
Generated: 2026-03-14

## Summary

| Category | Complete | Partial | Stub | Total |
|----------|---------|---------|------|-------|
| Home | 1 | 0 | 0 | 1 |
| Services | 5 | 0 | 0 | 5 |
| Industries | 4 | 5 | 0 | 9 |
| Solutions | 2 | 0 | 0 | 2 |
| About (story+team) | 32 | 5 | 0 | 37 |
| Partners | 1 | 0 | 0 | 1 |
| Courses | 3 | 0 | 0 | 3 |
| Case Studies | 8 | 17 | 0 | 25 |
| Blog | 1 | 0 | 0 | 1 |
| Resources | 1 | 1 | 0 | 2 |
| Contact | 1 | 0 | 0 | 1 |
| **Total** | **59** | **28** | **0** | **87** |

(Note: 3 case studies upgraded from stub→partial during this audit; they contain all available Discord-sourced content but lack external validation/quotes.)

## Sitemap Coverage Check

All pages in the sitemap have corresponding content files. ✓

---

## Pages with status: partial

### Case Studies (17 partial)

#### Engagements: active/confidential — web enrichment needed
| File | Primary Gap |
|------|-------------|
| `dodgers.md` | Active, confidential engagement; logo rights unclear; need publishable outcomes post-engagement |
| `real-madrid.md` | Engagement ended incomplete (football analytics stalled); no CLV metrics; no client quote |
| `supercell.md` | Minimal Discord source material; no conference name/date; no quantitative results |

#### Engagements: completed — web enrichment needed
| File | Primary Gap |
|------|-------------|
| `appodeal.md` | No published blog post; no client quote; no ROAS/budget reallocation numbers |
| `erisyon.md` | No published blog post; no named client quote; no speedup figure |
| `everysk.md` | No client testimonial; no tracking error / correlation figure; no paper citation |
| `fabletics.md` | Need TechStyle-Fabletics vs TechStyle-Simba disambiguation; no named HelloFresh-side quote |
| `fox-broadcasting.md` | SLA coaching engagement; "feels like part of their team" quote unattributed to named person |
| `gain-theory.md` | No published blog post; Bass Diffusion / Prime Video attribution unclear |
| `haleon.md` | No testimonial beyond "presented to whole analytics team" |
| `live-nation.md` | Quotes may be unattributed (Discord-only); need named attribution confirmation |
| `llbean.md` | Engagement paused; need status confirmation; DMA hierarchy result specifics |
| `roche.md` | No named deliverable description; no Roche-side decision outcome |
| `salk.md` | Org identity unclear (Salk Institute vs Estonian polling org SALK — CEO "Tarmo Jüristo" suggests latter); survey domain unknown |
| `swarovski.md` | Need engagement date range; need Swarovski-side testimonial |
| `syngenta.md` | Need specific yield improvement % figures |
| `wegmans.md` | Need engagement date range confirmation; SOW 2 details |

### Industries (5 partial)

| File | Primary Gap |
|------|-------------|
| `agriculture.md` | No standalone landing copy; no dedicated Halah draft section; positioning unclear (separate vs. "Life Sciences & AgTech") |
| `finance-insurance.md` | No Nürnberger testimonial; Schwab workshop details missing; BNP Paribas conversion unknown; need keynote/blog URLs |
| `gaming.md` | No public testimonials; no published case study for Appodeal or Supercell; logo usage not confirmed |
| `retail-ecommerce.md` | Lidl project details unknown; multiple retail clients with no Discord channel data |
| `sports-analytics.md` | No published sports case studies; no testimonials; most engagement detail confidential |

### Team Members (5 partial)

| File | Primary Gap |
|------|-------------|
| `alexandre-andorra.md` | Not on team page as of Mar 2026; co-founder status unclear; may be advisory/sponsor only |
| `ben-vincent.md` | Not on team page; Discord/course-listing bio only; no LinkedIn/GitHub confirmed |
| `benjamin-maier.md` | No bio on website; needs LinkedIn/web enrichment |
| `erik-ringen.md` | No bio on website; needs LinkedIn/web enrichment |
| `jesse-grabowski.md` | Not on team page; press mentions + Discord only; may be Explorer tier |

### Resources (1 partial)

| File | Primary Gap |
|------|-------------|
| `industry-benchmarks.md` | LLM Price Is Right leaderboard content not scraped (JS-rendered); no benchmark methodology doc |

---

## Gaps Already in Frontier (existing pending aspects)

The following pending aspects directly address the gap categories above:

- `enrich-industries-web` — covers agriculture, finance-insurance, gaming, retail-ecommerce, sports-analytics partials
- `enrich-case-studies-web` — covers most partial case studies (blog posts, press mentions)
- `enrich-team-web` — covers the 5 partial team members (LinkedIn, conference talks, publications)
- `enrich-courses-web` — covers course review/syllabus gaps
- `enrich-expert-access-program` — covers Expert Access Program description gap (in contact.md)
- `cross-ref-case-studies-to-industries` — cross-reference pass
- `cross-ref-case-studies-to-services` — cross-reference pass
- `cross-ref-solutions-to-case-studies` — cross-reference pass
- `status-audit` — final status verification
- `convergence-check` — final convergence

## New Aspects Identified

### salk-org-research
Resolve SALK org identity: "Salk Institute" (San Diego, CA) vs "SALK" (Estonian polling/research org with CEO Tarmo Jüristo). Web search to confirm. Affects: `content/case-studies/salk.md`.

### industry-benchmarks-enrich
The LLM Price Is Right leaderboard page is JS-rendered and only partially scraped. Web search for the benchmark methodology, leaderboard data, and any press coverage. Affects: `content/resources/industry-benchmarks.md`.

---

## Files NOT in Sitemap (no action needed)

None found — all discovered case studies have content files and are accounted for.

## Recommendations for Convergence

1. Run `enrich-case-studies-web` — highest priority; 17 partial case studies blocking completeness
2. Run `enrich-industries-web` — 5 partial industry pages
3. Run `enrich-team-web` — 5 partial team members
4. Run `salk-org-research` — small but blocks salk.md from completing
5. Run `industry-benchmarks-enrich` — resources page
6. Run cross-reference passes (3 aspects)
7. Run `status-audit` then `convergence-check`

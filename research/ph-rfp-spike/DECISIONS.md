# PH Government RFP Finder — Spike Decisions & Handoff

**Status:** spike complete, nothing built yet. Next step is code.
**Date:** 2026-08-08
**Origin:** a friend's idea — PH businesses (construction, software, everything) make money bidding on
LGU and national government RFPs, and finding those RFPs is hard.

---

## Locked decisions

| # | Decision | Why |
|---|---|---|
| 1 | **UI direction: B — "unified surface"** (`ui/08-unified-surface.png`) | One white rounded slab floating on grey; table + chat inside it, one hairline between. Icon-only left rail. Consistent corner radius across search, chips, rows. Reads like a real macOS app. |
| 2 | **Chat docked RIGHT, table dominant** | Table is the product; chat is the tool you reach for. Confirmed against a chat-left variant (`ui/05` vs `ui/06`). |
| 3 | **Palette locked** | bg `#F5F6F7` · surfaces white · text near-black `#111315` · single accent teal `#0E7490` · **no other hue**. Monospaced tabular figures for ALL numerals, refs, peso amounts. |
| 4 | **Model: GPT-5.6 Luna** | $0.20/M in · $1.20/M out · **$0.02/M cached in** · 1M context · released 2026-07-09, cutoff Feb 2026. Terra ($2/M) and Sol ($5/M) are the escalation path if eligibility reasoning needs it. |
| 5 | **No vector RAG. No embeddings. No retrieval layer.** | Entire open corpus measured at **~300K tokens**. It fits in one cached 1M-context prompt. Cost ~₱0.35/search with the *whole board* in context. Prefiltering saves ~₱0.09 and introduces relevance bugs. |
| 6 | **Free, no login, server-rendered** | Distribution play. GEPSearch gates everything behind auth and is invisible to Google; the PH content cluster owns the search traffic and ships no tool. See "The wedge" below. |
| 7 | **Minimal feature set** | Goal of every session: surface a list of proposals that fit you. Nothing else. |

**Explicitly rejected:** vector DB / embeddings (corpus too small, titles too abbreviated to embed —
`CW-C-GAWAAN CIS-01-2026`); FTS5 prefilter (saves nothing at Luna prices); login walls; Claude models
(10× the cost of Luna for this workload — this was my initial recommendation and it was wrong).

---

## The data — all measured live 2026-08-08, not assumed

**Primary endpoint** (plain GET, no cookie, no JS, no session):

```
https://philgeps.gov.ph/indexes/view-more-open-tenders?page=N&direction=Tenders.id+desc
```

Page until you hit your last-seen id. That is the entire ingest.

- **4,300 open opportunities** right now — `Page 1 of 215, showing 20 record(s) out of 4,300 total`.
  Was 4,266 twenty minutes earlier → ~30–40/hour inflow during business hours.
- Listing columns: `Ref | Title | Mode | Classification | Agency | Publish date | Closing date+time`.
  **Closing dates are in the listing HTML** — no PDF parsing needed for the core feed.
- **ABC is NOT in the listing.** It's on `/Indexes/viewLiveTenderDetails/{id}` — one fetch per notice.
  4,300 detail fetches nightly is the enrichment job.

**Lead-time distribution** (sampled 300 notices across 15 pages):

| time to closing | share |
|---|---|
| ≤2 days | 32% |
| 3–6 days | 27% |
| 7–13 days | 8% |
| 14–29 days | 32% |
| 30+ days | 0.3% |

**~60% close within 6 days.** So "4,300 open" overstates the market — realistically actionable pool is
~1,700. This is also *why* the product exists: no alerts anywhere means a weekly checker structurally
misses most of the market.

**Composition:** 72% Goods · 22% Civil Works · **1% Consulting Services** (3 of 300).
58% Small Value Procurement · 37% Competitive Bidding.

> Software work hides inside "Goods" and "Goods – General Support Services". The official taxonomy
> **cannot** find software jobs. Keyword-over-title is the only thing that works — and nobody does it well.
> SVP (below-threshold, quotation not full bid) is the high-volume/low-effort segment big players ignore.

**No government API exists.** `api.philgeps.gov.ph` is real but aggregate-only (`/api/infonotice/*`
returns `[]`); its Swagger is an unconfigured Petstore demo. `data.gov.ph` is an empty SPA. The
Philippines is **absent** from the OCDS registry (134 publishers; India/Indonesia/Nepal/Thailand present).
Build a scraper; don't wait for an API.

**Two systems, partially migrated.** PS Advisory 2026-19 cut Executive-branch posting on legacy
PhilGEPS 1.5 on 31 Jul 2026; non-Executive PEs are on later batches and were still posting to legacy on
7–8 Aug. The 4,300 figure is **mPhilGEPS only** — legacy-side count unverified. Dedupe will matter.

Full source table (25 verified sources incl. World Bank procurement API, Makati City's unauthenticated
JSON API, and mPhilGEPS Annual Procurement Plans browsable to 2027) → **`sources.md`**.

---

## Architecture

```
cron   → view-more-open-tenders (page until last-seen id) → SQLite
       → fetch /Indexes/viewLiveTenderDetails/{id} for new refs
enrich → Luna extracts ABC / line items / eligibility from each detail page   ~₱240/night
search → whole corpus in a cached prompt → Luna ranks + explains             ~₱0.35/search
UI     → direction B, chat right, tender cards as output (never prose)
```

**Cost model at 10,000 searches/month:** ~₱3,500 search + ~₱7,200 enrichment. Enrichment drops
materially if HTML is stripped to the content div before sending.

**Product framing:** the user does not search. They set a profile once — PCAB licence class, 3–4
categories, region, budget range — and the job is *"here are today's 3."* Recurring interaction is a
feed, not a query. Chat is for refinement.

---

## Competitive landscape (full detail → `competitors.md`)

**Is it taken? No — but the empty part isn't the software.**

- **GEPSearch** (gepsearch.pro) — only real PH-local competitor. ~3 months old, same-day mPhilGEPS
  indexing, 3,935 notices, only player showing ABC in ₱ inline. **Every content page 302s to `/login`**;
  client-rendered Next.js, ~30 words of server HTML. Zero SEO surface.
- Everything else is foreign SEO scraping mills (TenderImpulse 6,586 PH tenders, TendersInfo,
  GlobalTenders, PhilippinesTenders, BidDetail, OpenOpps). All print the buyer as "Philippines" or
  "Government Of Philippines". None surface ABC.
- **BetterGov** transparency dashboard: 2.5M award records, free — but **stops at 2025**. No 2026 awards
  exist for free anywhere.

**The graveyard — the most important finding:**

- **First Circle "Project Finder"** — free, PhilGEPS **plus scraped LGU websites**, ABC + closing date +
  email alerts. Almost exactly this idea. Dead: collateral damage of a fintech platform migration. Its
  SEO funnel (`/blog/how-to-bid-in-philgeps`) is **still live and still ranking**, dropping demand on the
  floor daily. Nobody replaced the LGU-website scraping.
- **OCDex** (USAID-backed) — only project that ever sliced PhilGEPS **by LGU**. Frozen at Nov 2019.
- **~25 GitHub scrapers**, verified via API: `Niraven/philgeps-scraper` lived 2h11m; the only
  PhilGEPS→Slack alerting bot ever built was abandoned the day it was created; `josephdlmd/bidscrapperv2`
  shipped `bidindex.vercel.app`, now 404.
- **`chloebellee/philgeps-scraper` is the definitive artifact:** 44 of 44 scheduled GH Actions runs
  **failed** — not on scraping, on `Permission to ... denied to github-actions[bot]` (missing
  `permissions: contents: write`). The scraper worked every weekday for two months and threw the data
  away. One YAML line, unfixed for 44 runs, because no user existed to complain.

**What actually kills these: not data access.** Extraction is a commodity. It's (a) nobody running the
cron on day 65, and (b) it was never anyone's business — First Circle free, BetterGov/OCDex volunteer
or grant-funded.

**The wedge:** distribution, not data. Free + ungated + server-rendered notice pages = you capture the
search traffic GEPSearch structurally cannot. Plus: **Annual Procurement Plans browsable to 2027**
(months of lead time before an ITB exists, nobody productizes it), **current-year award history** joined
to open notices, and **PCAB eligibility matching**.

**The bear case, stated plainly:** a lender with downstream financing revenue still killed the free
version. The one paid PhilGEPS data product (an Apify actor) has 2 monthly active users. **Nobody has
ever tested what a Filipino contractor pays in pesos.** That number, not the scraper, is the unknown.

---

## Design assets

`ui/` holds all 9 mockups + the three `genui*.py` generation scripts (gpt-image-2, 1536×1024,
`OPENAI_API_KEY` from repo `.env`).

| file | direction |
|---|---|
| `01-thread` | classic chat, cards inline |
| `02-split` | chat left / results panel right, dark+amber |
| `03-feed` | feed-first, editorial serif, maroon |
| `04-dense` | dense table + ⌘K palette, teal — **the ancestor of the chosen direction** |
| `05-dense-chat-left` / `06-dense-chat-right` | 04 + split chat; **06 won** |
| `07-airy` | borderless, max whitespace |
| **`08-unified-surface`** | **CHOSEN** |
| `09-typographic` | near-monochrome, money-as-anchor |

**Carry into the build from the runners-up:**
- `09`'s type hierarchy — set **ABC peso figures large and heavy** so money is what the eye hits first.
  A contractor scans "how big, when does it close", in that order.
- `04`'s `Data updated 08:15 AM · Source: PhilGEPS` footer. This is the trust signal foreign
  black-box aggregators structurally cannot offer. Keep it visible.
- Chat chip selection **drives table row selection** (shared ref code). This is the interaction that
  makes the split earn its place — otherwise it's two panels sharing a screen.

⚠️ **Never ship a government-style seal.** Three of the first four generations invented neoclassical
building + laurel + stars insignia, and one captioned itself "PHILIPPINE GOVERNMENT OPPORTUNITIES".
For a private product scraping a government portal that implies official endorsement. Plain wordmark only.

---

## Open questions

1. **Willingness to pay** — untested in this market at any price. Twenty contractors, one category, one
   region, hand them the daily feed, see if anyone pays. This is the real experiment, not the scraper.
2. Legacy PhilGEPS 1.5 open-notice count — unverified; needed for true national coverage + dedupe.
3. Frontend stack — Next.js or otherwise. Undecided.
4. Whether Luna is strong enough for PCAB/RA 12009 eligibility reasoning, or that one call escalates.

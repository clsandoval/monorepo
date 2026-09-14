# PH Government RFP Finder — Spike Decisions & Handoff

**Status:** spike complete. Ingest built, tagging piloted 2026-08-08 pm.
**Date:** 2026-08-08

> ## ⚠️ Corrections — measured 2026-08-08 pm
>
> Four claims below were measured wrong once code hit the live site. Originals are left in place
> and marked, because what changed is as useful as what's true.
>
> 1. **Corpus is ~22,145 open notices, not 4,300.** Legacy PhilGEPS 1.5 is alive, unauthenticated
>    and GET-scrapable with **17,845** open notices — 4× mPhilGEPS, and it is where the LGU market
>    is (73/100 sampled PEs are LGU, vs 23/160 on mPhilGEPS). Ingesting only mPhilGEPS covers ~19%
>    of the board and almost none of the LGU segment.
> 2. **The 300K-token / one-cached-prompt premise is dead.** 22,145 notices × ~70 tokens of listing
>    row ≈ **1.55M tokens**, over Luna's 1M window — before fetching a single scope document. This
>    invalidates the mechanism of decision #5, though not its conclusion (see below).
> 3. **ABC needs no LLM.** It's a labeled field: `<label>Approved Budget of the
>    Contract:</label>245,000.00`. Regex, ₱0 — not the ~₱240/night enrichment budgeted below.
> 4. **2026 award data is not paywalled everywhere.** Legacy award notices are ungated with peso
>    amounts (rolling 100 most recent), contradicting the BetterGov note below.
>
> Search design that replaces the "Architecture" section:
> **`docs/plans/2026-08-08-ph-rfp-search-design.md`**. Code: `apps/rfp/`.
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
| 5 | ~~**No vector RAG. No embeddings. No retrieval layer.**~~ **Conclusion holds, reasoning replaced.** | Original reasoning — "entire open corpus ~300K tokens, fits one cached 1M prompt, ~₱0.35/search, prefiltering saves ~₱0.09" — was wrong: the corpus is ~1.55M tokens and does not fit. Still no embeddings, but now because the discriminators are exact (ABC band, days-to-close, province) and embeddings blur them; the fuzzy axis is handled by ingest-time tagging instead. **FTS5 is now in** — rejected below as a prefilter saving ₱0.09, it is the retrieval layer at this corpus size. |
| 6 | **Free, no login, server-rendered** | Distribution play. GEPSearch gates everything behind auth and is invisible to Google; the PH content cluster owns the search traffic and ships no tool. See "The wedge" below. |
| 7 | **Minimal feature set** | Goal of every session: surface a list of proposals that fit you. Nothing else. |

**Explicitly rejected:** vector DB / embeddings (still rejected, new reasoning — see #5); ~~FTS5
prefilter (saves nothing at Luna prices)~~ **— reversed, FTS5 is the retrieval layer**; login walls;
Claude models (10× the cost of Luna for this workload — this was my initial recommendation and it was
wrong). Model id confirmed live: **`gpt-5.6-luna`**.

---

## The data — all measured live 2026-08-08, not assumed

**Primary endpoint** (plain GET, no cookie, no JS, no session):

```
https://philgeps.gov.ph/indexes/view-more-open-tenders?page=N&direction=Tenders.id+desc
```

Page until you hit your last-seen id. That is the entire ingest.

- **4,300 open opportunities** right now — `Page 1 of 215, showing 20 record(s) out of 4,300 total`.
  Was 4,266 twenty minutes earlier → ~30–40/hour inflow during business hours.
  **Correction: this is 19% of the board.** Legacy adds 17,845 → ~22,145 total. Pagination verified
  honest (215 × 20 = 4,300, page 216 cleanly empty), but **page 215 is a junk drawer**: ids from
  Jun-2024, and 12 of 20 rows have a blank closing date. `closing` must be nullable.
- Listing columns: `Ref | Title | Mode | Classification | Agency | Publish date | Closing date+time`.
  **Closing dates are in the listing HTML** — no PDF parsing needed for the core feed.
- **ABC is NOT in the listing.** It's on `/Indexes/viewLiveTenderDetails/{id}` — one fetch per notice.
  4,300 detail fetches nightly is the enrichment job. **But it needs no model:** every detail field is
  a `<label>Name:</label>value` pair. Parse the structure, never line adjacency — adjacency returns
  the *next field's label* when a value is empty, which corrupted `location` on 13% of notices while
  reporting a 100% capture rate.

**Lead-time distribution** — sample of 300, now superseded by the full 4,300-row snapshot:

| time to closing | sampled 300 | **full 4,300** |
|---|---|---|
| ≤2 days | 32% | 23.2% |
| 3–6 days | 27% | 36.2% |
| 7–13 days | 8% | **16.3%** |
| 14–29 days | 32% | 21.9% |
| 30+ days | 0.3% | 2.2% |
| no date | — | 0.3% (the 12 zombie rows) |

**~60% close within 6 days — confirmed at 59.4%.** So "4,300 open" still overstates the market. But
the 7–13 day band is **2× the sampled estimate** (702 notices, not ~340), so the actionable pool is
larger than the sample suggested. This is also *why* the product exists: no alerts anywhere means a
weekly checker structurally misses most of the market.

**Composition:** 72% Goods · 22% Civil Works · **1% Consulting Services** (3 of 300).
58% Small Value Procurement · 37% Competitive Bidding.

> Software work hides inside "Goods" and "Goods – General Support Services". The official taxonomy
> **cannot** find software jobs. Keyword-over-title is the only thing that works — and nobody does it well.
> SVP (below-threshold, quotation not full bid) is the high-volume/low-effort segment big players ignore.

**Measured 2026-08-08 pm — the door is real but the room is small.** Model-tagged 337 sampled
notices: **software is 3 of 337 (<1%)**, and only one of the three was actual development (₱2M
multi-year MIS contract); the others were Zoom and Power BI licence renewals. Extrapolates to ~200
software notices open corpus-wide, maybe **60–70 real dev contracts**. The taxonomy claim is
confirmed — 5 notices filed as "Goods" are actually civil works, 1 filed as "Consulting Services" is
a printing job, so `classification` cannot be the filter. But the volume is civil works and supply,
not software. See open question 5.

**No government API exists.** `api.philgeps.gov.ph` is real but aggregate-only (`/api/infonotice/*`
returns `[]`); its Swagger is an unconfigured Petstore demo. `data.gov.ph` is an empty SPA. The
Philippines is **absent** from the OCDS registry (134 publishers; India/Indonesia/Nepal/Thailand present).
Build a scraper; don't wait for an API.

**Two systems, partially migrated.** PS Advisory 2026-19 cut Executive-branch posting on legacy
PhilGEPS 1.5 on 31 Jul 2026; non-Executive PEs are on later batches and were still posting to legacy on
7–8 Aug. The 4,300 figure is **mPhilGEPS only** — ~~legacy-side count unverified~~ **legacy = 17,845
open notices, verified live**. Listing at `notices.philgeps.gov.ph/GEPSNONPILOT/Tender/
SplashOpportunitiesSearchUI.aspx` (893 pages, ASP.NET postback pagination, offsets jumpable); detail
at `SplashBidNoticeAbstractUI.aspx?refID={id}`, no session needed. Legacy carries two fields
mPhilGEPS lacks: **Area of Delivery** (province) and **Solicitation Number**.

**Dedupe matters less than expected.** A given PE posts to exactly one system at a time, so the two
corpora are disjoint by construction — cross-searched both directions, zero hits, control query fine.
Duplicates can only arise inside a PE's cutover window. Tag with `source`, don't merge; `dupe_key =
sha1(PE | closing | title[:80] | abc)` with collisions flagged. ABC must be in the key, because one
BAC posts many identically-titled notices under a single deadline.

Full source table (25 verified sources incl. World Bank procurement API, Makati City's unauthenticated
JSON API, and mPhilGEPS Annual Procurement Plans browsable to 2027) → **`sources.md`**.

---

## Architecture

**Superseded by `docs/plans/2026-08-08-ph-rfp-search-design.md`.** Original, with what changed:

```
cron   → view-more-open-tenders (page until last-seen id) → SQLite            [built, ingest.py]
       → fetch /Indexes/viewLiveTenderDetails/{id} for new refs               [built]
enrich → Luna extracts ABC / line items / eligibility        ~₱240/night      → ABC is a regex, ₱0
search → whole corpus in a cached prompt        ~₱0.35/search → DOESN'T FIT (1.55M > 1M window)
UI     → direction B, chat right, tender cards as output (never prose)        [someone else's job]
```

Replaced by: **SQLite + FTS5 + a small CLI the model drives** (~8K tokens ≈ ₱0.02/search, and
*invariant to corpus size*), plus **one ingest-time tagging pass** — Luna reads each notice once and
writes `work_type`, `needs_pcab`, `eligibility`, a one-sentence `scope`, and FTS keywords into
columns. Measured over two 200-notice pilots: **₱262–279 for the full 22,145 corpus**, ~425 in / ~100
out tokens per notice. Output tokens cost 1.4–1.6× input, so terse tags — not input stripping — are
the cost control.

Why this beats the original: cost per search is dominated by *where reasoning lives*. Read-time
reasoning is paid every search and no longer fits; ingest-time reasoning is paid once per notice,
ever.

**Cost model at 10,000 searches/month:** ~~₱3,500 search + ₱7,200 enrichment~~ → **~₱200 search
(10,000 × ₱0.02) + ~₱279 one-time tagging + ~₱55/night incremental.**

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
- **BetterGov** transparency dashboard: 2.5M award records, free — but **stops at 2025**. ~~No 2026 awards
  exist for free anywhere.~~ **Wrong: legacy PhilGEPS serves award notices ungated, with peso amounts
  (rolling 100 most recent).** Award prices are how you learn an agency's real price behaviour versus
  its posted ceiling — deferred, but free.

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
2. ~~Legacy PhilGEPS 1.5 open-notice count~~ — **answered: 17,845.**
3. Frontend stack — Next.js or otherwise. Undecided.
4. Whether Luna is strong enough for PCAB/RA 12009 eligibility reasoning, or that one call escalates.
   Pilot `eligibility` output looked sane but was not checked against the statute.
5. **Does the software finding change the target user?** ~60–70 live dev contracts nationally is a thin
   market; civil works is 25–50% of the board. If the pitch is aimed at software firms the addressable
   pool may be too small to matter. Measured on mPhilGEPS only — legacy's 17,845 LGU notices are
   untagged so far.
6. **Legacy detail-page text size** — unmeasured, and legacy is 81% of the corpus. Fatter pages push
   the tagging pass toward ₱900; thinner pages make it cheaper but the tags less reliable.
7. **Attached bid documents** — `Documents` / `Bid Supplements` labels appear on 69/69 detail pages and
   are completely untouched. The description is boilerplate; the real scope lives in the attachments.
   Highest-value next spike, ahead of APPs.

# Fresh PH Government RFP Feed — Spike Report
*All findings below were re-fetched and re-verified on **2026-08-08**. Claims are marked VERIFIED (someone fetched it and parsed the body), REFUTED (fetched, contradicted), or UNVERIFIED (nobody proved it).*

---

## 1. TL;DR

- **PhilGEPS is ~everything.** RA 12009 §20.1.1 makes it the single mandatory portal; the registered buyer roster is 38,488 agencies including **21,446 barangays** (VERIFIED via `api.philgeps.gov.ph/api/infobuyer/summary`). Every LGU site checked either duplicates PhilGEPS or *literally re-hosts PhilGEPS-generated PDFs*. One source gets you 80%+.
- **But PhilGEPS is currently two systems and you must scrape both.** PS Advisory 2026-19 (quoted verbatim, VERIFIED) cut Executive-branch posting on legacy PhilGEPS 1.5 on **31 July 2026**. LGUs and non-Executive PEs are on later batches and were still posting new notices to legacy on 07–08 Aug 2026 (VERIFIED: Municipality of Titay, City of Davao). Single-system scrapers miss real volume — and LGU volume is exactly what this product is about.
- **Closing dates are in the listing HTML on both systems.** No PDF parsing needed for the core feed. Legacy grid header is literally `Publish | Closing | Title`; mPhilGEPS listing has a `Closing date` column. This is the single biggest cost saver and it was wrong in several earlier writeups.
- **There is no notice-level JSON API from the Philippine government.** `api.philgeps.gov.ph` is real, open, and aggregate-only (all `/api/infonotice/*` return `[]`). The Swagger UI at `/docs/` is an unconfigured Petstore demo. `data.gov.ph` is an empty SPA. There is **no PH OCDS publisher** (OCP registry lists 134 publishers; PH absent; India/Indonesia/Nepal/Thailand present). Build a scraper; do not wait for an API.
- **Cheapest real v1 = ~165 cold GETs/day, no browser, no session, no proxy.** 153 legacy category page-1 fetches (publish-date DESC) + mPhilGEPS `view-more-open-tenders` paged by descending id until you hit your last-seen id. Both give title, publish date, and closing date+time in the listing.

---

## 2. Source table

Sorted by usefulness. Everything here was fetched; refuted/dead sources are in §6.

| # | Name | URL | Covers | Access | Closing date? | Verdict |
|---|---|---|---|---|---|---|
| 1 | **mPhilGEPS open-tender listing** | `https://philgeps.gov.ph/indexes/view-more-open-tenders?page=N&direction=Tenders.id+desc` | All Executive-branch (and migrated) PH procurement. VERIFIED "4,266 total" open, 20 rows/page, true newest-id-first ordering | Plain GET. No cookie, no CSRF, no JS | **YES** — `Closing date` col, `04-Sep-2026 10:00 AM` | **USE — primary** |
| 2 | **Legacy PhilGEPS category listing** | `https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&BusCatID=<1..183>&type=category&ClickFrom=OpenOpp` | Non-Executive PEs still on 1.5 — **LGUs, provinces, municipalities, barangays, schools**. 153 valid categories | **Page 1 = cold GET.** Pages 2+ need an ASP.NET session cookie jar (see §6) | **YES** — `Publish \| Closing \| Title`, `10/08/2026 09:00 AM` | **USE — primary** |
| 3 | **mPhilGEPS notice detail** | `https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/{id}` | Full record: ABC, mode, classification, funding source, delivery location, business category, **UNSPSC line items**, BAC members, prebid date+venue, contact | Plain GET by sequential int id | **YES** + `Date Last updated` + separate `Bid Validity Period` | **USE** |
| 4 | **Legacy printable bid abstract** | `https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/PrintableBidNoticeAbstractUI.aspx?refid={N}` | Full notice, open **and** historical (VERIFIED live at refids from 2017, 2023, 2026) | Plain GET by int refid. No cookie/referer/viewstate. ~42% smaller than the interactive variant | **YES** — `Closing Date / Time` | **USE** — cleanest endpoint on either system |
| 5 | **Legacy interactive detail** | `.../SplashBidNoticeAbstractUI.aspx?refID={N}` | Same fields + attachment postbacks. Metadata free; **attachments login-walled** (exact string verified) | Plain GET; `menuIndex` NOT required (REFUTED as mandatory) | YES | USE (or prefer #4) |
| 6 | **mPhilGEPS Former Opportunities** | `https://philgeps.gov.ph/Indexes/getFormerOpportunities` | Closed/expired notices back to id 4 (2021). Same cols + a `Status` column | Plain GET | YES | USE — for close-out / backfill |
| 7 | **mPhilGEPS Annual Procurement Plans** | `https://philgeps.gov.ph/Indexes/getApp` | Per-agency APPs, browsable **2018–2027**, public, no login. 2027 rows already live (e.g. BSP) | Plain GET | n/a — *forward-looking* | **USE — the differentiator** (months of lead time before an ITB exists) |
| 8 | **World Bank Procurement Notices API** | `https://search.worldbank.org/api/v2/procnotices?format=json&rows=10&project_ctry_name=Philippines` | 4,817 PH records. VERIFIED live MMDA REOI `PH-MMDA-564529-CS-QCBS` | **Real JSON API**, no key, `fl=` projection works | **YES** — `submission_deadline_date` + `submission_deadline_time` | **USE** — best structured source anywhere in this report |
| 9 | **UNDP Procurement Notices** | `https://procurement-notices.undp.org/` | PH records readable off the landing page with zero filtering (`UNDP-PHL-00995/00996`) | Plain GET, server-rendered, no bot protection | **YES** — `Deadline` col, **New York time** (normalize!) | **USE** |
| 10 | **Makati City bids API** | `https://www.makati.gov.ph/api/TempBidding/ListWithMinutesMeeting/Published?Isdeleted=0&fromDate=0001-01-01` | 36 live Makati ITB/REOI records with dept attribution | **Unauthenticated JSON**, plain curl | **YES — ISO-8601.** `deadline` (24/36), `closedate` (36/36), `prebid_date`, `abc` | **USE** — only LGU with a real structured deadline API |
| 11 | **NIA CAR — Invitation to Bid** | `https://car.nia.gov.ph/invitation-to-bid` | Cordillera irrigation civil works. `?page=1..5` | HTML table, GET | **YES — three of them**: `Publish Date \| Pre-Bid Date \| Closing Date` | **USE** — richest agency HTML table found |
| 12 | **NIA Region II** | `https://region2.nia.gov.ph/invitation-to-bid` | Cagayan Valley civil works, ₱85M–₱244M | HTML table, GET | **YES** — `Deadline of Bid Submission` + ABC | USE |
| 13 | **Quezon City admin-ajax** | POST `https://quezoncity.gov.ph/wp-admin/admin-ajax.php?action=getpostsfordatatables` body `term=goods-and-services` | 772 goods rows, 498 bulletins, 73 infra, 44 consultancy, 7,279 NOAs | **Undocumented JSON**, no nonce/cookie | **Free-text only** — deadline is the parenthesised date *inside the title* | MAYBE — enrichment |
| 14 | **PS-PhilGEPS news RSS** | `https://ps-philgeps.gov.ph/home/index.php/about-ps/news?format=feed&type=rss` | Migration advisories, platform cutover dates | RSS, 10 items, live `lastBuildDate` | n/a | **USE** — non-negotiable tripwire for further migration slippage |
| 15 | **GPPB resolutions index** | `https://www.gppb.gov.ph/resolutions/` | 404 PDF links, Res 01-2003 → 13-2026, newest upload folder `2026/07` | HTML, one request | n/a | USE — poll for threshold/day-count changes |
| 16 | **IRR of RA 12009, 1st Ed.** | `https://www.gppb.gov.ph/wp-content/uploads/2026/05/IRR-of-RA-12009-1st-Edition.pdf` | 420pp, text-extractable, Annexes **A–I** (not A–F) | PDF download | Defines §50.2(h) | USE — pin as versioned reference |
| 17 | **IRR full text (HTML)** | `https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/98454` | **Complete** through §117 | HTML — **broken TLS chain**, needs `-k` | n/a | USE (LawPhil is truncated at §54 — see §6) |
| 18 | **Iloilo Province BAC** | `https://iloilo.gov.ph/en/bac-reports-view?page=N` | Drupal 9 Views table, ~13,488 rows (page 674 = last) | Clean GET | **NO** — `Authored on` only | MAYBE — docs live on **Google Drive folders** |
| 19 | **Davao del Norte** | `http://davaodelnorte.gov.ph/index.php/bid-opportunities/bidding-invitations` | Provincial ITBs. 2.7 MB body | HTML (hand-authored tables, 924 rowspans) | **YES-ish** — 2,768 anchors whose anchor *text* is the opening date | MAYBE |
| 20 | **Cebu City goods & services** | `https://www.cebucity.gov.ph/transparency/procurements/goods-and-services/bid-invitations-on-goods-and-services/` | ~2,340 entries, flat `<ul>` | GET, **must follow redirects** | **NO** — post date only; 2-hop to PDF | MAYBE |
| 21 | **Bayambang WP REST** | `https://bayambang.gov.ph/wp-json/wp/v2/invitation_to_bid?per_page=100&orderby=date&order=desc` | 1 municipality, 2 records (monthly bundles) | WP REST, no auth | NO (`meta` null) | MAYBE — cleanest access, near-zero volume |
| 22 | **PPA (Ports Authority)** | `https://www.ppa.com.ph/ppa_itbpage?field_office_itb_value=Head+Office&page=0` | Port civil works + real IT buys. 25 PMOs | Drupal view, GET params | **NO** — deadline is inside the ITB PDF (validated: real `%PDF-1.5`, contains "Bid opening shall be on 25 August 2026") | MAYBE |
| 23 | **CAAP** | `https://caap.gov.ph/bids-and-awards-committee-2026/` | Airport construction. 419 PDFs, **366 genuinely procurement** by anchor text | HTML → PDF | NO | MAYBE |
| 24 | **api.philgeps.gov.ph** | `https://api.philgeps.gov.ph/api/InfoBuyer/summaryBid`, `/api/infobuyer/summary`, `/user/total`, `/bid/loadRunningBids` | **Aggregate only.** 2024: 557,443 bid posts / 263,026 awards. 38,488 agencies. 369,588 suppliers | Open JSON, CORS `*` | **NO** | MAYBE — sizing/validation only. Junk row `publishedDate: "2035"`; **no 2026 row** |
| 25 | **Apify PhilGEPS actor** | `https://apify.com/jungle_synthesizer/philgeps-procurement-scraper` | Documented output incl. `closing_date` | Paid, pay-per-event, OpenAPI spec | YES (documented) | **SKIP as infra** — 14 total users, 2 MAU, targets legacy stack. Read the schema, don't depend on it |
| 26 | **BetterGov awards dashboard / data portal** | `https://github.com/csiiiv/philgeps-awards-dashboard` · `https://data.bettergov.ph/` | Awards/contracts **2000–2025**, SEC contractor data, DPWH infra 2016–2025, DIME 12,870 projects | Repo + CSV export | **NO** — awards only | MAYBE — backfill/benchmarking, not alerting |
| 27 | **PS-PhilGEPS own ITBs (RSS)** | `https://ps-philgeps.gov.ph/home/index.php/bid-opportunities/invitation-to-bid?format=feed&type=rss` | PS-DBM's own buying only | RSS (parent-category feed is **empty** — subscribe per sub-category) | **NO in practice** — bodies are scanned-image PDFs, `pdftotext` → 3 bytes | SKIP as data; USE as tripwire |
| 28 | **ADB CSRN** | `https://selfservice.adb.org/OA_HTML/OA.jsp?OAFunc=XXCRS_CSRN_HOME_PAGE` | 207 open consulting notices (45 firm / 162 individual) | Public, no login, but **Oracle OAF needs a browser** | **YES** — `Deadline (Manila local time)` | MAYBE — PH-specific volume **UNVERIFIED** |
| 29 | **ADB institutional procurement** | `https://www.adb.org/business/institutional-procurement/notices` | ADB's own corporate buying; HQ is Manila | **Plain curl works** (only `/projects/*` is Cloudflare-gated) | **YES** — `End date` w/ timezone | MAYBE — small PH share |
| 30 | **EU TED** | POST `https://api.ted.europa.eu/v3/notices/search` body `{"query":"place-of-performance IN (PHL)","limit":5}` | **65 lifetime** PH records | Real API, no auth | Field requested but **no deadline key surfaced** — UNVERIFIED | SKIP for v1 |
| 31 | **PhilGEPS Open Data portal** | `https://open.philgeps.gov.ph/` | Aggregate dashboards. **Tender analytics year dropdown stops at 2021.** Every `/analytics/load/*` returns `text/html`, not JSON | HTML | **NO** | **SKIP as ingestion** — keep as legal leverage (§6) |

---

## 3. The freshness problem

### Which field
Use **`Closing Date`** (legacy: `Closing`; mPhilGEPS: `Closing date`). It exists in the **listing HTML on both systems**, with a time component. Do not derive freshness from anything else:

- **`Bid Validity Period` is not a deadline.** mPhilGEPS detail exposes `Bid Validity Period: 120` as a *separate* field from `Closing Date` (VERIFIED on ref 54988). §57.1 sets the 120-calendar-day default bid validity. Confusing the two inflates every deadline by ~4 months.
- **`Date Last updated` ≠ closing.** mPhilGEPS detail has both. Use `Date Last updated` for change detection, not expiry.
- **Legacy `Status`** on the printable abstract takes `Active` / `Awarded` / `Failed` (VERIFIED across refids 13148966 / 9924505 / 5000000). That's your authoritative close-out signal for backfilled records.
- **Endpoint, not param, selects open vs closed** on mPhilGEPS: `viewMoreOpenTenders` vs `getFormerOpportunities`. The legacy category view is pre-filtered to open-only.

### Date format — the silent corruption bug
| System | Format | Example |
|---|---|---|
| Legacy `notices.philgeps.gov.ph` | **dd/MM/yyyy hh:mm AM/PM** | `05/08/2026` = **5 August** |
| mPhilGEPS `philgeps.gov.ph` | **dd-MMM-yyyy hh:mm AM/PM** | `04-Sep-2026 10:00 AM` |
| Makati API | ISO-8601 | `2026-08-18T09:30:00` |
| UNDP | `24-Aug-26 06:00 AM` **New York time** | normalize to Asia/Manila |
| ADB CSRN | `15-Sep-2026 11:59 PM` **Manila time** | — |
| Cebu / Ilagan | `MM/DD/YY`, `MM/DD/YYYY` | opposite convention to legacy |

Parsing `05/08/2026` as US format silently shifts every legacy deadline by months. Assert on the source host, not on a heuristic.

### Legal minimum lead times (all VERIFIED verbatim in the IRR extraction)
| Rule | Provision | Effect on polling |
|---|---|---|
| ITB/REOI posted **7 calendar days** starting on date of advertisement | IRR §50.3.1(b) | An open ITB is visible for ≥7 days → daily polling cannot miss one |
| **3 calendar days** posting for RFQ/RFP under the small-value regime, with a **₱200,000** exemption | IRR §34.3(b) | Small-value RFQs can live **3 days**. Daily polling is the floor; 2×/day is safer for LGU RFQs |
| Pre-bid conference at least **12 calendar days** before the submission deadline | IRR §51.2 | A prebid date in the listing implies ≥12 days of remaining life |
| Max **45 calendar days** from advertisement to submission deadline (Goods) | IRR §54.5 | Sanity bound — reject parsed deadlines >45 days out for goods |
| Bid validity **120 calendar days** | IRR §57.1 | Not a deadline (see above) |
| Deadline falling on a non-working day moves to the **next working day** | IRR §67.3 | Your "closed" computation must respect PH holidays |

**Practical rule:** an ITB has ≥7 days of runway; an SVP/RFQ may have 3. Poll daily; you will still be "fresh" by a wide margin. Nobody rate-limited any of this — VERIFIED zero 403/429 across ~200 concurrent-8 GETs on the legacy host and 10 sequential + 8 parallel on mPhilGEPS. Stay at 1–2 req/s anyway: `philgeps.gov.ph` echoes your own IP back in a Dynatrace RUM string (`Anonymous(65.108.224.158:37324)` — the verifier's own address), so scraping is observably per-IP. `philgeps.gov.ph/robots.txt` returns **HTTP 500** — that's a broken server, not a grant of permission.

### When the deadline is only in a PDF
1. **Try the PhilGEPS Bid Notice Abstract layout first.** It is a fixed template: `pdftotext` yields the literal label `Closing Date / Time` with the value on the **following line** (VERIFIED: Tayabas `RFQ-26-103-printableBidNoticeAbstract.pdf` → `30/07/2026 09:00 AM`). Crucially, **LGUs re-host this exact document** — Tayabas's uploaded PDF is verbatim a PhilGEPS abstract carrying PhilGEPS reference 13153386. So one parser covers the portal *and* every re-hoster, and any file matching `*printableBidNoticeAbstract*.pdf` on an LGU site adds **zero** tenders beyond PhilGEPS — a free deprioritisation signal.
2. **Test extractability before assuming OCR.** `pdftotext` length is the discriminator. VERIFIED failures: `ngpa.gppb.gov.ph` RA 12009 PDF = 18.5 MB, 39 pp, **39 bytes** of text (full-page 200-dpi JPEGs). PS-PhilGEPS ITB postings = **3 bytes**. The Joomla-article-wrapping-a-scanned-PDF pattern is the norm on agency BAC pages — this is the mechanical reason agency-site scraping doesn't scale.
3. **Validate `%PDF` magic bytes.** DPWH serves `26la0004-bid_proposal.pdf` as **HTTP 200, `content-type: text/html`, 850 bytes, magic `3c 68 74 6d 6c` (`<html`)** — an Imperva interstitial. A naive scraper silently stores WAF pages as bid documents.
4. **Filename/anchor-text conventions as last resort.** Davao del Norte encodes the triple in the path and the *anchor text is the opening date*: `<a href="/images/jf/transparency/48_Aug_5_-_Aug_13_-_Aug_27_-_INFRA_-_3871-3872_3880_F.pdf">AUGUST 27, 2026</a>`. Verified across three rows.
5. **Cheapest fallback of all:** don't parse the PDF. Take the reference number from the LGU/agency page and look the same notice up on PhilGEPS, where the closing date is a real field.

---

## 4. Coverage map

Numbers below are a mix of measured and estimated — I've marked which.

### Registered buyer composition (MEASURED — `api.philgeps.gov.ph/api/infobuyer/summary`, 38,488 total)
| Type | Count |
|---|---|
| Barangay | **21,446** |
| Department (national) | 2,349 |
| Municipal | 1,791 |
| GOCC | 1,670 |
| SUC | 396 |
| City | 321 |
| Provincial | 107 |

This is the strongest argument for the PhilGEPS-only strategy: the portal's registered publisher set already reaches the barangay tier, and barangay-level notices were observed live in the listings (`BARANGAY MATINA 74-A DAVAO CITY`, `CADIZ WEST II ELEMENTARY SCHOOL`, `BARANGAY CENTRO OCCIDENTAL, POLANGUI, ALBAY`).

### Tier coverage
| Tier | What it sees | Share of open PH RFPs (estimate) | Notes |
|---|---|---|---|
| **PhilGEPS (both systems)** | Everything ≥₱200k, all levels, plus much below | **~90–95%** | Legally mandatory. Legacy detailed view reported **17,845** open opportunities and 893 pages (MEASURED twice independently, 2026-08-08); mPhilGEPS reported **4,266** open. |
| **mPhilGEPS alone** | Executive branch post-01-Aug-2026 + migrated PEs | ~25% *today*, rising to ~100% as batches migrate | 4,266 open. Verified publishers: DepEd divisions, AFP Procurement Service, DSWD R1, Coast Guard. |
| **Legacy 1.5 alone** | Non-Executive PEs on later batches — **LGUs, provinces, municipalities, barangays, SUCs** | ~75% *today*, decaying | Still accepting new posts on 07–08 Aug 2026 (VERIFIED: Titay Zamboanga Sibugay, City of Davao, both LGUs). |
| **Agency sites** | Essentially nothing PhilGEPS lacks | **~0–3% additive** | The three richest (NIA CAR/R2, PPA, CAAP) are *easier to parse* than PhilGEPS for their niche, not broader. |
| **LGU sites** | Near-duplicate of PhilGEPS | **~0–5% additive**, UNCERTAIN | Tayabas re-hosts PhilGEPS abstracts verbatim. Davao City's own site has **zero** procurement content (0/86 links match `bid\|procure\|bac\|award`), yet City of Davao ITBs sit on PhilGEPS. Strong evidence LGU sites are a *subset*. |
| **Donor-funded** | World Bank / ADB / UN / EU | **additive**, small but real | WB: 4,817 PH records; UNDP: live PHL refs; ADB CSRN: 207 open; TED: 65 lifetime. Some *also* appear on PhilGEPS under different reference numbers (the WB MMDA record will) — **dedupe by title + entity + ABC, not by reference number**. |
| **Below-₱200k / SVP / shopping** | Partially central, partially agency-only | **the real blind spot** | See below. |

### Explicit blind spots
1. **Below-threshold RFQs.** IRR §34.3(b) carries a **₱200,000** exemption with only a 3-calendar-day RFQ/RFP posting duty. Some of these appear on PhilGEPS (VERIFIED: ref 13168609, Province of Bulacan, `Negotiated Procurement - Small Value Procurement (Sec. 34)`, ABC ₱925,000) — but the sub-₱200k tail is where PEs can legally satisfy the posting duty on their own bulletin board and website. **You cannot size this gap from any data I have.** Pinamalayan alone hosts 2,530 unique PDFs including small-value items; QC's `goods-and-services` feed alone carries 772 rows.
2. **Batched postings.** Quezon City bundles many projects into a single "INVITATION TO BID" post — one detail page yielded **23 unique PDFs** covering many separate procurements. Whether PhilGEPS carries these as one notice or N is **UNVERIFIED**. Your notice count will undercount actual contract opportunities.
3. **The mPhilGEPS 100-row cap.** `/Indexes/index` returns exactly 100 rows with **no pagination markup**. If you scrape that path instead of `view-more-open-tenders`, you silently see only the 100 most recent notices.
4. **Cloudflare/Imperva-walled agencies.** DPWH (largest construction buyer) and DICT (largest software buyer) are unreachable from datacenter IPs, along with DOH, COA, LWUA, NHA, MWSS, DOTr, NEA, BCDA, DepEd, Iloilo City, Caloocan, Muntinlupa, Taguig, Davao del Sur, Cauayan. **Nobody has seen their markup** — every claim about their structure is speculation. They post to PhilGEPS by law, so this is a *convenience* gap, not necessarily a coverage gap. PH/residential egress would resolve it.
5. **Legacy volume is disputed.** Two independent measurements on 2026-08-08 of the same category-sum gave **17,845** and **10,845**; the 17,845 figure was corroborated by the portal's own global counter (`17,845 opportunities found`, `of 893` pages) and is the one I'd trust. Third-party front-ends advertise ~3,900 *unique* live notices. The gap is likely multi-category tagging plus stale rows. **Do not size infrastructure off any of these until you've deduped by refID yourself.**

---

## 5. Cheapest v1

### The laziest thing that produces a real feed

Two poll loops, both cold GETs, no browser, no session, no proxy, no PDF parsing.

**Loop A — mPhilGEPS (Executive branch), ~5–15 requests/run:**
```
GET https://philgeps.gov.ph/indexes/view-more-open-tenders?page={1,2,3,...}&direction=Tenders.id+desc
```
20 rows/page, strictly descending id. Walk pages until you hit your last-seen `Bid Notice Reference Number`, then stop. Columns available directly:
`Bid Notice Reference Number | Notice Title | Mode of Procurement | Classification | Agency Name | Publish Date | Closing date`

**Loop B — legacy (LGUs), 153 requests/run:**
```
GET https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx
    ?menuIndex=3&BusCatID={1..183}&type=category&ClickFrom=OpenOpp
```
Valid `BusCatID` values: 127 in 1–150 and 26 in 151–183 (max 183). Page 1 is **publish-date DESC**, which is exactly what you want for delta polling. 20 rows/page. Parse the `dgSearchResult` grid: `Publish | Closing | Title`, plus the `refID` in each row link.

> **Do NOT use the all-categories detailed view** (`&type=detailed`) for delta polling — it is sorted **closing-date DESC**, so row 1 was published 03/05/2025 and closes 16/04/2027. Useless for "what's new."

### Fields to extract (v1 schema)
| Field | Legacy source | mPhilGEPS source |
|---|---|---|
| `id` (PK) | `refID` (stable int) | `Bid Notice Reference Number` / detail id |
| `title` | title cell — **split it** | `Notice Title` |
| `category` | **concatenated into the title cell** (`", Agricultural Machinery and Equipment ,PROVINCE OF BULACAN"`) | `Classification` col |
| `procuring_entity` | same concatenated cell | `Agency Name` col |
| `published_at` | `Publish`, dd/MM/yyyy | `Publish Date`, dd-MMM-yyyy |
| `closes_at` | `Closing`, dd/MM/yyyy hh:mm AM/PM | `Closing date`, dd-MMM-yyyy hh:mm AM/PM |
| `source_system` | `legacy` / `mphilgeps` | — |
| `url` | printable abstract by refid | `viewLiveTenderDetails/{id}` |

That's a complete, deadline-bearing, deduped feed with **zero detail fetches**. Optional enrichment (1 GET per new notice, ~50–300/day): ABC, procurement mode, delivery location, contact person, UNSPSC codes.

### Effort
- **~1–2 days** for a competent dev. Python + `requests` + `lxml`, one cron, SQLite or Postgres.
- **~165 requests/day** at 1–2 req/s ≈ 2 minutes of wall time. Fits a $5 VM.
- No headless browser, no Apify subscription, no residential proxy, no OCR.

### Parser gotchas that will bite you on day one (all VERIFIED)
1. The legacy result counter is **`N&nbsp;opportunities found`**. A regex expecting a literal space matches nothing and your enumeration silently returns zero.
2. Legacy `__doPostBack` hrefs use **HTML-escaped quotes** — `__doPostBack\('([^']+)'` finds nothing.
3. Legacy category/entity are **inside the title cell**, not separate `<td>`s. Split, don't index columns.
4. On mPhilGEPS detail, **HTTP 500 means both "broken record" and "id doesn't exist yet"** (reproduced: id 55545 broken; ids 55600/56200/57000 out-of-range — identical response). You cannot use 500 as an end-of-range sentinel; derive the ceiling from the listing. Legacy degrades cleanly instead: `refid=1000000` → 302 to `ErrorPage.aspx` (155 bytes).
5. Legacy `refID` is **sparse, not sequential** — harvest from listings, do not enumerate.
6. `Approved Budget` on the printable abstract extracts as the literal string `PHP` with the amount in an *adjacent cell*. Parse the cell pair.

### What v2 adds
Deep pagination + full backfill (per-category ASP.NET session jars, `pageDropDownList` offset = `(page-1)*20+1`), detail-page enrichment with UNSPSC codes and ABC for filtering/matching, **APP ingestion from `/Indexes/getApp` (2018–2027) for months of lead time before an ITB exists**, close-out via `getFormerOpportunities` + legacy `Status`, and donor overlay (World Bank API + UNDP) with fuzzy dedup against PhilGEPS.

---

## 6. Blockers & unknowns

### Will break your scraper silently — fix before shipping
- **Legacy pages 2+ require an ASP.NET session cookie, and the filter lives in the session, not the viewstate.** A cookieless POST of `pgCtrlDetailedSearch$numberPage_5` against `BusCatID=31` returns **HTTP 200 with 20 well-formed rows** — but the counter flips from `109` to `17,845` and the categories are Vehicles / Systems Integration / Construction Projects. It silently drops the category filter and serves page 5 of the *global* list. Build it wrong and you ingest ~153 mislabeled copies of the same list, and every page looks correct.
  - **Fix (VERIFIED):** one `ASP.NET_SessionId` cookie jar **per category**; you cannot multiplex categories on one session. Within a session, viewstate reuse works and offsets are deterministic. Parallelism is *across* sessions.
  - **Mandatory invariant:** assert the `N&nbsp;opportunities found` counter on every paged response still equals that category's page-1 count. That single assertion is what catches the fallback.
- **Two pager renderings.** Small categories render `__doPostBack numberPage_N` links and **no** dropdown; large ones (cat 42, 318 pages) render `pageDropDownList` and **zero** `numberPage` links. Posting the target that isn't rendered is a silent no-op returning page 1 *with the correct count*. Branch on which pager is present. (Contradicted claims exist in the source research about the control name — `pgCtrlOpp$*LB` was REFUTED; the observed targets are `pgCtrlDetailedSearch$nextLB` and `pgCtrlDetailedSearch$pageDropDownList`.)
- **SPAs return 200 for paths that don't exist.** Makati serves an identical 14,019-byte HTML shell for any unknown `/api/*` path. Baguio returns an identical 8,330-byte body for `/`, `/bids-and-awards`, `/sitemap.xml`, **and a deliberately invented path**. Assert `Content-Type: application/json`, never HTTP status.
- **JS-rendered LGU pages: an immediate DOM read is a false negative.** Makati's page returns `innerText.length === 0` on immediate read and 13,142 chars after ~6s. This error caused an entire earlier assessment to be wrong.
- **Empty `<tbody>` trap.** QC (7 tables, 7 empty tbodys, zero "INVITATION TO BID" in server HTML) and Bayambang both render rows client-side. Cavite is worse: **HTTP 200, 182,906 bytes, zero `href` in the page content** — an empty shell since 2026-01-16.
- **Broken TLS chains.** `elibrary.judiciary.gov.ph` and `pchrd.dost.gov.ph` both fail bare `curl` (error 60 / exit 000) with incomplete intermediate chains. Browsers hide this; scrapers don't.
- **URL encoding.** Cagayan de Oro serves files at paths with literal spaces; the raw path fails outright, percent-encoded returns 200.

### Unverified — do not plan around these
- **`open.philgeps.gov.ph/ps-login`.** The highest-value open question in the whole spike. The portal's own hero copy advertises *"sharable raw data in a JSON, CSV, or XML Format using PhilGEPS API"* — that string is VERIFIED present in the HTML — but **no reachable JSON/CSV/XML endpoint was found**, `/api/` is 404, and every `/analytics/load/*` returns `text/html`. Nobody registered an account. If `/ps-login` grants bulk notice-level export, it obsoletes this entire scraper. **Someone should register and find out — it's a one-hour test with enormous leverage.**
- **PH-specific volume on ADB CSRN.** 207 open notices confirmed; the visible rows were VAN/KGZ/NEP/BAN. The Country facet was never expanded.
- **EU TED deadline field.** `deadline-receipt-tender-date-lot` was explicitly requested and no deadline key surfaced on sampled rows. At 65 lifetime PH records it doesn't matter.
- **SAM.gov / USAID.** `https://api.sam.gov/opportunities/v2/search` returned **404 both unauthenticated and with `DEMO_KEY`**. The docs page is live, so the API is probably real, but PH volume, the `responseDeadLine` field, and even basic responsiveness are all unconfirmed. USAID's 2025 restructuring reportedly cut PH volume anyway.
- **Whether Power BI dashboards** on `philgeps.gov.ph/CmsHomePages/open-data` (7 confirmed embeds) can be queried directly — nobody probed the backend. Aggregate only regardless.
- **Whether QC-style batched ITBs appear on PhilGEPS as one notice or N.**
- **Apify actor output quality** — the marketing page and documented schema were read; **no actual run was executed** by anyone.

### Login-walled / PDF-only / OCR-only
- **PhilGEPS attachments require login.** Exact string VERIFIED on the detail page: *"order to download the document, you must register first or login to the system."* **All metadata is free** — only the bidding documents themselves are gated. For a "here's a fresh RFP" product this is fine; for "here's the full TOR" it isn't.
- **PS-PhilGEPS ITBs are scanned images.** Two downloaded PDFs (PB-2026-010 REOI, PB-2026-009 ISP ITB): `pdftotext` → **3 bytes**, every page a 1663×2360 200-dpi JPEG. The §50.2(h) deadlines are legally present, as pixels.
- **`ngpa.gppb.gov.ph` RA 12009 PDF** — 18.5 MB, 39 pages, 39 bytes of text. Use the PS-PhilGEPS copy (47 pp, 138 KB of clean text) instead.
- **Iloilo Province "View Document"** points at **Google Drive folders** (22 on page 0), not files. Needs Drive traversal, and a folder may hold several files.

### Confirmed dead / refuted — do not spend time here
`philgeps.bettergov.ph` (HTTP 530, Cloudflare origin DNS failure) · `data.philgeps.gov.ph` (522) · `data.gov.ph` (7,364-byte SPA; `/`, `/api/datasets`, `/api/3/action/package_search`, `/api/search` all **byte-identical**) · `api.philgeps.gov.ph/docs/` (unconfigured Swagger Petstore, `url = "http://localhost/api"`; all four spec paths 404) · **no PH OCDS publisher** (OCP registry: 134 publications, PH absent) · OGP PH0066 (403, unreadable) · `i.gov.ph` (**DNS does not resolve**) · `fdpp.dilg.gov.ph` (SonicWall block) · `adb.org/projects/tenders/country/philippines` (**404 from ADB's own app**, not a Cloudflare 403 — the path is gone; headless Playwright gets the same) · `devbusiness.un.org` (405, AWS WAF captcha; defunct since 31 Mar 2025) · JICA "tender" page (302s to a *Standard Bidding Documents* template library — never a feed) · UNGM `POST /Public/Notice/Search` (**HTTP 500**, reproduced twice) · BIR `/procurement` (renders 0 anchors, 0 text, then self-navigates to PhilGEPS `ErrorPage.aspx`) · PUP `/bidnotices/` (renders fully, **zero** notices) · DOST `/transparency/bid-opportunities.html` (0 PDF links; its 2 tables are weather widgets) · PhilGuarantee `/procurements/philgeps/` (252 KB of inline CSS, 0 tables, 0 PDFs) · `nia.gov.ph/?q=invitation-bid-listing` (monitoring reports, not bids) · LawPhil IRR (**truncated mid-§54.2(b)(viii)**; `Section 113/115/117/67` = 0 hits — cannot support any transitory-provisions analysis) · DPWH mirror of the 2016 IRR (850-byte Incapsula interstitial) · 404s that return large bodies: `up.edu.ph` 141 KB, `sss.gov.ph` 70 KB, `ppa.com.ph/invitation-to-bid` 42 KB — **assert on status, never byte count**.

### Commercial aggregators — all skip
GlobalTenders (real rendered listings but no API, no published pricing, claims 29,261 live vs a real figure somewhere between ~3,900 and 17,845) · **BidDetail resells UNDP, not PhilGEPS** — every visible free listing is a `UNDP-PHL-` record available first-party for free; the "DILG, DOH, DOLE, NEDA" sourcing claim appears exactly once each, all inside a single marketing sentence, and none publishes any actual record · TendersInfo (table header, **zero data rows**) · TendersOnTime, DgMarket, DevelopmentAid (403 to curl, WebFetch, *and* real Playwright — nothing observable) · OpenOpps (loads, but is SEO copy driving free-trial signups; **no listings, no deadlines, no OCDS mention anywhere on the page**).

### Legal / policy risk
- `<meta name="robots" content="noindex, nofollow">` is confirmed present on mPhilGEPS pages. No host has a real `robots.txt` (`philgeps.gov.ph` → 500, `notices.*` and `open.*` → 404). Absent directives ≠ permission; this is a judgment call to make deliberately, not by default.
- **The migration timeline can move again.** GPPB Resolution 09-2025 set four cutoffs (31 Oct 2025, 31 Dec 2025, 28 Feb 2026, 01 Mar 2026) and every one slipped, via a verbatim escape clause: *"Provided, that the PS-DBM may adjust the foregoing timelines as may be..."*. The real Executive-branch cutoff landed at 31 July 2026. **Poll the PS news RSS** — and note its "RELATED" links to prior advisories (2026-15, 2026-12, 2026-09, 2025-017) point at **facebook.com/share/p/…**, so part of the advisory history is not scrapable from the domain at all.
- **Treat every peso threshold and day-count as config, not a constant.** GPPB shipped 13 resolutions in the first seven months of 2026 alone. Filenames on `/resolutions/` are non-templatable (`GPPB-Resolution-No.-01-2026.pdf`, `GPPB_Resolution_No._09-2025.pdf`, `Approved_GPPB_Resolution_No._02-2026.pdf`, `GPPB_Resolution_No._11-2025_30012026.gppb_.pdf`) — always re-scrape the index and parse hrefs; never construct URLs. Several late-2025 resolutions live under `2026/` upload folders, so the path year ≠ the resolution year.
- **The IRR has real numbering defects.** §20.3's first subsection is labelled `20.1.1`; §50.3.2(d) cites "NGO Participation under Section 35.11" while the body numbers NGO Participation as §35.10. Don't key logic off parsed section numbers.
- **Leverage, if you ever need an official export:** IRR §20.2.10 imposes a duty to run an open data platform; PS-DBM publicly committed on 21 Oct 2025 that the data are *"downloadable and machine-readable"* with *"real time"* tracking; the portal itself advertises a JSON/CSV/XML API. Against that, the live analytics stop at **2021** and expose no row-level export. That gap is the strongest possible basis for a formal data request.
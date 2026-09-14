# Legacy PhilGEPS 1.5 coverage + dedupe — measured live

**Measured:** 2026-08-08 17:00–17:20 UTC = **2026-08-09 01:00–01:15 AM Manila (Sunday, middle of the night)**.
That timing matters for the drift question (§5) and for nothing else.
Closes DECISIONS.md open question 2 and the "two systems, partially migrated" note.

## Headline

**Legacy is alive, unauthenticated, fully scrapable by plain GET, and 4× bigger than mPhilGEPS.**

| system | open notices now | ABC on detail? | PE mix (sampled) |
|---|---|---|---|
| mPhilGEPS (`philgeps.gov.ph`) | **4,300** | yes | 93/160 national depts, 23/160 LGU |
| legacy 1.5 (`notices.philgeps.gov.ph`) | **17,845** (label) / ≥17,860 (pager) | yes | 73/100 LGU, 1/100 national dept |

Ingesting only mPhilGEPS covers **~19%** of the open national board and **almost none of the LGU
market** — which is the market the product is for. Legacy is not a legacy-cleanup problem, it is the
larger half of the corpus.

---

## 1. Legacy serves without auth — working URLs

All plain `GET`, no cookie, no login, no JS. Host `https://notices.philgeps.gov.ph` → `200`.

| purpose | URL (relative to `https://notices.philgeps.gov.ph/GEPSNONPILOT/`) | status |
|---|---|---|
| entry / category splash | `Tender/SplashOpenOpportunitiesUI.aspx?ClickFrom=OpenOpp&menuIndex=3` | 200, 53 KB, "153 categories found" |
| **full open listing** | `Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&ClickFrom=OpenOpp&Result=3` | 200, "**17,845 opportunities found**", 893 pages × 20 |
| listing filtered by category | `Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&BusCatID=157&type=category&ClickFrom=OpenOpp` | 200, 2 rows (cat 157 = Advertising Agency Services) |
| **notice detail** | `Tender/SplashBidNoticeAbstractUI.aspx?refID=13171550` | 200, 43 KB, **ABC present** |
| recent awards | `Tender/RecentAwardNoticeUI.aspx?menuIndex=3` | 200, 48 KB, "100 award notices found" |
| sitemap | `Sitemap/Sitemap.aspx` | 200 (exposes only the splash — useless for discovery) |

`refID` alone is enough on the detail page; `menuIndex` / `DirectFrom` / `Type` / `BusCatID` are decoration.

**Dead ends** (all `302 → /GEPSNONPILOT/ErrorPage/ErrorPage.aspx`, *not* to `/log-in.aspx` — these page
names simply don't exist; don't read the 302 as a paywall):
`Tender/SearchOpenOpportunitiesUI.aspx`, `Tender/OpenOpportunitiesUI.aspx`,
`Tender/ViewOpportunitiesByCategoryUI.aspx`, `Tender/DetailedSearchOpenOpportunitiesUI.aspx`,
and `Tender/SplashBidNoticeAbstractUI.aspx?refID=12345` (invalid refID → same ErrorPage).

### Pagination shape — one postback, arbitrary jumps

ASP.NET WebForms. The listing pager is a dropdown of **record offsets**, not page numbers:
`1, 21, 41, … 17841` (893 options). To page:

```
POST Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&ClickFrom=OpenOpp&Result=3
  __VIEWSTATE, __VIEWSTATEGENERATOR, __EVENTVALIDATION   (copied from the page you're on)
  __EVENTTARGET = pgCtrlDetailedSearch$pageDropDownList
  pgCtrlDetailedSearch$pageDropDownList = <offset>
```

Verified working: jumped straight from offset 1 to 17841 in one POST. Offsets are addressable in any
order, so the crawl is parallelisable if you keep one viewstate per worker. Page size is fixed at 20 —
no way found to raise it. **~893 POSTs for a full listing sweep.**

Keyword search is the same page: `__EVENTTARGET=""`, `txtKeyword=<kw>`, `btnSearch=Search`.
Verified: returns `"N opportunities found"` or `"No opportunities found"`.

Category grid pages the same way via `pgCtrlOpp$numberPage_<n>`; drilling a category row is
`__EVENTTARGET=dgSearchCatResult$ctl<NN>$LinkButton1`.

## 2. What legacy gives you

**Listing columns are only `Publish | Closing | Title`** — and the "Title" cell is a
comma-concatenation of three fields:

```
Publication of Municipal Ordinance No. 07-S-2025, Advertising Agency Services, MUNICIPALITY OF TITAY, ZAMBOANGA SIBUGAY
└─ title ────────────────────────────────────────┘ └─ category ──────────────┘ └─ PE ─────────────┘ └ province ┘
```

Splitting that back apart is lossy — titles contain commas ("Supply, Delivery, Installation, Testing
and Commissioning of Four (4) Units…"). **Don't parse it. Fetch the detail page**, which has every field
labeled separately. Dates are `DD/MM/YYYY` here vs `DD-Mon-YYYY` on mPhilGEPS.

Detail page fields (`refID=13171550`, verified):
`Reference Number` · `Procuring Entity` · `Title` · `Area of Delivery` · `Solicitation Number` ·
`Trade Agreement` · `Procurement Mode` · `Classification` · `Category` ·
**`Approved Budget for the Contract: PHP 100,000.00`** · `Delivery Period` · `Contact Person` (+ full
postal address, phone, email) · `Status` (Active) · `Bid Supplements` / `Document Request List` counts ·
`Date Published` · `Last Updated` · `Closing Date / Time` · full `Description` (the RFQ/ITB body).

Two fields legacy has that mPhilGEPS does **not** expose: **`Area of Delivery`** (province-level — the
geography signal the search skill needs) and **`Solicitation Number`** (the PE's own PR/RFQ number).

Cost of a clean legacy snapshot: **~893 listing POSTs + ~17,845 detail GETs**. That's 4× the
mPhilGEPS enrichment job the spike costed.

**Legacy's open list is genuinely open.** Sampled 100 rows at offsets 1 / 4001 / 8001 / 12001 / 16001:
**0 already-closed**, publish dates 21 Jul → 8 Aug, oldest page (offset 17841) publishes 30 Jun–1 Jul
with closings all in the future (10–28 Aug). No stale-notice filter needed on the legacy side.

Category counts sum to **17,845** across all 153 categories — exactly the listing total, so the
category taxonomy partitions the corpus cleanly (no multi-category double-counting). Top categories:
Construction Projects 6,352 · Construction Materials 1,454 · General Merchandise 947 · Food Stuff 585 ·
Catering 541 · Vehicles 533 · Drugs & Medicines 489 · **Information Technology 409**.

## 3. Dedupe — the two systems are effectively disjoint today

Tested both directions with real records.

**mPhilGEPS title → legacy keyword search:**

| query | legacy result |
|---|---|
| `SSS BAGUIO DORMITORY` (mPhilGEPS 55567) | No opportunities found |
| `Padday na Lima` (mPhilGEPS 55594) | No opportunities found |
| `ECG Machine, 3-Channel` (mPhilGEPS 55559, DOH-NCR) | 1 hit — but a *different* notice (Province of M…, "ECG Machine TC10 w/analysis") |
| `Convergence and Special Support` | 399 hits — all different project codes (`26BG*`, `26HE*`, `26HA*`) vs mPhilGEPS `26CC0028` |

**legacy title → mPhilGEPS search** (`POST /Indexes/viewMoreOpenTenders`):

| query | mPhilGEPS result |
|---|---|
| `Publication of Municipal Ordinance No. 07-S-2025` | 0 |
| `TITAY` | 0 |
| `26BG0091` | 0 |
| `Padday na Lima` (control — a known mPhilGEPS record) | 1 ✓ |

No shared identifier exists. The ID spaces are unrelated: mPhilGEPS `Notice Reference Number` is a
~5-digit sequence (55594) plus a `Control Number` (`0308015`); legacy `Reference Number` is 8-digit
(13171550) plus a `Solicitation Number` (`2026-07-701`). Different formats, different generators.

**Recommendation: don't merge. Tag.**

Store `source` (`mphilgeps` | `legacy`) and compute
`dupe_key = sha1(norm(procuring_entity) | closing_datetime | norm(title)[:80] | abc)`
where `norm` = uppercase, strip punctuation, collapse whitespace. On collision, **flag for review
rather than silently merging.**

Why not merge: (a) the evidence says overlap is ~zero right now, so merge logic is speculative work;
(b) the obvious cheaper key — PE + closing datetime + title — has a **real false-merge risk**, because
a single BAC routinely posts several near-identically-titled notices ("Procurement of Construction
Materials") for different barangay projects under one deadline. Including ABC in the key kills most of
that, but ABC only exists after the detail fetch, so **dedupe runs post-enrichment, not at listing time.**

Where dupe risk actually lives: **14% of sampled mPhilGEPS notices are already LGU-level**
(16 municipality / 4 province / 2 city / 1 barangay of 160). Those are PEs mid-migration — the
population that could plausibly double-post. Watch that slice, not the whole corpus.

## 4. mPhilGEPS sanity check — pagination is honest, tail has ~12 zombies

- `page=1` → `Page 1 of 215, showing 20 record(s) out of 4,300 total`
- `page=215` → `Page 215 of 215, showing 20 record(s)` — 215 × 20 = 4,300 exactly ✓
- `page=216`, `page=217` → no pagination line, no rows (clean empty, not an error)

Sampled pages 1 / 50 / 100 / 150 / 190 / 205 / 212 / 215 (160 rows): **0 already-closed notices**.
So no closing-date filter is needed for correctness on pages 1–214 — but **do** filter on read anyway,
because of this:

**Page 215 (lowest ids) is a junk drawer.** ids 2208–29654, publish dates 14-Jun-**2024** → 20-May-2026,
and **12 of 20 rows have an entirely blank closing date**. These are pre-migration residue that never
got a deadline. ~12 records ≈ **0.3%** of the corpus, all concentrated on the last page.

Handling: treat blank/unparseable closing date as its own state (`closing IS NULL`), exclude from any
"closes in N days" view, and don't let it silently become "closes today" or crash a date parse.

Ordering: `direction=Tenders.id+desc` gives id-descending, and publish date descends with it (page 1 =
09-Aug, page 212 = 23-Jun), so "page until last-seen id" is sound for incremental ingest on this side.

## 5. Drift — could not be re-measured, and here's why

Both totals were **flat over 25 minutes**: mPhilGEPS 4,300 → 4,300; legacy 17,845 → 17,845.

That is not evidence of a broken counter. Local clock was 2026-08-08 17:15 UTC = **Sunday 2026-08-09
01:15 AM Manila**. Zero inflow at 1 AM on a Sunday is the expected reading. The spike's ~30–40/hour was
measured during PH business hours and is not contradicted — it is simply untested here. **Re-measure on
a weekday 09:00–17:00 PHT.** (mPhilGEPS `max(id)` was 55594 both times, consistent with genuinely zero
new notices rather than a cached total.)

One real counter bug worth knowing: legacy's `"17,845 opportunities found"` label **undercounts**. The
pager's last offset is 17841, which renders rows numbered 17841–17860 → **≥17,860 actual rows**, a
15-row (0.08%) discrepancy. **Trust enumerated rows, not the label**, and don't use the label as a
loop-termination condition.

## 6. Adjacent findings (out of my scope — flagging, not pursuing)

- **mPhilGEPS has an unauthenticated server-side filtered search**: `POST /Indexes/viewMoreOpenTenders`
  with `_csrfToken` (scrape from the listing page) + `searchKeyword`, `searchAreaDel`,
  **`searchBudgetFrom`**, **`searchBudgetTo`**, `searchBussCat`, `searchClassification`, `searchModeProc`,
  `searchPublishDateFrom`, `searchPublishDateTo`, `searchSourceFund`, `searchApplicableProcRule`.
  Verified working. Relevant to whoever is designing the search tool layer — budget-range and
  area-of-delivery filtering exist server-side for free.
- **Legacy award notices are ungated**, with amounts in ₱ and per-award detail pages
  (`R4/R3_AwardNotice_AwardAbstract.html?RefID=…&LineItemID=…&OrgID=…&AwardID=…`). Only a rolling
  **100 most recent** are listed, so it isn't a full history — but it is live 2026 award data, which
  DECISIONS.md currently records as not existing for free anywhere (BetterGov stops at 2025). Worth a
  proper look.
- Also unauthenticated and unexplored: `https://data.philgeps.gov.ph/directory/buyerorg_vs.aspx`
  (buyer-org directory) and `https://open.philgeps.gov.ph/pbb/`.

## 7. What this means for the ingest

1. **Two scrapers, one table, a `source` column.** Legacy is the bigger and more LGU-relevant half.
   Skipping it means shipping a national-agency-only product.
2. Legacy needs the detail fetch for *any* clean field (the listing title is three fields glued with
   commas). Budget accordingly: ~893 POSTs + ~17.8K GETs vs mPhilGEPS's 215 GETs + 4.3K GETs.
3. Normalise on write: legacy `DD/MM/YYYY` vs mPhilGEPS `DD-Mon-YYYY`; legacy ABC is prefixed `PHP`.
4. `closing` must be nullable, and every read path must tolerate null.
5. Dedupe is a flag, not a merge — and it runs after enrichment.

**Untouched, as instructed:** `ingest.py`, `tenders.db`. Nothing committed.

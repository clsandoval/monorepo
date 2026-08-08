# PH Government RFP Finder — Search Design

**Status:** design approved 2026-08-08. **Ingest, merge, tagging, attachments, the `rfp` CLI and the
S7 eval oracle are all built and run** (overnight 2026-08-08). The search layer exists and has been
measured; see the corrections below for what the measurement said.
**Scope of this doc:** the *search* half only — plus the user journeys, because they're what the
search layer is answerable to. UI is someone else's job. Cron, alerts, and the daily feed are out of
scope but journey 2 depends on them; see "Deferred".
**Predecessor:** `research/ph-rfp-spike/DECISIONS.md` (spike findings; corrected 2026-08-08 pm).
**Night's operational record:** `apps/rfp/NIGHT-REPORT.md` — spend, decisions, what broke.

> ## ⚠️ Corrections — measured overnight 2026-08-08
>
> Five claims in this document were settled or falsified by running the thing. Originals are left in
> place and struck through, because what changed is as useful as what's true.
>
> 1. **Deferral #2 ("attached bid documents … highest-value next *spike*") is answered, and the
>    answer is mostly no.** mPhilGEPS attachments are fully public and are now ingested — 4,285
>    notices, 9,875 documents, 17.436 GB fetched, 554.8 M chars of text. **Legacy is behind a
>    supplier login** (`Tender/OrderBasketUI.aspx` → 302 → `log-in.aspx`; the abstract page's
>    document postback is HTML-commented out), so 81% of the corpus has no attachment path.
>    **And attachment text moved search recall by exactly zero notices in all ten measured
>    query-runs.** Attachments are an *eligibility* asset (0.12 → 2.40 special requirements per
>    notice), not a recall asset. Deferral #2 is now closed and replaced; see "Deferred".
> 2. **The eval was run and the shipped configuration scores 0.12 micro recall.** Not the tags, not
>    the attachments — three bugs in `rfp` itself cost the difference between 0.12 and 1.00 on the
>    measured slice. Fixing them is now deferral #1a, ahead of everything. See "Evaluation".
> 3. **OCR is decided: no, permanently.** Embedded rasters are 72–150 ppi against tesseract's 300
>    ppi floor, and the pages that *do* OCR carry only universal boilerplate. 34.8% of PDFs have no
>    text layer; 15.3% of doc-bearing notices are unreadable. Flag them, never spend on them.
> 4. **Award history is free, ungated, and enumerable by `awardID` alone** (~1.19M ids, ~50K
>    awards/month). It was deferral #5 as "free but deferred"; it is now cheap enough to promote,
>    and its first result **contradicts the targeting thesis** — see open question 2.
> 5. **`legacy.db`'s `bid_supplements` is wrong on 2,344 rows (13.19%).** `NULL` does not mean
>    "unknown", it means ">=1". Verified 90/90, zero counterexamples.

---

## What this is

A skill that, given one query, returns the government notices a specific contractor should bid on.
Not a v1 SQL search — the goal is the version that works, built so a cheap model can drive it
without re-deriving expensive judgment on every query.

The framing that produced this design: **cost per search is dominated by where reasoning lives.**
Reasoning at read time (whole corpus in the prompt) is paid per search and doesn't fit. Reasoning at
query time is cheap but only finds what the model thought to ask for. Reasoning at *ingest* time is
paid once per notice, ever. So push as much judgment as possible into stored columns and leave the
query-time model a mechanical job.

---

## Who this is for

Three user types with different journeys. The spec previously assumed one, which is wrong — the
supplier and the contractor want opposite things from the same corpus.

| | **contractor** (civil works, PCAB) | **supplier** (goods, SVP) | **consultant** |
|---|---|---|---|
| share of board | 25–50% | ~72% of mPhilGEPS | ~1% |
| scans for | ABC size, lead time, PCAB class | volume, low effort, geography | rare, so: anything at all |
| lead time needed | 14–29d band (21.9%) | 3–6d is fine (36.2%) | any |
| bid effort | days, full bid documents | hours, a quotation | weeks |
| wants per session | today's **3**, examined | today's **40**, triaged | every one that exists |

The supplier's journey is volume triage — 40 notices, 30 seconds each. The contractor's is one
careful decision on a ₱20M job. DECISIONS' "here are today's 3" is the contractor's journey and
under-serves the largest segment. **Result count is therefore profile-driven, not fixed.**

## User journeys

Numbered by build order, not importance. Only journey 0 is in scope for this doc.

**0. The spike journey — the only one in scope.** Carlos, in Claude Code: *"civil works in Cavite,
₱1–5M, I need a week to prepare"* → ranked notices with evidence. This is the cheapest possible test
of whether the tool layer works, and it needs no UI to run.

**1. First run — profile.** One input (*what do you build, where, what size jobs*), not a
twelve-question wizard. Success condition: the user recognizes their own business in the first ten
rows. Failure is silent and total — a bad profile makes every later journey wrong.

**2. The recurring scan — this is the product.** Not a search. Open it, see today's N with ABC and
days-left, decide bid/skip/maybe per row. **59.4% of the corpus closes within 6 days**, so the
cadence must be near-daily; a weekly checker structurally misses most of the market, which is the
entire reason this exists.

**3. Refinement.** *"Only Cavite and Laguna." "Nothing under ₱500K." "Show me multi-lot notices where
I could take just one lot."* That last one is why agentic tools earn their place over a filter UI —
it isn't expressible as a checkbox, and notice `54278` (₱360K made of six ₱60K lots) is invisible to
every competitor.

**4. Can I actually win this?** The journey that decides whether anyone pays. Needs eligibility
beyond the universal four, closing date measured against the user's document-assembly time, who won
similar jobs and at what price (award history — deferred, but free), and the attachments (deferred,
and where the real scope lives).

**5. Tight-deadline triage.** 23.2% close within 48 hours. *"Anything I can still submit for by
Tuesday?"* This is why `min_days_to_close` is a ranking signal and not a filter — sometimes the
answer is "yes, if you drop everything today."

**6. Pipeline planning.** APPs browsable to 2027: *"what is this LGU planning to buy next year?"*
Quarterly cadence, months of lead time, nobody productizes it. A different surface from 2–5.

---

## Locked decisions

| # | Decision | Why |
|---|---|---|
| S1 | **Approach B+C: agentic tools over SQLite + FTS5, plus one ingest-time tagging pass.** Not whole-corpus-in-prompt. | Corpus is ~1.55M tokens of listing rows alone — over Luna's 1M window. B's cost is *invariant* to corpus size (~8K tokens/search regardless); C fixes B's recall hole. |
| S2 | **Raw read-only SQL is the primary tool.** Not a curated flag set. | Models write good SQL. Every flag we'd invent is a worse `WHERE` clause, and a flag surface guarantees a v2 that adds the flag someone actually needed. |
| S3 | **Profile is a prior, not a filter** (option (c)). | Out-of-profile notices get demoted and annotated, never hidden. A hard filter that silently drops a ₱40M job you could joint-venture on is a failure you'd never see. |
| S4 | **FTS5 is in.** This reverses DECISIONS #5's rejection. | It was rejected as a *prefilter* saving ~₱0.09 against a 300K corpus. At 1.55M tokens it isn't an optimization, it's the only way search happens at all. Different role, different verdict. |
| S5 | **Still no vector DB, no embeddings.** | Unchanged, and the pilot strengthened it: the discriminators are exact (ABC band, days-to-close, province, mode). Embeddings blur exactly those — ₱245,000 and ₱2,450,000 are near-identical vectors. The one genuinely fuzzy axis is handled by C, which reads the notice instead of guessing at its title. |
| S6 | **Tags are terse structured fields, never prose.** | Measured: output tokens cost 1.4–1.6× input on the tagging pass. Terseness is the cost control, not input stripping. |
| S7 | **Approach A survives only as an eval oracle on a slice.** | ~300 notices (one work_type × one province) fully in-context with an expensive model = ground truth to measure B+C's recall against. Without an oracle, search gets tuned by vibes. |

**Explicitly out of scope:** the UI, cron/scheduling, email alerts, the daily feed, and Annual
Procurement Plans. ~~award history, and attached bid documents~~ — **both were built overnight**:
attachments are ingested for mPhilGEPS (`attachments.py`, `docs.db`) and the award ASMX layer is
mapped and sampled (`awards.py`, `awards.db`). Each remaining item is a separate piece of work; see
"Deferred, in priority order".

---

## Measured facts this design rests on

All measured 2026-08-08 unless noted. Numbers that contradict `DECISIONS.md` are corrected there too.

- **Corpus: 22,068 enriched open notices** = 4,288 mPhilGEPS + 17,780 legacy PhilGEPS 1.5, carrying
  **₱207.1B** of open contract value. (Pager slots suggested 17,860 on legacy; ~80 are genuine
  cross-page duplicates, so enumerate, don't trust counts — see "Operational correctness".)
- **The two systems are different markets, not more of the same.** Legacy is 73% public bidding and
  36% Civil Works with a ₱877K median ABC; mPhilGEPS is 58% SVP with a ₱2.0M median. **Legacy is
  where the full-bid civil works lives** — which matters for the contractor-vs-supplier question,
  because the segment with real money is mostly in the 81% of the corpus nobody else scrapes.
- **Value is brutally concentrated.** Under ₱1M: 49.5% of notices, **1.8%** of value. ₱15M+: 9.7% of
  notices, **79.6%** of value (₱164.8B). The top 3.3% alone is 60% of every peso on the board.
- **Demand clusters thinly.** category × size-band × province yields 6,837 archetypes; **60% have
  exactly one open notice nationally.** The largest single cell (General Merchandise / micro / Metro
  Manila, 287 open) sees ~25–30 new notices a day; the median cell sees one every ten days. A
  narrowly-specified profile opens to an empty feed most days, which is a churn mechanism, not a
  search problem — the answer is deliberate profile widening (adjacent provinces, adjacent
  categories, multi-lot decomposition), stated openly to the user.
- **Geography is dispersed.** 169 locations, Metro Manila only 9.9%, 43 provinces needed to reach 80%.
  A Manila-focused product covers a tenth of the market.
- **~1.55M tokens** for listing rows alone (22,145 × ~70; PH government titles and agency names are
  long). Over Luna's 1M context.
- **The two systems are disjoint by construction.** Agencies are cut over in batches — PS Advisory
  2026-19 ended Executive-branch posting on legacy 31 Jul 2026. A given procuring entity posts to
  exactly one system at a time. mPhilGEPS skews national (93/160 sampled), legacy skews LGU (73/100).
  Zero cross-system duplicates found. Duplicates can only appear during a PE's cutover window.
- **ABC needs no LLM.** It's a labeled field on the detail page: `<label>Approved Budget of the
  Contract:</label>245,000.00`. Regex, ₱0. DECISIONS budgeted ~₱240/night to extract it with a model.
- **Descriptions are ~2,086 chars and mostly boilerplate.** The real scope often lives in the line
  items (`COLLATERALS - CUSTOMIZED T-SHIRT, STICKER, TUMBLER`) or in attachments, not the description.
  **Quantified overnight:** 822 mPhilGEPS notices and **5,426 legacy notices** have a
  boilerplate-only description — what survives stripping, plus line items, is under 300 chars. The
  legacy population is 6.6× larger and is the one with no attachment path.

### Attachments — measured over the full mPhilGEPS ingest, 2026-08-08 overnight

- **mPhilGEPS attachments are fully public.** 963/963 HEAD requests returned 200 with no cookie, no
  session, no referer. **The one trap:** the document index at `/Tenders/tender_doc_view/{id}/{id}`
  returns, without an `X-Requested-With: XMLHttpRequest` header, a constant 21,484-byte shell reading
  *"Your session has been expired, please login in again to continue."* — byte-identical for every
  notice id. That is CakePHP layout boilerplate, **not** an auth check. With the header, the full
  document table appears. Files then sit on plain Apache static paths with `ETag` and
  `Accept-Ranges: bytes`, so the fetcher is resumable and conditional.
- **Legacy attachments are hard-gated and were not defeated.** The download funnel terminates at
  `Tender/OrderBasketUI.aspx` → 302 → `/GEPSNONPILOT/log-in.aspx`; the abstract page's "Associated
  Components" postback is HTML-commented out and replaced with an `alert()`. Forcing it anonymously
  is a server-side no-op (200, byte-identical page). Across ~100 unauthenticated requests including
  four forced download postbacks, **every body began `"<SCRIPT"` — never `%PDF`, never `PK`.**
  Nine guessed handler names all 302 to `ErrorPage.aspx`. A registered supplier account is the only
  route, which is a legal/product decision, not an engineering one.
- **Ingest result:** 4,285 of 4,288 mPhilGEPS notices, 9,875 document rows (532 archive members),
  8,337 distinct blobs, **17.436 GB fetched**, 554.8 M chars extracted over 294,173 pages. 15.2% of
  fetches were bytes already stored. Formats: 95%+ PDF, then docx/zip/xlsx/jpg; **zero rar**.
- **Text yield is bimodal.** Median 154,367 extractable chars per doc-bearing notice (≈38K tokens),
  mean 134,065, p90 275,379 — **and p10 = 0**. Whole-attachment-in-prompt does not scale; section
  extraction does. *(Corrects a 30-notice recon sample that projected a 6,123-char median. The mean
  was right, the median was a small-sample artefact.)*
- **OCR: no, and this is a measurement not a punt.** 34.8% of PDFs (2,760/7,935) have no text layer;
  12.1% of pages are image-only; **655 of 4,285 notices (15.3%) have no readable file at all.**
  Embedded rasters are 72–150 ppi against tesseract's 300 ppi floor — `pdftoppm -r 300` cannot help,
  it upsamples the embedded JPEG. A real DPWH photocopy rendered at 300 dpi OCR'd "ITEM 804(1)b
  EMBANKMENT" as `PEM eat} EMBANAMENT`. And the pages that *do* OCR cleanly carry only
  `PROPOSED FLOOR PLAN` / `ITEM 900 REINFORCED CONCRETE` — words on every project in the country,
  which BM25 scores ~0 by design. Store `scan_pages`/`text_pages` and annotate
  `scope in attachment, not machine-readable`. If ever revisited, the escalation is a vision model
  on the first 2 pages of the bounded `text_pages = 0` subset, not tesseract.
- **What attachments actually bought — eligibility, not recall.** Over 424 notices holding both a
  base and a doc tag: eligibility items/notice **0.12 → 2.40**, scope 79 → 125 chars, and 64% of
  doc-tier keywords (3,486/5,409) appear nowhere in the notice's own text (`tetrapod`,
  `geotextile tube`, `MSE retaining wall`). work_type agreement 88%, needs_pcab 90%. That is
  **journey 4**, not journeys 0/2. Worked example: notice `50936`, ABC ₱1.81B, description
  `Please see attached file for reference.` → *1,709 sales assistants for Pag-IBIG nationwide, two
  years*, wage floor ₱1,276.70/day, eligibility `PhilGEPS Platinum · SLCC · NFCC`.

### Tagging — the full pass, measured

- **₱318.93 total** of a ₱1,000 cap: base tier ₱250.48 over 22,068 notices, doc tier ₱68.45 over
  619. 2,829 batches, **0 failed calls**, 12.72 M in / 2.46 M out. Output is 26% of tokens and
  **51% of cost** — S6 confirmed.
- **₱681 left unspent deliberately.** Attachment availability, not budget, was the binding
  constraint and it is exhausted: of 822 boilerplate-only mPhilGEPS notices, 619 were doc-tagged and
  203 have no readable attachment. Legacy's 5,426 have no attachment path at all.
- **12 notices are untagged** — ids 2208–2239, the known permanent-HTTP-500 zombies. Not a coverage
  bug; they have no body to read.
- **A pilot bug that shipped silently:** `keywords()` did `" ".join(kw)`, which joins *characters*
  when the model returns a string instead of an array — `feasibility study` →
  `f e a s i b l t y u d h g w n r v o c`. **173 of 337 pilot rows (51%) were destroyed and the
  column looked populated.** Fixed with three asserts; post-fix count over 22,068 rows: **0**.
- **`other` is down to 697 notices (3.2%)** from the pilot's 10%. The residue clusters into
  apparel/textiles and power/energy — deliberately *not* added, because it costs ₱250 to re-tag
  22,068 notices to reclassify 3%.

### Award history — free, ungated, enumerable

- The ASMX layer answers **plain GET with query params, but only with a JSON content-type header**;
  without it every call returns a generic error, which is what makes it look gated.
  `AwardAbstract_GetAwardedSupplier` **ignores `refID`** and keys off `awardID` alone, and arbitrary
  awardIDs resolve — so the whole history (~1.19M ids, Aug 2024 → Jul 2026, ~50K awards/month) is
  enumerable with no listing and no session. Winner name and full street address included.
- **Win ratio, n=277: median 99.0% of ABC, 21% land at exactly 100.0%, none above.**
- **Outsider win rate 30/88 = 34% overall — but 0/5 above ₱5M.** By band: <₱100K 28% (n=18) ·
  ₱100K–1M 38% (n=40) · ₱1M–5M 40% (n=25) · ₱5M+ **0%** (n=5). n=5 concludes nothing, but the
  direction says small goods procurement is open to remote suppliers while big civil works is local.
  See open question 2.
- **Two quotable-wrong-number traps, both paid for.** `BidderListCount` returned 1 on all 10 awards
  sampled — it counts award *recipients*, not bidders; do not publish "100% single-bidder". And
  repeat-winner concentration naively reads 67% because **one procurement is split across one award
  row per line item**; collapsed to (officer, title, date) the real median top-firm share is
  **33% — dispersed**.
- The two list endpoints (`AwardNoticeList_GetList`, `…Auditor_GetList`) accept unauthenticated
  calls and return `TotalCount: 0, Value: []` for everything. They are user-scoped and **fail
  silently rather than 403ing**. ID enumeration is strictly better; don't spend time there.
- **Lead time, measured over all 4,300 rather than a 300-notice sample:** ≤2d 23.2% · 3–6d 36.2% ·
  7–13d 16.3% · 14–29d 21.9% · 30d+ 2.2% · no date 0.3%. **≤6 days = 59.4%**, so DECISIONS' ~60%
  holds — but the 7–13 day band is *2× the sampled estimate* (702 notices, not ~340). The genuinely
  actionable pool is bigger than the spike assumed, which makes `min_days_to_close` a more useful
  profile knob than it looked.
- **Tagging pass costs ₱262–279 for the full corpus**, measured over two 200-notice pilots
  (₱2.35 and ₱2.52). ~425 input / ~100 output tokens per notice.
- **Software work is <1% of the board.** 3 of 337 sampled, and only 1 of the 3 was actual
  development (a ₱2M multi-year MIS contract); the others were Zoom and Power BI licence renewals.
  Extrapolates to ~200 software notices open, maybe 60–70 real dev contracts. Volume is civil works
  and supply.

---

## Architecture

```
ingest.py        mPhilGEPS listing → detail       → tenders.db     [built]
ingest_legacy.py legacy 1.5 listing → detail      → legacy.db      [built]
merge.py         both + source + dupe_key         → corpus.db      [built, 22,080 notices]
tag.py           Luna, once per notice            → tags.db        [built, ₱318.93 spent]
attachments.py   discover/download/extract        → docs.db+blobs/ [built, 17.4 GB, mPhilGEPS only]
awards.py        ASMX harvest + the two metrics   → awards.db      [built, n=277 sampled]
rfp search/sql/show/facets    the model's tools                   [built, 38/38 selfchecks]
eval_recall.py   the S7 oracle harness                             [built, and see "Evaluation"]
audit_ops.py / verify_audit.py   ops + adversarial asserts         [built, 9/14 and 10/10]
SKILL.md         how the model drives rfp                          [built]
profile.md       the prior                                         [built]
```

`merge` and `tag` stayed separate scripts rather than `rfp` subcommands: they are batch jobs with
their own spend ledger and locking, and nothing in the query path calls them.

**`rfp build --force` is required for any new tag to reach search** — `work_type`, `scope` and
`keywords` are FTS5-indexed columns, so tags written after a build are invisible until rebuilt.

**Why two DBs then a merge:** the two ingests were built by parallel agents and neither should block
on the other. After `merge`, `corpus.db` is the single read surface and the source DBs are inputs.

### Data flow for one search

1. Model reads `profile.md` (small, ~200 tokens).
2. `rfp facets <query>` → a ~300-token histogram over 22,000 notices: counts by work_type, province,
   mode, ABC band. This is what replaces "the model can see everything" in approach A — orientation
   without scanning.
3. Model issues 10–20 `rfp search` / `rfp sql` queries, expanding terms and varying filters.
4. `rfp show <id>` on the ~10 survivors for full scope text.
5. Model returns ranked notices, each with its evidence. Never prose paragraphs.

Total ~8K tokens ≈ **₱0.02/search**, independent of corpus size.

---

## The tool surface

### `rfp sql "<select>"`

Read-only SQL over `corpus.db`, opened `file:corpus.db?mode=ro` so a model writing `delete from
corpus` gets an error rather than an incident. FTS5 available.

```sql
select id, title, abc, closing_at from corpus
where corpus match 'software OR ICT OR "information system"'
  and abc between 1000000 and 5000000
  and closing_at > date('now','+7 days')
order by rank limit 40
```

This one subcommand covers every query we can anticipate and the ones we can't.

### `rfp search <query> [filters]`

Same engine, but applies the profile prior and formats for token economy:

```
[55912] ₱2.4M · closes 11d · Cavite · SVP · fit 0.81
  Supply and Delivery of Information System for Provincial Health Office
  PROVINCE OF CAVITE · work_type=software · lots 6×₱400K
  …custom **software** development and 12-month **support**…
```

~45 tokens per hit, so 40 hits ≈ 1.8K. **That budget is load-bearing** — verbose hits drift the
economics back toward approach A.

### `rfp show <id>`

Full scope text, line items with UNSPSC codes, eligibility tags, attached-document list. Called ~10
times per search, not 40.

### `rfp facets <query>`

Counts by work_type / province / mode / ABC band for a query. Orientation, cheap.

---

## Ranking

`score = bm25(fts) × profile_fit`, and every hit carries why it scored that way.

BM25 does useful work here for free: every notice contains "Republic Act 12009" and
"non-discretionary pass/fail", so those terms score ~0, while "GIS", "backhoe", "centrifuge"
discriminate. That is the cheap approximation of semantic relevance, without embeddings.

`profile_fit` is a multiplier in roughly [0.2, 1.0], never zero:

| signal | effect |
|---|---|
| work_type in profile categories | strong boost |
| ABC inside capacity band | boost; outside → demote and annotate `stretch: ₱40M vs your ₱5M band` |
| province in profile regions, or adjacent | boost |
| PCAB class satisfied | boost; unsatisfied → demote and annotate |
| days-to-close below profile minimum | demote (a 2-day window you can't assemble docs for) |
| multi-lot with a lot inside your band | boost even if the notice total is far outside it |

That last row matters more than it looks: notice `54278` is a ₱360K job made of six ₱60K lots. A
bidder filtering ABC ≤ ₱100K should see it, and under a total-only column never would.

### `profile.md`

```yaml
pcab: C          # or null
categories: [civil_works, repair_maintenance]
regions: [NCR, Cavite, Laguna]
abc_band: [200000, 5000000]
min_days_to_close: 5   # days needed to assemble documents; ranking signal, not a filter
results: 10            # 3 for a contractor examining, 40 for a supplier triaging
never: [security_janitorial, food_catering]
```

Plain YAML in a markdown file, hand-edited. No profile builder, no wizard.

`results` exists because the contractor and supplier journeys diverge on exactly this number, and
guessing one value for both under-serves whichever user you guessed against.

---

## The tag schema (approach C)

One Luna call per ~10 notices at ingest, output stored as columns:

| field | shape |
|---|---|
| `work_type` | one of 20 enums — what kind of *firm* bids, not the official category |
| `needs_pcab` | true / false / null |
| `eligibility` | ≤3 short strings, **excluding** the universal four (Mayor's Permit, PhilGEPS registration, BIR 2303, Omnibus Sworn Statement) — those are on every notice and carry no signal |
| `scope` | one sentence, ≤140 chars, what is actually being bought |
| `keywords` | 3–8 plain space-separated words for FTS5 |

Two things learned in the pilot, both now enforced in code rather than in the prompt:

- **Keywords must be plain words.** The model emitted `fire_truck`, `truck_repair` — an underscored
  token matches nothing a human types into full-text search. Normalized in `keywords()`, which also
  strips the work_type enum the model likes to echo as keyword #1. Code always wins; prompts only
  mostly win.
- **The enum needed a vocabulary pass.** 10% of the first pilot landed in `other` — freight and
  handling charges, tractor land-prep, BPO contracts, "various supplies" grab-bags. Added
  `logistics_freight`, `agriculture`, `mixed_supplies`, `outsourced_services`.

Boilerplate stripping is document-frequency based (drop lines appearing in >2% of notices) rather
than a hand-maintained regex list. It only removes ~18% of characters, because the standard clauses
embed agency names and peso amounts so identical clauses hash differently. Phrase shingling would
catch most of the rest and save ~₱100 once — deliberately not written.

---

## Evaluation

The oracle is the point; without it, recall is unmeasurable and search gets tuned by feel.

1. ~~Pick a slice small enough to fit in context: one work_type × one province, ~300 notices.~~
   **Corrected: slice by geography ALONE.** A `work_type × province` slice makes tag errors
   invisible — a mistagged notice falls out of the slice instead of registering as a miss, and the
   eval then "proves" that tags help. Slice used: **all 489 `CAVITE` notices** (412 legacy, 77
   mPhilGEPS).
2. Read the whole slice end to end. That is ground truth. **5 queries, 91 labels.** All 91 are
   legacy notices — not a sampling artefact, it is what the Cavite board is.
3. Run B+C on the same query, scoped to the same slice, in both `natural` and `expanded` phrasing.
4. Report **recall against the oracle**, and for each miss, which mechanism failed.

Harness: `eval_recall.py` (`selfcheck` / no arg / `depth`), oracle `eval_gt_cavite.json`, full
write-up `apps/rfp/NOTES-eval.md`.

### The result, run 2026-08-08 overnight

| config | micro | macro |
|---|---|---|
| **natural wording, `profile.md` as shipped (`results: 3`)** | **11/91 = 0.12** | 0.15 |
| natural, n=40 | 48/91 = 0.53 | 0.60 |
| expanded, n=40 | 62/91 = 0.68 | 0.73 |
| expanded, n=40, `--province-strict` | 86/91 = 0.95 | 0.96 |
| expanded, n=40, `--province-strict --no-profile` | **91/91 = 1.00** | 1.00 |

**The shipped configuration finds 12% of what a bidder should see.** Every one of the 91 is
reachable from title/description/line-items text alone — nothing needed attachments or tags to be
*findable*. Retrieval is not the problem. Three mechanisms are, in order of damage:

1. **FTS5 reads a bare multi-word query as an implicit AND.** `vehicle spare parts repair` matches
   **0 of 489**; `vehicle` alone matches 40 (this corpus writes "Parts and Materials"). `relax()`
   already rewrites to an OR of quoted barewords but is wired only to `sqlite3.OperationalError` — a
   *syntax* error. A syntactically valid query that ANDs itself to zero rows never triggers it.
   **Fix: fall back to `relax(q)` on zero/near-zero rows.** One condition.
2. **`--province X` spends most of the result budget outside X.** Keeping null-location notices is
   correct — dropping them is the omission bug — but they compete for the same 40 slots at fit 0.85
   and BM25 doesn't know they're in the wrong province. Measured: **only 82 of 200 returned rows
   were in Cavite; 113 of the other 118 had no stated location at all.** Cost: **~24 recall
   points.** Fix is a cap on null-location slots, not a drop.
3. **Multiplicative `profile_fit` collapses to the 0.20 floor and buries exact matches.** Notice
   `13171857` (heavy-equipment parts, ₱188K, closes in 1 day) scores `below band` (6% under) ×
   `tight: 1d vs 5d` × `off-category` = **0.20** — same fit as something in the `never` list. Three
   mild demotions multiply into a hard exclusion, which is exactly what **S3 forbids**. Needs a
   per-signal floor, a cap on independent demotions, or an `abc_band` tolerance of ~15%.

Also measured: **orthography splits the vocabulary and nothing bridges it.** `streetlight` matches
21 slice notices, `"street light"` matches 5, union 26, **zero overlap**. Porter stems
`streetlights → streetlight` but cannot join two tokens into one.

### Channel ablation — what the expensive work bought

n=200, no profile, so the only thing varying is which text channels search may use:

| channel set | natural | expanded |
|---|---|---|
| title/description/items only | 49/91 | 91/91 |
| + Luna tag scope/keywords | **53/91** | 91/91 |
| + attachment text | 49/91 | 91/91 |
| both | 53/91 | 91/91 |

**Attachment text moved recall by exactly zero, in all ten query-runs** — structurally, not by bad
tuning: 0 of the 91 ground-truth notices have attachment text and only 74 of 489 slice notices do,
because `documents` holds **0 rows for `source='legacy'`** and Cavite is 412/489 legacy. It is worse
than neutral at the top of the list: on the shipped default for Q5, three of five returned rows are
out-of-province notices promoted by an mPhilGEPS document matching "Spare Part". **Attachment
relevance without a province gate is a precision leak that becomes a recall leak once the cut is 3
or 40 rows wide.**

**Luna tags moved recall +4 notices (+4.4pp) on natural queries and +0 on expanded ones.** The four
rescues are all the same shape — the tag supplies a synonym the title never used (`CANAL LINING` →
*drainage*; `SOLAR STREET LIGHTS` → *streetlight* as one word). Real, and it is the channel that
survives on legacy where attachments do not, at ₱250 already spent. But it is a synonym patch on a
query-formulation problem.

**Verdict for the roadmap: the next recall point is not in a new data channel.** It is in the three
`rfp` fixes above, worth roughly 0.12 → 1.00 on the queries measured. Spend there before spending on
documents.

*Caveats so the number is not over-read:* one province, five queries, 91 labels; the oracle is one
exhaustive human read, not a second model's. Cavite is legacy- and LGU-heavy, so a Metro-Manila or
mPhilGEPS-heavy slice would have far better attachment coverage. **The finding is "attachments
cannot help on legacy", not "attachments never help".** Precision was not scored and is visibly poor
at n=200 by design.

The metric that matters is recall, not precision. A contractor who sees three good notices and one
mediocre one is fine; one who never sees the ₱2M job they'd have won is not.

---

## Operational correctness

**The migration watch.** Assert daily on both counts: if legacy drops by thousands and mPhilGEPS
doesn't rise correspondingly, a batch cutover moved procuring entities between systems and notices
are being missed. This is the check that would have saved the scraper graveyard in `competitors.md`
— `chloebellee/philgeps-scraper` failed 44 of 44 scheduled runs on a missing `permissions:
contents: write` line and threw away two months of data, because nothing was watching and no user
existed to complain. Those projects died silently, not loudly.

**Dedupe — the key can flag, it cannot decide.** `source` column plus
`dupe_key = sha1(norm(PE) | closing | norm(title)[:80] | abc)`, run *post*-enrichment since ABC only
exists after the detail fetch.

Adding ABC to the key was supposed to prevent false merges. **Measured: it doesn't.** 112 rows
collide inside legacy alone, and the worst case is unanswerable by any field-based key — nine
genuinely distinct notices from MUNICIPALITY OF LIBON, all titled "Purchase of Various Goods", all
₱199,990, all closing 2026-08-11 10:00, differing only by refID. A BAC posting N near-identical
notices under one deadline defeats every content hash you can build. So collisions are **review-only,
never auto-merged**, and the ~8% of rows with a null `location` can't be disambiguated geographically
either. Treat `dupe_key` as a candidate generator, not a decision.

**Nulls are real.** `closing` is nullable: mPhilGEPS page 215 is a junk drawer with notices published
Jun-2024 and 12 rows with blank closing dates, and 12 notices serve permanent HTTP 500s. Every read
path tolerates null; `fetch_errors` caps retries at 3 so broken notices don't poison the queue nightly.

**Never trust a site's own total** as a termination condition — but **"terminate when rows run out"
is also wrong on legacy, and worse.** Out-of-range pager offsets **re-serve page 1** rather than an
empty page, so that loop never terminates; it silently re-collects page 1 forever. The only honest
bound is the pager dropdown's own offset list (893 entries). Both the label and the row-exhaustion
heuristic fail, in opposite directions.

**Concurrent ASP.NET pagination corrupts silently.** Legacy POSTs share one `__VIEWSTATE`, and under
concurrency the server occasionally answers a *different offset than requested* — 20 valid-looking
rows from the wrong page. The first sweep collected 640 rows of which only 460 were new. The fix is
to verify the rendered row number matches the requested offset and retry on mismatch; with
verification the second sweep missed nothing. Anything that looks like data but came from the wrong
page is the worst failure class here, because every row is individually plausible.

### Data hazards the search layer must handle

Measured over the full 4,300-notice mPhilGEPS snapshot. Each of these silently returns wrong results
if ignored — they fail by omission, which is the failure mode no user reports.

- **`location` is comma-multi-valued on 71 rows** (`'Batangas,Laguna,Quezon,Rizal'`), 143 distinct
  values, top is Metro Manila at 418. A region filter must split on comma, never compare for
  equality — `location = 'Laguna'` misses every multi-province notice.
- **`location` is null on 12.2%** (523 rows), verified genuinely empty on the page, not a parse
  failure. So geography is missing for 1 in 8 mPhilGEPS notices. **Legacy is the same, not better:**
  12.1% null (2,144 of 17,680) — measured, correcting an earlier assumption here that legacy's
  `Area of Delivery` would improve coverage. What it does improve is *shape*: 112 clean single
  province values (`Metro Manila` 1,640, `Batangas` 603, `Cebu` 530) with only 30 comma-joined rows,
  against mPhilGEPS's 143 values and 71 comma-joined. So geographic ranking needs the same
  null-tolerant handling on both sides; it's just cheaper to parse on legacy.
- **`abc` is null on 27 rows, some published as recently as 2026-08-08.** Not an old-template
  artifact; some live notices simply omit ABC. `where abc <= X` silently drops them. Per S3, null-ABC
  notices **surface with an `abc: not stated` marker and a demotion**, never disappear.
- **`items` retains its header row**, so every notice contains the literal `Lot Description`,
  `Unit of Measure`, `UNSPSC`. Strip when building the FTS index or those words match every query.
- **`mode_norm` collapses casing but not legal modes.** `public bidding` (10) and `international
  competitive bidding - others` (10) are distinct strings from the 2,992-row competitive bidding
  bucket and must stay distinct — they're different procurement rules, not typos.
- **12 zombie notices** (ids 2208–2239) serve permanent HTTP 500s and retire at `fetch_errors = 3`.
  They carry no closing date, so they'd sort first under a naive `order by closing_at`. They are
  also the entire `22,080 corpus vs 22,068 tagged` delta — a stated tolerance, not a coverage bug,
  and `audit_ops.py` should whitelist them rather than have the number chased.
- **Multi-contract ITBs — 219 legacy notices name more than one distinct contract.** Notice
  `13130808` is titled contract `26D00050` (Carmona–Biñan Diversion Road) but its description is one
  DPWH regional Invitation to Bid covering five contracts, and the *first* block in it is a
  different project in Quezon Province. So FTS5 over `description` returns these notices for terms
  belonging to a *sibling* contract — wrong province, wrong scope, individually plausible. ~1.2% of
  the legacy corpus, ~0.4% cost in scope accuracy. The tag columns are cleaner here because the
  model anchors on the title (4 of 5 sampled kept the right contract), which argues for ranking
  `scope`/`keywords` above `description` — `FTS_WEIGHTS` already does.
- **`corpus.db` is the query surface; `docs.db` is ATTACHed read-only.** Attachment text is ~555 M
  chars and must never land in the hot DB the model hits on every search. Its FTS5 is
  external-content with `porter unicode61` and no `tokenchars`.
- **Attachment matches must be province-gated before they rank.** Measured in the eval: unqualified
  attachment relevance promoted three out-of-province notices into a five-row result set. A signal
  that only exists on 19% of the corpus will systematically outrank the 81% that has no attachments
  at all if it is scored as if the channels were comparable.

---

## Testing

Each script keeps one runnable `selfcheck()` with `assert`s, no framework:

- `ingest.py test` — listing and detail parsers against saved HTML shapes, **including the
  empty-field case**. That case is the whole reason it exists: the original parser took "the next
  line" when a value was empty, so a missing field silently became the next field's *label*.
  `location` was corrupt on 13% of notices and the capture rate read 100%. A parser test that only
  checks populated fields would have passed.
- `tag.py test` — boilerplate stripping, item-header removal, keyword normalization. The
  keyword-normalization asserts exist because the pilot's `" ".join(kw)` shredded 51% of rows into
  single characters while the column still looked populated.
- `rfp test` — 38 checks, including that `sql` refuses a write and that `search` output stays inside
  its token budget.

Built overnight, same rule, no framework:

- `extract_lib.py test` — builds its own fixtures including a hand-written image-only PDF, and
  asserts the two traps that make extraction lie: `pdftotext` returns **rc=0 and 0 characters** on a
  fully scanned PDF (so the signal is the char count, never the exit code), and it emits a
  **trailing form feed** so an N-page document splits into N+1 chunks.
- `attachments.py test`, `merge.py test` (102 asserts), `awards.py test`, `eval_recall.py selfcheck`,
  `docs_census.py selfcheck`, `recon_docs.py selfcheck`, `legacy_docs_probe.py --selfcheck`
  (24 asserts, including the landing classifier that distinguishes `ErrorPage.aspx` from
  `log-in.aspx` — i.e. app fault from auth gate).
- `verify_audit.py` — 10 adversarial checks that re-derive the document/corpus claims independently
  rather than trusting the ingest's own counters (cross-contamination, lossless merge cell-by-cell,
  FTS index integrity, "silent emptiness"). 10/10.
- `audit_ops.py` — spend arithmetic, tag coverage, disk runway, git hygiene. **Currently 9/14, and
  the failures are the findings**: 17.8 days of disk runway with a silent cap trip, and the
  delta-12 zombie notices. It is meant to stay red until those are fixed.

---

## Deferred, in priority order

**Rewritten 2026-08-08 overnight.** The old #2 (attached bid documents, "highest-value next spike")
is closed — it was run, and the measurement demoted it. The new #1 didn't exist in the old list
because we hadn't yet measured our own search.

1. **Fix `rfp`. Three bugs, worth 0.12 → 1.00 on the measured slice.** The zero-result `relax()`
   fallback, the null-location crowding cap, and a per-signal floor on `profile_fit`. This is now
   the cheapest recall on the board by a wide margin and it is strictly ahead of any new data
   channel. Detail in "Evaluation".
2. **Make the disk cap trip loudly.** `attachments.py` currently hits its cap, sets `skipped_cap`,
   `break`s, and **exits 0**. Runway is **17.8 days at the measured +0.72 GB/day**. This is the
   precise shape of the failure that killed `chloebellee/philgeps-scraper`: a job that stops working
   and keeps reporting success. Cheap, and it protects everything else.
3. **Alerts — still the highest-risk *product* deferral.** Journey 2 is the product, and we are
   shipping without alerts, betting on the user opening the tool daily by their own discipline
   against a corpus where 59.4% closes within 6 days. A user who checks weekly gets a fraction of
   the value and concludes the product doesn't work. First Circle's dead Project Finder *had* daily
   and weekly keyword email alerts — it died of organizational misalignment inside a lender, not
   because alerts were unnecessary, so its death is not evidence we can skip them.
4. **Legacy metadata harvest — measured, costed, not run.**
   `PrintableBidNoticeAbstractUI.aspx?refid={id}` (200 on 90/90) is a strict field *superset* of the
   page `ingest_legacy.py` currently uses at ~half the bytes (median 25.4 KB vs ~52 KB), and it is
   the only template exposing `lblDisplayAssocComp`, the attached-document count that `legacy.db`
   lacks entirely — **~29,300 documents, mean 1.65/notice, and 0% of notices have zero.** Switching
   also fixes the `bid_supplements` NULL bug for free. Cost: **~24,142 GETs, 661 MB, ~2.0 h at 4
   workers, <20 MB stored.** Add `assoc_components INTEGER` and a supplements child table
   `(refID, supp_id, title, type, published)`.
   Two things it does *not* buy, so nobody re-discovers them: `corr_details` / the supplement list
   is not a general document index (it populates only for the ~13% with a supplement), and
   `SplashBidSupplementViewUI.aspx` — the only page that leaks document *filenames*, inside an HTML
   comment — renders for just **7 of 24 supplements tried (29%)**; the other 17 302 to
   `ErrorPage.aspx` on both the GET and the postback route. That is a PhilGEPS app fault, not an
   auth wall (a gate 302s to `log-in.aspx` instead), so filename coverage is structurally capped no
   matter how politely you crawl. n=24; re-measure before trusting 29%.
5. **Award history at scale — promoted, because it turned out to be nearly free.** Win ratios,
   repeat-winner concentration by firm, UNSPSC mix and volume-over-time are computable *now* from
   `awardID` alone: a 3,000-award sample is ~9,000 requests, under an hour at polite concurrency.
   Outsider win rate needs the buyer's province, hence the real `refID`, hence the rolling listing
   at ~100/day — fine for a monthly statistic. This is journey 4's missing half **and** the only
   evidence we have about who actually wins; its first result already contradicts our targeting
   (open question 2).
6. **LGU registry.** Normalized ~1,600 LGUs — canonical names, aliases, province/region hierarchy,
   PSGC codes, district engineering offices — joined to every notice. `competitors.md` argues this is
   the most defensible gap on the board, and that the moat is normalization labour, not code: the only
   product that scraped LGU websites outside PhilGEPS (First Circle) is dead with no replacement, and
   the only LGU-sliced dataset ever published (OCDex) froze in 2019. It's also the substrate for geo
   ranking, which matters most on the 81% of the corpus that is LGU work — **and the eval just showed
   geography is where the recall is**, so this is better-supported than it was this morning.
7. **Annual Procurement Plans**, browsable to 2027 — journey 6, months of lead time before an ITB
   exists.
8. Cron, the daily feed, and the UI.

**Closed, not deferred — ~~2. Attached bid documents.~~** Run to completion on the reachable half.
mPhilGEPS: 4,285 notices, 17.4 GB, 555 M chars, ingested. Legacy: gated behind a supplier login and
not defeated. **Recall contribution: exactly zero.** Value contribution: eligibility, 0.12 → 2.40
items per notice, which is journey 4. The remaining open item is not a spike, it is a decision —
**whether to register a PhilGEPS supplier account** to reach legacy's ~29,300 documents. That is a
ToS and attribution question (the Document Request List attributes every download to your org), not
an engineering one, and it needs you.

**Also closed: OCR.** Not deferred — declined, with the measurement in "Measured facts". Revisit
only if the `text_pages = 0 AND scan_pages > 3` population becomes commercially material, and then
with a vision model on 2 rasterized pages, never tesseract.

---

## Open questions

1. **Willingness to pay** — still the real experiment, still untested at any price. Unchanged from
   DECISIONS, and nothing in this design answers it.
2. **Which user type is primary — contractor or supplier?** They want opposite things from the same
   corpus (3 examined vs 40 triaged) and the answer sets the default `results`, the ranking weights,
   and which journey gets built past 0. Suppliers are the larger segment (~72% of notices); contractors
   have more revenue per bid. Unresolved, and `results` in `profile.md` is the seam that defers it.
   **New evidence, and it points at the supplier:** outsider win rate by contract size is 28% under
   ₱100K, 38% at ₱100K–1M, 40% at ₱1M–5M, and **0% above ₱5M (n=5)**. If that direction holds, a
   *discovery* product demonstrably wins work in small goods procurement and demonstrably does not
   in big civil works, where the market looks local and relationship-driven. That inverts the
   value-concentration argument (₱15M+ is 79.6% of value) which had been pulling toward the
   contractor. **n=5 in the top band concludes nothing** — this is the cheapest high-value
   measurement left, and deferral #5 buys it for ~an hour of requests.
   Second, smaller nudge in the same direction: `results: 3` is what scored 0.12 in the eval. The
   deep-cut supplier journey is also the one that scores better.
3. **Does the software finding change the target user?** ~60–70 live dev contracts nationally is a
   thin market. Civil works is 25–50% of the board. If the pitch is aimed at software firms, the
   addressable pool may be too small to matter.
4. ~~**Legacy detail-page text size** — unmeasured, and legacy is 81% of the corpus. Fatter pages push
   the tagging pass toward ₱900; thinner pages make it cheaper but the tags less reliable.~~
   **Answered 2026-08-08 pm — legacy is thinner, and the full pass cost ₱250.48.** Median legacy
   description is 1,855 chars against mPhilGEPS's 2,507, and legacy has no line-items column:
   1,230 payload chars/notice (₱0.0117) vs 1,525 (₱0.0127). All 22,068 notices tagged, 0 failed
   batches. The two 200-notice pilots extrapolated to ₱262–279 and were good to 5%. Tag quality on
   legacy did not degrade — spot-checked 10, 9 correct. See `apps/rfp/NOTES-tag.md`.
5. Whether Luna is strong enough for PCAB/RA 12009 eligibility reasoning, or that one call escalates
   to Terra. **Still open and now materially bigger**, because the doc tier moved eligibility from
   0.12 to 2.40 items per notice — there is now real output to be wrong. Spot-checks read sane
   (`valid FDA License to Operate` on a drugs notice, `NFCC or committed line of credit` on a ₱1.81B
   services contract) and `needs_pcab` agrees 90% between tiers, but **nothing has been checked
   against the statute.** That check is cheap and has not been done.
6. **Do we register a PhilGEPS supplier account?** The only route to legacy's ~29,300 bid documents,
   i.e. to attachments on 81% of the corpus. Not an engineering question — PhilGEPS ToS, and the
   Document Request List attributes every download to your org, so the crawl is not anonymous. Given
   that attachments scored +0 on recall, the honest answer may be "not yet, and maybe never."
7. ~~**Attached bid documents** — highest-value next spike.~~ **Answered overnight 2026-08-08.**
   mPhilGEPS public and ingested (4,285 notices / 17.4 GB / 555 M chars); legacy gated. Recall
   contribution **zero**; eligibility contribution 0.12 → 2.40 per notice. See the corrections block
   and "Deferred".
8. ~~**Is there free 2026 award data?**~~ **Answered: yes, and the whole history is enumerable by
   `awardID` with no session.** See "Award history" in measured facts.

# Night report — 2026-08-08, 16:58→22:33 UTC

**Bid documents are half-gated: mPhilGEPS attachments are completely public and are now ingested
(4,285 notices, 17.4 GB fetched, 555M chars of text). Legacy PhilGEPS 1.5 — 81% of the corpus and
where the civil works lives — is behind a supplier login that was not defeated and should not be.**

**And the expensive half did not pay. Attachment text moved search recall by exactly zero notices
across all ten measured query-runs.** The corpus got much richer tonight and the product did not get
better at finding things, because the thing that limits recall turned out to be three small bugs in
our own CLI, not a missing data channel. Read "What is actually broken" before spending another peso
on documents.

Spend: **₱318.93 of the ₱1,000 cap** (₱681.07 unspent, deliberately). 8.0 GiB disk retained.
17 commits. Every claim below has a number, a status code, or a selfcheck behind it.

---

## What changed about the product picture

### 1. Deferral #2 is settled, and the answer is "partly, and not where it matters"

The design doc called attached bid documents "the highest-value next spike". Tonight it was run to
completion on the half that is reachable. Both halves of the verdict are firm:

| | mPhilGEPS (19% of corpus) | legacy PhilGEPS 1.5 (81%) |
|---|---|---|
| documents public? | **yes, fully** | **no — supplier login** |
| evidence | 963/963 HEAD → 200, no cookie, no session, no referer | `Tender/OrderBasketUI.aspx` → 302 → `/GEPSNONPILOT/log-in.aspx` |
| ingested | 4,285 / 4,288 notices | 0 |
| document rows | 9,875 (532 of them archive members) | — |
| bytes | 17.436 GB fetched, 8,337 distinct blobs | — |
| text | 554.8 M chars over 294,173 pages | — |

The mPhilGEPS side had **one trap that would have made a careful crawler give up**: the document
index is a facebox partial at `/Tenders/tender_doc_view/{id}/{id}`, and fetched without an
`X-Requested-With: XMLHttpRequest` header it returns HTTP 200 and a constant 21,484-byte shell
containing *"Your session has been expired, please login in again to continue."* — byte-identical
for every notice id tested. It is CakePHP layout boilerplate, not an auth check. Add the header and
the full document table appears. An agent that read that string as a paywall would have wrongly
concluded the entire corpus was gated.

On legacy the gate is real and was respected. The abstract page's "Associated Components" postback
is **HTML-commented out** and replaced with `alert("In order to download the document, you must
register first or login to the system")`. Forcing the postback anonymously with valid
`__VIEWSTATE`/`__EVENTVALIDATION` returns a byte-identical page — a server-side no-op. Across ~100
unauthenticated requests including four forced download postbacks, **every response body began
`3c 53 43 52 49 50 54` ("<SCRIPT")** — never `%PDF`, never `PK`. Nine guessed handler names all
302 to `ErrorPage.aspx`, i.e. do not exist. No credentials were used and none were forged.

### 2. The recall eval is the most important result of the night, and it is unflattering

Locked decision S7 (approach A as an eval oracle) was finally executed. Slice: **all 489 Cavite
notices**, read end to end by hand; 5 queries in a real bidder's words; **91 ground-truth labels**.
The slice was defined by geography alone, never by `work_type`, so that a mistagged notice shows up
as a miss instead of quietly falling out of the measurement.

| config | micro recall |
|---|---|
| **natural wording, `profile.md` as shipped (`results: 3`)** | **11/91 = 0.12** |
| natural, n=40 | 48/91 = 0.53 |
| expanded query, n=40 | 62/91 = 0.68 |
| expanded, n=40, `--province-strict` | 86/91 = 0.95 |
| expanded, n=40, `--province-strict --no-profile` | **91/91 = 1.00** |

**The tool as configured tonight finds 12% of what a bidder should see.** Every one of the 91 is
reachable from notice title/description/line-items text alone — nothing needed attachments or tags
to be *findable*. Retrieval is not the problem; query formulation, the null-location policy, and the
result cut are.

Ablation over text channels, n=200, no profile:

| channel set | natural | expanded |
|---|---|---|
| title/description/items only | 49/91 | 91/91 |
| + Luna tag scope/keywords | **53/91** | 91/91 |
| + attachment text | 49/91 | 91/91 |
| both | 53/91 | 91/91 |

**Attachments: +0, in all ten runs.** The reason is structural, not tuning — 0 of the 91
ground-truth notices have attachment text, and only 74 of the 489 slice notices do, because
`documents` holds **0 rows for `source='legacy'`** and Cavite is 412/489 legacy. Attachment text
cannot help on the part of the corpus where the civil works is.

It is worse than neutral at the top of the list: on the shipped default for Q5, three of five
returned rows are out-of-province notices (Palawan, SEC, CAAP) promoted by an mPhilGEPS bidding
document matching "Spare Part". The attachment channel actively displaced the in-province matches.

**Luna tags: +4 notices (+4.4pp) on natural queries, +0 once the query is written properly.** Real,
cheapest channel, and it survives on legacy where attachments do not — but it is a synonym patch on
a query-formulation problem.

*Caveat, stated so the number is not over-read:* one province, five queries, 91 labels, and the
oracle is one exhaustive human read, not a second model's. Cavite is legacy-heavy; a Metro-Manila
or mPhilGEPS-heavy slice would have far better attachment coverage and could plausibly show a
non-zero attachment contribution. **The finding is "attachments cannot help on legacy", not
"attachments never help".**

### 3. What the documents *did* buy: eligibility, which was empty before tonight

Measured over 424 notices carrying both a description-tier and a document-tier tag:

| | base (description) | doc (bid documents) |
|---|---|---|
| **eligibility items / notice** | **0.12** | **2.40** |
| scope length | 79 chars | 125 chars |
| work_type agreement | — | 88% agree |

A description-only pass finds essentially no special eligibility requirements, because they are not
in the description — they are in the bid documents. That is **journey 4 ("can I actually win
this?")**, not journey 0 or 2. 64% of doc-tier keywords (3,486 of 5,409) appear nowhere in the
notice's own text: `tetrapod`, `geotextile tube`, `MSE retaining wall`, `sheet piles`.

The worked example: notice **50936**, ABC **₱1.81 billion**, whole description `Please see attached
file for reference. ***nothing follows***`. Document tag: *"Provision of 1,709 sales and customer
support assistants to Pag-IBIG offices nationwide for two years"*, wage floor ₱1,276.70/day,
eligibility `PhilGEPS Platinum Membership · similar SLCC with completion proof · NFCC or committed
line of credit`. That notice was invisible to text search before tonight and is now findable.

So the honest framing: **attachments are an eligibility and scope-recovery asset for the ~19% of
the corpus that has them, not a recall asset.** Bill them to journey 4.

### 4. OCR is answered, and the answer is no — permanently, not "not yet"

34.8% of PDFs (2,760 of 7,935) have no text layer at all; 12.1% of pages (35,455 of 294,133) are
image-only. At notice level, **655 of 4,285 (15.3%) have no readable file whatsoever**.

The tempting fix is tesseract. It was installed *only to measure*, and the measurement kills it:
embedded raster resolution is **72–150 ppi** (medians per document: 72, 129, 150, 168) against
tesseract's 300 ppi floor. `pdftoppm -r 300` cannot help — it upsamples a 451×613 embedded JPEG;
the ceiling is the raster, not the render. Rendering a real DPWH photocopy at 300 dpi produced
`PEM eat} EMBANAMENT` for "ITEM 804(1)b EMBANKMENT".

And the pages that *do* OCR cleanly carry nothing worth searching — `PROPOSED FLOOR PLAN`,
`REFLECTED CEILING PLAN`, `ITEM 900 REINFORCED CONCRETE`. Those words are on every renovation and
every road project in the country; BM25 scores them ~0 by design. **The two populations are
unOCRable, and not worth OCRing.** If this is ever revisited, the escalation is not tesseract — it
is rasterizing the first 2 pages of the bounded `text_pages = 0` subset to a vision model.

### 5. Award history is free, enumerable, and it contradicts our targeting thesis

`DECISIONS.md` recorded that no free 2026 award data exists. It does. The ASMX layer behind the
Ext JS award page answers **plain GET with query params, if you send a JSON content-type** —
without the header every call returns a generic error, which is exactly what makes it look gated.
`AwardAbstract_GetAwardedSupplier` **ignores `refID` entirely** and keys off `awardID` alone, and
arbitrary awardIDs resolve, so the whole history (~1.19M ids, Aug 2024 → Jul 2026, ~50K
awards/month) is enumerable without a listing or a session. Winner name and full street address
included.

277 awards sampled. Win ratio: **median 99.0% of ABC, 21% land at exactly 100.0%, none above.**

The uncomfortable number — **outsider win rate by contract size**:

| band | outsider win rate | n |
|---|---|---|
| <₱100K | 28% | 18 |
| ₱100K–1M | 38% | 40 |
| ₱1M–5M | 40% | 25 |
| **₱5M+** | **0%** | **5** |

Overall 30/88 = 34%, above the >30% threshold that would mean remote discovery demonstrably wins
work. But the direction across bands **contradicts the value-segment thesis**: small goods
procurement looks genuinely open to remote suppliers, while big civil works looks local and
relationship-driven. n=5 in the top band cannot conclude anything, but if it holds it inverts who
this product should target. This belongs in front of open question 2, not buried in a notes file.

Two traps paid for here, both quotable-wrong-number shaped: `BidderListCount` returned 1 on all 10
awards sampled and counts **award recipients, not bidders** — do not publish "100% of awards had a
single bidder". And repeat-winner concentration naively read 67% because **one procurement is split
across one award row per line item** (JEMER O. LOKING's nine "consecutive awards" are one title,
one winner, one date, ₱25 to ₱21,825). Collapsed to (officer, title, date), the real median
top-firm share is **33% — dispersed**.

---

## What shipped

| file | what it is | selfcheck |
|---|---|---|
| `ingest.py` | mPhilGEPS listing → detail → `tenders.db` | `test` → ok |
| `ingest_legacy.py` | legacy 1.5 → `legacy.db` | `test` → ok |
| `merge.py` | both → `corpus.db` (22,080 notices, ₱207.1B) + FTS5 | `test` → ok, 102 asserts |
| `tag.py` | Luna tag pass, base + doc tiers, flock'd spend cap | `test` → ok |
| `attachments.py` | discover/download/extract/run/stats, owns `docs.db` | `test` → ok |
| `extract_lib.py` | measured parser primitives, builds own fixtures | `test` → ok |
| `awards.py` | ASMX harvest + the two metrics | `test` → ok |
| `rfp` | the CLI a cheap model drives: `sql`/`search`/`show`/`facets` | `test` → **38/38** |
| `eval_recall.py` | the S7 oracle harness | `selfcheck` → ok |
| `docs_census.py`, `recon_docs.py` | mPhilGEPS document recon | `selfcheck` → ok |
| `legacy_docs_probe.py` | legacy gate probe + landing classifier | `--selfcheck` → ok, 24 asserts |
| `audit_ops.py` | spend / coverage / disk / git-hygiene asserts | **9/14 — see below** |
| `verify_audit.py` | adversarial re-derivation of the doc/corpus claims | **10/10** |

All 14 run offline. 13 pass; `audit_ops.py` fails on purpose — those failures are findings, listed
next.

Notes files, all with numbers behind them: `NOTES-parse.md`, `NOTES-legacy.md`, `NOTES-extract.md`
(622 lines, the toolchain decisions E1–E5), `NOTES-tag.md`, `NOTES-awards.md`, `NOTES-eval.md`.

---

## Spend

| line | amount |
|---|---|
| Luna API — base tier, 22,080 notices | ₱250.48 |
| Luna API — doc tier, 619 notices | ₱68.45 |
| **total model spend** | **₱318.93 / $5.50** |
| cap | ₱1,000 — **₱681.07 unspent** |
| tokens | 12.72 M in / 2.46 M out, 2,829 batches, **0 failed calls** |
| bytes fetched | 17.436 GB (distinct blobs) |
| disk retained | **8.014 GiB** of a 20 GiB cap; 2,808 blobs kept, rest deleted after extraction |
| wall clock | 5 h 35 m, 17 commits |

Output tokens are 26% of volume and **51% of cost** — S6's "terse tags are the cost control" is
confirmed, not folklore.

**Politeness.** Concurrency held at ≤6 throughout. ~2,600 recon requests + 4,288 discovery + 9,827
document fetches against `philgeps.gov.ph`: **zero 429s, zero 5xx**. Against
`notices.philgeps.gov.ph` a **403 appeared within a few requests** when two jobs hit it at once —
it recovered with ~3 s spacing and a browser User-Agent. Budget total concurrency across all jobs on
that host, not per job.

Also noted, and it independently confirms the SEO wedge: every page on `philgeps.gov.ph` serves
`<meta name="robots" content="noindex, nofollow">`, and `/robots.txt` returns the app's HTML
catch-all. Google cannot index the source at all.

---

## Decisions made on your behalf

| decision | why | how to reverse |
|---|---|---|
| **Did not attempt the legacy auth wall** | Ground rule, and it is a real gate: the download funnel 302s to `log-in.aspx`, the postback is commented out of the served HTML. Getting the bytes needs a registered supplier account — a legal/product call (PhilGEPS ToS, and the Document Request List attributes every download to your org), not an engineering one. | Requires a decision from you, not code. |
| **Do not OCR. Ever, at this resolution.** | Measured 72–150 ppi against a 300 ppi floor; the pages that do OCR carry only universal boilerplate. See §4. | `apt remove tesseract-ocr` — nothing depends on it. |
| **Installed 3 apt packages** (`tesseract-ocr`, `unar`, `antiword`) via passwordless sudo | `unar` is load-bearing (RAR is an officially allowed PhilGEPS upload format and there is no pure-Python RAR decoder); `antiword` is 200 KB of insurance; tesseract was installed only to measure and the measurement says don't use it. | All three are `apt remove`-able. |
| **Left ₱681 of the cap unspent** | Attachment availability, not budget, was the binding constraint, and it is exhausted: 619 of 822 boilerplate-only mPhilGEPS notices were doc-tagged; the other 203 have no readable attachment; legacy's 5,426 boilerplate-only notices have no attachment path at all. Remaining budget buys only a re-read of text FTS5 already indexes. | Raise nothing — the money is not the blocker. |
| **Doc-tier population = boilerplate-only description, ABC-descending** | That is exactly where the attachment is the *only* scope signal. Deliberately did **not** doc-tag the 755 notices at ABC ≥ ₱15M that already describe themselves — paying a model to re-read what FTS5 indexes is the spend the brief warned against. | `tag.py doc` with a different predicate. |
| **Did not widen the 44k-char extraction window** | The deliverable is a ≤240-char scope; the block selector already hands over the best blocks. Doubling the window doubles the bill for text the answer doesn't use. | One constant in `tag.py`. |
| **Did not add `apparel` / `power_energy` to the work_type enum** | `other` is down to 697 notices (3.2%) from the pilot's 10%. Adding two enums means re-tagging all 22,068 for ₱250 to reclassify ~3%. Recorded in `NOTES-tag.md` so the next vocabulary pass starts from evidence, not taste. | Re-run the base tier. |
| **Blobs are transient by design** | Extract text, keep `sha256` + URL, delete the bytes. Keeps disk bounded and the file refetchable. 2,808 of 8,337 retained. | `blobs/` is gitignored. |
| **Eval slice defined by geography alone** | A `work_type × province` slice would have hidden tag errors — a mistagged notice falls out of the slice instead of registering as a miss, and the eval would then "prove" tags help. | — |
| **Contiguous-block award sampling, not random** | A random draw across 1.19M ids never hits one office twice, so repeat-winner concentration would read "no repetition" as a pure sampling artefact. | — |
| **Committed `legacy_docs_probe.py`** | The agent that wrote it left it uncommitted for fear of sweeping up other agents' work in a shared tree. It is source with a passing selfcheck and belongs in the repo. | — |

---

## What is actually broken

**Three bugs in `rfp` are worth more recall than every byte downloaded tonight.** Together they
move the measured slice from 0.12 to 1.00.

1. **FTS5 reads a bare multi-word query as an implicit AND.** `vehicle spare parts repair` matches
   **0 of 489** Cavite notices; `vehicle` alone matches 40. This corpus writes "Parts and
   Materials". `relax()` already rewrites to an OR of quoted barewords — but it is only wired to
   `sqlite3.OperationalError`, a *syntax* error. A syntactically valid query that ANDs itself down
   to zero rows never triggers it. **Fix: fall back to `relax(q)` on zero/near-zero rows and say so
   in a note.** One condition.
2. **`--province X` spends most of its budget outside X.** Keeping null-location notices is
   correct (dropping them is the omission bug), but they then compete for the same 40 slots at fit
   0.85 and BM25 does not know they are in the wrong province. Measured: **only 82 of 200 returned
   rows were in Cavite; 113 of the other 118 had no stated location at all.** Cost of the current
   default: **~24 recall points.** Fix is to cap null-location rows at a fraction of the slots, not
   to drop them.
3. **Multiplicative `profile_fit` collapses to the 0.20 floor and buries exact matches.** Notice
   `13171857` — heavy-equipment parts, ₱188K, closing in 1 day — scores `below band (6% under)` ×
   `tight: 1d vs 5d` × `off-category` = **0.20**, the same fit as something in the profile's `never`
   list. Three mild demotions multiply into a hard exclusion, which is precisely what S3 forbids.

**Five audit failures, all real, none data-destroying:**

- `coverage: every corpus notice tagged` — **22,068 tagged vs 22,080 in corpus, delta 12.** Verified
  by hand: the 12 are exactly ids 2208–2239, the known zombie notices that serve permanent HTTP
  500s. They have no detail body to tag. The audit should whitelist them rather than the number
  being chased.
- `disk: >30 days of runway` — **17.8 days at the measured +0.72 GB/day, and the cap trip is
  SILENT** (`skipped_cap` then `break`, exit 0). This is the exact shape of the failure that killed
  `chloebellee/philgeps-scraper` — a job that stops working and keeps exiting 0. Highest-priority
  fix in this section.
- `git: no uncommitted RFP source` — `legacy_docs_probe.py`. Fixed in this commit.
- Two further coverage assertions are the same delta-12 restated.

**One reporting bug found in passing:** `_fold_aux_channels` prints `attachment text matched N
notices (M of them invisible…)` where `M` counts the union of the attachment *and* tag channels, so
it routinely prints M > N ("matched 1689 notices (2521 of them invisible)"). Cosmetic, but the
driving model reads that note as evidence.

**One recon estimate was wrong and is corrected here:** the 30-notice sample projected a median of
6,123 extractable chars per notice. Over all 4,285 the median is **154,367** (mean 134,065, p90
275,379). The mean was right; the median was a small-sample artefact. This *strengthens* the
conclusion — whole-attachment-in-prompt is not a prompt, it is a pipeline.

---

## What is left undone

1. **The three `rfp` fixes above.** Cheapest recall on the board by a wide margin. Do these before
   anything else in this list.
2. **Disk-runway guard.** Make the cap trip loud and non-zero-exit.
3. **Alerts.** Still deferral #1, still untouched, still the highest-risk deferral in the design —
   59.4% of the corpus closes within 6 days and we are betting on daily user discipline.
4. **Legacy metadata harvest — measured, costed, not run.** `PrintableBidNoticeAbstractUI.aspx` is
   a strict field superset of the page `ingest_legacy.py` currently uses, at half the bytes, and it
   exposes the attached-document count that `legacy.db` lacks entirely (~29,300 documents,
   mean 1.65/notice, **0% of notices have zero**). ~24,142 GETs, 661 MB, ~2.0 h at 4 workers,
   <20 MB stored. Not run because `legacy.db` was read-only to me tonight.
5. **`legacy.db`'s `bid_supplements` column is wrong on 2,344 rows (13.19%)** and needs a re-crawl.
   `NULL` does not mean "unknown", it means **">=1 supplement"** — the splash page swaps the span
   for a postback link whenever the count is non-zero, so the id-based read returned NULL on
   precisely the rows that have supplements. Verified 90/90 with zero counterexamples in either
   direction. The 15,436 zeros are genuine.
6. **Award enumeration at scale.** Win ratios, repeat-winner concentration by firm, UNSPSC mix and
   volume-over-time are all computable *now* from awardID alone (~9,000 requests for a 3,000-award
   sample, under an hour). Outsider win rate needs the buyer's province, so it needs the rolling
   listing at ~100/day.
7. **LGU registry** (deferral #3) and **APPs** (#4) — untouched, unchanged in priority.
8. **The RAR extraction branch is the one untested path** in `extract_lib.py` — no rar compressor
   on the box to build a fixture. It is a shell-out stub with the exact command. Flagged rather
   than claimed as covered.
9. **PCAB/RA 12009 eligibility reasoning was never checked against the statute.** The doc-tier
   `eligibility` output looks sane and is now 2.40 items/notice, but "looks sane" is not verified.

---

## Sampling disclosure

- **Document census:** 1,200 notices drawn at random (seed 11) from `tenders.db`; 963 file URLs
  HEADed; 5 files downloaded and magic-byte verified; 30 notices fully downloaded (202 MB, 2,359
  pages) for the page-count distribution. Production run then covered all 4,288.
- **Legacy gate:** 90 refIDs, live 2026-08-08 ~19:00 UTC. 30 hand-picked (high-ABC Civil Works,
  biased toward the NULL-supplement rows) for gate/postback/filename findings; **60 uniformly
  random** for every distribution quoted. The brief asked to bias toward `bid_supplements > 0`,
  which is impossible as written — `legacy.db` contains no such rows (15,436 zeros + 2,344 NULLs),
  and the NULLs turned out to *be* the has-supplements population.
- **Eval:** one province (Cavite), 489 notices, 5 queries, 91 labels, oracle is one exhaustive
  human read. Precision was not scored and is visibly poor at n=200 by design.
- **Awards:** 277 awards — 100 from the rolling listing plus contiguous-id blocks. Outsider rate is
  over the 88 with a resolvable delivery province. The ₱5M+ band is **n=5** and concludes nothing on
  its own.
- **Tag quality:** 10 random base-tier tags read against source (9 correct, 1 half-correct — and
  that one is a multi-contract ITB data defect, not a tagging defect); 5 doc-tier (5 correct).

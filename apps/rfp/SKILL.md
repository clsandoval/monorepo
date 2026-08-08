# rfp — finding Philippine government notices worth bidding on

`./rfp` is a read-only CLI over **22,068 open procurement notices** (₱207.05B of contract value)
scraped from both PhilGEPS systems. You drive it. It does no reasoning; it does retrieval,
filtering and ranking, and it formats results tightly so a search costs you ~2K tokens instead of
the ~1.55M it would take to read the board.

Everything below was measured against the live `corpus.db` on 2026-08-09 with `./rfp stats` and
`./rfp selfcheck`. Re-run those two commands rather than trusting this file if the numbers matter.

---

## The loop

```
1.  rfp facets "<broad query>" [filters]     ~280 tokens. Where are the notices? Which provinces,
                                             sizes, modes, deadlines. Do this FIRST.
2.  rfp search "<query>" [filters]           ~48 tokens/hit. Ranked, with the reason for each rank.
    (repeat 5-15x, widening terms)           Vary the words: the taxonomy will not find things.
3.  rfp sql "select ..."                     Anything the flags cannot express.
4.  rfp show <id> [id ...]                   Full scope, line items, attached documents. ~10 ids,
                                             not 40 -- this is the expensive call.
```

`rfp sql` is the **primary** tool, not the fallback. Every flag on `search` is a worse `WHERE`
clause than the one you can write yourself. Use `search` when you want the profile prior and the
token budget; use `sql` when you want the truth.

---

## Commands

### `rfp sql "<select>"`

Read-only SQL. The file is opened `file:corpus.db?mode=ro` and an authorizer denies `ATTACH`, so
a write returns an error instead of causing an incident. `select` / `with` / `explain` /
`pragma table_info` only, one statement per call. `--json`, `--limit N` (default 200), `--cell N`.

### `rfp search "<query>" [filters]`

FTS5 match + filters, reranked by the profile prior in `profile.md`, formatted to ~48 estimated
tokens per hit. Output:

```
[13157394] P3.6M 9d Cavite PB fit0.90
  Supply and Delivery of Labor and Materials for the Concreting of Road Network of Naval Pe…
  PN BAC SECRETARIAT, AFP PROCUREME… | lots 6xP60K
  …**ROAD** SUBGRADE PREPERATION AGGREGATE BASE COURSE PCC **PAVEMENT**…
```

`[id] ABC days-to-close province mode fit` / title / agency + work_type + per-lot range /
matched snippet. A leading `~` on the province means **inferred from the agency name, not stated
on the notice** (see "Geography" below).

`fit` is a multiplier in [0.20, 1.00] and hits carry their demotion reason in parentheses —
`(lot fits: P27K-P54K lots in a P153K notice)`, `(stretch: P40M vs your P5M band)`,
`(tight: 2d vs your 5d)`. **Nothing is ever hidden by the profile**, only demoted and annotated.

Filters: `--abc-min --abc-max --strict-abc --province --province-strict --work-type --mode
--mode-family --agency --classification --source --days-min --days-max --closing-before
--closing-after --include-closed --include-unenriched -n/--results --min-days --band
--no-profile --no-snippet --budget -v --json`.

With **no query text** the search is filter-only and there is no BM25 signal, so the profile prior
*is* the ranking — `rfp search --days-max 2 -n 40` is a legitimate "what closes this week that
suits me" call, not a degenerate one.

An explicit `--province` / `--abc-*` / `--work-type` **also overrides the profile for ranking**,
not just for filtering. That is deliberate: without it, `--province Cavite` (which keeps
location-null notices on purpose) let BM25 put four non-Cavite notices above the Cavite one.

### `rfp facets "<query>" [filters]`

Counts by work_type / province / mode family / ABC band / self-declared classification /
days-to-close / source / agency, for whatever the query and filters select. **279 estimated tokens
over all 22,068 notices in 0.73s** — bare `rfp facets` with no query covers the whole board. This
is what replaces "read the whole corpus". Same filters as `search`.

Its `province` row uses the same agency-name inference as `search` (`~Bulacan`), which is why the
no-location bucket reads 1,044 rather than 1,929. `--province-strict` gives a cleaner picture when
you only want notices that actually state a location. If the header says `pool capped`, raise
`--pool`; the counts are otherwise exact.

### `rfp show <id> [id ...]`

Full description, line items (table header stripped), contact, funding, URL, and **attached bid
documents with their extracted text** when `docs.db` covers that notice. `--chars N` truncates
long text (`--chars 0` for all), `--no-docs` suppresses attachments, `--json` for structure.

### `rfp profile` · `rfp stats` · `rfp selfcheck` · `rfp build`

`profile` prints the resolved profile and what its regions expand to, and warns about
`categories` values outside the work_type enum. `stats` re-measures every number in this file.
`selfcheck` runs 32 asserts (~8s). `build` regenerates `corpus.db` from `tenders.db` +
`legacy.db` + `tags.db` and refuses to overwrite an existing one without `--force`.

---

## corpus.db schema — as it actually shipped

The design doc sketched one FTS table called `corpus`. **That is not what exists.** The real
shape:

| object | what it is |
|---|---|
| `corpus` | the relational table, one row per notice. `nid` is the primary key. |
| `corpus_fts` | FTS5, external content, `content='corpus'`, `content_rowid='nid'`. Indexes **five** columns: `title, description, items_text, category, agency`. Tokenizer `porter unicode61 remove_diacritics 2`. |
| `notice_location` | `location` exploded on commas. `(nid, source, id, ord, location, location_norm)`. One row with `location=null` for notices that state none. |
| `dupe_review` | `dupe_key` collision groups, for review. **Never auto-merge** — see "Traps". |
| `corpus_state` | view adding `state` (`open`/`expired`/`no_closing`) and `days_left`. |
| `build_meta` | how and when this corpus.db was built. |

`corpus` itself does **not** answer `MATCH`. Join it:

```sql
select c.id, c.abc, c.closing_at, substr(c.title,1,50) t
from corpus_fts join corpus c on c.nid = corpus_fts.rowid
where corpus_fts match 'backhoe OR excavator OR grader'
  and c.enriched_at is not null
  and c.abc between 1000000 and 20000000
order by rank limit 4
```

**MATCH needs the table name, not an alias** — `from corpus_fts f ... where f match '…'` fails
with `no such column: f` on SQLite 3.37.

Columns on `corpus` worth knowing:

```
nid  source  id  notice_key(source||':'||id)
title agency mode mode_norm classification category location abc status contact description
publish publish_at closing closing_at closing_day publish_day updated_at
seen_at enriched_at fetch_errors dupe_key
mphilgeps only:  abc_lot_min abc_lot_max items items_text control funding lot_type
                 client_agency delivery_days closing_detail downloads
legacy only:     solicitation_no trade_agreement delivery_period contact_email contact_phone
                 bid_supplements doc_req_list last_updated last_updated_at
tag pass:        work_type needs_pcab eligibility scope keywords tag_model tagged_at
```

Columns the CLI synthesises that are **not in the database** — copy the expression if you want
them in your own SQL: `mode_family`, `abc_band`, `province`, `provinces`, `url`, `closing_dow`
(`cast(strftime('%w', closing_at) as integer)`, 0=Sunday), `delivery`
(`coalesce(delivery_days, delivery_period)`).

### Always filter `enriched_at is not null`

`corpus` holds **22,080** rows; **22,068** are real. The other 12 (ids 2208–2239) serve permanent
HTTP 500s, have no ABC and no closing date, and would sort first under a naive
`order by closing_at`. Every `rfp` subcommand excludes them by default (`--include-unenriched` to
see them). Raw SQL does not — add the clause.

---

## Worked queries

```sql
-- multi-lot notices you could bid ONE lot of: a P523K notice made of P1.5K-P40K lots
select id, abc, abc_lot_min, abc_lot_max, substr(title,1,40) t from corpus
where enriched_at is not null and abc_lot_max <= 100000 and abc > 300000
order by abc desc limit 20;

-- weighted relevance, title-heavy (the 5 weights match corpus_fts' 5 columns, in order)
select c.id, round(-bm25(corpus_fts, 8.0,1.0,2.0,2.5,1.5),2) rel, substr(c.title,1,50) t
from corpus_fts join corpus c on c.nid = corpus_fts.rowid
where corpus_fts match '"perimeter fence"' and c.enriched_at is not null
order by rel desc limit 20;

-- what an agency is buying, by value
select agency, count(*) n, round(sum(abc)/1e6,1) php_m from corpus
where enriched_at is not null and location = 'Cavite'
group by 1 order by n desc limit 10;

-- geography, done right: never `location = 'Laguna'`
select c.id, c.location from corpus c
where c.enriched_at is not null and exists (
  select 1 from notice_location pv where pv.nid = c.nid and pv.location_norm = 'LAGUNA');

-- closing-time histogram (the deadline clustering below)
select strftime('%w', closing_at) dow, cast(substr(closing_at,12,2) as int) hr, count(*) n
from corpus where enriched_at is not null group by 1,2 order by n desc limit 10;

-- what got posted today
select id, abc, substr(title,1,60) t from corpus
where enriched_at is not null and publish_day = date('now') order by abc desc limit 20;
```

---

## Measured facts — read these before drawing a conclusion

**The official classification is self-declared and wrong often enough to matter.** Of 4,979
notices whose title is unambiguously construction work (`concreting`, `road widening`,
`construction of`, `rehabilitation of … road`), **723 (14.5%) are filed as "Goods" or
"Consulting Services"**. Corpus-wide the field reads Goods 13,357 / Civil Works 6,472 /
Civil Works–Infra 1,618 / Goods–General Support 438 / Consulting 183. **Never use
`classification` as your filter.** Keyword-over-title-and-items is what works.

**The board closes fast.** ≤2 days 21.5% · 3–6d 38.8% · 7–13d 21.7% · 14–29d 17.2% · 30d+ 0.8%.
**≤6 days = 60.3%.** A weekly cadence structurally misses most of the market. `--days-max 2` is a
real triage mode, not an edge case.

**Deadlines cluster on Monday and Tuesday morning.** 62.1% of notices close on a Monday or
Tuesday; **42.0% close Monday or Tuesday before noon.** Two mornings a week carry nearly half the
board's deadlines. Plan document assembly against that, not against a uniform week.

**Value is brutally concentrated.** Under ₱1M: 49.5% of notices, **1.8%** of value (₱3.67B).
₱1–15M: 40.7% / 18.6%. **₱15M+: 9.7% of notices, 79.6% of value (₱164.8B).** Counting notices and
counting money give opposite answers about where the market is.

**Two systems, two different markets.** legacy 17,780 notices / ₱120.0B, mphilgeps 4,288 /
₱87.0B. legacy is 72.2% public bidding and LGU-heavy; mphilgeps skews SVP and national.
`public_bidding` 15,941 (72.2%) · `svp` 5,453 (24.7%) corpus-wide. The two id spaces are
disjoint (mphilgeps 2,208–55,594; legacy 12,535,432+) so `id` alone is a valid key.

**Demand clusters thinly.** `category × ABC-band × province` yields **7,826 archetypes, of which
5,121 (65.4%) hold exactly one open notice nationally.** (The design doc says 6,837 / 60% — that
was measured before the merge; this is the same measurement on the shipped corpus.) When a search comes back with two hits, that is
usually the market, not a bad query. The fix is deliberate widening — adjacent provinces,
adjacent categories, multi-lot decomposition — and saying so out loud, not a cleverer query.

**Geography is dispersed and partly missing.** 91 provinces present; Metro Manila is the largest
single value at 2,190 rows (~10%). `location` is null on **1,929 of 22,068 (8.7%)** — 12.2% of
mphilgeps, 7.9% of legacy — and genuinely blank on the page, not a parse failure. It is
**comma-multi-valued** on 103 rows (`Batangas,Laguna,Quezon,Rizal`), so a `=` comparison misses
every one of them.

For the blanks, `rfp` reads the province out of the **agency name** (`DPWH - BULACAN 1ST DEO`),
which recovers **937 of the 1,929 (48.6%)**. Validated against the 19,962 rows where `location`
IS stated and single-valued: the guess fires on 79.7% of them and **agrees 96.3%** of the time.
Displayed as `~Bulacan`. It is a ranking aid only — it never satisfies `--province-strict`, and a
stated `location` always wins, because the residual disagreement is mostly *meaning*: `DA - LIPA
CITY BATANGAS` procuring for delivery in Quezon is an office in one province buying for another.

**ABC is missing on 27 notices**, some published the same day — not an old-template artifact; some
live notices simply omit it. `where abc <= X` silently drops them. `rfp search --abc-max` keeps
them and marks them `abc: not stated`; `--strict-abc` drops them. In raw SQL, write
`(abc is null or abc <= X)` unless you mean to exclude them.

**`mode_norm` keeps legal modes distinct on purpose.** `public bidding`,
`competitive bidding (public bidding)` and `international competitive bidding - others` are
different procurement rules, not casing variants. `mode_family` collapses the 24 distinct
`mode_norm` values into 8 buckets for counting; `negotiated procurement - small value procurement
(sec. 34)` (4,228 legacy rows) lands in `svp`, because that is what it is.

**`items` retains its table header** on mphilgeps rows — every one contains the literal words
`Lot Description`, `Unit of Measure`, `UNSPSC`. `items_text` is the stripped version and is what
`corpus_fts` indexes; `rfp show` strips the residue again (the merge's stripper leaves
`ABC(Estimated Budget)` behind). If you FTS-index `items` yourself, those words match every query.

**The real scope is in the attachments, not the description.** Descriptions average ~3.2K chars
and are mostly boilerplate. `docs.db` has **525 documents across 200 crawled notices** — a pilot,
0.9% of the corpus. `rfp show` distinguishes *"crawled, no attachments"* from **"NOT CRAWLED"**;
do not read the second as the first. Where it does have them, they are decisive: notice 47454's
`eds.pdf` states `The required PCAB license … Size Range: Small B, License Category: B` — a fact
that exists in **no** corpus column.

---

## What this does not know

- **`work_type` is null on all 22,068 rows.** The tag pass has not run against this `corpus.db`
  (`tags.db` holds 337 pilot rows and its `keywords` are character-shredded, so the merge drops
  them). So `--work-type` matches nothing today — `search` says so explicitly rather than handing
  back an empty list — `facets` reports `work_type untagged:N`, and every hit carries an
  `untagged` demotion which `search` hoists to a single footer line. Until the pass runs,
  **work out the kind of work from the title and line items yourself**, e.g.
  `where lower(title) like '%concreting%' or lower(items_text) like '%aggregate base%'`.
- **PCAB class vs contract size is not modelled.** Only `needs_pcab` (also null today). The
  ABC-to-required-class (ARCC) thresholds are deliberately absent rather than guessed —
  fabricating an eligibility rule is worse than admitting the gap. Read `eds.pdf` via `rfp show`
  when it exists.
- **`eligibility`, `scope`, `keywords`** — same tag pass, same nulls.
- **No award history, no Annual Procurement Plans, no LGU registry.** So: no "who won this last
  year and at what price", no pipeline beyond posted notices, and no city→province mapping beyond
  the 17 NCR cities hardcoded for the agency-name fallback.
- **Nothing here is live.** `corpus.db` is a snapshot; check `build_meta.built_at` via
  `rfp stats`. Inflow is ~30–40 new mphilgeps notices per hour during business hours.

---

## Traps already paid for — do not rediscover

- **A broad SQLite authorizer silently kills FTS5.** Denying `SQLITE_INSERT`/`UPDATE`/`DELETE` on
  a read-only connection makes every FTS5 query fail with `vtable constructor failed:
  corpus_fts`, because fts5's `xConnect` prepares statements against its own shadow tables.
  `mode=ro` already blocks all nine write forms (asserted in selfcheck); the authorizer therefore
  denies only `ATTACH`/`DETACH`, which is the one hole `mode=ro` leaves.
- **`dupe_key` flags, it never decides.** 69 collision groups survive in the enriched corpus, and
  the worst case is unanswerable by any field-based key: nine genuinely distinct notices from
  MUNICIPALITY OF LIBON, ALBAY, all titled "Purchase of Various Goods", all ₱199,990, all closing
  2026-08-11 10:00, differing only by refID — verified present and intact in this corpus, and the
  largest group there is. Adding ABC to the key was supposed to prevent false merges; measured, it
  does not. Zero groups span the two systems. Treat `dupe_review` as a candidate generator.
- **Never trust a site total, and never "stop when rows run out".** On legacy, out-of-range pager
  offsets **re-serve page 1**, so a row-exhaustion loop never terminates and silently re-collects
  page 1 forever. (Ingest concern, but it is why row counts here are enumerated, not read off a
  label.)
- **Concurrent legacy POSTs share one `__VIEWSTATE`** and occasionally return 20 valid-looking
  rows from the wrong page. Every row is individually plausible, which makes it the worst failure
  class in this pipeline.
- **Parse detail pages as labelled key/value, never by line adjacency.** An empty value makes
  adjacency return the *next field's label*; that corrupted `location` on 13% of notices while
  reporting a 100% capture rate.
- **Be polite to philgeps.gov.ph and notices.philgeps.gov.ph.** Concurrency ≤6, back off on
  429/5xx. Never attempt to defeat authentication: if a document requires a supplier login, that
  is a finding to record (status codes, redirect targets), not an obstacle to route around.

---

## Ranking, exactly

`score = (bm25 / max_bm25_in_pool) × profile_fit`, descending, ties broken by soonest closing.

BM25 does real work for free: every notice contains "Republic Act 12009" and "non-discretionary
pass/fail", so those terms score ~0, while "backhoe", "geodetic", "centrifuge" discriminate. That
is the cheap approximation of semantic relevance, and it is why there are no embeddings here — the
discriminators that matter (ABC band, days-to-close, province, mode) are exact, and embeddings
blur exactly those. ₱245,000 and ₱2,450,000 are near-identical vectors.

Two-stage on purpose: a pool of `max(--pool, results×12)` candidates comes back BM25-ordered, then
the prior reranks in Python. The pool has to be wide enough for the prior to **promote** something
BM25 ranked 300th — a notice whose per-lot value fits your band, say. Raise `--pool` if a search
feels like it is missing something; the cost is linear and small.

Every `profile_fit` multiplier and its annotation is tabulated in **`profile.md`**.

---

## Cost

~2K tokens for 40 search hits (measured 45.4–53.2 estimated tokens/hit across six queries at 40
hits, hard cap 62/hit; `-v` prints the count). ~280 tokens for `facets`. `show` is the expensive
one — a notice with attachments can run tens of thousands of characters, so use `--chars` and call
it on the survivors, not the pool. A whole session — facets, a dozen searches, ten `show` calls —
lands around ₱0.02 at Luna prices, and is **invariant to corpus size**.

Token figures are an estimate (`max(chars/3.5, words)`), not a tokenizer. tiktoken is not
installed and this tool will not grow a dependency to print a number. The estimate is deliberately
pessimistic for ALLCAPS agency names, so a real tokenizer should come in at or under it.

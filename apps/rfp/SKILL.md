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

Read-only SQL over **three attached databases in one query**. `select` / `with` / `explain` /
`pragma table_info` only, one statement per call. `--json`, `--limit N` (default 200), `--cell N`.

| schema | what is in it | join key |
|---|---|---|
| `main` (corpus.db) | `corpus` (22,080 notices), `corpus_fts` (notice text), `tag_fts` (distilled scope/keywords), `notice_location`, `dupe_review` | `corpus.id` |
| `docs` (docs.db) | `documents` (10,407 rows), `blobs` (8,337, holds `text`), `doc_fts` (attachment text), `notices` (crawl status), `skips` | `documents.notice_id = corpus.id` **and** `documents.source = corpus.source` |
| `tags` (tags.db) | `tags` (22,068 Luna tags), `tag_runs` | `tags.id = corpus.id` |

Every file is opened `?mode=ro` **individually**, then an authorizer denies any further `ATTACH`.
So all three are readable, none is writable, and the `attach 'writable.db' as w; insert into w…`
hole stays shut. Writes error rather than causing an incident.

`corpus.work_type`, `scope`, `keywords` and friends are **NULL on every row** — the tag pass wrote
`tags.db` and nothing merged it back. Read them from `tags.tags`, which is what `rfp search` does:

```sql
select c.id, c.title, (select t.work_type from tags.tags t where t.id = c.id) as work_type
from corpus c where c.abc between 1000000 and 5000000
```

**Trap — `bm25()` inside a GROUP BY errors.** FTS5 refuses an auxiliary function once the planner
flattens a subquery into an aggregate: `unable to use function bm25 in the requested context`.
`MATERIALIZED` does not help. An inner `LIMIT` does, because it forces the subquery to be
materialised:

```sql
-- WRONG: "unable to use function bm25 in the requested context"
select d.notice_id, min(bm25(doc_fts)) from docs.doc_fts
  join docs.documents d on d.blob_id = doc_fts.rowid
  where doc_fts match 'slump' group by d.notice_id

-- RIGHT: inner LIMIT materialises, then aggregate
select notice_id, min(score) from (
  select d.notice_id, bm25(doc_fts) score from docs.doc_fts
    join docs.documents d on d.blob_id = doc_fts.rowid
    where doc_fts match 'slump' limit 100000
) group by notice_id
```

Un-aggregated `bm25()` over an attached FTS table is fine, and so is `distinct notice_id` with no
score at all. `rfp selfcheck` pins both halves of this, so a SQLite upgrade that changes the
behaviour fails there rather than in your query.

### `rfp search "<query>" [filters]`

FTS5 match + filters, reranked by the profile prior in `profile.md`, formatted to ~48 estimated
tokens per hit. Output:

```
[53340] P29.7M 16d Pampanga PB fit1.00 @att
  Basic Infrastructure Program BIP Multi Purpose Buildings Facili…
  DPWH - PAMPANGA 3RD DEO | civil_works
  DO 011 s2017.pdf: …**Slump Test** Set Slump Cone,Comp…
```

`[id] ABC days-to-close province mode fit @where-it-matched` / title / agency + work_type +
per-lot range / evidence snippet. A leading `~` on the province means **inferred from the agency
name, not stated on the notice** (see "Geography" below).

**`@` is provenance — which index the hit came from.** This is what makes the ranking auditable
instead of a vibe, so read it before trusting a hit:

| code | matched in | code | matched in |
|---|---|---|---|
| `ttl` | notice title | `desc` | notice description (mostly RA 12009 boilerplate) |
| `scope` | Luna's distilled scope/keywords | `items` | line items |
| `att` | **an attached document** | `cat` `agcy` `loc` `ref` | category / agency / location / solicitation no. |

`@ttl+scope+desc+att` is a notice that matched everywhere; `@att` alone means **the term appears
nowhere in the notice — only inside its attachments**, and the evidence line names the file it
came from. An `@att` hit always carries a blob behind it (asserted in `selfcheck`).

`fit` is a multiplier in [0.20, 1.00] and hits carry their demotion reason in parentheses —
`(lot fits: P27K-P54K lots in a P153K notice)`, `(stretch: P40M vs your P5M band)`,
`(tight: 2d vs your 5d)`. **Nothing is ever hidden by the profile**, only demoted and annotated.

Filters: `--abc-min --abc-max --strict-abc --province --province-strict --work-type --mode
--mode-family --agency --classification --source --days-min --days-max --closing-before
--closing-after --include-closed --include-unenriched -n/--results --min-days --band
--no-profile --no-snippet --no-doc-text --no-tag-text --budget -v --json`.

`--no-doc-text` turns the attachment channel off, `--no-tag-text` the distilled one; both exist
to measure what each channel contributes, not for routine use. `--json` adds `matched_in`,
`doc_snippet` and `doc_name` per hit.

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

Full description, line items (table header stripped), contact, funding, URL, and the **list of
attached bid documents** — `#doc_id name fmt bytes pages chars extract_status`, plus a
`[SUPPLEMENT: uploaded after posting]` marker and a warning when a PDF's pages are image-only
(no OCR was run, so its text is partial).

Document **text is opt-in**, because the median attached document is 56,276 chars and one notice
carries up to 40 of them:

```
rfp show 54984                       # list the documents
rfp show 54984 --doc-text            # print all of their text
rfp show 54984 --doc-text 9599       # print one document, by doc_id
rfp show 54984 --grep "bill of quantities|estimate"   # only matching lines, +/-1 line of context
```

`--doc-chars N` caps each document (default 6000, `0` for all), `--chars N` caps the notice's own
description/items, `--no-docs` suppresses attachments entirely, `--json` for structure.

**`--grep` is the one to reach for on a big ITB.** A 200-page bid document has one paragraph you
care about; printing the other 199 pages to find it is how you burn a context window.

### `rfp profile` · `rfp stats` · `rfp selfcheck` · `rfp build` · `rfp reindex`

`profile` prints the resolved profile and what its regions expand to, and warns about
`categories` values outside the work_type enum. `stats` re-measures every number in this file.
`selfcheck` runs 38 asserts (~10s). `build` regenerates `corpus.db` from `tenders.db` +
`legacy.db` + `tags.db` and refuses to overwrite an existing one without `--force`.
`reindex` rebuilds `tag_fts` inside `corpus.db` from `tags.db` (22,068 rows, 0.2s) — run it after
any tag pass. It is the only subcommand that writes.

---

## Attachment text: three indexes, joined by notice id

The real scope of a PH government job is not in the notice. The description is ~2,086 chars of RA
12009 boilerplate; the specifications, the Bill of Quantities and the eligibility bars are in the
attached documents. Those are now searchable — as a **separate index**, deliberately:

| index | lives in | covers | rows |
|---|---|---|---|
| `corpus_fts` | corpus.db | title, description, items_text, category, agency | 22,080 |
| `tag_fts` | corpus.db | Luna's scope / keywords / deliverables | 22,068 |
| `doc_fts` | docs.db | extracted document text + human filenames, per blob | 8,337 |

**Why not one merged index** — three measurements, each on its own sufficient:

1. **Length asymmetry, 46×.** The median notice *that has attachments* carries 154,571 chars of
   document text against a 3,333-char mean notice body. One index means one term-frequency space,
   and the tail wags the dog: a 200-page ITB whose boilerplate annex repeats "generator" forty
   times would outrank a notice **titled** "Supply and Delivery of One (1) Generator Set".
2. **Structural source bias.** 17,795 of 22,080 notices (80.6%) can never carry attachment text,
   because legacy's document listing is auth-gated. Merged, any attachment-flavoured query
   silently becomes an mPhilGEPS-only query — failure by omission, invisible to the reader.
3. **Provenance is unrecoverable once merged.** One index cannot say whether a term came from the
   title or from page 47 of an annex, and `@att` is the whole point.

Scoring: each channel's BM25 is normalised to [0,1] **within its own channel**, then summed as
`notice + 0.45×attachment + 0.60×tag` and multiplied by the profile fit. Independent
normalisation is what stops bulk from deciding the ranking — a 200-page annex and a 40-char title
each top out at 1.0 in their own channel, so the *weights* decide, not the character counts. At
0.45 an attachment match can carry a notice into the results but **cannot displace an exact title
match**; `selfcheck` asserts exactly that on the arithmetic.

### Coverage — read this before concluding a notice has no documents

`docs.db` covers **4,285 mPhilGEPS notices** (10,407 documents, 8,337 distinct blobs, 554.8M chars
of extracted text). It covers **zero legacy notices**, and that is an access limit, not a fact
about the notices: `philgeps.gov.ph/Tenders/tender_doc_view/{id}/{id}` answers HTTP 200 with a
"Your session has been expired, please login in again" shell. The files themselves are public and
unauthenticated once you know the URL, but the *listing* that gives you the URL is gated and the
upload-epoch prefix is unguessable, so enumeration cannot substitute for it. **No credentials were
used and none should be.**

So `rfp show` distinguishes three states and you must too: documents listed · `crawled: status=…
— no attachments recorded` · `NOT CRAWLED for attachments`. 3,591 of 10,407 documents are
`no_text_layer` — scanned image PDFs with no OCR — so their text is genuinely absent, not missed.

### What attachment text actually bought — measured, and it depends entirely on the query

Notices reachable by notice text vs. notices reachable **only** through their attachments:

| query | notice text | +attachment-only | gain |
|---|---|---|---|
| `"slump test"` | 1 | **158** | ×159 |
| `backhoe` | 85 | **820** | ×10.6 |
| `"deformed steel bars"` | 24 | **105** | ×5.4 |
| `transformer` | 92 | 162 | ×2.8 |
| `software` | 201 | 306 | ×2.5 |
| `concrete` | 2,846 | 986 | +35% |
| `laptop` | 304 | 122 | +40% |
| `"solar street light"` | 252 | 23 | +9% |
| `"fire truck"` | 18 | 1 | +6% |
| `"medical oxygen"` | 27 | 1 | +4% |

**The pattern is the finding.** Attachment text transforms *specification-level* queries — a
material, a test method, a machine class, an eligibility bar — because that vocabulary lives in
the Bill of Quantities and the technical specs and is never in a title. It adds almost nothing to
*object-level* queries: if an agency is buying a fire truck, the title says "fire truck".

Ask the attachments what a job *involves*. Ask the notice what it *is*.

**Two honest caveats.** (1) All of this applies to 19.4% of the corpus — legacy is gated and dark,
and legacy is where the full-bid civil works lives, so the segment that would benefit most is the
one we cannot reach. (2) A huge recall number can be worthless: `"single largest completed
contract"` gains 2,303 notices, but that is 53.7% of every crawled notice — it is RA 12009
boilerplate, not a discriminator. BM25's IDF is what keeps such terms from polluting rankings;
the recall count alone would mislead you.

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
                 ^^ ALL NULL on corpus -- read them from tags.tags (see `rfp sql` above)
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
-- what is ACTUALLY being bought, from the attachments: notices whose bid documents specify a
-- material you supply, regardless of what the title says.  Add `and c.id not in (...)` against
-- corpus_fts to get only the ones notice-text search cannot reach.
select distinct c.id, c.abc, substr(c.title,1,44) t
from docs.doc_fts
join docs.documents d on d.blob_id = doc_fts.rowid
join corpus c on c.id = d.notice_id and c.source = d.source
where doc_fts match '"deformed steel bars"'
  and c.enriched_at is not null and c.closing_at > datetime('now','+8 hours')
limit 20;

-- which notices carry a real (text-bearing) bid document vs a scanned image with no OCR
select b.extract_status, count(distinct d.notice_id) notices, count(*) docs
from docs.documents d join docs.blobs b on b.blob_id = d.blob_id
group by 1 order by 2 desc;

-- the biggest jobs whose documents we actually hold text for -- where scope reading pays off
select c.id, c.abc, sum(b.chars) doc_chars, count(*) ndocs, substr(c.title,1,40) t
from corpus c
join docs.documents d on d.notice_id = c.id and d.source = c.source
join docs.blobs b on b.blob_id = d.blob_id
where c.abc > 20000000 and c.enriched_at is not null
group by c.id order by doc_chars desc limit 10;

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
- **ATTACH must happen BEFORE the authorizer is armed.** The authorizer denies `SQLITE_ATTACH` —
  that is what closes the `attach 'writable.db' as w; insert into w…` hole. Arm it first and you
  also lock yourself out of `docs.db` and `tags.db`, and search silently loses two of its three
  channels. Attach the three intended files (each `?mode=ro` in its own right — main's `mode=ro`
  does **not** propagate to attachments), *then* arm. Both directions are asserted.
- **`bm25()` dies inside a GROUP BY.** `unable to use function bm25 in the requested context`,
  and `MATERIALIZED` does not help. An inner `LIMIT` does. See `rfp sql` above for both forms.
- **`bm25()` also rejects a table alias.** `from docs.doc_fts f … bm25(f)` → `no such column: f`.
  Use the bare table name, and reference an attached FTS table as `from docs.doc_fts where
  doc_fts match …` (qualifying the MATCH as `docs.doc_fts match` fails too).
- **One blob belongs to several notices.** `docs.blobs` is deduplicated by sha256, so the same
  ITB posted by one PE under six refIDs is one blob with six `documents` rows. A doc-text hit
  must light up all of them — aggregate blob→notice, never assume 1:1.
- **Score a notice by its BEST matching document, never the sum.** Summing ranks by how many PDFs
  the BAC happened to upload (up to 40), which is packaging, not relevance.
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

```
        notice_bm25/max   +   0.45 × attachment_bm25/max   +   0.60 × tag_bm25/max
score = ───────────────────────────────────────────────────────────────────────────  × profile_fit
                        1 + 0.45 (if any doc hit) + 0.60 (if any tag hit)
```

descending, ties broken by soonest closing. Each channel is normalised **within itself** before
weighting — that is what keeps a 200-page PDF and a 40-char title comparable. A channel that
produced no hits drops out of the divisor, so a pure notice-text search scores exactly as it did
before attachments existed.

The weights encode one rule: **an attachment match can surface a notice, but cannot outrank an
exact title match.** Perfect title hit → `1/1.45 = 0.69`; perfect attachment-only hit →
`0.45/1.45 = 0.31`; both → `1.0`. `selfcheck` asserts the ordering rather than trusting the
arithmetic to stay right.

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

~2.2K tokens for 40 search hits (measured 54.8–56.1 estimated tokens/hit across six queries at 40
hits, hard cap 78/hit; `-v` prints the count). Provenance costs ~3 tokens/hit and is worth it.
~356 tokens for `facets`.

**`show --doc-text` is the expensive call and the only one that can blow a context window.** The
median attached document is 56,276 chars and the largest in the corpus is 2.27M; a notice can
carry 40 of them. List first, then `--grep`, then read one document by `doc_id`. The default
6,000-char cap per document exists for this reason.

Latency, measured: attachment search adds **~0.16s** to a search (1.38s → 1.54s on a 3-term
query); the attachment FTS probe itself is 3–22ms and the five provenance probes are <1ms each.
A whole session — facets, a dozen searches, ten `show` calls — lands around ₱0.02 at Luna prices,
and is **invariant to corpus size**.

Token figures are an estimate (`max(chars/3.5, words)`), not a tokenizer. tiktoken is not
installed and this tool will not grow a dependency to print a number. The estimate is deliberately
pessimistic for ALLCAPS agency names, so a real tokenizer should come in at or under it.

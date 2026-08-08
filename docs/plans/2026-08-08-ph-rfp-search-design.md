# PH Government RFP Finder — Search Design

**Status:** design approved 2026-08-08, ingest built, tagging piloted, search layer not yet written.
**Scope of this doc:** the *search* half only. UI is someone else's job. Cron, alerts, and the daily
feed are explicitly out.
**Predecessor:** `research/ph-rfp-spike/DECISIONS.md` (spike findings; corrected 2026-08-08 pm).

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

**Explicitly out of scope:** the UI, cron/scheduling, email alerts, the daily feed, Annual
Procurement Plans, award history, and attached bid documents. Each is a separate piece of work; see
"Deferred, in priority order".

---

## Measured facts this design rests on

All measured 2026-08-08 unless noted. Numbers that contradict `DECISIONS.md` are corrected there too.

- **Corpus: ~22,145 open notices** = 4,300 mPhilGEPS + 17,845 legacy PhilGEPS 1.5.
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
rfp merge        both + source + dupe_key         → corpus.db      [to build]
rfp tag          Luna, once per notice            → tag columns    [piloted as tag.py]
rfp search/sql/show/facets    the model's tools                   [to build]
SKILL.md         how the model drives rfp                          [to build]
profile.md       the prior                                         [to build]
```

Five files total. `merge` and `tag` are subcommands rather than scripts because nothing else calls
them.

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
min_days_to_close: 5
never: [security_janitorial, food_catering]
```

Plain YAML in a markdown file, hand-edited. No profile builder, no wizard.

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

1. Pick a slice small enough to fit in context: one work_type × one province, ~300 notices.
2. Put the whole slice in an expensive model's context with a real query. That output is ground truth.
3. Run B+C on the same query, scoped to the same slice.
4. Report **recall against the oracle**, and for each miss, which query expansion failed.

Ten real queries is enough to know whether this works. Run it after the first full tag pass, and
again any time the tag vocabulary changes.

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

**Dedupe.** `source` column plus `dupe_key = sha1(norm(PE) | closing | norm(title)[:80] | abc)`.
Collisions get flagged for review, never auto-merged. ABC must be in the key — one BAC posts many
identically-titled notices under a single deadline, so PE+closing+title false-merges. Dedupe runs
*post*-enrichment, since ABC only exists after the detail fetch.

**Nulls are real.** `closing` is nullable: mPhilGEPS page 215 is a junk drawer with notices published
Jun-2024 and 12 rows with blank closing dates, and 12 notices serve permanent HTTP 500s. Every read
path tolerates null; `fetch_errors` caps retries at 3 so broken notices don't poison the queue nightly.

**Never trust a site's own total** as a termination condition. Legacy's "17,845 opportunities found"
label undercounts — the pager renders rows past it. Terminate on enumerated rows running out.

### Data hazards the search layer must handle

Measured over the full 4,300-notice mPhilGEPS snapshot. Each of these silently returns wrong results
if ignored — they fail by omission, which is the failure mode no user reports.

- **`location` is comma-multi-valued on 71 rows** (`'Batangas,Laguna,Quezon,Rizal'`), 143 distinct
  values, top is Metro Manila at 418. A region filter must split on comma, never compare for
  equality — `location = 'Laguna'` misses every multi-province notice.
- **`location` is null on 12.2%** (523 rows), verified genuinely empty on the page, not a parse
  failure. So geography is missing for 1 in 8 mPhilGEPS notices. Legacy's `Area of Delivery` is a
  clean province field, so geographic ranking is *stronger* on the 81% of the corpus that is LGU
  work — which is also where "near me" matters most.
- **`abc` is null on 27 rows, some published as recently as 2026-08-08.** Not an old-template
  artifact; some live notices simply omit ABC. `where abc <= X` silently drops them. Per S3, null-ABC
  notices **surface with an `abc: not stated` marker and a demotion**, never disappear.
- **`items` retains its header row**, so every notice contains the literal `Lot Description`,
  `Unit of Measure`, `UNSPSC`. Strip when building the FTS index or those words match every query.
- **`mode_norm` collapses casing but not legal modes.** `public bidding` (10) and `international
  competitive bidding - others` (10) are distinct strings from the 2,992-row competitive bidding
  bucket and must stay distinct — they're different procurement rules, not typos.
- **12 zombie notices** (ids 2208–2239) serve permanent HTTP 500s and retire at `fetch_errors = 3`.
  They carry no closing date, so they'd sort first under a naive `order by closing_at`.

---

## Testing

Each script keeps one runnable `selfcheck()` with `assert`s, no framework:

- `ingest.py test` — listing and detail parsers against saved HTML shapes, **including the
  empty-field case**. That case is the whole reason it exists: the original parser took "the next
  line" when a value was empty, so a missing field silently became the next field's *label*.
  `location` was corrupt on 13% of notices and the capture rate read 100%. A parser test that only
  checks populated fields would have passed.
- `tag.py test` — boilerplate stripping, item-header removal, keyword normalization.
- `rfp` — one test that `sql` refuses a write, and one that `search` output stays inside its token
  budget.

---

## Deferred, in priority order

1. **Attached bid documents.** `Documents` / `Bid Supplements` labels appear on 69 of 69 detail pages
   sampled and are entirely untouched. The description is boilerplate; the real scope, specs, and
   terms of reference are in the attachments. This is where C's tags would get their best signal, and
   no competitor surfaces it. Highest-value next spike.
2. **Annual Procurement Plans**, browsable to 2027 — months of lead time before an ITB exists.
3. **Award history.** Legacy award notices are ungated with peso amounts (rolling 100 most recent),
   which contradicts DECISIONS' claim that no free 2026 award data exists. Award prices are how you'd
   learn an agency's real price behaviour versus its posted ceiling.
4. Cron, alerts, the daily feed, and the UI.

---

## Open questions

1. **Willingness to pay** — still the real experiment, still untested at any price. Unchanged from
   DECISIONS, and nothing in this design answers it.
2. **Does the software finding change the target user?** ~60–70 live dev contracts nationally is a
   thin market. Civil works is 25–50% of the board. If the pitch is aimed at software firms, the
   addressable pool may be too small to matter.
3. **Legacy detail-page text size** — unmeasured, and legacy is 81% of the corpus. Fatter pages push
   the tagging pass toward ₱900; thinner pages make it cheaper but the tags less reliable.
4. Whether Luna is strong enough for PCAB/RA 12009 eligibility reasoning, or that one call escalates
   to Terra. Unchanged from DECISIONS; the pilot's `eligibility` output looked sane but wasn't
   checked against the statute.

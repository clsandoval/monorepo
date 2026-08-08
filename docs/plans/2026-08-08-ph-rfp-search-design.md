# PH Government RFP Finder — Search Design

**Status:** design approved 2026-08-08, ingest built, tagging piloted, search layer not yet written.
**Scope of this doc:** the *search* half only — plus the user journeys, because they're what the
search layer is answerable to. UI is someone else's job. Cron, alerts, and the daily feed are out of
scope but journey 2 depends on them; see "Deferred".
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

**Explicitly out of scope:** the UI, cron/scheduling, email alerts, the daily feed, Annual
Procurement Plans, award history, and attached bid documents. Each is a separate piece of work; see
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

1. **Alerts — the highest-risk deferral in this document.** Journey 2 is the product, and we are
   shipping without alerts, betting on the user opening the tool daily by their own discipline
   against a corpus where 59.4% closes within 6 days. A user who checks weekly gets a fraction of
   the value and concludes the product doesn't work. First Circle's dead Project Finder *had* daily
   and weekly keyword email alerts — it died of organizational misalignment inside a lender, not
   because alerts were unnecessary, so its death is not evidence we can skip them.
2. **Attached bid documents.** `Documents` / `Bid Supplements` labels appear on 69 of 69 detail pages
   sampled and are entirely untouched. The description is boilerplate; the real scope, specs, and
   terms of reference are in the attachments. This is where C's tags would get their best signal, and
   no competitor surfaces it. Highest-value next *spike* (alerts above are a build, not a spike).
3. **LGU registry.** Normalized ~1,600 LGUs — canonical names, aliases, province/region hierarchy,
   PSGC codes, district engineering offices — joined to every notice. `competitors.md` argues this is
   the most defensible gap on the board, and that the moat is normalization labour, not code: the only
   product that scraped LGU websites outside PhilGEPS (First Circle) is dead with no replacement, and
   the only LGU-sliced dataset ever published (OCDex) froze in 2019. It's also the substrate for geo
   ranking, which matters most on the 81% of the corpus that is LGU work.
4. **Annual Procurement Plans**, browsable to 2027 — journey 6, months of lead time before an ITB
   exists.
5. **Award history.** Legacy award notices are ungated with peso amounts (rolling 100 most recent),
   which contradicts DECISIONS' claim that no free 2026 award data exists. Award prices are how you'd
   learn an agency's real price behaviour versus its posted ceiling — journey 4's missing half.
6. Cron, the daily feed, and the UI.

---

## Open questions

1. **Willingness to pay** — still the real experiment, still untested at any price. Unchanged from
   DECISIONS, and nothing in this design answers it.
2. **Which user type is primary — contractor or supplier?** They want opposite things from the same
   corpus (3 examined vs 40 triaged) and the answer sets the default `results`, the ranking weights,
   and which journey gets built past 0. Suppliers are the larger segment (~72% of notices); contractors
   have more revenue per bid. Unresolved, and `results` in `profile.md` is the seam that defers it.
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
   to Terra. Unchanged from DECISIONS; the pilot's `eligibility` output looked sane but wasn't
   checked against the statute.

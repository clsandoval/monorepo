# PH RFP finder — where things stand, 2026-08-09

## Session update, 2026-08-09 pm

- **#148 brief pipeline exists**: `brief.py` renders one firm's 2-page PDF end to end
  (`python3 brief.py "AVZ CONSTRUCTION & SUPPLY"`). Matcher: province + civil_works +
  0.2–2.2× their biggest award, ranked by size-proximity, exact-archetype capped at 6/10 so
  the widening shows (#145). Run for 1 of 47 firms; eligibility still comes from notice tags,
  **not docs.db** — that wiring is the next real backend task on #148.
- **UI handed off.** Style 11 locked, red-vs-blue open behind `--accent`. Prototype +
  contract in `proto/` (see `proto/HANDOFF.md`). Do not do UI work here.
- **Search speed measured**: ~0.15s per CLI search cold-process (~ms for the query itself);
  `facets` 1.19s is the only slow verb.

Everything below is committed and reproducible. Start here in a fresh session.

## Run it

```bash
cd apps/rfp
bash daily.sh [--no-docs] [--no-tag]    # full day's ingest; exit 3 = a guardrail stopped work
python3 rfp search "drainage" --province Cavite --results 40
python3 rfp facets "construction"
```

No expiry step exists on purpose: `corpus_state` is a view computing state from `closing_at`
against Manila time, so notices expire on their own and nothing is deleted. Filter `state='open'`.

## What exists

| | |
|---|---|
| corpus | **22,324 notices**, both PhilGEPS systems, ₱207B open value |
| attachments | 4,285 mPhilGEPS notices, 9,875 docs, 555M chars. Legacy is auth-gated |
| tags | all notices tagged by Luna. **₱318.93 spent of a ₱1,000 cap** |
| awards | 1,580 award records, 1,214 companies, 153-firm shortlist |
| contacts | 39 confirmed phone numbers, 8 websites |
| search | `rfp` CLI. **Recall 0.91 natural / 1.00 with Luna expansion** |
| disk | 3.0 GiB of a 60 GiB cap, **272 days runway**, cap trip alerts + exits 3 |

## Read these first

- `docs/plans/2026-08-08-ph-rfp-search-design.md` — the design, with a corrections block
- `NIGHT-REPORT.md` — the overnight run: what landed, what broke, what it cost
- `research/ph-rfp-spike/philgeps-eda-2026-08-09.pdf` — 12-exhibit EDA of the whole corpus
- `NOTES-awards.md` — the award ASMX layer and its traps
- GitHub issues **#140–#147**

## The five findings that should drive decisions

1. **Value is pathologically concentrated.** Gini 0.863. Top 10% of notices = 80% of value;
   the bottom half = 1.8%. "Serve contractors" is not a specification.
2. **62.1% of deadlines fall Monday or Tuesday morning.** The product is a *Friday brief*, not a
   daily feed. This is the strongest product-shape finding in the whole project.
3. **60% of firm archetypes have exactly one open notice.** The churn risk is an empty feed;
   deliberate widening is the product, not filtering.
4. **Attachments moved recall by zero.** 17.4 GB fetched, +0 notices found. They are an
   *eligibility* asset (0.12 → 2.40 requirements/notice), not a discovery one.
5. **Discovery may be worth least where the money is.** Outsider win rate is 38–40% at ₱100K–5M
   but **0 of 5 above ₱5M**. n=5, unresolved, and it contradicts the targeting in #142.

## Do this next

**#140 — willingness to pay. Nothing else matters until it moves.** It has been open since the
spike and every session has found a reason to build instead. There are now 39 callable
contractors in `philgeps-prospects.xlsx`; the experiment needs 5–10 conversations.

Cheap and genuinely useful if you want code work instead:

- **Re-sample the prospect list to ONE province.** The 153 are scattered across ~15, so a single
  Friday brief cannot serve them. `python3 awards.py recent N` then filter.
- **Capture `Reason For Award`** — it is on the public award page (`LOWEST RESPONSIVE BID`) and we
  do not store it. Distinguishes competitive wins from defaults.
- **Resolve the Registered Merchants search** (`POST /CmsHomePages/regMerchants`) for a real
  denominator on the addressable market. Chao1 says ≥8,900 firms at 20% coverage; useless as a bound.

## Traps already paid for — do not rediscover

- ASMX award endpoints need `Content-Type: application/json` **on a GET**. Without it everything
  looks auth-gated and isn't.
- `BidderListCount` counts award recipients, not bidders. "100% single-bidder" is a wrong number.
- One procurement = one award row **per line item**. Count distinct procurements or every
  concentration metric lies.
- Legacy out-of-range pager offsets re-serve page 1, so "stop when rows run out" never terminates.
- FTS5 ANDs bare multi-word queries. `vehicle spare parts repair` matched 48 of 22,068.
- Detail fields must be parsed as labelled key/value, never line adjacency.
- `local code=$?` and `if ! cmd` both yield 0 in bash. Three silent-success bugs came from this
  family; every guardrail here now fails loudly on purpose.

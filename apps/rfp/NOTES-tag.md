# Tagging pass — what was spent, what it bought, what it didn't

**Run:** 2026-08-08 overnight. **Code:** `tag.py` (selfcheck: `python3 tag.py test`).
**Ledger:** `spend.json`, written after every batch from the API's own `usage` block.
**Design:** `docs/plans/2026-08-08-ph-rfp-search-design.md` §"The tag schema (approach C)".

## Spend

| tier | notices | ₱ | ₱/notice | what it reads |
|---|---|---|---|---|
| base | 22,068 (100%) | 250.48 | 0.0113 | title + listing + stripped detail description + line items |
| doc | see `spend.json` | ~0.13–0.20 each | 0.13–0.20 | the attached bid documents, block-selected |

Cap ₱1000, enforced in code against the ledger file (not a variable) before every batch, with an
flock so two tag.py processes cannot lose each other's spend. **The cap was never the binding
constraint** — attachment availability was. See "What was deliberately not bought".

Base pass: 2,210 batches, **0 failed**, 8.46M input / 2.19M output tokens. Output is 26% of the
tokens and **51% of the cost** — S6's "terse tags are the cost control" is confirmed, not folklore.

## Open question 4 from the design doc is answered: legacy is CHEAPER, not fatter

The doc worried legacy's unmeasured detail pages "push the tagging pass toward ₱900". Measured:

| | notices | payload chars/notice | ₱/notice | total |
|---|---|---|---|---|
| mPhilGEPS | 4,288 | 1,525 | 0.0127 | ₱54 |
| legacy | 17,780 | 1,230 | 0.0117 | ₱209 |

Legacy descriptions are *thinner* (median 1,855 chars vs 2,507) and carry no line-items column.
The two 200-notice mPhilGEPS pilots extrapolated to ₱262–279; the actual full-corpus number is
**₱250.48**. The extrapolation was good to 5%.

## A bug the pilot shipped and nobody saw

`keywords()` did `" ".join(kw)`. When the model returned keywords as a **string** instead of an
array, that joined *characters*: `feasibility study` → `f e a s i b l t y u d h g w n r v o c`.
**173 of the 337 pilot rows (51%) were destroyed this way** and the column looked populated.
`rfp build` had already grown a defensive filter for it ("character-shredded"), which is the tell
that a downstream consumer noticed the symptom without anyone chasing the cause.

Fixed in `keywords()` (str → single element, nested lists flattened, single letters dropped) with
three asserts in `selfcheck()`. Post-fix count of shredded rows in 22,068: **0**.

## Tier 2: what paying to read the document actually buys

Population, by the design's own value logic: **ABC ≥ ₱5M AND description is boilerplate-only**
(what survives boilerplate stripping, plus line items, is under 300 chars). That is exactly where
the attachment is the *only* scope signal. Highest-ABC-first. Then widened down the ABC ladder to
all boilerplate-only notices with attachments, because budget remained and the criterion that makes
a doc read valuable is the blank description, not the price tag.

Measured on 424 notices holding **both** a base tag and a doc tag:

| | base (description only) | doc (bid documents) |
|---|---|---|
| work_type agreement | — | 88% agree |
| needs_pcab agreement | — | 90% agree |
| scope length | 79 chars | 125 chars |
| keyword length | 49 chars | 95 chars |
| **eligibility items/notice** | **0.12** | **2.40** |

**Eligibility is the headline, not keywords.** A description-only pass finds essentially no
special eligibility requirements — 0.12 per notice — because they are not in the description.
They are in the bid documents, and the doc pass finds 2.40 per notice. That is journey 4 ("can I
actually win this?"), and it was empty before tonight.

64% of doc-tier keywords (3,486 of 5,409) appear **nowhere** in the notice's own text — `tetrapod`,
`geotextile tube`, `MSE retaining wall`, `sheet piles`. 420 of 424 notices gained ≥1 new term.

The worked example: notice **50936**, ABC **₱1.81 billion**, whole description
`Please see attached file for reference. ***nothing follows***`. Base tag guessed from the title
("End-to-end workforce services"). Doc tag: *"Provision of 1,709 sales and customer support
assistants to Pag-IBIG offices nationwide for two years"*, wage floor ₱1,276.70/day, eligibility
`PhilGEPS Platinum Membership · similar SLCC with completion proof · NFCC or committed line of
credit`.

### Making the 44k-char window count

Naive truncation spends the window on the GPPB's model-document foreword. Three stages, each
measured:

1. **df line-stripping over attachment text** (8% cutoff, sampled over 200 blobs): keeps 33% of
   characters. The top-df lines are exactly the standard PBD table of contents.
2. **Intra-notice line dedupe**: kills running headers/footers repeated once per page.
3. **Block scoring** (`block_score`): 2,000-char blocks ranked by anchor phrases + unit words +
   digit density, minus legalese and the PBD glossary; the top blocks are re-assembled in reading
   order. Verified by eye on notice 41731, where 111k chars survived stripping and the first 1,400
   were still the foreword.

Cost stayed at ₱0.13–0.20/notice. **The window was deliberately not widened** past 44k chars: the
deliverable is a ≤240-char scope and ≤6 deliverables, the selector already hands over the best
blocks, and doubling the window doubles the bill for text the answer doesn't use.

## What was deliberately NOT bought

- **Attachment full-text search.** `docs.db` already carries `doc_fts` over the extracted text.
  Verified: `tetrapod` → 1 hit, `geotextile` → 15 hits, free. Tier 2 was never justified as term
  recall — the index does that better. It is justified by the scope sentence, the deliverables,
  and the eligibility list, none of which an index produces.
- **Doc-tagging high-ABC notices that already have a real description.** 755 mPhilGEPS notices are
  ABC ≥ ₱15M; most describe their own scope. FTS5 over the notice covers them. Paying a model to
  re-read what is already indexed is the exact spend the brief warned against.
- **Legacy attachments.** `docs.db` is mPhilGEPS-only, so tier 2 can structurally reach at most 19%
  of the corpus. Legacy is 81% of the board and 17,780 notices. This is the largest remaining gap
  and it is a *scraping* gap, not a budget one.
- **The eval oracle** (design S7). Needs an expensive model on a ~300-notice slice; different
  budget line, not this one.

## Data hazard found while spot-checking: multi-contract ITBs

Legacy notice **13130808** is titled contract `26D00050` (Carmona–Biñan Diversion Road) but its
description is one DPWH regional Invitation to Bid covering **five** contracts — `26D00008`,
`26D00016`, `26D00028`, `26D00045`, `26D00050` — and the *first* block in it is a different
project in Quezon Province.

Measured: **219 of the 1,105 legacy notices that mention a Contract ID name more than one distinct
contract** (~1.2% of the legacy corpus).

Consequence for the search layer: FTS5 over `description` returns these notices for terms belonging
to a *sibling contract* — wrong province, wrong scope, individually plausible. The tag columns are
cleaner here than the description is, because the model anchors on the title: 4 of 5 sampled kept
the right contract. The 5th (13143093) generalised across the bundle. So this hazard costs roughly
0.4% of the corpus in scope accuracy, and it argues for ranking `scope`/`keywords` above
`description`, which `FTS_WEIGHTS` already does.

## Spot-check verdict

10 random base-tier tags read against their source notices (`python3 tag.py spot 10 base 7`):
**9 correct, 1 half-correct**, and the half-correct one is the multi-contract ITB above — a data
defect, not a tagging defect. Two were cases where the tag is the *only* usable summary: notice
`13162984`'s title is the bare string `5029902000-987-2026`, and notice `53986`'s description is
pure RFQ boilerplate with the real answer (3,618 folder kits) only in the line items.

## Operational

- `tags.db` holds `tags` (best tag per notice — a doc tag never gets overwritten by a base tag)
  and `tag_runs` (every tier's raw output, so the two can be diffed; that diff is the table above).
- Keyed by native notice `id`. mPhilGEPS 2208–55594 and legacy 12535432+ are disjoint, and
  `corpus.db` asserts `unique(id)`.
- **`rfp build --force` is required for any of this to reach search** — `work_type`, `scope` and
  `keywords` are FTS5-indexed columns, so tags written after a build are invisible until rebuilt.
  Verified into a scratch DB: 22,068/22,068 notices tagged, 22,068 with keywords, 0 shredded, and
  `corpus match 'tetrapod'` returns notice 54355 whose own text never contains the word.
- Resumable: re-running skips anything already in `tag_runs` for that tier. The full pass left 21
  notices untagged on the first sweep (model returned fewer objects than sent, no error); a second
  run picked up exactly those 21 for ₱0.24.

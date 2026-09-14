# NOTES-eval — search recall against a hand-read oracle

Run 2026-08-09 against `corpus.db` as built that night (22,080 notices, all 22,068 tagged,
docs.db holding 4,285 mPhilGEPS notices' attachments). Harness: `eval_recall.py`
(`selfcheck` / no arg / `depth`), oracle: `eval_gt_cavite.json`, raw output:
`eval_results.json`, `eval_results_depth.json`. This is locked decision **S7** finally
executed — approach A surviving as an eval oracle on a slice.

No Luna calls. The oracle is a full manual read of the slice, which is what makes the number
meaningful: it is an exhaustive read compared against the tool's output.

## The slice

489 notices — every notice with `notice_location.location_norm = 'CAVITE'`. 412 legacy,
77 mPhilGEPS. Dumped with title, agency, ABC, closing date, category and line items, and read
end to end.

**Defined by geography alone, never by `work_type`.** A `work_type × province` slice would have
made tag errors invisible: a mistagged notice falls out of the slice instead of showing up as a
miss, and the eval would then "prove" that tags help. Geography-only keeps every tag error
inside the measurement.

## The five queries and the oracle

| | query (a real bidder's words) | ground truth |
|---|---|---|
| Q1 | drainage / canals / canal lining / declogging | 14 |
| Q2 | solar streetlight installation | 26 |
| Q3 | classroom + school building construction | 16 |
| Q4 | CCTV supply and installation | 10 |
| Q5 | vehicle + heavy-equipment parts and repair | 25 |

91 labels. **All 91 are legacy notices** — not a sampling artifact, it is what the Cavite board
is: LGU works and supply, which live on legacy, which is 81% of the corpus.

Each query was run in two forms: `natural` (what a user types) and `expanded` (the explicit OR
of variants SKILL.md tells the driving model to write).

## Recall

Micro = notices found / 91. Macro = mean of the five per-query recalls.

| config | micro | macro |
|---|---|---|
| **natural, profile as shipped (`results: 3`)** | **11/91 = 0.12** | 0.15 |
| natural, n=40 | 48/91 = 0.53 | 0.60 |
| natural, n=200 | 53/91 = 0.58 | 0.67 |
| expanded, n=40 | 62/91 = 0.68 | 0.73 |
| expanded, n=40, `--province-strict` | 86/91 = 0.95 | 0.96 |
| expanded, n=40, `--province-strict --no-profile` | **91/91 = 1.00** | 1.00 |
| expanded, n=200 (any ablation) | 91/91 = 1.00 | 1.00 |

Per query, as shipped (natural wording, `results: 3`): Q1 3/14 · Q2 3/26 · Q3 1/16 · Q4 3/10 ·
Q5 1/25.

**Retrieval is not the problem. Query formulation, the province filter's null-location policy,
and the result cut are.** Every one of the 91 is reachable from notice title/description/items
text alone; nothing needed attachments or tags to be *findable*.

## Why the misses happened, in order of damage

**1. FTS5 reads a bare multi-word query as an implicit AND (worst, and cheapest to fix).**
`vehicle spare parts repair` matches **0 of 489** notices in the slice. `vehicle` alone matches
40. `"spare parts"` matches 0 — this corpus writes "Parts and Materials" and, once, "Spareparts".
So the natural phrasing of Q5 returns nothing from notice text; the single hit the user sees came
from the tag channel. `relax()` in `rfp` already does exactly the right thing (rewrites to an OR
of quoted barewords) but it is only wired to `sqlite3.OperationalError` — a *syntax* error. A
syntactically valid query that ANDs itself down to zero rows never triggers it.
**Fix: fall back to `relax(q)` when the match returns zero (or near-zero) rows, and say so in a
note.** One condition. Q5 natural goes from 1/25 to the expanded number.

**2. `--province X` spends most of the result budget outside X.** The province filter keeps
notices with no stated location on purpose (8.7% corpus-wide) — that is the right call, dropping
them is the omission bug. But they then compete for the same forty slots at fit 0.85, and BM25
does not know they are in the wrong province. Measured over the five expanded queries at n=40:
**only 82 of 200 returned rows were in Cavite; 113 of the 118 others had no stated location at
all.** Adding `--province-strict` moves macro recall 0.73 → 0.96. Cost of the current default:
**~24 recall points.** The fix is not to drop the nulls, it is to stop letting them crowd the
named province — cap them at a fraction of the slots, or demote much harder than 0.85 when the
province was named explicitly rather than inherited from the profile.

**3. Multiplicative `profile_fit` collapses to the 0.20 floor and buries exact matches.** On Q5
with `--province-strict`, the profile *costs* 20 points (0.80 vs 1.00 without it). Notice
`13171857` — "Parts and Materials for the Repair and Maintenance of Various Heavy Equipment",
₱188K, closing in 1 day — scores `below band: P188K vs your P200K floor` × `tight: 1d vs your 5d`
× `off-category: vehicles_parts` = **0.20**, the same fit as a notice in the profile's `never`
list. It is 6% under the band. Three mild demotions multiply into a hard exclusion, which is
exactly what S3 says must not happen. Suggest a floor per *signal*, or a cap on the total number
of independent demotions, or ignoring `abc_band` within ~15% of the boundary.

**4. Orthography splits the vocabulary and nothing bridges it.** `streetlight` matches 21 slice
notices, `"street light"` matches 5, and the union is 26 — no overlap at all. The porter
tokenizer stems `streetlights → streetlight` but cannot join two tokens into one. Same class:
`canal` (6) vs `drainage` (21) for what a bidder calls one trade. This is what the `keywords` tag
was supposed to fix and mostly does not, because the tagger echoes the notice's own wording.

**5. Ranking below the cut, not retrieval.** Q1's canal-materials notices and Q3's BEFF classroom
batches are retrieved at n=200 but sit below n=40 behind out-of-province rows. Once
`--province-strict` is on, every one of them is inside the top 40. So this is mechanism 2 wearing
a different hat, not an independent problem.

No miss in the whole run was caused by a wrong `work_type` tag.

## Does attachment text or do the Luna tags move recall?

Measured by ablation at n=200, no profile, so the only thing varying is which text channels the
search may use.

| channel set | natural micro | expanded micro |
|---|---|---|
| FTS5 over title/description/items only | 49/91 = 0.54 | 91/91 = 1.00 |
| + Luna tag scope/keywords | **53/91 = 0.58** | 91/91 = 1.00 |
| + attachment text | 49/91 = 0.54 | 91/91 = 1.00 |
| both | 53/91 = 0.58 | 91/91 = 1.00 |

**Attachment text moved recall by exactly zero notices, in all ten query-runs.** The reason is
structural, not tuning: **0 of the 91 ground-truth notices have any attachment text, and only 74
of the 489 slice notices do.** `docs.documents` holds **0 rows for `source='legacy'`** — legacy's
document listing is behind supplier auth — and the Cavite board is 412/489 legacy. Attachment
text cannot help on the part of the corpus where the civil works is, until the legacy auth
question is answered, which it will not be by scraping harder.

It is worse than neutral at the top of the list. On the shipped default for Q5, three of the five
returned rows are out-of-province notices (Palawan, SEC, CAAP) promoted by an attachment matching
"Spare Part" in an mPhilGEPS bidding document — the attachment channel actively displaced the
in-province matches. Attachment relevance without a province gate is a precision leak that
becomes a recall leak once the cut is only 3 or 40 rows wide.

**Luna tags moved recall by +4 notices (+4.4pp micro) on natural queries and +0 on expanded
ones.** The four rescues are all the same shape: the tag supplies a synonym the notice title
never used — `13124928` ("CANAL LINING", tag keywords include *drainage*), `13180252`
("SOLAR STREET LIGHTS", keyword *streetlight* as one word), `13130937` ("VARIOUS CLASSROOMS",
keywords *school building*), `13172582` (the lone Q5 survivor). That is real and it is the
cheapest channel — ₱250 for the whole corpus, already spent, and it survives on legacy where
attachments do not. But it is a synonym patch on top of a query-formulation problem, and every
one of those four notices is also found by simply ORing the obvious variants.

**Verdict for the roadmap.** FTS5 over titles, descriptions and line items already gets to 1.00
on this slice, provided the query is an OR of variants, the cut is deeper than 3, and
`--province-strict` is on. Tonight's expensive work did not move the number: attachments +0,
tags +4 on 91 and +0 once the query is written properly. The next recall point is not in a new
data channel — it is in three small changes to `rfp` itself (zero-result relax fallback,
null-location crowding cap, per-signal fit floor), which together are worth roughly 0.12 → 1.00
on the queries measured here. Spend on those before spending on documents.

## Caveats, stated so the number is not over-read

- One province, five queries, 91 labels. Cavite is LGU-heavy and legacy-heavy; a mPhilGEPS-heavy
  or Metro-Manila slice would have far better attachment coverage (4,285 notices have documents,
  all mPhilGEPS) and could plausibly show a non-zero attachment contribution. **The finding is
  "attachments cannot help on legacy", not "attachments never help".**
- The oracle is my own exhaustive read, not a second model's. Borderline calls I made and
  recorded: canal *materials-supply* notices count for a drainage contractor; comfort-room and
  roofing repairs do **not** count as "school building construction"; the geotechnical
  consultancy `54460` does not count for a building contractor.
- Recall is scored over the whole returned list at the stated `-n`, not at a fixed k.
- Precision was not scored. It is visibly poor at n=200 (Q1 returns 68–76 slice rows against 14
  true ones) and that is by design; see the design doc.

## One reporting bug found in passing

`_fold_aux_channels` prints `attachment text matched N notices (M of them invisible to
notice-text search)` where `M = len(extra)` counts the union of the attachment *and* tag
channels. It routinely prints M > N — e.g. "matched 1689 notices (2521 of them invisible)".
Cosmetic, but the note is read by the driving model as evidence.

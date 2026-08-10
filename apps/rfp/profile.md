# profile — the prior

Hand-edited. There is no profile builder and no wizard: the first-run question is *what do you
build, where, and what size jobs*, and this file is the answer.

The profile is a **prior, not a filter** (locked decision S3). Nothing here removes a notice from
your results. Out-of-profile notices are demoted and annotated — `stretch: P40.0M vs your P5.0M
band`, `adjacent: Batangas`, `tight: 2d vs your 5d` — so you can see the ₱40M job you might
joint-venture on instead of never learning it existed. A hard filter's failures are invisible,
which is the one failure mode nobody reports.

```yaml
pcab: C                # PCAB licence class held, or null. Only used to demote notices tagged
                       # needs_pcab when you hold none. ABC-to-required-class (ARCC) thresholds
                       # are deliberately NOT modelled -- see SKILL.md "What this does not know".
categories: [civil_works, repair_maintenance]
                       # work_type enum values, NOT the agency's own classification (that field
                       # is self-declared and wrong often enough to matter). `rfp profile` warns
                       # if you name something outside the enum.
regions: [NCR, Cavite, Laguna]
                       # province names or region names (NCR, CAR, Region I..XIII, MIMAROPA,
                       # BARMM), mixed freely. Adjacent provinces are demoted, not dropped:
                       # this expands to Batangas/Quezon/Rizal/Bulacan/Bataan/Pampanga at 0.85x.
abc_band: [200000, 5000000]
                       # your capacity band in pesos. A multi-lot notice whose PER-LOT value
                       # lands in this band scores as a fit even when the notice total is far
                       # outside it -- notice 54278 is P360K of six P60K lots.
min_days_to_close: 5   # days you need to assemble documents. A RANKING SIGNAL, NOT A FILTER:
                       # 23.2% of the board closes within 48 hours and sometimes the answer is
                       # "yes, if you drop everything today."
results: 3             # 3 for a contractor examining one P20M decision.
                       # 40 for a supplier triaging at 30 seconds a notice.
                       # This number is the seam between the two user types. Set it honestly;
                       # guessing one value for both under-serves whichever you guessed against.
never: [security_janitorial, food_catering]
                       # hard no. Still only a 0.30x demotion, never a removal.
```

## work_type enum — the only valid `categories` / `never` values

```
software          ict_hardware       civil_works        consulting        medical_supplies
lab_equipment     office_supplies    furniture          vehicles_parts    food_catering
printing_promo    security_janitorial training_events   repair_maintenance utilities_fuel
logistics_freight agriculture        mixed_supplies     outsourced_services other
```

## How each line becomes a multiplier

`score = normalised_bm25 × profile_fit`, and `profile_fit` is multiplicative in [0.20, 1.00] —
never zero.

| signal | effect |
|---|---|
| `work_type` in `categories` | 1.00 |
| `work_type` set but off-category | 0.70 + `off-category: <wt>` |
| `work_type` null (untagged) | 0.90 + `untagged` |
| `work_type` in `never` | 0.30 + `never: <wt>` |
| ABC inside `abc_band` | 1.00 |
| a **lot** inside the band, notice total outside | 0.95 + `lot fits: …` |
| ABC above band, ≤3× | 0.55 + `stretch: …` |
| ABC above band, >3× | 0.35 + `stretch: …` |
| ABC below band | 0.60 + `below band: …` |
| ABC not stated on the notice | 0.80 + `abc: not stated` |
| province in `regions` | 1.00 |
| province adjacent to `regions` | 0.85 + `adjacent: <prov>` |
| location not stated (12.2% of corpus) | 0.85 + `location not stated` |
| province elsewhere | 0.50 + `out of region: <prov>` |
| `needs_pcab` true and `pcab` null | 0.60 + `needs PCAB; profile has none` |
| days-to-close < `min_days_to_close` | 0.35→1.00 ramp + `tight: Nd vs your Md` |
| no closing date (12 zombie notices) | 0.70 + `no closing date` |
| already closed | 0.15 + `CLOSED` |

Check what your file actually expands to before trusting a search:

```
./rfp profile
```

`rfp search --no-profile` bypasses all of it and ranks on BM25 alone. Worth doing once on any
query that comes back thin — if `--no-profile` finds notices your profile buried, the profile is
too narrow, and the fix is deliberate widening (adjacent provinces, adjacent categories), not a
better query. **60% of category × size-band × province cells hold exactly one open notice
nationally**, so a narrow profile opens to an empty feed most days.

# Autonomous Table-Tennis Venue Monitoring — Feasibility & Cost Study

**Date:** 2026-06-14
**Status:** Design (spec)
**Deliverable type:** Offline feasibility + cost study (not a deployable system)

## Problem

Autonomous table-tennis venues are monitored by human operators. Each operator
watches ~30 screens across an 8-hour shift, flagging events: overtime/overstay,
safety incidents, unauthorized access, equipment/facility issues, and
payment/booking anomalies. We want to scope whether this monitoring can be
automated with a vision-language model (VLM) pipeline — and at what cost —
**before** committing to building a deployable system.

We have (will have) access to a target dataset containing screen streams,
operator actions, and timesteps. Operator actions are the **ground truth**:
what a human actually flagged, and when.

## Goal of this study

Answer two questions with measured numbers, not estimates:

1. **Does the detection approach work?** Specifically, can it hit acceptable
   recall on the must-never-miss class (safety) while keeping false positives
   low enough that an operator's job becomes *adjudicating flags* rather than
   *watching screens*?
2. **What does it cost?** Per screen-hour, per operator-shift, and at the
   fleet ceiling (≤10k screen-hours/day) — today and as inference cost falls.

Out of scope: building the deployable pipeline, the operator-facing UI, alerting
infrastructure, or production capacity planning. Those follow only if this study
clears the bar.

## Key reframing

Two facts shape the whole design:

- **Ground truth must be *constructed*, not consumed.** The dataset doesn't
  exist in clean form yet, and operator actions are a mix — some typed events,
  some raw untyped actions, possibly free-text notes. Mining and normalizing
  these into scored labels is **phase 1**, not a precondition.
- **Most events likely need no vision at all.** Strong prior: overtime,
  no-shows, and after-hours presence are detectable from **booking metadata +
  occupancy state** with zero VLM calls. The VLM is only needed for a thin slice
  (safety, disputes, equipment). If true, the cost story collapses and the real
  question becomes "can we hit safety recall," not "can we afford 30 screens."

## Event taxonomy

| Class | Signal needed | Latency profile | Notes |
|---|---|---|---|
| Overtime / overstay | Metadata (booking + occupancy) | Slow (minutes) | Likely zero vision |
| No-show / play-without-booking | Metadata | Slow | Likely zero vision |
| After-hours / unauthorized access | Metadata + occupancy, light vision | Medium | Mostly metadata |
| Safety incident (fall, medical, altercation) | **Vision** | **Fast, must-never-miss** | Recall-at-all-costs class |
| Dispute | Vision | Medium | VLM classify |
| Equipment / facility (broken table, spill, lights, doors) | Vision | Slow–medium | VLM classify |

**Safety is the asymmetric class:** a missed incident is the failure that sinks
the product. It is tuned for recall-at-all-costs; the frequent, cheap classes
are tuned for precision/cost.

## Proposed detector architecture (the design under test)

A tiered pipeline, where expensive reasoning only runs when something cheap
upstream says it's worth a look:

```
Metadata layer (continuous, ~free):
  Booking system + occupancy state
    -> overtime, no-shows, after-hours timers   (no vision, pure logic)

Per stream — Tier 0 (continuous, ~$0 in tokens):
  Motion / presence / occupancy detection (classical CV or tiny model)
    -> occupancy boolean, motion regions
    -> feeds metadata timers AND fires triggers

On trigger only (occupancy anomaly, motion spike, after-hours motion,
                 person-down heuristic):
  Tier 1 — grab short frame window -> VLM classify
    ("injury / dispute / equipment / normal play")
    -> Flash first-pass; escalate ambiguous cases to Pro
    -> confirmed flag handed to operator
```

The architectural bet: the **Tier-0 gate quality** is the cost lever. A clean
gate fires rarely and cheaply; a noisy gate (firing on every rally) drags cost
toward the naive worst case.

## Study methodology — two phases of one study

### Phase 1 — Data archaeology (characterize-first)

Mine and normalize operator actions into scored ground truth, then characterize:

- **Label normalization:** sort raw operator actions into the taxonomy buckets;
  resolve untyped actions and free-text notes; define the matching rule per class
  (point-events -> time-window match within N seconds; sustained states ->
  interval overlap / IoU).
- **Event distribution:** frequency per class, per screen-hour; inter-event
  timing; how concentrated events are across screens/times.
- **Signal classification (the upper-bound finding):** label each event by what
  signal it *needs* — pure metadata, visually-obvious, or genuinely hard. This
  establishes the theoretical ceiling: how much can be detected at all, and how
  much needs a VLM.

Phase 1 alone may answer the cost question, by revealing how thin the
VLM-required slice actually is.

### Phase 2 — Comparative bake-off

Replay the dataset through the few detector configs that survive phase 1 and
plot recall / precision / cost for each:

- (a) Naive low-fps VLM polling on every screen (baseline / worst case)
- (b) Tiered gate + triggered VLM (the proposed design)
- (c) Metadata-first + occupancy, VLM only on residual events

Score each config's flags against phase-1 ground truth. Report recall/precision
per class (with safety isolated) and the cost per screen-hour each config
implies.

## Success criteria

- **Safety recall** at or above an agreed threshold (recall-at-all-costs;
  exact number set with stakeholders, but a miss is unacceptable).
- **Precision** high enough that flag volume is adjudicable by one operator for
  ~30 screens, i.e. the human shifts from watching to adjudicating.
- **Cost** demonstrably a small fraction (<10%) of the labor cost it offsets.

## Cost model

### Assumptions

- 10 fps frame-by-frame is a **non-starter** and serves only as the worst-case
  anchor: ~$7.15/screen-hour on Pro (~$1,720 per 30-screen × 8-hr shift).
- VLM token cost driven by: triggers/hr × frames/trigger × model tier.
- Tier-0 / metadata layer uses ~zero tokens (classical CV) or ~$0.01/screen-hour
  (low-fps Flash polling at 1 frame/10s).
- Tier-1 worked assumptions: ~10–50 triggers/screen-hour, ~3 frames/trigger,
  Flash first-pass, Pro on ~20% ambiguous cases.

Model pricing reference (2026): MiMo-V2-Flash ~$0.10/1M in, $0.30/1M out;
MiMo-V2.5-Pro ~$0.43/1M in, $0.87/1M out.

### Per screen-hour (inference only)

| Component | Per screen-hour |
|---|---|
| Tier-0 gate (continuous) | ~$0 – $0.01 |
| Tier-1 VLM (triggered) | ~$0.005 – $0.04 |
| **Total** | **≈ $0.01 – $0.05** |

vs. naive 10 fps Pro: $7.15/screen-hour — a 150–700× collapse.

### Per operator-shift (30 screens × 8 hr = 240 screen-hours)

| Scenario | Per screen-hour | Per shift |
|---|---|---|
| Optimistic | ~$0.01 | ~$2.40 |
| Midpoint | ~$0.03 | ~$7 |
| Conservative | ~$0.05 | ~$12 |

Inference is well under 10% (often under 5%) of the labor cost it offsets.

### Fleet ceiling — 10k screen-hours/day, today

| Per screen-hour | Per day | Per year (×365) |
|---|---|---|
| $0.01 | $100 | ~$36.5k |
| $0.03 | $300 | ~$109.5k |
| $0.05 | $500 | ~$182.5k |

Linear in screen-hours; the cap sets the top (≤$500/day, ≤~$183k/yr conservative).

## Scaling under compute improvements

The relevant trend is **cost-per-equivalent-capability**, which for VLM inference
has been falling ~an order of magnitude per year (MiMo's V2.5 line cut prices up
to ~99%). Modeling the midpoint ($300/day today at 10k screen-hours):

| Decline rate | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Conservative (~2×/yr) | $150/day | $75/day | ~$37/day |
| Moderate (~4×/yr) | $75/day | $19/day | ~$5/day |
| Aggressive (~10×/yr) | $30/day | $3/day | ~$0.30/day |

Moderate case: ~$110k/yr today -> ~$1.7k/yr within three years at the full
ceiling. Two compounding accelerators:

- **Better models shrink trigger volume**, not just per-call price — a second
  multiplier on top of price decline.
- The continuous Tier-0 layer barely uses tokens, so what's declining is the
  thin triggered slice.

### Strategic implications

1. **Don't architect to save tokens.** They're already <10% of labor and
   trending to a rounding error. Token-cost optimization solves yesterday's
   problem.
2. **Spend the falling cost on fidelity.** Bank improvements as quality —
   higher trigger sampling for safety recall, Pro-everywhere classification,
   richer per-event reasoning — not as savings.
3. **The real cost frontier is infra + recall, not $/token.** Flat infra
   (Tier-0 compute, stream ingest, storage for ≤10k screen-hours of video) is
   fixed-rate and likely crosses *above* inference within ~a year, becoming the
   dominant line item. Capacity planning should focus there.

## Honesty caveats

- **API cost only.** Tier-0 compute, stream ingest, and storage are real,
  flat-rate infra costs not modeled here — likely the bigger bill at scale.
- **The band assumes a clean gate.** A noisy gate inflates trigger volume 10×+
  and drags cost toward the naive worst case. Gate precision *is* the cost lever.
- **Safety recall may force higher trigger-window sampling** (2–4 fps for a few
  seconds post-trigger). A small per-event bump, already roughly in the band, but
  to be measured rather than assumed.
- **Everything rides on phase-1 findings.** The trigger rate per screen-hour is
  the only variable that can blow the budget, and it's exactly what archaeology
  measures.

## Next steps

If this study clears the bar, the follow-on projects (each its own spec) are:
a deployable prototype (Approach B), then a full production spec including
operator-handoff UI and alerting (Approach C).

# Adversarial Tag Expiry and Automatic Sunset

**Aspect:** 4.69e-viii — Tag expiry and automatic sunset: adversarial tags that persist forever become stale as configs and meta evolve; automatic expiry after N seasons with renewal prompt; interaction with periodic review prompt design; preventing stale tags from accumulating over long careers.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii — Known adversarial opponent tagging; 4.69e-iii — Per-opponent threshold override (concentration cap); 4.69e-iv — Counter-poisoning config design; 4.69e-v — Adversarial density (APS); 4.69e-vi — Concentration threshold calibration for dense opponent pools; 4.69e-vii — Per-cluster adversarial exclusion
**Related:** 4.69e-v-d — Seasonal APS decay and historical archiving; 4.69e-vi-c — Cross-season pool drift and threshold migration; 4.69e-ix — Adversarial tag as community signal; 4.69e-x — Tag evidence export; 7.10 — Necropsy culture; 4.38 — Counterfactual history; 4.69c — Agent redesign mode

---

## The Core Design Problem

Adversarial tags are judgments. A player examines their career analysis, identifies an opponent whose match concentration distorts diagnostics, and tags them — a binary tag, a concentration cap, a per-cluster lock. At the moment of creation, the tag is correct: the player has evidence, has watched replays, has seen the match-source breakdown.

But the game changes. The player redesigns RELAY-C in Season 7. The opponent switches from relay-flooding to striker-rushing in Season 8. The meta shifts: the hook-routing pattern that was uniquely exploited is now common knowledge. The matchmaking pool doubles. By Season 10, the tag set in Season 5 is based on a player config that no longer exists, targeting behavior that may have stopped, in a competitive context that has evolved beyond recognition.

**The tag doesn't know any of this.** It sits in the player's profile, silently excluding matches from career analysis, and the player has forgotten why they set it. The diagnostic they're now running is shaped by a judgment made 5 seasons ago about a reality that no longer exists.

This is **The Stale Tag Problem** — a special case of the broader engineering pattern where configuration outlives its context. Feature flags that no one remembers adding. Firewall rules written for a server that was decommissioned. Git branches named `temp-fix-march` from three Marches ago.

The problem compounds:

1. **Accumulation.** A competitive player who plays for 10 seasons might tag 15-20 opponents. Each tag was correct when set. Many are now irrelevant. But checking each one requires re-examining match data, possibly watching old replays. The maintenance burden grows linearly with career length.

2. **Invisible distortion.** A stale tag doesn't produce visible errors. It produces *invisible omissions*. Matches that should inform diagnostics are silently excluded. The player sees a clean career analysis and assumes it reflects reality, but it reflects reality *minus the contributions of 15 opponents they tagged years ago*. The aggregate distortion can be significant.

3. **False confidence.** The worst outcome: a stale tag hides a current structural weakness. The opponent resumed targeting the same agent, but this time the agent actually HAS the weakness they're exploiting. The tag prevents the career analysis from surfacing this, because it's still excluding the opponent's matches. The player's clean diagnostics are a lie.

4. **Cognitive archaeology.** When the player eventually discovers a stale tag, they must remember WHY they set it. "I tagged NebulaFang as adversarial... when? For what? My config was completely different then. Was it RELAY-C? I don't even have RELAY-C anymore." The tag lacks the contextual information to evaluate whether it's still valid.

---

## The Expiry Spectrum

Before exploring design options, here's the full spectrum of possible expiry policies:

| Policy | Behavior | Maintenance cost | Risk of stale tags | Risk of premature expiry |
|--------|----------|------------------|--------------------|--------------------------|
| **Never expire** | Tags persist forever. No prompts. | Zero | Maximum | Zero |
| **Review prompt only** (4.69e-ii current) | Prompt every 2 seasons. Player can dismiss. | Low per-prompt, accumulates | Moderate — player can ignore prompts | Zero — player decides |
| **Soft expiry** | Tag degrades (e.g., cap widens by 10% per season) until functionally irrelevant | Zero | Low — tag becomes harmless | Moderate — gradual loss of protection |
| **Hard expiry with renewal** | Tag expires after N seasons. Player must actively renew. | Medium — renewal required | Low | Moderate — player may miss renewal window |
| **Hard expiry, no renewal** | Tag expires after N seasons. Must be re-created from scratch. | High — full re-tagging | Very low | High — loses nuanced settings (per-cluster locks, calibrated caps) |
| **Activity-based expiry** | Tag expires after N seasons of no adversarial activity from that opponent | Zero while active, prompt when inactive | Very low | Low — opponent inactivity is genuine signal |
| **Config-change expiry** | Tag expires when the tagged agent cluster's config changes significantly | Zero while stable, prompt on change | Very low — config is the relevant context | Moderate — minor config tweaks shouldn't invalidate |

---

## Option A: The Season Timer — "Tags Have a Shelf Life"

### How It Works

Every adversarial tag has a Time-To-Live (TTL) measured in seasons. When the TTL expires, the tag enters a **grace period** — it remains active but the player is prompted to review and renew. If not renewed within the grace period, the tag deactivates (not deletes — deactivation is reversible).

**Default TTL: 3 seasons.** Long enough that a tag set at the beginning of a season remains useful through reasonable meta shifts. Short enough that a forgotten tag doesn't persist for a player's entire career.

**The renewal prompt:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⏳ TAG REVIEW: NebulaFang                                                  │
│                                                                             │
│  You tagged NebulaFang as adversarial 3 seasons ago.                       │
│  Tagged: Season 4, Analysis #2                                              │
│  Original reason: 78% concentration in RELAY-C cluster                      │
│  Current config: RELAY-C has been redesigned (v3.2)                        │
│                                                                             │
│  SINCE TAGGING:                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  Matches vs. NebulaFang:  14 (2 this season, 5 last, 7 before)  │       │
│  │  Current max concentration: 35% (STRIKER-A cluster)              │       │
│  │  APS contribution: 0.04 (Clean — below Light Pressure)           │       │
│  │  Config changes since tag: RELAY-C v2→v3.2, STRIKER-A v1→v1.1  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  PREVIEW: Career analysis WITH vs. WITHOUT this tag                        │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  With tag (current):     2 clusters, 62% win rate               │       │
│  │  Without tag:            2 clusters, 61% win rate               │       │
│  │  Difference: +1 cluster element in STRIKER-A (non-significant)  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  This tag has minimal current impact on your diagnostics.                  │
│                                                                             │
│  [Remove tag]   [Renew 3 seasons]   [Renew 1 season]   [Dismiss for now]  │
│                                                                             │
│  Tag will deactivate in 14 days if not renewed.                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key affordances:**

- **Context restoration.** The prompt shows WHEN the tag was set, WHY (original reason with the concentration percentage), and what's changed since (config redesigns, current concentration). This eliminates the cognitive archaeology problem — the player doesn't have to remember, the system remembers for them.
- **Impact preview.** The with/without comparison lets the player see whether the tag is actually affecting their diagnostics. If removing the tag changes nothing (NebulaFang's concentration is now below detection thresholds anyway), the prompt gently communicates this. If removing the tag would flood diagnostics with adversarial noise (NebulaFang is still at 75%), the preview makes that immediately visible.
- **Graduated renewal.** "Renew 3 seasons" (standard) vs. "Renew 1 season" (uncertain — check again soon) gives the player vocabulary for their confidence level. "Remove" is permanent. "Dismiss for now" pushes the prompt to next analysis but doesn't renew.
- **Grace period.** The 14-day deactivation window prevents a single missed prompt from nuking a critical tag. If the player doesn't open career analysis for 14 days after the prompt would have appeared, the tag deactivates but isn't deleted — it can be reactivated from the opponent profile.

### Renewal Frequency Design

| Player profile | Tags | Reviews per season (3-season TTL) | Cognitive load |
|----------------|------|-----------------------------------|----------------|
| Casual (1-2 tags) | 1-2 | ~0.5 (one review every 6 seasons) | Negligible |
| Active (3-5 tags) | 3-5 | ~1.5 | Light — one batch review per season |
| Competitive (8-15 tags) | 8-15 | ~4 | Moderate — could batch, or use Option C |
| Veteran (15-25 tags) | 15-25 | ~8 | Heavy — needs batch review UI |

The scaling problem appears at the competitive tier. 8+ reviews per season becomes a chore, not a diagnostic tool. This motivates Options C and D as alternatives for high-tag-count players.

### Storage Model

```json
adversarial_tags: [
  {
    opponent: "NebulaFang",
    tag_type: "cap",
    cap_threshold: 0.50,
    created_at: "Season 4, Analysis #2",
    created_context: {
      reason: "78% concentration in RELAY-C cluster",
      config_snapshot: "RELAY-C v2.0, STRIKER-A v1.0",
      pool_size: 18,
      aps_at_creation: 0.38
    },
    ttl_seasons: 3,
    expires_at: "Season 7",
    renewal_history: [
      { renewed_at: "Season 7, Analysis #1", ttl: 3, new_expiry: "Season 10" }
    ],
    status: "active",
    cluster_overrides: []
  }
]
```

### Strengths

- **Simple mental model.** "Tags expire after 3 seasons unless renewed." One rule. Universal. Predictable.
- **Rich context in renewal prompt.** The system does the homework — showing current concentration, config changes, impact preview. The player makes an informed decision without doing research.
- **Reversible.** Deactivation, not deletion. A player who realizes they shouldn't have let a tag expire can reactivate it from the opponent profile in seconds.
- **Compatible with all tag types.** Binary tags, concentration caps, per-cluster locks — all get the same TTL/renewal mechanism. The per-cluster lock review even surfaces which locks remain relevant.

### Weaknesses

- **Fixed TTL is wrong for everyone.** 3 seasons is too long for a rapidly-evolving meta (the tag is stale by season 2). 3 seasons is too short for a persistently adversarial opponent (the player is forced to renew a tag they know is still valid). No single TTL value is correct.
- **Renewal fatigue.** At competitive tier (8+ tags), renewal prompts become noise. The player clicks "Renew 3 seasons" reflexively, defeating the purpose. The prompt becomes the adversary.
- **Timing dependency.** The prompt appears during career analysis. If the player doesn't run career analysis during the grace period, the tag deactivates. Players who only analyze before important matches might lose tags at the worst moment.

---

## Option B: The Soft Decay — "Tags Fade Like Memory"

### How It Works

Instead of a hard expiry, tags **degrade** over time. A concentration cap slowly widens. A binary tag transitions to a cap. Per-cluster locks loosen. The tag doesn't disappear — it becomes less aggressive, allowing more of the opponent's data to seep back into diagnostics.

**The decay schedule (per season):**

| Tag type | Season 0 (fresh) | Season +1 | Season +2 | Season +3 | Season +4 |
|----------|-------------------|-----------|-----------|-----------|-----------|
| Binary exclude | Full exclude | → Cap at 80% | → Cap at 65% | → Cap at 50% | → Cap at 35% (near baseline) |
| Cap at 50% | Suppress above 50% | → 55% | → 60% | → 65% | → 70% |
| Per-cluster lock (suppress) | Locked suppress | Locked suppress | → Auto (cap decides) | → Auto | → Auto |
| Per-cluster lock (include) | Locked include | Locked include | Locked include | → Auto | → Auto |

**The visual metaphor:** The tag's icon fades over time. A fresh tag is a solid ⚑ in bright red. After one season, the red softens to a warm salmon. After two, it's a dusty rose. After three, it's a pale pink ghost of a flag. The color encodes staleness without requiring the player to check a date.

**The decay notification (inline, not modal):**

```
┌───────────────────────────────────────────────────────────┐
│  ⚑ NebulaFang — cap 50% → 55% (seasonal decay)          │
│  Set 2 seasons ago. [Refresh to 50%] [Let it decay]      │
└───────────────────────────────────────────────────────────┘
```

A one-line inline notice in career analysis. Not a modal. Not a prompt that blocks workflow. The player can refresh (reset decay to original values) or ignore it.

### The Key Insight: Decay Is Self-Correcting

If the opponent IS still adversarial at the same level, the decayed cap will eventually let enough matches through to trigger a NEW cluster warning. The career analysis says: "Hey, NebulaFang is at 58% in STRIKER-A again" — and the player sees this because the cap has decayed from 50% to 60%. The system's own detection catches what the stale tag was masking.

If the opponent is NOT adversarial anymore, the decayed cap lets matches through that don't trigger any warnings. The career analysis stays clean even as the cap widens. The tag fades to irrelevance without the player ever having to make a decision.

**Soft decay is the only option where "doing nothing" is always correct.**

### Strengths

- **Zero maintenance for correct outcomes.** If the opponent stopped targeting, the decay converges to an irrelevant cap naturally. If the opponent continued targeting, the decay eventually reveals the problem again. Either way, the player doesn't need to do anything.
- **No renewal fatigue.** No prompts to dismiss. No batch review sessions. The system maintains itself.
- **Gradual, not binary.** A hard expiry creates a cliff — tag active on day 0, gone on day 1. Decay creates a slope. The transition from "protected" to "unprotected" is smooth. No single moment where a critical tag vanishes.

### Weaknesses

- **Loss of precision.** A cap calibrated to exactly 50% after careful analysis decays to 55%, 60%... The player's precise judgment is overwritten by an automated schedule. For players who spent time calibrating per-cluster locks and fine-tuned cap values, watching that precision erode is frustrating.
- **Unpredictable behavior.** The player's diagnostics change slightly every season even if nothing else changes. "Why does my STRIKER-A cluster have one more element this season?" Because the cap on IronPulse99 decayed from 60% to 65%, letting in one more match. The cause is hidden — the player has to remember that caps decay and check each tagged opponent's current effective cap.
- **Decay rate is arbitrary.** Why +5% per season for caps? Why 2 seasons for per-cluster locks? Any schedule is a design guess. Different opponents decay at different rates in reality, but the system applies a uniform schedule.
- **No "refresh" prevents false confidence.** If the player refreshes a decaying tag, they're resetting to the original values based on original evidence — but they haven't actually re-examined whether the original values are still correct. The refresh button creates an illusion of maintenance without requiring actual maintenance.

---

## Option C: The Activity-Based Sunset — "Tags Expire When the Evidence Does"

### How It Works

Tags don't expire on a calendar. They expire when the **evidence** that justified them becomes stale. The system tracks whether the tagged opponent's behavior continues to meet the tag's criteria, and triggers a review only when the evidence weakens.

**Three evidence signals:**

1. **Concentration drop.** If the opponent's concentration in the tagged cluster falls below the tagging threshold for 2 consecutive career analyses, the tag enters review. Example: NebulaFang was tagged at 78% in RELAY-C. After two analyses where NebulaFang is at 32% and 28%, the system prompts: "NebulaFang's concentration in RELAY-C has been below your detection threshold for 2 analyses."

2. **Config change.** When the player redesigns the agent that the tag was created for, the tag enters review. Example: RELAY-C is redesigned to v3.0. The system prompts: "You've redesigned RELAY-C. Your tag on NebulaFang was based on RELAY-C v2.0 behavior."

3. **Match absence.** If the player hasn't faced the tagged opponent in 2+ seasons, the tag enters review. The opponent may have quit, deranked, or changed servers. Example: "You haven't played NebulaFang in 2 seasons. The tag is based on data from Season 4-5."

**The evidence dashboard (in opponent profile):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NebulaFang — TAG HEALTH                                                    │
│                                                                             │
│  Tag type: Concentration cap (50%)                                          │
│  Created: Season 4, Analysis #2                                             │
│  Last renewed: Season 7, Analysis #1                                        │
│                                                                             │
│  EVIDENCE STATUS:                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  📊 Concentration: 35% current (↓ from 78% at tag time)         │       │
│  │     Below threshold for 2 consecutive analyses                   │       │
│  │     Status: ⚠ WEAKENED                                          │       │
│  │                                                                  │       │
│  │  🔧 Config: RELAY-C redesigned to v3.2 since tag                │       │
│  │     Status: ⚠ CHANGED CONTEXT                                   │       │
│  │                                                                  │       │
│  │  🎮 Matches: 2 this season, 5 last season                       │       │
│  │     Status: ✓ ACTIVE                                            │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  RECOMMENDATION: Evidence weakened. Consider reviewing this tag.           │
│  [Run filtered analysis (with/without tag)]   [Remove]   [Keep]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key insight:** Evidence status uses a traffic light metaphor:
- ✓ **Active** (green) — Evidence still supports the tag. Concentration remains high, config unchanged, recent matches exist.
- ⚠ **Weakened** (amber) — One or more evidence signals have changed. The tag might still be valid, but the player should check.
- ✗ **Expired** (red) — All evidence signals have degraded. The tag is almost certainly stale.

When 2 of 3 evidence signals reach ⚠, the tag enters automatic review. When all 3 reach ✗, the tag deactivates with a notification.

### The Strength: Evidence-Based, Not Calendar-Based

The genius of this approach: tags that ARE still valid never expire. If NebulaFang is still at 75% concentration after 10 seasons, the concentration signal stays ✓ ACTIVE, and the tag never triggers a review. The player is never asked to renew a tag that's obviously still correct.

Conversely, a tag where the opponent's behavior changed 2 weeks after tagging gets reviewed in the next career analysis — not after 3 seasons. The review happens when it's relevant, not when a timer fires.

### Weaknesses

- **Complexity.** Three evidence signals, each with their own thresholds and tracking. The player needs to understand what "evidence" means in this context. The Tag Health panel is richer than a simple "expires in Season 8" countdown.
- **Config change is noisy.** Players make minor config tweaks constantly. Should changing a hook priority trigger a tag review? What counts as a "significant" config change? The system needs a change-magnitude threshold, which is hard to define.
- **Concentration can be gamed.** A sophisticated opponent who knows about evidence-based expiry could deliberately reduce their targeting for 2 analyses, let the tag expire, then resume. The evidence system is exploitable by an adversary who understands it. (This is a deep meta-level concern — most opponents won't know or care about the victim's tag system.)
- **No protection against "the opponent I've never seen again."** If a player tagged someone in Season 3 and never matched them again, the match absence signal triggers review. But the tag might still be the right call — if they DO match again, the opponent might still be adversarial. Evidence-based expiry doesn't handle this well.

---

## Option D: The Hybrid — "Timer + Evidence + Decay"

### How It Works

Combine the best properties of Options A, B, and C into a three-layer system:

**Layer 1: Evidence monitoring (continuous, passive).** The system continuously tracks the three evidence signals from Option C. If all evidence weakens, the tag is flagged for review. No timer involved — purely evidence-driven.

**Layer 2: Soft decay (seasonal, automatic).** The cap widens by 3% per season (slower than Option B's 5%). Per-cluster locks decay from locked to auto after 4 seasons. This is a background process — no prompts, no decisions. It ensures that even if the player ignores all reviews, the tag's effective impact diminishes naturally.

**Layer 3: Hard ceiling (absolute maximum TTL).** No tag persists beyond 6 seasons regardless of evidence or renewal. At season 6, the tag deactivates. The player can re-create it from scratch with current evidence. This is the "feature flag cleanup" layer — a hard guarantee against infinite tag accumulation.

**The interaction between layers:**

| Scenario | Layer 1 (Evidence) | Layer 2 (Decay) | Layer 3 (Ceiling) | Outcome |
|----------|-------------------|-----------------|-------------------|---------|
| Opponent still adversarial, season 2 | ✓ Active | Cap widened 6% | — | Tag effective. Slight cap widening is negligible. |
| Opponent stopped, season 3 | ⚠ Weakened | Cap widened 9% | — | Evidence triggers review. Decay has already softened impact. |
| Opponent unknown, season 5 | ⚠ Match absence | Cap widened 15% | — | Tag is very soft. Player prompted on next analysis. |
| Opponent still adversarial, season 6 | ✓ Active | Cap widened 18% | **CEILING HIT** | Tag deactivates. Player must re-tag with current evidence. Re-tagging takes 30 seconds — fresh cap with current concentrations. |

**The renewal flow is lightweight because decay has already done most of the work.** At season 3, if evidence triggers a review, the cap has only widened 9% — the player can refresh it quickly. At season 6, if the player must re-tag, they're making a fresh judgment with fresh evidence rather than rubber-stamping a 6-season-old decision.

### Why the Hard Ceiling Matters

The hard ceiling is the most controversial part of this design. "Why force me to re-tag an opponent who's STILL adversarial?" Because:

1. **The config context has changed.** 6 seasons of play means 6 seasons of config evolution. The cap set in Season 1 was calibrated against a config that no longer exists. Even if the opponent is still adversarial, the RIGHT cap value for the current config is probably different.

2. **Per-cluster locks are almost certainly stale.** After 6 seasons, agent clusters have formed, dissolved, and reformed multiple times. The per-cluster locks from Season 1 reference clusters that may not exist. Re-tagging forces the player to set locks against current clusters.

3. **Pool context has shifted.** Bracket sizes change. New opponents arrive. The pool-adjusted thresholds (4.69e-vi) from 6 seasons ago are based on a different competitive population. Re-tagging uses current pool calibration.

4. **The re-tagging cost is low.** Creating a new cap from the opponent's current data takes 30 seconds. The system pre-fills the cap slider based on current concentrations. The "cost" of the hard ceiling is one 30-second interaction per opponent per 6 seasons. That's trivially cheap compared to the risk of a 6-season-stale tag silently distorting diagnostics.

### Batch Review UI for the 6-Season Ceiling

When multiple tags hit the 6-season ceiling simultaneously (common for competitive players who went on a tagging spree in the same season), the system batches them:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⏳ TAG REVIEW: 4 tags reaching 6-season ceiling                           │
│                                                                             │
│  These tags have reached maximum age and will deactivate.                  │
│  Review each to decide whether to re-tag with current evidence.            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  1. NebulaFang (cap 50% → decayed to 68%)                       │      │
│  │     Current max concentration: 35%  │  Impact: minimal           │      │
│  │     Recommendation: REMOVE                                       │      │
│  │     [Remove ✓]  [Re-tag]                                        │      │
│  │                                                                  │      │
│  │  2. IronPulse99 (cap 45% → decayed to 63%)                      │      │
│  │     Current max concentration: 71%  │  Impact: HIGH              │      │
│  │     Recommendation: RE-TAG at 55%                                │      │
│  │     [Remove]  [Re-tag at 55% ✓]  [Custom]                       │      │
│  │                                                                  │      │
│  │  3. DarkVolt (binary → decayed to cap 35%)                       │      │
│  │     Current max concentration: 12%  │  Impact: none              │      │
│  │     Recommendation: REMOVE                                       │      │
│  │     [Remove ✓]  [Re-tag]                                        │      │
│  │                                                                  │      │
│  │  4. ShadowByte (cap 60% + 2 cluster locks)                      │      │
│  │     Current max concentration: 58%  │  Impact: MODERATE          │      │
│  │     Recommendation: RE-TAG at 50% (locks reset)                  │      │
│  │     [Remove]  [Re-tag at 50%]  [Custom ✓]                       │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  [Apply all recommendations]   [Review individually]                        │
│                                                                             │
│  ✓ = System recommendation                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The "Apply all recommendations" button:** For the player who trusts the system's judgment, one click handles all 4 tags. The system's recommendations are based on current concentration vs. tag threshold: if concentration is well below threshold, recommend remove. If concentration is near or above threshold, recommend re-tag at a recalibrated value.

### Sensory Design

**The aging flag.** The adversarial tag icon ⚑ encodes its age visually:
- Season 0-1: Solid, saturated red (RGB ~220, 50, 50). The flag stands at full mast with a crisp triangular shape. A 1px dark shadow gives it weight.
- Season 2-3: Fading to dusty rose (RGB ~200, 120, 120). The flag droops slightly — the top edge tilts 5° from horizontal. The shadow lightens.
- Season 4-5: Pale, almost pastel pink (RGB ~200, 170, 170). The flag hangs limp — 15° droop. Shadow gone. The icon looks tired.
- Season 6 (ceiling): The flag is a ghost — 40% opacity outline with no fill. It flickers once every 3 seconds, a slow pulse like a dying heartbeat. It's about to deactivate and it looks like it.

**The decay notification sound.** When a tag decays at the start of a season, a soft descending tone plays — three notes stepping down a minor scale, each softer than the last. The sound says "something is fading" without alarm. It's the audio equivalent of a candle burning lower.

**The ceiling notification.** When a tag hits the 6-season ceiling, a different sound: a clean, neutral chime followed by a brief silence. Not alarming. Not sad. More like a timer completing. "Your tag is done. Time to decide."

**The batch review animation.** When the batch review panel opens, the 4 tag entries cascade in from the right, each 100ms after the last, with a vertical slide-and-fade animation. Each entry that the system recommends removing has a thin translucent red wash. Each entry recommended for re-tagging has a thin blue wash. The "Apply all" button pulses gently once after all entries have loaded — a single heartbeat that says "I'm here when you're ready."

---

## Option E: The Pinned Immortal — "Some Tags Never Die"

### How It Works

Inspired by Overwatch's pinned avoid slots: the player gets a limited number of **immortal tag slots** (3 by default) for opponents who are permanently adversarial. These tags never expire, never decay, never trigger review prompts. The remaining tags follow Option A or D's expiry rules.

**The design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADVERSARIAL TAGS                                                           │
│                                                                             │
│  📌 PINNED (never expire) — 2 of 3 slots used                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  📌 NebulaFang   cap 50%   since Season 2   [Unpin]             │      │
│  │  📌 IronPulse99  binary    since Season 3   [Unpin]             │      │
│  │  ○ [empty slot]                                                  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  ⏳ TIMED (expire per schedule)                                            │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  ⚑ DarkVolt      cap 60%   expires Season 9   ██████░░░░       │      │
│  │  ⚑ ShadowByte    cap 55%   expires Season 8   ████░░░░░░       │      │
│  │  ⚑ CloudNine     binary    expires Season 10  ████████░░       │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  Drag a timed tag to a pinned slot to make it permanent.                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The slot constraint:** 3 pinned slots forces the player to prioritize. "Which opponents are SO adversarial that I never want to re-examine the tag?" This constraint is itself diagnostic — it forces the player to articulate their adversarial ranking. If they have 5 opponents they want to pin, they must decide which 3 matter most.

**Drag interaction.** Dragging a timed tag to a pinned slot triggers a confirmation: "Pin IronPulse99? This tag will never expire. You can unpin later. You have 1 pinned slot remaining." The drag animation shows the tag sliding upward with a satisfying magnetic snap to the pinned section, the 📌 icon appearing with a small rotation animation.

### Strengths

- **Acknowledges reality.** Some adversaries ARE permanent. A rival in your bracket who has counter-configged your core playstyle for 8 seasons is not going to stop. Forcing periodic renewal for this opponent is pure busywork.
- **Limits immortality.** 3 slots prevents the "pin everything" degenerate strategy. The player must curate.
- **Clean separation.** Pinned tags are visually and functionally distinct from timed tags. No ambiguity about which tags are aging and which aren't.

### Weaknesses

- **3 is arbitrary.** Why not 2? Or 5? The number of truly permanent adversaries varies by player. A competitive player might have 5 genuine permanent rivals. A casual player might have zero.
- **Encourages hoarding.** Players will agonize over pin allocation ("what if I meet someone even worse?") rather than using the system fluidly. The pin becomes a precious resource, not a tool.
- **Pinned tags still have the stale config problem.** Even a permanently adversarial opponent is adversarial against a specific config. When the config changes, the pinned tag's cap value is wrong — it just never gets reviewed.

---

## Recommended Design: Option D (Hybrid) + Option E (Pinned) = "The Full Lifecycle"

### The Complete Tag Lifecycle

```
Creation → Active → Decaying → Evidence Review → Renewal OR Deactivation
                                                       ↓
                                                   Re-creation from scratch (at 6-season ceiling)

   OR (if pinned):

Creation → Pinned → Active indefinitely (but annual context-check prompt)
```

**Phase 1 (Seasons 0-2): Active.** Tag at full strength. Decay hasn't started. Evidence monitoring runs in background.

**Phase 2 (Seasons 2-4): Decaying.** Cap widens 3% per season. Per-cluster locks still active. Flag icon begins fading. If evidence weakens during this phase, review prompt fires.

**Phase 3 (Seasons 4-6): Faded.** Cap has widened 9-18%. Per-cluster locks have reverted to auto. Flag icon is pale. If evidence is still strong (opponent still adversarial), the tag is functionally weaker but the system isn't alarming the player — the opponent's continued targeting will surface through normal cluster detection even with the softened cap.

**Phase 4 (Season 6): Ceiling.** Tag deactivates. Batch review prompt if multiple tags hit ceiling simultaneously. Re-creation is streamlined (pre-filled from current data).

**Pinned exception:** 2 pinned slots (not 3 — fewer to emphasize the constraint). Pinned tags don't decay, don't expire, but DO get an annual **context-check prompt** — a lightweight version of the renewal prompt that shows config changes since pinning. This prompt cannot deactivate the tag; it's purely informational. "Your pinned tag on NebulaFang was set with RELAY-C v1. You're now on RELAY-C v4. [Update cap value?] [Keep as-is]"

### Why 2 Pinned Slots

2 is deliberately constraining. Most players will never need even 1 pinned slot. The ones who do are competitive players with genuine long-term rivals. 2 forces them to identify their top 2. If they have 3+ permanent adversaries, they need to manage the 3rd through the normal expiry system — which is the correct behavior, because the 3rd-most-adversarial opponent is the one most likely to stop targeting or become irrelevant.

---

## Player Journeys

### Journey: Priya, 30, Software Engineer — The Stale Tag Discovery

**Context:** Season 9 of ranked play. Priya has been playing since Season 1. She has 8 adversarial tags accumulated over her career. She's never thought about whether old tags are still valid.

**Minute 0:00 — The Batch Review Prompt**

Priya opens career analysis for her weekly session. The summary loads: win rate 68%, eEDT strong upward trend, 1 cluster flag on SCOUT-B. But before she can scroll to the cluster, a new panel slides in from the top:

`⏳ 3 tags reaching 6-season ceiling. Review recommended.`

She hasn't seen this before. She clicks to expand. The batch review panel opens with a cascade animation — three entries slide in from the right, each 100ms apart. The first has a green-tinted background (recommended: remove), the second blue (recommended: re-tag), the third green again.

**Minute 0:30 — Reviewing Tag #1: VoidPhase**

```
VoidPhase (cap 55% → decayed to 73%)
Current max concentration: 8%
Impact: none — no matches in last 2 seasons
Recommendation: REMOVE ✓
```

Priya doesn't even remember VoidPhase. She checks: tagged in Season 3 for RELAY-B targeting. She redesigned RELAY-B twice since then. She hasn't faced VoidPhase in 2 seasons. The evidence dashboard shows all three signals at ✗ Expired. She clicks Remove without hesitation. The entry collapses with a gentle fade.

**Minute 0:45 — Reviewing Tag #2: CrimsonByte**

```
CrimsonByte (cap 50% → decayed to 68%)
Current max concentration: 62%
Impact: HIGH — currently suppressing in STRIKER-A
Recommendation: RE-TAG at 48%
```

This one she remembers. CrimsonByte runs a dedicated anti-striker config that's been bothering her for years. The decay has widened the cap to 68%, which means CrimsonByte at 62% is now *below* the decayed cap — their matches are leaking into her diagnostics. She looks at the evidence: concentration ✓ Active (62% is high), config ⚠ Changed (STRIKER-A v2 → v3), matches ✓ Active (5 last season).

The system recommends re-tagging at 48% — tighter than the original 50%, because STRIKER-A v3 has a cleaner config that makes CrimsonByte's concentration stand out more against a smaller background. Priya clicks "Re-tag at 48%." The entry flashes blue, the ⚑ icon refreshes to solid red — a new 6-season lifecycle begins.

**Minute 1:15 — Reviewing Tag #3: NightOwl**

```
NightOwl (binary → decayed to cap 35%)
Current max concentration: 22%
Impact: minimal — below baseline detection
Recommendation: REMOVE ✓
```

Priya pauses. NightOwl was her first adversary — tagged in Season 1 when she was learning the game. At the time, NightOwl felt overwhelmingly targeted. Now, looking at the numbers: 22% concentration, well below any reasonable threshold. The binary tag she set in fear has decayed to a 35% cap that isn't even doing anything. She laughs softly — a marker of how much she's grown as a player. She clicks Remove. The entry fades.

**Minute 1:30 — The Cleanup Afterglow**

Priya scrolls through her remaining tags. 5 left, all between seasons 4 and 8 of their lifecycle. The flag icons are at various levels of fade — the oldest one is pale pink, the newest is bright red. She notices the visual gradient for the first time and realizes she can see her tagging history at a glance just by scanning the icon colors.

She returns to career analysis. The summary has shifted: with VoidPhase and NightOwl removed, and CrimsonByte's cap recalibrated, the cluster results have subtly changed. SCOUT-B's cluster now shows 3 elements instead of 2 — one of NightOwl's old matches was being excluded. The new element is legitimate signal. Priya's config genuinely has a SCOUT-B weakness she hadn't seen because a 9-season-old tag was hiding it.

She sits back. *That tag was hiding a real problem for how many seasons?* The stale tag cost her diagnostic accuracy for years. She resolves to pay attention to the flag colors going forward.

**UI Annotations:**
- **Batch review panel:** Slides from top, 400ms animation. Entries cascade from right at 100ms intervals. Green wash for remove-recommended, blue wash for re-tag-recommended.
- **Remove animation:** Entry height collapses to 0 over 300ms with opacity fading to 0. Small upward particle effect (4-5 tiny dots) representing the tag dissipating.
- **Re-tag animation:** ⚑ icon color snaps from faded to full red. A brief (200ms) concentric ring pulse emanates from the icon — fresh tag, fresh evidence.
- **Flag color gradient:** Continuous 6-step fade from RGB(220,50,50) to RGB(200,170,170,0.4). Inspectable via tooltip: "Tag age: 4 seasons of 6."

---

### Journey: Marcus, 34, Competitive Streamer — The Pinned Rival

**Context:** Season 11, Architect tier. Marcus has a long-running rivalry with PhantomEdge, who has counter-configged Marcus's command agent across 9 seasons. PhantomEdge is not just adversarial — they're a metagame nemesis. Marcus has re-tagged PhantomEdge three times through the 6-season ceiling cycle.

**Minute 0:00 — The Third Re-Tag Fatigue**

Marcus's career analysis fires the 6-season ceiling notification for PhantomEdge again. He sighs. This is the third time. He knows PhantomEdge is still adversarial. He's watched the replays this week. PhantomEdge runs a specialized counter-command config with hook-chain disruption targeting CMD-α's priority routing. It's deliberate, consistent, and ongoing.

He clicks "Re-tag." The system pre-fills cap at 52% based on current concentration. He adjusts to 48% (he knows PhantomEdge better than the system does), sets one per-cluster lock on CMD-α to suppress. Done. But he's annoyed — why does he have to do this every 6 seasons for an opponent he KNOWS is permanently adversarial?

**Minute 0:30 — Discovering Pinned Slots**

As he finishes the re-tag, a small tooltip appears below the tag: `💡 Re-tagged 3 times? Pin this tag to prevent future expiry. [Learn more]`

He clicks "Learn more." The tag management panel expands to show the pinned/timed layout:

```
📌 PINNED (never expire) — 0 of 2 slots used
   ○ [empty slot]
   ○ [empty slot]

⏳ TIMED
   ⚑ PhantomEdge  cap 48% + 1 lock  expires Season 17  ██████████
   ⚑ CrimsonByte  cap 48%           expires Season 15  ██████░░░░
   ...
```

Two empty pinned slots. Marcus doesn't hesitate — he drags PhantomEdge's entry upward. The tag lifts with a slight 3D parallax effect as he drags, a faint shadow appearing beneath it. As it enters the pinned zone, the border glows amber. He drops it. The 📌 icon appears with a 360° spin, and the tag snaps into position with a magnetic click. The ⏳ timer disappears. The ⚑ icon shifts from temporal red to a permanent deep crimson with a gold border — a badge of permanence.

PhantomEdge will never trigger a ceiling review again.

**Minute 1:00 — The Annual Context-Check**

Three months later (Season 12), a gentle notification in career analysis: `📌 PhantomEdge: context check. Config changes since pinning: CMD-α v4.1 → v4.3 (minor hook priority adjustment). Current concentration: 71% in CMD-α. [Update cap?] [Keep as-is]`

Marcus glances at it. CMD-α v4.1 to v4.3 was a minor tweak — he knows it didn't change the PhantomEdge dynamic. He clicks "Keep as-is." The notification folds away. He barely lost 5 seconds.

**Minute 1:15 — The Stream Moment**

Marcus shows his tag management panel on stream. Chat lights up:

- `"only 2 pin slots?? i need like 8"`
- `"who's your second pin going to be??"`
- `"phantom edge has been living rent free since season 2 lmao"`
- `"the gold border on pinned tags is actually sick"`

The tag management screen — which tags are pinned, which are decaying, the flag color gradient — becomes a snapshot of Marcus's competitive identity. His pinned rivals are a statement: these are the players who matter to me. The stream clip of him pinning PhantomEdge gets 15K views. "Tag management is content" becomes a community meme.

**UI Annotations:**
- **Drag-to-pin:** Tag lifts with 3D parallax (3px Y-offset, 60% shadow opacity). Pinned zone border glows amber during drag hover. Drop triggers 📌 spin animation (360° over 400ms) + magnetic snap audio (short metallic click, higher pitch than lock click from 4.69e-vii).
- **Pinned tag visual:** Deep crimson ⚑ with 1px gold border. Slightly larger (18px vs. 16px for timed tags). No droop, no fade — permanently at full mast.
- **Context-check notification:** Inline, not modal. Collapses on "Keep as-is" with a 200ms upward slide. No urgency in the visual design — neutral background, no amber tint.
- **Empty pin slot:** Dotted outline circle, subtle pulse every 5 seconds, tooltip: "Drag a tag here to pin it permanently."

---

### Journey: Tomás, 17, First Competitive Season — Learning That Tags Aren't Forever

**Context:** Season 4, Silver tier. Tomás tagged ShadowByte in Season 2 after his first adversarial experience. He set a binary exclude — the simplest option. He hasn't thought about the tag since.

**Minute 0:00 — The Unfamiliar Notification**

Tomás opens career analysis to prepare for a ranked session. The summary loads, but a small amber bar appears at the top:

`⏳ Your tag on ShadowByte has been aging for 2 seasons. Evidence weakening. [Review]`

He's confused. What tag? He clicks [Review]. The evidence panel opens:

```
ShadowByte — TAG HEALTH

Tag type: Binary exclude (→ decayed to cap 44%)
Created: Season 2, Analysis #1
Original reason: "first adversarial experience — blanket exclude"

EVIDENCE STATUS:
  📊 Concentration: 22% current (↓ from 65% at tag time)
     Below threshold for 3 consecutive analyses
     Status: ✗ EXPIRED

  🔧 Config: 3 agents redesigned since tag
     Status: ⚠ CHANGED CONTEXT

  🎮 Matches: 4 this season
     Status: ✓ ACTIVE
```

He reads the evidence. His binary tag from Season 2 has decayed to a cap at 44%. ShadowByte is at 22% concentration — well below the decayed cap. The tag is doing nothing.

**Minute 0:30 — The Learning Moment**

Tomás clicks "Run filtered analysis (with/without tag)." Two side-by-side results appear:

```
With tag (current):     1 cluster, 64% win rate
Without tag:            1 cluster, 63% win rate
Difference: 1 additional element in RELAY-A cluster (non-significant)
```

Almost no difference. ShadowByte's 22% concentration doesn't distort anything. The tag is a relic of Season 2 fear.

He clicks "Remove." The tag dissolves with the particle effect. His tag count drops from 1 to 0. The career analysis summary subtly shifts — a tiny change, barely noticeable. But Tomás has learned something important: **tags are tools, not permanent judgments.** They serve a purpose for a time, and then they age out.

**Minute 1:00 — The Vocabulary Shift**

As the tag removes, a brief tooltip appears: `💡 Tags work best as temporary instruments. Set them when needed, let them expire when they're not. The system will remind you.`

Tomás reads it and nods. He'd been thinking of the adversarial tag as a condemnation — "ShadowByte is bad." Now he understands it's more like a diagnostic filter — "ShadowByte's matches were distorting my analysis, so I filtered them out." The filter is no longer needed. No hard feelings.

This vocabulary shift — from "label" to "instrument" — is the single most important thing the expiry system teaches. Tags aren't moral judgments. They're calibration tools.

**UI Annotations:**
- **Amber notification bar:** 32px height, amber background at 10% opacity, left-aligned ⏳ icon, right-aligned [Review] link. Dismissible via X, reappears next analysis if not reviewed.
- **Side-by-side preview:** Two panels, 50% width each, light gray dividing line. "With tag" on left, "Without tag" on right. Differences highlighted in amber. Identical values grayed to 50% to draw attention to changes.
- **Learning tooltip:** Appears 500ms after remove action. Pale blue background, 60% max-width, 5-second auto-dismiss. Italic text to distinguish from system messaging.

---

### Journey: Keiko, 42, Accessibility-Focused — Screen Reader Tag Management

**Context:** Season 7, Operator tier. Keiko uses a screen reader and has deuteranopia. She has 5 active tags and needs to review 2 that hit the evidence weakness threshold.

**Minute 0:00 — The Accessible Review**

Keiko's screen reader announces: "Career analysis loaded. Two adversarial tags require review. DarkVolt: evidence weakened. NightOwl: evidence expired. Press R to review."

She presses R. The review panel activates. Her screen reader reads the first entry in a structured format:

"DarkVolt. Tag type: concentration cap at fifty-five percent, decayed to sixty-seven percent. Current maximum concentration: forty-eight percent. Evidence: concentration weakened, config changed, matches active. System recommendation: re-tag at fifty percent. Options: Remove. Re-tag at fifty percent. Custom. Re-tag at fifty percent is recommended."

The information hierarchy is exactly what she needs: opponent name → tag state → current reality → recommendation. No visual chrome to parse. The flag color gradient that sighted players rely on is replaced by explicit age information: "Tag age: four seasons of six."

She navigates with arrow keys. Down arrow moves to NightOwl. Tab moves between action buttons. Enter selects. She accepts both recommendations in 30 seconds.

**Minute 0:30 — The Pin Decision**

Her screen reader announces: "You have re-tagged DarkVolt three times. Pin this tag? Two pinned slots available. Press P to pin."

She considers. DarkVolt has been adversarial for 5 seasons — but her config has changed dramatically. The pin might not be right yet. "Skip," she says (voice control active). The prompt dismisses. She'll pin if DarkVolt survives the next 6-season cycle too.

**UI Annotations:**
- **Screen reader structure:** ARIA landmark "adversarial-tag-review" with role="alertdialog". Each tag entry is a list item with structured data: opponent, tag type, evidence status, recommendation. Action buttons have descriptive labels: "Remove DarkVolt tag" not just "Remove."
- **Keyboard navigation:** R opens review from career analysis. Arrow keys navigate entries. Tab navigates within-entry options. Enter selects. Escape closes review. P triggers pin prompt (only when eligible).
- **Non-visual age encoding:** Screen reader reads "Tag age: N seasons of 6" rather than relying on flag color. For players with `reduced-motion` set, the flag pulse at season 6 is replaced by a static striped border pattern (alternating 2px dashes).

---

## Interaction Effects

### With 4.69e-ii — Known Adversarial Opponent Tagging (Creation Flow)

The creation flow should inform the expiry system from the start. When a player creates a tag, the confirmation drawer should show the default TTL: "This tag will expire in 6 seasons unless renewed or pinned." No additional action required — the default TTL applies automatically. But the information sets the player's expectation that tags are temporal.

The "original reason" field in the tag creation flow becomes critical for the expiry system — it's what the renewal prompt shows 3 seasons later. If the player left it blank at creation, the renewal prompt can only show "Tagged in Season 4 for unknown reason" — which makes the renewal decision harder. Consider a soft requirement: the creation drawer shows a text field for reason with a placeholder like "78% concentration in RELAY-C" pre-filled from current data. The player can modify or accept.

### With 4.69e-iii — Per-Opponent Threshold Override (Concentration Cap)

Cap decay is the most mechanically interesting interaction. The cap slider value stored in the tag is the player's original calibrated value. The effective cap (after decay) is wider. The cap slider UI should show BOTH: "Your set value: 50%. Current effective cap: 59% (seasonal decay applied)." When the player opens the cap adjustment panel, the slider should be at 50% (their value) with a ghost marker at 59% (effective). This makes decay visible and adjustable — the player can "refresh" by clicking anywhere on the slider, which resets the decay clock.

### With 4.69e-v — Adversarial Density (APS)

APS trend across tag expiry events is a powerful signal. When a tag expires or is removed:
- If APS drops or stays the same → the opponent was not contributing adversarial pressure → correct removal.
- If APS rises → the opponent WAS contributing adversarial pressure that was being suppressed → consider re-tagging.

The system should surface this post-removal APS delta in the next career analysis: "Since removing your tag on VoidPhase, your APS has risen from 0.12 to 0.28. Consider re-tagging. [Review VoidPhase]"

### With 4.69e-v-d — Seasonal APS Decay and Historical Archiving

Tag expiry and APS decay should be coordinated. If APS uses seasonal decay (previous season starts at 50%), then a tag that expires at season start gets a clean evaluation — the APS from the new season reflects current adversarial pressure without historical contamination. If APS carries over, a tag expiry might cause an APS spike from matches that were previously filtered.

**Recommendation:** Process tag expiry BEFORE computing seasonal APS. This ensures the new season's APS reflects the current tag state, not the previous one.

### With 4.69e-vi — Pool Size Calibration

Tags should store the pool context at creation: `pool_size_at_creation: 18, pool_adjusted_threshold_at_creation: 0.30`. During renewal, the system can compare: "When you tagged NebulaFang, your pool had 18 players and the adjusted threshold was 30%. Your current pool is 45 players with a 12% threshold. NebulaFang's current concentration is 22%." This helps the player understand whether the tag was set in a context where 65% was barely notable (small pool) or genuinely extreme (large pool).

### With 4.69e-vi-c — Cross-Season Pool Drift

When the pool grows significantly between seasons (e.g., 12 → 50), old tags should be flagged for review even before their TTL expires. A tag set in a 12-player pool with a 35% cap may have been permissive (barely above the pool-adjusted threshold of 27%). In a 50-player pool, the same 35% is extremely aggressive (pool-adjusted threshold is 6%). The tag hasn't expired, but its meaning has fundamentally changed. This is an evidence-based trigger (Option C's config-change signal, applied to the pool rather than the player's config).

### With 4.69e-vii — Per-Cluster Adversarial Exclusion

Per-cluster locks should follow the same decay schedule as their parent tag, but with a different consequence. When a per-cluster lock decays:
- A **suppress lock** reverts to auto (cap-controlled). If the cap has also decayed past the cluster's concentration, the cluster is now included — effectively, both the lock and the cap have faded.
- An **include lock** persists longer (4 seasons instead of 3 for suppress locks). The rationale: suppressing is more dangerous when wrong (hiding signal), so suppress locks should decay faster. Include locks are protective (keeping signal visible), so they can persist longer.

### With 4.69e-ix — Adversarial Tag as Community Signal

If anonymized tag frequency is a community signal ("this opponent is tagged as adversarial by 12 players"), tag expiry affects the aggregate. Expired tags should NOT count toward the community signal. But tags in their grace period (evidence weakened but not yet deactivated) should still count — they represent recent-enough judgments. The community signal should show: "Tagged by 12 players (8 active, 4 expiring)."

### With 4.69e-iii-a — Compound Adversarial Detection (Coalitions)

Group caps (coalition tags) should expire on the same 6-season ceiling, but with a coalition-specific review: "Your coalition tag on GhostFrame + StratusLayer has reached 6 seasons. Coalition compound score in last analysis: 1.2 (below 1.5 threshold). Recommend removing coalition." Coalition expiry should check the COMPOUND score, not individual concentrations — a coalition where no individual member is suspicious but the group effect persists should not expire just because individual evidence weakened.

### With 4.38 — Counterfactual History

Expired tags should be preserved in counterfactual history. The version tree shows: "Season 5: Tagged NebulaFang (cap 50%). Season 11: Tag expired (6-season ceiling). Season 11: Re-tagged NebulaFang (cap 48%)." This history is valuable for necropsy exports and community discussion — it shows the player's evolving understanding of adversarial dynamics. Expired tags are historical data, not garbage to be collected.

### With 4.69c — Agent Redesign Mode

Config change is an evidence signal for tag review. When the player enters redesign mode for an agent that has adversarial tags referencing its clusters, the redesign mode should show a reminder: "2 adversarial tags reference RELAY-C clusters. After redesign, these tags may need recalibration. [Review after redesign]" This plants the seed for post-redesign tag review without interrupting the creative flow of redesign mode.

---

## Comparable Games and Systems

### Overwatch's "Avoid as Teammate" System

The closest gaming analog. Overwatch 2 gives players 15 avoid slots, of which 3 can be pinned. Non-pinned avoids expire after 7 days. If the list is full, adding a new avoid removes the oldest non-pinned entry.

**What translates:** The pinned/timed two-tier model. The constraint on pin count forcing prioritization. The automatic cycling of old entries to prevent list bloat.

**What doesn't:** Overwatch's 7-day timer is too short for Robot Uprising's season-based cadence. Overwatch avoids affect matchmaking (who you play with), while Robot Uprising tags affect diagnostics (how you interpret data). Matchmaking avoids have immediate gameplay impact; diagnostic tags have indirect analytical impact.

**The key lesson:** Overwatch players constantly request more pin slots. The constraint feels frustrating even when it's correct. Robot Uprising's 2-pin limit will feel even more constrained — compensate with the quality of the timed expiry experience (evidence-based, with rich context in renewal prompts).

### Software Feature Flag TTL

Feature flags with mandatory expiry dates are the exact engineering analog. LaunchDarkly recommends setting an expiry date at flag creation time. Uber built Piranha to automatically remove 2,000 stale flags. The pattern is universal: configuration that outlives its context becomes technical debt.

**What translates:** The mandatory TTL at creation. The batch cleanup tool for accumulated stale entries. The audit trail (why was this flag/tag created? when? by whom?).

**The key lesson from Uber's Piranha:** Automated cleanup at scale is essential. Uber had 2,000 stale flags not because engineers were careless, but because manual cleanup doesn't scale. Robot Uprising's batch review UI with "Apply all recommendations" is the game-design equivalent of Piranha.

### DNS TTL (Time-To-Live)

DNS records have TTL values that determine how long a resolver caches the record before re-querying the authoritative server. Short TTLs (300s) ensure fresh data at the cost of more queries. Long TTLs (86400s) reduce query load but risk serving stale records after changes.

**What translates:** The fundamental trade-off between freshness and maintenance cost. Short tag TTLs (1 season) keep diagnostics fresh but create renewal fatigue. Long TTLs (6 seasons) minimize prompts but risk staleness.

**The key lesson:** DNS uses TTL as a per-record property, not a global setting. Different records get different TTLs based on how frequently they change. Robot Uprising could allow per-tag TTL customization — a binary tag on a volatile opponent might get a 2-season TTL, while a cap on a persistent rival gets 5 seasons. But per-tag TTL customization adds cognitive load. The hybrid approach (evidence + decay + hard ceiling) achieves variable effective lifetimes without requiring per-tag TTL decisions.

### Passport Expiry and Renewal

Passports expire after 10 years. Renewal requires updated photos, updated information, and a fee. The expired passport remains a valid identity document for some purposes (proof of citizenship) even after expiry. Some countries allow renewal up to 5 years after expiry without re-applying from scratch.

**What translates:** The distinction between "expired" and "deleted." An expired tag remains in the player's history and can be the basis for a streamlined re-tag (like renewing a passport vs. applying for a new one). The renewal process updates the tag's context (new cap values, new evidence) like a passport photo update.

### Spotify's "Don't Play This Artist" with Listen Activity

Spotify doesn't expire artist blocks. But if you block an artist and then play their song from a different context (e.g., a shared playlist), Spotify doesn't warn you — the block only affects algorithmic recommendations. The block and the user's actual behavior can silently diverge.

**What translates to Robot Uprising:** A tagged opponent whose matches the player's career analysis excludes is analogous to a blocked artist whose songs the algorithm excludes. If the player's behavior changes (they start facing the opponent in a new context, with a new config), the old tag silently misrepresents their current situation. The evidence-based expiry (Option C) detects this divergence.

---

## The TikTok Clip

15 seconds: The player scrolls through their tag management panel. Eight tags with flag icons at various stages of fade — some bright red, some dusty pink, one a flickering ghost. They hover over the ghost flag and the tooltip reads "Season 1, Analysis #1 — your first tag." They tap Remove. The ghost flag dissolves into particles. The career analysis summary shifts — a cluster appears that's been hidden for 8 seasons. The player's eyes widen. They lean forward. Cut to the cluster: a real structural weakness, invisible for years. Text overlay: *"Your oldest tag was hiding your biggest problem."*

---

## New Aspects Discovered

1. **4.69e-viii-a — Tag renewal as competitive signal:** When a player renews a tag, it means the adversarial relationship is ongoing and the player is actively maintaining their diagnostic hygiene. Should renewal events be visible in the Threat Model Report? "You renewed your tag on PhantomEdge — this suggests continued adversarial pressure." Could renewal cadence itself be a metric?

2. **4.69e-viii-b — Batch review UX for high-tag-count players:** At 15+ tags, the batch review UI needs pagination, sorting (by impact, by age, by recommendation), filtering (show only "recommended: remove"), and a "Trust all recommendations" button. What's the UI for a player with 20 tags hitting the ceiling simultaneously?

3. **4.69e-viii-c — Tag inheritance across account migration or season reset:** If the game ever has hard season resets (all configs wiped), should adversarial tags survive the reset? The opponent relationship persists even if the config context doesn't. Tags as social memory vs. tags as diagnostic instruments — different answers.

4. **4.69e-viii-d — Deactivated tag reactivation flow:** When a deactivated tag is reactivated, should it restart with a fresh 6-season TTL or resume from where it left off? Should the reactivation use original values or current data? The difference between "I accidentally let this expire" and "I'm re-tagging after a break" requires different flows.

5. **4.69e-viii-e — Tag expiry as tutorial for broader config hygiene:** The expiry system teaches players that configuration requires maintenance. This lesson transfers to hook configurations, rule priorities, context filters — all of which can become stale as the game evolves. Should the expiry system be the player's first encounter with the concept of "configuration debt"?

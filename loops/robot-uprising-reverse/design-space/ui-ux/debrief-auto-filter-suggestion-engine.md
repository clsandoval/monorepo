# Auto-Filter Suggestion Engine

**Aspect:** 4.69e-i-e — Auto-filter suggestion engine: if system detects adversarial signal strength >50% from a single opponent, proactive suggestion to run a filtered analysis excluding that opponent; what the suggestion looks like (banner, tooltip, interstitial); interaction with 4.69e-i concentration warning.

**Parent:** 4.69e-i — Career analysis scope filter UI design
**Siblings:** 4.69e-i-a (sample size warning threshold); 4.69e-i-b (opponent list sorting at scale); 4.69e-i-c (filtered analysis data points in season health trend graph); 4.69e-i-d (scope summary legibility in exports)
**Related:** 4.69e (adversarial multi-cluster poisoning); 4.69e-ii (known adversarial opponent tagging); 4.69e-iii (per-opponent threshold override); 4.69e-v (adversarial density as season metric); 4.69l (threshold recommendation engine)

---

## The Problem Being Solved

The career analysis scope filter (4.69e-i) is a powerful countermeasure against adversarial poisoning — but it's a **reactive tool in a passive interface**. The player must:
1. Know the scope filter exists
2. Know they are being adversarially targeted
3. Know that the filtered analysis will reveal a different result
4. Take the initiative to open the filter shelf, select opponents to exclude, and re-run

That's four cognitive jumps, any of which can fail. A new player who's been poisoned for three matches won't even know the filter shelf is there. A veteran who suspects poisoning but hasn't seen a concentration warning might not know the 50% threshold has been crossed.

**The auto-filter suggestion engine is the system taking initiative.** When the concentration of a single opponent's matches in the top cluster candidate crosses a threshold — defaulting to 50% adversarial signal strength (AS%) — the system offers, unprompted, to run a filtered analysis excluding that opponent. The player can accept in one tap.

This is not an alert that something is wrong. It's a **research offer**: "here's an analysis you might find interesting." The framing matters enormously. The system must not accuse the opponent. It must not alarm the player. It must simply say: "your data has an unusual concentration pattern — want to see what the analysis looks like without it?"

---

## The Core Design: Where and How the Suggestion Appears

### Trigger Condition

The engine fires when, at career analysis completion time:

```
AS%(opponent_X) ≥ 50% for the top cluster candidate
```

Where AS%(opponent_X) = (matches from opponent_X in which the cluster candidate appeared) / (total appearances of the cluster candidate across all matches in scope)

**At 50%:** One opponent accounts for more than half of the data driving the top fix recommendation. This is a meaningful concentration — not necessarily adversarial, but worth examining. A player who exclusively matched against one friend in co-op practice sessions would also trigger this, and the filtered analysis would correctly show a different picture.

**The threshold is adjustable** in settings (4.69l territory), but 50% is the default. Below 50%, the concentration may exist but isn't high enough to suggest the analysis is systematically distorted.

**The engine only fires once per opponent per season** unless the AS% changes by more than 15 percentage points since the last suggestion. This prevents repeated nagging.

---

## Suggestion Surface: Four Design Options

The core question is **where and how** the suggestion appears. This is not one obvious answer. The suggestion can appear at three moments in the workflow:
- **Pre-run** (before the player runs the career analysis)
- **Post-run, inline** (in the results panel, near the top cluster)
- **Post-run, overlay** (as an interstitial before the results are shown)
- **Passive** (as a persistent indicator in the filter shelf)

### Option 1: "The Result Banner" — Post-Run Inline

**What it is:** After career analysis completes and results are displayed, a banner appears at the top of the result list, above the first fix candidate. It is styled in amber — the same amber used for filtered analyses and adversarial warnings — and reads:

```
┌────────────────────────────────────────────────────────────────────┐
│  ⚡ VoidEater_Prime accounts for 61% of RELAY-C's cluster coverage  │
│  Run filtered analysis excluding VoidEater_Prime?   [Run Now] [✕]  │
└────────────────────────────────────────────────────────────────────┘
```

The banner is **not alarming**: it names the opponent, names the agent, names the percentage. It presents a concrete action. The player can dismiss with ✕ (which suppresses this opponent's suggestion for 2 weeks) or tap `[Run Now]` to immediately launch a filtered analysis.

**Tapping [Run Now]:**
- The filter shelf opens (if not already open), with VoidEater_Prime pre-unchecked
- The match count updates in real time: `186/247 matches`
- A second `[Run Analysis]` button is highlighted at the top right of the filter shelf
- The original full-scope result remains visible below the filter shelf so the player can compare

**Visual treatment:**
- Banner background: `#4A3A00` (very dark amber, matching the amber filter pill color family)
- Border: 1px solid `#FFB000` (amber)
- Left edge accent bar: 3px solid `#FFB000`
- Icon `⚡` in amber (not ⚠️ or ☠️, which are adversarial accusation icons — ⚡ signals anomaly/energy, not threat)
- Font: same size as result list rows, slightly lighter weight than cluster flag text

**Strength:** The suggestion appears in context, directly adjacent to the cluster it references. The player has just seen the top result and is primed to care about it. The banner is actionable without navigating away.

**Weakness:** The banner adds visual noise to the result list. A player who doesn't care about filtered analysis (because they know the opponent and trust the data) still has to dismiss it. If the banner appears every single career analysis run because the player always has one dominant opponent, it becomes wallpaper.

---

### Option 2: "The Concentration Warning Callout" — Inline on the Cluster Candidate

**What it is:** Instead of a separate banner, the suggestion is surfaced as a callout *on the cluster candidate row itself*. The top fix candidate row in the result list gains an additional indicator — a small `⚡ 61% from VoidEater_Prime` tag inline — and the `⊕ details` sub-panel for that candidate includes an expanded section:

```
RELAY-C — 52% total coverage (3 matches)   ⚡ VoidEater_Prime

┌─ ⊕ DETAILS ─────────────────────────────────────────────────────────┐
│  COVERAGE BREAKDOWN                                                   │
│  All matches (247):   RELAY-C appears in 52% of clusters             │
│  ─────────────────────────────────────────────────────────────────── │
│  ⚡ CONCENTRATION DETECTED                                             │
│  VoidEater_Prime's matches: 61% of RELAY-C's total cluster coverage  │
│  This means most of RELAY-C's cluster signal comes from one opponent. │
│                                                                       │
│  [Run filtered analysis excluding VoidEater_Prime →]                 │
└──────────────────────────────────────────────────────────────────────┘
```

The `⚡` tag on the cluster row is the surface indicator. The sub-panel is the depth layer. A player who doesn't open the sub-panel sees only a small anomaly marker — not disruptive. A player who investigates sees the full concentration breakdown and can launch the filtered analysis from there.

**What "Run filtered analysis excluding VoidEater_Prime →" does:**
- Opens filter shelf with VoidEater_Prime pre-unchecked (same as Option 1)
- The sub-panel closes, focus shifts to filter shelf
- A `[← Return to RELAY-C details]` breadcrumb appears in the filter shelf, so the player can navigate back to compare

**Strength:** The suggestion is tied directly to the data that caused it. The player sees the cluster, sees the anomaly, sees the action in a single scrollable area. There's no separate banner to dismiss. The ⚡ tag is subtle for experienced players who don't need the explanation; the details panel provides full depth for players who do.

**Weakness:** Players who don't use the `⊕ details` sub-panel will miss the suggestion entirely. The tag is small and can be overlooked. This option has less discoverability than the banner — it relies on player curiosity to drill in.

---

### Option 3: "The Pre-Run Advisor" — Before the Analysis Runs

**What it is:** Before running career analysis, the system pre-scans existing match data to check for concentration patterns. If a concentration above the threshold is detected, a soft advisory appears inside the `[Run Analysis]` button area:

```
┌────────────────────────────────────────────────────────────────────┐
│  ⚡ Concentration pattern detected (VoidEater_Prime, ~60% signal)   │
│  Run: [Full analysis] or [Filtered: exclude VoidEater_Prime]       │
└────────────────────────────────────────────────────────────────────┘
```

The player is offered two distinct run modes before committing to either. This is the **forking point** design — the system surfaces the choice before the analysis runs rather than after.

**What the button area looks like:**

Where normally there is one `[Run Analysis]` button, there are now two:
- `[Full Analysis]` (default, dark neutral, left)
- `[Filtered: −VoidEater_Prime]` (amber, right, with the ⚡ icon)

The amber button is visually distinct but not alarming. It is not labeled "ADVERSARIAL DETECTED" — it is labeled as a scope choice.

**Why this approach is distinct:** The player is deciding *before* seeing results. They haven't been primed by the full-scope results yet. This means:
- If they choose Filtered first, they don't have the full-scope results to compare against (downside: loses "divergence is the story" effect)
- If they choose Full first, they get the same experience as the post-run options
- If they choose Filtered first, they save a full-scope run and go straight to the actionable result (upside: more efficient if they already suspect the opponent)

**An important subtlety:** The pre-scan that powers the pre-run advisor doesn't run a full career analysis — it runs a fast approximation (opponent match-count by agent-appearance). This approximation may not perfectly match the actual AS% that results from the full analysis. The advisory should caveat: "~60% signal" (approximate), not "61% signal" (exact). The exact number only exists after analysis runs.

**Strength:** The player makes the scope decision with awareness, not retroactively. Avoids the "run → see results → re-run filtered → compare" cycle for players who are already suspicious. Efficient.

**Weakness:** Adds friction to the analysis flow for players who don't care (they have to choose between two buttons where before there was one). The pre-scan approximation may differ from the actual result — if the actual AS% is 48% when the pre-scan estimated 60%, the advisory would not have fired if we'd waited for the real number. Pre-run advisories based on estimates feel less trustworthy than post-run advisories based on exact data.

---

### Option 4: "The Persistent Indicator" — Always Visible, Never Intrusive

**What it is:** The suggestion is not surfaced as a banner, callout, or interstitial. Instead, the filter shelf toggle — which normally shows a neutral pill (`All matches · 247 total`) — shows an annotated version when concentration is detected:

```
[SCOPE: All matches · 247 total · ⚡ VoidEater_Prime 61%]
```

This is purely informational. The filter shelf is still collapsed. The player can click the shelf to expand it and investigate, or ignore the annotation entirely.

Inside the filter shelf, when it expands, VoidEater_Prime is **highlighted** (amber row background, not checked or unchecked automatically) with a note:

```
⚡ VoidEater_Prime    8 matches   AS: 61%   [✓]   ← High concentration
```

The `← High concentration` label appears only on this opponent. No action is taken automatically. No banner has appeared. The player decides whether to exclude.

**Strength:** Zero noise for players who don't care. The scope pill is always visible (the player uses it for filtered analysis labeling already), so the annotation is seen without any modal or banner. A veteran who already knew about VoidEater_Prime sees the number and says "yep, 61%, expected — excluding now." The suggestion doesn't interrupt their flow; it merely informs it.

**Weakness:** Almost certainly too subtle for players who need the guidance most. A new player who doesn't know what AS% means or what the ⚡ means will scroll past the scope pill annotation without registering it. The persistent indicator works well as a *secondary* signal, less well as a *primary discovery* mechanism.

---

## Recommended Design: "The Result Banner + Persistent Indicator" (Layered)

The auto-filter suggestion engine should layer two signals:

**Layer 1 (Primary): The Result Banner** (Option 1), firing **once per opponent per detected concentration event**. It is dismissible and appears immediately after the full-scope analysis completes. Dismissal suppresses the banner for this opponent for the rest of the current season (not two weeks — seasonal suppression is more meaningful). The banner provides the first-discovery experience.

**Layer 2 (Secondary, persistent): The Scope Pill Annotation** (Option 4), firing whenever AS% ≥ 50% is present in the current result's data, regardless of whether the banner has been dismissed. Once the player knows what the scope pill annotation means, this is enough. The banner teaches; the annotation reminds.

This means:
- **First time** the concentration threshold is crossed for opponent X: banner appears in the result panel, and scope pill is annotated
- **After the player dismisses the banner**: banner is suppressed, scope pill annotation persists
- **Every subsequent analysis run where X still exceeds 50%**: no banner, but scope pill shows `⚡ [X] 61%`
- **If the player explicitly filters out X and re-runs**: filtered result is stored; next full-scope run checks whether X's AS% is still high; if resolved (player improved their config against X), concentration warning clears

---

## Interaction with 4.69e-i Concentration Warning

The **concentration warning** in the parent design (4.69e-i) refers to the ⚠️ tag on opponents in the By Opponent list whose AS% is high. This is a passive indicator inside the filter shelf — visible only when the shelf is open.

The auto-filter suggestion engine is the **active version** of the same information. The relationship:

| Signal | Location | Triggered By | Player Action Required |
|---|---|---|---|
| Concentration warning (4.69e-i) | Inside filter shelf, opponent row | AS% calculation when shelf is open | Player must open filter shelf |
| Auto-filter banner (4.69e-i-e, Layer 1) | Above result list, after analysis | AS% ≥ 50% at analysis completion | Player sees it automatically |
| Scope pill annotation (4.69e-i-e, Layer 2) | Filter shelf toggle pill, always visible | AS% ≥ 50% at analysis completion | Player must glance at top of panel |

The concentration warning inside the opponent list and the auto-filter banner are complementary, not redundant:
- The banner fires once and disappears (dismissed or expired)
- The concentration warning in the opponent list persists as long as the player views that list
- The scope pill annotation is the persistent surface indicator

**There is no duplication problem.** Once the player opens the filter shelf after seeing the banner, they see the concentration warning on the opponent row — consistent labeling, different location. The ⚡ icon is used for both, so the player builds a vocabulary: ⚡ means concentration anomaly, regardless of where they see it.

---

## Naming: "The Anomaly Lamp"

The auto-filter suggestion engine's visual pattern — a small amber ⚡ icon, appearing on the scope pill and on the cluster candidate row, never alarming, always present when concentration is high — deserves a name for design discussions.

**"The Anomaly Lamp."** It's always on when the anomaly is present. It never shouts. It is the kind of light that a careful engineer notices and investigates; an inattentive player walks past it. The lamp is educational over time: once a player has learned what ⚡ means, the banner is no longer needed. The lamp alone is sufficient.

The banner is the teaching moment. The lamp is the maintenance mode.

---

## Player Journeys

---

#### Journey: Wren, 24, Ex-streamer, Mid-Competitive Ladder

**Context:** Season 3, Week 8. Wren has been running career analyses approximately twice a week. She's aware of the scope filter but has never used it — no reason to, her opponent pool has been diverse. She has 22 unique opponents this season. VoidEater_Prime joined the ladder three weeks ago and has queued into her 7 out of her last 12 matches, apparently intentionally.

---

**Minute 0:00 — End-of-Session Career Analysis**

The post-match screen collapses and Wren navigates to the career analysis panel. She taps `[Run Analysis]`. The spinner runs for 1.2 seconds. Results appear.

*She sees: The top fix candidate — RELAY-C at 54% cluster coverage, three matches. Same as last week. She's been trying to redesign it but the cluster keeps showing up.*

Then: the amber banner appears above the result list, sliding in from the top over 0.3 seconds.

```
⚡ VoidEater_Prime accounts for 57% of RELAY-C's cluster coverage
Run filtered analysis excluding VoidEater_Prime?    [Run Now]  [✕]
```

Wren stares at it. "What does that mean?"

She does not dismiss immediately. She reads it twice. She doesn't know what adversarial signal strength is. But she knows VoidEater_Prime — that's the person who keeps matching into her. "Accounts for 57% of RELAY-C's cluster coverage" is legible without technical knowledge: VoidEater_Prime is responsible for most of the RELAY-C problem.

She taps `[Run Now]`.

---

**Minute 0:45 — The Filter Shelf Opens**

The filter shelf expands. VoidEater_Prime is already unchecked and highlighted in amber. The match count reads `190/247`. The `[Run Analysis]` button at the top right pulses once to draw attention.

Wren notices the `⚡` next to VoidEater_Prime and the `AS: 57%` label. She doesn't know what AS stands for but the percentage is self-explanatory in context.

She taps `[Run Analysis]`.

---

**Minute 1:30 — The Filtered Result**

Results appear. The top fix candidate is now SCOUT-B at 31% coverage. RELAY-C has dropped to 4th place.

Wren blinks. "Wait. RELAY-C isn't even a problem without VoidEater_Prime?"

She scrolls the two results side-by-side (the original full-scope result is cached and visible below the filter shelf). RELAY-C at 54% → 4th place at 14%. SCOUT-B barely registered in the full analysis → now the top problem.

*This is the moment.* Wren realizes her diagnostic tool has been showing her the wrong problem for three weeks. She's been trying to fix an agent that isn't actually broken. She was being steered.

She opens the `⊕ details` sub-panel on RELAY-C in the full-scope result. She sees: 7 of RELAY-C's 13 appearances came from VoidEater_Prime. "That's not a coincidence," she says.

She opens the known adversarial opponent tagging UI (4.69e-ii) and marks VoidEater_Prime as `⚠️ Suspected Adversarial`.

**UI Annotations:**
- Result banner: amber, 44px tall, slides in from top, non-blocking (result list visible below it)
- Banner ✕ button: 24×24px, top-right of banner, hover state darkens ✕ color
- Banner [Run Now]: 80px wide, 28px tall, amber fill, dark text
- Filter shelf VoidEater_Prime row: amber background `#2A1E00`, ⚡ icon prepended to name, `AS: 57%` right-aligned
- Filtered analysis tab: amber label `Filtered · 190/247`
- Both results visible simultaneously: original result dimmed (60% opacity) behind filter shelf, re-activates when shelf collapsed

---

#### Journey: Tanis, 37, Former Competitive Card Game Player, Veteran of Robot Uprising

**Context:** Season 7, Week 12. Tanis has used the scope filter many times. He's aware of the auto-filter banner and knows what ⚡ means. He has a persistent filter named "No_Synthwave_Guild" that excludes three known coordinated opponents. He runs career analysis weekly.

---

**Minute 0:00 — Routine Analysis Run**

Tanis opens career analysis. He glances at the scope pill before running: `All matches · 312 total · ⚡ ghost_protocol 53%`. He did not expect this.

He hasn't seen ghost_protocol as a threat before. He pauses. The scope pill annotation is enough — he doesn't need the banner (he's already learned the lamp).

He opens the filter shelf. ghost_protocol is highlighted in the opponent list with `AS: 53%`. 53% from one opponent he doesn't recognize.

He checks ghost_protocol's `⊕ details` sub-panel. The match history shows: 6 matches in the last 2 weeks, all against the same two agents (RELAY-C and HOOK-7). He recognizes the pattern. "New adversarial. Targeting my relay chain."

He doesn't run a filtered analysis yet. First, he taps ghost_protocol's name to open their profile (in the broader competitive UI). He checks their recent match history. Nine different opponents in the last two weeks — none of the matches show the same targeting pattern as against Tanis. Ghost_protocol is specifically matching into Tanis and stress-testing the same nodes.

He returns to career analysis. He runs filtered: `Excluding ghost_protocol`. Results confirm: his relay chain is fine.

He marks ghost_protocol `☠️ Confirmed Adversarial` and saves a new filter: `No_Synthwave_Guild_v2` including ghost_protocol.

*He does not dismiss the banner because the banner never appeared — the persistent scope pill annotation was enough for him.*

**UI Annotations:**
- Scope pill annotation: appears without banner because this is Tanis's 7th interaction with the ⚡ system; the game suppresses the banner for users who have dismissed it 3+ times (they've learned the lamp)
- Banner suppression logic: after 3 dismiss events total (not per-opponent), the banner is permanently suppressed for this player; only the scope pill annotation fires going forward
- VoidEater_Prime `⊕ details` sub-panel in opponent list: includes `Recent matches` section showing date, opponent (this player), agents targeted in that match
- Filter save: naming dialog for "No_Synthwave_Guild_v2" appears after [Save filter] tap; autofills with previous filter name + detected new opponent appended

---

#### Journey: Mira, 16, Completely New to Strategy Games, Tutorial Campaign Week 3

**Context:** Mira has just completed mission 5 of the tutorial campaign. She's been introduced to skills and rules, hasn't touched hooks yet. She's in the career analysis panel for the first time — the game guided her here after suggesting she review her progress.

---

**Minute 0:00 — First Career Analysis, First Banner**

The career analysis tutorial overlay has walked Mira through: "this panel shows patterns in how your agents get defeated." She taps `[Run Analysis]`.

Results appear. Her only opponent so far is the tutorial AI, which has been consistent. The top fix candidate is SCOUT-B at 67%. The auto-filter banner fires:

```
⚡ Tutorial_AI accounts for 100% of SCOUT-B's cluster coverage
Run filtered analysis excluding Tutorial_AI?    [Run Now]  [✕]
```

*Wait. Tutorial_AI accounts for 100%? Of course it does — Tutorial_AI is the only opponent Mira has faced.*

The banner fires correctly by the trigger condition (100% > 50%) but is not useful here. This is a false positive — not adversarial, just low opponent diversity.

Mira is confused. "Why would I exclude Tutorial_AI? That's the only enemy I've fought."

She dismisses the banner (✕). Good. The banner disappears. The scope pill annotation remains: `All matches · 47 total · ⚡ Tutorial_AI 100%`.

She is now slightly more confused than she was before.

**The problem this journey reveals:** The auto-filter suggestion engine needs a **minimum opponent diversity gate**. If the player has faced fewer than 3 distinct opponents, or if one opponent accounts for >80% of total matches (not just cluster coverage), suppress the suggestion. The suggestion is only meaningful when opponent diversity exists but concentration is high within that diversity.

**Updated trigger condition:**
```
AS%(opponent_X) ≥ 50%
AND total_distinct_opponents ≥ 3
AND opponent_X_match_share < 80%   ← opponent is present but not the only opponent
```

The third condition excludes Mira's case (Tutorial_AI = 100% of all matches). The first two conditions target genuine adversarial concentration within a diverse opponent pool.

**After dismissal, Mira continues** through the tutorial campaign without seeing the banner again. When she reaches career Season 1 Week 3 with 12 distinct opponents, the suggestion engine fires meaningfully for the first time — at that point, Mira is ready to understand it.

**UI Annotations:**
- Banner in tutorial context: fires then suppresses after dismiss, but a post-dismiss tooltip appears: "This warning compares opponents. Face more opponents for it to be useful." (Tutorial-only behavior, suppressed in live career)
- Tutorial career analysis overlay: continues after banner dismiss, does not mention the banner (avoiding over-explanation of a false positive)
- Season 1 Week 3 first true firing: the banner fires in full; the career analysis tutorial tooltip for the scope filter cross-references the banner: "Remember the ⚡ symbol? That's what it looks like when one opponent has an unusually large influence on your results."

---

## Discovered Sub-Aspects

This analysis reveals several design questions worth exploring as separate aspects:

- **4.69e-i-e-i — Banner suppression threshold**: after how many dismissals (total, not per-opponent) does the game switch from "banner mode" to "lamp mode" (scope pill annotation only)? What is the transition itself? Is there a one-time tooltip "We'll show this as a subtle indicator from now on, since you know how this works"?

- **4.69e-i-e-ii — Auto-filter suggestion in the pre-run context**: the recommendation engine (4.69l) could surface a suggestion *before* the analysis runs, based on the fast concentration pre-scan — designing the interaction between 4.69l's recommendation UI and the auto-filter suggestion to avoid duplicate or conflicting prompts

- **4.69e-i-e-iii — Minimum opponent diversity gate design**: the exact trigger condition for suppressing the auto-filter suggestion when opponent diversity is too low to make the suggestion meaningful; the three-condition gate from the Mira journey needs detailed specification, especially for edge cases (co-op-only players, private practice runs, mixed-pool seasons)

- **4.69e-i-e-iv — The "one-tap accept" flow in detail**: what exactly happens between tapping [Run Now] on the banner and seeing the filtered result; whether the full-scope result is still visible during the filtered run; how the comparison state is handled when both results are available; scroll position preservation

- **4.69e-i-e-v — Seasonal reset of banner suppression**: if the player has dismissed the banner for opponent X this season and X is still adversarial next season, does the banner re-fire at the start of the new season? Or is suppression permanent? Seasonal reset (re-fires once per season per opponent) maintains awareness while not being annoying; permanent suppression trusts the player's judgment permanently

---

## The 15-Second TikTok Clip

The clip: a player is looking at their career analysis results. RELAY-C is highlighted red, 54% cluster coverage. "I've been trying to fix this for three weeks," the caption reads. An amber banner slides in from the top. The player reads it, taps [Run Now]. The results refresh. RELAY-C drops off the top of the list. SCOUT-B takes its place. The player leans back in their chair. "They were steering me."

Cut to the player opening the opponent tagging UI and marking the opponent with a skull.

That clip. That's the moment. The diagnostic tool used against you, the realization, the counter. Fifteen seconds.

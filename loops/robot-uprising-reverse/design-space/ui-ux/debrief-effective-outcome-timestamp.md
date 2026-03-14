# Effective Outcome Timestamp as a First-Class Metric

**Aspect:** 4.18 — The tick at which a match's outcome was "effectively determined" (minimum-counterfactual tick) shown in post-match stats; comparing this to max_ticks reveals "how much of the match was foregone conclusion"; effective-determination-to-max-ticks ratio as a Gauntlet map quality indicator (low ratio = high false pivot density = rich sealed content)

**Parent:** 1.06c-ext-A-ii — The False Pivot Anti-Pattern
**Siblings:** 4.04b — Two-Act Debrief Structure; 4.19 — False Pivot Annotation Opt-Out; 4.20 — Counterfactual Simulation as Advanced Debrief Feature
**Related:** 1.06c-ext-A-i — Replay Length as Tension Design; 8.10 — Gauntlet Map Template System; 7.11 — Match Duration as Community Health Signal

---

## The Core Concept

Every Robot Uprising match has a clock that the player never sees during the sealed watch: the **Effective Determination Tick (EDT)**. This is the earliest tick at which the match's outcome was causally locked — the point before which a small change would have flipped the result, and after which no change to the player's architecture (within the match) could have saved them.

The EDT is not the same as when the match *looked* decided. It's not the tick where the score first became one-sided. It's not the moment the dramatic event fired. It is the minimum-counterfactual tick: **the last tick at which the outcome was still genuinely in play.**

After the EDT, every agent still moving, every hook still firing, every buffer still filling — all of it is *enacting* an outcome that was already determined. The robots don't know this. They're doing their jobs faithfully. But the result is foregone.

**The EDT/max_ticks ratio is the single most information-dense number a Robot Uprising match produces.** It tells you, compressed into one fraction, the character of the entire match:

- **EDT/max_ticks = 0.10** — The match was decided at 10% of its duration. Ninety ticks of perfectly competent execution played out inside a container that was already concluded. Maximum false pivot density. The sealed watch is maximally dramatic because the genuine pivot happened before the match visually "began." The diagnostic challenge is enormous — the root cause is buried in ticks 1–12 under 90 ticks of spectacular consequence.

- **EDT/max_ticks = 0.50** — The pivot was at the midpoint. A genuinely contested match. The two architectures competed equally through the opening game, and something in the midgame tipped the balance. This is the "ideal" competitive shape — maximum uncertainty during the sealed watch, a diagnostic puzzle with a clearly traceable midgame origin.

- **EDT/max_ticks = 0.85** — The outcome wasn't locked until tick 102 of a 120-tick match. The sealed watch was a 100-tick genuine uncertainty followed by a 15-tick resolution. Both architectures were genuinely competitive through nearly the entire match. Dramatic late-pivot, high-intensity final ticks.

- **EDT/max_ticks = 0.98** — A "last-second" match. The outcome was determined at tick 117 of 120. The "contested duration" metric (1 - EDT/max_ticks) is 2%. The sealed watch was pure genuine uncertainty until the very end. The diagnostic challenge is the hardest possible — the root cause *is* the late-match event, with no foreground/background confusion.

Each of these match shapes teaches different things, produces different emotional textures, and serves different community functions. The EDT, displayed as a post-match stat, makes all of this **legible** — transforms a subjective "that felt like a close match" into a precise architectural fact.

---

## Computing the EDT: The Minimum Counterfactual Method

Because Robot Uprising's tick scheduler is fully deterministic and fully logged, computing the EDT is tractable — not trivial, but tractable.

### The Naive Algorithm

For every tick T from 1 to the outcome tick:
1. Fork the simulation from tick T
2. Apply a minimal variation to the player's configuration at tick T (flip one buffer query result, deliver one evicted signal, change one hook trigger from True to False)
3. Re-simulate from T to max_ticks
4. Check if the outcome flips

The EDT is the *earliest tick* at which a minimal variation causes outcome flip.

**The problem:** This is O(max_ticks × variation_space) — computationally expensive. A 120-tick match with complex architectures could require thousands of re-simulations.

### Practical Approximations

Three approaches that are fast enough for real-time post-match computation:

**Option A — Dominant Advantage Threshold (DAT)**

Define "effectively determined" as: the moment one architecture's simulation-forward expected value (from a simplified model) crosses a non-recoverable threshold. Rather than re-simulating all branches, compute a lightweight advantage function on each tick's state (objective presence differential + buffer health differential + active unit differential, weighted by historical correlation with outcome). Find the earliest tick at which this function crosses a 90% confidence floor.

*Quality:* Good for most matches. Fails for matches where the advantage function is systematically misleading (e.g., a match where one side led presence score 40–10 but lost because of buffer endurance). These are also the most interesting false-pivot-dense matches — which is fine, because DAT's inaccuracies occur precisely where the false pivot phenomenon is richest.

*Computation cost:* Cheap. Can be computed in O(max_ticks) using the already-logged state transitions.

**Option B — Critical Signal Trace**

Work backward from the outcome. Identify the losing condition (which signals were missing, which rules failed, which hooks fired into dead consumers). Trace each signal's causal chain backward: this signal was dropped because the buffer was full; the buffer was full because of these 3 earlier entries; those entries arrived because of these 2 earlier signals. Find the earliest signal in the chain whose absence would have prevented the cascade.

*Quality:* High fidelity for cascade-failure losses. Lower quality for gradual-deterioration losses (matches where no single causal chain dominates — the architecture just performed consistently slightly worse). This backward-trace is the same algorithm that places the gold diamond in the debrief (aspect 1.06c-ext-A-ii) — the EDT is the timestamp of that diamond's placement.

*Computation cost:* Medium. O(max_ticks × signal_chain_depth). For complex architectures with 20+ agents, this can be slow — but acceptable as a post-match background computation.

**Option C — Hybrid (DAT fast pass + Critical Signal deep dive)**

Run the DAT method first (O(max_ticks)). If DAT confidence is high (≥90% threshold crossed cleanly), use DAT's result. If confidence is ambiguous (threshold crossed gradually or oscillated), run the Critical Signal Trace to get a precise tick window. Apply the result to the gold diamond, the EDT stat, and the contested duration display.

**Recommendation:** Option C. Fast for the common case, precise for the interesting case.

### What the EDT Is Not

The EDT is not a moral judgment on either architecture. An early EDT doesn't mean either player "played badly" or the match was boring. It means the architectural decision space locked early — often because of deep design choices that produced a structural advantage before first contact. This can be the sign of brilliant pre-match planning or of a severe mismatch. The EDT stat doesn't distinguish; the player's debrief work does.

---

## The Post-Match Statistics Panel: Where the EDT Lives

The EDT is surfaced in a new panel in the post-match summary — the screen that appears after the sealed bar dissolves and the player has chosen to enter analysis mode rather than jumping directly to the workbench.

### Layout

```
╔══════════════════════════════════════════════════════════════════╗
║  MATCH ANALYSIS                            Gauntlet — Operative  ║
║                                                                  ║
║  Ghost_Architect_7 vs. NullVector_Prime                          ║
║  Result: WIN  ·  120 ticks                                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  MATCH SHAPE                                                     ║
║  ──────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  Effective determination:  TICK 28   (23% of match)             ║
║  Contested duration:       77%       [████████████░░░░]          ║
║                                                                  ║
║  [TICKS 0───────28───────────────────────────────────120]        ║
║   [    contested    ][         foregone conclusion       ]        ║
║                                                                  ║
║  Win probability at pivots:                                      ║
║     Tick 28 (EDT):  ████░░░░░░ 52%  →  ███████░░░ 74%           ║
║     Tick 60:        ████████░░ 82%                               ║
║     Tick 90:        █████████░ 91%                               ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Visible false pivot windows:  2                                 ║
║  Most dramatic false pivot:    TICK 52  (cascade miss)           ║
║     → "Outcome unchanged. True pivot was Tick 28."              ║
╚══════════════════════════════════════════════════════════════════╝
```

### Reading the Panel

**Effective determination** is the headline number. "Tick 28 (23% of match)" tells the player that by tick 28 — before a single hook cascade had fired, before the dramatic midgame engagement — the match was effectively decided. Everything that happened afterward was downstream.

**Contested duration** is the inverse (100% - EDT%). Here, 77% of the match was genuinely contested (ticks 0–28), and 23% was the sealed watch playing out a conclusion that was already written. This is counterintuitive — 77% contested feels like a close match — but the reverse feels more natural: a 23% effective determination feels like it was decided very early. The contested duration framing is more emotionally accessible.

**The timeline bar** is a horizontal visual — the contested portion lit amber, the foregone conclusion portion dimmed. This makes the match shape viscerally legible at a glance. For a match with EDT = 0.50 (midpoint determination), the bar is lit amber on the left half and dimmed on the right. For a late EDT, nearly the whole bar glows.

**Win probability at pivots** shows three data points: the EDT, the midgame, and late game. Each shows the pre-EDT probability and post-EDT probability, communicating the "snap" when the outcome locked. In this example: 52% → 74% at tick 28 means the architecture was effectively even heading into tick 28, and the event at tick 28 moved the probability from 52% to 74% — a 22-point snap. That's the EDT.

**Visible false pivot windows** is a count and a callout. The game identifies the most dramatic false pivot — here tick 52, the cascade miss — and labels it explicitly: "Outcome unchanged. True pivot was Tick 28." This is the plain-language version of the gold diamond annotation, surfaced in the match summary rather than requiring the player to scrub to it in the debrief.

---

## The EDT Ratio as Gauntlet Map Quality Indicator

This is where the metric transcends individual match analysis and becomes a **designed system tool**.

Each Gauntlet map produces a distribution of EDT/max_ticks ratios across all matches played on it. This distribution is observable (every match is logged), computable (EDT is calculated post-match), and actionable (maps can be retired or rebalanced based on it).

### What Map EDT Distributions Reveal

**A healthy competitive Gauntlet map** produces a bell-shaped EDT distribution centered near 0.45–0.65. Most matches are decided in the midgame. Both early-game-dominant architectures and endgame-endurance architectures have some representation at the tails.

**An early-resolution map** (e.g., a map where most matches have EDT < 0.25) indicates:
- The map rewards first-mover advantage too heavily
- Architectural diversity is low — only one type of architecture wins (the fastest early-game variant)
- False pivot density is very high (most of each match is foregone conclusion with spectacular events)
- Sealed tension is maximally rich, but debrief diagnostic work is most difficult
- Community feeling: "This map is swingy — either you stomp them or they stomp you"

**A late-resolution map** (e.g., EDT distribution heavily weighted toward 0.75–0.95) indicates:
- Matches are genuinely contested throughout
- Deep architectures have a competitive advantage (endgame buffer endurance matters)
- False pivot density is low — dramatic moments are more likely to be genuine pivots
- Sealed tension is maximum genuine uncertainty
- Community feeling: "This map is intense — you never know until the last ticks"

**A bimodal distribution** (peaks at 0.15 and 0.80) indicates a **non-transitive meta**:
- Some architecture matchups are one-sided stomps (EDT in the first 20%)
- Other matchups are genuinely contested (EDT in the last 20%)
- The map has a strong counter-strategy pattern — certain configurations beat certain configurations easily, while well-matched configurations produce long fights
- This is interesting for the meta but frustrating for individual players who get the "wrong" matchup

### The Gauntlet Map Eligibility Criterion

For a map to be Gauntlet-eligible (for ranked play), it should produce an EDT distribution where:
- **≥60% of matches have EDT between 0.25 and 0.80** (the "contested midgame" zone)
- **≤15% of matches have EDT < 0.15** (early determination — near-stomps)
- **Mean EDT ≥ 0.35** (average match isn't decided in the first third)

Maps that fail this criterion are relegated to casual/training modes. They might be genuinely interesting games, but they don't serve the sealed replay system well — either they produce too many early-determination stomps (sealed watch becomes a formality) or they produce too many opaque late-determination matches (too hard to diagnose).

### The Map Quality Dashboard (Season-Level View)

Season administrators (initially the Robot Uprising development team; later, community moderators) have access to a map quality dashboard that shows, for each active Gauntlet map:

- EDT distribution histogram (per 10% bucket)
- Mean EDT
- False pivot density (% of matches with ≥2 visible false pivot windows)
- Contested duration mean
- Stomp rate (% of matches with EDT < 0.15)
- Community rating correlation (do players who played high-EDT-ratio matches rate the match more positively?)

This dashboard is the designed tool for retiring underperforming maps, promoting promising new maps from casual play to ranked, and understanding how balance patches affect match shape.

**The Map Quality Dashboard should be public.** Transparency about the match-shape distribution builds community trust in competitive integrity. Players who wonder "why was this map removed from the season pool?" can look at the dashboard and see: "EDT distribution showed 38% stomp rate — too many early-resolution matches."

---

## Comparable Games and Implementations

### Chess: The Evaluation Curve

Modern chess engines (Stockfish, Leela Chess Zero) compute a running "evaluation" for every position — a numeric score indicating how much advantage one side has. When you load a game into a chess database tool, you see a waveform: the evaluation bar over time.

The EDT equivalent in chess is the **decisive shift** in the evaluation graph — the point at which the evaluation crossed from "balanced" (±0.5 pawns) to "advantaged" (>1.5 pawns) and never came back. Chess annotators look for this crossing to identify the "moment the game was decided."

What chess engines can do that Robot Uprising currently cannot: chess engines can exhaustively compute the evaluation at every position in real time because chess's move branching factor is constrained (70-ish legal moves per position maximum). Robot Uprising's architecture space is much larger, but the simulation is deterministic given a configuration — the EDT computation is tractable post-match even if not real-time.

**What Robot Uprising takes from chess:** The evaluation curve visualization. The EDT timeline bar (contested portion + foregone conclusion portion) is the Robot Uprising evaluation curve — compressed into its essential message. In chess, you show the full waveform because the rich trajectory matters. In Robot Uprising, the EDT is the compression of that trajectory into its essential fact: when did it tip?

### Tennis: Win Probability by Point

Tennis analytics platforms (Game Insight, Tennis Abstract) show "win probability at serve" — a point-by-point probability waveform. Commentators use this to identify "the" critical game (the game where one player's win probability most sharply shifted).

The Robot Uprising EDT is this analysis, but not the *drama* analysis (highest probability swing per tick) — it's the **irrecoverability** analysis (the earliest tick at which the final outcome was sealed, regardless of visual drama). These two analyses identify different moments, and that difference is the false pivot phenomenon in formal terms.

The "most dramatic moment" = the largest single-tick probability swing (which may be a false pivot).
The EDT = the earliest tick at which the probability permanently and irrecoverably moved past the decision threshold.

### Poker: "In the Money" vs. "Effectively Won"

Tournament poker distinguishes between "in the money" (you've outlasted enough players to finish in a paying position) and "effectively won" (you have such a chip lead that your win is practically guaranteed). Professional players and analysts describe matches in terms of "when did it become effectively over?" — which is the EDT.

In the 2003 World Series of Poker main event, Chris Moneymaker's effective determination moment is considered to be the pivotal hand against Sammy Farha — not the final hand, but the hand that gave him an overwhelming chip lead that made him the heavy favorite. The final hand just completed what the pivotal hand determined.

Robot Uprising's EDT is this formalization. The dramatic final hook cascade is "the final hand." The EDT identifies the pivotal hand.

### Game Theory: Minimax Termination Depth

In game tree search, a position is "effectively determined" when the optimal play from both sides produces the same result regardless of subsequent decisions. For finite deterministic games, this is computable — a position where all leaf evaluations in the game tree have the same value is "determined."

Robot Uprising's EDT is an empirical approximation of this concept applied to a non-game-theoretic simulation. The simulation is deterministic (same architecture → same result) but the "game tree" is undefined (there's no opponent making optimal moves in response; both sides execute their configurations simultaneously). The EDT is therefore a *causal* concept, not a *game-theoretic* concept: the earliest tick at which the causal chain was locked.

### MOBA: NetWorth Lead as Determination Proxy

League of Legends analysts use "gold differential at X minutes" as a proxy for effective determination: at what point was one team's economic advantage so great that statistical recovery was unlikely? This is the DAT method (Option A above) applied to the gold resource — a simplified advantage function that correlates with outcome.

The difference: MOBA analysis uses a continuous resource (gold) as the advantage signal, which is legible and directly manipulable by players. Robot Uprising doesn't have a single continuous resource — it has a compound state (buffer health, unit health, objective presence, hook chain integrity). The EDT computation must aggregate across these dimensions, which is more complex but also more informative.

---

## Player Journeys

### Journey: Yuna, 31, Competitive RTS Player, Discovering the EDT as Map Analysis Tool

**Context:** Yuna is at Commander tier, rank 18 globally. She's been competing for two full seasons. She's developed an intuition for "map feel" — she prefers the station map to the canyon map because "the canyon feels decided before it starts." She's never had data to back this up. She hears about the EDT distribution on a community podcast.

**Minute 0:00 — The Map Statistics View**

Yuna navigates to the Season 4 Map Statistics page (accessible from the Gauntlet lobby sidebar). She's never been here before. The page shows three active Gauntlet maps: Station 7, Canyon Pass, and the new map, Relay Nexus 12.

She selects Canyon Pass. The EDT histogram loads:

```
Canyon Pass — Season 4 EDT Distribution
─────────────────────────────────────────
 0–10%   ████████████████████  38 matches (31%)
10–20%   ██████████████        25 matches (20%)
20–30%   ████████              16 matches (13%)
30–40%   ██████                12 matches (10%)
40–50%   ████                   8 matches (6%)
50–60%   ████                   8 matches (6%)
60–70%   ██                     4 matches (3%)
70–80%   ██                     4 matches (3%)
80–90%   ██                     4 matches (3%)
90–100%  █                      2 matches (2%)
─────────────────────────────────────────
Mean EDT: 0.23 (Tick 28 / 120)
Stomp rate (EDT < 0.15): 47%
```

She stares at this. Almost half the matches on Canyon Pass are decided in the first 18 ticks. Her intuition was exactly right. "The canyon feels decided before it starts because it *is*."

**Minute 0:45 — Comparing to Station 7**

Station 7:

```
Station 7 — Season 4 EDT Distribution
─────────────────────────────────────────
 0–10%   ██                     4 matches (4%)
10–20%   ████                   8 matches (8%)
20–30%   ██████████            20 matches (20%)
30–40%   ████████████          24 matches (24%)
40–50%   ██████████████        28 matches (28%)
50–60%   █████████             18 matches (18%)
60–70%   ██                     4 matches (4%)
70–80%   ██                     2 matches (2%)
80–90%   █                      1 match  (1%)
90–100%  ░                      0 matches (0%)
─────────────────────────────────────────
Mean EDT: 0.42 (Tick 51 / 120)
Stomp rate (EDT < 0.15): 4%
```

This is what a healthy map looks like. Nearly a normal distribution centered at 40–50% of match duration. Low stomp rate. Only 4% of matches are decided in the first 18 ticks.

Yuna feels validated and slightly furious. "I've been playing Canyon Pass for 8 weeks. The developers should have pulled it 4 weeks ago."

**Minute 1:30 — The Community Forum**

She screencaps both histograms and posts to the Robot Uprising subreddit: "Canyon Pass has a 47% stomp rate. Here's the data. Can we retire it?" The post gets 340 upvotes and a developer response within 6 hours: "We're watching this. Canyon Pass will be replaced at the season midpoint."

**What Yuna learned:** The EDT distribution is the single most important competitive health metric. Her instinct was correct; the data confirmed it; the community responded. This is the designed ecosystem function of making map quality data public.

**UI Annotations:**
- **Season map statistics:** Accessible from Gauntlet lobby → Season Info → Map Statistics. Not buried, but not front page.
- **Histogram display:** Bar chart, horizontal bars, tick count and percentage. Color-coded: 0–15% range is danger-red, 15–40% is amber, 40–75% is healthy-green, 75%+ is blue (genuinely contested late-pivot).
- **Stomp rate callout:** Red badge if stomp rate exceeds 20%. "⚠ 47% stomp rate" appears beneath the Canyon Pass histogram.
- **Developer annotation field:** Maps can be tagged with a developer note. Canyon Pass has: "Under review — high early determination rate. Under consideration for Season 4 mid-season replacement."

---

### Journey: Marcus, 29, Software Engineer, Using the EDT to Fix His Opener

**Context:** Marcus is at Operative tier, rank ~180. He's been losing match after match to the same kind of architecture — fast early-game attackers that end matches in 25–40 ticks. He doesn't have the vocabulary to diagnose this until he opens the post-match EDT panel for the fifth consecutive loss and notices a pattern.

**Five Post-Match Summary Screens in 2 Days**

```
Match 1:  EDT Tick 18 (15%)  — LOSS
Match 2:  EDT Tick 22 (18%)  — LOSS
Match 3:  EDT Tick 31 (26%)  — LOSS
Match 4:  EDT Tick 19 (16%)  — LOSS
Match 5:  EDT Tick 24 (20%)  — LOSS
```

The contested duration bars for all five matches look the same: a small amber sliver on the left, a large dimmed block on the right. Lots of foregone conclusion. Marcus is watching 80+ ticks of his own robots executing a plan that was already lost by tick 22.

**The Recognition**

Marcus stares at the five screens arranged in his head. *"I don't have an opening game. I'm losing the match in the first 25 ticks. Everything after that is theater."*

He opens the debrief for match 3 (EDT tick 31 — slightly better, so maybe more diagnostic). He scrubs directly to the gold diamond at tick 31. The annotation reads: "At Tick 31, your relay's buffer was processing 4 scouting signals simultaneously, causing a 2-tick processing delay before the striker escalation signal was dispatched. The opponent's striker had already achieved flanking position during this delay."

He sits back. *"My relay is a bottleneck. It processes signals sequentially. When 4 scouts report in the same tick, it queues them. The striker waits. 2 ticks of queue delay means 2 ticks of the opponent's striker moving unchallenged."*

**The Fix**

Marcus splits his relay into two parallel relays — one for threat signals, one for terrain signals. Threat signals now go directly to the striker without competing with terrain reports for processing time.

**Match 6:**

```
Match 6:  EDT Tick 58 (48%)  — WIN
```

Contested duration: 52%. A real match. The debrief shows a midgame tactical exchange, genuine uncertainty through tick 55, then a flanking maneuver that worked. He earned this win through 48 ticks of genuine competition.

**What the EDT told him:** His five consecutive losses weren't caused by five different things. They were caused by one thing, repeating. The EDT distribution across his losses was a signature — all early determination, all the same cause. Without the EDT as a per-match stat, he might have tried to fix five different things.

**What he wants next:** He wants to see his EDT history over time — a graph of his matches' EDT values trending toward 0.45–0.55 as his opening game improves. The "EDT trajectory" as a progress metric.

**UI Annotations:**
- **EDT in match history list:** Each match shows `[WIN] Tick 58 (48% EDT)` or `[LOSS] Tick 18 (15% EDT)`. The EDT percentage is color-coded by the contested-duration zones (green/amber/red based on map thresholds).
- **Pattern recognition callout:** After 3+ consecutive matches with EDT < 0.20, the system surfaces a soft suggestion: "Your recent matches have been decided early. Review your pre-tick-25 architecture in the debrief." Not prescriptive — just pointing.
- **EDT history graph:** In the Career Stats section, a 30-match rolling EDT average, showing whether the player's matches are trending toward more-contested or less-contested over time.

---

### Journey: Priya, 42, Systems Architect, Using EDT as Architecture Quality Audit

**Context:** Priya builds deep, multi-layer architectures (introduced in aspect 1.06c-ext-A-i as the "endgame architecture" player). She already knows she loses short matches and wins long matches. The EDT metric gives her a new vocabulary for understanding *why*.

**Priya's EDT Analysis Session**

She pulls her Season 4 match history and sorts by EDT. Losses sorted by EDT ascending:

```
Losses with EDT < 0.30 (14 matches):
  — Most common gold diamond annotation: "Buffer miss at first query"
  — Average agent count at EDT tick: 5.2 / 8.0 (65% of her agents were active at EDT)
  — Average hook chain depth at EDT tick: 1.3 hops (most signals were direct, not relayed)

Losses with EDT 0.30–0.70 (8 matches):
  — Most common gold diamond annotation: "Relay bottleneck under multi-signal load"
  — Average agent count at EDT tick: 7.1 / 8.0 (89% active at EDT)
  — Average hook chain depth at EDT tick: 3.1 hops (complex architectures engaged)

Losses with EDT > 0.70 (3 matches):
  — Most common gold diamond annotation: "Buffer exhaustion at tick 90+"
  — Average agent count at EDT tick: 8.0 / 8.0 (full operational capacity at EDT)
  — Average hook chain depth at EDT tick: 4.8 hops (full depth engaged)
```

She reads this with the eye of a systems architect doing a postmortem. Three distinct failure modes, each appearing at a different match-time horizon:

1. **Early EDT failures (< 0.30):** First-query buffer misses. Her architecture has a blind spot in its opening state — before the network has warmed up, individual queries that return empty fail silently. This is the "cold start problem."

2. **Midgame EDT failures (0.30–0.70):** Relay bottlenecks under concurrent load. She over-centralizes information routing through single relays during the high-activity midgame. The relay becomes a single point of failure.

3. **Late EDT failures (> 0.70):** Buffer exhaustion past tick 90. These are genuinely unusual — her architecture is designed for endgame, but 3 matches still ran her out of buffer. She needs to look at what edge cases produce late-match exhaustion.

**The Three Targeted Fixes**

Priya addresses each failure mode with a surgical change:

1. **Cold start:** Add a "bootstrap" phase to all agents — in ticks 0–10, they actively broadcast their position/status to the relay rather than waiting for queries. Warms the network before first contact.

2. **Relay bottleneck:** Split the monolithic relay into a threat-relay and a logistics-relay. Threat signals are higher priority but lower volume; logistics signals are high volume but lower priority. Parallel routing eliminates the queue.

3. **Late exhaustion:** Add a buffer "hygiene" rule to all relays: "Every 20 ticks, evict all entries older than 15 ticks from the terrain-intel category." Keeps buffer space available for fresh signals in endgame.

She deploys and watches three sealed matches. The EDT distribution across the three matches:

```
Match 1: EDT Tick 66 (55%)  — WIN
Match 2: EDT Tick 72 (60%)  — WIN
Match 3: EDT Tick 81 (68%)  — WIN
```

Her EDT distribution has shifted dramatically. Matches that previously resolved in the first 30 ticks are now genuine midgame contests.

**What the EDT unlocked:** Segmentation. Without EDT as a metric, Priya's losses were undifferentiated — she'd fix the most visually dramatic failure and miss the root cause. The EDT let her sort failures by when they occurred, which revealed the three failure types. Each type has a different architectural cause and a different fix.

**What she wants next:** She wants to present this analysis as a "config necropsy" post on the community forums — EDT segmentation as a diagnostic methodology for architecture iteration. She's seen the community adopt tools like this before; she expects it to become a standard practice within a month of posting.

**UI Annotations:**
- **Match history sort by EDT:** Career Stats → Match History → Sort: "EDT %" option. Ascending sorts shortest-determination matches first; descending sorts latest-determination matches first.
- **EDT annotations in gold diamond:** The gold diamond popup includes the EDT value in its header: "EFFECTIVE DETERMINATION — TICK 31 (26%)" followed by the causal annotation. Links the abstract metric to the concrete diagnostic explanation.
- **Export to CSV:** Match history including EDT, result, agent count at EDT, and hook depth at EDT is exportable for community analysts. This is the raw material for Priya's forum post.

---

### Journey: Leo, 17, First-Time Gauntlet Player, Making Sense of the Bar

**Context:** Leo just saw his first post-match EDT panel. He has no idea what "effective determination" means. He just wants to know if the bar is good or bad.

**After His First Win — EDT 78%**

The post-match summary shows:

```
Effective determination:  TICK 94   (78% of match)
Contested duration:       22%       [░░░░░░░░░░░░████]
```

The bar is almost entirely dimmed, with a small amber section at the right end. Leo's first reaction: "Does that mean I was losing the whole time?"

He hovers over the "Effective determination" label. A tooltip appears:

> **Effective Determination** — The tick at which this match's outcome was effectively decided. After this tick, one side had a decisive, unrecoverable advantage. A high EDT% (like 78%) means the match was genuinely contested until late. Your win came from a decision made at Tick 94.

Leo reads this. "So... 78% is good? I actually fought for most of the match and won it at the end?"

He re-watches the sealed replay with this knowledge. At tick 94, he watches his relay execute a clean buffer-eviction that preserved a critical objective signal — exactly the decision he'd designed deliberately. The hook chain fires. His scout holds the objective. His opponent's buffer overflows 8 ticks later.

*"That's what the bar was about. I knew what I was doing at tick 94 was important when I built it. I just didn't know the match would be won right there."*

**What Leo learned:** The EDT tells you where the match was won. High EDT% = you won it late, against genuine opposition. Low EDT% = it was decided early, one way or the other. The contested duration bar is a shape that tells you something about the match before you even open the debrief.

**UI Annotations:**
- **Tooltip on first encounter:** If a player has never seen the EDT panel before, a tutorial overlay appears for 5 seconds: "This shows when your match was decided. A higher % means a closer match that ran long. Tap any element for more info."
- **Color-coded EDT bar:** The contested portion (left of EDT) is amber; the foregone conclusion portion (right of EDT) is dimmed gray. For a win, the amber portion glows slightly. For a loss, it's a flat amber without the glow. The visual distinction between "I fought hard and won in a contested match" and "I fell behind early and never recovered" is immediate.
- **Plain language summary:** Below the bar, a single sentence: "Your match was decided near the end — a genuinely close contest." or "Your match was decided early — this was a dominant victory." or "Your match was decided early — the debrief will show what went wrong before Tick 28."

---

## Strengths

**Transforms subjective match-feel into a diagnostic variable.** "That felt like a close match" becomes "EDT 68% — genuinely contested until the endgame." "I got stomped" becomes "EDT 11% — the first scout interaction decided it." This precision unlocks systematic architectural iteration that gut-feel alone can't support.

**Creates a portable map quality metric.** The EDT distribution across a map's match history is the most honest measure of whether that map supports meaningful competition. It's objective, data-driven, and legible to players and developers alike. Community trust in competitive integrity scales directly with data transparency.

**Unlocks EDT-segmented diagnosis.** As demonstrated in Priya's journey: sorting losses by EDT reveals distinct failure modes at different match horizons. Each horizon has a different architectural root cause. Without EDT segmentation, these causes blur together.

**Makes the false pivot phenomenon formally visible.** The gap between the "most dramatic moment" (the tick most players would identify as the turning point) and the EDT is the formal measure of false pivot severity. This gap is now a stat, not just a feeling. A match where the dramatic moment was tick 70 and the EDT was tick 18 has a false pivot gap of 52 ticks — visible, nameable, discussable.

**Compounds with community diagnostic culture.** Config necropsy posts, season retrospectives, and tier list discussions all become richer when contributors can include EDT distributions for their architectures. "My v3 config has a mean EDT of 0.28 — it wins early or not at all. Here's how I fixed that in v4 (mean EDT 0.51)."

---

## Weaknesses

**Algorithmic EDT accuracy degrades for compound failures.** The minimum-counterfactual method finds the earliest tick at which a single change would have flipped the outcome. For matches where the outcome was determined by the *compound* of many small disadvantages (no single moment was decisive, but the aggregate degradation was), the EDT will point to the most recent moment that looks like a decision point rather than the true distributed cause. This produces occasional gold diamond placements that feel imprecise.

**EDT doesn't distinguish why it was early.** An early EDT (0.15) could mean:
- A dominant architectural superiority (the better config wins cleanly and early — valid outcome)
- A stomp from an ELO mismatch (a bad matchmaking call — not a design success)
- A catastrophic configuration error (the player's config has a bug — not a match quality issue)

All three look the same in the EDT distribution. The map quality dashboard uses EDT to evaluate maps, not individual architects; but individual players may misread an early EDT as a map problem when it was their own config error. The plain-language summary in the post-match panel should distinguish these cases where possible: "Match ended early due to configuration error in your startup routing — this was not a competitive match."

**EDT visibility may change competitive behavior counterproductively.** If players know that high EDT% correlates with map health, some competitive players will deliberately play for late-determination wins — using defensive architectures specifically to push the EDT late, regardless of whether that's optimal play. This is probably fine (and interesting meta strategy) but worth noting as an emergent effect.

**Computing EDT on complex architectures costs time.** A post-match with 20 agents, 50+ hooks, and 120 ticks requires a non-trivial causal trace computation. This should be backgrounded (computed after the sealed watch completes, before the player enters debrief mode) so it never blocks the replay experience. But on edge cases (very large architectures), it might produce a "Computing match analysis..." loading state. This loading state must be brief (< 2 seconds) or players will ignore the panel.

---

## Interaction Effects

**With 1.06c-ext-A-ii — False Pivot Anti-Pattern:** The EDT is the formal definition of "where the genuine pivot actually was" — the number behind the gold diamond. The false pivot gap (dramatic moment timestamp minus EDT) is the formal measure of how misleading each false pivot is. These two aspects are two sides of the same concept: the EDT is the answer, the gold diamond is how you surface the answer in the debrief, and the false pivot is the distance between the answer and the player's intuitive guess.

**With 1.06c-ext-A-i — Replay Length as Tension Design:** The EDT/max_ticks ratio is the measure of whether sealed tension is substantive or manufactured. A match with EDT = 0.10 has 10% genuine tension and 90% theatrical performance. The 60-tick minimum (aspect 1.06c-ext-A-i) ensures sufficient match length, but EDT quality control ensures sufficient competitive substance within that length.

**With 8.10 — Gauntlet Map Template System:** The EDT distribution criterion is one of the two most important map eligibility criteria (the other being the raw stomp rate ≤ 15%). Maps that fail the EDT distribution criterion are not Gauntlet-eligible regardless of visual quality, thematic fit, or subjective appeal. The EDT is a quantified design standard for map quality.

**With 7.11 — Match Duration as Community Health Signal:** Match duration is one signal; EDT is a deeper signal. A season where average match duration is stable (80+ ticks) but EDT is declining (matches decided earlier and earlier) indicates a dominant early-game strategy is emerging. Duration didn't change — the architectures are still running to max_ticks — but the competitive substance is disappearing. EDT catches this deterioration that duration alone misses.

**With 4.20 — Counterfactual Simulation as Advanced Debrief Feature:** The counterfactual simulation feature (aspect 4.20) runs what-if scenarios from the EDT tick. The EDT is the *starting point* for the what-if analysis: "At Tick 31, what if the relay's buffer hadn't been full?" EDT computation is a prerequisite for counterfactual simulation. These two aspects co-design the advanced debrief's analytical depth.

**With 4.04b — Two-Act Debrief Structure:** The EDT panel appears at the transition between Act 1 (emotional watch) and Act 2 (analytical debrief) — after the seal breaks, before the player opens the scrubber. It's the "briefing" that orients Act 2: "Here is what you're analyzing. The pivotal window was ticks 28–35. Everything else was consequence." The EDT panel is the structural divider between the two acts.

**With 4.04a — Debrief as Debugger:** The EDT provides the primary navigation anchor for the debrief scrubber. Rather than starting at tick 1 and scrubbing forward, players who read the EDT panel know to jump to the EDT tick first. The debrief scrubber's "jump to EDT" button (a click on the EDT timestamp in the panel) instantiates this: zero-scrubbing to the diagnostic starting point.

**With 5.22 — Gauntlet as Third Act:** The EDT distribution criterion distinguishes Gauntlet maps from campaign maps. Campaign missions might tolerate EDT < 0.30 (the lesson might be "here's what a crushing early defeat looks like — now build against it"). Gauntlet maps require EDT ≥ 0.35 mean as a quality floor. This difference is a designed signal about what each mode is for: campaign teaches through losses, Gauntlet competes through balance.

---

## Sensory Design

### The EDT Panel Reveal

The EDT panel materializes after the seal breaks. It doesn't appear during the sealed watch — it appears as part of the Act 1 → Act 2 transition.

**Visual treatment:** The panel slides in from below the match summary section, smooth 300ms ease-in. The contested portion of the EDT timeline bar fills from left to right in 800ms — amber light pouring in from the left edge, stopping abruptly at the EDT tick, the rest of the bar remaining dark. This animation communicates the match's shape kinetically: "here's how much was genuine competition, and here's where it ended."

**Sound:** The EDT timeline fill has a sound: a soft rising tone that plays during the amber fill, and a distinct click when the fill stops at the EDT tick. The click is the same sound as the gold diamond placement in the debrief — a designed sound vocabulary that says *this is the pivot point.* Players who've heard the gold diamond click 20 times will immediately interpret the EDT panel's click as "that's where it was."

**The EDT percentage number:** Displayed in large numerals (48pt), slightly warmer color than the surrounding UI (amber-tinted rather than pure white). This is the headline of the panel — the most visually prominent element. The casual player who doesn't understand the concept yet will still see the number and register: "78% means something about how close the match was."

### The EDT Bar Color States

- **High EDT (> 0.65) — Genuinely contested:** Amber bar, bright throughout the contested portion, the "foregone conclusion" segment after EDT is a slim dark bar. Feels like a close match even at a glance.

- **Mid EDT (0.35–0.65) — Standard competitive:** Amber bar with roughly equal contested/foregone sections. The dividing line at the EDT tick is a clean vertical mark.

- **Low EDT (0.15–0.35) — Early determination:** Small amber stub at left, large dark block on right. The visual weight of the dark foregone-conclusion section communicates: "most of what you watched was already decided." Not shame — just clarity.

- **Very low EDT (< 0.15) — Near-stomp:** The amber section is almost invisible — a thin sliver at the extreme left. The dark block dominates. For loss outcomes, this is paired with a plain-language note: "The match's outcome was likely decided before significant engagement. Review the configuration's startup routing."

### The Map Quality Dashboard Colors (Season View)

- **Healthy EDT distribution (mean ≥ 0.45):** Map card has a green border in the Season Map view
- **Borderline EDT distribution (mean 0.30–0.45):** Amber border, "Under monitoring" tag
- **Unhealthy EDT distribution (mean < 0.30 or stomp rate > 20%):** Red border, "⚠ Under review" tag

The colors are immediate and unambiguous. Yuna shouldn't need to read the histogram to know Canyon Pass is a problem — the red border on the map card in the Season lobby says it clearly.

---

## The TikTok Clip

**Version A (The Revelation):**
A post-match summary screen. The EDT bar fills amber, stops at 18%. The player stares at the screen. Slowly zooms out to show 4 other match summaries on their screen, all with EDT < 25%. "Five consecutive losses. All decided before tick 25. Not five different problems. One problem. Five times." Cut to the gold diamond annotation. Zoom in on "Scout_Alpha first query: buffer empty." "One rule change. This is what I fixed."

**Version B (The Map Data):**
Season map statistics page. Canyon Pass histogram: "47% stomp rate." Station 7 histogram: "4% stomp rate." Player says nothing. Just points at the two histograms. Caption: "This is why you keep losing on Canyon Pass."

**Version C (The Architecture Audit):**
Split screen: 14 early-EDT losses on the left, 8 mid-EDT losses on the right, 3 late-EDT losses below. Player narrates: "Every early-EDT loss has the same gold diamond annotation. Buffer miss. Every mid-EDT loss has a different one. Relay bottleneck. These are two different problems that look identical if you don't sort them first." This is the Priya methodology, compressed to 20 seconds.

---

## New Aspects Discovered

- **8.11 — The two-act structure as pedagogical framework:** Cross-cutting synthesis of how the emotional-first, analytical-second debrief sequence maps to real professional methodologies (blameless postmortems, incident review, chaos engineering); what does Robot Uprising teach by making this structure visceral and habitual over hundreds of play sessions; the "film room" culture as designed outcome (already in frontier — note the EDT panel is the formal divider between acts)

- **4.25 — EDT trajectory as career progress metric:** A 30-match rolling EDT average as a first-class career stat, showing whether a player's architectures are trending toward more-contested matches over time; "EDT trajectory" as the measure of architectural improvement orthogonal to win/loss rate; a player whose EDT moves from 0.20 to 0.45 has improved their opener even if their win rate stayed flat

- **4.26 — False pivot gap as a standalone metric:** EDT to "most dramatic moment" difference as a displayed stat; "False Pivot Gap: 52 ticks (Tick 18 to dramatic event at Tick 70)" as a community-shareable number; used in config necropsy posts to communicate how misleading the sealed watch was; high false pivot gap = rich sealed experience but harder diagnostic work

- **8.12 — EDT as a difficulty calibration axis for campaign missions:** Campaign mission designers can target specific EDT ranges to control player experience; early-EDT missions (0.10–0.25) teach specific opening-game lessons; late-EDT missions (0.75–0.90) test endgame architecture design; mid-EDT missions are the "fair contest" baseline; EDT targeting as a formal campaign design tool rather than implicit difficulty tuning

- **7.12 — Community-visible EDT distributions per config archetype:** Season analytics showing EDT distribution for each major config archetype (scout-heavy, relay-chain, command-agent) — letting players understand the "match shape" profile of each archetype before choosing one; "relay-chain architectures tend toward EDT 0.45–0.65; scout-rush architectures tend toward EDT 0.15–0.30"; informed build choice using archetype EDT profile

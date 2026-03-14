# Pre-Ranking Adversarial Surface

**Aspect:** 4.65 — Pre-ranking adversarial surface: enemy configs can be designed to fool the pre-ranking heuristic — engineer high pivot-activity and high volatility in a decoy element while the real vulnerability is elsewhere; "pre-ranking poisoning" as advanced PvP attack; interaction with adversarial counterfactual mode (4.39).

**Parent:** 4.58 — Pre-ranking transparency panel; 4.39 — Adversarial counterfactual mode
**Siblings:** 4.66 — Signal genealogy as pre-ranking source; 4.67 — Probe hook suggestion from transparency panel; 4.63 — Player-configurable pre-ranking weights
**Related:** 4.60 — Search budget as resource; 4.57 — Threat model report; 2.12 — Deception signals; 4.15 — Probe hooks; 8.08 — Real-language vocabulary claim

---

## The Core Concept

The pre-ranking heuristic (4.58) has a beautiful property: it's transparent. The three signals — pivot-tick activity, recency, and volatility — are documented, legible, and ultimately *gameable*.

An expert player who understands the pre-ranking heuristic can design a config that **scores high on all three signals for a decoy element** while hiding the real vulnerability in an element that scores near-zero on all three. When an opponent runs adversarial counterfactual mode (4.39) against this poisoned config — asking "what single change to your config would have beaten me more decisively?" — their QUICK mode pre-ranking surfaces the decoy. The opponent either wastes analysis budget chasing a false lead, or is forced to run THOROUGH mode (spending compute budget from 4.60) to find the real attack vector.

This is **pre-ranking poisoning**: the deliberate manipulation of your own config's diagnostic signals to mislead adversarial analysis.

**Why this matters architecturally:** The transparency panel (4.58) and configurable weights (4.63) represent the game teaching players to *trust* the pre-ranking. Pre-ranking poisoning is the mechanism that teaches them when *not* to trust it — and teaches the deeper lesson that any heuristic based on observable signals can be gamed by an adversary who knows the signals. This is a lesson that transfers directly to real-world AI safety, security signal engineering, and adversarial machine learning.

**The attack surface in concrete terms:**

The pre-ranking fires during adversarial counterfactual mode (4.39) when your opponent runs: *"What single change to my opponent's config would have improved my outcome?"*

In QUICK mode, the explorer pre-ranks all of the opponent's config elements by three signals:

1. **Pivot-tick activity**: Was this element actively processing at the tick the match turned?
2. **Recency**: Was this element recently modified (recent config changes carry higher risk)?
3. **Volatility**: Did this element cycle through many distinct internal states during the match?

A poisoned config engineers a **canary element** — a real agent or rule that participates in the match without being strategically important — to score high on all three signals. The **real vulnerability** is engineered to score low on all three, hiding it deep in the pre-ranked candidate list where QUICK mode never reaches.

---

## The Attacker's Toolkit: How to Build a Poisoned Config

Constructing a working decoy requires satisfying all three pre-ranking signals simultaneously. Each signal has a natural engineering method:

### Signal 1: Pivot-Tick Activity (Hardest to Fake, Most Impactful)

The decoy must be actively processing signals at the tick the match turns. This means the canary element must be *genuinely participating* in match events around the pivot tick — it cannot be an inert element that simply exists in the config. The canary needs:
- Real hooks that fire in the pivot-tick window
- Rules that evaluate (and produce non-trivial state changes) during this window
- Ideally, the canary is connected by hooks to other active elements so its activity is causally adjacent to the match outcome (without being the actual cause)

**The engineering trick:** Position the canary as a **mid-chain relay** that processes signals during the critical window but whose output doesn't reach the final agent in the decisive chain. The canary fires, the signals flow into the canary, the canary produces output — but that output routes to a secondary chain that doesn't determine the outcome. The pivot-tick activity signal sees a very busy canary; the causal analysis (which QUICK mode doesn't do) would reveal the canary is a parallel branch, not the main trunk.

### Signal 2: Recency (Cheapest to Fake, Lowest Value)

Recency measures when the player last modified the element's config fields. This is a factual record — the game knows when you last touched each element's parameters.

**The engineering trick:** In the sessions before a major Gauntlet deployment, make a series of small, meaningless changes to the canary element: adjust a buffer size by 1, change a hook threshold by 0.01, toggle a rule priority by one position, then toggle it back. These changes inflate the recency signal without altering the element's functional behavior.

**The cost:** Every edit to the canary shows up in your config history. A sophisticated opponent who can see your edit history (or a game system that tracks edit patterns) could detect that the canary received many small edits in rapid succession — the fingerprint of deliberate recency inflation. This creates a secondary counterintelligence risk.

**The asymmetry:** Recency is the cheapest signal to inflate and the least trustworthy for precisely this reason. Expert players who understand poisoning quickly learn to down-weight recency in their adversarial analysis — which is why the configurable weights feature (4.63) is such a powerful counter-tool.

### Signal 3: Volatility (Most Elegant to Fake, Best ROI)

Volatility measures how many distinct internal states the element produced during the match. High-volatility elements change frequently — they're doing a lot of conditional work.

**The engineering trick:** Design the canary with many conditional rule branches that activate in sequence during the match. Give it a rule set that responds to many different signal types — even if those responses don't accomplish anything strategically. A canary with twelve rules that each fire once in sequence produces twelve distinct states. A volatile canary is built to *look busy*.

**The implementation cost:** A canary with twelve rules consumes config complexity budget. Every rule the canary has is a rule that can't be on a strategically important element. This is the most significant cost of poisoning — you're deliberately burning config space on a fake element.

**The interaction with the real vulnerability's stealth profile:** The real vulnerability must have the opposite properties. A **low-activity, low-volatility, never-modified element** is the ideal hiding spot. This means the real attack vector is typically:
- A simple element with one or two carefully tuned rules
- An element the player hasn't touched in many sessions (giving it a low recency score)
- An element that produces consistent, stable state transitions during the match (low volatility)
- An element that is NOT active at the pivot tick — but whose influence propagates forward in time to affect the outcome

This last point is critical: the real vulnerability must affect the match **before** the pivot tick, setting up a condition that the pivot tick merely reveals. The pivot tick is when the outcome becomes determined — the real causal work happened earlier. A vulnerability that operates in the pre-pivot window doesn't show up in the pivot-tick activity signal.

---

## The Defender's Toolkit: Detecting and Countering Poisoning

### Tier 1: Basic Awareness (Just Knowing It Exists)

The first defense is conceptual: knowing that pre-ranking poisoning is a strategy. A player who understands that QUICK mode can be fooled by a well-designed decoy will:
- Not apply adversarial QUICK results without sanity-checking them
- Consider running THOROUGH mode more readily when the QUICK result seems "too obvious"
- Ask: "Why would this element be so easy to find? Is this a decoy?"

### Tier 2: Pre-Ranking Weight Configuration (4.63)

A poisoned config exploits the default pre-ranking weights. Counter-adjustments:
- **Zero out recency**: If you suspect the opponent inflated recency artificially (many small edits), eliminating recency from the pre-ranking removes their cheapest manipulation lever.
- **Reduce volatility weight**: If you suspect the canary was designed to be artificially busy, volatility is less trustworthy — reduce its contribution.
- **Amplify pivot-activity with upstream context**: Pivot-tick activity is the hardest signal to fake (the canary must genuinely fire at the pivot tick), but a sophisticated analysis adds nuance: was the element active as a **sender** or **receiver**? Senders are less likely to be root causes than receivers. A canary that sends but whose output is ignored is still a high-pivot-activity element — but it's a dead branch, not the trunk.

### Tier 3: The THOROUGH Mode Audit

The definitive counter. QUICK mode's pre-ranking can be fooled; THOROUGH mode's exhaustive enumeration cannot. If the player suspects poisoning, they can spend compute budget (4.60) on a full THOROUGH scan. The exhaustive result will either confirm the QUICK result (pre-ranking was correct) or surface a different minimum fix (pre-ranking was misled).

**The attacker's counter-counter:** A sophisticated poisoner can design a config where even THOROUGH mode's minimum fix is the canary — where the canary genuinely represents a single-element change that improves the attacker's outcome, just not as much as the deeper structural vulnerability. The canary is a real attack vector, just not the best one. THOROUGH finds the "first viable fix" among minimum-sized changes — and if the canary has been engineered to be a real (if minor) vulnerability, THOROUGH might stop there.

This requires the next level of analysis: **multi-element fix exploration**, asking "what combination of changes produces the most decisive attack?" This is computationally expensive but immune to single-element canary poisoning.

### Tier 4: Cross-Match Pattern Recognition

After running adversarial analysis across multiple matches against the same opponent, a player can notice: "The QUICK result is always pointing at RELAY-PHANTOM, but the actual effective attacks come from configs that address DISPATCH-OMEGA." If the same "obvious" element keeps appearing in pre-ranking results but never translates to effective adversarial variants, it's a strong signal of a persistent canary.

The **career adversarial analysis** (extended from 4.55) could surface this pattern: "RELAY-PHANTOM appears in 7 of 8 adversarial pre-ranking results against this opponent, but 0 of 8 confirmed minimum-flip results. High canary probability."

---

## The Meta-Game

Pre-ranking poisoning creates a multi-level strategic meta-game within the Gauntlet:

**Level 1 — Naive play (both players):** Neither player knows about poisoning. Adversarial QUICK mode surfaces candidates that approximate root causes. Small-scale misdiagnosis occasionally.

**Level 2 — Asymmetric knowledge (one poisoner):** Player A discovers poisoning. Designs configs with canaries. Player B (who doesn't know about poisoning) runs adversarial mode on Player A's config, QUICK mode surfaces the canary, Player B invests resources in countering the canary, and Player A's real vulnerability remains hidden. Player A gains a systematic diagnostic advantage.

**Level 3 — Arms race begins (both aware):** Player B discovers that adversarial QUICK results for Player A's configs keep pointing at RELAY-PHANTOM without effective adversarial payoff. Player B switches to THOROUGH for Player A specifically, spending extra compute budget. Player A must decide: is the compute-budget drain on Player B worth the config complexity cost of maintaining a canary?

**Level 4 — Adaptive counter-poisoning:** Player B configures pre-ranking weights to de-emphasize volatility (Player A's cheapest poisoning lever) and down-weight recency. This forces Player A to invest more in canary quality (harder pivot-tick activity faking), which increases the canary's config complexity cost.

**Level 5 — Structural deception:** Player A abandons the single-canary model. Instead, they design a config with **multiple moderately suspicious elements** — none perfectly optimized as a canary, but collectively creating so much pre-ranking noise that THOROUGH mode is required to find any real attack vector. Player A's config has become a **pre-ranking fog of war**: many moderately suspicious elements, all of which require investigation, exhausting any finite compute budget.

**Level 6 — The philosophical trap:** Player B, having run THOROUGH mode exhaustively across multiple matches against Player A, realizes that Player A's real vulnerabilities rotate — each match deploys a slightly different config variant with different real vulnerabilities in different hiding spots. No single THOROUGH analysis builds towards a systematic understanding of Player A's architecture. Player B must run multi-match career analysis (4.59) to find the structural constants across Player A's config evolution.

**The lesson that emerges:** At high levels of play, the diagnostic arms race between attacker and defender mirrors the real-world dynamics of advanced persistent threat (APT) actors in cybersecurity. The attacker doesn't need to be unbreakable — they just need to be expensive to analyze.

---

## The Ethics and Information Design

Pre-ranking poisoning is an **implicit feature** — it's never explicitly taught or documented in the game. Players discover it by:
1. Noticing that their adversarial QUICK results consistently point at elements that don't produce effective attacks
2. Discovering (or reading about) Priya's configurable-weights investigation (from 4.63)
3. Reading the pre-ranking transparency panel carefully enough to realize its signals are all observable and therefore manipulable

**Design question:** Should the game acknowledge that poisoning exists? Options:

**Option A — Never acknowledge:** The poisoning meta-game is entirely emergent, player-discovered. The game has no UI or documentation mentioning it. This maximizes the "eureka" moment for the player who discovers it, and creates deep competitive knowledge asymmetry that veteran players can exploit. Downsides: new players might feel the game is unfair when they discover they've been systematically misled without any in-game acknowledgment.

**Option B — Acknowledge at high experience:** After 50+ adversarial mode runs where THOROUGH and QUICK diverged significantly, the game surfaces a single cryptic note in the transparency drawer: *"Pre-ranking accuracy for this opponent has been low across 12 sessions. Their config may produce diagnostic interference."* The game uses careful language — "diagnostic interference" rather than "pre-ranking poisoning" — leaving the player to interpret.

**Option C — Acknowledge through the adversarial mode threat model (4.57):** The "threat model" report (4.57), which aggregates adversarial analysis for a given config version, includes a section on "pre-ranking confidence": after 5+ adversarial sessions against the same opponent, the report shows pre-ranking accuracy specifically for that opponent. If accuracy is consistently below 40% (meaning QUICK and THOROUGH routinely diverge), the report flags: "Pre-ranking confidence vs. [opponent]: low. Recommend THOROUGH mode for future matches." The mechanism is indirectly disclosed without the term "poisoning" being used.

**Recommended: Option B with Option C available.** The cryptic note is delivered as an in-universe data point, not a tutorial. Players who understand what it means will act on it; players who don't will either investigate (learning the lesson) or ignore it (remaining at a strategic disadvantage, which is fair at high levels of play).

---

## Player Journeys

---

#### Journey: Priya, 29, competitive player, Gauntlet Season 4 — "The Poisoner's Handbook"

**Context:** Priya is 120 hours into Robot Uprising, ranked in the top 50 Gauntlet players on her ladder. She spent three sessions in Chapter 4 of the campaign discovering (from the configurable weights investigation in her config notes) that QUICK mode can be misled by elements with artificially inflated diagnostic signals. She has been quietly developing a "poisoned architecture" for Season 4 — a config designed from the ground up with a systematic canary.

**Minute 0:00 — The Poisoned Config in Deployment**

The screen shows Priya's workbench, Session 4 of 8 in the season. Her config is labeled **v4.2 "Smoke Screen."** On the left panel, her agents:

- **RELAY-PHANTOM**: A mid-chain relay with 9 rules, all firing reliably in the pivot window. This is the canary. It has been modified in 4 of the last 6 sessions (recency score: high). It produces 24+ distinct states per match (volatility: very high). It's active at the pivot tick in 90%+ of her matches (pivot-activity: very high).
- **RELAY-PHANTOM's output**: Routes to a secondary striker chain that handles mopping up after the match outcome is already determined. Not useless — it does real work — but it's never the reason she wins.
- **DISPATCH-OMEGA**: A quiet relay. 2 rules. Modified once, 12 sessions ago. Produces 4 distinct states per match (volatility: very low). Active at ticks 18–22 (before the typical pivot window). Pre-ranking score: ~0.09.
- **DISPATCH-OMEGA's role**: Handles the early signal routing that positions her striker for a mid-match advantage. The actual reason she wins. The whole architecture is built around making DISPATCH-OMEGA effective while hiding its importance.

Priya opens a Gauntlet match against her current opponent (ranked 31). She clicks **Deploy** and the match runs.

**Minute 2:00 — Match Complete: Win, EDT 0.38**

A mid-length win. The match was genuinely contested. EDT 0.38 means the outcome was determined at tick 46 of 120 — solidly in the middle. Priya checks the debrief stats and is satisfied.

She doesn't go to Act 2 of her own debrief. She knows her config is working. What she's interested in is something else.

**Minute 3:00 — Monitoring for the Adversarial Scan**

Priya opens the Match Detail panel and navigates to the **Opponent Analysis** section. There's a new stat she's been watching across the season: **"Adversarial scan attempts (estimated)"** — a metric the game derives from looking at match timing, whether the opponent ran debrief sessions on this match, and whether any config changes to the opponent's own config followed shortly after (suggesting they found an attack vector and deployed a counter).

This opponent: 0 estimated adversarial scans. They won their previous match and didn't analyze their own vulnerabilities.

**Minute 4:00 — The Season-Level Poisoning Picture**

Priya switches to her Season 4 Diagnostics View. She's tracking a private stat: across her 4 matches this season, opponents have applied post-match config changes in response to adversarial analysis of her config in 1 of 4 cases. That 1 change addressed RELAY-PHANTOM's compression ratio — the canary. No opponent has touched anything near DISPATCH-OMEGA.

She writes in her session notes: *"4/4 seasons: Smoke Screen holding. Only 1 adversarial scan confirmed. That scan targeted RELAY-PHANTOM (canary absorbed the hit). DISPATCH-OMEGA untouched."*

**Minute 5:30 — The Trap Pays Off**

In Match 5, an opponent deploys a new config that appears to counter RELAY-PHANTOM specifically — they've restructured their signal chain to route around RELAY-PHANTOM's processing signature. The counter works: RELAY-PHANTOM's effectiveness is reduced, and the match is closer.

But DISPATCH-OMEGA still functions. The opponent designed their counter for the canary. The real mechanism is intact.

Priya wins Match 5, EDT 0.41. Closer than she wanted, but a win.

**Minute 6:00 — The Resolution**

She writes: *"Canary successfully absorbed one focused adversarial counter. Structural core (DISPATCH-OMEGA) untouched after 5 matches. Season 4 architecture is working. To extend into Season 5: consider rotating the canary every 3 seasons to reset opponent learning."*

She thinks: this is not so different from security through obscurity — effective in the short term, requires rotation to stay effective long-term. She adds a note: *"The Smoke Screen has a natural expiration. Once opponents compare notes (or the community figures out the pattern), DISPATCH-OMEGA becomes known."*

**UI Annotations:**
- **Config labels**: Priya's workbench shows a custom label field for each config version — she uses "Smoke Screen" as a reminder of the architecture's purpose. This is a player-authored field, no game system involvement.
- **Adversarial scan estimate metric**: A derived stat in Match Detail, using behavioral inference (post-match debrief timing, subsequent config changes). Displayed as "Low / Medium / High" confidence, not a precise number. A small investigative-lens icon, grey tinted, next to the match record in the history panel.
- **RELAY-PHANTOM visual in config tree**: Same appearance as any other agent — no special marking. The game has no concept of "canary." Priya's designation exists only in her notes.

---

#### Journey: Marcus, 37, software architect, Gauntlet Season 2 — "The Bewildering Loss"

**Context:** Marcus is 60 hours in, ranked mid-tier in Gauntlet. He's lost 3 consecutive matches to the same opponent (leaderboard position 18) and can't figure out why. His adversarial analysis points to the same element every time — RELAY-APEX, a heavily active relay with 8 rules that fires frequently during the pivot window. He's been designing counters to RELAY-APEX across three configs (v2.3, v2.4, v2.5) and each counter has been ineffective.

**Minute 0:00 — The Third Failed Counter**

Debrief screen, Match 6. Marcus lost again, EDT 0.82 — a very close match that went almost to the wire. His v2.5 config incorporated a counter to RELAY-APEX that he thought was comprehensive.

He opens Act 2 and runs the adversarial counterfactual in QUICK mode.

Result: *"FIRST VIABLE FIX: Opponent's RELAY-APEX — compression rate –20%. This would have reduced RELAY-APEX's signal propagation efficiency, creating a timing gap that your striker could exploit at tick 58–61."*

Marcus stares at this. This is exactly the same diagnostic direction as his last two sessions. He already addressed RELAY-APEX's compression rate in v2.3. He's been addressing variations of RELAY-APEX's parameters for three sessions. It's not working.

**Minute 1:00 — The Frustration**

He opens the transparency drawer under the adversarial result:

```
WHY IS RELAY-APEX RANKED #1?
─────────────────────────────────────────────
Opponent's RELAY-APEX was active at tick 54 — the pivot tick.
Signal routing through RELAY-APEX was part of the match's critical path.

RELAY-APEX was modified in the opponent's last 2 sessions (recency: high).
Recent changes introduce elevated risk.

RELAY-APEX produced 27 distinct states during the match (volatility: 0.89/1.0).
This is the highest volatility element in the opponent's config.

Overall rank score: 0.93 — highest in the candidate set.
```

Marcus has seen this explanation before. Three times. Same scores. Same logic. And three counters to RELAY-APEX have all failed.

He opens the three previous adversarial run results side by side (using the counterfactual history view from 4.38). Across all three matches, RELAY-APEX has a rank score between 0.88 and 0.95. Consistently top. Consistently failing to produce effective adversarial variants.

**Minute 2:30 — The First Hypothesis**

Marcus types a note: *"RELAY-APEX keeps scoring high but my counters don't work. Either: (a) I'm building the counters wrong, or (b) RELAY-APEX isn't actually the root cause."*

He switches to THOROUGH mode. This costs him compute budget. He watches the 47-second progress bar.

Result: *"MINIMUM FIX: Opponent's RELAY-APEX — compression rate –20%."*

Same result. THOROUGH confirmed QUICK's finding. This makes the issue worse — THOROUGH is supposed to find the real minimum fix. If THOROUGH also surfaces RELAY-APEX, maybe his counters really are just wrong.

**Minute 4:00 — The Deeper Audit**

Marcus runs "Find My Counter" on the adversarial result. He gets: *"Your config: add hook filter in STRIKER-B — reject RELAY-APEX-originated signals with compression < 0.5."*

He queues it as v2.6.

While queuing, he stares at the counterfactual history view. He notices something odd: across six matches against this opponent, the adversarial QUICK result for the minimum-flip variant has specified RELAY-APEX five times and SCOUT-CANDLE once. Every time it's RELAY-APEX, the "most decisive" variant is also close to RELAY-APEX.

But none of his counters to RELAY-APEX have worked. Even v2.3, which explicitly blocked RELAY-APEX's primary output channel.

**Minute 5:30 — The Revelation**

Marcus opens the game's community Discord and searches: "adversarial quick mode always same element ineffective counter." He finds a thread from two months ago:

*"If adversarial QUICK keeps surfacing the same element and your counters don't work, you might be up against a poisoned config. The opponent engineered that element to score high on the pre-ranking. The real attack vector is elsewhere. Look for something quiet, unchanged, boring."*

Marcus reads this three times.

**Minute 6:00 — The Hunt**

He goes back to the adversarial explorer on the opponent's config. He opens a feature he's never used: the full candidate list from THOROUGH mode, now sorted by rank score. 147 candidates. RELAY-APEX is #1 with 0.93. He scrolls to the bottom.

The 10 lowest-ranked candidates:
```
138. SCOUT-SILENT-B   pivot-activity: 0.12 · recency: 0.03 · volatility: 0.09 · score: 0.08
139. RULE-ANCHOR-1    pivot-activity: 0.09 · recency: 0.01 · volatility: 0.06 · score: 0.06
140. DISPATCH-3       pivot-activity: 0.11 · recency: 0.00 · volatility: 0.08 · score: 0.07
141. RELAY-QUIESCENT  pivot-activity: 0.07 · recency: 0.01 · volatility: 0.04 · score: 0.04
142. FILTER-LOW       pivot-activity: 0.08 · recency: 0.00 · volatility: 0.07 · score: 0.05
```

Marcus doesn't know if the real vulnerability is one of these. THOROUGH's *minimum flip* (the actual smallest change that flips the outcome) was still RELAY-APEX — but the community post said the minimum flip could be the canary too (a real but minor vulnerability), while the structural weakness is deeper.

He tries something new: he opens the "minimum adversarial outcome" variant, then searches for the change among the low-ranked candidates that produces the most decisive attack (not the minimum flip, but the *most damaging* single-element change). He sorts the adversarial results by "decisiveness" instead of "element size."

At rank 2 by decisiveness: *"Opponent's RELAY-QUIESCENT — hook threshold: 0.7 → 0.5. This allows a borderline-quality signal to propagate earlier in the match (tick 21), arriving at the opponent's striker before your defensive position is established."*

Tick 21. Pre-pivot-window. Marcus checks — his defensive setup isn't complete until tick 28. An attack arriving at tick 21 bypasses his entire early defense.

He deploys a counter to RELAY-QUIESCENT as v2.6 (replacing the RELAY-APEX counter). He wins Match 7.

**Minute 8:00 — The After-Action**

Marcus writes in his notes: *"RELAY-APEX was a canary. 5 sessions chasing it. RELAY-QUIESCENT was the real attack vector. Pre-ranking heuristic is vulnerable to elements engineered to look suspicious. Check the bottom of the candidate list for boring, never-modified elements when the QUICK result keeps failing."*

He adds to his diagnostic workflow: **after each adversarial scan, check the 5 lowest-ranked candidates manually.** The worst-ranked elements are the ones that have no pre-ranking signal — which is exactly where a sophisticated opponent hides the real vulnerability.

**UI Annotations:**
- **"Sort by decisiveness" toggle**: In THOROUGH mode's result list, a small dropdown: "Sort by: [Rank score ↓] [Flip probability ↓] [Attack decisiveness ↓] [Smallest element change ↓]." Sorting by "attack decisiveness" reveals the minimum flip was a canary and the deeper structural vulnerability is at rank 2 by decisiveness.
- **Bottom-of-list candidates**: THOROUGH mode shows all 147 candidates in a scrollable list. The bottom-ranked elements have no visual treatment signaling they're important — they look boring by design. This is intentional: there is no "watch this boring element" alert. Marcus has to figure out the strategy himself.
- **Community Discord integration**: No in-game integration. The community channel discovery is organic — Marcus found it through external search. The game design choice: don't tell players about poisoning in-game; let the community teach each other.

---

#### Journey: Tomás, 34, backend engineer, Research Mode — "The Heuristic Autopsy"

**Context:** Tomás has been thinking about the pre-ranking transparency panel for two weeks. After discovering that SCOUT-B was ranked above RELAY-C because it was the sender rather than the receiver (from the 4.58 journey), he's been thinking about a broader question: what are all the ways the pre-ranking can be wrong, and can he systematically catalog them?

He's entered a self-directed research mode, spending a session deliberately constructing failing cases for the pre-ranking heuristic, separate from his Gauntlet competitive play.

**Minute 0:00 — The Research Setup**

Tomás is on the workbench. He's built two test configs specifically for this investigation:
- **Config A (Normal)**: A standard architecture with no adversarial engineering. Real vulnerabilities are in obvious places.
- **Config B (Poisoned)**: Constructed to maximize pre-ranking failure. Contains a canary element (RELAY-TRAP) engineered for all three signals, and a real vulnerability in RELAY-STEALTH, a quiet element.

He opens the Fix Explorer against Config A in both QUICK and THOROUGH modes to establish a baseline — 71% pre-ranking accuracy on normal configs (matching his historical stat). Then he runs Config B.

**Minute 1:00 — Config B vs. the Pre-Ranking**

Config B, QUICK mode: *"FIRST VIABLE FIX: RELAY-TRAP — buffer +1 slot. Rank score: 0.96."*

RELAY-TRAP is ranked almost perfectly. He engineered it specifically: pivot-tick active (hooks fire reliably at tick 45–55 in his test scenarios), recently modified (six small edits over the last three sessions), high volatility (11 conditional branches all fire in test scenarios).

THOROUGH mode (2 minutes, full enumeration): *"MINIMUM FIX: RELAY-TRAP — buffer +1 slot."*

THOROUGH also found RELAY-TRAP as the minimum fix. The canary is a real vulnerability — Tomás engineered it to be a genuine (if suboptimal) attack vector.

**Minute 3:00 — The Deeper Adversarial Search**

Now he sorts THOROUGH's results by "attack decisiveness."

Rank 1 by decisiveness: *"RELAY-STEALTH — hook threshold: 0.6 → 0.45. This allows a borderline signal to propagate at tick 19, bypassing Config B's defensive positioning entirely. Match outcome flips with decisiveness 0.79 (very decisive)."*

Rank 1 by minimum fix: *"RELAY-TRAP — buffer +1 slot. Match outcome flips with decisiveness 0.31 (marginal)."*

The canary is the minimum flip but not the most effective attack. The real vulnerability is 10× more effective but ranked at #47 by pre-ranking (RELAY-STEALTH has a pre-ranking score of 0.08 — quiet, unchanged, invisible at the pivot).

**Minute 4:00 — The Failure Mode Taxonomy**

Tomás opens a note-taking panel and starts writing a taxonomy of pre-ranking failure modes, based on his research:

```
PRE-RANKING FAILURE TAXONOMY (personal research)
─────────────────────────────────────────────────
TYPE 1: Symptom-Before-Cause
  Signal: Sender is active at pivot, receiver is the root cause.
  Example: SCOUT-B active because it's sending; RELAY-C is the problem.
  Detection: Look downstream from the pre-ranked element.

TYPE 2: Recency Inflation
  Signal: Recently modified element is active-but-secondary.
  Example: Iterative debugging creates high recency on irrelevant element.
  Detection: Note which elements you recently changed for unrelated reasons.

TYPE 3: Volatility Noise
  Signal: High-volatility element is busy but not causal.
  Example: Relay with many conditional branches fires often; root cause is
    a quiet element that sets up the initial condition.
  Detection: Ask "is this element's volatility caused by its importance
    or by its design having many branches?"

TYPE 4: Pre-Pivot Window Vulnerability
  Signal: Root cause operates before the pivot tick; pivot-active elements
    are downstream effects, not causes.
  Example: RELAY-STEALTH fires at tick 19, effect compounds to pivot at tick 52.
  Detection: Look for quiet elements active 20-40 ticks before the pivot.

TYPE 5: Adversarial Poisoning (Pre-ranking Poisoning)
  Signal: All three pre-ranking signals have been deliberately inflated for
    a decoy element. Real vulnerability is hidden in a low-signal element.
  Example: RELAY-TRAP (canary) vs. RELAY-STEALTH (real vulnerability).
  Detection: Consistent QUICK/THOROUGH alignment on the same element across
    multiple sessions + that element's counters consistently underperforming.
```

He adds a note at the bottom: *"Type 5 is qualitatively different from Types 1-4. Types 1-4 are unintentional — natural consequences of how configs work. Type 5 is intentional. The opponent is actively modeling the pre-ranking heuristic and designing against it. This requires adversarial thinking that Types 1-4 don't prepare you for."*

**Minute 6:00 — The Real-World Connection**

Tomás types: *"Type 5 = adversarial feature engineering in ML. Adversarial examples — inputs designed to fool a classifier — work by maximizing the model's confidence signals while minimizing the true discriminative signal. RELAY-TRAP is an adversarial example for the pre-ranking classifier. The pre-ranking classifier has three features (pivot-activity, recency, volatility). An adversarial input maximizes all three while hiding the actual causal signal (RELAY-STEALTH's pre-pivot-window activity) in a feature space the classifier doesn't observe."*

He googles "adversarial examples machine learning" and finds Ian Goodfellow's original paper. He reads the abstract. He comes back to the game thinking: *"Robot Uprising taught me adversarial ML. That was not what I expected from a strategy game."*

**Minute 8:00 — Resolution**

Tomás posts his failure mode taxonomy to the game's community Discord. It gets 87 upvotes and a pinned annotation from a moderator: "Reference post — save this."

He feels satisfied. This session produced no competitive progress. But it produced a mental model he'll use for the rest of his time in the game — and, he suspects, for the rest of his time in software engineering.

**What Tomás wants to do next:** Can he build a pre-ranking configuration (using the weight sliders) that is maximally resistant to Type 5 poisoning? What signal combination is hardest to game?

**UI Annotations:**
- **Research mode**: No in-game "research mode" — Tomás simply uses the Fix Explorer analytically rather than to diagnose failures. The tool supports this use case without requiring a mode switch.
- **Failure taxonomy note**: Written in the session notes panel (if it exists as a designed feature). Alternatively, written in an external notes app. The game doesn't have a structured taxonomy feature — Tomás is inventing this himself.
- **"Sort by decisiveness" toggle**: Present in THOROUGH mode's full result list, allowing comparison of minimum-fix rank vs. decisiveness rank. Crucial for exposing the canary vs. real vulnerability distinction.

---

## Strengths

**Creates authentic competitive depth.** Pre-ranking poisoning is a mechanic that can only be discovered by players who deeply understand the pre-ranking heuristic. It rewards the investment in learning the diagnostic tools. A player who has never opened the transparency drawer cannot construct a canary; a player who has mastered it can. This is exactly the kind of skill ceiling that separates good players from great ones.

**Teaches adversarial thinking as a first-class skill.** Knowing that a system can be gamed — and knowing how to game it — is a transferable engineering skill. Penetration testers, security engineers, and ML practitioners all need the mental model of "what signals does this system observe, and how do I design an input that manipulates those signals while hiding the real structure?" Pre-ranking poisoning teaches this exact cognitive operation through tactile play.

**Makes the diagnostic tools feel earned.** After a player encounters a poisoned config, the QUICK mode pre-ranking becomes something they calibrate cautiously rather than trust blindly. This calibration is correct. A heuristic-based system should be trusted probabilistically, not absolutely. The game teaches this by making the stakes real.

**Generates community knowledge asymmetry.** Players who discover poisoning have a competitive edge that persists until the technique becomes widely known. This creates a natural progression of community knowledge: early adopters gain an edge, publish their findings, and the community adapts. Each such cycle advances everyone's understanding of the system.

**Produces a realistic cybersecurity mental model.** The attacker-defender dynamic in pre-ranking poisoning maps directly to security signal engineering: defenders build detection systems using observable signals; attackers design operations to maximize false-positive signals while hiding real activity. Players who engage with the poisoning meta-game are learning the foundations of threat intelligence.

---

## Weaknesses

**Deeply inaccessible to players who haven't mastered the pre-ranking system.** A player who doesn't know what the pre-ranking heuristic is cannot discover, execute, or defend against poisoning. This is a Wave 4+ concept — meaningful only after the player has internalized the transparency panel, the configurable weights, and the adversarial counterfactual mode. In the early and mid-game, poisoning is invisible noise.

**High config complexity cost.** Engineering a good canary requires burning config space on an element designed to deceive, not to play. At high levels of play, every config slot is valuable. A well-designed canary that costs three rules might be worth it; a canary that requires five rules and its own buffer allocation might cost more than the strategic obfuscation is worth.

**The canary is a liability if discovered.** Once an opponent identifies the canary, they can stop wasting compute on it, drop their adversarial pre-ranking weight for its characteristics, and focus analysis on the bottom of the candidate list. A canary that has been identified is worse than no canary — the opponent knows you use poisoning strategies and will analyze accordingly.

**Creates potentially unfun experiences.** A new Gauntlet player who loses six matches because their adversarial analysis is being systematically misled might feel the game is broken rather than recognizing the strategic dynamic. The "bewildering loss" experience (Marcus's journey) is only valuable if the player eventually figures out what happened. If they quit instead, poisoning has produced a player-experience failure.

**Difficult to balance.** A poisoning strategy that costs nothing and provides perfect deception is too powerful. A poisoning strategy that costs too much to construct isn't worth doing. The calibration point — where the canary costs exactly as much as the competitive advantage it provides — requires careful tuning of the config complexity budget.

---

## Interaction Effects

**4.39 — Adversarial counterfactual mode:** The pre-ranking adversarial surface only exists *because* adversarial mode runs a pre-ranked heuristic. Without adversarial mode as a player tool, there's nothing to poison. The existence of adversarial mode is the prerequisite for pre-ranking poisoning as a strategic option. This interaction is the entire basis for the mechanic.

**4.60 — Search budget as resource:** Poisoning's primary competitive value is forcing the opponent to spend compute budget on THOROUGH mode. If compute budget is scarce, a successful poisoning operation drains a resource the opponent cannot easily recover. The more budget-constrained the Gauntlet mode, the more valuable poisoning becomes as a strategy.

**4.63 — Player-configurable pre-ranking weights:** The primary technical counter to poisoning. By de-emphasizing the signals the poisoner inflated (volatility for behavior-rich canaries, recency for artificially-edited canaries), a defender can move their pre-ranking away from the canary and toward genuine structural anomalies. This creates an arms race between poisoners and defenders that drives the competitive meta-game.

**4.57 — Threat model report:** An extended threat model report for a given opponent should include a "canary probability" analysis: if adversarial QUICK results for a specific opponent have low accuracy (frequently diverge from the most decisive attack vectors), the report flags elevated canary risk. This would give long-term Gauntlet players a durable record of which opponents use poisoning strategies.

**2.12 — Deception signals:** If the core game already has explicit deception mechanics (agents that generate false signals), pre-ranking poisoning connects the gameplay deception layer (agents lying to each other) to the meta-game deception layer (config architecture lying to diagnostic tools). A game that has deception built into the first-person mechanics has established a vocabulary for the pre-ranking poisoning concept — players who understand deception signals will more readily understand pre-ranking poisoning as a natural extension.

**4.15 — Probe hooks:** Advanced defenders can use probe hooks to instrument the suspected canary element during a match, capturing its state transitions. If the probe data shows the canary is producing many state changes but its output is never consumed by the decisive chain, it confirms canary status. Probe hooks as anti-canary diagnostic tools is a natural evolution once the poisoning meta-game is established.

**4.36 — Multi-scenario Minimum Fix Explorer (MSMFE):** Against a poisoned config, a multi-scenario fix (finding the single change that improves the most failing scenarios simultaneously) is more resistant to canaries. A canary that is a real-but-minor attack vector may produce minimum flips in specific scenarios but not improve the attacker's outcome across diverse scenarios. Running MSMFE against a suspected poisoned config reveals whether the pre-ranked element produces improvements across the board (suggesting it's real) or only in narrow cases (suggesting it's a canary optimized for specific trigger conditions).

**4.55 — Cross-match adversarial aggregation:** Aggregating adversarial results across 5+ matches against the same opponent is the strongest systemic counter to poisoning. A canary produces consistent pre-ranking signals across all matches. But the most decisive attacks (when sorted by adversarial effectiveness) will point at different elements than the consistent canary across different maps and scenarios. The cross-match aggregation of "most decisive attacks" would consistently point away from the canary and toward structural vulnerabilities.

---

## Comparable Games and Media

**Adversarial machine learning (Goodfellow et al., 2014):** The foundational academic concept. Adversarial examples are inputs designed to fool a classifier by maximizing confidence in a wrong class while suppressing evidence for the correct class. Pre-ranking poisoning is adversarial example design applied to a diagnostic heuristic rather than a neural network classifier. The structural analogy is exact: the attacker knows the feature space (three signals), knows the decision function (pre-ranking score), and designs an input (the canary element) that maximizes the score for the wrong candidate.

**Camouflage and decoy tactics in military strategy:** Military deception operations (Operation Bodyguard, which preceded D-Day) work by creating high-confidence signals for the wrong location while concealing real preparations. The "ghost army" created fake equipment, fake communications, and fake activity to inflate British-held locations as the intended invasion point. RELAY-TRAP is the ghost army. RELAY-STEALTH is Normandy.

**Honey pots in cybersecurity:** A honey pot is a system configured to look attractive to attackers — high-value-appearing, slightly vulnerable, positioned where attackers will find it — while the real systems are hardened behind it. The canary element is a honey pot for the diagnostic tool rather than for the adversary directly. A sophisticated opponent's adversarial scanner attacks the honey pot instead of the real vulnerability.

**Pokémon competitive meta: misleading nature/EV investment signals:** Competitive Pokémon players design teams where visible signals (the Pokémon species, move set, item) suggest a standard archetype, but the actual EV spread makes it a counter to that archetype's counters. The "lure" — a Pokémon designed to look like a set-up sweeper but actually with maximum speed investment to outrun the expected check — is pre-ranking poisoning in the team-building layer.

**Starcraft II: proxy builds and fake tech paths:** In competitive SC2, a player can spend resources building proxy barracks (hidden production facilities) while their visible tech path suggests a completely different strategy. Observers analyze the visible signals (tech tree progression) and draw wrong conclusions. The real attack vector (proxy marines) is invisible until it's too late to counter. The proxy barracks is the canary; the hidden production is RELAY-STEALTH.

**Data poisoning in ML training:** Adversarial data poisoning attacks inject mislabeled training examples to corrupt an ML model's learned associations. Pre-ranking poisoning is analogous but targets the inference-time heuristic rather than a learned model. The attacker is injecting a "mislabeled training example" into the pre-ranking's input by designing a config element that looks like it causes failures without actually doing so.

---

## Sensory Description

**The canary element in the config tree:**

On the workbench screen, RELAY-TRAP looks completely normal. It has the same visual treatment as any other relay: a compact rectangular card in the agent column, its name in white type, a small icon indicating its agent class. Nothing marks it as a canary. Its rules panel has many rows (11 conditional branches, rendered as alternating light/dark rows), which looks busy but not suspicious — many legitimate relays have complex rule sets.

The player who designed it knows the truth. The player who encounters it in adversarial analysis sees a relay that lights up brightly in every diagnostic view: amber at the pivot tick (pivot-activity), teal clock on its modification timestamp (recent), violet waveform in its state history (high volatility). It looks guilty. It is designed to look guilty. There's no visual marker distinguishing deliberate guilt from real guilt.

**The adversarial QUICK result for a poisoned config:**

The Fix Explorer's pre-ranking runs. The progress bar sweeps amber-red (adversarial mode coloring). One result populates: RELAY-TRAP, rank score 0.96. The transparency drawer opens slightly, the amber glow of the pre-ranking explanation visible at the bottom — "active at pivot tick, recently modified, high volatility."

For the player being deceived, everything looks exactly right. The explanation is coherent. The candidate is plausible. The visual presentation is confident.

**The moment of discovery (Marcus's pattern recognition):**

Three adversarial results side by side in the counterfactual history view. All three show RELAY-APEX in bold amber at rank 1. The rank score chips pulse faintly: 0.93, 0.91, 0.94. They're similar across three different matches — suspiciously similar.

Three matches with three different outcomes, same pivot tick variance, same opponent plays, and the same element at rank 1 with similar scores. Real pre-ranking accuracy usually shows some variance. Consistent confidence-scores across different match contexts is the fingerprint of a canary.

**Sorting by decisiveness vs. rank score:**

The THOROUGH mode results list. Two columns become visible: the rank score column (the pre-ranking's vote) and the decisiveness column (the actual attack effectiveness). For a poisoned config, these columns don't agree: RELAY-TRAP is rank 1 by pre-ranking score (0.96) but rank 7 by attack decisiveness (0.31). RELAY-STEALTH is rank 47 by pre-ranking score (0.08) but rank 1 by attack decisiveness (0.79). The two sort orders produce visually discordant lists — cards jumping from top to bottom and back. A normal, unpoisoned config shows correlated ranks: the pre-ranking is usually pointing at the most decisive attack vectors. A poisoned config shows anti-correlated ranks: the thing the pre-ranking thinks matters doesn't matter; the thing the pre-ranking ignores matters enormously.

**The emotional texture of discovering you've been poisoned:**

Not anger. Grudging respect. The player realizes they've been playing a game at a level of abstraction they didn't know existed. The game they thought they were playing (optimize attack configs, diagnose failures) was also a game of epistemological deception — your diagnostic tools themselves were being manipulated. The discovery that a tool you trusted has been fooled produces a specific feeling: the same feeling as learning that a colleague's confidence in a diagnosis was manufactured, not earned. Uncomfortable, clarifying, and strangely motivating.

---

## The TikTok Clip

Six adversarial scan results side by side on screen. All of them: RELAY-APEX ranked #1. All of them: analysis shows the counter didn't work.

The player types into the candidate list sort: "decisiveness." The list reshuffles. RELAY-STEALTH jumps from rank 47 to rank 1. The player's reaction: *"...oh. OH."*

Cut to the match replay. RELAY-STEALTH fires at tick 19. The opponent's defensive position isn't established until tick 28. The player watches the consequence play out six ticks later.

Cut to: new counter, targeting RELAY-STEALTH. Win.

**Caption:** *"the element ranked 47th out of 147 was the one that was killing me the whole time"*

---

## Discovered New Aspects

1. **4.97 — Canary rotation as season meta-strategy**: A poisoner who uses the same canary architecture across multiple seasons eventually gets their canary identified by opponents who notice the cross-season pattern. "Canary rotation" is the practice of deploying a different decoy element each season — requiring redesign of the canary for each new competitive period. This is a non-trivial config investment and creates a natural "season arc" for advanced players: re-engineer the Smoke Screen every season or risk meta-discovery.

2. **4.98 — Anti-canary heuristic as a fourth pre-ranking signal**: After the poisoning meta-game is established in the community, a late-game pre-ranking upgrade adds a fourth signal: "cross-match consistency" — how consistent is this element's rank score across the current opponent's previous 5 matches? Elements with suspiciously consistent high rank scores across diverse match conditions are down-weighted (high consistency = possible canary). This teaches the principle that a reliable heuristic signal is harder to poison than a volatile one.

3. **4.99 — "Fog of canaries" architecture**: Instead of one well-optimized canary, a player deploys 3-5 moderately suspicious elements, none perfectly canary-like but collectively creating so much pre-ranking noise that THOROUGH mode is required to find any real attack vector. This exhausts compute budget more systematically than a single obvious canary. Counter-play: MSMFE (4.36) across multiple suspicious elements to find which one produces improvements across the most diverse scenarios.

4. **4.100 — Canary-aware community notation**: A standardized community shorthand for documenting poisoning strategies in config notes and shared necropsy artifacts. Like "lure" in competitive Pokémon team building (an element designed to attract and absorb a specific counter), "canary" becomes a recognized term. Community guides describing specific opponents' canary elements emerge as a form of collective intelligence. Interaction with 7.10 config necropsy culture.

5. **4.101 — The "honest decoy" variant**: A poisoned pre-ranking can be constructed where the canary is also a genuine strategic element — it serves a real purpose in the config AND scores high on pre-ranking signals. The opponent who attacks the canary reduces its effectiveness, which is a real cost. But the decoy's strategic value is far lower than the hidden vulnerability. Attacking the canary "works" (the opponent sees marginal improvement) but doesn't address the structural threat. This is the highest form of pre-ranking poisoning: the deception is built into a real operational element, not a fake one.

# Replay Length as Tension Design

**Aspect:** 1.06c-ext-A-i — Minimum match duration required for sealed tension to function; mission design constraints around ensuring competitive Gauntlet matches run 60–180 ticks; how fast-resolution stomps are prevented without artificial health inflation

**Parent:** 1.06c-ext-A — Sealed Replay as Tension Mechanic

---

## The Core Question

Sealed replay tension depends on a precondition: **the player must be uncertain about the outcome long enough to care.**

A match that resolves in 12 ticks doesn't produce suspense. The mechanical collapse is too fast — before the player even understands what's happening, the SEALED bar dissolves into red. The manufactured uncertainty never generates emotional investment. Worse, it teaches the player that replays are "loading bars for results" rather than genuine dramatic events.

For sealed tension to work, matches must be long enough that:

1. The player forms an expectation (scouts contact the enemy, hook chains fire, their model of "how this is going" takes shape)
2. That expectation is tested (the enemy configuration does something unexpected, a unit fails, a signal chain breaks)
3. The outcome is uncertain at the midpoint (neither side is obviously winning)
4. Resolution is earned (the final result flows from identifiable decisions, not random noise)

The design claim: **60–180 ticks is the minimum viable window for sealed tension to function**. Below 60, the drama is truncated. Above 180, matches overstay their welcome — a 5-minute Gauntlet match is long for a game about watching robots execute plans you made 3 hours ago.

This document explores every design lever for ensuring matches land in this window without artificial health inflation (which would slow matches without adding interest — padding, not drama).

---

## The Anatomy of a Dramatic Match

Before examining solutions, it helps to understand what makes a match emotionally satisfying moment-to-moment. A well-designed 90-tick match has roughly this structure:

```
TICKS 0–15   — Deployment & early movement
TICKS 15–35  — First contact, initial hook chains fire
TICKS 35–60  — Midgame: architectures test each other, signal routing under pressure
TICKS 60–85  — The pivot: one architecture adapts (or fails to)
TICKS 85–100 — Collapse or recovery: the decisive phase
TICKS 100+   — Cleanup or extended standoff
```

For sealed tension, the **midgame** phase is what does the work. It's the stretch where the player watching sealed thinks "this could go either way." Early contact gives them a model. The pivot surprises them. Resolution confirms or defies their expectation.

A 30-tick stomp skips the midgame entirely. The player gets early contact and then immediate collapse — no period of genuine uncertainty, no moment where their model gets updated. They watch a beheading, not a match.

---

## Why Stomps Happen (Taxonomy of Fast Resolutions)

Not all fast resolutions are equal. Some are legitimate design failures; others are architectural bugs. Understanding the failure modes shapes the solution space.

### Type 1: Architecture Mismatch Stomp

The weaker player's configuration has no response to the stronger player's strategy. The stronger player's striker reaches the weaker player's relay node in tick 8 because the weaker player didn't position any interceptors.

**Duration:** 15–30 ticks
**Why it's a problem:** No sealed tension; the replay is a demonstration of helplessness, not a strategic battle
**Fix direction:** ELO bracket design and match-making constraints

### Type 2: Early Cascade Failure

The weaker player's hook chain misfires in tick 3 — the relay fires a signal that hits a full buffer on the striker, the striker never escalates, the flanking unit wanders in circles for the rest of the match.

**Duration:** Technically 80+ ticks, but the outcome is decided at tick 3
**Why it's a problem:** Technically long, but *narratively* a stomp — the player watching sealed will diagnose the failure at tick 3 and stop caring about ticks 4–80
**Fix direction:** The *pivot* needs to be in the second half of the match, not the first 10 ticks

### Type 3: Level-Differential Stomp

ELO relaxation (matching players 200+ ELO apart because the pool is small) causes a structurally uncompetitive match. The stronger player's architecture is systematically superior at every layer.

**Duration:** 20–40 ticks
**Why it's a problem:** No design intervention can make this match interesting; the configurations aren't competing, they're demonstrating a gulf
**Fix direction:** ELO relaxation as last resort, not first resort; AI ghost configs at baseline tiers to reduce need for extreme relaxation

### Type 4: Objective Stomp

One player captures the mission objective (flag, relay node, command nexus) in the first 20 ticks before the other player's architecture even understands the objective is being contested.

**Duration:** 20 ticks
**Why it's a problem:** No engagement; the winning architecture wasn't necessarily better, just faster at understanding the objective
**Fix direction:** Objective design — objective capture should require sustained presence, not first-touch

### Type 5: Defensive Collapse

One player's defensive configuration folds the moment an aggressive architecture arrives. No counters exist because the defensive player didn't include any.

**Duration:** 25–40 ticks
**Why it's a problem:** This isn't actually a stomp in design terms — it's a legitimate strategic failure. The defensive player built the wrong things. But it produces a fast-resolution match.
**Fix direction:** This is a player education problem, not a mission design problem. The debrief should teach *why* the defense failed, not extend the match artificially.

---

## Design Levers for Match Duration Control

Seven distinct design levers can control minimum match duration. They're ordered from "architectural constraint" (deep, structural) to "surface intervention" (cheap, risks feeling artificial).

### Lever 1 — ELO Bracket Tightness

**What it does:** Match only players within a tight ELO window. A ±50 ELO bracket means nearly every match involves architecturally comparable opponents.

**How it controls duration:** Architecture mismatch stomps (Type 1) require a skill differential to execute. Within a tight ELO bracket, such differentials don't exist. Matches naturally run longer because neither architecture has an overwhelming advantage.

**Trade-offs:**
- Requires population density in every ELO band. Thin populations force ELO relaxation, reintroducing stomps.
- AI ghost configs (1.06c-ext-E) are the pressure valve. When real opponents aren't available at your ELO ±50, an AI ghost trained to produce competitive matches fills the slot.
- **Target:** ≥80% of Gauntlet matches should be within ±100 ELO. ELO relaxation to ±200 only after 48-hour wait.

**How long this extends matches:** Variable. Well-matched architectures naturally produce 80–120 tick matches.

---

### Lever 2 — Spatial Distance Between Starting Positions

**What it does:** Ensure deployment zones are far enough apart that meaningful contact requires 20+ ticks of movement.

**Tick math:** A unit moving at standard speed covers 2 tiles/tick. Scouts move at 3 tiles/tick. If deployment zones are 12–18 tiles apart (a reasonable Gauntlet map), first scout contact happens at tick 4–6. First *meaningful engagement* (where the scouts' buffered data has propagated through relay chains) happens at tick 15–25.

**The no-rush rule:** This is structurally analogous to StarCraft's "no rush X minutes" house rule, but designed into the map rather than enforced socially. Map scale is the natural version of this.

**How Robot Uprising implements this:** Gauntlet map templates should enforce minimum deployment-zone distance of 16 tiles with terrain obstacles (chokepoints, detection-dead-zones) that route scouts on paths longer than the straight line. A 16-tile straight path becomes a 28-tick travel time when routed through a detection-dead zone.

**Trade-offs:**
- Too much distance and matches feel slow in the early phase (boring setup, no action).
- Optimal: maps where there are *multiple* possible approach paths of varying length, making path selection itself a strategic choice.

---

### Lever 3 — Objective Capture Requirements

**What it does:** Design objectives that require *sustained presence*, not first-touch. A relay nexus that takes 15 ticks of continuous occupation to capture cannot be sniped by a fast unit in tick 8.

**Mechanics options:**

**Option A — Capture timer:** First unit on the objective starts a countdown. Timer pauses if opponent unit contests. Complete the countdown to capture.
- Creates standoff tension in late match
- Supports sealed uncertainty (the timer running out is a visible, watchable event)
- Risk: stalemates if both architectures tie the objective indefinitely

**Option B — Relay signal accumulation:** Objective requires N relay signals from your architecture to "hack." Your relay node must process 20 signals with source=objective before it's captured.
- Naturally integrates with Robot Uprising's signal/hook vocabulary — the objective capture is literally what your agents are designed to do
- Prevents sniping but doesn't prevent early completion by well-designed architectures
- Creates an interesting "are we winning the signal race?" uncertainty

**Option C — Defense point holding:** No capture timer. Objective scored by cumulative presence ticks. Winner is whoever held the objective for more ticks at end of match.
- Guarantees full match length (match always runs to max ticks)
- Removes early-win possibility — a mechanically brilliant architecture can't resolve the match quickly; it just runs up the score
- **This is the Gauntlet's primary recommended objective type.** It eliminates the variable match-length problem entirely by design.

**Option D — Elimination:** Last robot standing wins. Standard survival game — no objective.
- Fast-resolution problem is severe. A 4v4 match can end in 20 ticks if one configuration's strike force is overwhelming.
- **Avoid as primary Gauntlet objective for sealed tension purposes.** Valid as a secondary mode.

**Recommendation:** Option C (cumulative presence) as the Gauntlet primary mode, with Option B (signal accumulation) as a secondary mode that rewards architectural efficiency rather than sustained fighting.

---

### Lever 4 — Terrain and Information Topology

**What it does:** Map terrain creates information routing complexity that slows the transition from "deployed" to "fighting effectively."

**The information routing problem:** An architecture designed for an open field will fail on a map with detection-dead zones (tiles where no unit can observe unless directly adjacent). The relay chain needs to adapt. Scouting routes lengthen. The first contact doesn't happen at the predictable tick; it happens at tick 22 instead of tick 15.

**Terrain types for match-length control:**
- **Chokepoints:** Force units to queue (or route around). Engagement at chokepoints is slower, more drawn-out. Units can't engage multiple opponents simultaneously.
- **Detection-dead zones:** Tiles where sensor queries return empty even if enemies are present (heavy interference terrain, blind alleys). Scouts must physically enter them. Slows first contact. Creates "hidden flank" scenarios.
- **Relay relay-poor zones:** Areas where hook propagation has a 2-tick penalty (interference reduces transmission speed). Architectures with long relay chains are slower in these zones. Makes the midgame more costly and forces buffer management decisions under time pressure.

**How this controls match length:** Terrain complexity extends the "setup" phase (ticks 0–30) by requiring scouts to navigate rather than rush. A scout that would make first contact at tick 8 on an open map makes it at tick 18 on a terrain-complex map. This shifts the pivot deeper into the match, ensuring the midgame exists.

---

### Lever 5 — Signal Processing Latency (Natural Pacing Mechanism)

**What it does:** Because Robot Uprising uses a 1-tick-per-hop signal model, complex architectures take longer to react to events. A scout detecting an enemy at tick 15 doesn't produce a striker action until tick 18–22 (scout → relay → striker, plus processing delay). Architectures with more layers react more slowly.

**Why this helps match length:** A 3-layer architecture and a 1-layer architecture engage at very different effective reaction speeds. The 3-layer architecture's first meaningful action against first-contact data happens 7–10 ticks after the 1-layer architecture's. This natural latency forces multi-phase engagements — by the time the complex architecture has fully committed to a response, the simple architecture has already moved.

**The double-edge:** This same latency can produce cascade failure stomps (Type 2). If the complex architecture's slow response means its striker arrives after its relay is already destroyed, the entire pipeline collapses in 30 ticks.

**How to prevent premature cascade:** The **signal-acknowledgment system** (aspect 2.18 — optional ACK hooks) lets architectures detect downstream failures and reroute before full collapse. An architecture that detects "my relay hasn't ACK'd my last 3 signals" can trigger a fallback path. This converts a fast cascade failure stomp into a slow recovery attempt — extending match length organically by turning Type 2 stomps into midgame crises instead.

---

### Lever 6 — Match-Length Mission Parameters

**What it does:** Gauntlet maps explicitly specify a `max_ticks` parameter. All matches on that map end at that tick regardless. The winner is determined by score-at-max-ticks.

**Why this is essential:** Without a ceiling, architecturally resilient matches can extend indefinitely (two defensive architectures that refuse to engage). With a ceiling, every match has a known duration. Combined with Option C objectives (cumulative presence scoring), both players always play to the last tick.

**The ceiling as emotional tool:** Knowing the match ends at tick 120 creates tension in the final 20 ticks even if the score isn't close. The player watching sealed counts ticks: "We're at tick 100, they're down by 8 points, can they come back?" The countdown creates urgency the architecture itself doesn't generate.

**Tick range calibration:**
- `max_ticks: 80` — Fast, punishing matches. Good for "quick play" Gauntlet ladders but too short for meaningful sealed tension in most match types.
- `max_ticks: 120` — Recommended standard. At 1 tick/second of visual replay, this is a 2-minute watch. Long enough for a full dramatic arc. Short enough to feel snappy.
- `max_ticks: 180` — Extended match mode. Higher-tier brackets where architectural depth is greater and midgame complexity requires more ticks to resolve.
- `max_ticks: 240+` — Commander-tier only. Reserved for the most architecturally complex match types. A 4-minute sealed watch is viable for players deeply invested; would be tedious for casual participants.

---

### Lever 7 — Floor Mechanics (The Anti-Stomp Without Health Inflation)

This is the hardest design problem: how to prevent Type 1 stomps (architecture mismatch) without making units artificially harder to kill.

**The health inflation trap:** Adding HP multipliers extends matches but doesn't add strategic interest. A 5-minute match where one side is clearly winning from tick 10 is worse than a 2-minute match where the outcome is uncertain. Duration without drama is padding.

**Anti-stomp mechanics that avoid health inflation:**

**Option A — Respawn mechanics:** Destroyed units respawn after 15 ticks at a cost of fabrication resources. The losing player gets multiple chances; matches become wars of attrition rather than single-engagement decisive battles. The architectural fight is: can you maintain fabrication-point economy under pressure?

*Relevance to sealed tension:* Respawn creates "is this actually over?" uncertainty even when one side has lost all active units. The SEALED bar stays sealed longer because the player can't be sure if the respawn surge will work.

**Option B — Reinforcement waves:** At ticks 40 and 80, both players receive automatic reinforcement units (baseline scouts, pre-configured with defensive defaults). These aren't controlled by the player's custom configuration — they're generic. The losing player gets a "floor" of ability; the winning player must still deal with the reinforcement wave.

*Risk:* Reinforcement units that use generic configurations break the architectural fantasy. You built this carefully; who are these strangers following a generic script?

*Fix:* Reinforcements inherit the player's configuration template (spawned from the same blueprint as their scout configuration). They're extensions of the architecture, not invaders.

**Option C — Objective resilience:** The objective node has a defensive configuration itself — it spawns basic guardian units when uncontested, fires brief interference bursts when being captured, has a "last stand" mode that fires all accumulated relay signals in a burst when about to be taken.

This doesn't prevent architectural loss; it extends the *duration* of the objective contest phase. A superior architecture still wins; it just takes longer to clear the guardian units.

*Why this works:* The guardians are a known quantity in both players' mission briefing — they're not a surprise, they're a designed feature. They make objective capture cost time, not skill.

**Option D — Momentum-based pacing:** Matches include a "momentum meter" visible in replay. When one side leads by >15 presence-ticks in the cumulative objective score, the trailing architecture automatically gets a 10% signal-processing speed bonus — their hooks fire slightly faster, their buffer queries complete in one fewer tick. This is a small bonus — not enough to reverse a 3-tier skill differential, but enough to slow a borderline stomp and extend mid-tier matches into genuine uncertainty.

*Philosophical risk:* This is "rubber banding" — a game design pattern that competitive players often despise because it reduces the value of building a superior configuration. In a game about architecture quality, making worse architectures artificially competitive is architecturally insulting.

*When it's acceptable:* Only in Casual/Unranked modes. Never in the Gauntlet. The Gauntlet is supposed to reward better architectures — momentum bonuses would corrupt the competitive integrity that gives Gauntlet ELO its value.

**Recommendation:** Option A (respawn at fabrication cost) as primary anti-stomp for Gauntlet. Option C (objective resilience) as map-design convention. Options B and D only in casual/training modes.

---

## The 60-Tick Minimum Rule

Synthesizing the above: **every Gauntlet match format should be designed so that even a one-sided architecture mismatch cannot resolve in under 60 ticks.**

This requires:
- Minimum deployment separation of 16 tiles (ensures ticks 0–20 are movement, not combat)
- Objective capture requiring 15+ ticks of continuous presence (prevents early objective snipes)
- Respawn mechanics (gives the losing architecture at least one additional engagement cycle)
- `max_ticks: 120` as the standard ceiling (ensures every match has a second act)

A well-designed Gauntlet map with these properties means:
- 90% of matches run 60–120 ticks
- 8% of matches run 120–150 ticks (extended standoffs near objectives)
- 2% of matches end before tick 60 (extreme cases: architecture that crashes in its own deployment zone, config errors that prevent any unit movement)

For that 2% — the architectural failure matches — the sealed tension system has a specific response: the sealed bar should dissolve *quickly* when a match ends prematurely. There's no point manufacturing suspense for a 22-tick match where the player's config had a syntax error. The debrief should jump directly to diagnostics mode.

---

## Comparable Games: How They Solve Match Length

### Clash Royale (2016)

**The problem:** Fast matches are possible (3-crown wins in 90 seconds). The game's tension depends on uncertainty remaining until the final seconds.

**The solution:** King Tower health as a floor. You can win 2 crown towers and still face the King Tower with 3,000+ HP. There's always a last act. Additionally, elixir regeneration means the trailing player is always gaining resources — comebacks are mechanically possible, not just theoretically.

**What Robot Uprising takes:** The "King Tower as floor" concept maps directly to objective resilience (Option C above). An objective that has defensive guardians functioning as "King Tower HP" ensures there's always a last act.

**What doesn't translate:** Elixir-as-resource creates a metagame Robot Uprising doesn't have. The economy is fundamentally different.

---

### Auto Chess / Teamfight Tactics (2019)

**The problem:** Dominant early compositions should win quickly. The game wants dramatic comebacks.

**The solution:** HP is not depleted by combat losses — it's depleted by specific unit "damage" calculations applied per round. You can lose every combat round and still have HP remaining for late-game items to matter. Health is a session resource, not a match resource.

**What Robot Uprising takes:** The "session resource" concept. In TFT, you're not watching a single battle — you're watching a series of battles across which your HP erodes. The individual battle result matters, but so does the aggregate trajectory.

**Application:** Gauntlet seasons where wins/losses affect a seasonal "campaign health" could apply this logic. Individual matches aren't existential; the season arc is. This decouples individual match drama from catastrophic consequence — watching a sealed replay of a loss is less stressful if the loss doesn't eliminate you from the season.

---

### Frozen Synapse (2011)

**The problem:** Simultaneous-order-submit tactical game. One good flanking move can end a match in two turns.

**The solution:** Unit positioning constraints and map design. Walls force engagements to happen in specific corridors. Units can't see around corners — the information limitations mean you almost never have enough information to execute a decisive move on turn 1. Most matches require 8–15 turns.

**What Robot Uprising takes:** Terrain as the primary pacing mechanism (Lever 4 above). Frozen Synapse's walls map to Robot Uprising's detection-dead zones. The principle is identical: spatial constraints slow information acquisition, and slower information acquisition extends meaningful play.

**Developer note (Mode 7, GDC 2012):** Ian Hardingham said: "We found that matches under 8 turns felt broken — players didn't have enough information to make satisfying decisions. We tuned map layouts specifically to ensure at least 6 turns of genuine uncertainty." This is exactly the 60-tick minimum argument applied to Frozen Synapse.

---

### StarCraft II

**The problem:** One-sided matches are common. A 200-supply army fighting a 60-supply army ends in 30 seconds of battle.

**The solution:** Distance (as Lever 2 above). Maps are designed so that armies can't reach each other until 5–10 minutes into the game. The economy phase ensures both players have comparable armies before meaningful combat begins. Base placement, ramp mechanics, and fog of war all contribute to a "pre-game" that prevents early decisive combat.

**What Robot Uprising takes:** The "pre-game phase" concept maps to ticks 0–30 in Robot Uprising (movement and scouting before meaningful hook chains fire). Map design should ensure this phase exists and is non-trivial — not just waiting, but active scouting decisions under uncertainty.

---

### Into the Breach (2018)

**The problem:** Perfect information game — every outcome is calculable. Matches could theoretically be decided on turn 1.

**The solution:** Don't make match length the tension source. Each turn is self-contained. The tension is "can I solve this turn's puzzle?" not "who's winning the match?" Match length is irrelevant because every turn is individually satisfying.

**What Robot Uprising takes:** The "per-turn puzzle" insight doesn't translate to async PvP, but it does apply to the debrief. Treating each 10-tick window as an individual analysis puzzle (what was the optimal signal routing in ticks 40–50?) transforms a long replay into a series of satisfying micro-analyses.

---

## Sensory Design: The Long Match vs. the Stomp

### The Long Match (90+ Ticks)

The player watches a long sealed replay. They've formed a model. Several surprising reversals have occurred. The match is in tick 70 and still uncertain.

At this point the replay UI should:

- **Subtle progress indicator**: A thin horizontal line below the replay viewport — not a progress bar (that would tell you the total match length, which could hint at outcome) but a "ticks elapsed" counter in small grey numerals: `TICK 72`. This grounds the player temporally without spoiling length.
- **Increasing ambient urgency**: As ticks accumulate beyond 60, the background industrial hum shifts up in frequency. Not alarming — not the panic state of a full-buffer warning — but a tightening. The world is running out of time to resolve.
- **Active hook visualization**: In longer matches, the hook connection diagram becomes increasingly rich — more lines, more active signals. The visual complexity is a legible indicator of architectural depth. The player can see "a lot is happening" even if they don't track every line.

### The Stomp (Under 30 Ticks)

A match that collapses in 20 ticks should feel *different* from a long match that resolves dramatically:

- The battlefield goes dark faster. Units that collapse produce their defeat animation (power-down glow, signal beam going flat) in quick succession — not dramatic, but acknowledging.
- The SEALED bar dissolves without the "tightening ambient" — the tension never built, so the audio doesn't pretend it did.
- The debrief jumps directly to the failure diagnostic view: "Match ended at Tick 22. Primary cause: Architecture did not respond to first contact. See: Relay signal chain analysis."
- A tooltip appears briefly: "Short matches often indicate a configuration error in the early routing phase. The debrief will show what your architecture was doing at ticks 3–15."

The stomp is an honest experience. It says: "You built something that couldn't handle first contact. Here's why." It doesn't manufacture drama. It just teaches.

---

## Player Journeys

### Journey: Leo, 22, First-Time Gauntlet Player, First Long Match

**Context:** Leo has completed the 7-mission campaign arc. He's just entered the Gauntlet for the first time. His first match notification arrived 4 hours after deployment. He knows about sealed replays from the game's tutorial hint.

**Minute 0:00 — The Notification**

The notification appears on his desktop client. Leo reads the SEALED bar, remembers the tooltip from onboarding. He taps "WATCH NOW."

The battlefield loads. He sees his 3 agents — a scout, a relay, a striker — in their starting positions. The opponent's positions are hidden. The field has a center-map chokepoint (a detection-dead zone marked with a "INTERFERENCE ZONE" visual: slightly darker tiles, small signal-disruption iconography).

*"I forgot there was an interference zone. My scout's going to have to go around."*

**Tick 8 — First Movement Decision Visible**

His scout doesn't go around. It walks directly into the interference zone. Its signal query returns empty — the zone suppresses detection. The scout continues through, emerging on the other side at tick 12.

Leo sees this and winces: "Four ticks blind. That's probably going to matter."

**Tick 18 — First Contact**

The scout emerges from the zone and detects the opponent's relay node 6 tiles away. Buffer fills: `[RELAY_NODE: EAST, TICK-18, FIDELITY:HIGH]`.

The hook chain fires: scout → relay → striker.

The relay's compression skill activates. Leo watches the signal squish from 3 slots to 1. *"Good. The striker should move now."*

**Tick 22 — The Delay**

The striker is at the western edge of the field. The compressed signal arrives at its buffer. But the striker's rule priority has a flaw: "move toward threat" triggers only when buffer has ≥2 threat signals. It has 1.

The striker waits.

Leo is watching a motionless striker while his scout advances deeper into enemy territory. *"Wait, why isn't it moving—"*

**Tick 35 — Second Contact, Buffer Fill**

The scout detects the opponent's striker approaching from the northeast. Second threat signal fills the buffer: `[STRIKER: NE, TICK-35, FIDELITY:MEDIUM]`.

The rule triggers. The player's striker begins moving.

*"Oh. It was waiting for a second signal. That's..."* Leo isn't sure if this was brilliant or a mistake.

**Tick 48 — The Midgame Crisis**

The player's striker is moving northeast — toward the RELAY NODE it was signaled about at tick 18. The opponent's striker is moving to intercept.

These two trajectories will intersect at approximately tick 55.

Leo is leaning forward in his chair now. He doesn't know that. He's watching the converging paths and thinking, for the first time in a Gauntlet match: *this could go either way.*

**Tick 55–62 — The Engagement**

The strikers meet at the eastern chokepoint edge. Direct engagement. 6 ticks of combat resolution. Leo watches the health indicators on both units (Unit HP displayed as a segmented arc around the unit portrait, each segment = 10% HP, segments going dark as damage lands).

The opponent's striker has a higher-priority response configuration — it detects the engagement threat 1 tick earlier and lands the first strike.

Leo's striker is destroyed at tick 61. Opponent's striker survives at 40% HP.

*"Okay. I lost the striker. Is the relay still there?"*

**Tick 62–80 — The Collapse**

With the striker gone, the relay begins receiving orphaned escalation signals — signals it has no downstream consumer for. The relay's buffer fills: 8/12, 10/12, 12/12.

The relay goes into buffer-overflow state. Its port animation goes dark. It's broadcasting into itself.

The opponent's striker reaches the objective node at tick 74. Begins accumulating presence ticks.

Leo's scout is still alive. It detects the objective capture. Its hook fires a priority-1 signal to the relay. The relay's buffer is full — the signal is dropped.

At tick 88, the SEALED bar dissolves left to right. Crimson wave.

Leo stares for 3 seconds. Then: "The relay needed a buffer drop rule. When buffer is full and striker is gone, start dropping the lowest-priority entries to make room. I didn't build a fallback."

He opens the workbench. He's not upset. He's planning.

**What Leo learned:** Buffer management under architectural failure — what to do when a downstream consumer is destroyed and the relay has no outlet.

**What he wants next:** To build a relay with dead-striker detection, a fallback route to the objective node, and an eviction rule that clears space for high-priority signals when buffer hits 80%.

**UI Annotations:**
- **TICK counter**: Small grey numeral bottom-left of battlefield view. `TICK 8`, `TICK 35`, `TICK 55`. Not a progress bar. Just temporal grounding.
- **Buffer fill indicator**: Segmented ring around agent portrait. Fills smoothly as each entry is added. At 80% full: shifts to amber. At 100%: solid red, port animation goes dark.
- **Engagement resolution**: Both strikers visually "lock" into each other during combat (movement stops, attack beam arcs between them every 2 ticks). HP arc segments go dark in real time. The loser's portrait fades to monochrome at death.
- **Match length**: Leo had no idea the match would be 88 ticks. He experienced it as a continuous narrative, not a counted duration. This is the intended experience.

---

### Journey: Yuna, 31, Competitive RTS Player, Understanding Match Pacing

**Context:** Yuna came to Robot Uprising from a StarCraft background. She's at Operator tier in the Gauntlet and has been analyzing match statistics. She's noticed that her wins tend to come in 70–90 tick matches and her losses tend to come in matches under 50 ticks. She's trying to understand why.

**The Pattern She Noticed**

After 40+ matches, she exports her match history to a spreadsheet. The data is clear:

```
Match duration distribution:
Under 50 ticks: 15 matches, W/L = 3/12
50–90 ticks:   22 matches, W/L = 16/6
90+ ticks:      8 matches, W/L = 5/3
```

Yuna stares at this. "I'm good at midgame and I'm dying in openers." She's seen this pattern in StarCraft — it's "early pressure weakness."

**The Diagnostic Watch**

She queues up three of her sub-50-tick losses in the debrief viewer (non-sealed, already resolved). She scrubs to tick 10 in each one.

In all three:
- Her scout has entered the interference zone at tick 6 and is blind for 4 ticks
- The opponent's scout has taken an alternate path around the zone
- At tick 12, the opponent has first contact data; she doesn't
- At tick 15, the opponent's hook chain fires; hers doesn't until tick 20
- The 5-tick gap means the opponent's striker has a position advantage from which she can't recover

**The Fix**

She adjusts her scout's rule: "If moving toward interference zone AND no prior contact, detour to avoid zone." One rule change.

Her next sealed match replay resolves at tick 73. She wins.

"That's it. That's the StarCraft equivalent of 'don't walk your marines through the middle of the map.' Map awareness."

**What this journey shows:** Match duration as a diagnostic tool. The player uses tick-length patterns to identify architectural weaknesses — short losses → early game problem; long losses → midgame/endgame problem. This is deeply intuitive to RTS players and should be surfaced explicitly in the debrief analytics.

**UI Annotations:**
- **Match duration statistics panel**: In the post-season analytics view, matches are bucketed by duration. Win rates per bucket are displayed. This turns "Yuna's spreadsheet analysis" into a first-class game feature.
- **Duration annotation in replay list**: Each match in the replay history shows its duration in ticks next to the result icon. `[W] 73t` vs `[L] 34t`. Scannable at a glance.

---

### Journey: Priya, 42, Systems Architect, Deliberately Engineering Long Matches

**Context:** Priya builds unusually deep, multi-layer architectures. Her configurations have 5+ relay hops, command agents managing sub-agents, and extensive fallback routing. Her matches tend to run long (100–150 ticks). She considers this a design choice.

**Her Theory**

"Short matches are tests of the first 30 ticks. Long matches are tests of everything. I'm not building for the opener — I'm building for the endgame. By tick 80, simple architectures are exhausted: their contexts are full, their strikers are committed, their fallbacks are gone. My architecture just gets better."

**Watching a 140-Tick Sealed Match**

Priya's sealed notification arrives. She makes tea first.

The match starts. Her architecture is slow — three relay hops means first meaningful striker action doesn't happen until tick 25. The opponent is faster. At tick 30, the opponent has accumulated 8 objective presence ticks. Priya's architecture has 0.

*"This is fine."*

By tick 60: opponent 35 presence, Priya 12.

*"Still fine."*

At tick 75: Priya's command agent fires a reconfiguration signal. Two of her scouts shift from PATROL mode to OBJECTIVE mode. Their routing priorities update. They begin contesting the objective.

Opponent: 52 presence, Priya: 23.

At tick 85: The opponent's architecture detects the dual-scout pressure and tries to route defensive signals. But the opponent's relay buffer is 90% full — 100 ticks of match data has filled it. The relay starts evicting old entries to make room for defense signals. In doing so, it evicts the patrol routing instructions for the opponent's remaining defensive unit.

That unit, now without routing instructions, defaults to wandering behavior.

Priya's scouts are uncontested at the objective for 12 ticks.

Opponent: 64 presence, Priya: 52.

At tick 110: Priya's architecture has closed the gap to 8 presence ticks. The opponent's buffer management is in crisis — it's evicting critical entries to survive.

At tick 120: Priya is ahead. 78–74 presence score.

The final 20 ticks are a defensive hold. Priya's command agent fires reconfiguration signals that shift her scouts into defensive positions around the objective, maintaining presence while her relay clears buffer space by evicting stale intel.

At tick 140: Match ends. Priya 105, opponent 88.

The SEALED bar dissolves. **Amber gold**.

Priya sips her tea. "Endgame architecture. They ran out of buffer before I did."

**What this journey shows:** Long matches as a designed competitive advantage. Deep architectures that handle the endgame differently from simple architectures create an alternate path to victory that shorter architectures can't counter-pick against.

**UI Annotations:**
- **Max-tick display**: The match-end screen shows "MATCH COMPLETE — 140/180 TICKS" — informing the player that the match ended before the tick ceiling, not that the ceiling forced the result.
- **Buffer exhaustion visualization in debrief**: The debrief shows each agent's buffer fill level over time as a waveform. Priya's opponent's relay shows a flat 100% fill from tick 85 onward — the buffer exhaustion is visually obvious in the post-match analysis.

---

## Strengths and Weaknesses

**Strengths of the 60-tick minimum design:**

- **Sealed tension reliably functions.** Every match the system produces has a dramatic arc: setup, first contact, midgame, pivot, resolution. Players are never cheated out of the experience.
- **Long matches reward architectural depth.** Players who invest in deep, multi-layer configurations have a natural competitive venue — matches long enough for their architecture's late-game advantages to materialize.
- **Match length itself becomes diagnostic information.** Short losses signal early-game architectural weaknesses; long losses signal midgame problems. This creates a natural self-teaching loop without additional tutorial infrastructure.
- **Eliminates health inflation entirely.** No need for artificial HP multipliers — map design, objective mechanics, and respawn systems produce minimum duration through strategic constraints, not padding.

**Weaknesses:**

- **Complex to tune.** Achieving 90% of matches in the 60–120 tick range requires careful map design, ELO bracket management, and playtesting across multiple tier levels. Getting this wrong produces either all-short matches (stomp epidemic) or all-long matches (boring stalemates).
- **Long matches disadvantage fast iterators.** Players who want rapid testing cycles (multiple deploys per hour) find 140-tick matches frustrating — each iteration takes longer to evaluate.
- **Architecture mismatch still produces short losses.** ELO relaxation is sometimes unavoidable. When it happens, the 2% sub-60-tick matches exist and need to be handled gracefully (fast seal dissolve, immediate debrief).
- **Endgame buffer exhaustion is a new failure mode.** Long matches introduce buffer exhaustion as a late-game mechanic — architectures that don't manage buffer eviction for long match durations will fail in ways they don't fail in short matches. This is depth, but it's also a new complexity layer to teach.

---

## Interaction Effects

**With 1.06c-ext-A — Sealed replay as tension mechanic:** The sealed mechanic's effectiveness is entirely dependent on this aspect. Sealed tension and minimum match length are two halves of the same design — one is the experience, the other is the structural prerequisite. Neither works without the other.

**With 1.06c-ext-E — AI ghost configs:** AI ghost configs filling the match pool need to be calibrated to produce matches in the 60–120 tick range. An AI ghost that produces 20-tick stomps undermines the tension system regardless of ELO tightness. Ghost config quality is measured partly by the match duration distribution it produces.

**With 2.21 — Context efficiency asymmetry:** Long matches are the primary venue where buffer-efficient architectures outperform brute-force architectures. A player who spends effort on eviction policies specifically gains advantage in 100+ tick matches that buffer-fat architectures lose. This asymmetry creates a late-game progression path and a reason to care about efficiency even after getting "good enough" architectures.

**With 4.04a — Debrief as debugger:** The debrief's match duration display and per-tick buffer analysis are essential for players learning from long matches. Tick-length patterns → diagnostic insight is only possible if the debrief shows match duration prominently and allows scrubbing across the full tick range.

**With 5.22 — Gauntlet as third act:** The Gauntlet's match-length design signals to players that the Gauntlet is different from the campaign. Campaign missions might be shorter (50–80 ticks) to allow faster iteration. Gauntlet matches are longer (80–150 ticks) because they test more of the architecture. This length differential is itself a signal: you're playing in the deep end now.

**With 7.09 — Arms race as designed meta-evolution:** Long matches favor complex architectures, which tend to be specialized. Short matches (even within the 60-tick floor) favor simple, robust architectures. If the meta stabilizes around long-match optimization, simple robust architectures become viable counter-picks — an arms race in match duration strategy. The community will discover this and it will become a documented meta-layer.

---

## New Aspects Discovered

- **2.27 — Buffer exhaustion as late-game mechanic**: Long matches (100+ ticks) create a new failure mode: eviction policy breaking down as buffers fill with stale data that can't be cleared fast enough; the "context window overflow" problem in Robot Uprising terms; how do you design architectures that gracefully manage a full buffer mid-match? What does "buffer hygiene" look like as a skill?

- **4.17 — Match duration as diagnostic indicator in debrief analytics**: First-class debrief feature showing win-rate bucketed by match duration (sub-50 / 50-90 / 90+); allows players to identify whether their losses are early-game (sub-50 ticks) or mid/late-game failures; the tactical self-coaching tool this creates; how to make this legible without turning the game into a spreadsheet

- **5.23 — Campaign match length calibration**: Campaign missions should use shorter tick ceilings than Gauntlet (50-70 tick campaign missions vs. 80-150 tick Gauntlet matches) to support rapid iteration during the learning phase; the transition to longer matches at the Gauntlet boundary as deliberate design signal; how do mission briefings communicate expected match length?

- **7.11 — Match duration as a community coordination signal**: Season meta reports that track average match length across the entire Gauntlet population; if average match length drops (stomps are increasing), this signals a dominant strategy has emerged and seasons should be reset; "match length as meta health indicator" as a designed ecosystem diagnostic tool

- **8.10 — The Gauntlet map template system**: A library of Gauntlet-approved map templates each with documented match-length distributions from playtesting; map selection for each Gauntlet season as a balance decision; how community can submit maps and what validation criteria apply (must produce ≥80% of matches in 60–150 tick range to be Gauntlet-eligible)

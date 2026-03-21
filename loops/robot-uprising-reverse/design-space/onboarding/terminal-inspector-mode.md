# Terminal in Inspector Mode: Tick-State-Aware Reference During Analytical Phase

**Aspect ID:** 5.16b
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding / UI-UX crossover
**Related aspects:** 5.16 (embedded document reference UI — Model D CRT Terminal), 5.16a (terminal content authoring pipeline), 5.16d (terminal progressive disclosure across campaign), 5.17 (hybrid tutorial architecture — Inspector-Codex bridge), 4.04a (debrief as debugger), 4.04b (two-act debrief structure), 4.16 (signal genealogy visualization), 8.09 (diagnostic layer as teaching mechanic), 5.00b (search-by-player-vocabulary), 3.07c (rules diff view in Inspector)

---

## The Problem

In Plan mode, the terminal is a static reference tool. The player searches "eviction," reads the definition, studies the micro-scenario, and applies the knowledge to their next configuration. The terminal answers "what does eviction mean?" — a context-free, timeless question.

In Inspector mode, the player's questions are never timeless. They are always grounded in a specific tick, a specific unit, a specific failure they just watched happen. The player is not asking "what does eviction mean?" They are asking "why was RELAY-C's slot 3 evicted at tick 22 instead of slot 7?" or "what would compress have done to SCOUT-A's buffer at tick 14 if I had equipped it?" The reference system that worked in Plan mode — the static CRT glossary — becomes insufficient the moment the player enters the analytical phase. A glossary cannot answer questions about a specific replay state.

**The Contextual Grounding Problem:** The terminal must serve two masters simultaneously. It must still be a glossary — "what is compress?" needs a clear answer regardless of context. But it must also be a replay-aware diagnostic companion — when the player is inspecting tick 14, the terminal should know what tick 14 looks like and ground its reference material in that state. The terminal becomes a hybrid: part encyclopedia, part contextual advisor. The design question is how to combine these without making the terminal feel like two unrelated tools stitched together.

---

## The Mechanic: Replay-Grounded Reference

### Plan Mode Terminal (Baseline Behavior)

In Plan mode, the terminal operates as designed in 5.16: a three-column CRT with a left-column entry list, a center description panel with micro-scenarios, and a right-column Related panel with cross-cutting interaction descriptions. Search indexes both game vocabulary and player vocabulary (5.00b). The terminal is a reference book. It knows nothing about any specific match.

### Inspector Mode Terminal (The Shift)

When the two-act debrief transitions from Act 1 (sealed watch) to Act 2 (Inspector), the terminal gains a new capability: **tick-state binding**. The terminal becomes aware of the current scrubber position and the inspected unit. This manifests in four concrete ways:

**1. The Tick Context Header — "Grounding Strip"**

At the top of the terminal's center column, a thin horizontal bar appears that does not exist in Plan mode. It reads:

```
TICK 22 | RELAY-C INSPECTED | BUFFER 11/12
```

This is the **Grounding Strip**. It tells the player: "The reference material below is contextualized to this moment." When the player scrubs the timeline to tick 23, the strip updates. When the player clicks a different unit, the strip updates. The strip is the visual cue that the terminal is no longer a static encyclopedia — it is reading the replay.

The Grounding Strip renders in a slightly different phosphor color than the rest of the terminal text — a warm amber against the green monochrome — to make it permanently obvious that this information is match-specific rather than general.

**2. Contextual Annotations on Reference Entries — "Tick Marginalia"**

When the player opens a reference entry (e.g., "Eviction") while inspecting a unit at a specific tick, the standard reference text renders as usual — the definition, the micro-scenario, the rules. But below the standard content, a new section appears in amber text, separated by a dashed line:

```
─── AT TICK 22, RELAY-C ───
Eviction occurred 3 times in this unit's history.
Most recent: Tick 19 — Slot 1 evicted (SCOUT-A: terrain@A3, age 7t)
             Reason: FIFO policy, slot held lowest-priority entry
Next eviction projected: Tick 24 — Slot 4 (SCOUT-B: position@C2, age 5t)
Buffer state: 11/12 slots occupied. 1 slot available.
```

This is not generated text — it is computed from the replay data at the current tick. The marginalia transforms the reference entry from "here is how eviction works in general" to "here is how eviction is working right now in the unit you are looking at." The player reads the definition, then immediately sees the definition instantiated in their own match. The gap between theory and practice collapses.

If no unit is inspected, the marginalia section shows aggregate match data instead: "Eviction occurred 47 times across all units this match. Highest eviction rate: RELAY-C (23 evictions)." Clicking any unit name in the aggregate snaps the Inspector to that unit.

**3. Replay-Grounded Queries — "The Diagnostic Prompt"**

The terminal's search input in Inspector mode accepts two categories of query:

**Category A: Standard reference queries.** "What is compress?" "How do hooks work?" These return the same result as Plan mode, plus Tick Marginalia if a unit is inspected.

**Category B: Replay-grounded queries.** These begin with implicit or explicit references to the replay state:

- `"why did RELAY-C evict at tick 19?"` — The terminal identifies the eviction event at tick 19, pulls the buffer state at tick 18 (pre-eviction) and tick 19 (post-eviction), identifies the eviction policy, and constructs a step-by-step trace: "At tick 19, RELAY-C received signal S-14 (SCOUT-A: threat@D5). Buffer was 12/12. FIFO policy selected Slot 1 (SCOUT-A: terrain@A3, age 7t) for eviction. Slot 1 was replaced with S-14."

- `"what was in SCOUT-A's buffer at tick 12?"` — The terminal renders SCOUT-A's complete buffer state at tick 12: all 6 slots, their contents, ages, and whether each was used in the tick-12 decision. Clicking any slot in this rendered view scrubs the Inspector to tick 12 and opens SCOUT-A's inspector panel.

- `"how does compress interact with eviction when buffer is full?"` — This is a hybrid query: part reference (the compress-eviction interaction from the cross-cutting matrix) and part replay-grounded. The terminal shows the standard reference answer first, then scans the replay for instances where both compress and eviction occurred on the same unit in the same tick range, displaying those instances as concrete examples below.

- `"why did STRIKER-B stop moving at tick 30?"` — The terminal identifies STRIKER-B's action at tick 30 (idle/patrol/no match), traces the decision tree, and presents the causal chain: "STRIKER-B's Rule 1 ('if threat in range, engage') did not match because no threats were present in context window. Last threat was evicted at tick 27. Threat source was RELAY-C, which stopped forwarding at tick 25 due to context overload stun."

The diagnostic prompt is not a natural language AI — it is a structured query parser that recognizes unit names, tick numbers, mechanic keywords, and causal relationship patterns. Queries that don't match a parseable pattern fall through to standard reference search. The player learns the query grammar through use: the terminal shows "Try: 'why did [UNIT] [ACTION] at tick [N]'" as placeholder text in the search field during Inspector mode.

**4. Auto-Update on Scrub — "The Living Reference"**

When the player has a reference entry open and scrubs the timeline, the Tick Marginalia updates in real time. The player reads "Eviction" with marginalia for tick 22, then presses Right Arrow three times. The marginalia smoothly updates to reflect tick 25: the eviction count increments, the projected next eviction changes, the buffer state shows 12/12 instead of 11/12. The reference entry itself (the definition, the micro-scenario) remains static — it doesn't change with scrubbing. Only the amber marginalia section responds to tick changes.

This creates a split-register reading experience: stable reference text above the dashed line, dynamic replay data below. The player's eyes learn to treat the green text as permanent knowledge and the amber text as ephemeral context. The color distinction is load-bearing.

### Where the Terminal Sits in Inspector Layout

The terminal occupies the same screen position as in Plan mode: a togglable panel that slides in from the right edge, overlaying Zone B (the unit inspector panel) when open. A keyboard shortcut (backtick/tilde, matching the "open terminal" convention from code editors) toggles it. When both the terminal and the unit inspector are needed simultaneously, the terminal renders as a narrower panel (30% width) docked to the right, compressing Zone B to 15%. The terminal can also be "pinned" to remain open while interacting with the board — pinned mode adds a thin amber border to distinguish it from the ephemeral toggle mode.

The terminal does NOT appear during Act 1 (sealed watch). It materializes alongside the other analytical tools at the seal break. This is consistent with the two-act design: Act 1 is emotional observation, Act 2 is analytical tooling. The terminal is an analytical tool.

---

## Player Journeys

### Journey 1: Dahlia, 19, Art Student — "Why Did My Scout Just Stand There?"

**Context:** Mission 4, Dahlia's second attempt. She understands the basics — units have context windows, rules evaluate slots — but her mental model is shallow. Her scout SCOUT-A stopped moving at tick 18 and stood motionless while enemies walked past. She watched this happen during the sealed watch and felt a hot pulse of frustration. Now the seal has broken. The Inspector is open.

**Minute 0:00 — The Stalled Scout**
Dahlia clicks SCOUT-A on the board. The unit inspector fills Zone B. The decision trace at tick 18 reads:

```
ACTION: IDLE (no rule matched)
├─ RULE 1: "if unknown territory ahead → move forward" [NOT MATCHED]
│  └─ CONDITION: unknown territory ahead? → ALL adjacent tiles KNOWN
└─ RULE 2: "if enemy detected → retreat to relay" [NOT MATCHED]
   └─ CONDITION: enemy detected? → NO enemy data in context window
```

No rule matched. But Dahlia doesn't understand why "unknown territory ahead" failed — she can see on the board that tile F6 hasn't been scouted. She stares at the decision trace. The phrase "ALL adjacent tiles KNOWN" confuses her. Known by whom?

**Minute 0:25 — Opening the Terminal**
Dahlia presses the backtick key. The terminal slides in from the right, overlaying the inspector. The Grounding Strip reads: `TICK 18 | SCOUT-A INSPECTED | BUFFER 4/6`. She types into the search field: "known territory."

The terminal returns the reference entry for **Observation** — the scout's sensing mechanic. The definition explains: "A tile is 'known' to a unit if an observation of that tile exists in the unit's context window. Tiles that have been observed but whose observation has been evicted are no longer 'known.'"

Below the definition, the amber Tick Marginalia reads:

```
─── AT TICK 18, SCOUT-A ───
SCOUT-A's context window contains 4 observations:
  Slot 1: tile D4 (age 12t) — STALE
  Slot 2: tile D5 (age 11t) — STALE
  Slot 3: tile E5 (age 6t)
  Slot 4: tile E6 (age 5t)
Tiles adjacent to SCOUT-A (E5): D4, D5, E4, E6, F4, F5, F6
Tiles with observations in buffer: D4, D5, E5, E6 (4 of 7)
Tiles WITHOUT observations: E4, F4, F5, F6 (3 of 7)
⚠ Rule condition "ALL adjacent tiles KNOWN" evaluated TRUE.
   Explanation: SCOUT-A's rule checks adjacency to its LAST OBSERVED
   POSITION (D5), not its current position (E5). The scout moved to E5
   at tick 16 but its observation reference was not updated.
```

**Minute 1:10 — The Realization**
Dahlia reads the warning annotation twice. Her rule checks adjacency relative to the scout's last observed position, not its current position. The scout moved two ticks ago, but the rule is still evaluating the old neighborhood. She scrolls back up to the reference definition: "Observation conditions are evaluated against the context window, not against the board state. A unit only 'knows' what its buffer contains."

The theory (green text) and the evidence (amber text) align. Dahlia now understands: her scout's buffer contained observations of the tiles around D5, and since it moved to E5, those observations technically cover the "adjacent" tiles — by the old frame of reference. The rule evaluated true because the buffer said all the old neighbors were known, even though the scout was now somewhere new with unobserved tiles nearby.

**Minute 1:45 — The Fix Idea**
Dahlia types: "how do I make scout update observations after moving?" The terminal returns the reference entry for **Refresh** — a scout skill that re-observes adjacent tiles after movement. The Tick Marginalia shows: "SCOUT-A does not have the Refresh skill equipped. If Refresh were equipped, 3 new observations (E4, F4, F5) would have been generated at tick 17 (one tick after movement to E5)."

Dahlia closes the terminal. She knows what to equip.

**UI Annotations:**
- **Terminal toggle**: backtick key, slides from right, overlays Zone B
- **Grounding Strip**: amber text header, updates with scrubber and unit selection
- **Tick Marginalia**: amber text below dashed separator, computed from replay data at current tick
- **Warning annotation (triangle icon)**: flags discrepancies between what the player likely expects and what actually happened
- **Counterfactual hint** ("If Refresh were equipped..."): only appears for skills the unit does NOT have, grounding the suggestion in the specific tick

---

### Journey 2: Tomasz, 31, QA Engineer — Hook Interaction Forensics at Tick 52

**Context:** Mission 8, deep factory campaign. Tomasz has a sophisticated relay mesh: RELAY-A compresses, RELAY-B filters, RELAY-C routes. His "overwatch" hook chain is supposed to trigger a coordinated response when any scout detects a priority target. In the match he just watched, the overwatch chain fired at tick 48 but the coordinated response never happened. The three strikers continued their patrol patterns as if the hook never reached them. Tomasz suspects a timing issue between the compress hook on RELAY-A and the route hook on RELAY-C.

**Minute 0:00 — Setting Up the Investigation**
Tomasz scrubs to tick 48. He clicks RELAY-A. The decision trace shows the compress hook fired, reducing 4 threat signals into 1 compressed summary. He clicks RELAY-C at the same tick. The route hook fired — it received the compressed signal and routed it toward the strikers on the "overwatch-go" channel. The event log shows the signal was sent. So the chain fired correctly. But the strikers didn't respond.

Tomasz opens the terminal. The Grounding Strip reads: `TICK 48 | RELAY-C INSPECTED | BUFFER 9/12`.

**Minute 0:35 — The Diagnostic Query**
Tomasz types: `"why did STRIKER-A not respond to overwatch-go at tick 49?"`

The terminal processes the query. It identifies the "overwatch-go" channel, finds the signal sent by RELAY-C at tick 48, traces its delivery path, and returns:

```
QUERY RESULT: Signal S-41 on channel "overwatch-go"

Sent by: RELAY-C at tick 48
Expected recipient: STRIKER-A (subscribed to "overwatch-go")
Delivery status: DELIVERED at tick 49

STRIKER-A buffer state at tick 49 (pre-delivery):
  6/6 slots occupied. Signal S-41 queued for insertion.
  Eviction triggered: Slot 2 (RELAY-B: patrol-waypoint@C3, age 4t) evicted.
  Signal S-41 inserted into Slot 2.

STRIKER-A decision at tick 49:
  Rule 1: "if overwatch-go signal AND threat in range → engage priority target"
  Condition: overwatch-go signal? → YES (Slot 2, S-41, age 0t)
  Condition: threat in range? → NO
  Result: NOT MATCHED — both conditions required, only one met.

⚠ The signal was delivered and present in buffer. The rule did not fire
because the compound condition required BOTH a signal AND a threat
observation in range. At tick 49, STRIKER-A had no threat data — only
the compressed summary from RELAY-A, which reports threat EXISTENCE
but not threat POSITION. Compressed signals lose coordinate data.

RELATED: Compress → "Compress reduces signal size by removing spatial
metadata. Compressed threat signals report that threats exist but not
where they are."
```

**Minute 1:30 — Cross-Referencing**
Tomasz reads the result. The problem is not timing — it is data fidelity. The compress skill on RELAY-A stripped the position data from the threat signal. By the time the compressed summary reached the striker via the overwatch chain, it said "threats exist" but not "threats are at D5." The striker's rule required both the overwatch signal AND a threat "in range" — but without coordinates, the range check failed.

He types: `"how does compress interact with threat range checks?"` The terminal shows the cross-cutting interaction entry for Compress x Range Evaluation, then the Tick Marginalia:

```
─── AT TICK 49, STRIKER-A ───
Slot 2 contains compressed signal S-41.
  Original signals (pre-compress): S-37 (threat@D5), S-38 (threat@D6),
    S-39 (threat@E5), S-40 (threat@E4)
  Compressed output: "4 threats detected, sector D-E/4-6"
  Spatial precision: SECTOR (not TILE)
  Range check granularity required by Rule 1: TILE
  → Sector-level data cannot satisfy tile-level range condition.
```

**Minute 2:15 — The Architectural Decision**
Tomasz sees the tradeoff clearly. Compress saves buffer space (4 signals become 1) but loses the spatial precision his striker rules require. He needs either: (a) change the striker's rule to accept sector-level threats, or (b) configure the relay to forward one un-compressed priority threat alongside the compressed summary. He scrubs forward to tick 52, watching the same pattern repeat — signal delivered, range check fails, striker idles. The marginalia updates with each scrub, confirming the pattern holds across ticks.

**UI Annotations:**
- **Diagnostic query result**: rendered in the terminal's center column as a structured trace, not paragraph text; signal IDs, buffer slots, and unit names are all clickable cross-references
- **Warning annotation**: identifies the root cause (compressed signals lose coordinate data) and links to the relevant cross-cutting reference entry
- **Scrub-updated marginalia**: the compress-range interaction marginalia updates as Tomasz scrubs, showing the same pattern at each tick — reinforcing that this is a systemic issue, not a one-tick anomaly

---

### Journey 3: Wei, 38, Competitive Player (Diamond Rank) — Verifying a Signal Timing Theory

**Context:** Ranked match, post-season review. Wei lost a close match and believes the loss hinged on a 1-tick signal delay at tick 71 — his relay's compress hook fired at tick 71 instead of tick 70, which meant the striker received the tactical update one tick too late and moved into an ambush. Wei has a theory: the compress hook was delayed because a filter hook on the same relay had priority and consumed the relay's single action for tick 70. He wants to verify this precisely.

**Minute 0:00 — The Precise Setup**
Wei scrubs to tick 70. Clicks RELAY-B. Opens the terminal. The Grounding Strip reads: `TICK 70 | RELAY-B INSPECTED | BUFFER 10/12`. He knows exactly what he is looking for.

**Minute 0:10 — The Theory-Testing Query**
Wei types: `"what hooks fired on RELAY-B at tick 70?"`

```
RELAY-B HOOK ACTIVITY AT TICK 70:

Hook evaluation order (by priority):
  1. FILTER "noise-gate" (priority 1) — FIRED
     Trigger: incoming signal S-88 matched noise pattern
     Action: signal S-88 discarded
     Duration: consumed RELAY-B's action for tick 70

  2. COMPRESS "tactical-summary" (priority 2) — QUEUED
     Trigger: buffer threshold met (10/12 slots)
     Action: DEFERRED to tick 71 (action already consumed by Hook 1)

  3. ROUTE "overwatch-broadcast" (priority 3) — NOT EVALUATED
     Reason: action consumed, lower priority hooks skipped

─── TICK 71 ───
  COMPRESS "tactical-summary" — FIRED
     Action: 4 signals compressed to 1 summary
     Output signal S-92 sent on "tactical-update" channel
     Delivery to STRIKER-A: tick 72
```

**Minute 0:30 — Confirming the Causal Chain**
Wei's theory is confirmed. The filter hook consumed tick 70's action, pushing compress to tick 71, which pushed delivery to tick 72. He now needs to know: was the filtered signal (S-88) actually noise, or did the filter discard something valuable?

He types: `"what was signal S-88?"`

```
SIGNAL S-88:
  Source: SCOUT-C at tick 69
  Channel: "recon-net"
  Content: position update (SCOUT-C at tile G2)
  Classification by FILTER "noise-gate": NOISE
    Reason: position updates from allied scouts matched
    the "routine-movement" pattern in noise-gate's filter table

  Was this correctly classified?
  SCOUT-C's position at tick 69: G2
  SCOUT-C's position at tick 68: G2
  → Stationary position update. No new information.
  → Classification: CORRECT (signal contained no novel data)
```

**Minute 1:00 — Evaluating the Tradeoff**
The filter was correct — S-88 was genuinely redundant. But the act of filtering it consumed the action that would have gone to compress. Wei now faces a design decision: should filter have lower priority than compress? He types: `"if compress had priority 1 and filter had priority 2, what would have happened at tick 70?"`

The terminal recognizes this as a counterfactual query. In competitive mode, counterfactual is available:

```
COUNTERFACTUAL: Swap hook priorities on RELAY-B

TICK 70 (counterfactual):
  1. COMPRESS "tactical-summary" (priority 1) — WOULD FIRE
     Output: S-92 sent at tick 70 (1 tick earlier than actual)
     Delivery to STRIKER-A: tick 71 (1 tick earlier)

  2. FILTER "noise-gate" (priority 2) — WOULD QUEUE
     Deferred to tick 71

TICK 71 (counterfactual):
  FILTER "noise-gate" — WOULD FIRE
     Signal S-88 discarded (same outcome, 1 tick later)

NET EFFECT: STRIKER-A receives tactical update at tick 71 instead of 72.
  STRIKER-A's actual action at tick 71: move → F5 (patrol)
  STRIKER-A's counterfactual action at tick 71: move → E4 (engage threat)
  → STRIKER-A would have engaged the enemy 1 tick earlier,
    avoiding the ambush at F5 on tick 72.
```

**Minute 1:45 — The Confirmation**
Wei leans back. One tick. The entire match outcome hinged on hook priority ordering on a single relay. The filter was doing its job correctly, but its priority was wrong for the game state — compress needed to fire first when buffer was near-full and tactical data was pending. He notes the fix: swap priorities conditionally, or add a rule that elevates compress priority when buffer exceeds 80%.

Wei closes the terminal and queues the configuration change.

**UI Annotations:**
- **Hook evaluation order display**: numbered list with priority, status (FIRED/QUEUED/NOT EVALUATED), and reason
- **Counterfactual result**: rendered with a subtle dashed border and a `COUNTERFACTUAL` header badge, visually distinct from actual replay data
- **Net effect summary**: the final line of the counterfactual, highlighted in gold, showing the outcome-changing moment
- **Signal detail view**: clicking any signal ID anywhere in the terminal opens the full signal trace inline

---

## Strengths and Weaknesses

### Strengths

**Collapses the theory-practice gap.** The single most powerful feature is Tick Marginalia — the ability to read a reference definition and immediately see it instantiated in your own match. Every other reference system in gaming (Civilopedia, Stellaris codex, in-game glossaries) provides theory without practice. The player must build the bridge between "eviction removes the lowest-priority entry" and "that is why RELAY-C lost the threat data at tick 22" entirely in their own head. Tick Marginalia builds that bridge for them.

**Supports all expertise levels simultaneously.** Dahlia's query ("known territory") and Wei's query ("what hooks fired on RELAY-B at tick 70?") both work. The terminal does not force a skill level — it responds at the level of the question. Simple queries return reference + marginalia. Complex queries return structured diagnostic traces. The terminal grows with the player.

**Creates discoverable learning moments.** The warning annotations (triangle icons flagging discrepancies) surface things the player did not ask about. Dahlia did not ask "why does my rule check the old position?" — the terminal volunteered that information because the discrepancy between rule evaluation and board state was detectable. These proactive annotations teach without lecturing.

**Reinforces the debugger mental model.** The terminal's replay-grounded queries parallel the experience of using a debugger's watch window or a REPL's inspect command. Players who later encounter professional debugging tools will find the mental model familiar. Players who already know debugging will find the terminal immediately intuitive.

### Weaknesses

**Query grammar has a learning curve.** The diagnostic prompt is not true natural language — it is a structured parser. Players must learn which query forms work ("why did X at tick N") and which don't ("my scout is broken"). Failed queries that fall through to standard search may confuse players who expected a diagnostic answer. Mitigation: placeholder text shows example queries, and failed diagnostic parses show a "Did you mean to ask about a specific tick?" prompt.

**Marginalia can be overwhelming.** For a relay with 12 context window slots and 80 ticks of history, the marginalia for "Eviction" could be dense. A wall of amber text beneath a clean reference definition breaks the reading flow. Mitigation: marginalia defaults to a collapsed "summary" mode (one line: "3 evictions on this unit, most recent tick 19") with a "Show details" toggle.

**Counterfactual queries blur reference and simulation.** When the terminal answers "if compress had priority 1, what would have happened?", it is no longer a reference tool — it is a simulation tool. This blurs the boundary between the terminal (reference) and the counterfactual mode (analysis). Players may begin treating the terminal as the primary counterfactual interface, which overloads its purpose. Mitigation: counterfactual queries are only available in modes where the full counterfactual simulation (fork-and-re-run) is also available, and the terminal's counterfactual results include a "Open in Counterfactual Mode →" link that redirects to the dedicated tool.

**Performance cost of real-time marginalia updates.** Scrubbing through ticks while the terminal recomputes marginalia for every tick could introduce frame drops, especially for complex entries with per-slot calculations across 12-slot relays. Mitigation: marginalia updates are debounced (200ms delay after scrub stops) rather than truly real-time, with a brief amber "..." loading indicator during recomputation.

---

## Interaction Effects

### Terminal x Decision Trace

The decision trace (Zone B, sub-section 3) and the terminal's diagnostic queries overlap significantly. Both answer "why did this unit do X at tick N." The distinction: the decision trace is a structured tree visualization embedded in the Inspector panel. The terminal is a searchable, queryable text interface. The decision trace shows one unit, one tick, one decision. The terminal can show cross-unit, cross-tick chains. They are complementary: the decision trace is the first-pass "what happened," and the terminal is the second-pass "why did the chain of events lead here."

The critical interaction: clicking a mechanic keyword in the decision trace (e.g., clicking "EVICTION" in a trace line) should open the terminal to that entry with Tick Marginalia pre-populated for the current unit and tick. This turns the decision trace into a navigation surface for the terminal — the trace identifies the concept, the terminal explains it in context.

### Terminal x Signal Genealogy

Signal genealogy (4.16) visualizes the path of a signal through the relay mesh as a directed graph. The terminal's diagnostic queries describe the same information in text form. The interaction: clicking a node in the signal genealogy graph should populate the terminal's Grounding Strip with that node's unit and tick, so marginalia immediately reflects that point in the signal's journey. Conversely, signal IDs mentioned in terminal output (e.g., "S-41 on channel overwatch-go") should be clickable and highlight the corresponding node in the genealogy graph if it is visible.

This creates a dual-representation pattern: the genealogy is the spatial visualization and the terminal is the textual explanation. Players who think visually use the genealogy and occasionally consult the terminal for details. Players who think verbally use the terminal and occasionally glance at the genealogy for spatial context.

### Terminal x Two-Act Debrief

The terminal is strictly an Act 2 tool. It does not exist during the sealed watch. This means the player's first encounter with Tick Marginalia is always at the seal break — the same moment the scrubber, signal genealogy, and expanded diagnostic ring appear. The terminal materializes alongside these tools as part of the analytical toolkit.

The two-act interaction creates an emotional contrast: during Act 1, the player watches their scout stop moving and has no way to understand why. The frustration builds. At the seal break, the terminal becomes available. The relief of opening the terminal and immediately getting a grounded explanation ("your rule checks the old position because...") is amplified by the preceding period of enforced ignorance. The two-act structure makes the terminal feel like a reward.

### Terminal x Autonomy Dial

The autonomy dial (the player's control over how much their agents act independently vs. follow explicit rules) affects the terminal's marginalia content. At high autonomy, agent decisions involve more implicit behavior — actions not directly traceable to a player-written rule. The terminal's diagnostic queries for high-autonomy agents must explain autonomous behavior: "STRIKER-A engaged because its AUTONOMOUS THREAT RESPONSE activated (not a player rule)." At low autonomy, all decisions trace to player rules. The terminal should adapt its explanation depth to the autonomy level — high autonomy requires more "here is what the agent decided on its own and why" explanation.

### Terminal x Blueprint Codex (Static Reference)

The Blueprint Codex (5.17) is the out-of-game, persistent reference — the full encyclopedia of mechanics, available from the main menu, not bound to any match. The terminal is the in-game, match-bound reference. The interaction risk: if both exist, which does the player consult? The answer must be clear from context. The Codex is for studying between matches ("I want to understand hooks before my next attempt"). The terminal is for investigating during a debrief ("why did this hook behave this way in this match"). The Codex has no Tick Marginalia — it cannot, because it has no replay context. The terminal has no "study mode" — it is always grounded in a match.

The bridge between them: the terminal should link to Codex entries ("Read more in the Blueprint Codex →") for players who want to go deeper than the terminal's in-match context provides. The Codex should link to the terminal ("Investigate this in your most recent match →") when the player has a recent replay available. The two reference systems orbit each other without collapsing into one.

---

## Comparable Games and Systems

### Civilization's Civilopedia with Game-State Links

The Civilopedia is the gold standard for in-game reference, but it is entirely static. Looking up "Horseman" tells you the unit's stats, historical background, and upgrade path — but not "your horseman on tile 14,8 would have beaten that spearman if you had the Flanking promotion." Robot Uprising's terminal takes the Civilopedia model and adds the match-awareness layer that Civilization lacks. The Civilopedia answers "what is X?" The terminal answers "what is X, and here is X happening in your game right now."

### Stellaris Situation Log

Stellaris's situation log contextualizes galactic events with links to the relevant systems, fleets, and planets. Clicking a situation entry zooms to the location and highlights the relevant objects. This is the closest analog to the terminal's Grounding Strip — the situation log is always "about" a specific game state, not abstract. The terminal extends this pattern by making the reference itself state-aware, not just the navigation.

### IDE Debugger Watch Windows

The most direct analog. A watch window in Visual Studio or Chrome DevTools lets you pin expressions and see their values update as you step through code. The terminal's Tick Marginalia is functionally a watch window: it shows the values of game concepts (eviction count, buffer state, hook evaluation order) at the current "breakpoint" (scrubber tick) and updates as you step. The pin feature (pinning a slot's state for cross-tick comparison) directly mirrors the debugger watch pin. Players with debugging experience will recognize this immediately.

### Jupyter Notebooks

Jupyter notebooks interleave explanation (markdown cells) with live computation (code cells). The terminal's structure — static reference text (green) above dynamic computed marginalia (amber) — mirrors this pattern. The reference entry is the markdown cell; the marginalia is the code output cell. The notebook parallel suggests a future extension: letting players write their own diagnostic queries as "cells" that persist across scrubbing, building a personal notebook of match investigation.

### Paradox Interactive Event Inspector (Europa Universalis IV Debug Mode)

EU4's debug console allows players to inspect the precise conditions that caused an event to fire — which flags were set, which nation scopes matched, what random number was rolled. This is functionally identical to the terminal's "why did hook X fire at tick N?" query. The difference: EU4's debug console is a hidden developer tool, not a player-facing feature. Robot Uprising promotes this diagnostic capability to a first-class, designed experience with visual polish and progressive disclosure.

---

## Sensory Description: What the Tick-Aware Terminal Looks, Sounds, and Feels Like

### Visual Register

The terminal renders on the CRT aesthetic established in 5.16: green phosphor text on a near-black background (#0A0F0A), subtle scan-line overlay (1px horizontal lines at 3px intervals, 8% opacity), and a faint screen curvature vignette at the corners. The text is monospace (a custom pixel font at 14px, with ligatures disabled for maximum readability of signal IDs like "S-41").

The Grounding Strip breaks the green monochrome. It renders in warm amber (#D4A057) — the same amber used for eviction warnings in the context window view, creating a visual link between "things that are about your current state" across different panels. The amber text has a faint pulsing glow (2% brightness oscillation on a 4-second cycle), barely perceptible but enough to make the marginalia feel alive — data that is breathing, not static.

When the player scrubs the timeline while the terminal is open, the Grounding Strip text flickers — a rapid 50ms blink as the tick number updates, mimicking an old CRT refreshing its display. The marginalia section below the dashed line performs a subtle vertical scroll-rewrite animation: the old text scrolls up and off-screen (150ms) while new text scrolls up from below (150ms), as if the terminal is re-computing and re-printing. This animation is functional: it signals "the data changed" without requiring the player to re-read and mentally diff the old and new marginalia.

When no unit is inspected, the Grounding Strip reads `TICK 22 | NO UNIT SELECTED | MATCH OVERVIEW` and the terminal's ambient state is dimmer — the scan-lines are slightly more prominent, the phosphor slightly less bright. Inspecting a unit "wakes up" the terminal: a 200ms brightness increase as the amber marginalia section populates. This subtle luminance shift gives the terminal a sense of responsiveness — it is paying attention to what you are doing.

### Sound Design

The terminal is mostly silent — it is a reading surface, not an active system. But three micro-sounds mark key interactions:

**Terminal toggle**: a soft mechanical click, like a CRT monitor being switched on — a brief electrical hum that decays in 300ms. Not the startup of a fresh system; the resumption of one that was merely sleeping. When the terminal closes, the same hum plays in reverse (a descending decay).

**Query submission**: the player presses Enter on a diagnostic query. A rapid-fire keystroke burst plays — the sound of the terminal "typing" its response, like a dot-matrix printer producing a line of output. The burst lasts 400ms, timed to the appearance of the first line of the result. This sound is functional: it signals "processing" during the brief moment between query submission and result display.

**Warning annotation appearance**: when the terminal surfaces a proactive discrepancy warning (the triangle icon), a single low-frequency tone plays — a muted alert, not an alarm. The tone is closer to a submarine sonar ping than a notification chime: information has been detected, not demanded. The player learns to associate this tone with "the terminal found something you didn't ask about."

### Tactile Feel

The terminal should feel like a trusted instrument — precise, responsive, and slightly cool. The interaction model is keyboard-heavy: backtick to toggle, typing to query, Enter to submit, Escape to clear. Mouse interaction is minimal (clicking cross-references, toggling marginalia detail). This keyboard-centricity reinforces the "developer tools" feel — the terminal is not a GUI panel to be clicked through, it is a command-line interface to be typed into. The response to every input is immediate (sub-100ms for reference queries, 200ms debounce for marginalia updates during scrubbing). Latency would break the illusion of a live, responsive system.

The scroll behavior in the terminal is pixel-smooth but stops exactly at content boundaries — no overscroll bounce, no elastic deceleration. The terminal renders information; it does not perform for the user. This austerity is part of its character: the CRT does not animate for pleasure. It computes for utility.

### Visual Connection to Replay State

The amber Grounding Strip is the primary visual tether between the terminal and the replay. But a secondary connection exists: when the terminal mentions a unit name (e.g., "RELAY-C" in the marginalia), that unit's tile on the board (visible behind the terminal if the terminal is in narrow pinned mode) receives a subtle amber outline — a 1px glow that persists while the unit name is visible in the terminal. This connects the textual reference to the spatial board without requiring the player to close the terminal and hunt for the unit. The board and the terminal are always in conversation.

When the terminal displays a counterfactual result (dashed border, COUNTERFACTUAL badge), the board does NOT update to show the counterfactual state. The board always shows actual replay data. The counterfactual exists only in text, in the terminal. This separation is deliberate: the board is truth, the terminal is analysis. Mixing counterfactual state into the board would undermine the player's trust in what the board shows.

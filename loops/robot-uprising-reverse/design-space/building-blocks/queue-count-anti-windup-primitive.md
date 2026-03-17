# 3.19a-i-a — The `queue_count` Condition as Anti-Windup Primitive

## Overview

The `queue_count(type)` condition is the single most important primitive for preventing integral wind-up in Robot Uprising's production control system. Parent analysis (3.19a-i) established that players independently invent anti-windup when their bang-bang thermostat overproduces in Mission 7. But the *semantics* of what `queue_count` actually returns — what it counts, when it updates, how it interacts with production states — determine whether anti-windup is a trivial checkbox or a genuine design puzzle.

This analysis maps six possible semantic models for `queue_count`, explores how each transforms the control theory teaching curve, and identifies which model produces the richest gameplay while remaining comprehensible to a 14-year-old who's never written a line of code.

---

## The Core Question: What Does `queue_count` Return?

The Command unit rule `IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)` depends entirely on what "queue_count" means. Every word in the condition is a design decision.

### Semantic Model A: "The Receipt Counter" — Pending Orders Only

**What it counts:** The number of production orders for a given blueprint type that are currently in the factory queue and have NOT yet begun building. Once the factory starts constructing a unit, that unit is no longer "queued" — it's "building."

**Formal definition:** `queue_count(type) = |{order ∈ factory_queue : order.type == type AND order.status == WAITING}|`

**The timeline:**
```
Tick 0:  Command orders SCOUT-ALPHA         queue_count(scout) = 1
Tick 1:  Factory begins building SCOUT-ALPHA  queue_count(scout) = 0  ← drops immediately
Tick 2:  Still building...                    queue_count(scout) = 0
Tick 3:  Still building...                    queue_count(scout) = 0
Tick 4:  SCOUT-ALPHA deploys                  queue_count(scout) = 0, unit_count(scout) = 2
```

**Why it's interesting:** Under this model, `queue_count(scout) < 1` becomes TRUE again at tick 1 — the moment the factory starts building. If the Command unit re-evaluates at tick 1, it sees `unit_count(scout) < 2 AND queue_count(scout) < 1` and orders ANOTHER scout. The Receipt Counter model makes anti-windup *incomplete* — the player discovers that checking "orders pending" isn't enough because building-in-progress units are invisible to the condition.

**The teaching arc:** The player must learn to also account for in-progress units. They either need `queue_count(scout) + building_count(scout) < 1` (if `building_count` exists as a separate condition) or must restructure their rule stack to include a "factory busy" check. This adds a second failure mode beyond simple oscillation — the player solves wind-up but discovers a new gap in their sensor model.

**Complexity:** Medium. Requires understanding the distinction between queued and building — a distinction that maps directly to the difference between "pending" and "in-progress" in any job queue system (Kubernetes pod states, CI pipeline stages).

**Sensory:** The conveyor belt shows queued units with a golden border (waiting) and the currently-building unit with a pulsing blue glow (in progress). The distinction is visually clear on the belt but NOT in the queue_count condition — creating the intentional gap that the player must close.

---

### Semantic Model B: "The Total Pipeline" — Queued + Building

**What it counts:** All production orders for a given type that haven't yet resulted in a deployed unit. Both waiting-in-queue and currently-building units are counted.

**Formal definition:** `queue_count(type) = |{order ∈ factory_pipeline : order.type == type AND order.status ∈ {WAITING, BUILDING}}|`

**The timeline:**
```
Tick 0:  Command orders SCOUT-ALPHA         queue_count(scout) = 1
Tick 1:  Factory begins building SCOUT-ALPHA  queue_count(scout) = 1  ← still counts
Tick 2:  Still building...                    queue_count(scout) = 1
Tick 3:  Still building...                    queue_count(scout) = 1
Tick 4:  SCOUT-ALPHA deploys                  queue_count(scout) = 0  ← drops on deploy
```

**Why it's the "obvious" choice:** This model makes anti-windup trivial. `queue_count(scout) < 1` stays FALSE from tick 0 to tick 4. No gap. No additional primitive needed. The player writes the condition, it works exactly as expected, and oscillation is fully prevented. One condition, one fix, one concept.

**The teaching concern:** If anti-windup is trivially achieved with one condition, the player never encounters the "sensor gap" problem that makes Model A pedagogically rich. The control theory ladder jumps from Level 2 (oscillation) directly to Level 3 (proportional response) without the intermediate "my sensor doesn't see everything" lesson.

**Complexity:** Low. The most intuitive interpretation — "how many scouts are on the way?" = 1. This is what a 14-year-old first-timer expects.

**Sensory:** Same conveyor belt as Model A, but the queue_count tooltip shows "Pipeline: 1 (building)" or "Pipeline: 2 (1 building, 1 waiting)" — making the total pipeline count visible. No gap between visual and semantic.

---

### Semantic Model C: "The Visibility Window" — What the Command Unit Can Observe

**What it counts:** Only production orders that the Command unit has *information about* in its context window. If the queue notification arrived 3 ticks ago and was evicted from the Command unit's buffer, the Command unit has "forgotten" about the pending order.

**Formal definition:** `queue_count(type) = |{entry ∈ command.buffer : entry.type == PRODUCTION_STATUS AND entry.unit_type == type}|`

**The timeline:**
```
Tick 0:  Command orders SCOUT-ALPHA. Buffer receives "SCOUT-ALPHA queued" notification.
         queue_count(scout) = 1
Tick 4:  Buffer full of new battlefield data. "SCOUT-ALPHA queued" evicted by priority.
         queue_count(scout) = 0  ← forgot about its own order
Tick 5:  Command re-evaluates: unit_count(scout) < 2 AND queue_count(scout) < 1 → TRUE
         Command orders ANOTHER SCOUT-ALPHA.  Oscillation returns.
```

**Why it's radical:** This model makes anti-windup *buffer-dependent*. A Command unit with buffer 14 (large working memory) can hold the production notification longer, making anti-windup effective. A Command unit with buffer 6 (small memory) forgets its own orders, causing oscillation even with the queue_count check. The quality of the control system depends on the agent's memory capacity.

**The teaching arc:** This creates a direct link between context config (Wave 3) and production control (Wave 5). The player must configure the Command unit's eviction priority to KEEP production status notifications (high priority) and evict battlefield observations (lower priority). The player is designing the Command unit's working memory to prioritize self-awareness over world-awareness — a resource allocation decision that maps to real AI system design.

**Complexity:** Very high. Requires understanding buffer eviction, priority configuration, and how memory loss affects decision quality. This is a Wave 3-5 crossover mechanic that demands fluency in both building blocks and core mechanics simultaneously.

**Risk:** Players who haven't internalized context config will hit a wall — they'll add queue_count, it'll work for 4 ticks, then mysteriously fail. The failure mode ("I forgot my own order") is elegant but potentially too opaque for a Mission 7 introduction.

**Sensory:** When the production notification evicts from the Command unit's buffer, a faint amber ghost of the conveyor belt icon briefly appears above the Command unit's tile and dissolves — the memory fading. In Inspector, the evicted entry shows a red strikethrough: `SCOUT-ALPHA queued [EVICTED: T4, reason: low priority]`. The visual makes the forgetting explicit.

---

### Semantic Model D: "The Delayed Update" — Information Arrives via Factory Signal

**What it counts:** Production status information that arrives from the factory via a hook signal, with the standard 1-tick-per-hop signal latency. The Command unit's queue_count is only as current as the latest factory status it has received.

**Formal definition:** `queue_count(type) = latest factory_status_signal.counts[type] received by this command unit`

**The timeline:**
```
Tick 0:  Command orders SCOUT-ALPHA.
Tick 1:  Factory updates its status. Factory sends status signal on "production" channel.
Tick 2:  Signal arrives at Command (1 hop, 1 tick latency).
         queue_count(scout) = 1 NOW  ← 2-tick delay from order to awareness
Tick 5:  Factory finishes building. Sends updated status.
Tick 6:  Signal arrives at Command. queue_count(scout) = 0.
```

**Why it's elegant for advanced play:** This model subjects production awareness to the same signal latency that governs everything else in Robot Uprising. The Command unit doesn't magically know the queue state — it learns via the information architecture. If the relay between Command and factory is destroyed, the Command unit loses production awareness entirely. The thermostat goes blind.

**The teaching arc:** This deeply integrates production control with the core channel/hook system. The player must ensure the Command unit has a reliable signal path TO the factory (for orders) and FROM the factory (for status). Production control becomes a two-way communication design problem, not just a one-way ordering mechanism.

**Complexity:** Very high. Requires understanding hooks, channels, signal latency, relay routing, AND production semantics simultaneously. Too much for Mission 7. More appropriate as a late-campaign advanced variant (Mission 9-10) or Gauntlet-only mechanic.

**Risk:** Destroying the status signal path creates "ghost queue" scenarios — the Command unit's last-known queue_count is stale. It thinks there are 3 scouts queued when the factory finished building them 10 ticks ago. Stale intelligence causing bad decisions is a core Robot Uprising theme, but applying it to the player's OWN production system is potentially frustrating rather than illuminating.

**Sensory:** The factory status signal is a distinctive teal-colored pulse that travels along the channel path from factory to Command. When it arrives, the Command unit's production status display updates with a brief flash. If the signal path breaks (relay destroyed), the Command unit's status display shows a stale timestamp: `Last update: T14 (⚠ 8 ticks ago)` in increasingly red text.

---

### Semantic Model E: "System-Level Oracle" — Instant, Perfect Knowledge

**What it counts:** The actual current state of the factory queue, accessed as a system-level query rather than through the information architecture. Zero delay, zero buffer cost, always accurate.

**Formal definition:** `queue_count(type) = SYSTEM.factory.queue.count_by_type(type)` — a privileged system call.

**The timeline:**
```
Tick 0:  Command orders SCOUT-ALPHA         queue_count(scout) = 1 (instant)
Tick 1:  Factory begins building             queue_count(scout) = 0 or 1 (depends on building)
Tick 4:  SCOUT-ALPHA deploys                 queue_count(scout) = 0 (instant)
```

**Why it's the simplest and potentially the best:** The parent analysis (3.19a-i) already establishes that `unit_count(type)` is a system-level query — it reads the actual battlefield state, not information in the Command unit's buffer. If `unit_count` is oracle-level, there's a strong consistency argument for `queue_count` to be oracle-level too. Mixing system-level conditions (unit_count) with buffer-dependent conditions (queue_count under Model C) creates confusion about which conditions are "reliable" and which are "falliable."

**The teaching concern:** If queue_count is always perfect, the player never learns that information freshness affects production quality. The system-level oracle removes the most interesting failure mode — but it also removes the most frustrating one.

**Complexity:** Very low. The condition does exactly what it says, always. No information architecture dependency, no latency, no buffer management, no eviction risk.

**Sensory:** The queue_count value in the rule editor updates in real-time on the Plan screen preview. No delay indicator, no staleness warning. Just the number.

---

### Semantic Model F: "The Split Model" — System-Level for Simple, Buffer-Dependent for Complex

**What it does:** Simple production conditions (`queue_count`, `unit_count`, `resources`) are system-level oracles. Complex conditions (`unit_destroyed_within`, `signal_received_from`, `enemy_count_near`) are buffer-dependent — they require actual data in the Command unit's context window.

**Formal definition:**
- Oracle tier: `queue_count`, `unit_count`, `resources`, `tick_number` → instant, free, perfect
- Sensor tier: `destroyed_within`, `enemy_near`, `signal_age`, `channel_traffic` → buffer-dependent, evictable, subject to latency

**Why it's the recommended model (aligning with parent 3.19a-i):** The parent analysis already implicitly assumes this split. It says: "production rules should be simple conditions (unit_count, queue_count, resources) that don't consume buffer slots, but complex conditions (destroyed_within) should consume a buffer slot." Model F makes this implicit assumption explicit.

**The teaching arc:** This creates a clean two-tier vocabulary that maps directly to real system design:
- **Oracle conditions** = OS-level metrics (CPU count, memory total, disk free) — always available, always fresh
- **Sensor conditions** = application-level data (request count, error rate, latency P99) — requires monitoring infrastructure, subject to delay and loss

The player learns: simple facts about YOUR OWN system are always available. Complex facts about THE WORLD require sensors. This distinction is fundamental in observability engineering. Grafana dashboards show both system metrics (instant) and application traces (delayed) — the player internalizes this architecture without a lecture.

**The gameplay implication:** Anti-windup with `queue_count` (oracle) is trivially achievable. But the INTERESTING production rules — the ones that create derivative sensing (Level 4) and proportional response (Level 3) — require sensor conditions. The control theory ladder naturally graduates from oracle-supported (Levels 1-2, simple, reliable) to sensor-dependent (Levels 3-5, complex, fallible). The teaching curve emerges from the condition tier, not from artificial complexity in the simple conditions.

**Complexity:** Low for basic use (oracle conditions just work), scales to high for advanced use (sensor conditions require buffer management). The difficulty curve is embedded in the condition vocabulary, not in the individual condition semantics.

---

## Recommended Model: F — "The Split Model"

**Rationale:**
1. **Consistency with parent analysis.** The 3.19a-i thermostat document already assumes oracle-level `unit_count` and `queue_count`. Breaking this assumption would require rewriting the entire control theory teaching sequence.
2. **Mission 7 accessibility.** Anti-windup must be achievable by a first-time strategy player who just discovered the autocomplete. Model F makes the Mission 7 fix trivial: add `queue_count(scout) < 1`, done. The player feels clever without fighting the condition system.
3. **Depth still exists — in the RIGHT conditions.** The buffer-dependent sensor conditions (`destroyed_within`, `enemy_near`) provide the complexity escalation in Missions 8-10. The difficulty curve lives where it should: in the player's growing ambition, not in the simple primitives' surprising behavior.
4. **Queue_count includes building units.** Combining Model F with Model B's "total pipeline" semantics: `queue_count` returns the total number of queued + building units. This prevents the gap in Model A (where building units are invisible) while keeping the condition simple.

**The split, formally:**

| Condition | Tier | Buffer Cost | Update | Introduced |
|-----------|------|-------------|--------|-----------|
| `unit_count(type)` | Oracle | 0 | Instant | M6 |
| `queue_count(type)` | Oracle | 0 | Instant | M7 (discoverable via autocomplete) |
| `resources` | Oracle | 0 | Instant | M5 |
| `building_type` | Oracle | 0 | Instant | M7 |
| `tick_number` | Oracle | 0 | Instant | M5 |
| `unit_destroyed_within(type, N)` | Sensor | 1 slot | Buffer-dependent | M8 |
| `enemy_count_near(unit, range)` | Sensor | 1 slot per reading | Buffer-dependent | M6 |
| `signal_received_on(channel, N)` | Sensor | 1 slot | Buffer-dependent | M4 |
| `channel_traffic(channel)` | Sensor | 1 slot | Buffer-dependent | M8 |

**The Autocomplete UX:**

When the player types in the condition editor, the autocomplete groups conditions by tier:

```
┌─────────────────────────────────────────┐
│  System Status (always accurate)         │
│    queue_count(type)  — pending orders   │
│    unit_count(type)   — deployed units   │
│    resources          — current minerals │
│    building_type      — factory status   │
│                                          │
│  Sensor Data (requires buffer space)     │
│    unit_destroyed_within(type, ticks)    │
│    enemy_count_near(unit, range)         │
│    signal_received_on(channel, ticks)    │
│    channel_traffic(channel)              │
├─────────────────────────────────────────┤
│  ⓘ System status is always current.     │
│    Sensor data uses 1 context slot and   │
│    may be evicted.                       │
└─────────────────────────────────────────┘
```

The two-tier grouping teaches the distinction through spatial layout — system conditions are "above the line," sensor conditions are "below the line." The footer note is subtle, non-blocking text — not a tutorial popup. The player notices it when they're ready.

**Sensory:** In Inspector, oracle conditions show with a ⚡ icon (instant, reliable). Sensor conditions show with a 📡 icon (received from data, may be stale). The icons are tiny — 8×8 pixels in the decision trace — but once the player notices them, the tier system becomes self-documenting. When a sensor condition evaluates using stale data, the 📡 icon shows an amber tint and the data age appears: `📡 destroyed_within(scout, 5) = 2 [data age: 3 ticks]`.

---

## The `queue_count` Semantics — Detailed Specification

With Model F + Model B as the recommended combination, here's the full spec:

### What It Returns
`queue_count(type)` returns the integer count of units of the specified blueprint type that are either:
1. **Waiting** in the production queue (not yet started building), OR
2. **Currently building** in the factory (started but not yet deployed)

It does NOT count:
- Units already deployed on the battlefield (that's `unit_count`)
- Destroyed units (that's `unit_destroyed_within`)
- Canceled orders (removed from count immediately on cancellation)

### Who Can Query It
Any unit with rules can use `queue_count` as a condition — not just Command units. A Scout with rules could check `queue_count(scout) > 0` to adjust its behavior when it knows a replacement is coming. However, only Command units can actually ORDER production (via `reassign` skill). Non-Command units can observe the queue but not modify it.

### Update Timing
`queue_count` updates at the following moments within a tick's resolution:
1. **Order placed:** +1 immediately when any unit queues a blueprint
2. **Building starts:** No change (building units still count)
3. **Building completes (deploy):** −1 when the unit appears on the battlefield
4. **Order canceled:** −1 immediately when `cancel_queue` executes

Because all rule evaluations happen simultaneously within a tick, two Command units evaluating `queue_count` on the same tick will see the same value — the value AT THE START of the tick, before any actions this tick. Actions taken this tick (new orders, cancellations) are reflected NEXT tick. This prevents race conditions between two Command units competing to order production.

### Special Cases
- `queue_count(command)` returns 0 if no Command blueprints are queued. Players can monitor their own type's production pipeline.
- `queue_count(ANY)` returns the total number of all units in the pipeline, regardless of type. Useful for a general "factory busy" check.
- If the factory is destroyed (a scenario in Missions 9-10), `queue_count` returns -1 (error state), which evaluates as FALSE against any `< N` comparison. The factory destruction is catastrophic enough that the queue_count behavior is academic — but the -1 error state prevents ghost orders from a destroyed factory.

---

## Anti-Windup: From Trivial to Puzzle

With the recommended model, the anti-windup teaching sequence becomes:

### Mission 7: Trivial Anti-Windup (Level 2)

The player adds `queue_count(scout) < 1` to their thermostat rule. It works. End of lesson.

But wait — the player might write `queue_count(scout) < 1` and it prevents ordering when ONE scout is in the pipeline. What about replacing TWO simultaneously lost scouts? The condition blocks after the first order. The second replacement waits until the first deploys (reducing queue_count back to 0), adding 4+ ticks of delay.

**The player's options:**
1. `queue_count(scout) < 2` — allow up to 2 in the pipeline. Prevents the 9-order oscillation from the parent analysis while permitting parallel replacement. But this risks mild overshoot (2 replacements when only 1 was needed).
2. Two rules with different thresholds:
   ```
   Rule 3: IF unit_count(scout) == 0 AND queue_count(scout) < 2 THEN queue × 2
   Rule 5: IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue × 1
   ```
   Rule 3 handles emergency (total loss → fast replacement, allow 2 in pipeline). Rule 5 handles attrition (one loss → conservative replacement, only 1 in pipeline). This is already proportional control with anti-windup — Levels 2 and 3 combined.

**The key insight:** The `queue_count` threshold IS the anti-windup gain parameter. `< 1` = very conservative (slow recovery, zero waste). `< 3` = aggressive (fast recovery, overshoot risk). The player tunes this number across retries, each time adjusting the tradeoff between response speed and resource efficiency. They're tuning a PID gain without knowing the terminology.

### Mission 8+: Anti-Windup Meets Sensor Conditions

When the player adds `unit_destroyed_within(scout, 5) >= 2` as a derivative condition (Level 4), the sensor tier enters the picture. The destroyed_within condition uses a buffer slot. If the Command unit's buffer is full of production status and spatial observations, the temporal window data might get evicted — and the derivative condition evaluates against incomplete data.

**The designed tension:** Oracle conditions (queue_count, unit_count) are free and reliable — the "solid ground" of the control system. Sensor conditions (destroyed_within) are costly and fallible — the "soft ground." The player's Level 5 PID-equivalent rule stack has a reliability gradient: the lower rules (emergency P-term, anti-windup) use oracle conditions and always work. The upper rules (derivative D-term) use sensor conditions and can fail under buffer pressure. The control system degrades gracefully from PID to bang-bang-with-anti-windup when the Command unit's memory is stressed.

This graceful degradation is not a bug — it's a teaching moment. Real control systems have exactly this property: the basic safety loop (emergency shutdown) runs on hardwired sensors, while the optimization loop (fine-tuning) runs on software that can crash. The player discovers that their thermostat's reliability depends on WHICH conditions it uses, and that simpler conditions are more robust.

---

## Player Journeys

### Journey: Tomás, 16, High School Student, Mission 7, Third Attempt

**Context:** Tomás has beaten Mission 7 once already (with the queue_count fix from the parent analysis). But he's replaying for a better score — his resource efficiency was 67%, and he's seen screenshots on the game's subreddit of players hitting 90%+. His current thermostat overproduces slightly: when two scouts die simultaneously, his `queue_count(scout) < 1` rule orders them one at a time with a 4-tick gap between each order. He wants faster recovery.

**Minute 0:00 — The Threshold Experiment**
Plan screen. Tomás opens COMMAND-ALPHA's rule editor. Current rule:
`IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)`

He changes `< 1` to `< 2`:
`IF unit_count(scout) < 2 AND queue_count(scout) < 2 THEN queue_blueprint(SCOUT-ALPHA)`

Now the rule allows up to 2 scouts in the pipeline simultaneously. If both scouts die on the same tick, the Command unit can order both replacements immediately instead of waiting. Tomás hovers over the modified rule — the animated tooltip plays: a holographic scout appears on the board preview, gets eliminated, the Command unit antenna rotates, TWO amber arcs fly to the factory, two golden-bordered scout icons appear on the conveyor belt. Tomás nods — that's what he wants.

**Minute 0:30 — The Overshoot Discovery**
But Tomás hesitates. What if only ONE scout dies? The rule sees `unit_count = 1 < 2` and `queue_count = 0 < 2` — fires, orders one. Next tick: `unit_count = 1, queue_count = 1 < 2` — fires AGAIN, orders a second. Now there are 2 scouts in the pipeline for a single loss. He'll overshoot by one.

He stares at the rule. "I need it to order 2 when I lose 2, but only 1 when I lose 1." He realizes: a single rule with a fixed threshold can't distinguish severity. He needs TWO rules.

**Minute 1:00 — The Two-Rule Architecture**
Tomás creates two rules:
```
Rule 3 (high): IF unit_count(scout) == 0 AND queue_count(scout) < 2 THEN queue × 2
Rule 5 (low):  IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue × 1
```

He reads them aloud: "If I lose ALL scouts, emergency: order two, allow two in the pipeline. If I lose one, normal: order one, only allow one in the pipeline." The rule strip shows the two rules with different priority numbers. The condition boxes are visually distinct — Rule 3's `== 0` box has a red accent (emergency threshold), Rule 5's `< 2` box has a blue accent (standard threshold).

**Minute 1:30 — EXECUTE and Watch**
Sealed Watch. Mission 7 plays out. Tick 15: wave kills one scout. Tick 16: Command evaluates. Rule 3: `unit_count(scout) = 1 == 0? → FALSE`. Rule 5: `unit_count(scout) = 1 < 2? → TRUE AND queue_count(scout) = 0 < 1? → TRUE → queue × 1`. One scout ordered. Conservative.

Tick 30: big wave kills both scouts simultaneously. Tick 31: Command evaluates. Rule 3: `unit_count(scout) = 0 == 0? → TRUE AND queue_count(scout) = 0 < 2? → TRUE → queue × 2`. Two scouts ordered in one tick. Emergency response. The conveyor belt shows two golden-bordered scout icons side by side.

Tick 32: Command re-evaluates. Rule 3: `unit_count(scout) = 0, queue_count(scout) = 2 < 2? → FALSE`. Rule 5: `unit_count(scout) = 0 < 2? → TRUE, queue_count(scout) = 2 < 1? → FALSE`. Neither rule fires. The anti-windup holds. No oscillation, no overshoot.

**Minute 3:00 — Inspector Debrief**
Inspector. Tomás pulls up the comparison view: attempt 2 (single rule, 67% efficiency) vs. attempt 3 (two rules, 89% efficiency). The resource graph overlay shows attempt 3's line is smoother — no overshoot bumps, no emergency cliff. He screenshots the comparison and posts it to the subreddit with the caption: "Finally cracked 85%. The trick is two thresholds."

A commenter replies: "You just invented proportional control. Look up PID controllers." Tomás googles "PID controller" and spends 20 minutes reading the Wikipedia article, recognizing his own rule stack in every diagram.

**UI Annotations:**
- **Rule priority numbers:** Visible integer labels on the left edge of each rule strip. Lower number = higher priority. The numbers have generous spacing (Rule 3, Rule 5) to leave room for inserting rules between them later.
- **Condition accent colors:** Emergency conditions (`== 0`, `>= N` where N is high) show with a subtle red accent on the left border. Standard conditions show blue. The accents are decorative — they have no mechanical effect — but they help the player's visual organization.
- **Comparison view resource overlay:** Semi-transparent line graphs from two different attempts layered on the same time axis. The smoother line is visually obvious. A percentage delta label appears at the bottom: "Efficiency: 67% → 89% (+22%)"

---

### Journey: Dr. Amara, 41, ML Researcher, Mission 9, Second Attempt

**Context:** Dr. Amara is building a sophisticated production control system for Mission 9's sustained combat. Her Mission 8 config had good thermostats for scouts and strikers, but Mission 9 introduced enemy escalation — each wave is stronger — and her fixed-threshold thermostats couldn't keep up. She's redesigning with derivative sensing.

**Minute 0:00 — The Architecture Review**
Plan screen. Dr. Amara's COMMAND-NEXUS has 6 rules:
```
Rule 1: IF unit_count(scout) == 0 AND queue_count(scout) < 2 THEN queue × 2     [P-emergency]
Rule 2: IF unit_count(striker) == 0 AND queue_count(striker) < 3 THEN queue × 3  [P-emergency]
Rule 3: IF unit_destroyed_within(ANY, 5) >= 3 THEN queue_blueprint(RELAY-SHIELD) [D-term, new]
Rule 4: IF unit_count(scout) < 3 AND queue_count(scout) < 1 THEN queue × 1      [I-steady]
Rule 5: IF unit_count(striker) < 4 AND queue_count(striker) < 1 THEN queue × 1   [I-steady]
Rule 6: IF unit_count(ANY) >= 10 THEN cancel_queue(ALL)                          [Output clamp]
```

She's added Rule 3 — a derivative condition. When 3+ units die within 5 ticks, the system shifts to building relays (her defensive backbone) instead of combat units. She annotates it: "D-term: loss acceleration → reinforce infrastructure."

**Minute 0:45 — The Tier Distinction Discovery**
Dr. Amara hovers over each condition. Rules 1, 2, 4, 5, and 6 show the ⚡ icon — system status, always current. Rule 3 shows the 📡 icon — sensor data. She reads the tiny tooltip: "Sensor condition: uses 1 context slot. Data may be evicted under buffer pressure."

She pauses. "Wait — Rules 1-2 and 4-5 are free? But Rule 3 costs a buffer slot?" She clicks Rule 3's condition detail and sees: `destroyed_within(ANY, 5) — stores a 5-tick rolling window of destruction events. Buffer cost: 1 slot (temporal window).` She opens COMMAND-NEXUS's context config and checks the buffer allocation: 14 slots total, 11 occupied by battlefield intelligence, 2 for production status, 1 for the temporal window.

"If I add more sensor conditions, I'll need more buffer. But the oracle conditions are free." She reorganizes her mental model: the safety-critical rules (P-emergency, I-steady, output clamp) use free oracle conditions and will ALWAYS work, even under maximum buffer pressure. The optimization rule (D-term) uses a sensor condition and can degrade. The architecture has built-in graceful degradation.

**Minute 1:30 — The Eviction Test**
Dr. Amara wants to verify. She opens the context config panel and changes the `destroyed_within` window from 5 ticks to 10 ticks. A warning appears: `⚠ 10-tick window requires 2 context slots (increased temporal storage).` She changes it to 15. Warning: `⚠ 15-tick window requires 3 context slots.` She sees the tradeoff: wider sensing window = more buffer cost = less room for other intelligence.

She sets it back to 5 ticks (1 slot) and adds a note in the rule comment: "5-tick window is optimal: catches 2 consecutive waves, costs only 1 slot. Wider window not worth the buffer pressure."

**Minute 2:30 — EXECUTE**
Sealed Watch. The first 40 ticks go smoothly — oracle-based thermostats hum along. Tick 42: enemy sends a coordinated 5-striker wave. Three units die in ticks 42-44. Tick 45: Rule 3 evaluates: `destroyed_within(ANY, 5) = 3 >= 3 → TRUE`. The Command unit queues a RELAY-SHIELD. Dr. Amara watches the amber arc to the factory with satisfaction — the derivative term detected the acceleration.

Tick 55: the enemy sends a second wave while simultaneously flooding all channels with noise signals. The Command unit's buffer fills with noise. Tick 56: the `destroyed_within` temporal window entry competes with 8 incoming noise signals for buffer space. Eviction priority kicks in — the noise has LOW priority, the temporal window has MEDIUM priority. The window survives. Rule 3 continues working.

But Dr. Amara imagines: "What if I had lower-priority sensor conditions? Those WOULD get evicted during this noise flood." She makes a mental note: "Mission 10 might need buffer pressure defense for sensor conditions. Consider dedicating buffer slots via pinning."

**Minute 4:00 — Inspector Reflection**
Inspector. Dr. Amara clicks COMMAND-NEXUS at tick 56 and examines the buffer state. 14 slots: 1 temporal window (⏱ icon), 2 production status (📋 icon), 4 scout reports (📡 icon), 3 noise signals (🔊 icon, low priority, amber-bordered — candidates for eviction), 4 empty slots (eviction cleared space). The buffer state tells the story: the noise tried to fill the buffer, but eviction policy protected the important entries.

She switches to the decision trace. Rules 1-2, 4-5 show ⚡ icons — they evaluated perfectly. Rule 3 shows 📡 with green — sensor data was present, evaluation successful. She scrubs to a hypothetical future scenario where the temporal window IS evicted: the Rule 3 row shows `📡 ⚠ [DATA MISSING: temporal window evicted at T56]` — the condition evaluates as FALSE (safe default: no data = no action). The thermostat degrades from PID to bang-bang-with-anti-windup. The system loses its derivative sensing but doesn't crash.

"That's how you should design a control system," she murmurs. "Safety loops on hardware sensors, optimization loops on software. The optimization can fail. The safety must never fail."

**UI Annotations:**
- **⚡ and 📡 icons:** 8×8 pixel icons in the condition evaluator. ⚡ (oracle) = cyan with white bolt. 📡 (sensor) = amber with small antenna. Hover for tooltip explaining the tier.
- **Buffer cost indicator:** When a sensor condition is selected in the rule editor, a small "1 slot" badge appears below the condition box. The badge color matches the context config panel's slot colors.
- **Temporal window width warning:** When the player changes the tick window parameter (e.g., 5 → 10), the buffer cost badge updates in real-time with a brief amber flash. If the new cost exceeds available buffer, the badge turns red.
- **Decision trace DATA MISSING row:** When a sensor condition can't evaluate because its data was evicted, the row shows in gray with the ⚠ icon and the eviction details. The row is not alarming — it communicates that the system handled the absence gracefully.

---

### Journey: Kai, 11, First Strategy Game, Mission 7

**Context:** Kai is playing Mission 7 for the first time. He learned about the Command unit in Mission 6 and built a simple thermostat that worked. Mission 7's enemy waves are harder. His first attempt ended with the classic oscillation — 6 scouts queued, resources depleted, game over. His older sister (who plays Factorio) is watching over his shoulder and occasionally offering hints.

**Minute 0:00 — The Confusion**
Kai opens Inspector after his loss. He clicks COMMAND-ALPHA and sees the decision trace: tick after tick of Rule 3 glowing green → amber. "It keeps ordering scouts! But I already told it to order one!" His sister points at the screen: "Look at what it's checking. It checks if there are fewer than 2 scouts. But it doesn't check if it already ordered one."

Kai: "But I ordered it to make one." His sister: "You ordered it to make one IF there are fewer than 2. But after it orders one, there are still fewer than 2 — the new one hasn't arrived yet. So it orders again."

**Minute 0:30 — The Autocomplete Moment**
Plan screen. Kai opens the condition editor and types "queue." The autocomplete dropdown appears:

```
System Status (always accurate)
  queue_count(type) — pending orders
```

He selects it. He types "scout" in the type field. The condition shows: `queue_count(scout)`. He adds `< 1`. The full rule now reads:

`IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)`

The animated tooltip plays immediately: the board preview shows a scout getting eliminated, the Command unit ordering one replacement (amber arc to factory), then re-evaluating — the condition box for queue_count shows `1 < 1 → FALSE`, the AND junction shows a red X, the action stays dim. The tooltip is a 5-tick animation that shows exactly why the second order doesn't fire. Kai watches it loop twice.

"Oh! It checks if there's already one being made!"

**Minute 1:00 — EXECUTE**
Sealed Watch. The battle plays out. First wave kills a scout at tick 15. Command orders one replacement. Tick 16-19: Command re-evaluates each tick but queue_count = 1, so the rule doesn't fire. Tick 20: replacement deploys. The conveyor belt had exactly one scout icon, neatly processed.

Tick 30: big wave kills both scouts. Command orders one scout (queue_count = 0 < 1 → TRUE). Tick 31: Command re-evaluates: `unit_count = 0, queue_count = 1 < 1 → FALSE`. Doesn't fire. Kai waits. Tick 35: first replacement deploys. Tick 36: Command re-evaluates: `unit_count = 1 < 2, queue_count = 0 < 1 → TRUE`. Orders the second replacement.

"It waited!" Kai says. "It ordered the second one after the first one came out." His sister: "But that took 6 ticks. Is that fast enough?"

Tick 38: enemy striker advances toward the lone scout. Tick 39: second replacement deploys just in time — two scouts now cover each other's flanks. The striker engages the nearest scout; the other scout has already hooked the position to a relay. Striker eliminated at tick 41 by an incoming friendly striker.

"Close," Kai breathes. He looks at the resource counter: still positive. No cliff. Mission complete.

**Minute 2:00 — The Satisfaction**
Inspector. Kai doesn't go deep into analysis — he's 11. But he opens the conveyor belt history and counts: 3 total replacement scouts across the whole mission. His first attempt had 6. He opens the comparison view and sees the resource graph: first attempt cliff, second attempt smooth. He doesn't screenshot it — he turns to his sister and says "I fixed it."

His sister: "You built an anti-windup mechanism." Kai: "I built a what?" His sister grins and doesn't explain. Three years later, in a university control systems lecture, Kai will hear "anti-windup" and immediately picture the conveyor belt.

**UI Annotations:**
- **Autocomplete timing:** 200ms after the player types 3+ characters in the condition field. Grouped by tier (System Status / Sensor Data). One-line descriptions per condition.
- **Animated tooltip for queue_count condition:** Plays automatically when a new queue_count condition is added to a rule. Shows a 5-tick scenario: loss → order → re-evaluation (blocked by queue_count) → deploy → re-evaluation (queue_count now 0, can fire again). Loops every 8 seconds.
- **Conveyor belt history:** A scrollable timeline showing every production order placed during the match. Each entry shows: blueprint icon, ordering tick, ordering unit, status (deployed/building/waiting/canceled). AI-ordered entries have golden borders. Player-queued entries have blue borders.
- **Comparison view:** Available when multiple attempts of the same mission exist. Side-by-side resource graphs and conveyor belt summaries. Accessible from Inspector's toolbar.

---

## Interaction Effects

### With `cancel_queue` (3.19a-i-b)
`queue_count` and `cancel_queue` are complementary: queue_count measures, cancel_queue actuates. The output clamp rule (`IF unit_count >= 4 THEN cancel_queue(scout)`) is only meaningful if queue_count reflects canceled orders immediately (which it does under the recommended model — cancellation instantly decrements the count). If cancel_queue and queue_count had different update timing, the overshoot clamp would lag.

### With Control View Inspector (3.19a-i-c)
The Control View plots rule firing as a binary waveform. Under the recommended oracle model, the queue_count condition creates crisp on/off transitions in the waveform — the rule fires exactly once per deficit (if queue_count < 1). Under Model A (receipt counter), the waveform would show brief spurious re-firings during the building gap, creating a noisy signal trace. The oracle model produces cleaner Inspector visualizations.

### With MIMO Thermostats (3.19a-i-d)
When a Command unit manages scouts AND strikers, `queue_count(scout)` and `queue_count(striker)` are independent oracle queries. The Command unit can check both in a single tick without buffer cost. This means MIMO control is free from a sensing perspective — the complexity is in the rule LOGIC (priority inversion, conditional scheduling), not in the sensing infrastructure. This is the right place for complexity to live.

### With Hooks-Based Thermostat (3.19a-i-e)
The advanced variant where Command learns about losses via channel signals rather than oracle conditions creates an interesting comparison: the oracle-based thermostat (using `unit_count` + `queue_count`) is simple and reliable. The hooks-based thermostat (using signal data in the buffer) is faster (learns about losses 1 tick earlier via the reporting signal) but fallible (relies on signal delivery). The player who masters both approaches has learned the fundamental tradeoff in observability engineering: polling (oracle, periodic, reliable, latent) vs. event-driven (hooks, immediate, fallible, lossy).

### With the Sealed Watch (Locked)
The queue_count oracle means the player can trust their thermostat during sealed watch. They don't need to worry about "did the Command unit forget its own order?" — oracle conditions never forget. This reduces sealed watch anxiety about production (good for first-timers) while leaving anxiety about battlefield outcomes intact. The player watches the battle, not the thermostat.

### With the Autocomplete (Workbench)
The autocomplete's two-tier grouping (System Status / Sensor Data) is the primary teaching surface for the oracle/sensor distinction. The player who browses autocomplete conditions learns the tier system passively. No tooltip needed — the spatial grouping does the work. The footer note ("System status is always current. Sensor data uses 1 context slot and may be evicted.") is present for the curious player but not required for basic use.

---

## Comparable Systems

### Kubernetes Pod Status API
Kubernetes exposes pod status via the API server — always current, always available, zero cost to query. Replica count, pod phase (Pending/Running/Failed), container status — these are "oracle" metrics. But application-level metrics (request latency, error rate) require Prometheus scraping, which has latency, storage cost, and can fail independently. The Robot Uprising oracle/sensor split maps directly to this: `unit_count` = `kubectl get pods --field-selector status.phase=Running`, `destroyed_within` = `promql('rate(http_errors_total[5m])')`.

### Factorio Circuit Conditions
Factorio's circuit conditions are instant and perfect — a combinator checking "iron plates < 200" reads the exact current count. There's no delay, no sensing cost. This is the oracle model applied to everything. The result: Factorio's circuit challenges are purely about LOGIC (what conditions to wire), never about SENSING (whether the conditions are accurate). Robot Uprising adds the sensing dimension for advanced play.

### Screeps Game Object API
Screeps provides both instant properties (`Game.rooms[name].energyAvailable` — oracle) and scanned properties (`room.lookForAt(LOOK_CREEPS, x, y)` — requires code execution, CPU cost). The CPU cost per look is Screeps's version of the buffer slot cost. Advanced Screeps players cache scanned results to reduce CPU — analogous to Robot Uprising players managing buffer entries to retain sensor data.

### Real PID Controllers — Process Variable vs. Calculated Variable
In industrial PID, the process variable (temperature, pressure, flow rate) comes from a dedicated sensor — reliable, always updating. But calculated variables (derivative of temperature, moving average of pressure) require computation on the PLC, which has a cycle time and can be disrupted by CPU load. The PV is the oracle; the calculated variable is the sensor condition. Robot Uprising's split maps precisely.

---

## The TikTok Clip

**"The Oscillation Fix"** — 15-second clip.

Seconds 0-5: Split screen. Left: first attempt. The conveyor belt fills with scout icons — 1, 2, 3, 4, 5, 6 — stacking up in golden borders. The resource counter plummets: 20m → 15m → 10m → 5m → 0m. Red flash. Game over.

Seconds 5-8: Black screen. Text appears character by character (boot-log style): `> ANTI-WINDUP ENGAGED.`

Seconds 8-13: Right half of split screen appears: second attempt, same mission. Enemy wave kills two scouts. Command unit antenna rotates — ONE amber arc to factory. ONE scout on the belt. Resources dip from 20m to 16.5m and stabilize. Next tick: Command re-evaluates. The condition box shows two segments: `unit_count < 2 ✓` AND `queue_count < 1 ✗`. The ✗ glows red. The action stays dim. No second order. Resources hold.

Seconds 13-15: Both screens side by side. Left: red chaos. Right: green stability. Text overlay: "One condition. That's all it took."

Caption: "I stopped my AI from panic-buying."

---

## New Aspects Discovered

1. **3.19a-i-a-i — `queue_count(ANY)` as factory saturation metric:** The wildcard variant that returns total pipeline count regardless of type. Used in rules like `IF queue_count(ANY) >= 3 THEN suspend_ordering` as a global factory saturation check. Interaction with resource budgeting and production queue priority.

2. **3.19a-i-a-ii — Oracle/sensor tier visual language in the rule editor:** The full UX design of how the two-tier system is communicated — ⚡/📡 icons, autocomplete grouping, tooltip language, Inspector representation, and how this distinction evolves across the campaign as more sensor conditions unlock.

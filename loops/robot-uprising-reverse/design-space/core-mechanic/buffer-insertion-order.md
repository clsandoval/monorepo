# 2.01a — Buffer Insertion Order as Hidden Complexity

**Aspect:** 2.01a — Buffer insertion order as hidden complexity: deterministic but opaque ordering of simultaneous arrivals (clockwise observations, alphabetical channels); should this be visible/configurable? What happens when renaming a channel changes insertion priority?
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

The fixed-slot buffer model (2.01) specifies that when multiple data arrive in the same tick, insertion order is deterministic:

1. Observations first, in **clockwise scan order from North**
2. Hook messages second, in **channel alphabetical order**

This ordering is a hidden variable with real gameplay consequences. When a buffer has 2 free slots and 5 new entries arrive in one tick, the first 2 entries fill the free slots and the remaining 3 cause evictions. WHICH entries get evicted depends on their insertion order. A threat observation from the North enters the buffer before a threat observation from the South. A message on channel "alpha" enters before one on channel "zulu." The entries that arrive LAST are the ones most likely to be evicted (they push out the oldest entries, but they're also the freshest — so they survive IF there's room, but cause more evictions of older data).

The question: should this ordering be visible to the player? Should it be configurable? And what happens when a player discovers that renaming a channel from "threat" to "aaa-threat" changes its insertion priority — and therefore changes which data survives in a contested buffer?

---

## The Problem Space

### Why Insertion Order Matters

Consider a Striker with 8 buffer slots, all full from previous ticks. This tick, it simultaneously receives:
- 1 observation: enemy at tile C4 (from perception, North direction)
- 1 observation: enemy at tile F6 (from perception, Southeast direction)
- 1 hook message on channel "alert" (compressed threat summary from Relay)
- 1 hook message on channel "position" (friendly location update from Scout)

Four entries arrive. Four oldest entries are evicted (FIFO). The insertion order:
1. Enemy at C4 (North observation, first in clockwise scan)
2. Enemy at F6 (Southeast observation, second in clockwise scan)
3. "alert" channel message (alphabetically first hook)
4. "position" channel message (alphabetically second hook)

After insertion, the buffer's newest four entries are, in order from newest to oldest: position, alert, F6 enemy, C4 enemy. The four evicted entries are the oldest from previous ticks.

Now, if the Striker's rules evaluate against current buffer contents, and there's a rule `WHEN enemy_count > 1 THEN engage_nearest`, the rule sees BOTH enemy observations (they were both inserted this tick). But if only 1 slot was free instead of needing 4 evictions, the observation from C4 (North, inserted first) would have pushed out the oldest entry, leaving room for F6 — both survive. With zero free slots and 4 arrivals, all 4 push out old data. The insertion ORDER doesn't change which NEW entries survive (they all do), but it DOES change which OLD entries are evicted and therefore which OLD data the rules can still reference.

The subtle case: what if the buffer had only 2 free slots and 4 new entries arrive? Then entries 1-2 (C4 enemy, F6 enemy) fill the free slots. Entries 3-4 (alert, position) cause 2 evictions from the oldest end. ALL four new entries still survive (they're the newest). But the order determines which PAIR of old entries gets evicted — the two oldest, regardless of insertion order. So in FIFO, insertion order within a single tick doesn't actually change which entries are evicted... unless the eviction policy is NOT pure FIFO.

**The real impact appears with non-FIFO eviction policies.** If the player has configured priority-based eviction (low-priority entries evicted first), then insertion order determines the POSITION of each new entry in the priority queue, which determines its vulnerability to future eviction. An observation inserted first sits at a different priority position than one inserted fourth. This positional difference compounds over subsequent ticks.

### The Channel-Naming Exploit

If hook messages are inserted in channel alphabetical order, and earlier insertion means a different buffer position, then **channel names are a stealth gameplay variable.** A player who names their channels "aaa-threat" and "zzz-noise" is implicitly prioritizing threat data over noise data in insertion order. The channel name becomes a hidden priority system.

This is either:
- **A delightful discovery:** "I realized that naming my channels alphabetically lets me control which data enters the buffer first. It's like naming your files 001_, 002_ to control sort order."
- **A frustrating gotcha:** "I renamed my channel from 'threat' to 'danger' and my army broke because the insertion order changed and my rules stopped working."
- **A degenerate exploit:** "The meta is to name all critical channels starting with 'aaa-' and all noise channels starting with 'zzz-'. It's ugly but optimal."

---

## Six Design Approaches

### Approach A — "The Black Box" (Hidden, Fixed, Non-Configurable)

Insertion order follows the locked spec (clockwise observations, alphabetical channels) but is NEVER surfaced in the UI. The player never sees the insertion order. It's a deterministic implementation detail that exists only for reproducibility.

**Strengths:**
- Simplest implementation and UI. Zero additional complexity for the player.
- The vast majority of players will never notice — insertion order only matters in edge cases where the buffer is contested and the eviction policy is non-FIFO.
- Keeps the channel-naming exploit hidden. Only elite players discover it, and they feel clever.

**Weaknesses:**
- Violates the "deterministic and transparent" philosophy. If a player's army fails because of insertion order, they can't diagnose it without understanding a hidden system.
- The Inspector must either show insertion order (revealing the system) or hide it (making diagnosis impossible).
- The channel-naming exploit, once discovered, spreads through the community and becomes an ugly meta requirement.

**Design feel:** "The implementation detail that becomes a mechanic by accident."

### Approach B — "The Inspector Reveal" (Hidden in Plan, Visible in Inspector)

During the Plan phase, insertion order is not shown. During Inspector debrief, the decision trace shows the exact insertion order for each tick: "Tick 7: [1] observation:C4 (N-scan) → [2] observation:F6 (SE-scan) → [3] hook:alert → [4] hook:position". The player can trace why a specific entry was in a specific buffer position.

**Strengths:**
- Maintains the "learn by playing, diagnose by inspecting" philosophy.
- The player doesn't need to think about insertion order during planning — it's a diagnostic tool, not a planning input.
- The Inspector already shows buffer state per tick; insertion order annotations are a natural extension.

**Weaknesses:**
- Players who discover insertion order in the Inspector might feel cheated — "this hidden thing was affecting my battle the whole time?"
- The channel-naming exploit remains — once revealed in the Inspector, competitive players will optimize channel names.

**Design feel:** "The hidden gear you can see if you open the machine."

### Approach C — "The Explicit Priority" (Visible and Configurable)

The blueprint workbench includes an **Input Priority** panel where the player explicitly orders their data sources:

```
INPUT PRIORITY (highest to lowest):
1. [Observations - Nearest first]  ▲▼
2. [Channel: "threat"]             ▲▼
3. [Channel: "position"]           ▲▼
4. [Observations - Farthest first] ▲▼
```

The player drags to reorder. Observation scanning direction is configurable (nearest-first, farthest-first, clockwise, counter-clockwise). Channel priority is explicit — no alphabetical hack needed.

**Strengths:**
- Maximum transparency. The player controls exactly what enters the buffer first.
- Eliminates the channel-naming exploit entirely — names are names, priority is priority.
- Creates a new design space: "input priority tuning" as a distinct skill. A Striker that prioritizes observations over hooks sees the battlefield first and messages second. A Command agent that prioritizes hooks over observations reads reports before looking around.
- Interacts beautifully with the existing rule priority system: rules determine what the unit DOES with buffer data; input priority determines what data EXISTS in the buffer.

**Weaknesses:**
- Significant additional complexity. The plan phase already has skills, rules, hooks, and context config. Adding an input priority panel is a fifth configuration dimension.
- Most players don't need this level of control. Only competitive and expert players would tune input priority.
- Risk of "one more slider" fatigue — the feeling that the game has too many knobs.

**Design feel:** "The sorting hat for incoming data."

### Approach D — "The Perception Cone" (Spatial, Not Alphabetical)

Replace the clockwise-from-North scan with a **perception cone** — a directional bias the player configures. The unit pays more attention to data arriving from its facing direction.

**How it works:**
- Each unit has a **facing direction** (N, NE, E, SE, S, SW, W, NW) — configurable or determined by movement direction.
- Observations from the facing direction enter the buffer first. Observations from behind enter last.
- Hook messages are unordered (all arrive simultaneously, random shuffle per tick — deterministic from a seed).

**Strengths:**
- Intuitive spatial reasoning. "My Scout faces North, so it notices enemies to the North first." This is how real attention works.
- Eliminates the channel-naming exploit (hooks are unordered).
- Creates interesting spatial puzzles: facing direction matters for what you notice.
- Connects to the "attention system" theme — the unit literally FACES its attention direction.

**Weaknesses:**
- Facing direction is another variable to configure and manage.
- Hook message ordering becomes non-deterministic within a tick (random seed). This partially undermines the "fully deterministic" philosophy — though it's deterministic from the seed.
- Units that don't move (Relay, Command) need a different system since they have no movement-based facing.

**Design feel:** "Where you look determines what you see first."

### Approach E — "The Priority Tag" (Source-Level Priority)

Each data source (observation type, channel) has a **priority level** (1-3, like signal urgency in 2.10). Higher priority data enters the buffer first, regardless of spatial direction or channel name.

**How it works:**
- Observations have inherent priority: enemy = 3 (high), terrain = 2 (medium), ally = 1 (low)
- Hook channels have player-assigned priority: configurable per channel per blueprint
- Within the same priority level, order is arbitrary (random seed) — but high-priority data always enters before low-priority

**Strengths:**
- Semantic ordering. "Threat data enters before terrain data" feels correct — urgency determines attention.
- Integrates with the signal taxonomy (2.10) — signal types already have urgency ratings.
- Channel priority is explicit (no naming hack) and per-blueprint (different units can prioritize the same channel differently).

**Weaknesses:**
- Within-priority ordering is still arbitrary. Two priority-3 entries compete on random tiebreaker.
- Three priority levels may not be fine-grained enough for expert players.
- Another configuration surface — channel priority per blueprint.

**Design feel:** "Triage. Urgent cases first."

### Approach F — "The Progressive Reveal" (RECOMMENDED)

A layered approach that starts invisible and becomes configurable as the player advances:

**Missions 1-4 (Tutorial):** Insertion order is Black Box (Approach A). Buffers are small, simultaneous arrivals are rare, the player doesn't need to know. The system uses nearest-first for observations, hook-arrival-order (internal tick ordering) for messages.

**Mission 5-7 (Factory):** The Inspector reveals insertion order in the decision trace (Approach B). The player can see "Tick 7: [1] obs:C4 [2] obs:F6 [3] hook:alert [4] hook:position" when they click into buffer detail. A boot log note: "DIAGNOSTIC: Buffer insertion sequence now visible in analysis mode. The order your agent processes incoming data affects what it remembers."

**Mission 8-10 (Full System):** The Input Priority panel (Approach C, simplified) unlocks in the workbench. Two tiers: (1) Observations vs. Hooks — which category enters first? (2) Within hooks, drag channels to set priority order. Observation ordering remains nearest-first (no configuration — spatial intuition handles it). Channel names never affect priority.

**Gauntlet:** Full configuration unlocked, including observation scan direction (Approach D's perception cone) as an advanced option.

**Why this is recommended:**

1. **Zero cognitive load early.** New players never encounter insertion order. Buffers are small enough in Missions 1-4 that the ordering rarely matters.

2. **Diagnostic window mid-game.** When the player first encounters a buffer-contention mystery (Mission 5-6, larger squads, more channels), the Inspector already shows them the answer. They learn WHAT insertion order is by seeing it in a diagnostic context.

3. **Configuration late-game.** By Mission 8, the player has mastered rules, hooks, and context config. Adding input priority as a fourth tuning knob feels like a natural deepening, not an overwhelming addition.

4. **Eliminates the channel-naming exploit.** Channel names never affect ordering in this model. Priority is always explicit (drag to reorder in the Input Priority panel) or implicit (nearest-first for observations). No player ever discovers that renaming "threat" to "aaa-threat" does something — because it doesn't.

5. **The perception cone as mastery content.** The Gauntlet's perception cone option adds a spatial attention dimension for players who want maximum control. It's strictly optional, never required for campaign completion.

---

## The Channel-Naming Exploit: Resolution

Under the recommended model (Approach F), channel names are **purely cosmetic identifiers** with zero gameplay effect on insertion order. Priority is configured through the explicit Input Priority panel. This means:

- Naming a channel "aaa-threat" does nothing special
- Renaming a channel never breaks existing behavior
- Channel names can be creative, thematic, meaningful — "flanking-orders", "danger-zone", "lunch-plans" — without gameplay consequences
- The Inspector shows channel priority as a separate, explicit ranking, not as a side effect of alphabetical sorting

This is the correct resolution. Channel names should carry MEANING (the player's organizational vocabulary), not PRIORITY (a hidden mechanical effect). Conflating the two is a design smell — like a programming language where variable names affect execution order.

---

## Sensory Design

### Insertion Order in the Inspector

When the player clicks a unit at a specific tick in the Inspector, the buffer state panel shows each slot with its contents. When the player hovers over a slot, a tooltip shows the **insertion annotation**:

```
Slot 5 (newest):  hook:position  [inserted 4th this tick, priority: LOW]
Slot 6:           hook:alert     [inserted 3rd this tick, priority: HIGH]
Slot 7:           obs:F6 enemy   [inserted 2nd this tick, nearest: 3 tiles]
Slot 8 (oldest):  obs:C4 enemy   [inserted 1st this tick, nearest: 2 tiles]
```

The insertion sequence is shown as a numbered annotation. Priority tags (HIGH/MED/LOW) are shown in the channel's configured color. Distance annotations show why nearest-first ordered observations the way it did.

### The Input Priority Panel

In the workbench (Mission 8+), a narrow vertical panel appears to the right of the Context Config section:

```
┌─ INPUT PRIORITY ──────────┐
│                            │
│  ① Observations            │
│     [nearest-first]        │
│                            │
│  ② Channel: "threat"   ≡   │
│  ③ Channel: "orders"   ≡   │
│  ④ Channel: "position" ≡   │
│                            │
│  [Obs first ◉ Hooks first] │
│                            │
└────────────────────────────┘
```

The `≡` handles are drag grips. The player drags channels to reorder. An "Obs first / Hooks first" toggle determines whether observations or hooks enter the buffer first. The entire panel is a single column of drag targets — minimal screen space, maximum configurability.

### Audio Feedback

When the player drags a channel to a new priority position in the Input Priority panel:
- A soft "click" as the channel snaps to its new position (like a card settling into a slot)
- A brief ascending tone if the channel moves UP in priority (now enters buffer sooner)
- A brief descending tone if the channel moves DOWN (now enters buffer later)
- The unit's buffer preview (ghost visualization) briefly flashes to show the new insertion sequence

---

## Three Player Journeys

### Journey: Mei, 24, Computer Science Graduate Student (Taipei)

**Context:** Mission 6. Mei is debugging a Striker that keeps dying in battles it should win. She's spent two runs trying different rule configurations with no success.

**Minute 0:00 — The Mystery**
Mei's Striker has 8 buffer slots. It receives enemy observations and "threat" channel messages from a Relay. Its rule: `WHEN threat_count > 0 THEN engage_nearest`. The rule fires correctly — but the Striker engages the WRONG enemy. It goes after a distant Scout instead of a nearby Striker. Why?

**Minute 1:30 — The Inspector Deep Dive**
She opens the Inspector, clicks the Striker at the critical tick, and reads the buffer state. Slot 8 (newest): enemy Scout at G7 (observed from perception, 4 tiles away). Slot 7: enemy Striker at D5 (received via "threat" channel from Relay). The `engage_nearest` action uses the MOST RECENT threat entry (slot 8) as the target. The enemy Scout at G7 was observed directly (entered via perception, nearest-first ordering, but G7 is farther than D5).

Wait. The observation of the Scout at G7 is in slot 8 (most recent), but the hook message about the Striker at D5 is in slot 7 (less recent). Even though D5 is closer, G7 was inserted later because observations enter AFTER hooks? No — the spec says observations enter FIRST, then hooks. Something's wrong with her mental model.

**Minute 3:00 — The Insertion Order Annotation**
She hovers over slot 8. The tooltip says: "[inserted 2nd this tick, hook:threat, source: Relay, content: enemy Striker at D5]." She hovers over slot 7. "[inserted 1st this tick, observation, distance: 4 tiles, content: enemy Scout at G7]."

Wait — observation entered FIRST (position 7), hook entered SECOND (position 8). The hook message is the NEWER entry. The `engage_nearest` rule is targeting the most recent THREAT entry, which is the hook message about D5 — the Striker at D5 IS the one being targeted. But during execution, the Striker moved toward... G7?

**Minute 5:00 — The Real Bug**
Mei re-reads her rule. It says `engage_nearest`, not `engage_most_recent_threat`. The `engage_nearest` action evaluates SPATIAL proximity, not buffer position. The Striker at D5 is 3 tiles away. The Scout at G7 is 4 tiles away. The Striker SHOULD go to D5. She re-watches the sealed watch replay frame by frame.

The bug: at tick 6, the Striker began moving toward D5. But at tick 7, the enemy Striker at D5 moved to E6 (3 tiles away still), while a NEW enemy appeared at C3 (2 tiles away). The rule re-evaluated on tick 7: "engage nearest" → C3 is now nearest. The Striker redirected. It looked like it went to the wrong target, but it was actually chasing the CURRENT nearest enemy, which changed between ticks.

The insertion order was a red herring. The actual issue is target volatility. But the insertion order annotations in the Inspector helped Mei ELIMINATE the false hypothesis quickly. Without them, she might have spent hours guessing.

**Minute 8:00 — The Lesson**
"Insertion order didn't cause the bug," Mei tells herself, "but understanding it helped me rule it out faster. The Inspector's annotations are like a debugger's watch variables — they show me the data that WAS available at each decision point, so I can verify my mental model."

She adds a sticky-target rule: `WHEN engaged_target_exists THEN continue_engagement`. Now the Striker commits to its initial target instead of constantly redirecting. The insertion order detail was irrelevant to the fix — but the diagnostic process that REVEALED the insertion order taught her how the buffer works at a deeper level.

**UI Annotations:**
- Inspector: buffer state panel with insertion-order annotations on hover
- Tooltip: "[inserted Nth this tick, source, distance/channel, content]"
- Sealed watch replay: frame-by-frame Striker movement with decision-reason overlay

---

### Journey: Marcus, 42, SRE (Seattle)

**Context:** Mission 9. Marcus has discovered the Input Priority panel (unlocked at Mission 8). He's optimizing a Command agent that receives data from 4 channels.

**Minute 0:00 — The Triage Problem**
Marcus's Command agent has 14 buffer slots and listens to 4 channels: "threat" (from Scouts), "status" (from Relays), "production" (from Factory), "orders-ack" (acknowledgments from Strikers). Each channel sends 1-3 messages per tick. Total incoming: up to 12 hook messages per tick, plus 0-2 observations (Command has no perception, but allies within range generate observation entries).

14 slots. Up to 14 new entries per tick. The buffer is a war zone every single tick — constant churn, constant eviction. WHICH entries survive depends on which enter first and which get evicted.

**Minute 2:00 — The Priority Configuration**
Marcus opens the Input Priority panel for the Command agent:

```
① Channel: "threat"       [HIGH]
② Channel: "status"        [MED]
③ Channel: "production"    [MED]
④ Channel: "orders-ack"    [LOW]
⑤ Observations             [LOW]
```

He drags "threat" to the top. Threat data enters the buffer first — it's the most important. He puts "orders-ack" at the bottom — acknowledgments are confirmations, nice to have but not critical. "This is exactly like my PagerDuty alert routing," he tells the stream. "Critical alerts > warnings > informational. Same triage."

**Minute 5:00 — The Eviction Interaction**
Marcus runs the battle. In the Inspector, he traces a critical tick where the Command agent received 10 new entries but only had 6 free slots. The Input Priority panel ensured "threat" entries occupied slots first. The "orders-ack" entries entered last — and when the buffer was full, the oldest entries (stale position data from 5 ticks ago) were evicted. The "threat" data survived intact. The acknowledgments entered last but still survived (they were the newest entries and FIFO evicts the oldest).

But on a later tick, the buffer was completely full with 14 entries, and 8 new entries arrived. The 8 newest entries replaced the 8 oldest. Input priority determined the ORDER of the 8 new entries within the buffer — "threat" at positions 7-8 (oldest of the new), "orders-ack" at positions 13-14 (newest of the new). Since eviction removes the oldest, the NEXT tick's eviction would remove entries at positions 1-6 first... then position 7-8 (the threat entries that entered first this tick).

Marcus realizes: entering the buffer FIRST means being evicted SOONER (because you're older relative to entries that entered later). High input priority means "I see this data first" but also "this data ages faster."

"Wait," he says. "High input priority means EARLIER eviction? That's... counterintuitive." Chat: "IT'S LIKE A LIFO STACK INSIDE A FIFO QUEUE."

**Minute 8:00 — The Inversion**
Marcus reconsiders. He WANTS threat data to survive long — it should be evicted LAST, not first. So he should put "threat" at the BOTTOM of input priority (enters last, newest position, evicted last by FIFO). And "orders-ack" at the TOP (enters first, oldest position, evicted first by FIFO — which is fine because acknowledgments are transient).

He inverts his priority ordering:
```
① Channel: "orders-ack"    [disposable, enter first, age fastest]
② Channel: "production"     [medium persistence]
③ Channel: "status"         [medium persistence]
④ Channel: "threat"         [precious, enter last, survive longest]
⑤ Observations              [precious, enter last, survive longest]
```

"Input priority isn't about importance," Marcus explains to chat. "It's about EXPENDABILITY. The most expendable data enters first and gets evicted first. The most precious data enters last and persists longest. It's inverted from what you'd expect."

He runs the battle again. The Command agent now retains threat data for 3-4 ticks instead of 1-2. Its rules have more threat context to work with. Better decisions. "This is like... putting your most important files on the LAST disk in a RAID array. Not where you'd intuitively put them."

**Minute 12:00 — The Stream Clip**
"THE INPUT PRIORITY IS INVERTED." Marcus makes a quick diagram on his stream overlay showing the FIFO queue with insertion position mapped to eviction order. "It's a conveyor belt. Whatever you put on FIRST falls off FIRST. So put the stuff you DON'T care about on first!" Chat: "FIFO GANG" "HE JUST TAUGHT US QUEUE THEORY IN A ROBOT GAME" "I FINALLY UNDERSTAND MY KUBERNETES POD PRIORITY CLASSES."

**UI Annotations:**
- Input Priority panel: vertical drag list with channel names, drag handles, priority badges
- Inspector buffer: tick-by-tick buffer state showing entry positions, insertion order annotations, eviction flash on oldest entries
- Stream overlay: Marcus's hand-drawn FIFO diagram mapping insertion position to eviction vulnerability

---

### Journey: Aisha, 15, Aspiring Game Designer (Nairobi)

**Context:** Mission 5. Aisha hasn't unlocked the Input Priority panel yet. She's experiencing insertion order as a Black Box.

**Minute 0:00 — The Inconsistency**
Aisha runs the same mission twice with the same configuration. Both runs have "invisible randomization" (scenario varies within constraints), but the core setup is identical. In run 1, her Striker engages the correct target. In run 2, the same Striker seems to hesitate — engaging a different target on the same tick.

"Why did it do something different? I didn't change anything." She opens the Inspector for both runs side-by-side (a feature she discovered last mission).

**Minute 2:00 — The Comparison**
Run 1, Tick 8: Striker buffer shows observation of enemy at B3 in slot 7, observation of enemy at E6 in slot 8. Rule `engage_nearest` fires → targets B3 (2 tiles away). Correct.

Run 2, Tick 8: Striker buffer shows observation of enemy at E6 in slot 7, observation of enemy at B3 in slot 8. Same two enemies, but in DIFFERENT buffer positions. Rule `engage_nearest` fires → targets B3 (still 2 tiles away — nearest is nearest regardless of buffer position). Wait, the rule DOES target B3 in both runs. The outcome is the same.

But the MOVEMENT PATH differs. In run 1, the Striker moved through C3 toward B3. In run 2, the Striker moved through D4 toward B3. Why? Because the invisible randomization placed a terrain obstacle in a slightly different position, and the pathfinding algorithm chose a different route.

**Minute 4:00 — The Non-Bug**
Aisha realizes: the insertion order DID differ between runs (enemies were at slightly different positions due to randomization, so the nearest-first ordering changed). But the insertion order didn't affect the OUTCOME — the Striker targeted the nearest enemy in both cases. The visual difference was due to pathfinding, not buffer ordering.

"Oh. I thought the buffer order was causing the problem. But it's actually the random terrain. The buffer worked correctly both times — it just looked different because the enemies were in slightly different spots."

**Minute 6:00 — The Learning**
Aisha has just learned something valuable WITHOUT understanding insertion order mechanics. She learned: (1) the Inspector lets you compare runs, (2) apparent behavior differences can have multiple causes, (3) the buffer state EXPLAINS decisions but doesn't always CAUSE differences. She's developing debugging intuition — the skill to identify root causes — without needing to understand the low-level insertion order mechanism.

This is the Black Box working as intended. Aisha isn't confused by insertion order because she doesn't know it exists. She's learning debugging methodology through concrete examples. When the Input Priority panel unlocks in Mission 8, she'll be ready to understand it — because she already has the debugging mindset.

**UI Annotations:**
- Side-by-side Inspector: two replay panels showing different runs of the same mission
- Buffer state comparison: matching slot layouts with different entry contents highlighted in amber
- Pathfinding overlay: ghost trails showing the Striker's movement path in each run

---

## Recommendation Summary

**Approach F (Progressive Reveal)** is the recommended design:

1. **Missions 1-4:** Black box. Nearest-first observations, arrival-order hooks. Player never sees it.
2. **Missions 5-7:** Inspector reveals insertion order annotations. Diagnostic, not planning.
3. **Missions 8-10:** Input Priority panel in workbench. Observations vs. hooks toggle + channel priority drag list. Channel names never affect ordering.
4. **Gauntlet:** Perception cone (facing direction affects observation order) as mastery option.

The channel-naming exploit is eliminated by design: channel names are cosmetic identifiers, never priority inputs. The FIFO-inversion insight (expendable data enters first, precious data enters last) becomes a mid-campaign learning moment that teaches real queue theory through gameplay.

The core principle: **deterministic but initially invisible systems should be progressively revealed through diagnostic tools before becoming configurable.** The player should understand the system by OBSERVING its effects (Inspector) before they're given the power to CONTROL it (Input Priority panel). See it, then tune it.

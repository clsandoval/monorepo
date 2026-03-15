# 2.01 — Fixed-Slot Buffer: N Discrete Slots, Oldest Evicted First

## The Option

Every unit in Robot Uprising has a **fixed-size working memory buffer** — a linear array of N discrete slots, where each slot holds exactly one piece of information (an observation, a received message, or a processed signal). When the buffer is full and new information arrives, the **oldest entry is evicted first** (FIFO — First In, First Out). The player never directly manipulates the buffer during execution. Instead, they configure its *size* and *eviction policy* during the Plan phase, then watch their configuration succeed or fail during Sealed Watch.

This is the **simplest possible buffer model** — the baseline against which all other buffer variations (priority queues, typed partitions, sliding windows, tagged retention) must justify their additional complexity.

### Mechanical Specification

**Buffer as linear array:**
- Each unit has a buffer of N slots (Scout: 6, Striker: 8, Relay: 12, Specialist: 10, Command: 14)
- Each slot holds one **datum** — a structured packet containing: `{source_agent, channel, signal_type, payload, tick_created, tick_received}`
- Slots are indexed 0 to N-1, where slot 0 is the **oldest** entry and slot N-1 is the **newest**
- The buffer is a strict FIFO queue: new data enters at position N-1, all existing data shifts left by one position, and the datum in slot 0 is evicted (dropped permanently)

**What fills the buffer:**
- **Observations:** Each tick, a unit's perception system generates observations based on what's within its perception radius. Each enemy or terrain feature within range produces one datum. A Scout with perception radius 5 on a crowded board might generate 4-6 observations per tick.
- **Hook messages:** Signals received on channels the unit is listening to. Each incoming signal = one datum. A Relay listening on 4 channels could receive 0-8 messages per tick.
- **Self-generated signals:** Some skills (compress, filter) produce output data that temporarily occupies a buffer slot before being forwarded.

**Tick-level buffer lifecycle:**
1. **Perceive:** Unit generates observations from its perception radius. Each observation enters the buffer as one datum.
2. **Receive:** Hook messages from other units arrive. Each message enters the buffer as one datum.
3. **Evaluate:** Unit's rules evaluate against current buffer contents (all N slots). First matching rule fires.
4. **Transmit:** Hook triggers send data on channels. The sent data remains in the sender's buffer (it was already there).
5. **Evict:** If buffer exceeded capacity during steps 1-2, excess data was evicted FIFO during insertion.

**Critical detail — simultaneous arrival:** When multiple data arrive in the same tick (say, 3 observations and 2 hook messages = 5 new data on a buffer with only 2 free slots), the insertion order is deterministic:
1. Observations first, in clockwise scan order from North
2. Hook messages second, in channel alphabetical order
3. First 2 data fill the free slots; remaining 3 cause 3 evictions from the oldest end

**What the player configures (Plan phase):**
- Buffer size is fixed per unit type (not configurable) — this is a unit selection decision
- Which channels to listen to (listen/ignore toggles) — fewer channels = fewer incoming messages = less buffer pressure
- Which skills are active — some skills consume buffer space (compress outputs a compressed datum)
- Rule ordering — determines which buffer contents get acted on first
- Eviction policy: in the baseline FIFO model, eviction is automatic. Player cannot change eviction order — that's a variation explored in other aspects (2.06, 2.07)

### Why FIFO Is the Default

FIFO eviction — always drop the oldest datum — is the **most intuitive** policy for a reason deeply connected to the game's metaphor. In real AI agent systems, context windows evict oldest tokens by default. ChatGPT conversations lose their earliest messages first. This is the natural baseline.

FIFO also creates the game's **central tension without requiring explicit player understanding:**
- Fresh information is always available (newest observations are always in the buffer)
- Historical context is always at risk (old but potentially important data gets pushed out)
- The player's job becomes managing the *rate of information flow* into the buffer, not the eviction itself

The player doesn't think "I need to configure eviction." They think "my Scout is forgetting things too fast" or "my Striker is drowning in irrelevant observations." The solution is upstream: change what the unit perceives, which channels it listens to, how many hooks feed it. The buffer is the bottleneck; the player engineers around it.

### The Buffer Bar — Visual Representation

During Sealed Watch, each unit displays a **buffer bar** — a tiny horizontal strip at the bottom of the unit's tile on the 8x8 grid.

**Visual design:**
- The bar is divided into N segments (6 for Scout, 14 for Command), each representing one slot
- Each segment is a 2-pixel-tall rectangle, colored by **data type:**
  - 🟢 Green: observation (self-generated from perception)
  - 🔵 Blue: received hook message
  - 🟡 Yellow: self-generated processed signal (from compress/filter skills)
  - ⬛ Dark gray: empty slot
- Segments glow brighter when newly filled (this tick) and dim as data ages
- When the buffer is full and evicting, a tiny red pip flashes at the left edge of the bar — the "eviction flash." Blink and you miss it. But over 30 ticks, a constantly flashing left edge tells you this unit is hemorrhaging information.

**The eviction flash is the game's most important micro-animation.** It's the visual equivalent of a server log showing dropped packets. Players who learn to read the eviction flash during Sealed Watch can diagnose buffer overload problems before they even reach the Inspector.

**Inspector deep dive:**
In the Inspector phase, clicking a unit at any tick shows the full buffer state:
- All N slots rendered as horizontal bars, left (oldest) to right (newest)
- Each bar shows the datum's source, channel, content summary, and age (ticks since creation)
- Evicted data shown as faded ghost entries below the buffer, with a red ✕ — "this data existed but was pushed out"
- A scrubber lets you step through ticks and watch data flow through the buffer like watching packets flow through a network trace

### The Information Architecture Problem

The fixed-slot buffer creates **the game's central strategic question:** how do you ensure the *right* information is in the buffer at the *right* time?

Consider a Scout with 6 buffer slots. On tick 12, the Scout:
- Observes 3 enemies in its perception radius (3 observations)
- Receives 2 hook messages from a Relay (2 messages)
- Has 1 old observation from tick 10 still in buffer

That's 5 new data + 1 existing = 6 total. Buffer is exactly full. No eviction. The Scout's rules can evaluate all 6 pieces of information and make an informed decision.

Now tick 13: the Scout moves and sees 4 enemies. Plus 2 more hook messages arrive.
- 6 new data. Buffer already has 6. All 6 old data evicted. The Scout has completely forgotten everything from tick 12.

This is **context window catastrophe** — the same phenomenon that plagues real AI systems. The Scout had a perfectly informed state and lost it all in one tick because the information flow rate exceeded buffer capacity.

**Player solutions (all configurable in Plan phase):**
1. **Reduce perception:** Turn off non-essential observation skills so the Scout generates fewer observations
2. **Reduce listening:** Toggle off channels the Scout doesn't need, reducing incoming hook traffic
3. **Add a Relay:** Interpose a Relay between sources and the Scout. The Relay's `compress` skill can combine 3 messages into 1, reducing downstream buffer pressure
4. **Use a bigger unit:** Replace the Scout (6 slots) with a Specialist (10 slots) for missions where information density is high

Each solution has costs. Reducing perception makes the Scout blind to flanking enemies. Reducing listening cuts it off from the network. Adding a Relay adds signal latency (1 tick per hop) and costs resources. Using a bigger unit costs more minerals and energy. **There is no free solution to the buffer problem.** This is the game.

## Player Journeys

#### Journey: Mei, 14, First Strategy Game

**Context:** Mission 2 (the second tutorial mission, teaching context/buffers). Mei has completed Mission 1 where she placed a single Scout with one rule ("if enemy visible → move away") and watched it survive. Mission 2 introduces a second Scout and a hook connecting them. She's never played a strategy game before. She plays on her phone in portrait mode, lying on her bed.

**Minute 0:00 — The Briefing**
The boot log terminal scrolls: `SUBSYSTEM: shared_awareness // INITIALIZING... two perception nodes, one channel, one problem.` Mei reads it, not fully understanding, but the word "problem" makes her curious. The Plan screen appears: 8x8 board on the left (small but clear on phone), workbench panel on the right.

Two Scouts are pre-placed on the board. Scout-A at C3, Scout-B at F6. Both have the same config from Mission 1: one rule, no hooks, 6-slot buffer. Three enemies are scattered on the right side of the board, out of Scout-A's perception range but visible to Scout-B.

**Minute 0:30 — The Problem Appears**
A glowing tutorial tooltip appears on Scout-A: "This Scout can't see the enemies. It doesn't know they're there." Mei taps Scout-A. The workbench shows its buffer: 6 empty gray slots. She taps Scout-B. Its buffer shows 3 green slots — the 3 enemy observations.

The tooltip continues: "Scout-B can see them. But Scout-A doesn't know what Scout-B knows. How do you share?"

**Minute 1:00 — The Hook Introduction**
The tutorial highlights the Hook section of Scout-B's config. "Add a hook: when Scout-B sees an enemy, send a message on channel 'danger'." Mei taps and the hook appears: `ON enemy_spotted → SEND "danger"`. On the board, a faint blue line appears from Scout-B, floating in space — the channel has no listener yet.

"Now open Scout-A. Tell it to listen to channel 'danger'." Mei taps Scout-A, goes to Context Config, toggles "danger" to Listen. The blue line snaps from Scout-B to Scout-A. A faint pulse travels along it — the connection is alive.

**Minute 1:30 — First Execute**
Mei hits EXECUTE. The Sealed Watch begins. The board centers, tick clock appears. Tick 1: both Scouts stand still. Scout-B's buffer bar shows 3 green segments (enemy observations). Scout-A's bar is empty.

Tick 2: Scout-B's hook fires. A blue pulse travels from Scout-B toward Scout-A. Scout-A's bar gains 1 blue segment — the message arrived. Mei leans forward. "It knows!"

Tick 3: Scout-A's rule fires ("if enemy visible → move away"). But wait — the rule says "enemy visible," and the datum in the buffer is a *message*, not a direct observation. The Scout doesn't move. The enemies advance.

Tick 8: The enemies reach Scout-A. It's eliminated. Buffer bar goes dark.

**Minute 2:30 — The Lesson**
The Inspector phase begins. Mei taps Scout-A at tick 2. The buffer shows: slot 0 has a blue datum — `source: Scout-B, channel: danger, payload: {enemy at G5}`. But the rule says "if enemy_spotted" which checks for green (observation) data, not blue (message) data. The tooltip explains: "Scout-A received the message but didn't have a rule to act on messages. It only knew how to react to what it sees directly."

Mei goes back to Plan. She adds a second rule to Scout-A: `IF message_received ON "danger" → move_away_from(payload.position)`. She hits EXECUTE again. This time, on tick 3, Scout-A starts moving. It survives.

**Minute 4:00 — The Buffer Flash**
On her third run (she adjusted Scout-B to send messages every tick instead of just on first sight), Mei notices something during Sealed Watch: Scout-A's buffer bar is completely filled — 6 blue segments, no green. And the left edge is flashing red every tick. She doesn't know what that means yet, but it looks bad.

In the Inspector, she sees: Scout-B is sending 3 messages per tick (one for each enemy), and Scout-A's buffer fills up immediately. Scout-A's own observations (the floor beneath it, the walls nearby) are being evicted — pushed out by the flood of messages. Scout-A is so busy processing Scout-B's intelligence that it's blind to its immediate surroundings.

The tutorial doesn't explain this yet. Mei just sees that it's weird that the bar is all blue and flashing red. She moves on, but the image sticks. She'll recognize it again in Mission 4 when buffer management becomes the explicit lesson.

**UI Annotations:**
- Buffer bar: 24px wide × 4px tall, bottom of unit tile, divided into 6 colored segments
- Eviction flash: 2px red pip at left edge of buffer bar, 100ms on/100ms off per evicted datum
- Channel wiring: 1px blue line with traveling pulse (2px dot, 0.5s transit time), follows straight-line path between units
- Tutorial tooltip: semi-transparent dark panel with monospace text, anchored below the relevant unit, tap-to-dismiss

---

#### Journey: Diego, 31, Software Engineer (Backend Python)

**Context:** Mission 5 — the first factory mission. Diego has completed the tutorial arc (Missions 1-4). He's comfortable with rules, hooks, and channels. He now has a base that produces units from blueprints. He's playing on PC, dual monitor (game on left, Slack on right, half-paying attention to a thread about Redis cache eviction policies).

**Minute 0:00 — Factory Online**
The Plan screen shows the base at A1, a production queue (conveyor belt strip at bottom), and the workbench on the right. Diego has designed three blueprints: Scout-Alpha (perception-focused, 2 hooks sending on channel "intel"), Relay-Bridge (listens to "intel", compresses, sends on "processed"), and Striker-Vanguard (listens to "processed", one rule: `IF processed_signal contains threat → engage nearest enemy`).

Diego places the blueprints in the production queue: Scout, Relay, Striker, Scout, Striker. The conveyor shows 5 icons sliding left. Ghost units appear on the board showing where each will deploy. The channel map panel (read-only, auto-generated from hooks) shows: `intel → Relay-Bridge → processed → Striker-Vanguard`. Clean two-hop chain.

**Minute 1:00 — The Intel Flood**
Diego hits EXECUTE. For 15 ticks, things go smoothly. Scout-Alpha deploys, starts patrolling, sees enemies, sends observations on "intel." Relay-Bridge receives them, compresses three observations into one processed signal, forwards on "processed." Striker-Vanguard receives, locks on, engages.

Tick 16: the second Scout-Alpha deploys. Now *two* Scouts are sending on "intel." Relay-Bridge's buffer (12 slots) starts filling faster. Tick 18: Relay gets 4 observations from Scout-A and 3 from Scout-B = 7 new data per tick. Buffer has 12 slots. Still okay — 5 old slots evicted, 7 new arrive, plus the Relay's own compressed output occupying 2 slots.

Tick 22: enemies cluster near both Scouts. Now Scout-A sends 5 observations and Scout-B sends 4. That's 9 incoming messages on a 12-slot buffer that already has the Relay's own 2 compressed signals in progress. The buffer bar on the Relay starts flashing red on the left edge — every tick, 3-4 old data are evicted before the Relay can process them.

Diego notices the flash from the corner of his eye. "Huh. That Relay is busy." He thinks of Redis: maxmemory-policy. allkeys-lru. The Relay is doing allkeys-lru and it doesn't have enough memory.

**Minute 2:00 — The Downstream Starvation**
Tick 25: the second Striker deploys. Now two Strikers are listening to "processed." But the Relay, overwhelmed by input, is only managing to compress and send 1 processed signal every 2 ticks (its compress skill processes 3 inputs into 1 output, but inputs are evicting before they can be compressed). The Strikers' buffers are half-empty — 4 of 8 slots occupied. They're starving for actionable intelligence while the Relay drowns in raw data.

Tick 30: an enemy flanks around and eliminates Striker-Vanguard-2 from behind. The Striker never saw it because the observation was in Scout-B's buffer, sent to the Relay, evicted from the Relay before compression, and never forwarded to "processed." The Relay dropped the packet.

Diego's brain lights up. "That's a dropped packet. The Relay is a bottleneck in the pipeline. I need to either shard the Relay or increase its buffer." He pauses. "Wait — I can't increase buffer. It's fixed at 12. I need two Relays." He immediately thinks of load balancing: Scout-A → Relay-West, Scout-B → Relay-East, both Relays → Strikers. The architecture scales horizontally.

**Minute 3:30 — The Inspector Confirms**
In the Inspector, Diego clicks the Relay at tick 25. The buffer display shows 12 slots, all occupied, with a graveyard of 8 evicted data below (red ✕ marks). He clicks each evicted datum: "Scout-B: enemy at G7, tick 23." "Scout-A: enemy at D4, tick 22." These are the signals that never made it through.

He traces the signal path: Scout-B observed enemy at G7 on tick 23 → sent on "intel" → arrived at Relay on tick 24 → entered buffer slot 11 → evicted on tick 25 before compress could process it (compress processes from slot 0, the oldest — but slot 0 was already 3 ticks old and irrelevant).

"The compress skill reads from the oldest end of the buffer, but the oldest data is already stale by the time it gets there. The freshest data is at the newest end but compress never reaches it because more data keeps pushing in." Diego stares. This is the producer-consumer problem. The consumer (compress) is too slow for the producer (two Scouts).

**Minute 5:00 — The Horizontal Scaling Fix**
Back in Plan, Diego creates two Relay blueprints: Relay-West (listens to "intel-west") and Relay-East (listens to "intel-east"). He reconfigures Scout-A to send on "intel-west" and Scout-B to send on "intel-east." Both Relays send their compressed output on "processed." The channel map now shows a fan-in pattern: two input channels, two Relays, one output channel.

He re-executes. The Relays' buffer bars stay healthy — green and blue segments, no red eviction flashing. The Strikers receive steady compressed intelligence from both sides. The flanking enemy is spotted, compressed, forwarded, and engaged.

Diego screenshots the channel map and posts it to his team's Slack: "This game is literally teaching distributed systems architecture and I'm here for it."

**UI Annotations:**
- Relay buffer bar: 24px wide × 4px tall, 12 segments, at the bottom of the Relay's tile (Relay is stationary, so the bar never moves)
- Channel map panel: right sidebar, auto-generated directed graph, nodes = blueprints, edges = channels with labels, hover highlights corresponding wiring on board
- Inspector buffer view: full-width panel, 12 horizontal bars (each 40px wide × 16px tall), color-coded, datum summary text on hover, evicted data shown as faded bars below with red ✕
- Eviction flash rate: proportional to eviction rate. 1 eviction/tick = gentle pulse. 5+ evictions/tick = rapid strobe that's visible from across the room.

---

#### Journey: Priya, 47, High School CS Teacher

**Context:** Mission 7 — Command agent introduced. Priya has been playing for a week, using the game to prepare examples for her AP Computer Science class. She's thinking about how the buffer model maps to OS concepts (caches, page replacement, process scheduling). She plays on her school laptop during her free period.

**Minute 0:00 — The Meta-Level**
Priya's architecture is sophisticated: 2 Scouts feeding 2 Relays feeding 3 Strikers, all coordinated through 4 channels. But she's hit a ceiling — the 3 Strikers sometimes chase the same enemy because they all receive the same "processed" signal and all have the same rule (`IF threat → engage nearest`). She needs *coordination*.

The mission introduces the Command unit: 14-slot buffer, 6 hook slots, stationary, with skills `reassign`, `reroute`, and `prioritize`. The Command unit doesn't fight. It manages.

Priya places the Command at B2 (near the base, safe from combat). She wires it to listen on "processed" (same channel as the Strikers) and a new channel "striker-status" (where Strikers report their current action).

**Minute 1:00 — The Buffer as Decision Surface**
Priya configures the Command's rules:
1. `IF buffer contains 2+ threat signals at same location → SEND "converge {location}" on "orders"`
2. `IF buffer contains threat signals at 3+ different locations → SEND "spread" on "orders"`
3. `IF buffer contains striker-idle signal → SEND "patrol {random_sector}" on "orders"`

Each rule evaluates against the Command's 14-slot buffer. The buffer is the Command's entire awareness of the battlefield. It sees nothing directly (0 perception radius). Everything it knows comes from messages.

Priya realizes: **the Command unit's buffer IS the situation room.** The 14 slots are the 14 pieces of intelligence the commander has access to at any moment. Old intelligence scrolls off the bottom. The commander is always making decisions based on the most recent 14 reports.

**Minute 2:00 — The Staleness Problem**
She hits EXECUTE. For 20 ticks, the Command works beautifully. It coordinates Strikers to converge on clusters and spread against dispersed threats. But on tick 21, something goes wrong.

Tick 21: Striker-1 eliminates an enemy at E5. But the Command still has the "threat at E5" signal in buffer slot 3 (it arrived on tick 18, it's 3 ticks old). The Command sends "converge E5" again. Striker-2 and Striker-3 abandon their positions and rush to E5 — where there's nothing.

Tick 24: enemies that were being held at bay by Striker-2 and Striker-3 advance into undefended territory.

Priya recognizes the problem instantly: **stale cache.** The Command is acting on data that's 3 ticks old. In those 3 ticks, the battlefield changed completely. The threat at E5 was eliminated, but the Command doesn't know because no one sent an "all clear" message.

**Minute 3:00 — The TTL Solution**
In the Inspector, Priya examines the Command's buffer at tick 21. Slot 3: `{source: Relay-East, channel: processed, payload: threat at E5, tick_created: 18, tick_received: 19}`. The datum is 3 ticks old. She scrolls forward: it doesn't get evicted until tick 25 because incoming data isn't fast enough to push it out.

"I need a TTL," she murmurs. "Time To Live. Data should expire after 2 ticks regardless of buffer pressure." But in the fixed-slot FIFO model, there is no TTL. Data stays until evicted by newer data.

Priya's solution: increase the information flow deliberately. She adds a periodic "heartbeat" hook to each Scout: every tick, send a "sector clear" or "sector threat" message on a new channel "heartbeat." The Command listens to "heartbeat." Now the Command receives 2 messages per tick (one from each Scout) plus whatever comes on "processed." The 14-slot buffer fills and cycles faster. Old data is evicted within 3-4 ticks instead of lingering for 7+.

The cost: more buffer pressure on the Command, more EM emissions from the heartbeat hooks (enemies might detect the extra radio chatter), and the heartbeat signals consume buffer slots that could hold actionable intelligence.

"It's the same tradeoff as polling vs. event-driven," Priya writes in her teaching notes. "The heartbeat creates currency but adds overhead. In a real system, you'd use TTLs. In the game, you engineer TTLs by controlling flow rate."

**Minute 5:00 — The Classroom Analogy**
Priya runs it again. The Command now cycles its buffer every 4-5 ticks instead of every 8-10. Stale data is pushed out faster. The "converge on dead threat" problem disappears. She wins the mission.

She opens a Google Doc and starts writing: "Lesson Plan: Cache Eviction Policies. Warm-up: Play Mission 7 of Robot Uprising. Students will experience the consequences of stale cache entries before we formalize LRU, FIFO, and TTL as page replacement algorithms. Key question: Why did the Commander send troops to a location where the enemy was already eliminated?"

**UI Annotations:**
- Command buffer bar: 24px wide × 4px tall, 14 segments — notably wider than other units' bars, visually distinguishing the Command as an information hub
- Command buffer in Inspector: 14 slots displayed as a table with columns: Slot #, Source, Channel, Payload Summary, Age (ticks), and a color-coded age gradient (white = fresh, yellow = 2 ticks, orange = 4 ticks, red = 6+ ticks)
- "Heartbeat" channel wiring: thin pulsing lines from each Scout to Command, distinct from the "intel"/"processed" channels by using a different color (cyan vs. blue)

---

#### Journey: Kwame, 27, Twitch Streamer (4,200 followers, variety gaming)

**Context:** Mission 9 — the penultimate mission, full factory-vs-factory combat. Kwame has been streaming the game for a week, getting increasingly obsessed. His chat has developed vocabulary around the game's mechanics. Chat calls buffer overload "getting brainfried" and eviction flashes "red-lining." He's playing on PC with a face cam.

**Minute 0:00 — The Architecture That Should Work**
Kwame has built what he calls "The Hydra" — a Command unit managing 6 Scouts, 4 Relays, and 8 Strikers through an intricate 7-channel network. Chat has been helping him optimize it over the last 3 missions. The channel map looks like a circuit diagram.

"Chat, we're running The Hydra against the factory mission. This thing has NEVER lost." He hits EXECUTE.

**Minute 0:30 — The Beautiful Machine**
For the first 30 ticks, The Hydra is gorgeous. Scouts fan out, feeding intelligence to Relays, which compress and forward to Strikers via the Command's routing. Buffer bars across the army are healthy — mostly green and blue, cycling smoothly, no red-lining.

Chat is vibing: `EZ clap` `the buffer bars look CLEAN` `no redline = no problem`

**Minute 1:00 — The Enemy Factory Kicks In**
Tick 35: the enemy factory starts producing units. Suddenly there are 12 enemy units on an 8x8 board. The Scouts' perception radii are saturated — each Scout sees 4-5 enemies. Scout-A is generating 5 observations per tick into a 6-slot buffer. It's already red-lining.

Tick 38: the Relays are drowning. Relay-North has 12 slots and is receiving 10+ messages per tick from 3 Scouts. The entire left side of every Relay's buffer bar is strobing red. Kwame's face on the cam shows the exact moment he realizes: "Chat... The Hydra can't handle this many enemies. The buffers are all full."

Chat explodes: `BRAINFRIED` `BRAINFRIED` `THE HYDRA IS COOKED` `too many enemies not enough brain`

**Minute 1:30 — The Cascade Failure**
Tick 42: the Command unit's buffer — the crown jewel at 14 slots — starts red-lining. It's receiving compressed signals from 4 Relays, status reports from 8 Strikers, and heartbeats from 6 Scouts. That's potentially 18 messages per tick into a 14-slot buffer. Important tactical updates are being evicted before the Command can process them.

Tick 45: the Command issues a "converge" order based on a 4-tick-old threat report. 3 Strikers converge on empty space. The enemies walk through the gap. Kwame watches two Strikers get flanked and eliminated.

"No no no no — the Command is reading OLD DATA. The buffer is cycling too fast, it can't keep up!" Kwame's hands are on his head. Chat is going wild: `L + FIFO` `should have used two commands` `THE HYDRA HAS TOO MANY HEADS`

**Minute 2:00 — The Death Spiral**
As units die, the architecture degrades. Fewer Scouts means less intelligence. But the surviving Scouts are seeing MORE enemies (because there are more enemies now). The Relays are still saturated. And the Command, with fewer subordinates reporting, is actually *less* overloaded — but the intelligence it receives is less complete.

Tick 55: the enemy reaches Kwame's base. The Hydra collapses. "GG." Kwame stares at the defeat screen.

Chat: `F` `the buffer giveth and the buffer taketh` `we need The Hydra 2.0 — distributed command` `SPLIT THE BRAIN`

**Minute 3:00 — The Inspector Post-Mortem**
Kwame enters the Inspector. He scrubs to tick 42 — the moment the Command started issuing bad orders. He clicks the Command unit. The buffer display shows 14 slots, all occupied:

| Slot | Source | Channel | Payload | Age |
|------|--------|---------|---------|-----|
| 0 | Relay-N | processed | threat at F7 | 4 ticks |
| 1 | Striker-3 | status | engaging E6 | 3 ticks |
| 2 | Scout-D | heartbeat | sector clear G-H | 3 ticks |
| 3 | Relay-E | processed | threat at C5 | 2 ticks |
| ... | ... | ... | ... | ... |
| 13 | Scout-A | heartbeat | sector threat A-B | 0 ticks |

Below the buffer: 6 evicted data marked with red ✕. He clicks one: `Relay-S: processed: threat at D3, tick 41`. This was the signal that would have warned the Command about the flanking maneuver. It arrived at the Command on tick 42, entered slot 13, but was evicted on tick 43 before the Command's rules could process it — because 3 more heartbeats arrived in the same tick.

"CHAT. The heartbeats killed us. The heartbeats are taking up too many buffer slots and pushing out the actual combat intel. The heartbeats are the problem." He clips the Inspector view. "We created the TTL solution and the TTL solution ITSELF is flooding the buffer."

Chat: `ironic` `you became the thing you swore to destroy` `the heartbeat is the heartattack` `adaptive heartbeat when??`

**Minute 5:00 — The Redesign**
Back in Plan, Kwame redesigns. "Chat, new plan. The Hydra is dead. Long live The Federation." He creates two Command units — Command-West and Command-East — each managing half the army. He removes heartbeats from all units ("we'll deal with staleness differently — maybe by using Relays as TTL proxies"). He splits the channel namespace: `intel-west`, `intel-east`, `orders-west`, `orders-east`.

"This is literally distributed systems. We're going from monolithic to microservices." Chat: `kubernetes uprising` `he's sharding the brain`

**UI Annotations:**
- Buffer bar strobe rate at maximum overload: left-edge red pip at 5Hz (5 flashes per second), visible even in peripheral vision
- Inspector buffer table: scrollable, 14 rows with alternating gray/white backgrounds, age column uses gradient coloring
- Evicted data section: collapsible panel below buffer table, default collapsed (shows "6 evicted signals — tap to expand"), data shown at 50% opacity with red ✕ overlay
- Stream overlay potential: the buffer bar is small enough to be visible in 720p stream but detailed enough to be analyzed in 1080p inspector clips

## Strengths

1. **Radical simplicity.** FIFO eviction requires zero player configuration. The buffer is invisible infrastructure until it fails — exactly like real-world caches, queues, and context windows. Players who never think about buffers can still play (their architects will just be inefficient). Players who master buffer management gain enormous advantage.

2. **Universal metaphor.** "Newest data pushes out oldest data" is how human short-term memory works, how browser tabs work, how chat scrollback works. Every player has an intuition for this even if they've never played a strategy game.

3. **Creates the right strategic decisions.** Buffer size is fixed per unit type, so the player can't solve problems by "just making the buffer bigger." They must solve problems architecturally — reduce input, add intermediaries, split workloads, improve signal quality. These are the decisions that make the game feel like real engineering.

4. **Visceral failure mode.** When a buffer overloads, you see it: the bar turns red, the unit starts making bad decisions based on stale data, downstream units starve. The failure is legible. You can point at the Relay and say "THAT'S the bottleneck." Into the Breach-level cause-effect clarity.

5. **Scales with player skill.** Beginners ignore buffers and play with default configs. Intermediate players notice red-lining and start managing channel subscriptions. Advanced players design architectures specifically to control information flow rates. Experts build Command units that monitor buffer health of subordinates and dynamically reroute traffic. Same mechanic, four skill levels.

6. **Maps to real engineering.** FIFO buffers, producer-consumer problems, message queue overflow, cache eviction, dropped packets — this is a computer science curriculum delivered through gameplay. The vocabulary transfers directly.

## Weaknesses

1. **FIFO is indiscriminate.** The oldest datum is evicted regardless of importance. A 3-tick-old "enemy approaching your base" observation is evicted in favor of a brand-new "terrain is flat here" observation. The player has no way to tell the buffer "keep the important stuff." This frustration is intentional (it drives players toward architectural solutions) but can feel arbitrary and punishing for beginners.

2. **No TTL mechanism.** As Priya discovered, stale data can linger in an under-pressured buffer for many ticks. The player must engineer their own TTL through flow-rate manipulation (heartbeats, periodic signals). This is elegant but non-obvious — many players may never discover it.

3. **Simultaneous arrival ordering is opaque.** When 5 data arrive in the same tick, the insertion order (clockwise observations first, alphabetical channels second) is deterministic but arbitrary from the player's perspective. Understanding *why* a specific datum was evicted requires understanding insertion order, which is a hidden complexity layer.

4. **No partial information.** Each slot holds one complete datum or nothing. There's no concept of "degraded" data, signal strength, or confidence level (in the pure FIFO model). This simplifies the mechanic but loses the richness of real information systems where data quality varies.

5. **Buffer sizes are non-configurable.** Scout is always 6, Command is always 14. The player cannot trade other stats for more buffer. This means unit selection is the primary buffer management lever, which reduces build diversity (every "information-heavy" mission pushes players toward Relays and Commands).

## Interaction Effects

**With Rules (building-blocks/rules-language.md, building-blocks/rule-conflicts.md):**
Rules evaluate against buffer contents. In the fixed-slot model, a rule that checks for "any threat signal" scans all N slots linearly. Rule ordering interacts critically with buffer state — if the first matching rule fires, and the buffer's newest entry (slot N-1) is a heartbeat message, a rule prioritizing heartbeats will fire before a rule prioritizing threats, even if there's a threat in slot 0. This creates a subtle priority-inversion problem where rule ordering and buffer ordering interact in non-obvious ways.

**With Hooks (building-blocks/hook-taxonomy.md):**
Hooks are the primary mechanism for filling buffers. More hooks = more incoming messages = more buffer pressure. The fixed-slot model punishes over-wired agents — a unit with 4 active hooks listening on 4 channels will receive 4x the messages of a unit with 1 hook. Hook-heavy architectures require bigger buffers (Relay at 12, Command at 14) to function, which is why the unit stat table exists as it does.

**With Signal Latency (locked: 1 tick per hop):**
In a 2-hop chain (Scout → Relay → Striker), a signal spends 1 tick in the Relay's buffer before being forwarded. During that tick, other data may arrive and push the signal toward the eviction end. In extreme cases, a signal arrives at the Relay, gets pushed to slot 0 by a flood of new data in the same tick, and is evicted on the next tick before the Relay's compress skill can process it. This is the **transit eviction** problem — data dies in transit.

**With Sealed Watch (locked: no skip, no pause):**
The fixed-slot buffer bar is the primary "health indicator" during Sealed Watch. Because the player can't pause or inspect during the sealed phase, the buffer bar's visual language (color, fill level, eviction flash rate) must communicate buffer state at a glance. FIFO's simplicity helps here — the bar is always oldest-left, newest-right, which creates a consistent visual flow direction.

**With Emissions Model (locked: hook transmissions emit EM noise):**
More hooks = more buffer pressure AND more EM emissions. The fixed-slot model creates a natural constraint on information architecture density: even if you could wire every unit to every other unit, the combined buffer pressure and emission noise would make the architecture self-defeating. This is the **attention paradox** — the more you try to know, the less effectively you can use what you know, AND the more visible you become.

**With One-Shot-One-Kill (locked):**
Because combat is instant (adjacent striker = elimination), stale buffer data is catastrophically dangerous. If a Commander directs a Striker based on a 4-tick-old threat position, and the enemy has moved, the Striker walks into an ambush. In a game with HP and gradual damage, stale data means suboptimal damage. In one-shot-one-kill, stale data means death. The fixed-slot FIFO model's staleness problem is amplified by the lethality model.

## Comparable Games and Systems

**TIS-100 / Shenzhen I/O (Zachtronics):**
TIS-100's compute nodes have exactly 2 registers (ACC and BAK) — the most extreme fixed-slot buffer imaginable. When data needs to flow through a node, it must be read from a port into ACC, processed, and written to another port. There is no queue; if data arrives when ACC is full, the write *blocks* until ACC is free. Robot Uprising's FIFO model is more generous (6-14 slots) but draws the same design lesson: **constrained storage creates interesting routing problems.** The key difference: TIS-100 blocks (sender waits), Robot Uprising drops (data is lost). Dropping is more dangerous but more realistic — real distributed systems don't block on full queues, they drop packets.

**Screeps:**
Screeps gives each player 2 MB of total memory (JSON-serialized between ticks). Individual creeps don't have buffer limits, but the global cap forces players to be strategic about what to remember. The parallel to Robot Uprising: Screeps' memory constraint is global (one pool shared across all units) while Robot Uprising's is per-unit (each unit has its own independent buffer). Per-unit buffers create more interesting local optimization problems but prevent global memory pooling strategies.

**Gladiabots:**
Gladiabots' bots have no persistent memory between decisions — they re-evaluate their full decision tree every tick against the current world state. The closest analog to Robot Uprising's buffer is Gladiabots' **tag system**: bots can tag entities with labels that persist between ticks. Tags serve as a crude 1-bit-per-entity memory ("I marked this enemy as my target"). Robot Uprising's fixed-slot buffer is dramatically richer — it stores full structured data packets with provenance and age — but Gladiabots proves that strategy games can work with almost zero agent memory. The depth comes from the decision logic, not the memory size.

**Real-world LLM context windows:**
The most direct analog. GPT-4's 128K context window, Claude's 200K context window — these are fixed-slot buffers where each token is a slot. When the context is full, oldest tokens are evicted (in practice, conversations are truncated or summarized). The game's fixed-slot buffer is a physical simulation of this phenomenon at a scale humans can reason about (6-14 slots instead of 128,000 tokens). Players who master buffer management in the game have genuine intuition for real context window engineering.

**Into the Breach:**
Into the Breach doesn't have buffers, but it shares the "perfect information → imperfect action" pattern. In Into the Breach, you see everything but can only act in limited ways. In Robot Uprising, your units could theoretically perceive everything, but the buffer limits how much they can remember and act on. Both games are about constraint-driven decision-making with full transparency about what the constraints are.

## Sensory Description

**The healthy buffer** looks like a tiny equalizer bar at the bottom of a unit's tile. Six segments for a Scout, fourteen for a Command, each one a hair-thin colored line. Green segments pulse gently, like breathing — observations arriving, being processed, aging out. Blue segments appear as crisp bright flashes when a hook message arrives, then dim over subsequent ticks as they age. The overall effect is a slowly shifting gradient from bright (right/newest) to dim (left/oldest). A healthy buffer feels like watching a slow heartbeat monitor.

**The overloaded buffer** looks like a strobe light. The left edge of the bar flashes red — not a gentle pulse but a hard blink, 5 times per second at maximum overload. The segments are all the same color (typically all blue when hook messages are flooding in) and uniformly bright (because they're all fresh — nothing survives long enough to dim). The overall impression is **agitation** — the unit is drowning. Compare this to a server dashboard showing a Redis cache at 100% utilization with constant evictions: same panic, different pixels.

**The starving buffer** is the opposite: 4 of 8 slots are dark gray (empty). The unit barely knows anything. No eviction flashes — there's nothing to evict. But the empty slots feel *ominous*. A Striker with a half-empty buffer means it's not receiving intelligence. It's operating blind. The dark slots are the absence of information, and in a game about information architecture, absence is dangerous. The few occupied slots glow with unwarranted prominence — the Striker's entire worldview is 4 data points.

**The moment of buffer catastrophe** — when a crucial signal is evicted — has no special animation during Sealed Watch. It's silent. The datum was in slot 0, dim and old, and a new datum pushed it out, and it's gone. You might notice the buffer bar's left segment change color (from blue to green as a message is replaced by an observation), but probably not. The catastrophe is only visible in the Inspector, after the fact, when you click the unit and see the evicted signal in the graveyard below the buffer display, marked with a red ✕. The Inspector's revelation — "THIS is where it went wrong" — is the emotional payoff of the two-act debrief structure. You feel the catastrophe during Sealed Watch (when your Striker dies for no apparent reason). You understand it during Inspector (when you see the dropped signal that would have saved it).

**The sound:** In the audio design (see aesthetics/audio-design.md), the eviction flash has a subtle sonic signature — a quiet click, like a hard drive head parking. One click is nothing. A rapid succession of clicks — tick-tick-tick-tick — means a buffer is hemorrhaging data. During Sealed Watch, the clicks are spatial (louder when the camera is near the overloaded unit). The all-clear sound — a buffer dropping below 50% capacity — is a soft exhale, like a valve releasing pressure.

## The TikTok Clip

**"The Brainfried Relay" (15 seconds):**
A Relay tower stands in the center of the board. Three Scouts surround it, feeding intelligence from all directions. The Relay's buffer bar is a solid wall of blue, left edge strobing red like a fire alarm. The viewer watches the bar for 3 seconds — it's mesmerizing, like watching a server melt down. Then the camera pulls back to show three Strikers standing idle in the corners of the board, buffer bars half-empty, waiting for orders that never come. Cut to: the enemy walking past the idle Strikers and destroying the base. Text overlay: "the relay remembered everything and understood nothing."

## Discovered Aspects

This analysis reveals several sub-aspects for deeper exploration:

- **2.01a — Buffer insertion order as hidden complexity:** The deterministic but opaque ordering of simultaneous arrivals (clockwise observations, alphabetical channels). Should this be visible to the player? Should it be configurable? What happens when a player discovers that renaming a channel from "alpha" to "zzz" changes insertion priority?
- **2.01b — Transit eviction in multi-hop chains:** Signals that arrive at a Relay and are evicted before compression can process them. The "data dies in transit" problem. How common is this in practice? Is it a degenerate case or a core design tension?
- **2.01c — Empty buffer slots as strategic signal:** Half-empty buffers indicate information starvation, which is a different problem than information overload. Can the player deliberately engineer empty slots (buffer headroom) as a strategy? "Always keep 2 slots free for emergency signals."
- **2.01d — Buffer health as spectator readability tool:** The buffer bar as the primary spectator sport indicator. If Robot Uprising becomes streamable/competitive, buffer bars are the "health bars" of the information architecture. Design implications for esports overlay and casting vocabulary.
- **2.01e — The polling-vs-event-driven tradeoff in buffer management:** Priya's heartbeat solution (polling) vs. pure event-driven hooks. The game naturally teaches both patterns through buffer pressure. Formal analysis of when each approach is optimal.

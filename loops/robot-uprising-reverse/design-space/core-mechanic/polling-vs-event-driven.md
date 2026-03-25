# 2.01e — Polling vs. Event-Driven Tradeoff in Buffer Management

**Aspect:** 2.01e — Polling-vs-event-driven tradeoff in buffer management
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

Robot Uprising's attention system gives the player two fundamentally different paradigms for how units gather and act on information: **polling** (heartbeat-style periodic checks) and **event-driven** (hooks that fire reactively when conditions trigger). This is not a UI distinction or a cosmetic flavor — it is the architectural spine of every configuration the player builds. The choice between polling and event-driven approaches shapes buffer pressure, EM signature, responsiveness, and reliability in ways that mirror the exact same tradeoff in production software engineering.

**Polling in Robot Uprising** means a unit performs a periodic scan on a fixed cadence. The player configures a rule like: "Every 3 ticks, check perception range for hostiles." The unit executes this check regardless of whether anything has changed. Each check writes an observation into the buffer — even if the observation is "nothing detected." The unit is rhythmically sampling the world.

**Event-driven in Robot Uprising** means a unit wires a hook to a named channel and waits. Nothing happens until the trigger fires. "When `threat-net` receives a signal → move toward signal origin." The unit consumes zero buffer slots, emits zero EM noise, and takes zero actions until the event arrives. Then it acts immediately.

### The 1:1 Vocabulary Mapping

This is not an analogy. This is the same engineering concept wearing a different skin:

| Software Engineering | Robot Uprising |
|---|---|
| Cron job / polling interval | Heartbeat rule ("every N ticks") |
| Webhook / event listener | Hook wired to channel |
| CPU cycles burned on empty polls | Buffer slots consumed by "nothing detected" observations |
| Webhook delivery failure | Signal dropped at full buffer |
| Polling interval too wide → missed event | Scan cadence too slow → enemy moves between checks |
| Event storm / thundering herd | Multiple scouts firing hooks simultaneously, flooding relay |
| Health check endpoint | Heartbeat ping on `status-net` |
| Dead letter queue | Evicted signals visible in Inspector |

The game does not explain this mapping. The player discovers it through pressure. The missions create situations where one approach breaks, forcing the player to reach for the other — and in doing so, they internalize the engineering tradeoff that every production system designer faces.

---

## Mechanical Specification

### Polling: The Heartbeat Rule

A polling rule has three components the player configures:

1. **Interval** — how many ticks between checks (1 = every tick, 3 = every 3rd tick, 5 = every 5th)
2. **Scope** — what the check examines (perception radius, specific channel buffer contents, self-state)
3. **Action** — what happens with the result (write observation to buffer, fire hook, execute skill)

Each poll cycle generates a buffer entry regardless of outcome. A Scout polling every 2 ticks for enemies in its 5-tile perception radius writes an observation every 2 ticks: either `[T14] ENEMY @ D5, range 3` or `[T14] CLEAR, no contacts`. Both occupy one buffer slot. A Scout with 6 buffer slots polling every 2 ticks fills its buffer in 12 ticks if nothing is evicted.

**EM cost of polling:** Each poll emits a faint EM pulse — the unit is actively scanning. Interval 1 (every tick) emits maximum EM noise. Interval 5 emits one-fifth the noise. The emissions model makes aggressive polling mechanically costly: a Scout scanning every tick is the loudest unit on the battlefield.

### Event-Driven: The Hook Listener

A hook listener has two components:

1. **Trigger** — the channel and optional filter condition (`threat-net`, `threat-net WHERE priority > 3`)
2. **Response** — the action taken when the trigger fires (write to buffer, relay to another channel, execute skill, move)

A hook listener consumes zero resources while idle. No buffer entries. No EM emissions. No tick cost. The unit is silent and dark. When the trigger fires, the incoming signal occupies one buffer slot, and the response action occurs on the next available tick. The response itself may generate EM (if it involves a transmission), but the *listening* is free.

**The gap:** A hook listener that never fires never acts. If the upstream unit that was supposed to fire the hook gets eliminated, the listener waits forever. If the channel is quiet because the scout is dead, the striker configured purely on hooks stands motionless on the battlefield, buffer empty, doing nothing, while enemies walk past.

---

## Strengths and Weaknesses

### Polling Strengths

- **Guaranteed coverage.** A unit polling its perception radius will always see what's there, on schedule. No dependency on another unit's survival or behavior.
- **Predictable buffer consumption.** The player can calculate exactly how fast the buffer fills: `buffer_size / poll_interval = ticks until full`. This makes eviction policy design deterministic.
- **Self-reliance.** A polling unit operates independently. If every other unit dies, the polling scout still scans, still detects, still generates observations. It degrades gracefully.
- **Timing control.** The player chooses the cadence. Interval 1 is paranoid but thorough. Interval 5 is relaxed but efficient. The knob is explicit and tunable.

### Polling Weaknesses

- **Buffer waste.** "Nothing detected" observations consume the same slot as "enemy at D5." On a quiet battlefield, a polling scout fills its buffer with empty scans — and when the enemy finally appears, the critical observation might evict a still-relevant prior sighting.
- **EM noise.** Continuous scanning makes the unit detectable. In missions with enemy detection mechanics (Mission 4+), a polling scout is a beacon.
- **Latency quantization.** If the poll interval is 3 ticks and an enemy appears at tick T+1 (one tick after the last poll), the scout won't see it until tick T+3. Two ticks of blindness. In a one-shot-one-kill game, that enemy reaches striking range before the scout even notices.
- **Wasted compute.** The unit burns its action on a scan even when there's nothing to scan for. During calm periods, it generates noise for no gain — the engineering equivalent of a cron job that runs every minute and does nothing 59 times out of 60.

### Event-Driven Strengths

- **Zero idle cost.** Silent, dark, invisible until triggered. Perfect for stealth missions, ambush configurations, and EM-sensitive scenarios.
- **Instant response.** When the event arrives, the unit reacts on the next tick. No waiting for the next poll cycle. Signal arrives at tick T, action at tick T+1.
- **Buffer efficiency.** The buffer only fills with actionable information. No "nothing detected" entries. Every slot contains something meaningful.
- **Composability.** Hooks chain naturally: Scout fires on `threat-net`, Relay listens on `threat-net` and fires on `strike-orders`, Striker listens on `strike-orders`. The architecture is a pipeline of reactive components — each one dormant until upstream triggers it.

### Event-Driven Weaknesses

- **Single point of failure.** If the upstream emitter dies or its hook breaks, the downstream listener never fires. The striker that only listens on `strike-orders` is useless if the relay is eliminated.
- **Thundering herd.** When the event does fire, everything happens at once. Five scouts spotting the same enemy fire five hooks simultaneously. The relay receives five signals in one tick. Its 12-slot buffer absorbs them, but now 5 of 12 slots contain redundant information. If a second threat appears next tick, the relay has less capacity for novel data.
- **No ambient awareness.** A purely event-driven striker has no idea what's happening around it unless someone tells it. An enemy can approach from an unwatched angle — no scout on that flank, no signal, no reaction. The striker dies having never seen its killer.
- **Debugging opacity.** When a purely event-driven unit fails to act, the debrief question is: "Did the event not fire? Did it fire but get dropped? Did it fire but the filter excluded it? Did the upstream unit die before it could fire?" The causal chain is longer and harder to trace than a polling failure ("the poll ran, it saw nothing, the enemy was 1 tile outside perception range — done").

---

## The Game Naturally Teaches Both Patterns Through Buffer Pressure

This is the core insight. The player does not read a tutorial page titled "Polling vs. Event-Driven Architecture." The game's escalating buffer pressure forces the discovery.

### Phase 1: Naive Polling (Missions 1-3)

The player's first instinct is polling. The tutorial missions give them Scout-Alpha with a heartbeat rule: "Every 2 ticks, scan for enemies." It works. The scout sees threats, writes observations, the player watches the buffer fill with amber pips. The buffer bar rises and falls as entries age out. Simple. Reliable. The player learns to trust the rhythm.

### Phase 2: Buffer Crisis (Mission 4-5)

Mission 4 introduces multiple scouts and a relay. The player configures three scouts, all polling every 2 ticks, all writing observations. The relay listens on `observation-net`. Suddenly the relay's 12-slot buffer is receiving 3 observations every 2 ticks — 1.5 entries per tick on average. In 8 ticks, the relay is full. New observations evict old ones. The relay starts stunting (1-tick freeze on context overload). The striker receives garbled, stale data. The mission fails.

The player stares at the debrief. The Inspector shows the relay's buffer timeline: a solid wall of amber pips, no breathing room, observations piling up faster than they can be processed. The player sees the problem: **polling generates too much data for the relay to handle.**

The fix: switch the scouts from heartbeat polling to event-driven hooks. Instead of "every 2 ticks, scan," the player rewires: "When an enemy enters perception range → fire once on `threat-net`." Now the scouts are silent until they see something. The relay receives signals only when there's actually a threat. Buffer pressure drops from 1.5 entries/tick to near zero during calm periods, spiking only during contact.

### Phase 3: Event-Driven Fragility (Mission 6-8)

The player, now an event-driven convert, builds everything on hooks. Scouts fire on detection. Relays forward on receipt. Strikers engage on orders. The architecture is elegant, efficient, and silent. Then Mission 7 introduces enemy snipers that target scouts first. The flanking scout dies at tick 12. The striker covering that flank receives nothing — no signal, no awareness, no reaction. An enemy column walks through the dead zone and eliminates the command unit.

The debrief shows the gap: a flat line on the dead scout's signal log after tick 12, and the striker's buffer showing zero entries for the entire engagement. The player realizes: **pure event-driven architectures have no fallback.** When the event source dies, the listener is blind.

The fix: hybrid. The striker gets a low-frequency polling rule ("every 5 ticks, scan own perception radius") as a fallback. Normally it stays quiet, responding to hooks. But if 10 ticks pass with no signals, the polling heartbeat keeps it minimally aware. The polling rule has low priority — hook signals always take precedence in the buffer — but it provides a floor of ambient awareness.

### Phase 4: Mastery — Adaptive Switching (Mission 9+)

Advanced players design architectures that switch between polling and event-driven modes based on battlefield state. The Command unit monitors buffer pressure across the squad. When buffer utilization across all units drops below 30% (quiet battlefield), it broadcasts on `mode-net: ACTIVE_SCAN` — scouts switch to polling mode, actively scanning. When buffer utilization climbs above 70% (hot engagement), Command broadcasts `mode-net: LISTEN_ONLY` — scouts stop polling and only fire hooks on new contacts.

This is the **adaptive polling pattern** from real distributed systems: poll when idle, switch to event-driven under load. The game teaches it not through a tooltip but through the pain of buffer overflows in one mode and detection gaps in the other.

---

## Player Journeys

#### Journey: Marcus, 34, DevOps Engineer
**Context:** Mission 5. Marcus has three scouts, one relay, one striker. He's been using polling since Mission 1 and trusts it. He's never wired a hook. His scouts all poll every 2 ticks. He's unlocked the Compress skill on the relay.

**Minute 0:00 — Confident Setup**
Plan screen. Marcus drags three scout blueprints onto the west, center, and east approach corridors. Each has the same heartbeat rule: `EVERY 2 → SCAN → WRITE observation-net`. The relay sits mid-field, subscribed to `observation-net`, running Compress when buffer exceeds 8/12. The striker listens on `strike-orders`. Marcus previews ghost units — the context bars on all three scouts pulse gently with the heartbeat rhythm, ticking up two pips every 4 ticks. The relay's context bar shows a steady amber fill. He thinks it'll hold.

**Minute 0:30 — The Wall of Amber**
Sealed execution. The three scouts patrol their corridors. For the first 20 ticks, the battlefield is quiet. But Marcus's scouts don't know that — they poll dutifully, writing "CLEAR" observations every 2 ticks. The relay's buffer timeline, visible in the spectator view, is a rising tide of amber pips. At tick 16, the relay hits 12/12. A thin red pulse radiates outward from the relay's position — the context overload stun. The relay freezes for one tick. A new observation from Scout-East arrives during the stun and is silently dropped — the pip that would have appeared in slot 12 flickers red and vanishes.

**Minute 1:45 — Contact in the Noise**
Tick 30. Enemies appear on the east corridor. Scout-East polls at tick 30 and writes `ENEMY @ F7, range 4`. The observation enters the relay's buffer — but the buffer is already full of stale "CLEAR" observations from all three scouts. The Compress skill fires, randomly discarding half the buffer. The enemy sighting has a 50% chance of surviving the compress. This run, it survives. But the player watches the Compress animation — six pips disintegrate in a spray of amber particles, and the surviving pips shuffle together — and feels uneasy. That was luck.

**Minute 3:00 — Debrief Revelation**
Mission completes (barely — the striker arrived 2 ticks late because of relay stuns). In the Inspector, Marcus opens the relay's buffer timeline. It's a solid block of amber from tick 1 to tick 40. He clicks individual entries: "CLEAR." "CLEAR." "CLEAR." "ENEMY @ F7." "CLEAR." "CLEAR." Ninety percent of the relay's processing was wasted on empty scans. He sees the Compress events — random deletions that could have killed the one signal that mattered. The Inspector highlights the critical path in gold: Scout-East observation → relay buffer insertion (delayed 1 tick by stun) → Compress (50% survival) → forward to striker. Three failure points, all caused by buffer saturation from empty polls.

Marcus hovers over the hook wiring panel for the first time. He drags a connection from Scout-East's `ON_ENEMY_DETECTED` trigger to `threat-net`. He removes the heartbeat rule. Ghost preview: the scout's context bar flatlines to zero during calm periods. The relay's projected buffer usage drops to near nothing. He rebuilds the mission and replays.

**UI Annotations:**
- **Buffer timeline (relay):** Horizontal bar spanning the tick axis. Amber pips stacked vertically — during polling, a uniform amber wall. After switching to event-driven, the bar shows long stretches of dark charcoal (empty) punctuated by bright amber clusters at contact moments.
- **Heartbeat pulse:** When a polling rule fires, a subtle concentric ring expands from the unit's position on the battlefield — pale cyan, fading over 0.5 seconds. Three scouts polling create a visual rhythm of overlapping rings.
- **Context overload stun:** The unit's sprite freezes. A thin red ring contracts inward (the inverse of the scan pulse). The buffer bar flashes red once. A small `STUN` label appears in the tick log.
- **Compress animation:** Buffer pips explode outward in a spray of amber particles. Surviving pips slide together and re-compact. The visual is deliberately violent — the player should feel the cost of random deletion.

---

#### Journey: Keiko, 26, Game Designer (No Engineering Background)
**Context:** Mission 7. Keiko learned about hooks in Mission 5 and converted everything to event-driven. She's proud of her "clean" architecture — no heartbeats, no wasted scans, pure reactive design. Her scouts fire hooks only on enemy detection. Her relay forwards only when it receives signals. Her striker activates only on orders.

**Minute 0:00 — The Silent Grid**
Plan screen. Keiko's blueprints are elegantly minimal. Scout-North and Scout-South each have a single hook: `ON_ENEMY_DETECTED → FIRE threat-net`. No heartbeat rules. The relay listens on `threat-net`, forwards on `strike-orders`. The striker listens on `strike-orders`. Ghost preview shows all context bars at zero — dark charcoal rectangles, perfectly empty. No pulsing, no rhythm. The architecture is dormant, waiting.

**Minute 0:20 — Silence is Golden**
Sealed execution begins. For 15 ticks, the battlefield is quiet. Keiko's units are invisible — zero EM emissions, no scanning pulses, no buffer activity. The spectator view shows dark silhouettes against the hex grid. Enemy patrols pass within detection range of an enemy sensor tower and detect nothing — Keiko's squad is electromagnetically dark. She smiles. This is how it should work.

**Minute 1:00 — The Blind Spot**
Tick 22. An enemy sniper, approaching from the southeast (between the two scouts' patrol zones), fires on Scout-South. One shot, one kill. Scout-South's sprite shatters into pixel fragments — a sharp crack sound, a spray of orange sparks. The unit card in the sidebar goes dark, its hook connections dissolving as thin red lines that fade to nothing. Keiko flinches. But she has Scout-North, and the relay, and the striker. The architecture should recover.

It doesn't. The enemy column following the sniper advances through the southeast corridor — the dead zone where Scout-South used to watch. Scout-North is positioned northwest and cannot see them. The relay receives nothing. The striker stands idle, buffer empty, context bar a flat charcoal line. The enemies walk into the base. The Command unit dies. Mission failed.

**Minute 2:30 — The Empty Timeline**
Debrief. Keiko opens the Inspector. The striker's buffer timeline is devastating: a perfectly flat charcoal line from tick 1 to tick 38. Zero entries. Zero signals received. Zero actions taken. The striker did nothing for the entire mission after tick 22 because it had no source of information other than the now-dead scout's hook chain. The Inspector's signal genealogy view shows the chain: Scout-South (ELIMINATED tick 22) → threat-net (SILENT after tick 22) → Relay (NO INPUT after tick 22) → strike-orders (SILENT) → Striker (IDLE).

The Inspector suggests, in a small annotation at the bottom of the timeline: *"This unit received zero signals after tick 22. Consider adding a fallback perception rule."* Keiko reads it. She goes back to the Plan screen and adds a single heartbeat rule to the striker: `EVERY 5 → SCAN perception radius (2 tiles)`. Low frequency. Minimal EM. But enough that if the striker sees an enemy within 2 tiles, it will act — even without orders.

**UI Annotations:**
- **Dead unit dissolve:** When a unit is eliminated, its sprite shatters. Hook connections (thin colored lines in the Plan view or faint arcs in spectator view) dissolve from the endpoints inward — the listener loses its connection visually before the consequence hits.
- **Empty buffer timeline:** A charcoal-dark horizontal bar with no pips. In the Inspector, this is the most alarming visual — a unit that processed zero information. A subtle pulsing amber outline appears around empty timelines as if the Inspector itself is drawing attention to the gap.
- **Fallback heartbeat glyph:** When a unit has both hook listeners AND a heartbeat rule, the Plan view shows a small metronome icon in the corner of the unit card — a pendulum swinging at the configured interval. The icon is dimmer than the hook connection lines, indicating its secondary/fallback role.

---

#### Journey: Diego, 41, Systems Architect
**Context:** Mission 10. Diego has mastered both polling and event-driven patterns across earlier missions. He's now facing a complex scenario: enemy forces approaching from three directions with jammers that can flood channels with noise signals. He needs an architecture that adapts.

**Minute 0:00 — The Hybrid Blueprint**
Plan screen. Diego's architecture is layered. Three outer scouts configured as event-driven sentries — `ON_ENEMY_DETECTED → FIRE threat-net`. One inner scout configured as a polling fallback — `EVERY 4 → SCAN → WRITE backup-net`. The Relay-Prime listens on both `threat-net` and `backup-net`, with a filter rule: `IF threat-net entry exists AND backup-net entry within 2 ticks confirms → FORWARD on verified-orders`. The striker listens only on `verified-orders`. The Command unit monitors buffer pressure across the squad via `status-net` heartbeats from every unit — `EVERY 6 → REPORT buffer_utilization ON status-net`.

Ghost preview: the outer scouts show no buffer activity (event-driven, dormant). The inner scout's context bar pulses gently every 4 ticks — a slow heartbeat. The relay shows a moderate projected load. The Command unit's bar ticks up every 6 ticks with status reports from across the squad. The architecture breathes at two rhythms — the inner scout's steady 4-tick pulse and the Command unit's slower 6-tick pulse.

**Minute 1:15 — Jammer Contact**
Tick 18. Enemy jammers activate. The `threat-net` channel floods with noise — fabricated "enemy detected" signals that look identical to real scout signals. The relay's buffer spikes. Amber pips pour in, 4-5 per tick. The buffer bar climbs: 8/12, 10/12, 12/12. The context overload stun fires — a red pulse contracting around the relay. But Diego anticipated this. His `verified-orders` rule requires confirmation from the polling inner scout. The noise signals arrive on `threat-net` but the inner scout's `backup-net` reports show no enemies in its perception range. The filter rule blocks the noise from reaching the striker. The verified-orders channel stays clean.

The relay stuns repeatedly as the jammer flood continues — the buffer pressure is real — but the striker never acts on bad data. Diego watches the relay's buffer bar flash red, then stabilize as Compress fires and eviction rules clear stale noise. The rhythm holds.

**Minute 2:30 — The Adaptive Switch**
Tick 34. Command unit's status-net reports show relay buffer utilization at 95%. Command's rule fires: `IF any unit buffer > 90% → BROADCAST mode-net: THROTTLE`. The outer scouts receive the THROTTLE signal. Their configuration includes a mode-switch rule: `IF mode-net = THROTTLE → DISABLE all hooks for 10 ticks`. The scouts go dark — no more hook transmissions. The jammer's noise signals are now the only input to `threat-net`, making them easier for the relay's filter to identify and discard (no legitimate signals to confuse with).

After 10 ticks of throttle, the scouts re-enable hooks. The jammer has moved on. Legitimate threats appear. The relay's buffer is clear. The architecture seamlessly returns to event-driven mode.

**Minute 4:00 — Debrief: The Two Rhythms**
Inspector. Diego opens the full-squad buffer timeline — all units stacked vertically, time on the horizontal axis. The visualization reveals two distinct visual textures: the event-driven scouts' timelines are sparse clusters of bright amber (contact events) separated by long charcoal stretches. The polling inner scout's timeline is a steady, evenly-spaced sequence of dim amber pips — the heartbeat rhythm visible as a regular pattern. The Command unit's status-net reports create a third, slower rhythm of small blue pips every 6 ticks. The relay's timeline shows the jammer flood as a dense red-amber block from tick 18-34, then clean charcoal after the THROTTLE command.

Diego screenshots the timeline and posts it to the community board with the caption: "Event-driven for speed, polling for ground truth, heartbeats for orchestration."

**UI Annotations:**
- **Multi-rhythm visualization:** The spectator view shows overlapping concentric pulses at different frequencies. The inner scout's 4-tick pulse is a slow, wide cyan ring. The Command unit's 6-tick pulse is an even slower, wider blue ring. Event-driven hook fires are sharp, instantaneous flashes — amber starbursts with no ring expansion. The visual difference between rhythmic polling and instantaneous events is immediately apparent.
- **Jammer noise:** Fabricated signals appear as slightly desaturated amber pips in the buffer — almost the same color as real observations but with a faint static texture overlay. In the Inspector, noise signals are tagged `[UNVERIFIED]` in red text. The player cannot distinguish them in real-time (sealed execution), only in debrief.
- **THROTTLE broadcast:** When the Command unit sends a mode-switch signal, a wavefront of blue ripples outward from its position, washing over all receiving units. Units that enter throttle mode dim slightly — their sprites desaturate by 20%, indicating reduced activity.

---

## Interaction Effects

### Buffer Pressure

Polling and event-driven approaches create opposite buffer pressure profiles. Polling generates steady, predictable pressure — the buffer fills at a constant rate determined by the poll interval. Event-driven generates spiky, unpredictable pressure — zero for long periods, then a burst during contact. The relay's eviction policy must handle both patterns. A FIFO eviction rule works well for polling (oldest entries are least relevant). A priority-based eviction rule works better for event-driven (some signals are more important than others, regardless of age).

The interaction becomes critical when a single relay receives signals from both polling and event-driven sources. The polling source's steady stream of "CLEAR" observations dilutes the event-driven source's rare but critical "ENEMY DETECTED" signals. Without careful eviction weighting, the important signals drown in the noise of routine check-ins.

### EM Emissions

Polling is inherently loud. Every scan cycle emits an EM pulse. A scout polling every tick is the loudest unit on the battlefield. Event-driven units are silent until they fire — and even then, they emit only once per event. In missions where enemy detection is a threat, the polling-vs-event-driven choice is simultaneously a stealth decision. An all-polling architecture is a searchlight; an all-event-driven architecture is a shadow.

The EM interaction creates a meta-game: the player can use polling scouts as deliberate decoys — loud, visible, drawing enemy attention — while event-driven scouts operate silently on the actual surveillance mission. The polling scouts' EM emissions mask the event-driven scouts' rare, brief transmissions. This is the "noisy cover" pattern from electronic warfare, emergent from the polling/event-driven tradeoff.

### Relay Chains

In multi-hop relay chains (Scout → Relay-A → Relay-B → Striker), the polling/event-driven choice propagates. If the scout polls, Relay-A receives steady traffic, which generates steady traffic for Relay-B, which generates steady traffic for the striker. The entire chain pulses in rhythm. If the scout is event-driven, the chain is dormant until contact — then a signal cascades through all relays in sequence, each hop adding 1 tick of latency.

The hybrid approach — event-driven scouts with polling relays — creates a damping effect. The relay polls its own buffer every N ticks rather than instantly forwarding received signals. This introduces intentional latency (the relay might receive a signal at tick T but not forward it until tick T+2 when its next poll fires) but smooths out burst traffic. The relay acts as a **rate limiter**, absorbing spikes and emitting at a constant rate.

### Combo Systems

The polling/event-driven split interacts with the Compress and Filter skills. Compress (halve buffer contents by random discard) is a response to buffer pressure — it's most needed in polling architectures where steady input fills buffers predictably. Filter (discard entries matching a condition) is most valuable in event-driven architectures during signal storms — when many events fire simultaneously, Filter can drop duplicates or low-priority signals before the buffer fills.

The combination creates a skill loadout decision: polling architectures benefit from Compress (manage steady pressure), event-driven architectures benefit from Filter (manage burst pressure). A hybrid architecture may need both, consuming two of the unit's limited skill slots.

---

## Comparable Games and Systems

### Real-World Software

- **Cron jobs vs. webhooks.** The canonical example. A cron job polling a database every 5 minutes will miss changes that occur and are superseded within the interval. A webhook fires on every change, but during traffic spikes the receiver's queue may overflow. Every engineer learns to use cron as a safety net ("reconciliation loop") even when webhooks handle the fast path — exactly the pattern Robot Uprising teaches in Mission 7-8.
- **Kubernetes liveness probes vs. readiness events.** Kubernetes polls containers with heartbeat checks ("are you alive?") on a fixed interval. But it also watches for readiness events ("I'm ready to serve traffic"). The probe is the polling fallback; the event is the fast path. Probe interval too aggressive = wasted resources. Too relaxed = slow failure detection. The same tuning problem the player faces with heartbeat intervals.
- **React polling vs. WebSocket push.** A React app can poll an API endpoint every 30 seconds or open a WebSocket for real-time push. Polling is simpler, more resilient (the server doesn't need to track connections), but wastes bandwidth. WebSocket is efficient and instant but creates connection management complexity and single-point-of-failure risk. The frontend/backend decision mirrors Scout/Relay architecture decisions.

### Game Equivalents

- **Screeps:** Players write JavaScript that runs every tick. The most common beginner pattern is polling: `if (Game.time % 5 === 0) { scanForInvaders(); }`. Veterans switch to event-driven patterns using room event watchers and inter-shard messaging. The transition from polling to event-driven is a recognized skill progression in the Screeps community — Robot Uprising formalizes it as a designed learning arc.
- **Factorio circuit networks:** Players can wire a constant combinator to pulse a signal every N ticks (polling) or wire a decider combinator to fire only when a condition is met (event-driven). Complex factory automation typically uses both: event-driven for fast reactions ("train arriving → open gate") and polling for background maintenance ("every 600 ticks → check ore reserves").
- **Dwarf Fortress burrows/alerts:** Standing orders (polling: check every season) vs. alerts (event-driven: goblin siege detected → activate militia). Players who rely only on alerts discover that seasonal checks catch problems alerts miss (food shortages, mood breaks).

---

## Sensory Description

### What Polling Looks Like On Screen

A polling unit breathes. Every N ticks, a pale cyan ring expands outward from the unit's position on the hex grid — the scan pulse. The ring's radius matches the unit's perception range, then fades over 0.3 seconds. The unit's context bar (a thin horizontal strip beneath its sprite) ticks upward by one pip with each scan — amber for detected content, a dim grey-amber for "nothing detected." The rhythm is metronomic: pulse, pip, pause, pulse, pip, pause. Three polling scouts on the battlefield create overlapping rings, a gentle visual heartbeat. The sound is a soft, periodic chirp — a sonar ping at the configured interval. Faster intervals create a rapid ticking; slower intervals create a meditative pulse.

When the buffer fills, the context bar's rightmost pip pushes against the bar's boundary. A thin red outline appears on the bar. The next poll's pip arrives and the oldest pip on the left side dissolves with a faint amber exhale — eviction. The bar is always full, always churning. It looks busy even when nothing is happening.

### What Event-Driven Looks Like On Screen

An event-driven unit is still. No rings, no pulses, no rhythm. The sprite stands on its hex tile with a faint standby glow — a barely visible amber outline that distinguishes it from a dead unit. The context bar is dark charcoal, empty. No pips. No movement. The unit card in the sidebar shows the hook connection as a thin colored line extending from the unit toward the channel source — a gossamer thread stretched across the battlefield, pulsing faintly to show it's alive but carrying no traffic.

When the trigger fires, the effect is sudden and dramatic. The gossamer thread flashes bright — a pulse of amber light racing along the connection line from source to listener. The unit's context bar snaps from empty to occupied — a single bright amber pip appearing with a sharp chime sound, distinctly different from the polling chirp. The unit immediately acts: its sprite animates, its response fires, its context bar shows the signal being processed. Then silence again. The bar may stay at 1/8 for dozens of ticks until the next event. The visual texture is staccato — long silences punctuated by sharp bursts of activity.

### The Hybrid Visual

A hybrid unit — hooks plus a fallback heartbeat — shows both visual languages simultaneously. The gossamer hook thread extends toward the channel source, and a faint metronome icon pulses in the unit card at the heartbeat interval. Most of the time, the unit is still (event-driven mode). The heartbeat produces a small, dim pip on the context bar every N ticks — visually subordinate to the bright pips from hook signals. When the hook fires, the bright pip dominates the bar. When the hook source dies and the thread dissolves (its color draining from the endpoints inward over 2 seconds), the heartbeat pips become the only source of information — they brighten subtly, promoting from background to foreground.

The transition from event-driven to polling-fallback is visible as a visual mode shift: the unit goes from "mostly dark with occasional bright flashes" to "steady dim pulse, alone." The player sees the architecture degrade gracefully rather than catastrophically.

---

## Design Patterns Identified

1. **The Polling Floor** — Every event-driven architecture should have a low-frequency polling fallback as a floor of ambient awareness. The game teaches this through scout death scenarios.
2. **The Noisy Decoy** — Polling units' EM emissions can be deliberately used to mask event-driven units' stealth operations. Emergent tactical pattern from the emissions/polling interaction.
3. **The Rate-Limiting Relay** — A relay using polling to check its own buffer (rather than instantly forwarding) acts as a natural rate limiter, smoothing burst traffic from event-driven sources.
4. **The Adaptive Mode Switch** — Command units monitoring buffer pressure can broadcast mode-switching signals, toggling the squad between polling and event-driven modes based on battlefield state. Mirrors auto-scaling patterns in cloud infrastructure.
5. **The Verification Gate** — Requiring confirmation from a polling source before acting on event-driven signals creates a noise-resistant architecture. Mirrors the "trust but verify" pattern in distributed systems where webhooks are validated against periodic reconciliation.
6. **The Two-Rhythm Architecture** — Combining fast event-driven reactions with slow polling reconciliation creates an architecture that is both responsive and resilient. This is the mature pattern — the one the game's full campaign arc is designed to teach.

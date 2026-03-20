# 3.01d — The "Silence Detection" Skill Gap

## Overview

A unit receives signals. It can filter them, compress them, amplify them, route them. But what about the signal that *doesn't arrive*? The scout that stops reporting. The heartbeat that goes quiet. The channel that was chattering every tick and now shows nothing. Detecting the ABSENCE of information is a fundamentally different cognitive operation from processing its presence — and the current 12-skill vocabulary has no native primitive for it.

This is the **watchdog timer** problem: a system that triggers when something FAILS to happen within a window. Real distributed systems rely on these constantly — Kubernetes liveness probes, TCP keepalive timeouts, dead man's switches in industrial safety, the "if you don't hear from me in 24 hours" protocol of every spy movie. The question for Robot Uprising: does the current rule/hook/context architecture already support silence detection, or is there a genuine gap that demands a new primitive?

---

## The Core Tension: Rules vs. Dedicated Watchdog

### Can Rules Alone Detect Silence?

The current rule system evaluates conditions against context window contents. A rule like "IF buffer does NOT contain threat_detected for 3 ticks THEN move to last known position" requires the rule engine to track *temporal absence* — not just "is this entry here?" but "has this entry type appeared within the last N ticks?" This is a category leap from the current condition vocabulary, which evaluates *what is in the buffer right now*.

**Approach A: The Age Check** — Rules could reference entry age metadata. "IF oldest threat_detected entry age > 5 THEN assume scout lost." This works when signals were once present but have gone stale. It fails when the channel was never active in the first place — there is no entry to age-check.

**Approach B: The Tick Counter** — A rule condition `ticks_since_last(channel, type)` that returns the number of ticks since the last entry of a given type arrived. At zero entries ever, it returns the current tick number (effectively infinity). This is mechanically achievable but requires introducing a new condition primitive — the rule language must learn to count time, not just evaluate buffer snapshots.

**Approach C: The Explicit Watchdog Hook** — A dedicated hook trigger: `ON_SILENCE(channel: "alarm", timeout: 5)` that fires when no signal arrives on a named channel for N consecutive ticks. This lives in the hook layer, not the rule layer, and generates a synthetic event that other units can process through normal rules and hooks. The silence itself becomes a signal.

**Approach D: The Canary Slot** — A context config option: reserve one buffer slot as a "watchdog slot" for a specific channel. The slot shows a countdown timer (N ticks). Every incoming signal on that channel resets the countdown. When it hits zero, the slot changes state from "listening" to "SILENT" — and this state change is evaluable by rules. Silence becomes a first-class buffer entry.

**Approach E: The Heartbeat-Dependency Model** — No new primitives. Instead, units are taught to send periodic heartbeat signals (using hooks on every Nth tick via the ON_TICK trigger from the Parameterized trigger vocabulary in 3.08). Silence detection is achieved by checking for heartbeat staleness in rules. The gap is not in detection — it is in the *sending* architecture. This pushes the design burden to the player's hook wiring rather than introducing new system primitives.

**Approach F: The Progressive Watchdog** — Recommended. Heartbeat-via-ON_TICK in Missions 5-6 (player-built, fragile, educational). Canary Slot as context config option in Mission 7 (system-supported, visual, per-channel). ON_SILENCE hook trigger in Mission 8+ (dedicated, composable, the full primitive). Each tier teaches a different lesson about absence detection before handing the player the complete tool.

---

## The Six Approaches — Detailed Mechanical Analysis

### Approach A: "The Age Check" (No New Primitives)

Rules evaluate `entry.age > N` on existing buffer contents. A relay with a rule "IF newest scout_report.age > 4 THEN amplify on channel 'silence_alarm'" detects staleness. But this requires at least one scout_report to EVER have existed in the buffer. A fresh relay with zero scout observations has nothing to age-check.

**Strengths:** Zero system additions. Uses existing vocabulary. Players who discover it feel clever.
**Weaknesses:** Fails on "never received" vs. "stopped receiving." Cannot distinguish "scout died at tick 5" from "scout was never assigned to this channel." The mental model is backwards — you are detecting the *aging* of old data, not the *absence* of new data.

### Approach B: "The Tick Counter" (New Condition Primitive)

A new rule condition: `ticks_since(channel, type)`. Returns integer. Evaluable in standard condition→action rules. At game start with no history, returns current_tick (large number). After first signal, resets to 0 and counts up.

**Strengths:** Precise. Composable with existing boolean prefix system (+/−). Single new concept.
**Weaknesses:** Introduces temporal reasoning into a snapshot-based rule engine. "ticks_since" implies the engine tracks per-channel, per-type timestamps — hidden state outside the buffer. Players may ask: where is this counter? Why can't I see it? It violates the "everything in the buffer is visible" principle.

### Approach C: "The Watchdog Hook" (ON_SILENCE Trigger)

A new hook trigger type: `ON_SILENCE(channel: "alarm", timeout: 5)`. Fires once when the channel has been quiet for 5 consecutive ticks. Does not re-fire until the channel receives at least one signal and goes silent again (edge-triggered, not level-triggered). The hook payload is a synthetic event: `{type: silence_detected, channel: "alarm", silent_ticks: 5, tick: 32}`.

**Strengths:** Fits cleanly into the hook taxonomy (extends the Parameterized trigger vocabulary from 3.08). Edge-triggered semantics prevent spam. The silence event flows through normal channels, compressible by relays, evaluable by rules. Composable with the full architecture.
**Weaknesses:** A hook that fires on NON-events is conceptually weird. "This hook triggers when nothing happens" requires a mental model shift. The timeout parameter adds configuration surface. ON_SILENCE + normal hooks on the same channel create complex interaction (does receiving the silence notification itself count as breaking the silence on that channel?).

### Approach D: "The Canary Slot" (Context Config Addition)

In context config, the player can designate one buffer slot as a Canary for a specific channel. The Canary slot displays a countdown timer (configurable 2-10 ticks). Every incoming signal on the designated channel resets the countdown to max. When the countdown reaches zero, the slot's state changes from a green "LISTENING" indicator to a red "SILENT" indicator. Rules can evaluate Canary state: `IF canary("alarm") == SILENT THEN ...`.

**Strengths:** Visually legible. The countdown is visible on the unit's buffer bar during Sealed Watch — a tiny amber number ticking down, then flashing red. Players can literally watch silence accumulate. Maps to the "context window as protagonist" design language from 3.12. The Canary consumes a real buffer slot, creating a cost: one slot of your 6-14 is reserved for watching silence instead of holding useful data.
**Weaknesses:** One Canary per channel means monitoring multiple channels for silence requires multiple reserved slots — expensive on small-buffer units (scouts with 6 slots). The Canary is per-unit, not per-network — each unit that needs silence awareness must independently reserve a slot. No natural way to share silence detection across the architecture without hook forwarding.

### Approach E: "The Heartbeat" (Player-Built via ON_TICK)

No system changes. The player wires ON_TICK(interval: 3) hooks on scouts to broadcast periodic pings on a "heartbeat" channel. Relays or strikers evaluate heartbeat freshness in their rules: `IF newest heartbeat.age > 6 THEN assume_scout_lost`. When a scout dies, its heartbeats stop, and the age check triggers within 6 ticks.

**Strengths:** Emergent complexity from existing primitives. Players who discover this pattern feel genuine pride — they invented a distributed monitoring system. Directly teaches the real-world heartbeat/liveness probe pattern. Zero new primitives needed.
**Weaknesses:** EM emissions. Every heartbeat ping generates noise. A scout pinging every 3 ticks is substantially louder than one that only transmits on observation. The monitoring infrastructure itself becomes a vulnerability. Also fragile: if the relay processing heartbeats gets stunned by context overload, it misses heartbeats and falsely triggers "scout lost" alarms. False positives cascade. Players must debug not just the architecture but the monitoring layer — which is realistic but adds complexity to an already dense system.

### Approach F: "The Progressive Watchdog" (Recommended)

Three tiers unlocking across the campaign:

**Tier 1 — Heartbeat (M5-6):** Player discovers heartbeat pattern organically through ON_TICK hooks. A Mission 5 or 6 scenario where a scout operating behind enemy lines goes silent (destroyed), and the player's architecture has no way to detect this. The boot log plants a seed: "OBSERVATION: unit SCOUT-A has not transmitted on channel 'recon' for 8 ticks. No alert was generated. Recommend: periodic status transmission." The player builds heartbeats manually. They work — but they are loud and fragile.

**Tier 2 — Canary Slot (M7):** Boot log: "SUBSYSTEM ONLINE: Context Canary. Reserves one buffer slot as a silence monitor. Countdown resets on incoming signal. Red state when countdown expires." The player can now watch silence accumulate visually. The cost (one buffer slot) teaches that monitoring has overhead. Canary slots are visible during Sealed Watch as tiny amber countdown pips beneath the buffer bar.

**Tier 3 — ON_SILENCE Hook (M8+):** Boot log: "HOOK TRIGGER AVAILABLE: ON_SILENCE. Fires when a channel has been quiet for N ticks. Edge-triggered." The full composable primitive. ON_SILENCE events flow through the hook network like any other signal. A relay can listen for silence on channel "recon," compress it with other diagnostic signals, and forward to a Command agent on channel "network_health." Silence detection is now wired into the architecture, not just monitored per-unit.

---

## Player Journeys

#### Journey: Datu, 34, Network Engineer (Manila)

**Context:** Mission 6. Datu has built a functioning factory producing scouts and strikers. His relay architecture is solid — two relays compressing scout data and feeding strikers. He has beaten Missions 1-5 cleanly. He has not yet needed to detect absence.

**Minute 0:00 — The Quiet Flank**
The board loads: Palawan jungle terrain, dense foliage tiles blocking perception. Datu's factory is bottom-left. Enemy spawner top-right, but also a secondary spawner mid-left — partially hidden by jungle tiles. Datu configures two scouts: one on a broad northern patrol, one on a tight eastern sweep. Two relays in the center. Striker pair ready to converge on intel.

**Minute 2:30 — EXECUTE**
Sealed Watch begins. Northern scout reports contacts immediately — enemy scouts probing from the top-right spawner. Relays compress, strikers converge. Efficient. Datu nods. But the eastern scout enters a jungle corridor and spots nothing. It patrols silently for 8 ticks. Then — a flicker. An enemy striker appears adjacent to the eastern scout. The scout evades, broadcasts one alarm signal, then is eliminated next tick. The alarm reaches the relay, which compresses and forwards. But the strikers are committed to the northern engagement. By the time they disengage and move east, three enemy strikers have emerged from the mid-left spawner and are advancing on the factory. The factory falls at tick 34.

**Minute 4:00 — Inspector**
Datu scrubs to tick 15. His eastern scout's buffer shows normal observations — empty tiles, empty tiles, empty tiles. At tick 23, a single threat_detected entry. At tick 24, the scout is gone. He looks at his relay's buffer: nothing from the east channel between tick 1 and tick 23. Twenty-two ticks of silence, and nothing in his architecture noticed.

"I need a watchdog," Datu says aloud. He has used Nagios, Datadog, PagerDuty for 12 years. The concept is instant.

**Minute 5:00 — The Heartbeat Build**
Back in the Plan screen, Datu adds an ON_TICK(interval: 3) hook to his eastern scout's blueprint, broadcasting on channel "heartbeat_east." On his relay, he adds a rule: "IF newest heartbeat_east.age > 6 THEN amplify on channel 'scout_lost'." On his striker blueprint, he adds: "IF buffer contains scout_lost THEN move toward last_known_position of source unit."

He executes again. This time, when the eastern scout dies at tick 24, the relay's heartbeat age check triggers at tick 30. The "scout_lost" signal reaches both strikers by tick 32. They pivot east. The three enemy strikers are met at the midfield. Two are eliminated. The third breaches through but is caught by a newly-spawned scout's evade-triggered alarm.

But Datu notices: his heartbeat signals generated 8 additional EM pings over 24 ticks. The enemy's mid-left spawner started producing strikers two ticks earlier than last run — the noise attracted attention.

**Minute 7:00 — The Tradeoff**
Datu stares at the EM emission overlay in Inspector. His "safe" monitoring channel is painting a target on his architecture. He reduces heartbeat frequency to ON_TICK(interval: 5). Detection delay increases from 6 to 10 ticks. He accepts the tradeoff. "Exactly like tuning Prometheus scrape intervals," he mutters.

**UI Annotations:**
- ON_TICK hook: slider for interval (2-10), channel name text input, hook slot visual showing tick count
- Heartbeat signal: tiny green pulse dot on channel wire every N ticks during Sealed Watch
- EM emission: faint amber ring around scout on heartbeat tick, stacks visually when multiple units pulse
- Inspector heartbeat timeline: green dots at regular intervals, gap at scout death, red X at elimination tick

---

#### Journey: Aisha, 14, First-Timer (Cebu)

**Context:** Mission 7. Aisha has struggled through Missions 5-6 but loves the sealed watch. She has never built a watchdog before. The boot log for Mission 7 introduces the Canary Slot.

**Minute 0:00 — The Boot Log**
The screen fills with teal monospace text:

```
SUBSYSTEM ONLINE: Context Canary
> Reserve one buffer slot as a silence monitor.
> Countdown resets on incoming signal.
> When countdown reaches zero: state changes to SILENT.
> SILENT state evaluable by rules.
> Cost: 1 buffer slot per monitored channel.
READY.
```

The workbench's context config panel (the Thermometer sidebar from 3.12) gains a new element: a small bird icon at the bottom of one buffer slot. Aisha hovers over it. The tooltip plays a 3-tick micro-scenario: a buffer slot showing "5... 4... 3..." in amber, then a signal arrives and it resets to "5." Then the signal stops, the countdown reaches 0, and the slot turns red with "SILENT" text. A canary chirp sound on reset, a flat buzz on SILENT.

**Minute 1:30 — Configuration**
Aisha drags the canary icon onto her relay's context config. A small dialog appears: "Monitor which channel?" She types "recon" — her scout's observation channel. "Countdown: ___" She sets 4. The Thermometer now shows one of her relay's 12 buffer slots with a tiny amber "4" and a bird silhouette. 11 usable slots remain.

She adds a rule to her relay: "IF canary('recon') == SILENT THEN amplify on channel 'emergency'." The sentence strip reads naturally: WHEN recon canary SILENT → AMPLIFY to emergency.

**Minute 3:00 — EXECUTE**
Sealed Watch. Her scouts patrol, signals flow, the relay's canary slot shows a steady "4" — resetting every time a scout report arrives. Amber number, green background. Aisha watches the number tick down to 2, then a scout report arrives and it resets to 4. Down to 3, reset. The rhythm is hypnotic.

At tick 19, an enemy striker eliminates her northern scout. The canary countdown begins in earnest: 4... 3... 2... 1... The slot background shifts from green to amber at 2, then at 0 it flashes RED. "SILENT" appears in the slot. The relay's amplify rule fires immediately — a green ring emanates outward. Her strikers receive the emergency signal.

Aisha pumps her fist. "It worked!"

**Minute 4:30 — The False Positive**
But at tick 28, her southern scout enters a jungle dead zone — no enemies to observe, and the scout's hooks only fire on observation, not on heartbeat. The canary countdown reaches 0 again. SILENT. The relay amplifies another emergency. Her strikers divert south, abandoning a northern engagement. An enemy scout slips through.

In Inspector, Aisha sees the false positive. She realizes: the canary cannot distinguish "scout destroyed" from "scout in quiet area." She needs heartbeats — the scout must actively report its status, not just its observations. She opens the hook editor and wires ON_TICK(interval: 3) on both scouts, broadcasting a simple ping to "recon."

**Minute 6:00 — The Fix**
With heartbeats feeding the canary, the countdown only expires on true silence — when a scout is actually gone. Aisha runs again. The canary stays green throughout the quiet southern patrol (heartbeats keep resetting it) and correctly triggers SILENT only when the northern scout is eliminated at tick 19. No false positive this time.

She looks at her relay's buffer: one slot reserved for the canary, heartbeat signals consuming slots alongside scout observations. Her 12-slot relay now has 11 usable slots, and heartbeats compete with observation data for those 11. She adjusts eviction priority to evict heartbeat entries first — they are status checks, not intelligence.

**UI Annotations:**
- Canary slot: amber countdown number (monospace, 12px), bird silhouette icon, green/amber/red background states
- SILENT state: slot flashes red twice (200ms on, 100ms off, 200ms on), then holds steady red
- Canary reset: brief green pulse, tiny chirp sound (400Hz, 80ms)
- Canary expiry: flat buzz (200Hz, 150ms), red flash
- Rule with canary condition: bird icon in the WHEN clause, red/green state indicator

---

#### Journey: Prof. Adaora, 52, Computer Science Professor (Lagos)

**Context:** Mission 9. Adaora is preparing a lecture on distributed systems failure detection. She is using Robot Uprising as a teaching tool and has reached the ON_SILENCE hook tier.

**Minute 0:00 — The Full Primitive**
Mission 9 boot log:

```
HOOK TRIGGER AVAILABLE: ON_SILENCE
> Fires when a channel has been quiet for N ticks.
> Edge-triggered: fires once, then waits for activity before re-arming.
> Payload: {type: silence_detected, channel, silent_ticks, tick}
> Composable: silence events flow through hooks like any signal.
```

Adaora opens her Command agent's hook editor. She wires: `ON_SILENCE(channel: "heartbeat_alpha", timeout: 6) → broadcast on channel "network_health"`. Then on the same Command agent: `ON_SILENCE(channel: "heartbeat_beta", timeout: 6) → broadcast on channel "network_health"`. Her Command agent is now a centralized failure detector monitoring two scout sectors.

**Minute 2:00 — The Cascade Architecture**
She adds a relay listening to "network_health" with a compress rule: multiple silence_detected events within 3 ticks get compressed into a single summary: "2 scouts lost in sector alpha and beta within 3 ticks — coordinated attack likely." The compressed signal is amplified to channel "emergency_doctrine" which triggers her Command's reroute skill — surviving units are reassigned to defensive positions.

Adaora screenshots her hook topology. "This is a perfect teaching example," she murmurs. "Failure detection → event aggregation → correlation → automated response. FDIR — Fault Detection, Isolation, and Recovery. In a game."

**Minute 3:30 — The Designed Failure**
Mission 9 features enemy specialists with hack capability. An enemy specialist hacks a scout, reads its buffer, and discovers the heartbeat hook. The enemy then injects false heartbeat signals on the "heartbeat_alpha" channel using a compromised relay. The Canary never triggers. The Command agent's ON_SILENCE never fires. The scout is dead, but the system thinks it is alive.

Adaora discovers this in Inspector. The heartbeat signals continued after the scout's elimination — but the source field shows "UNKNOWN" rather than her scout's ID. She adds a rule to her relay: "IF heartbeat source != SCOUT-A AND channel == heartbeat_alpha THEN flag as suspicious." She wires a hook: `ON_RECEIVE(channel: "heartbeat_alpha", condition: source_mismatch) → broadcast on channel "integrity_alert"`.

"Byzantine fault tolerance," Adaora whispers. "The game just taught Byzantine fault tolerance."

**Minute 6:00 — The Lecture Slide**
She exports three Inspector screenshots: (1) the clean heartbeat timeline with regular green dots, (2) the compromised timeline showing green dots continuing past the scout's death tick with "UNKNOWN" source labels, (3) her authentication rule catching the spoofed heartbeats at tick 31. She titles the slide: "When the Canary Lies: Byzantine Fault Detection in Robot Uprising."

**UI Annotations:**
- ON_SILENCE hook: trigger type dropdown showing "ON_SILENCE," channel name input, timeout slider (2-10 ticks)
- Edge-triggered indicator: small "E" badge on the hook, tooltip explaining "fires once per silence period"
- Silence event in Inspector: grey dashed border (not solid — absence, not presence), channel name, tick count
- Heartbeat source field: green when matching expected unit ID, amber when unknown, red when mismatched

---

## Strengths

1. **Teaches the most under-taught concept in distributed systems.** Failure detection is harder than success detection. Most programming tutorials never cover "what happens when nothing happens." Robot Uprising makes silence a first-class signal.

2. **The progressive unlock perfectly scaffolds complexity.** Heartbeats (manual, fragile, loud) → Canary Slots (visual, per-unit, slot-costly) → ON_SILENCE (composable, architectural, edge-triggered). Each tier solves the previous tier's weakness while introducing new tradeoffs.

3. **Canary Slots make silence VISIBLE.** The countdown timer on the buffer bar during Sealed Watch is uniquely legible. Players can watch silence accumulate — a rare sensation in games. The amber-to-red transition is a micro-story every time.

4. **The EM-silence tradeoff is elegant.** Heartbeats make you louder. Canary slots cost buffer space. ON_SILENCE hooks consume hook slots. Every monitoring approach has a cost, mirroring real systems where observability infrastructure consumes resources.

## Weaknesses

1. **Three tiers may be one too many.** Heartbeats and Canary Slots both solve the same problem with different tradeoffs. Some players may feel the Canary is redundant once ON_SILENCE arrives. Counter: the Canary's visual countdown is valuable even after ON_SILENCE exists — it provides at-a-glance monitoring without wiring hooks.

2. **ON_SILENCE edge-triggering is confusing.** "This fires once when silence starts, not every tick of silence" is a subtle but important distinction. Level-triggered ON_SILENCE (firing every tick of silence) would generate spam. Edge-triggered is correct but harder to explain.

3. **False positive management adds cognitive load.** A quiet zone is not a dead scout. Players must learn to distinguish "nothing to report" silence from "unable to report" silence — and this distinction requires heartbeat infrastructure. The game forces players to build monitoring for their monitoring.

4. **Spoofed heartbeats (Mission 9+) may frustrate.** Byzantine fault detection is a graduate-level distributed systems topic. Making it a gameplay requirement risks alienating players who just want to build cool architectures. Counter: it should be optional — a mission can be beaten without detecting spoofed heartbeats, but clean victory requires it.

---

## Interaction Effects

- **Signal Acknowledgment (2.18):** Heartbeats are a lightweight form of acknowledgment. The "Graduated Receipt" system and the Canary/ON_SILENCE system operate on the same conceptual axis — "is my counterpart still alive?" — but at different granularities. Ping-Backs confirm message receipt; heartbeats confirm unit liveness. Both consume EM bandwidth.

- **Context Overload (Sealed Watch):** Heartbeat signals compete for buffer space. A relay monitoring 3 scouts via heartbeat receives 1 heartbeat per scout every 3 ticks = 1 heartbeat per tick. That is a significant fraction of a 12-slot relay's incoming bandwidth. Silence detection creates its own overload risk — monitoring the system can destabilize the system. This is directly analogous to the real-world "observability tax."

- **Command Agent (3.17):** ON_SILENCE hooks on the Command agent create a "network operations center" pattern — the Command watches for silence across multiple channels and triggers reroute/reassign in response. This is the highest-leverage use of silence detection and naturally emerges once players have all three tiers.

- **Hook Taxonomy (3.08):** ON_SILENCE fits cleanly as a 6th trigger in the Parameterized trigger vocabulary (alongside ON_RECEIVE, ON_TICK, ON_DEATH, ON_STUN, ON_ENTER_RANGE). It extends the trigger set without requiring new infrastructure.

- **Inspector:** The silence detection timeline should be a first-class Inspector panel element. A horizontal bar showing per-channel silence periods as grey gaps between green signal dots. The Canary countdown visible in the per-unit context window replay. ON_SILENCE events shown with distinctive grey dashed borders.

---

## Comparable Games

- **Screeps:** Players manually implement keepalive loops (`Game.time % 10 === 0` checks). No system support. Community-developed monitoring tools track creep activity. The manual approach works but requires JavaScript timing knowledge.
- **Factorio:** Circuit network alarm systems use "if signal = 0 for N ticks" conditions — functionally identical to ON_SILENCE. Players build elaborate monitoring dashboards. The game provides the primitive; the player builds the system.
- **StarCraft:** No silence detection. Information loss is total — if you lose vision, you know nothing. This is a design choice (fog of war is binary) but Robot Uprising's graduated silence model is richer.
- **Kubernetes:** Liveness probes are exactly Canary Slots. Readiness probes are heartbeats. PodMonitor CRDs are ON_SILENCE hooks. The three-tier progression in Robot Uprising maps 1:1 to the K8s probe hierarchy.
- **Dead by Daylight / Among Us:** The "who's alive?" problem solved socially (voice comms, task completion visibility). Robot Uprising mechanizes this social inference.

---

## Sensory Description

**The Canary countdown** is a vertical strip within one buffer slot on the unit's context bar. Five tiny horizontal lines, each representing one tick of countdown. They glow amber, and every tick one line dims from top to bottom — like sand falling in an hourglass. When a signal arrives, all five lines flash bright green simultaneously and the countdown resets. When the last line dims, the entire slot flashes red twice with a flat 200Hz buzz — not a beep, a buzz, like a transformer humming wrong. The slot then holds steady red with "SILENT" in 8px white text.

**The ON_SILENCE event** in the Inspector timeline appears as a grey dashed rectangle — the only dashed border in the entire buffer visualization. Every other entry has solid borders (observations = blue, signals = green, compressed = diamond-badged, intelligence = jagged). The dashed border immediately communicates: this entry represents an absence, not a presence. Hovering reveals "Channel 'recon' silent for 6 ticks" in a tooltip with a waveform icon showing a flatline.

**The heartbeat** during Sealed Watch is the subtlest visual in the game. A tiny green dot appears at the broadcasting unit's position every N ticks — not a ring like amplify, not a flash like engage. Just a dot. A pulse. If you are not looking for it, you miss it. But once you know heartbeats exist, you start watching for that regular green blink. When it stops, the absence is visceral. The screen feels quieter, even though nothing audible changed. The rhythm broke.

**The TikTok clip:** A Canary countdown ticking 5... 4... 3... 2... 1... RED. Cut to the relay amplifying emergency. Cut to two strikers pivoting and eliminating three enemy units. Text overlay: "My canary detected silence. My architecture detected death." The visual rhythm of the countdown is inherently cinematic.

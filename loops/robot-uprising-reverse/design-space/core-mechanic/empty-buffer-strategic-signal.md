# 2.01c — Empty Buffer Slots as Strategic Signal: Deliberate Headroom Management

## The Option

In Robot Uprising, a unit's context window is a fixed-size array of discrete slots. When slots are empty, that emptiness is not nothing — it is *capacity*. A half-empty buffer is a coiled spring: ready to absorb a burst of incoming signals without triggering the catastrophic 1-tick stun that comes from context overload. The question this analysis explores is whether players can — and should — deliberately engineer **buffer headroom** as a first-class strategic resource.

The core insight: **empty slots are not wasted capacity. They are insurance.**

In real-world systems engineering, this is capacity planning. Kubernetes engineers don't run pods at 100% CPU. Network architects provision bandwidth headroom for burst traffic. Database administrators keep tablespace free for index rebuilds. The principle is universal: systems that operate at maximum capacity have zero tolerance for the unexpected. Robot Uprising can teach this lesson viscerally by making buffer headroom a visible, manageable, and strategically critical resource.

### The "Always Keep Two Free" Doctrine

The titular strategy: a player configures their units to maintain at least 2 empty buffer slots at all times. This means:

- A **Scout** (6 slots) effectively operates with 4 usable slots — 67% maximum utilization
- A **Striker** (8 slots) runs at 6/8 — 75% maximum utilization
- A **Relay** (12 slots) runs at 10/12 — 83% maximum utilization
- A **Command** (14 slots) runs at 12/14 — 86% maximum utilization

The asymmetry is immediate: headroom hurts small-buffer units far more than large-buffer units. A Scout sacrificing 2 of 6 slots loses a third of its memory. A Command sacrificing 2 of 14 loses barely 14%. This creates a natural strategic gradient — headroom management is a luxury for large-buffer units and a painful tradeoff for small ones.

### How Players Engineer Headroom

The game's locked design already provides the tools for headroom management. No new mechanics are needed — only a shift in how players think about existing ones:

**Channel discipline (listen/ignore toggles):**
The most direct lever. A Scout listening on 3 channels in a busy network will fill its 6 slots in 2-3 ticks. The same Scout listening on 1 channel keeps its buffer sparse. The headroom-conscious player doesn't ask "what channels does this unit need?" — they ask "what is the *maximum* number of signals per tick this unit can afford to receive while maintaining 2 free slots?"

**Filter rules on Relays:**
The Relay's `filter` skill is the headroom management hub. A Relay configured to "drop all signals older than 3 ticks" or "drop duplicate observations from the same source" actively prevents downstream buffer bloat. The headroom-conscious player uses Relays as pressure regulators — not just signal forwarders, but flow controllers.

**Perception radius awareness:**
A Scout in the middle of the board sees more enemies than one at the edge. Each observed enemy generates one datum per tick. A Scout on a crowded board with 4 enemies in range generates 4 observations per tick — filling its 6-slot buffer in under 2 ticks. The headroom-conscious player positions scouts at the edges of enemy clusters, not the centers, to control observation volume.

**Compress as headroom recovery:**
The Relay's `compress` skill halves buffer contents. In headroom terms, this is a periodic buffer flush. A Relay that compresses every 4 ticks creates a sawtooth pattern: fill to 10/12, compress to 5/12, fill to 10/12, compress to 5/12. The floor of the sawtooth is the guaranteed headroom. The headroom-conscious player tunes compression frequency to maintain their target floor.

### What Headroom Protects Against

**Enemy noise flooding (Mission 4+):**
Enemies begin broadcasting jamming signals — garbage data that fills listener buffers. A unit with 0 free slots immediately stun-locks. A unit with 2 free slots absorbs the first noise burst and has 1-2 ticks to react before the next wave arrives. That reaction window is everything in a one-shot-one-kill game.

**Burst signal events:**
When a Scout discovers a cluster of 5 enemies simultaneously, it generates 5 observations in one tick. A Scout with 2 free slots absorbs the burst (evicting 3 old entries via FIFO) without stunning. A Scout at capacity stuns — and in the tick it loses to the stun, those 5 enemies move closer.

**Signal chain cascades:**
In complex architectures, a single event can trigger a cascade: Scout sees enemy -> signals Relay -> Relay amplifies to 3 channels -> Command receives 3 signals simultaneously -> Command fires reassignment hooks to 4 units -> each unit receives a new directive. The terminal nodes in this cascade receive data in bursts. Headroom at each node prevents the cascade from causing a chain of stuns.

**The "unexpected third thing":**
Perhaps the most important protection. A Striker listening on `strike-net` and `retreat-net` has a known maximum input rate. But what happens when the Command agent reroutes a new channel to it mid-battle? Suddenly the Striker receives data it was not designed to absorb. With headroom, it adapts. Without headroom, it stun-locks at the worst possible moment — the moment the battle situation has changed enough to require reconfiguration.

### The Buffer Bar as Headroom Indicator

During Sealed Watch, the buffer bar at the bottom of each unit tile becomes the headroom readout:

- **Healthy headroom (2+ free slots):** The rightmost segments of the bar remain dark gray — empty, waiting. The occupied segments glow their data-type colors (green for observations, blue for messages, yellow for processed signals). The overall bar reads left-to-right as a gradient from bright to dark. At a glance: "this unit has room."
- **Thin headroom (1 free slot):** Only one dark segment remains. The bar is almost entirely lit. A faint amber outline pulses around the single free slot — a visual whisper saying "one more signal and I'm full." Not alarming, but legible to a trained eye.
- **Zero headroom (buffer full):** The bar is solid color, edge to edge. No dark segments. The entire bar shifts from its normal color palette toward a warmer, more saturated tone — the visual language of pressure. The eviction flash pulses at the left edge with every tick as old data is pushed out to make room.
- **Stun (overload):** The bar goes solid red and jitters — the sparking/jittering visual locked in the design spec. The unit's tile dims. One tick lost.

The key design insight is that **empty slots should be visually prominent, not invisible**. The dark gray segments are not absence — they are a feature. Like the fuel gauge on a car, the interesting information is not "how much do I have" but "how much room is left." Players who learn to read the dark gray as "capacity" rather than "waste" have discovered the headroom strategy.

### Inspector Deep Dive: Headroom Analytics

In the Inspector phase, headroom becomes analytically visible:

**Context window chart (sparkline):**
The locked design specifies a sparkline showing context fill over all ticks. For headroom analysis, the critical visual is the **ceiling line** — the maximum utilization across the battle. A unit that peaked at 4/6 had a worst-case headroom of 2. A unit that peaked at 6/6 had a moment of zero headroom. The sparkline tells the story: did the headroom hold? Where did it come closest to breaking?

**Headroom histogram:**
A supplementary view showing how many ticks the unit spent at each utilization level. A well-engineered headroom architecture shows a histogram clustered at 50-70% — comfortably below the overload threshold with consistent spare capacity. A poorly engineered one shows a bimodal distribution: lots of ticks at 20% (wasted capacity) and lots at 100% (overloaded), meaning the information flow is bursty and uncontrolled.

**Near-miss markers:**
Ticks where the buffer reached N-1 or N/N without stunning (because exactly the right amount of data arrived) are marked with tiny amber diamonds on the sparkline. These are close calls — one more signal and the unit would have stunned. A line of amber diamonds is a screaming indicator that the headroom margin is too thin.

---

## Player Journeys

### Journey: Dev, 24, DevOps Engineer, Mission 5 (First Factory Mission)

**Context:** Dev has completed Missions 1-4 with hand-placed units. He understands context windows and has seen stun-locks. Mission 5 introduces the factory — his first time designing blueprints that will be mass-produced. He's worked in capacity planning at his day job and has an intuition about resource headroom, but hasn't yet connected it to Robot Uprising's buffers.

**Minute 0:00 — The Blueprint Editor**
Plan screen. The factory is visible on the left side of the 8x8 board — a glowing structure at position A1. Enemy spawner at H8. Dev is staring at his first Scout blueprint in the workbench. Six slots represented as dashed outlines in the Context Config section: two skill slots, two hook slots, a rules panel, and the context window configuration panel showing 6 empty rectangles in a horizontal row. He equips `patrol` and `evade` into the skill slots. He creates a hook: "on detect enemy -> broadcast on `threat-net`." He sets listen channels: `threat-net`, `command-net`, `retreat-net`.

**Minute 0:40 — The Three-Channel Scout**
Dev pauses. Three listen channels on a 6-slot buffer. He does mental math — if each channel sends 1 signal per tick, that is 3 incoming messages plus whatever the Scout observes directly. If the Scout sees 2 enemies, that is 5 data per tick on a 6-slot buffer. One more tick of that and it is overloaded. He frowns. At work, he would never provision a service with 83% baseline utilization. "That's a pager at 2 AM waiting to happen."

**Minute 1:10 — The Headroom Decision**
He removes `command-net` from the Scout's listen list. Two channels now: `threat-net` and `retreat-net`. Baseline incoming: 2 messages per tick maximum from hooks, plus observations. With 2 enemies visible: 4 data per tick on 6 slots. That leaves 2 free after the first tick. Headroom. He nods. "Always keep two free. That's the rule." He adds a rule to the Scout's rule list: "IF buffer > 4 occupied -> switch from patrol to evade." The Scout will automatically fall back when its buffer starts filling — a self-preservation behavior triggered by information pressure.

**Minute 2:00 — The Relay Blueprint**
He designs his Relay with headroom in mind from the start. 12 slots. He equips `compress` and `filter`. Listen channels: `threat-net`, `scout-raw`, `command-net`, `status-net` — four channels on four hook slots, the maximum. But he configures the filter rule: "drop signals older than 4 ticks." This prevents stale data from accumulating. He also sets compress to trigger "when buffer > 8 occupied" — automatically creating headroom when utilization climbs above 67%. The Relay's buffer should sawtooth between 4 and 8, never approaching the 12-slot ceiling.

**Minute 3:30 — First Execution**
He hits EXECUTE. The factory begins spawning. First Scout rolls out at tick 3, heads northeast. Dev watches the buffer bar. Six tiny segments at the bottom of the Scout's tile. Two light up green (observations of terrain). Then blue pips appear (messages from the Relay's initial broadcast). The bar reads: green-green-blue-gray-gray-gray. Three occupied, three free. Dev exhales. "Room to breathe."

**Minute 4:00 — Contact**
Tick 9. The Scout's perception radius overlaps an enemy cluster. Four enemies visible. Four green observation segments slam into the buffer simultaneously. The bar goes: green-green-green-green-blue-gray. Five occupied, one free. Dev's jaw tightens. His "keep two free" rule is broken — he only has one free slot. But he is not overloaded. The Scout's rule fires: buffer > 4, switch to evade. The Scout begins retreating, moving away from the cluster. By tick 11, the Scout has moved far enough that only 2 enemies are in range. Buffer drops to green-green-blue-blue-gray-gray. Headroom restored.

**Minute 5:00 — The Relay Saves Itself**
Meanwhile, the Relay received a burst from the Scout's "detect enemy" hook — 4 signals in one tick (one per detected enemy). The Relay's buffer jumped from 3/12 to 7/12. The compress trigger (> 8) did not fire. But then signals arrive from two other Scouts. Buffer hits 9/12. Compress fires. The buffer halves to ~5/12. On the sparkline later visible in the Inspector, this appears as a sharp sawtooth: a spike to 9, a drop to 5, a gradual climb, another spike, another drop. The Relay never exceeds 10/12. Three-slot headroom maintained at the floor of every sawtooth.

**Minute 6:30 — Resolution**
The Striker receives focused threat data through the Relay — filtered, compressed, relevant. Its 8-slot buffer holds 4 items: 2 processed threat signals and 2 direct observations. Four free slots. It engages enemies with full awareness and no cognitive pressure. Battle won. Zero stuns across all units.

**Minute 7:00 — Inspector Debrief**
Dev scrubs through the timeline. He clicks his Scout at tick 9 — the moment of the burst. Buffer state: [enemy_A, enemy_B, enemy_C, enemy_D, threat-net_relay_ack, EMPTY]. The near-miss diamond glows amber on the sparkline. "That was close. If a fifth enemy had been in range, I'd have stunned." He opens the headroom histogram: 70% of ticks at 2-3 occupied (33-50% utilization), 20% at 4-5 occupied (67-83%), 10% at 5 occupied (83%). Never hit 6. "I need to either reduce observations or increase my buffer-aware retreat threshold. Actually — I'll set the retreat trigger to buffer > 3 instead of > 4. More conservative, but I keep my headroom."

**UI Annotations:**
- **Context Config panel**: Six horizontal rectangles. Occupied slots show data-type color fills. Empty slots show dashed outlines with a subtle "capacity available" label on hover.
- **Buffer bar during Sealed Watch**: Dark gray empty segments are rendered at 40% opacity of the bar background — visible enough to count, dim enough not to distract from active data.
- **Near-miss diamonds**: Tiny amber markers on the Inspector sparkline. Hovering reveals: "Tick 9: 5/6 slots occupied. 1 slot remaining. No stun."
- **Headroom histogram**: Stacked horizontal bar in the Inspector sidebar. Green (0-50%), amber (50-80%), red (80-100%) segments proportional to ticks spent at each level.

---

### Journey: Maya, 15, Competitive Gamer, Mission 8 (Factory vs. Factory)

**Context:** Maya is deep in the campaign. She plays competitively — fastest completions, fewest losses. She discovered headroom management around Mission 5 and has been refining it. Mission 8 is the first factory-vs-factory mission — the enemy has a factory too, producing units that actively try to jam and overload her network. She has unlocked the Command agent and uses it to manage her squad dynamically.

**Minute 0:00 — The Anti-Jam Architecture**
Plan screen. Maya's architecture is built around what she calls "the pressure gauge doctrine." Every unit has a target headroom level and a behavior that triggers when headroom drops below it:

- Scouts (6 slots): target 2 free. Below 2 free -> evade and reduce perception (stop reporting non-threat observations).
- Strikers (8 slots): target 2 free. Below 2 free -> ignore incoming non-priority signals (effectively muting low-priority channels).
- Relays (12 slots): target 4 free. Below 4 free -> compress fires. Below 2 free -> filter tightens to "critical only."
- Command (14 slots): target 4 free. Below 4 free -> reroute hook to shed one channel. Below 2 free -> broadcast "all-quiet" (tells all units to reduce signal volume).

The workbench shows her Command blueprint. The rules panel is a stack of condition-action pairs, drag-ordered by priority. At the top: "IF own buffer > 10 -> reroute: drop lowest-priority channel." Then: "IF own buffer > 12 -> broadcast `all-quiet` on `command-net`." These are her circuit breakers. She has designed a self-regulating system: when information pressure rises, the system automatically sheds load.

**Minute 1:30 — The Enemy Jammer**
She hits EXECUTE. Early ticks are clean — her scouts fan out, relay compresses, striker waits. Then tick 8: an enemy Specialist unit enters the board. It is a jammer. Its skill: every tick, it broadcasts garbage signals on common channel names — `threat-net`, `status-net`, `command-net`. If Maya's units are listening on those channels, the garbage fills their buffers.

**Minute 2:00 — The Jam Wave Hits**
Tick 10. The jammer's first broadcast arrives. Maya's Scout-Alpha was at 3/6 (3 free — healthy headroom). Three garbage signals arrive on `threat-net`. Buffer jumps to 6/6. Full. The eviction flash fires at the left edge as the oldest observation is pushed out. But because the headroom absorbed the initial burst, the Scout does not stun. Its rule fires: buffer > 4, switch to evade. It begins retreating while its FIFO eviction pushes the garbage signals forward in the queue. By tick 12, the oldest garbage has aged out and the Scout's own fresh observations have replaced them. Buffer: 4/6. Headroom partially restored.

**Minute 2:30 — The Relay Under Siege**
The Relay is hit harder. It listens on 4 channels, and the jammer is broadcasting on 3 of them. In one tick, 6 garbage signals arrive. The Relay was at 7/12 (5 free — above target headroom). It jumps to 12/12. Full. One more tick of this and it stuns. Compress fires: 12 -> 6 slots occupied. Headroom restored to 6 free. But next tick, 6 more garbage signals arrive. Back to 12/12. Compress is on cooldown (every 3 ticks). Next tick: 6 more garbage signals. Buffer full, new signals arrive — **stun**. The Relay sparks and jitters, losing a tick.

**Minute 3:00 — The Command Agent Responds**
Maya's Command agent, listening on `status-net`, receives the Relay's automated "buffer critical" signal (a hook she configured: "when own buffer > 10 -> send `buffer-critical` on `status-net`"). The Command's buffer is at 8/14 — healthy headroom of 6. It processes the alert. Its rule fires: "IF receive `buffer-critical` from Relay -> reroute Relay to ignore `status-net`." One channel shed. Next tick, the Command receives another critical alert. Rule fires again: "IF Relay still critical -> reroute Relay to ignore `command-net`." The Relay is now listening on only 2 channels instead of 4. Garbage input drops from 6/tick to 2/tick. The Relay stabilizes at 4/12. Crisis averted — the Command agent used its headroom to absorb the alerts and its reroute skill to relieve the downstream pressure.

**Minute 3:45 — Maya's Realization**
She watches this play out with her hands off the keyboard. The system is self-healing. The headroom at each layer gave the system enough time to react: the Scout's headroom absorbed the initial burst and bought time to retreat. The Relay's headroom absorbed the first wave and bought time for compress to fire. The Command's headroom absorbed the crisis alerts and bought time to reroute. Without headroom, the stun cascade would have been immediate and total — Scout stunned, Relay stunned, Command overwhelmed, entire network dark.

"It's like... circuit breakers in a power grid," she murmurs. "Each one trips in order, shedding load, so the whole system doesn't go down." She grins. She has independently discovered the real-world pattern of **graceful degradation** through a game about robot armies.

**Minute 5:00 — The Counter-Attack**
With the Relay stabilized, Maya's Striker gets clean threat data and engages the jammer. One-shot, one-kill. The jammer is eliminated. Buffer bars across the network immediately cool — the garbage signals stop, headroom returns to target levels. The Relay auto-restores its channels (the Command's reroute rules have a complement: "IF Relay buffer < 6 for 3 consecutive ticks -> restore dropped channel"). The system self-heals in both directions.

**Minute 6:00 — Inspector Deep Dive**
Maya scrubs to tick 10 — the moment the jam hit. She clicks the Relay. The context window chart shows a terrifying spike: 7 -> 12 -> 6 (compress) -> 12 -> STUN -> 0 (stun tick) -> 4 (recovery with reduced channels). Two near-miss diamonds and one red stun marker. She clicks the Command at the same tick range. Its buffer shows a calm ascent: 8 -> 9 (receives Relay's critical alert) -> 10 (processes, fires reroute) -> 9 (one less incoming channel) -> 8. No drama. The Command's 14-slot buffer with 6-slot headroom was overkill for this scenario — and that is exactly the point. "Headroom on the Command is non-negotiable," she thinks. "It's the brain. The brain can never stun."

**UI Annotations:**
- **Jammer unit visual**: Enemy Specialist pulses with concentric red rings emanating outward — visual shorthand for "broadcasting." The rings hit player units and their buffer bars flicker.
- **Reroute animation**: When the Command fires a reroute, a dashed line between the rerouted unit and the dropped channel blinks out — the visual equivalent of unplugging a cable.
- **Channel restoration**: When a channel is restored, the dashed line blinks back in with a brief cyan glow.
- **Stun recovery**: After a stun tick, the unit's buffer bar drains from solid red to partial fill with a "flushing" animation — slots clearing from left to right.

---

### Journey: Tito, 42, High School Math Teacher, Mission 3 (Introduction to Hooks)

**Context:** Tito is new to strategy games. He is playing slowly, reading every boot log, trying to understand the system. Mission 3 introduces hooks — reactive triggers that let units communicate. He has two pre-placed Scouts and one Striker. He does not yet know about headroom as a strategy. This journey shows how the game's visual feedback naturally teaches headroom awareness.

**Minute 0:00 — First Hook Configuration**
Plan screen. Tito has been carefully reading the boot log for Mission 3. It introduced hooks: "When a unit detects something, it can tell other units." He sees his Scout-Alpha in the workbench. It already has `patrol` equipped. The hook panel shows two empty hook slots with dashed outlines. He drags "on detect enemy" into slot 1 and types `alert` as the channel name. He connects his Striker to listen on `alert`. Simple setup: Scout sees enemy, tells Striker.

**Minute 1:00 — The First Execution**
He hits EXECUTE. Sealed watch. The two Scouts patrol. Their buffer bars are short — 6 segments each. For the first few ticks, the bars show 1-2 green segments (terrain observations). Lots of dark gray. The board is quiet. Tito notices the dark segments but does not think about them. They are just... empty.

**Minute 2:00 — Contact**
Tick 7. Scout-Alpha enters a zone with 3 enemies. Three green segments slam into the buffer. The bar goes from 2 occupied to 5 occupied in one tick. Tito sees the change — the bar visually lurched from mostly-dark to mostly-lit in a single frame. "Whoa." The hook fires: 3 threat signals sent on `alert`. The Striker's buffer, previously at 1/8 (one self-observation), receives 3 blue signals. Bar jumps to 4/8. Still half empty.

**Minute 2:30 — The Quiet Lesson**
Tick 8. Scout-Alpha still sees 3 enemies. Three more observations enter. Old observations evict. The bar stays at 5/6 — one free slot. The eviction flash blinks at the left edge. Tito notices the red pip. "What was that?" Tick 9: same situation. 5/6. Eviction flash. The one dark gray segment at the right end of the bar is conspicuously alone — a single empty seat in a packed theater. Tito finds himself staring at that one empty slot. He doesn't know the word "headroom" but he feels its thinness. "That little guy is almost full."

**Minute 3:00 — The Close Call**
Tick 10. Scout-Alpha moves deeper into the enemy zone. A 4th enemy enters perception range. Four observations in one tick. The buffer, already at 5/6, receives 4 new items. Five must evict. The buffer churns completely — every old entry pushed out, replaced by the 4 observations plus 1 surviving entry from last tick. But critically: 4 items arrive, only 1 slot was free, so 3 excess items cause eviction. The buffer is at 6/6. Full. No stun yet — exactly 6 items fit in 6 slots after eviction. But if one more signal arrives this tick from the hook echo... it does not, because hooks transmit outgoing, not incoming. The Scout survives by one slot.

**Minute 3:15 — Tick 11, The Stun**
A signal arrives from Scout-Beta on `alert` (Scout-Beta also detected an enemy and broadcast). One blue signal into a 6/6 buffer. Context overload. The Scout sparks, jitters, freezes for one tick. Its buffer bar goes solid red. Tito gasps. "No no no!" The enemy is one tile away. Tick 12: the Scout is still stunned. The enemy moves adjacent. Tick 13: Scout recovers, but the enemy is on its tile. One-shot, one-kill. Scout-Alpha is destroyed. The buffer bar vanishes.

**Minute 4:00 — The Debrief Revelation**
Inspector. Tito clicks Scout-Alpha at tick 10. The buffer state panel shows six horizontal bars, all occupied: `[enemy_1, enemy_2, enemy_3, enemy_4, scout_beta_threat, enemy_1_update]`. The ghost entries below show what was evicted: older observations about terrain and previous enemy positions. He scrubs to tick 11. A seventh entry arrives (highlighted red): `scout_beta_alert_signal`. Below the buffer: **"CONTEXT OVERLOAD — 1 TICK STUN."** The decision trace shows: "No rule evaluated. Unit stunned."

Tito scrubs back to tick 6 — the tick before contact. Buffer: `[terrain_A4, terrain_B5, _, _, _, _]`. Two occupied, four empty. Four beautiful dark gray slots. Room for anything. He scrubs forward tick by tick and watches the dark gray disappear, one slot at a time, until tick 11 when the last one fills and the stun triggers.

**Minute 5:00 — The Insight**
"Those empty slots were protecting it," Tito says quietly. He doesn't use the word headroom or capacity planning. But he understands, viscerally, that the dark gray segments were not waste — they were a safety margin. When they were gone, the unit was vulnerable. He goes back to the Plan screen and thinks about how to keep more dark gray on the bar. He removes `alert` from Scout-Alpha's listen list — the Scout should not receive signals from other Scouts, only send them. That eliminates incoming hook messages, freeing buffer slots for observations. He also adds a second rule: "IF no enemy in perception -> stop patrol" — reducing movement into crowded areas.

**Minute 6:30 — The Retry**
Second execution. Scout-Alpha detects the same enemy cluster. Buffer goes to 4/6. No incoming hook messages (it is not listening). Two free slots — those reassuring dark gray segments at the right end of the bar. The hook fires, signaling the Striker. Tick after tick, the Scout's bar holds at 4/6 or 5/6. Never full. Never stunned. The one dark gray segment that was the difference between life and death is now two or three segments. Tito smiles. He has learned to value emptiness.

**Minute 7:30 — Resolution**
The Striker engages and clears the enemies. Tito feels proud. Not because he won — but because he understood why he lost last time and fixed it. The empty slots are no longer invisible. They are the most important thing on the screen.

**UI Annotations:**
- **Buffer bar progression**: During Sealed Watch, the bar's transition from mostly-dark to mostly-lit happens in discrete jumps (one per tick) with a brief pulse animation on newly filled slots. The visual rhythm — dark, dark, PULSE-lit, PULSE-lit, PULSE-lit — teaches the player to read fill rate.
- **Stun animation**: The unit tile dims to 50% brightness. The buffer bar goes solid red and vibrates 2 pixels left-right at 15Hz for the stun duration. A tiny "!" icon appears above the unit. After recovery, the bar flushes (slots clear left-to-right) and the unit brightens back to normal.
- **Inspector ghost entries**: Evicted data appears below the buffer as faded horizontal bars with a red X. They scroll down as more data evicts, creating a visual "graveyard" of lost information. The graveyard length tells the player how much data the unit has lost.
- **Empty slot rendering**: In the Inspector's detailed buffer view, empty slots show a dashed outline with the text "available" in light gray. This is the only place the game uses the word — a gentle nudge that empty is not broken, empty is ready.

---

## Strengths

**Teaches a real engineering principle.**
Buffer headroom maps directly to capacity planning, one of the most important concepts in systems engineering. Players who internalize "always keep two free" will recognize the same principle when they encounter Kubernetes resource limits, database connection pool sizing, or network bandwidth provisioning. The game does not need to explain this — the mechanic teaches it through consequence.

**Creates meaningful decisions at every skill level.**
A beginner learns "don't fill the buffer" through painful stun-locks. An intermediate player learns "configure listen channels to control fill rate." An advanced player learns "build self-regulating architectures that maintain headroom dynamically." The same mechanic serves all three, with increasing depth.

**Leverages existing locked mechanics — no new systems needed.**
Headroom management uses only listen/ignore toggles, filter rules, compress skills, and rule conditions that reference buffer state. All of these are already in the locked design. The "strategy" is an emergent property of understanding the existing system deeply, not a bolt-on feature.

**The visual language is already built.**
The buffer bar with its dark-gray empty segments, the eviction flash, the context window chart in the Inspector — all locked. The headroom strategy emerges from reading these visuals correctly. The game rewards observational skill.

**Scales with campaign difficulty.**
Early missions (1-3) teach buffer basics. Mission 4 introduces noise flooding, making headroom valuable. Missions 6-7 introduce the Command agent, enabling dynamic headroom management. Missions 8-10 pit the player's headroom architecture against an enemy factory that actively attacks buffer capacity. The strategic depth of headroom grows with the campaign.

## Weaknesses

**Risk of over-conservatism.**
If players learn "always keep two free" too rigidly, they may under-utilize their units. A Scout running at 2/6 is only using a third of its memory — it is effectively a dumber unit than it needs to be. The game must teach that headroom is a *trade-off*, not an absolute good. Missions where lean architectures outperform conservative ones (because the extra data is actually needed) prevent the "always keep two free" doctrine from becoming the only correct strategy.

**Hard to communicate "why" without Inspector.**
During Sealed Watch, the player sees buffer bars filling and emptying. But the *reason* headroom matters — surviving burst events — is not visible until it fails. A player whose headroom holds successfully just sees... nothing bad happening. The good outcome is invisible. Only the Inspector's near-miss markers retroactively show how close they came. This is a known challenge with defensive strategies in games (like Into the Breach's shield — you only appreciate it when you see the damage it absorbed).

**Small-buffer units pay disproportionately.**
A Scout sacrificing 2 of 6 slots loses 33% of its context capacity. A Command sacrificing 2 of 14 loses 14%. This means headroom strategy is most expensive for the units that are already the most constrained. Players may feel that Scouts are "too dumb" when running with headroom, creating frustration. The counter-argument is that Scouts are supposed to be lightweight — their job is to observe and report, not to remember everything.

**Potential for "solved" optimal headroom levels.**
If the game's maximum burst size is deterministic and knowable, players can calculate the exact headroom needed and the strategy becomes rote. "Jammers send 3 signals per tick, so I need exactly 3 free slots on any unit listening to jammed channels." This reduces headroom from a strategic judgment call to an arithmetic exercise. Invisible randomization (locked in the design) helps here — the burst size varies per run, preventing exact pre-calculation.

## Interaction Effects

**With eviction policies (2.06, 2.07):**
Under the baseline FIFO eviction model, headroom is pure — empty slots are guaranteed capacity for new data. Under priority-based eviction, headroom interacts differently: low-priority data might be evicted *before* the buffer fills, effectively creating "virtual headroom" even in a full buffer. This means headroom management is most critical under FIFO and least critical under smart eviction policies. The two systems are partially redundant — a design tension to be aware of.

**With the emissions model:**
Lean architectures (fewer signals, more headroom) produce less EM noise. This means headroom has a *stealth* benefit beyond stun prevention — quieter units are harder for enemies to detect. This synergy reinforces the headroom strategy and creates a secondary reward layer.

**With the Command agent (Missions 6+):**
The Command agent enables *dynamic* headroom management — adjusting other units' configurations mid-battle to maintain headroom targets. This transforms headroom from a static plan-phase decision into a live operational concern. The most sophisticated architectures use the Command as a "headroom controller" — monitoring buffer utilization across the squad and shedding load when any unit approaches capacity.

**With Mission 5+ factory production:**
When blueprints are mass-produced, headroom configuration is shared across all instances of that blueprint. A headroom-conservative Scout blueprint means *every* Scout runs conservatively. Players who want different headroom profiles for different tactical roles must create separate blueprints (e.g., "Scout-Aggressive" with 0 headroom target for frontline recon, "Scout-Conservative" with 2-slot headroom for rear-area patrol). This creates blueprint proliferation pressure.

## Comparable Games

**Factorio — Throughput headroom:**
Factorio players learn to never run belts at 100% capacity. A belt at 100% cannot absorb any production spike. Experienced players build "buffer chests" — storage points that absorb overflow and release during underflow. The principle is identical to Robot Uprising's buffer headroom. The difference: Factorio's headroom is about throughput over time, while Robot Uprising's is about burst absorption in discrete ticks.

**StarCraft — Supply headroom:**
StarCraft players maintain "supply headroom" — building supply depots before they hit the supply cap, so they can continue producing units without delay. Getting "supply blocked" (hitting max supply with no depot building) is one of the most punished mistakes in competitive play. The parallel is direct: supply block = context overload. Both are momentary losses caused by insufficient headroom that compound into strategic disadvantage.

**Into the Breach — Action economy headroom:**
Into the Breach gives the player 3 mechs and usually 4-6 threats per turn. The "headroom" is the surplus between threats and responses. When the player has exactly as many responses as threats, one mistake is fatal. When they have one extra response (from a bonus action, or because they eliminated a threat pre-emptively), they have headroom for error. The feeling of "I have exactly enough" versus "I have one spare" is the same tension as buffer headroom.

**Screeps — CPU bucket:**
Screeps allocates 20 CPU per tick but allows players to accumulate unused CPU in a "bucket" (up to 10,000). Players who routinely use 19/20 CPU have almost no bucket — any spike in code execution causes CPU throttling. Players who run at 15/20 build up bucket reserves that absorb spikes gracefully. This is direct capacity headroom management with the same tradeoff: efficiency vs. resilience.

## Sensory Description

**The sound of headroom:**
When a unit has 3+ free buffer slots, its ambient audio contribution is a soft, low hum — the sound of a machine running cool. As slots fill, the hum rises in pitch, like a capacitor charging. At 1 free slot, there is a faint high-frequency whine — electrical stress. At 0 free slots (full, not yet overloaded), the whine becomes a sustained tone with subtle crackle, like a transformer under load. At overload: a sharp electric snap followed by the jittering buzz of the stun. The audio gradient teaches headroom status without requiring the player to look at the buffer bar.

**The color of headroom:**
Empty buffer slots on the bar are rendered as dark charcoal gray (#2A2A2A) with a 1-pixel lighter border (#3D3D3D) — visible but recessive, like empty seats in a theater seen from the back row. When a slot is about to be filled (data arriving this tick), the dark gray briefly flashes to a pale version of the incoming data's color (pale green for observations, pale blue for messages) before solidifying — a "filling up" animation that takes 200ms. This micro-animation makes buffer fills feel weighty, like pouring water into a glass.

**The feel of headroom management:**
Configuring headroom in the Plan phase feels like tightening and loosening valves. Each listen toggle is a valve: turn it on and the buffer fills faster; turn it off and it slows. The player is a plumber, adjusting flow rates to keep the system pressurized but not bursting. The satisfying moment is when all the buffer bars, across all units, settle into a steady rhythm during Sealed Watch — not too full, not too empty, pulsing gently with the tick clock like resting heartbeats.

**The TikTok clip:**
A Relay under jamming attack. Buffer bar surging toward red. The Command agent icon lights up — a reroute fires. One channel disconnects with a visible *snap* (dashed line blinks out). The Relay's buffer bar immediately drops. Then another channel disconnects. The bar drops further. Cool blue returns. The Relay stabilizes. The camera pulls back to show the whole squad: all buffer bars pulsing calm blue while the enemy jammer broadcasts helplessly into channels no one is listening to anymore. Caption: "Built an AI that heals itself under attack." 15 seconds. Download.

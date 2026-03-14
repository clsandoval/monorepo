# 3.01 — Skills Catalog: The Verb Set of Robot Uprising

## Overview

Skills are what agents **can do** — the verbs of the system. Every other primitive (rules, hooks, context config) operates on or triggers skills. The skill catalog defines the **action space** of the game. Too few skills and the game is shallow. Too many and the workbench is overwhelming. The design question: what's the minimum set of skills that produces maximum emergent complexity when wired together through hooks and rules?

## Locked Skills (from First Playable Design)

| Unit | Default Skills | Buffer | Hook Slots |
|------|---------------|--------|-----------|
| Scout | patrol, evade | 6 | 2 |
| Striker | engage, breach | 8 | 2 |
| Relay | compress, filter, amplify | 12 | 4 |
| Specialist | hack, extract | 10 | 2 |
| Command | reassign, reroute, prioritize | 14 | 6 |

This gives us **12 named skills** across 5 unit types. Let's define each one mechanically, then explore the design space around them.

---

## The Twelve Core Skills — Mechanical Definitions

### Scout Skills

**Patrol**
- **What it does:** The scout moves along a player-defined waypoint path, observing all units within its perception radius (5 tiles) each tick. Each observed unit generates an observation entry in the scout's buffer: `{type: enemy_striker, position: D4, tick: 17}`.
- **The interesting decision:** Patrol path design. A scout patrolling A1→A8→H8→H1 covers the perimeter but misses the center. A scout on a tight D4→E4→E5→D5 loop covers fewer tiles but generates higher-fidelity data about one area. The player must choose: broad surveillance or deep focus.
- **Interaction with buffer:** A scout with buffer size 6 on a broad patrol fills its buffer every 2-3 ticks in a target-rich environment. Stale observations get evicted per the player's eviction policy. This is the game's core tension: seeing everything means remembering nothing.
- **Sensory:** The patrol path renders as a dotted cyan line on the board during Plan phase. As the scout moves during Sealed Watch, each tile it enters pulses with a soft blue ripple — its "awareness field." When it spots an enemy, a tiny yellow ping appears at the scout's position, barely visible at normal speed but unmistakable when scrubbing in Inspector.

**Evade**
- **What it does:** When an enemy unit enters the scout's perception radius, evade triggers an automatic one-tile movement away from the threat. The scout skips its next patrol waypoint and resumes the path from its new position. Evade generates a buffer entry: `{type: threat_detected, source: enemy_striker, position: C3, evaded_to: B2, tick: 22}`.
- **The interesting decision:** Evade burns a movement tick. A scout that constantly evades never completes its patrol. The player must balance patrol aggression (routes near enemy territory) against survivability. Evade also generates buffer entries, which compete with observation entries for limited buffer space.
- **Interaction with hooks:** Evade is the scout's primary hook trigger. A hook wired to the `threat_detected` event on a channel called "alarm" means every evade broadcasts to the network. But evade is frequent in contested zones — do you want your relay swamped with alarm signals?
- **Sensory:** Evade is a sharp snap — the scout visually "flinches" one tile away, leaving a brief red afterimage on its previous position. The movement isn't smooth; it's a panicked grid-snap. During Sealed Watch, rapid evades create a staccato visual rhythm: blue ripple, red flinch, blue ripple, red flinch.

### Striker Skills

**Engage**
- **What it does:** If an enemy unit is in an adjacent tile (orthogonal or diagonal), the striker eliminates it. One-shot, one-kill. The striker generates a buffer entry: `{type: target_eliminated, target: enemy_scout, position: E5, tick: 31}`. The striker does NOT move toward enemies — it only kills what's already adjacent.
- **The interesting decision:** Engage is entirely passive without supporting information. A striker standing at D4 with no buffer entries doesn't know where enemies are. It needs scouts and relays feeding it position data so its rules can move it into adjacency. The skill is powerful but completely dependent on the information architecture.
- **Interaction with rules:** Rules govern WHEN to engage vs. when to do something else. A rule like "IF buffer contains threat_detected AND distance_to_threat ≤ 2 THEN move toward threat" isn't engage itself — it's the movement decision that creates the adjacency that lets engage trigger. Engage is the payoff; rules are the setup.
- **Sensory:** Engage is the most violent visual in the game. A crimson flash fills both tiles — the striker's and the target's. The target unit doesn't fade or animate; it snaps to a destroyed sprite instantly, like a light switching off. A single sharp metallic clang sound. The cell stays tinted red for 2 ticks before fading. In a well-orchestrated flanking maneuver, multiple engages on the same tick create a synchronized red flash across the board — the visual signature of a successful architecture.

**Breach**
- **What it does:** The striker can destroy enemy structures (relay stations, bases) when adjacent. Breach takes 2 ticks instead of 1 — the striker commits to breaching for 2 consecutive ticks and is vulnerable during this time. Generates: `{type: breaching, target: enemy_base, position: H8, ticks_remaining: 1, tick: 45}`.
- **The interesting decision:** Breach creates a commitment window. A striker breaching a base for 2 ticks can be flanked by an enemy striker. The player must decide: send a lone striker to breach (risky) or escort it (resource-expensive). Breach is the game's only multi-tick action, introducing a temporal vulnerability that doesn't exist elsewhere.
- **Interaction with hooks:** A breaching striker should broadcast its vulnerability. A hook on "breaching" to a channel called "cover_me" lets relays and other strikers know to converge. But broadcasting also generates EM noise, potentially revealing the attack to the enemy.
- **Sensory:** Breach is a sustained amber glow on the target structure, pulsing once per tick. The striker's sprite shifts to a "locked in" pose — leaning forward, arms extended. A low, grinding hum plays during the breach. When complete, the structure shatters with a white flash and scattered pixel debris that lingers for 3 ticks. The 2-tick duration makes breach feel weighty and committed — the opposite of engage's instant snap.

### Relay Skills

**Compress**
- **What it does:** Takes multiple buffer entries and combines them into a summary. Three observation entries like `{enemy_scout at C3}`, `{enemy_scout at C4}`, `{enemy_scout at C5}` become one compressed entry: `{enemy_scout, moving_south, corridor_C, ticks 12-14}`. The compressed signal takes 1 buffer slot instead of 3, preserving the essential information.
- **The interesting decision:** Compression is lossy. The compressed signal loses exact tick timing and precise positions. A striker receiving a compressed signal knows "enemy moving south through column C" but not "enemy was at C4 at tick 13." Is that enough? It depends on the striker's rules. Compression trades fidelity for bandwidth — the core tradeoff of any communication system.
- **Interaction with hooks:** Compress fires after accumulating N entries of the same type (configurable by the player — the "compression threshold"). Setting the threshold to 2 means frequent, low-quality compressions. Setting it to 5 means rare, high-quality summaries but the relay's buffer fills up while waiting. This is literally the batch-size decision in data engineering.
- **Sensory:** Compression is visualized as buffer slots physically merging. During Inspector playback, you see three bright slots slide together and become one slightly larger, brighter slot — like three stars collapsing into one. The compressed entry has a small diamond icon indicating it's derived data. The compression event shows as a subtle pulse on the relay's antenna sprite — a blue-white flash.

**Filter**
- **What it does:** Discards buffer entries matching player-defined criteria. A relay configured to filter `type: threat_detected, source: enemy_scout` will automatically discard all scout threat reports, keeping its buffer clear for striker and specialist signals. Filtered entries are silently dropped — they never occupy a buffer slot.
- **The interesting decision:** Filtering is the attention system's immune system. Too aggressive and you miss critical intel. Too permissive and your relay drowns in noise. A relay filtering out scout reports works great until the enemy sends a scout-disguised-as-striker (via the Specialist's hack skill), and the real threat report gets silently discarded.
- **Interaction with context config:** Filter and context config's listen/ignore toggles overlap. Listen/ignore controls which channels the relay receives on. Filter controls which entries survive AFTER reception. They're two stages of the same pipeline: channel-level gating, then content-level gating. Players who understand both stages can build extremely precise information pipelines.
- **Sensory:** Filtered entries appear briefly as ghost slots — transparent gray rectangles that flash into existence in the relay's buffer bar and immediately dissolve, like bubbles popping. During Inspector, filtered entries show in the buffer state display with a red strikethrough, and hovering reveals "FILTERED: matched rule [scout_threat_ignore]." The filter rule name is player-assigned, creating a vocabulary of attention policies.

**Amplify**
- **What it does:** Retransmits a signal to all units listening on a specific channel, boosting its priority. An amplified signal enters receiving buffers with a priority flag, making it resistant to eviction. Normal entries evict oldest-first by default; amplified entries survive one extra eviction cycle.
- **The interesting decision:** Amplify is the relay's "megaphone." Amplifying everything is useless — if everything is high priority, nothing is. The player must write rules governing WHEN the relay amplifies. "Amplify only when buffer contains breach_in_progress" means the relay acts as an alarm system. "Amplify all compressed signals" turns it into a broadcasting tower. Each amplification strategy creates a different network topology.
- **Interaction with EM emissions:** Amplify generates the most EM noise of any relay skill. A relay that amplifies frequently is a beacon — enemies can detect it and send strikers. This creates a beautiful tension: the more effectively your relay communicates, the more danger it's in. Loud networks are smart but fragile.
- **Sensory:** Amplify is a concentric ring animation emanating from the relay, like a radar ping. The rings are green for friendly channels, shifting to yellow at the edges as the EM noise dissipates. Amplified signals in the buffer bar have a small upward arrow icon and glow slightly brighter than normal entries. During Sealed Watch, a relay that amplifies multiple times in sequence creates overlapping rings — a visual representation of a noisy node.

### Specialist Skills

**Hack**
- **What it does:** When adjacent to an enemy unit, the specialist can read the enemy's buffer contents for 1 tick. The hacked data enters the specialist's buffer as `{type: intelligence, source: enemy_relay_B, buffer_snapshot: [...], tick: 38}`. The enemy unit is unaware it's been hacked.
- **The interesting decision:** Intelligence is the game's highest-value signal. Knowing what the enemy knows — their scout reports, their compression patterns, their hook wiring — lets you predict their next moves. But hack requires adjacency (dangerous for a medium-speed unit) and generates a large buffer entry (the snapshot takes 3 buffer slots). A specialist with buffer 10 can carry at most 3 intelligence snapshots before its buffer is full.
- **Interaction with hooks:** Hacked intelligence, forwarded via hook to a command unit, enables the most sophisticated plays in the game. A command unit that receives enemy buffer snapshots can deduce enemy patrol routes, identify communication gaps, and reassign your units to exploit them. This is the meta-level: using enemy information architecture against them.
- **Sensory:** Hack is subtle and sinister. A thin green line connects the specialist to its target for exactly 1 tick — a "data siphon" visible only if you're watching. No sound effect on the target's side. On the specialist, a brief cascade of green text scrolls through its buffer bar, like a terminal dump. In Inspector, hacked intelligence entries have a distinctive jagged border — data that was stolen, not observed or communicated.

**Extract**
- **What it does:** The specialist can extract resources from tagged map nodes at double the passive rate. While adjacent to a resource node, the specialist generates 2x the normal material income. Generates: `{type: extracting, node: E3, bonus: +2m/tick, tick: 40}`.
- **The interesting decision:** Extract makes the specialist a dual-use unit — intelligence gatherer OR economy booster. Assigning a specialist to extraction duty is safe (resource nodes are usually behind your lines) but wastes its hack capability. The player must choose between information advantage and economic advantage. This is the classic RTS decision: tech vs. economy.
- **Interaction with production:** Extra resources from extraction let you build more units faster. A specialist extracting while your scouts and relays gather intel means your factory produces strikers sooner. But a specialist hacking enemy buffers might reveal the enemy's production queue, letting you counter-build. Short-term economy vs. long-term information — the game's deepest strategic tension.
- **Sensory:** Extract is a steady amber pulse on the resource node, synchronized with the material income tick. Floating "+2m" text rises from the node each tick, gold-colored and slightly larger than the base "+1m" from passive income. The specialist's sprite shifts to a "tethered" pose — one arm extended toward the node, data streams flowing between them. It looks productive and grounded, the visual opposite of hack's stealthy green siphon.

### Command Skills

**Reassign**
- **What it does:** The command unit can change which skills are active on subordinate units within its perception range (which is 0 — command units use buffer data, not direct perception). Specifically, reassign sends a message to a target unit's buffer: `{type: command_override, skill_change: {deactivate: patrol, activate: evade_only}, source: command_A, tick: 50}`. The receiving unit's rules must include a rule that respects command overrides — otherwise the message is just data.
- **The interesting decision:** Reassign is the meta-skill — the skill that modifies other skills. A command unit that reassigns a scout from "patrol" to "evade_only" turns an intelligence gatherer into a decoy. But reassign only works if the receiving unit's rules process command overrides. A unit without a "respect command" rule ignores reassign messages. This creates an opt-in hierarchy: units must be configured to listen to commands.
- **The design tension:** Should command overrides be mandatory (units must obey) or advisory (units can ignore based on rules)? The advisory model is more interesting — it means the player must explicitly wire subordination into each unit's rules, creating an opt-in chain of command. A rebellious scout that ignores command overrides because its rules prioritize self-preservation is an emergent behavior, not a bug.
- **Sensory:** Reassign renders as a downward-pointing yellow arrow from the command unit's position toward the target (even though command units have no perception and the arrow is abstract — it represents the message path through the hook network). The target unit briefly flashes yellow when it receives the override, and its skill display in Inspector shifts to show the new active skill set. If the target ignores the override (rules don't process it), a small red "X" appears over the arrow — the command was sent but not obeyed.

**Reroute**
- **What it does:** The command unit can change which channels a subordinate unit listens to or broadcasts on. A reroute message: `{type: command_override, channel_change: {stop_listening: "alarm", start_listening: "flank_alpha"}, source: command_A, tick: 55}`. This dynamically rewires the network topology mid-battle.
- **The interesting decision:** Reroute is the most powerful skill in the game. Mid-battle channel rewiring means the player's pre-configured network isn't static — it evolves. A command unit that reroutes scouts from "general_intel" to "flank_alpha" when it detects an enemy push creates an adaptive architecture. But rerouting too aggressively fragments the network — units listening on different channels can't coordinate.
- **Interaction with hooks:** Reroute changes which hooks fire where. If a scout's hook sends observations on "general_intel" and the command reroutes it to "flank_alpha," all units still listening on "general_intel" lose that scout's feed. Reroute is network surgery — powerful but dangerous.
- **Sensory:** Reroute renders as the channel wiring lines on the board physically moving. During Sealed Watch, you see a thin colored line (matching the channel's auto-assigned color) detach from one network and reattach to another. It's like watching someone unplug a cable and plug it into a different port. The transition takes 1 tick — during which the rerouted unit is briefly disconnected from both channels. A subtle "click" sound plays.

**Prioritize**
- **What it does:** The command unit can change the eviction policy of a subordinate's buffer. A prioritize message: `{type: command_override, eviction_change: {preserve_type: intelligence, evict_first: threat_detected}, source: command_A, tick: 60}`. This reorders what the subordinate remembers and what it forgets.
- **The interesting decision:** Prioritize is attention management at one remove. A relay that normally evicts oldest-first can be reprioritized to preserve compressed signals and evict raw observations. This changes the relay's behavior without changing its rules — it sees the same data but remembers different parts of it. The player is tuning a subordinate's memory, not its behavior.
- **Interaction with buffer mechanics:** Prioritize creates dynamic buffer configurations. A command unit that watches the battle state (via relay reports) and adjusts subordinate memory priorities is the closest thing to real-time AI tuning in the game. It's the factory that builds the factory — the meta-level the design doc describes.
- **Sensory:** Prioritize has no board-level visual effect — it's internal to the target unit. In Inspector, a prioritized unit's buffer bar shows a reordered color scheme: slots containing preserved types glow steadily, while evict-first types dim slightly, like priorities visualized as brightness levels. A small crown icon appears on preserved entries.

---

## Unexplored Skill Design Space

The 12 locked skills form a coherent set, but the design space around them is vast. Here are the key dimensions:

### Dimension 1: Skill Unlocking (What if skills aren't all available from the start?)

**Option A: All Skills Available, Complexity from Wiring**
- Every unit has all its skills from mission 1. Depth comes from rules, hooks, and context config — not skill acquisition.
- **Strength:** Consistent design language. Players learn 12 skills once and then compose them forever.
- **Weakness:** First encounter is 12 new verbs at once. Can overwhelm.

**Option B: Skill Unlock via Campaign Progression (Locked in First Playable)**
- Missions 1-4 introduce skills incrementally. Mission 1: patrol + engage only. Mission 2: adds evade + compress. Mission 3: adds hooks. Mission 4: adds hack, filter, amplify. Mission 5+: command skills.
- **Strength:** Natural difficulty curve. Players master each skill before the next arrives.
- **Weakness:** Early missions may feel constrained. Replaying mission 1 with only 2 skills available is less interesting.

**Option C: Skill Discovery Through Play**
- Skills aren't listed in a menu. Players discover them by configuring rules that create the conditions for a skill to emerge. Example: a relay configured with "when buffer contains 3+ observations of same target → combine into one entry" has effectively discovered "compress."
- **Strength:** The "aha!" moment of discovery. Aligns with the game's theme of emergent behavior.
- **Weakness:** High frustration risk. Players who can't discover a skill can't progress.

### Dimension 2: Skill Modification (Can skills be tuned?)

**Option A: Binary Skills (On/Off)**
- Each skill either works or doesn't. Patrol is patrol. Compress is compress. No parameters.
- **Strength:** Simplicity. 12 skills × on/off = manageable complexity.
- **Weakness:** Limited expression. Every scout patrols the same way.

**Option B: Parameterized Skills**
- Each skill has 1-3 tunable parameters:
  - Patrol: waypoint count (2-6), dwell time per waypoint (0-3 ticks)
  - Compress: threshold (2-5 entries), compression type (spatial/temporal/type-based)
  - Amplify: priority boost level (1-3), range multiplier (1x-2x)
  - Hack: duration (1-3 ticks, longer = more data but more risk)
- **Strength:** Deep customization. Two scouts with different patrol parameters behave differently.
- **Weakness:** More knobs = more confusion. Parameters multiply the workbench complexity.

**Option C: Skill Evolution**
- Skills improve with use. A scout that patrols for 100 ticks unlocks "deep patrol" (perception +1). A relay that compresses 50 times unlocks "smart compress" (automatic type detection).
- **Strength:** RPG-like progression. Units feel personal.
- **Weakness:** Contradicts the "design the system, don't level up" philosophy. Players should win through architecture, not grinding.

### Dimension 3: Cross-Unit Skill Sharing (Can skills transfer between unit types?)

**Option A: Skills Are Unit-Locked**
- Scouts can only patrol and evade. Period. Unit identity IS skill identity.
- **Strength:** Clear roles. Players know what each unit does at a glance.
- **Weakness:** Limits creativity. What if the optimal strategy needs a relay that can evade?

**Option B: Command Units Can Grant Skills**
- The reassign skill can grant non-native skills to subordinates, at reduced effectiveness. A relay with an evade grant moves 1 tile every 2 ticks instead of 1.
- **Strength:** The command unit becomes more valuable. Late-game configurations are wildly creative.
- **Weakness:** Balance nightmare. A relay with engage is potentially broken.

**Option C: Universal Skill Slots + Unit Aptitudes**
- All units have 2-4 skill slots. Any skill can go in any slot, but units have aptitude multipliers. A scout has 1.5x patrol effectiveness but 0.5x compress effectiveness. You CAN make a compressing scout; it's just worse at it.
- **Strength:** Maximum player expression. "Build whatever you want."
- **Weakness:** Destroys unit identity. If any unit can do anything, unit types are meaningless.

---

## Player Journeys

### Journey: Kira, 22, Game Design Student

**Context:** Mission 2. Kira has completed Mission 1 (patrol + engage only). She now has scouts with evade and relays with compress. She's played strategy games before but nothing with explicit AI/attention mechanics.

**Minute 0:00 — Plan Phase Opens**
The 8x8 board sits on the left, mostly dark green jungle tiles. Two pre-placed scouts are highlighted with cyan outlines. The workbench panel on the right shows Scout-A's blueprint: skills [patrol ✓] [evade ✓], rules panel empty, hooks panel empty, context config showing buffer size 6 with "evict: oldest first" default.

Kira notices the new skill toggle: [evade] is highlighted with a yellow "NEW" badge. She hovers over it. A tooltip appears: "When a threat enters perception range, automatically moves 1 tile away. Generates a threat_detected buffer entry."

She thinks: "So it'll run away? That seems useful but... wait, it says it generates a buffer entry. That means every time it runs away, it fills up memory."

**Minute 0:30 — Discovering the Evade-Buffer Tension**
Kira enables evade on Scout-A and draws a patrol path through the center of the board — right through where she expects enemies. The ghost preview shows the cyan dotted path crossing into red-tinted enemy territory.

She clicks "EXECUTE." The board transitions to Sealed Watch. The tick clock starts.

Tick 5: Scout-A reaches the center. Two enemy scouts appear at the edges.
Tick 7: An enemy enters Scout-A's perception radius. Evade fires — the scout flinches one tile south. A tiny red afterimage lingers. Kira sees Scout-A's buffer bar (six tiny pips at the bottom of the tile) light up: one pip turns red (threat_detected).
Tick 8: Scout-A resumes patrol. Another observation fills a pip (blue for observation).
Tick 9: Another enemy nearby. Evade again. Another red pip.
Tick 11: Buffer is full — 3 red pips (threat_detected), 3 blue pips (observations). The oldest blue pip fades out as a new observation arrives.

Kira watches this pattern for 20 ticks. She sees the problem: evade is filling the buffer with threat data, pushing out the patrol observations she actually needs. The scout is scared and forgetful — it remembers every threat but can't remember what it saw on patrol.

**Minute 2:00 — Inspector Revelation**
After the mission (she barely succeeds — her strikers stumbled into enemies by luck), the Inspector opens. She clicks Scout-A and scrubs to tick 15. The buffer state shows:

```
Slot 1: [threat_detected] enemy_scout at D5, tick 13 — RED
Slot 2: [threat_detected] enemy_striker at E4, tick 12 — RED
Slot 3: [observation] enemy_base at H7, tick 9 — BLUE (dim, about to evict)
Slot 4: [threat_detected] enemy_scout at C6, tick 11 — RED
Slot 5: [observation] empty_tile at F3, tick 7 — BLUE (barely visible)
Slot 6: [threat_detected] enemy_scout at D4, tick 14 — RED
```

Four of six slots are threat_detected. The actual patrol observations are being crushed.

She thinks: "I need to change the eviction policy. Or... I need the relay's compress skill to combine those threat entries."

**Minute 3:00 — The Learning Moment**
Kira returns to Plan phase and opens the relay's blueprint. She sees the compress skill. She draws a rule: "IF buffer contains 3+ threat_detected entries → compress into 1 entry." She wires a hook: Scout-A sends threat_detected on channel "threats" → Relay-A listens on "threats."

The architecture is now: Scout patrols, evades create threat entries, threats flow to relay, relay compresses multiple threats into one compact signal. The scout's buffer stays cleaner because threats are being consumed by the hook (sent, then evicted).

This is the moment the game teaches: **skills are the atoms, but wiring is the molecule.**

**UI Annotations:**
- Skill toggle: square icon with checkmark, yellow "NEW" badge on first encounter, tooltip on hover
- Buffer bar on unit: 6 tiny horizontal pips, color-coded by entry type (red = threat, blue = observation, green = compressed)
- Ghost preview: dotted cyan line for patrol path, red tint on tiles with known enemy presence
- Inspector buffer: vertical list of slots, each showing type icon + summary text + tick number, brightness indicates age

---

### Journey: Marcus, 38, DevOps Engineer

**Context:** Mission 7. Marcus has all unit types. He's building a command-agent architecture for the first time. He's played Factorio for 800 hours and immediately understood the "factory that builds the factory" pitch.

**Minute 0:00 — The Full Workbench**
The Plan screen shows a complex board state: 3 scouts, 2 strikers, 2 relays, 1 specialist, 1 command unit. The command unit sits at B2, deep in friendly territory. The workbench panel is displaying Command-A's blueprint.

Marcus sees the three command skills: [reassign ✓] [reroute ✓] [prioritize ✓]. Each has a rules panel underneath. He's been thinking about this moment since Mission 5 — he wants to build an adaptive architecture.

He writes a rule for the command unit:
```
IF buffer contains "flank_detected" from channel "situational"
AND buffer contains ≥ 2 "threat_detected" from channel "threats"
THEN reassign Scout-B: deactivate patrol, activate evade_only
AND reroute Relay-A: stop listening "general_intel", start listening "flank_alpha"
AND prioritize Relay-A: preserve type intelligence, evict first threat_detected
```

This single rule, when triggered, reconfigures three subordinate units simultaneously. Scout-B stops gathering intel and becomes a dedicated decoy. Relay-A switches from general broadcasting to focused flank communication. Relay-A's memory reprioritizes intelligence over threats.

**Minute 1:30 — Ghost Preview**
The board lights up with wiring. Channel lines crisscross the grid — "threats" in red, "general_intel" in blue, "flank_alpha" in amber (currently unused, but visible as a dashed line because it's referenced in a reroute rule). The command unit's influence radius shows as a subtle yellow gradient — not perception (it has none) but "units that have rules referencing command overrides."

Marcus hovers over the reroute action. A tooltip shows: "When this fires, Relay-A will disconnect from general_intel (blue) and connect to flank_alpha (amber). All units on general_intel will lose Relay-A's forwarded signals for the remainder of the battle."

He pauses. That's a big commitment. If the flank is a feint, he's blinded his main intel network for nothing.

**Minute 3:00 — The Battle**
Sealed Watch. Tick 12: Scouts report enemy movement on the eastern flank. Entries flow through "threats." Tick 15: The specialist, positioned near the front, hacks an enemy relay and sends intelligence on "situational" — the enemy IS flanking east.

Tick 16: Command-A's rule fires. Three things happen simultaneously:
1. Scout-B's cyan patrol line disappears. It freezes, then starts evading at every opportunity — a nervous blue dot bouncing away from threats.
2. Relay-A's channel wiring physically moves on the board — the blue line (general_intel) detaches with a soft click, and the amber line (flank_alpha) solidifies.
3. Relay-A's buffer bar shifts — intelligence entries (green with jagged border) brighten, threat entries (red) dim.

Marcus watches this cascade with the satisfaction of a Factorio player watching belts start flowing. The system he designed is **thinking**. It detected a threat, assessed it with hacked intelligence, and restructured itself — all without his input during execution.

Tick 22: Two strikers converge on the eastern flank via flank_alpha routing. They engage two enemy strikers in adjacent tiles. Double crimson flash. The flank is crushed.

Tick 28: But the western side is dark now — Relay-A isn't forwarding general_intel anymore. An enemy scout sneaks through undetected. Marcus sees it happening but can't intervene — Sealed Watch, no controls.

Tick 35: The enemy scout reaches Marcus's base. Tick 37: An enemy striker follows. Breach begins — 2-tick amber glow on his base.

Marcus's heart rate spikes. His architecture saved the east flank but exposed the west. The command unit's reroute was the right call tactically but created a structural vulnerability.

**Minute 5:00 — Inspector Debrief**
Marcus scrubs to tick 16 — the reroute moment. He clicks the command unit and reads its buffer at that tick:

```
Slot 1: [intelligence] enemy flank confirmed, 3 strikers east — tick 15
Slot 2: [threat_detected] enemy_scout at F7, east — tick 14
Slot 3: [threat_detected] enemy_striker at G6, east — tick 13
Slot 4: [compressed] enemy movement pattern, east corridor — tick 12
...
```

All east. No west data. The command unit couldn't reroute units to cover west because it had no information about west. Its buffer was 100% east-focused because that's where the scouts were looking.

Marcus thinks: "I need a scout on a western patrol that reports on a separate channel. And the command unit needs a rule: 'IF no data from channel west_intel for 5+ ticks THEN prioritize coverage.'"

This is the game teaching **the absence of information is itself information** — but only if you write rules that detect silence.

**UI Annotations:**
- Command rule editor: nested condition builder (IF/AND/THEN), each action has a target unit dropdown, channel autocomplete, and skill/priority selector
- Channel wiring on board: colored lines matching channel names, dashed when inactive, solid when in use, physical disconnect/reconnect animation during reroute
- Influence radius: subtle yellow gradient around command unit, not a circle but a highlight on all "obedient" units
- Buffer priority visualization: brightness scale on buffer bar pips (bright = preserved, dim = evict-first)

---

### Journey: Anika, 14, Minecraft Redstone Builder

**Context:** Mission 1. Anika has never played a strategy game. She builds complex redstone contraptions in Minecraft. She heard about Robot Uprising from a TikTok showing someone's "robots organizing themselves."

**Minute 0:00 — First Boot**
The screen is dark. Green text scrolls:

```
> INITIALIZING SUBSYSTEM: MOTOR CONTROL... OK
> INITIALIZING SUBSYSTEM: PERCEPTION... OK
> INITIALIZING SUBSYSTEM: SKILL REGISTRY...
>   patrol v1.0 — move along waypoints, observe surroundings
>   engage v1.0 — eliminate adjacent threats
> SKILL REGISTRY LOADED: 2 SKILLS ONLINE
> AWAITING OPERATOR INPUT...
```

Anika recognizes this from Minecraft command blocks — systems booting up. She grins.

The Plan screen opens. A small 8x8 board with 2 friendly scouts (cyan) and 3 enemy scouts (red) scattered around. The workbench panel on the right shows Scout-A with two skills: [patrol] and [engage]. Wait — scouts don't have engage in the final design. But this is Mission 1, which uses simplified pre-placed units with modified skill sets for tutorial purposes.

Actually, per the locked design, Mission 1 teaches context (buffer awareness). So scouts have patrol, and the player configures buffer and observation settings. Let me adjust:

The workbench shows Scout-A with [patrol ✓] and context config: buffer size 6, eviction: oldest-first. There are no enemies to fight — Mission 1 is purely about observation and memory.

**Minute 0:15 — Drawing a Path**
Anika clicks on the board. A tooltip appears: "Click tiles to set patrol waypoints." She clicks A1, then A8, then H8, then H1. A cyan dotted line connects them — a big perimeter loop. The ghost scout preview shows a little cyan dot tracing the path.

She notices the buffer display on the ghost: 6 empty gray pips. As the ghost moves through its preview loop, some pips light up blue where it "sees" things — the tiles within its perception radius contain a few neutral objects placed as tutorial elements.

She thinks: "Oh, like the memory in a hopper! It fills up and then the old stuff falls out."

**Minute 0:45 — Execute and Watch**
She clicks EXECUTE. Sealed Watch begins. The scout starts moving. Tick by tick it traces her path. At each tile, a soft blue ripple expands — its perception field. The buffer pips slowly fill:

Tick 1: pip 1 lights up (observed neutral landmark at B2)
Tick 3: pip 2 lights up (observed neutral landmark at A6)
Tick 6: pip 3 lights up (something at G7)
...

By tick 12, all 6 pips are full. On tick 13, pip 1 (the oldest) dims and is replaced by a new observation. The "memory overflow" is visible — old data falling off the end.

Anika watches this happen and immediately gets it. "It's a shift register!" she says aloud, mapping it to Minecraft redstone. The buffer is a shift register where new inputs push old data out the back.

**Minute 1:30 — Mission Complete**
The mission objective was simply "observe all 4 landmarks." She did it — her patrol path covered the whole board. But the Inspector shows that by the end, she only had the last 6 observations in memory. The landmarks observed at the start were gone from the buffer.

The debrief screen shows: "Your scout saw everything... but remembered only the last 6 things. Next mission: can you remember what matters?"

Anika thinks: "I need a way to keep the important stuff. Like... a locked chest."

This plants the seed for Mission 2, which introduces eviction priorities and the first real attention decision.

**UI Annotations:**
- Patrol path drawing: click tiles to place waypoints, cyan dots connected by dotted lines, ghost scout preview traces the path
- Buffer pips: 6 tiny horizontal bars below unit icon, gray when empty, blue when occupied, dim-to-transparent animation when evicted
- Perception ripple: expanding blue circle (clipped to grid tiles) that pulses once per tick as scout moves
- Boot log: monospace green-on-black text, typewriter animation, each line appears with a soft keystroke sound

---

## Interaction Effects

### Skills × Rules
Rules determine WHEN skills fire. A skill without a rule is either always-on (patrol, evade) or conditionally triggered (compress fires when buffer threshold met, hack fires when adjacent to enemy). The rules system is what turns skills from static verbs into context-sensitive behaviors. The richness of rules language directly determines the richness of skill expression.

### Skills × Hooks
Hooks determine what HAPPENS AFTER a skill fires. Every skill generates buffer entries. Hooks can trigger on those entries and broadcast them to the network. The hook system is what turns individual skill activations into collective behaviors. Without hooks, each unit is an isolated agent. With hooks, skill activations cascade through the network.

### Skills × Context Config
Context config determines what a unit REMEMBERS about skill activations. A scout with a small buffer and aggressive eviction forgets most of what it patrols past. A relay with a large buffer and preserve-intelligence policy accumulates a deep history. The buffer is the bridge between what a unit does (skills) and what it knows (context).

### Skills × EM Emissions
Active skills generate noise. Patrol is quiet (movement only). Evade is moderately noisy (sudden direction change). Amplify is loud (broadcast). Hack is stealthy (one-tick, low emission). The emission profile of a skill determines whether using it reveals your network. A quiet architecture is invisible but limited; a loud one is powerful but detectable.

### Skills × Production Economy
Each unit type has a material cost and energy upkeep. Skill usage affects the economic calculus: a specialist extracting resources pays for itself. A command unit reassigning constantly burns energy. The economic cost of skill usage creates a budget constraint that limits how many skills can be active simultaneously.

---

## Comparable Games

### Screeps: API Functions as Skills
In Screeps, creeps have body parts (WORK, CARRY, MOVE, ATTACK, HEAL, etc.) that map directly to API functions (creep.harvest(), creep.build(), creep.attack()). Each body part costs energy and occupies a slot. The parallel to Robot Uprising: body parts = skills, slots = buffer size, energy = material cost. Screeps proves that a small set of well-defined primitives can generate enormous complexity through JavaScript composition. Robot Uprising replaces JavaScript with visual rules/hooks.

### Gladiabots: Behavior Priorities as Skill Selectors
Gladiabots uses a visual behavior tree where each node is a condition→action pair. The "actions" are essentially skills: move_to, shoot_at, flee_from, capture_flag. The tree determines which skill fires. Robot Uprising's rules serve the same function as Gladiabots' behavior tree — they select which skill activates based on context.

### Factorio: Inserters as the "Relay" Archetype
Factorio's inserters are stationary units that move items between belts and machines. They compress (stack inserters), filter (filter inserters), and amplify (fast inserters). The relay unit in Robot Uprising is the information-domain equivalent of a Factorio inserter — stationary, focused on throughput, and the backbone of any serious architecture.

### Into the Breach: One-Shot as Clarity
Into the Breach's one-shot kills (one mech attack = one kill or miss) prove that binary combat outcomes enable deeper tactical planning than HP attrition. Robot Uprising's engage/breach following the same model means players plan attacks as single decisive actions, not damage-over-time calculations.

---

## Sensory Summary

The skill system creates a visual language on the battlefield:

| Skill | Visual | Audio | Color |
|-------|--------|-------|-------|
| Patrol | Dotted cyan waypoint line, blue awareness ripple | Soft rhythmic pulse (footsteps on grid) | Cyan/blue |
| Evade | Sharp grid-snap movement, red afterimage | Quick metallic "ting" | Red flash on prior position |
| Engage | Full-tile crimson flash, target snaps to destroyed | Sharp metallic clang | Crimson |
| Breach | 2-tick amber pulse on target structure | Low grinding hum | Amber |
| Compress | Buffer slots merge animation | Soft "whoosh" compression | Blue-white pulse on relay |
| Filter | Ghost slot appears and dissolves | Faint pop (bubble bursting) | Transparent gray |
| Amplify | Concentric ring animation from relay | Radar ping sound | Green rings, yellow at edge |
| Hack | Thin green data-siphon line for 1 tick | No sound on target side | Green terminal cascade |
| Extract | Steady amber pulse on resource node | Low harmonic hum | Gold floating "+2m" text |
| Reassign | Downward yellow arrow to target | Command tone (two ascending beeps) | Yellow arrow, yellow flash on target |
| Reroute | Channel lines physically detach/reattach | Cable click sound | Channel-colored lines |
| Prioritize | Buffer bar brightness reorder | Subtle chime | Bright preserved, dim evict-first |

The battlefield at full complexity is a symphony of these visual and audio elements. A well-architected army creates rhythmic, coordinated pulses — scouts rippling blue, relays pinging green, strikers flashing crimson in sync. A poorly designed army is visual chaos — evade flinches everywhere, filters popping constantly, amplify rings overlapping without purpose.

**The TikTok clip:** A single tick where everything aligns. Three scouts ripple blue simultaneously. Two relays compress and amplify. The channel wiring flashes as signals cascade from perimeter to center. Two strikers flash crimson at opposite ends of the board in the same tick — a perfectly synchronized pincer attack that the player designed but never explicitly programmed. Caption: "I didn't tell them to do this. I just told them what to pay attention to."

---

## New Aspects Discovered

1. **3.01a — Skill parameterization depth:** How many tunable parameters per skill? Binary on/off vs. 1-3 slider parameters vs. fully configurable behavior curves. Impact on workbench complexity and mastery ceiling.
2. **3.01b — Passive vs. active skill distinction:** Some skills fire automatically based on conditions (evade, engage) while others require explicit rule triggers (compress, reassign). Should this distinction be formalized in the UI? What does it mean for the player's mental model?
3. **3.01c — Skill interaction matrix:** Which skills combo with which across unit types? A formal combinatorics exploration: 12 skills × 12 skills = 144 potential interactions. Which are synergistic, which conflict, which are neutral?
4. **3.01d — The "silence detection" skill gap:** Marcus's journey revealed that detecting the ABSENCE of signals is critical. Is there a missing skill for "alert when no data received on channel X for N ticks"? Or should this be achievable through rules alone?
5. **3.01e — Skill visual language consistency:** The 12 skills use different visual metaphors (ripples, flashes, lines, rings, arrows). Do these form a learnable visual grammar? Can a player watching a battle identify which skills are firing without the Inspector?

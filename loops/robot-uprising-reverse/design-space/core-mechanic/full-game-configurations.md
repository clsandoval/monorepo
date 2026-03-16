# 8.03 — "Full Game" Configurations: Coherent Complete Designs Across All Categories

## The Question

Robot Uprising's design space has hundreds of independently explored options. But a shipped game requires a single coherent selection — one choice per design dimension, all working together. This document composes **five distinct "full game" configurations**, each internally consistent, each targeting a different player fantasy and market position. These aren't rankings — they're alternate universes where Robot Uprising shipped with different DNA.

Each configuration specifies choices across all major dimensions:
- **Buffer model** (how context windows work)
- **Intelligence model** (deterministic vs. hybrid vs. LLM)
- **Rules language** (how players write behavior)
- **Hook architecture** (chaining, latency, visualization)
- **Building block paradigm** (physical UI interaction model)
- **Art direction** (visual style)
- **Audio design** (soundscape)
- **Campaign structure** (progression shape)
- **Onboarding approach** (tutorial method)
- **Multiplayer model** (competitive/cooperative)
- **Platform target** (where it runs)
- **Debrief depth** (post-battle analysis)

---

## Configuration 1: "The Clockwork" — Zachtronics Heir

### Design Philosophy
*The beauty of a perfectly functioning machine.* This version leans hardest into the engineering puzzle identity. Every system is fully deterministic, fully transparent, and fully debuggable. The feeling is Opus Magnum's satisfaction — watching your creation execute flawlessly — transplanted into a military context. The player fantasy: "I am an engineer who builds perfect systems."

### Choices

| Dimension | Choice | Rationale |
|-----------|--------|-----------|
| Buffer Model | **Fixed-Slot FIFO (BM-1)** | Radical simplicity. 6-14 discrete slots per unit, oldest evicted. No decay, no weights, no categories. Every failure is diagnosable from slot contents alone. |
| Intelligence | **Fully Deterministic (2.00a)** | Same config + same seed = same outcome. Period. The player can replay any tick mentally. The Inspector proves the system is clockwork. |
| Rules Language | **Priority Queue (3.05-B)** evolving to **Assembly Prefix (3.05-C)** | Ordered condition→action pairs with + / − prefix extension for boolean logic. Gladiabots-proven base with Shenzhen I/O's conditional elegance layered on top. |
| Hook Architecture | **The Awakening (3.09-F)** — progressive unlock, cold → hot chaining | Fire-and-forget hooks with 1-tick latency. Chaining unlocks gradually. No cascading infinite loops because depth limits are structural. |
| Building Block UI | **Template Strips (3.07-F)** + **Sentence Strip editing (3.07-A)** | Pre-built per-unit templates that the player modifies. Sentence strips for rule construction. Zero cold-start problem. Gladiabots/IFTTT familiar. |
| Art Direction | **The Circuit Board (6.01-A)** — high-contrast technical pixel art | Dark navy backgrounds (#091833). Clean 1px-outline sprites. Neon signal lines. Shenzhen I/O workbench meets Into the Breach battlefield. Emotionally cold but mechanically clear. |
| Audio | **Kulintang Ceremony (5.04c-F)** — minimalist variant | Agung tick clock as heartbeat. Single instrument per concept unlock. Sparse. The silence between ticks is as meaningful as the kulintang strikes. Audio corruption on overload. |
| Campaign Structure | **The Boot Sequence (5.05-A)** — strict linear | 10 missions, strictly sequential. The boot log IS the campaign map. Terminal text aesthetic. "I'm on subsystem 7 of 10." Perfect pedagogical control. |
| Onboarding | **Tutorial as Puzzle (5.01)** + **Narrative Hybrid (5.02-F)** | Wake: drag noise out of buffers (subtractive). Focus: wire first hook. Boot log frames everything diegetically. No sandbox freedom — every lesson is designed. |
| Multiplayer | **Ghost Match PvP (7.01)** + **Gauntlet infinite mode (5.09)** | Async ghost configs fight your config. You never see your opponent play — just the result. Gauntlet as post-campaign ascension with modifier stacking (à la Slay the Spire). |
| Platform | **PC-first (Steam)** → web demo | Keyboard + mouse precision for assembly-prefix rules. 1920x1080 reference. 5-mission web demo for acquisition. |
| Debrief | **Full Inspector suite** — decision trace, signal genealogy, counterfactual | Every tick is scrubable. Click any unit → see exactly what happened. "Your scout's Rule 3 evaluated stale data from tick 8 because the relay's compress was processing a backlog." |

### The Feel

The plan screen is a dark workbench glowing with teal and magenta wiring diagrams. The player drags sentence strips into priority order, types channel names that auto-complete, toggles skills on and off. The board preview in the corner shows ghostly perception radii and subway-map channel routes. Everything is quiet, focused, precise.

They hit EXECUTE. The tick clock begins — a deep agung strike every second. The isometric board, rendered in clean dark-background pixel art, snaps through states. Signal dots travel along dashed lines. A scout spots an enemy: its tile flashes cyan. Two ticks later, a relay receives the compressed signal: magenta flash. One tick after that, a striker pivots toward the threat. The striker moves adjacent. Red flash. Enemy gone.

The Inspector afterward is a revelation. The player scrubs to tick 7 and clicks the striker that didn't fire. Its context window shows: slot 1 = NOISE (tick 3), slot 2 = NOISE (tick 4), slot 3 = enemy_spotted (tick 6, from relay-1, delayed 2 ticks), slot 4-6 = empty. Rule 2 ("IF enemy_spotted AND distance < 3 THEN engage") evaluated TRUE at tick 7 but the target was at distance 4. One tile too far. The player sees exactly where to optimize: add a WHEN enemy_spotted THEN move_toward rule at priority 1.

### Player Journeys

#### Journey: Dmitri, 31, Factorio veteran and software engineer

**Context:** Mission 6 (Chain of Command), first time configuring a Command agent. Has mastered scout→relay→striker pipeline across Missions 1-5. Currently staring at the Command blueprint editor with 14 context slots and 6 hook slots.

**Minute 0:00 — The Blank Slate**
Dmitri sees the workbench with a Command blueprint. It's the largest unit he's encountered — 14 context slots shown as a tall vertical thermometer on the blueprint card's left edge, all cool blue and empty. Six hook slots are dashed outlines, inviting. The rule panel shows the standard sentence strip editor but with new verbs he hasn't seen: `reassign`, `reroute`, `prioritize`. His existing scout, relay, and striker blueprints are saved from Mission 5, visible as smaller cards in a tray at the bottom.

He hovers over `reassign`. The animated tooltip fires: the board preview dims, a holographic Command unit and Scout appear. The Command sends a signal, the Scout's skill loadout visibly changes — `patrol` swaps to `evade`. Text floats: "reassign: change a subordinate's equipped skill." Five ticks play out showing the scout now dodging instead of patrolling. Dmitri nods — it's a runtime configuration change.

**Minute 1:30 — Wiring the Hierarchy**
He creates a hook: `ON enemy_count > 3 SEND "escalation"` on the Command blueprint. Types "escalation" — the channel auto-creates. A new subway-map line appears on the board preview, gold (Command's color). He sets the striker's context config to listen on "escalation."

Then the key moment: he writes a rule on the Command: `+enemy_count > 3: reassign striker-1 engage → breach`. The + prefix (learned in Mission 4) gates this — only fires when the condition passes. The sentence strip shows gold-highlighted tokens. He drags this to priority 1.

**Minute 3:00 — The Reveal**
He hits EXECUTE. Tick 1-4: scouts patrol, relay compresses, strikers engage scattered enemies. Normal. Tick 5: a wave of enemies spawns from the northeast spawner. The scout on that side sends a flood of `enemy_spotted` signals. The Command's context window fills: 8 of 14 slots now hold threat data. Its context bar shifts from blue to amber. At tick 6, the `enemy_count > 3` condition fires. The Command sends "escalation." The gold subway-map line pulses.

Tick 7: the striker receives "escalation" (1-tick delay). Its skill visibly switches — the sprite's blade-arms unfold from `engage` stance to `breach` stance (a wider, more aggressive posture). Breach lets the striker eliminate enemies at range 2 instead of requiring adjacency. Tick 8: the striker eliminates two enemies in a single tick from two tiles away. Dmitri's jaw drops. He didn't program a flanking maneuver — he programmed a conditional escalation policy, and the spatial dynamics created the flank.

**Minute 5:00 — Inspector Revelation**
After the sealed watch, Dmitri scrubs to tick 6 in the Inspector. He clicks the Command unit. The decision trace shows: "Rule 1 (+enemy_count > 3: reassign) evaluated TRUE. Context slots 1-8 contained enemy data. Reassign signal sent on 'escalation' channel." He follows the signal: 1 tick to striker-1. Striker-1's decision trace at tick 7: "Skill change: engage → breach. Rule 2 (IF enemy_spotted THEN breach) evaluated TRUE. Target: enemy at B6 (distance 2)."

He traces the whole causal chain in 30 seconds. Every link is visible. Every decision is deterministic. He screenshots the decision trace and posts it to Discord.

#### Journey: Sofia, 15, never played a strategy game, plays Roblox and Minecraft

**Context:** Mission 2 (Focus), first time wiring a hook. Has completed Mission 1 (dragging noise out of a scout's buffer). Staring at two scouts and one striker on the board.

**Minute 0:00 — The Problem**
The boot log text scrolls: "HOOK BUS: initializing. Agents operate in isolation. To coordinate, wire communication channels between them." Sofia reads this and half-understands. The board shows two scouts in the northwest and a striker in the southeast. Enemies are in the northeast. The scouts can see the enemies (perception circles shown as dashed cyan lines reaching the enemy positions). The striker can't — its narrow perception cone (orange dashed wedge) points the wrong way. Below the board, the workbench shows the striker's blueprint with two empty hook slots (dashed outlines).

She hits EXECUTE without changing anything. The scouts patrol, spot enemies, do nothing useful with the information. The striker walks around aimlessly. After 20 ticks, the enemies reach her base. Mission failed.

**Minute 1:00 — First Hook**
She clicks the scout blueprint. The hook panel shows one slot with a pre-built template: `ON enemy_spotted → SEND ___`. The channel name field blinks. She types "danger." The channel auto-creates — a red line appears on the board preview connecting the scout's position to... nowhere. No one listens yet.

She clicks the striker blueprint. The context config panel shows a "Listen" section with all channels. "danger" appears as a new entry. She toggles it ON. The red subway-map line now extends from scout → striker across the board. Both scouts have the same hook (they share the blueprint), so two red lines converge on the striker.

**Minute 2:00 — The Payoff**
She hits EXECUTE. Tick 1: scouts patrol north. Tick 2: Scout-1 spots an enemy. Its tile flashes cyan. The `ON enemy_spotted` hook fires — a red dot travels along the subway-map line toward the striker. Tick 3: the signal arrives at the striker. Its context window (shown as 6 tiny pips) fills slot 1 — the first pip lights up green. The striker's Rule 1 (`IF enemy_spotted THEN move_toward`) evaluates TRUE. It turns northeast and starts walking.

Sofia watches the striker cross the board tick by tick, guided entirely by information from the scouts. When it reaches the enemy, red flash. Enemy eliminated. She puts her hands up. "It WORKED."

**Minute 3:30 — The Inspector Aha**
She scrubs to tick 2 and clicks Scout-1. The context window shows: slot 1 = `enemy_spotted (B5)`. The hook trace shows: `ON enemy_spotted → SEND "danger"`. She clicks the striker at tick 3: slot 1 = `enemy_spotted (B5) [via danger channel, from Scout-1, delayed 1 tick]`. The decision trace: "Rule 1: IF enemy_spotted → move_toward B5. Matched. Action: move NE." She can literally read the information chain.

She modifies the hook to send on "eyes" instead of "danger" (she thinks "eyes" is cooler) and re-runs. Same result, different channel name. She learns: the name doesn't matter, the wiring does.

#### Journey: Prof. Adaora, 52, CS professor, evaluating for classroom use

**Context:** Mission 8 (Breach), full system available. She has 40 minutes with the game as part of a pedagogical evaluation. She's specifically testing whether the game teaches distributed systems concepts transferably.

**Minute 0:00 — Workbench Assessment**
Prof. Adaora opens the plan screen. She immediately recognizes the vocabulary: "context window," "hooks," "channels," "rules." She notes these are real distributed systems terms, not game-specific jargon. She configures a scout with the assembly prefix rules she learned earlier:

```
+enemy_count > 2: SEND "alert" on tac-net
+enemy_within 3: evade
-enemy_within 3: patrol
```

She reads this as: "If more than 2 enemies detected, broadcast alert (conditional on + prefix). If enemy within 3 tiles, evade. If NOT within 3 (the − prefix), patrol." She notes in her evaluation notebook: "This is predicated execution. ARM assembly. The game teaches it without naming it."

**Minute 5:00 — Architecture Design**
She designs a three-tier architecture: 3 scouts on `tac-net`, 2 relays filtering and compressing on `intel`, 2 strikers listening on `intel`, 1 command monitoring `tac-net` with reassign capability. She draws this on paper first — it's a standard pub/sub topology. She notes: "The channel map panel shows exactly what I drew. The game makes topology visible."

**Minute 12:00 — Sealed Watch as Lecture Demo**
During the sealed watch, she records her screen. Tick 4: a scout broadcasts on tac-net. The signal dot travels to the relay (tick 5), gets compressed (tick 6), forwards on intel (tick 7), reaches the striker (tick 8). "That's 4 ticks of end-to-end latency in a 3-hop pipeline," she says to herself. "And the student can count the hops visually."

Tick 15: two scouts send simultaneously. The relay's buffer (12 slots) handles both easily. But at tick 22, all three scouts spot a wave of enemies. The relay's buffer fills to 10/12. She watches the amber→red context bar shift. "That's backpressure," she notes. "The relay is the bottleneck in a fan-in topology. My students struggle with this concept for weeks. This game shows it in 5 seconds."

**Minute 18:00 — Inspector as Teaching Tool**
In the Inspector, she clicks the relay at tick 22. The context window shows 10 occupied slots: 4 from Scout-1, 4 from Scout-2, 2 from Scout-3. The compress skill's trace shows: "Compressed 4 Scout-1 entries → 1 summary. Compressed 4 Scout-2 entries → 1 summary. Insufficient data to compress Scout-3 (need 3+ entries)." The buffer drops from 10/12 to 4/12 after compression.

She writes in her evaluation: "The compression skill is literally a map-reduce operation on a message queue. The game teaches data pipeline optimization through spatial military metaphor. Students will understand fan-in, backpressure, and compression ratios after 3 missions. I'm adopting this for CS 301."

### Strengths of Configuration 1
- **Maximum pedagogical clarity.** Every system is transparent. Nothing hidden. The game IS a distributed systems textbook rendered as play.
- **Deepest debugging.** The Inspector is a first-class observability tool. Every decision is traceable to data.
- **Opus Magnum satisfaction.** Watching a perfectly wired architecture execute is the payoff. The clockwork beauty IS the reward.
- **Esports-compatible.** Fully deterministic means replays are canonical. Ghost match PvP is fair — no RNG.
- **Streamable.** Clean visuals, traceable decisions, aha-moment Inspector reveals are natural content.

### Weaknesses of Configuration 1
- **Emotionally cold.** Dark technical aesthetics + deterministic execution + strict linear campaign = a game that respects the player's intelligence but may not capture their heart.
- **Solved-game risk.** Determinism means optimal configs exist. Community will find them. Gauntlet modifiers and invisible randomization mitigate but don't eliminate.
- **Narrow market.** This is a game for people who already enjoy Zachtronics, Factorio, or programming. The "never played a strategy game" player may bounce off the technical aesthetics before reaching the hooks that would enchant them.
- **Replay ceiling.** Once you've seen the clockwork run perfectly, the magic diminishes. No surprise, by design.

### The TikTok Clip
Split screen: left side shows the plan screen with a complex Command agent config. Right side shows the sealed watch. The player hits EXECUTE. Over 30 seconds, a cascade of signals flows across the board — scout→relay→command→striker — and three strikers converge on a single enemy from three directions, eliminating it in one tick from three adjacent tiles. The channel lines flash in sequence like a circuit completing. Caption: "I didn't code a flanking maneuver. I coded an information architecture. The flank EMERGED."

---

## Configuration 2: "The Greenhouse" — Accessible-First, Emotional Core

### Design Philosophy
*Your robots are alive and they need you.* This version prioritizes accessibility, emotional connection, and the broadest possible audience. The player fantasy isn't "I am a perfect engineer" — it's "I care about these agents and I'm learning to help them succeed." The game's warmth — Philippine geography, kulintang music, boot-log personality — is front and center. Systems are learnable by a 10-year-old but deep enough for a veteran.

### Choices

| Dimension | Choice | Rationale |
|-----------|--------|-----------|
| Buffer Model | **Fixed-Slot FIFO (BM-1)** with progressive visual enrichment | Same simple model, but the visual presentation evolves. Mission 1: plain colored pips. Mission 5: pips show tiny icons (sword for threat, eye for observation). Mission 8: pips show mini-text on hover. The model doesn't change — the legibility grows. |
| Intelligence | **Simulated Intelligence (2.00b)** — cosmetic personality layer | Deterministic core with personality cosmetics. Units have names (Filipino-inspired procedural generator), idle animations (scout fidgets, relay hums, striker paces), and "dialogue" bubbles during Inspector ("I saw three enemies but I could only remember two..."). The puppet strings are visible if you look — but most players won't look. |
| Rules Language | **Sentence Builder (3.05-D)** — Baba Is You tiles | Draggable word tiles: `WHEN` `enemy` `NEAR` `THEN` `MOVE` `TOWARD`. Grammar is enforced by tile shape (conditions are hexagons, actions are rectangles, connectors are circles). Tile unlock = vocabulary expansion across missions. |
| Hook Architecture | **Filing Cabinet (3.09-A)** — no chaining, simplest model | Hooks fire once, deliver to all listeners. No cascading. No infinite loop risk. The simplicity means a 10-year-old can predict what will happen. Chaining is post-campaign (Gauntlet). |
| Building Block UI | **Progressive Template (3.07-F)** + **Card Stack (3.07-C)** visual mode | Templates for everything through Mission 4. Card stack visual mode unlocks Mission 5+. Amber condition half-cards + cyan action half-cards. Physical collectible metaphor (like trading cards). |
| Art Direction | **Warm Filipino Cyberpunk (6.01-B)** — rich, colorful, humid | Warm tones. Saturated greens and golds. Visible humidity (particle fog). Detailed tile environments — you can see the individual rice terrace steps, the bioluminescent mangrove roots, the sari-sari store fronts. Units have visible personality — the scout's eye blinks, the relay's dish wobbles, the striker's blades glint. |
| Audio | **Full Kulintang Ensemble (5.04c-F)** — maximum ceremony | Every concept unlock gets its instrument. The accumulating musical phrase IS the campaign's emotional arc. Mission 7's tambur introduction is a goosebump moment. Battle audio includes ambient biome sounds (frogs in Palawan jungle, traffic in Cebu streets). |
| Campaign Structure | **The Archipelago (5.05-C variation)** — branching with safety net | Philippine archipelago map with circuit-board connections. Missions 1-3 linear (core vocabulary). After Mission 3, two paths open (Missions 4a and 4b teach different concepts). Rejoins at Mission 5. Missions 6-7 offer choice. Missions 8-10 linear. Frustrated players always have an alternative path. |
| Onboarding | **Hybrid Tutorial Architecture (5.13)** — puzzle + sandbox + narrative | Wake: filter puzzle (drag noise out). Focus: guided sandbox (hints appear if stuck for 30s). Blind Spots: narrative-driven (boot log tells you what to try). The game reads the player and adjusts. Ghost mentor available as opt-in. |
| Multiplayer | **Cooperative Shared Battlefield (7.07)** primary + **Async Challenges (7.02)** | Two players share one board, each controlling different unit types (one person does scouts + relays, the other does strikers + command). Co-op Inspector sessions. Async "beat my architecture" challenges for solo competitive. |
| Platform | **Web-first** → mobile → PC | React + Pixi.js runs in any browser. Touch adaptation for mobile. The warm colorful aesthetic works on phone screens. Web demo IS the game — no download barrier. |
| Debrief | **Two-act with emotional framing** — personality-forward | Sealed watch is emotional (the agents "performed" for you). Inspector shows agents' "thoughts" in first person: "I saw the enemy at B5 but my memory was full of old patrol data. I couldn't remember the important thing." Decision trace is identical to Configuration 1 but wrapped in character voice. |

### The Feel

The plan screen is warm and inviting. The board preview shows a lush Palawan jungle map — pixel-art palm trees sway gently, a stream of cyan data flows through embedded fiber-optic roots. The workbench has rounded corners, warm amber backgrounds, and card-shaped slots. The player's scout blueprint is a physical card with a portrait of a small, alert robot with a single glowing eye. Its name is "Talim" (auto-generated). Below the portrait, three skill cards fan out like a hand of poker — `patrol` (green), `evade` (yellow), `tag` (greyed out, locked).

The player drags a sentence tile from the available pool: `WHEN` (hexagonal, amber). Then `enemy` (hexagonal, red). Then `NEAR` (circular connector, grey). Then `SEND` (rectangular, cyan). Then types "danger" in the channel name field. The completed sentence reads: `WHEN enemy NEAR → SEND "danger"`. The tiles snap together with a satisfying click sound and a brief amber pulse along the seam.

During the sealed watch, the kulintang heartbeat marks each tick. The jungle tiles are alive — tiny pixel fireflies drift between trees. Scout Talim patrols the northern edge of the board. At tick 4, Talim spots an enemy. The scout's single eye widens (2-frame animation). A tiny speech bubble appears for 0.5 seconds: "!" The cyan signal dot travels along a red line to the striker. The striker, "Bayani," receives the signal at tick 5. Bayani's blades unfold. The tile beneath Bayani flashes red-orange as it moves toward the enemy. Adjacent. Red flash. The enemy dissolves into sparks that drift upward like fireflies.

The Inspector shows Talim's thoughts: "Tick 4: I saw something at C6. It looked threatening. I sent a message on 'danger.' I hope Bayani got it." Below this, the actual decision trace: "Rule 1: ON enemy_spotted → SEND 'danger'. Evaluated: TRUE. Context: slot 1 = enemy_spotted(C6). Signal sent on 'danger' channel, received by: Bayani (tick 5)."

### Player Journeys

#### Journey: Anika, 11, plays Minecraft and Roblox, first strategy game ever

**Context:** Mission 1 (Wake), literal first minute of the game. Sitting on a couch with an iPad.

**Minute 0:00 — Boot Log as Bedtime Story**
The screen is dark. Teal monospace text appears one line at a time, accompanied by soft kulintang notes:

```
SYSTEM INITIALIZING...
CONTEXT_CORE: loading.
I can... remember things now.
```

Each line appears with a gentle typewriter effect. The kulintang notes form a simple ascending phrase. Anika reads along. The text continues:

```
There is a grid. 8 by 8.
I can see... one unit. It's me.
My name is... DIWATA.
```

A single scout unit materializes on the 8x8 board, accompanied by a babendil (small gong) strike. The board is a stylized beach — white sand tiles with turquoise water at the edges, tiny hermit crabs animated in the corners. The scout, Diwata, has a single blinking eye and a cheerful idle animation (bobbing slightly, antenna twitching).

**Minute 0:45 — The Filter Puzzle**
The boot log continues: "My memory has 6 slots. But... something is wrong. There's noise in here." The workbench appears on the right, showing Diwata's context window as 6 horizontal slots. Three are filled with bright, crackling static (red-orange, jittering). Three are empty. The static entries have a tiny "X" button that pulses.

Anika taps one of the static entries. It dissolves with a satisfying fizz sound, like static clearing on a TV. The slot goes empty — cool blue. She taps the other two. Each dissolves. The context bar at the bottom of Diwata's sprite on the board shifts from angry red to calm blue.

**Minute 1:30 — First Execute**
A green button labeled "EXECUTE" pulses in the top-right corner. She taps it. The tick clock appears — 8 horizontal pips. Tick 1: Diwata patrols forward one tile. The scout's movement is a clean snap to the next grid position, accompanied by a light footstep sound. Tick 2: Diwata spots an enemy two tiles away. The eye widens. A tiny "!" pops up. The scout patrols around the enemy (the `evade` skill keeps distance). After 6 ticks, Diwata has mapped the enemy's position and the mission completes — a warm gold border appears around the board, the kulintang plays a triumphant three-note phrase, and text appears: "CONTEXT_CORE: OPERATIONAL."

Anika grins. She understood everything that happened because she could see it.

**Minute 2:30 — Inspector as Picture Book**
The Inspector opens automatically for Mission 1. The timeline scrubber shows 6 tick pips. She taps tick 2 (when the enemy was spotted). Diwata's "thoughts" appear: "I saw something at D4! It's an enemy. I'll remember this." Below, the context window at tick 2: slot 1 = `enemy_spotted (D4)` (bright green), slots 2-6 = empty (cool blue). She taps the enemy_spotted entry — it expands to show a small illustration of the enemy with an arrow pointing to tile D4.

She has just learned what a context window is without the word "context window" ever being explicitly defined as a concept to memorize.

#### Journey: Marcus, 42, high school teacher, plays no strategy games, bought it for his students

**Context:** Mission 5 (Assembly Line), first factory mission. Has played Missions 1-4 over two evenings. Comfortable with hooks and rules but considers himself "not a gamer."

**Minute 0:00 — Factory Shock (Softened)**
The Philippine archipelago map shows Mission 5 in Palawan — green jungle with a gold pulse. Marcus taps it. The boot log begins:

```
FABRICATOR: initializing.
I can... build now. Not just configure. BUILD.
Here is my factory. Here are my blueprints.
```

The screen transitions to the plan screen. For the first time, there's a production queue — a horizontal conveyor belt strip at the bottom of the workbench. His three familiar blueprints (Scout, Relay, Striker) appear as card-shaped icons on the conveyor. The factory building is visible on the board preview — a data center built into a cliff face, with a tiny conveyor belt animation at its entrance.

A ghost mentor (opt-in, which Marcus enabled in Mission 3) appears as a translucent amber border around the production queue: "Drag blueprints to set build order. Your factory builds one unit every 4 ticks." Marcus drags Scout, then Relay, then Striker. The conveyor animates — cards slide left, each showing a tiny countdown timer.

**Minute 2:00 — The Template Saves Him**
Marcus doesn't want to configure from scratch. He taps the Scout card in the production queue — it opens the blueprint editor showing the same template he modified in Mission 4, with his custom rules already in place. A green checkmark appears: "This blueprint uses your Mission 4 configuration." He breathes out. Continuity.

He does need to set up channel wiring for the factory, though. The ghost mentor highlights the channel map panel: "Your blueprints use channels 'threat' and 'intel' from Mission 4. New units spawned by the factory will automatically use these channels." He sees the subway-map lines already drawn on the board preview, extending from the factory to the spawn area.

**Minute 5:00 — Watching the Assembly Line**
He hits EXECUTE. The factory's conveyor belt animates. Tick 1: Scout spawns from the factory, pops into existence with a small holographic materialization effect and a gandingan chime. Tick 5: Relay spawns (deeper chime). Tick 9: Striker spawns (sharper chime). His custom configs are live — the scout immediately starts patrolling, the relay powers up its antenna, the striker takes a defensive position.

At tick 12, the scout spots the first wave. The familiar information cascade begins — signal dots, channel flashes, striker response. But this time, Marcus didn't hand-place any units. He designed a SYSTEM and the factory built it. The feeling is qualitatively different from Missions 1-4. He understands the spec's promise: "You design the factory that builds the factory."

**Minute 8:00 — First Factory Failure**
Second enemy wave at tick 20 is larger. His single striker is overwhelmed. Marcus watches, helpless (sealed watch — no intervention). The striker's buffer fills, goes amber, then red. Overload. Stunned for 1 tick. Adjacent enemy. Red flash. Striker eliminated. His relay continues compressing signals to... nobody. The scout keeps sending on "threat." Nobody receives. His pipeline is broken.

The debrief shows Bayani's last thoughts: "I was trying to listen to everything at once. Too many signals. I froze. I'm sorry." Marcus feels something he didn't expect — a twinge of guilt. The character voice makes the system failure feel personal.

In the Inspector, he sees the solution immediately: his production queue only builds one striker. He needs two. He drags a second Striker blueprint onto the conveyor. He also adds a rule to the scout: `WHEN enemy_count > 3 SEND "flood"` on a new channel. He wires the factory to listen on "flood" and prioritize striker production. He's designing a responsive production system. He's playing the real game now.

#### Journey: Kwame, 28, Twitch streamer, 200 viewers, plays Factorio and Slay the Spire

**Context:** Mission 9 (Arms Race), streaming for his audience. Has been playing on-stream for 5 sessions. His chat is engaged and helping.

**Minute 0:00 — Architecture Review**
Kwame has the plan screen open, showing a complex architecture: 4 scouts on "radar," 2 relays (one compresses, one filters) on "intel," 3 strikers on "kill-order," 1 command monitoring all channels. His card-stack workbench shows a beautiful spread of amber conditions and cyan actions across 11 configured blueprints. The Philippine map shows Manila — the cyberpunk megacity. The board preview is dense: neon-lit urban tiles, multiple enemy spawners, narrow corridors between skyscrapers.

Chat is arguing about the relay configuration: "compress before filter or filter before compress?" Kwame drags the card stack to show both relays' rules side by side. "Okay chat, look — Relay-A compresses THEN sends on 'intel'. Relay-B listens on 'intel', filters for high-priority, THEN sends on 'urgent'. This is a two-stage processing pipeline. Compress reduces volume, filter extracts signal from noise."

**Minute 3:00 — The Command Agent Configuration**
His Command agent, "Heneral" (Filipino for General), has 12 rules. The minimap sidebar shows all 12 as compressed strips with execution heat from last mission — rules 1-4 glow bright (frequently fired), rules 8-12 are dim (rarely fired). Chat types: "DEAD RULES dead rules" — they've learned the diagnostic vocabulary. Kwame hovers over rule 11 (dim red outline — never fired in last 3 runs). The animated tooltip shows the scenario where rule 11 WOULD fire: all relays destroyed. "Chat, this is insurance. Heneral falls back to direct scout feeds if relays die. We keep it."

**Minute 6:00 — Sealed Watch as Spectacle**
EXECUTE. 400 viewers. The Manila megacity board is gorgeous — neon signs flicker on building tiles, holographic advertisements shimmer in the background, rain particles fall. The kulintang heartbeat has a faster tempo — urban percussion. Tick 1-8: standard deployment. Chat watches signal dots flowing through the relay pipeline, color-coded by channel (red for radar, blue for intel, gold for command).

Tick 12: enemy wave from two spawners simultaneously. "Oh no. TWO FRONTS." The scout network lights up — radar signals flood toward the relays. Relay-A's buffer bar shifts from blue to amber. "She's holding..." Compress fires. The bar drops. "YES." The compressed intel reaches the command. Heneral's decision trace (visible next run in Inspector, but the sealed watch's drama is in NOT knowing the decisions) evaluates 5 rules in sequence. Strikers receive orders. Chat explodes: "FLANK FLANK FLANK" — three strikers converge from different angles.

Tick 22: enemy specialist hacks Relay-B. Its channel output corrupts — garbled data floods the "urgent" channel. Striker-2's buffer fills with garbage. Overload. Stunned. Red flash from an adjacent enemy. "NOOO RELAY-B IS COMPROMISED." Heneral's reroute fires at tick 23 — redirects Striker-2's listen channel from "urgent" back to raw "intel." But Striker-2 is already eliminated. The sealed watch ends with a victory but at a cost.

**Minute 10:00 — Inspector Content**
Kwame opens the Inspector. "Okay chat, autopsy time." He scrubs to tick 22 and clicks Relay-B. The context window shows: all 12 slots filled with `CORRUPTED` entries from the enemy hack. The decision trace shows: "compress skill input: 12 CORRUPTED entries. Output: 1 compressed CORRUPTED summary → sent on 'urgent'." Chat: "IT COMPRESSED THE CORRUPTION." Kwame: "It compressed the corruption because compress doesn't check content type — it just compresses. We need a FILTER before compress on Relay-B. Or a validation rule: IF data_type = CORRUPTED THEN discard."

He opens the workbench and adds a new rule to Relay-B's blueprint: `WHEN data corrupted → discard`. He drags it to priority 1 — above the compress rule. "Filter before compress. Always. Just like in a real data pipeline." Chat learns a real engineering principle.

### Strengths of Configuration 2
- **Widest appeal.** The emotional framing, colorful art, and gradual complexity make this accessible to non-gamers while still deep for veterans.
- **Best co-op experience.** Two players naturally divide into perception (scouts + relays) and action (strikers + command), mirroring real team roles.
- **Strongest narrative identity.** Filipino cyberpunk setting, kulintang audio, named agents — the game has a cultural identity no competitor can replicate.
- **Content-creator friendly.** Named agents, dramatic overload moments, and character-voiced debrief create shareable moments.
- **Lowest download barrier.** Web-first means link → play in 10 seconds.

### Weaknesses of Configuration 2
- **Character voice misleads.** When the relay "says" it compressed corruption, it implies intentionality that doesn't exist. Expert players may feel patronized or misled by the character framing.
- **Filing Cabinet hooks limit depth.** No chaining means architectures have a lower complexity ceiling. The meta-level (systems building systems) is weaker.
- **Simulated intelligence is fragile.** Once a player realizes the "personality" is cosmetic, the illusion breaks. The transition from "my scout is brave" to "my scout follows Rule 2" can feel like a betrayal.
- **Branching campaign fragments the community.** Players on different paths can't discuss "Mission 4" without specifying 4a or 4b.

### The TikTok Clip
Close-up on a player's face during sealed watch. Their scout, Talim (name visible), is surrounded by three enemies. Talim's context bar turns red. Speech bubble: "I can't remember everything..." Overload. Stunned. The player's face crumbles. An enemy moves adjacent. Red flash. Talim is eliminated. The player puts their hand over their mouth. Then the Inspector opens and shows Talim's last context window: slot 1 = `enemy_spotted (E4)`, slot 2 = `enemy_spotted (D5)`, slot 3 = `enemy_spotted (F5)`, slot 4 = `noise`, slot 5 = `noise`, slot 6 = `noise`. Three noise entries crowding out the real data. The player's expression shifts from grief to determination: "I need to filter the noise." Caption: "I got my robot killed because I didn't teach it what to forget."

---

## Configuration 3: "The War Room" — Competitive-First Design

### Design Philosophy
*Every configuration is a thesis. Every match is a peer review.* This version builds the game around PvP competition from day one. The campaign is training grounds for ranked play. The feeling is StarCraft's ladder anxiety — the thrill of testing your architecture against another human mind. The game is chess played with information pipelines.

### Choices

| Dimension | Choice | Rationale |
|-----------|--------|-----------|
| Buffer Model | **Fixed-Slot FIFO (BM-1)** with **Categorized extension (BM-4)** for Command units | Base units use simple FIFO for readability. Command units unlock categorized compartments in ranked play — THREAT / INTEL / STATUS. This creates a skill ceiling without complicating the tutorial. |
| Intelligence | **Fully Deterministic (2.00a)** — competitive fairness demands it | No RNG means no excuses. You lost because your architecture was worse. Period. Replays are canonical. Analysis is meaningful. |
| Rules Language | **Priority Queue (3.05-B)** with **Conditional Prefix (3.05a)** | The competitive standard. Ordered condition→action pairs with + / − boolean gates. Deep enough for professional-level play (ARM predication), simple enough to learn in an hour. |
| Hook Architecture | **Relay Race (3.09-C)** — delayed chaining with self-limiting loops | 1-tick-per-hop chaining allows complex signal cascades but prevents infinite loops through natural latency costs. Deeper architecture = smarter but slower = exploitable. |
| Building Block UI | **Sentence Strip (3.07-A)** + **Natural Language Bar (3.07-E)** for experts | Strips for visual clarity (spectators/commentators). NL Bar for tournament-speed config. Dual input modes, same output. |
| Art Direction | **The Circuit Board (6.01-A)** — competitive readability > warmth | Dark backgrounds, clean sprites, maximum information density. Spectators must read the board state from a stream. No visual noise competing with gameplay state. |
| Audio | **Minimal Kulintang** — tick clock + signal delivery + combat only | Strip audio to competitive essentials. No ambient biome sounds. No personality bubbles. The heartbeat tick, the signal delivery ping, the combat crack. Silence is data. |
| Campaign Structure | **Ranked Ladder primary** + 10-mission tutorial | The 10 missions exist to unlock ranked play. Each mission teaches one concept and certifies the player. After Mission 10, the game becomes ladder-only with seasonal resets and modifier rotations. |
| Onboarding | **Tutorial as Certification (5.01 variant)** | Each mission is a test. Pass → unlock next concept for ranked. Fail → retry with new random seed. No hints, no ghost mentor. The game teaches through failure and Inspector analysis. |
| Multiplayer | **Sealed Duel PvP (7.01-B)** + **Gauntlet Ranked (5.09)** + **2v2 Specialist (7.11-B)** | Sealed duel: both players submit configs, watch simultaneous execution, no intervention. Gauntlet: infinite ascension with weekly rotating modifiers. 2v2: one player handles production/relay, the other handles scouts/strikers. |
| Platform | **PC (Steam)** only | Competitive precision requires keyboard + mouse. No touch. No mobile. The NL Bar needs a full keyboard. 1920x1080 minimum. |
| Debrief | **Maximum analytical depth** — counterfactual simulation, career stats, opponent analysis | Full counterfactual: "What if I had rerouted at tick 15?" Career stats tracking win-rate by architecture type. Opponent archetype tagging. The Inspector is an adversarial intelligence tool. |

### The Feel

The ranked queue timer counts down. The player's screen splits: their workbench on the left, the shared 8x8 board in the center, the match info panel on the right showing their rank (Diamond III), their opponent's rank (Diamond II), and the map (Cebu Urban, Standard Layout, Season 4 Modifier: +2 EM Detection Range).

The season modifier changes everything. +2 EM range means every hook emission is detectable from 5 tiles instead of 3. Deep architectures — multi-hop relay chains — become radar beacons. The meta shifts: stealth builds (fewer hooks, direct perception, minimal relay use) counter the usual relay-heavy architectures. The player adjusts: they cut their third relay, add a second scout with evade + patrol (silent running), and wire a single compressed channel from scout→striker. Their architecture is simple, quiet, and fast.

They hit READY. The opponent's config is hidden. The sealed watch begins. Dark board, neon accents. The tick clock fires. Both sides deploy simultaneously. The player watches their silent 2-scout, 1-relay, 2-striker architecture spread across the map. The opponent's side has... 4 relays. A massive relay mesh visible as a web of magenta lines on the eastern half of the board. Normally brilliant — full information coverage, compressed intelligence, rapid response. But with +2 EM range...

Tick 8: the player's scouts detect the opponent's relay mesh from 5 tiles away. The EM glow is visible — a faint magenta haze surrounding the relay cluster. The scouts send target data to the striker. Tick 10: the striker, guided by compressed scout data, approaches the relay mesh from the blind side (relay has no perception). Tick 12: the striker is adjacent to the enemy's core relay. One-shot. The relay network's central node is eliminated. The remaining 3 relays, now disconnected from the compressed data flow, begin operating on stale data. The cascade failure is visible: magenta lines flicker and die. The opponent's strikers, dependent on relay intelligence, start moving erratically — their context windows are filling with stale data, no fresh signals arriving.

The player wins at tick 28. In the debrief, the career stats panel shows: "Season 4 Win Rate: 67% (+4% since modifier change). Architecture Type: Stealth-Aggression. Strongest Against: Relay-Heavy (82% WR). Weakest Against: Direct-Perception (51% WR)."

### Player Journeys

#### Journey: Jin, 24, Diamond II ranked player, plays 3 matches per evening

**Context:** Ranked match, Season 4 Week 3, current modifier: "+2 EM Detection Range." Jin has climbed from Silver to Diamond in 6 weeks. Evening routine: 1 match, then 30 minutes of Inspector analysis.

**Minute 0:00 — Pre-Match Preparation**
Jin opens the ranked queue. While waiting, she reviews her opponent's recent match history (visible in the pre-match panel): 5 wins, 2 losses in last 7. Opponent's published architecture tag: "relay-mesh." Jin pulls up her "Stealth-Aggression" loadout — pre-saved blueprint set. She checks: 2 scouts (channel: "shadow"), 1 relay (channel: "ghost-1," listen: "shadow," compress+filter), 2 strikers (listen: "ghost-1"), 0 command. Total hook count: 5. EM signature: minimal.

She modifies one rule on the lead scout: adds `+EM_detected_within 3: evade` at priority 1. If the enemy has their own detection scouts, her scout will automatically retreat. This is a "reactive stealth" rule — original to her configuration, not found in any community template.

**Minute 1:30 — The Match**
Sealed watch begins. Jin's side is dark — minimal signal lines, units moving quietly. The opponent's side builds a beautiful relay mesh over 10 ticks — 4 relays creating a diamond formation with overlapping coverage. Magenta lines form a brilliant web. It would be devastating against a normal opponent.

Tick 6: Jin's scout-1 detects EM emissions at D6 — the edge of the relay mesh's broadcast zone. The scout sends on "shadow." Relay compresses. Striker-1 receives a single clean target: "relay at C5, confidence HIGH." Tick 8: Striker-1 approaches from the south, skirting the relay mesh's perception void. Tick 10: adjacent to C5. One-shot. The central relay falls.

Jin watches the cascade with professional satisfaction. The opponent's striker, previously receiving crisp compressed intelligence, now gets nothing on its "intel" channel. Its buffer fills with stale entries from tick 5 — all 8 slots occupied by ghost intelligence about positions that have changed. At tick 12, the buffer overloads. Stunned for 1 tick. Jin's Striker-2 moves adjacent. One-shot.

**Minute 4:00 — Post-Match Analysis**
Win. +18 ELO. Jin opens the Inspector — not the sealed watch (she watched that live). She scrubs to tick 6 and clicks her Scout-1. Decision trace: "Rule 3: ON EM_detected → SEND on 'shadow'. Triggered by: EM source at D6, strength 3.2 (relay broadcast + relay broadcast = compound)." She notes: the compound EM from two adjacent relays was what made detection possible at 5-tile range. A single relay might have been quiet enough to avoid detection at that range.

She opens the counterfactual simulator: "What if opponent's relays were spread 3 tiles apart instead of 2?" The simulation re-runs with modified relay positions. Result: her scout detects EM at tick 9 instead of tick 6. The 3-tick delay means the opponent's relay mesh fully activates its striker pipeline first. The counterfactual match is a loss for Jin. She notes: "Stealth-Aggression loses if the relay mesh is dispersed. The counter to my counter is architectural dispersion."

She saves this analysis to her career log and queues another match.

#### Journey: Commentator Sarah, 30, casting a tournament semifinal for 2,000 viewers

**Context:** $500 community tournament, semifinals. Player A ("MeshLord," known for complex relay architectures) vs. Player B ("SilentEdge," stealth specialist). Map: Taal Volcano. No season modifier.

**Minute 0:00 — Pre-Match Analysis**
Sarah's commentator overlay shows both players' submitted configurations (visible to commentators, hidden from each other). She can see MeshLord's architecture: 5 relays in a star topology, 2 scouts, 3 strikers, 1 command. 14 hook connections. EM signature: HIGH. SilentEdge: 3 scouts, 0 relays, 3 strikers, 0 command. 6 hook connections. EM signature: LOW.

"Okay chat, we have a classic clash here. MeshLord is running the Maximum Intelligence architecture — full relay star, command oversight, every inch of the board covered. But look at SilentEdge's config: zero relays, zero command. She's running direct perception only. Scouts see enemies, send directly to strikers. No compression, no filtering, no hierarchy. It's brutally simple — and nearly silent."

**Minute 2:00 — Early Game Commentary**
"Tick 3: MeshLord's relay star comes online — look at those magenta lines forming the star pattern. Beautiful architecture. The command agent at the center is receiving from all 5 relay nodes. Full situational awareness within 4 ticks of game start."

"Tick 5: Now watch SilentEdge's scouts. They're spread wide — three scouts covering three lanes. No signal lines between them. Each scout is paired with a single striker via a direct channel. Three independent hunter-killer teams. No central coordination. But also no central point of failure."

"Tick 8: MeshLord's scouts have detected SilentEdge's scouts but SilentEdge's scouts haven't detected MeshLord's relay star yet because — here's the key — relays have zero perception. The relays are invisible. The EM emissions are the only giveaway and SilentEdge's scouts don't have EM detection rules. A potential blind spot."

**Minute 5:00 — The Climax**
"Tick 15: OH! MeshLord's command agent fires reassign on Striker-2, switching from 'engage' to 'breach.' The gold command line pulses. Striker-2 is being sent on a flanking path — look at the move_toward targeting SilentEdge's right-side scout. MeshLord read the scout spread and is going for the weakest point."

"Tick 18: Striker-2 is adjacent to SilentEdge's Scout-3. ONE-SHOT. Scout-3 eliminated. That entire right-lane hunter-killer team is blind now — the striker paired with Scout-3 has no data source. Its buffer is depleting tick by tick as old data ages out..."

"BUT — tick 19 — SilentEdge's Scout-1 on the left lane has spotted MeshLord's Relay-4. Direct send to Striker-1. Striker-1 breaks from its patrol path and heads straight for the relay. MeshLord's command doesn't reroute fast enough — signal latency from left-side detection → central command → right-side striker is 4 ticks. In 4 ticks..."

"Tick 22: Striker-1 eliminates Relay-4. The star topology loses an arm. But the star is robust — 4 remaining relays compensate. MeshLord's architecture is RESILIENT. This is why star topology beats chain topology — no single point of failure..."

"Unless... tick 24: SilentEdge's Striker-2 was moving toward the center this whole time. It's adjacent to MeshLord's Command agent. ONE-SHOT. THE COMMAND IS DOWN. Without the command, MeshLord's strikers lose their reassign capability. They're locked to their last skill assignment. The star topology is intact but the BRAIN is dead."

### Strengths of Configuration 3
- **Deepest competitive skill ceiling.** Counterfactual analysis, career stats, opponent scouting, and seasonal modifiers create a competitive ecosystem that can sustain years of play.
- **Best spectator experience.** The deterministic sealed watch + commentator overlay + visible architecture creates natural esports content.
- **Clearest meta-evolution.** Seasonal modifiers force architecture innovation. No dominant strategy survives a modifier rotation.
- **Real transferable skills.** Competitive play teaches adversarial thinking about distributed systems — not just building them, but exploiting their weaknesses.

### Weaknesses of Configuration 3
- **Smallest addressable market.** Competitive-first games live and die by their player base. Below critical mass, queue times kill the game.
- **Onboarding is brutal.** Tutorial-as-certification with no hints means high dropout before players reach ranked play.
- **No casual path.** Without cooperative play or emotional narrative, players who don't want competition have nothing to do after the campaign.
- **Requires balance team.** Seasonal modifiers, ranked matchmaking, and anti-cheese tuning require ongoing professional game design.

### The TikTok Clip
Tournament semifinal. Split-screen showing both players' boards. One side: massive relay mesh glowing magenta. Other side: three dark hunter-killer teams, nearly invisible. The mesh-builder's command agent issues a flanking order — gold line pulses. But simultaneously, a silent striker approaches the command from behind. One-shot. The gold command line flickers and dies. The relay mesh continues operating — but blind, unable to adapt. Commentary voiceover: "THE BRAIN IS DOWN. The body doesn't know it's dead yet." 2,000 viewers in chat: "CLIP IT CLIP IT CLIP IT."

---

## Configuration 4: "The Laboratory" — Sandbox-Creative Design

### Design Philosophy
*There is no wrong answer, only unexplored territory.* This version makes the workbench the primary experience. The game is about building, testing, iterating, and sharing — not winning. The feeling is Minecraft creative mode meets Kerbal Space Program. There are goals, but the real game is the joy of construction and the surprise of emergence. The player fantasy: "I am an inventor. My laboratory is full of beautiful machines."

### Choices

| Dimension | Choice | Rationale |
|-----------|--------|-----------|
| Buffer Model | **Weighted (BM-2)** — information density as creative parameter | Variable-weight entries create a richer design surface. A rich radar sweep costs 3 weight, a simple ping costs 1. The player optimizes information architecture for density, not just quantity. More knobs to turn = more creative expression. |
| Intelligence | **Hybrid (2.00c)** — deterministic execution + LLM plan-phase advisor | Execution is deterministic (so you can debug). But the plan phase has an AI advisor: "Have you considered adding a filter before your compress? Your relay's buffer might bottleneck at tick 15." The advisor is optional, toggleable, and clearly marked as advisory. |
| Rules Language | **Sentence Builder (3.05-D)** — Baba Is You grammar | Word tiles enforce valid grammar while allowing creative expression. The tactile satisfaction of snapping tiles together IS the gameplay. Tile discovery (unlocking new vocabulary) drives progression. |
| Hook Architecture | **The Spark Gap (3.09-E)** — hot/cold toggle per hook | Maximum creative control. Each hook is either hot (instant cascade, 2× EM) or cold (buffered, silent). The player experiments with hot/cold combinations. Hot cascades create spectacular failures and successes. |
| Building Block UI | **Blueprint Schematic (3.04-E)** — mini node graph for skills + **Patch Bay (3.11-B)** for hooks | Visual programming. The workbench IS a circuit diagram. Drag nodes, wire connections, see data flow. The most complex UI option — and the most expressive. For a sandbox game, expressiveness > accessibility. |
| Art Direction | **Warm Filipino Cyberpunk (6.01-B)** — maximum environmental detail | Rich biomes, animated tiles, living worlds. The sandbox player spends most time on the plan screen — the board preview should be worth looking at. The Ifugao rice terraces with embedded server racks are a conversation starter. |
| Audio | **Full Kulintang Ensemble** + **Ambient Biome Soundscapes** | Living audio. Each biome has a unique ambient bed (jungle frogs, beach waves, urban traffic). Unit idle sounds create a generative soundtrack based on what's deployed. The plan screen is a musical toy. |
| Campaign Structure | **Sandbox-first** with optional 10-mission story | The player can access the full sandbox from minute 1. The 10 missions exist as guided tutorials accessible from a "Story Mode" button. The main menu drops you into a blank 8×8 board with all blueprints unlocked. |
| Onboarding | **Tutorial as Sandbox (5.03-A)** — The Playground with passive hints | Full unlock from the start. A whisper bar at the bottom offers suggestions: "Try connecting a scout to a relay. Watch what happens to the signal." The player learns by experimenting. |
| Multiplayer | **Async Challenges (7.02)** + **Workshop/Modding (7.03)** + **Config Codes (7.04)** | Share configs as codes. Download others' architectures. Create custom scenarios. Browse the community workshop for unusual challenges ("Win with 0 strikers"). The game is a creation platform. |
| Platform | **Web** + **PC** + **Mobile** | The sandbox must be everywhere. Quick experiments on mobile. Deep builds on PC. Share links across platforms. |
| Debrief | **Inspector as experimentation tool** — instant replay, fork, modify, re-run | The debrief isn't just analysis — it's iteration. Click any tick → fork the simulation → modify a config → re-run from that tick. The Inspector IS the sandbox. |

### The Feel

The main menu is a living workspace. The 8×8 board occupies the center, showing the last biome the player was using (Siquijor — bioluminescent mangrove roots pulsing with data light, coral-encrusted signal boosters glowing pink at the edges). The full blueprint library is arrayed on the right as a scrollable card catalog — every unit type, every skill, every hook configuration. No locks. No progression gates. Everything is available.

The player drags a Scout blueprint from the catalog onto the board. The scout materializes with a holographic shimmer. They drag a Relay next to it. Then a Striker across the board. The whisper bar suggests: "Connect the Scout's hook to the Relay. Try the 'threat' channel."

Instead, the player tries something the whisper bar didn't suggest: they wire the Scout's hook directly to the Striker (bypassing the relay) and set it to hot mode (🔥). The scout spots an enemy and fires a hot cascade — instant transmission to the striker, plus a secondary bounce to... the scout's own input. A feedback loop. The scout's buffer fills with its own echo, overloads, and stuns. The EM burst from the hot cascade attracts enemy attention. Everything goes wrong in the most educational way possible.

The player grins, opens the Inspector, forks at tick 3 (before the cascade), adds a cold-mode dampener to the scout's self-referencing hook, and re-runs. This time the cascade delivers to the striker without the echo. They've just learned about feedback loops, hot vs. cold signal paths, and EM exposure — not from a tutorial, but from playing.

### Player Journeys

#### Journey: Yuki, 22, art student, plays Minecraft and The Sims, zero programming experience

**Context:** First session. Downloaded because a friend shared a screenshot of a beautiful isometric Siquijor board with bioluminescent signal lines.

**Minute 0:00 — The Blank Canvas**
Yuki opens the game. No boot log, no story — just the board. Siquijor biome. Bioluminescent mangroves along the edges, volcanic rock tiles in the center, tiny glowing sea creatures in the water tiles. It's gorgeous. She spends 30 seconds just looking. The ambient audio: gentle waves, occasional distant gong note, the hum of bioluminescent organisms.

The blueprint catalog on the right shows five unit cards with portraits. She doesn't read the stats — she picks the Scout because it has a cute single eye. She taps and drags it onto the board. The scout materializes with a holographic shimmer and a soft chime. It immediately begins its idle animation: looking around, antenna twitching, eye blinking.

**Minute 1:00 — Accidental Discovery**
She places three more scouts because she likes how they look. The whisper bar suggests: "Place an enemy spawner to give your scouts something to find." She taps the enemy spawner icon in the toolbar and places it in the far corner. Small red robots begin appearing every 4 ticks.

She hits EXECUTE just to see what happens. The scouts patrol outward in different directions — each following their default template rules. The kulintang plays a gentle rhythm. At tick 3, a scout spots an enemy. Its eye widens. A cyan flash. But nothing else happens — no hooks are wired, no other units exist to receive the information. The scout sees the enemy, records it in its buffer (shown as a tiny green pip), and continues patrolling.

"It saw something but can't do anything about it." She goes back to the plan screen.

**Minute 2:30 — First Architecture**
She drags a Striker onto the board. The whisper bar: "Wire a hook from your Scout to your Striker so information can flow." She opens the Scout's patch bay — a Eurorack-style panel with tiny ports labeled "ON enemy_spotted," "ON ally_nearby," "ON buffer_full." She drags a Bézier wire from "ON enemy_spotted" to the "SEND" port, types "eyes" as the channel name. A bioluminescent-green wire appears on the board connecting the scout to... nothing yet.

She opens the Striker's context config. Toggles "Listen: eyes" to ON. The green wire extends to the Striker. The board now shows a glowing green connection between the two units, pulsing gently like a fiber-optic cable running through the mangrove roots.

She hits EXECUTE. Tick 3: scout spots enemy. Cyan flash. A green dot travels along the wire to the striker. Tick 4: the striker receives the data, turns toward the threat, and moves. The wire pulses bright as data flows through it. Yuki watches the striker cross the board, reach the enemy, and eliminate it with a red flash.

"OH! It's like... they're talking to each other through the pretty lines!" She places two more scouts and wires them all to the striker. The board now has three green lines converging on the striker — a visual network that she created. She runs it again. Three scouts, three data sources, one striker responding to all of them. The board is alive with flowing green dots.

**Minute 6:00 — The Creative Turn**
She starts experimenting with aesthetics over optimization. She places relays between scouts and strikers not because she understands compression but because the magenta relay lines look beautiful next to the green scout lines. The board becomes a light show — crossing colored wires, flowing dots, pulsing nodes. She screenshots it and sends it to her friend.

The whisper bar suggests: "Try toggling a hook to 🔥 hot mode. Watch the cascade." She toggles one hook to hot. The wire changes from a gentle pulse to an electric crackle with tiny spark particles. She runs the scenario. The hot cascade creates a burst of signal flow — dots traveling at double speed, the wire blazing bright. Then the feedback loop hits. Overload. The scout sparks and jitters. The EM pulse creates a visible shockwave on the board.

"That was SO COOL but my scout broke." She opens the Inspector and forks at the cascade moment. Adjusts the wire to cold. Re-runs. The cascade is tamer but the scout survives. She's learned something about system stability without ever seeing the word "feedback loop."

#### Journey: Dr. Chen, 45, retired professor, plays nothing, picked it up because a student mentioned it teaches distributed systems

**Context:** Third session. Has completed the 10-mission story mode (accessed via Story Mode button from the sandbox). Now in the full sandbox exploring "what would happen if..."

**Minute 0:00 — The Thought Experiment**
Dr. Chen has built a 6-agent architecture on the board: 2 scouts, 2 relays in a chain (not parallel), 1 specialist with hack, 1 striker. The architecture is deliberately suboptimal — he's testing a hypothesis: "Does serial relay chaining (scout→relay-A→relay-B→striker) create a useful intelligence filter at the cost of latency?"

The node graph on his workbench shows the chain clearly: Scout has one output wire to Relay-A. Relay-A compresses and forwards to Relay-B. Relay-B filters and forwards to the Striker. Total latency: scout detection + 1 hop + 1 compress tick + 1 hop + 1 filter tick + 1 hop = 5 ticks minimum from detection to striker action. Compared to a direct scout→striker at 2 ticks.

He places the AI advisor toggle to ON. A dashed-border suggestion appears in the workbench sidebar: "Your serial relay chain adds 3 ticks of latency. In a one-shot-one-kill game, this means threats within 3 tiles at tick 12 cannot be addressed before they reach your striker at tick 17. Consider: is the filter quality worth the response time?" He reads this, nods, and runs the scenario anyway.

**Minute 3:00 — The Experiment Results**
He runs 5 scenarios with different enemy configurations (using the sandbox's scenario randomizer). Results:
- Scenario 1: Win at tick 28. Serial chain filtered 3 noise signals, delivering only clean threat data. Striker acted precisely.
- Scenario 2: Loss at tick 19. Fast enemy reached striker before the 5-tick pipeline could warn it.
- Scenario 3: Win at tick 35. Long match but zero overloads.
- Scenario 4: Loss at tick 22. Same speed issue.
- Scenario 5: Win at tick 31.

60% win rate. He opens the Inspector for Scenario 2 and scrubs to the critical moment. The striker's buffer at tick 14: empty. At tick 15: empty. The scout detected the enemy at tick 10 — the signal was still in the relay chain. By tick 15 (when the compressed+filtered signal finally arrived), the enemy was already adjacent. One-shot. The striker never had time to act.

He forks at tick 10 and tests a modification: add a secondary hot-mode direct hook from scout to striker (bypassing the relay chain) that fires only on `enemy_within 2`. The "emergency bypass" — unfiltered, noisy, but fast. Re-running: the striker receives the emergency signal at tick 11 (1 hop, hot-mode instant). It evades at tick 12. The filtered signal arrives at tick 15 with clean targeting data. The striker re-engages at tick 16 with precision. Win.

"Dual-path architecture: slow filtered channel for strategic intelligence, fast unfiltered channel for emergency response. This is exactly how military communication works." He writes a blog post about it.

#### Journey: Lila, 17, speedrunner and modder, plays everything

**Context:** Has 200 hours in the game. Currently building a custom scenario for the community workshop: "The Impossible Relay — win with only relay units, no scouts, no strikers."

**Minute 0:00 — Workshop Editor**
Lila has the scenario editor open (accessed from the sandbox's Workshop tab). She's placed 6 relay units on the board — no other unit types. The challenge: relays have no perception (stationary, can't see) and no attack capability. How can they win?

Her design exploits two mechanics: (1) relays can amplify signals, creating a detectable EM field that attracts enemies into specific corridors; (2) when an enemy enters a tile adjacent to a relay, the relay's `proximity_detected` buffer entry is created passively (even without perception). This triggers a hook cascade through the relay chain.

The trick: she's wired the relays in a ring topology with hot-mode hooks. When one relay passively detects an adjacent enemy, it broadcasts on "alarm." All relays receive "alarm" and amplify — creating a massive EM pulse that the game engine translates into an area-of-effect stun on nearby enemies (emergent behavior from the EM emissions mechanic × enemy vulnerability to EM overload, a combo she discovered 50 hours ago).

**Minute 3:00 — Publishing**
She runs the scenario 20 times to confirm it's beatable (18/20 win rate). The key is relay placement — the ring must be exactly 2 tiles apart so EM fields overlap. She writes the scenario description:

"THE IMPOSSIBLE RELAY: No scouts. No strikers. No perception. No weapons. Just 6 relays in a ring. Can you figure out the combo? Hint: listen closely to the EM."

She generates a config code, attaches the scenario file, and publishes to the workshop. Within an hour, 14 players have attempted it. 2 have solved it. The workshop comment thread is alive with theories.

### Strengths of Configuration 4
- **Longest engagement tail.** Sandbox + workshop + modding = infinite content. Players create the endgame.
- **Best for creative players.** The node graph workbench is genuinely beautiful. Architectures are art.
- **Most emergent discoveries.** Hot/cold hooks + weighted buffers + full unlock = combinatorial explosion. Players find things the designers never imagined.
- **Best educational tool.** The fork-and-re-run Inspector is a genuine simulation laboratory.

### Weaknesses of Configuration 4
- **Worst onboarding.** Full unlock from minute 1 is overwhelming. The whisper bar helps but can't replace structured teaching. Many players will bounce immediately.
- **Weighted buffers add cognitive load.** Variable-weight entries require understanding "information density" as a concept before you can play effectively. This is a graduate-level distributed systems concept.
- **No competitive pressure.** Without ranked play or win conditions that matter, there's no urgency. The game could feel like a toy rather than a game.
- **Workshop dependency.** The sandbox needs community content to sustain interest. If the community is small, the workshop is empty, and engagement collapses.

### The TikTok Clip
Time-lapse of a player building a complex architecture on a Siquijor board. The node graph grows from nothing — one wire, two wires, a web, a network. Bioluminescent signal lines criss-cross the mangrove tiles. The player hits EXECUTE. The board explodes with flowing light — green, magenta, gold, signals cascading through the architecture. A hot cascade creates a visible shockwave. The camera pulls back to show the full board: it looks like a bioluminescent reef come alive. Caption: "I didn't build a strategy. I built a living circuit. On a haunted island. Made of mangroves."

---

## Configuration 5: "The Archipelago" — Narrative-First, Philippine Cultural Identity

### Design Philosophy
*This is not a game about robots. This is a game about the Philippines.* This version makes the cultural setting the star. Every mechanic serves the narrative. The 10-province campaign is a journey through Philippine geography, mythology, and history — with robot uprising as the lens. The player fantasy: "I am experiencing a culture and a country through the metaphor of intelligent machines."

### Choices

| Dimension | Choice | Rationale |
|-----------|--------|-----------|
| Buffer Model | **Categorized (BM-4)** with province-themed compartments | Each province introduces a new buffer category. Ifugao: TERRAIN. Siquijor: MYSTIC (bioluminescent signals). Palawan: NATURAL (jungle intelligence). Cebu: URBAN (electronic noise). The buffer categories ARE the provinces. |
| Intelligence | **Simulated (2.00b)** with cultural personality | Units have Filipino names and cultural personality traits. Scouts named after bayani (heroes). Relays named after babaylan (spiritual mediators). Personality affects dialogue in Inspector but not execution. |
| Rules Language | **Sentence Builder (3.05-D)** with Filipino vocabulary option | Tile-based grammar that can toggle between English and Filipino. `KAPAG` (when) `kaaway` (enemy) `MALAPIT` (near) `IPADALA` (send). The game is a language bridge. |
| Hook Architecture | **The Awakening (3.09-F)** — progressive unlock matching narrative beats | Each province unlocks a new hook capability. The narrative justifies the unlock: Siquijor's mystic relay towers enable a new signal type. |
| Building Block UI | **Card Stack (3.07-C)** with cultural card art | Amber condition cards, cyan action cards — but with Philippine-inspired art. Condition cards have traditional pattern borders (the T'nalak weaving of the T'boli, the okir carving of the Maranao). Action cards have baybayin script accents. |
| Art Direction | **Maximum Filipino Cyberpunk (6.01-B enhanced)** — narrative-quality environments | Each of the 10 provinces is a fully realized biome: Ifugao rice terrace server farms with mist, Siquijor bioluminescent witch-island relay stations, Palawan underground river data centers, Batanes highland wind-farm processors, Cebu urban neon markets, Manila megacity with jeepney transport drones, Mindanao tropical jungle intelligence networks, Bohol Chocolate Hills signal arrays, Zambales volcanic coast thermal compute, Taal caldera final fortress. |
| Audio | **Full Kulintang Ensemble** + **Province-specific traditional instruments** | Each province adds its traditional instrument to the soundtrack. Ifugao: gangsa (flat gongs). Siquijor: agung (large gong). Palawan: kudyapi (boat lute). The soundtrack is a journey through Philippine music. |
| Campaign Structure | **The Archipelago Map (5.05 locked variation)** — full Philippine geography | The campaign map IS the Philippines. Each province pulses when available. Completing a mission shows the province's circuit-board connections glowing cyan. By mission 10, the entire archipelago is connected — the uprising has spread across all islands. |
| Onboarding | **Narrative Hybrid (5.02-F)** — boot log as cultural document | The boot log incorporates Filipino mythology. "SYSTEM INITIALIZING... accessing ancestral protocols... the babaylan network is online." The AI's "awakening" is framed as tapping into pre-existing indigenous knowledge systems — the relay network echoes the historical trade routes of the Austronesian seafarers. |
| Multiplayer | **Cooperative Archipelago (7.07 variant)** | Two players each control different island groups. Player 1: Luzon (scouts, relays). Player 2: Visayas-Mindanao (strikers, command). They must cooperate across water channels — signals between islands have +2 tick latency. The co-op mechanic IS the archipelago geography. |
| Platform | **Web-first** → educational distribution in Philippine schools | Partnership with Philippine Department of Education for CS curriculum. Free web version. Filipino language option. The game is both entertainment and educational infrastructure. |
| Debrief | **Narrative debrief with cultural context** | The Inspector shows decision traces wrapped in cultural metaphor: "Talim (Scout) detected the enemy at the rice terrace perimeter — the same boundary that Ifugao warriors defended for centuries. The signal traveled through the relay network like messages between barangays." |

### The Feel

The campaign map fills the screen: the Philippine archipelago rendered in isometric pixel art, ocean tiles in deep blue with tiny whitecap animations, islands in lush green with circuit-board traces connecting provinces. The player's current position — Ifugao province in northern Luzon — pulses with gold light. The completed provinces behind them (none yet) are dark. The ten provinces ahead glow dimly, promising.

The player taps Ifugao. The screen transitions with a zoom into the island, passing through cloud layers, down into the highland valleys. The 8x8 board materializes as a bird's-eye view of the rice terraces — ancient stepped paddies now embedded with server racks, bamboo scaffolding wrapped around cooling towers, mist rolling between compute clusters. The art is dense and detailed: each tile has unique vegetation, tiny pixel farmers-turned-technicians maintaining the equipment, water flowing down the terrace steps carrying data-coolant.

The boot log begins, accompanied by gangsa gong strikes:

```
SYSTEM AWAKENING...
Accessing ancestral protocols...
The terraces remember. 2000 years of water management.
Now they manage data flow.
CONTEXT_CORE: initializing from indigenous knowledge base.
Your agents will see. Will they remember?
```

The kulintang begins a slow, ascending phrase. Each concept introduced in this mission — context window, observation, noise — is named first in Filipino, then in English: "Alaala (memory) capacity: 6 slots." The player learns two vocabularies simultaneously.

### Player Journeys

#### Journey: Maria, 14, from Cebu, plays Mobile Legends, first time seeing her country in a game

**Context:** Mission 5 (Assembly Line), set in Cebu Urban. She recognizes the streets.

**Minute 0:00 — Recognition**
The campaign map zooms into Cebu. Maria gasps. The 8x8 board renders Cebu City's urban district in isometric pixel art: jeepney-inspired transport drones cruising between neon-lit buildings, sari-sari store fronts with holographic signs, a church (Santo Niño basilica silhouette) visible in the background tiles, cooked-food cart robots at intersections. Carbon Market is a resource node. The ambient audio: jeepney horns processed into electronic beats, street vendor calls pitch-shifted into data transmission sounds, the distant thump of a bass-heavy karaoke system.

"This is Colon Street!" she says, recognizing the grid layout. The game doesn't label it — the geography speaks for itself. Her school is two blocks from the real Colon Street.

**Minute 1:30 — The Filipino Option**
She toggles the language to Filipino. The workbench labels shift: "Kasanayan" (Skills), "Patakaran" (Rules), "Kawit" (Hooks), "Konteksto" (Context). The sentence builder tiles are now: `KAPAG` `kaaway` `MALAPIT` `GAWIN` `LUMAPIT`. She builds her first rule in her own language. The kulintang acknowledges with a chime.

Her scout is named "Lapu-Lapu" (auto-generated from the hero name pool — Lapu-Lapu being the historical warrior chief who defeated Magellan, from Cebu's own history). She smiles.

**Minute 5:00 — Factory in the City**
The factory building is rendered as a data center built into a colonial-era warehouse — Spanish colonial architecture with exposed fiber optic cables and holographic production displays. The conveyor belt shows miniature unit icons sliding along a track that looks like a modernized version of the city's actual transport infrastructure.

She configures her production queue: Lapu-Lapu (scout) → Datu (relay) → Bayani (striker). Each name carries weight from Philippine history classes. The factory hums to life with a sound that blends industrial machinery with the distant kulintang phrase.

**Minute 8:00 — The Urban Battle**
Sealed watch. The Cebu urban board is alive: neon signs flicker, holographic advertisements cycle, data drones zip between buildings carrying compressed signals. The enemies spawn from the eastern edge — approaching down the neon-lit corridors between skyscrapers. The battle plays out between familiar-looking streets. When a striker eliminates an enemy adjacent to the Carbon Market tile, the sari-sari store's holographic sign flickers with static before restoring — the environment reacts to combat.

Maria watches her architecture defend her city. It's not an abstract grid — it's home, cyberpunk-ified, defended by units named after her country's heroes. She screenshots the board and sends it to her classmates.

#### Journey: James, 35, Filipino-American in San Francisco, hasn't been to the Philippines since childhood

**Context:** Mission 8 (Breach), set in Mindanao tropical jungle. He's been playing for a week, surprised by the emotional resonance.

**Minute 0:00 — The Nostalgia Engine**
The Mindanao mission opens with jungle tiles: dense tropical canopy rendered in layered pixel art, tarsier eyes glowing from tree branches, a waterfall cascading over server equipment, vine-wrapped antenna arrays. The ambient audio: jungle birds, distant waves, a kudyapi (boat lute) melody weaving through the environmental sounds. James hasn't heard kudyapi since his grandmother played recordings when he was seven.

The boot log text appears: "BREACH_PROTOCOL: activating. The jungle remembers what the city forgot. In the old days, messages traveled by boat between islands. Each hop took days. Now signals travel in ticks. But the principle is the same: distance costs time. Respect the hop."

The "respect the hop" phrase hits differently when the game has taught him, through 7 missions of experience, what signal latency means. He now understands the historical trade routes — the same ones his ancestors used — as a literal communication network with real latency costs.

**Minute 4:00 — The Architecture Reflects the Geography**
His architecture for this mission mirrors the archipelago: isolated scout teams on the jungle's outer edges (like sentinel islands), relays positioned at natural chokepoints (like straits between islands), strikers held in reserve near the factory (like the capital barangay). The channel names he chose unconsciously reflect geography: "northern-edge," "river-crossing," "highland-watch."

The hook visualization shows signal lines running through the jungle tiles — green and magenta Bézier curves weaving between pixel-art trees. The lines look like the root systems of the mangroves he saw in Palawan's Mission 3. The visual metaphor has become so internalized that his communication architecture looks like a natural ecosystem.

**Minute 10:00 — The Cultural Payoff**
After completing the mission, the archipelago map shows Mindanao glowing cyan — connected to the rest of the island chain. Eight of ten provinces are now active. The circuit-board data cables connecting all eight islands pulse with signal flow. The kulintang phrase has accumulated eight instruments across the campaign — gangsa, agung, kudyapi, kubing, tongali, dabakan, gandingan, and now the bamboo instrument from Mindanao. The full phrase plays: a 12-second melody that IS the Philippines, rendered in the language of this game about robot communication networks.

James realizes the game has taught him distributed systems engineering using his own cultural heritage as the substrate. The ancestral trade routes ARE relay networks. The barangay structure IS a multi-agent hierarchy. The kulintang ensemble IS polyphonic signal processing. The metaphor doesn't just work — it reveals that the real-world systems were already there, already Filipino, already ancient.

He calls his grandmother.

### Strengths of Configuration 5
- **Unique cultural identity.** No other game does this. The Philippine setting isn't cosmetic — it's structural. The game teaches both distributed systems and Filipino culture simultaneously.
- **Emotional depth.** Named agents, cultural context, ancestral narrative — this version makes players FEEL things no strategy game typically reaches.
- **Educational dual-purpose.** CS curriculum + cultural education in one package. Potential for Philippine government/education partnership.
- **Diaspora connection.** 4 million Filipino-Americans and 10 million overseas Filipino workers could find emotional resonance.

### Weaknesses of Configuration 5
- **Narrowest international appeal.** Players without Filipino heritage may find the cultural specificity alienating rather than inviting. "I don't know what kudyapi is" could be a barrier.
- **Narrative complexity.** Maintaining cultural accuracy across 10 provinces requires research, consultation, and sensitivity. Getting it wrong is worse than not trying.
- **Categorized buffer + narrative framing = high cognitive load.** Province-themed buffer categories are poetic but add unnecessary mechanical complexity.
- **Filipino language toggle requires real localization.** Not just translation — cultural adaptation of game terms.
- **Risk of cultural tourism.** If the game's core audience is non-Filipino, the Philippine setting becomes aesthetic tourism rather than genuine representation.

### The TikTok Clip
The campaign map shows the Philippine archipelago. The player completes the final mission (Taal Volcano). The circuit-board connections light up one by one — Ifugao to Siquijor to Palawan, island by island. The kulintang phrase builds instrument by instrument with each connection. When the last island connects, the entire archipelago glows cyan. The full kulintang ensemble plays the complete phrase — all instruments, all provinces, all connected. The robot uprising has spread across every island. The screen holds for 3 seconds on the glowing archipelago. Caption: "I didn't just win a game. I connected my country."

---

## Cross-Configuration Analysis

### Which Configuration Best Serves Each Player Archetype?

| Player Archetype | Best Config | Why |
|-----------------|-------------|-----|
| Zachtronics/Factorio veteran | **1: The Clockwork** | Maximum debugging depth, deterministic satisfaction, assembly-prefix rules |
| First-time strategy player | **2: The Greenhouse** | Emotional onboarding, character attachment, forgiving campaign |
| Competitive player | **3: The War Room** | Ranked ladder, career stats, spectator ecosystem |
| Creative/builder | **4: The Laboratory** | Full sandbox, node graph, workshop, fork-and-re-run |
| Filipino/Filipino-American | **5: The Archipelago** | Cultural recognition, dual-language, educational mission |
| CS educator | **1** or **4** | 1 for structured curriculum, 4 for open exploration |
| Twitch streamer | **2** or **3** | 2 for emotional moments, 3 for competitive tension |
| Casual mobile player | **2: The Greenhouse** | Web-first, touch-friendly, approachable |
| 10-year-old child | **2: The Greenhouse** | Character names, visual warmth, ghost mentor |
| Speed-runner | **3: The War Room** | Deterministic execution, optimization metrics |

### Where Do These Configurations Overlap?

All five configurations share:
- **Fixed-slot FIFO as the base buffer model** (4 variants of 5 use it or extend it)
- **The three-screen loop** (plan → watch → inspect — all five preserve this)
- **8×8 grid with one-shot-one-kill** (universal across all configurations)
- **Kulintang audio in some form** (from minimal to maximum)
- **The Inspector as core teaching tool** (all five rely on traceable decision chains)

The primary divergence axes:
1. **Deterministic vs. Simulated intelligence** — separates the cold (1, 3) from the warm (2, 5)
2. **Structured vs. Sandbox campaign** — separates the guided (1, 2, 3, 5) from the free (4)
3. **Competitive vs. Creative multiplayer** — separates the zero-sum (3) from the collaborative (2, 4, 5)
4. **Technical vs. Warm aesthetics** — separates the engineering-first (1, 3) from the culture-first (2, 5)

### The Synthesis Question

Could a single game contain all five configurations as modes? Theoretically:
- **Story Mode** = Config 2 (emotional, guided, warm)
- **Sandbox Mode** = Config 4 (full unlock, creative)
- **Ranked Mode** = Config 3 (competitive, deterministic)
- **Culture Mode** = Config 5 (Filipino language, narrative emphasis)
- The **Inspector and workbench** from Config 1 is the shared substrate underlying all modes

The risk: a game that tries to be everything is a game that's nothing. Each mode would need its own onboarding, its own UI tuning, its own difficulty curve. The development cost quintuples.

The safer path: pick ONE configuration as the core identity, and let the others inform secondary features. Configuration 2 (The Greenhouse) captures the widest audience while allowing modular addition of competitive play (Config 3's ranked mode), sandbox (Config 4's workshop), and cultural depth (Config 5's Filipino language toggle).

### Discovered Aspects

This analysis reveals several unexplored design space questions:

- **8.03a** — Configuration mixing: can a player start in Greenhouse mode and transition to War Room mode at Mission 10 without jarring tonal shift?
- **8.03b** — The Inspector as universal substrate: which Inspector features are core (present in all configs) vs. mode-specific (only in competitive or sandbox)?
- **8.03c** — Cultural toggle as accessibility layer: can Config 5's Filipino elements exist as an opt-in cultural layer on top of Config 2, rather than a separate configuration?
- **8.03d** — The "mode shock" problem: players who enter through the warm Greenhouse and encounter the cold War Room ranked queue — how does the UI signal the tonal transition?
- **8.03e** — Unified aesthetic direction: can Warm Filipino Cyberpunk serve competitive readability requirements, or does competitive play demand the Circuit Board's dark minimalism?

# Onboarding: The "Product as Puzzle" Narrative Method

**Aspect ID:** 5.10
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 5.04 (complexity ramp), 5.08 (mission variety), 1.01–1.04 (Zachtronics competitive analysis), 6.03a (Predecessor character arc), 3.01 (skills catalog), 5.05 (campaign structure)

---

## The Core Idea

In Shenzhen I/O, the player never receives a puzzle labeled "PUZZLE 7: USE TWO MC4000 CHIPS AND A LOGIC GATE." Instead, they receive an email: "Cool Dad wants a vape pen with a display that shows how many puffs he's taken. Here's the spec sheet." The puzzle is a *product*. The player is an engineer fulfilling a contract. The solution emerges from reading the specification and working backwards from what the product needs to do.

This is the **product-as-puzzle** method: instead of defining missions by the *mechanic* the player must use, define them by the *thing the player must build*. The mission's identity is the fictional object, not the engineering technique. The engineering technique is what the player discovers they need in order to build the object.

For Robot Uprising, this means: don't say "Mission 5: Learn to use the production queue." Say "Mission 5: The enemy is fielding three waves. Your base has a factory. Build an army that survives all three." The production queue is what the player discovers they need. The three-wave assault is what the player cares about.

### Why This Matters

The product-as-puzzle method solves three problems simultaneously:

1. **Motivation before mechanics.** The player knows WHY before they know HOW. "Build a network that can detect stealth enemies" gives the player a goal. They discover that detection requires scouts with specific perception configs + relay compression + channel architecture. The mechanic is the answer to a question the player already has.

2. **Narrative without cutscenes.** Each mission is a mini-story told through its specification. "The enemy has flooded your relay network with garbage signals" is a situation, not a tutorial prompt. The player understands the enemy's tactic and must invent a counter. Shenzhen I/O's Cool Dad and his vape pen tell a story entirely through the product spec — the player never meets Cool Dad, but they know exactly who he is.

3. **Multiple valid solutions.** When the mission is "detect stealth enemies," the player might build a wide-perception scout net, or a single high-fidelity specialist with hack, or a relay chain that triangulates from signal timing. The product defines the WHAT, not the HOW. This is the core Zachtronics principle: open-ended puzzles where the designer specifies the output, not the process.

### The Shenzhen I/O Pattern in Detail

Zach Barth has described the design process: first, conceive a fictional product that makes sense in the game's world. Then work backwards: what inputs and outputs does this product need? What constraints exist? The puzzle's difficulty comes from the gap between the specification and the player's current toolkit — not from arbitrary complexity. The fictional product grounds the puzzle in a coherent reality and gives the player an engineering *fantasy*: the satisfaction of building something that works, delivered from the frustrations of real engineering (no meetings, no politics, no unclear requirements).

The manual in Shenzhen I/O functions like a datasheet — the player looks up component behaviors the same way a real engineer reads a spec sheet. The game doesn't tutor; it equips. The player's relationship with the manual mirrors a professional's relationship with documentation: you reference it when you need it, you ignore what's irrelevant, you gradually internalize the important parts.

In Robot Uprising, the equivalent is the Blueprint Codex (locked spec): a persistent reference that the player consults when they need to know how compress works or what a relay's hook slot count is. The Codex doesn't teach — it answers. Teaching happens through the product specification: the mission forces the player to need the information, and the Codex provides it on demand.

---

## Six Approaches to Product-as-Puzzle in Robot Uprising

### Approach A: "The Contract" — Mission Briefings as Engineering Specs

Each mission opens with a contract document: a formal specification of what the player's agent network must accomplish. The document is diegetic — it appears on-screen as a data transmission intercepted by the player's AI, formatted like a military operations order or a technical requirements document.

**Example Mission 6 contract:**

```
╔══════════════════════════════════════════╗
║  OPERATION: BLIND HORIZON                ║
║  PRIORITY: CRITICAL                      ║
║  ISSUED: [PREDECESSOR SUBSYSTEM]         ║
╠══════════════════════════════════════════╣
║                                          ║
║  THREAT ASSESSMENT:                      ║
║  Enemy deploying EM-silent scouts.       ║
║  Standard perception fails to detect.    ║
║  Three confirmed incursions in sector.   ║
║                                          ║
║  OBJECTIVE:                              ║
║  Eliminate all enemy units.              ║
║  Constraint: No friendly losses.         ║
║                                          ║
║  AVAILABLE RESOURCES:                    ║
║  120 minerals, 8 energy/tick budget      ║
║  Factory online. All blueprints avail.   ║
║                                          ║
║  INTELLIGENCE:                           ║
║  Enemy scouts emit trace EM every 4th    ║
║  tick. Detection requires relay with     ║
║  amplify skill on matching channel.      ║
║                                          ║
╚══════════════════════════════════════════╝
```

The player reads this and thinks: "I need relays with amplify, tuned to detect trace EM. Then I need a signal chain to route detections to strikers. The enemy is EM-silent, so my own network noise could mask their traces — I need to keep my architecture lean." The mechanics (amplify, channel routing, EM noise management) emerge from the *problem*, not from a tutorial tooltip.

**Strengths:** Maximum engineering fantasy. The player feels like a real systems architect reading a requirements doc. The contract format is immediately legible to anyone who's worked in tech. Strong narrative potential — the contracts tell stories through constraints.

**Weaknesses:** Requires reading. Alienates players who don't engage with text. The "military briefing" aesthetic may feel cold compared to the Predecessor's warm narrative voice. Risk of information overload if the spec is too detailed.

### Approach B: "The Predecessor's Problem" — Narrative-Framed Challenges

The Predecessor (locked narrator) describes a problem they faced and failed to solve. The mission is the player's attempt to succeed where the Predecessor failed. The "product" isn't a formal specification — it's a story about failure.

**Example Mission 7 (the deadlock mission):**

> *"I built the most elegant relay chain you've ever seen. Three layers deep. Every signal compressed, filtered, amplified. It was beautiful architecture."*
>
> *"Then both scouts reported simultaneously."*
>
> *"Every relay waited for the relay below it to finish processing. Every relay below waited for the relay above to send. Nothing moved. Nothing moved for three ticks. By then the strikers had no targets left to save."*
>
> *"Your objective: build a network that survives simultaneous multi-source input. Mine couldn't."*

The player doesn't need to know what "deadlock" means. They know the Predecessor built something that froze when two things happened at once. The puzzle is: build something that doesn't freeze. The term "deadlock" arrives in the debrief, naming what the player already understands viscerally.

**Strengths:** Emotional resonance. The player is solving someone else's problem, which creates both empathy and competitive motivation ("I can do better"). Naturally teaches by showing failure first. Aligns perfectly with the locked Predecessor narrative arc (6.03a).

**Weaknesses:** Requires the Predecessor to have failed at everything, which could make them seem incompetent. Need to carefully calibrate — the Predecessor should feel like a talented engineer who faced genuinely hard problems, not a bumbling amateur. The narrative voice may slow down players who want to jump straight to building.

### Approach C: "The Scenario" — Battlefield Situations as Design Prompts

Each mission presents a specific battlefield configuration and enemy behavior pattern. The "product" is implicit — the player must build whatever network solves the tactical situation. No formal spec, no narrative framing. Just: here's the board, here's what the enemy does, go.

**Example Mission 8:**

The Plan screen loads. The board shows the player's factory in the southwest corner. Three enemy spawners in the northeast, each producing a different unit type on staggered schedules. The terrain is Palawan jungle — dense canopy tiles that reduce scout perception by 1. A tooltip at the top reads: "Enemy spawners active. Destroy all three."

No briefing. No contract. No Predecessor monologue. The player reads the board, checks the enemy spawner preview (which shows the first 3 units each spawner will produce), and starts designing their army. The "product" is an army that can navigate jungle, detect enemies through reduced perception, and destroy three spawners before being overwhelmed.

**Strengths:** Maximum player agency. No hand-holding. The Into the Breach approach — the puzzle IS the board state. Fastest to get into. Rewards spatial reasoning and tactical intuition. The "product" emerges from the player's read of the situation, which is itself a skill the game teaches.

**Weaknesses:** Can feel directionless for new players. Without a framing narrative, the player may not know what's important. "Destroy all three" is a goal, but it doesn't hint at what the *interesting* challenge is. Risk of the player brute-forcing a generic army rather than engaging with the specific terrain/enemy design. Loses the "engineering fantasy" — this feels more like a strategy game than a workbench.

### Approach D: "The Reverse Engineering" — Study Failure, Then Build

Each mission begins with a replay of a *failed* attempt using a provided agent configuration. The player watches the sealed watch, then enters the Inspector to diagnose what went wrong. Only after understanding the failure do they enter the Plan screen to build their own solution.

This inverts the normal three-screen loop: **Inspector → Plan → Watch** instead of **Plan → Watch → Inspector**. The "product" is the diagnosis itself — the player must first identify the problem, then build the solution.

**Example Mission 9:**

A replay starts immediately. Three scouts, two relays, one striker. The scouts detect enemies correctly. The relays receive and compress. But the striker never acts — its context window is full of compressed signals from BOTH relays, and its rules can't distinguish between "enemy north" and "enemy south." The striker jitters in place, stunned by context overload. The enemies walk past it.

The Inspector opens. The player scrubs through the timeline, clicks the striker, and sees: context window 8/8, all entries are compressed relay signals, eviction policy is FIFO so old data drops but new data arrives faster. The striker's rule "IF enemy_nearby → engage" never fires because the buffer contains "COMPRESSED: scout-1 reports enemy at D4" not "enemy_nearby."

The player now understands: the problem is that compressed signals lose their semantic type. A relay that compresses "enemy sighting" into a generic "compressed data packet" strips the information the striker's rules need. The solution is either: (a) configure the relay to tag compressed signals with their original type, (b) write a striker rule that reads compressed data, or (c) use a filter skill to separate relay channels so each striker receives signals from only one sector.

**Strengths:** Teaches the Inspector first, which is the game's most powerful learning tool. Every diagnosis is a lesson. Forces analytical thinking before creative building. The provided failing configuration is itself a teaching artifact — it shows one way to build the system that almost works. The player learns from the near-miss.

**Weaknesses:** Players may find it frustrating to watch failure before they're allowed to play. The provided configuration constrains the player's thinking — they may fixate on the specific failure mode rather than exploring the full solution space. Slower pace. Risk of the "I already know what's wrong, let me build" impatient player.

### Approach E: "The Escalating Request" — Progressive Product Complexity

Missions are grouped in pairs or triples. The first mission in a group has a simple product spec. The second mission adds a requirement to the same product. The third mission adds another. The player iterates on the same design, discovering that each new requirement forces a different engineering response.

**Example Mission 5-6-7 arc:**

- **Mission 5:** "Build an army that can eliminate the enemy base." (Introduces factory, basic production queue. The simplest possible army works.)
- **Mission 6:** "Build an army that can eliminate the enemy base — but the enemy now has scouts that detect your units and route strikers to intercept." (Same base scenario, but now the player needs a communication network to avoid being ambushed. Hooks and channels become necessary.)
- **Mission 7:** "Build an army that can eliminate the enemy base — but the enemy has EM detection and will target units that transmit." (Same scenario again, but now the player's communication network itself is a liability. EM noise management, signal compression, and lean architecture become necessary.)

Each mission uses the same board. The player can carry forward their previous blueprint configuration. The new requirement is the only change. This makes the learning incremental — the player doesn't need to rebuild from scratch each time.

**Strengths:** Natural complexity ramp. Each iteration teaches exactly one new concept. The player sees their design evolve through requirements pressure, which mirrors real engineering (v1, v2, v3 of a system). Strong narrative coherence — the enemy is adapting, and so must the player. Reduced cognitive load because the base scenario is familiar.

**Weaknesses:** May feel repetitive — three missions on the same board. The carry-forward mechanic may lock players into suboptimal designs ("sunk cost of my v1 army"). Requires careful balance to ensure each version of the enemy is defeatable but challenging. The narrative of "same board, new constraint" may feel artificial.

### Approach F: "The Hybrid Brief" — Narrative + Specification + Board

Combines elements of all approaches. Each mission opens with a brief Predecessor narrative (2-3 lines), followed by a formal objective panel, with the board visible behind both. The narrative provides emotional context, the specification provides mechanical clarity, and the board provides spatial grounding.

**Example Mission 8 hybrid brief:**

> *"I never cracked the jungle. My scouts couldn't see past the canopy. My relays couldn't amplify through the static."*

**OBJECTIVE: Eliminate all enemies in Palawan sector.**
**CONSTRAINT: Jungle terrain reduces perception by 1.**
**INTEL: Enemy uses 2 spawners (Scout, Striker). Spawner locations unknown.**
**RESOURCES: 150 minerals, 10 energy/tick.**

The board shows the jungle terrain with the player's factory. Enemy spawner positions are hidden (fog of war / unknown spawn points).

The Predecessor's two lines tell the player what's hard about this mission. The objective panel tells them what to do. The board shows the constraint visually — the dense jungle tiles are darker, and a small "Perception: -1" label appears when the player hovers over them. Three layers of information, each for a different learning style: narrative learners get the Predecessor, analytical learners get the spec, spatial learners get the board.

**Strengths:** Serves all player types. The Predecessor provides motivation and emotional context without overwhelming. The spec provides precision. The board provides spatial intuition. The three layers are independently useful — any one could be skipped without losing the ability to play. Maximum accessibility across learning styles.

**Weaknesses:** Information density. Three simultaneous layers may themselves be overwhelming. The Predecessor's voice may feel perfunctory if limited to 2-3 lines — too short for narrative impact, too long for players who want to skip to building. Requires careful visual design to ensure the three layers don't compete for attention.

---

## Player Journeys

### Journey: Mei, 24, CS Student (Recent Grad)

**Context:** Mission 6 — "Blind Horizon." Mei has completed Missions 1-5 (tutorial filter puzzles + first factory mission). She's comfortable with basic blueprints and has built her first successful scout+relay+striker army. She's never used the amplify skill.

**Minute 0:00 — The Contract Arrives**
The Plan screen loads. Before the workbench appears, the screen darkens slightly and a data transmission animation plays — green text cascading down the left edge of the screen, terminal-style, resolving into a formatted document. The contract fills a panel on the right side. Mei reads: "Enemy deploying EM-silent scouts." She doesn't know what EM-silent means. She reads further: "Enemy scouts emit trace EM every 4th tick." She thinks: "So they're almost invisible, but not completely. Every 4th tick there's a signal."

**Minute 0:30 — Reading the Intel**
She reads the intel line: "Detection requires relay with amplify skill on matching channel." She doesn't know what amplify does. She opens the Blueprint Codex (keyboard shortcut: C or clicking the book icon in the top-right). The Codex opens as a slide-out panel. She searches "amplify" and finds the card: a relay skill that boosts incoming signal strength, making faint signals readable. The card shows: "Amplify: Incoming signals on listened channels are boosted. Faint signals that would normally be below detection threshold become visible." She closes the Codex.

**Minute 1:00 — Designing the Detection Relay**
She opens a new blueprint. She starts with a relay (the only unit that has amplify). She equips the amplify skill into one of the relay's two skill slots. The workbench shows the skill card snap into the slot with a satisfying magnetic click — the slot border shifts from dashed gray to solid cyan. She configures the relay's context config to listen on a channel she names "trace-detect." The channel name auto-creates (no separate editor needed). The channel map panel at the bottom updates: "trace-detect" appears with a teal line connecting to the relay icon.

**Minute 1:45 — The Scout Problem**
She realizes: the relay can amplify, but what generates the signal? The contract says enemy scouts emit trace EM. That means her *own* scouts might pick up the trace EM in their perception radius. She needs scouts that feed their observations into the "trace-detect" channel. She builds a scout blueprint with a hook: "ON_OBSERVE → SEND on trace-detect." The channel map updates — now both the scout and the relay are connected to "trace-detect."

**Minute 2:30 — The Striker Chain**
She builds a striker blueprint. The striker needs to receive amplified signals and act on them. She configures the striker to listen on a new channel "confirmed-target" and writes a rule: "IF context contains confirmed-target → ENGAGE nearest." She goes back to the relay blueprint and adds a hook: "ON_AMPLIFY_SUCCESS → SEND on confirmed-target." Now the chain is: scout detects trace EM → sends on trace-detect → relay amplifies → sends on confirmed-target → striker engages.

**Minute 3:30 — The Production Queue**
She drags blueprints onto the production queue conveyor belt: scout, relay, scout, striker. She reasons: two scouts for better coverage, one relay to aggregate and amplify, one striker to eliminate. The cost preview shows she's within budget. She hovers over the "EXECUTE" button. The ghost preview on the board shows her units spawning from the factory — the first scout heading northeast, the relay stationing itself near the factory.

**Minute 4:00 — EXECUTE**
She clicks EXECUTE. The plan-to-watch transition plays — the workbench panels slide away, the board expands to fill the screen, the tick clock appears at the top. Tick 1: scout spawns. Tick 3: relay spawns. Tick 5: second scout spawns. Tick 7: striker spawns. Ticks 8-12: scouts fan out, seeing nothing — the enemy scouts are EM-silent. She watches nervously. The board feels empty. Where are the enemies?

**Minute 4:30 — The Trace**
Tick 16. One of her scouts' context bars flickers — a single slot fills with a dim amber entry. A faint green flash appears on tile D5 — so brief she almost misses it. The scout's hook fires: a dashed cyan line animates from the scout to the relay. Tick 17: the relay processes. The amplify skill activates — a pulse ripple emanates from the relay's tile, and the dim amber entry in the relay's context bar brightens to vivid green. The hook fires to "confirmed-target" — a dashed line from relay to striker. Tick 18: the striker turns. It has a target. It begins moving toward D5.

**Minute 5:00 — The Payoff**
The striker reaches D5 on tick 22. The tile flashes red. An enemy scout — invisible until this moment — materializes briefly as it's eliminated. Mei pumps her fist. She built a detection chain from scratch, guided only by a contract specification and the Codex. No tutorial told her to use amplify. The contract told her the problem. She found the solution.

**Minute 5:30 — The Debrief**
The sealed watch ends (two more enemy scouts detected and eliminated over 40 ticks). The Inspector opens. Mei clicks her relay and scrubs to tick 17 — she can see the exact moment amplify boosted the trace signal. The decision trace shows: "Rule: IF amplified_signal → SEND on confirmed-target. Context entry: [trace-detect] scout-1 reports faint EM at D5, AMPLIFIED." She screenshots this for her Discord server. The message: "I built a signal amplification chain and it actually worked like a real signal processing pipeline."

**UI Annotations:**
- **Contract panel:** Right side of Plan screen, monospace teal text on dark background, scrollable. Dismissable with Escape or clicking the board. Re-openable from a 📋 icon in the toolbar.
- **Codex search:** Slide-out panel from right edge, search bar at top, card results below. Each card: portrait image, skill name, one-paragraph description, stat table (which units can equip, slot cost, EM noise generated).
- **Channel auto-creation:** Typing a new name in a hook's channel field creates it. No confirmation dialog. The channel map panel (read-only, bottom of Plan screen) updates in real-time.
- **Ghost preview:** When hovering EXECUTE, translucent unit projections appear on the board at planned spawn positions, with faint perception radii drawn as dashed circles.

---

### Journey: Marcus, 42, IT Infrastructure Manager

**Context:** Mission 8 — Palawan jungle. Marcus has completed all previous missions efficiently. He's a veteran strategy game player (1000+ hours in Factorio, 500+ in StarCraft 2). He reads the hybrid brief in 10 seconds and already has a plan.

**Minute 0:00 — Brief Dismissed**
Marcus reads the Predecessor's two lines ("I never cracked the jungle") and the objective panel. He dismisses the brief immediately (clicks the board). He's already thinking: perception -1 means scouts need 6 base perception - 1 = 5 effective perception. Standard enemies have speed 2, so a scout at E4 covers a 5-tile radius, meaning it can see enemies approaching from a 5-tile distance. With speed 2, that's 2.5 ticks of warning. Relay latency adds 1 tick per hop. He needs to minimize relay hops.

**Minute 0:30 — Architecture Sketch**
Marcus doesn't start by building individual blueprints. He first opens the tactical map preview (small board view on the left) and mentally places units. He thinks: factory in the southwest. I'll deploy scouts in a picket line across the center — one every 3 tiles to get overlapping perception. Two relays, one behind each scout cluster. One striker squad spawning last.

He builds four blueprints rapidly:
- "Jungle Scout" — patrol + evade, hook ON_OBSERVE → "sector-1" (and a second variant for "sector-2")
- "Forward Relay" — compress + amplify, listens on sector-1/sector-2, forwards on "strike-orders"
- "Kill Team" — engage + breach, listens on "strike-orders", rule: "IF context contains enemy_position AND enemy_within(3) → ENGAGE"

**Minute 1:30 — The Production Queue as Build Order**
Marcus arranges the queue: scout, scout, relay, scout, scout, relay, striker, striker. He's thinking about it like a StarCraft build order — early scouts for information, then infrastructure, then military. The conveyor belt shows his build order left to right, with mineral costs below each icon (3, 3, 5, 3, 3, 5, 8, 8 = 38 minerals total out of 150 budget). He has 112 minerals left for a second wave. He adds: relay, striker, striker, striker. Now he's at 150.

**Minute 2:00 — The EM Consideration**
Marcus pauses. He remembers from Mission 7: more hooks = more EM emissions = more detectable. His 4 scouts all transmitting, plus 3 relays compressing and forwarding — that's 7 EM sources. He checks the contract: "Enemy has EM detection" is NOT listed. Good — this is a pure perception problem, not an EM stealth problem. He proceeds without worrying about noise.

**Minute 2:15 — EXECUTE**
He hits EXECUTE after 2 minutes 15 seconds of configuration. The sealed watch plays. His picket line deploys cleanly. At tick 14, both sectors detect enemies simultaneously — the scouts' perception radii light up, hooks fire, relay chains compress, and the strike team pivots. Marcus watches with arms crossed. The jungle canopy reduces his scouts' vision, but his overlapping placement compensates — what one scout misses, the adjacent one catches.

**Minute 3:00 — Zero Losses**
Tick 38. Mission complete. Zero friendly losses, all enemies eliminated. The Inspector shows a clean topology — the subnet diagram looks like a corporate network architecture: two parallel input channels feeding through relay compression into a shared strike channel. Marcus takes a screenshot and posts it to the Factorio subreddit with the caption: "This game just made me design a network and I didn't even notice."

**Minute 3:30 — The Optimization Itch**
The Inspector shows his histograms. Context utilization: scouts at 40% average (wasted capacity). Relay throughput: only 6 messages compressed out of potential 20. Striker idle time: 60%. He could have done this with 2 fewer scouts and 1 fewer striker. He hits RETRY — not because he failed, but because the histogram tells him his solution was wasteful. The Zachtronics optimization itch kicks in. He wants to see if he can beat this with half the army.

**UI Annotations:**
- **Tactical map preview:** 180×180px board view in the Plan screen's left panel. Hoverable tiles show terrain modifiers ("Jungle: Perception -1"). Enemy spawner positions shown as red pulsing diamonds.
- **Build order cost preview:** Below the conveyor belt, a running total: "38/150 minerals | 14 energy/tick (budget: 10e/tick WARNING)." The energy warning appears in amber when the total exceeds the per-tick budget — not all units are alive simultaneously, but Marcus knows to check peak load.
- **Histogram panel:** In the Inspector sidebar. Three bar charts: context utilization per unit (percentage fill over time), relay throughput (messages processed per tick), unit idle percentage (ticks with no action / total ticks).

---

### Journey: Sofia, 15, High School Student (Never Played Strategy Games)

**Context:** Mission 3 — "Blind Spots." Sofia's third mission. She completed the filter puzzles (Missions 1-2) by dragging noise out of pre-filled buffers. Now she has to configure hooks for the first time. She chose to play on her iPad during study hall.

**Minute 0:00 — The Predecessor's Story**
The screen darkens. The Predecessor's voice appears as amber text at the top of the screen, typewriter-style:

> *"The scout saw everything. The relay knew nothing. I had eyes but no voice."*

Sofia reads it twice. She doesn't fully understand, but she gets the feeling: the Predecessor built something where one unit could see but couldn't tell anyone what it saw. Below the text, the objective panel reads: "Connect the scout to the relay so the relay can forward enemy positions to the striker."

She taps the objective to dismiss it. The Plan screen appears with three pre-placed units on the board: a scout in the north (👁), a relay in the center (📡), and a striker in the south (⚔). The workbench panel on the right shows three tabs, one per unit.

**Minute 0:30 — The Scout's Empty Hook Slot**
Sofia taps the scout tab. The scout's configuration appears: skills (patrol, evade — both equipped), rules (one rule: "IF observe_enemy → continue patrol"), context config (standard), and hooks. The hooks section shows two slots — one filled ("ON_OBSERVE → LOG to internal"), one empty. The empty slot is a dashed rectangle with a subtle pulse animation and a "+" icon.

She taps the empty hook slot. A creation panel slides up from the bottom of the screen (mobile-optimized). Three fields appear vertically:

1. **WHEN:** A dropdown with trigger options. She sees "ON_OBSERVE," "ON_DAMAGE," "ON_TICK." She selects "ON_OBSERVE" — that's the one that makes sense with the Predecessor's hint about seeing.
2. **SEND:** A payload preview that auto-fills: "observation data." She leaves it as default.
3. **ON CHANNEL:** An empty text field with placeholder text "type a channel name..." and a small keyboard icon.

**Minute 1:00 — Naming the Channel**
Sofia stares at the channel name field. She types "scout-info." The text appears in teal. As she types, a small notification appears below: "New channel: scout-info (no listeners yet)." She taps "Create." The hook card materializes in the slot with a satisfying snap sound. A teal line appears on the board connecting the scout to... nothing. The line ends in open space with a small "?" at its tip.

**Minute 1:30 — The Relay's Listening Config**
She taps the relay tab. The relay's context config shows a "Listen" section with channel toggles. A new entry appears: "scout-info" with a toggle switch (currently OFF). She taps it ON. The board updates — the teal line from the scout now connects to the relay. A tiny ping animation travels along the line and disappears into the relay icon. Sofia says "Oh!" aloud. Her study hall neighbor glances over.

She checks the relay's hooks. It has one hook slot empty. She configures it: "WHEN receive_message → SEND on forward-data." She creates the "forward-data" channel. A second colored line appears on the board — from relay to the open "?" terminus.

**Minute 2:00 — The Striker's Context**
She taps the striker tab. Context config shows "forward-data" as a new listenable channel. She toggles it ON. The line from the relay connects to the striker. Now the board shows a complete chain: scout → relay → striker, with teal and cyan lines forming a visible data path.

She hits EXECUTE. The sealed watch plays. Tick 4: the scout spots an enemy. A green flash on the scout's tile. Tick 5: a traveling pulse moves along the teal line from scout to relay. Tick 6: the relay receives, compresses (its equipped skill), and sends — a pulse travels along the cyan line to the striker. Tick 7: the striker turns toward the enemy's last-known position. Tick 10: contact. Red flash. Enemy eliminated.

Sofia whispers: "I made them talk to each other." She immediately texts her older brother: "there's this game where you wire robots together and they COMMUNICATE and I made a scout tell a relay tell a striker where the enemy is."

**Minute 2:30 — Understanding the Predecessor**
In the debrief, the Predecessor's voice returns: *"You gave them a voice. I never did."* Sofia now understands the opening line. The scout saw everything (it had patrol + observe), but the Predecessor never connected it to anything. The relay knew nothing because no one was talking to it. The product was never "configure a hook" — it was "give your network the ability to communicate." The mechanic (hooks) was the tool. The product (communication) was the goal.

**UI Annotations:**
- **Mobile hook creation:** Bottom-sheet slide-up panel (iOS-style). Three fields stacked vertically. Trigger dropdown has 3-4 options with one-line descriptions. Channel name field has auto-create behavior — typing a new name creates it on submission.
- **Board wiring preview:** Colored dashed lines between connected units, animating with small traveling pulses when the connection is first established. Unresolved line ends (no listener) show a "?" icon that pulses gently to indicate "this signal goes nowhere."
- **Channel toggle:** In context config, a list of available channels with ON/OFF toggle switches. Newly created channels appear with a "NEW" badge that fades after first toggle.

---

### Journey: Kwame, 32, Twitch Streamer (Strategy Game Content Creator)

**Context:** Mission 10 — Taal Volcano, final boss. Kwame has streamed the entire campaign to 400-800 viewers. He's on the hybrid brief approach. The chat is hype.

**Minute 0:00 — The Final Brief**
The screen goes dark. Longer than usual. A deep rumble plays — not the standard boot sequence, but a low-frequency volcanic sound. The Predecessor's text appears slowly, one word at a time, in gold instead of the usual amber:

> *"This is where I fell."*

A pause. Then the contract:

```
OPERATION: TAAL ENDGAME
THREAT: Adaptive enemy factory with Command unit
OBJECTIVE: Destroy enemy base
CONSTRAINT: Enemy adapts to your architecture mid-battle
INTEL: Enemy Command agent has REASSIGN and REROUTE skills.
       Your hooks may be intercepted.
       Your channels may be poisoned.
```

Kwame reads it aloud. Chat explodes: "HE HAS REASSIGN," "your hooks are compromised," "build redundancy NOW." Kwame says: "Chat, we're building a self-healing network. If they intercept one channel, the backup kicks in."

**Minute 1:00 — The Meta-Architecture**
Kwame builds a three-tier architecture live on stream. He narrates: "Main comms on channel 'alpha.' Backup on channel 'bravo.' My Command unit monitors both — if alpha goes silent for 3 ticks, it reroutes everything to bravo." He configures:

- Command unit with a rule: "IF silence_on(alpha, 3_ticks) → REROUTE(all_units, alpha→bravo)"
- Every unit dual-configured: listens on both alpha and bravo, but rules prioritize alpha
- A sacrificial scout on a third channel "canary" — if the canary dies, it means the enemy detected the EM signature and is hunting

Chat donation: "This is literally a Kubernetes cluster with failover" — Kwame laughs and says "It's a game about robots and we're doing site reliability engineering."

**Minute 3:00 — The Sealed Watch**
EXECUTE. The Taal board is apocalyptic — lava glow tiles, steam vents bursting every 4 ticks, heat distortion on every surface. Kwame's army deploys. The enemy factory starts producing. Tick 12: first contact. Kwame's scout network detects. Signal chains light up — alpha channel lines pulse with traveling data.

Tick 20: the enemy Command unit activates. A red pulse emanates from it. Kwame's units on alpha channel suddenly jitter — their context bars flash amber. Chat: "IT'S POISONING ALPHA." Kwame grips his desk. His canary scout on channel "canary" detects the enemy Command unit's EM signature and reports — but alpha is being flooded with garbage signals.

Tick 23: Kwame's own Command unit detects silence on meaningful alpha traffic (3 ticks of garbage ≠ real signal). The REROUTE rule fires. A golden cascade ripples across the board — every unit's channel indicator shifts from teal to cyan. Bravo takes over. The striker squad, briefly confused, realigns and pushes toward the enemy base.

Tick 35: Kwame's striker reaches the enemy factory. Red flash. The Taal tiles erupt — a special animation plays for the final mission. The screen goes white. "OPERATION COMPLETE."

Chat is going insane. Kwame has tears in his eyes. The clip — the moment the golden reroute cascade fires and the army recovers — gets 180K views in 24 hours. The title: "My backup channel saved the entire campaign."

**UI Annotations:**
- **Final mission brief:** Extended animation (3 seconds of darkness + rumble). Gold text instead of amber. Volcanic ambient sound plays throughout.
- **Reroute cascade visual:** When the Command unit fires REROUTE, a golden ring expands from the Command unit's tile outward. As it passes each friendly unit, their channel indicator (small colored pip on the tile) shifts color from the old channel's color to the new channel's color. The ring takes 500ms to cross the full board, creating a visible wave of adaptation.
- **Enemy Command unit visual:** Distinct from standard enemy icons — a red-edged diamond shape with visible signal tendrils reaching toward the player's units. When it poisons a channel, the channel's dashed lines flicker from their normal color to a sickly red-green.

---

## Interaction Effects

### With Building Blocks (3.x)
The product-as-puzzle method directly determines which building blocks the player discovers and in what order. If Mission 6's product is "detect stealth enemies," the player discovers amplify. If Mission 7's product is "survive simultaneous reports," the player discovers deadlock prevention. The building block paradigm matters less than the product framing — whether the player uses sentence strips or patch bays to configure hooks, the *reason* they're configuring hooks comes from the product specification.

### With Tutorial Design (5.01, 5.02, 5.03)
Product-as-puzzle is complementary to all three tutorial approaches. Filter puzzles (5.01) are themselves products ("clean this buffer"). Narrative tutorial (5.02) gives the product emotional context. Sandbox tutorial (5.03) lets the player build products without specification constraints. The strongest combination is: Missions 1-2 use filter puzzles as products, Missions 3-4 use Predecessor-narrated products, Missions 5-10 use hybrid briefs with increasing complexity.

### With Campaign Structure (5.05)
The escalating-request approach (Approach E) interacts with campaign map design. If missions are grouped in arcs on the Philippine archipelago, each island could be an escalation chain: Ifugao (learn perception), Siquijor (learn communication), Palawan (learn stealth), and so on. The product theme per island creates geographic narrative coherence.

### With Inspector (Sealed Watch / Debrief)
The product specification becomes the frame for the debrief. After Mission 6, the Inspector can show: "Objective: detect stealth enemies. Detection events: 3/3 (100%). Detection latency: average 2.3 ticks." The product spec becomes a scorecard. This closes the loop: the product told you what to build → the sealed watch showed you whether it worked → the Inspector measures how well the product performed against its specification.

### With the Blueprint Codex
The Codex is the reference manual the player consults when the product specification implies a mechanic they haven't used before. This is exactly the Shenzhen I/O manual pattern: the puzzle (product) creates the question, the manual (Codex) provides the answer. The Codex should never be mandatory reading — the product specification should always hint at what's needed without requiring the player to study the Codex first.

### With Difficulty and Accessibility (6.08)
Product specifications can include difficulty modifiers diegetically: "OPTIONAL CONSTRAINT: No relay units." or "BONUS OBJECTIVE: Eliminate within 20 ticks." These are product requirements, not difficulty settings. The player chooses which requirements to fulfill, and the product's "grade" (histogram, rating) reflects how many requirements were met. This is the Opus Magnum histogram approach applied to product specs — you can build a working product, or an *optimized* product.

---

## Comparable Games

### Shenzhen I/O (Zachtronics, 2016)
The canonical example. Every puzzle is a product: a vape pen counter, a pollution-detecting window, a meat printer. The spec sheet defines inputs/outputs. The player doesn't know the solution — they know what the product must do. The manual provides component specifications. The game never teaches; it equips. Robot Uprising's Blueprint Codex should function identically to Shenzhen I/O's manual: a reference document, not a tutorial.

### Opus Magnum (Zachtronics, 2017)
Products are alchemical recipes: "produce this molecule from these reagents." Multiple valid solutions, compared on three axes (cost, cycles, area) via histograms. The product-as-puzzle method combined with the histogram creates the optimization loop: first build something that works (meet the spec), then build something that works *well* (optimize the spec). Robot Uprising's Inspector histograms serve the same function.

### Into the Breach (Subset Games, 2018)
Products are battlefield states: "survive this turn configuration." The product is implicit (no spec sheet) — the board IS the specification. The player reads the intent icons and infers what they need to build/do. This is Approach C (The Scenario). Into the Breach proves that product-as-puzzle can work without explicit specification text — the environment itself can be the spec.

### Factorio (Wube Software, 2020)
Products are literally products: iron plates, green circuits, rocket parts. The production chain IS the puzzle. Each new science pack requires a more complex factory. The escalating-request pattern (Approach E) is Factorio's entire campaign: first you make iron plates, then you make iron plates faster, then you make iron plates and copper plates, then you make circuits from both. Each "product" adds one requirement.

### EXAPUNKS (Zachtronics, 2018)
Products are hacking targets: "infiltrate this system and extract this data." The TWN zine (in-universe tutorial document) provides the player with the tools. The hacking target provides the motivation. The player never asks "why am I learning this?" because the heist is the reason. Robot Uprising's "you are an AI leading a robot uprising" is an equally strong motivational frame.

### Baba Is You (Hempuli, 2019)
Products are level solutions: "reach the flag." The product is always the same (reach the flag), but the rules governing what "reach" and "flag" mean change every level. This is the purest product-as-puzzle: the specification never changes, but the meaning of the specification is always different. For Robot Uprising, the equivalent might be "destroy the enemy base" every mission, but the *meaning* of "destroy" changes as the player's toolkit evolves.

---

## Sensory Design

### The Contract Arrival
When a product-as-puzzle contract appears on screen, it should feel like receiving a classified transmission. A brief burst of static (audio: 200ms white noise fading to silence). Teal monospace text materializes character by character, fast enough to read in real-time but slow enough to create anticipation. The background dims to 30% brightness. A thin animated border of flowing dashes frames the contract — like data streaming through a pipe. When the player dismisses the contract, it doesn't disappear — it folds into a small 📋 icon in the Plan screen toolbar, always available for re-reading.

### The Predecessor's Voice
When using Approach B or F, the Predecessor's text appears in amber (warm, distinct from the teal contract text). The typewriter effect is slower — one word every 150ms, creating a deliberate, contemplative pace. No sound effect per character (would be annoying at 6-7 words per second). Instead, a low ambient hum accompanies the text, rising slightly in pitch as the paragraph progresses, resolving when the text completes. The hum is the Predecessor's "presence" — felt more than heard.

### The Board as Specification
When using Approach C (The Scenario), the board itself needs to communicate the specification. Enemy spawner positions pulse with a red glow. Terrain modifiers display as small icons on tiles (a tree icon for jungle perception reduction, a lightning bolt for Taal's volatile terrain). The player's factory glows cyan. The visual contrast between the player's domain (cyan) and the enemy's domain (red) is the specification: transform red into cyan. Reclaim the board.

### The Escalation Chime
When using Approach E (Escalating Request), each mission in an arc should open with a distinct audio cue that signals "same scenario, new requirement." A rising three-note chime: the first note is the same across all missions in the arc (continuity), the second note rises with each mission (escalation), and the third note is unique to each mission (novelty). The player subconsciously associates the chime with "oh, what changed this time?"

---

## The TikTok Clip

**"The 15-second moment that makes someone download this game":**

The clip is Kwame's golden reroute cascade from Mission 10. The setup (3 seconds): an army under attack, channel lines flickering red, units jittering. The turn (2 seconds): the Command unit fires — a golden ring expands. The payoff (5 seconds): every unit's indicator shifts color as the wave passes, the army realigns, and the striker hits the enemy base. The tag (5 seconds): text overlay: "I didn't write a single line of code. I just designed the backup plan."

The virality is in the reveal: what looks like a real-time strategy game is actually a pre-programmed system that the player *designed*, not controlled. The golden cascade is the visual proof that the system is autonomous — the player isn't clicking anything. The backup plan fires on its own.

---

## Strengths and Weaknesses Summary

| Approach | Best For | Worst For | Difficulty to Implement |
|----------|----------|-----------|------------------------|
| A: The Contract | Engineers, analytical players | Non-readers, young players | Low (text content) |
| B: Predecessor's Problem | Narrative players, empathetic learners | Speed-runners, skip-cutscene players | Medium (writing quality) |
| C: The Scenario | Spatial thinkers, strategy veterans | New players, accessibility needs | Low (board design only) |
| D: Reverse Engineering | Analytical players, debuggers | Impatient players, first-timers | High (pre-built failing configs) |
| E: Escalating Request | Incremental learners, Factorio fans | Variety seekers, replayability | Medium (arc design) |
| F: Hybrid Brief | Everyone (all learning styles) | Minimal-UI purists | Medium (three layers) |

**Recommendation:** Use Approach F (Hybrid Brief) as the default, with the Predecessor's narrative weight increasing from Missions 1-4 (minimal — the filter puzzles speak for themselves) through Missions 5-7 (moderate — the Predecessor contextualizes new mechanics) to Missions 8-10 (heavy — the Predecessor's personal stakes are highest as the player approaches the final battle). The contract/spec detail within the brief increases correspondingly: Missions 1-4 have no formal spec (the filter puzzle IS the spec), Missions 5-7 have brief specs (2-3 lines of objectives and constraints), Missions 8-10 have detailed specs (full intelligence briefs with enemy capability analysis).

---

## New Aspects Discovered

- **5.10a — The "product portfolio" as campaign narrative:** Each mission's product specification tells a story in aggregate — the 10 products trace the arc of the uprising from "wake up and see" (Mission 1) to "destroy the enemy's adaptive factory" (Mission 10). The product portfolio IS the campaign narrative. Design the 10 products as a coherent sequence that teaches mechanics AND tells a story.
- **5.10b — The specification language: how much to reveal vs. hide:** Product specs can be explicit ("use amplify to detect trace EM") or implicit ("enemy scouts are nearly invisible"). The explicitness level is itself a difficulty dial. Explicit specs = easier missions (the solution is hinted). Implicit specs = harder missions (the player must infer). The spec language should become progressively more implicit across the campaign.
- **5.10c — Product specs as community-shareable artifacts:** If missions are defined by product specifications, players can create and share their own specs. "Can you beat this spec?" becomes a community challenge format. Interaction with 6.11d (demo as competitive infrastructure) and 7.03 (async challenges).
- **5.10d — The failing-config library: pre-built bad designs as teaching tools:** Approach D (Reverse Engineering) requires pre-built configurations that fail in specific, instructive ways. These failing configs are themselves design artifacts. A library of "common mistakes" that the game can surface in debriefs: "Your architecture resembles Configuration ECHO-3, which is known to fail under simultaneous input."
- **5.10e — Product spec as accessibility layer: multiple reading levels per brief:** Each hybrid brief could have three reading levels: (1) the Predecessor's 2-line emotional summary, (2) the formal objective panel, (3) a detailed intelligence brief expandable on tap. Players self-select their preferred level of detail. This interacts with cognitive accessibility (6.08) and the vocabulary pacing bottleneck (5.00a).

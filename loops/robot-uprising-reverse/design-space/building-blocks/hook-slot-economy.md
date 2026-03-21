# 3.08c — Hook Slot Economy as Strategic Constraint

## Overview

The locked spec assigns hard hook slot limits to each unit type: Scout (2), Striker (2), Specialist (2), Relay (4), Command (6). These aren't arbitrary numbers — they are the game's primary resource scarcity for reactive behavior design. A scout with 2 hook slots can only wire 2 triggers into the information network. Every hook you install means another hook you didn't install. Every slot you fill forecloses an alternative architecture.

This is the "deckbuilding squeeze" problem applied to event-driven wiring. In Slay the Spire, you can't put every good card in your deck — too many dilutes your draws. In Robot Uprising, you can't wire every good trigger on a single agent — too few slots forces hard choices about what each agent should react to and broadcast.

This document explores how slot scarcity creates design pressure, what decisions it forces on the player, what pathologies emerge when slots are too scarce or too generous, and how the slot economy interacts with the broader information architecture.

---

## The Fundamental Tension: Sensing vs. Broadcasting vs. Self-Preserving

With only 2 hook slots, a scout must choose between three functional categories of hook behavior:

1. **Sensing hooks** — fire when the unit observes something. "When I spot an enemy, broadcast on `threat-net`." The unit becomes a sensor in the network.
2. **Relay hooks** — fire when the unit receives a signal. "When I hear on `command-net`, rebroadcast on `local-net`." The unit becomes a signal repeater.
3. **Self-preservation hooks** — fire on personal threat conditions. "When my context window hits 80%, compress." The unit manages its own survival.

Two slots means: you can be a sensor and a relay, but not self-preserving. Or a sensor and self-preserving, but not a relay. The triangle of sensing/relaying/surviving with only 2 vertices is the atomic strategic dilemma of the game.

For relays with 4 slots, the triangle softens — you can cover all three categories and still have a slot for something exotic. For command units with 6 slots, the constraint is almost philosophical — what DON'T you want this unit reacting to? The scarcity gradient across unit types (2 → 4 → 6) mirrors the progression from tactical grunt to strategic nexus.

---

## The Slot Economy's Five Design Pressures

### Pressure 1: "The Last Slot Problem"

When you have one slot remaining, every hook idea competes against every other hook idea for that single slot. This is where the game's strategic depth concentrates. A player with one slot left on a scout must weigh:

- "ON_OBSERVE → broadcast on `enemy-positions`" (makes the scout useful to the network)
- "ON_THREAT → broadcast on `danger-close`" (gives the network early warning of threats near the scout)
- "ON_RECEIVE from `retreat-net` → trigger evade" (lets the command structure save the scout remotely)
- "ON_CONTEXT_FULL → compress" (prevents context overload stun)

Each is defensible. Each forecloses the others. The player must decide what role this particular scout plays in the overall architecture — and that role decision is the game.

### Pressure 2: "The Duplicate Problem"

If you have 3 scouts, do they all get the same 2 hooks? Identical configurations mean identical behavior — the scouts are interchangeable. Different configurations mean specialized scouts — one is the early warning sensor, another is the relay repeater, the third is the self-sufficient lone wolf. The slot economy forces the player to choose between **redundancy** (all scouts can do the same thing, losing one doesn't break the network) and **specialization** (each scout fills a unique role, losing one creates a capability gap).

This maps directly to real distributed systems design: do you run identical replicas for fault tolerance, or specialized microservices for capability breadth?

### Pressure 3: "The Channel Pollution Problem"

Every hook that fires produces a signal on a channel. More hooks = more signals = more EM emissions = more enemy detection risk. The slot economy acts as a natural throttle on network noise. A player who fills every hook slot on every unit creates a maximally reactive, maximally loud network. A player who leaves slots intentionally empty creates a quieter, more disciplined network that's harder for enemies to detect — but less responsive.

The empty slot is a valid strategic choice. The slot economy makes that choice feel intentional rather than neglectful.

### Pressure 4: "The Blueprint Reuse Problem"

Blueprints define hooks for a unit type — every unit produced from that blueprint has the same hooks. But the ideal hooks for the first scout produced (exploring unknown territory alone) differ from the ideal hooks for the fourth scout (operating in a well-mapped theater with relay coverage). The slot economy makes this tension sharp: 2 slots can't serve both the lone explorer and the network-integrated sensor simultaneously.

This pressure pushes players toward creating multiple blueprints for the same unit type — "Scout-Alpha" for early-game exploration, "Scout-Bravo" for mid-game integrated sensing. The factory production queue then becomes a temporal decision: when do I switch from producing Alphas to producing Bravos?

### Pressure 5: "The Relay Multiplier Problem"

A relay with 4 hook slots is worth more than two scouts with 2 slots each, because the relay's hooks can reference different input channels and output to different channels — acting as a signal router. The relay's 4 slots enable topologies that 2-slot units physically cannot construct:

- Slot 1: Listen on `threat-net`, rebroadcast on `striker-orders` (threat routing)
- Slot 2: Listen on `resource-net`, rebroadcast on `specialist-orders` (resource routing)
- Slot 3: ON_RECEIVE from `command-net` → amplify and broadcast on `all-units` (command amplification)
- Slot 4: ON_CONTEXT_FULL → filter and compress (self-maintenance)

This 4-slot configuration creates a signal switchboard that no number of 2-slot scouts could replicate. The slot economy makes the relay's value proposition immediately legible: it's the unit that can wire more things together.

---

## Slot Scarcity by Unit Type: Design Implications

### Scout (2 slots): "The Binary Choice"

Two slots is the tightest constraint in the game. The scout is forced into a **two-word identity**: it can do exactly two reactive things. This extreme scarcity has a clarifying effect — the player cannot overthink a scout's hook configuration. It's a five-second decision compared to the five-minute decision of configuring a command unit.

**Common scout archetypes that emerge from 2-slot pressure:**

| Archetype | Slot 1 | Slot 2 | Role |
|-----------|--------|--------|------|
| "Alarm Wire" | ON_OBSERVE → `threat-net` | ON_THREAT → `danger-close` | Pure sensor, no self-preservation |
| "Cautious Eye" | ON_OBSERVE → `threat-net` | ON_CONTEXT_FULL → compress | Sensor that won't stun-lock |
| "Obedient Scout" | ON_OBSERVE → `threat-net` | ON_RECEIVE `retreat-net` → evade | Sensor that responds to commands |
| "Silent Runner" | ON_THREAT → evade | ON_CONTEXT_FULL → compress | Self-sufficient, tells no one |
| "Relay Scout" | ON_RECEIVE `command-net` → rebroadcast `local-net` | ON_OBSERVE → `threat-net` | Signal repeater that also senses |

Five distinct identities from just 2 slots and a handful of triggers. The slot economy creates meaningful variety from minimal components.

### Relay (4 slots): "The Switchboard"

Four slots is the relay's identity. This isn't 2x a scout — it's qualitatively different. Four slots enable **conditional routing**: listen on multiple channels, output to multiple channels, with self-maintenance. The relay becomes a programmable signal processor.

The strategic pressure shifts from "which 2 things should this unit do" to "how should this unit transform and route information." The relay player is designing a data pipeline, not picking abilities.

### Command (6 slots): "The Conductor"

Six slots is abundance — but not infinite abundance. A command unit with 6 hooks can monitor multiple channels, issue orders on multiple channels, manage its own context, and still have hooks left for exotic behaviors (ON_ALLY_ELIMINATED → reroute surviving units). The constraint is no longer "what can this unit do" but "what should this unit NOT react to."

The command unit's 6-slot economy mirrors a real engineering problem: a system with too many event handlers becomes unpredictable. The player must resist the urge to wire the command unit to everything and instead design focused, intentional reactive behavior. The empty slot on a command unit is a sign of disciplined engineering.

---

## Player Journeys

### Journey: Diego, 28, Software Developer who plays Factorio

**Context:** Mission 5, factory just unlocked. Diego has played through Missions 1-4 with pre-placed units and understands the basic vocabulary. He's now designing his first blueprints from scratch. He has 3 hook types available (ON_OBSERVE, ON_THREAT, ON_RECEIVE) and wants to build a scout-relay-striker pipeline.

**Minute 0:00 — The Empty Slots**
Diego opens the workbench. The blueprint editor for "Scout-01" shows two hook slots: dashed-outline rectangles stacked vertically on the right side of the blueprint card, each labeled "HOOK SLOT — EMPTY" in faded gray text. The slots look like empty sockets in a circuit board — inviting but finite. Above them, a small counter reads "0 / 2 hooks."

Diego drags ON_OBSERVE into the first slot. The dashed outline solidifies into a cyan-bordered box. Inside: a trigger icon (eye), an arrow, and a channel name field with a blinking cursor. He types "recon-net." The box fills in: `ON_OBSERVE → recon-net`. The counter updates: "1 / 2 hooks." The remaining empty slot pulses faintly, drawing the eye.

**Minute 0:45 — The Dilemma**
Diego hovers over the second slot. The hook palette on the left shows three options: ON_OBSERVE (already used — slightly dimmed but still available, meaning you can double up), ON_THREAT, ON_RECEIVE. He wants to wire ON_THREAT → `danger-net` for early warning. But he also wants ON_RECEIVE from `retreat-net` → evade, so the command structure can save scouts remotely.

He stares at the two options. The empty slot waits. He can only pick one. He thinks about Mission 4, where his scout got caught because it couldn't evade on command. But he also thinks about how strikers in Mission 3 couldn't engage because they didn't know threats were incoming until too late.

He picks ON_THREAT → `danger-net`. Offense over defense. The second slot fills in. The counter reads "2 / 2 hooks." Both slots are now solid cyan-bordered boxes. The blueprint card looks complete — no more invitations, no more dashed outlines. The scout's reactive identity is sealed: it observes and it warns.

**Minute 1:30 — The Relay Abundance**
Diego opens the relay blueprint. Four hook slots. His eyes widen slightly. After the scout's two-slot squeeze, four feels luxurious. He wires:

- Slot 1: ON_RECEIVE from `recon-net` → compress → `processed-intel`
- Slot 2: ON_RECEIVE from `danger-net` → amplify → `striker-orders`
- Slot 3: ON_RECEIVE from `command-net` → rebroadcast → `all-units`
- Slot 4: ...

He pauses at slot 4. Three channels already routed. He could add self-preservation (ON_CONTEXT_FULL → filter). Or he could add a fourth routing rule. He remembers the relay is stationary — it can't evade. If its context overloads, it stuns for a tick. That's one tick of no signal processing. He wires ON_CONTEXT_FULL → filter. Safety net.

The relay card now has four solid cyan boxes, each with different channel names color-coded. The visual density compared to the scout is immediate — this unit is a switchboard, that unit is a sensor.

**Minute 3:00 — The Second Blueprint Revelation**
Diego hits execute. His scouts push forward, observe enemies, broadcast on `recon-net`. The relay compresses and routes to strikers. It works — but the scouts in the rear, near the base, are broadcasting observations about tiles that are already cleared. Noise. Wasted signals. The relay's context window is filling with stale recon data.

After the battle (a close win), Diego goes to the inspector. He sees the relay's context window chart spiking to amber at tick 14 when all three scouts broadcast simultaneously. He realizes: the rear scouts don't need ON_OBSERVE → `recon-net`. They're not observing anything useful.

He goes back to plan phase and creates "Scout-Rear" — a second blueprint. Same unit type, different hooks: ON_RECEIVE from `command-net` → evade (takes orders), ON_THREAT → `danger-net` (only warns about things near the base). No observation broadcasting. Quieter, more disciplined.

The production queue now has two scout blueprints. Diego drags Scout-01 to positions 1 and 2 (front-line sensors), Scout-Rear to position 3 (base guard). The slot economy has taught him that not every unit of the same type should behave the same way.

**Minute 5:00 — The Aha Moment**
Diego stares at his two scout blueprints side by side. Scout-01: observe + warn. Scout-Rear: obey + warn. Same unit, different reactive identities, all because 2 slots forced a choice. He thinks: "This is like microservices. Same container, different config." He grins. The slot economy has made him an architect.

**UI Annotations:**
- Hook slot (empty): Dashed-outline rectangle, gray interior, "HOOK SLOT — EMPTY" text, faint pulse animation drawing the eye
- Hook slot (filled): Solid cyan border, trigger icon on left, arrow in center, channel name on right, channel name color-coded to match other references to same channel
- Hook counter: "N / M hooks" text above slot stack, turns amber at M-1, green at M
- Blueprint comparison: Side-by-side blueprint cards with hooks visible, visual density difference immediately communicates complexity difference
- Production queue: Blueprint icons in horizontal strip, drag to reorder, each icon shows tiny hook-count indicator (dots)

---

### Journey: Mei, 22, University Student, First Strategy Game

**Context:** Mission 2, learning hooks for the first time. The boot log has just introduced the concept of hooks. Mei has 2 pre-placed scouts and 1 pre-placed striker. The mission objective requires the scouts to detect enemies and the striker to respond. Mei needs to configure hooks to wire them together.

**Minute 0:00 — The Boot Log Introduction**
The terminal scrolls:

```
> SUBSYSTEM ONLINE: REACTIVE HOOKS v1.0
> Hooks are triggers. When something happens to a unit, it can broadcast a signal.
> Each unit has a limited number of hook slots.
> Your scouts have 2 slots each. Choose carefully — you can't wire everything.
> TIP: Start with one hook. See what happens. Add the second if you need it.
```

The last line pulses gently. Mei reads it twice. The workbench opens with Scout-A selected. Two empty hook slots, side by side like empty picture frames on a wall. A tooltip arrow points to the first slot: "Drag a trigger here."

**Minute 0:30 — First Hook, First Success**
The trigger palette shows two options (Mission 2 only unlocks ON_OBSERVE and ON_THREAT). Mei drags ON_OBSERVE into slot 1. The slot animates — the dashed outline draws itself solid with a soft "click" sound, like a component snapping into a circuit board. A channel name field appears. The tooltip says: "Name this channel. Other units can listen on it."

Mei types "eyes." The hook is complete: ON_OBSERVE → `eyes`. The counter reads "1 / 2 hooks." The second slot is still empty, still pulsing.

Mei doesn't fill the second slot. The boot log said "start with one hook." She trusts the tutorial. She switches to the striker and opens its hook config — but wait, the striker also has 2 hook slots. She wires ON_RECEIVE from `eyes` → engage. When the scout sees something, it broadcasts; when the striker hears the broadcast, it engages.

She hits execute. The scout spots an enemy at tick 3. A green flash — signal on `eyes`. The striker receives it at tick 4 (1-tick latency). At tick 5, the striker moves toward the enemy. At tick 6, adjacent — elimination. Red flash. Mei pumps her fist.

**Minute 2:00 — The Empty Slot Nags**
Mei won back, but one scout's second slot is still empty. And the striker has an empty slot too. She replays the battle in the inspector and notices: at tick 8, a second enemy appeared near Scout-A. Scout-A broadcast on `eyes` again. But the striker was already engaged with the first target. The second enemy walked right up to Scout-A at tick 10 and eliminated it.

The inspector's decision trace shows: Scout-A fired its hook. The striker received the signal but its rule priority said "continue current engagement." Scout-A had no second hook — no ON_THREAT → evade, no self-preservation. It stood there, broadcasting dutifully, and died.

**Minute 2:30 — The Lesson**
Mei goes back to plan. She fills Scout-A's second slot: ON_THREAT → evade. Now the scout broadcasts what it sees AND runs when threatened. Both slots full. Counter: "2 / 2 hooks." The scout's blueprint card shows two solid boxes — complete, sealed, no more room.

She looks at the striker's remaining empty slot. She could wire ON_THREAT → engage (attack when threatened directly), but the striker already engages based on scout reports. She could wire ON_RECEIVE from a second channel — but there's no second channel yet. She leaves it empty. The slot pulses faintly, a reminder that there's room to grow. But for now, one hook is enough.

She hits execute again. This time, Scout-A spots the second enemy at tick 8, broadcasts, AND evades at tick 9 when the enemy closes in. The scout survives. The striker finishes the first target and turns to the second. Clean win.

Mei learned two things: hooks wire units together, and the second slot is for self-preservation. The slot economy taught her that without the tutorial spelling it out.

**Minute 4:00 — The Curiosity**
After the win, Mei hovers over the striker's empty second slot. A tooltip reads: "You can wire another hook here. What else should this striker react to?" She thinks for a moment, then exits. She'll come back to it when she has a reason. The empty slot is an open question, not a failure.

**UI Annotations:**
- Tutorial tooltip: Arrow pointing to empty slot, pulsing at 0.5Hz, auto-dismisses when slot is filled
- Boot log tip: Final line of boot log section pulses in amber, stays visible for 10 seconds longer than other lines
- "1 / 2 hooks" counter: Large enough to read without squinting, positioned directly above slot stack
- Empty slot after filling first: Pulse intensity increases slightly, as if the card is "incomplete" — subtle visual pull without being annoying
- Channel name in hook: Player-typed text appears in a monospace font with cyan highlight, same color used wherever that channel name appears in the UI

---

### Journey: Kenji, 35, Competitive Gamer, Zachtronics Veteran

**Context:** Mission 8, full system unlocked. Kenji has all unit types, all skills, all hook triggers. He's facing a factory-vs-factory mission with aggressive enemy scouts flooding his network with noise. He needs to design a tight, efficient information architecture where every hook slot earns its keep.

**Minute 0:00 — The Audit**
Kenji opens his current blueprint set and counts hook slots:

- 3 Scout blueprints × 2 slots = 6 hook slots
- 2 Striker blueprints × 2 slots = 4 hook slots
- 2 Relay blueprints × 4 slots = 8 hook slots
- 1 Specialist blueprint × 2 slots = 2 hook slots
- 1 Command blueprint × 6 slots = 6 hook slots

Total: 26 hook slots across 9 blueprints. Each slot is a potential signal source. Each signal is a potential EM emission. He knows from Mission 7 that the enemy's hunter-killer scouts home in on EM noise — his relay got sniped because it was processing too many signals.

He opens a scratch pad (mental or otherwise) and categorizes his hooks:

- Sensing: 8 hooks (scouts observing, specialist scanning)
- Routing: 10 hooks (relays forwarding, command dispatching)
- Self-preservation: 5 hooks (context management, evasion triggers)
- Unused: 3 empty slots

Three empty slots. Two on strikers, one on a scout. Kenji considers: should he fill them or leave them empty to reduce EM noise?

**Minute 1:00 — The Efficiency Pass**
Kenji starts pruning. Scout-Bravo has ON_OBSERVE → `recon-net` and ON_THREAT → `danger-net`. But Scout-Bravo is assigned to patrol near the base — it rarely observes anything the front-line scouts haven't already reported. The ON_OBSERVE hook fires, sends duplicate data, fills relay buffers, generates EM noise, accomplishes nothing.

He removes ON_OBSERVE from Scout-Bravo. The filled slot animates in reverse — the solid border dissolves back into a dashed outline with a soft "unclick" sound. Counter: "1 / 2 hooks." Scout-Bravo is now a pure alarm unit: it only broadcasts when directly threatened.

The empty slot pulses. Kenji ignores it. The empty slot is intentional — it's noise reduction, not neglect.

**Minute 2:00 — The Command Unit Crunch**
Kenji opens his command blueprint. 6 slots. Currently wired:

1. ON_RECEIVE from `danger-net` → reassign nearest striker
2. ON_RECEIVE from `recon-net` → prioritize and filter → `processed-intel`
3. ON_RECEIVE from `resource-net` → reroute specialist to tagged node
4. ON_ALLY_ELIMINATED → reroute surviving units
5. ON_CONTEXT_FULL → filter (evict low-priority entries)
6. ON_TICK_SILENT on `danger-net` for 5 ticks → broadcast "all clear" on `status-net`

Six slots, all full. The command unit is a conductor — monitoring three channels, managing its own context, detecting silence, responding to losses. But Kenji wants to add a seventh behavior: ON_RECEIVE from `hack-report` → reroute specialist to hacked enemy position. The specialist's hack skill generates intelligence, but the command unit can't react to it — no slots left.

He stares at the 6 filled slots. Which one goes? Slot 5 (self-preservation) is essential — without it, the command unit stun-locks and the whole network goes dark. Slot 6 (silence detection) is his favorite — the "all clear" signal lets scouts switch from cautious to aggressive patrol. But it's the least immediately impactful.

He removes slot 6. The dashed outline returns. He wires ON_RECEIVE from `hack-report` → reroute specialist. The silence detection is gone. His scouts will never know when it's safe to be aggressive. The network loses a subtle, sophisticated behavior to gain a direct, utilitarian one.

Kenji feels the loss. The slot economy just forced him to trade elegance for efficiency. He makes a mental note: if he could have 7 hooks on the command unit, his architecture would sing. At 6, it merely works.

**Minute 4:00 — The Meta-Optimization**
Kenji realizes he can recover the silence detection without using a command slot. He creates a new relay blueprint — "Relay-Sentinel" — and uses one of its 4 hook slots for: ON_TICK_SILENT on `danger-net` for 5 ticks → broadcast "all clear" on `status-net`. The relay can do the same job. It costs a relay production slot in the factory queue and 5m resources, but it frees the command unit's hook slot for hack response.

The slot economy pushed Kenji from "what hooks should this unit have" to "which unit should own this behavior." The constraint didn't reduce his architecture — it distributed it differently. The network does the same things, but the responsibilities are allocated across different agents.

This is the deep lesson: hook slots are not just per-unit constraints. They're network-wide resource allocation problems. The total hook slot budget (26 in Kenji's case) is the true constraint. How you distribute those 26 slots across 9 blueprints determines the network's topology, resilience, and EM signature.

**Minute 6:00 — The Execution**
Kenji hits execute. His pruned network is tighter — fewer signals, lower EM, faster response. The enemy hunter-killers sweep the map but can't pinpoint his relay because it's not drowning in duplicate scout observations. The Relay-Sentinel detects silence on `danger-net` and broadcasts "all clear." Scouts shift to aggressive patrol. The specialist hacks an enemy unit; the command unit receives the report and reroutes the specialist to exploit the breach.

In the inspector afterward, Kenji checks the command unit's context window chart. It stayed in the green-to-amber range the entire battle — never hit red. The hack-report hook fired twice, each time producing a decisive specialist reposition. The silence-detection relay cost 5m but saved the command unit a hook slot that earned more value.

Kenji takes a screenshot. This is the architecture he'll iterate on for Missions 9 and 10.

**UI Annotations:**
- Hook removal animation: Solid border dissolves to dashed outline over 0.3s, soft "unclick" sound (reverse of the install sound), counter decrements
- Intentionally empty slot: Same pulsing as unintentionally empty, but if the player has explicitly removed a hook, a faint tooltip reads "Slot intentionally cleared" — acknowledging the design choice
- Command unit 6-slot layout: Two columns of 3 slots each, filling left-to-right top-to-bottom, channel names color-coded, visually denser than any other blueprint card
- Slot comparison across blueprints: When two blueprint cards are visible side by side, the hook slot count difference is immediately apparent — scout cards are visually "light," relay cards are "medium," command cards are "heavy"
- EM noise indicator: Small waveform icon on the blueprint card that grows busier as more hook slots are filled — visual feedback connecting slot usage to noise generation

---

## Strengths of Slot Scarcity as Design Pressure

1. **Forces identity decisions.** A 2-slot scout MUST be one thing — sensor, relay, or survivor. It can't be everything. This is character creation through constraint.

2. **Creates blueprint diversity naturally.** Slot pressure pushes players toward multiple blueprints per unit type, which creates richer production queue decisions.

3. **Makes the relay and command unit feel qualitatively different.** The jump from 2 → 4 → 6 slots isn't linear — it enables entirely new categories of behavior (signal routing, silence detection, multi-channel coordination).

4. **Throttles network noise organically.** More hooks = more signals = more EM = more vulnerability. Slot limits keep the noise budget manageable without a separate noise mechanic.

5. **Teaches real systems thinking.** The progression from "what should this unit do" to "which unit should own this behavior" mirrors real distributed systems architecture.

6. **Empty slots are a valid strategy.** Not filling a slot is a choice — noise reduction, EM discipline. The game respects the player who intentionally runs lean.

---

## Weaknesses and Risks

1. **2 slots might be TOO tight for scouts in late game.** By Mission 8, the trigger vocabulary is rich but scouts can still only use 2 triggers. This could feel like the unit type is left behind while relays and commands scale.

2. **Blueprint sprawl.** If slot pressure pushes players to create 4-5 blueprints per unit type, the workbench becomes cluttered and the production queue becomes overwhelming. There may need to be a blueprint limit (e.g., max 3 blueprints per unit type).

3. **Hook removal friction.** If removing a hook from a filled slot requires multiple clicks or confirmations, the iterative pruning that Kenji does becomes tedious. Must be as easy to remove as to install — single drag out or single click on an X icon.

4. **"Why can't I have one more?"** Six slots on a command unit is generous, but sufficiently creative players will always want N+1. If the answer is "upgrade your command unit" (via skill or tech tree), slot scarcity becomes solvable rather than permanent. The spec doesn't include hook slot upgrades — and shouldn't.

---

## Interaction Effects

### With Context Window Size
Hook slots and context window size are complementary constraints. A scout with 2 hook slots and a 6-slot context window is doubly constrained — limited reactive behaviors AND limited working memory. These constraints compound: fewer hooks mean fewer incoming signals, which partially compensates for the small context window. The slot economy and the buffer economy are naturally balanced.

### With EM Emissions
Every filled hook slot is a potential EM source. The slot economy directly feeds the emissions model — units with more hooks are louder. This creates a design tension: the command unit (6 hooks, stationary, no perception) is the loudest unit on the field despite being the most protected. Its EM signature makes it a high-value target that enemy scouts can home in on.

### With Channel Architecture
Each hook connects to a channel. With 26 total hook slots in a typical army, the channel map has at most 26 edges. Slot scarcity keeps the channel graph manageable — you can't have a 50-channel spaghetti network if you only have 26 hooks to wire. The slot economy is an implicit channel complexity limiter.

### With Production Economy
Creating multiple blueprints per unit type (to work around slot constraints) increases production queue complexity and resource planning difficulty. The slot economy influences the production economy: tighter hooks → more blueprints → more complex production → higher cognitive load in the factory phase.

---

## Comparable Games

**Slay the Spire — Deck Size as Constraint:** Slay the Spire doesn't hard-limit deck size, but experienced players know that a 15-card deck is often stronger than a 30-card deck. The "skip" button at card rewards is the advanced move. Robot Uprising's empty hook slot is the equivalent of Slay the Spire's "skip" — the choice to NOT add more is the expert choice. The difference: Robot Uprising's constraint is hard (2 slots, period) while Slay the Spire's is soft (add as many as you want, but dilution is the cost).

**Into the Breach — Weapon Slots:** Each mech has 2 weapon slots. You can find new weapons, but installing one means removing another. The agonizing "should I swap my reliable Push for this situational Freeze?" decision is exactly the hook slot economy. Into the Breach proves that 2 slots creates meaningful identity for each unit.

**Gladiabots — Behavior Slot Limits:** Gladiabots limits the number of decision nodes per bot, creating similar pressure. Players must decide which behaviors to include in a finite behavior tree. The competitive meta revolves around efficient use of node budgets — mirroring the hook slot economy.

**XCOM — Equipment Slots:** Soldiers have limited inventory slots. Choosing between a medikit and a grenade defines the soldier's battlefield role. The slot constraint IS the character build system.

---

## Sensory Description

**The Empty Slot:** A rounded rectangle with a dashed border in muted gray-blue. The dashes animate slowly — a gentle clockwise rotation like a loading spinner that never loads. Inside, the text "HOOK" in thin uppercase letters, barely visible. When hovered, the rectangle brightens to a lighter blue and the text sharpens. It's an invitation, not a demand.

**The Filled Slot:** The dashed border snaps to a solid line in cyan. The interior fills with a dark panel showing the trigger icon on the left (a small stylized symbol — eye, skull, inbox, gear), a right-pointing arrow in the center, and the channel name on the right in monospace cyan text. A tiny waveform icon in the bottom-right corner subtly pulses — representing the EM noise this hook will generate. The whole slot has a faint inner glow, like a circuit that's now energized.

**The Full Card:** When all slots are filled, the blueprint card's background shifts from near-black to a very dark cyan tint. The hook counter text changes from white to green: "2 / 2 hooks — COMPLETE." A subtle hum-like sound effect plays — the circuit is closed. There's a satisfying density to a full card versus an empty one. A scout card with 2 filled slots looks minimal, elegant, purposeful. A command card with 6 filled slots looks dense, complex, powerful — every slot a different color-coded channel, the card practically vibrating with reactive potential.

**The Removal:** Dragging a hook out of its slot reverses the fill animation. The solid border dissolves to dashes. The interior fades. A soft descending tone plays — not a punishment sound, but an "undoing" sound, like peeling tape. The slot returns to its inviting empty state. The hook counter decrements. If this was an intentional removal (the player already had a hook there), a tiny "intentional" tag appears next to the empty slot for 3 seconds, then fades. The game acknowledges the choice.

**The Slot Count Gradient:** Viewing all blueprint cards together, the visual weight difference is striking. Scout cards are light — two small slots, lots of negative space. Relay cards are medium — four slots arranged in a 2x2 grid, moderate density. Command cards are heavy — six slots in a 2x3 grid, visually busy, the card practically a dashboard. You can read the army's information architecture from the visual weight of its blueprint cards alone.

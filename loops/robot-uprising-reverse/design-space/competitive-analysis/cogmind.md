# Competitive Analysis: Cogmind

**Category:** Sci-Fi Tactical Roguelike / Part-Swapping Robot Builder
**Developer:** Grid Sage Games (Josh Ge / Kyzrati)
**Released:** October 2017 (Steam Early Access); development since 2012 7DRL prototype, full-time since 2013
**Platform:** PC (Windows), Steam
**Price:** $19.99
**Reception:** Overwhelmingly Positive on Steam — 96/100 score from ~1,830 reviews (95% positive lifetime). Estimated 50,000–100,000 owners. Peak concurrent players ~201; typical concurrent ~19–25. A deeply beloved niche title with exceptional review-to-ownership ratio.
**Dev trajectory:** 13+ years of continuous solo development. No DLC — all new content added to the core game. Still in "Early Access" technically, but considered a complete game with 20+ map types, 1000+ items, 10 endings, thousands of lines of dialogue. One of the longest-running active roguelike development projects.

---

## What It Is

Cogmind is the purest expression of the "you are what you equip" design philosophy. You are a robot core — naked, vulnerable, undefined — and every part you attach transforms what you can do, how you move, how you fight, how you hide. You're not a character with equipment. You're a chassis defined entirely by its loadout.

The fundamental premise: **identity is emergent from configuration.** You don't choose a class. You assemble one from salvage. And because 43.5% of all equipped parts are destroyed before being voluntarily removed, you are constantly re-assembling yourself. Your build is not a permanent decision — it's a rolling conversation with the environment about what you need *right now*.

This is the closest any existing game comes to Robot Uprising's blueprint editor philosophy: **your capabilities are your configuration, and your configuration is the game.**

---

## Core Loop

### Every Turn (time-energy system, ~1–3 seconds)

Cogmind uses a time-energy turn system: every actor gets 100 time units per game turn, and actions cost varying amounts. Faster propulsion = more actions per round. The player's fundamental per-turn decision is: **move, fight, interact, or wait?**

Each turn, the player:
- Reads the immediate environment (ASCII tiles, nearby robots, terrain features)
- Decides whether to engage, evade, or investigate
- Manages the constant tension between *action* (fight, hack, sabotage) and *stealth* (cloak, avoid detection, stay under the alert radar)

**The information load per turn is enormous.** Cogmind's default UI is a 160×60 terminal grid — one of the largest in any roguelike — displaying simultaneously: the map, full inventory (up to 26 slots), nearby robot details, message log, status bars, and contextual panels. An experienced player reads all of this in a glance. A novice drowns.

### Every Room/Floor (~5–15 minutes)

A floor in Cogmind is a procedurally generated network of corridors and rooms containing robots, machines, stockpiles, and terminals. Each floor, the player:
- Navigates toward exits while managing alert level
- Salvages parts from stockpiles or destroyed robots
- Hacks terminals for intel (exit locations, squad positions, machine locations, alert level)
- Evolves their core (gaining more slots as they progress)
- Chooses a build identity: combat tank, stealth assassin, hacker, flight specialist, or hybrid

The floor-level loop is a **resource management puzzle**: parts degrade, energy depletes, alert level rises. Every action has a cost measured in detection risk. The safest path is not always the most rewarding.

### Every Run (~30 minutes to 3+ hours)

A full Cogmind run traverses multiple floors from the underground complex to the surface, with branching paths to secret areas. The run-level decisions are:
- **Build trajectory:** Early salvage shapes your mid-game identity, which constrains your late-game options
- **Route selection:** Main path (direct, dangerous) vs. branch paths (secret areas with unique rewards and lore)
- **Alert management:** Aggressive players trigger waves of combat squads; stealthy players avoid them entirely
- **Knowledge accumulation:** Terminal hacking builds an intel database that persists for the floor — machine locations, squad positions, hidden exits

### Replayability: What Brings Players Back

- **Build variety:** 1000+ parts across 4 categories means every run creates a unique robot identity. "Last run I was a flying sniper; this run I'll be a wall-busting melee hacker."
- **Route discovery:** 20+ map types with secrets that take dozens of runs to fully explore.
- **10 endings:** Multiple victory conditions discovered through experimentation and lore.
- **Special modes:** Polymind (possess other robots instead of equipping parts), challenge modes with specific constraints.
- **The attrition loop:** Because parts break constantly, you're never "done" building. The build is alive, adapting, degrading, rebuilding. There is no final form.

---

## The Part-Swapping System in Detail

### Four Slot Categories

Every part fits one of four categories:

| Category | Purpose | Robot Uprising Parallel |
|----------|---------|----------------------|
| **Power** | Engines, reactors — energy generation | N/A (energy is passive income in RU) |
| **Propulsion** | Legs, treads, hover, flight — movement speed and type | Unit speed stat (fixed per type) |
| **Utilities** | Sensors, cloaks, hackware, shields, storage | **Skills** (what the agent can do) |
| **Weapons** | Guns, cannons, melee, launchers | Striker's engage/breach skills |

### Slot Scaling

The player starts with **7 slots** (1 power, 2 propulsion, 2 utility, 2 weapon) and can evolve to **26 slots**. The evolution choice — which slot types to add — is a permanent strategic decision. Most veterans recommend propulsion and utility, taking weapons and power only when needed.

**Robot Uprising parallel:** Blueprint slot limits (skill slots, hook slots, rule slots) serve the same design function — constraint forcing meaningful choice. But Robot Uprising's slots are *per-blueprint*, not per-player, creating a more modular architecture.

### Parts as Ablative Armor

Every attached part absorbs damage. When a part takes enough hits, it's destroyed — ripped off the chassis. This means your weapons and utilities are also your health pool. Losing a critical utility mid-fight can cascade: lose your sensor array → lose enemy tracking → get flanked → lose propulsion → can't escape → lose everything.

**This is Cogmind's most emotionally resonant mechanic.** Your build degrades visibly, part by part. You watch your carefully assembled configuration disintegrate under fire, then frantically rebuild from whatever's available. The feeling is *visceral attachment followed by visceral loss*.

**Robot Uprising parallel:** One-shot-one-kill creates a similar but more binary emotional arc — units are either alive and fully functional or dead. Cogmind's gradual degradation might inform a "damage to context window" mechanic: hits could reduce buffer size, forcing the unit to forget, getting dumber as it takes damage. (This would need careful balance against the clean simplicity of one-shot-one-kill.)

### Inventory Scarcity

Base inventory is only **4 slots** — expandable by equipping storage modules, which consume utility slots. This creates a cascading trade-off: carrying spare parts means fewer active capabilities. Veterans learn to travel light, relying on environmental salvage rather than hoarding.

### Attachment Cost

Equipping a part costs **matter** — a semi-finite resource gained by scrapping robots or finding caches. This prevents infinite swapping and forces commitment to builds. You can't try everything; you have to make bets.

---

## Information Warfare: Cogmind's Deepest System

Cogmind's information warfare mechanics are the most directly transferable system to Robot Uprising's design. The game treats knowledge itself as a contestable resource with multiple acquisition methods, degradation mechanics, and counter-intelligence.

### The Intel Database

Hacking terminals populates a persistent (per-floor) intel database:
- **Machine locations:** Capital letter markers with color-coded backgrounds, visible on the map. Unlike other intel, machine markers persist permanently (machines don't move).
- **Squad positions:** Lowercase letter markers at last-known positions. Color-coded by threat: green/yellow for low-danger, orange for common threats, red for major threats. **These are stale the moment you see them** — squads move after being located.
- **Stockpile contents:** Punctuation markers colored by item type. Shows approximate, not exact, inventories.

**Robot Uprising parallel:** This is almost exactly what Robot Uprising's scout and specialist units do — gather positional intelligence that other units act on. The staleness mechanic (squad markers becoming outdated as squads move) maps perfectly to Robot Uprising's signal latency: a scout's observation is 2+ ticks old by the time a striker receives it through a relay chain.

### The Multi-Console Filter

Players toggle intel visibility with a hotkey, choosing which intel categories to display. Off-screen markers reposition to map edges, functioning like a minimap's edge indicators.

**Robot Uprising parallel:** The Inspector's event log and channel metrics serve a similar "filtered intel view" function, but during post-battle analysis rather than during live play.

### System Corruption

Electromagnetic damage corrupts the player's information systems:
- Sensor arrays start reporting **false signals**
- Previously explored map areas become **unknown again**
- Intel markers degrade or disappear

This creates a mid-to-late game information warfare dimension: EM-weapon enemies don't just damage your parts — they damage your *knowledge*. You become lost in areas you previously mapped. Your sensors lie to you.

**Robot Uprising parallel:** This maps directly to the "enemy flooding noise to force stun-locks" mechanic. In both games, the adversary attacks your information processing capacity, not just your physical assets. Cogmind's corruption is gradual; Robot Uprising's context overload is binary (stun or not). Both create the same emotional beat: "I can't trust what I'm seeing."

### Terminal Hacking as Information Action

Hacking isn't passive — it's a risk/reward verb:
- **Standard hacks** reveal information at low detection risk
- **Brute force hacks** guarantee success but permanently lock the terminal and attract attention
- **Trojans** are persistent hacks that provide ongoing benefits:
  - *Botnet*: Boosts hacking at all other terminals on the floor (stacking with diminishing returns)
  - *Track*: Continuously reveals robot positions in a zone around the terminal
  - *Assimilate*: Converts the next enemy robot that uses the terminal into an ally
- **Sabotage** remotely detonates machines, disrupting enemy patrols but raising alert

**Robot Uprising parallel:** The specialist unit's hack and extract skills map to this system. The Trojan mechanic — persistent infrastructure that provides ongoing intelligence — maps to how relay networks function in Robot Uprising: not one-off information gathering, but persistent information infrastructure.

---

## UI Design Philosophy: Dynamic Depth

Kyzrati's design philosophy, articulated across years of dev blog posts, centers on **dynamic depth**: the game presents different amounts of complexity depending on how deeply you engage.

### Surface Layer (15-minute casual run)
"Jump in and spend 15 minutes shooting up robots without worrying about all the details — just attach the highest-rated parts you find."

### Middle Layer (informed decisions)
Examine part stats, choose builds with purpose, hack terminals for intel, plan routes to exits.

### Deep Layer (mastery)
Exploit faction AI behavior, chain trojans across terminals, manage alert level through precisely timed sabotage, build toward specific endings through obscure quest triggers.

### UI-First Feature Design
"Gameplay features always take a back seat to UI/UX concerns." New mechanics must integrate into the existing interface framework. If a feature requires a new panel that adds cognitive load, it's redesigned to fit existing patterns.

**Robot Uprising parallel:** This maps directly to the three-screen loop design. The Plan screen (surface: drag parts into slots), Sealed Watch (middle: observe your system under pressure), and Inspector (deep: trace decision chains and diagnose failures) create the same dynamic depth gradient. The lesson from Cogmind: **never require the deep layer to enjoy the surface layer.**

### Content Interconnection
"Hook into as many other existing elements as feasible." Every new feature should interact with existing systems, creating emergent complexity without adding isolated mechanics.

**Robot Uprising parallel:** This is the core hook/channel philosophy — every primitive interacts with every other. A new skill doesn't just do one thing; it's a new node in the interaction graph.

---

## What Translates Directly to Robot Uprising

### 1. Configuration-as-Identity (Strong Translation)
Cogmind's "you are what you equip" principle is Robot Uprising's "your agents are their blueprints." Both games make configuration the primary expression of player skill and creativity. The loadout IS the character.

### 2. Part Attrition → Blueprint Pressure (Partial Translation)
Cogmind's constant part destruction forces adaptive rebuilding. Robot Uprising achieves similar dynamism through unit death (one-shot-one-kill) plus factory respawning. The emotional arc differs: Cogmind's degradation is gradual and personal (YOUR chassis losing parts); Robot Uprising's is sharp and systemic (units dying, but the factory produces replacements with the same blueprint).

### 3. Information as Contested Resource (Strong Translation)
Cogmind's terminal hacking → intel database → staleness → corruption chain maps almost exactly to Robot Uprising's scout → relay → signal latency → context overload chain. Both games make the player's information architecture as strategically important as their combat architecture.

### 4. Alert Level as Escalation Mechanic (Moderate Translation)
Cogmind's global alert level (rising from combat, lowered through hacking) creates a macro-pacing mechanic. Robot Uprising's EM emissions model serves a similar function: more communication = more detection risk. In both games, being smarter and louder are in tension.

### 5. Dynamic Depth Through UI Layering (Strong Translation)
Cogmind's surface/middle/deep layers and Robot Uprising's Plan/Watch/Inspect screens solve the same problem: how to make a complex system approachable without dumbing it down. Both use spatial separation (different panels, different screens) to create opt-in complexity.

### 6. Stealth as Information Asymmetry (Strong Translation)
Cogmind's stealth builds exploit the gap between player knowledge and enemy knowledge. Robot Uprising's emissions model + signal architecture creates the same dynamic: a quiet network is harder to detect but slower to respond; a loud network is fast but visible.

---

## What Doesn't Translate

### 1. Solo Protagonist vs. Multi-Agent System
Cogmind is a single-entity game. YOU are one robot, managing one inventory, making one decision per turn. Robot Uprising is about designing systems of agents that act autonomously. The cognitive task is fundamentally different: Cogmind asks "what should I do right now?" Robot Uprising asks "what system should I build that handles situations I haven't seen yet?"

### 2. Real-Time Part Swapping vs. Pre-Deployment Configuration
Cogmind's part swapping is continuous — you adapt mid-run. Robot Uprising's blueprint editing is pre-deployment. This creates a different emotional rhythm: Cogmind is improvisational jazz (adapt to what's available); Robot Uprising is architectural planning (design for robustness before execution).

### 3. Procedural Variation vs. Designed Missions
Cogmind's floors are procedurally generated — the same strategy never works exactly the same twice. Robot Uprising's 10 missions are designed (though invisibly randomized). The "hidden randomization" mechanic bridges this gap, but Robot Uprising missions feel more like puzzles and less like survival runs.

### 4. Information Density
Cogmind's 160×60 terminal grid with 26+ simultaneous inventory slots represents the extreme end of information density in games. Robot Uprising deliberately constrains visible information through the three-screen loop and the sealed watch's no-tools rule. Cogmind trusts the player to manage high-density information; Robot Uprising curates information access as a design tool.

---

## Specific Mechanics Worth Stealing

### The Salvage Loop as Blueprint Iteration Prompt
In Cogmind, destroying an enemy robot scatters its parts on the ground. You see exactly what it was made of. This creates a natural learning moment: "Oh, that robot that destroyed me had a cloaking device — I want one."

**Translation:** When a player unit dies in Robot Uprising, the Inspector could show not just *what* killed it, but *what the enemy's blueprint looked like* — revealing the enemy's skill, rule, and hook configuration. "That enemy striker had a hook I've never seen. I want to figure out how to build that."

### The Botnet Trojan as Network Effect Teaching Tool
Cogmind's Botnet Trojan (hacking one terminal makes all terminals easier to hack) teaches the concept of infrastructure compounding — investment in one node benefits all nodes.

**Translation:** In Robot Uprising, a relay network exhibits the same property: adding one relay to a well-designed channel architecture benefits all units listening on that channel. The game could make this more visible by showing "network effect" indicators when relay placement crosses a coverage threshold.

### System Corruption as Information Degradation
Cogmind's EM corruption mechanic — previously explored areas becoming unknown, sensors reporting false signals — is one of the most emotionally powerful information warfare mechanics in any game.

**Translation:** An advanced enemy type in Robot Uprising could "corrupt" relay units, causing them to occasionally inject false signals into channels. The scout reports the enemy at B4, but a corrupted relay changes it to B7. The striker goes to the wrong square. The player must diagnose the corruption through the Inspector's signal genealogy. This is literally debugging a production system with a compromised dependency.

---

## Player Journeys

### Journey: Marcus, 34, Software Architect, 200+ hours in Cogmind

**Context:** Marcus has played Cogmind extensively and is trying Robot Uprising for the first time, Mission 1.

**Minute 0:00 — The Plan Screen**
Marcus sees the workbench and immediately recognizes the slot-limit pattern. "Oh, this is like Cogmind's utility slots — I can't equip everything." He hovers over a scout blueprint. Three skill slots, two visible, one empty with a dashed outline. He drags "patrol" into the first slot. The animated tooltip fires — a 3-tick micro-scenario showing a scout moving across the board preview, perception radius sweeping tiles. Marcus grins. "That's like Cogmind's sensor array, but I'm configuring it instead of finding it."

**Minute 0:45 — The Rules**
He opens the rules editor. Ordered condition→action pairs. "Drag to reorder priority." Marcus's eyes light up. "This is Cogmind's AI behavior trees, but I'm writing them for my agents instead of the dev writing them for NPCs." He writes: IF enemy_visible THEN move_toward. IF no_enemy THEN patrol. He instinctively wants to add more rules but only has 3 slots. "Same tension as Cogmind — not enough slots for everything I want."

**Minute 2:00 — Sealed Watch, First Contact**
Marcus hits EXECUTE. The sealed watch begins. His scout moves across the 8×8 board. Tick clock advances. A scout spots an enemy — cell flashes green (signal delivery). The scout's context bar at the bottom of its tile fills one pip. Marcus watches intently. "This is like watching my Cogmind bot navigate a floor, except I can't intervene." The striker receives the signal two ticks later and moves toward the enemy. Marcus notices the latency. "Two-tick delay. That's like Cogmind's sensor range — information has a cost in time, not just in slots."

**Minute 3:30 — The One-Shot Kill**
The striker reaches the enemy. Adjacent tile. Red flash. Enemy eliminated. Marcus exhales. But then a second enemy appears behind the scout. No relay between them — the striker doesn't know. The scout's context fills up as it processes the new threat, but there's no rule to retreat. Next tick: enemy adjacent. Red flash. Scout eliminated. Marcus winces. "In Cogmind I would have attached an escape propulsion. Here I needed an evade rule but didn't have the slot."

**Minute 4:00 — Inspector**
The Inspector opens. Marcus clicks the dead scout. Decision trace: Tick 5, rule evaluated: IF enemy_visible → move_toward. "It moved toward the FIRST enemy it saw, not the closest. I need a better condition." He sees the context window state: both enemies were in the buffer, but the rule didn't distinguish between them. "This is exactly like debugging a Cogmind bot's AI priority system, except it's MY priority system." He immediately wants to rebuild.

**Resolution:** Marcus starts Mission 1 again within 30 seconds. His Cogmind instincts — configuration as identity, information as resource, slot scarcity as design tension — translate directly. The difference: in Cogmind, he adapts mid-run. Here, he designs up front and learns from failure. He finds this MORE satisfying because the system is his design, not his reaction.

---

### Journey: Lily, 22, Art Student, Zero Roguelike Experience

**Context:** Lily has never played Cogmind or any roguelike. She's seen Robot Uprising on a friend's TikTok — a clip of signal chains lighting up across a battlefield. She's on Mission 2, having fumbled through Mission 1 with a premade configuration.

**Minute 0:00 — "What Am I Looking At?"**
Lily opens the Plan screen. She sees the blueprint editor with three scouts and one striker. The boot log text reads: "CONTEXT SUBSYSTEM ONLINE. Your agents remember what they see — but memory is finite. Fill the window, lose a tick." She reads it, half-understanding. She hovers over the scout's context config panel. The animated tooltip shows a 6-slot context window filling up, then flashing red, then the unit jittering for one tick. "Oh — it's like their brain gets full and they freeze."

**Minute 1:00 — First Configuration Decision**
The boot log introduces the listen/ignore toggle. "Agent SCOUT-A is receiving signals on channel 'threat'. Toggle to filter." Lily sees a toggle switch next to the channel name. She turns it off for one scout ("the quiet one") and leaves it on for another. She doesn't fully understand why, but the interface makes the action obvious. Drag a toggle. Watch the tooltip show the consequence.

**Minute 2:30 — Sealed Watch**
She hits EXECUTE. Two scouts patrol. The "noisy" scout receives a signal from the striker (they share a channel) and its context bar fills a pip. The "quiet" scout doesn't. Lily watches both scouts encounter enemies. The noisy scout reacts — its context had information about the striker's position, and its rule fires: IF ally_nearby AND enemy_visible THEN signal_threat. The quiet scout sees the enemy but has no such rule context — it just runs its patrol pattern and walks into danger.

**Minute 3:45 — The Aha Moment**
The quiet scout dies. The noisy scout survives because the striker came to help (drawn by the signal). Lily stares. "Wait. The quiet one died because it was too quiet. It couldn't tell anyone it was in trouble." She opens the Inspector. Clicks the dead scout. Context window at time of death: 2 of 6 slots filled, all local observations, no signals sent or received. She clicks the surviving scout: 5 of 6 slots filled, including signals received on 'threat' and signals sent. "The one with more stuff in its brain survived because it could talk to the team."

**Resolution:** Lily doesn't understand context windows in engineering terms. She understands them in social terms: "the robot that could communicate survived." She replays Mission 2 with all scouts listening on the same channel. She's learning information architecture without knowing the phrase.

---

### Journey: Kyzrati (hypothetical), 40s, Cogmind Developer, Expert Game Designer

**Context:** The Cogmind developer plays Robot Uprising for analysis. He's on Mission 6 — factory introduced.

**Minute 0:00 — Production Queue Analysis**
Kyzrati sees the conveyor belt production queue. "This is the build order problem. In Cogmind, build order is implicit — you attach what you find. Here it's explicit." He drags blueprint icons: relay first (infrastructure), then scouts (intelligence), then strikers (force). He notes the resource cost preview. "Matter cost in Cogmind, mineral cost here. Same scarcity function."

**Minute 1:30 — Channel Architecture**
He opens hook configuration for a scout. Types "threat-net" as a channel name. The channel map panel populates automatically. He notices: "No channel editor. Channels emerge from usage. This is Cogmind's faction system inverted — in Cogmind, factions are designer-defined and player-observed. Here, channels are player-defined and system-observed." He wires three scouts to 'threat-net', two relays to 'threat-net' and 'position-update', one command to all channels.

**Minute 3:00 — The Meta-Level**
Kyzrati adds rules to the command agent: IF unit_count(scout) < 2 THEN queue(scout). IF unit_count(relay) < 1 THEN queue(relay, priority=HIGH). He pauses. "This is building the factory that builds the factory. In Cogmind, the player IS the factory — manual part attachment. Here, you automate the factory itself." He realizes this is the key differentiator: Cogmind's depth comes from moment-to-moment adaptation; Robot Uprising's depth comes from pre-deployment system design that handles situations autonomously.

**Minute 5:00 — Sealed Watch**
He hits EXECUTE. The conveyor belt starts. First relay deploys. Then scouts. Signal chains light up as scouts patrol and report. A scout dies — the command agent's rule fires: queue another scout. The conveyor belt shifts. New scout deploys 3 ticks later. The network self-heals. Kyzrati leans forward. "In Cogmind, when I lose a sensor, I manually attach a new one. Here, the system replaces it without me. I'm watching my design work." He sees the parallel to his own Polymind mode — designing a system that operates without direct intervention.

**Minute 8:00 — Inspector Deep Dive**
After the match, he scrubs the Inspector timeline. He finds a 4-tick window where all scouts were dead simultaneously — the "blind spot." The command agent queued replacements, but factory production took time. He realizes: "This is the same vulnerability as Cogmind's part attrition — you can have the right parts available but the transition window is dangerous. In Cogmind, you're naked between destroying a broken part and attaching the replacement. Here, the network is blind between a scout dying and the replacement deploying." He redesigns the production queue to maintain overlap: always queue a scout BEFORE the last one dies.

**Resolution:** Kyzrati writes a blog post titled "Robot Uprising is Cogmind's Information Architecture Pulled Out of One Robot and Distributed Across Many." He notes that the two games are exploring the same design space from opposite ends: Cogmind puts all configuration in one entity adapting in real-time; Robot Uprising distributes configuration across many entities designed in advance.

---

## Sensory Description

### Cogmind's Sensory Identity (for comparison)

**Visual:** ASCII art at maximum density. Green phosphor terminal aesthetic. Every item has a custom CP437 character art portrait. Particle effects rendered as terminal characters — explosions are cascading ASCII symbols. The map scrolls smoothly despite being grid-based. Destroyed robots scatter parts as visible colored glyphs on the floor. The overall feeling is *watching a system through a terminal interface* — you're reading the world, not seeing it.

**Audio:** Over 1,000 sound effects. Ambient soundscaping where objects emit contextual sounds based on distance — factory machines hum, patrols march, combat pops and cracks. Volume scales with distance. The audio is functional: experienced players identify threats by sound before seeing them. Audio is *intelligence*, not atmosphere.

**Feel:** The turn-based rhythm creates a meditation-like flow state. Action → read → think → action. No time pressure between turns. The part attrition creates constant low-level anxiety ("is my build holding?") punctuated by spikes of loss ("there goes my best weapon"). The overall emotional register is **quiet competence occasionally punctured by crisis**.

### What Robot Uprising Should Learn

Robot Uprising's sealed watch needs to deliver the same "watching a system I built" satisfaction that Cogmind's ASCII particle effects and spatial audio provide. The key difference: Cogmind's satisfaction comes from *personal* survival (I survived!); Robot Uprising's must come from *systemic* survival (my design survived!). The signal chain visualizations — colored dashed lines lighting up between units — need to deliver the same "I built this" payoff as watching a Cogmind build navigate a hostile floor.

**The TikTok clip:** A Cogmind veteran watching their first Robot Uprising factory replacement cycle — a scout dies, the conveyor belt shifts, a new scout deploys, signal chains reconnect, the network self-heals. The veteran's face, lit by monitor glow, shifts from grief to recognition to pride. "I didn't build a robot. I built the immune system."

---

## Comparable Patterns Across Games

| Design Pattern | Cogmind | Robot Uprising |
|---------------|---------|---------------|
| Configuration-as-identity | Part loadout defines capabilities | Blueprint defines agent behavior |
| Slot scarcity | 7→26 equipment slots, never enough | Skill/hook/rule slot hard limits |
| Ablative systems | Parts absorb damage, degrade, break | Units die (one-shot), factory replaces |
| Information warfare | Terminal hacking, sensor arrays, intel DB | Scout perception, relay chains, signal latency |
| Noise-vs-stealth | Alert level rises with combat | EM emissions increase with communication depth |
| System corruption | EM damage degrades intel, sensors lie | Context overload stuns, enemy noise floods |
| Build-time vs. runtime | Attach parts during exploration (runtime) | Configure blueprints before EXECUTE (build-time) |
| UI information density | 160×60 grid, everything visible | Three-screen loop, curated information per phase |
| Dynamic depth | Casual → informed → mastery layers | Plan (surface) → Watch (feel) → Inspect (understand) |

---

## New Aspects Discovered

1. **1.20a — The "salvage reveal" mechanic as enemy blueprint inspection**: When a Robot Uprising unit dies, should the Inspector reveal the enemy unit's full configuration (skills, rules, hooks, context state) as a "salvage" mechanic? Cogmind scatters destroyed robot parts visually; Robot Uprising could scatter destroyed robot *configurations* informationally. The "looting knowledge from the dead" pattern.

2. **1.20b — Gradual degradation vs. binary death**: Cogmind's part-by-part degradation creates a rich mid-state between "fully functional" and "dead." Should Robot Uprising explore a "damaged" state where units lose context slots (not just stun, but permanent capacity reduction) from near-misses or EM attacks? The "wounded but functional" design space between one-shot-one-kill and HP bars.

3. **1.20c — The "naked core" recovery moment**: Cogmind's most iconic moment is being stripped to a bare core and rebuilding from environmental salvage. What's Robot Uprising's equivalent? The "factory destroyed, one scout surviving, must rebuild everything from scratch" moment. Does the game have a mechanic for this, or does losing the factory mean immediate defeat?

4. **1.20d — Audio-as-intelligence**: Cogmind players identify threats by sound before seeing them (spatial audio, distance-based volume). Should Robot Uprising's sealed watch include audio signals that experienced players learn to decode? Signal chain sounds whose pitch/pattern indicates network health? A hum that changes when a relay goes down?

5. **1.20e — The Polymind inversion as Robot Uprising variant mode**: Cogmind's Polymind mode (possess other robots instead of equipping parts) is the exact inverse of Robot Uprising's normal mode. A Robot Uprising variant where you directly control one unit while the rest run autonomously — the "field commander" mode. This tests whether the player's blueprints work without intervention, with the player handling only the edge cases.

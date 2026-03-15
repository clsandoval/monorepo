# 1.13 — StarCraft: Brood War

## Information Warfare, Scouting, Fog of War, Macro/Micro Split

### Why This Game Matters

The Robot Uprising spec literally says: *"When you do agentic AI engineering — building ralph loops, wiring autonomous agents, tuning context and feedback — it feels like playing StarCraft."* Brood War is the **emotional north star** for the entire project. Understanding exactly what makes Brood War feel the way it does — and precisely how Robot Uprising translates (and inverts) that feeling — is foundational.

StarCraft: Brood War (1998, Blizzard Entertainment) is the most important competitive RTS ever made. 11M+ copies sold. Over $7.5M in prize money awarded across 542+ tournaments. Professional leagues broadcast on Korean television to millions. A competitive scene still active 28 years after release. Metacritic 88. The game that proved competitive gaming could be a spectator sport, a career, and a cultural phenomenon.

---

## Core Loop Analysis

### Every 2-5 Seconds (Micro-Actions)
The player's hands are never still. Select a unit group. Issue a move command. Tap back to base to queue a unit. Check the minimap. Glance at supply count. Select workers. Assign them to gas. Back to the army. Select a spellcaster. Cast feedback on a high-value target. Every 2-5 seconds, a different sub-task demands attention. The game is a continuous stream of interrupted micro-decisions, each taking 1-3 seconds to execute.

The screen shows: an isometric battlefield (top 75% of screen), minimap (bottom-left ~15%), unit info wireframe panel (bottom-center), command card (bottom-right), resources/supply (top-right). The player's eyes dart between the main view and the minimap constantly — the minimap is peripheral vision for the entire game world.

### Every 30-60 Seconds (Tactical Cycles)
A complete tactical cycle: check production (are all buildings working?), check supply (approaching cap?), check army positioning (where should my units be right now?), check opponent intel (what do I know about their composition and position?), make one strategic micro-decision (expand? tech up? attack? defend?). Professional players execute 300-400+ APM (actions per minute) to keep all these plates spinning.

### Every 3-5 Minutes (Strategic Phases)
Games progress through distinct phases: **opening** (first 3 minutes — build order execution, initial scouting), **early game** (3-7 min — tech choices committed, first skirmishes), **mid game** (7-15 min — army composition decisions, expansion timing, map control), **late game** (15+ min — maxed armies, decisive engagements, attrition). Each phase has different information needs and different attention allocation between macro and micro.

### Every 15-30 Minutes (Match Arc)
A complete game. The emotional arc: tension of the unknown opening → first scout information rush → settling into a plan → the anxiety of enemy movement → the peak of a decisive battle → the aftermath (snowball or collapse). The "one more game" pull comes from: each game ends with the player knowing exactly what they would do differently next time.

---

## The Information Warfare System

### Fog of War: The Foundational Mechanic

Brood War's fog of war operates on two layers:
1. **Unexplored terrain** — completely black, never seen. No information.
2. **Fog of war** — explored but unoccupied. Shows terrain and last-seen building positions (static snapshot), but no unit movement. Greyed out.
3. **Visible area** — currently within a unit's sight range. Full information.

This creates a **spatial information hierarchy**. You know the map topology everywhere you've been. You know building placement at whatever state it was when you last looked. You know real-time unit positions only where you have units. The rest is inference.

The critical design insight: **fog of war makes scouting a continuous cost, not a one-time investment**. Sending a worker or specialist unit to scout means that unit isn't mining or fighting. Every second spent scouting is a second not spent producing. The player must constantly decide: is the information worth the opportunity cost?

### Scouting: The Information Lifecycle

Simon Dor's academic analysis of Brood War competition identifies three knowledge types that scouting develops:

**Declarative knowledge** — factual game data. "Cybernetics Core enables Dragoons." This is game literacy.

**Procedural knowledge** — execution skills. "Send a probe at 9 supply to scout." This is habit.

**Conditional knowledge** — the real skill. "If I see two early Gateways but no Cybernetics Core, my opponent is probably doing a 2-gate Zealot rush. I should build a Bunker at my natural." This is the inference engine.

The scouting lifecycle in a typical game:
1. **T=0:00-1:30** — Initial worker scout sent. Objective: find opponent's base location (2-player map = guaranteed, 4-player = 33-50% guess per scout path).
2. **T=1:30-3:00** — Scout arrives. Reads building placement and timing to infer build order. "He has Barracks at the wall — playing safe." "No Barracks visible — proxy play?" Every building is a word in a sentence; experienced players read the sentence instantly.
3. **T=3:00-7:00** — Scout dies or is chased away. Player now operates on **stale information** supplemented by game knowledge. "Given what I saw at 2 minutes, by now he should have X or Y. If X, I need to prepare for..."
4. **T=7:00+** — Later scouting via mobile units, Observers (invisible detectors), Overlords (flying supply). More expensive to maintain but provides richer data. Map control = information control.

The key insight for Robot Uprising: **Brood War players already operate on stale information — they just do it intuitively, through spatial inference.** Robot Uprising makes the staleness *visible and configurable*.

### The Inference Engine

Dor's "Heuristic Circle" framework identifies how competitive players process incomplete information:

**Operational plan** — what you're doing right now. "I'm expanding to my natural."
**Mobilized plans** — plans held in working memory, ready to activate. "If he attacks now, I fall back to the ramp."
**Projected plans** — long-term strategic objectives. "I'll get a third base before Hive tech."

**Immediate game state** — what you can see.
**Inferred game state** — what you believe based on evidence + game knowledge.
**Anticipated game state** — what you predict the future will look like.

Crucially, experienced players **"quite literally *see* the position differently" than novices**. Where a novice sees "some buildings," a veteran sees "2-gate opening into tech → Corsair/Reaver timing push in 90 seconds." The same pixels convey exponentially more information to an experienced reader. This is **chunking** — grouping elements into meaningful units that reduce cognitive load.

The parallel to Robot Uprising is direct: an experienced player reads their agent's context window not as "6 entries" but as "stale recon from 3 ticks ago + fresh tag from 1 tick ago + compressed relay summary = this sector is about to be attacked, and my buffer has room for one more signal before overload."

### Information Asymmetry as Weapon

StarCraft doesn't just have information scarcity — it has **information warfare**:

- **Dark Templar** — permanently invisible melee units. Forces opponent to invest in detection (Missile Turrets, Science Vessels, Observer networks) or die to invisible attacks. The cost isn't the DT themselves — it's the *detection infrastructure tax* imposed on the opponent.
- **Nuke** — nuclear missile with a visible red dot targeting cursor. The *threat* of nukes forces opponents to constantly scan for the dot, consuming attention even when no nuke is being launched.
- **Drops** — loading units into transports and flying behind enemy lines. Bypasses the frontline entirely, forcing the defender to split attention between the front and the back.
- **Feints** — moving army to attack position, then pulling back. Forces opponent to mobilize defense, wasting production time and army positioning.
- **Proxy buildings** — building production structures near the enemy base, outside their scouted area. The information gap becomes a weapon — they don't know the attack is coming because they haven't looked there.

Every one of these tactics has a Robot Uprising analog:
- Dark Templar → Stealth-configured agents (minimal EM emissions)
- Nuke → Noise flooding (forcing opponents to allocate buffer capacity to junk)
- Drops → Bypassing signal chains (direct attack on relays)
- Feints → False signals to waste opponent buffer space
- Proxy → Hook chains that the opponent can't trace

---

## The Macro/Micro Split

### What Macro Is

Macro (macromanagement) is everything about **production and economy**:
- Building workers and assigning them to minerals/gas
- Constructing production buildings
- Queuing units from those buildings
- Expanding to new resource locations
- Upgrading technology
- Managing supply (not getting supply blocked)

The core macro question is always: **"Am I spending my resources efficiently?"** Resources sitting unspent are resources wasted. Buildings sitting idle are production wasted. Workers not mining are income wasted.

### What Micro Is

Micro (micromanagement) is everything about **unit control in combat and tactics**:
- Focus-firing specific enemy units
- Retreating wounded units behind fresh ones
- Kiting (attacking while moving backward to stay out of enemy range)
- Splitting units against splash damage
- Casting spells at the right moment on the right target
- Positioning units on high ground for the vision advantage

The core micro question is: **"Am I getting maximum value from each unit in this fight?"**

### The Fundamental Tension

The genius of Brood War is that **you cannot do both perfectly at the same time**. Your hands are finite. Your attention is finite. Every second spent micromanaging a battle is a second not spent building units back home. Every second spent checking production is a second your army stands idle.

The Liquipedia wiki states it plainly: *"spending attention on micro omits macro, and vice-versa."*

This creates a **continuous attention allocation problem** — the exact problem Robot Uprising asks players to solve for their agents. The difference is that in Brood War, the player IS the attention allocation system. In Robot Uprising, the player DESIGNS the attention allocation system and then watches it execute.

**"Good macro is more valuable than good micro"** — this is the community consensus. A player with 40 more Marines from superior macro will overwhelm a player with perfect micro but 40 fewer Marines. But when macro is equal, micro decides everything.

The hierarchy maps to Robot Uprising's production queue vs. blueprint design:
- **Macro** = production queue management (what to build, when, in what order)
- **Micro** = blueprint configuration (how each unit behaves, what it notices, what it ignores)
- The Robot Uprising inversion: in SC:BW, macro is easier and more impactful at lower skill levels, while micro is the differentiator at high levels. In Robot Uprising, the plan screen IS both macro and micro simultaneously — the blueprint design determines behavior quality, and the production queue determines quantity/timing. There is no real-time execution; everything is committed upfront.

### APM as Skill Expression

Actions Per Minute (APM) is the speed metric. Professional Brood War players average 300-400+ APM, with bursts exceeding 600 during intense micro. APM is not just speed — it's the **bandwidth of the player's attention pipeline**.

Every action is a slot in the player's own "context window." At 400 APM, the player makes ~6.7 decisions per second. Each decision requires: perceive current state → select appropriate action → execute input → verify result. The player's own cognitive pipeline has latency, buffer limits, and eviction policies — they just aren't made visible.

Robot Uprising makes the invisible pipeline visible. Instead of APM, the game measures **architectural efficiency** — how well the player's configured systems extract value from the fixed tick budget. The player's "APM" is zero during sealed watch; their preparation in the plan screen is everything.

---

## UI/UX Analysis

### The Classic Layout

StarCraft Brood War's interface is divided into four zones:

1. **Main viewport** (top ~75%) — isometric view of the battlefield. Scrollable. This is where you watch things happen and select units.
2. **Minimap** (bottom-left, ~120x120 px) — entire map compressed to thumbnail. Dots show units. Clicking the minimap jumps the viewport. **The most important UI element** — professional players glance at the minimap every 3-5 seconds.
3. **Info panel** (bottom-center) — selected unit wireframe, health bar, stats, or group display showing all selected unit icons.
4. **Command card** (bottom-right, 3x3 grid) — context-sensitive action buttons for the selected unit/building. Build, move, attack, special abilities.
5. **Resource display** (top-right) — minerals, gas, supply used/available.

### What This Layout Teaches

The layout establishes an **information hierarchy**:
- **Primary** (70% of eye time): Main viewport — what's happening NOW
- **Secondary** (20% of eye time): Minimap — where things are across the map
- **Tertiary** (10% of eye time): Resources/supply — strategic constraints

The command card is barely looked at by experienced players — they use keyboard shortcuts. The info panel is scanned for health/energy during combat but otherwise ignored. The minimap and main viewport carry the game.

**Robot Uprising's plan screen** inherits this philosophy but inverts the priority:
- **Primary**: Workbench (right) — configuring agents IS the game
- **Secondary**: Board preview (left) — spatial context for configurations
- **Tertiary**: Production queue (bottom) — build order timing

During sealed watch, the board becomes primary and everything else disappears — the same "tunnel focus on the action" as watching a Brood War battle.

---

## What Creates "One More Game"

### 1. Legible Failure
Every Brood War loss is traceable. You can point to the moment: "I expanded too late." "I didn't scout the Dark Templar." "I should have focus-fired the Siege Tanks." The game never feels unfair — even against much stronger opponents, you can identify your mistake. This creates the "I'll fix it next time" impulse.

**Robot Uprising parallel:** The Inspector makes every failure forensically legible. The two-act debrief (sealed watch emotional reaction → Inspector analytical diagnosis) mirrors the Brood War experience of "I lost... but I know exactly why."

### 2. Skill Ceiling Without Floor
A complete beginner can play Brood War. Build workers. Build Marines. Attack-move toward the enemy. You'll lose to anyone who knows what they're doing, but you can play the game. The controls are simple — left click to select, right click to command. The complexity emerges from the *decisions*, not the input method.

Meanwhile, the ceiling is infinite. Professional players are still innovating new micro techniques 28 years in. The game has never been "solved."

**Robot Uprising parallel:** Mission 1 is "drag noise out of a buffer." Mission 10 is "build a factory that builds intelligent systems that coordinate across channels to defeat an adaptive enemy." Same input method (drag, click, configure). Infinitely deeper decisions.

### 3. Three Unique Races
Each race (Terran, Protoss, Zerg) plays fundamentally differently. Different production systems, different units, different strategic priorities. Learning one race is learning one game; learning all three is learning three games that interact with each other.

**Robot Uprising parallel:** The five unit types (Scout, Striker, Relay, Specialist, Command) serve a similar purpose — each creates a different configuration space, and the interactions between configurations create the emergent complexity.

### 4. Exquisite Balance
Brood War's balance is legendary — no race has a definitive advantage. Every strategy has a counter. Every composition can be outplayed. This means losses always feel like player error, not game imbalance.

**Robot Uprising parallel:** The one-shot-one-kill system and the information architecture design eliminate damage-number balance entirely. Balance comes from the non-transitivity web: Scout Rush beats Relay Chain, Relay Chain beats Striker Swarm, Striker Swarm beats Scout Rush.

### 5. The Uncertainty Addiction
The fog of war means you're always operating on incomplete information. You're always guessing. You're always preparing for possibilities. This persistent low-grade tension — "what is my opponent doing right now?" — is addictive. It's the same cognitive loop as poker: decide, commit, reveal, learn.

**Robot Uprising parallel:** The sealed watch IS this uncertainty distilled. You've committed your design. You can't intervene. You watch your system encounter the unknown and discover whether your preparation was sufficient.

---

## Specific Mechanics That Translate to Robot Uprising

### 1. Control Groups → Blueprints
In SC:BW, players assign units to numbered control groups (Ctrl+1-9) for fast selection. Each group is an attention unit — "my main army," "my scouts," "my defense."

In Robot Uprising, blueprints serve the same role. Each blueprint IS a configured attention system. The production queue determines how many instances of each blueprint exist, like building multiple units and assigning them to the same control group.

### 2. Rally Points → Channels
SC:BW buildings can set rally points — newly produced units automatically move to a designated location. This is a persistent, fire-and-forget directive.

Robot Uprising's channels are rally points for *information*. "All signals about threats go HERE" is the information equivalent of "all new Marines go to the front line."

### 3. Waypoints → Hook Chains
SC:BW allows shift-queued move commands — a sequence of locations a unit will visit in order. Each waypoint processes in sequence with a delay.

Hook chains work identically: Scout generates signal → travels via channel to Relay (1 tick) → Relay compresses and forwards (1 tick) → arrives at Striker (1 tick). 3 ticks total. Each hop is a waypoint in an information pipeline.

### 4. Supply Blocking → Context Overload
In SC:BW, hitting the supply cap means you can't build units until you construct more supply buildings. Getting supply blocked is one of the most common mistakes at every skill level — you forget to build Pylons/Supply Depots/Overlords, and your entire production pipeline stalls.

Context overload is the information equivalent. When a unit's context window is full and new entries arrive, the unit is **stunned for 1 tick**. Just like supply blocking, it's a preventable catastrophe — proper configuration (eviction policies, compression, channel filtering) prevents it, but under pressure, it happens. And when it happens in a one-shot-one-kill game, it can be fatal.

### 5. High Ground Vision → Signal Latency
SC:BW uses high ground for vision advantage — units on low ground can't see units on high ground (and miss 47% of attacks against them). This creates **positional information asymmetry**.

Robot Uprising creates **temporal information asymmetry** through signal latency. A direct Scout→Striker path has less latency than Scout→Relay→Relay→Striker, but the longer chain can compress and filter information. The trade-off isn't spatial (high ground) but temporal (how old is your intelligence?).

### 6. Map Control → Presence Tagging
In SC:BW, controlling the center of the map means seeing enemy movement earlier, having shorter reinforcement paths, and denying enemy expansions. Map control is information control + logistic advantage.

Robot Uprising's tagging system creates a similar dynamic — tagged map nodes boost resource income, and tagged enemies are actionable by other skills. Map presence = information presence = economic advantage.

---

## Community Reception Patterns

### What Players Love
- **Depth without arbitrary complexity** — three races, ~30 unit types total, but every matchup plays differently
- **Spectator clarity** — even non-players can understand "the army is bigger" and "that base is on fire"
- **The moment of revelation** — when fog of war lifts and you see what the opponent was actually doing. The surprise. The dread. The excitement.
- **Mechanical mastery** — the tactile satisfaction of executing a perfect split against splash damage, or a flawless macro cycle
- **The infinite skill ceiling** — "I still play it. Learn new things in it. Starcraft 1 has been released in 1998… and it's still going."

### What Players Complain About
- **Clunky unit pathing** — units get stuck on each other, can't path around obstacles efficiently. This was somewhat intentional (it increased micro skill demand) but frustrated casual players.
- **12-unit selection limit** — you can only select 12 units at a time. Forces grouping and splits but feels archaic.
- **Worker management tedium** — manually assigning workers to resources is busywork, not strategic depth.
- **Barrier to entry for multiplayer** — the skill gap between a beginner and even a low-level competitive player is enormous. Getting destroyed in 4 minutes is not fun.
- **Race balance at lower levels** — while balance is exceptional at the top, certain strategies (Zealot rush, Zergling rush) feel unbeatable to beginners who don't know the counters.

### What This Means for Robot Uprising
The game should inherit the *feeling* of Brood War's depth without its *friction*. No APM requirement. No clunky pathing. No tedious worker management. The depth should live entirely in the configuration space — the plan screen. The sealed watch should deliver the spectacle and tension of a Brood War battle without requiring any real-time input.

The barrier-to-entry complaint is especially relevant: Robot Uprising must ensure that Mission 1 is accessible to someone who has never played any strategy game, while Mission 10 satisfies the Brood War veteran. The 10-mission campaign arc, with its progressive unlock of mechanics, is the answer — but the onboarding must succeed where Brood War's multiplayer ladder fails.

---

## Sales and Community Data

- **Original StarCraft + Brood War:** 11M+ copies sold
- **StarCraft Remastered (2017):** Updated graphics, identical gameplay, maintained competitive scene
- **Total Brood War esports prize money:** $7,556,789 across 542 tournaments
- **Peak Korean scene:** Multiple TV channels, stadium events, pro-gamers as celebrities
- **Top earner:** Lee "Flash" Young Ho — ~$580K in tournament winnings
- **2025 scene:** Still active but diminished (~$37K prize pool). Community-driven events on Afreeca TV.
- **Made free-to-play:** 2017 alongside Remastered launch
- **Legacy:** Created the template for esports as an industry. Direct ancestor of League of Legends, Counter-Strike, Dota 2 competitive ecosystems.

---

## Player Journeys

### Journey: Marcus, 35, Software Engineer and Former Diamond SC2 Player

**Context:** Marcus has 3,000 hours in StarCraft II and ~200 in Brood War. He's completed Robot Uprising Missions 1-5 and just unlocked the factory. He instinctively maps everything to StarCraft concepts.

**Minute 0:00 — Plan Screen, Mission 6**
The screen opens. Board preview left, workbench right. Marcus immediately scans for the equivalent of "what's my spawn location" — he finds his factory on the bottom-left of the 8x8 board, enemy spawner on the top-right. Terrain shows Cebu urban cyberpunk tiles — buildings, streets, choke points at C4 and F5.

His eye goes to the production queue strip at the bottom — a horizontal conveyor belt of blueprint icons. Right now: Scout, Scout, Striker. He thinks: *"This is like my Barracks queue. Scout first, just like early game SC — I need information before I commit to an army composition."*

**Minute 0:30 — Configuring the Scout Blueprint**
He opens the Scout blueprint. Six buffer slots. Two hook slots. Skills: patrol and evade. He configures a hook: `ON_ENEMY_SIGHTED → SEND threat-intel ON recon-net`. He thinks: *"This is my Observer. It sees, it reports. But in StarCraft, my Observer just gave me vision — here I have to configure WHAT it reports and WHERE the report goes. It's like if I had to program my Observer before deploying it."*

He sets the context config: listen to `recon-net` (to receive reports from other scouts), ignore `production-updates`. Eviction priority: oldest first. He thinks: *"It's like choosing what my scout pays attention to. In SC, I controlled where it looked by moving it. Here I control what it hears."*

**Minute 1:30 — The Relay Configuration**
He adds a Relay blueprint. Twelve buffer slots. Four hook slots. Stationary. He wires it: listen to `recon-net`, compress incoming signals, forward compressed intel on `cmd-feed`. He adds a filter rule: "IF signal_type = noise → evict immediately."

*"This is the thing StarCraft never had. In SC, information goes straight from my eyes to my brain. Here there's a relay station in between — it compresses and filters. It's like having a minimap that only shows me what I've configured it to show."*

**Minute 3:00 — The Production Queue Decision**
He stares at the production queue. Scout, Relay, Striker, Striker. Total cost: 24 minerals. He has 30 to start with passive income. He wonders: should he add a third Striker? Or expand his scout coverage?

*"This is exactly the macro decision. More Marines or expand? More Strikers or better intelligence? Except I'm making this decision ONCE, before the battle. In SC, I make it continuously. Here I commit."*

He adds a second Scout. Five units total: Scout, Scout, Relay, Striker, Striker. The cost preview shows he'll be tight on resources — the second Scout delays his second Striker by 2 ticks.

**Minute 3:30 — The EXECUTE Moment**
His finger hovers over the EXECUTE button. Top-right corner, pulsing cyan. He feels it — the same pre-battle tension as queuing for a ladder game in StarCraft. But different. In SC, he'd be nervous about his APM, his reaction time, whether he'd miss a drop. Here, the nervousness is different: *"Did I configure my agents correctly? Is my channel topology right? Will the relay compress the right signals?"*

He clicks EXECUTE.

**Minute 4:00 — Sealed Watch**
The board fills the screen. Tick clock at top — horizontal pips. Tick 1 fires. His factory produces the first Scout. It appears on the factory tile. Context bar: six tiny pips, all empty, cool blue.

Tick 5. Scout has patrolled to D3. Its perception radius lights up five tiles — it sees an enemy Scout at E4. The unit flashes — `ON_ENEMY_SIGHTED` fires. A green cell flash at the Scout's position: signal sent on `recon-net`. A colored dashed line briefly connects the Scout to the Relay at B2.

Tick 7. The signal arrives at the Relay (2 ticks: 1 for transmission, 1 for processing). The Relay's context bar fills one pip. The compress skill fires — another green flash. Signal forwarded on `cmd-feed`.

Marcus watches the information propagate through his network. *"This is watching my own fog of war system work. In SC, I'd just see the enemy. Here I see my system seeing the enemy, processing that information, and delivering it to the unit that needs it. And it takes TIME."*

Tick 12. An enemy Striker appears at F5, heading toward his Relay. His Striker at C3 hasn't received the threat intel yet — it's still 2 ticks away through the relay chain. Marcus grips his chair. *"If I were playing SC, I'd select my Marine and move it right now. But I can't. I'm watching my system's response time. This is what latency FEELS like."*

Tick 14. The Striker receives the compressed threat report. Its rule fires: `IF threat_level = high AND enemy_distance < 3 → engage`. It starts moving toward F5. But the enemy Striker is at E4 now, one tile from the Relay.

Tick 15. Enemy Striker reaches D3 — adjacent to the Relay. One-shot kill. The Relay sparks, collapses, tile flashes red. Marcus's entire signal chain is severed. His second Scout is still sending to `recon-net` but nobody's listening.

*"I just lost my Observer AND my Nexus in one unit. No — I lost my entire information infrastructure. In StarCraft, losing a Nexus hurts your economy. Here, losing the Relay blinds my whole army."*

**Minute 6:00 — Inspector**
The battle ended in a loss. The sealed watch fades to the Inspector. Timeline scrubber at the top. Marcus immediately scrubs to tick 12 — when the enemy Striker appeared.

He clicks his Striker. Decision trace shows: at tick 12, the Striker's context window had 4 entries. None of them were the threat report — it hadn't arrived yet. The rule `IF threat_level = high AND enemy_distance < 3 → engage` wasn't evaluating any relevant data.

He clicks the Relay. At tick 14, its context window was full — the compress skill had processed 8 incoming signals and was forwarding to `cmd-feed`. But the enemy approach from F5→E4→D3 took only 3 ticks. The relay chain needed 4 ticks minimum (scout perceive → transmit to relay → compress → forward to striker + 1 tick per hop).

*"My signal latency was higher than the enemy's approach speed. In StarCraft terms, I built my Nexus too close to the front with no defense. Here, my Relay was too exposed and my chain was too deep."*

He sees it now: he needs either a shorter chain (scout directly to striker) sacrificing compression, or a better-positioned relay further from the enemy approach vector. This is the macro/micro lesson in information terms — fast but raw, or slow but smart.

**Minute 7:00 — Resolution**
Marcus hits the back button to return to the plan screen. He's already redesigning: the Relay moves to A1 (max distance from enemy approach), and he adds a direct `scout-to-striker` emergency channel alongside the relay chain — raw uncompressed for speed, compressed for detail.

He thinks: *"In StarCraft, I'd learn this by dying to the same push 50 times until my muscle memory adapted. Here, I redesigned my entire information architecture in one iteration. Same lesson — positioning, timing, information flow — but learned through design instead of execution."*

**UI Annotations:**
- **Production queue strip**: horizontal conveyor belt at bottom of plan screen, drag to reorder, cost preview showing cumulative mineral cost and tick timing
- **Signal chain visualization**: colored dashed lines connecting units during sealed watch, green flash on signal send, 1-tick delay visible as traveling dot along the line
- **Context bar**: six horizontal pips at the bottom of the Scout sprite, filling left-to-right as signals arrive, color-coded by signal type
- **Decision trace in Inspector**: left sidebar showing rule evaluation for selected unit at current tick, context entries highlighted green (used in decision) or grey (ignored)

---

### Journey: Priya, 19, College Freshman, Never Played an RTS

**Context:** Priya plays Stardew Valley and Animal Crossing. She's never played StarCraft or any strategy game. She's on Mission 1 of Robot Uprising — the tutorial that teaches context filtering.

**Minute 0:00 — First Contact**
The boot log plays. Teal monospace text scrolling on black: `PERCEPTION MODULE... ONLINE. CONTEXT WINDOW... INITIALIZING. 6 SLOTS ALLOCATED.` She reads it, intrigued. *"I'm the AI. This is my own startup sequence."*

The board appears. 8x8 grid. A single Scout unit in the center, icon: 👁. Three enemies scattered around the edges. And noise — red-tinted entries filling the Scout's context bar. Six pips, all red. The Scout is frozen, sparking — context overloaded.

**Minute 0:30 — The Filter Puzzle**
A tooltip appears: *"Your Scout's context window is full of noise. Drag noise entries out to make room for real observations."*

Priya sees the Scout's context window expanded on the right side — six slots, each showing a colored block. Four are labeled `NOISE` in red. Two show `ENEMY_POSITION: E7` and `TERRAIN: WALL_AT_D4` in blue and green.

She drags a red noise block out of the context window. It dissolves with a soft fizz sound. The Scout's sparking stops slightly. She drags another. And another. The Scout begins to move, slowly patrolling.

*"Oh! It couldn't think because its brain was full of junk. I'm clearing out the junk so it can see what matters."*

**Minute 1:30 — The Comparison**
Priya doesn't know it, but she's learning the same lesson Marcus learned from 3,000 hours of StarCraft: **information management is more important than firepower.** In Brood War, players who scout win more than players who build more units. In Robot Uprising Mission 1, the player who clears noise wins more than... well, there's nothing else to do yet. But the principle is planted.

She clears all four noise entries. The Scout's context bar shows two blue entries — real observations. It patrols smoothly now, moving toward the nearest enemy. A new observation fills slot 3: `ENEMY_POSITION: D6`. The Scout adjusts course.

**Minute 2:30 — The First Victory**
The Scout reaches D6. Adjacent to the enemy. One-shot kill — the enemy sparks and collapses in a red flash. Priya gasps. *"It just... walked up and killed it? Because it could SEE it?"*

She watches the Scout continue to the next enemy, context window updating as it moves. Each new tile provides new observations, old observations age out naturally. She's watching an attention system work — she just doesn't know the vocabulary yet.

**Minute 3:30 — Inspector**
The battle ends. Three enemies destroyed. The Inspector appears with the timeline scrubber. She scrubs back to the beginning — sees the Scout frozen, context full of noise, unable to act. Scrubs forward — noise cleared, Scout moves, engages, wins.

The decision trace for tick 1 shows: `Rule: patrol → BLOCKED (context overloaded)`. For tick 5 after she cleared noise: `Rule: IF enemy_visible → engage. Context slot 2: ENEMY_POSITION E7. → MOVING TO E7.`

She reads this and thinks: *"The robot couldn't do its job because its brain was full of stuff that didn't matter. I cleaned it up and it knew exactly what to do."*

She doesn't realize she just internalized the core lesson of every StarCraft professional player: **information quality matters more than information quantity.**

**Minute 4:00 — Resolution**
Mission 1 complete. A boot log entry appears: `CONTEXT MANAGEMENT... UNDERSTOOD. NOISE FLOOR... CALIBRATED.` The next mission icon glows on the campaign map — Ifugao province, rice terraces.

Priya doesn't know what StarCraft is. She's never heard of fog of war, APM, or macro/micro. But she now understands, viscerally, that a system's ability to act depends on the quality of information in its working memory. She'll spend the next 9 missions learning to configure that information architecture with increasing sophistication — eventually reaching the same strategic depth that takes StarCraft players thousands of hours to develop, but through design rather than execution speed.

**UI Annotations:**
- **Context window expanded view**: right panel showing 6 horizontal slots, each with a colored block (red for noise, blue for observations, green for terrain)
- **Drag-to-remove interaction**: grab noise block, drag outside the panel, block dissolves with fizz animation and particle effect
- **Scout sparking animation**: when context overloaded, unit sprite jitters and shows electrical spark particles, context bar pips all pulsing red
- **Decision trace**: Inspector sidebar showing per-tick rule evaluation with color-coded context entries (green = used, grey = ignored, red = noise blocking action)

---

### Journey: Kwame, 32, Twitch Streamer, 400 Viewers Average, Plays Everything

**Context:** Kwame has played StarCraft II casually (Platinum league), lots of Slay the Spire, some Factorio. He's streaming Mission 8 of Robot Uprising — the first full factory-vs-factory mission. Chat is active.

**Minute 0:00 — Plan Screen**
Kwame's facecam is in the bottom-left. The plan screen fills the rest. He's staring at three blueprints in the workbench: his Scout, Relay, and Striker configs. He needs to add a Command unit for the first time.

*"Chat, this is it. We're building the factory that builds the factory. This is like... you know when you're playing SC2 and you set up your production tab to auto-produce? Except here the production IS the game."*

He opens the Command unit blueprint. 14 buffer slots. 6 hook slots. Skills: reassign, reroute, prioritize. He reads the skill descriptions. Chat is typing:

`>> it's like if your Nexus could reprogram your probes`
`>> factory of factories`
`>> Skynet origin story`

**Minute 1:30 — The Architecture**
Kwame designs his system on stream. He talks through it:

*"OK so my Command unit sits at A1, far from the front. It listens on `cmd-feed` — the compressed intel from my Relay chain. When it detects multiple enemies clustering — when the threat count in buffer exceeds 3 — it fires `reassign` to change my second Scout from patrol to evade mode. It reroutes the Scouts' hook from `recon-net` to `emergency-evac`. And it prioritizes threat signals over terrain signals in the Strikers' eviction policy."*

Chat reacts:
`>> he's literally writing a deployment script`
`>> this is Kubernetes with guns`
`>> @kwame_plays you're building an incident response runbook`

**Minute 3:00 — The Factory vs. Factory**
Kwame hits EXECUTE. Sealed watch begins. His factory starts producing: Scout, Relay, Scout, Striker, Striker, Command. The enemy factory is producing its own units — different composition, different configurations. Neither player can see the other's blueprints.

Tick 8. Both Scouts encounter each other at D4. Signal chains light up on both sides — green flashes cascading through relay networks. Kwame leans forward. Chat is counting ticks.

`>> your relay is 2 hops, his is direct`
`>> you're going to see his striker 3 ticks late`

Tick 14. Kwame's Relay compresses and forwards the encounter report. The enemy's Striker, having received a direct uncompressed report, is already moving toward Kwame's Relay position.

Tick 16. Kwame's Command unit receives the compressed report. Its rule fires: threat count > 2, trigger reassign. The command signal propagates... but it takes 2 more ticks to reach the Scouts.

Tick 18. The enemy Striker reaches Kwame's forward Relay. One-shot kill. The relay collapses in red sparks. Chat erupts:

`>> THE RELAY`
`>> F`
`>> this is like losing your Nexus at 5 minutes`
`>> his latency was lower, faster response chain`

But then — tick 19. Kwame's Command reassign finally propagates. Both Scouts switch to evade mode. They scatter. The enemy Striker, expecting to chase, finds nothing to kill. And Kwame's second Relay (his backup, configured on a different channel) starts receiving direct Scout reports on `emergency-evac`.

`>> THE BACKUP RELAY`
`>> HE HAD REDUNDANCY`
`>> chat he planned for this`
`>> absolute architect`

Tick 25. Kwame's Strikers, now receiving intel through the backup chain, converge on the enemy's exposed Scouts. Two one-shot kills. The enemy information network collapses.

*"CHAT! That's what we call information redundancy! I lost my primary relay but the backup kicked in! In StarCraft that's like having a hidden expansion — you lose your main but you're still producing!"*

**Minute 5:00 — Inspector**
Chat demands the replay. Kwame opens the Inspector and scrubs to tick 14 — the moment the enemy Striker started moving. He clicks the enemy Striker and reads its decision trace: `Rule: IF relay_detected AND relay_distance < 4 → engage_relay. Context: [RELAY_POSITION: B3, confidence: HIGH, age: 1]`.

*"They configured their Striker to HUNT RELAYS. That's a dedicated snipe build! In StarCraft terms, that's a Viking rush specifically to kill Colossi. Except they programmed it into the unit's behavior."*

He clicks his Command unit at tick 19. Decision trace: `Rule: IF threat_count > 2 → reassign(scouts, evade). Context: [THREAT_SUMMARY: 3 contacts, compressed, age: 3]. Reassign signal sent on cmd-override. Propagation: 2 ticks to Scout-A, 2 ticks to Scout-B.`

*"The Command unit made the right call, but it was 5 ticks after the threat appeared. Five ticks of latency. In StarCraft, that's like if your army took 5 seconds to respond to your commands. The compression was worth it for quality — the Command got a clean threat count instead of raw noise — but the delay cost me a relay."*

Chat is clipping everything. Three clips get 50K+ views. The "backup relay" moment becomes a meme in the Robot Uprising community.

**Minute 6:30 — Resolution**
Kwame won the mission. He talks to camera:

*"OK chat, real talk. This is the feeling. This is the StarCraft feeling — the fog of war, the information game, the 'did I prepare correctly' tension. But instead of clicking 400 times a minute, I designed a system once and watched it execute. The skill isn't my APM. The skill is my architecture. And honestly? The moment when my backup relay caught the emergency signal and my scouts scattered? That's the best thing I've felt in a game since my first Zergling runby into a Protoss expansion."*

**UI Annotations:**
- **Sealed watch signal chains**: colored dashed lines showing signal propagation between units, with traveling dots at 1 tile/tick speed, two distinct colors for `recon-net` (cyan) and `emergency-evac` (amber)
- **Command reassign propagation**: when Command sends reassign signal, a golden pulse emanates from the Command unit and travels along channel lines to target units, 2-tick visible travel time
- **Relay death animation**: unit sprite crumbles, red flash, sparking particles, channel lines connected to it snap and dissolve with a cable-snap sound
- **Inspector decision trace**: sidebar showing rule evaluation, with `threat_count > 2 → TRUE` highlighted in green, connected context entries highlighted, 3-tick age visible as `age: 3` badge with amber tint

---

## The Core Inversion: Spatial Fog vs. Temporal Fog

The deepest translation from Brood War to Robot Uprising is this:

**StarCraft says: "I don't know what's over THERE."**
**Robot Uprising says: "I know what was THERE... 4 ticks ago."**

In Brood War, the fog of war is spatial — you can't see areas you don't have units in. The solution is to put units there (scouting). The cost is opportunity cost (that unit could be doing something else).

In Robot Uprising, the fog is temporal — every piece of information has an age, and the age depends on the signal chain's depth. A direct Scout→Striker connection gives 2-tick-old intel. A Scout→Relay→Relay→Striker chain gives 4-tick-old intel but it's compressed and filtered. The solution is better information architecture. The cost is buffer space, EM emissions, and latency.

This inversion preserves everything that makes Brood War's information game compelling — the scouting decisions, the inference from incomplete data, the information-as-weapon dynamic, the constant tension of "what do they know about me?" — while replacing the mechanical execution (APM, unit pathing, real-time control) with **system design** (blueprint configuration, channel topology, production sequencing).

The feeling is the same. The skill expression is different. The transfer is real: someone who gets good at Robot Uprising understands information architecture, attention management, signal latency, buffer overflow, and autonomous system coordination — concepts that directly transfer to building and managing real AI agent systems.

---

## Interaction Effects with Other Design Options

| Design Space Area | Interaction |
|---|---|
| **Buffer model (2.01-2.02)** | Brood War's vision is binary (see/don't see); Robot Uprising's buffer model adds granularity (how much you know, how old it is, how reliable it is). Weighted buffers (2.02) increase the "inference engine" aspect — players must judge information quality, not just presence. |
| **Hook chaining (3.09)** | Signal latency IS Brood War's scouting delay made explicit. Every hop in a hook chain is a tile of distance a scout must travel. The hot/cold toggle maps to "fast but loud" vs. "slow but stealthy" — identical to SC's decision between air scouting (fast, easily killed) and ground scouting (slow, harder to catch). |
| **Sealed watch (locked)** | The sealed watch is the bridge between "I set up my army" and "I watch the battle." Brood War players already experience this during crucial engagements — when both armies clash, the outcome is determined in seconds and all you can do is micro and hope. Robot Uprising extends this to the entire battle. |
| **Inspector (locked)** | Brood War has no inspector — players review replays. The Inspector is a Brood War replay with built-in analysis tools. The decision trace is what every Brood War player wishes they had: an automatic explanation of why each unit did what it did. |
| **Campaign arc (locked)** | The 10-mission progression mirrors how Brood War players learn: first you learn to build workers (Mission 1: context), then to build units (Missions 2-4: skills/rules/hooks), then to expand (Mission 5: factory), then to manage complex armies (Missions 6-10: command agents). |
| **Multiplayer/async (7.01)** | Brood War's competitive scene proves the viability of deep strategy games as spectator sports. Robot Uprising's three-screen loop creates natural "commentator-friendly" moments — the plan screen shows strategy, the sealed watch shows drama, the inspector shows analysis. |
| **EM emissions model** | No direct Brood War parallel, but maps to the general principle that information gathering has costs. In SC, scouting costs unit time and risks the scout. In Robot Uprising, hook transmissions create EM noise that enemies can detect — the information infrastructure itself is a vulnerability. |

---

## Comparable Games / Media

| Reference | Relevance |
|---|---|
| **StarCraft II** | Modernized UI, improved pathing, larger selection groups, but widely considered to have less strategic depth than Brood War due to deathball mechanics and easier macro. Proves that removing mechanical friction can reduce strategic depth — Robot Uprising must add depth through design complexity, not mechanical difficulty. |
| **Warcraft III** | Introduced hero units as high-value targets, smaller armies, more micro-intensive. Command agents in Robot Uprising serve a similar role — high-value, high-capability units that change the entire team's behavior. |
| **Chess** | Perfect information, zero execution barrier. Pure strategy. Robot Uprising during the plan screen is chess-like — no time pressure (on replay), no mechanical skill, pure decision making. The sealed watch adds the uncertainty that chess lacks. |
| **Poker** | Imperfect information, commitment under uncertainty, reading opponents through inference. The EXECUTE button is equivalent to going all-in — you've committed your strategy, now the cards (ticks) are revealed. |
| **Football coaching** | The coach designs the play (plan screen), sends the team onto the field (EXECUTE), and watches the play unfold without being able to intervene (sealed watch). Robot Uprising is "coaching simulator" as much as it is "RTS." |

---

## Sensory Description

The *feeling* of StarCraft that Robot Uprising must capture:

**The pre-battle tension**: In SC, it's the 30 seconds before the first engagement — your army is moving across the map, you're checking production one last time, your heart rate increases. In Robot Uprising, it's the moment before hitting EXECUTE. The workbench is set. The production queue is ordered. Your finger hovers. The cyan glow of the EXECUTE button pulses. Ambient hum of the factory. The world is about to move.

**The revelation moment**: In SC, it's when your scout enters the enemy base and you see three Stargates — "Oh no, Carriers." In Robot Uprising, it's tick 8 when your Scout's context window fills with threat data and the signal chain lights up with green flashes cascading toward your relay network. The same "now I know, and now I must react — except my system must react for me."

**The loss cascade**: In SC, it's losing your third base and watching your income collapse. In Robot Uprising, it's watching a Relay die and seeing every connected signal line snap and dissolve — a cascading visual representation of infrastructure failure. The sound: cable-snap, then silence where signals used to hum, then the rising 40Hz sub-bass of a network going dark.

**The "I knew that would happen" mastery**: In SC, it's predicting the opponent's timing attack and having your defense ready. In Robot Uprising, it's watching your configured system respond to a threat exactly as designed — Scout detects, signal compresses, Striker engages, enemy eliminated — all without your intervention. The quiet satisfaction of a system working. The factory working as designed.

**The TikTok clip**: A Robot Uprising player loses their primary Relay network at tick 15. Everything seems lost. Then the backup channel kicks in — signal reroutes through a secondary Relay, Scouts scatter on emergency protocols, and Strikers converge on the now-exposed enemy. The player didn't click anything during the battle. They designed the redundancy 3 minutes ago on the plan screen. Chat erupts: *"HE HAD REDUNDANCY."* 15 seconds. Instant download.

---

## New Aspects Discovered

- **1.13a** — The "fog of time" vs. "fog of space" philosophical distinction: a deep design exploration of how temporal information degradation (signal age, buffer staleness) creates fundamentally different strategic decisions than spatial information hiding (fog of war, hidden bases); how the temporal model teaches latency, caching, and TTL concepts while spatial model teaches exploration and positioning
- **1.13b** — The APM-to-architecture transfer: designing Robot Uprising to explicitly reward the SAME cognitive skills that high-APM StarCraft players use (parallel task prioritization, attention cycling, interrupt handling) but expressed through configuration rather than execution speed; the "300 APM player finds their equivalent advantage in a 0-APM game" problem
- **1.13c** — The spectator problem: StarCraft became an esport because battles are visually legible. Robot Uprising's signal chains and context bars need the same visual clarity for observers who didn't design the systems. How to make someone else's information architecture comprehensible to a viewer in real time.
- **1.13d** — The control group / hotkey vocabulary as plan-screen UX precedent: StarCraft's control groups (Ctrl+1-9) as the original "named collections of attention units" — how this maps to blueprint naming, channel naming, and production group management in the plan screen; keyboard-first expert workflows
- **1.13e** — The replay culture as Inspector precedent: Brood War's replay-watching culture (Day9 dailies, community analysis, tournament VODs) as direct precedent for Robot Uprising's Inspector and async sharing; how the Inspector should be designed to support the same "learn by watching others" ecosystem

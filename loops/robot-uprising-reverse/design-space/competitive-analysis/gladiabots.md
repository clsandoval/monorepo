# Gladiabots — Competitive Analysis

**Aspect:** 1.06 — Visual behavior tree programming for robots, multiplayer AI tournaments
**Developer:** GFX47 (Sébastien Dubois), published by WhisperGames
**Release:** May 22, 2019 (PC), December 14, 2019 (iOS)
**Price:** $14.99 PC / $6.99 iOS
**Steam:** 88% Very Positive (887 reviews) — estimated 200k–500k owners
**Current state:** Active (campaign intact), multiplayer community tiny (~6 peak concurrent)

---

## Overview

Gladiabots is the game that occupies the exact position Robot Uprising aims to occupy — but made different bets. It's a robot combat strategy game where **the player never directly controls units**. Instead, they construct visual behavior trees for each robot, deploy the squad, and watch the AI execute. The loop: build → deploy → observe → iterate.

The developer explicitly says: "If you want a programming game where you write real code, play Screeps or LeekWars. Gladiabots is for players who want to think about strategy expressed as logic without writing syntax."

**What makes it unique:** Gladiabots is the only commercial-scale accessible visual-programming PvP AI game. Behavior tree format approachable to non-coders. Query model powerful enough for deep strategies. Async multiplayer removes schedule barriers. Nothing else at this scale occupies exactly this space.

**Key design decision with profound consequences:** The developer removed customizable robot parts from an earlier prototype because "the game quickly turned into a composition battle instead of an AI battle." Final game deliberately refuses loadout building. The behavior tree IS the player's expression.

---

## Core Loop

### Every 0.25 seconds (one AI evaluation tick)
Each bot re-evaluates its behavior tree once every 10 game turns (40 turns/second = one decision per 0.25 seconds). During a match the player watches continuously: does the sniper retreat when its shield drops? Does the shotgun flank correctly? Each observable decision has a visible causal chain in the tree.

### Every 5 minutes (one match)
Deploy a team setup → watch match resolve → see outcome. In multiplayer, matches are **fully asynchronous** — both players deploy independently, server resolves, you get a push notification. You can watch any match as a replay with the debugger overlay active. You can also run sandbox mode (you control both teams) to stress-test specific scenarios.

### Every session (build/iterate cycle)
Open AI editor → add/remove/reconfigure nodes → test in sandbox → deploy to campaign or ranked. Campaign opponents are drawn from real multiplayer data (real player AIs with ELO ratings), so the test environment is genuinely adversarial. Session ends when you've beaten a campaign stage or submitted a new config to ranked.

---

## The Behavior Tree Editor

### Architecture
Each bot has exactly one behavior tree — an inverted tree with a root node at top. The bot evaluates depth-first, **counterclockwise** (children ordered anti-clockwise from 12 o'clock position). This ordering determines priority: earlier-branching conditions execute first.

### Node Types

| Node | Shape | Behavior |
|------|-------|----------|
| **Root** | Starting point | Entry; contains AI name |
| **Action** | Rectangle | Executes action (move, attack, grab); **stops evaluation immediately** when valid |
| **Condition** | Oval | Gate: if valid, traversal continues into children; if invalid, backtracks to next sibling |
| **Connector** | Diamond | Always valid; splits one connection into many for visual clarity |
| **Sub-AI** | Reference | Embeds another named AI as reusable module; nestable recursively |

### The Query Model
Every action and condition node is a **database query against the world state**. Three parameters:

1. **Target type:** Myself / Ally / Enemy / Ally base / Enemy base / Resource
2. **Target filters:** Narrow the entity list. Filters within same category = OR. Different categories = AND. Any filter negatable individually. Examples: "at short range from me," "bot class = Sniper," "tagged with tag 3," "carrying a resource"
3. **Target selector:** One entity from filtered list by criterion. Options: closest/furthest from me, closest/furthest from borders, weakest/strongest health, weakest/strongest shield, weakest/strongest (health+shield), any (all remaining), all (for counting/tagging)

**Human-readable auto-generation:** The UI generates a sentence below configuration: *"Attack the closest enemy Machine Gun at short range that is tagged 2."* No syntax learning required.

### Logic Composition
By nesting conditions:
- **A AND B**: B nested under A
- **A OR B**: A and B as siblings of same parent
- **NOT A**: Invert checkbox on condition node
- **A XOR B**: Composable from the above primitives

**Critical edge case:** The invert flag only inverts the condition check, NOT whether the target was found. If no valid target exists after filtering, the node is invalid regardless of invert. This is a subtle distinction that traps intermediate players.

### Working Memory: Tags and Counters
**Bot-private tags (1–5):** Each bot can tag entities it interacts with. Tags persist on the entity even if the entity is picked up. Used for focus-fire coordination, resource claiming, target-of-record marking.

**Team tags (A–E):** Shared across all allied bots. Enables leader-follower patterns. Critical caveat: tag visibility depends on instantiation order. If the "leader" doesn't have the highest instantiation priority, its team tags won't be visible to other bots until the next tick. A subtle failure mode.

**Counters:** Persistent integer variables. Used for stateful behavior: "switch strategy when fewer than 2 allies alive." Count how many of X have happened; compare against threshold. The deepest meta-programming tool in the system.

### Information Delay
All bots act on **last-turn data** (0.025 seconds ago). Health, shield, range — all from the previous turn's frozen snapshot. Tags and counters update immediately during evaluation. This means:
- A bot targeting an entity that died 0.025s ago may fire at empty space
- Tag-based coordination works slightly faster than health-based coordination
- Advanced players must account for the delay when designing reaction sequences

**No fog of war.** All entities and positions visible to all bots at all times. Everything is a query against the global state. This is a deliberate accessibility choice — it removes the scouting meta entirely.

### Determinism
Gladiabots is **fully deterministic**. Maps are always symmetric. Given identical team setups and AIs, a match always produces identical results — including hits/misses, because "hit chance" is seeded. This makes debugging tractable. If your AI failed at scenario variant #47, you can reproduce and step through that exact scenario.

### Node Count Limit
500 nodes per bot in campaign and ranked. Unlimited in sandbox. Tournament organizers can set custom limits. The 500-node ceiling forces eventual modularity via sub-AI patterns.

---

## The Debugging Sub-AI Pattern
The most important community-developed practice: create a **debugging sub-AI** that contains only condition nodes showing the bot's current sensing state (own health/shield, enemy classes in range, current target attributes). Link this as the very first node from root so you can read the bot's situational awareness at a glance during any match replay.

During a match, the debugger overlay shows: green checkmark (node valid/succeeded), red X (failed/invalid), translucent (not reached). Color-coded lines connect each bot to its current action target on the battlefield. You can read the AI's decision logic spatially while watching combat spatially — two layers of information superimposed.

---

## Visual UI Description

**Canvas:** Dark background 2D canvas. Root node sits top-center. Nodes branch downward and outward. Color-coded by type. Each node has a small icon (footprint for move, crosshairs for attack, hand for grab, colored squares for tags).

**Links:** Directed arrows from bottom of parent to top of child. Multiple children fan left-to-right below parent. Counterclockwise traversal order = leftmost branch = highest priority.

**Node configuration panel (press E or double-click):** Row of icons for target type → filter category checkboxes → selector dropdown → invert checkbox. Text auto-generates as the sentence below. Pure icon-and-checkbox. Zero syntax.

**AI library:** Players maintain named AI files. Community naming conventions: prefixes for main/test/sub/deprecated, class abbreviations (SN=Sniper, SG=Shotgun, AS=Assault, MG=Machine Gun), version numbers. Managing the library becomes its own organizational challenge at depth.

**Match replay view:** Same canvas with debugger overlay. Green/red/translucent nodes showing current evaluation state. Battlefield bots have colored lines to targets. Pause, step forward, or let it play at 1x/2x/4x speed.

---

## Information Management Mechanics

**Sensor model:** Global omniscience. Every bot sees every entity everywhere. Range filters in queries exist, but they express *intent* (attack entities AT short range), not *sight* (I can only see things at short range). A bot can still target a specific enemy at long range if you configure that.

**Information lag:** Last-turn frozen snapshot. 0.025 seconds delay. For most decisions, irrelevant. For split-second flanking sequences, potentially meaningful.

**Tags as the primary attention-direction mechanism:** The closest Gladiabots has to an "information architecture" is tags. Designating targets, coordinating focus fire, claiming resources — all done through tags. The five bot-private + five team tags create a 10-bit information channel between bots (treated as flags, not structured data).

**No scouting meta.** In StarCraft, information is the primary resource. In Gladiabots, information is free — everyone knows everything. This makes the game about *behavioral logic*, not *information architecture*. This is the core design choice that Robot Uprising reverses.

---

## Multiplayer Mechanics

### Async Ranked
Two players matchmade → each independently deploys → server resolves → push notification → either player watches replay → ELO/XP credited. No scheduled match time. No online presence required simultaneously.

### Game Modes
- **Collection (4v4):** Grab resources, deposit at base
- **Domination (6v6):** Hold control points
- **Elimination (8v8):** Destroy all enemies

Each mode has separate ELO. Total league standing = sum of three mode scores.

### Ranking System
ELO-based. 7 leagues: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster. K-factor decreases as score rises (K=50 below 1000 → K=20 above 2000). Campaign opponents drawn from real multiplayer data (minimum 10 games played, appropriate ELO range).

### The Rock-Paper-Scissors Meta
The wiki explicitly documents non-transitive strategy relationships: resource strategy beats defensive, defensive beats aggressive, aggressive beats resource. At the same ELO, matchup winrates can be 70/30 — which feels unfair without knowing what the opponent is running. This is the multiplayer game's deepest design problem: the meta is non-transitive but you can't see what you're playing against until you watch the replay you just lost.

### Tournaments
Organized through Toornament platform. Organizers set: game mode rotation, map seeds, team sizes (1–20 bots), node limits, respawn settings, class restrictions. Best-of-3 format standard. Automatic result sync via developer-provided Tampermonkey script. This scaffolding for community tournaments is an underappreciated feature — it enables a meta-game layer the developer doesn't need to maintain.

---

## Complexity Introduction Over Time

**Chapter 2, Level 1 = ELO 1000. Chapter 20, Final Stage = ELO 2890.** Gradient is 100 ELO per chapter, 10 ELO per level. Linear difficulty progression. Campaign advances by unlocking access to higher-ELO real player AIs.

**Information about opponents decreases over time.** Early chapters: full pre-battle briefing describing the enemy AI's strategy. Later chapters: no briefing — diagnose enemy behavior from observation alone. This shifts the learning from "execute what I'm told" to "diagnose and adapt."

**Complexity depth by skill tier:**
- **Beginners:** Simple priority-list behavior. "Attack nearest enemy. If health below 50%, retreat."
- **Intermediate:** Context-sensitive filters and selectors. "Attack the weakest-shield enemy only if 2+ allies are nearby."
- **Advanced:** Tags for focus fire, leader-follower coordination, resource claiming. Team tags for synchronized multi-bot action.
- **Expert:** Counters for stateful strategy adaptation. The "how many allies are alive" switch. Debugging sub-AI patterns. Sub-AI modularity for complex trees.

**Team composition restrictions:** Machine Gun, Shotgun, Sniper ≤35% of team. Assault uncapped. Forces composition diversity.

---

## Community Reception

**What players love:**
- The "build → deploy → watch → iterate" loop is deeply satisfying. The moment your AI executes your intention exactly as intended is cited repeatedly as the primary hook.
- **Accessible:** No syntax, no compiler errors, no prior programming knowledge. Steam tag "Education" signals players see genuine learning value.
- Sandbox mode (control both teams) is excellent for rapid testing. The best tool the game has for skill development.
- Async multiplayer is low-pressure. Compete at your own pace with no real-time schedule dependency.
- Metro UK: 9/10 — "depth and complexity that will keep the right kind of stubborn logician busy for months"
- Gamersky: 8/10 — "rich content for players to show their talents in logical thinking"

**What players criticize:**
- Active multiplayer population is very small. Async system means waiting for matches that may not come.
- Average playtime under 2 hours suggests many players bounce before the complexity hooks them. The gap between "watching bots move randomly" and "constructing a purposeful AI" may be too wide.
- No fog of war = no scouting/information meta. Simplifies strategic decisions compared to real RTS.
- Android version is a limited demo without IAP unlock — barrier to mobile community growth.
- Rock-paper-scissors meta creates 70/30 matchup ratios that feel unfair without meta-knowledge.
- Technical debt: some reports of login issues, version bricking in old replays.

---

## Player Journeys

#### Journey: Kenji, 28, Software Engineer, Never Played Strategy Games

**Context:** Downloaded Gladiabots after seeing a Reddit post comparing programming games. Has played TIS-100 but found it too abstract. Started the Collection campaign 30 minutes ago.

**Minute 0:00 — The First Tree**
The screen shows a dark canvas with one node: ROOT. A tutorial tooltip explains: "Click the + button to add your first action." Kenji clicks. A node picker appears — icons with text labels: MOVE, ATTACK, GRAB, SCORE. He picks ATTACK. A rectangle appears below ROOT with an attack crosshair icon. Another tooltip: "Configure the target."
He presses E. A panel slides in from the right. Target type row: icons for Self, Ally, Enemy, Base, Resource. He clicks Enemy. A filter section appears below, but he ignores it. Selector: he picks "Closest." The panel auto-generates text at the bottom: "Attack the closest enemy."
He deploys. Two of his four bots immediately run toward the enemy base and die to the whole enemy team. Two others walk in circles because their ATTACK nodes found no valid target close enough and they had no fallback.
*Kenji: "Okay, they need to do more than one thing."*

**Minute 1:30 — The Priority Revelation**
He adds a MOVE node above the ATTACK node and configures it: "Move to closest enemy." Now bots move toward enemies, then attack when in range. Better. But they never retreat when dying.
He adds a condition node above both: "If my health < 30%, retreat." Places MOVE (to ally base) under the condition. Places ATTACK below that (now a fallback if health is fine).
He deploys. His bots now fight and retreat when wounded.
*The counterclockwise traversal clicks: the tree is a priority stack. What's "left" in the tree is "first" in priority.*
*Kenji: "Oh. It's like an if-else chain. But visual."*

**Minute 4:00 — The Flanking Discovery**
He loses to an enemy bot that has a sniper. His bots keep trying to ATTACK the sniper at short range but never get close enough.
He adds a Condition node: "Enemy Sniper at long range?" Under it: MOVE to "Closest enemy Sniper" (not just "move toward enemy"). Under another branch: normal ATTACK logic.
Deploys. His assault charges the sniper specifically while others engage the main body. The sniper falls first.
*Kenji: "Oh. I can prioritize target types. Each branch is a different specialized behavior."*
*He opens the ATTACK node again and notices the filter list he ignored earlier: bot class, health %, range, tag, carrying resource. Each filter is one constraint. He can combine them.*
*Kenji doesn't close the game for two more hours.*

**Minute 45:00 — The Tag Breakthrough**
He's stuck on Chapter 5, where enemy bots all focus-fire one of his bots while his bots spread damage across all enemies. He reads the wiki: tags. He has his "leader" (first instantiation) tag the enemy with the lowest health using Tag 1. Other bots ATTACK "enemy tagged 1." Everyone focuses the same target.
He deploys. Three bots collapse onto the same enemy in sequence. The enemy team loses its strongest bot in two seconds.
*Kenji: "This is an attention coordination mechanism. I gave all my bots shared focus using one signal."*
*This is the moment the game becomes something else. The tree stopped being a bot's brain and became a multi-agent coordination protocol.*

**UI Annotations:**
- **ROOT node**: Distinct colored node at canvas top-center. Label shows AI name. Can't be deleted.
- **+ button**: Appears on empty canvas or on any node with free child connections. Opens node type picker.
- **Node picker**: Modal with large icons and labels. Hover shows tooltip with behavior description.
- **E key shortcut**: Opens configuration panel for selected node. Panel slides in from right.
- **Configuration panel**: Target type row (5 icons), filter section (expandable by category), selector dropdown, invert checkbox. Auto-generated sentence at bottom updates as you configure.
- **Deploy button**: Fixed position top-right of editor. Triggers simulation. Locks editing during match.
- **Sandbox mode**: Toggle in top toolbar. Enables controlling both teams simultaneously. No ELO impact.

---

#### Journey: Priya, 35, Stay-at-Home Parent, Casual Gamer (Slay the Spire, Stardew Valley)

**Context:** Day 3. Has beaten campaign chapters 1–4 in Collection. Never played a "programming game." Describes herself as "not technical." Currently trying Chapter 5 Mission 3 for the fifth time.

**Minute 0:00 — The Frustration State**
She opens the AI editor for her main assault bot. The tree has 18 nodes — more than she planned, accumulated through trial and error. She doesn't fully understand why several branches are there, but removing them seemed to make things worse, so she left them.
*Priya: "It's a mess. I know there's something wrong but I don't know what."*
She clicks the debug button and replays her last failed match. The overlay shows — in real time — which nodes are green-checked and which are red-Xed. She watches her assault bot's tree light up: the retreat condition triggers... but the bot doesn't retreat far enough before being killed. The MOVE node under retreat is "closest ally base" but her base is at the far corner.
*Priya: "Oh. It's retreating to the wrong place."*

**Minute 2:00 — The Repair**
She changes MOVE to "closest ally bot" instead of "ally base." Now wounded bots cluster near healthy allies for psychological safety (she anthropomorphizes: "they go to a friend").
Deploys. Bots now retreat toward the cluster, the cluster moves forward to support. It looks like a proper tactical formation.
*Priya: "They look smarter. They look like they know what they're doing."*

**Minute 5:30 — The Anthropomorphization Loop**
She watches the replay and narrates: "That one — that's Derek, he's the aggressive one — Derek went too far forward and got surrounded. His retreat triggered but then he got cut off."
She starts thinking of her bots as characters with personalities. Derek's tree is "brave but reckless." The sniper's tree is "cautious." She adjusts Derek's retreat threshold from 30% health to 50% health. "Derek is learning to be more careful."
*This is a profound engagement pattern: the tree becomes a characterization system. Mechanical changes are character growth.*

**Minute 12:00 — The Victory Replay**
She beats Chapter 5 Mission 3. The auto-save replay plays without her pressing anything. She watches it four times. She screenshots the final moment — three bots simultaneously depositing resources — and texts it to her husband with: "I programmed them. They did this themselves."
*Priya: "It feels like raising something. It feels like I taught them."*

**UI Annotations:**
- **Debug overlay**: Single button top-left during match view. Toggles color-coded node states and target lines.
- **Match replay auto-play**: After mission resolution, replay plays immediately. Skip button available.
- **Bot naming**: Bots show default class names. Community practice: rename in AI editor heading. Game doesn't have bot-specific naming UI — names come from the AI file name.
- **Health threshold slider**: When configuring a condition with health comparison, a slider sets the % value with live preview of the comparison text.
- **Green highlight path**: During active replay, the "hot path" (most recently valid nodes) highlights in brighter green. Inactive paths dim.

---

#### Journey: Marcus, 19, Competitive Gamer (StarCraft, Chess.com), Playing Ranked

**Context:** Reached Gold league after two weeks. Has studied the wiki extensively. Knows the rock-paper-scissors meta and wants to build a strategy that can beat all three approaches. Currently at 1620 ELO across all three modes combined.

**Minute 0:00 — Meta-Analysis Session**
Marcus has the stats site open in a second monitor (stats.gladiabots.com). He's looking at his match history: 7 wins, 3 losses this week. All 3 losses were to resource-farming strategies — opponents who ignored his bots entirely and just scored fast.
He opens his Elimination AI. His current strategy: aggressive flank-and-kill. Beats defensive and aggressive opponents. Loses to resource runners.
*Marcus: "I need a conditional meta-strategy. Read what they're doing at second 5 and switch trees."*

**Minute 3:00 — The Dynamic Strategy Problem**
He wants a condition: "If enemy bots are ignoring me (not attacking), switch to resource-runner mode." But Gladiabots has no "is the enemy ignoring me" condition. He searches the wiki. Nothing.
*He invents an approximation: "If I am not currently under attack (no enemy within attack range of me), assume they're running. Switch to resource grab."*
The condition: ATTACK_RANGE_OF_ME filter set to Enemies, with Invert. Interpretation: "If there are 0 enemies trying to attack me right now." Under this condition: GRAB resource → SCORE resource loop.

**Minute 8:00 — The Counter-Counter Problem**
He realizes the enemy resource runner might trigger this condition too early (before the opponent has committed). He adds a counter: increment on every tick where there are 0 enemies attacking me. Switch strategy only when counter > 20 (5 seconds). A debounce mechanism.
He deploys against himself in sandbox (both teams controlled, same AI for both). The counter logic works. After 5 seconds of no engagement, bots switch from fight to resource mode.

**Minute 15:00 — The Match Result**
He submits. Three ranked matches queue. He gets notifications over the next two hours. Two wins (aggressive and defensive opponents). One loss (opponent's resource runner was faster — he wasn't patient enough to grab resources efficiently).
*Marcus: "The approximation works 2/3. I need a better proxy for 'opponent is ignoring me.' Maybe team tag on the resource instead of me?"*
*He opens the wiki. Reads the team tag instantiation caveat. Realizes leader tag might not propagate fast enough to matter. Makes a note: "Try counting friendly tags placed on resources per N ticks — high count = we're already in resource mode."*

**UI Annotations:**
- **stats.gladiabots.com**: External site; no in-game integration. Match history, ELO trend graphs, win/loss by game mode.
- **Counter node configuration**: Text field for variable name, dropdown for increment/decrement/set/compare operators, numeric threshold input.
- **Sandbox mode bilateral control**: Editor switches to two-panel view — left team AI editor, right team AI editor. Deploy button triggers simulation of both simultaneously. Step-forward button available for tick-by-tick inspection.
- **Async match notification**: OS push notification (or email). Subject: "Your match in [mode] vs. [opponent username] is ready to watch." One click opens game directly to replay.
- **ELO change display**: After watching match to result screen, brief animation: current ELO → new ELO, with delta (+18 or -12) in green/red.

---

## Strengths and Weaknesses

### What Gladiabots Does Well

**The no-code visual programming paradigm works.** 88% positive reviews and educational reception prove it. The query model is expressive enough for real strategic depth without requiring any syntax. The node editor is polished and functional. This paradigm is proven accessible.

**Asynchronous PvP is the right model for a low-population game.** You can enjoy meaningful competitive play without requiring 1000 concurrent players. The async model lets the game survive a small community better than any synchronous multiplayer could.

**Determinism is a debugging gift.** When your strategy fails, you can reproduce exactly why. This makes the learning loop tractable. Stochastic games hide their own failure modes; Gladiabots exposes them.

**Community-developed practices add depth.** The debugging sub-AI pattern, naming conventions, sub-AI modularity — these emerged from community and represent genuine mastery layers the developer didn't explicitly design.

**The sandbox dual-control mode is the game's best tool.** The ability to play both sides simultaneously makes strategy testing fast and precise. No waiting for async matches when you need to validate a specific counter-scenario.

### What Gladiabots Gets Wrong (for Robot Uprising)

**No fog of war = no information architecture.** This is the biggest departure from Robot Uprising's premise. Gladiabots's query model is about *behavioral priority*, not *attention allocation*. The player never thinks about what their bots know. Everything is omniscient. Robot Uprising's core tension — limited context windows, attention as a scarce resource, what you choose to sense — is completely absent.

**Instruction persistence without player control.** When a bot commits to an action for 10 turns, that's a fixed engine constant. The player can't tune it. In Robot Uprising, the duration of attention commitment (how long an agent pursues a target before re-evaluating) is potentially a configurable property.

**Tags as working memory are too thin.** Five private + five team tags = 10 bits. No structure. No decay. No fidelity gradient. No ability to store more than a flag. Robot Uprising can make the working memory richer — structured signals, fidelity, staleness, eviction.

**The invert edge case is a trap.** "Invert only inverts the condition, not the result of no-target-found" is a subtle rule that trips intermediate players repeatedly. It's a papercut in an otherwise smooth UX — a case where the underlying model leaked through abstraction.

**Campaign difficulty is linear and mathematical.** ELO-stepped opponents are consistent but mechanical. There's no designed failure moment — no "ah-ha" mission that breaks a naive strategy to teach a specific concept. Gladiabots's campaign is a grind, not a curriculum.

**Rock-paper-scissors meta is undiscoverable without the wiki.** The non-transitive strategy relationships aren't surfaced to players. You just lose to resource runners without knowing why. The game needs a meta-map.

---

## Interaction Effects with Robot Uprising Design Space

**Building block paradigm (Wave 3):** Gladiabots proves the behavior tree paradigm is viable and accessible at commercial scale. But it works because all bots are omniscient — the tree doesn't need to reason about "what does this agent know right now?" In Robot Uprising, the context buffer is an additional constraint that changes which actions are valid: a bot can only ATTACK an enemy it has in its buffer. The tree must reason about knowledge, not just priority.

**Buffer model (Wave 2):** Gladiabots has no buffer. Every condition is a live global query. Robot Uprising's buffer is the radical departure — you configure what gets stored, for how long, and what gets evicted. The Gladiabots tree can be thought of as querying a buffer with infinite size and zero eviction. Robot Uprising compresses that infinite buffer to 5–20 slots.

**Information types (Wave 2):** Gladiabots's information is flat: entity class, health %, shield %, range, tag flags. Robot Uprising can enrich this: signal fidelity (does it degrade?), signal age (how stale?), signal source (trusted ally relay vs. enemy-intercepted chatter), signal type (threat/terrain/orders/rumors).

**Hooks (Wave 3):** Gladiabots has no hooks. Bots communicate only via team tags. Tags are 1-bit flags, not typed signals. Robot Uprising's hook system — "when ally fires, increment my urgency counter" — is an expressive reactive layer that Gladiabots entirely lacks. The hook system is the differentiator that enables the multi-agent coordination patterns Gladiabots achieves only clumsily through tag conventions.

**The meta-level (Wave 2):** Gladiabots has no command agents. No bot can reconfigure another bot's tree. No hierarchical delegation. The meta-level — "agents managing the architecture that manages agents" — is Robot Uprising's biggest expansion beyond Gladiabots's model.

**Async multiplayer (Wave 7):** Gladiabots's async PvP model is directly applicable. Small population = sync multiplayer is dead. Async = viable with dozens of active players. Robot Uprising's Gauntlet mode (see 1.04f) should be async-native from day one.

**Debrief (Wave 4):** Gladiabots's debugger overlay (green/red node states during replay) is the gold standard for behavioral transparency. Robot Uprising's debrief (see 4.04a) needs this layer — but extended to show buffer states, hook activations, signal ages, and eviction events. The Gladiabots debugger shows *what happened*; the Robot Uprising debrief must show *why the agent knew what it knew* when it decided.

---

## Comparable Games

| Game | Point of Comparison |
|------|---------------------|
| Gladiabots | Behavior tree PvP — this file |
| Screeps | The async PvP endpoint (code-based) — 1.04f |
| Robocode | Java-based robot combat (older, less polished) |
| Algobots | Visual node programming for tank combat (2016, smaller) |
| CodinGame | Code-based AI competition (requires syntax) |
| TIS-100 | Constraint-based programming puzzle (single player) |
| Human Resource Machine | Visual programming (single player, no strategy) |
| Teamfight Tactics | Autobattler — plan then watch, no behavior programming |

Gladiabots is unique: the only visual-programming competitive AI game with a significant commercial release. Everything else either requires real coding or isn't PvP.

---

## Sensory Description

**The editor:** Dark background, almost black (#1a1a2e). Node rectangles have a subtle gradient — darker at top, slightly lighter at bottom. Connections are thin white lines that curve slightly as they leave the bottom of a parent and enter the top of a child. When you hover over a node, a soft blue outline appears. When you select a node, the outline becomes a bright cyan, and the configuration panel slides in from the right with a smooth 200ms ease.

**The configuration panel:** White text on dark background. The target type row uses large vector icons — self is a circular person silhouette, enemy is a crosshair, resource is a box. Selected type highlights in the game's accent blue. The auto-generated sentence at the bottom uses a slightly larger font — this is what you've just written, rendered legible.

**The match replay:** The battlefield is a top-down view. Robots are color-coded — your team in blues/purples, enemy in reds/oranges. The arena is flat, dark grey ground with subtle grid lines. When the debugger overlay is active, colored lines radiate from each bot to its current target. Valid nodes glow softly green in the tree; invalid nodes pulse a muted red. The effect is like watching a web of decisions visualized as light filaments — each bot's focus rendered as a beam.

**The victory moment:** Match result screen. Dark background. Team names on left and right. Win/Loss text in large clean type. ELO change animates — your number ticks upward. A brief particle effect: small hexagon shapes dispersing outward from the ELO number. The sound: a soft ascending three-note chime.

**The defeat moment:** Same screen. ELO ticks downward. No particle effect. A single low tone. Then silence. The game waits for your next action without comment. No rubbing it in. No comforting message. Just the number.

---

## The TikTok Clip

The 15-second hook:

A 4-bot squad deploys. Three bots charge forward in a diamond formation. The fourth — a sniper — holds position at the back-left. The enemy team splits to engage the three. The sniper raises — a visual lock-on line appears — and fires. The enemy sniper goes down in one hit, shield depleted. The remaining two enemies are now outnumbered.

The clip cuts to the behavior tree. The "hot path" illuminates in sequence: Condition (no ally in danger) → HOLD POSITION. Condition (enemy sniper at long range) → Target (weakest shield sniper) → ATTACK. Green light cascades down the path.

The clip cuts back to the battlefield. Sniper fires again. Enemy shotgun falls.

Text overlay: "I programmed the AI. I never touched a button during the fight."

That's the TikTok clip. The same emotional payload as Besiege — the player's creation working exactly as designed. The tree overlay makes it legible to non-players: you can follow the logic even if you don't know the game. The moment of "I designed the mind behind that action" is reproducible and shareable.

---

## New Aspects Discovered

Adding to frontier:

- **1.06a — The debugging sub-AI pattern:** Community-developed diagnostic layer (condition-node-only sub-AI linked at root to display current sensing state); how Robot Uprising designs this in from the start rather than letting it emerge as a workaround; what the "always-on diagnostics sidebar" looks like in a workbench-native implementation
- **1.06b — Visual query model as attention language:** Gladiabots's target-type + filter + selector structure is effectively a declarative attention specification language; how Robot Uprising extends this with buffer-awareness (can only query what's in the buffer), fidelity metadata, and signal age
- **1.06c — Asynchronous PvP as design constraint:** The async match model is not just a feature — it's an architectural prerequisite for a small-community PvP game; how match structure (deploy once, watch once, iterate) shapes design at every layer; what Robot Uprising gains and loses vs. a synchronous mode
- **1.06d — The Gladiabots meta-visibility gap:** Non-transitive strategy relationships (resource beats defensive beats aggressive beats resource) that players can't see until they've lost to them; design options for surfacing the meta: explicit counter-strategy hints, meta-map visualization, post-match strategy classification; does Robot Uprising want transparent or opaque meta-knowledge?
- **1.06e — Anthropomorphization as engagement hook:** Players naming bots, narrating their personalities, framing mechanical changes as character growth — this is a discovered engagement layer in Gladiabots that was not explicitly designed; how Robot Uprising designs for it deliberately (unit portraits, persistent bot identities, mission memory, named bot achievements)

---

## 1.06e — Anthropomorphization as Engagement Hook

**Aspect:** How players project personality onto autonomous agents, and how Robot Uprising can design for this deliberately rather than leaving it emergent.

---

### The Phenomenon: Why Players Name Their Bots

In Gladiabots, every bot is mechanically identical within its class. A Sniper is a Sniper — same stats, same actions, same hitbox. The only difference is the behavior tree the player assigns. Yet community forums reveal players consistently narrating personality onto their bots: "my flanker always panics when outnumbered," "the medic refuses to retreat even when I've built retreat logic," "Snipy has trust issues — won't engage unless three allies are visible." This is not a bug. It is the most powerful engagement mechanic in the game, and it was never explicitly designed.

The root cause: **behavior trees produce legible, repeatable behavioral patterns that humans instinctively interpret as personality.** A bot that always retreats at low shield "feels cautious." A bot that rushes forward regardless "feels brave." The player knows these are mechanical consequences of their own configuration, but the emotional interpretation happens anyway — the same way we anthropomorphize Roombas getting stuck under chairs.

**What Gladiabots does deliberately:** Almost nothing. Bots have named AI configurations ("Scout Behavior v3"), but the bots themselves are visually identical within a class. No portraits, no persistent names, no kill counters, no battle scars. The entire anthropomorphization layer is player-projected, community-sustained.

**What Gladiabots misses:** Because bots are anonymous, the community's attachment is fragile. A bot that performed heroically in one match is indistinguishable from any other bot of the same class in the next. There's no "legendary soldier" moment. The stories die between sessions unless the player actively retells them in forums.

---

### The Research: How Other Games Build Attachment

**XCOM's attachment formula** (from Tiago Costa's Game Developer analysis and Firaxis design postmortems): Five reinforcing mechanisms create deep soldier attachment —

1. **Customization** — Players name soldiers after friends, family, celebrities. But Costa's key insight: naming happens AFTER attachment forms, not before. Players customize because they already care, which deepens the caring further. The trigger is shared hardship, not naming.
2. **Character evolution** — Soldiers gain skills, ranks, nicknames. The player trims and shapes each soldier's build. "We try to create the perfect soldier." The development arc creates measurable growth players track obsessively.
3. **Scarcity & time investment** — Only 10-15 advanced troops at any time. Weeks of in-game training per soldier. Losing a Colonel represents enormous sunk cost.
4. **Emergent narratives** — A 91% shot missed. A 30% critical kill. A squad of rookies holding against impossible odds. These unscripted moments build individual soldier mythologies that are "personal to us only."
5. **Shared hardship** — The "brothers in war" effect. Overcoming brutal difficulty together bonds players to the units that survived alongside them.

**Dwarf Fortress's personality engine:** Every dwarf has procedurally generated beliefs (Law, Loyalty, Family, Friendship, Power, Truth), facets (Love, Hate, Envy, Cheer, Depression), preferences (favorite food, material, animal), and a multi-screen biography tracking their entire life history. The overwhelming majority of this data is never read by the player — but the data's *existence* enables emergent behavior differences that the player *does* notice. "Urist always picks fights at parties" is the player's interpretation of three interacting personality facets they never inspected directly.

**RimWorld's colonist storytelling:** Each colonist has backstories, traits ("Brawler," "Night Owl," "Depressive"), and dynamically forming relationships (romances, friendships, rivalries). Tynan Sylvester's key design insight: "Great non-scripted stories take place at the intersection of player agency and unpredictability." The trait system is just complex enough to produce surprising behavior without being so complex that behavior feels random.

**Fire Emblem's named permadeath:** Characters have authored backstories, support conversations that unlock through adjacency, and permanent death. The grid-based battles become "a tactical chess match with all the pieces having names and backstories." But Fire Emblem's weakness: deaths rarely impact the authored story, creating a disconnect between mechanical loss and narrative continuity.

**Tamagotchi's care bond:** Aki Maita's foundational insight: "I think it's very important for humans to find joy caring for something." She observed high-school girls with prototypes for weeks, optimizing for emotional attachment. The key design: the Tamagotchi's state is a *consequence of the player's attention*. A well-fed Tamagotchi "grows into a cute, happy cyber creature." A neglected one "grows into an unattractive alien." The causal link between care and outcome creates ownership.

**Screeps' naming tension:** Players discuss creep naming extensively on forums. Functional names ("repair-1234," "build-5678") are efficient but emotionally dead. Fun names create attachment but make debugging harder. Power Creeps — persistent hero units — were specifically designed with "more personality" because the community wanted units "that everyone knows you by." The persistent identity is the hook.

---

### The Robot Uprising Opportunity

Robot Uprising is uniquely positioned for anthropomorphization because its core mechanic — configuring agent attention systems — *literally produces behavioral personality.* A Scout configured with wide perception and aggressive hooks "feels curious and chatty." A Striker with narrow perception and minimal context "feels laser-focused and silent." A Relay with max buffer and compress skill "feels patient and methodical." These aren't metaphors — they're direct consequences of the player's configuration choices, read through the lens of human social cognition.

The game has five locked unit types (Scout, Striker, Relay, Specialist, Command) with distinct portraits and icons. But the locked design doesn't specify whether individual *instances* of these units carry persistent identity across missions.

---

### Five Design Models for Anthropomorphization

#### Model A: "The Anonymous Factory" (Gladiabots approach)

Units are interchangeable instances of blueprints. A Scout is a Scout. No names, no persistent identity, no memory between missions. The factory spawns them, they execute, they're gone.

**What this feels like:** Clinical. Efficient. The player thinks about *architectures*, not *individuals*. The factory metaphor is pure — units are products, not people. This aligns with the "you are an AI" narrative frame: an AI wouldn't anthropomorphize its own subroutines.

**Strengths:** Cleanest mechanical design. No naming UI to build. No attachment means no grief when units are eliminated — the player's emotional response stays focused on the *architecture's* performance, not individual loss. Reinforces the "information architecture, not combat" identity.

**Weaknesses:** Misses the most powerful engagement hook in comparable games. Sealed watch becomes purely analytical — "did my architecture work?" — without the emotional overlay of "is Scout-3 going to survive?" Community stories center on configurations, not characters. Streaming value drops significantly — audiences engage with named characters, not anonymous processes.

**The TikTok clip:** A factory produces scout after scout, each executing identically, each dying the same way. Cold. Mechanical. Compelling only for the architecture-minded.

#### Model B: "The Naming Ceremony" (XCOM approach)

Each unit spawned from the factory receives a procedurally generated name and a persistent identity within the mission. "SCOUT-Mayon" (named after Philippine volcanoes), "RELAY-Apo," "STRIKER-Pinatubo." Names appear above units during sealed watch. Kill counts, signal relays processed, and context overloads survived are tracked per-unit during the mission.

**What this feels like:** Warmer. The sealed watch becomes personal — "Mayon is flanking left, she's about to see three enemies, her context window is almost full, she's going to overload—" The player narrates without being prompted because the name creates a handle for the narrative.

**Strengths:** Zero mechanical impact — names are purely cosmetic. Massive emotional engagement during sealed watch. Natural streaming vocabulary ("Mayon is down! Pinatubo has to solo the right flank!"). Player investment in sealed watch quality increases because units have identities to root for. Philippine geography naming scheme reinforces the setting.

**Weaknesses:** Names reset per mission — no cross-mission attachment. If the factory spawns 8 Scouts from the same blueprint, 8 different names dilute identity (which one is "my" scout?). Risk of attachment to individual units distracting from architecture-level thinking.

**The TikTok clip:** "SCOUT-Mayon spots three enemies. Her context window fills. She transmits. The signal reaches RELAY-Apo just as STRIKER-Pinatubo arrives. One tick. Three kills. Mayon never saw the fourth enemy behind her."

#### Model C: "The Persistent Roster" (Fire Emblem approach)

Units persist across missions. SCOUT-Mayon, spawned in Mission 5, carries forward with a service record: missions survived, total signals transmitted, context overloads endured, enemies tagged, kills assisted. Portraits in the Blueprint Codex show individual unit records. Units that survive many missions earn visual distinctions — battle scars rendered as circuit-board cracks, antenna modifications, chassis weathering.

**What this feels like:** Deep attachment. Players develop favorites. "Mayon has been with me since the Ifugao mission. She's survived six battles. She's my best scout." The service record transforms mechanical history into narrative significance.

**Strengths:** Maximum emotional engagement. Cross-mission narrative continuity. Natural difficulty: losing a veteran unit means losing accumulated narrative weight (even if mechanically identical to a replacement). Community sharing of legendary unit stories. The Blueprint Codex becomes a trophy case. Visual wear-and-tear rewards longevity.

**Weaknesses:** Conflicts with factory production model — if the factory spawns 3 scouts per mission, which ones persist? If all persist, the roster balloons unmanageably. If only survivors persist, there's a favored-few problem. Mechanical attachment creates save-scumming pressure (retry to save Mayon). Most critically: **the game's core thesis is "think about architectures, not individuals"** — persistent rosters push players toward individual unit attachment, which is the opposite direction.

**The TikTok clip:** SCOUT-Mayon's service record scrolling like an end-credits sequence. Mission count climbing. Signal count in the thousands. Then: "Mission 9 — Taal Volcano. ELIMINATED tick 23." Silence. Empty portrait slot.

#### Model D: "The Named Blueprint" (Screeps Power Creep approach)

Not units, but *blueprints* carry identity. The player names their Scout blueprint "Mayon" and their Relay blueprint "Apo." Every Scout spawned from the Mayon blueprint inherits the name and personality — they're instances of a named *design*, not named individuals. The blueprint's service record tracks cumulative stats across all instances: total scouts spawned, average survival ticks, signal efficiency rating, overload frequency.

**What this feels like:** The player anthropomorphizes their *design decisions*, not individual units. "Mayon v3 is much more cautious than v2 — she actually retreats now." The name tracks the *evolution of the player's thinking* about that role. This is the closest to how real engineers talk about their systems: "our authentication service is paranoid" — they're describing the system's configured behavior as personality.

**Strengths:** Perfectly aligned with the "architecture, not individuals" thesis. Blueprint naming is natural (players will name blueprints anyway for organizational clarity). Version history creates a narrative of the player's learning arc. Community sharing uses blueprint names ("try my Mayon config — she's tuned for wide-perception stealth scouting"). Multiple instances of the same blueprint reinforce the "design" identity, not the "individual" identity. When a Scout dies, it's "a Mayon died," not "Mayon died" — the design persists, the instance is replaceable.

**Weaknesses:** Weaker individual attachment during sealed watch — watching five identical "Mayon" scouts is less narratively rich than watching five differently-named scouts. The blueprint-as-character metaphor is intellectually elegant but emotionally cooler than individual naming. Veterans who've played XCOM may feel the game is withholding something.

**The TikTok clip:** Blueprint editor. "Mayon v1 — too aggressive." Delete. "Mayon v2 — can't handle noise." Iterate. "Mayon v7 — she's perfect." Deploy. Watch. She works. Exhale.

#### Model E: "The Growing Personality" (Dwarf Fortress approach — RECOMMENDED)

**Named blueprints (Model D) as the primary layer, with emergent per-instance behavioral signatures as a secondary layer.** Here's how:

Each blueprint is player-named and carries persistent identity, version history, and cumulative stats. But individual unit instances, during a mission, develop a **behavioral signature** — a short auto-generated descriptor based on what actually happened during that mission's execution. The signature is generated from observable behavior: which rules fired most, which context entries dominated, what the unit's movement pattern looked like.

After a mission, the Inspector's unit detail panel shows:

> **SCOUT-Mayon #7** (instance 7 of the Mayon blueprint)
> *Behavioral signature: "The Perimeter Walker"*
> — Completed 14 patrol cycles (3× fleet average)
> — Transmitted 23 signals (highest in army)
> — 0 context overloads (clean run)
> — Survived

> **SCOUT-Mayon #8**
> *Behavioral signature: "The Sacrifice"*
> — Destroyed tick 18 (earliest in army)
> — Transmitted 4 signals before elimination
> — Final transmission triggered relay chain that won the match
> — Context window was 100% full at destruction

The same blueprint, the same configuration — but different starting positions, different enemy encounters, different timing produced two different "personalities" in the same mission. The behavioral signature is auto-generated, ephemeral (lives only in the debrief), and purely observational. It doesn't affect gameplay. But it gives the player a narrative handle for what happened.

**What this feels like:** The player names the *design* (blueprint), the *game* names the *performance* (instance signature). "I designed Mayon to be cautious, but Mayon #8 was The Sacrifice — she overloaded trying to warn everyone and died." The gap between intended behavior and emergent behavior is where the anthropomorphization magic lives. The player experiences their own design producing surprising personality — exactly the feeling of watching an AI you built do something unexpected.

**Strengths:** Combines architectural thinking (named blueprints) with emotional moments (named instances). Behavioral signatures emerge from the same chaos/sensitive-dependence system documented in 2.00i — the buffer-as-chaos-engine produces different behavioral outcomes from the same config. Signatures give streamers instant vocabulary ("The Sacrifice!" in the debrief gets a clip). The auto-generation means zero player effort for the naming. Signatures are discoverable — players learn to predict which configurations produce which signature archetypes. The gap between "what I designed" and "what happened" is the game's core teaching moment, and signatures make it narratively legible.

**Weaknesses:** Auto-generated names risk feeling generic or forced. The system needs enough behavioral analysis to produce good signatures — bad names break immersion worse than no names. Implementation complexity for behavioral classification. Risk of players optimizing for "cool signatures" rather than mission success (but this might actually be a feature — it's a secondary optimization axis).

**What this sounds like:** During sealed watch, units are identified by blueprint name and instance number ("Mayon-7, Mayon-8"). In the debrief, the behavioral signature appears with a soft chime — a single ascending tone for survivors, a descending minor chord for eliminated units. The signature text fades in over 1.5 seconds, handwritten-font style, below the unit's portrait in the Inspector panel. A unit that earned "The Sacrifice" gets a brief amber glow around its portrait — not celebration, just acknowledgment.

---

### Behavioral Signature Taxonomy

The auto-generated signatures draw from a classification system based on observable behavior during the mission:

| Pattern | Signature Examples | Trigger Criteria |
|---------|-------------------|-----------------|
| High signal output | "The Town Crier," "The Broadcaster," "The Alarm Bell" | Top 20% signal transmission count in army |
| Long survival | "The Survivor," "The Cockroach," "The Last Standing" | Survived while 50%+ of same type eliminated |
| Early elimination with impact | "The Sacrifice," "The Warning Shot," "The Canary" | Eliminated in first 25% of ticks AND final signal triggered chain reaction |
| Early elimination without impact | "The First Casualty," "The Unlucky" | Eliminated in first 25% of ticks, no significant post-death signal chain |
| Zero context overloads | "The Disciplined," "The Clean Buffer," "The Monk" | 0 overloads in a match where army average > 1 |
| Many context overloads | "The Overwhelmed," "The Drowning," "The Open Ear" | 3+ overloads, highest in army |
| High movement coverage | "The Perimeter Walker," "The Explorer," "The Wanderer" | Visited 40%+ of reachable grid cells |
| Stationary high throughput | "The Switchboard," "The Backbone," "The Hub" | Relay with 30+ signals compressed/filtered |
| Critical kill chain | "The Assassin," "The Closer," "The Finisher" | Striker whose action eliminated 2+ enemies |
| Failed engagement | "The Whiff," "The Confused," "The Misfire" | Striker who moved to engage but target relocated before arrival |
| Hack success | "The Infiltrator," "The Ghost," "The Lockpick" | Specialist who successfully hacked an enemy unit |
| Tagging champion | "The Cartographer," "The Painter," "The Marker" | Tagged 4+ map nodes or enemies |
| Command reassignment | "The Conductor," "The Architect," "The Puppeteer" | Command unit that issued 5+ reassignment/reroute actions |

Signatures compound: a unit that qualifies for multiple patterns gets a composite — "The Disciplined Wanderer," "The Sacrificial Broadcaster." Maximum two adjective-noun combinations to prevent absurdity.

---

### Interaction Effects

**× Blueprint Codex (locked):** Blueprint entries show aggregate signature distribution — "Mayon v7 produces 43% Perimeter Walkers, 22% Broadcasters, 18% Sacrifices, 17% other." This teaches the player what behavioral range their configuration actually produces. A configuration that produces 80% "The Overwhelmed" signatures has a context management problem — the signatures are a diagnostic tool disguised as a narrative feature.

**× Sealed Watch (locked):** During sealed watch, units show blueprint name + instance number only ("Mayon-7"). Signatures are assigned retroactively in the debrief. This preserves sealed watch purity — no spoilers about what a unit "is" until you've watched it perform.

**× Inspector (locked):** The behavioral signature is the first thing shown in the unit detail panel, above the context window chart and decision trace. It functions as a one-word summary of the unit's mission experience — click to expand into the full behavioral breakdown.

**× Sensitive Dependence / Chaos Engine (2.00i):** Behavioral signatures make the chaos engine's output legible. Two runs of the same config produce Mayon-7 "The Perimeter Walker" and Mayon-7 "The Sacrifice" — the signature difference is a human-readable encoding of the divergent execution paths documented in 2.00i.

**× Config Necropsy Culture (7.10):** Signatures become community vocabulary. "My Relay config keeps producing Overwhelmed signatures against rush compositions" is a more communicable problem statement than "my relay's context window fills up in high-signal-density scenarios." The signature is a shared diagnostic language.

**× Streaming/Content (locked):** Signatures are clip gold. A streamer watches sealed watch narrating in real-time, then the debrief reveals signatures: "OH, Mayon-8 was THE SACRIFICE?! She died on tick 18 but her signal won the whole match!" The reveal is a natural content moment.

**× Campaign Progression:** Signature vocabulary grows with the campaign. Missions 1-4 (pre-factory, few units) produce simple signatures. Mission 5+ (factory, many units) produces richer signatures as more behavioral patterns become possible. The signature taxonomy is a hidden progression system.

---

### Comparable Games: Attachment Through Autonomous Behavior

| Game | Attachment Mechanism | Identity Layer | Persistence | Lesson for Robot Uprising |
|------|---------------------|---------------|-------------|--------------------------|
| **XCOM** | Customization + shared hardship + permadeath | Individual soldiers with names/faces | Cross-mission (until death) | Naming alone doesn't create attachment — shared hardship does; sealed watch IS the shared hardship |
| **Dwarf Fortress** | Procedural personality + emergent behavior | Individual dwarves with beliefs/facets/biography | Permanent | Personality depth can be invisible — players only see behavioral consequences; most data is never read |
| **RimWorld** | Traits + dynamic relationships + authored backstories | Individual colonists with traits/skills/stories | Permanent | "Trait × situation = surprise" is the formula; Robot Uprising's version is "config × scenario = signature" |
| **Fire Emblem** | Authored characters + permadeath + support conversations | Pre-written characters | Cross-mission (until death) | Named characters without behavioral variety feel like chess pieces with hats |
| **Gladiabots** | Emergent behavior from behavior trees (undesigned) | Anonymous class instances | None | Players will anthropomorphize regardless — the question is whether you harvest this or ignore it |
| **Screeps** | Code-as-identity + persistent world + Power Creeps | Functional naming vs. fun naming tension | Session-length for creeps, permanent for Power Creeps | The naming tension (functional vs. emotional) IS a design space; Power Creeps prove persistent identity adds engagement |
| **Tamagotchi** | Care → consequence feedback loop | Single named pet | Permanent | The causal link between player attention and creature state creates ownership; Robot Uprising's version: config quality → unit behavioral signature |

---

### Player Journeys

#### Journey: Sofia, 15, first-time strategy game player

**Context:** Mission 6 (first factory mission with multiple Scouts). She's named her Scout blueprint "Diwata" (Philippine nature spirit) and her Relay blueprint "Balete" (banyan tree). She's about to deploy for the first time with multiple instances of the same blueprint.

**Minute 0:00 — The Factory Hum**
The factory UI shows Diwata in the production queue. Cost: 3 minerals. She drags Diwata into slots 1, 2, and 3. Three scouts. The ghost preview shows three identical cyan silhouettes on the board, labeled Diwata-1, Diwata-2, Diwata-3. She hasn't thought about the fact that they'll behave identically. She thinks of them as three different characters.

**Minute 0:30 — Sealed Watch**
Tick 1: Three scouts fan out from the factory. Diwata-1 heads northwest, Diwata-2 east, Diwata-3 southeast. Same patrol logic, different spawn timing, different enemy positions — different paths. Sofia immediately starts narrating: "Diwata-1 is brave, she's going straight toward the enemy spawner. Diwata-3 is playing it safe."

**Minute 1:45 — The Divergence**
Tick 22: Diwata-1 spots two enemies simultaneously. Her context window fills to 5/6. She transmits on the recon channel. Diwata-3, in a quiet sector, has a half-empty buffer and is calmly patrolling. Sofia watches Diwata-1's context bar turn amber. "She's stressed. She's got too much information."

**Minute 2:30 — The Loss**
Tick 31: Diwata-1's context overloads. She freezes for one tick — sparking jitter animation. An enemy striker moves adjacent. Elimination. Sofia gasps. Not "a scout died" — "Diwata-1 died."

**Minute 3:00 — The Debrief Reveal**
Inspector opens. Sofia clicks Diwata-1. The behavioral signature fades in below the portrait: *"The Canary."* Explanation: eliminated early, but final transmission triggered relay chain that alerted the army to the northwest flank. Sofia didn't see the downstream effect during sealed watch — the signature tells her the death mattered. She clicks Diwata-3: *"The Perimeter Walker."* Explanation: completed 11 patrol cycles, transmitted 8 signals, survived. Sofia smiles. "Diwata-3 is the careful one."

**Minute 4:00 — The Iteration**
She goes back to the workbench. She doesn't change the Diwata blueprint — she adjusts the listen/ignore filters in the Context Config. "Maybe if Diwata doesn't try to track everything, she won't overload." She's learning context window management, but she frames it as "helping Diwata be less anxious." The anthropomorphization IS the learning.

**UI Annotations:**
- Blueprint name field: 200px text input at top of blueprint editor, auto-saves, Philippine-character-set support
- Instance labels: "Diwata-1" in 10px font above unit during sealed watch, fades to 8px at 2× speed
- Behavioral signature: 14px italic text below portrait in Inspector, fade-in 1.5s, amber glow for eliminated units
- Signature tooltip on hover: 3-line behavioral summary with key stats

---

#### Journey: Marcus, 42, DevOps engineer and Factorio veteran

**Context:** Mission 8 (full system, complex architecture). He has 7 named blueprints, a command unit, and a sophisticated relay mesh. He's been playing for 6 hours total. His naming convention mirrors his professional Kubernetes namespace habits: relay-edge, relay-core, scout-flank, striker-primary.

**Minute 0:00 — Pre-Deploy Review**
Marcus opens the Blueprint Codex. He checks his relay-core blueprint's signature distribution from the last 4 missions: 62% "The Switchboard," 23% "The Backbone," 15% "The Overwhelmed." That 15% Overwhelmed rate bothers him. He opens relay-core's config. Buffer is 12 slots. Listen config accepts 4 channel types. He narrows it to 3. He's doing exactly what a DevOps engineer does: reading observability metrics and tuning the service.

**Minute 1:30 — Sealed Watch**
Tick 1-40: The architecture executes. Marcus watches relay-core-1 (his central relay) processing signals. Context bar pulses between cyan and amber — busy but not overloaded. He nods. "Relay-core is handling it." He doesn't say "the relay" — he says "relay-core," his name, his design.

**Minute 3:00 — The Cascade**
Tick 41: Enemy specialist hacks relay-core-1. It goes dark. The signal chain breaks. Downstream strikers lose intelligence. Marcus watches the cascade exactly as described in 2.00f-i: signal lines dissolve, downstream units drift on stale data. But his redundant relay-core-2 picks up within 3 ticks — the failover works. He exhales. "Relay-core held. Well, relay-core-2 held."

**Minute 4:30 — The Debrief**
Inspector. Relay-core-1: *"The Backbone"* — processed 47 signals in 41 ticks before hack. Relay-core-2: *"The Understudy"* — 3 signals in first 41 ticks, then 29 signals in remaining 19 ticks after failover. Marcus laughs. "The Understudy. That's exactly right." He screenshots the two signatures side by side and posts them in his team's Slack: "My relay failover architecture has better uptime than our prod Kafka cluster."

**Minute 6:00 — The Meta-Insight**
He opens the Blueprint Codex's aggregate view. Relay-core's Overwhelmed rate has dropped from 15% to 4% after narrowing the listen config. The signature distribution IS the SLO dashboard. He realizes he's been doing incident response and capacity planning for the last hour, but it felt like playing a game.

**UI Annotations:**
- Blueprint Codex signature distribution: horizontal stacked bar chart, one color per signature archetype, hover shows percentage and count
- Signature history: last 10 missions, sparkline of signature type distribution over time
- "The Understudy" signature: triggered by <20% throughput in first half, >200% throughput in second half (relative to army average)

---

#### Journey: Kwame, 28, Twitch streamer, 400 concurrent viewers

**Context:** Mission 9, streaming. He's named all his blueprints after Filipino mythological creatures: Tikbalang (Scout), Kapre (Striker), Duwende (Relay), Manananggal (Specialist), Bathala (Command). His audience loves the naming scheme and has developed favorites.

**Minute 0:00 — Pre-Deploy Chat Interaction**
Kwame opens the Blueprint Codex for stream. Chat sees Tikbalang's signature history: 55% "The Wanderer," 30% "The Canary," 15% "The Broadcaster." Chat erupts: "TIKBALANG DIES TOO MUCH" "PROTECT THE HORSE BOY" "buff tikbalang's buffer please." Kwame adjusts Tikbalang's context config on stream, narrating: "Chat says Tikbalang is too reckless. Let's give him better filters."

**Minute 2:00 — Sealed Watch**
The army deploys. Tikbalang-1 and Tikbalang-2 fan out. Chat is split-screen watching both. "Tikbalang-1 is going toward the enemy base!" "TIKBALANG-2 IS FLANKING!" The identical blueprint produces different paths. Chat assigns personalities in real-time: "Tikbalang-1 is the brave one" "T-2 is smart."

**Minute 3:30 — The Dramatic Moment**
Tick 38: Tikbalang-1 spots the enemy base. Context window: 5/6. He transmits. The signal chain lights up — colored dashed lines from Tikbalang-1 to Duwende-1 to Kapre-1. Chat: "THE CHAIN! THE CHAIN!" Tikbalang-1's context bar hits 6/6 — amber to red. Overload. Stun. One tick frozen. An enemy striker moves adjacent. Elimination. Chat: "NOOOOOO" "HE DIED FOR THE TEAM" "F" "F" "F."

**Minute 4:00 — The Debrief Reveal**
Kwame opens Inspector, clicks Tikbalang-1. The behavioral signature fades in: *"The Sacrifice."* Chat explodes. "CALLED IT" "THE SACRIFICE TIKBALANG" "clip that." Kwame clicks Tikbalang-2: *"The Perimeter Walker."* Chat: "boring" "safe boy" "tikbalang-2 didn't avenge his brother." The signatures give chat vocabulary, narrative structure, and emotional anchors — three things that make streaming content.

**Minute 5:00 — The Content Moment**
Kwame opens the Blueprint Codex. Tikbalang's updated signature distribution: Canary rate increased from 30% to 35%. He says to stream: "We keep sending Tikbalang to die. The stats don't lie. Either we fix the config or we accept that Tikbalang is a kamikaze scout." Chat poll: "FIX TIKBALANG" vs "EMBRACE THE SACRIFICE." 60/40 for sacrifice. Kwame toggles the listen config wider. "Chat has spoken. Tikbalang sees everything. Tikbalang dies for the cause."

**UI Annotations:**
- Streamer overlay: signature reveal animation lasts 2 seconds with custom sound (configurable in settings)
- Signature distribution chart: stream-friendly with high-contrast colors, 16px min font
- Chat-relevant elements: blueprint names visible during sealed watch, signature reveal has natural pause for reaction

---

#### Journey: Dr. Amara, 38, ML researcher and distributed systems expert

**Context:** Mission 10 (Taal Volcano, final boss). She has a meticulously documented spreadsheet tracking every blueprint version and its signature distributions across 9 prior missions. She treats the game as a hyperparameter tuning exercise.

**Minute 0:00 — The Hypothesis**
Dr. Amara opens the Blueprint Codex. Her Command blueprint "Matriarch" has a concerning pattern: 40% "The Conductor" (good — active reassignment), 35% "The Silent" (bad — no reassignment actions, indicating buffer was full of low-priority data preventing rule evaluation), 25% "The Overwhelmed" (bad — context overload). She hypothesizes: Matriarch's buffer is too permissive. She adjusts eviction priority to aggressively drop POSITION data (low-value for a stationary Command unit) and pinches the listen config to 2 channels instead of 4.

**Minute 1:00 — Deploy**
She deploys with the tuned Matriarch v12 and reviews her spreadsheet's prediction: if the hypothesis is correct, "The Silent" rate should drop below 15%. She needs 3-5 runs for statistical significance. She treats each mission execution as a trial.

**Minute 3:30 — The Run**
Matriarch-1 executes beautifully. Command reassignments fire on ticks 12, 19, 27, 35, 44. The army adapts fluidly to a two-front assault. No overloads on the Command unit. Dr. Amara watches the context bar stay green-to-amber, never red.

**Minute 5:00 — The Debrief**
Inspector. Matriarch-1: *"The Conductor."* Dr. Amara doesn't celebrate — one data point isn't significant. But she notes: 5 reassignments in 50 ticks = 10% action rate, up from the 4% average of previous versions. She opens the Codex. Matriarch v12's first signature. She'll run 4 more times before updating her spreadsheet and declaring the hypothesis validated or rejected.

**Minute 6:00 — The Teaching Moment**
She screenshots Matriarch v11 vs v12 signature distributions and prepares a slide for her lab meeting: "Bayesian hyperparameter tuning of an attention system, gamified." The behavioral signatures are her evaluation metric. The Blueprint Codex is her experiment tracker. The game is her research seminar's interactive demo.

**UI Annotations:**
- Blueprint version history: scrollable list with version number, date, signature distribution bar, and diff annotations ("v12: removed POSITION from listen, prioritize COMMAND in eviction")
- Signature distribution comparison: side-by-side bars for any two versions, difference highlighted
- Export: CSV export of signature distributions per version for external analysis

---

### Sensory Design

**Visual:** Behavioral signatures appear in 14px italic serif font (DM Serif Display — matching the locked font choice), below the unit portrait in the Inspector panel. Survivors get a soft teal text glow. Eliminated units get amber text glow. The signature fades in over 1.5 seconds, left to right, as if being typed. First appearance in a session gets a subtle paper-unfold animation.

**Audio:** Signature reveal plays a 2-note chime. Survivor signature: ascending major third (C→E). Eliminated signature: descending minor third (E→C#). The Blueprint Codex, when showing aggregate signature distributions, plays a very quiet ambient hum whose timbre shifts with the dominant signature type — high clear tone for "Conductor/Backbone" heavy distributions, lower warmer tone for "Sacrifice/Canary" heavy distributions. The player subconsciously associates sound with architectural health.

**Color:** Each signature archetype has a muted accent color used in the Codex distribution chart: Perimeter Walker (teal), Broadcaster (cyan), Sacrifice (amber), Overwhelmed (red-orange), Switchboard (lavender), Understudy (sage green), Conductor (gold), Silent (grey). These colors appear nowhere else in the UI — they're exclusively the signature palette.

---

### The Anthropomorphization Spectrum

Robot Uprising doesn't need to choose one model. The recommendation is **Model E (Growing Personality)** as the primary system, with a settings toggle for players who prefer **Model A (Anonymous Factory)**:

| Setting | Behavior |
|---------|----------|
| **Personality: On** (default) | Blueprint names + instance numbers during sealed watch, behavioral signatures in debrief, aggregate distributions in Codex |
| **Personality: Off** | Blueprint class + instance numbers only, no signatures, Codex shows raw stats only |

The default-on ensures new players experience the engagement hook. The toggle respects players who find anthropomorphization distracting from pure architectural analysis. No mechanical difference between modes.

---

*Analysis complete. Aspect 1.06e documented.*

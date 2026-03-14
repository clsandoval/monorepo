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

*Analysis complete. Aspect 1.06 fully documented.*

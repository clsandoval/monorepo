# 3.17 — Command Agents: The Workbench Design Space for Meta-Level Configuration

## The Option

Command agents are the mechanical embodiment of Robot Uprising's deepest promise: **building systems that manage systems**. Where scouts, strikers, relays, and specialists operate ON the battlefield, Command agents operate on OTHER AGENTS. Their skills (reassign, reroute, prioritize) target subordinate configurations, not enemy units. The question this analysis explores is not WHETHER Command agents exist (that's locked) but HOW the player configures them in the workbench — what the Command agent blueprint editor looks like, what design decisions the player faces, and what the configuration experience FEELS like across player archetypes.

The Command agent blueprint is unlike any other blueprint in the workbench. A scout blueprint says "what should this unit do on the battlefield." A Command blueprint says "what should this unit do to OTHER units' blueprints." It's a blueprint that modifies blueprints — a program that writes programs. The workbench must communicate this shift in abstraction level clearly, or players will treat Command agents as expensive, immobile strikers and wonder why they wasted 10 minerals.

---

## The Core Design Tensions

### Tension 1: Flat Editor vs. Hierarchical Editor

**The Flat Editor** treats Command agent configuration identically to every other unit. Same skills panel, same rules panel, same hooks panel, same context config panel. The only difference is the skill verbs: `reassign`, `reroute`, `prioritize` instead of `patrol`, `engage`, `compress`. The player learns one editor paradigm and applies it everywhere.

**The Hierarchical Editor** gives Command agents a fundamentally different workbench view. Instead of listing skills and rules in isolation, it shows the Command agent's relationship to its subordinates — a miniature org chart embedded in the blueprint. The player configures the Command agent by interacting with this relational view: dragging subordinate blueprints into "managed" slots, defining policy rules per subordinate group, and previewing command cascades before execution.

**The spectrum between these extremes defines the Command agent workbench.**

### Tension 2: Explicit Subordination vs. Emergent Hierarchy

The locked spec says Command agent skills operate on other agents via messages through the hook network. But the workbench design determines whether subordination is an EXPLICIT relationship (the player declares "SCOUT-A reports to COMMAND-A") or an EMERGENT property (the player wires channels and writes rules, and subordination arises from who listens to whom).

**Explicit subordination:**
- A "Managed Units" panel on the Command blueprint where the player drags subordinate blueprints
- Cleaner UI, clearer mental model
- Constrains emergent behavior — a unit can only have one "boss"
- Feels like drawing an org chart

**Emergent subordination:**
- No explicit "manages" relationship — subordination exists because a Command agent's hooks publish to channels that other units listen to, and those units have "obey command" rules
- More powerful, more confusing
- A unit could receive commands from multiple Command agents (The Senate paradigm from 2.00e)
- Feels like wiring a network where hierarchy is a side effect

### Tension 3: Target Specificity in Command Skills

When a Command agent fires `reassign`, what's the target?

**Named target:** `reassign(SCOUT-A, skill:patrol, OFF)` — specific unit, specific change. Maximum control, maximum authoring burden. A Command agent managing 6 units needs rules for each one.

**Type-based target:** `reassign(ALL_SCOUTS, skill:patrol, OFF)` — all units of a type. Reduces rule count, loses granularity. Cannot tell SCOUT-A to evade while SCOUT-B keeps patrolling.

**Channel-based target:** `reassign(listeners:intel-east, skill:patrol, OFF)` — all units listening on a specific channel. The target group is defined by network topology, not unit type. Elegant: rerouting a channel first (moving units onto it) then issuing a command to that channel's listeners composes two skills into a coordinated operation.

**Proximity-based target:** `reassign(within:3, skill:patrol, OFF)` — but Command agents have 0 perception radius. This would require a different interpretation: "within 3 tiles of a specified position" using battlefield coordinates from buffer data.

**Conditional target:** `reassign(unit WHERE buffer.fill > 80%, eviction:oldest-first)` — target units matching a condition. Most expressive, most complex. Turns the target selector into a mini query language.

---

## Five Workbench Paradigms for Command Agent Configuration

### Paradigm A: "The Identical Twin" — Same Editor, Different Verbs

The Command agent blueprint uses the exact same editor as every other unit. Four sections: Skills, Rules, Hooks, Context Config. The only difference is the skill vocabulary.

**What the player sees:**

The workbench opens to a Command agent blueprint. The Skills section shows three toggle-able skills: `reassign`, `reroute`, `prioritize` — each with a configuration panel when expanded.

- **Reassign config:** Target selector (dropdown of all deployed blueprints or "ALL_type"), skill selector (dropdown of target's available skills), action (ON/OFF toggle)
- **Reroute config:** Target selector, channel-from (dropdown of current channels), channel-to (text field — type a name to create)
- **Prioritize config:** Target selector, eviction policy dropdown (oldest-first, newest-first, lowest-priority-first, type-based)

Rules section: same condition→action pairs as any unit. Conditions reference buffer contents. Actions invoke the configured skills.

Example rule: `IF buffer contains ENEMY_TYPE:STRIKER count > 2 → FIRE reassign(ALL_SCOUTS, skill:evade, ON)`

**Strengths:**
- Zero new UI concepts. Players who know how to configure a scout can configure a Command agent.
- The abstraction shift from "units that act on the battlefield" to "units that act on other units" is communicated entirely through skill vocabulary, not through UI changes.
- Clean implementation — one editor component, parameterized by unit type.

**Weaknesses:**
- The flat editor doesn't visualize the RELATIONAL nature of command. The player writes `reassign(SCOUT-A, ...)` as text in a rule, but never sees the Command→Scout relationship rendered visually. The mental model of hierarchy lives only in the player's head.
- Target dropdowns get unwieldy with 8+ deployed blueprints. The "target selector" doesn't show which units are already managed by another Command agent — leading to management conflicts.
- No preview of command cascades. The player can't see "if Rule 3 fires, what happens to my army?" without running EXECUTE.

**Sensory:** The workbench feels identical to any other blueprint. Same cream background, same panel layout, same drag-to-reorder rules. The only visual distinction is the golden border on the Command blueprint card and the different skill icons: ⚡ for reassign (electricity = power to change), 🔀 for reroute (crossroads), 📊 for prioritize (ranked list). The golden border bleeds into the Skills panel header as a subtle golden gradient — the only visual cue that this blueprint operates at a different level.

---

### Paradigm B: "The Org Chart" — Relational Editor with Managed Unit Slots

The Command agent blueprint opens a different editor view with a central visual: an **organizational chart** showing the Command agent at the top and empty "managed unit" slots below. The player drags subordinate blueprints from the production queue into these slots, explicitly declaring the hierarchy.

**What the player sees:**

The top half of the workbench shows a tree diagram. The Command agent node sits at the top (golden, larger). Below it: 6 empty dashed slots arranged in a row (matching the 6 hook slots). The player drags blueprint cards from a sidebar into these slots. As blueprints dock, channel wiring auto-generates: a communication channel appears between the Command agent and each managed unit.

Below the tree: a policy editor. Instead of writing rules per individual unit, the player writes **policies** that apply to managed unit groups:

- **Standing Order:** "All managed scouts: switch to evade when ENEMY_STRIKER in buffer"
- **Contingency:** "If any managed unit eliminated: reroute surviving units to channel `emergency`"
- **Escalation:** "If 3+ managed units report same ENEMY_TYPE: amplify to all channels"

Policies compile to standard rules+hooks under the hood, but the player interacts with a higher-level vocabulary: standing orders, contingencies, escalations.

**Strengths:**
- The hierarchy IS the editor. The player literally builds an org chart. The relational nature of Command agents is impossible to miss.
- Policies read like English and compile to mechanical rules. The player thinks in management vocabulary, not programming vocabulary.
- Automatic channel wiring reduces hook configuration burden. The player doesn't manually type channel names for Command→subordinate communication — the hierarchy editor generates them.
- The org chart provides natural preview: hovering over a policy highlights which units it affects, which channels it uses, and what state change it produces. "If I hover over Contingency 2, the scout icons pulse red and the emergency channel line thickens."

**Weaknesses:**
- A new editor paradigm must be learned. Players who've mastered the flat editor for Missions 1-6 now encounter a completely different UI for Mission 7. The tutorial burden increases.
- Explicit managed-unit slots constrain The Senate paradigm (distributed authority). If a unit can only be in one managed-unit slot, it can only have one boss. Multi-boss configurations (two Command agents both managing the same relay) become either impossible or require escape hatches.
- Policies hide mechanical details. A player who writes "all managed scouts: switch to evade" doesn't see the underlying rule→hook→channel→buffer chain. When the policy fails, debugging requires dropping to the mechanical level — and the player has never been taught that level for Command agents.
- 6 managed-unit slots matching hook slots is elegant but constraining. A Command agent managing more than 6 units (the entire army) needs a different addressing model.

**Sensory:** The org chart fills the right two-thirds of the workbench. The Command agent node is a golden hexagon at the top, with a subtle pulse animation — a slow heartbeat glow. Managed unit slots are dashed hexagonal outlines. When a blueprint is dragged toward a slot, the slot brightens — amber if compatible (the unit type has skills that can be reassigned), grey if incompatible (another Command agent already manages this unit). As the blueprint docks, a golden channel line draws itself downward from the Command node to the subordinate — a thin wire that pulses once to confirm the connection.

Policy text renders in a monospaced font with syntax highlighting: unit types in teal, conditions in amber, actions in green. The left margin shows policy priority numbers (1, 2, 3...) that the player can drag to reorder. A collapsed policy shows only its one-line summary; expanded shows the full condition→action detail.

---

### Paradigm C: "The Control Room" — Dashboard-Style Command Configuration

The Command agent's workbench view resembles a monitoring dashboard. Instead of editing an individual blueprint, the player sees a real-time (preview) overview of their entire army with the Command agent's influence overlaid.

**What the player sees:**

The workbench splits into three columns:

**Left column — Intelligence Feed:** A scrolling preview of what the Command agent's buffer would contain based on the current army configuration. Signal flow arrows show which units feed data to the Command agent and through which channels. The player can see "if SCOUT-A observes an enemy, the observation flows through RELAY-C to COMMAND-A's buffer in 3 ticks" visualized as a animated signal path.

**Center column — Decision Matrix:** A table where rows are conditions and columns are actions. Each cell is a checkbox or parameter. The player fills in the matrix: "When I see ENEMY_STRIKER × count > 2 → REASSIGN all scouts to evade mode." The matrix is a truth table for organizational decisions. Empty cells are deliberate non-responses: "When I see AGENT_ELIMINATED and fewer than 3 enemies → do nothing (acceptable loss)."

**Right column — Army State Preview:** A miniature battlefield view showing unit positions (from Plan screen) with overlaid command influence zones. Hovering over a matrix row highlights which units are affected. Clicking "Preview" on a matrix row animates the expected command cascade on the miniature board — golden rings rippling outward, units visually shifting behavior.

**Strengths:**
- The dashboard metaphor communicates "monitoring and management" without needing the programming metaphor. Players who manage dashboards at work (ops teams, factory supervisors, project managers) recognize the pattern immediately.
- The decision matrix makes the combinatorial space VISIBLE. The player can see empty cells — conditions they haven't written responses for. This is the "test coverage" view of their command logic.
- The preview cascade lets the player test command logic before EXECUTE. "What happens when I see 3 enemy strikers?" → click → watch the golden cascade ripple through the preview board. This is the ghost preview principle applied to meta-level configuration.

**Weaknesses:**
- Information density is high. Three columns of data — signal flow, decision matrix, army preview — is a LOT of screen space. On smaller screens, this becomes unusable.
- The decision matrix can grow large. 5 conditions × 3 action types × 8 target units = 120 cells. Most will be empty, but the matrix itself is intimidating.
- The dashboard metaphor may not communicate that the Command agent is a UNIT on the battlefield. Players might forget it needs to be physically deployed, can be eliminated, and has its own buffer that fills with data. The dashboard makes it feel like a god-mode overlay, not a vulnerable node in the network.

**Sensory:** The dashboard has a darker background than the standard workbench — charcoal grey instead of cream — communicating "operations center." The intelligence feed on the left uses a terminal-style font with green text on dark background, scrolling slowly upward. Signal paths render as thin animated dotted lines with direction arrows. The decision matrix has a spreadsheet aesthetic — thin grid lines, cells that highlight amber on hover, checkmarks that pulse green when enabled. The army preview uses a dimmed version of the battlefield view — muted colors, unit icons instead of full sprites, channel wiring as faint colored lines. When a preview cascade triggers, the gold ripple animation plays on the miniature board at 0.5x scale — small enough to see the whole army's response at once, dramatic enough to feel like a real organizational shift.

---

### Paradigm D: "The Flowchart" — Visual Decision Tree for Command Logic

Instead of condition→action rule lists, the Command agent's logic is configured as a visual flowchart. The player drags decision nodes (diamond shapes) and action nodes (rectangles) onto a canvas and connects them with arrows. The flowchart reads top-to-bottom: starting from a "New Tick" entry point, flowing through condition checks, branching to different command actions.

**What the player sees:**

A canvas fills the workbench. At the top: a green oval labeled "Tick Start." Below it, the player places diamond-shaped decision nodes: "Enemy Strikers in buffer?" with YES/NO branches. YES leads to an action node: "Reassign all scouts → evade mode." NO leads to the next decision: "Agent eliminated?" And so on, branching downward. The bottom of every branch terminates in a red oval: "End Tick."

Each action node is expandable — clicking it reveals the reassign/reroute/prioritize configuration inside. Decision nodes are configurable with condition dropdowns (buffer contents, signal count, agent status, tick number).

The canvas supports loops (a branch that routes back to an earlier decision), parallel execution (split a branch into simultaneous actions), and priority ordering (left branches evaluate before right branches).

**Strengths:**
- Flowcharts are universally understood. Non-programmers can read and build flowcharts. This is the most accessible representation of branching logic — more intuitive than condition→action lists for visual thinkers.
- The spatial layout reveals decision flow naturally. Players can SEE that "my Command agent checks for strikers first, then flanking, then overload" because the checks are literally arranged top-to-bottom. Reordering priorities means moving nodes on the canvas, a physical act.
- The Gladiabots precedent validates this approach. Gladiabots (1.06) uses a behavior tree (similar to flowchart) for robot programming and achieved broad accessibility. Players who've played Gladiabots would feel immediately at home.

**Weaknesses:**
- Flowcharts get messy at scale. A Command agent responding to 5+ conditions with multiple action branches creates a sprawling diagram that doesn't fit on one screen. Scroll-and-pan canvas interaction feels less game-like.
- The flowchart paradigm ONLY for Command agents creates inconsistency. Scouts use condition→action lists; Command agents use flowcharts. Two paradigms to learn. Unless the entire game uses flowcharts (which contradicts the locked loadout-style blueprint editor).
- Loops in flowcharts risk infinite evaluation. A decision branch that loops back to an earlier check creates an evaluation cycle per tick. The system needs a max-evaluation-depth constraint — which is a hidden complexity the flowchart's friendly visual doesn't communicate.

**Sensory:** The canvas has a light grid background (like graph paper) in pale blue, creating a drafting-table aesthetic. Decision diamonds are amber with black text. Action rectangles are green with white text. Connection arrows are dark grey with animated dots flowing along them (showing evaluation direction). When the player connects a YES branch to an action, a satisfying "snap" sound plays — magnetic docking. The canvas supports zoom: pinch to zoom on touch, scroll wheel on desktop. At zoom-out, decision labels shrink to icons and the flowchart becomes a shape map — you can see the overall structure without reading each node. At zoom-in, each node expands to show full configuration details. A "Test" button on the canvas toolbar lets the player inject simulated buffer contents and watch evaluation flow through the chart: nodes light up green (evaluated true) or dim (evaluated false) in sequence, with a 200ms delay between each step — slow enough to follow, fast enough to not bore.

---

### Paradigm E: "The Doctrine Board" — Preset-Based Command Configuration

Instead of configuring individual rules, the player designs **doctrines** — named organizational presets that the Command agent switches between. Each doctrine defines a complete set of skill assignments, channel routing, and eviction policies for all managed units. The Command agent's rules determine WHEN to switch doctrines, not WHAT individual changes to make.

**What the player sees:**

The workbench shows a horizontal dock of **doctrine cards** at the top — like a card hand in a card game. Each card is a named organizational state: "Standard Formation," "Consolidated Defense," "Aggressive Push," "Emergency Retreat." The player creates doctrines by clicking "+" on the dock.

Creating a doctrine opens a snapshot editor: a miniature version of the full workbench showing all managed units' configurations simultaneously. The player adjusts skills, channels, and priorities for each unit within this doctrine. When they close the doctrine editor, the state is saved as a card.

Below the doctrine dock: a **switching rule panel.** Simple condition→doctrine pairs: "IF enemy_strikers > 2 → ACTIVATE Consolidated Defense." "IF agent_eliminated → ACTIVATE Emergency Retreat." "DEFAULT → Standard Formation." At most 5-6 switching rules (matching the small number of doctrines).

**Strengths:**
- Dramatically reduces cognitive load. Instead of reasoning about individual reassign/reroute/prioritize actions, the player reasons about named states. "Am I in the right formation?" vs. "Should I toggle Scout-A's evade, reroute Relay-C to flank_alpha, and prioritize Striker-B's buffer?"
- Doctrines are sharable artifacts. "Try my 'Pincer Formation' doctrine" becomes community content. Named presets have social currency that individual rule configurations don't.
- The switching rules are simple enough that even Zara (Journey 3 from 2.00e) can configure them. The number of rules matches the number of doctrines (3-5), not the number of managed units × possible actions.
- The doctrine metaphor maps to real military doctrine, real corporate strategy playbooks, and real software deployment environments (blue-green deployments are doctrine switches).

**Weaknesses:**
- All-or-nothing transitions. Switching from "Standard Formation" to "Consolidated Defense" changes EVERYTHING simultaneously. There's no "consolidate the east flank but keep the west unchanged" — that would require a dedicated doctrine covering that specific partial change. The number of doctrines needed to cover partial changes grows combinatorially.
- Doctrine authoring is front-loaded. The player must design 3-5 complete organizational states BEFORE the battle. This shifts work from the real-time adaptation that Command agents are designed for (watching the battle evolve and responding) to pre-planning (designing all possible states in advance). The planning phase gets longer; the sealed watch reveals less.
- A doctrine switch is a single discrete event. Multiple switches in rapid succession create oscillation — the army flips between formations every few ticks because conditions alternate. The player needs anti-oscillation logic ("don't switch back to Standard within 5 ticks of activating Defense"), which is a new complexity.

**Sensory:** The doctrine dock sits along the top of the workbench like a shelf of labeled folders. Each doctrine card has a colored left edge: blue for Standard, amber for Defense, red for Aggressive, grey for Retreat. The active doctrine (during ghost preview) has its card pulled forward slightly and a golden glow on the edge. Switching rules show below the dock as horizontal strips with a condition on the left, an arrow, and a doctrine card thumbnail on the right. Dragging to reorder switches priority. When previewing a doctrine switch (hovering over a switching rule), the miniature board at the left snaps to the doctrine's formation — units visually shift to their doctrine-defined positions, channels rewire, skill icons toggle. The snap is instant — emphasizing that a doctrine switch is a single atomic operation, not a gradual transition. A deep **thrum** sound plays on each preview snap — the same sound described in the 2.00e sensory section for doctrine switches during sealed watch.

---

## Comparative Analysis Across Paradigms

| Dimension | A: Identical Twin | B: Org Chart | C: Control Room | D: Flowchart | E: Doctrine Board |
|-----------|-------------------|-------------|-----------------|-------------|-------------------|
| **Learning cost** | Near zero (reuses known editor) | Moderate (new UI paradigm) | High (three-column dashboard) | Moderate (flowcharts are familiar) | Low (named presets are intuitive) |
| **Ceiling of expression** | Maximum (full rule/hook access) | High (policies compile to rules) | Maximum (matrix covers all combinations) | Maximum (flowcharts are Turing-complete) | Limited (discrete states only) |
| **Hierarchy visibility** | None (implicit in rules) | Maximum (org chart IS the editor) | Medium (army overview column) | Low (hierarchy isn't spatial) | Medium (doctrines show army state) |
| **Debugging transparency** | Maximum (rules = what runs) | Medium (policies hide mechanics) | High (matrix shows coverage gaps) | High (visual evaluation flow) | Medium (which doctrine is active?) |
| **Scale at Tier 3** | Degrades (too many rules) | Good (org chart structures complexity) | Good (matrix organizes combinations) | Degrades (flowchart spaghetti) | Good (bounded by doctrine count) |
| **Template friendliness** | Low (rule templates are opaque) | High (pre-built org charts) | Medium (pre-filled matrices) | High (pre-built flowchart templates) | Maximum (pre-built doctrines) |
| **Consistency with other blueprints** | Perfect (same editor) | None (unique editor) | None (unique editor) | Partial (could extend to all units) | Partial (could extend to army-level presets) |
| **The Senate (distributed authority)** | Excellent (no constraints) | Poor (explicit slots = one boss) | Good (matrix can show multi-boss) | Good (flowcharts per unit) | Poor (doctrines assume hierarchy) |

---

## Player Journeys

### Journey 1: Tomás, 16, Casual Gamer — First Command Agent with Paradigm E (Doctrine Board)

**Context:** Mission 7. Tomás struggled with channel management in Missions 5-6 but passed by copying templates from the Codex. He opens Mission 7's brief: "The enemy changes tactics mid-battle. Your army must adapt." The boot log introduces the Command agent: `SUBSYSTEM ONLINE: Command Protocol v1.0. Organizational authority granted.`

**Minute 0:00 — The Doctrine Shelf**
The workbench opens with a golden-bordered Command blueprint. Instead of the familiar Skills/Rules/Hooks/Context panels, the top shows a horizontal shelf with one card already placed: "Default Formation" in blue. A dashed "+" card invites more. Below: a single switching rule: "DEFAULT → Default Formation."

Tomás hovers over "Default Formation." The miniature board on the left shows his army in starting positions with current channel wiring. He reads the tooltip: "This formation keeps your army in the configuration you designed in the standard workbench. Create new doctrines to prepare organizational changes the Command agent can activate during battle."

**Minute 1:00 — Creating a Doctrine**
He clicks "+." A new card appears: untitled, empty. The editor unfolds — it looks like a snapshot of his full army's configuration, but compressed into a tabular view. Each row is a managed unit. Columns: Active Skills, Listening Channels, Eviction Policy. Everything starts matching the Default Formation.

He names it "Run Away" (he'll rename it later). He clicks SCOUT-A's Active Skills column and toggles `patrol` OFF, `evade` ON. He clicks SCOUT-B's and does the same. He changes STRIKER-A's listening channel from `strike-east` to `emergency`. He doesn't touch the relays.

The doctrine card updates: its color shifts to grey (he picked "Retreat" palette). The miniature board preview shows scouts pulling back and strikers repositioning. He grins.

**Minute 2:30 — Writing a Switching Rule**
Below the shelf, he clicks "Add Rule." A condition builder appears: `IF [buffer contents] [operator] [value] → ACTIVATE [doctrine]`. He fills in: `IF ENEMY_TYPE:STRIKER count > 1 → ACTIVATE "Run Away"`. He realizes this is much simpler than the rules he wrote for scouts. One condition, one outcome. The condition references the Command agent's buffer — which receives data through hooks. He checks: his Command agent has two hooks, both listening on `intel-summary` (the relay's output channel). Good — the Command agent will see what the relays see.

**Minute 3:30 — Second Doctrine**
He creates "Fight Back": all scouts switch to patrol with narrow range (close to base), both strikers get `engage` prioritized, relay switches to `amplify` mode. He writes a switching rule: `IF ENEMY_TYPE:SCOUT count > 3 → ACTIVATE "Fight Back"`. Default stays as fallback.

His doctrine shelf now has three cards: Default (blue), Run Away (grey), Fight Back (red). Three switching rules. He's designed an adaptive army in under 4 minutes.

**Minute 4:00 — EXECUTE**
Sealed watch. Ticks 1-8: Default Formation. Army deploys normally. Tick 9: Enemy strikers appear. The relay compresses and forwards. The Command agent's buffer fills. Switching rule 1 fires. **THRUM.** Every unit on the board flashes grey simultaneously. Scouts snap backward. Striker repositions. The doctrine card in the corner UI shifts from blue to grey: "Run Away" active.

Tomás laughs out loud. He watches the scouts evade while the strikers hold a defensive line. The enemy strikers can't catch the scouts. By tick 18, the enemy strikers have spread thin. Then: enemy scout wave arrives. Relay reports. Switching rule 2 fires. **THRUM.** Flash to red. "Fight Back" activates. Scouts snap to tight patrol, strikers advance. The synchronized color flash — the entire army shifting posture in one tick — is exactly the TikTok clip that got Tomás into the game.

**Minute 6:00 — Inspector**
He clicks the Command agent in the Inspector. The timeline shows two doctrine switch events: tick 9 (Default → Run Away) and tick 18 (Run Away → Fight Back). Each switch shows which units changed what. He notices: at tick 12, the enemy briefly had only scouts (between waves), and his "Run Away" doctrine was overkill — the army was fleeing from a threat that had passed. He thinks: "I need a condition for 'return to Default when no strikers detected for 3 ticks.'" He adds switching rule 3: `IF NO ENEMY_TYPE:STRIKER for 3 ticks → ACTIVATE "Default Formation"`.

**Minute 7:30 — The Learning Moment**
Tomás realizes he just designed a **state machine**. Three states, three transitions. His army isn't just reacting — it cycles through organizational modes based on battlefield conditions. He didn't write complex rules for individual units. He designed three "moods" for his army and told the Command agent when to shift between them. The abstraction level is right: high enough to be manageable, low enough to feel like meaningful design.

**UI Annotations:**
- **Doctrine shelf:** Top of workbench, horizontal scroll, max 5 visible cards (scroll for more). Each card: 120×80px, color-coded left stripe, name in bold, miniature formation silhouette.
- **Switching rules:** Below shelf, vertical list. Each rule: one horizontal strip, condition on left (amber text), arrow icon, doctrine card thumbnail on right (color-matched).
- **Sealed watch doctrine indicator:** Top-right corner, current doctrine card name with color stripe. Switches with THRUM sound and brief color flash.
- **Inspector doctrine timeline:** Horizontal bar below tick clock showing doctrine bands (colored segments indicating which doctrine was active during which tick range).

---

### Journey 2: Dr. Amara, 38, DevOps Lead — Paradigm C (Control Room) for Full Expressiveness

**Context:** Mission 9. Dr. Amara manages Kubernetes clusters professionally. She found Robot Uprising through a colleague's conference talk about "games that teach systems thinking." She's 12 hours in, running two Command agents: MARSHAL (managing combat units) and SIGNAL-OPS (managing relays). She opens Mission 9: enemy factory vs. player factory, sustained engagement.

**Minute 0:00 — The Dashboard**
The workbench shows the Control Room view for MARSHAL. Left column: Intelligence Feed — animated signal paths showing scout observations flowing through RELAY-ALPHA → compress → MARSHAL's buffer. She sees expected latency annotations: "3-tick delay from SCOUT-EAST to MARSHAL." Center column: Decision Matrix — 6 rows (conditions) × 4 columns (action types: reassign, reroute, prioritize, no-action). Right column: Army State Preview — miniature board with unit icons and channel wiring.

She's already filled in the matrix from previous attempts. Row 1: ENEMY_STRIKER_COUNT > 2 → reassign all scouts to evade. Row 2: AGENT_ELIMINATED → reroute surviving combat units to `emergency` channel. Row 3: BUFFER_FILL on any relay > 80% → prioritize that relay's eviction to newest-combat-first. Row 4: ENEMY_PRODUCTION_SHIFT detected → no action (she's still figuring out what to do here).

**Minute 1:30 — Filling the Coverage Gap**
The empty cell at Row 4 × "reassign" catches her eye. The matrix shows it as a dim grey cell — no policy defined. She clicks it. A configuration flyout opens: "When ENEMY_PRODUCTION_SHIFT is detected, reassign which units?"

She thinks about it professionally: "In my clusters, when I detect a traffic pattern shift, I scale the responding service. Here, the enemy shifting to striker production means I need to scale my defensive response." She configures: reassign SPECIALIST-B from `extract` to `hack` (switch from economy to intelligence) — so she can READ the enemy's production queue.

She clicks "Preview" on Row 4. The army preview animates: golden rings from MARSHAL to SPECIALIST-B. The specialist's icon changes from the amber extraction tether to the green hack siphon. She can see the state change before running the battle.

**Minute 3:00 — Cross-Command Coordination**
She switches to SIGNAL-OPS (the relay-managing Command agent). Its Control Room shows a different matrix — conditions about channel congestion, buffer overflow, and signal quality. She notices that MARSHAL's reroute actions can conflict with SIGNAL-OPS's channel management. If MARSHAL reroutes a scout to channel `flank_alpha` while SIGNAL-OPS is consolidating all channels to `priority-only`, the scout ends up on a dead channel.

She adds Row 5 to SIGNAL-OPS's matrix: "IF MARSHAL has issued reroute within last 2 ticks → NO ACTION (defer to combat commander)." This is a cross-Command agent coordination rule — SIGNAL-OPS respects MARSHAL's recent decisions. She implemented a **priority protocol between her two Command agents** using the same buffer/rule system.

**Minute 5:00 — The Matrix as Test Coverage**
She zooms out to see the full decision matrix. 6 conditions × 4 action columns = 24 cells. 16 are filled (policies defined). 8 are empty (explicit non-responses or unaddressed scenarios). She counts the empty cells like uncovered test cases: "I have 67% policy coverage. What's in the remaining 33%?"

She clicks an empty cell: ENEMY_PRODUCTION_SHIFT × reroute. "Should I reroute channels when the enemy shifts production? Maybe — reroute scouts to concentrate on the enemy factory entrance?" She fills it in: reroute SCOUT-EAST to listen on `factory-watch` channel, a new channel she creates by typing the name. The channel appears in the army preview as a new cyan line.

**Minute 7:00 — EXECUTE and Cascade Verification**
Sealed watch runs. At tick 14, the enemy shifts production. MARSHAL's intelligence feed lights up. Row 4 fires: SPECIALIST-B switches to hack mode. Simultaneously, the reroute cell fires: SCOUT-EAST's channel wiring changes on the miniature board. The signal flow diagram in the Intelligence Feed column (visible in Inspector's replay of the Control Room state) shows the new routing: SCOUT-EAST → `factory-watch` → RELAY-ALPHA → MARSHAL.

In the Inspector debrief, she opens the decision matrix replay. Each cell shows how many times it fired and when. Row 1: fired 3 times (ticks 9, 22, 35). Row 4: fired once (tick 14). She notices Row 3 (relay buffer overload) fired 5 times — more than expected. "My relays are overloaded because I'm generating too much signal traffic with the new `factory-watch` channel. I need a filter, or I need to increase buffer sizes." She adds Row 7: IF relay_buffer_fire_count > 3 within 10 ticks → prioritize relay eviction to `factory-watch`-first (evict factory surveillance data before combat data).

**Minute 10:00 — The Professional Recognition**
Dr. Amara leans back and realizes: she just built a monitoring and incident response system. MARSHAL is her PagerDuty — detecting conditions and triggering organizational responses. SIGNAL-OPS is her traffic manager — monitoring infrastructure health and adjusting routing. The decision matrix is her runbook. The Inspector's matrix replay is her post-incident review. She's doing her job, but with golden rings and robot armies instead of YAML manifests and Grafana dashboards.

**UI Annotations:**
- **Intelligence Feed (left column):** 250px wide, dark background, terminal-style font. Signal paths as animated dotted lines with latency annotations. Scrolls vertically as new signals arrive in preview mode.
- **Decision Matrix (center column):** Spreadsheet grid, 60px row headers (conditions), 120px column headers (action types). Cells: dim grey (no policy), bright green (policy defined), amber pulse (conflict detected). Click to expand configuration flyout.
- **Army Preview (right column):** 280px wide, dimmed battlefield view. Unit icons (emoji-based per locked spec). Channel wiring as thin colored lines. "Preview" button per row triggers cascade animation.
- **Matrix replay (Inspector):** Same grid layout, but each cell shows fire count (badge) and timeline sparkline. Click a cell to jump to its first activation tick.

---

### Journey 3: Kwame, 11, First Strategy Game — Paradigm B (Org Chart) as Guided Introduction

**Context:** Mission 7. Kwame's older sister plays the game and he's been watching. He's completed Missions 1-6 with heavy template use and some original modifications. He understands scouts, relays, and strikers individually but finds multi-unit coordination hard. The Command agent is his first encounter with organizational thinking.

**Minute 0:00 — The Tree Appears**
The workbench opens and something new is at the center: a tree diagram. A golden hexagon at the top labeled "COMMAND" with 6 empty dashed circles below it, connected by faint lines. A sidebar shows his army's blueprints as draggable cards: SCOUT-A, SCOUT-B, RELAY-C, STRIKER-A, STRIKER-B.

The boot log reads: `COMMAND PROTOCOL ACTIVE. This unit manages other units. Drag your agents into the slots below to place them under command.` A tooltip arrow points at the first empty slot.

**Minute 0:30 — Building the Hierarchy**
Kwame drags SCOUT-A into the first slot. A golden line draws itself from COMMAND to SCOUT-A with a tiny channel label auto-generated: `cmd-scout-a`. The sidebar shows: "COMMAND can now: reassign SCOUT-A's skills, reroute SCOUT-A's channels, prioritize SCOUT-A's memory."

He drags SCOUT-B, RELAY-C, STRIKER-A, STRIKER-B into the remaining slots. The tree fills out — five golden lines radiating from the Command hexagon. It looks like a spiderweb. He notices one empty slot remaining (6 hook slots, 5 units managed). The tooltip says: "One management slot available. In future missions, you may have more units to manage."

**Minute 1:30 — Writing a Policy**
Below the tree, a panel reads "Standing Orders." One pre-filled example: `"When enemy strikers are detected → switch all scouts to evade mode."` Kwame reads it and understands intuitively: the Command agent will protect the scouts by telling them to run. A toggle next to the order says "ACTIVE." He leaves it on.

He clicks "Add Standing Order." A sentence builder appears: `WHEN [condition selector ▼] → [action selector ▼] [target selector ▼]`. He opens the condition selector: choices include "enemy strikers detected," "agent eliminated," "relay overloaded," "no enemies nearby." He picks "agent eliminated." Action selector: "reassign," "reroute," "send alert." He picks "send alert" (simplest). Target: "all managed units." The order reads: `"When an agent is eliminated → send alert to all managed units."`

He doesn't fully understand what "send alert" does mechanically, but the org chart previews the effect: when he hovers over the order, every managed unit's icon briefly flashes with a yellow exclamation mark, showing they'd receive the alert.

**Minute 3:00 — EXECUTE**
The sealed watch shows the tree visualization in miniature at the top-right corner — a tiny golden web showing which units are managed. Tick 6: the Command agent spawns. Its golden hexagon appears on the board. The tree in the corner fills in with connections.

Tick 11: Enemy strikers arrive. Standing Order 1 fires. Golden rings pulse from the Command unit to both scouts. The scouts' movement changes — they pull back. Kwame yells: "It's doing it!" His sister looks over: "You made it tell them to run. That's the whole game." Kwame feels powerful — not because he controlled the scouts directly, but because he built a SYSTEM that controlled them.

Tick 18: STRIKER-B is eliminated by an enemy striker. Standing Order 2 fires. A yellow alert signal pulses to all remaining units. In the Inspector afterward, Kwame clicks the alert and sees: each unit's buffer received a `{type: alert, event: agent_eliminated, target: STRIKER-B}` entry. He doesn't know what to do with this information yet, but he can see that the Command agent communicated a fact to the whole army.

**Minute 5:00 — Modification**
Kwame wins, barely. In the debrief, he notices that after STRIKER-B was eliminated, the remaining army didn't DO anything with the alert. The alert arrived in their buffers, but no rules responded to it. He goes back to the workbench.

He clicks STRIKER-A in the org chart. A detail flyout shows STRIKER-A's current rules. He adds: `IF buffer contains agent_eliminated AND target is STRIKER-B → move toward COMMAND position` (protect the commander). This isn't a Command agent rule — it's a subordinate's rule for how to respond to the Command agent's alert. The hierarchy is bidirectional: Command sends orders DOWN, subordinates have rules for how to process orders coming FROM command.

This is the moment Kwame discovers that the org chart isn't just the Command agent's view — it's the whole army's relational structure. The tree visualizes relationships; the policies and rules WITHIN each node define how those relationships work.

**Minute 7:00 — The Second Run**
He runs EXECUTE again. Same battle, different randomization. This time, when STRIKER-B is eliminated, the alert fires, and STRIKER-A responds — moving toward the Command agent's position. A defensive formation emerges from two separate rules: the Command agent's standing order (send alert) and the striker's individual rule (react to alert). Kwame didn't design the formation. He designed the COMMUNICATION PROTOCOL, and the formation emerged.

**UI Annotations:**
- **Org chart canvas:** Center of workbench, 500×400px area. Golden hexagon at top (80×80px). Managed unit nodes as circles (50×50px diameter) with unit emoji. Golden connection lines (2px, subtle pulse animation). Empty slots as dashed circles with "+" icon.
- **Standing Orders panel:** Below org chart. Each order: horizontal strip, sentence builder with dropdown selectors. Condition selector: 8-10 predefined conditions in plain language. Action selector: 5 actions (reassign, reroute, prioritize, send alert, activate doctrine). Target selector: individual units, unit types, "all managed."
- **Detail flyout on subordinate click:** Right sidebar, 280px wide, shows the clicked unit's rules (editable), channel subscriptions, and current skill loadout. Modifications here affect the subordinate's blueprint directly — the org chart is a two-way editor.
- **Miniature tree during sealed watch:** Top-right corner, 120×80px. Golden web showing active connections. Connection lines flash on command signal. Eliminated units grey out and connection lines fade.

---

### Journey 4: Lin, 34, Competitive Gladiabots Veteran — Paradigm A (Identical Twin) for Maximum Control

**Context:** Mission 9, second attempt. Lin spent 200 hours in Gladiabots and found Robot Uprising through a Gladiabots Discord recommendation. She skipped templates from Mission 5 onward, preferring to build everything from scratch. She uses Paradigm A (flat editor) because she wants full mechanical control — she doesn't trust policy compilation or doctrine abstraction to produce optimal behavior.

**Minute 0:00 — The Rule Stack**
Her Command agent OVERLORD has 11 rules. Each is a specific condition→action pair:

1. `IF buffer contains ≥3 ENEMY_SCOUT AND tick < 20 → reroute(SCOUT-A, channel: deep-recon)` — early-game scout rush response
2. `IF buffer contains ENEMY_STRIKER AND distance_to_base < 3 → reassign(STRIKER-A, skill:breach, OFF) + reassign(STRIKER-A, skill:engage, ON)` — cancel base assault, defend
3. `IF buffer contains RELAY_OVERLOAD from RELAY-C → prioritize(RELAY-C, eviction: stale-combat-first)` — relay triage
4. `IF buffer contains AGENT_ELIMINATED type:SCOUT → reroute(SPECIALIST-B, channel: scout-replacement)` — compensate for lost scouts
5-11: increasingly specific conditions covering flank detection, production queue shifts, multi-tick signal absence (the "silence detection" pattern from 3.03d), and recursive: Rule 10 fires reassign on the SECOND Command agent to change ITS priority ordering.

**Minute 2:00 — The Rule 10 Moment**
Rule 10 is her masterpiece: `IF tick > 40 AND buffer contains NO recent_reroute from SUB-COMMANDER → reassign(SUB-COMMANDER, skill:reroute, priority:AGGRESSIVE)`. This rule says: if the sub-commander hasn't rerouted anything in late-game, make it more aggressive about rerouting. She's writing a rule for a Command agent that modifies another Command agent's behavior. Three tiers of hierarchy: OVERLORD's rule changes SUB-COMMANDER's behavior, which changes subordinate scouts' channel assignments.

She previews in the ghost view: the channel map shows OVERLORD → SUB-COMMANDER connection. She traces the potential cascade: if Rule 10 fires, SUB-COMMANDER's reroute priority shifts, which means SUB-COMMANDER's Rule 3 (reroute idle scouts) triggers more easily, which means scouts change channels more frequently. The cascade is three levels deep, spread across two Command agents and multiple subordinates.

**Minute 4:00 — Debugging a Conflict**
She runs EXECUTE. At tick 42, Rule 10 fires as planned. SUB-COMMANDER becomes more aggressive. But at tick 45, both Command agents issue conflicting reroutes to the same relay: OVERLORD says `reroute(RELAY-C, listen: deep-recon)` and SUB-COMMANDER says `reroute(RELAY-C, listen: combat-priority)`. The relay receives both. Per the locked spec, one wins (earlier in evaluation order), the other is silently dropped.

In the Inspector, she clicks RELAY-C at tick 45 and sees both incoming command overrides. One has a green checkmark (executed); the other has a red X (dropped — arrived in the same tick, lower-ID agent wins). She realizes: "I need a conflict resolution protocol. Either give OVERLORD explicit priority over SUB-COMMANDER, or give RELAY-C a rule that picks the command from the higher-ranked source."

**Minute 6:00 — The Priority Chain**
She adds Rule 12 to RELAY-C's rules: `IF buffer contains command_override from OVERLORD AND command_override from SUB-COMMANDER → execute OVERLORD's command, discard SUB-COMMANDER's`. This is a subordinate-side priority rule — the relay respects the chain of command by explicitly preferring one commander's orders over another's. She's implementing a **military rank system** through buffer rules.

She realizes this pattern needs to be on EVERY subordinate that might receive conflicting commands. She copies the rule to all managed units. This is the moment Paradigm A's weakness shows: mechanical power requires mechanical repetition. In Paradigm B (Org Chart), this would be a single "Command Priority" setting on the hierarchy. In Paradigm A, it's 5 copy-pasted rules.

But Lin doesn't mind. She WANTS the explicit control. The copy-pasted rules mean she can later customize priority per unit: "STRIKER-A always obeys OVERLORD, but SCOUT-B prefers SUB-COMMANDER's orders because SUB-COMMANDER manages reconnaissance." Per-unit priority customization is impossible in the abstracted paradigms. The flat editor's weakness (repetition) is also its strength (granularity).

**Minute 9:00 — Victory and Optimization**
She wins. In the debrief, she counts: OVERLORD fired 14 commands across 80 ticks. SUB-COMMANDER fired 22. Combined: 36 organizational changes in 80 ticks, nearly one every two ticks. Her army was constantly restructuring. The sealed watch looked chaotic — golden rings everywhere, units shifting constantly. But the Inspector shows it was orchestrated: each command was a specific response to a specific condition, and the cascading effects compound into a coherent adaptive architecture.

She takes a screenshot of her Inspector's command timeline: two horizontal bars (one per Command agent) showing every command event as a colored pip. The pattern looks like a heartbeat — regular but varied, responsive but controlled. She posts it to Discord: "OVERLORD and SUB-COMMANDER coordinating across 80 ticks. 36 organizational changes, zero conflicts after adding rank rules. This is what the meta-level feels like."

**UI Annotations:**
- **Rule editor:** Standard condition→action list, identical to scout/striker editors. 11 rules visible with scroll. Each rule: condition (amber text), action (green text), target in parentheses (teal text). Drag handle on left for priority reordering.
- **Ghost preview:** Channel map in left panel showing all wiring. Hovering over a rule highlights affected channels and units. Multi-hop cascades shown as chained golden arrows: OVERLORD → SUB-COMMANDER → SCOUT-B.
- **Inspector command timeline:** Horizontal bar per Command agent, ticks on x-axis. Each command event: colored pip (green = reassign, teal = reroute, amber = prioritize, red = conflict/dropped). Hover for details. Click to jump to tick.

---

## Interaction Effects

### With Hook Taxonomy (3.08) and Hook Chaining (3.09)
Command agent skills fire THROUGH the hook network. A `reassign` command is a message sent on a channel, received by the target unit's hook, deposited in the target's buffer. This means:
- **Signal latency applies.** A Command agent 4 tiles from a relay routes through 2 hops = 4 ticks before the command arrives. In a one-shot-one-kill game, 4 ticks of organizational delay can be fatal. The player must position relays to minimize Command→subordinate latency.
- **EM emissions apply.** Every command signal generates EM noise. A Command agent issuing 36 commands in 80 ticks (Lin's scenario) is extremely loud. Enemy scouts can detect and locate the Command agent through its emission pattern. Meta-level sophistication creates meta-level vulnerability.
- **Hot hooks enable instant cascades.** If Command→subordinate hooks are hot (3.09), commands cascade within a single tick rather than across ticks. This makes The Foreman paradigm (2.00e) dramatically more powerful but creates EM burst signatures.

### With One-Shot-One-Kill Combat
Command agents have 0 perception and are stationary. They are the most vulnerable units on the board:
- They can't see enemies approaching.
- They can't move away.
- They die to a single adjacent striker.
- When they die, the entire meta-level collapses.

This creates a **fortress defense** mini-game: the player must allocate combat resources to protecting the Command agent. A striker guarding the Command agent isn't fighting the enemy — it's bodyguarding. The opportunity cost of Command agent protection is a core strategic tension.

### With Context Config (Buffer Mechanics)
The Command agent has the largest buffer (14 slots) but no perception. Every slot must be filled through the hook network — received signals from subordinates. A Command agent that subscribes to too many channels drowns in data (buffer overload → 1 tick stun). A Command agent that subscribes to too few channels is blind to battlefield changes.

The context config for a Command agent IS its intelligence briefing: what data does the commander receive? The player must design the information pipeline that feeds the Command agent, not just the Command agent's response logic. "Garbage in, garbage out" — a Command agent with perfect rules but noisy input data makes perfect responses to wrong information.

### With Sealed Watch Pacing
Command events are the sealed watch's most dramatic moments. The golden cascade — a Command agent issuing orders that ripple through the army — is the visual climax of every battle. At 1 tick/second default speed, a cascade that takes 3 ticks (Command → Relay → Subordinates) unfolds over 3 seconds: slow enough to watch, fast enough to feel decisive. At 2x speed, cascades blur together. At 0.5x speed, each hop of the cascade is a distinct moment.

The sealed watch design MUST ensure Command events are visually distinct from data signals. If the player can't tell "the Command agent is reorganizing" from "the relay is forwarding a report," the meta-level is invisible during the emotional phase and only legible in the analytical phase (Inspector).

### With Campaign Mission Design
- **Mission 7 (Command introduction):** Must work with ALL five paradigms. The mission's designed failure state should teach "your army didn't adapt because you had no Command agent" — not "your army didn't adapt because you chose the wrong editor paradigm."
- **Mission 8-9 (Multi-Command):** Tests whether the paradigm scales to multiple Command agents. Paradigm B (Org Chart) struggles here: two separate org charts on screen? Paradigm C (Control Room) works naturally: tab between two dashboards.
- **Mission 10 (Factory vs. Factory):** The Command agent's production queue management becomes critical. The player may need to reassign production priorities mid-battle (build more scouts, fewer strikers). This requires a new Command skill not in the locked set: `requeue` (modify production order).

---

## Sensory Summary: What Command Agent Configuration FEELS Like

**The Transition Moment:** Opening the Command agent blueprint for the first time should feel like being promoted. The workbench doesn't just show a new unit type — it shifts visual register. The golden border isn't decoration; it's a semantic signal: "you're operating at a different level now." The background might subtly darken (charcoal undertones), the font might shift slightly (more authoritative), the ambient sound might lower in pitch (deeper, steadier). The message is: **you've been managing soldiers. Now you're managing the army.**

**The Configuration Experience:** Regardless of paradigm, configuring a Command agent should feel like strategic planning, not programming. The tactile experience should be heavier — slower drag animations, deeper click sounds, weightier cursor resistance on important toggles. Dragging a subordinate into an org chart slot: a low magnetic pull followed by a satisfying **thunk**. Toggling a doctrine switch: a physical-feeling **ka-chunk**, like engaging a heavy lever. Writing a rule for a Command agent: the condition builder text should render in a slightly larger, slightly bolder font than standard rules — the same words, but presented as policy rather than code.

**The Cascade Preview:** The ghost preview for Command agents should be the most visually rewarding preview in the game. When the player hovers over a rule and the golden cascade animates across the miniature board — rings expanding, units flashing, channels rewiring — it should feel like watching a plan unfold. The preview animation should be slightly slower than real-time (0.75x), giving the player time to see each hop. A faint orchestral swell (strings or low brass) could accompany the preview — the same motif that plays during actual sealed watch cascades, connecting the planning experience to the execution experience.

---

## Comparable Games/Media

| Reference | What It Does | What Transfers |
|-----------|-------------|---------------|
| **Gladiabots behavior tree editor** | Visual programming for robot AI — drag decision nodes, connect with arrows, test in battle | The Flowchart paradigm (D) is directly descended from Gladiabots. The key lesson: visual programming must scale to complex logic without becoming spaghetti. Gladiabots solves this with collapsible sub-trees. |
| **Factorio blueprint editor** | Copy, paste, and share factory designs. Templates are first-class objects. | Doctrines (Paradigm E) are Factorio blueprints for organizational state. The lesson: pre-authored configurations need comparison tools ("how does Doctrine A differ from Doctrine B?"). |
| **XCOM squad management screen** | Assign soldiers to squads, equip loadouts, manage relationships | The Org Chart (Paradigm B) echoes XCOM's squad screen. The lesson: relational views work best when the number of managed units is small (4-8). Beyond 8, the org chart becomes a mess. |
| **PagerDuty incident response** | Escalation policies, on-call schedules, runbook automation | The Control Room (Paradigm C) IS PagerDuty for robot armies. The lesson: incident response matrices must show coverage gaps prominently — the empty cell IS the diagnostic. |
| **Kubernetes deployment manifests** | Declarative state management — define desired state, system converges | Doctrines are declarative state: "the army SHOULD look like this." The Command agent is the Kubernetes controller: checking current state against desired state and issuing changes. The lesson: declarative > imperative for organizational management... but imperative is needed for edge cases. |
| **NFL/NBA play calling** | Coaches design plays (doctrines), call them from the sideline based on game state | The Doctrine Board (Paradigm E) is literally a playbook. The lesson: a good playbook has 5-7 plays, not 50. Fewer options, faster decisions. The meta-skill is knowing WHEN to call each play, not designing more plays. |

---

## The TikTok Clip for Each Paradigm

**Paradigm A (Identical Twin):** Split screen — left shows 11 rules scrolling past, right shows the sealed watch where every rule fires perfectly. Text: "11 rules. 36 commands. Zero conflicts." The complexity IS the flex.

**Paradigm B (Org Chart):** Zoom on the golden tree as connections light up one by one. Each connection triggers a unit behavior change. The tree pulses like a neural network. Text: "I drew the org chart. It ran the army."

**Paradigm C (Control Room):** The decision matrix filling cell by cell, then cut to the battle where each condition triggers. Each cell flash corresponds to a battlefield event. Text: "Runbook complete. Deploying to production."

**Paradigm D (Flowchart):** Fast zoom through a flowchart as decision nodes light up — green, green, red branch, green — ending at the action node that triggers the winning cascade. Text: "The flowchart said yes."

**Paradigm E (Doctrine Board):** Three doctrine cards — blue, grey, red. THRUM. Flash blue. THRUM. Flash grey. THRUM. Flash red. The army transforms three times in 30 seconds. Text: "Three formations. One battle. Zero code."

---

## Discovered Aspects

This analysis surfaces the following new design questions:

1. **3.17a — Multi-Command conflict resolution protocol:** When two Command agents issue conflicting orders to the same subordinate in the same tick, what happens? Locked spec says "one wins" but the resolution rule (ID priority? spatial? freshest signal?) deeply affects competitive meta. Related to 2.00e-i.

2. **3.17b — Command agent self-management rules:** Can a Command agent manage ITSELF? Self-monitoring rules like "if my buffer exceeds 80%, change my own eviction policy" create recursive configuration. What are the limits? Can a Command agent disable its own skills?

3. **3.17c — The "obey command" rule as opt-in subordination design:** The locked spec implies subordinates must have rules that process command overrides. How should this be expressed? A mandatory built-in rule? A toggleable setting? A rule the player must explicitly write? Each choice changes how "rebellious" units can be.

4. **3.17d — Command agent elimination recovery design:** When the sole Command agent dies, how does the army recover? Graceful degradation (units continue with last-received orders) vs. catastrophic collapse (units revert to pre-command defaults) vs. automatic succession (highest-ID remaining unit inherits command)? Each creates different strategic tension around Command protection.

5. **3.17e — The "production requeue" skill gap:** Missions 8-10 (factory vs. factory) may require Command agents to modify the PRODUCTION QUEUE mid-battle (not just subordinate configs). Is `requeue` a 4th Command skill? Or is production queue modification out of scope for in-battle commands, forcing all production decisions to be pre-planned?

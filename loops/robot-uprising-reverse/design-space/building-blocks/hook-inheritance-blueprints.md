# 3.08e — Hook Inheritance and Blueprint Templates: Instance-Specific vs. Shared Channels When Cloning Units from the Same Blueprint

## Overview

**Aspect:** 3.08e — Hook inheritance and blueprint templates
**Wave:** 3 (Building Blocks / Workbench)
**Dependencies:** 3.08 (Hook Taxonomy), 1.04c (Spawn Semantics), 1.04d (Hook Semantics Blocking vs. Queued), 2.01-2.05 (Buffer Model)

Blueprints are Robot Uprising's class definitions. A blueprint specifies a unit type's complete configuration: skills, rules, hooks, context config. When the factory produces a unit from a blueprint, that unit gets a copy of the blueprint's config — skills, rules, buffer size, eviction priorities.

But hooks are not like skills. A skill is self-contained — a Scout with `[Scan Terrain]` scans terrain regardless of what other Scouts exist. A hook is relational — it names a channel, and channels are shared communication infrastructure. When the player wires a hook to broadcast on channel `threat-alpha`, every unit listening on `threat-alpha` receives that signal. The hook is not just config; it is a connection to a shared namespace.

This creates the central question of this aspect.

---

## The Design Question

**When the factory produces three Scouts from the same "Recon Scout" blueprint, and that blueprint has a hook wired to channel `threat-report`, do all three Scouts broadcast on the same channel? Do they listen on the same channel? Can the player make Scout #2 use a different channel than Scout #1 without creating a whole new blueprint?**

This is the class-versus-instance problem. The blueprint is the class. Each spawned unit is an instance. The question is which parts of the hook configuration are class-level (shared by all instances) and which are instance-level (unique per unit).

The answer shapes:
- **How much the player manages per-unit** — if every unit needs individual channel wiring, the management overhead scales linearly with army size
- **How emergent the swarm behavior is** — if all Scouts broadcast on the same channel, the player gets swarm coordination for free; if they broadcast on separate channels, the player must explicitly wire coordination
- **How the player debugs signal noise** — three Scouts on one channel triple the signal volume; three Scouts on three channels require three listeners
- **What "blueprint" means** — is it a complete deployable config or a template with blanks to fill?
- **Whether the factory is a one-click deployment or a per-unit configuration step**

---

## Mechanical Specification: Four Models

### Model A: Pure Copy — All Instances Share Everything

**The mechanic:** When the factory produces a unit from a blueprint, the unit gets an exact copy of the blueprint's hook configuration. Channel names are literal strings baked into the blueprint. Every Scout produced from "Recon Scout" broadcasts on `threat-report` and listens on `command-orders`. No per-instance variation. The factory is a stamp press.

**Implementation:**
- Blueprint editor: player wires hooks with explicit channel name strings
- Factory production: one click per unit, zero additional configuration
- All instances of a blueprint are functionally identical at spawn time
- Divergence only occurs through runtime experience (different buffer contents from different battlefield positions)

**What it feels like in the workbench:** The player opens the "Recon Scout" blueprint. The hook panel shows two hook slots. Slot 1: `ON_SPOT_ENEMY -> broadcast on [threat-report]`. Slot 2: `ON_RECEIVE_SIGNAL from [command-orders] -> execute Evade`. The player saves. Opens the factory. Clicks "Produce" three times. Three identical Scouts appear in the production queue. No further input needed. The factory hums.

**The swarm consequence:** All three Scouts are now on the same channel. When Scout #1 spots an enemy, it broadcasts on `threat-report`. Scout #2 and Scout #3 both receive that signal (along with any Relays or Command units listening). This is instant swarm awareness — one Scout's eyes become all Scouts' knowledge. But it is also instant noise multiplication: if all three spot the same enemy cluster on the same tick, three redundant signals flood `threat-report`. The Relay downstream receives three copies of effectively the same data.

**The identity problem:** In the debrief, when the player scrubs to tick 14 and sees a signal on `threat-report`, they cannot distinguish which Scout sent it without additional metadata. All three are "Recon Scout." The signal looks the same. The player must rely on positional data embedded in the signal payload (if the hook taxonomy supports positional payloads) to trace the source.

---

### Model B: Template with Instance Slots — Blueprints Define Structure, Instances Fill Blanks

**The mechanic:** The blueprint defines hook structure — which trigger, which action — but channel names are **parameters** with default values that can be overridden per instance. The blueprint says: `ON_SPOT_ENEMY -> broadcast on [channel: threat-report]`. The bracketed channel name is a fillable slot. When the factory produces a unit, the player can accept the default (`threat-report`) or type a different channel name for that specific unit.

**Implementation:**
- Blueprint editor: hooks use parameterized channel names with defaults — displayed as editable fields with a pencil icon indicating "overridable"
- Factory production: a "Configure" step appears after "Produce" — a slim panel showing each hook's channel parameter with the default pre-filled
- Quick-deploy option: "Accept Defaults" button that skips the Configure step and stamps the blueprint exactly (functionally identical to Model A)
- Per-instance overrides are stored on the unit, not on the blueprint — editing the blueprint later does NOT retroactively change already-spawned units

**What it feels like in the workbench:** The player opens the factory. Clicks "Produce" on "Recon Scout." A thin configuration panel slides out from the right — two rows, one per hook. Each row shows the trigger icon, an arrow, and an editable text field pre-filled with the default channel name. The fields glow soft amber, indicating "editable but has a default." The player looks at Scout #1 and accepts defaults — click "Deploy." Scout #2 — the player clicks into the channel field for hook slot 1 and types `threat-report-north`. Scout #2 will broadcast on a different channel. Scout #3 gets `threat-report-south`.

Now the player has three Scouts from the same blueprint on three different channels. One blueprint, three communication topologies. The Relay downstream needs to listen on all three — or the player creates three Relay instances configured to each sub-channel.

**The power user pattern:** Experienced players develop naming conventions. `threat-report-{sector}` becomes a template in their head. They mentally substitute sector names per instance. The game does not enforce this convention — it emerges from player practice, like variable naming conventions emerge in programming communities.

---

### Model C: Automatic Instance Namespacing — The System Isolates Instances

**The mechanic:** The system automatically appends instance IDs to channel names. The blueprint says `threat-report`, but Scout #1 actually broadcasts on `threat-report:unit-07`, Scout #2 on `threat-report:unit-08`, Scout #3 on `threat-report:unit-09`. Each instance gets its own isolated channel by default. To share a channel, the player must explicitly configure a "shared channel" override.

**Implementation:**
- Blueprint editor: hooks use plain channel names — no visible instance-ID suffix
- Factory production: each unit auto-receives a unique instance ID (displayed as a small badge on the unit card)
- Channel resolution: `channel-name` in the blueprint becomes `channel-name:instance-id` at runtime
- Shared channel toggle: a checkbox per hook — "Share channel across all instances" — which strips the instance suffix and uses the raw blueprint channel name
- Listeners must specify whether they listen to `threat-report:*` (wildcard, all instances) or `threat-report:unit-07` (specific instance)

**What it feels like in the workbench:** The player produces three Scouts. Opens the battlefield channel map — a network visualization showing all active channels as colored lines between unit icons. Instead of one `threat-report` line connecting all three Scouts to the Relay, the player sees three separate lines: `threat-report:unit-07`, `threat-report:unit-08`, `threat-report:unit-09`. Each Scout has its own private line to nothing — no listeners are configured for the instance-specific channels yet.

The player's first reaction: confusion. "Why aren't my Scouts talking to the Relay?" They open the Relay's hook config. The Relay listens on `threat-report` — but the Scouts are broadcasting on `threat-report:unit-07`, not `threat-report`. The channel names don't match. The player sees the mismatch in the channel map: three orphaned lines on the Scout side, one disconnected line on the Relay side.

The player has two choices:
1. Change the Relay's listen channel to `threat-report:*` (wildcard) — the Relay now hears all Scouts
2. Go back to each Scout and check "Share channel" — stripping the instance suffix, putting all Scouts on raw `threat-report`

Both work. Choice 1 preserves instance isolation while allowing aggregate listening. Choice 2 collapses back to Model A behavior.

**The advanced pattern:** Instance-specific channels enable **selective listening**. The Command unit can listen to `threat-report:unit-07` specifically — only Scout #1's reports. This creates targeted information routing impossible in Model A. The player builds a hierarchy: Command listens to sector lead Scouts individually, sector lead Scouts listen to sub-Scouts via wildcard. Information flows up through named pipes, not a shared bus.

---

### Model D: Hybrid — Blueprint Defines Scope, Instances Inherit Scope

**The mechanic:** Channels in the blueprint are tagged with a **scope** attribute: `shared`, `instance`, or `squad`. Shared channels work like Model A — all instances use the literal name. Instance channels work like Model C — auto-namespaced per unit. Squad channels introduce a third scope: all units produced in the same factory batch share a channel, but units from different batches get different channels.

**Implementation:**
- Blueprint editor: each hook's channel has a scope dropdown — three icons: a broadcast tower (shared), a single unit silhouette (instance), a group silhouette (squad)
- Factory production: "Produce Batch" button produces N units simultaneously; all units in a batch share squad-scoped channels
- Squad IDs are auto-assigned per batch (e.g., `alpha`, `bravo`, `charlie`)
- Channel resolution: shared = literal name; instance = `name:unit-id`; squad = `name:squad-id`
- Listeners specify scope in their listen config — "listen to squad `alpha`" or "listen to all squads on channel X"

**What it feels like in the workbench:** The player opens "Recon Scout" blueprint. Hook slot 1: `ON_SPOT_ENEMY -> broadcast on [threat-report] scope: [shared]`. Hook slot 2: `ON_RECEIVE_SIGNAL from [squad-orders] scope: [squad]`. The player understands: threat reports go to everyone, but squad orders are private to the batch.

The player opens the factory. Clicks "Produce Batch (3)." Three Scouts spawn as Squad Alpha. They share `squad-orders:alpha` — a private coordination channel. Their threat reports go on the global `threat-report` channel. The player produces another batch of 2 — Squad Bravo. Same blueprint, different squad channel. Five Scouts, two squads, one shared threat channel.

---

## Player Journeys

### Journey 1: The Accidental Flood — Naya, 24, Data Engineer, First Week

**Context:** Mission 8 — "Sensor Grid." Naya needs to deploy 6 Scouts to cover a wide map. She has one blueprint, "Perimeter Scout," with a hook: `ON_SPOT_ENEMY -> broadcast on [contact]`. Her single Relay listens on `contact` and forwards to the Command unit. She is using Model A (pure copy) behavior — she has not yet encountered instance channels.

**Minute 0:00 — The Factory**
Naya opens the factory panel. A dark metallic surface with blueprint cards arranged in a horizontal rack. "Perimeter Scout" sits in the first slot — a small card showing a Scout silhouette, two hook icons (the broadcast tower and the inbox), and a "Produce" button glowing cool blue. She clicks Produce six times. Six Scout tokens appear in the production queue — a vertical stack on the right side of the factory panel, each token a small circle with a number badge. A satisfying mechanical ka-chunk sound plays with each click, like a stamping press. The queue counter reads "6/6 ready." She clicks "Deploy All." The Scouts scatter to their pre-assigned waypoints.

**Minute 2:00 — The Flood**
Execution begins. The Scouts fan out. At tick 9, Scouts #1, #2, and #3 all enter visual range of the same enemy patrol. Three `ON_SPOT_ENEMY` triggers fire simultaneously. Three signals hit `contact` in the same tick. The Relay's buffer — capacity 4 — absorbs all three. The Relay forwards a compressed signal to Command. Command receives one observation that is actually three overlapping observations mashed together.

At tick 11, the enemy patrol shifts. Now Scouts #2, #3, #4, and #5 all see it. Four signals on `contact`. The Relay's buffer, already holding stale data from tick 9, now receives 4 more. Buffer at capacity. One signal drops. A tiny red blip appears on the battlefield view — a signal that never arrived, visualized as a fading ember on the channel line between Scout #5 and the Relay.

Naya does not notice the dropped signal. Mission completes with partial success. In the debrief, the signal timeline shows a dense cluster of overlapping signals on `contact` — a thick band of colored bars packed like a barcode. The debrief labels it: "Channel `contact` — 23 signals in 40 ticks — 4 dropped." A small efficiency metric in the corner: "Signal Utilization: 62%." Naya frowns.

**Minute 5:00 — The Realization**
Naya opens the channel map in debrief. Six Scout icons on the left, one Relay in the middle, one Command on the right. Six lines converge on the Relay — all the same color, all labeled `contact`. She sees it: a funnel. Six mouths, one throat. The Relay is a bottleneck not because it is slow but because everyone is yelling into the same pipe.

She thinks: "I need to split these channels." She goes back to the workbench. But her blueprint only has one channel name. She realizes she needs either (a) six different blueprints with different channel names, which is tedious, or (b) a way to override the channel per unit.

If the game offers Model B (template with instance slots), a small pencil icon on the channel name field catches her eye. She clicks it, types `contact-north` for Scouts #1-3 and `contact-south` for Scouts #4-6. She creates two Relays — one per sub-channel. The funnel becomes two funnels. Signal utilization jumps to 89%.

**What Naya is thinking:** "This is pub-sub. I just reinvented topic partitioning." She is a data engineer. The Kafka analogy lands with zero explanation needed.

---

### Journey 2: The Squad Architect — Marcus, 31, Former Military, Turn-Based Strategy Veteran

**Context:** Mission 14 — "Pincer." Marcus needs two strike teams to converge on an objective from opposite sides. He wants each team to coordinate internally without leaking information to the other team (the enemy has intercept units that can tap shared channels). He is using Model D (hybrid scope).

**Minute 0:00 — Blueprint Design**
Marcus opens the "Assault Striker" blueprint. Two hook slots. He configures:
- Slot 1: `ON_ENGAGE -> broadcast on [strike-confirm] scope: squad` — when a Striker eliminates a target, it tells its own squad, not the whole army
- Slot 2: `ON_RECEIVE_SIGNAL from [go-signal] scope: shared -> execute Breach` — the go-signal comes from Command and hits everyone simultaneously

The scope icons are crisp on the blueprint card. The broadcast tower (shared) on slot 2. The group silhouette (squad) on slot 1. Marcus reads them instantly — he thinks in terms of radio nets. Squad net for tactical, command net for strategic.

**Minute 1:30 — Factory Batching**
Marcus opens the factory. He clicks "Produce Batch (3)" — three Strikers spawn as Squad Alpha. He clicks "Produce Batch (3)" again — three more spawn as Squad Bravo. The factory panel shows two batch groups, each with a colored border — Alpha in amber, Bravo in steel blue. The batch colors propagate to the unit tokens on the battlefield preview: amber dots on the west approach, blue dots on the east.

Each squad has its own `strike-confirm` channel: `strike-confirm:alpha` and `strike-confirm:bravo`. Both squads share `go-signal` — when Command fires it, all six Strikers receive it.

**Minute 3:00 — The Channel Map**
Marcus opens the channel map. It looks like a military org chart. Command at the top, a single green line labeled `go-signal` descending to a fork — left to three amber nodes (Alpha), right to three blue nodes (Bravo). Within each squad cluster, amber lines loop between the three Alpha members on `strike-confirm:alpha`. Blue lines loop between the three Bravo members on `strike-confirm:bravo`. No cross-contamination.

Marcus nods. This is exactly the comms architecture he'd draw on a whiteboard for a real operation. Two independent fire teams, one command frequency, two tactical frequencies.

**Minute 6:00 — Execution**
Command fires `go-signal`. All six Strikers activate Breach simultaneously — a synchronized wave of orange forge-sparks as they commit to their approach vectors. Alpha converges from the west. Alpha-1 engages the first target, fires `strike-confirm` on the squad channel. Alpha-2 and Alpha-3 receive it — their rules say "if squad member confirms strike, shift to next waypoint." They advance. Bravo, on the east side, knows nothing of Alpha's progress. They execute independently on their own cadence.

The enemy intercept unit scans for signals. It is listening on `strike-confirm` — the raw, unscoped name. It hears nothing. The squad-scoped channels are `strike-confirm:alpha` and `strike-confirm:bravo` — different channel addresses. The intercept unit would need to listen on `strike-confirm:*` (wildcard) to catch them, and this mission's intercept units are not configured with wildcard listeners. Marcus's channel discipline defeats electronic warfare.

**What Marcus is thinking:** "COMSEC through architecture, not encryption. The enemy can't intercept what they can't address." He is grinning.

---

### Journey 3: The Refactorer — Suki, 22, CS Student, Screeps Player

**Context:** Mission 18 — "Sprawl." Suki has 14 units across 4 blueprints. She started the mission by stamping units with default channels (Model A behavior). Her army works but is brittle. She wants to refactor her channel architecture without rebuilding every blueprint from scratch.

**Minute 0:00 — The Pain**
Suki's channel map is a hairball. Fourteen units, one `report` channel, one `orders` channel. Every unit talks to every other unit through two overloaded pipes. Signal utilization: 31%. Dropped signals: 19. The debrief's channel map looks like a star topology drawn by a toddler — lines everywhere, all the same color.

She knows the fix: partition channels by role and sector. But she has 14 units already deployed. In Model A, changing the blueprint's channel name would only affect future units — her 14 deployed units are already stamped with the old channel names.

**Minute 1:00 — Instance Override Discovery**
Suki right-clicks a deployed Scout on the battlefield. A context menu appears. She sees "Hook Config" — a panel showing the unit's current hook wiring, inherited from its blueprint. The channel name fields are editable. A small pencil icon, a text cursor blinking in the field. She can change this unit's channel names without touching the blueprint.

She types `report-sector-1` for Scout #1. The channel map updates in real time — one line detaches from the central `report` hub and connects to a new, isolated node labeled `report-sector-1`. The line turns from the congested red of an overloaded channel to a calm green of a low-traffic channel.

**Minute 3:00 — Bulk Override**
Suki discovers she can multi-select units. She shift-clicks Scouts #1-4, opens the bulk hook config panel, and types `report-north`. All four Scouts' lines snap to the new channel simultaneously — four red lines detach from the hairball and re-form as a clean green cluster. The channel map visibly untangles.

She repeats for Scouts #5-8 (`report-south`), Strikers #1-4 (`strike-east`, `strike-west` by pairs). She rewires her Relays to listen on the new sector channels. The channel map transforms over 4 minutes from a chaotic star to a structured tree. Signal utilization prediction (shown as a live estimate in the channel map header): 78%.

**Minute 7:00 — The Blueprint Update**
Now Suki goes back to the blueprint editor. She updates "Recon Scout" to use `report-{sector}` as the default channel name — a parameterized default with a placeholder. Future Scouts produced from this blueprint will prompt for a sector name in the factory's configure step. Her existing 14 units are unaffected — their overrides persist. But her next production run will be cleaner from the start.

**What Suki is thinking:** "I just refactored a distributed system's pub-sub topology without redeploying a single service. This is exactly what I do in Screeps, except here the channel map shows me the topology visually instead of me having to `console.log` it." She screenshots the before-and-after channel maps and posts them to the game's subreddit.

---

## Strengths and Weaknesses

### Model A: Pure Copy
**Strengths:** Zero management overhead. The factory is a one-click stamp press. Swarm behavior emerges automatically — all units of the same type coordinate through shared channels. Easiest to teach. Lowest cognitive load per unit produced.
**Weaknesses:** No per-unit customization without creating new blueprints. Channel congestion scales linearly with army size. Signal noise from redundant reports. The player cannot build asymmetric topologies (sector-based routing, squad isolation) without blueprint proliferation. Debugging is harder — all units look identical on the channel map.

### Model B: Template with Instance Slots
**Strengths:** Best balance of convenience and flexibility. Default channels give Model A simplicity for players who do not need per-unit control. Override slots give advanced players surgical control. Mirrors real-world config-with-defaults patterns. The factory's "Accept Defaults" button preserves one-click deployment.
**Weaknesses:** The override step in the factory is a speed bump. Players who always override are doing repetitive text entry — they need bulk tools (naming patterns, auto-increment). The distinction between "blueprint default" and "instance override" is a new concept that must be taught. When the player edits the blueprint, they must understand that existing units keep their old config.

### Model C: Automatic Instance Namespacing
**Strengths:** Prevents accidental noise floods by default. Forces the player to explicitly opt into shared channels, which means shared channels are always intentional. Instance-specific channels enable precise per-unit routing. Wildcard listeners (`channel:*`) introduce a powerful pattern-matching concept.
**Weaknesses:** Violates the principle of least surprise — the player expects identical blueprints to produce identically-wired units, but they silently get different channel addresses. The first-time confusion ("why aren't my Scouts talking to my Relay?") is a bad kind of surprise — it looks like a bug, not a feature. Requires the wildcard concept before the player can even use basic multi-unit communication. Too much infrastructure for early missions.

### Model D: Hybrid Scope
**Strengths:** The most expressive model. Shared, instance, and squad scopes cover every real communication pattern. Squad batching maps to military comms doctrine, which is thematically perfect. The scope icons on the blueprint card are immediately readable — broadcast tower, single silhouette, group silhouette. Enables COMSEC-through-architecture gameplay.
**Weaknesses:** Three scope types plus batching plus wildcard listeners is a lot of concept surface. The squad concept requires batched production, which is a factory mechanic that must be taught separately. "What scope should I use?" is a non-trivial decision for every hook on every blueprint. Risk of over-engineering early blueprints.

---

## Interaction Effects

**With Hook Taxonomy (3.08):** The trigger vocabulary determines what signals are worth isolating per-instance. If `ON_SPOT_ENEMY` payloads include position data, instance-specific channels become less necessary — the listener can distinguish Scouts by payload content. If payloads are opaque (just "enemy spotted"), per-instance channels are the only way to know which Scout reported.

**With Buffer Model (2.01-2.05):** Shared channels multiply inbound signal volume per listener. A Relay with buffer capacity 4 listening on a shared channel with 6 Scouts will drop signals. Instance-specific or squad-scoped channels reduce per-listener inbound volume, directly reducing buffer pressure. The buffer model and the channel model are two sides of the same throughput equation.

**With Spawn Semantics (1.04c):** When an agent spawns a child from a blueprint, does the child inherit the parent's instance-specific channel overrides or the blueprint's defaults? If the parent Scout has been overridden to `report-north` and it spawns a child Scout, does the child get `report-north` or the blueprint default `report`? This is the spawn-inheritance interaction — a direct extension of the inheritance mask decision from 1.04c.

**With Context Config (buffer size, listen/ignore filters):** Listen filters and channel naming are complementary noise-reduction tools. A unit can listen on a shared channel and use a filter to ignore signals from certain sources, OR it can listen on an instance-specific channel that only receives signals from the desired source. These are equivalent in outcome but different in cognitive model — filters are reactive (accept/reject arriving signals), channel naming is proactive (only the right signals arrive in the first place).

**With the Debrief (4.04):** The channel map visualization in debrief is critical for all models. Model A needs signal-source annotations to distinguish identical units. Model B needs "override indicator" badges on units whose channels differ from their blueprint. Model C needs wildcard expansion views showing which instance channels a wildcard listener matched. Model D needs scope-colored channel lines — amber for squad, green for shared, silver for instance.

**With Campaign Progression (5.04):** The natural unlock order: Model A for Missions 1-7 (shared channels only, learn the basics). Model B unlocks at Mission 8-10 (instance overrides, the "I need to split channels" moment). Model D's squad scope unlocks at Mission 12+ (multi-team coordination). Model C's automatic namespacing is arguably never needed as a player-facing model — it is an implementation detail behind Model D's instance scope.

---

## Comparable Games, Systems, and Patterns

**OOP Class/Instance Pattern:** The blueprint is a class. Each spawned unit is an instance. Model A is a class with no instance variables — all instances share the class's static fields. Model B is a class with constructor parameters that have defaults. Model C is a class where the constructor auto-generates a unique ID and namespaces all channels. Model D is a class with scoped visibility modifiers — `public` (shared), `private` (instance), `protected` (squad). Any programmer will recognize this immediately. The design question is literally "what is the default visibility of a channel declaration?"

**Factorio Blueprint Books:** Factorio blueprints stamp identical copies of a factory section. All inserters, belts, and assemblers are wired exactly as designed. There is no per-instance override — if you want a variation, you create a new blueprint. This is pure Model A. Factorio players manage variation through blueprint books (collections of similar-but-different blueprints), not through instance overrides. The management overhead of maintaining 12 blueprint variants is a known pain point in Factorio.

**Kubernetes Pod Templates and ConfigMaps:** A Kubernetes Deployment defines a pod template. All pods in the replica set are identical. But each pod gets a unique hostname, and environment variables can be injected per-pod via ConfigMaps. This is Model B — template with overridable parameters. The Kubernetes pattern validates Model B's approach: template-with-defaults is the industry standard for "deploy N copies of a thing with minor per-instance variation."

**Military Radio Nets:** A platoon operates on multiple radio frequencies — a platoon net (shared), squad nets (squad-scoped), and individual callsigns (instance). This is exactly Model D. The military comms analogy is the strongest thematic fit for Robot Uprising's setting. Channel scope = radio net assignment. The player is a signals officer assigning frequencies.

**Screeps Creep Memory:** In Screeps, creeps (units) spawned from the same body configuration are independent objects with independent memory. The programmer must manually assign them to groups, roles, and communication channels via code. There is no blueprint-level channel inheritance — everything is instance-level by default. This is effectively Model C without the automatic namespacing — the programmer must do all the wiring themselves. Screeps players spend significant code managing creep assignment and communication topology.

**StarCraft Control Groups:** Not a direct analog, but the player assigns units to numbered control groups for management. This is a UI layer on top of identical units — "these 4 Marines are group 1, those 4 are group 2." The control group does not change the units' behavior. Robot Uprising's squad scope (Model D) goes further — the squad assignment changes what channels the unit communicates on, not just how the player selects them.

---

## Sensory Description

### The Blueprint Editor — Wiring a Hook

The blueprint editor is a dark workspace, matte charcoal with faint grid lines like engineering graph paper. The blueprint card sits center-frame — a rectangular panel the size of a playing card, rendered in a slightly lighter gray with a thin luminous border in the unit type's color (Scout = teal, Striker = crimson, Relay = amber).

The hook slots are on the right side of the card, stacked vertically. Each slot is a horizontal strip — a trigger icon on the left (the eye, the skull, the inbox), an arrow in the middle, and a channel name field on the right. The channel name field is a dark input box with monospaced text in a soft phosphor green — it looks like a terminal input, because it is one. The player types a channel name and the characters appear with a faint typewriter tick, each letter locking into place.

When the player sets a scope (Model D), a small icon appears to the left of the channel name — the broadcast tower, single silhouette, or group silhouette. The icon pulses once when set, then settles into a steady glow. Shared channels glow green. Instance channels glow silver. Squad channels glow the warm amber of a private frequency.

### The Factory — Stamping Units

The factory panel has the weight of industrial machinery. A horizontal conveyor belt runs across the bottom third of the screen, rendered in dark steel with riveted edges. Blueprint cards sit in a rack above the belt — the player drags a card down to the belt to begin production.

Each production click triggers a stamping animation: a hydraulic press descends from above with a pneumatic hiss, meets the conveyor surface, and lifts to reveal a new unit token — a small circular chip with the unit type icon embossed on it. The chip slides rightward along the belt toward the "Deploy" zone.

In Model B, when the player clicks "Produce," a thin configuration drawer slides up from beneath the conveyor — translucent dark glass showing the hook channel fields with their defaults. The defaults pulse soft amber: "override me or accept me." The player either types new values (typewriter tick per character) or clicks "Accept Defaults" — a satisfying stamp-clunk, and the drawer retracts.

In Model D with batch production, the player clicks "Produce Batch." The press descends multiple times in rapid succession — three hisses, three clunks, three chips sliding onto the belt in a tight group. A colored band wraps around the batch — amber for Alpha, steel blue for Bravo — and a small squad label appears above the group: "Squad Alpha." The batch moves as a unit along the conveyor.

### The Channel Map — Seeing the Topology

The channel map is a full-screen overlay, triggered by a button in the workbench toolbar or the debrief. The background dims to near-black. Unit icons float as luminous nodes — each one a small circle in the unit type's color, with a faint pulsing halo. Channel connections are drawn as curved lines between nodes, each line colored by scope: green for shared, silver for instance, amber for squad.

Active channels — channels carrying signals in the current tick — brighten and thicken. A signal in transit appears as a bright dot traveling along the channel line, like a spark along a wire. When a signal drops (buffer full), the dot hits the receiving node and shatters into red fragments that scatter and fade — a visible, visceral loss.

An overloaded channel throbs red. The line thickens and vibrates, like a pipe under too much pressure. The player can almost hear it straining. A tooltip shows: "Channel `report` — 6 senders, 1 listener, 4-slot buffer — signal loss: 38%." The red throb is the game telling the player: this pipe is too narrow for this much data.

A clean topology — well-partitioned channels, balanced load — has a different visual character entirely. The lines are thin and calm. The signal dots travel smoothly. The colors are cool and steady. The channel map looks like a well-designed circuit board: orderly traces, no crossings, no congestion. The player can feel the difference before they read a single number.

---

## The TikTok Clip

**"One Blueprint, Three Personalities"**

The clip opens on the factory panel — a single "Recon Scout" blueprint card, centered. The player clicks Produce three times (three rhythmic clunks). A thin config drawer appears. Speed-up cut: the player types three different channel names — `eyes-north`, `eyes-center`, `eyes-south` — each with a quick keyboard rattle. Three Scout tokens slide down the conveyor in a row.

Cut to battlefield. Three Scouts fan out — north, center, south. The channel map overlays in the corner, showing three clean separate lines in teal. An enemy patrol crosses the center Scout's path. One signal fires on `eyes-center` — a single bright spark traveling a single clean line to the Relay. The north and south channels stay silent. Zero noise.

Cut to the debrief stat: "Signal Utilization: 94%." The player's cursor hovers over it, then pans to the channel map — three separate teal lines, no tangles, no red.

Smash cut to a "before" clip: the same three Scouts on one shared channel. Signal Utilization: 41%. Channel map is a congested red knot. The player's face cam shows a wince.

Back to the clean version. Caption over the final frame: **"Same blueprint. Different wiring. 94% signal clarity."** The clip is 18 seconds. The comments will be full of people posting their own before-and-after channel maps.

---

## Discovered New Aspects

- **3.08f — Channel naming conventions and parameterized defaults**: should the blueprint editor support template variables in channel names (`report-{sector}`, `squad-{batch_id}`) and auto-expand them at production time? What is the naming grammar?
- **3.08g — Channel map as primary debugging surface**: the channel map as a first-class UI panel (not just debrief), with real-time signal flow visualization, congestion warnings, and topology suggestions
- **4.04b — Spawn genealogy in debrief**: when a spawned unit inherits or overrides channel config, the debrief should show the inheritance chain — which blueprint, which overrides, when the override happened
- **3.09a — Wildcard listeners and pattern matching on channels**: the `channel:*` pattern from Model C as a general-purpose listening tool — glob patterns, regex, or structured prefixes for channel address matching

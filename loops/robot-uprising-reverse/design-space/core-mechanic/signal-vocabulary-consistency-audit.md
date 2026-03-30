# 4.104 — The Rosetta Constraint: Signal Vocabulary Consistency as Data-Model Invariant

**Aspect:** 4.104 — Signal vocabulary consistency audit as design requirement: the genealogy panel and the pre-ranking drawer must use exactly identical string identifiers for agents, signals, and ticks; any naming divergence (e.g., "RELAY-C" in drawer vs. "relay-c" in genealogy tooltip) breaks vocabulary unification; this is a data-model constraint — both tools must render from the same data model, not parallel models with cross-referenced IDs; interaction with 8.08 real-language vocabulary claim

**Parent:** 4.66 — Signal genealogy as pre-ranking source (cross-tool linking)
**Siblings:** 4.102 — Genealogy neighborhood expansion on first arrival; 4.103 — Counterfactual genealogy overlay; 4.105 — "Why was this signal dropped?" sub-panel
**Related:** 8.08 — Real-language vocabulary claim; 4.16 — Signal genealogy visualization; 4.58 — Pre-ranking transparency panel; 3.08d — Behavior tree read-only visualization in Inspector; 4.15 — Probe hooks; 8.09 — Diagnostic layer as teaching arc; 8.08b — Codex real-world parallels

---

## The Core Concept: One Name, One String, One Source

Every diagnostic surface in Robot Uprising renders the same underlying match simulation. The pre-ranking transparency drawer (4.58) explains why an element is suspicious. The signal genealogy graph (4.16) shows how signals propagated through the network. The probe log (4.15) records hook-triggered observations. The buffer inspector (4.03) displays slot contents at a given tick. The behavior tree view (3.08d) renders the evaluation path with hook trigger nodes and buffer query nodes.

All of these tools display agent names, signal identifiers, tick numbers, channel names, and action labels. **The Rosetta Constraint says: every one of these strings must originate from a single canonical data model, and every rendering surface must consume that model directly. No copies. No translations. No parallel registries.**

This is not a style guide. It is not a "try to keep names consistent" best practice. It is a hard architectural invariant — the kind of constraint you enforce in code, not in documentation. The reason is not aesthetic tidiness. The reason is that Robot Uprising's entire pedagogical claim (8.08) depends on vocabulary being trustworthy. If the game teaches players that "RELAY-C" is a meaningful identifier for a specific agent in a specific match, then "RELAY-C" must be the same string everywhere that agent appears. If the pre-ranking drawer says "RELAY-C" and the genealogy tooltip says "relay-c" and the probe log says "Relay C" and the buffer inspector says "R-C," the player is not learning one vocabulary. They are learning four vocabularies and performing constant mental translation between them. That translation cost is invisible to the developer — the developer knows all four strings mean the same thing — but it is corrosive to the player, who is trying to build a mental model of a system that already has thirty new concepts in it.

### Why This Is a Data-Model Problem, Not a Display Problem

The naive fix for naming inconsistency is a display-layer normalization pass: "Before rendering any agent name, run it through `formatAgentName()` to ensure consistent casing and formatting." This is wrong for three reasons.

**First**, it presupposes that the inconsistency is in formatting rather than in identity. If the pre-ranking drawer and the signal genealogy are consuming different data models — the drawer reading from a pre-ranking heuristic model that stores agent references as strings, the genealogy reading from a replay graph model that stores agent references as node IDs with attached display names — then `formatAgentName()` is papering over a structural divergence. The drawer's "RELAY-C" and the genealogy's "relay-c" are not the same entity rendered differently. They are different entities that happen to refer to the same agent. When you add a new diagnostic surface (say, the counterfactual overlay from 4.103), you now need to cross-reference against both models to find the right entity. The join becomes an n-way join. The bugs multiply combinatorially.

**Second**, display-layer normalization hides bugs. If the pre-ranking heuristic model has a stale reference to an agent that was renamed or removed, the normalization function will silently render a plausible-looking name that points to nothing. The player sees "RELAY-C" in the drawer, clicks the cross-tool link (4.66), and the genealogy highlights... nothing. Or worse, highlights a different RELAY-C from a previous match state. The display looks fine. The data is broken.

**Third**, the player's mental model should map to the data model, not to a display abstraction. When a player learns that "RELAY-C" is the third relay in their network, they are learning a concrete referent in a concrete system. If that referent is a display-layer artifact rather than a data-model entity, then the player's mental model is built on sand. This matters directly for 8.08's real-language vocabulary claim: in real agentic AI systems, the canonical name for a component is the identifier in the code, not the label in the dashboard. Robot Uprising should teach that discipline, not undermine it.

### The Canonical Data Model

The match simulation produces a single canonical data structure: the **match record**. Every diagnostic surface reads from the match record. The match record contains:

- **Agent registry**: an ordered list of agent entries, each with a canonical string ID (`RELAY-C`, `SCOUT-B`, `STRIKER-A`), a unit type, a player-assigned display name (if any), and a configuration snapshot.
- **Signal log**: a chronological sequence of signal events, each with a sender agent ID (from the registry), a receiver agent ID (from the registry), a channel name, a tick number, a payload type, and a fidelity value.
- **Tick index**: a mapping from tick number to the full simulation state at that tick — agent positions, buffer contents (referencing signals by their signal log IDs), active skills, evaluated rules.
- **Heuristic annotations**: the pre-ranking heuristic's output, stored as references into the agent registry and signal log. "RELAY-C was active at tick 52" is stored as `{agent_id: "RELAY-C", tick: 52, metric: "activity", value: 0.81}` — not as a separate string, but as a pointer into the registry.

Every diagnostic surface — drawer, genealogy, probe log, buffer inspector, behavior tree, counterfactual overlay — reads agent names from `agent_registry[id].canonical_id`. Every surface reads signal references from `signal_log[index]`. Every surface reads tick numbers from `tick_index[n]`. There is no second source. There is no "drawer model" or "genealogy model." There is the match record, and there are rendering functions.

### What Breaks When Names Diverge

The failure modes are not hypothetical. They are the precise moments where a player's learning trajectory derails.

**Broken cross-tool navigation (4.66).** The pre-ranking drawer says "RELAY-C was active at tick 52." The player clicks "tick 52." The genealogy panel opens and highlights... nothing, because internally it indexed agents as "relay_c" (snake_case from a different serialization path) and the click handler did a string comparison that failed. The player concludes: "The genealogy panel doesn't know about RELAY-C. These tools are disconnected." They stop using the cross-tool link. They stop using the genealogy. A diagnostic layer that costs months to build becomes undiscoverable dead weight.

**False mental model.** The probe log shows "Signal from SCOUT-B on channel recon-net at tick 14." The buffer inspector shows "Slot 3: recon_net signal, age 2." The player asks: is "recon-net" the same as "recon_net"? In the data model, yes — both refer to the same channel. But the player does not know that. They now carry two channel names in working memory for one channel. When they later try to set up a hook on "recon-net" in the workbench, they might type "recon_net" because that is what the buffer inspector showed. If the workbench accepts both, the inconsistency propagates. If the workbench rejects one, the player is confused by an error that was caused by the game's own display inconsistency, not by their misunderstanding.

**Undermined 8.08 claim.** The real-language vocabulary claim (8.08) asserts that Robot Uprising's terms map to real engineering concepts. In real systems, naming consistency is a first-order engineering concern. Kubernetes does not call a pod "Pod" in the API and "pod" in kubectl and "POD" in the dashboard. The identifier is the same string everywhere, because identifier consistency is what makes a distributed system debuggable. If Robot Uprising's own diagnostic tools violate this principle, the game is teaching the opposite of what it claims: it teaches that names are approximate, that you should expect to translate between tool-specific conventions, that the system does not have a single source of truth. This is anti-pedagogy.

---

## Player Journeys

#### Journey: Marisol, 16, High School Student from Cebu City
**Context:** Mission 6 ("The Undercity Relay"), first encounter with a three-relay chain. Marisol has just unlocked the signal genealogy panel but has not opened it. She has been using the pre-ranking drawer since Mission 4. She named her agents herself: KUYA (Scout), RELAY-ATE (first relay), RELAY-BUNSO (second relay), STRIKER-BAYANI (assault unit). This is her first mission with player-assigned display names.

**Minute 0:00 — The Failure**
The match plays out on a rain-slicked rooftop grid in Cebu's Fuente district. Neon reflections ripple in puddles between cracked solar panels. STRIKER-BAYANI freezes at tick 38 — buffer overflow. The status bar reads STUNNED in dim amber. Enemy drones swarm through the gap. Mission failed. The debrief opens. The pre-ranking drawer slides in from the right, its dark background glowing with amber text. First line: "RELAY-ATE was active at tick 36 — the pivot tick. Volatility: 0.74."

**Minute 0:45 — The Click**
Marisol taps "tick 36" in the drawer. The signal genealogy panel unfolds for the first time — she has never seen it before. A network graph materializes: four nodes, labeled KUYA, RELAY-ATE, RELAY-BUNSO, STRIKER-BAYANI. Edges glow as signals traverse them. The graph is centered on tick 36, RELAY-ATE highlighted in amber. She can see the signal: KUYA detected an enemy cluster at tick 34, sent a signal on "threat-grid" to RELAY-ATE at tick 35, RELAY-ATE forwarded to RELAY-BUNSO at tick 36, RELAY-BUNSO forwarded to STRIKER-BAYANI at tick 37 — but STRIKER-BAYANI's buffer was already full. The signal was dropped at tick 37. By tick 38, STRIKER-BAYANI stunned.

The names match. RELAY-ATE in the drawer is RELAY-ATE in the genealogy is RELAY-ATE in the buffer inspector panel she opens next. The channel name "threat-grid" in the genealogy is "threat-grid" in the probe log she checks. She never has to wonder whether two strings mean the same thing. She builds a single mental model: RELAY-ATE forwarded too many signals too fast, filling RELAY-BUNSO's downstream path, which overflowed STRIKER-BAYANI's buffer.

**Minute 2:30 — The Fix**
She opens the workbench. She adds a compression step to RELAY-ATE's skill set — compress before forwarding. She re-runs the mission. STRIKER-BAYANI survives. Marisol has diagnosed a multi-hop buffer overflow by navigating three diagnostic panels, and the vocabulary was consistent across all of them. She never encountered a moment of "wait, which agent is this?"

**UI Annotations:**
- **Pre-ranking drawer**: Agent names rendered from `agent_registry[id].display_name`, falling back to `canonical_id` if no display name. Amber text on dark panel. "RELAY-ATE" is a live anchor — hover shows canonical ID tooltip, click triggers genealogy navigation.
- **Signal genealogy nodes**: Same `display_name` from the same registry. Node labels are 12px condensed sans-serif, same font as the drawer. RELAY-ATE's node pulses amber because it is the drawer's highlighted agent — the color propagates through the cross-tool link, not through a separate highlighting system.
- **Buffer inspector slots**: Each slot shows signal source as `agent_registry[sender_id].display_name` and channel as `signal_log[index].channel_name`. No reformatting, no case changes.

---

#### Journey: Daniel, 29, Junior Backend Engineer from Davao
**Context:** Mission 9 ("Port Collapse"), a complex 7-agent configuration. Daniel is a competitive player who obsessively checks the pre-ranking drawer after every match. He has been playing for two weeks and has started reading real agentic AI documentation (LangChain, CrewAI) on his commute. He is actively testing 8.08's vocabulary claim against real-world tools.

**Minute 0:00 — The Suspicion**
Daniel opens the post-match debrief. The pre-ranking drawer lists: "SCOUT-ALPHA scored 0.83 — highest causal relevance. Active at tick 22, tick 41, tick 55. Modified 1 session ago. Volatility: 0.91."

He opens the signal genealogy. He scrubs to tick 22. SCOUT-ALPHA is highlighted — edges pulsing as it broadcasts on channel "perimeter-sweep." He checks the probe log. The log entry reads: "Tick 22 — SCOUT-ALPHA fired hook on channel perimeter-sweep; payload: enemy_cluster{count: 4, bearing: NNW, fidelity: 0.7}."

Every surface says SCOUT-ALPHA. Every surface says tick 22. Every surface says perimeter-sweep. Every surface says fidelity 0.7.

He screenshots this and posts it to Discord with the caption: "Three panels, one vocabulary. This is how you know the game has a single data model underneath." A reply from another player: "Try comparing it to the behavior tree view." He opens it. The hook trigger node at tick 22 shows a hexagonal node labeled "perimeter-sweep -> RELAY-DELTA." Same channel name. Same tick. Same agent pair as the genealogy edge.

**Minute 3:00 — The Real-World Test**
Daniel opens his LangChain project on his second monitor. He has a three-agent pipeline: a scraper agent, a summarizer agent, and a router agent. His LangChain callbacks log the tool calls. He notices something: LangChain's callback log uses `tool_name` as the identifier, but his custom dashboard uses `tool.display_name`, which he set differently for readability. His scraper tool is "web_scraper" in the callback log and "Web Scraper" in the dashboard. He has the exact naming divergence that Robot Uprising avoids.

He refactors his dashboard to read from the same callback data. One source. Same string. He writes a commit message: "fix: use canonical tool names in dashboard, not display aliases." The game taught him a systems engineering discipline through the absence of a bug — he never encountered naming confusion in Robot Uprising, so when he encountered it in his own code, he recognized it immediately as a design violation.

**UI Annotations:**
- **Pre-ranking drawer**: Agent name "SCOUT-ALPHA" rendered in 14px monospace, identical to the genealogy node label. The monospace treatment is deliberate — it signals "this is an identifier, not prose."
- **Probe log**: Each log line renders agent names in the same monospace, same casing, same string. Channel names are rendered in a slightly different color (teal vs. amber) but same font, same casing. The color difference encodes semantic type (agent vs. channel), not data source.
- **Behavior tree hook node**: The hexagonal node's label is "perimeter-sweep" in 10px monospace — same string as the probe log and the genealogy edge label. The target agent "RELAY-DELTA" is rendered in the same style as the source agent in the tree's parent action node.

---

#### Journey: Althea, 34, UX Researcher from Makati
**Context:** Mission 7, first use of the counterfactual simulation (4.20). Althea is a creative archetype player who sketches agent topologies on paper before configuring them in the workbench. She has a background in information architecture and immediately notices naming patterns.

**Minute 0:00 — The Counterfactual Split**
Althea's match failed because her RELAY-NORTH dropped a critical signal at tick 29. The pre-ranking drawer says: "RELAY-NORTH — causal relevance 0.76. Active at tick 29. Buffer was full (8/8 slots occupied). Recommended fix: add compression to upstream agent SCOUT-WEST."

She opens the counterfactual simulation. The screen splits — actual match on the left, counterfactual projection on the right. In the actual timeline, RELAY-NORTH's node in the genealogy is red-outlined at tick 29 (signal dropped). In the counterfactual timeline, RELAY-NORTH's node is green-outlined at tick 29 (signal passed through, because SCOUT-WEST compressed the payload, reducing buffer pressure).

Both timelines show "RELAY-NORTH." Both show "tick 29." Both show "SCOUT-WEST." Both show the channel "sector-north-feed." The left panel and the right panel are reading from the same agent registry and the same channel registry — the counterfactual simulation forked the match state, not the naming model.

**Minute 1:30 — The Paper Sketch**
Althea draws the topology on graph paper. She labels the nodes with the exact names from the screen: SCOUT-WEST, RELAY-NORTH, STRIKER-EAST. She labels the edges with the exact channel names: sector-north-feed, priority-target. She adds tick numbers at each edge. Her paper sketch is a perfect replica of the genealogy graph because the names are stable, unambiguous, and consistent. She does not need to invent her own abbreviations. She does not need to translate between what she sees and what she writes. The game's vocabulary is her vocabulary.

She later submits this sketch as part of a UX case study on "diagnostic tool learnability in complex systems." The sketch is legible to her colleagues without explanation because the naming is self-consistent and semantically clear.

**Minute 3:00 — The Deliberate Test**
Althea opens the buffer inspector for RELAY-NORTH at tick 29. Eight slots. Each shows the signal source agent and channel name. Slot 1: "SCOUT-WEST via sector-north-feed, age 3, fidelity 0.6." Slot 7: "SCOUT-WEST via sector-north-feed, age 0, fidelity 0.9." She can trace the exact signals that filled the buffer — they came from SCOUT-WEST over the same channel, accumulating faster than RELAY-NORTH could forward them. The channel name in the buffer inspector is the same string as the channel name in the genealogy edge label, which is the same string as the channel name in the workbench hook configuration.

She adds a note to her sketch: "Vocabulary consistency across panels = zero translation overhead. This is the UX equivalent of a normalized database."

**UI Annotations:**
- **Counterfactual split view**: Both panels share the same agent registry. The counterfactual panel renders agent names from the same data source as the actual panel — it does not create counterfactual agents with new IDs, only counterfactual states for existing agents. Node labels are identical across the split.
- **Buffer inspector slots**: Each slot's source agent and channel are rendered from the signal log, not from a buffer-specific data store. The inspector is a view onto the match record, not a separate model.
- **Workbench hook configuration**: The channel name input field auto-completes from the same channel registry that the genealogy and probe log read from. If the player types "sector-north-feed" in the workbench, it is the same string that will appear in every diagnostic surface after the next match.

---

## Strengths

**Zero translation overhead.** The player never wastes cognitive resources translating between naming conventions. In a game that already demands heavy cognitive investment (learning rules, hooks, signals, buffers, topology design), eliminating naming translation is not a quality-of-life improvement — it is a prerequisite for learning at all. Every moment spent wondering "is RELAY-C the same as relay-c?" is a moment not spent understanding why RELAY-C's buffer overflowed.

**Cross-tool navigation becomes trustworthy.** The entire value of 4.66 (cross-tool linking) depends on naming consistency. If clicking "RELAY-C" in the drawer highlights the correct node in the genealogy every time, the player learns to trust the link. Trust enables speed. Speed enables flow. Flow enables the deep diagnostic engagement that produces the strongest learning transfer (per the archetype analysis in 8.08d).

**Real-world engineering discipline taught by example.** The Rosetta Constraint is itself a lesson in systems design. Players who internalize "the game uses one name for one thing everywhere" carry that principle into their own engineering work. Daniel's journey illustrates this: he recognized a naming divergence in his own code because the game had trained his expectation of consistency. This is 8.08's vocabulary claim operating at the meta-level — not just teaching terms, but teaching the discipline of terminology.

**Architectural simplicity.** A single canonical data model is simpler to maintain than parallel models with cross-references. Fewer data paths means fewer bugs, fewer inconsistencies, fewer test cases. The constraint pays for itself in development cost even before considering its pedagogical value.

## Weaknesses

**Rigidity in display contexts.** Some diagnostic surfaces have legitimate display constraints. The behavior tree's hook trigger node (3.08d) renders at 10px — a 16-character agent name like "STRIKER-BAYANI" may overflow the hexagonal node boundary. The constraint says "same string everywhere," but the string may not fit everywhere. The solution (truncation with tooltip) introduces a display-level variation that technically violates the constraint, even if the tooltip shows the full canonical name.

**Player-assigned names add complexity.** When players name their own agents (as Marisol did with KUYA, RELAY-ATE, RELAY-BUNSO, STRIKER-BAYANI), the canonical data model must handle both the system-generated ID (e.g., `relay-2`) and the player-assigned display name (`RELAY-ATE`). The Rosetta Constraint requires that all surfaces show the same name, but which name? If the display name is primary, system-generated IDs become invisible — but system IDs are what the data model uses internally. If the system ID is primary, player creativity is suppressed. The resolution (display name everywhere, system ID in tooltips and export formats) adds a layer of indirection that must be consistently applied.

**Enforcement is invisible to the player.** The constraint's value is entirely negative — it prevents confusion rather than creating delight. Players never notice consistent naming; they only notice inconsistent naming. This makes it difficult to justify development investment in a constraint whose success is measured by the absence of complaints.

**Localization pressure.** If Robot Uprising is localized into Tagalog, Japanese, or other languages, agent type names (Scout, Relay, Striker) may be translated. The Rosetta Constraint must survive localization — the Tagalog version must be internally consistent ("TAGA-RELAY" everywhere, not "TAGA-RELAY" in the drawer and "Relay" in the genealogy). This means the canonical data model must store localized display names, not just English identifiers, and the localization pipeline must be integrated into the data model layer, not applied as a display-layer transformation.

---

## Interaction Effects

### With 8.08 — Real-Language Vocabulary Claim

8.08 asserts that the game's vocabulary maps to real engineering terms. The Rosetta Constraint is the architectural precondition for that assertion. If the game's own tools cannot maintain internal naming consistency, the claim that these names map to real-world concepts is hollow — the player cannot trust the game's vocabulary if the game does not trust its own vocabulary. The Rosetta Constraint makes 8.08 credible by making it testable: any naming divergence between panels is an 8.08 violation, detectable by automated test, fixable before release.

### With 4.66 — Signal Genealogy as Pre-ranking Source

4.66 defines the cross-tool link between the drawer and the genealogy. The Rosetta Constraint is 4.66's foundation — the link works because both tools read agent names from the same registry. Without the constraint, 4.66's click handler must perform a fuzzy match ("RELAY-C" might be "relay-c" or "relay_c" or "Relay C"), which introduces false matches, missed matches, and latency. With the constraint, the click handler is a direct lookup: `genealogy.highlightNode(agent_id)`. No fuzzy matching. No ambiguity.

### With 4.103 — Counterfactual Genealogy Overlay

The counterfactual overlay shows two versions of the same match side by side. The Rosetta Constraint ensures that both versions use the same agent names, because both read from the same agent registry. The counterfactual fork duplicates simulation state, not identity. RELAY-C in the actual timeline and RELAY-C in the counterfactual timeline are the same agent in two states, not two agents with the same name.

### With 3.08d — Behavior Tree Read-Only View

The behavior tree view renders hook trigger nodes with channel names and target agent names. These strings must match the genealogy edge labels and the probe log entries. The Rosetta Constraint ensures this by sourcing all three surfaces from the same signal log. The tree's hexagonal node showing "perimeter-sweep -> RELAY-DELTA" uses the same channel string and agent ID as every other surface.

### With 8.09 — Diagnostic Layer as Teaching Arc

The teaching arc relies on players building cumulative understanding across diagnostic tools — each tool reveals a new facet of the same system. If each tool uses slightly different terminology, the cumulative effect is confusion rather than illumination. The Rosetta Constraint ensures that the teaching arc's vocabulary is additive (each tool adds new information using the same terms) rather than multiplicative (each tool adds new terms for the same information).

---

## Comparable Games and Media

**Factorio's entity naming.** Factorio maintains strict naming consistency across its tooltip system, blueprint labels, circuit network signals, and console commands. An "iron-plate" is "iron-plate" in the recipe book, in the logistics filter, in the circuit condition, and in the console command `/count iron-plate`. This consistency enables the community to communicate unambiguously — forum posts, wiki pages, and blueprint strings all use the same identifiers. Robot Uprising should aim for the same standard: a player's Discord message describing their configuration should use the same strings they see in every diagnostic panel.

**Kubernetes naming conventions.** Kubernetes enforces a strict naming convention across all API surfaces: a Pod is `pod` in kubectl, `Pod` in YAML manifests (CamelCase for Kind), and `pods` in API paths. The casing rules are documented and enforced by the API server. Robot Uprising's data model should be equally explicit about casing rules: agent IDs are UPPER-KEBAB-CASE (`RELAY-C`), channel names are lower-kebab-case (`perimeter-sweep`), tick numbers are bare integers. These conventions, once established, become part of the game's vocabulary claim.

**Grafana dashboard variable binding.** Grafana dashboards pull metrics from multiple data sources (Prometheus, InfluxDB, Elasticsearch) and display them in panels. A common failure: a dashboard variable is named `$host` in one panel and `$hostname` in another, pulling from different metric labels that happen to contain the same values. The dashboard looks consistent until a host has a different label in one data source, at which point one panel shows data and the other shows "No data." Robot Uprising's diagnostic panels face the same risk if they pull agent names from different data paths.

**Dwarf Fortress's naming consistency.** Dwarf Fortress assigns each entity (dwarf, item, building) a unique name and uses that name consistently across every interface — the unit list, the thoughts/preferences screen, combat logs, and the stocks screen. A dwarf named "Urist McPickaxe" is "Urist McPickaxe" everywhere. The game never abbreviates, never uses an ID number in one screen and a name in another. This consistency allows players to track individuals across a complex simulation without translation overhead — exactly the discipline the Rosetta Constraint demands for Robot Uprising's agents and signals.

---

## Sensory Description

The pre-ranking drawer slides in from the right. Its surface is the color of a manila envelope held under a sodium streetlight — warm dark tan, almost amber, the kind of institutional paper color you see in Intramuros office buildings where the AC has been broken since Marcos Sr. The text renders in monospace. RELAY-ATE. Fourteen characters, each letter the same width, each pixel deliberately placed. The font is the font of terminal windows, of SSH sessions into production servers, of `kubectl get pods` output. It says: this is an identifier. This is not prose. This is a name that means something specific in a specific system.

The player taps RELAY-ATE. The genealogy panel blooms from behind the drawer — a dark field scattered with nodes like the light pollution map of Metro Manila seen from a Cebu Pacific window at 35,000 feet. Each node is a small circle with a name inside. RELAY-ATE. Same font. Same casing. Same string, down to the hyphen between RELAY and ATE. The node pulses amber — the same amber as the drawer's text, because the highlight color propagates from the same data source as the name. The edge connecting KUYA to RELAY-ATE is labeled "threat-grid" in teal monospace. The same teal as the probe log's channel names. The same monospace. The same string.

The player opens the buffer inspector. A vertical column of eight slots, each a thin rectangle like the SIM card trays in the phone repair shops on Colon Street. Slot 3 reads: "KUYA via threat-grid, age 2, fidelity 0.6." KUYA. Same string as the genealogy node. threat-grid. Same string as the genealogy edge. The fidelity value 0.6 matches the genealogy's edge annotation. There is no moment of doubt. There is no "wait, is this the same thing?" The name is the name is the name.

Outside the game window, the real Cebu City hums. A jeepney downshifts on Osmena Boulevard, its chrome horse hood ornament catching the glow of a 7-Eleven sign. Somewhere in a second-floor internet cafe above a pawnshop, Marisol's monitor shows three diagnostic panels, all speaking the same language, all reading from the same source, all telling the same story about why STRIKER-BAYANI froze at tick 38. She does not notice the consistency. She should not have to. The Rosetta Constraint's highest achievement is invisibility — the absence of confusion, the absence of translation, the absence of the question "wait, which one is this?" The constraint works when no one knows it is there.

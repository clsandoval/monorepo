# Campaign: Terminal Progressive Disclosure Across Campaign

**Aspect ID:** 5.16d
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign / Onboarding crossover
**Related aspects:** 5.16 (embedded document reference UI), 5.17 (hybrid tutorial architecture), 5.04b (vocabulary density curve), 5.00a (vocabulary pacing bottleneck), 5.04 (complexity ramp), 1.04b (diegetic tutorial documents), 3.01 (skills catalog), 5.01 (tutorial as puzzle)

---

## The Question

The locked Terminal design (5.16, recommended Model D "The CRT Terminal") is a three-column, scan-line-rendered in-game reference panel with context-aware entries, micro-scenarios, and cross-cutting interaction descriptions. It replaces alt-tabbing to the Codex for quick lookups.

**But when should each Terminal feature unlock?** If the full Terminal is available from Mission 1, a new player opening it sees 30+ entries, cross-references, interaction matrices, and query capabilities they have no framework to parse. The Terminal itself becomes a source of information overload — the exact problem context windows are supposed to solve. The Terminal would overload the player's own mental context window.

Conversely, if the Terminal unlocks too late, players spend Missions 1-6 alt-tabbing to the Codex or guessing at mechanics — the friction the Terminal was designed to eliminate.

**The design question:** What's the right unlock cadence, and what does the Terminal look like at each stage of its evolution?

---

## The Five Disclosure Models

### Model A: "The Growing Library" (Content-Gated)

Terminal is available from Mission 1 but only shows entries for mechanics the player has encountered. New entries materialize after being experienced in gameplay.

**Mission 1 (Context):** Terminal contains 3 entries — "Context Window," "Observation," "Slot." The three-column layout feels sparse: the left column has 3 items, the middle shows one entry at a time, the right column ("Related") is empty. The scan-line CRT aesthetic gives even this sparse state visual presence — the green phosphor glow makes 3 entries feel like a nascent intelligence, not an empty database.

**Mission 3 (Rules):** Terminal has grown to ~10 entries. "Rules," "Condition," "Action," "Priority," "Eviction" have materialized. The Related column now has content — clicking "Eviction" shows "Related: Context Window, Slot, Priority." The first cross-cutting interaction appears: "Eviction × Rules: eviction priority is itself a rule — the meta-rule governing what the unit forgets."

**Mission 5 (Factory):** ~18 entries. The Terminal now has enough density that the left column requires scrolling. The query feature unlocks — a blinking cursor input field at the top of the left column (before Mission 5, the list was short enough to scan visually). The micro-scenario panel appears for the first time: clicking "Compress" shows a 4-frame animation of a 6-slot buffer being compressed to 3 summarized slots.

**Mission 7 (Cross-cutting):** ~25 entries. The interaction matrix unlocks — a new tab in the Terminal showing a grid of mechanic × mechanic interactions. Each cell that has been explored shows a green dot; unexplored interactions show a dim question mark. The matrix is itself a progressive disclosure device: it reveals the *shape* of what you don't know.

**Mission 10 (Full):** All ~31 entries, all interactions, all micro-scenarios. The Terminal is a complete reference. The scan-line renders at full brightness. A small counter in the Terminal's title bar reads "31/31 ENTRIES LOADED" — the CRT has finished booting.

**Strengths:**
- Entries always relevant to current knowledge
- Terminal never overwhelms
- Materialization of new entries feels like progression (the library grows with you)
- "31/31 ENTRIES LOADED" is a satisfying completionist counter

**Weaknesses:**
- Players can't look ahead — a curious player who *wants* to read about hooks in Mission 2 is blocked
- Entry count is a crude proxy for readiness (some players learn faster)
- The query feature arriving at Mission 5 means Missions 1-4 have no search — fine with 3-10 entries but feels artificially limited

---

### Model B: "The Clearance Levels" (Feature-Gated)

All entries are visible from Mission 1, but Terminal features unlock over time. The entries themselves are always accessible; the *tools for navigating them* grow.

**Mission 1:** Terminal is a flat list. Click an entry, read the description. No search, no Related panel, no micro-scenarios, no interaction matrix. Just a green-text CRT showing one entry at a time. 31 entries in the left column, most with names the player doesn't recognize yet. Unknown entries are rendered in dimmer phosphor — readable but clearly "not for you yet."

**Mission 3:** The "Related" column activates. Clicking any entry now shows linked concepts. The dim entries brighten when the player has encountered them in gameplay. A subtle line connects the current entry to its relatives in the left column.

**Mission 5:** Query unlocks. The blinking cursor appears. Micro-scenarios activate — small looping animations showing each mechanic in isolation. The dim entries remain visible but gain a tooltip: "You'll encounter this in a future mission."

**Mission 7:** The interaction matrix tab appears. Cross-cutting descriptions unlock. The "Try It" button appears on micro-scenarios, letting the player modify parameters and see how the mechanic responds.

**Mission 10:** Full Terminal. All features at maximum fidelity. The "Try It" sandbox expands to allow multi-mechanic interaction experiments.

**Strengths:**
- Curious players can read ahead (but without the navigational tools to go deep)
- The Terminal's *capability* grows, not just its *content* — feels like upgrading a tool
- Dim entries create aspirational awareness ("what's 'amplify'? I'll find out later")
- No entry ever "materializes" — everything was always there, just dim

**Weaknesses:**
- 31 entries at Mission 1 is still visually dense
- Dim entries might be confusing ("is this broken? why can't I read this clearly?")
- Feature unlocks feel arbitrary unless narratively justified
- Players who want to search at Mission 2 are frustrated by a missing feature they can *see* should exist

---

### Model C: "The Subsystem Boot" (Diegetic Progressive Activation)

The Terminal is a subsystem of the player's AI consciousness. Each mission "activates" a new module, narrated through the boot log. The Terminal's progressive disclosure IS the narrative.

**Mission 1 — LEXICON MODULE v0.1 ONLINE:**
Boot log: `> Lexicon subsystem initialized. Vocabulary: 3 terms loaded. Query: disabled (insufficient training data). Cross-reference: disabled (insufficient graph density).`

The Terminal shows 3 entries. The interface shows placeholder panels with system messages: the Related column reads `[CROSS-REFERENCE MODULE: PENDING — graph density below threshold]`. The micro-scenario panel reads `[SIMULATION MODULE: PENDING — observation model incomplete]`. These aren't hidden features — they're *visible but offline*, like instrument panels in a cockpit with red "INOP" lights.

**Mission 2 — LEXICON MODULE v0.2 PATCHED:**
Boot log: `> Pattern recognition upgraded. +4 entries indexed. Cross-reference: still insufficient (density 0.23, threshold 0.40).`

7 entries total. The cross-reference density metric ticks up visibly. The player can see the threshold approaching. The Terminal teaches patience by showing progress toward activation.

**Mission 3 — CROSS-REFERENCE MODULE ONLINE:**
Boot log: `> Graph density 0.41 — cross-reference activated. Each term now shows related concepts. Warning: interaction analysis requires minimum 15 indexed terms.`

The Related column snaps to life — the red INOP light goes green. A brief animation: connection lines draw themselves between the 10 entries in the left column, forming a small graph. The player sees the knowledge network for the first time. The interaction matrix shows its INOP message with a counter: "11/15 terms indexed."

**Mission 5 — QUERY ENGINE AND SIMULATION ONLINE:**
Boot log: `> Query engine initialized. Natural language input accepted. Simulation sandbox booted — single-mechanic scenarios available. Warning: multi-mechanic simulation requires interaction model (pending).`

Query cursor blinks to life. Micro-scenarios activate. The counter for the interaction matrix now reads "18/15 terms — interaction model calibrating..." building anticipation.

**Mission 7 — INTERACTION MODEL ONLINE:**
Boot log: `> Interaction model calibrated. Mechanic × mechanic analysis available. Full cross-cutting synthesis enabled. Try-It sandbox upgraded to multi-variable mode.`

The interaction matrix tab appears with a satisfying boot animation — a grid drawing itself cell by cell, green dots appearing where interactions are documented, dim question marks where they're not.

**Mission 10 — LEXICON MODULE v1.0 — ALL SYSTEMS NOMINAL:**
Boot log: `> All subsystems online. 31/31 terms indexed. Graph density: 0.94. Full simulation capability. You know everything you need to know. What you build with it is up to you.`

Every panel is active. Every light is green. The Terminal title bar shows "LEXICON v1.0 — ALL SYSTEMS NOMINAL" in steady green. The journey from v0.1 to v1.0 mirrors the player's journey from confused beginner to informed architect.

**Strengths:**
- Disclosure is diegetic — the Terminal is part of the game's fiction, not a meta-system
- INOP panels with counters create visible progress milestones
- Boot log narration justifies each unlock ("your AI brain just got smarter")
- The density threshold mechanic teaches the concept of "enough data to draw conclusions" — transferable to real ML/AI
- Mission 7 interaction matrix boot is a genuine wow moment
- "ALL SYSTEMS NOMINAL" at Mission 10 feels earned

**Weaknesses:**
- Tightly couples Terminal unlocks to mission progression — replaying Mission 1 after completion means a fully loaded Terminal watching a tutorial
- The density threshold numbers (0.23, 0.40, 0.94) must be carefully calibrated to feel meaningful, not arbitrary
- Boot log lines for Terminal upgrades compete with boot log lines for mission narrative
- If the boot log is already dense, Terminal upgrade narration adds more text to an already loaded medium

---

### Model D: "The Demand-Driven Emergence" (Player-Action-Gated)

Terminal features unlock based on player behavior, not mission number. Each feature activates when the player does something that creates demand for it.

**First time a player hovers over a mechanic keyword:** The Terminal icon appears in the corner of the workbench with a tooltip: "Terminal available — reference for what you just hovered over." The left column contains only entries for mechanics the player has interacted with (not just encountered in gameplay, but actively touched — dragged a rule, toggled a filter, typed a channel name).

**First time a player configures two mechanics that interact:** The Related column activates for those two entries. "You just connected a hook to a rule — the Terminal now shows how these relate."

**First time a player has 8+ Terminal entries:** The query cursor appears. "Your reference has grown. Type to search."

**First time a player encounters a failure caused by mechanic interaction:** The micro-scenario for that interaction appears. "Something went wrong between compress and eviction. Here's what happened."

**First time a player inspects 3+ different mechanics in the Inspector:** The interaction matrix appears. "You're investigating connections between systems. The interaction matrix maps all known connections."

**Strengths:**
- Perfectly timed to player's actual need (not assumed need)
- Accommodates fast and slow learners equally
- Each unlock feels personally relevant ("I did something and the game responded")
- No arbitrary mission gates — a fast player could have the full Terminal by Mission 3

**Weaknesses:**
- Unpredictable unlock order makes it hard to design tutorials around Terminal features
- Players who don't hover, don't click, don't explore might never unlock features
- The "first time you do X" triggers are invisible — players don't know what behavior unlocks what
- Testing is harder (QA must verify every unlock path, not just 10 mission states)
- Inconsistent Terminal state between players makes community discussion harder ("wait, you have the interaction matrix? I don't")

---

### Model E: "The Hybrid Ramp" (Content + Feature + Diegetic)

Combines Models A and C. Terminal entries materialize as mechanics are encountered (content-gated). Terminal features unlock at mission thresholds (mission-gated, diegetically narrated). The best of both approaches.

**Mission 1:** Terminal with 3 entries, flat list, INOP panels visible. Boot log introduces the Terminal as an AI subsystem.
**Mission 2:** 7 entries. Related column activates (content threshold met AND mission 3 reached — whichever comes second). If the player somehow has 10 entries at Mission 2 from enthusiastic experimentation, Related still waits for Mission 3's boot log activation — preventing the awkward case of a feature silently appearing without narration.
**Mission 3-4:** Related active, entries growing, INOP panels counting down. The player is in the "growing library" phase.
**Mission 5:** Query and micro-scenarios boot (feature gate). New factory-related entries materialize (content gate). The Terminal doubles in capability and content simultaneously — a "level up" moment.
**Mission 7:** Interaction matrix boots. Cross-cutting entries unlock. The Terminal reaches critical mass.
**Mission 10:** Full Terminal, all systems nominal.

**The "whichever comes second" rule:** Features don't activate until BOTH the content threshold AND the mission threshold are met. This prevents:
- Feature unlocking before the player has enough content to use it (Mission 3 Related with only 2 entries = useless)
- Content accumulating without tools to navigate it (20 entries without search = frustrating)

**Strengths:**
- Content relevance (Model A) + narrative justification (Model C) + timing guarantees (mission gates)
- The "whichever comes second" rule prevents edge cases from both pure content-gating and pure mission-gating
- Designers can plan around guaranteed Terminal states per mission
- The boot log narration gives each unlock a narrative beat without blocking early content exploration

**Weaknesses:**
- Most complex to implement (dual-gate logic)
- "Whichever comes second" means fast learners wait for mission gates (mild frustration)
- Requires careful calibration of both content thresholds and mission thresholds

---

## Recommendation: Model E "The Hybrid Ramp" with Model C's Diegetic Narration

Model E is the strongest because it solves the edge cases that break every other model. Specifically:

1. **Content gating** ensures entries are always relevant (no information overload)
2. **Mission gating** ensures features have enough content to be useful (no empty panels)
3. **Diegetic narration** (boot log) turns unlocks into story beats (no arbitrary-feeling gates)
4. **INOP panels** (from Model C) create visible aspiration (the player sees what's coming)

---

## The Terminal at Each Mission: Full Specification

### Mission 1: "The Seed"
**Entries visible:** 3 (Context Window, Observation, Slot)
**Features active:** Flat list, single-entry display, no Related, no query, no micro-scenarios
**INOP panels:** Related ("Cross-reference: calibrating..."), Query ("Search: insufficient index"), Micro-scenario ("Simulation: pending"), Interaction Matrix ("Analysis: pending")
**Visual state:** Dim CRT glow, scan-lines at 40% opacity, title bar reads "LEXICON v0.1 — 3 TERMS INDEXED"
**Boot log line:** `> Lexicon subsystem online. Index sparse. Subsystems pending calibration.`

### Mission 2: "Growing"
**Entries visible:** ~7 (add Noise, Filter, Eviction, Priority)
**Features active:** Same as Mission 1
**INOP panels:** Same but counters increment ("Cross-reference: density 0.29/0.40")
**Visual state:** CRT slightly brighter, scan-lines 45%
**Boot log line:** `> +4 terms indexed. Cross-reference density improving.`

### Mission 3: "First Connection" — Related Column Activates
**Entries visible:** ~10 (add Rule, Condition, Action, Hook)
**Features active:** Related column ONLINE. Clicking an entry shows 1-3 related entries with one-line connection descriptions.
**INOP panels:** Query ("12/15 for search activation"), Micro-scenario ("pending"), Interaction Matrix ("pending")
**Visual state:** Related column's green activation is a designed moment — the red INOP fades, replaced by drawing connection lines between entries. The left column entries gain small dots indicating how many connections each has.
**Boot log line:** `> Cross-reference module online. Relationship graph seeded. You're starting to see how things connect.`
**Sound:** A soft ascending chord — two notes, like a relay handshake completing.

### Mission 4: "Deepening"
**Entries visible:** ~14 (add Channel, Signal, Perception Radius, Speed)
**Features active:** Related (with richer content now). Entry descriptions grow — Mission 4 entries reference concepts from Missions 1-3.
**INOP panels:** Query activates at Mission 4 if entry count ≥ 12 (the "whichever comes second" rule: 14 entries AND Mission 4 reached). Blinking cursor appears. Micro-scenario still INOP. Interaction Matrix shows "18/20 entries for analysis."
**Visual state:** Query cursor blink is a subtle but noticeable moment. The left column is now long enough that search feels necessary, not premature.
**Boot log line:** `> Index exceeds scan threshold. Query engine activated. Type to search.`

### Mission 5: "The Factory Expansion" — Micro-Scenarios and Major Content Drop
**Entries visible:** ~20 (add Factory, Production Queue, Blueprint, Conveyor, Resource, Energy)
**Features active:** Related, Query, Micro-scenarios ONLINE. Clicking "Compress" now shows a 4-frame looping animation: a 6-slot buffer with colored entries → compress skill activates → entries merge → 3 summarized slots with brighter glow. Clicking "Eviction" shows a similar animation of the buffer overflowing and the lowest-priority entry fading out.
**INOP panels:** Only the Interaction Matrix remains ("20/20 entries — calibrating interaction model... available Mission 7")
**Visual state:** The Terminal feels substantially more capable. Micro-scenarios add motion to what was purely text. The CRT scan-lines are at 60% opacity. Title bar: "LEXICON v0.5 — 20 TERMS INDEXED"
**Boot log line:** `> Simulation sandbox initialized. Micro-scenarios available for isolated mechanic study. Interaction model still calibrating — observation data accumulating.`
**Sound:** A three-note ascending chord — the boot-up sound getting richer as more systems come online.

### Mission 6: "Maturing"
**Entries visible:** ~24 (add Command, Reassign, Reroute, Prioritize)
**Features active:** All except Interaction Matrix. Micro-scenarios grow more detailed — Command agent scenarios show multi-agent coordination.
**Visual state:** CRT brightness 70%. The Terminal is becoming the player's primary reference tool.

### Mission 7: "Full Intelligence" — Interaction Matrix Activates
**Entries visible:** ~28 (add EM Emission, Noise Flood, Corruption, Specialist skills)
**Features active:** ALL features ONLINE. The Interaction Matrix tab appears as a new tab at the top of the Terminal panel. Clicking it reveals a grid: rows and columns are mechanics (Compress, Filter, Eviction, Hooks, etc.), each cell shows whether an interaction is documented (green dot), undocumented (dim ?), or non-interacting (—). The "Try It" button appears on micro-scenarios, letting the player tweak one parameter and see the result.
**INOP panels:** None. Every panel is active.
**Visual state:** The grid drawing itself cell by cell is the Terminal's most dramatic visual moment. Green dots appear like stars in a constellation, forming clusters around heavily-connected mechanics (context config, hooks, skills). The CRT is at 80% brightness. Title bar: "LEXICON v0.8 — 28 TERMS INDEXED — INTERACTION MODEL ONLINE"
**Boot log line:** `> Interaction analysis complete. I can now show you how every system connects to every other system. The map is ready. Navigate it.`
**Sound:** A full four-note ascending chord — the richest boot-up sound yet. A subtle background hum indicating the Terminal is now "running at full power."

### Mission 8-9: "Mastery"
**Entries visible:** ~30
**Features active:** All. Interaction matrix fills in remaining cells as the player encounters interactions in gameplay. The "Try It" sandbox expands to multi-mechanic experiments.
**Visual state:** CRT at 90% brightness. Nearly all interaction matrix cells are green.

### Mission 10: "All Systems Nominal"
**Entries visible:** 31/31
**Features active:** All at full capability. The final entry materializes — whatever mechanic was last introduced.
**Visual state:** CRT at full brightness. Title bar: "LEXICON v1.0 — ALL SYSTEMS NOMINAL". The scan-lines smooth out to their sharpest. Every INOP message is gone, replaced by active panels. The counter reads 31/31 with a brief golden flash when the final entry loads.
**Boot log line:** `> Lexicon complete. Every concept indexed. Every interaction mapped. Every simulation available. You know what you need to know. What you build with it — that's yours.`
**Sound:** The full ascending chord resolves into a sustained tone. A brief silence. Then the normal Terminal ambient hum resumes at full volume.

---

## Player Journeys

### Journey 1: Sofia, 15, First Strategy Game

**Context:** Mission 3, just learned about Rules. Has never played anything more complex than Candy Crush and Minecraft. The boot log just told her "Cross-reference module online." She doesn't know what that means.

**Minute 0:00 — The Curiosity Hover**
Sofia is in the workbench, trying to configure her first Rule. She sees the word "Eviction" in a tooltip and doesn't remember what it means. She notices the Terminal icon in the bottom-right corner of the workbench — a small green CRT monitor icon, pulsing faintly since Mission 1.

She clicks it. The Terminal slides in from the right as a docked panel, narrowing the workbench. The CRT scan-line effect activates. She sees 10 entries in the left column: Context Window, Observation, Slot, Noise, Filter, Eviction, Priority, Rule, Condition, Action.

**Minute 0:15 — Finding Eviction**
She clicks "Eviction." The middle column fills with a paragraph of green phosphor text explaining what eviction is. The paragraph uses only terms she's already encountered (no forward references). At the bottom of the entry: "When the context window is full and a new observation arrives, the entry with the lowest priority is evicted — removed to make room."

The right column — the Related panel that just activated this mission — shows:
- **Context Window** — "Eviction happens here"
- **Slot** — "Each eviction frees one slot"
- **Priority** — "Determines what's evicted first"

Connection lines draw from "Eviction" to each related entry. Sofia sees the web forming. She clicks "Priority" in the Related column, and the middle panel smoothly transitions to the Priority entry.

**Minute 0:30 — The "Oh!" Moment**
Reading about Priority, Sofia sees: "You set eviction priority per blueprint. Highest-priority entries are kept longest. Lowest-priority entries are evicted first." She clicks back to the workbench (the Terminal stays docked), finds the Context Config section of her blueprint, and sees the eviction priority dropdown. She now understands what it controls.

She glances at the Terminal's INOP panels. The Query panel reads "12/15 for search activation." She doesn't fully understand what this means, but she registers that the Terminal is going to get more capable later. She files this away.

**Minute 1:00 — Back to the Rule**
She toggles the Terminal closed (it slides back to an icon) and finishes her Rule. The round-trip was ~60 seconds — no screen changes, no flow disruption, and she learned a connection between three concepts.

**What Sofia learned:** Eviction is how the buffer manages fullness. Priority controls what stays and what goes. The Terminal is a growing tool that's not finished yet.

**UI Annotations:**
- Terminal icon: bottom-right of workbench, 32×32, green CRT monitor, pulse animation at 0.5Hz when unopened
- Terminal panel: docked right, 320px wide, CRT scan-line overlay at 45% opacity
- Related column: connection lines animate on click (0.3s draw), hover to preview entry
- INOP panels: red monospace text, counter updates after each mission

---

### Journey 2: Marcus, 38, Factorio Veteran

**Context:** Mission 5, factory just introduced. Marcus has been speedrunning Missions 1-4, already comfortable with all basic mechanics. He's the kind of player who reads the manual before touching the controls.

**Minute 0:00 — The Factory Overwhelm**
Mission 5 dumps six new concepts simultaneously: Factory, Production Queue, Blueprint, Conveyor, Resource, Energy. Marcus has played Factorio for 2,000 hours and recognizes all of these — but Robot Uprising's versions have specific meanings (Blueprints in this game are agent configurations, not building patterns).

He opens the Terminal. The boot log just announced "Simulation sandbox initialized." Marcus sees ~20 entries, the query cursor blinking for the first time (it activated at Mission 4 for him, since he had 14 entries by then). He types "blueprint" — the left column filters to just the Blueprint entry.

**Minute 0:20 — The Micro-Scenario**
Marcus clicks "Blueprint." The middle column shows the description, but what catches his eye is a new panel he hasn't seen before — at the bottom of the middle column, a looping 4-frame animation labeled "SIMULATION: Blueprint → Production Queue." It shows:

Frame 1: A blueprint card (Striker template) sitting in the Production Queue
Frame 2: A factory icon consuming the blueprint
Frame 3: A progress bar filling over 3 ticks (labeled "BUILD TIME: 3 ticks")
Frame 4: A Striker unit appearing on the board at the factory spawn point

Marcus watches the loop twice. He gets it — blueprints are consumed by the factory to produce units. Not like Factorio blueprints at all. The micro-scenario corrected his false mental model in 4 seconds, no text needed.

**Minute 0:40 — The Interaction Matrix Gap**
Marcus notices the last INOP panel: "Interaction Analysis — calibrating, available Mission 7." He's curious about how Blueprints interact with Hooks (does a hook defined in a blueprint get copied to every unit produced from it?). He clicks Related for Blueprint and sees "Hooks" listed with: "Hooks defined in a blueprint are instantiated per-unit. Each unit has its own copy of the hook, not a shared reference." His question is answered without needing the interaction matrix.

But Marcus is the kind of player who wants the *full picture*. He mentally notes that Mission 7 will unlock the interaction matrix and plans to revisit then.

**Minute 1:00 — Query Power**
Marcus types "energy" into the query. The entry explains energy as per-tick upkeep cost. He types "compress energy" — the query returns the Compress entry with the energy cost highlighted. He scans the cost: "2e/tick while active." He's already calculating production budgets.

**What Marcus learned:** The Terminal is a power-user tool now, not just a glossary. The query + micro-scenarios let him learn at his own pace. The INOP panel for the interaction matrix creates anticipation without frustration.

**UI Annotations:**
- Query input: blinking green cursor, monospace font, positioned at top of left column
- Filter behavior: entries that don't match query fade to 10% opacity (not hidden — Marcus can see the full list structure)
- Micro-scenario: 4 frames, 0.75s per frame, loops indefinitely, subtle scan-line overlay on the animation
- Frame labels: small monospace text below each frame describing the state change

---

### Journey 3: Dr. Ramirez, 55, CS Professor

**Context:** Mission 7, evaluating Robot Uprising for a university course on agentic systems. He's been taking notes on the pedagogical structure. The interaction matrix just activated.

**Minute 0:00 — The Matrix Moment**
The boot log reads: "Interaction analysis complete. I can now show you how every system connects to every other system." Dr. Ramirez opens the Terminal. A new tab has appeared at the top: "INTERACTIONS." He clicks it.

The view transforms. The three-column layout is replaced by a single full-width grid. Rows and columns are mechanics: Context Window, Eviction, Priority, Rules, Hooks, Channels, Skills (Compress, Filter, Amplify, Hack, Extract, Reassign, Reroute, Prioritize), Perception, Speed, EM Emissions, Tagging, Signal Latency.

Each cell is either:
- **Green dot (●)** — documented interaction, click to read
- **Dim question mark (?)** — interaction exists but player hasn't encountered it yet
- **Dash (—)** — no meaningful interaction

The grid draws itself cell by cell over 2 seconds — green dots appearing like a star map. Dr. Ramirez watches the constellation form. He immediately notices: the "Context Window" row is almost entirely green dots. Everything interacts with the context window. The "Tagging" row has fewer connections — it's more specialized.

**Minute 0:30 — Exploring an Interaction**
He clicks the cell at [Hooks, EM Emissions]. The middle panel expands to show: "Hook transmissions emit detectable EM noise. Each hook activation adds to the unit's EM signature. Deeper hook chains (scout→relay→relay→striker) produce more cumulative EM noise than direct chains (scout→striker). Design tension: smarter architectures are louder."

Below the text, a micro-scenario shows two configurations side by side. Left: a direct scout→striker chain with a small EM circle. Right: a scout→relay→relay→striker chain with a larger EM circle. The relay chain's EM circle visibly reaches an enemy scout's perception radius; the direct chain doesn't.

Dr. Ramirez's note: "This is essentially the same tradeoff as observability overhead in distributed systems. More telemetry = better decisions but higher resource cost. The game teaches it through EM noise instead of CPU/memory overhead."

**Minute 1:00 — The "Try It" Sandbox**
He clicks "Try It" below the micro-scenario. The animation freezes. Sliders appear:
- Hook chain depth: 1-4 (currently 3)
- Unit perception radius: 1-5 (currently 3)
- EM detection threshold: 1-5 (currently 3)

He drags the hook chain depth from 3 to 1. The EM circle shrinks. The enemy scout's detection range no longer reaches the emission. He drags it back to 4. The EM circle is enormous — even a low-perception enemy would detect it. The teaching is visceral and immediate.

**Minute 1:30 — The Dim Question Marks**
Dr. Ramirez notices several dim ? cells he hasn't explored yet. He clicks [Compress, Tagging]. The panel reads: "Interaction not yet documented — encounter this mechanic combination in gameplay to unlock analysis." He makes a mental note to try compress + tagging configurations in his next mission.

The dim question marks are doing their pedagogical job: they're creating awareness of unknown interactions without spoiling them. The student (or professor) knows the question exists before they know the answer.

**Minute 2:00 — The Pedagogical Assessment**
Dr. Ramirez writes in his notes: "The Terminal's progressive disclosure mirrors constructivist learning theory. Students build their reference tool through experience, not pre-loading. The interaction matrix is particularly strong — it's essentially a concept map that students build by playing. The dim question marks are Socratic — they ask the question without providing the answer. For my course: students could use the interaction matrix as a study guide, with the dim cells serving as 'things to investigate in the lab.'"

**What Dr. Ramirez learned:** The Terminal is pedagogically sophisticated. The interaction matrix functions as both a reference tool and a study guide. The progressive disclosure ensures students encounter concepts in experiential order, not textbook order.

**UI Annotations:**
- Interaction matrix grid: cell size 32×32, green dot centered, hover shows [Row] × [Column] label
- "Try It" sliders: horizontal, 120px wide, green track, current value displayed as integer
- Dim question marks: 30% opacity, hover shows "Encounter this combination in gameplay"
- Grid draw animation: 2s total, cells appear in reading order (left-to-right, top-to-bottom), each cell 0.06s

---

### Journey 4: Kai, 12, Minecraft Redstone Player

**Context:** Mission 2, still in early tutorial. Kai is mechanically skilled (Minecraft redstone circuits) but has never used a formal reference tool in a game. He barely reads tooltips.

**Minute 0:00 — Ignoring the Terminal**
Kai knows the Terminal exists — the icon has been pulsing since Mission 1. He hasn't opened it. He learns by doing, not reading. He's been dragging rules around, clicking things, seeing what happens. His context window knowledge comes from watching observations fill up during the Sealed Watch, not from reading the Terminal entry.

The Terminal's INOP counters have been incrementing silently. The icon's pulse rate hasn't changed. No pop-up, no tutorial prompt, no forced interaction. The Terminal waits.

**Minute 2:00 — The First Need**
In the workbench, Kai is trying to configure an eviction priority. He sees three options in a dropdown and doesn't understand the difference between "oldest first" and "lowest confidence first." He's never needed the Terminal before.

He hovers over "lowest confidence first." A tooltip appears: "Evict the observation with the lowest confidence score first. See Terminal: Confidence." The words "Terminal: Confidence" are rendered as a clickable link — teal text with an underline.

Kai clicks it. The Terminal opens directly to the "Confidence" entry, bypassing the list. He reads three sentences, sees the micro-scenario (not yet — Mission 2 doesn't have micro-scenarios. He sees the text description only). He gets it: confidence means how reliable the observation is. He closes the Terminal.

**Minute 2:30 — The Minimal Interaction**
Kai used the Terminal for 15 seconds. He didn't browse. He didn't explore Related. He got the answer and left. The Terminal served him perfectly — it was there when needed, invisible when not.

Over the next 8 missions, Kai's Terminal usage increases gradually. By Mission 5, he's using the query to check costs. By Mission 7, he's exploring the interaction matrix out of curiosity (redstone logic makes him naturally interested in how things connect). By Mission 10, he's using the "Try It" sandbox to test edge cases before deploying.

**What Kai learned:** The Terminal is optional but useful. It doesn't demand attention. It rewards curiosity. And the deep-link from tooltips means he'll always find it when he needs it.

**UI Annotations:**
- Tooltip deep-link: teal monospace text, underlined, "Terminal: [Entry Name]"
- Deep-link opens Terminal directly to the target entry (no browsing required)
- Terminal remembers last-opened entry between toggles (Kai reopens to same place)

---

## Interaction Effects

### With Hybrid Tutorial Architecture (5.17)
The Terminal's progressive disclosure must sync with the hybrid tutorial's "experiential archive" model. If the Codex generates concept cards from gameplay experience, and the Terminal generates entries from the same experiences — are they redundant? **Resolution:** The Codex is the collection (cards you've earned, portrait + stats + description). The Terminal is the workbench tool (quick lookup, search, interaction analysis). Same content, different affordances: Codex for browsing and collecting, Terminal for working. The Terminal shows a stripped-down, query-optimized version of Codex content, not a second copy.

### With Vocabulary Density Curve (5.04b)
The Terminal's entry count per mission must align with the vocabulary density curve's term introduction rate (2-5 new concepts per mission). If the Terminal shows 6 new entries after a mission that only introduced 3 new concepts, the extra 3 entries are likely forward-references that violate the density curve. **Resolution:** Terminal entries appear only after the player has had a "meaningful encounter" with the concept (the 5.04b definition — actively used it, experienced consequences, connected to prior knowledge). This means some mechanics might appear in gameplay before their Terminal entry materializes.

### With Boot Log (Locked Narrative)
Terminal upgrade announcements in the boot log must not crowd out mission-specific narrative. With 10 missions and ~5 Terminal upgrade moments, half the missions would include Terminal boot lines. **Resolution:** Terminal upgrades share boot log lines with related mission content. Mission 3 introduces Rules AND activates the Related column — one boot log line covers both: `> Rule system online. Cross-reference activated. Your decisions now have structure, and your knowledge now has connections.` The Terminal upgrade is woven into the mission's thematic moment, not a separate announcement.

### With Inspector Mode (Locked)
When the Terminal is open during Inspector mode (5.16b, a separate unchecked aspect), it should become context-aware: showing entries relevant to the currently inspected tick, agent, and decision. Progressive disclosure affects this — in Mission 3 Inspector, the Terminal can only show basic entries without micro-scenarios. By Mission 7, the Inspector Terminal can show full interaction analyses for the inspected decision. The Terminal's capability in Inspector mode is bounded by its progressive disclosure state.

### With Sealed Watch (Locked)
The Terminal is UNAVAILABLE during Sealed Watch. This is by design — the Sealed Watch is pure emotion, no tools. The Terminal's absence during Sealed Watch makes its presence during Plan and Inspector feel more valuable. The "no Terminal during Sealed Watch" constraint also ensures players can't mid-battle look up how compress works — they must have internalized it before hitting Execute.

### With Community Mission Editor (5.08b)
Community missions need to specify their Terminal state assumption. A community mission tagged "requires Mission 7+ Terminal" assumes the interaction matrix is available. A community mission tagged "Mission 1 Terminal" assumes only 3 entries and no features. **Resolution:** Community missions inherit the player's current Terminal state. If a player at Mission 10 plays a community mission, they have the full Terminal regardless of the mission's complexity. The Terminal doesn't regress.

---

## Comparable Games

### Civilization VI — Civilopedia
Available from turn 1 with all entries. No progressive disclosure. New players are immediately overwhelmed. Veterans ignore it. The Civilopedia is comprehensive but not paced — it's a reference book, not a learning tool. Robot Uprising's Terminal should learn from this by gating content.

### Factorio — In-Game Encyclopedia
Similar to Civ — full content from the start. Factorio mitigates overwhelm by linking encyclopedia entries from crafting menus, creating contextual access. Robot Uprising's tooltip deep-links serve the same function.

### TUNIC — The Manual
Progressive disclosure as a game mechanic. Pages of the manual are scattered throughout the world as collectibles. Each page reveals part of the game's systems. The joy of finding a new page and suddenly understanding a mechanic you've been using intuitively. Robot Uprising's Terminal entries materializing after experience is a subtler version of this — the "aha" comes from seeing a familiar concept named and contextualized, not from finding a physical collectible.

### Inscryption — The Rulebook
Starts thin, grows as new mechanics appear. The book's visual appearance changes (more pages, more worn). Inscryption's approach is closest to Model A but without feature gating. Robot Uprising's hybrid approach (Model E) adds feature unlocks on top of content growth.

### Slay the Spire — Card Library
All cards visible from the start (grayed if not encountered). Encounter-based bright/dim states. This is closest to Model B — full content visible, encounter state tracked. Robot Uprising adapts this with the dim phosphor treatment for unencountered entries.

---

## Sensory Description

**The Terminal at Mission 1:**
A small CRT panel, barely alive. Three lines of green text on a dark background. Scan-lines roll slowly from top to bottom. The phosphor glow is weak — like a computer that just turned on and hasn't warmed up. The INOP panels emit a steady dim red, like status lights on a sleeping machine. The title bar reads "LEXICON v0.1" in small monospace text. Opening the Terminal produces a soft cathode-ray warm-up hum — a rising tone that settles into a barely-audible 60Hz hum.

**The Terminal at Mission 5:**
The CRT is brighter. Twenty entries in the left column, some recently materialized (newest entries have a brief golden flash that fades to standard green over 3 seconds). The query cursor blinks steadily. Micro-scenarios play their looping animations in the lower-right panel, adding motion to what was static. The scan-lines are crisper, faster. The title bar reads "LEXICON v0.5 — 20 TERMS INDEXED." The ambient hum is slightly louder, with a subtle data-processing undertone — like a distant hard drive.

**The Terminal at Mission 7 — The Interaction Matrix Moment:**
The player clicks the new INTERACTIONS tab. The CRT flickers — a brief moment of instability, as if the system is straining to render something new. Then the grid appears, cell by cell, like stars appearing in a clearing sky. Green dots bloom where interactions exist. Dim question marks flicker into view in unexplored cells. The full grid takes 2 seconds to render. When complete, the CRT stabilizes at a new brightness level — noticeably brighter than before. The ambient hum gains a low-frequency harmonic, deeper and fuller. The Terminal is thinking harder now.

**The Terminal at Mission 10 — ALL SYSTEMS NOMINAL:**
The CRT is at full brightness. The scan-lines are sharp and evenly spaced. The green is not just green — it's a specific phosphor green, warm and slightly yellow-shifted, like a 1970s mainframe display that's been running all night. The title bar reads "LEXICON v1.0 — ALL SYSTEMS NOMINAL" in steady text (no flicker, no uncertainty). Opening the Terminal now produces a confident, immediate boot — no warm-up delay, no rising tone. The hum is full and constant. The Terminal is alive and fully operational. It feels like an extension of the player's own mind.

---

## The TikTok Clip

**Mission 7, 0:00-0:15:** A player clicks the new INTERACTIONS tab. The CRT flickers. Then the grid draws itself — cell by cell, green dots blooming across a dark field. The camera (screen recording) zooms slowly into the grid. Connection lines trace between high-connectivity mechanics. The player hovers over [Hooks, EM Emissions] and the interaction description appears with a micro-scenario animation showing two signal chains side by side. Cut to the player's face: eyebrows raised, small smile, a whispered "oh." Caption: "when the game builds you a concept map from your own experience."

---

## Discovered Sub-Aspects

1. **5.16d-i — Terminal state persistence on replay:** When a player replays Mission 1 after completing the campaign, should the Terminal regress to its Mission 1 state (3 entries, no features) or remain fully unlocked? "Terminal regression" for immersion vs. "Terminal persistence" for utility. The replay tension.

2. **5.16d-ii — Interaction matrix cell discovery incentives:** Should undiscovered interaction cells (dim ?) be incentivized as collectibles? A "Discovery %" counter? Does gamifying the matrix create grinding behavior (players trying random combinations to fill cells) or genuine curiosity?

3. **5.16d-iii — Terminal unlock notifications outside the boot log:** When a feature unlocks mid-mission (not at boot), how is it communicated? A subtle Terminal icon pulse? A toast notification? Should unlocks ever happen during Inspector phase, or only during Plan phase?

4. **5.16d-iv — Terminal content localization challenges:** Each entry is ~100 words. 31 entries × 100 words × ~45 interaction descriptions × 10+ locales = significant localization budget. The micro-scenarios use visual animations (locale-neutral) but the text descriptions need translation. Terminal text as a localization scope driver.

5. **5.16d-v — "Try It" sandbox boundary design:** The Mission 7 "Try It" sandbox lets players modify micro-scenario parameters. What are the boundaries? Can a player break the sandbox by setting contradictory values? Should the sandbox allow impossible configurations to teach what "impossible" means?

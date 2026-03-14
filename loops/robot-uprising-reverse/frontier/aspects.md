# Robot Uprising — Design Space Frontier

## Statistics
- **Total aspects:** 109
- **Analyzed:** 5
- **Pending:** 104
- **Convergence:** 5%

---

## Wave 1: Competitive Analysis

### Programming/Automation Games
- [x] 1.01 — Shenzhen I/O: constraint-based puzzle design, limited instruction space, multiple valid solutions
- [x] 1.02 — TIS-100: minimal instruction set, spatial node layout, parallel execution visualization
- [x] 1.03 — Opus Magnum: open-ended optimization, Zachtronics histogram system, aesthetic satisfaction of clean solutions
- [x] 1.04 — Exapunks: narrative framing of programming puzzles, zine-style tutorial, hacker fantasy
- [x] 1.04a — Exapunks body horror narrative-mechanical integration gap: how could Robot Uprising integrate narrative stakes into the workbench itself (corrupted configs, degraded buffers, enemy-injected hooks)?
- [ ] 1.04b — Diegetic tutorial documents as game artifact: the TWN zine design pattern — tutorial-as-in-universe-lore vs. traditional manual; trade-off between immersion and accessibility
- [ ] 1.04c — REPL semantics for agent spawning: explicit spawn instruction (player programs it) vs. implicit spawn (triggered by rules/hooks); EXAPUNKS REPL as reference model
- [ ] 1.04d — Blocking vs. queued hook semantics: blocking M register (both parties wait, deadlock-risky) vs. queued hooks (async, lossy under load); core architecture decision for Robot Uprising
- [ ] 1.04e — The 100-test-case robustness pattern: mission scenarios presenting N randomized variants the agent config must handle; randomization design determines which abstraction skills the game actually teaches
- [ ] 1.05 — Screeps: persistent-world programming RTS, JavaScript API, MMO dynamics
- [ ] 1.06 — Gladiabots: visual behavior tree programming for robots, multiplayer AI tournaments
- [ ] 1.07 — Bitburner: incremental hacking sim, real JavaScript, idle-game progression
- [ ] 1.08 — SpaceChem: visual programming as chemistry metaphor, production pipeline design

### Combo Discovery / Deckbuilding Games
- [ ] 1.09 — Slay the Spire: combo discovery, synergy between cards, run structure, ascension difficulty
- [ ] 1.10 — The Bazaar: real-time autobattler deckbuilding, item synergies, economic meta
- [ ] 1.11 — Balatro: rule-breaking combo system, poker as base mechanic, joker synergies
- [ ] 1.12 — Baba Is You: rule manipulation as mechanic, emergent interactions from simple rules

### RTS / Automation / Factory Games
- [ ] 1.13 — StarCraft Brood War: information warfare, scouting, fog of war, macro/micro split
- [ ] 1.14 — Factorio: belt/logistics systems, throughput optimization, infinite scalability, mod community
- [ ] 1.15 — Shapez: pure factory puzzle stripped of combat, focus on throughput and layout
- [ ] 1.16 — Mindustry: tower defense + factory + RTS hybrid, conveyor logistics under pressure

### Tactical / Information Games
- [ ] 1.17 — Into the Breach: perfect information tactics, consequence preview, small-scale precision
- [ ] 1.18 — Invisible Inc: information as primary resource, stealth + turn-based, alarm escalation
- [ ] 1.19 — XCOM series: fog of war, probability management, squad persistence, permadeath stakes
- [ ] 1.20 — Cogmind: robot-themed roguelike, part-swapping system, information-dense UI

### Auto-Battler / Hands-Off Execution Games
- [ ] 1.21 — Teamfight Tactics / Dota Underlords: plan then watch, positioning matters, synergy traits
- [ ] 1.22 — Totally Accurate Battle Simulator: physics comedy from planning, unit placement as only input
- [ ] 1.23 — Bad North: minimalist RTS, positioning-only control, island defense
- [ ] 1.24 — Northgard: macro-focused RTS with limited micro, territory control

### Adjacent / Unique Mechanics
- [ ] 1.25 — Noita: emergent physics interactions creating unexpected combos
- [ ] 1.26 — Oxygen Not Included: resource/attention management sim, priority system, duplicant AI
- [ ] 1.27 — Rimworld: colonist AI management, priority/schedule system, emergent stories
- [ ] 1.28 — Dwarf Fortress: legendary complexity, emergent behavior from deep simulation

---

## Wave 2: Core Mechanic Variations

### Intelligence Spectrum (How Smart Do Units Feel?)
- [ ] 2.00a — Fully deterministic: behavior trees, signal routing, composable rules — can this feel "smart"?
- [ ] 2.00b — Simulated intelligence: deterministic systems designed to FEEL autonomous (randomness, personality quirks, surprising-but-scripted behavior)
- [ ] 2.00c — Hybrid: deterministic core with optional LLM enhancement (players who want it pay API cost, others play offline)
- [ ] 2.00d — LLM-native: lean into it, make token cost a resource, make the AI's reasoning visible and part of the game
- [ ] 2.00e — The meta-level: building systems that build systems — how does each intelligence model support the "factory of agents" feeling?
- [ ] 2.00f — No global coordinator as design constraint: agents that only know their immediate neighbors; emergent swarm behavior from local decisions only (from TIS-100's no-orchestrator architecture)
- [ ] 2.14 — Spatial routing as mechanic layer: battlefield layout creates information routing constraints, separate from configuration logic; agent proximity determines which hook chains are possible
- [ ] 2.15 — Pipelined agent execution: throughput-optimal configurations where agents handle overlapping tasks (agent A finishes task N while agent B starts task N+1); cycle-optimal solutions look different from cost-optimal solutions; maps to Opus Magnum's pipeline-vs-sequential tradeoff
- [ ] 2.16 — Counter-intelligence as offensive mechanic: deliberately leaving enemy-injected hooks active and routing deceptive signals through them; "hook judo" — using enemy infrastructure against them; how the game scaffolds this discovery moment; risk/reward of leaving a known intrusion active

### Buffer Models
- [ ] 2.01 — Fixed-slot buffer: N discrete slots, each holds one observation/message, oldest evicted first
- [ ] 2.02 — Weighted buffer: entries have different sizes (a location = 1 slot, a full report = 3 slots)
- [ ] 2.03 — Decay buffer: entries fade over time rather than being evicted discretely (freshness gradient)
- [ ] 2.04 — Categorized buffer: separate pools for different info types (threats, terrain, comms, memories)
- [ ] 2.05 — Shared buffer: group of units shares a collective memory pool

### Eviction Policies
- [ ] 2.06 — Player-configured eviction: drag to set priority order of what gets kept
- [ ] 2.07 — Automatic eviction with player-set rules: "always keep threat data, evict terrain first"
- [ ] 2.08 — Panic eviction: under pressure, buffer dumps aggressively — unit "forgets" rapidly
- [ ] 2.09 — Sticky memories: some entries are "pinned" and never evict (costs permanent capacity)

### Signal & Information Types
- [ ] 2.10 — Signal taxonomy: what kinds of information exist in the game world (threats, resources, terrain, orders, rumors)
- [ ] 2.11 — Signal fidelity: signals degrade as they travel (telephone game mechanic)
- [ ] 2.12 — Deception signals: enemy can inject false information into your network
- [ ] 2.13 — Signal priority: urgent vs routine, and how priority affects buffer eviction and routing

---

## Wave 3: The Workbench — Primitives & Agent Configuration

### Skills (What Agents Can Do)
- [ ] 3.01 — Skills catalog: what specific skills exist? (scout, flank, harvest, relay, compress, patrol, ambush, repair, etc.)
- [ ] 3.02 — Skill acquisition: how does the player unlock new skills? (campaign progression, research, discovery, loot)
- [ ] 3.03 — Skill interactions: which skills combo with which? What emergent behaviors arise from skill combinations?
- [ ] 3.04 — Skill UI: how does the player browse, equip, and manage skills on agents?

### Rules (Behavioral Constraints)
- [ ] 3.05 — Rules language: what's the vocabulary for rules? How expressive vs. structured?
- [ ] 3.05a — Conditional prefix as expressive primitive: minimal rule vocabulary (like Shenzhen I/O's +/- prefix) that enables sophisticated agent behavior from simple building blocks
- [ ] 3.05b — SWIZ-style value packing as design primitive: EXAPUNKS SWIZ encodes multi-attribute info in one integer via digit manipulation; Robot Uprising signals might encode compound information; what's the analogous primitive?
- [ ] 3.06 — Rule conflicts: what happens when two rules contradict? Priority system, error feedback, or emergent chaos?
- [ ] 3.07 — Rules UI: how does the player write/edit/reorder rules?

### Hooks (Reactive Wiring)
- [ ] 3.08 — Hook taxonomy: what events can trigger hooks? What actions can hooks fire?
- [ ] 3.09 — Hook chaining: can hooks trigger other hooks? Cascade effects, infinite loops, back pressure
- [ ] 3.09a — Blocking hook semantics: hooks that require both sender and receiver to be "ready" (not busy, in range, buffer not full) — implicit timing without a global clock (from TIS-100 blocking port model)
- [ ] 3.10 — Hook visualization: how does the player see the wiring between agents? How are active hooks shown during execution?
- [ ] 3.11 — Hooks UI: how does the player create and manage hooks?

### Context Config
- [ ] 3.12 — Context config UI: how does the player set buffer size, filters, eviction priorities?
- [ ] 3.13 — Context config presets vs. custom: pre-built configs for beginners, full control for veterans?

### The Workbench Itself
- [ ] 3.14 — Workbench layout: what does the full agent configuration screen look like? Panels, flow, information hierarchy
- [ ] 3.15 — Army overview: how does the player see all agents and their wiring at once?
- [ ] 3.16 — Copy/paste/template: can you duplicate agent configs? Save templates? Share builds?

### The Meta-Level
- [ ] 3.17 — Command agents: agents that manage other agents — what skills/rules/hooks do THEY get?
- [ ] 3.18 — Dynamic reconfiguration: can a command agent change subordinate skills/rules/hooks mid-battle? What are the constraints?
- [ ] 3.19 — Hierarchies of command: command agents managing command agents — how deep can it go? When does it collapse?

---

## Wave 4: UI/UX Deep Dives

- [ ] 4.01 — Plan phase: split-screen (army view + editor) vs. full-screen editor vs. overlay
- [ ] 4.02 — Execute phase: what's visible during hands-off execution, HUD elements, speed controls
- [ ] 4.03 — The buffer visualization: how to show a unit's working memory in real time
- [ ] 4.04 — The debrief screen: timeline scrubbing, what-if analysis, failure diagnosis
- [ ] 4.05 — The combo discovery moment: how the UI celebrates emergent interactions
- [ ] 4.06 — Campaign map: how missions are presented, branching, narrative integration
- [ ] 4.07 — The "oh no" moment: how information overload is visualized on units
- [ ] 4.07a — "Blocked" visual state: agents that are waiting for input should be visually distinct from agents that are executing — prevents opacity that frustrates players in TIS-100 (deadlock detection gap)
- [ ] 4.09 — The histogram as player communication layer: deep dive on histogram design for Robot Uprising — axes, distribution shape, friend overlay, no-reward philosophy, when to show vs. hide; informed by Opus Magnum histogram psychology
- [ ] 6.09 — GIF/clip export as primary viral mechanic: designing replay clips that are shareable, beautiful, and self-explanatory without context; the hook-cascade clip as a viral moment; technical and design requirements for a Robot Uprising replay export
- [ ] 4.04a — Debrief as debugger: step-through replay of execution with per-agent state, buffer contents, and hook activation — the primary teaching mechanic, not just a stats screen
- [ ] 4.10 — Config integrity as a persistent resource: the "integrity %" as a cross-mission resource; some missions degrade it more, repair actions restore it; trade-off between speed and thoroughness of pre-mission audits; does low integrity persist into next mission if unaddressed?
- [ ] 4.11 — The "foreign fingerprint" visual language: three-way visual vocabulary for elements in the workbench (mine / system-default / enemy-injected) that must be immediately parseable; how to make enemy modifications visually distinct without requiring a tooltip to understand; the Papers Please discrepancy-detection UI model applied to agent config
- [ ] 4.08 — Unit portraits and identity: how units look, how you distinguish them, personality

---

## Wave 5: Onboarding & Campaign

- [ ] 5.00 — The external-documentation anti-pattern: Shenzhen I/O requires a PDF manual outside the game — all Robot Uprising vocabulary (skills/rules/hooks/context) must be learnable through in-game play
- [ ] 5.01 — Tutorial as puzzle: first missions are pure filter puzzles (drag away noise)
- [ ] 5.02 — Tutorial as narrative: story-driven introduction, AI waking up
- [ ] 5.03 — Tutorial as sandbox: free play with guided hints
- [ ] 5.04 — Complexity ramp: what order are mechanics introduced? How many missions before full complexity?
- [ ] 5.05 — Campaign structure: linear story vs. branching map vs. roguelike runs vs. chapter-based
- [ ] 5.06 — Failure and recovery: what happens when you lose a mission, when you lose the campaign
- [ ] 5.07 — Meta-progression: what carries across campaign restarts
- [ ] 5.08 — Mission variety: what types of missions exist (defend, attack, stealth, escort, puzzle, boss)
- [ ] 5.09 — Replayability: what makes someone start a new campaign
- [ ] 5.10 — The "product as puzzle" narrative method: working backwards from fictional mission objects to determine which agent configurations matter (from Shenzhen I/O)
- [ ] 5.13 — The reagent-placement-as-choice design pattern (from Opus Magnum): starting conditions that feel fixed but are actually variable create a "double reveal" — players discover the solution, then discover the solution space is larger than they thought; applies to agent deployment layout and hook topology choices
- [ ] 5.12 — Predecessor content as narrative: captured enemy agent configs carrying "previous operator" annotations — the Randy's-annotations pattern for Robot Uprising lore delivery without cutscenes
- [ ] 5.11 — Solitaire distraction risk: when a secondary mechanic (debrief analysis, sandbox mode) becomes more engaging than the core loop — how to prevent and exploit
- [ ] 5.14 — Detection skills as complexity gate: the "intrusion detection" skill as an advanced mechanic that reveals hidden corruption to players who invest in it; scales difficulty with player sophistication rather than with a separate difficulty slider; advanced players uncover more depth, beginners get clean experience

---

## Wave 6: Aesthetics & Platform

- [ ] 6.01 — Art direction: pixel art vs. vector vs. abstract vs. minimalist vs. detailed
- [ ] 6.02 — Audio design: soundtrack mood, sound effects for buffer events, attention alerts
- [ ] 6.03 — Narrative voice: GLaDOS-style narrator, silent, text-log, radio chatter
- [ ] 6.04 — The TikTok clip: what's the 15-second viral moment for each major design direction
- [ ] 6.05 — PC/Steam optimization: keyboard/mouse UI, Steam features (workshop, achievements, cards)
- [ ] 6.06 — Console/controller adaptation: how each building block paradigm works on a gamepad
- [ ] 6.07 — Mobile/touch adaptation: how each paradigm works on a phone
- [ ] 6.08 — Accessibility: colorblind modes, screen reader support, difficulty options, one-handed play
- [ ] 6.10 — Sound design for corruption detection: audio vocabulary of integrity violations — what does a foreign hook sound like when first detected, what does a revert "click" sound like, what does mid-execution EMP buffer degradation sound like; the sonic signature of a compromised vs. clean system

---

## Wave 7: Multiplayer & Community

- [ ] 7.01 — PvP: designing attention systems against another human's attention systems
- [ ] 7.02 — Co-op: shared battlefield, complementary attention architectures
- [ ] 7.03 — Async challenges: "beat my architecture" shareable puzzles
- [ ] 7.04 — Modding: custom missions, custom building blocks, total conversions
- [ ] 7.05 — Leaderboards and optimization: Zachtronics-style histograms, community competition
- [ ] 7.07 — Three orthogonal optimization axes: speed / efficiency / elegance as genuinely in-tension post-mission goals; a cycle-optimal army config and a buffer-minimal config should require different approaches
- [ ] 7.08 — Deferred community metric invention: designing the scoring system to be extensible so the community can invent new evaluation axes; the Opus Magnum "MechA" pattern; what composite metrics might the Robot Uprising community invent?
- [ ] 7.06 — The histogram as social loop: post-execution bell curves showing player distribution across agent efficiency metrics (from Shenzhen I/O)

---

## Wave 8: Cross-Cutting Synthesis

- [ ] 8.01 — Natural pairings: which building block paradigm works best with which buffer model
- [ ] 8.02 — Conflict matrix: which options in different categories are incompatible
- [ ] 8.03 — "Full game" configurations: 3-5 coherent complete designs across all categories
- [ ] 8.04 — The minimum viable game: smallest set of mechanics that captures the core magic
- [ ] 8.06 — The "first ugly solution" as tutorial completion: designing missions to be beatable with brute-force configurations so the histogram teaches optimization rather than a tutorial system; the Opus Magnum "no required optimization" pattern applied to agent configuration
- [ ] 8.05 — The maximum viable game: everything at once — does it cohere or collapse?

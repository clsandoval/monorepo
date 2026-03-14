# Robot Uprising — Design Space Frontier

## Statistics
- **Total aspects:** 68
- **Analyzed:** 0
- **Pending:** 68
- **Convergence:** 0%

---

## Wave 1: Competitive Analysis

### Programming/Automation Games
- [ ] 1.01 — Shenzhen I/O: constraint-based puzzle design, limited instruction space, multiple valid solutions
- [ ] 1.02 — TIS-100: minimal instruction set, spatial node layout, parallel execution visualization
- [ ] 1.03 — Opus Magnum: open-ended optimization, Zachtronics histogram system, aesthetic satisfaction of clean solutions
- [ ] 1.04 — Exapunks: narrative framing of programming puzzles, zine-style tutorial, hacker fantasy
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

## Wave 3: Building Block Paradigms

- [ ] 3.01 — The Node Graph: wire-based visual programming (Factorio belts / Unreal Blueprints)
- [ ] 3.02 — The Card System: deckbuilding with attention cards (Slay the Spire meets attention)
- [ ] 3.03 — The Priority List: drag-and-drop ordered lists of rules and preferences
- [ ] 3.04 — The Stance System: pre-built attention postures assigned to units
- [ ] 3.05 — The Spatial Zone System: place attention zones on the battlefield map
- [ ] 3.06 — The Mixing Board: sliders and dials for attention parameters
- [ ] 3.07 — The Behavior Tree: visual scripting with if/then/else branching
- [ ] 3.08 — The Icon Language: emoji/symbol-based command composition
- [ ] 3.09 — The Sentence Builder: structured natural language from composable fragments (no LLM, just grammar)
- [ ] 3.10 — The Pattern Matching System: "when you see X, do Y" rule templates
- [ ] 3.11 — The Loadout System: equip attention modules like gear in an RPG
- [ ] 3.12 — The Circuit Board: place components on a grid, adjacency matters (Opus Magnum-like)
- [ ] 3.13 — Hybrid: Stances + Priority Lists (simple outer layer, deep inner layer)
- [ ] 3.14 — Hybrid: Cards + Spatial Zones (play cards onto the battlefield)
- [ ] 3.15 — Hybrid: Loadouts + Mixing Board (equip modules, tune parameters)

---

## Wave 4: UI/UX Deep Dives

- [ ] 4.01 — Plan phase: split-screen (army view + editor) vs. full-screen editor vs. overlay
- [ ] 4.02 — Execute phase: what's visible during hands-off execution, HUD elements, speed controls
- [ ] 4.03 — The buffer visualization: how to show a unit's working memory in real time
- [ ] 4.04 — The debrief screen: timeline scrubbing, what-if analysis, failure diagnosis
- [ ] 4.05 — The combo discovery moment: how the UI celebrates emergent interactions
- [ ] 4.06 — Campaign map: how missions are presented, branching, narrative integration
- [ ] 4.07 — The "oh no" moment: how information overload is visualized on units
- [ ] 4.08 — Unit portraits and identity: how units look, how you distinguish them, personality

---

## Wave 5: Onboarding & Campaign

- [ ] 5.01 — Tutorial as puzzle: first missions are pure filter puzzles (drag away noise)
- [ ] 5.02 — Tutorial as narrative: story-driven introduction, AI waking up
- [ ] 5.03 — Tutorial as sandbox: free play with guided hints
- [ ] 5.04 — Complexity ramp: what order are mechanics introduced? How many missions before full complexity?
- [ ] 5.05 — Campaign structure: linear story vs. branching map vs. roguelike runs vs. chapter-based
- [ ] 5.06 — Failure and recovery: what happens when you lose a mission, when you lose the campaign
- [ ] 5.07 — Meta-progression: what carries across campaign restarts
- [ ] 5.08 — Mission variety: what types of missions exist (defend, attack, stealth, escort, puzzle, boss)
- [ ] 5.09 — Replayability: what makes someone start a new campaign

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

---

## Wave 7: Multiplayer & Community

- [ ] 7.01 — PvP: designing attention systems against another human's attention systems
- [ ] 7.02 — Co-op: shared battlefield, complementary attention architectures
- [ ] 7.03 — Async challenges: "beat my architecture" shareable puzzles
- [ ] 7.04 — Modding: custom missions, custom building blocks, total conversions
- [ ] 7.05 — Leaderboards and optimization: Zachtronics-style histograms, community competition

---

## Wave 8: Cross-Cutting Synthesis

- [ ] 8.01 — Natural pairings: which building block paradigm works best with which buffer model
- [ ] 8.02 — Conflict matrix: which options in different categories are incompatible
- [ ] 8.03 — "Full game" configurations: 3-5 coherent complete designs across all categories
- [ ] 8.04 — The minimum viable game: smallest set of mechanics that captures the core magic
- [ ] 8.05 — The maximum viable game: everything at once — does it cohere or collapse?

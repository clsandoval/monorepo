# 1.16 — Mindustry: Tower Defense + Factory + RTS Hybrid, Conveyor Logistics Under Pressure

## Overview

**Mindustry** (Anuke / Anuken, v7 stable November 2022, open-source, $5.99 on Steam / free on itch.io and GitHub) is a hybrid tower-defense factory game with RTS elements. The player builds conveyor-based supply chains to extract resources, manufacture materials, feed ammunition into turrets, and produce combat units — all while defending a central core from enemy waves. It holds an Overwhelmingly Positive rating on Steam (96/100 calculated from ~25,000+ reviews), has 1–2 million Steam owners, and peaked at ~3,376 concurrent players (May 2024). The game is fully open-source (Java), cross-platform (PC/mobile/web), supports multiplayer co-op and PvP, and has an active modding community with a JSON+JavaScript modding API.

**Why it matters for Robot Uprising:** Mindustry is the game that answers the question "what if Factorio's logistics systems existed under constant combat pressure?" Where Factorio allows leisurely optimization with biters as an occasional nuisance, Mindustry forces the player to build production systems that function while under attack. This pressure-cooker logistics model is directly relevant to Robot Uprising's sealed watch: both games ask "does your designed system hold up when things go wrong?" But where Mindustry's player can intervene during execution (placing new turrets mid-wave), Robot Uprising's locked decisions make the pre-execution design phase the entire game.

---

## Core Loop

### The 30-Second Loop
Scan the map. Identify a resource node (copper, lead, coal, titanium). Place a drill on it. Connect a conveyor belt to the drill. Route the conveyor to where the resource is needed — a turret that needs ammo, a factory that needs raw materials, a core that stores overflow. Watch the items flow. See a gap in your defenses. Place another turret. Connect its ammo supply.

### The 5-Minute Loop
Design a production sub-system. Silicon requires coal + sand, processed through a silicon smelter. Surge alloy requires copper + lead + titanium + silicon, processed through a surge smelter. Each recipe has input ratios the player must balance. Lay out smelters, connect input belts, output belts, overflow gates. Connect to the defensive perimeter. Start the next wave to test.

### The Session Loop (30-120 minutes per map)
Complete a campaign map or custom map by surviving all waves or destroying the enemy base. Each map is a self-contained challenge with specific terrain, resource availability, and enemy composition. The player builds from scratch each time — there's no persistent factory across maps. The session arc is: establish resource extraction → build basic defenses → push toward advanced resources → build advanced units/turrets → survive late waves or assault enemy cores.

### The Meta Loop
The campaign spans ~20 sectors across two planets (Serpulo and Erekir), with different tech trees, unit lineups, and resource chains. Serpulo is the classic experience; Erekir (added in v7) introduces a fundamentally different logistics model based on payload conveyors and heat management. Cross-planet tech creates a long-arc progression.

---

## Information Management Mechanics

### Conveyor Throughput as Bandwidth
Mindustry's conveyor system is fundamentally a bandwidth allocation problem. Each conveyor tier has a fixed items-per-second throughput: copper conveyors move ~4.3 items/sec, titanium ~8.6, plastanium ~12.9, armored ~12.9 (with damage resistance). When a belt backs up, upstream production stalls. When a junction splits flow, each branch gets roughly half throughput. The player must design routing topologies that deliver the right resources in the right quantities to the right consumers.

**Translation to Robot Uprising:** Conveyor throughput IS signal bandwidth. A relay with a 6-slot context window receiving signals from three scouts has the same bandwidth allocation problem as a junction splitting a copper belt three ways. The difference: Mindustry's throughput is deterministic and visible (items on belts), while Robot Uprising's is probabilistic and hidden (which signals arrive, which get evicted). Mindustry teaches throughput management through spatial observation; Robot Uprising teaches it through post-hoc Inspector analysis.

### The Combat Pressure Differential
Mindustry's defining innovation over Factorio is that combat is constant and central, not peripheral. Enemies attack in waves with escalating composition (ground units, air units, shield-bearing units, boss units). Turrets need continuous ammo supply. If a conveyor feeding ammo is destroyed, the turret goes silent. If the turret goes silent, more conveyors get destroyed. Cascade failure is the dominant failure mode.

**Translation to Robot Uprising:** This cascade failure pattern maps directly to Robot Uprising's context overload → stun → missed signals → further overload cascading. The emotional experience is identical: you built a system that works under normal load, and then pressure exposes the fragile coupling. But Mindustry lets you panic-repair during the wave; Robot Uprising forces you to watch the cascade unfold and learn from it in the Inspector.

### Logic Processors: Mindustry's Programming Layer
Mindustry v6 introduced logic processors — in-game programmable blocks that execute an assembly-like language called mlog (Mindustry Logic). Players can write programs that read sensor data from buildings (ammo levels, health, unit positions), perform calculations, and issue commands (control turrets, route units, toggle switches). There are three processor tiers: Micro Processor (120 instructions/tick), Logic Processor (480 instructions/tick), and Hyper Processor (1500 instructions/tick).

The mlog language includes:
- **Sensor operations** — read building/unit properties (health, ammo, items, position)
- **Control operations** — set turret targets, enable/disable buildings, command units
- **Draw operations** — render to logic displays (players have built radars, minimaps, and even games-within-games)
- **Unit binding** — take control of a specific unit, read its state, issue move/mine/build/attack commands

The community has built extraordinary systems: automated unit factories that produce the right unit composition based on enemy scouting, turret targeting systems that prioritize threats, supply chain monitors that reroute resources around destroyed segments, and missile defense networks.

**Critical translation to Robot Uprising:** Mindustry's logic processors occupy the exact design space Robot Uprising's rules/hooks system targets — but via text programming rather than visual configuration. The mlog approach creates the same "code wall" Bitburner suffers from: players who can program build extraordinary automation, but the skill barrier excludes the majority. Robot Uprising's workbench is the visual answer to this gap. Notably, the community has already built Mindcode, a high-level language that compiles to mlog — evidence that even programming-literate players want higher abstraction. Robot Uprising's visual workbench IS that higher abstraction, designed from the start rather than bolted on.

### Unit AI and Pathfinding
Mindustry's combat units have built-in AI with basic behavior trees: they'll attack nearby enemies, follow waypoints, repair damaged buildings, and retreat when low on health. The player influences unit behavior primarily through logic processors (commanding individual or grouped units) or through rally flags. Without logic processor control, units act autonomously with reasonable but unoptimized behavior.

**Translation:** This is the baseline Robot Uprising improves upon. Mindustry's built-in unit AI is a black box — players can override it with mlog, but they can't see or modify the default behavior tree. Robot Uprising makes the behavior tree (rules, hooks, context config) the primary game surface. Mindustry proves that players WANT more control over unit AI; its logic processor adoption rate (high among dedicated players, near-zero among casuals) proves the accessibility problem Robot Uprising must solve.

---

## How Complexity Is Introduced Over Time

### Phase 1: Turret Farmer (0-30 minutes)
Place copper drills. Build conveyors to turrets. Defend the core. The game teaches extraction → transport → consumption in the simplest form. Enemies are weak; belt routing is forgiving.

### Phase 2: Multi-Resource Manager (30-120 minutes)
Unlock smelters. Now copper alone isn't enough — you need lead for turrets, coal for graphite, sand+coal for silicon. Each new material requires a new supply chain. The player begins thinking about resource bus architecture: one main artery feeding multiple production branches.

### Phase 3: Throughput Engineer (2-5 hours)
Advanced turrets and units require surge alloy, phase fabric, and blast compound — multi-input recipes with precise ratios. Conveyor throughput becomes the bottleneck. The player learns about overflow gates, underflow gates, sorters, routers, and bridge conveyors. Junction optimization becomes a skill.

### Phase 4: Unit Commander (5-15 hours)
Air and ground units supplement turrets. Units require dedicated factories with their own supply chains. The player must balance defensive turret investment against offensive unit production. Logic processors enter for those who want fine-grained unit control.

### Phase 5: Planet Colonist (15+ hours, Erekir)
Planet Erekir introduces payload conveyors (which move entire blocks, not just items), heat-based production, and a fundamentally different resource chain. Everything the player learned about belt logistics partially applies but must be adapted. This is Mindustry's "production level" cognition shift — the same vocabulary, different grammar.

---

## UI/UX Analysis

### Strengths
- **Immediate visual feedback.** Items on conveyors are visible. You can see exactly where a supply chain is backed up, where throughput drops, where resources aren't reaching. There's zero abstraction between "the system" and "the display of the system." The map IS the state.
- **Modular building.** Schematics (blueprints) let players save and paste pre-designed factory modules. This encourages composition thinking — design a silicon factory once, paste it wherever needed.
- **Mobile-native design.** Mindustry was designed for touch from the start (Android/iOS). The placement UI works well on small screens. This is rare for a factory game and proves the genre can work on mobile with the right abstractions.

### Weaknesses
- **Logic processor accessibility.** mlog is powerful but impenetrable to non-programmers. The in-game drag-and-drop interface for mlog is functional but not intuitive. There's no visual programming mode, no behavior tree editor, no "if-then" template system. The gap between "turret placement" and "logic programming" is a cliff, not a ramp.
- **Information overload at scale.** Large maps with 200+ buildings become visually overwhelming. There's no overlay system for isolating specific resource flows, no heatmap for throughput, no "show me just the silicon chain." The player must mentally trace conveyor paths through a dense factory.
- **No execution replay.** When a wave destroys your defenses, there's no way to replay the failure in slow motion. You can't step through the cascade. You just see the result and rebuild. Robot Uprising's Inspector solves this problem directly.

---

## Community and Replayability

### Open Source as Community Catalyst
Mindustry is fully open-source on GitHub (25,000+ stars). This has enabled a thriving modding community, community-submitted maps, and even community-developed high-level languages (Mindcode). The openness creates deep investment — players don't just play, they extend the game.

### Multiplayer as Divergent Experience
Mindustry's multiplayer supports co-op (build together, defend together) and PvP (attack each other's cores). PvP introduces adversarial factory design: build offensive unit production while defending your own core. This asymmetric attack/defend dynamic is directly relevant to Robot Uprising's Gauntlet mode.

### Map Variety as Replayability
Each map presents different terrain, resource distribution, and enemy composition. A map with abundant copper but scarce titanium requires a fundamentally different factory architecture than one with the reverse. This per-map constraint variation keeps the building experience fresh — similar to how Robot Uprising's mission-specific constraints (different enemy compositions, terrain, objectives) force different blueprint architectures.

---

## Mechanics Translatable to Robot Uprising

### 1. Cascade Failure Under Pressure
Mindustry's "ammo supply destroyed → turret dies → more things destroyed" cascade is the physical-world version of Robot Uprising's "signal delayed → wrong decision → context overload → stun → more signals missed." Both games need the player to build redundancy and loose coupling into their designs. Mindustry teaches this through visible physical destruction; Robot Uprising teaches it through temporal signal analysis.

### 2. The Throughput Budget Mental Model
Mindustry players learn to think in items-per-second budgets: "this smelter needs 12 copper/sec, this belt can only carry 8.6/sec, I need two belts." This exact mental model translates to Robot Uprising's context window capacity: "this relay receives signals from 3 scouts at ~2 signals/tick, my context window is 8 slots, I need eviction rules or filtering." Mindustry teaches quantitative capacity planning in a visual, intuitive way.

### 3. Logic Processors as Design Space Validation
The fact that Mindustry's community built an entire programming layer on top of the tower defense game — and then built higher-level languages on top of THAT — validates Robot Uprising's core bet: players want to program agent behavior, and they want to do it at the right abstraction level. Mindustry proves the desire; its accessibility failure with mlog proves the need for Robot Uprising's visual workbench approach.

### 4. Schematic Sharing as Community Infrastructure
Mindustry's schematic copy-paste system (select a region, copy as text string, paste in chat or forums) created a rich community sharing ecosystem. Players post optimized factory designs, turret layouts, and logic processor programs as shareable strings. This is the direct precedent for Robot Uprising's Config Code sharing — the same impulse (share your design with the community) served by the same mechanism (compact text encoding of complex configuration).

### 5. Erekir as "Same Vocabulary, Different Grammar"
Mindustry's second planet (Erekir) reuses the same core mechanics (extraction, transport, production, defense) but changes the specific rules (payload conveyors instead of item belts, heat management instead of power grids). This is the design pattern Robot Uprising's post-campaign progression needs: same primitives (rules, hooks, context config, skills), different constraints. Erekir proves that rule variation within a fixed vocabulary sustains engagement better than pure difficulty scaling.

---

## Key Takeaways for Robot Uprising

1. **Pressure validates design.** Mindustry's greatest lesson is that combat pressure is the test of factory design quality. Robot Uprising's sealed watch serves the same function — the match IS the test. But where Mindustry lets the player intervene during the test (placing turrets mid-wave), Robot Uprising's locked decisions make the test pure.

2. **The programming layer accessibility problem is real and unsolved.** Mindustry's mlog proves players want deep automation control. Its low adoption rate proves the text-programming barrier is severe. Robot Uprising's visual workbench is a direct response to this validated problem.

3. **Physical visibility is a superpower Robot Uprising lacks.** Mindustry's greatest UX advantage is that items on belts are visible. You can see the system state by looking at the map. Robot Uprising's information architecture is invisible by default — signal flow, buffer contents, context state are all abstract. The holographic overlay, signal line animations, and thermometer sidebar are Robot Uprising's answer to "make the invisible visible," but they'll never match the intuitive clarity of watching copper move down a belt.

4. **Session length matters for mobile.** Mindustry maps take 30-120 minutes — much shorter than Factorio's 50+ hour campaigns. This makes it viable on mobile. Robot Uprising's 5-15 minute missions are even shorter, positioning it well for mobile sessions. Mindustry proves factory-like games can work in session-sized chunks.

5. **Open source builds loyalty.** Mindustry's GitHub stars (25K+), community mods, and community-developed languages demonstrate that transparency creates investment. Robot Uprising's web-first, potentially open-source approach could tap the same energy.

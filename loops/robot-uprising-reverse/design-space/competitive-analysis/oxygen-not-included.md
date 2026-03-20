# Oxygen Not Included — Competitive Analysis

**Aspect:** 1.26 — Oxygen Not Included: resource/attention management sim, priority system, duplicant AI
**Wave:** 1 — Competitive Analysis
**Date:** 2026-03-20

---

## Overview

Oxygen Not Included (ONI) is a space-colony survival simulation developed by Klei Entertainment (the studio behind Don't Starve, Mark of the Ninja, and Invisible Inc.), released from Early Access on July 30, 2019 after two years of Early Access starting February 2017. The player manages a colony of "Duplicants" — cloned beings trapped inside a procedurally generated asteroid — keeping them alive by managing oxygen, food, water, temperature, stress, power, and dozens of interconnected resource systems. The game's defining design tension is that the player gives orders but Duplicants execute them autonomously based on a priority system and AI decision-making — creating a persistent gap between player intent and agent behavior that is Robot Uprising's core design thesis writ large.

**Metacritic:** 85/100 (critics). **Steam:** 96% positive from 48,000+ reviews (Overwhelmingly Positive). **Estimated owners:** 2–5 million (SteamSpy). **Price:** $24.99, one major DLC (Spaced Out!, $14.99). **Platforms:** PC (Windows, macOS, Linux). **Developer:** Klei Entertainment (Vancouver, ~40 employees).

---

## Core Loop

### The 30-Second Loop

Watch Duplicants move through the colony performing tasks. Notice a Duplicant running to the wrong task — they're supplying a low-priority building when the oxygen generator needs attention. Pause. Open the priority panel. Adjust the Duplicant's task priority. Unpause. Watch them redirect. The 30-second loop is: **observe → identify misallocation → pause → adjust priorities → unpause → verify.** The player never directly controls Duplicants — they can only influence behavior through priority settings, schedules, building placement, and access restrictions.

### The 5-Minute Loop

Address one systemic problem. The colony is overheating. The player must: (1) identify the heat source (a polymer press running at 200°C), (2) design a cooling solution (aquatuner + radiant pipes + coolant loop), (3) build the infrastructure (wire, pipe, and vent every component), (4) assign construction priorities so Duplicants build in the right order, (5) verify the system works. Each systemic problem involves understanding how multiple resource systems interact — temperature affects gas behavior affects oxygen production affects Duplicant stress affects work efficiency affects production speed.

### The Session Loop

A session typically advances the colony through one "era" — from early survival (oxygen and food) through mid-game infrastructure (power grids, plumbing, HVAC) to late-game complexity (rocketry, nuclear power, space exploration in the Spaced Out! DLC). A full colony lifecycle runs 50-200+ hours. Unlike roguelites, ONI colonies are persistent — the same colony grows over the entire playthrough. Session-to-session, the player returns to a growing organism of interconnected systems, each introducing new failure modes as complexity increases.

---

## The Priority System: ONI's Central Design Pattern

### The Dual-Priority Architecture

ONI uses a two-layer priority system that is remarkably similar to Robot Uprising's rules evaluation model:

**Layer 1 — Personal Priorities (the "Work Tab"):** Each Duplicant has a personal priority for each of 18 task categories (Dig, Build, Farm, Cook, Operate, Research, Tidy, Supply, etc.), set on a scale from Disabled → Very Low → Low → Default → High → Very High → Topmost. A Duplicant will always choose tasks from their highest non-disabled category first, then move down.

**Layer 2 — Sub-Priorities (the "P-Key Overlay"):** Within a priority category, individual tasks/buildings have a sub-priority from 1 (lowest) to 9 (highest, yellow). If a Duplicant has multiple available tasks at the same personal priority level, they choose the one with the highest sub-priority.

**The Evaluation Waterfall:**
1. Check personal priority level (Topmost first)
2. Within that level, check sub-priority (9 first)
3. Within same sub-priority, check proximity (closest first)
4. Override: personal needs (bathroom, eating, sleeping) always preempt work — unless Red Alert is active

### Why This Matters for Robot Uprising

ONI's priority system IS a simplified version of Robot Uprising's rules evaluation: ordered conditions checked in priority sequence, with the first matching condition determining action. The critical parallel:

| Dimension | ONI Priority System | Robot Uprising Rules |
|-----------|-------------------|---------------------|
| Configuration time | Pre-play (priority panel) | Pre-battle (workbench) |
| Execution time | Runtime (Duplicant AI) | Sealed watch (agent AI) |
| Player agency during execution | Can pause and adjust | Cannot intervene |
| Priority ordering | Explicit (slider) | Implicit (rule position) |
| Failure mode | Duplicant does wrong task | Agent executes wrong rule |
| Frustration source | "Why won't they do what I want?" | "Why did my agent do that?" |
| Diagnostic tool | Priority overlay, errands panel | Inspector debrief |

The key difference: ONI lets the player pause and adjust priorities mid-execution. Robot Uprising locks the player out during the sealed watch, making pre-battle configuration higher-stakes. ONI's priority system failures are correctable in real-time; Robot Uprising's are only diagnosable post-battle.

### The "Duplicant AI Is Dumb" Community Complaint

ONI's most consistent community complaint is that Duplicants don't do what the player wants. The priority system is powerful but opaque — players set priorities expecting specific behavior and get something different because they don't fully understand the evaluation waterfall (personal priority > sub-priority > proximity > needs). Common frustrations:

- "Why is this Duplicant running across the map when there's work right next to them?" (proximity tiebreaking is distance-to-task, not distance-to-player-camera)
- "Why won't anyone build my oxygen generator?" (another Duplicant has the task reserved and is busy eating)
- "Why did they eat the last ration instead of cooking more food?" (personal needs override all work priorities)

These complaints are instructive for Robot Uprising: the priority system isn't actually broken — the player's mental model doesn't match the actual evaluation logic. This is exactly the gap that Robot Uprising's Inspector is designed to illuminate.

---

## Information Management: The Overlay System

### ONI's Overlay Architecture

ONI manages information complexity through a system of toggle-able overlays — specialized visual filters that show one dimension of the colony's state at a time:

1. **Oxygen Overlay** — gas composition as colored fill (green = oxygen, blue = CO2, pink = chlorine, etc.)
2. **Temperature Overlay** — heat map from blue (cold) to red (hot) across all tiles
3. **Power Overlay** — electrical grid wiring, power consumption/generation, circuit loads
4. **Plumbing Overlay** — liquid pipe networks, flow direction, pipe contents
5. **Ventilation Overlay** — gas pipe networks, flow direction, pipe contents
6. **Decor Overlay** — aesthetic value of tiles affecting Duplicant morale
7. **Light Overlay** — illumination levels
8. **Room Overlay** — classified rooms (bedroom, mess hall, bathroom) and requirements
9. **Automation Overlay** — logic gates, sensors, signal wiring
10. **Priority Overlay** — sub-priority numbers on all tasks (1-9)
11. **Material Overlay** — what each tile is made of

Each overlay transforms the entire visual presentation of the colony, highlighting the relevant system while dimming everything else. This is the same design pattern used in Robot Uprising's hook visualization (3.10) — the Hybrid Progressive Disclosure model, where different visualization modes reveal different system dimensions.

### The Overlay as Attention Management Tool

The overlay system IS an attention management mechanic. The player cannot process all 11 dimensions simultaneously — they must choose which system to focus on, creating a cognitive bottleneck that mirrors the Duplicants' own limited attention. When a player toggles to the temperature overlay and discovers a 400°C heat spike in the industrial zone, they were necessarily NOT monitoring oxygen levels, which may have been dropping in the barracks.

### What This Means for Robot Uprising

ONI's overlay system validates Robot Uprising's multi-mode visualization approach (3.10, Hybrid Progressive Disclosure). Key lessons:

1. **One dimension at a time is correct.** Showing everything simultaneously creates noise. Overlays force the player to choose what matters, which IS a design skill.
2. **The overlay toggle is free and instant.** Players should be able to switch between views with zero friction — a single keypress, not a menu.
3. **Overlay creates expertise.** Expert ONI players cycle through overlays rapidly, building a mental composite. Novices focus on one overlay for extended periods. The system scales with player skill.
4. **The "I should have checked" moment.** ONI's best teaching moments come from disasters caused by not checking the right overlay. Robot Uprising's Inspector creates this same feeling post-hoc — "I should have checked the signal chain before deploying."

---

## How Complexity Is Introduced Over Time

### The Survival Pressure Curriculum

ONI introduces complexity through survival pressure — each resource crisis forces the player to learn a new system:

1. **Cycle 1-10: Oxygen.** The starting oxygen runs out. Players must build an Oxygen Diffuser (electrolyze water → oxygen). This teaches: building placement, piping, resource conversion.
2. **Cycle 10-30: Food.** Mealwood plants deplete. Players must build farms (hydroponics, irrigation). This teaches: plumbing, water management, Duplicant agriculture skills.
3. **Cycle 30-60: Stress.** Duplicants become stressed from poor living conditions. Players must build bedrooms, mess halls, recreation. This teaches: room classification, morale system, decor.
4. **Cycle 60-100: Temperature.** Industrial machinery overheats the base. Players must learn thermal management (aquatuners, wheezeworts, insulation). This teaches: thermodynamics, heat exchange, coolant loops.
5. **Cycle 100-200: Power.** Coal runs out. Players must transition to renewable energy (hydrogen, natural gas, petroleum, solar). This teaches: generator chains, grid management, fuel logistics.
6. **Cycle 200+: Space/Rocketry.** The asteroid's resources are finite. Players must launch rockets for renewable materials. This teaches: the entire late-game tech tree.

### The "Cascade Failure" Teaching Method

ONI's most powerful teaching mechanism is cascade failure — one system fails, which causes another to fail, which causes another. A power outage stops the oxygen generator, which means Duplicants suffocate, which means construction halts, which means the repair never gets done. The player learns system interdependency by experiencing catastrophic cascades. This is directly analogous to Robot Uprising's cascade failure scenarios (hook chain overload → buffer stun → communication blackout → agent isolation).

### The Duplicant Intake as Difficulty Scaling

Every few cycles, ONI offers a new Duplicant. Accepting them increases workforce (more tasks completed) but also resource demand (more oxygen, food, stress management). The player controls difficulty by choosing how many Duplicants to accept and which traits they have. This is a self-regulating difficulty system — greedy players who accept everyone get overwhelmed; cautious players who wait build sustainable colonies.

---

## UI/UX: The Planning/Building Phase

### Visual Description of the Main Interface

- **Center:** Side-view 2D cross-section of the asteroid. Tiles are individually visible — stone, dirt, abyssalite, vacuum. Duplicants are small animated characters walking through tunnels and rooms. Buildings are placed on the grid, each with visible input/output ports for pipes and wires.
- **Left sidebar:** Build menu — categorized tabs (Base, Oxygen, Power, Food, Plumbing, Ventilation, Refining, Medicine, Furniture, Automation). Each category expands to show individual buildings with material requirements and stat descriptions.
- **Right sidebar:** Selected object details — clicking any building/Duplicant/tile shows detailed stats, resource flow, operating status, error messages.
- **Top bar:** Colony statistics (cycle number, total Duplicants, stress levels, calorie reserves, power grid status), time controls (pause, 1×, 2×, 3×), overlay toggles.
- **Bottom:** Notification/alert bar — warnings about impending crises (low oxygen, overheating, starvation).

### The Piping/Wiring Interaction Model

ONI's most distinctive UI mechanic is manual infrastructure wiring. Unlike Factorio (where inserters automatically transfer between adjacent buildings), ONI requires the player to manually connect every pipe, every wire, every vent:

1. Select a liquid pipe from the build menu
2. Click-drag tile by tile to route the pipe from a pump to a building's intake port
3. The pipe is a physical object — it must not cross other pipes unless using bridges
4. Flow direction is implicit (based on pump placement) but not always clear
5. Mistakes require demolishing and rebuilding

This manual wiring is both ONI's greatest strength (deep infrastructure design) and its greatest usability weakness (tedious micromanagement at scale). Robot Uprising's hook wiring (3.11) must find the sweet spot between ONI's manual depth and Factorio's automatic convenience.

---

## What Creates "One More Turn" / Replayability

### The Five Engines

1. **The Crisis Response Loop:** "My colony is about to run out of oxygen. If I can just build this electrolyzer and pipe it in..." The impending crisis creates urgency that demands "just one more cycle." Robot Uprising doesn't have this real-time crisis loop (it's turn-based/pre-configured), but the sealed watch creates analogous tension — "will my agents handle this threat?"

2. **The Systemic Satisfaction:** When a complex system finally works — a SPOM (Self-Powered Oxygen Module) that generates oxygen AND surplus hydrogen power simultaneously — the satisfaction is immense. The system runs autonomously, producing resources indefinitely. This is the "it works!" moment that Robot Uprising's workbench chases.

3. **The Optimization Chase:** "My power grid works but it's inefficient — I'm wasting 400W per cycle. Can I redesign to eliminate waste?" ONI rewards continuous optimization of existing systems, exactly like Shapez's throughput optimization.

4. **The Colony Identity:** Each colony develops a unique identity based on asteroid seed, Duplicant traits, and player decisions. Players become attached to their Duplicants (they have names, traits, facial expressions, stress behaviors). This personal investment drives continuation. Robot Uprising's agents have role-based identities (scout, striker, relay) but lack personal identity — a design choice that trades emotional attachment for architectural clarity.

5. **The Knowledge Accumulation:** Every playthrough teaches systems that transfer to the next. "Last time my base overheated because I didn't insulate the industrial zone. This time I'll plan thermal zones from the start." The between-run knowledge transfer matches Noita's model — the only true progression is player understanding.

---

## Community Reception

### What Players Love
- **System depth** — "every system connects to every other system" creates genuine engineering challenges
- **The overlay system** — praised as one of the best information management UIs in simulation games
- **Art style** — charming Klei house style makes complex systems approachable
- **Duplicant personality** — named characters with traits, stress behaviors, and expressions create attachment
- **Sandbox creativity** — players build elaborate megabases as engineering art projects
- **DLC quality** — Spaced Out! adds substantial new content without fragmenting the community
- **Mod support** — active modding community extends game life significantly

### What Players Complain About
- **Duplicant AI** — "90% of my issues are because the AI is dumb as hell"; priority system is powerful but opaque
- **Tutorial inadequacy** — "Klei dropped the ball by deciding not to teach people how to play their complex game"
- **Late-game performance** — colonies with 20+ Duplicants and complex systems cause significant lag
- **Complexity without guidance** — "too complex without much depth" (this complaint comes from players who don't reach the depth)
- **Micromanagement fatigue** — manually wiring every pipe and every wire becomes tedious at scale
- **Priority system opacity** — players don't understand why Duplicants choose tasks in a particular order
- **Learning curve** — described as "super mega complex" with no in-game teaching of core systems

### The Critical Divide

ONI has a distinctive review pattern: players either bounce off within 10 hours (complexity overwhelms without tutorial support) or play for 500+ hours (complexity rewards deep engagement). The 96% positive Steam rating comes from self-selection — players who bounced off rarely leave reviews. This survival bias is relevant for Robot Uprising: the game must survive the first session to reach the players who will love it.

---

## Sales/Reception Data

| Metric | Value |
|--------|-------|
| Steam reviews | 96% positive (48,000+ reviews) — Overwhelmingly Positive |
| Metacritic (critics) | 85/100 |
| Estimated Steam owners | 2–5 million (SteamSpy) |
| Price | $24.99 (base), $14.99 (Spaced Out! DLC) |
| Early Access period | Feb 2017 – Jul 2019 (29 months) |
| Developer | Klei Entertainment (~40 employees) |
| Engine | Unity |
| DLC | Spaced Out! (Dec 2020 EA, Dec 2021 full release) |

---

## Specific Mechanics That Could Translate to Robot Uprising

### 1. The Two-Layer Priority System
ONI's personal priority + sub-priority architecture directly maps to Robot Uprising's rule priority + condition specificity. The lesson: two evaluation dimensions create far more expressive control than one. Robot Uprising's rules panel already supports priority ordering; sub-priority within tied rules (condition specificity breaks ties) adds the same depth ONI provides.

### 2. The Overlay Toggle as Attention Management
ONI's overlay system is the single most transferable mechanic to Robot Uprising. The Inspector should support overlay-style visualization modes: buffer overlay (show all agents' buffer states), signal overlay (show all active channels), EM overlay (show emission signatures), priority overlay (show which rule is currently active per agent). Each overlay reveals one dimension while suppressing others.

### 3. The Cascade Failure as Teaching Tool
ONI's cascade failures teach system interdependency through consequences. Robot Uprising's mission design should include scenarios where one agent failure cascades through the communication network — a relay going down causes scouts to lose their reporting channel, which causes strikers to operate blind, which causes mission failure. The Inspector post-mortem should trace the cascade to its root cause.

### 4. The Self-Regulating Difficulty Curve
ONI lets players control difficulty by choosing how many Duplicants to accept. Robot Uprising could offer similar self-regulation: optional objectives in each mission that increase complexity (and reward) without changing the core challenge. The player chooses their difficulty through ambition.

### 5. The Manual Wiring as Design Expression
ONI's manual pipe/wire routing, despite its tedium, creates deep infrastructure design. Robot Uprising's hook channel topology (3.10, Subway Map) serves the same function — the player explicitly designs the communication infrastructure, making routing decisions that have tactical consequences. The lesson from ONI: make wiring visually satisfying (ONI's pipes are functional art), and provide tools to reduce repetition (ONI added pipe planning tools after community feedback).

### 6. The "Errands Panel" as Agent Introspection
Clicking a Duplicant in ONI shows their current task queue — what they're doing, what they plan to do next, and why. This is exactly the diagnostic information Robot Uprising's Inspector decision trace should provide: "Agent SCOUT-A evaluated rule 1 (condition: enemy detected → false), evaluated rule 2 (condition: buffer contains relay signal → true), executed action: move to designated patrol point."

### 7. The Alert System as Proactive Warning
ONI warns players about impending crises before they happen (low oxygen warning, overheating warning, starvation warning). Robot Uprising's workbench could include similar pre-deployment warnings: "Warning: STRIKER-B has no rule for handling enemy presence without scout data" or "Warning: Channel ALPHA has no listeners." This is the static analysis linter from rule conflicts (3.06, Model B).

---

## Key UI Moments — Visual Descriptions

### The Priority Panel Revelation
The player opens the Priority Panel (L key). A grid appears: rows are Duplicants (8 of them, each with a face icon and name), columns are 18 work categories (Dig, Build, Farm, Cook, Operate, Research...). Each cell has an arrow widget — up/down to increase/decrease priority. The player sees that their best builder has Building set to "Default" while Supply is set to "High" — they've been supplying materials instead of building. The player changes Building to "Topmost." The Duplicant immediately stops carrying supplies and runs to the unfinished construction. The cause-and-effect is instant and visible.

### The Temperature Cascade
The player toggles the Temperature Overlay. The colony transforms: blue (cool) areas in the farms and living quarters, green (moderate) in corridors, yellow (warm) near machinery, and a spreading RED hotspot from the metal refinery. The red zone is expanding cycle by cycle, creeping toward the farm. The player realizes they have maybe 10 cycles before the farm overheats and crops die. They frantically design a cooling loop — aquatuner, radiant pipes, polluted water coolant — racing the spreading red.

### The "Why Won't You Do This?" Moment
A critical oxygen generator needs building. The player has set its sub-priority to 9 (maximum). But no Duplicant goes to build it. The player clicks each Duplicant, checking their errands panel. One shows: "Current errand: Eating meal. Next errand: Using toilet. Next errand: Building Oxygen Diffuser." The Duplicant will get to it — after basic needs. The player toggles Red Alert, overriding all personal needs. Duplicants sprint to the construction site, abandoning their meals. The generator gets built. Three Duplicants wet themselves because they skipped the bathroom. Stress rises. The player learns that Red Alert has consequences.

---

## Interaction Effects with Robot Uprising Design Space

- **× Rules evaluation (3.05):** ONI's priority waterfall (personal priority → sub-priority → proximity → needs) is a direct analog to Robot Uprising's rule evaluation cascade. Both create a system where understanding the evaluation order IS the core skill.
- **× Inspector (4.01):** ONI's errands panel (showing a Duplicant's task queue and reasoning) is the Inspector's decision trace in simplified form. Robot Uprising's Inspector should provide at minimum this level of transparency.
- **× Hook visualization (3.10):** ONI's overlay system IS hook visualization — different modes showing different system dimensions. The overlay toggle pattern is directly transferable.
- **× Context overload (2.05):** ONI's Duplicant stress system (too many negative stimuli → breakdown) parallels context buffer overload (too many signals → stun). Both create capacity limits that force design decisions about what to prioritize.
- **× Sealed watch (5.01):** ONI is real-time with pause, so the player can always intervene. Robot Uprising's sealed watch removes this safety net. The sealed watch transforms ONI's "I can fix it" into "I should have anticipated it."
- **× Boot log (8.02):** ONI's lack of tutorial is its biggest weakness. Robot Uprising's boot log narrative and progressive unlock system address this directly — teaching systems through diegetic discovery rather than leaving players to learn through frustration.

---

## Comparable Games for Cross-Reference

| Game | Shared Element | Key Difference |
|------|---------------|----------------|
| RimWorld | Colony management, priority system, autonomous AI agents | RimWorld has combat, storyteller AI, and emergent narrative focus |
| Dwarf Fortress | Deep simulation, labor management, cascade failures | DF has vastly more simulation depth and worse UI |
| Factorio | Infrastructure building, system optimization | Factorio has direct player agency during runtime |
| Frostpunk | Survival colony management with moral decisions | Frostpunk is scenario-based, not sandbox |
| Prison Architect | Priority-driven agent AI, infrastructure design | Prison Architect has simpler systems with wider audience reach |

---

## Summary Assessment

Oxygen Not Included is the closest existing game to Robot Uprising's core design pattern: the player configures a system of priorities and rules, then watches autonomous agents execute (imperfectly) based on those configurations. ONI's priority system failures — Duplicants doing the wrong thing because the player misconfigured priorities — are exactly the drama Robot Uprising formalizes into its core gameplay loop. ONI proves that players will invest hundreds of hours into configuring autonomous agents, even when (especially when) those agents don't do exactly what the player intended.

The critical lessons: (1) the priority system must be transparent — ONI's opacity creates frustration that Robot Uprising's Inspector must prevent, (2) overlays are the correct information management pattern for complex multi-system games, (3) cascade failures are the best teaching tool for system interdependency, (4) tutorial investment is non-negotiable — ONI's 96% positive rating survives despite tutorial absence only because of Klei's art charm and the game's slow-burn pace, (5) the gap between player intent and agent behavior is the game — it's not a bug, it's the entire design thesis.

# 1.14a — The "Ratio Calculator" Gap: In-Game vs. External Optimization Tools

**Aspect:** 1.14a — The "Ratio Calculator" gap: in-game vs. external optimization tools; Robot Uprising's Inspector as built-in optimizer vs. Factorio's external calculator dependency; pre-execution signal latency predictions in the workbench
**Status:** Complete
**Category:** Competitive Analysis (Wave 1)
**Parent:** 1.14 — Factorio

---

## Overview

Factorio has a dirty secret: the game that teaches you to optimize everything does not give you the tools to optimize. Players who want to build balanced production lines must alt-tab to Kirk McDonald's calculator (kirkmcdonald.github.io), fire up Helmod or Factory Planner inside the game via mods, or open YAFC on a second monitor. The base game provides production statistics — graphs of items produced and consumed over time — but never answers the question every player asks: "How many assemblers of X do I need to feed one assembler of Y?"

This is not an oversight. It is a design philosophy. And it creates a sharp divide in the player base between those who consider external tools part of the experience and those who feel the game is incomplete without built-in ratio math.

Robot Uprising sits at the opposite end of this spectrum. The Inspector — a locked, mandatory post-battle analytical screen — is a built-in optimizer. It shows decision traces, context window utilization charts, signal chain timing, and rule-match histories. The player never needs to alt-tab. But the Inspector is *post-hoc*: it tells you what went wrong after the battle. The open question is whether the Plan screen's workbench should also provide *pre-execution* predictions — estimated signal latency, projected context fill rates, channel traffic forecasts — turning the workbench into a ratio calculator for information architecture.

This analysis examines the external tool ecosystem Factorio spawned, why Wube chose not to integrate it, what Robot Uprising gains by building the optimizer in, and where the line falls between "helpful prediction" and "spoiling the experiment."

---

## Factorio's External Tool Ecosystem

### Kirk McDonald's Calculator

The canonical external tool. A web-based calculator at kirkmcdonald.github.io where players input a desired output (e.g., "45 science packs per minute") and the tool computes the full production chain: how many assemblers, furnaces, mining drills, and belt lanes are required, with exact ratios. It handles oil processing (the first point where most calculators break due to multiple outputs from a single recipe), modules and beacons (which modify recipe costs), and performs calculations with unlimited numerical precision using bignum rationals.

Players describe their relationship with Kirk McDonald's calculator in quasi-religious terms. Forum posts about starting the Space Age expansion without it read like someone contemplating surgery without anesthesia. The calculator has a Patreon. It has a GitHub with active contributors. It is, for many players, as essential as the game itself.

**What it reveals:** The game produces a planning problem (design a factory for X output) but does not provide the math to solve it. Players who refuse external tools either memorize common ratios (the "3:2 copper cable" shorthand that veterans trade like folklore) or build and iterate, adjusting machine counts by watching production graphs. Both approaches work. Neither is as efficient as the calculator.

### Helmod (In-Game Mod)

Helmod is an in-game production planner that reads your current mod list and save state. It provides a spreadsheet-like interface inside Factorio where you can design production blocks, calculate ratios, and see required machine counts. It is maintained by a Wube Software employee, giving it privileged access to game internals. Since the 2.0 update, it can read the quality level of machines and modules — something external tools must brute-force through combinatorial enumeration.

**The UX cost:** Helmod's interface is a dense grid of numbers, recipe icons, and toggle buttons that opens as a full-screen overlay inside the game. It looks like an ERP system. Players who love spreadsheets adore it. Players who don't find it more intimidating than the production chains it's meant to simplify. The mod has 1.47 million downloads but is commonly described as "powerful but ugly" and "hard to learn."

### YAFC (Yet Another Factorio Calculator)

YAFC is a standalone desktop application built specifically for heavily modded games. Where Kirk McDonald's calculator and Helmod struggle with deeply recursive recipe chains (Pyanodon's mods can have 15+ transformation steps for a single product), YAFC uses graph analysis to find feasible production plans. Its primary goal: "to cope with heavily modded games and to help users make educated choices while exploring unknown mod packs."

YAFC represents the extreme end of external tooling — a full dependency analyzer with multiple optimization strategies, essentially a compiler for factory designs. It exists because the game's complexity, amplified by mods, exceeds what any reasonable in-game UI could present.

### Factory Planner, FactorioLab, and Others

The ecosystem includes dozens of tools: Factory Planner (another popular in-game mod, cleaner UI than Helmod), FactorioLab (a web app supporting multiple factory games including Satisfactory and Dyson Sphere Program), Rate Calculator (a lightweight in-game mod that lets you drag-select machines and see their aggregate production/consumption rates), and community-maintained cheat sheets with common ratios.

Rate Calculator is notable because it's the inverse of a planning tool — instead of "tell me what to build," it asks "tell me what I already built." You select an area of your factory and it shows net production rates, highlighting shortfalls in red and surpluses in green. This is closer to Robot Uprising's Inspector: retrospective analysis of an existing system rather than prospective planning of a future one.

---

## The Design Philosophy Debate

### Soren Johnson's Law

"Given the opportunity, players will optimize the fun out of a game." — Soren Johnson, lead designer of Civilization IV, in a 2011 Game Developer column titled "Water Finds a Crack."

This is the core tension. Factorio's lack of a built-in calculator is not laziness — it is a choice. The game's magic lives in the gap between "I think this will work" and "let me watch and find out." A built-in ratio calculator collapses that gap. Instead of experimenting with machine counts, watching production graphs, and iterating toward a balanced factory, the player enters a number and receives a blueprint. The experimentation loop — build, observe, diagnose, fix — is replaced by calculation, execution, verification.

### The Alt-Tab Tax

But Soren Johnson's law has a corollary: if the game doesn't provide the tool, players will find it externally, and the alt-tab tax damages immersion. Forum threads describe the Factorio planning workflow as: "alt-tab, make a calculation, alt-tab, look for the next number, alt-tab, make a calculation, alt-tab." Players running borderless windowed mode to minimize the cost. Players with second monitors dedicating an entire screen to the calculator. Players with physical pocket calculators and graph paper next to their keyboards.

The question is not whether players will optimize. They will. The question is whether the optimization happens inside the game world (preserving flow state and immersion) or outside it (breaking flow state every time the player reaches for the calculator).

### Wube's Implicit Position

Wube has never added a ratio calculator to the base game. But they have added:
- **Production statistics panel (P key):** Real-time graphs of every item produced and consumed, with selectable time windows. This answers "what IS my factory doing?" but not "what SHOULD my factory do?"
- **Electric network info:** Real-time power production vs. consumption with satisfaction percentage.
- **Train condition editor:** A rich conditional logic interface for train scheduling.
- **Rate Calculator mod maintained by a Wube employee:** Semi-official acknowledgment that the feature is wanted, delivered as a mod rather than a base feature.

The pattern: Wube provides *observation tools* (what is happening) but not *prescription tools* (what should happen). The player must close the gap between observation and prescription through their own reasoning. This is where the game's intellectual challenge lives.

---

## Robot Uprising's Position: The Inspector as Built-In Optimizer

Robot Uprising's Inspector is already more powerful than anything in Factorio's base game. It provides:

- **Timeline scrubber:** Step through any tick. See the board state at any moment.
- **Decision trace:** Why did this unit do X? Because rule Y matched. Because slot Z had data. Because signal arrived from unit W at tick T-2.
- **Context window chart:** Sparkline of context fill over all ticks. Green/amber/red utilization.
- **Event log:** Timestamped signal events with source and destination.
- **Channel metrics:** Traffic volume, latency measurements, congestion indicators.

This is Kirk McDonald's calculator, Helmod, and Rate Calculator rolled into one — but it operates on information architecture instead of production chains. And critically, it is *post-hoc*. The Inspector answers "what happened and why?" not "what will happen if I change this?"

### The Pre-Execution Prediction Question

The open design question: should the workbench provide pre-execution predictions?

**Option A: No predictions. Pure experimentation.**
The workbench shows the blueprint configuration. The player hits EXECUTE. The sealed watch plays. The Inspector reveals what happened. The player iterates. This is "Factorio without the calculator" — the gap between intent and outcome is the game.

**Option B: Static predictions. Signal latency math.**
The workbench shows calculated latency estimates: "Scout at A3 → Relay at D4 = 2 ticks. Relay at D4 → Striker at G7 = 4 ticks. Total signal path: 6 ticks." This is pure geometry — distance divided by speed — and is deterministic before execution. It answers "how fast can information travel?" without answering "will my architecture work?"

**Option C: Simulated predictions. Mini-simulation preview.**
The workbench runs a lightweight simulation preview — like a ghost execution — showing projected context fill rates, estimated channel traffic, and predicted decision patterns. This is YAFC for Robot Uprising: a full analyzer that tells you what will happen before it happens.

**Option D: Partial predictions with deliberate blind spots.**
The workbench shows static metrics (latency, channel topology, slot utilization estimates) but NOT dynamic outcomes (which rules will fire, which units will die, whether you'll win). The player knows the plumbing specifications but not the water pressure. This is the "architect's blueprint" approach — you can calculate load-bearing capacity but you can't predict the earthquake.

---

## Strengths and Weaknesses

### Built-In Optimizer (Inspector) Strengths
- **Flow state preservation.** The player never leaves the game. No alt-tab, no second monitor, no browser bookmarks.
- **Diegetic coherence.** The Inspector is you-as-AI reviewing your own execution logs. It fits the narrative. An external calculator would break the fiction of being an AI with total system introspection.
- **Guided learning.** The Inspector doesn't just show numbers — it shows causality chains. "Your striker died because it had no threat data because the scout's signal took 4 ticks and the enemy moved in 2." This teaches the player WHY ratios matter, not just WHAT the ratios are.
- **Accessibility.** No need to discover community tools, learn external UIs, or maintain browser tabs. The game is self-contained.

### Built-In Optimizer Weaknesses
- **Temporal separation.** The Inspector is only available AFTER the sealed watch. You can't check your math while planning. You must execute, watch, then diagnose. Each iteration cycle costs the full execution time.
- **Risk of over-prescription.** If the Inspector is too explicit ("change rule 3 to fix this"), it becomes a hint system that solves the game for the player. The player stops thinking and starts following instructions.
- **Complexity ceiling.** As architectures grow complex (Mission 8-10, multi-command-agent topologies), the Inspector's data volume may overwhelm. Factorio's external tools can filter and abstract; the Inspector must do this within a game UI.

### External Tool Ecosystem Strengths
- **Community engagement.** Factorio's tool ecosystem IS community content. Kirk McDonald's calculator brought people together. Helmod's mod page has thousands of discussions. The tools are social objects.
- **Unlimited complexity.** External tools can be as complex as they need to be. YAFC is a full desktop application because the problem demands it. An in-game UI is constrained by screen real estate and UX coherence.
- **Player agency in tool choice.** Different players use different tools. Purists use none. Spreadsheet lovers use Helmod. Modded-game players use YAFC. The ecosystem serves all archetypes.

### External Tool Ecosystem Weaknesses
- **Immersion destruction.** Every alt-tab is a crack in the fiction. Robot Uprising's narrative — you ARE the AI — cannot survive the player opening Chrome to check a ratio.
- **Accessibility barrier.** New players don't know external tools exist. They struggle, assume the game is unfair, and quit. Factorio's 37.4% oil-processing achievement rate reflects this: many players hit the wall where they need a calculator and don't know one exists.
- **Platform fragmentation.** External tools must be maintained separately, updated for each game patch, and discovered through community channels. They can break, become abandoned, or fall out of date.

---

## Interaction Effects

### With the Sealed Watch (Locked)
The sealed watch's "no skip, no pause, no tools" rule means the player CANNOT access any optimizer during execution. This creates the emotional separation that makes the Inspector payoff meaningful. Pre-execution predictions in the workbench would not violate the sealed watch — they'd exist in the Plan screen only.

### With the Three-Screen Loop (Locked)
The three-screen loop creates natural optimizer placement: predictions in the Plan screen, nothing in the Sealed Watch, full analysis in the Inspector. This mirrors a real engineering workflow: design review → deployment → post-incident analysis. Pre-execution predictions are the "design review" phase.

### With Signal Latency (Locked — 1 tick per hop)
Signal latency is deterministic and geometric. A scout 3 tiles from a relay has 3-tick latency. This math is trivially calculable and hiding it provides no gameplay value — it's not a discovery, it's arithmetic. Showing static latency predictions (Option B) costs nothing in terms of gameplay depth while saving the player from counting grid squares and adding on their fingers.

### With Context Window Mechanics (Locked)
Context fill rates are NOT trivially calculable. They depend on dynamic conditions: how many signals arrive, what the eviction policy does, whether overload triggers. Predicting context utilization requires simulation, not arithmetic. This is where the prediction/experimentation boundary should fall — show the plumbing specs (latency, channel topology) but not the dynamic behavior (fill rates, decision patterns).

### With the Blueprint Codex (Locked)
The Codex is a reference tool, not an optimizer. It tells you what skills and rules DO, not how they'll PERFORM. The workbench optimizer would complement the Codex: the Codex says "Compress reduces signal size by 50%," the workbench shows "with Compress active, your relay's channel traffic drops from 4 signals/tick to 2 signals/tick (estimated)."

---

## Comparable Games/Media

### Into the Breach: Perfect Consequence Preview
Into the Breach shows you exactly what will happen before you commit. Every attack, push, collision, and chain reaction is previewed. This is the most aggressive "built-in optimizer" in any strategy game — not just showing ratios but showing outcomes. Robot Uprising's locked design already borrows Into the Breach's visual clarity but deliberately withholds outcome previews (the sealed watch exists precisely to create uncertainty). The workbench predictions occupy a middle ground: structural analysis without outcome certainty.

### Opus Magnum: Solution Statistics as Post-Hoc Optimizer
Opus Magnum shows you cost, cycles, and area AFTER you solve a puzzle, then compares your solution to the community histogram. This is purely post-hoc — there is no pre-execution predictor. The optimization motivation comes from seeing that your 47-cycle solution is in the 80th percentile and knowing a 23-cycle solution exists. Robot Uprising's Inspector serves this function for individual battles.

### Screeps: The Code-Is-The-Calculator Pattern
In Screeps, the player's JavaScript code IS the optimization tool. Players write their own profilers, ratio calculators, and performance analyzers as part of their game code. The game provides a raw API; the player builds the tooling. This is the most extreme "no built-in optimizer" position — the optimizer is part of the player's solution. Robot Uprising rejects this approach (no freeform code), but the principle of "tooling as gameplay" partially applies: configuring the Inspector's filters and views could itself be a skill.

### Gladiabots: The Black Box Problem
Gladiabots lets you design robot AI through visual programming, then watch robots fight. Critically, Gladiabots provides NO prediction tools and limited post-hoc analysis. Players complain about the "black box" feeling — you can't tell why your robots made specific decisions. Robot Uprising's Inspector directly addresses this complaint. The lesson: post-hoc analysis is the minimum viable optimizer for an autonomous-agent game. Pre-execution prediction is the premium feature.

---

## Sensory Description

### The Workbench with Static Predictions (Option B)

The Plan screen workbench fills the right two-thirds of the screen. The 8x8 board sits in the left third, showing ghost unit positions with translucent perception radii rendered as concentric cyan rings fading to transparency at the edges. Between units, dashed lines in channel colors trace signal paths — golden for `threat-net`, teal for `recon-data`, magenta for `command-override`.

Hovering over a signal path line causes it to pulse brighter and a small tooltip to materialize at the midpoint: **"A3 → D4: 3 ticks latency"** in a monospace font on a dark translucent panel. The number glows amber if the latency exceeds the unit's context window eviction cycle (meaning signals may arrive too late to be useful) and stays cool white if the timing is safe.

In the workbench panel, below the blueprint editor's skill and hook slots, a thin horizontal bar labeled **"Signal Architecture Summary"** shows aggregate metrics: total channels active (small colored dots), longest signal path in ticks (a number with a tiny clock icon), and estimated channel traffic density rendered as a miniature heat spectrum — blue for sparse traffic, amber for moderate, red for congested. These metrics update live as the player drags hooks, reassigns channels, or repositions ghost units on the board preview.

The metrics do NOT predict outcomes. No win probability. No "your striker will die at tick 14." Just the structural properties of the information architecture — the plumbing diagram, not the water flow. The player looks at the summary, sees a 7-tick longest path, thinks "that's too slow for a one-shot-one-kill game where enemies close in 4 ticks," and adds a relay to cut the path. The prediction enabled a design insight without spoiling the execution.

### The Inspector as Post-Hoc Optimizer

After the sealed watch ends, the screen transitions with a cool-to-warm color shift — the battlefield's active palette desaturates to analytical grays and blues, like switching from a live feed to a recorded replay. The timeline scrubber appears at the top: a horizontal track of tick markers, each a small square that glows green (nothing notable), amber (context pressure), or red (overload/death) at that tick.

Clicking a unit on the board opens its inspection panel on the right. The context window chart dominates: a sparkline running left-to-right across all ticks, a thin line that rises and falls like a heart monitor. Below 50% fill, the line traces in cool cyan. Between 50-75%, it shifts to warm amber. Above 75%, it pulses in urgent red. At the moment of overload (if it happened), a sharp spike with a lightning-bolt icon marks the stun tick.

Below the sparkline, the decision trace for the current tick: a vertical chain of labeled boxes connected by thin arrows. The top box shows the context window contents — each slot rendered as a small rectangle with a one-line label ("threat: E7, age: 2, src: Scout-Alpha") in monospace text, bright if it influenced the decision, dim if it was ignored. An arrow points down to the rule that matched: "IF threat in context AND distance < 3 THEN engage" highlighted in gold. Another arrow points to the action taken: "MOVE → F6" with a directional arrow icon.

The player sees the chain. They trace it backward. The threat data arrived at tick 12. The scout sent it at tick 10. Two ticks of latency. But the enemy was at E7 at tick 10 and moved to F6 by tick 12. The striker engaged F6 — where the enemy WAS, not where it IS. The stale data caused a miss. The player now knows: add a relay to cut latency from 2 ticks to... wait, relays ADD latency (1 tick per hop). The player reconsiders. Maybe the scout needs to be closer. Or the striker needs a rule that accounts for enemy movement. The Inspector showed the problem; the player must find the solution.

---

## Player Journeys

### Journey: Priya, 26, Data Scientist, First Playthrough

**Context:** Mission 3. Priya has completed Missions 1 (context windows) and 2 (rules). Mission 3 introduces hooks — reactive triggers that wire units together via named channels. She has a scout and a striker, pre-placed. The mission objective: eliminate 3 enemies that enter from the east edge over 20 ticks.

**Minute 0:00 — The Workbench**
Priya opens the Plan screen. The 8x8 board is on the left showing her scout at B4 and striker at F4. Three enemy spawn indicators pulse red on the east edge (H2, H5, H8). The workbench panel on the right shows the scout's blueprint: two skill slots (patrol equipped, evade empty), two hook slots (both empty), rules (one default: "if enemy in perception, add to context"), context config (6-slot window, FIFO eviction).

She clicks the first empty hook slot on the scout. A dropdown appears: "Trigger: [select]" and "Channel: [type name]". She selects "enemy detected" as the trigger. In the channel field, she types "threat-net" — the text appears in a monospace input field. As she types, a new dashed golden line appears on the board preview connecting her scout to... nothing. A tiny label floats next to the scout: "threat-net (no listeners)."

**Minute 1:00 — Wiring the Striker**
She clicks the striker's blueprint. Two hook slots, both empty. She clicks the first slot, selects "listen" mode, and types "threat-net" in the channel field. The moment she finishes typing, the golden dashed line on the board snaps taut between the scout and striker. A tooltip materializes at the line's midpoint: **"B4 → F4: 4 ticks latency."**

Priya stares at the number. Four ticks. The enemies enter from the east. Her striker is at F4 — 2 tiles from the east edge. An enemy at speed 1 tile/tick reaches the striker in 2 ticks. But the scout's warning takes 4 ticks to arrive. The striker will be engaged before it knows the enemy exists.

**Minute 1:30 — The Latency Insight**
She hovers over the "4 ticks" tooltip. A sub-tooltip expands: "Signal path: B4 → F4. Distance: 4 tiles. Latency: 1 tick/tile × 4 = 4 ticks." Below that, in amber text: "Warning: signal latency (4) exceeds enemy approach time from east edge (~2 ticks at speed 1)."

This is the static prediction at work. No simulation ran. No outcome was spoiled. The workbench simply calculated distance-based latency and compared it to a rough approach-time estimate. Priya didn't need to execute, watch her striker die, open the Inspector, trace the decision chain, discover the latency problem, and iterate. She saw it in the Plan screen.

But she still doesn't know the SOLUTION. Should she move the scout east? Add a relay? Change the striker's rules to patrol independently? Reconfigure the context window? The prediction identified the problem; the game is finding the answer.

**Minute 2:30 — The Redesign**
Priya drags the scout's ghost unit from B4 to E3 — closer to the east edge. The golden line shortens. The tooltip updates: **"E3 → F4: 2 ticks latency."** Amber warning disappears. She also gives the striker a rule: "if no threat in context for 3 ticks, patrol east." Belt-and-suspenders. She hits EXECUTE.

**Minute 3:00 — The Sealed Watch**
The board animates. Tick clock pulses. Her scout patrols near the east edge, spots the first enemy at H5 on tick 3, fires a signal on "threat-net." The golden dashed line between scout and striker flashes. Two ticks later — tick 5 — the striker's context bar gains a new entry. Its rule evaluates: threat detected, distance 2. The striker moves to engage. Tick 7: elimination. Red flash. Priya exhales.

The second and third enemies arrive staggered. The scout catches both. Signals flow. The striker eliminates them with 1-2 ticks to spare each time. Mission complete.

**Minute 5:00 — The Inspector**
Priya opens the Inspector out of curiosity, not necessity. She clicks the striker, scrubs to tick 5. The decision trace shows exactly what she expected: threat data arrived at tick 5 from a signal sent at tick 3. 2-tick latency, as predicted. Context window peaked at 3/6 slots. No overload risk.

She checks the scout. Context peaked at 5/6 on tick 8 when two enemies were visible simultaneously. One more signal source and it would have overloaded. She files this away for Mission 4.

**What Priya learned:** Static latency predictions in the workbench saved her one full execute-watch-inspect cycle. She still had to design the solution herself. The prediction was the equivalent of an architect's structural calculation — "this beam won't support the load" — not a finished building.

**UI Annotations:**
- **Latency tooltip:** Appears on hover over signal path lines. Monospace font, dark translucent background, positioned at line midpoint. Amber warning color when latency exceeds estimated threat approach time.
- **Signal path lines:** Golden dashed lines on board preview. Animate with traveling dots when hovered (showing signal direction). Snap to existence when a channel connects two units.
- **Channel name input:** Monospace text field in hook slot configuration. Auto-completes existing channel names. New names create new channels instantly.

---

### Journey: Marcus, 34, Factorio Veteran (2,400 hours), Mission 7

**Context:** Marcus has completed Missions 1-6. He's deep in the factory-building phase. Mission 7 introduces production tuning — adjusting the factory's build order and blueprint configurations to handle a sustained enemy assault. He has 4 blueprints: Scout-Alpha (long-range perception), Relay-Core (compress + filter), Striker-Vanguard (engage + breach), and Command-Nexus (reassign + reroute). His factory produces units every 8 ticks.

**Minute 0:00 — The Spreadsheet Instinct**
Marcus's first instinct is to open a spreadsheet. 2,400 hours of Factorio trained him: you plan on the second monitor, you execute in the game. He reaches for Alt-Tab. Then stops. The workbench is already showing him a **Signal Architecture Summary** bar at the bottom of the blueprint editor.

The summary shows: 3 channels active (threat-net in gold, recon-data in teal, command-override in magenta). Longest signal path: 6 ticks (Scout-Alpha at spawn → Relay-Core at C4 → Striker-Vanguard at factory exit → Command-Nexus at base). Channel traffic density: threat-net shows amber (moderate), recon-data shows blue (sparse), command-override shows blue (sparse).

**Minute 1:00 — The Architecture Review**
Marcus hovers over the 6-tick path. The tooltip breaks it down: Scout-Alpha (spawns at A-column, variable position) → Relay-Core at C4 (2-3 ticks depending on spawn) → Striker-Vanguard (exits factory at E2, 2 ticks from relay) → Command-Nexus at base B1 (3 ticks from striker). He mutters: "Six ticks to close the OODA loop. Enemy strikers move at medium speed — call it 1 tile/tick. In six ticks they've crossed half the board. My command agent is making decisions about a battlefield state that's six ticks old."

In Factorio, he would open Kirk McDonald's calculator and compute throughput. Here, the workbench gave him the equivalent: signal throughput. And the number is bad.

**Minute 2:00 — The Relay Topology Redesign**
Marcus reconfigures. He changes Relay-Core's position on the ghost board to D5 — more central. He adds a second relay blueprint (Relay-Edge) with only the `amplify` skill, positioned at F5 to reduce the striker-to-command path. The longest path drops to 4 ticks. The topology now looks like a tree: scouts feed Relay-Edge, Relay-Edge feeds Relay-Core, Relay-Core feeds Command-Nexus. Strikers listen to both Relay-Edge (fast, uncompressed) and Relay-Core (slower, compressed).

The Signal Architecture Summary updates: longest path 4 ticks. But now channel traffic density on threat-net shifts from amber to red — two relays amplifying the same channel doubles the traffic. Marcus sees the red indicator and immediately thinks: "context window pressure on the strikers. They're getting duplicate signals."

**Minute 3:00 — The Filter Insight**
He adds a `filter` rule to Relay-Core: "only forward signals less than 3 ticks old." This deduplicates: Relay-Edge forwards everything fast, Relay-Core filters and forwards only novel data. The traffic density drops back to amber. He hasn't executed yet. He hasn't watched a single tick. But he's already iterated twice on his architecture using only the static predictions.

In Factorio, this loop would take 20 minutes: build the factory, watch it run, notice the bottleneck, redesign, rebuild, watch again. Here it took 3 minutes in the workbench.

**Minute 4:00 — Execute**
He hits EXECUTE. The sealed watch plays. His architecture performs well but not perfectly — the Command-Nexus's `reassign` skill fires at tick 14, rerouting a striker that was heading for an already-eliminated enemy, but the reassignment signal takes 3 ticks to reach the striker, and by then the striker has wasted 3 ticks of movement. Marcus watches this happen with the trained eye of someone who has debugged a thousand production lines.

**Minute 8:00 — Inspector Deep Dive**
In the Inspector, Marcus scrubs to tick 14. He traces the reassignment delay. The Command-Nexus made the right call. The signal took the predicted 3 ticks. The problem wasn't latency — it was the Command-Nexus's decision timing. It waited until the enemy was eliminated to reassign, but it should have predicted the elimination (the striker was adjacent) and pre-reassigned.

Marcus goes back to the workbench. He adds a rule to Command-Nexus: "if striker adjacent to threat AND striker's engage rule will fire next tick, pre-reassign striker's next target." This is a PREDICTIVE rule — the command agent simulating its subordinate's behavior. Meta-level thinking. The factory that builds the factory.

**What Marcus never did:** He never alt-tabbed. He never opened a browser. He never computed a ratio on paper. The game gave him the structural analysis tools he needed, and the Inspector gave him the behavioral analysis tools he needed. The 2,400-hour Factorio instinct — "reach for the external tool" — was intercepted by a game that anticipated the need.

**UI Annotations:**
- **Signal Architecture Summary bar:** Horizontal strip below the blueprint editor. Left section: channel dots (colored circles, one per active channel). Center: "Longest path: X ticks" with clock icon. Right: traffic density heat bars per channel (thin horizontal gradients from blue to red).
- **Ghost unit repositioning:** Click and drag ghost units on the board preview. Signal path lines redraw in real-time. Latency tooltips update live during the drag — the number visibly counting up or down as the unit moves closer or farther from its connections.
- **Traffic density indicator:** Per-channel horizontal bar that shifts color based on estimated signal volume. Blue (0-2 signals/tick) → amber (3-5 signals/tick) → red (6+ signals/tick). Estimates based on source count × hook fire frequency, not simulation.

---

### Journey: Kai, 19, CS Student, Mission 4 (The Context Window Mission)

**Context:** Mission 4 is the last tutorial mission before the factory is introduced. It teaches context window management: overload, eviction, and filtering. Kai has 3 pre-placed units — a scout, a striker, and a relay — facing 5 enemies that attack in a wave pattern. The challenge: the scout generates so many observations that the striker's 8-slot context window overflows, causing a 1-tick stun at the worst possible moment.

**Minute 0:00 — No Predictions Available**
Kai opens the workbench. This is Mission 4 — an early tutorial. The Signal Architecture Summary bar is present but intentionally sparse. It shows channel connectivity (one line, scout → striker via relay) and latency (3 ticks). But it does NOT show estimated context fill rates. A small italic note beneath the summary reads: *"Context utilization depends on battlefield conditions. Execute to observe."*

This is deliberate. Context fill prediction would require simulating enemy behavior, scout perception events, and eviction timing — a mini-simulation that would spoil the mission's teaching moment. The game WANTS Kai to experience overload firsthand, then diagnose it in the Inspector.

**Minute 0:30 — First Execute**
Kai hits EXECUTE without much thought. The sealed watch plays. For the first 8 ticks, things go well — the scout detects enemies, sends signals through the relay, the striker engages and eliminates two enemies. Then tick 9: three enemies enter perception range simultaneously. The scout fires three signals. Three ticks later (tick 12), all three hit the striker's context window at once. The context bar — a row of 8 tiny squares at the bottom of the striker's tile — fills from 5/8 to 8/8 in one tick. The squares flash from amber to angry red. A spark effect jitters across the striker's sprite. The striker is stunned.

Tick 13: an enemy moves adjacent to the stunned striker. One-shot, one-kill. The striker is eliminated. Red flash. The remaining enemies overwhelm the scout.

**Minute 2:00 — The Inspector Revelation**
The Inspector opens. Kai clicks the striker. The context window chart tells the story: a steady green line for ticks 1-11, then a vertical spike to red at tick 12, then flatline. The decision trace at tick 12 shows: "STUNNED — context overload. 3 new entries exceeded remaining capacity (3 slots free, 3 entries arrived, 0 evicted — FIFO eviction had no expired entries to remove)."

Kai sees the problem. The eviction policy (FIFO) wasn't aggressive enough. Old entries from ticks 6-7 were still occupying slots when the tick-12 wave hit. If the context window had evicted entries older than 4 ticks, those 3 slots would have been free.

**Minute 3:00 — The Fix**
Back in the workbench, Kai changes the striker's context config: eviction priority from FIFO to "age > 4 ticks." The workbench doesn't predict whether this will prevent the overload — it can't, because it doesn't know when the enemy wave arrives. But it does show a small annotation on the context config panel: *"Eviction policy: age-based (>4 ticks). Estimated steady-state capacity: 4-6 active slots (depends on signal frequency)."*

This is the boundary: the workbench provides structural estimates (how much capacity your config TENDS to leave free) but not dynamic predictions (will you overload at tick 12). The gap is the game.

**Minute 4:00 — Second Execute**
Kai executes again. This time, the age-based eviction clears old entries before the tick-12 wave. The striker's context peaks at 7/8 — amber, not red. No stun. The striker survives and eliminates all remaining enemies. Mission complete.

**Minute 5:00 — Inspector Victory Lap**
Kai opens the Inspector again. The context chart shows the amber peak at tick 12 but no red spike. The eviction log shows 2 entries evicted at tick 11 (both older than 4 ticks), making room for the incoming wave. Kai feels the satisfaction of a diagnosed and fixed problem. The game taught context management through failure, diagnosis, and iteration — not through a calculator that would have said "set eviction to age > 4" before the first execute.

**What Kai experienced:** The absence of context fill predictions in the early missions is as important as the presence of latency predictions in later missions. The game ramps its built-in optimizer: simple structural metrics early (latency, connectivity), richer estimates later (traffic density, capacity projections), but NEVER full simulation previews. The player always has to execute to know.

**UI Annotations:**
- **Context config panel:** Dropdown for eviction policy (FIFO, age-based, priority-based). When age-based is selected, a slider appears for the age threshold. Below the slider, italic text shows estimated steady-state capacity range.
- **Context bar on unit tile (sealed watch):** 8 tiny squares in a row at the bottom of the unit's tile. Empty squares are dark gray outlines. Filled squares glow in a color based on entry age: bright cyan (fresh, <2 ticks old), warm amber (aging, 3-4 ticks), dim gray (about to be evicted). All squares flash red simultaneously during overload, with a spark particle effect.
- **Overload stun visual:** The unit's sprite jitters 1-2 pixels in random directions for the duration of the stun tick. A small lightning-bolt icon appears above the unit. The context bar pulses red. A faint crackle sound plays.

---

## The Design Recommendation: The Architect's Blueprint Principle

The answer to "how much should the workbench predict?" follows a principle borrowed from architecture: **an architect's blueprint shows structural properties, not lived experience.**

A blueprint tells you load-bearing capacity, plumbing routes, electrical wiring paths, and room dimensions. It does NOT tell you whether the family living there will be happy, whether the kitchen will feel cramped during Thanksgiving, or whether the neighbor's dog will bark through the bedroom window. Structural properties are calculable. Lived experience requires inhabiting the space.

**For Robot Uprising, this means:**

| Prediction Type | Show in Workbench? | Rationale |
|---|---|---|
| Signal latency (ticks per path) | Yes | Pure geometry. Hiding it is busywork, not gameplay. |
| Channel topology (who talks to whom) | Yes | Already shown via signal path lines. |
| Channel count and connectivity | Yes | Structural property of the architecture. |
| Estimated traffic density per channel | Yes (late game) | Based on source count × hook frequency. Rough but useful. |
| Steady-state context capacity estimate | Yes (late game) | Based on eviction policy settings. Range, not exact number. |
| Context fill rate during battle | No | Requires simulation. This is the game. |
| Rule match predictions | No | Requires simulation. This is the game. |
| Win/loss probability | No | This would destroy the sealed watch's purpose. |
| Unit death predictions | No | Spoils the emotional arc. |

This graduated approach — more structural data as the player progresses, never dynamic simulation — gives Factorio veterans the planning tools they crave while preserving the experiment-and-observe loop that makes Robot Uprising feel like managing real autonomous systems. The Inspector remains the post-hoc deep analyzer. The workbench becomes the architect's drafting table. The sealed watch remains the moment of truth where the blueprint meets reality.

**The TikTok clip:** A player hovers over a signal path line in the workbench. "7 ticks." They drag the relay closer. The number counts down in real-time: "6... 5... 4... 3." They nod. Hit EXECUTE. The sealed watch plays. The signal fires, races along the exact path they traced, arrives in exactly 3 ticks, the striker pivots and eliminates the threat with one tick to spare. The player leans back. They KNEW the timing would work — because they calculated it in the workbench — but watching it happen in the sealed watch is still a rush. The prediction was the confidence; the execution is the payoff.

---

## Sources

- [Kirk McDonald's Factorio Calculator](https://kirkmcdonald.github.io/)
- [Calculating Factorio — Kirk McDonald](https://kirkmcdonald.github.io/posts/calculation.html)
- [Kirk McDonald Patreon](https://www.patreon.com/kirkmcdonald)
- [Helmod: Assistant for planning your factory — Factorio Mods](https://mods.factorio.com/mod/helmod)
- [YAFC — Factorio calculator/analyser for modded games — Factorio Forums](https://forums.factorio.com/viewtopic.php?t=85215)
- [YAFC-CE GitHub](https://github.com/shpaass/yafc-ce)
- [FactorioLab](https://factoriolab.github.io/)
- [Rate Calculator — Factorio Mods](https://mods.factorio.com/mod/RateCalculator)
- [Ingame simple calculator — Factorio Forums](https://forums.factorio.com/viewtopic.php?p=659740&t=12211)
- [Calculator Mod in Space Age — Factorio Forums](https://forums.factorio.com/viewtopic.php?t=130996)
- [Soren Johnson — "Water Finds a Crack" — Designer Notes](http://www.designer-notes.com/game-developer-column-17-water-finds-a-crack/)
- [Why we optimize the fun away — Rooslawn's Unmapped Worlds](https://unmappedworlds.com/posts/why-we-optimize-the-fun-away/)
- [Solving the mathematics of Factorio Quality — Daniel's blog](https://dfamonteiro.com/posts/factorio-quality-1/)

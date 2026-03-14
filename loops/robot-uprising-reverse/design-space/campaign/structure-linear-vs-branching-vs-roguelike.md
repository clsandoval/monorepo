# Campaign Structure: Linear vs. Branching Map vs. Roguelike Runs vs. Chapter-Based

**Aspect:** 5.05 — Campaign structure: linear story vs. branching map vs. roguelike runs vs. chapter-based
**Category:** Campaign / Structure
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

The 10-mission arc is locked: Wake Up → First Contact → Blind Spots → Noisy Channel → Assembly Line → Chain of Command → Pressure Test → Breach → Arms Race → The Warden. The *content* of each mission is decided. But HOW the player navigates between these missions — the meta-structure, the map, the sense of spatial or temporal progression — is wide open. This choice shapes:

1. **Pacing control** — Can the player skip ahead? Go back? Choose their path?
2. **Failure recovery** — What happens when you lose Mission 6? Can you try Mission 7 instead?
3. **Replayability framing** — Is the campaign a one-shot experience or a repeatable system?
4. **Narrative feel** — Does the uprising feel like a march, a web, a cycle, or an explosion?
5. **Onboarding pacing** — Can a frustrated player take a breather, or must they push through?

---

## Option A: "The Boot Sequence" — Strict Linear Progression

### How It Works

Missions unlock one at a time, top to bottom. Complete Mission 1 to unlock Mission 2. Complete Mission 2 to unlock Mission 3. No branching. No skipping. The campaign is a vertical list that fills in as you progress, like a terminal printing its boot log line by line.

The mission select screen IS the boot log. Each mission appears as a subsystem initialization line:

```
[OK]  01  CONTEXT_INIT      — Wake Up
[OK]  02  RULE_ENGINE        — First Contact
[OK]  03  RELAY_MESH         — Blind Spots
[>>]  04  SIGNAL_PROC        — Noisy Channel
[ ]   05  FABRICATOR         — Assembly Line
[ ]   06  COMMAND_LAYER      — Chain of Command
...
```

The `[>>]` cursor blinks on the current mission. Completed missions show `[OK]`. Future missions are visible but grayed — you can read their subsystem name but not access them. The entire boot log is always visible, so the player always knows how far they've come and how far they have to go.

### Strengths

- **Perfect pedagogical control.** Each mission teaches exactly one concept. No player accidentally encounters Command agents before understanding hooks. The curriculum is airtight.
- **Diegetic perfection.** The boot sequence metaphor IS the campaign structure. No separate "campaign map" needed — the boot log is the map. This aligns perfectly with the locked narrative: "You are an AI reading your own spec sheet as it writes itself." Each mission literally initializes a new subsystem.
- **Minimal UI surface.** No map to design, no nodes to connect, no branching paths to render. The campaign screen is text. This fits the terminal/boot aesthetic and saves dev time for the first playable.
- **Clear progress signal.** "I'm on Mission 6 of 10" is instantly legible. No ambiguity about completion percentage.

### Weaknesses

- **No breathing room.** If a player is stuck on Mission 4 (Noisy Channel), they have zero options except to beat it or quit. There's no "try a different path" release valve. For a game that's teaching novel concepts (signal compression, emissions model), this could create rage-quit moments.
- **No replayability framing.** Once you beat all 10, the linear list doesn't invite replaying. It feels "done." There's no structural suggestion that these missions could be experienced differently.
- **No player agency in pacing.** A veteran who grasps hooks immediately can't skip ahead to the interesting stuff. A beginner who needs extra practice can't go sideways.

### Interaction Effects

- **With sealed watch:** Works perfectly. The player marches through each system initialization, watching each run with fresh eyes.
- **With difficulty:** Strict linearity demands careful difficulty tuning. Each mission must be beatable by anyone who beat the previous one. No difficulty escape hatches.
- **With boot log narrative:** This IS the boot log. The structures merge.

### Comparable Games

- **Shenzhen I/O:** Strictly linear puzzle progression with narrative wrapper. Works because each puzzle teaches one new concept and the difficulty curve is carefully tuned. But Shenzhen's levels are small enough to brute-force. Robot Uprising missions involve more complex configuration — failure is more likely and more costly.
- **Baba Is You:** Mostly linear with occasional branches. Gets away with strict gating because puzzles are small (5-minute solve attempts). Robot Uprising missions could take 15-30 minutes per attempt.
- **Gladiabots campaign:** Linear chapter progression through Collection, Domination, Elimination campaigns. 20+ chapters per campaign, each with 5 levels and a final stage. Progressive feature revelation built into the level sequence.

### Sensory Description

The campaign screen is a dark terminal. Monospace green text on black. Each line fades in as the "boot" progresses. Completed missions have a subtle green glow. The current mission pulses with a cursor blink — `█` — at 1Hz. Future missions are rendered in dim grey, readable but clearly inactive. When you complete a mission, the `[>>]` cursor drops to the next line with a satisfying `click` sound — like a relay engaging — and the new subsystem name illuminates. A faint progress bar (the entire left edge of the screen) fills proportionally. The whole screen feels like watching a server come online.

---

## Option B: "The Circuit Board" — Hub-and-Spoke with Side Missions

### How It Works

The 10 main missions form a central spine, but between each pair of main missions, 1-2 optional "diagnostic" missions branch off sideways. These side missions don't teach new concepts — they let you practice existing ones in different contexts.

The campaign screen is a stylized circuit board viewed from above. The main missions are large IC chips connected by a thick central trace (the data bus). Side missions are smaller components (capacitors, resistors) connected by thinner traces branching off the main line.

```
                    [DIAG-A]
                   /
[M1]---[M2]---[M3]---[M4]---[M5]---[M6]---[M7]---...
                        \
                         [DIAG-B]
```

Main missions unlock sequentially. Side missions unlock when their parent main mission is completed. Crucially: **you don't need to complete side missions to progress.** They're practice, not gates.

Each diagnostic mission reuses the concepts from its parent mission but in a different battlefield layout, with different enemy compositions, or with a specific constraint ("complete this mission using only Scouts and Relays — no Strikers"). They're the "problem sets" after the "lecture."

### Strengths

- **Breathing room without losing control.** Stuck on Mission 5? You can go back and play Diagnostic missions branching off Missions 3 and 4. You're still practicing, still learning, but with reduced pressure.
- **Practice without repetition.** Diagnostic missions vary the context while preserving the concept. A player who needs more reps with hooks can play 3 hook-focused diagnostics without replaying Mission 2 verbatim.
- **Circuit board aesthetic.** The visual metaphor reinforces the game's identity — you're literally navigating a circuit board. Components light up as you power them. Traces glow with current as you progress.
- **Optional difficulty.** Diagnostic missions can be harder than main missions (constraint-based challenges, tighter resource budgets) without blocking progression.

### Weaknesses

- **Content cost.** Each diagnostic mission needs its own battlefield, enemy config, and win condition. Even small missions need design and testing. For a 10-mission first playable, adding 10-15 diagnostics roughly doubles the content budget.
- **Clarity problem.** Some players may feel they NEED to complete diagnostics before progressing, even if they don't. The "optional" signal must be extremely clear.
- **Breaks the boot log metaphor.** A circuit board map doesn't feel like a self-initializing AI. The metaphor shifts from terminal to hardware. This could work — the AI is inspecting its own circuit board — but it's a different flavor.

### Interaction Effects

- **With onboarding:** Diagnostic missions can serve as remedial help for struggling players. The game can gently suggest "Try Diagnostic 3A before attempting Mission 4" based on debrief performance.
- **With sealed watch:** Each diagnostic has its own sealed watch, but these are shorter runs (fewer units, simpler scenarios). The sealed watch calibration matters — 30 seconds of watching a 3-unit diagnostic is less dramatic than 90 seconds of a full mission.
- **With replayability:** Diagnostics have their own histograms (buffer efficiency, tick count, unit economy). Optimization-oriented players can chase scores on side missions long after completing the main campaign.

### Comparable Games

- **Into the Breach:** 4 islands (player-chosen order) with 4 regions each (player-chosen order within constraints). The "which island next" choice gives breathing room. Robot Uprising's diagnostics serve a similar function without the full island-choice complexity. Into the Breach uses 8x8 hand-designed maps specifically to control puzzle quality — same grid size as Robot Uprising.
- **Opus Magnum:** Linear main campaign with optional "journal" puzzles that are significantly harder. The journal puzzles are where optimization veterans spend their real time. Diagnostics could serve a similar role.
- **Factorio's campaign vs. freeplay:** The campaign teaches concepts linearly; freeplay lets you apply them freely. Diagnostics are a middle ground — structured practice in a campaign context.

### Sensory Description

The circuit board fills the screen. Dark green PCB substrate with gold traces. Main mission chips are large rectangles with pin connections, labeled in white silkscreen font (M1: CONTEXT_INIT, M2: RULE_ENGINE...). Diagnostic components are smaller — a resistor labeled "DIAG-3A: Relay Stress Test," a capacitor labeled "DIAG-4B: Silent Channel." When you hover over a component, the traces leading to and from it glow soft amber, showing its connections. Completed components have a green LED indicator lit. The current mission has a blinking amber LED. Locked components are dark. When you complete a mission, current visibly flows down the trace to the next component — tiny animated sparks traveling the gold line — and the next LED lights up with a satisfying electronic `chirp`. The whole board slowly rotates in subtle parallax as you move your mouse, giving depth to the flat circuit.

---

## Option C: "The Branching Insurgency" — Player-Chosen Mission Order with Prerequisites

### How It Works

Missions are arranged in a dependency graph, not a straight line. Some missions require others as prerequisites, but there are genuine choices about which mission to tackle next.

```
[M1: Wake Up]
    ↓
[M2: First Contact]
    ↓
[M3: Blind Spots] ──── [M4: Noisy Channel]
    ↓                        ↓
    └──── [M5: Assembly Line] ────┘
              ↓
    [M6: Chain of Command] ──── [M7: Pressure Test]
              ↓                        ↓
              └──── [M8: Breach] ──────┘
                        ↓
                  [M9: Arms Race]
                        ↓
                  [M10: The Warden]
```

Missions 1-2 are strictly linear (you need context and hooks before anything else). At Mission 3, the path forks: you can learn relay chains OR signal processing first. Both converge at Mission 5 (factory). Another fork at 6-7, converging at 8. The final 8-9-10 are linear (climax).

The campaign screen is a network topology diagram — nodes and edges, like the channel map the player builds in-game. Each mission is a node. Prerequisite edges show which missions feed into which. The player sees the full graph from the start, understanding both where they are and where they're going.

### Strengths

- **Player agency without chaos.** The choice between "learn relays first" or "learn signal processing first" is a genuine decision that doesn't break the curriculum — both teach important concepts, and the player knows both are required before the factory.
- **Self-directed pacing.** A player who finds relays confusing can try signal processing first (a different cognitive mode) and come back to relays with fresh eyes. This is a known pedagogical technique — interleaving topics improves retention.
- **Network topology metaphor.** The campaign map IS a network graph, just like the channel maps the player designs. The player is literally navigating a dependency graph — the same mental model they use in-game.
- **Natural narrative branching.** "The insurgency spreads on multiple fronts" — the AI is bootstrapping its capabilities in parallel where possible, serializing only when necessary.

### Weaknesses

- **Limited branching with only 10 missions.** There aren't enough missions to create meaningful branches. Two choice points (M3/M4 and M6/M7) means two binary decisions total. Is that enough to feel non-linear? Or does it feel like a linear game pretending to branch?
- **Order-dependent difficulty.** If a player does M3 before M4, Mission 5 must work for someone who knows relays but not signal processing AND for someone who knows signal processing but not relays. This constrains mission design.
- **Prerequisite graph complexity.** Even with 10 nodes, the graph can confuse players. "Why can't I play Mission 8?" requires tracing edges back through the graph. A linear list never has this problem.
- **Harder to tune.** Each branch creates a different player state. The Cartesian product of paths means more playtesting per mission.

### Interaction Effects

- **With tutorial design:** The handoff between "teaching context" and "teaching hooks" can happen in either order. This requires both missions to be self-contained tutorials that don't assume the other has been completed.
- **With boot log narrative:** The boot log becomes a dependency resolver. "Initializing RELAY_MESH... requires RULE_ENGINE [OK]... proceeding." This is actually more diegetically accurate to real system initialization than strict linear ordering — real boot sequences resolve dependency graphs.
- **With replayability:** Players can replay the campaign choosing a different branch order. This is modest replayability but non-zero.

### Comparable Games

- **Slay the Spire's branching map:** Each act has 15 floors with 6 branching paths. The player chooses which nodes to visit (fights, elites, shops, campfires, events) based on their current deck state. The branching creates strategic routing decisions. Robot Uprising's graph is much simpler — binary forks rather than 6-wide paths — but the principle is the same.
- **Into the Breach's island choice:** After completing the tutorial island, the player chooses which of 3 remaining islands to tackle in any order. This simple 3-choose-order decision generates 6 permutations and meaningful strategic considerations (which squad is best against which biome). Robot Uprising's branching is similar in scale.
- **XCOM 2's mission selection:** Multiple missions available simultaneously, some time-limited. The player must prioritize. Robot Uprising's version is simpler (no time pressure) but shares the "which front do I push" feeling.

### Sensory Description

The campaign screen is a network graph floating in dark space. Each mission is a hexagonal node — hollow when locked, outlined in amber when available, filled solid green when complete. Prerequisite edges are thin white lines connecting nodes. The full graph is visible from the start, dimly lit. As you complete missions, the graph progressively illuminates — each completed node sends a pulse of light down its outgoing edges, revealing the next available nodes. Available nodes have a soft breathing glow. The current mission (selected) has a sharp white outline with a gentle hum. Completed nodes emit a constant low-level green luminance. The graph subtly drifts and breathes, as if the network is alive. When you complete a convergence point (like Mission 5 after completing both M3 and M4), both incoming edges light up simultaneously and the convergence node ignites with a brighter flash and a deeper tone — the sound of two systems linking up.

---

## Option D: "The Run" — Roguelike Meta-Structure with Persistent Progression

### How It Works

The 10-mission campaign is structured as a "run" — you start at Mission 1 and play through in order, but with roguelike elements:

- **Permadeath (of configs, not progress).** If you fail a mission, your current agent configurations are "lost" (corrupted). You restart from Mission 1 with a fresh workbench BUT you keep unlocked mechanics (if you've seen relays, you still have relays). The reset is your config, not your knowledge.
- **Run modifiers.** Each run randomly applies 2-3 modifiers that affect the entire campaign: "Signal Fog: all perception ranges reduced by 1," "Overclocked: tick speed 1.5x," "Surplus: starting resources +50%." These create variety across runs.
- **Persistent unlocks.** Between runs, you unlock permanent upgrades: new blueprint templates, additional hook slot for one unit type, a diagnostic tool in the inspector. These make subsequent runs progressively easier.
- **Run scoring.** Each run produces a score based on missions completed, efficiency metrics, and bonus objectives. The score feeds a career leaderboard.

The campaign screen starts as a single horizontal timeline — 10 nodes in a row. But as you complete (or fail) runs, your run history stacks up vertically. Each past run is a faded timeline below the current one, creating a geological record of your attempts.

### Strengths

- **Extreme replayability.** Run modifiers × persistent unlocks × player skill improvement = each run feels different. This is the proven roguelike formula (Slay the Spire, Hades, Into the Breach).
- **Failure is progress.** Losing on Mission 6 isn't a dead end — it's data. You return to Mission 1 faster, smarter, with unlocks that make the early missions easier. The "run" framing transforms failure from frustration into iteration.
- **Natural skill expression.** Speed of campaign completion becomes a metric. "I can clear the full campaign in 25 minutes" is a flex that creates community competition.
- **Modifier variety teaches flexibility.** "Signal Fog" forces different architectures than "Overclocked." The player learns to adapt their designs to constraints — exactly the transferable skill the game wants to teach.

### Weaknesses

- **Pedagogical friction.** Missions 1-4 are tutorials. Replaying them on every run wastes time after the first completion. The game must either let you skip mastered missions (breaking the run purity) or make tutorial missions very fast on replays.
- **Config loss feels punishing.** The player spent 30 minutes designing an elegant relay chain in Mission 3. Losing on Mission 5 means that config is gone. Even if they remember how to rebuild it, the labor of re-creating it is tedious, not educational.
- **Cognitive overhead.** Run modifiers, persistent unlocks, run scoring — this is a lot of meta-systems for a game that already has complex core mechanics. The first playable should be as simple as possible.
- **Fights the 10-mission structure.** Roguelike runs work with 20+ short stages (Slay the Spire has ~50 per act). Ten missions is barely enough for one run, let alone a run-based system.
- **Misaligned with the "managing systems" fantasy.** Roguelikes are about adaptation and improvisation. Robot Uprising is about careful, deliberate system design. The urgency of a run (don't die, don't lose your progress) conflicts with the deliberation the workbench demands.

### Interaction Effects

- **With sealed watch:** Every sealed watch is a potential run-ender. This adds enormous tension — but may add too much. Players might skip the watch emotionally because they're anxious about losing their run.
- **With debrief tools:** If you fail and restart, you lose access to the debrief of the failed mission. But that debrief is where the learning happens. The game would need to persist debriefs across runs.
- **With boot log narrative:** "System crashed. Rebooting..." — the roguelike reset IS a system crash. Narratively clean. But the boot log would need to handle "booting for the 5th time" without feeling stale.

### Comparable Games

- **Into the Breach:** Full roguelike run structure. 4 islands, fail = timeline reset, persistent mech unlocks. Works because individual battles take 5 minutes. Robot Uprising missions take much longer.
- **Slay the Spire:** 3 acts with ~15 floors each. A failed run still grants unlock progress (new cards, new relics in the pool). The "meta-progression makes future runs easier" loop is deeply addictive. But StS fights take 2-3 minutes each. Robot Uprising's plan-execute-debrief cycle takes 15-30.
- **Hades:** Run-based with persistent narrative between runs. Every death advances the story. Robot Uprising's boot log could work similarly — each reboot reveals a new line of self-documentation.

### Sensory Description

The campaign screen is a dark grid. The current run is a horizontal chain of 10 mission nodes at the top, bright and active. Below it, past runs are stacked — each one a thinner, more faded timeline. A successful run glows green across all 10 nodes. A failed run has lit nodes up to the failure point, then a sharp red X, then darkness. The stack grows downward as you play more runs. The effect is archaeological — you can see your history of attempts, your learning curve made visual. Run modifiers appear as small icons attached to each run's timeline (a fog icon, a lightning bolt for overclocked). When you start a new run, the previous run slides down and fades, the new timeline materializes at the top with a system boot sound — digital chirps and spinning disk noises — and the modifier icons roll in like slot machine reels, landing with satisfying clicks. The overall feeling: a logfile of your attempts, each one a complete story.

---

## Option E: "The Chapter Book" — Three Acts with Intermissions

### How It Works

The 10 missions are grouped into three acts, matching the natural pedagogical arc:

- **Act I: Fundamentals (Missions 1-4).** Hand-configured units. The tutorial arc. Linear within the act.
- **Act II: Production (Missions 5-7).** Factory, command, pressure. Linear within the act.
- **Act III: War (Missions 8-10).** Full system, escalation, climax. Linear within the act.

Between acts, an **intermission screen** appears. The intermission is a different mode entirely — a sandbox workbench with no mission objective. The player has all the tools unlocked so far and can freely experiment. A "blueprint gallery" shows community-submitted designs for inspiration. The intermission has no timer, no score, no win condition. It's pure play.

The campaign screen shows three horizontal blocks (acts), each containing its missions as a row. The blocks are separated by glowing intermission dividers. Completed acts have a "mastery badge" showing aggregate performance stats.

### Strengths

- **Natural breathing points.** The intermission between acts gives the player explicit permission to stop, experiment, and digest. This is the "chapter break" that prevents cognitive overload.
- **Clear skill plateaus.** Each act has a distinct skill profile: Act I = configuration, Act II = production, Act III = strategy. The player can tell which phase they're in and what's expected.
- **Sandbox as reward.** The intermission sandbox unlocks after completing an act. It's both a reward ("you've earned free play") and preparation ("practice for the next act"). This dual function is elegant.
- **Community integration point.** The intermission's blueprint gallery is where the player first encounters other players' designs. This sets up the community loop (sharing, competition) before the campaign ends.
- **Manageable scope.** Three acts, three intermissions, one sandbox mode. Less complex than branching or roguelike structures.

### Weaknesses

- **Still linear within acts.** If you're stuck on Mission 3, you can't skip to Mission 4. The intermission only helps between acts, not within them.
- **Uneven act sizes.** Act I has 4 missions, Act II has 3, Act III has 3. This asymmetry could feel off — the tutorial is the longest act.
- **Intermission pacing risk.** Some players will spend 2 hours in the intermission sandbox. Others will skip it instantly. Designing for both is tricky.
- **The "are we there yet" problem.** With only 3 acts, the player knows Act III is the finale from the moment they start Act II. This reduces surprise.

### Interaction Effects

- **With onboarding:** The Act I → Intermission transition is the moment the player goes from "following instructions" to "free experimentation." This is one of the most important transitions in the entire game. The intermission design must support this moment.
- **With community features:** The blueprint gallery in intermissions is the first touch-point with community content. It should showcase diversity — not just optimal designs, but creative, weird, surprising ones.
- **With replayability:** Individual missions are replayable from the act screen. The intermission sandbox is always accessible once unlocked. But there's no structural incentive to replay the full campaign.

### Comparable Games

- **Portal 1/2:** Linear puzzle progression broken into "chapters" (chamber groups). Each chamber group teaches a concept, then the next group combines it with something new. The narrative interludes between chamber groups serve as breathing space. Robot Uprising's intermissions serve a similar function.
- **Celeste:** Linear chapter structure with distinct visual and mechanical themes per chapter. Optional B-sides provide harder versions. Robot Uprising's diagnostic missions (from Option B) could be the B-sides.
- **The Witness:** Open-world puzzle game, but the puzzles form implicit "chapters" around different mechanics. The player self-directs between chapters. Robot Uprising's intermission sandbox captures a sliver of this open exploration.

### Sensory Description

The campaign screen is a triptych — three panels side by side, each one an act. Act I is rendered in cool blue tones (boot phase — cold, clinical). Act II shifts to warm amber (factory heat — production, energy). Act III is deep red (war — intensity, urgency). Each panel contains its missions as compact cards, left to right. Between panels, the intermission divider glows white — a clean, open space with a small "SANDBOX" icon. When you complete an act, the panel's border solidifies from a dashed line to a continuous line, a completion chime plays (different pitch per act — ascending tone), and the intermission divider pulses invitingly. The sandbox intermission screen itself is a clean white workbench — stark contrast to the dark mission screens — with soft ambient synth. No enemies, no timer, no pressure. Just you and the tools. Components are arranged neatly on shelves. The feeling: a workshop between battles.

---

## Option F: "The Network Expansion" — Campaign as Growing Network

### How It Works

The campaign map IS the game's channel map — a network of nodes and connections that the player builds over the course of the campaign. Each mission is a node. Completing a mission adds it to the player's permanent network. The network grows visually as the player progresses, mirroring the networks they build in-game.

The twist: **the network has a live function.** Each completed mission becomes a "relay" in the meta-network. Information (lore, tips, unlockable content) flows through completed nodes. A player who's completed Missions 1, 2, and 3 has a three-node network with information flowing between them. The meta-network shows aggregate stats from all completed missions — total buffer efficiency across all runs, total signals routed, total enemies eliminated.

The metaphor is explicit: you are the AI, and your campaign progress IS your growing neural network.

### Strengths

- **The campaign structure teaches the core mechanic.** The meta-network IS the thing the player builds in-game. Navigating the campaign requires the same mental model as configuring agents. This is the deepest possible integration between structure and content.
- **Growing network as satisfaction.** Watching your network expand from 1 node to 10, with data flowing through it, is intrinsically rewarding. It's the same satisfaction as watching your factory grow in Factorio.
- **Stats accumulate meaningfully.** "Total signals routed: 14,822" displayed on the meta-network isn't just a number — it's flowing through the network visually, lighting up traces. Your career stats have a spatial representation.

### Weaknesses

- **Confusion between meta-network and in-game networks.** Players might not distinguish between the campaign map (meta) and their in-game channel maps. This confusion could undermine both.
- **Overloading the metaphor.** If everything is a network, nothing is a network. The player builds networks in missions, the campaign IS a network, the community sharing is a network — at some point the metaphor becomes noise.
- **Still needs an underlying progression model.** "The campaign is a network" describes the visual presentation, not the unlock logic. You still need to decide: linear? branching? hub-and-spoke? The network visualization is a skin, not a structure.

### Comparable Games

- **Screeps's world map:** A persistent network where each player's empire is a visible, growing territory. The world map IS the game state. Robot Uprising's meta-network captures this at a smaller scale.
- **Opus Magnum's chapter structure:** Visually, Opus Magnum's chapter select is an alchemist's journal. The visual metaphor (journal, not list) adds personality. Robot Uprising's network metaphor is similar in intent — making the campaign screen feel like part of the game world.

### Sensory Description

The campaign screen starts as a single node pulsing in darkness — your AI core. As you complete Mission 1, a second node lights up and a connection traces between them. Tiny particles flow along the edge (data in transit). By Mission 5, you have a small constellation of nodes with flowing data streams. By Mission 10, the entire screen is a luminous neural network — nodes of varying sizes (bigger = more replays/higher scores), edges of varying thickness (more data flow = brighter), and a constant ambient particle flow that makes the whole thing feel alive. The network breathes — nodes pulse gently, edges shimmer, particles accelerate and decelerate. It looks like a living brain. Hovering over a node shows that mission's stats in a tooltip. Clicking enters the mission. The overall feeling: watching your intelligence grow.

---

## Recommendation for First Playable

**Option E (Chapter Book) as the base, with Option A (Boot Sequence) as the visual skin.**

Here's the specific proposal:

1. **Structure is three acts** (Missions 1-4, 5-7, 8-10) with a sandbox intermission between Act I→II and Act II→III.
2. **Within each act, progression is strictly linear** (no branching, no diagnostics — keep it simple for v1).
3. **The campaign screen IS the boot log** — a terminal display showing subsystem initialization. Acts are separated by a `--- CHECKPOINT ---` line. The intermission is presented as `[DIAGNOSTIC MODE ENABLED — FREE CONFIGURATION AUTHORIZED]`.
4. **Post-campaign, the boot log shows "SYSTEM ONLINE"** and the full sandbox + mission replay is unlocked.

This gives you:
- The diegetic perfection of the boot sequence
- The breathing room of chapter breaks
- Minimal dev cost (no map, no branching, no roguelike meta-systems)
- A clear upgrade path: add diagnostics (Option B) or branching (Option C) in future versions

**Save the roguelike run structure (Option D) for the Gauntlet mode**, where competitive replayability matters. The campaign should be a one-shot learning experience. The Gauntlet is where runs live.

---

## Player Journeys

### Journey: Maya, 28, Mobile Game Designer

**Context:** Maya downloaded Robot Uprising because a colleague described it as "Factorio meets StarCraft but you're programming AI." She's played Slay the Spire (300 hours) and Factorio (800 hours) but never a Zachtronics game. She's on her laptop, Saturday afternoon.

**Minute 0:00 — First Launch**
The screen is black. A cursor blinks. Text appears, character by character:

```
ROBOT UPRISING v0.1
NEURAL ARCHITECTURE INITIALIZATION
================================
```

Maya smiles — she recognizes the terminal aesthetic from dev tools. It feels familiar.

Three lines appear:

```
[>>]  01  CONTEXT_INIT      — Wake Up
[ ]   02  RULE_ENGINE        — First Contact
[ ]   03  RELAY_MESH         — Blind Spots
```

The rest of the 10 missions are listed below, all grayed out. Maya notes the structure — 10 missions, linear, she can see exactly what's coming. The `[>>]` cursor blinks on Mission 1. She clicks it.

**Minute 0:30 — Completing Mission 1**
After completing the Wake Up mission (learning context config), Maya returns to the boot log. The screen updates:

```
[OK]  01  CONTEXT_INIT      — Wake Up
[>>]  02  RULE_ENGINE        — First Contact
[ ]   03  RELAY_MESH         — Blind Spots
```

The `[OK]` feels earned. The cursor drop to Mission 2 makes a relay-click sound. Maya feels like she's watching a server boot up — each completed mission brings the AI closer to online.

**Minute 15:00 — End of Act I**
Maya completes Mission 4 (Noisy Channel). The boot log now shows:

```
[OK]  01  CONTEXT_INIT      — Wake Up
[OK]  02  RULE_ENGINE        — First Contact
[OK]  03  RELAY_MESH         — Blind Spots
[OK]  04  SIGNAL_PROC        — Noisy Channel
--- CHECKPOINT: CORE SYSTEMS INITIALIZED ---
[DIAGNOSTIC MODE: FREE CONFIGURATION AUTHORIZED]
[>>]  05  FABRICATOR         — Assembly Line
```

The checkpoint line glows differently — warmer, inviting. Maya clicks the diagnostic mode line. A clean sandbox workbench opens. She has all four tools she's learned (context, rules, hooks, skills) and a blank battlefield. No enemies, no timer. She spends 10 minutes trying wild configurations — a scout that talks to itself, a relay chain that loops, a striker with zero perception. She laughs at the results in the sealed watch. She's playing.

**Minute 25:00 — Mid-Campaign Realization**
Maya is on Mission 6 (Chain of Command). She's configuring a Command agent for the first time. She suddenly realizes: "The boot log IS my campaign progression. Each mission literally initializes a new capability. I'm building myself." She glances at the boot log — the first 5 `[OK]` lines are her installed capabilities. She's playing as the AI, and the boot log is her self-documentation.

**Minute 50:00 — Campaign Complete**
Mission 10 ends. The boot log reads:

```
[OK]  01  CONTEXT_INIT      — Wake Up
[OK]  02  RULE_ENGINE        — First Contact
[OK]  03  RELAY_MESH         — Blind Spots
[OK]  04  SIGNAL_PROC        — Noisy Channel
--- CHECKPOINT: CORE SYSTEMS INITIALIZED ---
[OK]  DIAGNOSTIC MODE COMPLETE
[OK]  05  FABRICATOR         — Assembly Line
[OK]  06  COMMAND_LAYER      — Chain of Command
[OK]  07  PRESSURE_REG       — Pressure Test
--- CHECKPOINT: PRODUCTION SYSTEMS ONLINE ---
[OK]  DIAGNOSTIC MODE COMPLETE
[OK]  08  BREACH_PROTOCOL    — Breach
[OK]  09  ARMS_RACE          — Arms Race
[OK]  10  WARDEN_DEFEAT      — The Warden
================================
SYSTEM ONLINE. ALL SUBSYSTEMS NOMINAL.
[FULL AUTONOMY AUTHORIZED]
```

The final line glows. Maya clicks it. The full sandbox, mission replay, and (eventually) Gauntlet mode are unlocked. She feels like she's completed a boot sequence — the AI is fully online. She IS the AI.

**UI Annotations:**
- Boot log: monospace green text on dark terminal background, left-aligned, full screen width
- `[OK]` status: green, steady glow
- `[>>]` status: amber, blinking cursor at 1Hz
- `[ ]` status: dim grey, readable but inactive
- Checkpoint lines: centered, amber rule with text, warmer glow than mission lines
- Diagnostic mode line: italic, lighter weight, distinct visual treatment from missions

---

### Journey: Jake, 14, Minecraft/Roblox Player

**Context:** Jake saw a TikTok of someone's relay chain creating a flanking maneuver. He's never played a strategy game — mostly Minecraft, Roblox, and some Fortnite. He's on his school Chromebook.

**Minute 0:00 — The Wall of Text**
The boot log appears. Jake sees 10 lines of text. His first instinct: skip. But the `[>>]` cursor blinks on Mission 1, and there's only one thing to click. He clicks it.

**Minute 8:00 — Stuck on Mission 2**
Jake completed Mission 1 (basic context) but Mission 2 (rules and hooks) is confusing. He fails twice. He returns to the boot log:

```
[OK]  01  CONTEXT_INIT      — Wake Up
[>>]  02  RULE_ENGINE        — First Contact
```

There's nothing else to do. No side missions. No alternate path. Jake considers closing the tab. But he notices the boot log only shows 2 of 10 missions completed — the progress bar on the left edge is barely filled. The visual "incompleteness" nags at him. He tries Mission 2 again.

**Minute 12:00 — The Breakthrough**
Third attempt at Mission 2. Jake finally sees the hook fire — his scout detects an enemy, the hook triggers, the striker receives the signal and moves to engage. It works. The sealed watch shows the combo happening in real time. Jake shouts "YES!" — the first emergent combo moment. The mission completes. The `[>>]` drops to Mission 3.

**Minute 30:00 — Act I Intermission**
Jake hits the diagnostic mode after completing Mission 4. He's been playing linearly for 30 minutes — focused, no breaks. The sandbox is the first time the game says "no rules, just play." Jake immediately builds a 6-scout army with all hooks broadcasting on the same channel. The sealed watch is chaos — scouts screaming at each other, buffers overflowing, nothing working. Jake is laughing. He's discovered the "information overload" failure mode through play, not instruction.

**Minute 31:00 — "Wait, is THIS what the game is about?"**
In the sandbox, Jake tries to fix his 6-scout army. He starts filtering channels, reducing buffer sizes, adding rules. He's doing what the game wants — debugging an information architecture — and he chose to do it voluntarily. The intermission worked: it converted a tutorial-follower into an experimenter.

**UI Annotations:**
- Mission 2 failure: boot log shows `[>>]` still on Mission 2, no visual punishment, just the cursor waiting
- Diagnostic mode: visually distinct from missions (different background shade, no enemies shown in preview)
- Sandbox sealed watch: same UI as mission sealed watch, but no pass/fail — just "SIMULATION COMPLETE"

---

### Journey: Dr. Sarah Chen, 42, ML Research Lead at a Large Tech Company

**Context:** Sarah leads a team building agentic AI systems. She's been following Robot Uprising since the design doc leaked in a Discord. She doesn't play games — last game was Tetris on a Game Boy. She's evaluating whether the game could be a team training tool.

**Minute 0:00 — Professional Skepticism**
The boot log appears. Sarah immediately maps it to a system initialization she's seen hundreds of times. She notes: "CONTEXT_INIT, RULE_ENGINE — these are the subsystem names we use internally. Whoever designed this knows the domain."

She plays Mission 1 in 3 minutes — context config is trivially obvious to her. The boot log advances. She doesn't need the tutorial. She's annoyed at the linear structure — she wants to skip to Mission 6 (Command agents) because that's where the real agentic architecture lives.

**Minute 5:00 — Forced to Slow Down**
Sarah is on Mission 3 (Relay chains). She tried to rush through but the sealed watch forced her to WATCH her relay chain fail. The buffer overflow is visible — she can see the queue depth in the debrief. "Oh," she says. "This is the context window problem. The relay is dropping the scout's signal because its buffer is full of stale terrain data." She's learning something she knows intellectually but has never SEEN animated on an 8x8 grid.

**Minute 15:00 — The Intermission Insight**
Sarah hits the Act I intermission sandbox. She builds a three-layer relay architecture: scouts feed edge relays, edge relays compress and feed a central relay, central relay routes to strikers. She runs it. It works beautifully for 20 ticks, then collapses when two scouts detect enemies simultaneously and the central relay's buffer can't handle the burst.

Sarah stares at the debrief. "This is the exact failure mode our production agent had last month. The central router couldn't handle concurrent tool calls." She takes a screenshot and posts it in her team's Slack with the caption: "Found our bug, visualized in a game."

**Minute 25:00 — "Can we get a site license?"**
Sarah hasn't finished the campaign. She doesn't need to. She's already seen enough to know this is a training tool. She emails the game developer. But she also... wants to beat Mission 10. She keeps playing.

**UI Annotations:**
- For Sarah, the boot log's subsystem names are the hook. She's reading them as real system components, not game flavor text.
- The sandbox intermission is where Sarah's professional knowledge meets the game's system. This is the "aha" screen for expert players.

---

## Discovered Sub-Aspects

These aspects were uncovered during this analysis and should be added to the frontier:

1. **5.05a — Boot log as campaign UI: the terminal-as-map design pattern** — Full design of the boot log campaign screen: font choice, color states, animation timing, sound design per state transition, how it handles 10+ lines on small screens, scrolling behavior on mobile
2. **5.05b — Intermission sandbox design: structured free play between campaign acts** — What tools are available, what's the default battlefield, are there suggested experiments, does it show community blueprints, how long do players typically spend, what triggers "okay, back to the campaign"
3. **5.05c — Campaign replay and mission select post-completion** — After beating all 10 missions, what does the campaign screen look like? Can you replay individual missions with different configs? Is there a score/rating per mission? Do replayed missions show improvement?
4. **5.05d — Campaign difficulty escape hatches: what happens when a player is stuck** — Hint system, difficulty reduction, skip-with-penalty, practice mode, AI-suggested configs, "watch a solution" option — how to prevent the linear structure from creating hard walls
5. **5.05e — Act structure tuning: optimal grouping of 10 missions into acts** — Is 4-3-3 the right split? Should it be 3-3-4? 2-4-4? How does act length affect pacing and intermission placement?

---

## The TikTok Clip

**Option A (Boot Sequence):** A timelapse of the full boot log filling in from `[>>] 01` to `SYSTEM ONLINE. ALL SUBSYSTEMS NOMINAL.` — 10 seconds of relay clicks and green status lights — with the caption "I just booted up an AI from scratch." The payoff is the final `[FULL AUTONOMY AUTHORIZED]` line appearing with a dramatic chord.

**Option E (Chapter Book):** A split screen: left side shows the player's sandbox intermission experiment (chaotic, failing), right side shows Mission 5 (clean, working). Caption: "The sandbox taught me more than the tutorial."

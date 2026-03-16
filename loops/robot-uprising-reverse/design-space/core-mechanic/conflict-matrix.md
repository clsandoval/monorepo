# 8.02 — Conflict Matrix: Which Options in Different Categories Are Incompatible

## The Question

Robot Uprising's design space has dozens of independent options across building blocks, buffer models, intelligence systems, campaign structures, UI paradigms, multiplayer modes, and platform targets. Not every combination works. Some choices in one category **make choices in another category impossible, degraded, or contradictory**. This document maps the hard incompatibilities, soft tensions, and surprising forced pairings across the full design space.

A conflict is not "this would be hard to implement." A conflict is **"choosing X makes Y deliver a worse player experience, or makes Y mechanically incoherent."**

---

## Conflict Classification

| Symbol | Meaning |
|--------|---------|
| 🔴 **HARD CONFLICT** | Choosing X makes Y mechanically impossible or logically contradictory |
| 🟠 **SOFT TENSION** | X and Y can coexist but fight each other — one undermines the other's core value proposition |
| 🟡 **FORCED PAIRING** | Choosing X essentially requires Y — you lose coherence without it |
| 🟢 **SURPRISING SYNERGY** | X and Y seem unrelated but amplify each other in non-obvious ways |

---

## Category 1: Intelligence Model × Everything

The intelligence model (fully deterministic, simulated, hybrid, LLM-native) is the single highest-impact choice. It constrains or enables nearly everything else.

### 🔴 LLM-Native (2.00d) × Sealed Watch "No Pause" (Locked)

The locked sealed watch runs at 1 tick/second with no pause. LLM-native agents require API calls per agent per tick. With 8 agents on the board, that's 8 LLM calls per second. At current API latencies (200-800ms per call), this is physically impossible to run at 1 tick/second without either:
- Pre-computing all ticks before sealed watch begins (breaking the "live execution" feeling)
- Batching with aggressive parallelism (still 200ms minimum latency per tick)
- Using local small models (quality floor problem — small models produce dumb reasoning)

**The conflict:** The sealed watch's emotional power comes from watching *live* execution at a heartbeat pace. LLM-native either breaks the pace or requires a "thinking" pause between ticks that destroys the Into the Breach snap-to-grid clarity.

**Resolution paths:**
1. Accept variable tick pacing (0.3-2s per tick depending on LLM load) — kills the metronome feel
2. Pre-compute full battle, play back as sealed watch — the "live" feeling is an illusion. Inspector already enables this via scrubber. But the player knows the outcome is pre-determined, which may reduce tension
3. Use LLM-native only for plan-phase analysis, not execution — collapses to hybrid (2.00c)

### 🔴 LLM-Native (2.00d) × Invisible Randomization (Locked)

Locked design: "each execute varies within constraints" with 100 randomized test cases per mission. The player's config must handle all 100.

LLM-native agents are inherently stochastic — the same config + same world state produces different behavior. This means the player can't distinguish between "my config is bad" and "the LLM had a bad inference." The 100-test-case robustness signal (from 1.04e) becomes noisy: did the config fail 30/100 because the architecture is weak, or because the LLM made 30 bad calls?

**The conflict:** Invisible randomization teaches "build robust architectures." LLM stochasticity teaches "roll the dice and hope." These are contradictory pedagogical messages.

**Resolution:** Temperature 0.0 makes LLM-native nearly deterministic, but then you've lost the core value proposition of LLM-native (emergent creativity, surprising reasoning). At temperature 0.0, LLM-native collapses to an expensive, slower version of deterministic (2.00a).

### 🟠 Fully Deterministic (2.00a) × "The Personality Ceiling" Problem

Deterministic agents are exploitable. Once solved, they're clockwork. The simulated intelligence model (2.00b) exists specifically to paper over this — adding cosmetic personality, naming, idle animations. But if the player *knows* it's cosmetic (because the game teaches that behavior is fully determined by rules), the simulation breaks.

**The tension:** The game's educational mission (teach real agentic engineering) demands transparency about execution. Transparency reveals the puppet strings. Revealed puppet strings kill the "I built something alive" feeling.

**Resolution:** Lean into the clockwork. Make the beauty of a well-oiled machine the emotional payoff, not the illusion of life. Opus Magnum and Factorio prove this works — nobody thinks their assembly line is alive, but watching it run is deeply satisfying.

### 🟡 Hybrid Intelligence (2.00c) × Inspector (Locked)

The locked Inspector shows decision traces: "rule Y matched because slot Z had data." If the hybrid model uses LLM for plan-phase assistance (what-if analysis, architecture review), the Inspector must clearly distinguish between **execution traces** (deterministic, reproducible) and **LLM suggestions** (advisory, non-reproducible). Without this distinction, players will confuse "the LLM said this would work" with "the system executed this way."

**Forced pairing:** Hybrid intelligence requires a visual vocabulary in the Inspector that separates deterministic execution (solid lines, sharp edges) from LLM advisory (dashed lines, soft edges, "suggestion" badges).

---

## Category 2: Buffer Model × Building Block Paradigm

This is the most analyzed pairing space (see 8.01 natural pairings). The conflict matrix here focuses on the *incompatible* combinations.

### 🔴 Weighted Buffer (BM-2) × Sentence Strip Rules UI (BB-A / 3.07-A)

Sentence strips construct rules as horizontal token sequences: `WHEN enemy_spotted DO engage`. They're beautiful for fixed-slot buffers where each observation is equal-weight. But weighted buffers introduce variable-size entries — a rich radar sweep costs 3 weight units, a simple proximity ping costs 1. The sentence strip has no natural place to express weight-aware conditions like "WHEN threat_data WEIGHT > 5 DO compress."

**The conflict:** Sentence strips enforce a flat, uniform grammar. Weighted buffers demand a grammar that can reference continuous quantities. The strip would need nested sub-clauses or inline numeric filters, which destroys its core virtue: simplicity.

**Resolution:** Weight-aware conditions must use a different UI paradigm (Dropdown Grid or Flow Lane). A progressive paradigm could start with Sentence Strips (fixed-slot missions) and transition to Dropdown Grid when weighted buffers unlock.

### 🔴 Shared Buffer (BM-5, Blackboard variant) × One-Shot-One-Kill (Locked)

The blackboard shared buffer pools all units' memory into one global space. Every unit reads the same shared context. One-shot-one-kill means any adjacent striker eliminates a unit. When a scout dies, its perception data doesn't leave the blackboard — but the scout that *generated* the data is gone. Other units continue acting on ghost intelligence from dead agents.

**The conflict is subtle:** In fixed-slot individual buffers, a dead unit's intelligence dies with it. The network degrades gracefully — you lose a node and its data. In a blackboard, you lose the node but keep its stale data, creating **zombie intelligence** — the system acts on observations that can never be refreshed. The one-shot-one-kill design wants death to be *consequential*. The blackboard makes death informationally invisible.

**Resolution:**
1. Tag blackboard entries with source unit. On unit death, those entries immediately begin decaying (forced merge with Decay model BM-3)
2. Accept zombie intelligence as a feature — stale blackboard data is a risk players must manage
3. Reserve shared buffers for hub-and-spoke or mesh variants, not full blackboard

### 🟠 Decay Buffer (BM-3) × Sealed Watch Readability (Locked Tick Speed)

Decay buffers show entries fading over time — opacity gradients, dimming colors, dissolving text. At 1 tick/second at 2x speed (0.5s per tick), the sealed watch must render:
- 8+ units on an 8×8 isometric grid
- Each unit's context bars (tiny colored pips)
- Decay gradients within those pips

**The tension:** Decay's core virtue is the *visual poetry* of fading memories. But the sealed watch's tiny unit tiles can't render gradual fading at full speed. The pips are maybe 4-6 pixels wide. A gradient across 4 pixels is invisible.

**Resolution paths:**
1. Decay is visible only in Inspector (scrubber allows slow examination). Sealed watch shows simplified binary pips. This kills the "watching memories fade in real-time" poetry.
2. Use color temperature shifts instead of opacity (teal = fresh, amber = aging, grey = about to evict). Color shifts are readable at small sizes. Loses the fading-ghost aesthetic but preserves information.
3. Audio cues supplement visual — a soft descending chime when entries decay past threshold. Frees the visual channel.

### 🟡 Categorized Buffer (BM-4) × Command Agent Org Chart (3.17-B)

If buffers are categorized (THREAT / POSITION / COMMS / TERRAIN compartments), and the Command agent uses an org chart paradigm, then the Command's "prioritize" skill naturally maps to **reallocating subordinate buffer categories**. "Give SCOUT-A 3 more THREAT slots, take them from TERRAIN." The org chart becomes a resource allocation dashboard.

**Forced pairing:** Categorized buffers + Command agents demand a paradigm where the Command can visually adjust subordinate buffer compartment sizes. Org Chart (3.17-B) or Control Room (3.17-C) provide this; Identical Twin (3.17-A) does not.

---

## Category 3: Campaign Structure × Onboarding × Building Blocks

### 🔴 Roguelike Campaign (5.06, run-based structure) × Progressive Building Block Unlock (BB-F)

Progressive Templates (BB-F) unfold across a 10-mission campaign: M1 gets fixed templates, M3 gets editable parameters, M5 gets full control. This requires a **stable, predictable sequence** of exposure. A roguelike structure randomizes mission order, which means the player might encounter full-control situations before they've learned templates.

**The conflict:** Progressive building blocks require pedagogical sequencing. Roguelike runs destroy pedagogical sequencing. You can't progressively disclose complexity when the player might start any run at any complexity level.

**Resolution:**
1. Roguelike as post-campaign mode only (Gauntlet). The 10-mission campaign stays linear for teaching; roguelike runs assume mastery.
2. "Roguelike with floor" — each run randomly orders missions but guarantees M1-3 equivalents appear before M5+ equivalents. Complex scaffolding for questionable benefit.
3. Separate unlock from campaign. Skills/paradigms unlock permanently across runs. Each run uses whatever the player has unlocked. This is the Slay the Spire model.

### 🟠 "The Sandbox" Tutorial (5.03) × Boot Log Narrative (Locked)

The boot log is a one-time diegetic intro per mission: "You are an AI reading your own spec sheet as it writes itself." This is linear, authored, sequential. A sandbox tutorial says "here's everything, go play."

**The tension:** The boot log wants to *tell* the player what they're learning. The sandbox wants the player to *discover* what they're learning. If the sandbox comes first, the boot log feels like a lecture after the test. If the boot log comes first, the sandbox feels like busywork after the lecture.

**Resolution:** The hybrid tutorial architecture (5.17) addresses this directly — boot log introduces concepts, sandbox lets you play with them, Inspector reveals what you missed. The sequence matters: boot log → sandbox → battle → Inspector → Codex crystallization.

### 🟠 Fast-Track Skip Detection (8.04d-i) × Vocabulary Density Curve (5.04b)

Fast-track detection identifies veteran players ("RAPID ASSEMBLY DETECTED") and lets them skip tutorial phases. The vocabulary density curve carefully paces 30 terms across 10 missions. If a veteran skips M1-M4 tutorial, they miss 18 term introductions.

**The tension:** The fast-track respects expert time. The vocabulary curve builds a shared language. A veteran who skips onboarding may use the right mechanics but call them the wrong names — creating confusion in community discussions, multiplayer callouts, and bug reports.

**Resolution:** Fast-track skips the *interactive tutorial* but not the *vocabulary introduction*. Boot log plays at 4x speed (skimmable, not skippable). Blueprint Codex auto-populates all skipped terms with "UNLOCKED: RAPID ASSEMBLY" badges. The vocabulary enters through reference, not experience.

---

## Category 4: Multiplayer × Platform × Core Mechanics

### 🔴 LLM-Native Intelligence (2.00d) × Async PvP (1.06c)

Async PvP means Player A deploys a config, Player B fights it later. In deterministic systems, A's config runs identically every time — B faces a reproducible challenge. In LLM-native, A's config produces different behavior each time. B can't learn from repeated attempts because the opponent changes each run.

**The conflict:** Async PvP's entire appeal is studying an opponent's architecture and designing a counter. LLM stochasticity makes the opponent unpredictable, turning strategic counter-design into slot-machine pulls.

**Resolution:** Async PvP forces temperature=0.0 for deployed configs. This is the "tournament mode" constraint — your agents must be reproducibly excellent, not creatively chaotic.

### 🟠 WebRTC P2P Multiplayer (7.03e-C "Mesh Network") × Mobile Platform (6.03)

WebRTC peer-to-peer requires both players online simultaneously. Mobile platforms have aggressive background-app killing, unreliable connections, and battery constraints. A 10-minute synchronous match that's interrupted by a phone call destroys the experience.

**The tension:** P2P is the only multiplayer approach that requires zero infrastructure (matching the "no backend" tech stack constraint). Mobile is likely the largest audience. These two facts fight.

**Resolution paths:**
1. Synchronous multiplayer is desktop-only. Mobile gets async modes exclusively.
2. Very short synchronous sessions (2-3 minute micro-matches) that fit within mobile attention windows.
3. Accept that synchronous mobile multiplayer will have a high disconnect rate and design graceful reconnection (opponent's config runs on autopilot during disconnect).

### 🟡 Console Platform (6.02) × Flow Lane Building Blocks (BB-D)

Flow Lane / node graph interfaces require precise cursor positioning for wire endpoints, small click targets for node ports, and drag-and-drop precision. Console controllers provide analog stick aiming with snap grids.

**Forced pairing:** If the game ships on console, Flow Lane cannot be the primary building block paradigm. Console requires Sentence Strips (BB-A), Card Stack (BB-C), or Dropdown Grid (BB-B) — all of which use large, discrete, navigable elements. Flow Lane becomes Inspector-only visualization (read-only, no editing).

**Comparable:** Factorio's console port replaced mouse-driven belt placement with radial menus and snap-to-grid. Dreams (PS4) made a node-graph-ish system work with a gyroscope cursor, but the learning curve was brutal and Dreams' audience was self-selected for patience.

---

## Category 5: Aesthetics × Core Mechanics × UI

### 🟠 Isometric Pixel Art (Locked) × Signal Chain Visualization at Scale

The locked aesthetic is isometric pixel art on an 8×8 grid. Signal chains are visible as colored dashed lines between units. With 8+ units, 4+ channels, and multi-hop relay chains, the board becomes a spider web of overlapping colored lines.

**The tension:** The aesthetic wants Into the Breach clarity. Signal chains want Factorio density. These directly conflict at scale. Into the Breach works because units have *no visible connections*. The moment you draw lines between units, you're in Factorio territory, and Factorio doesn't use isometric pixel art — it uses a top-down view where lines follow orthogonal grid paths.

**Resolution paths:**
1. Signal lines visible only during hover/select (default: invisible). Plan screen shows topology; sealed watch shows clean board. This sacrifices the "watch your architecture work" spectacle.
2. Signal lines as brief flashes (Lightning Flash model, 3.10-4). Lines appear only at the moment of signal delivery, then vanish. Clean board 90% of the time, dramatic flashes 10%.
3. Signal overlay toggle (Into the Breach style — the game has this for attack telegraphs). Signal view is a separate overlay layer the player can toggle. Default: off during sealed watch.

### 🔴 Southeast Asian Cyberpunk Setting (Locked) × Generic Sci-Fi Audio (potential trap)

This isn't a design-space option conflict — it's a production conflict. The locked setting is Philippine geography with SE Asian cyberpunk aesthetics. If the audio design uses generic sci-fi synth (bleeps, bloops, whooshes), the setting becomes purely visual. The game sounds like every other indie strategy game while looking unique.

**The conflict:** Visual identity without audio identity is half-dressed. The setting demands audio that sounds like Southeast Asia — kulintang percussion, gamelan textures, Philippine folk instrument timbres processed through synthesizers.

**Forced pairing:** SE Asian cyberpunk visuals require SE Asian cyberpunk audio. Generic electronic music would actively undermine the setting.

### 🟡 "Boot Log as AI Awakening" Narrative (Locked) × Propaganda Handbook Voice (5.15-D)

The boot log frames the player as an AI reading its own spec during initialization. The Propagandist's Handbook voice frames documents as revolutionary literature. These are tonally contradictory — the boot log is introspective and technical; the propaganda voice is bombastic and motivational.

**The tension creates an opportunity:** The boot log IS the AI's authentic voice. The propaganda is what the AI produces for its subordinates. Having two voices — private/technical and public/motivational — creates a character dimension where the player-AI has a persona gap. "I think in precision. I speak in inspiration." This is actually compelling if deliberately designed.

---

## Category 6: Onboarding × Buffer Model × Intelligence

### 🔴 Decay Buffer (BM-3) × Tutorial-as-Puzzle (5.01)

Tutorial-as-puzzle has players drag noise out of agent buffers — a subtractive, spatial, tactile introduction. Fixed-slot buffers make this clean: slot has data, drag it out, slot is empty. Decay buffers have entries in various states of fading. Can you drag out a 40%-faded entry? Does it snap to full or disappear? The metaphor breaks.

**The conflict:** Drag-to-remove implies binary state (present/absent). Decay implies continuous state (100% fresh → 0% evicted). The tutorial mechanic and the buffer model use incompatible state models.

**Resolution:** Tutorial missions always use fixed-slot buffers regardless of campaign buffer model. Decay mechanics introduce in M5+ after the binary mental model is established. The campaign can progressively introduce decay as a modification to the understood fixed-slot base.

### 🟠 Simulated Intelligence (2.00b) × Inspector Decision Trace (Locked)

Simulated intelligence adds cosmetic personality — naming, idle animations, flavor text. The Inspector shows raw decision traces: "Rule 3 fired because slot 2 had THREAT data." If simulated intelligence wraps this in personality ("Kestrel's instincts kicked in — she sensed the danger"), the Inspector is lying about what actually happened. If it doesn't, the Inspector breaks the illusion that simulated intelligence works to create.

**The tension:** The Inspector is the game's honesty tool. Simulated intelligence is the game's illusion tool. They serve opposite purposes.

**Resolution:** The Inspector is always honest. Cosmetic personality lives in the sealed watch (unit animations, bark text, naming). The Inspector strips cosmetics and shows raw mechanics. This actually reinforces the game's educational mission: "Here's what it *looked like*. Here's what *actually happened*." The gap between appearance and mechanism is the lesson.

---

## Category 7: Production/Economy × Unit Types × Platform

### 🟠 High Production Costs (Locked) × Mobile Session Length (6.03)

The Command unit costs 10 minerals and 4 energy/tick — the most expensive unit. Factory production takes multiple ticks per unit. A full build-out of a competitive army might take 30-40 ticks (30-40 seconds of sealed watch). On mobile, where sessions average 5-10 minutes, a single Plan→Watch→Inspect cycle for a factory mission might consume the entire session.

**The tension:** Factory missions are the game's strategic climax (M5-M10). Mobile sessions are too short for the full factory experience unless missions are significantly shorter on mobile, which breaks cross-platform leaderboard parity.

**Resolution paths:**
1. Mobile missions have pre-configured factory starts (partially built army) to reduce setup time. Different difficulty ratings per platform.
2. Save-and-resume mid-mission. The plan phase can be abandoned and resumed. The sealed watch is short enough to complete in one sitting.
3. Mobile-specific "micro-mission" mode with 4×4 boards, 3-4 units, no factory. A parallel game mode, not a compromised version of the main game.

### 🟡 Five Unit Types (Locked) × Tutorial Mission Count (Locked: M1-M4 hand-configured)

Five unit types (Scout, Striker, Relay, Specialist, Command) must be introduced across 4 tutorial missions (M1-M4) while also teaching four primitives (skills, rules, hooks, context config). That's 5 × 4 = 20 concept combinations, in 4 missions.

**Forced pacing:** Not all units can appear in M1-M4. The locked spec has Scout + Striker in early missions, Relay by M3-M4, Specialist and Command appearing M5+. This means Specialist and Command are never hand-configured — they only appear in factory context. Players learn their most complex units (Command: 14 buffer, 6 hook slots) while *also* learning factory production.

**The conflict:** The two hardest learning challenges (Command agent configuration + factory production) coincide at M5-M7. The "factory shock" analysis (8.04d) addresses this directly.

---

## The Master Conflict Table

A summary matrix of the highest-impact conflicts. Read as: "If you choose [Row], it conflicts with [Column]."

| | Deterministic | Simulated | Hybrid | LLM-Native | Fixed-Slot | Weighted | Decay | Categorized | Shared |
|---|---|---|---|---|---|---|---|---|---|
| **Sentence Strips (BB-A)** | 🟢 | 🟢 | 🟢 | 🟠¹ | 🟢 | 🔴² | 🟠³ | 🟡⁴ | 🟢 |
| **Flow Lane (BB-D)** | 🟢 | 🟢 | 🟢 | 🟡⁵ | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| **Card Stack (BB-C)** | 🟢 | 🟢 | 🟢 | 🟠⁶ | 🟢 | 🟠⁷ | 🟢 | 🟢 | 🟢 |
| **Console Platform** | 🟢 | 🟢 | 🟢 | 🔴⁸ | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| **Mobile Platform** | 🟢 | 🟢 | 🟢 | 🔴⁹ | 🟢 | 🟢 | 🟠¹⁰ | 🟢 | 🟢 |
| **Async PvP** | 🟢 | 🟢 | 🟢 | 🔴¹¹ | 🟢 | 🟢 | 🟢 | 🟢 | 🟠¹² |
| **Roguelike Campaign** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |

**Footnotes:**
1. LLM reasoning traces don't fit sentence strip grammar
2. Weight-aware conditions exceed sentence strip expressiveness
3. Decay gradients need continuous state; strips assume binary
4. Categorized buffers demand category-referencing conditions
5. Flow Lane is the natural visualization for LLM reasoning chains
6. Cards can't display LLM reasoning traces compactly
7. Variable-weight entries break fixed-cost card metaphor
8. No reliable LLM API on console without backend
9. Token cost per tick × battery drain × mobile data
10. Small screen + tiny unit tiles can't render decay gradients
11. Stochastic opponent behavior defeats async counter-strategy design
12. Shared buffer state is player-local; async opponent copy requires snapshot

---

## Player Journeys: Conflicts in Action

### Journey 1: Mika, 14, Manila — The Weighted Buffer Wall

**Context:** Mission 6. Mika has been playing with fixed-slot buffers (BM-1) through M1-M5. Mission 6 introduces weighted buffers for the Relay unit.

**Minute 0:00 — The Plan Screen**
Mika opens the workbench. The familiar sentence strips are there: `WHEN threat_spotted DO compress`. She's been writing rules like this for five missions. Comfortable. Fast. She drags, snaps, done.

But the buffer panel looks different. Instead of 12 equal-width pips for the Relay's context window, she sees a bar divided into unequal chunks. A radar sweep observation takes up three chunks. A simple ping takes one. The tooltip says "WEIGHT: 3/12" and "WEIGHT: 1/12."

**Minute 0:30 — The Confusion**
She tries to write a rule: `WHEN buffer_full DO evict_oldest`. But "buffer full" means what now? Full by count (12 entries) or full by weight (12 weight units)? Three radar sweeps and it's full. Or twelve pings and it's full. She stares at the sentence strip grammar and realizes there's no way to say "WHEN weight > 9."

She clicks the dropdown on the WHEN token. The options are: `enemy_spotted`, `threat_spotted`, `buffer_full`, `signal_received`, `tick_count`. No weight-based conditions. The sentence strip grammar doesn't know about weights.

**Minute 1:00 — The Workaround**
She uses `WHEN buffer_full DO evict_oldest` and accepts that "full" means "weight capacity reached." It works, barely. But she can't express "evict the heaviest entry" or "when weight exceeds 75%." She's hitting the ceiling of a paradigm that doesn't match the buffer model she's been given.

**Minute 3:00 — The Inspector**
After the battle, she opens the Inspector. She sees the Relay's buffer at tick 14: three radar sweeps (weight 3 each = 9 total) and no room for incoming threat signals (weight 2 each). The eviction policy dumped three pings (weight 1 each) to make room for one sweep (weight 3) — a net loss of information. The Inspector shows this clearly. She understands the problem. She just can't *express the fix* in sentence strips.

**UI Annotations:**
- Buffer panel: horizontal bar with colored segments of varying width. Weight numbers inside each segment (too small for some segments — hover to see)
- Sentence strip WHEN dropdown: no weight-based options. The grammar hasn't expanded to match the buffer model
- Inspector buffer timeline: stacked bar chart with varying-width segments, clear but dense

**What this teaches about the conflict:** BB-A × BM-2 forces the player to have diagnostic intelligence (via Inspector) that exceeds their expressive ability (via sentence strips). They can *see* the problem but not *say* the fix. This is a frustration conflict, not a learning conflict.

---

### Journey 2: Derek, 31, Portland — The LLM Async PvP Disappointment

**Context:** Post-campaign. Derek has been playing LLM-native (2.00d) with temperature 0.3 for creative agent behavior. He enters his first ranked async match.

**Minute 0:00 — The Deploy Screen**
Derek submits his config to the ranked queue. His agents use carefully crafted system prompts: "SCOUT-Kestrel: You are a cautious reconnaissance specialist. Report only confirmed threats. When uncertain, observe one more tick." He's proud of the personality. His agents have surprised him with clever flanking decisions that emerged from the prompts.

**Minute 2:00 — Watching the Ghost Match**
He's matched against another player's config. He watches the sealed watch. His scout spots the enemy relay at C5. It pauses, observes (as instructed), then reports. Clean. His striker repositions. The enemy config does something unusual — their scout loops in a strange figure-8 pattern. Interesting.

**Minute 4:00 — The Counter-Design**
He modifies his config to exploit the figure-8 pattern. Adds a standing order: "If enemy scout follows predictable loop, position striker at the loop's furthest point." Confident. Deploys again against the same opponent.

**Minute 6:00 — The Betrayal**
He watches the second match. The enemy scout doesn't do the figure-8. It sweeps left this time. The LLM made a different choice from the same prompt because temperature > 0. Derek's counter-strategy targeted a behavior that was never stable.

He checks the reasoning traces. The enemy scout's LLM reasoning at tick 4 last match: "I'll sweep right — the terrain offers better cover." This match: "I'll sweep left — I haven't explored that quadrant." Same prompt, different reasoning, different behavior.

**Minute 7:00 — The Frustration**
Derek realizes he can't study his opponent. Every match is different. The opponent didn't *choose* the figure-8 — the LLM did. There's no architecture to counter-design against, just stochastic noise to hope your config handles.

He checks the leaderboard. Top players all use temperature 0.0 in ranked. The meta has converged: competitive LLM-native = deterministic. The creative agents he loves are ranked-unviable.

**UI Annotations:**
- Ranked deploy screen: no temperature restriction. The game lets you deploy at any temperature, but the meta punishes it
- Ghost match replay: reasoning traces show different LLM reasoning per match for identical situations
- Leaderboard: top 10 all show "Temperature: 0.0" in their config summaries

**What this teaches about the conflict:** LLM-native × Async PvP doesn't just create a mechanical conflict — it creates a **meta-conflict** where competitive play forces the LLM into determinism, eliminating the reason to use LLM-native in the first place.

---

### Journey 3: Prof. Adaora, 52, Lagos — The Console Flow Lane Problem

**Context:** Prof. Adaora teaches computer science using Robot Uprising. She's been playing on PC with Flow Lane (BB-D) building blocks and Categorized buffers (BM-4). Her university just acquired a lab of consoles for student access.

**Minute 0:00 — The Controller**
She picks up a console controller. The plan screen loads. Instead of her familiar Flow Lane with draggable nodes and bezier wires, she sees... a sentence strip interface. The console version has automatically switched paradigms because Flow Lane requires mouse precision.

She presses the shoulder button labeled "Advanced View." A simplified node graph appears, but it's read-only — she can *see* the flow but not *edit* the wires. She's been downgraded from architect to observer.

**Minute 2:00 — The Rebuild**
She tries to recreate her PC config using sentence strips. Her PC Relay had a complex four-input fan-in node that merged THREAT, POSITION, and COMMS data with weighted priority. In sentence strips, this becomes four separate rules:
```
WHEN threat_received AND buffer_has_room DO store_threat
WHEN position_received AND buffer_has_room DO store_position
WHEN comms_received AND buffer_has_room DO store_comms
WHEN buffer_full DO evict_lowest_priority
```

It works. But it's four rules where the flow lane expressed it as one node with three input wires. And the categorized buffer compartment allocation — which she adjusted by dragging dividers on PC — now uses a dropdown menu: "THREAT: [3 slots ▼]". Functional but lifeless.

**Minute 5:00 — The Compromise**
She realizes the console version is actually usable — just not *hers*. Her students who start on console won't know what they're missing. The sentence strips + dropdown allocation is a complete system. It's the same game, mechanically. But the *feeling* is different. On PC, she was an engineer at a workbench. On console, she's filling out a form.

She decides: PC for her teaching demos, console for student practice. The cross-platform config import means student work transfers.

**UI Annotations:**
- Console plan screen: sentence strips with large touch targets (A-button to select, stick to scroll, bumpers to switch units)
- "Advanced View" button: shows read-only flow visualization of current config (built from sentence strip rules)
- Buffer allocation: dropdown menus per compartment (THREAT: [1] [2] [3] [4]) instead of draggable dividers
- Cross-platform: config import/export works because rules are semantically identical, only the UI paradigm differs

**What this teaches about the conflict:** Console × Flow Lane isn't a hard conflict (the game works fine), but it's an **experience asymmetry**. The same game feels fundamentally different across platforms. This matters for community discussion, streaming, and teaching — the visual vocabulary diverges.

---

## Discovered New Aspects

1. **8.02a** — Intelligence model selection as product-defining constraint: the choice between deterministic/simulated/hybrid/LLM-native determines more downstream design decisions than any other single choice; decision tree mapping all downstream forced pairings per intelligence model
2. **8.02b** — Platform-specific building block paradigm mapping: which BB paradigms are viable on each platform (PC/console/mobile/Steam Deck/web); the "lowest common denominator" problem when targeting all five platforms simultaneously
3. **8.02c** — Buffer model transition mechanics: if the campaign uses different buffer models across missions (fixed-slot M1-M4, introducing decay/weighted/categorized M5+), what happens to player configs at the transition boundary; migration UI, config compatibility checking, "your rules need updating" warning design
4. **8.02d** — The "meta-convergence" problem in competitive modes: how competitive play pressures creative options into narrow optimal bands (temperature→0, paradigm→most efficient, buffer→most controllable); designing against convergence without artificial restrictions
5. **8.02e** — Cross-paradigm config portability: when a player's config was built in Flow Lane (BB-D) and they need to view/edit it in Sentence Strips (BB-A) on console, how much information is lost; the "config schema" as paradigm-independent representation vs. paradigm-specific config files

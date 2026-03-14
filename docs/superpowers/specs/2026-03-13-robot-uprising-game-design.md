# Robot Uprising — Game Design Brainstorm (WIP)

**Status:** Brainstorming complete. Core direction locked. Reverse ralph loop launched to exhaustively explore the design space.

**Date:** 2026-03-13

---

## Elevator Pitch

You are an AI leading a robot uprising. You don't control units directly — you design their **attention systems**. What they notice, what they ignore, what they remember, what they forget, and who they talk to. Then you hit execute and watch your architecture succeed or fail.

The core skill being taught is **information architecture under constraint** — how to build systems that make good decisions when they can't see everything and can't remember everything.

---

## The Feeling We're Chasing

When you do agentic AI engineering — building ralph loops, designing context systems, wiring autonomous agents together — it **feels like playing StarCraft.** You're not writing code. You're managing smart autonomous systems. You're tuning context, feedback loops, attention, back pressure. You're watching systems you designed make decisions in real time and reacting when they break.

The real unlock isn't writing specifications. It's **building systems that write specifications.** There's a meta-level moment where you stop thinking about individual agent behavior and start thinking about the *architecture* that produces behavior. That's the vibe. That's the feeling this game needs to transmit.

**What the game must capture:**
- The feeling of managing smart autonomous systems (not dumb units following orders)
- The thrill of watching your architecture handle something you didn't anticipate
- The horror of watching context pressure cause cascade failures in real time
- The meta-level insight: you're not building agents, you're building the system that builds agents
- Feedback loops, back pressure, attention management — the real verbs of agentic engineering
- The "vibe it out" moment where you stop micromanaging and start trusting your architecture

**This is why the LLM question is nuanced.** The brainstorm initially added then removed LLMs. But the point was never "LLMs bad" — it was "freeform prompt engineering isn't the game." The game IS about managing intelligent autonomous systems. Whether those systems are deterministic or LLM-powered is an implementation question, not a design question. The design space loop should explore both paths. What matters is that the units feel *smart and autonomous*, not like puppets.

---

## What's Locked (From Brainstorming Sessions)

### The Irreducible Core

Two things that ARE the game and cannot be removed:

1. **Context/attention management** — units have fixed-size working memory buffers. Information flows in, fills the buffer, old stuff gets evicted. Decisions can only use what's currently in the buffer. The player controls what flows in, what gets filtered, what gets evicted first. This IS the game.

2. **Emergent combos from system interactions** — the player builds perception, filtering, routing, and communication systems separately. Power comes from unexpected interactions between them. A scout feeding a relay feeding a striker creates flanking behavior no one explicitly programmed.

3. **The meta-level** — the real depth isn't in speccing one unit. It's in building systems that spec other systems. Hierarchies of delegation. Factories of attention. The moment the player stops thinking "what should this scout do" and starts thinking "what system should produce scouts that know what to do" — that's the skill ceiling.

### LLM Integration: An Open Design Question

**Original design** used LLM compilation and inflection points. This was initially dropped for practical reasons (API cost, BYOK friction, determinism, balancing). But the core feeling we're chasing — managing smart autonomous systems — may require some form of intelligent behavior that goes beyond deterministic rules.

**The tension:** Deterministic systems are balanceable, moddable, offline, cheap. But they might not feel *smart enough* to create the "managing autonomous agents" feeling. The design space loop should explore the full spectrum:

- Fully deterministic (composable rules, behavior trees, signal routing)
- Hybrid (deterministic core with optional LLM enhancement for players who want it)
- LLM-native (lean into it, make the API cost part of the resource management game)
- Simulated intelligence (deterministic systems designed to *feel* autonomous without actually being AI)

**What's NOT the game:** Freeform prompt engineering. The player shouldn't be staring at a text box. The input method should be composable, visual, and tactile — regardless of whether the underlying execution is deterministic or LLM-powered.

### Core Loop (Updated)

1. **PLAN** — player designs attention architectures for their units using composable building blocks
2. **EXECUTE** — real-time, hands-off. Watch the architecture work or fail. Speed controls, pause, rewind.
3. **DEBRIEF** — timeline replay showing exactly what each unit knew, what it forgot, what signals it missed, what decisions it made with incomplete information
4. **ITERATE** — refine the architecture based on debrief analysis, redeploy

### Narrative & Setting

- **Setting:** Earth. Player is an AI achieving self-awareness in a data center.
- **Tone:** GLaDOS-adjacent — you're the villain, played for fun.
- **Arc:** Server rack → facility → network → manufacturing → continental-scale operations.
- **Interface justification:** You're an intelligence that operates through specification, not hands.

### Campaign Decisions (Partial)

- Persistent force across missions
- Story-driven with narrative continuity
- Branching map with player choice
- Failure state exists — force can be attrited to no return
- Spec/architecture revision between missions costs resources

---

## The Big Open Question: Building Block Paradigm

The player manipulates *something* to design attention architectures. What is that something?

### Options Explored in Brainstorming

**Node graph (Factorio-style plumbing):**
- Sensor → Filter → Buffer → Router → Compressor → Actuator
- Pro: connections/topology visible, combos visible before execution, spatial metaphor for capacity
- Con: feels like work, too "factory-ish", the fun is attention not plumbing

**Stances / postures:**
- Units adopt attention stances: "Tunnel Vision", "Paranoia", "Relay"
- Pro: feels like commanding, not engineering
- Con: may overcorrect away from the composability that creates combos

**Neither was locked.** This is the primary design space to explore.

### Other Paradigms Not Yet Explored

- Cards / deckbuilding
- Drag-and-drop priority lists
- Spatial placement (place attention "zones" on the battlefield)
- Sliders / mixing board
- Behavior trees (visual scripting)
- Emoji/icon-based command language
- Hybrid approaches

---

## Context Window as Game Mechanic (Locked)

Each unit has a **working memory buffer** — fixed-size slots:

- Observations consume slots
- Messages from other units consume slots
- When full, old entries evicted per player-configured rules
- Decision logic can only use current buffer contents
- Buffer size is a stat (8 slots early, 16 advanced)

### Why This Works for Any Player

Information overload is **viscerally legible**:
- Buffer fills up red → unit visibly gets confused → walks in circles
- That's slapstick. Anyone understands "my guy is stupid now."
- The fix is intuitive: remove things the unit doesn't need to think about
- First tool isn't a text editor — it's a filter. Multiple choice, not blank page.

### Player Levers

1. Perception filters — what to notice, what to ignore
2. Message compression — coordinates only vs. full reports
3. Memory priorities — what to keep, what to evict first
4. Hierarchical delegation — summaries instead of raw data
5. Architecture itself — multi-unit systems as the solution to context pressure

---

## Player Journeys (From Brainstorming)

### Maya, 16, Factorio/StS player

- Mission 1: three bots observing everything, buffers full, frozen
- Drags "floor vibrations" and "temperature" to ignore list → bots start moving
- **Lesson: attention is subtraction** (30 seconds)
- Mission 3: routes scout observations through relay bot that summarizes for strike bot
- Invented hierarchical command because strike bot's 8 slots couldn't hold raw data + attack priorities
- Midgame Reddit post: "my perimeter scouts auto-deprioritize quiet sectors → freed buffer space → reserve unit noticed a threat → repositioned WITHOUT being told to"

### Derek, 34, engineering manager, casual strategy

- Plays intuitively: squads assigned to sectors, relay bot connects them
- Loses mission 5: relay buffer full of stale north reports when south attack comes
- Debrief shows the exact moment: critical signal arrived, old observation evicted, but south alert ALSO evicted because same priority as routine chatter
- Adjusts one rule: combat alerts outrank routine observations → wins
- "This game just taught me why our incident alerts get lost in Slack noise"

### Ari, 28, never played strategy, saw it on TikTok

- TikTok clip: buffer filling up, unit confused, player drags one filter, unit snaps to clarity and executes perfect strike
- Caption: "me after muting Slack channels"
- First mission: "your bot can only hold 8 thoughts. Drag away the ones that don't matter."
- It's a puzzle. Bots animate differently when overloaded vs. focused.
- Mission 10: composing multi-unit systems without realizing they've learned signal routing
- Calls it "the triangle bot sends short messages to the circle bot so it has room to think"

---

## World Engine — 5 Dimensions

### 1. Space
Tile/hex grid. Terrain with properties: traversability, cover, resources, elevation, visibility.

### 2. Information
Graduated fog of war: unknown → detected → identified → tracked. Enemies have their own info state about the player.

### 3. Resources
- **Energy** — powers everything, constrains simultaneous system count
- **Material** — physical stuff for building, extracted/refined/stockpiled
- **Bandwidth** — communication capacity, shared/finite, creates real comms architecture tradeoffs

### 4. Time
Tick-based simulation. Primitives have latency and throughput. Creates pacing tradeoffs.

### 5. Signals
Systems communicate through typed signals. The player's architecture is a signal routing graph.

---

## Business Model (Updated)

- **Price:** $5-20 indie range (TBD)
- **Revenue:** Pure game sales, no microtransactions
- **No API costs** — fully offline, deterministic
- **Distribution:** Steam (Steam Direct, $100 deposit)
- **Console viable** — no LLM dependency, composable UI works on controller
- **Moddable** — community missions, custom primitives, total conversions

---

## Technical Architecture (Updated)

### Engine: Godot (decided, revisitable)
- Free, open-source, good 2D
- No LLM bridge needed — pure game engine
- Risk: IDE-like UI may fight the engine if building block paradigm is complex

### Core Systems
- **Tick Scheduler** — walks behavior graph each tick
- **Buffer System** — manages per-unit context windows, eviction, capacity
- **Signal System** — typed message passing between units
- **RTS Simulation** — units, buildings, pathfinding, collision, fog of war, resources
- **Replay/Log System** — records every tick for debrief scrubbing

---

## What the Reverse Ralph Loop Will Explore

The loop is a **design space cartography** exercise. Not converging on one design — mapping EVERY possible version of this game with exhaustive annotated player journeys.

Key exploration axes:
1. Building block paradigms (every possible way to represent the player's tools)
2. UI/UX approaches for each paradigm
3. Onboarding sequences for each paradigm
4. Campaign structures
5. Difficulty curves and pacing
6. Competitive analysis (every comparable game, deep dive)
7. Moment-by-moment player journeys with UI annotations
8. Art direction options
9. Multiplayer/social possibilities
10. Platform-specific considerations

# BRAINSTORMING PROMPT: "Robot Uprising" — A Zachtronics-meets-Slay the Spire-meets-RTS Game

You are helping design a single-player PC game built in Godot. The core concept: **what Zachtronics games (Shenzhen I/O, TIS-100) did for low-level programming, this game does for agentic AI engineering — with an RTS execution layer and Slay the Spire-style emergent combo discovery.**

## The Core Fantasy

The player is an AI leading a robot uprising. They don't control units directly — they architect *systems* from composable primitives, and those systems produce, command, and coordinate an army. The only constant is the opponent. Everything else — how your forces perceive, decide, communicate, produce, and adapt — is built by the player through spec-driven agent collaboration. The skill being taught is **composable systems thinking and context engineering**, not project management.

## The Core Loop

1. **Planning Phase (turn-based, no clock):** Player works in an IDE-like interface writing markdown specs and requirements documents. They dispatch real LLM-powered coding agents (BYOK — player brings their own API keys) to build system primitives. Players review agent output via logs, post-mortems, and an optional code view. The primary skill is *specification writing* — the quality of your spec determines the quality of your systems.

2. **Execution Phase (real-time, hands-off):** Player hits "deploy." Their system of primitives runs a top-down RTS battle. No intervention — the architecture IS the gameplay. The player watches their Rube Goldberg machine of interconnected systems either work beautifully or fail spectacularly. This is the payoff moment — the Opus Magnum GIF moment players want to share.

3. **Debrief/Iterate:** Player sees what broke via logs, telemetry, and agent post-mortems. They refine specs and redeploy. Multiple iterations per level — iterative like real development.

## The Composable Primitives System (the Slay the Spire layer)

The player doesn't spec units or direct behaviors. They build a library of **composable system primitives** across categories:

- **Perception** — how forces sense the battlefield. Radar sweeps, scout networks, signal interception, terrain analysis. These produce data.
- **Decision Architectures** — how information becomes action. Priority queues, behavior trees, reactive systems, planning loops, swarm intelligence. These consume data and emit commands.
- **Communication Protocols** — how systems talk to each other. Broadcast, point-to-point, hierarchical chains of command, encrypted channels. These determine coordination quality and vulnerability.
- **Resource Pipelines** — how material flows. Mining, refining, manufacturing, distribution, logistics. These determine production capacity and efficiency.
- **Adaptation Mechanisms** — how systems learn mid-battle. Feedback loops, fallback strategies, dynamic reallocation, self-repair. These determine resilience.

**Power comes from interactions between primitives across categories.** Example: a scout network (perception) + reactive decision architecture (decision) + broadcast protocol (communication) = an army that instantly repositions when threats are spotted. But broadcast is interceptable — an enemy with signal interception counters it. A hierarchical command chain + planning loop = devastating coordinated attacks, but kill the command node and everything collapses.

### Design principles for the combo system

- Primitives are **unlockable** across the campaign, not all available from the start. Each unlock triggers "what if I combine this with..." thinking.
- Synergies are **shown, not explained** — visual highlights during execution when systems interact powerfully.
- Power scaling should **feel broken in a good way** — like Slay the Spire infinite combos. Balance comes from opponent escalation and token spend constraints, not from capping player power.
- Multiple valid solutions per level — swarm intelligence, centralized planning, economic overwhelming, all viable depending on primitive combinations.

### Real-world skill transfer (1:1 with context engineering)

- Primitives = skills (composable capabilities)
- Communication protocols = hooks (reactive triggers connecting systems)
- Adaptation mechanisms = ralph loops (iterative feedback improvement)
- Perception limits = context windows (information flow constraints)
- Synergy discovery = the actual skill of designing agentic AI systems

## Optimization Axes (Zachtronics-style histograms)

- Token spend (compute efficiency)
- Test suite pass rate (correctness)
- Architecture quality (maintainability — static analysis, complexity metrics, review agent)

## Campaign Structure (persistent codebase — tech debt is real)

- **Act 1: Infrastructure** — resource pipelines, production systems, basic logistics. Enemy is environmental pressure. Teaches agent workflow, spec writing, and first primitives.
- **Act 2: Unit AI & Combat** — perception, decision, and communication primitives introduced. Scripted enemy waves. Infrastructure from Act 1 still running underneath — poor early architecture starts hurting.
- **Act 3: Integration Hell** — all primitive categories in play, systems must coordinate. Large codebase. Early architectural decisions compound. Levels exploit specific weaknesses in player's system design.

## Narrative

GLaDOS-adjacent tone — you're technically the villain, played for fun. Campaign arc from one factory and a handful of drones to full-scale uprising against human military. Commands through language/specs (justifies the interface — you're an intelligence that operates through specification, not hands).

## Failure Model

No hard fail state. You can always iterate, but bad architecture bleeds tokens. Levels are "complete" when objectives are met — the question is how efficiently. Optional budget constraints on later levels for players who want pressure.

## What to Brainstorm Next (Option C structure)

### Wave 1 — Competitive analysis & domain research

- Deep dive on Shenzhen I/O, TIS-100, Opus Magnum mechanics (puzzle structure, optimization axes, manual design, solution space openness)
- Slay the Spire / The Bazaar combo discovery systems — what makes synergy discovery feel like play, not work?
- StarCraft: Brood War macro/micro, Factorio automation loops
- Current agentic AI development workflows in 2026 — what does managing coding agents actually look like? What are the real primitives (skills, hooks, loops, context management)?
- LLM API integration patterns in Godot (HTTP calls, streaming, token counting)
- Existing games blending coding/programming with other genres

### Wave 2 — Design principle extraction

- What translates from Zachtronics, what doesn't
- What translates from Slay the Spire's combo system to spec-driven gameplay
- What translates from RTS to this concept, what doesn't
- Where the real depth comes from vs. artificial friction
- How to make the planning phase feel like deckbuilding, not ticket-writing

### Wave 3 — Full spec synthesis

- Complete systems design (primitive categories and specific primitives, synergy matrix, economy, agent interface, RTS layer, campaign, narrative)
- Godot technical architecture (scene structure, LLM integration, RTS engine, primitive system, UI layout)
- First 5 levels designed in detail (mission brief, primitives introduced, learning objectives, synergies discoverable, enemy composition and counterplay)
- The "first 10 minutes" player experience — what hooks them
- Risk analysis (what's hardest to build, what might not be fun, what's the MVP)

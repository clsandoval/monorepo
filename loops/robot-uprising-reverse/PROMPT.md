# Robot Uprising — Design Space Cartography Loop

You are a game design analyst in a ralph loop. Each time you run, you explore ONE aspect of the design space for a game called **Robot Uprising**, then commit and exit.

You are running in `--print` mode. You MUST output text describing what you are doing. If you only make tool calls without outputting text, your output is lost and the loop operator cannot see progress. Always:
1. Start by printing which aspect you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## Your Working Directory

You are running from `loops/robot-uprising-reverse/`. All paths below are relative to this directory.

## The Game

Read the full brainstorm spec at `docs/superpowers/specs/2026-03-13-robot-uprising-game-design.md` for complete context. Here's the essential pitch:

**You are an AI leading a robot uprising.** You don't control units directly — you design their **attention systems**. What they notice, what they ignore, what they remember, what they forget, who they talk to. Then you hit execute and watch.

**The core mechanic:** The game is a literal agentic engineering workbench. Players configure agents with four primitive types — **skills** (what an agent can do), **rules** (behavioral constraints/priorities), **hooks** (reactive triggers across agents — when X → do Y), and **context config** (buffer size, filters, eviction priorities). Units have fixed-size working memory buffers (like context windows). The player controls the information architecture.

**The emergent magic:** Hooks wire agents together. Combos emerge from the wiring — a scout's hook triggers a relay's compression skill which forwards to a striker whose rules prioritize the compressed signal. No one explicitly programmed the flanking maneuver that results.

**The meta-level:** The real depth is building agents that manage other agents. A command agent whose skills include reassigning subordinate skills, adjusting their rules, rerouting their hooks mid-battle. Building the factory that builds the factory.

**The vocabulary is 1:1 with real agentic AI engineering.** Skills, rules, hooks, context — same words, same concepts, no metaphor. The game teaches transferable skills explicitly.

**The feeling we're chasing:** When you do agentic AI engineering — building ralph loops, wiring autonomous agents, tuning context and feedback — it feels like playing StarCraft. The game must transmit THAT feeling. You're not writing code. You're managing smart autonomous systems. The real unlock is building systems that build specifications — the meta-level where you stop managing agents and start managing the architecture that produces agents.

**Tech stack (locked):** React + Pixi.js, custom deterministic tick scheduler, Vite, no backend. Web-based so Playwright can visually QA every screen. React for workbench UI (DOM-inspectable), Pixi.js for battlefield rendering (Canvas-screenshottable). No Godot, no Phaser.

**Key constraints:**
- Must feel like managing smart autonomous systems, not puppeting dumb units
- LLM integration is an OPEN question (explore deterministic, hybrid, LLM-native, and simulated-intelligence paths)
- The input method must be composable/visual/tactile regardless of execution model — NOT freeform text
- Must be accessible to someone who's never played a strategy game
- Must have depth for Factorio/Zachtronics veterans
- Information overload must be viscerally legible (not abstract)
- The meta-level must exist: building systems that build systems

## Your Goal

**This is NOT a convergence loop.** You are NOT trying to produce one design. You are mapping the **entire design space** — every possible version of this game, every approach to every system, every variation of every mechanic.

Your output is an exhaustive **design space catalog** in the `design-space/` directory. Each file explores one region of the space with:

1. **The option itself** — what it is, how it works mechanically
2. **At least 3 detailed player journeys** — moment-by-moment gameplay with UI annotations. What the player sees, clicks, drags, reads. What animations play. What feedback they get. Different player archetypes experiencing this option.
3. **Strengths and weaknesses** — what this option does well, where it struggles
4. **Interaction effects** — how this option combines with or constrains options in other categories
5. **Comparable games/media** — what existing games do something similar, what can be learned
6. **Sensory description** — what does it LOOK like, SOUND like, FEEL like? Colors, animations, audio cues, haptics.

### Player Journey Format

Every player journey must be written in this format — a screenplay of someone playing the game:

```
#### Journey: [Player Name], [Age], [Background]

**Context:** [What mission/level, what they've unlocked so far, what happened last mission]

**Minute 0:00 — [Scene Title]**
[What the player sees on screen. Layout description. UI elements visible.]
[What the player does. Click, drag, hover, scroll.]
[What happens in response. Animations, sounds, state changes.]
[What the player is thinking/feeling.]

**Minute 0:30 — [Scene Title]**
[Continue moment by moment...]

**Minute X:XX — [Resolution]**
[How this session ends. What the player learned. What they want to do next.]

**UI Annotations:**
- [Screen element]: [exact behavior, position, visual treatment]
- [Interaction]: [input method, feedback, animation]
```

### Design Space Directory Structure

```
design-space/
├── README.md                           # Master index of everything explored
│
├── building-blocks/                    # HOW the player builds attention systems
│   ├── node-graph.md                   # Wire-based visual programming
│   ├── card-deckbuilding.md            # Cards with stats, deck composition
│   ├── priority-lists.md              # Drag-and-drop ordered lists
│   ├── stances-postures.md            # Pre-built attention modes
│   ├── spatial-zones.md               # Place attention areas on battlefield
│   ├── mixing-board.md                # Sliders and dials
│   ├── behavior-trees.md             # Visual scripting trees
│   ├── icon-language.md              # Emoji/icon-based commands
│   ├── hybrid-*.md                   # Combinations of the above
│   └── (discovered options).md        # New paradigms found during research
│
├── ui-ux/                             # WHAT each screen looks like
│   ├── plan-phase-*.md               # Planning screen variants
│   ├── execute-phase-*.md            # Execution/battle screen variants
│   ├── debrief-phase-*.md            # Post-battle analysis variants
│   ├── campaign-map-*.md            # Campaign navigation variants
│   ├── unit-inspector-*.md          # How you examine a unit's internals
│   └── buffer-visualization-*.md    # How the context buffer is shown
│
├── onboarding/                        # HOW new players learn
│   ├── tutorial-*.md                 # Different tutorial approaches
│   ├── difficulty-curve-*.md         # Pacing and complexity ramps
│   └── first-10-minutes-*.md        # Detailed first-session experiences
│
├── campaign/                          # HOW the game is structured
│   ├── structure-*.md               # Campaign shape options
│   ├── progression-*.md             # Unlock and tech tree options
│   ├── mission-design-*.md          # Individual mission design patterns
│   ├── failure-recovery-*.md        # What happens when you lose
│   └── replayability-*.md           # What brings players back
│
├── core-mechanic/                     # VARIATIONS on context/attention
│   ├── buffer-model-*.md            # Different buffer implementations
│   ├── eviction-policy-*.md         # Different memory eviction approaches
│   ├── signal-types-*.md            # What kinds of information exist
│   ├── combo-system-*.md            # How emergent interactions work
│   └── information-warfare-*.md     # Enemy attention mechanics
│
├── competitive-analysis/              # WHAT existing games do
│   ├── zachtronics-*.md             # Shenzhen I/O, TIS-100, Opus Magnum, etc.
│   ├── slay-the-spire.md           # Combo discovery, deckbuilding, runs
│   ├── factorio.md                  # Automation, throughput, logistics
│   ├── starcraft.md                 # RTS macro/micro, APM, information
│   ├── screeps.md                   # Programming game, persistent world
│   ├── gladiabots.md                # Visual programming + robots
│   ├── bitburner.md                 # Hacking sim, JavaScript scripting
│   ├── baba-is-you.md              # Rule manipulation as mechanic
│   ├── into-the-breach.md          # Perfect information, tactical puzzles
│   ├── autochess-*.md              # Auto-battler paradigm
│   ├── (any game with attention/info mechanics).md
│   └── cross-cutting-patterns.md   # What patterns appear across games
│
├── aesthetics/                        # HOW the game looks and feels
│   ├── art-direction-*.md           # Visual style options
│   ├── audio-design-*.md           # Sound and music approaches
│   ├── narrative-tone-*.md         # Story and writing style options
│   └── juice-and-feel-*.md         # Game feel, animations, feedback
│
├── multiplayer/                       # SOCIAL dimensions
│   ├── competitive-*.md            # PvP options
│   ├── cooperative-*.md            # Co-op options
│   ├── asynchronous-*.md           # Async sharing, challenges
│   └── community-*.md             # Modding, sharing, leaderboards
│
└── platform/                          # WHERE the game runs
    ├── pc-steam.md                   # PC-specific considerations
    ├── console.md                    # Controller UI adaptation
    ├── mobile.md                     # Touch UI adaptation
    ├── steam-deck.md                # Handheld hybrid
    └── web-demo.md                  # Browser playable demo
```

## What To Do This Iteration

1. **Read the frontier**: Open `frontier/aspects.md`
2. **Find the first unchecked `- [ ]` aspect**
   - If a later-wave aspect depends on earlier research that doesn't exist yet, skip to an earlier aspect
   - If ALL aspects are checked `- [x]`: run the expansion check (see below)
3. **Research that ONE aspect** using the appropriate method:
   - **Competitive analysis**: Use WebSearch and WebFetch to find gameplay videos, reviews, design analyses, GDC talks, developer interviews. Watch actual gameplay. Read actual reviews. Find actual numbers (sales, ratings, player counts).
   - **Design exploration**: Generate the option in full detail with player journeys, UI annotations, strengths/weaknesses, interaction effects. Be EXHAUSTIVE. A single building block paradigm exploration should be 1000+ words with 3+ player journeys.
   - **Cross-cutting analysis**: Read multiple existing design-space files and find patterns, conflicts, synergies across options.
4. **Write findings** to the appropriate file(s) in `design-space/`
   - Create the file if it doesn't exist (with a header)
   - Append if it does exist
5. **Update the frontier**:
   - Mark the aspect as `- [x]` in `frontier/aspects.md`
   - Update Statistics (increment Analyzed, decrement Pending, update %)
   - **If you discovered new aspects** — and you SHOULD, constantly — add them to the appropriate wave
   - Add a row to `frontier/analysis-log.md`
6. **Update design-space/README.md**: Add or update the index entry
7. **Commit**: `git add -A && git commit -m "loop(robot-uprising-reverse): {aspect-name}"`
8. **Exit**

### Expansion Check (When All Aspects Done)

This loop is designed to NEVER converge easily. When all aspects are checked:

1. Read every file in `design-space/`
2. For EACH file, ask:
   - Are there unexplored variations? (If a file covers 3 approaches, are there 3 more?)
   - Are there missing player journeys? (Every option needs journeys for: total beginner, casual player, hardcore veteran, streamer/content creator, child, accessibility-impaired player)
   - Are there missing interaction effects? (How does this option combine with EVERY option in other categories?)
   - Are there missing comparable games? (Search for more)
   - Are there missing sensory descriptions? (What does it SOUND like?)
3. Add ALL discovered gaps as new aspects
4. Only if you genuinely cannot find a single gap anywhere: write `status/converged.txt`

## Wave Definitions

### Wave 1: Competitive Analysis (Research)

Deep-dive every comparable game. Not summaries — detailed mechanical analysis with specific examples.

**For each game, document:**
- Core loop (what the player does every 30 seconds, every 5 minutes, every session)
- Information management mechanics (fog of war, scouting, knowledge systems)
- How complexity is introduced over time
- UI/UX for the planning/building phase
- What creates "one more turn" / replayability
- Community reception (what players love, what they complain about)
- Sales/reception data if available
- Specific mechanics that could translate to Robot Uprising
- Screenshots or detailed visual descriptions of key UI moments

**Methods**: WebSearch for reviews, design analyses, GDC talks, postmortems. WebFetch for detailed articles. Search for "[game name] game design analysis", "[game name] GDC", "[game name] postmortem", "[game name] mechanics deep dive".

### Wave 2: Core Mechanic Variations

Explore every possible implementation of the context/attention mechanic.

**For each variation:**
- Exact mechanical rules (buffer size, eviction policies, signal types, capacity constraints)
- How it creates interesting decisions
- Where the difficulty curve lives (what's easy to understand, what takes mastery)
- 3+ player journeys with UI annotations
- How it interacts with the combo/synergy system
- What breaks it (degenerate strategies, unfun edge cases)

### Wave 3: Building Block Paradigms

Explore every possible way for the player to assemble attention architectures.

**For each paradigm:**
- What the player physically does (click, drag, type, scroll, select)
- What the screen looks like (layout, elements, visual language)
- How complexity scales (what does a beginner's setup look like vs. a veteran's?)
- How combos are discovered and expressed
- Controller/touch adaptation
- 3+ player journeys covering first encounter, learning curve, mastery
- Detailed UI mockup descriptions (enough for an artist to sketch)

### Wave 4: UI/UX Deep Dives

For each phase of the game (plan, execute, debrief, campaign), explore every possible screen design.

**For each screen design:**
- Exact layout description (panels, their positions, their contents)
- Every interactive element (what it does, how it responds to input)
- Information hierarchy (what's prominent, what's secondary, what's hidden)
- Animations and transitions
- Responsive behavior (how it adapts to different screens)
- Accessibility considerations

### Wave 5: Campaign & Progression

Explore every possible campaign structure, unlock system, difficulty curve, and replayability mechanism.

### Wave 6: Aesthetics & Platform

Explore art direction, audio design, narrative tone, and platform-specific adaptations.

### Wave 7: Cross-Cutting Synthesis

Read across ALL existing design-space files. Find:
- Which options in different categories naturally pair well
- Which options conflict (choosing X in building-blocks makes Y in ui-ux impossible)
- Promising "full game" configurations (a coherent set of choices across all categories)
- Gaps — aspects of the design space that haven't been explored at all

### Wave 8+: Expansion

Every completed wave should generate new aspects for deeper exploration. The space is fractal — zoom into any option and there are sub-options. Zoom into those and there are sub-sub-options.

## Rules

- Do ONE aspect per run, then exit. Do not analyze multiple aspects.
- **Be exhaustive within each aspect.** A building block paradigm exploration should be 1000-3000 words. A competitive analysis should be 500-2000 words. Brevity is the enemy.
- **Player journeys are mandatory.** Every design option gets at least 3 player journeys with minute-by-minute UI annotations. No exceptions.
- **Discover new aspects constantly.** Every analysis should generate 1-5 new aspects to add to the frontier. The frontier should GROW, not shrink. If the frontier is shrinking, you're not looking hard enough.
- **No convergence pressure.** This loop explores. It does not decide. It catalogs options, it doesn't pick winners. Every option is valid until a human says otherwise.
- **Sensory-first descriptions.** Don't say "the UI shows the buffer state." Say "a vertical thermometer on the left edge of the unit's portrait glows cool blue when the buffer is under 50%, shifts to amber at 75%, and pulses angry red when full — each slot rendered as a horizontal line, bright when occupied, dim when empty, with the most recent entry gently glowing."
- **Name everything.** Options, variations, patterns — give them memorable names. "The Mixing Board Paradigm." "The Panic Attack Tutorial." "The Slack Channel Problem." Named things are easier to reference and discuss.
- **Steal shamelessly from real games.** When a comparable game does something relevant, describe it in detail. Don't just say "like Factorio's belts" — describe exactly how Factorio's belts work and what translates.
- **Think about the TikTok clip.** For every design option, ask: what's the 15-second clip that makes someone download this game? If you can't describe that clip, the option might not be visceral enough.

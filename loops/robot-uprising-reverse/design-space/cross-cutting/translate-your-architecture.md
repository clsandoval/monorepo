# 8.08a — "Translate Your Architecture" Post-Game Bridge

## The Option

After ten missions of wiring Scout→Relay→Striker topologies, managing context windows, tuning hook channels, and writing rule priorities, the player has built something real — an information architecture that solves a distributed coordination problem. The "Translate Your Architecture" bridge takes that final Mission 10 configuration and generates a working Claude Agent SDK Python script that implements the same agent topology. Not a metaphor. Not a diagram. Runnable code.

This is the game's ultimate vocabulary test. Every claim Robot Uprising makes about its 1:1 mapping to real agentic AI engineering is tested here, in public, with generated code the player can read, run, and modify. The bridge either validates the pedagogical promise or exposes where the game's abstractions diverge from engineering reality. Both outcomes are valuable — the first builds confidence, the second builds nuance.

### What Gets Translated

The bridge processes the player's Mission 10 configuration — a JSON blob containing unit definitions, skill assignments, rule priority lists, hook subscriptions, channel topologies, and context window configurations — and emits a Python project with one file per agent, a shared message bus, and a main orchestrator.

**Literal translations (game concept maps directly to code concept):**

| Game Element | Code Output | Fidelity |
|---|---|---|
| **Unit blueprint** | Python class inheriting from `Agent` | Direct — each unit becomes a class with `async def run()` |
| **Skills** (patrol, compress, engage, filter) | Tool definitions in `@tool` decorated functions | Direct — the skill name becomes the function name, the skill's parameters become function arguments |
| **Hooks** (channel subscriptions, trigger conditions) | Pub/sub topic subscriptions via `asyncio.Queue` | Direct — the channel name becomes the topic name, the trigger condition becomes a filter predicate |
| **Context config** (buffer size, eviction policy, slot priorities) | Model selection + token budget + message pruning strategy | Strong — a 4-slot context window maps to `max_tokens=1024` with a FIFO pruning queue; an 8-slot window maps to `max_tokens=4096` with priority-weighted pruning |
| **Rule priority list** | Ordered prompt instructions in system message | Strong — rule 1 becomes the first behavioral instruction, rule conditions become `if`/`elif` blocks in the agent's decision function |
| **Channel topology** (who publishes to what, who listens to what) | Topic routing table in the orchestrator | Direct — the channel graph becomes an explicit routing dictionary |

**Adapted translations (game concept requires transformation for non-spatial, async reality):**

| Game Element | Adaptation Required | How the Bridge Handles It |
|---|---|---|
| **Spatial positioning** (8x8 grid, tile coordinates, patrol routes) | No spatial equivalent in agent systems | Stripped entirely. The bridge inserts a comment: `# Game spatial layer removed — agent systems don't operate on grids. Your patrol route became a polling interval.` Patrol frequency (tiles per tick) maps to polling interval (seconds between checks). |
| **Tick-based execution** (synchronous, every unit acts once per tick) | Real agents are async, event-driven | Each agent gets an `async def run()` loop with `await asyncio.sleep(tick_interval)`. The bridge inserts a comment: `# Game ticks became async polling. In production, you'd use event-driven triggers instead of polling loops.` |
| **Perception radius** (spatial sensor range) | No physical space to perceive | Mapped to data source scope. A scout with perception radius 3 becomes an agent that monitors 3 data feeds. The bridge generates placeholder data source URLs. |
| **EM emissions** (electromagnetic detection by enemies) | No adversarial signal interception in most agent systems | Stripped with a comment: `# EM emissions modeled information leakage — in production, consider API rate limiting and logging visibility as analogous concerns.` |
| **Combat** (engage skill, damage, health) | Agent systems don't fight | The engage skill becomes a `take_action()` function that calls an external API. The bridge generates a stub: `async def take_action(target): # Your striker's engage skill — replace with your actual API call.` |
| **Mineral cost** (unit production budget) | No direct equivalent | Mapped to a cost comment showing estimated API token usage per agent per cycle: `# Estimated cost: ~$0.003/cycle at Claude Sonnet pricing (4096 context tokens × 1 call/cycle).` |

### The Export UI

The bridge lives behind a button that appears on the campaign completion screen — the moment after the player finishes Mission 10 and sees the full vocabulary summary ("You've learned: Context Windows, Eviction Policies, Pub/Sub Channels..."). Below that list, a new panel fades in:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  YOUR ARCHITECTURE IS REAL.                          │
│                                                      │
│  The system you built in Mission 10 can run as       │
│  actual Python code. Every skill, rule, hook, and    │
│  context config you designed translates to a real    │
│  Claude Agent SDK project.                           │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │  [TRANSLATE TO PYTHON]                     │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │  [BROWSE TRANSLATIONS]  ← Codex entries    │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Clicking **TRANSLATE TO PYTHON** triggers a 3-5 second generation sequence. The screen shows a split view: left side displays the player's Mission 10 workbench (unit blueprints, channel topology graph, rule lists), right side shows Python code materializing line by line — each game element highlighted on the left as its code equivalent appears on the right. The generation is not instant; it is theatrical. Each unit blueprint pulses teal as its Python class appears. Each hook subscription draws a dotted line from the workbench to the corresponding `subscribe()` call in the code.

The audio: a soft typing sound — not mechanical keyboard clatter but the gentle tapping of a modern laptop keyboard, at 40% volume. Each completed class emits a brief ascending tone (C→E→G for the first three agents, resolving to a full chord when the orchestrator file appears). The visual rhythm matches the audio — code appears in bursts timed to the tapping, not in a continuous scroll.

When generation completes, the player sees the full project structure:

```
my-agent-system/
├── agents/
│   ├── scout.py          # Your Scout's patrol + observe skills
│   ├── relay.py          # Your Relay's compress + filter skills
│   ├── striker.py        # Your Striker's engage + respond skills
│   └── command.py        # Your Command agent (if present)
├── bus/
│   └── message_bus.py    # Channel topology as async pub/sub
├── config/
│   └── context_policy.py # Buffer sizes + eviction from your context config
├── main.py               # Orchestrator — starts all agents
├── requirements.txt      # claude-sdk, asyncio
└── README.md             # "This code was generated from your Robot Uprising
                          #  Mission 10 architecture. Here's how to run it."
```

The player can download as a ZIP, copy individual files to clipboard, or — if they've connected a GitHub account — push directly to a new repository. The repository name defaults to `robot-uprising-export-{config-hash}`.

### When It Unlocks

The bridge unlocks upon completing Mission 10. It does not unlock earlier because the full vocabulary set (context windows, multi-agent orchestration, priority-based rule evaluation, pub/sub channels, compression, signal routing) is not established until the final mission. Offering the bridge mid-campaign would produce incomplete code that misrepresents the game's teaching scope.

After unlocking, the bridge is accessible from three locations:
1. The campaign completion screen (first encounter)
2. The Blueprint Codex, under a new "Translate" tab for any saved configuration
3. The Gauntlet post-match debrief, allowing competitive configs to be exported

---

## Player Journeys

#### Journey: Reyna, 28, Backend Engineer at a Fintech Startup, Just Completed Mission 10

**Context:** Reyna has been playing Robot Uprising for two weeks, 45 minutes a night after her daughter goes to sleep. She works with Kafka event streams and FastAPI microservices during the day. She picked up the game because a coworker sent her a TikTok split-screen of the workbench and Claude SDK code. She's been quietly noticing parallels since Mission 3 but hasn't voiced them.

**Minute 0:00 — The Completion Screen**
The Mission 10 debrief histogram fades, replaced by the vocabulary summary. Reyna reads the list — Context Windows, Eviction Policies, Pub/Sub Channels, Priority-Based Rule Evaluation, Signal Latency, Agent Orchestration — and each term glows faintly as if freshly activated. Below the list, the bridge panel fades in. She reads: "YOUR ARCHITECTURE IS REAL." Her eyebrows lift. She taps TRANSLATE TO PYTHON.

**Minute 0:15 — The Split View**
The screen divides. Left: her Mission 10 workbench. Two scouts (north and south patrol), one relay (central, compress+filter, 6-slot context), two strikers (east and west quadrants), one command agent (8-slot context, all-channel listen). Right: an empty code editor panel, dark background, cursor blinking.

Her north scout blueprint pulses teal. On the right, code appears:

```python
class NorthScout(Agent):
    """Patrol northern quadrant, observe threats, publish to recon channel."""

    tools = [patrol, observe]
    context_window = ContextPolicy(slots=4, eviction="fifo")
    subscriptions = ["command_broadcast"]
    publications = ["recon_north"]
```

The soft typing sound accompanies each line. She leans forward. That `ContextPolicy(slots=4, eviction="fifo")` — that's her 4-slot FIFO buffer. The thing she spent twenty minutes tuning in Mission 7 when her scout kept forgetting old observations.

**Minute 0:45 — The Relay Translation**
Her relay blueprint pulses. The code that appears:

```python
class CentralRelay(Agent):
    tools = [compress, filter]
    context_window = ContextPolicy(slots=6, eviction="priority_weighted")
    subscriptions = ["recon_north", "recon_south"]
    publications = ["processed_intel"]
```

She whispers: "That's a Kafka consumer group." Her relay subscribes to two recon topics and publishes to a processed topic. She's been building this pattern at work for three years — fan-in aggregation with transformation. The game taught it to her as "put the relay between the scouts and the strikers." The code shows her it was always the same thing.

**Minute 1:30 — The Message Bus File**
The channel topology graph on the left — those colored lines she drew between units — collapses into `message_bus.py`. Each named channel becomes an `asyncio.Queue`. The routing table maps publishers to subscribers. The bridge generates:

```python
TOPOLOGY = {
    "recon_north": ["central_relay"],
    "recon_south": ["central_relay"],
    "processed_intel": ["east_striker", "west_striker", "command"],
    "command_broadcast": ["north_scout", "south_scout", "central_relay"],
}
```

She screenshots it. This is the topology she designed on an 8x8 grid, extracted into a routing dictionary she could paste into a real system. She opens Slack and sends it to her coworker with the message: "Remember that TikTok? I just finished the game. Here's what it generated from my config."

**Minute 2:30 — The Adaptation Comments**
She reads the generated code more carefully. She finds the comments where the bridge had to adapt rather than translate directly. The patrol skill's comment: `# Game spatial layer removed — agent systems don't operate on grids. Your patrol route became a polling interval.` She nods — that makes sense. The tick-to-async comment: `# Game ticks became async polling. In production, you'd use event-driven triggers instead of polling loops.` She thinks: "I'd use Kafka consumers with auto-commit, not polling. But the shape is right."

She clicks DOWNLOAD ZIP. She has a project she can modify tomorrow at work, during lunch, to prototype the document-routing agent she's been meaning to build.

**UI Annotations:**
- Split view: workbench left (50%), code right (50%), divider line at 1px teal
- Blueprint pulse: 0.5s teal glow on unit card, coinciding with code generation start
- Typing audio: 40% volume, soft laptop keys, 3-4 keystrokes per line appearance
- Completion chord: C major arpeggio across the six agent files, resolving when main.py appears
- Download button: bottom-right of code panel, ZIP icon in teal, hover state shows file count

---

#### Journey: Tomás, 16, High School Student in Cebu, First Programming Language Was Scratch

**Context:** Tomás learned Scratch at a coding workshop when he was 12. He's been playing Robot Uprising for a month and is halfway through a second playthrough on Hard difficulty. He has never written Python. He doesn't know what an SDK is. He chose Robot Uprising because it looked like Factorio but with robots.

**Minute 0:00 — The Panel Appears**
Tomás finishes Mission 10 for the second time. The vocabulary summary is familiar now. But the bridge panel is new — it didn't appear on his first playthrough because the feature launched in a patch two days ago. He reads "TRANSLATE TO PYTHON" and feels a jolt of anxiety. Python is the language his older cousin uses at university. He taps it anyway.

**Minute 0:20 — The Split View**
His workbench appears on the left. His config is simple by veteran standards: 1 scout, 1 relay, 1 striker, no command agent. But it works — he three-starred every mission with careful tuning. The code starts generating on the right. He doesn't understand the syntax — `class`, `async def`, `await` — but he recognizes the structure. His scout has two skills in the game; the code has two `tools`. His relay subscribes to one channel; the code has one entry in `subscriptions`.

He traces the correspondences with his finger on the screen. Left: a hook wired from scout to relay on channel "recon." Right: `publications = ["recon"]` in the scout class and `subscriptions = ["recon"]` in the relay class. Same word. Same direction. Same meaning.

**Minute 1:00 — The README**
The last file generated is `README.md`. It opens in a preview panel below the code. The README contains a section titled "How Your Game Architecture Maps to This Code" with a two-column table: left column shows game screenshots (auto-captured from his config), right column shows the corresponding code block with highlighted lines. Below the table, step-by-step instructions: `pip install -r requirements.txt`, then `python main.py`.

He doesn't have Python installed. He doesn't know what `pip` is. But the README links to a "Getting Started with Python" guide hosted on the Robot Uprising website — a 10-minute tutorial that covers installation, virtual environments, and running a script. The guide uses Robot Uprising export code as its example project, not "Hello World."

**Minute 2:00 — The Scratch Parallel**
Tomás opens the `message_bus.py` file. The routing table is a dictionary — keys are channel names, values are lists of subscribers. He stares at it. Then he opens Scratch in another tab and looks at his old project — a broadcast system where sprites listen for named messages. `broadcast "recon"` in Scratch. `await bus.publish("recon", data)` in Python. The shape is identical. The syntax is different.

He copies the ZIP to his desktop. That weekend, he follows the README's Python tutorial. He runs `python main.py` and watches his agents print messages to the terminal: `[NorthScout] Published to recon: threat detected at sector 3`. The text scrolls like the game's boot log. He grins.

**Minute 3:30 — The Modification**
Two weeks later, Tomás has modified the scout to monitor a real data source — a public weather API. His "relay" compresses the weather data into a summary. His "striker" sends the summary to a Discord webhook that posts in his friend group's server. He doesn't know he's built a data pipeline. He just ported his Robot Uprising config to do something useful.

**UI Annotations:**
- README preview: rendered markdown below code panel, scrollable, game screenshots embedded as base64
- Two-column mapping table: game screenshot left, code block right, yellow highlight on corresponding elements
- "Getting Started" link: underlined teal text in README, opens in external browser
- Terminal output (post-export): monospace text on dark background, agent names in brackets, channel-colored text

---

#### Journey: Dr. Adaora, 45, Computer Science Professor at University of Lagos, Teaching Distributed Systems

**Context:** Dr. Adaora discovered Robot Uprising when a student used it in a presentation about pub/sub systems. She played through the campaign in four days, taking notes. She's now designing a lab assignment around the export feature: students play Missions 7-10, export their configs, then extend the generated code to handle a real distributed task.

**Minute 0:00 — The Lab Design**
She exports her own Mission 10 config — a heavily instrumented architecture with 2 scouts, 2 relays (redundant paths), 2 strikers, and a command agent. Eight agents total. The generated code produces eight Python files, a message bus with 12 topics, and a context policy file with four different eviction strategies (one per unit type). She reads every line.

**Minute 1:00 — The Annotation Layer**
She notices the bridge's adaptation comments and realizes they're the foundation of her lab. Each comment marks a point where the game diverges from real engineering. She drafts the assignment: "Part 1: Play Missions 7-10. Part 2: Export your config. Part 3: For each adaptation comment in the generated code, write a paragraph explaining what the game simplified and how a production system would handle it differently. Part 4: Replace one stub (patrol→API poll, engage→API call) with a real integration."

The adaptation comments become teaching moments. The `# Game ticks became async polling` comment leads to a lecture on event-driven architectures. The `# EM emissions modeled information leakage` comment becomes a security lecture on API key exposure and audit logging.

**Minute 2:00 — The Student Submissions**
Three weeks later, she receives 34 lab submissions. The architectures vary wildly. One student built a single-scout, single-striker system — minimalist, efficient, fragile. Another built a six-relay mesh network that routes around failures. The generated code for each reflects the student's architectural philosophy. She can grade the Python without ever loading the game — the code IS the architecture.

She assigns peer review: each student reads another student's generated code and writes a critique. The critique uses the game's vocabulary ("your relay's context window is too small — it'll evict important signals under load") but the artifact they're reviewing is Python code. The vocabulary transfers seamlessly because the bridge preserved the terminology in variable names, class names, and comments.

**Minute 3:30 — The Conference Paper**
She screenshots a student's export: a three-agent pipeline (scout monitors RSS feed, relay summarizes with Claude, striker posts to Slack). The code is 140 lines. The student built it in two hours, starting from the Robot Uprising export. She compares this to last year's lab, where students started from scratch and took eight hours to build equivalent functionality. The export scaffolding — class structure, message bus, context management — eliminated the boilerplate and let students focus on the interesting part: the architecture.

She begins drafting a paper: "Game-to-Code Bridges as Scaffolding for Distributed Systems Education." The core argument: students who design architectures visually in Robot Uprising and then see those architectures as code develop stronger intuitions about distributed system topology than students who start with code alone.

**UI Annotations:**
- Eight-agent export: code panel scrolls through eight class files, tab bar across top shows file names
- Twelve-topic message bus: routing dictionary spans 30 lines, topic names match game channel names exactly
- Adaptation comments: rendered in italic grey, visually distinct from functional code
- Lab assignment integration: README includes a "For Educators" section with suggested assignment structure

---

## Strengths

1. **The ultimate vocabulary validation.** If the generated code looks right to a professional engineer, the game's 1:1 vocabulary claim is proven. If it looks wrong, the specific failure points guide game design iteration. Either way, the bridge is a forcing function for honesty.

2. **Zero-to-running-code for non-programmers.** Players like Tomás who have never written Python get a working project that reflects decisions they already understand. The cognitive load of "learning to program" is reduced because the architecture is pre-decided — they only need to learn syntax.

3. **On-ramp to the profession.** The bridge converts game hours into professional portfolio artifacts. A player can put their generated agent system on GitHub, modify it, and show it in a job interview. The game becomes a career accelerant.

4. **Educational scaffolding.** Dr. Adaora's use case demonstrates that the bridge enables a new category of CS education: visual-first distributed systems design with automatic code generation as the grading artifact.

## Weaknesses

1. **The adaptation gap risks disillusionment.** When a player sees `# Game spatial layer removed`, they might feel cheated — "so the game isn't real after all." The bridge must frame adaptations as expansions ("your patrol route became a polling interval — a more general pattern") rather than deletions ("spatial logic removed").

2. **Generated code quality.** Auto-generated code is notorious for being unidiomatic. If the Python output looks like machine-generated spaghetti, professional developers will dismiss it. The bridge must generate code that a senior engineer would consider "reasonable starter code" — clean, well-commented, following PEP 8 conventions.

3. **Maintenance burden.** The Claude Agent SDK will evolve. The bridge must track SDK version changes and update its code generation templates. A broken export (generating code that doesn't run against the current SDK) would damage trust in the game's technical credibility.

4. **Scope creep temptation.** The bridge could become a full IDE — syntax highlighting, inline editing, execution in browser. Every added feature moves the game away from being a game and toward being a development tool. The bridge should export and get out of the way.

---

## Interaction Effects

### Blueprint Codex Integration

Every configuration in the Blueprint Codex — the player's library of saved and shared architectures — gains a "Translate" button after the bridge unlocks. This means community-shared configurations become shareable code. A top-ranked Gauntlet player's star topology config can be exported by any player and studied as Python. The Codex becomes a code library by proxy.

The Codex's "Real-World Parallel" sections (aspect 8.08b) gain a new dimension: each parallel can link to the specific line in the generated code that implements the described pattern. "In real AI engineering, compression is called summarization" can link to the relay's `compress()` tool function, which calls `claude.summarize()`.

### Career Stats Integration

The player's career stats — total matches played, win rate, most-used topology, favorite eviction policy — appear as comments in the generated code's header:

```python
# Generated from Robot Uprising Mission 10 config
# Player: Reyna | Career: 47 matches | Win rate: 72%
# Dominant topology: Hub-and-spoke | Preferred eviction: priority_weighted
# Export date: 2026-03-21
```

This metadata serves two purposes: it personalizes the export (this code came from YOUR journey), and it provides context for anyone reviewing the code later (this architecture was battle-tested across 47 matches).

### Community Sharing

Exported code inherits the Config Code sharing system (aspect 7.03e). A player can share their export as a Config Code string that another player can import — not into the game, but into their Python environment. The Config Code encodes the architecture; the bridge decodes it into code. This creates a secondary sharing economy: game configurations that double as code templates.

Workshop entries can be tagged "exportable" — indicating the config has been verified to produce clean, runnable Python. Community members can rate exports on code quality separately from game effectiveness. A config might be Silver-tier in the Gauntlet but produce the cleanest, most educational code export in the Workshop.

---

## Comparable Games

| Game | Export Feature | What Transfers | What Doesn't |
|---|---|---|---|
| **Screeps** | "Deploy to official server" — move your code from private sandbox to shared persistent world | Everything — the code IS the game; JavaScript runs identically in both environments | Nothing — Screeps has no translation layer because there's nothing to translate |
| **Factorio** | Blueprint strings — copy-paste factory layouts as encoded text | Layout, ratios, belt routing — the shape of the factory transfers to any map | Terrain, resource placement, biters — the environment doesn't transfer |
| **Scratch → Python bridges** (Scratch-to-Python, S2P) | Auto-convert Scratch blocks to Python source | Control flow, variables, loops, event handlers — structural programming concepts | Sprite-based animation, visual feedback, drag-and-drop — the modality shifts entirely |
| **TIS-100 → real assembly** | No official bridge, but community transpilers exist | Register operations, conditional jumps, memory addressing — instruction-set thinking | The node topology, visual layout, puzzle constraints — TIS-100's spatial arrangement has no CPU equivalent |
| **Robot Uprising → Claude Agent SDK** | Official bridge generating runnable Python from game config | Agent topology, pub/sub channels, context management, tool definitions, rule priorities | Spatial positioning, tick-based execution, combat, EM emissions, mineral economy |

Robot Uprising's bridge is closest to Scratch-to-Python in philosophy: a visual-first design environment that exports to a text-based professional environment. But it's closer to Screeps in vocabulary fidelity: the game terms and the code terms are the same words. The bridge occupies a unique position — Screeps-level vocabulary accuracy with Scratch-level accessibility.

The key differentiator from Factorio blueprint strings: Factorio exports transfer within the game (map to map). Robot Uprising exports transfer outside the game (game to real code). This is the difference between sharing a save file and generating a professional artifact.

---

## Sensory Descriptions

**The generation sequence.** The screen splits with a 1px teal divider that draws itself from top to bottom in 0.3 seconds — a clean vertical cut. The left panel dims to 70% brightness; the right panel is pure dark (#0d1117, GitHub's dark theme). The cursor blinks in the top-left of the right panel, steady 1Hz pulse, teal (#00bcd4). Then the first unit blueprint on the left glows — a soft teal halo expanding from the card's border over 0.5 seconds — and code begins appearing on the right. Each line materializes left-to-right, as if being typed, at approximately 80 characters per second. Fast enough to feel automatic, slow enough to read individual keywords as they appear.

**The typing audio.** Not the clacky mechanical switches of a streamer's keyboard. Softer — the muffled taps of a MacBook keyboard in a quiet room. Each keystroke is a 15ms sample with 20% volume variation to avoid robotic repetition. The rhythm follows natural typing patterns: bursts of 4-6 characters, pause, burst. When a function definition appears (`async def patrol(self):`), the typing accelerates slightly — as if the system is confident about this line. When an adaptation comment appears (`# Game spatial layer removed...`), the typing slows, as if the system is thinking carefully about the phrasing.

**The completion moment.** When the last file (`main.py`) finishes generating, all eight agent cards on the left pulse simultaneously — one final teal flash — and the right panel scrolls to the top of `main.py`, which contains the orchestrator that wires everything together. A single sustained chord (C major, held for 2 seconds, string ensemble timbre) plays at 30% volume. The chord doesn't resolve to anything; it sustains and fades, leaving the player in silence with their code. The DOWNLOAD ZIP button fades in at the bottom-right, teal outline, and beside it a smaller button: PUSH TO GITHUB. Both are quiet — no bouncing, no glow. The theatrical moment is over. Now it's just code.

**The adaptation comments.** Visually, they render in `#6a737d` (GitHub's comment grey), italic, with a small amber diamond (4px) preceding each one. The amber diamond is the bridge's honesty marker: "this is where the game and reality diverge." Players learn to scan for amber diamonds the way engineers scan for `TODO` comments — they mark the interesting parts, the places where further work is needed.

**The ZIP download.** The ZIP file lands in the player's downloads folder with a satisfying 50ms haptic pulse (on mobile/controller) or a brief screen-flash (on desktop). The filename is human-readable: `robot-uprising-reyna-hub-spoke-2026-03-21.zip`. The player's name, their dominant topology, and the date — enough to identify the export months later without opening it.

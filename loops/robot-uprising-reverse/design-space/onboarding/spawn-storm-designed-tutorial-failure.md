# 5.13a — Spawn Storm as Designed Tutorial Failure

**Aspect ID:** 5.13a
**Wave:** 5 (Campaign & Onboarding)
**Category:** Onboarding
**Related aspects:** 1.04c (REPL spawn semantics), 5.04a (Mission 5 factory wall), 8.04d (factory shock), 1.03 (Opus Magnum first ugly solution), 5.18 (first deadlock tutorial mission), 3.19a (self-replicating agent configs), 5.06 (failure and recovery), 3.19a-i (reinforcement thermostat control theory), 2.00b-i (near-miss rendering), 5.04b (vocabulary density curve)

---

## The Design Question

**When should a player first trigger a spawn storm — an uncontrolled cascade of unit production that drains all fabrication resources in seconds — and how do you make that catastrophic moment feel like a revelation rather than a bug?**

A spawn storm is the production equivalent of an infinite loop. Agent A's rules say "if threatened, spawn a scout." The scout inherits the same rules. The new scout perceives a threat (because the battlefield is dangerous). It spawns another scout. That scout spawns another. The factory's material reserves drain to zero in 4-6 ticks. The production queue fills with ghosts. The player's real army — the strikers, the relays, the carefully configured command agent — never gets built. The mission collapses not because the enemy was clever, but because the player's own system ate itself.

This is **the single most important failure in Robot Uprising's production system.** It teaches:

1. **Termination conditions** — the same lesson recursion teaches in CS101. Every process that can spawn must have a stopping rule.
2. **Resource awareness** — fabrication materials are finite. Production decisions have opportunity costs.
3. **Inheritance danger** — spawned units that inherit parent configurations blindly create feedback loops.
4. **The difference between "working" and "correct"** — the spawn rule fired exactly as configured. It was technically correct. It was catastrophically wrong.

The Opus Magnum principle applies perfectly: the player's first solution should *work* — just badly. The spawn storm works. It spawns units. It responds to threats. It just does so without limit, consuming everything. The debrief must make this visible, diagnosable, and fixable with a single change.

---

## When Does the Spawn Storm Happen?

### Timing Options

The spawn storm can only occur after the factory is introduced (Mission 5, locked). The question is whether the first spawn storm is **designed to be almost inevitable** (the Dark Souls Asylum Demon approach) or **possible but not guaranteed** (the Factorio power-grid-collapse approach).

#### Option A: "The Guaranteed Storm" — Mission 6 Is the Storm Mission

Mission 6 introduces the Command agent and production tuning. The mission briefing explicitly encourages the player to use conditional spawning. The scenario is designed so that:
- The battlefield has persistent, respawning threats (enemy spawners that produce units every 5 ticks)
- The player's initial factory output is insufficient to survive without adaptive production
- The natural response — "spawn more units when things go badly" — creates the storm

The storm is not a trap. It's the *obvious correct answer* that turns out to be incomplete. The player does exactly what the game asked. The system does exactly what the player configured. The failure is in the missing termination condition.

**Strengths:** Universal experience. Every player hits the storm at the same narrative moment. The debrief can be specifically designed for this exact failure mode. Community discussions align around the shared experience ("did you survive Mission 6 on first try?" becomes a community bonding question, like "how did you die to the Asylum Demon?").

**Weaknesses:** Players who happen to add a child limit on their first try skip the lesson. The mission must be designed so that the naive configuration *without* a child limit is the most natural one — the child limit option should exist in the UI but not be prominently suggested.

#### Option B: "The Emergent Storm" — Storm Happens Whenever the Player First Uses Conditional Production

No specific mission is designed for the storm. Instead, the spawn storm is a natural consequence of any mission where the player first configures conditional spawn rules. It might happen at Mission 5 (if the player is aggressive), Mission 6, or Mission 7.

**Strengths:** Feels organic, not scripted. The player's unique path to the storm makes the lesson feel personal.

**Weaknesses:** The debrief can't be specifically designed for the storm. Some players might never trigger it (if they always set child limits). The community experience fragments — no shared "Mission 6 moment."

#### Option C: "The Seeded Storm" — Mission 6 Pre-Loads a Storm-Prone Configuration

A hybrid. Mission 6 presents the player with a partially pre-configured production setup (the Predecessor's previous configuration, as established in the narrative). The pre-loaded config includes conditional spawn rules *without* child limits. The player can modify them or run as-is.

Running as-is triggers the storm. Modifying them might prevent it — but the modifications required are non-obvious unless the player already understands termination conditions.

**Strengths:** Feels like inheriting a real system (the Predecessor's work) rather than being set up. The Predecessor's imperfect configs become a narrative device: even the AI that came before you made this mistake. The player who fixes it before executing feels the satisfaction of catching a bug; the player who runs it and fails feels the satisfaction of finding the bug in debrief.

**Weaknesses:** Pre-configured setups undermine the blank-page authorship feeling that factory missions should deliver (per 8.04d analysis). The Predecessor's config might feel like a crutch.

### Recommendation: Option C with Escape Velocity

The seeded storm is the strongest pedagogical and narrative choice. The Predecessor's configuration isn't presented as "use this" — it's presented as "this is what the last attempt looked like. It failed. You can study it, modify it, or start fresh." The player who studies it and spots the missing child limit earns the lesson without failure. The player who runs it as-is (or builds something similar) earns the lesson through failure. Both paths converge at understanding.

The "escape velocity" detail: if the player builds a completely fresh configuration from scratch and includes a child limit, the mission congratulates them with a unique boot log line: `SPAWN GOVERNOR DETECTED. PREDECESSOR NOTE: "I wish I'd thought of that."` This rewards the player who independently solved the problem before encountering it.

---

## The Mission: "The Swarm" (Mission 6, Palawan — Jungle)

### Setting

Palawan jungle — dense tropical canopy with limited line-of-sight. The board has scattered enemy spawners in corners and a central clearing where the player's factory sits. The jungle tiles block perception beyond 2 tiles (vs. the usual 5 for scouts), creating a claustrophobic information environment where threats emerge from green darkness without warning.

### Campaign Context

The player has completed Mission 5 (factory introduction). They understand blueprints, the production queue, and basic resource management. They've built armies from blueprints. But their Mission 5 armies were static — a fixed queue of units produced in order, no conditional logic, no adaptive behavior.

Mission 6 introduces two new capabilities simultaneously:
1. **The Command agent** (locked: Missions 6-7 = Command agent + production tuning)
2. **Conditional production rules** — rules that trigger spawning based on battlefield conditions

### The Boot Log

The mission boot sequence begins with the standard subsystem initialization, then:

```
LOADING PREDECESSOR CONFIGURATION...
NOTE: Previous operator attempted this sector.
RESULT: CATASTROPHIC RESOURCE DEPLETION.

PREDECESSOR'S PRODUCTION CONFIG:
  RULE 1: IF enemy_detected → SPAWN Scout [template: jungle-recon]
  RULE 2: IF scout_destroyed → SPAWN Scout [template: jungle-recon]
  RULE 3: IF enemy_count > friendly_count → SPAWN Striker [template: jungle-assault]

  CHILD LIMIT: [not set]
  FABRICATION BUDGET: 80 materials

SUBSYSTEM NOTE: Configuration preserved for analysis.
You may modify, replace, or execute as-is.

> COMMAND MODULE AVAILABLE — NEW CAPABILITY DETECTED
> Type: Command Agent — manages subordinate production
> See Blueprint Codex entry: COMMAND
```

The boot log does three things:
1. **Foreshadows failure** without spoiling the mechanism ("catastrophic resource depletion")
2. **Presents the problematic config** with the missing child limit visible but not highlighted
3. **Introduces the Command agent** as a new tool, creating the question: "could the Command agent have prevented this?"

### The Battlefield Setup

- 8×8 board, jungle biome
- Player factory at D4 (center-left)
- Enemy spawners at A1, H1, H8 (three corners)
- Dense jungle tiles everywhere except C3-E5 clearing around factory
- Enemy spawners produce 1 enemy scout every 4 ticks, 1 enemy striker every 8 ticks
- Jungle tiles reduce perception to 2 (from 5), making early warning nearly impossible
- Starting resources: 80 materials

The scenario is designed so that:
- 80 materials is enough for a well-planned army (3 scouts + 2 relays + 2 strikers + 1 command = 70 materials)
- But conditional spawning without limits can consume 80 materials in 8-12 ticks (each scout costs 3 materials; 26 scouts = 78 materials)
- The enemy pressure is constant but not overwhelming — a static army of 8 well-configured units can win
- The jungle's reduced perception means scouts will frequently detect enemies, triggering spawn rules constantly

### What Happens When the Storm Triggers

**Tick 1-3:** Calm. The player's initial units deploy from the production queue. Scouts fan out into the jungle. The tick clock pulses. Context bars fill with terrain data.

**Tick 4:** First enemy scout emerges from the A1 spawner. The player's scout detects it — perception cone briefly illuminated in the dark jungle. The scout's hook fires: `enemy_detected` → channel `threat-alpha`. The Predecessor's spawn rule activates: a new scout begins fabrication. The factory's fabrication counter drops from 80 to 77. A soft fabrication chime sounds. A new scout icon appears at the factory.

**Tick 5-6:** The new scout deploys. It immediately detects the same enemy (still in range). `enemy_detected` fires again. Another scout begins fabrication. 77 → 74. Meanwhile, a second enemy emerges from H1. The original scout network detects it. Two more spawn rules fire.

**Tick 7-10:** The cascade. Every new scout detects at least one enemy within 2 ticks of deployment. Each detection triggers a spawn. Each spawn produces a unit that detects and triggers another spawn. The fabrication counter accelerates: 74 → 71 → 68 → 62 → 53 → 41 → 26 → 8 → 0.

**The visual:** The factory tile becomes a strobe. Fabrication animations overlap — spark-burst, snap-into-existence, spark-burst, snap — the rhythm accelerating from one per tick to three per tick. The conveyor belt production queue (horizontal strip of blueprint icons) scrolls wildly as new entries push in faster than units can deploy. The resource counter in the top-right bleeds from white (80) through amber (40) through angry red (15) to empty black (0) with a hollow THUNK sound as it hits zero.

**The sound:** Each fabrication has a startup chime (a brief ascending tone). At normal pace, this is pleasant — ping... ping... ping. During the storm, the pings overlap into a frantic ascending cacophony — pingpingpingPINGPINGPING — that becomes a dissonant wall of sound before cutting to silence when resources hit zero. The silence is the loudest moment.

**The board:** By tick 10, there are 20+ scout units crowding the 8×8 grid. The jungle clearing around the factory is packed — scout icons overlap, context bars are tiny slivers of frantic activity. The scouts are doing their jobs — they detect, they report, they evade — but there are no strikers to kill anything, no relays to organize information, no command agent to coordinate. The army is an all-seeing, all-reporting, completely toothless swarm of eyes.

**Tick 11-20:** The enemy strikers arrive. With no player strikers on the board (all materials were consumed by scouts), the enemy cuts through the swarm. One-shot, one-kill. A scout dies. The `scout_destroyed` rule fires — but there are no resources to spawn replacements. The production queue shows a ghost icon (dimmed blueprint, red "INSUFFICIENT MATERIALS" text). Another scout dies. Another ghost. The board empties.

**Tick 25-30:** Mission failure. The player's factory is overrun. The last scouts scatter into the jungle, detected and eliminated one by one. The defeat screen shows total production: 26 scouts, 0 strikers, 0 relays, 0 command agents. Materials remaining: 0.

### The Sealed Watch Experience

The sealed watch is where the storm becomes *felt*, not just understood. The player cannot pause, cannot intervene, cannot look away. They watch their factory consume itself. The accelerating fabrication rhythm is designed to feel like a heartbeat speeding up — first exciting ("it's working! it's responding to threats!"), then alarming ("wait, why is it still spawning?"), then sickening ("stop. STOP. Stop making scouts.").

The 1-second-per-tick pacing is critical. At 1x speed, the storm takes 10-12 seconds of real time. Long enough to feel the escalation. Short enough that the player doesn't check their phone. The resource counter's color transition (white → amber → red → black) is visible in peripheral vision even if the player is watching the battlefield.

The kill phase (ticks 11-20) is the payoff. The player watches their 26 scouts — each one costing 3 materials, each one produced by a rule that "worked" — die in sequence to strikers they never built. The one-shot-one-kill mechanic is at its most brutal: each kill is instant, each death is a wasted 3 materials. The math is visceral: 26 scouts × 3 materials = 78 materials = enough for an entire proper army.

No skip button. No pause. No tools. This is the quality signal at work: you must watch what your configuration did.

---

## The Debrief: Inspector as Diagnostic Autopsy

### Two-Act Structure (Locked)

**Act 1 — Sealed Watch** has just finished. The player experienced the storm emotionally. Now:

**Act 2 — Inspector** provides the analytical tools to understand what happened.

### The Timeline Scrubber

The player opens Inspector. The timeline scrubber stretches across the top: 30 tick markers, each one a position to step through. The scrubber has visible annotations:

- **Tick 4:** A small orange diamond labeled "FIRST SPAWN" — the moment the cascade began
- **Tick 10:** A red diamond labeled "RESOURCES DEPLETED" — the moment the factory went dry
- **Tick 15:** A skull icon — "FIRST UNIT LOST"
- **Tick 30:** The final skull — mission failure

The diamonds and skulls draw the player's eye to the critical moments. The gap between Tick 4 (first spawn) and Tick 10 (resources depleted) is visually small — 6 ticks, 6 seconds. The player can see at a glance that the entire resource pool was consumed in 6 ticks.

### The Spawn Chain View

Clicking the factory reveals a new Inspector panel: **Production History.** This shows every unit spawned, when, why, and at what cost:

```
PRODUCTION LOG — Mission 6 "The Swarm"
═══════════════════════════════════════

T01  Scout-01    [queue]      3m  →  77m remaining
T02  Scout-02    [queue]      3m  →  74m remaining
T03  Relay-01    [queue]      5m  →  69m remaining
T04  Scout-03    [RULE 1]     3m  →  66m remaining    ← triggered by: enemy detected at A2
T05  Scout-04    [RULE 1]     3m  →  63m remaining    ← triggered by: enemy detected at A2
T05  Scout-05    [RULE 2]     3m  →  60m remaining    ← triggered by: Scout-01 destroyed
T06  Scout-06    [RULE 1]     3m  →  57m remaining    ← triggered by: enemy detected at H2
T06  Scout-07    [RULE 1]     3m  →  54m remaining    ← triggered by: enemy detected at A3
T06  Scout-08    [RULE 3]     8m  →  46m remaining    ← triggered by: enemy_count(4) > friendly(3)
     ⚠ NOTE: Striker queued but Scout spawns executed first (queue priority)
T07  Scout-09    [RULE 1]     3m  →  43m remaining
T07  Scout-10    [RULE 1]     3m  →  40m remaining
T07  Scout-11    [RULE 1]     3m  →  37m remaining
T08  Scout-12    [RULE 1]     3m  →  34m remaining
...
T10  Scout-22    [RULE 1]     3m  →  2m remaining
T10  Scout-23    BLOCKED      3m     ← INSUFFICIENT MATERIALS (2m < 3m required)
     ⛔ FABRICATION HALTED — 0 strikers produced, 0 command agents produced

SUMMARY:
  Total spawned: 23 units (20 scouts, 2 strikers, 1 relay)
  Rule-triggered: 20 (87%)
  Queue-planned: 3 (13%)
  Materials spent on rule-triggered spawns: 66m (82.5%)
  Materials spent on planned queue: 14m (17.5%)

  ⚠ NO CHILD LIMIT SET — rule spawning was unbounded
```

The production log is the autopsy report. Each line shows the trigger, the cost, and the remaining balance. The accelerating pace is visible: T04 has 1 spawn, T05 has 2, T06 has 3, T07 has 3. The player can see the exponential growth in the line spacing.

The summary at the bottom delivers the diagnosis: **87% of all production was rule-triggered, not planned. 82.5% of materials went to unplanned scouts.** And the critical annotation: `NO CHILD LIMIT SET — rule spawning was unbounded.`

### The Resource Curve

Below the production log, a chart: **Fabrication Materials Over Time.** A line chart starting at 80 (Tick 0) and declining. The decline is not linear — it curves steeply downward after Tick 4, hitting zero at Tick 10. The area under the curve is shaded: the region where materials were spent on planned production (green, small) vs. rule-triggered production (red, large). The red area dominates.

A horizontal dashed line at "26 materials" represents "minimum cost for 1 striker + 1 relay + 1 command agent." The line is labeled: "Never reached — resources consumed by scouts." The player can see that the resource curve crossed below this line at Tick 7 — only 3 ticks after the cascade began. The window to build a viable army closed in 3 seconds of game time.

### The Fix Suggestion

At the bottom of the Inspector, a panel titled **DIAGNOSTIC:**

```
PRIMARY CAUSE: Unbounded conditional spawning
  Rules 1-3 trigger spawns without production caps.
  Each spawned unit inherits the conditions that triggered its parent.

SUGGESTED FIXES (any one of these would prevent the storm):

  ① SET CHILD LIMIT: Add a maximum spawn count per rule.
     Example: "IF enemy_detected → SPAWN Scout [limit: 3]"
     Effect: Maximum 3 conditional scouts, preserving 71m for planned units.

  ② ADD SPAWN CONDITION: Require a resource threshold before spawning.
     Example: "IF enemy_detected AND materials > 40 → SPAWN Scout"
     Effect: Spawning stops when resources drop below safety margin.

  ③ REPLACE WITH COMMAND AGENT: Use the Command agent's "reassign" skill
     to reallocate existing units instead of spawning new ones.
     Effect: Zero additional resource cost. Existing army adapts.
```

Fix ③ is the real lesson. The Command agent — introduced in this same mission — is the *architectural* solution to the spawn storm problem. Instead of building more units, you build smarter management. The spawn storm teaches the player *why* the Command agent exists: because unlimited spawning is the naive solution to adaptability, and intelligent management is the sophisticated one.

---

## Player Journeys

### Journey: Mika, 14, Manila, First Strategy Game, Completed Missions 1-5

**Context:** Mika struggled with Mission 5 but beat it with a static army (3 scouts, 2 relays, 2 strikers). She's never seen conditional production rules before. The boot log introduction of the Command agent is exciting but overwhelming. She decides to try the Predecessor's config first "to see what happens."

**Minute 0:00 — The Boot Log**
Mika reads the boot log on her iPad. The Predecessor's failed config is displayed: three rules, no child limit. She doesn't know what "child limit" means — the term hasn't been introduced yet. She sees `[not set]` next to CHILD LIMIT and assumes it's optional. The rules make sense to her: "if enemy appears, make a scout. If scout dies, make another. If outnumbered, make a striker." This sounds reasonable. She taps EXECUTE.

**Minute 0:15 — The First Ticks**
The jungle board appears. Dark green tiles, limited visibility. Her three queued units deploy — two scouts and a relay. The scouts push into the jungle. Context bars fill with terrain observations. Mika leans forward. The jungle feels dangerous.

**Minute 0:19 — The First Spawn**
An enemy scout appears at A2. Her scout's perception cone lights up gold. A second later, the factory sparks — a new scout materializes with a brief ascending chime. Mika smiles: "It's working! It made a scout because it saw an enemy!"

**Minute 0:22 — The Acceleration**
Two more enemies emerge. Three more scouts spawn. The factory is now producing a scout every tick. The resource counter drops: 60... 54... 46... Mika notices the number changing but it's small text in the corner. She's watching the scouts multiply on the board.

**Minute 0:25 — The Realization**
The resource counter hits amber (40). Mika sees it. "Wait, why is it going so fast?" She looks at the factory — three fabrication animations overlapping, the chime now a rapid staccato. She counts the scouts on the board: eleven. She didn't put eleven scouts in her queue. The realization arrives: "Oh no. Oh no no no."

**Minute 0:28 — The Storm**
Resources hit red (15). Ten more scouts crowd the board. The production queue shows her planned striker (cost 8) grayed out — there isn't enough material. Mika's hands are off the iPad — the sealed watch doesn't let her intervene. She watches the counter hit zero with the hollow THUNK. Silence from the factory. Twenty-three scouts milling around the jungle. Zero strikers.

**Minute 0:35 — The Massacre**
Enemy strikers emerge. They cut through the scouts — one-shot, one-kill, red flash, scout gone. Each death makes Mika wince. These scouts cost her everything and they can't fight back.

**Minute 0:50 — Mission Failed**
The defeat screen shows: 23 scouts produced, 0 strikers, 0 command agents. Time survived: 30 ticks. Mika stares at the numbers. She's not angry — she's *fascinated*. "It made too many. It didn't know when to stop."

**Minute 1:00 — The Inspector**
Mika opens the Inspector. The production log unfolds. She scrubs the timeline back to Tick 4 — the first conditional spawn — and watches tick-by-tick as the resource counter drops. She clicks the factory and sees the production log. The summary line hits: `NO CHILD LIMIT SET — rule spawning was unbounded.`

She whispers: "Oh. That's what child limit means."

**Minute 2:00 — The Fix**
Mika opens the Predecessor's config. She finds the CHILD LIMIT field and sets it to 3 for each rule. She also adds a resource threshold: "IF materials > 30." She re-executes. This time, 3 conditional scouts spawn and stop. The rest of the resources go to her planned striker and command agent. She wins on the second try.

**What Mika Learned:** Termination conditions. Resource budgeting. The difference between "responding to every event" and "responding within limits." She will never configure a spawn rule without a child limit again.

**UI Annotations:**
- Sealed watch resource counter: top-right corner, 24px font, white→amber (50%)→red (20%)→black (0%) with 0.5s color transitions
- Factory fabrication animation: orange spark burst from factory tile, 0.3s duration, overlapping when multiple spawns fire same tick
- Fabrication sound: ascending three-note chime (C-E-G), compressed to 0.15s when spawning rapidly, creating pulsing staccato at storm speed
- Resource depletion THUNK: 120Hz bass hit, 0.8s decay, screen-edge vignette darkens 5% for 0.5s
- Production log in Inspector: monospace font, left-aligned trigger reason, right-aligned resource balance, amber highlight on rule-triggered rows, red highlight on BLOCKED row
- Resource curve chart: 200×80px sparkline, green fill for planned production, red fill for rule-triggered, dashed "minimum army cost" line

---

### Journey: Alex, 31, Software Engineer, Factorio Veteran, Completed Missions 1-5 in One Sitting

**Context:** Alex blew through Missions 1-5 in 90 minutes. He understands blueprints, production queues, and channels intuitively — they map to his day job (CI/CD pipelines, Docker containers, Kubernetes deployments). He reads the Predecessor's config in the boot log and immediately spots the problem.

**Minute 0:00 — The Boot Log**
Alex reads the Predecessor's three rules and the `[not set]` child limit. He laughs. "That's a fork bomb." In his head, the mapping is instant: this is `while(true) { fork(); }` without a PID limit. He's seen junior developers write exactly this kind of runaway spawner in Kubernetes CronJobs.

He ignores the Predecessor's config entirely and starts fresh. He builds his own production setup:
- 2 scouts with `CHILD LIMIT: 1` each (defensive reserves)
- 1 relay
- 2 strikers
- 1 command agent with reassign rules (the new M6 capability)
- Conditional spawn: "IF friendly_count < 4 AND materials > 30 → SPAWN Scout [limit: 2]"

The double guard (count threshold AND resource floor) is second nature to him — it's the same pattern as Kubernetes HPA with min/max replicas and resource quotas.

**Minute 1:30 — Execution**
Alex hits Execute. His army deploys in order. The jungle is dangerous but his scouts have good coverage. When a scout dies at Tick 8, the conditional spawn fires — one replacement scout, 3 materials spent. The resource counter barely moves. His command agent reassigns the surviving scouts to cover the gap. The system self-heals without overproduction.

**Minute 3:00 — Victory**
Alex wins on the first try. His Inspector shows: 8 units deployed, 2 conditional spawns, 68 materials remaining at mission end. He's left with a 68-material surplus — evidence that his spawn governance was conservative.

**Minute 3:30 — The Achievement**
The boot log prints: `SPAWN GOVERNOR DETECTED. PREDECESSOR NOTE: "I wish I'd thought of that."`

Alex grins. He screenshots this for his engineering Slack channel. The message reads: "This game just validated 6 years of Kubernetes experience."

**Minute 4:00 — Curiosity**
Alex wonders: "What if I'd run the Predecessor's config?" He replays the mission with the original setup, no modifications. He watches the storm happen — 23 scouts, factory drained in 6 ticks, massacre. In the debrief, he screenshots the production log and sends it to the same Slack channel: "This is what happens when your CronJob doesn't have a limit."

**What Alex Learned:** Not the lesson — he already knew termination conditions. Instead, he learned that the game *respects* his knowledge. The "Predecessor Note" achievement tells him: this game is for people like you. The Slack screenshots tell his friends: this game speaks your language.

**UI Annotations:**
- "SPAWN GOVERNOR DETECTED" boot log line: gold text with a ✓ icon, appears only if the player's config includes child limits on all spawn rules before first execute
- Achievement notification: small bottom-right toast, "PREDECESSOR'S REGRET" achievement name, tapping opens Blueprint Codex entry about spawn governance
- Replay option in Inspector: "REPLAY WITH ORIGINAL CONFIG" button that loads the Predecessor's unmodified setup — lets veterans experience the storm deliberately after winning

---

### Journey: Rosa, 62, Retired Nurse, Plays Puzzle Games on iPad, Completed Missions 1-5 Over Two Weeks

**Context:** Rosa plays slowly, one mission per evening. She understood Missions 1-4 but found Mission 5 (factory introduction) confusing — she needed three attempts. The Phase 1 guided assembly (per 8.04d Split model) was essential for her. She reads the boot log carefully, word by word.

**Minute 0:00 — The Boot Log**
Rosa reads "CATASTROPHIC RESOURCE DEPLETION" and pauses. She reads the Predecessor's three rules. She doesn't immediately see the problem — the rules look reasonable. "If an enemy appears, make a scout to see it. If a scout dies, replace it. If outnumbered, fight back." This is how Rosa thinks about staffing at the hospital: if a nurse leaves, hire a replacement. If the ward is overwhelmed, call in more staff.

She sees `CHILD LIMIT: [not set]` but doesn't know what it controls. She decides to modify Rule 3 slightly — changing the striker template to her own design — but leaves Rules 1 and 2 as-is.

**Minute 1:00 — Execution**
Rosa watches the first few ticks. Scouts deploy. The jungle is pretty — green bioluminescent tiles, firefly particles in the canopy. She likes the ambient sound.

**Minute 1:20 — The First Signs**
The factory starts spawning. Rosa sees a new scout appear and thinks "Oh, it detected an enemy. Good." Two more appear. "Three scouts? That seems like a lot." The resource counter starts dropping. Rosa doesn't track numbers naturally — she watches the *color*. It's still white. She relaxes.

**Minute 1:30 — Amber**
The counter hits amber. Rosa notices: "Why is that yellow?" Three more scouts appear in rapid succession. The fabrication chimes overlap. Rosa's medical training kicks in — accelerating vital signs mean trouble. Her fingers twitch toward the screen but there's no pause button.

**Minute 1:40 — Red**
The counter hits red. Rosa counts the scouts: fifteen. "That can't be right." She looks at the production queue — her planned striker is grayed out. "Where's my striker? Why didn't it make my striker?"

**Minute 1:50 — The Storm Peaks**
Twenty scouts on the board. Resources at zero. THUNK. The factory goes dark. Rosa watches the remaining seconds in increasing distress. When the enemy strikers arrive and start killing her defenseless scouts, she puts the iPad down and says to herself: "It hired too many nurses and couldn't afford the doctor."

**Minute 2:30 — The Inspector**
Rosa opens the Inspector and finds the production log. She scrolls through the entries, reading each one. She sees the pattern: every `[RULE 1]` entry is a conditional spawn. She counts them: eighteen triggered by Rule 1 alone. The summary says `NO CHILD LIMIT SET.`

Rosa navigates to the CHILD LIMIT setting. She reads the tooltip: "Maximum number of units this rule can spawn per mission." She sets it to 2 for each rule. "Two replacement nurses. No more."

**Minute 4:00 — Second Attempt**
Rosa re-executes. Two scouts spawn conditionally. The rest of her army builds as planned. She has a striker, a relay, and she even experiments with the new Command agent. She wins at Tick 45.

**Minute 5:00 — Reflection**
Rosa texts her grandson (who recommended the game): "The robots kept making more robots until they ran out of money! Just like when the hospital overstaffed during flu season. I had to set a hiring cap."

**What Rosa Learned:** The hospital staffing metaphor crystallized the concept. She didn't learn "termination conditions" — she learned "hiring caps." The game's abstraction level met her where she was. The child limit is now permanently associated with a real experience she had managing ward staffing.

**UI Annotations:**
- Resource counter color transitions timed so amber appears 10 seconds before depletion, red appears 5 seconds before — enough time for Rosa's slower processing to register the warning
- Inspector production log: row highlighting on hover (light orange fill) so Rosa can track one row at a time
- CHILD LIMIT tooltip: plain language, no technical jargon — "Maximum number of units this rule can spawn per mission" not "Spawn recursion depth limit"
- Accessibility: production log text size respects iPad accessibility settings (Dynamic Type), tested at 150% zoom

---

### Journey: Kwame, 28, Twitch Streamer, Diamond-Tier Competitive Player, Completed Campaign Twice

**Context:** Kwame is replaying the campaign to demonstrate Doctrines (per 5.09a) for his stream. He's playing The Swarm Doctrine (12 units, 4-slot buffers, no Command). He knows about spawn storms but hasn't triggered one since his first playthrough. His 340 viewers are watching live.

**Minute 0:00 — The Setup**
"Chat, we're doing Swarm Doctrine Mission 6. No Command agent. Twelve units, tiny buffers. The Predecessor's config is still here — let's see..." He reads the boot log. "Oh this is THAT mission. Chat, should I run the Predecessor's config?"

Chat explodes: "DO IT" / "FORK BOMB" / "RIP materials" / "he doesn't know PepeLaugh"

Kwame: "Alright, running it stock. No modifications. Let's see the storm."

**Minute 0:15 — The Storm for Content**
Kwame narrates the storm in real-time: "First scout — okay, normal. Second — fine, fine. Third, fourth — chat, look at the resource counter. Look at it. It's AMBER already. Five, six, seven — this is a FORK BOMB, chat. This is Kubernetes without resource quotas. Eight, nine — RED, we're RED — ten, eleven, twelve — it's over. Materials: zero. We have twenty-two scouts and zero combat units."

His viewer count spikes to 410 as chat links the clip.

**Minute 0:40 — The Kill Phase as Content**
"And here come the strikers. Watch this. One-shot. One-shot. One-shot. Chat, every one of those cost us three materials. Three times twenty-two is sixty-six materials spent on units that can't fight. We had enough for FIVE strikers. We built ZERO."

**Minute 1:00 — The Inspector Content**
"Let me show you the production log. Look — Rule 1 fired eighteen times. EIGHTEEN conditional spawns from one rule. And the resource curve — see this? Tick 4 to Tick 10, six seconds, eighty materials to zero. That's... that's thirteen materials per second. This factory was spending thirteen materials per second on scouts."

He circles the `NO CHILD LIMIT SET` annotation with his cursor. "There it is, chat. The missing guardrail. The absent `maxReplicas` on the HPA. The CronJob without a completion limit. This is why you set resource quotas."

**Minute 2:00 — The Fix for Content**
"Okay, let's fix it. Under Swarm Doctrine, I can't use a Command agent. So I need the conditional spawning — I just need it bounded. Child limit: 2 per rule. Resource floor: materials > 20. Let's go."

He wins the second attempt with a swarm of twelve units, exactly as the Doctrine intends. The production log shows: 2 conditional scouts, 10 planned units, 14 materials remaining. Clean.

**Minute 3:00 — The Clip**
Kwame clips the spawn storm sequence (0:15-0:40) with the title: "When You Forget maxReplicas." It gets 12,000 views in 24 hours and becomes a meme format in the game's Discord: players posting their own spawn storm screenshots with production logs.

**What Kwame Generated:** Content. The spawn storm is inherently clippable — it has a clear setup (the config), escalation (the cascade), climax (resource depletion), and consequence (the massacre). The production log provides a clean visual for the "what went wrong" beat. The engineering jargon ("fork bomb," "resource quotas," "maxReplicas") gives the clip a dual audience: gamers who understand the spectacle and engineers who understand the metaphor.

**UI Annotations:**
- Clip-friendly timing: the storm sequence (first spawn to resource depletion) lasts 6-8 seconds at 1x speed — fits TikTok/Reels vertical format with 2 seconds of setup and 2 seconds of aftermath for a 12-second total clip
- Resource counter: large enough to be visible in 720p stream compression (24px minimum, high contrast white-on-dark)
- Production log: timestamps left-aligned for easy visual scanning in stream layout

---

## Strengths and Weaknesses

### Strengths

1. **Universal CS lesson in 60 seconds.** The spawn storm teaches termination conditions, resource management, and feedback loop awareness faster than any textbook. The lesson transfers directly to real engineering: runaway processes, fork bombs, unthrottled auto-scaling.

2. **Emotionally memorable.** The sealed watch forces the player to *experience* the failure, not just see a number. The sound design (accelerating chimes → silence) and visual design (crowding scouts → massacre) create a visceral memory that a text explanation never could.

3. **Three valid fixes at different skill levels.** (a) Child limit — mechanical, direct, accessible. (b) Resource threshold guard — conditional, defensive, intermediate. (c) Command agent replacement — architectural, sophisticated, advanced. Every player finds their fix.

4. **Naturally clippable.** The storm has a clear dramatic arc: calm → acceleration → crisis → silence → consequence. This is 12-15 seconds of content that looks spectacular and teaches something real. The engineering metaphor gives it a second audience.

5. **The Predecessor narrative integration.** The storm is caused by an inherited configuration from a previous AI. This frames the lesson as "learning from someone else's mistakes" rather than "you screwed up." The player who fixes it before running feels like a code reviewer. The player who runs it and fails feels like a debugging detective.

### Weaknesses

1. **Experienced players skip the lesson.** Engineers who recognize the fork bomb pattern (like Alex in Journey B) will add child limits immediately and never see the storm. The "SPAWN GOVERNOR DETECTED" achievement mitigates this but the emotional experience is missed.

2. **The Predecessor config is hand-wavy.** Why would a previous AI operator leave spawn rules without child limits? This requires narrative justification — perhaps the Predecessor was experimenting, or the child limit feature was unlocked after the Predecessor's attempt.

3. **Cognitive load at Mission 6 is already high.** Mission 6 introduces the Command agent (locked). Adding the spawn storm lesson to the same mission creates a dual wall. Mitigation: the spawn storm happens on the first attempt (pre-Command), and the Command agent is introduced as the *fix* on the second attempt — turning two lessons into a cause-and-solution pair.

4. **Second-attempt success might feel too easy.** Adding a child limit of 3 trivially fixes the storm. The mission needs additional difficulty beyond spawn governance to remain engaging after the fix. The jungle's reduced perception and three-corner enemy spawners provide this.

5. **Spawn storms in later missions lose impact.** After learning the lesson, spawn storms become a mistake rather than a teaching moment. The game should acknowledge this: a late-game spawn storm in the Inspector should trigger an annotation: `PATTERN RECOGNIZED: spawn storm detected — review production rule child limits.`

---

## Interaction Effects

### × Mission 5 Factory Introduction (5.04a, 8.04d)
The spawn storm must happen AFTER the player has successfully used the factory in Mission 5. If M5 is the player's first factory experience, the storm at M6 builds on confirmed understanding — "you know how the factory works; now see how it breaks." If M5 uses the Split model (8.04d), the player has already experienced guided production in Phase 1 and freeform production in Phase 2. The storm is the third beat: ungoverned production.

### × Command Agent Introduction (3.17)
The Command agent's `reassign` skill is the elegant fix for spawn storms. Instead of spawning new units, reassign existing ones. This makes the spawn storm the *reason* for the Command agent — "you need this because spawning without management is dangerous." The temporal sequence matters: storm → failure → debrief → "use Command agent" suggestion → retry with Command → success. The Command agent is positioned as the answer to a question the player just asked.

### × Self-Replicating Configs (3.19a)
The spawn storm is a degenerate case of self-replication. The distinction: self-replication (3.19a) is a feature with proper governance; spawn storms are self-replication without governance. Players who master spawn governance in M6 are prepared for the more sophisticated replication mechanics in M7-M10.

### × Reinforcement Thermostat (3.19a-i)
The spawn storm is a bang-bang control system without feedback. The thermostat concept (production as temperature regulation) provides the conceptual framework for the fix: production rules should include both "trigger" and "suppress" conditions. The spawn storm is Level 0 of the control theory ladder — the failure that motivates learning Level 1 (bang-bang with anti-windup).

### × Near-Miss Rendering (2.00b-i)
During the storm, spawned scouts might exhibit near-miss behavior — detecting enemies, considering engagement, but having no engage skill. The near-miss twitch ("I see a threat but I can't fight") across twenty scouts simultaneously would be a haunting visual: a field of helpless observers, each one knowing what it sees and unable to act.

### × Context Overload (Locked)
At 20+ scouts with 6-slot buffers, the jungle's limited perception means each scout's buffer fills rapidly with nearby observations. Some scouts will hit context overload — stunned for 1 tick. The spawn storm and context overload compound: too many scouts with too-full buffers, all stunned, all vulnerable. The dual failure mode (resource depletion + information overload) teaches two lessons simultaneously.

### × Doctrines (5.09a)
The Swarm Doctrine forces 12 units with no Command agent. This makes spawn governance MORE important — without a Command agent to reassign, spawn storms are the only adaptive mechanism. The Doctrine transforms the spawn storm from "mistake to avoid" to "tool to master" — bounded spawn storms are the Swarm's adaptation strategy.

### × Into the Breach Clarity (Locked)
The 8×8 grid at 20+ units becomes crowded. Unit icons overlap. The visual clarity that Into the Breach achieves with 3-4 units per grid breaks at 20+. The storm IS the visual degradation — the board becoming illegible mirrors the system becoming ungovernable. This is design, not bug: the visual noise IS the lesson.

---

## Comparable Games

### Fork Bombs in Real Systems
The spawn storm is a literal fork bomb: `:(){ :|:& };:` in bash. Every Unix administrator learns this the hard way. Robot Uprising teaches the same lesson — process governance, resource limits, termination conditions — without requiring a terminal.

### Factorio's Power Grid Collapse
In Factorio, players build power infrastructure that powers their factory. A common failure: the factory's power demand exceeds generation. Inserters slow down. Furnaces stop. The factory grinds to a halt. But the worst variant is a *death spiral*: laser turrets activate (drawing power) → factory slows → fewer turrets fire → more biters break through → more turrets activate → more power drain → total collapse. The spawn storm is structurally identical: a positive feedback loop consuming a finite resource.

### Screeps' CPU Bucket
In Screeps, each player has a CPU budget per tick. Scripts that exceed the budget get killed mid-execution. New players routinely write pathfinding code that burns their entire CPU budget, leaving no cycles for actual unit actions. The lesson: resource budgets are finite and processes must be bounded. Screeps teaches this through frustrating crashes with minimal feedback. Robot Uprising teaches it through dramatic visual spectacle with detailed debrief.

### Opus Magnum's First Histogram
In Opus Magnum, you solve a puzzle and feel smart. Then the histogram shows you're in the bottom 20% for cycles, symbols, or area. The "first ugly solution" shock: your solution works but it's terrible. The spawn storm is the production equivalent: your spawn rules work but they're terrible. Both games convert "I'm done" into "I can do better" through data visualization.

### Dark Souls' Asylum Demon
A boss you're meant to lose to the first time. The death teaches: this game will kill you and that's how it works. The spawn storm teaches: your systems will consume themselves and that's the engineering problem. Both are designed failures that reframe the player's relationship with the game.

### Dwarf Fortress Tantrum Spirals
A dwarf gets unhappy → throws a tantrum → destroys food → other dwarves get unhappy about lost food → more tantrums → fortress collapse. The positive feedback loop without dampening is structurally identical to the spawn storm. Dwarf Fortress doesn't teach how to prevent it — players learn through community knowledge. Robot Uprising's Inspector teaches the fix directly.

---

## Sensory Description

### The Calm Before (Ticks 1-3)
The jungle board is dark green with bioluminescent moss edges on the tiles. Firefly particles drift across the canopy layer (above the grid, parallax depth). The factory at D4 hums with a low 60Hz electrical drone — a warm, reassuring sound. Scouts deploy with a brief ascending chime (C4-E4-G4, 0.3s total, plucked string timbre). The tick clock pulses with a soft metronome click. The ambience says: this is under control.

### The Acceleration (Ticks 4-7)
The first conditional spawn adds a second fabrication chime within one tick. By Tick 6, three chimes overlap — the individual notes blur into a tremolo. The factory's hum pitches up from 60Hz to 80Hz (audible tension without being alarm-like). The resource counter's white text shifts to pale amber with a barely perceptible glow. Scout icons begin clustering around the factory — a crowd forming at the gate.

### The Storm (Ticks 8-10)
The fabrication chimes are now a continuous flutter — six to eight overlapping within a single tick, individual notes indistinguishable, the sound a shimmering metallic wall. The factory tile strobes: orange spark → scout materialization → orange spark → scout materialization, the animations overlapping so the tile appears to be vibrating. The resource counter is angry red, the number tumbling downward in visible 3-unit decrements. The jungle ambient sound fades as the fabrication noise overtakes it — the factory is drowning out the environment.

At Tick 10, resources hit zero. The THUNK: a 120Hz bass hit with 0.8s exponential decay, like a heavy door slamming. The screen edge darkens 5% (vignette) for 0.5 seconds. The factory goes completely dark — no hum, no chime, no spark. The silence is sudden and total. Even the firefly particles pause for one tick before resuming.

### The Massacre (Ticks 11-25)
The board is crowded with scouts — twenty-plus icons filling the 8×8 grid. Their context bars are tiny and frantic. Enemy strikers emerge from the jungle edges with a low predatory bass note (A1, filtered sawtooth, 0.5s). Each kill is a sharp red flash on the tile and a crystalline shatter sound (glass breaking, high-passed, 0.2s). The scout icon crumbles — three pixel-fragments scatter and dissolve. One kill per tick. One shatter per second. The metronome of death.

### The Aftermath
Mission failure screen: dark, the factory a cold grey silhouette. The text renders in pale red: "MISSION FAILED — CATASTROPHIC RESOURCE DEPLETION." Below: "Units Produced: 23 | Units Surviving: 0 | Materials Remaining: 0." A faint echo of the fabrication flutter plays — a ghost of the storm — then fades to silence.

---

## The TikTok Clip

**Title:** "My Factory Ate Itself"

**Second 0-2:** Plan screen. The Predecessor's config visible: three simple rules. Text overlay: "Looked fine to me."

**Second 3-5:** Sealed watch begins. First scout deploys into jungle. Calm.

**Second 6-8:** Spawn cascade begins. Factory strobing. Resource counter dropping. Three scouts become eight. Sound: accelerating chimes.

**Second 9-11:** Twenty scouts. Factory dark. THUNK. Silence. Text overlay: "oh."

**Second 12-14:** Enemy strikers emerge. One-shot kills in sequence. Shatter. Shatter. Shatter. Text overlay: "MY ARMY CAN'T FIGHT."

**Second 15:** Mission failed screen. Production log visible: "23 scouts, 0 strikers, 0 command agents." Text overlay: "I made 23 eyes and zero fists."

**Alt clip for engineers:** Same footage but text overlays read: "while(true) fork()" → "no maxReplicas" → "k8s without resource quotas" → "my CronJob in production"
